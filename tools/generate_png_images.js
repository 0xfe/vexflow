/*
  Run the full VexFlow test suite, grab the generated images, and
  dump them into a local directory as PNG files.

  This meant to be used with the visual regression test system in
  `tools/visual_regression.sh`.
*/
const { JSDOM } = require('jsdom');
const fs = require('fs');

const dom = new JSDOM(`<!DOCTYPE html><body><div id="vexflow_testoutput"></div></body>`);
global.window = dom.window;
global.document = dom.window.document;

const [scriptDir, imageDir] = process.argv.slice(2, 4);

// Optional: 3rd argument specifies which font stacks to test. Defaults to all.
// For example:
//   node generate_png_images.js SCRIPT_DIR IMAGE_OUTPUT_DIR --fonts=petaluma
//   node generate_png_images.js SCRIPT_DIR IMAGE_OUTPUT_DIR --fonts=bravura,gonville
const ALL_FONTS = ['Bravura', 'Gonville', 'Petaluma'];
let fontStacksToTest = ALL_FONTS;
if (process.argv.length >= 5) {
  const fontsOption = process.argv[4].toLowerCase();
  if (fontsOption.startsWith('--fonts=')) {
    const fontsList = fontsOption.split('=')[1].split(',');
    fontStacksToTest = fontsList.map((fontName) => fontName.charAt(0).toUpperCase() + fontName.slice(1));
  }
}

if (scriptDir.includes('build')) {
  // THE NEW WAY loads a single JS file.
  global.Vex = require(`${scriptDir}/vexflow-tests.js`);
} else {
  // THE OLD WAY loads two JS files.
  global.Vex = require(`${scriptDir}/vexflow-debug.js`);
  require(`${scriptDir}/vexflow-tests.js`);
}

const VFT = Vex.Flow.Test;

VFT.shims = { fs, process };

// Tell VexFlow that we're outside the browser. Just run the Node tests.
VFT.RUN_CANVAS_TESTS = false;
VFT.RUN_SVG_TESTS = false;
VFT.RUN_NODE_TESTS = true;
VFT.NODE_IMAGEDIR = imageDir;
VFT.NODE_FONT_STACKS = fontStacksToTest;

// Create the image directory if it doesn't exist.
fs.mkdirSync(VFT.NODE_IMAGEDIR, { recursive: true });

// Run all tests.
VFT.run();
