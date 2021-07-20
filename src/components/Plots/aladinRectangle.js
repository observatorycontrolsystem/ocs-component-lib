export default class Rectangle {
  /* Draw a rectangle on an aladin instance.
  
  To add a rectangle to an overlay on the aladin instance:

    let layer = A.graphicOverlay();
    aladin.addOverlay(layer);
    layer.add(new Rectangle(0, 0, 10, 10, { color: 'red' }));

  */
  constructor(x1, y1, x2, y2, options) {
    options = options || {};
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.color = options['color'] || 'black';
    this.globalCompositeOperation = options['globalCompositeOperation'] || 'destination-over';
  }

  setOverlay(overlay) {
    this.overlay = overlay;
  }

  draw(ctx) {
    let saveglobalCompositeOperation = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = this.globalCompositeOperation;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x1, this.y1, this.x2, this.y2);
    ctx.globalCompositeOperation = saveglobalCompositeOperation;
  }
}
