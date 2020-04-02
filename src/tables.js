// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

/* eslint-disable key-spacing */

import { Vex } from './vex';
import { Fraction } from './fraction';
import { Glyph } from './glyph';

const Flow = {
  STEM_WIDTH: 1.5,
  STEM_HEIGHT: 35,
  STAVE_LINE_THICKNESS: 1,
  RESOLUTION: 16384,
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
};


Flow.clefProperties = clef => {
  if (!clef) throw new Vex.RERR('BadArgument', 'Invalid clef: ' + clef);

  const props = Flow.clefProperties.values[clef];
  if (!props) throw new Vex.RERR('BadArgument', 'Invalid clef: ' + clef);

  return props;
};

Flow.clefProperties.values = {
  'treble': { line_shift: 0 },
  'bass': { line_shift: 6 },
  'tenor': { line_shift: 4 },
  'alto': { line_shift: 3 },
  'soprano': { line_shift: 1 },
  'percussion': { line_shift: 0 },
  'mezzo-soprano': { line_shift: 2 },
  'baritone-c': { line_shift: 5 },
  'baritone-f': { line_shift: 5 },
  'subbass': { line_shift: 7 },
  'french': { line_shift: -1 },
};

/*
  Take a note in the format "Key/Octave" (e.g., "C/5") and return properties.

  The last argument, params, is a struct the currently can contain one option,
  octave_shift for clef ottavation (0 = default; 1 = 8va; -1 = 8vb, etc.).
*/
Flow.keyProperties = (key, clef, params) => {
  if (clef === undefined) {
    clef = 'treble';
  }

  const options = { octave_shift: 0 };

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
  let extraProps = {};
  if (pieces.length > 2 && pieces[2]) {
    const glyph_name = pieces[2].toUpperCase();
    extraProps = Flow.keyProperties.customNoteHeads[glyph_name] || {};
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
  };
};

Flow.keyProperties.note_values = {
  'C': { index: 0, int_val: 0, accidental: null },
  'CN': { index: 0, int_val: 0, accidental: 'n' },
  'C#': { index: 0, int_val: 1, accidental: '#' },
  'C##': { index: 0, int_val: 2, accidental: '##' },
  'CB': { index: 0, int_val: -1, accidental: 'b' },
  'CBB': { index: 0, int_val: -2, accidental: 'bb' },
  'D': { index: 1, int_val: 2, accidental: null },
  'DN': { index: 1, int_val: 2, accidental: 'n' },
  'D#': { index: 1, int_val: 3, accidental: '#' },
  'D##': { index: 1, int_val: 4, accidental: '##' },
  'DB': { index: 1, int_val: 1, accidental: 'b' },
  'DBB': { index: 1, int_val: 0, accidental: 'bb' },
  'E': { index: 2, int_val: 4, accidental: null },
  'EN': { index: 2, int_val: 4, accidental: 'n' },
  'E#': { index: 2, int_val: 5, accidental: '#' },
  'E##': { index: 2, int_val: 6, accidental: '##' },
  'EB': { index: 2, int_val: 3, accidental: 'b' },
  'EBB': { index: 2, int_val: 2, accidental: 'bb' },
  'F': { index: 3, int_val: 5, accidental: null },
  'FN': { index: 3, int_val: 5, accidental: 'n' },
  'F#': { index: 3, int_val: 6, accidental: '#' },
  'F##': { index: 3, int_val: 7, accidental: '##' },
  'FB': { index: 3, int_val: 4, accidental: 'b' },
  'FBB': { index: 3, int_val: 3, accidental: 'bb' },
  'G': { index: 4, int_val: 7, accidental: null },
  'GN': { index: 4, int_val: 7, accidental: 'n' },
  'G#': { index: 4, int_val: 8, accidental: '#' },
  'G##': { index: 4, int_val: 9, accidental: '##' },
  'GB': { index: 4, int_val: 6, accidental: 'b' },
  'GBB': { index: 4, int_val: 5, accidental: 'bb' },
  'A': { index: 5, int_val: 9, accidental: null },
  'AN': { index: 5, int_val: 9, accidental: 'n' },
  'A#': { index: 5, int_val: 10, accidental: '#' },
  'A##': { index: 5, int_val: 11, accidental: '##' },
  'AB': { index: 5, int_val: 8, accidental: 'b' },
  'ABB': { index: 5, int_val: 7, accidental: 'bb' },
  'B': { index: 6, int_val: 11, accidental: null },
  'BN': { index: 6, int_val: 11, accidental: 'n' },
  'B#': { index: 6, int_val: 12, accidental: '#' },
  'B##': { index: 6, int_val: 13, accidental: '##' },
  'BB': { index: 6, int_val: 10, accidental: 'b' },
  'BBB': { index: 6, int_val: 9, accidental: 'bb' },
  'R': { index: 6, int_val: 9, rest: true }, // Rest
  'X': {
    index: 6,
    accidental: '',
    octave: 4,
    code: 'v3e',
    shift_right: 5.5,
  },
};

// Custom note heads
Flow.keyProperties.customNoteHeads = {
  /* Diamond */
  'D0': {
    code: 'v27',
    shift_right: 0, // deprecated for stem_{up,down}_x_offset
    stem_up_x_offset: 0,
    stem_down_x_offset: 0,
    stem_up_y_offset: -1,
    stem_down_y_offset: 0
  },
  'D1': { code: 'v2d', shift_right: -0.5 },
  'D2': { code: 'v22', shift_right: -0.5 },
  'D3': { code: 'v70', shift_right: -0.5 },

  /* Triangle */
  'T0': { code: 'v49', shift_right: -2, stem_up_y_offset: -4, stem_down_y_offset: 4 },
  'T1': { code: 'v93', shift_right: 0.5, stem_up_y_offset: -4, stem_down_y_offset: 4 },
  'T2': { code: 'v40', shift_right: 0.5, stem_up_y_offset: -4, stem_down_y_offset: 4 },
  'T3': { code: 'v7d', shift_right: 0.5, stem_up_y_offset: -4, stem_down_y_offset: 4 },

  /* Cross */
  'X0': {
    code: 'v92',
    stem_up_x_offset: -2,
    stem_down_x_offset: 0,
    stem_up_y_offset: 4,
    stem_down_y_offset: 4
  },
  'X1': { code: 'v95', shift_right: -0.5, stem_up_y_offset: 4, stem_down_y_offset: 4 },
  'X2': { code: 'v3e', shift_right: 0.5, stem_up_y_offset: 4, stem_down_y_offset: 4 },
  'X3': {
    code: 'v3b',
    shift_right: 0,
    stem_up_x_offset: -1.2,
    stem_down_x_offset: 0,
    stem_up_y_offset: -1,
    stem_down_y_offset: 2
  },

  /* Square */
  'S1': { code: 'vd3', shift_right: 0 },
  'S2': { code: 'vd2', shift_right: 0 },

  /* Rectangle */
  'R1': { code: 'vd5', shift_right: 0 },
  'R2': { code: 'vd4', shift_right: 0 },
};

Flow.integerToNote = integer => {
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
};

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

Flow.tabToGlyph = (fret, scale = 1.0) => {
  let glyph = null;
  let width = 0;
  let shift_y = 0;

  if (fret.toString().toUpperCase() === 'X') {
    const glyphMetrics = new Glyph('v7f', Flow.DEFAULT_TABLATURE_FONT_SCALE).getMetrics();
    glyph = 'v7f';
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

Flow.articulationCodes = artic => Flow.articulationCodes.articulations[artic];

Flow.articulationCodes.articulations = {
  'a.': { code: 'v23', between_lines: true }, // Staccato
  'av': { code: 'v28', between_lines: true }, // Staccatissimo
  'a>': { code: 'v42', between_lines: true }, // Accent
  'a-': { code: 'v25', between_lines: true }, // Tenuto
  'a^': { code: 'va', between_lines: false }, // Marcato
  'a+': { code: 'v8b', between_lines: false }, // Left hand pizzicato
  'ao': { code: 'v94', between_lines: false }, // Snap pizzicato
  'ah': { code: 'vb9', between_lines: false }, // Natural harmonic or open note
  'a@a': { code: 'v43', between_lines: false }, // Fermata above staff
  'a@u': { code: 'v5b', between_lines: false }, // Fermata below staff
  'a|': { code: 'v75', between_lines: false }, // Bow up - up stroke
  'am': { code: 'v97', between_lines: false }, // Bow down - down stroke
  'a,': { code: 'vb3', between_lines: false }, // Choked
};

Flow.accidentalCodes = acc => Flow.accidentalCodes.accidentals[acc];

Flow.accidentalCodes.accidentals = {
  '#': { code: 'v18', parenRightPaddingAdjustment: -1 },
  '##': { code: 'v7f', parenRightPaddingAdjustment: -1 },
  'b': { code: 'v44', parenRightPaddingAdjustment: -2 },
  'bb': { code: 'v26', parenRightPaddingAdjustment: -2 },
  'n': { code: 'v4e', parenRightPaddingAdjustment: -1 },
  '{': { code: 'v9c', parenRightPaddingAdjustment: -1 },
  '}': { code: 'v84', parenRightPaddingAdjustment: -1 },
  'db': { code: 'v9e', parenRightPaddingAdjustment: -1 },
  'd': { code: 'vab', parenRightPaddingAdjustment: 0 },
  'bbs': { code: 'v90', parenRightPaddingAdjustment: -1 },
  '++': { code: 'v51', parenRightPaddingAdjustment: -1 },
  '+': { code: 'v78', parenRightPaddingAdjustment: -1 },
  '+-': { code: 'v8d', parenRightPaddingAdjustment: -1 },
  '++-': { code: 'v7a', parenRightPaddingAdjustment: -1 },
  'bs': { code: 'vb7', parenRightPaddingAdjustment: -1 },
  'bss': { code: 'v39', parenRightPaddingAdjustment: -1 },
  'o': { code: 'vd0', parenRightPaddingAdjustment: -1 },
  'k': { code: 'vd1', parenRightPaddingAdjustment: -1 },
  'ashs': { code: 'vd6', parenRightPaddingAdjustment: -1 },  // arabic sharp half sharp
  'afhf': { code: 'vd7', parenRightPaddingAdjustment: -1 },  // arabic flat half flat
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

Flow.ornamentCodes = acc => Flow.ornamentCodes.ornaments[acc];

Flow.ornamentCodes.ornaments = {
  'mordent': { code: 'v1e' },
  'mordent_inverted': { code: 'v45' },
  'turn': { code: 'v72' },
  'turn_inverted': { code: 'v33' },
  'tr': { code: 'v1f' },
  'upprall': { code: 'v60' },
  'downprall': { code: 'vb4' },
  'prallup': { code: 'v6d' },
  'pralldown': { code: 'v2c' },
  'upmordent': { code: 'v29' },
  'downmordent': { code: 'v68' },
  'lineprall': { code: 'v20' },
  'prallprall': { code: 'v86' },
};

Flow.keySignature = spec => {
  const keySpec = Flow.keySignature.keySpecs[spec];

  if (!keySpec) {
    throw new Vex.RERR('BadKeySignature', `Bad key signature spec: '${spec}'`);
  }

  if (!keySpec.acc) {
    return [];
  }

  const notes = Flow.keySignature.accidentalList(keySpec.acc);

  const acc_list = [];
  for (let i = 0; i < keySpec.num; ++i) {
    const line = notes[i];
    acc_list.push({ type: keySpec.acc, line });
  }

  return acc_list;
};

Flow.keySignature.keySpecs = {
  'C': { acc: null, num: 0 },
  'Am': { acc: null, num: 0 },
  'F': { acc: 'b', num: 1 },
  'Dm': { acc: 'b', num: 1 },
  'Bb': { acc: 'b', num: 2 },
  'Gm': { acc: 'b', num: 2 },
  'Eb': { acc: 'b', num: 3 },
  'Cm': { acc: 'b', num: 3 },
  'Ab': { acc: 'b', num: 4 },
  'Fm': { acc: 'b', num: 4 },
  'Db': { acc: 'b', num: 5 },
  'Bbm': { acc: 'b', num: 5 },
  'Gb': { acc: 'b', num: 6 },
  'Ebm': { acc: 'b', num: 6 },
  'Cb': { acc: 'b', num: 7 },
  'Abm': { acc: 'b', num: 7 },
  'G': { acc: '#', num: 1 },
  'Em': { acc: '#', num: 1 },
  'D': { acc: '#', num: 2 },
  'Bm': { acc: '#', num: 2 },
  'A': { acc: '#', num: 3 },
  'F#m': { acc: '#', num: 3 },
  'E': { acc: '#', num: 4 },
  'C#m': { acc: '#', num: 4 },
  'B': { acc: '#', num: 5 },
  'G#m': { acc: '#', num: 5 },
  'F#': { acc: '#', num: 6 },
  'D#m': { acc: '#', num: 6 },
  'C#': { acc: '#', num: 7 },
  'A#m': { acc: '#', num: 7 },
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
  };

  return patterns[acc];
};

Flow.parseNoteDurationString = durationString => {
  if (typeof (durationString) !== 'string') {
    return null;
  }

  const regexp = /(\d*\/?\d+|[a-z])(d*)([nrhms]|$)/;

  const result = regexp.exec(durationString);
  if (!result) {
    return null;
  }

  const duration = result[1];
  const dots = result[2].length;
  let type = result[3];

  if (type.length === 0) {
    type = 'n';
  }

  return {
    duration,
    dots,
    type,
  };
};

Flow.parseNoteStruct = noteStruct => {
  const duration = noteStruct.duration;

  // Preserve backwards-compatibility
  const durationStringData = Flow.parseNoteDurationString(duration);
  if (!durationStringData) {
    return null;
  }

  let ticks = Flow.durationToTicks(durationStringData.duration);
  if (ticks == null) {
    return null;
  }

  let type = noteStruct.type;
  const customTypes = [];

  if (type) {
    if (!Flow.getGlyphProps.validTypes[type]) {
      return null;
    }
  } else {
    type = durationStringData.type || 'n';

    // If we have keys, try and check if we've got a custom glyph
    if (noteStruct.keys !== undefined) {
      noteStruct.keys.forEach((k, i) => {
        const result = k.split('/');
        // We have a custom glyph specified after the note eg. /X2
        if (result && result.length === 3) {
          customTypes[i] = result[2];
        }
      });
    }
  }

  const dots = noteStruct.dots ? noteStruct.dots : durationStringData.dots;

  if (typeof (dots) !== 'number') {
    return null;
  }

  let currentTicks = ticks;

  for (let i = 0; i < dots; i++) {
    if (currentTicks <= 1) return null;

    currentTicks = currentTicks / 2;
    ticks += currentTicks;
  }

  return {
    duration: durationStringData.duration,
    type,
    customTypes,
    dots,
    ticks,
  };
};

// Used to convert duration aliases to the number based duration.
// If the input isn't an alias, simply return the input.
//
// example: 'q' -> '4', '8' -> '8'
Flow.sanitizeDuration = duration => {
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
Flow.durationToFraction = duration => new Fraction().parse(Flow.sanitizeDuration(duration));

// Convert the `duration` to an number
Flow.durationToNumber = duration => Flow.durationToFraction(duration).value();

// Convert the `duration` to total ticks
Flow.durationToTicks = duration => {
  duration = Flow.sanitizeDuration(duration);

  const ticks = Flow.durationToTicks.durations[duration];
  if (ticks === undefined) {
    return null;
  }

  return ticks;
};

Flow.durationToTicks.durations = {
  '1/2': Flow.RESOLUTION * 2,
  '1': Flow.RESOLUTION / 1,
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
Flow.getGlyphProps = (duration, type) => {
  duration = Flow.sanitizeDuration(duration);

  const code = Flow.getGlyphProps.duration_codes[duration];
  if (code === undefined) {
    return null;
  }

  if (!type) {
    type = 'n';
  }

  let glyphTypeProperties = code.type[type];

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

  return { ...code.common, ...glyphTypeProperties };
};

Flow.getGlyphProps.validTypes = {
  'n': { name: 'note' },
  'r': { name: 'rest' },
  'h': { name: 'harmonic' },
  'm': { name: 'muted' },
  's': { name: 'slash' },
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
    },
    type: {
      'n': { // Breve note
        code_head: 'v53',
      },
      'h': { // Breve note harmonic
        code_head: 'v59',
      },
      'm': { // Breve note muted -
        code_head: 'vf',
        stem_offset: 0,
      },
      'r': { // Breve rest
        code_head: 'v31',
        rest: true,
        position: 'B/5',
        dot_shiftY: 0.5,
      },
      's': { // Breve note slash -
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
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
    },
    type: {
      'n': { // Whole note
        code_head: 'v1d',
      },
      'h': { // Whole note harmonic
        code_head: 'v46',
      },
      'm': { // Whole note muted
        code_head: 'v92',
        stem_offset: -3,
      },
      'r': { // Whole rest
        code_head: 'v5c',
        rest: true,
        position: 'D/5',
        dot_shiftY: 0.5,
      },
      's': { // Whole note slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
    },
  },
  '2': {
    common: {
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'v81', scale).getMetrics().width;
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
    },
    type: {
      'n': { // Half note
        code_head: 'v81',
      },
      'h': { // Half note harmonic
        code_head: 'v2d',
      },
      'm': { // Half note muted
        code_head: 'v95',
        stem_offset: -3,
      },
      'r': { // Half rest
        code_head: 'vc',
        stem: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -0.5,
      },
      's': { // Half note slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
    },
  },
  '4': {
    common: {
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'vb', scale).getMetrics().width;
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
    },
    type: {
      'n': { // Quarter note
        code_head: 'vb',
      },
      'h': { // Quarter harmonic
        code_head: 'v22',
      },
      'm': { // Quarter muted
        code_head: 'v3e',
        stem_offset: -3,
      },
      'r': { // Quarter rest
        code_head: 'v7c',
        stem: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -0.5,
        line_above: 1.5,
        line_below: 1.5,
      },
      's': { // Quarter slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
    },
  },
  '8': {
    common: {
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'vb', scale).getMetrics().width;
      },
      stem: true,
      stem_offset: 0,
      flag: true,
      beam_count: 1,
      code_flag_upstem: 'v54',
      code_flag_downstem: 'v9a',
      stem_up_extension: 0,
      stem_down_extension: 0,
      tabnote_stem_up_extension: 0,
      tabnote_stem_down_extension: 0,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      'n': { // Eighth note
        code_head: 'vb',
      },
      'h': { // Eighth note harmonic
        code_head: 'v22',
      },
      'm': { // Eighth note muted
        code_head: 'v3e',
      },
      'r': { // Eighth rest
        code_head: 'va5',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -0.5,
        line_above: 1.0,
        line_below: 1.0,
      },
      's': { // Eight slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
    },
  },
  '16': {
    common: {
      beam_count: 2,
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'vb', scale).getMetrics().width;
      },
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: 'v3f',
      code_flag_downstem: 'v8f',
      stem_up_extension: 0,
      stem_down_extension: 0,
      tabnote_stem_up_extension: 0,
      tabnote_stem_down_extension: 0,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      'n': { // Sixteenth note
        code_head: 'vb',
      },
      'h': { // Sixteenth note harmonic
        code_head: 'v22',
      },
      'm': { // Sixteenth note muted
        code_head: 'v3e',
      },
      'r': { // Sixteenth rest
        code_head: 'v3c',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -0.5,
        line_above: 1.0,
        line_below: 2.0,
      },
      's': { // Sixteenth slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
    },
  },
  '32': {
    common: {
      beam_count: 3,
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'vb', scale).getMetrics().width;
      },
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: 'v47',
      code_flag_downstem: 'v2a',
      stem_up_extension: 9,
      stem_down_extension: 9,
      tabnote_stem_up_extension: 8,
      tabnote_stem_down_extension: 5,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      'n': { // Thirty-second note
        code_head: 'vb',
      },
      'h': { // Thirty-second harmonic
        code_head: 'v22',
      },
      'm': { // Thirty-second muted
        code_head: 'v3e',
      },
      'r': { // Thirty-second rest
        code_head: 'v55',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -1.5,
        line_above: 2.0,
        line_below: 2.0,
      },
      's': { // Thirty-second slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
    },
  },
  '64': {
    common: {
      beam_count: 4,
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'vb', scale).getMetrics().width;
      },
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: 'va9',
      code_flag_downstem: 'v58',
      stem_up_extension: 13,
      stem_down_extension: 13,
      tabnote_stem_up_extension: 12,
      tabnote_stem_down_extension: 9,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      'n': { // Sixty-fourth note
        code_head: 'vb',
      },
      'h': { // Sixty-fourth harmonic
        code_head: 'v22',
      },
      'm': { // Sixty-fourth muted
        code_head: 'v3e',
      },
      'r': { // Sixty-fourth rest
        code_head: 'v38',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: -1.5,
        line_above: 2.0,
        line_below: 3.0,
      },
      's': { // Sixty-fourth slash
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
    },
  },
  '128': {
    common: {
      beam_count: 5,
      getWidth(scale = Flow.DEFAULT_NOTATION_FONT_SCALE) {
        return new Glyph(this.code_head || 'vb', scale).getMetrics().width;
      },
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: 'v9b',
      code_flag_downstem: 'v30',
      stem_up_extension: 22,
      stem_down_extension: 22,
      tabnote_stem_up_extension: 21,
      tabnote_stem_down_extension: 18,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0,
    },
    type: {
      'n': {  // Hundred-twenty-eight note
        code_head: 'vb',
      },
      'h': { // Hundred-twenty-eight harmonic
        code_head: 'v22',
      },
      'm': { // Hundred-twenty-eight muted
        code_head: 'v3e',
      },
      'r': {  // Hundred-twenty-eight rest
        code_head: 'vaa',
        stem: false,
        flag: false,
        rest: true,
        position: 'B/4',
        dot_shiftY: 1.5,
        line_above: 3.0,
        line_below: 3.0,
      },
      's': { // Hundred-twenty-eight rest
        // Drawn with canvas primitives
        getWidth: () => Flow.SLASH_NOTEHEAD_WIDTH,
        position: 'B/4',
      },
    },
  },
};

// For future collaboration with the SMuFL Standard Music Font Layout

Flow.smufl = {};

// add references between smufl glyph names and code points.
Flow.smufl.to_code_points = {
  // staff brackets and dividers (e000-e00f)
  bracketTop: 'v1b',
  bracketBottom: 'v10',

  // barlines (e030-e03f)
  barlineTick: 'v6f',

  // repeats (e040-e04f)
  segno: 'v8c',
  coda: 'v4d',

  // clefs (e050-e07f)
  gClef: 'v83',
  cClef: 'vad',
  fClef: 'v79',
  unpitchedPercussionClef1: 'v59', // same as breveNoteheadHarmonic
  '6stringTabClef': 'v2f',

  // time signatures (e080-e09f)
  timeSig0: 'v0',
  timeSig1: 'v1',
  timeSig2: 'v2',
  timeSig3: 'v3',
  timeSig4: 'v4',
  timeSig5: 'v5',
  timeSig6: 'v6',
  timeSig7: 'v7',
  timeSig8: 'v8',
  timeSig9: 'v9',
  timeSigCommon: 'v41',
  timeSigCutCommon: 'vb6',

  // notehead (e0a0-e0ff)
  noteheadDoubleWhole: 'v53',
  noteheadWhole: 'v1d',
  noteheadHalf: 'v81',
  noteheadBlack: 'vb',
  noteheadXWhole: 'v92',
  noteheadXHalf: 'v95',
  noteheadXBlack: 'v3e',
  noteheadCircleX: 'v3b',
  noteheadTriangleUpWhole: 'v49',
  noteheadTriangleUpHalf: 'v93',
  noteheadTriangleUpBlack: 'v40',
  noteheadDiamondWhole: 'v46',
  noteheadDiamondHalf: 'v2d',
  noteheadDiamondBlack: 'v22',

  // individual notes (e1d0-e1ef)
  augmentationDot: 'v23',

  // temolos (e220-e23f)
  tremolo1: 'v74',

  // flags (e240-e25f)
  flag8thUp: 'v54',
  flag8thDown: 'v9a',
  flag16thUp: 'v3f',
  flag16thDown: 'v8f',
  flag32ndUp: 'v47',
  flag32ndDown: 'v2a',
  flag64thUp: 'va9',
  flag64thDown: 'v58',
  flag128thUp: 'v9b',
  flag128thDown: 'v30',

  // standard accidentals (e260-e26f)
  accidentalFlat: 'v44',
  accidentalNatural: 'v4e',
  accidentalSharp: 'v18',
  accidentalDoubleSharp: 'v7f',
  accidentalDoubleFlat: 'v26',
  accidentalParensLeft: 'v9c',
  accidentalParensRight: 'v84',

  // stein-zimmermann accidentals (24-edo) (e280-e28f)
  accidentalQuarterToneFlatStein: 'vab',
  accidentalThreeQuarterTonesFlatZimmermann: 'v9e',
  accidentalQuarterToneSharpStein: 'v78',
  accidentalThreeQuarterTonesSharpStein: 'v51',

  // arel-ezgi-uzdilek accidentals (e440-e44f)
  accidentalBuyukMucennebFlat: 'v39',
  accidentalBakiyeFlat: 'vb7',
  accidentalKomaSharp: 'v51', // same as accidentalQuarterToneSharpStein
  accidentalKucukMucennebSharp: 'v8d',

  // persian accidentals (e460-e46f)
  accidentalKoron: 'vd1',
  accidentalSori: 'vd0',

  // articulation (e4a0-e4bf)
  articAccentAbove: 'v42',
  articAccentBelow: 'v42', // same as above
  articTenutoAbove: 'v25',
  articTenutoBelow: 'v25', // same as above
  articStaccatoAbove: 'v23', // = dot
  articStaccatoBelow: 'v23', // = dot
  articStaccatissimoAbove: 'v28',
  articMarcatoAbove: 'va',

  // holds and pauses (e4c0-e4df)
  fermataAbove: 'v43',
  fermataBelow: 'v5b',
  breathMarkComma: 'v6c',
  breathMarkUpbow: 'v8a', // looks better than current upbow
  caesura: 'v34',
  caesuraCurved: 'v4b',

  // rests (e4e0-e4ff)
  restMaxima: 'v59', // not designed for this, but should do the trick
  // need restLonga -- used in multimeasure rests, like above
  restDoubleWhole: 'v31',
  restWhole: 'v5c',
  restHalf: 'vc',
  restQuarter: 'v7c',
  rest8th: 'va5',
  rest16th: 'v3c',
  rest32nd: 'v55',
  rest64th: 'v38',
  rest128th: 'vaa',

  // dynamics (e520-e54f)
  dynamicPiano: 'vbf',
  dynamicMezzo: 'v62',
  dynamicForte: 'vba',
  dynamicRinforzando: 'vba',
  dynamicSforzando: 'v4a',
  dynamicZ: 'v80',

  // common ornaments (e560-e56f)
  ornamentTrill: 'v1f',
  ornamentTurn: 'v72',
  ornamentTurnSlash: 'v33',
  ornamentMordent: 'v45',
  ornamentMordentInverted: 'v1e',
  ornamentTremblement: 'v86',

  // precomposed trills and mordents (e5b0-e5cf)
  ornamentPrecompAppoggTrill: 'v20',
  ornamentPrecompSlideTrillDAnglebert: 'v60',
  ornamentPrecompSlideTrillBach: 'v29',
  ornamentPrecompTrillSuffixDandrieu: 'v6d',
  ornamentPrecompDoubleCadenceUpperPrefix: 'vb4',
  ornamentPrecompDoubleCadenceUpperPrefixTurn: 'v68',
  ornamentPrecompTrillLowerSuffix: 'v2c',

  // string techniques (e610-e62f)
  stringsDownBow: 'v94',
  stringsUpBow: 'v75',
  stringsHarmonic: 'vb9',

  // plucked techniques (e630-e63f)
  pluckedSnapPizzicatoAbove: 'v94',
  pluckedLeftHandPizzicato: 'v8b', // plus sign

  // keyboard techniques (e650-e67f)
  keyboardPedalPed: 'v36',
  keyboardPedalUp: 'v5d',

  // percussion playing technique pictograms (e7f0-e80f)
  pictChokeCymbal: 'vb3',

  // multi-segment lines (eaa0-eb0f)
  wiggleArpeggiatoUp: 'va3', // rotated 90deg from reference implementation

  // arrows and arrowheads (eb60-eb8f)
  arrowheadBlackUp: 'vc3',
  arrowheadBlackDown: 'v52',

  // not found:
  // noteheadDiamondWhole: 'v27', stylistic alternate to v46?
  // noteheadDiamondBlack: 'v70', stylistic alternate to v22?
  // noteheadTriangleUpBlack: 'v7d', stylistic alternate to v40?
  // accidentalSlashedDoubleFlat: 'v90',
  // accidentalOneAndAHalfSharpTurned: 'v7a',
  // unused marcato alternative?  'v5a',
  // arpeggioBrushDown: 'v11',
};

// Some defaults
Flow.TIME4_4 = {
  num_beats: 4,
  beat_value: 4,
  resolution: Flow.RESOLUTION,
};
export { Flow };
