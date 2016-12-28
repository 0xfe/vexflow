/**
 * VexFlow - Factory Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Factory = (function() {
  var Factory = {
    Start: function() {
      QUnit.module('Factory');
      var VFT = Vex.Flow.Test;

      QUnit.test('Defaults', VFT.Factory.defaults);
      VFT.runSVGTest('Draw', VFT.Factory.draw);
    },

    defaults: function(assert) {
      assert.throws(function() {
        return new VF.Factory({
          renderer: {
            width: 700,
            height: 500,
          },
        });
      });

      var vf = new VF.Factory({
        renderer: {
          elementId: null,
          width: 700,
          height: 500,
        },
      });

      var options = vf.getOptions();
      assert.equal(options.renderer.width, 700);
      assert.equal(options.renderer.height, 500);
      assert.equal(options.renderer.elementId, null);
      assert.equal(options.stave.space, 10);
    },

    draw: function(options) {
      var vf = VF.Factory.newFromElementId(options.elementId);
      vf.Stave().setClef('treble');
      vf.draw();
      expect(0);
    },
  };

  return Factory;
})();
