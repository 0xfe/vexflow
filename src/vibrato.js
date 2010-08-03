// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements vibratos.

/**
 * @constructor
 */
Vex.Flow.Vibrato = function() {
  this.init();
}
Vex.Flow.Vibrato.prototype = new Vex.Flow.Modifier();
Vex.Flow.Vibrato.prototype.constructor = Vex.Flow.Vibrato;
Vex.Flow.Vibrato.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.Vibrato.prototype.init = function() {
  var superclass = Vex.Flow.Vibrato.superclass;
  superclass.init.call(this);

  this.harsh = false;
  this.position = Vex.Flow.Modifier.Position.RIGHT;
  this.render_options = {
    vibrato_width: 20,
    wave_height: 6,
    wave_width: 4,
    wave_girth: 2
  };

  this.setVibratoWidth(this.render_options.vibrato_width);
}

Vex.Flow.Vibrato.prototype.getCategory = function() { return "vibratos"; }
Vex.Flow.Vibrato.prototype.setVibratoWidth = function(width) {
  this.vibrato_width = width;
  this.setWidth(this.vibrato_width);
  return this;
}
Vex.Flow.Vibrato.prototype.setHarsh = function(harsh) {
  this.harsh = harsh; return this; }

Vex.Flow.Vibrato.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw vibrato without a context.");
  if (!this.note) throw new Vex.RERR("NoNoteForVibrato",
    "Can't draw vibrato without an attached note.");

  var start = this.note.getModifierStartXY(Vex.Flow.Modifier.Position.RIGHT,
      this.index);

  var ctx = this.context;
  var that = this;
  var vibrato_width = this.vibrato_width;

  function renderVibrato(x, y) {
    var wave_width = that.render_options.wave_width;
    var wave_girth = that.render_options.wave_girth;
    var wave_height = that.render_options.wave_height;
    var num_waves = vibrato_width / wave_width;

    ctx.beginPath();

    if (that.harsh) {
      ctx.moveTo(x, y + wave_girth + 1);
      for (var i = 0; i < num_waves / 2; ++i) {
        ctx.lineTo(x + wave_width, y - (wave_height / 2));
        x += wave_width;
        ctx.lineTo(x + wave_width, y + (wave_height / 2));
        x += wave_width;
      }
      for (var i = 0; i < num_waves / 2; ++i) {
        ctx.lineTo(x - wave_width, (y - (wave_height / 2)) + wave_girth + 1);
        x -= wave_width;
        ctx.lineTo(x - wave_width, (y + (wave_height / 2)) + wave_girth + 1);
        x -= wave_width;
      }
      ctx.fill();
    } else {
      ctx.moveTo(x, y + wave_girth);
      for (var i = 0; i < num_waves / 2; ++i) {
        ctx.quadraticCurveTo(x + (wave_width / 2), y - (wave_height / 2),
          x + wave_width, y);
        x += wave_width;
        ctx.quadraticCurveTo(x + (wave_width / 2), y + (wave_height / 2),
          x + wave_width, y);
        x += wave_width;
      }

      for (var i = 0; i < num_waves / 2; ++i) {
        ctx.quadraticCurveTo(
            x - (wave_width / 2),
            (y + (wave_height / 2)) + wave_girth,
            x - wave_width, y + wave_girth);
        x -= wave_width;
        ctx.quadraticCurveTo(
            x - (wave_width / 2),
            (y - (wave_height / 2)) + wave_girth,
            x - wave_width, y + wave_girth);
        x -= wave_width;
      }
      ctx.fill();
    }
  }

  var vx = start.x + this.x_shift;
  var vy = this.note.getStave().getYForTopText(this.text_line) + 2;

  renderVibrato(vx, vy);
}
