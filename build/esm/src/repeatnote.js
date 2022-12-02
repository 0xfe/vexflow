import { Glyph } from './glyph.js';
import { GlyphNote } from './glyphnote.js';
import { Tables } from './tables.js';
const CODES = {
    '1': 'repeat1Bar',
    '2': 'repeat2Bars',
    '4': 'repeat4Bars',
    slash: 'repeatBarSlash',
};
export class RepeatNote extends GlyphNote {
    static get CATEGORY() {
        return "RepeatNote";
    }
    constructor(type, noteStruct, options) {
        const glyphCode = CODES[type] || 'repeat1Bar';
        const glyph = new Glyph(glyphCode, Tables.currentMusicFont().lookupMetric('repeatNote.point', 40), {
            category: 'repeatNote',
        });
        super(glyph, Object.assign({ duration: 'q', align_center: type !== 'slash' }, noteStruct), options);
    }
}
