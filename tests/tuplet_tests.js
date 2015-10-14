/**
 * VexFlow - Tuplet Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Tuplet = (function() {
  var Tuplet = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Tuplet");
      runTests("Simple Tuplet", Tuplet.simple);
      runTests("Beamed Tuplet", Tuplet.beamed);
      runTests("Ratioed Tuplet", Tuplet.ratio);
      runTests("Bottom Tuplet", Tuplet.bottom);
      runTests("Bottom Ratioed Tuplet", Tuplet.bottom_ratio);
      runTests("Awkward Tuplet", Tuplet.awkward);
      runTests("Complex Tuplet", Tuplet.complex);
      runTests("Mixed Stem Direction Tuplet", Tuplet.mixedTop);
      runTests("Mixed Stem Direction Bottom Tuplet", Tuplet.mixedBottom);
    },

    setupContext: function(options, x, y) {
      var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);

      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 10, x || 350).addTrebleGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"})
      ];

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6));

      // 3/4 time
      var voice = new VF.Voice({
        num_beats: 3, beat_value: 4, resolution: VF.RESOLUTION });

      voice.setStrict(true);
      voice.addTickables(notes);

      c.stave.addTimeSignature("3/4");
      c.stave.draw(c.context);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();

      ok(true, "Simple Test");
    },

    beamed: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"})
      ];

      var beam1 = new VF.Beam(notes.slice(0, 3));
      var beam2 = new VF.Beam(notes.slice(3, 10));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 10));

      // 3/8 time
      var voice = new VF.Voice({
        num_beats: 3, beat_value: 8, resolution: VF.RESOLUTION });

      voice.setStrict(true);
      voice.addTickables(notes);
      c.stave.addTimeSignature("3/8");
      c.stave.draw(c.context);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();

      ok(true, "Beamed Test");
    },

    ratio: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"})
      ];

      var beam = new VF.Beam(notes.slice(3, 6));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6), {beats_occupied: 4});

      var voice = new VF.Voice(VF.Test.TIME4_4);

      voice.setStrict(true);
      voice.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      beam.setContext(c.context).draw();

      tuplet1.setRatioed(true).setContext(c.context).draw();
      tuplet2.setRatioed(true).setContext(c.context).draw();

      ok(true, "Ratioed Test");
    },

    bottom: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options, 350, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["g/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"})
      ];

      var beam = new VF.Beam(notes.slice(3, 6));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6));

      tuplet1.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet2.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);

      var voice = new VF.Voice({
        num_beats: 3, beat_value: 4, resolution: VF.RESOLUTION });

      voice.setStrict(true);
      voice.addTickables(notes);
      c.stave.addTimeSignature("3/4");
      c.stave.draw(c.context);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      beam.setContext(c.context).draw();

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();

      ok(true, "Bottom Test");
    },

    bottom_ratio: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options, 350, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"})
      ];

      var beam = new VF.Beam(notes.slice(3, 6));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6));

      tuplet2.setBeatsOccupied(1);
      tuplet1.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet2.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);

      var voice = new VF.Voice({
        num_beats: 5, beat_value: 8, resolution: VF.RESOLUTION });

      voice.setStrict(true);
      voice.addTickables(notes);
      c.stave.addTimeSignature("5/8");
      c.stave.draw(c.context);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      beam.setContext(c.context).draw();

      tuplet1.setRatioed(true).setContext(c.context).draw();
      tuplet2.setRatioed(true).setContext(c.context).draw();

      ok(true, "Bottom Ratioed Test");
    },

    awkward: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"})
      ];

      var beam = new VF.Beam(notes.slice(0, 11));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 11));
      var tuplet2 = new VF.Tuplet(notes.slice(11, 14));
      tuplet1.setBeatsOccupied(142);

      var voice = new VF.Voice(VF.Test.TIME4_4);

      voice.setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      beam.setContext(c.context).draw();
      tuplet1.setRatioed(true).setContext(c.context).draw();
      tuplet2.setRatioed(true).setBracketed(true).setContext(c.context).draw();

      ok(true, "Awkward Test");
    },

    complex: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Tuplet.setupContext(options, 600);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes1 = [
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8d"}).addDotToAll(),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "16r"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"})
      ];
      var notes2 = [
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "4" }),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "4" }),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "4" }),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "4" })
      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      var beam1 = new VF.Beam(notes1.slice(0, 3));
      var beam2 = new VF.Beam(notes1.slice(5, 9));
      var beam3 = new VF.Beam(notes1.slice(11, 16));

      var tuplet1 = new VF.Tuplet(notes1.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes1.slice(3, 11),
                                        {num_notes: 7, beats_occupied: 4});
      var tuplet3 = new VF.Tuplet(notes1.slice(11, 16), {beats_occupied: 4});

      voice1.setStrict(true);
      voice1.addTickables(notes1);
      voice2.setStrict(true)
      voice2.addTickables(notes2);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      var formatter = new VF.Formatter().joinVoices([voice1, voice2]).
        format([voice1, voice2], c.stave.getNoteEndX() - c.stave.getNoteStartX() - 50);

      voice1.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();

      ok(true, "Complex Test");
    },

    mixedTop: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "4"}),
        newNote({ keys: ["c/6"], stem_direction: -1, duration: "4"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "4"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "4"}),
        newNote({ keys: ["a/4"], stem_direction: -1, duration: "4"}),
        newNote({ keys: ["c/6"], stem_direction: -1, duration: "4"})
      ];

      var tuplet1 = new VF.Tuplet(notes.slice(0, 2), {beats_occupied : 3});
      var tuplet2 = new VF.Tuplet(notes.slice(2, 4), {beats_occupied : 3});
      var tuplet3 = new VF.Tuplet(notes.slice(4, 6), {beats_occupied : 3});

      var voice = new VF.Voice(VF.Test.TIME4_4);

      voice.setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();

      ok(true, "Mixed Stem Direction Tuplet");
    },

    mixedBottom: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["f/3"], stem_direction: 1, duration: "4"}),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "4"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "4"}),
        newNote({ keys: ["f/3"], stem_direction: 1, duration: "4"}),
        newNote({ keys: ["a/4"], stem_direction: -1, duration: "4"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "4"})
      ];

      var tuplet1 = new VF.Tuplet(notes.slice(0, 2), {beats_occupied : 3});
      var tuplet2 = new VF.Tuplet(notes.slice(2, 4), {beats_occupied : 3});
      var tuplet3 = new VF.Tuplet(notes.slice(4, 6), {beats_occupied : 3});

      var voice = new VF.Voice(VF.Test.TIME4_4);

      voice.setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      tuplet1.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet2.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet3.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();

      ok(true, "Mixed Stem Direction Bottom Tuplet");
    }
  };

  return Tuplet;
})();
