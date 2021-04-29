// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Mark Meeus 2019

import { Vex } from './vex';
import { Note } from './note';
import { KeySignature } from './keysignature';

export class KeySigNote extends Note {
  protected keySignature: KeySignature;
  constructor(keySpec: string, cancelKeySpec: string, alterKeySpec: string) {
    super({ duration: 'b' });
    this.setAttribute('type', 'KeySigNote');

    this.keySignature = new KeySignature(keySpec, cancelKeySpec, alterKeySpec);

    // Note properties
    this.ignore_ticks = true;
  }

  addToModifierContext(): this {
    /* overridden to ignore */
    return this;
  }

  preFormat(): this {
    if (!this.stave) {
      throw new Vex.RERR('NoStave', 'No stave attached to this note.');
    }
    this.setPreFormatted(true);
    this.keySignature.setStave(this.stave);
    this.keySignature.format();
    this.setWidth(this.keySignature.width);
    return this;
  }

  draw(): void {
    if (!this.stave) {
      throw new Vex.RERR('NoStave', 'No stave attached to this note.');
    }

    const ctx = this.stave.checkContext();
    this.setRendered();
    this.keySignature.setX(this.getAbsoluteX());
    this.keySignature.setContext(ctx);
    this.keySignature.draw();
  }
}
