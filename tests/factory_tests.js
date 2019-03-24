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
      VFT.runSVGTest('Draw Tab (repeat barlines must be aligned)', VFT.Factory.drawTab);
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

    drawTab: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 400);

      var system = vf.System();

      var stave = vf.Stave()
        .setClef('treble')
        .setKeySignature('C#')
        .setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);

      var voices = [
        vf.Voice().addTickables([
          vf.GhostNote({ duration: 'w' })
        ])
      ];

      system.addStave({
        stave: stave,
        voices: voices
      });

      var tabStave = vf.TabStave()
        .setClef('tab')
        .setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);

      var tabVoices = [
        vf.Voice().addTickables([
          vf.GhostNote({ duration: 'w' })
        ])
      ];

      system.addStave({
        stave: tabStave,
        voices: tabVoices
      });

      vf.draw();
      equal(stave.getModifiers()[0].getX(), tabStave.getModifiers()[0].getX());
      expect(1);
    },
  };

  return Factory;
})();
