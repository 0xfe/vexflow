const path = require('path');

module.exports = (grunt) => {
  const BANNER = [
    '/**',
    ' * VexFlow <%= pkg.version %> built on <%= grunt.template.today("yyyy-mm-dd") %>.',
    ' * Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>',
    ' *',
    ' * http://www.vexflow.com  http://github.com/0xfe/vexflow',
    ' */',
  ].join('\n');
  const BASE_DIR = __dirname;
  const BUILD_DIR = path.join(BASE_DIR, 'build');
  const RELEASE_DIR = path.join(BASE_DIR, 'releases');
  const MODULE_ENTRY = path.join(BASE_DIR, 'src/index.js');
  const TARGET_RAW = 'vexflow-debug.js';
  const TARGET_MIN = 'vexflow-min.js';
  const TARGET_TESTS = path.join(BUILD_DIR, 'vexflow-tests.js');

  const SOURCES = ['src/*.js', '!src/header.js', '!src/container.js'];

  const TEST_SOURCES = [
    'tests/vexflow_test_helpers.js',
    'tests/mocks.js',
    'tests/*_tests.js',
    'tests/run.js',
  ];

  function webpackConfig(target, preset) {
    return {
      mode: 'production',
      entry: MODULE_ENTRY,
      output: {
        path: BUILD_DIR,
        filename: target,
        library: 'Vex',
        libraryTarget: 'umd',
        libraryExport: 'default',
      },
      devtool: 'source-map',
      module: {
        rules: [
          {
            test: /\.js?$/,
            exclude: /(node_modules|bower_components)/,
            use: [{
              loader: 'babel-loader',
              options: {
                presets: [preset],
                plugins: ['@babel/plugin-transform-object-assign'],
              },
            }],
          },
        ],
      },
    };
  }

  const webpackCommon = webpackConfig(TARGET_RAW, ['@babel/preset-env']);

  // Unsupported build for IE versions <11
  const TARGET_LEGACY_RAW = 'vexflow-legacy-debug.js';
  const TARGET_LEGACY_MIN = 'vexflow-legacy-min.js';
  const webpackLegacy = webpackConfig(TARGET_LEGACY_RAW, ['@babel/preset-env', { 'loose': true }]);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        banner: BANNER,
        sourceMap: true,
      },
      tests: {
        src: TEST_SOURCES,
        dest: TARGET_TESTS,
      },
    },
    webpack: {
      build: webpackCommon,
      buildLegacy: webpackLegacy,
      watch: Object.assign({}, webpackCommon, {
        watch: true,
        keepalive: true,
        failOnError: false,
        watchOptions: {
          watchDelay: 0,
        },
      }),
    },
    uglify: {
      options: {
        banner: BANNER,
        sourceMap: true,
      },
      build: {
        files: [
          {
            expand: true,
            cwd: BUILD_DIR,
            src: TARGET_RAW,
            dest: BUILD_DIR,
            rename: function (dst) {
              return path.join(dst, TARGET_MIN);
            }
          }
        ],
      },
      buildLegacy: {
        files: [
          {
            expand: true,
            cwd: BUILD_DIR,
            src: TARGET_LEGACY_RAW,
            dest: BUILD_DIR,
            rename: function (dst) {
              return path.join(dst, TARGET_LEGACY_MIN);
            }
          }
        ],
      },
    },
    eslint: {
      target: SOURCES.concat('./tests'),
    },
    qunit: {
      files: ['tests/flow.html'],
    },
    watch: {
      tests: {
        files: ['tests/*', 'src/*'],
        tasks: ['concat:tests'],
        options: {
          interrupt: true,
        },
      },
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
    },
    docco: {
      src: SOURCES,
      options: {
        layout: 'linear',
        output: 'build/docs',
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
      },
    },
    clean: [BUILD_DIR],
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-webpack');

  // Default task(s).
  grunt.registerTask('default', ['eslint', 'webpack:build', 'concat', 'uglify:build', 'docco']);
  grunt.registerTask('buildLegacy', ['webpack:buildLegacy', 'uglify:buildLegacy']);
  grunt.registerTask('test', 'Run qunit tests.', ['webpack:build', 'concat', 'qunit']);

  // Release current build.
  grunt.registerTask('stage', 'Stage current binaries to releases/.', () => {
    grunt.task.run('default');
    grunt.task.run('buildLegacy');
    grunt.task.run('qunit');
    grunt.task.run('copy:release');
  });

  // Increment package version and publish to NPM.
  grunt.registerTask('publish', 'Publish VexFlow NPM.', () => {
    grunt.task.run('bump');
    grunt.task.run('stage');
    grunt.task.run('gitcommit:releases');
    grunt.task.run('release');
  });
};
