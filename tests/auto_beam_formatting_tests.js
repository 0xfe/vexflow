/**
 * VexFlow - Auto-beaming Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.AutoBeamFormatting = (function() {
  function concat(a, b) { return a.concat(b); }

  var AutoBeamFormatting = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('Auto-Beaming');
      runTests('Simple Auto Beaming', AutoBeamFormatting.simpleAuto);
      runTests('Auto Beaming With Overflow Group', AutoBeamFormatting.simpleAutoWithOverflowGroup);
      runTests('Even Group Stem Directions', AutoBeamFormatting.evenGroupStemDirections);
      runTests('Odd Group Stem Directions', AutoBeamFormatting.oddGroupStemDirections);
      runTests('Odd Beam Groups Auto Beaming', AutoBeamFormatting.oddBeamGroups);
      runTests('More Simple Auto Beaming 0', AutoBeamFormatting.moreSimple0);
      runTests('More Simple Auto Beaming 1', AutoBeamFormatting.moreSimple1);
      runTests('Beam Across All Rests', AutoBeamFormatting.beamAcrossAllRests);
      runTests('Beam Across All Rests with Stemlets', AutoBeamFormatting.beamAcrossAllRestsWithStemlets);
      runTests('Break Beams on Middle Rests Only', AutoBeamFormatting.beamAcrossMiddleRests);
      runTests('Break Beams on Rest', AutoBeamFormatting.breakBeamsOnRests);
      runTests('Maintain Stem Directions', AutoBeamFormatting.maintainStemDirections);
      runTests('Maintain Stem Directions - Beam Over Rests', AutoBeamFormatting.maintainStemDirectionsBeamAcrossRests);
      runTests('Beat group with unbeamable note - 2/2', AutoBeamFormatting.groupWithUnbeamableNote);
      runTests('Offset beat grouping - 6/8 ', AutoBeamFormatting.groupWithUnbeamableNote1);
      runTests('Odd Time - Guessing Default Beam Groups', AutoBeamFormatting.autoOddBeamGroups);
      runTests('Custom Beam Groups', AutoBeamFormatting.customBeamGroups);
      runTests('Simple Tuplet Auto Beaming', AutoBeamFormatting.simpleTuplets);
      runTests('More Simple Tuplet Auto Beaming', AutoBeamFormatting.moreSimpleTuplets);
      runTests('More Automatic Beaming', AutoBeamFormatting.moreBeaming);
      runTests('Automatic Beaming 4/4 with  3, 3, 2 Pattern', AutoBeamFormatting.beamingWithSeveralGroups1);
      runTests('Automatic Beaming 4/4 with  3, 3, 2 Pattern and Overflow', AutoBeamFormatting.beamingWithSeveralGroupsOverflow);
      runTests('Automatic Beaming 8/4 with  3, 2, 3 Pattern and 2 Overflows', AutoBeamFormatting.beamingWithSeveralGroupsOverflow2);
      runTests('Automatic Beaming 8/4 with  3, 2, 3 Pattern and 3 Overflows', AutoBeamFormatting.beamingWithSeveralGroupsOverflow3);
      runTests('Duration-Based Secondary Beam Breaks', AutoBeamFormatting.secondaryBreaks);
      runTests('Duration-Based Secondary Beam Breaks 2', AutoBeamFormatting.secondaryBreaks2);
      runTests('Flat Beams Up', AutoBeamFormatting.flatBeamsUp);
      runTests('Flat Beams Down', AutoBeamFormatting.flatBeamsDown);
      runTests('Flat Beams Mixed Direction', AutoBeamFormatting.flatBeamsMixed);
      runTests('Flat Beams Up (uniform)', AutoBeamFormatting.flatBeamsUpUniform);
      runTests('Flat Beams Down (uniform)', AutoBeamFormatting.flatBeamsDownUniform);
      runTests('Flat Beams Up Bounds', AutoBeamFormatting.flatBeamsUpBounds);
      runTests('Flat Beams Down Bounds', AutoBeamFormatting.flatBeamsDownBounds);
    },

    simpleAuto: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'f5/8, e5, d5, c5/16, c5, d5/8, e5, f5, f5/32, f5, f5, f5'
      ), { time: '4/4' });

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beaming Applicator Test');
    },

    simpleAutoWithOverflowGroup: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'f5/4., e5/8, d5/8, d5/16, c5/16, c5/16, c5/16, f5/16, f5/32, f5/32'
      ), { time: '4/4' });

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beaming Applicator Test');
    },

    evenGroupStemDirections: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'a4/8, b4, g4, c5, f4, d5, e4, e5, b4, b4, g4, d5'
      ), { time: '6/4' });

      // Takes a voice and returns it's auto beams
      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;
      equal(beams[0].stem_direction, UP);
      equal(beams[1].stem_direction, UP);
      equal(beams[2].stem_direction, UP);
      equal(beams[3].stem_direction, UP);
      equal(beams[4].stem_direction, DOWN);
      equal(beams[5].stem_direction, DOWN);

      ok(true, 'Auto Beaming Applicator Test');
    },

    oddGroupStemDirections: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'g4/8, b4, d5, c5, f4, d5, e4, g5, g4, b4, g4, d5, a4, c5, a4'
      ), { time: '15/8' });

      var groups = [new VF.Fraction(3, 8)];
      var beams = VF.Beam.applyAndGetBeams(voice, null, groups);

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;
      equal(beams[0].stem_direction, DOWN, 'Notes are equadistant from middle line');
      equal(beams[1].stem_direction, DOWN);
      equal(beams[2].stem_direction, UP);
      equal(beams[3].stem_direction, DOWN, 'Notes are equadistant from middle line');

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beaming Applicator Test');
    },

    oddBeamGroups: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'f5, e5, d5, c5, c5, d5, e5, f5, f5, f4, f3, f5/16, f5'
      ), { time: '6/4' });

      var groups = [
        new VF.Fraction(2, 8),
        new VF.Fraction(3, 8),
        new VF.Fraction(1, 8),
      ];

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice, undefined, groups);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    moreSimple0: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c4/8, g4, c5, g5, a5, c4, d4, a5'
      ), { time: '4/4' });

      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    moreSimple1: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/16, g5, c5, c5/r, c5/r, (c4 e4 g4), d4, a5, c4, g4, c5, b4/r, (c4 e4), b4/r, b4/r, a4'
      ), { time: '4/4' });

      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    breakBeamsOnRests: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/16, g5, c5, c5/r, c5/r, (c4 e4 g4), d4, a5, c4, g4, c5, b4/r, (c4 e4), b4/r, b4/r, a4'
      ), { time: '4/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        beam_rests: false,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    beamAcrossAllRestsWithStemlets: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/16, g5, c5, c5/r, c5/r, (c4 e4 g4), d4, a5, c4, g4, c5, b4/r, (c4 e4), b4/r, b4/r, a4'
      ), { time: '4/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        beam_rests: true,
        show_stemlets: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    beamAcrossAllRests: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/16, g5, c5, c5/r, c5/r, (c4 e4 g4), d4, a5, c4, g4, c5, b4/r, (c4 e4), b4/r, b4/r, a4'
      ), { time: '4/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        beam_rests: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    beamAcrossMiddleRests: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/16, g5, c5, c5/r, c5/r, (c4 e4 g4), d4, a5, c4, g4, c5, b4/r, (c4 e4), b4/r, b4/r, a4'
      ), { time: '4/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        beam_rests: true,
        beam_middle_only: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    maintainStemDirections: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes([
        'b4/16,            b4,              b4[stem="down"], b4/r',
        'b4/r,             b4[stem="down"], b4,              b4',
        'b4[stem="down"],  b4[stem="down"], b4,              b4/r',
        'b4/32,            b4[stem="down"], b4[stem="down"], b4, b4/16/r, b4',
      ].join(', '), { stem: 'up' }), { time: '4/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        beam_rests: false,
        maintain_stem_directions: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    maintainStemDirectionsBeamAcrossRests: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes([
        'b4/16,            b4,              b4[stem="down"], b4/r',
        'b4/r,             b4[stem="down"], b4,              b4',
        'b4[stem="down"],  b4[stem="down"], b4,              b4/r',
        'b4/32,            b4[stem="down"], b4[stem="down"], b4, b4/16/r, b4',
      ].join(', '), { stem: 'up' }), { time: '4/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        beam_rests: true,
        maintain_stem_directions: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    groupWithUnbeamableNote: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave().addTimeSignature('2/4');
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'b4/16, b4, b4/4, b4/16, b4'
      ), { time: '2/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        groups: [new VF.Fraction(2, 2)],
        beam_rests: false,
        maintain_stem_directions: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    groupWithUnbeamableNote1: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave().addTimeSignature('6/8');
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'b4/4, b4/4, b4/8, b4/8'
      ), { time: '6/8' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        groups: [new VF.Fraction(3, 8)],
        beam_rests: false,
        maintain_stem_directions: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    autoOddBeamGroups: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 400);
      var score = vf.EasyScore();

      var stave1 = vf.Stave({ y: 10 }).addTimeSignature('5/4');
      var voice1 = score.voice(score.notes('c5/8, g5, c5, b4, b4, c4, d4, a5, c4, g4'), { time: '5/4' });

      var stave2 = vf.Stave({ y: 150 }).addTimeSignature('5/8');
      var voice2 = score.voice(score.notes('c5/8, g5, c5, b4, b4'), { time: '5/8' });

      var stave3 = vf.Stave({ y: 290 }).addTimeSignature('13/16');
      var voice3 = score.voice(score.notes('c5/16, g5, c5, b4, b4, c5, g5, c5, b4, b4, c5, b4, b4'), { time: '13/16' });

      var beams = [
        VF.Beam.applyAndGetBeams(voice1, undefined, VF.Beam.getDefaultBeamGroups('5/4')),
        VF.Beam.applyAndGetBeams(voice2, undefined, VF.Beam.getDefaultBeamGroups('5/8')),
        VF.Beam.applyAndGetBeams(voice3, undefined, VF.Beam.getDefaultBeamGroups('13/16')),
      ].reduce(concat);

      vf.Formatter()
        .formatToStave([voice1], stave1)
        .formatToStave([voice2], stave2)
        .formatToStave([voice3], stave3);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    customBeamGroups: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 400);
      var score = vf.EasyScore();

      var stave1 = vf.Stave({ y: 10 }).addTimeSignature('5/4');
      var voice1 = score.voice(score.notes('c5/8, g5, c5, b4, b4, c4, d4, a5, c4, g4'), { time: '5/4' });

      var stave2 = vf.Stave({ y: 150 }).addTimeSignature('5/8');
      var voice2 = score.voice(score.notes('c5/8, g5, c5, b4, b4'), { time: '5/8' });

      var stave3 = vf.Stave({ y: 290 }).addTimeSignature('13/16');
      var voice3 = score.voice(score.notes('c5/16, g5, c5, b4, b4, c5, g5, c5, b4, b4, c5, b4, b4'), { time: '13/16' });

      var group1 = [
        new VF.Fraction(5, 8),
      ];

      var group2 = [
        new VF.Fraction(3, 8),
        new VF.Fraction(2, 8),
      ];

      var group3 = [
        new VF.Fraction(7, 16),
        new VF.Fraction(2, 16),
        new VF.Fraction(4, 16),
      ];

      var beams = [
        VF.Beam.applyAndGetBeams(voice1, undefined, group1),
        VF.Beam.applyAndGetBeams(voice2, undefined, group2),
        VF.Beam.applyAndGetBeams(voice3, undefined, group3),
      ].reduce(concat);

      vf.Formatter()
        .formatToStave([voice1], stave1)
        .formatToStave([voice2], stave2)
        .formatToStave([voice3], stave3);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    simpleTuplets: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var notes = score.notes.bind(score);
      var tuplet = score.tuplet.bind(score);

      var voice = score.voice([
        tuplet(notes('c4/8, g4, c5')),
        notes('g5/8, a5'),
        tuplet(notes('a5/16, (c5 e5), a5, d5, a5'), {
          ratioed: false,
          notes_occupied: 4,
        }),
      ].reduce(concat), { time: '3/4' });

      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    moreSimpleTuplets: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var notes = score.notes.bind(score);
      var tuplet = score.tuplet.bind(score);

      var voice = score.voice([
        tuplet(notes('d4/4, g4, c5')),
        notes('g5/16, a5, a5, (c5 e5)'),
      ].reduce(concat), { time: '3/4' });

      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    moreBeaming: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c4/8, g4/4, c5/8., g5/16, a5/4, a5/16, (c5 e5)/16, a5/8'
      ), { time: '9/8' });

      var beams = VF.Beam.applyAndGetBeams(voice, undefined, VF.Beam.getDefaultBeamGroups('9/8'));

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    beamingWithSeveralGroups1: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c4/8, g4/4, c5/8, g5, a5, a5, f5'
      ), { time: '4/4' });

      var beams = VF.Beam.applyAndGetBeams(voice, undefined, [new VF.Fraction(3, 8), new VF.Fraction(3, 8), new VF.Fraction(2, 8)]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    beamingWithSeveralGroupsOverflow: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c4/8, g4/4., c5/8, g5, a5, a5'
      ), { time: '4/4' });

      var beams = VF.Beam.applyAndGetBeams(voice, undefined, [new VF.Fraction(3, 8), new VF.Fraction(3, 8), new VF.Fraction(2, 8)]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    beamingWithSeveralGroupsOverflow2: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c4/16, g4/2, f4/16, c5/8, a4/16, c4/16, g4/8, b4, c5, g5, f5, e5, c5, a4/4'
      ), { time: '8/4' });

      var beams = VF.Beam.applyAndGetBeams(voice, undefined, [new VF.Fraction(3, 8), new VF.Fraction(2, 8), new VF.Fraction(3, 8)]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    beamingWithSeveralGroupsOverflow3: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c4/16, g4/1, f4/16, c5/8, g5, f5, e5, c5, a4/4'
      ), { time: '8/4' });

      var beams = VF.Beam.applyAndGetBeams(voice, undefined, [new VF.Fraction(3, 8), new VF.Fraction(2, 8), new VF.Fraction(3, 8)]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    secondaryBreaks: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes([
        'f5/32, f5, f5, f5, f5/16., f5/32',
        'f5/16, f5/8, f5/16',
        'f5/32, f5/16., f5., f5/32',
        'f5/16., f5/32, f5, f5/16.',
      ].join(',')));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        secondary_breaks: '8',
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Duration-Based Secondary Breaks Test');
    },

    secondaryBreaks2: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var notes = score.notes.bind(score);
      var tuplet = score.tuplet.bind(score);

      var voice = score.voice([
        tuplet(notes('e5/16, f5, f5')),
        tuplet(notes('f5/16, f5, c5')),
        notes('a4/16., f4/32'),
        tuplet(notes('d4/16, d4, d4')),
        tuplet(notes('a5/8, (e5 g5), a5')),
        tuplet(notes('f5/16, f5, f5')),
        tuplet(notes('f5/16, f5, a4')),
      ].reduce(concat));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        secondary_breaks: '8',
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Duration-Based Secondary Breaks Test');
    },

    flatBeamsUp: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var tuplet = score.tuplet.bind(score);
      var notes = score.notes.bind(score);

      var voice = score.voice([
        tuplet(notes('c4/8, g4, f5')),
        notes('d5/8'),
        tuplet(notes('c5/16, (c4 e4 g4), f4')),
        notes('d5/8, e5, c4, f5/32, f5, f5, f5'),
      ].reduce(concat));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
        stem_direction: 1,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Up Test');
    },

    flatBeamsDown: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice = score.voice(
        score.notes(
          'c5/64, c5, c5, c5, c5, c5, c5, c5, a5/8, g5, (d4 f4 a4)/16, d4, d5/8, e5, g5, a6/32, a6, a6, g4/64, g4'
        )
      );

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
        stem_direction: -1,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Down Test');
    },

    flatBeamsMixed: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/64, d5, e5, c5, f5, c5, a5, c5, a5/8, g5, (d4 f4 a4)/16, d4, d5/8, e5, c4, a4/32, a4, a4, g4/64, g4'
      ));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Mixed Direction Test');
    },

    flatBeamsUpUniform: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var tuplet = score.tuplet.bind(score);
      var notes = score.notes.bind(score);

      var voice = score.voice([
        tuplet(notes('c4/8, g4, g5')),
        notes('d5/8, c5/16, (c4 e4 g4), d5/8, e5, c4, f5/32, f5, f5, f5'),
      ].reduce(concat));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
        flat_beam_offset: 50,
        stem_direction: 1,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Up (uniform) Test');
    },

    flatBeamsDownUniform: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/64, c5, c5, c5, c5, c5, c5, c5, a5/8, g5, (e4 g4 b4)/16, e5, d5/8, e5/8, g5/8, a6/32, a6, a6, g4/64, g4'
      ));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
        flat_beam_offset: 155,
        stem_direction: -1,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Down (uniform) Test');
    },

    flatBeamsUpBounds: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var tuplet = score.tuplet.bind(score);
      var notes = score.notes.bind(score);
      var voice = score.voice([
        tuplet(notes('c4/8, g4/8, g5/8')),
        notes('d5/8, c5/16, (c4 e4 g4)/16, d5/8, e5/8, c4/8, f5/32, f5/32, f5/32, f5/32'),
      ].reduce(concat));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
        flat_beam_offset: 60,
        stem_direction: 1,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Up (uniform) Test');
    },

    flatBeamsDownBounds: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes([
        'g5/8, a6/32, a6/32, a6/32, g4/64, g4/64',
        'c5/64, c5/64, c5/64, c5/64, c5/64, c5/64, c5/64, c5/64, a5/8',
        'g5/8, (e4 g4 b4)/16, e5/16',
        'd5/8, e5/8',
      ].join(','), { stem: 'down' }));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
        flat_beam_offset: 145,
        stem_direction: -1,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Down (uniform) Test');
    },
  };

  return AutoBeamFormatting;
})();
