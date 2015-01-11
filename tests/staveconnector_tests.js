/**
 * VexFlow - Basic Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.StaveConnector = {}

Vex.Flow.Test.StaveConnector.Start = function() {
  module("StaveConnector");
  Vex.Flow.Test.runTests("StaveConnector Single Draw Test",
    Vex.Flow.Test.StaveConnector.drawSingle);
  
  Vex.Flow.Test.runTests("StaveConnector Single Draw Test, 1px Stave Line Thickness",
    Vex.Flow.Test.StaveConnector.drawSingle1pxBarlines);
  Vex.Flow.Test.runTests("StaveConnector Single Both Sides Test",
    Vex.Flow.Test.StaveConnector.drawSingleBoth);
  
  Vex.Flow.Test.runTests("StaveConnector Double Draw Test",
    Vex.Flow.Test.StaveConnector.drawDouble);
  
  Vex.Flow.Test.runTests("StaveConnector Bold Double Line Left Draw Test",
    Vex.Flow.Test.StaveConnector.drawRepeatBegin);
  
  Vex.Flow.Test.runTests("StaveConnector Bold Double Line Right Draw Test",
    Vex.Flow.Test.StaveConnector.drawRepeatEnd);
  
  Vex.Flow.Test.runTests("StaveConnector Thin Double Line Right Draw Test",
    Vex.Flow.Test.StaveConnector.drawThinDouble);
  
  Vex.Flow.Test.runTests("StaveConnector Bold Double Lines Overlapping Draw Test",
    Vex.Flow.Test.StaveConnector.drawRepeatAdjacent);
  
  Vex.Flow.Test.runTests("StaveConnector Bold Double Lines Offset Draw Test",
    Vex.Flow.Test.StaveConnector.drawRepeatOffset);
  
  Vex.Flow.Test.runTests("StaveConnector Bold Double Lines Offset Draw Test 2",
    Vex.Flow.Test.StaveConnector.drawRepeatOffset2);
  
  Vex.Flow.Test.runTests("StaveConnector Brace Draw Test",
    Vex.Flow.Test.StaveConnector.drawBrace);
  
  Vex.Flow.Test.runTests("StaveConnector Brace Wide Draw Test",
    Vex.Flow.Test.StaveConnector.drawBraceWide);
  
  Vex.Flow.Test.runTests("StaveConnector Bracket Draw Test",
    Vex.Flow.Test.StaveConnector.drawBracket);
  
  Vex.Flow.Test.runTests("StaveConnector Combined Draw Test",
    Vex.Flow.Test.StaveConnector.drawCombined);
  
}

Vex.Flow.Test.StaveConnector.drawSingle = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, 10, 300);
  var stave2 = new Vex.Flow.Stave(25, 120, 300);
  stave.setContext(ctx);
  stave2.setContext(ctx);
  var connector = new Vex.Flow.StaveConnector(stave, stave2);
  connector.setType(Vex.Flow.StaveConnector.type.SINGLE);
  connector.setContext(ctx);
  stave.draw();
  stave2.draw();
  connector.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.StaveConnector.drawSingle1pxBarlines = function(options, contextBuilder) {
  Vex.Flow.STAVE_LINE_THICKNESS = 1;
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, 10, 300);
  var stave2 = new Vex.Flow.Stave(25, 120, 300);
  stave.setContext(ctx);
  stave2.setContext(ctx);
  var connector = new Vex.Flow.StaveConnector(stave, stave2);
  connector.setType(Vex.Flow.StaveConnector.type.SINGLE);
  connector.setContext(ctx);
  stave.draw();
  stave2.draw();
  connector.draw();
  Vex.Flow.STAVE_LINE_THICKNESS = 2;

  ok(true, "all pass");
}

Vex.Flow.Test.StaveConnector.drawSingleBoth = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, 10, 300);
  var stave2 = new Vex.Flow.Stave(25, 120, 300);
  stave.setContext(ctx);
  stave2.setContext(ctx);
  var connector = new Vex.Flow.StaveConnector(stave, stave2);
  connector.setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT);
  connector.setContext(ctx);
  var connector2 = new Vex.Flow.StaveConnector(stave, stave2);
  connector2.setType(Vex.Flow.StaveConnector.type.SINGLE_RIGHT);
  connector2.setContext(ctx);
  stave.draw();
  stave2.draw();
  connector.draw();
  connector2.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.StaveConnector.drawDouble = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, 10, 300);
  var stave2 = new Vex.Flow.Stave(25, 120, 300);
  stave.setContext(ctx);
  stave2.setContext(ctx);
  var connector = new Vex.Flow.StaveConnector(stave, stave2);
  var line = new Vex.Flow.StaveConnector(stave, stave2);
  connector.setType(Vex.Flow.StaveConnector.type.DOUBLE);
  connector.setContext(ctx);
  line.setType(Vex.Flow.StaveConnector.type.SINGLE);
  connector.setContext(ctx);
  line.setContext(ctx);
  stave.draw();
  stave2.draw();
  connector.draw(); 
  line.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.StaveConnector.drawBrace = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 450, 300);
  var stave = new Vex.Flow.Stave(100, 10, 300);
  var stave2 = new Vex.Flow.Stave(100, 120, 300);
  stave.setContext(ctx);
  stave2.setContext(ctx);
  var connector = new Vex.Flow.StaveConnector(stave, stave2);
  var line = new Vex.Flow.StaveConnector(stave, stave2);
  connector.setType(Vex.Flow.StaveConnector.type.BRACE);
  connector.setContext(ctx);
  connector.setText('Piano');
  line.setType(Vex.Flow.StaveConnector.type.SINGLE);
  connector.setContext(ctx);
  line.setContext(ctx);
  stave.draw();
  stave2.draw();
  connector.draw();
  line.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.StaveConnector.drawBraceWide = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, -20, 300);
  var stave2 = new Vex.Flow.Stave(25, 200, 300);
  stave.setContext(ctx);
  stave2.setContext(ctx);
  var connector = new Vex.Flow.StaveConnector(stave, stave2);
  var line = new Vex.Flow.StaveConnector(stave, stave2);
  connector.setType(Vex.Flow.StaveConnector.type.BRACE);
  connector.setContext(ctx);
  line.setType(Vex.Flow.StaveConnector.type.SINGLE);
  connector.setContext(ctx);
  line.setContext(ctx);
  stave.draw();
  stave2.draw();
  connector.draw();
  line.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.StaveConnector.drawBracket = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, 10, 300);
  var stave2 = new Vex.Flow.Stave(25, 120, 300);
  stave.setContext(ctx);
  stave2.setContext(ctx);
  var connector = new Vex.Flow.StaveConnector(stave, stave2);
  var line = new Vex.Flow.StaveConnector(stave, stave2);
  connector.setType(Vex.Flow.StaveConnector.type.BRACKET);
  connector.setContext(ctx);
  line.setType(Vex.Flow.StaveConnector.type.SINGLE);
  connector.setContext(ctx);
  line.setContext(ctx);
  stave.draw();
  stave2.draw();
  connector.draw();
  line.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.StaveConnector.drawRepeatBegin = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, 10, 300);
  var stave2 = new Vex.Flow.Stave(25, 120, 300);
  stave.setContext(ctx);
  stave2.setContext(ctx);
  stave.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  stave2.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);

  var line = new Vex.Flow.StaveConnector(stave, stave2);
  line.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_LEFT);
  line.setContext(ctx);
  stave.draw();
  stave2.draw();
  line.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.StaveConnector.drawRepeatEnd = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, 10, 300);
  var stave2 = new Vex.Flow.Stave(25, 120, 300);
  stave.setContext(ctx);
  stave2.setContext(ctx);
  stave.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
  stave2.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);

  var line = new Vex.Flow.StaveConnector(stave, stave2);
  line.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_RIGHT);
  line.setContext(ctx);
  stave.draw();
  stave2.draw();
  line.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.StaveConnector.drawThinDouble= function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, 10, 300);
  var stave2 = new Vex.Flow.Stave(25, 120, 300);
  stave.setContext(ctx);
  stave2.setContext(ctx);
  stave.setEndBarType(Vex.Flow.Barline.type.DOUBLE);
  stave2.setEndBarType(Vex.Flow.Barline.type.DOUBLE);

  var line = new Vex.Flow.StaveConnector(stave, stave2);
  line.setType(Vex.Flow.StaveConnector.type.THIN_DOUBLE);
  line.setContext(ctx);
  stave.draw();
  stave2.draw();
  line.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.StaveConnector.drawRepeatAdjacent = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, 10, 150);
  var stave2 = new Vex.Flow.Stave(25, 120, 150);
  var stave3 = new Vex.Flow.Stave(175, 10, 150);
  var stave4 = new Vex.Flow.Stave(175, 120, 150);
  stave.setContext(ctx);
  stave2.setContext(ctx);
  stave3.setContext(ctx);
  stave4.setContext(ctx);

  stave.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
  stave2.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
  stave3.setEndBarType(Vex.Flow.Barline.type.END);
  stave4.setEndBarType(Vex.Flow.Barline.type.END);

  stave.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  stave2.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  stave3.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  stave4.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  var connector = new Vex.Flow.StaveConnector(stave, stave2);
  var connector2 = new Vex.Flow.StaveConnector(stave, stave2);
  var connector3 = new Vex.Flow.StaveConnector(stave3, stave4);
  var connector4 = new Vex.Flow.StaveConnector(stave3, stave4);
  connector.setContext(ctx);
  connector2.setContext(ctx);
  connector3.setContext(ctx);
  connector4.setContext(ctx);
  connector.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_LEFT);
  connector2.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_RIGHT);
  connector3.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_LEFT);
  connector4.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_RIGHT);
  stave.draw();
  stave2.draw();
  stave3.draw();
  stave4.draw();
  connector.draw();
  connector2.draw();
  connector3.draw();
  connector4.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.StaveConnector.drawRepeatOffset2 = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, 10, 150);
  var stave2 = new Vex.Flow.Stave(25, 120, 150);
  var stave3 = new Vex.Flow.Stave(175, 10, 150);
  var stave4 = new Vex.Flow.Stave(175, 120, 150);
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

  stave.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
  stave2.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
  stave3.setEndBarType(Vex.Flow.Barline.type.END);
  stave4.setEndBarType(Vex.Flow.Barline.type.END);

  stave.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  stave2.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  stave3.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  stave4.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  var connector = new Vex.Flow.StaveConnector(stave, stave2);
  var connector2 = new Vex.Flow.StaveConnector(stave, stave2);
  var connector3 = new Vex.Flow.StaveConnector(stave3, stave4);
  var connector4 = new Vex.Flow.StaveConnector(stave3, stave4);
  var connector5 = new Vex.Flow.StaveConnector(stave3, stave4);

  connector.setContext(ctx);
  connector2.setContext(ctx);
  connector3.setContext(ctx);
  connector4.setContext(ctx);
  connector5.setContext(ctx);
  connector.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_LEFT);
  connector2.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_RIGHT);
  connector3.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_LEFT);
  connector4.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_RIGHT);
  connector5.setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT);

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
}
Vex.Flow.Test.StaveConnector.drawRepeatOffset = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, 10, 150);
  var stave2 = new Vex.Flow.Stave(25, 120, 150);
  var stave3 = new Vex.Flow.Stave(175, 10, 150);
  var stave4 = new Vex.Flow.Stave(175, 120, 150);
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

  stave.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
  stave2.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
  stave3.setEndBarType(Vex.Flow.Barline.type.END);
  stave4.setEndBarType(Vex.Flow.Barline.type.END);

  stave.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  stave2.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  stave3.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  stave4.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
  var connector = new Vex.Flow.StaveConnector(stave, stave2);
  var connector2 = new Vex.Flow.StaveConnector(stave, stave2);
  var connector3 = new Vex.Flow.StaveConnector(stave3, stave4);
  var connector4 = new Vex.Flow.StaveConnector(stave3, stave4);
  var connector5 = new Vex.Flow.StaveConnector(stave3, stave4);
  connector.setContext(ctx);
  connector2.setContext(ctx);
  connector3.setContext(ctx);
  connector4.setContext(ctx);
  connector5.setContext(ctx);
  connector.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_LEFT);
  connector2.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_RIGHT);
  connector3.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_LEFT);
  connector4.setType(Vex.Flow.StaveConnector.type.BOLD_DOUBLE_RIGHT);
  connector5.setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT);

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
}

Vex.Flow.Test.StaveConnector.drawCombined = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 550, 700);
  var stave = new Vex.Flow.Stave(150, 10, 300);
  var stave2 = new Vex.Flow.Stave(150, 100, 300);
  var stave3 = new Vex.Flow.Stave(150, 190, 300);
  var stave4 = new Vex.Flow.Stave(150, 280, 300);
  var stave5 = new Vex.Flow.Stave(150, 370, 300);
  var stave6 = new Vex.Flow.Stave(150, 460, 300);
  var stave7 = new Vex.Flow.Stave(150, 560, 300);
  stave.setText('Violin', Vex.Flow.Modifier.Position.LEFT);
  stave.setContext(ctx);
  stave2.setContext(ctx);
  stave3.setContext(ctx);
  stave4.setContext(ctx);
  stave5.setContext(ctx);
  stave6.setContext(ctx);
  stave7.setContext(ctx);
  var conn_single = new Vex.Flow.StaveConnector(stave, stave7);
  var conn_double = new Vex.Flow.StaveConnector(stave2, stave3);
  var conn_bracket = new Vex.Flow.StaveConnector(stave4, stave5);
  var conn_brace = new Vex.Flow.StaveConnector(stave6, stave7);
  conn_single.setType(Vex.Flow.StaveConnector.type.SINGLE);
  conn_double.setType(Vex.Flow.StaveConnector.type.DOUBLE);
  conn_bracket.setType(Vex.Flow.StaveConnector.type.BRACKET);
  conn_brace.setType(Vex.Flow.StaveConnector.type.BRACE);
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
