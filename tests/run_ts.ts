import { MusicTests } from './music_tests';

declare let VF: any;

export const run = function (options?: any): void {
  if (options) {
    VF.Test.RUN_CANVAS_TESTS = options.RUN_CANVAS_TESTS;
    VF.Test.RUN_SVG_TESTS = options.RUN_SVG_TESTS;
    VF.Test.RUN_RAPHAEL_TESTS = options.RUN_RAPHAEL_TESTS;
    VF.Test.RUN_NODE_TESTS = options.RUN_NODE_TESTS;
    VF.Test.NODE_IMAGEDIR = options.NODE_IMAGEDIR;
    VF.Test.fs = options.fs;
  }
  MusicTests.Start();
};

const Vexflow = {
  Test: {
    run,
  },
};

export default Vexflow;
