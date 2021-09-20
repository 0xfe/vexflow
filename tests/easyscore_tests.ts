// [VexFlow](https://vexflow.com/) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// EasyScore Tests

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { Articulation } from 'articulation';
import { EasyScore } from 'easyscore';
import { FretHandFinger } from 'frethandfinger';
import { Modifier } from 'modifier';
import { StaveConnector } from 'staveconnector';
import { Tuplet } from 'tuplet';
import { Stem } from 'stem';

const EasyScoreTests = {
  Start(): void {
    QUnit.module('EasyScore');
    test('Basic', basic);
    test('Accidentals', accidentals);
    test('Durations', durations);
    test('Chords', chords);
    test('Dots', dots);
    test('Types', types);
    test('Options', options);
    const run = VexFlowTests.runTests;
    run('Draw Basic', drawBasicTest);
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
function basic(): void {
  const score = new EasyScore();
  const mustPass = ['c4', 'c#4', 'c4/r', 'c#5', 'c3/x', 'c3//x'];
  const mustFail = ['', '()', '7', '(c#4 e5 g6'];

  mustPass.forEach((line) => equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => equal(score.parse(line).success, false, line));
}

function accidentals(): void {
  const score = new EasyScore();
  const mustPass = [
    'c3',
    'c##3, cb3',
    'Cn3',
    'f3//x',
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

  mustPass.forEach((line) => equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => equal(score.parse(line).success, false, line));
}

function durations(): void {
  const score = new EasyScore();
  const mustPass = ['c3/4', 'c##3/w, cb3', 'c##3/w, cb3/q', 'c##3/q, cb3/32', '(c##3 cbb3 cn3), cb3'];
  const mustFail = ['Cn3/]', '/', '(cq cbb3 cn3), cb3', '(cdd7 cbb3 cn3), cb3'];

  mustPass.forEach((line) => equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => equal(score.parse(line).success, false, line));
}

function chords(): void {
  const score = new EasyScore();
  const mustPass = [
    '(c5)',
    '(c3 e0 g9)',
    '(c##4 cbb4 cn4)/w, (c#5 cb2 a3)/32',
    '(d##4 cbb4 cn4)/w/r, (c#5 cb2 a3)',
    '(c##4 cbb4 cn4)/4, (c#5 cb2 a3)',
    '(c##4 cbb4 cn4)/x, (c#5 cb2 a3)',
  ];
  const mustFail = ['(c)'];

  mustPass.forEach((line) => equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => equal(score.parse(line).success, false, line));
}

function dots(): void {
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

  mustPass.forEach((line) => equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => equal(score.parse(line).success, false, line));
}

function types(): void {
  const score = new EasyScore();
  const mustPass = ['c3/4/x.', 'c##3//r.., cb3', 'c##3/x.., cb3', 'c##3/r.., cb3', 'd##3/w/s, cb3/q...', 'Fb4'];
  const mustFail = ['c4/q/U', '(c##4, cbb4 cn4)/w.., (c#5 cb2 a3)/32', 'z#3'];

  mustPass.forEach((line) => equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => equal(score.parse(line).success, false, line));
}

function options(): void {
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

  mustPass.forEach((line) => equal(score.parse(line).success, true, line));
  mustFail.forEach((line) => equal(score.parse(line).success, false, line));
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
  expect(0);
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
  expect(0);
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
  expect(0);
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
  expect(0);
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
  expect(0);
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

  equal(note0.getAttribute('id'), 'foobar');
  ok(note0.hasClass('red'));
  ok(note0.hasClass('bold'));
  equal(note0_modifier0.getCategory(), Articulation.CATEGORY);
  equal(note0_modifier0.type, 'a.');
  equal(note0_modifier0.getPosition(), Modifier.Position.BELOW);
  equal(note0_modifier1.getCategory(), Articulation.CATEGORY);
  equal(note0_modifier1.type, 'a-');
  equal(note0_modifier1.getPosition(), Modifier.Position.ABOVE);
  equal(note0.getStemDirection(), Stem.UP);
  equal(note1_modifier0.getCategory(), Articulation.CATEGORY);
  equal(note1_modifier0.type, 'a>');
  equal(note1_modifier0.getPosition(), Modifier.Position.ABOVE);
  equal(notes[2].getStemDirection(), Stem.DOWN);
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
  equal(note0_modifier0.getCategory(), FretHandFinger.CATEGORY);
  equal(note0_modifier0.getFretHandFinger(), '1');
  equal(note0_modifier0.getPosition(), Modifier.Position.LEFT);

  const note1_modifier0 = notes[1].getModifiers()[0] as FretHandFinger;
  equal(note1_modifier0.getCategory(), FretHandFinger.CATEGORY);
  equal(note1_modifier0.getFretHandFinger(), '3');
  equal(note1_modifier0.getPosition(), Modifier.Position.ABOVE);

  const note2_modifier0 = notes[2].getModifiers()[0] as FretHandFinger;
  equal(note2_modifier0.getCategory(), FretHandFinger.CATEGORY);
  equal(note2_modifier0.getFretHandFinger(), '5');
  equal(note2_modifier0.getPosition(), Modifier.Position.BELOW);

  const note3_modifiers: FretHandFinger[] = notes[3].getModifiers() as FretHandFinger[];
  const note3_modifier0 = note3_modifiers[0];
  const note3_modifier1 = note3_modifiers[1];
  const note3_modifier2 = note3_modifiers[2];
  equal(note3_modifier0.getCategory(), FretHandFinger.CATEGORY);
  equal(note3_modifier0.getFretHandFinger(), '1');
  equal(note3_modifier0.getPosition(), Modifier.Position.LEFT);
  equal(note3_modifier1.getCategory(), FretHandFinger.CATEGORY);
  equal(note3_modifier1.getFretHandFinger(), '3');
  equal(note3_modifier1.getPosition(), Modifier.Position.LEFT);
  equal(note3_modifier2.getCategory(), FretHandFinger.CATEGORY);
  equal(note3_modifier2.getFretHandFinger(), '5');
  equal(note3_modifier2.getPosition(), Modifier.Position.LEFT);
}

function keys(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 500, 200);
  const score = f.EasyScore();
  const notes = score.notes(
    'c#3/q, c##3, cb3, cbb3, cn3, c3, cbbs3, cbss3, cbs3, cdb3, cd3, c++-3, c++3, c+-3, c+3, co3, ck3'
  );

  equal(notes[0].keys, 'c#/3');
  equal(notes[1].keys, 'c##/3');
  equal(notes[2].keys, 'cb/3');
  equal(notes[3].keys, 'cbb/3');
  equal(notes[4].keys, 'cn/3');
  for (let i = 5; i < notes.length; i++) {
    equal(notes[i].keys, 'c/3');
  }
}

export { EasyScoreTests };
