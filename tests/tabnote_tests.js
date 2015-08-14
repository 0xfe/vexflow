/**
 * VexFlow - TabNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.TabNote = {}

Vex.Flow.Test.TabNote.Start = function() {
  module("TabNote");
  test("Tick", Vex.Flow.Test.TabNote.ticks);
  test("TabStave Line", Vex.Flow.Test.TabNote.tabStaveLine);
  test("Width", Vex.Flow.Test.TabNote.width);
  test("TickContext", Vex.Flow.Test.TabNote.tickContext);
  Vex.Flow.Test.runTests("TabNote Draw", Vex.Flow.Test.TabNote.draw);
  Vex.Flow.Test.runTests("TabNote Stems Up", Vex.Flow.Test.TabNote.drawStemsUp);
  Vex.Flow.Test.runTests("TabNote Stems Down", Vex.Flow.Test.TabNote.drawStemsDown);
  Vex.Flow.Test.runTests("TabNote Stems Up Through Stave", Vex.Flow.Test.TabNote.drawStemsUpThrough);
  Vex.Flow.Test.runTests("TabNote Stems Down Through Stave", Vex.Flow.Test.TabNote.drawStemsDownThrough);
  Vex.Flow.Test.runTests("TabNote Stems with Dots", Vex.Flow.Test.TabNote.drawStemsDotted);
}

Vex.Flow.Test.TabNote.ticks = function() {
  var BEAT = 1 * Vex.Flow.RESOLUTION / 4;

  var note = new Vex.Flow.TabNote(
      { positions: [{str: 6, fret: 6 }], duration: "w"});
  equal(note.getTicks().value(), BEAT * 4, "Whole note has 4 beats");

  note = new Vex.Flow.TabNote(
      { positions: [{str: 3, fret: 4 }], duration: "q"});
  equal(note.getTicks().value(), BEAT, "Quarter note has 1 beat");
}

Vex.Flow.Test.TabNote.tabStaveLine = function() {
  var note = new Vex.Flow.TabNote(
      { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});
  var positions = note.getPositions();
  equal(positions[0].str, 6, "String 6, Fret 6");
  equal(positions[0].fret, 6, "String 6, Fret 6");
  equal(positions[1].str, 4, "String 4, Fret 5");
  equal(positions[1].fret, 5, "String 4, Fret 5");

  var stave = new Vex.Flow.Stave(10, 10, 300);
  note.setStave(stave);

  var ys = note.getYs();
  equal(ys.length, 2, "Chord should be rendered on two lines");
  equal(ys[0], 99, "Line for String 6, Fret 6");
  equal(ys[1], 79, "Line for String 4, Fret 5");
}

Vex.Flow.Test.TabNote.width = function() {
  expect(1);
  var note = new Vex.Flow.TabNote(
      { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});

  try {
    var width = note.getWidth();
  } catch (e) {
    equal(e.code, "UnformattedNote",
        "Unformatted note should have no width");
  }
}

Vex.Flow.Test.TabNote.tickContext = function() {
  var note = new Vex.Flow.TabNote(
      { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});
  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note);
  tickContext.preFormat();
  tickContext.setX(10);
  tickContext.setPadding(0);

  equal(tickContext.getWidth(), 6);
}

Vex.Flow.Test.TabNote.showNote = function(tab_struct, stave, ctx, x) {
  var note = new Vex.Flow.TabNote(tab_struct);
  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(20);
  note.setContext(ctx).setStave(stave);
  note.draw();
  return note;
}

Vex.Flow.Test.TabNote.draw = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 600, 140);

  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  var showNote = Vex.Flow.Test.TabNote.showNote;
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
}

Vex.Flow.Test.TabNote.drawStemsUp = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 600, 200);
  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.TabStave(10, 30, 550);
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
    var tabNote = new Vex.Flow.TabNote(noteSpec);
    tabNote.render_options.draw_stem = true;
    return tabNote;
  });

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).setMode(Vex.Flow.Voice.Mode.SOFT);

  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], stave);


  voice.draw(ctx, stave);

  ok (true, 'TabNotes successfully drawn');

};

Vex.Flow.Test.TabNote.drawStemsDown = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 600, 200);

  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 550);
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
    var tabNote = new Vex.Flow.TabNote(noteSpec);
    tabNote.render_options.draw_stem = true;
    tabNote.setStemDirection(-1);
    return tabNote;
  });

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).setMode(Vex.Flow.Voice.Mode.SOFT);

  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], stave);


  voice.draw(ctx, stave);

  ok (true, 'All objects have been drawn');

};
Vex.Flow.Test.TabNote.drawStemsUpThrough = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 600, 200);
  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.TabStave(10, 30, 550);
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
    var tabNote = new Vex.Flow.TabNote(noteSpec);
    tabNote.render_options.draw_stem = true;
    tabNote.render_options.draw_stem_through_stave = true;
    return tabNote;
  });

  ctx.setFont("sans-serif", 10, "bold");

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).setMode(Vex.Flow.Voice.Mode.SOFT);

  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], stave);


  voice.draw(ctx, stave);

  ok (true, 'TabNotes successfully drawn');

};

Vex.Flow.Test.TabNote.drawStemsDownThrough = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 600, 250);

  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 550,{num_lines:8});
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
    var tabNote = new Vex.Flow.TabNote(noteSpec);
    tabNote.render_options.draw_stem = true;
    tabNote.render_options.draw_stem_through_stave = true;
    tabNote.setStemDirection(-1);
    return tabNote;
  });

  ctx.setFont("Arial", 10, "bold");

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).setMode(Vex.Flow.Voice.Mode.SOFT);

  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], stave);


  voice.draw(ctx, stave);

  ok (true, 'All objects have been drawn');

};

Vex.Flow.Test.TabNote.drawStemsDotted = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 600, 200);
  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  var specs = [
    { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4d"},
    { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
    { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "4dd", stem_direction: -1 },
    { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16", stem_direction: -1},
  ];

  var notes = specs.map(function(noteSpec) {
    var tabNote = new Vex.Flow.TabNote(noteSpec, true);
    return tabNote;
  });

  notes[0].addDot();
  notes[2].addDot();
  notes[2].addDot();

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).setMode(Vex.Flow.Voice.Mode.SOFT);

  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], stave);


  voice.draw(ctx, stave);

  ok (true, 'TabNotes successfully drawn');

};