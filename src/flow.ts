import { setupFonts } from '@loadFonts';

import { Accidental } from './accidental';
import { Annotation } from './annotation';
import { Articulation } from './articulation';
import { BarNote } from './barnote';
import { Beam } from './beam';
import { Bend } from './bend';
import { BoundingBox } from './boundingbox';
import { BoundingBoxComputation } from './boundingboxcomputation';
import { ChordSymbol } from './chordsymbol';
import { Clef } from './clef';
import { ClefNote } from './clefnote';
import { Crescendo } from './crescendo';
import { Curve } from './curve';
import { Dot } from './dot';
import { EasyScore } from './easyscore';
import { Element } from './element';
import { Factory } from './factory';
import { Font } from './font';
import { Formatter } from './formatter';
import { Fraction } from './fraction';
import { FretHandFinger } from './frethandfinger';
import { GhostNote } from './ghostnote';
import { Glyph } from './glyph';
import { GlyphNote } from './glyphnote';
import { GraceNote } from './gracenote';
import { GraceNoteGroup } from './gracenotegroup';
import { GraceTabNote } from './gracetabnote';
import { KeyManager } from './keymanager';
import { KeySignature } from './keysignature';
import { KeySigNote } from './keysignote';
import { Modifier } from './modifier';
import { ModifierContext } from './modifiercontext';
import { MultiMeasureRest } from './multimeasurerest';
import { Music } from './music';
import { Note } from './note';
import { NoteHead } from './notehead';
import { NoteSubGroup } from './notesubgroup';
import { Ornament } from './ornament';
import { Parser } from './parser';
import { PedalMarking } from './pedalmarking';
import { Registry } from './registry';
import { RenderContext } from './rendercontext';
import { Renderer } from './renderer';
import { RepeatNote } from './repeatnote';
import { Stave } from './stave';
import { Barline } from './stavebarline';
import { StaveConnector } from './staveconnector';
import { StaveHairpin } from './stavehairpin';
import { StaveLine } from './staveline';
import { StaveModifier } from './stavemodifier';
import { StaveNote } from './stavenote';
import { Repetition } from './staverepetition';
import { StaveTempo } from './stavetempo';
import { StaveText } from './stavetext';
import { StaveTie } from './stavetie';
import { Volta } from './stavevolta';
import { Stem } from './stem';
import { StringNumber } from './stringnumber';
import { Stroke } from './strokes';
import { System } from './system';
import { Tables } from './tables';
import { TabNote } from './tabnote';
import { TabSlide } from './tabslide';
import { TabStave } from './tabstave';
import { TabTie } from './tabtie';
import { TextBracket } from './textbracket';
import { TextDynamics } from './textdynamics';
import { TextFormatter } from './textformatter';
import { TextNote } from './textnote';
import { TickContext } from './tickcontext';
import { TimeSignature } from './timesignature';
import { TimeSigNote } from './timesignote';
import { Tremolo } from './tremolo';
import { Tuning } from './tuning';
import { Tuplet } from './tuplet';
import { RuntimeError } from './util';
import { Vibrato } from './vibrato';
import { VibratoBracket } from './vibratobracket';
import { Voice } from './voice';

export const Flow = {
  Accidental,
  Annotation,
  Articulation,
  Barline,
  BarNote,
  Beam,
  Bend,
  BoundingBox,
  BoundingBoxComputation,
  ChordSymbol,
  Clef,
  ClefNote,
  Crescendo,
  Curve,
  Dot,
  EasyScore,
  Element,
  Factory,
  Font,
  TextFormatter,
  Formatter,
  Fraction,
  FretHandFinger,
  GhostNote,
  Glyph,
  GlyphNote,
  GraceNote,
  GraceNoteGroup,
  GraceTabNote,
  KeyManager,
  KeySignature,
  KeySigNote,
  Modifier,
  ModifierContext,
  MultiMeasureRest,
  Music,
  Note,
  NoteHead,
  NoteSubGroup,
  Ornament,
  Parser,
  PedalMarking,
  Registry,
  RenderContext,
  Renderer,
  RepeatNote,
  Repetition,
  Stave,
  StaveConnector,
  StaveHairpin,
  StaveLine,
  StaveModifier,
  StaveNote,
  StaveTempo,
  StaveText,
  StaveTie,
  Stem,
  StringNumber,
  Stroke,
  System,
  TabNote,
  TabSlide,
  TabStave,
  TabTie,
  TextBracket,
  TextDynamics,
  TextNote,
  TickContext,
  TimeSignature,
  TimeSigNote,
  Tremolo,
  Tuning,
  Tuplet,
  Vibrato,
  VibratoBracket,
  Voice,
  Volta,

  // BUILD and VERSION are set by webpack. See: Gruntfile.js.
  BUILD: '',
  VERSION: '',

  // Internal ID used as the cache key for GlyphCache.
  // It is only computed when the MUSIC_FONT_STACK changes.
  // Comma separated list of font names.
  MUSIC_FONT_STACK_ID: '',

  get MUSIC_FONT_STACK(): Font[] {
    return Tables.MUSIC_FONT_STACK.slice();
  },
  set MUSIC_FONT_STACK(fonts: Font[]) {
    Tables.MUSIC_FONT_STACK = fonts.slice();
    Flow.MUSIC_FONT_STACK_ID = fonts.map((font) => font.getName()).join(',');
  },
  get NOTATION_FONT_SCALE(): number {
    return Tables.NOTATION_FONT_SCALE;
  },
  set NOTATION_FONT_SCALE(value: number) {
    Tables.NOTATION_FONT_SCALE = value;
  },
  get TABLATURE_FONT_SCALE(): number {
    return Tables.TABLATURE_FONT_SCALE;
  },
  set TABLATURE_FONT_SCALE(value: number) {
    Tables.TABLATURE_FONT_SCALE = value;
  },
  get RESOLUTION(): number {
    return Tables.RESOLUTION;
  },
  set RESOLUTION(value: number) {
    Tables.RESOLUTION = value;
  },
  get SLASH_NOTEHEAD_WIDTH(): number {
    return Tables.SLASH_NOTEHEAD_WIDTH;
  },
  set SLASH_NOTEHEAD_WIDTH(value: number) {
    Tables.SLASH_NOTEHEAD_WIDTH = value;
  },
  get STAVE_LINE_DISTANCE(): number {
    return Tables.STAVE_LINE_DISTANCE;
  },
  set STAVE_LINE_DISTANCE(value: number) {
    Tables.STAVE_LINE_DISTANCE = value;
  },
  get STAVE_LINE_THICKNESS(): number {
    return Tables.STAVE_LINE_THICKNESS;
  },
  set STAVE_LINE_THICKNESS(value: number) {
    Tables.STAVE_LINE_THICKNESS = value;
  },
  get STEM_HEIGHT(): number {
    return Tables.STEM_HEIGHT;
  },
  set STEM_HEIGHT(value: number) {
    Tables.STEM_HEIGHT = value;
  },
  get STEM_WIDTH(): number {
    return Tables.STEM_WIDTH;
  },
  set STEM_WIDTH(value: number) {
    Tables.STEM_WIDTH = value;
  },
  get TIME4_4(): { num_beats: number; beat_value: number; resolution: number } {
    return Tables.TIME4_4;
  },
  set TIME4_4(value: { num_beats: number; beat_value: number; resolution: number }) {
    Tables.TIME4_4 = value;
  },
  get accidentalMap(): Record<string, { code: string; parenRightPaddingAdjustment: number }> {
    return Tables.accidentalMap;
  },
  get unicode(): Record<string, string> {
    return Tables.unicode;
  },
  keySignature(spec: string): { type: string; line: number }[] {
    return Tables.keySignature(spec);
  },

  getMusicFont(): Font {
    if (Tables.MUSIC_FONT_STACK.length === 0) {
      throw new RuntimeError('NoFonts', 'The font stack is empty. See: Flow.setMusicFont(...fontNames)');
    } else {
      return Tables.MUSIC_FONT_STACK[0];
    }
  },

  /**
   * @param fontNames one or more font names.
   * Example: setMusicFont('Bravura')
   * Example: setMusicFont('Bravura', 'Gonville', 'Custom')
   *
   * If you are using vexflow.js,      setMusicFont() will be a sync function. Calling it is optional
   * because VexFlow defaults to a music font stack of: 'Bravura', 'Gonville', 'Custom'.
   *
   * If you are using vexflow-core.js, setMusicFont() will be an async function.
   */
  setMusicFont: undefined as unknown as (...fontNames: string[]) => void,
};

// vexflow.js:      Set up the `setMusicFont()` function. Automatically load all fonts. See: loadStatic.ts.
// vexflow-core.js: Set up the `setMusicFont()` function. Does not load any fonts.      See: loadDynamic.ts.
setupFonts();
