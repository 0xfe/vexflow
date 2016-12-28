/**
 * VexFlow - StaveConnector Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StaveConnector = (function() {
  var StaveConnector = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('StaveConnector');
      runTests('Single Draw Test', StaveConnector.drawSingle);
      runTests('Single Draw Test, 1px Stave Line Thickness', StaveConnector.drawSingle1pxBarlines);
      runTests('Single Both Sides Test', StaveConnector.drawSingleBoth);
      runTests('Double Draw Test', StaveConnector.drawDouble);
      runTests('Bold Double Line Left Draw Test', StaveConnector.drawRepeatBegin);
      runTests('Bold Double Line Right Draw Test', StaveConnector.drawRepeatEnd);
      runTests('Thin Double Line Right Draw Test', StaveConnector.drawThinDouble);
      runTests('Bold Double Lines Overlapping Draw Test', StaveConnector.drawRepeatAdjacent);
      runTests('Bold Double Lines Offset Draw Test', StaveConnector.drawRepeatOffset);
      runTests('Bold Double Lines Offset Draw Test 2', StaveConnector.drawRepeatOffset2);
      runTests('Brace Draw Test', StaveConnector.drawBrace);
      runTests('Brace Wide Draw Test', StaveConnector.drawBraceWide);
      runTests('Bracket Draw Test', StaveConnector.drawBracket);
      runTests('Combined Draw Test', StaveConnector.drawCombined);
    },

    drawSingle: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
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

      ok(true, 'all pass');
    },

    drawSingle1pxBarlines: function(options, contextBuilder) {
      VF.STAVE_LINE_THICKNESS = 1;
      var ctx = new contextBuilder(options.elementId, 400, 300);
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

      ok(true, 'all pass');
    },

    drawSingleBoth: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
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

      ok(true, 'all pass');
    },

    drawDouble: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
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

      ok(true, 'all pass');
    },

    drawBrace: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 450, 300);
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

      ok(true, 'all pass');
    },

    drawBraceWide: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
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

      ok(true, 'all pass');
    },

    drawBracket: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
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

      ok(true, 'all pass');
    },

    drawRepeatBegin: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
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

      ok(true, 'all pass');
    },

    drawRepeatEnd: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
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

      ok(true, 'all pass');
    },

    drawThinDouble: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
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

      ok(true, 'all pass');
    },

    drawRepeatAdjacent: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
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

      ok(true, 'all pass');
    },

    drawRepeatOffset2: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
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

      ok(true, 'all pass');
    },
    drawRepeatOffset: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
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

      ok(true, 'all pass');
    },

    drawCombined: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 550, 700);
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
      var conn_bracket = new VF.StaveConnector(stave4, stave7);
      var conn_none = new VF.StaveConnector(stave4, stave5);
      var conn_brace = new VF.StaveConnector(stave6, stave7);
      conn_single.setType(VF.StaveConnector.type.SINGLE);
      conn_double.setType(VF.StaveConnector.type.DOUBLE);
      conn_bracket.setType(VF.StaveConnector.type.BRACKET);
      conn_brace.setType(VF.StaveConnector.type.BRACE);
      conn_brace.setXShift(-5);
      conn_double.setText('Piano');
      conn_none.setText('Multiple', { shift_y: -15 });
      conn_none.setText('Line Text', { shift_y: 15 });
      conn_brace.setText('Harpsichord');
      conn_single.setContext(ctx);
      conn_double.setContext(ctx);
      conn_bracket.setContext(ctx);
      conn_none.setContext(ctx);
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
      conn_none.draw();
      conn_brace.draw();

      ok(true, 'all pass');
    },
  };

  return StaveConnector;
})();
