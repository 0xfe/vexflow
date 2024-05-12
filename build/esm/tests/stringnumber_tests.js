import { VexFlowTests } from './vexflow_test_helpers.js';
import { Glyph } from '../src/glyph.js';
import { Renderer } from '../src/renderer.js';
import { Stave } from '../src/stave.js';
import { BarlineType } from '../src/stavebarline.js';
import { Stroke } from '../src/strokes.js';
const StringNumberTests = {
    Start() {
        QUnit.module('StringNumber');
        const run = VexFlowTests.runTests;
        run('String Number In Notation', drawMultipleMeasures);
        run('String Number In Notation - no circle', drawMultipleMeasures, { drawCircle: false });
        run('Fret Hand Finger In Notation', drawFretHandFingers);
        run('Multi Voice With Strokes, String & Finger Numbers', multi);
        run('Complex Measure With String & Finger Numbers', drawAccidentals);
        run('Shifted Notehead, Multiple Modifiers', shiftedNoteheadMultipleModifiers);
    },
};
function drawMultipleMeasures(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    const f = VexFlowTests.makeFactory(options, 775, 200);
    const score = f.EasyScore();
    const stave1 = f.Stave({ width: 300 }).setEndBarType(BarlineType.DOUBLE).addClef('treble');
    const notes1 = score.notes('(c4 e4 g4)/4., (c5 e5 g5)/8, (c4 f4 g4)/4, (c4 f4 g4)/4', { stem: 'down' });
    notes1[0]
        .addModifier(f.StringNumber({ number: '5', position: 'right' }, (_a = options.params) === null || _a === void 0 ? void 0 : _a.drawCircle), 0)
        .addModifier(f.StringNumber({ number: '4', position: 'left' }, (_b = options.params) === null || _b === void 0 ? void 0 : _b.drawCircle), 1)
        .addModifier(f.StringNumber({ number: '3', position: 'right' }, (_c = options.params) === null || _c === void 0 ? void 0 : _c.drawCircle), 2);
    notes1[1]
        .addModifier(f.Accidental({ type: '#' }), 0)
        .addModifier(f.StringNumber({ number: '5', position: 'below' }, (_d = options.params) === null || _d === void 0 ? void 0 : _d.drawCircle), 0)
        .addModifier(f.Accidental({ type: '#' }).setAsCautionary(), 1)
        .addModifier(f
        .StringNumber({ number: '3', position: 'above' }, (_e = options.params) === null || _e === void 0 ? void 0 : _e.drawCircle)
        .setLastNote(notes1[3])
        .setLineEndType(Renderer.LineEndType.DOWN), 2);
    notes1[2]
        .addModifier(f.StringNumber({ number: '5', position: 'left' }, (_f = options.params) === null || _f === void 0 ? void 0 : _f.drawCircle), 0)
        .addModifier(f.StringNumber({ number: '3', position: 'left' }, (_g = options.params) === null || _g === void 0 ? void 0 : _g.drawCircle), 2)
        .addModifier(f.Accidental({ type: '#' }), 1);
    notes1[3]
        .addModifier(f.StringNumber({ number: '5', position: 'right' }, (_h = options.params) === null || _h === void 0 ? void 0 : _h.drawCircle).setOffsetY(7), 0)
        .addModifier(f.StringNumber({ number: '4', position: 'right' }, (_j = options.params) === null || _j === void 0 ? void 0 : _j.drawCircle).setOffsetY(6), 1)
        .addModifier(f.StringNumber({ number: '3', position: 'right' }, (_k = options.params) === null || _k === void 0 ? void 0 : _k.drawCircle).setOffsetY(-6), 2);
    const voice1 = score.voice(notes1);
    f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);
    const stave2 = f
        .Stave({ x: stave1.getWidth() + stave1.getX(), y: stave1.getY(), width: 300 })
        .setEndBarType(BarlineType.DOUBLE);
    const notes2 = score.notes('(c4 e4 g4)/4, (c5 e5 g5), (c4 f4 g4), (c4 f4 g4)', { stem: 'up' });
    notes2[0]
        .addModifier(f.StringNumber({ number: '5', position: 'right' }, (_l = options.params) === null || _l === void 0 ? void 0 : _l.drawCircle), 0)
        .addModifier(f.StringNumber({ number: '4', position: 'left' }, (_m = options.params) === null || _m === void 0 ? void 0 : _m.drawCircle), 1)
        .addModifier(f.StringNumber({ number: '3', position: 'right' }, (_o = options.params) === null || _o === void 0 ? void 0 : _o.drawCircle), 2);
    notes2[1]
        .addModifier(f.Accidental({ type: '#' }), 0)
        .addModifier(f.StringNumber({ number: '5', position: 'below' }, (_p = options.params) === null || _p === void 0 ? void 0 : _p.drawCircle), 0)
        .addModifier(f.Accidental({ type: '#' }), 1)
        .addModifier(f
        .StringNumber({ number: '3', position: 'above' }, (_q = options.params) === null || _q === void 0 ? void 0 : _q.drawCircle)
        .setLastNote(notes2[3])
        .setDashed(false), 2);
    notes2[2]
        .addModifier(f.StringNumber({ number: '3', position: 'left' }, (_r = options.params) === null || _r === void 0 ? void 0 : _r.drawCircle), 2)
        .addModifier(f.Accidental({ type: '#' }), 1);
    notes2[3]
        .addModifier(f.StringNumber({ number: '5', position: 'right' }, (_s = options.params) === null || _s === void 0 ? void 0 : _s.drawCircle).setOffsetY(7), 0)
        .addModifier(f.StringNumber({ number: '4', position: 'right' }, (_t = options.params) === null || _t === void 0 ? void 0 : _t.drawCircle).setOffsetY(6), 1)
        .addModifier(f.StringNumber({ number: '3', position: 'right' }, (_u = options.params) === null || _u === void 0 ? void 0 : _u.drawCircle).setOffsetY(-6), 2);
    const voice2 = score.voice(notes2);
    f.Formatter().joinVoices([voice2]).formatToStave([voice2], stave2);
    const stave3 = f
        .Stave({ x: stave2.getWidth() + stave2.getX(), y: stave2.getY(), width: 150 })
        .setEndBarType(BarlineType.END);
    const notesBar3 = score.notes('(c4 e4 g4 a4)/1.');
    notesBar3[0]
        .addModifier(f.StringNumber({ number: '5', position: 'below' }, (_v = options.params) === null || _v === void 0 ? void 0 : _v.drawCircle), 0)
        .addModifier(f.StringNumber({ number: '4', position: 'right' }, (_w = options.params) === null || _w === void 0 ? void 0 : _w.drawCircle), 1)
        .addModifier(f.StringNumber({ number: '3', position: 'left' }, (_x = options.params) === null || _x === void 0 ? void 0 : _x.drawCircle), 2)
        .addModifier(f.StringNumber({ number: '2', position: 'above' }, (_y = options.params) === null || _y === void 0 ? void 0 : _y.drawCircle), 3);
    const voice3 = score.voice(notesBar3, { time: '6/4' });
    f.Formatter().joinVoices([voice3]).formatToStave([voice3], stave3);
    f.draw();
    options.assert.ok(true, 'String Number');
}
function drawFretHandFingers(options) {
    const f = VexFlowTests.makeFactory(options, 725, 200);
    const score = f.EasyScore();
    const stave1 = f.Stave({ width: 350 }).setEndBarType(BarlineType.DOUBLE).addClef('treble');
    const notes1 = score.notes('(c4 e4 g4)/4, (c5 e5 g5), (c4 f4 g4), (c4 f4 g4)', { stem: 'down' });
    notes1[0]
        .addModifier(f.Fingering({ number: '3', position: 'left' }), 0)
        .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
        .addModifier(f.Fingering({ number: '0', position: 'left' }), 2);
    notes1[1]
        .addModifier(f.Accidental({ type: '#' }), 0)
        .addModifier(f.Fingering({ number: '3', position: 'left' }), 0)
        .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
        .addModifier(f.Accidental({ type: '#' }), 1)
        .addModifier(f.Fingering({ number: '0', position: 'left' }), 2);
    notes1[2]
        .addModifier(f.Fingering({ number: '3', position: 'below' }), 0)
        .addModifier(f.Fingering({ number: '4', position: 'left' }), 1)
        .addModifier(f.StringNumber({ number: '4', position: 'left' }), 1)
        .addModifier(f.Fingering({ number: '0', position: 'above' }), 2)
        .addModifier(f.Accidental({ type: '#' }), 1);
    notes1[3]
        .addModifier(f.Fingering({ number: '3', position: 'right' }), 0)
        .addModifier(f.StringNumber({ number: '5', position: 'right' }).setOffsetY(7), 0)
        .addModifier(f.Fingering({ number: '4', position: 'right' }), 1)
        .addModifier(f.StringNumber({ number: '4', position: 'right' }).setOffsetY(6), 1)
        .addModifier(f.Fingering({ number: '0', position: 'right' }).setOffsetY(-5), 2)
        .addModifier(f.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6), 2);
    const voice1 = score.voice(notes1);
    f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);
    const stave2 = f
        .Stave({ x: stave1.getWidth() + stave1.getX(), y: stave1.getY(), width: 350 })
        .setEndBarType(BarlineType.END);
    const notes2 = score.notes('(c4 e4 g4)/4., (c5 e5 g5)/8, (c4 f4 g4)/8, (c4 f4 g4)/4.[stem="down"]', {
        stem: 'up',
    });
    notes2[0]
        .addModifier(f.Fingering({ number: '3', position: 'right' }), 0)
        .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
        .addModifier(f.StringNumber({ number: '4', position: 'right' }), 1)
        .addModifier(f.Fingering({ number: '0', position: 'above' }), 2);
    notes2[1]
        .addModifier(f.Accidental({ type: '#' }), 0)
        .addModifier(f.Fingering({ number: '3', position: 'right' }), 0)
        .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
        .addModifier(f.Accidental({ type: '#' }), 1)
        .addModifier(f.Fingering({ number: '0', position: 'left' }), 2);
    notes2[2]
        .addModifier(f.Fingering({ number: '3', position: 'below' }), 0)
        .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
        .addModifier(f.StringNumber({ number: '4', position: 'left' }), 1)
        .addModifier(f.Fingering({ number: '1', position: 'right' }), 2)
        .addModifier(f.Accidental({ type: '#' }), 2);
    notes2[3]
        .addModifier(f.Fingering({ number: '3', position: 'right' }), 0)
        .addModifier(f.StringNumber({ number: '5', position: 'right' }).setOffsetY(7), 0)
        .addModifier(f.Fingering({ number: '4', position: 'right' }), 1)
        .addModifier(f.StringNumber({ number: '4', position: 'right' }).setOffsetY(6), 1)
        .addModifier(f.Fingering({ number: '1', position: 'right' }).setOffsetY(-6), 2)
        .addModifier(f.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6), 2);
    const voice2 = score.voice(notes2);
    f.Formatter().joinVoices([voice2]).formatToStave([voice2], stave2);
    f.draw();
    options.assert.ok(true, 'String Number');
}
function multi(options) {
    const f = VexFlowTests.makeFactory(options, 700, 200);
    const score = f.EasyScore();
    const stave = f.Stave();
    const notes1 = score.notes('(c4 e4 g4)/4, (a3 e4 g4), (c4 d4 a4), (c4 d4 a4)', { stem: 'up' });
    notes1[0]
        .addStroke(0, new Stroke(5))
        .addModifier(f.Fingering({ number: '3', position: 'left' }), 0)
        .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
        .addModifier(f.Fingering({ number: '0', position: 'left' }), 2)
        .addModifier(f.StringNumber({ number: '4', position: 'left' }), 1)
        .addModifier(f.StringNumber({ number: '3', position: 'above' }), 2);
    notes1[1]
        .addStroke(0, new Stroke(6))
        .addModifier(f.StringNumber({ number: '4', position: 'right' }), 1)
        .addModifier(f.StringNumber({ number: '3', position: 'above' }), 2)
        .addModifier(f.Accidental({ type: '#' }), 0)
        .addModifier(f.Accidental({ type: '#' }), 1)
        .addModifier(f.Accidental({ type: '#' }), 2);
    notes1[2]
        .addStroke(0, new Stroke(2))
        .addModifier(f.Fingering({ number: '3', position: 'left' }), 0)
        .addModifier(f.Fingering({ number: '0', position: 'right' }), 1)
        .addModifier(f.StringNumber({ number: '4', position: 'right' }), 1)
        .addModifier(f.Fingering({ number: '1', position: 'left' }), 2)
        .addModifier(f.StringNumber({ number: '3', position: 'right' }), 2);
    notes1[3]
        .addStroke(0, new Stroke(1))
        .addModifier(f.StringNumber({ number: '3', position: 'left' }), 2)
        .addModifier(f.StringNumber({ number: '4', position: 'right' }), 1);
    const notes2 = score.notes('e3/8, e3, e3, e3, e3, e3, e3, e3', { stem: 'down' });
    notes2[0]
        .addModifier(f.Fingering({ number: '0', position: 'left' }), 0)
        .addModifier(f.StringNumber({ number: '6', position: 'below' }), 0);
    notes2[2].addModifier(f.Accidental({ type: '#' }), 0);
    notes2[4].addModifier(f.Fingering({ number: '0', position: 'left' }), 0);
    notes2[4].addModifier(f.StringNumber({ number: '6', position: 'left' }).setOffsetX(15).setOffsetY(18), 0);
    const voices = [score.voice(notes2), score.voice(notes1)];
    f.Formatter().joinVoices(voices).formatToStave(voices, stave);
    f.Beam({ notes: notes2.slice(0, 4) });
    f.Beam({ notes: notes2.slice(4, 8) });
    f.draw();
    options.assert.ok(true, 'Strokes Test Multi Voice');
}
function drawAccidentals(options) {
    const f = VexFlowTests.makeFactory(options, 750);
    const glyphScale = 39;
    const clefWidth = Glyph.getWidth('gClef', glyphScale);
    const notes = [
        f.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'c/5', 'e/5', 'g/5'], stem_direction: 1, duration: '4' }),
        f.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'd/5', 'e/5', 'g/5'], stem_direction: 1, duration: '4' }),
        f.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'd/5', 'e/5', 'g/5'], stem_direction: -1, duration: '4' }),
        f.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'd/5', 'e/5', 'g/5'], stem_direction: -1, duration: '4' }),
    ];
    notes[0]
        .addModifier(f.Fingering({ number: '3', position: 'left' }), 0)
        .addModifier(f.Accidental({ type: '#' }), 0)
        .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
        .addModifier(f.StringNumber({ number: '2', position: 'left' }), 1)
        .addModifier(f.Accidental({ type: '#' }), 1)
        .addModifier(f.Fingering({ number: '0', position: 'left' }), 2)
        .addModifier(f.Accidental({ type: '#' }), 2)
        .addModifier(f.Fingering({ number: '3', position: 'left' }), 3)
        .addModifier(f.Accidental({ type: '#' }), 3)
        .addModifier(f.Fingering({ number: '2', position: 'right' }), 4)
        .addModifier(f.StringNumber({ number: '3', position: 'right' }), 4)
        .addModifier(f.Accidental({ type: '#' }), 4)
        .addModifier(f.Fingering({ number: '0', position: 'left' }), 5)
        .addModifier(f.Accidental({ type: '#' }), 5);
    notes[1]
        .addModifier(f.Accidental({ type: '#' }), 0)
        .addModifier(f.Accidental({ type: '#' }), 1)
        .addModifier(f.Accidental({ type: '#' }), 2)
        .addModifier(f.Accidental({ type: '#' }), 3)
        .addModifier(f.Accidental({ type: '#' }), 4)
        .addModifier(f.Accidental({ type: '#' }), 5);
    notes[2]
        .addModifier(f.Fingering({ number: '3', position: 'left' }), 0)
        .addModifier(f.Accidental({ type: '#' }), 0)
        .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
        .addModifier(f.StringNumber({ number: '2', position: 'left' }), 1)
        .addModifier(f.Accidental({ type: '#' }), 1)
        .addModifier(f.Fingering({ number: '0', position: 'left' }), 2)
        .addModifier(f.Accidental({ type: '#' }), 2)
        .addModifier(f.Fingering({ number: '3', position: 'left' }), 3)
        .addModifier(f.Accidental({ type: '#' }), 3)
        .addModifier(f.Fingering({ number: '2', position: 'right' }), 4)
        .addModifier(f.StringNumber({ number: '3', position: 'right' }), 4)
        .addModifier(f.Accidental({ type: '#' }), 4)
        .addModifier(f.Fingering({ number: '0', position: 'left' }), 5)
        .addModifier(f.Accidental({ type: '#' }), 5);
    notes[3]
        .addModifier(f.Accidental({ type: '#' }), 0)
        .addModifier(f.Accidental({ type: '#' }), 1)
        .addModifier(f.Accidental({ type: '#' }), 2)
        .addModifier(f.Accidental({ type: '#' }), 3)
        .addModifier(f.Accidental({ type: '#' }), 4)
        .addModifier(f.Accidental({ type: '#' }), 5);
    const voice = f.Voice().addTickables(notes);
    const ctx = f.getContext();
    const formatter = f.Formatter().joinVoices([voice]);
    const stavePadding = clefWidth + Stave.defaultPadding + 10;
    const nwidth = Math.max(formatter.preCalculateMinTotalWidth([voice]), 490 - stavePadding);
    formatter.format([voice], nwidth);
    const stave = f
        .Stave({ x: 0, y: 0, width: nwidth + stavePadding })
        .setContext(ctx)
        .setEndBarType(BarlineType.DOUBLE)
        .addClef('treble')
        .draw();
    voice.draw(ctx, stave);
    options.assert.ok(true, 'String Number');
}
function shiftedNoteheadMultipleModifiers(options) {
    const f = VexFlowTests.makeFactory(options, 900, 150);
    const score = f.EasyScore();
    score.set({ time: '6/4' });
    const stave = f.Stave({ width: 900 }).setEndBarType(BarlineType.END).addClef('treble');
    const notes = ['A4 B4', 'B4 C5', 'A4 B#4', 'B4 C#5', 'A#4 B#4', 'B#4 C#5']
        .map((keys) => score.notes(`(${keys})/q`))
        .flat();
    notes.forEach((note) => {
        note
            .addModifier(f.StringNumber({ number: '2', position: 'left' }, true), 1)
            .addModifier(f.StringNumber({ number: '2', position: 'right' }, true), 1);
    });
    const voice = score.voice(notes);
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'String Number');
}
VexFlowTests.register(StringNumberTests);
export { StringNumberTests };
