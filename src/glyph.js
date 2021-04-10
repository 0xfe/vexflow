// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { Vex } from './vex';
import { Flow } from './tables';
import { Element } from './element';
import { BoundingBoxComputation } from './boundingboxcomputation';
import { BoundingBox } from './boundingbox';

function processOutline(outline, originX, originY, scaleX, scaleY, outlineFns) {
  let command;
  let x;
  let y;
  let i = 0;

  function nextX() {
    return originX + outline[i++] * scaleX;
  }
  function nextY() {
    return originY + outline[i++] * scaleY;
  }
  function doOutline(command, ...args) {
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
  /*
    Static methods used to implement loading and rendering glyphs.

    Below categoryPath can be any metric path under 'glyphs', so stem.up would respolve
    to glyphs.stem.up.shifX, glyphs.stem.up.shiftY, etc.
  */
  static lookupFontMetric({ font, category, code, key, defaultValue }) {
    let value = font.lookupMetric(`glyphs.${category}.${code}.${key}`, null);
    if (value === null) {
      value = font.lookupMetric(`glyphs.${category}.${key}`, defaultValue);
    }
    return value;
  }

  static lookupGlyph(fontStack, code) {
    if (!fontStack) {
      throw Vex.RERR('BAD_FONTSTACK', 'Font stack is misconfigured');
    }

    let glyph;
    let font;
    for (let i = 0; i < fontStack.length; i++) {
      font = fontStack[i];
      glyph = font.getGlyphs()[code];
      if (glyph) break;
    }

    if (!glyph) {
      throw new Vex.RERR('BadGlyph', `Glyph ${code} does not exist in font.`);
    }

    return { glyph, font };
  }

  static loadMetrics(fontStack, code, category = null) {
    const { glyph, font } = Glyph.lookupGlyph(fontStack, code);

    const x_shift = category
      ? Glyph.lookupFontMetric({
          font,
          category,
          code,
          key: 'shiftX',
          defaultValue: 0,
        })
      : 0;
    const y_shift = category
      ? Glyph.lookupFontMetric({
          font,
          category,
          code,
          key: 'shiftY',
          defaultValue: 0,
        })
      : 0;
    const scale = category
      ? Glyph.lookupFontMetric({
          font,
          category,
          code,
          key: 'scale',
          defaultValue: 1,
        })
      : 1;

    const x_min = glyph.x_min;
    const x_max = glyph.x_max;
    const ha = glyph.ha;

    let outline;

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
   *
   * @param {!Object} ctx The canvas context.
   * @param {number} x_pos X coordinate.
   * @param {number} y_pos Y coordinate.
   * @param {number} point The point size to use.
   * @param {string} val The glyph code in font.getGlyphs()
   */
  static renderGlyph(ctx, x_pos, y_pos, point, val, options) {
    const params = {
      fontStack: Flow.DEFAULT_FONT_STACK,
      category: null,
      ...options,
    };
    const metrics = Glyph.loadMetrics(params.fontStack, val, params.category);
    point = params.category
      ? Glyph.lookupFontMetric({
          font: metrics.font,
          category: params.category,
          code: val,
          key: 'point',
          defaultValue: point,
        })
      : point;
    const scale = (point * 72.0) / (metrics.font.getResolution() * 100.0);

    Glyph.renderOutline(
      ctx,
      metrics.outline,
      scale * metrics.scale,
      x_pos + metrics.x_shift,
      y_pos + metrics.y_shift,
      options
    );
    return metrics;
  }

  static renderOutline(ctx, outline, scale, x_pos, y_pos, options) {
    ctx.beginPath();
    ctx.moveTo(x_pos, y_pos);
    processOutline(
      outline,
      x_pos,
      y_pos,
      scale,
      -scale,
      {
        m: ctx.moveTo.bind(ctx),
        l: ctx.lineTo.bind(ctx),
        q: ctx.quadraticCurveTo.bind(ctx),
        b: ctx.bezierCurveTo.bind(ctx),
        // z: ctx.fill.bind(ctx), // ignored
      },
      options
    );
    ctx.fill();
  }

  static getOutlineBoundingBox(outline, scale, x_pos, y_pos) {
    const bboxComp = new BoundingBoxComputation();

    processOutline(outline, x_pos, y_pos, scale, -scale, {
      m: bboxComp.addPoint.bind(bboxComp),
      l: bboxComp.addPoint.bind(bboxComp),
      q: bboxComp.addQuadraticCurve.bind(bboxComp),
      b: bboxComp.addBezierCurve.bind(bboxComp),
      z: bboxComp.noOp.bind(bboxComp),
    });

    return new BoundingBox(bboxComp.x1, bboxComp.y1, bboxComp.width(), bboxComp.height());
  }

  /**
   * @constructor
   */
  constructor(code, point, options) {
    super();
    this.setAttribute('type', 'Glyph');

    this.code = code;
    this.point = point;
    this.options = {
      fontStack: this.getFontStack(),
      category: null,
    };

    this.metrics = null;
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

  getCode() {
    return this.code;
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
    this.reset();
  }

  setPoint(point) {
    this.point = point;
    return this;
  }
  setStave(stave) {
    this.stave = stave;
    return this;
  }
  setXShift(x_shift) {
    this.x_shift = x_shift;
    return this;
  }
  setYShift(y_shift) {
    this.y_shift = y_shift;
    return this;
  }

  reset() {
    this.metrics = Glyph.loadMetrics(this.options.fontStack, this.code, this.options.category);
    // Override point from metrics file
    this.point = this.options.category
      ? Glyph.lookupFontMetric({
          category: this.options.category,
          font: this.metrics.font,
          code: this.code,
          key: 'point',
          defaultValue: this.point,
        })
      : this.point;

    this.scale = (this.point * 72) / (this.metrics.font.getResolution() * 100);
    this.bbox = Glyph.getOutlineBoundingBox(
      this.metrics.outline,
      this.scale * this.metrics.scale,
      this.metrics.x_shift,
      this.metrics.y_shift
    );
  }

  getMetrics() {
    if (!this.metrics) {
      throw new Vex.RuntimeError('BadGlyph', `Glyph ${this.code} is not initialized.`);
    }

    return {
      x_min: this.metrics.x_min * this.scale * this.metrics.scale,
      x_max: this.metrics.x_max * this.scale * this.metrics.scale,
      width: this.bbox.getW(),
      height: this.bbox.getH(),
    };
  }

  setOriginX(x) {
    const { bbox } = this;
    const originX = Math.abs(bbox.getX() / bbox.getW());
    const xShift = (x - originX) * bbox.getW();
    this.originShift.x = -xShift;
  }

  setOriginY(y) {
    const { bbox } = this;
    const originY = Math.abs(bbox.getY() / bbox.getH());
    const yShift = (y - originY) * bbox.getH();
    this.originShift.y = -yShift;
  }

  setOrigin(x, y) {
    this.setOriginX(x);
    this.setOriginY(y);
  }

  render(ctx, x, y) {
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

  renderToStave(x) {
    this.checkContext();

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
      this.context,
      outline,
      scale,
      x + this.x_shift + this.metrics.x_shift,
      this.stave.getYForGlyphs() + this.y_shift + this.metrics.y_shift
    );
    this.restoreStyle();
  }
}
