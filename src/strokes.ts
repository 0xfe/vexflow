// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Larry Kuhns
//
// ## Description
// This file implements the `Stroke` class which renders chord strokes
// that can be arpeggiated, brushed, rasquedo, etc.
import {Modifier} from './modifier';
import {StaveNote} from './stavenote';
import {Glyph} from './glyph';
import {TabNote} from "./tabnote";
import {Note} from "./note";
import {IFont} from "./types/font";
import {IState} from "./types/common";
import {IStrokeOptions, IStrokeRenderOptions} from "./types/stroke";
import {Merge} from "./flow";
import {RuntimeError} from "./runtimeerror";

export enum Type {
  BRUSH_DOWN = 1,
  BRUSH_UP = 2,
  ROLL_DOWN = 3, // Arpeggiated chord
  ROLL_UP = 4,   // Arpeggiated chord
  RASQUEDO_DOWN = 5,
  RASQUEDO_UP = 6,
  ARPEGGIO_DIRECTIONLESS = 7 // Arpeggiated chord without upwards or downwards arrow
}

export class Stroke extends Modifier {
  private readonly options: IStrokeOptions;
  private readonly all_voices: boolean;
  private readonly type: Type;

  private note_end: Note;
  private render_options: IStrokeRenderOptions;
  private font: IFont;

  static get CATEGORY(): string {
    return 'strokes';
  }

  static get Type(): typeof Type {
    return Type;
  }

  // Arrange strokes inside `ModifierContext`
  static format(strokes: Stroke[], state: IState): typeof Stroke|boolean {
    const left_shift = state.left_shift;
    const stroke_spacing = 0;

    if (!strokes || strokes.length === 0) return this;

    const strokeList = strokes.map((stroke) => {
      const note = stroke.getNote();
      if (note instanceof StaveNote) {
        const {line} = note.getKeyProps()[stroke.getIndex()];
        const shift = note.getLeftDisplacedHeadPx();
        return {line, shift, stroke};
      } else {
        const {str: string} = (note as TabNote).getPositions()[stroke.getIndex()];
        return {line: string, shift: 0, stroke};
      }
    });

    const strokeShift = left_shift;

    // There can only be one stroke .. if more than one, they overlay each other
    const xShift = strokeList.reduce((xShift, {stroke, shift}) => {
      stroke.setXShift(strokeShift + shift);
      return Math.max(stroke.getWidth() + stroke_spacing, xShift);
    }, 0);

    state.left_shift += xShift;
    return true;
  }

  constructor(type: number, options: never) {
    super();
    this.setAttribute('type', 'Stroke');

    this.note = null;
    this.options = Merge({} as IStrokeOptions, options);

    // multi voice - span stroke across all voices if true
    this.all_voices = 'all_voices' in this.options ? this.options.all_voices : true;

    // multi voice - end note of stroke, set in draw()
    this.note_end = null;
    this.index = null;
    this.type = type;
    this.position = Modifier.Position.LEFT;

    this.render_options = {
      font_scale: 38,
      stroke_px: 3,
      stroke_spacing: 10,
    };

    this.font = {
      family: 'serif',
      size: 10,
      weight: 'bold italic',
    } as IFont;

    this.setXShift(0);
    this.setWidth(10);
  }

  getCategory(): string {
    return Stroke.CATEGORY;
  }

  getPosition(): number {
    return this.position;
  }

  addEndNote(note: Note): this {
    this.note_end = note;
    return this;
  }

  draw(): void {
    this.checkContext();
    this.setRendered();

    if (!(this.note && (this.index != null))) {
      throw new RuntimeError('NoAttachedNote', "Can't draw stroke without a note and index.");
    }

    const start = this.note.getModifierStartXY(this.position, this.index);
    let ys = this.note.getYs();
    let topY = start.y;
    let botY = start.y;
    const x = start.x - 5;
    const line_space = this.note.stave.options.spacing_between_lines_px;

    const notes = this.getModifierContext().getModifiers(this.note.getCategory()) as Note[];
    for (let i = 0; i < notes.length; i++) {
      ys = notes[i].getYs();
      for (let n = 0; n < ys.length; n++) {
        if (this.note === notes[i] || this.all_voices) {
          topY = Math.min(topY, ys[n]);
          botY = Math.max(botY, ys[n]);
        }
      }
    }

    let arrow;
    let arrow_shift_x;
    let arrow_y;
    let text_shift_x;
    let text_y;

    switch (this.type) {
      case Stroke.Type.BRUSH_DOWN:
        arrow = 'arrowheadBlackUp';
        arrow_shift_x = -3;
        arrow_y = topY - (line_space / 2) + 10;
        botY += (line_space / 2);
        break;
      case Stroke.Type.BRUSH_UP:
        arrow = 'arrowheadBlackDown';
        arrow_shift_x = 0.5;
        arrow_y = botY + (line_space / 2);
        topY -= (line_space / 2);
        break;
      case Stroke.Type.ROLL_DOWN:
      case Stroke.Type.RASQUEDO_DOWN:
        arrow = 'arrowheadBlackUp';
        arrow_shift_x = -3;
        text_shift_x = this.x_shift + arrow_shift_x - 2;
        if (this.note instanceof StaveNote) {
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
        if (this.note instanceof StaveNote) {
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
      this.context.fillRect(x + this.x_shift, topY, 1, botY - topY);
    } else {
      strokeLine = 'wiggly';
      if (this.note instanceof StaveNote) {
        for (let i = topY; i <= botY; i += line_space) {
          Glyph.renderGlyph(
            this.context,
            x + this.x_shift - 4,
            i,
            this.render_options.font_scale,
            'vexWiggleArpeggioUp'
          );
        }
      } else {
        let i;
        for (i = topY; i <= botY; i += 10) {
          Glyph.renderGlyph(
            this.context,
            x + this.x_shift - 4,
            i,
            this.render_options.font_scale,
            'vexWiggleArpeggioUp'
          );
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
    Glyph.renderGlyph(
      this.context,
      x + this.x_shift + arrow_shift_x,
      arrow_y,
      this.render_options.font_scale,
      arrow,
      {category: `stroke.${arrow}.${strokeLine}`}
    );

    // Draw the rasquedo "R"
    if (this.type === Stroke.Type.RASQUEDO_DOWN || this.type === Stroke.Type.RASQUEDO_UP) {
      this.context.save();
      this.context.setFont(this.font.family, this.font.size, this.font.weight);
      this.context.fillText('R', x + text_shift_x, text_y);
      this.context.restore();
    }
  }
}
