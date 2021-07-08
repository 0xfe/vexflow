// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Mike Corrigan <corrigan@gmail.com>
// MIT License

import { Modifier } from './modifier';
import { Glyph } from './glyph';
import { GraceNote } from './gracenote';
import { Stem } from './stem';

/** Tremolo implements tremolo notation. */
export class Tremolo extends Modifier {
  protected readonly code: string;
  protected readonly num: number;

  /** Tremolos category string. */
  static get CATEGORY(): string {
    return 'tremolo';
  }

  /**
   * Constructor.
   * @param num number of bars
   */
  constructor(num: number) {
    super();
    this.setAttribute('type', 'Tremolo');

    this.num = num;
    this.position = Modifier.Position.CENTER;
    this.code = 'tremolo1';
  }

  /** Get element CATEGORY string. */
  getCategory(): string {
    return Tremolo.CATEGORY;
  }

  /** Draw the tremolo on the rendering context. */
  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const stemDirection = note.getStemDirection();

    const start = note.getModifierStartXY(this.position, this.index);
    let x = start.x;
    const isGraceNote = note.getCategory() === GraceNote.CATEGORY;
    const scale = isGraceNote ? GraceNote.SCALE : 1;
    const category = `tremolo.${isGraceNote ? 'grace' : 'default'}`;

    const y_spacing = this.musicFont.lookupMetric(`${category}.spacing`) * stemDirection;
    const height = this.num * y_spacing;
    let y = note.getStemExtents().baseY - height;

    if (stemDirection < 0) {
      y += this.musicFont.lookupMetric(`${category}.offsetYStemDown`) * scale;
    } else {
      y += this.musicFont.lookupMetric(`${category}.offsetYStemUp`) * scale;
    }

    const fontScale = this.musicFont.lookupMetric(`${category}.point`);

    x += this.musicFont.lookupMetric(`${category}.offsetXStem${stemDirection === Stem.UP ? 'Up' : 'Down'}`);
    for (let i = 0; i < this.num; ++i) {
      Glyph.renderGlyph(ctx, x, y, fontScale, this.code, { category });
      y += y_spacing;
    }
  }
}
