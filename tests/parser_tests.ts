// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Parser Tests

/* eslint-disable */
// @ts-nocheck

import { Parser, Result } from 'parser';
import { Assert, equal, QUnit, test } from './declarations';

const TestGrammar = function () {
  return {
    begin() {
      return this.BEGIN;
    },
    BEGIN() {
      return { expect: [this.BIGORLITTLE, this.EOL] };
    },
    BIGORLITTLE() {
      return { expect: [this.BIGLINE, this.LITTLELINE], or: true };
    },
    BIGLINE() {
      return { expect: [this.LBRACE, this.WORD, this.WORDS, this.MAYBEEXCLAIM, this.RBRACE] };
    },
    LITTLELINE() {
      return { expect: [this.WORD, this.WORDS] };
    },
    WORDS() {
      return { expect: [this.COMMA, this.WORD], zeroOrMore: true };
    },
    MAYBEEXCLAIM() {
      return { expect: [this.EXCLAIM], maybe: true };
    },

    LBRACE() {
      return { token: '[{]' };
    },
    RBRACE() {
      return { token: '[}]' };
    },
    WORD() {
      return { token: '[a-zA-Z]+' };
    },
    COMMA() {
      return { token: '[,]' };
    },
    EXCLAIM() {
      return { token: '[!]' };
    },
    EOL() {
      return { token: '$' };
    },
  };
};

// A series of piano key numbers (Middle C == 40) separated by whitespace.
//   C Major Scale => 40 42 44 45 47 49 51 52
// A chord is 2 or more piano key numbers surrounded by BRACKETS and separated by PERIODS
//   C Major == [40.44.47]
//   C-major F-major G-major A-minor chord progression => [40.44.47] [45.49.52] [47.51.54] [49.52.56]
class MicroScoreGrammar {
  begin() {
    return this.BEGIN;
  }
  BEGIN() {
    return {
      expect: [this.ITEM, this.MAYBE_MORE_ITEMS, this.EOL],
    };
  }
  ITEM() {
    return { expect: [this.PIANO_KEY_NUMBER, this.CHORD], or: true };
  }
  MAYBE_MORE_ITEMS() {
    return {
      expect: [this.ITEM],
      zeroOrMore: true,
    };
  }
  PIANO_KEY_NUMBER() {
    return { expect: [this.NUM], oneOrMore: true };
  }
  CHORD() {
    return {
      expect: [this.LEFT_BRACKET, this.PIANO_KEY_NUMBER, this.MORE_CHORD_PARTS, this.RIGHT_BRACKET],
    };
  }
  MORE_CHORD_PARTS() {
    return {
      expect: [this.PERIOD, this.PIANO_KEY_NUMBER],
      oneOrMore: true,
    };
  }
  NUM() {
    return { token: '\\d+' };
  }
  WHITESPACE() {
    return { token: '\\s+' };
  }
  PERIOD() {
    return { token: '\\.' };
  }
  LEFT_BRACKET() {
    return { token: '\\[' };
  }
  RIGHT_BRACKET() {
    return { token: '\\]' };
  }
  EOL() {
    return { token: '$' };
  }
}

function assertParseFail(assert: Assert, result: Result, expectedPos: number, msg?: string): void {
  assert.notOk(result.success, msg);
  assert.equal(result.errorPos, expectedPos, msg);
}

const ParserTests = {
  Start(): void {
    QUnit.module('Parser');
    test('VF.* API', this.VF_Prefix);
    test('Basic', this.basic);
    test('Advanced', this.advanced);
    test('Mixed', this.mixed);
    test('Micro Score', this.microscore);
  },

  VF_Prefix(): void {
    equal(Parser, VF.Parser);
  },

  basic(assert: Assert): void {
    const grammar = new TestGrammar();
    const parser = new Parser(grammar);

    grammar.BEGIN = function () {
      return { expect: [grammar.LITTLELINE, grammar.EOL] };
    };

    const mustPass = ['first, second', 'first,second', 'first', 'first,second, third'];
    mustPass.forEach(function (line) {
      assert.equal(parser.parse(line).success, true, line);
    });
    assertParseFail(assert, parser.parse(''), 0);
    assertParseFail(assert, parser.parse('first second'), 6);
    assertParseFail(assert, parser.parse('first,,'), 5);
    assertParseFail(assert, parser.parse('first,'), 5);
    assertParseFail(assert, parser.parse(',,'), 0);
  },

  advanced(assert: Assert): void {
    const grammar = new TestGrammar();
    const parser = new Parser(grammar);

    grammar.BEGIN = function () {
      return { expect: [grammar.BIGLINE, grammar.EOL] };
    };
    const mustPass = ['{first}', '{first!}', '{first,second}', '{first,second!}', '{first,second,third!}'];

    mustPass.forEach(function (line) {
      assert.equal(parser.parse(line).success, true, line);
    });
    assertParseFail(assert, parser.parse('{first,second,third,}'), 19);
    assertParseFail(assert, parser.parse('first,second,third'), 0);
    assertParseFail(assert, parser.parse('{first,second,third'), 19);
    assertParseFail(assert, parser.parse('{!}'), 1);
  },

  mixed(assert: Assert): void {
    const grammar = new TestGrammar();
    const parser = new Parser(grammar);

    const mustPass = ['{first,second,third!}', 'first, second'];
    mustPass.forEach(function (line) {
      assert.equal(parser.parse(line).success, true, line);
    });
    assertParseFail(assert, parser.parse('first second'), 6);
  },

  microscore(assert: Assert): void {
    const grammar = new MicroScoreGrammar();
    // TODO: the Parser constructor should take a more generic class for the grammar param.
    // Right now it specifies EasyScore's Grammar class. This prevents us from passing in a different grammar.
    const parser = new Parser(grammar);

    const mustPass = [
      '40 42 44 45 47 49 51 52', // Individual Notes: C Major Scale
      '[40.44.47] [45.49.52] [47.51.54] [49.52.56]', // Chord Progression: C-major F-major G-major A-minor
      '40 [40.44.47] 45 47 [44.47.51]', // Mixed Notes and Chords: C4 [Cmajor] F4 G4 [Eminor]
    ];

    mustPass.forEach(function (line) {
      const result = parser.parse(line);
      assert.equal(result.success, true, line);
      assert.equal(result.matches.length, 3, line);
    });

    assertParseFail(assert, parser.parse('40 42 44 45 47 49 5A 52'), 19);
    assertParseFail(assert, parser.parse('40.44.47] [45.49.52] [47.51.54] [49.52.56]'), 2);
    assertParseFail(assert, parser.parse('40 [40] 45 47 [44.47.51]'), 3); // A chord with a single note is not allowed.
  },
};

export { ParserTests };
