// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { GlyphNote } from './glyphnote';
import { Glyph } from './glyph';
import { NoteStruct } from './note';
import { GlyphNoteOptions } from './glyphnote';

export class RepeatNote extends GlyphNote {
  constructor(type: string, noteStruct?: NoteStruct, options?: GlyphNoteOptions) {
    // Smufl Codes
    const CODES = {
      '1': 'repeat1Bar',
      '2': 'repeat2Bars',
      '4': 'repeat4Bars',
      slash: 'repeatBarSlash',
    } as Record<string, string>;

    super(undefined, { duration: 'q', align_center: type !== 'slash', ...noteStruct }, options);
    this.setAttribute('type', 'RepeatNote');

    const glyphCode = CODES[type] || 'repeat1Bar';
    const glyph = new Glyph(glyphCode, this.musicFont.lookupMetric('repeatNote.point', 40), { category: 'repeatNote' });
    this.setGlyph(glyph);
  }
}
