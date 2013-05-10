/**
 * VexFlow Test Support Library
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test = {}

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
  var canvas = $('<canvas></canvas>').addClass("vex-tabdiv")[0];
  // $('canvas').attr('id', id) doesn't work in Node.js for some reason,
  // so do it manually. Also set a generous width and height in case
  // the test doesn't do so manually.
  canvas.id = canvas_sel_name;
  canvas.width = 640;
  canvas.height = 480;
  test_div.append(canvas);
  $(sel).append(test_div);
}
Vex.Flow.Test.createTestCanvas.sel = "#vexflow_testoutput";

Vex.Flow.Test.createTestRaphael = function(canvas_sel_name, test_name) {
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

Vex.Flow.Test.runTest = function(name, func, params) {
  test(name, function() {
      test_canvas_sel = "canvas_" + Vex.Flow.Test.genID();
      test_canvas = Vex.Flow.Test.createTestCanvas(test_canvas_sel, name);
      func({ canvas_sel: test_canvas_sel, params: params },
        Vex.Flow.Renderer.getCanvasContext);
    });
}

Vex.Flow.Test.runRaphaelTest = function(name, func, params) {
  test(name, function() {
      test_canvas_sel = "canvas_" + Vex.Flow.Test.genID();
      test_canvas = Vex.Flow.Test.createTestRaphael(test_canvas_sel, name);
      func({ canvas_sel: test_canvas_sel, params: params },
        Vex.Flow.Renderer.getRaphaelContext);
    });
}
