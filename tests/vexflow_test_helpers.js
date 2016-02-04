/**
 * VexFlow Test Support Library
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test = (function() {
  var Test = {
    // Test Options.
    RUN_CANVAS_TESTS: true,
    RUN_SVG_TESTS: true,
    RUN_RAPHAEL_TESTS: false,
    RUN_NODE_TESTS: false,

    // Where images are stored for NodeJS tests.
    NODE_IMAGEDIR: "images",

    // Default font properties for tests.
    Font: {size: 10},

    // Returns a unique ID for a test.
    genID: function() { return VF.Test.genID.ID++; },

    // Run `func` inside a QUnit test for each of the enabled
    // rendering backends.
    runTests: function(name, func, params) {
      if (VF.Test.RUN_CANVAS_TESTS) {
        VF.Test.runCanvasTest(name, func, params);
      }
      if (VF.Test.RUN_SVG_TESTS) {
        VF.Test.runSVGTest(name, func, params);
      }
      if (VF.Test.RUN_RAPHAEL_TESTS) {
        VF.Test.runRaphaelTest(name, func, params);
      }
      if (VF.Test.RUN_NODE_TESTS) {
        VF.Test.runNodeTest(name, func, params);
      }
    },

    // Run `func` inside a QUnit test for each of the enabled
    // rendering backends. These are for interactivity tests, and
    // currently only work with the SVG backend.
    runUITests: function(name, func, params) {
      if (VF.Test.RUN_SVG_TESTS) {
        VF.Test.runSVGTest(name, func, params);
      }
    },

    createTestCanvas: function(canvas_sel_name, test_name) {
      var sel = VF.Test.createTestCanvas.sel;
      var test_div = $('<div></div>').addClass("testcanvas");
      test_div.append($('<div></div>').addClass("name").text(test_name));
      test_div.append($('<canvas></canvas>').addClass("vex-tabdiv").
          attr("id", canvas_sel_name).
          addClass("name").text(name));
      $(sel).append(test_div);
    },

    createTestSVG: function(canvas_sel_name, test_name) {
      var sel = VF.Test.createTestCanvas.sel;
      var test_div = $('<div></div>').addClass("testcanvas");
      test_div.append($('<div></div>').addClass("name").text(test_name));
      test_div.append($('<div></div>').addClass("vex-tabdiv").
          attr("id", canvas_sel_name));
      $(sel).append(test_div);
    },

    resizeCanvas: function(sel, width, height) {
      $("#" + sel).width(width);
      $("#" + sel).attr("width", width);
      $("#" + sel).attr("height", height);
    },

    runCanvasTest: function(name, func, params) {
      QUnit.test(name, function(assert) {
        // console.log("Running test (Canvas):", assert.test.module.name, "--", name);
          var test_canvas_sel = "canvas_" + VF.Test.genID();
          var test_canvas = VF.Test.createTestCanvas(test_canvas_sel,
            assert.test.module.name + " (Canvas): " + name);
          func({
            canvas_sel: test_canvas_sel,
            params: params,
            assert: assert },
            VF.Renderer.getCanvasContext);
        });
    },

    runRaphaelTest: function(name, func, params) {
      QUnit.test(name, function(assert) {
          // console.log("Running test (Raphael):", assert.test.module.name, "--", name);
          var test_canvas_sel = "canvas_" + VF.Test.genID();
          var test_canvas = VF.Test.createTestSVG(test_canvas_sel,
            assert.test.module.name + " (Raphael): " + name);
          func({
            canvas_sel: test_canvas_sel,
            params: params,
            assert: assert },
            VF.Renderer.getRaphaelContext);
        });
    },

    runSVGTest: function(name, func, params) {
      QUnit.test(name, function(assert) {
          // console.log("Running test (SVG):", assert.test.module.name, "--", name);
          var test_canvas_sel = "canvas_" + VF.Test.genID();
          var test_canvas = VF.Test.createTestSVG(test_canvas_sel,
            assert.test.module.name + " (SVG): " + name);
          func({
            canvas_sel: test_canvas_sel,
            params: params,
            assert: assert },
            VF.Renderer.getSVGContext);
        });
    },

    runNodeTest: function(name, func, params) {
      var jsdom = require("jsdom").jsdom;
      var xmldom = require("xmldom");
      var fs = require('fs');
      var path = require('path');
      var process = require('process');

      window = jsdom().defaultView;
      document = window.document;

      // Allows `name` to be used inside file names.
      function sanitizeName(name) {
        return name.replace(/[^a-zA-Z0-9]/g, "_")
      }

      QUnit.test(name, function(assert) {
        var div = document.createElement("div");
        div.setAttribute("id", "canvas_" + VF.Test.genID());

        func({
          canvas_sel: div,
          params: params,
          assert: assert },
          VF.Renderer.getSVGContext);

        if (VF.Renderer.lastContext != null) {
          // If an SVG context was used, then serialize and save its contents to
          // a local file.
          var svgData = new xmldom.XMLSerializer().serializeToString(VF.Renderer.lastContext.svg);

          var moduleName = sanitizeName(QUnit.current_module);
          var testName = sanitizeName(QUnit.current_test);
          var filename = path.resolve(VF.Test.NODE_IMAGEDIR, moduleName + "." + testName + ".svg");
          try {
            fs.writeFileSync(filename, svgData);
          } catch(e) {
            console.log("Can't save file: " + filename + ". Error: " + e);
            process.exit(-1);
          };
          VF.Renderer.lastContext = null;
        }
      });
    },

    plotNoteWidth: VF.Note.plotMetrics,
    plotLegendForNoteWidth: function(ctx, x, y) {
      ctx.save();
      ctx.setFont("Arial", 8, "");

      var spacing = 12;
      var lastY = y;

      function legend(color, text) {
        ctx.beginPath();
        ctx.setStrokeStyle(color)
        ctx.setFillStyle(color)
        ctx.setLineWidth(10);
        ctx.moveTo(x, lastY - 4);
        ctx.lineTo(x + 10, lastY - 4);
        ctx.stroke();

        ctx.setFillStyle("black");
        ctx.fillText(text, x + 15, lastY);
        lastY += spacing;
      }

      legend("green", "Note + Flag")
      legend("red", "Modifiers")
      legend("#999", "Displaced Head")
      legend("#DDD", "Formatter Shift")

      ctx.restore();
    }
  };

  Test.genID.ID = 0;
  Test.createTestCanvas.sel = "#vexflow_testoutput";

  return Test;
})();