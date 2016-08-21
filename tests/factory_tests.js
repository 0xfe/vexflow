/**
 * VexFlow - Factory Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Factory = (function() {
  var Factory = {
    Start: function() {
      QUnit.module("Factory");
      var VFT = Vex.Flow.Test;

      QUnit.test("Defaults", VFT.Factory.defaults);
    },

    defaults: function(assert) {
      assert.throws(function() {
        var vf = new VF.Factory({
          renderer: {
              width: 700,
              height: 500
          }
        })
      });

      var vf = new VF.Factory({
        renderer: {
          selector: null,
          width: 700,
          height: 500
        }
      });

      var options = vf.getOptions();
      assert.equal(options.renderer.width, 700);
      assert.equal(options.renderer.height, 500);
      assert.equal(options.renderer.selector, null);
      assert.equal(options.stave.space, 10); 

      assert.expect(5);
    }
  };

  return Factory;  
})();
