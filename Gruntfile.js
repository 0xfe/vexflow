var glob = require('glob');
var exec = require('child_process').exec;

var getSourceFiles = function() {
  var base_sources = [
    "src/vex.js",
    "src/flow.js",
    "src/fraction.js",
    "src/tables.js",
    "src/fonts/vexflow_font.js",
    "src/glyph.js",
    "src/stave.js",
    "src/staveconnector.js",
    "src/tabstave.js",
    "src/tickcontext.js",
    "src/tickable.js",
    "src/note.js",
    "src/ghostnote.js",
    "src/notehead.js",
    "src/stem.js",
    "src/stavenote.js",
    "src/tabnote.js",
    "src/beam.js",
    "src/voice.js",
    "src/voicegroup.js",
    "src/modifier.js",
    "src/modifiercontext.js",
    "src/accidental.js",
    "src/dot.js",
    "src/formatter.js",
    "src/stavetie.js",
    "src/tabtie.js",
    "src/tabslide.js",
    "src/bend.js",
    "src/vibrato.js",
    "src/annotation.js",
    "src/articulation.js",
    "src/tuning.js",
    "src/stavemodifier.js",
    "src/keysignature.js",
    "src/timesignature.js",
    "src/clef.js",
    "src/music.js",
    "src/keymanager.js",
    "src/renderer.js",
    "src/raphaelcontext.js",
    "src/stavebarline.js",
    "src/stavehairpin.js",
    "src/stavevolta.js",
    "src/staverepetition.js",
    "src/stavesection.js",
    "src/stavetempo.js",
    "src/barnote.js",
    "src/tremolo.js",
    "src/tuplet.js",
    "src/boundingbox.js",
    "src/textnote.js",
    "src/frethandfinger.js",
    "src/stringnumber.js",
    "src/strokes.js"
  ];
  
  var reject = [
    "src/header.js"
  ];
  
  var vexflow_sources = [];
  
  base_sources.forEach(function(file) {
    vexflow_sources.push(file);
  });
  
  // Catch other missing JS files
  var js_files = glob.sync("src/*.js");
  
  js_files.forEach(function(file) {
    if (base_sources.indexOf(file) == -1 && reject.indexOf(file) == -1) {
      vexflow_sources.push(file);
    }
  });
  
  return vexflow_sources;
};

module.exports = function(grunt) {
  grunt.initConfig({
    BUILD_DIR: "build",
    TARGET_DIR: "<%= BUILD_DIR %>/vexflow",
    TARGET: "<%= TARGET_DIR %>/vexflow-min.js",
    
    BUILD_VERSION: "1.2 Custom",
    BUILD_PREFIX: "0xFE",
    BUILD_DATE: new Date().toISOString(),
    BUILD_COMMIT: "",
    
    uglify: {
      build: {
        options: {
          banner: grunt.file.read("src/header.js", { encoding: "utf-8" })
        },
        
        files: {
          "<%= TARGET %>": getSourceFiles()
        }
      }
    },
    
    copy: {
      build: {
        expand: true,
        src: "tests/**",
        dest: "<%= BUILD_DIR %>"
      }
    },
    
    clean: {
      build: ["<%= BUILD_DIR %>"]
    },
    
    jshint: {
      options: {
        "show-non-errors": true,
        jshintrc: "jshintrc"
      },
      
      src: ["src/*.js"]
    },
    
    qunit: {
      all: ['tests/*.html']
    }
  });
  
  // Load dependency tasks
  for (var key in grunt.file.readJSON("package.json").devDependencies) {
    if (key !== "grunt" && key !== "grunt-cli" && key.indexOf("grunt") === 0) {
      grunt.loadNpmTasks(key);
    }
  }
  
  // Add task to initialize BUILD_COMMIT variable with latest commit ID
  grunt.registerTask("init", function() {
    var done = this.async();
    
    exec(
      "git rev-list --max-count=1 HEAD",
      function(err, stdout, stderr) {
        if (!err) {
          grunt.config(['BUILD_COMMIT'], stdout.trim());
        }
        
        done();
      }
    );
  });
  
  grunt.registerTask("make", ["init", "copy", "uglify"]);
  grunt.registerTask("lint", ["jshint"]);
  grunt.registerTask("test", ["qunit"]);
  
  grunt.registerTask("default", ["make"]);
};
