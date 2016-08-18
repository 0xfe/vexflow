/**
 * VexFlow - Factory Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Parser = (function() {
  var TestGrammar = function() {
    var words = [];

    return {
      begin: function() { return this.BEGIN; },
      resetWords: function() { words = []; },
      getWords: function() { return words; },

      BEGIN: function() { return { expect: [this.BIGLINE, this.EOL] }; },

      BIGLINE: function() {
        return {
          expect: [this.LBRACE, this.WORD, this.WORDS, this.MAYBEEXCLAIM, this.RBRACE, this.EOL],
          run: function(state) {words.push(state[0]);}
        };
      },

      LITTLELINE: function() {
        return {
          expect: [this.WORD, this.WORDS],
          run: function(state) { console.log("LITTLELINE: ", state); }
        };
      },

      WORDS: function() {
        return {
          expect: [this.COMMA, this.WORD],
          zeroOrMore: true,
          run: function(state) { console.log("WORDS: ", state); }
         };
      },

      MAYBEEXCLAIM: function() {
        return {
          expect: [this.EXCLAIM],
          maybe: true,
         };
      },

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

      VF.Parser.DEBUG = true;
      QUnit.test("Basic", VFT.Parser.basic);
      QUnit.test("Advanced", VFT.Parser.advanced);
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

      grammar.resetWords();
      console.log(grammar.getWords());
      assert.equal(parser.parse('first,second, third').success, true);
      console.log(grammar.getWords());

      assert.ok(true);
    },

    advanced: function(assert) {
      var grammar = new TestGrammar();
      var parser = new VF.Parser(grammar);

      assert.equal(parser.parse('{first}').success, true);
      assert.equal(parser.parse('{first!}').success, true);
      assert.equal(parser.parse('{first,second}').success, true);
      assert.equal(parser.parse('{first,second!}').success, true);
      assert.equal(parser.parse('{first,second,third!}').success, true);

      assertParseFail(assert, parser.parse('{first,second,third,}'), 19);
      assert.ok(true);
    }
  };

  return Parser;  
})();
