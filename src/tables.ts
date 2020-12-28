// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

/* eslint-disable key-spacing */

import {Vex} from './vex';
import {Fraction} from './fraction';
import {Glyph} from './glyph';
import {DefaultFontStack} from './smufl';
import {
  IAccItem,
  ICodeValue, IDurationToTicks,
  IFlow,
  IIntegerToNote,
  IKeyProperties, IKeyPropertiesParams, IKeyProps, IType
} from './types/common';
import {BoundingBox} from "./boundingbox";
import {IClefProperties} from "./types/clef";
import {INoteValue} from "./types/note";
import {IArticulation, IArticulationCodes} from "./types/articulation";
import {IAccidentalCodes} from "./types/accidental";
import {IKeySignature} from "./types/keysignature";
import {IOrnamentCodes} from "./types/ornament";
import {IGlyphProps} from "./types/glyph";

const Flow = {
  STEM_WIDTH: 1.5,
  STEM_HEIGHT: 35,
  STAVE_LINE_THICKNESS: 1,
  RESOLUTION: 16384,

  DEFAULT_FONT_STACK: DefaultFontStack,
  DEFAULT_NOTATION_FONT_SCALE: 39,
  DEFAULT_TABLATURE_FONT_SCALE: 39,
  SLASH_NOTEHEAD_WIDTH: 15,

  // HACK:
  // Since text origins are positioned at the baseline, we must
  // compensate for the ascender of the text. Of course, 1 staff space is
  // a very poor approximation.
  //
  // This will be deprecated in the future. This is a temporary solution until
  // we have more robust text metrics.
  TEXT_HEIGHT_OFFSET_HACK: 1,

  /* Kerning (DEPRECATED) */
  IsKerned: true,
} as IFlow;

Flow.clefProperties = function(clef: string) {
  if (!clef) throw new Vex.RERR('BadArgument', 'Invalid clef: ' + clef);

  const props = Flow.clefProperties.values[clef];
  if (!props) throw new Vex.RERR('BadArgument', 'Invalid clef: ' + clef);

  return props;
} as IClefProperties;

Flow.clefProperties.values = {
  'treble': {line_shift: 0},
  'bass': {line_shift: 6},
  'tenor': {line_shift: 4},
  'alto': {line_shift: 3},
  'soprano': {line_shift: 1},
  'percussion': {line_shift: 0},
  'mezzo-soprano': {line_shift: 2},
  'baritone-c': {line_shift: 5},
  'baritone-f': {line_shift: 5},
  'subbass': {line_shift: 7},
  'french': {line_shift: -1},
};

/*
  Take a note in the format "Key/Octave" (e.g., "C/5") and return properties.

  The last argument, params, is a struct the currently can contain one option,
  octave_shift for clef ottavation (0 = default; 1 = 8va; -1 = 8vb, etc.).
*/
Flow.keyProperties = function(key: string, clef: string, params: IKeyPropertiesParams): IKeyProps {
  if (clef === undefined) {
    clef = 'treble';
  }

  const options = {octave_shift: 0};

  if (typeof params === 'object') {
    Vex.Merge(options, params);
  }

  const pieces = key.split('/');

  if (pieces.length < 2) {
    throw new Vex.RERR('BadArguments', `Key must have note + octave and an optional glyph: ${key}`);
  }

  const k = pieces[0].toUpperCase();
  const value = Flow.keyProperties.note_values[k];
  if (!value) throw new Vex.RERR('BadArguments', 'Invalid key name: ' + k);
  if (value.octave) pieces[1] = value.octave;

  let octave = parseInt(pieces[1], 10);

  // Octave_shift is the shift to compensate for clef 8va/8vb.
  octave += -1 * options.octave_shift;

  const base_index = (octave * 7) - (4 * 7);
  let line = (base_index + value.index) / 2;
  line += Flow.clefProperties(clef).line_shift;

  let stroke = 0;

  if (line <= 0 && (((line * 2) % 2) === 0)) stroke = 1;  // stroke up
  if (line >= 6 && (((line * 2) % 2) === 0)) stroke = -1; // stroke down

  // Integer value for note arithmetic.
  const int_value = typeof (value.int_val) !== 'undefined'
    ? (octave * 12) + value.int_val
    : null;

  /* Check if the user specified a glyph. */
  const code = value.code;
  const shift_right = value.shift_right;
  let extraProps: IType = {} as IType;
  if (pieces.length > 2 && pieces[2]) {
    const glyph_name = pieces[2].toUpperCase();
    extraProps = Flow.keyProperties.customNoteHeads[glyph_name] || {} as IType;
  }

  return {
    key: k,
    octave,
    line,
    int_value,
    accidental: value.accidental,
    code,
    stroke,
    shift_right,
    displaced: false,
    ...extraProps,
  } as IKeyProps;
} as IKeyProperties;

Flow.keyProperties.note_values = {
  'C': {index: 0, int_val: 0, accidental: null} as INoteValue,
  'CN': {index: 0, int_val: 0, accidental: 'n'} as INoteValue,
  'C#': {index: 0, int_val: 1, accidental: '#'} as INoteValue,
  'C##': {index: 0, int_val: 2, accidental: '##'} as INoteValue,
  'CB': {index: 0, int_val: -1, accidental: 'b'} as INoteValue,
  'CBB': {index: 0, int_val: -2, accidental: 'bb'} as INoteValue,
  'D': {index: 1, int_val: 2, accidental: null} as INoteValue,
  'DN': {index: 1, int_val: 2, accidental: 'n'} as INoteValue,
  'D#': {index: 1, int_val: 3, accidental: '#'} as INoteValue,
  'D##': {index: 1, int_val: 4, accidental: '##'} as INoteValue,
  'DB': {index: 1, int_val: 1, accidental: 'b'} as INoteValue,
  'DBB': {index: 1, int_val: 0, accidental: 'bb'} as INoteValue,
  'E': {index: 2, int_val: 4, accidental: null} as INoteValue,
  'EN': {index: 2, int_val: 4, accidental: 'n'} as INoteValue,
  'E#': {index: 2, int_val: 5, accidental: '#'} as INoteValue,
  'E##': {index: 2, int_val: 6, accidental: '##'} as INoteValue,
  'EB': {index: 2, int_val: 3, accidental: 'b'} as INoteValue,
  'EBB': {index: 2, int_val: 2, accidental: 'bb'} as INoteValue,
  'F': {index: 3, int_val: 5, accidental: null} as INoteValue,
  'FN': {index: 3, int_val: 5, accidental: 'n'} as INoteValue,
  'F#': {index: 3, int_val: 6, accidental: '#'} as INoteValue,
  'F##': {index: 3, int_val: 7, accidental: '##'} as INoteValue,
  'FB': {index: 3, int_val: 4, accidental: 'b'} as INoteValue,
  'FBB': {index: 3, int_val: 3, accidental: 'bb'} as INoteValue,
  'G': {index: 4, int_val: 7, accidental: null} as INoteValue,
  'GN': {index: 4, int_val: 7, accidental: 'n'} as INoteValue,
  'G#': {index: 4, int_val: 8, accidental: '#'} as INoteValue,
  'G##': {index: 4, int_val: 9, accidental: '##'} as INoteValue,
  'GB': {index: 4, int_val: 6, accidental: 'b'} as INoteValue,
  'GBB': {index: 4, int_val: 5, accidental: 'bb'} as INoteValue,
  'A': {index: 5, int_val: 9, accidental: null} as INoteValue,
  'AN': {index: 5, int_val: 9, accidental: 'n'} as INoteValue,
  'A#': {index: 5, int_val: 10, accidental: '#'} as INoteValue,
  'A##': {index: 5, int_val: 11, accidental: '##'} as INoteValue,
  'AB': {index: 5, int_val: 8, accidental: 'b'} as INoteValue,
  'ABB': {index: 5, int_val: 7, accidental: 'bb'} as INoteValue,
  'B': {index: 6, int_val: 11, accidental: null} as INoteValue,
  'BN': {index: 6, int_val: 11, accidental: 'n'} as INoteValue,
  'B#': {index: 6, int_val: 12, accidental: '#'} as INoteValue,
  'B##': {index: 6, int_val: 13, accidental: '##'} as INoteValue,
  'BB': {index: 6, int_val: 10, accidental: 'b'} as INoteValue,
  'BBB': {index: 6, int_val: 9, accidental: 'bb'} as INoteValue,
  'R': {index: 6, int_val: 9, rest: true} as INoteValue, // Rest
  'X': {
    index: 6,
    accidental: '',
    octave: 4,
    code: 'noteheadXBlack',
    shift_right: 5.5,
  } as INoteValue,
};


Flow.integerToNote = function(integer) {
  if (typeof (integer) === 'undefined') {
    throw new Vex.RERR('BadArguments', 'Undefined integer for integerToNote');
  }

  if (integer < -2) {
    throw new Vex.RERR('BadArguments', `integerToNote requires integer > -2: ${integer}`);
  }

  const noteValue = Flow.integerToNote.table[integer];
  if (!noteValue) {
    throw new Vex.RERR('BadArguments', `Unknown note value for integer: ${integer}`);
  }

  return noteValue;
} as IIntegerToNote;

Flow.integerToNote.table = {
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

Flow.tabToGlyph = (fret: string, scale = 1.0) => {
  let glyph = null;
  let width = 0;
  let shift_y = 0;

  if (fret.toString().toUpperCase() === 'X') {
    const glyphMetrics = new Glyph('accidentalDoubleSharp', Flow.DEFAULT_TABLATURE_FONT_SCALE).getMetrics();
    glyph = 'accidentalDoubleSharp';
    width = glyphMetrics.width;
    shift_y = -glyphMetrics.height / 2;
  } else {
    width = Flow.textWidth(fret.toString());
  }

  return {
    text: fret,
    code: glyph,
    getWidth: () => width * scale,
    shift_y,
  };
};

Flow.textWidth = text => 7 * text.toString().length;

Flow.articulationCodes = function(artic: string): IArticulation {
  return Flow.articulationCodes.articulations[artic]
} as IArticulationCodes;

Flow.articulationCodes.articulations = {
  'a.': {code: 'augmentationDot', between_lines: true} as IArticulation, // Staccato
  'av': {
    aboveCode: 'articStaccatissimoAbove',
    belowCode: 'articStaccatissimoBelow',
    between_lines: true
  } as IArticulation, // Staccatissimo
  'a>': {
    aboveCode: 'articAccentAbove',
    belowCode: 'articAccentBelow',
    between_lines: true
  } as IArticulation, // Accent
  'a-': {
    aboveCode: 'articTenutoAbove',
    belowCode: 'articTenutoBelow',
    between_lines: true
  } as IArticulation, // Tenuto
  'a^': {
    aboveCode: 'articMarcatoAbove',
    belowCode: 'articMarcatoBelow',
    between_lines: false
  } as IArticulation, // Marcato
  'a+': {code: 'pluckedLeftHandPizzicato', between_lines: false} as IArticulation, // Left hand pizzicato
  'ao': {
    aboveCode: 'pluckedSnapPizzicatoAbove',
    belowCode: 'pluckedSnapPizzicatoBelow',
    between_lines: false
  } as IArticulation, // Snap pizzicato
  'ah': {code: 'stringsHarmonic', between_lines: false} as IArticulation, // Natural harmonic or open note
  'a@': {aboveCode: 'fermataAbove', belowCode: 'fermataBelow', between_lines: false} as IArticulation, // Fermata
  'a@a': {code: 'fermataAbove', between_lines: false} as IArticulation, // Fermata above staff
  'a@u': {code: 'fermataBelow', between_lines: false} as IArticulation, // Fermata below staff
  'a|': {code: 'stringsUpBow', between_lines: false} as IArticulation, // Bow up - up stroke
  'am': {code: 'stringsDownBow', between_lines: false} as IArticulation, // Bow down - down stroke
  'a,': {code: 'pictChokeCymbal', between_lines: false} as IArticulation, // Choked
};

Flow.accidentalCodes = function(acc) {
  return Flow.accidentalCodes.accidentals[acc];
} as IAccidentalCodes;

Flow.accidentalCodes.accidentals = {
  '#': {code: 'accidentalSharp', parenRightPaddingAdjustment: -1},
  '##': {code: 'accidentalDoubleSharp', parenRightPaddingAdjustment: -1},
  'b': {code: 'accidentalFlat', parenRightPaddingAdjustment: -2},
  'bb': {code: 'accidentalDoubleFlat', parenRightPaddingAdjustment: -2},
  'n': {code: 'accidentalNatural', parenRightPaddingAdjustment: -1},
  '{': {code: 'accidentalParensLeft', parenRightPaddingAdjustment: -1},
  '}': {code: 'accidentalParensRight', parenRightPaddingAdjustment: -1},
  'db': {code: 'accidentalThreeQuarterTonesFlatZimmermann', parenRightPaddingAdjustment: -1},
  'd': {code: 'accidentalQuarterToneFlatStein', parenRightPaddingAdjustment: 0},
  '++': {code: 'accidentalThreeQuarterTonesSharpStein', parenRightPaddingAdjustment: -1},
  '+': {code: 'accidentalQuarterToneSharpStein', parenRightPaddingAdjustment: -1},
  '+-': {code: 'accidentalKucukMucennebSharp', parenRightPaddingAdjustment: -1},
  'bs': {code: 'accidentalBakiyeFlat', parenRightPaddingAdjustment: -1},
  'bss': {code: 'accidentalBuyukMucennebFlat', parenRightPaddingAdjustment: -1},
  'o': {code: 'accidentalSori', parenRightPaddingAdjustment: -1},
  'k': {code: 'accidentalKoron', parenRightPaddingAdjustment: -1},
  'bbs': {code: 'vexAccidentalMicrotonal1', parenRightPaddingAdjustment: -1},
  '++-': {code: 'vexAccidentalMicrotonal2', parenRightPaddingAdjustment: -1},
  'ashs': {code: 'vexAccidentalMicrotonal3', parenRightPaddingAdjustment: -1},
  'afhf': {code: 'vexAccidentalMicrotonal4', parenRightPaddingAdjustment: -1},
  'accSagittal5v7KleismaUp': {code: 'accSagittal5v7KleismaUp', parenRightPaddingAdjustment: -1},
  'accSagittal5v7KleismaDown': {code: 'accSagittal5v7KleismaDown', parenRightPaddingAdjustment: -1},
  'accSagittal5CommaUp': {code: 'accSagittal5CommaUp', parenRightPaddingAdjustment: -1},
  'accSagittal5CommaDown': {code: 'accSagittal5CommaDown', parenRightPaddingAdjustment: -1},
  'accSagittal7CommaUp': {code: 'accSagittal7CommaUp', parenRightPaddingAdjustment: -1},
  'accSagittal7CommaDown': {code: 'accSagittal7CommaDown', parenRightPaddingAdjustment: -1},
  'accSagittal25SmallDiesisUp': {code: 'accSagittal25SmallDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal25SmallDiesisDown': {code: 'accSagittal25SmallDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittal35MediumDiesisUp': {code: 'accSagittal35MediumDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal35MediumDiesisDown': {code: 'accSagittal35MediumDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittal11MediumDiesisUp': {code: 'accSagittal11MediumDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal11MediumDiesisDown': {code: 'accSagittal11MediumDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittal11LargeDiesisUp': {code: 'accSagittal11LargeDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal11LargeDiesisDown': {code: 'accSagittal11LargeDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittal35LargeDiesisUp': {code: 'accSagittal35LargeDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal35LargeDiesisDown': {code: 'accSagittal35LargeDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp25SDown': {code: 'accSagittalSharp25SDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat25SUp': {code: 'accSagittalFlat25SUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp7CDown': {code: 'accSagittalSharp7CDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat7CUp': {code: 'accSagittalFlat7CUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5CDown': {code: 'accSagittalSharp5CDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5CUp': {code: 'accSagittalFlat5CUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5v7kDown': {code: 'accSagittalSharp5v7kDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5v7kUp': {code: 'accSagittalFlat5v7kUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp': {code: 'accSagittalSharp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat': {code: 'accSagittalFlat', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5v7kUp': {code: 'accSagittalSharp5v7kUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5v7kDown': {code: 'accSagittalFlat5v7kDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5CUp': {code: 'accSagittalSharp5CUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5CDown': {code: 'accSagittalFlat5CDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp7CUp': {code: 'accSagittalSharp7CUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat7CDown': {code: 'accSagittalFlat7CDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp25SUp': {code: 'accSagittalSharp25SUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat25SDown': {code: 'accSagittalFlat25SDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp35MUp': {code: 'accSagittalSharp35MUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat35MDown': {code: 'accSagittalFlat35MDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp11MUp': {code: 'accSagittalSharp11MUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat11MDown': {code: 'accSagittalFlat11MDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp11LUp': {code: 'accSagittalSharp11LUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat11LDown': {code: 'accSagittalFlat11LDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp35LUp': {code: 'accSagittalSharp35LUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat35LDown': {code: 'accSagittalFlat35LDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp25SDown': {code: 'accSagittalDoubleSharp25SDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat25SUp': {code: 'accSagittalDoubleFlat25SUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp7CDown': {code: 'accSagittalDoubleSharp7CDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat7CUp': {code: 'accSagittalDoubleFlat7CUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp5CDown': {code: 'accSagittalDoubleSharp5CDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat5CUp': {code: 'accSagittalDoubleFlat5CUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp5v7kDown': {code: 'accSagittalDoubleSharp5v7kDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat5v7kUp': {code: 'accSagittalDoubleFlat5v7kUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp': {code: 'accSagittalDoubleSharp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat': {code: 'accSagittalDoubleFlat', parenRightPaddingAdjustment: -1},
  'accSagittal7v11KleismaUp': {code: 'accSagittal7v11KleismaUp', parenRightPaddingAdjustment: -1},
  'accSagittal7v11KleismaDown': {code: 'accSagittal7v11KleismaDown', parenRightPaddingAdjustment: -1},
  'accSagittal17CommaUp': {code: 'accSagittal17CommaUp', parenRightPaddingAdjustment: -1},
  'accSagittal17CommaDown': {code: 'accSagittal17CommaDown', parenRightPaddingAdjustment: -1},
  'accSagittal55CommaUp': {code: 'accSagittal55CommaUp', parenRightPaddingAdjustment: -1},
  'accSagittal55CommaDown': {code: 'accSagittal55CommaDown', parenRightPaddingAdjustment: -1},
  'accSagittal7v11CommaUp': {code: 'accSagittal7v11CommaUp', parenRightPaddingAdjustment: -1},
  'accSagittal7v11CommaDown': {code: 'accSagittal7v11CommaDown', parenRightPaddingAdjustment: -1},
  'accSagittal5v11SmallDiesisUp': {code: 'accSagittal5v11SmallDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal5v11SmallDiesisDown': {code: 'accSagittal5v11SmallDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5v11SDown': {code: 'accSagittalSharp5v11SDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5v11SUp': {code: 'accSagittalFlat5v11SUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp7v11CDown': {code: 'accSagittalSharp7v11CDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat7v11CUp': {code: 'accSagittalFlat7v11CUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp55CDown': {code: 'accSagittalSharp55CDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat55CUp': {code: 'accSagittalFlat55CUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp17CDown': {code: 'accSagittalSharp17CDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat17CUp': {code: 'accSagittalFlat17CUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp7v11kDown': {code: 'accSagittalSharp7v11kDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat7v11kUp': {code: 'accSagittalFlat7v11kUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp7v11kUp': {code: 'accSagittalSharp7v11kUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat7v11kDown': {code: 'accSagittalFlat7v11kDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp17CUp': {code: 'accSagittalSharp17CUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat17CDown': {code: 'accSagittalFlat17CDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp55CUp': {code: 'accSagittalSharp55CUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat55CDown': {code: 'accSagittalFlat55CDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp7v11CUp': {code: 'accSagittalSharp7v11CUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat7v11CDown': {code: 'accSagittalFlat7v11CDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5v11SUp': {code: 'accSagittalSharp5v11SUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5v11SDown': {code: 'accSagittalFlat5v11SDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp5v11SDown': {code: 'accSagittalDoubleSharp5v11SDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat5v11SUp': {code: 'accSagittalDoubleFlat5v11SUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp7v11CDown': {code: 'accSagittalDoubleSharp7v11CDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat7v11CUp': {code: 'accSagittalDoubleFlat7v11CUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp55CDown': {code: 'accSagittalDoubleSharp55CDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat55CUp': {code: 'accSagittalDoubleFlat55CUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp17CDown': {code: 'accSagittalDoubleSharp17CDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat17CUp': {code: 'accSagittalDoubleFlat17CUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp7v11kDown': {code: 'accSagittalDoubleSharp7v11kDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat7v11kUp': {code: 'accSagittalDoubleFlat7v11kUp', parenRightPaddingAdjustment: -1},
  'accSagittal23CommaUp': {code: 'accSagittal23CommaUp', parenRightPaddingAdjustment: -1},
  'accSagittal23CommaDown': {code: 'accSagittal23CommaDown', parenRightPaddingAdjustment: -1},
  'accSagittal5v19CommaUp': {code: 'accSagittal5v19CommaUp', parenRightPaddingAdjustment: -1},
  'accSagittal5v19CommaDown': {code: 'accSagittal5v19CommaDown', parenRightPaddingAdjustment: -1},
  'accSagittal5v23SmallDiesisUp': {code: 'accSagittal5v23SmallDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal5v23SmallDiesisDown': {code: 'accSagittal5v23SmallDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5v23SDown': {code: 'accSagittalSharp5v23SDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5v23SUp': {code: 'accSagittalFlat5v23SUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5v19CDown': {code: 'accSagittalSharp5v19CDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5v19CUp': {code: 'accSagittalFlat5v19CUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp23CDown': {code: 'accSagittalSharp23CDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat23CUp': {code: 'accSagittalFlat23CUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp23CUp': {code: 'accSagittalSharp23CUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat23CDown': {code: 'accSagittalFlat23CDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5v19CUp': {code: 'accSagittalSharp5v19CUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5v19CDown': {code: 'accSagittalFlat5v19CDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5v23SUp': {code: 'accSagittalSharp5v23SUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5v23SDown': {code: 'accSagittalFlat5v23SDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp5v23SDown': {code: 'accSagittalDoubleSharp5v23SDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat5v23SUp': {code: 'accSagittalDoubleFlat5v23SUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp5v19CDown': {code: 'accSagittalDoubleSharp5v19CDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat5v19CUp': {code: 'accSagittalDoubleFlat5v19CUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp23CDown': {code: 'accSagittalDoubleSharp23CDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat23CUp': {code: 'accSagittalDoubleFlat23CUp', parenRightPaddingAdjustment: -1},
  'accSagittal19SchismaUp': {code: 'accSagittal19SchismaUp', parenRightPaddingAdjustment: -1},
  'accSagittal19SchismaDown': {code: 'accSagittal19SchismaDown', parenRightPaddingAdjustment: -1},
  'accSagittal17KleismaUp': {code: 'accSagittal17KleismaUp', parenRightPaddingAdjustment: -1},
  'accSagittal17KleismaDown': {code: 'accSagittal17KleismaDown', parenRightPaddingAdjustment: -1},
  'accSagittal143CommaUp': {code: 'accSagittal143CommaUp', parenRightPaddingAdjustment: -1},
  'accSagittal143CommaDown': {code: 'accSagittal143CommaDown', parenRightPaddingAdjustment: -1},
  'accSagittal11v49CommaUp': {code: 'accSagittal11v49CommaUp', parenRightPaddingAdjustment: -1},
  'accSagittal11v49CommaDown': {code: 'accSagittal11v49CommaDown', parenRightPaddingAdjustment: -1},
  'accSagittal19CommaUp': {code: 'accSagittal19CommaUp', parenRightPaddingAdjustment: -1},
  'accSagittal19CommaDown': {code: 'accSagittal19CommaDown', parenRightPaddingAdjustment: -1},
  'accSagittal7v19CommaUp': {code: 'accSagittal7v19CommaUp', parenRightPaddingAdjustment: -1},
  'accSagittal7v19CommaDown': {code: 'accSagittal7v19CommaDown', parenRightPaddingAdjustment: -1},
  'accSagittal49SmallDiesisUp': {code: 'accSagittal49SmallDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal49SmallDiesisDown': {code: 'accSagittal49SmallDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittal23SmallDiesisUp': {code: 'accSagittal23SmallDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal23SmallDiesisDown': {code: 'accSagittal23SmallDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittal5v13MediumDiesisUp': {code: 'accSagittal5v13MediumDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal5v13MediumDiesisDown': {code: 'accSagittal5v13MediumDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittal11v19MediumDiesisUp': {code: 'accSagittal11v19MediumDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal11v19MediumDiesisDown': {code: 'accSagittal11v19MediumDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittal49MediumDiesisUp': {code: 'accSagittal49MediumDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal49MediumDiesisDown': {code: 'accSagittal49MediumDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittal5v49MediumDiesisUp': {code: 'accSagittal5v49MediumDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal5v49MediumDiesisDown': {code: 'accSagittal5v49MediumDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittal49LargeDiesisUp': {code: 'accSagittal49LargeDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal49LargeDiesisDown': {code: 'accSagittal49LargeDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittal11v19LargeDiesisUp': {code: 'accSagittal11v19LargeDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal11v19LargeDiesisDown': {code: 'accSagittal11v19LargeDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittal5v13LargeDiesisUp': {code: 'accSagittal5v13LargeDiesisUp', parenRightPaddingAdjustment: -1},
  'accSagittal5v13LargeDiesisDown': {code: 'accSagittal5v13LargeDiesisDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp23SDown': {code: 'accSagittalSharp23SDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat23SUp': {code: 'accSagittalFlat23SUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp49SDown': {code: 'accSagittalSharp49SDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat49SUp': {code: 'accSagittalFlat49SUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp7v19CDown': {code: 'accSagittalSharp7v19CDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat7v19CUp': {code: 'accSagittalFlat7v19CUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp19CDown': {code: 'accSagittalSharp19CDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat19CUp': {code: 'accSagittalFlat19CUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp11v49CDown': {code: 'accSagittalSharp11v49CDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat11v49CUp': {code: 'accSagittalFlat11v49CUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp143CDown': {code: 'accSagittalSharp143CDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat143CUp': {code: 'accSagittalFlat143CUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp17kDown': {code: 'accSagittalSharp17kDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat17kUp': {code: 'accSagittalFlat17kUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp19sDown': {code: 'accSagittalSharp19sDown', parenRightPaddingAdjustment: -1},
  'accSagittalFlat19sUp': {code: 'accSagittalFlat19sUp', parenRightPaddingAdjustment: -1},
  'accSagittalSharp19sUp': {code: 'accSagittalSharp19sUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat19sDown': {code: 'accSagittalFlat19sDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp17kUp': {code: 'accSagittalSharp17kUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat17kDown': {code: 'accSagittalFlat17kDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp143CUp': {code: 'accSagittalSharp143CUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat143CDown': {code: 'accSagittalFlat143CDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp11v49CUp': {code: 'accSagittalSharp11v49CUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat11v49CDown': {code: 'accSagittalFlat11v49CDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp19CUp': {code: 'accSagittalSharp19CUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat19CDown': {code: 'accSagittalFlat19CDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp7v19CUp': {code: 'accSagittalSharp7v19CUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat7v19CDown': {code: 'accSagittalFlat7v19CDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp49SUp': {code: 'accSagittalSharp49SUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat49SDown': {code: 'accSagittalFlat49SDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp23SUp': {code: 'accSagittalSharp23SUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat23SDown': {code: 'accSagittalFlat23SDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5v13MUp': {code: 'accSagittalSharp5v13MUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5v13MDown': {code: 'accSagittalFlat5v13MDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp11v19MUp': {code: 'accSagittalSharp11v19MUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat11v19MDown': {code: 'accSagittalFlat11v19MDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp49MUp': {code: 'accSagittalSharp49MUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat49MDown': {code: 'accSagittalFlat49MDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5v49MUp': {code: 'accSagittalSharp5v49MUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5v49MDown': {code: 'accSagittalFlat5v49MDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp49LUp': {code: 'accSagittalSharp49LUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat49LDown': {code: 'accSagittalFlat49LDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp11v19LUp': {code: 'accSagittalSharp11v19LUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat11v19LDown': {code: 'accSagittalFlat11v19LDown', parenRightPaddingAdjustment: -1},
  'accSagittalSharp5v13LUp': {code: 'accSagittalSharp5v13LUp', parenRightPaddingAdjustment: -1},
  'accSagittalFlat5v13LDown': {code: 'accSagittalFlat5v13LDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp23SDown': {code: 'accSagittalDoubleSharp23SDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat23SUp': {code: 'accSagittalDoubleFlat23SUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp49SDown': {code: 'accSagittalDoubleSharp49SDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat49SUp': {code: 'accSagittalDoubleFlat49SUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp7v19CDown': {code: 'accSagittalDoubleSharp7v19CDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat7v19CUp': {code: 'accSagittalDoubleFlat7v19CUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp19CDown': {code: 'accSagittalDoubleSharp19CDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat19CUp': {code: 'accSagittalDoubleFlat19CUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp11v49CDown': {code: 'accSagittalDoubleSharp11v49CDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat11v49CUp': {code: 'accSagittalDoubleFlat11v49CUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp143CDown': {code: 'accSagittalDoubleSharp143CDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat143CUp': {code: 'accSagittalDoubleFlat143CUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp17kDown': {code: 'accSagittalDoubleSharp17kDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat17kUp': {code: 'accSagittalDoubleFlat17kUp', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleSharp19sDown': {code: 'accSagittalDoubleSharp19sDown', parenRightPaddingAdjustment: -1},
  'accSagittalDoubleFlat19sUp': {code: 'accSagittalDoubleFlat19sUp', parenRightPaddingAdjustment: -1},
  'accSagittalShaftUp': {code: 'accSagittalShaftUp', parenRightPaddingAdjustment: -1},
  'accSagittalShaftDown': {code: 'accSagittalShaftDown', parenRightPaddingAdjustment: -1},
  'accSagittalAcute': {code: 'accSagittalAcute', parenRightPaddingAdjustment: -1},
  'accSagittalGrave': {code: 'accSagittalGrave', parenRightPaddingAdjustment: -1},
  'accSagittal1MinaUp': {code: 'accSagittal1MinaUp', parenRightPaddingAdjustment: -1},
  'accSagittal1MinaDown': {code: 'accSagittal1MinaDown', parenRightPaddingAdjustment: -1},
  'accSagittal2MinasUp': {code: 'accSagittal2MinasUp', parenRightPaddingAdjustment: -1},
  'accSagittal2MinasDown': {code: 'accSagittal2MinasDown', parenRightPaddingAdjustment: -1},
  'accSagittal1TinaUp': {code: 'accSagittal1TinaUp', parenRightPaddingAdjustment: -1},
  'accSagittal1TinaDown': {code: 'accSagittal1TinaDown', parenRightPaddingAdjustment: -1},
  'accSagittal2TinasUp': {code: 'accSagittal2TinasUp', parenRightPaddingAdjustment: -1},
  'accSagittal2TinasDown': {code: 'accSagittal2TinasDown', parenRightPaddingAdjustment: -1},
  'accSagittal3TinasUp': {code: 'accSagittal3TinasUp', parenRightPaddingAdjustment: -1},
  'accSagittal3TinasDown': {code: 'accSagittal3TinasDown', parenRightPaddingAdjustment: -1},
  'accSagittal4TinasUp': {code: 'accSagittal4TinasUp', parenRightPaddingAdjustment: -1},
  'accSagittal4TinasDown': {code: 'accSagittal4TinasDown', parenRightPaddingAdjustment: -1},
  'accSagittal5TinasUp': {code: 'accSagittal5TinasUp', parenRightPaddingAdjustment: -1},
  'accSagittal5TinasDown': {code: 'accSagittal5TinasDown', parenRightPaddingAdjustment: -1},
  'accSagittal6TinasUp': {code: 'accSagittal6TinasUp', parenRightPaddingAdjustment: -1},
  'accSagittal6TinasDown': {code: 'accSagittal6TinasDown', parenRightPaddingAdjustment: -1},
  'accSagittal7TinasUp': {code: 'accSagittal7TinasUp', parenRightPaddingAdjustment: -1},
  'accSagittal7TinasDown': {code: 'accSagittal7TinasDown', parenRightPaddingAdjustment: -1},
  'accSagittal8TinasUp': {code: 'accSagittal8TinasUp', parenRightPaddingAdjustment: -1},
  'accSagittal8TinasDown': {code: 'accSagittal8TinasDown', parenRightPaddingAdjustment: -1},
  'accSagittal9TinasUp': {code: 'accSagittal9TinasUp', parenRightPaddingAdjustment: -1},
  'accSagittal9TinasDown': {code: 'accSagittal9TinasDown', parenRightPaddingAdjustment: -1},
  'accSagittalFractionalTinaUp': {code: 'accSagittalFractionalTinaUp', parenRightPaddingAdjustment: -1},
  'accSagittalFractionalTinaDown': {code: 'accSagittalFractionalTinaDown', parenRightPaddingAdjustment: -1},
  'accidentalNarrowReversedFlat': {code: 'accidentalNarrowReversedFlat', parenRightPaddingAdjustment: -1},
  'accidentalNarrowReversedFlatAndFlat': {code: 'accidentalNarrowReversedFlatAndFlat', parenRightPaddingAdjustment: -1},
  'accidentalWilsonPlus': {code: 'accidentalWilsonPlus', parenRightPaddingAdjustment: -1},
  'accidentalWilsonMinus': {code: 'accidentalWilsonMinus', parenRightPaddingAdjustment: -1},
};

Flow.accidentalColumnsTable = {
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

Flow.ornamentCodes = function(acc): ICodeValue {
  return Flow.ornamentCodes.ornaments[acc];
} as IOrnamentCodes;

Flow.ornamentCodes.ornaments = {
  'mordent': {code: 'ornamentShortTrill'},
  'mordent_inverted': {code: 'ornamentMordent'},
  'turn': {code: 'ornamentTurn'},
  'turn_inverted': {code: 'ornamentTurnSlash'},
  'tr': {code: 'ornamentTrill'},
  'upprall': {code: 'ornamentPrecompSlideTrillDAnglebert'},
  'downprall': {code: 'ornamentPrecompDoubleCadenceUpperPrefix'},
  'prallup': {code: 'ornamentPrecompTrillSuffixDandrieu'},
  'pralldown': {code: 'ornamentPrecompTrillLowerSuffix'},
  'upmordent': {code: 'ornamentPrecompSlideTrillBach'},
  'downmordent': {code: 'ornamentPrecompDoubleCadenceUpperPrefixTurn'},
  'lineprall': {code: 'ornamentPrecompAppoggTrill'},
  'prallprall': {code: 'ornamentTremblement'},
  'scoop': {code: 'brassScoop'},
  'doit': {code: 'brassDoitMedium'},
  'fall': {code: 'brassFallLipShort'},
  'doitLong': {code: 'brassLiftMedium'},
  'fallLong': {code: 'brassFallRoughMedium'},
  'bend': {code: 'brassBend'},
  'plungerClosed': {code: 'brassMuteClosed'},
  'plungerOpen': {code: 'brassMuteOpen'},
  'flip': {code: 'brassFlip'},
  'jazzTurn': {code: 'brassJazzTurn'},
  'smear': {code: 'brassSmear'}
};

Flow.keySignature = function(spec: string): IAccItem[] {
  const keySpec = Flow.keySignature.keySpecs[spec];

  if (!keySpec) {
    throw new Vex.RERR('BadKeySignature', `Bad key signature spec: '${spec}'`);
  }

  if (!keySpec.acc) {
    return [];
  }

  const notes = Flow.keySignature.accidentalList(keySpec.acc);

  const acc_list: IAccItem[] = [];
  for (let i = 0; i < keySpec.num; ++i) {
    const line = notes[i];
    acc_list.push({type: keySpec.acc, line});
  }

  return acc_list;
} as IKeySignature;

Flow.keySignature.keySpecs = {
  'C': {acc: null, num: 0},
  'Am': {acc: null, num: 0},
  'F': {acc: 'b', num: 1},
  'Dm': {acc: 'b', num: 1},
  'Bb': {acc: 'b', num: 2},
  'Gm': {acc: 'b', num: 2},
  'Eb': {acc: 'b', num: 3},
  'Cm': {acc: 'b', num: 3},
  'Ab': {acc: 'b', num: 4},
  'Fm': {acc: 'b', num: 4},
  'Db': {acc: 'b', num: 5},
  'Bbm': {acc: 'b', num: 5},
  'Gb': {acc: 'b', num: 6},
  'Ebm': {acc: 'b', num: 6},
  'Cb': {acc: 'b', num: 7},
  'Abm': {acc: 'b', num: 7},
  'G': {acc: '#', num: 1},
  'Em': {acc: '#', num: 1},
  'D': {acc: '#', num: 2},
  'Bm': {acc: '#', num: 2},
  'A': {acc: '#', num: 3},
  'F#m': {acc: '#', num: 3},
  'E': {acc: '#', num: 4},
  'C#m': {acc: '#', num: 4},
  'B': {acc: '#', num: 5},
  'G#m': {acc: '#', num: 5},
  'F#': {acc: '#', num: 6},
  'D#m': {acc: '#', num: 6},
  'C#': {acc: '#', num: 7},
  'A#m': {acc: '#', num: 7},
};

Flow.unicode = {
  // Unicode accidentals
  'sharp': String.fromCharCode(parseInt('266F', 16)),
  'flat': String.fromCharCode(parseInt('266D', 16)),
  'natural': String.fromCharCode(parseInt('266E', 16)),
  // Major Chord
  'triangle': String.fromCharCode(parseInt('25B3', 16)),
  // half-diminished
  'o-with-slash': String.fromCharCode(parseInt('00F8', 16)),
  // Diminished
  'degrees': String.fromCharCode(parseInt('00B0', 16)),
  'circle': String.fromCharCode(parseInt('25CB', 16)),
};

Flow.keySignature.accidentalList = (acc) => {
  const patterns = {
    'b': [2, 0.5, 2.5, 1, 3, 1.5, 3.5],
    '#': [0, 1.5, -0.5, 1, 2.5, 0.5, 2],
  } as Record<string, number[]>;

  return patterns[acc];
};

// Used to convert duration aliases to the number based duration.
// If the input isn't an alias, simply return the input.
//
// example: 'q' -> '4', '8' -> '8'
Flow.sanitizeDuration = function(duration) {
  const alias = Flow.durationAliases[duration];
  if (alias !== undefined) {
    duration = alias;
  }

  if (Flow.durationToTicks.durations[duration] === undefined) {
    throw new Vex.RERR('BadArguments', `The provided duration is not valid: ${duration}`);
  }

  return duration;
};

// Convert the `duration` to an fraction
Flow.durationToFraction = (duration: string) => new Fraction().parse(Flow.sanitizeDuration(duration));

// Convert the `duration` to an number
Flow.durationToNumber = duration => Flow.durationToFraction(duration).value();

// Convert the `duration` to total ticks
Flow.durationToTicks = function(duration) {
  duration = Flow.sanitizeDuration(duration);

  const ticks = Flow.durationToTicks.durations[duration];
  if (ticks === undefined) {
    return null;
  }

  return ticks;
} as IDurationToTicks;

Flow.durationToTicks.durations = {
  '1/2': Flow.RESOLUTION * 2,
  '1': Flow.RESOLUTION,
  '2': Flow.RESOLUTION / 2,
  '4': Flow.RESOLUTION / 4,
  '8': Flow.RESOLUTION / 8,
  '16': Flow.RESOLUTION / 16,
  '32': Flow.RESOLUTION / 32,
  '64': Flow.RESOLUTION / 64,
  '128': Flow.RESOLUTION / 128,
  '256': Flow.RESOLUTION / 256,
};

Flow.durationAliases = {
  'w': '1',
  'h': '2',
  'q': '4',

  // This is the default duration used to render bars (BarNote). Bars no longer
  // consume ticks, so this should be a no-op.
  //
  // TODO(0xfe): This needs to be cleaned up.
  'b': '256',
};

// Return a glyph given duration and type. The type can be a custom glyph code from customNoteHeads.
Flow.getGlyphProps = function(duration: string, type?: string) {
  duration = Flow.sanitizeDuration(duration);
  type = type || 'n'; // default type is a regular note

  // Lookup duration for default glyph head code
  const code = Flow.getGlyphProps.duration_codes[duration];
  if (code === undefined) {
    return null;
  }

  // Get glyph properties for 'type' from duration string (note, rest, harmonic, muted, slash)
  let glyphTypeProperties = code.type[type];

  // If this isn't a standard type, then lookup the custom note head map.
  if (glyphTypeProperties === undefined) {
    // Try and get it from the custom list of note heads
    const customGlyphTypeProperties = Flow.keyProperties.customNoteHeads[type.toUpperCase()];

    // If not, then return with nothing
    if (customGlyphTypeProperties === undefined) {
      return null;
    }

    // Otherwise set it as the code_head value
    glyphTypeProperties = {
      code_head: customGlyphTypeProperties.code,
      ...customGlyphTypeProperties,
    };
  }

  // Merge duration props for 'duration' with the note head properties.
  return {...code.common, ...glyphTypeProperties};
} as IGlyphProps;

Flow.getGlyphProps.validTypes = {
  'n': {name: 'note'},
  'r': {name: 'rest'},
  'h': {name: 'harmonic'},
  'm': {name: 'muted'},
  's': {name: 'slash'},
};

// Custom note heads
Flow.keyProperties.customNoteHeads = {
  /* Diamond */
  'D0': {code: 'noteheadDiamondWhole'} as IType,
  'D1': {code: 'noteheadDiamondHalf'} as IType,
  'D2': {code: 'noteheadDiamondBlack'} as IType,
  'D3': {code: 'noteheadDiamondBlack'} as IType,

  /* Triangle */
  'T0': {code: 'noteheadTriangleUpWhole'} as IType,
  'T1': {code: 'noteheadTriangleUpHalf'} as IType,
  'T2': {code: 'noteheadTriangleUpBlack'} as IType,
  'T3': {code: 'noteheadTriangleUpBlack'} as IType,

  /* Cross */
  'X0': {code: 'noteheadXWhole'} as IType,
  'X1': {code: 'noteheadXHalf'} as IType,
  'X2': {code: 'noteheadXBlack'} as IType,
  'X3': {code: 'noteheadCircleX'} as IType,

  /* Square */
  'S1': {code: 'noteheadSquareWhite'} as IType,
  'S2': {code: 'noteheadSquareBlack'} as IType,

  /* Rectangle */
  'R1': {code: 'vexNoteHeadRectWhite'} as IType, // no smufl code
  'R2': {code: 'vexNoteHeadRectBlack'} as IType, // no smufl code
};

Flow.getGlyphProps.duration_codes = {
  '1/2': {
    common: {
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'v53', scale).getMetrics().width;
      },
      stem: false,
      stem_offset: 0,
      flag: false,
      stem_up_extension: -Flow.STEM_HEIGHT,
      stem_down_extension: -Flow.STEM_HEIGHT,
      tabnote_stem_up_extension: -Flow.STEM_HEIGHT,
      tabnote_stem_down_extension: -Flow.STEM_HEIGHT,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    } as IType,
    type: {
      'n': { // Breve note
        code_head: 'noteheadDoubleWhole',
      } as IType,
      'h': { // Breve note harmonic
        code_head: 'unpitchedPercussionClef1',
      } as IType,
      'm': { // Breve note muted -
        code_head: 'vexNoteHeadMutedBreve',
        stem_offset: 0,
      } as IType,
      'r': { // Breve rest
        code_head: 'restDoubleWhole',
        rest: true,
        position: 'B/5',
        dot_shiftY: 0.5,
      } as IType,
      's': { // Breve note slash -
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      } as IType,
    },
  },
  '1': {
    common: {
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'v1d', scale).getMetrics().width;
      },
      stem: false,
      stem_offset: 0,
      flag: false,
      stem_up_extension: -Flow.STEM_HEIGHT,
      stem_down_extension: -Flow.STEM_HEIGHT,
      tabnote_stem_up_extension: -Flow.STEM_HEIGHT,
      tabnote_stem_down_extension: -Flow.STEM_HEIGHT,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    } as IType,
    type: {
      'n': { // Whole note
        code_head: 'noteheadWhole',
      } as IType,
      'h': { // Whole note harmonic
        code_head: 'noteheadDiamondWhole',
      } as IType,
      'm': { // Whole note muted
        code_head: 'noteheadXWhole',
        stem_offset: -3,
      } as IType,
      'r': { // Whole rest
        code_head: 'restWhole',
        rest: true,
        position: 'D/5',
        dot_shiftY: 0.5,
      } as IType,
      's': { // Whole note slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      } as IType,
    },
  },
  '2': {
    common: {
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'noteheadHalf', scale).getMetrics().width;
      },
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
    } as IType,
    type: {
      'n': { // Half note
        code_head: 'noteheadHalf',
      } as IType,
      'h': { // Half note harmonic
        code_head: 'noteheadDiamondHalf',
      } as IType,
      'm': { // Half note muted
        code_head: 'noteheadXHalf',
        stem_offset: -3,
      } as IType,
      'r': { // Half rest
        code_head: 'restHalf',
        stem: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -0.5,
      } as IType,
      's': { // Half note slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      } as IType,
    },
  },
  '4': {
    common: {
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'noteheadBlack', scale).getMetrics().width;
      },
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
    } as IType,
    type: {
      'n': { // Quarter note
        code_head: 'noteheadBlack',
      } as IType,
      'h': { // Quarter harmonic
        code_head: 'noteheadDiamondBlack',
      } as IType,
      'm': { // Quarter muted
        code_head: 'noteheadXBlack',
      } as IType,
      'r': { // Quarter rest
        code_head: 'restQuarter',
        stem: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -0.5,
        line_above: 1.5,
        line_below: 1.5,
      } as IType,
      's': { // Quarter slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      } as IType,
    },
  },
  '8': {
    common: {
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'noteheadBlack', scale).getMetrics().width;
      },
      stem: true,
      stem_offset: 0,
      flag: true,
      beam_count: 1,
      code_flag_upstem: 'flag8thUp',
      code_flag_downstem: 'flag8thDown',
      stem_up_extension: 0,
      stem_down_extension: 0,
      tabnote_stem_up_extension: 0,
      tabnote_stem_down_extension: 0,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    } as IType,
    type: {
      'n': { // Eighth note
        code_head: 'noteheadBlack',
      } as IType,
      'h': { // Eighth note harmonic
        code_head: 'noteheadDiamondBlack',
      } as IType,
      'm': { // Eighth note muted
        code_head: 'noteheadXBlack',
      } as IType,
      'r': { // Eighth rest
        code_head: 'rest8th',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -0.5,
        line_above: 1.0,
        line_below: 1.0,
      } as IType,
      's': { // Eight slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      } as IType,
    },
  },
  '16': {
    common: {
      beam_count: 2,
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'noteheadBlack', scale).getMetrics().width;
      },
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
    } as IType,
    type: {
      'n': { // Sixteenth note
        code_head: 'noteheadBlack',
      } as IType,
      'h': { // Sixteenth note harmonic
        code_head: 'noteheadDiamondBlack',
      } as IType,
      'm': { // Sixteenth note muted
        code_head: 'noteheadXBlack',
      } as IType,
      'r': { // Sixteenth rest
        code_head: 'rest16th',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -0.5,
        line_above: 1.0,
        line_below: 2.0,
      } as IType,
      's': { // Sixteenth slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      } as IType,
    },
  },
  '32': {
    common: {
      beam_count: 3,
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'noteheadBlack', scale).getMetrics().width;
      },
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: 'flag32ndUp',
      code_flag_downstem: 'flag32ndDown',
      stem_up_extension: 9,
      stem_down_extension: 9,
      tabnote_stem_up_extension: 8,
      tabnote_stem_down_extension: 5,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    } as IType,
    type: {
      'n': { // Thirty-second note
        code_head: 'noteheadBlack',
      } as IType,
      'h': { // Thirty-second harmonic
        code_head: 'noteheadDiamondBlack',
      } as IType,
      'm': { // Thirty-second muted
        code_head: 'noteheadXBlack',
      } as IType,
      'r': { // Thirty-second rest
        code_head: 'rest32nd',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -1.5,
        line_above: 2.0,
        line_below: 2.0,
      } as IType,
      's': { // Thirty-second slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      } as IType,
    },
  },
  '64': {
    common: {
      beam_count: 4,
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'noteheadBlack', scale).getMetrics().width;
      },
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: 'flag64thUp',
      code_flag_downstem: 'flag64thDown',
      stem_up_extension: 13,
      stem_down_extension: 13,
      tabnote_stem_up_extension: 12,
      tabnote_stem_down_extension: 9,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    } as IType,
    type: {
      'n': { // Sixty-fourth note
        code_head: 'noteheadBlack',
      } as IType,
      'h': { // Sixty-fourth harmonic
        code_head: 'noteheadDiamondBlack',
      } as IType,
      'm': { // Sixty-fourth muted
        code_head: 'noteheadXBlack',
      } as IType,
      'r': { // Sixty-fourth rest
        code_head: 'rest64th',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -1.5,
        line_above: 2.0,
        line_below: 3.0,
      } as IType,
      's': { // Sixty-fourth slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      } as IType,
    },
  },
  '128': {
    common: {
      beam_count: 5,
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'noteheadBlack', scale).getMetrics().width;
      },
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: 'flag128thUp',
      code_flag_downstem: 'flag128thDown',
      stem_up_extension: 22,
      stem_down_extension: 22,
      tabnote_stem_up_extension: 21,
      tabnote_stem_down_extension: 18,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    } as IType,
    type: {
      'n': {  // Hundred-twenty-eight note
        code_head: 'noteheadBlack',
      } as IType,
      'h': { // Hundred-twenty-eight harmonic
        code_head: 'noteheadDiamondBlack',
      } as IType,
      'm': { // Hundred-twenty-eight muted
        code_head: 'noteheadXBlack',
      } as IType,
      'r': {  // Hundred-twenty-eight rest
        code_head: 'rest128th',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: 1.5,
        line_above: 3.0,
        line_below: 3.0,
      } as IType,
      's': { // Hundred-twenty-eight rest
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      } as IType,
    },
  },
};

// Some defaults
Flow.TIME4_4 = {
  num_beats: 4,
  beat_value: 4,
  resolution: Flow.RESOLUTION,
};

Flow.BoundingBox = BoundingBox;

export {Flow};
