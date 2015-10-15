/**
 * VexFlow 1.2.36 built on 2015-10-15.
 * Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>
 *
 * http://www.vexflow.com  http://github.com/0xfe/vexflow
 */
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
/**
 * VexFlow - TickContext Mocks
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

/* Mock Tickable */
VF.Test.MockTickable = (function() {
  function MockTickable() {
    this.ignore_ticks = false;
  }
  MockTickable.prototype = {
    init: function() {},
    getX: function() {return this.tickContext.getX();},
    getIntrinsicTicks: function() {return this.ticks;},
    getTicks: function() {return this.ticks;},
    setTicks: function(t) {this.ticks = new VF.Fraction(t, 1); return this; },
    getMetrics: function() {
      return { noteWidth: this.width,
               left_shift: 0,
               modLeftPx: 0, modRightPx: 0,
               extraLeftPx: 0, extraRightPx: 0 };
    },
    getWidth: function() {return this.width;},
    setWidth: function(w) {this.width = w; return this; },
    setVoice: function(v) {this.voice = v; return this; },
    setStave: function(stave) {this.stave = stave; return this; },
    setTickContext: function(tc) {this.tickContext = tc; return this; },
    setIgnoreTicks: function(ignore_ticks) {this.ignore_ticks = ignore_ticks; return this; },
    shouldIgnoreTicks: function() {return this.ignore_ticks; },
    preFormat: function() {}
  };

  return MockTickable;
})();
// There is corrently no good way to measure the text dimensions of
// SVG elements from NodeJS/jsdom. So we resort to collecting the measurements
// of all the text inside tests in a browser run, index them by font, size, weight,
// style, and dump them to this file.
//
// Since we're only doing this for visual regression tests, we don't have to worry
// about unexpected text or fonts.
//
// To refresh:
//
// 1) Set VF.SVGContext.collectMeasurements to "true" in tests/flow.html.
// 2) Open tests/flow.html in browser.
// 3) Pullup javascript console.
// 4) Copy the output of "JSON.stringify(Vex.Flow.SVGContext.measureTextCache)"
// 5) Replace string below.
// 6) Remove VF.SVGContext.collectMeasurements back to false in tests/flow.html.

VF.Test.measureTextCache = {"Anormalsans-serifbold12pt":{"x":135,"y":75,"width":11.546875,"height":18},"Bnormalsans-serifbold12pt":{"x":495,"y":75,"width":11.546875,"height":18},"1normalsans-serifnormal8pt":{"x":135,"y":79,"width":5.921875,"height":12},"2normalsans-serifnormal8pt":{"x":195,"y":79,"width":5.921875,"height":12},"3normalsans-serifnormal8pt":{"x":195,"y":14,"width":5.921875,"height":12},"4normalsans-serifnormal8pt":{"x":255,"y":14,"width":5.921875,"height":12},"5normalsans-serifnormal8pt":{"x":315,"y":14,"width":5.921875,"height":12},"6normalsans-serifnormal8pt":{"x":375,"y":14,"width":5.921875,"height":12},"7normalsans-serifnormal8pt":{"x":495,"y":79,"width":5.921875,"height":12},"D.S. alitalictimesbold12pt":{"x":555,"y":75,"width":44.890625,"height":18},"8normalsans-serifnormal8pt":{"x":555,"y":79,"width":5.921875,"height":12},"Codaitalictimesbold12pt":{"x":698,"y":75,"width":34.671875,"height":18},"9normalsans-serifnormal8pt":{"x":698,"y":79,"width":5.921875,"height":12},"Andantenormaltimesbold14pt":{"x":680,"y":72,"width":68.421875,"height":22},"Andante graziosonormaltimesbold14pt":{"x":680,"y":222,"width":139.421875,"height":22},"Violinnormaltimesnormal16pt":{"x":450,"y":30,"width":54.5,"height":24},"Right Textnormaltimesnormal16pt":{"x":600,"y":60,"width":91.828125,"height":24},"Above Textnormaltimesnormal16pt":{"x":600,"y":60,"width":101.28125,"height":24},"Below Textnormaltimesnormal16pt":{"x":600,"y":30,"width":100.09375,"height":24},"2nd linenormaltimesnormal16pt":{"x":600,"y":60,"width":69.296875,"height":24},"Left Below Textnormaltimesnormal16pt":{"x":600,"y":60,"width":140.953125,"height":24},"Right Below Textnormaltimesnormal16pt":{"x":600,"y":60,"width":152.84375,"height":24},"Whole measure restnormalArialnormal10pt":{"x":360,"y":37,"width":119.265625,"height":15},"mnormalArialnormal10pt":{"x":560,"y":49,"width":11.09375,"height":15},"TestnormalArialnormal10pt":{"x":217.96875,"y":88,"width":25.921875,"height":15},"4normalsans-serifbold10pt":{"x":390.75,"y":63,"width":7.40625,"height":15},"6normalArialnormal10pt":{"x":162.203125,"y":395.28125,"width":7.40625,"height":15.546875},"25normalArialnormal10pt":{"x":560,"y":49,"width":14.8125,"height":15},"15normalArialnormal10pt":{"x":560,"y":49,"width":14.8125,"height":15},"5normalArialnormal10pt":{"x":162.203125,"y":395.28125,"width":7.40625,"height":15.546875},"10normalArialnormal10pt":{"x":560,"y":49,"width":14.8125,"height":15},"12normalArialnormal10pt":{"x":560,"y":49,"width":14.8125,"height":15},"0normalArialnormal10pt":{"x":186.953125,"y":157.5,"width":7.40625,"height":15},"4normalArialnormal10pt":{"x":450,"y":48.78125,"width":7.40625,"height":15.546875},"3normalArialnormal10pt":{"x":253.203125,"y":43,"width":7.40625,"height":15},"6normalsans-serifbold10pt":{"x":273.5,"y":108,"width":7.40625,"height":15},"25normalsans-serifbold10pt":{"x":560,"y":69,"width":14.8125,"height":15},"10normalsans-serifbold10pt":{"x":560,"y":69,"width":14.8125,"height":15},"12normalsans-serifbold10pt":{"x":560,"y":69,"width":14.8125,"height":15},"5normalsans-serifbold10pt":{"x":539.828125,"y":128,"width":7.40625,"height":15},"6normalArialbold10pt":{"x":560,"y":49,"width":7.40625,"height":15},"25normalArialbold10pt":{"x":560,"y":49,"width":14.8125,"height":15},"10normalArialbold10pt":{"x":560,"y":49,"width":14.8125,"height":15},"12normalArialbold10pt":{"x":560,"y":49,"width":14.8125,"height":15},"5normalArialbold10pt":{"x":560,"y":49,"width":7.40625,"height":15},"9normalArialnormal10pt":{"x":460,"y":49,"width":7.40625,"height":14.65625},"FullnormalArialnormal10pt":{"x":377.078125,"y":267.78125,"width":21.453125,"height":15.546875},"1/2normalArialnormal10pt":{"x":460,"y":48.703125,"width":18.53125,"height":15.375},"1/4normalArialnormal10pt":{"x":560,"y":49,"width":18.515625,"height":15},"7normalArialnormal10pt":{"x":162.203125,"y":395.28125,"width":7.40625,"height":15.546875},"MonstrousnormalArialnormal10pt":{"x":560,"y":49,"width":62.21875,"height":15},"normalArialnormal10pt":{"x":0,"y":0,"width":0,"height":0},"UnisonnormalArialnormal10pt":{"x":74.453125,"y":388.78125,"width":41.46875,"height":15.546875},"slow.normalArialnormal10pt":{"x":46,"y":87.78125,"width":30.34375,"height":15.546875},"HnormalArialnormal10pt":{"x":450,"y":49,"width":9.625,"height":15},"AnnotationnormalArialnormal10pt":{"x":360,"y":49,"width":63.734375,"height":15},"14normalArialnormal10pt":{"x":450,"y":48.78125,"width":14.8125,"height":15.546875},"16normalArialnormal10pt":{"x":450,"y":48.78125,"width":14.8125,"height":15.546875},"PnormalArialnormal10pt":{"x":450,"y":49,"width":8.890625,"height":15},"TnormalArialnormal10pt":{"x":460,"y":49,"width":8.140625,"height":14.65625},"sl.normalArialnormal10pt":{"x":450,"y":48.78125,"width":13.3125,"height":15.546875},"1normalArialnormal10pt":{"x":186.953125,"y":157.5,"width":7.40625,"height":15},"quietitalicTimesnormal10pt":{"x":63.453125,"y":88,"width":26.65625,"height":15.328125},"mitalicTimesnormal10pt":{"x":460,"y":49,"width":9.625,"height":15.328125},"AllegroitalicTimesnormal10pt":{"x":261.21875,"y":88,"width":39.984375,"height":15.328125},"Harm.normalArialnormal10pt":{"x":460,"y":49,"width":36.28125,"height":14.65625},"(8va)italicTimesnormal10pt":{"x":460,"y":49,"width":28.125,"height":15.328125},"A.H.normalArialnormal10pt":{"x":460,"y":49,"width":25.921875,"height":14.65625},"2normalArialnormal10pt":{"x":377.078125,"y":267.78125,"width":7.40625,"height":15.546875},"pitalicTimesnormal10pt":{"x":460,"y":49,"width":6.65625,"height":15.328125},"iitalicTimesnormal10pt":{"x":460,"y":49,"width":3.703125,"height":15.328125},"aitalicTimesnormal10pt":{"x":460,"y":49,"width":6.65625,"height":15.328125},"FnormalTimesnormal10pt":{"x":310,"y":37,"width":7.40625,"height":15.328125},"mnormalTimesnormal10pt":{"x":310,"y":37,"width":10.359375,"height":15.328125},"AnormalTimesnormal10pt":{"x":310,"y":37,"width":9.625,"height":15.328125},"CnormalTimesnormal10pt":{"x":310,"y":37,"width":8.890625,"height":15.328125},"EnormalTimesnormal10pt":{"x":310,"y":37,"width":8.140625,"height":15.328125},"goodnormalArialnormal10pt":{"x":60.453125,"y":98,"width":29.65625,"height":14.65625},"evennormalArialnormal10pt":{"x":127.84375,"y":98,"width":28.90625,"height":14.65625},"undernormalArialnormal10pt":{"x":191.21875,"y":88,"width":34.09375,"height":14.65625},"beamnormalArialnormal10pt":{"x":191.21875,"y":88,"width":33.34375,"height":14.65625},"TextnormalArialnormal10pt":{"x":560,"y":49,"width":25.921875,"height":15},"Pianonormaltimesnormal16pt":{"x":145,"y":120,"width":48.578125,"height":24},"Celestanormaltimesnormal16pt":{"x":145,"y":296,"width":62.78125,"height":24},"Harpsichordnormaltimesnormal16pt":{"x":145,"y":296,"width":105.421875,"height":24},"<normalundefinednormalundefinedpt":{"x":40.359375,"y":24.453125,"width":10.140625,"height":20},"mnormalundefinednormalundefinedpt":{"x":40.359375,"y":24.453125,"width":14,"height":20},"LnormalArialnormal12pt":{"x":568,"y":34.5625,"width":8.890625,"height":17.765625},"mnormalArialnormal12pt":{"x":568,"y":34.5625,"width":13.3125,"height":17.765625},"RnormalArialnormal12pt":{"x":568,"y":34.5625,"width":11.546875,"height":17.765625},"C7normalTimesnormal12pt":{"x":310,"y":55,"width":18.671875,"height":18},"mnormalTimesnormal12pt":{"x":530,"y":55,"width":12.4375,"height":18},"FnormalTimesnormal12pt":{"x":530,"y":55,"width":8.890625,"height":18},"C7normalTimesnormal13pt":{"x":310,"y":53,"width":20.21875,"height":20},"mnormalTimesnormal13pt":{"x":310,"y":53,"width":13.46875,"height":20},"3normalsans-serifbold10pt":{"x":316.21875,"y":128,"width":7.40625,"height":15},"2normalsans-serifbold10pt":{"x":316.21875,"y":128,"width":7.40625,"height":15},"MnormalArialnormal12pt":{"x":548.15625,"y":95.5625,"width":13.3125,"height":17.765625},"Default Rest PositionsnormalArialnormal12pt":{"x":443.703125,"y":96,"width":157.40625,"height":17},"Rests Repositioned To Avoid CollisionsnormalArialnormal12pt":{"x":869.25,"y":96,"width":279.234375,"height":17},"normalArialnormal12pt":{"x":0,"y":0,"width":0,"height":0},"Center JustificationnormalArialnormal10pt":{"x":410,"y":36.78125,"width":113.28125,"height":15.546875},"Left Line 1normalArialnormal10pt":{"x":410,"y":36.78125,"width":62.21875,"height":15.546875},"RightnormalArialnormal10pt":{"x":573.859375,"y":88,"width":31.109375,"height":15},"Center JustificationnormalArialnormal12pt":{"x":330.46875,"y":85.5625,"width":136.046875,"height":17.765625},"Left Line 1normalArialnormal12pt":{"x":330.46875,"y":85.5625,"width":74.71875,"height":17.765625},"RightnormalArialnormal12pt":{"x":330.46875,"y":85.5625,"width":37.34375,"height":17.765625},"Ã¢â„¢Â­InormalArialnormal10pt":{"x":510,"y":37,"width":17.03125,"height":15},"DÃ¢â„¢Â¯/FnormalArialnormal10pt":{"x":510,"y":37,"width":28.125,"height":15},"iinormalArialnormal10pt":{"x":510,"y":37,"width":5.921875,"height":15},"CnormalArialnormal10pt":{"x":510,"y":37,"width":9.625,"height":15},"viinormalArialnormal10pt":{"x":510,"y":37,"width":12.578125,"height":15},"VnormalArialnormal10pt":{"x":510,"y":37,"width":8.890625,"height":15},"MnormalSerifnormal15pt":{"x":401.84375,"y":82,"width":17.78125,"height":23},"Ã¢â„¢Â­InormalSerifnormal15pt":{"x":401.84375,"y":82,"width":26.65625,"height":23},"DÃ¢â„¢Â¯/FnormalSerifnormal15pt":{"x":401.84375,"y":82,"width":51.109375,"height":23},"iinormalSerifnormal15pt":{"x":401.84375,"y":82,"width":11.109375,"height":23},"CnormalSerifnormal15pt":{"x":401.84375,"y":82,"width":13.328125,"height":23},"viinormalSerifnormal15pt":{"x":401.84375,"y":82,"width":21.109375,"height":23},"VnormalSerifnormal15pt":{"x":401.84375,"y":82,"width":14.4375,"height":23},"CenternormalArialnormal10pt":{"x":573.859375,"y":88,"width":40,"height":15},"CenternormalArialnormal12pt":{"x":548.15625,"y":95.5625,"width":48.015625,"height":17.765625},"gliss.normalArialnormal10pt":{"x":303.71875,"y":88,"width":30.359375,"height":15},"LeftnormalArialnormal10pt":{"x":573.859375,"y":88,"width":22.21875,"height":15},"TopnormalArialnormal10pt":{"x":573.859375,"y":88,"width":22.96875,"height":15},"una cordaitalicTimes New Romanbold12pt":{"x":450.25,"y":86,"width":67.125,"height":17},"tre cordaitalicTimes New Romanbold12pt":{"x":450.25,"y":86,"width":59.09375,"height":17},"Sost. Ped.italicTimes New Romanbold12pt":{"x":450.25,"y":86,"width":64.4375,"height":17},"15italicSerifnormal15pt":{"x":431.359375,"y":112,"width":20,"height":23},"MitalicSerifnormal15pt":{"x":456.890625,"y":112,"width":16.65625,"height":23},"vaitalicSerifnormal10.714285714285715pt":{"x":431.359375,"y":117,"width":13.46875,"height":17},"MitalicSerifnormal10.714285714285715pt":{"x":456.890625,"y":117,"width":11.890625,"height":17},"8italicSerifnormal15pt":{"x":431.359375,"y":112,"width":10,"height":23},"vbitalicSerifnormal10.714285714285715pt":{"x":431.359375,"y":117,"width":13.46875,"height":17},"Cool notesitalicSerifnormal15pt":{"x":456.890625,"y":112,"width":86.109375,"height":23},"italicSerifnormal10.714285714285715pt":{"x":0,"y":0,"width":0,"height":0},"Not cool notesitalicSerifnormal15pt":{"x":456.890625,"y":112,"width":115.546875,"height":23}," super uncoolitalicSerifnormal10.714285714285715pt":{"x":456.890625,"y":117,"width":74.15625,"height":17},"TestingnormalArialnormal15pt":{"x":456.890625,"y":112,"width":65.578125,"height":22},"MnormalArialnormal15pt":{"x":456.890625,"y":112,"width":16.65625,"height":22},"superscriptnormalArialnormal10.714285714285715pt":{"x":456.890625,"y":117,"width":69.828125,"height":16},"MnormalArialnormal10.714285714285715pt":{"x":456.890625,"y":117,"width":11.890625,"height":16},"8italicSerifnormal30pt":{"x":456.890625,"y":94,"width":20,"height":46},"MitalicSerifnormal30pt":{"x":456.890625,"y":94,"width":33.3125,"height":46},"vbitalicSerifnormal21.42857142857143pt":{"x":456.890625,"y":105,"width":26.953125,"height":32},"MitalicSerifnormal21.42857142857143pt":{"x":456.890625,"y":105,"width":23.796875,"height":32},"â™­InormalArialnormal10pt":{"x":510,"y":37,"width":17.03125,"height":15},"Dâ™¯/FnormalArialnormal10pt":{"x":510,"y":37,"width":28.125,"height":15},"â™­InormalSerifnormal15pt":{"x":401.84375,"y":82,"width":26.65625,"height":23},"Dâ™¯/FnormalSerifnormal15pt":{"x":401.84375,"y":82,"width":51.109375,"height":23},"♭InormalArialnormal10pt":{"x":510,"y":37,"width":17.03125,"height":15},"D♯/FnormalArialnormal10pt":{"x":510,"y":37,"width":28.125,"height":15},"♭InormalSerifnormal15pt":{"x":401.84375,"y":82,"width":26.65625,"height":23},"D♯/FnormalSerifnormal15pt":{"x":401.84375,"y":82,"width":51.109375,"height":23}}
/**
 * VexFlow - Accidental Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Accidental = (function() {
  function hasAccidental(note) {
    return note.modifiers.reduce(function(hasAcc, modifier) {
      if (hasAcc) return hasAcc;

      return modifier.getCategory() === "accidentals";
    }, false);
  }

  Accidental = {
    Start: function() {
      QUnit.module("Accidental");
      Vex.Flow.Test.runTests("Basic", Vex.Flow.Test.Accidental.basic);
      Vex.Flow.Test.runTests("Stem Down", Vex.Flow.Test.Accidental.basicStemDown);
      Vex.Flow.Test.runTests("Accidental Arrangement Special Cases", Vex.Flow.Test.Accidental.specialCases);
      Vex.Flow.Test.runTests("Multi Voice", Vex.Flow.Test.Accidental.multiVoice);
      Vex.Flow.Test.runTests("Microtonal", Vex.Flow.Test.Accidental.microtonal);
      test("Automatic Accidentals - Simple Tests", Vex.Flow.Test.Accidental.autoAccidentalWorking);
      Vex.Flow.Test.runTests("Automatic Accidentals", Vex.Flow.Test.Accidental.automaticAccidentals0);
      Vex.Flow.Test.runTests("Automatic Accidentals - C major scale in Ab", Vex.Flow.Test.Accidental.automaticAccidentals1);
      Vex.Flow.Test.runTests("Automatic Accidentals - No Accidentals Necsesary", Vex.Flow.Test.Accidental.automaticAccidentals2);
      Vex.Flow.Test.runTests("Automatic Accidentals - Multi Voice Inline", Vex.Flow.Test.Accidental.automaticAccidentalsMultiVoiceInline);
      Vex.Flow.Test.runTests("Automatic Accidentals - Multi Voice Offset", Vex.Flow.Test.Accidental.automaticAccidentalsMultiVoiceOffset);
    },

    showNote: function(note, stave, ctx, x) {
      var mc = new Vex.Flow.ModifierContext();
      note.addToModifierContext(mc);

      var tickContext = new Vex.Flow.TickContext();
      tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(65);

      note.setContext(ctx).setStave(stave);
      note.draw();

      Vex.Flow.Test.plotNoteWidth(ctx, note, 140);
      return note;
    },

    basic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 240);
      var stave = new Vex.Flow.Stave(10, 10, 550);
      var assert = options.assert;

      ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], duration: "w"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),

        newNote({ keys: ["d/4", "e/4", "f/4", "a/4", "c/5", "e/5", "g/5"],
            duration: "h"}).
          addAccidental(0, newAcc("##")).
          addAccidental(1, newAcc("n")).
          addAccidental(2, newAcc("bb")).
          addAccidental(3, newAcc("b")).
          addAccidental(4, newAcc("#")).
          addAccidental(5, newAcc("n")).
          addAccidental(6, newAcc("bb")),

        newNote({ keys: ["f/4", "g/4", "a/4", "b/4", "c/5", "e/5", "g/5"],
            duration: "16"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#")).
          addAccidental(2, newAcc("#")).
          addAccidental(3, newAcc("b")).
          addAccidental(4, newAcc("bb")).
          addAccidental(5, newAcc("##")).
          addAccidental(6, newAcc("#")),

        newNote({ keys: ["a/3", "c/4", "e/4", "b/4", "d/5", "g/5"], duration: "w"}).
          addAccidental(0, newAcc("#")).
          addAccidental(1, newAcc("##").setAsCautionary()).
          addAccidental(2, newAcc("#").setAsCautionary()).
          addAccidental(3, newAcc("b")).
          addAccidental(4, newAcc("bb").setAsCautionary()).
          addAccidental(5, newAcc("b").setAsCautionary()),
      ];

      for (var i = 0; i < notes.length; ++i) {
        Vex.Flow.Test.Accidental.showNote(notes[i], stave, ctx, 30 + (i * 125));
        var accidentals = notes[i].getAccidentals();
        assert.ok(accidentals.length > 0, "Note " + i + " has accidentals");

        for (var j = 0; j < accidentals.length; ++j) {
          assert.ok(accidentals[j].width > 0, "Accidental " + j + " has set width");
        }
      }

      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 480, 140);
      assert.ok(true, "Full Accidental");
    },

    specialCases: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 240);
      ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new Vex.Flow.Stave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/4", "d/5"], duration: "w"}).
          addAccidental(0, newAcc("#")).
          addAccidental(1, newAcc("b")),

        newNote({ keys: ["c/4", "g/4"], duration: "h"}).
          addAccidental(0, newAcc("##")).
          addAccidental(1, newAcc("##")),

        newNote({ keys: ["b/3", "d/4", "f/4"],
            duration: "16"}).
          addAccidental(0, newAcc("#")).
          addAccidental(1, newAcc("#")).
          addAccidental(2, newAcc("##")),

        newNote({ keys: ["g/4", "a/4", "c/5", "e/5"],
            duration: "16"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("b")).
          addAccidental(3, newAcc("n")),

        newNote({ keys: ["e/4", "g/4", "b/4", "c/5"], duration: "4"}).
          addAccidental(0, newAcc("b").setAsCautionary()).
          addAccidental(1, newAcc("b").setAsCautionary()).
          addAccidental(2, newAcc("bb")).
          addAccidental(3, newAcc("b")),

        newNote({ keys: ["b/3", "e/4", "a/4", "d/5", "g/5"], duration: "8"}).
          addAccidental(0, newAcc("bb")).
          addAccidental(1, newAcc("b").setAsCautionary()).
          addAccidental(2, newAcc("n").setAsCautionary()).
          addAccidental(3, newAcc("#")).
          addAccidental(4, newAcc("n").setAsCautionary())
      ];

      for (var i = 0; i < notes.length; ++i) {
        Vex.Flow.Test.Accidental.showNote(notes[i], stave, ctx, 30 + (i * 70));
        var accidentals = notes[i].getAccidentals();
        ok(accidentals.length > 0, "Note " + i + " has accidentals");

        for (var j = 0; j < accidentals.length; ++j) {
          ok(accidentals[j].width > 0, "Accidental " + j + " has set width");
        }
      }

      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 480, 140);
      ok(true, "Full Accidental");
    },

    basicStemDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 240);
      ctx.scale(1.5, 1.5); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new Vex.Flow.Stave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], duration: "w", stem_direction: -1}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),

        newNote({ keys: ["d/4", "e/4", "f/4", "a/4", "c/5", "e/5", "g/5"],
            duration: "h", stem_direction: -1}).
          addAccidental(0, newAcc("##")).
          addAccidental(1, newAcc("n")).
          addAccidental(2, newAcc("bb")).
          addAccidental(3, newAcc("b")).
          addAccidental(4, newAcc("#")).
          addAccidental(5, newAcc("n")).
          addAccidental(6, newAcc("bb")),

        newNote({ keys: ["f/4", "g/4", "a/4", "b/4", "c/5", "e/5", "g/5"],
            duration: "16", stem_direction: -1}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#")).
          addAccidental(2, newAcc("#")).
          addAccidental(3, newAcc("b")).
          addAccidental(4, newAcc("bb")).
          addAccidental(5, newAcc("##")).
          addAccidental(6, newAcc("#")),
      ];

      for (var i = 0; i < notes.length; ++i) {
        Vex.Flow.Test.Accidental.showNote(notes[i], stave, ctx, 30 + (i * 125));
        var accidentals = notes[i].getAccidentals();
        ok(accidentals.length > 0, "Note " + i + " has accidentals");

        for (var j = 0; j < accidentals.length; ++j) {
          ok(accidentals[j].width > 0, "Accidental " + j + " has set width");
        }
      }

      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 350, 120);
      ok(true, "Full Accidental");
    },

    showNotes: function(note1, note2, stave, ctx, x) {
      var mc = new Vex.Flow.ModifierContext();
      note1.addToModifierContext(mc);
      note2.addToModifierContext(mc);

      var tickContext = new Vex.Flow.TickContext();
      tickContext.addTickable(note1).addTickable(note2).
        preFormat().setX(x).setPixelsUsed(65);

      note1.setContext(ctx).setStave(stave).draw();
      note2.setContext(ctx).setStave(stave).draw();

      Vex.Flow.Test.plotNoteWidth(ctx, note1, 180);
      Vex.Flow.Test.plotNoteWidth(ctx, note2, 15);
    },

    multiVoice: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 460, 250);

      ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new Vex.Flow.Stave(10, 40, 420);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      var note1 = newNote(
          { keys: ["c/4", "e/4", "a/4"], duration: "h", stem_direction: -1}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("n")).
          addAccidental(2, newAcc("#"));
      var note2 = newNote(
          { keys: ["d/5", "a/5", "b/5"], duration: "h", stem_direction: 1}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("bb")).
          addAccidental(2, newAcc("##"));

      Vex.Flow.Test.Accidental.showNotes(note1, note2, stave, ctx, 60);

      note1 = newNote(
          { keys: ["c/4", "e/4", "c/5"], duration: "h", stem_direction: -1}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("n")).
          addAccidental(2, newAcc("#"));
      note2 = newNote(
          { keys: ["d/5", "a/5", "b/5"], duration: "q", stem_direction: 1}).
          addAccidental(0, newAcc("b"));

      Vex.Flow.Test.Accidental.showNotes(note1, note2, stave, ctx, 150);

      note1 = newNote(
          { keys: ["d/4", "c/5", "d/5"], duration: "h", stem_direction: -1}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("n")).
          addAccidental(2, newAcc("#"));
      note2 = newNote(
          { keys: ["d/5", "a/5", "b/5"], duration: "q", stem_direction: 1}).
          addAccidental(0, newAcc("b"));

      Vex.Flow.Test.Accidental.showNotes(note1, note2, stave, ctx, 250);
      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 350, 150);
      ok(true, "Full Accidental");
    },

    microtonal: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 240);
      ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new Vex.Flow.Stave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], duration: "w"}).
          addAccidental(0, newAcc("db")).
          addAccidental(1, newAcc("d")),

        newNote({ keys: ["d/4", "e/4", "f/4", "a/4", "c/5", "e/5", "g/5"],
            duration: "h"}).
          addAccidental(0, newAcc("bbs")).
          addAccidental(1, newAcc("++")).
          addAccidental(2, newAcc("+")).
          addAccidental(3, newAcc("d")).
          addAccidental(4, newAcc("db")).
          addAccidental(5, newAcc("+")).
          addAccidental(6, newAcc("##")),

        newNote({ keys: ["f/4", "g/4", "a/4", "b/4", "c/5", "e/5", "g/5"],
            duration: "16"}).
          addAccidental(0, newAcc("++")).
          addAccidental(1, newAcc("bbs")).
          addAccidental(2, newAcc("+")).
          addAccidental(3, newAcc("b")).
          addAccidental(4, newAcc("db")).
          addAccidental(5, newAcc("##")).
          addAccidental(6, newAcc("#")),

        newNote({ keys: ["a/3", "c/4", "e/4", "b/4", "d/5", "g/5"], duration: "w"}).
          addAccidental(0, newAcc("#")).
          addAccidental(1, newAcc("db").setAsCautionary()).
          addAccidental(2, newAcc("bbs").setAsCautionary()).
          addAccidental(3, newAcc("b")).
          addAccidental(4, newAcc("++").setAsCautionary()).
          addAccidental(5, newAcc("d").setAsCautionary()),
      ];

      for (var i = 0; i < notes.length; ++i) {
        Vex.Flow.Test.Accidental.showNote(notes[i], stave, ctx, 30 + (i * 125));
        var accidentals = notes[i].getAccidentals();
        ok(accidentals.length > 0, "Note " + i + " has accidentals");

        for (var j = 0; j < accidentals.length; ++j) {
          ok(accidentals[j].width > 0, "Accidental " + j + " has set width");
        }
      }

      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 480, 140);
      ok(true, "Microtonal Accidental");
    },

    automaticAccidentals0: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 200);

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "c/5"], duration: "4"}),
        newNote({ keys: ["c#/4", "c#/5"], duration: "4"}),
        newNote({ keys: ["c#/4", "c#/5"], duration: "4"}),
        newNote({ keys: ["c##/4", "c##/5"], duration: "4"}),
        newNote({ keys: ["c##/4", "c##/5"], duration: "4"}),
        newNote({ keys: ["c/4", "c/5"], duration: "4"}),
        newNote({ keys: ["cn/4", "cn/5"], duration: "4"}),
        newNote({ keys: ["cbb/4", "cbb/5"], duration: "4"}),
        newNote({ keys: ["cbb/4", "cbb/5"], duration: "4"}),
        newNote({ keys: ["cb/4", "cb/5"], duration: "4"}),
        newNote({ keys: ["cb/4", "cb/5"], duration: "4"}),
        newNote({ keys: ["c/4", "c/5"], duration: "4"})
      ];

      var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT);
      voice.addTickables(notes);

      Vex.Flow.Accidental.applyAccidentals([voice], "C");

      var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);
      ok(true);
    },

    automaticAccidentals1: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 150);

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      c.context.clear();
      c.stave.addKeySignature("Ab");
      c.stave.draw();
      var notes = [
        newNote({ keys: ["c/4"], duration: "4"}),
        newNote({ keys: ["d/4"], duration: "4"}),
        newNote({ keys: ["e/4"], duration: "4"}),
        newNote({ keys: ["f/4"], duration: "4"}),
        newNote({ keys: ["g/4"], duration: "4"}),
        newNote({ keys: ["a/4"], duration: "4"}),
        newNote({ keys: ["b/4"], duration: "4"}),
        newNote({ keys: ["c/5"], duration: "4"}),
      ];

      var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT);
      voice.addTickables(notes);

      Vex.Flow.Accidental.applyAccidentals([voice], "Ab");

      var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);
      ok(true);
    },

    automaticAccidentals2: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 150);

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      c.context.clear();
      c.stave.addKeySignature("A");
      c.stave.draw();
      var notes = [
        newNote({ keys: ["a/4"], duration: "4"}),
        newNote({ keys: ["b/4"], duration: "4"}),
        newNote({ keys: ["c#/5"], duration: "4"}),
        newNote({ keys: ["d/5"], duration: "4"}),
        newNote({ keys: ["e/5"], duration: "4"}),
        newNote({ keys: ["f#/5"], duration: "4"}),
        newNote({ keys: ["g#/5"], duration: "4"}),
        newNote({ keys: ["a/5"], duration: "4"}),
      ];

      var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT);
      voice.addTickables(notes);

      Vex.Flow.Accidental.applyAccidentals([voice], "A");

      var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);
      ok(true);
    },

    automaticAccidentalsMultiVoiceInline: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 150);

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }


      c.context.clear();
      c.stave.addKeySignature("Ab");
      c.stave.draw();
      var notes0 = [
        newNote({ keys: ["c/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["d/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["e/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["f/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["g/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["a/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["c/5"], duration: "4", stem_direction: -1})
      ];

      var notes1 = [
        newNote({ keys: ["c/5"], duration: "4"}),
        newNote({ keys: ["d/5"], duration: "4"}),
        newNote({ keys: ["e/5"], duration: "4"}),
        newNote({ keys: ["f/5"], duration: "4"}),
        newNote({ keys: ["g/5"], duration: "4"}),
        newNote({ keys: ["a/5"], duration: "4"}),
        newNote({ keys: ["b/5"], duration: "4"}),
        newNote({ keys: ["c/6"], duration: "4"})
      ];

      var voice0 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT);
      voice0.addTickables(notes0);

      var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT);
      voice1.addTickables(notes1);

      // Ab Major
      Vex.Flow.Accidental.applyAccidentals([voice0, voice1], "Ab");

      equal(hasAccidental(notes0[0]), false);
      equal(hasAccidental(notes0[1]), true);
      equal(hasAccidental(notes0[2]), true);
      equal(hasAccidental(notes0[3]), false);
      equal(hasAccidental(notes0[4]), false);
      equal(hasAccidental(notes0[5]), true);
      equal(hasAccidental(notes0[6]), true);
      equal(hasAccidental(notes0[7]), false);

      equal(hasAccidental(notes1[0]), false);
      equal(hasAccidental(notes1[1]), true);
      equal(hasAccidental(notes1[2]), true);
      equal(hasAccidental(notes1[3]), false);
      equal(hasAccidental(notes1[4]), false);
      equal(hasAccidental(notes1[5]), true);
      equal(hasAccidental(notes1[6]), true);
      equal(hasAccidental(notes1[7]), false);

      var formatter = new Vex.Flow.Formatter().joinVoices([voice0, voice1]).
        formatToStave([voice0, voice1], c.stave);

      voice0.draw(c.context, c.stave);
      voice1.draw(c.context, c.stave);
      ok(true);
    },

    automaticAccidentalsMultiVoiceOffset: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 150);

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      c.context.clear();
      c.stave.addKeySignature("Cb");
      c.stave.draw();
      var notes0 = [
        newNote({ keys: ["c/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["d/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["e/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["f/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["g/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["a/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "4", stem_direction: -1}),
        newNote({ keys: ["c/5"], duration: "4", stem_direction: -1})
      ];

      var notes1 = [
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "4"}),
        newNote({ keys: ["d/5"], duration: "4"}),
        newNote({ keys: ["e/5"], duration: "4"}),
        newNote({ keys: ["f/5"], duration: "4"}),
        newNote({ keys: ["g/5"], duration: "4"}),
        newNote({ keys: ["a/5"], duration: "4"}),
        newNote({ keys: ["b/5"], duration: "4"}),
        newNote({ keys: ["c/6"], duration: "4"})
      ];

      var voice0 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT);
      voice0.addTickables(notes0);

      var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT);
      voice1.addTickables(notes1);

      // Cb Major (All flats)
      Vex.Flow.Accidental.applyAccidentals([voice0, voice1], "Cb");

      equal(hasAccidental(notes0[0]), true);
      equal(hasAccidental(notes0[1]), true);
      equal(hasAccidental(notes0[2]), true);
      equal(hasAccidental(notes0[3]), true);
      equal(hasAccidental(notes0[4]), true);
      equal(hasAccidental(notes0[5]), true);
      equal(hasAccidental(notes0[6]), true);
      equal(hasAccidental(notes0[7]), false, "Natural Remembered");

      equal(hasAccidental(notes1[0]), true);
      equal(hasAccidental(notes1[1]), false);
      equal(hasAccidental(notes1[2]), false);
      equal(hasAccidental(notes1[3]), false);
      equal(hasAccidental(notes1[4]), false);
      equal(hasAccidental(notes1[5]), false);
      equal(hasAccidental(notes1[6]), false);
      equal(hasAccidental(notes1[7]), false);

      var formatter = new Vex.Flow.Formatter().joinVoices([voice0, voice1]).
        formatToStave([voice0, voice1], c.stave);

      voice0.draw(c.context, c.stave);
      voice1.draw(c.context, c.stave);
      ok(true);
    },

    autoAccidentalWorking: function(options, contextBuilder) {
      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      var notes = [
        newNote({ keys: ["bb/4"], duration: "4"}),
        newNote({ keys: ["bb/4"], duration: "4"}),
        newNote({ keys: ["g#/4"], duration: "4"}),
        newNote({ keys: ["g/4"], duration: "4"}),
        newNote({ keys: ["b/4"], duration: "4"}),
        newNote({ keys: ["b/4"], duration: "4"}),
        newNote({ keys: ["a#/4"], duration: "4"}),
        newNote({ keys: ["g#/4"], duration: "4"}),
      ];

      var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT);
      voice.addTickables(notes);

      // F Major (Bb)
      Vex.Flow.Accidental.applyAccidentals([voice], "F");

      equal(hasAccidental(notes[0]), false, "No flat because of key signature");
      equal(hasAccidental(notes[1]), false, "No flat because of key signature");
      equal(hasAccidental(notes[2]), true, "Added a sharp");
      equal(hasAccidental(notes[3]), true, "Back to natural");
      equal(hasAccidental(notes[4]), true, "Back to natural");
      equal(hasAccidental(notes[5]), false, "Natural remembered");
      equal(hasAccidental(notes[6]), true, "Added sharp");
      equal(hasAccidental(notes[7]), true, "Added sharp");

      notes = [
        newNote({ keys: ["e#/4"], duration: "4"}),
        newNote({ keys: ["cb/4"], duration: "4"}),
        newNote({ keys: ["fb/4"], duration: "4"}),
        newNote({ keys: ["b#/4"], duration: "4"}),
        newNote({ keys: ["b#/4"], duration: "4"}),
        newNote({ keys: ["cb/5"], duration: "4"}),
        newNote({ keys: ["fb/5"], duration: "4"}),
        newNote({ keys: ["e#/4"], duration: "4"}),
      ];

      voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT);
      voice.addTickables(notes);

      // A Major (F#,G#,C#)
      Vex.Flow.Accidental.applyAccidentals([voice], "A");

      equal(hasAccidental(notes[0]), true, "Added sharp");
      equal(hasAccidental(notes[1]), true, "Added flat");
      equal(hasAccidental(notes[2]), true, "Added flat");
      equal(hasAccidental(notes[3]), true, "Added sharp");
      equal(hasAccidental(notes[4]), false, "Sharp remembered");
      equal(hasAccidental(notes[5]), false, "Flat remembered");
      equal(hasAccidental(notes[6]), false, "Flat remembered");
      equal(hasAccidental(notes[7]), false, "sharp remembered");

      notes = [
        newNote({ keys: ["c/4"], duration: "4"}),
        newNote({ keys: ["cb/4"], duration: "4"}),
        newNote({ keys: ["cb/4"], duration: "4"}),
        newNote({ keys: ["c#/4"], duration: "4"}),
        newNote({ keys: ["c#/4"], duration: "4"}),
        newNote({ keys: ["cbb/4"], duration: "4"}),
        newNote({ keys: ["cbb/4"], duration: "4"}),
        newNote({ keys: ["c##/4"], duration: "4"}),
        newNote({ keys: ["c##/4"], duration: "4"}),
        newNote({ keys: ["c/4"], duration: "4"}),
        newNote({ keys: ["c/4"], duration: "4"}),
      ];

      voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
        .setMode(Vex.Flow.Voice.Mode.SOFT);
      voice.addTickables(notes);

      // C Major (no sharps/flats)
      Vex.Flow.Accidental.applyAccidentals([voice], "C");

      equal(hasAccidental(notes[0]), false, "No accidental");
      equal(hasAccidental(notes[1]), true, "Added flat");
      equal(hasAccidental(notes[2]), false, "Flat remembered");
      equal(hasAccidental(notes[3]), true, "Sharp added");
      equal(hasAccidental(notes[4]), false, "Sharp remembered");
      equal(hasAccidental(notes[5]), true, "Added doubled flat");
      equal(hasAccidental(notes[6]), false, "Double flat remembered");
      equal(hasAccidental(notes[7]), true, "Added double sharp");
      equal(hasAccidental(notes[8]), false, "Double sharp rememberd");
      equal(hasAccidental(notes[9]), true, "Added natural");
      equal(hasAccidental(notes[10]), false, "Natural remembered");
    }
  };

  return Accidental;
})();
/**
 * VexFlow - Annotation Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Annotation = (function() {
  var runTests = VF.Test.runTests;
  var Annotation = {
    Start: function() {
      QUnit.module("Annotation");
      runTests("Simple Annotation", Annotation.simple);
      runTests("Standard Notation Annotation", Annotation.standard);
      runTests("Harmonics", Annotation.harmonic);
      runTests("Fingerpicking", Annotation.picking);
      runTests("Bottom Annotation", Annotation.bottom);
      runTests("Bottom Annotations with Beams", Annotation.bottomWithBeam);
      runTests("Test Justification Annotation Stem Up", Annotation.justificationStemUp);
      runTests("Test Justification Annotation Stem Down", Annotation.justificationStemDown);
      runTests("TabNote Annotations", Annotation.tabNotes);
    },

    simple: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }
      function newAnnotation(text) { return new VF.Annotation(text); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "h" }).
          addModifier(newAnnotation("T"), 0),
        newNote({
          positions: [{str: 2, fret: 10}], duration: "h" }).
            addModifier(newAnnotation("T"), 0).
            addModifier(newBend("Full"), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, "Simple Annotation");
    },

    standard: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 450).
        addClef("treble").setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAnnotation(text) {
        return (new VF.Annotation(text)).setFont("Times",
            VF.Test.Font.size, "italic"); }

      var notes = [
        newNote({ keys: ["c/4", "e/4"], duration: "h"}).
          addAnnotation(0, newAnnotation("quiet")),
        newNote({ keys: ["c/4", "e/4", "c/5"], duration: "h"}).
          addAnnotation(2, newAnnotation("Allegro"))
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, "Standard Notation Annotation");
    },

    harmonic: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }
      function newAnnotation(text) { return new VF.Annotation(text); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 12}, {str: 3, fret: 12}], duration: "h" }).
          addModifier(newAnnotation("Harm."), 0),
        newNote({
          positions: [{str: 2, fret: 9}], duration: "h" }).
            addModifier(newAnnotation("(8va)").setFont("Times",
                  VF.Test.Font.size, "italic"), 0).
            addModifier(newAnnotation("A.H."), 0)
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, "Simple Annotation");
    },

    picking: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      ctx.setFont("Arial", VF.Test.Font.size, "");
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }
      function newAnnotation(text) { return new VF.Annotation(text).
        setFont("Times", VF.Test.Font.size, "italic"); }

      var notes = [
        newNote({
          positions: [
            {str: 1, fret: 0},
            {str: 2, fret: 1},
            {str: 3, fret: 2},
            {str: 4, fret: 2},
            {str: 5, fret: 0}
            ], duration: "h" }).
          addModifier(new VF.Vibrato().setVibratoWidth(40)),
        newNote({
          positions: [{str: 6, fret: 9}], duration: "8" }).
            addModifier(newAnnotation("p"), 0),
        newNote({
          positions: [{str: 3, fret: 9}], duration: "8" }).
            addModifier(newAnnotation("i"), 0),
        newNote({
          positions: [{str: 2, fret: 9}], duration: "8" }).
            addModifier(newAnnotation("m"), 0),
        newNote({
          positions: [{str: 1, fret: 9}], duration: "8" }).
            addModifier(newAnnotation("a"), 0)
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, "Fingerpicking");
    },

    bottom: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 300).
        addClef("treble").setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAnnotation(text) {
        return (
            new VF.Annotation(text)).
            setFont("Times", VF.Test.Font.size).
            setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
        }

      var notes = [
        newNote({ keys: ["f/4"], duration: "w"}).
          addAnnotation(0, newAnnotation("F")),
        newNote({ keys: ["a/4"], duration: "w"}).
          addAnnotation(0, newAnnotation("A")),
        newNote({ keys: ["c/5"], duration: "w"}).
          addAnnotation(0, newAnnotation("C")),
        newNote({ keys: ["e/5"], duration: "w"}).
          addAnnotation(0, newAnnotation("E"))
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 100);
      ok(true, "Bottom Annotation");
    },

    bottomWithBeam: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 300).
        addClef("treble").setContext(ctx).draw();

      // Create some notes
      var notes = [
        new VF.StaveNote({ keys: ["a/3"], duration: "8" })
          .addModifier(0, new VF.Annotation("good")
          .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)),

        new VF.StaveNote({ keys: ["g/3"], duration: "8" })
          .addModifier(0, new VF.Annotation("even")
          .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)),

        new VF.StaveNote({ keys: ["c/4"], duration: "8" })
          .addModifier(0, new VF.Annotation("under")
          .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)),

        new VF.StaveNote({ keys: ["d/4"], duration: "8" })
          .addModifier(0, new VF.Annotation("beam")
          .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM))
      ];

      var beam = new VF.Beam(notes.slice(1));

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      beam.setContext(ctx).draw();
      ok(true, "Bottom Annotation with Beams");
    },

    justificationStemUp: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 650, 950);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAnnotation(text, hJustifcation, vJustifcation) {
        return (
            new VF.Annotation(text)).
              setFont("Arial", VF.Test.Font.size).
              setJustification(hJustifcation).
              setVerticalJustification(vJustifcation); }

      for (var v = 1; v <= 4; ++v) {
        var stave = new VF.Stave(10, (v-1) * 150 + 40, 400).
          addClef("treble").setContext(ctx).draw();

        var notes = [];

        notes.push(newNote({ keys: ["c/3"], duration: "q"}).addAnnotation(0, newAnnotation("Text", 1, v)));
        notes.push(newNote({ keys: ["c/4"], duration: "q"}).addAnnotation(0, newAnnotation("Text", 2, v)));
        notes.push(newNote({ keys: ["c/5"], duration: "q"}).addAnnotation(0, newAnnotation("Text", 3, v)));
        notes.push(newNote({ keys: ["c/6"], duration: "q"}).addAnnotation(0, newAnnotation("Text", 4, v)));

        VF.Formatter.FormatAndDraw(ctx, stave, notes, 100);
      }

      ok(true, "Test Justification Annotation");
    },

    justificationStemDown: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 650, 1000);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAnnotation(text, hJustifcation, vJustifcation) {
        return (
            new VF.Annotation(text)).
              setFont("Arial", VF.Test.Font.size).
              setJustification(hJustifcation).
              setVerticalJustification(vJustifcation); }

      for (var v = 1; v <= 4; ++v) {
        var stave = new VF.Stave(10, (v-1) * 150 + 40, 400).
          addClef("treble").setContext(ctx).draw();

        var notes = [];

        notes.push(newNote({ keys: ["c/3"], duration: "q", stem_direction: -1}).addAnnotation(0, newAnnotation("Text", 1, v)));
        notes.push(newNote({ keys: ["c/4"], duration: "q", stem_direction: -1}).addAnnotation(0, newAnnotation("Text", 2, v)));
        notes.push(newNote({ keys: ["c/5"], duration: "q", stem_direction: -1}).addAnnotation(0, newAnnotation("Text", 3, v)));
        notes.push(newNote({ keys: ["c/6"], duration: "q", stem_direction: -1}).addAnnotation(0, newAnnotation("Text", 4, v)));

        VF.Formatter.FormatAndDraw(ctx, stave, notes, 100);
      }

      ok(true, "Test Justification Annotation");
    },

    tabNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "8"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}], duration: "8"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var notes2 = specs.map(function(noteSpec){
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      var notes3 = specs.map(function(noteSpec){
        var tabNote = new VF.TabNote(noteSpec);
        return tabNote;
      });

      notes[0].addModifier(new VF.Annotation("Text").setJustification(1).setVerticalJustification(1), 0); // U
      notes[1].addModifier(new VF.Annotation("Text").setJustification(2).setVerticalJustification(2), 0); // D
      notes[2].addModifier(new VF.Annotation("Text").setJustification(3).setVerticalJustification(3), 0); // U
      notes[3].addModifier(new VF.Annotation("Text").setJustification(4).setVerticalJustification(4), 0); // D

      notes2[0].addModifier(new VF.Annotation("Text").setJustification(3).setVerticalJustification(1), 0); // U
      notes2[1].addModifier(new VF.Annotation("Text").setJustification(3).setVerticalJustification(2), 0); // D
      notes2[2].addModifier(new VF.Annotation("Text").setJustification(3).setVerticalJustification(3), 0); // U
      notes2[3].addModifier(new VF.Annotation("Text").setJustification(3).setVerticalJustification(4), 0); // D

      notes3[0].addModifier(new VF.Annotation("Text").setVerticalJustification(1), 0); // U
      notes3[1].addModifier(new VF.Annotation("Text").setVerticalJustification(2), 0); // D
      notes3[2].addModifier(new VF.Annotation("Text").setVerticalJustification(3), 0); // U
      notes3[3].addModifier(new VF.Annotation("Text").setVerticalJustification(4), 0); // D

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);
      voice.addTickables(notes2);
      voice.addTickables(notes3);


      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);


      voice.draw(ctx, stave);

      ok (true, 'TabNotes successfully drawn');
    }
  };

  return Annotation;
})();
/**
 * VexFlow - Articulation Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.Articulation = (function() {
  var Articulation = {
    Start: function() {
      QUnit.module("Articulation");
      Articulation.runTests("Articulation - Staccato/Staccatissimo", "a.","av", Articulation.drawArticulations);
      Articulation.runTests("Articulation - Accent/Tenuto", "a>","a-", Articulation.drawArticulations);
      Articulation.runTests("Articulation - Marcato/L.H. Pizzicato", "a^","a+", Articulation.drawArticulations);
      Articulation.runTests("Articulation - Snap Pizzicato/Fermata", "ao","ao", Articulation.drawArticulations);
      Articulation.runTests("Articulation - Up-stroke/Down-Stroke", "a|","am", Articulation.drawArticulations);
      Articulation.runTests("Articulation - Fermata Above/Below", "a@a","a@u", Articulation.drawFermata);
      Articulation.runTests("Articulation - Inline/Multiple", "a.","a.", Articulation.drawArticulations2);
      Articulation.runTests("TabNote Articulation", "a.","a.", Articulation.tabNotes);
    },

    runTests: function(name, sym1, sym2, func) {
      var params = {
        sym1: sym1,
        sym2: sym2
      };

      VF.Test.runTests(name, func, params);
    },

    drawArticulations: function(options, contextBuilder) {
      var sym1 = options.params.sym1;
      var sym2 = options.params.sym2;

      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 625, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 125);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/3"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 })
      ];
      notesBar1[0].addArticulation(0, new VF.Articulation(sym1).setPosition(4));
      notesBar1[1].addArticulation(0, new VF.Articulation(sym1).setPosition(4));
      notesBar1[2].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar1[3].addArticulation(0, new VF.Articulation(sym1).setPosition(3));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 125);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 })
      ];
      notesBar2[0].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[1].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[2].addArticulation(0, new VF.Articulation(sym1).setPosition(4));
      notesBar2[3].addArticulation(0, new VF.Articulation(sym1).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      // bar 3 - juxtaposing second bar next to first bar
        var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x, staveBar2.y, 125);
      staveBar3.setContext(ctx).draw();

      var notesBar3 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 })
      ];
      notesBar3[0].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar3[1].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar3[2].addArticulation(0, new VF.Articulation(sym2).setPosition(3));
      notesBar3[3].addArticulation(0, new VF.Articulation(sym2).setPosition(3));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);
      // bar 4 - juxtaposing second bar next to first bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x, staveBar3.y, 125);
      staveBar4.setEndBarType(VF.Barline.type.END);
      staveBar4.setContext(ctx).draw();

      var notesBar4 = [
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 })
      ];
      notesBar4[0].addArticulation(0, new VF.Articulation(sym2).setPosition(3));
      notesBar4[1].addArticulation(0, new VF.Articulation(sym2).setPosition(3));
      notesBar4[2].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar4[3].addArticulation(0, new VF.Articulation(sym2).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
    },

    drawFermata: function(options, contextBuilder) {
      var sym1 = options.params.sym1;
      var sym2 = options.params.sym2;

      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 400, 200);

      // bar 1
      var staveBar1 = new VF.Stave(50, 30, 150);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: -1 })
      ];
      notesBar1[0].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar1[1].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar1[2].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar1[3].addArticulation(0, new VF.Articulation(sym2).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 150);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 })
      ];
      notesBar2[0].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[1].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[2].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar2[3].addArticulation(0, new VF.Articulation(sym2).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
    },

    drawArticulations2: function(options, contextBuilder) {
      var sym1 = options.params.sym1;
      var sym2 = options.params.sym2;

      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 725, 200);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 250);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["d/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["e/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["g/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["c/5"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["d/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["e/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["g/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["c/6"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/6"], duration: "16", stem_direction: -1 })
      ];
      for(var i=0; i<16; i++){
        notesBar1[i].addArticulation(0, new VF.Articulation("a.").setPosition(4));
        notesBar1[i].addArticulation(0, new VF.Articulation("a>").setPosition(4));

        if(i === 15)
          notesBar1[i].addArticulation(0, new VF.Articulation("a@u").setPosition(4));
      }

      var beam1 = new VF.Beam(notesBar1.slice(0,8));
      var beam2 = new VF.Beam(notesBar1.slice(8,16));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 250);
      staveBar2.setContext(ctx).draw();
      var notesBar2 = [
        new VF.StaveNote({ keys: ["f/3"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["g/3"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/3"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/3"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["c/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["d/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["e/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["g/4"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["c/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["e/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["g/5"], duration: "16", stem_direction: -1 })
      ];
      for(i=0; i<16; i++){
        notesBar2[i].addArticulation(0, new VF.Articulation("a-").setPosition(3));
        notesBar2[i].addArticulation(0, new VF.Articulation("a^").setPosition(3));

        if(i === 15)
          notesBar2[i].addArticulation(0, new VF.Articulation("a@u").setPosition(4));
      }

      var beam3 = new VF.Beam(notesBar2.slice(0,8));
      var beam4 = new VF.Beam(notesBar2.slice(8,16));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
      beam3.setContext(ctx).draw();
      beam4.setContext(ctx).draw();

      // bar 3 - juxtaposing second bar next to first bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x, staveBar2.y, 75);
      staveBar3.setContext(ctx).draw();

      var notesBar3 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "w", stem_direction: 1 })
      ];
      notesBar3[0].addArticulation(0, new VF.Articulation("a-").setPosition(3));
      notesBar3[0].addArticulation(0, new VF.Articulation("a>").setPosition(3));
      notesBar3[0].addArticulation(0, new VF.Articulation("a@a").setPosition(3));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);
      // bar 4 - juxtaposing second bar next to first bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x, staveBar3.y, 125);
      staveBar4.setEndBarType(VF.Barline.type.END);
      staveBar4.setContext(ctx).draw();

      var notesBar4 = [
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 })
      ];
      for(i=0; i<4; i++){
        var position1 = 3;
        var position2 = 4;
        if(i > 1){
          position1 = 4;
          position2 = 3;
        }
        notesBar4[i].addArticulation(0, new VF.Articulation("a-").setPosition(position1));
      }

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
    },

    tabNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "8"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}], duration: "8"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var notes2 = specs.map(function(noteSpec){
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      var notes3 = specs.map(function(noteSpec){
        var tabNote = new VF.TabNote(noteSpec);
        return tabNote;
      });

      notes[0].addModifier(new VF.Articulation("a>").setPosition(3), 0); // U
      notes[1].addModifier(new VF.Articulation("a>").setPosition(4), 0); // D
      notes[2].addModifier(new VF.Articulation("a.").setPosition(3), 0); // U
      notes[3].addModifier(new VF.Articulation("a.").setPosition(4), 0); // D

      notes2[0].addModifier(new VF.Articulation("a>").setPosition(3), 0);
      notes2[1].addModifier(new VF.Articulation("a>").setPosition(4), 0);
      notes2[2].addModifier(new VF.Articulation("a.").setPosition(3), 0);
      notes2[3].addModifier(new VF.Articulation("a.").setPosition(4), 0);

      notes3[0].addModifier(new VF.Articulation("a>").setPosition(3), 0);
      notes3[1].addModifier(new VF.Articulation("a>").setPosition(4), 0);
      notes3[2].addModifier(new VF.Articulation("a.").setPosition(3), 0);
      notes3[3].addModifier(new VF.Articulation("a.").setPosition(4), 0);

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);
      voice.addTickables(notes2);
      voice.addTickables(notes3);


      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);


      voice.draw(ctx, stave);

      ok (true, 'TabNotes successfully drawn');
    }
  };

  return Articulation;
})();
/**
 * VexFlow - Auto-beaming Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.AutoBeamFormatting = (function() {
  var runTests = VF.Test.runTests;
  function newNote(note_struct) { return new VF.StaveNote(note_struct); }

  var AutoBeamFormatting = {
    Start: function() {
      QUnit.module('Auto-Beaming');
      runTests("Simple Auto Beaming",
                            AutoBeamFormatting.simpleAuto);
      runTests("Even Group Stem Directions",
                            AutoBeamFormatting.evenGroupStemDirections);
      runTests("Odd Group Stem Directions",
                            AutoBeamFormatting.oddGroupStemDirections);
      runTests("Odd Beam Groups Auto Beaming",
                            AutoBeamFormatting.oddBeamGroups);
      runTests("More Simple Auto Beaming 0",
                            AutoBeamFormatting.moreSimple0);
      runTests("More Simple Auto Beaming 1",
                            AutoBeamFormatting.moreSimple1);
      runTests("Beam Across All Rests",
                            AutoBeamFormatting.beamAcrossAllRests);
      runTests("Beam Across All Rests with Stemlets",
                            AutoBeamFormatting.beamAcrossAllRestsWithStemlets);
      runTests("Break Beams on Middle Rests Only",
                            AutoBeamFormatting.beamAcrossMiddleRests);
      runTests("Break Beams on Rest",
                            AutoBeamFormatting.breakBeamsOnRests);
      runTests("Maintain Stem Directions",
                            AutoBeamFormatting.maintainStemDirections);
      runTests("Maintain Stem Directions - Beam Over Rests",
                            AutoBeamFormatting.maintainStemDirectionsBeamAcrossRests);
      runTests("Beat group with unbeamable note - 2/2",
                            AutoBeamFormatting.groupWithUnbeamableNote);
      runTests("Offset beat grouping - 6/8 ",
                            AutoBeamFormatting.groupWithUnbeamableNote1);
      runTests("Odd Time - Guessing Default Beam Groups",
                            AutoBeamFormatting.autoOddBeamGroups);
      runTests("Custom Beam Groups",
                            AutoBeamFormatting.customBeamGroups);
      runTests("Simple Tuplet Auto Beaming",
                            AutoBeamFormatting.simpleTuplets);
      runTests("More Simple Tuplet Auto Beaming",
                            AutoBeamFormatting.moreSimpleTuplets);
      runTests("More Automatic Beaming",
                            AutoBeamFormatting.moreBeaming);
      runTests("Duration-Based Secondary Beam Breaks",
                            AutoBeamFormatting.secondaryBreaks);
      runTests("Flat Beams Up",
                            AutoBeamFormatting.flatBeamsUp);
      runTests("Flat Beams Down",
                            AutoBeamFormatting.flatBeamsDown);
      runTests("Flat Beams Mixed Direction",
                            AutoBeamFormatting.flatBeamsMixed);
      runTests("Flat Beams Up (uniform)",
                            AutoBeamFormatting.flatBeamsUpUniform);
      runTests("Flat Beams Down (uniform)",
                            AutoBeamFormatting.flatBeamsDownUniform);
      runTests("Flat Beams Up Bounds",
                            AutoBeamFormatting.flatBeamsUpBounds);
      runTests("Flat Beams Down Bounds",
                            AutoBeamFormatting.flatBeamsDownBounds);
    },

    setupContext: function(options, x, y) {
      var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 40, x || 450).addTrebleGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },



    simpleAuto: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["f/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      ok(true, "Auto Beaming Applicator Test");
    },

    evenGroupStemDirections: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["a/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["f/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/4"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;

      equal(beams[0].stem_direction, UP);
      equal(beams[1].stem_direction, UP);
      equal(beams[2].stem_direction, UP);
      equal(beams[3].stem_direction, UP);
      equal(beams[4].stem_direction, DOWN);
      equal(beams[5].stem_direction, DOWN);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      ok(true, "Auto Beaming Applicator Test");
    },

    oddGroupStemDirections: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["f/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/4"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["a/4"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["a/4"], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var groups = [
        new VF.Fraction(3, 8)
      ];

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice, null, groups);

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;

      equal(beams[0].stem_direction, DOWN, "Notes are equa-distant from middle line");
      equal(beams[1].stem_direction, DOWN);
      equal(beams[2].stem_direction, UP);
      equal(beams[3].stem_direction, DOWN, "Notes are equadistant from middle line");

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      ok(true, "Auto Beaming Applicator Test");
    },

    oddBeamGroups: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["f/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "8"}),
        newNote({ keys: ["f/4"], duration: "8"}),
        newNote({ keys: ["f/3"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "16"}),
        newNote({ keys: ["f/5"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode();
      voice.addTickables(notes);

      var Fraction = VF.Fraction;

      var groups = [
        new Fraction(2, 8),
        new Fraction(3, 8),
        new Fraction(1, 8)
      ];

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice, undefined, groups);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      ok(true, "Auto Beam Applicator Test");
    },

    moreSimple0: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["d/4"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    moreSimple1: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16r"}),
        newNote({ keys: ["c/5"], duration: "16r"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/4"], duration: "16"}),
        newNote({ keys: ["g/4"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["c/4", "e/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["a/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    breakBeamsOnRests: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/4"], duration: "16"}),
        newNote({ keys: ["g/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["e/4", "g/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["a/4"], duration: "16r"}),
        newNote({ keys: ["a/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        beam_rests: false
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    beamAcrossAllRestsWithStemlets: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/4"], duration: "16"}),
        newNote({ keys: ["g/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["e/4", "g/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["a/4"], duration: "16r"}),
        newNote({ keys: ["a/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        beam_rests: true,
        show_stemlets: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    beamAcrossAllRests: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/4"], duration: "16"}),
        newNote({ keys: ["g/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["e/4", "g/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["a/4"], duration: "16r"}),
        newNote({ keys: ["a/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        beam_rests: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },
    beamAcrossMiddleRests: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/4"], duration: "16"}),
        newNote({ keys: ["g/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["e/4", "g/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["b/4"], duration: "32r"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["a/4"], duration: "16r"}),
        newNote({ keys: ["a/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        beam_rests: true,
        beam_middle_only: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    maintainStemDirections: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options, 450, 200);

      var notes = [
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "32", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "32", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        beam_rests: false,
        maintain_stem_directions: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    maintainStemDirectionsBeamAcrossRests: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options, 450, 200);

      var notes = [
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "32", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "32", stem_direction: -1}),
        newNote({ keys: ["b/4"], duration: "32"}),
        newNote({ keys: ["b/4"], duration: "16r"}),
        newNote({ keys: ["b/4"], duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        beam_rests: true,
        maintain_stem_directions: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    groupWithUnbeamableNote: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options, 450, 200);

      c.stave.addTimeSignature('2/2');

      c.context.clear();
      c.stave.draw();

      var notes = [
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "4", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        groups: [new VF.Fraction(2, 2)],
        beam_rests: false,
        maintain_stem_directions: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    groupWithUnbeamableNote1: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options, 450, 200);

      c.stave.addTimeSignature('6/8');

      c.context.clear();
      c.stave.draw();

      var notes = [
        newNote({ keys: ["b/4"], duration: "4", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "4", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "8", stem_direction: 1}),
        newNote({ keys: ["b/4"], duration: "8", stem_direction: 1})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        groups: [new VF.Fraction(3, 8)],
        beam_rests: false,
        maintain_stem_directions: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    autoOddBeamGroups: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      var context = new options.contextBuilder(options.canvas_sel, 450, 400);

      context.scale(0.9, 0.9); context.fillStyle = "#221"; context.strokeStyle = "#221";

      var stave1 = new VF.Stave(10, 10, 450).addTrebleGlyph().
        setContext(context);
      stave1.addTimeSignature('5/4');

      var stave2 = new VF.Stave(10, 150, 450).addTrebleGlyph().
        setContext(context);
      stave2.addTimeSignature('5/8');

      var stave3 = new VF.Stave(10, 290, 450).addTrebleGlyph().
        setContext(context);
      stave3.addTimeSignature('13/16');

      var notes1 = [
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["d/4"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"})
      ];

      var notes2 = [
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"})
      ];

      var notes3 = [
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"})
      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice1.addTickables(notes1);

      var voice2 = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice2.addTickables(notes2);

      var voice3 = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice3.addTickables(notes3);

      stave1.draw();
      stave2.draw();
      stave3.draw();

      var groups1316 = [
        new VF.Fraction(3, 16),
        new VF.Fraction(2, 16)
      ];

      var beams = VF.Beam.applyAndGetBeams(voice1, undefined, VF.Beam.getDefaultBeamGroups('5/4'));
      var beams2 = VF.Beam.applyAndGetBeams(voice2, undefined, VF.Beam.getDefaultBeamGroups('5/8'));
      var beams3 = VF.Beam.applyAndGetBeams(voice3, undefined, VF.Beam.getDefaultBeamGroups('13/16'));

      var formatter1 = new VF.Formatter().
        formatToStave([voice1], stave1).
        formatToStave([voice2], stave2).
        formatToStave([voice3], stave3);

      voice1.draw(context, stave1);
      voice2.draw(context, stave2);
      voice3.draw(context, stave3);

      beams.forEach(function(beam){
        beam.setContext(context).draw();
      });

      beams2.forEach(function(beam){
        beam.setContext(context).draw();
      });

      beams3.forEach(function(beam){
        beam.setContext(context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    customBeamGroups: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      var context = new options.contextBuilder(options.canvas_sel, 450, 400);

      context.scale(0.9, 0.9); context.fillStyle = "#221"; context.strokeStyle = "#221";

      var stave1 = new VF.Stave(10, 10, 450).addTrebleGlyph().
        setContext(context);
      stave1.addTimeSignature('5/4');

      var stave2 = new VF.Stave(10, 150, 450).addTrebleGlyph().
        setContext(context);
      stave2.addTimeSignature('5/8');

      var stave3 = new VF.Stave(10, 290, 450).addTrebleGlyph().
        setContext(context);
      stave3.addTimeSignature('13/16');

      var notes1 = [
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["d/4"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"})
      ];

      var notes2 = [
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"})
      ];

      var notes3 = [
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"}),
        newNote({ keys: ["b/4"], duration: "16"})
      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice1.addTickables(notes1);

      var voice2 = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice2.addTickables(notes2);

      var voice3 = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice3.addTickables(notes3);

      stave1.draw();
      stave2.draw();
      stave3.draw();

      var group1 = [
        new VF.Fraction(5, 8)
      ];

      var group2 = [
        new VF.Fraction(3, 8),
        new VF.Fraction(2, 8)
      ];

      var group3 = [
        new VF.Fraction(7, 16),
        new VF.Fraction(2, 16),
        new VF.Fraction(4, 16)
      ];

      var beams = VF.Beam.applyAndGetBeams(voice1, undefined, group1);
      var beams2 = VF.Beam.applyAndGetBeams(voice2, undefined, group2);
      var beams3 = VF.Beam.applyAndGetBeams(voice3, undefined, group3);

      var formatter1 = new VF.Formatter().
        formatToStave([voice1], stave1).
        formatToStave([voice2], stave2).
        formatToStave([voice3], stave3);

      voice1.draw(context, stave1);
      voice2.draw(context, stave2);
      voice3.draw(context, stave3);

      beams.forEach(function(beam){
        beam.setContext(context).draw();
      });

      beams2.forEach(function(beam){
        beam.setContext(context).draw();
      });

      beams3.forEach(function(beam){
        beam.setContext(context).draw();
      });
      ok(true, "Auto Beam Applicator Test");
    },

    simpleTuplets: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["c/5", "e/5"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["a/5"], duration: "8"})
        ];

      var triplet1 = new VF.Tuplet(notes.slice(0, 3));
      var quintuplet = new VF.Tuplet(notes.slice(5));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.setStrict(false);
      voice.addTickables(notes);

      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      triplet1.setContext(c.context).draw();
      quintuplet.setContext(c.context).draw();
      ok(true, "Auto Beam Applicator Test");
    },

    moreSimpleTuplets: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["d/4"], duration: "4"}),
        newNote({ keys: ["g/4"], duration: "4"}),
        newNote({ keys: ["c/5"], duration: "4"}),

        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/5", "e/5"], duration: "16"})
        ];

      var triplet1 = new VF.Tuplet(notes.slice(0, 3));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.setStrict(false);
      voice.addTickables(notes);

      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      triplet1.setContext(c.context).draw();
      ok(true, "Auto Beam Applicator Test");
    },

    moreBeaming: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "4"}),
        newNote({ keys: ["c/5"], duration: "8"}).addDotToAll(),
        newNote({ keys: ["g/5"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "4"}),
        newNote({ keys: ["a/5"], duration: "16"}),
        newNote({ keys: ["c/5", "e/5"], duration: "16"}),
        newNote({ keys: ["a/5"], duration: "8"})
        ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.setStrict(false);
      voice.addTickables(notes);

      var beams = VF.Beam.applyAndGetBeams(voice);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });

      ok(true, "Auto Beam Applicator Test");
    },

    secondaryBreaks: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "16", dots: 1}),
          newNote({ keys: ["f/5"], duration: "32"}),

          newNote({ keys: ["f/5"], duration: "16"}),
          newNote({ keys: ["f/5"], duration: "8"}),
          newNote({ keys: ["f/5"], duration: "16"}),

          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "16", dots: 1}),
          newNote({ keys: ["f/5"], duration: "16", dots: 1}),
          newNote({ keys: ["f/5"], duration: "32"}),

          newNote({ keys: ["f/5"], duration: "16", dots: 1}),
          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "32"}),
          newNote({ keys: ["f/5"], duration: "16", dots: 1})
      ];
      notes.forEach(function(note) {
        if (note.dots >= 1) {
          note.addDotToAll();
        }
      });
      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var beams = VF.Beam.generateBeams(notes, {
        secondary_breaks: '8'
      });
      var formatter = new VF.Formatter().joinVoices([voice]).formatToStave([voice], c.stave);
      voice.draw(c.context, c.stave);
      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Duration-Based Secondary Breaks Test");
    },

    flatBeamsUp: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);
      var notes = [
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["f/4"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"})
      ];
      var triplet1 = new VF.Tuplet(notes.slice(0, 3));
      var triplet2 = new VF.Tuplet(notes.slice(4, 7));
      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true,
        stem_direction: 1
      });
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);
      voice.draw(c.context, c.stave);
      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      triplet1.setContext(c.context).draw();
      triplet2.setContext(c.context).draw();
      ok(true, "Flat Beams Up Test");
    },

    flatBeamsDown: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["d/4", "f/4", "a/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["g/4"], duration: "64"}),
        newNote({ keys: ["g/4"], duration: "64"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true,
        stem_direction: -1
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Flat Beams Down Test");
    },

    flatBeamsMixed: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["d/5"], duration: "64"}),
        newNote({ keys: ["e/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["f/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["a/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["d/4", "f/4", "a/4"], duration: "16"}),
        newNote({ keys: ["d/4"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["a/4"], duration: "32"}),
        newNote({ keys: ["g/4"], duration: "64"}),
        newNote({ keys: ["g/4"], duration: "64"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Flat Beams Mixed Direction Test");
    },

    flatBeamsUpUniform: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);
      var notes = [
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"})
      ];
      var triplet1 = new VF.Tuplet(notes.slice(0, 3));
      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true,
        flat_beam_offset: 50,
        stem_direction: 1
      });
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);
      voice.draw(c.context, c.stave);
      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      triplet1.setContext(c.context).draw();
      ok(true, "Flat Beams Up (uniform) Test");
    },

    flatBeamsDownUniform: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);

      var notes = [
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["a/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["e/4", "g/4", "b/4"], duration: "16"}),
        newNote({ keys: ["e/5"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["g/4"], duration: "64"}),
        newNote({ keys: ["g/4"], duration: "64"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true,
        flat_beam_offset: 155,
        stem_direction: -1
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Flat Beams Down (uniform) Test");
    },

    flatBeamsUpBounds: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);
      var notes = [
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "16"}),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["c/4"], duration: "8"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"}),
        newNote({ keys: ["f/5"], duration: "32"})
      ];
      var triplet1 = new VF.Tuplet(notes.slice(0, 3));
      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true,
        flat_beam_offset: 60,
        stem_direction: 1
      });
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);
      voice.draw(c.context, c.stave);
      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      triplet1.setContext(c.context).draw();
      ok(true, "Flat Beams Up (uniform) Test");
    },

    flatBeamsDownBounds: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = AutoBeamFormatting.setupContext(options);
      var notes = [
        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["a/6"], duration: "32"}),
        newNote({ keys: ["g/4"], duration: "64"}),
        newNote({ keys: ["g/4"], duration: "64"}),

        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["c/5"], duration: "64"}),
        newNote({ keys: ["a/5"], duration: "8"}),

        newNote({ keys: ["g/5"], duration: "8"}),
        newNote({ keys: ["e/4", "g/4", "b/4"], duration: "16"}),
        newNote({ keys: ["e/5"], duration: "16"}),

        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var beams = VF.Beam.generateBeams(notes, {
        flat_beams: true,
        flat_beam_offset: 145,
        stem_direction: -1
      });

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      beams.forEach(function(beam){
        beam.setContext(c.context).draw();
      });
      ok(true, "Flat Beams Down (uniform) Test");
    }
  };

  return AutoBeamFormatting;
})();
/**
 * VexFlow - Beam Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Beam = (function() {
  var runTests = VF.Test.runTests;

  var Beam = {
    Start: function() {
      QUnit.module("Beam");
      runTests("Simple Beam", Beam.simple);
      runTests("Multi Beam", Beam.multi);
      runTests("Sixteenth Beam", Beam.sixteenth);
      runTests("Slopey Beam", Beam.slopey);
      runTests("Auto-stemmed Beam", Beam.autoStem);
      runTests("Mixed Beam 1", Beam.mixed);
      runTests("Mixed Beam 2", Beam.mixed2);
      runTests("Dotted Beam", Beam.dotted);
      runTests("Close Trade-offs Beam", Beam.tradeoffs);
      runTests("Insane Beam", Beam.insane);
      runTests("Lengthy Beam", Beam.lenghty);
      runTests("Outlier Beam", Beam.outlier);
      runTests("Break Secondary Beams", Beam.breakSecondaryBeams);
      runTests("TabNote Beams Up", Beam.tabBeamsUp);
      runTests("TabNote Beams Down", Beam.tabBeamsDown);
      runTests("TabNote Auto Create Beams", Beam.autoTabBeams);
      runTests("TabNote Beams Auto Stem", Beam.tabBeamsAutoStem);
      runTests("Complex Beams with Annotations", Beam.complexWithAnnotation);
      runTests("Complex Beams with Articulations", Beam.complexWithArticulation);
    },

    beamNotes: function(notes, stave, ctx) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam = new VF.Beam(notes.slice(1, notes.length));

      voice.draw(ctx, stave);
      beam.setContext(ctx).draw();
    },

    setupContext: function(options, x, y) {
      var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 10, x || 450).addTrebleGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      Beam.beamNotes([
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "8"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "f/4", "a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/4", "g/4", "b/4"], stem_direction: 1, duration: "8"}).
          addAccidental(0, newAcc("bb")).
          addAccidental(1, newAcc("##")),
        newNote({ keys: ["f/4", "a/4", "c/5"], stem_direction: 1, duration: "8"})
      ], c.stave, c.context);
      ok(true, "Simple Test");
    },

    multi: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      beam2_1.setContext(c.context).draw();
      beam2_2.setContext(c.context).draw();
      ok(true, "Multi Test");
    },

    sixteenth: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "h"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "h"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      beam2_1.setContext(c.context).draw();
      beam2_2.setContext(c.context).draw();
      ok(true, "Sixteenth Test");
    },

    breakSecondaryBeams: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options, 600);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16", dots: 1 }),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16", dots: 1 }),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16", dots: 1 }),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "32"}),

        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"})
      ];
      notes.forEach(function(note) {
        if ('dots' in note && note.dots >= 1) {
          note.addDotToAll();
        }
      });

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice, voice2], 500);
      var beam1_1 = new VF.Beam(notes.slice(0, 6));
      var beam1_2 = new VF.Beam(notes.slice(6, 12));

      beam1_1.breakSecondaryAt([1, 3]);
      beam1_2.breakSecondaryAt([2]);

      var beam2_1 = new VF.Beam(notes2.slice(0, 12));
      var beam2_2 = new VF.Beam(notes2.slice(12, 18));

      beam2_1.breakSecondaryAt([3, 7, 11]);
      beam2_2.breakSecondaryAt([3]);

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      beam2_1.setContext(c.context).draw();
      beam2_2.setContext(c.context).draw();
      ok(true, "Breaking Secondary Beams Test");
    },

    slopey: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/3"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      ok(true, "Slopey Test");
    },

    autoStem: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["a/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["f/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/4"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      var beam1 = new VF.Beam(notes.slice(0, 2), true);
      var beam2 = new VF.Beam(notes.slice(2, 4), true);
      var beam3 = new VF.Beam(notes.slice(4, 6), true);
      var beam4 = new VF.Beam(notes.slice(6, 8), true);
      var beam5 = new VF.Beam(notes.slice(8, 10), true);
      var beam6 = new VF.Beam(notes.slice(10, 12), true);

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;

      equal(beam1.stem_direction, UP);
      equal(beam2.stem_direction, UP);
      equal(beam3.stem_direction, UP);
      equal(beam4.stem_direction, UP);
      equal(beam5.stem_direction, DOWN);
      equal(beam6.stem_direction, DOWN);

      voice.draw(ctx, stave);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      beam3.setContext(ctx).draw();
      beam4.setContext(ctx).draw();
      beam5.setContext(ctx).draw();
      beam6.setContext(ctx).draw();

      ok(true, "AutoStem Beam Test");
    },

    mixed: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),

        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),

        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),

        newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 390);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      beam2_1.setContext(c.context).draw();
      beam2_2.setContext(c.context).draw();
      ok(true, "Multi Test");
    },

    mixed2: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "64"}),

        newNote({ keys: ["d/5"], stem_direction: 1, duration: "128"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "32"}),

        newNote({ keys: ["c/5"], stem_direction: 1, duration: "64"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "128"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "64"}),

        newNote({ keys: ["d/4"], stem_direction: -1, duration: "128"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),

        newNote({ keys: ["c/4"], stem_direction: -1, duration: "64"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "128"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 390);
      var beam1_1 = new VF.Beam(notes.slice(0, 12));

      var beam2_1 = new VF.Beam(notes2.slice(0, 12));

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam2_1.setContext(c.context).draw();

      ok(true, "Multi Test");
    },

    dotted: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/3"], stem_direction: 1, duration: "8d"}).
            addDotToAll(),
        newNote({ keys: ["a/3"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/3"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["b/3"], stem_direction: 1, duration: "8d"}).
            addDotToAll(),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/3"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["a/3"], stem_direction: 1, duration: "8d"}).
            addDotToAll(),
        newNote({ keys: ["a/3"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["b/3"], stem_direction: 1, duration: "8d"}).
            addDotToAll(),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 390);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));
      var beam1_3 = new VF.Beam(notes.slice(8, 12));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();
      beam1_3.setContext(c.context).draw();

      ok(true, "Dotted Test");
    },

    tradeoffs: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
      newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      ok(true, "Close Trade-offs Test");
    },

    insane: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 7));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      ok(true, "Insane Test");
    },

    lenghty: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
      newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
      newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();

      ok(true, "Lengthy Test");
    },

    outlier: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().
                        joinVoices([voice]).
                        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      ok(true, "Outlier Test");
    },

    tabBeamsUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"},
        { positions: [{str: 3, fret: 6 }], duration: "8"},
        { positions: [{str: 3, fret: 6 }], duration: "8"},
        { positions: [{str: 3, fret: 6 }], duration: "8"},
        { positions: [{str: 3, fret: 6 }], duration: "8"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      var beam1 = new VF.Beam(notes.slice(1, 7));
      var beam2 = new VF.Beam(notes.slice(8, 11));

      var tuplet = new VF.Tuplet(notes.slice(8, 11));
      tuplet.setRatioed(true);

      voice.draw(ctx, stave);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      tuplet.setContext(ctx).draw();

      ok (true, 'All objects have been drawn');
    },

    tabBeamsDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 300);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550, {
        num_lines: 10
      });
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8dd"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"},
        { positions: [{str: 1, fret: 6 }], duration: "8"},
        { positions: [{str: 1, fret: 6 }], duration: "8"},
        { positions: [{str: 1, fret: 6 }], duration: "8"},
        { positions: [{str: 7, fret: 6 }], duration: "8"},
        { positions: [{str: 7, fret: 6 }], duration: "8"},
        { positions: [{str: 10, fret: 6 }], duration: "8"},
        { positions: [{str: 10, fret: 6 }], duration: "8"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      notes[1].addDot();
      notes[1].addDot();

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      var beam1 = new VF.Beam(notes.slice(1, 7));
      var beam2 = new VF.Beam(notes.slice(8, 11));

      var tuplet = new VF.Tuplet(notes.slice(8, 11));
      var tuplet2 = new VF.Tuplet(notes.slice(11, 14));
      tuplet.setTupletLocation(-1);
      tuplet2.setTupletLocation(-1);

      voice.draw(ctx, stave);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      tuplet.setContext(ctx).draw();
      tuplet2.setContext(ctx).draw();

      ok (true, 'All objects have been drawn');

    },


    autoTabBeams: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 300);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550, {
        num_lines: 6
      });
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }], duration: "32"},
        { positions: [{str: 1, fret: 6 }], duration: "32"},
        { positions: [{str: 1, fret: 6 }], duration: "32"},
        { positions: [{str: 6, fret: 6 }], duration: "32"},
        { positions: [{str: 6, fret: 6 }], duration: "16"},
        { positions: [{str: 6, fret: 6 }], duration: "16"},
        { positions: [{str: 6, fret: 6 }], duration: "16"},
        { positions: [{str: 6, fret: 6 }], duration: "16"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      var beams = VF.Beam.applyAndGetBeams(voice, -1);

      voice.draw(ctx, stave);
      beams.forEach(function(beam) {
          beam.setContext(ctx).draw();
      });

      ok (true, 'All objects have been drawn');

    },

    // This tests makes sure the auto_stem functionality is works.
    // TabNote stems within a beam group should end up normalized
    tabBeamsAutoStem: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 300);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550, {
        num_lines: 6
      });
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8", stem_direction: -1},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8", stem_direction: 1},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16", stem_direction: -1},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16", stem_direction: 1},
        { positions: [{str: 1, fret: 6 }], duration: "32", stem_direction: 1},
        { positions: [{str: 1, fret: 6 }], duration: "32", stem_direction: -1},
        { positions: [{str: 1, fret: 6 }], duration: "32", stem_direction: -1},
        { positions: [{str: 6, fret: 6 }], duration: "32", stem_direction: -1},
        { positions: [{str: 6, fret: 6 }], duration: "16", stem_direction: 1},
        { positions: [{str: 6, fret: 6 }], duration: "16", stem_direction: 1},
        { positions: [{str: 6, fret: 6 }], duration: "16", stem_direction: 1},
        { positions: [{str: 6, fret: 6 }], duration: "16", stem_direction: -1}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      var beams = [
        new VF.Beam(notes.slice(0, 8), true), // Stems should format down
        new VF.Beam(notes.slice(8, 12), true)  // Stems should format up
      ];

      voice.draw(ctx, stave);
      beams.forEach(function(beam) {
          beam.setContext(ctx).draw();
      });

      ok (true, 'All objects have been drawn');

    },

    complexWithAnnotation: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 200);
      ctx.scale(1.0, 1.0); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var stave = new VF.Stave(10, 40, 400).
        addClef("treble").setContext(ctx).draw();

      var notes = [
        { keys: ["e/4"], duration: "128" , stem_direction: 1},
        { keys: ["d/4"], duration: "16"  , stem_direction: 1},
        { keys: ["e/4"], duration: "8"   , stem_direction: 1},
        { keys: ["c/4", "g/4"], duration: "32"  , stem_direction: 1},
        { keys: ["c/4"], duration: "32"  , stem_direction: 1 },
        { keys: ["c/4"], duration: "32"  , stem_direction: 1},
        { keys: ["c/4"], duration: "32"  , stem_direction: 1}
      ];

      var notes2 = [
        { keys: ["e/5"], duration: "128" , stem_direction: -1},
        { keys: ["d/5"], duration: "16"  , stem_direction: -1},
        { keys: ["e/5"], duration: "8"   , stem_direction: -1},
        { keys: ["c/5", "g/5"], duration: "32"  , stem_direction: -1},
        { keys: ["c/5"], duration: "32"  , stem_direction: -1 },
        { keys: ["c/5"], duration: "32"  , stem_direction: -1},
        { keys: ["c/5"], duration: "32"  , stem_direction: -1}
      ];

      notes = notes.map(function(note, index) {
          return newNote(note).addModifier(0, new VF.Annotation("1").setVerticalJustification(1));
      });

      notes2 = notes2.map(function(note, index) {
          return newNote(note).addModifier(0, new VF.Annotation("3").setVerticalJustification(3));
      });

      var beam = new VF.Beam(notes);
      var beam2 = new VF.Beam(notes2);

      var voice = new VF.Voice(VF.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      voice.addTickables(notes2);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave, {stave: stave});
      voice.draw(ctx);
      beam.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      ok(true, "Complex beam annotations");
    },

    complexWithArticulation: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 200);
      ctx.scale(1.0, 1.0); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var stave = new VF.Stave(10, 40, 400).
        addClef("treble").setContext(ctx).draw();

      var notes = [
        { keys: ["e/4"], duration: "128" , stem_direction: 1},
        { keys: ["d/4"], duration: "16"  , stem_direction: 1},
        { keys: ["e/4"], duration: "8"   , stem_direction: 1},
        { keys: ["c/4", "g/4"], duration: "32"  , stem_direction: 1},
        { keys: ["c/4"], duration: "32"  , stem_direction: 1 },
        { keys: ["c/4"], duration: "32"  , stem_direction: 1},
        { keys: ["c/4"], duration: "32"  , stem_direction: 1}
      ];

      var notes2 = [
        { keys: ["e/5"], duration: "128" , stem_direction: -1},
        { keys: ["d/5"], duration: "16"  , stem_direction: -1},
        { keys: ["e/5"], duration: "8"   , stem_direction: -1},
        { keys: ["c/5", "g/5"], duration: "32"  , stem_direction: -1},
        { keys: ["c/5"], duration: "32"  , stem_direction: -1 },
        { keys: ["c/5"], duration: "32"  , stem_direction: -1},
        { keys: ["c/5"], duration: "32"  , stem_direction: -1}
      ];

      notes = notes.map(function(note, index) {
          return newNote(note).addModifier(0, new VF.Articulation("am").setPosition(3));
      });

      notes2 = notes2.map(function(note, index) {
          return newNote(note).addModifier(0, new VF.Articulation("a>").setPosition(4));
      });

      var beam = new VF.Beam(notes);
      var beam2 = new VF.Beam(notes2);

      var voice = new VF.Voice(VF.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      voice.addTickables(notes2);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave, {stave: stave});
      voice.draw(ctx);
      beam.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      ok(true, "Complex beam articulations");
    }
  };

  return Beam;
})();
/**
 * VexFlow - Accidental Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Bend = (function() {
  var Bend = {
    Start: function() {
      QUnit.module("Bend");
      VF.Test.runTests("Double Bends", VF.Test.Bend.doubleBends);
      VF.Test.runTests("Reverse Bends", VF.Test.Bend.reverseBends);
      VF.Test.runTests("Bend Phrase", VF.Test.Bend.bendPhrase);
      VF.Test.runTests("Double Bends With Release",
          VF.Test.Bend.doubleBendsWithRelease);
      VF.Test.runTests("Whako Bend", VF.Test.Bend.whackoBends);
    },

    doubleBends: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.setRawFont(" 10pt Arial");
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "q" }).
          addModifier(newBend("Full"), 0).
          addModifier(newBend("1/2"), 1),

        newNote({
          positions: [{str: 2, fret: 5}, {str: 3, fret: 5}], duration: "q" }).
          addModifier(newBend("1/4"), 0).
          addModifier(newBend("1/4"), 1),

        newNote({
          positions: [{str: 4, fret: 7}], duration: "h" })
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      notes.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 140);
      });

      ok(true, "Double Bends");
    },

    doubleBendsWithRelease: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 550, 240);
      ctx.scale(1.0, 1.0);
      ctx.setBackgroundFillStyle("#FFF");
      ctx.setFont("Arial", VF.Test.Font.size);
      var stave = new VF.TabStave(10, 10, 550).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text, release) { return new VF.Bend(text, release); }

      var notes = [
        newNote({
          positions: [{str: 1, fret: 10}, {str: 4, fret: 9}], duration: "q" }).
          addModifier(newBend("1/2", true), 0).
          addModifier(newBend("Full", true), 1),

        newNote({
          positions: [{str: 2, fret: 5},
                      {str: 3, fret: 5},
                      {str: 4, fret: 5}], duration: "q" }).
          addModifier(newBend("1/4", true), 0).
          addModifier(newBend("Monstrous", true), 1).
          addModifier(newBend("1/4", true), 2),

        newNote({
          positions: [{str: 4, fret: 7}], duration: "q" }),
        newNote({
          positions: [{str: 4, fret: 7}], duration: "q" })
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      notes.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 140);
      });
      ok(true, "Bend Release");
    },

    reverseBends: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 240);

      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.setRawFont("10pt Arial");
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "w" }).
          addModifier(newBend("Full"), 1).
          addModifier(newBend("1/2"), 0),

        newNote({
          positions: [{str: 2, fret: 5}, {str: 3, fret: 5}], duration: "w" }).
          addModifier(newBend("1/4"), 1).
          addModifier(newBend("1/4"), 0),

        newNote({
          positions: [{str: 4, fret: 7}], duration: "w" })
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var mc = new VF.ModifierContext();
        note.addToModifierContext(mc);

        var tickContext = new VF.TickContext();
        tickContext.addTickable(note).preFormat().setX(75 * i).setPixelsUsed(95);

        note.setStave(stave).setContext(ctx).draw();
        VF.Test.plotNoteWidth(ctx, note, 140);
        ok(true, "Bend " + i);
      }
    },

    bendPhrase: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.setRawFont(" 10pt Arial");
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(phrase) { return new VF.Bend(null, null, phrase); }

      var phrase1 = [
        { type: VF.Bend.UP, text: "Full"},
        { type: VF.Bend.DOWN, text: "Monstrous"},
        { type: VF.Bend.UP, text: "1/2"},
        { type: VF.Bend.DOWN, text: ""}
      ];
      var bend1 = newBend(phrase1).setContext(ctx);

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}], duration: "w" }).
          addModifier(bend1, 0)
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var mc = new VF.ModifierContext();
        note.addToModifierContext(mc);

        var tickContext = new VF.TickContext();
        tickContext.addTickable(note).preFormat().setX(75 * i).setPixelsUsed(95);

        note.setStave(stave).setContext(ctx).draw();
        VF.Test.plotNoteWidth(ctx, note, 140);
        ok(true, "Bend " + i);
      }
    },

    whackoBends: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 240);
      ctx.scale(1.0, 1.0); ctx.setBackgroundFillStyle("#FFF");
      ctx.setFont("Arial", VF.Test.Font.size);
      var stave = new VF.TabStave(10, 10, 350).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(phrase) { return new VF.Bend(null, null, phrase); }

      var phrase1 = [
        { type: VF.Bend.UP, text: "Full"},
        { type: VF.Bend.DOWN, text: ""},
        { type: VF.Bend.UP, text: "1/2"},
        { type: VF.Bend.DOWN, text: ""}
      ];

      var phrase2 = [
        { type: VF.Bend.UP, text: "Full"},
        { type: VF.Bend.UP, text: "Full"},
        { type: VF.Bend.UP, text: "1/2"},
        { type: VF.Bend.DOWN, text: ""},
        { type: VF.Bend.DOWN, text: "Full"},
        { type: VF.Bend.DOWN, text: "Full"},
        { type: VF.Bend.UP, text: "1/2"},
        { type: VF.Bend.DOWN, text: ""}
      ];

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}, {str: 3, fret: 9}], duration: "q" }).
          addModifier(newBend(phrase1), 0).
          addModifier(newBend(phrase2), 1)
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      VF.Test.plotNoteWidth(ctx, notes[0], 140);
      ok(true, "Whako Release");
    }
  };

  return Bend;
})();
/**
 * VexFlow - Bounding Box Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.BoundingBox = (function() {
  var BoundingBox = {
    Start: function() {
      QUnit.module("BoundingBox");
      test("Initialization Test", VF.Test.BoundingBox.initialization);
      test("Merging Text", VF.Test.BoundingBox.merging);
    },

    initialization: function() {
      var bb = new VF.BoundingBox(4, 5, 6, 7);
      equal(bb.getX(), 4, "Bad X");
      equal(bb.getY(), 5, "Bad Y");
      equal(bb.getW(), 6, "Bad W");
      equal(bb.getH(), 7, "Bad H");

      bb.setX(5)
      equal(bb.getX(), 5, "Bad X");
    },

    merging: function() {
      var bb1 = new VF.BoundingBox(10, 10, 10, 10);
      var bb2 = new VF.BoundingBox(15, 20, 10, 10);

      equal(bb1.getX(), 10, "Bad X for bb1");
      equal(bb2.getX(), 15, "Bad X for bb2");

      bb1.mergeWith(bb2);
      equal(bb1.getX(), 10);
      equal(bb1.getY(), 10);
      equal(bb1.getW(), 15);
      equal(bb1.getH(), 20);
    }
  };

  return BoundingBox;
})();
/**
 * VexFlow - Clef Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Clef = (function() {
  var Clef = {
    Start: function() {
      QUnit.module("Clef");
      VF.Test.runTests("Clef Test", VF.Test.Clef.draw);
      VF.Test.runTests("Clef End Test", VF.Test.Clef.drawEnd);
      VF.Test.runTests("Small Clef Test", VF.Test.Clef.drawSmall);
      VF.Test.runTests("Small Clef End Test", VF.Test.Clef.drawSmallEnd);
      VF.Test.runTests("Clef Change Test", VF.Test.Clef.drawClefChange);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);
      var stave = new VF.Stave(10, 10, 700);

      stave.addClef("treble");
      stave.addClef("treble", "default", "8va");
      stave.addClef("treble", "default", "8vb");
      stave.addClef("alto");
      stave.addClef("tenor");
      stave.addClef("soprano");
      stave.addClef("bass");
      stave.addClef("bass", "default", "8vb");
      stave.addClef("mezzo-soprano");
      stave.addClef("baritone-c");
      stave.addClef("baritone-f");
      stave.addClef("subbass");
      stave.addClef("percussion");
      stave.addClef("french");

      stave.addEndClef("treble");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    drawEnd: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);
      var stave = new VF.Stave(10, 10, 700);

      stave.addClef("bass");

      stave.addEndClef("treble");
      stave.addEndClef("treble", "default", "8va");
      stave.addEndClef("treble", "default", "8vb");
      stave.addEndClef("alto");
      stave.addEndClef("tenor");
      stave.addEndClef("soprano");
      stave.addEndClef("bass");
      stave.addEndClef("bass", "default", "8vb");
      stave.addEndClef("mezzo-soprano");
      stave.addEndClef("baritone-c");
      stave.addEndClef("baritone-f");
      stave.addEndClef("subbass");
      stave.addEndClef("percussion");
      stave.addEndClef("french");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },


    drawSmall: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);
      var stave = new VF.Stave(10, 10, 700);

      stave.addClef("treble", "small");
      stave.addClef("treble", "small", "8va");
      stave.addClef("treble", "small", "8vb");
      stave.addClef("alto", "small");
      stave.addClef("tenor", "small");
      stave.addClef("soprano", "small");
      stave.addClef("bass", "small");
      stave.addClef("bass", "small", "8vb");
      stave.addClef("mezzo-soprano", "small");
      stave.addClef("baritone-c", "small");
      stave.addClef("baritone-f", "small");
      stave.addClef("subbass", "small");
      stave.addClef("percussion", "small");
      stave.addClef("french", "small");

      stave.addEndClef("treble", "small");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    drawSmallEnd: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);
      var stave = new VF.Stave(10, 10, 700);

      stave.addClef("bass", "small");

      stave.addEndClef("treble", "small");
      stave.addEndClef("treble", "small", "8va");
      stave.addEndClef("treble", "small", "8vb");
      stave.addEndClef("alto", "small");
      stave.addEndClef("tenor", "small");
      stave.addEndClef("soprano", "small");
      stave.addEndClef("bass", "small");
      stave.addEndClef("bass", "small", "8vb");
      stave.addEndClef("mezzo-soprano", "small");
      stave.addEndClef("baritone-c", "small");
      stave.addEndClef("baritone-f", "small");
      stave.addEndClef("subbass", "small");
      stave.addEndClef("percussion", "small");
      stave.addEndClef("french", "small");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    drawClefChange: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 180);
      var stave = new VF.Stave(10, 10, 700);
      stave.addClef("treble").setContext(ctx).draw();

      var notes = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble" }),
        new VF.ClefNote("alto", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "alto" }),
        new VF.ClefNote("tenor", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "tenor" }),
        new VF.ClefNote("soprano", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "soprano" }),
        new VF.ClefNote("bass", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "bass" }),
        new VF.ClefNote("mezzo-soprano", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "mezzo-soprano" }),
        new VF.ClefNote("baritone-c","small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "baritone-c" }),
        new VF.ClefNote("baritone-f", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "baritone-f" }),
        new VF.ClefNote("subbass", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "subbass" }),
        new VF.ClefNote("french", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "french" }),
        new VF.ClefNote("treble", "small", "8vb"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble", octave_shift: -1}),
        new VF.ClefNote("treble", "small", "8va"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble", octave_shift: 1 })
      ];

      var voice = new VF.Voice({
        num_beats: 12,
        beat_value: 4,
        resolution: VF.RESOLUTION
      });

      voice.addTickables(notes);

      var formatter = new VF.Formatter().
        joinVoices([voice]).format([voice], 500);

      voice.draw(ctx, stave);
      ok(true, "all pass");
    }
  };

  return Clef;
})();
/**
 * VexFlow - Curve Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.Curve = (function () {
  var Curve = {
    Start: function() {
      QUnit.module("Curve");
      VF.Test.runTests("Simple Curve", Curve.simple);
      VF.Test.runTests("Rounded Curve", Curve.rounded);
      VF.Test.runTests("Thick Thin Curves", Curve.thickThin);
      VF.Test.runTests("Top Curve", Curve.topCurve);
    },

    simple: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4), true);
      var beam1_2 = new VF.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = VF.Curve;
      var curve1 = new Curve(notes[0], notes[3], {
        cps: [{x: 0, y: 10}, {x: 0, y: 50}]
      });

      curve1.setContext(ctx).draw();

      var curve2 = new Curve(notes[4], notes[7], {
        cps: [{x: 0, y: 10}, {x: 0, y: 20}]
      });

      curve2.setContext(ctx).draw();

      ok("Simple Curve");
    },

    rounded: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4), true);
      var beam1_2 = new VF.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = VF.Curve;
      var curve1 = new Curve(notes[0], notes[3], {
        x_shift: -10,
        y_shift: 30,
        cps: [{x: 0, y: 20}, {x: 0, y: 50}]
      });

      curve1.setContext(ctx).draw();

      var curve2 = new Curve(notes[4], notes[7], {
        cps: [{x: 0, y: 50}, {x: 0, y: 50}]
      });

      curve2.setContext(ctx).draw();

      ok("Rounded Curve");
    },

    thickThin: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4), true);
      var beam1_2 = new VF.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = VF.Curve;
      var curve1 = new Curve(notes[0], notes[3], {
        thickness: 10,
        x_shift: -10,
        y_shift: 30,
        cps: [{x: 0, y: 20}, {x: 0, y: 50}]
      });

      curve1.setContext(ctx).draw();

      var curve2 = new Curve(notes[4], notes[7], {
        thickness: 0,
        cps: [{x: 0, y: 50}, {x: 0, y: 50}]
      });

      curve2.setContext(ctx).draw();

      ok("Thick Thin Curve");
    },

    topCurve: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4), true);
      var beam1_2 = new VF.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = VF.Curve;
      var curve1 = new Curve(notes[0], notes[7], {
        x_shift: -3,
        y_shift: 10,
        position: Curve.Position.NEAR_TOP,
        position_end: Curve.Position.NEAR_HEAD,

        cps: [{x: 0, y: 20}, {x: 40, y: 80}]
      });

      curve1.setContext(ctx).draw();

      ok("Top Curve");
    }
  };

  return Curve;
})();
/**
 * VexFlow - Dot Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Dot = (function() {
  var Dot = {
    Start: function() {
      QUnit.module("Dot");
      VF.Test.runTests("Basic", VF.Test.Dot.basic);
      VF.Test.runTests("Multi Voice", VF.Test.Dot.multiVoice);
    },

    showNote: function(note, stave, ctx, x) {
      var mc = new VF.ModifierContext();
      note.addToModifierContext(mc);

      var tickContext = new VF.TickContext();
      tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(65);

      note.setContext(ctx).setStave(stave);
      note.draw();

      VF.Test.plotNoteWidth(ctx, note, 140);
      return note;
    },

    basic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 1000, 240);
      ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new VF.Stave(10, 10, 975);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Dot(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4", "b/4"], duration: "w"}).
          addDotToAll(),

        newNote({ keys: ["a/4", "b/4", "c/5"],
            duration: "q", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["g/4", "a/4", "b/4"],
            duration: "q", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/4", "f/4", "b/4", "c/5"],
            duration: "q"}).
          addDotToAll(),

        newNote({ keys: ["g/4", "a/4", "d/5", "e/5", "g/5"],
            duration: "q", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["g/4", "b/4", "d/5", "e/5"],
            duration: "q", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/4", "g/4", "b/4", "c/5"],
            duration: "q", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["d/4", "e/4", "f/4", "a/4", "c/5", "e/5", "g/5"],
            duration: "h"}).
          addDotToAll().
          addDotToAll(),

        newNote({ keys: ["f/4", "g/4", "a/4", "b/4", "c/5", "e/5", "g/5"],
            duration: "16", stem_direction: -1}).
          addDotToAll().
          addDotToAll().
          addDotToAll()
      ];

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.Dot.showNote(notes[i], stave, ctx, 30 + (i * 65));
        var accidentals = notes[i].getDots();
        ok(accidentals.length > 0, "Note " + i + " has accidentals");

        for (var j = 0; j < accidentals.length; ++j) {
          ok(accidentals[j].width > 0, "Dot " + j + " has set width");
        }
      }

      VF.Test.plotLegendForNoteWidth(ctx, 620, 140);
      ok(true, "Full Dot");
    },

    showNotes: function(note1, note2, stave, ctx, x) {
      var mc = new VF.ModifierContext();
      note1.addToModifierContext(mc);
      note2.addToModifierContext(mc);

      var tickContext = new VF.TickContext();
      tickContext
        .addTickable(note1)
        .addTickable(note2)
        .setX(x)
        .preFormat()
        .setPixelsUsed(65);

      note1.setContext(ctx).setStave(stave).draw();
      note2.setContext(ctx).setStave(stave).draw();

      VF.Test.plotNoteWidth(ctx, note1, 180);
      VF.Test.plotNoteWidth(ctx, note2, 20);
    },

    multiVoice: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 300);

      ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(30, 40, 420);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Dot(type); }

      var note1 = newNote(
          { keys: ["c/4", "e/4", "a/4"], duration: "h", stem_direction: -1}).
          addDotToAll().
          addDotToAll();
      var note2 = newNote(
          { keys: ["d/5", "a/5", "b/5"], duration: "h", stem_direction: 1}).
          addDotToAll();

      VF.Test.Dot.showNotes(note1, note2, stave, ctx, 60);

      note1 = newNote(
          { keys: ["c/4", "e/4", "c/5"], duration: "h", stem_direction: -1}).
          addDot(0).
          addDot(0).
          addDot(1).
          addDot(1).
          addDot(2).
          addDot(2).
          addDot(2);
      note2 = newNote(
          { keys: ["d/5", "a/5", "b/5"], duration: "q", stem_direction: 1}).
          addDotToAll().
          addDotToAll();

      VF.Test.Dot.showNotes(note1, note2, stave, ctx, 150);

      note1 = newNote(
          { keys: ["d/4", "c/5", "d/5"], duration: "h", stem_direction: -1}).
          addDotToAll().
          addDotToAll().
          addDot(0);
      note2 = newNote(
          { keys: ["d/5", "a/5", "b/5"], duration: "q", stem_direction: 1}).
          addDotToAll();

      VF.Test.Dot.showNotes(note1, note2, stave, ctx, 250);
      VF.Test.plotLegendForNoteWidth(ctx, 400, 180);
      ok(true, "Full Dot");
    }
  };

  return Dot;
})()
/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Formatter = (function() {
  var runTests = VF.Test.runTests;

  var Formatter = {
    Start: function() {
      QUnit.module("Formatter");
      test("TickContext Building", Formatter.buildTickContexts);
      runTests("StaveNote Formatting", Formatter.formatStaveNotes);
      runTests("StaveNote Justification", Formatter.justifyStaveNotes);
      runTests("Notes with Tab", Formatter.notesWithTab);
      runTests("Format Multiple Staves - No Justification", Formatter.multiStaves, {justify: 0});
      runTests("Format Multiple Staves - Justified", Formatter.multiStaves, {justify: 168});
    },

    buildTickContexts: function() {
      function createTickable() {
        return new VF.Test.MockTickable();
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables1 = [
        createTickable().setTicks(BEAT).setWidth(10),
        createTickable().setTicks(BEAT * 2).setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30)
      ];

      var tickables2 = [
        createTickable().setTicks(BEAT * 2).setWidth(10),
        createTickable().setTicks(BEAT).setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30)
      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      voice1.addTickables(tickables1);
      voice2.addTickables(tickables2);

      var formatter = new VF.Formatter();
      var tContexts = formatter.createTickContexts([voice1, voice2]);

      equal(tContexts.list.length, 4, "Voices should have four tick contexts");

      // TODO: add this after pull request #68 is merged to master
      // throws(
      //   function() { formatter.getMinTotalWidth(); },
      //   Vex.RERR,
      //   "Expected to throw exception"
      // );

      ok(formatter.preCalculateMinTotalWidth([voice1, voice2]),
          'Successfully runs preCalculateMinTotalWidth');
      equal(formatter.getMinTotalWidth(), 104,
          "Get minimum total width without passing voices");

      formatter.preFormat();
      equal(formatter.getMinTotalWidth(), 104, "Minimum total width");

      equal(tickables1[0].getX(), tickables2[0].getX(),
          "First notes of both voices have the same X");
      equal(tickables1[2].getX(), tickables2[2].getX(),
          "Last notes of both voices have the same X");
      ok(tickables1[1].getX() < tickables2[1].getX(),
          "Second note of voice 2 is to the right of the second note of voice 1");
    },

    renderNotes: function(
        notes1, notes2, ctx, stave, justify) {
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      voice1.addTickables(notes1);
      voice2.addTickables(notes2);

      new VF.Formatter().joinVoices([voice1, voice2]).
        format([voice1, voice2], justify);

      voice1.draw(ctx, stave);
      voice2.draw(ctx, stave);
    },

    formatStaveNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 250);
      ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 30, 500);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newNote({ keys: ["c/5", "e/5", "a/5"], stem_direction: 1,  duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/5", "e/5", "f/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["c/5", "f/5", "a/5"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      VF.Test.Formatter.renderNotes(notes1, notes2, ctx, stave);

      notes1.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 180);
      });

      notes2.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 15);
      });

      VF.Test.plotLegendForNoteWidth(ctx, 300, 180);

      ok(true);
    },

    getNotes: function() {
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("bb")).
          addAccidental(1, newAcc("n")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newNote({ keys: ["b/4", "e/5", "a/5"], stem_direction: 1,  duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/5", "e/5", "f/5"], stem_direction: 1, duration: "h"}),
        newNote({ keys: ["c/5", "f/5", "a/5"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("##")).
          addAccidental(1, newAcc("b"))
      ];

      return [notes1, notes2];
    },

    justifyStaveNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 420, 580);
      ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      // Get test voices.
      var notes = VF.Test.Formatter.getNotes();

      var stave = new VF.Stave(10, 30, 400).addTrebleGlyph().
        setContext(ctx).draw();
      VF.Test.Formatter.renderNotes(notes[0], notes[1], ctx, stave);
      notes[0].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 170);});
      notes[1].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 15);});
      ok(true);

      var stave2 = new VF.Stave(10, 220, 400).addTrebleGlyph().
        setContext(ctx).draw();
      VF.Test.Formatter.renderNotes(notes[0], notes[1], ctx, stave2, 300);
      ok(true);
      notes[0].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 350);});
      notes[1].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 200);});

      var stave3 = new VF.Stave(10, 410, 400).addTrebleGlyph().
        setContext(ctx).draw();
      VF.Test.Formatter.renderNotes(notes[0], notes[1], ctx, stave3, 400);
      notes[0].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 550);});
      notes[1].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 390);});

      ok(true);
    },

    getTabNotes: function() {
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTabNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "h"}).
          addAccidental(0, newAcc("#")),
        newNote({ keys: ["c/4", "d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("#"))
      ];

      var tabs1 = [
        newTabNote({ positions: [{str: 3, fret: 6}], duration: "h"}).
          addModifier(new VF.Bend("Full"), 0),
        newTabNote({ positions: [{str: 2, fret: 3},
                                 {str: 3, fret: 5}], duration: "8"}).
          addModifier(new VF.Bend("Unison"), 1),
        newTabNote({ positions: [{str: 3, fret: 7}], duration: "8"}),
        newTabNote({ positions: [{str: 3, fret: 6},
                                 {str: 4, fret: 7},
                                 {str: 2, fret: 5}], duration: "q"})

      ];

      return { notes: notes1, tabs: tabs1 }
    },

    renderNotesWithTab: function(notes, ctx, staves, justify) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      var tabVoice = new VF.Voice(VF.Test.TIME4_4);

      voice.addTickables(notes.notes);
      tabVoice.addTickables(notes.tabs);

      new VF.Formatter().
        joinVoices([voice]).joinVoices([tabVoice]).
        format([voice, tabVoice], justify);

      voice.draw(ctx, staves.notes);
      tabVoice.draw(ctx, staves.tabs);
    },

    notesWithTab: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 420, 400);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";

      // Get test voices.
      var notes = VF.Test.Formatter.getTabNotes();
      var stave = new VF.Stave(10, 10, 400).addTrebleGlyph().
        setContext(ctx).draw();
      var tabstave = new VF.TabStave(10, 100, 400).addTabGlyph().
        setNoteStartX(stave.getNoteStartX()).setContext(ctx).draw();

      VF.Test.Formatter.renderNotesWithTab(notes, ctx,
          { notes: stave, tabs: tabstave });
      ok(true);

      var stave2 = new VF.Stave(10, 200, 400).addTrebleGlyph().
        setContext(ctx).draw();
      var tabstave2 = new VF.TabStave(10, 300, 400).addTabGlyph().
        setNoteStartX(stave2.getNoteStartX()).setContext(ctx).draw();

      VF.Test.Formatter.renderNotesWithTab(notes, ctx,
          { notes: stave2, tabs: tabstave2 }, 300);
      ok(true);
    },

    multiStaves: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 300);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var stave11 = new VF.Stave(20, 10, 255).
        addTrebleGlyph().
        addTimeSignature("6/8").
        setContext(ctx).draw();
      var stave21 = new VF.Stave(20, 100, 255).
        addTrebleGlyph().
        addTimeSignature("6/8").
        setContext(ctx).draw();
      var stave31 = new VF.Stave(20, 200, 255).
        addClef("bass").
        addTimeSignature("6/8").
        setContext(ctx).draw();
      new VF.StaveConnector(stave21, stave31).
        setType(VF.StaveConnector.type.BRACE).
        setContext(ctx).draw();

      var notes11 = [
        newNote({ keys: ["f/4"], duration: "q"}).setStave(stave11),
        newNote({ keys: ["d/4"], duration: "8"}).setStave(stave11),
        newNote({ keys: ["g/4"], duration: "q"}).setStave(stave11),
        newNote({ keys: ["e/4"], duration: "8"}).setStave(stave11).
          addAccidental(0, newAcc("b"))
      ];
      var notes21 = [
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}).setStave(stave21),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}).setStave(stave21),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}).setStave(stave21),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}).setStave(stave21),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}).setStave(stave21).
          addAccidental(0, newAcc("b")),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}).setStave(stave21).
          addAccidental(0, newAcc("b"))
      ];
      var notes31 = [
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31)
      ];

      var voice11 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      var voice21 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      var voice31 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      voice11.addTickables(notes11);
      voice21.addTickables(notes21);
      voice31.addTickables(notes31);

      var beam21a = new VF.Beam(notes21.slice(0, 3));
      var beam21b = new VF.Beam(notes21.slice(3, 6));
      var beam31a = new VF.Beam(notes31.slice(0, 3));
      var beam31b = new VF.Beam(notes31.slice(3, 6));

      if (options.params.justify > 0) {
        new VF.Formatter().joinVoices( [voice11, voice21, voice31] ).
          format([voice11, voice21, voice31], options.params.justify);
      } else {
        new VF.Formatter().joinVoices( [voice11, voice21, voice31] ).
          format([voice11, voice21, voice31]);
      }

      voice11.draw(ctx, stave11);
      voice21.draw(ctx, stave21);
      voice31.draw(ctx, stave31);
      beam21a.setContext(ctx).draw();
      beam21b.setContext(ctx).draw();
      beam31a.setContext(ctx).draw();
      beam31b.setContext(ctx).draw();

      var stave12 = new VF.Stave(stave11.width + stave11.x, stave11.y, 250).
        setContext(ctx).draw();
      var stave22 = new VF.Stave(stave21.width + stave21.x, stave21.y, 250).
        setContext(ctx).draw();
      var stave32 = new VF.Stave(stave31.width + stave31.x, stave31.y, 250).
        setContext(ctx).draw();

      var notes12 = [
        newNote({ keys: ["a/4"], duration: "q"}).setStave(stave12).
         addAccidental(0, newAcc("b")),
        newNote({ keys: ["b/4"], duration: "8"}).setStave(stave12).
          addAccidental(0, newAcc("b")),
        newNote({ keys: ["c/5", "e/5"], stem_direction: -1, duration: "q"}).setStave(stave12). //,
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("b")),

        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}).setStave(stave12)
      ];
      var notes22 = [
        newNote({ keys: ["e/4", "a/4"], stem_direction: 1, duration: "qd"}).setStave(stave22).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("b")).
          addDotToAll(),
        newNote({ keys: ["e/4", "a/4", "c/5"], stem_direction: 1, duration: "q"}).setStave(stave22).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("b")),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}).setStave(stave22).
          addAccidental(0, newAcc("b"))
      ];
      var notes32 = [
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32)
      ];
      var voice12 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      var voice22 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      var voice32 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      voice12.addTickables(notes12);
      voice22.addTickables(notes22);
      voice32.addTickables(notes32);

      if (options.params.justify > 0) {
        new VF.Formatter().joinVoices([voice12, voice22, voice32]).
          format([voice12, voice22, voice32], 188);
      } else {
        new VF.Formatter().joinVoices([voice12, voice22, voice32]).
          format([voice12, voice22, voice32]);
      }
      var beam32a = new VF.Beam(notes32.slice(0, 3));
      var beam32b = new VF.Beam(notes32.slice(3, 6));

      voice12.draw(ctx, stave12);
      voice22.draw(ctx, stave22);
      voice32.draw(ctx, stave32);
      beam32a.setContext(ctx).draw();
      beam32b.setContext(ctx).draw();

      ok(true);
    },

    TIME6_8: {
      num_beats: 6,
      beat_value: 8,
      resolution: VF.RESOLUTION
    }
  };

  return Formatter;
})();
/**
 * VexFlow - GraceNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.GraceNote = (function() {
  var GraceNote = {
    Start: function() {
      QUnit.module("Grace Notes");
      VF.Test.runTests("Grace Note Basic", VF.Test.GraceNote.basic);
      VF.Test.runTests("Grace Note Basic with Slurs", VF.Test.GraceNote.basicSlurred);
      VF.Test.runTests("Grace Notes Multiple Voices", VF.Test.GraceNote.multipleVoices);
    },

    helper: function(options, contextBuilder, ctxWidth, staveWidth){
      var ctx = contextBuilder(options.canvas_sel, ctxWidth, 130);
      ctx.scale(1.0, 1.0); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, staveWidth).addClef("treble").setContext(ctx).draw();
      return {
        ctx: ctx,
        stave: stave,
        newNote: function newNote(note_struct) {
          return new VF.StaveNote(note_struct);
        }
     };
    },

    basic: function(options, contextBuilder) {
      var measure = new VF.Test.GraceNote.helper(options, contextBuilder, 700, 650);

      var note0 =  new VF.StaveNote({ keys: ["b/4"], duration: "4", auto_stem: true });
      var note1 =  new VF.StaveNote({ keys: ["c/5"], duration: "4", auto_stem: true });
      var note2 =  new VF.StaveNote({ keys: ["c/5", "d/5"], duration: "4", auto_stem: true });
      var note3 =  new VF.StaveNote({ keys: ["a/4"], duration: "4", auto_stem: true });
      var note4 =  new VF.StaveNote({ keys: ["a/4"], duration: "4", auto_stem: true });
      var note5 =  new VF.StaveNote({ keys: ["a/4"], duration: "4", auto_stem: true });
      note1.addAccidental(0, new VF.Accidental("#"));

      var gracenote_group0 = [
        { keys: ["e/4"], duration: "32"},
        { keys: ["f/4"], duration: "32"},
        { keys: ["g/4"], duration: "32"},
        { keys: ["a/4"], duration: "32"}
      ];

      var gracenote_group1 = [
        { keys: ["b/4"], duration: "8", slash: false}
      ];

      var gracenote_group2 = [
        { keys: ["b/4"], duration: "8", slash: true}
      ];

      var gracenote_group3 = [
        { keys: ["e/4"], duration: "8"},
        { keys: ["f/4"], duration: "16"},
        { keys: ["e/4", "g/4"], duration: "8"},
        { keys: ["a/4"], duration: "32"},
        { keys: ["b/4"], duration: "32"}
      ];

      var gracenote_group4 = [
        { keys: ["g/4"], duration: "8"},
        { keys: ["g/4"], duration: "16"},
        { keys: ["g/4"], duration: "16"}
      ];

      function createNote(note_prop) {
        return new VF.GraceNote(note_prop);
      }

      var gracenotes = gracenote_group0.map(createNote);
      var gracenotes1 = gracenote_group1.map(createNote);
      var gracenotes2 = gracenote_group2.map(createNote);
      var gracenotes3 = gracenote_group3.map(createNote);
      var gracenotes4 = gracenote_group4.map(createNote);

      gracenotes[1].addAccidental(0, new VF.Accidental('##'));
      gracenotes3[3].addAccidental(0, new VF.Accidental('bb'));

      gracenotes4[0].addDotToAll();

      note0.addModifier(0, new VF.GraceNoteGroup(gracenotes).beamNotes());
      note1.addModifier(0, new VF.GraceNoteGroup(gracenotes1).beamNotes());
      note2.addModifier(0, new VF.GraceNoteGroup(gracenotes2).beamNotes());
      note3.addModifier(0, new VF.GraceNoteGroup(gracenotes3).beamNotes());
      note4.addModifier(0, new VF.GraceNoteGroup(gracenotes4).beamNotes());

      VF.Formatter.FormatAndDraw(measure.ctx, measure.stave, [note0, note1, note2, note3, note4], 0);
      ok(true, "GraceNoteBasic");
    },

    basicSlurred: function(options, contextBuilder) {
      var measure = new VF.Test.GraceNote.helper(options, contextBuilder, 700, 650);

      var note0 =  new VF.StaveNote({ keys: ["b/4"], duration: "4", auto_stem: true });
      var note1 =  new VF.StaveNote({ keys: ["c/5"], duration: "4", auto_stem: true });
      var note2 =  new VF.StaveNote({ keys: ["c/5", "d/5"], duration: "4", auto_stem: true });
      var note3 =  new VF.StaveNote({ keys: ["a/4"], duration: "4", auto_stem: true });
      var note4 =  new VF.StaveNote({ keys: ["a/4"], duration: "4", auto_stem: true });
      var note5 =  new VF.StaveNote({ keys: ["a/4"], duration: "4", auto_stem: true });
      note1.addAccidental(0, new VF.Accidental("#"));

      var gracenote_group0 = [
        { keys: ["e/4"], duration: "32"},
        { keys: ["f/4"], duration: "32"},
        { keys: ["g/4"], duration: "32"},
        { keys: ["a/4"], duration: "32"}
      ];

      var gracenote_group1 = [
        { keys: ["b/4"], duration: "8", slash: false}
      ];

      var gracenote_group2 = [
        { keys: ["b/4"], duration: "8", slash: true}
      ];

      var gracenote_group3 = [
        { keys: ["e/4"], duration: "8"},
        { keys: ["f/4"], duration: "16"},
        { keys: ["e/4", "g/4"], duration: "8"},
        { keys: ["a/4"], duration: "32"},
        { keys: ["b/4"], duration: "32"}
      ];

      var gracenote_group4 = [
        { keys: ["a/4"], duration: "8"},
        { keys: ["a/4"], duration: "16"},
        { keys: ["a/4"], duration: "16"}
      ];

      function createNote(note_prop) {
        return new VF.GraceNote(note_prop);
      }

      var gracenotes = gracenote_group0.map(createNote);
      var gracenotes1 = gracenote_group1.map(createNote);
      var gracenotes2 = gracenote_group2.map(createNote);
      var gracenotes3 = gracenote_group3.map(createNote);
      var gracenotes4 = gracenote_group4.map(createNote);

      gracenotes[1].addAccidental(0, new VF.Accidental('#'));
      gracenotes3[3].addAccidental(0, new VF.Accidental('b'));
      gracenotes3[2].addAccidental(0, new VF.Accidental('n'));
      gracenotes4[0].addDotToAll();


      note0.addModifier(0, new VF.GraceNoteGroup(gracenotes, true).beamNotes());
      note1.addModifier(0, new VF.GraceNoteGroup(gracenotes1, true).beamNotes());
      note2.addModifier(0, new VF.GraceNoteGroup(gracenotes2, true).beamNotes());
      note3.addModifier(0, new VF.GraceNoteGroup(gracenotes3, true).beamNotes());
      note4.addModifier(0, new VF.GraceNoteGroup(gracenotes4, true).beamNotes());

      VF.Formatter.FormatAndDraw(measure.ctx, measure.stave, [note0, note1, note2, note3, note4], 0);
      ok(true, "GraceNoteBasic");
    },

    multipleVoices: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      var context = new options.contextBuilder(options.canvas_sel, 450, 140);
      context.scale(0.9, 0.9); context.fillStyle = "#221"; context.strokeStyle = "#221";
      context.font = " 10pt Arial";
      var stave = new VF.Stave(10, 10, 450).addTrebleGlyph().
        setContext(context).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"})
      ];

      function createNote(note_prop) {
        return new VF.GraceNote(note_prop);
      }

      var gracenote_group0 = [
        { keys: ["b/4"], duration: "8", slash: true}
      ];

      var gracenote_group1 = [
        { keys: ["f/4"], duration: "8", slash: true}
      ];

      var gracenote_group2 = [
        { keys: ["f/4"], duration: "32", stem_direction: -1},
        { keys: ["e/4"], duration: "32", stem_direction: -1}
      ];

      var gracenote_group3 = [
        { keys: ["f/5"], duration: "32", stem_direction: 1},
        { keys: ["e/5"], duration: "32", stem_direction: 1},
        { keys: ["e/5"], duration: "8", stem_direction: 1}
      ];

      var gracenotes1 = gracenote_group0.map(createNote);
      var gracenotes2 = gracenote_group1.map(createNote);
      var gracenotes3 = gracenote_group2.map(createNote);
      var gracenotes4 = gracenote_group3.map(createNote);

      gracenotes2[0].setStemDirection(-1);
      gracenotes2[0].addAccidental(0, new VF.Accidental('#'));

      notes[1].addModifier(0, new VF.GraceNoteGroup(gracenotes4).beamNotes());
      notes[3].addModifier(0, new VF.GraceNoteGroup(gracenotes1));
      notes2[1].addModifier(0, new VF.GraceNoteGroup(gracenotes2).beamNotes());
      notes2[5].addModifier(0, new VF.GraceNoteGroup(gracenotes3).beamNotes());

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        formatToStave([voice, voice2], stave);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice.draw(context, stave);
      voice2.draw(context, stave);
      beam1_1.setContext(context).draw();
      beam1_2.setContext(context).draw();

      beam2_1.setContext(context).draw();
      beam2_2.setContext(context).draw();
      ok(true, "Sixteenth Test");
    }
  };

  return GraceNote;
})();
/**
 * VexFlow - Clef-Key Signature Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ClefKeySignature = (function() {
  var ClefKeySignature = {
    MAJOR_KEYS: [
      "C",
      "F",
      "Bb",
      "Eb",
      "Ab",
      "Db",
      "Gb",
      "Cb",
      "G",
      "D",
      "A",
      "E",
      "B",
      "F#",
      "C#"],

    MINOR_KEYS: [
      "Am",
      "Dm",
      "Gm",
      "Cm",
      "Fm",
      "Bbm",
      "Ebm",
      "Abm",
      "Em",
      "Bm",
      "F#m",
      "C#m",
      "G#m",
      "D#m",
      "A#m"],

    Start: function() {
      QUnit.module("Clef Keys");
      QUnit.test("Key Parser Test", VF.Test.ClefKeySignature.parser);
      VF.Test.runTests("Major Key Clef Test",
        VF.Test.ClefKeySignature.keys,
        {majorKeys: true});

      VF.Test.runTests("Minor Key Clef Test",
        VF.Test.ClefKeySignature.keys,
        {majorKeys: false});

      VF.Test.runTests("Stave Helper",
        VF.Test.ClefKeySignature.staveHelper);
    },

    catchError: function(spec) {
      try {
        VF.keySignature(spec);
      } catch (e) {
        equal(e.code, "BadKeySignature", e.message);
      }
    },

    parser: function() {
      expect(11);
      VF.Test.ClefKeySignature.catchError("asdf");
      VF.Test.ClefKeySignature.catchError("D!");
      VF.Test.ClefKeySignature.catchError("E#");
      VF.Test.ClefKeySignature.catchError("D#");
      VF.Test.ClefKeySignature.catchError("#");
      VF.Test.ClefKeySignature.catchError("b");
      VF.Test.ClefKeySignature.catchError("Kb");
      VF.Test.ClefKeySignature.catchError("Fb");
      VF.Test.ClefKeySignature.catchError("Ab");
      VF.Test.ClefKeySignature.catchError("Dbm");
      VF.Test.ClefKeySignature.catchError("B#m");

      VF.keySignature("B");
      VF.keySignature("C");
      VF.keySignature("Fm");
      VF.keySignature("Ab");
      VF.keySignature("Abm");
      VF.keySignature("F#");
      VF.keySignature("G#m");

      ok(true, "all pass");
    },

    keys: function(options, contextBuilder) {

      var clefs =
        ["treble",
        "soprano",
        "mezzo-soprano",
        "alto",
        "tenor",
        "baritone-f",
        "baritone-c",
        "bass",
        "french",
        "subbass",
        "percussion"];

      var ctx = new contextBuilder(options.canvas_sel, 400, 20 + 80 * 2 * clefs.length);


      var staves = [];
      var keys = (options.params.majorKeys) ?
        VF.Test.ClefKeySignature.MAJOR_KEYS :
        VF.Test.ClefKeySignature.MINOR_KEYS;

      var i, flat, sharp, keySig;

      var yOffsetForFlatStaves = 10 + 80 * clefs.length;
      for(i = 0; i<clefs.length; i++) {
        // Render all the sharps first, then all the flats:
        staves[i] = new VF.Stave(10, 10 + 80*i, 390);
        staves[i].addClef(clefs[i]);
        staves[i+clefs.length] = new VF.Stave(10, yOffsetForFlatStaves + 10 + 80*i, 390);
        staves[i+clefs.length].addClef(clefs[i]);

        for(flat = 0; flat < 8; flat++) {
          keySig = new VF.KeySignature(keys[flat]);
          keySig.addToStave(staves[i]);
        }

        for(sharp = 8; sharp < keys.length; sharp++) {
          keySig = new VF.KeySignature(keys[sharp]);
          keySig.addToStave(staves[i+clefs.length]);
        }

        staves[i].setContext(ctx);
        staves[i].draw();
        staves[i + clefs.length].setContext(ctx);
        staves[i + clefs.length].draw();
      }

      ok(true, "all pass");
    },

    staveHelper: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 400);
      var stave = new VF.Stave(10, 10, 370);
      var stave2 = new VF.Stave(10, 90, 370);
      var stave3 = new VF.Stave(10, 170, 370);
      var stave4 = new VF.Stave(10, 260, 370);
      var keys = VF.Test.ClefKeySignature.MAJOR_KEYS;

      stave.addClef("treble");
      stave2.addClef("bass");
      stave3.addClef("alto");
      stave4.addClef("tenor");

      for (var n = 0; n < 8; ++n) {
        stave.addKeySignature(keys[n]);
        stave2.addKeySignature(keys[n]);
      }

      for (var i = 8; i < keys.length; ++i) {
        stave3.addKeySignature(keys[i]);
        stave4.addKeySignature(keys[i]);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();
      stave3.setContext(ctx);
      stave3.draw();
      stave4.setContext(ctx);
      stave4.draw();

      ok(true, "all pass");
    }
  };

  return ClefKeySignature;
})();
/**
 * VexFlow - Music Key Management Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.KeyManager = (function() {
  var KeyManager = {
    Start: function() {
      QUnit.module("KeyManager");
      test("Valid Notes", VF.Test.KeyManager.works);
      test("Select Notes", VF.Test.KeyManager.selectNotes);
    },

    works: function() {
      // expect(1);

      var manager = new VF.KeyManager("g");
      equal(manager.getAccidental("f").accidental, "#");

      manager.setKey("a");
      equal(manager.getAccidental("c").accidental, "#");
      equal(manager.getAccidental("a").accidental, null);
      equal(manager.getAccidental("f").accidental, "#");

      manager.setKey("A");
      equal(manager.getAccidental("c").accidental, "#");
      equal(manager.getAccidental("a").accidental, null);
      equal(manager.getAccidental("f").accidental, "#");
    },

    selectNotes: function(options) {
      var manager = new VF.KeyManager("f");
      equal(manager.selectNote("bb").note, "bb");
      equal(manager.selectNote("bb").accidental, "b");
      equal(manager.selectNote("g").note, "g");
      equal(manager.selectNote("g").accidental, null);
      equal(manager.selectNote("b").note, "b");
      equal(manager.selectNote("b").accidental, null);
      equal(manager.selectNote("a#").note, "bb");
      equal(manager.selectNote("g#").note, "g#");

      // Changes have no effect?
      equal(manager.selectNote("g#").note, "g#");
      equal(manager.selectNote("bb").note, "bb");
      equal(manager.selectNote("bb").accidental, "b");
      equal(manager.selectNote("g").note, "g");
      equal(manager.selectNote("g").accidental, null);
      equal(manager.selectNote("b").note, "b");
      equal(manager.selectNote("b").accidental, null);
      equal(manager.selectNote("a#").note, "bb");
      equal(manager.selectNote("g#").note, "g#");

      // Changes should propagate
      manager.reset();
      equal(manager.selectNote("g#").change, true);
      equal(manager.selectNote("g#").change, false);
      equal(manager.selectNote("g").change, true);
      equal(manager.selectNote("g").change, false);
      equal(manager.selectNote("g#").change, true);

      manager.reset();
      var note = manager.selectNote("bb");
      equal(note.change, false);
      equal(note.accidental, "b");
      note = manager.selectNote("g");
      equal(note.change, false);
      equal(note.accidental, null);
      note = manager.selectNote("g#");
      equal(note.change, true);
      equal(note.accidental, "#");
      note = manager.selectNote("g");
      equal(note.change, true);
      equal(note.accidental, null);
      note = manager.selectNote("g");
      equal(note.change, false);
      equal(note.accidental, null);
      note = manager.selectNote("g#");
      equal(note.change, true);
      equal(note.accidental, "#");
    }
  }

  return KeyManager;
})();
/**
 * VexFlow - Key Signature Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.KeySignature = (function() {
  function catchError(spec) {
    try {
      VF.keySignature(spec);
    } catch (e) {
      equal(e.code, "BadKeySignature", e.message);
    }
  }

  KeySignature = {
    MAJOR_KEYS: [
      "C",
      "F",
      "Bb",
      "Eb",
      "Ab",
      "Db",
      "Gb",
      "Cb",
      "G",
      "D",
      "A",
      "E",
      "B",
      "F#",
      "C#"],

    MINOR_KEYS: [
      "Am",
      "Dm",
      "Gm",
      "Cm",
      "Fm",
      "Bbm",
      "Ebm",
      "Abm",
      "Em",
      "Bm",
      "F#m",
      "C#m",
      "G#m",
      "D#m",
      "A#m"],

    Start: function() {
      QUnit.module("KeySignature");
      test("Key Parser Test", VF.Test.KeySignature.parser);
      VF.Test.runTests("Major Key Test", VF.Test.KeySignature.majorKeys);
      VF.Test.runTests("Minor Key Test", VF.Test.KeySignature.minorKeys);
      VF.Test.runTests("Stave Helper", VF.Test.KeySignature.staveHelper);
      VF.Test.runTests("Cancelled key test", VF.Test.KeySignature.majorKeysCanceled);
    },

    parser: function() {
      expect(11);
      catchError("asdf");
      catchError("D!");
      catchError("E#");
      catchError("D#");
      catchError("#");
      catchError("b");
      catchError("Kb");
      catchError("Fb");
      catchError("Ab");
      catchError("Dbm");
      catchError("B#m");

      VF.keySignature("B");
      VF.keySignature("C");
      VF.keySignature("Fm");
      VF.keySignature("Ab");
      VF.keySignature("Abm");
      VF.keySignature("F#");
      VF.keySignature("G#m");

      ok(true, "all pass");
    },

    majorKeys: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 240);
      var stave = new VF.Stave(10, 10, 350);
      var stave2 = new VF.Stave(10, 90, 350);
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      for (var i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.addToStave(stave);
      }

      for (var n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.addToStave(stave2);
      }


      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();

      ok(true, "all pass");
    },

    majorKeysCanceled: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 780, 500);
      ctx.scale(0.9, 0.9);
      var stave = new VF.Stave(10, 10, 750).addTrebleGlyph();
      var stave2 = new VF.Stave(10, 90, 750).addTrebleGlyph();
      var stave3 = new VF.Stave(10, 170, 750).addTrebleGlyph();
      var stave4 = new VF.Stave(10, 250, 750).addTrebleGlyph();
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      var i, n;
      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.cancelKey("Cb");

        keySig.padding = 18;
        keySig.addToStave(stave);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.cancelKey("C#");
        keySig.padding = 20;
        keySig.addToStave(stave2);
      }

      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.cancelKey("E");

        keySig.padding = 18;
        keySig.addToStave(stave3);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.cancelKey("Ab");
        keySig.padding = 20;
        keySig.addToStave(stave4);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();
      stave3.setContext(ctx);
      stave3.draw();
      stave4.setContext(ctx);
      stave4.draw();


      ok(true, "all pass");
    },

    minorKeys: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 240);
      var stave = new VF.Stave(10, 10, 350);
      var stave2 = new VF.Stave(10, 90, 350);
      var keys = VF.Test.KeySignature.MINOR_KEYS;

      var keySig = null;
      for (var i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.addToStave(stave);
      }

      for (var n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.addToStave(stave2);
      }


      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();

      ok(true, "all pass");
    },

    staveHelper: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 240);
      var stave = new VF.Stave(10, 10, 350);
      var stave2 = new VF.Stave(10, 90, 350);
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      for (var i = 0; i < 8; ++i) {
        stave.addKeySignature(keys[i]);
      }

      for (var n = 8; n < keys.length; ++n) {
        stave2.addKeySignature(keys[n]);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();

      ok(true, "all pass");
    }
  };

  return KeySignature;
})();
/**
 * VexFlow - ModifierContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ModifierContext = (function() {
  var ModifierContext = {
    Start: function() {
      QUnit.module("ModifierContext");
      test("Modifier Width Test", ModifierContext.width);
      test("Modifier Management", ModifierContext.management);
    },

    width: function() {
      var mc = new VF.ModifierContext();
      equal(mc.getWidth(), 0, "New modifier context has no width");
    },

    management: function() {
      var mc = new VF.ModifierContext();
      var modifier1 = new VF.Modifier();
      var modifier2 = new VF.Modifier();

      mc.addModifier(modifier1);
      mc.addModifier(modifier2);

      var accidentals = mc.getModifiers("none");

      equal(accidentals.length, 2, "Added two modifiers");
    },
  }

  return ModifierContext;
})();
/**
 * VexFlow - Music API Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Music = (function() {
  var Music = {
    Start: function() {
      QUnit.module("Music");
      test("Valid Notes", Music.validNotes);
      test("Valid Keys", Music.validKeys);
      test("Note Values", Music.noteValue);
      test("Interval Values", Music.intervalValue);
      test("Relative Notes", Music.relativeNotes);
      test("Relative Note Names", Music.relativeNoteNames);
      test("Canonical Notes", Music.canonicalNotes);
      test("Canonical Intervals", Music.canonicalNotes);
      test("Scale Tones", Music.scaleTones);
      test("Scale Intervals", Music.scaleIntervals);
    },

    validNotes: function() {
      expect(10);

      var music = new VF.Music();

      var parts = music.getNoteParts("c");
      equal(parts.root, "c");
      equal(parts.accidental, null);

      parts = music.getNoteParts("C");
      equal(parts.root, "c");
      equal(parts.accidental, null);

      parts = music.getNoteParts("c#");
      equal(parts.root, "c");
      equal(parts.accidental, "#");

      parts = music.getNoteParts("c##");
      equal(parts.root, "c");
      equal(parts.accidental, "##");

      try {
        music.getNoteParts("r");
      } catch (e) {
        equal(e.code, "BadArguments", "Invalid note: r");
      }

      try {
        music.getNoteParts("");
      } catch (e) {
        equal(e.code, "BadArguments", "Invalid note: ''");
      }
    },

    validKeys: function() {
      expect(18);

      var music = new VF.Music();

      var parts = music.getKeyParts("c");
      equal(parts.root, "c");
      equal(parts.accidental, null);
      equal(parts.type, "M");

      parts = music.getKeyParts("d#");
      equal(parts.root, "d");
      equal(parts.accidental, "#");
      equal(parts.type, "M");

      parts = music.getKeyParts("fbm");
      equal(parts.root, "f");
      equal(parts.accidental, "b");
      equal(parts.type, "m");

      parts = music.getKeyParts("c#mel");
      equal(parts.root, "c");
      equal(parts.accidental, "#");
      equal(parts.type, "mel");

      parts = music.getKeyParts("g#harm");
      equal(parts.root, "g");
      equal(parts.accidental, "#");
      equal(parts.type, "harm");

      try {
        music.getKeyParts("r");
      } catch (e) {
        equal(e.code, "BadArguments", "Invalid key: r");
      }

      try {
        music.getKeyParts("");
      } catch (e) {
        equal(e.code, "BadArguments", "Invalid key: ''");
      }

      try {
        music.getKeyParts("#m");
      } catch (e) {
        equal(e.code, "BadArguments", "Invalid key: #m");
      }
    },

    noteValue: function() {
      expect(3);

      var music = new VF.Music();

      var note = music.getNoteValue("c");
      equal(note, 0);

      try {
        music.getNoteValue("r");
      } catch(e) {
        ok(true, "Invalid note");
      }

      note = music.getNoteValue("f#");
      equal(note, 6);
    },

    intervalValue: function() {
      expect(2);

      var music = new VF.Music();

      var value = music.getIntervalValue("b2");
      equal(value, 1);

      try {
        music.getIntervalValue("7");
      } catch(e) {
        ok(true, "Invalid note");
      }
    },

    relativeNotes: function() {
      expect(8);

      var music = new VF.Music();

      var value = music.getRelativeNoteValue(music.getNoteValue("c"),
          music.getIntervalValue("b5"));
      equal(value, 6);

      try {
        music.getRelativeNoteValue(music.getNoteValue("bc"),
            music.getIntervalValue("b2"));
      } catch(e) {
        ok(true, "Invalid note");
      }

      try {
        music.getRelativeNoteValue(music.getNoteValue("b"),
            music.getIntervalValue("p3"));
      } catch(e) {
        ok(true, "Invalid interval");
      }

      // Direction
      value = music.getRelativeNoteValue(music.getNoteValue("d"),
          music.getIntervalValue("2"), -1);
      equal(value, 0);

      try {
        music.getRelativeNoteValue(music.getNoteValue("b"),
            music.getIntervalValue("p4"), 0);
      } catch(e) {
        ok(true, "Invalid direction");
      }

      // Rollover
      value = music.getRelativeNoteValue(music.getNoteValue("b"),
          music.getIntervalValue("b5"));
      equal(value, 5);

      // Reverse rollover
      value = music.getRelativeNoteValue(music.getNoteValue("c"),
          music.getIntervalValue("b2"), -1);
      equal(value, 11);

      // Practical tests
      value = music.getRelativeNoteValue(music.getNoteValue("g"),
          music.getIntervalValue("p5"));
      equal(value, 2);
    },

    relativeNoteNames: function() {
      expect(9);

      var music = new VF.Music();
      equal(music.getRelativeNoteName("c", music.getNoteValue("c")), "c");
      equal(music.getRelativeNoteName("c", music.getNoteValue("db")), "c#");
      equal(music.getRelativeNoteName("c#", music.getNoteValue("db")), "c#");
      equal(music.getRelativeNoteName("e", music.getNoteValue("f#")), "e##");
      equal(music.getRelativeNoteName("e", music.getNoteValue("d#")), "eb");
      equal(music.getRelativeNoteName("e", music.getNoteValue("fb")), "e");

      try {
        music.getRelativeNoteName("e", music.getNoteValue("g#"));
      } catch(e) {
        ok(true, "Too far");
      }

      equal(music.getRelativeNoteName("b", music.getNoteValue("c#")), "b##");
      equal(music.getRelativeNoteName("c", music.getNoteValue("b")), "cb");
    },

    canonicalNotes: function() {
      expect(3);

      var music = new VF.Music();

      equal(music.getCanonicalNoteName(0), "c");
      equal(music.getCanonicalNoteName(2), "d");

      try {
        music.getCanonicalNoteName(-1);
      } catch(e) {
        ok(true, "Invalid note value");
      }
    },

    canonicalIntervals: function() {
      expect(3);

      var music = new VF.Music();

      equal(music.getCanonicalIntervalName(0), "unison");
      equal(music.getCanonicalIntervalName(2), "M2");

      try {
        music.getCanonicalIntervalName(-1);
      } catch(e) {
        ok(true, "Invalid interval value");
      }
    },

    scaleTones: function() {
      expect(24);

      // C Major
      var music = new VF.Music();
      var manager = new VF.KeyManager("CM");

      var c_major = music.getScaleTones(
          music.getNoteValue("c"), VF.Music.scales.major);
      var values = ["c", "d", "e", "f", "g", "a", "b"];

      equal(c_major.length, 7);

      for (var cm = 0; cm < c_major.length; ++cm) {
        equal(music.getCanonicalNoteName(c_major[cm]), values[cm]);
      }

      // Dorian
      var c_dorian = music.getScaleTones(
          music.getNoteValue("c"), VF.Music.scales.dorian);
      values = ["c", "d", "eb", "f", "g", "a", "bb"];

      var note = null;
      equal(c_dorian.length,  7);
      for (var cd = 0; cd < c_dorian.length; ++cd) {
          note = music.getCanonicalNoteName(c_dorian[cd]);
          equal(manager.selectNote(note).note, values[cd]);
      }

      // Mixolydian
      var c_mixolydian = music.getScaleTones(
          music.getNoteValue("c"), VF.Music.scales.mixolydian);
      values = ["c", "d", "e", "f", "g", "a", "bb"];

      equal(c_mixolydian.length,  7);

      for (var i = 0; i < c_mixolydian.length; ++i) {
          note = music.getCanonicalNoteName(c_mixolydian[i]);
          equal(manager.selectNote(note).note, values[i]);
      }
    },

    scaleIntervals: function() {
      expect(6);

      var music = new VF.Music();

      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
             music.getNoteValue("c"), music.getNoteValue("d"))), "M2");
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
             music.getNoteValue("g"), music.getNoteValue("c"))), "p4");
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
             music.getNoteValue("c"), music.getNoteValue("c"))), "unison");
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
             music.getNoteValue("f"), music.getNoteValue("cb"))), "dim5");

      // Forwards and backwards
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
             music.getNoteValue("d"), music.getNoteValue("c"), 1)), "b7");
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
             music.getNoteValue("d"), music.getNoteValue("c"), -1)), "M2");
    }
  };

  return Music;
})();
/**
 * VexFlow - NoteHead Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.NoteHead = (function() {
  var NoteHead = {
    Start: function(){
      QUnit.module("NoteHead");
      VF.Test.runTests("Basic", VF.Test.NoteHead.basic);
      VF.Test.runTests("Bounding Boxes", VF.Test.NoteHead.basicBoundingBoxes);
    },

    setupContext: function(options, x, y) {

      var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 10, x || 450).addTrebleGlyph();

      return {context: ctx, stave: stave};
    },

    basic: function(options, contextBuilder){
      options.contextBuilder = contextBuilder;
      var c = VF.Test.NoteHead.setupContext(options, 450, 250);

      c.stave = new VF.Stave(10, 0, 250).addTrebleGlyph();

      c.context.scale(2.0, 2.0);
      c.stave.setContext(c.context).draw();

      var formatter = new VF.Formatter();
      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);

      var note_head1 = new VF.NoteHead({
        duration: "4",
        line: 3
      });

      var note_head2 = new VF.NoteHead({
        duration: "1",
        line: 2.5
      });

      var note_head3 = new VF.NoteHead({
        duration: "2",
        line: 0
      });

      voice.addTickables([note_head1, note_head2, note_head3]);
      formatter.joinVoices([voice]).formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      ok("Basic NoteHead test");
    },

    basicBoundingBoxes: function(options, contextBuilder){
      options.contextBuilder = contextBuilder;
      var c = VF.Test.NoteHead.setupContext(options, 350, 250);

      c.stave = new VF.Stave(10, 0, 250).addTrebleGlyph();

      c.context.scale(2.0, 2.0);
      c.stave.setContext(c.context).draw();

      var formatter = new VF.Formatter();
      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);

      var note_head1 = new VF.NoteHead({
        duration: "4",
        line: 3
      });

      var note_head2 = new VF.NoteHead({
        duration: "2",
        line: 2.5
      });

      var note_head3 = new VF.NoteHead({
        duration: "1",
        line: 0
      });

      voice.addTickables([note_head1, note_head2, note_head3]);
      formatter.joinVoices([voice]).formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      note_head1.getBoundingBox().draw(c.context);
      note_head2.getBoundingBox().draw(c.context);
      note_head3.getBoundingBox().draw(c.context);

      ok("NoteHead Bounding Boxes");
    }
  };

  return NoteHead;
})();
/*
  VexFlow - Ornament Tests
  Copyright Mohit Cheppudira 2010 <mohit@muthanna.com>
  Author: Cyril Silverman
*/

VF.Test.Ornament = (function() {
  var Ornament = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Ornament");
      runTests("Ornaments", Ornament.drawOrnaments);
      runTests("Ornaments Vertically Shifted", Ornament.drawOrnamentsDisplaced);
      runTests("Ornaments - Delayed turns", Ornament.drawOrnamentsDelayed);
      runTests("Stacked", Ornament.drawOrnamentsStacked);
      runTests("With Upper/Lower Accidentals", Ornament.drawOrnamentsWithAccidentals);
    },

    drawOrnaments: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 750, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 700);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("mordent"));
      notesBar1[1].addModifier(0, new VF.Ornament("mordent_inverted"));
      notesBar1[2].addModifier(0, new VF.Ornament("turn"));
      notesBar1[3].addModifier(0, new VF.Ornament("turn_inverted"));
      notesBar1[4].addModifier(0, new VF.Ornament("tr"));
      notesBar1[5].addModifier(0, new VF.Ornament("upprall"));
      notesBar1[6].addModifier(0, new VF.Ornament("downprall"));
      notesBar1[7].addModifier(0, new VF.Ornament("prallup"));
      notesBar1[8].addModifier(0, new VF.Ornament("pralldown"));
      notesBar1[9].addModifier(0, new VF.Ornament("upmordent"));
      notesBar1[10].addModifier(0, new VF.Ornament("downmordent"));
      notesBar1[11].addModifier(0, new VF.Ornament("lineprall"));
      notesBar1[12].addModifier(0, new VF.Ornament("prallprall"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsDisplaced: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 750, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 700);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("mordent"));
      notesBar1[1].addModifier(0, new VF.Ornament("mordent_inverted"));
      notesBar1[2].addModifier(0, new VF.Ornament("turn"));
      notesBar1[3].addModifier(0, new VF.Ornament("turn_inverted"));
      notesBar1[4].addModifier(0, new VF.Ornament("tr"));
      notesBar1[5].addModifier(0, new VF.Ornament("upprall"));
      notesBar1[6].addModifier(0, new VF.Ornament("downprall"));
      notesBar1[7].addModifier(0, new VF.Ornament("prallup"));
      notesBar1[8].addModifier(0, new VF.Ornament("pralldown"));
      notesBar1[9].addModifier(0, new VF.Ornament("upmordent"));
      notesBar1[10].addModifier(0, new VF.Ornament("downmordent"));
      notesBar1[11].addModifier(0, new VF.Ornament("lineprall"));
      notesBar1[12].addModifier(0, new VF.Ornament("prallprall"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsDelayed: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 550, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 500);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("turn").setDelayed(true));
      notesBar1[1].addModifier(0, new VF.Ornament("turn_inverted").setDelayed(true));
      notesBar1[2].addModifier(0, new VF.Ornament("turn_inverted").setDelayed(true));
      notesBar1[3].addModifier(0, new VF.Ornament("turn").setDelayed(true));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsStacked: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 550, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 500);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("mordent"));
      notesBar1[1].addModifier(0, new VF.Ornament("turn_inverted"));
      notesBar1[2].addModifier(0, new VF.Ornament("turn"));
      notesBar1[3].addModifier(0, new VF.Ornament("turn_inverted"));

      notesBar1[0].addModifier(0, new VF.Ornament("turn"));
      notesBar1[1].addModifier(0, new VF.Ornament("prallup"));
      notesBar1[2].addModifier(0, new VF.Ornament("upmordent"));
      notesBar1[3].addModifier(0, new VF.Ornament("lineprall"));


      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsWithAccidentals: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel,650, 250);

      // bar 1
      var staveBar1 = new VF.Stave(10, 60, 600);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("mordent").setUpperAccidental("#").setLowerAccidental("#"));
      notesBar1[1].addModifier(0, new VF.Ornament("turn_inverted").setLowerAccidental("b").setUpperAccidental("b"));
      notesBar1[2].addModifier(0, new VF.Ornament("turn").setUpperAccidental("##").setLowerAccidental("##"));
      notesBar1[3].addModifier(0, new VF.Ornament("mordent_inverted").setLowerAccidental("db").setUpperAccidental("db"));
      notesBar1[4].addModifier(0, new VF.Ornament("turn_inverted").setUpperAccidental("++").setLowerAccidental("++"));
      notesBar1[5].addModifier(0, new VF.Ornament("tr").setUpperAccidental("n").setLowerAccidental("n"));
      notesBar1[6].addModifier(0, new VF.Ornament("prallup").setUpperAccidental("d").setLowerAccidental('d'));
      notesBar1[7].addModifier(0, new VF.Ornament("lineprall").setUpperAccidental("db").setLowerAccidental('db'));
      notesBar1[8].addModifier(0, new VF.Ornament("upmordent").setUpperAccidental("bbs").setLowerAccidental('bbs'));
      notesBar1[9].addModifier(0, new VF.Ornament("prallprall").setUpperAccidental("bb").setLowerAccidental('bb'));
      notesBar1[10].addModifier(0, new VF.Ornament("turn_inverted").setUpperAccidental("+").setLowerAccidental('+'));



      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    }
  };

  return Ornament;
})();
/**
 * VexFlow - PedalMarking Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.PedalMarking = (function() {
  var PedalMarking = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("PedalMarking");
      runTests("Simple Pedal 1", PedalMarking.simpleText);
      runTests("Simple Pedal 2", PedalMarking.simpleBracket);
      runTests("Simple Pedal 3", PedalMarking.simpleMixed);
      runTests("Release and Depress on Same Note 1", PedalMarking.releaseDepressOnSameNoteBracketed);
      runTests("Release and Depress on Same Note 2", PedalMarking.releaseDepressOnSameNoteMixed);
      runTests("Custom Text 1", PedalMarking.customText);
      runTests("Custom Text 2", PedalMarking.customTextMixed);
    },

    simpleText: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[2], notes0[3], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.TEXT);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    simpleBracket: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[2], notes0[3], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.BRACKET);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    simpleMixed: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[2], notes0[3], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.MIXED);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    releaseDepressOnSameNoteBracketed: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[3], notes0[3], notes1[1], notes1[1], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.BRACKET);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    releaseDepressOnSameNoteMixed: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[3], notes0[3], notes1[1], notes1[1],  notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.MIXED);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    customText: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.TEXT);

      pedal.setCustomText("una corda", "tre corda");

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();
    },

    customTextMixed: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.MIXED);
      pedal.setCustomText("Sost. Ped.");

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();
    }
  };

  return PedalMarking;
})();
/**
 * VexFlow - Percussion Tests
 * Copyright Mike Corrigan 2012 <corrigan@gmail.com>
 */

VF.Test.Percussion = (function() {
  var Percussion = {
    Start: function() {
      QUnit.module("Percussion");
      Percussion.runBoth("Percussion Clef", Percussion.draw);
      Percussion.runBoth("Percussion Notes", Percussion.drawNotes);
      Percussion.runBoth("Percussion Basic0", Percussion.drawBasic0);
      Percussion.runBoth("Percussion Basic1", Percussion.drawBasic1);
      Percussion.runBoth("Percussion Basic2", Percussion.drawBasic2);
      Percussion.runBoth("Percussion Snare0", Percussion.drawSnare0);
      Percussion.runBoth("Percussion Snare1", Percussion.drawSnare1);
      Percussion.runBoth("Percussion Snare2", Percussion.drawSnare2);
    },

    runBoth: function(title, func) {
      VF.Test.runTests(title, func);
    },

    newModifier: function(s) {
      return new VF.Annotation(s).setFont("Arial", 12)
        .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
    },

    newArticulation: function(s) {
      return new VF.Articulation(s).setPosition(VF.Modifier.Position.ABOVE);
    },

    newTremolo: function(s) {
      return new VF.Tremolo(s);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);

      var stave = new VF.Stave(10, 10, 300);
      stave.addClef("percussion");
      stave.setContext(ctx);
      stave.draw();

      ok(true, "");
    },

    showNote: function(note_struct, stave, ctx, x) {
      var note = new VF.StaveNote(note_struct);
      var tickContext = new VF.TickContext();
      tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(20);
      note.setContext(ctx).setStave(stave);
      note.draw();
      return note;
    },

    drawNotes: function(options, contextBuilder) {
      var notes = [
        { keys: ["g/5/d0"], duration: "q"},
        { keys: ["g/5/d1"], duration: "q"},
        { keys: ["g/5/d2"], duration: "q"},
        { keys: ["g/5/d3"], duration: "q"},
        { keys: ["x/"], duration: "w"},

        { keys: ["g/5/t0"], duration: "w"},
        { keys: ["g/5/t1"], duration: "q"},
        { keys: ["g/5/t2"], duration: "q"},
        { keys: ["g/5/t3"], duration: "q"},
        { keys: ["x/"], duration: "w"},

        { keys: ["g/5/x0"], duration: "w"},
        { keys: ["g/5/x1"], duration: "q"},
        { keys: ["g/5/x2"], duration: "q"},
        { keys: ["g/5/x3"], duration: "q"}
      ];
      expect(notes.length * 4);

      var ctx = new contextBuilder(options.canvas_sel,
        notes.length * 25 + 100, 240);

      // Draw two staves, one with up-stems and one with down-stems.
      for (var h = 0; h < 2; ++h) {
        var stave = new VF.Stave(10, 10 + h * 120, notes.length * 25 + 75);
        stave.addClef("percussion");
        stave.setContext(ctx);
        stave.draw();

        var showNote = VF.Test.Percussion.showNote;

        for (var i = 0; i < notes.length; ++i) {
          var note = notes[i];
          note.stem_direction = (h == 0 ? -1 : 1);
          var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

          ok(staveNote.getX() > 0, "Note " + i + " has X value");
          ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
        }
      }
    },

    drawBasic0: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");
      var stave = new VF.Stave(10, 10, 420);
      stave.addClef("percussion");
      stave.setContext(ctx);
      stave.draw();

      var notesUp = [
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" })
      ];
      var beamUp = new VF.Beam(notesUp.slice(0,8));
      var voiceUp = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceUp.addTickables(notesUp);

      var notesDown = [
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 })
      ];
      var beamDown1 = new VF.Beam(notesDown.slice(0,2));
      var beamDown2 = new VF.Beam(notesDown.slice(3,6));
      var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceDown.addTickables(notesDown);

      var formatter = new VF.Formatter().joinVoices([voiceUp, voiceDown]).
         formatToStave([voiceUp, voiceDown], stave);

      voiceUp.draw(ctx, stave);
      voiceDown.draw(ctx, stave);

      beamUp.setContext(ctx).draw();
      beamDown1.setContext(ctx).draw();
      beamDown2.setContext(ctx).draw();

      ok(true, "");
    },

    drawBasic1: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");
      var stave = new VF.Stave(10, 10, 420);
      stave.addClef("percussion");
      stave.setContext(ctx);
      stave.draw();

      var notesUp = [
        new VF.StaveNote({ keys: ["f/5/x2"], duration: "q" }),
        new VF.StaveNote({ keys: ["f/5/x2"], duration: "q" }),
        new VF.StaveNote({ keys: ["f/5/x2"], duration: "q" }),
        new VF.StaveNote({ keys: ["f/5/x2"], duration: "q" })
      ];
      var voiceUp = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceUp.addTickables(notesUp);

      var notesDown = [
        new VF.StaveNote({ keys: ["f/4"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 })
      ];
      var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceDown.addTickables(notesDown);

      var formatter = new VF.Formatter().joinVoices([voiceUp, voiceDown]).
          formatToStave([voiceUp, voiceDown], stave);

      voiceUp.draw(ctx, stave);
      voiceDown.draw(ctx, stave);

      ok(true, "");
    },

    drawBasic2: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");
      var stave = new VF.Stave(10, 10, 420);
      stave.addClef("percussion");
      stave.setContext(ctx);
      stave.draw();

      var notesUp = [
        new VF.StaveNote({ keys: ["a/5/x3"], duration: "8" }).
          addModifier(0, (new VF.Annotation("<")).setFont()),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" })
      ];
      var beamUp = new VF.Beam(notesUp.slice(1,8));
      var voiceUp = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceUp.addTickables(notesUp);

      var notesDown = [
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "8d",
          stem_direction: -1 }).addDotToAll(),
        new VF.StaveNote({ keys: ["c/5"], duration: "16",
          stem_direction: -1 })
      ];
      var beamDown1 = new VF.Beam(notesDown.slice(0,2));
      var beamDown2 = new VF.Beam(notesDown.slice(4,6));
      var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceDown.addTickables(notesDown);

      var formatter = new VF.Formatter().joinVoices([voiceUp, voiceDown]).
        formatToStave([voiceUp, voiceDown], stave);

      voiceUp.draw(ctx, stave);
      voiceDown.draw(ctx, stave);

      beamUp.setContext(ctx).draw();
      beamDown1.setContext(ctx).draw();
      beamDown2.setContext(ctx).draw();

      ok(true, "");
    },

    drawSnare0: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 600, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");

      var x = 10;
      var y = 10;
      var w = 280;

      {
        var stave = new VF.Stave(x, y, w);
        stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
        stave.setEndBarType(VF.Barline.type.SINGLE);
        stave.addClef("percussion");
        stave.setContext(ctx);
        stave.draw();

        var notesDown = [
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("a>")).
            addModifier(0, VF.Test.Percussion.newModifier("L")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("R")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("L")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("L"))
        ];
        var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
            resolution: VF.RESOLUTION });
        voiceDown.addTickables(notesDown);

        var formatter = new VF.Formatter().
          joinVoices([voiceDown]).formatToStave([voiceDown], stave);

        voiceDown.draw(ctx, stave);

        x += stave.width;
      }

      {
        var stave = new VF.Stave(x, y, w);
        stave.setBegBarType(VF.Barline.type.NONE);
        stave.setEndBarType(VF.Barline.type.REPEAT_END);
        stave.setContext(ctx);
        stave.draw();

        var notesDown = [
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("a>")).
            addModifier(0, VF.Test.Percussion.newModifier("R")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("L")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("R")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("R"))
        ];
        var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
          resolution: VF.RESOLUTION });
        voiceDown.addTickables(notesDown);

        var formatter = new VF.Formatter().
          joinVoices([voiceDown]).formatToStave([voiceDown], stave);

        voiceDown.draw(ctx, stave);

        x += stave.width;
      }

      ok(true, "");
    },

    drawSnare1: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 600, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");

      var x = 10;
      var y = 10;
      var w = 280;

      {
        var stave = new VF.Stave(x, y, w);
        stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
        stave.setEndBarType(VF.Barline.type.SINGLE);
        stave.addClef("percussion");
        stave.setContext(ctx);
        stave.draw();

        var notesDown = [
          new VF.StaveNote({ keys: ["g/5/x2"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("ah")),
          new VF.StaveNote({ keys: ["g/5/x2"], duration: "q",
            stem_direction: -1 }),
          new VF.StaveNote({ keys: ["g/5/x2"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("ah")),
          new VF.StaveNote({ keys: ["a/5/x3"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("a,")),
        ];
        var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
            resolution: VF.RESOLUTION });
        voiceDown.addTickables(notesDown);

        var formatter = new VF.Formatter().
          joinVoices([voiceDown]).formatToStave([voiceDown], stave);

        voiceDown.draw(ctx, stave);

        x += stave.width;
      }

      ok(true, "");
    },

    drawSnare2: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 600, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");

      var x = 10;
      var y = 10;
      var w = 280;

      {
        var stave = new VF.Stave(x, y, w);
        stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
        stave.setEndBarType(VF.Barline.type.SINGLE);
        stave.addClef("percussion");
        stave.setContext(ctx);
        stave.draw();

        var notesDown = [
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newTremolo(0)),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newTremolo(1)),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newTremolo(3)),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newTremolo(5)),
        ];
        var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
            resolution: VF.RESOLUTION });
        voiceDown.addTickables(notesDown);

        var formatter = new VF.Formatter().
          joinVoices([voiceDown]).formatToStave([voiceDown], stave);

        voiceDown.draw(ctx, stave);

        x += stave.width;
      }

      ok(true, "");
    }
  };

  return Percussion;
})();
/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

VF.Test.Rests = (function() {
  var Rests = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Rests");
      runTests("Rests - Dotted", Rests.basic);
      runTests("Auto Align Rests - Beamed Notes Stems Up", Rests.beamsUp);
      runTests("Auto Align Rests - Beamed Notes Stems Down", Rests.beamsDown);
      runTests("Auto Align Rests - Tuplets Stems Up", Rests.tuplets);
      runTests("Auto Align Rests - Tuplets Stems Down", Rests.tupletsdown);
      runTests("Auto Align Rests - Single Voice (Default)", Rests.staveRests);
      runTests("Auto Align Rests - Single Voice (Align All)", Rests.staveRestsAll);
      runTests("Auto Align Rests - Multi Voice", Rests.multi);
    },

    setupContext: function(options, contextBuilder, x, y) {
      var ctx = new contextBuilder(options.canvas_sel, x || 350, y || 150);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, x || 350).addTrebleGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    basic: function(options, contextBuilder) {
      var c = VF.Test.Rests.setupContext(options, contextBuilder, 700);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "wr"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "hr"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "16r"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "32r"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "64r"}).addDotToAll()
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);

      voice.setStrict(false);
      voice.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice.draw(c.context, c.stave);

      ok(true, "Dotted Rest Test");
    },

    beamsUp: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["b/4","d/5","a/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["b/4","d/5","a/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),

      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      var beam1 = new VF.Beam(notes.slice(0, 4));
      var beam2 = new VF.Beam(notes.slice(4, 8));
      var beam3 = new VF.Beam(notes.slice(8,12));


      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Beams Up Test");
    },

    beamsDown: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["b/4","d/5","a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["b/4","d/5","a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),

      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      var beam1 = new VF.Beam(notes.slice(0, 4));
      var beam2 = new VF.Beam(notes.slice(4, 8));
      var beam3 = new VF.Beam(notes.slice(8, 12));

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Beams Down Test");
    },

    tuplets: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["a/5"], stem_direction: 1, duration: "qr"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "q"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
      ];

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6));
      var tuplet3 = new VF.Tuplet(notes.slice(6, 9));
      var tuplet4 = new VF.Tuplet(notes.slice(9, 12));
      tuplet1.setTupletLocation(VF.Tuplet.LOCATION_TOP);
      tuplet2.setTupletLocation(VF.Tuplet.LOCATION_TOP);
      tuplet3.setTupletLocation(VF.Tuplet.LOCATION_TOP);
      tuplet4.setTupletLocation(VF.Tuplet.LOCATION_TOP);

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();
      tuplet4.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Tuplets Stem Up Test");
    },

    tupletsdown: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/5"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
      ];

      var beam1 = new VF.Beam(notes.slice(0, 3));
      var beam2 = new VF.Beam(notes.slice(3, 6));
      var beam3 = new VF.Beam(notes.slice(6, 9));
      var beam4 = new VF.Beam(notes.slice(9, 12));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6));
      var tuplet3 = new VF.Tuplet(notes.slice(6, 9));
      var tuplet4 = new VF.Tuplet(notes.slice(9, 12));
      tuplet1.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet2.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet3.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet4.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();
      tuplet4.setContext(c.context).draw();

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();
      beam4.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Tuplets Stem Down Test");
    },

    staveRests: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "q"}),

        newNote({ keys: ["d/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
      ];

      var beam1 = new VF.Beam(notes.slice(5, 9));
      var tuplet = new VF.Tuplet(notes.slice(9, 12));
      tuplet.setTupletLocation(VF.Tuplet.LOCATION_TOP);

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);
      tuplet.setContext(c.context).draw();
      beam1.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Default Test");
    },


    staveRestsAll: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "q"}),

        newNote({ keys: ["d/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
      ];

      var beam1 = new VF.Beam(notes.slice(5, 9));
      var tuplet = new VF.Tuplet(notes.slice(9, 12));
      tuplet.setTupletLocation(VF.Tuplet.LOCATION_TOP);

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      // Set option to position rests near the notes in the voice
      new VF.Formatter.FormatAndDraw(c.context, c.stave, notes, {align_rests: true});

      voice1.draw(c.context, c.stave);
      tuplet.setContext(c.context).draw();
      beam1.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Align All Test");
    },

    multi: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) {
        return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) {
        return new VF.StringNumber(num).setPosition(pos);}
      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.addTimeSignature("4/4");
      stave.draw();

      var notes = [
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["b/4"], duration: "qr" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" }),
        newNote({ keys: ["b/4"], duration: "qr" })
      ];

      var notes2 = [
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      // Set option to position rests near the notes in each voice
      var formatter = new VF.Formatter().
        joinVoices([voice, voice2]).
        format([voice, voice2], 400, {align_rests: true});

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice2.draw(c, stave);
      beam2_1.setContext(c).draw();
      beam2_2.setContext(c).draw();
      voice.draw(c, stave);

      ok(true, "Strokes Test Multi Voice");
    }
  };

  return Rests;
})();
/**
 * VexFlow - Rhythm Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Rhythm = (function() {
  var Rhythm = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Rhythm");
      runTests("Rhythm Draw - slash notes", Rhythm.drawBasic);
      runTests("Rhythm Draw - beamed slash notes", Rhythm.drawBeamedSlashNotes);
      runTests("Rhythm Draw - beamed slash notes, some rests", Rhythm.drawSlashAndBeamAndRests);
      runTests("Rhythm Draw - 16th note rhythm with scratches", Rhythm.drawSixtenthWithScratches);
      runTests("Rhythm Draw - 32nd note rhythm with scratches", Rhythm.drawThirtySecondWithScratches);
    },

    drawSlash: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 180);
      var stave = new VF.Stave(10, 10, 350);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { keys: ["b/4"], duration: "ws", stem_direction: -1},
        { keys: ["b/4"], duration: "hs", stem_direction: -1},
        { keys: ["b/4"], duration: "qs", stem_direction: -1},
        { keys: ["b/4"], duration: "8s", stem_direction: -1},
        { keys: ["b/4"], duration: "16s", stem_direction: -1},
        { keys: ["b/4"], duration: "32s", stem_direction: -1},
        { keys: ["b/4"], duration: "64s", stem_direction: -1}
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, "Note " + i + " has X value");
        ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
      }
    },

    drawBasic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 150);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("C");
      staveBar1.setContext(ctx).draw();

      var notesBar1 = [
        new VF.StaveNote(
            { keys: ["b/4"], duration: "1s", stem_direction: -1 })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x,
                                         staveBar1.y, 120);
      staveBar2.setBegBarType(VF.Barline.type.SINGLE);
      staveBar2.setEndBarType(VF.Barline.type.SINGLE);
      staveBar2.setContext(ctx).draw();

      // bar 2
      var notesBar2 = [
        new VF.StaveNote(
            { keys: ["b/4"], duration: "2s",stem_direction: -1 }),
        new VF.StaveNote(
            { keys: ["b/4"], duration: "2s",stem_direction: -1 })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);


      // bar 3 - juxtaposing second bar next to first bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x,
                                         staveBar2.y, 170);
      staveBar3.setContext(ctx).draw();

      // bar 3
      var notesBar3 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "4s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "4s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "4s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "4s",
                                 stem_direction: -1 })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

      // bar 4 - juxtaposing second bar next to first bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x,
                                         staveBar3.y, 200);
      staveBar4.setContext(ctx).draw();

      // bar 4
      var notesBar4 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 })

      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
      expect(0);
    },

    drawBeamedSlashNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("C");
      staveBar1.setContext(ctx).draw();


      // bar 4
      var notesBar1_part1 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 })
      ];

      var notesBar1_part2 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 })

      ];

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);
      var beam2 = new VF.Beam(notesBar1_part2);
      var notesBar1 = notesBar1_part1.concat(notesBar1_part2);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

        // Render beams
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      expect(0);
    },

    drawSlashAndBeamAndRests : function(options,
                                                              contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("F");
      staveBar1.setContext(ctx).draw();

      // bar 1
      var notesBar1_part1 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",stem_direction: -1 })
      ];

      notesBar1_part1[0].addModifier(0, (new VF.Annotation("C7")).setFont(
            "Times", VF.Test.Font.size + 2));

      var notesBar1_part2 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8r",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8r",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8r",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 })

      ];

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1,
                                       notesBar1_part1.concat(notesBar1_part2));

        // Render beams
      beam1.setContext(ctx).draw();

        // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x,
                                         staveBar1.y, 220);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "1s",
                                 stem_direction: -1 })
      ];

      notesBar2[0].addModifier(0, (new VF.Annotation("F")).setFont("Times",
              VF.Test.Font.size + 2));
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      expect(0);
    },

    drawSixtenthWithScratches : function(options,
                                                               contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("F");
      staveBar1.setContext(ctx).draw();

      // bar 1
      var notesBar1_part1 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16m",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 })
      ];

      var notesBar1_part2 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "16m",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16r",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 })

      ];

      notesBar1_part1[0].addModifier(0, (new VF.Annotation("C7")).setFont(
            "Times", VF.Test.Font.size + 3));

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);
      var beam2 = new VF.Beam(notesBar1_part2);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1,
                                       notesBar1_part1.concat(notesBar1_part2));


        // Render beams
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      expect(0);
    },


    drawThirtySecondWithScratches : function(options,
                                                                   contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("F");
      staveBar1.setContext(ctx).draw();

      // bar 1
      var notesBar1_part1 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32m",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32m",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32r",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 })

      ];

      notesBar1_part1[0].addModifier(0, (new VF.Annotation("C7")).setFont(
            "Times", VF.Test.Font.size + 3));

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1);

        // Render beams
      beam1.setContext(ctx).draw();

      expect(0);
    }
  };

  return Rhythm;
})();
/**
 * VexFlow - Basic Stave Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Stave = (function() {
  var Stave = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Stave");
      runTests("Stave Draw Test", Stave.draw);
      runTests("Vertical Bar Test", Stave.drawVerticalBar);
      runTests("Multiple Stave Barline Test", Stave.drawMultipleMeasures);
      runTests("Multiple Stave Repeats Test", Stave.drawRepeats);
      runTests("Multiple Staves Volta Test", Stave.drawVoltaTest);
      runTests("Tempo Test", Stave.drawTempo);
      runTests("Single Line Configuration Test", Stave.configureSingleLine);
      runTests("Batch Line Configuration Test", Stave.configureAllLines);
      runTests("Stave Text Test", Stave.drawStaveText);
      runTests("Multiple Line Stave Text Test (Raphael)", Stave.drawStaveTextMultiLine);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 150);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();
      stave.getBoundingBox().draw(ctx);

      equal(stave.getYForNote(0), 100, "getYForNote(0)");
      equal(stave.getYForLine(5), 99, "getYForLine(5)");
      equal(stave.getYForLine(0), 49, "getYForLine(0) - Top Line");
      equal(stave.getYForLine(4), 89, "getYForLine(4) - Bottom Line");

      ok(true, "all pass");
    },

    drawVerticalBar: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();
      stave.drawVerticalBar(50, true);
      stave.drawVerticalBar(150, false);
      stave.drawVertical(250, true);
      stave.drawVertical(300);

      ok(true, "all pass");
    },

    drawMultipleMeasures: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 550, 200);

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 200);
      staveBar1.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.setSection("A", 0);
      staveBar1.addClef("treble").setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["b/4"], duration: "qr" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setSection("B", 0);
      staveBar2.setEndBarType(VF.Barline.type.END);
      staveBar2.setContext(ctx).draw();

      var notesBar2_part1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ];

      var notesBar2_part2 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ];

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar2_part1);
      var beam2 = new VF.Beam(notesBar2_part2);
      var notesBar2 = notesBar2_part1.concat(notesBar2_part2);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      // Render beams
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
    },

    drawRepeats: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 750, 120);

      // bar 1
      var staveBar1 = new VF.Stave(10, 0, 250);
      staveBar1.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar1.setEndBarType(VF.Barline.type.REPEAT_END);
      staveBar1.addClef("treble");
      staveBar1.addKeySignature("A");
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["b/4"], duration: "qr" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);


      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x,
                                         staveBar1.y, 250);
      staveBar2.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar2.setEndBarType(VF.Barline.type.REPEAT_END);
      staveBar2.setContext(ctx).draw();

      var notesBar2_part1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ];

      var notesBar2_part2 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ];
      notesBar2_part2[0].addAccidental(0, new VF.Accidental("#"));
      notesBar2_part2[1].addAccidental(0, new VF.Accidental("#"));
      notesBar2_part2[3].addAccidental(0, new VF.Accidental("b"));
      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar2_part1);
      var beam2 = new VF.Beam(notesBar2_part2);
      var notesBar2 = notesBar2_part1.concat(notesBar2_part2);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      // Render beams
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      // bar 3 - juxtaposing third bar next to second bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x,
                                         staveBar2.y, 50);
      staveBar3.setContext(ctx).draw();
      var notesBar3 = [new VF.StaveNote({ keys: ["d/5"], duration: "wr" })];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

      // bar 4 - juxtaposing third bar next to third bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x,
                                         staveBar3.y, 250 - staveBar1.getModifierXShift());
      staveBar4.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar4.setEndBarType(VF.Barline.type.REPEAT_END);
      staveBar4.setContext(ctx).draw();
      var notesBar4 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["b/4"], duration: "qr" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);

    },

    drawVoltaTest: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 725, 200);

      // bar 1
      var mm1 = new VF.Stave(10, 50, 125);
      mm1.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      mm1.setRepetitionTypeLeft(VF.Repetition.type.SEGNO_LEFT, -18);
      mm1.addClef("treble");
      mm1.addKeySignature("A")
      mm1.setMeasure(1);
      mm1.setSection("A", 0);
      mm1.setContext(ctx).draw();
      var notesmm1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm1, notesmm1);

      // bar 2 - juxtapose second measure
      var mm2 = new VF.Stave(mm1.width + mm1.x, mm1.y, 60);
      mm2.setRepetitionTypeRight(VF.Repetition.type.CODA_RIGHT, 0);
      mm2.setMeasure(2);
      mm2.setContext(ctx).draw();
      var notesmm2 = [
        new VF.StaveNote({ keys: ["d/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm2, notesmm2);

      // bar 3 - juxtapose third measure
      var mm3 = new VF.Stave(mm2.width + mm2.x, mm1.y, 60);
      mm3.setVoltaType(VF.Volta.type.BEGIN, "1.", -5);
      mm3.setMeasure(3);
      mm3.setContext(ctx).draw();
      var notesmm3 = [
        new VF.StaveNote({ keys: ["e/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm3, notesmm3);

      // bar 4 - juxtapose fourth measure
      var mm4 = new VF.Stave(mm3.width + mm3.x, mm1.y, 60);
      mm4.setVoltaType(VF.Volta.type.MID, "", -5);
      mm4.setMeasure(4);
      mm4.setContext(ctx).draw();
      var notesmm4 = [
        new VF.StaveNote({ keys: ["f/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm4, notesmm4);

      // bar 5 - juxtapose fifth measure
      var mm5 = new VF.Stave(mm4.width + mm4.x, mm1.y, 60);
      mm5.setEndBarType(VF.Barline.type.REPEAT_END);
      mm5.setVoltaType(VF.Volta.type.END, "", -5);
      mm5.setMeasure(5);
      mm5.setContext(ctx).draw();
      var notesmm5 = [
        new VF.StaveNote({ keys: ["g/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm5, notesmm5);

      // bar 6 - juxtapose sixth measure
      var mm6 = new VF.Stave(mm5.width + mm5.x, mm1.y, 60);
      mm6.setVoltaType(VF.Volta.type.BEGIN_END, "2.", -5);
      mm6.setEndBarType(VF.Barline.type.DOUBLE);
      mm6.setMeasure(6);
      mm6.setContext(ctx).draw();
      var notesmm6 = [
        new VF.StaveNote({ keys: ["a/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm6, notesmm6);

      // bar 7 - juxtapose seventh measure
      var mm7 = new VF.Stave(mm6.width + mm6.x, mm1.y, 60);
      mm7.setMeasure(7);
      mm7.setSection("B", 0);
      mm7.setContext(ctx).draw();
      var notesmm7 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm7, notesmm7);

      // bar 8 - juxtapose eighth measure
      var mm8 = new VF.Stave(mm7.width + mm7.x, mm1.y, 60);
      mm8.setEndBarType(VF.Barline.type.DOUBLE);
      mm8.setRepetitionTypeRight(VF.Repetition.type.DS_AL_CODA, 25);
      mm8.setMeasure(8);
      mm8.setContext(ctx).draw();
      var notesmm8 = [
        new VF.StaveNote({ keys: ["c/5"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm8, notesmm8);

      // bar 9 - juxtapose ninth measure
      var mm9 = new VF.Stave(mm8.width + mm8.x + 20, mm1.y, 125);
      mm9.setEndBarType(VF.Barline.type.END);
      mm9.setRepetitionTypeLeft(VF.Repetition.type.CODA_LEFT, 25);
      mm9.addClef("treble");
      mm9.addKeySignature("A");
      mm9.setMeasure(9);
      mm9.setContext(ctx).draw();
      var notesmm9 = [
        new VF.StaveNote({ keys: ["d/5"], duration: "w" })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm9, notesmm9);
    },

    drawTempo: function(options, contextBuilder) {
      expect(0);

      var ctx = contextBuilder(options.canvas_sel, 725, 350);
      var padding = 10, x = 0, y = 50;

      function drawTempoStaveBar(width, tempo, tempo_y, notes) {
        var staveBar = new VF.Stave(padding + x, y, width);
        if (x == 0) staveBar.addClef("treble");
        staveBar.setTempo(tempo, tempo_y);
        staveBar.setContext(ctx).draw();

        var notesBar = notes || [
          new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
          new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
          new VF.StaveNote({ keys: ["b/4"], duration: "q" }),
          new VF.StaveNote({ keys: ["c/4"], duration: "q" })
        ];

        VF.Formatter.FormatAndDraw(ctx, staveBar, notesBar);
        x += width;
      }

      drawTempoStaveBar(120, { duration: "q", dots: 1, bpm: 80 }, 0);
      drawTempoStaveBar(100, { duration: "8", dots: 2, bpm: 90 }, 0);
      drawTempoStaveBar(100, { duration: "16", dots: 1, bpm: 96 }, 0);
      drawTempoStaveBar(100, { duration: "32", bpm: 70 }, 0);
      drawTempoStaveBar(250, { name: "Andante", note: "8", bpm: 120 }, -20, [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/5"], duration: "8" }),
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ]);

      x = 0; y += 150;

      drawTempoStaveBar(120, { duration: "w", bpm: 80 }, 0);
      drawTempoStaveBar(100, { duration: "h", bpm: 90 }, 0);
      drawTempoStaveBar(100, { duration: "q", bpm: 96 }, 0);
      drawTempoStaveBar(100, { duration: "8", bpm: 70 }, 0);
      drawTempoStaveBar(250, { name: "Andante grazioso" }, 0, [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ]);
    },

    configureSingleLine: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setConfigForLine(0, { visible: true })
        .setConfigForLine(1, { visible: false })
        .setConfigForLine(2, { visible: true })
        .setConfigForLine(3, { visible: false })
        .setConfigForLine(4, { visible: true });
      stave.setContext(ctx).draw();

      var config = stave.getConfigForLines();
      equal(config[0].visible, true, "getLinesConfiguration() - Line 0");
      equal(config[1].visible, false, "getLinesConfiguration() - Line 1");
      equal(config[2].visible, true, "getLinesConfiguration() - Line 2");
      equal(config[3].visible, false, "getLinesConfiguration() - Line 3");
      equal(config[4].visible, true, "getLinesConfiguration() - Line 4");

      ok(true, "all pass");
    },

    configureAllLines: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setConfigForLines([
        { visible: false },
        null,
        { visible: false },
        { visible: true },
        { visible: false }
      ]).setContext(ctx).draw();

      var config = stave.getConfigForLines();
      equal(config[0].visible, false, "getLinesConfiguration() - Line 0");
      equal(config[1].visible, true, "getLinesConfiguration() - Line 1");
      equal(config[2].visible, false, "getLinesConfiguration() - Line 2");
      equal(config[3].visible, true, "getLinesConfiguration() - Line 3");
      equal(config[4].visible, false, "getLinesConfiguration() - Line 4");

      ok(true, "all pass");
    },

    drawStaveText: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 900, 140);
      var stave = new VF.Stave(300, 10, 300);
      stave.setText("Violin", VF.Modifier.Position.LEFT);
      stave.setText("Right Text", VF.Modifier.Position.RIGHT);
      stave.setText("Above Text", VF.Modifier.Position.ABOVE);
      stave.setText("Below Text", VF.Modifier.Position.BELOW);
      stave.setContext(ctx).draw();

      ok(true, "all pass");
    },

    drawStaveTextMultiLine: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 900, 200);
      var stave = new VF.Stave(300, 40, 300);
      stave.setText("Violin", VF.Modifier.Position.LEFT, {shift_y: -10});
      stave.setText("2nd line", VF.Modifier.Position.LEFT, {shift_y: 10});
      stave.setText("Right Text", VF.Modifier.Position.RIGHT, {shift_y: -10});
      stave.setText("2nd line", VF.Modifier.Position.RIGHT, {shift_y: 10});
      stave.setText("Above Text", VF.Modifier.Position.ABOVE, {shift_y: -10});
      stave.setText("2nd line", VF.Modifier.Position.ABOVE, {shift_y: 10});
      stave.setText("Left Below Text", VF.Modifier.Position.BELOW,
        {shift_y: -10, justification: VF.TextNote.Justification.LEFT});
      stave.setText("Right Below Text", VF.Modifier.Position.BELOW,
        {shift_y: 10, justification: VF.TextNote.Justification.RIGHT});
      stave.setContext(ctx).draw();

      ok(true, "all pass");
    }
  };

  return Stave;
})();
/**
 * VexFlow - StaveConnector Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StaveConnector = (function() {
  var StaveConnector = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("StaveConnector");
      runTests("Single Draw Test", StaveConnector.drawSingle);
      runTests("Single Draw Test, 1px Stave Line Thickness", StaveConnector.drawSingle1pxBarlines);
      runTests("Single Both Sides Test", StaveConnector.drawSingleBoth);
      runTests("Double Draw Test", StaveConnector.drawDouble);
      runTests("Bold Double Line Left Draw Test", StaveConnector.drawRepeatBegin);
      runTests("Bold Double Line Right Draw Test", StaveConnector.drawRepeatEnd);
      runTests("Thin Double Line Right Draw Test", StaveConnector.drawThinDouble);
      runTests("Bold Double Lines Overlapping Draw Test", StaveConnector.drawRepeatAdjacent);
      runTests("Bold Double Lines Offset Draw Test", StaveConnector.drawRepeatOffset);
      runTests("Bold Double Lines Offset Draw Test 2", StaveConnector.drawRepeatOffset2);
      runTests("Brace Draw Test", StaveConnector.drawBrace);
      runTests("Brace Wide Draw Test", StaveConnector.drawBraceWide);
      runTests("Bracket Draw Test", StaveConnector.drawBracket);
      runTests("Combined Draw Test", StaveConnector.drawCombined);
    },

    drawSingle: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();

      ok(true, "all pass");
    },

    drawSingle1pxBarlines: function(options, contextBuilder) {
      VF.STAVE_LINE_THICKNESS = 1;
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();
      VF.STAVE_LINE_THICKNESS = 2;

      ok(true, "all pass");
    },

    drawSingleBoth: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.SINGLE_LEFT);
      connector.setContext(ctx);
      var connector2 = new VF.StaveConnector(stave, stave2);
      connector2.setType(VF.StaveConnector.type.SINGLE_RIGHT);
      connector2.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();
      connector2.draw();

      ok(true, "all pass");
    },

    drawDouble: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      var line = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.DOUBLE);
      connector.setContext(ctx);
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();
      line.draw();

      ok(true, "all pass");
    },

    drawBrace: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 450, 300);
      var stave = new VF.Stave(100, 10, 300);
      var stave2 = new VF.Stave(100, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      var line = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.BRACE);
      connector.setContext(ctx);
      connector.setText('Piano');
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();
      line.draw();

      ok(true, "all pass");
    },

    drawBraceWide: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, -20, 300);
      var stave2 = new VF.Stave(25, 200, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      var line = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.BRACE);
      connector.setContext(ctx);
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();
      line.draw();

      ok(true, "all pass");
    },

    drawBracket: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      var line = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.BRACKET);
      connector.setContext(ctx);
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();
      line.draw();

      ok(true, "all pass");
    },

    drawRepeatBegin: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave2.setBegBarType(VF.Barline.type.REPEAT_BEGIN);

      var line = new VF.StaveConnector(stave, stave2);
      line.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      line.draw();

      ok(true, "all pass");
    },

    drawRepeatEnd: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave.setEndBarType(VF.Barline.type.REPEAT_END);
      stave2.setEndBarType(VF.Barline.type.REPEAT_END);

      var line = new VF.StaveConnector(stave, stave2);
      line.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      line.draw();

      ok(true, "all pass");
    },

    drawThinDouble: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave.setEndBarType(VF.Barline.type.DOUBLE);
      stave2.setEndBarType(VF.Barline.type.DOUBLE);

      var line = new VF.StaveConnector(stave, stave2);
      line.setType(VF.StaveConnector.type.THIN_DOUBLE);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      line.draw();

      ok(true, "all pass");
    },

    drawRepeatAdjacent: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, 10, 150);
      var stave2 = new VF.Stave(25, 120, 150);
      var stave3 = new VF.Stave(175, 10, 150);
      var stave4 = new VF.Stave(175, 120, 150);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave3.setContext(ctx);
      stave4.setContext(ctx);

      stave.setEndBarType(VF.Barline.type.REPEAT_END);
      stave2.setEndBarType(VF.Barline.type.REPEAT_END);
      stave3.setEndBarType(VF.Barline.type.END);
      stave4.setEndBarType(VF.Barline.type.END);

      stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave2.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave3.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave4.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      var connector = new VF.StaveConnector(stave, stave2);
      var connector2 = new VF.StaveConnector(stave, stave2);
      var connector3 = new VF.StaveConnector(stave3, stave4);
      var connector4 = new VF.StaveConnector(stave3, stave4);
      connector.setContext(ctx);
      connector2.setContext(ctx);
      connector3.setContext(ctx);
      connector4.setContext(ctx);
      connector.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      connector2.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      connector3.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      connector4.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      stave.draw();
      stave2.draw();
      stave3.draw();
      stave4.draw();
      connector.draw();
      connector2.draw();
      connector3.draw();
      connector4.draw();

      ok(true, "all pass");
    },

    drawRepeatOffset2: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, 10, 150);
      var stave2 = new VF.Stave(25, 120, 150);
      var stave3 = new VF.Stave(175, 10, 150);
      var stave4 = new VF.Stave(175, 120, 150);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave3.setContext(ctx);
      stave4.setContext(ctx);

      stave.addClef('treble');
      stave2.addClef('bass');

      stave3.addClef('alto');
      stave4.addClef('treble');

      stave.addTimeSignature('4/4');
      stave2.addTimeSignature('4/4');

      stave3.addTimeSignature('6/8');
      stave4.addTimeSignature('6/8');

      stave.setEndBarType(VF.Barline.type.REPEAT_END);
      stave2.setEndBarType(VF.Barline.type.REPEAT_END);
      stave3.setEndBarType(VF.Barline.type.END);
      stave4.setEndBarType(VF.Barline.type.END);

      stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave2.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave3.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave4.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      var connector = new VF.StaveConnector(stave, stave2);
      var connector2 = new VF.StaveConnector(stave, stave2);
      var connector3 = new VF.StaveConnector(stave3, stave4);
      var connector4 = new VF.StaveConnector(stave3, stave4);
      var connector5 = new VF.StaveConnector(stave3, stave4);

      connector.setContext(ctx);
      connector2.setContext(ctx);
      connector3.setContext(ctx);
      connector4.setContext(ctx);
      connector5.setContext(ctx);
      connector.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      connector2.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      connector3.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      connector4.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      connector5.setType(VF.StaveConnector.type.SINGLE_LEFT);

      connector.setXShift(stave.getModifierXShift());
      connector3.setXShift(stave3.getModifierXShift());

      stave.draw();
      stave2.draw();
      stave3.draw();
      stave4.draw();
      connector.draw();
      connector2.draw();
      connector3.draw();
      connector4.draw();
      connector5.draw();

      ok(true, "all pass");
    },
    drawRepeatOffset: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, 10, 150);
      var stave2 = new VF.Stave(25, 120, 150);
      var stave3 = new VF.Stave(175, 10, 150);
      var stave4 = new VF.Stave(175, 120, 150);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave3.setContext(ctx);
      stave4.setContext(ctx);

      stave.addClef('bass');
      stave2.addClef('alto');

      stave3.addClef('treble');
      stave4.addClef('tenor');

      stave3.addKeySignature('Ab');
      stave4.addKeySignature('Ab');

      stave.addTimeSignature('4/4');
      stave2.addTimeSignature('4/4');

      stave3.addTimeSignature('6/8');
      stave4.addTimeSignature('6/8');

      stave.setEndBarType(VF.Barline.type.REPEAT_END);
      stave2.setEndBarType(VF.Barline.type.REPEAT_END);
      stave3.setEndBarType(VF.Barline.type.END);
      stave4.setEndBarType(VF.Barline.type.END);

      stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave2.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave3.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave4.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      var connector = new VF.StaveConnector(stave, stave2);
      var connector2 = new VF.StaveConnector(stave, stave2);
      var connector3 = new VF.StaveConnector(stave3, stave4);
      var connector4 = new VF.StaveConnector(stave3, stave4);
      var connector5 = new VF.StaveConnector(stave3, stave4);
      connector.setContext(ctx);
      connector2.setContext(ctx);
      connector3.setContext(ctx);
      connector4.setContext(ctx);
      connector5.setContext(ctx);
      connector.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      connector2.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      connector3.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      connector4.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      connector5.setType(VF.StaveConnector.type.SINGLE_LEFT);

      connector.setXShift(stave.getModifierXShift());
      connector3.setXShift(stave3.getModifierXShift());

      stave.draw();
      stave2.draw();
      stave3.draw();
      stave4.draw();
      connector.draw();
      connector2.draw();
      connector3.draw();
      connector4.draw();
      connector5.draw();

      ok(true, "all pass");
    },

    drawCombined: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 550, 700);
      var stave = new VF.Stave(150, 10, 300);
      var stave2 = new VF.Stave(150, 100, 300);
      var stave3 = new VF.Stave(150, 190, 300);
      var stave4 = new VF.Stave(150, 280, 300);
      var stave5 = new VF.Stave(150, 370, 300);
      var stave6 = new VF.Stave(150, 460, 300);
      var stave7 = new VF.Stave(150, 560, 300);
      stave.setText('Violin', VF.Modifier.Position.LEFT);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave3.setContext(ctx);
      stave4.setContext(ctx);
      stave5.setContext(ctx);
      stave6.setContext(ctx);
      stave7.setContext(ctx);
      var conn_single = new VF.StaveConnector(stave, stave7);
      var conn_double = new VF.StaveConnector(stave2, stave3);
      var conn_bracket = new VF.StaveConnector(stave4, stave5);
      var conn_brace = new VF.StaveConnector(stave6, stave7);
      conn_single.setType(VF.StaveConnector.type.SINGLE);
      conn_double.setType(VF.StaveConnector.type.DOUBLE);
      conn_bracket.setType(VF.StaveConnector.type.BRACKET);
      conn_brace.setType(VF.StaveConnector.type.BRACE);
      conn_double.setText('Piano');
      conn_bracket.setText('Celesta');
      conn_brace.setText('Harpsichord');
      conn_single.setContext(ctx);
      conn_double.setContext(ctx);
      conn_bracket.setContext(ctx);
      conn_brace.setContext(ctx);
      stave.draw();
      stave2.draw();
      stave3.draw();
      stave4.draw();
      stave5.draw();
      stave6.draw();
      stave7.draw();
      conn_single.draw();
      conn_double.draw();
      conn_bracket.draw();
      conn_brace.draw();

      ok(true, "all pass");
    }
  };

  return StaveConnector;
})();
/**
 * VexFlow - StaveHairpin Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 * Author: Raffaele Viglianti, 2012
 */

VF.Test.StaveHairpin = (function() {
  var StaveHairpin = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module("StaveHairpin");
      runTests("Simple StaveHairpin", StaveHairpin.simple);
      runTests("Horizontal Offset StaveHairpin", StaveHairpin.ho);
      runTests("Vertical Offset StaveHairpin", StaveHairpin.vo);
      runTests("Height StaveHairpin", StaveHairpin.height);
    },

    drawHairpin: function(notes, stave, ctx, type, position, options) {
      var hp = new VF.StaveHairpin(notes, type);

      hp.setContext(ctx);
      hp.setPosition(position);
      if (options != undefined) {
        hp.setRenderOptions(options);
      }
      hp.draw();
    },

    hairpinNotes: function(notes, options) {
      var ctx = new options.contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 350).setContext(ctx).draw();

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 250);
      voice.draw(ctx, stave);

      return [stave, ctx];
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
      ]

      var render = VF.Test.StaveHairpin.hairpinNotes(notes, options);
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 4);
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[1], last_note:notes[3]}, render[0], render[1], 2, 3);

      ok(true, "Simple Test");
    },

    ho: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
      ]

      var render = VF.Test.StaveHairpin.hairpinNotes(notes, options);
      var render_options = {
          height: 10,
          vo: 20, //vertical offset
          left_ho: 20, //left horizontal offset
          right_ho: -20 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 3, render_options);

      var render_options = {
          height: 10,
          y_shift: 0, //vertical offset
          left_shift_px: 0, //left horizontal offset
          right_shift_px: 120 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[3], last_note:notes[3]}, render[0], render[1], 2, 4, render_options);

      ok(true, "Horizontal Offset Test");
    },

    vo: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
      ]

      var render = VF.Test.StaveHairpin.hairpinNotes(notes, options);
      var render_options = {
          height: 10,
          y_shift: 0, //vertical offset
          left_shift_px: 0, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 4, render_options);

      var render_options = {
          height: 10,
          y_shift: -15, //vertical offset
          left_shift_px: 2, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[2], last_note:notes[3]}, render[0], render[1], 2, 4, render_options);

      ok(true, "Vertical Offset Test");
    },

    height: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
      ]

      var render = VF.Test.StaveHairpin.hairpinNotes(notes, options);
      var render_options = {
          height: 10,
          y_shift: 0, //vertical offset
          left_shift_px: 0, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 4, render_options);

      var render_options = {
          height: 15,
          y_shift: 0, //vertical offset
          left_shift_px: 2, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[2], last_note:notes[3]}, render[0], render[1], 2, 4, render_options);

      ok(true, "Height Test");
    }
  };

  return StaveHairpin;
})();
/**
 * VexFlow - StaveLine Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
VF.Test.StaveLine = (function() {
  var StaveLine = {
    Start: function() {
      QUnit.module("StaveLine");
      VF.Test.runTests("Simple StaveLine", VF.Test.StaveLine.simple0);
      VF.Test.runTests("StaveLine Arrow Options", VF.Test.StaveLine.simple1);
    },

    simple0: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 650, 140);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave = new VF.Stave(10, 10, 550).addTrebleGlyph();
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        {keys: ["c/4"], duration: "4", clef: "treble"},
        {keys: ["c/5"], duration: "4", clef: "treble"},
        {keys: ["c/4", "g/4", "b/4"], duration: "4", clef: "treble"},
        {keys: ["f/4", "a/4", "f/5"], duration: "4", clef: "treble"}
      ].map(newNote);

      var staveLine = new VF.StaveLine({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0]
      });

      var staveLine2 = new VF.StaveLine({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [2, 1, 0],
        last_indices: [0, 1, 2]
      });

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      staveLine.setText('gliss.');
      staveLine.setFont({
        family: "serif",
        size: 12,
        weight: "italic"
      });

      voice.draw(ctx, stave);
      staveLine.setContext(ctx).draw();
      staveLine2.setContext(ctx).draw();

      ok(true);
    },


    simple1: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 770, 140);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave = new VF.Stave(10, 10, 750).addTrebleGlyph();
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        {keys: ["c#/5", "d/5"], duration: "4", clef: "treble", stem_direction: -1},
        {keys: ["c/4"], duration: "4", clef: "treble"},
        {keys: ["c/4", "e/4", "g/4"], duration: "4", clef: "treble"},
        {keys: ["f/4", "a/4", "c/5"], duration: "4", clef: "treble"},
        {keys: ["c/4",], duration: "4", clef: "treble"},
        {keys: ["c#/5", "d/5"], duration: "4", clef: "treble", stem_direction: -1},
        {keys: ["c/4", "d/4", "g/4"], duration: "4", clef: "treble"},
        {keys: ["f/4", "a/4", "c/5"], duration: "4", clef: "treble"}
      ].map(newNote);

      notes[0].addDotToAll();
      notes[1].addAccidental(0, new VF.Accidental("#"));
      notes[3].addAccidental(2, new VF.Accidental("#"));
      notes[4].addAccidental(0, new VF.Accidental("#"));
      notes[7].addAccidental(2, new VF.Accidental("#"));

      var staveLine0 = new VF.StaveLine({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0]
      });

      var staveLine4 = new VF.StaveLine({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [1],
        last_indices: [1]
      });

      var staveLine1 = new VF.StaveLine({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0]
      });

      var staveLine2 = new VF.StaveLine({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [1],
        last_indices: [0]
      });

      var staveLine3 = new VF.StaveLine({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [2],
        last_indices: [2]
      });

      staveLine0.render_options.draw_end_arrow = true;
      staveLine0.setText('Left');
      staveLine0.render_options.text_justification = 1;
      staveLine0.render_options.text_position_vertical = 2;

      staveLine1.render_options.draw_end_arrow = true;
      staveLine1.render_options.arrowhead_length = 30;
      staveLine1.render_options.line_width = 5;
      staveLine1.setText('Center');
      staveLine1.render_options.text_justification = 2;
      staveLine1.render_options.text_position_vertical = 2;

      staveLine4.render_options.line_width = 2;
      staveLine4.render_options.draw_end_arrow = true;
      staveLine4.render_options.draw_start_arrow = true;
      staveLine4.render_options.arrowhead_angle = 0.5;
      staveLine4.render_options.arrowhead_length = 20;
      staveLine4.setText('Right');
      staveLine4.render_options.text_justification = 3;
      staveLine4.render_options.text_position_vertical = 2;

      staveLine2.render_options.draw_start_arrow = true;
      staveLine2.render_options.line_dash = [5, 4];

      staveLine3.render_options.draw_end_arrow = true;
      staveLine3.render_options.draw_start_arrow = true;
      staveLine3.render_options.color = "red";
      staveLine3.setText('Top');
      staveLine3.render_options.text_position_vertical = 1;

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      voice.draw(ctx, stave);

      staveLine0.setContext(ctx).draw();
      staveLine1.setContext(ctx).draw();
      staveLine2.setContext(ctx).draw();
      staveLine3.setContext(ctx).draw();
      staveLine4.setContext(ctx).draw();

      ok(true);
    }
  };

  return StaveLine;
})();
/**
 * VexFlow - StaveModifier Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StaveModifier = (function() {
  var StaveModifier = {
    Start: function() {
      QUnit.module("StaveModifier");
      VF.Test.runTests("Stave Draw Test", VF.Test.Stave.draw);
      VF.Test.runTests("Vertical Bar Test",
          VF.Test.Stave.drawVerticalBar);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();

      equal(stave.getYForNote(0), 100, "getYForNote(0)");
      equal(stave.getYForLine(5), 100, "getYForLine(5)");
      equal(stave.getYForLine(0), 50, "getYForLine(0) - Top Line");
      equal(stave.getYForLine(4), 90, "getYForLine(4) - Bottom Line");

      ok(true, "all pass");
    },

    drawVerticalBar: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();
      stave.drawVerticalBar(100);
      stave.drawVerticalBar(150);
      stave.drawVerticalBar(300);

      ok(true, "all pass");
    }
  };

  return StaveModifier;
})();
/**
 * VexFlow - StaveNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StaveNote = (function() {
  var StaveNote = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module("StaveNote");
      test("Tick", StaveNote.ticks);
      test("Tick - New API", StaveNote.ticksNewApi);
      test("Stem", StaveNote.stem);
      test("Automatic Stem Direction", StaveNote.autoStem);
      test("StaveLine", StaveNote.staveLine);
      test("Width", StaveNote.width);
      test("TickContext", StaveNote.tickContext);

      VF.Test.runUITests("Interactive Mouseover StaveNote", StaveNote.draw,
          { clef: "treble", octaveShift: 0, restKey: "r/4", ui: true });

      runTests("StaveNote Draw - Treble", StaveNote.draw,
          { clef: "treble", octaveShift: 0, restKey: "r/4" });

      runTests("StaveNote BoundingBoxes - Treble", StaveNote.drawBoundingBoxes,
          { clef: "treble", octaveShift: 0, restKey: "r/4" });

      runTests("StaveNote Draw - Alto", StaveNote.draw,
          { clef: "alto", octaveShift: -1, restKey: "r/4" });

      runTests("StaveNote Draw - Tenor", StaveNote.draw,
          { clef: "tenor", octaveShift: -1, restKey: "r/3" });

      runTests("StaveNote Draw - Bass", StaveNote.draw,
          { clef: "bass", octaveShift: -2, restKey: "r/3" });

      runTests("StaveNote Draw - Harmonic And Muted", StaveNote.drawHarmonicAndMuted);
      runTests("StaveNote Draw - Slash", StaveNote.drawSlash);
      runTests("Displacements", StaveNote.displacements);
      runTests("StaveNote Draw - Bass 2", StaveNote.drawBass);
      runTests("StaveNote Draw - Key Styles", StaveNote.drawKeyStyles);
      runTests("StaveNote Draw - StaveNote Styles", StaveNote.drawNoteStyles);
      runTests("Flag and Dot Placement - Stem Up", StaveNote.dotsAndFlagsStemUp);
      runTests("Flag and Dots Placement - Stem Down", StaveNote.dotsAndFlagsStemDown);
      runTests("Beam and Dot Placement - Stem Up", StaveNote.dotsAndBeamsUp);
      runTests("Beam and Dot Placement - Stem Down", StaveNote.dotsAndBeamsDown);
      runTests("Center Aligned Note", StaveNote.centerAlignedRest);
      runTests("Center Aligned Note with Articulation", StaveNote.centerAlignedRestFermata);
      runTests("Center Aligned Note with Annotation", StaveNote.centerAlignedRestAnnotation);
      runTests("Center Aligned Note - Multi Voice", StaveNote.centerAlignedMultiVoice);
      runTests("Center Aligned Note with Multiple Modifiers", StaveNote.centerAlignedNoteMultiModifiers);
    },

    ticks: function(options) {
      var BEAT = 1 * VF.RESOLUTION / 4;

      var note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "1/2"});
      equal(note.getTicks().value(), BEAT * 8, "Breve note has 8 beats");
      equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "w"});
      equal(note.getTicks().value(), BEAT * 4, "Whole note has 4 beats");
      equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "q"});
      equal(note.getTicks().value(), BEAT, "Quarter note has 1 beats");
      equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "hd"});
      equal(note.getTicks().value(), BEAT * 3, "Dotted half note has 3 beats");
      equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "hdd"});
      equal(note.getTicks().value(), BEAT * 3.5, "Double-dotted half note has 3.5 beats");
      equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "hddd"});
      equal(note.getTicks().value(), BEAT * 3.75, "Triple-dotted half note has 3.75 beats");
      equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "hdr"});
      equal(note.getTicks().value(), BEAT * 3, "Dotted half rest has 3 beats");
      equal(note.getNoteType(), "r", "Note type is 'r' for rest");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "hddr"});
      equal(note.getTicks().value(), BEAT * 3.5, "Double-dotted half rest has 3.5 beats");
      equal(note.getNoteType(), "r", "Note type is 'r' for rest");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "hdddr"});
      equal(note.getTicks().value(), BEAT * 3.75, "Triple-dotted half rest has 3.75 beats");
      equal(note.getNoteType(), "r", "Note type is 'r' for rest");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "qdh"});
      equal(note.getTicks().value(), BEAT * 1.5,
             "Dotted harmonic quarter note has 1.5 beats");
      equal(note.getNoteType(), "h", "Note type is 'h' for harmonic note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "qddh"});
      equal(note.getTicks().value(), BEAT * 1.75,
             "Double-dotted harmonic quarter note has 1.75 beats");
      equal(note.getNoteType(), "h", "Note type is 'h' for harmonic note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "qdddh"});
      equal(note.getTicks().value(), BEAT * 1.875,
             "Triple-dotted harmonic quarter note has 1.875 beats");
      equal(note.getNoteType(), "h", "Note type is 'h' for harmonic note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "8dm"});
      equal(note.getTicks().value(), BEAT * 0.75, "Dotted muted 8th note has 0.75 beats");
      equal(note.getNoteType(), "m", "Note type is 'm' for muted note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "8ddm"});
      equal(note.getTicks().value(), BEAT * 0.875,
             "Double-dotted muted 8th note has 0.875 beats");
      equal(note.getNoteType(), "m", "Note type is 'm' for muted note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "8dddm"});
      equal(note.getTicks().value(), BEAT * 0.9375,
             "Triple-dotted muted 8th note has 0.9375 beats");
      equal(note.getNoteType(), "m", "Note type is 'm' for muted note");

      try {
        new VF.StaveNote(
            { keys: ["c/4", "e/4", "g/4"], duration: "8.7dddm"});
        throw new Error();
      } catch (e) {
        equal(e.code, "BadArguments",
            "Invalid note duration '8.7' throws BadArguments exception");
      }

      try {
        new VF.StaveNote(
            { keys: ["c/4", "e/4", "g/4"], duration: "2Z"});
        throw new Error();
      } catch (e) {
        equal(e.code, "BadArguments",
            "Invalid note type 'Z' throws BadArguments exception");
      }

      try {
        new VF.StaveNote(
            { keys: ["c/4", "e/4", "g/4"], duration: "2dddZ"});
        throw new Error();
      } catch (e) {
        equal(e.code, "BadArguments",
            "Invalid note type 'Z' for dotted note throws BadArguments exception");
      }
    },

    ticksNewApi: function() {
      var BEAT = 1 * VF.RESOLUTION / 4;

      var note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "1"});
      equal(note.getTicks().value(), BEAT * 4, "Whole note has 4 beats");
      equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "4"});
      equal(note.getTicks().value(), BEAT, "Quarter note has 1 beats");
      equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "2", dots: 1});
      equal(note.getTicks().value(), BEAT * 3, "Dotted half note has 3 beats");
      equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "2", dots: 2});
      equal(note.getTicks().value(), BEAT * 3.5, "Double-dotted half note has 3.5 beats");
      equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "2", dots: 3});
      equal(note.getTicks().value(), BEAT * 3.75,
             "Triple-dotted half note has 3.75 beats");
      equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "2", dots: 1, type: "r"});
      equal(note.getTicks().value(), BEAT * 3, "Dotted half rest has 3 beats");
      equal(note.getNoteType(), "r", "Note type is 'r' for rest");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "2", dots: 2, type: "r"});
      equal(note.getTicks().value(), BEAT * 3.5, "Double-dotted half rest has 3.5 beats");
      equal(note.getNoteType(), "r", "Note type is 'r' for rest");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "2", dots: 3, type: "r"});
      equal(note.getTicks().value(), BEAT * 3.75,
             "Triple-dotted half rest has 3.75 beats");
      equal(note.getNoteType(), "r", "Note type is 'r' for rest");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "4", dots: 1, type: "h"});
      equal(note.getTicks().value(), BEAT * 1.5,
             "Dotted harmonic quarter note has 1.5 beats");
      equal(note.getNoteType(), "h", "Note type is 'h' for harmonic note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "4", dots: 2, type: "h"});
      equal(note.getTicks().value(), BEAT * 1.75,
             "Double-dotted harmonic quarter note has 1.75 beats");
      equal(note.getNoteType(), "h", "Note type is 'h' for harmonic note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "4", dots: 3, type: "h"});
      equal(note.getTicks().value(), BEAT * 1.875,
             "Triple-dotted harmonic quarter note has 1.875 beats");
      equal(note.getNoteType(), "h", "Note type is 'h' for harmonic note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "8", dots: 1, type: "m"});
      equal(note.getTicks().value(), BEAT * 0.75, "Dotted muted 8th note has 0.75 beats");
      equal(note.getNoteType(), "m", "Note type is 'm' for muted note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "8", dots: 2, type: "m"});
      equal(note.getTicks().value(), BEAT * 0.875,
             "Double-dotted muted 8th note has 0.875 beats");
      equal(note.getNoteType(), "m", "Note type is 'm' for muted note");

      note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "8", dots: 3, type: "m"});
      equal(note.getTicks().value(), BEAT * 0.9375,
             "Triple-dotted muted 8th note has 0.9375 beats");
      equal(note.getNoteType(), "m", "Note type is 'm' for muted note");

      var note = new VF.StaveNote(
          { keys: ["b/4"], duration: "1s"});
      equal(note.getTicks().value(), BEAT * 4, "Whole note has 4 beats");
      equal(note.getNoteType(), "s", "Note type is 's' for slash note");

      var note = new VF.StaveNote(
          { keys: ["b/4"], duration: "4s"});
      equal(note.getTicks().value(), BEAT, "Quarter note has 1 beats");
      equal(note.getNoteType(), "s", "Note type is 's' for slash note");

      var note = new VF.StaveNote(
          { keys: ["b/4"], duration: "2s", dots: 1});
      equal(note.getTicks().value(), BEAT * 3, "Dotted half note has 3 beats");
      equal(note.getNoteType(), "s", "Note type is 's' for slash note");

      var note = new VF.StaveNote(
          { keys: ["b/4"], duration: "2s", dots: 2});
      equal(note.getTicks().value(), BEAT * 3.5, "Double-dotted half note has 3.5 beats");
      equal(note.getNoteType(), "s", "Note type is 's' for slash note");

      var note = new VF.StaveNote(
          { keys: ["b/4"], duration: "2s", dots: 3});
      equal(note.getTicks().value(), BEAT * 3.75,
             "Triple-dotted half note has 3.75 beats");
      equal(note.getNoteType(), "s", "Note type is 's' for slash note");

      try {
        new VF.StaveNote(
            { keys: ["c/4", "e/4", "g/4"], duration: "8.7"});
        throw new Error();
      } catch (e) {
        equal(e.code, "BadArguments",
            "Invalid note duration '8.7' throws BadArguments exception");
      }

      try {
        new VF.StaveNote(
            { keys: ["c/4", "e/4", "g/4"], duration: "8", dots: "three" });
        throw new Error();
      } catch (e) {
        equal(e.code, "BadArguments", "Invalid number of dots 'three' " +
               "(as string) throws BadArguments exception");
      }

      try {
        new VF.StaveNote(
            { keys: ["c/4", "e/4", "g/4"], duration: "2", type: "Z"});
        throw new Error();
      } catch (e) {
        equal(e.code, "BadArguments",
            "Invalid note type 'Z' throws BadArguments exception");
      }
    },


    stem: function() {
      var note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "g/4"], duration: "w"});
      equal(note.getStemDirection(), VF.StaveNote.STEM_UP,
          "Default note has UP stem");
    },

    autoStem: function() {
      var note = new VF.StaveNote(
          { keys: ["c/5", "e/5", "g/5"], duration: "8", auto_stem: true});
      equal(note.getStemDirection(), VF.StaveNote.STEM_DOWN,
          "Stem must be down");

      note = new VF.StaveNote(
          { keys: ["e/4", "g/4", "c/5"], duration: "8", auto_stem: true});
      equal(note.getStemDirection(), VF.StaveNote.STEM_UP,
          "Stem must be up");

      note = new VF.StaveNote(
          { keys: ["c/5"], duration: "8", auto_stem: true});
      equal(note.getStemDirection(), VF.StaveNote.STEM_DOWN,
          "Stem must be up");

      note = new VF.StaveNote(
          { keys: ["a/4", "e/5", "g/5"], duration: "8", auto_stem: true});
      equal(note.getStemDirection(), VF.StaveNote.STEM_DOWN,
          "Stem must be down");

      note = new VF.StaveNote(
          { keys: ["b/4"], duration: "8", auto_stem: true});
      equal(note.getStemDirection(), VF.StaveNote.STEM_DOWN,
          "Stem must be down");

    },

    staveLine: function() {
      var note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "a/4"], duration: "w"});
      var props = note.getKeyProps();
      equal(props[0].line, 0, "C/4 on line 0");
      equal(props[1].line, 1, "E/4 on line 1");
      equal(props[2].line, 2.5, "A/4 on line 2.5");

      var stave = new VF.Stave(10, 10, 300);
      note.setStave(stave);

      var ys = note.getYs();
      equal(ys.length, 3, "Chord should be rendered on three lines");
      equal(ys[0], 100, "Line for C/4");
      equal(ys[1], 90, "Line for E/4");
      equal(ys[2], 75, "Line for A/4");
    },

    width: function() {
      expect(1);
      var note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "a/4"], duration: "w"});

      try {
        var width = note.getWidth();
      } catch (e) {
        equal(e.code, "UnformattedNote",
            "Unformatted note should have no width");
      }
    },

    tickContext: function() {
      var note = new VF.StaveNote(
          { keys: ["c/4", "e/4", "a/4"], duration: "w"});
      var tickContext = new VF.TickContext();
      tickContext.addTickable(note);
      tickContext.preFormat();
      tickContext.setX(10);
      tickContext.setPadding(0);

      equal(tickContext.getWidth(), 16);
    },

    showNote: function(note_struct, stave, ctx, x, drawBoundingBox) {
      var note = new VF.StaveNote(note_struct);
      var tickContext = new VF.TickContext();
      tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(20);
      note.setContext(ctx).setStave(stave);
      note.draw();

      if (drawBoundingBox) {
        note.getBoundingBox().draw(ctx);
      }
      return note;
    },

    draw: function(options, contextBuilder) {
      var clef = options.params.clef;
      var octaveShift = options.params.octaveShift;
      var restKey = options.params.restKey;

      var ctx = new contextBuilder(options.canvas_sel, 700, 180);
      var stave = new VF.Stave(10, 30, 750);

      stave.setContext(ctx);
      stave.addClef(clef);
      stave.draw();

      var lowerKeys = ["c/", "e/", "a/"];
      var higherKeys = ["c/", "e/", "a/"];
      for (var k = 0; k < lowerKeys.length; k++) {
        lowerKeys[k] = lowerKeys[k] + (4 + octaveShift);
        higherKeys[k] = higherKeys[k] + (5 + octaveShift);
      }

      var restKeys = [ restKey ];

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { clef: clef, keys: higherKeys, duration: "1/2"},
        { clef: clef, keys: lowerKeys, duration: "w"},
        { clef: clef, keys: higherKeys, duration: "h"},
        { clef: clef, keys: lowerKeys, duration: "q"},
        { clef: clef, keys: higherKeys, duration: "8"},
        { clef: clef, keys: lowerKeys, duration: "16"},
        { clef: clef, keys: higherKeys, duration: "32"},
        { clef: clef, keys: higherKeys, duration: "64"},
        { clef: clef, keys: higherKeys, duration: "128"},
        { clef: clef, keys: lowerKeys, duration: "1/2",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "w",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "h",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "q",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "8",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "16",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "32",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "64",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "128",
          stem_direction: -1},

        { clef: clef, keys: restKeys, duration: "1/2r"},
        { clef: clef, keys: restKeys, duration: "wr"},
        { clef: clef, keys: restKeys, duration: "hr"},
        { clef: clef, keys: restKeys, duration: "qr"},
        { clef: clef, keys: restKeys, duration: "8r"},
        { clef: clef, keys: restKeys, duration: "16r"},
        { clef: clef, keys: restKeys, duration: "32r"},
        { clef: clef, keys: restKeys, duration: "64r"},
        { clef: clef, keys: restKeys, duration: "128r"},
        { keys: ["x/4"], duration: "h"}
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        // If this is an interactivity test, then attempt to attach mouseover
        // and mouseout handlers to the notes.
        if (options.params.ui) {
          var item = staveNote.getElem();
          item.addEventListener("mouseover", function() {
            Vex.forEach($(this).find("*"), function(child) {
              child.setAttribute("fill", "green");
              child.setAttribute("stroke", "green");
            });
          }, false);
          item.addEventListener("mouseout", function() {
            Vex.forEach($(this).find("*"), function(child) {
              child.setAttribute("fill", "black");
              child.setAttribute("stroke", "black");
            });
          }, false);
        }
        ok(staveNote.getX() > 0, "Note " + i + " has X value");
        ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
      }
    },

    drawBoundingBoxes: function(options, contextBuilder) {
      var clef = options.params.clef;
      var octaveShift = options.params.octaveShift;
      var restKey = options.params.restKey;

      var ctx = new contextBuilder(options.canvas_sel, 700, 180);
      var stave = new VF.Stave(10, 30, 750);

      stave.setContext(ctx);
      stave.addClef(clef);
      stave.draw();

      var lowerKeys = ["c/", "e/", "a/"];
      var higherKeys = ["c/", "e/", "a/"];
      for (var k = 0; k < lowerKeys.length; k++) {
        lowerKeys[k] = lowerKeys[k] + (4 + octaveShift);
        higherKeys[k] = higherKeys[k] + (5 + octaveShift);
      }

      var restKeys = [ restKey ];

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { clef: clef, keys: higherKeys, duration: "1/2"},
        { clef: clef, keys: lowerKeys, duration: "w"},
        { clef: clef, keys: higherKeys, duration: "h"},
        { clef: clef, keys: lowerKeys, duration: "q"},
        { clef: clef, keys: higherKeys, duration: "8"},
        { clef: clef, keys: lowerKeys, duration: "16"},
        { clef: clef, keys: higherKeys, duration: "32"},
        { clef: clef, keys: higherKeys, duration: "64"},
        { clef: clef, keys: higherKeys, duration: "128"},
        { clef: clef, keys: lowerKeys, duration: "1/2",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "w",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "h",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "q",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "8",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "16",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "32",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "64",
          stem_direction: -1},
        { clef: clef, keys: lowerKeys, duration: "128"},

        { clef: clef, keys: restKeys, duration: "1/2r"},
        { clef: clef, keys: restKeys, duration: "wr"},
        { clef: clef, keys: restKeys, duration: "hr"},
        { clef: clef, keys: restKeys, duration: "qr"},
        { clef: clef, keys: restKeys, duration: "8r"},
        { clef: clef, keys: restKeys, duration: "16r"},
        { clef: clef, keys: restKeys, duration: "32r"},
        { clef: clef, keys: restKeys, duration: "64r"},
        { clef: clef, keys: restKeys, duration: "128r"},
        { keys: ["x/4"], duration: "h"}
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25, true);

        ok(staveNote.getX() > 0, "Note " + i + " has X value");
        ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
      }
    },

    drawBass: function(options, contextBuilder) {
      expect(40);
      var ctx = new contextBuilder(options.canvas_sel, 600, 280);
      var stave = new VF.Stave(10, 10, 650);
      var stave2 = new VF.Stave(10, 150, 650);
      stave.setContext(ctx);
      stave.addClef('bass');
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { clef: 'bass', keys: ["c/3", "e/3", "a/3"], duration: "1/2"},
        { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "w"},
        { clef: 'bass', keys: ["c/3", "e/3", "a/3"], duration: "h"},
        { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "q"},
        { clef: 'bass', keys: ["c/3", "e/3", "a/3"], duration: "8"},
        { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "16"},
        { clef: 'bass', keys: ["c/3", "e/3", "a/3"], duration: "32"},
        { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "h", stem_direction: -1},
        { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "q", stem_direction: -1},
        { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "8", stem_direction: -1},
        { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "16", stem_direction: -1},
        { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "32", stem_direction: -1},

        { keys: ["r/4"], duration: "1/2r"},
        { keys: ["r/4"], duration: "wr"},
        { keys: ["r/4"], duration: "hr"},
        { keys: ["r/4"], duration: "qr"},
        { keys: ["r/4"], duration: "8r"},
        { keys: ["r/4"], duration: "16r"},
        { keys: ["r/4"], duration: "32r"},
        { keys: ["x/4"], duration: "h"}
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, "Note " + i + " has X value");
        ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
      }
    },

    displacements: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      var stave = new VF.Stave(10, 10, 650);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { keys: ["g/3", "a/3", "c/4", "d/4", "e/4"], duration: "1/2"},
        { keys: ["g/3", "a/3", "c/4", "d/4", "e/4"], duration: "w"},
        { keys: ["d/4", "e/4", "f/4"], duration: "h"},
        { keys: ["f/4", "g/4", "a/4", "b/4"], duration: "q"},
        { keys: ["e/3", "b/3", "c/4", "e/4", "f/4", "g/5", "a/5"], duration: "8"},
        { keys: ["a/3", "c/4", "e/4", "g/4", "a/4", "b/4"], duration: "16"},
        { keys: ["c/4", "e/4", "a/4"], duration: "32"},
        { keys: ["c/4", "e/4", "a/4", "a/4"], duration: "64"},
        { keys: ["g/3", "c/4", "d/4", "e/4"], duration: "h", stem_direction: -1},
        { keys: ["d/4", "e/4", "f/4"], duration: "q", stem_direction: -1},
        { keys: ["f/4", "g/4", "a/4", "b/4"], duration: "8", stem_direction: -1},
        { keys: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4"], duration: "16",
          stem_direction: -1},
        { keys: ["b/3", "c/4", "e/4", "a/4", "b/5", "c/6", "e/6"], duration: "32",
          stem_direction: -1},
        { keys: ["b/3", "c/4", "e/4", "a/4", "b/5", "c/6", "e/6", "e/6"],
          duration: "64", stem_direction: -1}
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 45);

        ok(staveNote.getX() > 0, "Note " + i + " has X value");
        ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
      }
    },

    drawHarmonicAndMuted: function(options,
                                                            contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 300, 180);
      var stave = new VF.Stave(10, 10, 280);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { keys: ["c/4", "e/4", "a/4"], duration: "1/2h"},
        { keys: ["c/4", "e/4", "a/4"], duration: "wh"},
        { keys: ["c/4", "e/4", "a/4"], duration: "hh"},
        { keys: ["c/4", "e/4", "a/4"], duration: "qh"},
        { keys: ["c/4", "e/4", "a/4"], duration: "8h"},
        { keys: ["c/4", "e/4", "a/4"], duration: "16h"},
        { keys: ["c/4", "e/4", "a/4"], duration: "32h"},
        { keys: ["c/4", "e/4", "a/4"], duration: "64h"},
        { keys: ["c/4", "e/4", "a/4"], duration: "128h"},
        { keys: ["c/4", "e/4", "a/4"], duration: "1/2h", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "wh", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "hh", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "qh", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "8h", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "16h", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "32h", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "64h", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "128h", stem_direction: -1},

        { keys: ["c/4", "e/4", "a/4"], duration: "1/2m"},
        { keys: ["c/4", "e/4", "a/4"], duration: "wm"},
        { keys: ["c/4", "e/4", "a/4"], duration: "hm"},
        { keys: ["c/4", "e/4", "a/4"], duration: "qm"},
        { keys: ["c/4", "e/4", "a/4"], duration: "8m"},
        { keys: ["c/4", "e/4", "a/4"], duration: "16m"},
        { keys: ["c/4", "e/4", "a/4"], duration: "32m"},
        { keys: ["c/4", "e/4", "a/4"], duration: "64m"},
        { keys: ["c/4", "e/4", "a/4"], duration: "128m"},
        { keys: ["c/4", "e/4", "a/4"], duration: "1/2m", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "wm", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "hm", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "qm", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "8m", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "16m", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "32m", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "64m", stem_direction: -1},
        { keys: ["c/4", "e/4", "a/4"], duration: "128m", stem_direction: -1}
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, "Note " + i + " has X value");
        ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
      }
    },

    drawSlash: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 180);
      var stave = new VF.Stave(10, 10, 650);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { keys: ["b/4"], duration: "1/2s", stem_direction: -1},
        { keys: ["b/4"], duration: "ws", stem_direction: -1},
        { keys: ["b/4"], duration: "hs", stem_direction: -1},
        { keys: ["b/4"], duration: "qs", stem_direction: -1},
        { keys: ["b/4"], duration: "8s", stem_direction: -1},
        { keys: ["b/4"], duration: "16s", stem_direction: -1},
        { keys: ["b/4"], duration: "32s", stem_direction: -1},
        { keys: ["b/4"], duration: "64s", stem_direction: -1},
        { keys: ["b/4"], duration: "128s", stem_direction: -1},

        { keys: ["b/4"], duration: "1/2s", stem_direction: 1},
        { keys: ["b/4"], duration: "ws", stem_direction: 1},
        { keys: ["b/4"], duration: "hs", stem_direction: 1},
        { keys: ["b/4"], duration: "qs", stem_direction: 1},
        { keys: ["b/4"], duration: "8s", stem_direction: 1},
        { keys: ["b/4"], duration: "16s", stem_direction: 1},
        { keys: ["b/4"], duration: "32s", stem_direction: 1},
        { keys: ["b/4"], duration: "64s", stem_direction: 1},
        { keys: ["b/4"], duration: "128s", stem_direction: 1},

        // Beam
        { keys: ["b/4"], duration: "8s", stem_direction: -1},
        { keys: ["b/4"], duration: "8s", stem_direction: -1},
        { keys: ["b/4"], duration: "8s", stem_direction: 1},
        { keys: ["b/4"], duration: "8s", stem_direction: 1}
      ];

      var stave_notes = notes.map(function(note) {return new VF.StaveNote(note)});
      var beam1 = new VF.Beam([stave_notes[16], stave_notes[17]]);
      var beam2 = new VF.Beam([stave_notes[18], stave_notes[19]]);

      VF.Formatter.FormatAndDraw(ctx, stave, stave_notes, false);

      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      ok("Slash Note Heads");
    },

    drawKeyStyles: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 300, 280);
      var stave = new VF.Stave(10, 0, 100);
      ctx.scale(3, 3);
      stave.setContext(ctx);
      stave.draw();

      var note_struct = { keys: ["g/4","bb/4","d/5"], duration: "q" };
      var note = new VF.StaveNote(note_struct);
      note.addAccidental(1, new VF.Accidental('b'));
      note.setKeyStyle(1, {shadowBlur:15, shadowColor:'blue', fillStyle:'blue'});

      var tickContext = new VF.TickContext();
      tickContext.addTickable(note).preFormat().setX(25).setPixelsUsed(20);
      note.setContext(ctx).setStave(stave);
      note.draw();

      ok(note.getX() > 0, "Note has X value");
      ok(note.getYs().length > 0, "Note has Y values");
    },

    drawNoteStyles: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 300, 280);
      var stave = new VF.Stave(10, 0, 100);
      ctx.scale(3, 3);
      stave.setContext(ctx);
      stave.draw();

      var note_struct = { keys: ["g/4","bb/4","d/5"], duration: "q" };
      var note = new VF.StaveNote(note_struct);
      note.addAccidental(1, new VF.Accidental('b'));
      note.setStyle({shadowBlur:15, shadowColor:'blue', fillStyle:'blue', strokeStyle:'blue'});

      var tickContext = new VF.TickContext();
      tickContext.addTickable(note).preFormat().setX(25).setPixelsUsed(20);
      note.setContext(ctx).setStave(stave);
      note.draw();

      ok(note.getX() > 0, "Note has X value");
      ok(note.getYs().length > 0, "Note has Y values");
    },


    renderNote: function(note, stave, ctx, x) {
      var mc = new VF.ModifierContext();
      note.addToModifierContext(mc);

      var tickContext = new VF.TickContext();
      tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(65);

      note.setContext(ctx).setStave(stave);
      note.draw();

      ctx.save();
      return note;
    },

    dotsAndFlagsStemUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);
      ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new VF.Stave(10, 10, 975);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Dot(type); }

      var notes = [
        newNote({ keys: ["f/4"],
            duration: "4", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["f/4"],
            duration: "8", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["f/4"],
            duration: "16", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["f/4"],
            duration: "32", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["f/4"],
            duration: "64", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["f/4"],
            duration: "128", stem_direction: 1}).
          addDotToAll().
          addDotToAll(),


        newNote({ keys: ["g/4"],
            duration: "4", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["g/4"],
            duration: "8", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["g/4"],
            duration: "16", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["g/4"],
            duration: "32"}).
          addDotToAll(),

        newNote({ keys: ["g/4"],
            duration: "64", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["g/4"],
            duration: "128", stem_direction: 1}).
          addDotToAll().
          addDotToAll()
      ];

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
      }

      ok(true, "Full Dot");
    },


    dotsAndFlagsStemDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 160);
      ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new VF.Stave(10, 10, 975);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Dot(type); }

      var notes = [
        newNote({ keys: ["e/5"],
            duration: "4", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/5"],
            duration: "8", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/5"],
            duration: "16", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/5"],
            duration: "32", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/5"],
            duration: "64", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/5"],
            duration: "128", stem_direction: -1}).
          addDotToAll(),


        newNote({ keys: ["d/5"],
            duration: "4", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["d/5"],
            duration: "8", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["d/5"],
            duration: "16", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["d/5"],
            duration: "32",  stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["d/5"],
            duration: "64", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["d/5"],
            duration: "128", stem_direction: -1}).
          addDotToAll()
      ];

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
      }

      ok(true, "Full Dot");
    },
    dotsAndBeamsUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);
      ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new VF.Stave(10, 10, 975);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Dot(type); }

      var notes = [
        newNote({ keys: ["f/4"],
            duration: "8", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["f/4"],
            duration: "16", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["f/4"],
            duration: "32", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["f/4"],
            duration: "64", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["f/4"],
            duration: "128", stem_direction: 1}).
          addDotToAll().
          addDotToAll(),

        newNote({ keys: ["g/4"],
            duration: "8", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["g/4"],
            duration: "16", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["g/4"],
            duration: "32"}).
          addDotToAll(),

        newNote({ keys: ["g/4"],
            duration: "64", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["g/4"],
            duration: "128", stem_direction: 1}).
          addDotToAll().
          addDotToAll()
      ];

      var beam = new VF.Beam(notes);

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
      }

      beam.setContext(ctx).draw();
      ok(true, "Full Dot");
    },



    dotsAndBeamsDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 160);
      ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new VF.Stave(10, 10, 975);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Dot(type); }

      var notes = [

        newNote({ keys: ["e/5"],
            duration: "8", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/5"],
            duration: "16", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/5"],
            duration: "32", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/5"],
            duration: "64", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/5"],
            duration: "128", stem_direction: -1}).
          addDotToAll(),


        newNote({ keys: ["d/5"],
            duration: "8", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["d/5"],
            duration: "16", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["d/5"],
            duration: "32",  stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["d/5"],
            duration: "64", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["d/5"],
            duration: "128", stem_direction: -1}).
          addDotToAll()
      ];

      var beam = new VF.Beam(notes);

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
      }
      beam.setContext(ctx).draw();

      ok(true, "Full Dot");
    },

    centerAlignedRest: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 160);
      ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new VF.Stave(10, 10, 350);

      stave.addClef('treble');
      stave.addTimeSignature('4/4');

      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes0 = [
        { keys: ["b/4"], duration: "1r", align_center: true}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);

      var formatter = new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave);

      voice0.draw(ctx, stave);

      ok(true);
    },

    centerAlignedRestFermata: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 160);
      ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new VF.Stave(10, 10, 350);

      stave.addClef('treble');
      stave.addTimeSignature('4/4');

      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes0 = [
        { keys: ["b/4"], duration: "1r", align_center: true}
      ].map(newNote);

      notes0[0].addArticulation(0, new VF.Articulation('a@a').setPosition(3));

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);

      var formatter = new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave);

      voice0.draw(ctx, stave);

      ok(true);
    },

    centerAlignedRestAnnotation: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 160);
      ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new VF.Stave(10, 10, 350);

      stave.addClef('treble');
      stave.addTimeSignature('4/4');

      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes0 = [
        { keys: ["b/4"], duration: "1r", align_center: true}
      ].map(newNote);

      notes0[0].addAnnotation(0, new VF.Annotation('Whole measure rest').setPosition(3));

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);

      var formatter = new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave);

      voice0.draw(ctx, stave);

      ok(true);
    },

    centerAlignedNoteMultiModifiers: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 160);
      ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new VF.Stave(10, 10, 350);

      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) { return new VF.StringNumber(num).setPosition(pos);}


      stave.addClef('treble');
      stave.addTimeSignature('4/4');

      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes0 = [
        { keys: ["c/4", "e/4", "g/4"], duration: "4", align_center: true}
      ].map(newNote);

      notes0[0]
        .addAnnotation(0, new VF.Annotation('Test').setPosition(3))
        .addStroke(0, new VF.Stroke(2))
        .addAccidental(1, new VF.Accidental('#'))
        .addModifier(0, newFinger("3", VF.Modifier.Position.LEFT))
        .addModifier(2, newFinger("2", VF.Modifier.Position.LEFT))
        .addModifier(1, newFinger("1", VF.Modifier.Position.RIGHT))
        .addModifier(2, newStringNumber("4", VF.Modifier.Position.BELOW))
        .addDotToAll();

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);

      var formatter = new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave);

      voice0.draw(ctx, stave);

      ok(true);
    },

    centerAlignedMultiVoice: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 160);
      ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new VF.Stave(10, 10, 350);

      stave.addClef('treble');
      stave.addTimeSignature('3/8');

      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      // Create custom duration
      var custom_duration = new VF.Fraction(3, 8);

      var notes0 = [
        { keys: ["c/4"], duration: "1r", align_center: true, duration_override: custom_duration}
      ].map(newNote);

      var notes1 = [
        { keys: ["b/4"], duration: "8"},
        { keys: ["b/4"], duration: "8"},
        { keys: ["b/4"], duration: "8"},
      ].map(newNote);

      notes1[1].addAccidental(0, new VF.Accidental('#'));

      var TIME3_8 = {
        num_beats: 3,
        beat_value: 8,
        resolution: VF.RESOLUTION
      };

      var beam = new VF.Beam(notes1);

      var voice0 = new VF.Voice(TIME3_8).setStrict(false);
      voice0.addTickables(notes0);

      var voice1 = new VF.Voice(TIME3_8).setStrict(false);
      voice1.addTickables(notes1);

      var formatter = new VF.Formatter().joinVoices([voice0, voice1]).formatToStave([voice0, voice1], stave);

      voice0.draw(ctx, stave);
      voice1.draw(ctx, stave);

      beam.setContext(ctx).draw();

      ok(true);
    }
  };

  return StaveNote;
})();
/**
 * VexFlow - StaveTie Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StaveTie = (function() {
  var StaveTie = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module("StaveTie");
      runTests("Simple StaveTie", StaveTie.simple);
      runTests("Chord StaveTie", StaveTie.chord);
      runTests("Stem Up StaveTie", StaveTie.stemUp);
      runTests("No End Note", StaveTie.noEndNote);
      runTests("No Start Note", StaveTie.noStartNote);
    },

    tieNotes: function(notes, indices, stave, ctx) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 250);
      voice.draw(ctx, stave);

      var tie = new VF.StaveTie({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: indices,
        last_indices: indices,
      });

      tie.setContext(ctx);
      tie.draw();
    },

    drawTie: function(notes, indices, options) {
      var ctx = new options.contextBuilder(options.canvas_sel, 350, 140);

      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 350).setContext(ctx).draw();

      VF.Test.StaveTie.tieNotes(notes, indices, stave, ctx);
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      VF.Test.StaveTie.drawTie([
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"})
      ], [0, 1], options);
      ok(true, "Simple Test");
    },

    chord: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      VF.Test.StaveTie.drawTie([
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#")),
      ], [0, 1, 2], options);
      ok(true, "Chord test");
    },

    stemUp: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      VF.Test.StaveTie.drawTie([
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: 1, duration: "h"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: 1, duration: "h"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#")),
      ], [0, 1, 2], options);
      ok(true, "Stem up test");
    },

    noEndNote: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      var stave = new VF.Stave(10, 10, 350).setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 250);
      voice.draw(ctx, stave);

      var tie = new VF.StaveTie({
        first_note: notes[1],
        last_note: null,
        first_indices: [2],
        last_indices: [2]
      }, "slow.").setContext(ctx).draw();

      ok(true, "No end note");
    },

    noStartNote: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      var stave = new VF.Stave(10, 10, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 250);
      voice.draw(ctx, stave);

      var tie = new VF.StaveTie({
        first_note: null,
        last_note: notes[0],
        first_indices: [2],
        last_indices: [2],
      }, "H").setContext(ctx).draw();

      ok(true, "No end note");
    }
  };

  return StaveTie;
})();
/**
 * VexFlow - StringNumber Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StringNumber = (function() {
  var StringNumber = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("StringNumber");
      runTests("String Number In Notation", StringNumber.drawMultipleMeasures);
      runTests("Fret Hand Finger In Notation", StringNumber.drawFretHandFingers);
      runTests("Multi Voice With Strokes, String & Finger Numbers", StringNumber.multi);
      runTests("Complex Measure With String & Finger Numbers", StringNumber.drawAccidentals);
    },

    drawMultipleMeasures: function(options, contextBuilder) {
      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 750, 200);
      function newStringNumber(num, pos) {
        return new VF.StringNumber(num).setPosition(pos);
      }

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 290);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.addClef("treble").setContext(ctx).draw();
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: -1, duration: "q" }).addDotToAll(),
        new VF.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: -1, duration: "8" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
      ];

      notesBar1[0].
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT)).
        addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT)).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT));

       notesBar1[1].
        addAccidental(0, new VF.Accidental("#")).
        addModifier(0, newStringNumber("5", VF.Modifier.Position.BELOW)).
        addAccidental(1, new VF.Accidental("#").setAsCautionary()).
        addModifier(2, newStringNumber("3",VF.Modifier.Position.ABOVE).
                                           setLastNote(notesBar1[3]).
                                           setLineEndType(VF.Renderer.LineEndType.DOWN));

      notesBar1[2].
        addModifier(0, newStringNumber("5", VF.Modifier.Position.LEFT)).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#"));

      notesBar1[3].
        // Position string 5 below default
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT).setOffsetY(7)).
        // Position string 4 below default
        addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT).setOffsetY(6)).
          // Position string 3 above default
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT).setOffsetY(-6));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: 1, duration: "q" }),
      ];

      notesBar2[0].
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT)).
        addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT)).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT));

      notesBar2[1].
        addAccidental(0, new VF.Accidental("#")).
        addModifier(0, newStringNumber("5", VF.Modifier.Position.BELOW)).
        addAccidental(1, new VF.Accidental("#")).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.ABOVE).setLastNote(notesBar2[3]).setDashed(false));

      notesBar2[2].
        addModifier(2, newStringNumber("3", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#"));

      notesBar2[3].
        // Position string 5 below default
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT).setOffsetY(7)).
        // Position string 4 below default
        addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT).setOffsetY(6)).
        // Position string 5 above default
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT).setOffsetY(-6));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      // bar 3 - juxtaposing third bar next to second bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x, staveBar2.y, 150);
      staveBar3.setEndBarType(VF.Barline.type.END);
      staveBar3.setContext(ctx).draw();

      var notesBar3 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "a/4"], duration: "w" }).addDotToAll(),
      ];

      notesBar3[0].
        addModifier(0, newStringNumber("5", VF.Modifier.Position.BELOW)).
        addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT)).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.LEFT)).
        addModifier(3, newStringNumber("2", VF.Modifier.Position.ABOVE));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

      ok(true, "String Number");
    },

    drawFretHandFingers: function(options, contextBuilder) {
      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 600, 200);
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) { return new VF.StringNumber(num).setPosition(pos);}

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 290);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.addClef("treble").setContext(ctx).draw();
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
      ];

      notesBar1[0].
        addModifier(0, newFinger("3", VF.Modifier.Position.LEFT)).
        addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
        addModifier(2, newFinger("0", VF.Modifier.Position.LEFT));

       notesBar1[1].
        addAccidental(0, new VF.Accidental("#")).
        addModifier(0, newFinger("3", VF.Modifier.Position.LEFT)).
        addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#")).
        addModifier(2, newFinger("0", VF.Modifier.Position.LEFT));

      notesBar1[2].
        addModifier(0, newFinger("3", VF.Modifier.Position.BELOW)).
        addModifier(1, newFinger("4", VF.Modifier.Position.LEFT)).
        addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT)).
        addModifier(2, newFinger("0", VF.Modifier.Position.ABOVE)).
        addAccidental(1, new VF.Accidental("#"));

      notesBar1[3].
        addModifier(0, newFinger("3", VF.Modifier.Position.RIGHT)).
        // Position string 5 below default
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT).setOffsetY(7)).
        addModifier(1, newFinger("4", VF.Modifier.Position.RIGHT)).
        // Position String 4 below default
        addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT).setOffsetY(6)).
        // Position finger 0 above default
        addModifier(2, newFinger("0", VF.Modifier.Position.RIGHT).setOffsetY(-5)).
        // Position string 3 above default
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT).setOffsetY(-6));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);


      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setEndBarType(VF.Barline.type.END);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: 1, duration: "q" }).addDotToAll(),
        new VF.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: 1, duration: "8" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: 1, duration: "8" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }).addDotToAll(),
      ];

     notesBar2[0].
      addModifier(0, newFinger("3", VF.Modifier.Position.RIGHT)).
      addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
      addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT)).
      addModifier(2, newFinger("0", VF.Modifier.Position.ABOVE));

     notesBar2[1].
      addAccidental(0, new VF.Accidental("#")).
      addModifier(0, newFinger("3", VF.Modifier.Position.RIGHT)).
      addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
      addAccidental(1, new VF.Accidental("#")).
      addModifier(2, newFinger("0", VF.Modifier.Position.LEFT));

    notesBar2[2].
      addModifier(0, newFinger("3", VF.Modifier.Position.BELOW)).
      addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
      addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT)).
    //  addModifier(2, newFinger("1", VF.Modifier.Position.ABOVE)).
      addModifier(2, newFinger("1", VF.Modifier.Position.RIGHT)).
      addAccidental(2, new VF.Accidental("#"));

    notesBar2[3].
      addModifier(0, newFinger("3", VF.Modifier.Position.RIGHT)).
      // position string 5 below default
      addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT).setOffsetY(7)).
      // position finger 4 below default
      addModifier(1, newFinger("4", VF.Modifier.Position.RIGHT)).
      // position string 4 below default
      addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT).setOffsetY(6)).
      // position finger 1 above default
      addModifier(2, newFinger("1", VF.Modifier.Position.RIGHT).setOffsetY(-6)).
      // position string 3 above default
      addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT).setOffsetY(-6));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      ok(true, "String Number");
    },

    multi: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) { return new VF.StringNumber(num).setPosition(pos);}
      var stave = new VF.Stave(50, 10, 500);
      stave.setContext(c);
      stave.draw();

      var notes = [
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["a/3", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" })
      ];
      // Create the strokes
      var stroke1 = new VF.Stroke(5);
      var stroke2 = new VF.Stroke(6);
      var stroke3 = new VF.Stroke(2);
      var stroke4 = new VF.Stroke(1);
      notes[0].addStroke(0, stroke1);
      notes[0].addModifier(0, newFinger("3", VF.Modifier.Position.LEFT));
      notes[0].addModifier(1, newFinger("2", VF.Modifier.Position.LEFT));
      notes[0].addModifier(2, newFinger("0", VF.Modifier.Position.LEFT));
      notes[0].addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT));
      notes[0].addModifier(2, newStringNumber("3", VF.Modifier.Position.ABOVE));

      notes[1].addStroke(0, stroke2);
      notes[1].addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT));
      notes[1].addModifier(2, newStringNumber("3", VF.Modifier.Position.ABOVE));
      notes[1].addAccidental(0, new VF.Accidental("#"));
      notes[1].addAccidental(1, new VF.Accidental("#"));
      notes[1].addAccidental(2, new VF.Accidental("#"));

      notes[2].addStroke(0, stroke3);
      notes[2].addModifier(0, newFinger("3", VF.Modifier.Position.LEFT));
      notes[2].addModifier(1, newFinger("0", VF.Modifier.Position.RIGHT));
      notes[2].addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT));
      notes[2].addModifier(2, newFinger("1", VF.Modifier.Position.LEFT));
      notes[2].addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT));

      notes[3].addStroke(0, stroke4);
      notes[3].addModifier(2, newStringNumber("3", VF.Modifier.Position.LEFT));
      notes[3].addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT));

      var notes2 = [
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"})
      ];
      notes2[0].addModifier(0, newFinger("0", VF.Modifier.Position.LEFT));
      notes2[0].addModifier(0, newStringNumber("6", VF.Modifier.Position.BELOW));
      notes2[2].addAccidental(0, new VF.Accidental("#"));
      notes2[4].addModifier(0, newFinger("0", VF.Modifier.Position.LEFT));
      // Position string number 6 beneath the strum arrow: left (15) and down (18)
      notes2[4].addModifier(0, newStringNumber("6", VF.Modifier.Position.LEFT).
                                   setOffsetX(15).
                                   setOffsetY(18));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 400);

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice2.draw(c, stave);
      beam2_1.setContext(c).draw();
      beam2_2.setContext(c).draw();
      voice.draw(c, stave);

      ok(true, "Strokes Test Multi Voice");
    },

    drawAccidentals: function(options, contextBuilder) {
      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 600, 200);
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) { return new VF.StringNumber(num).setPosition(pos);}

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 475);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.addClef("treble").setContext(ctx).draw();
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "c/5", "e/5", "g/5"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "d/5", "e/5", "g/5"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "d/5", "e/5", "g/5"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "d/5", "e/5", "g/5"], stem_direction: -1, duration: "q" }),
      ];

      notesBar1[0].
        addModifier(0, newFinger("3", VF.Modifier.Position.LEFT)).
        addAccidental(0, new VF.Accidental("#")).
        addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
        addModifier(1, newStringNumber("2", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#")).
        addModifier(2, newFinger("0", VF.Modifier.Position.LEFT)).
        addAccidental(2, new VF.Accidental("#")).
        addModifier(3, newFinger("3", VF.Modifier.Position.LEFT)).
        addAccidental(3, new VF.Accidental("#")).
        addModifier(4, newFinger("2", VF.Modifier.Position.RIGHT)).
        addModifier(4, newStringNumber("3", VF.Modifier.Position.RIGHT)).
        addAccidental(4, new VF.Accidental("#")).
        addModifier(5, newFinger("0", VF.Modifier.Position.LEFT)).
        addAccidental(5, new VF.Accidental("#"));

      notesBar1[1].
        addAccidental(0, new VF.Accidental("#")).
        addAccidental(1, new VF.Accidental("#")).
        addAccidental(2, new VF.Accidental("#")).
        addAccidental(3, new VF.Accidental("#")).
        addAccidental(4, new VF.Accidental("#")).
        addAccidental(5, new VF.Accidental("#"));

      notesBar1[2].
        addModifier(0, newFinger("3", VF.Modifier.Position.LEFT)).
        addAccidental(0, new VF.Accidental("#")).
        addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
        addModifier(1, newStringNumber("2", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#")).
        addModifier(2, newFinger("0", VF.Modifier.Position.LEFT)).
        addAccidental(2, new VF.Accidental("#")).
        addModifier(3, newFinger("3", VF.Modifier.Position.LEFT)).
        addAccidental(3, new VF.Accidental("#")).
        addModifier(4, newFinger("2", VF.Modifier.Position.RIGHT)).
        addModifier(4, newStringNumber("3", VF.Modifier.Position.RIGHT)).
        addAccidental(4, new VF.Accidental("#")).
        addModifier(5, newFinger("0", VF.Modifier.Position.LEFT)).
        addAccidental(5, new VF.Accidental("#"));

      notesBar1[3].
        addAccidental(0, new VF.Accidental("#")).
        addAccidental(1, new VF.Accidental("#")).
        addAccidental(2, new VF.Accidental("#")).
        addAccidental(3, new VF.Accidental("#")).
        addAccidental(4, new VF.Accidental("#")).
        addAccidental(5, new VF.Accidental("#"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      ok(true, "String Number");
    }
  };

  return StringNumber;
})();
/**
 * VexFlow - Stroke Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Strokes = (function() {
  var Strokes = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module("Strokes");
      runTests("Strokes - Brush/Arpeggiate/Rasquedo", Strokes.drawMultipleMeasures);
      runTests("Strokes - Multi Voice", Strokes.multi);
      runTests("Strokes - Notation and Tab", Strokes.notesWithTab);
      runTests("Strokes - Multi-Voice Notation and Tab", Strokes.multiNotationAndTab);
    },

    drawMultipleMeasures: function(options, contextBuilder) {
      // Get the rendering context

      var ctx = contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 250);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.setContext(ctx);
      staveBar1.draw();

      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/3", "e/4", "a/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
      ];
      notesBar1[0].addStroke(0, new VF.Stroke(1));
      notesBar1[1].addStroke(0, new VF.Stroke(2));
      notesBar1[2].addStroke(0, new VF.Stroke(1));
      notesBar1[3].addStroke(0, new VF.Stroke(2));
      notesBar1[1].addAccidental(1, new VF.Accidental("#"));
      notesBar1[1].addAccidental(2, new VF.Accidental("#"));
      notesBar1[1].addAccidental(0, new VF.Accidental("#"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx);
      staveBar2.draw();
      var notesBar2 = [
        new VF.StaveNote({ keys: ["c/4", "d/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "d/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "d/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" })
      ];
      notesBar2[0].addStroke(0, new VF.Stroke(3));
      notesBar2[1].addStroke(0, new VF.Stroke(4));
      notesBar2[2].addStroke(0, new VF.Stroke(5));
      notesBar2[3].addStroke(0, new VF.Stroke(6));
      notesBar2[3].addAccidental(0, new VF.Accidental("bb"));
      notesBar2[3].addAccidental(1, new VF.Accidental("bb"));
      notesBar2[3].addAccidental(2, new VF.Accidental("bb"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      ok(true, "Brush/Roll/Rasquedo");
    },

    multi: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 400, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      var stave = new VF.Stave(50, 10, 300);
      stave.setContext(c);
      stave.draw();

      var notes = [
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" })
      ];
      // Create the strokes
      var stroke1 = new VF.Stroke(5);
      var stroke2 = new VF.Stroke(6);
      var stroke3 = new VF.Stroke(2);
      var stroke4 = new VF.Stroke(1);
      notes[0].addStroke(0, stroke1);
      notes[1].addStroke(0, stroke2);
      notes[2].addStroke(0, stroke3);
      notes[3].addStroke(0, stroke4);
      notes[1].addAccidental(0, new VF.Accidental("#"));
      notes[1].addAccidental(2, new VF.Accidental("#"));

      var notes2 = [
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 275);

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice2.draw(c, stave);
      beam2_1.setContext(c).draw();
      beam2_2.setContext(c).draw();
      voice.draw(c, stave);

      ok(true, "Strokes Test Multi Voice");
    },

    multiNotationAndTab: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 400, 275);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTabNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      var stave = new VF.Stave(10, 10, 400).addTrebleGlyph().
        setContext(c).draw();
      var tabstave = new VF.TabStave(10, 125, 400).addTabGlyph().
        setNoteStartX(stave.getNoteStartX()).setContext(c).draw();

      // notation upper voice notes
      var notes = [
        newNote({ keys: ["g/4", "b/4", "e/5"], duration: "q" }),
        newNote({ keys: ["g/4", "b/4", "e/5"], duration: "q" }),
        newNote({ keys: ["g/4", "b/4", "e/5"], duration: "q" }),
        newNote({ keys: ["g/4", "b/4", "e/5"], duration: "q" })
      ];

      // tablature upper voice notes
      var notes3 = [
        newTabNote({ positions: [{str: 3, fret: 0},
                                 {str: 2, fret: 0},
                                 {str: 1, fret: 1}], duration: "q"}),
        newTabNote({ positions: [{str: 3, fret: 0},
                                 {str: 2, fret: 0},
                                 {str: 1, fret: 1}], duration: "q"}),
        newTabNote({ positions: [{str: 3, fret: 0},
                                 {str: 2, fret: 0},
                                 {str: 1, fret: 1}], duration: "q"}),
        newTabNote({ positions: [{str: 3, fret: 0},
                                 {str: 2, fret: 0},
                                 {str: 1, fret: 1}], duration: "q"})
      ];

      // Create the strokes for notation
      var stroke1 = new VF.Stroke(3, {all_voices: false});
      var stroke2 = new VF.Stroke(6);
      var stroke3 = new VF.Stroke(2, {all_voices: false});
      var stroke4 = new VF.Stroke(1);
      // add strokes to notation
      notes[0].addStroke(0, stroke1);
      notes[1].addStroke(0, stroke2);
      notes[2].addStroke(0, stroke3);
      notes[3].addStroke(0, stroke4);

      // creae strokes for tab
      var stroke5 = new VF.Stroke(3, {all_voices: false});
      var stroke6 = new VF.Stroke(6);
      var stroke7 = new VF.Stroke(2, {all_voices: false});
      var stroke8 = new VF.Stroke(1);
      // add strokes to tab
      notes3[0].addStroke(0, stroke5);
      notes3[1].addStroke(0, stroke6);
      notes3[2].addStroke(0, stroke7);
      notes3[3].addStroke(0, stroke8);

      // notation lower voice notes
      var notes2 = [
        newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"})
      ];

      // tablature lower voice notes
      var notes4 = [
        newTabNote({ positions: [{str: 6, fret: 3}], duration: "q"}),
        newTabNote({ positions: [{str: 6, fret: 3}], duration: "q"}),
        newTabNote({ positions: [{str: 6, fret: 3}], duration: "q"}),
        newTabNote({ positions: [{str: 6, fret: 3}], duration: "q"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      var voice3 = new VF.Voice(VF.Test.TIME4_4);
      var voice4 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);
      voice4.addTickables(notes4);
      voice3.addTickables(notes3);

      var formatter = new VF.Formatter().joinVoices([voice, voice2, voice3, voice4]).
        format([voice, voice2, voice3, voice4], 275);

      voice2.draw(c, stave);
      voice.draw(c, stave);
      voice4.draw(c, tabstave);
      voice3.draw(c, tabstave);

      ok(true, "Strokes Test Notation & Tab Multi Voice");
    },

    drawTabStrokes: function(options, contextBuilder) {
      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 600, 200);

      // bar 1
      var staveBar1 = new VF.TabStave(10, 50, 250);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.setContext(ctx).draw();

      var notesBar1 = [
        new VF.TabNote({ positions: [{str: 2, fret: 8 },
                                           {str: 3, fret: 9},
                                           {str: 4, fret: 10}], duration: "q"}),
        new VF.TabNote({ positions: [{str: 3, fret: 7 },
                                           {str: 4, fret: 8},
                                           {str: 5, fret: 9}], duration: "q"}),
        new VF.TabNote({ positions: [{str: 1, fret: 5 },
                                           {str: 2, fret: 6},
                                           {str: 3, fret: 7},
                                           {str: 4, fret: 7},
                                           {str: 5, fret: 5},
                                           {str: 6, fret: 5}], duration: "q"}),
        new VF.TabNote({ positions: [{str: 4, fret: 3 },
                                           {str: 5, fret: 4},
                                           {str: 6, fret: 5}], duration: "q"}),
      ];

      var stroke1 = new VF.Stroke(1);
      var stroke2 = new VF.Stroke(2);
      var stroke3 = new VF.Stroke(3);
      var stroke4 = new VF.Stroke(4);

      notesBar1[0].addStroke(0, stroke1);
      notesBar1[1].addStroke(0, stroke2);
      notesBar1[2].addStroke(0, stroke4);
      notesBar1[3].addStroke(0, stroke3);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

     // bar 2
      var staveBar2 = new VF.TabStave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx).draw();
      var notesBar2 = [new VF.TabNote({ positions: [{str: 2, fret: 7 },
                                                          {str: 3, fret: 8},
                                                          {str: 4, fret: 9}], duration: "h"}),
                       new VF.TabNote({ positions: [{str: 1, fret: 5 },
                                                          {str: 2, fret: 6},
                                                          {str: 3, fret: 7},
                                                          {str: 4, fret: 7},
                                                          {str: 5, fret: 5},
                                                          {str: 6, fret: 5}], duration: "h"}),
      ];

      notesBar2[0].addStroke(0, new VF.Stroke(6));
      notesBar2[1].addStroke(0, new VF.Stroke(5));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
      ok(true, "Strokes Tab test");

    },

    getTabNotes: function() {
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTabNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["b/4", "d/5", "g/5"], stem_direction: -1, duration: "q"}).
          addAccidental(1, newAcc("b")).
          addAccidental(0, newAcc("b")),
        newNote({ keys: ["c/5", "d/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["b/3", "e/4", "a/4", "d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/3", "e/4", "a/4", "c/5", "e/5", "a/5"], stem_direction: 1, duration: "8"}).
          addAccidental(3, newAcc("#")),
        newNote({ keys: ["b/3", "e/4", "a/4", "d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/3", "e/4", "a/4", "c/5", "f/5", "a/5"], stem_direction: 1, duration: "8"}).
            addAccidental(3, newAcc("#")).
            addAccidental(4, newAcc("#"))
      ];

      var tabs1 = [
        newTabNote({ positions: [{str: 1, fret: 3},
                                 {str: 2, fret: 2},
                                 {str: 3, fret: 3}], duration: "q"}).
          addModifier(new VF.Bend("Full"), 0),
        newTabNote({ positions: [{str: 2, fret: 3},
                                 {str: 3, fret: 5}], duration: "q"}).
          addModifier(new VF.Bend("Unison"), 1),
        newTabNote({ positions: [{str: 3, fret: 7},
                                 {str: 4, fret: 7},
                                 {str: 5, fret: 7},
                                 {str: 6, fret: 7},], duration: "8"}),
        newTabNote({ positions: [{str: 1, fret: 5},
                                 {str: 2, fret: 5},
                                 {str: 3, fret: 6},
                                 {str: 4, fret: 7},
                                 {str: 5, fret: 7},
                                 {str: 6, fret: 5}], duration: "8"}),
        newTabNote({ positions: [{str: 3, fret: 7},
                                 {str: 4, fret: 7},
                                 {str: 5, fret: 7},
                                 {str: 6, fret: 7},], duration: "8"}),
        newTabNote({ positions: [{str: 1, fret: 5},
                                 {str: 2, fret: 5},
                                 {str: 3, fret: 6},
                                 {str: 4, fret: 7},
                                 {str: 5, fret: 7},
                                 {str: 6, fret: 5}], duration: "8"})

      ];

      var noteStr1 = new VF.Stroke(1);
      var noteStr2 = new VF.Stroke(2);
      var noteStr3 = new VF.Stroke(3);
      var noteStr4 = new VF.Stroke(4);
      var noteStr5 = new VF.Stroke(5);
      var noteStr6 = new VF.Stroke(6);

      notes1[0].addStroke(0, noteStr1);
      notes1[1].addStroke(0, noteStr2);
      notes1[2].addStroke(0, noteStr3);
      notes1[3].addStroke(0, noteStr4);
      notes1[4].addStroke(0, noteStr5);
      notes1[5].addStroke(0, noteStr6);

      var tabStr1 = new VF.Stroke(1);
      var tabStr2 = new VF.Stroke(2);
      var tabStr3 = new VF.Stroke(3);
      var tabStr4 = new VF.Stroke(4);
      var tabStr5 = new VF.Stroke(5);
      var tabStr6 = new VF.Stroke(6);

      tabs1[0].addStroke(0, tabStr1);
      tabs1[1].addStroke(0, tabStr2);
      tabs1[2].addStroke(0, tabStr3);
      tabs1[3].addStroke(0, tabStr4);
      tabs1[4].addStroke(0, tabStr5);
      tabs1[5].addStroke(0, tabStr6);

      return { notes: notes1, tabs: tabs1 };
    },

    renderNotesWithTab:
      function(notes, ctx, staves, justify) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      var tabVoice = new VF.Voice(VF.Test.TIME4_4);

      voice.addTickables(notes.notes);
      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice);

      tabVoice.addTickables(notes.tabs);

      new VF.Formatter().
        joinVoices([voice]).joinVoices([tabVoice]).
        format([voice, tabVoice], justify);

      voice.draw(ctx, staves.notes);
      beams.forEach(function(beam){
        beam.setContext(ctx).draw();
      });
      tabVoice.draw(ctx, staves.tabs);
    },

    notesWithTab: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 420, 450);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";

      // Get test voices.
      var notes = VF.Test.Strokes.getTabNotes();
      var stave = new VF.Stave(10, 10, 400).addTrebleGlyph().
        setContext(ctx).draw();
      var tabstave = new VF.TabStave(10, 100, 400).addTabGlyph().
        setNoteStartX(stave.getNoteStartX()).setContext(ctx).draw();
      var connector = new VF.StaveConnector(stave, tabstave);
      var line = new VF.StaveConnector(stave, tabstave);
      connector.setType(VF.StaveConnector.type.BRACKET);
      connector.setContext(ctx);
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      connector.draw();
      line.draw();

      VF.Test.Strokes.renderNotesWithTab(notes, ctx,
          { notes: stave, tabs: tabstave });
      ok(true);

      var stave2 = new VF.Stave(10, 250, 400).addTrebleGlyph().
        setContext(ctx).draw();
      var tabstave2 = new VF.TabStave(10, 350, 400).addTabGlyph().
        setNoteStartX(stave2.getNoteStartX()).setContext(ctx).draw();
      var connector = new VF.StaveConnector(stave2, tabstave2);
      var line = new VF.StaveConnector(stave2, tabstave2);
      connector.setType(VF.StaveConnector.type.BRACKET);
      connector.setContext(ctx);
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      connector.draw();
      line.draw();

      VF.Test.Strokes.renderNotesWithTab(notes, ctx,
          { notes: stave2, tabs: tabstave2 }, 385);
      ok(true);
    }
  };

  return Strokes;
})();
/**
 * VexFlow - TabNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabNote = (function() {
  var TabNote = {
    Start: function() {
      QUnit.module("TabNote");
      test("Tick", VF.Test.TabNote.ticks);
      test("TabStave Line", VF.Test.TabNote.tabStaveLine);
      test("Width", VF.Test.TabNote.width);
      test("TickContext", VF.Test.TabNote.tickContext);

      var runTests = VF.Test.runTests;
      runTests("TabNote Draw", TabNote.draw);
      runTests("TabNote Stems Up", TabNote.drawStemsUp);
      runTests("TabNote Stems Down", TabNote.drawStemsDown);
      runTests("TabNote Stems Up Through Stave", TabNote.drawStemsUpThrough);
      runTests("TabNote Stems Down Through Stave", TabNote.drawStemsDownThrough);
      runTests("TabNote Stems with Dots", TabNote.drawStemsDotted);
    },

    ticks: function() {
      var BEAT = 1 * VF.RESOLUTION / 4;

      var note = new VF.TabNote(
          { positions: [{str: 6, fret: 6 }], duration: "w"});
      equal(note.getTicks().value(), BEAT * 4, "Whole note has 4 beats");

      note = new VF.TabNote(
          { positions: [{str: 3, fret: 4 }], duration: "q"});
      equal(note.getTicks().value(), BEAT, "Quarter note has 1 beat");
    },

    tabStaveLine: function() {
      var note = new VF.TabNote(
          { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});
      var positions = note.getPositions();
      equal(positions[0].str, 6, "String 6, Fret 6");
      equal(positions[0].fret, 6, "String 6, Fret 6");
      equal(positions[1].str, 4, "String 4, Fret 5");
      equal(positions[1].fret, 5, "String 4, Fret 5");

      var stave = new VF.Stave(10, 10, 300);
      note.setStave(stave);

      var ys = note.getYs();
      equal(ys.length, 2, "Chord should be rendered on two lines");
      equal(ys[0], 99, "Line for String 6, Fret 6");
      equal(ys[1], 79, "Line for String 4, Fret 5");
    },

    width: function() {
      expect(1);
      var note = new VF.TabNote(
          { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});

      try {
        var width = note.getWidth();
      } catch (e) {
        equal(e.code, "UnformattedNote",
            "Unformatted note should have no width");
      }
    },

    tickContext: function() {
      var note = new VF.TabNote(
          { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});
      var tickContext = new VF.TickContext();
      tickContext.addTickable(note);
      tickContext.preFormat();
      tickContext.setX(10);
      tickContext.setPadding(0);

      equal(tickContext.getWidth(), 6);
    },

    showNote: function(tab_struct, stave, ctx, x) {
      var note = new VF.TabNote(tab_struct);
      var tickContext = new VF.TickContext();
      tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(20);
      note.setContext(ctx).setStave(stave);
      note.draw();
      return note;
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 140);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.TabNote.showNote;
      var notes = [
        { positions: [{str: 6, fret: 6 }], duration: "q"},
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "q"},
        { positions: [{str: 2, fret: "x" }, {str: 5, fret: 15}], duration: "q"},
        { positions: [{str: 2, fret: "x" }, {str: 5, fret: 5}], duration: "q"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "q"},
        { positions: [{str: 6, fret: 0},
                      {str: 5, fret: 5},
                      {str: 4, fret: 5},
                      {str: 3, fret: 4},
                      {str: 2, fret: 3},
                      {str: 1, fret: 0}],
                      duration: "q"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "q"}
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, "Note " + i + " has X value");
        ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
      }
    },

    drawStemsUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 30, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'TabNotes successfully drawn');
    },

    drawStemsDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'All objects have been drawn');
    },

    drawStemsUpThrough: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 30, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_stem_through_stave = true;
        return tabNote;
      });

      ctx.setFont("sans-serif", 10, "bold");
      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'TabNotes successfully drawn');
    },

    drawStemsDownThrough: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 250);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550,{num_lines:8});
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}, {str: 6, fret: 10}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}, {str: 5, fret: 5}, {str: 7, fret: 5}], duration: "128"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_stem_through_stave = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      ctx.setFont("Arial", 10, "bold");

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'All objects have been drawn');
    },

    drawStemsDotted: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4d"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "4dd", stem_direction: -1 },
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16", stem_direction: -1},
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec, true);
        return tabNote;
      });

      notes[0].addDot();
      notes[2].addDot();
      notes[2].addDot();

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'TabNotes successfully drawn');
    }
  };

  return TabNote;
})();
/**
 * VexFlow - TabSlide Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabSlide = (function() {
  var TabSlide = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("TabSlide");
      runTests("Simple TabSlide", TabSlide.simple);
      runTests("Slide Up", TabSlide.slideUp);
      runTests("Slide Down", TabSlide.slideDown);
    },

    tieNotes: function(notes, indices, stave, ctx) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 100);
      voice.draw(ctx, stave);

      var tie = new VF.TabSlide({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: indices,
        last_indices: indices,
      }, VF.TabSlide.SLIDE_UP);

      tie.setContext(ctx);
      tie.draw();
    },

    setupContext: function(options, x, y) {
      var ctx = options.contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, x || 350).addTabGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },


    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.TabSlide.setupContext(options);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      VF.Test.TabSlide.tieNotes([
        newNote({ positions: [{str:4, fret:4}], duration: "h"}),
        newNote({ positions: [{str:4, fret:6}], duration: "h"})
      ], [0], c.stave, c.context);
      ok(true, "Simple Test");
    },

    multiTest: function(options, factory) {
      var c = VF.Test.TabSlide.setupContext(options, 440, 100);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var notes = [
        newNote({ positions: [{str:4, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:4}, {str:5, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:6}, {str:5, fret:6}], duration: "8"}),
        newNote({ positions: [{str:2, fret:14}], duration: "8"}),
        newNote({ positions: [{str:2, fret:16}], duration: "8"}),
        newNote({ positions: [{str:2, fret:14}, {str:3, fret:14}], duration: "8"}),
        newNote({ positions: [{str:2, fret:16}, {str:3, fret:16}], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      voice.draw(c.context, c.stave);

      factory({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, "Single note");

      factory({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, "Chord");

      factory({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, "Single note high-fret");

      factory({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, "Chord high-fret");
    },

    slideUp: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabSlide.multiTest(options, VF.TabSlide.createSlideUp);
    },

    slideDown: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabSlide.multiTest(options, VF.TabSlide.createSlideDown);
    }
  };

  return TabSlide;
})();

/**
 * VexFlow - TabStave Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabStave = (function() {
  var TabStave = {
    Start: function() {
      QUnit.module("TabStave");
      VF.Test.runTests("TabStave Draw Test", VF.Test.TabStave.draw);
      VF.Test.runTests("Vertical Bar Test",
          VF.Test.TabStave.drawVerticalBar);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel,
          400, 160);

      var stave = new VF.TabStave(10, 10, 300);
      stave.setNumLines(6);
      stave.setContext(ctx);
      stave.draw();

      equal(stave.getYForNote(0), 127, "getYForNote(0)");
      equal(stave.getYForLine(5), 126, "getYForLine(5)");
      equal(stave.getYForLine(0), 61, "getYForLine(0) - Top Line");
      equal(stave.getYForLine(4), 113, "getYForLine(4) - Bottom Line");

      ok(true, "all pass");
    },

    drawVerticalBar: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel,
          400, 160);

      var stave = new VF.TabStave(10, 10, 300);
      stave.setNumLines(6);
      stave.setContext(ctx);
      stave.drawVerticalBar(50, true);
      stave.drawVerticalBar(100, true);
      stave.drawVerticalBar(150, false);
      stave.setEndBarType(VF.Barline.type.END);
      stave.draw();

      ok(true, "all pass");
    }
  };

  return TabStave;
})();

module.exports = VF.Test.TabStave;
/**
 * VexFlow - TabTie Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabTie = (function() {
  var TabTie = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("TabTie");
      runTests("Simple TabTie", TabTie.simple);
      runTests("Hammerons", TabTie.simpleHammeron);
      runTests("Pulloffs", TabTie.simplePulloff);
      runTests("Tapping", TabTie.tap);
      runTests("Continuous", TabTie.continuous);
    },

    tieNotes: function(notes, indices, stave, ctx, text) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 100);
      voice.draw(ctx, stave);

      var tie = new VF.TabTie({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: indices,
        last_indices: indices,
      }, text || "Annotation");

      tie.setContext(ctx);
      tie.draw();
    },

    setupContext: function(options, x, y) {
      var ctx = options.contextBuilder(options.canvas_sel, x || 350, y || 160);
      ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.setFont("Arial", VF.Test.Font.size, "");
      var stave = new VF.TabStave(10, 10, x || 350).addTabGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    drawTie: function(notes, indices, options, text) {
      var c = VF.Test.TabTie.setupContext(options);
      VF.Test.TabTie.tieNotes(notes, indices, c.stave, c.context, text);
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      VF.Test.TabTie.drawTie([
        newNote({ positions: [{str:4, fret:4}], duration: "h"}),
        newNote({ positions: [{str:4, fret:6}], duration: "h"})
      ], [0], options);

      ok(true, "Simple Test");
    },

    tap: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      VF.Test.TabTie.drawTie([
        newNote({ positions: [{str:4, fret:12}], duration: "h"}).
          addModifier(new VF.Annotation("T"), 0),
        newNote({ positions: [{str:4, fret:10}], duration: "h"})
      ], [0], options, "P");

      ok(true, "Tapping Test");
    },

    multiTest: function(options, factory) {
      var c = VF.Test.TabTie.setupContext(options, 440, 140);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var notes = [
        newNote({ positions: [{str:4, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:4}, {str:5, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:6}, {str:5, fret:6}], duration: "8"}),
        newNote({ positions: [{str:2, fret:14}], duration: "8"}),
        newNote({ positions: [{str:2, fret:16}], duration: "8"}),
        newNote({ positions: [{str:2, fret:14}, {str:3, fret:14}], duration: "8"}),
        newNote({ positions: [{str:2, fret:16}, {str:3, fret:16}], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      voice.draw(c.context, c.stave);

      factory({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, "Single note");

      factory({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, "Chord");

      factory({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, "Single note high-fret");

      factory({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, "Chord high-fret");
    },

    simpleHammeron: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabTie.multiTest(options, VF.TabTie.createHammeron);
    },

    simplePulloff: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabTie.multiTest(options, VF.TabTie.createPulloff);
    },

    continuous: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.TabTie.setupContext(options, 440, 140);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var notes = [
        newNote({ positions: [{str:4, fret:4}], duration: "q"}),
        newNote({ positions: [{str:4, fret:5}], duration: "q"}),
        newNote({ positions: [{str:4, fret:6}], duration: "h"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      voice.draw(c.context, c.stave);

      VF.TabTie.createHammeron({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      VF.TabTie.createPulloff({
        first_note: notes[1],
        last_note: notes[2],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();
      ok(true, "Continuous Hammeron");
    }
  };

  return TabTie;
})();

/**
 * VexFlow - TextBracket Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TextBracket = (function(){
  var TextBracket = {
    Start: function() {
      QUnit.module("TextBracket");
      VF.Test.runTests("Simple TextBracket", VF.Test.TextBracket.simple0);
      VF.Test.runTests("TextBracket Styles", VF.Test.TextBracket.simple1);
    },

    simple0: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 650, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave = new VF.Stave(10, 40, 550).addTrebleGlyph();
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var octave_top = new VF.TextBracket({
        start: notes[0],
        stop: notes[3],
        text: "15",
        superscript: "va",
        position: 1
      });

      var octave_bottom = new VF.TextBracket({
        start: notes[0],
        stop: notes[3],
        text: "8",
        superscript: "vb",
        position: -1
      });

      octave_bottom.setLine(3);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);

      octave_top.setContext(ctx).draw();
      octave_bottom.setContext(ctx).draw();
    },

    simple1: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 650, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave = new VF.Stave(10, 40, 550).addTrebleGlyph();
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var octave_top0 = new VF.TextBracket({
        start: notes[0],
        stop: notes[1],
        text: "Cool notes",
        superscript: "",
        position: 1
      });

      var octave_bottom0 = new VF.TextBracket({
        start: notes[2],
        stop: notes[4],
        text: "Not cool notes",
        superscript: " super uncool",
        position: -1
      });

      octave_bottom0.render_options.bracket_height = 40;
      octave_bottom0.setLine(4);

      var octave_top1 = new VF.TextBracket({
        start: notes[2],
        stop: notes[4],
        text: "Testing",
        superscript: "superscript",
        position: 1
      });

      var octave_bottom1 = new VF.TextBracket({
        start: notes[0],
        stop: notes[1],
        text: "8",
        superscript: "vb",
        position: -1
      });

      octave_top1.render_options.line_width = 2;
      octave_top1.render_options.show_bracket = false;
      octave_bottom1.setDashed(true, [2, 2]);
      octave_top1.setFont({
        weight: "",
        family: "Arial",
        size: 15
      });

      octave_bottom1.font.size = 30;
      octave_bottom1.setDashed(false);
      octave_bottom1.render_options.underline_superscript = false;

      octave_bottom1.setLine(3);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);

      octave_top0.setContext(ctx).draw();
      octave_bottom0.setContext(ctx).draw();

      octave_top1.setContext(ctx).draw();
      octave_bottom1.setContext(ctx).draw();
    }
  };

  return TextBracket;
})();
/**
 * VexFlow - Text Note Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TextNote = (function() {
  var TextNote = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module("TextNote");
      runTests("TextNote Formatting", TextNote.formatTextNotes);
      runTests("TextNote Superscript and Subscript", TextNote.superscriptAndSubscript);
      runTests("TextNote Formatting With Glyphs 0", TextNote.formatTextGlyphs0);
      runTests("TextNote Formatting With Glyphs 1", TextNote.formatTextGlyphs1);
      runTests("Crescendo", TextNote.crescendo);
      runTests("Text Dynamics", TextNote.textDynamics);
    },

    renderNotes: function(notes1, notes2, ctx, stave, justify) {
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      notes1.forEach(function(note) {note.setContext(ctx)});
      notes2.forEach(function(note) {note.setContext(ctx)});

      voice1.addTickables(notes1);
      voice2.addTickables(notes2);

      new VF.Formatter().joinVoices([voice1, voice2]).
        formatToStave([voice1, voice2], stave);

      voice1.draw(ctx, stave);
      voice2.draw(ctx, stave);
    },

    formatTextNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 150);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 400);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new VF.TextNote(text_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newTextNote({text: "Center Justification",  duration: "h"}).
          setJustification(VF.TextNote.Justification.CENTER),
        newTextNote({text: "Left Line 1", duration: "q"}).setLine(1),
        newTextNote({text: "Right", duration: "q"}).
          setJustification(VF.TextNote.Justification.RIGHT),
      ];

      VF.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    superscriptAndSubscript: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 500);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new VF.TextNote(text_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newTextNote({text: VF.unicode["flat"] + "I", superscript: "+5",  duration: "8"}),
        newTextNote({text: "D" + VF.unicode["sharp"] +"/F",  duration: "4d", superscript: "sus2"}),
        newTextNote({text: "ii", superscript: "6", subscript: "4",  duration: "8"}),
        newTextNote({text: "C" , superscript: VF.unicode["triangle"] + "7", subscript: "", duration: "8"}),
        newTextNote({text: "vii", superscript: VF.unicode["o-with-slash"] + "7", duration: "8"}),
        newTextNote({text: "V",superscript: "7",   duration: "8"}),
      ];

      notes2.forEach(function(note) {
        note.setLine(13);
        note.font = {
          family: "Serif",
          size: 15,
          weight: ""
        };
        note.setJustification(VF.TextNote.Justification.LEFT);
      });

      VF.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    formatTextGlyphs0: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 20, 600);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new VF.TextNote(text_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"})
      ];

      var notes2 = [
        newTextNote({text: "Center",  duration: "8"}).
          setJustification(VF.TextNote.Justification.CENTER),
        newTextNote({glyph: "f", duration: "8"}),
        newTextNote({glyph: "p", duration: "8"}),
        newTextNote({glyph: "m", duration: "8"}),
        newTextNote({glyph: "z", duration: "8"}),

        newTextNote({glyph: "mordent_upper", duration: "16"}),
        newTextNote({glyph: "mordent_lower", duration: "16"}),
        newTextNote({glyph: "segno", duration: "8"}),
        newTextNote({glyph: "coda", duration: "8"}),
      ];

      VF.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    formatTextGlyphs1: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 20, 600);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new VF.TextNote(text_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"})
      ];

      var notes2 = [
        newTextNote({glyph: "turn",  duration: "16"}),
        newTextNote({glyph: "turn_inverted",  duration: "16"}),
        newTextNote({glyph: "pedal_open", duration: "8"}).setLine(10),
        newTextNote({glyph: "pedal_close", duration: "8"}).setLine(10),
        newTextNote({glyph: "caesura_curved", duration: "8"}).setLine(3),
        newTextNote({glyph: "caesura_straight", duration: "8"}).setLine(3),
        newTextNote({glyph: "breath", duration: "8"}).setLine(2),
        newTextNote({glyph: "tick", duration: "8"}).setLine(3),
      newTextNote({glyph: "tr", duration: "8", smooth: true}).
          setJustification(VF.TextNote.Justification.CENTER),
      ];

      VF.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    crescendo: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 20, 500);
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        new VF.TextNote({glyph: "p", duration: "16"}).setContext(ctx),
        new VF.Crescendo({duration: "4d"}).setLine(0).setHeight(25),
        new VF.TextNote({glyph: "f", duration: "16"}).setContext(ctx),
        new VF.Crescendo({duration: "4"}).setLine(5),
        new VF.Crescendo({duration: "4"}).setLine(10).setDecrescendo(true).setHeight(5)
      ];

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().formatToStave([voice], stave);

      notes.forEach(function(note) {
        note.setStave(stave);
        note.setContext(ctx).draw();
      });

      ok(true);
    },

    textDynamics: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 20, 550);
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        new VF.TextDynamics({ text: "sfz", duration: "4" }),
        new VF.TextDynamics({ text: "rfz", duration: "4" }),
        new VF.TextDynamics({ text: "mp", duration: "4" }),
        new VF.TextDynamics({ text: "ppp", duration: "4" }),
        new VF.TextDynamics({ text: "fff", duration: "4" }),
        new VF.TextDynamics({ text: "mf", duration: "4" }),
        new VF.TextDynamics({ text: "sff", duration: "4" })
      ];

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().formatToStave([voice], stave);

      notes.forEach(function(note) {
        note.setStave(stave);
        note.setContext(ctx).draw();
      });

      ok(true);
    }
  }

  return TextNote;
})();
/**
 * VexFlow - Three Voices in single staff tests.
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ThreeVoices = (function() {
  var ThreeVoices = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Three Voice Rests");
      runTests("Three Voices - #1", ThreeVoices.threevoices);
      runTests("Three Voices - #2 Complex", ThreeVoices.threevoices2);
      runTests("Three Voices - #3", ThreeVoices.threevoices3);
      runTests("Auto Adjust Rest Positions - Two Voices", ThreeVoices.autoresttwovoices);
      runTests("Auto Adjust Rest Positions - Three Voices #1", ThreeVoices.autorestthreevoices);
      runTests("Auto Adjust Rest Positions - Three Voices #2", ThreeVoices.autorestthreevoices2);
    },

    setupContext: function(options, x, y) {
      VF.Test.resizeCanvas(options.canvas_sel, x || 350, y || 150);
      var ctx = Vex.getCanvasContext(options.canvas_sel);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, x || 350).addTrebleGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    threevoices: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }

      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.draw();

      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.addTimeSignature("4/4");
      stave.draw();

      var notes = [
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "h"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "h"}),
      ];
      notes[0].
        addModifier(0, newFinger("0", VF.Modifier.Position.LEFT));

      var notes1 = [
        newNote({ keys: ["d/4", "a/4", "d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4", "a/4", "c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4", "a/4", "c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4", "a/4", "c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
      ];
      notes1[0].addAccidental(2, new VF.Accidental("#")).
                addModifier(0, newFinger("0", VF.Modifier.Position.LEFT)).
                addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
                addModifier(2, newFinger("4", VF.Modifier.Position.RIGHT));

      var notes2 = [
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "q"}),

        newNote({ keys: ["f/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["a/3"], stem_direction: -1, duration: "q"}),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice1.addTickables(notes1);
      voice2.addTickables(notes2);
      var beam = VF.Beam.applyAndGetBeams(voice, 1);
      var beam1 = VF.Beam.applyAndGetBeams(voice1, -1);
      var beam2 = VF.Beam.applyAndGetBeams(voice2, -1);

      // Set option to position rests near the notes in each voice
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2]).
        format([voice, voice1, voice2], 400);

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      for (var i = 0; i < beam.length; i++)
        beam[i].setContext(c).draw();
      for (var i = 0; i < beam1.length; i++)
        beam1[i].setContext(c).draw();
      for (var i = 0; i < beam2.length; i++)
        beam2[i].setContext(c).draw();

      ok(true, "Three Voices - Test #1");
    },

    threevoices2: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }

      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.draw();

      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.addTimeSignature("4/4");
      stave.draw();

      var notes = [
        newNote({ keys: ["a/4", "e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["e/5"], stem_direction: 1, duration: "h"}),
      ];
      notes[0].
        addModifier(0, newFinger("2", VF.Modifier.Position.LEFT)).
        addModifier(1, newFinger("0", VF.Modifier.Position.ABOVE));
    //    addModifier(1, newFinger("0", VF.Modifier.Position.LEFT).
    //    setOffsetY(-6));

      var notes1 = [
        newNote({ keys: ["d/4", "d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["b/4", "c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/4", "a/4", "c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4", "a/4", "c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4", "a/4", "c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
      ];
      notes1[0].addAccidental(1, new VF.Accidental("#")).
                addModifier(0, newFinger("0", VF.Modifier.Position.LEFT)).
                addModifier(1, newFinger("4", VF.Modifier.Position.LEFT));

      var notes2 = [
        newNote({ keys: ["b/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "q"}),

        newNote({ keys: ["f/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["a/3"], stem_direction: -1, duration: "q"}),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice1.addTickables(notes1);
      voice2.addTickables(notes2);
      var beam = VF.Beam.applyAndGetBeams(voice, 1);
      var beam1 = VF.Beam.applyAndGetBeams(voice1, -1);
      var beam2 = VF.Beam.applyAndGetBeams(voice2, -1);

      // Set option to position rests near the notes in each voice
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2]).
        format([voice, voice1, voice2], 400);

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      for (var i = 0; i < beam.length; i++)
        beam[i].setContext(c).draw();
      for (var i = 0; i < beam1.length; i++)
        beam1[i].setContext(c).draw();
      for (var i = 0; i < beam2.length; i++)
        beam2[i].setContext(c).draw();

      ok(true, "Three Voices - Test #2 Complex");
    },

    threevoices3: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }

      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.draw();

      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.addTimeSignature("4/4");
      stave.draw();

      var notes = [
        newNote({ keys: ["g/4", "e/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["g/4", "e/5"], stem_direction: 1, duration: "h"}),
      ];
      notes[0].addModifier(0, newFinger("0", VF.Modifier.Position.LEFT)).
               addModifier(1, newFinger("0", VF.Modifier.Position.LEFT));

      var notes1 = [
        newNote({ keys: ["c/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),

        newNote({ keys: ["a/4"], stem_direction: -1, duration: "qd"}).addDotToAll(),
        newNote({ keys: ["g/4"], stem_direction: -1, duration: "8"}),
      ];
      notes1[0].addAccidental(0, new VF.Accidental("#")).
                addModifier(0, newFinger("1", VF.Modifier.Position.LEFT));

      var notes2 = [
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["b/3"], stem_direction: -1, duration: "q"}),

        newNote({ keys: ["a/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"}),
      ];
      notes2[0].addModifier(0, newFinger("3", VF.Modifier.Position.LEFT));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice1.addTickables(notes1);
      voice2.addTickables(notes2);
      var beam = VF.Beam.applyAndGetBeams(voice, 1);
      var beam1 = VF.Beam.applyAndGetBeams(voice1, -1);
      var beam2 = VF.Beam.applyAndGetBeams(voice2, -1);

      // Set option to position rests near the notes in each voice
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2]).
        format([voice, voice1, voice2], 400);

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      for (var i = 0; i < beam.length; i++)
        beam[i].setContext(c).draw();
      for (var i = 0; i < beam1.length; i++)
        beam1[i].setContext(c).draw();
      for (var i = 0; i < beam2.length; i++)
        beam2[i].setContext(c).draw();

      ok(true, "Three Voices - Test #3");
    },

    autoresttwovoices: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 900, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }

      function getNotes(text) {
        var notes = [
          newNote({ keys: ["b/4"], duration: "8r"}),
          newNote({ keys: ["e/5"], duration: "16"}),
          newNote({ keys: ["b/4"], duration: "16r"}),

          newNote({ keys: ["b/4"], duration: "8r"}),
          newNote({ keys: ["e/5"], duration: "16"}),
          newNote({ keys: ["b/4"], duration: "16r"}),

          newNote({ keys: ["b/4"], duration: "8r"}),
          newNote({ keys: ["d/5"], duration: "16"}),
          newNote({ keys: ["b/4"], duration: "16r"}),

          newNote({ keys: ["e/5"], duration: "q"}),
        ];

        var notes1 = [
          newNote({ keys: ["c/5"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),

          newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["g/4"], stem_direction: -1, duration: "16"}),

          newNote({ keys: ["g/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
          newNote({ keys: ["b/4"], stem_direction: 1, duration: "16r"}),
          newNote({ keys: ["b/4"], stem_direction: 1, duration: "16"}),

          newNote({ keys: ["e/4"], duration: "q"}),
        ];

        var textnote = [
           new VF.TextNote({text: text, line: -1, duration: "w", smooth: true}),
        ];

        return {notes: notes, notes1: notes1, textnote: textnote};

      }

      var stave = new VF.Stave(50, 20, 400);
      stave.setContext(c);
      stave.draw();

      var n = getNotes("Default Rest Positions");
      n.textnote[0].setContext(c);
      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(n.notes);
      voice1.addTickables(n.notes1);
      voice2.addTickables(n.textnote);

      var beam = VF.Beam.applyAndGetBeams(voice, 1);
      var beam1 = VF.Beam.applyAndGetBeams(voice1, -1);

      // Set option to position rests near the notes in each voice
      Vex.Debug = false;
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2]).
        format([voice, voice1, voice2], 350, {align_rests: false});

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      for (var i = 0; i < beam.length; i++)
        beam[i].setContext(c).draw();
      for (var i = 0; i < beam1.length; i++)
        beam1[i].setContext(c).draw();

      // Draw After rest adjustment
      var stave = new VF.Stave(stave.width + stave.x, stave.y, 400);
      stave.setContext(c);
      stave.draw();

      n = getNotes("Rests Repositioned To Avoid Collisions");
      n.textnote[0].setContext(c);
      voice = new VF.Voice(VF.Test.TIME4_4);
      voice1 = new VF.Voice(VF.Test.TIME4_4);
      voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(n.notes);
      voice1.addTickables(n.notes1);
      voice2.addTickables(n.textnote);
      beam = VF.Beam.applyAndGetBeams(voice, 1);
      beam1 = VF.Beam.applyAndGetBeams(voice1, -1);

      // Set option to position rests near the notes in each voice
      Vex.Debug = true;
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2]).
        format([voice, voice1, voice2], 350, {align_rests: true});

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      for (var i = 0; i < beam.length; i++)
        beam[i].setContext(c).draw();
      for (var i = 0; i < beam1.length; i++)
        beam1[i].setContext(c).draw()
        ;
      ok(true, "Auto Adjust Rests - Two Voices");
    },

    autorestthreevoices: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 850, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function getNotes(text) {

        var notes = [
          newNote({ keys: ["b/4"], duration: "qr"}),
          newNote({ keys: ["e/5"], duration: "q"}),
          newNote({ keys: ["e/5"], duration: "qr"}),
          newNote({ keys: ["e/5"], duration: "qr"}),
          newNote({ keys: ["e/5"], duration: "q"}),
          newNote({ keys: ["e/5"], duration: "q"}),
          newNote({ keys: ["e/5"], duration: "q"}),
          newNote({ keys: ["e/5"], duration: "qr"}),
        ];

        var notes1 = [
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "q"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "q"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "q"}),
        ];

        var notes2 = [
          newNote({ keys: ["e/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["e/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["g/4"], stem_direction: -1, duration: "q"}),
          newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
          newNote({ keys: ["e/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
        ];

        var textnote = [
           new VF.TextNote({text: text, duration: "w", line: -1, smooth: true}),
           new VF.TextNote({text: "", duration: "w", line: -1, smooth: true}),
        ];

        return {notes: notes, notes1: notes1, notes2: notes2, textnote: textnote};

      }

      var stave = new VF.Stave(50, 20, 400).addTrebleGlyph();
      stave.setContext(c);
      stave.draw();

      var n = getNotes("Default Rest Positions");
      n.textnote[0].setContext(c);
      n.textnote[1].setContext(c);
      var voice = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      var voice1 = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      var voice2 = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      var voice3 = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      voice.addTickables(n.notes);
      voice1.addTickables(n.notes1);
      voice2.addTickables(n.notes2);
      voice3.addTickables(n.textnote);

      // Set option to position rests near the notes in each voice
      Vex.Debug = false;
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2, voice3]).
        format([voice, voice1, voice2, voice3], 350, {align_rests: false});

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      voice3.draw(c, stave);

      var stave2 = new VF.Stave(stave.width + stave.x, stave.y, 350);
      stave2.setContext(c);
      stave2.draw();

      n = getNotes("Rests Repositioned To Avoid Collisions");
      n.textnote[0].setContext(c);
      n.textnote[1].setContext(c);
      voice = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      voice1 = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      voice2 = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      voice3 = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      voice.addTickables(n.notes);
      voice1.addTickables(n.notes1);
      voice2.addTickables(n.notes2);
      voice3.addTickables(n.textnote);

      // Set option to position rests near the notes in each voice
      Vex.Debug = true;
      var formatter2 = new VF.Formatter().
        joinVoices([voice, voice1, voice2, voice3]).
        format([voice, voice1, voice2, voice3], 350, {align_rests: true});

      voice.draw(c, stave2);
      voice1.draw(c, stave2);
      voice2.draw(c, stave2);
      voice3.draw(c, stave2);

      ok(true, "Auto Adjust Rests - three Voices #1");
    },

    autorestthreevoices2: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 950, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function getNotes(text) {

        var notes = [
          newNote({ keys: ["b/4"], duration: "16r"}),
          newNote({ keys: ["e/5"], duration: "16"}),
          newNote({ keys: ["e/5"], duration: "16r"}),
          newNote({ keys: ["e/5"], duration: "16r"}),
          newNote({ keys: ["e/5"], duration: "16"}),
          newNote({ keys: ["e/5"], duration: "16"}),
          newNote({ keys: ["e/5"], duration: "16"}),
          newNote({ keys: ["e/5"], duration: "16r"}),
        ];

        var notes1 = [
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16"}),
        ];

        var notes2 = [
          newNote({ keys: ["e/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["e/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["g/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["e/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        ];

        var textnote = [
           new VF.TextNote({text: text, duration: "h", line: -1, smooth: true}),
        ];

        return {notes: notes, notes1: notes1, notes2: notes2, textnote: textnote};

      }

      var stave = new VF.Stave(50, 20, 450).addTrebleGlyph();
      stave.setContext(c);
      stave.draw();

      var n = getNotes("Default Rest Positions");
      n.textnote[0].setContext(c);
      var voice = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      var voice1 = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      var voice2 = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      var voice3 = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      voice.addTickables(n.notes);
      voice1.addTickables(n.notes1);
      voice2.addTickables(n.notes2);
      voice3.addTickables(n.textnote);

      // Set option to position rests near the notes in each voice
      Vex.Debug = false;
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2, voice3]).
        format([voice, voice1, voice2, voice3], 400, {align_rests: false});

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      voice3.draw(c, stave);

      var stave2 = new VF.Stave(stave.width + stave.x, stave.y, 425);
      stave2.setContext(c);
      stave2.draw();

      n = getNotes("Rests Repositioned To Avoid Collisions");
      n.textnote[0].setContext(c);
      voice = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      voice1 = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      voice2 = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      voice3 = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      voice.addTickables(n.notes);
      voice1.addTickables(n.notes1);
      voice2.addTickables(n.notes2);
      voice3.addTickables(n.textnote);

      // Set option to position rests near the notes in each voice
      Vex.Debug = true;
      var formatter2 = new VF.Formatter().
        joinVoices([voice, voice1, voice2, voice3]).
        format([voice, voice1, voice2, voice3], 400, {align_rests: true});

      voice.draw(c, stave2);
      voice1.draw(c, stave2);
      voice2.draw(c, stave2);
      voice3.draw(c, stave2);

      ok(true, "Auto Adjust Rests - three Voices #2");
    }
  };

  return ThreeVoices;
})();
/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TickContext = (function() {
  var TickContext = {
    Start: function() {
      QUnit.module("TickContext");
      test("Current Tick Test", VF.Test.TickContext.currentTick);
      test("Tracking Test", VF.Test.TickContext.tracking);
    },

    currentTick: function() {
      var tc = new VF.TickContext();
      equal(tc.getCurrentTick().value(), 0, "New tick context has no ticks");
    },

    tracking: function() {
      function createTickable() {
        return new VF.Test.MockTickable(VF.Test.TIME4_4);
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables = [
        createTickable().setTicks(BEAT).setWidth(10),
        createTickable().setTicks(BEAT * 2).setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30)
      ];

      var tc = new VF.TickContext();
      tc.setPadding(0);

      tc.addTickable(tickables[0]);
      equal(tc.getMaxTicks().value(), BEAT);

      tc.addTickable(tickables[1]);
      equal(tc.getMaxTicks().value(), BEAT * 2);

      tc.addTickable(tickables[2]);
      equal(tc.getMaxTicks().value(), BEAT * 2);

      equal(tc.getWidth(), 0);
      tc.preFormat();
      equal(tc.getWidth(), 30);
    }
  };

  return TickContext;
})();
/**
 * VexFlow - TimeSignature Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TimeSignature = (function() {
  function catchError(ts, spec) {
    try {
      ts.parseTimeSpec(spec);
    } catch (e) {
      equal(e.code, "BadTimeSignature", e.message);
    }
  }

  var TimeSignature = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("TimeSignature");
      test("Time Signature Parser", VF.Test.TimeSignature.parser);
      runTests("Basic Time Signatures", TimeSignature.basic);
      runTests("Big Signature Test", TimeSignature.big);
      runTests("Time Signature multiple staves alignment test", TimeSignature.multiStave);
      runTests("Time Signature Change Test", TimeSignature.timeSigNote);
    },

    parser: function() {
      expect(6);
      var ts = new VF.TimeSignature();

      // Invalid time signatures
      catchError(ts, "asdf");
      catchError(ts, "123/");
      catchError(ts, "/10");
      catchError(ts, "/");
      catchError(ts, "4567");
      catchError(ts, "C+");

      ts.parseTimeSpec("4/4");
      ts.parseTimeSpec("10/12");
      ts.parseTimeSpec("1/8");
      ts.parseTimeSpec("1234567890/1234567890");
      ts.parseTimeSpec("C");
      ts.parseTimeSpec("C|");

      ok(true, "all pass");
    },

    basic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 120);
      var stave = new VF.Stave(10, 10, 500);

      stave.addTimeSignature("2/2");
      stave.addTimeSignature("3/4");
      stave.addTimeSignature("4/4");
      stave.addTimeSignature("6/8");
      stave.addTimeSignature("C");
      stave.addTimeSignature("C|");

      stave.addEndTimeSignature("2/2");
      stave.addEndTimeSignature("3/4");
      stave.addEndTimeSignature("4/4");
      stave.addEndClef("treble");
      stave.addEndTimeSignature("6/8");
      stave.addEndTimeSignature("C");
      stave.addEndTimeSignature("C|");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    big: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);

      stave.addTimeSignature("12/8");
      stave.addTimeSignature("7/16");
      stave.addTimeSignature("1234567/890");
      stave.addTimeSignature("987/654321");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    multiStave: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 350);

      var stave = new VF.Stave(15, 0, 300);

      for (var i = 0; i < 5; i++) {
          if (i == 2) continue;
          stave.setConfigForLine(i, {visible: false} );
      }

      stave.addClef("percussion");
      // passing the custom padding as second parameter (in pixels)
      stave.addTimeSignature("4/4", 25);
      stave.setContext(ctx).draw();

      var stave2 = new VF.Stave(15, 110, 300);
      stave2.addClef("treble");
      stave2.addTimeSignature("4/4");
      stave2.setContext(ctx).draw();

      var connector = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx).draw();

      var stave3 = new VF.Stave(15, 220, 300);
      stave3.addClef("bass");
      stave3.addTimeSignature("4/4");
      stave3.setContext(ctx).draw();

      var connector2 = new VF.StaveConnector(stave2, stave3);
      connector2.setType(VF.StaveConnector.type.SINGLE);
      connector2.setContext(ctx).draw();

      var connector3 = new VF.StaveConnector(stave2, stave3);
      connector3.setType(VF.StaveConnector.type.BRACE);
      connector3.setContext(ctx).draw();

        ok(true, "all pass");
    },

    timeSigNote: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 900, 120);
      var stave = new VF.Stave(10, 10, 800);
      stave.addClef("treble").addTimeSignature("C|").setContext(ctx).draw();

      var notes = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble" }),
        new VF.TimeSigNote("3/4"),
        new VF.StaveNote({ keys: ["d/4"], duration: "q", clef: "alto" }),
        new VF.StaveNote({ keys: ["b/3"], duration: "qr", clef: "alto" }),
        new VF.TimeSigNote("C"),
        new VF.StaveNote({ keys: ["c/3", "e/3", "g/3"], duration: "q", clef: "bass" }),
        new VF.TimeSigNote("9/8"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble" })
      ];

      var voice = new VF.Voice({
        num_beats: 4,
        beat_value: 4,
        resolution: VF.RESOLUTION
      });
      voice.setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().
        joinVoices([voice]).format([voice], 800);

      voice.draw(ctx, stave);
      ok(true, "all pass");
    }
  };

  return TimeSignature;
})();
/**
 * VexFlow - Tuning Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Tuning = (function() {
  var Tuning = {
    Start: function() {
      QUnit.module("Tuning");
      test("Standard Tuning", VF.Test.Tuning.standard);
      test("Standard Banjo Tuning", VF.Test.Tuning.banjo);
      test("Return note for fret", VF.Test.Tuning.noteForFret);
    },

    checkStandard: function(tuning) {
      try {
        tuning.getValueForString(0);
      } catch (e) {
        equal(e.code, "BadArguments", "String 0");
      }

      try {
        tuning.getValueForString(9);
      } catch (e) {
        equal(e.code, "BadArguments", "String 7");
      }

      equal(tuning.getValueForString(6), 40, "Low E string");
      equal(tuning.getValueForString(5), 45, "A string");
      equal(tuning.getValueForString(4), 50, "D string");
      equal(tuning.getValueForString(3), 55, "G string");
      equal(tuning.getValueForString(2), 59, "B string");
      equal(tuning.getValueForString(1), 64, "High E string");
    },

    checkStandardBanjo: function(tuning) {
      try {
        tuning.getValueForString(0);
      } catch (e) {
        equal(e.code, "BadArguments", "String 0");
      }

      try {
        tuning.getValueForString(6);
      } catch (e) {
        equal(e.code, "BadArguments", "String 6");
      }

      equal(tuning.getValueForString(5), 67, "High G string");
      equal(tuning.getValueForString(4), 50, "D string");
      equal(tuning.getValueForString(3), 55, "G string");
      equal(tuning.getValueForString(2), 59, "B string");
      equal(tuning.getValueForString(1), 62, "High D string");
    },

    banjo: function() {
      expect(7);

      var tuning = new VF.Tuning();
      tuning.setTuning("standardBanjo");
      VF.Test.Tuning.checkStandardBanjo(tuning);
    },

    standard: function() {
      expect(16);

      var tuning = new VF.Tuning();
      VF.Test.Tuning.checkStandard(tuning);

      // Test named tuning
      tuning.setTuning("standard");
      VF.Test.Tuning.checkStandard(tuning);
    },

    noteForFret: function() {
      expect(8);
      var tuning = new VF.Tuning("E/5,B/4,G/4,D/4,A/3,E/3");
      try {
        tuning.getNoteForFret(-1, 1);
      } catch(e) {
        equal(e.code, "BadArguments", "Fret -1");
      }

      try {
        tuning.getNoteForFret(1, -1);
      } catch(e) {
        equal(e.code, "BadArguments", "String -1");
      }

      equal(tuning.getNoteForFret(0, 1), "E/5", "High E string");
      equal(tuning.getNoteForFret(5, 1), "A/5", "High E string, fret 5");
      equal(tuning.getNoteForFret(0, 2), "B/4", "B string");
      equal(tuning.getNoteForFret(0, 3), "G/4", "G string");
      equal(tuning.getNoteForFret(12, 2), "B/5", "B string, fret 12");
      equal(tuning.getNoteForFret(0, 6), "E/3", "Low E string");
    }
  };

  return Tuning;
})();
/**
 * VexFlow - Tuplet Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Tuplet = (function() {
  var Tuplet = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Tuplet");
      runTests("Simple Tuplet", Tuplet.simple);
      runTests("Beamed Tuplet", Tuplet.beamed);
      runTests("Ratioed Tuplet", Tuplet.ratio);
      runTests("Bottom Tuplet", Tuplet.bottom);
      runTests("Bottom Ratioed Tuplet", Tuplet.bottom_ratio);
      runTests("Awkward Tuplet", Tuplet.awkward);
      runTests("Complex Tuplet", Tuplet.complex);
      runTests("Mixed Stem Direction Tuplet", Tuplet.mixedTop);
      runTests("Mixed Stem Direction Bottom Tuplet", Tuplet.mixedBottom);
    },

    setupContext: function(options, x, y) {
      var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);

      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 10, x || 350).addTrebleGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"})
      ];

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6));

      // 3/4 time
      var voice = new VF.Voice({
        num_beats: 3, beat_value: 4, resolution: VF.RESOLUTION });

      voice.setStrict(true);
      voice.addTickables(notes);

      c.stave.addTimeSignature("3/4");
      c.stave.draw(c.context);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();

      ok(true, "Simple Test");
    },

    beamed: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"})
      ];

      var beam1 = new VF.Beam(notes.slice(0, 3));
      var beam2 = new VF.Beam(notes.slice(3, 10));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 10));

      // 3/8 time
      var voice = new VF.Voice({
        num_beats: 3, beat_value: 8, resolution: VF.RESOLUTION });

      voice.setStrict(true);
      voice.addTickables(notes);
      c.stave.addTimeSignature("3/8");
      c.stave.draw(c.context);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();

      ok(true, "Beamed Test");
    },

    ratio: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"})
      ];

      var beam = new VF.Beam(notes.slice(3, 6));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6), {beats_occupied: 4});

      var voice = new VF.Voice(VF.Test.TIME4_4);

      voice.setStrict(true);
      voice.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      beam.setContext(c.context).draw();

      tuplet1.setRatioed(true).setContext(c.context).draw();
      tuplet2.setRatioed(true).setContext(c.context).draw();

      ok(true, "Ratioed Test");
    },

    bottom: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options, 350, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["g/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"})
      ];

      var beam = new VF.Beam(notes.slice(3, 6));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6));

      tuplet1.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet2.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);

      var voice = new VF.Voice({
        num_beats: 3, beat_value: 4, resolution: VF.RESOLUTION });

      voice.setStrict(true);
      voice.addTickables(notes);
      c.stave.addTimeSignature("3/4");
      c.stave.draw(c.context);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      beam.setContext(c.context).draw();

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();

      ok(true, "Bottom Test");
    },

    bottom_ratio: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options, 350, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"})
      ];

      var beam = new VF.Beam(notes.slice(3, 6));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6));

      tuplet2.setBeatsOccupied(1);
      tuplet1.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet2.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);

      var voice = new VF.Voice({
        num_beats: 5, beat_value: 8, resolution: VF.RESOLUTION });

      voice.setStrict(true);
      voice.addTickables(notes);
      c.stave.addTimeSignature("5/8");
      c.stave.draw(c.context);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      beam.setContext(c.context).draw();

      tuplet1.setRatioed(true).setContext(c.context).draw();
      tuplet2.setRatioed(true).setContext(c.context).draw();

      ok(true, "Bottom Ratioed Test");
    },

    awkward: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"})
      ];

      var beam = new VF.Beam(notes.slice(0, 11));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 11));
      var tuplet2 = new VF.Tuplet(notes.slice(11, 14));
      tuplet1.setBeatsOccupied(142);

      var voice = new VF.Voice(VF.Test.TIME4_4);

      voice.setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      beam.setContext(c.context).draw();
      tuplet1.setRatioed(true).setContext(c.context).draw();
      tuplet2.setRatioed(true).setBracketed(true).setContext(c.context).draw();

      ok(true, "Awkward Test");
    },

    complex: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Tuplet.setupContext(options, 600);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes1 = [
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8d"}).addDotToAll(),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "16r"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"})
      ];
      var notes2 = [
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "4" }),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "4" }),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "4" }),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "4" })
      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      var beam1 = new VF.Beam(notes1.slice(0, 3));
      var beam2 = new VF.Beam(notes1.slice(5, 9));
      var beam3 = new VF.Beam(notes1.slice(11, 16));

      var tuplet1 = new VF.Tuplet(notes1.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes1.slice(3, 11),
                                        {num_notes: 7, beats_occupied: 4});
      var tuplet3 = new VF.Tuplet(notes1.slice(11, 16), {beats_occupied: 4});

      voice1.setStrict(true);
      voice1.addTickables(notes1);
      voice2.setStrict(true)
      voice2.addTickables(notes2);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      var formatter = new VF.Formatter().joinVoices([voice1, voice2]).
        format([voice1, voice2], c.stave.getNoteEndX() - c.stave.getNoteStartX() - 50);

      voice1.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();

      ok(true, "Complex Test");
    },

    mixedTop: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "4"}),
        newNote({ keys: ["c/6"], stem_direction: -1, duration: "4"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "4"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "4"}),
        newNote({ keys: ["a/4"], stem_direction: -1, duration: "4"}),
        newNote({ keys: ["c/6"], stem_direction: -1, duration: "4"})
      ];

      var tuplet1 = new VF.Tuplet(notes.slice(0, 2), {beats_occupied : 3});
      var tuplet2 = new VF.Tuplet(notes.slice(2, 4), {beats_occupied : 3});
      var tuplet3 = new VF.Tuplet(notes.slice(4, 6), {beats_occupied : 3});

      var voice = new VF.Voice(VF.Test.TIME4_4);

      voice.setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();

      ok(true, "Mixed Stem Direction Tuplet");
    },

    mixedBottom: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["f/3"], stem_direction: 1, duration: "4"}),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "4"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "4"}),
        newNote({ keys: ["f/3"], stem_direction: 1, duration: "4"}),
        newNote({ keys: ["a/4"], stem_direction: -1, duration: "4"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "4"})
      ];

      var tuplet1 = new VF.Tuplet(notes.slice(0, 2), {beats_occupied : 3});
      var tuplet2 = new VF.Tuplet(notes.slice(2, 4), {beats_occupied : 3});
      var tuplet3 = new VF.Tuplet(notes.slice(4, 6), {beats_occupied : 3});

      var voice = new VF.Voice(VF.Test.TIME4_4);

      voice.setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      voice.draw(c.context, c.stave);

      tuplet1.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet2.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet3.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();

      ok(true, "Mixed Stem Direction Bottom Tuplet");
    }
  };

  return Tuplet;
})();

/**
 * VexFlow - Vibrato Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Vibrato = (function() {
  var Vibrato = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Vibrato");
      runTests("Simple Vibrato", Vibrato.simple);
      runTests("Harsh Vibrato", Vibrato.harsh);
      runTests("Vibrato with Bend", Vibrato.withBend);
    },

    simple: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 140);

      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newVibrato() { return new VF.Vibrato(); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "h" }).
          addModifier(newVibrato(), 0),
        newNote({
          positions: [{str: 2, fret: 10}], duration: "h" }).
          addModifier(newVibrato(), 0)
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      ok(true, "Simple Vibrato");
    },

    harsh: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 240);

      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newVibrato() { return new VF.Vibrato(); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "h" }).
          addModifier(newVibrato().setHarsh(true), 0),
        newNote({
          positions: [{str: 2, fret: 10}], duration: "h" }).
          addModifier(newVibrato().setHarsh(true), 0)
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      ok(true, "Harsh Vibrato");
    },

    withBend: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.3, 1.3); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      ctx.setFont("Arial", VF.Test.Font.size, "");
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text, release) { return new VF.Bend(text, release); }
      function newVibrato() { return new VF.Vibrato(); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 9}, {str: 3, fret: 9}], duration: "q" }).
          addModifier(newBend("1/2", true), 0).
          addModifier(newBend("1/2", true), 1).
          addModifier(newVibrato(), 0),
        newNote({
          positions: [{str: 2, fret: 10}], duration: "q" }).
          addModifier(newBend("Full", false), 0).
          addModifier(newVibrato().setVibratoWidth(60), 0),
        newNote({
          positions: [{str: 2, fret: 10}], duration: "h" }).
          addModifier(newVibrato().setVibratoWidth(120).setHarsh(true), 0)
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      ok(true, "Vibrato with Bend");
    }
  };

  return Vibrato;
})();
/**
 * VexFlow - Voice Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Voice = (function() {
  var Voice = {
    Start: function() {
      QUnit.module("Voice");
      test("Strict Test", VF.Test.Voice.strict);
      test("Ignore Test", VF.Test.Voice.ignore);
      VF.Test.runTests("Full Voice Mode Test", VF.Test.Voice.full);
    },

    strict: function(options) {
      expect(7);
      function createTickable() {
        return new VF.Test.MockTickable(VF.Test.TIME4_4);
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables = [
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT)
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      equal(voice.totalTicks.value(), BEAT * 4, "4/4 Voice has 4 beats");
      equal(voice.ticksUsed.value(), BEAT * 0, "No beats in voice");
      voice.addTickables(tickables);
      equal(voice.ticksUsed.value(), BEAT * 3, "Three beats in voice");
      voice.addTickable(createTickable().setTicks(BEAT));
      equal(voice.ticksUsed.value(), BEAT * 4, "Four beats in voice");
      equal(voice.isComplete(), true, "Voice is complete");

      try {
        voice.addTickable(createTickable().setTicks(BEAT));
      } catch (e) {
        equal(e.code, "BadArgument", "Too many ticks exception");
      }

      equal(voice.getSmallestTickCount().value(), BEAT, "Smallest tick count is BEAT");
    },

    ignore: function() {
      function createTickable() {
        return new VF.Test.MockTickable(VF.Test.TIME4_4);
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables = [
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT).setIgnoreTicks(true),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT).setIgnoreTicks(true),
        createTickable().setTicks(BEAT)
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(tickables);
      ok(true, "all pass");
    },

    full: function(options, contextBuilder) {
      var ctx  = contextBuilder(options.canvas_sel, 550, 200);

      var stave = new VF.Stave(10, 50, 500);
      stave.addClef("treble").addTimeSignature("4/4").
        setEndBarType(VF.Barline.type.END).setContext(ctx).draw();

      var notes = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["b/4"], duration: "qr" })
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.FULL);
      voice.addTickables(notes);

      new VF.Formatter().joinVoices([voice]).format([voice], 500);
      voice.draw(ctx, stave);
      voice.getBoundingBox().draw(ctx);

      try {
        voice.addTickable(
          new VF.StaveNote({ keys: ["c/4"], duration: "h" })
        );
      } catch (e) {
        equal(e.code, "BadArgument", "Too many ticks exception");
      }
    }
  };

  return Voice;
})();
VF.Test.run = function () {
  // Setup the measureTextCache with pre-collected data.
  VF.SVGContext.measureTextCache = VF.Test.measureTextCache;

  VF.Test.Accidental.Start();
  VF.Test.StaveNote.Start();
  VF.Test.Voice.Start();
  VF.Test.NoteHead.Start();
  VF.Test.TabNote.Start();
  VF.Test.TickContext.Start();
  VF.Test.ModifierContext.Start();
  VF.Test.Dot.Start();
  VF.Test.Bend.Start();
  VF.Test.Formatter.Start();
  VF.Test.Clef.Start();
  VF.Test.KeySignature.Start();
  VF.Test.TimeSignature.Start();
  VF.Test.StaveTie.Start();
  VF.Test.TabTie.Start();
  VF.Test.Stave.Start();
  VF.Test.TabStave.Start();
  VF.Test.TabSlide.Start();
  VF.Test.Beam.Start();
  VF.Test.AutoBeamFormatting.Start();
  VF.Test.GraceNote.Start();
  VF.Test.Vibrato.Start();
  VF.Test.Annotation.Start();
  VF.Test.Tuning.Start();
  VF.Test.Music.Start();
  VF.Test.KeyManager.Start();
  VF.Test.Articulation.Start();
  VF.Test.StaveConnector.Start();
  VF.Test.Percussion.Start();
  VF.Test.ClefKeySignature.Start();
  VF.Test.StaveHairpin.Start();
  VF.Test.Rhythm.Start();
  VF.Test.Tuplet.Start();
  VF.Test.BoundingBox.Start();
  VF.Test.Strokes.Start();
  VF.Test.StringNumber.Start();
  VF.Test.Rests.Start();
  VF.Test.ThreeVoices.Start();
  VF.Test.Curve.Start();
  VF.Test.TextNote.Start();
  VF.Test.StaveLine.Start();
  VF.Test.Ornament.Start();
  VF.Test.PedalMarking.Start();
  VF.Test.TextBracket.Start();
  VF.Test.StaveModifier.Start();
}

module.exports = VF.Test;
//# sourceMappingURL=vexflow-tests.js.map