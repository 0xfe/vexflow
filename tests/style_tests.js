/**
 * VexFlow - Style Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Style = (function() {
  var runTests = VF.Test.runTests;
  function FS(fill, stroke) {
    var ret = { fillStyle: fill };
    if (stroke) {
      ret.strokeStyle = stroke;
    }
    return ret;
  }

  var Style = {
    Start: function() {
      QUnit.module('Style');
      runTests('Basic Style', Style.stave);
      runTests('TabNote modifiers Style', Style.tab);
    },

    stave: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 150);
      var stave = vf.Stave({ x: 25, y: 20, width: 500 });

      // Stave modifiers test.
      var keySig = new VF.KeySignature('D');
      keySig.addToStave(stave);
      keySig.setStyle(FS('blue'));
      stave.addTimeSignature('4/4');
      var timeSig = stave.getModifiers(VF.StaveModifier.Position.BEGIN, VF.TimeSignature.CATEGORY);
      timeSig[0].setStyle(FS('brown'));

      var notes = [
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
        vf.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '8' }),

        // voice.draw() test.
        vf.TextDynamics({ text: 'sfz', duration: '16' }).setStyle(FS('blue')),

        // GhostNote modifiers test.
        vf.GhostNote({ duration: '16' }).addModifier(new VF.Annotation('GhostNote green text').setStyle(FS('green'))),
      ];

      notes[0].setKeyStyle(0, FS('red'));
      notes[1].setKeyStyle(0, FS('red'));

      // StaveNote modifiers test.
      var mods1 = notes[1].getModifiers();
      mods1[0].setStyle(FS('green'));
      notes[0].addArticulation(0, new VF.Articulation('a.').setPosition(4).setStyle(FS('green')));
      notes[0].addModifier(0, new VF.Ornament('mordent').setStyle(FS('lightgreen')));

      notes[1].addModifier(0, new VF.Annotation('blue').setStyle(FS('blue')));
      notes[1].addModifier(0,
        new VF.NoteSubGroup([vf.ClefNote({ options: { size: 'small' } }).setStyle(FS('blue'))]));

      var voice = vf.Voice().addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();
      ok(true, 'Basic Style');
    },

    tab: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 140);
      ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.font = ' 10pt Arial';
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph();
      stave.getModifiers()[2].setStyle(FS('blue'));
      stave.setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }
      function newAnnotation(text) { return new VF.Annotation(text); }

      // TabNote modifiers test.
      var notes = [
        newNote({
          positions: [{ str: 2, fret: 10 }, { str: 4, fret: 9 }], duration: 'h',
        })
          .addModifier(newAnnotation('green text').setStyle(FS('green')), 0),
        newNote({
          positions: [{ str: 2, fret: 10 }, { str: 4, fret: 9 }], duration: 'h',
        })
          .addModifier(newBend('Full').setStyle(FS('brown')), 0)
          .addStroke(0, new VF.Stroke(1, { all_voices: false }).setStyle(FS('blue'))),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, 'TabNote modifiers Style');
    },
  };

  return Style;
})();
