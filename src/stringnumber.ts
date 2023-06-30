// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Larry Kuhns
//
// This file implements the `StringNumber` class which renders string
// number annotations beside notes.

import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Modifier, ModifierPosition } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
import { Renderer } from './renderer';
import { Stem } from './stem';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { Category, isStaveNote, isStemmableNote } from './typeguard';
import { RuntimeError } from './util';

export interface StringNumberMetrics {
  verticalPadding: number;
  stemPadding: number;
  leftPadding: number;
  rightPadding: number;
}

export class StringNumber extends Modifier {
  static get CATEGORY(): string {
    return Category.StringNumber;
  }

  static TEXT_FONT: Required<FontInfo> = {
    family: Font.SANS_SERIF,
    size: Font.SIZE,
    weight: FontWeight.BOLD,
    style: FontStyle.NORMAL,
  };

  static get metrics(): StringNumberMetrics {
    return (
      Tables.currentMusicFont().getMetrics().stringNumber ?? {
        verticalPadding: 0,
        stemPadding: 0,
        leftPadding: 0,
        rightPadding: 0,
      }
    );
  }

  // ## Static Methods
  // Arrange string numbers inside a `ModifierContext`
  static format(nums: StringNumber[], state: ModifierContextState): boolean {
    /**
     * The modifier context's left_shift state.
     */
    const left_shift = state.left_shift;
    /**
     * The modifier context's right_shift state.
     */
    const right_shift = state.right_shift;
    const num_spacing = 1;

    if (!nums || nums.length === 0) return false;

    const nums_list = [];
    let prev_note = null;
    let extraXSpaceForDisplacedNotehead = 0;
    let shift_right = 0;
    const modLines = 0;

    for (let i = 0; i < nums.length; ++i) {
      const num = nums[i];
      const note = num.getNote();
      const pos = num.getPosition();
      if (!isStaveNote(note)) {
        throw new RuntimeError('NoStaveNote');
      }
      const index = num.checkIndex();
      const props = note.getKeyProps()[index];
      const mc = note.getModifierContext();
      const verticalSpaceNeeded = (num.radius * 2) / Tables.STAVE_LINE_DISTANCE + 0.5;

      if (mc) {
        if (pos === ModifierPosition.ABOVE) {
          num.text_line = mc.getState().top_text_line;
          state.top_text_line += verticalSpaceNeeded;
        } else if (pos === ModifierPosition.BELOW) {
          num.text_line = mc.getState().text_line;
          state.text_line += verticalSpaceNeeded;
        }
      }

      if (note !== prev_note) {
        for (let n = 0; n < note.keys.length; ++n) {
          if (pos === Modifier.Position.LEFT) {
            extraXSpaceForDisplacedNotehead = Math.max(note.getLeftDisplacedHeadPx(), extraXSpaceForDisplacedNotehead);
          }
          if (right_shift === 0) {
            shift_right = Math.max(note.getRightDisplacedHeadPx(), shift_right);
          }
        }
        prev_note = note;
      }

      const glyphLine = modLines === 0 ? props.line : modLines;

      nums_list.push({
        pos,
        note,
        num,
        line: glyphLine,
        shiftL: extraXSpaceForDisplacedNotehead,
        shiftR: shift_right,
      });
    }

    // Sort string numbers by line number.
    nums_list.sort((a, b) => b.line - a.line);

    let num_shiftR = 0;
    let x_widthL = 0;
    let x_widthR = 0;
    let last_line = null;
    let last_note = null;
    for (let i = 0; i < nums_list.length; ++i) {
      const note = nums_list[i].note;
      const pos = nums_list[i].pos;
      const num = nums_list[i].num;
      const line = nums_list[i].line;
      const shiftR = nums_list[i].shiftR;
      // Reset the position of the string number every line.
      if (line !== last_line || note !== last_note) {
        num_shiftR = right_shift + shiftR;
      }

      const num_width = num.getWidth() + num_spacing;
      let num_x_shift = 0;
      if (pos === Modifier.Position.LEFT) {
        num.setXShift(left_shift + extraXSpaceForDisplacedNotehead);
        num_x_shift = num_width; // spacing
        x_widthL = Math.max(num_x_shift, x_widthL);
      } else if (pos === Modifier.Position.RIGHT) {
        num.setXShift(num_shiftR);
        num_x_shift += num_width; // spacing
        x_widthR = num_x_shift > x_widthR ? num_x_shift : x_widthR;
      }
      last_line = line;
      last_note = note;
    }

    state.left_shift += x_widthL;
    state.right_shift += x_widthR;
    return true;
  }

  protected radius: number;
  protected drawCircle: boolean;
  protected last_note?: Note;
  protected string_number: string;
  protected x_offset: number;
  protected y_offset: number;
  protected text_line: number;
  protected stem_offset: number;
  protected dashed: boolean;
  protected leg: number;

  constructor(number: string) {
    super();

    this.string_number = number;
    this.position = Modifier.Position.ABOVE; // Default position above stem or note head
    this.x_shift = 0;
    this.y_shift = 0;
    this.text_line = 0;
    this.stem_offset = 0;
    this.x_offset = 0; // Horizontal offset from default
    this.y_offset = 0; // Vertical offset from default
    this.dashed = true; // true - draw dashed extension  false - no extension
    this.leg = Renderer.LineEndType.NONE; // draw upward/downward leg at the of extension line
    this.radius = 8;
    this.drawCircle = true;
    this.setWidth(this.radius * 2 + 4);
    this.resetFont();
  }

  setLineEndType(leg: number): this {
    if (leg >= Renderer.LineEndType.NONE && leg <= Renderer.LineEndType.DOWN) {
      this.leg = leg;
    }
    return this;
  }

  setStringNumber(number: string): this {
    this.string_number = number;
    return this;
  }

  setOffsetX(x: number): this {
    this.x_offset = x;
    return this;
  }

  setOffsetY(y: number): this {
    this.y_offset = y;
    return this;
  }

  setLastNote(note: Note): this {
    this.last_note = note;
    return this;
  }

  setDashed(dashed: boolean): this {
    this.dashed = dashed;
    return this;
  }

  setDrawCircle(drawCircle: boolean): this {
    this.drawCircle = drawCircle;
    return this;
  }

  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();
    const start = note.getModifierStartXY(this.position, this.index);
    const stemDirection = note.hasStem() ? note.getStemDirection() : Stem.UP;
    let dot_x = start.x + this.x_shift + this.x_offset;
    let stem_ext: Record<string, number> = {};
    if (note.hasStem()) {
      stem_ext = (note as StemmableNote).checkStem().getExtents();
    }

    let dot_y = start.y + this.y_shift + this.y_offset;

    switch (this.position) {
      case Modifier.Position.ABOVE:
        {
          const ys = note.getYs();
          dot_y = ys.reduce((a, b) => (a < b ? a : b));
          if (note.hasStem() && stemDirection == Stem.UP) {
            dot_y = stem_ext.topY + StringNumber.metrics.stemPadding;
          }
          dot_y -= this.radius + StringNumber.metrics.verticalPadding + this.text_line * Tables.STAVE_LINE_DISTANCE;
        }
        break;
      case Modifier.Position.BELOW:
        {
          const ys: number[] = note.getYs();
          dot_y = ys.reduce((a, b) => (a > b ? a : b));
          if (note.hasStem() && stemDirection == Stem.DOWN) {
            dot_y = stem_ext.topY - StringNumber.metrics.stemPadding;
          }
          dot_y += this.radius + StringNumber.metrics.verticalPadding + this.text_line * Tables.STAVE_LINE_DISTANCE;
        }
        break;
      case Modifier.Position.LEFT:
        dot_x -= this.radius / 2 + StringNumber.metrics.leftPadding;
        break;
      case Modifier.Position.RIGHT:
        dot_x += this.radius / 2 + StringNumber.metrics.rightPadding;
        break;
      default:
        throw new RuntimeError('InvalidPosition', `The position ${this.position} is invalid`);
    }

    ctx.save();
    if (this.drawCircle) {
      ctx.beginPath();
      ctx.arc(dot_x, dot_y, this.radius, 0, Math.PI * 2, false);
      ctx.setLineWidth(1.5);
      ctx.stroke();
    }
    ctx.setFont(this.textFont);
    const x = dot_x - ctx.measureText(this.string_number).width / 2;
    ctx.fillText('' + this.string_number, x, dot_y + 4.5);

    const lastNote = this.last_note;
    if (isStemmableNote(lastNote)) {
      // Only StemmableNote objects have getStemX().
      const end = lastNote.getStemX() - note.getX() + 5;
      ctx.setStrokeStyle('#000000');
      ctx.setLineCap('round');
      ctx.setLineWidth(0.6);
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
