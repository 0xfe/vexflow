// Run the full VexFlow test suite, grab the generated images, and
// dump them into a local directory as PNG files.
//
// This meant to be used with the visual regression test system in
// `tools/visual_regression.sh`.

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

const compatMode = {
  mode: null,
  MODES: {
    BackCompat: 'BackCompat',
  },
  fixFileNames: () => {
    if (compatMode.mode !== compatMode.MODES.BackCompat) {
      return;
    }
    // see tests/vexflow_test_helpers.ts:runNodeTestHelper():onlyBravura mode.
    fs.readdirSync(imageDir).forEach((filename) => {
      var matches = filename.match(/(.+)(\.Bravura\.)(png|svg)$/);
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

compatMode.fixFileNames();
