/**
 * VexFlow - TabStave Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabStave = (function () {
  var TabStave = {
    Start: function () {
      QUnit.module('TabStave');
      VF.Test.runTests('TabStave Draw Test', VF.Test.TabStave.draw);
      VF.Test.runTests('Vertical Bar Test', VF.Test.TabStave.drawVerticalBar);
    },

    draw: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 400, 160);
      var stave = new VF.TabStave(10, 10, 300);
      stave.setNumLines(6);
      stave.setContext(ctx);
      stave.draw();

      equal(stave.getYForNote(0), 127, 'getYForNote(0)');
      equal(stave.getYForLine(5), 127, 'getYForLine(5)');
      equal(stave.getYForLine(0), 62, 'getYForLine(0) - Top Line');
      equal(stave.getYForLine(4), 114, 'getYForLine(4) - Bottom Line');

      ok(true, 'all pass');
    },

    drawVerticalBar: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 400, 160);
      var stave = new VF.TabStave(10, 10, 300);
      stave.setNumLines(6);
      stave.setContext(ctx);
      stave.drawVerticalBar(50, true);
      stave.drawVerticalBar(100, true);
      stave.drawVerticalBar(150, false);
      stave.setEndBarType(VF.Barline.type.END);
      stave.draw();

      ok(true, 'all pass');
    },
  };

  return TabStave;
})();

module.exports = VF.Test.TabStave;
