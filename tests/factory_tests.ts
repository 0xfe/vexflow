// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Factory Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests } from './vexflow_test_helpers';
import { QUnit, equal, expect, test } from './support/qunit_api';
import { Barline } from 'stavebarline';
import { Factory } from 'factory';

const FactoryTests = {
  Start: function () {
    QUnit.module('Factory');

    test('Defaults', this.defaults);
    VexFlowTests.runSVGTest('Draw', this.draw);
    VexFlowTests.runSVGTest('Draw Tab (repeat barlines must be aligned)', this.drawTab);
  },

  defaults: function (assert) {
    assert.throws(function () {
      return new Factory({
        renderer: {
          elementId: '',
          width: 700,
          height: 500,
        },
      });
    });

    const f = new Factory({
      renderer: {
        elementId: null,
        width: 700,
        height: 500,
      },
    });

    const options = f.getOptions();
    assert.equal(options.renderer.width, 700);
    assert.equal(options.renderer.height, 500);
    assert.equal(options.renderer.elementId, null);
    assert.equal(options.stave.space, 10);
  },

  draw: function (options) {
    const f = Factory.newFromElementId(options.elementId);
    f.Stave().setClef('treble');
    f.draw();
    expect(0);
  },

  drawTab: function (options) {
    const f = VexFlowTests.makeFactory(options, 500, 400);

    const system = f.System({ width: 500 });

    const stave = f.Stave().setClef('treble').setKeySignature('C#').setBegBarType(Barline.type.REPEAT_BEGIN);

    const voices = [f.Voice().addTickables([f.GhostNote({ duration: 'w' })])];

    system.addStave({
      stave: stave,
      voices: voices,
    });

    const tabStave = f.TabStave().setClef('tab').setBegBarType(Barline.type.REPEAT_BEGIN);

    const tabVoices = [f.Voice().addTickables([f.GhostNote({ duration: 'w' })])];

    system.addStave({
      stave: tabStave,
      voices: tabVoices,
    });

    f.draw();
    equal(stave.getModifiers()[0].getX(), tabStave.getModifiers()[0].getX());
    expect(1);
  },
};

export { FactoryTests };
