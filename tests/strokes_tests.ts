// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

/* eslint-disable */
// @ts-nocheck

import { Vex } from 'vex';
import { QUnit, ok } from './declarations';

/**
 * Stroke Tests
 */
const StrokesTests = (function () {
  const Strokes = {
    Start: function () {
      const run = VF.Test.runTests;

      QUnit.module('Strokes');

      run('Strokes - Brush/Roll/Rasquedo', Strokes.brushRollRasquedo);
      run('Strokes - Arpeggio directionless (without arrows)', Strokes.arpeggioDirectionless);
      run('Strokes - Multi Voice', Strokes.multiVoice);
      run('Strokes - Notation and Tab', Strokes.notesWithTab);
      run('Strokes - Multi-Voice Notation and Tab', Strokes.multiNotationAndTab);
    },

    brushRollRasquedo: function (options) {
      const vf = VF.Test.makeFactory(options, 600, 200);
      const score = vf.EasyScore();

      // bar 1
      const stave1 = vf.Stave({ width: 250 }).setEndBarType(VF.Barline.type.DOUBLE);

      const notes1 = score.notes('(a3 e4 a4)/4, (c4 e4 g4), (c4 e4 g4), (c4 e4 g4)', { stem: 'up' });

      notes1[0].addStroke(0, new VF.Stroke(1));
      notes1[1]
        .addStroke(0, new VF.Stroke(2))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addAccidental(2, vf.Accidental({ type: '#' }))
        .addAccidental(0, vf.Accidental({ type: '#' }));
      notes1[2].addStroke(0, new VF.Stroke(1));
      notes1[3].addStroke(0, new VF.Stroke(2));

      const voice1 = score.voice(notes1);

      vf.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      // bar 2
      const stave2 = vf
        .Stave({ x: stave1.width + stave1.x, y: stave1.y, width: 300 })
        .setEndBarType(VF.Barline.type.DOUBLE);

      const notes2 = score.notes('(c4 d4 g4)/4, (c4 d4 g4), (c4 d4 g4), (c4 d4 a4)', { stem: 'up' });

      notes2[0].addStroke(0, new VF.Stroke(3));
      notes2[1].addStroke(0, new VF.Stroke(4));
      notes2[2].addStroke(0, new VF.Stroke(5));
      notes2[3]
        .addStroke(0, new VF.Stroke(6))
        .addAccidental(0, vf.Accidental({ type: 'bb' }))
        .addAccidental(1, vf.Accidental({ type: 'bb' }))
        .addAccidental(2, vf.Accidental({ type: 'bb' }));

      const voice2 = score.voice(notes2);

      vf.Formatter().joinVoices([voice2]).formatToStave([voice2], stave2);

      vf.draw();

      ok(true, 'Brush/Roll/Rasquedo');
    },

    arpeggioDirectionless: function (options) {
      const vf = VF.Test.makeFactory(options, 700, 200);
      const score = vf.EasyScore();

      // bar 1
      const stave1 = vf.Stave({ x: 100, width: 500 }).setEndBarType(VF.Barline.type.DOUBLE);

      const notes1 = score.notes('(g4 b4 d5)/4, (g4 b4 d5 g5), (g4 b4 d5 g5), (g4 b4 d5)', { stem: 'up' });

      const graceNotes = [
        { keys: ['e/4'], duration: '32' },
        { keys: ['f/4'], duration: '32' },
        { keys: ['g/4'], duration: '32' },
      ].map(vf.GraceNote.bind(vf));

      const graceNoteGroup = vf.GraceNoteGroup({ notes: graceNotes, slur: false });
      graceNoteGroup.beamNotes();

      notes1[0].addStroke(0, new VF.Stroke(7));
      notes1[1]
        .addStroke(0, new VF.Stroke(7))
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addAccidental(2, vf.Accidental({ type: '#' }))
        .addAccidental(3, vf.Accidental({ type: '#' }));
      notes1[2]
        .addStroke(0, new VF.Stroke(7))
        .addAccidental(1, vf.Accidental({ type: 'b' }))
        .addModifier(graceNoteGroup, 0);
      notes1[3].addStroke(0, new VF.Stroke(7)).addModifier(
        vf.NoteSubGroup({
          notes: [vf.ClefNote({ type: 'treble', options: { size: 'default', annotation: '8va' } })],
        }),
        0
      );

      const voice1 = score.voice(notes1);

      vf.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      vf.draw();

      ok(true, 'Arpeggio directionless (without arrows)');
    },

    multiVoice: function (options) {
      const vf = VF.Test.makeFactory(options, 500, 200);
      const score = vf.EasyScore();
      const stave = vf.Stave();

      const notes1 = score.notes('(c4 e4 g4)/4, (c4 e4 g4), (c4 d4 a4), (c4 d4 a4)', { stem: 'up' });

      notes1[0].addStroke(0, new VF.Stroke(5));
      notes1[1]
        .addStroke(0, new VF.Stroke(6))
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addAccidental(2, vf.Accidental({ type: '#' }));
      notes1[2].addStroke(0, new VF.Stroke(2));
      notes1[3].addStroke(0, new VF.Stroke(1));

      const notes2 = score.notes('e3/8, e3, e3, e3, e3, e3, e3, e3', { stem: 'down' });

      vf.Beam({ notes: notes2.slice(0, 4) });
      vf.Beam({ notes: notes2.slice(4, 8) });

      const voices = [notes1, notes2].map(score.voice.bind(score));

      vf.Formatter().joinVoices(voices).formatToStave(voices, stave);

      vf.draw();

      ok(true, 'Strokes Test Multi Voice');
    },

    multiNotationAndTab: function (options) {
      const vf = VF.Test.makeFactory(options, 400, 275);
      const score = vf.EasyScore();
      const stave = vf.Stave().addClef('treble');

      // notation upper voice notes
      const notes1 = score.notes('(g4 b4 e5)/4, (g4 b4 e5), (g4 b4 e5), (g4 b4 e5)', { stem: 'up' });

      notes1[0].addStroke(0, new VF.Stroke(3, { all_voices: false }));
      notes1[1].addStroke(0, new VF.Stroke(6));
      notes1[2].addStroke(0, new VF.Stroke(2, { all_voices: false }));
      notes1[3].addStroke(0, new VF.Stroke(1));

      const notes2 = score.notes('g3/4, g3, g3, g3', { stem: 'down' });

      vf.TabStave({ y: 100 }).addClef('tab').setNoteStartX(stave.getNoteStartX());

      // tablature upper voice notes
      const tabNotes1 = [
        vf.TabNote({
          positions: [
            { str: 3, fret: 0 },
            { str: 2, fret: 0 },
            { str: 1, fret: 1 },
          ],
          duration: '4',
        }),
        vf.TabNote({
          positions: [
            { str: 3, fret: 0 },
            { str: 2, fret: 0 },
            { str: 1, fret: 1 },
          ],
          duration: '4',
        }),
        vf.TabNote({
          positions: [
            { str: 3, fret: 0 },
            { str: 2, fret: 0 },
            { str: 1, fret: 1 },
          ],
          duration: '4',
        }),
        vf.TabNote({
          positions: [
            { str: 3, fret: 0 },
            { str: 2, fret: 0 },
            { str: 1, fret: 1 },
          ],
          duration: '4',
        }),
      ];

      tabNotes1[0].addStroke(0, new VF.Stroke(3, { all_voices: false }));
      tabNotes1[1].addStroke(0, new VF.Stroke(6));
      tabNotes1[2].addStroke(0, new VF.Stroke(2, { all_voices: false }));
      tabNotes1[3].addStroke(0, new VF.Stroke(1));

      const tabNotes2 = [
        vf.TabNote({ positions: [{ str: 6, fret: 3 }], duration: '4' }),
        vf.TabNote({ positions: [{ str: 6, fret: 3 }], duration: '4' }),
        vf.TabNote({ positions: [{ str: 6, fret: 3 }], duration: '4' }),
        vf.TabNote({ positions: [{ str: 6, fret: 3 }], duration: '4' }),
      ];

      const voices = [notes1, notes2, tabNotes1, tabNotes2].map(score.voice.bind(score));

      vf.Formatter().joinVoices(voices).formatToStave(voices, stave);

      vf.draw();

      ok(true, 'Strokes Test Notation & Tab Multi Voice');
    },

    drawTabStrokes: function (options) {
      const vf = VF.Test.makeFactory(options, 600, 200);
      const stave1 = vf.TabStave({ width: 250 }).setEndBarType(VF.Barline.type.DOUBLE);

      const tabNotes1 = [
        vf.TabNote({
          positions: [
            { str: 2, fret: 8 },
            { str: 3, fret: 9 },
            { str: 4, fret: 10 },
          ],
          duration: '4',
        }),
        vf.TabNote({
          positions: [
            { str: 3, fret: 7 },
            { str: 4, fret: 8 },
            { str: 5, fret: 9 },
          ],
          duration: '4',
        }),
        vf.TabNote({
          positions: [
            { str: 1, fret: 5 },
            { str: 2, fret: 6 },
            { str: 3, fret: 7 },
            { str: 4, fret: 7 },
            { str: 5, fret: 5 },
            { str: 6, fret: 5 },
          ],
          duration: '4',
        }),
        vf.TabNote({
          positions: [
            { str: 4, fret: 3 },
            { str: 5, fret: 4 },
            { str: 6, fret: 5 },
          ],
          duration: '4',
        }),
      ];

      tabNotes1[0].addStroke(0, new VF.Stroke(1));
      tabNotes1[1].addStroke(0, new VF.Stroke(2));
      tabNotes1[2].addStroke(0, new VF.Stroke(3));
      tabNotes1[3].addStroke(0, new VF.Stroke(4));

      const tabVoice1 = vf.Voice().addTickables(tabNotes1);

      vf.Formatter().joinVoices([tabVoice1]).formatToStave([tabVoice1], stave1);

      // bar 2
      const stave2 = vf.TabStave({ x: stave1.width + stave1.x, width: 300 }).setEndBarType(VF.Barline.type.DOUBLE);

      const tabNotes2 = [
        vf.TabNote({
          positions: [
            { str: 2, fret: 7 },
            { str: 3, fret: 8 },
            { str: 4, fret: 9 },
          ],
          duration: '2',
        }),
        vf.TabNote({
          positions: [
            { str: 1, fret: 5 },
            { str: 2, fret: 6 },
            { str: 3, fret: 7 },
            { str: 4, fret: 7 },
            { str: 5, fret: 5 },
            { str: 6, fret: 5 },
          ],
          duration: '2',
        }),
      ];

      tabNotes2[0].addStroke(0, new VF.Stroke(6));
      tabNotes2[1].addStroke(0, new VF.Stroke(5));

      const tabVoice2 = vf.Voice().addTickables(tabNotes2);

      vf.Formatter().joinVoices([tabVoice2]).formatToStave([tabVoice2], stave2);

      vf.draw();

      ok(true, 'Strokes Tab test');
    },

    notesWithTab: function (options) {
      const vf = VF.Test.makeFactory(options, 500, 300);

      const stave = vf.Stave({ x: 15, y: 40, width: 450 }).addClef('treble');

      const notes = [
        vf
          .StaveNote({ keys: ['b/4', 'd/5', 'g/5'], stem_direction: -1, duration: '4' })
          .addAccidental(1, vf.Accidental({ type: 'b' }))
          .addAccidental(0, vf.Accidental({ type: 'b' })),
        vf.StaveNote({ keys: ['c/5', 'd/5'], stem_direction: -1, duration: '4' }),
        vf.StaveNote({ keys: ['b/3', 'e/4', 'a/4', 'd/5'], stem_direction: 1, duration: '8' }),
        vf
          .StaveNote({ keys: ['a/3', 'e/4', 'a/4', 'c/5', 'e/5', 'a/5'], stem_direction: 1, duration: '8' })
          .addAccidental(3, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['b/3', 'e/4', 'a/4', 'd/5'], stem_direction: 1, duration: '8' }),
        vf
          .StaveNote({ keys: ['a/3', 'e/4', 'a/4', 'c/5', 'f/5', 'a/5'], stem_direction: 1, duration: '8' })
          .addAccidental(3, vf.Accidental({ type: '#' }))
          .addAccidental(4, vf.Accidental({ type: '#' })),
      ];

      const tabstave = vf
        .TabStave({ x: stave.x, y: 140, width: 450 })
        .addClef('tab')
        .setNoteStartX(stave.getNoteStartX());

      const tabNotes = [
        vf
          .TabNote({
            positions: [
              { str: 1, fret: 3 },
              { str: 2, fret: 2 },
              { str: 3, fret: 3 },
            ],
            duration: '4',
          })
          .addModifier(new VF.Bend('Full'), 0),
        vf
          .TabNote({
            positions: [
              { str: 2, fret: 3 },
              { str: 3, fret: 5 },
            ],
            duration: '4',
          })
          .addModifier(new VF.Bend('Unison'), 1),
        vf.TabNote({
          positions: [
            { str: 3, fret: 7 },
            { str: 4, fret: 7 },
            { str: 5, fret: 7 },
            { str: 6, fret: 7 },
          ],
          duration: '8',
        }),
        vf.TabNote({
          positions: [
            { str: 1, fret: 5 },
            { str: 2, fret: 5 },
            { str: 3, fret: 6 },
            { str: 4, fret: 7 },
            { str: 5, fret: 7 },
            { str: 6, fret: 5 },
          ],
          duration: '8',
        }),
        vf.TabNote({
          positions: [
            { str: 3, fret: 7 },
            { str: 4, fret: 7 },
            { str: 5, fret: 7 },
            { str: 6, fret: 7 },
          ],
          duration: '8',
        }),
        vf.TabNote({
          positions: [
            { str: 1, fret: 5 },
            { str: 2, fret: 5 },
            { str: 3, fret: 6 },
            { str: 4, fret: 7 },
            { str: 5, fret: 7 },
            { str: 6, fret: 5 },
          ],
          duration: '8',
        }),
      ];

      notes[0].addStroke(0, new VF.Stroke(1));
      notes[1].addStroke(0, new VF.Stroke(2));
      notes[2].addStroke(0, new VF.Stroke(3));
      notes[3].addStroke(0, new VF.Stroke(4));
      notes[4].addStroke(0, new VF.Stroke(5));
      notes[5].addStroke(0, new VF.Stroke(6));

      tabNotes[0].addStroke(0, new VF.Stroke(1));
      tabNotes[1].addStroke(0, new VF.Stroke(2));
      tabNotes[2].addStroke(0, new VF.Stroke(3));
      tabNotes[3].addStroke(0, new VF.Stroke(4));
      tabNotes[4].addStroke(0, new VF.Stroke(5));
      tabNotes[5].addStroke(0, new VF.Stroke(6));

      vf.StaveConnector({
        top_stave: stave,
        bottom_stave: tabstave,
        type: 'bracket',
      });

      vf.StaveConnector({
        top_stave: stave,
        bottom_stave: tabstave,
        type: 'single',
      });

      const voice = vf.Voice().addTickables(notes);
      const tabVoice = vf.Voice().addTickables(tabNotes);
      const beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter().joinVoices([voice]).joinVoices([tabVoice]).formatToStave([voice, tabVoice], stave);

      vf.draw();

      beams.forEach(function (beam) {
        beam.setContext(vf.getContext()).draw();
      });

      ok(true);
    },
  };

  return Strokes;
})();
VF.Test.Strokes = StrokesTests;
export { StrokesTests };
