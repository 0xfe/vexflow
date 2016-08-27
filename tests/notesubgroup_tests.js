/**
 * VexFlow - NoteSubGroup Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 * Author Taehoon Moon 2016
 */

VF.Test.NoteSubGroup = (function() {
  var NoteSubGroup = {
    Start: function() {
      QUnit.module("NoteSubGroup");
      VF.Test.runTests("Basic - ClefNote, TimeSigNote and BarNote", VF.Test.NoteSubGroup.draw);
      VF.Test.runTests("Multi Voice", VF.Test.NoteSubGroup.drawMultiVoice);
      VF.Test.runTests("Multi Staff", VF.Test.NoteSubGroup.drawMultiStaff);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 200);
      var stave = new VF.Stave(10, 10, 500);
      stave.setClef("treble");
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        { keys: ["f/5"], stem_direction: -1, duration: "q"},
        { keys: ["d/4"], stem_direction: -1, duration: "q", clef: "bass"},
        { keys: ["g/4"], stem_direction: -1, duration: "q", clef: "alto"},
        { keys: ["a/4"], stem_direction: -1, duration: "q", clef: "alto"},
        { keys: ["c/4"], stem_direction: -1, duration: "q", clef: "tenor"},
        { keys: ["c/3"], stem_direction: 1, duration: "q", clef: "tenor"},
        { keys: ["d/4"], stem_direction: -1, duration: "q", clef: "tenor"},
        { keys: ["f/4"], stem_direction: -1, duration: "q", clef: "tenor"}
      ];

      notes = notes.map(function(note_struct) {
        return new VF.StaveNote(note_struct);
      });

      function addAccidental(note, acc) { return note.addModifier(0, new VF.Accidental(acc)); }
      function addSubGroup(note, subNotes) {
        return note.addModifier(0, new VF.NoteSubGroup(subNotes));
      }

      // {SubNotes} | {Accidental} | {StaveNote}
      addAccidental(notes[1], "#");
      addAccidental(notes[2], "n");
      addSubGroup(notes[1], [new VF.ClefNote("bass", "small")]);
      addSubGroup(notes[2], [new VF.ClefNote("alto", "small")]);
      addSubGroup(notes[4], [
        new VF.ClefNote("tenor", "small"),
        new VF.BarNote()
      ]);
      addSubGroup(notes[5], [new VF.TimeSigNote("6/8")]);
      addSubGroup(notes[6], [new VF.BarNote(VF.Barline.type.REPEAT_BEGIN)]);
      addAccidental(notes[4], "b");
      addAccidental(notes[6], "bb");

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      voice.draw(ctx, stave);

      notes.forEach(function(note) { Vex.Flow.Test.plotNoteWidth(ctx, note, 150); });
      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 520, 150);
      ok(true, "all pass");
    },

    drawMultiVoice: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 550, 200);
      var stave = new VF.Stave(10, 10, 500);
      stave.setClef("treble");
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        { keys: ["f/5"], stem_direction: 1, duration: "q"},
        { keys: ["d/4"], stem_direction: 1, duration: "q", clef: "bass"},
        { keys: ["c/5"], stem_direction: 1, duration: "q", clef: "alto"},
        { keys: ["c/5"], stem_direction: 1, duration: "q", clef: "soprano"}
      ];

      var notes2 = [
        { keys: ["c/4"], stem_direction: -1, duration: "q"},
        { keys: ["c/3"], stem_direction: -1, duration: "q", clef: "bass"},
        { keys: ["d/4"], stem_direction: -1, duration: "q", clef: "alto"},
        { keys: ["f/4"], stem_direction: -1, duration: "q", clef: "soprano"}
      ];

      function newStaveNote(note_struct) { return new VF.StaveNote(note_struct); }
      function addAccidental(note, acc) { return note.addModifier(0, new VF.Accidental(acc)); }
      function addSubGroup(note, subNotes) {
        return note.addModifier(0, new VF.NoteSubGroup(subNotes));
      }

      notes = notes.map(newStaveNote);
      notes2 = notes2.map(newStaveNote);

      addAccidental(notes[1], "#");
      addSubGroup(notes[1], [
        new VF.ClefNote("bass", "small"),
        new VF.BarNote(VF.Barline.type.REPEAT_BEGIN),
        new VF.TimeSigNote("3/4")
      ]);
      addSubGroup(notes2[2], [
        new VF.ClefNote("alto", "small"),
        new VF.TimeSigNote("9/8"),
        new VF.BarNote(VF.Barline.type.DOUBLE)
      ]);
      addSubGroup(notes[3], [new VF.ClefNote("soprano", "small")]);
      addAccidental(notes[2], "b");
      addAccidental(notes2[3], "#");

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(true);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(true);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        formatToStave([voice, voice2], stave);

      voice.draw(ctx, stave);
      voice2.draw(ctx, stave);

      notes.forEach(function(note) { Vex.Flow.Test.plotNoteWidth(ctx, note, 150); });
      ok(true, "all pass");
    },

    drawMultiStaff: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 280);
      var stave = new VF.Stave(30, 30, 550);
      var stave2 = new VF.Stave(30, 150, 550);
      stave.setClef("treble");
      stave2.setClef("bass");
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave.draw();
      stave2.draw();

      var connector = new VF.StaveConnector(stave, stave2);
      var connector2 = new VF.StaveConnector(stave, stave2);
      var connector3 = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.BRACE);
      connector2.setType(VF.StaveConnector.type.SINGLE_LEFT);
      connector3.setType(VF.StaveConnector.type.SINGLE_RIGHT);
      connector.setContext(ctx).draw();
      connector2.setContext(ctx).draw();
      connector3.setContext(ctx).draw();

      var notes = [
        { keys: ["f/5"], stem_direction: 1, duration: "q" },
        { keys: ["d/4"], stem_direction: 1, duration: "q", clef: "bass" },
        { keys: ["c/5"], stem_direction: 1, duration: "q", clef: "alto" },
        { keys: ["c/5"], stem_direction: 1, duration: "q", clef: "soprano" }
      ];

      var notes2 = [
        { keys: ["c/4"], stem_direction: -1, duration: "q" },
        { keys: ["c/3"], stem_direction: -1, duration: "q", clef: "bass" },
        { keys: ["d/4"], stem_direction: -1, duration: "q", clef: "alto" },
        { keys: ["f/4"], stem_direction: -1, duration: "q", clef: "soprano" }
      ];

      var notes3 = [
        { keys: ["e/3"], duration: "8", stem_direction: -1, clef: "bass" },
        { keys: ["g/4"], duration: "8", stem_direction: 1, clef: "treble" },
        { keys: ["d/4"], duration: "8", stem_direction: 1, clef: "treble" },
        { keys: ["f/4"], duration: "8", stem_direction: 1, clef: "treble" },
        { keys: ["c/4"], duration: "8", stem_direction: 1, clef: "treble"},
        { keys: ["g/3"], duration: "8", stem_direction: -1, clef: "bass" },
        { keys: ["d/3"], duration: "8", stem_direction: -1, clef: "bass" },
        { keys: ["f/3"], duration: "8", stem_direction: -1, clef: "bass" }
      ]

      function newStaveNote(_stave) {
        return function(note_struct) {
          return (new VF.StaveNote(note_struct)).setStave(_stave);
        }
      }
      function addAccidental(note, acc) { return note.addModifier(0, new VF.Accidental(acc)); }
      function addSubGroup(note, subNotes) {
        return note.addModifier(0, new VF.NoteSubGroup(subNotes));
      }

      notes = notes.map(newStaveNote(stave));
      notes2 = notes2.map(newStaveNote(stave));
      notes3 = notes3.map(newStaveNote(stave2));

      var beam3_1 = new VF.Beam(notes3.slice(1, 4));
      var beam3_2 = new VF.Beam(notes3.slice(5));

      addAccidental(notes[1], "#");
      addSubGroup(notes[1], [
        new VF.ClefNote("bass", "small"),
        new VF.TimeSigNote("3/4")
      ]);
      addSubGroup(notes2[2], [
        new VF.ClefNote("alto", "small"),
        new VF.TimeSigNote("9/8"),
      ]);
      addSubGroup(notes[3], [new VF.ClefNote("soprano", "small")]);
      addSubGroup(notes3[1], [new VF.ClefNote("treble", "small")]);
      addSubGroup(notes3[5], [new VF.ClefNote("bass", "small")]);
      addAccidental(notes3[0], "#");
      addAccidental(notes3[3], "b");
      addAccidental(notes3[5], "#");
      addAccidental(notes[2], "b");
      addAccidental(notes2[3], "#");

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(true);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(true);
      var voice3 = new VF.Voice(VF.Test.TIME4_4).setStrict(true);
      voice.addTickables(notes);
      voice2.addTickables(notes2);
      voice3.addTickables(notes3);

      var justifyWidth = stave.getNoteEndX() - stave.getNoteStartX() - 10;
      var formatter = new VF.Formatter()
        .joinVoices([voice, voice2])
        .joinVoices([voice3])
        .format([voice, voice2, voice3], justifyWidth);

      voice.draw(ctx, stave);
      voice2.draw(ctx, stave);
      voice3.draw(ctx, stave2);
      beam3_1.setContext(ctx).draw();
      beam3_2.setContext(ctx).draw();

      ok(true, "all pass");
    }
  };

  return NoteSubGroup;
})();
