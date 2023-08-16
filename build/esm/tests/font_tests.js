import { VexFlowTests } from './vexflow_test_helpers.js';
import { Accidental } from '../src/accidental.js';
import { Bend } from '../src/bend.js';
import { CanvasContext } from '../src/canvascontext.js';
import { Element } from '../src/element.js';
import { Flow } from '../src/flow.js';
import { Font, FontStyle, FontWeight } from '../src/font.js';
import { PedalMarking } from '../src/pedalmarking.js';
import { StaveNote } from '../src/stavenote.js';
import { TextBracket } from '../src/textbracket.js';
import { TextNote } from '../src/textnote.js';
import { Voice } from '../src/voice.js';
const FontTests = {
    Start() {
        QUnit.module('Font');
        QUnit.test('setFont', setFont);
        QUnit.test('Parsing', fontParsing);
        QUnit.test('Sizes', fontSizes);
        const run = VexFlowTests.runTests;
        run('Set Text Font to Georgia', setTextFontToGeorgia);
        run('Set Music Font to Petaluma', setMusicFontToPetaluma);
    },
};
function setFont(assert) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = new CanvasContext(canvas.getContext('2d'));
    ctx.setFont('PetalumaScript', '100px', 'normal', 'italic');
    assert.equal(ctx.font, 'italic 100px PetalumaScript');
    const voice = new Voice();
    assert.propEqual(voice.fontInfo, Element.TEXT_FONT);
    voice.setFont('bold 32pt Arial');
    const fontInfo = voice.fontInfo;
    assert.equal(fontInfo === null || fontInfo === void 0 ? void 0 : fontInfo.size, '32pt');
    const flat = new Accidental('b');
    assert.equal(flat.textFont, undefined);
    flat.setFont(undefined, undefined, undefined, FontStyle.ITALIC);
    assert.equal(flat.getFont(), 'italic 10pt Arial, sans-serif');
    flat.setFont(undefined, undefined, FontWeight.BOLD, undefined);
    assert.equal(flat.getFont(), 'bold 10pt Arial, sans-serif');
    flat.setFont(undefined, undefined, FontWeight.BOLD, FontStyle.ITALIC);
    assert.equal(flat.getFont(), 'italic bold 10pt Arial, sans-serif');
    flat.setFont(undefined, undefined, FontWeight.BOLD, 'oblique');
    assert.equal(flat.getFont(), 'oblique bold 10pt Arial, sans-serif');
    flat.setFont(undefined, undefined, 'normal', '');
    assert.equal(flat.getFont(), '10pt Arial, sans-serif');
}
function fontParsing(assert) {
    const b = new Bend('1/2', true);
    const bFont = b.fontInfo;
    assert.equal(bFont === null || bFont === void 0 ? void 0 : bFont.family, Font.SANS_SERIF);
    assert.equal(bFont === null || bFont === void 0 ? void 0 : bFont.size, Font.SIZE);
    assert.equal(bFont === null || bFont === void 0 ? void 0 : bFont.weight, FontWeight.NORMAL);
    assert.equal(bFont === null || bFont === void 0 ? void 0 : bFont.style, FontStyle.NORMAL);
    const f1 = 'Roboto Slab, serif';
    const t = new TextNote({ duration: '4', font: { family: f1 } });
    assert.equal(f1, t.fontInfo.family);
    const n1 = new StaveNote({ keys: ['e/5'], duration: '4' });
    const n2 = new StaveNote({ keys: ['c/5'], duration: '4' });
    const tb = new TextBracket({ start: n1, stop: n2 });
    const f2 = tb.fontInfo;
    assert.equal(f2 === null || f2 === void 0 ? void 0 : f2.size, 15);
    assert.equal(f2 === null || f2 === void 0 ? void 0 : f2.style, FontStyle.ITALIC);
    const f3 = Font.fromCSSString(`bold 1.5em/3 "Lucida Sans Typewriter", "Lucida Console", Consolas, monospace`);
    const f3SizeInPx = Font.convertSizeToPixelValue(f3.size);
    assert.equal(f3SizeInPx, 24);
}
function fontSizes(assert) {
    {
        const size = '17px';
        const sizeInEm = Font.convertSizeToPixelValue(size) / Font.scaleToPxFrom.em;
        assert.equal(sizeInEm, 1.0625);
    }
    {
        const size = '2em';
        const sizeInPx = Font.convertSizeToPixelValue(size);
        assert.equal(sizeInPx, 32);
    }
    {
        const pedal = new PedalMarking([]);
        assert.equal(pedal.getFont(), 'italic bold 12pt Times New Roman, serif');
        assert.equal(pedal.fontSizeInPoints, 12);
        assert.equal(pedal.fontSizeInPixels, 16);
        const doubledSizePx = pedal.fontSizeInPixels * 2;
        assert.equal(doubledSizePx, 32);
        const doubledSizePt = Font.scaleSize(pedal.fontSizeInPoints, 2);
        assert.equal(doubledSizePt, 24);
        assert.equal(Font.scaleSize('1.5em', 3), '4.5em');
    }
}
function setTextFontToGeorgia(options) {
    const factory = VexFlowTests.makeFactory(options, 400, 200);
    const stave = factory.Stave({ y: 40 });
    const score = factory.EasyScore();
    const voice1 = score.voice([
        factory.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' }),
        factory.StaveNote({ keys: ['d/4', 'f/4'], stem_direction: -1, duration: 'q' }),
        factory.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: 'q' }),
    ]);
    const defaultFont = TextNote.TEXT_FONT;
    TextNote.TEXT_FONT = {
        family: 'Georgia, Courier New, serif',
        size: 14,
        weight: 'bold',
        style: 'italic',
    };
    const voice2 = score.voice([
        factory
            .TextNote({ text: 'Here are some fun lyrics...', duration: 'w' })
            .setJustification(TextNote.Justification.LEFT),
    ]);
    const formatter = factory.Formatter();
    formatter.joinVoices([voice1, voice2]).formatToStave([voice1, voice2], stave);
    factory.draw();
    TextNote.TEXT_FONT = defaultFont;
    options.assert.ok(true);
}
function setMusicFontToPetaluma(options) {
    Flow.setMusicFont('Petaluma');
    const factory = VexFlowTests.makeFactory(options, 400, 200);
    const stave = factory.Stave({ y: 40 });
    const score = factory.EasyScore();
    const voice = score.voice([
        factory.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' }),
        factory.StaveNote({ keys: ['d/4', 'f/4'], stem_direction: -1, duration: 'q' }),
        factory.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: 'q' }),
    ]);
    const formatter = factory.Formatter();
    formatter.joinVoices([voice]).formatToStave([voice], stave);
    factory.draw();
    options.assert.ok(true);
}
VexFlowTests.register(FontTests);
export { FontTests };
