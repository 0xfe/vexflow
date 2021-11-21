// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//

/* eslint-disable */

// Declarations to interface with qunit.js
// We are currently using QUnit 1.19.0.
//
// QUnit 2 no longer uses global functions. The assertion methods
// are exposed through an assert object that is bound to each test.
// See: https://qunitjs.com/upgrade-guide-2.x/
//
// However, we stick with the global methods for readability.

// Let the TS compiler know that QUnit and its related functions are available globally.
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#global-augmentation
declare global {
  // See: https://api.qunitjs.com/QUnit/
  const QUnit: {
    module: (name: string) => void;
    test: typeof test;

    // generate_png_images.js and vexflow_test_helpers.ts
    // use these two fields to pass the name of the current module and test.
    current_module: string;
    current_test: string;
  };

  const test: (name: string, callback: (assert: Assert) => void) => void;
  const expect: (amount: number) => void;
  const ok: (state: any, message?: string) => void;
  const notOk: (state: any, message?: string) => void;
  const equal: (actual: any, expected: any, message?: string) => void;
  const notEqual: (actual: any, expected: any, message?: string) => void;
  const deepEqual: (actual: any, expected: any, message?: string) => void;
  const notDeepEqual: (actual: any, expected: any, message?: string) => void;
  const strictEqual: (actual: any, expected: any, message?: string) => void;
  const notStrictEqual: (actual: any, expected: any, message?: string) => void;
  const propEqual: (actual: any, expected: any, message?: string) => void;
  const notPropEqual: (actual: any, expected: any, message?: string) => void;
  const throws: (blockFn: () => any, expectedMatcher?: any, message?: string) => void;
  const raises: (blockFn: () => any, expectedMatcher?: any, message?: string) => void; // alias for throws
  const step: (message?: string) => void;
  const verifySteps: (steps: string[], message?: string) => void;
}

/**
 * QUnit.test(name, callback) passes an Assert object to the callback.
 * This object contains the testContext and also provides access to
 * all the QUnit assertion methods (See: https://api.qunitjs.com/assert/).
 */
export interface Assert {
  /**
   * The current testContext. See line 1238 of qunit.js.
   * It has properties like module, testName, assert, and more.
   * `vexflow_test_helpers.ts` stores the module name into this object.
   */
  test: any;

  expect: typeof expect;
  ok: typeof ok;
  notOk: typeof notOk;
  equal: typeof equal;
  notEqual: typeof notEqual;
  deepEqual: typeof deepEqual;
  notDeepEqual: typeof notDeepEqual;
  strictEqual: typeof strictEqual;
  notStrictEqual: typeof notStrictEqual;
  propEqual: typeof propEqual;
  notPropEqual: typeof notPropEqual;
  throws: typeof throws;
  raises: typeof raises;
  step: typeof step;
  verifySteps: typeof verifySteps;
}
