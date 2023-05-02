// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2021.
// MIT License
//
// OffscreenCanvas Tests

import { VexFlowTests } from './vexflow_test_helpers';

import { CanvasContext } from '../src/canvascontext';
import { Formatter } from '../src/formatter';
import { Stave } from '../src/stave';
import { BarlineType } from '../src/stavebarline';
import { StaveNote } from '../src/stavenote';
import { globalObject } from '../src/util';

const OffscreenCanvasTests = {
  Start(): void {
    // At the time of writing, OffscreenCanvas is still an experimental technology.
    if (globalObject().OffscreenCanvas === undefined) {
      return;
    }

    QUnit.module('OffscreenCanvas');
    QUnit.test('Simple Test', simpleTest);
  },
};

function simpleTest(assert: Assert): void {
  // Create a CanvasContext from an OffscreenCanvas.
  // eslint-disable-next-line
  // @ts-ignore
  const offscreenCanvas = new OffscreenCanvas(550, 200);
  // eslint-disable-next-line
  // @ts-ignore
  const offscreenCtx: OffscreenCanvasRenderingContext2D = offscreenCanvas.getContext('2d');
  if (offscreenCtx == null) {
    throw new Error("Couldn't create offscreen context");
  }
  const ctx = new CanvasContext(offscreenCtx);

  // Render to the OffscreenCavans.
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

  // Copy the contents of the OffscreenCanvas to an HTMLCanvasElement.
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
