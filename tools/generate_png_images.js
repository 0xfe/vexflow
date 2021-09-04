// Run the full VexFlow test suite, grab the generated images, and
// dump them into a local directory as PNG files.
//
// This meant to be used with the visual regression test system in
// `tools/visual_regression.sh`.

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

// When generating PNG images for the visual regression tests,
// we mock out the QUnit methods (since we don't care about assertions).
if (!global.QUnit) {
  const QUMock = {
    assertions: {
      ok: () => true,
      equal: () => true,
      deepEqual: () => true,
      expect: () => true,
      throws: () => true,
      notOk: () => true,
      notEqual: () => true,
      notDeepEqual: () => true,
      strictEqual: () => true,
      notStrictEqual: () => true,
      propEqual: () => true,
    },

    module(name) {
      QUMock.current_module = name;
    },

    // See: https://api.qunitjs.com/QUnit/test/
    test(name, callback) {
      QUMock.current_test = name;
      QUMock.assertions.test.module.name = name;
      // Print out the progress and keep it on a single line.
      process.stdout.write(`\u001B[0G${QUMock.current_module} :: ${name}\u001B[0K`);
      callback(QUMock.assertions);
    },
  };

  global.QUnit = QUMock;
  for (const k in QUMock.assertions) {
    // Make all methods & properties of QUMock.assertions global.
    global[k] = QUMock.assertions[k];
  }
  global.test = QUMock.test;
  // Enable us to pass the name of the module around.
  // See: QUMock.test(...) and VexFlowTests.runWithParams(...)
  QUMock.assertions.test = { module: { name: '' } };
}

if (scriptDir.includes('releases')) {
  // THE OLD WAY loads two JS files.
  // TODO: Remove this block lines 31-37, after the new version has been moved to 'releases/'
  global.Vex = require(`${scriptDir}/vexflow-debug.js`);
  require(`${scriptDir}/vexflow-tests.js`);
  global.Vex.Flow.shims = { fs };
} else {
  // THE NEW WAY loads a single JS file.
  // See: https://github.com/0xfe/vexflow/pull/1074
  // Load from the build/ or reference/ folder.
  global.Vex = require(`${scriptDir}/vexflow-tests.js`);
  global.Vex.Flow.Test.shims = { fs };
}

// Tell VexFlow that we're outside the browser. Just run the Node tests.
const VFT = Vex.Flow.Test;
VFT.RUN_CANVAS_TESTS = false;
VFT.RUN_SVG_TESTS = false;
VFT.RUN_NODE_TESTS = true;
VFT.NODE_IMAGEDIR = imageDir;
VFT.NODE_FONT_STACKS = fontStacksToTest;

// Create the image directory if it doesn't exist.
fs.mkdirSync(VFT.NODE_IMAGEDIR, { recursive: true });

// Run all tests.
VFT.run();
