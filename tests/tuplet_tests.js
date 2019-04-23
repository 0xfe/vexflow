/**
 * VexFlow - Tuplet Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Tuplet = (function() {
  // Ideally this would be using arrow syntax...
  var set = function(key) {
    return function(value) {
      return function(object) {
        object[key] = value;
        return object;
      };
    };
  };

  var setStemDirection = set('stem_direction');
  var setDuration = set('duration');

  var stemUp = setStemDirection(VF.Stem.UP);
  var stemDown = setStemDirection(VF.Stem.DOWN);
  var quarterNote = setDuration('4');

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
      runTests('Single Tuplets', Tuplet.single);
    },

    simple: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('3/4');

      var notes = [
        { keys: ['g/4'], duration: '4' },
        { keys: ['a/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['b/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      vf.Tuplet({ notes: notes.slice(0, 3) });
      vf.Tuplet({ notes: notes.slice(3, 6) });

      // 3/4 time
      var voice = vf.Voice({ time: { num_beats: 3, beat_value: 4 } })
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
        { keys: ['b/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

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
        { keys: ['f/4'], duration: '4' },
        { keys: ['a/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['g/4'], duration: '8' },
        { keys: ['e/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      vf.Beam({
        notes: notes.slice(3, 6),
      });

      vf.Tuplet({
        notes: notes.slice(0, 3),
        options: {
          ratioed: true,
        },
      });

      vf.Tuplet({
        notes: notes.slice(3, 6),
        options: {
          ratioed: true,
          notes_occupied: 4,
        },
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
        { keys: ['f/4'], duration: '4' },
        { keys: ['c/4'], duration: '4' },
        { keys: ['g/4'], duration: '4' },
        { keys: ['d/5'], duration: '8' },
        { keys: ['g/3'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
      ].map(stemDown).map(vf.StaveNote.bind(vf));

      vf.Beam({
        notes: notes.slice(3, 6),
      });

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
        { keys: ['f/4'], duration: '4' },
        { keys: ['c/4'], duration: '4' },
        { keys: ['d/4'], duration: '4' },
        { keys: ['d/5'], duration: '8' },
        { keys: ['g/5'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
      ].map(stemDown).map(vf.StaveNote.bind(vf));

      vf.Beam({
        notes: notes.slice(3, 6),
      });

      vf.Tuplet({
        notes: notes.slice(0, 3),
        options: {
          location: VF.Tuplet.LOCATION_BOTTOM,
          ratioed: true,
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
      var vf = VF.Test.makeFactory(options, 370, 160);
      var stave = vf.Stave({ x: 10, y: 10 });

      var notes = [
        { keys: ['g/4'], duration: '16' },
        { keys: ['b/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['e/4'], duration: '16' },
        { keys: ['c/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['e/4'], duration: '16' },
        { keys: ['c/4'], duration: '8' },
        { keys: ['d/4'], duration: '8' },
        { keys: ['e/4'], duration: '8' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      vf.Beam({ notes: notes.slice(0, 12) });
      vf.Tuplet({
        notes: notes.slice(0, 12),
        options: {
          notes_occupied: 142,
          ratioed: true,
        },
      });

      vf.Tuplet({
        notes: notes.slice(12, 15),
        options: {
          ratioed: true,
        },
      }).setBracketed(true);

      var voice = vf.Voice()
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
        { keys: ['b/4'], duration: '8d' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['g/4'], duration: '8' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['b/4'], duration: '16r' },
        { keys: ['g/4'], duration: '32' },
        { keys: ['f/4'], duration: '32' },
        { keys: ['g/4'], duration: '32' },
        { keys: ['f/4'], duration: '32' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      notes1[0].addDotToAll();

      var notes2 = [
        { keys: ['c/4'] },
        { keys: ['c/4'] },
        { keys: ['c/4'] },
        { keys: ['c/4'] },
      ].map(quarterNote).map(stemDown).map(vf.StaveNote.bind(vf));

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
        { keys: ['a/4'], stem_direction: 1 },
        { keys: ['c/6'], stem_direction: -1 },
        { keys: ['a/4'], stem_direction: 1 },
        { keys: ['f/5'], stem_direction: 1 },
        { keys: ['a/4'], stem_direction: -1 },
        { keys: ['c/6'], stem_direction: -1 },
      ].map(quarterNote).map(vf.StaveNote.bind(vf));

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
        { keys: ['f/3'], stem_direction: 1 },
        { keys: ['a/5'], stem_direction: -1 },
        { keys: ['a/4'], stem_direction: 1 },
        { keys: ['f/3'], stem_direction: 1 },
        { keys: ['a/4'], stem_direction: -1 },
        { keys: ['c/4'], stem_direction: -1 },
      ].map(quarterNote).map(vf.StaveNote.bind(vf));

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
        { keys: ['b/4'], duration: '4' },
        { keys: ['a/4'], duration: '4' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['b/4'], duration: '2' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

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

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Nested Tuplets');
    },

    single: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10 }).addTimeSignature('4/4');

      var notes = [
        // Big triplet 1:
        { keys: ['c/4'], duration: '4' },
        { keys: ['d/4'], duration: '8' },
        { keys: ['e/4'], duration: '8' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
        { keys: ['a/4'], duration: '2' },
        { keys: ['b/4'], duration: '4' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      vf.Beam({
        notes: notes.slice(1, 4),
      });

      // big quartuplet
      vf.Tuplet({
        notes: notes.slice(0, -1),
        options: {
          num_notes: 4,
          notes_occupied: 3,
          ratioed: true,
          bracketed: true,
        },
      });

      // first singleton
      vf.Tuplet({
        notes: notes.slice(0, 1),
        options: {
          num_notes: 3,
          notes_occupied: 2,
          ratioed: true,
        },
      });

      // eighth note triplet
      vf.Tuplet({
        notes: notes.slice(1, 4),
        options: {
          num_notes: 3,
          notes_occupied: 2,
        },
      });

      // second singleton
      vf.Tuplet({
        notes: notes.slice(4, 5),
        options: {
          num_notes: 3,
          notes_occupied: 2,
          ratioed: true,
          bracketed: true,
        },
      });

      // 4/4 time
      var voice = vf.Voice({ time: { num_beats: 4, beat_value: 4 } })
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Nested Tuplets');
    },
  };

  return Tuplet;
})();
