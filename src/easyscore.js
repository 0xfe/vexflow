// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This class implements a parser for a simple language to generate
// VexFlow objects.

/* eslint max-classes-per-file: "off" */

import { Vex } from './vex';
import { StaveNote } from './stavenote';
import { Parser } from './parser';
import { Articulation } from './articulation';

// To enable logging for this class. Set `Vex.Flow.EasyScore.DEBUG` to `true`.
function L(...args) { if (EasyScore.DEBUG) Vex.L('Vex.Flow.EasyScore', args); }

export const X = Vex.MakeException('EasyScoreError');

class Grammar {
  constructor(builder) {
    this.builder = builder;
  }

  begin() { return this.LINE; }

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
      run: (state) =>
        this.builder.addSingleNote(state.matches[0], state.matches[1], state.matches[2]),
    };
  }
  ACCIDENTAL() {
    return {
      expect: [this.ACCIDENTALS],
      maybe: true,
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

  KEY() { return { token: '[a-zA-Z][a-zA-Z0-9]*' }; }
  DVAL() { return { token: '["][^"]*["]' }; }
  SVAL() { return { token: "['][^']*[']" }; }
  NOTENAME() { return { token: '[a-gA-G]' }; }
  OCTAVE() { return { token: '[0-9]+' }; }
  ACCIDENTALS() { return { token: 'bbs|bb|bss|bs|b|db|d|##|#|n|\\+\\+-|\\+-|\\+\\+|\\+|k|o' }; }
  DURATIONS() { return { token: '[0-9whq]+' }; }
  TYPES() { return { token: '[rRsSxX]' }; }
  LPAREN() { return { token: '[(]' }; }
  RPAREN() { return { token: '[)]' }; }
  COMMA() { return { token: '[,]' }; }
  DOT() { return { token: '[.]' }; }
  SLASH() { return { token: '[/]' }; }
  MAYBESLASH() { return { token: '[/]?' }; }
  EQUALS() { return { token: '[=]' }; }
  LBRACKET() { return { token: '\\[' }; }
  RBRACKET() { return { token: '\\]' }; }
  EOL() { return { token: '$' }; }
}

class Builder {
  constructor(factory) {
    this.factory = factory;
    this.commitHooks = [];
    this.reset();
  }

  reset(options = {}) {
    this.options = {
      stem: 'auto',
      clef: 'treble',
    };
    this.elements = {
      notes: [],
      accidentals: [],
    };
    this.rollingDuration = '8';
    this.resetPiece();
    Object.assign(this.options, options);
  }

  getFactory() { return this.factory; }

  getElements() { return this.elements; }

  addCommitHook(commitHook) {
    this.commitHooks.push(commitHook);
  }

  resetPiece() {
    L('resetPiece');
    this.piece = {
      chord: [],
      duration: this.rollingDuration,
      dots: 0,
      type: undefined,
      options: {},
    };
  }

  setNoteDots(dots) {
    L('setNoteDots:', dots);
    if (dots) this.piece.dots = dots.length;
  }

  setNoteDuration(duration) {
    L('setNoteDuration:', duration);
    this.rollingDuration = this.piece.duration = duration || this.rollingDuration;
  }

  setNoteType(type) {
    L('setNoteType:', type);
    if (type) this.piece.type = type;
  }

  addNoteOption(key, value) {
    L('addNoteOption: key:', key, 'value:', value);
    this.piece.options[key] = value;
  }

  addNote(key, accid, octave) {
    L('addNote:', key, accid, octave);
    this.piece.chord.push({ key, accid, octave });
  }

  addSingleNote(key, accid, octave) {
    L('addSingleNote:', key, accid, octave);
    this.addNote(key, accid, octave);
  }

  addChord(notes) {
    L('startChord');
    if (typeof (notes[0]) !== 'object') {
      this.addSingleNote(notes[0]);
    } else {
      notes.forEach(n => {
        if (n) this.addNote(...n);
      });
    }
    L('endChord');
  }

  commitPiece() {
    L('commitPiece');
    const { factory } = this;

    if (!factory) return;

    const options = { ...this.options, ...this.piece.options };
    const { stem, clef } = options;
    const autoStem = stem.toLowerCase() === 'auto';
    const stemDirection = !autoStem && stem.toLowerCase() === 'up'
      ? StaveNote.STEM_UP
      : StaveNote.STEM_DOWN;

    // Build StaveNotes.
    const { chord, duration, dots, type } = this.piece;
    const keys = chord.map(note => note.key + '/' + note.octave);
    const note = factory.StaveNote({
      keys,
      duration,
      dots,
      type,
      clef,
      auto_stem: autoStem,
    });
    if (!autoStem) note.setStemDirection(stemDirection);

    // Attach accidentals.
    const accids = chord.map(note => note.accid || null);
    accids.forEach((accid, i) => {
      if (accid) note.addAccidental(i, factory.Accidental({ type: accid }));
    });

    // Attach dots.
    for (let i = 0; i < dots; i++) note.addDotToAll();

    this.commitHooks.forEach(fn => fn(options, note, this));

    this.elements.notes.push(note);
    this.elements.accidentals.concat(accids);
    this.resetPiece();
  }
}

function setId({ id }, note) {
  if (id === undefined) return;

  note.setAttribute('id', id);
}


function setClass(options, note) {
  if (!options.class) return;

  const commaSeparatedRegex = /\s*,\s*/;

  options.class
    .split(commaSeparatedRegex)
    .forEach(className => note.addClass(className));
}

export class EasyScore {
  constructor(options = {}) {
    this.setOptions(options);
    this.defaults = {
      clef: 'treble',
      time: '4/4',
      stem: 'auto',
    };
  }

  set(defaults) {
    Object.assign(this.defaults, defaults);
    return this;
  }

  setOptions(options) {
    this.options = {
      factory: null,
      builder: null,
      commitHooks: [
        setId,
        setClass,
        Articulation.easyScoreHook,
      ],
      throwOnError: false, ...options
    };

    this.factory = this.options.factory;
    this.builder = this.options.builder || new Builder(this.factory);
    this.grammar = new Grammar(this.builder);
    this.parser = new Parser(this.grammar);
    this.options.commitHooks.forEach(commitHook => this.addCommitHook(commitHook));
    return this;
  }

  setContext(context) {
    if (this.factory) this.factory.setContext(context);
    return this;
  }

  parse(line, options = {}) {
    this.builder.reset(options);
    const result = this.parser.parse(line);
    if (!result.success && this.options.throwOnError) {
      throw new X('Error parsing line: ' + line, result);
    }
    return result;
  }

  beam(notes, options = {}) {
    this.factory.Beam({ notes, options });
    return notes;
  }

  tuplet(notes, options = {}) {
    this.factory.Tuplet({ notes, options });
    return notes;
  }

  notes(line, options = {}) {
    options = { clef: this.defaults.clef, stem: this.defaults.stem, ...options };
    this.parse(line, options);
    return this.builder.getElements().notes;
  }

  voice(notes, voiceOptions) {
    voiceOptions = { time: this.defaults.time, ...voiceOptions };
    return this.factory.Voice(voiceOptions).addTickables(notes);
  }

  addCommitHook(commitHook) {
    return this.builder.addCommitHook(commitHook);
  }
}
