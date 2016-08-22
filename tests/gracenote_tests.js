/**
 * VexFlow - GraceNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.GraceNote = (function() {
  var GraceNote = {
    Start: function() {
      QUnit.module('Grace Notes');
      VF.Test.runTests('Grace Note Basic', VF.Test.GraceNote.basic);
      VF.Test.runTests('Grace Note Basic with Slurs', VF.Test.GraceNote.basicSlurred);
      VF.Test.runTests('Grace Notes Multiple Voices', VF.Test.GraceNote.multipleVoices);
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

      var notes =  [
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
  };

  return GraceNote;
})();
