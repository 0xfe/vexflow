/* global module, __dirname, process, require */

// This Gruntfile supports these optional environment variables:
//   VEX_DEBUG_CIRCULAR_DEPENDENCIES
//       if true, we display a list of circular dependencies in the code base.
//   VEX_DEVTOOL
//       override our default setting for webpack's devtool config
//       https://webpack.js.org/configuration/devtool/
// To pass in environment variables, you can use your ~/.bash_profile or do something like:
//   export VEX_DEBUG_CIRCULAR_DEPENDENCIES=true
//   export VEX_DEVTOOL=eval
//   grunt

const path = require('path');
const webpack = require('webpack');
const child_process = require('child_process');
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
const REFERENCE_DIR = path.join(BASE_DIR, 'reference');

// Global variable that will be set below.
let BANNER;
const NO_BANNER = false; // A flag for disabling the MIT license banner for font module files.

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

module.exports = (grunt) => {
  BANNER =
    `VexFlow ${BUILD_VERSION}   ${BUILD_DATE}   ${BUILD_ID}\n` +
    `Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>\n` +
    `https://www.vexflow.com   https://github.com/0xfe/vexflow`;

  // We need a different webpack config for each build target.
  const prodAllFonts = getConfig(VEX, PRODUCTION_MODE);
  const prodBravuraOnly = getConfig(VEX_BRAVURA, PRODUCTION_MODE);
  const prodGonvilleOnly = getConfig(VEX_GONVILLE, PRODUCTION_MODE);
  const prodPetalumaOnly = getConfig(VEX_PETALUMA, PRODUCTION_MODE);
  const prodNoFonts = getConfig(VEX_CORE, PRODUCTION_MODE);
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
  const debugNoFonts = getConfig(VEX_CORE, DEVELOPMENT_MODE);

  // See: https://webpack.js.org/configuration/watch/#watchoptionsignored
  const watch = {
    watch: true,
    watchOptions: {
      aggregateTimeout: 600 /* ms */,
      ignored: ['**/node_modules'],
    },
  };

  const PACKAGE_JSON = grunt.file.readJSON('package.json');
  grunt.initConfig({
    pkg: PACKAGE_JSON,
    webpack: {
      buildProdAllFonts: prodAllFonts,
      buildProdBravuraOnly: prodBravuraOnly,
      buildProdGonvilleOnly: prodGonvilleOnly,
      buildProdPetalumaOnly: prodPetalumaOnly,
      buildProdNoFonts: prodNoFonts,
      buildProdFontModuleBravura: prodFontModuleBravura,
      buildProdFontModulePetaluma: prodFontModulePetaluma,
      buildProdFontModuleGonville: prodFontModuleGonville,
      buildProdFontModuleCustom: prodFontModuleCustom,

      buildDebug: debugAllFonts,
      buildDebugPlusTests: debugAllFontsWithTests,
      buildDebugNoFonts: debugNoFonts,

      watchProdAllFonts: { ...prodAllFonts, ...watch },
      watchProdNoFonts: { ...prodNoFonts, ...watch },
      watchProdBravuraOnly: { ...prodBravuraOnly, ...watch },
      watchProdGonvilleOnly: { ...prodGonvilleOnly, ...watch },
      watchProdPetalumaOnly: { ...prodPetalumaOnly, ...watch },

      watchDebug: { ...debugAllFonts, ...watch },
      watchDebugPlusTests: { ...debugAllFontsWithTests, ...watch },
      watchDebugNoFonts: { ...debugNoFonts, ...watch },
    },
    concurrent: {
      options: {
        logConcurrentOutput: true,
        indent: true,
      },
      debug: [
        // While developing, you can speed up builds by temporarily commenting out one of the tasks below.
        'webpack:watchDebug',
        'webpack:watchDebugPlusTests',
      ],
      production: [
        // While developing, you can speed up builds by temporarily commenting out one of the tasks below.
        'webpack:watchProdAllFonts',
        'webpack:watchProdNoFonts',
      ],
    },

    eslint: {
      target: ['./src', './tests'],
      options: { fix: true },
    },
    qunit: {
      files: ['tests/flow-headless-browser.html'],
    },
    copy: {
      reference: {
        files: [
          {
            expand: true,
            cwd: BUILD_DIR,
            src: ['*.js', '*.map'],
            dest: REFERENCE_DIR,
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
    },
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-typedoc');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-force-task');

  // Default tasks that run when you type `grunt`.
  grunt.registerTask(
    'default',
    'Build VexFlow', //
    [
      'clean:build',
      'eslint',
      'webpack:buildDebug',
      'webpack:buildDebugPlusTests',
      'webpack:buildProdAllFonts',
      'webpack:buildProdBravuraOnly',
      'webpack:buildProdGonvilleOnly',
      'webpack:buildProdPetalumaOnly',
      'webpack:buildProdNoFonts',
      'webpack:buildProdFontModuleBravura',
      'webpack:buildProdFontModulePetaluma',
      'webpack:buildProdFontModuleGonville',
      'webpack:buildProdFontModuleCustom',
      'buildESM',
      'buildTypeDeclarations',
      'typedoc',
    ]
  );

  grunt.registerTask('buildTypeDeclarations', 'Use tsc to create *.d.ts files in build/types/', () => {
    grunt.log.writeln('Building *.d.ts files in build/types/');
    child_process.execSync('tsc -p tsconfig.types.json').toString();
  });

  // Outputs ESM module files to build/esm/.
  // Also fixes the imports and exports so that they all end in .js.
  grunt.registerTask('buildESM', 'Use tsc to create ESM JS files in build/esm/', () => {
    grunt.log.writeln('ESM: Build to build/esm/');
    child_process.execSync('tsc -p tsconfig.esm.json');
    grunt.log.writeln('ESM: Fix Imports/Exports');
    child_process.execSync('node ./tools/esm/fix-imports-and-exports.js ./build/esm/');
    // The build/esm/ folder needs a package.json that says "type": "module".
    grunt.log.writeln('ESM: Add package.json with "type": "module"');
    child_process.execSync('cp ./tools/esm/package.json ./build/esm/package.json');
  });

  // `grunt watch`
  grunt.registerTask(
    'watch',
    `Watch src/ & tests/ for changes. Generate dev builds ${VEX_DEBUG} & ${VEX_DEBUG_TESTS}.`, //
    [
      // While developing, you can speed up builds by temporarily commenting out the `eslint` task.
      'clean:build',
      'force:eslint',
      'concurrent:debug',
    ]
  );

  // `grunt watchProduction`
  grunt.registerTask(
    'watchProduction',
    `Watch src/ & tests/ for changes. Generate production builds (vexflow.js and vexflow-core.js).`, //
    [
      // While developing, you can speed up builds by temporarily commenting out the `eslint` task.
      'clean:build',
      'force:eslint',
      'concurrent:production',
    ]
  );

  // `grunt watchDevelop`
  // This is the fastest way to build vexflow-debug-with-tests.js.
  // Open tests/flow.html to see the test output.
  grunt.registerTask(
    'watchDevelop',
    `Watch src/ & tests/ for changes and generate a development build.`, //
    [
      'clean:build', //
      'webpack:watchDebugPlusTests',
    ]
  );

  // `grunt test`
  grunt.registerTask(
    'test',
    'Run qunit tests.', //
    [
      //
      'clean:build',
      'webpack:buildDebugPlusTests',
      'qunit',
    ]
  );

  // `grunt reference` will build the current HEAD revision and copy it to reference/
  // After developing new features or fixing a bug, you can compare the current working tree
  // against the reference with: `npm run test:reference`. See package.json for details.
  grunt.registerTask(
    'reference',
    'Build to reference/.', //
    [
      //
      'clean:reference',
      'clean:build',
      'webpack:buildDebugPlusTests',
      'copy:reference',
    ]
  );
};
