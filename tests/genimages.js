/*
 Run a bunch of VexFlow tests, grab the images, and dump them into
 a local directory.

 $ npm install jsdom
 $ npm install xmldom

 $ mkdir images
 $ node genimages.js
*/

var jsdom = require("jsdom").jsdom;
var xmldom = require("xmldom");

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
Vex.Flow.Test = require("./vexflow_test_helpers.js")

// Tell VexFlow that we're outside the browser -- just run
// the Node tests.
Vex.Flow.Test.RUN_CANVAS_TESTS = false;
Vex.Flow.Test.RUN_SVG_TESTS = false;
Vex.Flow.Test.RUN_RAPHAEL_TESTS = false;
Vex.Flow.Test.RUN_NODE_TESTS = true;

// Load the measureText cache to compensate for the lack of
// SVG.getBBox() in jsdom.
measureTextCacheString = require("./measure_text_cache.js").measureTextCacheString;
Vex.Flow.SVGContext.measureTextCache = JSON.parse(measureTextCacheString);

// Load and run tests.
Vex.Flow.Test.Annotation = require("./annotation_tests.js");
Vex.Flow.Test.AutoBeamFormatting = require("./auto_beam_formatting_tests.js");
Vex.Flow.Test.Accidental = require("./accidental_tests.js");
Vex.Flow.Test.Articulation = require("./articulation_tests.js");
Vex.Flow.Test.Beam = require("./beam_tests.js");
Vex.Flow.Test.Bend = require("./bend_tests.js");
Vex.Flow.Test.Clef = require("./clef_tests.js");
Vex.Flow.Test.Curve = require("./curve_tests.js");
Vex.Flow.Test.Dot = require("./dot_tests.js");
Vex.Flow.Test.Annotation.Start();
Vex.Flow.Test.Accidental.Start();
Vex.Flow.Test.AutoBeamFormatting.Start();
Vex.Flow.Test.Articulation.Start();
Vex.Flow.Test.Beam.Start();
Vex.Flow.Test.Bend.Start();
Vex.Flow.Test.Clef.Start();
Vex.Flow.Test.Dot.Start();