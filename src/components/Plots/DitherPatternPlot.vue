<template>
  <div>
    <b-row>
      <b-col>
        <slot name="help"></slot>
      </b-col>
    </b-row>
    <b-row>
      <b-col v-if="isSiderealTarget">
        <aladin-plot
          :plot-id="aladinZoomedOutPlotId"
          :plot-height="plotHeight"
          :plot-width="plotWidth"
          class="aladin-responsive"
          :aladin-script-location="aladinScriptLocation"
          :aladin-style-location="aladinStyleLocation"
          @aladin-loaded="onZoomedOutPlotLoaded"
        />
        <div class="text-center font-italic m-auto w-100">
          Zoomed to the field of view of {{ instrumentType }}. The dither range is {{ ditherRangeInstrumentPercentage | round(1) }}% of this field of
          view.
        </div>
      </b-col>
      <b-col :class="{ 'non-sidereal': !isSiderealTarget }">
        <aladin-plot
          :plot-id="aladinZoomedInPlotId"
          :plot-height="plotHeight"
          :plot-width="plotWidth"
          class="aladin-responsive"
          :aladin-script-location="aladinScriptLocation"
          :aladin-style-location="aladinStyleLocation"
          @aladin-loaded="onZoomedInPlotLoaded"
        />
        <div class="text-center font-italic m-auto w-100">
          Zoomed in to the dither pattern.
          <span v-if="ditherRange > 0">
            The pixel size of {{ instrumentType }} is {{ pixelSizeOfDitherRangePercentage | round(1) }}% of the dither range.
          </span>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script>
/* global A */
import AladinPlot from '@/components/Plots/AladinPlot.vue';
import {
  addPolyline,
  addScaleBar,
  addCatalog,
  setColorMap,
  addFillBackground,
  removeReticleEventHandlers
} from '@/components/Plots/aladinPlotUtil.js';
import { round } from '@/util';

export default {
  name: 'DitherPatternPlot',
  components: {
    AladinPlot
  },
  filters: {
    round: function(value, decimalPlaces) {
      return round(value, decimalPlaces);
    }
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
    // List of arcsecond RA and Dec offsets in the form of:
    // [
    //   { ra: dra1, dec: ddec1 },
    //   { ra: dra2, dec: ddec2 },
    //   ...
    // ]
    offsets: {
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
    isSiderealTarget: {
      type: Boolean
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
      aladinZoomedIn: undefined,
      aladinZoomedOut: undefined,
      aladinZoomedInPlotId: 'dither-zoomed-in',
      aladinZoomedOutPlotId: 'dither-zoomed-out',
      legendItemVerticalSpacingPix: 20,
      legendItemsOffsetBottom: 30,
      legendItemsOffsetLeft: 30,
      legendSourceSize: 10,
      patternSourceSize: 15,
      targetMarkerSourceSize: 50,
      arcSecPerDeg: 3600,
      minScaleBarSizeFactor: 1 / 200,
      maxScaleBarSizePercentage: 55,
      colors: {
        pattern: '#30fff8',
        info: '#17ff60',
        transparentBackground: 'rgba(0, 0, 0, 0.4)',
        nonSiderealBackground: '#3f3e40'
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
    offsetCoordinates: function() {
      // Calculate list of coordinates from provided offsets. Equations pulled
      // from https://www.atnf.csiro.au/computing/software/miriad/doc/offset.html
      let coords = [];
      for (let offset of this.offsets) {
        coords.push([this.centerRa + offset['ra'] / this.arcSecPerDeg / this.cosDec, this.centerDec + offset['dec'] / this.arcSecPerDeg]);
      }
      return coords;
    },
    ditherRange: function() {
      // Find the size of the dither offsets
      let decCoords = this.offsetCoordinates.map(coord => coord[1]);
      let raCoords = this.offsetCoordinates.map(coord => coord[0]);
      let raRange = Math.abs(Math.max(...raCoords) - Math.min(...raCoords)) * this.cosDec;
      let decRange = Math.abs(Math.max(...decCoords) - Math.min(...decCoords));
      return Math.max(raRange, decRange);
    },
    ditherMidPoint: function() {
      // Find the center of the dither sequence
      let decCoords = this.offsetCoordinates.map(coord => coord[1]);
      let raCoords = this.offsetCoordinates.map(coord => coord[0]);
      let ra = (Math.max(...raCoords) + Math.min(...raCoords)) / 2;
      let dec = (Math.max(...decCoords) + Math.min(...decCoords)) / 2;
      return [ra, dec];
    },
    zoomedInFieldOfView: function() {
      // Should be at least as large as the instrument pixel scale
      let zoomedInFieldOfViewFactor = 4;
      let fovForDitherRange = this.ditherRange * zoomedInFieldOfViewFactor;
      let fovForPixelScale = (this.instrumentArcSecPerPixel * zoomedInFieldOfViewFactor) / this.arcSecPerDeg;
      if (fovForDitherRange < this.instrumentArcSecPerPixel / this.arcSecPerDeg) {
        return fovForPixelScale;
      } else {
        return Math.max(fovForDitherRange, fovForPixelScale);
      }
    },
    ditherRangeInstrumentPercentage: function() {
      return (this.ditherRange / this.instrumentFieldOfViewDegrees) * 100;
    },
    pixelSizeOfDitherRangePercentage: function() {
      return (this.instrumentArcSecPerPixel / this.arcSecPerDeg / this.ditherRange) * 100;
    }
  },
  methods: {
    round: function(value, decimalPlaces) {
      return round(value, decimalPlaces);
    },
    getAladinOptions: function(ra, dec) {
      return {
        survey: 'P/DSS2/color',
        target: `${ra} ${dec}`,
        showReticle: false,
        showGotoControl: false,
        showLayersControl: false,
        showFullscreenControl: false,
        showZoomControl: false,
        pixelateCanvas: false,
        showFrame: this.isSiderealTarget
      };
    },
    onZoomedInPlotLoaded: function() {
      this.aladinZoomedIn = A.aladin(`#${this.aladinZoomedInPlotId}`, this.getAladinOptions(this.ditherMidPoint[0], this.ditherMidPoint[1]));
      this.aladinZoomedIn.setFov(this.zoomedInFieldOfView);
      this.aladinZoomedIn.setFovRange(this.zoomedInFieldOfView, this.zoomedInFieldOfView);
      this.aladinZoomedIn.on('positionChanged', () => {
        this.addZoomedInAnnotations();
      });
      setColorMap(this.aladinZoomedIn);
      removeReticleEventHandlers();
    },
    onZoomedOutPlotLoaded: function() {
      this.aladinZoomedOut = A.aladin(`#${this.aladinZoomedOutPlotId}`, this.getAladinOptions(this.centerRa, this.centerDec));
      this.aladinZoomedOut.setFov(this.instrumentFieldOfViewDegrees);
      this.aladinZoomedOut.setFovRange(this.instrumentFieldOfViewDegrees, this.instrumentFieldOfViewDegrees);
      this.aladinZoomedOut.on('positionChanged', () => {
        this.addZoomedOutAnnotations();
      });
      setColorMap(this.aladinZoomedOut);
      removeReticleEventHandlers();
    },
    addZoomedOutAnnotations: function() {
      this.aladinZoomedOut.removeLayers();
      // Make sure the range is at least big enough to be able to be seen on the plot
      let range = Math.max(this.ditherRange, this.instrumentFieldOfViewDegrees * this.minScaleBarSizeFactor);
      let legendOffsetBottom = this.legendItemsOffsetBottom;
      if (this.ditherRangeInstrumentPercentage < this.maxScaleBarSizePercentage) {
        addScaleBar(
          this.aladinZoomedOut,
          range,
          `Dither range (${this.round(this.ditherRange * this.arcSecPerDeg, 1)}")`,
          { left: this.legendItemsOffsetLeft, bottom: legendOffsetBottom },
          this.colors.info
        );
        legendOffsetBottom += this.legendItemVerticalSpacingPix;
      }
      addCatalog(this.aladinZoomedOut, [[this.centerRa, this.centerDec]], {
        offsetLeft: this.legendItemsOffsetLeft,
        offsetBottom: legendOffsetBottom,
        color: this.colors.info,
        shape: 'circle',
        sourceSize: this.targetMarkerSourceSize,
        legendSourceSize: this.legendSourceSize,
        label: 'Target'
      });
      addFillBackground(this.aladinZoomedOut, this.colors.transparentBackground);
    },
    addZoomedInAnnotations: function() {
      this.aladinZoomedIn.removeLayers();
      // Categorize all offset pointings so that they can be displayed independently on the plot
      let firstPointingSources = [];
      let lastPointingSources = [];
      let middlePointingsSources = [];
      for (let offsetIndex in this.offsetCoordinates) {
        if (offsetIndex == 0) {
          // This is the first pointing, use an X marker
          firstPointingSources.push(this.offsetCoordinates[offsetIndex]);
        } else if (offsetIndex == this.offsetCoordinates.length - 1) {
          // This is the last pointing, use a triangle marker
          lastPointingSources.push(this.offsetCoordinates[offsetIndex]);
        } else {
          // This is a pointing somewhere in the middles, use a dot
          middlePointingsSources.push(this.offsetCoordinates[offsetIndex]);
        }
      }
      let legendOffsetBottom = this.legendItemsOffsetBottom;
      // Make sure the dither range scale bar is at least big enough to be able to be seen on the plot
      let range = Math.max(this.ditherRange, this.zoomedInFieldOfView * this.minScaleBarSizeFactor);
      addScaleBar(
        this.aladinZoomedIn,
        range,
        `Dither range (${this.round(this.ditherRange * this.arcSecPerDeg, 1)}")`,
        { left: this.legendItemsOffsetLeft, bottom: legendOffsetBottom },
        this.colors.info
      );
      legendOffsetBottom += this.legendItemVerticalSpacingPix;
      // Make sure the pixel scale bar is at least big enough to be seen on the graph is at least big enough to be able to be seen on the plot
      let pixelScaleBar = Math.max(this.instrumentArcSecPerPixel / this.arcSecPerDeg, this.zoomedInFieldOfView / 100);
      addScaleBar(
        this.aladinZoomedIn,
        pixelScaleBar,
        `${this.instrumentType} pixel size (${this.instrumentArcSecPerPixel}"/pix)`,
        { left: this.legendItemsOffsetLeft, bottom: legendOffsetBottom },
        this.colors.info
      );
      legendOffsetBottom += this.legendItemVerticalSpacingPix;
      addCatalog(this.aladinZoomedIn, [[this.centerRa, this.centerDec]], {
        offsetLeft: this.legendItemsOffsetLeft,
        offsetBottom: legendOffsetBottom,
        color: this.colors.info,
        shape: 'circle',
        sourceSize: this.targetMarkerSourceSize,
        legendSourceSize: this.legendSourceSize,
        label: 'Target'
      });
      if (firstPointingSources.length > 0) {
        legendOffsetBottom += this.legendItemVerticalSpacingPix;
        addCatalog(this.aladinZoomedIn, firstPointingSources, {
          offsetLeft: this.legendItemsOffsetLeft,
          offsetBottom: legendOffsetBottom,
          color: this.colors.pattern,
          shape: 'cross',
          sourceSize: this.patternSourceSize,
          legendSourceSize: this.legendSourceSize,
          label: 'First dither pointing'
        });
      }
      if (middlePointingsSources.length > 0) {
        legendOffsetBottom += this.legendItemVerticalSpacingPix;
        addCatalog(this.aladinZoomedIn, middlePointingsSources, {
          offsetLeft: this.legendItemsOffsetLeft,
          offsetBottom: legendOffsetBottom,
          color: this.colors.pattern,
          shape: 'circle',
          sourceSize: this.patternSourceSize,
          legendSourceSize: this.legendSourceSize,
          label: 'Dither pointing'
        });
      }
      if (lastPointingSources.length > 0) {
        legendOffsetBottom += this.legendItemVerticalSpacingPix;
        addCatalog(this.aladinZoomedIn, lastPointingSources, {
          offsetLeft: this.legendItemsOffsetLeft,
          offsetBottom: legendOffsetBottom,
          color: this.colors.pattern,
          shape: 'triangle',
          sourceSize: this.patternSourceSize,
          legendSourceSize: this.legendSourceSize,
          label: 'Last dither pointing'
        });
      }
      addPolyline(this.aladinZoomedIn, this.offsetCoordinates, { color: this.colors.pattern, lineWidth: 1 });
      if (!this.isSiderealTarget) {
        addFillBackground(this.aladinZoomedIn, this.colors.nonSiderealBackground);
      } else {
        addFillBackground(this.aladinZoomedIn, this.colors.transparentBackground);
      }
    }
  }
};
</script>
<style>
/* Hide .aladin-fov and .aladin-location elements we are displaying a non-sidereal target */
.non-sidereal .aladin-fov {
  display: none;
}
.non-sidereal .aladin-location {
  display: none;
}
.aladin-responsive {
  overflow-x: scroll;
}
</style>
