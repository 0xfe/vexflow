import { Element } from './element.js';
import { Formatter } from './formatter.js';
import { Glyph } from './glyph.js';
import { Stem } from './stem.js';
import { Tables } from './tables.js';
import { defined, RuntimeError } from './util.js';
export class Tuplet extends Element {
    static get CATEGORY() {
        return "Tuplet";
    }
    static get LOCATION_TOP() {
        return 1;
    }
    static get LOCATION_BOTTOM() {
        return -1;
    }
    static get NESTING_OFFSET() {
        return 15;
    }
    static get metrics() {
        const tupletMetrics = Tables.currentMusicFont().getMetrics().tuplet;
        if (!tupletMetrics)
            throw new RuntimeError('BadMetrics', `tuplet missing`);
        return tupletMetrics;
    }
    constructor(notes, options = {}) {
        super();
        this.numerator_glyphs = [];
        this.denom_glyphs = [];
        if (!notes || !notes.length) {
            throw new RuntimeError('BadArguments', 'No notes provided for tuplet.');
        }
        this.options = options;
        this.notes = notes;
        this.num_notes = this.options.num_notes != undefined ? this.options.num_notes : notes.length;
        if (this.options.beats_occupied) {
            this.beatsOccupiedDeprecationWarning();
        }
        this.notes_occupied = this.options.notes_occupied || this.options.beats_occupied || 2;
        if (this.options.bracketed != undefined) {
            this.bracketed = this.options.bracketed;
        }
        else {
            this.bracketed = notes.some((note) => !note.hasBeam());
        }
        this.ratioed =
            this.options.ratioed != undefined ? this.options.ratioed : Math.abs(this.notes_occupied - this.num_notes) > 1;
        this.point = (Tables.NOTATION_FONT_SCALE * 3) / 5;
        this.y_pos = 16;
        this.x_pos = 100;
        this.width = 200;
        this.setTupletLocation(this.options.location || Tuplet.LOCATION_TOP);
        Formatter.AlignRestsToNotes(notes, true, true);
        this.resolveGlyphs();
        this.attach();
    }
    attach() {
        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
            note.setTuplet(this);
        }
    }
    detach() {
        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
            note.resetTuplet(this);
        }
    }
    setBracketed(bracketed) {
        this.bracketed = !!bracketed;
        return this;
    }
    setRatioed(ratioed) {
        this.ratioed = !!ratioed;
        return this;
    }
    setTupletLocation(location) {
        if (location !== Tuplet.LOCATION_TOP && location !== Tuplet.LOCATION_BOTTOM) {
            console.warn(`Invalid tuplet location [${location}]. Using Tuplet.LOCATION_TOP.`);
            location = Tuplet.LOCATION_TOP;
        }
        this.location = location;
        return this;
    }
    getNotes() {
        return this.notes;
    }
    getNoteCount() {
        return this.num_notes;
    }
    beatsOccupiedDeprecationWarning() {
        console.warn('beats_occupied has been deprecated as an option for tuplets. Please use notes_occupied instead.', 'Calls to getBeatsOccupied / setBeatsOccupied should now be routed to getNotesOccupied / setNotesOccupied.', 'The old methods will be removed in VexFlow 5.0.');
    }
    getBeatsOccupied() {
        this.beatsOccupiedDeprecationWarning();
        return this.getNotesOccupied();
    }
    setBeatsOccupied(beats) {
        this.beatsOccupiedDeprecationWarning();
        return this.setNotesOccupied(beats);
    }
    getNotesOccupied() {
        return this.notes_occupied;
    }
    setNotesOccupied(notes) {
        this.detach();
        this.notes_occupied = notes;
        this.resolveGlyphs();
        this.attach();
    }
    resolveGlyphs() {
        this.numerator_glyphs = [];
        let n = this.num_notes;
        while (n >= 1) {
            this.numerator_glyphs.unshift(new Glyph('timeSig' + (n % 10), this.point));
            n = parseInt((n / 10).toString(), 10);
        }
        this.denom_glyphs = [];
        n = this.notes_occupied;
        while (n >= 1) {
            this.denom_glyphs.unshift(new Glyph('timeSig' + (n % 10), this.point));
            n = parseInt((n / 10).toString(), 10);
        }
    }
    getNestedTupletCount() {
        const location = this.location;
        const first_note = this.notes[0];
        let maxTupletCount = countTuplets(first_note, location);
        let minTupletCount = countTuplets(first_note, location);
        function countTuplets(note, location) {
            return note.getTupletStack().filter((tuplet) => tuplet.location === location).length;
        }
        this.notes.forEach((note) => {
            const tupletCount = countTuplets(note, location);
            maxTupletCount = tupletCount > maxTupletCount ? tupletCount : maxTupletCount;
            minTupletCount = tupletCount < minTupletCount ? tupletCount : minTupletCount;
        });
        return maxTupletCount - minTupletCount;
    }
    getYPosition() {
        const nested_tuplet_y_offset = this.getNestedTupletCount() * Tuplet.NESTING_OFFSET * -this.location;
        const y_offset = this.options.y_offset || 0;
        const first_note = this.notes[0];
        let y_pos;
        if (this.location === Tuplet.LOCATION_TOP) {
            y_pos = first_note.checkStave().getYForLine(0) - Tuplet.metrics.topModifierOffset;
            for (let i = 0; i < this.notes.length; ++i) {
                const note = this.notes[i];
                let modLines = 0;
                const mc = note.getModifierContext();
                if (mc) {
                    modLines = Math.max(modLines, mc.getState().top_text_line);
                }
                const modY = note.getYForTopText(modLines) - Tuplet.metrics.noteHeadOffset;
                if (note.hasStem() || note.isRest()) {
                    const top_y = note.getStemDirection() === Stem.UP
                        ? note.getStemExtents().topY - Tuplet.metrics.stemOffset
                        : note.getStemExtents().baseY - Tuplet.metrics.noteHeadOffset;
                    y_pos = Math.min(top_y, y_pos);
                    if (modLines > 0) {
                        y_pos = Math.min(modY, y_pos);
                    }
                }
            }
        }
        else {
            let lineCheck = Tuplet.metrics.bottomLine;
            this.notes.forEach((nn) => {
                const mc = nn.getModifierContext();
                if (mc) {
                    lineCheck = Math.max(lineCheck, mc.getState().text_line + 1);
                }
            });
            y_pos = first_note.checkStave().getYForLine(lineCheck) + Tuplet.metrics.noteHeadOffset;
            for (let i = 0; i < this.notes.length; ++i) {
                if (this.notes[i].hasStem() || this.notes[i].isRest()) {
                    const bottom_y = this.notes[i].getStemDirection() === Stem.UP
                        ? this.notes[i].getStemExtents().baseY + Tuplet.metrics.noteHeadOffset
                        : this.notes[i].getStemExtents().topY + Tuplet.metrics.stemOffset;
                    if (bottom_y > y_pos) {
                        y_pos = bottom_y;
                    }
                }
            }
        }
        return y_pos + nested_tuplet_y_offset + y_offset;
    }
    draw() {
        const ctx = this.checkContext();
        this.setRendered();
        const first_note = this.notes[0];
        const last_note = this.notes[this.notes.length - 1];
        if (!this.bracketed) {
            this.x_pos = first_note.getStemX();
            this.width = last_note.getStemX() - this.x_pos;
        }
        else {
            this.x_pos = first_note.getTieLeftX() - 5;
            this.width = last_note.getTieRightX() - this.x_pos + 5;
        }
        this.y_pos = this.getYPosition();
        const addGlyphWidth = (width, glyph) => width + defined(glyph.getMetrics().width);
        let width = this.numerator_glyphs.reduce(addGlyphWidth, 0);
        if (this.ratioed) {
            width = this.denom_glyphs.reduce(addGlyphWidth, width);
            width += this.point * 0.32;
        }
        const notation_center_x = this.x_pos + this.width / 2;
        const notation_start_x = notation_center_x - width / 2;
        if (this.bracketed) {
            const line_width = this.width / 2 - width / 2 - 5;
            if (line_width > 0) {
                ctx.fillRect(this.x_pos, this.y_pos, line_width, 1);
                ctx.fillRect(this.x_pos + this.width / 2 + width / 2 + 5, this.y_pos, line_width, 1);
                ctx.fillRect(this.x_pos, this.y_pos + (this.location === Tuplet.LOCATION_BOTTOM ? 1 : 0), 1, this.location * 10);
                ctx.fillRect(this.x_pos + this.width, this.y_pos + (this.location === Tuplet.LOCATION_BOTTOM ? 1 : 0), 1, this.location * 10);
            }
        }
        const shiftY = Tables.currentMusicFont().lookupMetric('digits.shiftY', 0);
        let x_offset = 0;
        this.numerator_glyphs.forEach((glyph) => {
            glyph.render(ctx, notation_start_x + x_offset, this.y_pos + this.point / 3 - 2 + shiftY);
            x_offset += defined(glyph.getMetrics().width);
        });
        if (this.ratioed) {
            const colon_x = notation_start_x + x_offset + this.point * 0.16;
            const colon_radius = this.point * 0.06;
            ctx.beginPath();
            ctx.arc(colon_x, this.y_pos - this.point * 0.08, colon_radius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(colon_x, this.y_pos + this.point * 0.12, colon_radius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fill();
            x_offset += this.point * 0.32;
            this.denom_glyphs.forEach((glyph) => {
                glyph.render(ctx, notation_start_x + x_offset, this.y_pos + this.point / 3 - 2 + shiftY);
                x_offset += defined(glyph.getMetrics().width);
            });
        }
    }
}
