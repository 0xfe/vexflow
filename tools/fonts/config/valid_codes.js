// Key/Value pairs
//   Key: Canonical glyph names. Almost all of them are SMuFL glyph names.
//        A few of them are unique to VexFlow (see: `vexAccidentalMicrotonal1` and others).
//   Value: Legacy VexFlow glyph codes for retrieving glyph outlines from
//          ../other/gonville.js and ../other/custom.js.
//          The value is `null` if the glyph doesn't exist in gonville.js or custom.js.
//
// Add SMuFL codes here and regenerate the src/fonts/xxxxx_glyphs.ts files when needed.
module.exports = {
  // staff brackets and dividers (e000-e00f)
  bracketTop: 'v1b',
  bracketBottom: 'v10',

  // barlines (e030-e03f)
  barlineTick: 'v6f',
  breathMarkTick: 'v6f',

  // repeats (e040-e04f)
  segno: 'v8c',
  coda: 'v4d',

  // clefs (e050-e07f)
  gClef: 'v83',
  cClef: 'vad',
  fClef: 'v79',
  unpitchedPercussionClef1: 'v59', // same as breveNoteheadHarmonic
  '6stringTabClef': 'v2f',

  // time signatures (e080-e09f)
  timeSig0: 'v0',
  timeSig1: 'v1',
  timeSig2: 'v2',
  timeSig3: 'v3',
  timeSig4: 'v4',
  timeSig5: 'v5',
  timeSig6: 'v6',
  timeSig7: 'v7',
  timeSig8: 'v8',
  timeSig9: 'v9',
  timeSigCommon: 'v41',
  timeSigCutCommon: 'vb6',
  timeSigPlus: 'v7b',
  timeSigPlusSmall: 'v7b',
  timeSigParensRight: 'v84',
  timeSigParensRightSmall: 'v84',
  timeSigParensLeft: 'v9c',
  timeSigParensRightSmall: 'v9c',

  // notehead (e0a0-e0ff)
  noteheadDoubleWhole: 'v53',
  noteheadWhole: 'v1d',
  noteheadHalf: 'v81',
  noteheadBlack: 'vb',
  noteheadXWhole: 'v92',
  noteheadXHalf: 'v95',
  noteheadXBlack: 'v3e',
  noteheadCircleX: 'v3b',
  noteheadTriangleUpWhole: 'v49',
  noteheadTriangleUpHalf: 'v93',
  noteheadTriangleUpBlack: 'v40',
  noteheadDiamondWhole: 'v46',
  noteheadDiamondHalf: 'v2d',
  noteheadDiamondBlack: 'v22',
  noteheadSquareWhite: 'vd3',
  noteheadSquareBlack: 'vd2',
  // noteshapeSquareWhite: 'vd5', // rectangular note head (not found in bravura)
  // noteshapeSquareBlack: 'vd4', // rectangular note head (not found in bravura)

  // individual notes (e1d0-e1ef)
  augmentationDot: 'v23',

  // temolos (e220-e23f)
  tremolo1: 'v74',

  // flags (e240-e25f)
  flag8thUp: 'v54',
  flag8thDown: 'v9a',
  flag16thUp: 'v3f',
  flag16thDown: 'v8f',
  flag32ndUp: 'v47',
  flag32ndDown: 'v2a',
  flag64thUp: 'va9',
  flag64thDown: 'v58',
  flag128thUp: 'v9b',
  flag128thDown: 'v30',

  // standard accidentals (e260-e26f)
  accidentalFlat: 'v44',
  accidentalNatural: 'v4e',
  accidentalSharp: 'v18',
  accidentalDoubleSharp: 'v7f',
  accidentalDoubleFlat: 'v26',
  accidentalParensLeft: 'v9c',
  accidentalParensRight: 'v84',

  // stein-zimmermann accidentals (24-edo) (e280-e28f)
  accidentalQuarterToneFlatStein: 'vab',
  accidentalThreeQuarterTonesFlatZimmermann: 'v9e',
  accidentalQuarterToneSharpStein: 'v78',
  accidentalThreeQuarterTonesSharpStein: 'v51',

  // arel-ezgi-uzdilek accidentals (e440-e44f)
  accidentalBuyukMucennebFlat: 'v39',
  accidentalBakiyeFlat: 'vb7',
  accidentalKomaSharp: 'v51', // same as accidentalQuarterToneSharpStein
  accidentalKucukMucennebSharp: 'v8d',

  // persian accidentals (e460-e46f)
  accidentalKoron: 'vd1',
  accidentalSori: 'vd0',

  // articulation (e4a0-e4bf)
  articAccentAbove: 'v42',
  articAccentBelow: 'v42', // same as above
  articTenutoAbove: 'v25',
  articTenutoBelow: 'v25', // same as above
  articStaccatoAbove: 'v23', // = dot
  articStaccatoBelow: 'v23', // = dot
  articStaccatissimoAbove: 'v28',
  articStaccatissimoBelow: 'v28',
  articMarcatoAbove: 'va',
  articMarcatoBelow: 'va',

  // holds and pauses (e4c0-e4df)
  fermataAbove: 'v43',
  fermataBelow: 'v5b',
  breathMarkComma: 'v6c',
  breathMarkUpbow: 'v8a', // looks better than current upbow
  caesura: 'v34',
  caesuraCurved: 'v4b',

  // rests (e4e0-e4ff)
  restMaxima: 'v59', // not designed for this, but should do the trick
  // need restLonga -- used in multimeasure rests, like above
  restDoubleWhole: 'v31',
  restWhole: 'v5c',
  restHalf: 'vc',
  restQuarter: 'v7c',
  rest8th: 'va5',
  rest16th: 'v3c',
  rest32nd: 'v55',
  rest64th: 'v38',
  rest128th: 'vaa',

  // dynamics (e520-e54f)
  dynamicPiano: 'vbf',
  dynamicMezzo: 'v62',
  dynamicForte: 'vba',
  dynamicRinforzando: 'vb1',
  dynamicSforzando: 'v4a',
  dynamicZ: 'v80',

  // common ornaments (e560-e56f)
  ornamentTrill: 'v1f',
  ornamentTurn: 'v72',
  ornamentTurnSlash: 'v33',
  ornamentMordent: 'v45',
  ornamentShortTrill: 'v1e', // ornamentMordentInverted MISSING IN BRAVURA
  ornamentTremblement: 'v86',

  // precomposed trills and mordents (e5b0-e5cf)
  ornamentPrecompAppoggTrill: 'v20',
  ornamentPrecompSlideTrillDAnglebert: 'v60',
  ornamentPrecompSlideTrillBach: 'v29',
  ornamentPrecompTrillSuffixDandrieu: 'v6d',
  ornamentPrecompDoubleCadenceUpperPrefix: 'vb4',
  ornamentPrecompDoubleCadenceUpperPrefixTurn: 'v68',
  ornamentPrecompTrillLowerSuffix: 'v2c',

  // brass techniques  (e5d0–e5ef)
  brassScoop: 'vxx',
  brassDoitMedium: 'vxx',
  brassFallLipShort: 'vxx',
  brassLiftMedium: 'vxx',
  brassFallRoughMedium: 'vxx',
  brassBend: 'vxx',
  brassMuteClosed: 'vxx',
  brassMuteOpen: 'vxx',
  brassFlip: 'vxx',
  brassJazzTurn: 'vxx',
  brassSmear: 'vxx',

  // string techniques (e610-e62f)
  stringsDownBow: 'v94',
  stringsUpBow: 'v75',
  stringsHarmonic: 'vb9',

  // plucked techniques (e630-e63f)
  pluckedSnapPizzicatoAbove: 'v94',
  pluckedSnapPizzicatoBelow: 'v94',
  pluckedLeftHandPizzicato: 'v8b', // plus sign

  // keyboard techniques (e650-e67f)
  keyboardPedalPed: 'v36',
  keyboardPedalUp: 'v5d',

  // percussion playing technique pictograms (e7f0-e80f)
  pictChokeCymbal: 'vb3',

  // multi-segment lines (eaa0-eb0f)
  wiggleArpeggiatoUp: 'va3', // rotated 90deg from reference implementation

  // arrows and arrowheads (eb60-eb8f)
  arrowheadBlackUp: 'vc3',
  arrowheadBlackDown: 'v52',
  arpeggiatoUp: null, // stroke
  arpeggiatoDown: null, // stroke

  // Bar repeats
  repeat1Bar: null,
  repeat2Bars: null,
  repeat4Bars: null,
  repeatBarSlash: null,

  // chord symbol glyphs from smufl fonts (e870-e87c)
  csymDiminished: null,
  csymHalfDiminished: null,
  csymAugmented: null,
  csymMajorSeventh: null,
  csymMinor: null,
  csymParensLeftTall: null,
  csymParensRightTall: null,
  csymBracketLeftTall: null,
  csymBracketRightTall: null,
  csymParensLeftVeryTall: null,
  csymParensRightVeryTall: null,
  csymDiagonalArrangementSlash: null,

  // No SMuFL glyphs for the following:
  vexAccidentalMicrotonal1: 'v90',
  vexAccidentalMicrotonal2: 'v7a',
  vexAccidentalMicrotonal3: 'vd6',
  vexAccidentalMicrotonal4: 'vd7',
  vexWiggleArpeggioUp: 'va3',
  vexNoteHeadMutedBreve: 'vf',
  vexNoteHeadRectBlack: 'vd4',
  vexNoteHeadRectWhite: 'vd5',

  // Spartan Sagittal single-shaft accidentals (U+E300–U+E30F)
  accSagittal5v7KleismaUp: null,
  accSagittal5v7KleismaDown: null,
  accSagittal5CommaUp: null,
  accSagittal5CommaDown: null,
  accSagittal7CommaUp: null,
  accSagittal7CommaDown: null,
  accSagittal25SmallDiesisUp: null,
  accSagittal25SmallDiesisDown: null,
  accSagittal35MediumDiesisUp: null,
  accSagittal35MediumDiesisDown: null,
  accSagittal11MediumDiesisUp: null,
  accSagittal11MediumDiesisDown: null,
  accSagittal11LargeDiesisUp: null,
  accSagittal11LargeDiesisDown: null,
  accSagittal35LargeDiesisUp: null,
  accSagittal35LargeDiesisDown: null,

  // Spartan Sagittal multi-shaft accidentals (U+E310–U+E33F)
  accSagittalSharp25SDown: null,
  accSagittalFlat25SUp: null,
  accSagittalSharp7CDown: null,
  accSagittalFlat7CUp: null,
  accSagittalSharp5CDown: null,
  accSagittalFlat5CUp: null,
  accSagittalSharp5v7kDown: null,
  accSagittalFlat5v7kUp: null,
  accSagittalSharp: null,
  accSagittalFlat: null,
  accSagittalSharp5v7kUp: null,
  accSagittalFlat5v7kDown: null,
  accSagittalSharp5CUp: null,
  accSagittalFlat5CDown: null,
  accSagittalSharp7CUp: null,
  accSagittalFlat7CDown: null,
  accSagittalSharp25SUp: null,
  accSagittalFlat25SDown: null,
  accSagittalSharp35MUp: null,
  accSagittalFlat35MDown: null,
  accSagittalSharp11MUp: null,
  accSagittalFlat11MDown: null,
  accSagittalSharp11LUp: null,
  accSagittalFlat11LDown: null,
  accSagittalSharp35LUp: null,
  accSagittalFlat35LDown: null,
  accSagittalDoubleSharp25SDown: null,
  accSagittalDoubleFlat25SUp: null,
  accSagittalDoubleSharp7CDown: null,
  accSagittalDoubleFlat7CUp: null,
  accSagittalDoubleSharp5CDown: null,
  accSagittalDoubleFlat5CUp: null,
  accSagittalDoubleSharp5v7kDown: null,
  accSagittalDoubleFlat5v7kUp: null,
  accSagittalDoubleSharp: null,
  accSagittalDoubleFlat: null,

  // Athenian Sagittal extension (Medium precision) accidentals (U+E340–U+E36F)
  accSagittal7v11KleismaUp: null,
  accSagittal7v11KleismaDown: null,
  accSagittal17CommaUp: null,
  accSagittal17CommaDown: null,
  accSagittal55CommaUp: null,
  accSagittal55CommaDown: null,
  accSagittal7v11CommaUp: null,
  accSagittal7v11CommaDown: null,
  accSagittal5v11SmallDiesisUp: null,
  accSagittal5v11SmallDiesisDown: null,
  accSagittalSharp5v11SDown: null,
  accSagittalFlat5v11SUp: null,
  accSagittalSharp7v11CDown: null,
  accSagittalFlat7v11CUp: null,
  accSagittalSharp55CDown: null,
  accSagittalFlat55CUp: null,
  accSagittalSharp17CDown: null,
  accSagittalFlat17CUp: null,
  accSagittalSharp7v11kDown: null,
  accSagittalFlat7v11kUp: null,
  accSagittalSharp7v11kUp: null,
  accSagittalFlat7v11kDown: null,
  accSagittalSharp17CUp: null,
  accSagittalFlat17CDown: null,
  accSagittalSharp55CUp: null,
  accSagittalFlat55CDown: null,
  accSagittalSharp7v11CUp: null,
  accSagittalFlat7v11CDown: null,
  accSagittalSharp5v11SUp: null,
  accSagittalFlat5v11SDown: null,
  accSagittalDoubleSharp5v11SDown: null,
  accSagittalDoubleFlat5v11SUp: null,
  accSagittalDoubleSharp7v11CDown: null,
  accSagittalDoubleFlat7v11CUp: null,
  accSagittalDoubleSharp55CDown: null,
  accSagittalDoubleFlat55CUp: null,
  accSagittalDoubleSharp17CDown: null,
  accSagittalDoubleFlat17CUp: null,
  accSagittalDoubleSharp7v11kDown: null,
  accSagittalDoubleFlat7v11kUp: null,

  // Trojan Sagittal extension (12-EDO relative) accidentals (U+E370–U+E38F)
  accSagittal23CommaUp: null,
  accSagittal23CommaDown: null,
  accSagittal5v19CommaUp: null,
  accSagittal5v19CommaDown: null,
  accSagittal5v23SmallDiesisUp: null,
  accSagittal5v23SmallDiesisDown: null,
  accSagittalSharp5v23SDown: null,
  accSagittalFlat5v23SUp: null,
  accSagittalSharp5v19CDown: null,
  accSagittalFlat5v19CUp: null,
  accSagittalSharp23CDown: null,
  accSagittalFlat23CUp: null,
  accSagittalSharp23CUp: null,
  accSagittalFlat23CDown: null,
  accSagittalSharp5v19CUp: null,
  accSagittalFlat5v19CDown: null,
  accSagittalSharp5v23SUp: null,
  accSagittalFlat5v23SDown: null,
  accSagittalDoubleSharp5v23SDown: null,
  accSagittalDoubleFlat5v23SUp: null,
  accSagittalDoubleSharp5v19CDown: null,
  accSagittalDoubleFlat5v19CUp: null,
  accSagittalDoubleSharp23CDown: null,
  accSagittalDoubleFlat23CUp: null,

  // Promethean Sagittal extension (High precision) single-shaft accidentals (U+E390–U+E3AF)
  accSagittal19SchismaUp: null,
  accSagittal19SchismaDown: null,
  accSagittal17KleismaUp: null,
  accSagittal17KleismaDown: null,
  accSagittal143CommaUp: null,
  accSagittal143CommaDown: null,
  accSagittal11v49CommaUp: null,
  accSagittal11v49CommaDown: null,
  accSagittal19CommaUp: null,
  accSagittal19CommaDown: null,
  accSagittal7v19CommaUp: null,
  accSagittal7v19CommaDown: null,
  accSagittal49SmallDiesisUp: null,
  accSagittal49SmallDiesisDown: null,
  accSagittal23SmallDiesisUp: null,
  accSagittal23SmallDiesisDown: null,
  accSagittal5v13MediumDiesisUp: null,
  accSagittal5v13MediumDiesisDown: null,
  accSagittal11v19MediumDiesisUp: null,
  accSagittal11v19MediumDiesisDown: null,
  accSagittal49MediumDiesisUp: null,
  accSagittal49MediumDiesisDown: null,
  accSagittal5v49MediumDiesisUp: null,
  accSagittal5v49MediumDiesisDown: null,
  accSagittal49LargeDiesisUp: null,
  accSagittal49LargeDiesisDown: null,
  accSagittal11v19LargeDiesisUp: null,
  accSagittal11v19LargeDiesisDown: null,
  accSagittal5v13LargeDiesisUp: null,
  accSagittal5v13LargeDiesisDown: null,

  // Promethean Sagittal extension (High precision) multi-shaft accidentals (U+E3B0–U+E3EF)
  accSagittalSharp23SDown: null,
  accSagittalFlat23SUp: null,
  accSagittalSharp49SDown: null,
  accSagittalFlat49SUp: null,
  accSagittalSharp7v19CDown: null,
  accSagittalFlat7v19CUp: null,
  accSagittalSharp19CDown: null,
  accSagittalFlat19CUp: null,
  accSagittalSharp11v49CDown: null,
  accSagittalFlat11v49CUp: null,
  accSagittalSharp143CDown: null,
  accSagittalFlat143CUp: null,
  accSagittalSharp17kDown: null,
  accSagittalFlat17kUp: null,
  accSagittalSharp19sDown: null,
  accSagittalFlat19sUp: null,
  accSagittalSharp19sUp: null,
  accSagittalFlat19sDown: null,
  accSagittalSharp17kUp: null,
  accSagittalFlat17kDown: null,
  accSagittalSharp143CUp: null,
  accSagittalFlat143CDown: null,
  accSagittalSharp11v49CUp: null,
  accSagittalFlat11v49CDown: null,
  accSagittalSharp19CUp: null,
  accSagittalFlat19CDown: null,
  accSagittalSharp7v19CUp: null,
  accSagittalFlat7v19CDown: null,
  accSagittalSharp49SUp: null,
  accSagittalFlat49SDown: null,
  accSagittalSharp23SUp: null,
  accSagittalFlat23SDown: null,
  accSagittalSharp5v13MUp: null,
  accSagittalFlat5v13MDown: null,
  accSagittalSharp11v19MUp: null,
  accSagittalFlat11v19MDown: null,
  accSagittalSharp49MUp: null,
  accSagittalFlat49MDown: null,
  accSagittalSharp5v49MUp: null,
  accSagittalFlat5v49MDown: null,
  accSagittalSharp49LUp: null,
  accSagittalFlat49LDown: null,
  accSagittalSharp11v19LUp: null,
  accSagittalFlat11v19LDown: null,
  accSagittalSharp5v13LUp: null,
  accSagittalFlat5v13LDown: null,
  accSagittalDoubleSharp23SDown: null,
  accSagittalDoubleFlat23SUp: null,
  accSagittalDoubleSharp49SDown: null,
  accSagittalDoubleFlat49SUp: null,
  accSagittalDoubleSharp7v19CDown: null,
  accSagittalDoubleFlat7v19CUp: null,
  accSagittalDoubleSharp19CDown: null,
  accSagittalDoubleFlat19CUp: null,
  accSagittalDoubleSharp11v49CDown: null,
  accSagittalDoubleFlat11v49CUp: null,
  accSagittalDoubleSharp143CDown: null,
  accSagittalDoubleFlat143CUp: null,
  accSagittalDoubleSharp17kDown: null,
  accSagittalDoubleFlat17kUp: null,
  accSagittalDoubleSharp19sDown: null,
  accSagittalDoubleFlat19sUp: null,

  // Herculean Sagittal extension (Ultra precision) accidental diacritics (U+E3F0–U+E3F3)
  accSagittalShaftUp: null,
  accSagittalShaftDown: null,
  accSagittalAcute: null,
  accSagittalGrave: null,

  // Olympian Sagittal extension (Extreme precision) accidental diacritics (U+E3F4–U+E3F7)
  accSagittal1MinaUp: null,
  accSagittal1MinaDown: null,
  accSagittal2MinasUp: null,
  accSagittal2MinasDown: null,

  // Magrathean Sagittal extension (Insane precision) accidental diacritics (U+E3F8–U+E41F)
  accSagittal1TinaUp: null,
  accSagittal1TinaDown: null,
  accSagittal2TinasUp: null,
  accSagittal2TinasDown: null,
  accSagittal3TinasUp: null,
  accSagittal3TinasDown: null,
  accSagittal4TinasUp: null,
  accSagittal4TinasDown: null,
  accSagittal5TinasUp: null,
  accSagittal5TinasDown: null,
  accSagittal6TinasUp: null,
  accSagittal6TinasDown: null,
  accSagittal7TinasUp: null,
  accSagittal7TinasDown: null,
  accSagittal8TinasUp: null,
  accSagittal8TinasDown: null,
  accSagittal9TinasUp: null,
  accSagittal9TinasDown: null,
  accSagittalFractionalTinaUp: null,
  accSagittalFractionalTinaDown: null,

  // Unconventional Sagittal-compatible accidentals
  accidentalNarrowReversedFlat: null,
  accidentalNarrowReversedFlatAndFlat: null,
  accidentalWilsonPlus: null,
  accidentalWilsonMinus: null,
};
