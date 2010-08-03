// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires a glyph font to be loaded and Vex.Flow.Font to be set.

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
Vex.Flow.renderGlyph = function(ctx, x_pos, y_pos, point, val, nocache) {
  var scale = point * 72 / (Vex.Flow.Font.resolution * 100);
  var metrics = Vex.Flow.Glyph.loadMetrics(Vex.Flow.Font, val, !nocache);
  Vex.Flow.Glyph.renderOutline(ctx, metrics.outline, scale, x_pos, y_pos);
}

/**
 * @constructor
 */
Vex.Flow.Glyph = function(code, point, options) {
  this.code = code;
  this.point = point;
  this.context = null;
  this.options = {
    cache: true,
    font: Vex.Flow.Font
  };

  this.width = null;
  this.metrics = null;
  this.x_shift = 0;
  this.y_shift = 0;

  if (options) this.setOptions(options); else this.reset();
}

Vex.Flow.Glyph.prototype.setOptions = function(options) {
  Vex.Merge(this.options, options);
  this.reset();
}

Vex.Flow.Glyph.prototype.setStave = function(stave) {
  this.stave = stave; return this; }
Vex.Flow.Glyph.prototype.setXShift = function(x_shift) {
  this.x_shift = x_shift; return this; }
Vex.Flow.Glyph.prototype.setYShift = function(y_shift) {
  this.y_shift = y_shift; return this; }
Vex.Flow.Glyph.prototype.setContext = function(context) {
  this.context = context; return this; }
Vex.Flow.Glyph.prototype.getContext = function(context) {
  return this.context; }

Vex.Flow.Glyph.prototype.reset = function() {
  this.metrics = Vex.Flow.Glyph.loadMetrics(this.options.font, this.code,
      this.options.cache);
  this.scale = this.point * 72 / (this.options.font.resolution * 100);
}

Vex.Flow.Glyph.prototype.getMetrics = function() {
  if (!this.metrics) throw new Vex.RuntimeError("BadGlyph", "Glyph " +
      this.code + " is not initialized.");
  return {
    x_min: this.metrics.x_min * this.scale,
    x_max: this.metrics.x_max * this.scale,
    width: (this.metrics.x_max - this.metrics.x_min) * this.scale
  };
}

Vex.Flow.Glyph.prototype.render = function(ctx, x_pos, y_pos) {
  if (!this.metrics) throw new Vex.RuntimeError("BadGlyph", "Glyph " +
      this.code + " is not initialized.");

  var outline = this.metrics.outline;
  var scale = this.scale;
  var outlineLength = outline.length;

  Vex.Flow.Glyph.renderOutline(ctx, outline, scale, x_pos, y_pos);
}

Vex.Flow.Glyph.prototype.renderToStave = function(x) {
  if (!this.metrics) throw new Vex.RuntimeError("BadGlyph", "Glyph " +
      this.code + " is not initialized.");
  if (!this.stave) throw new Vex.RuntimeError("GlyphError", "No valid stave");
  if (!this.context) throw new Vex.RERR("GlyphError", "No valid context");

  var outline = this.metrics.outline;
  var scale = this.scale;
  var outlineLength = outline.length;

  Vex.Flow.Glyph.renderOutline(this.context, outline, scale,
      x + this.x_shift, this.stave.getYForGlyphs() + this.y_shift);
}

/* Static methods used to implement loading / unloading of glyphs */

Vex.Flow.Glyph.loadMetrics = function(font, code, cache) {
  var glyph = font.glyphs[code];
  if (!glyph) throw new Vex.RuntimeError("BadGlyph", "Glyph " + code +
      " does not exist in font.");

  var x_min = glyph["x_min"];
  var x_max = glyph["x_max"];

  var outline;

  if (glyph["o"]) {
    if (cache) {
      if (glyph.cached_outline) {
        outline = glyph.cached_outline;
      } else {
        outline = glyph["o"].split(' ');
        glyph.cached_outline = outline;
      }
    } else {
      if (glyph.cached_outline) delete glyph.cached_outline;
      outline = glyph["o"].split(' ');
    }

    return {
      x_min: x_min,
      x_max: x_max,
      outline: outline
    };
  } else {
    throw new Vex.RuntimeError("BadGlyph", "Glyph " + this.code +
        " has no outline defined.");
  }
}

Vex.Flow.Glyph.renderOutline = function(ctx, outline, scale, x_pos, y_pos) {
  var outlineLength = outline.length;

  ctx.beginPath();

  ctx.moveTo(x_pos, y_pos);

  for (var i = 0; i < outlineLength; ) {
    var action = outline[i++];

    switch(action) {
      case 'm':
        ctx.moveTo(x_pos + outline[i++] * scale,
                   y_pos + outline[i++] * -scale);
        break;
      case 'l':
        ctx.lineTo(x_pos + outline[i++] * scale,
                   y_pos + outline[i++] * -scale);
        break;

      case 'q':
        var cpx = x_pos + outline[i++] * scale;
        var cpy = y_pos + outline[i++] * -scale;

        ctx.quadraticCurveTo(
            x_pos + outline[i++] * scale,
            y_pos + outline[i++] * -scale, cpx, cpy);
        break;

      case 'b':
        var x = x_pos + outline[i++] * scale;
        var y = y_pos + outline[i++] * -scale;

        ctx.bezierCurveTo(
            x_pos + outline[i++] * scale, y_pos + outline[i++] * -scale,
            x_pos + outline[i++] * scale, y_pos + outline[i++] * -scale,
            x, y);
        break;
    }
  }
  ctx.fill();
}
