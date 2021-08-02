// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//

/* eslint-disable */

// Declarations to interface with ./qunit.js
//
// We are currently using QUnit 1.19.0.
//
// According to https://qunitjs.com/upgrade-guide-2.x/
// QUnit 2 no longer uses global functions. The assertion methods
// are exposed through an assert object that is bound to each test.
//
// However, we stick with the global methods for readability.
declare const global: any;
export const QUnit = global.QUnit;
export const module = global.module;
export const test = global.test;
export const expect = global.expect;
export const ok = global.ok;
export const notOk = global.notOk;
export const equal = global.equal;
export const notEqual = global.notEqual;
export const deepEqual = global.deepEqual;
export const notDeepEqual = global.notDeepEqual;
export const strictEqual = global.strictEqual;
export const notStrictEqual = global.notStrictEqual;
export const propEqual = global.propEqual;
export const throws = global.throws;

// See: https://api.qunitjs.com/assert/
export interface Assert {
  test: any;
  expect(amount: number): void;
  ok(state: any, message?: string): void;
  notOk(state: any, message?: string): void;
  equal(actual: any, expected: any, message?: string): void;
  notEqual(actual: any, expected: any, message?: string): void;
  deepEqual<T>(actual: T, expected: T, message?: string): void;
  notDeepEqual(actual: any, expected: any, message?: string): void;
  strictEqual<T>(actual: T, expected: T, message?: string): void;
  notStrictEqual(actual: any, expected: any, message?: string): void;
  true(state: any, message?: string): void;
  false(state: any, message?: string): void;
  propEqual(actual: any, expected: any, message?: string): void;
  notPropEqual(actual: any, expected: any, message?: string): void;
  async(acceptCallCount?: number): () => void;
  pushResult(assertResult: { result: boolean; actual: any; expected: any; message: string }): void;
  rejects(promise: Promise<any>, message?: string): Promise<void>;
  rejects(promise: Promise<any>, expectedMatcher?: any, message?: string): Promise<void>;
  step(message: string): void;
  verifySteps(steps: string[], message?: string): void;
  throws(block: () => void, expected?: any, message?: any): void;
  raises(block: () => void, expected?: any, message?: any): void;
}
