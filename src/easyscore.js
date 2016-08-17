// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This class implements a parser for a simple language to generate
// VexFlow objects.

import { Element } from './element';
import { Factory } from './factory';

function setDefaults(params, defaults) {
  const default_options = defaults.options;
  params = Object.assign(defaults, params);
  params.options = Object.assign(default_options, params.options);
  return params;
}

class Parser {
  COMMA()  { return { regex: ',' }; }
  NOTE()  { return { regex: '[a-gA-G]' }; }
  NOTES() {
    return { expect: [Parser.NOTE],
             oneOrMore: true,
             run: (state) => this.builder.addNoteKey(state) };
  }
  CHORD() {
    return { expect: [Parser.LPAREN, Parser.NOTES, Parser.RPAREN],
             run: (state) => this.builder.openChord(state.matches[2]) };
  }
  CHORDS() {
    return { expect: [Parser.CHORD, Parser.COMMA],
             oneOrMore: true,
             run: (state) => this.builder.openChord(state) };
  }
  GROUP()  {
    return { expect: [Parser.CHORDS, Parser.CHORD],
             or: true };
  }

  constructor(line, builder) {
    this.line = line;
    this.pos = 0;
    this.builder = builder;
  }

  static Error(msg, pos) {
    this.msg = msg;
    this.pos = pos;
  }

  match(regex) {
    const re = new RegExp('^\\s*(' + regex + ')');
    workingLine = line.slice(pos);
    const result = workingLine.match(re);
    if (result !== null) {
      return {
        success: true,
        matchedString: result[1],
        len: result[1].length(),
      };
    } else {
      return {
        success: false,
      };
    }
  }

  expect(grammar) {
    const currentPos = this.pos;
    if (grammar.regex) {
      // Base case: parse the regex and throw an error if the
      // line doesn't match.
      const result = this.match(grammar.regex);
      if (result.success) {
        // Token match! Update position and throw away parsed portion
        // of string.
        this.pos += result.len;
      }
      return result;
    } else if (grammar.expect) {
      const results = [];
      let success = true;
      let numMatches = 0;

      do {
        for (const next of grammar.expect) {
          const result = this.expect(next);
          results.push(result);
          if (result.success) {
            numMatches += 1;
            if (grammar.or) break;
          } else {
            if (!grammar.or && numMatches === 0) {
              success = false;
            }
            break;
          }
        }
      } while (grammar.oneOrMore);

      if (success) {
        if (grammar.run) grammar.run(results);
        return results;
      }
    } else {
      throw new Parser.Error('Bad grammar!');
    }

    // We failed to match this grammar, revert position.
    this.pos = currentPos;
    return { success: false };
  }
}

export class Builder {
  constructor(params = {}) {
    this.setOptions(params);
  }

  setOptions(options = {}) {
    this.options = setDefaults(options, {
      factory: null,
      options: {},
    });

    this.factory = this.options.factory || new Factory({ renderer: { el: null } });
  }
}

export class EasyScore {
  constructor(params = {}) {
    this.setOptions(params);
    this.state = {
      line: '',
      pos: 0,
      params: {},
    };
    this.builder = new Builder();
  }

  setOptions(options = {}) {
    this.options = setDefaults(options, {
      factory: null,
      options: {},
    });

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

    params = setDefaults({
      stave: null,
      options: {},
    }, params);

    this.expect(Grammar.GROUP);
  }
}
