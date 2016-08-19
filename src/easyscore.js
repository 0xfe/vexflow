// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This class implements a parser for a simple language to generate
// VexFlow objects.

import { Vex } from './vex';
import { Factory } from './factory';
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

function unquote(str) { return str.slice(1, -1); }

class Grammar {
  constructor(builder) {
    this.builder = builder;
  }

  begin() { return this.LINE; }

  // Notation grammar for EasyScore.
  LINE()   {
    return { expect: [this.PIECE, this.PIECES, this.EOL] };
  }
  PIECE()  {
    return { expect: [this.CHORDORNOTE, this.PARAMS],
             run: () => this.builder.commitPiece() };
  }
  PIECES() {
    return { expect: [this.COMMA, this.PIECE], zeroOrMore: true };
  }
  PARAMS()  {
    return { expect: [this.DURATION, this.DOTS, this.OPTS] };
  }
  CHORDORNOTE() {
    return { expect: [this.CHORD, this.SINGLENOTE], or: true };
  }
  CHORD()  {
    return { expect: [this.LPAREN, this.NOTES, this.RPAREN],
             run: (state) => this.builder.addChord(state.matches[1]) };
  }
  NOTES()  {
    return { expect: [this.NOTE], oneOrMore: true };
  }
  NOTE()   {
    return { expect: [this.NOTENAME, this.ACCIDENTAL, this.OCTAVE] };
  }
  SINGLENOTE()   {
    return { expect: [this.NOTENAME, this.ACCIDENTAL, this.OCTAVE],
             run: (state) => this.builder.addSingleNote(
               state.matches[0], state.matches[1], state.matches[2]) };
  }
  ACCIDENTAL() {
    return { expect: [this.ACCIDENTALS], maybe: true };
  }
  DOTS()   {
    return { expect: [this.DOT], zeroOrMore: true,
             run: (state) => this.builder.setNoteDots(state.matches[0]) };
  }
  DURATION()   {
    return { expect: [this.SLASH, this.DURATIONS], maybe: true,
             run: (state) => this.builder.setNoteDuration(state.matches[1]) };
  }
  // Options can be key=value pairs, with single or double quoted values.
  OPTS() {
    return { expect: [this.LBRACKET, this.KEYVAL, this.KEYVALS, this.RBRACKET], maybe: true };
  }
  KEYVALS() { return { expect: [this.COMMA, this.KEYVAL], zeroOrMore: true }; }
  KEYVAL()  {
    return { expect: [this.KEY, this.EQUALS, this.VAL],
             run: (state) => this.builder.addNoteOption(
               state.matches[0], unquote(state.matches[2])) };
  }
  KEY()     { return { token: '[a-zA-Z][a-zA-Z0-9]*' }; }
  VAL()     { return { expect: [this.SVAL, this.DVAL], or: true }; }
  DVAL()    { return { token: '["][^"]*["]' }; }
  SVAL()    { return { token: "['][^']*[']" }; }

  // Valid notational symbols.
  NOTENAME() { return { token: '\\s*[a-gA-GrRxXsS]', noSpace: true }; }
  OCTAVE()   { return { token: '[0-9]+' }; }
  ACCIDENTALS() { return { token: '[b#n]+' }; }
  DURATIONS() { return { token: '[0-9whq]+' }; }

  // Raw tokens used by grammar.
  LPAREN()   { return { token: '[(]' }; }
  RPAREN()   { return { token: '[)]' }; }
  COMMA()    { return { token: '[,]' }; }
  DOT()      { return { token: '[.]' }; }
  SLASH()    { return { token: '[/]' }; }
  EQUALS()   { return { token: '[=]' }; }
  LBRACKET() { return { token: '\\[' }; }
  RBRACKET() { return { token: '\\]' }; }
  EOL()      { return { token: '$' }; }
}

class Builder {
  constructor(factory) {
    this.factory = factory;
    if (!this.factory) {
      throw new X('Builder needs a factory');
    }
    this.resetState();
  }

  resetState() {
    this.state = {
      chord: [],
      note: null,
      duration: 8,
      dots: 0,
    };
  }

  setNoteDots(dots) {
    L('setNoteDots:', dots);
    if (dots) this.state.dots = dots.length;
  }

  setNoteDuration(duration) {
    L('setNoteDuration:', duration);
    this.state.duration = duration;
  }

  addNoteOption(key, value) {
    L('addNoteOption: key:', key, 'value:', value);
  }

  addNote(key, acc, octave) {
    L('addNote:', key, acc, octave);
    this.state.note = { key, acc, octave };
  }

  addSingleNote(key, acc, octave) {
    L('addSingleNote:', key, acc, octave);
    this.addNote(key, acc, octave);
  }

  addChord(notes) {
    L('startChord');
    notes.forEach(n => {
      if (n) this.addNote(n[0], n[1], n[2]);
    });
    L('endChord');
  }

  commitPiece() {
    L('commitPiece');
  }
}

export class EasyScore {
  constructor(options = {}) {
    this.setOptions(options);
  }

  setOptions(options) {
    this.options = Object.assign({
      factory: null,
    }, options);

    this.factory = this.options.factory || new Factory({ renderer: { selector: null } });
  }

  setContext(context) {
    this.factory.setContext(context);
    return this;
  }

  parse(line) {
    const builder = new Builder(this.factory);
    const grammar = new Grammar(builder);
    const parser = new Parser(grammar);
    return parser.parse(line);
  }
}
