// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { BoundingBox } from './boundingbox';
import { BoundingBoxComputation } from './boundingboxcomputation';
import { Element } from './element';
import { Font, FontGlyph } from './font';
import { RenderContext } from './rendercontext';
import { Stave } from './stave';
import { Tables } from './tables';
import { Category } from './typeguard';
import { defined, RuntimeError } from './util';

export interface GlyphProps {
  code_head: string;
  ledger_code_head?: string;
  dot_shiftY: number;
  position: string;
  rest: boolean;
  line_below: number;
  line_above: number;
  stem_beam_extension: number;
  stem_up_extension: number;
  stem_down_extension: number;
  stem: boolean;
  code?: string;
  code_flag_upstem?: string;
  code_flag_downstem?: string;
  flag?: boolean;
  width?: number;
  text?: string;
  tabnote_stem_down_extension: number;
  tabnote_stem_up_extension: number;
  beam_count: number;
  shift_y?: number;
  getWidth(a?: number): number;
}

export interface GlyphOptions {
  category?: string;
}

export interface GlyphMetrics {
  width: number;
  height: number;
  x_min: number;
  x_max: number;
  x_shift: number;
  y_shift: number;
  scale: number;
  ha: number;
  outline: number[];
  font: Font;
}

export const enum OutlineCode {
  MOVE = 0,
  LINE = 1,
  QUADRATIC = 2,
  BEZIER = 3,
}

class GlyphCacheEntry {
  metrics: GlyphMetrics;
  bbox: BoundingBox;
  point: number = -1;

  constructor(fontStack: Font[], code: string, category?: string) {
    this.metrics = Glyph.loadMetrics(fontStack, code, category);
    this.bbox = Glyph.getOutlineBoundingBox(
      this.metrics.outline,
      this.metrics.scale,
      this.metrics.x_shift,
      this.metrics.y_shift
    );

    if (category) {
      this.point = Glyph.lookupFontMetric(this.metrics.font, category, code, 'point', -1);
    }
  }
}

class GlyphCache {
  protected cache: Map<string, Record<string, GlyphCacheEntry>> = new Map();

  lookup(code: string, category?: string): GlyphCacheEntry {
    let entries = this.cache.get(Glyph.CURRENT_CACHE_KEY);
    if (entries === undefined) {
      entries = {};
      this.cache.set(Glyph.CURRENT_CACHE_KEY, entries);
    }
    const key = category ? `${code}%${category}` : code;
    let entry = entries[key];
    if (entry === undefined) {
      entry = new GlyphCacheEntry(Glyph.MUSIC_FONT_STACK, code, category);
      entries[key] = entry;
    }
    return entry;
  }
}

class GlyphOutline {
  private i: number = 0;
  private precision = 1;

  constructor(private outline: number[], private originX: number, private originY: number, private scale: number) {
    // Automatically assign private properties: this.outline, this.originX, this.originY, and this.scale.
    this.precision = Math.pow(10, Tables.RENDER_PRECISION_PLACES);
  }

  done(): boolean {
    return this.i >= this.outline.length;
  }
  next(): number {
    return Math.round((this.outline[this.i++] * this.precision) / this.precision);
  }
  nextX(): number {
    return Math.round((this.originX + this.outline[this.i++] * this.scale) * this.precision) / this.precision;
  }
  nextY(): number {
    return Math.round((this.originY - this.outline[this.i++] * this.scale) * this.precision) / this.precision;
  }

  static parse(str: string): number[] {
    const result: number[] = [];
    const parts = str.split(' ');
    let i = 0;
    while (i < parts.length) {
      switch (parts[i++]) {
        case 'm':
          result.push(OutlineCode.MOVE, parseInt(parts[i++]), parseInt(parts[i++]));
          break;
        case 'l':
          result.push(OutlineCode.LINE, parseInt(parts[i++]), parseInt(parts[i++]));
          break;
        case 'q':
          result.push(
            OutlineCode.QUADRATIC,
            parseInt(parts[i++]),
            parseInt(parts[i++]),
            parseInt(parts[i++]),
            parseInt(parts[i++])
          );
          break;
        case 'b':
          result.push(
            OutlineCode.BEZIER,
            parseInt(parts[i++]),
            parseInt(parts[i++]),
            parseInt(parts[i++]),
            parseInt(parts[i++]),
            parseInt(parts[i++]),
            parseInt(parts[i++])
          );
          break;
      }
    }
    return result;
  }
}

export class Glyph extends Element {
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // STATIC MEMBERS

  static get CATEGORY(): string {
    return Category.Glyph;
  }

  protected static cache = new GlyphCache();

  // The current cache key for GlyphCache above.
  // Computed when Flow.setMusicFont(...) is called.
  // It is set to a comma separated list of font names.
  public static CURRENT_CACHE_KEY: string = '';

  // Used by the GlyphCache above.
  // Set when Flow.setMusicFont(...) is called.
  public static MUSIC_FONT_STACK: Font[] = [];

  /**
   * Pass a key of the form `glyphs.{category}.{code}.{key}` to Font.lookupMetric(). If the initial lookup fails,
   * try again with the path `glyphs.{category}.{key}`. If the second lookup fails, return the defaultValue.
   *
   * @param font
   * @param category any metric path under 'glyphs', so 'stem.up' could resolve to glyphs.stem.up.shiftX, glyphs.stem.up.shiftY, etc.
   * @param code
   * @param key
   * @param defaultValue
   */
  static lookupFontMetric(font: Font, category: string, code: string, key: string, defaultValue: number): number {
    let value = font.lookupMetric(`glyphs.${category}.${code}.${key}`, undefined);
    if (value === undefined) {
      // The first lookup failed, so we omit .${code} and try again (with a defaultValue this time).
      value = font.lookupMetric(`glyphs.${category}.${key}`, defaultValue);
    }
    return value;
  }

  static lookupGlyph(fontStack: Font[], code: string): { font: Font; glyph: FontGlyph } {
    defined(fontStack, 'BadFontStack', 'Font stack is misconfigured');

    let glyph: FontGlyph;
    let font: Font;
    for (let i = 0; i < fontStack.length; i++) {
      font = fontStack[i];
      glyph = font.getGlyphs()[code];
      if (glyph) return { glyph, font };
    }

    throw new RuntimeError('BadGlyph', `Glyph ${code} does not exist in font.`);
  }

  static loadMetrics(fontStack: Font[], code: string, category?: string): GlyphMetrics {
    const { glyph, font } = Glyph.lookupGlyph(fontStack, code);

    if (!glyph.o) throw new RuntimeError('BadGlyph', `Glyph ${code} has no outline defined.`);

    let x_shift = 0;
    let y_shift = 0;
    let scale = 1;
    if (category && font) {
      x_shift = Glyph.lookupFontMetric(font, category, code, 'shiftX', 0);
      y_shift = Glyph.lookupFontMetric(font, category, code, 'shiftY', 0);
      scale = Glyph.lookupFontMetric(font, category, code, 'scale', 1);
    }

    const x_min = glyph.x_min;
    const x_max = glyph.x_max;
    const ha = glyph.ha;

    if (!glyph.cached_outline) {
      glyph.cached_outline = GlyphOutline.parse(glyph.o);
    }

    return {
      x_min,
      x_max,
      x_shift,
      y_shift,
      scale,
      ha,
      outline: glyph.cached_outline,
      font,
      width: x_max - x_min,
      height: ha,
    };
  }

  /**
   * Renders glyphs from the default font stack.
   *
   * @param ctx Canvas or SVG context
   * @param x_pos x coordinate
   * @param y_pos y coordinate
   * @param point the point size of the font
   * @param code the glyph code in font.getGlyphs()
   * @param options
   * @returns
   */
  static renderGlyph(
    ctx: RenderContext,
    x_pos: number,
    y_pos: number,
    point: number,
    code: string,
    options?: { category?: string; scale?: number }
  ): GlyphMetrics {
    const data = Glyph.cache.lookup(code, options?.category);
    const metrics = data.metrics;
    if (data.point != -1) {
      point = data.point;
    }

    const customScale = options?.scale ?? 1;
    const scale = ((point * 72.0) / (metrics.font.getResolution() * 100.0)) * metrics.scale * customScale;

    Glyph.renderOutline(
      ctx,
      metrics.outline,
      scale,
      x_pos + metrics.x_shift * customScale,
      y_pos + metrics.y_shift * customScale
    );
    return metrics;
  }

  static renderOutline(ctx: RenderContext, outline: number[], scale: number, x_pos: number, y_pos: number): void {
    const go = new GlyphOutline(outline, x_pos, y_pos, scale);

    ctx.beginPath();
    let x, y: number;
    while (!go.done()) {
      switch (go.next()) {
        case OutlineCode.MOVE:
          ctx.moveTo(go.nextX(), go.nextY());
          break;
        case OutlineCode.LINE:
          ctx.lineTo(go.nextX(), go.nextY());
          break;
        case OutlineCode.QUADRATIC:
          x = go.nextX();
          y = go.nextY();
          ctx.quadraticCurveTo(go.nextX(), go.nextY(), x, y);
          break;
        case OutlineCode.BEZIER:
          x = go.nextX();
          y = go.nextY();
          ctx.bezierCurveTo(go.nextX(), go.nextY(), go.nextX(), go.nextY(), x, y);
          break;
      }
    }
    ctx.fill();
  }

  static getOutlineBoundingBox(outline: number[], scale: number, x_pos: number, y_pos: number): BoundingBox {
    const go = new GlyphOutline(outline, x_pos, y_pos, scale);
    const bboxComp = new BoundingBoxComputation();

    // (penX, penY) hold the pen position: the start of each stroke.
    let penX: number = x_pos;
    let penY: number = y_pos;
    let x, y: number;
    while (!go.done()) {
      switch (go.next()) {
        case OutlineCode.MOVE:
          // Note that we don't add any points to the bounding box until a srroke is actually drawn.
          penX = go.nextX();
          penY = go.nextY();
          break;
        case OutlineCode.LINE:
          bboxComp.addPoint(penX, penY);
          penX = go.nextX();
          penY = go.nextY();
          bboxComp.addPoint(penX, penY);
          break;
        case OutlineCode.QUADRATIC:
          x = go.nextX();
          y = go.nextY();
          bboxComp.addQuadraticCurve(penX, penY, go.nextX(), go.nextY(), x, y);
          penX = x;
          penY = y;
          break;
        case OutlineCode.BEZIER:
          x = go.nextX();
          y = go.nextY();
          bboxComp.addBezierCurve(penX, penY, go.nextX(), go.nextY(), go.nextX(), go.nextY(), x, y);
          penX = x;
          penY = y;
          break;
      }
    }

    return new BoundingBox(bboxComp.getX1(), bboxComp.getY1(), bboxComp.width(), bboxComp.height());
  }

  static getWidth(code: string, point: number, category?: string): number {
    const data = Glyph.cache.lookup(code, category);
    if (data.point != -1) {
      point = data.point;
    }
    const scale = (point * 72) / (data.metrics.font.getResolution() * 100);
    return data.bbox.getW() * scale;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // INSTANCE MEMBERS

  bbox: BoundingBox = new BoundingBox(0, 0, 0, 0);
  code: string;
  // metrics is initialized in the constructor by reset() or setOptions() which calls reset().
  // eslint-disable-next-line
  metrics!: GlyphMetrics;
  topGlyphs: Glyph[] = [];
  botGlyphs: Glyph[] = [];

  protected options: GlyphOptions = {};
  protected originShift: { x: number; y: number };
  protected x_shift: number;
  protected y_shift: number;
  scale: number = 1;
  protected point: number;
  protected stave?: Stave;

  /**
   * @param code
   * @param point
   * @param options
   */
  constructor(code: string, point: number, options?: GlyphOptions) {
    super();

    this.code = code;
    this.point = point;

    this.originShift = { x: 0, y: 0 };
    this.x_shift = 0;
    this.y_shift = 0;

    if (options) {
      this.setOptions(options);
    } else {
      this.reset();
    }
  }

  // eslint-disable-next-line
  draw(...args: any[]): void {
    // DO NOTHING.
  }

  getCode(): string {
    return this.code;
  }

  // eslint-disable-next-line
  setOptions(options: any): void {
    this.options = { ...this.options, ...options };
    this.reset();
  }

  setPoint(point: number): this {
    this.point = point;
    return this;
  }

  setStave(stave: Stave): this {
    this.stave = stave;
    return this;
  }

  getXShift(): number {
    return this.x_shift;
  }

  setXShift(x_shift: number): this {
    this.x_shift = x_shift;
    return this;
  }

  getYshift(): number {
    return this.y_shift;
  }

  setYShift(y_shift: number): this {
    this.y_shift = y_shift;
    return this;
  }

  reset(): void {
    const data = Glyph.cache.lookup(this.code, this.options.category);
    this.metrics = data.metrics;
    // Override point from metrics file
    if (data.point != -1) {
      this.point = data.point;
    }

    this.scale = (this.point * 72) / (this.metrics.font.getResolution() * 100);
    this.bbox = new BoundingBox(
      data.bbox.getX() * this.scale,
      data.bbox.getY() * this.scale,
      data.bbox.getW() * this.scale,
      data.bbox.getH() * this.scale
    );
  }

  checkMetrics(): GlyphMetrics {
    return defined(this.metrics, 'BadGlyph', `Glyph ${this.code} is not initialized.`);
  }

  getMetrics(): GlyphMetrics {
    const metrics = this.checkMetrics();
    const metricsScale = metrics.scale;
    return {
      x_min: metrics.x_min * this.scale * metricsScale,
      x_max: metrics.x_max * this.scale * metricsScale,
      width: this.bbox.getW(),
      height: this.bbox.getH(),
      scale: this.scale * metricsScale,
      x_shift: metrics.x_shift,
      y_shift: metrics.y_shift,
      outline: metrics.outline,
      font: metrics.font,
      ha: metrics.ha,
    };
  }

  setOriginX(x: number): void {
    const { bbox } = this;
    const originX = Math.abs(bbox.getX() / bbox.getW());
    const xShift = (x - originX) * bbox.getW();
    this.originShift.x = -xShift;
  }

  setOriginY(y: number): void {
    const { bbox } = this;
    const originY = Math.abs(bbox.getY() / bbox.getH());
    const yShift = (y - originY) * bbox.getH();
    this.originShift.y = -yShift;
  }

  setOrigin(x: number, y: number): void {
    this.setOriginX(x);
    this.setOriginY(y);
  }

  render(ctx: RenderContext, x: number, y: number): void {
    const metrics = this.checkMetrics();

    const outline = metrics.outline;
    const scale = this.scale * metrics.scale;

    this.setRendered();
    this.applyStyle(ctx);
    const xPos = x + this.originShift.x + metrics.x_shift;
    const yPos = y + this.originShift.y + metrics.y_shift;
    Glyph.renderOutline(ctx, outline, scale, xPos, yPos);
    this.restoreStyle(ctx);
  }

  checkStave(): Stave {
    return defined(this.stave, 'NoStave', 'No stave attached to instance.');
  }

  renderToStave(x: number): void {
    const context = this.checkContext();
    const metrics = this.checkMetrics();
    const stave = this.checkStave();

    const outline = metrics.outline;
    const scale = this.scale * metrics.scale;

    this.setRendered();
    this.applyStyle();

    const xPos = x + this.x_shift + metrics.x_shift;
    const yPos = stave.getYForGlyphs() + this.y_shift + metrics.y_shift;
    Glyph.renderOutline(context, outline, scale, xPos, yPos);
    this.restoreStyle();
  }
}
