// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This class implements a parser for a simple language to generate
// VexFlow objects.

import { Factory } from './factory';

class Grammar {
  constructor(builder) {
    this.builder = builder;
  }

  start() { return this.GROUP; }

  COMMA()  { return { regex: ',' }; }
  NOTE()  { return { regex: '[a-gA-G]' }; }
  NOTES() {
    return { expect: [this.NOTE],
             oneOrMore: true,
             run: (state) => this.builder.addNoteKey(state) };
  }
  CHORD() {
    return { expect: [this.LPAREN, this.NOTES, this.RPAREN],
             run: (state) => this.builder.openChord(state.matches[2]) };
  }
  CHORDS() {
    return { expect: [this.CHORD, this.COMMA],
             oneOrMore: true,
             run: (state) => this.builder.openChord(state) };
  }
  GROUP()  {
    return { expect: [this.CHORDS, this.CHORD],
             or: true };
  }
}

export class Builder {
  constructor(options = {}) {
    this.setOptions(options);
  }

  setOptions(options = {}) {
    this.options = Object.assign({
      factory: null,
    }, options);

    this.factory = this.options.factory || new Factory({ renderer: { el: null } });
  }
}

export class EasyScore {
  constructor(options = {}) {
    this.setOptions(options);
    this.state = {
      line: '',
      pos: 0,
      params: {},
    };
    this.builder = new Builder();
  }

  setOptions(options) {
    this.options = Object.assign({
      factory: null,
    }, options);

    this.factory = this.options.factory || new Factory({ renderer: { el: null } });
  }

  resetState(line, params) {
    this.state.line = line;
    Object.assign(this.state.params, params);
  }

  setContext(context) {
    this.factory.setContext(context);
    return this;
  }

  parse(line, params = {}) {
    this.resetState(line, params);
    this.expect(Grammar.GROUP);
  }
}
