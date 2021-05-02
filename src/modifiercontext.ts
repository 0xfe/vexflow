// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This class implements various types of modifiers to notes (e.g. bends,
// fingering positions etc.)

import { Vex } from './vex';
import { StaveNote } from './stavenote';
import { Dot } from './dot';
import { FretHandFinger } from './frethandfinger';
import { Accidental } from './accidental';
import { NoteSubGroup } from './notesubgroup';
import { GraceNoteGroup } from './gracenotegroup';
import { Stroke } from './strokes';
import { StringNumber } from './stringnumber';
import { Articulation } from './articulation';
import { Ornament } from './ornament';
import { Annotation } from './annotation';
import { ChordSymbol } from './chordsymbol';
import { Bend } from './bend';
import { Vibrato } from './vibrato';

export interface ModifierContextState {
  right_shift: number;
  left_shift: number;
  text_line: number;
  top_text_line: number;
}

export interface ModifierContextMetrics {
  width: number;
  spacing: number;
}

export type PreformatModifierType =
  | typeof StaveNote
  | typeof Dot
  | typeof FretHandFinger
  | typeof Accidental
  | typeof Stroke
  | typeof GraceNoteGroup
  | typeof NoteSubGroup
  | typeof StringNumber
  | typeof Articulation
  | typeof Ornament
  | typeof Annotation
  | typeof ChordSymbol
  | typeof Bend
  | typeof Vibrato;

export type PostformatModifierType = typeof StaveNote;

export type ModifierClass =
  | StaveNote
  | Dot
  | FretHandFinger
  | Accidental
  | Stroke
  | GraceNoteGroup
  | NoteSubGroup
  | StringNumber
  | Articulation
  | Ornament
  | Annotation
  | ChordSymbol
  | Bend
  | Vibrato;

// To enable logging for this class. Set `Vex.Flow.ModifierContext.DEBUG` to `true`.
function L(
  // eslint-disable-next-line
  ...args: any[]) {
  if (ModifierContext.DEBUG) Vex.L('Vex.Flow.ModifierContext', args);
}

export class ModifierContext {
  static DEBUG: boolean;

  state: ModifierContextState;

  protected postFormatted: boolean;
  protected spacing: number;
  protected modifiers: Record<string, ModifierClass[]>;

  protected preFormatted: boolean;
  protected width: number;
  protected formatted?: boolean;
  protected PREFORMAT: PreformatModifierType[];
  protected POSTFORMAT: PostformatModifierType[];

  constructor() {
    // Current modifiers
    this.modifiers = {};

    // Formatting data.
    this.preFormatted = false;
    this.postFormatted = false;
    this.width = 0;
    this.spacing = 0;
    this.state = {
      left_shift: 0,
      right_shift: 0,
      text_line: 0,
      top_text_line: 0,
    };

    // Add new modifiers to this array. The ordering is significant -- lower
    // modifiers are formatted and rendered before higher ones.
    this.PREFORMAT = [
      StaveNote,
      Dot,
      FretHandFinger,
      Accidental,
      Stroke,
      GraceNoteGroup,
      NoteSubGroup,
      StringNumber,
      Articulation,
      Ornament,
      Annotation,
      ChordSymbol,
      Bend,
      Vibrato,
    ];

    // If post-formatting is required for an element, add it to this array.
    this.POSTFORMAT = [StaveNote];
  }

  addModifier(modifier: ModifierClass): this {
    const type = modifier.getCategory();
    if (!this.modifiers[type]) this.modifiers[type] = [];
    this.modifiers[type].push(modifier);
    modifier.setModifierContext(this);
    this.preFormatted = false;
    return this;
  }

  getModifiers(type: string): ModifierClass[] {
    return this.modifiers[type];
  }

  getWidth(): number {
    return this.width;
  }

  getLeftShift(): number {
    return this.state.left_shift;
  }

  getRightShift(): number {
    return this.state.right_shift;
  }

  getState(): ModifierContextState {
    return this.state;
  }

  getMetrics(): ModifierContextMetrics {
    if (!this.formatted) {
      throw new Vex.RERR('UnformattedModifier', 'Unformatted modifier has no metrics.');
    }

    return {
      width: this.state.left_shift + this.state.right_shift + this.spacing,
      spacing: this.spacing,
    };
  }

  preFormat(): void {
    if (this.preFormatted) return;
    this.PREFORMAT.forEach((modifier) => {
      L('Preformatting ModifierContext: ', modifier.CATEGORY);
      modifier.format(this.getModifiers(modifier.CATEGORY), this.state, this);
    });

    // Update width of this modifier context
    this.width = this.state.left_shift + this.state.right_shift;
    this.preFormatted = true;
  }

  postFormat(): void {
    if (this.postFormatted) return;
    this.POSTFORMAT.forEach((modifier) => {
      L('Postformatting ModifierContext: ', modifier.CATEGORY);
      modifier.postFormat(this.getModifiers(modifier.CATEGORY) as StaveNote[]);
    });
  }
}
