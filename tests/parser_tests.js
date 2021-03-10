/**
 * VexFlow - Parser Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Parser = (function () {
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
  };

  return Parser;
})();
