/**
 * VexFlow - TabSlide Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabSlide = (function() {
  function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

  function createMultiTest(createTabSlide) {
    return function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabSlide.multiTest(options, createTabSlide);
    };
  }

  function setupContext(options) {
    var ctx = options.contextBuilder(options.elementId, 350, 140);
    ctx.scale(0.9, 0.9);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.font = '10pt Arial';
    var stave = new VF.TabStave(10, 10, 350).addClef('tab');

    return { context: ctx, stave: stave };
  }

  var TabSlide = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('TabSlide');

      run('Simple TabSlide', TabSlide.simple);
      run('Slide Up', createMultiTest(VF.TabSlide.createSlideUp));
      run('Slide Down', createMultiTest(VF.TabSlide.createSlideDown));
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = setupContext(options);
      var ctx = c.context;
      var stave = c.stave;

      var notes = [
        newNote({ positions: [{ str: 4, fret: 4 }], duration: '2' }),
        newNote({ positions: [{ str: 4, fret: 6 }], duration: '2' }),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .addTickables(notes)
        .updateStave(stave);

      var tie = new VF.TabSlide({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }, VF.TabSlide.SLIDE_UP);

      new VF.Formatter()
        .joinVoices([voice])
        .format([voice], stave.width / 4);

      stave.setContext(ctx).draw();
      voice.draw(ctx);
      tie.setContext(ctx).draw();

      ok(true, 'Simple Test');
    },

    multiTest: function(options, factory) {
      var c = setupContext(options);
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

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .addTickables(notes)
        .updateStave(stave);

      var tabSlides = [
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

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      stave.setContext(ctx).draw();
      voice.draw(ctx);
      tabSlides.forEach(function(tabSlide) {
        tabSlide.setContext(ctx).draw();
      });

      ok(true);
    },
  };

  return TabSlide;
}());
