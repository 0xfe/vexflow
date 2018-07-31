/**
 * VexFlow - StaveNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StaveNote = (function() {
  var StaveNote = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module('StaveNote');
      test('Tick', StaveNote.ticks);
      test('Tick - New API', StaveNote.ticksNewApi);
      test('Stem', StaveNote.stem);
      test('Automatic Stem Direction', StaveNote.autoStem);
      test('Displacement after calling setStemDirection', StaveNote.setStemDirectionDisplacement);
      test('StaveLine', StaveNote.staveLine);
      test('Width', StaveNote.width);
      test('TickContext', StaveNote.tickContext);

      VF.Test.runUITests('Interactive Mouseover StaveNote', StaveNote.draw, { clef: 'treble', octaveShift: 0, restKey: 'r/4', ui: true });

      runTests('StaveNote Draw - Treble', StaveNote.draw, { clef: 'treble', octaveShift: 0, restKey: 'r/4' });
      runTests('StaveNote BoundingBoxes - Treble', StaveNote.drawBoundingBoxes, { clef: 'treble', octaveShift: 0, restKey: 'r/4' });
      runTests('StaveNote Draw - Alto', StaveNote.draw, { clef: 'alto', octaveShift: -1, restKey: 'r/4' });
      runTests('StaveNote Draw - Tenor', StaveNote.draw, { clef: 'tenor', octaveShift: -1, restKey: 'r/3' });
      runTests('StaveNote Draw - Bass', StaveNote.draw, { clef: 'bass', octaveShift: -2, restKey: 'r/3' });
      runTests('StaveNote Draw - Harmonic And Muted', StaveNote.drawHarmonicAndMuted);
      runTests('StaveNote Draw - Slash', StaveNote.drawSlash);
      runTests('Displacements', StaveNote.displacements);
      runTests('StaveNote Draw - Bass 2', StaveNote.drawBass);
      runTests('StaveNote Draw - Key Styles', StaveNote.drawKeyStyles);
      runTests('StaveNote Draw - StaveNote Stem Styles', StaveNote.drawNoteStemStyles);
      runTests('StaveNote Draw - StaveNote Flag Styles', StaveNote.drawNoteStylesWithFlag);
      runTests('StaveNote Draw - StaveNote Styles', StaveNote.drawNoteStyles);
      runTests('Stave, Ledger Line, Beam, Stem and Flag Styles', StaveNote.drawBeamStyles);
      runTests('Flag and Dot Placement - Stem Up', StaveNote.dotsAndFlagsStemUp);
      runTests('Flag and Dots Placement - Stem Down', StaveNote.dotsAndFlagsStemDown);
      runTests('Beam and Dot Placement - Stem Up', StaveNote.dotsAndBeamsUp);
      runTests('Beam and Dot Placement - Stem Down', StaveNote.dotsAndBeamsDown);
      runTests('Center Aligned Note', StaveNote.centerAlignedRest);
      runTests('Center Aligned Note with Articulation', StaveNote.centerAlignedRestFermata);
      runTests('Center Aligned Note with Annotation', StaveNote.centerAlignedRestAnnotation);
      runTests('Center Aligned Note - Multi Voice', StaveNote.centerAlignedMultiVoice);
      runTests('Center Aligned Note with Multiple Modifiers', StaveNote.centerAlignedNoteMultiModifiers);
    },

    ticks: function() {
      var BEAT = 1 * VF.RESOLUTION / 4;

      var tickTests = {
        // Key value pairs of `testName: [durationString, expectedBeats, expectedNoteType]`
        'Breve note': ['1/2', 8.0, 'n'],
        'Whole note': ['w', 4.0, 'n'],
        'Quarter note': ['q', 1.0, 'n'],
        'Dotted half note': ['hd', 3.0, 'n'],
        'Doubled-dotted half note': ['hdd', 3.5, 'n'],
        'Triple-dotted half note': ['hddd', 3.75, 'n'],
        'Dotted half rest': ['hdr', 3.0, 'r'],
        'Double-dotted half rest': ['hddr', 3.5, 'r'],
        'Triple-dotted half rest': ['hdddr', 3.75, 'r'],
        'Dotted harmonic quarter note': ['qdh', 1.5, 'h'],
        'Double-dotted harmonic quarter note': ['qddh', 1.75, 'h'],
        'Triple-dotted harmonic quarter note': ['qdddh', 1.875, 'h'],
        'Dotted muted 8th note': ['8dm', 0.75, 'm'],
        'Double-dotted muted 8th note': ['8ddm', 0.875, 'm'],
        'Triple-dotted muted 8th note': ['8dddm', 0.9375, 'm'],
      };

      Object.keys(tickTests).forEach(function(testName) {
        var testData = tickTests[testName];
        var durationString = testData[0];
        var expectedBeats = testData[1];
        var expectedNoteType = testData[2];
        var note = new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: durationString });
        equal(note.getTicks().value(), BEAT * expectedBeats, testName + ' must have ' + expectedBeats + ' beats');
        equal(note.getNoteType(), expectedNoteType, 'Note type must be ' + expectedNoteType);
      });

      throws(function() {
        return new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '8.7dddm' });
      }, /BadArguments/, "Invalid note duration '8.7' throws BadArguments exception");

      throws(function() {
        return new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2Z' });
      }, /BadArguments/, "Invalid note type 'Z' throws BadArguments exception");

      throws(function() {
        return new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2dddZ' });
      }, /BadArguments/, "Invalid note type 'Z' throws BadArguments exception");
    },

    ticksNewApi: function() {
      var BEAT = 1 * VF.RESOLUTION / 4;

      // Key value pairs of `testName: [noteData, expectedBeats, expectedNoteType]`
      var tickTests = {
        'Breve note': [{ duration: '1/2' }, 8.0, 'n'],
        'Whole note': [{ duration: 'w' }, 4.0, 'n'],
        'Quarter note': [{ duration: 'q' }, 1.0, 'n'],
        'Dotted half note': [{ duration: 'h', dots: 1 }, 3.0, 'n'],
        'Doubled-dotted half note': [{ duration: 'h', dots: 2 }, 3.5, 'n'],
        'Triple-dotted half note': [{ duration: 'h', dots: 3 }, 3.75, 'n'],
        'Dotted half rest': [{ duration: 'h', dots: 1, type: 'r' }, 3.0, 'r'],
        'Double-dotted half rest': [{ duration: 'h', dots: 2, type: 'r' }, 3.5, 'r'],
        'Triple-dotted half rest': [{ duration: 'h', dots: 3, type: 'r' }, 3.75, 'r'],
        'Dotted harmonic quarter note': [{ duration: 'q', dots: 1, type: 'h' }, 1.5, 'h'],
        'Double-dotted harmonic quarter note': [{ duration: 'q', dots: 2, type: 'h' }, 1.75, 'h'],
        'Triple-dotted harmonic quarter note': [{ duration: 'q', dots: 3, type: 'h' }, 1.875, 'h'],
        'Dotted muted 8th note': [{ duration: '8', dots: 1, type: 'm' }, 0.75, 'm'],
        'Double-dotted muted 8th note': [{ duration: '8', dots: 2, type: 'm' }, 0.875, 'm'],
        'Triple-dotted muted 8th note': [{ duration: '8', dots: 3, type: 'm' }, 0.9375, 'm'],
      };

      Object.keys(tickTests).forEach(function(testName) {
        var testData = tickTests[testName];
        var noteData = testData[0];
        var expectedBeats = testData[1];
        var expectedNoteType = testData[2];

        noteData.keys = ['c/4', 'e/4', 'g/4'];

        var note = new VF.StaveNote(noteData);
        equal(note.getTicks().value(), BEAT * expectedBeats, testName + ' must have ' + expectedBeats + ' beats');
        equal(note.getNoteType(), expectedNoteType, 'Note type must be ' + expectedNoteType);
      });

      throws(function() {
        return new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '8.7dddm' });
      }, /BadArguments/, "Invalid note duration '8.7' throws BadArguments exception");

      throws(function() {
        return new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2Z' });
      }, /BadArguments/, "Invalid note type 'Z' throws BadArguments exception");

      throws(function() {
        return new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2dddZ' });
      }, /BadArguments/, "Invalid note type 'Z' throws BadArguments exception");
    },

    stem: function() {
      var note = new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'w' });
      equal(note.getStemDirection(), VF.StaveNote.STEM_UP, 'Default note has UP stem');
    },

    autoStem: function() {
      [
        // [keys, expectedStemDirection]
        [['c/5', 'e/5', 'g/5'], VF.StaveNote.STEM_DOWN],
        [['e/4', 'g/4', 'c/5'], VF.StaveNote.STEM_UP],
        [['c/5'], VF.StaveNote.STEM_DOWN],
        [['a/4', 'e/5', 'g/5'], VF.StaveNote.STEM_DOWN],
        [['b/4'], VF.StaveNote.STEM_DOWN],
      ]
        .forEach(function(testData) {
          var keys = testData[0];
          var expectedStemDirection = testData[1];
          var note = new VF.StaveNote({ keys: keys, auto_stem: true, duration: '8' });
          equal(note.getStemDirection(), expectedStemDirection, 'Stem must be' + (expectedStemDirection === VF.StaveNote.STEM_UP ? 'up' : 'down'));
        });
    },

    setStemDirectionDisplacement: function() {
      function getDisplacements(note) {
        return note.note_heads.map(function(notehead) {
          return notehead.isDisplaced();
        });
      }

      var stemUpDisplacements = [false, true, false];
      var stemDownDisplacements = [true, false, false];

      var note = new VF.StaveNote({ keys: ['c/5', 'd/5', 'g/5'], stem_direction: VF.Stem.UP, duration: '4' });
      deepEqual(getDisplacements(note), stemUpDisplacements);
      note.setStemDirection(VF.Stem.DOWN);
      deepEqual(getDisplacements(note), stemDownDisplacements);
      note.setStemDirection(VF.Stem.UP);
      deepEqual(getDisplacements(note), stemUpDisplacements);
    },

    staveLine: function() {
      var stave = new VF.Stave(10, 10, 300);
      var note = new VF.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' });
      note.setStave(stave);

      var props = note.getKeyProps();
      equal(props[0].line, 0, 'C/4 on line 0');
      equal(props[1].line, 1, 'E/4 on line 1');
      equal(props[2].line, 2.5, 'A/4 on line 2.5');

      var ys = note.getYs();
      equal(ys.length, 3, 'Chord should be rendered on three lines');
      equal(ys[0], 100, 'Line for C/4');
      equal(ys[1], 90, 'Line for E/4');
      equal(ys[2], 75, 'Line for A/4');
    },

    width: function() {
      var note = new VF.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' });

      throws(function() {
        note.getWidth();
      }, /UnformattedNote/, 'Unformatted note should have no width');
    },

    tickContext: function() {
      var stave = new VF.Stave(10, 10, 400);
      var note = new VF.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' }).setStave(stave);

      var tickContext = new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(10)
        .setPadding(0);

      VF.Test.almostEqual(tickContext.getWidth(), 17.3815, 0.0001);
    },

    showNote: function(note_struct, stave, ctx, x, drawBoundingBox) {
      var note = new VF.StaveNote(note_struct).setStave(stave);

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(x);

      note.setContext(ctx).draw();

      if (drawBoundingBox) note.getBoundingBox().draw(ctx);

      return note;
    },

    draw: function(options, contextBuilder) {
      var clef = options.params.clef;
      var octaveShift = options.params.octaveShift;
      var restKey = options.params.restKey;

      var ctx = new contextBuilder(options.elementId, 700, 180);
      var stave = new VF.Stave(10, 30, 750);
      stave.setContext(ctx);
      stave.addClef(clef);
      stave.draw();

      var lowerKeys = ['c/', 'e/', 'a/'];
      var higherKeys = ['c/', 'e/', 'a/'];
      for (var k = 0; k < lowerKeys.length; k++) {
        lowerKeys[k] = lowerKeys[k] + (4 + octaveShift);
        higherKeys[k] = higherKeys[k] + (5 + octaveShift);
      }

      var restKeys = [restKey];

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { clef: clef, keys: higherKeys, duration: '1/2' },
        { clef: clef, keys: lowerKeys, duration: 'w' },
        { clef: clef, keys: higherKeys, duration: 'h' },
        { clef: clef, keys: lowerKeys, duration: 'q' },
        { clef: clef, keys: higherKeys, duration: '8' },
        { clef: clef, keys: lowerKeys, duration: '16' },
        { clef: clef, keys: higherKeys, duration: '32' },
        { clef: clef, keys: higherKeys, duration: '64' },
        { clef: clef, keys: higherKeys, duration: '128' },
        { clef: clef, keys: lowerKeys, duration: '1/2', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: 'w', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: 'h', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: 'q', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '8', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '16', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '32', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '64', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '128', stem_direction: -1 },

        { clef: clef, keys: restKeys, duration: '1/2r' },
        { clef: clef, keys: restKeys, duration: 'wr' },
        { clef: clef, keys: restKeys, duration: 'hr' },
        { clef: clef, keys: restKeys, duration: 'qr' },
        { clef: clef, keys: restKeys, duration: '8r' },
        { clef: clef, keys: restKeys, duration: '16r' },
        { clef: clef, keys: restKeys, duration: '32r' },
        { clef: clef, keys: restKeys, duration: '64r' },
        { clef: clef, keys: restKeys, duration: '128r' },
        { keys: ['x/4'], duration: 'h' },
      ];
      expect(notes.length * 2);

      function colorDescendants(color) {
        return function() {
          Vex.forEach($(this).find('*'), function(child) {
            child.setAttribute('fill', color);
            child.setAttribute('stroke', color);
          });
        };
      }

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        // If this is an interactivity test, then attempt to attach mouseover
        // and mouseout handlers to the notes.
        if (options.params.ui) {
          var item = staveNote.getAttribute('el');
          item.addEventListener('mouseover', colorDescendants('green'), false);
          item.addEventListener('mouseout', colorDescendants('black'), false);
        }
        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    drawBoundingBoxes: function(options, contextBuilder) {
      var clef = options.params.clef;
      var octaveShift = options.params.octaveShift;
      var restKey = options.params.restKey;

      var ctx = new contextBuilder(options.elementId, 700, 180);
      var stave = new VF.Stave(10, 30, 750);
      stave.setContext(ctx);
      stave.addClef(clef);
      stave.draw();

      var lowerKeys = ['c/', 'e/', 'a/'];
      var higherKeys = ['c/', 'e/', 'a/'];
      for (var k = 0; k < lowerKeys.length; k++) {
        lowerKeys[k] = lowerKeys[k] + (4 + octaveShift);
        higherKeys[k] = higherKeys[k] + (5 + octaveShift);
      }

      var restKeys = [restKey];

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { clef: clef, keys: higherKeys, duration: '1/2' },
        { clef: clef, keys: lowerKeys, duration: 'w' },
        { clef: clef, keys: higherKeys, duration: 'h' },
        { clef: clef, keys: lowerKeys, duration: 'q' },
        { clef: clef, keys: higherKeys, duration: '8' },
        { clef: clef, keys: lowerKeys, duration: '16' },
        { clef: clef, keys: higherKeys, duration: '32' },
        { clef: clef, keys: higherKeys, duration: '64' },
        { clef: clef, keys: higherKeys, duration: '128' },
        { clef: clef, keys: lowerKeys, duration: '1/2', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: 'w', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: 'h', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: 'q', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '8', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '16', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '32', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '64', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '128' },

        { clef: clef, keys: restKeys, duration: '1/2r' },
        { clef: clef, keys: restKeys, duration: 'wr' },
        { clef: clef, keys: restKeys, duration: 'hr' },
        { clef: clef, keys: restKeys, duration: 'qr' },
        { clef: clef, keys: restKeys, duration: '8r' },
        { clef: clef, keys: restKeys, duration: '16r' },
        { clef: clef, keys: restKeys, duration: '32r' },
        { clef: clef, keys: restKeys, duration: '64r' },
        { clef: clef, keys: restKeys, duration: '128r' },
        { keys: ['x/4'], duration: 'h' },
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25, true);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    drawBass: function(options, contextBuilder) {
      expect(40);
      var ctx = new contextBuilder(options.elementId, 600, 280);
      var stave = new VF.Stave(10, 10, 650);
      stave.setContext(ctx);
      stave.addClef('bass');
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { clef: 'bass', keys: ['c/3', 'e/3', 'a/3'], duration: '1/2' },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: 'w' },
        { clef: 'bass', keys: ['c/3', 'e/3', 'a/3'], duration: 'h' },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: 'q' },
        { clef: 'bass', keys: ['c/3', 'e/3', 'a/3'], duration: '8' },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: '16' },
        { clef: 'bass', keys: ['c/3', 'e/3', 'a/3'], duration: '32' },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: 'h', stem_direction: -1 },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: 'q', stem_direction: -1 },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: '8', stem_direction: -1 },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: '16', stem_direction: -1 },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: '32', stem_direction: -1 },

        { keys: ['r/4'], duration: '1/2r' },
        { keys: ['r/4'], duration: 'wr' },
        { keys: ['r/4'], duration: 'hr' },
        { keys: ['r/4'], duration: 'qr' },
        { keys: ['r/4'], duration: '8r' },
        { keys: ['r/4'], duration: '16r' },
        { keys: ['r/4'], duration: '32r' },
        { keys: ['x/4'], duration: 'h' },
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    displacements: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 700, 140);
      ctx.scale(0.9, 0.9);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';

      var stave = new VF.Stave(10, 10, 650);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { keys: ['g/3', 'a/3', 'c/4', 'd/4', 'e/4'], duration: '1/2' },
        { keys: ['g/3', 'a/3', 'c/4', 'd/4', 'e/4'], duration: 'w' },
        { keys: ['d/4', 'e/4', 'f/4'], duration: 'h' },
        { keys: ['f/4', 'g/4', 'a/4', 'b/4'], duration: 'q' },
        { keys: ['e/3', 'b/3', 'c/4', 'e/4', 'f/4', 'g/5', 'a/5'], duration: '8' },
        { keys: ['a/3', 'c/4', 'e/4', 'g/4', 'a/4', 'b/4'], duration: '16' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '32' },
        { keys: ['c/4', 'e/4', 'a/4', 'a/4'], duration: '64' },
        { keys: ['g/3', 'c/4', 'd/4', 'e/4'], duration: 'h', stem_direction: -1 },
        { keys: ['d/4', 'e/4', 'f/4'], duration: 'q', stem_direction: -1 },
        { keys: ['f/4', 'g/4', 'a/4', 'b/4'], duration: '8', stem_direction: -1 },
        { keys: ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4'], duration: '16', stem_direction: -1 },
        { keys: ['b/3', 'c/4', 'e/4', 'a/4', 'b/5', 'c/6', 'e/6'], duration: '32', stem_direction: -1 },
        { keys: ['b/3', 'c/4', 'e/4', 'a/4', 'b/5', 'c/6', 'e/6', 'e/6'], duration: '64', stem_direction: -1 },
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 45);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    drawHarmonicAndMuted: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 300, 180);
      var stave = new VF.Stave(10, 10, 280);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { keys: ['c/4', 'e/4', 'a/4'], duration: '1/2h' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'wh' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'hh' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'qh' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '8h' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '16h' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '32h' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '64h' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '128h' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '1/2h', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'wh', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'hh', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'qh', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '8h', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '16h', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '32h', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '64h', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '128h', stem_direction: -1 },

        { keys: ['c/4', 'e/4', 'a/4'], duration: '1/2m' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'wm' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'hm' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'qm' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '8m' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '16m' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '32m' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '64m' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '128m' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '1/2m', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'wm', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'hm', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'qm', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '8m', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '16m', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '32m', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '64m', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '128m', stem_direction: -1 },
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    drawSlash: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 700, 180);
      var stave = new VF.Stave(10, 10, 650);
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        { keys: ['b/4'], duration: '1/2s', stem_direction: -1 },
        { keys: ['b/4'], duration: 'ws', stem_direction: -1 },
        { keys: ['b/4'], duration: 'hs', stem_direction: -1 },
        { keys: ['b/4'], duration: 'qs', stem_direction: -1 },
        { keys: ['b/4'], duration: '8s', stem_direction: -1 },
        { keys: ['b/4'], duration: '16s', stem_direction: -1 },
        { keys: ['b/4'], duration: '32s', stem_direction: -1 },
        { keys: ['b/4'], duration: '64s', stem_direction: -1 },
        { keys: ['b/4'], duration: '128s', stem_direction: -1 },

        { keys: ['b/4'], duration: '1/2s', stem_direction: 1 },
        { keys: ['b/4'], duration: 'ws', stem_direction: 1 },
        { keys: ['b/4'], duration: 'hs', stem_direction: 1 },
        { keys: ['b/4'], duration: 'qs', stem_direction: 1 },
        { keys: ['b/4'], duration: '8s', stem_direction: 1 },
        { keys: ['b/4'], duration: '16s', stem_direction: 1 },
        { keys: ['b/4'], duration: '32s', stem_direction: 1 },
        { keys: ['b/4'], duration: '64s', stem_direction: 1 },
        { keys: ['b/4'], duration: '128s', stem_direction: 1 },

        // Beam
        { keys: ['b/4'], duration: '8s', stem_direction: -1 },
        { keys: ['b/4'], duration: '8s', stem_direction: -1 },
        { keys: ['b/4'], duration: '8s', stem_direction: 1 },
        { keys: ['b/4'], duration: '8s', stem_direction: 1 },
      ];

      var stave_notes = notes.map(function(note) { return new VF.StaveNote(note); });
      var beam1 = new VF.Beam([stave_notes[16], stave_notes[17]]);
      var beam2 = new VF.Beam([stave_notes[18], stave_notes[19]]);

      VF.Formatter.FormatAndDraw(ctx, stave, stave_notes, false);

      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      ok('Slash Note Heads');
    },

    drawKeyStyles: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 300, 280);
      ctx.scale(3, 3);

      var stave = new VF.Stave(10, 0, 100);

      var note = new VF.StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: 'q' })
        .setStave(stave)
        .addAccidental(1, new VF.Accidental('b'))
        .setKeyStyle(1, { shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue' });

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(25);

      stave.setContext(ctx).draw();
      note.setContext(ctx).draw();

      ok(note.getX() > 0, 'Note has X value');
      ok(note.getYs().length > 0, 'Note has Y values');
    },

    drawNoteStyles: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 300, 280);
      var stave = new VF.Stave(10, 0, 100);
      ctx.scale(3, 3);

      var note = new VF.StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: '8' })
        .setStave(stave)
        .addAccidental(1, new VF.Accidental('b'));

      note.setStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(25);

      stave.setContext(ctx).draw();
      note.setContext(ctx).draw();

      ok(note.getX() > 0, 'Note has X value');
      ok(note.getYs().length > 0, 'Note has Y values');
    },

    drawNoteStemStyles: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 300, 280);
      var stave = new VF.Stave(10, 0, 100);
      ctx.scale(3, 3);

      var note = new VF.StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: 'q' })
        .setStave(stave)
        .addAccidental(1, new VF.Accidental('b'));

      note.setStemStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(25);

      stave.setContext(ctx).draw();
      note.setContext(ctx).draw();

      ok('Note Stem Style');
    },

    drawNoteStylesWithFlag: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 300, 280);
      var stave = new VF.Stave(10, 0, 100);
      ctx.scale(3, 3);

      var note = new VF.StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: '8' })
        .setStave(stave)
        .addAccidental(1, new VF.Accidental('b'));

      note.setFlagStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(25);

      stave.setContext(ctx).draw();
      note.setContext(ctx).draw();

      ok(note.getX() > 0, 'Note has X value');
      ok(note.getYs().length > 0, 'Note has Y values');
    },

    drawBeamStyles: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 160);
      var stave = new VF.Stave(10, 10, 380);
      stave.setStyle({
        strokeStyle: '#EEAAEE',
        lineWidth: '3',
      });
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        // beam1
        { keys: ['b/4'], duration: '8', stem_direction: -1 },
        { keys: ['b/4'], duration: '8', stem_direction: -1 },

        // should be unstyled...
        { keys: ['b/4'], duration: '8', stem_direction: -1 },

        // beam2 should also be unstyled
        { keys: ['b/4'], duration: '8', stem_direction: -1 },
        { keys: ['b/4'], duration: '8', stem_direction: -1 },

        // beam3
        { keys: ['b/4'], duration: '8', stem_direction: 1 },
        { keys: ['b/4'], duration: '8', stem_direction: 1 },

        // beam4
        { keys: ['d/6'], duration: '8', stem_direction: -1 },
        { keys: ['c/6', 'd/6'], duration: '8', stem_direction: -1 },

        // unbeamed
        { keys: ['d/6', 'e/6'], duration: '8', stem_direction: -1 },

        // unbeamed, unstyled
        { keys: ['e/6', 'f/6'], duration: '8', stem_direction: -1 },

      ];

      var staveNotes = notes.map(function(note) { return new VF.StaveNote(note); });

      var beam1 = new VF.Beam(staveNotes.slice(0, 2));
      var beam2 = new VF.Beam(staveNotes.slice(3, 5));
      var beam3 = new VF.Beam(staveNotes.slice(5, 7));
      var beam4 = new VF.Beam(staveNotes.slice(7, 9));

      // stem, key, ledger, flag; beam.setStyle

      beam1.setStyle({
        fillStyle: 'blue',
        strokeStyle: 'blue',
      });

      staveNotes[0].setKeyStyle(0, { fillStyle: 'purple' });
      staveNotes[0].setStemStyle({ strokeStyle: 'green' });
      staveNotes[1].setStemStyle({ strokeStyle: 'orange' });
      staveNotes[1].setKeyStyle(0, { fillStyle: 'darkturquoise' });

      staveNotes[5].setStyle({ fillStyle: 'tomato', strokeStyle: 'tomato' });
      beam3.setStyle({
        shadowBlur: 20,
        shadowColor: 'blue',
      });

      staveNotes[9].setLedgerLineStyle({ fillStyle: 'lawngreen', strokeStyle: 'lawngreen', lineWidth: 1 });
      staveNotes[9].setFlagStyle({ fillStyle: 'orange', strokeStyle: 'orange' });

      VF.Formatter.FormatAndDraw(ctx, stave, staveNotes, false);

      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      beam3.setContext(ctx).draw();
      beam4.setContext(ctx).draw();

      ok('draw beam styles');
    },

    renderNote: function(note, stave, ctx, x) {
      note.setStave(stave);

      var mc = new VF.ModifierContext();
      note.addToModifierContext(mc);

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(x);

      note.setContext(ctx).draw();
      ctx.save();

      return note;
    },

    dotsAndFlagsStemUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 150);
      ctx.scale(1.0, 1.0);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new VF.Stave(10, 10, 975);

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '8', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '16', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '32', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '64', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '128', stem_direction: 1 }).addDotToAll().addDotToAll(),
        newNote({ keys: ['g/4'], duration: '4', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '8', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '16', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '32' }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '64', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '128', stem_direction: 1 }).addDotToAll().addDotToAll(),
      ];

      stave.setContext(ctx).draw();

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
      }

      ok(true, 'Full Dot');
    },


    dotsAndFlagsStemDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 160);
      ctx.scale(1.0, 1.0);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new VF.Stave(10, 10, 975);

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['e/5'], duration: '4', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '8', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '16', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '32', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '64', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '128', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '4', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '8', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '16', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '32', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '64', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '128', stem_direction: -1 }).addDotToAll(),
      ];

      stave.setContext(ctx).draw();

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
      }

      ok(true, 'Full Dot');
    },

    dotsAndBeamsUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 150);
      ctx.scale(1.0, 1.0);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new VF.Stave(10, 10, 975);

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['f/4'], duration: '8', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '16', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '32', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '64', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '128', stem_direction: 1 }).addDotToAll().addDotToAll(),
        newNote({ keys: ['g/4'], duration: '8', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '16', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '32' }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '64', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '128', stem_direction: 1 }).addDotToAll().addDotToAll(),
      ];

      var beam = new VF.Beam(notes);

      stave.setContext(ctx).draw();

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
      }

      beam.setContext(ctx).draw();

      ok(true, 'Full Dot');
    },

    dotsAndBeamsDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 160);
      ctx.scale(1.0, 1.0);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new VF.Stave(10, 10, 975);

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['e/5'], duration: '8', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '16', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '32', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '64', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '128', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '8', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '16', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '32', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '64', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '128', stem_direction: -1 }).addDotToAll(),
      ];

      var beam = new VF.Beam(notes);

      stave.setContext(ctx).draw();

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
      }

      beam.setContext(ctx).draw();

      ok(true, 'Full Dot');
    },

    centerAlignedRest: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 160);

      var stave = vf.Stave({ x: 10, y: 10, width: 350 })
        .addClef('treble')
        .addTimeSignature('4/4');

      var note = vf.StaveNote({ keys: ['b/4'], duration: '1r', align_center: true });

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables([note]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    centerAlignedRestFermata: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 160);

      var stave = vf.Stave({ x: 10, y: 10, width: 350 })
        .addClef('treble')
        .addTimeSignature('4/4');

      var note = vf.StaveNote({ keys: ['b/4'], duration: '1r', align_center: true })
        .addArticulation(0, new VF.Articulation('a@a').setPosition(3));

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables([note]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    centerAlignedRestAnnotation: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 160);

      var stave = vf.Stave({ x: 10, y: 10, width: 350 })
        .addClef('treble')
        .addTimeSignature('4/4');

      var note = vf.StaveNote({ keys: ['b/4'], duration: '1r', align_center: true })
        .addAnnotation(0, new VF.Annotation('Whole measure rest').setPosition(3));

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables([note]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    centerAlignedNoteMultiModifiers: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 160);

      var stave = vf.Stave({ x: 10, y: 10, width: 350 })
        .addClef('treble')
        .addTimeSignature('4/4');

      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) { return new VF.StringNumber(num).setPosition(pos); }

      var note = vf.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '4', align_center: true })
        .addAnnotation(0, new VF.Annotation('Test').setPosition(3))
        .addStroke(0, new VF.Stroke(2))
        .addAccidental(1, new VF.Accidental('#'))
        .addModifier(0, newFinger('3', VF.Modifier.Position.LEFT))
        .addModifier(2, newFinger('2', VF.Modifier.Position.LEFT))
        .addModifier(1, newFinger('1', VF.Modifier.Position.RIGHT))
        .addModifier(2, newStringNumber('4', VF.Modifier.Position.BELOW))
        .addDotToAll();

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables([note]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    centerAlignedMultiVoice: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 160);

      var stave = vf.Stave({ x: 10, y: 10, width: 350 })
        .addClef('treble')
        .addTimeSignature('3/8');

      // Create custom duration
      var custom_duration = new VF.Fraction(3, 8);

      var notes0 = [
        { keys: ['c/4'], duration: '1r', align_center: true, duration_override: custom_duration },
      ].map(vf.StaveNote.bind(vf));

      var notes1 = [
        { keys: ['b/4'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
      ].map(vf.StaveNote.bind(vf));

      notes1[1].addAccidental(0, vf.Accidental({ type: '#' }));

      vf.Beam({ notes: notes1 });

      var voice0 = vf.Voice({ time: '3/8' })
        .setStrict(false)
        .addTickables(notes0);

      var voice1 = vf.Voice({ time: '3/8' })
        .setStrict(false)
        .addTickables(notes1);

      vf.Formatter()
        .joinVoices([voice0, voice1])
        .formatToStave([voice0, voice1], stave);

      vf.draw();

      ok(true);
    },
  };

  return StaveNote;
})();
