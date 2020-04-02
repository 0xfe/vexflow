/**
 * VexFlow - NoteHead Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.NoteHead = (function() {
  var NoteHead = {
    Start: function() {
      QUnit.module('NoteHead');
      VF.Test.runTests('Basic', VF.Test.NoteHead.basic);
      VF.Test.runTests('Various Heads', VF.Test.NoteHead.variousHeads);
      VF.Test.runTests('Drum Chord Heads', VF.Test.NoteHead.drumChordHeads);
      VF.Test.runTests('Bounding Boxes', VF.Test.NoteHead.basicBoundingBoxes);
    },

    setupContext: function(options, x, y) {
      var ctx = new options.contextBuilder(options.elementId, x || 450, y || 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.font = ' 10pt Arial';
      var stave = new VF.Stave(10, 10, x || 450).addTrebleGlyph();

      return { context: ctx, stave: stave };
    },

    showNote: function(note_struct, stave, ctx, x) {
      var note = new VF.StaveNote(note_struct).setStave(stave);

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(x);

      note.setContext(ctx).draw();

      return note;
    },

    basic: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.NoteHead.setupContext(options, 450, 250);

      c.stave = new VF.Stave(10, 0, 250).addTrebleGlyph();

      c.context.scale(2.0, 2.0);
      c.stave.setContext(c.context).draw();

      var formatter = new VF.Formatter();
      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);

      var note_head1 = new VF.NoteHead({
        duration: '4',
        line: 3,
      });

      var note_head2 = new VF.NoteHead({
        duration: '1',
        line: 2.5,
      });

      var note_head3 = new VF.NoteHead({
        duration: '2',
        line: 0,
      });

      voice.addTickables([note_head1, note_head2, note_head3]);
      formatter.joinVoices([voice]).formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      ok('Basic NoteHead test');
    },

    variousHeads: function(options, contextBuilder) {
      var notes = [
        { keys: ['g/5/d0'], duration: '4' },
        { keys: ['g/5/d1'], duration: '4' },
        { keys: ['g/5/d2'], duration: '4' },
        { keys: ['g/5/d3'], duration: '4' },
        { keys: ['x/'], duration: '1' },

        { keys: ['g/5/t0'], duration: '1' },
        { keys: ['g/5/t1'], duration: '4' },
        { keys: ['g/5/t2'], duration: '4' },
        { keys: ['g/5/t3'], duration: '4' },
        { keys: ['x/'], duration: '1' },

        { keys: ['g/5/x0'], duration: '1' },
        { keys: ['g/5/x1'], duration: '4' },
        { keys: ['g/5/x2'], duration: '4' },
        { keys: ['g/5/x3'], duration: '4' },
        { keys: ['x/'], duration: '1' },

        { keys: ['g/5/s1'], duration: '4' },
        { keys: ['g/5/s2'], duration: '4' },
        { keys: ['x/'], duration: '1' },

        { keys: ['g/5/r1'], duration: '4' },
        { keys: ['g/5/r2'], duration: '4' },
      ];

      var ctx = new contextBuilder(options.elementId, notes.length * 25 + 100, 240);

      // Draw two staves, one with up-stems and one with down-stems.
      for (var h = 0; h < 2; ++h) {
        var stave = new VF.Stave(10, 10 + h * 120, notes.length * 25 + 75)
          .addClef('percussion')
          .setContext(ctx)
          .draw();

        for (var i = 0; i < notes.length; ++i) {
          var note = notes[i];
          note.stem_direction = (h === 0 ? -1 : 1);
          var staveNote = NoteHead.showNote(note, stave, ctx, (i + 1) * 25);

          ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
          ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
        }
      }
    },

    drumChordHeads: function(options, contextBuilder) {
      var notes = [
        { keys: ['a/4/d0', 'g/5/x3'], duration: '4' },
        { keys: ['a/4/x3', 'g/5/d0'], duration: '4' },
        { keys: ['a/4/d1', 'g/5/x2'], duration: '4' },
        { keys: ['a/4/x2', 'g/5/d1'], duration: '4' },
        { keys: ['a/4/d2', 'g/5/x1'], duration: '4' },
        { keys: ['a/4/x1', 'g/5/d2'], duration: '4' },
        { keys: ['a/4/d3', 'g/5/x0'], duration: '4' },
        { keys: ['a/4/x0', 'g/5/d3'], duration: '4' },

        { keys: ['a/4', 'g/5/d0'], duration: '4' },
        { keys: ['a/4/x3', 'g/5'], duration: '4' },

        { keys: ['a/4/t0', 'g/5/s1'], duration: '4' },
        { keys: ['a/4/s1', 'g/5/t0'], duration: '4' },
        { keys: ['a/4/t1', 'g/5/s2'], duration: '4' },
        { keys: ['a/4/s2', 'g/5/t1'], duration: '4' },
        { keys: ['a/4/t2', 'g/5/r1'], duration: '4' },
        { keys: ['a/4/r1', 'g/5/t2'], duration: '4' },
        { keys: ['a/4/t3', 'g/5/r2'], duration: '4' },
        { keys: ['a/4/r2', 'g/5/t3'], duration: '4' },
      ];

      var ctx = new contextBuilder(options.elementId, notes.length * 25 + 100, 240);

      // Draw two staves, one with up-stems and one with down-stems.
      for (var h = 0; h < 2; ++h) {
        var stave = new VF.Stave(10, 10 + h * 120, notes.length * 25 + 75)
          .addClef('percussion')
          .setContext(ctx)
          .draw();

        for (var i = 0; i < notes.length; ++i) {
          var note = notes[i];
          note.stem_direction = (h === 0 ? -1 : 1);
          var staveNote = NoteHead.showNote(note, stave, ctx, (i + 1) * 25);

          ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
          ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
        }
      }
    },

    basicBoundingBoxes: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.NoteHead.setupContext(options, 350, 250);

      c.stave = new VF.Stave(10, 0, 250).addTrebleGlyph();

      c.context.scale(2.0, 2.0);
      c.stave.setContext(c.context).draw();

      var formatter = new VF.Formatter();
      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);

      var note_head1 = new VF.NoteHead({
        duration: '4',
        line: 3,
      });

      var note_head2 = new VF.NoteHead({
        duration: '2',
        line: 2.5,
      });

      var note_head3 = new VF.NoteHead({
        duration: '1',
        line: 0,
      });

      voice.addTickables([note_head1, note_head2, note_head3]);
      formatter.joinVoices([voice]).formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      note_head1.getBoundingBox().draw(c.context);
      note_head2.getBoundingBox().draw(c.context);
      note_head3.getBoundingBox().draw(c.context);

      ok('NoteHead Bounding Boxes');
    },
  };

  return NoteHead;
})();
