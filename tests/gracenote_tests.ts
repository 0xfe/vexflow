// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GraceNote Tests

// TODO: In the 'stem' test (aka Grace Note Stem › SVG + Petaluma in flow.html), the Petaluma note heads are not scaled down properly.

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Accidental } from '../src/accidental';
import { Annotation } from '../src/annotation';
import { Articulation } from '../src/articulation';
import { Beam } from '../src/beam';
import { Dot } from '../src/dot';
import { Factory } from '../src/factory';
import { Formatter } from '../src/formatter';
import { GraceNote, GraceNoteStruct } from '../src/gracenote';
import { StaveNote, StaveNoteStruct } from '../src/stavenote';

const GraceNoteTests = {
  Start(): void {
    QUnit.module('Grace Notes');
    const run = VexFlowTests.runTests;
    run('Grace Note Basic', basic);
    run('With Articulation and Annotation on Parent Note', graceNoteModifiers);
    run('Grace Note Basic with Slurs', basicSlurred);
    run('Grace Note Stem', stem);
    run('Grace Note Stem with Beams 1', stemWithBeamed, {
      keys1: ['g/4'],
      stemDirection1: 1,
      keys2: ['d/5'],
      stemDirection2: -1,
    });
    run('Grace Note Stem with Beams 2', stemWithBeamed, {
      keys1: ['a/3'],
      stemDirection1: 1,
      keys2: ['a/5'],
      stemDirection2: -1,
    });
    run('Grace Note Stem with Beams 3', stemWithBeamed, {
      keys1: ['c/4'],
      stemDirection1: 1,
      keys2: ['c/6'],
      stemDirection2: -1,
    });
    run('Grace Note Slash', slash);
    run('Grace Note Slash with Beams', slashWithBeams);
    run('Grace Notes Multiple Voices', multipleVoices);
    run('Grace Notes Multiple Voices Multiple Draws', multipleVoicesMultipleDraws);
  },
};

function basic(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 130);
  const stave = f.Stave({ x: 10, y: 10, width: 650 });

  const gracenotes = [
    { keys: ['e/4'], duration: '32' },
    { keys: ['f/4'], duration: '32' },
    { keys: ['g/4'], duration: '32' },
    { keys: ['a/4'], duration: '32' },
  ].map(f.GraceNote.bind(f));

  const gracenotes1 = [{ keys: ['b/4'], duration: '8', slash: false }].map(f.GraceNote.bind(f));

  const gracenotes2 = [{ keys: ['b/4'], duration: '8', slash: true }].map(f.GraceNote.bind(f));

  const gracenotes3 = [
    { keys: ['e/4'], duration: '8' },
    { keys: ['f/4'], duration: '16' },
    { keys: ['e/4', 'g/4'], duration: '8' },
    { keys: ['a/4'], duration: '32' },
    { keys: ['b/4'], duration: '32' },
  ].map(f.GraceNote.bind(f));

  const gracenotes4 = [
    { keys: ['g/4'], duration: '8' },
    { keys: ['g/4'], duration: '16' },
    { keys: ['g/4'], duration: '16' },
  ].map(f.GraceNote.bind(f));

  gracenotes[1].addModifier(f.Accidental({ type: '##' }), 0);
  gracenotes3[3].addModifier(f.Accidental({ type: 'bb' }), 0);
  Dot.buildAndAttach([gracenotes4[0]], { all: true });

  const notes = [
    f
      .StaveNote({ keys: ['b/4'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes }).beamNotes(), 0),
    f
      .StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
      .addModifier(f.Accidental({ type: '#' }), 0)
      .addModifier(f.GraceNoteGroup({ notes: gracenotes1 }).beamNotes(), 0),
    f
      .StaveNote({ keys: ['c/5', 'd/5'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes2 }).beamNotes(), 0),
    f
      .StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes3 }).beamNotes(), 0),
    f
      .StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes4 }).beamNotes(), 0),
  ];

  const voice = f.Voice().setStrict(false).addTickables(notes);

  new Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  options.assert.ok(true, 'GraceNoteBasic');
}
function graceNoteModifiers(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 130);
  const stave = f.Stave({ x: 10, y: 10, width: 650 });

  const gracenotes = [{ keys: ['b/4'], duration: '8', slash: false }].map(f.GraceNote.bind(f));

  const notes = [
    f
      .StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes }), 0),
    f
      .StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes }), 0)
      .addModifier(new Articulation('a-').setPosition(3), 0),
    f
      .StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes }), 0)
      .addModifier(new Articulation('a-').setPosition(3), 0)
      .addModifier(new Accidental('#')),
    f
      .StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes }), 0)
      .addModifier(new Articulation('a-').setPosition(3), 0)
      .addModifier(new Annotation('words')),
    f
      .StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes }), 0)
      .addModifier(new Articulation('a-').setPosition(3), 0)
      .addModifier(new Articulation('a>').setPosition(3), 0),
    f
      .StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes }), 0)
      .addModifier(new Articulation('a-').setPosition(3), 0)
      .addModifier(new Articulation('a>').setPosition(3), 0)
      .addModifier(new Articulation('a@a').setPosition(3), 0),
  ];

  const voice = f.Voice().setStrict(false).addTickables(notes);

  new Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  options.assert.ok(true, 'GraceNoteModifiers');
}
function basicSlurred(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 130);
  const stave = f.Stave({ x: 10, y: 10, width: 650 });

  const gracenotes0 = [
    { keys: ['e/4'], duration: '32' },
    { keys: ['f/4'], duration: '32' },
    { keys: ['g/4'], duration: '32' },
    { keys: ['a/4'], duration: '32' },
  ].map(f.GraceNote.bind(f));

  const gracenotes1 = [{ keys: ['b/4'], duration: '8', slash: false }].map(f.GraceNote.bind(f));

  const gracenotes2 = [{ keys: ['b/4'], duration: '8', slash: true }].map(f.GraceNote.bind(f));

  const gracenotes3 = [
    { keys: ['e/4'], duration: '8' },
    { keys: ['f/4'], duration: '16' },
    { keys: ['e/4', 'g/4'], duration: '8' },
    { keys: ['a/4'], duration: '32' },
    { keys: ['b/4'], duration: '32' },
  ].map(f.GraceNote.bind(f));

  const gracenotes4 = [
    { keys: ['a/4'], duration: '8' },
    { keys: ['a/4'], duration: '16' },
    { keys: ['a/4'], duration: '16' },
  ].map(f.GraceNote.bind(f));

  gracenotes0[1].addModifier(f.Accidental({ type: '#' }), 0);
  gracenotes3[3].addModifier(f.Accidental({ type: 'b' }), 0);
  gracenotes3[2].addModifier(f.Accidental({ type: 'n' }), 0);
  Dot.buildAndAttach([gracenotes4[0]], { all: true });

  const notes = [
    f
      .StaveNote({ keys: ['b/4'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes0, slur: true }).beamNotes(), 0),
    f
      .StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
      .addModifier(f.Accidental({ type: '#' }), 0)
      .addModifier(f.GraceNoteGroup({ notes: gracenotes1, slur: true }).beamNotes(), 0),
    f
      .StaveNote({ keys: ['c/5', 'd/5'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes2, slur: true }).beamNotes(), 0),
    f
      .StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes3, slur: true }).beamNotes(), 0),
    f
      .StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true })
      .addModifier(f.GraceNoteGroup({ notes: gracenotes4, slur: true }).beamNotes(), 0),
    f.StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true }),
  ];

  const voice = f.Voice().setStrict(false).addTickables(notes);

  new Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  options.assert.ok(true, 'GraceNoteBasic');
}

/**
 * Helper function for three tests below: stem, stemWithBeamed, slash.
 */
const createNoteForStemTest = (
  duration: string,
  noteBuilder: NoteBuilder,
  keys: string[],
  stem_direction: number,
  slash: boolean = false
): StaveNote => {
  const struct: GraceNoteStruct | StaveNoteStruct = { duration, slash };
  struct.stem_direction = stem_direction;
  struct.keys = keys;
  return noteBuilder(struct);
};

// A NoteBuilder is one of two functions: Factory.StaveNote | Factory.GraceNote.
type NoteBuilder = InstanceType<typeof Factory>['StaveNote'] | InstanceType<typeof Factory>['GraceNote'];

// Used in three tests below.
const durationsForStemTest = ['8', '16', '32', '64', '128'];

function stem(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 130);
  const stave = f.Stave({ x: 10, y: 10, width: 650 });

  function createNotes(noteBuilder: NoteBuilder, keys: string[], stem_direction: number) {
    return durationsForStemTest.map((duration) => createNoteForStemTest(duration, noteBuilder, keys, stem_direction));
  }

  function createNoteBlock(keys: string[], stem_direction: number) {
    const staveNotes = createNotes(f.StaveNote.bind(f), keys, stem_direction);
    const gracenotes = createNotes(f.GraceNote.bind(f), keys, stem_direction);
    // Add a bunch of GraceNotes in front of the first StaveNote.
    staveNotes[0].addModifier(f.GraceNoteGroup({ notes: gracenotes }), 0);
    return staveNotes;
  }

  const voice = f.Voice().setStrict(false);
  voice.addTickables(createNoteBlock(['g/4'], 1));
  voice.addTickables(createNoteBlock(['d/5'], -1));

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  options.assert.ok(true, 'GraceNoteStem');
}

function stemWithBeamed(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 130);
  const stave = f.Stave({ x: 10, y: 10, width: 650 });

  function createBeamedNotes(
    noteBuilder: NoteBuilder,
    keys: string[],
    stem_direction: number,
    beams: Beam[],
    isGrace = false,
    notesToBeam?: StaveNote[][]
  ) {
    const ret: StaveNote[] = [];
    durationsForStemTest.map((duration) => {
      const n0 = createNoteForStemTest(duration, noteBuilder, keys, stem_direction);
      const n1 = createNoteForStemTest(duration, noteBuilder, keys, stem_direction);
      ret.push(n0);
      ret.push(n1);
      if (notesToBeam) {
        notesToBeam.push([n0, n1]);
      }
      if (!isGrace) {
        beams.push(f.Beam({ notes: [n0, n1] }));
      }
    });
    return ret;
  }

  function createBeamedNoteBlock(keys: string[], stem_direction: number, beams: Beam[]) {
    const bnotes = createBeamedNotes(f.StaveNote.bind(f), keys, stem_direction, beams);
    const notesToBeam: StaveNote[][] = [];
    const gracenotes = createBeamedNotes(f.GraceNote.bind(f), keys, stem_direction, beams, true, notesToBeam);
    const graceNoteGroup = f.GraceNoteGroup({ notes: gracenotes });
    notesToBeam.map(graceNoteGroup.beamNotes.bind(graceNoteGroup));
    bnotes[0].addModifier(graceNoteGroup, 0);
    return bnotes;
  }

  const beams: Beam[] = [];
  const voice = f.Voice().setStrict(false);
  voice.addTickables(createBeamedNoteBlock(options.params.keys1, options.params.stemDirection1, beams));
  voice.addTickables(createBeamedNoteBlock(options.params.keys2, options.params.stemDirection2, beams));

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  options.assert.ok(true, 'GraceNoteStem');
}

function slash(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 130);
  const stave = f.Stave({ x: 10, y: 10, width: 650 });

  function createNotes(noteT: typeof f.GraceNote, keys: string[], stem_direction: number, slash: boolean) {
    return durationsForStemTest.map((d) => createNoteForStemTest(d, noteT, keys, stem_direction, slash));
  }

  function createNoteBlock(keys: string[], stem_direction: number) {
    const notes = [f.StaveNote({ keys: ['f/4'], stem_direction, duration: '16' })];
    let graceNotes = createNotes(f.GraceNote.bind(f), keys, stem_direction, true) as GraceNote[];

    const duration = '8';
    const gns = [
      { keys: ['d/4', 'a/4'], stem_direction, duration, slash: true },
      { keys: ['d/4', 'a/4'], stem_direction, duration, slash: true },
      { keys: ['d/4', 'a/4'], stem_direction, duration, slash: true },

      { keys: ['e/4', 'a/4'], stem_direction, duration, slash: true },
      { keys: ['e/4', 'a/4'], stem_direction, duration, slash: true },
      { keys: ['b/4', 'f/5'], stem_direction, duration, slash: true },

      { keys: ['b/4', 'f/5'], stem_direction, duration, slash: true },
      { keys: ['b/4', 'f/5'], stem_direction, duration, slash: true },
      { keys: ['e/4', 'a/4'], stem_direction, duration, slash: true },
    ].map(f.GraceNote.bind(f));

    const notesToBeam = [];
    notesToBeam.push([gns[0], gns[1], gns[2]]);
    notesToBeam.push([gns[3], gns[4], gns[5]]);
    notesToBeam.push([gns[6], gns[7], gns[8]]);

    // Merge the two GraceNote[].
    graceNotes = graceNotes.concat(gns);
    const graceNoteGroup = f.GraceNoteGroup({ notes: graceNotes });
    notesToBeam.forEach((notes) => graceNoteGroup.beamNotes(notes));

    notes[0].addModifier(graceNoteGroup, 0);
    return notes;
  }

  const voice = f.Voice().setStrict(false);
  voice.addTickables(createNoteBlock(['d/4', 'a/4'], 1));
  voice.addTickables(createNoteBlock(['d/4', 'a/4'], -1));

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  options.assert.ok(true, 'GraceNoteSlash');
}

function slashWithBeams(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 800, 130);
  const stave = f.Stave({ x: 10, y: 10, width: 750 });

  function createNoteBlock(keys: string[], stem_direction: number) {
    const notes = [f.StaveNote({ keys: ['f/4'], stem_direction, duration: '16' })];
    let allGraceNotes: GraceNote[] = [];

    const graceNotesToBeam: GraceNote[][] = [];

    ['8', '16', '32', '64'].forEach(function (duration) {
      const graceNotes = [
        { keys: ['d/4', 'a/4'], stem_direction, duration, slash: true },
        { keys: ['d/4', 'a/4'], stem_direction, duration, slash: false },

        { keys: ['e/4', 'a/4'], stem_direction, duration, slash: true },
        { keys: ['b/4', 'f/5'], stem_direction, duration, slash: false },

        { keys: ['b/4', 'f/5'], stem_direction, duration, slash: true },
        { keys: ['e/4', 'a/4'], stem_direction, duration, slash: false },
      ].map(f.GraceNote.bind(f));

      graceNotesToBeam.push([graceNotes[0], graceNotes[1]]);
      graceNotesToBeam.push([graceNotes[2], graceNotes[3]]);
      graceNotesToBeam.push([graceNotes[4], graceNotes[5]]);
      allGraceNotes = allGraceNotes.concat(graceNotes);
    });
    const graceNoteGroup = f.GraceNoteGroup({ notes: allGraceNotes });

    graceNotesToBeam.forEach((g) => graceNoteGroup.beamNotes(g));

    notes[0].addModifier(graceNoteGroup, 0);
    return notes;
  }

  const voice = f.Voice().setStrict(false);
  voice.addTickables(createNoteBlock(['d/4', 'a/4'], 1));
  voice.addTickables(createNoteBlock(['d/4', 'a/4'], -1));

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  options.assert.ok(true, 'GraceNoteSlashWithBeams');
}

function multipleVoices(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 450, 140);
  const stave = f.Stave({ x: 10, y: 10, width: 450 });

  const notes = [
    { keys: ['f/5'], stem_direction: 1, duration: '16' },
    { keys: ['f/5'], stem_direction: 1, duration: '16' },
    { keys: ['d/5'], stem_direction: 1, duration: '16' },
    { keys: ['c/5'], stem_direction: 1, duration: '16' },
    { keys: ['c/5'], stem_direction: 1, duration: '16' },
    { keys: ['d/5'], stem_direction: 1, duration: '16' },
    { keys: ['f/5'], stem_direction: 1, duration: '16' },
    { keys: ['e/5'], stem_direction: 1, duration: '16' },
  ].map(f.StaveNote.bind(f));

  const notes2 = [
    { keys: ['f/4'], stem_direction: -1, duration: '16' },
    { keys: ['e/4'], stem_direction: -1, duration: '16' },
    { keys: ['d/4'], stem_direction: -1, duration: '16' },
    { keys: ['c/4'], stem_direction: -1, duration: '16' },
    { keys: ['c/4'], stem_direction: -1, duration: '16' },
    { keys: ['d/4'], stem_direction: -1, duration: '16' },
    { keys: ['f/4'], stem_direction: -1, duration: '16' },
    { keys: ['e/4'], stem_direction: -1, duration: '16' },
  ].map(f.StaveNote.bind(f));

  const gracenotes1 = [{ keys: ['b/4'], stem_direction: 1, duration: '8', slash: true }].map(f.GraceNote.bind(f));

  const gracenotes2 = [{ keys: ['f/4'], stem_direction: -1, duration: '8', slash: true }].map(f.GraceNote.bind(f));

  const gracenotes3 = [
    { keys: ['f/4'], duration: '32', stem_direction: -1 },
    { keys: ['e/4'], duration: '32', stem_direction: -1 },
  ].map(f.GraceNote.bind(f));

  const gracenotes4 = [
    { keys: ['f/5'], duration: '32', stem_direction: 1 },
    { keys: ['e/5'], duration: '32', stem_direction: 1 },
    { keys: ['e/5'], duration: '8', stem_direction: 1 },
  ].map(f.GraceNote.bind(f));

  gracenotes2[0].setStemDirection(-1);
  gracenotes2[0].addModifier(f.Accidental({ type: '#' }), 0);

  notes[1].addModifier(f.GraceNoteGroup({ notes: gracenotes4 }).beamNotes(), 0);
  notes[3].addModifier(f.GraceNoteGroup({ notes: gracenotes1 }), 0);
  notes2[1].addModifier(f.GraceNoteGroup({ notes: gracenotes2 }).beamNotes(), 0);
  notes2[5].addModifier(f.GraceNoteGroup({ notes: gracenotes3 }).beamNotes(), 0);

  const voice = f.Voice().setStrict(false).addTickables(notes);

  const voice2 = f.Voice().setStrict(false).addTickables(notes2);

  f.Beam({ notes: notes.slice(0, 4) });
  f.Beam({ notes: notes.slice(4, 8) });
  f.Beam({ notes: notes2.slice(0, 4) });
  f.Beam({ notes: notes2.slice(4, 8) });

  f.Formatter().joinVoices([voice, voice2]).formatToStave([voice, voice2], stave);

  f.draw();

  options.assert.ok(true, 'Sixteenth Test');
}

function multipleVoicesMultipleDraws(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 450, 140);
  const stave = f.Stave({ x: 10, y: 10, width: 450 });

  const notes = [
    { keys: ['f/5'], stem_direction: 1, duration: '16' },
    { keys: ['f/5'], stem_direction: 1, duration: '16' },
    { keys: ['d/5'], stem_direction: 1, duration: '16' },
    { keys: ['c/5'], stem_direction: 1, duration: '16' },
    { keys: ['c/5'], stem_direction: 1, duration: '16' },
    { keys: ['d/5'], stem_direction: 1, duration: '16' },
    { keys: ['f/5'], stem_direction: 1, duration: '16' },
    { keys: ['e/5'], stem_direction: 1, duration: '16' },
  ].map(f.StaveNote.bind(f));

  const notes2 = [
    { keys: ['f/4'], stem_direction: -1, duration: '16' },
    { keys: ['e/4'], stem_direction: -1, duration: '16' },
    { keys: ['d/4'], stem_direction: -1, duration: '16' },
    { keys: ['c/4'], stem_direction: -1, duration: '16' },
    { keys: ['c/4'], stem_direction: -1, duration: '16' },
    { keys: ['d/4'], stem_direction: -1, duration: '16' },
    { keys: ['f/4'], stem_direction: -1, duration: '16' },
    { keys: ['e/4'], stem_direction: -1, duration: '16' },
  ].map(f.StaveNote.bind(f));

  const gracenotes1 = [{ keys: ['b/4'], stem_direction: 1, duration: '8', slash: true }].map(f.GraceNote.bind(f));

  const gracenotes2 = [{ keys: ['f/4'], stem_direction: -1, duration: '8', slash: true }].map(f.GraceNote.bind(f));

  const gracenotes3 = [
    { keys: ['f/4'], duration: '32', stem_direction: -1 },
    { keys: ['e/4'], duration: '32', stem_direction: -1 },
  ].map(f.GraceNote.bind(f));

  const gracenotes4 = [
    { keys: ['f/5'], duration: '32', stem_direction: 1 },
    { keys: ['e/5'], duration: '32', stem_direction: 1 },
    { keys: ['e/5'], duration: '8', stem_direction: 1 },
  ].map(f.GraceNote.bind(f));

  gracenotes2[0].setStemDirection(-1);
  gracenotes2[0].addModifier(f.Accidental({ type: '#' }), 0);

  notes[1].addModifier(f.GraceNoteGroup({ notes: gracenotes4 }).beamNotes(), 0);
  notes[3].addModifier(f.GraceNoteGroup({ notes: gracenotes1 }), 0);
  notes2[1].addModifier(f.GraceNoteGroup({ notes: gracenotes2 }).beamNotes(), 0);
  notes2[5].addModifier(f.GraceNoteGroup({ notes: gracenotes3 }).beamNotes(), 0);

  const voice = f.Voice().setStrict(false).addTickables(notes);

  const voice2 = f.Voice().setStrict(false).addTickables(notes2);

  f.Beam({ notes: notes.slice(0, 4) });
  f.Beam({ notes: notes.slice(4, 8) });
  f.Beam({ notes: notes2.slice(0, 4) });
  f.Beam({ notes: notes2.slice(4, 8) });

  f.Formatter().joinVoices([voice, voice2]).formatToStave([voice, voice2], stave);

  f.draw();
  f.draw();

  options.assert.ok(true, 'Seventeenth Test');
}

VexFlowTests.register(GraceNoteTests);
export { GraceNoteTests };
