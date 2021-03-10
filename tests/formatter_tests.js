/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Formatter = (function () {
  var run = VF.Test.runTests;
  var runSVG = VF.Test.runSVGTest;

  var Formatter = {
    Start: () => {
      QUnit.module('Formatter');
      test('TickContext Building', Formatter.buildTickContexts);
      runSVG('Justification and alignment with accidentals', Formatter.accidentalJustification);
      runSVG('Vertical alignment - few unaligned beats', Formatter.unalignedNoteDurations);
      runSVG('Vertical alignment - many unaligned beats', Formatter.unalignedNoteDurations2, { globalSoftmax: false });
      runSVG('Vertical alignment - many unaligned beats (global softmax)', Formatter.unalignedNoteDurations2, {
        globalSoftmax: true,
      });
      runSVG('StaveNote - Justification', Formatter.justifyStaveNotes);
      runSVG('Notes with Tab', Formatter.notesWithTab);
      runSVG('Multiple Staves - Justified', Formatter.multiStaves, { justify: true, iterations: 0 });
      runSVG('Softmax', Formatter.softMax);
      runSVG('Mixtime', Formatter.mixTime);
      runSVG('Tight', Formatter.tightNotes);
      runSVG('Tight 2', Formatter.tightNotes2);
      runSVG('Annotations', Formatter.annotations);
      runSVG('Proportional Formatting - No Justification', Formatter.proportionalFormatting, {
        justify: false,
        debug: true,
        iterations: 0,
      });
      run('Proportional Formatting - No Tuning', Formatter.proportionalFormatting, { debug: true, iterations: 0 });

      VF.Test.runSVGTest('Proportional Formatting (20 iterations)', Formatter.proportionalFormatting, {
        debug: true,
        iterations: 20,
        alpha: 0.5,
      });
    },

    buildTickContexts: () => {
      function createTickable() {
        return new VF.Test.MockTickable();
      }

      var R = VF.RESOLUTION;
      var BEAT = (1 * R) / 4;

      var tickables1 = [
        createTickable().setTicks(BEAT).setWidth(10),
        createTickable()
          .setTicks(BEAT * 2)
          .setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30),
      ];

      var tickables2 = [
        createTickable()
          .setTicks(BEAT * 2)
          .setWidth(10),
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
      equal(formatter.getMinTotalWidth(), 88, 'Get minimum total width without passing voices');

      formatter.preFormat();

      equal(formatter.getMinTotalWidth(), 88, 'Minimum total width');
      equal(tickables1[0].getX(), tickables2[0].getX(), 'First notes of both voices have the same X');
      equal(tickables1[2].getX(), tickables2[2].getX(), 'Last notes of both voices have the same X');
      ok(
        tickables1[1].getX() < tickables2[1].getX(),
        'Second note of voice 2 is to the right of the second note of voice 1'
      );
    },

    accidentalJustification: (options) => {
      var vf = VF.Test.makeFactory(options, 600, 300);
      var score = vf.EasyScore();

      var notes11 = score.notes('a4/2, a4/4, a4/8, ab4/16, an4/16');
      var voice11 = score.voice(notes11, { time: '4/4' });

      var notes21 = score.notes('c4/2, d4/8, d4/8, e4/8, e4/8');
      var voice21 = score.voice(notes21, { time: '4/4' });

      var beams = VF.Beam.generateBeams(notes11.slice(2));
      beams = beams.concat(beams, VF.Beam.generateBeams(notes21.slice(1, 3)));
      beams = beams.concat(VF.Beam.generateBeams(notes21.slice(3)));
      var formatter = vf.Formatter({ softmaxFactor: 10 }).joinVoices([voice11]).joinVoices([voice21]);

      var width = formatter.preCalculateMinTotalWidth([voice11, voice21]) + 50;
      var stave11 = vf.Stave({ y: 20, width: width + 30 });
      var stave21 = vf.Stave({ y: 130, width: width + 30 });
      formatter.format([voice11, voice21], width);

      vf.StaveConnector({
        top_stave: stave11,
        bottom_stave: stave21,
        type: 'brace',
      });

      var ctx = vf.getContext();
      stave11.setContext(ctx).draw();
      stave21.setContext(ctx).draw();
      voice11.draw(ctx, stave11);
      voice21.draw(ctx, stave21);
      beams.forEach((b) => {
        b.setContext(ctx).draw();
      });
      ok(true);
    },

    unalignedNoteDurations: (options) => {
      var vf = VF.Test.makeFactory(options, 600, 250);
      var score = vf.EasyScore();

      var notes11 = [
        new VF.StaveNote({ keys: ['a/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['b/4'], duration: '4' }),
        new VF.StaveNote({ keys: ['b/4'], duration: '8' }),
      ];
      var notes21 = [
        new VF.StaveNote({ keys: ['a/4'], duration: '16' }),
        new VF.StaveNote({ keys: ['b/4.'], duration: '4' }),
        new VF.StaveNote({ keys: ['a/4'], duration: '8d' }).addDotToAll(),
      ];

      var ctx = vf.getContext();
      var voice11 = score.voice(notes11, { time: '2/4' }).setMode(VF.Voice.Mode.SOFT);
      var voice21 = score.voice(notes21, { time: '2/4' }).setMode(VF.Voice.Mode.SOFT);
      var beams21 = VF.Beam.generateBeams(notes21);
      var beams11 = VF.Beam.generateBeams(notes11);
      var formatter = new VF.Formatter();
      formatter.joinVoices([voice11]);
      formatter.joinVoices([voice21]);

      var width = formatter.preCalculateMinTotalWidth([voice11, voice21]) + 50;
      var stave11 = vf.Stave({ y: 20, width: width + 20 });
      var stave21 = vf.Stave({ y: 130, width: width + 20 });
      formatter.format([voice11, voice21], width);
      stave11.setContext(ctx).draw();
      stave21.setContext(ctx).draw();
      voice11.draw(ctx, stave11);
      voice21.draw(ctx, stave21);

      beams21.forEach((b) => {
        b.setContext(ctx).draw();
      });
      beams11.forEach((b) => {
        b.setContext(ctx).draw();
      });

      ok(voice11.tickables[1].getX() > voice21.tickables[1].getX());
    },

    unalignedNoteDurations2: (options) => {
      var notes1 = [
        new VF.StaveNote({ keys: ['b/4'], duration: '8r' }),
        new VF.StaveNote({ keys: ['g/4'], duration: '16' }),
        new VF.StaveNote({ keys: ['c/5'], duration: '16' }),
        new VF.StaveNote({ keys: ['e/5'], duration: '16' }),
        new VF.StaveNote({ keys: ['g/4'], duration: '16' }),
        new VF.StaveNote({ keys: ['c/5'], duration: '16' }),
        new VF.StaveNote({ keys: ['e/5'], duration: '16' }),
        new VF.StaveNote({ keys: ['b/4'], duration: '8r' }),
        new VF.StaveNote({ keys: ['g/4'], duration: '16' }),
        new VF.StaveNote({ keys: ['c/5'], duration: '16' }),
        new VF.StaveNote({ keys: ['e/5'], duration: '16' }),
        new VF.StaveNote({ keys: ['g/4'], duration: '16' }),
        new VF.StaveNote({ keys: ['c/5'], duration: '16' }),
        new VF.StaveNote({ keys: ['e/5'], duration: '16' }),
      ];

      var notes2 = [
        new VF.StaveNote({ keys: ['a/4'], duration: '16r' }),
        new VF.StaveNote({ keys: ['e/4.'], duration: '8d' }),
        new VF.StaveNote({ keys: ['e/4'], duration: '4' }),
        new VF.StaveNote({ keys: ['a/4'], duration: '16r' }),
        new VF.StaveNote({ keys: ['e/4.'], duration: '8d' }),
        new VF.StaveNote({ keys: ['e/4'], duration: '4' }),
      ];

      var vf = VF.Test.makeFactory(options, 750, 280);
      const context = vf.getContext();
      var voice1 = new VF.Voice({ num_beats: 4, beat_value: 4 });
      voice1.addTickables(notes1);
      var voice2 = new VF.Voice({ num_beats: 4, beat_value: 4 });
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter({ softmaxFactor: 10, globalSoftmax: options.params.globalSoftmax });
      formatter.joinVoices([voice1]);
      formatter.joinVoices([voice2]);
      var width = formatter.preCalculateMinTotalWidth([voice1, voice2]);

      formatter.format([voice1, voice2], width);
      var stave1 = new VF.Stave(10, 40, width + 50);
      var stave2 = new VF.Stave(10, 100, width + 50);
      stave1.setContext(context).draw();
      stave2.setContext(context).draw();
      voice1.draw(context, stave1);
      voice2.draw(context, stave2);

      ok(voice1.tickables[1].getX() > voice2.tickables[1].getX());
    },

    justifyStaveNotes: (options) => {
      var vf = VF.Test.makeFactory(options, 420, 280);
      var ctx = vf.getContext();
      var score = vf.EasyScore();

      var y = 30;
      function justifyToWidth(width) {
        vf.Stave({ y: y }).addTrebleGlyph();

        var voices = [
          score.voice(score.notes('(cbb4 en4 a4)/2, (d4 e4 f4)/8, (d4 f4 a4)/8, (cn4 f#4 a4)/4', { stem: 'down' })),
          score.voice(score.notes('(bb4 e#5 a5)/4, (d5 e5 f5)/2, (c##5 fb5 a5)/4', { stem: 'up' })),
        ];

        vf.Formatter().joinVoices(voices).format(voices, width);

        voices[0].getTickables().forEach((note) => {
          VF.Test.plotNoteWidth(ctx, note, y + 140);
        });

        voices[1].getTickables().forEach((note) => {
          VF.Test.plotNoteWidth(ctx, note, y - 20);
        });
        y += 210;
      }

      justifyToWidth(500);

      vf.draw();

      ok(true);
    },

    notesWithTab: (options) => {
      var vf = VF.Test.makeFactory(options, 420, 580);
      var score = vf.EasyScore();

      var y = 10;
      function justifyToWidth(width) {
        var stave = vf.Stave({ y: y }).addTrebleGlyph();

        var voice = score.voice(score.notes('d#4/2, (c4 d4)/8, d4/8, (c#4 e4 a4)/4', { stem: 'up' }));

        y += 100;

        vf.TabStave({ y: y }).addTabGlyph().setNoteStartX(stave.getNoteStartX());

        var tabVoice = score.voice([
          vf.TabNote({ positions: [{ str: 3, fret: 6 }], duration: '2' }).addModifier(new VF.Bend('Full'), 0),
          vf
            .TabNote({
              positions: [
                { str: 2, fret: 3 },
                { str: 3, fret: 5 },
              ],
              duration: '8',
            })
            .addModifier(new VF.Bend('Unison'), 1),
          vf.TabNote({ positions: [{ str: 3, fret: 7 }], duration: '8' }),
          vf.TabNote({
            positions: [
              { str: 3, fret: 6 },
              { str: 4, fret: 7 },
              { str: 2, fret: 5 },
            ],
            duration: '4',
          }),
        ]);

        vf.Formatter().joinVoices([voice]).joinVoices([tabVoice]).format([voice, tabVoice], width);

        y += 150;
      }

      justifyToWidth(0);
      justifyToWidth(300);

      vf.draw();

      ok(true);
    },

    multiStaves: (options) => {
      var vf = VF.Test.makeFactory(options, 600, 400);
      var score = vf.EasyScore();

      var stave11 = vf.Stave({ y: 20, width: 275 }).addTrebleGlyph().addTimeSignature('6/8');

      var notes11 = score.notes('f4/4, d4/8, g4/4, eb4/8');
      var voice11 = score.voice(notes11, { time: '6/8' });

      var stave21 = vf.Stave({ y: 130, width: 275 }).addTrebleGlyph().addTimeSignature('6/8');

      var notes21 = score.notes('d4/8, d4, d4, d4, e4, eb4');
      var voice21 = score.voice(notes21, { time: '6/8' });

      var stave31 = vf.Stave({ y: 250, width: 275 }).addClef('bass').addTimeSignature('6/8');

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

      var formatter = vf.Formatter().joinVoices([voice11]).joinVoices([voice21]).joinVoices([voice31]);

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

      formatter = vf.Formatter().joinVoices([voice12]).joinVoices([voice22]).joinVoices([voice32]);

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

    proportionalFormatting: function (options) {
      var debug = options.params.debug;
      VF.Registry.enableDefaultRegistry(new VF.Registry());

      var vf = VF.Test.makeFactory(options, 650, 750);
      var system = vf.System({
        x: 50,
        width: 500,
        debugFormatter: debug,
        noJustification: !(options.params.justify === undefined && true),
        formatIterations: options.params.iterations,
        options: { alpha: options.params.alpha },
      });

      var score = vf.EasyScore();

      var newVoice = function (notes) {
        return score.voice(notes, { time: '1/4' });
      };

      var newStave = function (voice) {
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

    softMax: function (options) {
      var vf = VF.Test.makeFactory(options, 550, 500);
      vf.getContext().scale(0.8, 0.8);

      function draw(y, factor) {
        var score = vf.EasyScore();
        var system = vf.System({
          x: 100,
          y,
          width: 500,
          details: { softmaxFactor: factor },
        });

        system
          .addStave({
            voices: [
              score.voice(
                score
                  .notes('C#5/h, a4/q')
                  .concat(score.beam(score.notes('Abb4/8, A4/8')))
                  .concat(score.beam(score.notes('A4/16, A#4, A4, Ab4/32, A4'))),
                { time: '5/4' }
              ),
            ],
          })
          .addClef('treble')
          .addTimeSignature('5/4');

        vf.draw();
        ok(true);
      }

      draw(50, 1);
      draw(150, 2);
      draw(250, 10);
      draw(350, 20);
      draw(450, 200);
    },

    mixTime: function (options) {
      var vf = VF.Test.makeFactory(options, 420, 250);
      vf.getContext().scale(0.8, 0.8);
      var score = vf.EasyScore();
      var system = vf.System({
        details: { softmaxFactor: 100 },
        width: 500,
        debugFormatter: true,
      });

      system
        .addStave({
          voices: [score.voice(score.notes('C#5/q, B4').concat(score.beam(score.notes('A4/8, E4, C4, D4'))))],
        })
        .addClef('treble')
        .addTimeSignature('4/4');

      system
        .addStave({
          voices: [
            score.voice(score.notes('C#5/q, B4, B4').concat(score.tuplet(score.beam(score.notes('A4/8, E4, C4'))))),
          ],
        })
        .addClef('treble')
        .addTimeSignature('4/4');

      vf.draw();
      ok(true);
    },

    tightNotes: function (options) {
      var vf = VF.Test.makeFactory(options, 420, 250);
      vf.getContext().scale(0.8, 0.8);
      var score = vf.EasyScore();
      var system = vf.System({
        width: 400,
        debugFormatter: true,
        details: { maxIterations: 10 },
      });

      system
        .addStave({
          voices: [
            score.voice(score.beam(score.notes('B4/16, B4, B4, B4, B4, B4, B4, B4')).concat(score.notes('B4/q, B4'))),
          ],
        })
        .addClef('treble')
        .addTimeSignature('4/4');

      system
        .addStave({
          voices: [
            score.voice(score.notes('B4/q, B4').concat(score.beam(score.notes('B4/16, B4, B4, B4, B4, B4, B4, B4')))),
          ],
        })
        .addClef('treble')
        .addTimeSignature('4/4');

      vf.draw();
      ok(true);
    },

    tightNotes2: function (options) {
      var vf = VF.Test.makeFactory(options, 420, 250);
      vf.getContext().scale(0.8, 0.8);
      var score = vf.EasyScore();
      var system = vf.System({
        width: 400,
        debugFormatter: true,
      });

      system
        .addStave({
          voices: [
            score.voice(score.beam(score.notes('B4/16, B4, B4, B4, B4, B4, B4, B4')).concat(score.notes('B4/q, B4'))),
          ],
        })
        .addClef('treble')
        .addTimeSignature('4/4');

      system
        .addStave({
          voices: [score.voice(score.notes('B4/w'))],
        })
        .addClef('treble')
        .addTimeSignature('4/4');

      vf.draw();
      ok(true);
    },

    annotations: function (options) {
      const pageWidth = 816;
      const pageHeight = 600;
      const vf = VF.Test.makeFactory(options, pageWidth, pageHeight);
      const context = vf.getContext();

      var lyrics1 = ['ipso', 'ipso-', 'ipso', 'ipso', 'ipsoz', 'ipso-', 'ipso', 'ipso', 'ipso', 'ip', 'ipso'];
      var lyrics2 = ['ipso', 'ipso-', 'ipsoz', 'ipso', 'ipso', 'ipso-', 'ipso', 'ipso', 'ipso', 'ip', 'ipso'];

      var smar = [
        {
          sm: 5,
          width: 450,
          lyrics: lyrics1,
          title: '450px,softMax:5',
        },
        {
          sm: 10,
          width: 450,
          lyrics: lyrics2,
          title: '450px,softmax:10,different word order',
        },
        {
          sm: 5,
          width: 460,
          lyrics: lyrics2,
          title: '460px,softmax:5',
        },
        {
          sm: 100,
          width: 460,
          lyrics: lyrics2,
          title: '460px,softmax:100',
        },
      ];

      var rowSize = 140;
      var beats = 12;
      var beatsPer = 8;
      var beamGroup = 3;

      var durations = ['8d', '16', '8', '8d', '16', '8', '8d', '16', '8', '4', '8'];
      var beams = [];
      var y = 40;

      smar.forEach((sm) => {
        var stave = new VF.Stave(10, y, sm.width);
        var notes = [];
        var iii = 0;
        context.fillText(sm.title, 100, y);
        y += rowSize;

        durations.forEach((dd) => {
          var newNote = new VF.StaveNote({ keys: ['b/4'], duration: dd });
          if (dd.indexOf('d') >= 0) {
            newNote.addDotToAll();
          }
          if (sm.lyrics.length > iii) {
            newNote.addAnnotation(
              0,
              new VF.Annotation(sm.lyrics[iii])
                .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)
                .setFont('Times', 12, 'normal')
            );
          }
          notes.push(newNote);
          iii += 1;
        });

        notes.forEach((note) => {
          if (note.duration.indexOf('d') >= 0) {
            note.addDotToAll();
          }
        });

        // Don't beam the last group
        var beam = [];
        notes.forEach((note) => {
          if (note.intrinsicTicks < 4096) {
            beam.push(note);
            if (beam.length >= beamGroup) {
              beams.push(new VF.Beam(beam));
              beam = [];
            }
          } else {
            beam = [];
          }
        });

        var voice1 = new VF.Voice({ num_beats: beats, beat_value: beatsPer })
          .setMode(Vex.Flow.Voice.Mode.SOFT)
          .addTickables(notes);

        var fmt = new VF.Formatter({ softmaxFactor: sm.sm, maxIterations: 2 }).joinVoices([voice1]);
        fmt.format([voice1], sm.width - 11);

        stave.setContext(context).draw();
        voice1.draw(context, stave);

        beams.forEach(function (b) {
          b.setContext(context).draw();
        });
      });

      ok(true);
    },
  };

  return Formatter;
})();
