// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Parser Tests

import { VexFlowTests } from './vexflow_test_helpers';

import { Grammar, Parser, Result, RuleFunction } from '../src/parser';

const ParserTests = {
  Start(): void {
    QUnit.module('Parser');
    QUnit.test('Basic', basic);
    QUnit.test('Advanced', advanced);
    QUnit.test('Mixed', mixed);
    QUnit.test('Micro Score', microscore);
  },
};

/**
 * Grammar used in the first three test cases: basic, advanced, mixed.
 */
class TestGrammar implements Grammar {
  // Test cases customize this field.
  expect!: RuleFunction[];

  // The begin() function is the only requirement when implementing the Grammar interface.
  begin(): RuleFunction {
    return () => ({ expect: this.expect });
  }

  BIGORLITTLE() {
    return { expect: [this.BIGLINE, this.LITTLELINE], or: true };
  }
  BIGLINE() {
    return { expect: [this.LBRACE, this.WORD, this.WORDS, this.MAYBEEXCLAIM, this.RBRACE] };
  }
  LITTLELINE() {
    return { expect: [this.WORD, this.WORDS] };
  }
  WORDS() {
    return { expect: [this.COMMA, this.WORD], zeroOrMore: true };
  }
  MAYBEEXCLAIM() {
    return { expect: [this.EXCLAIM], maybe: true };
  }
  LBRACE() {
    return { token: '[{]' };
  }
  RBRACE() {
    return { token: '[}]' };
  }
  WORD() {
    return { token: '[a-zA-Z]+' };
  }
  COMMA() {
    return { token: '[,]' };
  }
  EXCLAIM() {
    return { token: '[!]' };
  }
  EOL() {
    return { token: '$' };
  }
}

/**
 * Grammar used in the microscore test case.
 * It represents a series of piano key numbers (Middle C == 40) separated by whitespace.
 *   C Major Scale => 40 42 44 45 47 49 51 52
 * A chord is 2 or more piano key numbers surrounded by BRACKETS and separated by PERIODS
 *   C Major == [40.44.47]
 *   C-major F-major G-major A-minor chord progression => [40.44.47] [45.49.52] [47.51.54] [49.52.56]
 */
class MicroScoreGrammar {
  begin() {
    return () => ({ expect: [this.ITEM, this.MAYBE_MORE_ITEMS, this.EOL] });
  }
  ITEM = () => ({ expect: [this.PIANO_KEY_NUMBER, this.CHORD], or: true });
  MAYBE_MORE_ITEMS = () => ({ expect: [this.ITEM], zeroOrMore: true });
  PIANO_KEY_NUMBER = () => ({ expect: [this.NUM], oneOrMore: true });
  CHORD = () => ({ expect: [this.LEFT_BRACKET, this.PIANO_KEY_NUMBER, this.MORE_CHORD_PARTS, this.RIGHT_BRACKET] });
  MORE_CHORD_PARTS = () => ({ expect: [this.PERIOD, this.PIANO_KEY_NUMBER], oneOrMore: true });
  NUM = () => ({ token: '\\d+' });
  WHITESPACE = () => ({ token: '\\s+' });
  PERIOD = () => ({ token: '\\.' });
  LEFT_BRACKET = () => ({ token: '\\[' });
  RIGHT_BRACKET = () => ({ token: '\\]' });
  EOL = () => ({ token: '$' });
}

/**
 * Check that the result is a parse failure, and verify the error position.
 */
function fails(assert: Assert, result: Result, expectedErrorPos: number, msg?: string): void {
  assert.notOk(result.success, msg);
  assert.equal(result.errorPos, expectedErrorPos, msg);
}

function basic(assert: Assert): void {
  const grammar = new TestGrammar();
  grammar.expect = [grammar.LITTLELINE, grammar.EOL];
  const parser = new Parser(grammar);

  // Each of these strings will parse correctly.
  const mustPass = ['first, second', 'first,second', 'first', 'first,second, third'];
  mustPass.forEach((line) => assert.equal(parser.parse(line).success, true, line));

  fails(assert, parser.parse(''), 0);
  fails(assert, parser.parse('first second'), 6);
  fails(assert, parser.parse('first,,'), 5);
  fails(assert, parser.parse('first,'), 5);
  fails(assert, parser.parse(',,'), 0);
}

function advanced(assert: Assert): void {
  const grammar = new TestGrammar();
  grammar.expect = [grammar.BIGLINE, grammar.EOL];
  const parser = new Parser(grammar);

  const mustPass = ['{first}', '{first!}', '{first,second}', '{first,second!}', '{first,second,third!}'];
  mustPass.forEach((line) => assert.equal(parser.parse(line).success, true, line));

  fails(assert, parser.parse('{first,second,third,}'), 19);
  fails(assert, parser.parse('first,second,third'), 0);
  fails(assert, parser.parse('{first,second,third'), 19);
  fails(assert, parser.parse('{!}'), 1);
}

function mixed(assert: Assert): void {
  const grammar = new TestGrammar();
  grammar.expect = [grammar.BIGORLITTLE, grammar.EOL];
  const parser = new Parser(grammar);

  const mustPass = ['{first,second,third!}', 'first, second'];
  mustPass.forEach((line) => assert.equal(parser.parse(line).success, true, line));

  fails(assert, parser.parse('first second'), 6);
}

function microscore(assert: Assert): void {
  const grammar = new MicroScoreGrammar();
  const parser = new Parser(grammar);

  const mustPass = [
    '40 42 44 45 47 49 51 52', // Individual Notes: C Major Scale
    '[40.44.47] [45.49.52] [47.51.54] [49.52.56]', // Chord Progression: C-major F-major G-major A-minor
    '40 [40.44.47] 45 47 [44.47.51]', // Mixed Notes and Chords: C4 [Cmajor] F4 G4 [Eminor]
  ];

  mustPass.forEach((line) => {
    const result = parser.parse(line);
    assert.equal(result.success, true, line);
    assert.equal(result.matches?.length, 3, line);
  });

  fails(assert, parser.parse('40 42 44 45 47 49 5A 52'), 19);
  fails(assert, parser.parse('40.44.47] [45.49.52] [47.51.54] [49.52.56]'), 2);
  fails(assert, parser.parse('40 [40] 45 47 [44.47.51]'), 3); // A chord with a single note is not allowed.
}

VexFlowTests.register(ParserTests);
export { ParserTests };
