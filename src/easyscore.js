// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This class implements a parser for a simple language to generate
// VexFlow objects.

import { Factory } from './factory';
import { Parser } from './parser';

// To enable logging for this class. Set `Vex.Flow.EasyScore.DEBUG` to `true`.
function L(...args) { if (Parser.DEBUG) Vex.L('Vex.Flow.EasyScore', args); }

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
    return { expect: [this.CHORDORNOTE, this.DURATION, this.DOTS, this.OPTS] };
  }
  PIECES() {
    return { expect: [this.COMMA, this.PIECE], zeroOrMore: true };
  }
  CHORDORNOTE() {
    return { expect: [this.CHORD, this.NOTE], or: true };
  }
  CHORD()  {
    return { expect: [this.LPAREN, this.NOTES, this.RPAREN] };
  }
  NOTES()  {
    return { expect: [this.NOTE], oneOrMore: true };
  }
  NOTE()   {
    return { expect: [this.KEY, this.ACCIDENTAL, this.OCTAVE] };
  }
  NOTENAME() {
    return { expect: [this.VALIDNOTES] };
  }
  ACCIDENTAL() {
    return { expect: [this.VALIDACCIDENTALS], maybe: true };
  }
  OCTAVE() {
    return { expect: [this.VALIDOCTAVES], maybe: true };
  }
  DOTS()   {
    return { expect: [this.DOT], zeroOrMore: true };
  }
  DURATION()   {
    return { expect: [this.SLASH, this.VALIDDURATIONS], maybe: true };
  }
  // Options can be key=value pairs, with single or double quoted values.
  OPTS() {
    return { expect: [this.LBRACKET, this.KEYVAL, this.KEYVALS, this.RBRACKET], maybe: true };
  }
  KEYVALS() { return { expect: [this.COMMA, this.KEYVAL], zeroOrMore: true }; }
  KEYVAL()  { return { expect: [this.KEY, this.EQUALS, this.VAL] }; }
  KEY()     { return { token: '[a-zA-Z][a-zA-Z0-9]*' }; }
  VAL()     { return { expect: [this.SVAL, this.DVAL], or: true }; }
  DVAL()    { return { token: '["][^"]*["]' }; }
  SVAL()    { return { token: "['][^']*[']" }; }

  // Valid notational symbols.
  VALIDNOTES()   {
    return { token: '[a-gA-GrRxXsS]' };
  }
  VALIDACCIDENTALS() {
    return { token: '[b#n]+' };
  }
  VALIDOCTAVES() {
    return { token: '[0-9]+' };
  }
  VALIDDURATIONS() {
    return { token: '[0-9whq]+' };
  }

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
    let result;
    try {
      const grammar = new Grammar();
      const parser = new Parser(grammar);
      result = parser.parse(line);
    } catch (error) {
      L(error);
    }
    return result;
  }
}
