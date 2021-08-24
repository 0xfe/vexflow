// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// VF.* Prefix Tests
//
// VexFlow classes are available under the global Vex.Flow.* namespace.

import { Accidental } from 'accidental';
import { Annotation } from 'annotation';
import { Articulation } from 'articulation';
import { BarNote } from 'barnote';
import { Beam } from 'beam';
import { Bend } from 'bend';
import { BoundingBox } from 'boundingbox';
import { BoundingBoxComputation } from 'boundingboxcomputation';
import { ChordSymbol } from 'chordsymbol';
import { Clef } from 'clef';
import { ClefNote } from 'clefnote';
import { Crescendo } from 'crescendo';
import { Curve } from 'curve';
import { Dot } from 'dot';
import { EasyScore } from 'easyscore';
import { Element } from 'element';
import { Factory } from 'factory';
import { Flow } from 'flow';
import { Font, Fonts } from 'font';
import { Formatter } from 'formatter';
import { Fraction } from 'fraction';
import { FretHandFinger } from 'frethandfinger';
import { GhostNote } from 'ghostnote';
import { Glyph } from 'glyph';
import { GlyphNote } from 'glyphnote';
import { GraceNote } from 'gracenote';
import { GraceNoteGroup } from 'gracenotegroup';
import { GraceTabNote } from 'gracetabnote';
import { KeyManager } from 'keymanager';
import { KeySignature } from 'keysignature';
import { KeySigNote } from 'keysignote';
import { Modifier } from 'modifier';
import { ModifierContext } from 'modifiercontext';
import { MultiMeasureRest } from 'multimeasurerest';
import { Music } from 'music';
import { Note } from 'note';
import { NoteHead } from 'notehead';
import { NoteSubGroup } from 'notesubgroup';
import { Ornament } from 'ornament';
import { Parser } from 'parser';
import { PedalMarking } from 'pedalmarking';
import { Registry } from 'registry';
import { Renderer } from 'renderer';
import { RepeatNote } from 'repeatnote';
import { Stave } from 'stave';
import { Barline } from 'stavebarline';
import { StaveConnector } from 'staveconnector';
import { StaveHairpin } from 'stavehairpin';
import { StaveLine } from 'staveline';
import { StaveModifier } from 'stavemodifier';
import { StaveNote } from 'stavenote';
import { Repetition } from 'staverepetition';
import { StaveTempo } from 'stavetempo';
import { StaveText } from 'stavetext';
import { StaveTie } from 'stavetie';
import { Volta } from 'stavevolta';
import { Stem } from 'stem';
import { StringNumber } from 'stringnumber';
import { Stroke } from 'strokes';
import { System } from 'system';
import { TabNote } from 'tabnote';
import { TabSlide } from 'tabslide';
import { TabStave } from 'tabstave';
import { TabTie } from 'tabtie';
import { TextBracket } from 'textbracket';
import { TextDynamics } from 'textdynamics';
import { TextFont } from 'textfont';
import { TextNote } from 'textnote';
import { TickContext } from 'tickcontext';
import { TimeSignature } from 'timesignature';
import { TimeSigNote } from 'timesignote';
import { Tremolo } from 'tremolo';
import { Tuning } from 'tuning';
import { Tuplet } from 'tuplet';
import { Vibrato } from 'vibrato';
import { VibratoBracket } from 'vibratobracket';
import { Voice } from 'voice';

const VFPrefixTests = {
  Start(): void {
    QUnit.module('VF.* API');
    test('VF.* API', this.VF_Prefix);
  },

  VF_Prefix(): void {
    const VF = Vex.Flow as unknown as typeof Flow;
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
    equal(Fonts, VF.Fonts);
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
    equal(TextFont, VF.TextFont);
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
  },
};

export { VFPrefixTests };
