/**
 * VexFlow - Basic Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.StaveConnector = {}

Vex.Flow.Test.StaveConnector.Start = function() {
  module("StaveConnector");
  Vex.Flow.Test.runTest("StaveConnector Single Draw Test (Canvas)", 
    Vex.Flow.Test.StaveConnector.drawSingle);  
  Vex.Flow.Test.runRaphaelTest("StaveConnector Single Draw Test (Raphael)",
    Vex.Flow.Test.StaveConnector.drawSingle);
  Vex.Flow.Test.runTest("StaveConnector Double Draw Test (Canvas)", 
    Vex.Flow.Test.StaveConnector.drawDouble);  
  Vex.Flow.Test.runRaphaelTest("StaveConnector Double Draw Test (Raphael)",
    Vex.Flow.Test.StaveConnector.drawDouble);
  Vex.Flow.Test.runTest("StaveConnector Brace Draw Test (Canvas)", 
    Vex.Flow.Test.StaveConnector.drawBrace);  
  Vex.Flow.Test.runRaphaelTest("StaveConnector Brace Draw Test (Raphael)",
    Vex.Flow.Test.StaveConnector.drawBrace);
  Vex.Flow.Test.runTest("StaveConnector Brace Wide Draw Test (Canvas)", 
    Vex.Flow.Test.StaveConnector.drawBraceWide);  
  Vex.Flow.Test.runRaphaelTest("StaveConnector Wide Brace Draw Test (Raphael)",
    Vex.Flow.Test.StaveConnector.drawBraceWide);
  Vex.Flow.Test.runTest("StaveConnector Bracket Draw Test (Canvas)", 
    Vex.Flow.Test.StaveConnector.drawBracket);  
  Vex.Flow.Test.runRaphaelTest("StaveConnector Bracket Draw Test (Raphael)",
    Vex.Flow.Test.StaveConnector.drawBracket);
  Vex.Flow.Test.runTest("StaveConnector Combined Draw Test (Canvas)", 
    Vex.Flow.Test.StaveConnector.drawCombined);  
  Vex.Flow.Test.runRaphaelTest("StaveConnector Combined Draw Test (Raphael)",
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
  var ctx = new contextBuilder(options.canvas_sel, 400, 300);
  var stave = new Vex.Flow.Stave(25, 10, 300);
  var stave2 = new Vex.Flow.Stave(25, 120, 300);  
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

Vex.Flow.Test.StaveConnector.drawCombined = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 700);
  var stave = new Vex.Flow.Stave(25, 10, 300);
  var stave2 = new Vex.Flow.Stave(25, 100, 300);
  var stave3 = new Vex.Flow.Stave(25, 190, 300);
  var stave4 = new Vex.Flow.Stave(25, 280, 300);
  var stave5 = new Vex.Flow.Stave(25, 370, 300);
  var stave6 = new Vex.Flow.Stave(25, 460, 300);
  var stave7 = new Vex.Flow.Stave(25, 560, 300);
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
