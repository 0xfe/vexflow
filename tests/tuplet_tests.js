/**
 * VexFlow - Tuplet Tests
 */

Vex.Flow.Test.Tuplet = {}

Vex.Flow.Test.Tuplet.Start = function() {
  module("Tuplet");
  Vex.Flow.Test.runTests("Simple Tuplet", Vex.Flow.Test.Tuplet.simple);
  Vex.Flow.Test.runTests("Beamed Tuplet", Vex.Flow.Test.Tuplet.beamed);
  Vex.Flow.Test.runTests("Ratioed Tuplet", Vex.Flow.Test.Tuplet.ratio);
  Vex.Flow.Test.runTests("Bottom Tuplet", Vex.Flow.Test.Tuplet.bottom);
  Vex.Flow.Test.runTests("Bottom Ratioed Tuplet", Vex.Flow.Test.Tuplet.bottom_ratio);
  Vex.Flow.Test.runTests("Awkward Tuplet", Vex.Flow.Test.Tuplet.awkward);
  Vex.Flow.Test.runTests("Complex Tuplet", Vex.Flow.Test.Tuplet.complex);
  Vex.Flow.Test.runTests("Mixed Stem Direction Tuplet", Vex.Flow.Test.Tuplet.mixedTop);
  Vex.Flow.Test.runTests("Mixed Stem Direction Bottom Tuplet", Vex.Flow.Test.Tuplet.mixedBottom);
}

Vex.Flow.Test.Tuplet.setupContext = function(options, x, y) {
  var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);

  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 10, x || 350).addTrebleGlyph().
    setContext(ctx).draw();

  return {context: ctx, stave: stave};
}

Vex.Flow.Test.Tuplet.simple = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
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

  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 6));

  // 3/4 time
  var voice = new Vex.Flow.Voice({
    num_beats: 3, beat_value: 4, resolution: Vex.Flow.RESOLUTION });

  voice.setStrict(true);
  voice.addTickables(notes);

  c.stave.addTimeSignature("3/4");
  c.stave.draw(c.context);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);

  voice.draw(c.context, c.stave);

  tuplet1.setContext(c.context).draw();
  tuplet2.setContext(c.context).draw();

  ok(true, "Simple Test");
}

Vex.Flow.Test.Tuplet.beamed = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
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

  var beam1 = new Vex.Flow.Beam(notes.slice(0, 3));
  var beam2 = new Vex.Flow.Beam(notes.slice(3, 10));

  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 10));

  // 3/8 time
  var voice = new Vex.Flow.Voice({
    num_beats: 3, beat_value: 8, resolution: Vex.Flow.RESOLUTION });

  voice.setStrict(true);
  voice.addTickables(notes);
  c.stave.addTimeSignature("3/8");
  c.stave.draw(c.context);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);

  voice.draw(c.context, c.stave);

  tuplet1.setContext(c.context).draw();
  tuplet2.setContext(c.context).draw();

  beam1.setContext(c.context).draw();
  beam2.setContext(c.context).draw();

  ok(true, "Beamed Test");
}

Vex.Flow.Test.Tuplet.ratio = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
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

  var beam = new Vex.Flow.Beam(notes.slice(3, 6));

  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 6), {beats_occupied: 4});

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  voice.setStrict(true);
  voice.addTickables(notes);
  c.stave.addTimeSignature("4/4");
  c.stave.draw(c.context);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);

  voice.draw(c.context, c.stave);

  beam.setContext(c.context).draw();

  tuplet1.setRatioed(true).setContext(c.context).draw();
  tuplet2.setRatioed(true).setContext(c.context).draw();

  ok(true, "Ratioed Test");
}

Vex.Flow.Test.Tuplet.bottom = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options, 350, 160);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["g/4"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["g/3"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"})
  ];

  var beam = new Vex.Flow.Beam(notes.slice(3, 6));

  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 6));

  tuplet1.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
  tuplet2.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);

  var voice = new Vex.Flow.Voice({
    num_beats: 3, beat_value: 4, resolution: Vex.Flow.RESOLUTION });

  voice.setStrict(true);
  voice.addTickables(notes);
  c.stave.addTimeSignature("3/4");
  c.stave.draw(c.context);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);

  voice.draw(c.context, c.stave);

  beam.setContext(c.context).draw();

  tuplet1.setContext(c.context).draw();
  tuplet2.setContext(c.context).draw();

  ok(true, "Bottom Test");
}

Vex.Flow.Test.Tuplet.bottom_ratio = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options, 350, 160);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["d/4"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["g/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"})
  ];

  var beam = new Vex.Flow.Beam(notes.slice(3, 6));

  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 6));

  tuplet2.setBeatsOccupied(1);
  tuplet1.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
  tuplet2.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);

  var voice = new Vex.Flow.Voice({
    num_beats: 5, beat_value: 8, resolution: Vex.Flow.RESOLUTION });

  voice.setStrict(true);
  voice.addTickables(notes);
  c.stave.addTimeSignature("5/8");
  c.stave.draw(c.context);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);

  voice.draw(c.context, c.stave);

  beam.setContext(c.context).draw();

  tuplet1.setRatioed(true).setContext(c.context).draw();
  tuplet2.setRatioed(true).setContext(c.context).draw();

  ok(true, "Bottom Ratioed Test");
}

Vex.Flow.Test.Tuplet.awkward = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
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
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"})
  ];

  var beam = new Vex.Flow.Beam(notes.slice(0, 11));

  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 11));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(11, 14));
  tuplet1.setBeatsOccupied(142);

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  voice.setStrict(false);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);

  voice.draw(c.context, c.stave);

  beam.setContext(c.context).draw();
  tuplet1.setRatioed(true).setContext(c.context).draw();
  tuplet2.setRatioed(true).setBracketed(true).setContext(c.context).draw();

  ok(true, "Awkward Test");
}

Vex.Flow.Test.Tuplet.complex = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Tuplet.setupContext(options, 600);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes1 = [
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8d"}).addDotToAll(),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "16r"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "32"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "32"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "32"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "32"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"})
  ];
  var notes2 = [
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "4" }),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "4" }),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "4" }),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "4" })
  ];

  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  var beam1 = new Vex.Flow.Beam(notes1.slice(0, 3));
  var beam2 = new Vex.Flow.Beam(notes1.slice(5, 9));
  var beam3 = new Vex.Flow.Beam(notes1.slice(11, 16));

  var tuplet1 = new Vex.Flow.Tuplet(notes1.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes1.slice(3, 11),
                                    {num_notes: 7, beats_occupied: 4});
  var tuplet3 = new Vex.Flow.Tuplet(notes1.slice(11, 16), {beats_occupied: 4});

  voice1.setStrict(true);
  voice1.addTickables(notes1);
  voice2.setStrict(true)
  voice2.addTickables(notes2);
  c.stave.addTimeSignature("4/4");
  c.stave.draw(c.context);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice1, voice2]).
    format([voice1, voice2], c.stave.getNoteEndX() - c.stave.getNoteStartX() - 50);

  voice1.draw(c.context, c.stave);
  voice2.draw(c.context, c.stave);

  tuplet1.setContext(c.context).draw();
  tuplet2.setContext(c.context).draw();
  tuplet3.setContext(c.context).draw();

  beam1.setContext(c.context).draw();
  beam2.setContext(c.context).draw();
  beam3.setContext(c.context).draw();

  ok(true, "Complex Test");
}

Vex.Flow.Test.Tuplet.mixedTop = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "4"}),
    newNote({ keys: ["c/6"], stem_direction: -1, duration: "4"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "4"}),
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "4"}),
    newNote({ keys: ["a/4"], stem_direction: -1, duration: "4"}),
    newNote({ keys: ["c/6"], stem_direction: -1, duration: "4"})
  ];

  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 2), {beats_occupied : 3});
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(2, 4), {beats_occupied : 3});
  var tuplet3 = new Vex.Flow.Tuplet(notes.slice(4, 6), {beats_occupied : 3});

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  voice.setStrict(false);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);

  voice.draw(c.context, c.stave);

  tuplet1.setContext(c.context).draw();
  tuplet2.setContext(c.context).draw();
  tuplet3.setContext(c.context).draw();

  ok(true, "Mixed Stem Direction Tuplet");
}

Vex.Flow.Test.Tuplet.mixedBottom = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["f/3"], stem_direction: 1, duration: "4"}),
    newNote({ keys: ["a/5"], stem_direction: -1, duration: "4"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "4"}),
    newNote({ keys: ["f/3"], stem_direction: 1, duration: "4"}),
    newNote({ keys: ["a/4"], stem_direction: -1, duration: "4"}),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "4"})
  ];

  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 2), {beats_occupied : 3});
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(2, 4), {beats_occupied : 3});
  var tuplet3 = new Vex.Flow.Tuplet(notes.slice(4, 6), {beats_occupied : 3});

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  voice.setStrict(false);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);

  voice.draw(c.context, c.stave);

  tuplet1.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
  tuplet2.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
  tuplet3.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);

  tuplet1.setContext(c.context).draw();
  tuplet2.setContext(c.context).draw();
  tuplet3.setContext(c.context).draw();

  ok(true, "Mixed Stem Direction Bottom Tuplet");
}
