import { Accidental } from './accidental';
import { Annotation, AnnotationHorizontalJustify, AnnotationVerticalJustify } from './annotation';
import { Articulation } from './articulation';
import { BarNote } from './barnote';
import { Beam } from './beam';
import { Bend } from './bend';
import { BoundingBox } from './boundingbox';
import { BoundingBoxComputation } from './boundingboxcomputation';
import { CanvasContext } from './canvascontext';
import { ChordSymbol, ChordSymbolHorizontalJustify, ChordSymbolVerticalJustify, SymbolModifiers, SymbolTypes } from './chordsymbol';
import { Clef } from './clef';
import { ClefNote } from './clefnote';
import { Crescendo } from './crescendo';
import { Curve, CurvePosition } from './curve';
import { Dot } from './dot';
import { EasyScore } from './easyscore';
import { Element } from './element';
import { Factory } from './factory';
import { Font, FontModule, FontStyle, FontWeight } from './font';
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
import { Modifier, ModifierPosition } from './modifier';
import { ModifierContext } from './modifiercontext';
import { MultiMeasureRest } from './multimeasurerest';
import { Music } from './music';
import { Note } from './note';
import { NoteHead } from './notehead';
import { NoteSubGroup } from './notesubgroup';
import { Ornament } from './ornament';
import { Parenthesis } from './parenthesis';
import { Parser } from './parser';
import { PedalMarking } from './pedalmarking';
import { Registry } from './registry';
import { RenderContext } from './rendercontext';
import { Renderer, RendererBackends, RendererLineEndType } from './renderer';
import { RepeatNote } from './repeatnote';
import { Stave } from './stave';
import { Barline, BarlineType } from './stavebarline';
import { StaveConnector } from './staveconnector';
import { StaveHairpin } from './stavehairpin';
import { StaveLine } from './staveline';
import { StaveModifier, StaveModifierPosition } from './stavemodifier';
import { StaveNote } from './stavenote';
import { Repetition } from './staverepetition';
import { StaveTempo } from './stavetempo';
import { StaveText } from './stavetext';
import { StaveTie } from './stavetie';
import { Volta, VoltaType } from './stavevolta';
import { Stem } from './stem';
import { StringNumber } from './stringnumber';
import { Stroke } from './strokes';
import { SVGContext } from './svgcontext';
import { System } from './system';
import { TabNote } from './tabnote';
import { TabSlide } from './tabslide';
import { TabStave } from './tabstave';
import { TabTie } from './tabtie';
import { TextBracket, TextBracketPosition } from './textbracket';
import { TextDynamics } from './textdynamics';
import { TextFormatter } from './textformatter';
import { TextJustification, TextNote } from './textnote';
import { TickContext } from './tickcontext';
import { TimeSignature } from './timesignature';
import { TimeSigNote } from './timesignote';
import { Tremolo } from './tremolo';
import { Tuning } from './tuning';
import { Tuplet } from './tuplet';
import { Vibrato } from './vibrato';
import { VibratoBracket } from './vibratobracket';
import { Voice, VoiceMode } from './voice';
export declare class Flow {
    static get BUILD(): {
        /** version number. */
        VERSION: string;
        /** git commit ID that this library was built from. */
        ID: string;
        /** The date when this library was compiled. */
        DATE: string;
    };
    static Accidental: typeof Accidental;
    static Annotation: typeof Annotation;
    static Articulation: typeof Articulation;
    static Barline: typeof Barline;
    static BarNote: typeof BarNote;
    static Beam: typeof Beam;
    static Bend: typeof Bend;
    static BoundingBox: typeof BoundingBox;
    static BoundingBoxComputation: typeof BoundingBoxComputation;
    static CanvasContext: typeof CanvasContext;
    static ChordSymbol: typeof ChordSymbol;
    static Clef: typeof Clef;
    static ClefNote: typeof ClefNote;
    static Crescendo: typeof Crescendo;
    static Curve: typeof Curve;
    static Dot: typeof Dot;
    static EasyScore: typeof EasyScore;
    static Element: typeof Element;
    static Factory: typeof Factory;
    static Font: typeof Font;
    static Formatter: typeof Formatter;
    static Fraction: typeof Fraction;
    static FretHandFinger: typeof FretHandFinger;
    static GhostNote: typeof GhostNote;
    static Glyph: typeof Glyph;
    static GlyphNote: typeof GlyphNote;
    static GraceNote: typeof GraceNote;
    static GraceNoteGroup: typeof GraceNoteGroup;
    static GraceTabNote: typeof GraceTabNote;
    static KeyManager: typeof KeyManager;
    static KeySignature: typeof KeySignature;
    static KeySigNote: typeof KeySigNote;
    static Modifier: typeof Modifier;
    static ModifierContext: typeof ModifierContext;
    static MultiMeasureRest: typeof MultiMeasureRest;
    static Music: typeof Music;
    static Note: typeof Note;
    static NoteHead: typeof NoteHead;
    static NoteSubGroup: typeof NoteSubGroup;
    static Ornament: typeof Ornament;
    static Parenthesis: typeof Parenthesis;
    static Parser: typeof Parser;
    static PedalMarking: typeof PedalMarking;
    static Registry: typeof Registry;
    static RenderContext: typeof RenderContext;
    static Renderer: typeof Renderer;
    static RepeatNote: typeof RepeatNote;
    static Repetition: typeof Repetition;
    static Stave: typeof Stave;
    static StaveConnector: typeof StaveConnector;
    static StaveHairpin: typeof StaveHairpin;
    static StaveLine: typeof StaveLine;
    static StaveModifier: typeof StaveModifier;
    static StaveNote: typeof StaveNote;
    static StaveTempo: typeof StaveTempo;
    static StaveText: typeof StaveText;
    static StaveTie: typeof StaveTie;
    static Stem: typeof Stem;
    static StringNumber: typeof StringNumber;
    static Stroke: typeof Stroke;
    static SVGContext: typeof SVGContext;
    static System: typeof System;
    static TabNote: typeof TabNote;
    static TabSlide: typeof TabSlide;
    static TabStave: typeof TabStave;
    static TabTie: typeof TabTie;
    static TextBracket: typeof TextBracket;
    static TextDynamics: typeof TextDynamics;
    static TextFormatter: typeof TextFormatter;
    static TextNote: typeof TextNote;
    static TickContext: typeof TickContext;
    static TimeSignature: typeof TimeSignature;
    static TimeSigNote: typeof TimeSigNote;
    static Tremolo: typeof Tremolo;
    static Tuning: typeof Tuning;
    static Tuplet: typeof Tuplet;
    static Vibrato: typeof Vibrato;
    static VibratoBracket: typeof VibratoBracket;
    static Voice: typeof Voice;
    static Volta: typeof Volta;
    static AnnotationHorizontalJustify: typeof AnnotationHorizontalJustify;
    static AnnotationVerticalJustify: typeof AnnotationVerticalJustify;
    static ChordSymbolHorizontalJustify: typeof ChordSymbolHorizontalJustify;
    static ChordSymbolVerticalJustify: typeof ChordSymbolVerticalJustify;
    static SymbolTypes: typeof SymbolTypes;
    static SymbolModifiers: typeof SymbolModifiers;
    static CurvePosition: typeof CurvePosition;
    static FontWeight: typeof FontWeight;
    static FontStyle: typeof FontStyle;
    static ModifierPosition: typeof ModifierPosition;
    static RendererBackends: typeof RendererBackends;
    static RendererLineEndType: typeof RendererLineEndType;
    static BarlineType: typeof BarlineType;
    static StaveModifierPosition: typeof StaveModifierPosition;
    static VoltaType: typeof VoltaType;
    static TextBracketPosition: typeof TextBracketPosition;
    static TextJustification: typeof TextJustification;
    static VoiceMode: typeof VoiceMode;
    /**
     * Examples:
     * ```
     * Vex.Flow.setMusicFont('Petaluma');
     * Vex.Flow.setMusicFont('Bravura', 'Gonville');
     * ```
     *
     * **CASE 1**: You are using `vexflow.js`, which includes all music fonts (Bravura, Gonville, Petaluma, Custom).
     * In this case, calling this method is optional, since VexFlow already defaults to a music font stack of:
     * 'Bravura', 'Gonville', 'Custom'.
     *
     * **CASE 2**: You are using `vexflow-bravura.js` or `vexflow-petaluma.js` or `vexflow-gonville.js`,
     * which includes a single music font. Calling this method is unnecessary.
     *
     * **CASE 3**: You are using the light weight `vexflow-core.js` to take advantage of lazy loading for fonts.
     * In this case, the default music font stack is empty.
     * Example:
     * ```
     * await Vex.Flow.fetchMusicFont('Petaluma');
     * Vex.Flow.setMusicFont('Petaluma');
     * ... (do VexFlow stuff) ...
     * ```
     * See `demos/fonts/` for more examples.
     *
     * @returns an array of Font objects corresponding to the provided `fontNames`.
     */
    static setMusicFont(...fontNames: string[]): Font[];
    /**
     * Used with vexflow-core which supports dynamic font loading.
     */
    static fetchMusicFont(fontName: string, fontModuleOrPath?: string | FontModule): Promise<void>;
    static getMusicFont(): string[];
    static getMusicFontStack(): Font[];
    static get RENDER_PRECISION_PLACES(): number;
    static set RENDER_PRECISION_PLACES(precision: number);
    static get SOFTMAX_FACTOR(): number;
    static set SOFTMAX_FACTOR(factor: number);
    static get NOTATION_FONT_SCALE(): number;
    static set NOTATION_FONT_SCALE(value: number);
    static get TABLATURE_FONT_SCALE(): number;
    static set TABLATURE_FONT_SCALE(value: number);
    static get RESOLUTION(): number;
    static set RESOLUTION(value: number);
    static get SLASH_NOTEHEAD_WIDTH(): number;
    static set SLASH_NOTEHEAD_WIDTH(value: number);
    static get STAVE_LINE_DISTANCE(): number;
    static set STAVE_LINE_DISTANCE(value: number);
    static get STAVE_LINE_THICKNESS(): number;
    static set STAVE_LINE_THICKNESS(value: number);
    static get STEM_HEIGHT(): number;
    static set STEM_HEIGHT(value: number);
    static get STEM_WIDTH(): number;
    static set STEM_WIDTH(value: number);
    static get TIME4_4(): {
        num_beats: number;
        beat_value: number;
        resolution: number;
    };
    static get accidentalMap(): Record<string, {
        code: string;
        parenRightPaddingAdjustment: number;
    }>;
    static get unicode(): Record<string, string>;
    static keySignature(spec: string): {
        type: string;
        line: number;
    }[];
    static hasKeySignature(spec: string): boolean;
    static getKeySignatures(): Record<string, {
        acc?: string;
        num: number;
    }>;
    static clefProperties(clef: string): {
        line_shift: number;
    };
    static keyProperties(key: string, clef?: string, params?: any): any;
    static durationToTicks(duration: string): number;
}
