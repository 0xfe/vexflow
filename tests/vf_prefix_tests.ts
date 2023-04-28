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
    QUnit.test('VF.* API', VF_Prefix);
    QUnit.test('VF Alias', VF_Alias);
  },
};

function VF_Prefix(assert: Assert): void {
  // Intentionally use Vex.Flow here so we can verify that the Vex.Flow.* API
  // is equivalent to using the individual classes in TypeScript.
  const VF = Vex.Flow;
  assert.equal(Accidental, VF.Accidental);
  assert.equal(Annotation, VF.Annotation);
  assert.equal(Articulation, VF.Articulation);
  assert.equal(Barline, VF.Barline);
  assert.equal(BarNote, VF.BarNote);
  assert.equal(Beam, VF.Beam);
  assert.equal(Bend, VF.Bend);
  assert.equal(BoundingBox, VF.BoundingBox);
  assert.equal(BoundingBoxComputation, VF.BoundingBoxComputation);
  assert.equal(ChordSymbol, VF.ChordSymbol);
  assert.equal(Clef, VF.Clef);
  assert.equal(ClefNote, VF.ClefNote);
  assert.equal(Crescendo, VF.Crescendo);
  assert.equal(Curve, VF.Curve);
  assert.equal(Dot, VF.Dot);
  assert.equal(EasyScore, VF.EasyScore);
  assert.equal(Element, VF.Element);
  assert.equal(Factory, VF.Factory);
  assert.equal(Flow.RESOLUTION, VF.RESOLUTION);
  assert.equal(Font, VF.Font);
  assert.equal(Formatter, VF.Formatter);
  assert.propEqual(new Formatter(), new VF.Formatter(), 'new Formatter()');
  assert.equal(Fraction, VF.Fraction);
  assert.equal(FretHandFinger, VF.FretHandFinger);
  assert.equal(GhostNote, VF.GhostNote);
  assert.equal(Glyph, VF.Glyph);
  assert.equal(GlyphNote, VF.GlyphNote);
  assert.equal(GraceNote, VF.GraceNote);
  assert.equal(GraceNoteGroup, VF.GraceNoteGroup);
  assert.equal(GraceTabNote, VF.GraceTabNote);
  assert.equal(KeyManager, VF.KeyManager);
  assert.equal(KeySignature, VF.KeySignature);
  assert.equal(KeySigNote, VF.KeySigNote);
  assert.equal(Modifier, VF.Modifier);
  assert.equal(ModifierContext, VF.ModifierContext);
  assert.equal(MultiMeasureRest, VF.MultiMeasureRest);
  assert.equal(Music, VF.Music);
  assert.equal(Note, VF.Note);
  assert.equal(NoteHead, VF.NoteHead);
  assert.equal(NoteSubGroup, VF.NoteSubGroup);
  assert.equal(Ornament, VF.Ornament);
  assert.equal(Parser, VF.Parser);
  assert.equal(PedalMarking, VF.PedalMarking);
  assert.equal(Registry, VF.Registry);
  assert.equal(Renderer, VF.Renderer);
  assert.equal(RepeatNote, VF.RepeatNote);
  assert.equal(Repetition, VF.Repetition);
  assert.equal(Stave, VF.Stave);
  assert.notEqual(Stave, VF.StaveNote);
  assert.equal(StaveConnector, VF.StaveConnector);
  assert.equal(StaveHairpin, VF.StaveHairpin);
  assert.equal(StaveLine, VF.StaveLine);
  assert.equal(StaveModifier, VF.StaveModifier);
  assert.equal(StaveNote, VF.StaveNote);
  assert.equal(StaveTempo, VF.StaveTempo);
  assert.equal(StaveText, VF.StaveText);
  assert.equal(StaveTie, VF.StaveTie);
  assert.equal(Stem, VF.Stem);
  assert.equal(StringNumber, VF.StringNumber);
  assert.equal(Stroke, VF.Stroke);
  assert.equal(System, VF.System);
  assert.equal(TabNote, VF.TabNote);
  assert.equal(TabSlide, VF.TabSlide);
  assert.equal(TabStave, VF.TabStave);
  assert.equal(TabTie, VF.TabTie);
  assert.equal(TextBracket, VF.TextBracket);
  assert.equal(TextDynamics, VF.TextDynamics);
  assert.equal(TextFormatter, VF.TextFormatter);
  assert.equal(TextNote, VF.TextNote);
  assert.equal(TickContext, VF.TickContext);
  assert.equal(TimeSignature, VF.TimeSignature);
  assert.equal(TimeSigNote, VF.TimeSigNote);
  assert.equal(Tremolo, VF.Tremolo);
  assert.equal(Tuning, VF.Tuning);
  assert.equal(Tuplet, VF.Tuplet);
  assert.equal(Vibrato, VF.Vibrato);
  assert.equal(VibratoBracket, VF.VibratoBracket);
  assert.equal(Voice, VF.Voice);
  assert.equal(Volta, VF.Volta);
}

/**
 * If you have name collisions with VexFlow classes, consider extracting classes from Vex.Flow
 * and renaming them with a VF prefix.
 */
function VF_Alias(assert: Assert): void {
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
  assert.equal(Accidental, VFAccidental);
  assert.equal(Annotation, VFAnnotation);

  const vibrato = new VFVibrato();
  assert.ok(vibrato);

  const acc1 = new VFAccidental('##');
  const acc2 = new Accidental('##');
  assert.equal(acc1.type, acc2.type);
}

VexFlowTests.register(VFPrefixTests);
export { VFPrefixTests };
