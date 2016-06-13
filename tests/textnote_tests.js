/**
 * VexFlow - Text Note Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TextNote = (function() {
  var TextNote = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module("TextNote");
      runTests("TextNote Formatting", TextNote.formatTextNotes);
      runTests("TextNote Superscript and Subscript", TextNote.superscriptAndSubscript);
      runTests("TextNote Formatting With Glyphs 0", TextNote.formatTextGlyphs0);
      runTests("TextNote Formatting With Glyphs 1", TextNote.formatTextGlyphs1);
      runTests("Crescendo", TextNote.crescendo);
      runTests("Text Dynamics", TextNote.textDynamics);
    },

    renderNotes: function(notes1, notes2, ctx, stave, justify) {
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      notes1.forEach(function(note) {note.setContext(ctx)});
      notes2.forEach(function(note) {note.setContext(ctx)});

      voice1.addTickables(notes1);
      voice2.addTickables(notes2);

      new VF.Formatter().joinVoices([voice1, voice2]).
        formatToStave([voice1, voice2], stave);

      voice1.draw(ctx, stave);
      voice2.draw(ctx, stave);
    },

    formatTextNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 150);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 400);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new VF.TextNote(text_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newTextNote({text: "Center Justification",  duration: "h"}).
          setJustification(VF.TextNote.Justification.CENTER),
        newTextNote({text: "Left Line 1", duration: "q"}).setLine(1),
        newTextNote({text: "Right", duration: "q"}).
          setJustification(VF.TextNote.Justification.RIGHT),
      ];

      VF.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    superscriptAndSubscript: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 500);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new VF.TextNote(text_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newTextNote({text: VF.unicode["flat"] + "I", superscript: "+5",  duration: "8"}),
        newTextNote({text: "D" + VF.unicode["sharp"] +"/F",  duration: "4d", superscript: "sus2"}),
        newTextNote({text: "ii", superscript: "6", subscript: "4",  duration: "8"}),
        newTextNote({text: "C" , superscript: VF.unicode["triangle"] + "7", subscript: "", duration: "8"}),
        newTextNote({text: "vii", superscript: VF.unicode["o-with-slash"] + "7", duration: "8"}),
        newTextNote({text: "V",superscript: "7",   duration: "8"}),
      ];

      notes2.forEach(function(note) {
        note.setLine(13);
        note.font = {
          family: "Serif",
          size: 15,
          weight: ""
        };
        note.setJustification(VF.TextNote.Justification.LEFT);
      });

      VF.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    formatTextGlyphs0: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 20, 600);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new VF.TextNote(text_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"})
      ];

      var notes2 = [
        newTextNote({text: "Center",  duration: "8"}).
          setJustification(VF.TextNote.Justification.CENTER),
        newTextNote({glyph: "f", duration: "8"}),
        newTextNote({glyph: "p", duration: "8"}),
        newTextNote({glyph: "m", duration: "8"}),
        newTextNote({glyph: "z", duration: "8"}),

        newTextNote({glyph: "mordent_upper", duration: "16"}),
        newTextNote({glyph: "mordent_lower", duration: "16"}),
        newTextNote({glyph: "segno", duration: "8"}),
        newTextNote({glyph: "coda", duration: "8"}),
      ];

      VF.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    formatTextGlyphs1: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 20, 600);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new VF.TextNote(text_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"})
      ];

      var notes2 = [
        newTextNote({glyph: "turn",  duration: "16"}),
        newTextNote({glyph: "turn_inverted",  duration: "16"}),
        newTextNote({glyph: "pedal_open", duration: "8"}).setLine(10),
        newTextNote({glyph: "pedal_close", duration: "8"}).setLine(10),
        newTextNote({glyph: "caesura_curved", duration: "8"}).setLine(3),
        newTextNote({glyph: "caesura_straight", duration: "8"}).setLine(3),
        newTextNote({glyph: "breath", duration: "8"}).setLine(2),
        newTextNote({glyph: "tick", duration: "8"}).setLine(3),
      newTextNote({glyph: "tr", duration: "8", smooth: true}).
          setJustification(VF.TextNote.Justification.CENTER),
      ];

      VF.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    crescendo: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 20, 500);
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        new VF.TextNote({glyph: "p", duration: "16"}).setContext(ctx),
        new VF.Crescendo({duration: "4d"}).setLine(0).setHeight(25),
        new VF.TextNote({glyph: "f", duration: "16"}).setContext(ctx),
        new VF.Crescendo({duration: "4"}).setLine(5),
        new VF.Crescendo({duration: "4"}).setLine(10).setDecrescendo(true).setHeight(5)
      ];

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().formatToStave([voice], stave);

      notes.forEach(function(note) {
        note.setStave(stave);
        note.setContext(ctx).draw();
      });

      ok(true);
    },

    textDynamics: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 20, 550);
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        new VF.TextDynamics({ text: "sfz", duration: "4" }),
        new VF.TextDynamics({ text: "rfz", duration: "4" }),
        new VF.TextDynamics({ text: "mp", duration: "4" }),
        new VF.TextDynamics({ text: "ppp", duration: "4" }),
        new VF.TextDynamics({ text: "fff", duration: "4" }),
        new VF.TextDynamics({ text: "mf", duration: "4" }),
        new VF.TextDynamics({ text: "sff", duration: "4" })
      ];

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().formatToStave([voice], stave);

      notes.forEach(function(note) {
        note.setStave(stave);
        note.setContext(ctx).draw();
      });

      ok(true);
    }
  }

  return TextNote;
})();