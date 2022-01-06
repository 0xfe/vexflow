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
const fs = require('fs');
const http = require('http');
const webpack = require('webpack');
const { execSync, spawn } = require('child_process');
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

// While developing, you can speed up builds by temporarily commenting out one of the tasks below.
const debugTargets = [
  'webpack:buildDebug', // CJS debug library: vexflow-debug.js
  'webpack:buildDebugWithTests', // CJS debug library: vexflow-debug-with-tests.js
];
// While developing, you can speed up builds by temporarily commenting out one of the tasks below.
const productionTargets = [
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
const allTargets = [
  ...debugTargets,
  ...productionTargets,
  'build:esm', // ESM outputs individual JS files to vexflow/build/esm/.
];

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

  const PACKAGE_JSON = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: PACKAGE_JSON,
    webpack: {
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
    },
    concurrent: {
      options: {
        logConcurrentOutput: true,
        indent: true,
      },
      debug: [...debugTargets],
      production: [...productionTargets],
    },
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

  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-force-task');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-typedoc');
  grunt.loadNpmTasks('grunt-webpack');

  // Default tasks that run when you type `grunt`.
  grunt.registerTask(
    'default',
    'Build all vexflow targets.', //
    [
      //
      'clean:build',
      'eslint',
      ...allTargets,
      'build:typedeclarations',
      'typedoc',
    ]
  );

  // Outputs ESM module files to build/esm/.
  // Also fixes the imports and exports so that they all end in .js.
  grunt.registerTask('build:esm', 'Use tsc to create ESM JS files in build/esm/', () => {
    grunt.log.writeln('ESM: Build to build/esm/');
    execSync('tsc -p tsconfig.esm.json');
    grunt.log.writeln('ESM: Fix Imports/Exports');
    execSync('node ./tools/esm/fix-imports-and-exports.js ./build/esm/');
    // The build/esm/ folder needs a package.json that says "type": "module".
    grunt.log.writeln('ESM: Add package.json with "type": "module"');
    execSync('cp ./tools/esm/package.json ./build/esm/package.json');
  });

  grunt.registerTask('build:typedeclarations', 'Use tsc to create *.d.ts files in build/types/', () => {
    grunt.log.writeln('Building *.d.ts files in build/types/');
    execSync('tsc -p tsconfig.types.json');
  });

  const filesToWatch = ['src/**', 'tests/**', '!src/version.ts'];

  grunt.registerTask(
    'watch:dev',
    `Watch src/ & tests/ for changes. Generate dev builds ${VEX_DEBUG}.js & ${VEX_DEBUG_TESTS}.js.`,
    () => {
      const config = {
        options: {
          interrupt: true,
        },
        files: filesToWatch,
        tasks: [
          // While developing, you can speed up builds by temporarily commenting out the `force:eslint` task.
          // Use the force: to prevent eslint errors from killing the watch task.
          'clean:build',
          'force:eslint',
          'concurrent:debug',
        ],
      };
      grunt.config('watch', config);
      grunt.task.run('watch');
    }
  );

  grunt.registerTask(
    'watch:production',
    `Watch src/ & tests/ for changes. Generate production builds (${VEX}.js, ${VEX_CORE}.js, ...).`,
    () => {
      const config = {
        options: {
          interrupt: true,
        },
        files: filesToWatch,
        tasks: [
          // While developing, you can speed up builds by temporarily commenting out the `force:eslint` task.
          // Use the force: to prevent eslint errors from killing the watch task.
          'clean:build',
          'force:eslint',
          'concurrent:production',
        ],
      };
      grunt.config('watch', config);
      grunt.task.run('watch');
    }
  );

  // `grunt watch:dev:cjs`
  // This is the fastest way to watch & build vexflow-debug-with-tests.js.
  // Open tests/flow.html to see the test output.
  grunt.registerTask(
    'watch:dev:cjs',
    `Watch src/ & tests/ for changes. Generate CJS dev build ${VEX_DEBUG_TESTS}.js as fast as possible.`,
    ['webpack:buildDebugWithTests']
  );

  // `grunt watch:dev:esm`
  // This is the fastest way to watch & build the ESM target.
  // Open http://localhost:8080/tests/flow.html?esm=true to see the test output.
  grunt.registerTask(
    'watch:dev:esm',
    `Watch src/ & tests/ for changes. Generate ESM dev build in build/esm/ as fast as possible.`,
    ['build:esm']
  );

  // `grunt test`
  // Runs the command line qunit tests.
  grunt.registerTask(
    'test',
    'Run qunit tests.', //
    [
      //
      'clean:build',
      'eslint',
      ...allTargets,
      'qunit',
    ]
  );

  // `grunt test:browser:cjs`
  // Opens the default browser to the flow.html test page.
  grunt.registerTask(
    'test:browser:cjs',
    'Test the CJS build by loading the flow.html file in the default browser.', //
    () => {
      // If the CJS build doesn't exist, build it.
      if (!fs.existsSync(BUILD_CJS_DIR)) {
        grunt.task.run([...allTargets]);
        grunt.log.write('Build the CJS files.');
      } else {
        grunt.log.write('CJS files already exist. Skipping the build step.');
      }
      grunt.task.run(['open:flow_html']);
    }
  );

  // `grunt test:browser:esm`
  // Requres a web server to be running.
  // Opens the default browser to the flow.html test page with the query param esm=true.
  grunt.registerTask(
    'test:browser:esm',
    'Test the ESM build in a web server by navigating to http://localhost:8080/tests/flow.html?esm=true',
    () => {
      // If the ESM build doesn't exist, build it.
      if (!fs.existsSync(BUILD_ESM_DIR)) {
        grunt.task.run('build:esm');
        grunt.log.writeln('Build the ESM files.');
      } else {
        grunt.log.writeln('ESM files already exist. Skipping the build step.');
      }
      grunt.task.run('open:flow_localhost');
      grunt.log.writeln('Remember to launch http-server!');
      grunt.log.writeln('npx http-server');
    }
  );

  // `grunt reference` will build the current HEAD revision and copy it to reference/
  // After developing new features or fixing a bug, you can compare the current working tree
  // against the reference with: `npm run test:reference`. See package.json for details.
  grunt.registerTask(
    'reference',
    'Build to reference/.', //
    [
      //
      'clean',
      ...allTargets,
      'copy:reference',
    ]
  );
};
