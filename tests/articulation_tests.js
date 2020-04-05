/**
 * VexFlow - Articulation Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.Articulation = (function() {
  var Articulation = {
    Start: function() {
      QUnit.module('Articulation');
      Articulation.runTests('Articulation - Staccato/Staccatissimo', 'a.', 'av', Articulation.drawArticulations);
      Articulation.runTests('Articulation - Accent/Tenuto', 'a>', 'a-', Articulation.drawArticulations);
      Articulation.runTests('Articulation - Marcato/L.H. Pizzicato', 'a^', 'a+', Articulation.drawArticulations);
      Articulation.runTests('Articulation - Snap Pizzicato/Fermata', 'ao', 'ao', Articulation.drawArticulations);
      Articulation.runTests('Articulation - Up-stroke/Down-Stroke', 'a|', 'am', Articulation.drawArticulations);
      Articulation.runTests('Articulation - Fermata Above/Below', 'a@a', 'a@u', Articulation.drawFermata);
      Articulation.runTests('Articulation - Inline/Multiple', 'a.', 'a.', Articulation.drawArticulations2);
      Articulation.runTests('TabNote Articulation', 'a.', 'a.', Articulation.tabNotes);
    },

    runTests: function(name, sym1, sym2, func) {
      var params = {
        sym1: sym1,
        sym2: sym2,
      };

      VF.Test.runTests(name, func, params);
    },

    drawArticulations: function(options, contextBuilder) {
      var sym1 = options.params.sym1;
      var sym2 = options.params.sym2;

      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 625, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 125);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['a/3'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
      ];
      notesBar1[0].addArticulation(0, new VF.Articulation(sym1).setPosition(4));
      notesBar1[1].addArticulation(0, new VF.Articulation(sym1).setPosition(4));
      notesBar1[2].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar1[3].addArticulation(0, new VF.Articulation(sym1).setPosition(3));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 125);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
      ];
      notesBar2[0].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[1].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[2].addArticulation(0, new VF.Articulation(sym1).setPosition(4));
      notesBar2[3].addArticulation(0, new VF.Articulation(sym1).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      // bar 3 - juxtaposing second bar next to first bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x, staveBar2.y, 125);
      staveBar3.setContext(ctx).draw();

      var notesBar3 = [
        new VF.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
      ];
      notesBar3[0].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar3[1].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar3[2].addArticulation(0, new VF.Articulation(sym2).setPosition(3));
      notesBar3[3].addArticulation(0, new VF.Articulation(sym2).setPosition(3));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);
      // bar 4 - juxtaposing second bar next to first bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x, staveBar3.y, 125);
      staveBar4.setEndBarType(VF.Barline.type.END);
      staveBar4.setContext(ctx).draw();

      var notesBar4 = [
        new VF.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
      ];
      notesBar4[0].addArticulation(0, new VF.Articulation(sym2).setPosition(3));
      notesBar4[1].addArticulation(0, new VF.Articulation(sym2).setPosition(3));
      notesBar4[2].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar4[3].addArticulation(0, new VF.Articulation(sym2).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
    },

    drawFermata: function(options, contextBuilder) {
      var sym1 = options.params.sym1;
      var sym2 = options.params.sym2;

      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 400, 200);

      // bar 1
      var staveBar1 = new VF.Stave(50, 30, 150);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: -1 }),
      ];
      notesBar1[0].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar1[1].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar1[2].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar1[3].addArticulation(0, new VF.Articulation(sym2).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 150);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
      ];
      notesBar2[0].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[1].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[2].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar2[3].addArticulation(0, new VF.Articulation(sym2).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
    },

    drawArticulations2: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 1000, 200);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 350);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['c/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['d/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['e/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['g/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['b/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['d/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['e/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['f/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['g/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['b/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['c/6'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['d/6'], duration: '16', stem_direction: -1 }),
      ];
      var i;
      for (i = 0; i < 16; i++) {
        notesBar1[i].addArticulation(0, new VF.Articulation('a.').setPosition(4));
        notesBar1[i].addArticulation(0, new VF.Articulation('a>').setPosition(4));

        if (i === 15) {
          notesBar1[i].addArticulation(0, new VF.Articulation('a@u').setPosition(4));
        }
      }

      var beam1 = new VF.Beam(notesBar1.slice(0, 8));
      var beam2 = new VF.Beam(notesBar1.slice(8, 16));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 350);
      staveBar2.setContext(ctx).draw();
      var notesBar2 = [
        new VF.StaveNote({ keys: ['f/3'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['g/3'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/3'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['b/3'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['d/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['e/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['g/4'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['b/4'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['d/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['e/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['f/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['g/5'], duration: '16', stem_direction: -1 }),
      ];
      for (i = 0; i < 16; i++) {
        notesBar2[i].addArticulation(0, new VF.Articulation('a-').setPosition(3));
        notesBar2[i].addArticulation(0, new VF.Articulation('a^').setPosition(3));

        if (i === 15) {
          notesBar2[i].addArticulation(0, new VF.Articulation('a@u').setPosition(4));
        }
      }

      var beam3 = new VF.Beam(notesBar2.slice(0, 8));
      var beam4 = new VF.Beam(notesBar2.slice(8, 16));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
      beam3.setContext(ctx).draw();
      beam4.setContext(ctx).draw();

      // bar 3 - juxtaposing second bar next to first bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x, staveBar2.y, 75);
      staveBar3.setContext(ctx).draw();

      var notesBar3 = [
        new VF.StaveNote({ keys: ['c/4'], duration: 'w', stem_direction: 1 }),
      ];
      notesBar3[0].addArticulation(0, new VF.Articulation('a-').setPosition(3));
      notesBar3[0].addArticulation(0, new VF.Articulation('a>').setPosition(3));
      notesBar3[0].addArticulation(0, new VF.Articulation('a@a').setPosition(3));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);
      // bar 4 - juxtaposing second bar next to first bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x, staveBar3.y, 150);
      staveBar4.setEndBarType(VF.Barline.type.END);
      staveBar4.setContext(ctx).draw();

      var notesBar4 = [
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
      ];
      for (i = 0; i < 4; i++) {
        var position1 = 3;
        if (i > 1) {
          position1 = 4;
        }
        notesBar4[i].addArticulation(0, new VF.Articulation('a-').setPosition(position1));
      }

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
    },

    tabNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 200);
      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '8' },
        { positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 3, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 3, fret: 5 }], duration: '8' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var notes2 = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      var notes3 = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        return tabNote;
      });

      notes[0].addModifier(new VF.Articulation('a>').setPosition(3), 0); // U
      notes[1].addModifier(new VF.Articulation('a>').setPosition(4), 0); // D
      notes[2].addModifier(new VF.Articulation('a.').setPosition(3), 0); // U
      notes[3].addModifier(new VF.Articulation('a.').setPosition(4), 0); // D

      notes2[0].addModifier(new VF.Articulation('a>').setPosition(3), 0);
      notes2[1].addModifier(new VF.Articulation('a>').setPosition(4), 0);
      notes2[2].addModifier(new VF.Articulation('a.').setPosition(3), 0);
      notes2[3].addModifier(new VF.Articulation('a.').setPosition(4), 0);

      notes3[0].addModifier(new VF.Articulation('a>').setPosition(3), 0);
      notes3[1].addModifier(new VF.Articulation('a>').setPosition(4), 0);
      notes3[2].addModifier(new VF.Articulation('a.').setPosition(3), 0);
      notes3[3].addModifier(new VF.Articulation('a.').setPosition(4), 0);

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);
      voice.addTickables(notes2);
      voice.addTickables(notes3);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      voice.draw(ctx, stave);

      ok(true, 'TabNotes successfully drawn');
    },
  };

  return Articulation;
}());
