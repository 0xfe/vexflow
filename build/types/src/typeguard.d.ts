import { Accidental } from './accidental';
import { Annotation } from './annotation';
import { Dot } from './dot';
import { GraceNote } from './gracenote';
import { GraceNoteGroup } from './gracenotegroup';
import { Note } from './note';
import { RenderContext } from './rendercontext.js';
import { Barline } from './stavebarline';
import { StaveNote } from './stavenote';
import { StemmableNote } from './stemmablenote';
import { TabNote } from './tabnote';
/**
 * Use instead of `instanceof` as a more flexible type guard.
 * @param obj check if this object's CATEGORY matches the provided category.
 * @param category a string representing a category of VexFlow objects.
 * @param checkAncestors defaults to `true`, so we walk up the prototype chain to look for a matching `CATEGORY`.
 *        If `false`, we do not check the superclass or other ancestors.
 * @returns true if `obj` has a static `CATEGORY` property that matches `category`.
 */
export declare function isCategory<T>(obj: any, category: string, checkAncestors?: boolean): obj is T;
export declare const isAccidental: (obj: unknown) => obj is Accidental;
export declare const isAnnotation: (obj: unknown) => obj is Annotation;
export declare const isBarline: (obj: unknown) => obj is Barline;
export declare const isDot: (obj: unknown) => obj is Dot;
export declare const isGraceNote: (obj: unknown) => obj is GraceNote;
export declare const isGraceNoteGroup: (obj: unknown) => obj is GraceNoteGroup;
export declare const isNote: (obj: unknown) => obj is Note;
export declare const isRenderContext: (obj: unknown) => obj is RenderContext;
export declare const isStaveNote: (obj: unknown) => obj is StaveNote;
export declare const isStemmableNote: (obj: unknown) => obj is StemmableNote;
export declare const isTabNote: (obj: unknown) => obj is TabNote;
export declare const enum Category {
    Accidental = "Accidental",
    Annotation = "Annotation",
    Articulation = "Articulation",
    Barline = "Barline",
    BarNote = "BarNote",
    Beam = "Beam",
    Bend = "Bend",
    ChordSymbol = "ChordSymbol",
    Clef = "Clef",
    ClefNote = "ClefNote",
    Crescendo = "Crescendo",
    Curve = "Curve",
    Dot = "Dot",
    Element = "Element",
    Fraction = "Fraction",
    FretHandFinger = "FretHandFinger",
    GhostNote = "GhostNote",
    Glyph = "Glyph",
    GlyphNote = "GlyphNote",
    GraceNote = "GraceNote",
    GraceNoteGroup = "GraceNoteGroup",
    GraceTabNote = "GraceTabNote",
    KeySignature = "KeySignature",
    KeySigNote = "KeySigNote",
    Modifier = "Modifier",
    MultiMeasureRest = "MultiMeasureRest",
    Note = "Note",
    NoteHead = "NoteHead",
    NoteSubGroup = "NoteSubGroup",
    Ornament = "Ornament",
    Parenthesis = "Parenthesis",
    PedalMarking = "PedalMarking",
    RenderContext = "RenderContext",
    RepeatNote = "RepeatNote",
    Repetition = "Repetition",
    Stave = "Stave",
    StaveConnector = "StaveConnector",
    StaveHairpin = "StaveHairpin",
    StaveLine = "StaveLine",
    StaveModifier = "StaveModifier",
    StaveNote = "StaveNote",
    StaveSection = "StaveSection",
    StaveTempo = "StaveTempo",
    StaveText = "StaveText",
    StaveTie = "StaveTie",
    Stem = "Stem",
    StemmableNote = "StemmableNote",
    StringNumber = "StringNumber",
    Stroke = "Stroke",
    System = "System",
    TabNote = "TabNote",
    TabSlide = "TabSlide",
    TabStave = "TabStave",
    TabTie = "TabTie",
    TextBracket = "TextBracket",
    TextDynamics = "TextDynamics",
    TextNote = "TextNote",
    Tickable = "Tickable",
    TimeSignature = "TimeSignature",
    TimeSigNote = "TimeSigNote",
    Tremolo = "Tremolo",
    Tuplet = "Tuplet",
    Vibrato = "Vibrato",
    VibratoBracket = "VibratoBracket",
    Voice = "Voice",
    Volta = "Volta"
}
