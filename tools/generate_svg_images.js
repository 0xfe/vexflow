#!/usr/bin/env node

/*
  Run the full VexFlow test suite, grab the generated images, and
  dump them into a local directory as SVG files.

  This meant to be used with the visual regression test system in
  `tools/visual_regression.sh`.

  Quick commandline to convert the SVG files to PNG:
    $ for f in *.svg; do echo $f; rsvg-convert $f `basename $f .svg`.png; done
*/

var jsdom = require("jsdom").jsdom;
var xmldom = require("xmldom");
var path = require("path");
var fs = require("fs");

// Mock out the QUnit stuff, since we don't really care about
// the assertions.
QUnit = {}
QUnit.assertions = {
  ok: function() {return true;},
  equal: function() {return true;},
  expect: function() {return true;}
}

QUnit.module = function(name) {
  console.log("Module:", name);
  QUnit.current_module = name;
}

QUnit.test = function(name, func) {
    QUnit.current_test = name;
    console.log("  Test:", name);
    func(QUnit.assertions);
}

test = QUnit.test;
ok = QUnit.assertions.ok;
equal = QUnit.assertions.equal;
expect = QUnit.assertions.expect;

// Load VexFlow
Vex = require('../build/vexflow-debug.js')
Vex.Flow.Test = require("../build/vexflow-tests.js")
var VF = Vex.Flow;

// Tell VexFlow that we're outside the browser -- just run
// the Node tests.
VF.Test.RUN_CANVAS_TESTS = false;
VF.Test.RUN_SVG_TESTS = false;
VF.Test.RUN_RAPHAEL_TESTS = false;
VF.Test.RUN_NODE_TESTS = true;
VF.Test.NODE_IMAGEDIR = path.resolve(__dirname, '..', 'build', 'images');

// Create the image directory if it doesn't exist.
try {
  fs.accessSync(VF.Test.NODE_IMAGEDIR, fs.R_OK | fs.W_OK);
} catch(e) {
  fs.mkdirSync(VF.Test.NODE_IMAGEDIR);
}

// Run all tests.
VF.Test.run();
