// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-debug.ts is the entry point for the build output file vexflow-debug.js.
// It statically bundles all the music engraving fonts.

// Currently, it just imports vexflow.ts, but the webpack config inside Gruntfile.js
// sets the webpack mode to 'development' to produce an unminified build.

// In the future, we could do something different with this entry file, such as turn on flags for logging.

import { Vex } from './vexflow';

export * from '../src/index';
export default Vex;
