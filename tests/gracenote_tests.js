// VexFlow - Trill Tests

Vex.Flow.Test.GraceNote = {};

Vex.Flow.Test.GraceNote.Start = function() {
  module("Grace Notes");
  Vex.Flow.Test.runTests("Grace Note Basic", Vex.Flow.Test.GraceNote.basic);
  Vex.Flow.Test.runTests("Grace Note Basic with Slurs", Vex.Flow.Test.GraceNote.basicSlurred);
  Vex.Flow.Test.runTests("Grace Notes Multiple Voices", Vex.Flow.Test.GraceNote.multipleVoices);
}

Vex.Flow.Test.GraceNote.helper = function(options, contextBuilder, ctxWidth, staveWidth){
  var ctx = contextBuilder(options.canvas_sel, ctxWidth, 130);
  ctx.scale(1.0, 1.0); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  var stave = new Vex.Flow.Stave(10, 10, staveWidth).addClef("treble").setContext(ctx).draw();
  return {
    ctx: ctx,
    stave: stave,
    newNote: function newNote(note_struct) {
      return new Vex.Flow.StaveNote(note_struct); 
    }
 };
};

Vex.Flow.Test.GraceNote.basic = function(options, contextBuilder) {
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 700, 650);

  var note0 =  new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4", auto_stem: true });
  var note1 =  new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "4", auto_stem: true });
  var note2 =  new Vex.Flow.StaveNote({ keys: ["c/5", "d/5"], duration: "4", auto_stem: true });
  var note3 =  new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", auto_stem: true });
  var note4 =  new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", auto_stem: true });
  var note5 =  new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", auto_stem: true });
  note1.addAccidental(0, new Vex.Flow.Accidental("#"));

  var gracenote_group0 = [
    { keys: ["e/4"], duration: "32"},
    { keys: ["f/4"], duration: "32"},
    { keys: ["g/4"], duration: "32"},
    { keys: ["a/4"], duration: "32"}
  ];

  var gracenote_group1 = [
    { keys: ["b/4"], duration: "8", slash: false}
  ];

  var gracenote_group2 = [
    { keys: ["b/4"], duration: "8", slash: true}
  ];

  var gracenote_group3 = [
    { keys: ["e/4"], duration: "8"},
    { keys: ["f/4"], duration: "16"},
    { keys: ["g/4", "e/4"], duration: "8"},
    { keys: ["a/4"], duration: "32"},
    { keys: ["b/4"], duration: "32"}
  ];

  var gracenote_group4 = [
    { keys: ["g/4"], duration: "8"},
    { keys: ["g/4"], duration: "16"},
    { keys: ["g/4"], duration: "16"}
  ];

  function createNote(note_prop) {
    return new Vex.Flow.GraceNote(note_prop);
  }

  var gracenotes = gracenote_group0.map(createNote);
  var gracenotes1 = gracenote_group1.map(createNote);
  var gracenotes2 = gracenote_group2.map(createNote);
  var gracenotes3 = gracenote_group3.map(createNote);
  var gracenotes4 = gracenote_group4.map(createNote);

  gracenotes[1].addAccidental(0, new Vex.Flow.Accidental('##'));
  gracenotes3[3].addAccidental(0, new Vex.Flow.Accidental('bb'));

  gracenotes4[0].addDotToAll();

  note0.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes).beamNotes());
  note1.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes1).beamNotes());
  note2.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes2).beamNotes());
  note3.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes3).beamNotes());
  note4.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes4).beamNotes());

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, [note0, note1, note2, note3, note4], 0);
  ok(true, "GraceNoteBasic");
}

Vex.Flow.Test.GraceNote.basicSlurred = function(options, contextBuilder) {
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 700, 650);

  var note0 =  new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4", auto_stem: true });
  var note1 =  new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "4", auto_stem: true });
  var note2 =  new Vex.Flow.StaveNote({ keys: ["c/5", "d/5"], duration: "4", auto_stem: true });
  var note3 =  new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", auto_stem: true });
  var note4 =  new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", auto_stem: true });
  var note5 =  new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", auto_stem: true });
  note1.addAccidental(0, new Vex.Flow.Accidental("#"));

  var gracenote_group0 = [
    { keys: ["e/4"], duration: "32"},
    { keys: ["f/4"], duration: "32"},
    { keys: ["g/4"], duration: "32"},
    { keys: ["a/4"], duration: "32"}
  ];

  var gracenote_group1 = [
    { keys: ["b/4"], duration: "8", slash: false}
  ];

  var gracenote_group2 = [
    { keys: ["b/4"], duration: "8", slash: true}
  ];

  var gracenote_group3 = [
    { keys: ["e/4"], duration: "8"},
    { keys: ["f/4"], duration: "16"},
    { keys: ["g/4", "e/4"], duration: "8"},
    { keys: ["a/4"], duration: "32"},
    { keys: ["b/4"], duration: "32"}
  ];

  var gracenote_group4 = [
    { keys: ["a/4"], duration: "8"},
    { keys: ["a/4"], duration: "16"},
    { keys: ["a/4"], duration: "16"}
  ];

  function createNote(note_prop) {
    return new Vex.Flow.GraceNote(note_prop);
  }

  var gracenotes = gracenote_group0.map(createNote);
  var gracenotes1 = gracenote_group1.map(createNote);
  var gracenotes2 = gracenote_group2.map(createNote);
  var gracenotes3 = gracenote_group3.map(createNote);
  var gracenotes4 = gracenote_group4.map(createNote);

  gracenotes[1].addAccidental(0, new Vex.Flow.Accidental('#'));
  gracenotes3[3].addAccidental(0, new Vex.Flow.Accidental('b'));
  gracenotes3[2].addAccidental(0, new Vex.Flow.Accidental('n'));
  gracenotes4[0].addDotToAll();


  note0.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes, true).beamNotes());
  note1.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes1, true).beamNotes());
  note2.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes2, true).beamNotes());
  note3.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes3, true).beamNotes());
  note4.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes4, true).beamNotes());

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, [note0, note1, note2, note3, note4], 0);
  ok(true, "GraceNoteBasic");
}

Vex.Flow.Test.GraceNote.multipleVoices = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;

  var context = new options.contextBuilder(options.canvas_sel, 450, 140);
  context.scale(0.9, 0.9); context.fillStyle = "#221"; context.strokeStyle = "#221";
  context.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 10, 450).addTrebleGlyph().
    setContext(context).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"})
  ];

  var notes2 = [
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"})
  ];

  function createNote(note_prop) {
    return new Vex.Flow.GraceNote(note_prop);
  }

  var gracenote_group0 = [
    { keys: ["b/4"], duration: "8", slash: true}
  ];

  var gracenote_group1 = [
    { keys: ["f/4"], duration: "8", slash: true}
  ];

  var gracenote_group2 = [
    { keys: ["f/4"], duration: "32", stem_direction: -1},
    { keys: ["e/4"], duration: "32", stem_direction: -1}
  ];

  var gracenotes1 = gracenote_group0.map(createNote);
  var gracenotes2 = gracenote_group1.map(createNote);
  var gracenotes3 = gracenote_group2.map(createNote);

  gracenotes2[0].setStemDirection(-1);
  gracenotes2[0].addAccidental(0, new Vex.Flow.Accidental('#'));

  notes[3].addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes1));
  notes2[1].addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes2).beamNotes());
  notes2[5].addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes3).beamNotes());

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).setStrict(false);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).setStrict(false);
  voice.addTickables(notes);
  voice2.addTickables(notes2);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice, voice2]).
    formatToStave([voice, voice2], stave);
  var beam1_1 = new Vex.Flow.Beam(notes.slice(0, 4));
  var beam1_2 = new Vex.Flow.Beam(notes.slice(4, 8));

  var beam2_1 = new Vex.Flow.Beam(notes2.slice(0, 4));
  var beam2_2 = new Vex.Flow.Beam(notes2.slice(4, 8));

  voice.draw(context, stave);
  voice2.draw(context, stave);
  beam1_1.setContext(context).draw();
  beam1_2.setContext(context).draw();

  beam2_1.setContext(context).draw();
  beam2_2.setContext(context).draw();
  ok(true, "Sixteenth Test");
}