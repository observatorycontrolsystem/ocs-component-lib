export default class Text {
  /* Draw text on an aladin instance.
  
  To add text to an overlay on the aladin instance:
  
    let layer = A.graphicOverlay();
    aladin.addOverlay(layer);
    layer.add(new Text(20, 20, 'Something interesting', { color: 'red' }));

  */
  constructor(x, y, text, options) {
    options = options || {};
    this.x = x || undefined;
    this.y = y || undefined;
    this.text = text || '';
    this.color = options['color'] || undefined;
    this.align = options['align'] || 'center';
    this.baseline = options['baseline'] || 'alphabetic';
    this.overlay = null;
  }

  setOverlay(overlay) {
    this.overlay = overlay;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.font = '15px Arial';
    ctx.textAlign = this.align;
    ctx.textBaseline = this.baseline;
    ctx.fillText(this.text, this.x, this.y);
  }
}
