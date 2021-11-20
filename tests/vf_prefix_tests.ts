// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// VF.* Prefix Tests
//
// VexFlow classes are available under the global Vex.Flow.* namespace.

import { VexFlowTests } from './vexflow_test_helpers';

import {
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
  Flow,
  Font,
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
  TextFormatter,
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
} from '../src/index';

// Tell TypeScript that we want very flexible typing,
// so we can use the Vex.Flow.* API in unusual ways without warnings.
// eslint-disable-next-line
declare let Vex: Record<string, any> & { Flow: typeof Flow & Record<string, any> };

const VFPrefixTests = {
  Start(): void {
    QUnit.module('VF.* API');
    test('VF.* API', VF_Prefix);
    test('VF Alias', VF_Alias);
  },
};

function VF_Prefix(): void {
  // Intentionally use Vex.Flow here so we can verify that the Vex.Flow.* API
  // is equivalent to using the individual classes in TypeScript.
  const VF = Vex.Flow;
  equal(Accidental, VF.Accidental);
  equal(Annotation, VF.Annotation);
  equal(Articulation, VF.Articulation);
  equal(Barline, VF.Barline);
  equal(BarNote, VF.BarNote);
  equal(Beam, VF.Beam);
  equal(Bend, VF.Bend);
  equal(BoundingBox, VF.BoundingBox);
  equal(BoundingBoxComputation, VF.BoundingBoxComputation);
  equal(ChordSymbol, VF.ChordSymbol);
  equal(Clef, VF.Clef);
  equal(ClefNote, VF.ClefNote);
  equal(Crescendo, VF.Crescendo);
  equal(Curve, VF.Curve);
  equal(Dot, VF.Dot);
  equal(EasyScore, VF.EasyScore);
  equal(Element, VF.Element);
  equal(Factory, VF.Factory);
  equal(Flow.RESOLUTION, VF.RESOLUTION);
  equal(Font, VF.Font);
  equal(Formatter, VF.Formatter);
  propEqual(new Formatter(), new VF.Formatter(), 'new Formatter()');
  equal(Fraction, VF.Fraction);
  equal(FretHandFinger, VF.FretHandFinger);
  equal(GhostNote, VF.GhostNote);
  equal(Glyph, VF.Glyph);
  equal(GlyphNote, VF.GlyphNote);
  equal(GraceNote, VF.GraceNote);
  equal(GraceNoteGroup, VF.GraceNoteGroup);
  equal(GraceTabNote, VF.GraceTabNote);
  equal(KeyManager, VF.KeyManager);
  equal(KeySignature, VF.KeySignature);
  equal(KeySigNote, VF.KeySigNote);
  equal(Modifier, VF.Modifier);
  equal(ModifierContext, VF.ModifierContext);
  equal(MultiMeasureRest, VF.MultiMeasureRest);
  equal(Music, VF.Music);
  equal(Note, VF.Note);
  equal(NoteHead, VF.NoteHead);
  equal(NoteSubGroup, VF.NoteSubGroup);
  equal(Ornament, VF.Ornament);
  equal(Parser, VF.Parser);
  equal(PedalMarking, VF.PedalMarking);
  equal(Registry, VF.Registry);
  equal(Renderer, VF.Renderer);
  equal(RepeatNote, VF.RepeatNote);
  equal(Repetition, VF.Repetition);
  equal(Stave, VF.Stave);
  notEqual(Stave, VF.StaveNote);
  equal(StaveConnector, VF.StaveConnector);
  equal(StaveHairpin, VF.StaveHairpin);
  equal(StaveLine, VF.StaveLine);
  equal(StaveModifier, VF.StaveModifier);
  equal(StaveNote, VF.StaveNote);
  equal(StaveTempo, VF.StaveTempo);
  equal(StaveText, VF.StaveText);
  equal(StaveTie, VF.StaveTie);
  equal(Stem, VF.Stem);
  equal(StringNumber, VF.StringNumber);
  equal(Stroke, VF.Stroke);
  equal(System, VF.System);
  equal(TabNote, VF.TabNote);
  equal(TabSlide, VF.TabSlide);
  equal(TabStave, VF.TabStave);
  equal(TabTie, VF.TabTie);
  equal(TextBracket, VF.TextBracket);
  equal(TextDynamics, VF.TextDynamics);
  equal(TextFormatter, VF.TextFormatter);
  equal(TextNote, VF.TextNote);
  equal(TickContext, VF.TickContext);
  equal(TimeSignature, VF.TimeSignature);
  equal(TimeSigNote, VF.TimeSigNote);
  equal(Tremolo, VF.Tremolo);
  equal(Tuning, VF.Tuning);
  equal(Tuplet, VF.Tuplet);
  equal(Vibrato, VF.Vibrato);
  equal(VibratoBracket, VF.VibratoBracket);
  equal(Voice, VF.Voice);
  equal(Volta, VF.Volta);
}

/**
 * If you have name collisions with VexFlow classes, consider extracting classes from Vex.Flow
 * and renaming them with a VF prefix.
 */
function VF_Alias(): void {
  const Flow = Vex.Flow;
  const VFAliases = {
    get VFAccidental() {
      return Flow.Accidental;
    },
    get VFAnnotation() {
      return Flow.Annotation;
    },
    get VFVibrato() {
      return Flow.Vibrato;
    },
  };
  const { VFVibrato, VFAccidental, VFAnnotation } = VFAliases;
  equal(Accidental, VFAccidental);
  equal(Annotation, VFAnnotation);

  const vibrato = new VFVibrato();
  ok(vibrato);

  const acc1 = new VFAccidental('##');
  const acc2 = new Accidental('##');
  equal(acc1.type, acc2.type);
}

VexFlowTests.register(VFPrefixTests);
export { VFPrefixTests };
