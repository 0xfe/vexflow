/* global module, __dirname, process, require */

const path = require('path');
const webpack = require('webpack');
const child_process = require('child_process');
const InjectPlugin = require('webpack-inject-plugin').default;
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

// Output file names.
const VEX = 'vexflow.js';
const VEX_MODULE = 'vexflow.module.js'; // Same as vexflow.js, except for the `export default Vex;` at the end.
const VEX_CORE = 'vexflow-core.js';
const VEX_CORE_BRAVURA = 'vexflow-core-with-bravura.js';
const VEX_CORE_GONVILLE = 'vexflow-core-with-gonville.js';
const VEX_CORE_PETALUMA = 'vexflow-core-with-petaluma.js';
const VEX_DEBUG = 'vexflow-debug.js';
const VEX_DEBUG_TESTS = 'vexflow-debug-with-tests.js';
const VEX_FONT_CHUNK = 'vexflow-font-[name].js'; // Fonts for dynamic import. See: webpackChunkName in async.ts

// Output directories.
const BASE_DIR = __dirname;
const BUILD_DIR = path.join(BASE_DIR, 'build');
const RELEASES_DIR = path.join(BASE_DIR, 'releases');
const REFERENCE_DIR = path.join(BASE_DIR, 'reference');
const TYPES_DIR = path.join(BUILD_DIR, 'types');

// Each output file above is associated with a particular module entry file.
// The module entry files are in `src/entry/`.
const MODULE_ENTRIES = {
  VEX: 'allFonts.ts',
  // VEX_MODULE: 'allFonts.ts', // For now, we just copy the vexflow.js file (see COPY_VEX_MODULE below).
  VEX_CORE: 'zeroFonts.ts',
  VEX_CORE_BRAVURA: 'withBravura.ts',
  VEX_CORE_GONVILLE: 'withGonville.ts',
  VEX_CORE_PETALUMA: 'withPetaluma.ts',
  VEX_DEBUG: 'allFontsDebug.ts',
  VEX_DEBUG_TESTS: 'allFontsDebugWithTests.ts',
};

// Turn the module entry file names into full paths.
// For example: MODULE_ENTRIES[VEX_CORE_PETALUMA] => vexflow/src/entry/withPetaluma.ts
for (const [moduleName, entryFileName] of Object.entries(MODULE_ENTRIES)) {
  MODULE_ENTRIES[moduleName] = path.join(BASE_DIR, 'src/entry/', entryFileName);
}

// Global variables that will be set below.
let PACKAGE_JSON;
let VEXFLOW_VERSION;
let BANNER;
let GIT_COMMIT_HASH;

// PRODUCTION_MODE will enable minification, etc.
// See: https://webpack.js.org/configuration/mode/
const PRODUCTION_MODE = 'production';
const DEVELOPMENT_MODE = 'development';

/**
 * @returns a webpack config object. Default to PRODUCTION_MODE unless you specify DEVELOPMENT_MODE.
 */
function getConfig(outputFile, moduleEntry, useCodeSplitting = false, mode = PRODUCTION_MODE) {
  // Support different ways of loading VexFlow.
  // The `globalObject` string is assigned to `root` in line 15 of vexflow-debug.js.
  // VexFlow is exported as root["Vex"], and can be accessed via:
  //   - `window.Vex` in browsers
  //   - `globalThis.Vex` in node JS >= 12
  //   - `this.Vex` in all other environments
  // See: https://webpack.js.org/configuration/output/#outputglobalobject
  let globalObject = `typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this`;
  // However, the globalObject approach currently breaks the lazy loading of fonts.
  // Unset the globalObject if we are doing lazy loading / code splitting with webpack.
  let chunkFilename = undefined;
  if (useCodeSplitting) {
    globalObject = undefined;
    chunkFilename = VEX_FONT_CHUNK;
  }

  return {
    mode: mode,
    entry: moduleEntry,
    output: {
      path: BUILD_DIR,
      filename: outputFile,
      chunkFilename,
      library: {
        name: 'Vex',
        type: 'umd',
        export: 'default',
      },
      globalObject: globalObject,
      publicPath: 'auto',
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
      plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })],
    },
    devtool: process.env.VEX_GENMAP || mode === PRODUCTION_MODE ? 'source-map' : false,
    module: {
      rules: [
        {
          test: /(\.ts$|\.js$)/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: { configFile: 'tsconfig.json' },
            },
          ],
        },
      ],
    },
    plugins: [
      // Add VERSION and BUILD properties to Vex.Flow.
      new InjectPlugin(function () {
        return `import{Flow}from'flow';Flow.VERSION="${VEXFLOW_VERSION}";Flow.BUILD="${GIT_COMMIT_HASH}";`;
      }),
      // Add a banner at the top of the file.
      new webpack.BannerPlugin(BANNER),
    ],
    optimization: {
      minimizer: [
        // DO NOT extract the banner into a separate file.
        new TerserPlugin({ extractComments: false }),
      ],
    },
  };
}

module.exports = (grunt) => {
  // Get current build information from git and package.json.
  GIT_COMMIT_HASH = child_process.execSync('git rev-parse HEAD').toString().trim();
  PACKAGE_JSON = grunt.file.readJSON('package.json');
  VEXFLOW_VERSION = PACKAGE_JSON.version;
  BANNER =
    `VexFlow ${VEXFLOW_VERSION}   ${new Date().toISOString()}   ${GIT_COMMIT_HASH}\n` +
    `Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>\n` +
    `https://www.vexflow.com   https://github.com/0xfe/vexflow`;

  // We need a different webpack config for each build target.
  const prodAllFonts = getConfig(VEX, MODULE_ENTRIES.VEX, false);
  const prodNoFonts = getConfig(VEX_CORE, MODULE_ENTRIES.VEX_CORE, true);
  const prodBravuraOnly = getConfig(VEX_CORE_BRAVURA, MODULE_ENTRIES.VEX_CORE_BRAVURA, true);
  const prodGonvilleOnly = getConfig(VEX_CORE_GONVILLE, MODULE_ENTRIES.VEX_CORE_GONVILLE, true);
  const prodPetalumaOnly = getConfig(VEX_CORE_PETALUMA, MODULE_ENTRIES.VEX_CORE_PETALUMA, true);
  // The webpack configs below specify DEVELOPMENT_MODE, which disables code minification.
  const debugAllFonts = getConfig(VEX_DEBUG, MODULE_ENTRIES.VEX_DEBUG, false, DEVELOPMENT_MODE);
  const debugAllFontsWithTests = getConfig(VEX_DEBUG_TESTS, MODULE_ENTRIES.VEX_DEBUG_TESTS, false, DEVELOPMENT_MODE);
  const debugNoFonts = getConfig(VEX_CORE, MODULE_ENTRIES.VEX_CORE, true, DEVELOPMENT_MODE);

  grunt.initConfig({
    pkg: PACKAGE_JSON,
    webpack: {
      buildProdAllFonts: prodAllFonts,
      buildProdNoFonts: prodNoFonts,
      buildProdBravuraOnly: prodBravuraOnly,
      buildProdGonvilleOnly: prodGonvilleOnly,
      buildProdPetalumaOnly: prodPetalumaOnly,
      buildDebug: debugAllFonts,
      buildDebugPlusTests: debugAllFontsWithTests,
      buildDebugNoFonts: debugNoFonts,
      watchDebug: { ...debugAllFonts, watch: true, keepalive: true },
      watchDebugPlusTests: { ...debugAllFontsWithTests, watch: true, keepalive: true },
      watchDebugNoFonts: { ...debugNoFonts, watch: true, keepalive: true },
    },
    concurrent: {
      options: {
        logConcurrentOutput: true,
        indent: false,
      },
      debug: ['webpack:watchDebug', 'webpack:watchDebugPlusTests'],
      core: ['webpack:watchDebugNoFonts'],
    },
    eslint: {
      target: ['./src', './tests'],
      options: { fix: true },
    },
    qunit: {
      files: ['tests/flow-headless-browser.html'],
    },
    copy: {
      // COPY_VEX_MODULE: Copy the vexflow.js to vexflow.module.js and replace the last line.
      module: {
        src: path.join(BUILD_DIR, VEX),
        dest: path.join(BUILD_DIR, VEX_MODULE),
        options: {
          process: (content) => {
            const sourceMapping = '//# sourceMappingURL=vexflow.js.map';
            const exportVex = 'export default Vex;';
            return content.replace(sourceMapping, exportVex);
          },
        },
      },
      release: {
        files: [
          {
            expand: true,
            dest: RELEASES_DIR,
            cwd: BUILD_DIR,
            src: ['*.js', 'docs/**', '*.map'],
          },
        ],
      },
      reference: {
        files: [
          {
            expand: true,
            dest: REFERENCE_DIR,
            cwd: BUILD_DIR,
            src: ['*.js', 'docs/**', '*.map'],
          },
        ],
      },
    },
    typedoc: {
      build: {
        options: {
          out: 'build/docs',
          name: 'vexflow',
          excludeProtected: true,
          excludePrivate: true,
          // exclude: ['./src/entry/*.ts'],
        },
        src: ['./typedoc.ts'],
      },
    },
    gitcommit: {
      releases: {
        options: {
          message: 'Committing release binaries for new version: <%= pkg.version %>',
          verbose: true,
        },
        files: [
          {
            src: [`${RELEASES_DIR}/*.js`, `${RELEASES_DIR}/*.map`],
            expand: true,
          },
        ],
      },
    },
    bump: {
      options: {
        files: ['package.json', 'component.json'],
        commitFiles: ['package.json', 'component.json'],
        updateConfigs: ['pkg'],
        createTag: false,
        push: false,
      },
    },
    release: {
      options: {
        bump: false,
        commit: false,
        npm: false, // Run npm publish by hand
      },
    },
    clean: {
      build: { src: [BUILD_DIR] },
      types: { src: [path.join(TYPES_DIR, 'typedoc.d.ts'), path.join(TYPES_DIR, 'src', 'entry')] },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-typedoc');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-bump');
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
      'webpack:buildProdNoFonts',
      'webpack:buildProdBravuraOnly',
      'webpack:buildProdGonvilleOnly',
      'webpack:buildProdPetalumaOnly',
      'copy:module',
      'typedoc',
      'clean:types',
    ]
  );

  // `grunt watch`
  grunt.registerTask(
    'watch',
    `Watch src/ & tests/ for changes. Generate dev builds ${VEX_DEBUG} & ${VEX_DEBUG_TESTS}.`, //
    ['clean:build', 'force:eslint', 'concurrent:debug']
  );

  // `grunt watch:core`
  grunt.registerTask(
    'watch:core',
    `Watch src/ for changes. Generate dev builds of ${VEX_CORE} and fonts.`, //
    ['clean:build', 'force:eslint', 'concurrent:core']
  );

  // `grunt test`
  grunt.registerTask(
    'test',
    'Run qunit tests.', //
    ['clean:build', 'webpack:buildDebugPlusTests', 'qunit']
  );

  // `grunt reference` will build the current HEAD revision and copy it to reference/
  // After developing new features or fixing a bug, you can compare the current working tree
  // against the reference with: `npm run test:reference`. See package.json for details.
  grunt.registerTask(
    'reference',
    'Build to reference/.', //
    ['default', 'qunit', 'copy:reference']
  );

  // Release current build.
  grunt.registerTask(
    'stage',
    'Build to releases/.', //
    ['default', 'qunit', 'copy:release']
  );

  grunt.registerTask('alldone', 'Publish VexFlow NPM.', () => {
    grunt.log.ok('NOT YET DONE: Run `npm publish` now to publish NPM.');
  });

  // Increment package version and generate releases. Does NOT automatically publish to NPM.
  grunt.registerTask(
    'publish',
    'Generate releases.', //
    ['bump', 'stage', 'gitcommit:releases', 'release', 'alldone']
  );
};
