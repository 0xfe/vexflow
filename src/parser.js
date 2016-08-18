// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// A generic text parsing class for VexFlow.

import { Vex } from './vex';

// To enable logging for this class. Set `Vex.Flow.Parser.DEBUG` to `true`.
function L(...args) { if (Parser.DEBUG) Vex.L('Vex.Flow.Parser', args); }

// This is the base parser class. Given an arbitrary context-free grammar, it
// can parse any line and execute code when specific rules are met (e.g.,
// when a string is terminated.)
export class Parser {
  // For an example of a simple grammar, take a look at tests/parser_tests.js or
  // the EasyScore grammar in easyscore.js.
  constructor(grammar) {
    this.grammar = grammar;
  }

  static Error(msg, rule, pos) {
    this.msg = msg;
    this.rule = rule;
    this.pos = pos;
    L(msg, rule, pos);
    return `${msg}: ${rule}: ${pos}`;
  }

  // Parse `line` using current grammar. Returns {success: true} if the
  // line parsed correctly, otherwise returns `{success: false, errorPos: N}`
  // where `errorPos` is the location of the error in the string.
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

  // Look for `token` in this.line[this.pos], and return success
  // if one is found. `token` is specified as a regular expression.
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

  // Execute rule to match a sequence of tokens (or rules). If `maybe` is
  // set, then return success even if the token is not found, but reset
  // the position before exiting.
  expectOne(rule, maybe = false) {
    const results = [];
    const pos = this.pos;

    let allMatches = true;
    let oneMatch = false;
    maybe |= (rule.maybe === true);

    // Execute all sub rules in sequence.
    for (const next of rule.expect) {
      const localPos = this.pos;
      const result = this.expect(next);

      // If `rule.or` is set, then return success if any one
      // of the subrules match, else all subrules must match.
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
    return { success: (gotOne || maybe), results, numMatches: gotOne ? 1 : 0 };
  }

  // Try to match multiple (one or more) instances of the rule. If `maybe` is set,
  // then a failed match is also a success (but the position is reset).
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

  // Match zero or more instances of `rule`. Offloads to `expectOneOrMore`.
  expectZeroOrMore(rule) {
    return this.expectOneOrMore(rule, true);
  }

  // Execute the rule produced by the provided the `rules` function. This
  // ofloads to one of the above matchers and consolidates the results. It is also
  // responsible for executing any code triggered by the rule (in `rule.run`.)
  expect(rules) {
    L('Evaluating rules:', rules);
    let result;
    if (!rules) {
      throw new Parser.Error('Invalid Rule: ' + rules, rules);
    }

    // Get rule from Grammar class.
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

    // If there's a trigger attached to this rule, then pull it.
    if (rule.run && result.success) rule.run(result);
    return result;
  }
}
