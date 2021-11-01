// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

// The _allFonts.ts entry point will be output as `vexflow.js`
// It will statically include all music engraving fonts. See: loadStatic.ts.

import { Vex } from '../vex';

import { loadMusicFonts } from '../fonts/bundleAll';
import { loadTextFonts } from '../fonts/textfonts';

loadMusicFonts();
loadTextFonts();

console.log('VexFlow: All Fonts DEBUG');

export default Vex;
