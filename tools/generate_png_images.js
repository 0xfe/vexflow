/*
  Run the full VexFlow test suite, grab the generated images, and
  dump them into a local directory as PNG files.

  This meant to be used with the visual regression test system in
  `tools/visual_regression.sh`.
*/
const { JSDOM } = require('jsdom');
const fs = require('fs');

fs.readFile('node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js', 'utf-8', function(err, polyfillSource) {
  if (err) {
    console.log(err);
  }

  dom = new JSDOM('<!DOCTYPE html></html>', { runScripts: "outside-only" });
  window = dom.window;
  document = window.document;

  window.eval(polyfillSource);

  fs.readFile('build/webComponents-debug.js', 'utf8', function(err, webComponentsSource) { 
    if (err) {
      console.log(err);
    }  
  
    // Evaluate the web components source on the window instead of requiring it 
    // in Node because it contains browser API usage that is not supported in a 
    // Node.js environment. It must be run in an environment that more fully 
    // implements the DOM. 
    window.eval(webComponentsSource);
  
    const [scriptDir, imageDir] = process.argv.slice(2, 4);
  
    const Vex = require(`${ scriptDir }/vexflow-debug.js`);
    Vex.Flow.Test = require(`${ scriptDir }/vexflow-tests.js`);
  
    const VF = Vex.Flow;
  
    // Tell VexFlow that we're outside the browser -- just run
    // the Node tests.
    VF.Test.RUN_CANVAS_TESTS = false;
    VF.Test.RUN_SVG_TESTS = false;
    VF.Test.RUN_RAPHAEL_TESTS = false;
    VF.Test.RUN_NODE_TESTS = true;
    VF.Test.NODE_IMAGEDIR = imageDir;
  
    // Create the image directory if it doesn't exist.
    fs.mkdirSync(VF.Test.NODE_IMAGEDIR, { recursive: true });
  
    // Run all tests.
    VF.Test.run();
  }); 
});
