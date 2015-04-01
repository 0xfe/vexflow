/**
 * VexFlow - Text Note Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.TextNote = (function() {
  var TextNote = {
    Start: function() {
      module("TextNote");
      Vex.Flow.Test.runTests("TextNote Formatting",
          Vex.Flow.Test.TextNote.formatTextNotes);
      Vex.Flow.Test.runTests("TextNote Superscript and Subscript",
          Vex.Flow.Test.TextNote.superscriptAndSubscript);
      Vex.Flow.Test.runTests("TextNote Formatting With Glyphs 0",
          Vex.Flow.Test.TextNote.formatTextGlyphs0);
      Vex.Flow.Test.runTests("TextNote Formatting With Glyphs 1",
          Vex.Flow.Test.TextNote.formatTextGlyphs1);
      Vex.Flow.Test.runTests("Crescendo",
          Vex.Flow.Test.TextNote.crescendo);
      Vex.Flow.Test.runTests("Text Dynamics",
          Vex.Flow.Test.TextNote.textDynamics);
    },

    renderNotes: function(notes1, notes2, ctx, stave, justify) {
      var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
      var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

      notes1.forEach(function(note) {note.setContext(ctx)});
      notes2.forEach(function(note) {note.setContext(ctx)});

      voice1.addTickables(notes1);
      voice2.addTickables(notes2);

      new Vex.Flow.Formatter().joinVoices([voice1, voice2]).
        formatToStave([voice1, voice2], stave);

      voice1.draw(ctx, stave);
      voice2.draw(ctx, stave);
    },

    formatTextNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 150);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new Vex.Flow.Stave(10, 10, 400);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new Vex.Flow.TextNote(text_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["f/4", "a/4", "c/4"], stem_direction: -1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newTextNote({text: "Center Justification",  duration: "h"}).
          setJustification(Vex.Flow.TextNote.Justification.CENTER),
        newTextNote({text: "Left Line 1", duration: "q"}).setLine(1),
        newTextNote({text: "Right", duration: "q"}).
          setJustification(Vex.Flow.TextNote.Justification.RIGHT),
      ];

      Vex.Flow.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    superscriptAndSubscript: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new Vex.Flow.Stave(10, 10, 500);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new Vex.Flow.TextNote(text_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4", "a/4", "c/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newTextNote({text: Vex.Flow.unicode["flat"] + "I", superscript: "+5",  duration: "8"}),
        newTextNote({text: "D" + Vex.Flow.unicode["sharp"] +"/F",  duration: "4d", superscript: "sus2"}),
        newTextNote({text: "ii", superscript: "6", subscript: "4",  duration: "8"}),
        newTextNote({text: "C" , superscript: Vex.Flow.unicode["triangle"] + "7", subscript: "", duration: "8"}),
        newTextNote({text: "vii", superscript: Vex.Flow.unicode["o-with-slash"] + "7", duration: "8"}),
        newTextNote({text: "V",superscript: "7",   duration: "8"}),
      ];

      notes2.forEach(function(note) {
        note.setLine(13);
        note.font = {
          family: "Serif",
          size: 15,
          weight: ""
        };
        note.setJustification(Vex.Flow.TextNote.Justification.LEFT);
      });

      Vex.Flow.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    formatTextGlyphs0: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new Vex.Flow.Stave(10, 20, 600);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new Vex.Flow.TextNote(text_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4", "a/4", "c/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4", "a/4", "c/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4", "a/4", "c/4"], stem_direction: -1, duration: "8"})
      ];

      var notes2 = [
        newTextNote({text: "Center",  duration: "8"}).
          setJustification(Vex.Flow.TextNote.Justification.CENTER),
        newTextNote({glyph: "f", duration: "8"}),
        newTextNote({glyph: "p", duration: "8"}),
        newTextNote({glyph: "m", duration: "8"}),
        newTextNote({glyph: "z", duration: "8"}),

        newTextNote({glyph: "mordent_upper", duration: "16"}),
        newTextNote({glyph: "mordent_lower", duration: "16"}),
        newTextNote({glyph: "segno", duration: "8"}),
        newTextNote({glyph: "coda", duration: "8"}),
      ];

      Vex.Flow.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    formatTextGlyphs1: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new Vex.Flow.Stave(10, 20, 600);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new Vex.Flow.TextNote(text_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4", "a/4", "c/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4", "a/4", "c/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4", "a/4", "c/4"], stem_direction: -1, duration: "8"})
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
          setJustification(Vex.Flow.TextNote.Justification.CENTER),
      ];

      Vex.Flow.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    crescendo: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new Vex.Flow.Stave(10, 20, 500);
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        new Vex.Flow.TextNote({glyph: "p", duration: "16"}).setContext(ctx),
        new Vex.Flow.Crescendo({duration: "4d"}).setLine(0).setHeight(25),
        new Vex.Flow.TextNote({glyph: "f", duration: "16"}).setContext(ctx),
        new Vex.Flow.Crescendo({duration: "4"}).setLine(5),
        new Vex.Flow.Crescendo({duration: "4"}).setLine(10).setDecrescendo(true).setHeight(5)
      ];

      var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var formatter = new Vex.Flow.Formatter().formatToStave([voice], stave);

      notes.forEach(function(note) {
        note.setStave(stave);
        note.setContext(ctx).draw();
      });

      ok(true);
    },

    textDynamics: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new Vex.Flow.Stave(10, 20, 550);
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        new Vex.Flow.TextDynamics({ text: "sfz", duration: "4" }),
        new Vex.Flow.TextDynamics({ text: "rfz", duration: "4" }),
        new Vex.Flow.TextDynamics({ text: "mp", duration: "4" }),
        new Vex.Flow.TextDynamics({ text: "ppp", duration: "4" }),
        new Vex.Flow.TextDynamics({ text: "fff", duration: "4" }),
        new Vex.Flow.TextDynamics({ text: "mf", duration: "4" }),
        new Vex.Flow.TextDynamics({ text: "sff", duration: "4" })
      ];

      var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var formatter = new Vex.Flow.Formatter().formatToStave([voice], stave); 

      notes.forEach(function(note) {
        note.setStave(stave);
        note.setContext(ctx).draw();
      });

      ok(true);
    }
  }

  return TextNote;
})()
