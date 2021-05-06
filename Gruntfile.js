/* global module, __dirname, process, require */

const path = require('path');
const glob = require('glob');

module.exports = (grunt) => {
  const BANNER = [
    '/**!',
    ' * VexFlow <%= pkg.version %> built on <%= grunt.template.today("yyyy-mm-dd") %>.',
    ' * Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>',
    ' *',
    ' * http://www.vexflow.com  http://github.com/0xfe/vexflow',
    ' */',
  ].join('\n');
  const BASE_DIR = __dirname;
  const BUILD_DIR = path.join(BASE_DIR, 'build');
  const RELEASE_DIR = path.join(BASE_DIR, 'releases');
  const REFERENCE_DIR = path.join(BASE_DIR, 'reference');
  const MODULE_ENTRY = path.join(BASE_DIR, 'src/index.js');
  const TARGET_RAW = 'vexflow-debug.js';
  const TARGET_MIN = 'vexflow-min.js';

  // Used for eslint and docco
  const SOURCES = ['./src/*.ts', './src/*.js', '!./src/header.js'];

  // Take all test files in 'tests/' and build TARGET_TESTS_BROWSER
  const TARGET_TESTS_BROWSER = 'vexflow-tests.js';
  const TEST_SOURCES = [
    './tests/vexflow_test_helpers.js',
    ...['./tests/mocks.js', './tests/*_tests.js', './tests/*_tests.ts'].flatMap((file) => glob.sync(file)),
    './tests/run.js',
  ];

  function webpackConfig(target, moduleEntry, mode, libraryName) {
    return {
      mode: mode,
      entry: moduleEntry,
      output: {
        path: BUILD_DIR,
        filename: target,
        library: libraryName,
        libraryTarget: 'umd',
        libraryExport: 'default',
      },
      resolve: {
        extensions: ['.ts', '.js', '.json'],
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
              },
            ],
          },
        ],
      },
    };
  }

  const webpackProd = webpackConfig(TARGET_MIN, MODULE_ENTRY, 'production', 'Vex');
  const webpackDev = webpackConfig(TARGET_RAW, MODULE_ENTRY, 'development', 'Vex');
  const webpackTest = webpackConfig(TARGET_TESTS_BROWSER, TEST_SOURCES, 'development', 'VFTests');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        banner: BANNER,
        sourceMap: true,
      },
      tests: {
        src: TEST_SOURCES,
        dest: TARGET_TESTS_BROWSER,
      },
    },
    webpack: {
      build: webpackProd,
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
            src: ['*.js', 'docs/**', 'typedocs/**', '*.map'],
          },
        ],
      },
      reference: {
        files: [
          {
            expand: true,
            dest: REFERENCE_DIR,
            cwd: BUILD_DIR,
            src: ['*.js', 'docs/**', 'typedocs/**', '*.map'],
          },
        ],
      },
    },
    docco: {
      src: SOURCES,
      options: {
        layout: 'linear',
        output: 'build/docs',
      },
    },
    typedoc: {
      build: {
        options: {
          out: 'build/typedocs',
          name: 'vexflow',
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

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-typedoc');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-concurrent');

  // Default task(s).
  grunt.registerTask('default', [
    'clean',
    'eslint',
    'webpack:build',
    'webpack:buildDev',
    'webpack:buildTest',
    'docco',
    'typedoc',
  ]);
  grunt.registerTask('watch', 'Watch src/ and tests/ concurrently', ['clean', 'eslint', 'concurrent']);
  grunt.registerTask('test', 'Run qunit tests.', [
    'clean',
    'webpack:build',
    'webpack:buildDev',
    'webpack:buildTest',
    'qunit',
  ]);

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
