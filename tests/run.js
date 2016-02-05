VF.Test.run = function () {
  // Setup the measureTextCache with pre-collected data.
  VF.SVGContext.measureTextCache = VF.Test.measureTextCache;

  VF.Test.Accidental.Start();
  VF.Test.StaveNote.Start();
  VF.Test.Voice.Start();
  VF.Test.NoteHead.Start();
  VF.Test.TabNote.Start();
  VF.Test.TickContext.Start();
  VF.Test.ModifierContext.Start();
  VF.Test.Dot.Start();
  VF.Test.Bend.Start();
  VF.Test.Formatter.Start();
  VF.Test.Clef.Start();
  VF.Test.KeySignature.Start();
  VF.Test.TimeSignature.Start();
  VF.Test.StaveTie.Start();
  VF.Test.TabTie.Start();
  VF.Test.Stave.Start();
  VF.Test.TabStave.Start();
  VF.Test.TabSlide.Start();
  VF.Test.Beam.Start();
  VF.Test.Barline.Start();
  VF.Test.AutoBeamFormatting.Start();
  VF.Test.GraceNote.Start();
  VF.Test.Vibrato.Start();
  VF.Test.Annotation.Start();
  VF.Test.Tuning.Start();
  VF.Test.Music.Start();
  VF.Test.KeyManager.Start();
  VF.Test.Articulation.Start();
  VF.Test.StaveConnector.Start();
  VF.Test.Percussion.Start();
  VF.Test.ClefKeySignature.Start();
  VF.Test.StaveHairpin.Start();
  VF.Test.Rhythm.Start();
  VF.Test.Tuplet.Start();
  VF.Test.BoundingBox.Start();
  VF.Test.Strokes.Start();
  VF.Test.StringNumber.Start();
  VF.Test.Rests.Start();
  VF.Test.ThreeVoices.Start();
  VF.Test.Curve.Start();
  VF.Test.TextNote.Start();
  VF.Test.StaveLine.Start();
  VF.Test.Ornament.Start();
  VF.Test.PedalMarking.Start();
  VF.Test.TextBracket.Start();
  VF.Test.StaveModifier.Start();
}

module.exports = VF.Test;
