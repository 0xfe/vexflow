/**
 * VexFlow - Beam Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */


/*
eslint-disable
no-var,
no-undef,
wrap-iife,
func-names,
vars-on-top,
max-len,
 */

VF.Test.Beam = (function() {
  var runTests = VF.Test.runTests;

  function concat(a, b) { return a.concat(b); }

  var Beam = {
    Start: function() {
      QUnit.module('Beam');
      runTests('Simple Beam', Beam.simple);
      runTests('Multi Beam', Beam.multi);
      runTests('Sixteenth Beam', Beam.sixteenth);
      runTests('Slopey Beam', Beam.slopey);
      runTests('Auto-stemmed Beam', Beam.autoStem);
      runTests('Mixed Beam 1', Beam.mixed);
      runTests('Mixed Beam 2', Beam.mixed2);
      runTests('Dotted Beam', Beam.dotted);
      runTests('Close Trade-offs Beam', Beam.tradeoffs);
      runTests('Insane Beam', Beam.insane);
      runTests('Lengthy Beam', Beam.lenghty);
      runTests('Outlier Beam', Beam.outlier);
      runTests('Break Secondary Beams', Beam.breakSecondaryBeams);
      runTests('TabNote Beams Up', Beam.tabBeamsUp);
      runTests('TabNote Beams Down', Beam.tabBeamsDown);
      runTests('TabNote Auto Create Beams', Beam.autoTabBeams);
      runTests('TabNote Beams Auto Stem', Beam.tabBeamsAutoStem);
      runTests('Complex Beams with Annotations', Beam.complexWithAnnotation);
      runTests('Complex Beams with Articulations', Beam.complexWithArticulation);
    },

    simple: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var beam = score.beam.bind(score);
      var notes = score.notes.bind(score);

      var voice = score.voice([
        notes('(cb4 e#4 a4)/2'),
        beam(notes('(cb4 e#4 a4)/8, (d4 f4 a4), (ebb4 g##4 b4), (f4 a4 c5)', { stem: 'up' })),
      ].reduce(concat), { time: '2/2' });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Simple Test');
    },

    multi: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice.bind(score);
      var beam = score.beam.bind(score);
      var notes = score.notes.bind(score);

      var voices = [
        voice([
          beam(notes('f5/8, e5, d5, c5', { stem: 'up' })),
          beam(notes('c5, d5, e5, f5', { stem: 'up' })),
        ].reduce(concat)),
        voice([
          beam(notes('f4/8, e4, d4, c4', { stem: 'down' })),
          beam(notes('c4/8, d4, e4, f4', { stem: 'down' })),
        ].reduce(concat)),
      ];

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();

      ok(true, 'Multi Test');
    },

    sixteenth: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice.bind(score);
      var beam = score.beam.bind(score);
      var notes = score.notes.bind(score);

      var voices = [
        voice([
          beam(notes('f5/16, f5, d5, c5', { stem: 'up' })),
          beam(notes('c5/16, d5, f5, e5', { stem: 'up' })),
          notes('f5/2', { stem: 'up' }),
        ].reduce(concat)),
        voice([
          beam(notes('f4/16, e4/16, d4/16, c4/16', { stem: 'down' })),
          beam(notes('c4/16, d4/16, f4/16, e4/16', { stem: 'down' })),
          notes('f4/2', { stem: 'down' }),
        ].reduce(concat)),
      ];

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();

      ok(true, 'Sixteenth Test');
    },

    breakSecondaryBeams: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 200);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice = score.voice.bind(score);
      var beam = score.beam.bind(score);
      var notes = score.notes.bind(score);

      var voices = [
        voice([
          beam(
            notes('f5/16., f5/32, c5/16., d5/32, c5/16., d5/32', { stem: 'up' }),
            { secondaryBeamBreaks: [1, 3] }
          ),
          beam(
            notes('f5/16, e5, e5, e5, e5, e5', { stem: 'up' }),
            { secondaryBeamBreaks: [2] }
          ),
        ].reduce(concat), { time: '3/4' }),
        voice([
          beam(
            notes('f4/32, d4, e4, c4, d4, c4, f4, d4, e4, c4, c4, d4', { stem: 'down' }),
            { secondaryBeamBreaks: [3, 7] }
          ),
          beam(
            notes('d4/16, f4, d4, e4, e4, e4', { stem: 'down' }),
            { secondaryBeamBreaks: [3] }
          ),
        ].reduce(concat), { time: '3/4' }),
      ];

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();

      ok(true, 'Breaking Secondary Beams Test');
    },

    slopey: function(options) {
      var vf = VF.Test.makeFactory(options, 350, 140);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var beam = score.beam.bind(score);
      var notes = score.notes.bind(score);
      var voice = score.voice([
        beam(notes('c4/8, f4/8, d5/8, g5/8', { stem: 'up' })),
        beam(notes('d6/8, f5/8, d4/8, g3/8', { stem: 'up' })),
      ].reduce(concat));

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Slopey Test');
    },

    autoStem: function(options) {
      var vf = VF.Test.makeFactory(options, 350, 140);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'a4/8, b4/8, g4/8, c5/8, f4/8, d5/8, e4/8, e5/8, b4/8, b4/8, g4/8, d5/8'
      ), { time: '6/4' });

      var notes = voice.getTickables();

      var beams = [
        vf.Beam({ notes: notes.slice(0, 2), options: { autoStem: true } }),
        vf.Beam({ notes: notes.slice(2, 4), options: { autoStem: true } }),
        vf.Beam({ notes: notes.slice(4, 6), options: { autoStem: true } }),
        vf.Beam({ notes: notes.slice(6, 8), options: { autoStem: true } }),
        vf.Beam({ notes: notes.slice(8, 10), options: { autoStem: true } }),
        vf.Beam({ notes: notes.slice(10, 12), options: { autoStem: true } }),
      ];

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;

      equal(beams[0].stem_direction, UP);
      equal(beams[1].stem_direction, UP);
      equal(beams[2].stem_direction, UP);
      equal(beams[3].stem_direction, UP);
      equal(beams[4].stem_direction, DOWN);
      equal(beams[5].stem_direction, DOWN);

      vf.draw();

      ok(true, 'AutoStem Beam Test');
    },

    mixed: function(options) {
      var vf = VF.Test.makeFactory(options, 350, 140);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice1 = score.voice(score.notes(
        'f5/8, d5/16, c5/16, c5/16, d5/16, e5/8, f5/8, d5/16, c5/16, c5/16, d5/16, e5/8',
        { stem: 'up' }
      ));

      var voice2 = score.voice(score.notes(
        'f4/16, e4/8, d4/16, c4/16, d4/8, f4/16, f4/16, e4/8, d4/16, c4/16, d4/8, f4/16',
        { stem: 'down' }
      ));

      [[0, 4], [4, 8], [8, 12]].forEach(function(range) {
        vf.Beam({ notes: voice1.getTickables().slice(range[0], range[1]) });
      });

      [[0, 4], [4, 8], [8, 12]].forEach(function(range) {
        vf.Beam({ notes: voice2.getTickables().slice(range[0], range[1]) });
      });

      vf.Formatter()
        .joinVoices([voice1, voice2])
        .formatToStave([voice1, voice2], stave);

      vf.draw();

      ok(true, 'Multi Test');
    },

    mixed2: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 180);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'f5/32, d5/16, c5/32, c5/64, d5/128, e5/8, f5/16, d5/32, c5/64, c5/32, d5/16, e5/128',
        { stem: 'up' }
      ), { time: '31/64' });

      var voice2 = score.voice(score.notes(
        'f4/32, d4/16, c4/32, c4/64, d4/128, e4/8, f4/16, d4/32, c4/64, c4/32, d4/16, e4/128',
        { stem: 'down' }
      ), { time: '31/64' });

      vf.Beam({ notes: voice.getTickables().slice(0, 12) });
      vf.Beam({ notes: voice2.getTickables().slice(0, 12) });

      vf.Formatter()
        .joinVoices([voice, voice2])
        .formatToStave([voice, voice2], stave);

      vf.draw();

      ok(true, 'Multi Test');
    },

    dotted: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'd4/8, b3/8., a3/16, a3/8, b3/8., c4/16, d4/8, b3/8, a3/8., a3/16, b3/8., c4/16',
        { stem: 'up' }
      ), { time: '6/4' });

      var notes = voice.getTickables();
      vf.Beam({ notes: notes.slice(0, 4) });
      vf.Beam({ notes: notes.slice(4, 8) });
      vf.Beam({ notes: notes.slice(8, 12) });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Dotted Test');
    },

    tradeoffs: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'a4/8, b4/8, c4/8, d4/8, g4/8, a4/8, b4/8, c4/8',
        { stem: 'up' }
      ));

      var notes = voice.getTickables();
      vf.Beam({ notes: notes.slice(0, 4) });
      vf.Beam({ notes: notes.slice(4, 8) });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Close Trade-offs Test');
    },

    insane: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 180);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'g4/8, g5/8, c4/8, b5/8, g4/8[stem="down"], a5[stem="down"], b4[stem="down"], c4/8', { stem: 'up' }
      ));

      var notes = voice.getTickables();
      vf.Beam({ notes: notes.slice(0, 4) });
      vf.Beam({ notes: notes.slice(4, 7) });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Insane Test');
    },

    lenghty: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 180);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice = score.voice(score.beam(score.notes(
        'g4/8, g4, g4, a4',
        { stem: 'up' }
      )), { time: '2/4' });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Lengthy Test');
    },

    outlier: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 180);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes([
        'g4/8[stem="up"],   f4[stem="up"],   d5[stem="up"],   e4[stem="up"]',
        'd5/8[stem="down"], d5[stem="down"], c5[stem="down"], d5[stem="down"]',
      ].join()));

      var notes = voice.getTickables();
      vf.Beam({ notes: notes.slice(0, 4) });
      vf.Beam({ notes: notes.slice(4, 8) });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave, { stave: stave });

      vf.draw();

      ok(true, 'Outlier Test');
    },

    tabBeamsUp: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 200);
      var stave = vf.TabStave({ y: 20 });

      var specs = [
        { positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '4' },
        { positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '32' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '64' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '128' },
        { positions: [{ str: 3, fret: 6 }], duration: '8' },
        { positions: [{ str: 3, fret: 6 }], duration: '8' },
        { positions: [{ str: 3, fret: 6 }], duration: '8' },
        { positions: [{ str: 3, fret: 6 }], duration: '8' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = vf.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      vf.Beam({ notes: notes.slice(1, 7) });
      vf.Beam({ notes: notes.slice(8, 11) });
      vf.Tuplet({ notes: notes.slice(8, 11), options: { ratioed: true } });

      var voice = vf.Voice().setMode(VF.Voice.Mode.SOFT).addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'All objects have been drawn');
    },

    tabBeamsDown: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 250);
      var stave = vf.TabStave({ options: { num_lines: 10 } });

      var specs = [
        { stem_direction: -1, positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '4' },
        { stem_direction: -1, positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '8dd' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '32' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '64' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '128' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 7, fret: 6 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 7, fret: 6 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 10, fret: 6 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 10, fret: 6 }], duration: '8' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = vf.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      notes[1].addDot();
      notes[1].addDot();

      vf.Beam({ notes: notes.slice(1, 7) });
      vf.Beam({ notes: notes.slice(8, 11) });

      vf.Tuplet({ notes: notes.slice(8, 11), options: { location: -1 } });
      vf.Tuplet({ notes: notes.slice(11, 14), options: { location: -1 } });

      var voice = vf.Voice().setMode(VF.Voice.Mode.SOFT).addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'All objects have been drawn');
    },


    autoTabBeams: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 200);
      var stave = vf.TabStave();

      var specs = [
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16' },
        { positions: [{ str: 1, fret: 6 }], duration: '32' },
        { positions: [{ str: 1, fret: 6 }], duration: '32' },
        { positions: [{ str: 1, fret: 6 }], duration: '32' },
        { positions: [{ str: 6, fret: 6 }], duration: '32' },
        { positions: [{ str: 6, fret: 6 }], duration: '16' },
        { positions: [{ str: 6, fret: 6 }], duration: '16' },
        { positions: [{ str: 6, fret: 6 }], duration: '16' },
        { positions: [{ str: 6, fret: 6 }], duration: '16' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = vf.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      var voice = vf.Voice().setMode(VF.Voice.Mode.SOFT).addTickables(notes);
      var beams = VF.Beam.applyAndGetBeams(voice, -1);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'All objects have been drawn');
    },

    // This tests makes sure the auto_stem functionality is works.
    // TabNote stems within a beam group should end up normalized
    tabBeamsAutoStem: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 300);
      var stave = vf.TabStave();

      var specs = [
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8', stem_direction: -1 },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8', stem_direction: 1 },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16', stem_direction: -1 },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16', stem_direction: 1 },
        { positions: [{ str: 1, fret: 6 }], duration: '32', stem_direction: 1 },
        { positions: [{ str: 1, fret: 6 }], duration: '32', stem_direction: -1 },
        { positions: [{ str: 1, fret: 6 }], duration: '32', stem_direction: -1 },
        { positions: [{ str: 6, fret: 6 }], duration: '32', stem_direction: -1 },
        { positions: [{ str: 6, fret: 6 }], duration: '16', stem_direction: 1 },
        { positions: [{ str: 6, fret: 6 }], duration: '16', stem_direction: 1 },
        { positions: [{ str: 6, fret: 6 }], duration: '16', stem_direction: 1 },
        { positions: [{ str: 6, fret: 6 }], duration: '16', stem_direction: -1 },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = vf.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      // Stems should format down
      vf.Beam({ notes: notes.slice(0, 8), options: { autoStem: true } });
      // Stems should format up
      vf.Beam({ notes: notes.slice(8, 12), options: { autoStem: true } });

      var voice = vf.Voice().setMode(VF.Voice.Mode.SOFT).addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'All objects have been drawn');
    },

    complexWithAnnotation: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 200);
      var stave = vf.Stave({ y: 40 });

      var notes = [
        { keys: ['e/4'], duration: '128', stem_direction: 1 },
        { keys: ['d/4'], duration: '16', stem_direction: 1 },
        { keys: ['e/4'], duration: '8', stem_direction: 1 },
        { keys: ['c/4', 'g/4'], duration: '32', stem_direction: 1 },
        { keys: ['c/4'], duration: '32', stem_direction: 1 },
        { keys: ['c/4'], duration: '32', stem_direction: 1 },
        { keys: ['c/4'], duration: '32', stem_direction: 1 },
      ];

      var notes2 = [
        { keys: ['e/5'], duration: '128', stem_direction: -1 },
        { keys: ['d/5'], duration: '16', stem_direction: -1 },
        { keys: ['e/5'], duration: '8', stem_direction: -1 },
        { keys: ['c/5', 'g/5'], duration: '32', stem_direction: -1 },
        { keys: ['c/5'], duration: '32', stem_direction: -1 },
        { keys: ['c/5'], duration: '32', stem_direction: -1 },
        { keys: ['c/5'], duration: '32', stem_direction: -1 },
      ];

      notes = notes.map(function(note) {
        return vf.StaveNote(note).addModifier(0, vf.Annotation({ text: '1', vJustify: 'above' }));
      });

      notes2 = notes2.map(function(note) {
        return vf.StaveNote(note).addModifier(0, vf.Annotation({ text: '3', vJustify: 'below' }));
      });

      vf.Beam({ notes: notes });
      vf.Beam({ notes: notes2 });

      var voice = vf.Voice()
        .setMode(VF.Voice.Mode.SOFT)
        .addTickables(notes)
        .addTickables(notes2);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave, { stave: stave });

      vf.draw();

      ok(true, 'Complex beam annotations');
    },

    complexWithArticulation: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 200);
      var stave = vf.Stave({ y: 40 });

      var notes = [
        { keys: ['e/4'], duration: '128', stem_direction: 1 },
        { keys: ['d/4'], duration: '16', stem_direction: 1 },
        { keys: ['e/4'], duration: '8', stem_direction: 1 },
        { keys: ['c/4', 'g/4'], duration: '32', stem_direction: 1 },
        { keys: ['c/4'], duration: '32', stem_direction: 1 },
        { keys: ['c/4'], duration: '32', stem_direction: 1 },
        { keys: ['c/4'], duration: '32', stem_direction: 1 },
      ];

      var notes2 = [
        { keys: ['e/5'], duration: '128', stem_direction: -1 },
        { keys: ['d/5'], duration: '16', stem_direction: -1 },
        { keys: ['e/5'], duration: '8', stem_direction: -1 },
        { keys: ['c/5', 'g/5'], duration: '32', stem_direction: -1 },
        { keys: ['c/5'], duration: '32', stem_direction: -1 },
        { keys: ['c/5'], duration: '32', stem_direction: -1 },
        { keys: ['c/5'], duration: '32', stem_direction: -1 },
      ];

      notes = notes.map(function(note) {
        return vf.StaveNote(note).addModifier(0, vf.Articulation({ type: 'am', position: 'above' }));
      });

      notes2 = notes2.map(function(note) {
        return vf.StaveNote(note).addModifier(0, vf.Articulation({ type: 'a>', position: 'below' }));
      });

      vf.Beam({ notes: notes });
      vf.Beam({ notes: notes2 });

      var voice = vf.Voice()
        .setMode(VF.Voice.Mode.SOFT)
        .addTickables(notes)
        .addTickables(notes2);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave, { stave: stave });

      vf.draw();

      ok(true, 'Complex beam articulations');
    },
  };

  return Beam;
})();
