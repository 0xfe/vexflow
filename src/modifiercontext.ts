// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This class implements various types of members to notes (e.g. bends,
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
import { Modifier } from './modifier';
import { TabNote } from './tabnote';

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

export type ModifierContextMember = Modifier | StaveNote | TabNote;

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
  protected members: Record<string, ModifierContextMember[]>;

  protected preFormatted: boolean;
  protected width: number;
  protected formatted?: boolean;
  protected PREFORMAT: PreformatModifierType[];
  protected POSTFORMAT: PostformatModifierType[];

  constructor() {
    // Current members
    this.members = {};

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

  addMember(member: ModifierContextMember): this {
    const type = member.getCategory();
    if (!this.members[type]) this.members[type] = [];
    this.members[type].push(member);
    member.setModifierContext(this);
    this.preFormatted = false;
    return this;
  }

  getMembers(type: string): ModifierContextMember[] {
    return this.members[type];
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
      throw new Vex.RERR('UnformattedMember', 'Unformatted member has no metrics.');
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
      member.postFormat(this.getMembers(member.CATEGORY) as StaveNote[]);
    });
  }
}
