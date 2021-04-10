// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { GlyphNote } from './glyphnote';
import { Glyph } from './glyph';

export class RepeatNote extends GlyphNote {
  constructor(type, noteStruct, options) {
    // Smufl Codes
    const CODES = {
      1: 'repeat1Bar',
      2: 'repeat2Bars',
      4: 'repeat4Bars',
      slash: 'repeatBarSlash',
    };

    noteStruct = {
      duration: 'q',
      align_center: type !== 'slash',
      ...noteStruct,
    };

    super(null, { duration: 'q', align_center: type !== 'slash', ...noteStruct }, options);
    this.setAttribute('type', 'RepeatNote');

    const glyphCode = CODES[type] || 'repeat1Bar';
    const glyph = new Glyph(glyphCode, this.musicFont.lookupMetric('repeatNote.point', 40), { category: 'repeatNote' });
    this.setGlyph(glyph);
  }
}
