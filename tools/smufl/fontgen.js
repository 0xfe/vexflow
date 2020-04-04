/*
Convert SMuFL OTF font to vexflow glyph file.

Usage: node fontgen.js Bravura.otf ../../src/fonts/bravura_glyphs.js
*/

const fs = require('fs');
const process = require('process');
// eslint-disable-next-line
const opentype = require('opentype.js');

// Set SMuFL codepoints for Gonville
const codePoints = {
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
  ornamentMordentInverted: 'v1e', // MISSING IN BRAVURA
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
};

function toVFPath(glyph) {
  const pointSize = 72;
  const scale = 72 * 20;
  const bb = glyph.getBoundingBox();
  const path = glyph.getPath(0, 0, pointSize);
  function fix(f, invert = false) {
    return Math.round((f / pointSize) * scale) * (invert ? -1 : 1);
  }

  const ops = path.commands.map((p) => {
    switch (p.type) {
      case 'M': return `m ${fix(p.x)} ${fix(p.y, true)}`;
      case 'L': return `l ${fix(p.x)} ${fix(p.y, true)}`;
      case 'C': // Note Vexflow uses 'b' instead of 'c' to represent bezier curves.
        return `b ${fix(p.x)} ${fix(p.y, true)} ${fix(p.x1)} ${fix(p.y1, true)} ${fix(p.x2)} ${fix(p.y2, true)}`;
      case 'Q': return `q ${fix(p.x)} ${fix(p.y, true)} ${fix(p.x1)} ${fix(p.y1, true)}`;
      case 'Z': return 'z';
      default: throw new Error(`unsupported path type: ${p.type}: ${p}`);
    }
  });

  const pathStr = ops.join(' ');

  return {
    'x_min': bb.x1,
    'x_max': bb.x2,
    'y_min': bb.y1,
    'y_max': bb.y2,
    'ha': bb.y2 - bb.y1,
    'o': pathStr,
  };
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node fontgen.js [fontfile.otf] [outfile.json]');
  console.error('E.g: node fontgen.js bravura-v1.otf bravura.smufl.js');
  process.exit(255);
}

const fontFile = args[0];
const outFile = args[1];

const font = opentype.loadSync(fontFile);
const glyphNamesData = fs.readFileSync('glyphnames.json');
const glyphNames = JSON.parse(glyphNamesData);

const fontData = {};

Object.keys(codePoints).forEach(k => {
  const glyphCode = glyphNames[k];
  if (!glyphCode) {
    console.error('skipping missing glyph:', k);
    return;
  }
  const code = glyphCode.codepoint.substring(2);
  const glyph = font.charToGlyph(String.fromCodePoint(parseInt(code, 16)));
  fontData[k] = toVFPath(glyph);
});

const fileData = {
  glyphs: fontData,
  fontFamily: font.names.fontFamily.en,
  resolution: font.unitsPerEm,
  generatedOn: new Date().toISOString(),
};

const varName = fileData.fontFamily.replace(/\s+/, '_');

fs.writeFileSync(outFile,
  `export const ${varName}Font = ${JSON.stringify(fileData, null, 2)};\n`);
