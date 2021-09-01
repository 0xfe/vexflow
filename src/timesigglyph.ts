import { defined } from './util';
import { Glyph, GlyphMetrics } from './glyph';
import { TimeSignature } from './timesignature';

export class TimeSignatureGlyph extends Glyph {
  timeSignature: TimeSignature;
  topStartX: number;
  botStartX: number;
  width: number;
  xMin: number;

  constructor(
    timeSignature: TimeSignature,
    topDigits: string[],
    botDigits: string[],
    code: string,
    point: number,
    options?: { category: string }
  ) {
    super(code, point, options);
    this.timeSignature = timeSignature;
    this.topGlyphs = [];
    this.botGlyphs = [];

    let topWidth = 0;
    for (let i = 0; i < topDigits.length; ++i) {
      const num = topDigits[i];
      const topGlyph = new Glyph('timeSig' + num, this.timeSignature.point);

      this.topGlyphs.push(topGlyph);
      topWidth += topGlyph.getMetrics().width ?? 0;
    }

    let botWidth = 0;
    for (let i = 0; i < botDigits.length; ++i) {
      const num = botDigits[i];
      const botGlyph = new Glyph('timeSig' + num, this.timeSignature.point);

      this.botGlyphs.push(botGlyph);
      botWidth += defined(botGlyph.getMetrics().width);
    }

    this.width = Math.max(topWidth, botWidth);
    this.xMin = this.getMetrics().x_min;
    this.topStartX = (this.width - topWidth) / 2.0;
    this.botStartX = (this.width - botWidth) / 2.0;
    this.reset();
  }

  getMetrics(): GlyphMetrics {
    return {
      x_min: this.xMin,
      x_max: this.xMin + this.width,
      width: this.width,
    } as GlyphMetrics;
  }

  renderToStave(x: number): void {
    const stave = this.checkStave();

    let start_x = x + this.topStartX;
    for (let i = 0; i < this.topGlyphs.length; ++i) {
      const glyph = this.topGlyphs[i];
      Glyph.renderOutline(
        this.checkContext(),
        glyph.getMetrics().outline,
        this.scale,
        start_x + this.x_shift,
        stave.getYForLine(this.timeSignature.topLine)
      );
      start_x += defined(glyph.getMetrics().width);
    }

    start_x = x + this.botStartX;
    for (let i = 0; i < this.botGlyphs.length; ++i) {
      const glyph = this.botGlyphs[i];
      this.timeSignature.placeGlyphOnLine(glyph, stave, 0);
      Glyph.renderOutline(
        this.checkContext(),
        glyph.getMetrics().outline,
        this.scale,
        start_x + glyph.getMetrics().x_shift,
        stave.getYForLine(this.timeSignature.bottomLine)
      );
      start_x += defined(glyph.getMetrics().width);
    }
  }
}
