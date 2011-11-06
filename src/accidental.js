// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements accidentals.

/**
 * @constructor
 */
Vex.Flow.Accidental = function(type) {
  if (arguments.length > 0) this.init(type);
}
Vex.Flow.Accidental.prototype = new Vex.Flow.Modifier();
Vex.Flow.Accidental.prototype.constructor = Vex.Flow.Accidental;
Vex.Flow.Accidental.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.Accidental.prototype.init = function(type) {
  var superclass = Vex.Flow.Accidental.superclass;
  superclass.init.call(this);

  this.note = null;
  this.index = null;
  this.type = type;
  this.position = Vex.Flow.Modifier.Position.LEFT;

  this.render_options = {
    font_scale: 38,
    stroke_px: 3,
    stroke_spacing: 10
  };

  this.accidental = Vex.Flow.accidentalCodes(this.type);
  this.setWidth(this.accidental.width);
}

Vex.Flow.Accidental.prototype.getCategory = function() { return "accidentals"; }

Vex.Flow.Accidental.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw accidental without a context.");
  if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
    "Can't draw accidental without a note and index.");

  var start = this.note.getModifierStartXY(this.position, this.index);
  var acc_x = (start.x + this.x_shift) - this.width;
  var acc_y = start.y + this.y_shift;

  Vex.Flow.renderGlyph(this.context, acc_x, acc_y,
                       this.render_options.font_scale, this.accidental.code);
}
