/* global module, __dirname, process, require */

const path = require('path');
const webpack = require('webpack');
const child_process = require('child_process');
const InjectPlugin = require('webpack-inject-plugin').default;
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = (grunt) => {
  const BASE_DIR = __dirname;
  const BUILD_DIR = path.join(BASE_DIR, 'build');
  const RELEASE_DIR = path.join(BASE_DIR, 'releases');
  const REFERENCE_DIR = path.join(BASE_DIR, 'reference');
  const MODULE_ENTRY_SRC = path.join(BASE_DIR, 'src/index.ts');
  const MODULE_ENTRY_TESTS = path.join(BASE_DIR, 'tests/run.ts');

  // Get current build information from git and package.json.
  const GIT_COMMIT_HASH = child_process.execSync('git rev-parse HEAD').toString().trim();
  const packageJSON = grunt.file.readJSON('package.json');
  const BANNER =
    `VexFlow ${packageJSON.version}   ${new Date().toISOString()}   ${GIT_COMMIT_HASH}\n` +
    `Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>\n` +
    `https://www.vexflow.com   https://github.com/0xfe/vexflow`;

  // Used for eslint
  const SOURCES = ['./src/*.ts', './src/*.js'];

  // Switching the mode from 'development' => 'production' will enable minification, etc.
  // See: https://webpack.js.org/configuration/mode/
  function webpackConfig(outputFile, chunkFilename, tsconfig, moduleEntry, mode) {
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
        plugins: [new TsconfigPathsPlugin({ configFile: tsconfig })],
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
                options: {
                  configFile: tsconfig,
                },
              },
            ],
          },
        ],
      },
      plugins: [
        // Add VERSION and BUILD properties to Vex.Flow.
        new InjectPlugin(function () {
          return `import{Flow}from'flow';Flow.VERSION="${packageJSON.version}";Flow.BUILD="${GIT_COMMIT_HASH}";`;
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

  const webpackProdStatic = webpackConfig(
    'vexflow.js',
    undefined /* chunkFileName */,
    'tsconfig.json',
    MODULE_ENTRY_SRC,
    'production'
  );
  const webpackProdDynamic = webpackConfig(
    'vexflow-core.js',
    'vexflow-font-[name].js',
    'tsconfig.dynamic.json',
    MODULE_ENTRY_SRC,
    'production'
  );
  const webpackDevStatic = webpackConfig(
    'vexflow.js',
    undefined /* chunkFileName */,
    'tsconfig.json',
    MODULE_ENTRY_SRC,
    'development'
  );
  const webpackDevDynamic = webpackConfig(
    'vexflow-core.js',
    'vexflow-font-[name].js',
    'tsconfig.dynamic.json',
    MODULE_ENTRY_SRC,
    'development'
  );
  const webpackDev = webpackConfig(
    'vexflow-debug.js',
    undefined /* chunkFileName */,
    'tsconfig.json',
    MODULE_ENTRY_SRC,
    'development'
  );
  const webpackTest = webpackConfig(
    'vexflow-tests.js',
    undefined /* chunkFileName */,
    'tsconfig.json',
    MODULE_ENTRY_TESTS,
    'development'
  );

  const watchOptions = {
    watch: true,
    keepalive: true,
    ignored: /node_modules/,
  };

  grunt.initConfig({
    pkg: packageJSON,
    webpack: {
      buildDev: webpackDev,
      buildTest: webpackTest,
      buildStatic: webpackProdStatic,
      buildDynamic: webpackProdDynamic,
      watchDev: {
        ...webpackDev,
        ...watchOptions,
      },
      watchTest: {
        ...webpackTest,
        ...watchOptions,
      },
      watchStatic: {
        ...webpackDevStatic,
        ...watchOptions,
      },
      watchDynamic: {
        ...webpackDevDynamic,
        ...watchOptions,
      },
    },
    concurrent: {
      options: {
        logConcurrentOutput: true,
        indent: false,
      },
      dev: ['webpack:watchDev', 'webpack:watchTest'],
      static: ['webpack:watchStatic'],
      dynamic: ['webpack:watchDynamic'],
      staticAndDynamic: ['webpack:watchStatic', 'webpack:watchDynamic'],
    },
    eslint: {
      target: SOURCES.concat('./tests'),
      options: { fix: true },
    },
    qunit: {
      files: ['tests/flow-headless-browser.html'],
    },
    copy: {
      // copy the vexflow.js production build to vexflow.module.js
      module: {
        src: path.join(BUILD_DIR, 'vexflow.js'),
        dest: path.join(BUILD_DIR, 'vexflow.module.js'),
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
            dest: RELEASE_DIR,
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
            src: [`${RELEASE_DIR}/*.js`, `${RELEASE_DIR}/*.map`],
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
  grunt.registerTask(
    'default',
    'Build VexFlow', //
    [
      'clean',
      'eslint',
      'webpack:buildDev',
      'webpack:buildTest',
      'webpack:buildStatic',
      'webpack:buildDynamic',
      'copy:module',
      'typedoc',
    ]
  );

  // `grunt watch`
  grunt.registerTask(
    'watch',
    'Watch src/ & tests/ for changes. Generate dev builds.', //
    ['clean', 'force:eslint', 'concurrent:dev']
  );

  // `grunt watch:static`
  grunt.registerTask(
    'watch:static',
    'Watch src/ for changes. Generate dev builds for pre-loaded fonts.', //
    ['clean', 'force:eslint', 'concurrent:static']
  );

  // `grunt watch:dynamic`
  grunt.registerTask(
    'watch:dynamic',
    'Watch src/ for changes. Generate dev builds for dynamically loaded fonts.', //
    ['clean', 'force:eslint', 'concurrent:dynamic']
  );

  // `grunt watch:staticAndDynamic`
  grunt.registerTask(
    'watch:staticAndDynamic',
    'Watch src/ for changes.', //
    ['clean', 'force:eslint', 'concurrent:staticAndDynamic']
  );

  // `grunt test`
  grunt.registerTask(
    'test',
    'Run qunit tests.', //
    ['clean', 'webpack:buildDev', 'webpack:buildTest', 'qunit']
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
