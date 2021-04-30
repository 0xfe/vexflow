// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// A generic text parsing class for VexFlow.

import { Vex } from './vex';
import { Grammar } from './easyscore';

//////////////////////////////////////////////////////////////////////////////////////////////////
// TODO: Move to easyscore.ts
type RuleFunction = () => Rule;
type TriggerFunction = (state?: Result) => void;
interface Rule {
  // Lexer Rules
  token?: string; // The token property is a string that is compiled into a RegExp.
  noSpace?: boolean; // TODO: None of the EasyScore rules specify noSpace, so it is not used anywhere.

  // Parser Rules
  expect?: RuleFunction[];
  zeroOrMore?: boolean;
  oneOrMore?: boolean;
  maybe?: boolean;
  or?: boolean;
  run?: TriggerFunction;
}
// END: Move to easyscore.ts
//////////////////////////////////////////////////////////////////////////////////////////////////

// To enable logging for this class. Set `Vex.Flow.Parser.DEBUG` to `true`.
function L(...args: any[]) {
  if (Parser.DEBUG) Vex.L('Vex.Flow.Parser', args);
}

export const X = Vex.MakeException('ParserError');

const NO_ERROR_POS = -1;

interface Result {
  success: boolean;

  // Lexer Results
  pos?: number;
  incrementPos?: number;
  matchedString?: string;

  // Parser Results
  matches?: Match[];
  numMatches?: number;
  results?: Result[];
  errorPos?: number; // Set to NO_ERROR if successful. N if there is an error in the string.
}

// Converts parser results into an easy to reference list that can be used in triggers.
// returns:
// - nested array in which the leaf elements are string or null
// - string (including empty strings)
// - null
type Match = string | Match[] | null;
function flattenMatches(r: Result | Result[]): Match {
  if ('matchedString' in r) return r.matchedString as string; // string
  if ('results' in r) return flattenMatches(r.results as Result[]);
  const results = r as Result[];
  if (results.length === 1) return flattenMatches(results[0]);
  if (results.length === 0) return null; // null
  return results.map(flattenMatches); // nested array
}

// This is the base parser class. Given an arbitrary context-free grammar, it
// can parse any line and execute code when specific rules are met (e.g.,
// when a string is terminated.)
export class Parser {
  public static DEBUG: boolean = false;

  private grammar: Grammar;
  private line: string;
  private pos: number;
  private errorPos: number;

  // For an example of a simple grammar, take a look at tests/parser_tests.js or
  // the EasyScore grammar in easyscore.ts.
  constructor(grammar: Grammar) {
    this.grammar = grammar;
    this.line = '';
    this.pos = 0;
    this.errorPos = NO_ERROR_POS;
  }

  // Parse `line` using current grammar. Returns `{success: true}` if the
  // line parsed correctly, otherwise returns `{success: false, errorPos: N}`
  // where `errorPos` is the location of the error in the string.
  public parse(line: string): Result {
    this.line = line;
    this.pos = 0;
    this.errorPos = NO_ERROR_POS;
    const result = this.expect(this.grammar.begin());
    result.errorPos = this.errorPos;
    return result;
  }

  private matchFail(returnPos: number): void {
    if (this.errorPos === NO_ERROR_POS) this.errorPos = this.pos;
    this.pos = returnPos;
  }

  private matchSuccess(): void {
    this.errorPos = NO_ERROR_POS;
  }

  // Look for `token` in this.line[this.pos], and return success
  // if one is found. `token` is specified as a regular expression.
  private matchToken(token: string, noSpace: boolean = false): Result {
    const regexp = noSpace ? new RegExp('^((' + token + '))') : new RegExp('^((' + token + ')\\s*)');
    const workingLine = this.line.slice(this.pos);
    const result = workingLine.match(regexp);
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
  // TODO: expectOne(...) is never called with the `maybe` parameter.
  private expectOne(rule: Rule, maybe: boolean = false): Result {
    const results: Result[] = [];
    const pos = this.pos;

    let allMatches = true;
    let oneMatch = false;
    maybe = maybe === true || rule.maybe === true;

    // Execute all sub rules in sequence.
    if (rule.expect) {
      for (let i = 0; i < rule.expect.length; i++) {
        const next: RuleFunction = rule.expect[i];
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
    }

    const gotOne = (rule.or && oneMatch) || allMatches;
    const numMatches = gotOne ? 1 : 0;
    const success = gotOne || maybe === true;
    if (maybe && !gotOne) this.pos = pos;
    if (success) {
      this.matchSuccess();
    } else {
      this.matchFail(pos);
    }
    return { success, results, numMatches };
  }

  // Try to match multiple (one or more) instances of the rule. If `maybe` is set,
  // then a failed match is also a success (but the position is reset).
  private expectOneOrMore(rule: Rule, maybe: boolean = false): Result {
    const results: Result[] = [];
    const pos = this.pos;
    let numMatches = 0;
    let more = true;

    do {
      const result = this.expectOne(rule);
      if (result.success && result.results) {
        numMatches++;
        // TODO: Is it okay to use the spread operator here to flatten the results?
        // It fixes a TypeScript error, and reduces the number of calls to flattenMatches().
        results.push(...result.results);
      } else {
        more = false;
      }
    } while (more);

    const success = numMatches > 0 || maybe === true;
    if (maybe && !(numMatches > 0)) this.pos = pos;
    if (success) {
      this.matchSuccess();
    } else {
      this.matchFail(pos);
    }
    return { success, results, numMatches };
  }

  // Match zero or more instances of `rule`. Offloads to `expectOneOrMore`.
  private expectZeroOrMore(rule: Rule): Result {
    return this.expectOneOrMore(rule, true);
  }

  // Execute the rule produced by the provided `rules` function. This
  // offloads to one of the above matchers and consolidates the results. It is also
  // responsible for executing any code triggered by the rule (in `rule.run`.)
  private expect(ruleFunc: RuleFunction): Result {
    L('Evaluating rule function:', ruleFunc);
    if (!ruleFunc) {
      throw new X('Invalid rule function: ' + ruleFunc, ruleFunc);
    }
    let result: Result;

    // Get rule from Grammar class.
    // expect(...) handles both lexing & parsing:
    // - lexer rules produce tokens.
    // - parser rules produce expressions which may trigger code via the
    //   { run: () => ... } trigger functions in easyscore.ts.
    //   These functions build the VexFlow objects that are displayed on screen.
    const rule: Rule = ruleFunc.bind(this.grammar)();
    if (rule.token) {
      // A lexer rule has a `token` property.
      // Base case: parse the regex and throw an error if the
      // line doesn't match.
      result = this.matchToken(rule.token, rule.noSpace === true);
      if (result.success) {
        // Token match! Update position and throw away parsed portion
        // of string.
        this.pos += result.incrementPos as number;
      }
    } else if (rule.expect) {
      // A parser rule has an `expect` property.
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

    // If there's a trigger attached to this rule, then run it.
    // Make the matches accessible through `result.matches`, which is
    // mapped to `state.matches` in the `run: (state) => ...` trigger.
    result.matches = [];
    if (result.results) {
      result.results.forEach((r) => result.matches!.push(flattenMatches(r)));
    }
    if (rule.run && result.success) {
      rule.run(result);
    }
    return result;
  }
}
