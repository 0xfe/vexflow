/**
 * VexFlow - Beam Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Beam = (function() {
  var runTests = VF.Test.runTests;

  var Beam = {
    Start: function() {
      QUnit.module("Beam");
      runTests("Simple Beam", Beam.simple);
      runTests("Multi Beam", Beam.multi);
      runTests("Sixteenth Beam", Beam.sixteenth);
      runTests("Slopey Beam", Beam.slopey);
      runTests("Auto-stemmed Beam", Beam.autoStem);
      runTests("Mixed Beam 1", Beam.mixed);
      runTests("Mixed Beam 2", Beam.mixed2);
      runTests("Dotted Beam", Beam.dotted);
      runTests("Close Trade-offs Beam", Beam.tradeoffs);
      runTests("Insane Beam", Beam.insane);
      runTests("Lengthy Beam", Beam.lenghty);
      runTests("Outlier Beam", Beam.outlier);
      runTests("Break Secondary Beams", Beam.breakSecondaryBeams);
      runTests("TabNote Beams Up", Beam.tabBeamsUp);
      runTests("TabNote Beams Down", Beam.tabBeamsDown);
      runTests("TabNote Auto Create Beams", Beam.autoTabBeams);
      runTests("TabNote Beams Auto Stem", Beam.tabBeamsAutoStem);
      runTests("Complex Beams with Annotations", Beam.complexWithAnnotation);
      runTests("Complex Beams with Articulations", Beam.complexWithArticulation);
    },

    beamNotes: function(notes, stave, ctx) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam = new VF.Beam(notes.slice(1, notes.length));

      voice.draw(ctx, stave);
      beam.setContext(ctx).draw();
    },

    setupContext: function(options, x, y) {
      var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 10, x || 450).addTrebleGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      Beam.beamNotes([
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "8"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "f/4", "a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/4", "g/4", "b/4"], stem_direction: 1, duration: "8"}).
          addAccidental(0, newAcc("bb")).
          addAccidental(1, newAcc("##")),
        newNote({ keys: ["f/4", "a/4", "c/5"], stem_direction: 1, duration: "8"})
      ], c.stave, c.context);
      ok(true, "Simple Test");
    },

    multi: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      beam2_1.setContext(c.context).draw();
      beam2_2.setContext(c.context).draw();
      ok(true, "Multi Test");
    },

    sixteenth: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "h"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "h"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      beam2_1.setContext(c.context).draw();
      beam2_2.setContext(c.context).draw();
      ok(true, "Sixteenth Test");
    },

    breakSecondaryBeams: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options, 600);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16", dots: 1 }),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16", dots: 1 }),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16", dots: 1 }),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "32"}),

        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"})
      ];
      notes.forEach(function(note) {
        if ('dots' in note && note.dots >= 1) {
          note.addDotToAll();
        }
      });

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice, voice2], 500);
      var beam1_1 = new VF.Beam(notes.slice(0, 6));
      var beam1_2 = new VF.Beam(notes.slice(6, 12));

      beam1_1.breakSecondaryAt([1, 3]);
      beam1_2.breakSecondaryAt([2]);

      var beam2_1 = new VF.Beam(notes2.slice(0, 12));
      var beam2_2 = new VF.Beam(notes2.slice(12, 18));

      beam2_1.breakSecondaryAt([3, 7, 11]);
      beam2_2.breakSecondaryAt([3]);

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      beam2_1.setContext(c.context).draw();
      beam2_2.setContext(c.context).draw();
      ok(true, "Breaking Secondary Beams Test");
    },

    slopey: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/3"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      ok(true, "Slopey Test");
    },

    autoStem: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["a/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["f/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/4"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      var beam1 = new VF.Beam(notes.slice(0, 2), true);
      var beam2 = new VF.Beam(notes.slice(2, 4), true);
      var beam3 = new VF.Beam(notes.slice(4, 6), true);
      var beam4 = new VF.Beam(notes.slice(6, 8), true);
      var beam5 = new VF.Beam(notes.slice(8, 10), true);
      var beam6 = new VF.Beam(notes.slice(10, 12), true);

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;

      equal(beam1.stem_direction, UP);
      equal(beam2.stem_direction, UP);
      equal(beam3.stem_direction, UP);
      equal(beam4.stem_direction, UP);
      equal(beam5.stem_direction, DOWN);
      equal(beam6.stem_direction, DOWN);

      voice.draw(ctx, stave);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      beam3.setContext(ctx).draw();
      beam4.setContext(ctx).draw();
      beam5.setContext(ctx).draw();
      beam6.setContext(ctx).draw();

      ok(true, "AutoStem Beam Test");
    },

    mixed: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),

        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),

        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),

        newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 390);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      beam2_1.setContext(c.context).draw();
      beam2_2.setContext(c.context).draw();
      ok(true, "Multi Test");
    },

    mixed2: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "64"}),

        newNote({ keys: ["d/5"], stem_direction: 1, duration: "128"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "32"}),

        newNote({ keys: ["c/5"], stem_direction: 1, duration: "64"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "128"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "64"}),

        newNote({ keys: ["d/4"], stem_direction: -1, duration: "128"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),

        newNote({ keys: ["c/4"], stem_direction: -1, duration: "64"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "128"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 390);
      var beam1_1 = new VF.Beam(notes.slice(0, 12));

      var beam2_1 = new VF.Beam(notes2.slice(0, 12));

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam2_1.setContext(c.context).draw();

      ok(true, "Multi Test");
    },

    dotted: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/3"], stem_direction: 1, duration: "8d"}).
            addDotToAll(),
        newNote({ keys: ["a/3"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/3"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["b/3"], stem_direction: 1, duration: "8d"}).
            addDotToAll(),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/3"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["a/3"], stem_direction: 1, duration: "8d"}).
            addDotToAll(),
        newNote({ keys: ["a/3"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["b/3"], stem_direction: 1, duration: "8d"}).
            addDotToAll(),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 390);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));
      var beam1_3 = new VF.Beam(notes.slice(8, 12));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();
      beam1_3.setContext(c.context).draw();

      ok(true, "Dotted Test");
    },

    tradeoffs: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
      newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      ok(true, "Close Trade-offs Test");
    },

    insane: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 7));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      ok(true, "Insane Test");
    },

    lenghty: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
      newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
      newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();

      ok(true, "Lengthy Test");
    },

    outlier: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().
                        joinVoices([voice]).
                        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      ok(true, "Outlier Test");
    },

    tabBeamsUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"},
        { positions: [{str: 3, fret: 6 }], duration: "8"},
        { positions: [{str: 3, fret: 6 }], duration: "8"},
        { positions: [{str: 3, fret: 6 }], duration: "8"},
        { positions: [{str: 3, fret: 6 }], duration: "8"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      var beam1 = new VF.Beam(notes.slice(1, 7));
      var beam2 = new VF.Beam(notes.slice(8, 11));

      var tuplet = new VF.Tuplet(notes.slice(8, 11));
      tuplet.setRatioed(true);

      voice.draw(ctx, stave);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      tuplet.setContext(ctx).draw();

      ok (true, 'All objects have been drawn');
    },

    tabBeamsDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 300);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550, {
        num_lines: 10
      });
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8dd"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"},
        { positions: [{str: 1, fret: 6 }], duration: "8"},
        { positions: [{str: 1, fret: 6 }], duration: "8"},
        { positions: [{str: 1, fret: 6 }], duration: "8"},
        { positions: [{str: 7, fret: 6 }], duration: "8"},
        { positions: [{str: 7, fret: 6 }], duration: "8"},
        { positions: [{str: 10, fret: 6 }], duration: "8"},
        { positions: [{str: 10, fret: 6 }], duration: "8"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      notes[1].addDot();
      notes[1].addDot();

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      var beam1 = new VF.Beam(notes.slice(1, 7));
      var beam2 = new VF.Beam(notes.slice(8, 11));

      var tuplet = new VF.Tuplet(notes.slice(8, 11));
      var tuplet2 = new VF.Tuplet(notes.slice(11, 14));
      tuplet.setTupletLocation(-1);
      tuplet2.setTupletLocation(-1);

      voice.draw(ctx, stave);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      tuplet.setContext(ctx).draw();
      tuplet2.setContext(ctx).draw();

      ok (true, 'All objects have been drawn');

    },


    autoTabBeams: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 300);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550, {
        num_lines: 6
      });
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }], duration: "32"},
        { positions: [{str: 1, fret: 6 }], duration: "32"},
        { positions: [{str: 1, fret: 6 }], duration: "32"},
        { positions: [{str: 6, fret: 6 }], duration: "32"},
        { positions: [{str: 6, fret: 6 }], duration: "16"},
        { positions: [{str: 6, fret: 6 }], duration: "16"},
        { positions: [{str: 6, fret: 6 }], duration: "16"},
        { positions: [{str: 6, fret: 6 }], duration: "16"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      var beams = VF.Beam.applyAndGetBeams(voice, -1);

      voice.draw(ctx, stave);
      beams.forEach(function(beam) {
          beam.setContext(ctx).draw();
      });

      ok (true, 'All objects have been drawn');

    },

    // This tests makes sure the auto_stem functionality is works.
    // TabNote stems within a beam group should end up normalized
    tabBeamsAutoStem: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 300);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550, {
        num_lines: 6
      });
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8", stem_direction: -1},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8", stem_direction: 1},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16", stem_direction: -1},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16", stem_direction: 1},
        { positions: [{str: 1, fret: 6 }], duration: "32", stem_direction: 1},
        { positions: [{str: 1, fret: 6 }], duration: "32", stem_direction: -1},
        { positions: [{str: 1, fret: 6 }], duration: "32", stem_direction: -1},
        { positions: [{str: 6, fret: 6 }], duration: "32", stem_direction: -1},
        { positions: [{str: 6, fret: 6 }], duration: "16", stem_direction: 1},
        { positions: [{str: 6, fret: 6 }], duration: "16", stem_direction: 1},
        { positions: [{str: 6, fret: 6 }], duration: "16", stem_direction: 1},
        { positions: [{str: 6, fret: 6 }], duration: "16", stem_direction: -1}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      var beams = [
        new VF.Beam(notes.slice(0, 8), true), // Stems should format down
        new VF.Beam(notes.slice(8, 12), true)  // Stems should format up
      ];

      voice.draw(ctx, stave);
      beams.forEach(function(beam) {
          beam.setContext(ctx).draw();
      });

      ok (true, 'All objects have been drawn');

    },

    complexWithAnnotation: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 200);
      ctx.scale(1.0, 1.0); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var stave = new VF.Stave(10, 40, 400).
        addClef("treble").setContext(ctx).draw();

      var notes = [
        { keys: ["e/4"], duration: "128" , stem_direction: 1},
        { keys: ["d/4"], duration: "16"  , stem_direction: 1},
        { keys: ["e/4"], duration: "8"   , stem_direction: 1},
        { keys: ["c/4", "g/4"], duration: "32"  , stem_direction: 1},
        { keys: ["c/4"], duration: "32"  , stem_direction: 1 },
        { keys: ["c/4"], duration: "32"  , stem_direction: 1},
        { keys: ["c/4"], duration: "32"  , stem_direction: 1}
      ];

      var notes2 = [
        { keys: ["e/5"], duration: "128" , stem_direction: -1},
        { keys: ["d/5"], duration: "16"  , stem_direction: -1},
        { keys: ["e/5"], duration: "8"   , stem_direction: -1},
        { keys: ["c/5", "g/5"], duration: "32"  , stem_direction: -1},
        { keys: ["c/5"], duration: "32"  , stem_direction: -1 },
        { keys: ["c/5"], duration: "32"  , stem_direction: -1},
        { keys: ["c/5"], duration: "32"  , stem_direction: -1}
      ];

      notes = notes.map(function(note, index) {
          return newNote(note).addModifier(0, new VF.Annotation("1").setVerticalJustification(1));
      });

      notes2 = notes2.map(function(note, index) {
          return newNote(note).addModifier(0, new VF.Annotation("3").setVerticalJustification(3));
      });

      var beam = new VF.Beam(notes);
      var beam2 = new VF.Beam(notes2);

      var voice = new VF.Voice(VF.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      voice.addTickables(notes2);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave, {stave: stave});
      voice.draw(ctx);
      beam.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      ok(true, "Complex beam annotations");
    },

    complexWithArticulation: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 200);
      ctx.scale(1.0, 1.0); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var stave = new VF.Stave(10, 40, 400).
        addClef("treble").setContext(ctx).draw();

      var notes = [
        { keys: ["e/4"], duration: "128" , stem_direction: 1},
        { keys: ["d/4"], duration: "16"  , stem_direction: 1},
        { keys: ["e/4"], duration: "8"   , stem_direction: 1},
        { keys: ["c/4", "g/4"], duration: "32"  , stem_direction: 1},
        { keys: ["c/4"], duration: "32"  , stem_direction: 1 },
        { keys: ["c/4"], duration: "32"  , stem_direction: 1},
        { keys: ["c/4"], duration: "32"  , stem_direction: 1}
      ];

      var notes2 = [
        { keys: ["e/5"], duration: "128" , stem_direction: -1},
        { keys: ["d/5"], duration: "16"  , stem_direction: -1},
        { keys: ["e/5"], duration: "8"   , stem_direction: -1},
        { keys: ["c/5", "g/5"], duration: "32"  , stem_direction: -1},
        { keys: ["c/5"], duration: "32"  , stem_direction: -1 },
        { keys: ["c/5"], duration: "32"  , stem_direction: -1},
        { keys: ["c/5"], duration: "32"  , stem_direction: -1}
      ];

      notes = notes.map(function(note, index) {
          return newNote(note).addModifier(0, new VF.Articulation("am").setPosition(3));
      });

      notes2 = notes2.map(function(note, index) {
          return newNote(note).addModifier(0, new VF.Articulation("a>").setPosition(4));
      });

      var beam = new VF.Beam(notes);
      var beam2 = new VF.Beam(notes2);

      var voice = new VF.Voice(VF.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      voice.addTickables(notes2);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave, {stave: stave});
      voice.draw(ctx);
      beam.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      ok(true, "Complex beam articulations");
    }
  };

  return Beam;
})();