/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Formatter = (function() {
  var runTests = VF.Test.runTests;

  var Formatter = {
    Start: function() {
      QUnit.module("Formatter");
      test("TickContext Building", Formatter.buildTickContexts);
      runTests("StaveNote Formatting", Formatter.formatStaveNotes);
      runTests("StaveNote Justification", Formatter.justifyStaveNotes);
      runTests("Notes with Tab", Formatter.notesWithTab);
      runTests("Format Multiple Staves - No Justification", Formatter.multiStaves, {justify: 0});
      runTests("Format Multiple Staves - Justified", Formatter.multiStaves, {justify: 168});
    },

    buildTickContexts: function() {
      function createTickable() {
        return new VF.Test.MockTickable();
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables1 = [
        createTickable().setTicks(BEAT).setWidth(10),
        createTickable().setTicks(BEAT * 2).setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30)
      ];

      var tickables2 = [
        createTickable().setTicks(BEAT * 2).setWidth(10),
        createTickable().setTicks(BEAT).setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30)
      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      voice1.addTickables(tickables1);
      voice2.addTickables(tickables2);

      var formatter = new VF.Formatter();
      var tContexts = formatter.createTickContexts([voice1, voice2]);

      equal(tContexts.list.length, 4, "Voices should have four tick contexts");

      // TODO: add this after pull request #68 is merged to master
      // throws(
      //   function() { formatter.getMinTotalWidth(); },
      //   Vex.RERR,
      //   "Expected to throw exception"
      // );

      ok(formatter.preCalculateMinTotalWidth([voice1, voice2]),
          'Successfully runs preCalculateMinTotalWidth');
      equal(formatter.getMinTotalWidth(), 104,
          "Get minimum total width without passing voices");

      formatter.preFormat();
      equal(formatter.getMinTotalWidth(), 104, "Minimum total width");

      equal(tickables1[0].getX(), tickables2[0].getX(),
          "First notes of both voices have the same X");
      equal(tickables1[2].getX(), tickables2[2].getX(),
          "Last notes of both voices have the same X");
      ok(tickables1[1].getX() < tickables2[1].getX(),
          "Second note of voice 2 is to the right of the second note of voice 1");
    },

    renderNotes: function(
        notes1, notes2, ctx, stave, justify) {
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      voice1.addTickables(notes1);
      voice2.addTickables(notes2);

      new VF.Formatter().joinVoices([voice1, voice2]).
        format([voice1, voice2], justify);

      voice1.draw(ctx, stave);
      voice2.draw(ctx, stave);
    },

    formatStaveNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 250);
      ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 30, 500);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
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
        newNote({ keys: ["c/5", "e/5", "a/5"], stem_direction: 1,  duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/5", "e/5", "f/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["c/5", "f/5", "a/5"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      VF.Test.Formatter.renderNotes(notes1, notes2, ctx, stave);

      notes1.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 180);
      });

      notes2.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 15);
      });

      VF.Test.plotLegendForNoteWidth(ctx, 300, 180);

      ok(true);
    },

    getNotes: function() {
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("bb")).
          addAccidental(1, newAcc("n")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newNote({ keys: ["b/4", "e/5", "a/5"], stem_direction: 1,  duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/5", "e/5", "f/5"], stem_direction: 1, duration: "h"}),
        newNote({ keys: ["c/5", "f/5", "a/5"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("##")).
          addAccidental(1, newAcc("b"))
      ];

      return [notes1, notes2];
    },

    justifyStaveNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 420, 580);
      ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      // Get test voices.
      var notes = VF.Test.Formatter.getNotes();

      var stave = new VF.Stave(10, 30, 400).addTrebleGlyph().
        setContext(ctx).draw();
      VF.Test.Formatter.renderNotes(notes[0], notes[1], ctx, stave);
      notes[0].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 170);});
      notes[1].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 15);});
      ok(true);

      var stave2 = new VF.Stave(10, 220, 400).addTrebleGlyph().
        setContext(ctx).draw();
      VF.Test.Formatter.renderNotes(notes[0], notes[1], ctx, stave2, 300);
      ok(true);
      notes[0].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 350);});
      notes[1].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 200);});

      var stave3 = new VF.Stave(10, 410, 400).addTrebleGlyph().
        setContext(ctx).draw();
      VF.Test.Formatter.renderNotes(notes[0], notes[1], ctx, stave3, 400);
      notes[0].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 550);});
      notes[1].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 390);});

      ok(true);
    },

    getTabNotes: function() {
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTabNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "h"}).
          addAccidental(0, newAcc("#")),
        newNote({ keys: ["c/4", "d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("#"))
      ];

      var tabs1 = [
        newTabNote({ positions: [{str: 3, fret: 6}], duration: "h"}).
          addModifier(new VF.Bend("Full"), 0),
        newTabNote({ positions: [{str: 2, fret: 3},
                                 {str: 3, fret: 5}], duration: "8"}).
          addModifier(new VF.Bend("Unison"), 1),
        newTabNote({ positions: [{str: 3, fret: 7}], duration: "8"}),
        newTabNote({ positions: [{str: 3, fret: 6},
                                 {str: 4, fret: 7},
                                 {str: 2, fret: 5}], duration: "q"})

      ];

      return { notes: notes1, tabs: tabs1 }
    },

    renderNotesWithTab: function(notes, ctx, staves, justify) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      var tabVoice = new VF.Voice(VF.Test.TIME4_4);

      voice.addTickables(notes.notes);
      tabVoice.addTickables(notes.tabs);

      new VF.Formatter().
        joinVoices([voice]).joinVoices([tabVoice]).
        format([voice, tabVoice], justify);

      voice.draw(ctx, staves.notes);
      tabVoice.draw(ctx, staves.tabs);
    },

    notesWithTab: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 420, 400);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";

      // Get test voices.
      var notes = VF.Test.Formatter.getTabNotes();
      var stave = new VF.Stave(10, 10, 400).addTrebleGlyph().
        setContext(ctx).draw();
      var tabstave = new VF.TabStave(10, 100, 400).addTabGlyph().
        setNoteStartX(stave.getNoteStartX()).setContext(ctx).draw();

      VF.Test.Formatter.renderNotesWithTab(notes, ctx,
          { notes: stave, tabs: tabstave });
      ok(true);

      var stave2 = new VF.Stave(10, 200, 400).addTrebleGlyph().
        setContext(ctx).draw();
      var tabstave2 = new VF.TabStave(10, 300, 400).addTabGlyph().
        setNoteStartX(stave2.getNoteStartX()).setContext(ctx).draw();

      VF.Test.Formatter.renderNotesWithTab(notes, ctx,
          { notes: stave2, tabs: tabstave2 }, 300);
      ok(true);
    },

    multiStaves: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 300);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var stave11 = new VF.Stave(20, 10, 255).
        addTrebleGlyph().
        addTimeSignature("6/8").
        setContext(ctx).draw();
      var stave21 = new VF.Stave(20, 100, 255).
        addTrebleGlyph().
        addTimeSignature("6/8").
        setContext(ctx).draw();
      var stave31 = new VF.Stave(20, 200, 255).
        addClef("bass").
        addTimeSignature("6/8").
        setContext(ctx).draw();
      new VF.StaveConnector(stave21, stave31).
        setType(VF.StaveConnector.type.BRACE).
        setContext(ctx).draw();

      var notes11 = [
        newNote({ keys: ["f/4"], duration: "q"}).setStave(stave11),
        newNote({ keys: ["d/4"], duration: "8"}).setStave(stave11),
        newNote({ keys: ["g/4"], duration: "q"}).setStave(stave11),
        newNote({ keys: ["e/4"], duration: "8"}).setStave(stave11).
          addAccidental(0, newAcc("b"))
      ];
      var notes21 = [
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}).setStave(stave21),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}).setStave(stave21),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}).setStave(stave21),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}).setStave(stave21),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}).setStave(stave21).
          addAccidental(0, newAcc("b")),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}).setStave(stave21).
          addAccidental(0, newAcc("b"))
      ];
      var notes31 = [
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31)
      ];

      var voice11 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      var voice21 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      var voice31 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      voice11.addTickables(notes11);
      voice21.addTickables(notes21);
      voice31.addTickables(notes31);

      var beam21a = new VF.Beam(notes21.slice(0, 3));
      var beam21b = new VF.Beam(notes21.slice(3, 6));
      var beam31a = new VF.Beam(notes31.slice(0, 3));
      var beam31b = new VF.Beam(notes31.slice(3, 6));

      if (options.params.justify > 0) {
        new VF.Formatter().joinVoices( [voice11, voice21, voice31] ).
          format([voice11, voice21, voice31], options.params.justify);
      } else {
        new VF.Formatter().joinVoices( [voice11, voice21, voice31] ).
          format([voice11, voice21, voice31]);
      }

      voice11.draw(ctx, stave11);
      voice21.draw(ctx, stave21);
      voice31.draw(ctx, stave31);
      beam21a.setContext(ctx).draw();
      beam21b.setContext(ctx).draw();
      beam31a.setContext(ctx).draw();
      beam31b.setContext(ctx).draw();

      var stave12 = new VF.Stave(stave11.width + stave11.x, stave11.y, 250).
        setContext(ctx).draw();
      var stave22 = new VF.Stave(stave21.width + stave21.x, stave21.y, 250).
        setContext(ctx).draw();
      var stave32 = new VF.Stave(stave31.width + stave31.x, stave31.y, 250).
        setContext(ctx).draw();

      var notes12 = [
        newNote({ keys: ["a/4"], duration: "q"}).setStave(stave12).
         addAccidental(0, newAcc("b")),
        newNote({ keys: ["b/4"], duration: "8"}).setStave(stave12).
          addAccidental(0, newAcc("b")),
        newNote({ keys: ["c/5", "e/5"], stem_direction: -1, duration: "q"}).setStave(stave12). //,
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("b")),

        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}).setStave(stave12)
      ];
      var notes22 = [
        newNote({ keys: ["e/4", "a/4"], stem_direction: 1, duration: "qd"}).setStave(stave22).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("b")).
          addDotToAll(),
        newNote({ keys: ["e/4", "a/4", "c/5"], stem_direction: 1, duration: "q"}).setStave(stave22).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("b")),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}).setStave(stave22).
          addAccidental(0, newAcc("b"))
      ];
      var notes32 = [
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32)
      ];
      var voice12 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      var voice22 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      var voice32 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      voice12.addTickables(notes12);
      voice22.addTickables(notes22);
      voice32.addTickables(notes32);

      if (options.params.justify > 0) {
        new VF.Formatter().joinVoices([voice12, voice22, voice32]).
          format([voice12, voice22, voice32], 188);
      } else {
        new VF.Formatter().joinVoices([voice12, voice22, voice32]).
          format([voice12, voice22, voice32]);
      }
      var beam32a = new VF.Beam(notes32.slice(0, 3));
      var beam32b = new VF.Beam(notes32.slice(3, 6));

      voice12.draw(ctx, stave12);
      voice22.draw(ctx, stave22);
      voice32.draw(ctx, stave32);
      beam32a.setContext(ctx).draw();
      beam32b.setContext(ctx).draw();

      ok(true);
    },

    TIME6_8: {
      num_beats: 6,
      beat_value: 8,
      resolution: VF.RESOLUTION
    }
  };

  return Formatter;
})();