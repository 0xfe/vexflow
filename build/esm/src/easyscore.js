import { Articulation } from './articulation.js';
import { Dot } from './dot.js';
import { FretHandFinger } from './frethandfinger.js';
import { Music } from './music.js';
import { Parser } from './parser.js';
import { Stem } from './stem.js';
import { defined, log, RuntimeError } from './util.js';
function L(...args) {
    if (EasyScore.DEBUG)
        log('Vex.Flow.EasyScore', args);
}
export class EasyScoreGrammar {
    constructor(builder) {
        this.builder = builder;
    }
    begin() {
        return this.LINE;
    }
    LINE() {
        return {
            expect: [this.PIECE, this.PIECES, this.EOL],
        };
    }
    PIECE() {
        return {
            expect: [this.CHORDORNOTE, this.PARAMS],
            run: () => this.builder.commitPiece(),
        };
    }
    PIECES() {
        return {
            expect: [this.COMMA, this.PIECE],
            zeroOrMore: true,
        };
    }
    PARAMS() {
        return {
            expect: [this.DURATION, this.TYPE, this.DOTS, this.OPTS],
        };
    }
    CHORDORNOTE() {
        return {
            expect: [this.CHORD, this.SINGLENOTE],
            or: true,
        };
    }
    CHORD() {
        return {
            expect: [this.LPAREN, this.NOTES, this.RPAREN],
            run: (state) => this.builder.addChord(state.matches[1]),
        };
    }
    NOTES() {
        return {
            expect: [this.NOTE],
            oneOrMore: true,
        };
    }
    NOTE() {
        return {
            expect: [this.NOTENAME, this.ACCIDENTAL, this.OCTAVE],
        };
    }
    SINGLENOTE() {
        return {
            expect: [this.NOTENAME, this.ACCIDENTAL, this.OCTAVE],
            run: (state) => {
                const s = state;
                this.builder.addSingleNote(s.matches[0], s.matches[1], s.matches[2]);
            },
        };
    }
    ACCIDENTAL() {
        return {
            expect: [this.MICROTONES, this.ACCIDENTALS],
            maybe: true,
            or: true,
        };
    }
    DOTS() {
        return {
            expect: [this.DOT],
            zeroOrMore: true,
            run: (state) => this.builder.setNoteDots(state.matches),
        };
    }
    TYPE() {
        return {
            expect: [this.SLASH, this.MAYBESLASH, this.TYPES],
            maybe: true,
            run: (state) => this.builder.setNoteType(state.matches[2]),
        };
    }
    DURATION() {
        return {
            expect: [this.SLASH, this.DURATIONS],
            maybe: true,
            run: (state) => this.builder.setNoteDuration(state.matches[1]),
        };
    }
    OPTS() {
        return {
            expect: [this.LBRACKET, this.KEYVAL, this.KEYVALS, this.RBRACKET],
            maybe: true,
        };
    }
    KEYVALS() {
        return {
            expect: [this.COMMA, this.KEYVAL],
            zeroOrMore: true,
        };
    }
    KEYVAL() {
        const unquote = (str) => str.slice(1, -1);
        return {
            expect: [this.KEY, this.EQUALS, this.VAL],
            run: (state) => this.builder.addNoteOption(state.matches[0], unquote(state.matches[2])),
        };
    }
    VAL() {
        return {
            expect: [this.SVAL, this.DVAL],
            or: true,
        };
    }
    KEY() {
        return { token: '[a-zA-Z][a-zA-Z0-9]*' };
    }
    DVAL() {
        return { token: '["][^"]*["]' };
    }
    SVAL() {
        return { token: "['][^']*[']" };
    }
    NOTENAME() {
        return { token: '[a-gA-G]' };
    }
    OCTAVE() {
        return { token: '[0-9]+' };
    }
    ACCIDENTALS() {
        return { token: 'bb|b|##|#|n' };
    }
    MICROTONES() {
        return { token: 'bbs|bss|bs|db|d|\\+\\+-|\\+-|\\+\\+|\\+|k|o' };
    }
    DURATIONS() {
        return { token: '[0-9whq]+' };
    }
    TYPES() {
        return { token: '[rRsSmMhHgG]' };
    }
    LPAREN() {
        return { token: '[(]' };
    }
    RPAREN() {
        return { token: '[)]' };
    }
    COMMA() {
        return { token: '[,]' };
    }
    DOT() {
        return { token: '[.]' };
    }
    SLASH() {
        return { token: '[/]' };
    }
    MAYBESLASH() {
        return { token: '[/]?' };
    }
    EQUALS() {
        return { token: '[=]' };
    }
    LBRACKET() {
        return { token: '\\[' };
    }
    RBRACKET() {
        return { token: '\\]' };
    }
    EOL() {
        return { token: '$' };
    }
}
export class Piece {
    constructor(duration) {
        this.chord = [];
        this.dots = 0;
        this.options = {};
        this.duration = duration;
    }
}
export class Builder {
    constructor(factory) {
        this.commitHooks = [];
        this.factory = factory;
        this.reset();
    }
    reset(options) {
        this.options = Object.assign({ stem: 'auto', clef: 'treble' }, options);
        this.elements = { notes: [], accidentals: [] };
        this.rollingDuration = '8';
        this.resetPiece();
    }
    getFactory() {
        return this.factory;
    }
    getElements() {
        return this.elements;
    }
    addCommitHook(commitHook) {
        this.commitHooks.push(commitHook);
    }
    resetPiece() {
        L('resetPiece');
        this.piece = new Piece(this.rollingDuration);
    }
    setNoteDots(dots) {
        L('setNoteDots:', dots);
        if (dots)
            this.piece.dots = dots.length;
    }
    setNoteDuration(duration) {
        L('setNoteDuration:', duration);
        this.rollingDuration = this.piece.duration = duration || this.rollingDuration;
    }
    setNoteType(type) {
        L('setNoteType:', type);
        if (type)
            this.piece.type = type;
    }
    addNoteOption(key, value) {
        L('addNoteOption: key:', key, 'value:', value);
        this.piece.options[key] = value;
    }
    addNote(key, accid, octave) {
        L('addNote:', key, accid, octave);
        this.piece.chord.push({
            key: key,
            accid,
            octave,
        });
    }
    addSingleNote(key, accid, octave) {
        L('addSingleNote:', key, accid, octave);
        this.addNote(key, accid, octave);
    }
    addChord(notes) {
        L('startChord');
        if (typeof notes[0] !== 'object') {
            this.addSingleNote(notes[0]);
        }
        else {
            notes.forEach((n) => {
                if (n)
                    this.addNote(...n);
            });
        }
        L('endChord');
    }
    commitPiece() {
        L('commitPiece');
        const { factory } = this;
        if (!factory)
            return;
        const options = Object.assign(Object.assign({}, this.options), this.piece.options);
        const stem = defined(options.stem, 'BadArguments', 'options.stem is not defined').toLowerCase();
        const clef = defined(options.clef, 'BadArguments', 'options.clef is not defined').toLowerCase();
        const { chord, duration, dots, type } = this.piece;
        const standardAccidentals = Music.accidentals;
        const keys = chord.map((notePiece) => {
            var _a;
            return notePiece.key +
                (standardAccidentals.includes((_a = notePiece.accid) !== null && _a !== void 0 ? _a : '') ? notePiece.accid : '') +
                '/' +
                notePiece.octave;
        });
        const auto_stem = stem === 'auto';
        const note = (type === null || type === void 0 ? void 0 : type.toLowerCase()) == 'g'
            ? factory.GhostNote({ duration, dots })
            : factory.StaveNote({ keys, duration, dots, type, clef, auto_stem });
        if (!auto_stem)
            note.setStemDirection(stem === 'up' ? Stem.UP : Stem.DOWN);
        const accidentals = [];
        chord.forEach((notePiece, index) => {
            const accid = notePiece.accid;
            if (typeof accid === 'string') {
                const accidental = factory.Accidental({ type: accid });
                note.addModifier(accidental, index);
                accidentals.push(accidental);
            }
            else {
                accidentals.push(undefined);
            }
        });
        for (let i = 0; i < dots; i++)
            Dot.buildAndAttach([note], { all: true });
        this.commitHooks.forEach((commitHook) => commitHook(options, note, this));
        this.elements.notes.push(note);
        this.elements.accidentals.push(accidentals);
        this.resetPiece();
    }
}
function setId(options, note) {
    if (options.id === undefined)
        return;
    note.setAttribute('id', options.id);
}
const commaSeparatedRegex = /\s*,\s*/;
function setClass(options, note) {
    if (options.class === undefined)
        return;
    options.class.split(commaSeparatedRegex).forEach((className) => note.addClass(className));
}
class EasyScore {
    constructor(options = {}) {
        this.defaults = {
            clef: 'treble',
            time: '4/4',
            stem: 'auto',
        };
        this.setOptions(options);
    }
    set(defaults) {
        this.defaults = Object.assign(Object.assign({}, this.defaults), defaults);
        return this;
    }
    setOptions(options) {
        var _a, _b;
        const factory = options.factory;
        const builder = (_a = options.builder) !== null && _a !== void 0 ? _a : new Builder(factory);
        this.options = Object.assign(Object.assign({ commitHooks: [setId, setClass, Articulation.easyScoreHook, FretHandFinger.easyScoreHook], throwOnError: false }, options), { factory,
            builder });
        this.factory = factory;
        this.builder = builder;
        this.grammar = new EasyScoreGrammar(this.builder);
        this.parser = new Parser(this.grammar);
        (_b = this.options.commitHooks) === null || _b === void 0 ? void 0 : _b.forEach((commitHook) => this.addCommitHook(commitHook));
        return this;
    }
    setContext(context) {
        this.factory.setContext(context);
        return this;
    }
    parse(line, options = {}) {
        this.builder.reset(options);
        const result = this.parser.parse(line);
        if (!result.success && this.options.throwOnError) {
            L(result);
            throw new RuntimeError('Error parsing line: ' + line);
        }
        return result;
    }
    beam(notes, options) {
        this.factory.Beam({ notes, options });
        return notes;
    }
    tuplet(notes, options) {
        this.factory.Tuplet({ notes, options });
        return notes;
    }
    notes(line, options = {}) {
        options = Object.assign({ clef: this.defaults.clef, stem: this.defaults.stem }, options);
        this.parse(line, options);
        return this.builder.getElements().notes;
    }
    voice(notes, options = {}) {
        options = Object.assign({ time: this.defaults.time }, options);
        return this.factory.Voice(options).addTickables(notes);
    }
    addCommitHook(commitHook) {
        this.builder.addCommitHook(commitHook);
    }
}
EasyScore.DEBUG = false;
export { EasyScore };
