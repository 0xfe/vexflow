/**
 * VexFlow - Tuplet Tests
 */

Vex.Flow.Test.Tuplet = {}

Vex.Flow.Test.Tuplet.Start = function() {
  module("Tuplet");
  Vex.Flow.Test.runTest("Simple Tuplet", Vex.Flow.Test.Tuplet.simple);
  Vex.Flow.Test.runTest("Beamed Tuplet", Vex.Flow.Test.Tuplet.beamed);
  Vex.Flow.Test.runTest("Ratioed Tuplet", Vex.Flow.Test.Tuplet.ratio);
  Vex.Flow.Test.runTest("Bottom Tuplet", Vex.Flow.Test.Tuplet.bottom);
  Vex.Flow.Test.runTest("Bottom Ratioed Tuplet", Vex.Flow.Test.Tuplet.bottom_ratio);
  Vex.Flow.Test.runTest("Awkward Tuplet", Vex.Flow.Test.Tuplet.awkward);
}

Vex.Flow.Test.Tuplet.setupContext = function(options, x, y) {
  Vex.Flow.Test.resizeCanvas(options.canvas_sel, x || 350, y || 140);
  var ctx = Vex.getCanvasContext(options.canvas_sel);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 10, x || 350).addTrebleGlyph().
    setContext(ctx).draw();

  return {context: ctx, stave: stave};
}

Vex.Flow.Test.Tuplet.simple = function(options) {
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"})
  ];
  
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  
  voice.setStrict(false);
  voice.addTickables(notes);
  
  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);

  voice.draw(c.context, c.stave);
  
  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 6));
  
  tuplet1.setContext(c.context).draw();
  tuplet2.setContext(c.context).draw();
  
  ok(true, "Simple Test");
}

Vex.Flow.Test.Tuplet.beamed = function(options) {
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"})
  ];
  
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  
  voice.setStrict(false);
  voice.addTickables(notes);
  
  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  
  var beam1 = new Vex.Flow.Beam(notes.slice(0, 3));
  var beam2 = new Vex.Flow.Beam(notes.slice(3, 10));

  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 10));
  
  voice.draw(c.context, c.stave);
  
  tuplet1.setContext(c.context).draw();
  tuplet2.setContext(c.context).draw();
  
  beam1.setContext(c.context).draw();
  beam2.setContext(c.context).draw();
  
  ok(true, "Beamed Test");
}

Vex.Flow.Test.Tuplet.ratio = function(options) {
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"})
  ];
  
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  
  voice.setStrict(false);
  voice.addTickables(notes);
  
  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  
  var beam = new Vex.Flow.Beam(notes.slice(3, 6));
  
  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 6));
  tuplet2.setBeatsOccupied(4);
  
  voice.draw(c.context, c.stave);
  
  beam.setContext(c.context).draw();
  
  tuplet1.setRatioed(true).setContext(c.context).draw();
  tuplet2.setRatioed(true).setContext(c.context).draw();
  
  ok(true, "Ratioed Test");
}

Vex.Flow.Test.Tuplet.bottom = function(options) {
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["f/5"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["c/5"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["d/5"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["g/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"})
  ];
  
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  
  voice.setStrict(false);
  voice.addTickables(notes);
  
  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  
  var beam = new Vex.Flow.Beam(notes.slice(3, 6));
  
  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 6));
  
  tuplet1.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
  tuplet2.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
  
  voice.draw(c.context, c.stave);
  
  beam.setContext(c.context).draw();
  
  tuplet1.setContext(c.context).draw();
  tuplet2.setContext(c.context).draw();
  
  ok(true, "Bottom Test");
}

Vex.Flow.Test.Tuplet.bottom_ratio = function(options) {
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["f/5"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["c/5"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["d/5"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["g/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"})
  ];
  
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  
  voice.setStrict(false);
  voice.addTickables(notes);
  
  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  
  var beam = new Vex.Flow.Beam(notes.slice(3, 6));
  
  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 6));
  
  tuplet2.setBeatsOccupied(1);
  tuplet1.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
  tuplet2.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
  
  voice.draw(c.context, c.stave);
  
  beam.setContext(c.context).draw();
  
  tuplet1.setRatioed(true).setContext(c.context).draw();
  tuplet2.setRatioed(true).setContext(c.context).draw();
  
  ok(true, "Bottom Ratioed Test");
}

Vex.Flow.Test.Tuplet.awkward = function(options) {
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["e/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["c/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "16"})
  ];
  
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  
  voice.setStrict(false);
  voice.addTickables(notes);
  
  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  
  var beam = new Vex.Flow.Beam(notes);
  
  var tuplet1 = new Vex.Flow.Tuplet(notes);
  tuplet1.setBeatsOccupied(142);
  
  voice.draw(c.context, c.stave);
  
  beam.setContext(c.context).draw();
  tuplet1.setRatioed(true).setContext(c.context).draw();
  
  ok(true, "Awkward Test");
}