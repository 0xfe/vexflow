// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements dot modifiers for notes.

/**
 * @constructor
 */
Vex.Flow.Dot = (function() {
  function Dot() {
    this.init();
  }

  var Modifier = Vex.Flow.Modifier;
  Vex.Inherit(Dot, Modifier, {
    init: function() {
      Dot.superclass.init.call(this);

      this.note = null;
      this.index = null;
      this.position = Modifier.Position.RIGHT;

      this.radius = 2;
      this.setWidth(5);
      this.dot_shiftY = 0;
    },

    setNote: function(note){
      this.note = note;

      if (this.note.getCategory() === 'gracenotes') {
        this.radius *= 0.50;
        this.setWidth(3);
      }
    },

    getCategory: function() { return "dots"; },

    setDotShiftY: function(y) { this.dot_shiftY = y; return this; },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoContext",
        "Can't draw dot without a context.");
      if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
        "Can't draw dot without a note and index.");

      var line_space = this.note.stave.options.spacing_between_lines_px;

      var start = this.note.getModifierStartXY(this.position, this.index);

      // Set the starting y coordinate to the base of the stem for TabNotes
      if (this.note.getCategory() === 'tabnotes') {
        start.y = this.note.getStemExtents().baseY;
      }

      var dot_x = (start.x + this.x_shift) + this.width - this.radius;
      var dot_y = start.y + this.y_shift + (this.dot_shiftY * line_space);
      var ctx = this.context;

      ctx.beginPath();
      ctx.arc(dot_x, dot_y, this.radius, 0, Math.PI * 2, false);
      ctx.fill();
    }
  });

  return Dot;
}());
