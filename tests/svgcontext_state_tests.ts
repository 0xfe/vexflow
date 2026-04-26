import { VexFlowTests } from './vexflow_test_helpers';
import { SVGContext } from '../src/svgcontext';

const SVGContextStateTests = {
  Start(): void {
    QUnit.module('SVGContext State');
    QUnit.test('Save and Restore State', (assert) => {
      const element = document.createElement('div');
      const ctx = new SVGContext(element);

      // Set initial values
      ctx.setLineWidth(10);
      ctx.setLineCap('round');
      ctx.setLineDash([5, 5]);
      ctx.setFillStyle('blue');
      ctx.setStrokeStyle('red');
      ctx.setShadowColor('green');
      ctx.setShadowBlur(5);
      ctx.setFont('Arial', 12, 'bold', 'italic');

      ctx.save();

      // Change values
      ctx.setLineWidth(20);
      ctx.setLineCap('square');
      ctx.setLineDash([2, 2]);
      ctx.setFillStyle('black');
      ctx.setStrokeStyle('white');
      ctx.setShadowColor('black');
      ctx.setShadowBlur(0);
      ctx.setFont('Times', 10, 'normal', 'normal');

      ctx.restore();

      assert.equal(ctx.lineWidth, 10, 'lineWidth restored');
      assert.equal(ctx.attributes['stroke-width'], 10, 'stroke-width restored');
      assert.equal(ctx.attributes['stroke-linecap'], 'round', 'stroke-linecap restored');
      assert.equal(ctx.attributes['stroke-dasharray'], '5,5', 'stroke-dasharray restored');
      assert.equal(ctx.attributes['fill'], 'blue', 'fill restored');
      assert.equal(ctx.attributes['stroke'], 'red', 'stroke restored');
      assert.equal(ctx.shadow_attributes.color, 'green', 'shadow color restored');
      assert.equal(ctx.shadow_attributes.width, 5, 'shadow blur restored');
      assert.equal(ctx.state['font-family'], 'Arial', 'font-family restored');
      assert.equal(ctx.state['font-size'], '12pt', 'font-size restored');
      assert.equal(ctx.state['font-weight'], 'bold', 'font-weight restored');
      assert.equal(ctx.state['font-style'], 'italic', 'font-style restored');
    });
  },
};

VexFlowTests.register(SVGContextStateTests);
export { SVGContextStateTests };
