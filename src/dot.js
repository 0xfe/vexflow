// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements dot modifiers for notes.

/**
 * @constructor
 */
Vex.Flow.Dot = function() {
  this.init();
}
Vex.Flow.Dot.prototype = new Vex.Flow.Modifier();
Vex.Flow.Dot.prototype.constructor = Vex.Flow.Dot;
Vex.Flow.Dot.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.Dot.prototype.init = function() {
  var superclass = Vex.Flow.Dot.superclass;
  superclass.init.call(this);

  this.note = null;
  this.index = null;
  this.position = Vex.Flow.Modifier.Position.RIGHT;

  this.radius = 2;
  this.setWidth(5);
}

Vex.Flow.Dot.prototype.getCategory = function() { return "dots"; }
Vex.Flow.Dot.prototype.getNote = function() { return this.note; }
Vex.Flow.Dot.prototype.setNote = function(note)
  { this.note = note; return this; }
Vex.Flow.Dot.prototype.getIndex = function() { return this.index; }
Vex.Flow.Dot.prototype.setIndex = function(index) {
  this.index = index; return this; }

Vex.Flow.Dot.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw dot without a context.");
  if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
    "Can't draw dot without a note and index.");

  var start = this.note.getModifierStartXY(this.position, this.index);
  var dot_x = (start.x + this.x_shift) + this.width - this.radius;
  var dot_y = start.y + this.y_shift;

  var ctx = this.context;
  ctx.beginPath();
  ctx.arc(dot_x, dot_y, this.radius, 0, Math.PI * 2, false);
  ctx.fill();

  /*
  Vex.Flow.renderGlyph(this.context, dot_x, dot_y,
                       this.render_options.font_scale, this.dotCode);
                       */

  /**
   * Dots need no stroking...

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
