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
        <!-- TODO: show legend for what the different annotations mean -->
        <aladin-plot :plot-id="aladinZoomedInPlotId" @aladin-loaded="onZoomedInPlotLoaded"></aladin-plot>
      </b-col>
    </b-row>
  </div>
</template>
<script>
/* global A */
import AladinPlot from '@/components/Plots/AladinPlot.vue';
import TextAnnotation from '@/components/RequestGroupComposition/aladinTextAnnotation';

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
    },
    instrumentFieldOfViewDegrees: {
      type: Number,
      required: true
    },
    instrumentArcSecPerPixel: {
      type: Number,
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
      // Calculate list of coordinates from provided offsets. Equations pulled
      // from https://www.atnf.csiro.au/computing/software/miriad/doc/offset.html
      const cosDec = Math.cos((this.centerDec * Math.PI) / 180);
      let coords = [];
      for (let offset of this.offsets) {
        coords.push([this.centerRa + offset['ra'] / 3600 / cosDec, this.centerDec + offset['dec'] / 3600]);
      }
      return coords;
    },
    ditherRange: function() {
      const cosDec = Math.cos((this.centerDec * Math.PI) / 180);
      let decCoords = this.offsetCoordinates.map(coord => coord[1]);
      let raCoords = this.offsetCoordinates.map(coord => coord[0]);
      let raRange = Math.abs(Math.max(...raCoords) - Math.min(...raCoords)) * cosDec;
      let decRange = Math.abs(Math.max(...decCoords) - Math.min(...decCoords));
      return Math.max(raRange, decRange);
    },
    zoomedInFieldOfView: function() {
      return this.ditherRange * 4;
    }
  },
  methods: {
    onZoomedInPlotLoaded: function() {
      this.aladinZoomedIn = A.aladin(`#${this.aladinZoomedInPlotId}`, {
        survey: 'P/DSS2/color',
        fov: this.zoomedInFieldOfView,
        target: `${this.centerRa} ${this.centerDec}`,
        showReticle: false,
        showGotoControl: false,
        showLayersControl: false,
        showFullscreenControl: false,
        showZoomControl: false
      });
      this.aladinZoomedIn
        .getBaseImageLayer()
        .getColorMap()
        .update('grayscale');
      this.aladinZoomedIn.setFovRange(this.zoomedInFieldOfView, this.zoomedInFieldOfView);
      this.addZoomedInAnnotations();
    },
    onZoomedOutPlotLoaded: function() {
      this.aladinZoomedOut = A.aladin(`#${this.aladinZoomedOutPlotId}`, {
        survey: 'P/DSS2/color',
        fov: this.instrumentFieldOfViewDegrees,
        target: `${this.centerRa} ${this.centerDec}`,
        showReticle: false,
        showGotoControl: false,
        showLayersControl: false,
        showFullscreenControl: false,
        showZoomControl: false
      });
      this.aladinZoomedOut
        .getBaseImageLayer()
        .getColorMap()
        .update('grayscale');
      this.aladinZoomedOut.setFovRange(this.instrumentFieldOfViewDegrees, this.instrumentFieldOfViewDegrees);
      this.addZoomedOutAnnotations();
    },
    addZoomedOutAnnotations: function() {
      let overlay = A.graphicOverlay({ color: 'cyan', lineWidth: 2 });
      this.aladinZoomedOut.addOverlay(overlay);
      overlay.add(A.circle(this.centerRa, this.centerDec, this.instrumentFieldOfViewDegrees / 10, { color: '#36ff75', lineWidth: 2 }));
      // Make sure the range is at least big enough to be able to be seen on the plot
      let range = Math.max(this.ditherRange, this.instrumentFieldOfViewDegrees / 100);
      this.addScaleBar(this.aladinZoomedOut, overlay, range, 'Dither range', 30);
    },
    addZoomedInAnnotations: function() {
      // Add annotations circling the center and drawing lines between pointings
      let overlay = A.graphicOverlay({ color: '#36ff75', lineWidth: 2 });
      this.aladinZoomedIn.addOverlay(overlay);
      overlay.add(A.polyline(this.offsetCoordinates, { color: 'cyan', lineWidth: 2 }));
      overlay.add(A.circle(this.centerRa, this.centerDec, this.zoomedInFieldOfView / 10, { color: '#36ff75', lineWidth: 2 }));
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
      this.addCatalog(firstPointingSources, { color: 'red', shape: 'cross', sourceSize: 15 });
      this.addCatalog(middlePointingsSources, { color: 'red', shape: 'circle', sourceSize: 15 });
      this.addCatalog(lastPointingSources, { color: 'red', shape: 'triangle', sourceSize: 15 });
      this.addScaleBar(this.aladinZoomedIn, overlay, this.instrumentArcSecPerPixel / 3600, 'Pixel size', 30);
    },
    addScaleBar: function(aladin, overlay, sizeAsDegrees, label, offsetPixFromEdge, color, lineWidth, textSpacing) {
      // TODO: Figure out how to get rid of this window.setTimeout(...). I'm not sure why this is needed, but
      // without the window.Timeout, the aladin pix2world function returns incorrect coordinates
      window.setTimeout(() => {
        offsetPixFromEdge = offsetPixFromEdge || 30;
        color = color || 'cyan';
        textSpacing = textSpacing || 7;
        lineWidth = lineWidth || 2;
        // Add a scale bar showing the size of a pixel of the instrument
        // Aladin viewer pixel position (0,0) is the top left corner of the view
        const viewSizePix = aladin.getSize();
        const scaleBarStartPix = [offsetPixFromEdge, viewSizePix[1] - offsetPixFromEdge]; // Bottom left corner
        const cosDec = Math.cos((this.centerDec * Math.PI) / 180);
        const scaleBarStart = aladin.pix2world(scaleBarStartPix[0], scaleBarStartPix[1]);
        const scaleBarEnd = [scaleBarStart[0] - sizeAsDegrees / cosDec, scaleBarStart[1]];
        const scaleBarEndPix = aladin.world2pix(scaleBarEnd[0], scaleBarEnd[1]);
        const scaleBarLength = Math.abs(scaleBarEndPix[0] - scaleBarStartPix[0]);
        overlay.add(A.polyline([scaleBarStart, scaleBarEnd], { color: color, lineWidth: lineWidth }));
        overlay.add(new TextAnnotation(scaleBarStartPix[0] + scaleBarLength / 2, scaleBarStartPix[1] - textSpacing, label, { color: color }));
      }, 0);
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
