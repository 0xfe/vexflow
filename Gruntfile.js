/************************************************************************************************************

grunt
  - build the complete set of VexFlow libraries (with source-maps) for production and debug use.
grunt test
  - build the VexFlow libraries and run the QUnit command line tests with 'tests/flow-headless-browser.html'.
grunt reference
  - build the VexFlow libraries and run the copy:reference task, which copies the 
    current build/ to the reference/ folder, so that we can compare future builds to the reference/.
grunt release
  - run the release script to publish to npm and GitHub.
    this assumes you have run already `grunt` and have fully tested the build.
*************************************************************************************************************

grunt dev
  - the fastest way to iterate while working on VexFlow. It skips eslint, and only produces the debug CJS libraries.
grunt watch
grunt watch:prod
grunt watch:debug

grunt qunit

grunt copy:reference
  - if you have recently run `grunt test` call this to save the current build/ to reference/.
grunt build:cjs
grunt build:esm
grunt build:types


grunt get:releases:versionX:versionY:...
grunt get:releases:3.0.9:4.0.0
  - retrieve previous releases for regression testing purposes.

Search this file for `grunt ` (the word grunt followed by a single space) to see what else is supported.

*************************************************************************************************************
Optional environment variables:

VEX_DEBUG_CIRCULAR_DEPENDENCIES
    if true, we display a list of circular dependencies in the code.
VEX_DEVTOOL
    specify webpack's devtool config (the default is 'source-map').
    https://webpack.js.org/configuration/devtool/
VEX_GENERATE_OPTIONS
    options for controlling the ./tools/generate_images.js script.
    see the 'generate:current' and 'generate:reference' tasks.

To pass in environment variables, you can use your ~/.bash_profile or do something like:
  export VEX_DEBUG_CIRCULAR_DEPENDENCIES=true
  export VEX_DEVTOOL=source-map
  grunt
You can also do it all on one line:
  VEX_DEBUG_CIRCULAR_DEPENDENCIES=true VEX_DEVTOOL=source-map grunt

*************************************************************************************************************

If you are adding a new music engraving font, search for instances of ADD_MUSIC_FONT in the code base.
In this Gruntfile, you can export a font module which can be dynamically loaded by vexflow-core.js.
To include your new font into the complete vexflow.js, take a look at src/fonts/load_all.ts

*************************************************************************************************************/

const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync, execSync } = require('child_process');
const { EventEmitter } = require('events');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// A module entry file `entry/xxxx.ts` will be mapped to a build output file in build/cjs/ or /build/esm/entry/.
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
// [ADD_MUSIC_FONT]
// Provide the base name of your font entry file: entry/vexflow-font-xxx.ts => vexflow-font-xxx
// const VEX_FONT_XXX = 'vexflow-font-xxx';
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
const WEBPACK_CACHE_DIR = path.join(BASE_DIR, 'node_modules', '.cache', 'webpack');

// Flags for setting the webpack mode.
// See: https://webpack.js.org/configuration/mode/
// PRODUCTION_MODE enables minification and DEVELOPMENT_MODE disables code minification.
const PRODUCTION_MODE = 'production';
const DEVELOPMENT_MODE = 'development';

// Read environment variables to configure our scripts.
let DEBUG_CIRCULAR_DEPENDENCIES, DEVTOOL, GENERATE_IMAGES_ARGS;
function readEnvironmentVariables() {
  const env = process.env;
  let val = env.VEX_DEBUG_CIRCULAR_DEPENDENCIES;
  DEBUG_CIRCULAR_DEPENDENCIES = val === 'true' || val === '1';

  // Control the type of source maps that will be produced.
  // See: https://webpack.js.org/configuration/devtool/
  // In version 3.0.9 this environment variable was called VEX_GENMAP.
  DEVTOOL = env.VEX_DEVTOOL || 'source-map'; // for production builds with high quality source maps.

  val = env.VEX_GENERATE_OPTIONS;
  GENERATE_IMAGES_ARGS = val ? val.split(' ') : [];
}
readEnvironmentVariables();

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
  // entryFiles is one of the following:
  //   an array of file names
  //   an object that maps entry names to file names
  //   a file name string
  // returns a webpack config object.
  function getConfig(entryFiles, mode, addBanner, libraryName, watch = false) {
    let entry, filename;
    if (Array.isArray(entryFiles)) {
      entry = {};
      for (const entryFileName of entryFiles) {
        // The entry point is a full path to a typescript file in vexflow/entry/.
        entry[entryFileName] = path.join(BASE_DIR, 'entry/', entryFileName + '.ts');
      }
      filename = '[name].js'; // output file names are based on the keys of the entry object above.
    } else if (typeof entryFiles === 'object') {
      entry = {};
      for (const k in entryFiles) {
        const entryFileName = entryFiles[k];
        entry[k] = path.join(BASE_DIR, 'entry/', entryFileName + '.ts');
      }
      filename = '[name].js'; // output file names are based on the keys of the entry object above.
    } else {
      // entryFiles is a string representing a single file name.
      const entryFileName = entryFiles;
      entry = path.join(BASE_DIR, 'entry/', entryFileName + '.ts');
      filename = entryFileName + '.js'; // output file name is the same as the entry file name, but with the js extension.
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

    function getPlugins() {
      const plugins = [];

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
        plugins.push(new CircularDependencyPlugin({ cwd: process.cwd() }));
      }

      plugins.push(
        new ForkTsCheckerWebpackPlugin({
          typescript: {
            diagnosticOptions: {
              semantic: true,
              syntactic: true,
              declaration: true,
              global: true,
            },
          },
          eslint: {
            files: ['./src/**/*.ts', './entry/**/*.ts', './tests/**/*.ts'],
            options: { fix: true, cache: true },
          },
        })
      );
      return plugins;
    }

    let optimization;
    if (mode === PRODUCTION_MODE) {
      optimization = {
        minimizer: [
          new TerserPlugin({
            extractComments: false, // DO NOT extract the banner into a separate file.
            parallel: os.cpus().length,
          }),
        ],
      };
    }

    const cache = mode === DEVELOPMENT_MODE ? { type: 'filesystem' } : false;

    return {
      mode,
      entry,
      cache,
      watch,
      output: {
        path: BUILD_CJS_DIR,
        filename: filename,
        library: {
          name: libraryName,
          type: 'umd',
          export: 'default',
        },
        globalObject,
      },
      resolve: { extensions: ['.ts', '.tsx', '.js', '...'] },
      devtool: DEVTOOL,
      module: {
        rules: [
          {
            test: /(\.ts$|\.js$)/,
            exclude: /node_modules/,
            resolve: { fullySpecified: false },
            use: [
              {
                // https://webpack.js.org/guides/build-performance/#typescript-loader
                // https://www.npmjs.com/package/fork-ts-checker-webpack-plugin
                loader: 'ts-loader',
                options: {
                  configFile: 'tsconfig.json',
                  transpileOnly: true,
                },
              },
            ],
          },
        ],
      },
      plugins: getPlugins(),
      optimization,
    };
  }

  // Friendly names for boolean flags that we willet use below.
  const BANNER = true;
  const WATCH = true;

  function prodConfig(watch = false) {
    return getConfig([VEX, VEX_BRAVURA, VEX_GONVILLE, VEX_PETALUMA, VEX_CORE], PRODUCTION_MODE, BANNER, 'Vex', watch);
  }

  function fontConfigs(watch = false) {
    return [
      getConfig(VEX_FONT_BRAVURA, PRODUCTION_MODE, !BANNER, ['VexFlowFont', 'Bravura'], watch),
      getConfig(VEX_FONT_PETALUMA, PRODUCTION_MODE, !BANNER, ['VexFlowFont', 'Petaluma'], watch),
      getConfig(VEX_FONT_GONVILLE, PRODUCTION_MODE, !BANNER, ['VexFlowFont', 'Gonville'], watch),
      getConfig(VEX_FONT_CUSTOM, PRODUCTION_MODE, !BANNER, ['VexFlowFont', 'Custom'], watch),
      // [ADD_MUSIC_FONT]
      // Add a webpack config for exporting your font module.
      // getConfig(VEX_FONT_XXX, PRODUCTION_MODE, !BANNER, ['VexFlowFont', 'XXX'], watch),
    ];
  }

  function debugConfig(watch = false) {
    return getConfig([VEX_DEBUG, VEX_DEBUG_TESTS], DEVELOPMENT_MODE, BANNER, 'Vex', watch);
  }

  return {
    prodAndDebug: () => [prodConfig(), ...fontConfigs(), debugConfig()],
    prod: () => [prodConfig(), ...fontConfigs()],
    debug: () => debugConfig(),
    watchProd: () => [prodConfig(WATCH), ...fontConfigs(WATCH)],
    watchDebug: () => debugConfig(WATCH),
  };
}

module.exports = (grunt) => {
  const log = grunt.log.writeln;

  // Fail the grunt task if there are uncommitted changes (other than the auto-generated `src/version.ts` file).
  function verifyGitWorkingDirectory() {
    const output = execSync('git status -s').toString();
    const lines = output.split('\n');
    let numDirtyFiles = 0;
    for (const ln in lines) {
      const line = lines[ln].trim();
      if (line === '') {
        continue;
      } else if (line.includes('src/version.ts')) {
        console.log('OK', line);
      } else {
        console.log('!!', line);
        numDirtyFiles++;
      }
    }

    if (numDirtyFiles > 0) {
      grunt.fail.fatal('Please commit or stash your changes before releasing to npm and GitHub.', 1);
    }
  }

  // Some tasks can be run in parallel to improve performance.
  function runTasksConcurrently(done, ...tasks) {
    const numTasksToComplete = tasks.length;
    let completedTasks = 0;
    function taskComplete() {
      completedTasks++;
      if (completedTasks === numTasksToComplete) {
        done(true);
      }
    }

    for (const task of tasks) {
      let args = task;
      if (typeof task === 'string') {
        args = [task];
      } else {
        // task is an array of task strings.
        args = task;
      }
      grunt.util.spawn(
        {
          grunt: true,
          args: args,
          opts: { stdio: 'inherit' },
        },
        (error, result, code) => {
          const output = String(result);
          if (error) {
            grunt.log.error(output);
          } else {
            grunt.log.ok(output);
          }
          taskComplete();
        }
      );
    }
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    webpack: webpackConfigs(),
    // grunt qunit
    // Runs unit tests on the command line by using flow-headless-browser.html.
    qunit: { files: ['tests/flow-headless-browser.html'] },
    open: {
      // grunt open:flow_html
      flow_html: { path: './tests/flow.html' },
      // grunt open:flow_localhost
      flow_localhost: { path: 'http://127.0.0.1:8080/tests/flow.html?esm=true' },
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
    // grunt clean
    clean: {
      // grunt clean:build
      build: { src: [BUILD_DIR] },
      // grunt clean:reference
      reference: { src: [REFERENCE_DIR] },
      // grunt clean:reference_images
      reference_images: { src: [REFERENCE_IMAGES_DIR] },
      // grunt clean:webpack_cache
      // https://webpack.js.org/guides/build-performance/#persistent-cache
      webpack_cache: { src: [WEBPACK_CACHE_DIR] },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-webpack');

  // We will use the 'watch' task name for native webpack watch instead.
  grunt.renameTask('watch', 'watch:esm');

  // grunt
  // Build all targets for production and debugging.
  grunt.registerTask('default', 'Build all VexFlow targets.', [
    'clean:build',
    'webpack:prodAndDebug',
    'default_esm_types_api',
  ]);
  // Internal task used by the above 'default' task to improve build performance.
  grunt.registerTask('default_esm_types_api', 'Build other targets.', function () {
    runTasksConcurrently(this.async(), 'build:esm', 'build:types', 'typedoc');
  });

  // grunt test
  // Run command line qunit tests.
  grunt.registerTask('test', 'Run command line unit tests.', [
    'clean:build',
    'webpack:prodAndDebug',
    'build:esm',
    'qunit',
  ]);

  // grunt build:cjs
  grunt.registerTask('build:cjs', 'Use webpack to create CJS files in build/cjs/', ['webpack:prodAndDebug']);

  // grunt build:esm
  // Output individual ES module files to build/esm/.
  // Also fixes the imports and exports so that they all end in .js.
  grunt.registerTask('build:esm', 'Use tsc to create ES module files in build/esm/', () => {
    generateVersionFile();
    log('ESM: Building to build/esm/');
    execSync('tsc -p tsconfig.esm.json');
    // Add .js file extensions to ESM imports and re-exports.
    execSync('node ./tools/esm/fix-imports-and-exports.js ./build/esm/');
    // The build/esm/ folder needs a package.json that says "type": "module".
    execSync('cp ./tools/esm/package.json ./build/esm/package.json');
  });

  // grunt build:types
  // Output *.d.ts files to build/types/.
  grunt.registerTask('build:types', 'Use tsc to create *.d.ts files in build/types/', () => {
    log('Types: Building *.d.ts files in build/types/');
    execSync('tsc -p tsconfig.types.json');
  });

  // grunt watch
  // Watch for changes and builds debug CJS files.
  grunt.registerTask('watch', 'The fastest way to iterate while working on VexFlow', () => {
    grunt.task.run(['clean:build', 'webpack:watchDebug']);
  });

  // grunt watch:prod
  // Watch for changes and build production CJS files.
  grunt.registerTask('watch:prod', '', () => {
    grunt.task.run(['clean:build', 'webpack:watchProd']);
  });

  // grunt watch:esm
  // Watch for changes and build esm/*.
  grunt.config.set('watch:esm', {
    scripts: {
      files: ['src/**', 'entry/**', 'tests/**', '!src/version.ts', '!**/node_modules/**', '!build/**'],
      options: {
        atBegin: false,
        interrupt: false,
        debounceDelay: 600,
      },
      tasks: ['clean:build', 'build:esm'],
    },
  });

  grunt.registerTask('test:cmd', 'Run command line unit tests.', 'qunit');

  // grunt test:browser:cjs
  // Open the default browser to the flow.html test page.
  grunt.registerTask(
    'test:browser:cjs',
    'Test the CJS build by loading the flow.html file in the default browser.', //
    () => {
      // If the CJS build doesn't exist, build it.
      if (!fs.existsSync(BUILD_CJS_DIR)) {
        log('Building the CJS files.');
        grunt.task.run('webpack:debug');
      } else {
        log('CJS files already exist. Skipping the build step. To rebuild, run:');
        log('grunt clean && grunt test:browser:cjs');
      }
      grunt.task.run('open:flow_html');
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
        log('Building the ESM files.');
        grunt.task.run('build:esm');
      } else {
        log('ESM files already exist. Skipping the build step. To rebuild, run:');
        log('grunt clean && grunt test:browser:esm');
      }

      grunt.task.run('open:flow_localhost');
      log('Remember to launch http-server in the vexflow/ directory!');
      log('npx http-server');
    }
  );

  // grunt reference
  // Build the current HEAD revision and copy it to reference/
  // After developing new features or fixing a bug, you can compare the current
  // working tree against the reference with: grunt test:reference
  grunt.registerTask('reference', 'Build to reference/.', [
    'clean',
    'webpack:prodAndDebug',
    'build:esm',
    'copy:reference',
  ]);

  // grunt generate:current
  // node ./tools/generate_images.js build ./build/images/current ${VEX_GENERATE_OPTIONS}
  grunt.registerTask('generate:current', 'Create images from the vexflow version in build/.', () => {
    runCommand('node', './tools/generate_images.js', 'build', './build/images/current', ...GENERATE_IMAGES_ARGS);
  });

  // grunt generate:reference
  // node ./tools/generate_images.js reference ./build/images/reference ${VEX_GENERATE_OPTIONS}
  grunt.registerTask('generate:reference', 'Create images from vexflow version in reference/.', () => {
    runCommand('node', './tools/generate_images.js', 'reference', './build/images/reference', ...GENERATE_IMAGES_ARGS);
  });

  // grunt generate:version
  grunt.registerTask('generate:version', '', () => {
    const info = generateVersionFile();
    console.log(info);
  });

  // grunt diff:reference
  grunt.registerTask(
    'diff:reference',
    'Compare images created by the build/ and reference/ versions of VexFlow.',
    () => {
      execSync('./tools/visual_regression.sh');
    }
  );

  // grunt diff:version:xxxx
  grunt.registerTask(
    'diff:version',
    'Compare images created by the build/ and releases/xxxx/ versions of VexFlow',
    (versionNumber) => {
      console.log(versionNumber);
      // TODO: Update ./tools/visual_regression.sh to accept a version number and use the correct files.
    }
  );

  // grunt test:reference
  grunt.registerTask('test:reference', 'Generate images from build/ and reference/ and compare them.', [
    'test',
    'generate:current',
    'generate:reference',
    'diff:reference',
  ]);

  // grunt test:reference:cache
  // Faster than `grunt test:reference` because it reuses the existing reference images if available.
  grunt.registerTask('test:reference:cache', '', [
    'cache:save:reference',
    'test',
    'generate:current',
    'cache:restore:reference',
    'diff:reference',
  ]);

  grunt.registerTask('cache:save:reference', '', () => {
    if (fs.existsSync(BUILD_IMAGES_REFERENCE_DIR)) {
      grunt.task.run('clean:reference_images');
      grunt.task.run('copy:save_reference_images');
    }
  });

  // If the reference images are not available, run the 'generate:reference' task.
  grunt.registerTask('cache:restore:reference', '', () => {
    if (fs.existsSync(REFERENCE_IMAGES_DIR)) {
      grunt.task.run('copy:restore_reference_images');
    } else {
      grunt.task.run('generate:reference');
    }
  });

  // grunt get:releases:3.0.9:4.0.0   =>   node ./tools/get_releases.mjs 3.0.9 4.0.0
  // Note: the arguments are separated by colons!
  grunt.registerTask('get:releases', '', (...args) => {
    runCommand('node', './tools/get_releases.mjs', ...args);
  });

  // grunt release
  // Release to npm and GitHub.
  grunt.registerTask('release', '', () => {
    verifyGitWorkingDirectory();
    execSync('npx release-it');
  });

  // grunt release:alpha
  grunt.registerTask('release:alpha', '', () => {
    verifyGitWorkingDirectory();
    execSync('npx release-it --preRelease=alpha');
  });

  // grunt release:beta
  grunt.registerTask('release:beta', '', () => {
    verifyGitWorkingDirectory();
    runCommand('npx release-it --preRelease=beta');
  });

  // grunt release:rc
  grunt.registerTask('release:rc', '', () => {
    verifyGitWorkingDirectory();
    runCommand('npx release-it --preRelease=rc');
  });

  // grunt release:dry-run
  // Walk through the release process without actually doing anything.
  grunt.registerTask('release:dry-run', '', () => {
    verifyGitWorkingDirectory();
    runCommand('npx release-it --dry-run');
  });

  // grunt release:dry-run:alpha
  grunt.registerTask('release:dry-run:alpha', '', () => {
    verifyGitWorkingDirectory();
    runCommand('npx release-it --dry-run --preRelease=alpha');
  });

  // grunt release:dry-run:beta
  grunt.registerTask('release:dry-run:beta', '', () => {
    verifyGitWorkingDirectory();
    runCommand('npx release-it --dry-run --preRelease=beta');
  });

  // grunt release:dry-run:rc
  grunt.registerTask('release:dry-run:rc', '', () => {
    verifyGitWorkingDirectory();
    runCommand('npx release-it --dry-run --preRelease=rc');
  });

  // grunt build-test-release
  grunt.registerTask('build-test-release', '', () => {
    grunt.task.run('default');
    grunt.task.run('qunit');
    grunt.task.run('release:dry-run'); // TODO: remove dry-run!
  });

  grunt.registerTask('typedoc', '', function () {
    const output = execSync('npx typedoc').toString();
    console.log('TypeDoc:', output);
  });
};
