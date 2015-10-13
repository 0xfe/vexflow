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
Vex.Flow.Test = require("../build/vexflow-tests.js")
var VF = Vex.Flow;

// Tell VexFlow that we're outside the browser -- just run
// the Node tests.
VF.Test.RUN_CANVAS_TESTS = false;
VF.Test.RUN_SVG_TESTS = false;
VF.Test.RUN_RAPHAEL_TESTS = false;
VF.Test.RUN_NODE_TESTS = true;

// Load the measureText cache to compensate for the lack of
// SVG.getBBox() in jsdom.
measureTextCacheString = require("./measure_text_cache.js").measureTextCacheString;
VF.SVGContext.measureTextCache = JSON.parse(measureTextCacheString);

// Run all tests.
VF.Test.run();