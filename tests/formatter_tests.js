/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Formatter = (function() {
  var run = VF.Test.runTests;

  var Formatter = {
    Start: function() {
      QUnit.module('Formatter');
      test('TickContext Building', Formatter.buildTickContexts);
      run('StaveNote Formatting', Formatter.formatStaveNotes);
      run('StaveNote Justification', Formatter.justifyStaveNotes);
      run('Notes with Tab', Formatter.notesWithTab);
      run('Multiple Staves - No Justification', Formatter.multiStaves, { justify: false, iterations: 0 });
      run('Multiple Staves - Justified', Formatter.multiStaves, { justify: true, iterations: 0 });
      run('Multiple Staves - Justified - 6 Iterations', Formatter.multiStaves, { justify: true, iterations: 6 });
      run('Proportional Formatting - no tuning', Formatter.proportionalFormatting, { debug: false, iterations: 0 });
      run('Proportional Formatting - 15 steps', Formatter.proportionalFormatting, { debug: false, iterations: 15 });

      for (var i = 2; i < 15; i++) {
        VF.Test.runSVGTest(
          'Proportional Formatting (' + i + ' iterations)',
          Formatter.proportionalFormatting,
          { debug: true, iterations: i }
        );
      }
    },

    buildTickContexts: function() {
      function createTickable() {
        return new VF.Test.MockTickable();
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables1 = [
        createTickable().setTicks(BEAT).setWidth(10),
        createTickable().setTicks(BEAT * 2).setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30),
      ];

      var tickables2 = [
        createTickable().setTicks(BEAT * 2).setWidth(10),
        createTickable().setTicks(BEAT).setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30),
      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      voice1.addTickables(tickables1);
      voice2.addTickables(tickables2);

      var formatter = new VF.Formatter();
      var tContexts = formatter.createTickContexts([voice1, voice2]);

      equal(tContexts.list.length, 4, 'Voices should have four tick contexts');

      // TODO: add this after pull request #68 is merged to master
      // throws(
      //   function() { formatter.getMinTotalWidth(); },
      //   Vex.RERR,
      //   "Expected to throw exception"
      // );

      ok(formatter.preCalculateMinTotalWidth([voice1, voice2]), 'Successfully runs preCalculateMinTotalWidth');
      equal(formatter.getMinTotalWidth(), 104, 'Get minimum total width without passing voices');

      formatter.preFormat();

      equal(formatter.getMinTotalWidth(), 104, 'Minimum total width');
      equal(tickables1[0].getX(), tickables2[0].getX(), 'First notes of both voices have the same X');
      equal(tickables1[2].getX(), tickables2[2].getX(), 'Last notes of both voices have the same X');
      ok(tickables1[1].getX() < tickables2[1].getX(), 'Second note of voice 2 is to the right of the second note of voice 1');
    },

    formatStaveNotes: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 250);
      var score = vf.EasyScore();

      vf.Stave({ y: 40 });

      var notes1 = score.notes(
        '(cb4 e#4 a4)/2, (d4 e4 f4)/4, (cn4 f#4 a4)',
        { stem: 'down' }
      );
      var notes2 = score.notes(
        '(cb5 e#5 a5)/2, (d5 e5 f5)/4, (cn5 f#5 a5)',
        { stem: 'up' }
      );

      var voices = [notes1, notes2].map(score.voice.bind(score));

      vf.Formatter()
        .joinVoices(voices)
        .format(voices);

      vf.draw();

      var ctx = vf.getContext();

      notes1.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 180);
      });

      notes2.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 15);
      });

      VF.Test.plotLegendForNoteWidth(ctx, 300, 180);

      ok(true);
    },

    justifyStaveNotes: function(options) {
      var vf = VF.Test.makeFactory(options, 420, 580);
      var ctx = vf.getContext();
      var score = vf.EasyScore();

      var y = 30;
      function justifyToWidth(width) {
        vf.Stave({ y: y }).addTrebleGlyph();

        var voices = [
          score.voice(score.notes(
            '(cbb4 en4 a4)/2, (d4 e4 f4)/8, (d4 f4 a4)/8, (cn4 f#4 a4)/4',
            { stem: 'down' }
          )),
          score.voice(score.notes(
            '(bb4 e#5 a5)/4, (d5 e5 f5)/2, (c##5 fb5 a5)/4',
            { stem: 'up' }
          )),
        ];

        vf.Formatter()
          .joinVoices(voices)
          .format(voices, width);

        voices[0].getTickables().forEach(function(note) {
          VF.Test.plotNoteWidth(ctx, note, y + 140);
        });

        voices[1].getTickables().forEach(function(note) {
          VF.Test.plotNoteWidth(ctx, note, y - 20);
        });
        y += 210;
      }

      justifyToWidth(0);
      justifyToWidth(300);
      justifyToWidth(400);

      vf.draw();

      ok(true);
    },

    notesWithTab: function(options) {
      var vf = VF.Test.makeFactory(options, 420, 580);
      var score = vf.EasyScore();

      var y = 10;
      function justifyToWidth(width) {
        var stave = vf.Stave({ y: y }).addTrebleGlyph();

        var voice = score.voice(score.notes(
          'd#4/2, (c4 d4)/8, d4/8, (c#4 e4 a4)/4',
          { stem: 'up' }
        ));

        y += 100;

        vf.TabStave({ y: y })
          .addTabGlyph()
          .setNoteStartX(stave.getNoteStartX());

        var tabVoice = score.voice([
          vf.TabNote({ positions: [{ str: 3, fret: 6 }], duration: '2' }).addModifier(new VF.Bend('Full'), 0),
          vf.TabNote({
            positions: [{ str: 2, fret: 3 },
              { str: 3, fret: 5 }], duration: '8',
          }).addModifier(new VF.Bend('Unison'), 1),
          vf.TabNote({ positions: [{ str: 3, fret: 7 }], duration: '8' }),
          vf.TabNote({
            positions: [{ str: 3, fret: 6 },
              { str: 4, fret: 7 },
              { str: 2, fret: 5 }], duration: '4',
          }),

        ]);

        vf.Formatter()
          .joinVoices([voice])
          .joinVoices([tabVoice])
          .format([voice, tabVoice], width);

        y += 150;
      }

      justifyToWidth(0);
      justifyToWidth(300);

      vf.draw();

      ok(true);
    },

    multiStaves: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 400);
      var score = vf.EasyScore();

      var stave11 = vf.Stave({ y: 20, width: 275 })
        .addTrebleGlyph()
        .addTimeSignature('6/8');

      var notes11 = score.notes('f4/4, d4/8, g4/4, eb4/8');
      var voice11 = score.voice(notes11, { time: '6/8' });

      var stave21 = vf.Stave({ y: 130, width: 275 })
        .addTrebleGlyph()
        .addTimeSignature('6/8');

      var notes21 = score.notes('d4/8, d4, d4, d4, eb4, eb4');
      var voice21 = score.voice(notes21, { time: '6/8' });

      var stave31 = vf.Stave({ y: 250, width: 275 })
        .addClef('bass')
        .addTimeSignature('6/8');

      var notes31 = score.notes('a5/8, a5, a5, a5, a5, a5', { stem: 'down' });
      var voice31 = score.voice(notes31, { time: '6/8' });

      vf.StaveConnector({
        top_stave: stave21,
        bottom_stave: stave31,
        type: 'brace',
      });

      vf.Beam({ notes: notes21.slice(0, 3) });
      vf.Beam({ notes: notes21.slice(3, 6) });
      vf.Beam({ notes: notes31.slice(0, 3) });
      vf.Beam({ notes: notes31.slice(3, 6) });

      var formatter = vf.Formatter()
        .joinVoices([voice11])
        .joinVoices([voice21])
        .joinVoices([voice31]);

      if (options.params.justify) {
        formatter.formatToStave([voice11, voice21, voice31], stave11);
      } else {
        formatter.format([voice11, voice21, voice31], 0);
      }

      for (var i = 0; i < options.params.iterations; i++) {
        formatter.tune();
      }

      var stave12 = vf.Stave({
        x: stave11.width + stave11.x,
        y: stave11.y,
        width: stave11.width,
      });

      var notes12 = score.notes('ab4/4, bb4/8, (cb5 eb5)/4[stem="down"], d5/8[stem="down"]');
      var voice12 = score.voice(notes12, { time: '6/8' });

      vf.Stave({
        x: stave21.width + stave21.x,
        y: stave21.y,
        width: stave21.width,
      });

      var notes22 = score.notes('(eb4 ab4)/4., (c4 eb4 ab4)/4, db5/8', { stem: 'up' });
      var voice22 = score.voice(notes22, { time: '6/8' });

      vf.Stave({
        x: stave31.width + stave31.x,
        y: stave31.y,
        width: stave31.width,
      });

      var notes32 = score.notes('a5/8, a5, a5, a5, a5, a5', { stem: 'down' });
      var voice32 = score.voice(notes32, { time: '6/8' });

      formatter = vf.Formatter()
        .joinVoices([voice12])
        .joinVoices([voice22])
        .joinVoices([voice32]);

      if (options.params.justify) {
        formatter.formatToStave([voice12, voice22, voice32], stave12);
      } else {
        formatter.format([voice12, voice22, voice32], 0);
      }

      for (var j = 0; j < options.params.iterations; j++) {
        formatter.tune();
      }

      vf.Beam({ notes: notes32.slice(0, 3) });
      vf.Beam({ notes: notes32.slice(3, 6) });

      vf.draw();

      ok(true);
    },

    proportionalFormatting: function(options) {
      var debug = options.params.debug;
      VF.Registry.enableDefaultRegistry(new VF.Registry());

      var vf = VF.Test.makeFactory(options, 600, 750);
      var system = vf.System({
        x: 50,
        width: 500,
        debugFormatter: debug,
        formatIterations: options.params.iterations,
      });

      var score = vf.EasyScore();

      var newVoice = function(notes) {
        return score.voice(notes, { time: '1/4' });
      };

      var newStave = function(voice) {
        return system
          .addStave({ voices: [voice], debugNoteMetrics: debug })
          .addClef('treble')
          .addTimeSignature('1/4');
      };

      var voices = [
        score.notes('c5/8, c5'),
        score.tuplet(score.notes('a4/8, a4, a4'), { notes_occupied: 2 }),
        score.notes('c5/16, c5, c5, c5'),
        score.tuplet(score.notes('a4/16, a4, a4, a4, a4'), { notes_occupied: 4 }),
        score.tuplet(score.notes('a4/32, a4, a4, a4, a4, a4, a4'), { notes_occupied: 8 }),
      ];

      voices.map(newVoice).forEach(newStave);
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();

      // var typeMap = VF.Registry.getDefaultRegistry().index.type;
      // var table = Object.keys(typeMap).map(function(typeName) {
      //   return typeName + ': ' + Object.keys(typeMap[typeName]).length;
      // });

      // console.log(table);
      VF.Registry.disableDefaultRegistry();
      ok(true);
    },

    TIME6_8: {
      num_beats: 6,
      beat_value: 8,
      resolution: VF.RESOLUTION,
    },
  };

  return Formatter;
})();
