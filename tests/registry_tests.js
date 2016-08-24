/**
 * VexFlow - Registry Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Registry = (function() {
  var Registry = {
    Start: function() {
      QUnit.module("Registry");
      var VFT = Vex.Flow.Test;

      QUnit.test("Register and Clear", VFT.Registry.registerAndClear);
      QUnit.test("Default Registry", VFT.Registry.defaultRegistry);
    },

    registerAndClear: function(assert) {
      var registry = new VF.Registry();
      var score = new VF.EasyScore({factory: VF.Factory.newFromSelector(null)});

      registry.register(score.notes('C4')[0], 'foobar');

      var foobar = registry.getElementById('foobar');
      assert.ok(foobar);
      assert.equal(foobar.getAttribute('id'), 'foobar');

      registry.clear();
      assert.notOk(registry.getElementById('foobar'));
      assert.throws(function() {registry.register(score.notes('C4'))});
      
      registry.clear();
      assert.ok(registry
        .register(score.notes('C4[id="boobar"]')[0])
        .getElementById('boobar'));
    },

    defaultRegistry: function(assert) {
      var registry = new VF.Registry();
      var score = new VF.EasyScore({factory: VF.Factory.newFromSelector(null)});

      VF.Registry.enableDefaultRegistry(registry);
      score.notes('C4[id="foobar"]');
      const note = registry.getElementById('foobar');
      assert.ok(note);

      note.setAttribute('id', 'boobar');
      assert.ok(registry.getElementById('boobar'));
      assert.notOk(registry.getElementById('foobar'));

      registry.clear();
      assert.equal(registry.getElementsByType('StaveNote'), undefined);

      score.notes('C5');
      var elements = registry.getElementsByType('StaveNote');
      assert.equal(Object.keys(elements).length, 1);
    }
  };

  return Registry;  
})();
