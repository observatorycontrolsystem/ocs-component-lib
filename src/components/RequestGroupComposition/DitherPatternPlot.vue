<template>
  <div>
    <b-row>
      <b-col>
        <slot name="help"></slot>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <aladin-plot :plot-id="aladinZoomedOutPlotId" @aladin-loaded="onZoomedOutPlotLoaded"></aladin-plot>
      </b-col>
      <b-col>
        <aladin-plot :plot-id="aladinZoomedInPlotId" @aladin-loaded="onZoomedInPlotLoaded"></aladin-plot>
      </b-col>
    </b-row>
  </div>
</template>
<script>
/* global A */
import AladinPlot from '@/components/Plots/AladinPlot.vue';

export default {
  name: 'DitherPatternPlot',
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
    // List of arcsecond RA and Dec offsets in the form of:
    // [
    //   { ra: dra1, dec: ddec1 },
    //   { ra: dra2, dec: ddec2 },
    //   ...
    // ]
    offsets: {
      type: Array,
      required: true
    }
  },
  data: function() {
    return {
      aladinZoomedIn: undefined,
      aladinZoomedOut: undefined,
      aladinZoomedInPlotId: 'dither-zoomed-in',
      aladinZoomedOutPlotId: 'dither-zoomed-out'
    };
  },
  computed: {
    offsetCoordinates: function() {
      let coords = [];
      let ra = this.centerRa;
      let dec = this.centerDec;
      for (let offset of this.offsets) {
        ra += offset['ra'] / 3600;
        dec += offset['dec'] / 3600;
        coords.push([ra, dec]);
      }
      return coords;
    },
    aladinOptions: function() {
      let fieldOfView = this.getFieldOfView();
      return {
        survey: 'P/DSS2/color',
        fov: fieldOfView,
        target: `${this.centerRa} ${this.centerDec}`,
        showReticle: false,
        showGotoControl: false,
        showLayersControl: false,
        showFullscreenControl: false
      };
    }
  },
  methods: {
    onZoomedInPlotLoaded: function() {
      let fieldOfView = this.getFieldOfView();
      this.aladinZoomedIn = A.aladin(`#${this.aladinZoomedInPlotId}`, {
        survey: 'P/DSS2/color',
        fov: fieldOfView,
        target: `${this.centerRa} ${this.centerDec}`,
        showReticle: false,
        showGotoControl: false,
        showLayersControl: false,
        showFullscreenControl: false
      });
      this.aladinZoomedIn
        .getBaseImageLayer()
        .getColorMap()
        .update('grayscale');
      this.addAnnotations();
    },
    onZoomedOutPlotLoaded: function() {
      let fieldOfView = 20 / 60;
      this.aladinZoomedIn = A.aladin(`#${this.aladinZoomedOutPlotId}`, {
        survey: 'P/DSS2/color',
        fov: fieldOfView,
        target: `${this.centerRa} ${this.centerDec}`,
        showReticle: false,
        showGotoControl: false,
        showLayersControl: false,
        showFullscreenControl: false
      });
      this.aladinZoomedIn
        .getBaseImageLayer()
        .getColorMap()
        .update('grayscale');
    },
    getFieldOfView: function() {
      let ra_width = 0;
      let dec_width = 0;
      for (let offset of this.offsets) {
        ra_width += offset['ra'];
        dec_width += offset['dec'];
      }
      return (5 * Math.max(ra_width, dec_width)) / 3600;
    },
    addAnnotations: function() {
      // Add annotations circling the center and drawing lines between pointings
      let overlay = A.graphicOverlay({ color: 'cyan', lineWidth: 1 });
      this.aladinZoomedIn.addOverlay(overlay);
      overlay.add(A.polyline(this.offsetCoordinates, { color: 'cyan', lineWidth: 1 }));
      overlay.add(A.circle(this.centerRa, this.centerDec, 2 / 3600, { color: 'green', lineWidth: 1 }));
      // Add annotations to mark a point at the center of each offset pointing
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
      this.addCatalog(firstPointingSources, { color: 'cyan', shape: 'cross' });
      this.addCatalog(middlePointingsSources, { color: 'red', shape: 'circle' });
      this.addCatalog(lastPointingSources, { color: 'cyan', shape: 'triangle' });
    },
    addCatalog: function(coordinates, options) {
      let catalog = A.catalog(options);
      this.aladinZoomedIn.addCatalog(catalog);
      for (let coordinate of coordinates) {
        catalog.addSources(A.source(coordinate[0], coordinate[1]));
      }
    }
  }
};
</script>
