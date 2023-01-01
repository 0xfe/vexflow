// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This class implements various types of members to notes (e.g. bends,
// fingering positions etc.).  The ModifierContext works with tickables
// that are at the same tick to ensure that they and their modifiers
// all have proper alignment.  (Note that the ModifierContext also
// runs the spacing of the tickable).
//
// see https://github.com/0xfe/vexflow/wiki/How-Formatting-Works

import { Accidental } from './accidental';
import { Annotation } from './annotation';
import { Articulation } from './articulation';
import { Bend } from './bend';
import { ChordSymbol } from './chordsymbol';
import { Dot } from './dot';
import { FretHandFinger } from './frethandfinger';
import { GraceNoteGroup } from './gracenotegroup';
import { Modifier } from './modifier';
import { Note } from './note';
import { NoteSubGroup } from './notesubgroup';
import { Ornament } from './ornament';
import { Parenthesis } from './parenthesis';
import { StaveNote } from './stavenote';
import { StringNumber } from './stringnumber';
import { Stroke } from './strokes';
import { TabNote } from './tabnote';
import { Tickable } from './tickable';
import { Category } from './typeguard';
import { log, RuntimeError } from './util';
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

export type ModifierContextMember = Tickable | Modifier | StaveNote | TabNote;

// To enable logging for this class. Set `Vex.Flow.ModifierContext.DEBUG` to `true`.
// eslint-disable-next-line
function L(...args: any[]) {
  if (ModifierContext.DEBUG) log('Vex.Flow.ModifierContext', args);
}

export class ModifierContext {
  static DEBUG: boolean = false;

  // Formatting data.
  protected state: ModifierContextState = {
    left_shift: 0,
    right_shift: 0,
    text_line: 0,
    top_text_line: 0,
  };

  // Current members -- a mapping of Category (string) to a list of Tickables, Modifiers,
  // StaveNotes, TabNotes, etc.
  protected members: Record<string, ModifierContextMember[]> = {};

  protected preFormatted: boolean = false;
  protected postFormatted: boolean = false;
  protected formatted: boolean = false;

  protected width: number = 0;
  protected spacing: number = 0;

  addModifier(member: ModifierContextMember): this {
    L('addModifier is deprecated, use addMember instead.');
    return this.addMember(member);
  }

  /**
   * this.members maps CATEGORY strings to arrays of Tickable | Modifier | StaveNote | TabNote.
   * Here we add a new member to this.members, and create a new array if needed.
   * @param member
   * @returns this
   */
  addMember(member: ModifierContextMember): this {
    const category = member.getCategory();
    if (!this.members[category]) {
      this.members[category] = [];
    }
    this.members[category].push(member);
    member.setModifierContext(this);
    this.preFormatted = false;
    return this;
  }

  /**
   * @deprecated
   */
  getModifiers(category: string): ModifierContextMember[] {
    L('getModifiers is deprecated, use getMembers instead.');
    return this.getMembers(category);
  }

  getMembers(category: string): ModifierContextMember[] {
    return this.members[category] ?? [];
  }

  /**
   * Get the width of the entire
   */
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
      throw new RuntimeError('UnformattedMember', 'Unformatted member has no metrics.');
    }

    return {
      width: this.state.left_shift + this.state.right_shift + this.spacing,
      spacing: this.spacing,
    };
  }

  preFormat(): void {
    if (this.preFormatted) return;
    L('Preformatting ModifierContext');

    const state = this.state;
    const members = this.members;

    // The ordering below determines when different members are formatted and rendered.
    StaveNote.format(members[Category.StaveNote] as StaveNote[], state);
    Parenthesis.format(members[Category.Parenthesis] as Parenthesis[], state);
    Dot.format(members[Category.Dot] as Dot[], state);
    FretHandFinger.format(members[Category.FretHandFinger] as FretHandFinger[], state);
    Accidental.format(members[Category.Accidental] as Accidental[], state);
    Stroke.format(members[Category.Stroke] as Stroke[], state);
    GraceNoteGroup.format(members[Category.GraceNoteGroup] as GraceNoteGroup[], state);
    NoteSubGroup.format(members[Category.NoteSubGroup] as NoteSubGroup[], state);
    StringNumber.format(members[Category.StringNumber] as StringNumber[], state);
    Articulation.format(members[Category.Articulation] as Articulation[], state);
    Ornament.format(members[Category.Ornament] as Ornament[], state);
    Annotation.format(members[Category.Annotation] as Annotation[], state);
    ChordSymbol.format(members[Category.ChordSymbol] as ChordSymbol[], state);
    Bend.format(members[Category.Bend] as Bend[], state);
    Vibrato.format(members[Category.Vibrato] as Vibrato[], state, this);

    // Update width of this member context
    this.width = state.left_shift + state.right_shift;
    this.preFormatted = true;
  }

  postFormat(): void {
    if (this.postFormatted) return;
    L('Postformatting ModifierContext');

    // If post-formatting is required for an element, add more lines below.
    StaveNote.postFormat(this.getMembers(Category.StaveNote) as Note[]);
  }
}
