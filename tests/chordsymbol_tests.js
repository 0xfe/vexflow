/**
 * VexFlow - Annotation Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ChordSymbol = (function() {
  var runSVG = VF.Test.runSVGTest;
  var ChordSymbol = {
    Start: function() {
      QUnit.module('ChordSymbol');
      runSVG('Chord Symbol Font Size Tests', ChordSymbol.fontSize);
      runSVG('Top Chord Symbols', ChordSymbol.top);
      runSVG('Chord Symbol Kerning Tests', ChordSymbol.kern);
      runSVG('Top Chord Symbols Justified', ChordSymbol.topJustify);
      runSVG('Bottom Chord Symbols', ChordSymbol.bottom);
      runSVG('Bottom Stem Down Chord Symbols', ChordSymbol.bottomStemDown);
      runSVG('Double Bottom Chord Symbols', ChordSymbol.dblbottom);
    },

    kern: function(options) {
      var vf = VF.Test.makeFactory(options, 650, 650);
      var ctx = vf.getContext();
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';

      function newNote(keys, duration, chordSymbol) {
        return new VF.StaveNote({ keys, duration }).addModifier(0, chordSymbol);
      }

      function draw(chords, y) {
        var notes = [];

        var stave = new VF.Stave(10, y, 450)
          .addClef('treble').setContext(ctx).draw();

        notes.push(newNote(['C/4'], 'q', chords[0]));
        notes.push(newNote(['C/4'], 'q', chords[1]));
        notes.push(newNote(['C/4'], 'q', chords[2]));
        notes.push(newNote(['C/4'], 'q', chords[3]));
        VF.Formatter.FormatAndDraw(ctx, stave, notes);
      }

      var chords = [];
      chords.push(new VF.ChordSymbol()
        .addText('A')
        .addGlyphSuperscript('dim'));

      chords.push(new VF.ChordSymbol()
        .addText('A')
        .addGlyphSuperscript('dim')
        .setEnableKerning(false));

      chords.push(new VF.ChordSymbol()
        .setHorizontal('left').addText('C')
        .addGlyph('halfDiminished', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT }));

      chords.push(new VF.ChordSymbol()
        .setHorizontal('left').addText('D')
        .addGlyph('halfDiminished', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT }));

      draw(chords, 10);

      chords = [];
      chords.push(new VF.ChordSymbol()
        .addText('A')
        .addGlyphSuperscript('dim'));

      chords.push(new VF.ChordSymbol()
        .addText('A')
        .addGlyphSuperscript('dim')
        .setEnableKerning(false));

      chords.push(new VF.ChordSymbol()
        .addText('A')
        .addGlyphSuperscript('+').addTextSuperscript('5'));

      chords.push(new VF.ChordSymbol()
        .addText('G')
        .addGlyphSuperscript('+')
        .addTextSuperscript('5'));

      draw(chords, 110);

      chords = [];
      chords.push(new VF.ChordSymbol()
        .addText('A')
        .addGlyph('-'));

      chords.push(new VF.ChordSymbol()
        .addText('E')
        .addGlyph('-'));

      chords.push(new VF.ChordSymbol()
        .addText('A')
        .addGlyphOrText('(#11)', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT }));

      chords.push(new VF.ChordSymbol()
        .addText('E')
        .addGlyphOrText('(#9)', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT }));

      draw(chords, 210);

      chords = [];
      chords.push(new VF.ChordSymbol()
        .addGlyphOrText('F/B').addGlyphOrText('b', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT }));

      chords.push(new VF.ChordSymbol()
        .addText('E')
        .addGlyphOrText('V/V'));

      chords.push(new VF.ChordSymbol()
        .addText('A')
        .addGlyphOrText('(#11)', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT }));

      chords.push(new VF.ChordSymbol()
        .addText('E')
        .addGlyphOrText('(#9)', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT }));

      draw(chords, 310);

      ok(true, 'Chord Symbol Kerning Tests');
    },

    top: function(options) {
      var vf = VF.Test.makeFactory(options, 650, 650);
      var ctx = vf.getContext();
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';

      function newNote(keys, duration, chordSymbol) {
        return new VF.StaveNote({ keys, duration }).addModifier(0, chordSymbol);
      }

      function draw(c1, c2, y) {
        var notes = [];

        var stave = new VF.Stave(10, y, 450)
          .addClef('treble').setContext(ctx).draw();

        notes.push(newNote(['e/4', 'a/4', 'd/5'], 'h', c1)
          .addAccidental(0, new VF.Accidental('b')));
        notes.push(newNote(['c/4', 'e/4', 'b/4'], 'h', c2));
        VF.Formatter.FormatAndDraw(ctx, stave, notes);
      }

      var chord1 = new VF.ChordSymbol().addText('F7').setHorizontal('left')
        .addGlyphOrText('(#11b9)', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT });
      var chord2 = new VF.ChordSymbol()
        .addText('C').setHorizontal('left')
        .addGlyphSuperscript('majorSeventh');
      draw(chord1, chord2, 40);

      chord1 = new VF.ChordSymbol().addText('F7')
        .addTextSuperscript('(')
        .addGlyphOrText('#11b9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addTextSuperscript(')');
      chord2 = new VF.ChordSymbol()
        .addText('C').setHorizontal('left')
        .addTextSuperscript('Maj.');
      draw(chord1, chord2, 140);

      chord1 = new VF.ChordSymbol().addText('F7').setHorizontal('left')
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUBSCRIPT });
      chord2 = new VF.ChordSymbol()
        .addText('C')
        .addTextSuperscript('sus4');
      draw(chord1, chord2, 240);

      ok(true, 'Top Chord Symbol');
    },

    fontSize: function(options) {
      var vf = VF.Test.makeFactory(options, 750, 580);
      var ctx = vf.getContext();
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';

      function newNote(keys, duration, chordSymbol) {
        return new VF.StaveNote({ keys, duration }).addModifier(0, chordSymbol);
      }

      function draw(chords, y) {
        var notes = [];

        var stave = new VF.Stave(10, y, 450)
          .addClef('treble').setContext(ctx).draw();

        notes.push(newNote(['c/4'], 'q', chords[0]));
        notes.push(newNote(['c/4'], 'q', chords[1]));
        notes.push(newNote(['c/4'], 'q', chords[2]));
        notes.push(newNote(['c/4'], 'q', chords[3]));
        VF.Formatter.FormatAndDraw(ctx, stave, notes);
      }

      var chords = [];
      chords.push(new VF.ChordSymbol().setFontSize(10).addText('F7')
        .addGlyph('leftParenTall')
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUBSCRIPT })
        .addGlyph('rightParenTall')
      );
      chords.push(new VF.ChordSymbol().setFontSize(12).addText('F7')
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUBSCRIPT })
      );
      chords.push(new VF.ChordSymbol().setFontSize(14).addText('F7')
        .addGlyph('leftParenTall')
        .addGlyphOrText('add 3', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('omit 9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUBSCRIPT })
        .addGlyph('rightParenTall')
      );
      chords.push(new VF.ChordSymbol().setFontSize(16).addText('F7')
        .addGlyph('leftParenTall')
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUBSCRIPT })
        .addGlyph('rightParenTall')
      );
      draw(chords, 40);

      chords = [];
      chords.push(new VF.ChordSymbol().setFontSize(10).addText('F7')
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUBSCRIPT })
      );
      chords.push(new VF.ChordSymbol().setFontSize(12).addText('F7')
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUBSCRIPT })
      );
      chords.push(new VF.ChordSymbol().setFontSize(14).addText('F7')
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUBSCRIPT })
      );
      chords.push(new VF.ChordSymbol().setFontSize(16).addText('F7')
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUBSCRIPT })
      );
      draw(chords, 140);

      chords = [];
      chords.push(new VF.ChordSymbol().setFontSize(10).addGlyphOrText('Ab')
        .addGlyphOrText('7(#11b9)', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
      );
      chords.push(new VF.ChordSymbol().setFontSize(14).addGlyphOrText('C#')
        .addGlyphOrText('7(#11b9)', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
      );
      chords.push(new VF.ChordSymbol().setFontSize(16).addGlyphOrText('Ab')
        .addGlyphOrText('7(#11b9)', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
      );
      chords.push(new VF.ChordSymbol().setFontSize(18).addGlyphOrText('C#')
        .addGlyphOrText('7(#11b9)', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
      );
      draw(chords, 240);

      ok(true, 'Font Size Chord Symbol');
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
        .addGlyphOrText('(#11b9)', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT });
      var chord2 = new VF.ChordSymbol()
        .addText('C')
        .addGlyphSuperscript('majorSeventh')
        .setHorizontal('left');
      draw(chord1, chord2, 40);

      chord1 = new VF.ChordSymbol().addText('F7').setHorizontal('left')
        .addGlyphOrText('(#11b9)', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .setHorizontal('center');
      chord2 = new VF.ChordSymbol()
        .addText('C')
        .addTextSuperscript('Maj.')
        .setHorizontal('center');
      draw(chord1, chord2, 140);

      chord1 = new VF.ChordSymbol().addText('F7').setHorizontal('left')
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUBSCRIPT })
        .setHorizontal('right');
      chord2 = new VF.ChordSymbol()
        .addText('C')
        .addTextSuperscript('Maj.')
        .setHorizontal('right');
      draw(chord1, chord2, 240);

      chord1 = new VF.ChordSymbol().addText('F7').setHorizontal('left')
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUBSCRIPT })
        .setHorizontal('centerStem');
      chord2 = new VF.ChordSymbol()
        .addText('C')
        .addTextSuperscript('Maj.')
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
        .addText('I')
        .addTextSuperscript('6')
        .addTextSubscript('4'));
      chords.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .addGlyphOrText('V'));
      chords.push(new VF.ChordSymbol()
        .addLine(12)
        .setVertical('bottom'));
      chords.push(new VF.ChordSymbol()
        .addGlyphOrText('V/V')
        .setVertical('bottom'));

      chords2.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .addText('T'));
      chords2.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .addText('D'));
      chords2.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .addText('D'));
      chords2.push(new VF.ChordSymbol()
        .setVertical('bottom')
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
        .addText('I')
        .addTextSuperscript('6')
        .addTextSubscript('4'));
      chords.push(new VF.ChordSymbol()
        .setVertical('bottom')
        .addGlyphOrText('V'));
      chords.push(new VF.ChordSymbol()
        .addLine(12)
        .setVertical('bottom'));
      chords.push(new VF.ChordSymbol()
        .addGlyphOrText('V/V')
        .setVertical('bottom'));

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
        .addText('A').addGlyphSuperscript('dim')
        .setVertical('bottom'));

      draw(chords, 10);
      ok(true, 'Bottom Stem Down Chord Symbol');
    },
  };

  return ChordSymbol;
})();
