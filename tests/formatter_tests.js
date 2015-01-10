/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Formatter = {}

Vex.Flow.Test.Formatter.Start = function() {
  module("Formatter");
  test("TickContext Building", Vex.Flow.Test.Formatter.buildTickContexts);
  Vex.Flow.Test.runTests("StaveNote Formatting",
      Vex.Flow.Test.Formatter.formatStaveNotes);
  Vex.Flow.Test.runTests("StaveNote Justification",
      Vex.Flow.Test.Formatter.justifyStaveNotes);
  Vex.Flow.Test.runTests("Notes with Tab",
      Vex.Flow.Test.Formatter.notesWithTab);
  Vex.Flow.Test.runTests("Format Multiple Staves - No Justification",
      Vex.Flow.Test.Formatter.multiStaves, {justify: 0});
  Vex.Flow.Test.runTests("Format Multiple Staves - Justified",
      Vex.Flow.Test.Formatter.multiStaves, {justify: 168});
}

Vex.Flow.Test.Formatter.buildTickContexts = function() {
  function createTickable() {
    return new Vex.Flow.Test.MockTickable();
  }

  var R = Vex.Flow.RESOLUTION;
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

  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  voice1.addTickables(tickables1);
  voice2.addTickables(tickables2);

  var formatter = new Vex.Flow.Formatter();
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
}

Vex.Flow.Test.Formatter.renderNotes = function(
    notes1, notes2, ctx, stave, justify) {
  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  voice1.addTickables(notes1);
  voice2.addTickables(notes2);

  new Vex.Flow.Formatter().joinVoices([voice1, voice2]).
    format([voice1, voice2], justify);

  voice1.draw(ctx, stave);
  voice2.draw(ctx, stave);
}

Vex.Flow.Test.Formatter.formatStaveNotes = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 150);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  var stave = new Vex.Flow.Stave(10, 10, 500);
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
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
    newNote({ keys: ["c/5", "e/5", "a/5"], stem_direction: 1,  duration: "h"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),
    newNote({ keys: ["d/5", "e/5", "f/5"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["f/5", "a/5", "c/5"], stem_direction: 1, duration: "q"}).
      addAccidental(0, newAcc("n")).
      addAccidental(1, newAcc("#"))
  ];

  Vex.Flow.Test.Formatter.renderNotes(notes1, notes2, ctx, stave);

  ok(true);
}

Vex.Flow.Test.Formatter.getNotes = function() {
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes1 = [
    newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
      addAccidental(0, newAcc("bb")).
      addAccidental(1, newAcc("n")),
    newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["d/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["f/4", "a/4", "c/4"], stem_direction: -1, duration: "q"}).
      addAccidental(0, newAcc("n")).
      addAccidental(1, newAcc("#"))
  ];

  var notes2 = [
    newNote({ keys: ["b/4", "e/5", "a/5"], stem_direction: 1,  duration: "q"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),
    newNote({ keys: ["d/5", "e/5", "f/5"], stem_direction: 1, duration: "h"}),
    newNote({ keys: ["f/5", "a/5", "c/5"], stem_direction: 1, duration: "q"}).
      addAccidental(0, newAcc("##")).
      addAccidental(1, newAcc("b"))
  ];

  return [notes1, notes2];
}



Vex.Flow.Test.Formatter.justifyStaveNotes = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 420, 400);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

  // Get test voices.
  var notes = Vex.Flow.Test.Formatter.getNotes();

  var stave = new Vex.Flow.Stave(10, 10, 400).addTrebleGlyph().
    setContext(ctx).draw();
  Vex.Flow.Test.Formatter.renderNotes(notes[0], notes[1], ctx, stave);
  ok(true);

  var stave2 = new Vex.Flow.Stave(10, 150, 400).addTrebleGlyph().
    setContext(ctx).draw();
  Vex.Flow.Test.Formatter.renderNotes(notes[0], notes[1], ctx, stave2, 300);
  ok(true);

  var stave3 = new Vex.Flow.Stave(10, 300, 400).addTrebleGlyph().
    setContext(ctx).draw();
  Vex.Flow.Test.Formatter.renderNotes(notes[0], notes[1], ctx, stave3, 400);
  ok(true);
}

Vex.Flow.Test.Formatter.getTabNotes = function() {
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newTabNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes1 = [
    newNote({ keys: ["d/4"], stem_direction: 1, duration: "h"}).
      addAccidental(0, newAcc("#")),
    newNote({ keys: ["c/4", "d/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["c/4", "a/4", "e/4"], stem_direction: 1, duration: "q"}).
      addAccidental(0, newAcc("#"))
  ];

  var tabs1 = [
    newTabNote({ positions: [{str: 3, fret: 6}], duration: "h"}).
      addModifier(new Vex.Flow.Bend("Full"), 0),
    newTabNote({ positions: [{str: 2, fret: 3},
                             {str: 3, fret: 5}], duration: "8"}).
      addModifier(new Vex.Flow.Bend("Unison"), 1),
    newTabNote({ positions: [{str: 3, fret: 7}], duration: "8"}),
    newTabNote({ positions: [{str: 3, fret: 6},
                             {str: 4, fret: 7},
                             {str: 2, fret: 5}], duration: "q"})

  ];

  return { notes: notes1, tabs: tabs1 }
}

Vex.Flow.Test.Formatter.renderNotesWithTab =
  function(notes, ctx, staves, justify) {
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var tabVoice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  voice.addTickables(notes.notes);
  tabVoice.addTickables(notes.tabs);

  new Vex.Flow.Formatter().
    joinVoices([voice]).joinVoices([tabVoice]).
    format([voice, tabVoice], justify);

  voice.draw(ctx, staves.notes);
  tabVoice.draw(ctx, staves.tabs);
}

Vex.Flow.Test.Formatter.notesWithTab = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 420, 400);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = "10pt Arial";

  // Get test voices.
  var notes = Vex.Flow.Test.Formatter.getTabNotes();
  var stave = new Vex.Flow.Stave(10, 10, 400).addTrebleGlyph().
    setContext(ctx).draw();
  var tabstave = new Vex.Flow.TabStave(10, 100, 400).addTabGlyph().
    setNoteStartX(stave.getNoteStartX()).setContext(ctx).draw();

  Vex.Flow.Test.Formatter.renderNotesWithTab(notes, ctx,
      { notes: stave, tabs: tabstave });
  ok(true);

  var stave2 = new Vex.Flow.Stave(10, 200, 400).addTrebleGlyph().
    setContext(ctx).draw();
  var tabstave2 = new Vex.Flow.TabStave(10, 300, 400).addTabGlyph().
    setNoteStartX(stave2.getNoteStartX()).setContext(ctx).draw();

  Vex.Flow.Test.Formatter.renderNotesWithTab(notes, ctx,
      { notes: stave2, tabs: tabstave2 }, 300);
  ok(true);
}

Vex.Flow.Test.Formatter.multiStaves = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 500, 300);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = "10pt Arial";
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var stave11 = new Vex.Flow.Stave(20, 10, 255).
    addTrebleGlyph().
    addTimeSignature("6/8").
    setContext(ctx).draw();
  var stave21 = new Vex.Flow.Stave(20, 100, 255).
    addTrebleGlyph().
    addTimeSignature("6/8").
    setContext(ctx).draw();
  var stave31 = new Vex.Flow.Stave(20, 200, 255).
    addClef("bass").
    addTimeSignature("6/8").
    setContext(ctx).draw();
  new Vex.Flow.StaveConnector(stave21, stave31).
    setType(Vex.Flow.StaveConnector.type.BRACE).
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

  var voice11 = new Vex.Flow.Voice(Vex.Flow.Test.Formatter.TIME6_8);
  var voice21 = new Vex.Flow.Voice(Vex.Flow.Test.Formatter.TIME6_8);
  var voice31 = new Vex.Flow.Voice(Vex.Flow.Test.Formatter.TIME6_8);
  voice11.addTickables(notes11);
  voice21.addTickables(notes21);
  voice31.addTickables(notes31);

  var beam21a = new Vex.Flow.Beam(notes21.slice(0, 3));
  var beam21b = new Vex.Flow.Beam(notes21.slice(3, 6));
  var beam31a = new Vex.Flow.Beam(notes31.slice(0, 3));
  var beam31b = new Vex.Flow.Beam(notes31.slice(3, 6));

  if (options.params.justify > 0) {
    new Vex.Flow.Formatter().joinVoices( [voice11, voice21, voice31] ).
      format([voice11, voice21, voice31], options.params.justify);
  } else {
    new Vex.Flow.Formatter().joinVoices( [voice11, voice21, voice31] ).
      format([voice11, voice21, voice31]);
  }

  voice11.draw(ctx, stave11);
  voice21.draw(ctx, stave21);
  voice31.draw(ctx, stave31);
  beam21a.setContext(ctx).draw();
  beam21b.setContext(ctx).draw();
  beam31a.setContext(ctx).draw();
  beam31b.setContext(ctx).draw();

  var stave12 = new Vex.Flow.Stave(stave11.width + stave11.x, stave11.y, 250).
    setContext(ctx).draw();
  var stave22 = new Vex.Flow.Stave(stave21.width + stave21.x, stave21.y, 250).
    setContext(ctx).draw();
  var stave32 = new Vex.Flow.Stave(stave31.width + stave31.x, stave31.y, 250).
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
    newNote({ keys: ["a/4", "e/4"], stem_direction: 1, duration: "qd"}).setStave(stave22).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("b")).
      addDotToAll(),
    newNote({ keys: ["c/5", "a/4", "e/4"], stem_direction: 1, duration: "q"}).setStave(stave22).
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
  var voice12 = new Vex.Flow.Voice(Vex.Flow.Test.Formatter.TIME6_8);
  var voice22 = new Vex.Flow.Voice(Vex.Flow.Test.Formatter.TIME6_8);
  var voice32 = new Vex.Flow.Voice(Vex.Flow.Test.Formatter.TIME6_8);
  voice12.addTickables(notes12);
  voice22.addTickables(notes22);
  voice32.addTickables(notes32);

  if (options.params.justify > 0) {
    new Vex.Flow.Formatter().joinVoices([voice12, voice22, voice32]).
      format([voice12, voice22, voice32], 188);
  } else {
    new Vex.Flow.Formatter().joinVoices([voice12, voice22, voice32]).
      format([voice12, voice22, voice32]);
  }
  var beam32a = new Vex.Flow.Beam(notes32.slice(0, 3));
  var beam32b = new Vex.Flow.Beam(notes32.slice(3, 6));

  voice12.draw(ctx, stave12);
  voice22.draw(ctx, stave22);
  voice32.draw(ctx, stave32);
  beam32a.setContext(ctx).draw();
  beam32b.setContext(ctx).draw();

  ok(true);
}

Vex.Flow.Test.Formatter.TIME6_8 = {
  num_beats: 6,
  beat_value: 8,
  resolution: Vex.Flow.RESOLUTION
};
