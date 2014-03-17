// VexFlow - Trill Tests

Vex.Flow.Test.GraceNote = {};

Vex.Flow.Test.GraceNote.Start = function() {
  module("Grace Notes");
  Vex.Flow.Test.runTest("Grace Note Basic", Vex.Flow.Test.GraceNote.basic);
  Vex.Flow.Test.runTest("Grace Note Basic with Slurs", Vex.Flow.Test.GraceNote.basicSlurred);
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

  var config = {
    beam: true,
    slur: false
  }

  note0.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes, config));
  note1.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes1, config));
  note2.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes2, config));
  note3.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes3, config));
  note4.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes4, config));

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
  gracenotes4[0].addDotToAll();

  var config = {
    beam: true,
    slur: true
  }

  note0.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes, config));
  note1.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes1, config));
  note2.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes2, config));
  note3.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes3, config));
  note4.addModifier(0, new Vex.Flow.GraceNoteGroup(gracenotes4, config));

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, [note0, note1, note2, note3, note4], 0);
  ok(true, "GraceNoteBasic");
}