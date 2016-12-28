/**
 * VexFlow - GraceTabNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.GraceTabNote = (function() {
  var GraceTabNote = {
    Start: function() {
      QUnit.module('Grace Tab Notes');
      VF.Test.runTests('Grace Tab Note Simple', VF.Test.GraceTabNote.simple);
      VF.Test.runTests('Grace Tab Note Slurred', VF.Test.GraceTabNote.slurred);
    },

    setupContext: function(options, x) {
      var ctx = options.contextBuilder(options.elementId, 350, 140);
      var stave = new VF.TabStave(10, 10, x || 350)
        .addTabGlyph()
        .setContext(ctx)
        .draw();

      return { context: ctx, stave: stave };
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.GraceTabNote.setupContext(options);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var note0 = newNote({ positions: [{ str: 4, fret: 6 }], duration: '4' });
      var note1 = newNote({ positions: [{ str: 4, fret: 12 }], duration: '4' });
      var note2 = newNote({ positions: [{ str: 4, fret: 10 }], duration: '4' });
      var note3 = newNote({ positions: [{ str: 4, fret: 10 }], duration: '4' });

      var gracenote_group0 = [
        { positions: [{ str: 4, fret: 'x' }], duration: '8' },
      ];

      var gracenote_group1 = [
        { positions: [{ str: 4, fret: 9 }], duration: '16' },
        { positions: [{ str: 4, fret: 10 }], duration: '16' },
      ];

      var gracenote_group2 = [
        { positions: [{ str: 4, fret: 9 }], duration: '8' },
      ];
      var gracenote_group3 = [
        { positions: [{ str: 5, fret: 10 }], duration: '8' },
        { positions: [{ str: 4, fret: 9 }], duration: '8' },
      ];

      function createNote(note_prop) {
        return new VF.GraceTabNote(note_prop);
      }

      var gracenotes0 = gracenote_group0.map(createNote);
      var gracenotes1 = gracenote_group1.map(createNote);
      var gracenotes2 = gracenote_group2.map(createNote);
      gracenotes2[0].setGhost(true);
      var gracenotes3 = gracenote_group3.map(createNote);

      note0.addModifier(new VF.GraceNoteGroup(gracenotes0));
      note1.addModifier(new VF.GraceNoteGroup(gracenotes1));
      note2.addModifier(new VF.GraceNoteGroup(gracenotes2));
      note3.addModifier(new VF.GraceNoteGroup(gracenotes3));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables([note0, note1, note2, note3]);

      new VF.Formatter().joinVoices([voice]).format([voice], 250);

      voice.draw(c.context, c.stave);

      ok(true, 'Simple Test');
    },

    slurred: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.GraceTabNote.setupContext(options);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var note0 = newNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' });
      var note1 = newNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' });

      var gracenote_group0 = [
        { positions: [{ str: 4, fret: 9 }], duration: '8' },
        { positions: [{ str: 4, fret: 10 }], duration: '8' },
      ];

      var gracenote_group1 = [
        { positions: [{ str: 4, fret: 7 }], duration: '16' },
        { positions: [{ str: 4, fret: 8 }], duration: '16' },
        { positions: [{ str: 4, fret: 9 }], duration: '16' },
      ];

      function createNote(note_prop) {
        return new VF.GraceTabNote(note_prop);
      }

      var gracenotes0 = gracenote_group0.map(createNote);
      var gracenotes1 = gracenote_group1.map(createNote);

      note0.addModifier(new VF.GraceNoteGroup(gracenotes0, true));
      note1.addModifier(new VF.GraceNoteGroup(gracenotes1, true));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables([note0, note1]);

      new VF.Formatter().joinVoices([voice]).format([voice], 200);

      voice.draw(c.context, c.stave);

      ok(true, 'Slurred Test');
    },
  };

  return GraceTabNote;
})();
