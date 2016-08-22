// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This class implements a parser for a simple language to generate
// VexFlow objects.

import { Vex } from './vex';
import { StaveNote } from './stavenote';
import { Parser } from './parser';

// To enable logging for this class. Set `Vex.Flow.EasyScore.DEBUG` to `true`.
function L(...args) { if (EasyScore.DEBUG) Vex.L('Vex.Flow.EasyScore', args); }

export class X extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = 'EasyScore';
  }
}

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
      run: (state) => this.builder.addSingleNote(
        state.matches[0], state.matches[1], state.matches[2]),
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
      run: (state) => this.builder.setNoteDots(state.matches[0]),
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
  VAL()  {
    return {
      expect: [this.SVAL, this.DVAL],
      or: true,
    };
  }

  KEY()         { return { token: '[a-zA-Z][a-zA-Z0-9]*' }; }
  DVAL()        { return { token: '["][^"]*["]' }; }
  SVAL()        { return { token: "['][^']*[']" }; }
  NOTENAME()    { return { token: '[a-gA-G]' }; }
  OCTAVE()      { return { token: '[0-9]+' }; }
  ACCIDENTALS() { return { token: '[b#n]+' }; }
  DURATIONS()   { return { token: '[0-9whq]+' }; }
  TYPES()       { return { token: '[rRsSxX]' }; }
  LPAREN()      { return { token: '[(]' }; }
  RPAREN()      { return { token: '[)]' }; }
  COMMA()       { return { token: '[,]' }; }
  DOT()         { return { token: '[.]' }; }
  SLASH()       { return { token: '[/]' }; }
  MAYBESLASH()  { return { token: '[/]?' }; }
  EQUALS()      { return { token: '[=]' }; }
  LBRACKET()    { return { token: '\\[' }; }
  RBRACKET()    { return { token: '\\]' }; }
  EOL()         { return { token: '$' }; }
}

class Builder {
  constructor(factory) {
    this.factory = factory;
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

  getElements() { return this.elements; }

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
    if (typeof(notes[0]) !== 'object') {
      this.addSingleNote(notes[0]);
    } else {
      notes.forEach(n => {
        if (n) this.addNote(n[0], n[1], n[2]);
      });
    }
    L('endChord');
  }

  commitPiece() {
    L('commitPiece');
    if (!this.factory) return;
    const options = this.piece.options;
    const stem = options.stem || this.options.stem;
    const clef = this.options.clef;

    const autoStem = stem.toLowerCase() === 'auto';
    const stemDirection = !autoStem &&
      (stem.toLowerCase() === 'up') ? StaveNote.STEM_UP : StaveNote.STEM_DOWN;

    // Build StaveNotes.
    const keys = this.piece.chord.map(note => note.key + '/' + note.octave);
    const note = this.factory.StaveNote({ keys,
      duration: this.piece.duration,
      dots: this.piece.dots,
      auto_stem: autoStem,
      type: this.piece.type,
      clef,
    });
    if (!autoStem) note.setStemDirection(stemDirection);

    // Attach accidentals.
    const accids = this.piece.chord.map(note => note.accid || null);
    accids.forEach((accid, i) => {
      if (accid) note.addAccidental(i, this.factory.Accidental({ type: accid }));
    });

    // Attach dots.
    for (let i = 0; i < this.piece.dots; i++) note.addDotToAll();

    // Process note options.
    if (options.id !== undefined) {
      note.setAttribute('id', options.id);
    }

    this.elements.notes.push(note);
    this.elements.accidentals.concat(accids);
    this.resetPiece();
  }
}

export class EasyScore {
  constructor(options = {}) {
    this.setOptions(options);
  }

  setOptions(options) {
    this.options = Object.assign({
      factory: null,
      builder: null,
    }, options);

    this.factory = this.options.factory;
    this.builder = this.options.builder || new Builder(this.factory);
    this.grammar = new Grammar(this.builder);
    this.parser = new Parser(this.grammar);
  }

  setContext(context) {
    if (this.factory) this.factory.setContext(context);
    return this;
  }

  parse(line, options = {}) {
    this.builder.reset(options);
    return this.parser.parse(line);
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
    this.parse(line, options);
    return this.builder.getElements().notes;
  }

  voice(notes, voiceOptions) {
    return this.factory.Voice(voiceOptions).addTickables(notes);
  }
}
