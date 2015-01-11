/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

Vex.Flow.Test.ThreeVoices = {};

Vex.Flow.Test.ThreeVoices.Start = function() {
  module("Rests");
  Vex.Flow.Test.runTests("Three Voices - #1",
      Vex.Flow.Test.ThreeVoices.threevoices);
  Vex.Flow.Test.runTests("Three Voices - #2 Complex",
      Vex.Flow.Test.ThreeVoices.threevoices2);
  Vex.Flow.Test.runTests("Three Voices - #3",
      Vex.Flow.Test.ThreeVoices.threevoices3);
  Vex.Flow.Test.runTests("Auto Adjust Rest Positions - Two Voices",
      Vex.Flow.Test.ThreeVoices.autoresttwovoices);
  Vex.Flow.Test.runTests("Auto Adjust Rest Positions - Three Voices #1",
      Vex.Flow.Test.ThreeVoices.autorestthreevoices);
  Vex.Flow.Test.runTests("Auto Adjust Rest Positions - Three Voices #2",
      Vex.Flow.Test.ThreeVoices.autorestthreevoices2);
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

  ok(true, "Three Voices - Test #1");
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

  ok(true, "Three Voices - Test #2 Complex");
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
    newNote({ keys: ["e/5", "g/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "q"}),
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

  ok(true, "Three Voices - Test #3");
}

Vex.Flow.Test.ThreeVoices.autoresttwovoices = function(options, contextBuilder) {
  var c = new contextBuilder(options.canvas_sel, 900, 200);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }
  function newFinger(num, pos) { return new Vex.Flow.FretHandFinger(num).setPosition(pos); }

  function getNotes(text) {
    var notes = [
      newNote({ keys: ["b/4"], duration: "8r"}),
      newNote({ keys: ["e/5"], duration: "16"}),
      newNote({ keys: ["b/4"], duration: "16r"}),

      newNote({ keys: ["b/4"], duration: "8r"}),
      newNote({ keys: ["e/5"], duration: "16"}),
      newNote({ keys: ["b/4"], duration: "16r"}),

      newNote({ keys: ["b/4"], duration: "8r"}),
      newNote({ keys: ["d/5"], duration: "16"}),
      newNote({ keys: ["b/4"], duration: "16r"}),

      newNote({ keys: ["e/5"], duration: "q"}),
    ];

    var notes1 = [
      newNote({ keys: ["c/5"], stem_direction: -1, duration: "16"}),
      newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
      newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),

      newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
      newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
      newNote({ keys: ["g/4"], stem_direction: -1, duration: "16"}),

      newNote({ keys: ["g/4"], stem_direction: -1, duration: "16"}),
      newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
      newNote({ keys: ["b/4"], stem_direction: 1, duration: "16r"}),
      newNote({ keys: ["b/4"], stem_direction: 1, duration: "16"}),

      newNote({ keys: ["e/4"], duration: "q"}),
    ];

    var textnote = [
       new Vex.Flow.TextNote({text: text, line: -1, duration: "w", smooth: true}),
    ];

    return {notes: notes, notes1: notes1, textnote: textnote};

  }

  var stave = new Vex.Flow.Stave(50, 20, 400);
  stave.setContext(c);
  stave.draw();

  var n = getNotes("Default Rest Positions");
  n.textnote[0].setContext(c);
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(n.notes);
  voice1.addTickables(n.notes1);
  voice2.addTickables(n.textnote);

  var beam = Vex.Flow.Beam.applyAndGetBeams(voice, 1);
  var beam1 = Vex.Flow.Beam.applyAndGetBeams(voice1, -1);

  // Set option to position rests near the notes in each voice
  Vex.Debug = false;
  var formatter = new Vex.Flow.Formatter().
    joinVoices([voice, voice1, voice2]).
    format([voice, voice1, voice2], 350, {align_rests: false});

  voice.draw(c, stave);
  voice1.draw(c, stave);
  voice2.draw(c, stave);
  for (var i = 0; i < beam.length; i++)
    beam[i].setContext(c).draw();
  for (var i = 0; i < beam1.length; i++)
    beam1[i].setContext(c).draw();

  // Draw After rest adjustment
  var stave = new Vex.Flow.Stave(stave.width + stave.x, stave.y, 400);
  stave.setContext(c);
  stave.draw();

  n = getNotes("Rests Repositioned To Avoid Collisions");
  n.textnote[0].setContext(c);
  voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(n.notes);
  voice1.addTickables(n.notes1);
  voice2.addTickables(n.textnote);
  beam = Vex.Flow.Beam.applyAndGetBeams(voice, 1);
  beam1 = Vex.Flow.Beam.applyAndGetBeams(voice1, -1);

  // Set option to position rests near the notes in each voice
  Vex.Debug = true;
  var formatter = new Vex.Flow.Formatter().
    joinVoices([voice, voice1, voice2]).
    format([voice, voice1, voice2], 350, {align_rests: true});

  voice.draw(c, stave);
  voice1.draw(c, stave);
  voice2.draw(c, stave);
  for (var i = 0; i < beam.length; i++)
    beam[i].setContext(c).draw();
  for (var i = 0; i < beam1.length; i++)
    beam1[i].setContext(c).draw()
    ;
  ok(true, "Auto Adjust Rests - Two Voices");
}

Vex.Flow.Test.ThreeVoices.autorestthreevoices = function(options, contextBuilder) {
  var c = new contextBuilder(options.canvas_sel, 850, 200);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }
  function newFinger(num, pos) { return new Vex.Flow.FretHandFinger(num).setPosition(pos); }
  function getNotes(text) {

    var notes = [
      newNote({ keys: ["b/4"], duration: "qr"}),
      newNote({ keys: ["e/5"], duration: "q"}),
      newNote({ keys: ["e/5"], duration: "qr"}),
      newNote({ keys: ["e/5"], duration: "qr"}),
      newNote({ keys: ["e/5"], duration: "q"}),
      newNote({ keys: ["e/5"], duration: "q"}),
      newNote({ keys: ["e/5"], duration: "q"}),
      newNote({ keys: ["e/5"], duration: "qr"}),
    ];

    var notes1 = [
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "q"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "q"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "q"}),
    ];

    var notes2 = [
      newNote({ keys: ["e/4"], stem_direction: -1, duration: "qr"}),
      newNote({ keys: ["e/4"], stem_direction: -1, duration: "qr"}),
      newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
      newNote({ keys: ["g/4"], stem_direction: -1, duration: "q"}),
      newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
      newNote({ keys: ["e/4"], stem_direction: -1, duration: "qr"}),
      newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
    ];

    var textnote = [
       new Vex.Flow.TextNote({text: text, duration: "w", line: -1, smooth: true}),
       new Vex.Flow.TextNote({text: "", duration: "w", line: -1, smooth: true}),
    ];

    return {notes: notes, notes1: notes1, notes2: notes2, textnote: textnote};

  }

  var stave = new Vex.Flow.Stave(50, 20, 400).addTrebleGlyph();
  stave.setContext(c);
  stave.draw();

  var n = getNotes("Default Rest Positions");
  n.textnote[0].setContext(c);
  n.textnote[1].setContext(c);
  var voice = new Vex.Flow.Voice({
    num_beats: 8, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  var voice1 = new Vex.Flow.Voice({
    num_beats: 8, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  var voice2 = new Vex.Flow.Voice({
    num_beats: 8, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  var voice3 = new Vex.Flow.Voice({
    num_beats: 8, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  voice.addTickables(n.notes);
  voice1.addTickables(n.notes1);
  voice2.addTickables(n.notes2);
  voice3.addTickables(n.textnote);

  // Set option to position rests near the notes in each voice
  Vex.Debug = false;
  var formatter = new Vex.Flow.Formatter().
    joinVoices([voice, voice1, voice2, voice3]).
    format([voice, voice1, voice2, voice3], 350, {align_rests: false});

  voice.draw(c, stave);
  voice1.draw(c, stave);
  voice2.draw(c, stave);
  voice3.draw(c, stave);

  var stave2 = new Vex.Flow.Stave(stave.width + stave.x, stave.y, 350);
  stave2.setContext(c);
  stave2.draw();

  n = getNotes("Rests Repositioned To Avoid Collisions");
  n.textnote[0].setContext(c);
  n.textnote[1].setContext(c);
  voice = new Vex.Flow.Voice({
    num_beats: 8, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  voice1 = new Vex.Flow.Voice({
    num_beats: 8, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  voice2 = new Vex.Flow.Voice({
    num_beats: 8, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  voice3 = new Vex.Flow.Voice({
    num_beats: 8, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  voice.addTickables(n.notes);
  voice1.addTickables(n.notes1);
  voice2.addTickables(n.notes2);
  voice3.addTickables(n.textnote);

  // Set option to position rests near the notes in each voice
  Vex.Debug = true;
  formatter2 = new Vex.Flow.Formatter().
    joinVoices([voice, voice1, voice2, voice3]).
    format([voice, voice1, voice2, voice3], 350, {align_rests: true});

  voice.draw(c, stave2);
  voice1.draw(c, stave2);
  voice2.draw(c, stave2);
  voice3.draw(c, stave2);

  ok(true, "Auto Adjust Rests - three Voices #1");
}

Vex.Flow.Test.ThreeVoices.autorestthreevoices2 = function(options, contextBuilder) {
  var c = new contextBuilder(options.canvas_sel, 950, 200);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }
  function newFinger(num, pos) { return new Vex.Flow.FretHandFinger(num).setPosition(pos); }
  function getNotes(text) {

    var notes = [
      newNote({ keys: ["b/4"], duration: "16r"}),
      newNote({ keys: ["e/5"], duration: "16"}),
      newNote({ keys: ["e/5"], duration: "16r"}),
      newNote({ keys: ["e/5"], duration: "16r"}),
      newNote({ keys: ["e/5"], duration: "16"}),
      newNote({ keys: ["e/5"], duration: "16"}),
      newNote({ keys: ["e/5"], duration: "16"}),
      newNote({ keys: ["e/5"], duration: "16r"}),
    ];

    var notes1 = [
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "16"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "16"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "16"}),
    ];

    var notes2 = [
      newNote({ keys: ["e/4"], stem_direction: -1, duration: "16r"}),
      newNote({ keys: ["e/4"], stem_direction: -1, duration: "16r"}),
      newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
      newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
      newNote({ keys: ["g/4"], stem_direction: -1, duration: "16"}),
      newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
      newNote({ keys: ["e/4"], stem_direction: -1, duration: "16r"}),
      newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
    ];

    var textnote = [
       new Vex.Flow.TextNote({text: text, duration: "h", line: -1, smooth: true}),
    ];

    return {notes: notes, notes1: notes1, notes2: notes2, textnote: textnote};

  }

  var stave = new Vex.Flow.Stave(50, 20, 450).addTrebleGlyph();
  stave.setContext(c);
  stave.draw();

  var n = getNotes("Default Rest Positions");
  n.textnote[0].setContext(c);
  var voice = new Vex.Flow.Voice({
    num_beats: 2, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  var voice1 = new Vex.Flow.Voice({
    num_beats: 2, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  var voice2 = new Vex.Flow.Voice({
    num_beats: 2, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  var voice3 = new Vex.Flow.Voice({
    num_beats: 2, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  voice.addTickables(n.notes);
  voice1.addTickables(n.notes1);
  voice2.addTickables(n.notes2);
  voice3.addTickables(n.textnote);

  // Set option to position rests near the notes in each voice
  Vex.Debug = false;
  var formatter = new Vex.Flow.Formatter().
    joinVoices([voice, voice1, voice2, voice3]).
    format([voice, voice1, voice2, voice3], 400, {align_rests: false});

  voice.draw(c, stave);
  voice1.draw(c, stave);
  voice2.draw(c, stave);
  voice3.draw(c, stave);

  var stave2 = new Vex.Flow.Stave(stave.width + stave.x, stave.y, 425);
  stave2.setContext(c);
  stave2.draw();

  n = getNotes("Rests Repositioned To Avoid Collisions");
  n.textnote[0].setContext(c);
  voice = new Vex.Flow.Voice({
    num_beats: 2, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  voice1 = new Vex.Flow.Voice({
    num_beats: 2, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  voice2 = new Vex.Flow.Voice({
    num_beats: 2, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  voice3 = new Vex.Flow.Voice({
    num_beats: 2, beat_value: 4, resolution: Vex.Flow.RESOLUTION });
  voice.addTickables(n.notes);
  voice1.addTickables(n.notes1);
  voice2.addTickables(n.notes2);
  voice3.addTickables(n.textnote);

  // Set option to position rests near the notes in each voice
  Vex.Debug = true;
  formatter2 = new Vex.Flow.Formatter().
    joinVoices([voice, voice1, voice2, voice3]).
    format([voice, voice1, voice2, voice3], 400, {align_rests: true});

  voice.draw(c, stave2);
  voice1.draw(c, stave2);
  voice2.draw(c, stave2);
  voice3.draw(c, stave2);

  ok(true, "Auto Adjust Rests - three Voices #2");
}
