/**
 * VexFlow - Accidental Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Bend = (function () {
  var Bend = {
    Start: function () {
      QUnit.module('Bend');
      VF.Test.runTests('Double Bends', VF.Test.Bend.doubleBends);
      VF.Test.runTests('Reverse Bends', VF.Test.Bend.reverseBends);
      VF.Test.runTests('Bend Phrase', VF.Test.Bend.bendPhrase);
      VF.Test.runTests('Double Bends With Release', VF.Test.Bend.doubleBendsWithRelease);
      VF.Test.runTests('Whako Bend', VF.Test.Bend.whackoBends);
    },

    doubleBends: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      ctx.setRawFont(' 10pt Arial');
      var stave = new VF.TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) {
        return new VF.TabNote(tab_struct);
      }
      function newBend(text) {
        return new VF.Bend(text);
      }

      var notes = [
        newNote({
          positions: [
            { str: 2, fret: 10 },
            { str: 4, fret: 9 },
          ],
          duration: 'q',
        })
          .addModifier(newBend('Full'), 0)
          .addModifier(newBend('1/2'), 1),

        newNote({
          positions: [
            { str: 2, fret: 5 },
            { str: 3, fret: 5 },
          ],
          duration: 'q',
        })
          .addModifier(newBend('1/4'), 0)
          .addModifier(newBend('1/4'), 1),

        newNote({
          positions: [{ str: 4, fret: 7 }],
          duration: 'h',
        }),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      notes.forEach(function (note) {
        VF.Test.plotNoteWidth(ctx, note, 140);
      });

      ok(true, 'Double Bends');
    },

    doubleBendsWithRelease: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 550, 240);
      ctx.scale(1.0, 1.0);
      ctx.setBackgroundFillStyle('#FFF');
      ctx.setFont('Arial', VF.Test.Font.size);
      var stave = new VF.TabStave(10, 10, 550).addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) {
        return new VF.TabNote(tab_struct);
      }
      function newBend(text, release) {
        return new VF.Bend(text, release);
      }

      var notes = [
        newNote({
          positions: [
            { str: 1, fret: 10 },
            { str: 4, fret: 9 },
          ],
          duration: 'q',
        })
          .addModifier(newBend('1/2', true), 0)
          .addModifier(newBend('Full', true), 1),

        newNote({
          positions: [
            { str: 2, fret: 5 },
            { str: 3, fret: 5 },
            { str: 4, fret: 5 },
          ],
          duration: 'q',
        })
          .addModifier(newBend('1/4', true), 0)
          .addModifier(newBend('Monstrous', true), 1)
          .addModifier(newBend('1/4', true), 2),

        newNote({
          positions: [{ str: 4, fret: 7 }],
          duration: 'q',
        }),
        newNote({
          positions: [{ str: 4, fret: 7 }],
          duration: 'q',
        }),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      notes.forEach(function (note) {
        VF.Test.plotNoteWidth(ctx, note, 140);
      });
      ok(true, 'Bend Release');
    },

    reverseBends: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);

      ctx.scale(1.5, 1.5);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      ctx.setRawFont('10pt Arial');
      var stave = new VF.TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) {
        return new VF.TabNote(tab_struct);
      }
      function newBend(text) {
        return new VF.Bend(text);
      }

      var notes = [
        newNote({
          positions: [
            { str: 2, fret: 10 },
            { str: 4, fret: 9 },
          ],
          duration: 'w',
        })
          .addModifier(newBend('Full'), 1)
          .addModifier(newBend('1/2'), 0),

        newNote({
          positions: [
            { str: 2, fret: 5 },
            { str: 3, fret: 5 },
          ],
          duration: 'w',
        })
          .addModifier(newBend('1/4'), 1)
          .addModifier(newBend('1/4'), 0),

        newNote({
          positions: [{ str: 4, fret: 7 }],
          duration: 'w',
        }),
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var mc = new VF.ModifierContext();
        note.addToModifierContext(mc);

        var tickContext = new VF.TickContext();
        tickContext
          .addTickable(note)
          .preFormat()
          .setX(75 * i);

        note.setStave(stave).setContext(ctx).draw();
        VF.Test.plotNoteWidth(ctx, note, 140);
        ok(true, 'Bend ' + i);
      }
    },

    bendPhrase: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      ctx.setRawFont(' 10pt Arial');
      var stave = new VF.TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) {
        return new VF.TabNote(tab_struct);
      }
      function newBend(phrase) {
        return new VF.Bend(null, null, phrase);
      }

      var phrase1 = [
        { type: VF.Bend.UP, text: 'Full' },
        { type: VF.Bend.DOWN, text: 'Monstrous' },
        { type: VF.Bend.UP, text: '1/2' },
        { type: VF.Bend.DOWN, text: '' },
      ];
      var bend1 = newBend(phrase1).setContext(ctx);

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 10 }],
          duration: 'w',
        }).addModifier(bend1, 0),
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var mc = new VF.ModifierContext();
        note.addToModifierContext(mc);

        var tickContext = new VF.TickContext();
        tickContext
          .addTickable(note)
          .preFormat()
          .setX(75 * i);

        note.setStave(stave).setContext(ctx).draw();
        VF.Test.plotNoteWidth(ctx, note, 140);
        ok(true, 'Bend ' + i);
      }
    },

    whackoBends: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 400, 240);
      ctx.scale(1.0, 1.0);
      ctx.setBackgroundFillStyle('#FFF');
      ctx.setFont('Arial', VF.Test.Font.size);
      var stave = new VF.TabStave(10, 10, 350).addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) {
        return new VF.TabNote(tab_struct);
      }
      function newBend(phrase) {
        return new VF.Bend(null, null, phrase);
      }

      var phrase1 = [
        { type: VF.Bend.UP, text: 'Full' },
        { type: VF.Bend.DOWN, text: '' },
        { type: VF.Bend.UP, text: '1/2' },
        { type: VF.Bend.DOWN, text: '' },
      ];

      var phrase2 = [
        { type: VF.Bend.UP, text: 'Full' },
        { type: VF.Bend.UP, text: 'Full' },
        { type: VF.Bend.UP, text: '1/2' },
        { type: VF.Bend.DOWN, text: '' },
        { type: VF.Bend.DOWN, text: 'Full' },
        { type: VF.Bend.DOWN, text: 'Full' },
        { type: VF.Bend.UP, text: '1/2' },
        { type: VF.Bend.DOWN, text: '' },
      ];

      var notes = [
        newNote({
          positions: [
            { str: 2, fret: 10 },
            { str: 3, fret: 9 },
          ],
          duration: 'q',
        })
          .addModifier(newBend(phrase1), 0)
          .addModifier(newBend(phrase2), 1),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      VF.Test.plotNoteWidth(ctx, notes[0], 140);
      ok(true, 'Whako Release');
    },
  };

  return Bend;
})();
