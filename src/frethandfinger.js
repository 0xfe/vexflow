// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Larry Kuhns 2013
// Class to draws string numbers into the notation.

import { Vex } from './vex';
import { Modifier } from './modifier';

/**
 * @constructor
 */
export class FretHandFinger extends Modifier {
  static get CATEGORY() { return 'frethandfinger'; }

  // Arrange fingerings inside a ModifierContext.
  static format(nums, state) {
    const left_shift = state.left_shift;
    const right_shift = state.right_shift;
    const num_spacing = 1;

    if (!nums || nums.length === 0) return false;

    const nums_list = [];
    let prev_note = null;
    let shift_left = 0;
    let shift_right = 0;

    let i, num, note, pos, props_tmp;
    for (i = 0; i < nums.length; ++i) {
      num = nums[i];
      note = num.getNote();
      pos = num.getPosition();
      const props = note.getKeyProps()[num.getIndex()];
      if (note != prev_note) {
        for (let n = 0; n < note.keys.length; ++n) {
          props_tmp = note.getKeyProps()[n];
          if (left_shift === 0)
            shift_left = (props_tmp.displaced ? note.getExtraLeftPx() : shift_left);
          if (right_shift === 0)
            shift_right = (props_tmp.displaced ? note.getExtraRightPx() : shift_right);
        }
        prev_note = note;
      }

      nums_list.push({ line: props.line, pos, shiftL: shift_left, shiftR: shift_right, note, num });
    }

    // Sort fingernumbers by line number.
    nums_list.sort((a, b) => b.line - a.line);

    let num_shiftL = 0;
    let num_shiftR = 0;
    let x_widthL = 0;
    let x_widthR = 0;
    let last_line = null;
    let last_note = null;

    for (i = 0; i < nums_list.length; ++i) {
      let num_shift = 0;
      note = nums_list[i].note;
      pos = nums_list[i].pos;
      num = nums_list[i].num;
      const line = nums_list[i].line;
      const shiftL = nums_list[i].shiftL;
      const shiftR = nums_list[i].shiftR;

      // Reset the position of the string number every line.
      if (line != last_line || note != last_note) {
        num_shiftL = left_shift + shiftL;
        num_shiftR = right_shift + shiftR;
      }

      const num_width = num.getWidth() + num_spacing;
      if (pos == Modifier.Position.LEFT) {
        num.setXShift(left_shift + num_shiftL);
        num_shift = left_shift + num_width; // spacing
        x_widthL = (num_shift > x_widthL) ? num_shift : x_widthL;
      } else if (pos == Modifier.Position.RIGHT) {
        num.setXShift(num_shiftR);
        num_shift = shift_right + num_width; // spacing
        x_widthR = (num_shift > x_widthR) ? num_shift : x_widthR;
      }
      last_line = line;
      last_note = note;
    }

    state.left_shift += x_widthL;
    state.right_shift += x_widthR;
  }

  constructor(number) {
    super();

    this.note = null;
    this.index = null;
    this.finger = number;
    this.width = 7;
    this.position = Modifier.Position.LEFT;  // Default position above stem or note head
    this.x_shift = 0;
    this.y_shift = 0;
    this.x_offset = 0;       // Horizontal offset from default
    this.y_offset = 0;       // Vertical offset from default
    this.font = {
      family: 'sans-serif',
      size: 9,
      weight: 'bold',
    };
  }
  getCategory() { return FretHandFinger.CATEGORY; }
  getNote() { return this.note; }
  setNote(note) { this.note = note; return this; }
  getIndex() { return this.index; }
  setIndex(index) { this.index = index; return this; }
  getPosition() { return this.position; }
  setPosition(position) {
    if (position >= Modifier.Position.LEFT &&
        position <= Modifier.Position.BELOW)
      this.position = position;
    return this;
  }
  setFretHandFinger(number) { this.finger = number; return this; }
  setOffsetX(x) { this.x_offset = x; return this; }
  setOffsetY(y) { this.y_offset = y; return this; }

  draw() {
    if (!this.context) throw new Vex.RERR('NoContext',
      "Can't draw string number without a context.");
    if (!(this.note && (this.index != null))) throw new Vex.RERR('NoAttachedNote',
      "Can't draw string number without a note and index.");

    const ctx = this.context;
    const start = this.note.getModifierStartXY(this.position, this.index);
    let dot_x = (start.x + this.x_shift + this.x_offset);
    let dot_y = start.y + this.y_shift + this.y_offset + 5;

    switch (this.position) {
      case Modifier.Position.ABOVE:
        dot_x -= 4;
        dot_y -= 12;
        break;
      case Modifier.Position.BELOW:
        dot_x -= 2;
        dot_y += 10;
        break;
      case Modifier.Position.LEFT:
        dot_x -= this.width;
        break;
      case Modifier.Position.RIGHT:
        dot_x += 1;
        break;
    }

    ctx.save();
    ctx.setFont(this.font.family, this.font.size, this.font.weight);
    ctx.fillText('' + this.finger, dot_x, dot_y);

    ctx.restore();
  }
}
