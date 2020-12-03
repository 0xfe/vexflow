// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Mark Meeus 2019

import {Note} from './note';
import {KeySignature} from './keysignature';
import {IStaveNoteStruct} from "./types/note";
import {BoundingBox} from "./boundingbox";

export class KeySigNote extends Note {
  private keySignature: KeySignature;

  constructor(keySpec: string, cancelKeySpec: string, alterKeySpec: string) {
    super({duration: 'b'} as IStaveNoteStruct);
    this.setAttribute('type', 'KeySigNote');

    this.keySignature = new KeySignature(keySpec, cancelKeySpec, alterKeySpec);

    // Note properties
    this.ignore_ticks = true;
  }

  getBoundingBox(): BoundingBox {
    return super.getBoundingBox();
  }

  addToModifierContext(): this {
    /* overridden to ignore */
    return this;
  }

  preFormat(): this {
    this.setPreFormatted(true);
    this.keySignature.setStave(this.stave);
    this.keySignature.format();
    this.setWidth(this.keySignature.width);
    return this;
  }

  draw(): void {
    this.stave.checkContext();
    this.setRendered();
    this.keySignature.x = this.getAbsoluteX();
    this.keySignature.setContext(this.context);
    this.keySignature.draw();
  }
}
