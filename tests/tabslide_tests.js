/**
 * VexFlow - TabSlide Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabSlide = (function() {
  var TabSlide = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("TabSlide");
      runTests("Simple TabSlide", TabSlide.simple);
      runTests("Slide Up", TabSlide.slideUp);
      runTests("Slide Down", TabSlide.slideDown);
    },

    tieNotes: function(notes, indices, stave, ctx) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 100);
      voice.draw(ctx, stave);

      var tie = new VF.TabSlide({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: indices,
        last_indices: indices,
      }, VF.TabSlide.SLIDE_UP);

      tie.setContext(ctx);
      tie.draw();
    },

    setupContext: function(options, x, y) {
      var ctx = options.contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, x || 350).addTabGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },


    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.TabSlide.setupContext(options);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      VF.Test.TabSlide.tieNotes([
        newNote({ positions: [{str:4, fret:4}], duration: "h"}),
        newNote({ positions: [{str:4, fret:6}], duration: "h"})
      ], [0], c.stave, c.context);
      ok(true, "Simple Test");
    },

    multiTest: function(options, factory) {
      var c = VF.Test.TabSlide.setupContext(options, 440, 100);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var notes = [
        newNote({ positions: [{str:4, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:4}, {str:5, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:6}, {str:5, fret:6}], duration: "8"}),
        newNote({ positions: [{str:2, fret:14}], duration: "8"}),
        newNote({ positions: [{str:2, fret:16}], duration: "8"}),
        newNote({ positions: [{str:2, fret:14}, {str:3, fret:14}], duration: "8"}),
        newNote({ positions: [{str:2, fret:16}, {str:3, fret:16}], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      voice.draw(c.context, c.stave);

      factory({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, "Single note");

      factory({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, "Chord");

      factory({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, "Single note high-fret");

      factory({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, "Chord high-fret");
    },

    slideUp: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabSlide.multiTest(options, VF.TabSlide.createSlideUp);
    },

    slideDown: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabSlide.multiTest(options, VF.TabSlide.createSlideDown);
    }
  };

  return TabSlide;
})();
