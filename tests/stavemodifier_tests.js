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
      VF.Test.runTests("Begin & End StaveModifier Test",
          StaveModifier.drawBeginAndEnd);
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
    },

    drawBeginAndEnd: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      var stave = new VF.Stave(10, 10, 400);
      stave.setContext(ctx);
      stave.setTimeSignature('C|');
      stave.setKeySignature('Db');
      stave.setClef('treble');
      stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave.setEndClef('alto');
      stave.setEndTimeSignature('9/8');
      stave.setEndKeySignature('G', 'C#');
      stave.setEndBarType(VF.Barline.type.DOUBLE);
      stave.draw();

      // change
      stave.setY(100);
      stave.setTimeSignature('3/4');
      stave.setKeySignature('G', 'C#');
      stave.setClef('bass');
      stave.setBegBarType(VF.Barline.type.SINGLE);
      stave.setEndClef('treble');
      stave.setEndTimeSignature('C');
      stave.setEndKeySignature('F');
      stave.setEndBarType(VF.Barline.type.SINGLE);
      stave.draw();

      ok(true, "all pass");
    }
  };

  return StaveModifier;
})();
