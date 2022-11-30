import { Glyph } from './glyph.js';
import { StaveModifier, StaveModifierPosition } from './stavemodifier.js';
import { Tables } from './tables.js';
import { defined, log } from './util.js';
function L(...args) {
    if (Clef.DEBUG)
        log('Vex.Flow.Clef', args);
}
export class Clef extends StaveModifier {
    constructor(type, size, annotation) {
        super();
        this.clef = Clef.types['treble'];
        this.setPosition(StaveModifierPosition.BEGIN);
        this.setType(type, size, annotation);
        this.setWidth(Tables.currentMusicFont().lookupMetric(`clef.${this.size}.width`));
        L('Creating clef:', type);
    }
    static get CATEGORY() {
        return "Clef";
    }
    static get types() {
        return {
            treble: {
                code: 'gClef',
                line: 3,
                point: 0,
            },
            bass: {
                code: 'fClef',
                line: 1,
                point: 0,
            },
            alto: {
                code: 'cClef',
                line: 2,
                point: 0,
            },
            tenor: {
                code: 'cClef',
                line: 1,
                point: 0,
            },
            percussion: {
                code: 'restMaxima',
                line: 2,
                point: 0,
            },
            soprano: {
                code: 'cClef',
                line: 4,
                point: 0,
            },
            'mezzo-soprano': {
                code: 'cClef',
                line: 3,
                point: 0,
            },
            'baritone-c': {
                code: 'cClef',
                line: 0,
                point: 0,
            },
            'baritone-f': {
                code: 'fClef',
                line: 2,
                point: 0,
            },
            subbass: {
                code: 'fClef',
                line: 0,
                point: 0,
            },
            french: {
                code: 'gClef',
                line: 4,
                point: 0,
            },
            tab: {
                code: '6stringTabClef',
                point: 0,
            },
        };
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
        this.clef.point = musicFont.lookupMetric(`clef.${this.size}.point`, 0);
        this.glyph = new Glyph(this.clef.code, this.clef.point, {
            category: `clef.${this.clef.code}.${this.size}`,
        });
        if (annotation !== undefined) {
            const code = musicFont.lookupMetric(`clef.annotations.${annotation}.smuflCode`);
            const point = musicFont.lookupMetric(`clef.annotations.${annotation}.${this.size}.point`);
            const line = musicFont.lookupMetric(`clef.annotations.${annotation}.${this.size}.${this.type}.line`);
            const x_shift = musicFont.lookupMetric(`clef.annotations.${annotation}.${this.size}.${this.type}.shiftX`);
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
    setStave(stave) {
        this.stave = stave;
        if (this.type === 'tab') {
            const glyph = defined(this.glyph, 'ClefError', "Can't set stave without glyph.");
            const numLines = this.stave.getNumLines();
            const musicFont = Tables.currentMusicFont();
            const point = musicFont.lookupMetric(`clef.lineCount.${numLines}.point`);
            const shiftY = musicFont.lookupMetric(`clef.lineCount.${numLines}.shiftY`);
            glyph.setPoint(point);
            glyph.setYShift(shiftY);
        }
        return this;
    }
    draw() {
        const glyph = defined(this.glyph, 'ClefError', "Can't draw clef without glyph.");
        const stave = this.checkStave();
        const ctx = stave.checkContext();
        this.setRendered();
        this.applyStyle(ctx);
        ctx.openGroup('clef', this.getAttribute('id'));
        glyph.setStave(stave);
        glyph.setContext(ctx);
        if (this.clef.line !== undefined) {
            this.placeGlyphOnLine(glyph, stave, this.clef.line);
        }
        glyph.renderToStave(this.x);
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
