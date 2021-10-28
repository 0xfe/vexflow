// NOT CURRENTLY USED
// Convert an OTF file to a WOFF file.
// Usage: node convert_otf_to_woff.js input.otf output.woff
//
// WARNING WARNING WARNING
// This script is not complete!
// It currently only outputs OTF files. :-(
// opentype.js will need to add support for outputting WOFF/WOFF2.
// Or perhaps we need a different npm package for converting directly from OTF to WOFF/WOFF2.
// Currently, we rely on external services like: https://www.fontsquirrel.com/tools/webfont-generator

const fs = require('fs');
const process = require('process');
const opentype = require('opentype.js');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node convert_otf_to_woff.js input.otf output.woff');
  process.exit(255);
}
const inputOTF = args[0];
const outputWOFF = args[1];

const font = opentype.loadSync(inputOTF);

function inspect(obj) {
  for (const i in obj) {
    const p = obj[i];
    if (typeof p === 'function') {
      console.log(i + '()');
    } else if (Array.isArray(p)) {
      console.log(i + ': array of ' + p.length + ' items.');
    } else if (p === undefined || p === null) {
      console.log(i + ' === ' + p);
    } else if (typeof p === 'object') {
      console.log(i + ': { ' + Object.keys(p).join(', ') + ' }');
    } else {
      console.log(i + ': ' + typeof p + ' == ' + p);
    }
  }
}

// inspect(opentype);
//   BoundingBox
//   Font
//   Glyph
//   Path
//   load(), loadSync(), parse()
// inspect(opentype.BoundingBox.prototype);
// inspect(opentype.Font.prototype);
// inspect(font);
//   supported: boolean == true
//   glyphs: { font, glyphs, length }
//   encoding: { cmap }
//   position: { font, tableName, defaultKerningTables }
//   substitution: { font, tableName }
//   tables: { os2, cmap, head, hhea, maxp, post, name, cff, gpos, gsub }
//   _push === null
//   _hmtxTableData: { ... }
//   outlinesFormat: string == cff
//   unitsPerEm: number == 1000
//   ascender: number == 2012
//   descender: number == -2012
//   numberOfHMetrics: number == 3693
//   numGlyphs: number == 3693
//   glyphNames: { names }
//   names: { copyright, fontFamily, fontSubfamily, uniqueID, fullName, version, postScriptName, trademark, manufacturer, designer, description, manufacturerURL, designerURL, license, licenseURL }
//   gsubrs: array of 2012 items.
//   gsubrsBias: number == 1131
//   defaultWidthX: number == 500
//   nominalWidthX: number == 331
//   subrs: array of 1694 items.
//   subrsBias: number == 1131
//   nGlyphs: number == 3693
//   cffEncoding: { encoding, charset }
//   kerningPairs: {  }
//   hasChar()
//   charToGlyphIndex()
//   charToGlyph()
//   updateFeatures()
//   stringToGlyphs()
//   nameToGlyphIndex()
//   nameToGlyph()
//   glyphIndexToName()
//   getKerningValue()
//   defaultRenderOptions: { kerning, features }
//   forEachGlyph()
//   getPath()
//   getPaths()
//   getAdvanceWidth()
//   draw()
//   drawPoints()
//   drawMetrics()
//   getEnglishName()
//   validate()
//   toTables()
//   toBuffer()
//   toArrayBuffer()
//   download()
//   fsSelectionValues: { ITALIC, UNDERSCORE, NEGATIVE, OUTLINED, STRIKEOUT, BOLD, REGULAR, USER_TYPO_METRICS, WWS, OBLIQUE }
//   usWidthClasses: { ULTRA_CONDENSED, EXTRA_CONDENSED, CONDENSED, SEMI_CONDENSED, MEDIUM, SEMI_EXPANDED, EXPANDED, EXTRA_EXPANDED, ULTRA_EXPANDED }
//   usWeightClasses: { THIN, EXTRA_LIGHT, LIGHT, NORMAL, MEDIUM, SEMI_BOLD, BOLD, EXTRA_BOLD, BLACK }

// TODO: Does not actually output in WOFF format. :-(
fs.writeFileSync(outputWOFF, Buffer.from(font.toArrayBuffer()));
console.log('Writing to file:', outputWOFF);
console.log('WARNING: This script currently outputs in OTF!');
