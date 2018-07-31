/**
 * VexFlow - EasyScore Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.EasyScore = (function() {
  var EasyScore = {
    Start: function() {
      QUnit.module('EasyScore');
      var VFT = Vex.Flow.Test;
      QUnit.test('Basic', VFT.EasyScore.basic);
      QUnit.test('Accidentals', VFT.EasyScore.accidentals);
      QUnit.test('Durations', VFT.EasyScore.durations);
      QUnit.test('Chords', VFT.EasyScore.chords);
      QUnit.test('Dots', VFT.EasyScore.dots);
      QUnit.test('Options', VFT.EasyScore.options);
      VFT.runTests('Draw Basic', VFT.EasyScore.drawBasicTest);
      VFT.runTests('Draw Accidentals', VFT.EasyScore.drawAccidentalsTest);
      VFT.runTests('Draw Beams', VFT.EasyScore.drawBeamsTest);
      VFT.runTests('Draw Tuplets', VFT.EasyScore.drawTupletsTest);
      VFT.runTests('Draw Options', VFT.EasyScore.drawOptionsTest);
    },

    basic: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = ['c4', 'c#4', 'c4/r', 'c#5', 'c3/x', 'c3//x'];
      var mustFail = ['', '()', '7', '(c#4 e5 g6'];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    accidentals: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = [
        'c3', 'c##3, cb3', 'Cn3', 'f3//x', '(c##3 cbb3 cn3), cb3',
        'cbbs7', 'cbb7', 'cbss7', 'cbs7', 'cb7', 'cdb7', 'cd7', 'c##7', 'c#7', 'cn7', 'c++-7',
        'c++7', 'c+-7', 'c+7', '(cbs3 bbs3 dbs3), ebs3', '(cd7 cbb3 cn3), cb3', 'co7', 'ck7',
      ];
      var mustFail = [
        'ct3', 'cdbb7', '(cq cbb3 cn3), cb3', '(cdd7 cbb3 cn3), cb3',
        'cbbbs7', 'cbbss7', 'cbsss7', 'csbs7', 'cddb7', 'cddbb7', 'cdd7', 'c##b7', 'c#bs7',
        'cnb#7', 'c+#+b-d7', 'c+--7', 'c++--7', 'c+++7', 'cbk7', 'cok7', 'cko7', 'c#s7',
      ];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    durations: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = ['c3/4', 'c##3/w, cb3', 'c##3/w, cb3/q', 'c##3/q, cb3/32', '(c##3 cbb3 cn3), cb3'];
      var mustFail = ['Cn3/]', '/', '(cq cbb3 cn3), cb3', '(cdd7 cbb3 cn3), cb3'];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    chords: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = [
        '(c5)', '(c3 e0 g9)',
        '(c##4 cbb4 cn4)/w, (c#5 cb2 a3)/32',
        '(d##4 cbb4 cn4)/w/r, (c#5 cb2 a3)',
        '(c##4 cbb4 cn4)/4, (c#5 cb2 a3)',
        '(c##4 cbb4 cn4)/x, (c#5 cb2 a3)',
      ];
      var mustFail = ['(c)'];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    dots: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = [
        'c3/4.',
        'c##3/w.., cb3',
        'f##3/s, cb3/q...',
        'c##3/q, cb3/32',
        '(c##3 cbb3 cn3)., cb3',
        '(c5).',
        '(c##4 cbb4 cn4)/w.., (c#5 cb2 a3)/32',
      ];
      var mustFail = ['.', 'c.#', 'c#4./4'];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    types: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = [
        'c3/4/x.',
        'c##3//r.., cb3',
        'c##3/x.., cb3',
        'c##3/r.., cb3',
        'd##3/w/s, cb3/q...',
        'c##3/q, cb3/32',
        '(c##3 cbb3 cn3)., cb3',
        '(c5).',
        '(c##4 cbb4 cn4)/w.., (c#5 cb2 a3)/32',
      ];
      var mustFail = ['c4/q/U', '(c##4, cbb4 cn4)/w.., (c#5 cb2 a3)/32'];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    options: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = [
        'c3/4.[foo="bar"]',
        'c##3/w.., cb3[id="blah"]',
        'c##3/q, cb3/32',
        '(c##3 cbb3 cn3).[blah="bod4o"], cb3',
        '(c5)[fooooo="booo"]',
        'c#5[id="foobar"]',
      ];
      var mustFail = ['.[', 'f##3/w[], cb3/q...'];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    drawBasicTest: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 350);
      var score = vf.EasyScore();
      var system = vf.System();

      var voice = score.voice.bind(score);
      var notes = score.notes.bind(score);

      system.addStave({
        voices: [
          voice(notes('(d4 e4 g4)/q, c4/q, c4/q/r, c4/q', { stem: 'down' })),
          voice(notes('c#5/h., c5/q', { stem: 'up' })),
        ],
      }).addClef('treble');

      system.addStave({
        voices: [voice(notes('c#3/q, cn3/q, bb3/q, d##3/q', { clef: 'bass' }))],
      }).addClef('bass');
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();
      expect(0);
    },

    drawAccidentalsTest: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 350);
      var score = vf.EasyScore();
      var system = vf.System();

      var voice = score.voice.bind(score);
      var notes = score.notes.bind(score);

      system.addStave({
        voices: [
          voice(notes('(cbbs4 ebb4 gbss4)/q, cbs4/q, cdb4/q/r, cd4/q', { stem: 'down' })),
          voice(notes('c++-5/h., c++5/q', { stem: 'up' })),
        ],
      }).addClef('treble');

      system.addStave({
        voices: [voice(notes('c+-3/q, c+3/q, bb3/q, d##3/q', { clef: 'bass' }))],
      }).addClef('bass');
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();
      expect(0);
    },

    drawBeamsTest: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 250);
      const score = vf.EasyScore();
      const system = vf.System();

      var voice = score.voice.bind(score);
      var notes = score.notes.bind(score);
      var beam = score.beam.bind(score);

      system.addStave({
        voices: [
          voice(notes('(c4 e4 g4)/q, c4/q, c4/q/r, c4/q', { stem: 'down' })),
          voice(notes('c#5/h.', { stem: 'up' }).concat(beam(notes('c5/8, c5/8', { stem: 'up' })))),
        ],
      }).addClef('treble');

      vf.draw();
      expect(0);
    },

    drawTupletsTest: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 250);
      const score = vf.EasyScore();
      const system = vf.System();

      var voice = score.voice.bind(score);
      var notes = score.notes.bind(score);
      var tuplet = score.tuplet.bind(score);
      var beam = score.beam.bind(score);

      system.addStave({
        voices: [
          voice(
            tuplet(
              notes('(c4 e4 g4)/q, cbb4/q, c4/q', { stem: 'down' }),
              { location: VF.Tuplet.LOCATION_BOTTOM }
            ).concat(notes('c4/h', { stem: 'down' }))
          ),
          voice(
            notes('c#5/h.', { stem: 'up' })
              .concat(tuplet(beam(notes('cb5/8, cn5/8, c5/8', { stem: 'up' }))))
          ),
        ],
      }).addClef('treble');

      vf.draw();
      expect(0);
    },

    drawOptionsTest: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 200);
      const score = vf.EasyScore();
      const system = vf.System();

      const notes = score.notes('B4/h[id="foobar", class="red,bold", stem="up", articulations="staccato.below,tenuto"], B4/h[stem="down"]');

      system.addStave({
        voices: [score.voice(notes)],
      });

      vf.draw();

      const assert = options.assert;
      assert.equal(notes[0].getAttribute('id'), 'foobar');
      assert.ok(notes[0].hasClass('red'));
      assert.ok(notes[0].hasClass('bold'));
      assert.equal(notes[0].modifiers[0].getCategory(), 'articulations');
      assert.equal(notes[0].modifiers[0].type, 'a.');
      assert.equal(notes[0].modifiers[0].position, VF.Modifier.Position.BELOW);
      assert.equal(notes[0].modifiers[1].getCategory(), 'articulations');
      assert.equal(notes[0].modifiers[1].type, 'a-');
      assert.equal(notes[0].modifiers[1].position, VF.Modifier.Position.ABOVE);
      assert.equal(notes[0].getStemDirection(), VF.StaveNote.STEM_UP);
      assert.equal(notes[1].getStemDirection(), VF.StaveNote.STEM_DOWN);
    },
  };

  return EasyScore;
})();
