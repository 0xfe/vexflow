// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description

import { Vex } from './vex';
import { StemmableNote } from './stemmablenote';

export class GhostNote extends StemmableNote {
  /** @constructor */
  constructor(parameter) {
    // Sanity check
    if (!parameter) {
      throw new Vex.RuntimeError('BadArguments',
        'Ghost note must have valid initialization data to identify ' +
        'duration.');
    }

    let note_struct;

    // Preserve backwards-compatibility
    if (typeof (parameter) === 'string') {
      note_struct = { duration: parameter };
    } else if (typeof (parameter) === 'object') {
      note_struct = parameter;
    } else {
      throw new Vex.RuntimeError('BadArguments',
        'Ghost note must have valid initialization data to identify ' +
        'duration.');
    }

    super(note_struct);
    this.setAttribute('type', 'GhostNote');

    // Note properties
    this.setWidth(0);
  }

  isRest() { return true; }

  setStave(stave) {
    super.setStave(stave);
  }

  addToModifierContext() { /* intentionally overridden */ return this; }

  preFormat() {
    this.setPreFormatted(true);
    return this;
  }

  draw() {
    if (!this.stave) throw new Vex.RERR('NoStave', "Can't draw without a stave.");

    // Draw the modifiers
    this.setRendered();
    for (let i = 0; i < this.modifiers.length; ++i) {
      const modifier = this.modifiers[i];
      modifier.setContext(this.context);
      modifier.draw();
    }
  }
}
