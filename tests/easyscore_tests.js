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
      VF.EasyScore.DEBUG = true;
      QUnit.test("Basic", VFT.EasyScore.basic);
      QUnit.test("Accidentals", VFT.EasyScore.accidentals);
      QUnit.test("Durations", VFT.EasyScore.durations);
      QUnit.test("Chords", VFT.EasyScore.chords);
      QUnit.test("Dots", VFT.EasyScore.dots);
      QUnit.test("Options", VFT.EasyScore.options);
    },

    basic: function(assert) {
      // TODO(0xfe): Reduce duplication in these assertions.
      var score = new VF.EasyScore();
      assert.equal(score.parse('').success, false);
      assert.equal(score.parse('()').success, false);
      assert.equal(score.parse('r4').success, true);
      assert.equal(score.parse('7').success, false);
      assert.equal(score.parse('c#5').success, true);
      assert.equal(score.parse('x3').success, true);

      assert.equal(score.parse('c5/w').success, true);
      assert.equal(score.parse('c5/w').success, true);
      assert.equal(score.parse('(c#4 e5 g6)').success, true);
      assert.equal(score.parse('(c#4 e5 g6').success, false);
    },

    accidentals: function(assert) {
      var score = new VF.EasyScore();
      assert.equal(score.parse('c3').success, true);
      assert.equal(score.parse('c##3, cb3').success, true);
      assert.equal(score.parse('Cn3').success, true);
      assert.equal(score.parse('x3').success, true);
      assert.equal(score.parse('ct3').success, false);
      assert.equal(score.parse('cd7').success, false);

      assert.equal(score.parse('(c##3 cbb3 cn3), cb3').success, true);
      assert.equal(score.parse('(cq cbb3 cn3), cb3').success, false);
      assert.equal(score.parse('(cd7 cbb3 cn3), cb3').success, false);
    },

    durations: function(assert) {
      var score = new VF.EasyScore();
      assert.equal(score.parse('c3/4').success, true);
      assert.equal(score.parse('c##3/w, cb3').success, true);
      assert.equal(score.parse('c##3/w, cb3/q').success, true);
      assert.equal(score.parse('c##3/q, cb3/32').success, true);
      assert.equal(score.parse('Cn3/]').success, false);
      assert.equal(score.parse('/').success, false);

      assert.equal(score.parse('(c##3 cbb3 cn3), cb3').success, true);
      assert.equal(score.parse('(cq cbb3 cn3), cb3').success, false);
      assert.equal(score.parse('(cd7 cbb3 cn3), cb3').success, false);
    },

    chords: function(assert) {
      var score = new VF.EasyScore();
      assert.equal(score.parse('(c)').success, false);
      assert.equal(score.parse('(c5)').success, true);
      assert.equal(score.parse('(c3 e0 g9)').success, true);
      assert.equal(score.parse('(c##4 cbb4 cn4)/w, (c#5 cb2 a3)/32').success, true);
      assert.equal(score.parse('(x##4 cbb4 cn4)/w, (c#5 cb2 a3)').success, true);
      assert.equal(score.parse('(c##4 cbb4 cn4)/x, (c#5 cb2 a3)').success, false);
    },

    dots: function(assert) {
      var score = new VF.EasyScore();
      assert.equal(score.parse('c3/4.').success, true);
      assert.equal(score.parse('c##3/w.., cb3').success, true);
      assert.equal(score.parse('s##3/w, cb3/q...').success, true);
      assert.equal(score.parse('c##3/q, cb3/32').success, true);
      assert.equal(score.parse('.').success, false);

      assert.equal(score.parse('(c##3 cbb3 cn3)., cb3').success, true);
      assert.equal(score.parse('(c5).').success, true);
      assert.equal(score.parse('(c##4 cbb4 cn4)/w.., (c#5 cb2 a3)/32').success, true);
    },

    options: function(assert) {
      var score = new VF.EasyScore();
      assert.equal(score.parse('c3/4.[foo="bar"]').success, true);
      assert.equal(score.parse('c##3/w.., cb3[id="blah"]').success, true);
      assert.equal(score.parse('s##3/w[], cb3/q...').success, false);
      assert.equal(score.parse('c##3/q, cb3/32').success, true);
      assert.equal(score.parse('.[').success, false);

      assert.equal(score.parse('(c##3 cbb3 cn3).[blah="bod4o"], cb3').success, true);
      console.log(score.parse('(c##3 cbb3 cn3).[blah="bod4o"], cb3'));
      assert.equal(score.parse('(c5)[fooooo="booo"]').success, true);
    },
  };

  return EasyScore;  
})();
