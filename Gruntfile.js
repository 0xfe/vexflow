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
    `http://www.vexflow.com   http://github.com/0xfe/vexflow`;

  // Used for eslint
  const SOURCES = ['./src/*.ts', './src/*.js'];

  function webpackConfig(target, chunkFilename, configFile, moduleEntry, mode, libraryName) {
    return {
      mode: mode,
      entry: moduleEntry,
      output: {
        path: BUILD_DIR,
        filename: target,
        chunkFilename: chunkFilename,
        library: libraryName,
        libraryTarget: 'umd',
        libraryExport: 'default',
        globalObject: `typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this`,
        publicPath: 'auto',
      },
      resolve: {
        extensions: ['.ts', '.js', '.json'],
        plugins: [new TsconfigPathsPlugin({ configFile: configFile })],
      },
      devtool: process.env.VEX_GENMAP || mode === 'production' ? 'source-map' : false,
      module: {
        rules: [
          {
            test: /(\.ts?$|\.js?$)/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  configFile: configFile,
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
    'vexflow-full-min.js',
    'vexflow-[name]-min.js',
    'tsconfig.json',
    MODULE_ENTRY_SRC,
    'production',
    'Vex'
  );
  const webpackProdDynamic = webpackConfig(
    'vexflow-core-min.js',
    'vexflow-font-[name]-min.js',
    'tsconfig.dynamic.json',
    MODULE_ENTRY_SRC,
    'production',
    'Vex'
  );
  const webpackDev = webpackConfig(
    'vexflow-debug.js',
    'vexflow-[name]-debug.js',
    'tsconfig.json',
    MODULE_ENTRY_SRC,
    'development',
    'Vex'
  );
  const webpackTest = webpackConfig(
    'vexflow-tests.js',
    'vexflow-[name]-test.js',
    'tsconfig.json',
    MODULE_ENTRY_TESTS,
    'development',
    'Vex' /* Previously VFTests. TODO: Remove this! */
  );

  grunt.initConfig({
    pkg: packageJSON,
    webpack: {
      buildStatic: webpackProdStatic,
      buildDynamic: webpackProdDynamic,
      buildDev: webpackDev,
      buildTest: webpackTest,
      watchDev: {
        ...webpackDev,
        watch: true,
        keepalive: true,
        failOnError: false,
      },
      watchTest: {
        ...webpackTest,
        watch: true,
        keepalive: true,
        failOnError: false,
      },
    },
    concurrent: {
      options: {
        logConcurrentOutput: true,
      },
      tasks: ['webpack:watchDev', 'webpack:watchTest'],
    },
    eslint: {
      target: SOURCES.concat('./tests'),
      options: { fix: true },
    },
    qunit: {
      files: ['tests/flow.html'],
    },
    copy: {
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

  // Default tasks that run when you type `grunt`.
  grunt.registerTask('default', [
    'clean',
    'eslint',
    'webpack:buildStatic',
    'webpack:buildDynamic',
    'webpack:buildDev',
    'webpack:buildTest',
    'typedoc',
  ]);

  grunt.registerTask('watch', 'Watch src/ and tests/ concurrently', ['clean', 'eslint', 'concurrent']);

  grunt.registerTask('test', 'Run qunit tests.', ['clean', 'webpack:buildDev', 'webpack:buildTest', 'qunit']);

  // Release current build.
  grunt.registerTask('stage', 'Stage current bundles to releases/.', () => {
    grunt.task.run('default');
    grunt.task.run('qunit');
    grunt.task.run('copy:release');
  });

  // Release current build.
  grunt.registerTask('reference', 'Stage current bundles to reference/.', () => {
    grunt.task.run('default');
    grunt.task.run('qunit');
    grunt.task.run('copy:reference');
  });

  grunt.registerTask('alldone', 'Publish VexFlow NPM.', () => {
    grunt.log.ok('NOT YET DONE: Run `npm publish` now to publish NPM.');
  });

  // Increment package version generate releases
  grunt.registerTask('publish', 'Generate releases.', ['bump', 'stage', 'gitcommit:releases', 'release', 'alldone']);
};
