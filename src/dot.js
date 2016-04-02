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

  Dot.CATEGORY = "dots";

  var Modifier = Vex.Flow.Modifier;

  // Arrange dots inside a ModifierContext.
  Dot.format = function(dots, state) {
    var right_shift = state.right_shift;
    var dot_spacing = 1;

    if (!dots || dots.length === 0) return false;

    var i, dot, note, shift;
    var dot_list = [];
    for (i = 0; i < dots.length; ++i) {
      dot = dots[i];
      note = dot.getNote();

      var props;
      // Only StaveNote has .getKeyProps()
      if (typeof note.getKeyProps === 'function') {
        props = note.getKeyProps()[dot.getIndex()];
        shift = (props.displaced ? note.getExtraRightPx() : 0);
      } else { // Else it's a TabNote
        props = { line: 0.5 }; // Shim key props for dot placement
        shift = 0;
      }

      dot_list.push({ line: props.line, shift: shift, note: note, dot: dot });
    }

    // Sort dots by line number.
    dot_list.sort(function(a, b) { return (b.line - a.line); });

    var dot_shift = right_shift;
    var x_width = 0;
    var last_line = null;
    var last_note = null;
    var prev_dotted_space = null;
    var half_shiftY = 0;

    for (i = 0; i < dot_list.length; ++i) {
      dot = dot_list[i].dot;
      note = dot_list[i].note;
      shift = dot_list[i].shift;
      var line = dot_list[i].line;

      // Reset the position of the dot every line.
      if (line != last_line || note != last_note) {
        dot_shift = shift;
      }

      if (!note.isRest() && line != last_line) {
        if (Math.abs(line % 1) == 0.5) {
          // note is on a space, so no dot shift
          half_shiftY = 0;
        } else if (!note.isRest()) {
          // note is on a line, so shift dot to space above the line
          half_shiftY = 0.5;
          if (last_note != null &&
              !last_note.isRest() && last_line - line == 0.5) {
            // previous note on a space, so shift dot to space below the line
            half_shiftY = -0.5;
          } else if (line + half_shiftY == prev_dotted_space) {
            // previous space is dotted, so shift dot to space below the line
             half_shiftY = -0.5;
          }
        }
      }

      // convert half_shiftY to a multiplier for dots.draw()
      dot.dot_shiftY = (-half_shiftY);
      prev_dotted_space = line + half_shiftY;

      dot.setXShift(dot_shift);
      dot_shift += dot.getWidth() + dot_spacing; // spacing
      x_width = (dot_shift > x_width) ? dot_shift : x_width;
      last_line = line;
      last_note = note;
    }

    // Update state.
    state.right_shift += x_width;
  };

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
