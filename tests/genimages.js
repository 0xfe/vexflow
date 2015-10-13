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
QUnit.module = function(name) {QUnit.current_module = name;}
QUnit.test = function(name, func) {
    QUnit.current_test = name;
    var _assert = function() {}
    console.log("Running: ", name);
    func(_assert);
}

ok = function() {}

Vex.Flow.Test = require("./vexflow_test_helpers.js")

// Tell VexFlow that we're outside the browser, and to
// use the measureText cache we previously collected.
Vex.Flow.Test.isNodeJS = true;
Vex.Flow.SVGContext.measureTextCache = JSON.parse(measureTextCacheString);

Vex.Flow.Test.Annotation = require("./annotation_tests.js")
Vex.Flow.Test.Annotation.Start()