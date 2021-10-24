// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This class implements various types of members to notes (e.g. bends,
// fingering positions etc.)

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
import { StaveNote } from './stavenote';
import { StringNumber } from './stringnumber';
import { Stroke } from './strokes';
import { TabNote } from './tabnote';
import { Tickable } from './tickable';
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
  static DEBUG: boolean;

  state: ModifierContextState;

  protected spacing: number;
  protected members: Record<string, ModifierContextMember[]>;

  protected preFormatted: boolean = false;
  protected postFormatted: boolean = false;
  protected width: number;
  protected formatted?: boolean;
  // eslint-disable-next-line
  protected PREFORMAT: any[];
  // eslint-disable-next-line
  protected POSTFORMAT: any[];

  constructor() {
    // Current members
    this.members = {};

    // Formatting data.
    this.width = 0;
    this.spacing = 0;
    this.state = {
      left_shift: 0,
      right_shift: 0,
      text_line: 0,
      top_text_line: 0,
    };

    // Add new members to this array. The ordering is significant -- lower
    // members are formatted and rendered before higher ones.
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
    return this.members[category];
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
      throw new RuntimeError('UnformattedMember', 'Unformatted member has no metrics.');
    }

    return {
      width: this.state.left_shift + this.state.right_shift + this.spacing,
      spacing: this.spacing,
    };
  }

  preFormat(): void {
    if (this.preFormatted) return;
    this.PREFORMAT.forEach((member) => {
      L('Preformatting ModifierContext: ', member.CATEGORY);
      member.format(this.getMembers(member.CATEGORY), this.state, this);
    });

    // Update width of this member context
    this.width = this.state.left_shift + this.state.right_shift;
    this.preFormatted = true;
  }

  postFormat(): void {
    if (this.postFormatted) return;
    this.POSTFORMAT.forEach((member) => {
      L('Postformatting ModifierContext: ', member.CATEGORY);
      member.postFormat(this.getMembers(member.CATEGORY) as Note[]);
    });
  }
}
