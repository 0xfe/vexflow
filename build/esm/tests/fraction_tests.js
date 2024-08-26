import { VexFlowTests } from './vexflow_test_helpers.js';
import { Fraction } from '../src/fraction.js';
const FractionTests = {
    Start() {
        QUnit.module('Fraction');
        QUnit.test('Basic', basic);
        QUnit.test('With Other Fractions', withOtherFractions);
    },
};
function basic(assert) {
    const f_1_2 = new Fraction(1, 2);
    assert.ok(f_1_2.equals(0.5), 'Fraction: 1/2 equals 0.5');
    assert.ok(f_1_2.equals(new Fraction(1, 2)), 'Fraction: 1/2 equals 1/2');
    assert.ok(f_1_2.equals(new Fraction(2, 4)), 'Fraction: 1/2 equals 2/4');
    assert.notOk(f_1_2.greaterThan(1), 'Fraction: ! 1/2 > 1');
    assert.ok(f_1_2.greaterThan(0.2), 'Fraction: 1/2 > 0.2');
    assert.ok(f_1_2.greaterThanEquals(0.2), 'Fraction: 1/2 >= 0.2');
    assert.ok(f_1_2.greaterThanEquals(0.5), 'Fraction: 1/2 >= 0.5');
    assert.notOk(f_1_2.greaterThanEquals(1), 'Fraction: ! 1/2 >= 1');
    assert.notOk(f_1_2.lessThan(0.5), 'Fraction: ! 1/2 < 0.5');
    assert.ok(f_1_2.lessThan(1), 'Fraction: 1/2 < 1');
    assert.ok(f_1_2.lessThanEquals(0.6), 'Fraction: 1/2 <= 0.6');
    assert.ok(f_1_2.lessThanEquals(0.5), 'Fraction: 1/2 <= 0.5');
    assert.notOk(f_1_2.lessThanEquals(0.4), 'Fraction: ! 1/2 <= 0.4');
    const f_05 = f_1_2.copy(0.5);
    assert.strictEqual(f_05, f_1_2, 'Fraction: f_05 === f_1_2');
    assert.strictEqual(f_05.toString(), '0.5/1', 'Fraction: f_05.toString() === "0.5/1"');
    assert.strictEqual(f_05.toSimplifiedString(), '1/2', 'Fraction: f_05.toSimplifiedString() === "1/2"');
    const tF_n = f_05.clone();
    assert.notStrictEqual(tF_n, f_05, 'Fraction: tF_n !== f_05');
    assert.notEqual(tF_n, f_05, 'Fraction: tF_n != f_05');
    assert.deepEqual(tF_n, f_05, 'tF_n deepEqual f_05');
    assert.notDeepEqual(tF_n, {}, 'tF_n notDeepEqual {}');
    tF_n.subtract(-0.5);
    assert.ok(tF_n.equals(1), 'Fraction: 0.5 -(-0.5) equals 1');
    tF_n.add(1);
    assert.ok(tF_n.equals(2), 'Fraction: 1 + 1 equals 2');
    tF_n.multiply(2);
    assert.ok(tF_n.equals(4), 'Fraction: 2 * 2 equals 4');
    tF_n.divide(2);
    assert.ok(tF_n.equals(2), 'Fraction: 4 / 2 equals 2');
    assert.equal(Fraction.LCMM([]), 0);
    assert.equal(Fraction.LCMM([17]), 17);
    assert.equal(Fraction.LCMM([2, 5]), 10);
    assert.equal(Fraction.LCMM([15, 3, 5]), 15);
    assert.equal(Fraction.LCMM([2, 4, 6]), 12);
    assert.equal(Fraction.LCMM([2, 3, 4, 5]), 60);
    assert.equal(Fraction.LCMM([12, 15, 10, 75]), 300);
    assert.equal(Fraction.GCD(0, 0), 0);
    assert.equal(Fraction.GCD(0, 99), 99);
    assert.equal(Fraction.GCD(77, 0), 77);
    assert.equal(Fraction.GCD(42, 14), 14);
    assert.equal(Fraction.GCD(15, 10), 5);
}
function withOtherFractions(assert) {
    const f_1_2 = new Fraction(1, 2);
    const f_1_4 = new Fraction(1, 4);
    const f_1_8 = new Fraction(1, 8);
    const f_2 = new Fraction(2, 1);
    const a = f_1_2.clone().multiply(f_1_2);
    assert.ok(a.equals(f_1_4), '1/2 x 1/2 == 1/4');
    const b = f_1_2.clone().divide(f_1_4);
    assert.ok(b.equals(f_2), '1/2 / 1/4 == 2');
    const c = f_2.clone().subtract(f_1_2).subtract(f_1_2).subtract(f_1_4);
    const d = f_1_8.clone().add(f_1_8).add(f_1_8).multiply(f_2);
    assert.ok(c.equals(d), '2-1/2-1/2-1/4 == (1/8+1/8+1/8)*(2/1)');
    assert.equal(c.value(), 0.75, '3/4 == 0.75');
    const e = f_1_8.clone().add(f_1_4).add(f_1_8);
    assert.ok(e.equals(f_1_2), '1/8 + 1/4 + 1/8 == 1/2');
}
VexFlowTests.register(FractionTests);
export { FractionTests };
