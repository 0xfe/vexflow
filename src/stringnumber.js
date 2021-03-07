// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Larry Kuhns
//
// ## Description
// This file implements the `StringNumber` class which renders string
// number annotations beside notes.

import { Vex } from './vex';
import { Modifier } from './modifier';
import { Renderer } from './renderer';
import { StaveNote } from './stavenote';

export class StringNumber extends Modifier {
  static get CATEGORY() {
    return 'stringnumber';
  }

  // ## Static Methods
  // Arrange string numbers inside a `ModifierContext`
  static format(nums, state) {
    const left_shift = state.left_shift;
    const right_shift = state.right_shift;
    const num_spacing = 1;

    if (!nums || nums.length === 0) return this;

    const nums_list = [];
    let prev_note = null;
    let shift_left = 0;
    let shift_right = 0;

    let i;
    let num;
    let note;
    let pos;
    for (i = 0; i < nums.length; ++i) {
      num = nums[i];
      note = num.getNote();

      for (i = 0; i < nums.length; ++i) {
        num = nums[i];
        note = num.getNote();
        pos = num.getPosition();
        const props = note.getKeyProps()[num.getIndex()];

        if (note !== prev_note) {
          for (let n = 0; n < note.keys.length; ++n) {
            if (left_shift === 0) {
              shift_left = Math.max(note.getLeftDisplacedHeadPx(), shift_left);
            }
            if (right_shift === 0) {
              shift_right = Math.max(note.getRightDisplacedHeadPx(), shift_right);
            }
          }
          prev_note = note;
        }

        nums_list.push({
          pos,
          note,
          num,
          line: props.line,
          shiftL: shift_left,
          shiftR: shift_right,
        });
      }
    }

    // Sort string numbers by line number.
    nums_list.sort((a, b) => b.line - a.line);

    // TODO: This variable never gets assigned to anything. Is that a bug or can this be removed?
    let num_shiftL = 0; // eslint-disable-line
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
      if (line !== last_line || note !== last_note) {
        num_shiftL = left_shift + shiftL;
        num_shiftR = right_shift + shiftR;
      }

      const num_width = num.getWidth() + num_spacing;
      if (pos === Modifier.Position.LEFT) {
        num.setXShift(left_shift);
        num_shift = shift_left + num_width; // spacing
        x_widthL = num_shift > x_widthL ? num_shift : x_widthL;
      } else if (pos === Modifier.Position.RIGHT) {
        num.setXShift(num_shiftR);
        num_shift += num_width; // spacing
        x_widthR = num_shift > x_widthR ? num_shift : x_widthR;
      }
      last_line = line;
      last_note = note;
    }

    state.left_shift += x_widthL;
    state.right_shift += x_widthR;
    return true;
  }

  constructor(number) {
    super();
    this.setAttribute('type', 'StringNumber');

    this.note = null;
    this.last_note = null;
    this.index = null;
    this.string_number = number;
    this.setWidth(20); // ???
    this.position = Modifier.Position.ABOVE; // Default position above stem or note head
    this.x_shift = 0;
    this.y_shift = 0;
    this.x_offset = 0; // Horizontal offset from default
    this.y_offset = 0; // Vertical offset from default
    this.dashed = true; // true - draw dashed extension  false - no extension
    this.leg = Renderer.LineEndType.NONE; // draw upward/downward leg at the of extension line
    this.radius = 8;
    this.font = {
      family: 'sans-serif',
      size: 10,
      weight: 'bold',
    };
  }
  getCategory() {
    return StringNumber.CATEGORY;
  }
  getNote() {
    return this.note;
  }
  setNote(note) {
    this.note = note;
    return this;
  }
  getIndex() {
    return this.index;
  }
  setIndex(index) {
    this.index = index;
    return this;
  }

  setLineEndType(leg) {
    if (leg >= Renderer.LineEndType.NONE && leg <= Renderer.LineEndType.DOWN) {
      this.leg = leg;
    }
    return this;
  }

  setStringNumber(number) {
    this.string_number = number;
    return this;
  }
  setOffsetX(x) {
    this.x_offset = x;
    return this;
  }
  setOffsetY(y) {
    this.y_offset = y;
    return this;
  }
  setLastNote(note) {
    this.last_note = note;
    return this;
  }
  setDashed(dashed) {
    this.dashed = dashed;
    return this;
  }

  draw() {
    const ctx = this.checkContext();
    if (!(this.note && this.index != null)) {
      throw new Vex.RERR('NoAttachedNote', "Can't draw string number without a note and index.");
    }
    this.setRendered();

    const line_space = this.note.stave.options.spacing_between_lines_px;

    const start = this.note.getModifierStartXY(this.position, this.index);
    let dot_x = start.x + this.x_shift + this.x_offset;
    let dot_y = start.y + this.y_shift + this.y_offset;

    switch (this.position) {
      case Modifier.Position.ABOVE:
      case Modifier.Position.BELOW: {
        const stem_ext = this.note.getStemExtents();
        let top = stem_ext.topY;
        let bottom = stem_ext.baseY + 2;

        if (this.note.stem_direction === StaveNote.STEM_DOWN) {
          top = stem_ext.baseY;
          bottom = stem_ext.topY - 2;
        }

        if (this.position === Modifier.Position.ABOVE) {
          dot_y = this.note.hasStem() ? top - line_space * 1.75 : start.y - line_space * 1.75;
        } else {
          dot_y = this.note.hasStem() ? bottom + line_space * 1.5 : start.y + line_space * 1.75;
        }

        dot_y += this.y_shift + this.y_offset;

        break;
      }
      case Modifier.Position.LEFT:
        dot_x -= this.radius / 2 + 5;
        break;
      case Modifier.Position.RIGHT:
        dot_x += this.radius / 2 + 6;
        break;
      default:
        throw new Vex.RERR('InvalidPosition', `The position ${this.position} is invalid`);
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(dot_x, dot_y, this.radius, 0, Math.PI * 2, false);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setFont(this.font.family, this.font.size, this.font.weight);
    const x = dot_x - ctx.measureText(this.string_number).width / 2;
    ctx.fillText('' + this.string_number, x, dot_y + 4.5);

    if (this.last_note != null) {
      const end = this.last_note.getStemX() - this.note.getX() + 5;
      ctx.strokeStyle = '#000000';
      ctx.lineCap = 'round';
      ctx.lineWidth = 0.6;
      if (this.dashed) {
        Renderer.drawDashedLine(ctx, dot_x + 10, dot_y, dot_x + end, dot_y, [3, 3]);
      } else {
        Renderer.drawDashedLine(ctx, dot_x + 10, dot_y, dot_x + end, dot_y, [3, 0]);
      }

      let len;
      let pattern;
      switch (this.leg) {
        case Renderer.LineEndType.UP:
          len = -10;
          pattern = this.dashed ? [3, 3] : [3, 0];
          Renderer.drawDashedLine(ctx, dot_x + end, dot_y, dot_x + end, dot_y + len, pattern);
          break;
        case Renderer.LineEndType.DOWN:
          len = 10;
          pattern = this.dashed ? [3, 3] : [3, 0];
          Renderer.drawDashedLine(ctx, dot_x + end, dot_y, dot_x + end, dot_y + len, pattern);
          break;
        default:
          break;
      }
    }

    ctx.restore();
  }
}
