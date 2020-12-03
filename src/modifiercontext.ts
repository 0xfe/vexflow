// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This class implements various types of modifiers to notes (e.g. bends,
// fingering positions etc.)

import {Vex} from './vex';
import {StaveNote} from './stavenote';
import {Dot} from './dot';
import {FretHandFinger} from './frethandfinger';
import {Accidental} from './accidental';
import {NoteSubGroup} from './notesubgroup';
import {GraceNoteGroup} from './gracenotegroup';
import {Stroke} from './strokes';
import {StringNumber} from './stringnumber';
import {Articulation} from './articulation';
import {Ornament} from './ornament';
import {Annotation} from './annotation';
import {ChordSymbol} from './chordsymbol';
import {Bend} from './bend';
import {Vibrato} from './vibrato';
import {IModifierContextState} from "./types/common";
import {
  IModifierContextMetrics,
  ModifierClass,
  PostformatModifierType,
  PreformatModifierType
} from "./types/modifiercontext";

// To enable logging for this class. Set `Vex.Flow.ModifierContext.DEBUG` to `true`.
function L(...args: unknown[]) {
  if (ModifierContext.DEBUG) Vex.L('Vex.Flow.ModifierContext', args);
}

export class ModifierContext {
  static DEBUG: boolean;

  state: IModifierContextState;

  private readonly postFormatted: boolean;
  private readonly spacing: number;
  private readonly modifiers: Record<string, ModifierClass[]>;

  private preFormatted: boolean;
  private width: number;
  private formatted: boolean;
  private PREFORMAT: PreformatModifierType[];
  private POSTFORMAT: PostformatModifierType[];

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

  getState(): IModifierContextState {
    return this.state;
  }

  getMetrics(): IModifierContextMetrics {
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
      modifier.format(this.getModifiers(modifier.CATEGORY) as any, this.state, this);
    });

    // Update width of this modifier context
    this.width = this.state.left_shift + this.state.right_shift;
    this.preFormatted = true;
  }

  postFormat(): void {
    if (this.postFormatted) return;
    this.POSTFORMAT.forEach((modifier) => {
      L('Postformatting ModifierContext: ', modifier.CATEGORY);
      modifier.postFormat((this.getModifiers(modifier.CATEGORY) as StaveNote[]), this);
    });
  }
}
