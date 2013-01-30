/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

Vex.Flow.Test.Rests = {};

Vex.Flow.Test.Rests.Start = function() {
  module("Rests");
  Vex.Flow.Test.runTest("Rests - Dotted",
      Vex.Flow.Test.Rests.basic);
  Vex.Flow.Test.runTest("Rests - Auto Align With Beams Stems Up",
      Vex.Flow.Test.Rests.beamsUp);
  Vex.Flow.Test.runTest("Rests - Auto Align With Beams Stems Down",
      Vex.Flow.Test.Rests.beamsDown);
  Vex.Flow.Test.runTest("Rests - Auto Align With Tuplets Stems Up",
      Vex.Flow.Test.Rests.tuplets);
  Vex.Flow.Test.runTest("Rests - Auto Align With Tuplets Stems Down",
      Vex.Flow.Test.Rests.tupletsdown);
};

Vex.Flow.Test.Rests.setupContext = function(options, x, y) {
  Vex.Flow.Test.resizeCanvas(options.canvas_sel, x || 350, y || 150);
  var ctx = Vex.getCanvasContext(options.canvas_sel);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 30, x || 350).addTrebleGlyph().
    setContext(ctx).draw();

  return {context: ctx, stave: stave};
}

Vex.Flow.Test.Rests.basic = function(options) {
  var c = Vex.Flow.Test.Rests.setupContext(options, 700);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "wr"}).addDotToAll(),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "hr"}).addDotToAll(),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}).addDotToAll(),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}).addDotToAll(),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "16r"}).addDotToAll(),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "32r"}).addDotToAll(),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "64r"}).addDotToAll()
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  voice.setStrict(false);
  voice.addTickables(notes);
  c.stave.addTimeSignature("4/4");
  c.stave.draw(c.context);

  Vex.Flow.Formatter.FormatAndDraw(c.context, c.stave, notes);

  voice.draw(c.context, c.stave);

  ok(true, "Complex Test");
}

Vex.Flow.Test.Rests.beamsUp = function(options) {
  var c = Vex.Flow.Test.Rests.setupContext(options, 600, 160);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
    newNote({ keys: ["b/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),

    newNote({ keys: ["b/4","d/5","a/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
    newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),

    newNote({ keys: ["b/4","d/5","a/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
    newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),

  ];

  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  var beam1 = new Vex.Flow.Beam(notes.slice(0, 4));
  var beam2 = new Vex.Flow.Beam(notes.slice(4, 8));
  var beam3 = new Vex.Flow.Beam(notes.slice(8,12));


  voice1.setStrict(false);
  voice1.addTickables(notes);
  c.stave.addTimeSignature("4/4");
  c.stave.draw(c.context);

  Vex.Flow.Formatter.FormatAndDraw(c.context, c.stave, notes);

  voice1.draw(c.context, c.stave);

  beam1.setContext(c.context).draw();
  beam2.setContext(c.context).draw();
  beam3.setContext(c.context).draw();

  ok(true, "Dotted Rests Test");
}

Vex.Flow.Test.Rests.beamsDown = function(options) {
  var c = Vex.Flow.Test.Rests.setupContext(options, 600, 160);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
    newNote({ keys: ["b/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["c/5"], stem_direction: -1, duration: "8"}),

    newNote({ keys: ["b/4","d/5","a/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
    newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),

    newNote({ keys: ["b/4","d/5","a/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
    newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),

  ];

  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  var beam1 = new Vex.Flow.Beam(notes.slice(0, 4));
  var beam2 = new Vex.Flow.Beam(notes.slice(4, 8));
  var beam3 = new Vex.Flow.Beam(notes.slice(8, 12));

  voice1.setStrict(false);
  voice1.addTickables(notes);
  c.stave.addTimeSignature("4/4");
  c.stave.draw(c.context);

  Vex.Flow.Formatter.FormatAndDraw(c.context, c.stave, notes);

  voice1.draw(c.context, c.stave);

  beam1.setContext(c.context).draw();
  beam2.setContext(c.context).draw();
  beam3.setContext(c.context).draw();

  ok(true, "Tuplets Up Stem Test");
}

Vex.Flow.Test.Rests.tuplets = function(options) {
  var c = Vex.Flow.Test.Rests.setupContext(options, 600, 160);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["a/5"], stem_direction: 1, duration: "qr"}),
    newNote({ keys: ["g/5"], stem_direction: 1, duration: "qr"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),

    newNote({ keys: ["a/5"], stem_direction: 1, duration: "qr"}),
    newNote({ keys: ["g/5"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),

    newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["g/5"], stem_direction: 1, duration: "qr"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),

    newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["g/5"], stem_direction: 1, duration: "qr"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
  ];

  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 6));
  var tuplet3 = new Vex.Flow.Tuplet(notes.slice(6, 9));
  var tuplet4 = new Vex.Flow.Tuplet(notes.slice(9, 12));
  tuplet1.setTupletLocation(Vex.Flow.Tuplet.LOCATION_TOP);
  tuplet2.setTupletLocation(Vex.Flow.Tuplet.LOCATION_TOP);
  tuplet3.setTupletLocation(Vex.Flow.Tuplet.LOCATION_TOP);
  tuplet4.setTupletLocation(Vex.Flow.Tuplet.LOCATION_TOP);

  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  voice1.setStrict(false);
  voice1.addTickables(notes);
  c.stave.addTimeSignature("4/4");
  c.stave.draw(c.context);

  Vex.Flow.Formatter.FormatAndDraw(c.context, c.stave, notes);

  voice1.draw(c.context, c.stave);

  tuplet1.setContext(c.context).draw();
  tuplet2.setContext(c.context).draw();
  tuplet3.setContext(c.context).draw();
  tuplet4.setContext(c.context).draw();

  ok(true, "Beamed Down Stem Test");
}

Vex.Flow.Test.Rests.tuplets = function(options) {
  var c = Vex.Flow.Test.Rests.setupContext(options, 600, 160);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["a/5"], stem_direction: 1, duration: "qr"}),
    newNote({ keys: ["g/5"], stem_direction: 1, duration: "qr"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),

    newNote({ keys: ["a/5"], stem_direction: 1, duration: "qr"}),
    newNote({ keys: ["g/5"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),

    newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["g/5"], stem_direction: 1, duration: "qr"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),

    newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["g/5"], stem_direction: 1, duration: "qr"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
  ];

  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 6));
  var tuplet3 = new Vex.Flow.Tuplet(notes.slice(6, 9));
  var tuplet4 = new Vex.Flow.Tuplet(notes.slice(9, 12));
  tuplet1.setTupletLocation(Vex.Flow.Tuplet.LOCATION_TOP);
  tuplet2.setTupletLocation(Vex.Flow.Tuplet.LOCATION_TOP);
  tuplet3.setTupletLocation(Vex.Flow.Tuplet.LOCATION_TOP);
  tuplet4.setTupletLocation(Vex.Flow.Tuplet.LOCATION_TOP);

  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  voice1.setStrict(false);
  voice1.addTickables(notes);
  c.stave.addTimeSignature("4/4");
  c.stave.draw(c.context);

  Vex.Flow.Formatter.FormatAndDraw(c.context, c.stave, notes);

  voice1.draw(c.context, c.stave);

  tuplet1.setContext(c.context).draw();
  tuplet2.setContext(c.context).draw();
  tuplet3.setContext(c.context).draw();
  tuplet4.setContext(c.context).draw();

  ok(true, "Tuplets Up Stem Test");
}

Vex.Flow.Test.Rests.tupletsdown = function(options) {
  var c = Vex.Flow.Test.Rests.setupContext(options, 600, 160);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    newNote({ keys: ["a/5"], stem_direction: -1, duration: "8r"}),
    newNote({ keys: ["g/5"], stem_direction: -1, duration: "8r"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),

    newNote({ keys: ["a/5"], stem_direction: -1, duration: "8r"}),
    newNote({ keys: ["g/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),

    newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["g/5"], stem_direction: -1, duration: "8r"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),

    newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["g/5"], stem_direction: -1, duration: "8r"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
  ];

  var beam1 = new Vex.Flow.Beam(notes.slice(0, 3));
  var beam2 = new Vex.Flow.Beam(notes.slice(3, 6));
  var beam3 = new Vex.Flow.Beam(notes.slice(6, 9));
  var beam4 = new Vex.Flow.Beam(notes.slice(9, 12));

  var tuplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var tuplet2 = new Vex.Flow.Tuplet(notes.slice(3, 6));
  var tuplet3 = new Vex.Flow.Tuplet(notes.slice(6, 9));
  var tuplet4 = new Vex.Flow.Tuplet(notes.slice(9, 12));
  tuplet1.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
  tuplet2.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
  tuplet3.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
  tuplet4.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);

  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  voice1.setStrict(false);
  voice1.addTickables(notes);
  c.stave.addTimeSignature("4/4");
  c.stave.draw(c.context);

  Vex.Flow.Formatter.FormatAndDraw(c.context, c.stave, notes);

  voice1.draw(c.context, c.stave);

  tuplet1.setContext(c.context).draw();
  tuplet2.setContext(c.context).draw();
  tuplet3.setContext(c.context).draw();
  tuplet4.setContext(c.context).draw();

  beam1.setContext(c.context).draw();
  beam2.setContext(c.context).draw();
  beam3.setContext(c.context).draw();
  beam4.setContext(c.context).draw();

  ok(true, "Tuplets Down Stem Test");
}
