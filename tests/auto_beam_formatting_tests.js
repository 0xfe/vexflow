/**
 * VexFlow - Auto-beaming Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.AutoBeamFormatting = (function() {
  var runTests = VF.Test.runTests;
  function newNote(note_struct) { return new VF.StaveNote(note_struct); }

  var AutoBeamFormatting = {
    Start: function() {
      QUnit.module('Auto-Beaming');
      runTests("Simple Auto Beaming",
                            AutoBeamFormatting.simpleAuto);
      runTests("Even Group Stem Directions",
                            AutoBeamFormatting.evenGroupStemDirections);
      runTests("Odd Group Stem Directions",
                            AutoBeamFormatting.oddGroupStemDirections);
      runTests("Odd Beam Groups Auto Beaming",
                            AutoBeamFormatting.oddBeamGroups);
      runTests("More Simple Auto Beaming 0",
                            AutoBeamFormatting.moreSimple0);
      runTests("More Simple Auto Beaming 1",
                            AutoBeamFormatting.moreSimple1);
      runTests("Beam Across All Rests",
                            AutoBeamFormatting.beamAcrossAllRests);
      runTests("Beam Across All Rests with Stemlets",
                            AutoBeamFormatting.beamAcrossAllRestsWithStemlets);
      runTests("Break Beams on Middle Rests Only",
                            AutoBeamFormatting.beamAcrossMiddleRests);
      runTests("Break Beams on Rest",
                            AutoBeamFormatting.breakBeamsOnRests);
      runTests("Maintain Stem Directions",
                            AutoBeamFormatting.maintainStemDirections);
      runTests("Maintain Stem Directions - Beam Over Rests",
                            AutoBeamFormatting.maintainStemDirectionsBeamAcrossRests);
      runTests("Beat group with unbeamable note - 2/2",
                            AutoBeamFormatting.groupWithUnbeamableNote);
      runTests("Offset beat grouping - 6/8 ",
                            AutoBeamFormatting.groupWithUnbeamableNote1);
      runTests("Odd Time - Guessing Default Beam Groups",
                            AutoBeamFormatting.autoOddBeamGroups);
      runTests("Custom Beam Groups",
                            AutoBeamFormatting.customBeamGroups);
      runTests("Simple Tuplet Auto Beaming",
                            AutoBeamFormatting.simpleTuplets);
      runTests("More Simple Tuplet Auto Beaming",
                            AutoBeamFormatting.moreSimpleTuplets);
      runTests("More Automatic Beaming",
                            AutoBeamFormatting.moreBeaming);
      runTests("Duration-Based Secondary Beam Breaks",
                            AutoBeamFormatting.secondaryBreaks);
      runTests("Flat Beams Up",
                            AutoBeamFormatting.flatBeamsUp);
      runTests("Flat Beams Down",
                            AutoBeamFormatting.flatBeamsDown);
      runTests("Flat Beams Mixed Direction",
                            AutoBeamFormatting.flatBeamsMixed);
      runTests("Flat Beams Up (uniform)",
                            AutoBeamFormatting.flatBeamsUpUniform);
      runTests("Flat Beams Down (uniform)",
                            AutoBeamFormatting.flatBeamsDownUniform);
      runTests("Flat Beams Up Bounds",
                            AutoBeamFormatting.flatBeamsUpBounds);
      runTests("Flat Beams Down Bounds",
                            AutoBeamFormatting.flatBeamsDownBounds);
    },

    setupContext: function(options, x, y) {
      var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 40, x || 450).addTrebleGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },



    simpleAuto: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["f/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      ok(true, "Auto Beaming Applicator Test");
    },

    evenGroupStemDirections: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["a/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["f/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/4"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;

      equal(beams[0].stem_direction, UP);
      equal(beams[1].stem_direction, UP);
      equal(beams[2].stem_direction, UP);
      equal(beams[3].stem_direction, UP);
      equal(beams[4].stem_direction, DOWN);
      equal(beams[5].stem_direction, DOWN);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      ok(true, "Auto Beaming Applicator Test");
    },

    oddGroupStemDirections: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["f/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/4"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["a/4"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["a/4"], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var groups = [
        new VF.Fraction(3, 8)
      ];

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice, null, groups);

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;

      equal(beams[0].stem_direction, DOWN, "Notes are equa-distant from middle line");
      equal(beams[1].stem_direction, DOWN);
      equal(beams[2].stem_direction, UP);
      equal(beams[3].stem_direction, DOWN, "Notes are equadistant from middle line");

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      ok(true, "Auto Beaming Applicator Test");
    },

    oddBeamGroups: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["f/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "8"}),
        newNote({ keys: ["f/4"], duration: "8"}),
        newNote({ keys: ["f/3"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "16"}),
        newNote({ keys: ["f/5"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode();
      voice.addTickables(notes);

      var Fraction = VF.Fraction;

      var groups = [
        new Fraction(2, 8),
        new Fraction(3, 8),
        new Fraction(1, 8)
      ];

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice, undefined, groups);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      ok(true, "Auto Beam Applicator Test");
    },

    moreSimple0: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["d/4"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    moreSimple1: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16r"}),
        newNote({ keys: ["c/5"], duration: "16r"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/4"], duration: "16"}),
        newNote({ keys: ["g/4"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["c/4", "e/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["a/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    breakBeamsOnRests: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/4"], duration: "16"}),
        newNote({ keys: ["g/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["e/4", "g/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["a/4"], duration: "16r"}),
        newNote({ keys: ["a/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        beam_rests: false
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    beamAcrossAllRestsWithStemlets: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/4"], duration: "16"}),
        newNote({ keys: ["g/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["e/4", "g/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["a/4"], duration: "16r"}),
        newNote({ keys: ["a/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        beam_rests: true,
        show_stemlets: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    beamAcrossAllRests: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/4"], duration: "16"}),
        newNote({ keys: ["g/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["e/4", "g/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["a/4"], duration: "16r"}),
        newNote({ keys: ["a/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        beam_rests: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },
    beamAcrossMiddleRests: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/4"], duration: "16"}),
        newNote({ keys: ["g/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["e/4", "g/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["a/4"], duration: "16r"}),
        newNote({ keys: ["a/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        beam_rests: true,
        beam_middle_only: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    maintainStemDirections: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options, 450, 200);

      var notes = [
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "32", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "32", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        beam_rests: false,
        maintain_stem_directions: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    maintainStemDirectionsBeamAcrossRests: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options, 450, 200);

      var notes = [
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "32", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "32", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        beam_rests: true,
        maintain_stem_directions: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    groupWithUnbeamableNote: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options, 450, 200);

      c.stave.addTimeSignature('2/2');

      c.context.clear();
      c.stave.draw();

      var notes = [
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "4", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        groups: [new VF.Fraction(2, 2)],
        beam_rests: false,
        maintain_stem_directions: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    groupWithUnbeamableNote1: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options, 450, 200);

      c.stave.addTimeSignature('6/8');

      c.context.clear();
      c.stave.draw();

      var notes = [
        newNote({ keys: ["b/4"], duration: "4", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "4", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "8", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "8", stem_direction: 1})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        groups: [new VF.Fraction(3, 8)],
        beam_rests: false,
        maintain_stem_directions: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    autoOddBeamGroups: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      var context = new options.contextBuilder(options.canvas_sel, 450, 400);

      context.scale(0.9, 0.9); context.fillStyle = "#221"; context.strokeStyle = "#221";

      var stave1 = new VF.Stave(10, 10, 450).addTrebleGlyph().
        setContext(context);
      stave1.addTimeSignature('5/4');

      var stave2 = new VF.Stave(10, 150, 450).addTrebleGlyph().
        setContext(context);
      stave2.addTimeSignature('5/8');

      var stave3 = new VF.Stave(10, 290, 450).addTrebleGlyph().
        setContext(context);
      stave3.addTimeSignature('13/16');

      var notes1 = [
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["d/4"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"})
      ];

      var notes2 = [
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"})
      ];

      var notes3 = [
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"})
      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice1.addTickables(notes1);

      var voice2 = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice2.addTickables(notes2);

      var voice3 = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice3.addTickables(notes3);

      stave1.draw();
      stave2.draw();
      stave3.draw();

      var groups1316 = [
        new VF.Fraction(3, 16),
        new VF.Fraction(2, 16)
      ];

      var beams = VF.Beam.applyAndGetBeams(voice1, undefined, VF.Beam.getDefaultBeamGroups('5/4'));
      var beams2 = VF.Beam.applyAndGetBeams(voice2, undefined, VF.Beam.getDefaultBeamGroups('5/8'));
      var beams3 = VF.Beam.applyAndGetBeams(voice3, undefined, VF.Beam.getDefaultBeamGroups('13/16'));

      var formatter1 = new VF.Formatter().
        formatToStave([voice1], stave1).
        formatToStave([voice2], stave2).
        formatToStave([voice3], stave3);

      voice1.draw(context, stave1);
      voice2.draw(context, stave2);
      voice3.draw(context, stave3);

      beams.forEach(function(beam){
        beam.setContext(context).draw();
      });

      beams2.forEach(function(beam){
        beam.setContext(context).draw();
      });

      beams3.forEach(function(beam){
        beam.setContext(context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    customBeamGroups: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      var context = new options.contextBuilder(options.canvas_sel, 450, 400);

      context.scale(0.9, 0.9); context.fillStyle = "#221"; context.strokeStyle = "#221";

      var stave1 = new VF.Stave(10, 10, 450).addTrebleGlyph().
        setContext(context);
      stave1.addTimeSignature('5/4');

      var stave2 = new VF.Stave(10, 150, 450).addTrebleGlyph().
        setContext(context);
      stave2.addTimeSignature('5/8');

      var stave3 = new VF.Stave(10, 290, 450).addTrebleGlyph().
        setContext(context);
      stave3.addTimeSignature('13/16');

      var notes1 = [
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["d/4"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"})
      ];

      var notes2 = [
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"})
      ];

      var notes3 = [
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"})
      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice1.addTickables(notes1);

      var voice2 = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice2.addTickables(notes2);

      var voice3 = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice3.addTickables(notes3);

      stave1.draw();
      stave2.draw();
      stave3.draw();

      var group1 = [
        new VF.Fraction(5, 8)
      ];

      var group2 = [
        new VF.Fraction(3, 8),
        new VF.Fraction(2, 8)
      ];

      var group3 = [
        new VF.Fraction(7, 16),
        new VF.Fraction(2, 16),
        new VF.Fraction(4, 16)
      ];

      var beams = VF.Beam.applyAndGetBeams(voice1, undefined, group1);
      var beams2 = VF.Beam.applyAndGetBeams(voice2, undefined, group2);
      var beams3 = VF.Beam.applyAndGetBeams(voice3, undefined, group3);

      var formatter1 = new VF.Formatter().
        formatToStave([voice1], stave1).
        formatToStave([voice2], stave2).
        formatToStave([voice3], stave3);

      voice1.draw(context, stave1);
      voice2.draw(context, stave2);
      voice3.draw(context, stave3);

      beams.forEach(function(beam){
        beam.setContext(context).draw();
      });

      beams2.forEach(function(beam){
        beam.setContext(context).draw();
      });

      beams3.forEach(function(beam){
        beam.setContext(context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    simpleTuplets: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["c/5", "e/5"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"})
        ];

      var triplet1 = new VF.Tuplet(notes.slice(0, 3));
      var quintuplet = new VF.Tuplet(notes.slice(5));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.setStrict(false);
      voice.addTickables(notes);

      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      triplet1.setContext(c.context).draw();
      quintuplet.setContext(c.context).draw();
      ok(true, "Auto Beam Applicator Test");
    },

    moreSimpleTuplets: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["d/4"], duration: "4"}),
        newNote({ keys: ["g/4"], duration: "4"}),
        newNote({ keys: ["c/5"], duration: "4"}),

        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/5", "e/5"], duration: "16"})
        ];

      var triplet1 = new VF.Tuplet(notes.slice(0, 3));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.setStrict(false);
      voice.addTickables(notes);

      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      triplet1.setContext(c.context).draw();
      ok(true, "Auto Beam Applicator Test");
    },

    moreBeaming: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "4"}),
        newNote({ keys: ["c/5"], duration: "8"}).addDotToAll(),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "4"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/5", "e/5"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "8"})
        ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.setStrict(false);
      voice.addTickables(notes);

      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      ok(true, "Auto Beam Applicator Test");
    },

    secondaryBreaks: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "16", dots: 1}),
          newNote({ keys: ["f/5"], duration: "32"}),

          newNote({ keys: ["f/5"], duration: "16"}),
          newNote({ keys: ["f/5"], duration: "8"}),
          newNote({ keys: ["f/5"], duration: "16"}),

          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "16", dots: 1}),
          newNote({ keys: ["f/5"], duration: "16", dots: 1}),
          newNote({ keys: ["f/5"], duration: "32"}),

          newNote({ keys: ["f/5"], duration: "16", dots: 1}),
          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "16", dots: 1})
      ];
      notes.forEach(function(note) {
        if (note.dots >= 1) {
          note.addDotToAll();
        }
      });
      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var beams = VF.Beam.generateBeams(notes, {
        secondary_breaks: '8'
      });
      var formatter = new VF.Formatter().joinVoices([voice]).formatToStave([voice], c.stave);
      voice.draw(c.context, c.stave);
      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Duration-Based Secondary Breaks Test");
    },

    flatBeamsUp: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);
      var notes = [
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["f/4"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"})
      ];
      var triplet1 = new VF.Tuplet(notes.slice(0, 3));
      var triplet2 = new VF.Tuplet(notes.slice(4, 7));
      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true,
        stem_direction: 1
      });
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);
      voice.draw(c.context, c.stave);
      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      triplet1.setContext(c.context).draw();
      triplet2.setContext(c.context).draw();
      ok(true, "Flat Beams Up Test");
    },

    flatBeamsDown: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["d/4", "f/4", "a/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["g/4"], duration: "64"}),
        newNote({ keys: ["g/4"], duration: "64"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true,
        stem_direction: -1
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Flat Beams Down Test");
    },

    flatBeamsMixed: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["d/5"], duration: "64"}),
        newNote({ keys: ["e/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["f/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["a/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["d/4", "f/4", "a/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["g/4"], duration: "64"}),
        newNote({ keys: ["g/4"], duration: "64"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Flat Beams Mixed Direction Test");
    },

    flatBeamsUpUniform: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);
      var notes = [
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"})
      ];
      var triplet1 = new VF.Tuplet(notes.slice(0, 3));
      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true,
        flat_beam_offset: 50,
        stem_direction: 1
      });
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);
      voice.draw(c.context, c.stave);
      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      triplet1.setContext(c.context).draw();
      ok(true, "Flat Beams Up (uniform) Test");
    },

    flatBeamsDownUniform: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["e/4", "g/4", "b/4"], duration: "16"}),
        newNote({ keys: ["e/5"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["g/4"], duration: "64"}),
        newNote({ keys: ["g/4"], duration: "64"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true,
        flat_beam_offset: 155,
        stem_direction: -1
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Flat Beams Down (uniform) Test");
    },

    flatBeamsUpBounds: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);
      var notes = [
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"})
      ];
      var triplet1 = new VF.Tuplet(notes.slice(0, 3));
      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true,
        flat_beam_offset: 60,
        stem_direction: 1
      });
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);
      voice.draw(c.context, c.stave);
      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      triplet1.setContext(c.context).draw();
      ok(true, "Flat Beams Up (uniform) Test");
    },

    flatBeamsDownBounds: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);
      var notes = [
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["g/4"], duration: "64"}),
        newNote({ keys: ["g/4"], duration: "64"}),

        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["a/5"], duration: "8"}),

        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["e/4", "g/4", "b/4"], duration: "16"}),
        newNote({ keys: ["e/5"], duration: "16"}),

        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true,
        flat_beam_offset: 145,
        stem_direction: -1
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Flat Beams Down (uniform) Test");
    }
  };

  return AutoBeamFormatting;
})();