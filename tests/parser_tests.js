/**
 * VexFlow - Parser Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
const ParserTests = (function () {
  var TestGrammar = function () {
    return {
      begin: function () {
        return this.BEGIN;
      },

      BEGIN: function () {
        return { expect: [this.BIGORLITTLE, this.EOL] };
      },
      BIGORLITTLE: function () {
        return { expect: [this.BIGLINE, this.LITTLELINE], or: true };
      },
      BIGLINE: function () {
        return { expect: [this.LBRACE, this.WORD, this.WORDS, this.MAYBEEXCLAIM, this.RBRACE] };
      },
      LITTLELINE: function () {
        return { expect: [this.WORD, this.WORDS] };
      },
      WORDS: function () {
        return { expect: [this.COMMA, this.WORD], zeroOrMore: true };
      },
      MAYBEEXCLAIM: function () {
        return { expect: [this.EXCLAIM], maybe: true };
      },

      LBRACE: function () {
        return { token: '[{]' };
      },
      RBRACE: function () {
        return { token: '[}]' };
      },
      WORD: function () {
        return { token: '[a-zA-Z]+' };
      },
      COMMA: function () {
        return { token: '[,]' };
      },
      EXCLAIM: function () {
        return { token: '[!]' };
      },
      EOL: function () {
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

  function assertParseFail(assert, result, expectedPos, msg) {
    assert.notOk(result.success, msg);
    assert.equal(result.errorPos, expectedPos, msg);
  }

  var Parser = {
    Start: function () {
      QUnit.module('Parser');
      var VFT = Vex.Flow.Test;

      QUnit.test('Basic', VFT.Parser.basic);
      QUnit.test('Advanced', VFT.Parser.advanced);
      QUnit.test('Mixed', VFT.Parser.mixed);
      QUnit.test('Micro Score', VFT.Parser.microscore);
    },

    basic: function (assert) {
      var grammar = new TestGrammar();
      var parser = new VF.Parser(grammar);

      grammar.BEGIN = function () {
        return { expect: [grammar.LITTLELINE, grammar.EOL] };
      };

      var mustPass = ['first, second', 'first,second', 'first', 'first,second, third'];
      mustPass.forEach(function (line) {
        assert.equal(parser.parse(line).success, true, line);
      });
      assertParseFail(assert, parser.parse(''), 0);
      assertParseFail(assert, parser.parse('first second'), 6);
      assertParseFail(assert, parser.parse('first,,'), 5);
      assertParseFail(assert, parser.parse('first,'), 5);
      assertParseFail(assert, parser.parse(',,'), 0);
    },

    advanced: function (assert) {
      var grammar = new TestGrammar();
      var parser = new VF.Parser(grammar);

      grammar.BEGIN = function () {
        return { expect: [grammar.BIGLINE, grammar.EOL] };
      };
      var mustPass = ['{first}', '{first!}', '{first,second}', '{first,second!}', '{first,second,third!}'];

      mustPass.forEach(function (line) {
        assert.equal(parser.parse(line).success, true, line);
      });
      assertParseFail(assert, parser.parse('{first,second,third,}'), 19);
      assertParseFail(assert, parser.parse('first,second,third'), 0);
      assertParseFail(assert, parser.parse('{first,second,third'), 19);
      assertParseFail(assert, parser.parse('{!}'), 1);
    },

    mixed: function (assert) {
      var grammar = new TestGrammar();
      var parser = new VF.Parser(grammar);

      var mustPass = ['{first,second,third!}', 'first, second'];
      mustPass.forEach(function (line) {
        assert.equal(parser.parse(line).success, true, line);
      });
      assertParseFail(assert, parser.parse('first second'), 6);
    },

    microscore: function (assert) {
      var grammar = new MicroScoreGrammar();
      var parser = new VF.Parser(grammar);

      var mustPass = [
        '40 42 44 45 47 49 51 52', // Individual Notes: C Major Scale
        '[40.44.47] [45.49.52] [47.51.54] [49.52.56]', // Chord Progression: C-major F-major G-major A-minor
        '40 [40.44.47] 45 47 [44.47.51]', // Mixed Notes and Chords: C4 [Cmajor] F4 G4 [Eminor]
      ];

      mustPass.forEach(function (line) {
        var result = parser.parse(line);
        assert.equal(result.success, true, line);
        assert.equal(result.matches.length, 3, line);
      });

      assertParseFail(assert, parser.parse('40 42 44 45 47 49 5A 52'), 19);
      assertParseFail(assert, parser.parse('40.44.47] [45.49.52] [47.51.54] [49.52.56]'), 2);
      assertParseFail(assert, parser.parse('40 [40] 45 47 [44.47.51]'), 3); // A chord with a single note is not allowed.
    },
  };

  return Parser;
})();
Vex.Flow.Test.Parser = ParserTests;
export { ParserTests };
