// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// StaveNote Tests

/* eslint-disable */
// @ts-nocheck

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';
import { Vex } from 'vex';
import { Flow } from 'flow';
import { QUnit, ok, test, throws, equal, expect, deepEqual } from './declarations';
import { ContextBuilder } from 'renderer';
import { Stave } from 'stave';
import { StaveNote, StaveNoteStruct } from 'stavenote';
import { Stem } from 'stem';
import { TickContext } from 'tickcontext';
import { Formatter } from 'formatter';
import { Beam } from 'beam';
import { Accidental } from 'accidental';
import { Fraction } from 'fraction';
import { Annotation } from 'annotation';
import { Modifier } from 'modifier';
import { FretHandFinger } from 'frethandfinger';
import { StringNumber } from 'stringnumber';
import { Stroke } from 'strokes';
import { Articulation } from 'articulation';
import { ModifierContext } from 'modifiercontext';
import { TabNote } from 'tabnote';
import { isCategory, isStaveNote } from 'typeguard';

function note(note_struct: StaveNoteStruct) {
  return new StaveNote(note_struct);
}

const StaveNoteTests = {
  Start(): void {
    QUnit.module('StaveNote');
    const run = VexFlowTests.runTests;
    test('VF.* API', this.VF_Prefix);
    test('Type Checking', this.typeChecking);
    test('Tick', this.ticks);
    test('Tick - New API', this.ticksNewApi);
    test('Stem', this.stem);
    test('Automatic Stem Direction', this.autoStem);
    test('Stem Extension Pitch', this.stemExtensionPitch);
    test('Displacement after calling setStemDirection', this.setStemDirectionDisplacement);
    test('StaveLine', this.staveLine);
    test('Width', this.width);
    test('TickContext', this.tickContext);

    // This interactivity test currently only works with the SVG backend.
    VexFlowTests.runSVGTest('Interactive Mouseover StaveNote', this.draw, {
      clef: 'treble',
      octaveShift: 0,
      restKey: 'r/4',
      ui: true,
    });

    run('StaveNote Draw - Treble', this.draw, { clef: 'treble', octaveShift: 0, restKey: 'r/4' });
    run('StaveNote BoundingBoxes - Treble', this.drawBoundingBoxes, {
      clef: 'treble',
      octaveShift: 0,
      restKey: 'r/4',
    });
    run('StaveNote Draw - Alto', this.draw, { clef: 'alto', octaveShift: -1, restKey: 'r/4' });
    run('StaveNote Draw - Tenor', this.draw, { clef: 'tenor', octaveShift: -1, restKey: 'r/3' });
    run('StaveNote Draw - Bass', this.draw, { clef: 'bass', octaveShift: -2, restKey: 'r/3' });
    run('StaveNote Draw - Harmonic And Muted', this.drawHarmonicAndMuted);
    run('StaveNote Draw - Slash', this.drawSlash);
    run('Displacements', this.displacements);
    run('StaveNote Draw - Bass 2', this.drawBass);
    run('StaveNote Draw - Key Styles', this.drawKeyStyles);
    run('StaveNote Draw - StaveNote Stem Styles', this.drawNoteStemStyles);
    run('StaveNote Draw - StaveNote Stem Lengths', this.drawNoteStemLengths);
    run('StaveNote Draw - StaveNote Flag Styles', this.drawNoteStylesWithFlag);
    run('StaveNote Draw - StaveNote Styles', this.drawNoteStyles);
    run('Stave, Ledger Line, Beam, Stem and Flag Styles', this.drawBeamStyles);
    run('Flag and Dot Placement - Stem Up', this.dotsAndFlagsStemUp);
    run('Flag and Dots Placement - Stem Down', this.dotsAndFlagsStemDown);
    run('Beam and Dot Placement - Stem Up', this.dotsAndBeamsUp);
    run('Beam and Dot Placement - Stem Down', this.dotsAndBeamsDown);
    run('Center Aligned Note', this.centerAlignedRest);
    run('Center Aligned Note with Articulation', this.centerAlignedRestFermata);
    run('Center Aligned Note with Annotation', this.centerAlignedRestAnnotation);
    run('Center Aligned Note - Multi Voice', this.centerAlignedMultiVoice);
    run('Center Aligned Note with Multiple Modifiers', this.centerAlignedNoteMultiModifiers);
  },

  VF_Prefix(): void {
    equal(Flow.RESOLUTION, VF.RESOLUTION);
    equal(StaveNote, VF.StaveNote);
  },

  typeChecking(): void {
    const s = new StaveNote({ keys: ['c/4'], duration: 'w' });
    ok(isCategory<StaveNote>(StaveNote, s));
    const t = new TabNote({ positions: [{ str: 2, fret: 1 }], duration: '1' });
    notOk(isCategory<StaveNote>(StaveNote, t));
    const fakeStaveNote = { getCategory: () => 'stavenotes' };
    ok(isStaveNote(fakeStaveNote));
  },

  ticks(): void {
    const BEAT = (1 * Flow.RESOLUTION) / 4;

    const tickTests = {
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

    Object.keys(tickTests).forEach(function (testName) {
      const testData = tickTests[testName];
      const durationString = testData[0];
      const expectedBeats = testData[1];
      const expectedNoteType = testData[2];
      const note = new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: durationString });
      equal(note.getTicks().value(), BEAT * expectedBeats, testName + ' must have ' + expectedBeats + ' beats');
      equal(note.getNoteType(), expectedNoteType, 'Note type must be ' + expectedNoteType);
    });

    throws(
      function () {
        return new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '8.7dddm' });
      },
      /BadArguments/,
      "Invalid note duration '8.7' throws BadArguments exception"
    );

    throws(
      function () {
        return new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2Z' });
      },
      /BadArguments/,
      "Invalid note type 'Z' throws BadArguments exception"
    );

    throws(
      function () {
        return new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2dddZ' });
      },
      /BadArguments/,
      "Invalid note type 'Z' throws BadArguments exception"
    );
  },

  ticksNewApi() {
    const BEAT = (1 * Flow.RESOLUTION) / 4;

    // Key value pairs of `testName: [noteData, expectedBeats, expectedNoteType]`
    const tickTests = {
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

    Object.keys(tickTests).forEach(function (testName) {
      const testData = tickTests[testName];
      const noteData = testData[0];
      const expectedBeats = testData[1];
      const expectedNoteType = testData[2];

      noteData.keys = ['c/4', 'e/4', 'g/4'];

      const note = new StaveNote(noteData);
      equal(note.getTicks().value(), BEAT * expectedBeats, testName + ' must have ' + expectedBeats + ' beats');
      equal(note.getNoteType(), expectedNoteType, 'Note type must be ' + expectedNoteType);
    });

    throws(
      function () {
        return new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '8.7dddm' });
      },
      /BadArguments/,
      "Invalid note duration '8.7' throws BadArguments exception"
    );

    throws(
      function () {
        return new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2Z' });
      },
      /BadArguments/,
      "Invalid note type 'Z' throws BadArguments exception"
    );

    throws(
      function () {
        return new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2dddZ' });
      },
      /BadArguments/,
      "Invalid note type 'Z' throws BadArguments exception"
    );
  },

  stem() {
    const note = new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'w' });
    equal(note.getStemDirection(), StaveNote.STEM_UP, 'Default note has UP stem');
  },

  autoStem() {
    [
      // [keys, expectedStemDirection]
      [['c/5', 'e/5', 'g/5'], StaveNote.STEM_DOWN],
      [['e/4', 'g/4', 'c/5'], StaveNote.STEM_UP],
      [['c/5'], StaveNote.STEM_DOWN],
      [['a/4', 'e/5', 'g/5'], StaveNote.STEM_DOWN],
      [['b/4'], StaveNote.STEM_DOWN],
    ].forEach(function (testData) {
      const keys = testData[0];
      const expectedStemDirection = testData[1];
      const note = new StaveNote({ keys: keys, auto_stem: true, duration: '8' });
      equal(
        note.getStemDirection(),
        expectedStemDirection,
        'Stem must be ' + (expectedStemDirection === StaveNote.STEM_UP ? 'up' : 'down')
      );
    });
  },

  stemExtensionPitch() {
    [
      // [keys, expectedStemExtension, override stem direction]
      [['c/5', 'e/5', 'g/5'], 0, 0],
      [['e/4', 'g/4', 'c/5'], 0, 0],
      [['c/5'], 0, 0],
      [['f/3'], 15, 0],
      [['f/3'], 15, Stem.UP],
      [['f/3'], 0, Stem.DOWN],
      [['f/3', 'e/5'], 0, 0],
      [['g/6'], 25, 0],
      [['g/6'], 25, Stem.DOWN],
      [['g/6'], 0, Stem.UP],
    ].forEach(function (testData) {
      const keys = testData[0];
      const expectedStemExtension = testData[1];
      const overrideStemDirection = testData[2];
      let note;
      if (overrideStemDirection === 0) {
        note = new StaveNote({ keys: keys, auto_stem: true, duration: '4' });
      } else {
        note = new StaveNote({ keys: keys, duration: '4', stem_direction: overrideStemDirection });
      }
      equal(
        note.getStemExtension(),
        expectedStemExtension,
        'For ' + keys.toString() + ' StemExtension must be ' + expectedStemExtension
      );
      // set to weird Stave
      const stave = new Stave(10, 10, 300, { spacing_between_lines_px: 20 });
      note.setStave(stave);
      equal(
        note.getStemExtension(),
        expectedStemExtension * 2,
        'For wide staff ' + keys.toString() + ' StemExtension must be ' + expectedStemExtension * 2
      );

      const whole_note = new StaveNote({ keys: keys, duration: 'w' });
      equal(
        whole_note.getStemExtension(),
        -1 * Flow.STEM_HEIGHT,
        'For ' + keys.toString() + ' whole_note StemExtension must always be -1 * VF.STEM_HEIGHT'
      );
    });
  },

  setStemDirectionDisplacement(): void {
    function getDisplacements(note) {
      return note.note_heads.map((notehead) => notehead.isDisplaced());
    }

    const stemUpDisplacements = [false, true, false];
    const stemDownDisplacements = [true, false, false];

    const note = new StaveNote({ keys: ['c/5', 'd/5', 'g/5'], stem_direction: Stem.UP, duration: '4' });
    deepEqual(getDisplacements(note), stemUpDisplacements);
    note.setStemDirection(Stem.DOWN);
    deepEqual(getDisplacements(note), stemDownDisplacements);
    note.setStemDirection(Stem.UP);
    deepEqual(getDisplacements(note), stemUpDisplacements);
  },

  staveLine(): void {
    const stave = new Stave(10, 10, 300);
    const note = new StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' });
    note.setStave(stave);

    const props = note.getKeyProps();
    equal(props[0].line, 0, 'C/4 on line 0');
    equal(props[1].line, 1, 'E/4 on line 1');
    equal(props[2].line, 2.5, 'A/4 on line 2.5');

    const ys = note.getYs();
    equal(ys.length, 3, 'Chord should be rendered on three lines');
    equal(ys[0], 100, 'Line for C/4');
    equal(ys[1], 90, 'Line for E/4');
    equal(ys[2], 75, 'Line for A/4');
  },

  width(): void {
    const note = new StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' });

    throws(
      function () {
        note.getWidth();
      },
      /UnformattedNote/,
      'Unformatted note should have no width'
    );
  },

  tickContext(): void {
    const stave = new Stave(10, 10, 400);
    const note = new StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' }).setStave(stave);

    new TickContext().addTickable(note).preFormat().setX(10).setPadding(0);

    expect(0);
  },

  showNote(note_struct, stave, ctx, x, drawBoundingBox: boolean): StaveNote {
    const note = new StaveNote(note_struct).setStave(stave);

    new TickContext().addTickable(note).preFormat().setX(x);

    note.setContext(ctx).draw();

    if (drawBoundingBox) {
      note.getBoundingBox().draw(ctx);
    }

    return note;
  },

  draw(options: TestOptions, contextBuilder: ContextBuilder): void {
    const clef = options.params.clef;
    const octaveShift = options.params.octaveShift;
    const restKey = options.params.restKey;

    const ctx = contextBuilder(options.elementId, 700, 180);
    const stave = new Stave(10, 30, 750);
    stave.setContext(ctx);
    stave.addClef(clef);
    stave.draw();

    const lowerKeys = ['c/', 'e/', 'a/'];
    const higherKeys = ['c/', 'e/', 'a/'];
    for (let k = 0; k < lowerKeys.length; k++) {
      lowerKeys[k] = lowerKeys[k] + (4 + octaveShift);
      higherKeys[k] = higherKeys[k] + (5 + octaveShift);
    }

    const restKeys = [restKey];

    const notes = [
      { clef: clef, keys: higherKeys, duration: '1/2' },
      { clef: clef, keys: lowerKeys, duration: 'w' },
      { clef: clef, keys: higherKeys, duration: 'h' },
      { clef: clef, keys: lowerKeys, duration: 'q' },
      { clef: clef, keys: higherKeys, duration: '8' },
      { clef: clef, keys: lowerKeys, duration: '16' },
      { clef: clef, keys: higherKeys, duration: '32' },
      { clef: clef, keys: higherKeys, duration: '64' },
      { clef: clef, keys: higherKeys, duration: '128' },
      { clef: clef, keys: lowerKeys, duration: '1/2', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: 'w', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: 'h', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: 'q', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: '8', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: '16', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: '32', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: '64', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: '128', stem_direction: Stem.DOWN },

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
      return function () {
        Vex.forEach($(this).find('*'), function (child) {
          child.setAttribute('fill', color);
          child.setAttribute('stroke', color);
        });
      };
    }

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const staveNote = StaveNoteTests.showNote(note, stave, ctx, (i + 1) * 25);

      // If this is an interactivity test, then attempt to attach mouseover
      // and mouseout handlers to the notes.
      if (options.params.ui) {
        const item = staveNote.getAttribute('el');
        item.addEventListener('mouseover', colorDescendants('green'), false);
        item.addEventListener('mouseout', colorDescendants('black'), false);
      }
      ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
      ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
    }
  },

  drawBoundingBoxes(options: TestOptions, contextBuilder: ContextBuilder): void {
    const clef = options.params.clef;
    const octaveShift = options.params.octaveShift;
    const restKey = options.params.restKey;

    const ctx = contextBuilder(options.elementId, 700, 180);
    const stave = new Stave(10, 30, 750);
    stave.setContext(ctx);
    stave.addClef(clef);
    stave.draw();

    const lowerKeys = ['c/', 'e/', 'a/'];
    const higherKeys = ['c/', 'e/', 'a/'];
    for (let k = 0; k < lowerKeys.length; k++) {
      lowerKeys[k] = lowerKeys[k] + (4 + octaveShift);
      higherKeys[k] = higherKeys[k] + (5 + octaveShift);
    }

    const restKeys = [restKey];

    const notes = [
      { clef: clef, keys: higherKeys, duration: '1/2' },
      { clef: clef, keys: lowerKeys, duration: 'w' },
      { clef: clef, keys: higherKeys, duration: 'h' },
      { clef: clef, keys: lowerKeys, duration: 'q' },
      { clef: clef, keys: higherKeys, duration: '8' },
      { clef: clef, keys: lowerKeys, duration: '16' },
      { clef: clef, keys: higherKeys, duration: '32' },
      { clef: clef, keys: higherKeys, duration: '64' },
      { clef: clef, keys: higherKeys, duration: '128' },
      { clef: clef, keys: lowerKeys, duration: '1/2', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: 'w', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: 'h', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: 'q', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: '8', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: '16', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: '32', stem_direction: Stem.DOWN },
      { clef: clef, keys: lowerKeys, duration: '64', stem_direction: Stem.DOWN },
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

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const staveNote = StaveNoteTests.showNote(note, stave, ctx, (i + 1) * 25, true);

      ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
      ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
    }
  },

  drawBass(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(40);
    const ctx = contextBuilder(options.elementId, 600, 280);
    const stave = new Stave(10, 10, 650);
    stave.setContext(ctx);
    stave.addClef('bass');
    stave.draw();

    const notes = [
      { clef: 'bass', keys: ['c/3', 'e/3', 'a/3'], duration: '1/2' },
      { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: 'w' },
      { clef: 'bass', keys: ['c/3', 'e/3', 'a/3'], duration: 'h' },
      { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: 'q' },
      { clef: 'bass', keys: ['c/3', 'e/3', 'a/3'], duration: '8' },
      { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: '16' },
      { clef: 'bass', keys: ['c/3', 'e/3', 'a/3'], duration: '32' },
      { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: 'h', stem_direction: Stem.DOWN },
      { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: 'q', stem_direction: Stem.DOWN },
      { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: '8', stem_direction: Stem.DOWN },
      { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: '16', stem_direction: Stem.DOWN },
      { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: '32', stem_direction: Stem.DOWN },

      { keys: ['r/4'], duration: '1/2r' },
      { keys: ['r/4'], duration: 'wr' },
      { keys: ['r/4'], duration: 'hr' },
      { keys: ['r/4'], duration: 'qr' },
      { keys: ['r/4'], duration: '8r' },
      { keys: ['r/4'], duration: '16r' },
      { keys: ['r/4'], duration: '32r' },
      { keys: ['x/4'], duration: 'h' },
    ];

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const staveNote = StaveNoteTests.showNote(note, stave, ctx, (i + 1) * 25);

      ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
      ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
    }
  },

  displacements(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 700, 140);
    ctx.scale(0.9, 0.9);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';

    const stave = new Stave(10, 10, 650);
    stave.setContext(ctx);
    stave.draw();

    const notes = [
      { keys: ['g/3', 'a/3', 'c/4', 'd/4', 'e/4'], duration: '1/2' },
      { keys: ['g/3', 'a/3', 'c/4', 'd/4', 'e/4'], duration: 'w' },
      { keys: ['d/4', 'e/4', 'f/4'], duration: 'h' },
      { keys: ['f/4', 'g/4', 'a/4', 'b/4'], duration: 'q' },
      { keys: ['e/3', 'b/3', 'c/4', 'e/4', 'f/4', 'g/5', 'a/5'], duration: '8' },
      { keys: ['a/3', 'c/4', 'e/4', 'g/4', 'a/4', 'b/4'], duration: '16' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '32' },
      { keys: ['c/4', 'e/4', 'a/4', 'a/4'], duration: '64' },
      { keys: ['g/3', 'c/4', 'd/4', 'e/4'], duration: 'h', stem_direction: Stem.DOWN },
      { keys: ['d/4', 'e/4', 'f/4'], duration: 'q', stem_direction: Stem.DOWN },
      { keys: ['f/4', 'g/4', 'a/4', 'b/4'], duration: '8', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4'], duration: '16', stem_direction: Stem.DOWN },
      { keys: ['b/3', 'c/4', 'e/4', 'a/4', 'b/5', 'c/6', 'e/6'], duration: '32', stem_direction: Stem.DOWN },
      {
        keys: ['b/3', 'c/4', 'e/4', 'a/4', 'b/5', 'c/6', 'e/6', 'e/6'],
        duration: '64',
        stem_direction: Stem.DOWN,
      },
    ];
    expect(notes.length * 2);

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const staveNote = StaveNoteTests.showNote(note, stave, ctx, (i + 1) * 45);

      ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
      ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
    }
  },

  drawHarmonicAndMuted(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 1000, 180);
    const stave = new Stave(10, 10, 950);
    stave.setContext(ctx);
    stave.draw();

    const notes = [
      { keys: ['c/4', 'e/4', 'a/4'], duration: '1/2h' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: 'wh' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: 'hh' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: 'qh' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '8h' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '16h' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '32h' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '64h' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '128h' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '1/2h', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: 'wh', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: 'hh', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: 'qh', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '8h', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '16h', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '32h', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '64h', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '128h', stem_direction: Stem.DOWN },

      { keys: ['c/4', 'e/4', 'a/4'], duration: '1/2m' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: 'wm' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: 'hm' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: 'qm' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '8m' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '16m' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '32m' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '64m' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '128m' },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '1/2m', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: 'wm', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: 'hm', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: 'qm', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '8m', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '16m', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '32m', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '64m', stem_direction: Stem.DOWN },
      { keys: ['c/4', 'e/4', 'a/4'], duration: '128m', stem_direction: Stem.DOWN },
    ];
    expect(notes.length * 2);

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const staveNote = StaveNoteTests.showNote(note, stave, ctx, i * 25 + 5);

      ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
      ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
    }
  },

  drawSlash(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 700, 180);
    const stave = new Stave(10, 10, 650);
    stave.setContext(ctx);
    stave.draw();

    const notes = [
      { keys: ['b/4'], duration: '1/2s', stem_direction: Stem.DOWN },
      { keys: ['b/4'], duration: 'ws', stem_direction: Stem.DOWN },
      { keys: ['b/4'], duration: 'hs', stem_direction: Stem.DOWN },
      { keys: ['b/4'], duration: 'qs', stem_direction: Stem.DOWN },
      { keys: ['b/4'], duration: '8s', stem_direction: Stem.DOWN },
      { keys: ['b/4'], duration: '16s', stem_direction: Stem.DOWN },
      { keys: ['b/4'], duration: '32s', stem_direction: Stem.DOWN },
      { keys: ['b/4'], duration: '64s', stem_direction: Stem.DOWN },
      { keys: ['b/4'], duration: '128s', stem_direction: Stem.DOWN },

      { keys: ['b/4'], duration: '1/2s', stem_direction: Stem.UP },
      { keys: ['b/4'], duration: 'ws', stem_direction: Stem.UP },
      { keys: ['b/4'], duration: 'hs', stem_direction: Stem.UP },
      { keys: ['b/4'], duration: 'qs', stem_direction: Stem.UP },
      { keys: ['b/4'], duration: '8s', stem_direction: Stem.UP },
      { keys: ['b/4'], duration: '16s', stem_direction: Stem.UP },
      { keys: ['b/4'], duration: '32s', stem_direction: Stem.UP },
      { keys: ['b/4'], duration: '64s', stem_direction: Stem.UP },
      { keys: ['b/4'], duration: '128s', stem_direction: Stem.UP },

      // Beam
      { keys: ['b/4'], duration: '8s', stem_direction: Stem.DOWN },
      { keys: ['b/4'], duration: '8s', stem_direction: Stem.DOWN },
      { keys: ['b/4'], duration: '8s', stem_direction: Stem.UP },
      { keys: ['b/4'], duration: '8s', stem_direction: Stem.UP },
    ];

    const stave_notes = notes.map((note_struct) => new StaveNote(note_struct));
    const beam1 = new Beam([stave_notes[16], stave_notes[17]]);
    const beam2 = new Beam([stave_notes[18], stave_notes[19]]);

    Formatter.FormatAndDraw(ctx, stave, stave_notes, false);

    beam1.setContext(ctx).draw();
    beam2.setContext(ctx).draw();

    ok('Slash Note Heads');
  },

  drawKeyStyles(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 300, 280);
    ctx.scale(3, 3);

    const stave = new Stave(10, 0, 100);

    const note = new StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: 'q' })
      .setStave(stave)
      .addAccidental(1, new Accidental('b'))
      .setKeyStyle(1, { shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue' });

    new TickContext().addTickable(note).preFormat().setX(25);

    stave.setContext(ctx).draw();
    note.setContext(ctx).draw();

    ok(note.getX() > 0, 'Note has X value');
    ok(note.getYs().length > 0, 'Note has Y values');
  },

  drawNoteStyles(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 300, 280);
    const stave = new Stave(10, 0, 100);
    ctx.scale(3, 3);

    const note = new StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: '8' })
      .setStave(stave)
      .addAccidental(1, new Accidental('b'));

    note.setStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

    new TickContext().addTickable(note).preFormat().setX(25);

    stave.setContext(ctx).draw();
    note.setContext(ctx).draw();

    ok(note.getX() > 0, 'Note has X value');
    ok(note.getYs().length > 0, 'Note has Y values');
  },

  drawNoteStemStyles(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 300, 280);
    const stave = new Stave(10, 0, 100);
    ctx.scale(3, 3);

    const note = new StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: 'q' })
      .setStave(stave)
      .addAccidental(1, new Accidental('b'));

    note.setStemStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

    new TickContext().addTickable(note).preFormat().setX(25);

    stave.setContext(ctx).draw();
    note.setContext(ctx).draw();

    ok('Note Stem Style');
  },

  drawNoteStemLengths(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 975, 150);
    const stave = new Stave(10, 10, 975);
    stave.setContext(ctx).draw();

    const keys = [
      'e/3',
      'f/3',
      'g/3',
      'a/3',
      'b/3',
      'c/4',
      'd/4',
      'e/4',
      'f/4',
      'g/4',
      'f/5',
      'g/5',
      'a/5',
      'b/5',
      'c/6',
      'd/6',
      'e/6',
      'f/6',
      'g/6',
      'a/6',
    ];
    const stave_notes = [];
    let note;
    let i;

    for (i = 0; i < keys.length; i++) {
      let duration = 'q';
      if (i % 2 === 1) {
        duration = '8';
      }
      note = new StaveNote({ keys: [keys[i]], duration, auto_stem: true }).setStave(stave);

      new TickContext().addTickable(note);

      note.setContext(ctx);
      stave_notes.push(note);
    }

    const whole_keys = ['e/3', 'a/3', 'f/5', 'a/5', 'd/6', 'a/6'];
    for (i = 0; i < whole_keys.length; i++) {
      note = new StaveNote({ keys: [whole_keys[i]], duration: 'w' }).setStave(stave);

      new TickContext().addTickable(note);

      note.setContext(ctx);
      stave_notes.push(note);
    }
    Formatter.FormatAndDraw(ctx, stave, stave_notes);

    ok('Note Stem Length');
  },

  drawNoteStylesWithFlag(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 300, 280);
    const stave = new Stave(10, 0, 100);
    ctx.scale(3, 3);

    const note = new StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: '8' })
      .setStave(stave)
      .addAccidental(1, new Accidental('b'));

    note.setFlagStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

    new TickContext().addTickable(note).preFormat().setX(25);

    stave.setContext(ctx).draw();
    note.setContext(ctx).draw();

    ok(note.getX() > 0, 'Note has X value');
    ok(note.getYs().length > 0, 'Note has Y values');
  },

  drawBeamStyles(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 400, 160);
    const stave = new Stave(10, 10, 380);
    stave.setStyle({
      strokeStyle: '#EEAAEE',
      lineWidth: '3',
    });
    stave.setContext(ctx);
    stave.draw();

    const notes = [
      // beam1
      { keys: ['b/4'], duration: '8', stem_direction: Stem.DOWN },
      { keys: ['b/4'], duration: '8', stem_direction: Stem.DOWN },

      // should be unstyled...
      { keys: ['b/4'], duration: '8', stem_direction: Stem.DOWN },

      // beam2 should also be unstyled
      { keys: ['b/4'], duration: '8', stem_direction: Stem.DOWN },
      { keys: ['b/4'], duration: '8', stem_direction: Stem.DOWN },

      // beam3
      { keys: ['b/4'], duration: '8', stem_direction: Stem.UP },
      { keys: ['b/4'], duration: '8', stem_direction: Stem.UP },

      // beam4
      { keys: ['d/6'], duration: '8', stem_direction: Stem.DOWN },
      { keys: ['c/6', 'd/6'], duration: '8', stem_direction: Stem.DOWN },

      // unbeamed
      { keys: ['d/6', 'e/6'], duration: '8', stem_direction: Stem.DOWN },

      // unbeamed, unstyled
      { keys: ['e/6', 'f/6'], duration: '8', stem_direction: Stem.DOWN },
    ];

    const staveNotes = notes.map(function (note) {
      return new StaveNote(note);
    });

    const beam1 = new Beam(staveNotes.slice(0, 2));
    const beam2 = new Beam(staveNotes.slice(3, 5));
    const beam3 = new Beam(staveNotes.slice(5, 7));
    const beam4 = new Beam(staveNotes.slice(7, 9));

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

    Formatter.FormatAndDraw(ctx, stave, staveNotes, false);

    beam1.setContext(ctx).draw();
    beam2.setContext(ctx).draw();
    beam3.setContext(ctx).draw();
    beam4.setContext(ctx).draw();

    ok('draw beam styles');
  },

  renderNote(note, stave, ctx, x) {
    note.setStave(stave);

    const mc = new ModifierContext();
    note.addToModifierContext(mc);

    new TickContext().addTickable(note).preFormat().setX(x);

    note.setContext(ctx).draw();
    ctx.save();

    return note;
  },

  dotsAndFlagsStemUp(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 800, 150);
    ctx.scale(1.0, 1.0);
    ctx.setFillStyle('#221');
    ctx.setStrokeStyle('#221');

    const stave = new Stave(10, 10, 975);

    const notes = [
      note({ keys: ['f/4'], duration: '4', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['f/4'], duration: '8', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['f/4'], duration: '16', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['f/4'], duration: '32', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['f/4'], duration: '64', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['f/4'], duration: '128', stem_direction: Stem.UP })
        .addDotToAll()
        .addDotToAll(),
      note({ keys: ['g/4'], duration: '4', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['g/4'], duration: '8', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['g/4'], duration: '16', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['g/4'], duration: '32' }).addDotToAll(),
      note({ keys: ['g/4'], duration: '64', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['g/4'], duration: '128', stem_direction: Stem.UP })
        .addDotToAll()
        .addDotToAll(),
    ];

    stave.setContext(ctx).draw();

    for (let i = 0; i < notes.length; ++i) {
      StaveNoteTests.renderNote(notes[i], stave, ctx, i * 65);
    }

    ok(true, 'Full Dot');
  },

  dotsAndFlagsStemDown(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 800, 160);
    ctx.scale(1.0, 1.0);
    ctx.setFillStyle('#221');
    ctx.setStrokeStyle('#221');

    const stave = new Stave(10, 10, 975);

    const notes = [
      note({ keys: ['e/5'], duration: '4', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['e/5'], duration: '8', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['e/5'], duration: '16', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['e/5'], duration: '32', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['e/5'], duration: '64', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['e/5'], duration: '128', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['d/5'], duration: '4', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['d/5'], duration: '8', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['d/5'], duration: '16', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['d/5'], duration: '32', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['d/5'], duration: '64', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['d/5'], duration: '128', stem_direction: Stem.DOWN }).addDotToAll(),
    ];

    stave.setContext(ctx).draw();

    for (let i = 0; i < notes.length; ++i) {
      StaveNoteTests.renderNote(notes[i], stave, ctx, i * 65);
    }

    ok(true, 'Full Dot');
  },

  dotsAndBeamsUp(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 800, 150);
    ctx.scale(1.0, 1.0);
    ctx.setFillStyle('#221');
    ctx.setStrokeStyle('#221');

    const stave = new Stave(10, 10, 975);

    const notes = [
      note({ keys: ['f/4'], duration: '8', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['f/4'], duration: '16', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['f/4'], duration: '32', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['f/4'], duration: '64', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['f/4'], duration: '128', stem_direction: Stem.UP })
        .addDotToAll()
        .addDotToAll(),
      note({ keys: ['g/4'], duration: '8', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['g/4'], duration: '16', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['g/4'], duration: '32' }).addDotToAll(),
      note({ keys: ['g/4'], duration: '64', stem_direction: Stem.UP }).addDotToAll(),
      note({ keys: ['g/4'], duration: '128', stem_direction: Stem.UP })
        .addDotToAll()
        .addDotToAll(),
    ];

    const beam = new Beam(notes);

    stave.setContext(ctx).draw();

    for (let i = 0; i < notes.length; ++i) {
      StaveNoteTests.renderNote(notes[i], stave, ctx, i * 65);
    }

    beam.setContext(ctx).draw();

    ok(true, 'Full Dot');
  },

  dotsAndBeamsDown(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 800, 160);
    ctx.scale(1.0, 1.0);
    ctx.setFillStyle('#221');
    ctx.setStrokeStyle('#221');

    const stave = new Stave(10, 10, 975);

    const notes = [
      note({ keys: ['e/5'], duration: '8', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['e/5'], duration: '16', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['e/5'], duration: '32', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['e/5'], duration: '64', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['e/5'], duration: '128', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['d/5'], duration: '8', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['d/5'], duration: '16', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['d/5'], duration: '32', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['d/5'], duration: '64', stem_direction: Stem.DOWN }).addDotToAll(),
      note({ keys: ['d/5'], duration: '128', stem_direction: Stem.DOWN }).addDotToAll(),
    ];

    const beam = new Beam(notes);

    stave.setContext(ctx).draw();

    for (let i = 0; i < notes.length; ++i) {
      StaveNoteTests.renderNote(notes[i], stave, ctx, i * 65);
    }

    beam.setContext(ctx).draw();

    ok(true, 'Full Dot');
  },

  centerAlignedRest(options) {
    const f = VexFlowTests.makeFactory(options, 400, 160);
    const stave = f.Stave({ x: 10, y: 10, width: 350 }).addClef('treble').addTimeSignature('4/4');
    const note = f.StaveNote({ keys: ['b/4'], duration: '1r', align_center: true });
    const voice = f.Voice().setStrict(false).addTickables([note]);
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    ok(true);
  },

  centerAlignedRestFermata(options) {
    const f = VexFlowTests.makeFactory(options, 400, 160);

    const stave = f.Stave({ x: 10, y: 10, width: 350 }).addClef('treble').addTimeSignature('4/4');

    const note = f
      .StaveNote({ keys: ['b/4'], duration: '1r', align_center: true })
      .addArticulation(0, new Articulation('a@a').setPosition(3));

    const voice = f.Voice().setStrict(false).addTickables([note]);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    ok(true);
  },

  centerAlignedRestAnnotation(options) {
    const f = VexFlowTests.makeFactory(options, 400, 160);

    const stave = f.Stave({ x: 10, y: 10, width: 350 }).addClef('treble').addTimeSignature('4/4');

    const note = f
      .StaveNote({ keys: ['b/4'], duration: '1r', align_center: true })
      .addAnnotation(0, new Annotation('Whole measure rest').setPosition(3));

    const voice = f.Voice().setStrict(false).addTickables([note]);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    ok(true);
  },

  centerAlignedNoteMultiModifiers(options) {
    const f = VexFlowTests.makeFactory(options, 400, 160);

    const stave = f.Stave({ x: 10, y: 10, width: 350 }).addClef('treble').addTimeSignature('4/4');

    function newFinger(num, pos) {
      return new FretHandFinger(num).setPosition(pos);
    }
    function newStringNumber(num, pos) {
      return new StringNumber(num).setPosition(pos);
    }

    const note = f
      .StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '4', align_center: true })
      .addAnnotation(0, new Annotation('Test').setPosition(3))
      .addStroke(0, new Stroke(2))
      .addAccidental(1, new Accidental('#'))
      .addModifier(newFinger('3', Modifier.Position.LEFT), 0)
      .addModifier(newFinger('2', Modifier.Position.LEFT), 2)
      .addModifier(newFinger('1', Modifier.Position.RIGHT), 1)
      .addModifier(newStringNumber('4', Modifier.Position.BELOW), 2)
      .addDotToAll();

    const voice = f.Voice().setStrict(false).addTickables([note]);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    ok(true);
  },

  centerAlignedMultiVoice(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 400, 160);

    const stave = f.Stave({ x: 10, y: 10, width: 350 }).addClef('treble').addTimeSignature('3/8');

    // Create custom duration
    const custom_duration = new Fraction(3, 8);

    const notes0 = [{ keys: ['c/4'], duration: '1r', align_center: true, duration_override: custom_duration }].map(
      f.StaveNote.bind(f)
    );

    const notes1 = [
      { keys: ['b/4'], duration: '8' },
      { keys: ['b/4'], duration: '8' },
      { keys: ['b/4'], duration: '8' },
    ].map(f.StaveNote.bind(f));

    notes1[1].addAccidental(0, f.Accidental({ type: '#' }));

    f.Beam({ notes: notes1 });

    const voice0 = f.Voice({ time: '3/8' }).setStrict(false).addTickables(notes0);

    const voice1 = f.Voice({ time: '3/8' }).setStrict(false).addTickables(notes1);

    f.Formatter().joinVoices([voice0, voice1]).formatToStave([voice0, voice1], stave);

    f.draw();

    ok(true);
  },
};

export { StaveNoteTests };
