/**
 * VexFlow - GraceNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.GraceNote = (function() {
  var stem_test_util = {
    durations: ['8', '16', '32', '64', '128'],
    createNote: function(d, noteT, keys, stem_direction, slash) {
      var note_prop = {
        duration: d,
      };
      note_prop.stem_direction = stem_direction;
      note_prop.slash = slash;
      note_prop.keys = keys;
      return noteT(note_prop);
    },
  };

  var GraceNote = {
    Start: function() {
      QUnit.module('Grace Notes');
      VF.Test.runTests('Grace Note Basic', VF.Test.GraceNote.basic);
      VF.Test.runTests('Grace Note Basic with Slurs', VF.Test.GraceNote.basicSlurred);
      VF.Test.runTests('Grace Note Stem', VF.Test.GraceNote.stem);
      VF.Test.runTests('Grace Note Stem with Beams', VF.Test.GraceNote.stemWithBeamed);
      VF.Test.runTests('Grace Note Slash', VF.Test.GraceNote.slash);
      VF.Test.runTests('Grace Note Slash with Beams', VF.Test.GraceNote.slashWithBeams);
      VF.Test.runTests('Grace Notes Multiple Voices', VF.Test.GraceNote.multipleVoices);
      VF.Test.runTests('Grace Notes Multiple Voices Multiple Draws', VF.Test.GraceNote.multipleVoicesMultipleDraws);
    },

    basic: function(options) {
      const vf = VF.Test.makeFactory(options, 700, 130);
      const stave = vf.Stave({ x: 10, y: 10, width: 650 });

      var gracenotes = [
        { keys: ['e/4'], duration: '32' },
        { keys: ['f/4'], duration: '32' },
        { keys: ['g/4'], duration: '32' },
        { keys: ['a/4'], duration: '32' },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes1 = [
        { keys: ['b/4'], duration: '8', slash: false },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes2 = [
        { keys: ['b/4'], duration: '8', slash: true },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes3 = [
        { keys: ['e/4'], duration: '8' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['e/4', 'g/4'], duration: '8' },
        { keys: ['a/4'], duration: '32' },
        { keys: ['b/4'], duration: '32' },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes4 = [
        { keys: ['g/4'], duration: '8' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
      ].map(vf.GraceNote.bind(vf));

      gracenotes[1].addAccidental(0, vf.Accidental({ type: '##' }));
      gracenotes3[3].addAccidental(0, vf.Accidental({ type: 'bb' }));
      gracenotes4[0].addDotToAll();

      var notes = [
        vf.StaveNote({ keys: ['b/4'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes }).beamNotes()),
        vf.StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
          .addAccidental(0, vf.Accidental({ type: '#' }))
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes1 }).beamNotes()),
        vf.StaveNote({ keys: ['c/5', 'd/5'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes2 }).beamNotes()),
        vf.StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes3 }).beamNotes()),
        vf.StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes4 }).beamNotes()),
      ];

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'GraceNoteBasic');
    },

    basicSlurred: function(options) {
      const vf = VF.Test.makeFactory(options, 700, 130);
      const stave = vf.Stave({ x: 10, y: 10, width: 650 });

      var gracenotes0 = [
        { keys: ['e/4'], duration: '32' },
        { keys: ['f/4'], duration: '32' },
        { keys: ['g/4'], duration: '32' },
        { keys: ['a/4'], duration: '32' },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes1 = [
        { keys: ['b/4'], duration: '8', slash: false },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes2 = [
        { keys: ['b/4'], duration: '8', slash: true },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes3 = [
        { keys: ['e/4'], duration: '8' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['e/4', 'g/4'], duration: '8' },
        { keys: ['a/4'], duration: '32' },
        { keys: ['b/4'], duration: '32' },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes4 = [
        { keys: ['a/4'], duration: '8' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
      ].map(vf.GraceNote.bind(vf));

      gracenotes0[1].addAccidental(0, vf.Accidental({ type: '#' }));
      gracenotes3[3].addAccidental(0, vf.Accidental({ type: 'b' }));
      gracenotes3[2].addAccidental(0, vf.Accidental({ type: 'n' }));
      gracenotes4[0].addDotToAll();

      const notes = [
        vf.StaveNote({ keys: ['b/4'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes0, slur: true }).beamNotes()),
        vf.StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
          .addAccidental(0, vf.Accidental({ type: '#' }))
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes1, slur: true }).beamNotes()),
        vf.StaveNote({ keys: ['c/5', 'd/5'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes2, slur: true }).beamNotes()),
        vf.StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes3, slur: true }).beamNotes()),
        vf.StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes4, slur: true }).beamNotes()),
        vf.StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true }),
      ];

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'GraceNoteBasic');
    },

    stem: function(options) {
      const vf = VF.Test.makeFactory(options, 700, 130);
      const stave = vf.Stave({ x: 10, y: 10, width: 650 });

      function createNotes(noteT, keys, stem_direction) {
        return stem_test_util.durations.map(function(d) {
          return stem_test_util.createNote(d, noteT, keys, stem_direction);
        });
      }

      function createNoteBlock(keys, stem_direction) {
        var notes = createNotes(vf.StaveNote.bind(vf), keys, stem_direction);
        var gracenotes = createNotes(vf.GraceNote.bind(vf), keys, stem_direction);
        notes[0].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes }));
        return notes;
      }

      var voice = vf.Voice().setStrict(false);
      voice.addTickables(createNoteBlock(['g/4'], 1));
      voice.addTickables(createNoteBlock(['d/5'], -1));

      new vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true, 'GraceNoteStem');
    },

    stemWithBeamed: function(options) {
      const vf = VF.Test.makeFactory(options, 700, 130);
      const stave = vf.Stave({ x: 10, y: 10, width: 650 });

      function createBeamdNotes(noteT, keys, stem_direction, beams, isGrace, notesToBeam) {
        var ret = [];
        stem_test_util.durations.map(function(d) {
          var n0 = stem_test_util.createNote(d, noteT, keys, stem_direction);
          var n1 = stem_test_util.createNote(d, noteT, keys, stem_direction);
          ret.push(n0);
          ret.push(n1);
          if (notesToBeam) {
            notesToBeam.push([n0, n1]);
          }
          if (!isGrace) {
            var tbeam = vf.Beam({ notes: [n0, n1] });
            beams.push(tbeam);
          }
          return ret;
        });
        return ret;
      }

      function createBeamdNoteBlock(keys, stem_direction, beams) {
        var bnotes = createBeamdNotes(vf.StaveNote.bind(vf), keys, stem_direction, beams);
        var notesToBeam = [];
        var gracenotes = createBeamdNotes(vf.GraceNote.bind(vf), keys, stem_direction, beams, true, notesToBeam);
        var graceNoteGroup = vf.GraceNoteGroup({ notes: gracenotes });
        notesToBeam.map(graceNoteGroup.beamNotes.bind(graceNoteGroup));
        bnotes[0].addModifier(0, graceNoteGroup);
        return bnotes;
      }

      var beams = [];
      var voice = vf.Voice().setStrict(false);
      voice.addTickables(createBeamdNoteBlock(['g/4'], 1, beams));
      voice.addTickables(createBeamdNoteBlock(['d/5'], -1, beams));

      new vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true, 'GraceNoteStem');
    },

    slash: function(options) {
      const vf = VF.Test.makeFactory(options, 700, 130);
      const stave = vf.Stave({ x: 10, y: 10, width: 650 });

      function createNotes(noteT, keys, stem_direction, slash) {
        return stem_test_util.durations.map(function(d) {
          return stem_test_util.createNote(d, noteT, keys, stem_direction, slash);
        });
      }

      function createNoteBlock(keys, stem_direction) {
        var notes = [vf.StaveNote({ keys: ['f/4'], stem_direction: stem_direction, duration: '16' })];
        var gracenotes = createNotes(vf.GraceNote.bind(vf), keys, stem_direction, true);

        var gnotesToBeam = [];
        var duration = '8';
        var gns = [
          { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },

          { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: true },

          { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
        ].map(vf.GraceNote.bind(vf));

        gnotesToBeam.push([gns[0], gns[1], gns[2]]);
        gnotesToBeam.push([gns[3], gns[4], gns[5]]);
        gnotesToBeam.push([gns[6], gns[7], gns[8]]);

        gracenotes = gracenotes.concat(gns);
        var gracenoteGroup = vf.GraceNoteGroup({ notes: gracenotes });
        gnotesToBeam.forEach(function(gnotes) {
          gracenoteGroup.beamNotes(gnotes);
        });

        notes[0].addModifier(0, gracenoteGroup);
        return notes;
      }

      var voice = vf.Voice().setStrict(false);
      voice.addTickables(createNoteBlock(['d/4', 'a/4'], 1));
      voice.addTickables(createNoteBlock(['d/4', 'a/4'], -1));

      new vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true, 'GraceNoteSlash');
    },

    slashWithBeams: function(options) {
      const vf = VF.Test.makeFactory(options, 800, 130);
      const stave = vf.Stave({ x: 10, y: 10, width: 750 });

      function createNoteBlock(keys, stem_direction) {
        var notes = [vf.StaveNote({ keys: ['f/4'], stem_direction: stem_direction, duration: '16' })];
        var gracenotes = [];

        var gnotesToBeam = [];

        ['8', '16', '32', '64'].forEach(function(duration) {
          var gns = [
            { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
            { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: false },

            { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
            { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: false },

            { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: true },
            { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: false },
          ].map(vf.GraceNote.bind(vf));

          gnotesToBeam.push([gns[0], gns[1]]);
          gnotesToBeam.push([gns[2], gns[3]]);
          gnotesToBeam.push([gns[4], gns[5]]);
          gracenotes = gracenotes.concat(gns);
        });
        var gracenoteGroup = vf.GraceNoteGroup({ notes: gracenotes });

        gnotesToBeam.forEach(function(gnotes) {
          gracenoteGroup.beamNotes(gnotes);
        });

        notes[0].addModifier(0, gracenoteGroup);
        return notes;
      }

      var voice = vf.Voice().setStrict(false);
      voice.addTickables(createNoteBlock(['d/4', 'a/4'], 1));
      voice.addTickables(createNoteBlock(['d/4', 'a/4'], -1));

      new vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true, 'GraceNoteSlashWithBeams');
    },

    multipleVoices: function(options) {
      const vf = VF.Test.makeFactory(options, 450, 140);
      const stave = vf.Stave({ x: 10, y: 10, width: 450 });

      var notes = [
        { keys: ['f/5'], stem_direction: 1, duration: '16' },
        { keys: ['f/5'], stem_direction: 1, duration: '16' },
        { keys: ['d/5'], stem_direction: 1, duration: '16' },
        { keys: ['c/5'], stem_direction: 1, duration: '16' },
        { keys: ['c/5'], stem_direction: 1, duration: '16' },
        { keys: ['d/5'], stem_direction: 1, duration: '16' },
        { keys: ['f/5'], stem_direction: 1, duration: '16' },
        { keys: ['e/5'], stem_direction: 1, duration: '16' },
      ].map(vf.StaveNote.bind(vf));

      var notes2 = [
        { keys: ['f/4'], stem_direction: -1, duration: '16' },
        { keys: ['e/4'], stem_direction: -1, duration: '16' },
        { keys: ['d/4'], stem_direction: -1, duration: '16' },
        { keys: ['c/4'], stem_direction: -1, duration: '16' },
        { keys: ['c/4'], stem_direction: -1, duration: '16' },
        { keys: ['d/4'], stem_direction: -1, duration: '16' },
        { keys: ['f/4'], stem_direction: -1, duration: '16' },
        { keys: ['e/4'], stem_direction: -1, duration: '16' },
      ].map(vf.StaveNote.bind(vf));

      var gracenotes1 = [
        { keys: ['b/4'], stem_direction: 1, duration: '8', slash: true },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes2 = [
        { keys: ['f/4'], stem_direction: -1, duration: '8', slash: true },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes3 = [
        { keys: ['f/4'], duration: '32', stem_direction: -1 },
        { keys: ['e/4'], duration: '32', stem_direction: -1 },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes4 = [
        { keys: ['f/5'], duration: '32', stem_direction: 1 },
        { keys: ['e/5'], duration: '32', stem_direction: 1 },
        { keys: ['e/5'], duration: '8', stem_direction: 1 },
      ].map(vf.GraceNote.bind(vf));

      gracenotes2[0].setStemDirection(-1);
      gracenotes2[0].addAccidental(0, vf.Accidental({ type: '#' }));

      notes[1].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes4 }).beamNotes());
      notes[3].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes1 }));
      notes2[1].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes2 }).beamNotes());
      notes2[5].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes3 }).beamNotes());

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      var voice2 = vf.Voice()
        .setStrict(false)
        .addTickables(notes2);

      vf.Beam({ notes: notes.slice(0, 4) });
      vf.Beam({ notes: notes.slice(4, 8) });
      vf.Beam({ notes: notes2.slice(0, 4) });
      vf.Beam({ notes: notes2.slice(4, 8) });

      new VF.Formatter()
        .joinVoices([voice, voice2])
        .formatToStave([voice, voice2], stave);

      vf.draw();

      ok(true, 'Sixteenth Test');
    },

    multipleVoicesMultipleDraws: function(options) {
      const vf = VF.Test.makeFactory(options, 450, 140);
      const stave = vf.Stave({ x: 10, y: 10, width: 450 });

      var notes = [
        { keys: ['f/5'], stem_direction: 1, duration: '16' },
        { keys: ['f/5'], stem_direction: 1, duration: '16' },
        { keys: ['d/5'], stem_direction: 1, duration: '16' },
        { keys: ['c/5'], stem_direction: 1, duration: '16' },
        { keys: ['c/5'], stem_direction: 1, duration: '16' },
        { keys: ['d/5'], stem_direction: 1, duration: '16' },
        { keys: ['f/5'], stem_direction: 1, duration: '16' },
        { keys: ['e/5'], stem_direction: 1, duration: '16' },
      ].map(vf.StaveNote.bind(vf));

      var notes2 = [
        { keys: ['f/4'], stem_direction: -1, duration: '16' },
        { keys: ['e/4'], stem_direction: -1, duration: '16' },
        { keys: ['d/4'], stem_direction: -1, duration: '16' },
        { keys: ['c/4'], stem_direction: -1, duration: '16' },
        { keys: ['c/4'], stem_direction: -1, duration: '16' },
        { keys: ['d/4'], stem_direction: -1, duration: '16' },
        { keys: ['f/4'], stem_direction: -1, duration: '16' },
        { keys: ['e/4'], stem_direction: -1, duration: '16' },
      ].map(vf.StaveNote.bind(vf));

      var gracenotes1 = [
        { keys: ['b/4'], stem_direction: 1, duration: '8', slash: true },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes2 = [
        { keys: ['f/4'], stem_direction: -1, duration: '8', slash: true },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes3 = [
        { keys: ['f/4'], duration: '32', stem_direction: -1 },
        { keys: ['e/4'], duration: '32', stem_direction: -1 },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes4 = [
        { keys: ['f/5'], duration: '32', stem_direction: 1 },
        { keys: ['e/5'], duration: '32', stem_direction: 1 },
        { keys: ['e/5'], duration: '8', stem_direction: 1 },
      ].map(vf.GraceNote.bind(vf));

      gracenotes2[0].setStemDirection(-1);
      gracenotes2[0].addAccidental(0, vf.Accidental({ type: '#' }));

      notes[1].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes4 }).beamNotes());
      notes[3].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes1 }));
      notes2[1].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes2 }).beamNotes());
      notes2[5].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes3 }).beamNotes());

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      var voice2 = vf.Voice()
        .setStrict(false)
        .addTickables(notes2);

      vf.Beam({ notes: notes.slice(0, 4) });
      vf.Beam({ notes: notes.slice(4, 8) });
      vf.Beam({ notes: notes2.slice(0, 4) });
      vf.Beam({ notes: notes2.slice(4, 8) });

      new VF.Formatter()
        .joinVoices([voice, voice2])
        .formatToStave([voice, voice2], stave);

      vf.draw();
      vf.draw();

      ok(true, 'Seventeenth Test');
    },
  };

  return GraceNote;
})();
