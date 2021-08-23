// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GraceNote Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { QUnit, ok } from './support/qunit_api';
import { Formatter } from 'formatter';

const stem_test_util = {
  durations: ['8', '16', '32', '64', '128'],

  createNote(d, noteT, keys, stem_direction, slash?) {
    const note_prop: any = {
      duration: d,
    };
    note_prop.stem_direction = stem_direction;
    note_prop.slash = slash;
    note_prop.keys = keys;
    return noteT(note_prop);
  },
};

const GraceNoteTests = {
  Start(): void {
    QUnit.module('Grace Notes');
    VexFlowTests.runTests('Grace Note Basic', GraceNoteTests.basic);
    VexFlowTests.runTests('Grace Note Basic with Slurs', GraceNoteTests.basicSlurred);
    VexFlowTests.runTests('Grace Note Stem', GraceNoteTests.stem);
    VexFlowTests.runTests('Grace Note Stem with Beams', GraceNoteTests.stemWithBeamed);
    VexFlowTests.runTests('Grace Note Slash', GraceNoteTests.slash);
    VexFlowTests.runTests('Grace Note Slash with Beams', GraceNoteTests.slashWithBeams);
    VexFlowTests.runTests('Grace Notes Multiple Voices', GraceNoteTests.multipleVoices);
    VexFlowTests.runTests('Grace Notes Multiple Voices Multiple Draws', GraceNoteTests.multipleVoicesMultipleDraws);
  },

  basic(options: TestOptions): void {
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

    gracenotes[1].addAccidental(0, f.Accidental({ type: '##' }));
    gracenotes3[3].addAccidental(0, f.Accidental({ type: 'bb' }));
    gracenotes4[0].addDotToAll();

    const notes = [
      f
        .StaveNote({ keys: ['b/4'], duration: '4', auto_stem: true })
        .addModifier(f.GraceNoteGroup({ notes: gracenotes }).beamNotes(), 0),
      f
        .StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
        .addAccidental(0, f.Accidental({ type: '#' }))
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

    ok(true, 'GraceNoteBasic');
  },

  basicSlurred(options: TestOptions): void {
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

    gracenotes0[1].addAccidental(0, f.Accidental({ type: '#' }));
    gracenotes3[3].addAccidental(0, f.Accidental({ type: 'b' }));
    gracenotes3[2].addAccidental(0, f.Accidental({ type: 'n' }));
    gracenotes4[0].addDotToAll();

    const notes = [
      f
        .StaveNote({ keys: ['b/4'], duration: '4', auto_stem: true })
        .addModifier(f.GraceNoteGroup({ notes: gracenotes0, slur: true }).beamNotes(), 0),
      f
        .StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
        .addAccidental(0, f.Accidental({ type: '#' }))
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

    ok(true, 'GraceNoteBasic');
  },

  stem(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 700, 130);
    const stave = f.Stave({ x: 10, y: 10, width: 650 });

    function createNotes(noteT, keys, stem_direction) {
      return stem_test_util.durations.map(function (d) {
        return stem_test_util.createNote(d, noteT, keys, stem_direction);
      });
    }

    function createNoteBlock(keys, stem_direction) {
      const notes = createNotes(f.StaveNote.bind(f), keys, stem_direction);
      const gracenotes = createNotes(f.GraceNote.bind(f), keys, stem_direction);
      notes[0].addModifier(f.GraceNoteGroup({ notes: gracenotes }), 0);
      return notes;
    }

    const voice = f.Voice().setStrict(false);
    voice.addTickables(createNoteBlock(['g/4'], 1));
    voice.addTickables(createNoteBlock(['d/5'], -1));

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    ok(true, 'GraceNoteStem');
  },

  stemWithBeamed(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 700, 130);
    const stave = f.Stave({ x: 10, y: 10, width: 650 });

    function createBeamedNotes(noteT, keys, stem_direction, beams, isGrace = false, notesToBeam?: any[]) {
      const ret = [];
      stem_test_util.durations.map(function (d) {
        const n0 = stem_test_util.createNote(d, noteT, keys, stem_direction);
        const n1 = stem_test_util.createNote(d, noteT, keys, stem_direction);
        ret.push(n0);
        ret.push(n1);
        if (notesToBeam) {
          notesToBeam.push([n0, n1]);
        }
        if (!isGrace) {
          const tbeam = f.Beam({ notes: [n0, n1] });
          beams.push(tbeam);
        }
        return ret;
      });
      return ret;
    }

    function createBeamedNoteBlock(keys, stem_direction, beams) {
      const bnotes = createBeamedNotes(f.StaveNote.bind(f), keys, stem_direction, beams);
      const notesToBeam = [];
      const gracenotes = createBeamedNotes(f.GraceNote.bind(f), keys, stem_direction, beams, true, notesToBeam);
      const graceNoteGroup = f.GraceNoteGroup({ notes: gracenotes });
      notesToBeam.map(graceNoteGroup.beamNotes.bind(graceNoteGroup));
      bnotes[0].addModifier(graceNoteGroup, 0);
      return bnotes;
    }

    const beams = [];
    const voice = f.Voice().setStrict(false);
    voice.addTickables(createBeamedNoteBlock(['g/4'], 1, beams));
    voice.addTickables(createBeamedNoteBlock(['d/5'], -1, beams));

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    ok(true, 'GraceNoteStem');
  },

  slash(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 700, 130);
    const stave = f.Stave({ x: 10, y: 10, width: 650 });

    function createNotes(noteT, keys, stem_direction, slash) {
      return stem_test_util.durations.map(function (d) {
        return stem_test_util.createNote(d, noteT, keys, stem_direction, slash);
      });
    }

    function createNoteBlock(keys, stem_direction) {
      const notes = [f.StaveNote({ keys: ['f/4'], stem_direction: stem_direction, duration: '16' })];
      let gracenotes = createNotes(f.GraceNote.bind(f), keys, stem_direction, true);

      const gnotesToBeam = [];
      const duration = '8';
      const gns = [
        { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
        { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
        { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },

        { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
        { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
        { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: true },

        { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: true },
        { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: true },
        { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
      ].map(f.GraceNote.bind(f));

      gnotesToBeam.push([gns[0], gns[1], gns[2]]);
      gnotesToBeam.push([gns[3], gns[4], gns[5]]);
      gnotesToBeam.push([gns[6], gns[7], gns[8]]);

      gracenotes = gracenotes.concat(gns);
      const gracenoteGroup = f.GraceNoteGroup({ notes: gracenotes });
      gnotesToBeam.forEach(function (gnotes) {
        gracenoteGroup.beamNotes(gnotes);
      });

      notes[0].addModifier(gracenoteGroup, 0);
      return notes;
    }

    const voice = f.Voice().setStrict(false);
    voice.addTickables(createNoteBlock(['d/4', 'a/4'], 1));
    voice.addTickables(createNoteBlock(['d/4', 'a/4'], -1));

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    ok(true, 'GraceNoteSlash');
  },

  slashWithBeams(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 800, 130);
    const stave = f.Stave({ x: 10, y: 10, width: 750 });

    function createNoteBlock(keys, stem_direction) {
      const notes = [f.StaveNote({ keys: ['f/4'], stem_direction: stem_direction, duration: '16' })];
      let gracenotes = [];

      const gnotesToBeam = [];

      ['8', '16', '32', '64'].forEach(function (duration) {
        const gns = [
          { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: false },

          { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: false },

          { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: false },
        ].map(f.GraceNote.bind(f));

        gnotesToBeam.push([gns[0], gns[1]]);
        gnotesToBeam.push([gns[2], gns[3]]);
        gnotesToBeam.push([gns[4], gns[5]]);
        gracenotes = gracenotes.concat(gns);
      });
      const gracenoteGroup = f.GraceNoteGroup({ notes: gracenotes });

      gnotesToBeam.forEach(function (gnotes) {
        gracenoteGroup.beamNotes(gnotes);
      });

      notes[0].addModifier(gracenoteGroup, 0);
      return notes;
    }

    const voice = f.Voice().setStrict(false);
    voice.addTickables(createNoteBlock(['d/4', 'a/4'], 1));
    voice.addTickables(createNoteBlock(['d/4', 'a/4'], -1));

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    ok(true, 'GraceNoteSlashWithBeams');
  },

  multipleVoices(options: TestOptions): void {
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
    gracenotes2[0].addAccidental(0, f.Accidental({ type: '#' }));

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

    ok(true, 'Sixteenth Test');
  },

  multipleVoicesMultipleDraws(options: TestOptions): void {
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
    gracenotes2[0].addAccidental(0, f.Accidental({ type: '#' }));

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

    ok(true, 'Seventeenth Test');
  },
};

export { GraceNoteTests };
