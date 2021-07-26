<template>
  <div>
    <b-row>
      <b-col>
        <slot name="help"></slot>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <aladin-plot
          :plot-id="aladinPlotId"
          :plot-height="plotHeight"
          :plot-width="plotWidth"
          class="aladin-responsive"
          :aladin-script-location="aladinScriptLocation"
          :aladin-style-location="aladinStyleLocation"
          @aladin-loaded="onAladinLoaded"
        />
        <div class="text-center font-italic m-auto w-100">
          Mosaic pattern
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script>
/* global A */
import _ from 'lodash';

import AladinPlot from '@/components/Plots/AladinPlot.vue';
import { addPolyline, setColorMap, removeReticleEventHandlers } from '@/components/Plots/aladinPlotUtil.js';
import { cosineDeclinationTerm, offsetCoordinate, rotateCoordinate } from '@/util';

export default {
  name: 'MosaicPlot',
  components: {
    AladinPlot
  },
  props: {
    // List of RA and Dec pointings in the form of:
    // [
    //   { ra: ra1, dec: dec1 },
    //   { ra: ra2, dec: dec2 },
    //   ...
    // ]
    pointingCoordinates: {
      type: Array,
      required: true
    },
    instrumentFieldOfViewDegrees: {
      type: Number,
      required: true
    },
    instrumentArcSecPerPixel: {
      type: Number,
      required: true
    },
    instrumentPixelsX: {
      type: Number,
      required: true
    },
    instrumentPixelsY: {
      type: Number,
      required: true
    },
    // The oriention of the CCD in degrees east of north
    instrumentOrientation: {
      type: Number,
      required: true
    },
    // The configuration that was used to generate the mosaic pattern
    configuration: {
      type: Object,
      required: true
    },
    // Function that takes the configuration that was used to generate the mosaic pattern, and returns
    // the added orientation east or north defined by things like any rotator mode that is set.
    extraRotation: {
      type: Function,
      // eslint-disable-next-line no-unused-vars
      default: configuration => {
        return 0;
      }
    },
    aladinScriptLocation: {
      type: String,
      default: 'https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.js'
    },
    aladinStyleLocation: {
      type: String,
      default: 'https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css'
    }
  },
  data: function() {
    return {
      // These values for height and width are chosen to work well with everything
      // that is drawn on the plots.
      plotHeight: '500px',
      plotWidth: '500px',
      aladin: undefined,
      aladinPlotId: 'mosaic-plot',
      legendItemsOffsetBottom: 30,
      legendItemsOffsetLeft: 30,
      legendSourceSize: 10,
      targetMarkerSourceSize: 20,
      colors: {
        info: '#17ff60'
      }
    };
  },
  computed: {
    mosaicMidPoint: function() {
      // Find the center of the mosaic sequence
      let decCoords = this.pointingCoordinates.map(coord => coord.dec);
      let raCoords = this.pointingCoordinates.map(coord => coord.ra);
      let ra = (Math.max(...raCoords) + Math.min(...raCoords)) / 2;
      let dec = (Math.max(...decCoords) + Math.min(...decCoords)) / 2;
      return [ra, dec];
    },
    fieldOfView: function() {
      let decCoords = this.pointingCoordinates.map(coord => coord.dec);
      let raCoords = this.pointingCoordinates.map(coord => coord.ra);
      let cosDec = cosineDeclinationTerm(_.mean(decCoords));
      let raRange = Math.abs(Math.max(...raCoords) - Math.min(...raCoords)) * cosDec;
      let decRange = Math.abs(Math.max(...decCoords) - Math.min(...decCoords));
      let mosaicRange = Math.max(raRange, decRange) + this.instrumentFieldOfViewDegrees;
      // Add a little extra to the FOV around the mosaic range to be able to see the full CCD footprints
      // of all the pointings in the mosaic
      return mosaicRange * 1.2;
    },
    coordinates: function() {
      return _.map(this.pointingCoordinates, i => {
        return [i['ra'], i['dec']];
      });
    },
    CCDOrientation: function() {
      return this.instrumentOrientation + this.extraRotation(this.configuration);
    },
    CCDFootprints: function() {
      // Return a list of lists, where each internal list is a collection of 5 2-element lists, where the first
      // element is the RA and the second is the Dec, and the 2 coordinates come together to draw a closing polygon.
      // Rotation is degrees east of north. Pixels x is along the north-south line (RA), and pixels y is perpendicular
      // to that, along the east-west line (declination).
      let footprints = [];
      let HalfCCDWidthArcSec = (this.instrumentArcSecPerPixel * this.instrumentPixelsX) / 2;
      let HalfCCDHeightArcSec = (this.instrumentArcSecPerPixel * this.instrumentPixelsY) / 2;
      let footprint;
      for (let coord of this.pointingCoordinates) {
        footprint = [];
        footprint.push(rotateCoordinate(offsetCoordinate(coord, { ra: HalfCCDHeightArcSec, dec: HalfCCDWidthArcSec }), coord, this.CCDOrientation));
        footprint.push(rotateCoordinate(offsetCoordinate(coord, { ra: HalfCCDHeightArcSec, dec: -HalfCCDWidthArcSec }), coord, this.CCDOrientation));
        footprint.push(rotateCoordinate(offsetCoordinate(coord, { ra: -HalfCCDHeightArcSec, dec: -HalfCCDWidthArcSec }), coord, this.CCDOrientation));
        footprint.push(rotateCoordinate(offsetCoordinate(coord, { ra: -HalfCCDHeightArcSec, dec: HalfCCDWidthArcSec }), coord, this.CCDOrientation));
        // Repeat the first offset to close the loop
        footprint.push(rotateCoordinate(offsetCoordinate(coord, { ra: HalfCCDHeightArcSec, dec: HalfCCDWidthArcSec }), coord, this.CCDOrientation));
        footprints.push(
          _.map(footprint, i => {
            return [i['ra'], i['dec']];
          })
        );
      }
      return footprints;
    }
  },
  methods: {
    onAladinLoaded: function() {
      this.aladin = A.aladin(`#${this.aladinPlotId}`, {
        survey: 'P/DSS2/color',
        target: `${this.mosaicMidPoint[0]} ${this.mosaicMidPoint[1]}`,
        showReticle: false,
        showGotoControl: false,
        showLayersControl: false,
        showFullscreenControl: false,
        showZoomControl: false,
        pixelateCanvas: false
      });
      this.aladin.setFov(this.fieldOfView);
      this.aladin.setFovRange(this.fieldOfView, this.fieldOfView);
      this.aladin.on('positionChanged', () => {
        this.addAnnotations();
      });
      setColorMap(this.aladin);
      removeReticleEventHandlers();
    },
    addAnnotations: function() {
      this.aladin.removeLayers();
      for (let footprint of this.CCDFootprints) {
        addPolyline(this.aladin, footprint, {
          color: this.colors.info
        });
      }
    }
  }
};
</script>
<style>
.aladin-responsive {
  overflow-x: scroll;
}
</style>
