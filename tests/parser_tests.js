/**
 * VexFlow - Factory Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Parser = (function() {
  var TestGrammar = function() {
    return {
      begin: function() { return this.BEGIN; },

      BEGIN: function() { return { expect: [this.BIGORLITTLE, this.EOL] }; },

      // Test that `or` works.
      BIGORLITTLE: function() { return {
        expect: [this.BIGLINE, this.LITTLELINE],
        or: true
      }; },

      // Test a combination of various rules.
      BIGLINE: function() {
        return {
          expect: [this.LBRACE, this.WORD, this.WORDS, this.MAYBEEXCLAIM, this.RBRACE],
        };
      },

      // Combine a token and a rule.
      LITTLELINE: function() {
        return {
          expect: [this.WORD, this.WORDS],
        };
      },

      // Test zeroOrMore.
      WORDS: function() {
        return {
          expect: [this.COMMA, this.WORD],
          zeroOrMore: true,
         };
      },

      // Test maybe.
      MAYBEEXCLAIM: function() {
        return {
          expect: [this.EXCLAIM],
          maybe: true,
         };
      },

      // Test various regex tokens.
      LBRACE: function() { return { token: '[{]' }; },
      RBRACE: function() { return { token: '[}]' }; },
      WORD:  function()  { return { token: '[a-zA-Z]+' }; },
      COMMA: function()  { return { token: '[,]' }; },
      EXCLAIM: function()  { return { token: '[!]' }; },
      EOL: function()  { return { token: '$' }; },
    };
  };

  function assertParseFail(assert, result, expectedPos, msg) {
    assert.notOk(result.success, msg);
    assert.equal(result.errorPos, expectedPos, msg);
  }

  var Parser = {
    Start: function() {
      QUnit.module("Parser");
      var VFT = Vex.Flow.Test;

      QUnit.test("Basic", VFT.Parser.basic);
      QUnit.test("Advanced", VFT.Parser.advanced);
      QUnit.test("Mixed", VFT.Parser.mixed);
    },

    basic: function(assert) {
      var grammar = new TestGrammar();
      var parser = new VF.Parser(grammar);

      grammar.BEGIN = function() { return { expect: [grammar.LITTLELINE, grammar.EOL] }; };
      assertParseFail(assert, parser.parse(''), 0);
      assertParseFail(assert, parser.parse('first second'), 6);
      assertParseFail(assert, parser.parse('first,,'), 5);
      assertParseFail(assert, parser.parse('first,'), 5);
      assertParseFail(assert, parser.parse(',,'), 0);
      assert.equal(parser.parse('first, second').success, true);
      assert.equal(parser.parse('first,second').success, true);
      assert.equal(parser.parse('first').success, true);
      assert.equal(parser.parse('first,second, third').success, true);
    },

    advanced: function(assert) {
      var grammar = new TestGrammar();
      var parser = new VF.Parser(grammar);

      grammar.BEGIN = function() { return { expect: [grammar.BIGLINE, grammar.EOL] }; };
      assert.equal(parser.parse('{first}').success, true);
      assert.equal(parser.parse('{first!}').success, true);
      assert.equal(parser.parse('{first,second}').success, true);
      assert.equal(parser.parse('{first,second!}').success, true);
      assert.equal(parser.parse('{first,second,third!}').success, true);

      assertParseFail(assert, parser.parse('{first,second,third,}'), 19);
      assertParseFail(assert, parser.parse('first,second,third'), 0);
      assertParseFail(assert, parser.parse('{first,second,third'), 19);
      assertParseFail(assert, parser.parse('{!}'), 1);
    },

    mixed: function(assert) {
      var grammar = new TestGrammar();
      var parser = new VF.Parser(grammar);

      assert.equal(parser.parse('{first,second,third!}').success, true);
      assert.equal(parser.parse('first, second').success, true);
      assertParseFail(assert, parser.parse('first second'), 6);
    }
  };

  return Parser;  
})();
