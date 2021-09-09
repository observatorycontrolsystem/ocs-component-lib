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
          @aladin-loaded="onAladinLoaded"
        />
        <div class="text-center font-italic m-auto w-100">
          Mosaic pattern. The field of view (FOV) of {{ instrumentType }} is {{ instrumentTypeFOVArcMin.x | round(1) }} arcminutes by
          {{ instrumentTypeFOVArcMin.y | round(1) }} arcminutes, and it is rotated {{ instrumentRotation | round(1) }} degrees east of north.
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script>
/* global A */
import _ from 'lodash';
import { inject } from '@vue/composition-api';

import AladinPlot from '@/components/Plots/AladinPlot.vue';
import {
  addPolyline,
  addFillBackground,
  addLegend,
  getPointingPathAnnotations,
  setColorMap,
  removeReticleEventHandlers
} from '@/components/Plots/aladinPlotUtil.js';
import { cosineDeclinationTerm, offsetCoordinate, rotateCoordinate, round } from '@/util';

export default {
  name: 'MosaicPlot',
  components: {
    AladinPlot
  },
  filters: {
    round: function(value, decimalPlaces) {
      return round(value, decimalPlaces);
    }
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
    }
  },
  setup: function() {
    const extraInstrumentRotation = inject('mosaicExtraInstrumentRotation');
    return {
      extraInstrumentRotation
    };
  },
  data: function() {
    let instrumentType = this.configurations[0].instrument_type;
    let instrumentInfo = this.getInstrumentInfo(instrumentType);
    let instrumentRotation = instrumentInfo.orientation;
    if (this.configurations.length > 0) {
      instrumentRotation += this.extraInstrumentRotation(this.configurations[0]);
    }
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
        blue: '#30fff8',
        red: '#fc2128',
        green: '#17ff60',
        transparentBackground: 'rgba(0, 0, 0, 0.4)'
      },
      instrumentType: instrumentType,
      instrumentRotation: instrumentRotation,
      instrumentTypeFOVArcMin: {
        x: (instrumentInfo.pixelsX * instrumentInfo.arcSecPerPixel) / 60,
        y: (instrumentInfo.pixelsY * instrumentInfo.arcSecPerPixel) / 60
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
    mosaicRange: function() {
      let decCoords = this.pointingCoordinates.map(coord => coord.dec);
      let raCoords = this.pointingCoordinates.map(coord => coord.ra);
      let cosDec = cosineDeclinationTerm(_.mean(decCoords));
      let raRange = Math.abs(Math.max(...raCoords) - Math.min(...raCoords)) * cosDec;
      let decRange = Math.abs(Math.max(...decCoords) - Math.min(...decCoords));
      return Math.max(raRange, decRange);
    },
    fieldOfView: function() {
      // Add a little extra to the FOV around the mosaic range to be able to see the full CCD footprints
      // of all the pointings in the mosaic
      return (this.mosaicRange + this.maxInstrumentFieldOfViewDegrees) * 1.35;
    },
    CCDFootprints: function() {
      // Get the coordinates of the corners of the CCD footprint for each target. Only draw one footprint for each configuration, using
      // the first instrument_config in each configuration. Also get coordinates for annotations drawing the path through the footprints.
      //
      // Return an object in the form of { footprints: [...], annotations: [...] } where each value is an array of arrays, and
      // each internal array is a collection of 5 2-element arrays, where the first element is the RA and the second is the Declination, and
      // the 5 coordinates come together to draw a polygon. Rotation is degrees east of north. Pixels y is along the north-south
      // line (declination), and pixels x is perpendicular to that, along the east-west line (RA).
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
        rotation = instrumentInfo.orientation + this.extraInstrumentRotation(configuration);
        halfCCDWidthArcSec = (instrumentInfo.arcSecPerPixel * instrumentInfo.pixelsX) / 2;
        halfCCDHeightArcSec = (instrumentInfo.arcSecPerPixel * instrumentInfo.pixelsY) / 2;
        footprint.push(offsetCoordinate(coord, rotateCoordinate({ ra: halfCCDWidthArcSec, dec: halfCCDHeightArcSec }, rotation)));
        footprint.push(offsetCoordinate(coord, rotateCoordinate({ ra: halfCCDWidthArcSec, dec: -halfCCDHeightArcSec }, rotation)));
        footprint.push(offsetCoordinate(coord, rotateCoordinate({ ra: -halfCCDWidthArcSec, dec: -halfCCDHeightArcSec }, rotation)));
        footprint.push(offsetCoordinate(coord, rotateCoordinate({ ra: -halfCCDWidthArcSec, dec: halfCCDHeightArcSec }, rotation)));
        // Repeat the first offset to close the loop
        footprint.push(offsetCoordinate(coord, rotateCoordinate({ ra: halfCCDWidthArcSec, dec: halfCCDHeightArcSec }, rotation)));
        footprints.push(
          _.map(footprint, i => {
            return [i['ra'], i['dec']];
          })
        );
      }
      let sizeCCD = Math.min(halfCCDWidthArcSec, halfCCDHeightArcSec);
      let sizeMosaic = this.mosaicRange * 3600;
      let ratioCCDToMosaic = Math.max(sizeCCD / sizeMosaic, 0.0001);
      // The following equation is just a way to scale the size of the annotations for different scenarios. Derived using the
      // following numbers:
      //   - When ratio of CCD to the mosaic range is 0.5 (it takes up a large area), the annotation should be 0.1 * the CCD size. This happens
      //     when there are a small number of pointings with small overlap, and also when there are many pointings
      //     with large overlap.
      //   - When the ratio of CCD to the mosaic range is 0.1 (it takes up a small area), the annotation should be 0.5 * the CCD size. This happens
      //     when there are many pointings with little overlap.
      let sizeAnnotation = (0.03 / ratioCCDToMosaic + 0.1) * sizeCCD;
      let annotations = getPointingPathAnnotations(
        _.map(this.configurations, i => {
          return { ra: i.target.ra, dec: i.target.dec };
        }),
        sizeAnnotation,
        true
      );
      return { footprints: footprints, annotations: annotations };
    }
  },
  methods: {
    getInstrumentInfo: function(instrumentType) {
      let cameraTypeInfo = _.get(this.instrumentsInfo, [instrumentType, 'camera_type']);
      return {
        fieldOfViewDegrees: _.get(cameraTypeInfo, 'science_field_of_view', 0) / 60,
        arcSecPerPixel: _.get(cameraTypeInfo, 'pixel_scale', 0),
        pixelsX: _.get(cameraTypeInfo, 'pixels_x', 1000),
        pixelsY: _.get(cameraTypeInfo, 'pixels_y', 1000),
        orientation: _.get(cameraTypeInfo, 'orientation', 0)
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
      let i = 0;
      // Loop over footprints 3 times to draw the even/odd overlays on top of each other for clarity
      // This alternates the color between blue and red for the outlines, and uses green for the inner arrows
      for (let footprint of this.CCDFootprints.footprints) {
        if (i % 2 === 0) {
          addPolyline(this.aladin, footprint, {
            color: this.colors.blue
          });
        }
        i++;
      }
      i = 0;
      for (let footprint of this.CCDFootprints.footprints) {
        if (i % 2 === 1) {
          addPolyline(this.aladin, footprint, {
            color: this.colors.red
          });
        }
        i++;
      }
      for (let annotation of this.CCDFootprints.annotations) {
        addPolyline(this.aladin, annotation, {
          color: this.colors.green
        });
      }
      addLegend(this.aladin, { label: 'Last pointing', offsetBottom: 35, offsetLeft: 10, shape: 'cross', color: this.colors.green });
      addLegend(this.aladin, { label: 'First pointing', offsetBottom: 55, offsetLeft: 10, shape: 'triangle', color: this.colors.green });
      addLegend(this.aladin, {
        label: 'Pointing FOV outline',
        offsetBottom: 35,
        offsetLeft: 333,
        shape: 'square',
        color: this.colors.blue
      });
      addLegend(this.aladin, { label: 'Pointing FOV outline', offsetBottom: 55, offsetLeft: 333, shape: 'square', color: this.colors.red });
      addFillBackground(this.aladin, this.colors.transparentBackground);
    }
  }
};
</script>
<style>
.aladin-responsive {
  overflow-x: scroll;
}
</style>
