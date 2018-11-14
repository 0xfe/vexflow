/**
 * VexFlow - Fraction Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Fraction = (function() {
  var Fraction = {
    Start: function() {
      QUnit.module('Fraction');
      test('Basic', VF.Test.Fraction.basic);
    },

    basic: function() {
      var f_1_2 = new Vex.Flow.Fraction(1, 2);
      ok(f_1_2.equals(0.5), 'Fracetion: 1/2 equals 0.5');
      ok(f_1_2.equals(new Vex.Flow.Fraction(1, 2)), 'Fracetion: 1/2 equals 1/2');
      ok(f_1_2.equals(new Vex.Flow.Fraction(2, 4)), 'Fracetion: 1/2 equals 2/4');

      notOk(f_1_2.greaterThan(1), 'Fracetion: ! 1/2 > 1');
      ok(f_1_2.greaterThan(0.2), 'Fracetion: 1/2 > 0.2');

      ok(f_1_2.greaterThanEquals(0.2), 'Fracetion: 1/2 >= 0.2');
      ok(f_1_2.greaterThanEquals(0.5), 'Fracetion: 1/2 >= 0.5');
      notOk(f_1_2.greaterThanEquals(1), 'Fracetion: ! 1/2 >= 1');

      notOk(f_1_2.lessThan(0.5), 'Fracetion: ! 1/2 < 0.5');
      ok(f_1_2.lessThan(1), 'Fracetion: 1/2 < 1');

      ok(f_1_2.lessThanEquals(0.6), 'Fracetion: 1/2 <= 0.6');
      ok(f_1_2.lessThanEquals(0.5), 'Fracetion: 1/2 <= 0.5');
      notOk(f_1_2.lessThanEquals(0.4), 'Fracetion: ! 1/2 <= 0.4');

      var f_05 = f_1_2.copy(0.5);
      strictEqual(f_05, f_1_2, 'Fracetion: f_05 === f_1_2');
      strictEqual(f_05.toString(), '0.5/1', 'Fracetion: f_05.toString() === "0.5/1"');
      strictEqual(f_05.toSimplifiedString(), '1/2', 'Fracetion: f_05.toSimplifiedString() === "1/2"');

      var tF_n = f_05.clone();
      notStrictEqual(tF_n, f_05, 'Fracetion: tF_n !== f_05');
      notEqual(tF_n, f_05, 'Fracetion: tF_n != f_05');
      deepEqual(tF_n, f_05, 'tF_n deepEqual f_05');
      notDeepEqual(tF_n, {}, 'tF_n notDeepEqual {}');

      tF_n.subtract(-0.5);
      ok(tF_n.equals(1), 'Fracetion: 0.5 -(-0.5) equals 1');
      tF_n.add(1);
      ok(tF_n.equals(2), 'Fracetion: 1 + 1 equals 2');
      tF_n.multiply(2);
      ok(tF_n.equals(4), 'Fracetion: 2 * 2 equals 4');
      tF_n.divide(2);
      ok(tF_n.equals(2), 'Fracetion: 4 / 2 equals 2');

      // TODO: Add more detailed tests.
    },

  };

  return Fraction;
})();
