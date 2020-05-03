/**
 * VexFlow - Annotation Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ChordSymbol = (function() {
  var runSVG = VF.Test.runSVGTest;
  var ChordSymbol = {
    Start: function() {
      QUnit.module('ChordSymbol');
      runSVG('Top Chord Symbols', ChordSymbol.top);
      runSVG('Top Chord Symbols Justified', ChordSymbol.topJustify);
      runSVG('Kitchen Sink Chord Symbols', ChordSymbol.sink);
      runSVG('Bottom Chord Symbols', ChordSymbol.bottom);
      runSVG('Bottom Stem Down Chord Symbols', ChordSymbol.bottomStemDown);
      runSVG('Double Bottom Chord Symbols', ChordSymbol.dblbottom);
    },

    sink: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 220);
      var ctx = vf.getContext();
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';

      function newNote(keys, duration, chordSymbol) {
        return new VF.StaveNote({ keys, duration }).addModifier(0, chordSymbol);
      }

      function draw(chord1, chord2, y) {
        var notes = [];

        var stave = new VF.Stave(10, y, 450)
          .addClef('treble').setContext(ctx).draw();

        notes.push(newNote(['C/5'], 'h', chord1));
        notes.push(newNote(['C/5'], 'h', chord2));
        VF.Formatter.FormatAndDraw(ctx, stave, notes);
      }

      var chord1 = new VF.ChordSymbol().addGlyph('leftParenTall')
        .setHorizontal('left').addText('C')
        .addGlyphOrText('+5#11b9(sus4)', { symbolModifier: VF.ChordSymbol.SymbolModifiers.SUPERSCRIPT })
        .addGlyph('rightParenTall');

      /* var chord2 = new VF.ChordSymbol()
        .addText('C').addSuperGlyph('-').addText('F')
        .addSuperGlyph('halfDiminished');
      draw(chord1, chord2, 40);  */
      var chord2 = new VF.ChordSymbol()
        .addText('C').addGlyph('over').addText('B');
      draw(chord1, chord2, 40);

      ok(true, 'Kitchen Sink Chord Symbol');
    },

    top: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 580);
      var ctx = vf.getContext();
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';

      function newNote(keys, duration, chordSymbol) {
        return new VF.StaveNote({ keys, duration }).addModifier(0, chordSymbol);
      }

      function draw(chord1, chord2, y) {
        var notes = [];

        var stave = new VF.Stave(10, y, 450)
          .addClef('treble').setContext(ctx).draw();

        notes.push(newNote(['e/4', 'a/4', 'd/5'], 'h', chord1)
          .addAccidental(0, new VF.Accidental('b')));
        notes.push(newNote(['c/4', 'e/4', 'B/4'], 'h', chord2));
        VF.Formatter.FormatAndDraw(ctx, stave, notes);
      }

      var chord1 = new VF.ChordSymbol().addText('F7').setHorizontal('left')
        .addGlyphOrText('(#11b9)', { symbolModifier: VF.ChordSymbol.SymbolModifiers.SUPERSCRIPT });
      var chord2 = new VF.ChordSymbol()
        .addText('C')
        .addSuperGlyph('majorSeventh');
      draw(chord1, chord2, 40);

      chord1 = new VF.ChordSymbol().addText('F7').setHorizontal('left')
        .addSuperText('(')
        .addGlyphOrText('#11b9', { symbolModifier: VF.ChordSymbol.SymbolModifiers.SUPERSCRIPT })
        .addSuperText(')');
      chord2 = new VF.ChordSymbol()
        .addText('C')
        .addSuperText('Maj.');
      draw(chord1, chord2, 140);

      chord1 = new VF.ChordSymbol().addText('F7').setHorizontal('left')
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.SymbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.SymbolModifiers.SUBSCRIPT });
      chord2 = new VF.ChordSymbol()
        .addText('C')
        .addSuperText('Maj.');
      draw(chord1, chord2, 240);

      ok(true, 'Top Chord Symbol');
    },

    topJustify: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 680);
      var ctx = vf.getContext();
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';

      function newNote(keys, duration, chordSymbol) {
        return new VF.StaveNote({ keys, duration }).addModifier(0, chordSymbol);
      }

      function draw(chord1, chord2, y) {
        var notes = [];

        var stave = new VF.Stave(10, y, 450)
          .addClef('treble').setContext(ctx).draw();

        notes.push(newNote(['e/4', 'a/4', 'd/5'], 'h', chord1)
          .addAccidental(0, new VF.Accidental('b')));
        notes.push(newNote(['c/4', 'e/4', 'B/4'], 'h', chord2));
        VF.Formatter.FormatAndDraw(ctx, stave, notes);
      }

      var chord1 = new VF.ChordSymbol().addText('F7').setHorizontal('left')
        .addGlyphOrText('(#11b9)', { symbolModifier: VF.ChordSymbol.SymbolModifiers.SUPERSCRIPT });
      var chord2 = new VF.ChordSymbol()
        .addText('C')
        .addSuperGlyph('majorSeventh')
        .setHorizontal('left');
      draw(chord1, chord2, 40);

      chord1 = new VF.ChordSymbol().addText('F7').setHorizontal('left')
        .addSuperText('(')
        .addGlyphOrText('#11b9', { symbolModifier: VF.ChordSymbol.SymbolModifiers.SUPERSCRIPT })
        .addSuperText(')')
        .setHorizontal('center');
      chord2 = new VF.ChordSymbol()
        .addText('C')
        .addSuperText('Maj.')
        .setHorizontal('center');
      draw(chord1, chord2, 140);

      chord1 = new VF.ChordSymbol().addText('F7').setHorizontal('left')
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.SymbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.SymbolModifiers.SUBSCRIPT })
        .setHorizontal('right');
      chord2 = new VF.ChordSymbol()
        .addText('C')
        .addSuperText('Maj.')
        .setHorizontal('right');
      draw(chord1, chord2, 240);

      chord1 = new VF.ChordSymbol().addText('F7').setHorizontal('left')
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.SymbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.SymbolModifiers.SUBSCRIPT })
        .setHorizontal('centerStem');
      chord2 = new VF.ChordSymbol()
        .addText('C')
        .addSuperText('Maj.')
        .setHorizontal('centerStem');
      draw(chord1, chord2, 340);

      ok(true, 'Top Chord Justified');
    },

    dblbottom: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 260);
      var ctx = vf.getContext();
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';

      function newNote(keys, duration, chordSymbol1, chordSymbol2) {
        return new VF.StaveNote({ keys, duration })
          .addModifier(0, chordSymbol1)
          .addModifier(0, chordSymbol2);
      }

      function draw(chords, chords2, y) {
        var notes = [];

        var stave = new VF.Stave(10, y, 450)
          .addClef('treble').setContext(ctx).draw();

        notes.push(newNote(['c/4', 'f/4', 'a/4'], 'q', chords[0], chords2[0]));
        notes.push(newNote(['c/4', 'e/4', 'b/4'], 'q', chords[1], chords2[1]).addAccidental(2, new VF.Accidental('b')));
        notes.push(newNote(['c/4', 'e/4', 'g/4'], 'q', chords[2], chords2[2]));
        notes.push(newNote(['c/4', 'f/4', 'a/4'], 'q', chords[3], chords2[3]).addAccidental(1, new VF.Accidental('#')));
        VF.Formatter.FormatAndDraw(ctx, stave, notes);
      }
      var chords = [];
      var chords2 = [];

      chords.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .setFont('serif', 12)
        .addText('I')
        .addSuperText('6')
        .addSubText('4'));
      chords.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .addGlyphOrText('V')
        .setFont('serif', 12));
      chords.push(new VF.ChordSymbol()
        .addLine(12)
        .setVertical('bottom'));
      chords.push(new VF.ChordSymbol()
        .addGlyphOrText('V/V')
        .setVertical('bottom')
        .setFont('serif', 12));

      chords2.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .setFont('sans', 12, 'bold')
        .addText('T'));
      chords2.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .setFont('sans', 12, 'bold')
        .addText('D'));
      chords2.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .setFont('sans', 12, 'bold')
        .addText('D'));
      chords2.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .setFont('sans', 12, 'bold')
        .addText('SD'));

      draw(chords, chords2, 10);
      ok(true, '2 Bottom Chord Symbol');
    },

    bottom: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var ctx = vf.getContext();
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';

      function newNote(keys, duration, chordSymbol) {
        return new VF.StaveNote({ keys, duration }).addModifier(0, chordSymbol);
      }

      function draw(chords, y) {
        var notes = [];

        var stave = new VF.Stave(10, y, 400)
          .addClef('treble').setContext(ctx).draw();

        notes.push(newNote(['c/4', 'f/4', 'a/4'], 'q', chords[0]));
        notes.push(newNote(['c/4', 'e/4', 'b/4'], 'q', chords[1]).addAccidental(2, new VF.Accidental('b')));
        notes.push(newNote(['c/4', 'e/4', 'g/4'], 'q', chords[2]));
        notes.push(newNote(['c/4', 'f/4', 'a/4'], 'q', chords[3]).addAccidental(1, new VF.Accidental('#')));
        VF.Formatter.FormatAndDraw(ctx, stave, notes);
      }
      var chords = [];

      chords.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .setFont('serif', 12)
        .addText('I')
        .addSuperText('6')
        .addSubText('4'));
      chords.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .addGlyphOrText('V')
        .setFont('serif', 12));
      chords.push(new VF.ChordSymbol()
        .addLine(12)
        .setVertical('bottom'));
      chords.push(new VF.ChordSymbol()
        .addGlyphOrText('V/V')
        .setVertical('bottom')
        .setFont('serif', 12));

      draw(chords, 10);
      ok(true, 'Bottom Chord Symbol');
    },
    bottomStemDown: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 330);
      var ctx = vf.getContext();
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';

      function newNote(keys, duration, chordSymbol) {
        return new VF.StaveNote({ keys, duration, stem_direction: -1 }).addModifier(0, chordSymbol);
      }

      function draw(chords, y) {
        var notes = [];

        var stave = new VF.Stave(10, y, 400)
          .addClef('treble').setContext(ctx).draw();

        notes.push(newNote(['c/4', 'f/4', 'a/4'], 'q', chords[0]));
        notes.push(newNote(['c/4', 'e/4', 'b/4'], 'q', chords[1]).addAccidental(2, new VF.Accidental('b')));
        notes.push(newNote(['c/4', 'e/4', 'g/4'], 'q', chords[2]));
        notes.push(newNote(['c/4', 'f/4', 'a/4'], 'q', chords[3]).addAccidental(1, new VF.Accidental('#')));
        VF.Formatter.FormatAndDraw(ctx, stave, notes);
      }
      var chords = [];

      chords.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .addGlyphOrText('F'));
      chords.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .addGlyphOrText('C7'));
      chords.push(new VF.ChordSymbol()
        .addLine(12)
        .setVertical('bottom'));
      chords.push(new VF.ChordSymbol()
        .addText('A').addSuperGlyph('dim')
        .setVertical('bottom'));

      draw(chords, 10);
      ok(true, 'Bottom Stem Down Chord Symbol');
    },
  };

  return ChordSymbol;
})();
