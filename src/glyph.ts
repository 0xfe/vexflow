// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { Vex } from './vex';
import { Flow } from './tables';
import { Element } from './element';
import { BoundingBoxComputation } from './boundingboxcomputation';
import { BoundingBox } from './boundingbox';
import { Font, FontGlyph } from './font';
import { RenderContext, TypeProps } from './types/common';
import { Stave } from './stave';
import { Stem } from './stem';

export interface DurationCode {
  common: TypeProps;
  type: Record<string, TypeProps>;
}

export interface GlyphProps {
  code_head: string;
  dot_shiftY: number;
  position: string;
  rest: boolean;
  line_below: number;
  line_above: number;
  stem_up_extension: number;
  stem_down_extension: number;
  stem: Stem;
  code: string;
  code_flag_upstem: string;
  code_flag_downstem: string;
  flag: boolean;
  width: number;
  text: string;
  tabnote_stem_down_extension: number;
  tabnote_stem_up_extension: number;
  beam_count: number;
  duration_codes: Record<string, DurationCode>;
  validTypes: Record<string, string>;
  shift_y: number;

  getWidth(a?: number): number;

  getMetrics(): GlyphMetrics;
}
export interface GlyphOptions {
  fontStack: Font[];
  category?: string;
}
export interface GlyphMetrics {
  width?: number;
  height?: number;
  x_min: number;
  x_max: number;
  x_shift: number;
  y_shift: number;
  scale: number;
  ha?: number;
  outline: string[];
  font?: Font;
}

function processOutline(
  outline: string[],
  originX: number,
  originY: number,
  scaleX: number,
  scaleY: number,
  // eslint-disable-next-line
  outlineFns: Record<string, ((...args: any[]) => void) >
): void {
  let command: string;
  let x: number;
  let y: number;
  let i = 0;

  function nextX(): number {
    return originX + parseInt(outline[i++]) * scaleX;
  }
  function nextY(): number {
    return originY + parseInt(outline[i++]) * scaleY;
  }
  // eslint-disable-next-line
  function doOutline(command: string, ...args: any[]) {
    outlineFns[command](...args);
  }

  while (i < outline.length) {
    command = outline[i++];
    switch (command) {
      case 'm':
      case 'l':
        doOutline(command, nextX(), nextY());
        break;
      case 'q':
        x = nextX();
        y = nextY();
        doOutline(command, nextX(), nextY(), x, y);
        break;
      case 'b':
        x = nextX();
        y = nextY();
        doOutline(command, nextX(), nextY(), nextX(), nextY(), x, y);
        break;
      case 'z':
        break;
      default:
        break;
    }
  }
}

export class Glyph extends Element {
  bbox: BoundingBox = new BoundingBox(0, 0, 0, 0);
  code: string;
  metrics?: GlyphMetrics;
  topGlyphs: Glyph[] = [];
  botGlyphs: Glyph[] = [];

  protected options: GlyphOptions;
  protected originShift: { x: number; y: number };
  protected x_shift: number;
  protected y_shift: number;
  scale: number = 1;
  protected point: number;
  protected stave?: Stave;

  // eslint-disable-next-line
  draw() {};

  /*
    Static methods used to implement loading and rendering glyphs.

    Below categoryPath can be any metric path under 'glyphs', so stem.up would respolve
    to glyphs.stem.up.shifX, glyphs.stem.up.shiftY, etc.
  */
  static lookupFontMetric({
    font,
    category,
    code,
    key,
    defaultValue,
  }: {
    font: Font;
    category: string;
    code: string;
    key: string;
    defaultValue: number;
  }): number {
    let value = font.lookupMetric(`glyphs.${category}.${code}.${key}`, undefined);
    if (value === undefined) {
      value = font.lookupMetric(`glyphs.${category}.${key}`, defaultValue);
    }
    return value;
  }

  static lookupGlyph(fontStack: Font[], code: string): { font: Font; glyph: FontGlyph } {
    if (!fontStack) {
      throw new Vex.RERR('BAD_FONTSTACK', 'Font stack is misconfigured');
    }

    let glyph: FontGlyph;
    let font: Font;
    for (let i = 0; i < fontStack.length; i++) {
      font = fontStack[i];
      glyph = font.getGlyphs()[code];
      if (glyph) return { glyph, font };
    }

    throw new Vex.RERR('BadGlyph', `Glyph ${code} does not exist in font.`);
  }

  static loadMetrics(fontStack: Font[], code: string, category?: string): GlyphMetrics {
    const { glyph, font } = Glyph.lookupGlyph(fontStack, code);

    let x_shift = 0;
    let y_shift = 0;
    let scale = 1;
    if (category && font) {
      x_shift = Glyph.lookupFontMetric({ font, category, code, key: 'shiftX', defaultValue: 0 });
      y_shift = Glyph.lookupFontMetric({ font, category, code, key: 'shiftY', defaultValue: 0 });
      scale = Glyph.lookupFontMetric({ font, category, code, key: 'scale', defaultValue: 1 });
    }

    const x_min = glyph.x_min;
    const x_max = glyph.x_max;
    const ha = glyph.ha;

    let outline: string[];

    const CACHE = true;
    if (glyph.o) {
      if (CACHE) {
        if (glyph.cached_outline) {
          outline = glyph.cached_outline;
        } else {
          outline = glyph.o.split(' ');
          glyph.cached_outline = outline;
        }
      } else {
        if (glyph.cached_outline) delete glyph.cached_outline;
        outline = glyph.o.split(' ');
      }

      return {
        x_min,
        x_max,
        x_shift,
        y_shift,
        scale,
        ha,
        outline,
        font,
      };
    } else {
      throw new Vex.RERR('BadGlyph', `Glyph ${code} has no outline defined.`);
    }
  }

  /**
   * A quick and dirty static glyph renderer. Renders glyphs from the default
   * font defined in Vex.Flow.Font.
   */
  static renderGlyph(
    /** The canvas context. */
    ctx: RenderContext,
    /** X coordinate. */
    x_pos: number,
    /** Y coordinate. */
    y_pos: number,
    /** The point size to use. */
    point: number,
    /** The glyph code in font.getGlyphs() */
    val: string,
    options?: { font?: Font; category: string }
  ): GlyphMetrics {
    const params = {
      fontStack: Flow.DEFAULT_FONT_STACK,
      ...options,
    };
    const metrics = Glyph.loadMetrics(params.fontStack, val, params.category);
    if (params.category && metrics.font) {
      point = Glyph.lookupFontMetric({
        font: metrics.font,
        category: params.category,
        code: val,
        key: 'point',
        defaultValue: point,
      });
    }

    const scale = metrics.font ? (point * 72.0) / (metrics.font.getResolution() * 100.0) : 1;

    Glyph.renderOutline(ctx, metrics.outline, scale * metrics.scale, x_pos + metrics.x_shift, y_pos + metrics.y_shift);
    return metrics;
  }

  static renderOutline(ctx: RenderContext, outline: string[], scale: number, x_pos: number, y_pos: number): void {
    ctx.beginPath();
    ctx.moveTo(x_pos, y_pos);
    processOutline(outline, x_pos, y_pos, scale, -scale, {
      m: ctx.moveTo.bind(ctx),
      l: ctx.lineTo.bind(ctx),
      q: ctx.quadraticCurveTo.bind(ctx),
      b: ctx.bezierCurveTo.bind(ctx),
      // z: ctx.fill.bind(ctx), // ignored
    });
    ctx.fill();
  }

  static getOutlineBoundingBox(outline: string[], scale: number, x_pos: number, y_pos: number): BoundingBox {
    const bboxComp = new BoundingBoxComputation();

    processOutline(outline, x_pos, y_pos, scale, -scale, {
      m: bboxComp.addPoint.bind(bboxComp),
      l: bboxComp.addPoint.bind(bboxComp),
      q: bboxComp.addQuadraticCurve.bind(bboxComp),
      b: bboxComp.addBezierCurve.bind(bboxComp),
      z: bboxComp.noOp.bind(bboxComp),
    });

    return new BoundingBox(bboxComp.getX1(), bboxComp.getY1(), bboxComp.width(), bboxComp.height());
  }

  /**
   * @constructor
   */
  constructor(code: string, point: number, options?: { category: string }) {
    super();
    this.setAttribute('type', 'Glyph');

    this.code = code;
    this.point = point;
    this.options = {
      fontStack: this.getFontStack(),
    };

    this.x_shift = 0;
    this.y_shift = 0;

    this.originShift = {
      x: 0,
      y: 0,
    };

    if (options) {
      this.setOptions(options);
    } else {
      this.reset();
    }
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

  setXShift(x_shift: number): this {
    this.x_shift = x_shift;
    return this;
  }

  setYShift(y_shift: number): this {
    this.y_shift = y_shift;
    return this;
  }

  reset(): void {
    this.metrics = Glyph.loadMetrics(this.options.fontStack, this.code, this.options.category);
    // Override point from metrics file
    if (this.options.category && this.metrics?.font) {
      this.point = Glyph.lookupFontMetric({
        category: this.options.category,
        font: this.metrics.font,
        code: this.code,
        key: 'point',
        defaultValue: this.point,
      });
    }

    this.scale = this.metrics?.font ? (this.point * 72) / (this.metrics.font.getResolution() * 100) : 1;
    this.bbox = Glyph.getOutlineBoundingBox(
      this.metrics.outline,
      this.scale * this.metrics.scale,
      this.metrics.x_shift,
      this.metrics.y_shift
    );
  }

  getMetrics(): GlyphMetrics {
    if (!this.metrics) {
      throw new Vex.RuntimeError('BadGlyph', `Glyph ${this.code} is not initialized.`);
    }

    return {
      x_min: this.metrics.x_min * this.scale * this.metrics.scale,
      x_max: this.metrics.x_max * this.scale * this.metrics.scale,
      width: this.bbox.getW(),
      height: this.bbox.getH(),
      scale: this.scale * this.metrics.scale,
      x_shift: this.metrics.x_shift,
      y_shift: this.metrics.y_shift,
      outline: this.metrics.outline,
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
    if (!this.metrics) {
      throw new Vex.RuntimeError('BadGlyph', `Glyph ${this.code} is not initialized.`);
    }

    const outline = this.metrics.outline;
    const scale = this.scale * this.metrics.scale;

    this.setRendered();
    this.applyStyle(ctx);
    Glyph.renderOutline(
      ctx,
      outline,
      scale,
      x + this.originShift.x + this.metrics.x_shift,
      y + this.originShift.y + this.metrics.y_shift
    );
    this.restoreStyle(ctx);
  }

  renderToStave(x: number): void {
    const context = this.checkContext();

    if (!this.metrics) {
      throw new Vex.RuntimeError('BadGlyph', `Glyph ${this.code} is not initialized.`);
    }

    if (!this.stave) {
      throw new Vex.RuntimeError('GlyphError', 'No valid stave');
    }

    const outline = this.metrics.outline;
    const scale = this.scale * this.metrics.scale;

    this.setRendered();
    this.applyStyle();
    Glyph.renderOutline(
      context,
      outline,
      scale,
      x + this.x_shift + this.metrics.x_shift,
      this.stave.getYForGlyphs() + this.y_shift + this.metrics.y_shift
    );
    this.restoreStyle();
  }
}
