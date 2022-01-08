// global module, __dirname, process, require
/*
This Gruntfile supports these commands:  

grunt
  - build the complete set of VexFlow libraries for production and debug use.



  
This Gruntfile supports these optional environment variables:
  VEX_DEBUG_CIRCULAR_DEPENDENCIES
      if true, we display a list of circular dependencies in the code.
  VEX_DEVTOOL
      specify webpack's devtool config (e.g., 'source-map' to create source maps).
      https://webpack.js.org/configuration/devtool/
  VEX_GENERATE_OPTIONS
      options for controlling the ./tools/generate_images.js script.
      see the 'generate:current' and 'generate:reference' tasks.

  To pass in environment variables, you can use your ~/.bash_profile or do something like:
    export VEX_DEBUG_CIRCULAR_DEPENDENCIES=true
    export VEX_DEVTOOL=eval
    grunt
  You can also do it all on one line:
    VEX_DEBUG_CIRCULAR_DEPENDENCIES=true VEX_DEVTOOL=eval grunt
*/

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const { EventEmitter } = require('events');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const DEBUG_CIRCULAR_DEPENDENCIES =
  process.env.VEX_DEBUG_CIRCULAR_DEPENDENCIES === 'true' || process.env.VEX_DEBUG_CIRCULAR_DEPENDENCIES === '1';

// A module entry file `entry/xxxx.ts` will be mapped to a build output file `build/xxxx.js`.
// Also see the package.json `exports` field, which is one way for projects to specify which entry file to import.
const VEX = 'vexflow';
const VEX_BRAVURA = 'vexflow-bravura';
const VEX_GONVILLE = 'vexflow-gonville';
const VEX_PETALUMA = 'vexflow-petaluma';
const VEX_CORE = 'vexflow-core'; // Supports dynamic import of the font modules below.
const VEX_FONT_BRAVURA = 'vexflow-font-bravura';
const VEX_FONT_GONVILLE = 'vexflow-font-gonville';
const VEX_FONT_PETALUMA = 'vexflow-font-petaluma';
const VEX_FONT_CUSTOM = 'vexflow-font-custom';

const VEX_DEBUG = 'vexflow-debug';
const VEX_DEBUG_TESTS = 'vexflow-debug-with-tests';

// Output directories.
const BASE_DIR = __dirname;
const BUILD_DIR = path.join(BASE_DIR, 'build');
const BUILD_CJS_DIR = path.join(BUILD_DIR, 'cjs');
const BUILD_ESM_DIR = path.join(BUILD_DIR, 'esm');
const BUILD_IMAGES_REFERENCE_DIR = path.join(BUILD_DIR, 'images', 'reference');
const REFERENCE_DIR = path.join(BASE_DIR, 'reference');
const REFERENCE_IMAGES_DIR = path.join(REFERENCE_DIR, 'images');

// PRODUCTION_MODE will enable minification, etc.
// See: https://webpack.js.org/configuration/mode/
const PRODUCTION_MODE = 'production';
// FOR DEBUGGING PURPOSES, you can temporarily comment out the line above and use the line below to disable minification.
// const PRODUCTION_MODE = 'development';
const DEVELOPMENT_MODE = 'development';

function generateVersionFile() {
  // Generate version information when we run a build.
  // Save the information in src/version.ts.
  const VER = require('./tools/generate_version_file');
  return {
    BUILD_VERSION: VER.VERSION,
    BUILD_ID: VER.ID,
    BUILD_DATE: VER.DATE,
  };
}

function runCommand(command, ...args) {
  // The stdio option passes the output from the spawned process back to this process's console.
  spawnSync(command, args, { stdio: 'inherit' });
}

function webpackConfigs() {
  // entryFiles is an array of file names.
  function config(entryFiles, mode, addBanner, libraryName, customPlugin) {
    return () => {
      let entry;
      if (Array.isArray(entryFiles)) {
        entry = {};
        for (const fileName of entryFiles) {
          // The entry point is a full path to a typescript file in vexflow/entry/.
          entry[fileName] = path.join(BASE_DIR, 'entry/', fileName + '.ts');
        }
      } else {
        const fileName = entryFiles;
        entry = path.join(BASE_DIR, 'entry/', fileName + '.ts');
      }

      // Support different ways of loading VexFlow.
      // The `globalObject` string is assigned to `root` in line 15 of vexflow-debug.js.
      // VexFlow is exported as root["Vex"], and can be accessed via:
      //   - `window.Vex` in browsers
      //   - `globalThis.Vex` in node JS >= 12
      //   - `this.Vex` in all other environments
      // See: https://webpack.js.org/configuration/output/#outputglobalobject
      //
      // IMPORTANT: The outer parentheses are required! Webpack inserts this string into the final output, and
      // without the parentheses, code splitting will be broken. Search for `webpackChunkVex` inside the output files.
      let globalObject = `(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this)`;

      // Control the type of source maps that will be produced.
      // See: https://webpack.js.org/configuration/devtool/
      // In version 3.0.9 this was called VEX_GENMAP.
      const devtool = process.env.VEX_DEVTOOL || false; // false == no source map
      // const devtool = 'source-map';

      let plugins = [];

      // Add a banner at the top of the file.
      const { BUILD_VERSION, BUILD_ID, BUILD_DATE } = generateVersionFile();
      if (addBanner) {
        const banner =
          `VexFlow ${BUILD_VERSION}   ${BUILD_DATE}   ${BUILD_ID}\n` +
          `Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>\n` +
          `https://www.vexflow.com   https://github.com/0xfe/vexflow`;
        plugins.push(new webpack.BannerPlugin(banner));
      }

      if (DEBUG_CIRCULAR_DEPENDENCIES) {
        const CircularDependencyPlugin = require('circular-dependency-plugin');
        plugins.push(
          new CircularDependencyPlugin({
            cwd: process.cwd(),
          })
        );
      }

      if (customPlugin) {
        plugins.push(customPlugin);
      }

      return {
        mode,
        entry,
        output: {
          path: BUILD_CJS_DIR,
          filename: '[name].js', // output file names are based on the keys of the entry object above.
          library: {
            name: libraryName,
            type: 'umd',
            export: 'default',
          },
          globalObject,
        },
        resolve: {
          extensions: ['.ts', '.tsx', '.js', '...'],
        },
        devtool,
        module: {
          rules: [
            {
              test: /(\.ts$|\.js$)/,
              exclude: /node_modules/,
              resolve: {
                fullySpecified: false,
              },
              use: [
                {
                  loader: 'ts-loader',
                  options: { configFile: 'tsconfig.json' },
                },
              ],
            },
          ],
        },
        plugins,
        optimization: {
          minimizer: [
            // DO NOT extract the banner into a separate file.
            new TerserPlugin({ extractComments: false }),
          ],
        },
      };
    };
  }

  class FixFontModulesPlugin {
    apply(compiler) {
      compiler.hooks.done.tap('String Replace', (stats) => {
        const xxx = {
          Bravura: path.join(BUILD_DIR, 'cjs', 'vexflow-font-bravura.js'),
          Petaluma: path.join(BUILD_DIR, 'cjs', 'vexflow-font-petaluma.js'),
          Gonville: path.join(BUILD_DIR, 'cjs', 'vexflow-font-gonville.js'),
          Custom: path.join(BUILD_DIR, 'cjs', 'vexflow-font-custom.js'),
        };
        // RENAME THE FILES
      });
    }
  }

  return {
    // The first three are multi entry configurations, which build multiple targets at once.
    allProdLibs: config([VEX, VEX_BRAVURA, VEX_GONVILLE, VEX_PETALUMA, VEX_CORE], PRODUCTION_MODE, true, 'Vex'),
    allDebugLibs: config([VEX_DEBUG, VEX_DEBUG_TESTS], DEVELOPMENT_MODE, true, 'Vex'),
    allFontLibs: config(
      [VEX_FONT_BRAVURA, VEX_FONT_PETALUMA, VEX_FONT_GONVILLE, VEX_FONT_CUSTOM],
      PRODUCTION_MODE,
      false,
      ['VexFlowFont', '__FONT_NAME__'],
      new FixFontModulesPlugin(),
      true /* turn off the source maps */
    ),
    // Individual build targets for production VexFlow libraries.
    prodAllFonts: config([VEX], PRODUCTION_MODE, true, 'Vex'),
    prodBravuraOnly: config([VEX_BRAVURA], PRODUCTION_MODE, true, 'Vex'),
    prodGonvilleOnly: config([VEX_GONVILLE], PRODUCTION_MODE, true, 'Vex'),
    prodPetalumaOnly: config([VEX_PETALUMA], PRODUCTION_MODE, true, 'Vex'),
    prodNoFonts: config([VEX_CORE], PRODUCTION_MODE, true, 'Vex'),
    // Individual build targets for production VexFlow font modules (for dynamic loading).
    // Pass in `false` to disable the MIT license banner for font module files.
    prodFontBravura: config([VEX_FONT_BRAVURA], PRODUCTION_MODE, false, ['VexFlowFont', 'Bravura']),
    prodFontPetaluma: config([VEX_FONT_PETALUMA], PRODUCTION_MODE, false, ['VexFlowFont', 'Petaluma']),
    prodFontGonville: config([VEX_FONT_GONVILLE], PRODUCTION_MODE, false, ['VexFlowFont', 'Gonville']),
    prodFontCustom: config([VEX_FONT_CUSTOM], PRODUCTION_MODE, false, ['VexFlowFont', 'Custom']),
    // Individual build targets for development / debugging.
    // The DEVELOPMENT_MODE flag disables code minification.
    debug: config([VEX_DEBUG], DEVELOPMENT_MODE, true, 'Vex'),
    debugWithTests: config([VEX_DEBUG_TESTS], DEVELOPMENT_MODE, true, 'Vex'),
  };
}

module.exports = (grunt) => {
  const log = grunt.log.writeln;

  function runTask(taskName) {
    grunt.task.run(taskName);
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    webpack: webpackConfigs(),
    concurrent: {
      options: {
        logConcurrentOutput: true,
        indent: true,
      },
      all: ['webpack:allProdLibs', 'webpack:allFontLibs', 'webpack:allDebugLibs', 'build:esm'],
      debug: ['webpack:allDebugLibs', 'build:esm'],
      production: ['webpack:allProdLibs', 'webpack:allFontLibs', 'build:esm'],
      cjs: ['webpack:allProdLibs', 'webpack:allFontLibs', 'webpack:allDebugLibs'],
      types: ['build:types', 'typedoc'],
    },
    // grunt eslint
    eslint: {
      target: ['./src', './tests'],
      options: { fix: true, cache: true },
    },
    qunit: {
      files: ['tests/flow-headless-browser.html'],
    },
    open: {
      flow_html: {
        path: './tests/flow.html',
      },
      flow_localhost: {
        path: 'http://127.0.0.1:8080/tests/flow.html?esm=true',
      },
    },
    copy: {
      // grunt copy:reference
      reference: {
        files: [
          {
            expand: true,
            cwd: BUILD_DIR,
            src: ['**'],
            dest: REFERENCE_DIR,
          },
        ],
      },
      // grunt copy:save_reference_images
      // build/images/reference/ => reference/images/
      save_reference_images: {
        files: [
          {
            expand: true,
            cwd: BUILD_IMAGES_REFERENCE_DIR,
            src: ['**'],
            dest: REFERENCE_IMAGES_DIR,
          },
        ],
      },
      // grunt copy:restore_reference_images
      // reference/images/ => build/images/reference/
      restore_reference_images: {
        files: [
          {
            expand: true,
            cwd: REFERENCE_IMAGES_DIR,
            src: ['**'],
            dest: BUILD_IMAGES_REFERENCE_DIR,
          },
        ],
      },
    },
    typedoc: {
      build: {
        options: {
          out: 'docs/api',
          name: 'vexflow',
          excludeProtected: true,
          excludePrivate: true,
          disableSources: true,
        },
        src: ['./src/index.ts'],
      },
    },
    clean: {
      build: { src: [BUILD_DIR] },
      reference: { src: [REFERENCE_DIR] },
      reference_images: { src: [REFERENCE_IMAGES_DIR] },
    },
  });

  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-typedoc');
  grunt.loadNpmTasks('grunt-webpack');

  // This task is run when you type one of the following commands:
  //   grunt
  //   npm start
  // Builds all targets for production and debugging.
  grunt.registerTask('default', 'Build all VexFlow targets.', [
    'clean:build',
    'eslint',
    'concurrent:all',
    'concurrent:types',
  ]);

  // `grunt test`
  // Run command line qunit tests.
  grunt.registerTask('test', 'Run command line unit tests.', [
    //
    'clean:build',
    'eslint',
    'concurrent:all',
    'qunit',
  ]);

  // grunt build:cjs
  grunt.registerTask('build:cjs', 'Use webpack to create CJS files in build/cjs/', [
    //
    'clean:build',
    'concurrent:cjs',
  ]);

  // grunt build:esm
  // Output individual ES module files to build/esm/.
  // Also fixes the imports and exports so that they all end in .js.
  grunt.registerTask('build:esm', 'Use tsc to create ES module files in build/esm/', () => {
    generateVersionFile();
    log('ESM: Build to build/esm/');
    runCommand('tsc', '-p', 'tsconfig.esm.json');
    log('ESM: Fix Imports/Exports');
    runCommand('node', './tools/esm/fix-imports-and-exports.js', './build/esm/');
    // The build/esm/ folder needs a package.json that says "type": "module".
    log('ESM: Add package.json with "type": "module"');
    runCommand('cp', './tools/esm/package.json', './build/esm/package.json');
  });

  // Output *.d.ts files to build/types/.
  grunt.registerTask('build:types', 'Use tsc to create *.d.ts files in build/types/', () => {
    log('Building *.d.ts files in build/types/');
    runCommand('tsc', '-p', 'tsconfig.types.json');
  });

  // grunt watch
  // grunt watch runs many tasks in parallel, so increase the limit (default: 10) to avoid warnings about memory leaks.
  EventEmitter.defaultMaxListeners = 20;
  grunt.config.set('watch', {
    scripts: {
      files: ['src/**', 'entry/**', 'tests/**', '!src/version.ts', '!node_modules/**', '!build/**'],
      options: {
        atBegin: true,
        spawn: true,
        interrupt: true,
        debounceDelay: 700,
      },
      tasks: [
        'clean:build',
        'eslint', // skip this because it slows down the watch task substantially.
        'concurrent:all',
      ],
    },
  });

  // grunt watch:debug
  // Watch for changes and build debug CJS files & esm/*.
  grunt.registerTask('watch:debug', '', () => {
    // REPLACE THE DEFAULT WATCH TASKS.
    grunt.config.set('watch.scripts.tasks', [
      'clean:build',
      'eslint', // skip this because it slows down the watch task substantially.
      'concurrent:debug',
    ]);
    runTask('watch');
  });

  // grunt watch:production
  // Watch for changes and build production CJS files & esm/*.
  grunt.registerTask('watch:production', '', () => {
    // REPLACE THE DEFAULT WATCH TASKS.
    grunt.config.set('watch.scripts.tasks', [
      'clean:build',
      'eslint', // skip this because it slows down the watch task substantially.
      'concurrent:production',
    ]);
    runTask('watch');
  });

  // grunt test:browser:cjs
  // Open the default browser to the flow.html test page.
  grunt.registerTask(
    'test:browser:cjs',
    'Test the CJS build by loading the flow.html file in the default browser.', //
    () => {
      // If the CJS build doesn't exist, build it.
      if (!fs.existsSync(BUILD_CJS_DIR)) {
        runTask('concurrent:all');
        grunt.log.write('Build the CJS files.');
      } else {
        grunt.log.write('CJS files already exist. Skipping the build step.');
      }
      runTask('open:flow_html');
    }
  );

  // grunt test:browser:esm
  // Open the default browser to http://localhost:8080/tests/flow.html?esm=true
  // Requires a web server (e.g., `npx http-server`).
  grunt.registerTask(
    'test:browser:esm',
    'Test the ESM build in a web server by navigating to http://localhost:8080/tests/flow.html?esm=true',
    () => {
      // If the ESM build doesn't exist, build it.
      if (!fs.existsSync(BUILD_ESM_DIR)) {
        runTask('build:esm');
        log('Build the ESM files.');
      } else {
        log('ESM files already exist. Skipping the build step.');
      }
      runTask('open:flow_localhost');
      log('Remember to launch http-server in the vexflow/ directory!');
      log('npx http-server');
    }
  );

  // grunt reference
  // Build the current HEAD revision and copy it to reference/
  // After developing new features or fixing a bug, you can compare the current
  // working tree against the reference with: grunt test:reference
  grunt.registerTask('reference', 'Build to reference/.', [
    //
    'clean',
    'concurrent:all',
    'copy:reference',
  ]);

  // node ./tools/generate_images.js build ./build/images/current ${VEX_GENERATE_OPTIONS}
  grunt.registerTask('generate:current', 'Create images from the vexflow version in build/.', () => {
    const options = process.env.VEX_GENERATE_OPTIONS;
    const args = options ? options.split(' ') : [];
    runCommand('node', './tools/generate_images.js', 'build', './build/images/current', ...args);
  });

  // node ./tools/generate_images.js reference ./build/images/reference ${VEX_GENERATE_OPTIONS}
  grunt.registerTask('generate:reference', 'Create images from vexflow version in reference/.', () => {
    const options = process.env.VEX_GENERATE_OPTIONS;
    const args = options ? options.split(' ') : [];
    runCommand('node', './tools/generate_images.js', 'reference', './build/images/reference', ...args);
  });

  grunt.registerTask('generate:version', '', () => {
    const info = generateVersionFile();
    console.log(info);
  });

  // ./tools/visual_regression.sh reference
  grunt.registerTask('diff:reference', 'Compare ', () => {
    runCommand('./tools/visual_regression.sh');
  });

  // grunt test:reference
  grunt.registerTask('test:reference', '', [
    //
    'test',
    'generate:current',
    'generate:reference',
    'diff:reference',
  ]);

  grunt.registerTask('test:reference:cache', '', [
    'cache:save:reference',
    'test',
    'generate:current',
    'cache:restore:reference',
    'diff:reference',
  ]);

  grunt.registerTask('cache:save:reference', '', () => {
    if (!fs.existsSync(REFERENCE_IMAGES_DIR)) {
      fs.mkdirSync(REFERENCE_IMAGES_DIR, { recursive: true });
    }

    if (fs.existsSync(BUILD_IMAGES_REFERENCE_DIR)) {
      runTask('clean:reference_images');
      runTask('copy:save_reference_images');
    }
  });

  grunt.registerTask('cache:restore:reference', '', () => {
    if (fs.existsSync(REFERENCE_IMAGES_DIR)) {
      runTask('copy:restore_reference_images');
    } else {
      runTask('generate:reference');
    }
  });

  // grunt get:releases:3.0.9:4.0.0   =>   node ./tools/get_releases.mjs 3.0.9 4.0.0
  grunt.registerTask('get:releases', '', () => {
    runCommand('node', './tools/get_releases.mjs', ...grunt.task.current.args);
  });

  // grunt release
  grunt.registerTask('release', '', () => {
    runCommand('npx', 'release-it');
  });

  // grunt release:alpha
  grunt.registerTask('release:alpha', '', () => {
    runCommand('npx', 'release-it', '--preRelease=alpha');
  });

  // grunt release:beta
  grunt.registerTask('release:beta', '', () => {
    runCommand('npx', 'release-it', '--preRelease=beta');
  });

  // grunt release:rc
  grunt.registerTask('release:rc', '', () => {
    runCommand('npx', 'release-it', '--preRelease=rc');
  });

  // grunt release:alpha
  grunt.registerTask('release:dry-run', '', () => {
    runCommand('npx', 'release-it', '--dry-run');
  });

  // grunt release:dry-run:alpha
  grunt.registerTask('release:dry-run:alpha', '', () => {
    runCommand('npx', 'release-it', '--dry-run', '--preRelease=alpha');
  });

  // grunt release:dry-run:beta
  grunt.registerTask('release:dry-run:beta', '', () => {
    runCommand('npx', 'release-it', '--dry-run', '--preRelease=beta');
  });

  // grunt release:dry-run:rc
  grunt.registerTask('release:dry-run:rc', '', () => {
    runCommand('npx', 'release-it', '--dry-run', '--preRelease=rc');
  });
};
