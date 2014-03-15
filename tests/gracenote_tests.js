// VexFlow - Trill Tests

Vex.Flow.Test.GraceNote = {};

Vex.Flow.Test.GraceNote.Start = function() {
  module("Grace Notes");
  Vex.Flow.Test.runTest("Grace Note Basic", Vex.Flow.Test.GraceNote.basic);
  Vex.Flow.Test.runRaphaelTest("Grace Note Basic (Raphael)", Vex.Flow.Test.GraceNote.basic);
  Vex.Flow.Test.runTest("Grace Note Throws", Vex.Flow.Test.GraceNote.thrown);
  Vex.Flow.Test.runRaphaelTest("Grace Note Throws (Raphael)", Vex.Flow.Test.GraceNote.thrown);
  Vex.Flow.Test.runTest("Grace Note Doublings", Vex.Flow.Test.GraceNote.doublings);
  Vex.Flow.Test.runRaphaelTest("Grace Note Doublings (Raphael)", Vex.Flow.Test.GraceNote.doublings);
  Vex.Flow.Test.runTest("Grace Note Birls", Vex.Flow.Test.GraceNote.birls);
  Vex.Flow.Test.runRaphaelTest("Grace Note Birls (Raphael)", Vex.Flow.Test.GraceNote.birls);
  Vex.Flow.Test.runTest("Grace Note Grips", Vex.Flow.Test.GraceNote.grips);
  Vex.Flow.Test.runRaphaelTest("Grace Note Grips (Raphael)", Vex.Flow.Test.GraceNote.grips);
  Vex.Flow.Test.runTest("Grace Note Taurluaths", Vex.Flow.Test.GraceNote.taurluaths);
  Vex.Flow.Test.runRaphaelTest("Grace Note Taurluaths (Raphael)", Vex.Flow.Test.GraceNote.taurluaths);
}

Vex.Flow.Test.GraceNote.helper = function(options, contextBuilder, ctxWidth, staveWidth){
  var ctx = contextBuilder(options.canvas_sel, ctxWidth, 240);
  ctx.scale(1, 1.0); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
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
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 500, 300);

  var notes = [];
  
  // G grace note on low A
  notes.push(measure.newNote({
  keys: ["a/5"],
    duration: "q",
    stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
    keys: ['g/5'],
    duration: "16",
    isGraceNote: true
  }));

  // D grace note on low A
  notes.push(measure.newNote({
  keys: ["a/4"],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
    keys: ['d/5', 'b/4'],
    duration: "16",
    isGraceNote: true
  }));

  // E grace note on low A
  notes.push(measure.newNote({
  keys: ["a/4"],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
    keys: ['e/5'],
    duration: "32",
    isGraceNote: true
  }));

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, notes, 100);
  ok(true, "GraceNoteBasic");
}

Vex.Flow.Test.GraceNote.thrown = function(options, contextBuilder){
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 500, 300);

  var notes = [];
  
  // A throw on high A
  notes.push(measure.newNote({
  keys: ["a/5"],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
  keys: ['a/5', 'g/5'],
  duration: "32",
  isGraceNote: true
  }));
    
  // G throw on high G
  notes.push(measure.newNote({
  keys: ["g/5"],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
  keys: ['g/5', 'f/5'],
  duration: "32",
  isGraceNote: true
  }));
  
  // D throw
  notes.push(measure.newNote({
  keys: ["d/5"],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
  keys: ['g/4', 'd/5', 'c/5'],
  duration: "32",
  isGraceNote: true
  }));
  
  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, notes, 100);
  ok(true, "GraceNoteThrows");
}

Vex.Flow.Test.GraceNote.doublings = function(options, contextBuilder){
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 625, 400);

  var notes = [];
  
  // A, B and C doublings all share the same grace note group
  var lowHandDoublingNotes = ['a/4', 'b/4', 'c/5'];
  
  for (var i = 0; i < lowHandDoublingNotes.length; i++) {
    notes.push(measure.newNote({
      keys: [lowHandDoublingNotes[i]],
      duration: "q",
      stem_direction: Vex.Flow.StaveNote.STEM_DOWN
    }).addGraceNoteGroup(0, {
      keys: ['g/5', 'c/5', 'd/5'],
      duration: "32",
      isGraceNote: true
    }));
  }
  
  // D doubling
  notes.push(measure.newNote({
  keys: ['d/5'],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
  keys: ['g/5', 'd/5', 'e/5'],
  duration: "32",
  isGraceNote: true
  }));
    
  // E doubling
  notes.push(measure.newNote({
  keys: ['e/5'],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
  keys: ['g/5', 'e/5', 'f/5'],
  duration: "32",
  isGraceNote: true
  }));
      
  // F doubling
  notes.push(measure.newNote({
  keys: ['f/5'],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
  keys: ['g/5', 'f/5', 'g/5'],
  duration: "32",
  isGraceNote: true
  }));

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, notes, 100);
  ok(true, "GraceNoteDoublings");
}

Vex.Flow.Test.GraceNote.birls = function(options, contextBuilder){
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 500, 300);

  var notes = [];

  // standard birl
  notes.push(measure.newNote({
  keys: ["a/4"],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
  keys: ['g/4', 'a/4', 'g/4'],
  duration: "32",
  isGraceNote: true
  }));
  
  // extra low A birl
  notes.push(measure.newNote({
  keys: ["a/4"],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
  keys: ['a/4', 'g/4', 'a/4', 'g/4'],
  duration: "32",
  isGraceNote: true
  }));

  // G gracenote birl
  notes.push(measure.newNote({
  keys: ["a/4"],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
  keys: ['g/5', 'a/4', 'g/4', 'a/4', 'g/4'],
  duration: "32",
  isGraceNote: true
  }));

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, notes, 100);
  ok(true, "GraceNoteBirls");
}

Vex.Flow.Test.GraceNote.grips = function(options, contextBuilder){
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 500, 300);

  var notes = [];
  
  var grip = {
  keys: ['g/4', 'd/5', 'g/4'],
  duration: "32",
  isGraceNote: true
  };
  
  var validGripNotes = ['b/4', 'c/5', 'e/5', 'f/5', 'g/5', 'a/5'];
  
  for (var i = 0; i < validGripNotes.length; i++) {
    notes.push(measure.newNote({
      keys: [validGripNotes[i]],
      duration: "q",
      stem_direction: Vex.Flow.StaveNote.STEM_DOWN
    }).addGraceNoteGroup(0, grip));
  }

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, notes, 100);
  ok(true, "GraceNoteDoublings");
}

Vex.Flow.Test.GraceNote.taurluaths = function(options, contextBuilder){
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 500, 300);

  var notes = [];

  // Taurluath on low A
  notes.push(measure.newNote({
  keys: ["a/4"],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
  keys: ['g/4', 'd/5', 'g/4', 'e/5'],
  duration: "32",
  isGraceNote: true
  }));
  
  // Taurluath on B
  notes.push(measure.newNote({
  keys: ["b/4"],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
  keys: ['g/4', 'd/5', 'g/4', 'e/5'],
  duration: "32",
  isGraceNote: true
  }));

  // Taurluath on C
  notes.push(measure.newNote({
  keys: ["c/5"],
  duration: "q",
  stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(0, {
  keys: ['g/4', 'd/5', 'g/4', 'e/5'],
  duration: "32",
  isGraceNote: true
  }));

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, notes, 100);
  ok(true, "GraceNoteTaurluaths");
}
