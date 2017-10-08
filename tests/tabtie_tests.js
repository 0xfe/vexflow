/**
 * VexFlow - TabTie Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabTie = (function() {
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

    tieNotes: function(notes, indices, stave, ctx, text) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      new VF.Formatter().joinVoices([voice]).format([voice], 100);
      voice.draw(ctx, stave);

      var tie = new VF.TabTie({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: indices,
        last_indices: indices,
      }, text || 'Annotation');

      tie.setContext(ctx);
      tie.draw();
    },

    setupContext: function(options, x, y) {
      var ctx = options.contextBuilder(options.elementId, x || 350, y || 160);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      ctx.setFont('Arial', VF.Test.Font.size, '');

      var stave = new VF.TabStave(10, 10, x || 350)
        .addTabGlyph()
        .setContext(ctx)
        .draw();

      return { context: ctx, stave: stave };
    },

    drawTie: function(notes, indices, options, text) {
      var c = VF.Test.TabTie.setupContext(options);
      VF.Test.TabTie.tieNotes(notes, indices, c.stave, c.context, text);
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      VF.Test.TabTie.drawTie([
        newNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' }),
        newNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
      ], [0], options);

      ok(true, 'Simple Test');
    },

    tap: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      VF.Test.TabTie.drawTie([
        newNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' })
          .addModifier(new VF.Annotation('T'), 0),
        newNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' }),
      ], [0], options, 'P');

      ok(true, 'Tapping Test');
    },

    multiTest: function(options, factory) {
      var c = VF.Test.TabTie.setupContext(options, 440, 140);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

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

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes);
      new VF.Formatter().joinVoices([voice]).format([voice], 300);
      voice.draw(c.context, c.stave);

      factory({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, 'Single note');

      factory({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, 'Chord');

      factory({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, 'Single note high-fret');

      factory({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

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
      var c = VF.Test.TabTie.setupContext(options, 440, 140);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var notes = [
        newNote({ positions: [{ str: 4, fret: 4 }], duration: 'q' }),
        newNote({ positions: [{ str: 4, fret: 5 }], duration: 'q' }),
        newNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes);
      new VF.Formatter().joinVoices([voice]).format([voice], 300);
      voice.draw(c.context, c.stave);

      VF.TabTie.createHammeron({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      VF.TabTie.createPulloff({
        first_note: notes[1],
        last_note: notes[2],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();
      ok(true, 'Continuous Hammeron');
    },
  };

  return TabTie;
}());
