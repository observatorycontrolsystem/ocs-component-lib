/* global A */
import $ from 'jquery';
import _ from 'lodash';

import Text from '@/components/Plots/aladinText';
import Rectangle from '@/components/Plots/aladinRectangle';
import { cosineDeclinationTerm, offsetCoordinate, rotateCoordinate } from '@/util';

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
  color = color || 'cyan';
  textSpacing = textSpacing || 15;
  lineWidth = lineWidth || 2;
  const offsetBottom = offsetPixFromEdge['bottom'] || 30;
  const offsetleft = offsetPixFromEdge['left'] || 30;
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
  const offsetBottom = options['offsetBottom'] || 30;
  const offsetLeft = options['offsetLeft'] || 30;
  const sourceSize = options['sourceSize'] || 10;
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
  const offsetBottom = options['offsetBottom'] || 30;
  const offsetLeft = options['offsetLeft'] || 30;
  const shape = options['shape'] || 'circle';
  const sourceSize = options['sourceSize'] || 20;
  const legendSourceSize = options['legendSourceSize'] || 15;
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

const getPathAnnotations = (pointings, pathSizeArcSec, origin) => {
  // Get a list of lists, where each internal list is a collection of RA/Dec pairs whose progression defines a path. The first pointing
  // in the path is indicated with a triangle, and the last is indicated with an X. Each step along the path is indicated with an arrow
  // that is pointing in the directing of the next step along the path.
  // Arguments:
  //   `pointings`: List of coordinate pairs defining the pointings in the form of [{ ra: '', dec: ''}, ...].
  //   `pathSizeArcSec`: A size in arcseconds used to scale the arrows, starting triangle, and ending X.
  //   `origin`: A single { ra: '', dec: ''} pair used to define what to rotate the closing X markers around, to
  //       be able to draw it rotated with respect to the path.
  let arrows;
  let coord;
  let nextCoord;
  let annotations = [];
  for (let j = 0; j < pointings.length; j++) {
    arrows = [];
    coord = { ra: pointings[j].ra, dec: pointings[j].dec };
    if (j < pointings.length - 1) {
      nextCoord = { ra: pointings[j + 1].ra, dec: pointings[j + 1].dec };
      // h and w are just reasonable scale factors for drawing a small arrow
      let h = (pathSizeArcSec / 10.0) * Math.sqrt(3);
      let w = pathSizeArcSec / 10.0;
      let Ux = (nextCoord.ra - coord.ra) * cosineDeclinationTerm(nextCoord.dec);
      let Uy = nextCoord.dec - coord.dec;
      let diffLength = Math.sqrt(Math.pow(Ux, 2) + Math.pow(Uy, 2));
      Ux /= diffLength;
      Uy /= diffLength;
      let shiftedCenter;
      if (j === 0) {
        shiftedCenter = coord;
      } else {
        shiftedCenter = offsetCoordinate(coord, { ra: 2 * w * Ux, dec: 2 * w * Uy });
      }
      arrows.push(offsetCoordinate(shiftedCenter, { ra: -h * Ux + w * -Uy, dec: -h * Uy + w * Ux }));
      arrows.push(shiftedCenter);
      arrows.push(offsetCoordinate(shiftedCenter, { ra: -h * Ux - w * -Uy, dec: -h * Uy - w * Ux }));
      if (j === 0) {
        // Close the arrow to form a triangle for the first position
        arrows.push(offsetCoordinate(shiftedCenter, { ra: -h * Ux + w * -Uy, dec: -h * Uy + w * Ux }));
      }
      annotations.push(
        _.map(arrows, i => {
          return [i['ra'], i['dec']];
        })
      );
      // add a line between this coordinates center and the next
      annotations.push([
        [coord.ra, coord.dec],
        [nextCoord.ra, nextCoord.dec]
      ]);
    } else {
      let end = [];
      end.push(offsetCoordinate(coord, rotateCoordinate({ ra: pathSizeArcSec / 9.0, dec: 0 }, origin, 45)));
      end.push(offsetCoordinate(coord, rotateCoordinate({ ra: -pathSizeArcSec / 9.0, dec: 0 }, origin, 45)));
      end.push(coord);
      end.push(offsetCoordinate(coord, rotateCoordinate({ ra: 0, dec: pathSizeArcSec / 9.0 }, origin, 45)));
      end.push(offsetCoordinate(coord, rotateCoordinate({ ra: 0, dec: -pathSizeArcSec / 9.0 }, origin, 45)));
      annotations.push(
        _.map(end, i => {
          return [i['ra'], i['dec']];
        })
      );
    }
  }
  return annotations;
};

export {
  addText,
  addPolyline,
  addScaleBar,
  addCatalog,
  addLegendForCatalog,
  getPathAnnotations,
  setColorMap,
  addFillBackground,
  removeReticleEventHandlers
};
