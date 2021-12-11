// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// @author Ron B. Yeh
//
// Support Dynamic Importing of Music Engraving Fonts
//
// vexflow-core.ts is the entry point for output file vexflow-core.js.
// It will not load any music fonts by default.
// It also overrides the `Flow.setMusicFont(...)` function to be async,
// loading music fonts (e.g., Bravura, Petaluma, Gonville) on the fly.

// Do not preload / bundle any fonts.
// All music fonts will be loaded dynamically:
// `Flow.fetchMusicFont(fontName)`

import { Vex } from '../src/vex';

import { Flow } from '../src/flow';
import { Font } from '../src/font';
import { loadTextFonts } from '../src/fonts/textfonts';
import { globalObject, RuntimeError } from '../src/util';

// Here we add an import for `webpack_publicpath.ts` to CJS builds that need dynamic font loading (e.g., vexflow-core.js).
// In ESM, import('./bravura.js') works natively, so the webpack specific code is NOT needed.
// Search for `webpack_publicpath` in Gruntfile.js.
// DO NOT DELETE THE LINE BELOW :-D
/* IMPORT_  XXX  WEBPACK_PUBLICPATH_HERE */
// DO NOT DELETE THE LINE ABOVE :-D

const fontModules: Record<string, string> = {
  Bravura: './vexflow-font-bravura.js',
  Gonville: './vexflow-font-gonville.js',
  Petaluma: './vexflow-font-petaluma.js',
  Custom: './vexflow-font-custom.js',
};

// eslint-disable-next-line
export type FontModule = { data: any; metrics: any };

Flow.fetchMusicFont = async (fontName: string, fontModuleOrPath?: string | FontModule): Promise<void> => {
  const font = Font.load(fontName);
  // Check if the font data has already been loaded before.
  if (font.hasData()) {
    return;
  }

  if (fontName in fontModules) {
    fontModuleOrPath = fontModules[fontName];
  }

  if (!fontModuleOrPath) {
    throw new RuntimeError('UnknownFont', `Music font ${fontName} does not exist at path [${fontModuleOrPath}].`);
  }

  let fontModule: FontModule;
  if (typeof fontModuleOrPath === 'string') {
    const module = await import(/* webpackIgnore: true */ fontModuleOrPath);

    const g = globalObject();
    const moduleCJS = g['VexFlowFont_' + fontName];
    if (typeof moduleCJS !== 'undefined') {
      // CJS builds will set a VexFlowFont_Bravura | VexFlowFont_Gonville | etc variable.
      fontModule = moduleCJS;
    } else {
      // ESM
      fontModule = module.Font;
    }
  } else {
    fontModule = fontModuleOrPath;
  }
  font.setData(fontModule.data);
  font.setMetrics(fontModule.metrics);
};

// Load the two text fonts that ChordSymbol & Annotation use.
loadTextFonts();

export * from '../src/index';
export default Vex;
