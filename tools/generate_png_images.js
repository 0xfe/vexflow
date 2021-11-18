// Run the full VexFlow test suite, grab the generated images, and
// dump them into a local directory as PNG files.
//
// This meant to be used with the visual regression test system in
// `tools/visual_regression.sh`.

/* eslint-disable no-console */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const { spawn } = require('child_process');

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

/**
 * run tests in parallel.
 *
 *  --parallel[=<jobs>]
 *   <jobs>:
 *    <jobs> <= 1: limit to a single job
 *    otherwise: number of fonts to test jobs
 *
 * For example:
 *   node generate_png_images.js SCRIPT_DIR IMAGE_OUTPUT_DIR --parallel
 *   node generate_png_images.js SCRIPT_DIR IMAGE_OUTPUT_DIR --fonts=bravura,gonville --parallel
 */

const appMain = (onArg) => {
  if (fontStacksToTest.length <= 1 || process.argv.length < 5) {
    return false;
  }

  const pArgv = process.argv;
  const childArgs = {
    argv0: pArgv[0],
    argv: pArgv.slice(1, 4),
  };

  let jobs = 0;
  pArgv.slice(4).forEach((str) => {
    const lStr = str.toLowerCase();
    if (lStr.startsWith('--parallel')) {
      const nameVal = str.split('=');
      if (nameVal.length > 1) {
        jobs = parseInt(nameVal[1]);
      } else {
        jobs = Infinity;
      }
    }
    onArg(lStr);
  });
  if (jobs <= 1) {
    return false;
  }

  let children = [];
  let exitCode = 0;
  const asyncWait = () => {
    const tChildren = [];
    children.forEach((child, idx) => {
      if (child && !child.done) {
        tChildren.push(child);
      }
    });

    if (!tChildren.length) {
      // process.stdout.write('finish');
      exit(exitCode);
    }
    children = tChildren;
  };

  const run = (font, id) => {
    let child;
    const { argv0, argv } = childArgs;
    const childArgv = [...argv, `--fonts=${font}`];
    try {
      child = spawn(argv0, childArgv);
      process.stdout.write(`[${id}]:${font}:${childArgv} started\n`);
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });
      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
      child.on('close', (code) => {
        process.stdout.write(`\n[${id}]:${font}: exited with code ${code}\n`);
        child.done = true;
        exitCode = code | exitCode;
        asyncWait(code);
      });
    } catch (e) {
      process.stderr.write(e);
    }
    return child;
  };

  // TODO: limit the number of processes to specified number(jobs).
  // console.log(jobs);
  fontStacksToTest.forEach((font, idx) => {
    children.push(run(font, idx));
  });

  // FIXME: need timeout detection?
  // setInterval(wait, 1000);
  return true;
};

// Produce filenames that match version 3.0.9.
// Remove `.Bravura` from the filename.
const compatMode = {
  mode: null,
  MODES: {
    BackCompat: 'BackCompat',
  },
  fixFileNames: () => {
    if (compatMode.mode !== compatMode.MODES.BackCompat) {
      return;
    }
    // If we are only testing the Bravura font, do not include the font name in the file name.
    // See tests/vexflow_test_helpers.ts / runNodeTestHelper() / onlyBravura mode.
    fs.readdirSync(imageDir).forEach((filename) => {
      const matches = filename.match(/(.+)(\.Bravura\.)(png|svg)$/);
      if (matches && matches[2]) {
        const backCompatFileName = `${matches[1]}.${matches[3]}`;
        fs.renameSync(path.join(imageDir, filename), path.join(imageDir, backCompatFileName));
        process.stdout.write(`${imageDir}: ${filename} -> ${backCompatFileName}\n`);
      }
    });
  },
};

if (
  appMain((lStr) => {
    if (!lStr.startsWith('--backcompat')) {
      return;
    }
    compatMode.mode = compatMode.MODES.BackCompat;
  })
) {
  return;
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
  // Version 4.0.0.
  global.Vex = require(vexflowDebugWithTestsJS);
} else {
  console.log('Generating Images for version <= 3.0.9');
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
VFT.run();

// During the 3.0.9 => 4.0.0 migration, run() was briefly renamed to runTests().
// VFT.runTests();

compatMode.fixFileNames();
