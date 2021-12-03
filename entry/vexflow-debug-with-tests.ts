// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-debug-with-tests.ts is the entry point for the build output file vexflow-debug-with-tests.js.
// It statically bundles all the music engraving fonts, and also includes the tests from vexflow/tests/.
// The output file is used by flow.html & flow-headless-browser.html to run the tests.

import { Vex } from './vexflow';

export * from '../src/index';
export * from '../tests/index';
export default Vex;
