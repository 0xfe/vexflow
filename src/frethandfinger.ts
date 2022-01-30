// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Larry Kuhns 2013
// Class to draws string numbers into the notation.

import { Builder } from './easyscore';
import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Modifier, ModifierPosition } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { TextFormatter } from './textformatter';
import { Category } from './typeguard';
import { RuntimeError } from './util';

export class FretHandFinger extends Modifier {
  static get CATEGORY(): string {
    return Category.FretHandFinger;
  }

  static TEXT_FONT: Required<FontInfo> = {
    family: Font.SANS_SERIF,
    size: 9,
    weight: FontWeight.BOLD,
    style: FontStyle.NORMAL,
  };

  // Arrange fingerings inside a ModifierContext.
  static format(nums: FretHandFinger[], state: ModifierContextState): boolean {
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
      const index = num.checkIndex();
      const props = note.getKeyProps()[index];
      const textFormatter = TextFormatter.create(num.textFont);
      const textHeight = textFormatter.maxHeight;
      if (num.position === ModifierPosition.ABOVE) {
        state.top_text_line += textHeight / Tables.STAVE_LINE_DISTANCE + 0.5;
      }
      if (num.position === ModifierPosition.BELOW) {
        state.text_line += textHeight / Tables.STAVE_LINE_DISTANCE + 0.5;
      }

      if (note !== prev_note) {
        for (let n = 0; n < note.keys.length; ++n) {
          if (left_shift === 0) {
            shiftLeft = Math.max(note.getLeftDisplacedHeadPx(), shiftLeft);
          }
          if (right_shift === 0) {
            shiftRight = Math.max(note.getRightDisplacedHeadPx(), shiftRight);
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

  static easyScoreHook({ fingerings }: { fingerings?: string } = {}, note: StemmableNote, builder: Builder): void {
    fingerings
      ?.split(',')
      .map((fingeringString: string) => {
        const split = fingeringString.trim().split('.');
        const params: { number: string; position?: string } = { number: split[0] };
        if (split[1]) params.position = split[1];
        return builder.getFactory().Fingering(params);
      })
      .map((fingering: Modifier, index: number) => note.addModifier(fingering, index));
  }

  protected finger: string;
  protected x_offset: number;
  protected y_offset: number;

  constructor(finger: string) {
    super();

    this.finger = finger;
    this.width = 7;
    this.position = Modifier.Position.LEFT; // Default position above stem or note head
    this.x_shift = 0;
    this.y_shift = 0;
    this.x_offset = 0; // Horizontal offset from default
    this.y_offset = 0; // Vertical offset from default
    this.resetFont();
  }

  setFretHandFinger(finger: string): this {
    this.finger = finger;
    return this;
  }

  getFretHandFinger(): string {
    return this.finger;
  }

  setOffsetX(x: number): this {
    this.x_offset = x;
    return this;
  }

  setOffsetY(y: number): this {
    this.y_offset = y;
    return this;
  }

  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const start = note.getModifierStartXY(this.position, this.index);
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
        throw new RuntimeError('InvalidPosition', `The position ${this.position} does not exist`);
    }

    ctx.save();
    ctx.setFont(this.textFont);
    ctx.fillText('' + this.finger, dot_x, dot_y);
    ctx.restore();
  }
}
