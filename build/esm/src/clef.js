import { Glyph } from './glyph.js';
import { StaveModifier, StaveModifierPosition } from './stavemodifier.js';
import { Tables } from './tables.js';
import { defined, log } from './util.js';
function L(...args) {
    if (Clef.DEBUG)
        log('Vex.Flow.Clef', args);
}
class Clef extends StaveModifier {
    static get CATEGORY() {
        return "Clef";
    }
    static get types() {
        return {
            treble: {
                code: 'gClef',
                line: 3,
            },
            bass: {
                code: 'fClef',
                line: 1,
            },
            alto: {
                code: 'cClef',
                line: 2,
            },
            tenor: {
                code: 'cClef',
                line: 1,
            },
            percussion: {
                code: 'unpitchedPercussionClef1',
                line: 2,
            },
            soprano: {
                code: 'cClef',
                line: 4,
            },
            'mezzo-soprano': {
                code: 'cClef',
                line: 3,
            },
            'baritone-c': {
                code: 'cClef',
                line: 0,
            },
            'baritone-f': {
                code: 'fClef',
                line: 2,
            },
            subbass: {
                code: 'fClef',
                line: 0,
            },
            french: {
                code: 'gClef',
                line: 4,
            },
            tab: {
                code: '6stringTabClef',
                line: 2.5,
            },
        };
    }
    static get annotationSmufl() {
        return {
            '8va': 'timeSig8',
            '8vb': 'timeSig8',
        };
    }
    constructor(type, size, annotation) {
        super();
        this.clef = Clef.types['treble'];
        this.setPosition(StaveModifierPosition.BEGIN);
        this.setType(type, size, annotation);
        this.setWidth(Glyph.getWidth(this.clef.code, Clef.getPoint(this.size), `clef_${this.size}`));
        L('Creating clef:', type);
    }
    setType(type, size, annotation) {
        this.type = type;
        this.clef = Clef.types[type];
        if (size === undefined) {
            this.size = 'default';
        }
        else {
            this.size = size;
        }
        const musicFont = Tables.currentMusicFont();
        if (annotation !== undefined) {
            const code = Clef.annotationSmufl[annotation];
            const point = (Clef.getPoint(this.size) / 5) * 3;
            const line = musicFont.lookupMetric(`clef_${this.size}.annotations.${annotation}.${this.type}.line`);
            const x_shift = musicFont.lookupMetric(`clef_${this.size}.annotations.${annotation}.${this.type}.shiftX`);
            this.annotation = { code, point, line, x_shift };
            this.attachment = new Glyph(this.annotation.code, this.annotation.point);
            this.attachment.metrics.x_max = 0;
            this.attachment.setXShift(this.annotation.x_shift);
        }
        else {
            this.annotation = undefined;
        }
        return this;
    }
    getWidth() {
        if (this.type === 'tab') {
            defined(this.stave, 'ClefError', "Can't get width without stave.");
        }
        return this.width;
    }
    static getPoint(size) {
        return size == 'default' ? Tables.NOTATION_FONT_SCALE : (Tables.NOTATION_FONT_SCALE / 3) * 2;
    }
    setStave(stave) {
        this.stave = stave;
        return this;
    }
    draw() {
        const stave = this.checkStave();
        const ctx = stave.checkContext();
        this.setRendered();
        this.applyStyle(ctx);
        ctx.openGroup('clef', this.getAttribute('id'));
        Glyph.renderGlyph(ctx, this.x, stave.getYForLine(this.clef.line), Clef.getPoint(this.size), this.clef.code, {
            category: `clef_${this.size}`,
        });
        if (this.annotation !== undefined && this.attachment !== undefined) {
            this.placeGlyphOnLine(this.attachment, stave, this.annotation.line);
            this.attachment.setStave(stave);
            this.attachment.setContext(ctx);
            this.attachment.renderToStave(this.x);
        }
        ctx.closeGroup();
        this.restoreStyle(ctx);
    }
}
Clef.DEBUG = false;
export { Clef };
