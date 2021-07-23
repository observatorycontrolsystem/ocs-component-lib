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
import { addCatalog, setColorMap, removeReticleEventHandlers } from '@/components/Plots/aladinPlotUtil.js';

export default {
  name: 'MosaicPlot',
  components: {
    AladinPlot
  },
  props: {
    centerRa: {
      type: Number,
      required: true
    },
    centerDec: {
      type: Number,
      required: true
    },
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
    instrumentType: {
      type: String,
      required: false,
      default: 'Instrument'
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
      targetMarkerSourceSize: 50,
      colors: {
        info: '#17ff60'
      }
    };
  },
  computed: {
    cosDec: function() {
      let cosDec = Math.cos((this.centerDec * Math.PI) / 180);
      // If the cosine dec ends up being 0, offset it slightly so that there are no divisions by zero. It doesn't need to be that
      // precise since this is only for visualization purposes and a small shift won't matter.
      cosDec = Math.max(cosDec, 10e-4);
      return cosDec;
    },
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
      let raRange = Math.abs(Math.max(...raCoords) - Math.min(...raCoords)) * this.cosDec;
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
      addCatalog(this.aladin, [[this.centerRa, this.centerDec]], {
        offsetLeft: this.legendItemsOffsetLeft,
        offsetBottom: this.legendItemsOffsetBottom,
        color: this.colors.info,
        shape: 'cross',
        sourceSize: this.targetMarkerSourceSize,
        legendSourceSize: this.legendSourceSize,
        label: 'Target'
      });
      addCatalog(this.aladin, this.coordinates, {
        offsetLeft: this.legendItemsOffsetLeft,
        offsetBottom: this.legendItemsOffsetBottom,
        color: this.colors.info,
        shape: 'square',
        sourceSize: this.targetMarkerSourceSize,
        legendSourceSize: this.legendSourceSize,
        label: 'Target'
      });
    }
  }
};
</script>
<style>
.aladin-responsive {
  overflow-x: scroll;
}
</style>
