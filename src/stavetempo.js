// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Rados³aw Eichler 2012
// Implements tempo marker.

/**
 * @constructor
 * @param {Object} tempo Tempo parameters: { name, note, bpm }
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
  this.shift_x = 0;
  this.shift_y = shift_y;
  this.font = {
    family: "times",
    size: 16,
    weight: "bold"
  };
}

Vex.Flow.StaveTempo.prototype.getCategory = function() { return "StaveTempo"; }
Vex.Flow.StaveTempo.prototype.setStaveTempo = function(tempo) {
  this.tempo = tempo;
  return this;
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

  var ctx = stave.context;

  ctx.save();

  var x = this.x + shift_x + 10;
  var y = stave.getYForTopText(3) + this.shift_y;
  var y_text = y + 16;
  var name = this.tempo.name;
  var note = this.tempo.note;
  var bpm = this.tempo.bpm;

  if (name) {
    ctx.setFont(this.font.family, this.font.size, this.font.weight);
    ctx.fillText(name, x, y_text);
    x += ctx.measureText(this.tempo.name).width;
  }

  if (note && bpm) {
    ctx.setFont(this.font.family, this.font.size, 'normal');

    if (name) {
      x += 6;
      ctx.fillText("(", x, y_text);
      x += ctx.measureText("(").width;
    }

    var code = Vex.Flow.durationToGlyph.duration_codes[note];
    var y_note = y + 18;

    x += 3;

    Vex.Flow.renderGlyph(ctx, x, y_note, 38, code.code_head);

    x += code.head_width;

    if (code.stem) {

      // Draw the stem and flags

      var stem_height = 30;

      if (code.beam_count)
        stem_height += 3 * (code.beam_count - 1);

      if (code.dot)
        stem_height += 2;

      var y_top = y_note - stem_height;
      ctx.fillRect(x, y_top, 1, stem_height);

      if (code.flag)
        Vex.Flow.renderGlyph(ctx, x + 1, y_top, 38, code.code_flag_upstem);
    }

    if (code.flag || code.dot)
      x += 5;

    // Draw dot

    if (code.dot) {
      ctx.beginPath();
      ctx.arc(x, y_note, 2, 0, Math.PI * 2, false);
      ctx.fill();
    }

    ctx.fillText(" = " + bpm + (name ? ")" : ""), x + 3, y_text);
  }

  ctx.restore();
  return this;
}
