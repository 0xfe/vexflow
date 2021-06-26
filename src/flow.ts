import { Element } from './element';
import { Fraction } from './fraction';
import { Renderer } from './renderer';
import { Formatter } from './formatter';
import { Music } from './music';
import { Glyph } from './glyph';
import { Stave } from './stave';
import { StaveNote } from './stavenote';
import { StaveModifier } from './stavemodifier';
import { StaveTempo } from './stavetempo';
import { Voice } from './voice';
import { Accidental } from './accidental';
import { Beam } from './beam';
import { StaveTie } from './stavetie';
import { TabStave } from './tabstave';
import { TabNote } from './tabnote';
import { Bend } from './bend';
import { Vibrato } from './vibrato';
import { VibratoBracket } from './vibratobracket';
import { Note } from './note';
import { ModifierContext } from './modifiercontext';
import { MultiMeasureRest } from './multimeasurerest';
import { TickContext } from './tickcontext';
import { Articulation } from './articulation';
import { Annotation } from './annotation';
import { ChordSymbol } from './chordsymbol';
import { Barline } from './stavebarline';
import { NoteHead } from './notehead';
import { StaveConnector } from './staveconnector';
import { ClefNote } from './clefnote';
import { KeySignature } from './keysignature';
import { KeySigNote } from './keysignote';
import { TimeSignature } from './timesignature';
import { TimeSigNote } from './timesignote';
import { Stem } from './stem';
import { TabTie } from './tabtie';
import { Clef } from './clef';
import { Dot } from './dot';
import { Modifier } from './modifier';
import { TabSlide } from './tabslide';
import { Tuplet } from './tuplet';
import { GraceNote } from './gracenote';
import { GraceTabNote } from './gracetabnote';
import { Tuning } from './tuning';
import { KeyManager } from './keymanager';
import { StaveHairpin } from './stavehairpin';
import { BoundingBox } from './boundingbox';
import { Stroke } from './strokes';
import { TextNote } from './textnote';
import { Curve } from './curve';
import { TextDynamics } from './textdynamics';
import { StaveLine } from './staveline';
import { Ornament } from './ornament';
import { PedalMarking } from './pedalmarking';
import { TextBracket } from './textbracket';
import { FretHandFinger } from './frethandfinger';
import { Repetition } from './staverepetition';
import { BarNote } from './barnote';
import { GhostNote } from './ghostnote';
import { NoteSubGroup } from './notesubgroup';
import { GraceNoteGroup } from './gracenotegroup';
import { Tremolo } from './tremolo';
import { StringNumber } from './stringnumber';
import { Crescendo } from './crescendo';
import { Volta } from './stavevolta';
import { System } from './system';
import { Factory } from './factory';
import { Parser } from './parser';
import { EasyScore } from './easyscore';
import { Registry } from './registry';
import { StaveText } from './stavetext';
import { GlyphNote } from './glyphnote';
import { RepeatNote } from './repeatnote';
import { TextFont } from './textfont';
import { PetalumaScriptTextMetrics } from './fonts/petalumascript_textmetrics';
import { RobotoSlabTextMetrics } from './fonts/robotoslab_textmetrics';

import { Font, Fonts } from './font';
import { Tables } from './tables';

export const Flow = {
  ...Tables,
  Element: Element,
  Fraction: Fraction,
  Renderer: Renderer,
  Formatter: Formatter,
  Music: Music,
  Glyph: Glyph,
  Stave: Stave,
  StaveNote: StaveNote,
  StaveModifier: StaveModifier,
  StaveTempo: StaveTempo,
  Voice: Voice,
  Accidental: Accidental,
  Beam: Beam,
  StaveTie: StaveTie,
  TabStave: TabStave,
  TabNote: TabNote,
  Bend: Bend,
  Vibrato: Vibrato,
  VibratoBracket: VibratoBracket,
  Note: Note,
  ModifierContext: ModifierContext,
  MultiMeasureRest: MultiMeasureRest,
  TickContext: TickContext,
  Articulation: Articulation,
  Annotation: Annotation,
  ChordSymbol: ChordSymbol,
  Barline: Barline,
  NoteHead: NoteHead,
  StaveConnector: StaveConnector,
  ClefNote: ClefNote,
  KeySignature: KeySignature,
  KeySigNote: KeySigNote,
  TimeSignature: TimeSignature,
  TimeSigNote: TimeSigNote,
  Stem: Stem,
  TabTie: TabTie,
  Clef: Clef,
  Dot: Dot,
  Modifier: Modifier,
  TabSlide: TabSlide,
  Tuplet: Tuplet,
  GraceNote: GraceNote,
  GraceTabNote: GraceTabNote,
  Tuning: Tuning,
  KeyManager: KeyManager,
  StaveHairpin: StaveHairpin,
  BoundingBox: BoundingBox,
  Stroke: Stroke,
  TextNote: TextNote,
  Curve: Curve,
  TextDynamics: TextDynamics,
  StaveLine: StaveLine,
  Ornament: Ornament,
  PedalMarking: PedalMarking,
  TextBracket: TextBracket,
  FretHandFinger: FretHandFinger,
  Repetition: Repetition,
  BarNote: BarNote,
  GhostNote: GhostNote,
  NoteSubGroup: NoteSubGroup,
  GraceNoteGroup: GraceNoteGroup,
  Tremolo: Tremolo,
  StringNumber: StringNumber,
  Crescendo: Crescendo,
  Volta: Volta,
  System: System,
  Factory: Factory,
  Parser: Parser,
  EasyScore: EasyScore,
  Registry: Registry,
  StaveText: StaveText,
  GlyphNote: GlyphNote,
  RepeatNote: RepeatNote,

  Font: Font,
  Fonts: Fonts,
  TextFont: TextFont,
  PetalumaScriptTextMetrics: PetalumaScriptTextMetrics,
  RobotoSlabTextMetrics: RobotoSlabTextMetrics,
};
