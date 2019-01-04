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
    const { left_shift, right_shift } = state;
    const num_spacing = 1;

    if (!nums || nums.length === 0) return false;

    const nums_list = [];
    let prev_note = null;
    let shiftLeft = 0;
    let shiftRight = 0;

    for (let i = 0; i < nums.length; ++i) {
      const num = nums[i];
      const note = num.getNote();
      const pos = num.getPosition();
      const props = note.getKeyProps()[num.getIndex()];
      if (note !== prev_note) {
        for (let n = 0; n < note.keys.length; ++n) {
          const props_tmp = note.getKeyProps()[n];
          if (left_shift === 0) {
            shiftLeft = props_tmp.displaced ? note.getExtraLeftPx() : shiftLeft;
          }
          if (right_shift === 0) {
            shiftRight = props_tmp.displaced ? note.getExtraRightPx() : shiftRight;
          }
        }
        prev_note = note;
      }

      nums_list.push({
        note,
        num,
        pos,
        line: props.line,
        shiftL: shiftLeft,
        shiftR: shiftRight,
      });
    }

    // Sort fingernumbers by line number.
    nums_list.sort((a, b) => b.line - a.line);

    let numShiftL = 0;
    let numShiftR = 0;
    let xWidthL = 0;
    let xWidthR = 0;
    let lastLine = null;
    let lastNote = null;

    for (let i = 0; i < nums_list.length; ++i) {
      let num_shift = 0;
      const { note, pos, num, line, shiftL, shiftR } = nums_list[i];

      // Reset the position of the string number every line.
      if (line !== lastLine || note !== lastNote) {
        numShiftL = left_shift + shiftL;
        numShiftR = right_shift + shiftR;
      }

      const numWidth = num.getWidth() + num_spacing;
      if (pos === Modifier.Position.LEFT) {
        num.setXShift(left_shift + numShiftL);
        num_shift = left_shift + numWidth; // spacing
        xWidthL = num_shift > xWidthL ? num_shift : xWidthL;
      } else if (pos === Modifier.Position.RIGHT) {
        num.setXShift(numShiftR);
        num_shift = shiftRight + numWidth; // spacing
        xWidthR = num_shift > xWidthR ? num_shift : xWidthR;
      }
      lastLine = line;
      lastNote = note;
    }

    state.left_shift += xWidthL;
    state.right_shift += xWidthR;

    return true;
  }

  constructor(number) {
    super();
    this.setAttribute('type', 'FretHandFinger');

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
  setFretHandFinger(number) { this.finger = number; return this; }
  setOffsetX(x) { this.x_offset = x; return this; }
  setOffsetY(y) { this.y_offset = y; return this; }

  draw() {
    this.checkContext();

    if (!this.note || this.index == null) {
      throw new Vex.RERR('NoAttachedNote', "Can't draw string number without a note and index.");
    }

    this.setRendered();
    const ctx = this.context;
    const start = this.note.getModifierStartXY(this.position, this.index);
    let dot_x = start.x + this.x_shift + this.x_offset;
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
      default:
        throw new Vex.RERR('InvalidPostion', `The position ${this.position} does not exist`);
    }

    ctx.save();
    ctx.setFont(this.font.family, this.font.size, this.font.weight);
    ctx.fillText('' + this.finger, dot_x, dot_y);
    ctx.restore();
  }
}
