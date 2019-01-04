/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

VF.Test.Rests = (function() {
  var Rests = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('Rests');

      run('Rests - Dotted', Rests.basic);
      run('Auto Align Rests - Beamed Notes Stems Up', Rests.beamsUp);
      run('Auto Align Rests - Beamed Notes Stems Down', Rests.beamsDown);
      run('Auto Align Rests - Tuplets Stems Up', Rests.tuplets);
      run('Auto Align Rests - Tuplets Stems Down', Rests.tupletsdown);
      run('Auto Align Rests - Single Voice (Default)', Rests.staveRests);
      run('Auto Align Rests - Single Voice (Align All)', Rests.staveRestsAll);
      run('Auto Align Rests - Multi Voice', Rests.multi);
    },

    setupContext: function(options, contextBuilder, x, y) {
      var ctx = new contextBuilder(options.elementId, x || 350, y || 150);
      ctx.scale(0.9, 0.9);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      ctx.font = ' 10pt Arial';

      var stave = new VF.Stave(10, 30, x || 350)
        .addTrebleGlyph()
        .addTimeSignature('4/4')
        .setContext(ctx)
        .draw();

      return {
        context: ctx,
        stave: stave,
      };
    },

    basic: function(options, contextBuilder) {
      var c = VF.Test.Rests.setupContext(options, contextBuilder, 700);

      var notes = [
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'wr' }).addDotToAll(),
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'hr' }).addDotToAll(),
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }).addDotToAll(),
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }).addDotToAll(),
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '16r' }).addDotToAll(),
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '32r' }).addDotToAll(),
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '64r' }).addDotToAll(),
      ];

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      ok(true, 'Dotted Rest Test');
    },

    beamsUp: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['e/5'], stem_direction: 1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        newNote({ keys: ['b/5'], stem_direction: 1, duration: '8' }),
        newNote({ keys: ['c/5'], stem_direction: 1, duration: '8' }),

        newNote({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: 1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        newNote({ keys: ['c/4'], stem_direction: 1, duration: '8' }),

        newNote({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: 1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        newNote({ keys: ['c/4'], stem_direction: 1, duration: '8' }),

      ];

      var beam1 = new VF.Beam(notes.slice(0, 4));
      var beam2 = new VF.Beam(notes.slice(4, 8));
      var beam3 = new VF.Beam(notes.slice(8, 12));

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();

      ok(true, 'Auto Align Rests - Beams Up Test');
    },

    beamsDown: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['c/5'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['e/4'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['e/4'], stem_direction: -1, duration: '8' }),

      ];

      var beam1 = new VF.Beam(notes.slice(0, 4));
      var beam2 = new VF.Beam(notes.slice(4, 8));
      var beam3 = new VF.Beam(notes.slice(8, 12));

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();

      ok(true, 'Auto Align Rests - Beams Down Test');
    },

    tuplets: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
        newNote({ keys: ['a/5'], stem_direction: 1, duration: '4r' }),

        newNote({ keys: ['a/5'], stem_direction: 1, duration: '4r' }),
        newNote({ keys: ['g/5'], stem_direction: 1, duration: '4r' }),
        newNote({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

        newNote({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
        newNote({ keys: ['g/5'], stem_direction: 1, duration: '4r' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4' }),

        newNote({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
      ];

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3)).setTupletLocation(VF.Tuplet.LOCATION_TOP);
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6)).setTupletLocation(VF.Tuplet.LOCATION_TOP);
      var tuplet3 = new VF.Tuplet(notes.slice(6, 9)).setTupletLocation(VF.Tuplet.LOCATION_TOP);
      var tuplet4 = new VF.Tuplet(notes.slice(9, 12)).setTupletLocation(VF.Tuplet.LOCATION_TOP);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();
      tuplet4.setContext(c.context).draw();

      ok(true, 'Auto Align Rests - Tuplets Stem Up Test');
    },

    tupletsdown: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['g/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/5'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      ];

      var beam1 = new VF.Beam(notes.slice(0, 3));
      var beam2 = new VF.Beam(notes.slice(3, 6));
      var beam3 = new VF.Beam(notes.slice(6, 9));
      var beam4 = new VF.Beam(notes.slice(9, 12));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3))
        .setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6))
        .setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      var tuplet3 = new VF.Tuplet(notes.slice(6, 9))
        .setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      var tuplet4 = new VF.Tuplet(notes.slice(9, 12))
        .setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();
      tuplet4.setContext(c.context).draw();

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();
      beam4.setContext(c.context).draw();

      ok(true, 'Auto Align Rests - Tuplets Stem Down Test');
    },

    staveRests: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        newNote({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
        newNote({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),

        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['e/5'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
        newNote({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

        newNote({ keys: ['d/5'], stem_direction: -1, duration: '4' }),
        newNote({ keys: ['g/5'], stem_direction: -1, duration: '4' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      ];

      var beam1 = new VF.Beam(notes.slice(5, 9));
      var tuplet = new VF.Tuplet(notes.slice(9, 12))
        .setTupletLocation(VF.Tuplet.LOCATION_TOP);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      tuplet.setContext(c.context).draw();
      beam1.setContext(c.context).draw();

      ok(true, 'Auto Align Rests - Default Test');
    },

    staveRestsAll: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        newNote({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
        newNote({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),

        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['e/5'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
        newNote({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

        newNote({ keys: ['d/5'], stem_direction: -1, duration: '4' }),
        newNote({ keys: ['g/5'], stem_direction: -1, duration: '4' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      ];

      var beam1 = new VF.Beam(notes.slice(5, 9));
      var tuplet = new VF.Tuplet(notes.slice(9, 12))
        .setTupletLocation(VF.Tuplet.LOCATION_TOP);

      // Set option to position rests near the notes in the voice
      VF.Formatter.FormatAndDraw(c.context, c.stave, notes, { align_rests: true });

      tuplet.setContext(c.context).draw();
      beam1.setContext(c.context).draw();

      ok(true, 'Auto Align Rests - Align All Test');
    },

    multi: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 200);

      var stave = new VF.Stave(50, 10, 500)
        .addClef('treble')
        .setContext(ctx)
        .addTimeSignature('4/4')
        .draw();

      function newNote(note_struct) {
        return new VF.StaveNote(note_struct).setStave(stave);
      }

      var notes1 = [
        newNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '4' }),
        newNote({ keys: ['b/4'], duration: '4r' }),
        newNote({ keys: ['c/4', 'd/4', 'a/4'], duration: '4' }),
        newNote({ keys: ['b/4'], duration: '4r' }),
      ];

      var notes2 = [
        newNote({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes1);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).addTickables(notes2);

      // Set option to position rests near the notes in each voice
      new VF.Formatter()
        .joinVoices([voice, voice2])
        .formatToStave([voice, voice2], stave, { align_rests: true });

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice2.draw(ctx);
      voice.draw(ctx);
      beam2_1.setContext(ctx).draw();
      beam2_2.setContext(ctx).draw();

      ok(true, 'Strokes Test Multi Voice');
    },
  };

  return Rests;
})();
