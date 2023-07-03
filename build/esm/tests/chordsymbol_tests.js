import { VexFlowTests } from './vexflow_test_helpers.js';
import { Accidental } from '../src/accidental.js';
import { ChordSymbol } from '../src/chordsymbol.js';
import { Font } from '../src/font.js';
import { Formatter } from '../src/formatter.js';
import { Ornament } from '../src/ornament.js';
import { Stave } from '../src/stave.js';
import { StaveNote } from '../src/stavenote.js';
import { Tables } from '../src/tables.js';
const ChordSymbolTests = {
    Start() {
        QUnit.module('ChordSymbol');
        const run = VexFlowTests.runTests;
        run('Chord Symbol With Modifiers', withModifiers);
        run('Chord Symbol Font Size Tests', fontSize);
        run('Chord Symbol Kerning Tests', kern);
        run('Top Chord Symbols', top);
        run('Top Chord Symbols Justified', topJustify);
        run('Bottom Chord Symbols', bottom);
        run('Bottom Stem Down Chord Symbols', bottomStemDown);
        run('Double Bottom Chord Symbols', doubleBottom);
    },
};
const superscript = { symbolModifier: ChordSymbol.symbolModifiers.SUPERSCRIPT };
const subscript = { symbolModifier: ChordSymbol.symbolModifiers.SUBSCRIPT };
const note = (factory, keys, duration, chordSymbol) => factory.StaveNote({ keys, duration }).addModifier(chordSymbol, 0);
function getGlyphWidth(glyphName) {
    const musicFont = Tables.currentMusicFont();
    const glyph = musicFont.getGlyphs()[glyphName];
    const widthInEm = (glyph.x_max - glyph.x_min) / musicFont.getResolution();
    return widthInEm * 38 * Font.scaleToPxFrom.pt;
}
function withModifiers(options) {
    const f = VexFlowTests.makeFactory(options, 750, 580);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    function draw(chords, y) {
        const notes = [
            note(f, ['c/4'], 'q', chords[0]).addModifier(new Ornament('doit')),
            note(f, ['c/4'], 'q', chords[1]),
            note(f, ['c/4'], 'q', chords[2]).addModifier(new Ornament('fall')),
            note(f, ['c/4'], 'q', chords[3]),
        ];
        const score = f.EasyScore();
        const voice = score.voice(notes, { time: '4/4' });
        const formatter = f.Formatter();
        formatter.joinVoices([voice]);
        const voiceW = formatter.preCalculateMinTotalWidth([voice]);
        const staffW = voiceW + Stave.defaultPadding + getGlyphWidth('gClef');
        formatter.format([voice], voiceW);
        const staff = f.Stave({ x: 10, y, width: staffW }).addClef('treble').draw();
        voice.draw(ctx, staff);
    }
    let chords = [];
    chords.push(f
        .ChordSymbol({ fontSize: 10 })
        .addText('F7')
        .addGlyph('leftParenTall')
        .addGlyphOrText('b9', superscript)
        .addGlyphOrText('#11', subscript)
        .addGlyph('rightParenTall'));
    chords.push(f.ChordSymbol({ fontSize: 12 }).addText('F7').addGlyphOrText('b9', superscript).addGlyphOrText('#11', subscript));
    chords.push(f
        .ChordSymbol({ fontSize: 14 })
        .addText('F7')
        .addGlyph('leftParenTall')
        .addGlyphOrText('add 3', superscript)
        .addGlyphOrText('omit 9', subscript)
        .addGlyph('rightParenTall'));
    chords.push(f
        .ChordSymbol({ fontSize: 16 })
        .addText('F7')
        .addGlyph('leftParenTall')
        .addGlyphOrText('b9', superscript)
        .addGlyphOrText('#11', subscript)
        .addGlyph('rightParenTall'));
    draw(chords, 40);
    chords = [];
    chords.push(f
        .ChordSymbol({ fontSize: 10 })
        .setFontSize(10)
        .addText('F7')
        .addGlyphOrText('#11', superscript)
        .addGlyphOrText('b9', subscript));
    chords.push(f.ChordSymbol({ fontSize: 12 }).addText('F7').addGlyphOrText('#11', superscript).addGlyphOrText('b9', subscript));
    chords.push(f.ChordSymbol({ fontSize: 14 }).addText('F7').addGlyphOrText('#11', superscript).addGlyphOrText('b9', subscript));
    chords.push(f
        .ChordSymbol({ fontSize: 16 })
        .setFontSize(16)
        .addText('F7')
        .addGlyphOrText('#11', superscript)
        .addGlyphOrText('b9', subscript));
    draw(chords, 140);
    chords = [
        f.ChordSymbol({ fontSize: 10 }).addGlyphOrText('Ab').addGlyphOrText('7(#11b9)', superscript),
        f.ChordSymbol({ fontSize: 14 }).addGlyphOrText('C#').addGlyphOrText('7(#11b9)', superscript),
        f.ChordSymbol({ fontSize: 16 }).addGlyphOrText('Ab').addGlyphOrText('7(#11b9)', superscript),
        f.ChordSymbol({ fontSize: 18 }).addGlyphOrText('C#').addGlyphOrText('7(#11b9)', superscript),
    ];
    draw(chords, 240);
    options.assert.ok(true, 'Font Size Chord Symbol');
}
function fontSize(options) {
    const f = VexFlowTests.makeFactory(options, 750, 580);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    function draw(chords, y) {
        const stave = f.Stave({ x: 10, y, width: 450 }).addClef('treble');
        const notes = [
            note(f, ['c/4'], 'q', chords[0]),
            note(f, ['c/4'], 'q', chords[1]),
            note(f, ['c/4'], 'q', chords[2]),
            note(f, ['c/4'], 'q', chords[3]),
        ];
        const score = f.EasyScore();
        const voice = score.voice(notes, { time: '4/4' });
        f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
        f.draw();
    }
    let chords = [];
    chords.push(f
        .ChordSymbol({ fontSize: 10 })
        .addText('F7')
        .addGlyph('leftParenTall')
        .addGlyphOrText('b9', superscript)
        .addGlyphOrText('#11', subscript)
        .addGlyph('rightParenTall')
        .setReportWidth(false));
    chords.push(f
        .ChordSymbol({ fontSize: 12 })
        .addText('F7')
        .addGlyphOrText('b9', superscript)
        .addGlyphOrText('#11', subscript)
        .setReportWidth(false));
    chords.push(f
        .ChordSymbol({ fontSize: 14 })
        .addText('F7')
        .addGlyph('leftParenTall')
        .addGlyphOrText('add 3', superscript)
        .addGlyphOrText('omit 9', subscript)
        .addGlyph('rightParenTall')
        .setReportWidth(false));
    chords.push(f
        .ChordSymbol({ fontSize: 16 })
        .addText('F7')
        .addGlyph('leftParenTall')
        .addGlyphOrText('b9', superscript)
        .addGlyphOrText('#11', subscript)
        .addGlyph('rightParenTall')
        .setReportWidth(false));
    draw(chords, 40);
    chords = [];
    chords.push(f
        .ChordSymbol({ fontSize: 10 })
        .setFontSize(10)
        .addText('F7')
        .addGlyphOrText('#11', superscript)
        .addGlyphOrText('b9', subscript));
    chords.push(f.ChordSymbol({ fontSize: 12 }).addText('F7').addGlyphOrText('#11', superscript).addGlyphOrText('b9', subscript));
    chords.push(f.ChordSymbol({ fontSize: 14 }).addText('F7').addGlyphOrText('#11', superscript).addGlyphOrText('b9', subscript));
    chords.push(f
        .ChordSymbol({ fontSize: 16 })
        .setFontSize(16)
        .addText('F7')
        .addGlyphOrText('#11', superscript)
        .addGlyphOrText('b9', subscript));
    draw(chords, 140);
    chords = [
        f.ChordSymbol({ fontSize: 10 }).addGlyphOrText('Ab').addGlyphOrText('7(#11b9)', superscript),
        f.ChordSymbol({ fontSize: 14 }).addGlyphOrText('C#').addGlyphOrText('7(#11b9)', superscript),
        f.ChordSymbol({ fontSize: 16 }).addGlyphOrText('Ab').addGlyphOrText('7(#11b9)', superscript),
        f.ChordSymbol({ fontSize: 18 }).addGlyphOrText('C#').addGlyphOrText('7(#11b9)', superscript),
    ];
    draw(chords, 240);
    options.assert.ok(true, 'Font Size Chord Symbol');
}
function kern(options) {
    const f = VexFlowTests.makeFactory(options, 650 * 1.5, 650);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    function draw(chords, y) {
        const stave = f.Stave({ x: 10, y, width: 450 }).addClef('treble').setContext(ctx).draw();
        const notes = [
            note(f, ['C/4'], 'q', chords[0]),
            note(f, ['C/4'], 'q', chords[1]),
            note(f, ['C/4'], 'q', chords[2]),
            note(f, ['C/4'], 'q', chords[3]),
        ];
        const score = f.EasyScore();
        const voice = score.voice(notes, { time: '4/4' });
        f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
        f.draw();
    }
    let chords = [
        f.ChordSymbol().addText('A').addGlyphSuperscript('dim').setReportWidth(false),
        f.ChordSymbol({ kerning: false, reportWidth: false }).addText('A').addGlyphSuperscript('dim'),
        f.ChordSymbol({ hJustify: 'left', reportWidth: false }).addText('C').addGlyph('halfDiminished', superscript),
        f.ChordSymbol({ reportWidth: false }).addText('D').addGlyph('halfDiminished', superscript),
    ];
    draw(chords, 10);
    chords = [
        f.ChordSymbol().addText('A').addGlyphSuperscript('dim'),
        f.ChordSymbol({ kerning: false }).addText('A').addGlyphSuperscript('dim'),
        f.ChordSymbol().addText('A').addGlyphSuperscript('+').addTextSuperscript('5'),
        f.ChordSymbol().addText('G').addGlyphSuperscript('+').addTextSuperscript('5'),
    ];
    draw(chords, 110);
    chords = [
        f.ChordSymbol().addText('A').addGlyph('-'),
        f.ChordSymbol().addText('E').addGlyph('-'),
        f.ChordSymbol().addText('A').addGlyphOrText('(#11)', superscript),
        f.ChordSymbol().addText('E').addGlyphOrText('(#9)', superscript),
    ];
    draw(chords, 210);
    chords = [
        f.ChordSymbol().addGlyphOrText('F/B').addGlyphOrText('b', superscript),
        f.ChordSymbol().addText('E').addGlyphOrText('V/V'),
        f.ChordSymbol().addText('A').addGlyphOrText('(#11)', superscript),
        f.ChordSymbol().addText('E').addGlyphOrText('(#9)', superscript),
    ];
    draw(chords, 310);
    options.assert.ok(true, 'Chord Symbol Kerning Tests');
}
function top(options) {
    const f = VexFlowTests.makeFactory(options, 650 * 1.5, 650);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    const note = (factory, keys, duration, chordSymbol, direction) => factory.StaveNote({ keys, duration, stem_direction: direction }).addModifier(chordSymbol, 0);
    function draw(c1, c2, y) {
        const stave = f.Stave({ x: 10, y, width: 450 }).addClef('treble').setContext(ctx).draw();
        const notes = [
            note(f, ['e/4', 'a/4', 'd/5'], 'h', c1, 1).addModifier(new Accidental('b'), 0),
            note(f, ['c/5', 'e/5', 'c/6'], 'h', c2, -1),
        ];
        const score = f.EasyScore();
        const voice = score.voice(notes, { time: '4/4' });
        f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
        f.draw();
    }
    let chord1 = f
        .ChordSymbol({ reportWidth: false })
        .addText('F7')
        .setHorizontal('left')
        .addGlyphOrText('(#11b9)', superscript);
    let chord2 = f
        .ChordSymbol({ reportWidth: false })
        .addText('C')
        .setHorizontal('left')
        .addGlyphSuperscript('majorSeventh');
    draw(chord1, chord2, 40);
    chord1 = f
        .ChordSymbol()
        .addText('F7')
        .addTextSuperscript('(')
        .addGlyphOrText('#11b9', superscript)
        .addTextSuperscript(')');
    chord2 = f.ChordSymbol().addText('C').setHorizontal('left').addTextSuperscript('Maj.');
    draw(chord1, chord2, 140);
    chord1 = f
        .ChordSymbol()
        .addText('F7')
        .setHorizontal('left')
        .addGlyphOrText('#11', superscript)
        .addGlyphOrText('b9', subscript);
    chord2 = f.ChordSymbol().addText('C').addTextSuperscript('sus4');
    draw(chord1, chord2, 240);
    options.assert.ok(true, 'Top Chord Symbol');
}
function topJustify(options) {
    const f = VexFlowTests.makeFactory(options, 500 * 1.5, 680);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    function draw(chord1, chord2, y) {
        const stave = new Stave(10, y, 450).addClef('treble').setContext(ctx).draw();
        const notes = [
            note(f, ['e/4', 'a/4', 'd/5'], 'h', chord1).addModifier(new Accidental('b'), 0),
            note(f, ['c/4', 'e/4', 'B/4'], 'h', chord2),
        ];
        Formatter.FormatAndDraw(ctx, stave, notes);
    }
    let chord1 = f.ChordSymbol().addText('F7').setHorizontal('left').addGlyphOrText('(#11b9)', superscript);
    let chord2 = f.ChordSymbol({ hJustify: 'left' }).addText('C').addGlyphSuperscript('majorSeventh');
    draw(chord1, chord2, 40);
    chord1 = f
        .ChordSymbol({ hJustify: 'center' })
        .addText('F7')
        .setHorizontal('left')
        .addGlyphOrText('(#11b9)', superscript);
    chord2 = f.ChordSymbol({ hJustify: 'center' }).addText('C').addTextSuperscript('Maj.');
    draw(chord1, chord2, 140);
    chord1 = f
        .ChordSymbol({ hJustify: 'right' })
        .addText('F7')
        .setHorizontal('left')
        .addGlyphOrText('#11', superscript)
        .addGlyphOrText('b9', subscript);
    chord2 = f.ChordSymbol({ hJustify: 'right' }).addText('C').addTextSuperscript('Maj.');
    draw(chord1, chord2, 240);
    chord1 = f
        .ChordSymbol({ hJustify: 'left' })
        .addText('F7')
        .setHorizontal('left')
        .addGlyphOrText('#11', superscript)
        .addGlyphOrText('b9', subscript);
    chord2 = f.ChordSymbol({ hJustify: 'centerStem' }).addText('C').addTextSuperscript('Maj.');
    draw(chord1, chord2, 340);
    options.assert.ok(true, 'Top Chord Justified');
}
function bottom(options) {
    const f = VexFlowTests.makeFactory(options, 600 * 1.5, 230);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    function draw(chords, y) {
        const stave = new Stave(10, y, 400).addClef('treble').setContext(ctx).draw();
        const notes = [
            note(f, ['c/4', 'f/4', 'a/4'], 'q', chords[0]),
            note(f, ['c/4', 'e/4', 'b/4'], 'q', chords[1]).addModifier(new Accidental('b'), 2),
            note(f, ['c/4', 'e/4', 'g/4'], 'q', chords[2]),
            note(f, ['c/4', 'f/4', 'a/4'], 'q', chords[3]).addModifier(new Accidental('#'), 1),
        ];
        Formatter.FormatAndDraw(ctx, stave, notes);
    }
    const chords = [
        f.ChordSymbol({ vJustify: 'bottom' }).addText('I').addTextSuperscript('6').addTextSubscript('4'),
        f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('V'),
        f.ChordSymbol({ vJustify: 'bottom' }).addLine(12),
        f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('V/V'),
    ];
    draw(chords, 10);
    options.assert.ok(true, 'Bottom Chord Symbol');
}
function bottomStemDown(options) {
    const f = VexFlowTests.makeFactory(options, 600 * 1.5, 330);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    function draw(chords, y) {
        const note = (keys, duration, chordSymbol) => new StaveNote({ keys, duration, stem_direction: -1 }).addModifier(chordSymbol, 0);
        const stave = new Stave(10, y, 400).addClef('treble').setContext(ctx).draw();
        const notes = [
            note(['c/4', 'f/4', 'a/4'], 'q', chords[0]),
            note(['c/4', 'e/4', 'b/4'], 'q', chords[1]).addModifier(new Accidental('b'), 2),
            note(['c/4', 'e/4', 'g/4'], 'q', chords[2]),
            note(['c/4', 'f/4', 'a/4'], 'q', chords[3]).addModifier(new Accidental('#'), 1),
        ];
        Formatter.FormatAndDraw(ctx, stave, notes);
    }
    const chords = [
        f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('F'),
        f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('C7'),
        f.ChordSymbol({ vJustify: 'bottom' }).addLine(12),
        f.ChordSymbol({ vJustify: 'bottom' }).addText('A').addGlyphSuperscript('dim'),
    ];
    draw(chords, 10);
    options.assert.ok(true, 'Bottom Stem Down Chord Symbol');
}
function doubleBottom(options) {
    const f = VexFlowTests.makeFactory(options, 600 * 1.5, 260);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    function draw(chords, chords2, y) {
        const note = (keys, duration, chordSymbol1, chordSymbol2) => new StaveNote({ keys, duration }).addModifier(chordSymbol1, 0).addModifier(chordSymbol2, 0);
        const stave = f.Stave({ x: 10, y, width: 450 }).addClef('treble').setContext(ctx).draw();
        const notes = [
            note(['c/4', 'f/4', 'a/4'], 'q', chords[0], chords2[0]),
            note(['c/4', 'e/4', 'b/4'], 'q', chords[1], chords2[1]).addModifier(f.Accidental({ type: 'b' }), 2),
            note(['c/4', 'e/4', 'g/4'], 'q', chords[2], chords2[2]),
            note(['c/4', 'f/4', 'a/4'], 'q', chords[3], chords2[3]).addModifier(f.Accidental({ type: '#' }), 1),
        ];
        Formatter.FormatAndDraw(ctx, stave, notes);
    }
    const chords1 = [
        f.ChordSymbol({ vJustify: 'bottom' }).addText('I').addTextSuperscript('6').addTextSubscript('4'),
        f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('V'),
        f.ChordSymbol({ vJustify: 'bottom' }).addLine(12),
        f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('V/V'),
    ];
    const chords2 = [
        f.ChordSymbol({ vJustify: 'bottom' }).addText('T'),
        f.ChordSymbol({ vJustify: 'bottom' }).addText('D'),
        f.ChordSymbol({ vJustify: 'bottom' }).addText('D'),
        f.ChordSymbol({ vJustify: 'bottom' }).addText('SD'),
    ];
    draw(chords1, chords2, 10);
    options.assert.ok(true, '2 Bottom Chord Symbol');
}
VexFlowTests.register(ChordSymbolTests);
export { ChordSymbolTests };
