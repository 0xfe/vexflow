/*
  Run the full VexFlow test suite, grab the generated images, and
  dump them into a local directory as SVG files.

  This meant to be used with the visual regression test system in
  `tools/visual_regression.sh`.

  Quick commandline to convert the SVG files to PNG:
    $ for f in *.svg; do echo $f; rsvg-convert $f `basename $f .svg`.png; done
*/

var fs = require("fs");
var Vex = require('../build/vexflow-debug.js');
Vex.Flow.Test = require("../build/vexflow-tests.js")
var VF = Vex.Flow;

// Tell VexFlow that we're outside the browser -- just run
// the Node tests.
VF.Test.RUN_CANVAS_TESTS = false;
VF.Test.RUN_SVG_TESTS = false;
VF.Test.RUN_RAPHAEL_TESTS = false;
VF.Test.RUN_NODE_TESTS = true;
VF.Test.NODE_IMAGEDIR = './build/images';

// Create the image directory if it doesn't exist.
fs.makeDirectory(VF.Test.NODE_IMAGEDIR);

// Run all tests.
VF.Test.run();

slimer.exit();
