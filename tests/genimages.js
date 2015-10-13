/*

 Run a bunch of VexFlow tests, grab the images, and dump them into
 a local directory.

 $ npm install jsdom
 $ npm install xmldom

 $ mkdir images
 $ node genimages.js
*/

Vex = require('../build/vexflow-debug.js')
var jsdom = require("jsdom").jsdom;
var xmldom = require("xmldom");
measureTextCacheString = require("./measure_text_cache.js").measureTextCacheString;

QUnit = {}
QUnit.assertions = {
  ok: function() {return true;},
  equal: function() {return true;}
}

QUnit.module = function(name) {QUnit.current_module = name;}
QUnit.test = function(name, func) {
    QUnit.current_test = name;
    console.log("Running: ", name);
    func(QUnit.assertions);
}

test = QUnit.test;
ok = QUnit.assertions.ok;
equal = QUnit.assertions.equal;

Vex.Flow.Test = require("./vexflow_test_helpers.js")

// Tell VexFlow that we're outside the browser, and to
// use the measureText cache we previously collected.
Vex.Flow.Test.RUN_CANVAS_TESTS = false;
Vex.Flow.Test.RUN_SVG_TESTS = false;
Vex.Flow.Test.RUN_RAPHAEL_TESTS = false;
Vex.Flow.Test.RUN_NODE_TESTS = true;

Vex.Flow.SVGContext.measureTextCache = JSON.parse(measureTextCacheString);

Vex.Flow.Test.Annotation = require("./annotation_tests.js")
Vex.Flow.Test.AutoBeamFormatting = require("./auto_beam_formatting_tests.js")
Vex.Flow.Test.Accidental = require("./accidental_tests.js")
Vex.Flow.Test.Annotation.Start()
Vex.Flow.Test.Accidental.Start()