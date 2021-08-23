// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Formatter Tests

/* eslint-disable */
// @ts-nocheck

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';
import { QUnit, ok, equal, test, propEqual, notEqual } from './support/qunit_api';
import { Flow } from 'flow';
import { MockTickable } from './mocks';
import { Formatter } from 'formatter';
import { Voice } from 'voice';
import { Registry } from 'registry';
import { StaveNote } from 'stavenote';
import { Stave } from 'stave';
import { Beam } from 'beam';
import { StaveConnector } from 'staveconnector';
import { Note } from 'note';
import { Bend } from 'bend';
import { Annotation } from 'annotation';

// Should this be a static call in glyph? Or font?
function glyphWidth(vexGlyph: string): number {
  const vf = Flow.DEFAULT_FONT_STACK[0].getGlyphs()[vexGlyph];
  return (vf.x_max - vf.x_min) * glyphPixels();
}

function glyphPixels(): number {
  return 96 * (38 / (Flow.DEFAULT_FONT_STACK[0].getResolution() * 72));
}

const FormatterTests = {
  Start(): void {
    QUnit.module('Formatter');
    test('VF.* API', this.VF_Prefix);
    test('TickContext Building', this.buildTickContexts);

    const runTests = VexFlowTests.runTests;
    const runSVG = VexFlowTests.runSVGTest;
    // TODO: Why do we just do VexFlowTests.runSVGTest? Why not use VexFlowTests.runTests like in all other tests? It would be more consistent.
    runSVG('Notehead padding', this.noteHeadPadding);
    runSVG('Justification and alignment with accidentals', this.accidentalJustification);
    runSVG('Long measure taking full space', this.longMeasureProblems);
    runSVG('Vertical alignment - few unaligned beats', this.unalignedNoteDurations);
    runSVG('Vertical alignment - many unaligned beats', this.unalignedNoteDurations2, { globalSoftmax: false });
    runSVG('Vertical alignment - many unaligned beats (global softmax)', this.unalignedNoteDurations2, {
      globalSoftmax: true,
    });
    runSVG('StaveNote - Justification', this.justifyStaveNotes);
    runSVG('Notes with Tab', this.notesWithTab);
    runSVG('Multiple Staves - Justified', this.multiStaves, { debug: true });
    runSVG('Softmax', this.softMax);
    runSVG('Mixtime', this.mixTime);
    runSVG('Tight', this.tightNotes);
    runSVG('Tight 2', this.tightNotes2);
    runSVG('Annotations', this.annotations);
    runSVG('Proportional Formatting - No Justification', this.proportionalFormatting, {
      justify: false,
      debug: true,
      iterations: 0,
    });
    runTests('Proportional Formatting - No Tuning', this.proportionalFormatting, {
      debug: true,
      iterations: 0,
    });
    runSVG('Proportional Formatting (20 iterations)', this.proportionalFormatting, {
      debug: true,
      iterations: 20,
      alpha: 0.5,
    });
  },

  VF_Prefix(): void {
    equal(Voice, VF.Voice);
    equal(Registry, VF.Registry);
    propEqual(new Formatter(), new VF.Formatter(), 'new Formatter()');
    equal(StaveNote, VF.StaveNote);
    notEqual(Stave, VF.StaveNote);
    equal(Stave, VF.Stave);
    equal(Beam, VF.Beam);
    equal(Note, VF.Note);
    equal(Bend, VF.Bend);
    equal(Annotation, VF.Annotation);
    equal(StaveConnector, VF.StaveConnector);
  },

  buildTickContexts(): void {
    function createTickable() {
      return new MockTickable();
    }

    const R = Flow.RESOLUTION;
    const BEAT = (1 * R) / 4;

    const tickables1 = [
      createTickable().setTicks(BEAT).setWidth(10),
      createTickable()
        .setTicks(BEAT * 2)
        .setWidth(20),
      createTickable().setTicks(BEAT).setWidth(30),
    ];

    const tickables2 = [
      createTickable()
        .setTicks(BEAT * 2)
        .setWidth(10),
      createTickable().setTicks(BEAT).setWidth(20),
      createTickable().setTicks(BEAT).setWidth(30),
    ];

    const voice1 = new Voice(Flow.TIME4_4);
    const voice2 = new Voice(Flow.TIME4_4);

    voice1.addTickables(tickables1);
    voice2.addTickables(tickables2);

    const formatter = new Formatter();
    const tContexts = formatter.createTickContexts([voice1, voice2]);

    equal(tContexts.list.length, 4, 'Voices should have four tick contexts');

    // TODO: add this after pull request #68 is merged to master
    // throws(
    //   function() { formatter.getMinTotalWidth(); },
    //   RuntimeError,
    //   "Expected to throw exception"
    // );

    ok(formatter.preCalculateMinTotalWidth([voice1, voice2]), 'Successfully runs preCalculateMinTotalWidth');
    equal(formatter.getMinTotalWidth(), 88, 'Get minimum total width without passing voices');

    formatter.preFormat();

    equal(formatter.getMinTotalWidth(), 88, 'Minimum total width');
    equal(tickables1[0].getX(), tickables2[0].getX(), 'First notes of both voices have the same X');
    equal(tickables1[2].getX(), tickables2[2].getX(), 'Last notes of both voices have the same X');
    ok(
      tickables1[1].getX() < tickables2[1].getX(),
      'Second note of voice 2 is to the right of the second note of voice 1'
    );
  },
  noteHeadPadding(options): void {
    var registry = new VF.Registry();
    VF.Registry.enableDefaultRegistry(registry);
    var vf = VF.Test.makeFactory(options, 600, 300);
    var score = vf.EasyScore();
    score.set({
      time: '9/8',
    });
    const notes1 = score.notes('(d5 f5)/8,(c5 e5)/8,(d5 f5)/8,(c5 e5)/2.');
    const beams = [];
    beams.push(new VF.Beam(notes1.slice(0, 3), true));
    const voice1 = new VF.Voice().setMode(VF.Voice.Mode.Soft);
    const notes2 = score.notes('(g4 an4)/2.,(g4 a4)/4.', {
      clef: 'treble',
    });
    const voice2 = new VF.Voice().setMode(VF.Voice.Mode.Soft);
    voice2.addTickables(notes2);
    voice1.addTickables(notes1);
    var formatter = vf.Formatter().joinVoices([voice1]).joinVoices([voice2]);
    const width = formatter.preCalculateMinTotalWidth([voice1, voice2]);
    formatter.format([voice1, voice2], width);
    const stave1 = vf.Stave({
      y: 50,
      width: width + VF.Stave.defaultPadding,
    });
    const stave2 = vf.Stave({
      y: 150,
      width: width + VF.Stave.defaultPadding,
    });
    stave1.draw();
    stave2.draw();
    voice1.draw(vf.context, stave1);
    voice2.draw(vf.context, stave2);
    beams.forEach((b) => {
      b.setContext(vf.getContext()).draw();
    });
    ok(true);
  },
  longMeasureProblems(options: TestOptions): void {
    const registry = new Registry();
    Registry.enableDefaultRegistry(registry);
    const f = VexFlowTests.makeFactory(options, 1500, 300);
    const score = f.EasyScore();
    score.set({
      time: '4/4',
    });
    const notes1 = score.notes(
      'b4/4,b4/8,b4/8,b4/4,b4/4,b4/2,b4/2,b4/4,b4/8,b4/8,b4/4,b4/4,b4/2,b4/2,b4/4,b4/8,b4/8,b4/4,b4/4,b4/2,b4/2,b4/4,b4/2,b4/8,b4/8'
    );
    const voice1 = new Voice().setMode(Voice.Mode.SOFT);
    const notes2 = score.notes(
      'd3/4,(ab3 f4)/2,d3/4,ab3/4,d3/2,ab3/4,d3/4,ab3/2,d3/4,ab3/4,d3/2,ab3/4,d3/4,ab3/2,d3/4,ab3/4,d3/2,ab3/4,d4/4,d4/2,d4/4',
      {
        clef: 'bass',
      }
    );
    const voice2 = new Voice().setMode(Voice.Mode.SOFT);
    voice2.addTickables(notes2);
    voice1.addTickables(notes1);
    const formatter = f.Formatter().joinVoices([voice1]).joinVoices([voice2]);
    const width = formatter.preCalculateMinTotalWidth([voice1, voice2]);
    formatter.format([voice1, voice2], width);
    const stave1 = f.Stave({
      y: 50,
      width: width + Stave.defaultPadding,
    });
    const stave2 = f.Stave({
      y: 200,
      width: width + Stave.defaultPadding,
    });
    stave1.draw();
    stave2.draw();
    voice1.draw(f.context, stave1);
    voice2.draw(f.context, stave2);
    ok(true);
  },

  accidentalJustification(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 600, 300);
    const score = f.EasyScore();

    const notes11 = score.notes('a4/2, a4/4, a4/8, ab4/16, an4/16');
    const voice11 = score.voice(notes11, { time: '4/4' });

    const notes21 = score.notes('c4/2, d4/8, d4/8, e4/8, e4/8');
    const voice21 = score.voice(notes21, { time: '4/4' });

    let beams = Beam.generateBeams(notes11.slice(2));
    beams = beams.concat(beams, Beam.generateBeams(notes21.slice(1, 3)));
    beams = beams.concat(Beam.generateBeams(notes21.slice(3)));
    const formatter = f.Formatter({ softmaxFactor: 100 }).joinVoices([voice11]).joinVoices([voice21]);

    const width = formatter.preCalculateMinTotalWidth([voice11, voice21]);
    const stave11 = f.Stave({ y: 20, width: width + Stave.defaultPadding });
    const stave21 = f.Stave({ y: 130, width: width + Stave.defaultPadding });
    formatter.format([voice11, voice21], width);
    const ctx = f.getContext();
    stave11.setContext(ctx).draw();
    stave21.setContext(ctx).draw();
    voice11.draw(ctx, stave11);
    voice21.draw(ctx, stave21);
    beams.forEach((b) => {
      b.setContext(ctx).draw();
    });
    ok(true);
  },

  unalignedNoteDurations(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 600, 250);
    const score = f.EasyScore();

    const notes11 = [
      new StaveNote({ keys: ['a/4'], duration: '8' }),
      new StaveNote({ keys: ['b/4'], duration: '4' }),
      new StaveNote({ keys: ['b/4'], duration: '8' }),
    ];
    const notes21 = [
      new StaveNote({ keys: ['a/4'], duration: '16' }),
      new StaveNote({ keys: ['b/4.'], duration: '4' }),
      new StaveNote({ keys: ['a/4'], duration: '8d' }).addDotToAll(),
    ];

    const ctx = f.getContext();
    const voice11 = score.voice(notes11, { time: '2/4' }).setMode(Voice.Mode.SOFT);
    const voice21 = score.voice(notes21, { time: '2/4' }).setMode(Voice.Mode.SOFT);
    const beams21 = Beam.generateBeams(notes21);
    const beams11 = Beam.generateBeams(notes11);
    const formatter = new Formatter();
    formatter.joinVoices([voice11]);
    formatter.joinVoices([voice21]);

    const width = formatter.preCalculateMinTotalWidth([voice11, voice21]);
    const stave11 = f.Stave({ y: 20, width: width + Stave.defaultPadding });
    const stave21 = f.Stave({ y: 130, width: width + Stave.defaultPadding });
    formatter.format([voice11, voice21], width);
    stave11.setContext(ctx).draw();
    stave21.setContext(ctx).draw();
    voice11.draw(ctx, stave11);
    voice21.draw(ctx, stave21);

    beams21.forEach((b) => {
      b.setContext(ctx).draw();
    });
    beams11.forEach((b) => {
      b.setContext(ctx).draw();
    });

    ok(voice11.tickables[1].getX() > voice21.tickables[1].getX());
  },

  unalignedNoteDurations2(options: TestOptions): void {
    const notes1 = [
      new StaveNote({ keys: ['b/4'], duration: '8r' }),
      new StaveNote({ keys: ['g/4'], duration: '16' }),
      new StaveNote({ keys: ['c/5'], duration: '16' }),
      new StaveNote({ keys: ['e/5'], duration: '16' }),
      new StaveNote({ keys: ['g/4'], duration: '16' }),
      new StaveNote({ keys: ['c/5'], duration: '16' }),
      new StaveNote({ keys: ['e/5'], duration: '16' }),
      new StaveNote({ keys: ['b/4'], duration: '8r' }),
      new StaveNote({ keys: ['g/4'], duration: '16' }),
      new StaveNote({ keys: ['c/5'], duration: '16' }),
      new StaveNote({ keys: ['e/5'], duration: '16' }),
      new StaveNote({ keys: ['g/4'], duration: '16' }),
      new StaveNote({ keys: ['c/5'], duration: '16' }),
      new StaveNote({ keys: ['e/5'], duration: '16' }),
    ];

    const notes2 = [
      new StaveNote({ keys: ['a/4'], duration: '16r' }),
      new StaveNote({ keys: ['e/4.'], duration: '8d' }),
      new StaveNote({ keys: ['e/4'], duration: '4' }),
      new StaveNote({ keys: ['a/4'], duration: '16r' }),
      new StaveNote({ keys: ['e/4.'], duration: '8d' }),
      new StaveNote({ keys: ['e/4'], duration: '4' }),
    ];

    const f = VexFlowTests.makeFactory(options, 750, 280);
    const context = f.getContext();
    const voice1 = new Voice({ num_beats: 4, beat_value: 4 });
    voice1.addTickables(notes1);
    const voice2 = new Voice({ num_beats: 4, beat_value: 4 });
    voice2.addTickables(notes2);

    const formatter = new Formatter({ softmaxFactor: 100, globalSoftmax: options.params.globalSoftmax });
    formatter.joinVoices([voice1]);
    formatter.joinVoices([voice2]);
    const width = formatter.preCalculateMinTotalWidth([voice1, voice2]);

    formatter.format([voice1, voice2], width);
    const stave1 = new Stave(10, 40, width + Stave.defaultPadding);
    const stave2 = new Stave(10, 100, width + Stave.defaultPadding);
    stave1.setContext(context).draw();
    stave2.setContext(context).draw();
    voice1.draw(context, stave1);
    voice2.draw(context, stave2);

    ok(voice1.tickables[1].getX() > voice2.tickables[1].getX());
  },

  justifyStaveNotes: (options) => {
    const f = VexFlowTests.makeFactory(options, 520, 280);
    const ctx = f.getContext();
    const score = f.EasyScore();

    let y = 30;
    function justifyToWidth(width) {
      f.Stave({ y: y }).addTrebleGlyph();

      const voices = [
        score.voice(score.notes('(cbb4 en4 a4)/2, (d4 e4 f4)/8, (d4 f4 a4)/8, (cn4 f#4 a4)/4', { stem: 'down' })),
        score.voice(score.notes('(bb4 e#5 a5)/4, (d5 e5 f5)/2, (c##5 fb5 a5)/4', { stem: 'up' })),
      ];

      f.Formatter().joinVoices(voices).format(voices, width);

      voices[0].getTickables().forEach((note) => {
        VexFlowTests.plotNoteWidth(ctx, note, y + 140);
      });

      voices[1].getTickables().forEach((note) => {
        VexFlowTests.plotNoteWidth(ctx, note, y - 20);
      });
      y += 210;
    }

    justifyToWidth(520);

    f.draw();

    ok(true);
  },

  notesWithTab: (options) => {
    const f = VexFlowTests.makeFactory(options, 420, 580);
    const score = f.EasyScore();

    let y = 10;
    function justifyToWidth(width) {
      const stave = f.Stave({ y: y }).addTrebleGlyph();

      const voice = score.voice(score.notes('d#4/2, (c4 d4)/8, d4/8, (c#4 e4 a4)/4', { stem: 'up' }));

      y += 100;

      f.TabStave({ y: y }).addTabGlyph().setNoteStartX(stave.getNoteStartX());

      const tabVoice = score.voice([
        f.TabNote({ positions: [{ str: 3, fret: 6 }], duration: '2' }).addModifier(new Bend('Full'), 0),
        f
          .TabNote({
            positions: [
              { str: 2, fret: 3 },
              { str: 3, fret: 5 },
            ],
            duration: '8',
          })
          .addModifier(new Bend('Unison'), 1),
        f.TabNote({ positions: [{ str: 3, fret: 7 }], duration: '8' }),
        f.TabNote({
          positions: [
            { str: 3, fret: 6 },
            { str: 4, fret: 7 },
            { str: 2, fret: 5 },
          ],
          duration: '4',
        }),
      ]);

      f.Formatter().joinVoices([voice]).joinVoices([tabVoice]).format([voice, tabVoice], width);

      y += 150;
    }

    justifyToWidth(0);
    justifyToWidth(300);

    f.draw();

    ok(true);
  },

  multiStaves: (options) => {
    const f = VexFlowTests.makeFactory(options, 600, 400);
    const ctx = f.getContext();
    const score = f.EasyScore();
    let staves = [];
    let beams = [];
    let voices = [];

    const notes11 = score.notes('f4/4, d4/8, g4/4, eb4/8');
    voices.push(score.voice(notes11, { time: '6/8' }));

    const notes21 = score.notes('d4/8, d4, d4, d4, e4, eb4');
    voices.push(score.voice(notes21, { time: '6/8' }));

    const notes31 = score.notes('a5/8, a5, a5, a5, a5, a5', { stem: 'down' });
    voices.push(score.voice(notes31, { time: '6/8' }));

    let formatter = f.Formatter();
    voices.forEach((vv) => formatter.joinVoices([vv]));
    let width = formatter.preCalculateMinTotalWidth(voices);
    let staveWidth = width + glyphWidth('gClef') + glyphWidth('timeSig8') + Stave.defaultPadding;

    staves.push(f.Stave({ y: 20, width: staveWidth }).addTrebleGlyph().addTimeSignature('6/8'));
    staves.push(f.Stave({ y: 130, width: staveWidth }).addTrebleGlyph().addTimeSignature('6/8'));
    staves.push(f.Stave({ y: 250, width: staveWidth }).addClef('bass').addTimeSignature('6/8'));
    formatter.format(voices, width);
    beams.push(new Beam(notes21.slice(0, 3), true));
    beams.push(new Beam(notes21.slice(3, 6), true));
    beams.push(new Beam(notes31.slice(0, 3), true));
    beams.push(new Beam(notes31.slice(3, 6), true));

    f.StaveConnector({
      top_stave: staves[1],
      bottom_stave: staves[2],
      type: 'brace',
    });
    for (var i = 0; i < staves.length; ++i) {
      staves[i].setContext(ctx).draw();
      voices[i].draw(ctx, staves[i]);
    }
    beams.forEach((beam) => beam.setContext(ctx).draw());

    const x = staves[0].x + staves[0].width;
    const ys = staves.map((ss) => ss.y);
    voices = [];
    staves = [];
    const notes12 = score.notes('ab4/4, bb4/8, (cb5 eb5)/4[stem="down"], d5/8[stem="down"]');
    voices.push(score.voice(notes12, { time: '6/8' }));
    const notes22 = score.notes('(eb4 ab4)/4., (c4 eb4 ab4)/4, db5/8', { stem: 'up' });
    voices.push(score.voice(notes22, { time: '6/8' }));
    const notes32 = score.notes('a5/8, a5, a5, a5, a5, a5', { stem: 'down' });
    voices.push(score.voice(notes32, { time: '6/8' }));

    formatter = f.Formatter();
    voices.forEach((vv) => formatter.joinVoices([vv]));
    width = formatter.preCalculateMinTotalWidth(voices);
    staveWidth = width + Stave.defaultPadding;
    staves.push(
      f.Stave({
        x,
        y: ys[0],
        width: staveWidth,
      })
    );
    staves.push(
      f.Stave({
        x,
        y: ys[1],
        width: staveWidth,
      })
    );
    staves.push(
      f.Stave({
        x,
        y: ys[2],
        width: staveWidth,
      })
    );
    formatter.format(voices, width);
    beams = [];
    beams.push(new Beam(notes32.slice(0, 3), true));
    beams.push(new Beam(notes32.slice(3, 6), true));
    for (i = 0; i < staves.length; ++i) {
      staves[i].setContext(ctx).draw();
      voices[i].draw(ctx, staves[i]);
      voices[i].getTickables().forEach((note) => Note.plotMetrics(ctx, note, ys[i] - 20));
    }
    beams.forEach((beam) => beam.setContext(ctx).draw());
    ok(true);
  },

  proportionalFormatting(options) {
    const debug = options.params.debug;
    Registry.enableDefaultRegistry(new Registry());

    const f = VexFlowTests.makeFactory(options, 650, 750);
    const system = f.System({
      x: 50,
      autoWidth: true,
      debugFormatter: debug,
      noJustification: !(options.params.justify === undefined && true),
      formatIterations: options.params.iterations,
      options: { alpha: options.params.alpha },
    });

    const score = f.EasyScore();

    const newVoice = function (notes) {
      return score.voice(notes, { time: '1/4' });
    };

    const newStave = function (voice) {
      return system
        .addStave({ voices: [voice], debugNoteMetrics: debug })
        .addClef('treble')
        .addTimeSignature('1/4');
    };

    const voices = [
      score.notes('c5/8, c5'),
      score.tuplet(score.notes('a4/8, a4, a4'), { notes_occupied: 2 }),
      score.notes('c5/16, c5, c5, c5'),
      score.tuplet(score.notes('a4/16, a4, a4, a4, a4'), { notes_occupied: 4 }),
      score.tuplet(score.notes('a4/32, a4, a4, a4, a4, a4, a4'), { notes_occupied: 8 }),
    ];

    voices.map(newVoice).forEach(newStave);
    system.addConnector().setType(StaveConnector.type.BRACKET);

    f.draw();

    // var typeMap = VF.Registry.getDefaultRegistry().index.type;
    // var table = Object.keys(typeMap).map(function(typeName) {
    //   return typeName + ': ' + Object.keys(typeMap[typeName]).length;
    // });
    // console.log(table);

    Registry.disableDefaultRegistry();
    ok(true);
  },

  softMax(options): void {
    const f = VexFlowTests.makeFactory(options, 550, 500);
    f.getContext().scale(0.8, 0.8);

    function draw(y, factor) {
      const score = f.EasyScore();
      const system = f.System({
        x: 100,
        y,
        details: { softmaxFactor: factor },
        autoWidth: true,
      });

      system
        .addStave({
          voices: [
            score.voice(
              score
                .notes('C#5/h, a4/q')
                .concat(score.beam(score.notes('Abb4/8, A4/8')))
                .concat(score.beam(score.notes('A4/16, A#4, A4, Ab4/32, A4'))),
              { time: '5/4' }
            ),
          ],
        })
        .addClef('treble')
        .addTimeSignature('5/4');

      f.draw();
      ok(true);
    }

    draw(50, 1);
    draw(150, 2);
    draw(250, 10);
    draw(350, 20);
    draw(450, 200);
  },

  mixTime(options) {
    const f = VexFlowTests.makeFactory(options, 400 + Stave.defaultPadding, 250);
    f.getContext().scale(0.8, 0.8);
    const score = f.EasyScore();
    const system = f.System({
      details: { softmaxFactor: 100 },
      autoWidth: true,
      debugFormatter: true,
    });

    system
      .addStave({
        voices: [score.voice(score.notes('C#5/q, B4').concat(score.beam(score.notes('A4/8, E4, C4, D4'))))],
      })
      .addClef('treble')
      .addTimeSignature('4/4');

    system
      .addStave({
        voices: [
          score.voice(score.notes('C#5/q, B4, B4').concat(score.tuplet(score.beam(score.notes('A4/8, E4, C4'))))),
        ],
      })
      .addClef('treble')
      .addTimeSignature('4/4');

    f.draw();
    ok(true);
  },

  tightNotes(options) {
    const f = VexFlowTests.makeFactory(options, 440, 250);
    f.getContext().scale(0.8, 0.8);
    const score = f.EasyScore();
    const system = f.System({
      autoWidth: true,
      debugFormatter: true,
      details: { maxIterations: 10 },
    });

    system
      .addStave({
        voices: [
          score.voice(score.beam(score.notes('B4/16, B4, B4, B4, B4, B4, B4, B4')).concat(score.notes('B4/q, B4'))),
        ],
      })
      .addClef('treble')
      .addTimeSignature('4/4');

    system
      .addStave({
        voices: [
          score.voice(score.notes('B4/q, B4').concat(score.beam(score.notes('B4/16, B4, B4, B4, B4, B4, B4, B4')))),
        ],
      })
      .addClef('treble')
      .addTimeSignature('4/4');

    f.draw();
    ok(true);
  },

  tightNotes2(options) {
    const f = VexFlowTests.makeFactory(options, 440, 250);
    f.getContext().scale(0.8, 0.8);
    const score = f.EasyScore();
    const system = f.System({
      autoWidth: true,
      debugFormatter: true,
    });

    system
      .addStave({
        voices: [
          score.voice(score.beam(score.notes('B4/16, B4, B4, B4, B4, B4, B4, B4')).concat(score.notes('B4/q, B4'))),
        ],
      })
      .addClef('treble')
      .addTimeSignature('4/4');

    system
      .addStave({
        voices: [score.voice(score.notes('B4/w'))],
      })
      .addClef('treble')
      .addTimeSignature('4/4');

    f.draw();
    ok(true);
  },

  annotations(options) {
    const pageWidth = 916;
    const pageHeight = 600;
    const f = VexFlowTests.makeFactory(options, pageWidth, pageHeight);
    const context = f.getContext();

    const lyrics1 = ['ipso', 'ipso-', 'ipso', 'ipso', 'ipsoz', 'ipso-', 'ipso', 'ipso', 'ipso', 'ip', 'ipso'];
    const lyrics2 = ['ipso', 'ipso-', 'ipsoz', 'ipso', 'ipso', 'ipso-', 'ipso', 'ipso', 'ipso', 'ip', 'ipso'];

    const smar = [
      {
        sm: 5,
        width: 550,
        lyrics: lyrics1,
        title: '550px,softMax:5',
      },
      {
        sm: 10,
        width: 550,
        lyrics: lyrics2,
        title: '550px,softmax:10,different word order',
      },
      {
        sm: 5,
        width: 550,
        lyrics: lyrics2,
        title: '550px,softmax:5',
      },
      {
        sm: 100,
        width: 550,
        lyrics: lyrics2,
        title: '550px,softmax:100',
      },
    ];

    const rowSize = 140;
    const beats = 12;
    const beatsPer = 8;
    const beamGroup = 3;

    const durations = ['8d', '16', '8', '8d', '16', '8', '8d', '16', '8', '4', '8'];
    const beams = [];
    let y = 40;

    smar.forEach((sm) => {
      const stave = new Stave(10, y, sm.width);
      const notes = [];
      let iii = 0;
      context.fillText(sm.title, 100, y);
      y += rowSize;

      durations.forEach((dd) => {
        const newNote = new StaveNote({ keys: ['b/4'], duration: dd });
        if (dd.indexOf('d') >= 0) {
          newNote.addDotToAll();
        }
        if (sm.lyrics.length > iii) {
          newNote.addAnnotation(
            0,
            new Annotation(sm.lyrics[iii])
              .setVerticalJustification(Annotation.VerticalJustify.BOTTOM)
              .setFont('Times', 12, 'normal')
          );
        }
        notes.push(newNote);
        iii += 1;
      });

      notes.forEach((note) => {
        if (note.duration.indexOf('d') >= 0) {
          note.addDotToAll();
        }
      });

      // Don't beam the last group
      let beam = [];
      notes.forEach((note) => {
        if (note.intrinsicTicks < 4096) {
          beam.push(note);
          if (beam.length >= beamGroup) {
            beams.push(new Beam(beam));
            beam = [];
          }
        } else {
          beam = [];
        }
      });

      const voice1 = new Voice({ num_beats: beats, beat_value: beatsPer })
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes);

      const fmt = new Formatter({ softmaxFactor: sm.sm, maxIterations: 2 }).joinVoices([voice1]);
      fmt.format([voice1], sm.width - 11);

      stave.setContext(context).draw();
      voice1.draw(context, stave);

      beams.forEach(function (b) {
        b.setContext(context).draw();
      });
    });

    ok(true);
  },
};

export { FormatterTests };
