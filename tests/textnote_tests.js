/**
 * VexFlow - Text Note Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.TextNote = (function() {
  var TextNote = {
    Start: function() {
      module("TextNote");
      Vex.Flow.Test.runTest("TextNote Formatting",
          Vex.Flow.Test.TextNote.formatTextNotes);
      Vex.Flow.Test.runTest("TextNote Formatting With Glyphs",
          Vex.Flow.Test.TextNote.formatTextGlyphs);
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

    formatTextNotes: function(options) {
      Vex.Flow.Test.resizeCanvas(options.canvas_sel, 400, 150);
      var ctx = Vex.Flow.Renderer.getCanvasContext(options.canvas_sel);
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

    formatTextGlyphs: function(options) {
      Vex.Flow.Test.resizeCanvas(options.canvas_sel, 600, 180);
      var ctx = Vex.Flow.Renderer.getCanvasContext(options.canvas_sel);
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

        newTextNote({glyph: "mordent", duration: "8"}),
        newTextNote({glyph: "segno", duration: "8"}),
        newTextNote({glyph: "coda", duration: "8"}),
        newTextNote({glyph: "tr", duration: "8", smooth: true}).
          setJustification(Vex.Flow.TextNote.Justification.CENTER),
      ];

      Vex.Flow.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    }
  }

  return TextNote;
})()
