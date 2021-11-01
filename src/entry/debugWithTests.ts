import { Vex } from '../vex';

import { setupTestRunner } from '../../tests/run';
import { loadMusicFonts } from '../fonts/bundleAll';
import { loadTextFonts } from '../fonts/textfonts';

loadMusicFonts();
loadTextFonts();
setupTestRunner();

console.log('VexFlow: All Fonts DEBUG + TESTS');

export default Vex;
