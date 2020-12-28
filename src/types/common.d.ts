import {Glyph} from "../glyph";
import {BoundingBox} from "../boundingbox";
import {Fraction} from "../fraction";
import {Element} from "../element";
import {Renderer} from "src/renderer";
import {Formatter} from "src/formatter";
import {Music} from "src/music";
import {StaveNote} from "src/stavenote";
import {Stave} from "src/stave";
import {StaveModifier} from "src/stavemodifier";
import {StaveTempo} from "../stavetempo";
import {Voice} from "../voice";
import {Accidental} from "../accidental";
import {Beam} from "../beam";
import {StaveTie} from "../stavetie";
import {TabStave} from "../tabstave";
import {TabNote} from "../tabnote";
import {Bend} from "../bend";
import {Vibrato} from "../vibrato";
import {VibratoBracket} from "../vibratobracket";
import {Note} from "../note";
import {ModifierContext} from "../modifiercontext";
import {MultiMeasureRest} from "../multimeasurerest";
import {TickContext} from "../tickcontext";
import {Articulation} from "../articulation";
import {Annotation} from "../annotation";
import {ChordSymbol} from "../chordsymbol";
import {Barline} from "../stavebarline";
import {NoteHead} from "../notehead";
import {StaveConnector} from "../staveconnector";
import {ClefNote} from "../clefnote";
import {KeySignature} from "../keysignature";
import {KeySigNote} from "../keysignote";
import {TimeSignature} from "../timesignature";
import {TimeSigNote} from "../timesignote";
import {TabTie} from "../tabtie";
import {Clef} from "../clef";
import {Dot} from "../dot";
import {Modifier} from "../modifier";
import {TabSlide} from "../tabslide";
import {Tuplet} from "../tuplet";
import {GraceNote} from "../gracenote";
import {GraceTabNote} from "../gracetabnote";
import {Tuning} from "../tuning";
import {KeyManager} from "../keymanager";
import {StaveHairpin} from "../stavehairpin";
import {Stroke} from "../strokes";
import {TextNote} from "../textnote";
import {Curve} from "../curve";
import {TextDynamics} from "../textdynamics";
import {StaveLine} from "../staveline";
import {Ornament} from "../ornament";
import {PedalMarking} from "../pedalmarking";
import {TextBracket} from "../textbracket";
import {FretHandFinger} from "../frethandfinger";
import {Repetition} from "../staverepetition";
import {BarNote} from "../barnote";
import {GhostNote} from "../ghostnote";
import {NoteSubGroup} from "../notesubgroup";
import {GraceNoteGroup} from "../gracenotegroup";
import {Tremolo} from "../tremolo";
import {StringNumber} from "../stringnumber";
import {Crescendo} from "../crescendo";
import {Volta} from "../stavevolta";
import {System} from "../system";
import {Factory} from "../factory";
import {Parser} from "../parser";
import {Builder, EasyScore} from "../easyscore";
import {Registry} from "../registry";
import {StaveText} from "../stavetext";
import {GlyphNote} from "../glyphnote";
import {RepeatNote} from "../repeatnote";
import {Font} from "../smufl";
import {SVGContext} from "../svgcontext";
import {CanvasContext} from "../canvascontext";
import {RaphaelContext} from "../raphaelcontext";
import {IClefProperties} from "./clef";
import {INoteValue} from "./note";
import {IArticulationCodes} from "./articulation";
import {IAccidentalCodes} from "./accidental";
import {IKeySignature} from "./keysignature";
import {IOrnamentCodes} from "./ornament";
import {IGlyphProps} from "./glyph";
import {IFont} from "./font";

export interface INumberTable<T> {
  [index: number]: T;
}

export interface IStringTable<T> {
  [index: string]: T;
}

export interface IIntegerToNote {
  (i: number): any;

  table: INumberTable<string>;
}

export interface IKeyPropertiesParams {
  octave_shift: number;
}

export interface IKeyProperties {
  (key: string, clef?: string, params?: IKeyPropertiesParams): any;

  note_values: IStringTable<INoteValue>;
  customNoteHeads: IStringTable<IType>;
}

export interface ICodeValue {
  code: string;
}

export interface IRule {
  or: boolean;
  expect: IRule[];
  maybe: boolean;

  bind(grammar: any): any;
}

export interface IKeySpec {
  acc: string;
  num: number;
}

export interface IDurationToTicks {
  (duration: string): number;

  durations: IStringTable<number>;
}

export interface IScale {
  x: number;
  y: number;
}

export interface IRaphaelContextState {
  scale: IScale,
  font_family: string;
  font_size: number;
  font_weight: string;
}

export interface ILayoutMetrics {
  xMin: number;
  xMax: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface IDuration {
  denominator: number;
  numerator: number;
}


export interface IDurationCode {
  common: IType;
  type: IStringTable<IType>;
}

export interface IType {
  getWidth(scale?: number): number;

  code: string;
  code_head: string;
  stem: boolean;
  rest: boolean;
  flag: boolean
  stem_offset: number;
  stem_up_extension: number;
  stem_down_extension: number;
  tabnote_stem_up_extension: number;
  tabnote_stem_down_extension: number;
  dot_shiftY: number;
  line_above: number;
  line_below: number;
  beam_count: number;
  code_flag_upstem: string;
  code_flag_downstem: string;
  position: string;
}

export interface INameValue {
  name: string;
}

export interface IFlowDefaults {
  num_beats: number;
  beat_value: number;
  resolution: number;
}

export interface ITickContextsStruct {
  list: number[];
  map: INumberTable<TickContext>;
  array: (ModifierContext | TickContext)[];
  resolutionMultiplier: any;
}

export interface IDistance {
  maxNegativeShiftPx: number;
  expectedDistance: number;
  fromTickable: any;
  errorPx: number;
  fromTickablePx: number;
}

export interface IFlow {
  DefaultFontStack: Font[];
  Fonts: IStringTable<Font>;
  Font: typeof Font;
  RepeatNote: typeof RepeatNote;
  GlyphNote: typeof GlyphNote;
  StaveText: typeof StaveText;
  Registry: typeof Registry;
  EasyScore: typeof EasyScore;
  Parser: typeof Parser;
  Factory: typeof Factory;
  System: typeof System;
  Volta: typeof Volta;
  Crescendo: typeof Crescendo;
  StringNumber: typeof StringNumber;
  Tremolo: typeof Tremolo;
  GraceNoteGroup: typeof GraceNoteGroup;
  NoteSubGroup: typeof NoteSubGroup;
  GhostNote: typeof GhostNote;
  BarNote: typeof BarNote;
  Repetition: typeof Repetition;
  FretHandFinger: typeof FretHandFinger;
  TextBracket: typeof TextBracket;
  PedalMarking: typeof PedalMarking;
  Ornament: typeof Ornament;
  StaveLine: typeof StaveLine;
  TextDynamics: typeof TextDynamics;
  Curve: typeof Curve;
  TextNote: typeof TextNote;
  Stroke: typeof Stroke;
  StaveHairpin: typeof StaveHairpin;
  KeyManager: typeof KeyManager;
  Tuning: typeof Tuning;
  GraceTabNote: typeof GraceTabNote;
  GraceNote: typeof GraceNote;
  Tuplet: typeof Tuplet;
  TabSlide: typeof TabSlide;
  Modifier: typeof Modifier;
  Dot: typeof Dot;
  Clef: typeof Clef;
  TabTie: typeof TabTie;
  TimeSigNote: typeof TimeSigNote;
  TimeSignature: typeof TimeSignature;
  KeySigNote: typeof KeySigNote;
  KeySignature: typeof KeySignature;
  ClefNote: typeof ClefNote;
  StaveConnector: typeof StaveConnector;
  NoteHead: typeof NoteHead;
  Barline: typeof Barline;
  ChordSymbol: typeof ChordSymbol;
  Annotation: typeof Annotation;
  Articulation: typeof Articulation;
  TickContext: typeof TickContext;
  MultiMeasureRest: typeof MultiMeasureRest;
  ModifierContext: typeof ModifierContext;
  Note: typeof Note;
  VibratoBracket: typeof VibratoBracket;
  Vibrato: typeof Vibrato;
  Bend: typeof Bend;
  TabNote: typeof TabNote;
  TabStave: typeof TabStave;
  StaveTie: typeof StaveTie;
  Beam: typeof Beam;
  Accidental: typeof Accidental;
  Voice: typeof Voice;
  StaveTempo: typeof StaveTempo;
  StaveModifier: typeof StaveModifier;
  StaveNote: typeof StaveNote;
  Stave: typeof Stave;
  Glyph: typeof Glyph;
  Music: typeof Music;
  Element: typeof Element;
  Fraction: typeof Fraction;
  Formatter: typeof Formatter;
  Renderer: typeof Renderer;
  BoundingBox: typeof BoundingBox;
  Stem: any;
  STEM_WIDTH: number;
  STEM_HEIGHT: number;
  STAVE_LINE_THICKNESS: number
  RESOLUTION: number,
  DEFAULT_FONT_STACK: any,
  DEFAULT_NOTATION_FONT_SCALE: number,
  DEFAULT_TABLATURE_FONT_SCALE: number,
  SLASH_NOTEHEAD_WIDTH: number,
  TEXT_HEIGHT_OFFSET_HACK: number,
  IsKerned: boolean,
  clefProperties: IClefProperties;
  keyProperties: IKeyProperties;
  integerToNote: IIntegerToNote;
  tabToGlyph: (fret: string, scale: number) => any;
  textWidth: (s: string) => number;
  articulationCodes: IArticulationCodes;
  accidentalCodes: IAccidentalCodes;
  accidentalColumnsTable: INumberTable<IStringTable<number[]>>;
  ornamentCodes: IOrnamentCodes;
  keySignature: IKeySignature;
  unicode: IStringTable<string>;
  sanitizeDuration: (duration: string) => string;
  durationAliases: IStringTable<string>;
  durationToTicks: IDurationToTicks;
  durationToFraction: (duration: string) => any; //TODO: any to Fraction
  durationToNumber: (duration: string) => number;
  getGlyphProps: IGlyphProps;
  TIME4_4: IFlowDefaults;
}

export interface IMetrics {
  totalLeftPx: number;
  totalRightPx: number;
  width: number
  glyphWidth: number;
  notePx: number
  modLeftPx: number;
  modRightPx: number;
  leftDisplacedHeadPx: number;
  rightDisplacedHeadPx: number;
}

export interface ICrescendoParams {
  reverse: boolean;
  height: number;
  y: number;
  end_x: number;
  begin_x: number;
}

export interface ICommitHook {
  (options: any, note: Note, builder: Builder): void
}

export interface ICurveRenderOptions {
  spacing: number;
  invert: boolean;
  thickness: number;
  x_shift: number;
  cps: ICoordinates[];
  position_end: number;
  position: number;
  y_shift: number
}

export interface ICurveRenderParams {
  last_y: number;
  last_x: number;
  first_y: number;
  first_x: number;
  direction: number;
}

export interface ICoordinates {
  x: number;
  y: number
}

export interface IMultimeasureRestRenderOptions {
  padding_left: number;
  line: number;
  number_glyph_point: number;
  show_number: boolean;
  line_thickness: number;
  symbol_spacing: number;
  serif_thickness: number;
  use_symbols: boolean;
  number_line: number;
  spacing_between_lines_px: number;
  semibrave_rest_glyph_scale: number;
  padding_right: number;
}

export interface ILeftRight {
  left: number;
  right: number
}

export interface IStemStruct {
  stemletHeight: number;
  isStemlet: boolean;
  hide: boolean;
  stem_direction: number;
  stem_extension: number;
  y_bottom: number;
  y_top: number;
  x_end: number;
  x_begin: number;
}

export interface IPedalMarkingRenderOptions {
  color: string;
  bracket_height: number;
  text_margin_right: number;
  bracket_line_width: number
}

export interface IStaveOptions {
  bottom_text_position: number;
  line_config: IStringTable<any>;
  space_below_staff_ln: number;
  glyph_spacing_px: number;
  space_above_staff_ln: number;
  vertical_bar_width: number;
  fill_style: string;
  left_bar: boolean;
  right_bar: boolean;
  spacing_between_lines_px: number;
  top_text_position: number;
  num_lines: number
}

export interface IStaveLineConfig {
  visible: boolean;
}

export interface ITupletOptions {
  y_offset: number;
  location: number;
  ratioed: boolean;
  bracketed: boolean;
  notes_occupied: number;
  beats_occupied: number;
  num_notes: number;
}

export interface IAccItem {
  type: string;
  line: number;
}

export interface IStaveTextOptions {
  shift_x: number;
  shift_y: number;
  justification: number;
}

export interface IBounds {
  w: number;
  x: number;
  h: number;
  y: number
}

export interface IText {
  options: any;
  content: string;
}

export interface IStaveHairpinRenderOptions {
  left_shift_px: number;
  right_shift_px: number;
  height: number;
  y_shift: number
}

export interface IStaveLineRenderOptions {
  draw_start_arrow: boolean;
  padding_left: number;
  text_justification: number;
  color: null;
  line_width: number;
  line_dash: null;
  rounded_end: boolean;
  arrowhead_length: number;
  text_position_vertical: number;
  draw_end_arrow: boolean;
  arrowhead_angle: number;
  padding_right: number
}

export interface IStaveTieRenderOptions {
  cp2: number;
  last_x_shift: number;
  tie_spacing: number;
  cp1: number;
  first_x_shift: number;
  text_shift_x: number;
  y_shift: number;
  font: IFont
}

export interface ISystemOptions {
  factory: null;
  noPadding: boolean;
  debugFormatter: boolean;
  connector: null;
  spaceBetweenStaves: number;
  formatIterations: number;
  x: number;
  width: number;
  y: number;
  details: any;
  noJustification: boolean
}

export interface ITextBracketRenderOptions {
  dashed: boolean;
  color: string;
  line_width: number;
  underline_superscript: boolean;
  show_bracket: boolean;
  dash: number[];
  bracket_height: number
}

export interface ISpace {
  mean: number;
  deviation: number;
  used: number
}

export interface IVibratoBracketRenderOptions {
  vibrato_width: number;
  wave_height: number;
  wave_girth: number;
  harsh: boolean;
  wave_width: number
}

export interface IBarnoteMetrics {
  widths: IStringTable<number>
}

export interface IBendRenderOptions {
  line_width: number;
  release_width: number;
  bend_width: number;
  line_style: string
}

export interface ISize {
  width: number;
  height: number
}

export interface IPedalMarkingGlyph {
  code: string;
  y_shift: number;
  x_shift: number;
}

export interface IVoiceOptions {
  softmaxFactor: number;
}

export interface IGraceNoteGroupRenderOptions {
  slur_y_shift: number
}

export interface IVibratoRenderOptions {
  wave_height: number;
  wave_girth: number;
  vibrato_width: number;
  harsh: boolean;
  wave_width: number
}

export interface ITremoloRenderOptions {
  stroke_spacing: number;
  stroke_px: number;
  font_scale: any;
}

export interface ITimeSignature {
  glyph: Glyph;
  line: any;
  num: boolean
}

export interface IFactoryFontOptions {
  face: string;
  style: string;
  point: number
}

export interface IFactoryStaveOptions {
  space: number
}

export interface IFactoryRendererOptions {
  elementId: string;
  background: string;
  context: null;
  width: number;
  backend: number;
  height: number
}

export interface IFactoryOptions {
  renderer: IFactoryRendererOptions;
  stave: IFactoryStaveOptions;
  font: IFactoryFontOptions;
}

export interface IContextGaps {
  total: number;
  gaps: any[]
}

export interface IKeyParts {
  root: string;
  type: string;
  accidental: string
}

export interface IModifierContextState {
  right_shift: number;
  left_shift: number;
  text_line: number;
  top_text_line: number
}

export interface IKeyProps {
  displaced: boolean;
  line: number;
  code: string;
  shift_right: number;
  stem_up_x_offset: number;
  stem_down_x_offset: number;
}

export interface IRaphaelAttributes {
  scale: string;
  transform: string;
  "stroke-width": number;
  fill: string;
  stroke: string;
  font: string
}

export interface IRaphaelState {
  font_weight: number;
  font_size: number;
  scale: ICoordinates;
  font_family: string
}

export interface ILine {
  column: number;
  line: number;
  flatLine: boolean;
  dblSharpLine: boolean;
  numAcc: number;
  width: number;
}

export interface IMusicNoteValue {
  root_index: number;
  int_val: number;
}

export interface ITempo {
  bpm: number;
  dots: number;
  duration: string;
  name: string;
}



export interface IPhrase {
  x: number;
  type: number;
  text: string;
  width: number;
  draw_width: number;
}

export interface ISymbolBlock {
  vAlign: boolean;
  symbolModifier: number;
  text: string;
  yShift: number;
  xShift: number;
  width: number;
  glyph: Glyph;
  symbolType: number;
}

export interface IStyle {
  lineWidth: number;
  strokeStyle: string;
  fillStyle: string;
  shadowBlur: number;
  shadowColor: string;
}

export type DrawContext = SVGContext | CanvasContext | RaphaelContext;
export type IRenderable =
  Note
  | MultiMeasureRest
  | StaveConnector
  | Tuplet
  | Beam
  | Curve
  | StaveTie
  | StaveLine
  | VibratoBracket
  | TextBracket
  | PedalMarking;
