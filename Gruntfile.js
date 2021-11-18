/* global module, __dirname, process, require */

const path = require('path');
const webpack = require('webpack');
const child_process = require('child_process');
const TerserPlugin = require('terser-webpack-plugin');

// A module entry file `entry/xxxx.ts` will be mapped to a build output file `build/xxxx.js`.
// Also see the package.json `exports` field, which is one way for projects to specify which entry file to import.
const VEX = 'vexflow';
const VEX_CORE = 'vexflow-core';
const VEX_CORE_BRAVURA = 'vexflow-core-with-bravura';
const VEX_CORE_GONVILLE = 'vexflow-core-with-gonville';
const VEX_CORE_PETALUMA = 'vexflow-core-with-petaluma';
const VEX_DEBUG = 'vexflow-debug';
const VEX_DEBUG_TESTS = 'vexflow-debug-with-tests';

// Output directories.
const BASE_DIR = __dirname;
const BUILD_DIR = path.join(BASE_DIR, 'build');
const BUILD_CJS_DIR = path.join(BUILD_DIR, 'cjs');
const BUILD_ESM_DIR = path.join(BUILD_DIR, 'esm');
const RELEASES_DIR = path.join(BASE_DIR, 'releases');
const REFERENCE_DIR = path.join(BASE_DIR, 'reference');

// Make the src/version.ts file.
const VERSION_FILE = path.join(BASE_DIR, 'src/version.ts');
child_process.execSync(`node ./tools/generate_version_file.js ${VERSION_FILE}`);

// Global variable that will be set below.
let BANNER;

// PRODUCTION_MODE will enable minification, etc.
// See: https://webpack.js.org/configuration/mode/
const PRODUCTION_MODE = 'production';
const DEVELOPMENT_MODE = 'development';

const CODE_SPLITTING = 'split';
const SINGLE_BUNDLE = 'single';

/**
 * @returns a webpack config object. Default to PRODUCTION_MODE unless you specify DEVELOPMENT_MODE.
 */
function getConfig(file, bundleStrategy = SINGLE_BUNDLE, mode = PRODUCTION_MODE) {
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

  let chunkFilename = undefined;
  let publicPath = 'auto';
  if (bundleStrategy === CODE_SPLITTING) {
    // Font files for dynamic import. See: webpackChunkName in async.ts
    chunkFilename = 'vexflow-font-[name].js';

    // See: https://webpack.js.org/guides/public-path/
    // There is no setting for publicPath that works for all use cases.
    // In some scenarios, it needs to be './' to work, but in others it needs to be 'auto' to work.
    // Customize the publicPath to work with your production environment.
    publicPath = './';

    // The chunks will be loaded from the same URL as the webpage.
    // demos/fonts/core.html fails.
    // publicPath = '';

    // demos/node/canvas.js fails with:
    //   Error: Automatic publicPath is not supported in this browser
    // undefined and `auto` are equivalent.
    // publicPath = 'auto';
    // publicPath = undefined;
  }

  // https://webpack.js.org/configuration/devtool/
  const devtool = process.env.VEX_GENMAP || mode === PRODUCTION_MODE ? undefined : 'eval';

  return {
    mode: mode,
    entry: entry,
    output: {
      path: BUILD_CJS_DIR,
      filename: outputFilename,
      chunkFilename: chunkFilename,
      library: {
        name: 'Vex',
        type: 'umd',
        export: 'default',
      },
      globalObject: globalObject,
      publicPath: publicPath,
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
    plugins: [
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
  // Get current build information from package.json and git.
  const PACKAGE_JSON = grunt.file.readJSON('package.json');
  const VEXFLOW_VERSION = PACKAGE_JSON.version;
  const GIT_COMMIT_HASH = child_process.execSync('git rev-parse HEAD').toString().trim();
  BANNER =
    `VexFlow ${VEXFLOW_VERSION}   ${new Date().toISOString()}   ${GIT_COMMIT_HASH}\n` +
    `Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>\n` +
    `https://www.vexflow.com   https://github.com/0xfe/vexflow`;

  // We need a different webpack config for each build target.
  const prodAllFonts = getConfig(VEX, SINGLE_BUNDLE);
  const prodNoFonts = getConfig(VEX_CORE, CODE_SPLITTING);
  const prodBravuraOnly = getConfig(VEX_CORE_BRAVURA, CODE_SPLITTING);
  const prodGonvilleOnly = getConfig(VEX_CORE_GONVILLE, CODE_SPLITTING);
  const prodPetalumaOnly = getConfig(VEX_CORE_PETALUMA, CODE_SPLITTING);
  // The webpack configs below specify DEVELOPMENT_MODE, which disables code minification.
  const debugAllFonts = getConfig(VEX_DEBUG, SINGLE_BUNDLE, DEVELOPMENT_MODE);
  const debugAllFontsWithTests = getConfig(VEX_DEBUG_TESTS, SINGLE_BUNDLE, DEVELOPMENT_MODE);
  const debugNoFonts = getConfig(VEX_CORE, CODE_SPLITTING, DEVELOPMENT_MODE);

  // See: https://webpack.js.org/configuration/watch/#watchoptionsignored
  const watch = {
    watch: true,
    watchOptions: {
      aggregateTimeout: 600 /* ms */,
      ignored: ['**/node_modules'],
    },
  };

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
      // The build/esm/ folder needs a package.json that says "type": "module".
      modulePackageJSON: {
        expand: true,
        cwd: BASE_DIR,
        src: ['tools/esm/package.json'],
        dest: BUILD_ESM_DIR,
        flatten: true,
      },
      release: {
        files: [
          {
            expand: true,
            cwd: BUILD_DIR,
            src: ['*.js', 'docs/**', '*.map'],
            dest: RELEASES_DIR,
          },
        ],
      },
      reference: {
        files: [
          {
            expand: true,
            cwd: BUILD_DIR,
            src: ['*.js', 'docs/**', '*.map'],
            dest: REFERENCE_DIR,
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
        src: ['./src/index.ts'],
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
      'buildESM',
      'copy:modulePackageJSON',
      'buildTypeDeclarations',
      'typedoc',
    ]
  );

  grunt.registerTask('buildTypeDeclarations', 'Use tsc to create *.d.ts files in build/types/', () => {
    grunt.log.writeln('Building *.d.ts files in build/types/');
    const results = child_process.execSync('tsc -p tsconfig.types.json').toString();
    grunt.log.writeln(results);
  });

  // Outputs ESM module files to build/esm/.
  // Also fixes the imports and exports so that they all end in .js.
  grunt.registerTask('buildESM', 'Use tsc to create ESM JS files in build/esm/', () => {
    grunt.log.writeln('ESM: Building to build/esm/');
    const outputTSC = child_process.execSync('tsc -p tsconfig.esm.json').toString();
    grunt.log.writeln(outputTSC);

    grunt.log.writeln('ESM: Fixing Imports/Exports');
    const outputFix = child_process.execSync('node ./tools/esm/fix-imports-and-exports.js ./build/esm/').toString();
    grunt.log.writeln(outputFix);
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
      'default',
      'qunit',
      'copy:reference',
    ]
  );

  // Release current build.
  grunt.registerTask(
    'stage',
    'Build to releases/.', //
    [
      //
      'default',
      'qunit',
      'copy:release',
    ]
  );

  // Increment package version and generate releases. Does NOT automatically publish to NPM.
  grunt.registerTask(
    'publish',
    'Generate releases.', //
    [
      //
      'bump',
      'stage',
      'gitcommit:releases',
      'release',
      'alldone',
    ]
  );

  grunt.registerTask('alldone', 'Publish VexFlow NPM.', () => {
    grunt.log.ok('NOT YET DONE: Run `npm publish` now to publish NPM.');
  });
};
