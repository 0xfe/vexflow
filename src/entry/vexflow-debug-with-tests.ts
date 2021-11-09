// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-debug-with-tests.ts is the entry point for the build output file vexflow-debug-with-tests.js.
// It statically bundles all the music engraving fonts, and also includes the tests from vexflow/tests/.
// flow.html

import { loadTests } from '../../tests/vexflow_test_helpers';

import * as tests from '../../tests/';
import { Vex } from '../';
import { loadMusicFonts } from '../fonts/bundleAll';
import { loadTextFonts } from '../fonts/textfonts';

loadMusicFonts();
loadTextFonts();
loadTests(tests);

export * from '../';
export default Vex;
