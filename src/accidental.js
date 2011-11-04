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

/* Redundant functions defined in modifier.js
Vex.Flow.Accidental.prototype.getNote = function() { return this.note; }
Vex.Flow.Accidental.prototype.setNote = function(note)
  { this.note = note; return this; }
Vex.Flow.Accidental.prototype.getIndex = function() { return this.index; }
Vex.Flow.Accidental.prototype.setIndex = function(index) {
  this.index = index; return this; }
*/

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

  /**
   * Accidentals need no stroking...

  var keyProps = this.note.getKeyProps();
  if (keyProps[this.index].stroke != 0) {
     var stroke_begin_y = start.y;
     for (var j = 0; j < 5; ++j) {
       this.context.fillRect(
           acc_x - this.render_options.stroke_px, stroke_begin_y,
           this.width + (this.render_options.stroke_px * 2), 1);

       stroke_begin_y -= (this.render_options.stroke_spacing * keyProps.stroke);
       if (stroke_begin_y >= this.note.getStave().getYForLine(0) &&
           stroke_begin_y <= this.note.getStave().getYForLine(6)) {
         break;
       }
     } // for j = 0 -> 4
  }

  */
}
