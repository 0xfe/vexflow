/**
 * VexFlow - StaveHairpin Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 * Author: Raffaele Viglianti, 2012
 */

VF.Test.StaveHairpin = (function() {
  var StaveHairpin = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module("StaveHairpin");
      runTests("Simple StaveHairpin", StaveHairpin.simple);
      runTests("Horizontal Offset StaveHairpin", StaveHairpin.ho);
      runTests("Vertical Offset StaveHairpin", StaveHairpin.vo);
      runTests("Height StaveHairpin", StaveHairpin.height);
    },

    drawHairpin: function(notes, stave, ctx, type, position, options) {
      var hp = new VF.StaveHairpin(notes, type);

      hp.setContext(ctx);
      hp.setPosition(position);
      if (options != undefined) {
        hp.setRenderOptions(options);
      }
      hp.draw();
    },

    hairpinNotes: function(notes, options) {
      var ctx = new options.contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 350).setContext(ctx).draw();

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 250);
      voice.draw(ctx, stave);

      return [stave, ctx];
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
      ]

      var render = VF.Test.StaveHairpin.hairpinNotes(notes, options);
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 4);
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[1], last_note:notes[3]}, render[0], render[1], 2, 3);

      ok(true, "Simple Test");
    },

    ho: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
      ]

      var render = VF.Test.StaveHairpin.hairpinNotes(notes, options);
      var render_options = {
          height: 10,
          vo: 20, //vertical offset
          left_ho: 20, //left horizontal offset
          right_ho: -20 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 3, render_options);

      var render_options = {
          height: 10,
          y_shift: 0, //vertical offset
          left_shift_px: 0, //left horizontal offset
          right_shift_px: 120 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[3], last_note:notes[3]}, render[0], render[1], 2, 4, render_options);

      ok(true, "Horizontal Offset Test");
    },

    vo: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
      ]

      var render = VF.Test.StaveHairpin.hairpinNotes(notes, options);
      var render_options = {
          height: 10,
          y_shift: 0, //vertical offset
          left_shift_px: 0, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 4, render_options);

      var render_options = {
          height: 10,
          y_shift: -15, //vertical offset
          left_shift_px: 2, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[2], last_note:notes[3]}, render[0], render[1], 2, 4, render_options);

      ok(true, "Vertical Offset Test");
    },

    height: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
      ]

      var render = VF.Test.StaveHairpin.hairpinNotes(notes, options);
      var render_options = {
          height: 10,
          y_shift: 0, //vertical offset
          left_shift_px: 0, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 4, render_options);

      var render_options = {
          height: 15,
          y_shift: 0, //vertical offset
          left_shift_px: 2, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[2], last_note:notes[3]}, render[0], render[1], 2, 4, render_options);

      ok(true, "Height Test");
    }
  };

  return StaveHairpin;
})();