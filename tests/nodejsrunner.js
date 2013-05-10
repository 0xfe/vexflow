// This is the test runner; execute it with `node tests/nodejsrunner.js`.
// Note that you must run build.sh, scons, or `npm run preinstall` 
// before using this.

var qunit = require('qunit');

qunit.setup({
  log: {
    assertions: false,
    tests: true,
    summary: true,
    globalSummary: true
  }
})

qunit.run({
  code: {path: __dirname + "/../build/vexflow/vexflow-node.js", namespace:"Vex"},
  tests: [__dirname + '/nodejstests.js']
});
