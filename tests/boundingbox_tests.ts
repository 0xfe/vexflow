// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Bounding Box Tests

import { VexFlowTests } from './vexflow_test_helpers';

import { BoundingBox } from '../src/index';

const BoundingBoxTests = {
  Start(): void {
    QUnit.module('BoundingBox');
    QUnit.test('Initialization Test', initialization);
    QUnit.test('Merging Text', merging);
  },
};

function initialization(assert: Assert): void {
  const bb = new BoundingBox(4, 5, 6, 7);
  assert.equal(bb.getX(), 4, 'Bad X');
  assert.equal(bb.getY(), 5, 'Bad Y');
  assert.equal(bb.getW(), 6, 'Bad W');
  assert.equal(bb.getH(), 7, 'Bad H');

  bb.setX(5);
  assert.equal(bb.getX(), 5, 'Bad X');
}

function merging(assert: Assert): void {
  const tests = [
    {
      type: 'Intersection',
      bb1: new BoundingBox(10, 10, 10, 10),
      bb2: new BoundingBox(15, 20, 10, 10),
      merged: new BoundingBox(10, 10, 15, 20),
    },
    {
      type: '1 contains 2',
      bb1: new BoundingBox(10, 10, 30, 30),
      bb2: new BoundingBox(15, 15, 10, 10),
      merged: new BoundingBox(10, 10, 30, 30),
    },
    {
      type: '2 contains 1',
      bb1: new BoundingBox(15, 15, 10, 10),
      bb2: new BoundingBox(10, 10, 30, 30),
      merged: new BoundingBox(10, 10, 30, 30),
    },
  ];

  tests.forEach((test) => {
    const type = test.type;
    const bb1 = test.bb1;
    const bb2 = test.bb2;
    const merged = test.merged;

    bb1.mergeWith(bb2);
    assert.equal(bb1.getX(), merged.getX(), type + ' - Bad X');
    assert.equal(bb1.getY(), merged.getY(), type + ' - Bad Y');
    assert.equal(bb1.getW(), merged.getW(), type + ' - Bad W');
    assert.equal(bb1.getH(), merged.getH(), type + ' - Bad H');
  });
}

VexFlowTests.register(BoundingBoxTests);
export { BoundingBoxTests };
