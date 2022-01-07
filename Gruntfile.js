/* global module, __dirname, process, require */

// This Gruntfile supports these optional environment variables:
//   VEX_DEBUG_CIRCULAR_DEPENDENCIES
//       if true, we display a list of circular dependencies in the code base.
//   VEX_DEVTOOL
//       override our default setting for webpack's devtool config
//       https://webpack.js.org/configuration/devtool/
//   VEX_GENERATE_OPTIONS
//       options for controlling the ./tools/generate_images.js script.
//       see the generate:current and generate:reference below.
// To pass in environment variables, you can use your ~/.bash_profile or do something like:
//     export VEX_DEBUG_CIRCULAR_DEPENDENCIES=true
//     export VEX_DEVTOOL=eval
//     grunt
// Or you can do it all on one line:
//     VEX_DEBUG_CIRCULAR_DEPENDENCIES=true VEX_DEVTOOL=eval grunt

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { spawnSync } = require('child_process');
const { EventEmitter } = require('events');
const TerserPlugin = require('terser-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const VER = require('./tools/generate_version_file'); // Make the src/version.ts file.

const BUILD_VERSION = VER.VERSION;
const BUILD_DATE = VER.DATE;
const BUILD_ID = VER.ID;

const DEBUG_CIRCULAR_DEPENDENCIES =
  process.env.VEX_DEBUG_CIRCULAR_DEPENDENCIES === 'true' || process.env.VEX_DEBUG_CIRCULAR_DEPENDENCIES === '1';

// A module entry file `entry/xxxx.ts` will be mapped to a build output file `build/xxxx.js`.
// Also see the package.json `exports` field, which is one way for projects to specify which entry file to import.
const VEX = 'vexflow';
const VEX_BRAVURA = 'vexflow-bravura';
const VEX_GONVILLE = 'vexflow-gonville';
const VEX_PETALUMA = 'vexflow-petaluma';
const VEX_CORE = 'vexflow-core'; // Supports dynamic import of the font modules below.
const VEX_FONT_MODULE_BRAVURA = 'vexflow-font-bravura';
const VEX_FONT_MODULE_GONVILLE = 'vexflow-font-gonville';
const VEX_FONT_MODULE_PETALUMA = 'vexflow-font-petaluma';
const VEX_FONT_MODULE_CUSTOM = 'vexflow-font-custom';

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

// `grunt watch` runs many tasks in parallel, so increase the limit (default: 10) to avoid warnings about memory leaks.
EventEmitter.defaultMaxListeners = 20;
const FILES_TO_WATCH = ['src/**', 'entry/**', 'tests/**', '!src/version.ts', '!node_modules/**'];

// While developing, you can speed up builds by temporarily commenting out one of the tasks below.
const cjsDebugBuilds = [
  'webpack:buildDebug', // CJS debug library: vexflow-debug.js
  'webpack:buildDebugWithTests', // CJS debug library: vexflow-debug-with-tests.js
];

// While developing, you can speed up builds by temporarily commenting out one of the tasks below.
const cjsProductionBuilds = [
  'webpack:buildProdAllFonts', // CJS Production: vexflow.js
  'webpack:buildProdBravuraOnly', // CJS production library: vexflow-bravura.js
  'webpack:buildProdGonvilleOnly', // CJS production library: vexflow-gonville.js
  'webpack:buildProdPetalumaOnly', // CJS production library: vexflow-petaluma.js
  'webpack:buildProdNoFonts', // CJS production library: vexflow-core.js
  'webpack:buildProdFontModuleBravura', // CJS production library: vexflow-font-bravura.js
  'webpack:buildProdFontModulePetaluma', // CJS production library: vexflow-font-petaluma.js
  'webpack:buildProdFontModuleGonville', // CJS production library: vexflow-font-gonville.js
  'webpack:buildProdFontModuleCustom', // CJS production library: vexflow-font-custom.js
];

const esmBuild = [
  'build:esm', // ESM outputs individual JS files to build/esm/.
];

const allBuilds = [...cjsDebugBuilds, ...cjsProductionBuilds, ...esmBuild];

// PRODUCTION_MODE will enable minification, etc.
// See: https://webpack.js.org/configuration/mode/
const PRODUCTION_MODE = 'production';
// FOR DEBUGGING PURPOSES, you can temporarily comment out the line above and use the line below to disable minification.
// const PRODUCTION_MODE = 'development';
const DEVELOPMENT_MODE = 'development';

const fontLibraryPrefix = 'VexFlowFont';

/**
 * @returns a webpack config object. Default to PRODUCTION_MODE unless you specify DEVELOPMENT_MODE.
 */
function getConfig(file, mode = PRODUCTION_MODE, addBanner = true, libraryName = 'Vex') {
  // The module entry is a full path to a typescript file stored in vexflow/entry/.
  const entry = path.join(BASE_DIR, 'entry/', file + '.ts');
  const outputFilename = file + '.js';

  // TODO: Explore passing multiple entry points to the entry field instead of running multiple webpack tasks
  // with different configurations via multiple calls to getConfig(...).
  // See: https://webpack.js.org/configuration/entry-context/#entry

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
  // If not specified, production builds will get high quality source maps, and development/debug builds will get nothing.
  // See: https://webpack.js.org/configuration/devtool/
  // In version 3.0.9 this was called VEX_GENMAP.
  const devtool = process.env.VEX_DEVTOOL || (mode === DEVELOPMENT_MODE ? false : 'source-map');

  let plugins = [];

  // Add a banner at the top of the file.
  if (addBanner) {
    BANNER =
      `VexFlow ${BUILD_VERSION}   ${BUILD_DATE}   ${BUILD_ID}\n` +
      `Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>\n` +
      `https://www.vexflow.com   https://github.com/0xfe/vexflow`;
    plugins.push(new webpack.BannerPlugin(BANNER));
  }

  if (DEBUG_CIRCULAR_DEPENDENCIES) {
    plugins.push(
      new CircularDependencyPlugin({
        cwd: process.cwd(),
      })
    );
  }

  return {
    mode: mode,
    entry: entry,
    output: {
      path: BUILD_CJS_DIR,
      filename: outputFilename,

      library: {
        name: libraryName,
        type: 'umd',
        export: 'default',
      },
      globalObject: globalObject,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '...'],
    },
    devtool: devtool,
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
    plugins: plugins,
    optimization: {
      minimizer: [
        // DO NOT extract the banner into a separate file.
        new TerserPlugin({ extractComments: false }),
      ],
    },
  };
}

function runCommand(command, ...args) {
  // The stdio option passes the output from the spawned process back to this process's console.
  spawnSync(command, args, { stdio: 'inherit' });
}

// We need a different webpack config for each build target.
// TODO: Transition to a multi-entry approach.
function getWebpackConfigs() {
  const prodAllFonts = getConfig(VEX, PRODUCTION_MODE);
  const prodBravuraOnly = getConfig(VEX_BRAVURA, PRODUCTION_MODE);
  const prodGonvilleOnly = getConfig(VEX_GONVILLE, PRODUCTION_MODE);
  const prodPetalumaOnly = getConfig(VEX_PETALUMA, PRODUCTION_MODE);
  const prodNoFonts = getConfig(VEX_CORE, PRODUCTION_MODE);

  // Disable the MIT license banner for font module files.
  const NO_BANNER = false;
  const prodFontModuleBravura = getConfig(
    VEX_FONT_MODULE_BRAVURA,
    PRODUCTION_MODE,
    NO_BANNER,
    fontLibraryPrefix + 'Bravura'
  );
  const prodFontModulePetaluma = getConfig(
    VEX_FONT_MODULE_PETALUMA,
    PRODUCTION_MODE,
    NO_BANNER,
    fontLibraryPrefix + 'Petaluma'
  );
  const prodFontModuleGonville = getConfig(
    VEX_FONT_MODULE_GONVILLE,
    PRODUCTION_MODE,
    NO_BANNER,
    fontLibraryPrefix + 'Gonville'
  );
  const prodFontModuleCustom = getConfig(
    VEX_FONT_MODULE_CUSTOM,
    PRODUCTION_MODE,
    NO_BANNER,
    fontLibraryPrefix + 'Custom'
  );

  // The webpack configs below specify DEVELOPMENT_MODE, which disables code minification.
  const debugAllFonts = getConfig(VEX_DEBUG, DEVELOPMENT_MODE);
  const debugAllFontsWithTests = getConfig(VEX_DEBUG_TESTS, DEVELOPMENT_MODE);

  return {
    // Build targets for production.
    buildProdAllFonts: prodAllFonts,
    buildProdBravuraOnly: prodBravuraOnly,
    buildProdGonvilleOnly: prodGonvilleOnly,
    buildProdPetalumaOnly: prodPetalumaOnly,
    buildProdNoFonts: prodNoFonts,
    buildProdFontModuleBravura: prodFontModuleBravura,
    buildProdFontModulePetaluma: prodFontModulePetaluma,
    buildProdFontModuleGonville: prodFontModuleGonville,
    buildProdFontModuleCustom: prodFontModuleCustom,
    // Build targets for development / debugging.
    buildDebug: debugAllFonts,
    buildDebugWithTests: debugAllFontsWithTests,
  };
}

module.exports = (grunt) => {
  const log = grunt.log.writeln;
  function runTask(taskName) {
    grunt.task.run(taskName);
  }

  const PACKAGE_JSON = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: PACKAGE_JSON,
    webpack: getWebpackConfigs(),
    concurrent: {
      options: {
        logConcurrentOutput: true,
        indent: true,
      },
      all: [...allBuilds],
      debug: [...cjsDebugBuilds, ...esmBuild],
      production: [...cjsProductionBuilds, ...esmBuild],
    },
    // grunt eslint
    eslint: {
      target: ['./src', './tests'],
      options: { fix: true },
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
    //
    'clean:build',
    'eslint',
    'concurrent:all',
    'build:types',
    'typedoc',
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
    'clean:build',
    ...cjsDebugBuilds,
    ...cjsProductionBuilds,
  ]);

  // grunt build:esm
  // Output ESM module files to build/esm/.
  // Also fixes the imports and exports so that they all end in .js.
  grunt.registerTask('build:esm', 'Use tsc to create ES module files in build/esm/', () => {
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

  // `grunt watch`
  // Configure the watch task.
  {
    grunt.config.set('watch', {
      scripts: {
        files: FILES_TO_WATCH,
        options: {
          atBegin: true,
          spawn: true,
          interrupt: false,
          debounceDelay: 800,
        },
        tasks: [
          //
          'clean:build',
          // 'eslint', // slows down the watch task substantially.
          'concurrent:all',
        ],
      },
    });
  }

  // `grunt watch:dev`
  // Watch for changes and build debug CJS files & esm/*.
  grunt.registerTask('watch:dev', '', () => {
    // REPLACE THE DEFAULT WATCH TASKS.
    grunt.config.set('watch.scripts.tasks', [
      //
      'clean:build',
      // 'eslint', // slows down the watch task substantially.
      'concurrent:debug',
    ]);
    grunt.config.set('eslint.options.failOnError', false);
    runTask('watch');
  });

  // `grunt watch:production`
  // Watch for changes and build production CJS files & esm/*.
  grunt.registerTask('watch:production', '', () => {
    // REPLACE THE DEFAULT WATCH TASKS.
    grunt.config.set('watch.scripts.tasks', [
      //
      'clean:build',
      // 'eslint', // slows down the watch task substantially.
      'concurrent:production',
    ]);
    grunt.config.set('eslint.options.failOnError', false);
    runTask('watch');
  });

  // `grunt test:browser:cjs`
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

  // `grunt test:browser:esm`
  // Open the default browser to `http://localhost:8080/tests/flow.html?esm=true`.
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
