/**
 * VexFlow - TabNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabNote = (function() {
  var TabNote = {
    Start: function() {
      QUnit.module("TabNote");
      test("Tick", VF.Test.TabNote.ticks);
      test("TabStave Line", VF.Test.TabNote.tabStaveLine);
      test("Width", VF.Test.TabNote.width);
      test("TickContext", VF.Test.TabNote.tickContext);

      var runTests = VF.Test.runTests;
      runTests("TabNote Draw", TabNote.draw);
      runTests("TabNote Stems Up", TabNote.drawStemsUp);
      runTests("TabNote Stems Down", TabNote.drawStemsDown);
      runTests("TabNote Stems Up Through Stave", TabNote.drawStemsUpThrough);
      runTests("TabNote Stems Down Through Stave", TabNote.drawStemsDownThrough);
      runTests("TabNote Stems with Dots", TabNote.drawStemsDotted);
    },

    ticks: function() {
      var BEAT = 1 * VF.RESOLUTION / 4;

      var note = new VF.TabNote(
          { positions: [{str: 6, fret: 6 }], duration: "w"});
      equal(note.getTicks().value(), BEAT * 4, "Whole note has 4 beats");

      note = new VF.TabNote(
          { positions: [{str: 3, fret: 4 }], duration: "q"});
      equal(note.getTicks().value(), BEAT, "Quarter note has 1 beat");
    },

    tabStaveLine: function() {
      var note = new VF.TabNote(
          { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});
      var positions = note.getPositions();
      equal(positions[0].str, 6, "String 6, Fret 6");
      equal(positions[0].fret, 6, "String 6, Fret 6");
      equal(positions[1].str, 4, "String 4, Fret 5");
      equal(positions[1].fret, 5, "String 4, Fret 5");

      var stave = new VF.Stave(10, 10, 300);
      note.setStave(stave);

      var ys = note.getYs();
      equal(ys.length, 2, "Chord should be rendered on two lines");
      equal(ys[0], 99, "Line for String 6, Fret 6");
      equal(ys[1], 79, "Line for String 4, Fret 5");
    },

    width: function() {
      expect(1);
      var note = new VF.TabNote(
          { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});

      try {
        var width = note.getWidth();
      } catch (e) {
        equal(e.code, "UnformattedNote",
            "Unformatted note should have no width");
      }
    },

    tickContext: function() {
      var note = new VF.TabNote(
          { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});
      var tickContext = new VF.TickContext();
      tickContext.addTickable(note);
      tickContext.preFormat();
      tickContext.setX(10);
      tickContext.setPadding(0);

      equal(tickContext.getWidth(), 6);
    },

    showNote: function(tab_struct, stave, ctx, x) {
      var note = new VF.TabNote(tab_struct);
      var tickContext = new VF.TickContext();
      tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(20);
      note.setContext(ctx).setStave(stave);
      note.draw();
      return note;
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 140);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.TabNote.showNote;
      var notes = [
        { positions: [{str: 6, fret: 6 }], duration: "q"},
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "q"},
        { positions: [{str: 2, fret: "x" }, {str: 5, fret: 15}], duration: "q"},
        { positions: [{str: 2, fret: "x" }, {str: 5, fret: 5}], duration: "q"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "q"},
        { positions: [{str: 6, fret: 0},
                      {str: 5, fret: 5},
                      {str: 4, fret: 5},
                      {str: 3, fret: 4},
                      {str: 2, fret: 3},
                      {str: 1, fret: 0}],
                      duration: "q"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "q"}
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, "Note " + i + " has X value");
        ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
      }
    },

    drawStemsUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 30, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"}
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
      voice.draw(ctx, stave);
      ok (true, 'TabNotes successfully drawn');
    },

    drawStemsDown: function(options, contextBuilder) {
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
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'All objects have been drawn');
    },

    drawStemsUpThrough: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 30, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_stem_through_stave = true;
        return tabNote;
      });

      ctx.setFont("sans-serif", 10, "bold");
      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'TabNotes successfully drawn');
    },

    drawStemsDownThrough: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 250);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550,{num_lines:8});
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}, {str: 6, fret: 10}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}, {str: 5, fret: 5}, {str: 7, fret: 5}], duration: "128"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_stem_through_stave = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      ctx.setFont("Arial", 10, "bold");

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'All objects have been drawn');
    },

    drawStemsDotted: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4d"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "4dd", stem_direction: -1 },
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16", stem_direction: -1},
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec, true);
        return tabNote;
      });

      notes[0].addDot();
      notes[2].addDot();
      notes[2].addDot();

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'TabNotes successfully drawn');
    }
  };

  return TabNote;
})();