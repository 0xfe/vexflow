// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Mike Corrigan <corrigan@gmail.com>
// MIT License

import { Glyph } from './glyph';
import { GraceNote, isGraceNote } from './gracenote';
import { Modifier } from './modifier';
import { Stem } from './stem';
import { Tables } from './tables';

/** Tremolo implements tremolo notation. */
export class Tremolo extends Modifier {
  static get CATEGORY(): string {
    return 'Tremolo';
  }

  protected readonly code: string;
  protected readonly num: number;

  /**
   * @param num number of bars
   */
  constructor(num: number) {
    super();

    this.num = num;
    this.position = Modifier.Position.CENTER;
    this.code = 'tremolo1';
  }

  /** Draw the tremolo on the rendering context. */
  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const stemDirection = note.getStemDirection();

    const start = note.getModifierStartXY(this.position, this.index);
    let x = start.x;

    const gn = isGraceNote(note);
    const scale = gn ? GraceNote.SCALE : 1;
    const category = `tremolo.${gn ? 'grace' : 'default'}`;

    const musicFont = Tables.currentMusicFont();
    const y_spacing = musicFont.lookupMetric(`${category}.spacing`) * stemDirection;
    const height = this.num * y_spacing;
    let y = note.getStemExtents().baseY - height;

    if (stemDirection < 0) {
      y += musicFont.lookupMetric(`${category}.offsetYStemDown`) * scale;
    } else {
      y += musicFont.lookupMetric(`${category}.offsetYStemUp`) * scale;
    }

    const fontScale = musicFont.lookupMetric(`${category}.point`);

    x += musicFont.lookupMetric(`${category}.offsetXStem${stemDirection === Stem.UP ? 'Up' : 'Down'}`);
    for (let i = 0; i < this.num; ++i) {
      Glyph.renderGlyph(ctx, x, y, fontScale, this.code, { category });
      y += y_spacing;
    }
  }
}
