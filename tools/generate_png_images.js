/*
  Run the full VexFlow test suite, grab the generated images, and
  dump them into a local directory as PNG files.

  This meant to be used with the visual regression test system in
  `tools/visual_regression.sh`.
*/
const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html></html>`);
window = dom.window;
document = dom.window.document;

const fs = require('fs');
const [scriptDir, imageDir] = process.argv.slice(2, 4);

// Optional: 3rd argument specifies which font stacks to test.
// For example: 
//   node generate_png_images.js SCRIPT_DIR IMAGE_OUTPUT_DIR --fonts=all
//   node generate_png_images.js SCRIPT_DIR IMAGE_OUTPUT_DIR --fonts=petaluma
//   node generate_png_images.js SCRIPT_DIR IMAGE_OUTPUT_DIR --fonts=bravura,gonville
let fontStacksToTest = ['Bravura'];
if (process.argv.length >= 5) {
  const fontsOption = process.argv[4].toLowerCase();
  if (fontsOption.startsWith('--fonts=')) {
    const fontsList = fontsOption.split('=')[1].split(',');
    if (fontsList.includes('all')) {
      fontStacksToTest = ['Bravura', 'Petaluma', 'Gonville'];
    } else {
      fontStacksToTest = fontsList.map((fontName) => fontName.charAt(0).toUpperCase() + fontName.slice(1));
    }
  }
}

global['Vex'] = require(`${scriptDir}/vexflow-debug.js`);

require(`${scriptDir}/vexflow-tests.js`);

const VF = Vex.Flow;
VF.shims = {
  fs,
  process,
};

// Tell VexFlow that we're outside the browser -- just run
// the Node tests.
VF.Test.RUN_CANVAS_TESTS = false;
VF.Test.RUN_SVG_TESTS = false;
VF.Test.RUN_RAPHAEL_TESTS = false;
VF.Test.RUN_NODE_TESTS = true;
VF.Test.NODE_IMAGEDIR = imageDir;
VF.Test.FONT_STACKS_TO_TEST = fontStacksToTest;

// Create the image directory if it doesn't exist.
fs.mkdirSync(VF.Test.NODE_IMAGEDIR, { recursive: true });

// Run all tests.
VF.Test.run();
