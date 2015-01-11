/**
 * VexFlow - StaveHairpin Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 * This test by Raffaele Viglianti, 2012 http://itisnotsound.wordpress.com/
 */

Vex.Flow.Test.StaveHairpin = {}

Vex.Flow.Test.StaveHairpin.Start = function() {
  module("StaveHairpin");
  Vex.Flow.Test.runTests("Simple StaveHairpin", Vex.Flow.Test.StaveHairpin.simple);
  Vex.Flow.Test.runTests("Horizontal Offset StaveHairpin", Vex.Flow.Test.StaveHairpin.ho);
  Vex.Flow.Test.runTests("Vertical Offset StaveHairpin", Vex.Flow.Test.StaveHairpin.vo);
  Vex.Flow.Test.runTests("Height StaveHairpin", Vex.Flow.Test.StaveHairpin.height);
}

Vex.Flow.Test.StaveHairpin.drawHairpin = function(notes, stave, ctx, type, position, options) {  
  var hp = new Vex.Flow.StaveHairpin(notes, type);

  hp.setContext(ctx);
  hp.setPosition(position);
  if (options != undefined) {
    hp.setRenderOptions(options);
  }
  hp.draw();
}

Vex.Flow.Test.StaveHairpin.hairpinNotes = function(notes, options) {
  var ctx = new options.contextBuilder(options.canvas_sel, 350, 140);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  var stave = new Vex.Flow.Stave(10, 10, 350).setContext(ctx).draw();

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 250);
  voice.draw(ctx, stave);

  return [stave, ctx];
}

Vex.Flow.Test.StaveHairpin.simple = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  notes = [
    newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),
    newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
  ]

  render = Vex.Flow.Test.StaveHairpin.hairpinNotes(notes, options);
  Vex.Flow.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 4);
  Vex.Flow.Test.StaveHairpin.drawHairpin({first_note:notes[1], last_note:notes[3]}, render[0], render[1], 2, 3);

  ok(true, "Simple Test");
}

Vex.Flow.Test.StaveHairpin.ho = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  notes = [
    newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),
    newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
  ]

  render = Vex.Flow.Test.StaveHairpin.hairpinNotes(notes, options);
  render_options = {
      height: 10,
      vo: 20, //vertical offset
      left_ho: 20, //left horizontal offset
      right_ho: -20 // right horizontal offset
    };
  Vex.Flow.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 3, render_options);

  render_options = {
      height: 10,
      y_shift: 0, //vertical offset
      left_shift_px: 0, //left horizontal offset
      right_shift_px: 120 // right horizontal offset
    }; 
  Vex.Flow.Test.StaveHairpin.drawHairpin({first_note:notes[3], last_note:notes[3]}, render[0], render[1], 2, 4, render_options);

  ok(true, "Horizontal Offset Test");
}

Vex.Flow.Test.StaveHairpin.vo = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  notes = [
    newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),
    newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
  ]

  render = Vex.Flow.Test.StaveHairpin.hairpinNotes(notes, options);
  render_options = {
      height: 10,
      y_shift: 0, //vertical offset
      left_shift_px: 0, //left horizontal offset
      right_shift_px: 0 // right horizontal offset
    };
  Vex.Flow.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 4, render_options);

  render_options = {
      height: 10,
      y_shift: -15, //vertical offset
      left_shift_px: 2, //left horizontal offset
      right_shift_px: 0 // right horizontal offset
    };
  Vex.Flow.Test.StaveHairpin.drawHairpin({first_note:notes[2], last_note:notes[3]}, render[0], render[1], 2, 4, render_options);

  ok(true, "Vertical Offset Test");
}

Vex.Flow.Test.StaveHairpin.height = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  notes = [
    newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),
    newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
  ]

  render = Vex.Flow.Test.StaveHairpin.hairpinNotes(notes, options);
  render_options = {
      height: 10,
      y_shift: 0, //vertical offset
      left_shift_px: 0, //left horizontal offset
      right_shift_px: 0 // right horizontal offset
    };
  Vex.Flow.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 4, render_options);

  render_options = {
      height: 15,
      y_shift: 0, //vertical offset
      left_shift_px: 2, //left horizontal offset
      right_shift_px: 0 // right horizontal offset
    };
  Vex.Flow.Test.StaveHairpin.drawHairpin({first_note:notes[2], last_note:notes[3]}, render[0], render[1], 2, 4, render_options);

  ok(true, "Height Test");
}
