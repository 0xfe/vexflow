// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This file implements utility methods used by the rest of the VexFlow
// codebase.
//

/* eslint max-classes-per-file: "off" */
import {
  ACCIDENTALS, DURATIONS,
  GLYPH_PROPS_VALID_TYPES, UNICODE,
} from "./tables";
import {DefaultFontStack, Font, Fonts} from "./smufl";
import {Glyph} from "./glyph";
import {Fraction} from "./fraction";
import {BoundingBox} from "./boundingbox";
import {Renderer} from "./renderer";
import {Formatter} from "./formatter";
import {Music} from "./music";
import {Stave} from "./stave";
import {StaveNote} from "./stavenote";
import {StaveModifier} from "./stavemodifier";
import {StaveTempo} from "./stavetempo";
import {Voice} from "./voice";
import {Accidental} from "./accidental";
import {Beam} from "./beam";
import {StaveTie} from "./stavetie";
import {TabStave} from "./tabstave";
import {TabNote} from "./tabnote";
import {Bend} from "./bend";
import {Vibrato} from "./vibrato";
import {VibratoBracket} from "./vibratobracket";
import {Note} from "./note";
import {ModifierContext} from "./modifiercontext";
import {MultiMeasureRest} from "./multimeasurerest";
import {TickContext} from "./tickcontext";
import {Articulation} from "./articulation";
import {Annotation} from "./annotation";
import {ChordSymbol} from "./chordsymbol";
import {Barline} from "./stavebarline";
import {NoteHead} from "./notehead";
import {StaveConnector} from "./staveconnector";
import {ClefNote} from "./clefnote";
import {KeySignature} from "./keysignature";
import {KeySigNote} from "./keysignote";
import {TimeSignature} from "./timesignature";
import {TimeSigNote} from "./timesignote";
import {Stem} from "./stem";
import {TabTie} from "./tabtie";
import {Clef} from "./clef";
import {Dot} from "./dot";
import {Modifier} from "./modifier";
import {TabSlide} from "./tabslide";
import {Tuplet} from "./tuplet";
import {GraceNote} from "./gracenote";
import {GraceTabNote} from "./gracetabnote";
import {Tuning} from "./tuning";
import {KeyManager} from "./keymanager";
import {StaveHairpin} from "./stavehairpin";
import {Stroke} from "./strokes";
import {TextNote} from "./textnote";
import {Curve} from "./curve";
import {TextDynamics} from "./textdynamics";
import {StaveLine} from "./staveline";
import {Ornament} from "./ornament";
import {PedalMarking} from "./pedalmarking";
import {TextBracket} from "./textbracket";
import {FretHandFinger} from "./frethandfinger";
import {Repetition} from "./staverepetition";
import {BarNote} from "./barnote";
import {GhostNote} from "./ghostnote";
import {NoteSubGroup} from "./notesubgroup";
import {GraceNoteGroup} from "./gracenotegroup";
import {Tremolo} from "./tremolo";
import {StringNumber} from "./stringnumber";
import {Crescendo} from "./crescendo";
import {Volta} from "./stavevolta";
import {System} from "./system";
import {Factory} from "./factory";
import {Parser} from "./parser";
import {EasyScore} from "./easyscore";
import {Registry} from "./registry";
import {StaveText} from "./stavetext";
import {GlyphNote} from "./glyphnote";
import {RepeatNote} from "./repeatnote";
import {Element} from "./element";
import {
  DEFAULT_NOTATION_FONT_SCALE,
  DEFAULT_TIME,
  keySignature, LOG, RESOLUTION,
  STEM_HEIGHT
} from "./flow";

export const Vex = {
  Flow: {
    unicode: UNICODE,
    STEM_HEIGHT,
    ACCIDENTALS,
    keySignature: keySignature,
    glyphPropsValidTypes: GLYPH_PROPS_VALID_TYPES,
    TIME4_4: DEFAULT_TIME,
    DEFAULT_NOTATION_FONT_SCALE,
    RESOLUTION,
    DURATIONS,
    BoundingBox,
    Element,
    Fraction,
    Renderer,
    Formatter,
    Music,
    Glyph,
    Stave,
    StaveNote,
    StaveModifier,
    StaveTempo,
    Voice,
    Accidental,
    Beam,
    StaveTie,
    TabStave,
    TabNote,
    Bend,
    Vibrato,
    VibratoBracket,
    Note,
    ModifierContext,
    MultiMeasureRest,
    TickContext,
    Articulation,
    Annotation,
    ChordSymbol,
    Barline,
    NoteHead,
    StaveConnector,
    ClefNote,
    KeySignature,
    KeySigNote,
    TimeSignature,
    TimeSigNote,
    Stem,
    TabTie,
    Clef,
    Dot,
    Modifier,
    TabSlide,
    Tuplet,
    GraceNote,
    GraceTabNote,
    Tuning,
    KeyManager,
    StaveHairpin,
    Stroke,
    TextNote,
    Curve,
    TextDynamics,
    StaveLine,
    Ornament,
    PedalMarking,
    TextBracket,
    FretHandFinger,
    Repetition,
    BarNote,
    GhostNote,
    NoteSubGroup,
    GraceNoteGroup,
    Tremolo,
    StringNumber,
    Crescendo,
    Volta,
    System,
    Factory,
    Parser,
    EasyScore,
    Registry,
    StaveText,
    GlyphNote,
    RepeatNote,
    Font,
    Fonts,
    DefaultFontStack
  },
  forEach: (a: never[], fn: (...args: unknown[]) => void): void => {
    for (let i = 0; i < a.length; i++) {
      fn(a[i], i);
    }
  },
  // Benchmark. Run function `f` once and report time elapsed shifted by `s` milliseconds.
  BM: (s: never, f: () => void): void => {
    const start_time = new Date().getTime();
    f();
    const elapsed = new Date().getTime() - start_time;
    LOG(s + elapsed + 'ms');
  }
};
