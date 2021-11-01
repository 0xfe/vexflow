/* global module, __dirname, process, require */

const path = require('path');
const webpack = require('webpack');
const child_process = require('child_process');
const InjectPlugin = require('webpack-inject-plugin').default;
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const BASE_DIR = __dirname;
const BUILD_DIR = path.join(BASE_DIR, 'build');
const RELEASES_DIR = path.join(BASE_DIR, 'releases');
const REFERENCE_DIR = path.join(BASE_DIR, 'reference');
const VEXFLOW_JS_FILE = path.join(BUILD_DIR, 'vexflow.js');
const VEXFLOW_MODULE_JS_FILE = path.join(BUILD_DIR, 'vexflow.module.js');

// Wonderful global variables that will be set below.
let PACKAGE_JSON;
let VEXFLOW_VERSION;
let BANNER;
let GIT_COMMIT_HASH;

// Switching the mode from 'development' => 'production' will enable minification, etc.
// See: https://webpack.js.org/configuration/mode/
function webpackConfig(outputFile, chunkFilename, moduleEntry, mode) {
  // Support different ways of loading VexFlow.
  // The `globalObject` string is assigned to `root` in line 15 of vexflow-debug.js.
  // VexFlow is exported as root["Vex"], and can be accessed via:
  //   - `window.Vex` in browsers
  //   - `globalThis.Vex` in node JS >= 12
  //   - `this.Vex` in all other environments
  // See: https://webpack.js.org/configuration/output/#outputglobalobject
  let globalObject = `typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this`;
  // However, the globalObject approach currently breaks the lazy loading of fonts.
  // Unset the globalObject if we are doing lazy loading with webpack.
  if (chunkFilename !== undefined) {
    globalObject = undefined;
  }

  return {
    mode: mode,
    entry: moduleEntry,
    output: {
      path: BUILD_DIR,
      filename: outputFile,
      chunkFilename: chunkFilename,
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
    devtool: process.env.VEX_GENMAP || mode === 'production' ? 'source-map' : false,
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
        new TerserPlugin({
          // Tell webpack 5 to NOT extract the banner into a separate file.
          extractComments: false,
        }),
      ],
    },
  };
}

module.exports = (grunt) => {
  // Each output file is associated with a particular module entry file.
  // Also see: package.json's `exports` field for how we map import paths
  // to different build files in the published npm package.
  const MODULE_ENTRIES = {
    vexflow: 'allFonts.ts',
    vexflow_core: 'zeroFonts.ts',
    vexflow_core_plus_bravura: 'withBravura.ts',
    vexflow_core_plus_gonville: 'withGonville.ts',
    vexflow_core_plus_petaluma: 'withPetaluma.ts',
    vexflow_debug: 'debug.ts',
    vexflow_debug_plus_tests: 'debugWithTests.ts',
  };
  // Turn the file names into full paths.
  // For example: vexflow_core_plus_bravura => vexflow/src/entry/withPetaluma.ts
  for (const [moduleName, entryFileName] of Object.entries(MODULE_ENTRIES)) {
    const fullPath = path.join(BASE_DIR, 'src/entry/', entryFileName);
    MODULE_ENTRIES[moduleName] = fullPath;
  }

  // Get current build information from git and package.json.
  GIT_COMMIT_HASH = child_process.execSync('git rev-parse HEAD').toString().trim();
  PACKAGE_JSON = grunt.file.readJSON('package.json');
  VEXFLOW_VERSION = PACKAGE_JSON.version;
  BANNER =
    `VexFlow ${VEXFLOW_VERSION}   ${new Date().toISOString()}   ${GIT_COMMIT_HASH}\n` +
    `Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>\n` +
    `https://www.vexflow.com   https://github.com/0xfe/vexflow`;

  // We need a different webpack config for each build target.
  const webpackConfigProdAllFonts = webpackConfig(
    'vexflow.js',
    undefined /* chunkFileName */,
    MODULE_ENTRIES.vexflow,
    'production'
  );
  const webpackConfigProdNoFonts = webpackConfig(
    'vexflow-core.js',
    'vexflow-font-[name].js',
    MODULE_ENTRIES.vexflow_core,
    'production'
  );
  const webpackConfigProdBravuraOnly = webpackConfig(
    'vexflow-core-plus-bravura.js',
    'vexflow-font-[name].js',
    MODULE_ENTRIES.vexflow_core_plus_bravura,
    'production'
  );
  const webpackConfigProdGonvilleOnly = webpackConfig(
    'vexflow-core-plus-gonville.js',
    'vexflow-font-[name].js',
    MODULE_ENTRIES.vexflow_core_plus_gonville,
    'production'
  );
  const webpackConfigProdPetalumaOnly = webpackConfig(
    'vexflow-core-plus-petaluma.js',
    'vexflow-font-[name].js',
    MODULE_ENTRIES.vexflow_core_plus_petaluma,
    'production'
  );
  // The webpack configs below specify 'development' mode, which disables code minification.
  const webpackConfigDebug = webpackConfig(
    'vexflow-debug.js',
    undefined /* chunkFileName */,
    MODULE_ENTRIES.vexflow_debug,
    'development'
  );
  const webpackConfigDebugWatch = {
    ...webpackConfigDebug,
    watch: true,
    keepalive: true,
  };
  const webpackConfigDebugPlusTests = webpackConfig(
    'vexflow-debug-plus-tests.js',
    undefined /* chunkFileName */,
    MODULE_ENTRIES.vexflow_debug_plus_tests,
    'development'
  );
  const webpackConfigDebugPlusTestsWatch = {
    ...webpackConfigDebugPlusTests,
    watch: true,
    keepalive: true,
  };
  const webpackConfigDebugNoFonts = webpackConfig(
    'vexflow-core.js',
    'vexflow-font-[name].js',
    MODULE_ENTRIES.vexflow_core,
    'development'
  );
  const webpackConfigDebugNoFontsWatch = {
    ...webpackConfigDebugNoFonts,
    watch: true,
    keepalive: true,
  };

  grunt.initConfig({
    pkg: PACKAGE_JSON,
    webpack: {
      buildProdAllFonts: webpackConfigProdAllFonts,
      buildProdNoFonts: webpackConfigProdNoFonts,
      buildProdBravuraOnly: webpackConfigProdBravuraOnly,
      buildProdGonvilleOnly: webpackConfigProdGonvilleOnly,
      buildProdPetalumaOnly: webpackConfigProdPetalumaOnly,
      buildDebug: webpackConfigDebug,
      buildDebugPlusTests: webpackConfigDebugPlusTests,
      watchDebug: webpackConfigDebugWatch,
      watchDebugPlusTests: webpackConfigDebugPlusTestsWatch,
      watchDebugNoFonts: webpackConfigDebugNoFontsWatch,
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
      // copy the vexflow.js production build to vexflow.module.js
      module: {
        src: VEXFLOW_JS_FILE,
        dest: VEXFLOW_MODULE_JS_FILE,
        options: {
          process: function (content, srcpath) {
            // Insert the export line BEFORE the source map comment.
            const srcMapLinePrefix = '//# sourceMappingURL';
            const exportVex = 'export default Vex;\n';
            return content.replace(srcMapLinePrefix, exportVex + srcMapLinePrefix);
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
    clean: [BUILD_DIR],
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
  // This might take a while...... :-)
  grunt.registerTask(
    'default',
    'Build VexFlow', //
    [
      'clean',
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
      // TODO: delete build/types/typedoc.d.ts
      // TODO: delete build/types/src/entry/*.d.ts
    ]
  );

  // `grunt watch`
  grunt.registerTask(
    'watch',
    'Watch src/ & tests/ for changes. Generate dev builds (vexflow-debug.js / vexflow-debug-plus-tests.js).', //
    ['clean', 'force:eslint', 'concurrent:debug']
  );

  // `grunt watch:core`
  grunt.registerTask(
    'watch:core',
    'Watch src/ for changes. Generate non-minified vexflow-core.js and fonts.', //
    ['clean', 'force:eslint', 'concurrent:core']
  );

  // `grunt test`
  grunt.registerTask(
    'test',
    'Run qunit tests.', //
    ['clean', 'webpack:buildDebugPlusTests', 'qunit']
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
