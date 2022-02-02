// Run the full VexFlow test suite, grab the generated images, and
// dump them into a local directory as PNG files.
//
// This meant to be used with the visual regression test system in
// `tools/visual_regression.sh`.

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html><body><div id="vexflow_testoutput"></div></body>`);
global.window = dom.window;
global.document = dom.window.document;

const [scriptDir, imageDir] = process.argv.slice(2, 4);

const runOptions = {
  jobs: 1,
  job: 0,
};
// Optional:
//  --fonts argument specifies which font stacks to test. Defaults to all.
//  --jobs, --job: see tests/vexflow_test_helpers.ts: VexFlowTests.run()
// For example:
//   node generate_png_images.js SCRIPT_DIR IMAGE_OUTPUT_DIR --fonts=petaluma
//   node generate_png_images.js SCRIPT_DIR IMAGE_OUTPUT_DIR --fonts=bravura,gonville
const ALL_FONTS = ['Bravura', 'Gonville', 'Petaluma'];
let fontStacksToTest = ALL_FONTS;
const { argv } = process;

if (argv.length >= 5) {
  for (let i = 4; i < argv.length; i++) {
    const arg = argv[i].toLowerCase();
    const value = arg.split('=')[1];
    const intValue = parseInt(value);
    if (arg.startsWith('--fonts=')) {
      const fontsList = value.split(',');
      fontStacksToTest = fontsList.map((fontName) => fontName.charAt(0).toUpperCase() + fontName.slice(1));
    } else if (arg.startsWith('--jobs=')) {
      runOptions.jobs = intValue;
    } else if (arg.startsWith('--job=')) {
      runOptions.job = intValue;
    } else {
      // console.log('???', arg);
    }
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

// The entry point to the VexFlow tests has evolved over time. :-)
// In 3.0.9, vexflow-tests.js contained only the test code. The core library was in vexflow-debug.js.
// While migrating to TypeScript in 2021, we realized the vexflow-tests.js included the core library.
//   Thus, only vexflow-tests.js is used (and vexflow-debug.js is redundant).
//   See: https://github.com/0xfe/vexflow/pull/1074
// In 4.0.0, this file was renamed to vexflow-debug-with-tests.js for clarity.
//   It includes both the VexFlow library and the test code.
// We use file detection to determine which file(s) to include.
const vexflowDebugWithTestsJS = path.join(scriptDir, 'vexflow-debug-with-tests.js');
if (fs.existsSync(path.resolve(__dirname, vexflowDebugWithTestsJS))) {
  // console.log('Generating Images for version >= 4.0.0');
  global.Vex = require(vexflowDebugWithTestsJS);
} else {
  // console.log('Generating Images for version <= 3.0.9');
  const vexflowTests = require(path.join(scriptDir, 'vexflow-tests.js'));
  if (typeof vexflowTests.Flow === 'object') {
    // During the migration of 3.0.9 => 4.0.0.
    // vexflowTests has all we need!
    global.Vex = vexflowTests;
  } else {
    // typeof vexflowTests.Flow === 'undefined'
    // Version 3.0.9 and older used vexflow-tests.js in combination with vexflow-debug.js!
    global.Vex = require(path.join(scriptDir, 'vexflow-debug.js'));
  }
}

// Some versions of VexFlow (during the 3.0.9 => 4.0.0 migration) may have required the next line:
// global.Vex.Flow.shims = { fs };

// 4.0.0
// vexflow_test_helpers uses this to write out image files.
global.Vex.Flow.Test.shims = { fs };

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
VFT.run(runOptions);

// During the 3.0.9 => 4.0.0 migration, run() was briefly renamed to runTests().
// VFT.runTests();
