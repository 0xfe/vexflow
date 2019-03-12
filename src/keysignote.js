// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Mark Meeus 2019

import { Note } from './note';
import { KeySignature } from './keysignature';

export class KeySigNote extends Note {
  constructor(keySpec, cancelKeySpec, alterKeySpec) {
    super({ duration: 'b' });
    this.setAttribute('type', 'KeySigNote');

    this.keySignature = new KeySignature(keySpec, cancelKeySpec, alterKeySpec);

    // Note properties
    this.ignore_ticks = true;
  }

  getBoundingBox() {
    return super.getBoundingBox();
  }

  addToModifierContext() {
    /* overridden to ignore */
    return this;
  }

  preFormat() {
    this.setPreFormatted(true);
    this.keySignature.setStave(this.stave);
    this.keySignature.format();
    this.setWidth(this.keySignature.width);
    return this;
  }

  draw() {
    this.stave.checkContext();
    this.setRendered();
    this.keySignature.x = this.getAbsoluteX();
    this.keySignature.setContext(this.context);
    this.keySignature.draw();
  }
}
