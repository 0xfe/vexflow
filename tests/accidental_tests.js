/**
 * VexFlow - Accidental Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

const newNote = (noteProps) => new Vex.Flow.StaveNote(noteProps);
const newAccid = (type) => new Vex.Flow.Accidental(type);

Vex.Flow.Test.Accidental = (() => {
  const hasAccidental = (note) =>
    note.modifiers.reduce(
      (hasAcc, modifier) => hasAcc || modifier.getCategory() === "accidentals",
      false
    );

  const setStave = (stave) => (obj) => obj.setStave(stave);

  Accidental = {
    Start: function() {
      QUnit.module("Accidental");
      Vex.Flow.Test.runTests("Basic", Vex.Flow.Test.Accidental.basic);
      Vex.Flow.Test.runTests("Stem Down", Vex.Flow.Test.Accidental.basicStemDown);
      Vex.Flow.Test.runTests("Accidental Arrangement Special Cases", Vex.Flow.Test.Accidental.specialCases);
      Vex.Flow.Test.runTests("Multi Voice", Vex.Flow.Test.Accidental.multiVoice);
      Vex.Flow.Test.runTests("Microtonal", Vex.Flow.Test.Accidental.microtonal);
      test("Automatic Accidentals - Simple Tests", Vex.Flow.Test.Accidental.autoAccidentalWorking);
      Vex.Flow.Test.runTests("Automatic Accidentals", Vex.Flow.Test.Accidental.automaticAccidentals0);
      Vex.Flow.Test.runTests("Automatic Accidentals - C major scale in Ab", Vex.Flow.Test.Accidental.automaticAccidentals1);
      Vex.Flow.Test.runTests("Automatic Accidentals - No Accidentals Necsesary", Vex.Flow.Test.Accidental.automaticAccidentals2);
      Vex.Flow.Test.runTests("Automatic Accidentals - Multi Voice Inline", Vex.Flow.Test.Accidental.automaticAccidentalsMultiVoiceInline);
      Vex.Flow.Test.runTests("Automatic Accidentals - Multi Voice Offset", Vex.Flow.Test.Accidental.automaticAccidentalsMultiVoiceOffset);
      Vex.Flow.Test.runTests("Factory API", Vex.Flow.Test.Accidental.factoryAPI);
    },

    showNote: function(note, stave, ctx, x) {
      var modifierContext = new Vex.Flow.ModifierContext();
      note.addToModifierContext(modifierContext);
      note.setStave(stave);

      var tickContext = new Vex.Flow.TickContext();

      tickContext
        .addTickable(note)
        .preFormat()
        .setX(x)
        .setPixelsUsed(65);

      note.setContext(ctx).draw();

      Vex.Flow.Test.plotNoteWidth(ctx, note, 140);
      return note;
    },

    basic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 240);
      var stave = new Vex.Flow.Stave(10, 10, 550);
      var assert = options.assert;

      ctx.setFillStyle("#221");
      ctx.setStrokeStyle("#221");

      var notes = [
        newNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1'})
          .addAccidental(0, newAccid('b'))
          .addAccidental(1, newAccid('#')),

        newNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2'})
          .addAccidental(0, newAccid('##'))
          .addAccidental(1, newAccid('n'))
          .addAccidental(2, newAccid('bb'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('#'))
          .addAccidental(5, newAccid('n'))
          .addAccidental(6, newAccid('bb')),

        newNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16'})
          .addAccidental(0, newAccid('n'))
          .addAccidental(1, newAccid('#'))
          .addAccidental(2, newAccid('#'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('bb'))
          .addAccidental(5, newAccid('##'))
          .addAccidental(6, newAccid('#')),

        newNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1'})
          .addAccidental(0, newAccid("#"))
          .addAccidental(1, newAccid("##").setAsCautionary())
          .addAccidental(2, newAccid("#").setAsCautionary())
          .addAccidental(3, newAccid("b"))
          .addAccidental(4, newAccid("bb").setAsCautionary())
          .addAccidental(5, newAccid("b").setAsCautionary()),
      ];

      stave.setContext(ctx).draw();

      for (var i = 0; i < notes.length; ++i) {
        Vex.Flow.Test.Accidental.showNote(notes[i], stave, ctx, 30 + (i * 125));
        var accidentals = notes[i].getAccidentals();
        assert.ok(accidentals.length > 0, `Note ${i} has accidentals`);

        for (var j = 0; j < accidentals.length; ++j) {
          assert.ok(accidentals[j].width > 0, `Accidental ${j} has set width`);
        }
      }

      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 480, 140);
      assert.ok(true, "Full Accidental");
    },

    specialCases: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 240);
      ctx.setFillStyle("#221");
      ctx.setStrokeStyle("#221");
      var stave = new Vex.Flow.Stave(10, 10, 550);

      var notes = [
        newNote({ keys: ["f/4", "d/5"], duration: '1'})
          .addAccidental(0, newAccid("#"))
          .addAccidental(1, newAccid("b")),

        newNote({ keys: ["c/4", "g/4"], duration: "2"})
          .addAccidental(0, newAccid("##"))
          .addAccidental(1, newAccid("##")),

        newNote({ keys: ["b/3", "d/4", "f/4"], duration: "16"})
          .addAccidental(0, newAccid("#"))
          .addAccidental(1, newAccid("#"))
          .addAccidental(2, newAccid("##")),

        newNote({ keys: ["g/4", "a/4", "c/5", "e/5"], duration: "16"})
          .addAccidental(0, newAccid("b"))
          .addAccidental(1, newAccid("b"))
          .addAccidental(3, newAccid("n")),

        newNote({ keys: ["e/4", "g/4", "b/4", "c/5"], duration: "4"})
          .addAccidental(0, newAccid("b").setAsCautionary())
          .addAccidental(1, newAccid("b").setAsCautionary())
          .addAccidental(2, newAccid("bb"))
          .addAccidental(3, newAccid("b")),

        newNote({ keys: ["b/3", "e/4", "a/4", "d/5", "g/5"], duration: "8"})
          .addAccidental(0, newAccid("bb"))
          .addAccidental(1, newAccid("b").setAsCautionary())
          .addAccidental(2, newAccid("n").setAsCautionary())
          .addAccidental(3, newAccid("#"))
          .addAccidental(4, newAccid("n").setAsCautionary())
      ];

      stave.setContext(ctx).draw();

      for (var i = 0; i < notes.length; ++i) {
        Vex.Flow.Test.Accidental.showNote(notes[i], stave, ctx, 30 + (i * 70));
        var accidentals = notes[i].getAccidentals();
        ok(accidentals.length > 0, "Note " + i + " has accidentals");

        for (var j = 0; j < accidentals.length; ++j) {
          ok(accidentals[j].width > 0, "Accidental " + j + " has set width");
        }
      }

      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 480, 140);
      ok(true, "Full Accidental");
    },

    basicStemDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 240);
      ctx.scale(1.5, 1.5);
      ctx.setFillStyle("#221");
      ctx.setStrokeStyle("#221");

      var stave = new Vex.Flow.Stave(10, 10, 550);

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], duration: "w", stem_direction: -1})
          .addAccidental(0, newAccid("b"))
          .addAccidental(1, newAccid("#")),

        newNote({ keys: ["d/4", "e/4", "f/4", "a/4", "c/5", "e/5", "g/5"], duration: "2", stem_direction: -1})
          .addAccidental(0, newAccid("##"))
          .addAccidental(1, newAccid("n"))
          .addAccidental(2, newAccid("bb"))
          .addAccidental(3, newAccid("b"))
          .addAccidental(4, newAccid("#"))
          .addAccidental(5, newAccid("n"))
          .addAccidental(6, newAccid("bb")),

        newNote({ keys: ["f/4", "g/4", "a/4", "b/4", "c/5", "e/5", "g/5"], duration: "16", stem_direction: -1})
          .addAccidental(0, newAccid("n"))
          .addAccidental(1, newAccid("#"))
          .addAccidental(2, newAccid("#"))
          .addAccidental(3, newAccid("b"))
          .addAccidental(4, newAccid("bb"))
          .addAccidental(5, newAccid("##"))
          .addAccidental(6, newAccid("#")),
      ];

      stave.setContext(ctx).draw();

      for (var i = 0; i < notes.length; ++i) {
        Vex.Flow.Test.Accidental.showNote(notes[i], stave, ctx, 30 + (i * 125));
        var accidentals = notes[i].getAccidentals();
        ok(accidentals.length > 0, "Note " + i + " has accidentals");

        for (var j = 0; j < accidentals.length; ++j) {
          ok(accidentals[j].width > 0, "Accidental " + j + " has set width");
        }
      }

      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 350, 120);
      ok(true, "Full Accidental");
    },

    showNotes: function(note1, note2, stave, ctx, x) {
      var modifierContext = new Vex.Flow.ModifierContext();

      note1
        .setStave(stave)
        .addToModifierContext(modifierContext);

      note2
        .setStave(stave)
        .addToModifierContext(modifierContext);

      var tickContext = new Vex.Flow.TickContext();

      tickContext
        .addTickable(note1)
        .addTickable(note2)
        .preFormat()
        .setX(x)
        .setPixelsUsed(65);

      note1.setContext(ctx).draw();
      note2.setContext(ctx).draw();

      Vex.Flow.Test.plotNoteWidth(ctx, note1, 180);
      Vex.Flow.Test.plotNoteWidth(ctx, note2, 15);
    },

    multiVoice: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 460, 250);

      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new Vex.Flow.Stave(10, 40, 420);

      stave.setContext(ctx).draw();

      var note1 = newNote({ keys: ["c/4", "e/4", "a/4"], duration: "2", stem_direction: -1})
        .addAccidental(0, newAccid("b"))
        .addAccidental(1, newAccid("n"))
        .addAccidental(2, newAccid("#"))
        .setStave(stave);

      var note2 = newNote({ keys: ["d/5", "a/5", "b/5"], duration: "2", stem_direction: 1})
        .addAccidental(0, newAccid("b"))
        .addAccidental(1, newAccid("bb"))
        .addAccidental(2, newAccid("##"))
        .setStave(stave);

      Vex.Flow.Test.Accidental.showNotes(note1, note2, stave, ctx, 60);

      note1 = newNote({ keys: ["c/4", "e/4", "c/5"], duration: "2", stem_direction: -1})
        .addAccidental(0, newAccid("b"))
        .addAccidental(1, newAccid("n"))
        .addAccidental(2, newAccid("#"))
        .setStave(stave);

      note2 = newNote({ keys: ["d/5", "a/5", "b/5"], duration: '4', stem_direction: 1})
        .addAccidental(0, newAccid("b"))
        .setStave(stave);

      Vex.Flow.Test.Accidental.showNotes(note1, note2, stave, ctx, 150);

      note1 = newNote({ keys: ["d/4", "c/5", "d/5"], duration: "2", stem_direction: -1})
        .addAccidental(0, newAccid("b"))
        .addAccidental(1, newAccid("n"))
        .addAccidental(2, newAccid("#"))
        .setStave(stave);

      note2 = newNote({ keys: ["d/5", "a/5", "b/5"], duration: '4', stem_direction: 1})
        .addAccidental(0, newAccid("b"))
        .setStave(stave);

      Vex.Flow.Test.Accidental.showNotes(note1, note2, stave, ctx, 250);
      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 350, 150);
      ok(true, "Full Accidental");
    },

    microtonal: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 240);
      ctx.scale(1.0, 1.0);
      ctx.setFillStyle("#221");
      ctx.setStrokeStyle("#221");

      var stave = new Vex.Flow.Stave(10, 10, 650);

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], duration: '1'})
          .addAccidental(0, newAccid("db"))
          .addAccidental(1, newAccid("d")),

        newNote({ keys: ["d/4", "e/4", "f/4", "a/4", "c/5", "e/5", "g/5"], duration: "2"})
          .addAccidental(0, newAccid("bbs"))
          .addAccidental(1, newAccid("++"))
          .addAccidental(2, newAccid("+"))
          .addAccidental(3, newAccid("d"))
          .addAccidental(4, newAccid("db"))
          .addAccidental(5, newAccid("+"))
          .addAccidental(6, newAccid("##")),

        newNote({ keys: ["f/4", "g/4", "a/4", "b/4", "c/5", "e/5", "g/5"], duration: "16"})
          .addAccidental(0, newAccid("++"))
          .addAccidental(1, newAccid("bbs"))
          .addAccidental(2, newAccid("+"))
          .addAccidental(3, newAccid("b"))
          .addAccidental(4, newAccid("db"))
          .addAccidental(5, newAccid("##"))
          .addAccidental(6, newAccid("#")),

        newNote({ keys: ["a/3", "c/4", "e/4", "b/4", "d/5", "g/5"], duration: '1'})
          .addAccidental(0, newAccid("#"))
          .addAccidental(1, newAccid("db").setAsCautionary())
          .addAccidental(2, newAccid("bbs").setAsCautionary())
          .addAccidental(3, newAccid("b"))
          .addAccidental(4, newAccid("++").setAsCautionary())
          .addAccidental(5, newAccid("d").setAsCautionary()),

        newNote({ keys: ["f/4", "g/4", "a/4", "b/4"], duration: "16"})
          .addAccidental(0, newAccid("++-"))
          .addAccidental(1, newAccid("+-"))
          .addAccidental(2, newAccid("bs"))
          .addAccidental(3, newAccid("bss")),
      ];

      stave.setContext(ctx).draw();

      for (var i = 0; i < notes.length; ++i) {
        Vex.Flow.Test.Accidental.showNote(notes[i], stave, ctx, 30 + (i * 125));
        var accidentals = notes[i].getAccidentals();
        ok(accidentals.length > 0, "Note " + i + " has accidentals");

        for (var j = 0; j < accidentals.length; ++j) {
          ok(accidentals[j].width > 0, "Accidental " + j + " has set width");
        }
      }

      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 580, 140);
      ok(true, "Microtonal Accidental");
    },

    automaticAccidentals0: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      const { context, stave } = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 200);

      const notes = [
        { keys: ["c/4", "c/5"], duration: "4" },
        { keys: ["c#/4", "c#/5"], duration: "4" },
        { keys: ["c#/4", "c#/5"], duration: "4" },
        { keys: ["c##/4", "c##/5"], duration: "4" },
        { keys: ["c##/4", "c##/5"], duration: "4" },
        { keys: ["c/4", "c/5"], duration: "4" },
        { keys: ["cn/4", "cn/5"], duration: "4" },
        { keys: ["cbb/4", "cbb/5"], duration: "4" },
        { keys: ["cbb/4", "cbb/5"], duration: "4" },
        { keys: ["cb/4", "cb/5"], duration: "4" },
        { keys: ["cb/4", "cb/5"], duration: "4" },
        { keys: ["c/4", "c/5"], duration: "4" },
      ].map(newNote).map(setStave(stave));

      const voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes);

      Vex.Flow.Accidental.applyAccidentals([voice], "C");

      const formatter = new Vex.Flow.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      stave.setContext(context).draw();
      voice.draw(context);
      ok(true);
    },

    automaticAccidentals1: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      var { stave, context } = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 150);
      context.clear();
      stave.addKeySignature("Ab");

      var notes = [
        { keys: ["c/4"], duration: "4" },
        { keys: ["d/4"], duration: "4" },
        { keys: ["e/4"], duration: "4" },
        { keys: ["f/4"], duration: "4" },
        { keys: ["g/4"], duration: "4" },
        { keys: ["a/4"], duration: "4" },
        { keys: ["b/4"], duration: "4" },
        { keys: ["c/5"], duration: "4" },
      ].map(newNote).map(setStave(stave));

      var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes);

      Vex.Flow.Accidental.applyAccidentals([voice], "Ab");

      var formatter = new Vex.Flow.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      stave.setContext(context).draw();
      voice.draw(context);

      ok(true);
    },

    automaticAccidentals2: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var { context, stave } = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 150);
      context.clear();
      stave.addKeySignature("A");

      var notes = [
        { keys: ["a/4"], duration: "4" },
        { keys: ["b/4"], duration: "4" },
        { keys: ["c#/5"], duration: "4" },
        { keys: ["d/5"], duration: "4" },
        { keys: ["e/5"], duration: "4" },
        { keys: ["f#/5"], duration: "4" },
        { keys: ["g#/5"], duration: "4" },
        { keys: ["a/5"], duration: "4" },
      ].map(newNote).map(setStave(stave));

      var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes);

      Vex.Flow.Accidental.applyAccidentals([voice], "A");

      var formatter = new Vex.Flow.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      stave.setContext(context).draw();
      voice.draw(context);
      ok(true);
    },

    automaticAccidentalsMultiVoiceInline: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var { context, stave } = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 150);
      context.clear();
      stave.addKeySignature("Ab");
      stave.draw();

      var notes0 = [
        newNote({ keys: ["c/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["d/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["e/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["f/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["g/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["a/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["c/5"], duration: "4", stem_direction: -1})
      ].map(setStave(stave));

      var notes1 = [
        newNote({ keys: ["c/5"], duration: "4"}),
        newNote({ keys: ["d/5"], duration: "4"}),
        newNote({ keys: ["e/5"], duration: "4"}),
        newNote({ keys: ["f/5"], duration: "4"}),
        newNote({ keys: ["g/5"], duration: "4"}),
        newNote({ keys: ["a/5"], duration: "4"}),
        newNote({ keys: ["b/5"], duration: "4"}),
        newNote({ keys: ["c/6"], duration: "4"})
      ].map(setStave(stave));

      var voice0 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes0);

      var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes1);

      // Ab Major
      Vex.Flow.Accidental.applyAccidentals([voice0, voice1], "Ab");

      equal(hasAccidental(notes0[0]), false);
      equal(hasAccidental(notes0[1]), true);
      equal(hasAccidental(notes0[2]), true);
      equal(hasAccidental(notes0[3]), false);
      equal(hasAccidental(notes0[4]), false);
      equal(hasAccidental(notes0[5]), true);
      equal(hasAccidental(notes0[6]), true);
      equal(hasAccidental(notes0[7]), false);

      equal(hasAccidental(notes1[0]), false);
      equal(hasAccidental(notes1[1]), true);
      equal(hasAccidental(notes1[2]), true);
      equal(hasAccidental(notes1[3]), false);
      equal(hasAccidental(notes1[4]), false);
      equal(hasAccidental(notes1[5]), true);
      equal(hasAccidental(notes1[6]), true);
      equal(hasAccidental(notes1[7]), false);

      var formatter = new Vex.Flow.Formatter()
        .joinVoices([voice0, voice1])
        .formatToStave([voice0, voice1], stave);

      voice0.draw(context);
      voice1.draw(context);

      ok(true);
    },

    automaticAccidentalsMultiVoiceOffset: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var { context, stave } = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 150);
      context.clear();
      stave.addKeySignature("Cb");

      var notes0 = [
        { keys: ["c/4"], duration: "4", stem_direction: -1 },
        { keys: ["d/4"], duration: "4", stem_direction: -1 },
        { keys: ["e/4"], duration: "4", stem_direction: -1 },
        { keys: ["f/4"], duration: "4", stem_direction: -1 },
        { keys: ["g/4"], duration: "4", stem_direction: -1 },
        { keys: ["a/4"], duration: "4", stem_direction: -1 },
        { keys: ["b/4"], duration: "4", stem_direction: -1 },
        { keys: ["c/5"], duration: "4", stem_direction: -1 },
      ].map(newNote).map(setStave(stave));

      var notes1 = [
        { keys: ["c/5"], duration: "8" },
        { keys: ["c/5"], duration: "4" },
        { keys: ["d/5"], duration: "4" },
        { keys: ["e/5"], duration: "4" },
        { keys: ["f/5"], duration: "4" },
        { keys: ["g/5"], duration: "4" },
        { keys: ["a/5"], duration: "4" },
        { keys: ["b/5"], duration: "4" },
        { keys: ["c/6"], duration: "4" },
      ].map(newNote).map(setStave(stave));;

      var voice0 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes0);

      var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes1);

      // Cb Major (All flats)
      Vex.Flow.Accidental.applyAccidentals([voice0, voice1], "Cb");

      equal(hasAccidental(notes0[0]), true);
      equal(hasAccidental(notes0[1]), true);
      equal(hasAccidental(notes0[2]), true);
      equal(hasAccidental(notes0[3]), true);
      equal(hasAccidental(notes0[4]), true);
      equal(hasAccidental(notes0[5]), true);
      equal(hasAccidental(notes0[6]), true);
      equal(hasAccidental(notes0[7]), false, "Natural Remembered");

      equal(hasAccidental(notes1[0]), true);
      equal(hasAccidental(notes1[1]), false);
      equal(hasAccidental(notes1[2]), false);
      equal(hasAccidental(notes1[3]), false);
      equal(hasAccidental(notes1[4]), false);
      equal(hasAccidental(notes1[5]), false);
      equal(hasAccidental(notes1[6]), false);
      equal(hasAccidental(notes1[7]), false);

      var formatter = new Vex.Flow.Formatter()
        .joinVoices([voice0, voice1])
        .formatToStave([voice0, voice1], stave);

      stave.setContext(context).draw()
      voice0.draw(context);
      voice1.draw(context);
      ok(true);
    },

    autoAccidentalWorking: function(options, contextBuilder) {
      var notes = [
        newNote({ keys: ["bb/4"], duration: "4"}),
        newNote({ keys: ["bb/4"], duration: "4"}),
        newNote({ keys: ["g#/4"], duration: "4"}),
        newNote({ keys: ["g/4"], duration: "4"}),
        newNote({ keys: ["b/4"], duration: "4"}),
        newNote({ keys: ["b/4"], duration: "4"}),
        newNote({ keys: ["a#/4"], duration: "4"}),
        newNote({ keys: ["g#/4"], duration: "4"}),
      ];

      var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes);

      // F Major (Bb)
      Vex.Flow.Accidental.applyAccidentals([voice], "F");

      equal(hasAccidental(notes[0]), false, "No flat because of key signature");
      equal(hasAccidental(notes[1]), false, "No flat because of key signature");
      equal(hasAccidental(notes[2]), true, "Added a sharp");
      equal(hasAccidental(notes[3]), true, "Back to natural");
      equal(hasAccidental(notes[4]), true, "Back to natural");
      equal(hasAccidental(notes[5]), false, "Natural remembered");
      equal(hasAccidental(notes[6]), true, "Added sharp");
      equal(hasAccidental(notes[7]), true, "Added sharp");

      notes = [
        newNote({ keys: ["e#/4"], duration: "4"}),
        newNote({ keys: ["cb/4"], duration: "4"}),
        newNote({ keys: ["fb/4"], duration: "4"}),
        newNote({ keys: ["b#/4"], duration: "4"}),
        newNote({ keys: ["b#/4"], duration: "4"}),
        newNote({ keys: ["cb/5"], duration: "4"}),
        newNote({ keys: ["fb/5"], duration: "4"}),
        newNote({ keys: ["e#/4"], duration: "4"}),
      ];

      voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes);

      // A Major (F#,G#,C#)
      Vex.Flow.Accidental.applyAccidentals([voice], "A");

      equal(hasAccidental(notes[0]), true, "Added sharp");
      equal(hasAccidental(notes[1]), true, "Added flat");
      equal(hasAccidental(notes[2]), true, "Added flat");
      equal(hasAccidental(notes[3]), true, "Added sharp");
      equal(hasAccidental(notes[4]), false, "Sharp remembered");
      equal(hasAccidental(notes[5]), false, "Flat remembered");
      equal(hasAccidental(notes[6]), false, "Flat remembered");
      equal(hasAccidental(notes[7]), false, "sharp remembered");

      notes = [
        newNote({ keys: ["c/4"], duration: "4"}),
        newNote({ keys: ["cb/4"], duration: "4"}),
        newNote({ keys: ["cb/4"], duration: "4"}),
        newNote({ keys: ["c#/4"], duration: "4"}),
        newNote({ keys: ["c#/4"], duration: "4"}),
        newNote({ keys: ["cbb/4"], duration: "4"}),
        newNote({ keys: ["cbb/4"], duration: "4"}),
        newNote({ keys: ["c##/4"], duration: "4"}),
        newNote({ keys: ["c##/4"], duration: "4"}),
        newNote({ keys: ["c/4"], duration: "4"}),
        newNote({ keys: ["c/4"], duration: "4"}),
      ];

      voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes);

      // C Major (no sharps/flats)
      Vex.Flow.Accidental.applyAccidentals([voice], "C");

      equal(hasAccidental(notes[0]), false, "No accidental");
      equal(hasAccidental(notes[1]), true, "Added flat");
      equal(hasAccidental(notes[2]), false, "Flat remembered");
      equal(hasAccidental(notes[3]), true, "Sharp added");
      equal(hasAccidental(notes[4]), false, "Sharp remembered");
      equal(hasAccidental(notes[5]), true, "Added doubled flat");
      equal(hasAccidental(notes[6]), false, "Double flat remembered");
      equal(hasAccidental(notes[7]), true, "Added double sharp");
      equal(hasAccidental(notes[8]), false, "Double sharp rememberd");
      equal(hasAccidental(notes[9]), true, "Added natural");
      equal(hasAccidental(notes[10]), false, "Natural remembered");
    },

    factoryAPI: function(options) {
      var vf = VF.Test.makeFactory(options, 700, 240);
      var assert = options.assert;

      var stave = vf.Stave({x: 10, y: 10, width: 550});

      function newNote(note_struct) { return vf.StaveNote(note_struct); }
      function newAcc(type) { return vf.Accidental({type: type}); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], duration: "w"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),

        newNote({ keys: ["d/4", "e/4", "f/4", "a/4", "c/5", "e/5", "g/5"],
            duration: "h"}).
          addAccidental(0, newAcc("##")).
          addAccidental(1, newAcc("n")).
          addAccidental(2, newAcc("bb")).
          addAccidental(3, newAcc("b")).
          addAccidental(4, newAcc("#")).
          addAccidental(5, newAcc("n")).
          addAccidental(6, newAcc("bb")),

        newNote({ keys: ["f/4", "g/4", "a/4", "b/4", "c/5", "e/5", "g/5"],
            duration: "16"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#")).
          addAccidental(2, newAcc("#")).
          addAccidental(3, newAcc("b")).
          addAccidental(4, newAcc("bb")).
          addAccidental(5, newAcc("##")).
          addAccidental(6, newAcc("#")),

        newNote({ keys: ["a/3", "c/4", "e/4", "b/4", "d/5", "g/5"], duration: "w"}).
          addAccidental(0, newAcc("#")).
          addAccidental(1, newAcc("##").setAsCautionary()).
          addAccidental(2, newAcc("#").setAsCautionary()).
          addAccidental(3, newAcc("b")).
          addAccidental(4, newAcc("bb").setAsCautionary()).
          addAccidental(5, newAcc("b").setAsCautionary()),
      ];

      VF.Formatter.SimpleFormat(notes);

      notes.forEach(function(n, i) {
        assert.ok(n.getAccidentals().length > 0, "Note " + i + " has accidentals");
        n.getAccidentals().forEach(function(a, i) {
          assert.ok(a.width > 0, "Accidental " + i + " has set width");
        })
      }) 

      vf.draw();
      assert.ok(true, "Factory API");
    }
  };

  return Accidental;
})();
