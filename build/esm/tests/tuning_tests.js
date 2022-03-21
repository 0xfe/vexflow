import { VexFlowTests } from './vexflow_test_helpers.js';
import { Tuning } from '../src/tuning.js';
const TuningTests = {
    Start() {
        QUnit.module('Tuning');
        test('Standard Tuning', standard);
        test('Standard Banjo Tuning', banjo);
        test('Return note for fret', noteForFret);
    },
};
function checkStandard(tuning) {
    throws(() => tuning.getValueForString(0), /BadArguments/, 'String 0');
    throws(() => tuning.getValueForString(9), /BadArguments/, 'String 9');
    equal(tuning.getValueForString(6), 40, 'Low E string');
    equal(tuning.getValueForString(5), 45, 'A string');
    equal(tuning.getValueForString(4), 50, 'D string');
    equal(tuning.getValueForString(3), 55, 'G string');
    equal(tuning.getValueForString(2), 59, 'B string');
    equal(tuning.getValueForString(1), 64, 'High E string');
}
function checkStandardBanjo(tuning) {
    throws(() => tuning.getValueForString(0), /BadArguments/, 'String 0');
    throws(() => tuning.getValueForString(6), /BadArguments/, 'String 6');
    equal(tuning.getValueForString(5), 67, 'High G string');
    equal(tuning.getValueForString(4), 50, 'D string');
    equal(tuning.getValueForString(3), 55, 'G string');
    equal(tuning.getValueForString(2), 59, 'B string');
    equal(tuning.getValueForString(1), 62, 'High D string');
}
function standard() {
    expect(16);
    const tuning = new Tuning();
    checkStandard(tuning);
    tuning.setTuning('standard');
    checkStandard(tuning);
}
function banjo() {
    expect(7);
    const tuning = new Tuning();
    tuning.setTuning('standardBanjo');
    checkStandardBanjo(tuning);
}
function noteForFret() {
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
