// node import2.mjs
//
// Press a key to advance to the next command. CTRL+C to quit.
// This demo uses await import(...) to load, in sequence:
// - vexflow/core
// - vexflow/font/bravura
// - vexflow/font/gonville
// - vexflow/font/petaluma
// After loading each font, it saves a PNG of the score rendered in that music font.

import { JSDOM } from 'jsdom';
import { default as sharp } from 'sharp';

// Reference to Vex.Flow, assigned in the step1() function.
let VF;

async function waitForKeyPress() {
  process.stdin.setRawMode(true);
  return new Promise((resolve) =>
    process.stdin.once('data', (data) => {
      // Handle CTRL+C.
      const byteArray = [...data];
      if (byteArray.length > 0 && byteArray[0] === 3) {
        console.log('^C');
        process.exit(1);
      }
      process.stdin.setRawMode(false);
      resolve();
    })
  );
}

function getScoreSVG() {
  const { Renderer, Stave, StaveNote, Formatter } = VF;
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="vf"></div><body></html>');

  global.document = dom.window.document;

  // Create an SVG renderer and attach it to the DIV element named "vf".
  const div = document.getElementById('vf');
  const renderer = new Renderer(div, Renderer.Backends.SVG);

  // Configure the rendering context.
  renderer.resize(500, 500);
  const ctx = renderer.getContext();
  ctx.setFillStyle('#ddd');
  ctx.fillRect(0, 0, 500, 500);
  ctx.setFillStyle('#222');

  const stave = new Stave(10, 40, 400);

  stave.addClef('treble').addTimeSignature('4/4');

  const notes = [
    new StaveNote({ keys: ['c/4', 'e/4'], duration: 'h' }),
    new StaveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: 'h' }),
  ];

  stave.setContext(ctx).draw();
  Formatter.FormatAndDraw(ctx, stave, notes);

  const svg = div.innerHTML.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  return svg;
}

async function step0() {
  console.log('Press any key to run the next command. CTRL+C to quit.');
  console.log('\n==================================\n');
  console.log('>>> load vexflow/core ...');

  // Make sure the output folder exists.
  const fs = await import('fs');
  if (!fs.existsSync('./output/')) {
    fs.mkdirSync('./output/');
  }
}

async function step1() {
  const { Flow } = await import('vexflow/core');

  VF = Flow;
  console.log('Loaded VexFlow Version: ', VF.BUILD.VERSION, ' Build: ', VF.BUILD.ID);
  console.log('The music font stack is empty:', VF.getMusicFont());

  console.log('\n==================================\n');
  console.log('>>> Bravura...');
}

async function step2() {
  await VF.fetchMusicFont('Bravura');
  VF.setMusicFont('Bravura');
  console.log('The current music font stack is:', VF.getMusicFont());
  const svg = getScoreSVG();
  sharp(Buffer.from(svg)).toFile('output/score_bravura.png');

  console.log('\n==================================\n');
  console.log('>>> Petaluma...');
}

async function step3() {
  await VF.fetchMusicFont('Petaluma');
  VF.setMusicFont('Petaluma');
  console.log('The current music font stack is:', VF.getMusicFont());
  const svg = getScoreSVG();
  sharp(Buffer.from(svg)).toFile('output/score_petaluma.png');

  console.log('\n==================================\n');
  console.log('>>> Gonville...');
}

async function step4() {
  await VF.fetchMusicFont('Gonville');
  VF.setMusicFont('Gonville');
  console.log('The current music font stack is:', VF.getMusicFont());
  const svg = getScoreSVG();
  sharp(Buffer.from(svg)).toFile('output/score_gonville.png');

  console.log('\n==================================\n');
  console.log('>>> Leland...');
}

async function step5() {
  await VF.fetchMusicFont('Leland');
  VF.setMusicFont('Leland');
  console.log('The current music font stack is:', VF.getMusicFont());
  const svg = getScoreSVG();
  sharp(Buffer.from(svg)).toFile('output/score_leland.png');

  console.log('\n==================================\n');
  console.log('DONE!');
}

async function runAllSteps() {
  await step0();
  await waitForKeyPress();
  await step1();
  await waitForKeyPress();
  await step2();
  await waitForKeyPress();
  await step3();
  await waitForKeyPress();
  await step4();
  await waitForKeyPress();
  await step5();
}

runAllSteps().then(() => process.exit(0));
