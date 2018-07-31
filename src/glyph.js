// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { Vex } from './vex';
import { Element } from './element';
import { BoundingBoxComputation } from './boundingboxcomputation';
import { BoundingBox } from './boundingbox';
import { Font } from './fonts/vexflow_font';

function processOutline(outline, originX, originY, scaleX, scaleY, outlineFns) {
  let command;
  let x;
  let y;
  let i = 0;

  function nextX() { return originX + outline[i++] * scaleX; }
  function nextY() { return originY + outline[i++] * scaleY; }

  while (i < outline.length) {
    command = outline[i++];
    switch (command) {
      case 'm':
      case 'l':
        outlineFns[command](nextX(), nextY());
        break;
      case 'q':
        x = nextX();
        y = nextY();
        outlineFns.q(nextX(), nextY(), x, y);
        break;
      case 'b':
        x = nextX();
        y = nextY();
        outlineFns.b(nextX(), nextY(), nextX(), nextY(), x, y);
        break;
      default:
        break;
    }
  }
}

export class Glyph extends Element {
  /* Static methods used to implement loading / unloading of glyphs */
  static loadMetrics(font, code, cache) {
    const glyph = font.glyphs[code];
    if (!glyph) {
      throw new Vex.RERR('BadGlyph', `Glyph ${code} does not exist in font.`);
    }

    const x_min = glyph.x_min;
    const x_max = glyph.x_max;
    const ha = glyph.ha;

    let outline;

    if (glyph.o) {
      if (cache) {
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
        ha,
        outline,
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
   * @param {string} val The glyph code in Vex.Flow.Font.
   * @param {boolean} nocache If set, disables caching of font outline.
   */
  static renderGlyph(ctx, x_pos, y_pos, point, val, nocache) {
    const scale = point * 72.0 / (Font.resolution * 100.0);
    const metrics = Glyph.loadMetrics(Font, val, !nocache);
    Glyph.renderOutline(ctx, metrics.outline, scale, x_pos, y_pos);
  }

  static renderOutline(ctx, outline, scale, x_pos, y_pos) {
    ctx.beginPath();
    ctx.moveTo(x_pos, y_pos);
    processOutline(outline, x_pos, y_pos, scale, -scale, {
      m: ctx.moveTo.bind(ctx),
      l: ctx.lineTo.bind(ctx),
      q: ctx.quadraticCurveTo.bind(ctx),
      b: ctx.bezierCurveTo.bind(ctx),
    });
    ctx.fill();
  }

  static getOutlineBoundingBox(outline, scale, x_pos, y_pos) {
    const bboxComp = new BoundingBoxComputation();

    processOutline(outline, x_pos, y_pos, scale, -scale, {
      m: bboxComp.addPoint.bind(bboxComp),
      l: bboxComp.addPoint.bind(bboxComp),
      q: bboxComp.addQuadraticCurve.bind(bboxComp),
      b: bboxComp.addBezierCurve.bind(bboxComp),
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
      cache: true,
      font: Font,
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

  setOptions(options) {
    Vex.Merge(this.options, options);
    this.reset();
  }

  setPoint(point) { this.point = point; return this; }
  setStave(stave) { this.stave = stave; return this; }
  setXShift(x_shift) { this.x_shift = x_shift; return this; }
  setYShift(y_shift) { this.y_shift = y_shift; return this; }

  reset() {
    this.scale = this.point * 72 / (this.options.font.resolution * 100);
    this.metrics = Glyph.loadMetrics(
      this.options.font,
      this.code,
      this.options.cache
    );
    this.bbox = Glyph.getOutlineBoundingBox(
      this.metrics.outline,
      this.scale,
      0,
      0
    );
  }

  getMetrics() {
    if (!this.metrics) {
      throw new Vex.RuntimeError('BadGlyph', `Glyph ${this.code} is not initialized.`);
    }

    return {
      x_min: this.metrics.x_min * this.scale,
      x_max: this.metrics.x_max * this.scale,
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
    const scale = this.scale;

    this.setRendered();
    this.applyStyle(ctx);
    Glyph.renderOutline(ctx, outline, scale, x + this.originShift.x, y + this.originShift.y);
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
    const scale = this.scale;

    this.setRendered();
    this.applyStyle();
    Glyph.renderOutline(this.context, outline, scale,
      x + this.x_shift, this.stave.getYForGlyphs() + this.y_shift);
    this.restoreStyle();
  }
}
