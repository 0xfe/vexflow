/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

Vex.Flow.Test.ThreeVoices = {};

Vex.Flow.Test.ThreeVoices.Start = function() {
  module("Rests");
  Vex.Flow.Test.runTest("Three Voices - #1",
      Vex.Flow.Test.ThreeVoices.threevoices);
  Vex.Flow.Test.runTest("Three Voices - #2 Complex",
      Vex.Flow.Test.ThreeVoices.threevoices2);
  Vex.Flow.Test.runTest("Three Voices - #3",
      Vex.Flow.Test.ThreeVoices.threevoices3);
};

Vex.Flow.Test.ThreeVoices.setupContext = function(options, x, y) {
  Vex.Flow.Test.resizeCanvas(options.canvas_sel, x || 350, y || 150);
  var ctx = Vex.getCanvasContext(options.canvas_sel);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 30, x || 350).addTrebleGlyph().
    setContext(ctx).draw();

  return {context: ctx, stave: stave};
}

Vex.Flow.Test.ThreeVoices.threevoices = function(options, contextBuilder) {
  var c = new contextBuilder(options.canvas_sel, 600, 200);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }
  function newFinger(num, pos) { return new Vex.Flow.FretHandFinger(num).setPosition(pos); }

  var stave = new Vex.Flow.Stave(50, 10, 500).addTrebleGlyph();
  stave.setContext(c);
  stave.draw();

  var stave = new Vex.Flow.Stave(50, 10, 500).addTrebleGlyph();
  stave.setContext(c);
  stave.addTimeSignature("4/4");
  stave.draw();

  var notes = [
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "h"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "h"}),
  ];
  notes[0].
    addModifier(0, newFinger("0", Vex.Flow.Modifier.Position.LEFT));

  var notes1 = [
    newNote({ keys: ["d/5", "a/4", "d/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["c/5", "a/4", "d/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["c/5", "a/4", "d/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["c/5", "a/4", "d/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
  ];
  notes1[0].addAccidental(2, new Vex.Flow.Accidental("#")).
            addModifier(0, newFinger("0", Vex.Flow.Modifier.Position.LEFT)).
            addModifier(1, newFinger("2", Vex.Flow.Modifier.Position.LEFT)).
            addModifier(2, newFinger("4", Vex.Flow.Modifier.Position.RIGHT));

  var notes2 = [
    newNote({ keys: ["e/3"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["e/3"], stem_direction: -1, duration: "q"}),

    newNote({ keys: ["f/3"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["a/3"], stem_direction: -1, duration: "q"}),
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);
  voice1.addTickables(notes1);
  voice2.addTickables(notes2);
  var beam = Vex.Flow.Beam.applyAndGetBeams(voice, 1);
  var beam1 = Vex.Flow.Beam.applyAndGetBeams(voice1, -1);
  var beam2 = Vex.Flow.Beam.applyAndGetBeams(voice2, -1);

  // Set option to position rests near the notes in each voice
  var formatter = new Vex.Flow.Formatter().
    joinVoices([voice, voice1, voice2]).
    format([voice, voice1, voice2], 400);

  voice.draw(c, stave);
  voice1.draw(c, stave);
  voice2.draw(c, stave);
  for (var i = 0; i < beam.length; i++)
    beam[i].setContext(c).draw();
  for (var i = 0; i < beam1.length; i++)
    beam1[i].setContext(c).draw();
  for (var i = 0; i < beam2.length; i++)
    beam2[i].setContext(c).draw();

  ok(true, "Auto Align Rests - Align All Test");
}

Vex.Flow.Test.ThreeVoices.threevoices2 = function(options, contextBuilder) {
  var c = new contextBuilder(options.canvas_sel, 600, 200);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }
  function newFinger(num, pos) { return new Vex.Flow.FretHandFinger(num).setPosition(pos); }

  var stave = new Vex.Flow.Stave(50, 10, 500).addTrebleGlyph();
  stave.setContext(c);
  stave.draw();

  var stave = new Vex.Flow.Stave(50, 10, 500).addTrebleGlyph();
  stave.setContext(c);
  stave.addTimeSignature("4/4");
  stave.draw();

  var notes = [
    newNote({ keys: ["a/4", "e/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),

    newNote({ keys: ["e/5"], stem_direction: 1, duration: "h"}),
  ];
  notes[0].
    addModifier(0, newFinger("2", Vex.Flow.Modifier.Position.LEFT)).
    addModifier(1, newFinger("0", Vex.Flow.Modifier.Position.ABOVE));
//    addModifier(1, newFinger("0", Vex.Flow.Modifier.Position.LEFT).
//    setOffsetY(-6));

  var notes1 = [
    newNote({ keys: ["d/5", "d/4"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["b/4", "c/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["c/5", "a/4", "d/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["c/5", "a/4", "d/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["c/5", "a/4", "d/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
  ];
  notes1[0].addAccidental(1, new Vex.Flow.Accidental("#")).
            addModifier(0, newFinger("0", Vex.Flow.Modifier.Position.LEFT)).
            addModifier(1, newFinger("4", Vex.Flow.Modifier.Position.LEFT));

  var notes2 = [
    newNote({ keys: ["b/3"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["b/3"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["e/3"], stem_direction: -1, duration: "q"}),

    newNote({ keys: ["f/3"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["a/3"], stem_direction: -1, duration: "q"}),
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);
  voice1.addTickables(notes1);
  voice2.addTickables(notes2);
  var beam = Vex.Flow.Beam.applyAndGetBeams(voice, 1);
  var beam1 = Vex.Flow.Beam.applyAndGetBeams(voice1, -1);
  var beam2 = Vex.Flow.Beam.applyAndGetBeams(voice2, -1);

  // Set option to position rests near the notes in each voice
  var formatter = new Vex.Flow.Formatter().
    joinVoices([voice, voice1, voice2]).
    format([voice, voice1, voice2], 400);

  voice.draw(c, stave);
  voice1.draw(c, stave);
  voice2.draw(c, stave);
  for (var i = 0; i < beam.length; i++)
    beam[i].setContext(c).draw();
  for (var i = 0; i < beam1.length; i++)
    beam1[i].setContext(c).draw();
  for (var i = 0; i < beam2.length; i++)
    beam2[i].setContext(c).draw();

  ok(true, "Auto Align Rests - Align All Test");
}

Vex.Flow.Test.ThreeVoices.threevoices3 = function(options, contextBuilder) {
  var c = new contextBuilder(options.canvas_sel, 600, 200);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newFinger(num, pos) { return new Vex.Flow.FretHandFinger(num).setPosition(pos); }

  var stave = new Vex.Flow.Stave(50, 10, 500).addTrebleGlyph();
  stave.setContext(c);
  stave.draw();

  var stave = new Vex.Flow.Stave(50, 10, 500).addTrebleGlyph();
  stave.setContext(c);
  stave.addTimeSignature("4/4");
  stave.draw();

  var notes = [
    newNote({ keys: ["e/5", "g/4"], stem_direction: 1, duration: "h"}),
    newNote({ keys: ["e/5", "g/4"], stem_direction: 1, duration: "h"}),
  ];
  notes[0].addModifier(0, newFinger("0", Vex.Flow.Modifier.Position.LEFT)).
           addModifier(1, newFinger("0", Vex.Flow.Modifier.Position.LEFT));

  var notes1 = [
    newNote({ keys: ["c/5"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),

    newNote({ keys: ["a/4"], stem_direction: -1, duration: "qd"}).addDotToAll(),
    newNote({ keys: ["g/4"], stem_direction: -1, duration: "8"}),
  ];
  notes1[0].addAccidental(0, new Vex.Flow.Accidental("#")).
            addModifier(0, newFinger("1", Vex.Flow.Modifier.Position.LEFT));

  var notes2 = [
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["b/3"], stem_direction: -1, duration: "q"}),

    newNote({ keys: ["a/3"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"}),
  ];
  notes2[0].addModifier(0, newFinger("3", Vex.Flow.Modifier.Position.LEFT));

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);
  voice1.addTickables(notes1);
  voice2.addTickables(notes2);
  var beam = Vex.Flow.Beam.applyAndGetBeams(voice, 1);
  var beam1 = Vex.Flow.Beam.applyAndGetBeams(voice1, -1);
  var beam2 = Vex.Flow.Beam.applyAndGetBeams(voice2, -1);

  // Set option to position rests near the notes in each voice
  var formatter = new Vex.Flow.Formatter().
    joinVoices([voice, voice1, voice2]).
    format([voice, voice1, voice2], 400);

  voice.draw(c, stave);
  voice1.draw(c, stave);
  voice2.draw(c, stave);
  for (var i = 0; i < beam.length; i++)
    beam[i].setContext(c).draw();
  for (var i = 0; i < beam1.length; i++)
    beam1[i].setContext(c).draw();
  for (var i = 0; i < beam2.length; i++)
    beam2[i].setContext(c).draw();

  ok(true, "Auto Align Rests - Align All Test");
}
