var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Accidental } from './accidental.js';
import { Annotation, AnnotationHorizontalJustify, AnnotationVerticalJustify } from './annotation.js';
import { Articulation } from './articulation.js';
import { BarNote } from './barnote.js';
import { Beam } from './beam.js';
import { Bend } from './bend.js';
import { BoundingBox } from './boundingbox.js';
import { BoundingBoxComputation } from './boundingboxcomputation.js';
import { CanvasContext } from './canvascontext.js';
import { ChordSymbol, ChordSymbolHorizontalJustify, ChordSymbolVerticalJustify, SymbolModifiers, SymbolTypes, } from './chordsymbol.js';
import { Clef } from './clef.js';
import { ClefNote } from './clefnote.js';
import { Crescendo } from './crescendo.js';
import { Curve, CurvePosition } from './curve.js';
import { Dot } from './dot.js';
import { EasyScore } from './easyscore.js';
import { Element } from './element.js';
import { Factory } from './factory.js';
import { Font, FontStyle, FontWeight } from './font.js';
import { Formatter } from './formatter.js';
import { Fraction } from './fraction.js';
import { FretHandFinger } from './frethandfinger.js';
import { GhostNote } from './ghostnote.js';
import { Glyph } from './glyph.js';
import { GlyphNote } from './glyphnote.js';
import { GraceNote } from './gracenote.js';
import { GraceNoteGroup } from './gracenotegroup.js';
import { GraceTabNote } from './gracetabnote.js';
import { KeyManager } from './keymanager.js';
import { KeySignature } from './keysignature.js';
import { KeySigNote } from './keysignote.js';
import { Modifier, ModifierPosition } from './modifier.js';
import { ModifierContext } from './modifiercontext.js';
import { MultiMeasureRest } from './multimeasurerest.js';
import { Music } from './music.js';
import { Note } from './note.js';
import { NoteHead } from './notehead.js';
import { NoteSubGroup } from './notesubgroup.js';
import { Ornament } from './ornament.js';
import { Parenthesis } from './parenthesis.js';
import { Parser } from './parser.js';
import { PedalMarking } from './pedalmarking.js';
import { Registry } from './registry.js';
import { RenderContext } from './rendercontext.js';
import { Renderer, RendererBackends, RendererLineEndType } from './renderer.js';
import { RepeatNote } from './repeatnote.js';
import { Stave } from './stave.js';
import { Barline, BarlineType } from './stavebarline.js';
import { StaveConnector } from './staveconnector.js';
import { StaveHairpin } from './stavehairpin.js';
import { StaveLine } from './staveline.js';
import { StaveModifier, StaveModifierPosition } from './stavemodifier.js';
import { StaveNote } from './stavenote.js';
import { Repetition } from './staverepetition.js';
import { StaveTempo } from './stavetempo.js';
import { StaveText } from './stavetext.js';
import { StaveTie } from './stavetie.js';
import { Volta, VoltaType } from './stavevolta.js';
import { Stem } from './stem.js';
import { StringNumber } from './stringnumber.js';
import { Stroke } from './strokes.js';
import { SVGContext } from './svgcontext.js';
import { System } from './system.js';
import { Tables } from './tables.js';
import { TabNote } from './tabnote.js';
import { TabSlide } from './tabslide.js';
import { TabStave } from './tabstave.js';
import { TabTie } from './tabtie.js';
import { TextBracket, TextBracketPosition } from './textbracket.js';
import { TextDynamics } from './textdynamics.js';
import { TextFormatter } from './textformatter.js';
import { TextJustification, TextNote } from './textnote.js';
import { TickContext } from './tickcontext.js';
import { TimeSignature } from './timesignature.js';
import { TimeSigNote } from './timesignote.js';
import { Tremolo } from './tremolo.js';
import { Tuning } from './tuning.js';
import { Tuplet } from './tuplet.js';
import { DATE, ID, VERSION } from './version.js';
import { Vibrato } from './vibrato.js';
import { VibratoBracket } from './vibratobracket.js';
import { Voice, VoiceMode } from './voice.js';
class Flow {
    static get BUILD() {
        return {
            VERSION: VERSION,
            ID: ID,
            DATE: DATE,
        };
    }
    static setMusicFont(...fontNames) {
        const fonts = fontNames.map((fontName) => Font.load(fontName));
        Tables.MUSIC_FONT_STACK = fonts;
        Glyph.MUSIC_FONT_STACK = fonts.slice();
        Glyph.CURRENT_CACHE_KEY = fontNames.join(',');
        return fonts;
    }
    static fetchMusicFont(fontName, fontModuleOrPath) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    static getMusicFont() {
        const fonts = Tables.MUSIC_FONT_STACK;
        return fonts.map((font) => font.getName());
    }
    static getMusicFontStack() {
        return Tables.MUSIC_FONT_STACK;
    }
    static get RENDER_PRECISION_PLACES() {
        return Tables.RENDER_PRECISION_PLACES;
    }
    static set RENDER_PRECISION_PLACES(precision) {
        Tables.RENDER_PRECISION_PLACES = precision;
    }
    static get SOFTMAX_FACTOR() {
        return Tables.SOFTMAX_FACTOR;
    }
    static set SOFTMAX_FACTOR(factor) {
        Tables.SOFTMAX_FACTOR = factor;
    }
    static get NOTATION_FONT_SCALE() {
        return Tables.NOTATION_FONT_SCALE;
    }
    static set NOTATION_FONT_SCALE(value) {
        Tables.NOTATION_FONT_SCALE = value;
    }
    static get TABLATURE_FONT_SCALE() {
        return Tables.TABLATURE_FONT_SCALE;
    }
    static set TABLATURE_FONT_SCALE(value) {
        Tables.TABLATURE_FONT_SCALE = value;
    }
    static get RESOLUTION() {
        return Tables.RESOLUTION;
    }
    static set RESOLUTION(value) {
        Tables.RESOLUTION = value;
    }
    static get SLASH_NOTEHEAD_WIDTH() {
        return Tables.SLASH_NOTEHEAD_WIDTH;
    }
    static set SLASH_NOTEHEAD_WIDTH(value) {
        Tables.SLASH_NOTEHEAD_WIDTH = value;
    }
    static get STAVE_LINE_DISTANCE() {
        return Tables.STAVE_LINE_DISTANCE;
    }
    static set STAVE_LINE_DISTANCE(value) {
        Tables.STAVE_LINE_DISTANCE = value;
    }
    static get STAVE_LINE_THICKNESS() {
        return Tables.STAVE_LINE_THICKNESS;
    }
    static set STAVE_LINE_THICKNESS(value) {
        Tables.STAVE_LINE_THICKNESS = value;
    }
    static get STEM_HEIGHT() {
        return Tables.STEM_HEIGHT;
    }
    static set STEM_HEIGHT(value) {
        Tables.STEM_HEIGHT = value;
    }
    static get STEM_WIDTH() {
        return Tables.STEM_WIDTH;
    }
    static set STEM_WIDTH(value) {
        Tables.STEM_WIDTH = value;
    }
    static get TIME4_4() {
        return Tables.TIME4_4;
    }
    static get accidentalMap() {
        return Tables.accidentalMap;
    }
    static get unicode() {
        return Tables.unicode;
    }
    static keySignature(spec) {
        return Tables.keySignature(spec);
    }
    static hasKeySignature(spec) {
        return Tables.hasKeySignature(spec);
    }
    static getKeySignatures() {
        return Tables.getKeySignatures();
    }
    static clefProperties(clef) {
        return Tables.clefProperties(clef);
    }
    static keyProperties(key, clef, params) {
        return Tables.keyProperties(key, clef, params);
    }
    static durationToTicks(duration) {
        return Tables.durationToTicks(duration);
    }
}
Flow.Accidental = Accidental;
Flow.Annotation = Annotation;
Flow.Articulation = Articulation;
Flow.Barline = Barline;
Flow.BarNote = BarNote;
Flow.Beam = Beam;
Flow.Bend = Bend;
Flow.BoundingBox = BoundingBox;
Flow.BoundingBoxComputation = BoundingBoxComputation;
Flow.CanvasContext = CanvasContext;
Flow.ChordSymbol = ChordSymbol;
Flow.Clef = Clef;
Flow.ClefNote = ClefNote;
Flow.Crescendo = Crescendo;
Flow.Curve = Curve;
Flow.Dot = Dot;
Flow.EasyScore = EasyScore;
Flow.Element = Element;
Flow.Factory = Factory;
Flow.Font = Font;
Flow.Formatter = Formatter;
Flow.Fraction = Fraction;
Flow.FretHandFinger = FretHandFinger;
Flow.GhostNote = GhostNote;
Flow.Glyph = Glyph;
Flow.GlyphNote = GlyphNote;
Flow.GraceNote = GraceNote;
Flow.GraceNoteGroup = GraceNoteGroup;
Flow.GraceTabNote = GraceTabNote;
Flow.KeyManager = KeyManager;
Flow.KeySignature = KeySignature;
Flow.KeySigNote = KeySigNote;
Flow.Modifier = Modifier;
Flow.ModifierContext = ModifierContext;
Flow.MultiMeasureRest = MultiMeasureRest;
Flow.Music = Music;
Flow.Note = Note;
Flow.NoteHead = NoteHead;
Flow.NoteSubGroup = NoteSubGroup;
Flow.Ornament = Ornament;
Flow.Parenthesis = Parenthesis;
Flow.Parser = Parser;
Flow.PedalMarking = PedalMarking;
Flow.Registry = Registry;
Flow.RenderContext = RenderContext;
Flow.Renderer = Renderer;
Flow.RepeatNote = RepeatNote;
Flow.Repetition = Repetition;
Flow.Stave = Stave;
Flow.StaveConnector = StaveConnector;
Flow.StaveHairpin = StaveHairpin;
Flow.StaveLine = StaveLine;
Flow.StaveModifier = StaveModifier;
Flow.StaveNote = StaveNote;
Flow.StaveTempo = StaveTempo;
Flow.StaveText = StaveText;
Flow.StaveTie = StaveTie;
Flow.Stem = Stem;
Flow.StringNumber = StringNumber;
Flow.Stroke = Stroke;
Flow.SVGContext = SVGContext;
Flow.System = System;
Flow.TabNote = TabNote;
Flow.TabSlide = TabSlide;
Flow.TabStave = TabStave;
Flow.TabTie = TabTie;
Flow.TextBracket = TextBracket;
Flow.TextDynamics = TextDynamics;
Flow.TextFormatter = TextFormatter;
Flow.TextNote = TextNote;
Flow.TickContext = TickContext;
Flow.TimeSignature = TimeSignature;
Flow.TimeSigNote = TimeSigNote;
Flow.Tremolo = Tremolo;
Flow.Tuning = Tuning;
Flow.Tuplet = Tuplet;
Flow.Vibrato = Vibrato;
Flow.VibratoBracket = VibratoBracket;
Flow.Voice = Voice;
Flow.Volta = Volta;
Flow.AnnotationHorizontalJustify = AnnotationHorizontalJustify;
Flow.AnnotationVerticalJustify = AnnotationVerticalJustify;
Flow.ChordSymbolHorizontalJustify = ChordSymbolHorizontalJustify;
Flow.ChordSymbolVerticalJustify = ChordSymbolVerticalJustify;
Flow.SymbolTypes = SymbolTypes;
Flow.SymbolModifiers = SymbolModifiers;
Flow.CurvePosition = CurvePosition;
Flow.FontWeight = FontWeight;
Flow.FontStyle = FontStyle;
Flow.ModifierPosition = ModifierPosition;
Flow.RendererBackends = RendererBackends;
Flow.RendererLineEndType = RendererLineEndType;
Flow.BarlineType = BarlineType;
Flow.StaveModifierPosition = StaveModifierPosition;
Flow.VoltaType = VoltaType;
Flow.TextBracketPosition = TextBracketPosition;
Flow.TextJustification = TextJustification;
Flow.VoiceMode = VoiceMode;
export { Flow };
