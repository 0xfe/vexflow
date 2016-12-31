/**
 * VexFlow - TabTie Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabTie = (function() {
  function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

  function setupContext(options, width, height) {
    var ctx = options.contextBuilder(options.elementId, width || 350, height || 160);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.setFont('Arial', VF.Test.Font.size, '');

    var stave = new VF.TabStave(10, 10, (width || 350) - 20)
      .addTabGlyph()
      .setContext(ctx)
      .draw();

    return { context: ctx, stave: stave };
  }

  function tieNotes(notes, indices, stave, ctx, text) {
    var voice = new VF.Voice(VF.Test.TIME4_4)
      .addTickables(notes)
      .updateStave(stave);

    var tie = new VF.TabTie({
      first_note: notes[0],
      last_note: notes[1],
      first_indices: indices,
      last_indices: indices,
    }, text || 'Annotation');

    new VF.Formatter()
      .joinVoices([voice])
      .format([voice], 100);

    voice.draw(ctx);
    tie.setContext(ctx).draw();
  }

  function drawTie(notes, indices, options, text) {
    var c = setupContext(options);
    tieNotes(notes, indices, c.stave, c.context, text);
  }

  var TabTie = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('TabTie');

      run('Simple TabTie', TabTie.simple);
      run('Hammerons', TabTie.simpleHammeron);
      run('Pulloffs', TabTie.simplePulloff);
      run('Tapping', TabTie.tap);
      run('Continuous', TabTie.continuous);
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      drawTie([
        newNote({ positions: [{ str: 4, fret: 4 }], duration: '2' }),
        newNote({ positions: [{ str: 4, fret: 6 }], duration: '2' }),
      ], [0], options);

      ok(true, 'Simple Test');
    },

    tap: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      drawTie([
        newNote({ positions: [{ str: 4, fret: 12 }], duration: '2' })
          .addModifier(new VF.Annotation('T'), 0),
        newNote({ positions: [{ str: 4, fret: 10 }], duration: '2' }),
      ], [0], options, 'P');

      ok(true, 'Tapping Test');
    },

    multiTest: function(options, factory) {
      var c = setupContext(options, 440, 140);
      var ctx = c.context;
      var stave = c.stave;

      var notes = [
        newNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
        newNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
        newNote({ positions: [{ str: 4, fret: 4 }, { str: 5, fret: 4 }], duration: '8' }),
        newNote({ positions: [{ str: 4, fret: 6 }, { str: 5, fret: 6 }], duration: '8' }),
        newNote({ positions: [{ str: 2, fret: 14 }], duration: '8' }),
        newNote({ positions: [{ str: 2, fret: 16 }], duration: '8' }),
        newNote({ positions: [{ str: 2, fret: 14 }, { str: 3, fret: 14 }], duration: '8' }),
        newNote({ positions: [{ str: 2, fret: 16 }, { str: 3, fret: 16 }], duration: '8' }),
      ];

      var tabTies = [
        factory({
          first_note: notes[0],
          last_note: notes[1],
          first_indices: [0],
          last_indices: [0],
        }),
        factory({
          first_note: notes[2],
          last_note: notes[3],
          first_indices: [0, 1],
          last_indices: [0, 1],
        }),
        factory({
          first_note: notes[4],
          last_note: notes[5],
          first_indices: [0],
          last_indices: [0],
        }),
        factory({
          first_note: notes[6],
          last_note: notes[7],
          first_indices: [0, 1],
          last_indices: [0, 1],
        }),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .addTickables(notes)
        .updateStave(stave);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      voice.draw(ctx);
      tabTies.forEach(function(tabTie) {
        tabTie.setContext(ctx).draw();
      });

      ok(true, 'Chord high-fret');
    },

    simpleHammeron: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabTie.multiTest(options, VF.TabTie.createHammeron);
    },

    simplePulloff: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabTie.multiTest(options, VF.TabTie.createPulloff);
    },

    continuous: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = setupContext(options, 440, 140);
      var ctx = c.context;
      var stave = c.stave;

      var notes = [
        newNote({ positions: [{ str: 4, fret: 4 }], duration: '4' }),
        newNote({ positions: [{ str: 4, fret: 5 }], duration: '4' }),
        newNote({ positions: [{ str: 4, fret: 6 }], duration: '2' }),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .addTickables(notes)
        .updateStave(stave);

      new VF.Formatter()
        .joinVoices([voice])
        .format([voice], 300);

      voice.draw(ctx);

      VF.TabTie.createHammeron({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }).setContext(ctx).draw();

      VF.TabTie.createPulloff({
        first_note: notes[1],
        last_note: notes[2],
        first_indices: [0],
        last_indices: [0],
      }).setContext(ctx).draw();
      ok(true, 'Continuous Hammeron');
    },
  };

  return TabTie;
}());
