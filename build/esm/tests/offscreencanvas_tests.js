import { VexFlowTests } from './vexflow_test_helpers.js';
import { CanvasContext } from '../src/canvascontext.js';
import { Formatter } from '../src/formatter.js';
import { Stave } from '../src/stave.js';
import { BarlineType } from '../src/stavebarline.js';
import { StaveNote } from '../src/stavenote.js';
import { globalObject } from '../src/util.js';
const OffscreenCanvasTests = {
    Start() {
        if (globalObject().OffscreenCanvas === undefined) {
            return;
        }
        QUnit.module('OffscreenCanvas');
        QUnit.test('Simple Test', simpleTest);
    },
};
function simpleTest(assert) {
    const offscreenCanvas = new OffscreenCanvas(550, 200);
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (offscreenCtx == null) {
        throw new Error("Couldn't create offscreen context");
    }
    const ctx = new CanvasContext(offscreenCtx);
    const stave = new Stave(10, 50, 200);
    stave.setEndBarType(BarlineType.END);
    stave.addClef('treble').setContext(ctx).draw();
    const notes = [
        new StaveNote({ keys: ['c/4'], duration: 'q' }),
        new StaveNote({ keys: ['d/4'], duration: 'q' }),
        new StaveNote({ keys: ['b/4'], duration: 'qr' }),
        new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    const imgBmp = offscreenCanvas.transferToImageBitmap();
    const canvas = document.createElement('canvas');
    canvas.width = offscreenCanvas.width;
    canvas.height = offscreenCanvas.height;
    const canvasCtx = canvas.getContext('2d');
    if (canvasCtx == null) {
        throw new Error("Couldn't create canvas context");
    }
    canvasCtx.drawImage(imgBmp, 0, 0);
    document.body.appendChild(canvas);
    assert.ok(true, 'all pass');
}
VexFlowTests.register(OffscreenCanvasTests);
export { OffscreenCanvasTests };
