// [VexFlow](https://vexflow.com/) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// EasyScore Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Articulation } from '../src/articulation';
import { EasyScore } from '../src/easyscore';
import { FretHandFinger } from '../src/frethandfinger';
import { Modifier } from '../src/modifier';
import { Parenthesis } from '../src/parenthesis';
import { StaveConnector } from '../src/staveconnector';
import { Stem } from '../src/stem';
import { Tuplet } from '../src/tuplet';

const EasyScoreTests = {
  Start(): void {
    QUnit.module('EasyScore');
    QUnit.test('Basic', basic);
    QUnit.test('Accidentals', accidentals);
    QUnit.test('Durations', durations);
    QUnit.test('Chords', chords);
    QUnit.test('Dots', dots);
    QUnit.test('Types', types);
    QUnit.test('Options', options);
    const run = VexFlowTests.runTests;
    run('Draw Basic', drawBasicTest);
    run('Draw Different KeySignature', drawDiffKeysig);
    run('Draw Basic Muted', drawBasicMutedTest);
    run('Draw Basic Harmonic', drawBasicHarmonicTest);
    run('Draw Basic Slash', drawBasicSlashTest);
    run('Draw Ghostnote Basic', drawGhostBasicTest);
    run('Draw Ghostnote Dotted', drawGhostDottedTest);
    run('Draw Parenthesised', drawParenthesisedTest);
    run('Draw Accidentals', drawAccidentalsTest);
    run('Draw Beams', drawBeamsTest);
    run('Draw Tuplets', drawTupletsTest);
    run('Draw Dots', drawDotsTest);
    run('Draw Options', drawOptionsTest);
    run('Draw Fingerings', drawFingeringsTest);
    run('Keys', keys);
  },
};

/**
 * Use Function.prototype.bind() to create shortcut methods.
 * This can improve the readability of your EasyScore code.
 */
function createShortcuts(score: EasyScore) {
  return {
    voice: score.voice.bind(score),
    notes: score.notes.bind(score),
    beam: score.beam.bind(score),
    tuplet: score.tuplet.bind(score),
  };
}

/**
 * Test case verifies:
 * - all strings in `mustPass` parse correctly
 * - all strings in `mustFail` fail to parse (i.e., Result.success is `false`).
 */
function basic(assert: Assert): void {
  const score = new EasyScore();
  const mustPass = ['c4', 'c#4', 'c4/r', 'c#5', 'c3/m', 'c3//m', 'c3//h', 'c3/s', 'c3//s', 'c3/g', 'c3//g'];
  const mustFail = ['', '()', '7', '(c#4 e5 g6'];

  mustPass.forEach((line) => assert.equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => assert.equal(score.parse(line).success, false, line));
}

function accidentals(assert: Assert): void {
  const score = new EasyScore();
  const mustPass = [
    'c3',
    'c##3, cb3',
    'Cn3',
    'f3//m',
    '(c##3 cbb3 cn3), cb3',
    'cbbs7',
    'cbb7',
    'cbss7',
    'cbs7',
    'cb7',
    'cdb7',
    'cd7',
    'c##7',
    'c#7',
    'cn7',
    'c++-7',
    'c++7',
    'c+-7',
    'c+7',
    '(cbs3 bbs3 dbs3), ebs3',
    '(cd7 cbb3 cn3), cb3',
    'co7',
    'ck7',
  ];
  const mustFail = [
    'ct3',
    'cdbb7',
    '(cq cbb3 cn3), cb3',
    '(cdd7 cbb3 cn3), cb3',
    'cbbbs7',
    'cbbss7',
    'cbsss7',
    'csbs7',
    'cddb7',
    'cddbb7',
    'cdd7',
    'c##b7',
    'c#bs7',
    'cnb#7',
    'c+#+b-d7',
    'c+--7',
    'c++--7',
    'c+++7',
    'cbk7',
    'cok7',
    'cko7',
    'c#s7',
  ];

  mustPass.forEach((line) => assert.equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => assert.equal(score.parse(line).success, false, line));
}

function durations(assert: Assert): void {
  const score = new EasyScore();
  const mustPass = ['c3/4', 'c##3/w, cb3', 'c##3/w, cb3/q', 'c##3/q, cb3/32', '(c##3 cbb3 cn3), cb3'];
  const mustFail = ['Cn3/]', '/', '(cq cbb3 cn3), cb3', '(cdd7 cbb3 cn3), cb3'];

  mustPass.forEach((line) => assert.equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => assert.equal(score.parse(line).success, false, line));
}

function chords(assert: Assert): void {
  const score = new EasyScore();
  const mustPass = [
    '(c5)',
    '(c3 e0 g9)',
    '(c##4 cbb4 cn4)/w, (c#5 cb2 a3)/32',
    '(d##4 cbb4 cn4)/w/r, (c#5 cb2 a3)',
    '(c##4 cbb4 cn4)/4, (c#5 cb2 a3)',
    '(c##4 cbb4 cn4)/m, (c#5 cb2 a3)',
  ];
  const mustFail = ['(c)'];

  mustPass.forEach((line) => assert.equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => assert.equal(score.parse(line).success, false, line));
}

function dots(assert: Assert): void {
  const score = new EasyScore();
  const mustPass = [
    'c3/4.',
    'c##3/w.., cb3',
    'f##3/s, cb3/q...',
    'c##3/q, cb3/32',
    '(c##3 cbb3 cn3)., cb3',
    '(c5).',
    '(c##4 cbb4 cn4)/w.., (c#5 cb2 a3)/32',
  ];
  const mustFail = ['.', 'c.#', 'c#4./4'];

  mustPass.forEach((line) => assert.equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => assert.equal(score.parse(line).success, false, line));
}

function types(assert: Assert): void {
  const score = new EasyScore();
  const mustPass = ['c3/4/m.', 'c##3//r.., cb3', 'c##3/m.., cb3', 'c##3/r.., cb3', 'd##3/w/s, cb3/q...', 'Fb4'];
  const mustFail = ['c4/q/U', '(c##4, cbb4 cn4)/w.., (c#5 cb2 a3)/32', 'z#3'];

  mustPass.forEach((line) => assert.equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => assert.equal(score.parse(line).success, false, line));
}

function options(assert: Assert): void {
  const score = new EasyScore();
  const mustPass = [
    'c3/4.[foo="bar"]',
    'c##3/w.., cb3[id="blah"]',
    'c##3/q, cb3/32',
    '(c##3 cbb3 cn3).[blah="bod4o"], cb3',
    '(c5)[fooooo="booo"]',
    'c#5[id="foobar"]',
  ];
  const mustFail = ['.[', 'f##3/w[], cb3/q...'];

  mustPass.forEach((line) => assert.equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => assert.equal(score.parse(line).success, false, line));
}

function drawBasicTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 350);
  const score = f.EasyScore();
  const system = f.System();

  const { voice, notes } = createShortcuts(score);

  system
    .addStave({
      voices: [
        voice(notes('(d4 e4 g4)/q, c4/q, c4/q/r, c4/q', { stem: 'down' })),
        voice(notes('c#5/h., c5/q', { stem: 'up' })),
      ],
    })
    .addClef('treble');

  system
    .addStave({
      voices: [voice(notes('c#3/q, cn3/q, bb3/q, d##3/q', { clef: 'bass' }))],
    })
    .addClef('bass');
  system.addConnector().setType(StaveConnector.type.BRACKET);

  f.draw();
  options.assert.expect(0);
}

function drawDiffKeysig(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 350);
  const score = f.EasyScore();
  const system = f.System();

  const { voice, notes } = createShortcuts(score);

  system
    .addStave({
      voices: [
        voice(notes('(d4 e4 g4)/q, c4/q, c4/q/r, c4/q', { stem: 'down' })),
        voice(notes('c5/h., c5/q', { stem: 'up' })),
      ],
    })
    .addClef('treble')
    .addTimeSignature('4/4')
    .addKeySignature('D');

  system
    .addStave({
      voices: [voice(notes('c#3/q, cn3/q, bb3/q, d##3/q', { clef: 'bass' }))],
    })
    .addClef('bass')
    .addTimeSignature('4/4');
  system.addConnector().setType(StaveConnector.type.BRACKET);

  f.draw();
  options.assert.expect(0);
}

function drawBasicMutedTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 350);
  const score = f.EasyScore();
  const system = f.System();

  const { voice, notes } = createShortcuts(score);

  system
    .addStave({
      voices: [
        voice(notes('(d4 e4 g4)/q/m, c4/q/m, c4/q/r, c4/q/m', { stem: 'down' })),
        voice(notes('c#5/h/m., c5/q/m', { stem: 'up' })),
      ],
    })
    .addClef('treble');

  system
    .addStave({
      voices: [voice(notes('c#3/q/m, cn3/q/m, bb3/q/m, d##3/q/m', { clef: 'bass' }))],
    })
    .addClef('bass');
  system.addConnector().setType(StaveConnector.type.BRACKET);

  f.draw();
  options.assert.expect(0);
}

function drawBasicHarmonicTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 350);
  const score = f.EasyScore();
  const system = f.System();

  const { voice, notes } = createShortcuts(score);

  system
    .addStave({
      voices: [
        voice(notes('(d4 e4 g4)/q/h, c4/q/h, c4/q/r, c4/q/h', { stem: 'down' })),
        voice(notes('c#5/h/h., c5/q/h', { stem: 'up' })),
      ],
    })
    .addClef('treble');

  system
    .addStave({
      voices: [voice(notes('c#3/q/h, cn3/q/h, bb3/q/h, d##3/q/h', { clef: 'bass' }))],
    })
    .addClef('bass');
  system.addConnector().setType(StaveConnector.type.BRACKET);

  f.draw();
  options.assert.expect(0);
}

function drawBasicSlashTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 350);
  const score = f.EasyScore();
  const system = f.System();

  const { voice, notes } = createShortcuts(score);

  system
    .addStave({
      voices: [
        voice(notes('(d4 e4 g4)/q/s, c4/q/s, c4/q/r, c4/q/s', { stem: 'down' })),
        voice(notes('c#5/h/s., c5/q/s', { stem: 'up' })),
      ],
    })
    .addClef('treble');

  system
    .addStave({
      voices: [voice(notes('c#3/q/s, cn3/q/s, bb3/q/s, d##3/q/s', { clef: 'bass' }))],
    })
    .addClef('bass');
  system.addConnector().setType(StaveConnector.type.BRACKET);

  f.draw();
  options.assert.expect(0);
}

function drawGhostBasicTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 550);
  const score = f.EasyScore();
  const system = f.System();

  system.addStave({
    voices: [
      score.voice(
        [
          ...score.notes('f#5/4, f5, db5, c5', { stem: 'up' }),
          ...score.beam(score.notes('c5/8, d5, fn5, e5', { stem: 'up' })),
          ...score.beam(score.notes('d5, c5', { stem: 'up' })),
        ],
        { time: '7/4' }
      ),
      score.voice(score.notes('c4/h/g, f4/4, c4/4/g, e4/4, c4/8/g, d##4/8, c4/8, c4/8', { stem: 'down' }), {
        time: '7/4',
      }),
    ],
  });

  f.draw();
  options.assert.expect(0);
}

function drawGhostDottedTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 550);
  const score = f.EasyScore();
  const system = f.System();

  system.addStave({
    voices: [
      score.voice(
        [
          ...score.notes('c4/4/g., fbb5/8, d5/4', { stem: 'up' }),
          ...score.beam(score.notes('c5/8, c#5/16, d5/16', { stem: 'up' })),
          ...score.notes('c4/2/g.., fn5/8', { stem: 'up' }),
        ],
        { time: '8/4' }
      ),
      score.voice(
        [
          ...score.notes('f#4/4', { stem: 'down' }),
          ...score.beam(score.notes('e4/8, d4/8', { stem: 'down' })),
          ...score.notes('c4/4/g.., cb4/16, c#4/h, d4/4', { stem: 'down' }),
          ...score.beam(score.notes('fn4/8, e4/8', { stem: 'down' })),
        ],
        { time: '8/4' }
      ),
    ],
  });

  f.draw();
  options.assert.expect(0);
}

function drawParenthesisedTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 350);
  const score = f.EasyScore();
  const system = f.System();

  const { voice, notes } = createShortcuts(score);

  const notes1 = notes('(d4 e4 g4)/q, c4/q, c4/q/r, c4/q', { stem: 'down' });
  Parenthesis.buildAndAttach([notes1[0], notes1[3]]);
  const notes2 = notes('c#5/h., c5/q', { stem: 'down' });
  Parenthesis.buildAndAttach([notes2[0], notes2[1]]);

  system
    .addStave({
      voices: [voice(notes1), voice(notes2)],
    })
    .addClef('treble');

  const notes3 = notes('c#3/q, cn3/q, bb3/q, d##3/q', { stem: 'down' });
  Parenthesis.buildAndAttach(notes3);
  system
    .addStave({
      voices: [voice(notes3)],
    })
    .addClef('bass');
  system.addConnector().setType(StaveConnector.type.BRACKET);

  f.draw();
  options.assert.expect(0);
}

function drawAccidentalsTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 350);
  const score = f.EasyScore();
  const system = f.System();

  const { voice, notes } = createShortcuts(score);

  system
    .addStave({
      voices: [
        voice(notes('(cbbs4 ebb4 gbss4)/q, cbs4/q, cdb4/q/r, cd4/q', { stem: 'down' })),
        voice(notes('c++-5/h., c++5/q', { stem: 'up' })),
      ],
    })
    .addClef('treble');

  system
    .addStave({
      voices: [voice(notes('c+-3/q, c+3/q, bb3/q, d##3/q', { clef: 'bass' }))],
    })
    .addClef('bass');
  system.addConnector().setType(StaveConnector.type.BRACKET);

  f.draw();
  options.assert.expect(0);
}

function drawBeamsTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 250);
  const score = f.EasyScore();
  const system = f.System();

  const { voice, notes, beam } = createShortcuts(score);

  system
    .addStave({
      voices: [
        voice(notes('(c4 e4 g4)/q, c4/q, c4/q/r, c4/q', { stem: 'down' })),
        voice([...notes('c#5/h.', { stem: 'up' }), ...beam(notes('c5/8, c5/8', { stem: 'up' }))]),
      ],
    })
    .addClef('treble');

  f.draw();
  options.assert.expect(0);
}

function drawTupletsTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 250);
  const score = f.EasyScore();
  const system = f.System();

  const { voice, notes, tuplet, beam } = createShortcuts(score);

  // Voice 1, with stems pointed down.
  const v1_tuplet = tuplet(notes('(c4 e4 g4)/q, cbb4/q, c4/q', { stem: 'down' }), {
    location: Tuplet.LOCATION_BOTTOM,
  });
  const v1_halfNote = notes('c4/h', { stem: 'down' });
  const v1 = voice([...v1_tuplet, ...v1_halfNote]);

  // Voice 2, with stems pointed up.
  const v2_halfNote = notes('c#5/h.', { stem: 'up' });
  const v2_tuplet = tuplet(beam(notes('cb5/8, cn5/8, c5/8', { stem: 'up' })));
  const v2 = voice([...v2_halfNote, ...v2_tuplet]);

  system.addStave({ voices: [v1, v2] }).addClef('treble');

  f.draw();
  options.assert.expect(0);
}

function drawDotsTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 250);
  const score = f.EasyScore();
  const system = f.System();

  const { voice, notes } = createShortcuts(score);

  system
    .addStave({
      voices: [voice(notes('(c4 e4 g4)/8., (c4 e4 g4)/8.., (c4 e4 g4)/8..., (c4 e4 g4)/8...., (c4 e4 g4)/16...'))],
    })
    .addClef('treble');

  f.draw();
  options.assert.expect(0);
}

function drawOptionsTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 500, 200);
  const score = f.EasyScore();
  const system = f.System();

  const notes = score.notes(
    'B4/h[id="foobar", class="red,bold", stem="up", articulations="staccato.below,tenuto"], B4/q[articulations="accent.above"], B4/q[stem="down"]'
  );

  system.addStave({ voices: [score.voice(notes)] });

  f.draw();

  const note0 = notes[0];
  const note1 = notes[1];
  const note0_modifier0 = note0.getModifiers()[0] as Articulation;
  const note0_modifier1 = note0.getModifiers()[1] as Articulation;
  const note1_modifier0 = note1.getModifiers()[0] as Articulation;

  options.assert.equal(note0.getAttribute('id'), 'foobar');
  options.assert.ok(note0.hasClass('red'));
  options.assert.ok(note0.hasClass('bold'));
  options.assert.equal(note0_modifier0.getCategory(), Articulation.CATEGORY);
  options.assert.equal(note0_modifier0.type, 'a.');
  options.assert.equal(note0_modifier0.getPosition(), Modifier.Position.BELOW);
  options.assert.equal(note0_modifier1.getCategory(), Articulation.CATEGORY);
  options.assert.equal(note0_modifier1.type, 'a-');
  options.assert.equal(note0_modifier1.getPosition(), Modifier.Position.ABOVE);
  options.assert.equal(note0.getStemDirection(), Stem.UP);
  options.assert.equal(note1_modifier0.getCategory(), Articulation.CATEGORY);
  options.assert.equal(note1_modifier0.type, 'a>');
  options.assert.equal(note1_modifier0.getPosition(), Modifier.Position.ABOVE);
  options.assert.equal(notes[2].getStemDirection(), Stem.DOWN);
}

function drawFingeringsTest(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 500, 200);
  const score = f.EasyScore();
  const system = f.System();

  const notes = score.notes(
    'C4/q[fingerings="1"], E4[fingerings="3.above"], G4[fingerings="5.below"], (C4 E4 G4)[fingerings="1,3,5"]'
  );

  system.addStave({ voices: [score.voice(notes)] });

  f.draw();

  const note0_modifier0 = notes[0].getModifiers()[0] as FretHandFinger;
  options.assert.equal(note0_modifier0.getCategory(), FretHandFinger.CATEGORY);
  options.assert.equal(note0_modifier0.getFretHandFinger(), '1');
  options.assert.equal(note0_modifier0.getPosition(), Modifier.Position.LEFT);

  const note1_modifier0 = notes[1].getModifiers()[0] as FretHandFinger;
  options.assert.equal(note1_modifier0.getCategory(), FretHandFinger.CATEGORY);
  options.assert.equal(note1_modifier0.getFretHandFinger(), '3');
  options.assert.equal(note1_modifier0.getPosition(), Modifier.Position.ABOVE);

  const note2_modifier0 = notes[2].getModifiers()[0] as FretHandFinger;
  options.assert.equal(note2_modifier0.getCategory(), FretHandFinger.CATEGORY);
  options.assert.equal(note2_modifier0.getFretHandFinger(), '5');
  options.assert.equal(note2_modifier0.getPosition(), Modifier.Position.BELOW);

  const note3_modifiers: FretHandFinger[] = notes[3].getModifiers() as FretHandFinger[];
  const note3_modifier0 = note3_modifiers[0];
  const note3_modifier1 = note3_modifiers[1];
  const note3_modifier2 = note3_modifiers[2];
  options.assert.equal(note3_modifier0.getCategory(), FretHandFinger.CATEGORY);
  options.assert.equal(note3_modifier0.getFretHandFinger(), '1');
  options.assert.equal(note3_modifier0.getPosition(), Modifier.Position.LEFT);
  options.assert.equal(note3_modifier1.getCategory(), FretHandFinger.CATEGORY);
  options.assert.equal(note3_modifier1.getFretHandFinger(), '3');
  options.assert.equal(note3_modifier1.getPosition(), Modifier.Position.LEFT);
  options.assert.equal(note3_modifier2.getCategory(), FretHandFinger.CATEGORY);
  options.assert.equal(note3_modifier2.getFretHandFinger(), '5');
  options.assert.equal(note3_modifier2.getPosition(), Modifier.Position.LEFT);
}

function keys(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 200);
  const score = f.EasyScore();
  const system = f.System();
  const notes = score.notes(
    'c#3/q, c##3, cb3, cbb3, cn3, c3, cbbs3, cbss3, cbs3, cdb3, cd3, c++-3, c++3, c+-3, c+3, co3, ck3',
    { clef: 'bass' }
  );

  system.addStave({ voices: [f.Voice().setStrict(false).addTickables(notes)] }).addClef('bass');
  f.draw();

  options.assert.equal(notes[0].keys, 'c#/3');
  options.assert.equal(notes[1].keys, 'c##/3');
  options.assert.equal(notes[2].keys, 'cb/3');
  options.assert.equal(notes[3].keys, 'cbb/3');
  options.assert.equal(notes[4].keys, 'cn/3');
  for (let i = 5; i < notes.length; i++) {
    options.assert.equal(notes[i].keys, 'c/3');
  }
}

VexFlowTests.register(EasyScoreTests);
export { EasyScoreTests };
