/**
 * VexFlow - Tuplet Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

/*
eslint-disable
no-undef,
no-var,
object-shorthand,
func-names,
wrap-iife,
vars-on-top,
 */

VF.Test.Tuplet = (function() {
  var Tuplet = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('Tuplet');
      runTests('Simple Tuplet', Tuplet.simple);
      runTests('Beamed Tuplet', Tuplet.beamed);
      runTests('Ratioed Tuplet', Tuplet.ratio);
      runTests('Bottom Tuplet', Tuplet.bottom);
      runTests('Bottom Ratioed Tuplet', Tuplet.bottom_ratio);
      runTests('Awkward Tuplet', Tuplet.awkward);
      runTests('Complex Tuplet', Tuplet.complex);
      runTests('Mixed Stem Direction Tuplet', Tuplet.mixedTop);
      runTests('Mixed Stem Direction Bottom Tuplet', Tuplet.mixedBottom);
      runTests('Nested Tuplets', Tuplet.nested);
    },

    simple: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('3/4');

      var notes = [
        { keys: ['g/4'], stem_direction: 1, duration: '4' },
        { keys: ['a/4'], stem_direction: 1, duration: '4' },
        { keys: ['b/4'], stem_direction: 1, duration: '4' },
        { keys: ['b/4'], stem_direction: 1, duration: '8' },
        { keys: ['a/4'], stem_direction: 1, duration: '8' },
        { keys: ['g/4'], stem_direction: 1, duration: '8' },
      ].map(vf.StaveNote);

      vf.Tuplet({ notes: notes.slice(0, 3) });
      vf.Tuplet({ notes: notes.slice(3, 6) });

      // 3/4 time
      var voice = new vf.Voice({ time: { num_beats: 3, beat_value: 4 } })
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Simple Test');
    },

    beamed: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('3/8');

      var notes = [
        { keys: ['b/4'], stem_direction: 1, duration: '16' },
        { keys: ['a/4'], stem_direction: 1, duration: '16' },
        { keys: ['g/4'], stem_direction: 1, duration: '16' },
        { keys: ['a/4'], stem_direction: 1, duration: '8' },
        { keys: ['f/4'], stem_direction: 1, duration: '8' },
        { keys: ['a/4'], stem_direction: 1, duration: '8' },
        { keys: ['f/4'], stem_direction: 1, duration: '8' },
        { keys: ['a/4'], stem_direction: 1, duration: '8' },
        { keys: ['f/4'], stem_direction: 1, duration: '8' },
        { keys: ['g/4'], stem_direction: 1, duration: '8' },
      ].map(vf.StaveNote);

      vf.Beam({ notes: notes.slice(0, 3) });
      vf.Beam({ notes: notes.slice(3, 10) });

      vf.Tuplet({ notes: notes.slice(0, 3) });
      vf.Tuplet({ notes: notes.slice(3, 10) });

      // 3/8 time
      var voice = vf.Voice({ time: { num_beats: 3, beat_value: 8 } })
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Beamed Test');
    },

    ratio: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('4/4');

      var notes = [
        { keys: ['f/4'], stem_direction: 1, duration: '4' },
        { keys: ['a/4'], stem_direction: 1, duration: '4' },
        { keys: ['b/4'], stem_direction: 1, duration: '4' },
        { keys: ['g/4'], stem_direction: 1, duration: '8' },
        { keys: ['e/4'], stem_direction: 1, duration: '8' },
        { keys: ['g/4'], stem_direction: 1, duration: '8' },
      ].map(vf.StaveNote);

      vf.Beam({ notes: notes.slice(3, 6) });
      vf.Tuplet({ notes: notes.slice(0, 3) });
      vf.Tuplet({
        notes: notes.slice(3, 6),
        options: { notes_occupied: 4 },
      });

      var voice = vf.Voice()
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Ratioed Test');
    },

    bottom: function(options) {
      var vf = VF.Test.makeFactory(options, 350, 160);
      var stave = vf.Stave({ x: 10, y: 10 }).addTimeSignature('3/4');

      var notes = [
        { keys: ['f/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['g/4'], stem_direction: -1, duration: '4' },
        { keys: ['d/5'], stem_direction: -1, duration: '8' },
        { keys: ['g/3'], stem_direction: -1, duration: '8' },
        { keys: ['b/4'], stem_direction: -1, duration: '8' },
      ].map(vf.StaveNote);

      vf.Beam({ notes: notes.slice(3, 6) });
      vf.Tuplet({
        notes: notes.slice(0, 3),
        options: { location: VF.Tuplet.LOCATION_BOTTOM },
      });
      vf.Tuplet({
        notes: notes.slice(3, 6),
        options: { location: VF.Tuplet.LOCATION_BOTTOM },
      });

      var voice = vf.Voice({ time: { num_beats: 3, beat_value: 4 } })
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Bottom Test');
    },

    bottom_ratio: function(options) {
      var vf = VF.Test.makeFactory(options, 350, 160);
      var stave = vf.Stave({ x: 10, y: 10 }).addTimeSignature('5/8');

      var notes = [
        { keys: ['f/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['d/4'], stem_direction: -1, duration: '4' },
        { keys: ['d/5'], stem_direction: -1, duration: '8' },
        { keys: ['g/5'], stem_direction: -1, duration: '8' },
        { keys: ['b/4'], stem_direction: -1, duration: '8' },
      ].map(vf.StaveNote);

      vf.Beam({
        notes: notes.slice(3, 6),
      });

      vf.Tuplet({
        notes: notes.slice(0, 3),
        options: {
          location: VF.Tuplet.LOCATION_BOTTOM,
        },
      });

      vf.Tuplet({
        notes: notes.slice(3, 6),
        options: {
          location: VF.Tuplet.LOCATION_BOTTOM,
          notes_occupied: 1,
        },
      });

      var voice = vf.Voice({ time: { num_beats: 5, beat_value: 8 } })
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Bottom Ratioed Test');
    },

    awkward: function(options) {
      var vf = VF.Test.makeFactory(options, 350, 160);
      var stave = vf.Stave({ x: 10, y: 10 });

      var notes = [
        { keys: ['g/4'], stem_direction: 1, duration: '16' },
        { keys: ['b/4'], stem_direction: 1, duration: '16' },
        { keys: ['a/4'], stem_direction: 1, duration: '16' },
        { keys: ['a/4'], stem_direction: 1, duration: '16' },
        { keys: ['g/4'], stem_direction: 1, duration: '16' },
        { keys: ['f/4'], stem_direction: 1, duration: '16' },
        { keys: ['e/4'], stem_direction: 1, duration: '16' },
        { keys: ['c/4'], stem_direction: 1, duration: '16' },
        { keys: ['g/4'], stem_direction: 1, duration: '16' },
        { keys: ['a/4'], stem_direction: 1, duration: '16' },
        { keys: ['f/4'], stem_direction: 1, duration: '16' },
        { keys: ['c/4'], stem_direction: 1, duration: '8' },
        { keys: ['d/4'], stem_direction: 1, duration: '8' },
        { keys: ['e/4'], stem_direction: 1, duration: '8' },
      ].map(vf.StaveNote);

      vf.Beam({ notes: notes.slice(0, 11) });
      vf.Tuplet({
        notes: notes.slice(0, 11),
        options: {
          notes_occupied: 142,
          ratioed: true,
        },
      });

      vf.Tuplet({
        notes: notes.slice(11, 14),
        options: {
          ratioed: true,
        },
      });

      tuplet2.setBracketed(true);

      var voice = new VF.Voice()
        .setStrict(false)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Awkward Test');
    },

    complex: function(options) {
      var vf = VF.Test.makeFactory(options, 600);
      var stave = vf.Stave({ x: 10, y: 10 }).addTimeSignature('4/4');

      var notes1 = [
        { keys: ['b/4'], stem_direction: 1, duration: '8d' },
        { keys: ['a/4'], stem_direction: 1, duration: '16' },
        { keys: ['g/4'], stem_direction: 1, duration: '8' },
        { keys: ['a/4'], stem_direction: 1, duration: '16' },
        { keys: ['b/4'], stem_direction: 1, duration: '16r' },
        { keys: ['g/4'], stem_direction: 1, duration: '32' },
        { keys: ['f/4'], stem_direction: 1, duration: '32' },
        { keys: ['g/4'], stem_direction: 1, duration: '32' },
        { keys: ['f/4'], stem_direction: 1, duration: '32' },
        { keys: ['a/4'], stem_direction: 1, duration: '16' },
        { keys: ['f/4'], stem_direction: 1, duration: '8' },
        { keys: ['b/4'], stem_direction: 1, duration: '8' },
        { keys: ['a/4'], stem_direction: 1, duration: '8' },
        { keys: ['g/4'], stem_direction: 1, duration: '8' },
        { keys: ['b/4'], stem_direction: 1, duration: '8' },
        { keys: ['a/4'], stem_direction: 1, duration: '8' },
      ].map(vf.StaveNote);

      notes1[0].addDotToAll();

      var notes2 = [
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
      ].map(vf.StaveNote);

      vf.Beam({ notes: notes1.slice(0, 3) });
      vf.Beam({ notes: notes1.slice(5, 9) });
      vf.Beam({ notes: notes1.slice(11, 16) });

      vf.Tuplet({
        notes: notes1.slice(0, 3),
      });

      vf.Tuplet({
        notes: notes1.slice(3, 11),
        options: {
          num_notes: 7,
          notes_occupied: 4,
          ratioed: false,
        },
      });

      vf.Tuplet({
        notes: notes1.slice(11, 16),
        options: {
          notes_occupied: 4,
        },
      });

      var voice1 = vf.Voice()
        .setStrict(true)
        .addTickables(notes1);

      var voice2 = vf.Voice()
        .setStrict(true)
        .addTickables(notes2);

      new VF.Formatter()
        .joinVoices([voice1, voice2])
        .formatToStave([voice1, voice2], stave);

      vf.draw();

      ok(true, 'Complex Test');
    },

    mixedTop: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10 });

      var notes = [
        { keys: ['a/4'], stem_direction: 1, duration: '4' },
        { keys: ['c/6'], stem_direction: -1, duration: '4' },
        { keys: ['a/4'], stem_direction: 1, duration: '4' },
        { keys: ['f/5'], stem_direction: 1, duration: '4' },
        { keys: ['a/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/6'], stem_direction: -1, duration: '4' },
      ].map(vf.StaveNote);

      vf.Tuplet({
        notes: notes.slice(0, 2),
        options: {
          notes_occupied: 3,
        },
      });

      vf.Tuplet({
        notes: notes.slice(2, 4),
        options: {
          notes_occupied: 3,
        },
      });

      vf.Tuplet({
        notes: notes.slice(4, 6),
        options: {
          notes_occupied: 3,
        },
      });

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Mixed Stem Direction Tuplet');
    },

    mixedBottom: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10 });

      var notes = [
        { keys: ['f/3'], stem_direction: 1, duration: '4' },
        { keys: ['a/5'], stem_direction: -1, duration: '4' },
        { keys: ['a/4'], stem_direction: 1, duration: '4' },
        { keys: ['f/3'], stem_direction: 1, duration: '4' },
        { keys: ['a/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
      ].map(vf.StaveNote);

      vf.Tuplet({
        notes: notes.slice(0, 2),
        options: {
          notes_occupied: 3,
        },
      });

      vf.Tuplet({
        notes: notes.slice(2, 4),
        options: {
          notes_occupied: 3,
        },
      });

      vf.Tuplet({
        notes: notes.slice(4, 6),
        options: {
          notes_occupied: 3,
        },
      });

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Mixed Stem Direction Bottom Tuplet');
    },

    nested: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10 }).addTimeSignature('4/4');

      var notes = [
        // Big triplet 1:
        { keys: ['b/4'], stem_direction: 1, duration: '4' },
        { keys: ['a/4'], stem_direction: 1, duration: '4' },
        { keys: ['g/4'], stem_direction: 1, duration: '16' },
        { keys: ['a/4'], stem_direction: 1, duration: '16' },
        { keys: ['f/4'], stem_direction: 1, duration: '16' },
        { keys: ['a/4'], stem_direction: 1, duration: '16' },
        { keys: ['g/4'], stem_direction: 1, duration: '16' },
        { keys: ['b/4'], stem_direction: 1, duration: 'h' },
      ].map(vf.StaveNote);

      vf.Beam({
        notes: notes.slice(2, 7),
      });

      vf.Tuplet({
        notes: notes.slice(0, 7),
        options: {
          notes_occupied: 2,
          num_notes: 3,
        },
      });

      vf.Tuplet({
        notes: notes.slice(2, 7),
        options: {
          notes_occupied: 4,
          num_notes: 5,
        },
      });

      // 4/4 time
      var voice = vf.Voice()
        .setStrict(true)
        .addTickables(notes);

      VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Nested Tuplets');
    },
  };

  return Tuplet;
})();
