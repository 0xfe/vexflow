// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Rados³aw Eichler 2012
// Implements tempo marker.

/**
 * @constructor
 * @param {Object} tempo Tempo parameters: { name, duration, dots, bpm }
 */
Vex.Flow.StaveTempo = function(tempo, x, shift_y) {
  if (arguments.length > 0) this.init(tempo, x, shift_y);
}
Vex.Flow.StaveTempo.prototype = new Vex.Flow.StaveModifier();
Vex.Flow.StaveTempo.prototype.constructor = Vex.Flow.StaveTempo;
Vex.Flow.StaveTempo.superclass = Vex.Flow.StaveModifier.prototype;

Vex.Flow.StaveTempo.prototype.init = function(tempo, x, shift_y) {
  var superclass = Vex.Flow.StaveTempo.superclass;
  superclass.init.call(this);

  this.tempo = tempo;
  this.position = Vex.Flow.Modifier.Position.ABOVE;
  this.x = x;
  this.shift_x = 10;
  this.shift_y = shift_y;
  this.font = {
    family: "times",
    size: 14,
    weight: "bold"
  };
  this.render_options = {
    glyph_font_scale: 30  // font size for note
  };
}

Vex.Flow.StaveTempo.prototype.getCategory = function() { return "stavetempo"; }
Vex.Flow.StaveTempo.prototype.setTempo = function(tempo) {
  this.tempo = tempo; return this;
}
Vex.Flow.StaveTempo.prototype.setShiftX = function(x) {
  this.shift_x = x; return this;
}
Vex.Flow.StaveTempo.prototype.setShiftY = function(x) {
  this.shift_y = y; return this;
}

Vex.Flow.StaveTempo.prototype.draw = function(stave, shift_x) {
  if (!stave.context) throw new Vex.RERR("NoContext",
    "Can't draw stave tempo without a context.");

  var options = this.render_options;
  var scale = options.glyph_font_scale / 38;
  var name = this.tempo.name;
  var duration = this.tempo.duration;
  var dots = this.tempo.dots;
  var bpm = this.tempo.bpm;
  var font = this.font;
  var ctx = stave.context;
  var x = this.x + this.shift_x + shift_x;
  var y = stave.getYForTopText(1) + this.shift_y;

  ctx.save();

  if (name) {
    ctx.setFont(font.family, font.size, font.weight);
    ctx.fillText(name, x, y);
    x += ctx.measureText(name).width;
  }

  if (duration && bpm) {
    ctx.setFont(font.family, font.size, 'normal');

    if (name) {
      x += ctx.measureText(" ").width;
      ctx.fillText("(", x, y);
      x += ctx.measureText("(").width;
    }

    var code = Vex.Flow.durationToGlyph(duration);

    x += 3 * scale;
    Vex.Flow.renderGlyph(ctx, x, y, options.glyph_font_scale, code.code_head);
    x += code.head_width * scale;

    // Draw stem and flags
    if (code.stem) {
      var stem_height = 30;

      if (code.beam_count) stem_height += 3 * (code.beam_count - 1);

      stem_height *= scale;

      var y_top = y - stem_height;
      ctx.fillRect(x, y_top, scale, stem_height);

      if (code.flag) {
        Vex.Flow.renderGlyph(ctx, x + scale, y_top, options.glyph_font_scale,
                             code.code_flag_upstem);

        if (!dots) x += 6 * scale;
      }
    }

    // Draw dot
    for (var i = 0; i < dots; i++) {
      x += 6 * scale;
      ctx.beginPath();
      ctx.arc(x, y + 2 * scale, 2 * scale, 0, Math.PI * 2, false);
      ctx.fill();
    }

    ctx.fillText(" = " + bpm + (name ? ")" : ""), x + 3 * scale, y);
  }

  ctx.restore();
  return this;
}
