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
    // List of configurations which make up this mosaic.
    configurations: {
      type: Array,
      required: true
    },
    // Instruments information in the form of the response of the /api/instruments/ endpoint
    instrumentsInfo: {
      type: Object,
      required: true
    },
    // Function that takes the configuration that was used to generate the mosaic pattern, and returns
    // the added orientation east of north defined by e.g. rotator_mode.
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
    pointingCoordinates: function() {
      let pointings = [];
      for (let configuration of this.configurations) {
        pointings.push({
          ra: configuration.target.ra,
          dec: configuration.target.dec
        });
      }
      return pointings;
    },
    mosaicMidPoint: function() {
      // Find the center of the mosaic sequence
      let decCoords = this.pointingCoordinates.map(coord => coord.dec);
      let raCoords = this.pointingCoordinates.map(coord => coord.ra);
      let ra = (Math.max(...raCoords) + Math.min(...raCoords)) / 2;
      let dec = (Math.max(...decCoords) + Math.min(...decCoords)) / 2;
      return [ra, dec];
    },
    maxInstrumentFieldOfViewDegrees: function() {
      // Get the largest field of view of all the instruments used in the mosaic
      let instrumentTypes = [];
      let maxFOV = 0;
      let instrumentInfo;
      for (let configuration of this.configurations) {
        if (!instrumentTypes.includes(configuration.instrument_type)) {
          instrumentTypes.push(configuration.instrument_type);
          instrumentInfo = this.getInstrumentInfo(configuration.instrument_type);
          if (instrumentInfo.fieldOfViewDegrees > maxFOV) {
            maxFOV = instrumentInfo.fieldOfViewDegrees;
          }
        }
      }
      return maxFOV;
    },
    fieldOfView: function() {
      let decCoords = this.pointingCoordinates.map(coord => coord.dec);
      let raCoords = this.pointingCoordinates.map(coord => coord.ra);
      let cosDec = cosineDeclinationTerm(_.mean(decCoords));
      let raRange = Math.abs(Math.max(...raCoords) - Math.min(...raCoords)) * cosDec;
      let decRange = Math.abs(Math.max(...decCoords) - Math.min(...decCoords));
      let mosaicRange = Math.max(raRange, decRange) + this.maxInstrumentFieldOfViewDegrees;
      // Add a little extra to the FOV around the mosaic range to be able to see the full CCD footprints
      // of all the pointings in the mosaic
      return mosaicRange * 1.2;
    },
    CCDFootprints: function() {
      // Get the coordinates of the corners of the CCD for each target. Only draw one footprint for each configuration, using
      // the first instrument_config in each configuration.
      //
      // Return an array of arrays, where each internal array is a collection of 5 2-element arrays, where the first
      // element is the RA and the second is the Dec, and the 5 coordinates come together to draw a polygon.
      // Rotation is degrees east of north. Pixels x is along the north-south line (RA), and pixels y is perpendicular
      // to that, along the east-west line (declination).
      let footprints = [];
      let halfCCDWidthArcSec;
      let halfCCDHeightArcSec;
      let instrumentInfo;
      let footprint;
      let coord;
      let rotation;
      for (let configuration of this.configurations) {
        footprint = [];
        coord = { ra: configuration.target.ra, dec: configuration.target.dec };
        instrumentInfo = this.getInstrumentInfo(configuration.instrument_type);
        rotation = instrumentInfo.orientation + this.extraRotation(configuration);
        halfCCDWidthArcSec = (instrumentInfo.arcSecPerPixel * instrumentInfo.pixelsX) / 2;
        halfCCDHeightArcSec = (instrumentInfo.arcSecPerPixel * instrumentInfo.pixelsY) / 2;
        footprint.push(rotateCoordinate(offsetCoordinate(coord, { ra: halfCCDHeightArcSec, dec: halfCCDWidthArcSec }), coord, rotation));
        footprint.push(rotateCoordinate(offsetCoordinate(coord, { ra: halfCCDHeightArcSec, dec: -halfCCDWidthArcSec }), coord, rotation));
        footprint.push(rotateCoordinate(offsetCoordinate(coord, { ra: -halfCCDHeightArcSec, dec: -halfCCDWidthArcSec }), coord, rotation));
        footprint.push(rotateCoordinate(offsetCoordinate(coord, { ra: -halfCCDHeightArcSec, dec: halfCCDWidthArcSec }), coord, rotation));
        // Repeat the first offset to close the loop
        footprint.push(rotateCoordinate(offsetCoordinate(coord, { ra: halfCCDHeightArcSec, dec: halfCCDWidthArcSec }), coord, rotation));
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
    getInstrumentInfo: function(instrumentType) {
      let cameraTypeInfo = _.get(this.instrumentsInfo, [instrumentType, 'camera_type']);
      return {
        fieldOfViewDegrees: _.get(cameraTypeInfo, 'science_field_of_view', 0) / 60,
        arcSecPerPixel: _.get(cameraTypeInfo, 'pixel_scale', 0),
        // TODO: Update the defaults below to sensible values
        pixelsX: _.get(cameraTypeInfo, 'pixels_x', 2000),
        pixelsY: _.get(cameraTypeInfo, 'pixels_y', 1000),
        orientation: _.get(cameraTypeInfo, 'orientation', 10)
      };
    },
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
