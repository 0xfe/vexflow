/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

VF.Test.GhostNote = (function() {
  var GhostNote = {
    Start: function() {
      QUnit.module("GhostNote");
      VF.Test.runTests("GhostNote Basic", VF.Test.GhostNote.basic);
      VF.Test.runTests("GhostNote Dotted", VF.Test.GhostNote.dotted);
    },

    basic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      var stave = new VF.Stave(10, 10, 550);
      stave.setClef('treble');
      stave.setContext(ctx);
      stave.draw();

      function newGhostNote(duration) { return new VF.GhostNote({ duration: duration })}
      function newStaveNote(note_struct) { return new VF.StaveNote(note_struct); }
      function addAccidental(note, type) { note.addAccidental(0, new VF.Accidental(type)); }

      /*
      {} -> GhostNote

       q  q  q  q  8  8  8  8  8  8
      {h}    q {q} q {8} 8  q
      */
      var notes = [
        newStaveNote({ keys: ["f/5"], stem_direction: 1, duration: "q"}),
        newStaveNote({ keys: ["f/5"], stem_direction: 1, duration: "q"}),
        newStaveNote({ keys: ["d/5"], stem_direction: 1, duration: "q"}),
        newStaveNote({ keys: ["c/5"], stem_direction: 1, duration: "q"}),
        newStaveNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["c/5"], stem_direction: 1, duration: "8"})
      ];

      addAccidental(notes[0], "#");
      addAccidental(notes[2], "b");
      addAccidental(notes[6], "n");

      var notes2 = [
        newGhostNote("h"),
        newStaveNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newGhostNote("q"),
        newStaveNote({ keys: ["e/4"], stem_direction: -1, duration: "q"}),
        newGhostNote("8"),
        newStaveNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newStaveNote({ keys: ["c/4"], stem_direction: -1, duration: "q"})
      ];

      addAccidental(notes2[5], "##");

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var beam = new VF.Beam(notes.slice(4, 8));
      var beam2 = new VF.Beam(notes.slice(8, 10));

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        formatToStave([voice, voice2], stave);

      voice.draw(ctx, stave);
      voice2.draw(ctx, stave);

      beam.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      ok(true, "all pass");
    },

    dotted: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      var stave = new VF.Stave(10, 10, 550);
      stave.setClef('treble');
      stave.setContext(ctx);
      stave.draw();

      /*
       {} -> GhostNote

       {qd}    8   q    8  16  16  {hdd}       8
        q   8  8  {qdd}        16   h    q  8  8
      */
      function newGhostNote(duration) { return new VF.GhostNote({ duration: duration })}
      function newStaveNote(note_struct) { return new VF.StaveNote(note_struct); }
      function addAccidental(note, type) { note.addAccidental(0, new VF.Accidental(type)); }

      var notes = [
        newGhostNote("qd"),
        newStaveNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["d/5"], stem_direction: 1, duration: "q"}),
        newStaveNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newStaveNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newGhostNote("hdd"),
        newStaveNote({ keys: ["f/5"], stem_direction: 1, duration: "8"})
      ];

      addAccidental(notes[1], "bb");
      addAccidental(notes[4], "#");
      addAccidental(notes[7], "n");

      var notes2 = [
        newStaveNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newStaveNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newStaveNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newGhostNote("qdd"),
        newStaveNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newStaveNote({ keys: ["c/4"], stem_direction: -1, duration: "h"}),
        newStaveNote({ keys: ["d/4"], stem_direction: -1, duration: "q"}),
        newStaveNote({ keys: ["f/4"], stem_direction: -1, duration: "8"}),
        newStaveNote({ keys: ["e/4"], stem_direction: -1, duration: "8"})
      ];

      addAccidental(notes2[0], '#');
      addAccidental(notes2[4], 'b');
      addAccidental(notes2[5], '#');
      addAccidental(notes2[7], 'n');

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var beam = new VF.Beam(notes.slice(3, 6));
      var beam2 = new VF.Beam(notes2.slice(1, 3));
      var beam3 = new VF.Beam(notes2.slice(7, 9));

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        formatToStave([voice, voice2], stave);

      voice.draw(ctx, stave);
      voice2.draw(ctx, stave);

      beam.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      beam3.setContext(ctx).draw();

      ok(true, "all pass");
    }
  };

  return GhostNote;
})();
