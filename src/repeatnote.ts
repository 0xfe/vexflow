// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { Glyph } from './glyph';
import { GlyphNote, GlyphNoteOptions } from './glyphnote';
import { NoteStruct } from './note';
import { Tables } from './tables';
import { Category } from './typeguard';

// Map `type` to SMuFL glyph code.
const CODES: Record<string, string> = {
  '1': 'repeat1Bar',
  '2': 'repeat2Bars',
  '4': 'repeat4Bars',
  slash: 'repeatBarSlash',
};

export class RepeatNote extends GlyphNote {
  static get CATEGORY(): string {
    return Category.RepeatNote;
  }

  constructor(type: string, noteStruct?: NoteStruct, options?: GlyphNoteOptions) {
    const glyphCode = CODES[type] || 'repeat1Bar';
    const glyph = new Glyph(glyphCode, Tables.currentMusicFont().lookupMetric('repeatNote.point', 40), {
      category: 'repeatNote',
    });
    super(glyph, { duration: 'q', align_center: type !== 'slash', ...noteStruct }, options);
  }
}
