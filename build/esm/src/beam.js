import { Element } from './element.js';
import { Fraction } from './fraction.js';
import { Stem } from './stem.js';
import { Tables } from './tables.js';
import { isStaveNote, isTabNote } from './typeguard.js';
import { RuntimeError } from './util.js';
function calculateStemDirection(notes) {
    let lineSum = 0;
    notes.forEach((note) => {
        if (note.keyProps) {
            note.keyProps.forEach((keyProp) => {
                lineSum += keyProp.line - 3;
            });
        }
    });
    if (lineSum >= 0) {
        return Stem.DOWN;
    }
    return Stem.UP;
}
function getStemSlope(firstNote, lastNote) {
    const firstStemTipY = firstNote.getStemExtents().topY;
    const firstStemX = firstNote.getStemX();
    const lastStemTipY = lastNote.getStemExtents().topY;
    const lastStemX = lastNote.getStemX();
    return (lastStemTipY - firstStemTipY) / (lastStemX - firstStemX);
}
export const BEAM_LEFT = 'L';
export const BEAM_RIGHT = 'R';
export const BEAM_BOTH = 'B';
export class Beam extends Element {
    static get CATEGORY() {
        return "Beam";
    }
    getStemDirection() {
        return this.stem_direction;
    }
    static getDefaultBeamGroups(time_sig) {
        if (!time_sig || time_sig === 'c') {
            time_sig = '4/4';
        }
        const defaults = {
            '1/2': ['1/2'],
            '2/2': ['1/2'],
            '3/2': ['1/2'],
            '4/2': ['1/2'],
            '1/4': ['1/4'],
            '2/4': ['1/4'],
            '3/4': ['1/4'],
            '4/4': ['1/4'],
            '1/8': ['1/8'],
            '2/8': ['2/8'],
            '3/8': ['3/8'],
            '4/8': ['2/8'],
            '1/16': ['1/16'],
            '2/16': ['2/16'],
            '3/16': ['3/16'],
            '4/16': ['2/16'],
        };
        const groups = defaults[time_sig];
        if (groups === undefined) {
            const beatTotal = parseInt(time_sig.split('/')[0], 10);
            const beatValue = parseInt(time_sig.split('/')[1], 10);
            const tripleMeter = beatTotal % 3 === 0;
            if (tripleMeter) {
                return [new Fraction(3, beatValue)];
            }
            else if (beatValue > 4) {
                return [new Fraction(2, beatValue)];
            }
            else if (beatValue <= 4) {
                return [new Fraction(1, beatValue)];
            }
        }
        else {
            return groups.map((group) => new Fraction().parse(group));
        }
        return [new Fraction(1, 4)];
    }
    static applyAndGetBeams(voice, stem_direction, groups) {
        return Beam.generateBeams(voice.getTickables(), { groups, stem_direction });
    }
    static generateBeams(notes, config = {}) {
        if (!config.groups || !config.groups.length) {
            config.groups = [new Fraction(2, 8)];
        }
        const tickGroups = config.groups.map((group) => {
            if (!group.multiply) {
                throw new RuntimeError('InvalidBeamGroups', 'The beam groups must be an array of Vex.Flow.Fractions');
            }
            return group.clone().multiply(Tables.RESOLUTION, 1);
        });
        const unprocessedNotes = notes;
        let currentTickGroup = 0;
        let noteGroups = [];
        let currentGroup = [];
        function getTotalTicks(vf_notes) {
            return vf_notes.reduce((memo, note) => note.getTicks().clone().add(memo), new Fraction(0, 1));
        }
        function nextTickGroup() {
            if (tickGroups.length - 1 > currentTickGroup) {
                currentTickGroup += 1;
            }
            else {
                currentTickGroup = 0;
            }
        }
        function createGroups() {
            let nextGroup = [];
            let currentGroupTotalTicks = new Fraction(0, 1);
            unprocessedNotes.forEach((unprocessedNote) => {
                nextGroup = [];
                if (unprocessedNote.shouldIgnoreTicks()) {
                    noteGroups.push(currentGroup);
                    currentGroup = nextGroup;
                    return;
                }
                currentGroup.push(unprocessedNote);
                const ticksPerGroup = tickGroups[currentTickGroup].clone();
                const totalTicks = getTotalTicks(currentGroup).add(currentGroupTotalTicks);
                const unbeamable = Tables.durationToNumber(unprocessedNote.getDuration()) < 8;
                if (unbeamable && unprocessedNote.getTuplet()) {
                    ticksPerGroup.numerator *= 2;
                }
                if (totalTicks.greaterThan(ticksPerGroup)) {
                    if (!unbeamable) {
                        const note = currentGroup.pop();
                        if (note)
                            nextGroup.push(note);
                    }
                    noteGroups.push(currentGroup);
                    do {
                        currentGroupTotalTicks = totalTicks.subtract(tickGroups[currentTickGroup]);
                        nextTickGroup();
                    } while (currentGroupTotalTicks.greaterThanEquals(tickGroups[currentTickGroup]));
                    currentGroup = nextGroup;
                }
                else if (totalTicks.equals(ticksPerGroup)) {
                    noteGroups.push(currentGroup);
                    currentGroupTotalTicks = new Fraction(0, 1);
                    currentGroup = nextGroup;
                    nextTickGroup();
                }
            });
            if (currentGroup.length > 0) {
                noteGroups.push(currentGroup);
            }
        }
        function getBeamGroups() {
            return noteGroups.filter((group) => {
                if (group.length > 1) {
                    let beamable = true;
                    group.forEach((note) => {
                        if (note.getIntrinsicTicks() >= Tables.durationToTicks('4')) {
                            beamable = false;
                        }
                    });
                    return beamable;
                }
                return false;
            });
        }
        function sanitizeGroups() {
            const sanitizedGroups = [];
            noteGroups.forEach((group) => {
                let tempGroup = [];
                group.forEach((note, index, group) => {
                    const isFirstOrLast = index === 0 || index === group.length - 1;
                    const prevNote = group[index - 1];
                    const breaksOnEachRest = !config.beam_rests && note.isRest();
                    const breaksOnFirstOrLastRest = config.beam_rests && config.beam_middle_only && note.isRest() && isFirstOrLast;
                    let breakOnStemChange = false;
                    if (config.maintain_stem_directions && prevNote && !note.isRest() && !prevNote.isRest()) {
                        const prevDirection = prevNote.getStemDirection();
                        const currentDirection = note.getStemDirection();
                        breakOnStemChange = currentDirection !== prevDirection;
                    }
                    const isUnbeamableDuration = parseInt(note.getDuration(), 10) < 8;
                    const shouldBreak = breaksOnEachRest || breaksOnFirstOrLastRest || breakOnStemChange || isUnbeamableDuration;
                    if (shouldBreak) {
                        if (tempGroup.length > 0) {
                            sanitizedGroups.push(tempGroup);
                        }
                        tempGroup = breakOnStemChange ? [note] : [];
                    }
                    else {
                        tempGroup.push(note);
                    }
                });
                if (tempGroup.length > 0) {
                    sanitizedGroups.push(tempGroup);
                }
            });
            noteGroups = sanitizedGroups;
        }
        function formatStems() {
            noteGroups.forEach((group) => {
                let stemDirection;
                if (config.maintain_stem_directions) {
                    const note = findFirstNote(group);
                    stemDirection = note ? note.getStemDirection() : Stem.UP;
                }
                else {
                    if (config.stem_direction) {
                        stemDirection = config.stem_direction;
                    }
                    else {
                        stemDirection = calculateStemDirection(group);
                    }
                }
                applyStemDirection(group, stemDirection);
            });
        }
        function findFirstNote(group) {
            for (let i = 0; i < group.length; i++) {
                const note = group[i];
                if (!note.isRest()) {
                    return note;
                }
            }
            return false;
        }
        function applyStemDirection(group, direction) {
            group.forEach((note) => {
                note.setStemDirection(direction);
            });
        }
        function getTuplets() {
            const uniqueTuplets = [];
            noteGroups.forEach((group) => {
                let tuplet;
                group.forEach((note) => {
                    const noteTuplet = note.getTuplet();
                    if (noteTuplet && tuplet !== noteTuplet) {
                        tuplet = noteTuplet;
                        uniqueTuplets.push(tuplet);
                    }
                });
            });
            return uniqueTuplets;
        }
        createGroups();
        sanitizeGroups();
        formatStems();
        const beamedNoteGroups = getBeamGroups();
        const allTuplets = getTuplets();
        const beams = [];
        beamedNoteGroups.forEach((group) => {
            const beam = new Beam(group);
            if (config.show_stemlets) {
                beam.render_options.show_stemlets = true;
            }
            if (config.secondary_breaks) {
                beam.render_options.secondary_break_ticks = Tables.durationToTicks(config.secondary_breaks);
            }
            if (config.flat_beams === true) {
                beam.render_options.flat_beams = true;
                beam.render_options.flat_beam_offset = config.flat_beam_offset;
            }
            beams.push(beam);
        });
        allTuplets.forEach((tuplet) => {
            const direction = tuplet.notes[0].stem_direction === Stem.DOWN ? -1 : 1;
            tuplet.setTupletLocation(direction);
            let bracketed = false;
            for (let i = 0; i < tuplet.notes.length; i++) {
                const note = tuplet.notes[i];
                if (!note.hasBeam()) {
                    bracketed = true;
                    break;
                }
            }
            tuplet.setBracketed(bracketed);
        });
        return beams;
    }
    constructor(notes, auto_stem = false) {
        super();
        this.slope = 0;
        this.y_shift = 0;
        this.forcedPartialDirections = {};
        if (!notes || notes.length === 0) {
            throw new RuntimeError('BadArguments', 'No notes provided for beam.');
        }
        if (notes.length === 1) {
            throw new RuntimeError('BadArguments', 'Too few notes for beam.');
        }
        this.ticks = notes[0].getIntrinsicTicks();
        if (this.ticks >= Tables.durationToTicks('4')) {
            throw new RuntimeError('BadArguments', 'Beams can only be applied to notes shorter than a quarter note.');
        }
        let i;
        let note;
        this.stem_direction = notes[0].getStemDirection();
        let stem_direction = this.stem_direction;
        if (auto_stem && isStaveNote(notes[0])) {
            stem_direction = calculateStemDirection(notes);
        }
        else if (auto_stem && isTabNote(notes[0])) {
            const stem_weight = notes.reduce((memo, note) => memo + note.getStemDirection(), 0);
            stem_direction = stem_weight > -1 ? Stem.UP : Stem.DOWN;
        }
        for (i = 0; i < notes.length; ++i) {
            note = notes[i];
            if (auto_stem) {
                note.setStemDirection(stem_direction);
                this.stem_direction = stem_direction;
            }
            note.setBeam(this);
        }
        this.postFormatted = false;
        this.notes = notes;
        this.beam_count = this.getBeamCount();
        this.break_on_indices = [];
        this.render_options = {
            beam_width: 5,
            max_slope: 0.25,
            min_slope: -0.25,
            slope_iterations: 20,
            slope_cost: 100,
            show_stemlets: false,
            stemlet_extension: 7,
            partial_beam_length: 10,
            flat_beams: false,
            min_flat_beam_offset: 15,
        };
    }
    getNotes() {
        return this.notes;
    }
    getBeamCount() {
        const beamCounts = this.notes.map((note) => note.getGlyphProps().beam_count);
        const maxBeamCount = beamCounts.reduce((max, beamCount) => (beamCount > max ? beamCount : max));
        return maxBeamCount;
    }
    breakSecondaryAt(indices) {
        this.break_on_indices = indices;
        return this;
    }
    setPartialBeamSideAt(noteIndex, side) {
        this.forcedPartialDirections[noteIndex] = side;
        return this;
    }
    unsetPartialBeamSideAt(noteIndex) {
        delete this.forcedPartialDirections[noteIndex];
        return this;
    }
    getSlopeY(x, first_x_px, first_y_px, slope) {
        return first_y_px + (x - first_x_px) * slope;
    }
    calculateSlope() {
        const { notes, stem_direction: stemDirection, render_options: { max_slope, min_slope, slope_iterations, slope_cost }, } = this;
        const firstNote = notes[0];
        const initialSlope = getStemSlope(firstNote, notes[notes.length - 1]);
        const increment = (max_slope - min_slope) / slope_iterations;
        let minCost = Number.MAX_VALUE;
        let bestSlope = 0;
        let yShift = 0;
        for (let slope = min_slope; slope <= max_slope; slope += increment) {
            let totalStemExtension = 0;
            let yShiftTemp = 0;
            for (let i = 1; i < notes.length; ++i) {
                const note = notes[i];
                if (note.hasStem() || note.isRest()) {
                    const adjustedStemTipY = this.getSlopeY(note.getStemX(), firstNote.getStemX(), firstNote.getStemExtents().topY, slope) + yShiftTemp;
                    const stemTipY = note.getStemExtents().topY;
                    if (stemTipY * stemDirection < adjustedStemTipY * stemDirection) {
                        const diff = Math.abs(stemTipY - adjustedStemTipY);
                        yShiftTemp += diff * -stemDirection;
                        totalStemExtension += diff * i;
                    }
                    else {
                        totalStemExtension += (stemTipY - adjustedStemTipY) * stemDirection;
                    }
                }
            }
            const idealSlope = initialSlope / 2;
            const distanceFromIdeal = Math.abs(idealSlope - slope);
            const cost = slope_cost * distanceFromIdeal + Math.abs(totalStemExtension);
            if (cost < minCost) {
                minCost = cost;
                bestSlope = slope;
                yShift = yShiftTemp;
            }
        }
        this.slope = bestSlope;
        this.y_shift = yShift;
    }
    calculateFlatSlope() {
        const { notes, stem_direction, render_options: { beam_width, min_flat_beam_offset, flat_beam_offset }, } = this;
        let total = 0;
        let extremeY = 0;
        let extremeBeamCount = 0;
        let currentExtreme = 0;
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            const stemTipY = note.getStemExtents().topY;
            total += stemTipY;
            if (stem_direction === Stem.DOWN && currentExtreme < stemTipY) {
                currentExtreme = stemTipY;
                extremeY = Math.max(...note.getYs());
                extremeBeamCount = note.getBeamCount();
            }
            else if (stem_direction === Stem.UP && (currentExtreme === 0 || currentExtreme > stemTipY)) {
                currentExtreme = stemTipY;
                extremeY = Math.min(...note.getYs());
                extremeBeamCount = note.getBeamCount();
            }
        }
        let offset = total / notes.length;
        const beamWidth = beam_width * 1.5;
        const extremeTest = min_flat_beam_offset + extremeBeamCount * beamWidth;
        const newOffset = extremeY + extremeTest * -stem_direction;
        if (stem_direction === Stem.DOWN && offset < newOffset) {
            offset = extremeY + extremeTest;
        }
        else if (stem_direction === Stem.UP && offset > newOffset) {
            offset = extremeY - extremeTest;
        }
        if (!flat_beam_offset) {
            this.render_options.flat_beam_offset = offset;
        }
        else if (stem_direction === Stem.DOWN && offset > flat_beam_offset) {
            this.render_options.flat_beam_offset = offset;
        }
        else if (stem_direction === Stem.UP && offset < flat_beam_offset) {
            this.render_options.flat_beam_offset = offset;
        }
        this.slope = 0;
        this.y_shift = 0;
    }
    getBeamYToDraw() {
        const firstNote = this.notes[0];
        const firstStemTipY = firstNote.getStemExtents().topY;
        let beamY = firstStemTipY;
        if (this.render_options.flat_beams && this.render_options.flat_beam_offset) {
            beamY = this.render_options.flat_beam_offset;
        }
        return beamY;
    }
    applyStemExtensions() {
        const { notes, slope, y_shift, beam_count, render_options: { show_stemlets, stemlet_extension, beam_width }, } = this;
        const firstNote = notes[0];
        const firstStemTipY = this.getBeamYToDraw();
        const firstStemX = firstNote.getStemX();
        for (let i = 0; i < notes.length; ++i) {
            const note = notes[i];
            const stem = note.getStem();
            if (stem) {
                const stemX = note.getStemX();
                const { topY: stemTipY } = note.getStemExtents();
                const beamedStemTipY = this.getSlopeY(stemX, firstStemX, firstStemTipY, slope) + y_shift;
                const preBeamExtension = stem.getExtension();
                const beamExtension = note.getStemDirection() === Stem.UP ? stemTipY - beamedStemTipY : beamedStemTipY - stemTipY;
                let crossStemExtension = 0;
                if (note.getStemDirection() !== this.stem_direction) {
                    const beamCount = note.getGlyphProps().beam_count;
                    crossStemExtension = (1 + (beamCount - 1) * 1.5) * this.render_options.beam_width;
                }
                stem.setExtension(preBeamExtension + beamExtension + crossStemExtension);
                stem.adjustHeightForBeam();
                if (note.isRest() && show_stemlets) {
                    const beamWidth = beam_width;
                    const totalBeamWidth = (beam_count - 1) * beamWidth * 1.5 + beamWidth;
                    stem.setVisibility(true).setStemlet(true, totalBeamWidth + stemlet_extension);
                }
            }
        }
    }
    lookupBeamDirection(duration, prev_tick, tick, next_tick, noteIndex) {
        if (duration === '4') {
            return BEAM_LEFT;
        }
        const forcedBeamDirection = this.forcedPartialDirections[noteIndex];
        if (forcedBeamDirection)
            return forcedBeamDirection;
        const lookup_duration = `${Tables.durationToNumber(duration) / 2}`;
        const prev_note_gets_beam = prev_tick < Tables.durationToTicks(lookup_duration);
        const next_note_gets_beam = next_tick < Tables.durationToTicks(lookup_duration);
        const note_gets_beam = tick < Tables.durationToTicks(lookup_duration);
        if (prev_note_gets_beam && next_note_gets_beam && note_gets_beam) {
            return BEAM_BOTH;
        }
        else if (prev_note_gets_beam && !next_note_gets_beam && note_gets_beam) {
            return BEAM_LEFT;
        }
        else if (!prev_note_gets_beam && next_note_gets_beam && note_gets_beam) {
            return BEAM_RIGHT;
        }
        return this.lookupBeamDirection(lookup_duration, prev_tick, tick, next_tick, noteIndex);
    }
    getBeamLines(duration) {
        const tick_of_duration = Tables.durationToTicks(duration);
        let beam_started = false;
        const beam_lines = [];
        let current_beam = undefined;
        const partial_beam_length = this.render_options.partial_beam_length;
        let previous_should_break = false;
        let tick_tally = 0;
        for (let i = 0; i < this.notes.length; ++i) {
            const note = this.notes[i];
            const ticks = note.getTicks().value();
            tick_tally += ticks;
            let should_break = false;
            if (parseInt(duration, 10) >= 8) {
                should_break = this.break_on_indices.indexOf(i) !== -1;
                if (this.render_options.secondary_break_ticks && tick_tally >= this.render_options.secondary_break_ticks) {
                    tick_tally = 0;
                    should_break = true;
                }
            }
            const note_gets_beam = note.getIntrinsicTicks() < tick_of_duration;
            const stem_x = note.getStemX() - Stem.WIDTH / 2;
            const prev_note = this.notes[i - 1];
            const next_note = this.notes[i + 1];
            const next_note_gets_beam = next_note && next_note.getIntrinsicTicks() < tick_of_duration;
            const prev_note_gets_beam = prev_note && prev_note.getIntrinsicTicks() < tick_of_duration;
            const beam_alone = prev_note && next_note && note_gets_beam && !prev_note_gets_beam && !next_note_gets_beam;
            if (note_gets_beam) {
                if (beam_started) {
                    current_beam = beam_lines[beam_lines.length - 1];
                    current_beam.end = stem_x;
                    if (should_break) {
                        beam_started = false;
                        if (next_note && !next_note_gets_beam && current_beam.end === undefined) {
                            current_beam.end = current_beam.start - partial_beam_length;
                        }
                    }
                }
                else {
                    current_beam = { start: stem_x, end: undefined };
                    beam_started = true;
                    if (beam_alone) {
                        const prev_tick = prev_note.getIntrinsicTicks();
                        const next_tick = next_note.getIntrinsicTicks();
                        const tick = note.getIntrinsicTicks();
                        const beam_direction = this.lookupBeamDirection(duration, prev_tick, tick, next_tick, i);
                        if ([BEAM_LEFT, BEAM_BOTH].includes(beam_direction)) {
                            current_beam.end = current_beam.start - partial_beam_length;
                        }
                        else {
                            current_beam.end = current_beam.start + partial_beam_length;
                        }
                    }
                    else if (!next_note_gets_beam) {
                        if ((previous_should_break || i === 0) && next_note) {
                            current_beam.end = current_beam.start + partial_beam_length;
                        }
                        else {
                            current_beam.end = current_beam.start - partial_beam_length;
                        }
                    }
                    else if (should_break) {
                        current_beam.end = current_beam.start - partial_beam_length;
                        beam_started = false;
                    }
                    beam_lines.push(current_beam);
                }
            }
            else {
                beam_started = false;
            }
            previous_should_break = should_break;
        }
        const last_beam = beam_lines[beam_lines.length - 1];
        if (last_beam && last_beam.end === undefined) {
            last_beam.end = last_beam.start - partial_beam_length;
        }
        return beam_lines;
    }
    drawStems(ctx) {
        this.notes.forEach((note) => {
            const stem = note.getStem();
            if (stem) {
                const stem_x = note.getStemX();
                stem.setNoteHeadXBounds(stem_x, stem_x);
                stem.setContext(ctx).draw();
            }
        }, this);
    }
    drawBeamLines(ctx) {
        const valid_beam_durations = ['4', '8', '16', '32', '64'];
        const firstNote = this.notes[0];
        let beamY = this.getBeamYToDraw();
        const firstStemX = firstNote.getStemX();
        const beamThickness = this.render_options.beam_width * this.stem_direction;
        for (let i = 0; i < valid_beam_durations.length; ++i) {
            const duration = valid_beam_durations[i];
            const beamLines = this.getBeamLines(duration);
            for (let j = 0; j < beamLines.length; ++j) {
                const beam_line = beamLines[j];
                const startBeamX = beam_line.start;
                const startBeamY = this.getSlopeY(startBeamX, firstStemX, beamY, this.slope);
                const lastBeamX = beam_line.end;
                if (lastBeamX) {
                    const lastBeamY = this.getSlopeY(lastBeamX, firstStemX, beamY, this.slope);
                    ctx.beginPath();
                    ctx.moveTo(startBeamX, startBeamY);
                    ctx.lineTo(startBeamX, startBeamY + beamThickness);
                    ctx.lineTo(lastBeamX + 1, lastBeamY + beamThickness);
                    ctx.lineTo(lastBeamX + 1, lastBeamY);
                    ctx.closePath();
                    ctx.fill();
                }
                else {
                    throw new RuntimeError('NoLastBeamX', 'lastBeamX undefined.');
                }
            }
            beamY += beamThickness * 1.5;
        }
    }
    preFormat() {
        return this;
    }
    postFormat() {
        if (this.postFormatted)
            return;
        if (isTabNote(this.notes[0]) || this.render_options.flat_beams) {
            this.calculateFlatSlope();
        }
        else {
            this.calculateSlope();
        }
        this.applyStemExtensions();
        this.postFormatted = true;
    }
    draw() {
        const ctx = this.checkContext();
        this.setRendered();
        if (this.unbeamable)
            return;
        if (!this.postFormatted) {
            this.postFormat();
        }
        this.drawStems(ctx);
        this.applyStyle();
        ctx.openGroup('beam', this.getAttribute('id'));
        this.drawBeamLines(ctx);
        ctx.closeGroup();
        this.restoreStyle();
    }
}
