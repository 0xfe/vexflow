import { loadBravura } from './load_bravura.js';
import { loadCustom } from './load_custom.js';
import { loadGonville } from './load_gonville.js';
import { loadLeland } from './load_leland.js';
import { loadPetaluma } from './load_petaluma.js';
export function loadAllMusicFonts() {
    loadBravura();
    loadGonville();
    loadPetaluma();
    loadCustom();
    loadLeland();
}
