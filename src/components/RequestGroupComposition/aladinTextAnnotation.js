export default class TextAnnotation {
  // The AladinLite API does not provide a way to draw arbitrary text at an arbitrary location in an overlay layer.
  // This implements the methods necessary to do so when provided as an input to layer.add(). This approach was
  // preferable to the others (possibilities included directly getting and drawing on the actual canvas element that the
  // other overlay elements are drawn on, or creating another canvas element and placing it directly on top of
  // the others) as the text that is drawn will then be integrated with the draw/destroy/redraw loops within aladin,
  // and the text will show up in the generated data url that is used for saving an image without having to do anything extra.

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
