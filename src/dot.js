// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements dot modifiers for notes.

import { Vex } from './vex';
import { Modifier } from './modifier';

export class Dot extends Modifier {
  static get CATEGORY() { return 'dots'; }

  // Arrange dots inside a ModifierContext.
  static format(dots, state) {
    const right_shift = state.right_shift;
    const dot_spacing = 1;

    if (!dots || dots.length === 0) return false;

    let i, dot, note, shift;
    const dot_list = [];
    for (i = 0; i < dots.length; ++i) {
      dot = dots[i];
      note = dot.getNote();

      let props;
      // Only StaveNote has .getKeyProps()
      if (typeof note.getKeyProps === 'function') {
        props = note.getKeyProps()[dot.getIndex()];
        shift = (props.displaced ? note.getExtraRightPx() : 0);
      } else { // Else it's a TabNote
        props = { line: 0.5 }; // Shim key props for dot placement
        shift = 0;
      }

      dot_list.push({ line: props.line, shift, note, dot });
    }

    // Sort dots by line number.
    dot_list.sort((a, b) => b.line - a.line);

    let dot_shift = right_shift;
    let x_width = 0;
    let last_line = null;
    let last_note = null;
    let prev_dotted_space = null;
    let half_shiftY = 0;

    for (i = 0; i < dot_list.length; ++i) {
      dot = dot_list[i].dot;
      note = dot_list[i].note;
      shift = dot_list[i].shift;
      const line = dot_list[i].line;

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
  }

  /**
   * @constructor
   */
  constructor() {
    super();

    this.note = null;
    this.index = null;
    this.position = Modifier.Position.RIGHT;

    this.radius = 2;
    this.setWidth(5);
    this.dot_shiftY = 0;
  }
  getCategory() { return Dot.CATEGORY; }
  setNote(note) {
    this.note = note;

    if (this.note.getCategory() === 'gracenotes') {
      this.radius *= 0.50;
      this.setWidth(3);
    }
  }
  setDotShiftY(y) { this.dot_shiftY = y; return this; }
  draw() {
    if (!this.context) throw new Vex.RERR('NoContext',
      "Can't draw dot without a context.");
    if (!(this.note && (this.index != null))) throw new Vex.RERR('NoAttachedNote',
      "Can't draw dot without a note and index.");

    const line_space = this.note.stave.options.spacing_between_lines_px;

    const start = this.note.getModifierStartXY(this.position, this.index);

    // Set the starting y coordinate to the base of the stem for TabNotes
    if (this.note.getCategory() === 'tabnotes') {
      start.y = this.note.getStemExtents().baseY;
    }

    const dot_x = (start.x + this.x_shift) + this.width - this.radius;
    const dot_y = start.y + this.y_shift + (this.dot_shiftY * line_space);
    const ctx = this.context;

    ctx.beginPath();
    ctx.arc(dot_x, dot_y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
  }
}
