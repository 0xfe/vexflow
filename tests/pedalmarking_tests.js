/**
 * VexFlow - PedalMarking Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.PedalMarking = (function() {
  var PedalMarking = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("PedalMarking");
      runTests("Simple Pedal 1", PedalMarking.simpleText);
      runTests("Simple Pedal 2", PedalMarking.simpleBracket);
      runTests("Simple Pedal 3", PedalMarking.simpleMixed);
      runTests("Release and Depress on Same Note 1", PedalMarking.releaseDepressOnSameNoteBracketed);
      runTests("Release and Depress on Same Note 2", PedalMarking.releaseDepressOnSameNoteMixed);
      runTests("Custom Text 1", PedalMarking.customText);
      runTests("Custom Text 2", PedalMarking.customTextMixed);
    },

    simpleText: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[2], notes0[3], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.TEXT);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    simpleBracket: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[2], notes0[3], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.BRACKET);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    simpleMixed: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[2], notes0[3], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.MIXED);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    releaseDepressOnSameNoteBracketed: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[3], notes0[3], notes1[1], notes1[1], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.BRACKET);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    releaseDepressOnSameNoteMixed: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[3], notes0[3], notes1[1], notes1[1],  notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.MIXED);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    customText: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.TEXT);

      pedal.setCustomText("una corda", "tre corda");

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();
    },

    customTextMixed: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.MIXED);
      pedal.setCustomText("Sost. Ped.");

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();
    }
  };

  return PedalMarking;
})();