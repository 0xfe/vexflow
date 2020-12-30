// HACK:
// Since text origins are positioned at the baseline, we must
// compensate for the ascender of the text. Of course, 1 staff space is
// a very poor approximation.
//
// This will be deprecated in the future. This is a temporary solution until
// we have more robust text metrics.
import {DrawContext, IAccItem, ICodeValue, IKeyPropertiesParams, IKeyProps, IType} from "../types/common";
import {RuntimeError} from "../runtimeerror";
import {
  accidentalList,
  ACCIDENTALS,
  ARTICULATIONS,
  CLEF_PROPERTIES_VALUES,
  CUSTOM_NOTEHEADS, DURATION_ALIASES, DURATION_CODES, DURATIONS,
  INTEGER_TO_NOTE_TABLE,
  KEY_PROPERTIES_NOTE_VALUES, KEY_SPECS, ORNAMENTS
} from "../tables";
import {IClefPropertyValue} from "../types/clef";
import {IGlyphProps} from "../types/glyph";
import {Glyph} from "../glyph";
import {IArticulation} from "../types/articulation";
import {IAccidental} from "../types/accidental";
import {Fraction} from "../fraction";
import {WARN, LOG} from "./logging";

export const TEXT_HEIGHT_OFFSET_HACK = 1;
export const SLASH_NOTEHEAD_WIDTH = 15;
export const STEM_HEIGHT = 35;
export const RESOLUTION = 16384;
export const DEFAULT_NOTATION_FONT_SCALE = 39;
export const DEFAULT_TABLATURE_FONT_SCALE = 39;
export const STAVE_LINE_THICKNESS = 1;
export const STEM_WIDTH = 1.5;
export const DEFAULT_TIME = {num_beats: 4, beat_value: 4, resolution: RESOLUTION};
export {WARN, LOG};

const VEX_PREFIX = 'vf-';

// Used by various classes (e.g., SVGContext) to provide a
// unique prefix to element names (or other keys in shared namespaces).
export const Prefix = (text: string): string => {
  return VEX_PREFIX + text;
}

// Round number to nearest fractional value (`.5`, `.25`, etc.)
const RoundN = (x: number, n: number): number => {
  return (x % n) >= (n / 2)
    ? parseInt((x / n).toString(), 10) * n + n
    : parseInt((x / n).toString(), 10) * n
};

// Locate the mid point between stave lines. Returns a fractional line if a space.
export const MidLine = (a: number, b: number): number => {
  let mid_line = b + (a - b) / 2;
  if (mid_line % 2 > 0) {
    mid_line = RoundN(mid_line * 10, 5) / 10;
  }
  return mid_line;
}

// Take `arr` and return a new list consisting of the sorted, unique,
// contents of arr. Does not modify `arr`.
export const SortAndUnique = <T>(arr: T[], cmp: (a: T, b: T) => number, eq: <T>(a: T, b: T) => boolean): T[] => {
  if (arr.length > 1) {
    const newArr = [];
    let last = undefined;
    arr.sort(cmp);

    for (let i = 0; i < arr.length; ++i) {
      if (i === 0 || !eq(arr[i], last)) {
        newArr.push(arr[i]);
      }
      last = arr[i];
    }

    return newArr;
  } else {
    return arr;
  }
};

// Draw a tiny dot marker on the specified canvas. A great debugging aid.
//
// `ctx`: Canvas context.
// `x`, `y`: Dot coordinates.
export const drawDot = (ctx: DrawContext, x: number, y: number, color: string): void => {
  ctx.save();
  ctx.setFillStyle(color);

  // draw a circle
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Used to convert duration aliases to the number based duration.
// If the input isn't an alias, simply return the input.
//
// example: 'q' -> '4', '8' -> '8'
export const sanitizeDuration = (duration: string): string => {
  const alias = DURATION_ALIASES[duration];
  if (alias !== undefined) {
    duration = alias;
  }

  if (DURATIONS[duration] === undefined) {
    throw new RuntimeError('BadArguments', `The provided duration is not valid: ${duration}`);
  }

  return duration;
};

export const textWidth = (text: any): number => 7 * text.toString().length;
export const articulationCodes = (artic: string): IArticulation => ARTICULATIONS[artic];
export const accidentalCodes = (acc: string): IAccidental => ACCIDENTALS[acc];
export const ornamentCodes = (acc: string): ICodeValue => ORNAMENTS[acc];
export const durationToFraction = (duration: string): Fraction => new Fraction().parse(sanitizeDuration(duration));

// Return a glyph given duration and type. The type can be a custom glyph code from customNoteHeads.
export const getGlyphProps = (duration: string, type?: string): any => {
  duration = sanitizeDuration(duration);
  type = type || 'n'; // default type is a regular note

  // Lookup duration for default glyph head code
  const code = DURATION_CODES[duration];
  if (code === undefined) {
    return null;
  }

  // Get glyph properties for 'type' from duration string (note, rest, harmonic, muted, slash)
  let glyphTypeProperties = code.type[type];

  // If this isn't a standard type, then lookup the custom note head map.
  if (glyphTypeProperties === undefined) {
    // Try and get it from the custom list of note heads
    const customGlyphTypeProperties = CUSTOM_NOTEHEADS[type.toUpperCase()];

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
};

// Convert the `duration` to total ticks
export const durationToTicks = (duration: string): number => {
  duration = sanitizeDuration(duration);

  const ticks = DURATIONS[duration];
  if (ticks === undefined) {
    return null;
  }

  return ticks;
};

// Convert the `duration` to an number
export const durationToNumber = (duration: string): number => durationToFraction(duration).value();
export const keySignature = (spec: string): IAccItem[] => {
  const keySpec = KEY_SPECS[spec];

  if (!keySpec) {
    throw new RuntimeError('BadKeySignature', `Bad key signature spec: '${spec}'`);
  }

  if (!keySpec.acc) {
    return [];
  }

  const notes = accidentalList(keySpec.acc);

  const acc_list: IAccItem[] = [];
  for (let i = 0; i < keySpec.num; ++i) {
    const line = notes[i];
    acc_list.push({type: keySpec.acc, line});
  }

  return acc_list;
};

const clefProperties = (clef: string): IClefPropertyValue => {
  if (!clef) throw new RuntimeError('BadArgument', 'Invalid clef: ' + clef);

  const props = CLEF_PROPERTIES_VALUES[clef];
  if (!props) throw new RuntimeError('BadArgument', 'Invalid clef: ' + clef);

  return props;
};

// Merge `destination` hash with `source` hash, overwriting like keys
// in `source` if necessary.
export const Merge = <T>(destination: T, source: T): T => {
  for (const property in source) { // eslint-disable-line guard-for-in
    destination[property] = source[property];
  }
  return destination;
}

/*
  Take a note in the format "Key/Octave" (e.g., "C/5") and return properties.

  The last argument, params, is a struct the currently can contain one option,
  octave_shift for clef ottavation (0 = default; 1 = 8va; -1 = 8vb, etc.).
*/
export const keyProperties = (key: string, clef?: string, params?: IKeyPropertiesParams): IKeyProps => {
  if (clef === undefined) {
    clef = 'treble';
  }

  const options = {octave_shift: 0};

  if (typeof params === 'object') {
    Merge(options, params);
  }

  const pieces = key.split('/');

  if (pieces.length < 2) {
    throw new RuntimeError('BadArguments', `Key must have note + octave and an optional glyph: ${key}`);
  }

  const k = pieces[0].toUpperCase();
  const value = KEY_PROPERTIES_NOTE_VALUES[k];
  if (!value) throw new RuntimeError('BadArguments', 'Invalid key name: ' + k);
  if (value.octave) pieces[1] = value.octave;

  let octave = parseInt(pieces[1], 10);

  // Octave_shift is the shift to compensate for clef 8va/8vb.
  octave += -1 * options.octave_shift;

  const base_index = (octave * 7) - (4 * 7);
  let line = (base_index + value.index) / 2;
  line += clefProperties(clef).line_shift;

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
    extraProps = CUSTOM_NOTEHEADS[glyph_name] || {} as IType;
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
};

export const integerToNote = (integer: number): string => {
  if (typeof (integer) === 'undefined') {
    throw new RuntimeError('BadArguments', 'Undefined integer for integerToNote');
  }

  if (integer < -2) {
    throw new RuntimeError('BadArguments', `integerToNote requires integer > -2: ${integer}`);
  }

  const noteValue = INTEGER_TO_NOTE_TABLE[integer];
  if (!noteValue) {
    throw new RuntimeError('BadArguments', `Unknown note value for integer: ${integer}`);
  }

  return noteValue;
};

export const tabToGlyph = (fret: string, scale = 1.0): IGlyphProps => {
  let glyph = null;
  let width = 0;
  let shift_y = 0;

  if (fret.toString().toUpperCase() === 'X') {
    const glyphMetrics = new Glyph('accidentalDoubleSharp', DEFAULT_TABLATURE_FONT_SCALE).getMetrics();
    glyph = 'accidentalDoubleSharp';
    width = glyphMetrics.width;
    shift_y = -glyphMetrics.height / 2;
  } else {
    width = textWidth(fret.toString());
  }

  return {
    text: fret,
    code: glyph,
    getWidth: () => width * scale,
    shift_y,
  } as IGlyphProps;
};
