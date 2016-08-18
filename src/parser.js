// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// A generic text parsing class for VexFlow.

import { Vex } from './vex';

// To enable logging for this class. Set `Vex.Flow.Formatter.DEBUG` to `true`.
function L(...args) { if (Parser.DEBUG) Vex.L('Vex.Flow.Parser', args); }

export class Parser {
  constructor(grammar) {
    this.grammar = grammar;
  }

  static Error(msg, rule, pos) {
    this.msg = msg;
    this.rule = rule;
    this.pos = pos;
    L(msg, rule, pos);
  }

  parse(line) {
    this.line = line;
    this.pos = 0;
    return this.expect(this.grammar.begin());
  }

  matchToken(token) {
    const re = new RegExp('^((' + token + ')\\s*)');
    const workingLine = this.line.slice(this.pos);
    const result = workingLine.match(re);
    if (result !== null) {
      return {
        success: true,
        matchedString: result[2],
        incrementPos: result[1].length,
      };
    } else {
      return {
        success: false,
      };
    }
  }

  expect(rules) {
    const currentPos = this.pos;
    const rule = rules.bind(this.grammar)();
    if (rule.token) {
      // Base case: parse the regex and throw an error if the
      // line doesn't match.
      const result = this.matchToken(rule.token);
      if (result.success) {
        // Token match! Update position and throw away parsed portion
        // of string.
        this.pos += result.incrementPos;
      }
      return result;
    } else if (rule.expect) {
      const results = [];
      let numMatches = 0;

      do {
        let allMatches = true;
        let oneMatch = false;
        let success = false;

        for (const next of rule.expect) {
          const result = this.expect(next);
          results.push(result);

          if (result.success) {
            oneMatch = true;
            if (rule.or) break;
          } else {
            allMatches = false;
            if (!rule.or) break;
          }
        }

        success = (rule.or && oneMatch) || allMatches;
        if (success) numMatches++; else break;
      } while (rule.oneOrMore && ~rule.or);

      if (numMatches > 0) {
        if (rule.run) rule.run(results);
        return results;
      }
    } else {
      throw new Parser.Error('Bad grammar!', rule);
    }

    // We failed to match this grammar, revert position.
    const result = { success: false, pos: this.pos };
    this.pos = currentPos;
    return result;
  }
}
