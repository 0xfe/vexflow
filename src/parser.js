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
    this.errorPos = -1;
    const results = this.expect(this.grammar.begin());
    results.errorPos = this.errorPos;
    return results;
  }

  matchFail(returnPos) {
    if (this.errorPos === -1) this.errorPos = this.pos;
    this.pos = returnPos;
  }

  matchSuccess() {
    this.errorPos = -1;
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
        pos: this.pos,
      };
    } else {
      return {
        success: false,
        pos: this.pos,
      };
    }
  }

  expectOne(rule, maybe = false) {
    const results = [];
    const pos = this.pos;

    let allMatches = true;
    let oneMatch = false;
    maybe |= (rule.maybe === true);

    for (const next of rule.expect) {
      const localPos = this.pos;
      const result = this.expect(next);

      if (result.success) {
        results.push(result);
        oneMatch = true;
        if (rule.or) break;
      } else {
        allMatches = false;
        if (!rule.or) {
          this.pos = localPos;
          break;
        }
      }
    }

    const gotOne = (rule.or && oneMatch) || allMatches;
    const success = gotOne || maybe;
    if (maybe && !gotOne) this.pos = pos;
    if (success) this.matchSuccess(); else this.matchFail(pos);
    return { success: (gotOne || maybe), results, gotOne };
  }

  expectOneOrMore(rule, maybe = false) {
    const results = [];
    const pos = this.pos;
    let numMatches = 0;
    let more = true;

    do {
      const result = this.expectOne(rule);
      if (result.success) {
        numMatches++;
        results.push(result.results);
      } else {
        more = false;
      }
    } while (more);

    const success = (numMatches > 0) || maybe;
    if (maybe && !(numMatches > 0)) this.pos = pos;
    if (success) this.matchSuccess(); else this.matchFail(pos);
    return { success, results, numMatches };
  }

  expectZeroOrMore(rule) {
    return this.expectOneOrMore(rule, true);
  }

  expect(rules) {
    let result;
    const matches = [];
    if (!rules) {
      throw new Parser.Error('Invalid Rule: ' + rules, rules);
    }

    const rule = rules.bind(this.grammar)();
    if (rule.token) {
      // Base case: parse the regex and throw an error if the
      // line doesn't match.
      result = this.matchToken(rule.token);
      if (result.success) {
        // Token match! Update position and throw away parsed portion
        // of string.
        this.pos += result.incrementPos;
      }
    } else if (rule.expect) {
      if (rule.oneOrMore) {
        result = this.expectOneOrMore(rule);
      } else if (rule.zeroOrMore) {
        result = this.expectZeroOrMore(rule);
      } else {
        result = this.expectOne(rule);
      }
    } else {
      throw new Parser.Error('Bad grammar!', rule);
    }

    if (rule.run && result.success) rule.run(result);
    return result;
  }
}
