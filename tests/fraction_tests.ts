// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Fraction Tests

import { VexFlowTests } from './vexflow_test_helpers';

import { Fraction } from '../src/fraction';

const FractionTests = {
  Start(): void {
    QUnit.module('Fraction');
    test('Basic', basic);
    test('With Other Fractions', withOtherFractions);
  },
};

function basic(): void {
  const f_1_2 = new Fraction(1, 2);
  ok(f_1_2.equals(0.5), 'Fraction: 1/2 equals 0.5');
  ok(f_1_2.equals(new Fraction(1, 2)), 'Fraction: 1/2 equals 1/2');
  ok(f_1_2.equals(new Fraction(2, 4)), 'Fraction: 1/2 equals 2/4');

  notOk(f_1_2.greaterThan(1), 'Fraction: ! 1/2 > 1');
  ok(f_1_2.greaterThan(0.2), 'Fraction: 1/2 > 0.2');

  ok(f_1_2.greaterThanEquals(0.2), 'Fraction: 1/2 >= 0.2');
  ok(f_1_2.greaterThanEquals(0.5), 'Fraction: 1/2 >= 0.5');
  notOk(f_1_2.greaterThanEquals(1), 'Fraction: ! 1/2 >= 1');

  notOk(f_1_2.lessThan(0.5), 'Fraction: ! 1/2 < 0.5');
  ok(f_1_2.lessThan(1), 'Fraction: 1/2 < 1');

  ok(f_1_2.lessThanEquals(0.6), 'Fraction: 1/2 <= 0.6');
  ok(f_1_2.lessThanEquals(0.5), 'Fraction: 1/2 <= 0.5');
  notOk(f_1_2.lessThanEquals(0.4), 'Fraction: ! 1/2 <= 0.4');

  const f_05 = f_1_2.copy(0.5);
  strictEqual(f_05, f_1_2, 'Fraction: f_05 === f_1_2');
  strictEqual(f_05.toString(), '0.5/1', 'Fraction: f_05.toString() === "0.5/1"');
  strictEqual(f_05.toSimplifiedString(), '1/2', 'Fraction: f_05.toSimplifiedString() === "1/2"');

  const tF_n = f_05.clone();
  notStrictEqual(tF_n, f_05, 'Fraction: tF_n !== f_05');
  notEqual(tF_n, f_05, 'Fraction: tF_n != f_05');
  deepEqual(tF_n, f_05, 'tF_n deepEqual f_05');
  notDeepEqual(tF_n, {}, 'tF_n notDeepEqual {}');

  tF_n.subtract(-0.5);
  ok(tF_n.equals(1), 'Fraction: 0.5 -(-0.5) equals 1');
  tF_n.add(1);
  ok(tF_n.equals(2), 'Fraction: 1 + 1 equals 2');
  tF_n.multiply(2);
  ok(tF_n.equals(4), 'Fraction: 2 * 2 equals 4');
  tF_n.divide(2);
  ok(tF_n.equals(2), 'Fraction: 4 / 2 equals 2');

  // Lowest common multiple.
  equal(Fraction.LCMM([]), 0);
  equal(Fraction.LCMM([17]), 17);
  equal(Fraction.LCMM([2, 5]), 10);
  equal(Fraction.LCMM([15, 3, 5]), 15);
  equal(Fraction.LCMM([2, 4, 6]), 12);
  equal(Fraction.LCMM([2, 3, 4, 5]), 60);
  equal(Fraction.LCMM([12, 15, 10, 75]), 300);

  // Greatest common divisor.
  equal(Fraction.GCD(0, 0), 0);
  equal(Fraction.GCD(0, 99), 99);
  equal(Fraction.GCD(77, 0), 77);
  equal(Fraction.GCD(42, 14), 14);
  equal(Fraction.GCD(15, 10), 5);
}

function withOtherFractions(): void {
  const f_1_2 = new Fraction(1, 2);
  const f_1_4 = new Fraction(1, 4);
  const f_1_8 = new Fraction(1, 8);
  const f_2 = new Fraction(2, 1);

  // IMPORTANT NOTE: Fraction methods modify the existing Fraction object.
  // They do not return new objects.
  // Use clone() if you don't want to modify the original object.
  const a = f_1_2.clone().multiply(f_1_2);
  ok(a.equals(f_1_4), '1/2 x 1/2 == 1/4');

  const b = f_1_2.clone().divide(f_1_4);
  ok(b.equals(f_2), '1/2 / 1/4 == 2');

  const c = f_2.clone().subtract(f_1_2).subtract(f_1_2).subtract(f_1_4); // 3/4
  const d = f_1_8.clone().add(f_1_8).add(f_1_8).multiply(f_2);
  ok(c.equals(d), '2-1/2-1/2-1/4 == (1/8+1/8+1/8)*(2/1)');
  equal(c.value(), 0.75, '3/4 == 0.75');

  const e = f_1_8.clone().add(f_1_4).add(f_1_8);
  ok(e.equals(f_1_2), '1/8 + 1/4 + 1/8 == 1/2');
}

VexFlowTests.register(FractionTests);
export { FractionTests };
