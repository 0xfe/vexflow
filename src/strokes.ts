// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Larry Kuhns
//
// This file implements the `Stroke` class which renders chord strokes
// that can be arpeggiated, brushed, rasquedo, etc.

import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Glyph } from './glyph';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
import { Tables } from './tables';
import { Category, isNote, isStaveNote, isTabNote } from './typeguard';
import { RuntimeError } from './util';

export class Stroke extends Modifier {
  static get CATEGORY(): string {
    return Category.Stroke;
  }

  static readonly Type = {
    BRUSH_DOWN: 1,
    BRUSH_UP: 2,
    ROLL_DOWN: 3, // Arpeggiated chord
    ROLL_UP: 4, // Arpeggiated chord
    RASQUEDO_DOWN: 5,
    RASQUEDO_UP: 6,
    ARPEGGIO_DIRECTIONLESS: 7, // Arpeggiated chord without upwards or downwards arrow
  };

  static TEXT_FONT: Required<FontInfo> = {
    family: Font.SERIF,
    size: Font.SIZE,
    weight: FontWeight.BOLD,
    style: FontStyle.ITALIC,
  };

  // Arrange strokes inside `ModifierContext`
  static format(strokes: Stroke[], state: ModifierContextState): boolean {
    const left_shift = state.left_shift;
    const stroke_spacing = 0;

    if (!strokes || strokes.length === 0) return false;

    const strokeList = strokes.map((stroke) => {
      const note = stroke.getNote();
      const index = stroke.checkIndex();
      if (isStaveNote(note)) {
        // Only StaveNote objects have getKeyProps().
        const { line } = note.getKeyProps()[index];
        const shift = note.getLeftDisplacedHeadPx();
        return { line, shift, stroke };
      } else if (isTabNote(note)) {
        // Only TabNote objects have getPositions().
        const { str: string } = note.getPositions()[index];
        return { line: string, shift: 0, stroke };
      } else {
        throw new RuntimeError('Internal', 'Unexpected instance.');
      }
    });

    const strokeShift = left_shift;

    // There can only be one stroke .. if more than one, they overlay each other
    const xShift = strokeList.reduce((xShift, { stroke, shift }) => {
      stroke.setXShift(strokeShift + shift);
      return Math.max(stroke.getWidth() + stroke_spacing, xShift);
    }, 0);

    state.left_shift += xShift;

    return true;
  }

  protected options: { all_voices: boolean };
  protected all_voices: boolean;
  protected type: number;
  protected note_end?: Note;
  public render_options: {
    font_scale: number;
  };

  constructor(type: number, options?: { all_voices: boolean }) {
    super();

    this.options = { all_voices: true, ...options };

    // multi voice - span stroke across all voices if true
    this.all_voices = this.options.all_voices;

    // multi voice - end note of stroke, set in draw()
    this.type = type;
    this.position = Modifier.Position.LEFT;

    this.render_options = {
      font_scale: Tables.NOTATION_FONT_SCALE,
    };

    this.resetFont();

    this.setXShift(0);
    this.setWidth(10);
  }

  getPosition(): number {
    return this.position;
  }

  addEndNote(note: Note): this {
    this.note_end = note;
    return this;
  }

  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const start = note.getModifierStartXY(this.position, this.index);
    let ys = note.getYs();
    let topY = start.y;
    let botY = start.y;
    const x = start.x - 5;
    const line_space = note.checkStave().getSpacingBetweenLines();

    const notes = this.checkModifierContext().getMembers(note.getCategory());
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      if (isNote(note)) {
        // Only Note objects have getYs().
        // note is an instance of either StaveNote or TabNote.
        ys = note.getYs();
        for (let n = 0; n < ys.length; n++) {
          if (this.note === notes[i] || this.all_voices) {
            topY = Math.min(topY, ys[n]);
            botY = Math.max(botY, ys[n]);
          }
        }
      }
    }

    let arrow = '';
    let arrow_shift_x = 0;
    let arrow_y = 0;
    let text_shift_x = 0;
    let text_y = 0;

    switch (this.type) {
      case Stroke.Type.BRUSH_DOWN:
        arrow = 'arrowheadBlackUp';
        arrow_shift_x = -3;
        arrow_y = topY - line_space / 2 + 10;
        botY += line_space / 2;
        break;
      case Stroke.Type.BRUSH_UP:
        arrow = 'arrowheadBlackDown';
        arrow_shift_x = 0.5;
        arrow_y = botY + line_space / 2;
        topY -= line_space / 2;
        break;
      case Stroke.Type.ROLL_DOWN:
      case Stroke.Type.RASQUEDO_DOWN:
        arrow = 'arrowheadBlackUp';
        arrow_shift_x = -3;
        text_shift_x = this.x_shift + arrow_shift_x - 2;
        if (isStaveNote(note)) {
          topY += 1.5 * line_space;
          if ((botY - topY) % 2 !== 0) {
            botY += 0.5 * line_space;
          } else {
            botY += line_space;
          }
          arrow_y = topY - line_space;
          text_y = botY + line_space + 2;
        } else {
          topY += 1.5 * line_space;
          botY += line_space;
          arrow_y = topY - 0.75 * line_space;
          text_y = botY + 0.25 * line_space;
        }
        break;
      case Stroke.Type.ROLL_UP:
      case Stroke.Type.RASQUEDO_UP:
        arrow = 'arrowheadBlackDown';
        arrow_shift_x = -4;
        text_shift_x = this.x_shift + arrow_shift_x - 1;
        if (isStaveNote(note)) {
          arrow_y = line_space / 2;
          topY += 0.5 * line_space;
          if ((botY - topY) % 2 === 0) {
            botY += line_space / 2;
          }
          arrow_y = botY + 0.5 * line_space;
          text_y = topY - 1.25 * line_space;
        } else {
          topY += 0.25 * line_space;
          botY += 0.5 * line_space;
          arrow_y = botY + 0.25 * line_space;
          text_y = topY - line_space;
        }
        break;
      case Stroke.Type.ARPEGGIO_DIRECTIONLESS:
        topY += 0.5 * line_space;
        botY += line_space; // * 0.5 can lead to slight underlap instead of overlap sometimes
        break;
      default:
        throw new RuntimeError('InvalidType', `The stroke type ${this.type} does not exist`);
    }

    let strokeLine = 'straight';
    // Draw the stroke
    if (this.type === Stroke.Type.BRUSH_DOWN || this.type === Stroke.Type.BRUSH_UP) {
      ctx.fillRect(x + this.x_shift, topY, 1, botY - topY);
    } else {
      strokeLine = 'wiggly';
      if (isStaveNote(note)) {
        for (let i = topY; i <= botY; i += line_space) {
          Glyph.renderGlyph(ctx, x + this.x_shift - 4, i, this.render_options.font_scale, 'vexWiggleArpeggioUp');
        }
      } else {
        let i;
        for (i = topY; i <= botY; i += 10) {
          Glyph.renderGlyph(ctx, x + this.x_shift - 4, i, this.render_options.font_scale, 'vexWiggleArpeggioUp');
        }
        if (this.type === Stroke.Type.RASQUEDO_DOWN) {
          text_y = i + 0.25 * line_space;
        }
      }
    }

    if (this.type === Stroke.Type.ARPEGGIO_DIRECTIONLESS) {
      return; // skip drawing arrow heads or text
    }

    // Draw the arrow head
    Glyph.renderGlyph(ctx, x + this.x_shift + arrow_shift_x, arrow_y, this.render_options.font_scale, arrow, {
      category: `stroke_${strokeLine}.${arrow}`,
    });

    // Draw the rasquedo "R"
    if (this.type === Stroke.Type.RASQUEDO_DOWN || this.type === Stroke.Type.RASQUEDO_UP) {
      ctx.save();
      ctx.setFont(this.textFont);
      ctx.fillText('R', x + text_shift_x, text_y);
      ctx.restore();
    }
  }
}
