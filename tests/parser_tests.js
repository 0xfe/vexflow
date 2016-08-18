/**
 * VexFlow - Factory Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Parser = (function() {
  var TestGrammar = function() {
    var results = [];

    return {
      begin: function() { return this.WORDS; },
      getResults: function() { return results; },

      WORDS: function() {
        return {
          expect: [this.WORD, this.COMMA],
          oneOrMore: true,
          run: function(state) {results.push(state[0], state[2]);}
         };
      },
      WORD:  function()  { return { token: '[a-zA-Z]+' }; },
      COMMA: function()  { return { token: ',' }; },
    };
  };

  var Parser = {
    Start: function() {
      QUnit.module("Parser");
      var VFT = Vex.Flow.Test;

      QUnit.test("Basic", VFT.Parser.basic);
    },

    basic: function(assert) {
      VF.Parser.DEBUG = true;
      const grammar = new TestGrammar();
      const parser = new VF.Parser(grammar);

      console.log(parser.parse('first second'));
      console.log(parser.parse('first, second'));
      console.log(grammar.getResults());

      assert.ok(true);
    }
  };

  return Parser;  
})();
