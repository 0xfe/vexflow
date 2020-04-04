import { Vex } from './vex';
import { BravuraFont } from './fonts/bravura_glyphs';
import { BravuraMetrics } from './fonts/bravura_metrics';
import { GonvilleFont  } from './fonts/gonville_glyphs';
import { GonvilleMetrics } from './fonts/gonville_metrics';

class Font {
  constructor(name, metrics, fontData) {
    this.name = name;
    this.metrics = metrics;
    this.fontData = fontData;
    this.codePoints = {};
  }

  getName() {
    return this.name;
  }

  getResolution() {
    return this.fontData.resolution;
  }

  getMetrics() {
    return this.metrics;
  }

  lookupMetric(key, defaultValue = undefined) {
    const parts = key.split('.');
    let val = this.metrics;
    for (let i = 0; i < parts.length; i++) {
      if (val[parts[i]] === undefined) {
        if (defaultValue !== undefined) {
          return defaultValue;
        } else {
          throw new Vex.RERR('INVALID_KEY', `Invalid music font metric key: ${key}`);
        }
      }
      val = val[parts[i]];
    }

    return val;
  }

  getFontData() {
    return this.fontData;
  }

  getGlyphs() {
    return this.fontData.glyphs;
  }

  getCodePoints() {
    return this.codePoints;
  }

  setCodePoints(codePoints) {
    this.codePoints = codePoints;
    return this;
  }
}

const Fonts = {
  Bravura: new Font('Bravura', BravuraMetrics, BravuraFont),
  Gonville: new Font('Gonville', GonvilleMetrics, GonvilleFont),
};

// Set SMuFL codepoints for Gonville
Fonts.Gonville.setCodePoints({
  // staff brackets and dividers (e000-e00f)
  bracketTop: 'v1b',
  bracketBottom: 'v10',

  // barlines (e030-e03f)
  barlineTick: 'v6f',

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
  articMarcatoAbove: 'va',

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
  dynamicRinforzando: 'vba',
  dynamicSforzando: 'v4a',
  dynamicZ: 'v80',

  // common ornaments (e560-e56f)
  ornamentTrill: 'v1f',
  ornamentTurn: 'v72',
  ornamentTurnSlash: 'v33',
  ornamentMordent: 'v45',
  ornamentMordentInverted: 'v1e',
  ornamentTremblement: 'v86',

  // precomposed trills and mordents (e5b0-e5cf)
  ornamentPrecompAppoggTrill: 'v20',
  ornamentPrecompSlideTrillDAnglebert: 'v60',
  ornamentPrecompSlideTrillBach: 'v29',
  ornamentPrecompTrillSuffixDandrieu: 'v6d',
  ornamentPrecompDoubleCadenceUpperPrefix: 'vb4',
  ornamentPrecompDoubleCadenceUpperPrefixTurn: 'v68',
  ornamentPrecompTrillLowerSuffix: 'v2c',

  // string techniques (e610-e62f)
  stringsDownBow: 'v94',
  stringsUpBow: 'v75',
  stringsHarmonic: 'vb9',

  // plucked techniques (e630-e63f)
  pluckedSnapPizzicatoAbove: 'v94',
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

  // not found:
  // noteheadDiamondWhole: 'v27', stylistic alternate to v46?
  // noteheadDiamondBlack: 'v70', stylistic alternate to v22?
  // noteheadTriangleUpBlack: 'v7d', stylistic alternate to v40?
  // accidentalSlashedDoubleFlat: 'v90',
  // accidentalOneAndAHalfSharpTurned: 'v7a',
  // unused marcato alternative?  'v5a',
  // arpeggioBrushDown: 'v11',
});

const DefaultFont = Fonts.Bravura;

export { Fonts, DefaultFont };
