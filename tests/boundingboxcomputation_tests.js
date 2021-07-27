/**
 * VexFlow - Bounding Box Computation Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
const BoundingBoxComputationTests = (function () {
  function createCanvas(options) {
    let points = options.params.points;

    // Size the canvas to fit all the points and a small margin.
    let w = points[0];
    let h = points[1];
    for (let i = 2; i < points.length; i += 2) {
      w = Math.max(w, points[i]);
      h = Math.max(h, points[i + 1]);
    }

    let vf = VF.Test.makeFactory(options, w + 20, h + 20);
    let ctx = vf.getContext();
    ctx.setLineCap('square');
    return ctx;
  }

  function rect(ctx, style, lineWidth, x, y, w, h) {
    ctx.strokeStyle = style;
    ctx.setLineWidth(lineWidth);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  let BoundingBoxComputation = {
    Start: function () {
      QUnit.module('BoundingBoxComputation');
      test('Point Test', VF.Test.BoundingBoxComputation.point);

      // Each test consists of the control point for a single curve and
      // its expected bounding box.
      let quadraticParams = [
        {
          points: [10, 10, 100, 20, 110, 110],
          box: [10, 10, 100, 100],
        },
        {
          points: [110, 10, 60, 110, 10, 20],
          box: [10, 10, 100, 52.63],
        },
        {
          points: [10, 10, 30, 20, 50, 30],
          box: [10, 10, 40, 20],
        },
        {
          points: [100, 30, 30, 110, 20, 30],
          box: [20, 30, 80, 40],
        },
      ];
      for (let params of quadraticParams) {
        Vex.Flow.Test.runTests('Quadratic Test', VF.Test.BoundingBoxComputation.quadratic, params);
      }

      // Each test consists of the control point for a single curve and
      // its expected bounding box.
      let cubicParams = [
        {
          points: [0, 0, 50, 10, 90, 50, 100, 100],
          box: [0, 0, 100, 100],
        },
        {
          points: [0, 0, 25, 100, 75, 100, 100, 0],
          box: [0, 0, 100, 75],
        },
        {
          points: [0, 100, 80, 0, 20, 0, 100, 100],
          box: [0, 25, 100, 75],
        },
        {
          points: [0, 0, 100, 100, 100, 0, 0, 100],
          box: [0, 0, 75, 100],
        },
        {
          points: [0, 0, 120, 100, -20, 100, 100, 0],
          box: [0, 0, 100, 75],
        },
        {
          points: [40, 0, 0, 100, 100, 100, 64, 0],
          box: [30.38, 0, 41.59, 75],
        },
        {
          points: [0, 20, 25, 50, 100, 100, 50, 0],
          box: [0, 0, 66.82, 59.37],
        },
        {
          points: [200, 60, 0, 0, 180, 0, 110, 80],
          box: [102.02, 17.23, 97.98, 62.77],
        },
        {
          points: [10, 0, 200, 80, 0, 80, 90, 28],
          box: [10, 0, 85.33, 64.06],
        },
        {
          points: [50, 4, 0, 4, 80, 4, 60, 4],
          box: [33.28, 4, 30.01, 0],
        },
        {
          points: [0, 50, 10, 90, 90, 10, 100, 50],
          box: [0, 38.45, 100, 23.1],
        },
      ];
      for (let params of cubicParams) {
        Vex.Flow.Test.runTests('Cubic Test', VF.Test.BoundingBoxComputation.cubic, params);
      }
    },

    point: function () {
      let bboxComp = new VF.BoundingBoxComputation();
      bboxComp.addPoint(2, 3);
      equal(bboxComp.getX1(), 2, 'Bad X1');
      equal(bboxComp.getY1(), 3, 'Bad Y1');
      equal(bboxComp.width(), 0, 'Bad width');
      equal(bboxComp.height(), 0, 'Bad height');

      bboxComp.addPoint(-5, 7);
      equal(bboxComp.getX1(), -5, 'Bad X1');
      equal(bboxComp.getY1(), 3, 'Bad Y1');
      equal(bboxComp.width(), 7, 'Bad width');
      equal(bboxComp.height(), 4, 'Bad height');
    },

    quadratic: function (options) {
      let points = options.params.points;
      let box = options.params.box;

      let ctx = createCanvas(options);
      let [x0, y0, x1, y1, x2, y2] = points;

      // Draw expected bounding box.
      let [bx, by, bw, bh] = box;
      rect(ctx, '#0f0', 5, bx, by, bw, bh);

      // Compute the bounding box.
      let bboxComp = new VF.BoundingBoxComputation();
      bboxComp.addQuadraticCurve(x0, y0, x1, y1, x2, y2);

      // Draw computed bounding box.
      [bx, by, bw, bh] = [bboxComp.getX1(), bboxComp.getY1(), bboxComp.width(), bboxComp.height()];
      rect(ctx, '#00f', 3, bx, by, bw, bh);

      // Regression test for a prior bug: compute the bounding box again,
      // this time using the Glyph.getOutlineBoundingBox code path.
      let o = ['m', x0.toString(), -y0.toString(), 'q', x2.toString(), -y2.toString(), x1.toString(), -y1.toString()];
      let bbox = VF.Glyph.getOutlineBoundingBox(o, 1, 0, 0);
      rect(ctx, '#fa0', 1, bbox.x, bbox.y, bbox.w, bbox.h);

      // Draw curve.
      ctx.setLineWidth(1);
      ctx.fillStyle = '#000';
      VF.Glyph.renderOutline(ctx, o, 1, 0, 0);

      // Draw control points.
      ctx.strokeStyle = '#f00';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Check the expected and computed bounding boxes are close enough.
      ok(Math.abs(bboxComp.getX1() - box[0]) < 0.01, `Bad X1: ${bboxComp.getX1()}`);
      ok(Math.abs(bboxComp.getY1() - box[1]) < 0.01, `Bad Y1: ${bboxComp.getY1()}`);
      ok(Math.abs(bboxComp.width() - box[2]) < 0.01, `Bad width: ${bboxComp.width()}`);
      ok(Math.abs(bboxComp.height() - box[3]) < 0.01, `Bad height: ${bboxComp.height()}`);

      ok(Math.abs(bbox.getX() - box[0]) < 0.01, `Bad X: ${bbox.getX()}`);
      ok(Math.abs(bbox.getY() - box[1]) < 0.01, `Bad Y: ${bbox.getY()}`);
      ok(Math.abs(bbox.getW() - box[2]) < 0.01, `Bad W: ${bbox.getW()}`);
      ok(Math.abs(bbox.getH() - box[3]) < 0.01, `Bad H: ${bbox.getH()}`);
    },

    cubic: function (options) {
      let points = options.params.points;
      let box = options.params.box;

      let ctx = createCanvas(options);
      let [x0, y0, x1, y1, x2, y2, x3, y3] = points;

      // Draw expected bounding box.
      let [bx, by, bw, bh] = box;
      rect(ctx, '#0f0', 5, bx, by, bw, bh);

      // Compute the bounding box.
      let bboxComp = new VF.BoundingBoxComputation();
      bboxComp.addBezierCurve(x0, y0, x1, y1, x2, y2, x3, y3);

      // Draw computed bounding box.
      [bx, by, bw, bh] = [bboxComp.getX1(), bboxComp.getY1(), bboxComp.width(), bboxComp.height()];
      rect(ctx, '#00f', 3, bx, by, bw, bh);

      // Regression test for a prior bug: compute the bounding box again,
      // this time using the Glyph.getOutlineBoundingBox code path.
      let o = [
        'm',
        x0.toString(),
        -y0.toString(),
        'b',
        x3.toString(),
        -y3.toString(),
        x1.toString(),
        -y1.toString(),
        x2.toString(),
        -y2.toString(),
      ];
      let bbox = VF.Glyph.getOutlineBoundingBox(o, 1, 0, 0);
      rect(ctx, '#fa0', 1, bbox.x, bbox.y, bbox.w, bbox.h);

      // Draw curve.
      ctx.lineWidth = 1;
      ctx.fillStyle = '#000';
      VF.Glyph.renderOutline(ctx, o, 1, 0, 0);

      // Draw control points.
      ctx.strokeStyle = '#f00';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.stroke();

      // Check the expected and computed bounding boxes are close enough.
      ok(Math.abs(bboxComp.getX1() - box[0]) < 0.01, `Bad X1: ${bboxComp.getX1()}`);
      ok(Math.abs(bboxComp.getY1() - box[1]) < 0.01, `Bad Y1: ${bboxComp.getY1()}`);
      ok(Math.abs(bboxComp.width() - box[2]) < 0.01, `Bad width: ${bboxComp.width()}`);
      ok(Math.abs(bboxComp.height() - box[3]) < 0.01, `Bad height: ${bboxComp.height()}`);

      ok(Math.abs(bbox.getX() - box[0]) < 0.01, `Bad X: ${bbox.getX()}`);
      ok(Math.abs(bbox.getY() - box[1]) < 0.01, `Bad Y: ${bbox.getY()}`);
      ok(Math.abs(bbox.getW() - box[2]) < 0.01, `Bad W: ${bbox.getW()}`);
      ok(Math.abs(bbox.getH() - box[3]) < 0.01, `Bad H: ${bbox.getH()}`);
    },
  };

  return BoundingBoxComputation;
})();
VF.Test.BoundingBoxComputation = BoundingBoxComputationTests;
export { BoundingBoxComputationTests };

