/**
 * VexFlow - StringNumber Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StringNumber = (function () {
  var StringNumber = {
    Start: function () {
      var run = VF.Test.runTests;

      QUnit.module('StringNumber');

      run('String Number In Notation', StringNumber.drawMultipleMeasures);
      run('Fret Hand Finger In Notation', StringNumber.drawFretHandFingers);
      run('Multi Voice With Strokes, String & Finger Numbers', StringNumber.multi);
      run('Complex Measure With String & Finger Numbers', StringNumber.drawAccidentals);
    },

    drawMultipleMeasures: function (options) {
      var vf = VF.Test.makeFactory(options, 775, 200);
      var score = vf.EasyScore();

      // bar 1
      var stave1 = vf.Stave({ width: 300 }).setEndBarType(VF.Barline.type.DOUBLE).addClef('treble');

      var notes1 = score.notes('(c4 e4 g4)/4., (c5 e5 g5)/8, (c4 f4 g4)/4, (c4 f4 g4)/4', { stem: 'down' });

      notes1[0]
        .addModifier(0, vf.StringNumber({ number: '5', position: 'right' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'left' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }));

      notes1[1]
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addModifier(0, vf.StringNumber({ number: '5', position: 'below' }))
        .addAccidental(1, vf.Accidental({ type: '#' }).setAsCautionary())
        .addModifier(
          2,
          vf
            .StringNumber({ number: '3', position: 'above' })
            .setLastNote(notes1[3])
            .setLineEndType(VF.Renderer.LineEndType.DOWN)
        );

      notes1[2]
        .addModifier(0, vf.StringNumber({ number: '5', position: 'left' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'left' }))
        .addAccidental(1, vf.Accidental({ type: '#' }));

      notes1[3]
        .addModifier(0, vf.StringNumber({ number: '5', position: 'right' }).setOffsetY(7))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }).setOffsetY(6))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6));

      var voice1 = score.voice(notes1);

      vf.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      // bar 2 - juxtaposing second bar next to first bar
      var stave2 = vf
        .Stave({ x: stave1.width + stave1.x, y: stave1.y, width: 300 })
        .setEndBarType(VF.Barline.type.DOUBLE);

      var notes2 = score.notes('(c4 e4 g4)/4, (c5 e5 g5), (c4 f4 g4), (c4 f4 g4)', { stem: 'up' });

      notes2[0]
        .addModifier(0, vf.StringNumber({ number: '5', position: 'right' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'left' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }));

      notes2[1]
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addModifier(0, vf.StringNumber({ number: '5', position: 'below' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'above' }).setLastNote(notes2[3]).setDashed(false));

      notes2[2]
        .addModifier(2, vf.StringNumber({ number: '3', position: 'left' }))
        .addAccidental(1, vf.Accidental({ type: '#' }));

      notes2[3]
        .addModifier(0, vf.StringNumber({ number: '5', position: 'right' }).setOffsetY(7))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }).setOffsetY(6))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6));

      var voice2 = score.voice(notes2);

      vf.Formatter().joinVoices([voice2]).formatToStave([voice2], stave2);

      // bar 3 - juxtaposing third bar next to second bar
      var stave3 = vf.Stave({ x: stave2.width + stave2.x, y: stave2.y, width: 150 }).setEndBarType(VF.Barline.type.END);

      var notesBar3 = score.notes('(c4 e4 g4 a4)/1.');

      notesBar3[0]
        .addModifier(0, vf.StringNumber({ number: '5', position: 'below' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'left' }))
        .addModifier(3, vf.StringNumber({ number: '2', position: 'above' }));

      var voice3 = score.voice(notesBar3, { time: '6/4' });

      vf.Formatter().joinVoices([voice3]).formatToStave([voice3], stave3);

      vf.draw();

      ok(true, 'String Number');
    },

    drawFretHandFingers: function (options) {
      var vf = VF.Test.makeFactory(options, 725, 200);
      var score = vf.EasyScore();

      // bar 1
      var stave1 = vf.Stave({ width: 350 }).setEndBarType(VF.Barline.type.DOUBLE).addClef('treble');

      var notes1 = score.notes('(c4 e4 g4)/4, (c5 e5 g5), (c4 f4 g4), (c4 f4 g4)', { stem: 'down' });

      notes1[0]
        .addModifier(0, vf.Fingering({ number: '3', position: 'left' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'left' }));

      notes1[1]
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addModifier(0, vf.Fingering({ number: '3', position: 'left' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'left' }));

      notes1[2]
        .addModifier(0, vf.Fingering({ number: '3', position: 'below' }))
        .addModifier(1, vf.Fingering({ number: '4', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'left' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'above' }))
        .addAccidental(1, vf.Accidental({ type: '#' }));

      notes1[3]
        .addModifier(0, vf.Fingering({ number: '3', position: 'right' }))
        .addModifier(0, vf.StringNumber({ number: '5', position: 'right' }).setOffsetY(7))
        .addModifier(1, vf.Fingering({ number: '4', position: 'right' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }).setOffsetY(6))
        .addModifier(2, vf.Fingering({ number: '0', position: 'right' }).setOffsetY(-5))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6));

      var voice1 = score.voice(notes1);

      vf.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      // bar 2 - juxtaposing second bar next to first bar
      var stave2 = vf.Stave({ x: stave1.width + stave1.x, y: stave1.y, width: 350 }).setEndBarType(VF.Barline.type.END);

      var notes2 = score.notes('(c4 e4 g4)/4., (c5 e5 g5)/8, (c4 f4 g4)/8, (c4 f4 g4)/4.[stem="down"]', { stem: 'up' });

      notes2[0]
        .addModifier(0, vf.Fingering({ number: '3', position: 'right' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'above' }));

      notes2[1]
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addModifier(0, vf.Fingering({ number: '3', position: 'right' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'left' }));

      notes2[2]
        .addModifier(0, vf.Fingering({ number: '3', position: 'below' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'left' }))
        .addModifier(2, vf.Fingering({ number: '1', position: 'right' }))
        .addAccidental(2, vf.Accidental({ type: '#' }));

      notes2[3]
        .addModifier(0, vf.Fingering({ number: '3', position: 'right' }))
        .addModifier(0, vf.StringNumber({ number: '5', position: 'right' }).setOffsetY(7))
        .addModifier(1, vf.Fingering({ number: '4', position: 'right' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }).setOffsetY(6))
        .addModifier(2, vf.Fingering({ number: '1', position: 'right' }).setOffsetY(-6))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6));

      var voice2 = score.voice(notes2);

      vf.Formatter().joinVoices([voice2]).formatToStave([voice2], stave2);

      vf.draw();

      ok(true, 'String Number');
    },

    multi: function (options) {
      var vf = VF.Test.makeFactory(options, 700, 200);
      var score = vf.EasyScore();
      var stave = vf.Stave();

      var notes1 = score.notes('(c4 e4 g4)/4, (a3 e4 g4), (c4 d4 a4), (c4 d4 a4)', { stem: 'up' });

      notes1[0]
        .addStroke(0, new VF.Stroke(5))
        .addModifier(0, vf.Fingering({ number: '3', position: 'left' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'left' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'above' }));

      notes1[1]
        .addStroke(0, new VF.Stroke(6))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'above' }))
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addAccidental(2, vf.Accidental({ type: '#' }));

      notes1[2]
        .addStroke(0, new VF.Stroke(2))
        .addModifier(0, vf.Fingering({ number: '3', position: 'left' }))
        .addModifier(1, vf.Fingering({ number: '0', position: 'right' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }))
        .addModifier(2, vf.Fingering({ number: '1', position: 'left' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }));

      notes1[3]
        .addStroke(0, new VF.Stroke(1))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }));

      var notes2 = score.notes('e3/8, e3, e3, e3, e3, e3, e3, e3', { stem: 'down' });

      notes2[0]
        .addModifier(0, vf.Fingering({ number: '0', position: 'left' }))
        .addModifier(0, vf.StringNumber({ number: '6', position: 'below' }));

      notes2[2].addAccidental(0, vf.Accidental({ type: '#' }));

      notes2[4].addModifier(0, vf.Fingering({ number: '0', position: 'left' }));

      // Position string number 6 beneath the strum arrow: left (15) and down (18)
      notes2[4].addModifier(0, vf.StringNumber({ number: '6', position: 'left' }).setOffsetX(15).setOffsetY(18));

      var voices = [notes1, notes2].map(score.voice.bind(score));

      vf.Formatter().joinVoices(voices).formatToStave(voices, stave);

      vf.Beam({ notes: notes2.slice(0, 4) });
      vf.Beam({ notes: notes2.slice(4, 8) });

      vf.draw();

      ok(true, 'Strokes Test Multi Voice');
    },

    drawAccidentals: function (options) {
      var vf = VF.Test.makeFactory(options, 500);

      var stave = vf.Stave().setEndBarType(VF.Barline.type.DOUBLE).addClef('treble');

      var notes = [
        vf.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'c/5', 'e/5', 'g/5'], stem_direction: 1, duration: '4' }),
        vf.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'd/5', 'e/5', 'g/5'], stem_direction: 1, duration: '4' }),
        vf.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'd/5', 'e/5', 'g/5'], stem_direction: -1, duration: '4' }),
        vf.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'd/5', 'e/5', 'g/5'], stem_direction: -1, duration: '4' }),
      ];

      notes[0]
        .addModifier(0, vf.Fingering({ number: '3', position: 'left' }))
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '2', position: 'left' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'left' }))
        .addAccidental(2, vf.Accidental({ type: '#' }))
        .addModifier(3, vf.Fingering({ number: '3', position: 'left' }))
        .addAccidental(3, vf.Accidental({ type: '#' }))
        .addModifier(4, vf.Fingering({ number: '2', position: 'right' }))
        .addModifier(4, vf.StringNumber({ number: '3', position: 'right' }))
        .addAccidental(4, vf.Accidental({ type: '#' }))
        .addModifier(5, vf.Fingering({ number: '0', position: 'left' }))
        .addAccidental(5, vf.Accidental({ type: '#' }));

      notes[1]
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addAccidental(2, vf.Accidental({ type: '#' }))
        .addAccidental(3, vf.Accidental({ type: '#' }))
        .addAccidental(4, vf.Accidental({ type: '#' }))
        .addAccidental(5, vf.Accidental({ type: '#' }));

      notes[2]
        .addModifier(0, vf.Fingering({ number: '3', position: 'left' }))
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '2', position: 'left' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'left' }))
        .addAccidental(2, vf.Accidental({ type: '#' }))
        .addModifier(3, vf.Fingering({ number: '3', position: 'left' }))
        .addAccidental(3, vf.Accidental({ type: '#' }))
        .addModifier(4, vf.Fingering({ number: '2', position: 'right' }))
        .addModifier(4, vf.StringNumber({ number: '3', position: 'right' }))
        .addAccidental(4, vf.Accidental({ type: '#' }))
        .addModifier(5, vf.Fingering({ number: '0', position: 'left' }))
        .addAccidental(5, vf.Accidental({ type: '#' }));

      notes[3]
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addAccidental(2, vf.Accidental({ type: '#' }))
        .addAccidental(3, vf.Accidental({ type: '#' }))
        .addAccidental(4, vf.Accidental({ type: '#' }))
        .addAccidental(5, vf.Accidental({ type: '#' }));

      var voice = vf.Voice().addTickables(notes);

      vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true, 'String Number');
    },
  };

  return StringNumber;
})();
