var resolver = require('component-resolver');
var Build = require('component-build');
var minify = require('minify');
var mkdirp = require('mkdirp');
var jshint = require('jshint');
var path = require('path');
var fs = require('fs');
var write = fs.writeFileSync;

TARGET_DIR = path.join(__dirname, 'build', 'vexflow');
mkdirp.sync(TARGET_DIR);
TARGET = path.join(TARGET_DIR, 'vexflow-min.js');
TARGET_RAW = path.join(TARGET_DIR, 'vexflow-debug.js');
TARGET_CSS = path.join(TARGET_DIR, 'vexflow.css');
VERSION = require('./package').version;

var options = {
  install: true,
  development: true,
  out: path.join(__dirname, 'components') // remote dependencies
};

var build;

resolve();

function resolve() {
  // load component.json from the current directory
  resolver(process.cwd(), options, function (err, tree) {
    if (err) throw err;
    build = Build(tree, options);
    buildJs();
    buildCss();
  });
}

function buildJs() {
  build.scripts(function (err, jsContent) {
    if (err) throw err;
    if (!jsContent) return;
    // run jshint
    jshint.JSHINT(jsContent);
    var lintResult = jshint.JSHINT.data();
    var globalsArray = lintResult.globals;
    var errors = lintResult.errors;
    if (errors.length > 0) {
      console.log('errors detected:');
      showLintErrors(errors);
    }
    // build minified version
    write(TARGET, minify.js(jsContent));
    // build for test
    write(TARGET_RAW, jsContent);
    console.log('wrote js');
  });
}

function showLintErrors(errorArray) {
  errorArray.forEach(function(error) {
    if (error) {
      var message = '';
      if (error.line) message += error.line + ': ';
      if (error.reason) message +=  error.reason + ' -> ';
      if (error.evidence) message += error.evidence;
      console.log(message);
    }
  });
}

function buildCss() {
  build.styles(function (err, cssContent) {
    if (err) throw err;
    if (!cssContent) return;
    write(TARGET_CSS, cssContent);
    console.log('wrote css');
  });
}

var arg = process.argv[2];

if (arg === 'watch') {
  var watcher = require('component-watcher')({
    root: process.cwd(), 
    development: true
  });
  watcher.on('resolve', resolve);
  watcher.on('scripts', buildJs);
}

