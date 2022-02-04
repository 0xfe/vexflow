// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

/* eslint-disable key-spacing */

import { ArticulationStruct } from './articulation';
import { Font } from './font';
import { Fraction } from './fraction';
import { Glyph } from './glyph';
import { RuntimeError } from './util';

const RESOLUTION = 16384;

/**
 * Map duration numbers to 'ticks', the unit of duration used throughout VexFlow.
 * For example, a quarter note is 4, so it maps to RESOLUTION / 4 = 4096 ticks.
 */
const durations: Record<string, number> = {
  '1/2': RESOLUTION * 2,
  1: RESOLUTION / 1,
  2: RESOLUTION / 2,
  4: RESOLUTION / 4,
  8: RESOLUTION / 8,
  16: RESOLUTION / 16,
  32: RESOLUTION / 32,
  64: RESOLUTION / 64,
  128: RESOLUTION / 128,
  256: RESOLUTION / 256,
};

const durationAliases: Record<string, string> = {
  w: '1',
  h: '2',
  q: '4',

  // This is the default duration used to render bars (BarNote). Bars no longer
  // consume ticks, so this should be a no-op.
  // TODO(0xfe): This needs to be cleaned up.
  b: '256',
};

const keySignatures: Record<string, { acc?: string; num: number }> = {
  C: { num: 0 },
  Am: { num: 0 },
  F: { acc: 'b', num: 1 },
  Dm: { acc: 'b', num: 1 },
  Bb: { acc: 'b', num: 2 },
  Gm: { acc: 'b', num: 2 },
  Eb: { acc: 'b', num: 3 },
  Cm: { acc: 'b', num: 3 },
  Ab: { acc: 'b', num: 4 },
  Fm: { acc: 'b', num: 4 },
  Db: { acc: 'b', num: 5 },
  Bbm: { acc: 'b', num: 5 },
  Gb: { acc: 'b', num: 6 },
  Ebm: { acc: 'b', num: 6 },
  Cb: { acc: 'b', num: 7 },
  Abm: { acc: 'b', num: 7 },
  G: { acc: '#', num: 1 },
  Em: { acc: '#', num: 1 },
  D: { acc: '#', num: 2 },
  Bm: { acc: '#', num: 2 },
  A: { acc: '#', num: 3 },
  'F#m': { acc: '#', num: 3 },
  E: { acc: '#', num: 4 },
  'C#m': { acc: '#', num: 4 },
  B: { acc: '#', num: 5 },
  'G#m': { acc: '#', num: 5 },
  'F#': { acc: '#', num: 6 },
  'D#m': { acc: '#', num: 6 },
  'C#': { acc: '#', num: 7 },
  'A#m': { acc: '#', num: 7 },
};

const clefs: Record<string, { line_shift: number }> = {
  treble: { line_shift: 0 },
  bass: { line_shift: 6 },
  tenor: { line_shift: 4 },
  alto: { line_shift: 3 },
  soprano: { line_shift: 1 },
  percussion: { line_shift: 0 },
  'mezzo-soprano': { line_shift: 2 },
  'baritone-c': { line_shift: 5 },
  'baritone-f': { line_shift: 5 },
  subbass: { line_shift: 7 },
  french: { line_shift: -1 },
};

const notesInfo: Record<
  string,
  {
    index: number;
    int_val?: number;
    accidental?: string;
    rest?: boolean;
    octave?: number;
    code?: string;
    shift_right?: number;
  }
> = {
  C: { index: 0, int_val: 0 },
  CN: { index: 0, int_val: 0, accidental: 'n' },
  'C#': { index: 0, int_val: 1, accidental: '#' },
  'C##': { index: 0, int_val: 2, accidental: '##' },
  CB: { index: 0, int_val: 11, accidental: 'b' },
  CBB: { index: 0, int_val: 10, accidental: 'bb' },
  D: { index: 1, int_val: 2 },
  DN: { index: 1, int_val: 2, accidental: 'n' },
  'D#': { index: 1, int_val: 3, accidental: '#' },
  'D##': { index: 1, int_val: 4, accidental: '##' },
  DB: { index: 1, int_val: 1, accidental: 'b' },
  DBB: { index: 1, int_val: 0, accidental: 'bb' },
  E: { index: 2, int_val: 4 },
  EN: { index: 2, int_val: 4, accidental: 'n' },
  'E#': { index: 2, int_val: 5, accidental: '#' },
  'E##': { index: 2, int_val: 6, accidental: '##' },
  EB: { index: 2, int_val: 3, accidental: 'b' },
  EBB: { index: 2, int_val: 2, accidental: 'bb' },
  F: { index: 3, int_val: 5 },
  FN: { index: 3, int_val: 5, accidental: 'n' },
  'F#': { index: 3, int_val: 6, accidental: '#' },
  'F##': { index: 3, int_val: 7, accidental: '##' },
  FB: { index: 3, int_val: 4, accidental: 'b' },
  FBB: { index: 3, int_val: 3, accidental: 'bb' },
  G: { index: 4, int_val: 7 },
  GN: { index: 4, int_val: 7, accidental: 'n' },
  'G#': { index: 4, int_val: 8, accidental: '#' },
  'G##': { index: 4, int_val: 9, accidental: '##' },
  GB: { index: 4, int_val: 6, accidental: 'b' },
  GBB: { index: 4, int_val: 5, accidental: 'bb' },
  A: { index: 5, int_val: 9 },
  AN: { index: 5, int_val: 9, accidental: 'n' },
  'A#': { index: 5, int_val: 10, accidental: '#' },
  'A##': { index: 5, int_val: 11, accidental: '##' },
  AB: { index: 5, int_val: 8, accidental: 'b' },
  ABB: { index: 5, int_val: 7, accidental: 'bb' },
  B: { index: 6, int_val: 11 },
  BN: { index: 6, int_val: 11, accidental: 'n' },
  'B#': { index: 6, int_val: 12, accidental: '#' },
  'B##': { index: 6, int_val: 13, accidental: '##' },
  BB: { index: 6, int_val: 10, accidental: 'b' },
  BBB: { index: 6, int_val: 9, accidental: 'bb' },
  R: { index: 6, rest: true }, // Rest
  X: {
    index: 6,
    accidental: '',
    octave: 4,
    code: 'noteheadXBlack',
    shift_right: 5.5,
  },
};

const validNoteTypes: Record<string, { name: string }> = {
  n: { name: 'note' },
  r: { name: 'rest' },
  h: { name: 'harmonic' },
  m: { name: 'muted' },
  s: { name: 'slash' },
  g: { name: 'ghost' },
};

const customNoteHeads: Record<string, { code: string }> = {
  /* Diamond */
  D0: { code: 'noteheadDiamondWhole' },
  D1: { code: 'noteheadDiamondHalf' },
  D2: { code: 'noteheadDiamondBlack' },
  D3: { code: 'noteheadDiamondBlack' },

  /* Triangle */
  T0: { code: 'noteheadTriangleUpWhole' },
  T1: { code: 'noteheadTriangleUpHalf' },
  T2: { code: 'noteheadTriangleUpBlack' },
  T3: { code: 'noteheadTriangleUpBlack' },

  /* Cross */
  X0: { code: 'noteheadXWhole' },
  X1: { code: 'noteheadXHalf' },
  X2: { code: 'noteheadXBlack' },
  X3: { code: 'noteheadCircleX' },

  /* Square */
  S1: { code: 'noteheadSquareWhite' },
  S2: { code: 'noteheadSquareBlack' },

  /* Rectangle */
  R1: { code: 'vexNoteHeadRectWhite' }, // no smufl code
  R2: { code: 'vexNoteHeadRectBlack' }, // no smufl code
};

const accidentals: Record<string, { code: string; parenRightPaddingAdjustment: number }> = {
  '#': { code: 'accidentalSharp', parenRightPaddingAdjustment: -1 },
  '##': { code: 'accidentalDoubleSharp', parenRightPaddingAdjustment: -1 },
  b: { code: 'accidentalFlat', parenRightPaddingAdjustment: -2 },
  bb: { code: 'accidentalDoubleFlat', parenRightPaddingAdjustment: -2 },
  n: { code: 'accidentalNatural', parenRightPaddingAdjustment: -1 },
  '{': { code: 'accidentalParensLeft', parenRightPaddingAdjustment: -1 },
  '}': { code: 'accidentalParensRight', parenRightPaddingAdjustment: -1 },
  db: { code: 'accidentalThreeQuarterTonesFlatZimmermann', parenRightPaddingAdjustment: -1 },
  d: { code: 'accidentalQuarterToneFlatStein', parenRightPaddingAdjustment: 0 },
  '++': { code: 'accidentalThreeQuarterTonesSharpStein', parenRightPaddingAdjustment: -1 },
  '+': { code: 'accidentalQuarterToneSharpStein', parenRightPaddingAdjustment: -1 },
  '+-': { code: 'accidentalKucukMucennebSharp', parenRightPaddingAdjustment: -1 },
  bs: { code: 'accidentalBakiyeFlat', parenRightPaddingAdjustment: -1 },
  bss: { code: 'accidentalBuyukMucennebFlat', parenRightPaddingAdjustment: -1 },
  o: { code: 'accidentalSori', parenRightPaddingAdjustment: -1 },
  k: { code: 'accidentalKoron', parenRightPaddingAdjustment: -1 },
  bbs: { code: 'vexAccidentalMicrotonal1', parenRightPaddingAdjustment: -1 },
  '++-': { code: 'vexAccidentalMicrotonal2', parenRightPaddingAdjustment: -1 },
  ashs: { code: 'vexAccidentalMicrotonal3', parenRightPaddingAdjustment: -1 },
  afhf: { code: 'vexAccidentalMicrotonal4', parenRightPaddingAdjustment: -1 },
  accSagittal5v7KleismaUp: { code: 'accSagittal5v7KleismaUp', parenRightPaddingAdjustment: -1 },
  accSagittal5v7KleismaDown: { code: 'accSagittal5v7KleismaDown', parenRightPaddingAdjustment: -1 },
  accSagittal5CommaUp: { code: 'accSagittal5CommaUp', parenRightPaddingAdjustment: -1 },
  accSagittal5CommaDown: { code: 'accSagittal5CommaDown', parenRightPaddingAdjustment: -1 },
  accSagittal7CommaUp: { code: 'accSagittal7CommaUp', parenRightPaddingAdjustment: -1 },
  accSagittal7CommaDown: { code: 'accSagittal7CommaDown', parenRightPaddingAdjustment: -1 },
  accSagittal25SmallDiesisUp: { code: 'accSagittal25SmallDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal25SmallDiesisDown: { code: 'accSagittal25SmallDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittal35MediumDiesisUp: { code: 'accSagittal35MediumDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal35MediumDiesisDown: { code: 'accSagittal35MediumDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittal11MediumDiesisUp: { code: 'accSagittal11MediumDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal11MediumDiesisDown: { code: 'accSagittal11MediumDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittal11LargeDiesisUp: { code: 'accSagittal11LargeDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal11LargeDiesisDown: { code: 'accSagittal11LargeDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittal35LargeDiesisUp: { code: 'accSagittal35LargeDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal35LargeDiesisDown: { code: 'accSagittal35LargeDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp25SDown: { code: 'accSagittalSharp25SDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat25SUp: { code: 'accSagittalFlat25SUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp7CDown: { code: 'accSagittalSharp7CDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat7CUp: { code: 'accSagittalFlat7CUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5CDown: { code: 'accSagittalSharp5CDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5CUp: { code: 'accSagittalFlat5CUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5v7kDown: { code: 'accSagittalSharp5v7kDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5v7kUp: { code: 'accSagittalFlat5v7kUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp: { code: 'accSagittalSharp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat: { code: 'accSagittalFlat', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5v7kUp: { code: 'accSagittalSharp5v7kUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5v7kDown: { code: 'accSagittalFlat5v7kDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5CUp: { code: 'accSagittalSharp5CUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5CDown: { code: 'accSagittalFlat5CDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp7CUp: { code: 'accSagittalSharp7CUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat7CDown: { code: 'accSagittalFlat7CDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp25SUp: { code: 'accSagittalSharp25SUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat25SDown: { code: 'accSagittalFlat25SDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp35MUp: { code: 'accSagittalSharp35MUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat35MDown: { code: 'accSagittalFlat35MDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp11MUp: { code: 'accSagittalSharp11MUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat11MDown: { code: 'accSagittalFlat11MDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp11LUp: { code: 'accSagittalSharp11LUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat11LDown: { code: 'accSagittalFlat11LDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp35LUp: { code: 'accSagittalSharp35LUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat35LDown: { code: 'accSagittalFlat35LDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp25SDown: { code: 'accSagittalDoubleSharp25SDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat25SUp: { code: 'accSagittalDoubleFlat25SUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp7CDown: { code: 'accSagittalDoubleSharp7CDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat7CUp: { code: 'accSagittalDoubleFlat7CUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp5CDown: { code: 'accSagittalDoubleSharp5CDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat5CUp: { code: 'accSagittalDoubleFlat5CUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp5v7kDown: { code: 'accSagittalDoubleSharp5v7kDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat5v7kUp: { code: 'accSagittalDoubleFlat5v7kUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp: { code: 'accSagittalDoubleSharp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat: { code: 'accSagittalDoubleFlat', parenRightPaddingAdjustment: -1 },
  accSagittal7v11KleismaUp: { code: 'accSagittal7v11KleismaUp', parenRightPaddingAdjustment: -1 },
  accSagittal7v11KleismaDown: { code: 'accSagittal7v11KleismaDown', parenRightPaddingAdjustment: -1 },
  accSagittal17CommaUp: { code: 'accSagittal17CommaUp', parenRightPaddingAdjustment: -1 },
  accSagittal17CommaDown: { code: 'accSagittal17CommaDown', parenRightPaddingAdjustment: -1 },
  accSagittal55CommaUp: { code: 'accSagittal55CommaUp', parenRightPaddingAdjustment: -1 },
  accSagittal55CommaDown: { code: 'accSagittal55CommaDown', parenRightPaddingAdjustment: -1 },
  accSagittal7v11CommaUp: { code: 'accSagittal7v11CommaUp', parenRightPaddingAdjustment: -1 },
  accSagittal7v11CommaDown: { code: 'accSagittal7v11CommaDown', parenRightPaddingAdjustment: -1 },
  accSagittal5v11SmallDiesisUp: { code: 'accSagittal5v11SmallDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal5v11SmallDiesisDown: { code: 'accSagittal5v11SmallDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5v11SDown: { code: 'accSagittalSharp5v11SDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5v11SUp: { code: 'accSagittalFlat5v11SUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp7v11CDown: { code: 'accSagittalSharp7v11CDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat7v11CUp: { code: 'accSagittalFlat7v11CUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp55CDown: { code: 'accSagittalSharp55CDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat55CUp: { code: 'accSagittalFlat55CUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp17CDown: { code: 'accSagittalSharp17CDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat17CUp: { code: 'accSagittalFlat17CUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp7v11kDown: { code: 'accSagittalSharp7v11kDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat7v11kUp: { code: 'accSagittalFlat7v11kUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp7v11kUp: { code: 'accSagittalSharp7v11kUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat7v11kDown: { code: 'accSagittalFlat7v11kDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp17CUp: { code: 'accSagittalSharp17CUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat17CDown: { code: 'accSagittalFlat17CDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp55CUp: { code: 'accSagittalSharp55CUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat55CDown: { code: 'accSagittalFlat55CDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp7v11CUp: { code: 'accSagittalSharp7v11CUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat7v11CDown: { code: 'accSagittalFlat7v11CDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5v11SUp: { code: 'accSagittalSharp5v11SUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5v11SDown: { code: 'accSagittalFlat5v11SDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp5v11SDown: { code: 'accSagittalDoubleSharp5v11SDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat5v11SUp: { code: 'accSagittalDoubleFlat5v11SUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp7v11CDown: { code: 'accSagittalDoubleSharp7v11CDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat7v11CUp: { code: 'accSagittalDoubleFlat7v11CUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp55CDown: { code: 'accSagittalDoubleSharp55CDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat55CUp: { code: 'accSagittalDoubleFlat55CUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp17CDown: { code: 'accSagittalDoubleSharp17CDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat17CUp: { code: 'accSagittalDoubleFlat17CUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp7v11kDown: { code: 'accSagittalDoubleSharp7v11kDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat7v11kUp: { code: 'accSagittalDoubleFlat7v11kUp', parenRightPaddingAdjustment: -1 },
  accSagittal23CommaUp: { code: 'accSagittal23CommaUp', parenRightPaddingAdjustment: -1 },
  accSagittal23CommaDown: { code: 'accSagittal23CommaDown', parenRightPaddingAdjustment: -1 },
  accSagittal5v19CommaUp: { code: 'accSagittal5v19CommaUp', parenRightPaddingAdjustment: -1 },
  accSagittal5v19CommaDown: { code: 'accSagittal5v19CommaDown', parenRightPaddingAdjustment: -1 },
  accSagittal5v23SmallDiesisUp: { code: 'accSagittal5v23SmallDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal5v23SmallDiesisDown: { code: 'accSagittal5v23SmallDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5v23SDown: { code: 'accSagittalSharp5v23SDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5v23SUp: { code: 'accSagittalFlat5v23SUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5v19CDown: { code: 'accSagittalSharp5v19CDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5v19CUp: { code: 'accSagittalFlat5v19CUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp23CDown: { code: 'accSagittalSharp23CDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat23CUp: { code: 'accSagittalFlat23CUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp23CUp: { code: 'accSagittalSharp23CUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat23CDown: { code: 'accSagittalFlat23CDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5v19CUp: { code: 'accSagittalSharp5v19CUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5v19CDown: { code: 'accSagittalFlat5v19CDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5v23SUp: { code: 'accSagittalSharp5v23SUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5v23SDown: { code: 'accSagittalFlat5v23SDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp5v23SDown: { code: 'accSagittalDoubleSharp5v23SDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat5v23SUp: { code: 'accSagittalDoubleFlat5v23SUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp5v19CDown: { code: 'accSagittalDoubleSharp5v19CDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat5v19CUp: { code: 'accSagittalDoubleFlat5v19CUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp23CDown: { code: 'accSagittalDoubleSharp23CDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat23CUp: { code: 'accSagittalDoubleFlat23CUp', parenRightPaddingAdjustment: -1 },
  accSagittal19SchismaUp: { code: 'accSagittal19SchismaUp', parenRightPaddingAdjustment: -1 },
  accSagittal19SchismaDown: { code: 'accSagittal19SchismaDown', parenRightPaddingAdjustment: -1 },
  accSagittal17KleismaUp: { code: 'accSagittal17KleismaUp', parenRightPaddingAdjustment: -1 },
  accSagittal17KleismaDown: { code: 'accSagittal17KleismaDown', parenRightPaddingAdjustment: -1 },
  accSagittal143CommaUp: { code: 'accSagittal143CommaUp', parenRightPaddingAdjustment: -1 },
  accSagittal143CommaDown: { code: 'accSagittal143CommaDown', parenRightPaddingAdjustment: -1 },
  accSagittal11v49CommaUp: { code: 'accSagittal11v49CommaUp', parenRightPaddingAdjustment: -1 },
  accSagittal11v49CommaDown: { code: 'accSagittal11v49CommaDown', parenRightPaddingAdjustment: -1 },
  accSagittal19CommaUp: { code: 'accSagittal19CommaUp', parenRightPaddingAdjustment: -1 },
  accSagittal19CommaDown: { code: 'accSagittal19CommaDown', parenRightPaddingAdjustment: -1 },
  accSagittal7v19CommaUp: { code: 'accSagittal7v19CommaUp', parenRightPaddingAdjustment: -1 },
  accSagittal7v19CommaDown: { code: 'accSagittal7v19CommaDown', parenRightPaddingAdjustment: -1 },
  accSagittal49SmallDiesisUp: { code: 'accSagittal49SmallDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal49SmallDiesisDown: { code: 'accSagittal49SmallDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittal23SmallDiesisUp: { code: 'accSagittal23SmallDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal23SmallDiesisDown: { code: 'accSagittal23SmallDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittal5v13MediumDiesisUp: { code: 'accSagittal5v13MediumDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal5v13MediumDiesisDown: { code: 'accSagittal5v13MediumDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittal11v19MediumDiesisUp: { code: 'accSagittal11v19MediumDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal11v19MediumDiesisDown: { code: 'accSagittal11v19MediumDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittal49MediumDiesisUp: { code: 'accSagittal49MediumDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal49MediumDiesisDown: { code: 'accSagittal49MediumDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittal5v49MediumDiesisUp: { code: 'accSagittal5v49MediumDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal5v49MediumDiesisDown: { code: 'accSagittal5v49MediumDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittal49LargeDiesisUp: { code: 'accSagittal49LargeDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal49LargeDiesisDown: { code: 'accSagittal49LargeDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittal11v19LargeDiesisUp: { code: 'accSagittal11v19LargeDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal11v19LargeDiesisDown: { code: 'accSagittal11v19LargeDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittal5v13LargeDiesisUp: { code: 'accSagittal5v13LargeDiesisUp', parenRightPaddingAdjustment: -1 },
  accSagittal5v13LargeDiesisDown: { code: 'accSagittal5v13LargeDiesisDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp23SDown: { code: 'accSagittalSharp23SDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat23SUp: { code: 'accSagittalFlat23SUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp49SDown: { code: 'accSagittalSharp49SDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat49SUp: { code: 'accSagittalFlat49SUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp7v19CDown: { code: 'accSagittalSharp7v19CDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat7v19CUp: { code: 'accSagittalFlat7v19CUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp19CDown: { code: 'accSagittalSharp19CDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat19CUp: { code: 'accSagittalFlat19CUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp11v49CDown: { code: 'accSagittalSharp11v49CDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat11v49CUp: { code: 'accSagittalFlat11v49CUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp143CDown: { code: 'accSagittalSharp143CDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat143CUp: { code: 'accSagittalFlat143CUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp17kDown: { code: 'accSagittalSharp17kDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat17kUp: { code: 'accSagittalFlat17kUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp19sDown: { code: 'accSagittalSharp19sDown', parenRightPaddingAdjustment: -1 },
  accSagittalFlat19sUp: { code: 'accSagittalFlat19sUp', parenRightPaddingAdjustment: -1 },
  accSagittalSharp19sUp: { code: 'accSagittalSharp19sUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat19sDown: { code: 'accSagittalFlat19sDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp17kUp: { code: 'accSagittalSharp17kUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat17kDown: { code: 'accSagittalFlat17kDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp143CUp: { code: 'accSagittalSharp143CUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat143CDown: { code: 'accSagittalFlat143CDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp11v49CUp: { code: 'accSagittalSharp11v49CUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat11v49CDown: { code: 'accSagittalFlat11v49CDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp19CUp: { code: 'accSagittalSharp19CUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat19CDown: { code: 'accSagittalFlat19CDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp7v19CUp: { code: 'accSagittalSharp7v19CUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat7v19CDown: { code: 'accSagittalFlat7v19CDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp49SUp: { code: 'accSagittalSharp49SUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat49SDown: { code: 'accSagittalFlat49SDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp23SUp: { code: 'accSagittalSharp23SUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat23SDown: { code: 'accSagittalFlat23SDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5v13MUp: { code: 'accSagittalSharp5v13MUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5v13MDown: { code: 'accSagittalFlat5v13MDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp11v19MUp: { code: 'accSagittalSharp11v19MUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat11v19MDown: { code: 'accSagittalFlat11v19MDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp49MUp: { code: 'accSagittalSharp49MUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat49MDown: { code: 'accSagittalFlat49MDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5v49MUp: { code: 'accSagittalSharp5v49MUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5v49MDown: { code: 'accSagittalFlat5v49MDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp49LUp: { code: 'accSagittalSharp49LUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat49LDown: { code: 'accSagittalFlat49LDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp11v19LUp: { code: 'accSagittalSharp11v19LUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat11v19LDown: { code: 'accSagittalFlat11v19LDown', parenRightPaddingAdjustment: -1 },
  accSagittalSharp5v13LUp: { code: 'accSagittalSharp5v13LUp', parenRightPaddingAdjustment: -1 },
  accSagittalFlat5v13LDown: { code: 'accSagittalFlat5v13LDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp23SDown: { code: 'accSagittalDoubleSharp23SDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat23SUp: { code: 'accSagittalDoubleFlat23SUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp49SDown: { code: 'accSagittalDoubleSharp49SDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat49SUp: { code: 'accSagittalDoubleFlat49SUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp7v19CDown: { code: 'accSagittalDoubleSharp7v19CDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat7v19CUp: { code: 'accSagittalDoubleFlat7v19CUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp19CDown: { code: 'accSagittalDoubleSharp19CDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat19CUp: { code: 'accSagittalDoubleFlat19CUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp11v49CDown: { code: 'accSagittalDoubleSharp11v49CDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat11v49CUp: { code: 'accSagittalDoubleFlat11v49CUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp143CDown: { code: 'accSagittalDoubleSharp143CDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat143CUp: { code: 'accSagittalDoubleFlat143CUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp17kDown: { code: 'accSagittalDoubleSharp17kDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat17kUp: { code: 'accSagittalDoubleFlat17kUp', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleSharp19sDown: { code: 'accSagittalDoubleSharp19sDown', parenRightPaddingAdjustment: -1 },
  accSagittalDoubleFlat19sUp: { code: 'accSagittalDoubleFlat19sUp', parenRightPaddingAdjustment: -1 },
  accSagittalShaftUp: { code: 'accSagittalShaftUp', parenRightPaddingAdjustment: -1 },
  accSagittalShaftDown: { code: 'accSagittalShaftDown', parenRightPaddingAdjustment: -1 },
  accSagittalAcute: { code: 'accSagittalAcute', parenRightPaddingAdjustment: -1 },
  accSagittalGrave: { code: 'accSagittalGrave', parenRightPaddingAdjustment: -1 },
  accSagittal1MinaUp: { code: 'accSagittal1MinaUp', parenRightPaddingAdjustment: -1 },
  accSagittal1MinaDown: { code: 'accSagittal1MinaDown', parenRightPaddingAdjustment: -1 },
  accSagittal2MinasUp: { code: 'accSagittal2MinasUp', parenRightPaddingAdjustment: -1 },
  accSagittal2MinasDown: { code: 'accSagittal2MinasDown', parenRightPaddingAdjustment: -1 },
  accSagittal1TinaUp: { code: 'accSagittal1TinaUp', parenRightPaddingAdjustment: -1 },
  accSagittal1TinaDown: { code: 'accSagittal1TinaDown', parenRightPaddingAdjustment: -1 },
  accSagittal2TinasUp: { code: 'accSagittal2TinasUp', parenRightPaddingAdjustment: -1 },
  accSagittal2TinasDown: { code: 'accSagittal2TinasDown', parenRightPaddingAdjustment: -1 },
  accSagittal3TinasUp: { code: 'accSagittal3TinasUp', parenRightPaddingAdjustment: -1 },
  accSagittal3TinasDown: { code: 'accSagittal3TinasDown', parenRightPaddingAdjustment: -1 },
  accSagittal4TinasUp: { code: 'accSagittal4TinasUp', parenRightPaddingAdjustment: -1 },
  accSagittal4TinasDown: { code: 'accSagittal4TinasDown', parenRightPaddingAdjustment: -1 },
  accSagittal5TinasUp: { code: 'accSagittal5TinasUp', parenRightPaddingAdjustment: -1 },
  accSagittal5TinasDown: { code: 'accSagittal5TinasDown', parenRightPaddingAdjustment: -1 },
  accSagittal6TinasUp: { code: 'accSagittal6TinasUp', parenRightPaddingAdjustment: -1 },
  accSagittal6TinasDown: { code: 'accSagittal6TinasDown', parenRightPaddingAdjustment: -1 },
  accSagittal7TinasUp: { code: 'accSagittal7TinasUp', parenRightPaddingAdjustment: -1 },
  accSagittal7TinasDown: { code: 'accSagittal7TinasDown', parenRightPaddingAdjustment: -1 },
  accSagittal8TinasUp: { code: 'accSagittal8TinasUp', parenRightPaddingAdjustment: -1 },
  accSagittal8TinasDown: { code: 'accSagittal8TinasDown', parenRightPaddingAdjustment: -1 },
  accSagittal9TinasUp: { code: 'accSagittal9TinasUp', parenRightPaddingAdjustment: -1 },
  accSagittal9TinasDown: { code: 'accSagittal9TinasDown', parenRightPaddingAdjustment: -1 },
  accSagittalFractionalTinaUp: { code: 'accSagittalFractionalTinaUp', parenRightPaddingAdjustment: -1 },
  accSagittalFractionalTinaDown: { code: 'accSagittalFractionalTinaDown', parenRightPaddingAdjustment: -1 },
  accidentalNarrowReversedFlat: { code: 'accidentalNarrowReversedFlat', parenRightPaddingAdjustment: -1 },
  accidentalNarrowReversedFlatAndFlat: {
    code: 'accidentalNarrowReversedFlatAndFlat',
    parenRightPaddingAdjustment: -1,
  },
  accidentalWilsonPlus: { code: 'accidentalWilsonPlus', parenRightPaddingAdjustment: -1 },
  accidentalWilsonMinus: { code: 'accidentalWilsonMinus', parenRightPaddingAdjustment: -1 },
};

// Helps determine the layout of accidentals.
const accidentalColumns: Record<number, { [name: string]: number[] }> = {
  1: {
    a: [1],
    b: [1],
  },
  2: {
    a: [1, 2],
  },
  3: {
    a: [1, 3, 2],
    b: [1, 2, 1],
    second_on_bottom: [1, 2, 3],
  },
  4: {
    a: [1, 3, 4, 2],
    b: [1, 2, 3, 1],
    spaced_out_tetrachord: [1, 2, 1, 2],
  },
  5: {
    a: [1, 3, 5, 4, 2],
    b: [1, 2, 4, 3, 1],
    spaced_out_pentachord: [1, 2, 3, 2, 1],
    very_spaced_out_pentachord: [1, 2, 1, 2, 1],
  },
  6: {
    a: [1, 3, 5, 6, 4, 2],
    b: [1, 2, 4, 5, 3, 1],
    spaced_out_hexachord: [1, 3, 2, 1, 3, 2],
    very_spaced_out_hexachord: [1, 2, 1, 2, 1, 2],
  },
};

const articulations: Record<string, ArticulationStruct> = {
  'a.': { code: 'augmentationDot', between_lines: true }, // Staccato
  av: {
    aboveCode: 'articStaccatissimoAbove',
    belowCode: 'articStaccatissimoBelow',
    between_lines: true,
  }, // Staccatissimo
  'a>': {
    aboveCode: 'articAccentAbove',
    belowCode: 'articAccentBelow',
    between_lines: true,
  }, // Accent
  'a-': {
    aboveCode: 'articTenutoAbove',
    belowCode: 'articTenutoBelow',
    between_lines: true,
  }, // Tenuto
  'a^': {
    aboveCode: 'articMarcatoAbove',
    belowCode: 'articMarcatoBelow',
    between_lines: false,
  }, // Marcato
  'a+': { code: 'pluckedLeftHandPizzicato', between_lines: false }, // Left hand pizzicato
  ao: {
    aboveCode: 'pluckedSnapPizzicatoAbove',
    belowCode: 'pluckedSnapPizzicatoBelow',
    between_lines: false,
  }, // Snap pizzicato
  ah: { code: 'stringsHarmonic', between_lines: false }, // Natural harmonic or open note
  'a@': { aboveCode: 'fermataAbove', belowCode: 'fermataBelow', between_lines: false }, // Fermata
  'a@a': { code: 'fermataAbove', between_lines: false }, // Fermata above staff
  'a@u': { code: 'fermataBelow', between_lines: false }, // Fermata below staff
  'a|': { code: 'stringsUpBow', between_lines: false }, // Bow up - up stroke
  am: { code: 'stringsDownBow', between_lines: false }, // Bow down - down stroke
  'a,': { code: 'pictChokeCymbal', between_lines: false }, // Choked
};

const ornaments: Record<string, { code: string }> = {
  mordent: { code: 'ornamentShortTrill' },
  mordent_inverted: { code: 'ornamentMordent' },
  turn: { code: 'ornamentTurn' },
  turn_inverted: { code: 'ornamentTurnSlash' },
  tr: { code: 'ornamentTrill' },
  upprall: { code: 'ornamentPrecompSlideTrillDAnglebert' },
  downprall: { code: 'ornamentPrecompDoubleCadenceUpperPrefix' },
  prallup: { code: 'ornamentPrecompTrillSuffixDandrieu' },
  pralldown: { code: 'ornamentPrecompTrillLowerSuffix' },
  upmordent: { code: 'ornamentPrecompSlideTrillBach' },
  downmordent: { code: 'ornamentPrecompDoubleCadenceUpperPrefixTurn' },
  lineprall: { code: 'ornamentPrecompAppoggTrill' },
  prallprall: { code: 'ornamentTremblement' },
  scoop: { code: 'brassScoop' },
  doit: { code: 'brassDoitMedium' },
  fall: { code: 'brassFallLipShort' },
  doitLong: { code: 'brassLiftMedium' },
  fallLong: { code: 'brassFallRoughMedium' },
  bend: { code: 'brassBend' },
  plungerClosed: { code: 'brassMuteClosed' },
  plungerOpen: { code: 'brassMuteOpen' },
  flip: { code: 'brassFlip' },
  jazzTurn: { code: 'brassJazzTurn' },
  smear: { code: 'brassSmear' },
};

export class Tables {
  static STEM_WIDTH = 1.5;
  static STEM_HEIGHT = 35;
  static STAVE_LINE_THICKNESS = 1;
  static RESOLUTION = RESOLUTION;

  /**
   * Customize this by calling Flow.setMusicFont(...fontNames);
   */
  static MUSIC_FONT_STACK: Font[] = [];

  /**
   * @returns the `Font` object at the head of the music font stack.
   */
  static currentMusicFont(): Font {
    if (Tables.MUSIC_FONT_STACK.length === 0) {
      throw new RuntimeError(
        'NoFonts',
        'The font stack is empty. See: await Flow.fetchMusicFont(...); Flow.setMusicFont(...).'
      );
    } else {
      return Tables.MUSIC_FONT_STACK[0];
    }
  }

  static NOTATION_FONT_SCALE = 39;
  static TABLATURE_FONT_SCALE = 39;

  static SLASH_NOTEHEAD_WIDTH = 15;
  static STAVE_LINE_DISTANCE = 10;

  // HACK:
  // Since text origins are positioned at the baseline, we must
  // compensate for the ascender of the text. Of course, 1 staff space is
  // a very poor approximation.
  //
  // This will be deprecated in the future. This is a temporary solution until
  // we have more robust text metrics.
  static TEXT_HEIGHT_OFFSET_HACK = 1;

  static clefProperties(clef: string): { line_shift: number } {
    if (!clef || !(clef in clefs)) throw new RuntimeError('BadArgument', 'Invalid clef: ' + clef);
    return clefs[clef];
  }

  /**
   * @param keyOctaveGlyph a string in the format "key/octave" (e.g., "c/5") or "key/octave/custom-note-head-code" (e.g., "g/5/t3").
   * @param clef
   * @param params a struct with one option, `octave_shift` for clef ottavation (0 = default; 1 = 8va; -1 = 8vb, etc.).
   * @returns properties for the specified note.
   */
  // eslint-disable-next-line
  static keyProperties(keyOctaveGlyph: string, clef: string = 'treble', params?: { octave_shift?: number }): any {
    let options = { octave_shift: 0 };
    if (typeof params === 'object') {
      options = { ...options, ...params };
    }

    const pieces = keyOctaveGlyph.split('/');
    if (pieces.length < 2) {
      throw new RuntimeError(
        'BadArguments',
        `First argument must be note/octave or note/octave/glyph-code: ${keyOctaveGlyph}`
      );
    }

    const key = pieces[0].toUpperCase();
    const value = notesInfo[key];
    if (!value) throw new RuntimeError('BadArguments', 'Invalid key name: ' + key);
    if (value.octave) pieces[1] = value.octave.toString();

    let octave = parseInt(pieces[1], 10);

    // Octave_shift is the shift to compensate for clef 8va/8vb.
    octave += -1 * options.octave_shift;

    const baseIndex = octave * 7 - 4 * 7;
    let line = (baseIndex + value.index) / 2;
    line += Tables.clefProperties(clef).line_shift;

    let stroke = 0;

    if (line <= 0 && (line * 2) % 2 === 0) stroke = 1; // stroke up
    if (line >= 6 && (line * 2) % 2 === 0) stroke = -1; // stroke down

    // Integer value for note arithmetic.
    const int_value = typeof value.int_val !== 'undefined' ? octave * 12 + value.int_val : undefined;

    // If the user specified a glyph, overwrite the glyph code.
    const code = value.code;
    const shift_right = value.shift_right;
    let customNoteHeadProps = {};
    if (pieces.length > 2 && pieces[2]) {
      const glyphName = pieces[2].toUpperCase();
      customNoteHeadProps = customNoteHeads[glyphName] || {};
    }

    return {
      key,
      octave,
      line,
      int_value,
      accidental: value.accidental,
      code,
      stroke,
      shift_right,
      displaced: false,
      ...customNoteHeadProps,
    };
  }

  static integerToNote(integer?: number): string {
    if (typeof integer === 'undefined' || integer < 0 || integer > 11) {
      throw new RuntimeError('BadArguments', `integerToNote() requires an integer in the range [0, 11]: ${integer}`);
    }

    const table: Record<number, string> = {
      0: 'C',
      1: 'C#',
      2: 'D',
      3: 'D#',
      4: 'E',
      5: 'F',
      6: 'F#',
      7: 'G',
      8: 'G#',
      9: 'A',
      10: 'A#',
      11: 'B',
    };

    const noteValue = table[integer];
    if (!noteValue) {
      throw new RuntimeError('BadArguments', `Unknown note value for integer: ${integer}`);
    }

    return noteValue;
  }

  static tabToGlyph(
    fret: string,
    scale: number = 1.0
  ): { text: string; code?: string; getWidth: () => number; shift_y: number } {
    let glyph = undefined;
    let width = 0;
    let shift_y = 0;

    if (fret.toUpperCase() === 'X') {
      const glyphMetrics = new Glyph('accidentalDoubleSharp', Tables.TABLATURE_FONT_SCALE).getMetrics();
      glyph = 'accidentalDoubleSharp';
      if (glyphMetrics.width == undefined || glyphMetrics.height == undefined)
        throw new RuntimeError('InvalidMetrics', 'Width and height required');
      width = glyphMetrics.width;
      shift_y = -glyphMetrics.height / 2;
    } else {
      width = Tables.textWidth(fret);
    }

    return {
      text: fret,
      code: glyph,
      getWidth: () => width * scale,
      shift_y,
    };
  }

  // Used by annotation.ts and bend.ts. Clearly this implementation only works for the default font size.
  // TODO: The actual width depends on the font family, size, weight, style.
  static textWidth(text: string): number {
    return 7 * text.toString().length;
  }

  static articulationCodes(artic: string): ArticulationStruct {
    return articulations[artic];
  }

  static accidentalMap = accidentals;

  static accidentalCodes(acc: string): { code: string; parenRightPaddingAdjustment: number } {
    return accidentals[acc];
  }

  static accidentalColumnsTable = accidentalColumns;

  static ornamentCodes(acc: string): { code: string } {
    return ornaments[acc];
  }

  static keySignature(spec: string): { type: string; line: number }[] {
    const keySpec = keySignatures[spec];

    if (!keySpec) {
      throw new RuntimeError('BadKeySignature', `Bad key signature spec: '${spec}'`);
    }

    if (!keySpec.acc) {
      return [];
    }

    const accidentalList: Record<string, number[]> = {
      b: [2, 0.5, 2.5, 1, 3, 1.5, 3.5],
      '#': [0, 1.5, -0.5, 1, 2.5, 0.5, 2],
    };

    const notes = accidentalList[keySpec.acc];

    const acc_list = [];
    for (let i = 0; i < keySpec.num; ++i) {
      const line = notes[i];
      acc_list.push({ type: keySpec.acc, line });
    }

    return acc_list;
  }

  static getKeySignatures(): Record<string, { acc?: string; num: number }> {
    return keySignatures;
  }

  static hasKeySignature(spec: string): boolean {
    return spec in keySignatures;
  }

  static unicode = {
    // ♯ accidental sharp
    sharp: String.fromCharCode(0x266f),
    // ♭ accidental flat
    flat: String.fromCharCode(0x266d),
    // ♮ accidental natural
    natural: String.fromCharCode(0x266e),
    // △ major seventh
    triangle: String.fromCharCode(0x25b3),
    // ø half-diminished
    'o-with-slash': String.fromCharCode(0x00f8),
    // ° diminished
    degrees: String.fromCharCode(0x00b0),
    // ○ diminished
    circle: String.fromCharCode(0x25cb),
  };

  /**
   * Convert duration aliases to the number based duration.
   * If the input isn't an alias, simply return the input.
   * @param duration
   * @returns Example: 'q' -> '4', '8' -> '8'
   */
  static sanitizeDuration(duration: string): string {
    const durationNumber: string = durationAliases[duration];
    if (durationNumber !== undefined) {
      duration = durationNumber;
    }
    if (durations[duration] === undefined) {
      throw new RuntimeError('BadArguments', `The provided duration is not valid: ${duration}`);
    }
    return duration;
  }

  /** Convert the `duration` to a fraction. */
  static durationToFraction(duration: string): Fraction {
    return new Fraction().parse(Tables.sanitizeDuration(duration));
  }

  /** Convert the `duration` to a number. */
  static durationToNumber(duration: string): number {
    return Tables.durationToFraction(duration).value();
  }

  /* Convert the `duration` to total ticks. */
  static durationToTicks(duration: string): number {
    duration = Tables.sanitizeDuration(duration);
    const ticks = durations[duration];
    if (ticks === undefined) {
      throw new RuntimeError('InvalidDuration');
    }
    return ticks;
  }

  // Return a glyph given duration and type. The type can be a custom glyph code from customNoteHeads.
  // The default type is a regular note ('n').
  // eslint-disable-next-line
  static getGlyphProps(duration: string, type: string = 'n'): any | undefined {
    duration = Tables.sanitizeDuration(duration);

    // Lookup duration for default glyph head code
    const code = durationCodes[duration];
    if (code === undefined) {
      return undefined;
    }

    // Get glyph properties for 'type' from duration string (note, rest, harmonic, muted, slash)
    let glyphTypeProperties = code.type[type];

    // If this isn't a standard type, then lookup the custom note head map.
    if (glyphTypeProperties === undefined) {
      // Try and get it from the custom list of note heads
      const customGlyphTypeProperties = customNoteHeads[type.toUpperCase()];

      // If not, then return with nothing.
      if (customGlyphTypeProperties === undefined) {
        return undefined;
      }

      // Otherwise set it as the code_head value
      glyphTypeProperties = {
        code_head: customGlyphTypeProperties.code,
        ...customGlyphTypeProperties,
      };
    }

    const code_head = glyphTypeProperties.code_head;

    // The default implementation of getWidth() calls Glyph.getWidth(code_head, scale).
    // This can be overridden by an individual glyph type (see slash noteheads below: Tables.SLASH_NOTEHEAD_WIDTH).
    const getWidth = (scale = Tables.NOTATION_FONT_SCALE): number | undefined => Glyph.getWidth(code_head, scale);

    // Merge duration props for 'duration' with the note head properties.
    return { ...code.common, getWidth: getWidth, ...glyphTypeProperties };
  }

  /* The list of valid note types. Used by note.ts during parseNoteStruct(). */
  static validTypes = validNoteTypes;

  // Default time signature.
  static TIME4_4 = {
    num_beats: 4,
    beat_value: 4,
    resolution: RESOLUTION,
  };
}

// 1/2, 1, 2, 4, 8, 16, 32, 64, 128
// NOTE: There is no 256 here! However, there are other mentions of 256 in this file.
// For example, in durations has a 256 key, and sanitizeDuration() can return 256.
// The sanitizeDuration() bit may need to be removed by 0xfe.
// eslint-disable-next-line
const durationCodes: Record<string, any> = {
  '1/2': {
    common: {
      stem: false,
      stem_offset: 0,
      flag: false,
      stem_up_extension: -Tables.STEM_HEIGHT,
      stem_down_extension: -Tables.STEM_HEIGHT,
      tabnote_stem_up_extension: -Tables.STEM_HEIGHT,
      tabnote_stem_down_extension: -Tables.STEM_HEIGHT,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      n: {
        // Breve note
        code_head: 'noteheadDoubleWhole',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadDoubleWhole', scale);
        // },
      },
      h: {
        // Breve note harmonic
        code_head: 'unpitchedPercussionClef1',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('unpitchedPercussionClef1', scale);
        // },
      },
      m: {
        // Breve note muted
        code_head: 'vexNoteHeadMutedBreve',
        stem_offset: 0,
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('vexNoteHeadMutedBreve', scale);
        // },
      },
      r: {
        // Breve rest
        code_head: 'restDoubleWhole',
        rest: true,
        position: 'B/5',
        dot_shiftY: 0.5,
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('restDoubleWhole', scale);
        // },
      },
      s: {
        // Breve note slash -
        // Drawn with canvas primitives
        getWidth: () => Tables.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
      g: {
        // Ghostnote
        code_head: 'noteheadDoubleWhole',
      },
    },
  },

  1: {
    common: {
      stem: false,
      stem_offset: 0,
      flag: false,
      stem_up_extension: -Tables.STEM_HEIGHT,
      stem_down_extension: -Tables.STEM_HEIGHT,
      tabnote_stem_up_extension: -Tables.STEM_HEIGHT,
      tabnote_stem_down_extension: -Tables.STEM_HEIGHT,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      n: {
        // Whole note
        code_head: 'noteheadWhole',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadWhole', scale);
        // },
      },
      h: {
        // Whole note harmonic
        code_head: 'noteheadDiamondWhole',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadDiamondWhole', scale);
        // },
      },
      m: {
        // Whole note muted
        code_head: 'noteheadXWhole',
        stem_offset: -3,
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadXWhole', scale);
        // },
      },
      r: {
        // Whole rest
        code_head: 'restWhole',
        rest: true,
        position: 'D/5',
        dot_shiftY: 0.5,
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('restWhole', scale);
        // },
      },
      s: {
        // Whole note slash
        // Drawn with canvas primitives
        getWidth: () => Tables.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
      g: {
        // Ghostnote
        code_head: 'noteheadWhole',
      },
    },
  },

  2: {
    common: {
      stem: true,
      stem_offset: 0,
      flag: false,
      stem_up_extension: 0,
      stem_down_extension: 0,
      tabnote_stem_up_extension: 0,
      tabnote_stem_down_extension: 0,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      n: {
        // Half note
        code_head: 'noteheadHalf',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadHalf', scale);
        // },
      },
      h: {
        // Half note harmonic
        code_head: 'noteheadDiamondHalf',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadDiamondHalf', scale);
        // },
      },
      m: {
        // Half note muted
        code_head: 'noteheadXHalf',
        stem_offset: -3,
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadXHalf', scale);
        // },
      },
      r: {
        // Half rest
        code_head: 'restHalf',
        stem: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -0.5,
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('restHalf', scale);
        // },
      },
      s: {
        // Half note slash
        // Drawn with canvas primitives
        getWidth: () => Tables.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
      g: {
        // Ghostnote
        code_head: 'noteheadHalf',
      },
    },
  },

  4: {
    common: {
      stem: true,
      stem_offset: 0,
      flag: false,
      stem_up_extension: 0,
      stem_down_extension: 0,
      tabnote_stem_up_extension: 0,
      tabnote_stem_down_extension: 0,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      n: {
        // Quarter note
        code_head: 'noteheadBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadBlack', scale);
        // },
      },
      h: {
        // Quarter harmonic
        code_head: 'noteheadDiamondBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadDiamondBlack', scale);
        // },
      },
      m: {
        // Quarter muted
        code_head: 'noteheadXBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadXBlack', scale);
        // },
      },
      r: {
        // Quarter rest
        code_head: 'restQuarter',
        stem: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -0.5,
        line_above: 1.5,
        line_below: 1.5,
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('restQuarter', scale);
        // },
      },
      s: {
        // Quarter slash
        // Drawn with canvas primitives
        getWidth: () => Tables.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
      g: {
        // Ghostnote
        code_head: 'noteheadBlack',
      },
    },
  },

  8: {
    common: {
      stem: true,
      stem_offset: 0,
      flag: true,
      beam_count: 1,
      stem_beam_extension: 0,
      code_flag_upstem: 'flag8thUp',
      code_flag_downstem: 'flag8thDown',
      stem_up_extension: 0,
      stem_down_extension: 0,
      tabnote_stem_up_extension: 0,
      tabnote_stem_down_extension: 0,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      n: {
        // Eighth note
        code_head: 'noteheadBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadBlack', scale);
        // },
      },
      h: {
        // Eighth note harmonic
        code_head: 'noteheadDiamondBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadDiamondBlack', scale);
        // },
      },
      m: {
        // Eighth note muted
        code_head: 'noteheadXBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadXBlack', scale);
        // },
      },
      r: {
        // Eighth rest
        code_head: 'rest8th',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -0.5,
        line_above: 1.0,
        line_below: 1.0,
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('rest8th', scale);
        // },
      },
      s: {
        // Eighth slash
        // Drawn with canvas primitives
        getWidth: () => Tables.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
      g: {
        // Ghostnote
        code_head: 'noteheadBlack',
      },
    },
  },

  16: {
    common: {
      beam_count: 2,
      stem_beam_extension: 0,
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: 'flag16thUp',
      code_flag_downstem: 'flag16thDown',
      stem_up_extension: 0,
      stem_down_extension: 0,
      tabnote_stem_up_extension: 0,
      tabnote_stem_down_extension: 0,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      n: {
        // Sixteenth note
        code_head: 'noteheadBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadBlack', scale);
        // },
      },
      h: {
        // Sixteenth note harmonic
        code_head: 'noteheadDiamondBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadDiamondBlack', scale);
        // },
      },
      m: {
        // Sixteenth note muted
        code_head: 'noteheadXBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadXBlack', scale);
        // },
      },
      r: {
        // Sixteenth rest
        code_head: 'rest16th',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -0.5,
        line_above: 1.0,
        line_below: 2.0,
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('rest16th', scale);
        // },
      },
      s: {
        // Sixteenth slash
        // Drawn with canvas primitives
        getWidth: () => Tables.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
      g: {
        // Ghostnote
        code_head: 'noteheadBlack',
      },
    },
  },

  32: {
    common: {
      beam_count: 3,
      stem_beam_extension: 7.5,
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: 'flag32ndUp',
      code_flag_downstem: 'flag32ndDown',
      stem_up_extension: 9,
      stem_down_extension: 9,
      tabnote_stem_up_extension: 9,
      tabnote_stem_down_extension: 9,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      n: {
        // Thirty-second note
        code_head: 'noteheadBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadBlack', scale);
        // },
      },
      h: {
        // Thirty-second harmonic
        code_head: 'noteheadDiamondBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadDiamondBlack', scale);
        // },
      },
      m: {
        // Thirty-second muted
        code_head: 'noteheadXBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadXBlack', scale);
        // },
      },
      r: {
        // Thirty-second rest
        code_head: 'rest32nd',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -1.5,
        line_above: 2.0,
        line_below: 2.0,
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('rest32nd', scale);
        // },
      },
      s: {
        // Thirty-second slash
        // Drawn with canvas primitives
        getWidth: () => Tables.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
      g: {
        // Ghostnote
        code_head: 'noteheadBlack',
      },
    },
  },

  64: {
    common: {
      beam_count: 4,
      stem_beam_extension: 15,
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: 'flag64thUp',
      code_flag_downstem: 'flag64thDown',
      stem_up_extension: 13,
      stem_down_extension: 13,
      tabnote_stem_up_extension: 13,
      tabnote_stem_down_extension: 13,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      n: {
        // Sixty-fourth note
        code_head: 'noteheadBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadBlack', scale);
        // },
      },
      h: {
        // Sixty-fourth harmonic
        code_head: 'noteheadDiamondBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadDiamondBlack', scale);
        // },
      },
      m: {
        // Sixty-fourth muted
        code_head: 'noteheadXBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadXBlack', scale);
        // },
      },
      r: {
        // Sixty-fourth rest
        code_head: 'rest64th',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -1.5,
        line_above: 2.0,
        line_below: 3.0,
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('rest64th', scale);
        // },
      },
      s: {
        // Sixty-fourth slash
        // Drawn with canvas primitives
        getWidth: () => Tables.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
      g: {
        // Ghostnote
        code_head: 'noteheadBlack',
      },
    },
  },

  128: {
    common: {
      beam_count: 5,
      stem_beam_extension: 22.5,
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: 'flag128thUp',
      code_flag_downstem: 'flag128thDown',
      stem_up_extension: 22,
      stem_down_extension: 22,
      tabnote_stem_up_extension: 22,
      tabnote_stem_down_extension: 22,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      n: {
        // Hundred-twenty-eight note
        code_head: 'noteheadBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadBlack', scale);
        // },
      },
      h: {
        // Hundred-twenty-eight harmonic
        code_head: 'noteheadDiamondBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadDiamondBlack', scale);
        // },
      },
      m: {
        // Hundred-twenty-eight muted
        code_head: 'noteheadXBlack',
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('noteheadXBlack', scale);
        // },
      },
      r: {
        // Hundred-twenty-eight rest
        code_head: 'rest128th',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -2.5,
        line_above: 3.0,
        line_below: 3.0,
        // getWidth(scale = Tables.NOTATION_FONT_SCALE): number | undefined {
        //   return Glyph.getWidth('rest128th', scale);
        // },
      },
      s: {
        // Hundred-twenty-eight slash
        // Drawn with canvas primitives
        getWidth: () => Tables.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
      g: {
        // Ghostnote
        code_head: 'noteheadBlack',
      },
    },
  },
};
