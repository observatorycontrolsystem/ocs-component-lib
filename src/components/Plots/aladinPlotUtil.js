/* global A */
import $ from 'jquery';

import Text from '@/components/Plots/aladinText';
import Rectangle from '@/components/Plots/aladinRectangle';

const addText = (aladin, x, y, options) => {
  const label = options['label'] || '';
  const color = options['color'] || 'white';
  const align = options['align'] || 'start';
  const baseline = options['baseline'] || 'middle';
  let layer = A.graphicOverlay();
  aladin.addOverlay(layer);
  layer.add(new Text(x, y, label, { color: color, align: align, baseline: baseline }));
};

const addPolyline = (aladin, coordinates, options) => {
  const color = options['color'] || 'red';
  const lineWidth = options['lineWidth'] || 2;
  let layer = A.graphicOverlay();
  aladin.addOverlay(layer);
  layer.add(A.polyline(coordinates, { color: color, lineWidth: lineWidth }));
};

const addScaleBar = (aladin, sizeAsDegrees, label, offsetPixFromEdge, color, lineWidth, textSpacing) => {
  // Draw a horizontal scale bar
  color = color || this.colors.pattern;
  textSpacing = textSpacing || 15;
  lineWidth = lineWidth || 2;
  const offsetBottom = offsetPixFromEdge['bottom'] || this.legendItemsOffsetBottom;
  const offsetleft = offsetPixFromEdge['left'] || this.legendItemsOffsetLeft;
  // Aladin viewer pixel position (0,0) is the top left corner of the view
  let layer = A.graphicOverlay({ name: 'scale bar', color: color, lineWidth: 4 });
  aladin.addOverlay(layer);
  const viewSizePix = aladin.getSize();
  const scaleBarStartPix = [offsetleft, viewSizePix[1] - offsetBottom]; // Bottom left corner
  const scaleBarSizeInPix = (sizeAsDegrees / aladin.getFov()[0]) * viewSizePix[0];
  const scaleBarEndPix = [scaleBarStartPix[0] + scaleBarSizeInPix, scaleBarStartPix[1]];
  const scaleBarStart = aladin.pix2world(scaleBarStartPix[0], scaleBarStartPix[1]);
  const scaleBarEnd = aladin.pix2world(scaleBarEndPix[0], scaleBarEndPix[1]);
  const scaleBarLength = Math.abs(scaleBarEndPix[0] - scaleBarStartPix[0]);
  layer.add(A.polyline([scaleBarStart, scaleBarEnd], { color: color, lineWidth: lineWidth }));
  layer.add(
    new Text(scaleBarStartPix[0] + scaleBarLength + textSpacing, scaleBarStartPix[1], label, {
      color: color,
      align: 'start',
      baseline: 'middle'
    })
  );
};

const addLegendForCatalog = (aladin, options) => {
  const offsetBottom = options['offsetBottom'] || this.legendOffsetBottom;
  const offsetLeft = options['offsetLeft'] || this.legendItemsOffsetLeft;
  const sourceSize = options['sourceSize'] || this.legendSourceSize;
  const color = options['color'] || 'red';
  const label = options['label'] || '';
  const shape = options['shape'] || 'circle';
  const textSpacingLeft = 15;
  let catalog = A.catalog({ color: color, sourceSize: sourceSize, shape: shape });
  aladin.addCatalog(catalog);
  const viewSizePix = aladin.getSize();
  const legendSourcePix = [offsetLeft + Math.floor(sourceSize / 2), viewSizePix[1] - offsetBottom]; // Bottom left corner
  const legendSource = aladin.pix2world(legendSourcePix[0], legendSourcePix[1]);
  catalog.addSources(A.source(legendSource[0], legendSource[1]));
  let layer = A.graphicOverlay({ color: color, lineWidth: 2 });
  aladin.addOverlay(layer);
  layer.add(new Text(legendSourcePix[0] + textSpacingLeft, legendSourcePix[1], label, { color: color, align: 'start', baseline: 'middle' }));
};

const addCatalog = (aladin, coordinates, options) => {
  const label = options['label'] || '';
  const color = options['color'] || 'red';
  const offsetBottom = options['offsetBottom'] || this.legendOffsetBottom;
  const offsetLeft = options['offsetLeft'] || this.legendItemsOffsetLeft;
  const shape = options['shape'] || 'circle';
  const sourceSize = options['sourceSize'] || this.patternSourceSize;
  const legendSourceSize = options['legendSourceSize'] || this.legendSourceSize;
  // Create a catalog and sources to it
  let catalog = A.catalog({ color: color, sourceSize: sourceSize, shape: shape });
  aladin.addCatalog(catalog);
  for (let coordinate of coordinates) {
    catalog.addSources(A.source(coordinate[0], coordinate[1]));
  }
  // Add a legend if there are sources
  if (coordinates.length > 0) {
    addLegendForCatalog(aladin, {
      offsetBottom: offsetBottom,
      offsetLeft: offsetLeft,
      color: color,
      label: label,
      sourceSize: legendSourceSize,
      shape: shape
    });
  }
};

const setColorMap = aladin => {
  aladin
    .getBaseImageLayer()
    .getColorMap()
    .update('grayscale');
};

const addFillBackground = (aladin, color) => {
  let layer = A.graphicOverlay();
  aladin.addOverlay(layer);
  let viewSize = aladin.getSize();
  layer.add(new Rectangle(0, 0, viewSize[0], viewSize[1], { color: color, globalCompositeOperation: 'destination-over' }));
};

const removeReticleEventHandlers = () => {
  // There are event handlers to allow a user to drag the aladin view around, and also
  // zoom in and out of the view. This function disables those event handlers if they are not wanted.

  // TODO: Search for the specific reticle canvas within a provided plot ID
  $('.aladin-reticleCanvas').unbind();
};

export { addText, addPolyline, addScaleBar, addCatalog, addLegendForCatalog, setColorMap, addFillBackground, removeReticleEventHandlers };
