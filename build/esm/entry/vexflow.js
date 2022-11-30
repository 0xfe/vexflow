import { Flow } from '../src/flow.js';
import { loadAllMusicFonts } from '../src/fonts/load_all.js';
import { loadTextFonts } from '../src/fonts/textfonts.js';
loadAllMusicFonts();
Flow.setMusicFont('Bravura', 'Gonville', 'Custom');
loadTextFonts();
export * from '../src/index.js';
export * as default from '../src/index.js';
