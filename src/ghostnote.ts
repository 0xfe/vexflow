// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description

import { RuntimeError } from './util';
import { StemmableNote } from './stemmablenote';
import { Stave } from './stave';
import { NoteStruct } from './note';
import { ModifierContext } from './modifiercontext';

const ERROR_MSG = 'Ghost note must have valid initialization data to identify duration.';

export class GhostNote extends StemmableNote {
  static get CATEGORY(): string {
    return 'GhostNote';
  }

  constructor(parameter: string | NoteStruct) {
    if (!parameter) {
      throw new RuntimeError('BadArguments', ERROR_MSG);
    }

    let noteStruct;
    if (typeof parameter === 'string') {
      // Preserve backwards-compatibility
      noteStruct = { duration: parameter };
    } else if (typeof parameter === 'object') {
      noteStruct = parameter;
    } else {
      throw new RuntimeError('BadArguments', ERROR_MSG);
    }

    super(noteStruct);

    // Note properties
    this.setWidth(0);
  }

  /**
   * @returns true if this note is a type of rest. Rests don't have pitches, but take up space in the score.
   */
  isRest(): boolean {
    return true;
  }

  setStave(stave: Stave): this {
    super.setStave(stave);
    return this;
  }

  /* Overridden to ignore */
  // eslint-disable-next-line
  addToModifierContext(mc: ModifierContext): this {
    // DO NOTHING.
    return this;
  }

  preFormat(): this {
    this.setPreFormatted(true);
    return this;
  }

  draw(): void {
    // Draw the modifiers
    this.setRendered();
    for (let i = 0; i < this.modifiers.length; ++i) {
      const modifier = this.modifiers[i];
      modifier.setContext(this.getContext());
      modifier.drawWithStyle();
    }
  }
}
