/**
 * VexFlow Test Support Library
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test = {}

// Test Options:
Vex.Flow.Test.RUN_CANVAS_TESTS = true;
Vex.Flow.Test.RUN_SVG_TESTS = true;
Vex.Flow.Test.RUN_RAPHAEL_TESTS = false;

Vex.Flow.Test.Font = {size: 10}

Vex.Flow.Test.genID = function() {
  return Vex.Flow.Test.genID.ID++;
}
Vex.Flow.Test.genID.ID = 0;

Vex.Flow.setupCanvasArray = function () { return ""; }

Vex.Flow.Test.createTestCanvas = function(canvas_sel_name, test_name) {
  var sel = Vex.Flow.Test.createTestCanvas.sel;
  var test_div = $('<div></div>').addClass("testcanvas");
  test_div.append($('<div></div>').addClass("name").text(test_name));
  test_div.append($('<canvas></canvas>').addClass("vex-tabdiv").
      attr("id", canvas_sel_name).
      addClass("name").text(name));
  $(sel).append(test_div);
}
Vex.Flow.Test.createTestCanvas.sel = "#vexflow_testoutput";

Vex.Flow.Test.createTestSVGorRaphael = function(canvas_sel_name, test_name) {
  var sel = Vex.Flow.Test.createTestCanvas.sel;
  var test_div = $('<div></div>').addClass("testcanvas");
  test_div.append($('<div></div>').addClass("name").text(test_name));
  test_div.append($('<div></div>').addClass("vex-tabdiv").
      attr("id", canvas_sel_name));
  $(sel).append(test_div);
}

Vex.Flow.Test.resizeCanvas = function(sel, width, height) {
  $("#" + sel).width(width);
  $("#" + sel).attr("width", width);
  $("#" + sel).attr("height", height);
}

Vex.Flow.Test.runTests = function(name, func, params) {
  if(Vex.Flow.Test.RUN_CANVAS_TESTS) {
    Vex.Flow.Test.runCanvasTest(name, func, params);
  }
  if(Vex.Flow.Test.RUN_SVG_TESTS) {
    Vex.Flow.Test.runSVGTest(name, func, params);
  }
  if(Vex.Flow.Test.RUN_RAPHAEL_TESTS) {
    Vex.Flow.Test.runRaphaelTest(name, func, params);
  }
}

Vex.Flow.Test.runCanvasTest = function(name, func, params) {
  test(name, function() {
      test_canvas_sel = "canvas_" + Vex.Flow.Test.genID();
      test_canvas = Vex.Flow.Test.createTestCanvas(test_canvas_sel, name + " (Canvas)");
      func({ canvas_sel: test_canvas_sel, params: params },
        Vex.Flow.Renderer.getCanvasContext);
    });
}

Vex.Flow.Test.runRaphaelTest = function(name, func, params) {
  test(name, function() {
      test_canvas_sel = "canvas_" + Vex.Flow.Test.genID();
      test_canvas = Vex.Flow.Test.createTestSVGorRaphael(test_canvas_sel, name + " (Raphael)");
      func({ canvas_sel: test_canvas_sel, params: params },
        Vex.Flow.Renderer.getRaphaelContext);
    });
}

Vex.Flow.Test.runSVGTest = function(name, func, params) {
  test(name, function() {
      test_canvas_sel = "canvas_" + Vex.Flow.Test.genID();
      test_canvas = Vex.Flow.Test.createTestSVGorRaphael(test_canvas_sel, name + " (SVG)");
      func({ canvas_sel: test_canvas_sel, params: params },
        Vex.Flow.Renderer.getSVGContext);
    });
}

Vex.Flow.Test.plotNoteWidth = function(ctx, note, yPos) {
  var metrics = note.getMetrics();
  var w = metrics.width;
  var xStart = note.getAbsoluteX() - metrics.modLeftPx - metrics.extraLeftPx;
  var xPre1 = note.getAbsoluteX() - metrics.modLeftPx;
  var xAbs = note.getAbsoluteX();
  var xPost1 = note.getAbsoluteX() + metrics.noteWidth;
  var xPost2 = note.getAbsoluteX() + metrics.noteWidth + metrics.modRightPx;
  var xEnd = note.getAbsoluteX() + metrics.noteWidth + metrics.modRightPx + metrics.extraRightPx;

  var xWidth = xEnd - xStart;
  ctx.save();
  ctx.setFont("Arial", 10, "");
  ctx.fillText("w: " + xWidth, xStart, yPos / 1.5);

  var y = (yPos + 10) / 1.5;
  function stroke(x1, x2, color) {
    ctx.beginPath();
    ctx.setStrokeStyle(color)
    ctx.setFillStyle(color)
    ctx.setLineWidth(3);
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }

  stroke(xStart, xPre1, "black");
  stroke(xPre1, xAbs, "red");
  stroke(xAbs, xPost1, "green");
  stroke(xPost1, xPost2, "red");
  stroke(xPost2, xEnd, "black");

  Vex.drawDot(ctx, xAbs, y, "blue");

  ctx.restore();
}

