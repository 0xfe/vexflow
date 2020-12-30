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

const Vex = require(`${ scriptDir }/vexflow-debug.js`);
Vex.Flow.Test = require(`${ scriptDir }/vexflow-tests.js`);

const VF = Vex.Flow;

// Tell VexFlow that we're outside the browser -- just run
// the Node tests.
VF.Test.RUN_CANVAS_TESTS = false;
VF.Test.RUN_SVG_TESTS = false;
VF.Test.RUN_RAPHAEL_TESTS = false;
VF.Test.RUN_NODE_TESTS = true;
VF.Test.NODE_IMAGEDIR = imageDir;

// Create the image directory if it doesn't exist.
fs.mkdirSync(VF.Test.NODE_IMAGEDIR, { recursive: true });

// Run all tests.
VF.Test.run();
