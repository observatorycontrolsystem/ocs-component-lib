<template>
  <div>
    <!-- TODO: Make this nice for small screens -->
    <b-row>
      <b-col>
        <slot name="help"></slot>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <!-- TODO: Maybe don't show this plot of the dither range is larger than the instrument FOV -->
        <aladin-plot :plot-id="aladinZoomedOutPlotId" plot-height="500px" plot-width="500px" @aladin-loaded="onZoomedOutPlotLoaded"></aladin-plot>
      </b-col>
      <b-col>
        <aladin-plot :plot-id="aladinZoomedInPlotId" plot-height="500px" plot-width="500px" @aladin-loaded="onZoomedInPlotLoaded"></aladin-plot>
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
    },
    instrumentType: {
      type: String,
      required: false,
      default: 'Instrument'
    },
    showTarget: {
      type: Boolean
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
      // Should be at least as large as the instrument pixel scale
      let fovForDitherRange = this.ditherRange * 4;
      let fovForPixelScale = this.instrumentArcSecPerPixel * 4 / 3600;
      if (fovForDitherRange < this.instrumentArcSecPerPixel / 3600) {
        return fovForPixelScale;
      } else {
        return Math.max(fovForDitherRange, fovForPixelScale);
      }
    }
  },
  methods: {
    onZoomedInPlotLoaded: function() {
      // TODO: Center this plot on the middle of the dither sequence

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
      this.aladinZoomedIn.on('positionChanged', () => {
        this.aladinZoomedIn.gotoRaDec(this.centerRa, this.centerDec);
      });
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
      this.aladinZoomedOut.on('positionChanged', () => {
        this.aladinZoomedOut.gotoRaDec(this.centerRa, this.centerDec);
      });
      this.addZoomedOutAnnotations();
    },
    addZoomedOutAnnotations: function() {
      // Make sure the range is at least big enough to be able to be seen on the plot
      let range = Math.max(this.ditherRange, this.instrumentFieldOfViewDegrees / 100);
      this.addScaleBar(
        this.aladinZoomedOut,
        range,
        `Scale of dither range (${Math.floor(this.ditherRange * 3600)}")`,
        { left: 20, bottom: 30 },
        '#36ff75'
      );
      if (this.showTarget) {
        this.addCatalog(this.aladinZoomedOut, [[this.centerRa, this.centerDec]], {
          offsetLeft: 20,
          offsetBottom: 50,
          color: '#36ff75',
          shape: 'circle',
          sourceSize: 50,
          legendSourceSize: 10,
          label: 'Target'
        });
      }
    },
    addZoomedInAnnotations: function() {
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
      let legendOffsetBottom = 30;
      let legendOffsetBottomStepSize = 20;
      // Make sure the pixel scale bar is at least big enough to be seen on the graph is at least big enough to be able to be seen on the plot
      let pixelScaleBar = Math.max(this.instrumentArcSecPerPixel / 3600, this.zoomedInFieldOfView / 100);
      this.addScaleBar(
        this.aladinZoomedIn,
        pixelScaleBar,
        `${this.instrumentType} pixel scale (${this.instrumentArcSecPerPixel}"/pix)`,
        { left: 20, bottom: legendOffsetBottom },
        '#36ff75'
      );
      if (this.showTarget) {
        legendOffsetBottom += legendOffsetBottomStepSize;
        this.addCatalog(this.aladinZoomedIn, [[this.centerRa, this.centerDec]], {
          offsetLeft: 20,
          offsetBottom: legendOffsetBottom,
          color: '#36ff75',
          shape: 'circle',
          sourceSize: 50,
          legendSourceSize: 10,
          label: 'Target'
        });
      }
      if (firstPointingSources.length > 0) {
        legendOffsetBottom += legendOffsetBottomStepSize;
        this.addCatalog(this.aladinZoomedIn, firstPointingSources, {
          offsetLeft: 20,
          offsetBottom: legendOffsetBottom,
          color: 'cyan',
          shape: 'cross',
          sourceSize: 15,
          legendSourceSize: 10,
          label: 'First dither pointing'
        });
      }
      if (middlePointingsSources.length > 0) {
        legendOffsetBottom += legendOffsetBottomStepSize;
        this.addCatalog(this.aladinZoomedIn, middlePointingsSources, {
          offsetLeft: 20,
          offsetBottom: legendOffsetBottom,
          color: 'cyan',
          shape: 'circle',
          sourceSize: 15,
          legendSourceSize: 10,
          label: 'Dither pointing'
        });
      }
      if (lastPointingSources.length > 0) {
        legendOffsetBottom += legendOffsetBottomStepSize;
        this.addCatalog(this.aladinZoomedIn, lastPointingSources, {
          offsetLeft: 20,
          offsetBottom: legendOffsetBottom,
          color: 'cyan',
          shape: 'triangle',
          sourceSize: 15,
          legendSourceSize: 10,
          label: 'Last dither pointing'
        });
      }
      this.addPolyline(this.aladinZoomedIn, this.offsetCoordinates, { color: 'cyan', lineWidth: 1 });
    },
    addText: function(aladin, x, y, options) {
      const label = options['label'] || '';
      const color = options['color'] || 'white';
      const align = options['align'] || 'start';
      const baseline = options['baseline'] || 'middle';
      let layer = A.graphicOverlay();
      aladin.addOverlay(layer);
      layer.add(new TextAnnotation(x, y, label, { color: color, align: align, baseline: baseline }));
    },
    addPolyline: function(aladin, coordinates, options) {
      const color = options['color'] || 'red';
      const lineWidth = options['lineWidth'] || 2;
      let layer = A.graphicOverlay();
      aladin.addOverlay(layer);
      layer.add(A.polyline(coordinates, { color: color, lineWidth: lineWidth }));
    },
    addScaleBar: function(aladin, sizeAsDegrees, label, offsetPixFromEdge, color, lineWidth, textSpacing) {
      window.setTimeout(() => {
        color = color || 'cyan';
        textSpacing = textSpacing || 15;
        lineWidth = lineWidth || 2;
        const offsetBotton = offsetPixFromEdge['bottom'] || 30;
        const offsetleft = offsetPixFromEdge['left'] || 30;
        // Aladin viewer pixel position (0,0) is the top left corner of the view
        let layer = A.graphicOverlay({ name: 'scale bar', color: color, lineWidth: 4 });
        aladin.addOverlay(layer);
        const viewSizePix = aladin.getSize();
        const scaleBarStartPix = [offsetleft, viewSizePix[1] - offsetBotton]; // Bottom left corner
        const cosDec = Math.cos((this.centerDec * Math.PI) / 180);

        // TODO: The scale bar on the zoomed out plot looks weird near the poles, the zoomed in plot looks ok

        const scaleBarStart = aladin.pix2world(scaleBarStartPix[0], scaleBarStartPix[1]);
        const scaleBarEnd = [scaleBarStart[0] - sizeAsDegrees / cosDec, scaleBarStart[1]];
        const scaleBarEndPix = aladin.world2pix(scaleBarEnd[0], scaleBarEnd[1]);
        const scaleBarLength = Math.abs(scaleBarEndPix[0] - scaleBarStartPix[0]);
        layer.add(A.polyline([scaleBarStart, scaleBarEnd], { color: color, lineWidth: lineWidth }));
        layer.add(
          new TextAnnotation(scaleBarStartPix[0] + scaleBarLength + textSpacing, scaleBarStartPix[1], label, {
            color: color,
            align: 'start',
            baseline: 'middle'
          })
        );
      }, 0);
    },
    addCatalog: function(aladin, coordinates, options) {
      const label = options['label'] || '';
      const color = options['color'] || 'red';
      const offsetBottom = options['offsetBottom'] || 30;
      const offsetLeft = options['offsetLeft'] || 30;
      const shape = options['shape'] || 'circle';
      const sourceSize = options['sourceSize'] || 15;
      const legendSourceSize = options['legendSourceSize'] || 15;
      // Create a catalog and sources to it
      let catalog = A.catalog({ color: color, sourceSize: sourceSize, shape: shape });
      aladin.addCatalog(catalog);
      for (let coordinate of coordinates) {
        catalog.addSources(A.source(coordinate[0], coordinate[1]));
      }
      // Add a legend if there are sources
      if (coordinates.length > 0) {
        this.addLegendForCatalog(aladin, {
          offsetBottom: offsetBottom,
          offsetLeft: offsetLeft,
          color: color,
          label: label,
          sourceSize: legendSourceSize,
          shape: shape
        });
      }
    },
    addLegendForCatalog: function(aladin, options) {
      const offsetBottom = options['offsetBottom'] || 30;
      const offsetLeft = options['offsetLeft'] || 30;
      const sourceSize = options['sourceSize'] || 20;
      const color = options['color'] || 'red';
      const label = options['label'] || '';
      const shape = options['shape'] || 'circle';
      const textSpacingLeft = 15;
      let catalog = A.catalog({ color: color, sourceSize: sourceSize, shape: shape });
      aladin.addCatalog(catalog);
      window.setTimeout(() => {
        const viewSizePix = aladin.getSize();
        const legendSourcePix = [offsetLeft + Math.floor(sourceSize / 2), viewSizePix[1] - offsetBottom]; // Bottom left corner
        const legendSource = aladin.pix2world(legendSourcePix[0], legendSourcePix[1]);
        catalog.addSources(A.source(legendSource[0], legendSource[1]));
        let layer = A.graphicOverlay({ color: color, lineWidth: 2 });
        aladin.addOverlay(layer);
        layer.add(
          new TextAnnotation(legendSourcePix[0] + textSpacingLeft, legendSourcePix[1], label, { color: color, align: 'start', baseline: 'middle' })
        );
      }, 0);
    }
  }
};
</script>
