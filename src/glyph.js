// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { Vex } from './vex';
import { Element } from './element';
import { BoundingBoxComputation } from './boundingboxcomputation';
import { BoundingBox } from './boundingbox';
import { DefaultFont, Fonts } from './smufl';

const BackupFont = Fonts.Gonville;

function processOutline(outline, originX, originY, scaleX, scaleY, outlineFns) {
  let command;
  let x;
  let y;
  let i = 0;

  function nextX() { return originX + outline[i++] * scaleX; }
  function nextY() { return originY + outline[i++] * scaleY; }
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

// TODO: Remove
Vex.MISSING_GLYPHS = {};
Vex.IGNORED_MISSING_GLYPHS = {
  'v90': true, // microtonal
  'v7a': true, // microtonal
  'vd6': true, // microtonal
  'vd7': true, // microtonal
  'vf': true, // muted breve (double whole)
  'va3': true, // squiggly stroke
  'vd5': true, // rectangle note head white
  'vd4': true, // rectangle note head black

};

export class Glyph extends Element {
  /*
    Static methods used to implement loading and rendering glyphs.

    Below categoryPath can be any metric path under 'glyphs', so stem.up would respolve
    to glyphs.stem.up.shifX, glyphs.stem.up.shiftY, etc.
  */
  static loadMetrics(font, code, categoryPath = null) {
    let glyph = font.getGlyphs()[code];
    if (!glyph) {
      if (!Vex.MISSING_GLYPHS[code] && !Vex.IGNORED_MISSING_GLYPHS[code]) {
        // eslint-disable-next-line
        console.log('Missing SMuFL glyph:', code);
        Vex.MISSING_GLYPHS[code] = new Error().stack;
      }

      font = BackupFont;
      glyph = font.getGlyphs()[code];
      if (!glyph) {
        throw new Vex.RERR('BadGlyph', `Glyph ${code} does not exist in font.`);
      }
    }

    const x_shift = categoryPath ? font.lookupMetric(`glyphs.${categoryPath}.shiftX`, 0) : 0;
    const y_shift = categoryPath ? font.lookupMetric(`glyphs.${categoryPath}.shiftY`, 0) : 0;
    const scale = categoryPath ? font.lookupMetric(`glyphs.${categoryPath}.scale`, 1) : 1;

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
      font: DefaultFont,
      category: null,
      ...options
    };
    const metrics = Glyph.loadMetrics(params.font, val, params.category);
    point = params.category ? params.font.lookupMetric(`glyphs.${params.category}.point`, point) : point;
    const scale = point * 72.0 / (params.font.getResolution() * 100.0);

    Glyph.renderOutline(ctx, metrics.outline, scale * metrics.scale, x_pos + metrics.x_shift, y_pos + metrics.y_shift, options);
    return metrics;
  }

  static renderOutline(ctx, outline, scale, x_pos, y_pos, options) {
    ctx.beginPath();
    ctx.moveTo(x_pos, y_pos);
    processOutline(outline, x_pos, y_pos, scale, -scale, {
      m: ctx.moveTo.bind(ctx),
      l: ctx.lineTo.bind(ctx),
      q: ctx.quadraticCurveTo.bind(ctx),
      b: ctx.bezierCurveTo.bind(ctx),
      // z: ctx.fill.bind(ctx), // ignored
    }, options);
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

    return new BoundingBox(
      bboxComp.x1,
      bboxComp.y1,
      bboxComp.width(),
      bboxComp.height()
    );
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
      font: this.getMusicFont(),
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

  setPoint(point) { this.point = point; return this; }
  setStave(stave) { this.stave = stave; return this; }
  setXShift(x_shift) { this.x_shift = x_shift; return this; }
  setYShift(y_shift) { this.y_shift = y_shift; return this; }

  reset() {
    this.scale = this.point * 72 / (this.options.font.getResolution() * 100);
    this.metrics = Glyph.loadMetrics(this.options.font, this.code, this.options.category);
    this.bbox = Glyph.getOutlineBoundingBox(
      this.metrics.outline,
      this.scale * this.metrics.scale,
      this.metrics.x_shift,
      this.metrics.y_shift,
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
    Glyph.renderOutline(ctx, outline, scale,
      x + this.originShift.x + this.metrics.x_shift,
      y + this.originShift.y + this.metrics.y_shift);
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
    Glyph.renderOutline(this.context, outline, scale,
      x + this.x_shift + this.metrics.x_shift, this.stave.getYForGlyphs() + this.y_shift + this.metrics.y_shift);
    this.restoreStyle();
  }
}
