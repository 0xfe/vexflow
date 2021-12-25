// Run a web server from the vexflow/ directory to test workers.
// For example, `npx http-server` and then open http://127.0.0.1:8080/demos/worker/

// Web Workers have an importScripts() method that allows you to load scripts. importScripts(...) is similar to require(...) in Node.js.
importScripts('../../build/cjs/vexflow.js');

onmessage = function (e) {
  const fonts = ['Bravura', 'Gonville', 'Petaluma'];
  const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
  Vex.Flow.setMusicFont(randomFont);

  const { Stave, CanvasContext, BarlineType, StaveNote, Formatter } = Vex.Flow;

  const offscreenCanvas = e.data.canvas;
  const offscreenCtx = offscreenCanvas.getContext('2d');
  const ctx = new CanvasContext(offscreenCtx);
  ctx.scale(3, 3);

  // Render to the OffscreenCavans.
  const stave = new Stave(15, 0, 300);
  stave.setEndBarType(BarlineType.END);
  stave.addClef('treble').setContext(ctx).draw();

  function makeRandomNote(duration = '4') {
    const notes = ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5'];
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    return new StaveNote({ keys: [randomNote], duration: duration, stem_direction: randomNote[2] === '5' ? -1 : +1 });
  }

  const notes = [makeRandomNote('8'), makeRandomNote(), makeRandomNote(), makeRandomNote('8'), makeRandomNote()];
  Formatter.FormatAndDraw(ctx, stave, notes);

  ctx.fillStyle = '#0098BB';
  ctx.fillText(randomFont + ' – vexflow.js bundled with all music fonts.', 5, 15);

  postMessage('VexFlow BUILD: ' + JSON.stringify(Vex.Flow.BUILD));
};
