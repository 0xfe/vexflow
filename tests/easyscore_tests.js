/**
 * VexFlow - EasyScore Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.EasyScore = (function() {
  function assertParseFail(assert, result, expectedPos, msg) {
    assert.notOk(result.success, msg);
    assert.equal(result.errorPos, expectedPos, msg);
  }

  var EasyScore = {
    Start: function() {
      QUnit.module("EasyScore");
      var VFT = Vex.Flow.Test;
      VF.Parser.DEBUG = true;
      QUnit.test("Basic", VFT.EasyScore.basic);
      QUnit.test("Accidentals", VFT.EasyScore.basic);
      QUnit.test("Durations", VFT.EasyScore.basic);
      QUnit.test("Chords", VFT.EasyScore.basic);
      QUnit.test("Dots", VFT.EasyScore.basic);
      QUnit.test("Options", VFT.EasyScore.basic);
    },

    basic: function(assert) {
      var score = new VF.EasyScore();
      assert.equal(score.parse('c').success, true);
      assert.equal(score.parse('7').success, false);
      assert.equal(score.parse('c#').success, true);
      assert.equal(score.parse('x').success, true);

      assert.equal(score.parse('c5/w').success, true);
      assert.equal(score.parse('c5/w').success, true);
      assert.equal(score.parse('(c# e g)').success, true);
      assert.equal(score.parse('(c# e g').success, false);
    },
  };

  return EasyScore;  
})();
