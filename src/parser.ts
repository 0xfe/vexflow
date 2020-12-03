// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// A generic text parsing class for VexFlow.

import {Vex} from './vex';
import {IParserResult} from "./types/parser";
import {IGrammarVal} from "./types/easyscore";
import {Grammar} from "./easyscore";

// To enable logging for this class. Set `Vex.Flow.Parser.DEBUG` to `true`.
function L(...args: unknown[]) {
  if (Parser.DEBUG) Vex.L('Vex.Flow.Parser', args);
}

export const X = Vex.MakeException('ParserError');

// Converts parser results into an easy to reference list that can be
// used in triggers.
function flattenMatches(results: any): any {
  if (results.matchedString !== undefined) return results.matchedString;
  if (results.results) return flattenMatches(results.results);
  if (results.length === 1) return flattenMatches(results[0]);
  if (results.length === 0) return null;
  return results.map(flattenMatches);
}

// This is the base parser class. Given an arbitrary context-free grammar, it
// can parse any line and execute code when specific rules are met (e.g.,
// when a string is terminated.)
export class Parser {
  static DEBUG: boolean;

  private readonly grammar: Grammar;

  private pos: number;
  private errorPos: number;
  private line: string;

  // For an example of a simple grammar, take a look at tests/parser_tests.js or
  // the EasyScore grammar in easyscore.js.
  constructor(grammar: Grammar) {
    this.grammar = grammar;
  }

  // Parse `line` using current grammar. Returns {success: true} if the
  // line parsed correctly, otherwise returns `{success: false, errorPos: N}`
  // where `errorPos` is the location of the error in the string.
  parse(line: string): IParserResult {
    this.line = line;
    this.pos = 0;
    this.errorPos = -1;
    const results = this.expect(this.grammar.begin());
    results.errorPos = this.errorPos;
    return results;
  }

  matchFail(returnPos: number): void {
    if (this.errorPos === -1) this.errorPos = this.pos;
    this.pos = returnPos;
  }

  matchSuccess(): void {
    this.errorPos = -1;
  }

  // Look for `token` in this.line[this.pos], and return success
  // if one is found. `token` is specified as a regular expression.
  matchToken(token: string, noSpace = false): IParserResult {
    const regexp = noSpace
      ? new RegExp('^((' + token + '))')
      : new RegExp('^((' + token + ')\\s*)');
    const workingLine = this.line.slice(this.pos);
    const result = workingLine.match(regexp);
    if (result !== null) {
      return {
        success: true,
        matchedString: result[2],
        incrementPos: result[1].length,
        pos: this.pos,
      } as IParserResult;
    } else {
      return {
        success: false,
        pos: this.pos,
      } as IParserResult;
    }
  }

  // Execute rule to match a sequence of tokens (or rules). If `maybe` is
  // set, then return success even if the token is not found, but reset
  // the position before exiting.
  expectOne(rule: IGrammarVal, maybe = false): IParserResult {
    const results: IParserResult[] = [];
    const pos = this.pos;

    let allMatches = true;
    let oneMatch = false;
    maybe = (maybe === true) || (rule.maybe === true);

    // Execute all sub rules in sequence.
    for (let i = 0; i < rule.expect.length; i++) {
      const next = rule.expect[i];
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
    const success = gotOne || (maybe === true);
    if (maybe && !gotOne) this.pos = pos;
    if (success) this.matchSuccess(); else this.matchFail(pos);
    return {success, results, numMatches: gotOne ? 1 : 0} as IParserResult;
  }

  // Try to match multiple (one or more) instances of the rule. If `maybe` is set,
  // then a failed match is also a success (but the position is reset).
  expectOneOrMore(rule: IGrammarVal, maybe = false): IParserResult {
    const results: IParserResult[] = [];
    const pos = this.pos;
    let numMatches = 0;
    let more = true;

    do {
      const result = this.expectOne(rule);
      if (result.success) {
        numMatches++;
        results.push(result.results as any);
      } else {
        more = false;
      }
    } while (more);

    const success = (numMatches > 0) || (maybe === true);
    if (maybe && !(numMatches > 0)) this.pos = pos;
    if (success) this.matchSuccess(); else this.matchFail(pos);
    return {success, results, numMatches} as IParserResult;
  }

  // Match zero or more instances of `rule`. Offloads to `expectOneOrMore`.
  expectZeroOrMore(rule: IGrammarVal): IParserResult {
    return this.expectOneOrMore(rule, true);
  }

  // Execute the rule produced by the provided the `rules` function. This
  // ofloads to one of the above matchers and consolidates the results. It is also
  // responsible for executing any code triggered by the rule (in `rule.run`.)
  expect(rules: () => IGrammarVal): IParserResult {
    L('Evaluating rules:', rules);
    let result: IParserResult;
    if (!rules) {
      throw new X('Invalid Rule: ' + rules, rules);
    }

    // Get rule from Grammar class.
    const rule = rules.bind(this.grammar)();

    if (rule.token) {
      // Base case: parse the regex and throw an error if the
      // line doesn't match.
      result = this.matchToken(rule.token, (rule.noSpace === true));
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
      throw new X('Bad grammar! No `token` or `expect` property', rule);
    }

    // If there's a trigger attached to this rule, then pull it.
    result.matches = [];
    if (result.results) result.results.forEach((r: any) => result.matches.push(flattenMatches(r)));
    if (rule.run && result.success) rule.run(result);
    return result;
  }
}
