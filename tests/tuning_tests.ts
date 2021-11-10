// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Tuning Tests

import { VexFlowTests } from './vexflow_test_helpers';

import { Tuning } from '../src/tuning';

const TuningTests = {
  Start(): void {
    QUnit.module('Tuning');
    test('Standard Tuning', standard);
    test('Standard Banjo Tuning', banjo);
    test('Return note for fret', noteForFret);
  },
};

/**
 * Helper function to verify that the provided tuning matches a standard 6-string guitar.
 */
function checkStandard(tuning: Tuning): void {
  throws(() => tuning.getValueForString(0), /BadArguments/, 'String 0');
  throws(() => tuning.getValueForString(9), /BadArguments/, 'String 9');
  // TODO: Tuning constructor has a bug in that the default tuning has 8 strings.
  // See: 'E/5,B/4,G/4,D/4,A/3,E/3,B/2,E/2' in tuning.ts constructor.
  // throws(() => tuning.getValueForString(7), /BadArguments/, 'String 7');

  // Tuning.getValueForString() returns a note number where the value 60 corresponds to middle C.
  equal(tuning.getValueForString(6), 40, 'Low E string');
  equal(tuning.getValueForString(5), 45, 'A string');
  equal(tuning.getValueForString(4), 50, 'D string');
  equal(tuning.getValueForString(3), 55, 'G string');
  equal(tuning.getValueForString(2), 59, 'B string');
  equal(tuning.getValueForString(1), 64, 'High E string');
}

/**
 * Helper function to verify that the provided tuning matches a standard 5-string banjo.
 */
function checkStandardBanjo(tuning: Tuning): void {
  throws(() => tuning.getValueForString(0), /BadArguments/, 'String 0');
  throws(() => tuning.getValueForString(6), /BadArguments/, 'String 6');

  equal(tuning.getValueForString(5), 67, 'High G string');
  equal(tuning.getValueForString(4), 50, 'D string');
  equal(tuning.getValueForString(3), 55, 'G string');
  equal(tuning.getValueForString(2), 59, 'B string');
  equal(tuning.getValueForString(1), 62, 'High D string');
}

function standard(): void {
  expect(16);

  const tuning = new Tuning();
  checkStandard(tuning);

  // Set the tuning by specifying a name: 'standard'.
  tuning.setTuning('standard');
  checkStandard(tuning);
}

function banjo(): void {
  expect(7);

  const tuning = new Tuning();
  tuning.setTuning('standardBanjo');
  checkStandardBanjo(tuning);
}

function noteForFret(): void {
  expect(8);
  const tuning = new Tuning('E/5,B/4,G/4,D/4,A/3,E/3');
  throws(() => tuning.getNoteForFret(-1, 1), /BadArguments/, 'Fret = -1');
  throws(() => tuning.getNoteForFret(1, -1), /BadArguments/, 'String = -1');

  equal(tuning.getNoteForFret(0, 1), 'E/5', 'High E string');
  equal(tuning.getNoteForFret(5, 1), 'A/5', 'High E string, fret 5');
  equal(tuning.getNoteForFret(0, 2), 'B/4', 'B string');
  equal(tuning.getNoteForFret(0, 3), 'G/4', 'G string');
  equal(tuning.getNoteForFret(12, 2), 'B/5', 'B string, fret 12');
  equal(tuning.getNoteForFret(0, 6), 'E/3', 'Low E string');
}

VexFlowTests.register(TuningTests);
export { TuningTests };
