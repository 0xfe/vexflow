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
      VFT.runTests("Basic Rendering", VFT.EasyScore.drawBasicTest);
    },

    basic: function(assert) {
      // TODO(0xfe): Reduce duplication in these assertions.
      var score = new VF.EasyScore();
      assert.equal(score.parse('').success, false);
      assert.equal(score.parse('()').success, false);
      assert.equal(score.parse('c4/r').success, true);
      assert.equal(score.parse('7').success, false);
      assert.equal(score.parse('c#5').success, true);
      assert.equal(score.parse('c3//x').success, true);

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
      assert.equal(score.parse('f3//x').success, true);
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
      assert.equal(score.parse('(d##4 cbb4 cn4)/w/r, (c#5 cb2 a3)').success, true);
      assert.equal(score.parse('(c##4 cbb4 cn4)/4, (c#5 cb2 a3)').success, true);
      assert.equal(score.parse('(c##4 cbb4 cn4)/x, (c#5 cb2 a3)').success, true);
    },

    dots: function(assert) {
      var score = new VF.EasyScore();
      assert.equal(score.parse('c3/4.').success, true);
      assert.equal(score.parse('c##3/w.., cb3').success, true);
      assert.equal(score.parse('f##3/s, cb3/q...').success, true);
      assert.equal(score.parse('c##3/q, cb3/32').success, true);
      assert.equal(score.parse('.').success, false);

      assert.equal(score.parse('(c##3 cbb3 cn3)., cb3').success, true);
      assert.equal(score.parse('(c5).').success, true);
      assert.equal(score.parse('(c##4 cbb4 cn4)/w.., (c#5 cb2 a3)/32').success, true);
    },

    types: function(assert) {
      var score = new VF.EasyScore();
      assert.equal(score.parse('c3/4/x.').success, true);
      assert.equal(score.parse('c##3//r.., cb3').success, true);
      assert.equal(score.parse('c##3/x.., cb3').success, true);
      assert.equal(score.parse('c##3/r.., cb3').success, true);
      assert.equal(score.parse('d##3/w/s, cb3/q...').success, true);
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
      assert.equal(score.parse('f##3/w[], cb3/q...').success, false);
      assert.equal(score.parse('c##3/q, cb3/32').success, true);
      assert.equal(score.parse('.[').success, false);

      assert.equal(score.parse('(c##3 cbb3 cn3).[blah="bod4o"], cb3').success, true);
      console.log(score.parse('(c##3 cbb3 cn3).[blah="bod4o"], cb3'));
      assert.equal(score.parse('(c5)[fooooo="booo"]').success, true);
    },

    drawBasicTest: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 750);
      const score = new VF.EasyScore({factory: vf});
      const system = vf.System();

      system.addStave({
        voices: [
          score.voice('c#4/q, c4/q, c4/q/r, c4/q', {stem: 'down'}),
          score.voice('c#5/h., c5/q', {stem: 'up'})
      ]}).addClef('treble');

      system.addStave({
        voices: [
          score.voice('c#4/q, cn4/q, bb4/q, d##4/q'),
      ]}).addClef('bass');
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();
      expect(0);
    },
  };

  return EasyScore;  
})();
