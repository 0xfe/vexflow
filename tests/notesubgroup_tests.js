/**
 * VexFlow - NoteSubGroup Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 * Author Taehoon Moon 2016
 */

VF.Test.NoteSubGroup = (function() {
  var NoteSubGroup = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('NoteSubGroup');

      run('Basic - ClefNote, TimeSigNote and BarNote', VF.Test.NoteSubGroup.draw);
      run('Multi Voice', VF.Test.NoteSubGroup.drawMultiVoice);
      run('Multi Voice Multiple Draws', VF.Test.NoteSubGroup.drawMultiVoiceMultipleDraw);
      run('Multi Staff', VF.Test.NoteSubGroup.drawMultiStaff);
    },

    draw: function(options) {
      var vf = VF.Test.makeFactory(options, 750, 200);
      var ctx = vf.getContext();
      var stave = vf.Stave({ width: 600 }).addClef('treble');

      var notes = [
        { keys: ['f/5'], stem_direction: -1, duration: '4' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'bass' },
        { keys: ['g/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['a/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['c/4'], stem_direction: -1, duration: '4', clef: 'tenor' },
        { keys: ['c/3'], stem_direction: +1, duration: '4', clef: 'tenor' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'tenor' },
        { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'tenor' },
      ].map(vf.StaveNote.bind(vf));

      function addAccidental(note, acc) {
        return note.addModifier(0, vf.Accidental({ type: acc }));
      }

      function addSubGroup(note, subNotes) {
        return note.addModifier(0, vf.NoteSubGroup({ notes: subNotes }));
      }

      // {SubNotes} | {Accidental} | {StaveNote}
      addAccidental(notes[1], '#');
      addAccidental(notes[2], 'n');

      addSubGroup(notes[1], [
        vf.ClefNote({ type: 'bass', options: { size: 'small' } }),
      ]);
      addSubGroup(notes[2], [
        vf.ClefNote({ type: 'alto', options: { size: 'small' } }),
      ]);
      addSubGroup(notes[4], [
        vf.ClefNote({ type: 'tenor', options: { size: 'small' } }),
        new VF.BarNote(),
      ]);
      addSubGroup(notes[5], [
        vf.TimeSigNote({ time: '6/8' }),
      ]);
      addSubGroup(notes[6], [
        new VF.BarNote(VF.Barline.type.REPEAT_BEGIN),
      ]);

      addAccidental(notes[4], 'b');
      addAccidental(notes[6], 'bb');

      var voice = vf.Voice().setStrict(false).addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      notes.forEach(function(note) {
        Vex.Flow.Test.plotNoteWidth(ctx, note, 150);
      });

      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 620, 120);

      ok(true, 'all pass');
    },

    drawMultiVoice: function(options) {
      var vf = VF.Test.makeFactory(options, 550, 200);
      var ctx = vf.getContext();
      var stave = vf.Stave().addClef('treble');

      var notes1 = [
        { keys: ['f/5'], stem_direction: 1, duration: '4' },
        { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
      ].map(vf.StaveNote.bind(vf));

      var notes2 = [
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
      ].map(vf.StaveNote.bind(vf));

      function addAccidental(note, accid) {
        return note.addModifier(0, vf.Accidental({ type: accid }));
      }
      function addSubGroup(note, subNotes) {
        return note.addModifier(0, vf.NoteSubGroup({ notes: subNotes }));
      }

      addAccidental(notes1[1], '#');

      addSubGroup(notes1[1], [
        vf.ClefNote({ type: 'bass', options: { size: 'small' } }),
        new VF.BarNote(VF.Barline.type.REPEAT_BEGIN),
        vf.TimeSigNote({ time: '3/4' }),
      ]);
      addSubGroup(notes2[2], [
        vf.ClefNote({ type: 'alto', options: { size: 'small' } }),
        vf.TimeSigNote({ time: '9/8' }),
        new VF.BarNote(VF.Barline.type.DOUBLE),
      ]);
      addSubGroup(notes1[3], [
        vf.ClefNote({ type: 'soprano', options: { size: 'small' } }),
      ]);

      addAccidental(notes1[2], 'b');
      addAccidental(notes2[3], '#');

      var voices = [
        vf.Voice().addTickables(notes1),
        vf.Voice().addTickables(notes2),
      ];

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();

      notes1.forEach(function(note) {
        Vex.Flow.Test.plotNoteWidth(ctx, note, 150);
      });

      ok(true, 'all pass');
    },

    // draws multiple times. prevents incremental x-shift each draw.
    drawMultiVoiceMultipleDraw: function(options) {
      var vf = VF.Test.makeFactory(options, 550, 200);
      var ctx = vf.getContext();
      var stave = vf.Stave().addClef('treble');

      var notes1 = [
        { keys: ['f/5'], stem_direction: 1, duration: '4' },
        { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
      ].map(vf.StaveNote.bind(vf));

      var notes2 = [
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
      ].map(vf.StaveNote.bind(vf));

      function addAccidental(note, accid) {
        return note.addModifier(0, vf.Accidental({ type: accid }));
      }
      function addSubGroup(note, subNotes) {
        return note.addModifier(0, vf.NoteSubGroup({ notes: subNotes }));
      }

      addAccidental(notes1[1], '#');

      addSubGroup(notes1[1], [
        vf.ClefNote({ type: 'bass', options: { size: 'small' } }),
        new VF.BarNote(VF.Barline.type.REPEAT_BEGIN),
        vf.TimeSigNote({ time: '3/4' }),
      ]);
      addSubGroup(notes2[2], [
        vf.ClefNote({ type: 'alto', options: { size: 'small' } }),
        vf.TimeSigNote({ time: '9/8' }),
        new VF.BarNote(VF.Barline.type.DOUBLE),
      ]);
      addSubGroup(notes1[3], [
        vf.ClefNote({ type: 'soprano', options: { size: 'small' } }),
      ]);

      addAccidental(notes1[2], 'b');
      addAccidental(notes2[3], '#');

      var voices = [
        vf.Voice().addTickables(notes1),
        vf.Voice().addTickables(notes2),
      ];

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();
      vf.draw();

      notes1.forEach(function(note) {
        Vex.Flow.Test.plotNoteWidth(ctx, note, 150);
      });

      ok(true, 'all pass');
    },

    drawMultiStaff: function(options) {
      var vf = VF.Test.makeFactory(options, 550, 400);

      vf.StaveNote = vf.StaveNote.bind(vf);

      var stave1 = vf.Stave({ x: 15, y: 30, width: 500 }).setClef('treble');
      var notes1 = [
        { keys: ['f/5'], stem_direction: 1, duration: '4' },
        { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
      ].map(vf.StaveNote);

      var notes2 = [
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
      ].map(vf.StaveNote);

      var stave2 = vf.Stave({ x: 15, y: 150, width: 500 }).setClef('bass');

      var notes3 = [
        { keys: ['e/3'], duration: '8', stem_direction: -1, clef: 'bass' },
        { keys: ['g/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['d/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['f/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['c/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['g/3'], duration: '8', stem_direction: -1, clef: 'bass' },
        { keys: ['d/3'], duration: '8', stem_direction: -1, clef: 'bass' },
        { keys: ['f/3'], duration: '8', stem_direction: -1, clef: 'bass' },
      ].map(vf.StaveNote);

      vf.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'brace' });
      vf.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'singleLeft' });
      vf.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'singleRight' });

      function addAccidental(note, acc) {
        return note.addModifier(0, vf.Accidental({ type: acc }));
      }
      function addSubGroup(note, subNotes) {
        return note.addModifier(0, vf.NoteSubGroup({ notes: subNotes }));
      }

      vf.Beam({ notes: notes3.slice(1, 4) });
      vf.Beam({ notes: notes3.slice(5) });

      addAccidental(notes1[1], '#');
      addSubGroup(notes1[1], [
        vf.ClefNote({ type: 'bass', options: { size: 'small' } }),
        vf.TimeSigNote({ time: '3/4' }),
      ]);
      addSubGroup(notes2[2], [
        vf.ClefNote({ type: 'alto', options: { size: 'small' } }),
        vf.TimeSigNote({ time: '9/8' }),
      ]);
      addSubGroup(notes1[3], [vf.ClefNote({ type: 'soprano', options: { size: 'small' } })]);
      addSubGroup(notes3[1], [vf.ClefNote({ type: 'treble', options: { size: 'small' } })]);
      addSubGroup(notes3[5], [vf.ClefNote({ type: 'bass', options: { size: 'small' } })]);
      addAccidental(notes3[0], '#');
      addAccidental(notes3[3], 'b');
      addAccidental(notes3[5], '#');
      addAccidental(notes1[2], 'b');
      addAccidental(notes2[3], '#');

      var voice = vf.Voice().addTickables(notes1);
      var voice2 = vf.Voice().addTickables(notes2);
      var voice3 = vf.Voice().addTickables(notes3);

      vf.Formatter()
        .joinVoices([voice, voice2])
        .joinVoices([voice3])
        .formatToStave([voice, voice2, voice3], stave1);

      vf.draw();

      ok(true, 'all pass');
    },
  };

  return NoteSubGroup;
})();
