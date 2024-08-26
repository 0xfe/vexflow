import { VexFlowTests } from './vexflow_test_helpers.js';
import { KeyManager } from '../src/keymanager.js';
import { Music } from '../src/music.js';
const MusicTests = {
    Start() {
        QUnit.module('MusicTests');
        QUnit.test('Valid Notes', validNotes);
        QUnit.test('Valid Keys', validKeys);
        QUnit.test('Note Values', noteValue);
        QUnit.test('Interval Values', intervalValue);
        QUnit.test('Relative Notes', relativeNotes);
        QUnit.test('Relative Note Names', relativeNoteNames);
        QUnit.test('Canonical Notes', canonicalNotes);
        QUnit.test('Canonical Intervals', canonicalIntervals);
        QUnit.test('Scale Tones', scaleTones);
        QUnit.test('Scale Intervals', scaleIntervals);
    },
};
function validNotes(assert) {
    assert.expect(10);
    const music = new Music();
    let parts = music.getNoteParts('c');
    assert.equal(parts.root, 'c');
    assert.equal(parts.accidental, null);
    parts = music.getNoteParts('C');
    assert.equal(parts.root, 'c');
    assert.equal(parts.accidental, null);
    parts = music.getNoteParts('c#');
    assert.equal(parts.root, 'c');
    assert.equal(parts.accidental, '#');
    parts = music.getNoteParts('c##');
    assert.equal(parts.root, 'c');
    assert.equal(parts.accidental, '##');
    assert.throws(() => music.getNoteParts('r'), /BadArguments/, 'Invalid note: r');
    assert.throws(() => music.getNoteParts(''), /BadArguments/, "Invalid note: ''");
}
function validKeys(assert) {
    assert.expect(18);
    const music = new Music();
    let parts = music.getKeyParts('c');
    assert.equal(parts.root, 'c');
    assert.equal(parts.accidental, null);
    assert.equal(parts.type, 'M');
    parts = music.getKeyParts('d#');
    assert.equal(parts.root, 'd');
    assert.equal(parts.accidental, '#');
    assert.equal(parts.type, 'M');
    parts = music.getKeyParts('fbm');
    assert.equal(parts.root, 'f');
    assert.equal(parts.accidental, 'b');
    assert.equal(parts.type, 'm');
    parts = music.getKeyParts('c#mel');
    assert.equal(parts.root, 'c');
    assert.equal(parts.accidental, '#');
    assert.equal(parts.type, 'mel');
    parts = music.getKeyParts('g#harm');
    assert.equal(parts.root, 'g');
    assert.equal(parts.accidental, '#');
    assert.equal(parts.type, 'harm');
    assert.throws(() => music.getKeyParts('r'), /BadArguments/, 'Invalid key: r');
    assert.throws(() => music.getKeyParts(''), /BadArguments/, `Invalid key: ''`);
    assert.throws(() => music.getKeyParts('#m'), /BadArguments/, 'Invalid key: #m');
}
function noteValue(assert) {
    assert.expect(3);
    const music = new Music();
    let note = music.getNoteValue('c');
    assert.equal(note, 0);
    assert.throws(() => music.getNoteValue('r'), /BadArguments/, 'Invalid note name');
    note = music.getNoteValue('f#');
    assert.equal(note, 6);
}
function intervalValue(assert) {
    assert.expect(2);
    const music = new Music();
    const value = music.getIntervalValue('b2');
    assert.equal(value, 1);
    assert.throws(() => music.getIntervalValue('7'), /BadArguments/, 'Invalid interval name');
}
function relativeNotes(assert) {
    assert.expect(8);
    const music = new Music();
    let value = music.getRelativeNoteValue(music.getNoteValue('c'), music.getIntervalValue('b5'));
    assert.equal(value, 6);
    assert.throws(() => music.getRelativeNoteValue(music.getNoteValue('bc'), music.getIntervalValue('b2')), /BadArguments/, 'Invalid note');
    assert.throws(() => music.getRelativeNoteValue(music.getNoteValue('b'), music.getIntervalValue('p3')), /BadArguments/, 'Invalid interval');
    value = music.getRelativeNoteValue(music.getNoteValue('d'), music.getIntervalValue('2'), -1);
    assert.equal(value, 0);
    assert.throws(() => music.getRelativeNoteValue(music.getNoteValue('b'), music.getIntervalValue('p4'), 0), /BadArguments/, 'Invalid direction: 0');
    value = music.getRelativeNoteValue(music.getNoteValue('b'), music.getIntervalValue('b5'));
    assert.equal(value, 5);
    value = music.getRelativeNoteValue(music.getNoteValue('c'), music.getIntervalValue('b2'), -1);
    assert.equal(value, 11);
    value = music.getRelativeNoteValue(music.getNoteValue('g'), music.getIntervalValue('p5'));
    assert.equal(value, 2);
}
function relativeNoteNames(assert) {
    assert.expect(9);
    const music = new Music();
    assert.equal(music.getRelativeNoteName('b', music.getNoteValue('c#')), 'b##');
    assert.equal(music.getRelativeNoteName('c', music.getNoteValue('c')), 'c');
    assert.equal(music.getRelativeNoteName('c', music.getNoteValue('db')), 'c#');
    assert.equal(music.getRelativeNoteName('c', music.getNoteValue('b')), 'cb');
    assert.equal(music.getRelativeNoteName('c#', music.getNoteValue('db')), 'c#');
    assert.equal(music.getRelativeNoteName('e', music.getNoteValue('f#')), 'e##');
    assert.equal(music.getRelativeNoteName('e', music.getNoteValue('d#')), 'eb');
    assert.equal(music.getRelativeNoteName('e', music.getNoteValue('fb')), 'e');
    assert.throws(() => music.getRelativeNoteName('e', music.getNoteValue('g#')), /BadArguments/, 'Too far away. Notes not related.');
}
function canonicalNotes(assert) {
    assert.expect(3);
    const music = new Music();
    assert.equal(music.getCanonicalNoteName(0), 'c');
    assert.equal(music.getCanonicalNoteName(2), 'd');
    assert.throws(() => music.getCanonicalNoteName(-1), /BadArguments/, 'Invalid note value');
}
function canonicalIntervals(assert) {
    assert.expect(3);
    const music = new Music();
    assert.equal(music.getCanonicalIntervalName(0), 'unison');
    assert.equal(music.getCanonicalIntervalName(2), 'M2');
    assert.throws(() => music.getCanonicalIntervalName(-1), /BadArguments/, 'Invalid interval value');
}
function scaleTones(assert) {
    assert.expect(24);
    const music = new Music();
    const manager = new KeyManager('CM');
    const c_major = music.getScaleTones(music.getNoteValue('c'), Music.scales.major);
    let values = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    assert.equal(c_major.length, 7);
    for (let i = 0; i < c_major.length; ++i) {
        assert.equal(music.getCanonicalNoteName(c_major[i]), values[i]);
    }
    const c_dorian = music.getScaleTones(music.getNoteValue('c'), Music.scales.dorian);
    values = ['c', 'd', 'eb', 'f', 'g', 'a', 'bb'];
    let note = null;
    assert.equal(c_dorian.length, 7);
    for (let i = 0; i < c_dorian.length; ++i) {
        note = music.getCanonicalNoteName(c_dorian[i]);
        assert.equal(manager.selectNote(note).note, values[i]);
    }
    const c_mixolydian = music.getScaleTones(music.getNoteValue('c'), Music.scales.mixolydian);
    values = ['c', 'd', 'e', 'f', 'g', 'a', 'bb'];
    assert.equal(c_mixolydian.length, 7);
    for (let i = 0; i < c_mixolydian.length; ++i) {
        note = music.getCanonicalNoteName(c_mixolydian[i]);
        assert.equal(manager.selectNote(note).note, values[i]);
    }
}
function scaleIntervals(assert) {
    assert.expect(6);
    const m = new Music();
    assert.equal(m.getCanonicalIntervalName(m.getIntervalBetween(m.getNoteValue('c'), m.getNoteValue('d'))), 'M2');
    assert.equal(m.getCanonicalIntervalName(m.getIntervalBetween(m.getNoteValue('g'), m.getNoteValue('c'))), 'p4');
    assert.equal(m.getCanonicalIntervalName(m.getIntervalBetween(m.getNoteValue('c'), m.getNoteValue('c'))), 'unison');
    assert.equal(m.getCanonicalIntervalName(m.getIntervalBetween(m.getNoteValue('f'), m.getNoteValue('cb'))), 'dim5');
    assert.equal(m.getCanonicalIntervalName(m.getIntervalBetween(m.getNoteValue('d'), m.getNoteValue('c'), 1)), 'b7');
    assert.equal(m.getCanonicalIntervalName(m.getIntervalBetween(m.getNoteValue('d'), m.getNoteValue('c'), -1)), 'M2');
}
VexFlowTests.register(MusicTests);
export { MusicTests };
