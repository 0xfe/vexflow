"use strict";
/*!
 * QUnit 1.19.0
 * http://qunitjs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-09-01T15:00Z
 */
(function (global) {
    var QUnit = {};
    var Date = global.Date;
    var now = Date.now ||
        function () {
            return new Date().getTime();
        };
    var setTimeout = global.setTimeout;
    var clearTimeout = global.clearTimeout;
    var window = global.window;
    var defined = {
        document: window && window.document !== undefined,
        setTimeout: setTimeout !== undefined,
        sessionStorage: (function () {
            var x = 'qunit-test-string';
            try {
                sessionStorage.setItem(x, x);
                sessionStorage.removeItem(x);
                return true;
            }
            catch (e) {
                return false;
            }
        })(),
    };
    var fileName = (sourceFromStacktrace(0) || '').replace(/(:\d+)+\)?/, '').replace(/.+\//, '');
    var globalStartCalled = false;
    var runStarted = false;
    var toString = Object.prototype.toString, hasOwn = Object.prototype.hasOwnProperty;
    function diff(a, b) {
        var i, j, result = a.slice();
        for (i = 0; i < result.length; i++) {
            for (j = 0; j < b.length; j++) {
                if (result[i] === b[j]) {
                    result.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
        return result;
    }
    function inArray(elem, array) {
        if (array.indexOf) {
            return array.indexOf(elem);
        }
        for (var i = 0, length = array.length; i < length; i++) {
            if (array[i] === elem) {
                return i;
            }
        }
        return -1;
    }
    function objectValues(obj) {
        var key, val, vals = QUnit.is('array', obj) ? [] : {};
        for (key in obj) {
            if (hasOwn.call(obj, key)) {
                val = obj[key];
                vals[key] = val === Object(val) ? objectValues(val) : val;
            }
        }
        return vals;
    }
    function extend(a, b, undefOnly) {
        for (var prop in b) {
            if (hasOwn.call(b, prop)) {
                if (prop !== 'constructor' || a !== global) {
                    if (b[prop] === undefined) {
                        delete a[prop];
                    }
                    else if (!(undefOnly && typeof a[prop] !== 'undefined')) {
                        a[prop] = b[prop];
                    }
                }
            }
        }
        return a;
    }
    function objectType(obj) {
        if (typeof obj === 'undefined') {
            return 'undefined';
        }
        if (obj === null) {
            return 'null';
        }
        var match = toString.call(obj).match(/^\[object\s(.*)\]$/), type = (match && match[1]) || '';
        switch (type) {
            case 'Number':
                if (isNaN(obj)) {
                    return 'nan';
                }
                return 'number';
            case 'String':
            case 'Boolean':
            case 'Array':
            case 'Set':
            case 'Map':
            case 'Date':
            case 'RegExp':
            case 'Function':
                return type.toLowerCase();
        }
        if (typeof obj === 'object') {
            return 'object';
        }
        return undefined;
    }
    function is(type, obj) {
        return QUnit.objectType(obj) === type;
    }
    var getUrlParams = function () {
        var i, current;
        var urlParams = {};
        var location = window.location;
        var params = location.search.slice(1).split('&');
        var length = params.length;
        if (params[0]) {
            for (i = 0; i < length; i++) {
                current = params[i].split('=');
                current[0] = decodeURIComponent(current[0]);
                current[1] = current[1] ? decodeURIComponent(current[1]) : true;
                if (urlParams[current[0]]) {
                    urlParams[current[0]] = [].concat(urlParams[current[0]], current[1]);
                }
                else {
                    urlParams[current[0]] = current[1];
                }
            }
        }
        return urlParams;
    };
    function extractStacktrace(e, offset) {
        offset = offset === undefined ? 4 : offset;
        var stack, include, i;
        if (e.stack) {
            stack = e.stack.split('\n');
            if (/^error$/i.test(stack[0])) {
                stack.shift();
            }
            if (fileName) {
                include = [];
                for (i = offset; i < stack.length; i++) {
                    if (stack[i].indexOf(fileName) !== -1) {
                        break;
                    }
                    include.push(stack[i]);
                }
                if (include.length) {
                    return include.join('\n');
                }
            }
            return stack[offset];
        }
        else if (e.sourceURL) {
            if (/qunit.js$/.test(e.sourceURL)) {
                return;
            }
            return e.sourceURL + ':' + e.line;
        }
    }
    function sourceFromStacktrace(offset) {
        var error = new Error();
        if (!error.stack) {
            try {
                throw error;
            }
            catch (err) {
                error = err;
            }
        }
        return extractStacktrace(error, offset);
    }
    var config = {
        queue: [],
        blocking: true,
        reorder: true,
        altertitle: true,
        scrolltop: true,
        maxDepth: 5,
        requireExpects: false,
        urlConfig: [
            {
                id: 'hidepassed',
                label: 'Hide passed tests',
                tooltip: 'Only show tests and assertions that fail. Stored as query-strings.',
            },
            {
                id: 'noglobals',
                label: 'Check for Globals',
                tooltip: 'Enabling this will test if any test introduces new properties on the ' +
                    'global object (`window` in Browsers). Stored as query-strings.',
            },
            {
                id: 'notrycatch',
                label: 'No try-catch',
                tooltip: 'Enabling this will run tests outside of a try-catch block. Makes debugging ' +
                    'exceptions in IE reasonable. Stored as query-strings.',
            },
        ],
        modules: [],
        currentModule: {
            name: '',
            tests: [],
        },
        callbacks: {},
    };
    var urlParams = defined.document ? getUrlParams() : {};
    config.modules.push(config.currentModule);
    if (urlParams.filter === true) {
        delete urlParams.filter;
    }
    config.filter = urlParams.filter;
    config.testId = [];
    if (urlParams.testId) {
        urlParams.testId = decodeURIComponent(urlParams.testId).split(',');
        for (var i = 0; i < urlParams.testId.length; i++) {
            config.testId.push(urlParams.testId[i]);
        }
    }
    var loggingCallbacks = {};
    function registerLoggingCallbacks(obj) {
        var i, l, key, callbackNames = ['begin', 'done', 'log', 'testStart', 'testDone', 'moduleStart', 'moduleDone'];
        function registerLoggingCallback(key) {
            var loggingCallback = function (callback) {
                if (objectType(callback) !== 'function') {
                    throw new Error('QUnit logging methods require a callback function as their first parameters.');
                }
                config.callbacks[key].push(callback);
            };
            loggingCallbacks[key] = loggingCallback;
            return loggingCallback;
        }
        for (i = 0, l = callbackNames.length; i < l; i++) {
            key = callbackNames[i];
            if (objectType(config.callbacks[key]) === 'undefined') {
                config.callbacks[key] = [];
            }
            obj[key] = registerLoggingCallback(key);
        }
    }
    function runLoggingCallbacks(key, args) {
        var i, l, callbacks;
        callbacks = config.callbacks[key];
        for (i = 0, l = callbacks.length; i < l; i++) {
            callbacks[i](args);
        }
    }
    function verifyLoggingCallbacks() {
        var loggingCallback, userCallback;
        for (loggingCallback in loggingCallbacks) {
            if (QUnit[loggingCallback] !== loggingCallbacks[loggingCallback]) {
                userCallback = QUnit[loggingCallback];
                QUnit[loggingCallback] = loggingCallbacks[loggingCallback];
                QUnit[loggingCallback](userCallback);
                if (global.console && global.console.warn) {
                    global.console.warn('QUnit.' +
                        loggingCallback +
                        ' was replaced with a new value.\n' +
                        'Please, check out the documentation on how to apply logging callbacks.\n' +
                        'Reference: http://api.qunitjs.com/category/callbacks/');
                }
            }
        }
    }
    (function () {
        if (!defined.document) {
            return;
        }
        var onErrorFnPrev = window.onerror;
        window.onerror = function (error, filePath, linerNr) {
            var ret = false;
            if (onErrorFnPrev) {
                ret = onErrorFnPrev(error, filePath, linerNr);
            }
            if (ret !== true) {
                if (QUnit.config.current) {
                    if (QUnit.config.current.ignoreGlobalErrors) {
                        return true;
                    }
                    QUnit.pushFailure(error, filePath + ':' + linerNr);
                }
                else {
                    QUnit.test('global failure', extend(function () {
                        QUnit.pushFailure(error, filePath + ':' + linerNr);
                    }, { validTest: true }));
                }
                return false;
            }
            return ret;
        };
    })();
    QUnit.urlParams = urlParams;
    QUnit.isLocal = !(defined.document && window.location.protocol !== 'file:');
    QUnit.version = '1.19.0';
    extend(QUnit, {
        module: function (name, testEnvironment) {
            var currentModule = {
                name: name,
                testEnvironment: testEnvironment,
                tests: [],
            };
            if (testEnvironment && testEnvironment.setup) {
                testEnvironment.beforeEach = testEnvironment.setup;
                delete testEnvironment.setup;
            }
            if (testEnvironment && testEnvironment.teardown) {
                testEnvironment.afterEach = testEnvironment.teardown;
                delete testEnvironment.teardown;
            }
            config.modules.push(currentModule);
            config.currentModule = currentModule;
        },
        asyncTest: asyncTest,
        test: test,
        skip: skip,
        start: function (count) {
            var globalStartAlreadyCalled = globalStartCalled;
            if (!config.current) {
                globalStartCalled = true;
                if (runStarted) {
                    throw new Error('Called start() outside of a test context while already started');
                }
                else if (globalStartAlreadyCalled || count > 1) {
                    throw new Error('Called start() outside of a test context too many times');
                }
                else if (config.autostart) {
                    throw new Error('Called start() outside of a test context when ' + 'QUnit.config.autostart was true');
                }
                else if (!config.pageLoaded) {
                    config.autostart = true;
                    return;
                }
            }
            else {
                config.current.semaphore -= count || 1;
                if (config.current.semaphore > 0) {
                    return;
                }
                if (config.current.semaphore < 0) {
                    config.current.semaphore = 0;
                    QUnit.pushFailure("Called start() while already started (test's semaphore was 0 already)", sourceFromStacktrace(2));
                    return;
                }
            }
            resumeProcessing();
        },
        stop: function (count) {
            if (!config.current) {
                throw new Error('Called stop() outside of a test context');
            }
            config.current.semaphore += count || 1;
            pauseProcessing();
        },
        config: config,
        is: is,
        objectType: objectType,
        extend: extend,
        load: function () {
            config.pageLoaded = true;
            extend(config, {
                stats: { all: 0, bad: 0 },
                moduleStats: { all: 0, bad: 0 },
                started: 0,
                updateRate: 1000,
                autostart: true,
                filter: '',
            }, true);
            config.blocking = false;
            if (config.autostart) {
                resumeProcessing();
            }
        },
        stack: function (offset) {
            offset = (offset || 0) + 2;
            return sourceFromStacktrace(offset);
        },
    });
    registerLoggingCallbacks(QUnit);
    function begin() {
        var i, l, modulesLog = [];
        if (!config.started) {
            config.started = now();
            verifyLoggingCallbacks();
            if (config.modules[0].name === '' && config.modules[0].tests.length === 0) {
                config.modules.shift();
            }
            for (i = 0, l = config.modules.length; i < l; i++) {
                modulesLog.push({
                    name: config.modules[i].name,
                    tests: config.modules[i].tests,
                });
            }
            runLoggingCallbacks('begin', {
                totalTests: Test.count,
                modules: modulesLog,
            });
        }
        config.blocking = false;
        process(true);
    }
    function process(last) {
        function next() {
            process(last);
        }
        var start = now();
        config.depth = (config.depth || 0) + 1;
        while (config.queue.length && !config.blocking) {
            if (!defined.setTimeout || config.updateRate <= 0 || now() - start < config.updateRate) {
                if (config.current) {
                    config.current.usedAsync = false;
                }
                config.queue.shift()();
            }
            else {
                setTimeout(next, 13);
                break;
            }
        }
        config.depth--;
        if (last && !config.blocking && !config.queue.length && config.depth === 0) {
            done();
        }
    }
    function pauseProcessing() {
        config.blocking = true;
        if (config.testTimeout && defined.setTimeout) {
            clearTimeout(config.timeout);
            config.timeout = setTimeout(function () {
                if (config.current) {
                    config.current.semaphore = 0;
                    QUnit.pushFailure('Test timed out', sourceFromStacktrace(2));
                }
                else {
                    throw new Error('Test timed out');
                }
                resumeProcessing();
            }, config.testTimeout);
        }
    }
    function resumeProcessing() {
        runStarted = true;
        if (defined.setTimeout) {
            setTimeout(function () {
                if (config.current && config.current.semaphore > 0) {
                    return;
                }
                if (config.timeout) {
                    clearTimeout(config.timeout);
                }
                begin();
            }, 13);
        }
        else {
            begin();
        }
    }
    function done() {
        var runtime, passed;
        config.autorun = true;
        if (config.previousModule) {
            runLoggingCallbacks('moduleDone', {
                name: config.previousModule.name,
                tests: config.previousModule.tests,
                failed: config.moduleStats.bad,
                passed: config.moduleStats.all - config.moduleStats.bad,
                total: config.moduleStats.all,
                runtime: now() - config.moduleStats.started,
            });
        }
        delete config.previousModule;
        runtime = now() - config.started;
        passed = config.stats.all - config.stats.bad;
        runLoggingCallbacks('done', {
            failed: config.stats.bad,
            passed: passed,
            total: config.stats.all,
            runtime: runtime,
        });
    }
    function Test(settings) {
        var i, l;
        ++Test.count;
        extend(this, settings);
        this.assertions = [];
        this.semaphore = 0;
        this.usedAsync = false;
        this.module = config.currentModule;
        this.stack = sourceFromStacktrace(3);
        for (i = 0, l = this.module.tests; i < l.length; i++) {
            if (this.module.tests[i].name === this.testName) {
                this.testName += ' ';
            }
        }
        this.testId = generateHash(this.module.name, this.testName);
        this.module.tests.push({
            name: this.testName,
            testId: this.testId,
        });
        if (settings.skip) {
            this.callback = function () { };
            this.async = false;
            this.expected = 0;
        }
        else {
            this.assert = new Assert(this);
        }
    }
    Test.count = 0;
    Test.prototype = {
        before: function () {
            if (this.module !== config.previousModule ||
                !hasOwn.call(config, 'previousModule')) {
                if (hasOwn.call(config, 'previousModule')) {
                    runLoggingCallbacks('moduleDone', {
                        name: config.previousModule.name,
                        tests: config.previousModule.tests,
                        failed: config.moduleStats.bad,
                        passed: config.moduleStats.all - config.moduleStats.bad,
                        total: config.moduleStats.all,
                        runtime: now() - config.moduleStats.started,
                    });
                }
                config.previousModule = this.module;
                config.moduleStats = { all: 0, bad: 0, started: now() };
                runLoggingCallbacks('moduleStart', {
                    name: this.module.name,
                    tests: this.module.tests,
                });
            }
            config.current = this;
            if (this.module.testEnvironment) {
                delete this.module.testEnvironment.beforeEach;
                delete this.module.testEnvironment.afterEach;
            }
            this.testEnvironment = extend({}, this.module.testEnvironment);
            this.started = now();
            runLoggingCallbacks('testStart', {
                name: this.testName,
                module: this.module.name,
                testId: this.testId,
            });
            if (!config.pollution) {
                saveGlobal();
            }
        },
        run: function () {
            var promise;
            config.current = this;
            if (this.async) {
                QUnit.stop();
            }
            this.callbackStarted = now();
            if (config.notrycatch) {
                promise = this.callback.call(this.testEnvironment, this.assert);
                this.resolvePromise(promise);
                return;
            }
            try {
                promise = this.callback.call(this.testEnvironment, this.assert);
                this.resolvePromise(promise);
            }
            catch (e) {
                this.pushFailure('Died on test #' + (this.assertions.length + 1) + ' ' + this.stack + ': ' + (e.message || e), extractStacktrace(e, 0));
                saveGlobal();
                if (config.blocking) {
                    QUnit.start();
                }
            }
        },
        after: function () {
            checkPollution();
        },
        queueHook: function (hook, hookName) {
            var promise, test = this;
            return function runHook() {
                config.current = test;
                if (config.notrycatch) {
                    promise = hook.call(test.testEnvironment, test.assert);
                    test.resolvePromise(promise, hookName);
                    return;
                }
                try {
                    promise = hook.call(test.testEnvironment, test.assert);
                    test.resolvePromise(promise, hookName);
                }
                catch (error) {
                    test.pushFailure(hookName + ' failed on ' + test.testName + ': ' + (error.message || error), extractStacktrace(error, 0));
                }
            };
        },
        hooks: function (handler) {
            var hooks = [];
            if (this.skip) {
                return hooks;
            }
            if (this.module.testEnvironment && QUnit.objectType(this.module.testEnvironment[handler]) === 'function') {
                hooks.push(this.queueHook(this.module.testEnvironment[handler], handler));
            }
            return hooks;
        },
        finish: function () {
            config.current = this;
            if (config.requireExpects && this.expected === null) {
                this.pushFailure('Expected number of assertions to be defined, but expect() was ' + 'not called.', this.stack);
            }
            else if (this.expected !== null && this.expected !== this.assertions.length) {
                this.pushFailure('Expected ' + this.expected + ' assertions, but ' + this.assertions.length + ' were run', this.stack);
            }
            else if (this.expected === null && !this.assertions.length) {
                this.pushFailure('Expected at least one assertion, but none were run - call ' + 'expect(0) to accept zero assertions.', this.stack);
            }
            var i, bad = 0;
            this.runtime = now() - this.started;
            config.stats.all += this.assertions.length;
            config.moduleStats.all += this.assertions.length;
            for (i = 0; i < this.assertions.length; i++) {
                if (!this.assertions[i].result) {
                    bad++;
                    config.stats.bad++;
                    config.moduleStats.bad++;
                }
            }
            runLoggingCallbacks('testDone', {
                name: this.testName,
                module: this.module.name,
                skipped: !!this.skip,
                failed: bad,
                passed: this.assertions.length - bad,
                total: this.assertions.length,
                runtime: this.runtime,
                assertions: this.assertions,
                testId: this.testId,
                source: this.stack,
                duration: this.runtime,
            });
            QUnit.reset();
            config.current = undefined;
        },
        queue: function () {
            var bad, test = this;
            if (!this.valid()) {
                return;
            }
            function run() {
                synchronize([
                    function () {
                        test.before();
                    },
                    test.hooks('beforeEach'),
                    function () {
                        test.run();
                    },
                    test.hooks('afterEach').reverse(),
                    function () {
                        test.after();
                    },
                    function () {
                        test.finish();
                    },
                ]);
            }
            bad =
                QUnit.config.reorder &&
                    defined.sessionStorage &&
                    +sessionStorage.getItem('qunit-test-' + this.module.name + '-' + this.testName);
            if (bad) {
                run();
            }
            else {
                synchronize(run, true);
            }
        },
        push: function (result, actual, expected, message, negative) {
            var source, details = {
                module: this.module.name,
                name: this.testName,
                result: result,
                message: message,
                actual: actual,
                expected: expected,
                testId: this.testId,
                negative: negative || false,
                runtime: now() - this.started,
            };
            if (!result) {
                source = sourceFromStacktrace();
                if (source) {
                    details.source = source;
                }
            }
            runLoggingCallbacks('log', details);
            this.assertions.push({
                result: !!result,
                message: message,
            });
        },
        pushFailure: function (message, source, actual) {
            if (!(this instanceof Test)) {
                throw new Error('pushFailure() assertion outside test context, was ' + sourceFromStacktrace(2));
            }
            var details = {
                module: this.module.name,
                name: this.testName,
                result: false,
                message: message || 'error',
                actual: actual || null,
                testId: this.testId,
                runtime: now() - this.started,
            };
            if (source) {
                details.source = source;
            }
            runLoggingCallbacks('log', details);
            this.assertions.push({
                result: false,
                message: message,
            });
        },
        resolvePromise: function (promise, phase) {
            var then, message, test = this;
            if (promise != null) {
                then = promise.then;
                if (QUnit.objectType(then) === 'function') {
                    QUnit.stop();
                    then.call(promise, function () {
                        QUnit.start();
                    }, function (error) {
                        message =
                            'Promise rejected ' +
                                (!phase ? 'during' : phase.replace(/Each$/, '')) +
                                ' ' +
                                test.testName +
                                ': ' +
                                (error.message || error);
                        test.pushFailure(message, extractStacktrace(error, 0));
                        saveGlobal();
                        QUnit.start();
                    });
                }
            }
        },
        valid: function () {
            var include, filter = config.filter && config.filter.toLowerCase(), module = QUnit.urlParams.module && QUnit.urlParams.module.toLowerCase(), fullName = (this.module.name + ': ' + this.testName).toLowerCase();
            if (this.callback && this.callback.validTest) {
                return true;
            }
            if (config.testId.length > 0 && inArray(this.testId, config.testId) < 0) {
                return false;
            }
            if (module && (!this.module.name || this.module.name.toLowerCase() !== module)) {
                return false;
            }
            if (!filter) {
                return true;
            }
            include = filter.charAt(0) !== '!';
            if (!include) {
                filter = filter.slice(1);
            }
            if (fullName.indexOf(filter) !== -1) {
                return include;
            }
            return !include;
        },
    };
    QUnit.reset = function () {
        if (!defined.document) {
            return;
        }
        var fixture = defined.document && document.getElementById && document.getElementById('qunit-fixture');
        if (fixture) {
            fixture.innerHTML = config.fixture;
        }
    };
    QUnit.pushFailure = function () {
        if (!QUnit.config.current) {
            throw new Error('pushFailure() assertion outside test context, in ' + sourceFromStacktrace(2));
        }
        var currentTest = QUnit.config.current;
        return currentTest.pushFailure.apply(currentTest, arguments);
    };
    function generateHash(module, testName) {
        var hex, i = 0, hash = 0, str = module + '\x1C' + testName, len = str.length;
        for (; i < len; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        hex = (0x100000000 + hash).toString(16);
        if (hex.length < 8) {
            hex = '0000000' + hex;
        }
        return hex.slice(-8);
    }
    function synchronize(callback, last) {
        if (QUnit.objectType(callback) === 'array') {
            while (callback.length) {
                synchronize(callback.shift());
            }
            return;
        }
        config.queue.push(callback);
        if (config.autorun && !config.blocking) {
            process(last);
        }
    }
    function saveGlobal() {
        config.pollution = [];
        if (config.noglobals) {
            for (var key in global) {
                if (hasOwn.call(global, key)) {
                    if (/^qunit-test-output/.test(key)) {
                        continue;
                    }
                    config.pollution.push(key);
                }
            }
        }
    }
    function checkPollution() {
        var newGlobals, deletedGlobals, old = config.pollution;
        saveGlobal();
        newGlobals = diff(config.pollution, old);
        if (newGlobals.length > 0) {
            QUnit.pushFailure('Introduced global variable(s): ' + newGlobals.join(', '));
        }
        deletedGlobals = diff(old, config.pollution);
        if (deletedGlobals.length > 0) {
            QUnit.pushFailure('Deleted global variable(s): ' + deletedGlobals.join(', '));
        }
    }
    function asyncTest(testName, expected, callback) {
        if (arguments.length === 2) {
            callback = expected;
            expected = null;
        }
        QUnit.test(testName, expected, callback, true);
    }
    function test(testName, expected, callback, async) {
        var newTest;
        if (arguments.length === 2) {
            callback = expected;
            expected = null;
        }
        newTest = new Test({
            testName: testName,
            expected: expected,
            async: async,
            callback: callback,
        });
        newTest.queue();
    }
    function skip(testName) {
        var test = new Test({
            testName: testName,
            skip: true,
        });
        test.queue();
    }
    function Assert(testContext) {
        this.test = testContext;
    }
    QUnit.assert = Assert.prototype = {
        expect: function (asserts) {
            if (arguments.length === 1) {
                this.test.expected = asserts;
            }
            else {
                return this.test.expected;
            }
        },
        async: function () {
            var test = this.test, popped = false;
            test.semaphore += 1;
            test.usedAsync = true;
            pauseProcessing();
            return function done() {
                if (!popped) {
                    test.semaphore -= 1;
                    popped = true;
                    resumeProcessing();
                }
                else {
                    test.pushFailure('Called the callback returned from `assert.async` more than once', sourceFromStacktrace(2));
                }
            };
        },
        push: function () {
            var assert = this, currentTest = (assert instanceof Assert && assert.test) || QUnit.config.current;
            if (!currentTest) {
                throw new Error('assertion outside test context, in ' + sourceFromStacktrace(2));
            }
            if (currentTest.usedAsync === true && currentTest.semaphore === 0) {
                currentTest.pushFailure('Assertion after the final `assert.async` was resolved', sourceFromStacktrace(2));
            }
            if (!(assert instanceof Assert)) {
                assert = currentTest.assert;
            }
            return assert.test.push.apply(assert.test, arguments);
        },
        ok: function (result, message) {
            message =
                message || (result ? 'okay' : 'failed, expected argument to be truthy, was: ' + QUnit.dump.parse(result));
            this.push(!!result, result, true, message);
        },
        notOk: function (result, message) {
            message =
                message || (!result ? 'okay' : 'failed, expected argument to be falsy, was: ' + QUnit.dump.parse(result));
            this.push(!result, result, false, message, true);
        },
        equal: function (actual, expected, message) {
            this.push(expected == actual, actual, expected, message);
        },
        notEqual: function (actual, expected, message) {
            this.push(expected != actual, actual, expected, message, true);
        },
        propEqual: function (actual, expected, message) {
            actual = objectValues(actual);
            expected = objectValues(expected);
            this.push(QUnit.equiv(actual, expected), actual, expected, message);
        },
        notPropEqual: function (actual, expected, message) {
            actual = objectValues(actual);
            expected = objectValues(expected);
            this.push(!QUnit.equiv(actual, expected), actual, expected, message, true);
        },
        deepEqual: function (actual, expected, message) {
            this.push(QUnit.equiv(actual, expected), actual, expected, message);
        },
        notDeepEqual: function (actual, expected, message) {
            this.push(!QUnit.equiv(actual, expected), actual, expected, message, true);
        },
        strictEqual: function (actual, expected, message) {
            this.push(expected === actual, actual, expected, message);
        },
        notStrictEqual: function (actual, expected, message) {
            this.push(expected !== actual, actual, expected, message, true);
        },
        throws: function (block, expected, message) {
            var actual, expectedType, expectedOutput = expected, ok = false, currentTest = (this instanceof Assert && this.test) || QUnit.config.current;
            if (message == null && typeof expected === 'string') {
                message = expected;
                expected = null;
            }
            currentTest.ignoreGlobalErrors = true;
            try {
                block.call(currentTest.testEnvironment);
            }
            catch (e) {
                actual = e;
            }
            currentTest.ignoreGlobalErrors = false;
            if (actual) {
                expectedType = QUnit.objectType(expected);
                if (!expected) {
                    ok = true;
                    expectedOutput = null;
                }
                else if (expectedType === 'regexp') {
                    ok = expected.test(errorString(actual));
                }
                else if (expectedType === 'string') {
                    ok = expected === errorString(actual);
                }
                else if (expectedType === 'function' && actual instanceof expected) {
                    ok = true;
                }
                else if (expectedType === 'object') {
                    ok =
                        actual instanceof expected.constructor &&
                            actual.name === expected.name &&
                            actual.message === expected.message;
                }
                else if (expectedType === 'function' && expected.call({}, actual) === true) {
                    expectedOutput = null;
                    ok = true;
                }
            }
            currentTest.assert.push(ok, actual, expectedOutput, message);
        },
    };
    (function () {
        Assert.prototype.raises = Assert.prototype['throws'];
    })();
    function errorString(error) {
        var name, message, resultErrorString = error.toString();
        if (resultErrorString.substring(0, 7) === '[object') {
            name = error.name ? error.name.toString() : 'Error';
            message = error.message ? error.message.toString() : '';
            if (name && message) {
                return name + ': ' + message;
            }
            else if (name) {
                return name;
            }
            else if (message) {
                return message;
            }
            else {
                return 'Error';
            }
        }
        else {
            return resultErrorString;
        }
    }
    QUnit.equiv = (function () {
        function bindCallbacks(o, callbacks, args) {
            var prop = QUnit.objectType(o);
            if (prop) {
                if (QUnit.objectType(callbacks[prop]) === 'function') {
                    return callbacks[prop].apply(callbacks, args);
                }
                else {
                    return callbacks[prop];
                }
            }
        }
        var innerEquiv, callers = [], parents = [], parentsB = [], getProto = Object.getPrototypeOf ||
            function (obj) {
                return obj.__proto__;
            }, callbacks = (function () {
            function useStrictEquality(b, a) {
                if (b instanceof a.constructor || a instanceof b.constructor) {
                    return a == b;
                }
                else {
                    return a === b;
                }
            }
            return {
                string: useStrictEquality,
                boolean: useStrictEquality,
                number: useStrictEquality,
                null: useStrictEquality,
                undefined: useStrictEquality,
                nan: function (b) {
                    return isNaN(b);
                },
                date: function (b, a) {
                    return QUnit.objectType(b) === 'date' && a.valueOf() === b.valueOf();
                },
                regexp: function (b, a) {
                    return (QUnit.objectType(b) === 'regexp' &&
                        a.source === b.source &&
                        a.global === b.global &&
                        a.ignoreCase === b.ignoreCase &&
                        a.multiline === b.multiline &&
                        a.sticky === b.sticky);
                },
                function: function () {
                    var caller = callers[callers.length - 1];
                    return caller !== Object && typeof caller !== 'undefined';
                },
                array: function (b, a) {
                    var i, j, len, loop, aCircular, bCircular;
                    if (QUnit.objectType(b) !== 'array') {
                        return false;
                    }
                    len = a.length;
                    if (len !== b.length) {
                        return false;
                    }
                    parents.push(a);
                    parentsB.push(b);
                    for (i = 0; i < len; i++) {
                        loop = false;
                        for (j = 0; j < parents.length; j++) {
                            aCircular = parents[j] === a[i];
                            bCircular = parentsB[j] === b[i];
                            if (aCircular || bCircular) {
                                if (a[i] === b[i] || (aCircular && bCircular)) {
                                    loop = true;
                                }
                                else {
                                    parents.pop();
                                    parentsB.pop();
                                    return false;
                                }
                            }
                        }
                        if (!loop && !innerEquiv(a[i], b[i])) {
                            parents.pop();
                            parentsB.pop();
                            return false;
                        }
                    }
                    parents.pop();
                    parentsB.pop();
                    return true;
                },
                set: function (b, a) {
                    var aArray, bArray;
                    if (QUnit.objectType(b) !== 'set') {
                        return false;
                    }
                    aArray = [];
                    a.forEach(function (v) {
                        aArray.push(v);
                    });
                    bArray = [];
                    b.forEach(function (v) {
                        bArray.push(v);
                    });
                    return innerEquiv(bArray, aArray);
                },
                map: function (b, a) {
                    var aArray, bArray;
                    if (QUnit.objectType(b) !== 'map') {
                        return false;
                    }
                    aArray = [];
                    a.forEach(function (v, k) {
                        aArray.push([k, v]);
                    });
                    bArray = [];
                    b.forEach(function (v, k) {
                        bArray.push([k, v]);
                    });
                    return innerEquiv(bArray, aArray);
                },
                object: function (b, a) {
                    var i, j, loop, aCircular, bCircular, eq = true, aProperties = [], bProperties = [];
                    if (a.constructor !== b.constructor) {
                        if (!((getProto(a) === null && getProto(b) === Object.prototype) ||
                            (getProto(b) === null && getProto(a) === Object.prototype))) {
                            return false;
                        }
                    }
                    callers.push(a.constructor);
                    parents.push(a);
                    parentsB.push(b);
                    for (i in a) {
                        loop = false;
                        for (j = 0; j < parents.length; j++) {
                            aCircular = parents[j] === a[i];
                            bCircular = parentsB[j] === b[i];
                            if (aCircular || bCircular) {
                                if (a[i] === b[i] || (aCircular && bCircular)) {
                                    loop = true;
                                }
                                else {
                                    eq = false;
                                    break;
                                }
                            }
                        }
                        aProperties.push(i);
                        if (!loop && !innerEquiv(a[i], b[i])) {
                            eq = false;
                            break;
                        }
                    }
                    parents.pop();
                    parentsB.pop();
                    callers.pop();
                    for (i in b) {
                        bProperties.push(i);
                    }
                    return eq && innerEquiv(aProperties.sort(), bProperties.sort());
                },
            };
        })();
        innerEquiv = function () {
            var args = [].slice.apply(arguments);
            if (args.length < 2) {
                return true;
            }
            return ((function (a, b) {
                if (a === b) {
                    return true;
                }
                else if (a === null ||
                    b === null ||
                    typeof a === 'undefined' ||
                    typeof b === 'undefined' ||
                    QUnit.objectType(a) !== QUnit.objectType(b)) {
                    return false;
                }
                else {
                    return bindCallbacks(a, callbacks, [b, a]);
                }
            })(args[0], args[1]) && innerEquiv.apply(this, args.splice(1, args.length - 1)));
        };
        return innerEquiv;
    })();
    QUnit.dump = (function () {
        function quote(str) {
            return '"' + str.toString().replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
        }
        function literal(o) {
            return o + '';
        }
        function join(pre, arr, post) {
            var s = dump.separator(), base = dump.indent(), inner = dump.indent(1);
            if (arr.join) {
                arr = arr.join(',' + s + inner);
            }
            if (!arr) {
                return pre + post;
            }
            return [pre, inner + arr, base + post].join(s);
        }
        function array(arr, stack) {
            var i = arr.length, ret = new Array(i);
            if (dump.maxDepth && dump.depth > dump.maxDepth) {
                return '[object Array]';
            }
            this.up();
            while (i--) {
                ret[i] = this.parse(arr[i], undefined, stack);
            }
            this.down();
            return join('[', ret, ']');
        }
        var reName = /^function (\w+)/, dump = {
            parse: function (obj, objType, stack) {
                stack = stack || [];
                var res, parser, parserType, inStack = inArray(obj, stack);
                if (inStack !== -1) {
                    return 'recursion(' + (inStack - stack.length) + ')';
                }
                objType = objType || this.typeOf(obj);
                parser = this.parsers[objType];
                parserType = typeof parser;
                if (parserType === 'function') {
                    stack.push(obj);
                    res = parser.call(this, obj, stack);
                    stack.pop();
                    return res;
                }
                return parserType === 'string' ? parser : this.parsers.error;
            },
            typeOf: function (obj) {
                var type;
                if (obj === null) {
                    type = 'null';
                }
                else if (typeof obj === 'undefined') {
                    type = 'undefined';
                }
                else if (QUnit.is('regexp', obj)) {
                    type = 'regexp';
                }
                else if (QUnit.is('date', obj)) {
                    type = 'date';
                }
                else if (QUnit.is('function', obj)) {
                    type = 'function';
                }
                else if (obj.setInterval !== undefined && obj.document !== undefined && obj.nodeType === undefined) {
                    type = 'window';
                }
                else if (obj.nodeType === 9) {
                    type = 'document';
                }
                else if (obj.nodeType) {
                    type = 'node';
                }
                else if (toString.call(obj) === '[object Array]' ||
                    (typeof obj.length === 'number' &&
                        obj.item !== undefined &&
                        (obj.length ? obj.item(0) === obj[0] : obj.item(0) === null && obj[0] === undefined))) {
                    type = 'array';
                }
                else if (obj.constructor === Error.prototype.constructor) {
                    type = 'error';
                }
                else {
                    type = typeof obj;
                }
                return type;
            },
            separator: function () {
                return this.multiline ? (this.HTML ? '<br />' : '\n') : this.HTML ? '&#160;' : ' ';
            },
            indent: function (extra) {
                if (!this.multiline) {
                    return '';
                }
                var chr = this.indentChar;
                if (this.HTML) {
                    chr = chr.replace(/\t/g, '   ').replace(/ /g, '&#160;');
                }
                return new Array(this.depth + (extra || 0)).join(chr);
            },
            up: function (a) {
                this.depth += a || 1;
            },
            down: function (a) {
                this.depth -= a || 1;
            },
            setParser: function (name, parser) {
                this.parsers[name] = parser;
            },
            quote: quote,
            literal: literal,
            join: join,
            depth: 1,
            maxDepth: QUnit.config.maxDepth,
            parsers: {
                window: '[Window]',
                document: '[Document]',
                error: function (error) {
                    return 'Error("' + error.message + '")';
                },
                unknown: '[Unknown]',
                null: 'null',
                undefined: 'undefined',
                function: function (fn) {
                    var ret = 'function', name = 'name' in fn ? fn.name : (reName.exec(fn) || [])[1];
                    if (name) {
                        ret += ' ' + name;
                    }
                    ret += '( ';
                    ret = [ret, dump.parse(fn, 'functionArgs'), '){'].join('');
                    return join(ret, dump.parse(fn, 'functionCode'), '}');
                },
                array: array,
                nodelist: array,
                arguments: array,
                object: function (map, stack) {
                    var keys, key, val, i, nonEnumerableProperties, ret = [];
                    if (dump.maxDepth && dump.depth > dump.maxDepth) {
                        return '[object Object]';
                    }
                    dump.up();
                    keys = [];
                    for (key in map) {
                        keys.push(key);
                    }
                    nonEnumerableProperties = ['message', 'name'];
                    for (i in nonEnumerableProperties) {
                        key = nonEnumerableProperties[i];
                        if (key in map && inArray(key, keys) < 0) {
                            keys.push(key);
                        }
                    }
                    keys.sort();
                    for (i = 0; i < keys.length; i++) {
                        key = keys[i];
                        val = map[key];
                        ret.push(dump.parse(key, 'key') + ': ' + dump.parse(val, undefined, stack));
                    }
                    dump.down();
                    return join('{', ret, '}');
                },
                node: function (node) {
                    var len, i, val, open = dump.HTML ? '&lt;' : '<', close = dump.HTML ? '&gt;' : '>', tag = node.nodeName.toLowerCase(), ret = open + tag, attrs = node.attributes;
                    if (attrs) {
                        for (i = 0, len = attrs.length; i < len; i++) {
                            val = attrs[i].nodeValue;
                            if (val && val !== 'inherit') {
                                ret += ' ' + attrs[i].nodeName + '=' + dump.parse(val, 'attribute');
                            }
                        }
                    }
                    ret += close;
                    if (node.nodeType === 3 || node.nodeType === 4) {
                        ret += node.nodeValue;
                    }
                    return ret + open + '/' + tag + close;
                },
                functionArgs: function (fn) {
                    var args, l = fn.length;
                    if (!l) {
                        return '';
                    }
                    args = new Array(l);
                    while (l--) {
                        args[l] = String.fromCharCode(97 + l);
                    }
                    return ' ' + args.join(', ') + ' ';
                },
                key: quote,
                functionCode: '[code]',
                attribute: quote,
                string: quote,
                date: quote,
                regexp: literal,
                number: literal,
                boolean: literal,
            },
            HTML: false,
            indentChar: '  ',
            multiline: true,
        };
        return dump;
    })();
    QUnit.jsDump = QUnit.dump;
    if (defined.document) {
        (function () {
            var i, assertions = Assert.prototype;
            function applyCurrent(current) {
                return function () {
                    var assert = new Assert(QUnit.config.current);
                    current.apply(assert, arguments);
                };
            }
            for (i in assertions) {
                QUnit[i] = applyCurrent(assertions[i]);
            }
        })();
        (function () {
            var i, l, keys = [
                'test',
                'module',
                'expect',
                'asyncTest',
                'start',
                'stop',
                'ok',
                'notOk',
                'equal',
                'notEqual',
                'propEqual',
                'notPropEqual',
                'deepEqual',
                'notDeepEqual',
                'strictEqual',
                'notStrictEqual',
                'throws',
            ];
            for (i = 0, l = keys.length; i < l; i++) {
                window[keys[i]] = QUnit[keys[i]];
            }
        })();
        window.QUnit = QUnit;
    }
    if (typeof module !== 'undefined' && module && module.exports) {
        module.exports = QUnit;
        module.exports.QUnit = QUnit;
    }
    if (typeof exports !== 'undefined' && exports) {
        exports.QUnit = QUnit;
    }
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return QUnit;
        });
        QUnit.config.autostart = false;
    }
    QUnit.diff = (function () {
        function DiffMatchPatch() { }
        var DIFF_DELETE = -1, DIFF_INSERT = 1, DIFF_EQUAL = 0;
        DiffMatchPatch.prototype.DiffMain = function (text1, text2, optChecklines) {
            var deadline, checklines, commonlength, commonprefix, commonsuffix, diffs;
            deadline = new Date().getTime() + 1000;
            if (text1 === null || text2 === null) {
                throw new Error('Null input. (DiffMain)');
            }
            if (text1 === text2) {
                if (text1) {
                    return [[DIFF_EQUAL, text1]];
                }
                return [];
            }
            if (typeof optChecklines === 'undefined') {
                optChecklines = true;
            }
            checklines = optChecklines;
            commonlength = this.diffCommonPrefix(text1, text2);
            commonprefix = text1.substring(0, commonlength);
            text1 = text1.substring(commonlength);
            text2 = text2.substring(commonlength);
            commonlength = this.diffCommonSuffix(text1, text2);
            commonsuffix = text1.substring(text1.length - commonlength);
            text1 = text1.substring(0, text1.length - commonlength);
            text2 = text2.substring(0, text2.length - commonlength);
            diffs = this.diffCompute(text1, text2, checklines, deadline);
            if (commonprefix) {
                diffs.unshift([DIFF_EQUAL, commonprefix]);
            }
            if (commonsuffix) {
                diffs.push([DIFF_EQUAL, commonsuffix]);
            }
            this.diffCleanupMerge(diffs);
            return diffs;
        };
        DiffMatchPatch.prototype.diffCleanupEfficiency = function (diffs) {
            var changes, equalities, equalitiesLength, lastequality, pointer, preIns, preDel, postIns, postDel;
            changes = false;
            equalities = [];
            equalitiesLength = 0;
            lastequality = null;
            pointer = 0;
            preIns = false;
            preDel = false;
            postIns = false;
            postDel = false;
            while (pointer < diffs.length) {
                if (diffs[pointer][0] === DIFF_EQUAL) {
                    if (diffs[pointer][1].length < 4 && (postIns || postDel)) {
                        equalities[equalitiesLength++] = pointer;
                        preIns = postIns;
                        preDel = postDel;
                        lastequality = diffs[pointer][1];
                    }
                    else {
                        equalitiesLength = 0;
                        lastequality = null;
                    }
                    postIns = postDel = false;
                }
                else {
                    if (diffs[pointer][0] === DIFF_DELETE) {
                        postDel = true;
                    }
                    else {
                        postIns = true;
                    }
                    if (lastequality &&
                        ((preIns && preDel && postIns && postDel) ||
                            (lastequality.length < 2 && preIns + preDel + postIns + postDel === 3))) {
                        diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]);
                        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                        equalitiesLength--;
                        lastequality = null;
                        if (preIns && preDel) {
                            postIns = postDel = true;
                            equalitiesLength = 0;
                        }
                        else {
                            equalitiesLength--;
                            pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                            postIns = postDel = false;
                        }
                        changes = true;
                    }
                }
                pointer++;
            }
            if (changes) {
                this.diffCleanupMerge(diffs);
            }
        };
        DiffMatchPatch.prototype.diffPrettyHtml = function (diffs) {
            var op, data, x, html = [];
            for (x = 0; x < diffs.length; x++) {
                op = diffs[x][0];
                data = diffs[x][1];
                switch (op) {
                    case DIFF_INSERT:
                        html[x] = '<ins>' + data + '</ins>';
                        break;
                    case DIFF_DELETE:
                        html[x] = '<del>' + data + '</del>';
                        break;
                    case DIFF_EQUAL:
                        html[x] = '<span>' + data + '</span>';
                        break;
                }
            }
            return html.join('');
        };
        DiffMatchPatch.prototype.diffCommonPrefix = function (text1, text2) {
            var pointermid, pointermax, pointermin, pointerstart;
            if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
                return 0;
            }
            pointermin = 0;
            pointermax = Math.min(text1.length, text2.length);
            pointermid = pointermax;
            pointerstart = 0;
            while (pointermin < pointermid) {
                if (text1.substring(pointerstart, pointermid) === text2.substring(pointerstart, pointermid)) {
                    pointermin = pointermid;
                    pointerstart = pointermin;
                }
                else {
                    pointermax = pointermid;
                }
                pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
            }
            return pointermid;
        };
        DiffMatchPatch.prototype.diffCommonSuffix = function (text1, text2) {
            var pointermid, pointermax, pointermin, pointerend;
            if (!text1 || !text2 || text1.charAt(text1.length - 1) !== text2.charAt(text2.length - 1)) {
                return 0;
            }
            pointermin = 0;
            pointermax = Math.min(text1.length, text2.length);
            pointermid = pointermax;
            pointerend = 0;
            while (pointermin < pointermid) {
                if (text1.substring(text1.length - pointermid, text1.length - pointerend) ===
                    text2.substring(text2.length - pointermid, text2.length - pointerend)) {
                    pointermin = pointermid;
                    pointerend = pointermin;
                }
                else {
                    pointermax = pointermid;
                }
                pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
            }
            return pointermid;
        };
        DiffMatchPatch.prototype.diffCompute = function (text1, text2, checklines, deadline) {
            var diffs, longtext, shorttext, i, hm, text1A, text2A, text1B, text2B, midCommon, diffsA, diffsB;
            if (!text1) {
                return [[DIFF_INSERT, text2]];
            }
            if (!text2) {
                return [[DIFF_DELETE, text1]];
            }
            longtext = text1.length > text2.length ? text1 : text2;
            shorttext = text1.length > text2.length ? text2 : text1;
            i = longtext.indexOf(shorttext);
            if (i !== -1) {
                diffs = [
                    [DIFF_INSERT, longtext.substring(0, i)],
                    [DIFF_EQUAL, shorttext],
                    [DIFF_INSERT, longtext.substring(i + shorttext.length)],
                ];
                if (text1.length > text2.length) {
                    diffs[0][0] = diffs[2][0] = DIFF_DELETE;
                }
                return diffs;
            }
            if (shorttext.length === 1) {
                return [
                    [DIFF_DELETE, text1],
                    [DIFF_INSERT, text2],
                ];
            }
            hm = this.diffHalfMatch(text1, text2);
            if (hm) {
                text1A = hm[0];
                text1B = hm[1];
                text2A = hm[2];
                text2B = hm[3];
                midCommon = hm[4];
                diffsA = this.DiffMain(text1A, text2A, checklines, deadline);
                diffsB = this.DiffMain(text1B, text2B, checklines, deadline);
                return diffsA.concat([[DIFF_EQUAL, midCommon]], diffsB);
            }
            if (checklines && text1.length > 100 && text2.length > 100) {
                return this.diffLineMode(text1, text2, deadline);
            }
            return this.diffBisect(text1, text2, deadline);
        };
        DiffMatchPatch.prototype.diffHalfMatch = function (text1, text2) {
            var longtext, shorttext, dmp, text1A, text2B, text2A, text1B, midCommon, hm1, hm2, hm;
            longtext = text1.length > text2.length ? text1 : text2;
            shorttext = text1.length > text2.length ? text2 : text1;
            if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
                return null;
            }
            dmp = this;
            function diffHalfMatchI(longtext, shorttext, i) {
                var seed, j, bestCommon, prefixLength, suffixLength, bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB;
                seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
                j = -1;
                bestCommon = '';
                while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {
                    prefixLength = dmp.diffCommonPrefix(longtext.substring(i), shorttext.substring(j));
                    suffixLength = dmp.diffCommonSuffix(longtext.substring(0, i), shorttext.substring(0, j));
                    if (bestCommon.length < suffixLength + prefixLength) {
                        bestCommon = shorttext.substring(j - suffixLength, j) + shorttext.substring(j, j + prefixLength);
                        bestLongtextA = longtext.substring(0, i - suffixLength);
                        bestLongtextB = longtext.substring(i + prefixLength);
                        bestShorttextA = shorttext.substring(0, j - suffixLength);
                        bestShorttextB = shorttext.substring(j + prefixLength);
                    }
                }
                if (bestCommon.length * 2 >= longtext.length) {
                    return [bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB, bestCommon];
                }
                else {
                    return null;
                }
            }
            hm1 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 4));
            hm2 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 2));
            if (!hm1 && !hm2) {
                return null;
            }
            else if (!hm2) {
                hm = hm1;
            }
            else if (!hm1) {
                hm = hm2;
            }
            else {
                hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
            }
            text1A, text1B, text2A, text2B;
            if (text1.length > text2.length) {
                text1A = hm[0];
                text1B = hm[1];
                text2A = hm[2];
                text2B = hm[3];
            }
            else {
                text2A = hm[0];
                text2B = hm[1];
                text1A = hm[2];
                text1B = hm[3];
            }
            midCommon = hm[4];
            return [text1A, text1B, text2A, text2B, midCommon];
        };
        DiffMatchPatch.prototype.diffLineMode = function (text1, text2, deadline) {
            var a, diffs, linearray, pointer, countInsert, countDelete, textInsert, textDelete, j;
            a = this.diffLinesToChars(text1, text2);
            text1 = a.chars1;
            text2 = a.chars2;
            linearray = a.lineArray;
            diffs = this.DiffMain(text1, text2, false, deadline);
            this.diffCharsToLines(diffs, linearray);
            this.diffCleanupSemantic(diffs);
            diffs.push([DIFF_EQUAL, '']);
            pointer = 0;
            countDelete = 0;
            countInsert = 0;
            textDelete = '';
            textInsert = '';
            while (pointer < diffs.length) {
                switch (diffs[pointer][0]) {
                    case DIFF_INSERT:
                        countInsert++;
                        textInsert += diffs[pointer][1];
                        break;
                    case DIFF_DELETE:
                        countDelete++;
                        textDelete += diffs[pointer][1];
                        break;
                    case DIFF_EQUAL:
                        if (countDelete >= 1 && countInsert >= 1) {
                            diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert);
                            pointer = pointer - countDelete - countInsert;
                            a = this.DiffMain(textDelete, textInsert, false, deadline);
                            for (j = a.length - 1; j >= 0; j--) {
                                diffs.splice(pointer, 0, a[j]);
                            }
                            pointer = pointer + a.length;
                        }
                        countInsert = 0;
                        countDelete = 0;
                        textDelete = '';
                        textInsert = '';
                        break;
                }
                pointer++;
            }
            diffs.pop();
            return diffs;
        };
        DiffMatchPatch.prototype.diffBisect = function (text1, text2, deadline) {
            var text1Length, text2Length, maxD, vOffset, vLength, v1, v2, x, delta, front, k1start, k1end, k2start, k2end, k2Offset, k1Offset, x1, x2, y1, y2, d, k1, k2;
            text1Length = text1.length;
            text2Length = text2.length;
            maxD = Math.ceil((text1Length + text2Length) / 2);
            vOffset = maxD;
            vLength = 2 * maxD;
            v1 = new Array(vLength);
            v2 = new Array(vLength);
            for (x = 0; x < vLength; x++) {
                v1[x] = -1;
                v2[x] = -1;
            }
            v1[vOffset + 1] = 0;
            v2[vOffset + 1] = 0;
            delta = text1Length - text2Length;
            front = delta % 2 !== 0;
            k1start = 0;
            k1end = 0;
            k2start = 0;
            k2end = 0;
            for (d = 0; d < maxD; d++) {
                if (new Date().getTime() > deadline) {
                    break;
                }
                for (k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
                    k1Offset = vOffset + k1;
                    if (k1 === -d || (k1 !== d && v1[k1Offset - 1] < v1[k1Offset + 1])) {
                        x1 = v1[k1Offset + 1];
                    }
                    else {
                        x1 = v1[k1Offset - 1] + 1;
                    }
                    y1 = x1 - k1;
                    while (x1 < text1Length && y1 < text2Length && text1.charAt(x1) === text2.charAt(y1)) {
                        x1++;
                        y1++;
                    }
                    v1[k1Offset] = x1;
                    if (x1 > text1Length) {
                        k1end += 2;
                    }
                    else if (y1 > text2Length) {
                        k1start += 2;
                    }
                    else if (front) {
                        k2Offset = vOffset + delta - k1;
                        if (k2Offset >= 0 && k2Offset < vLength && v2[k2Offset] !== -1) {
                            x2 = text1Length - v2[k2Offset];
                            if (x1 >= x2) {
                                return this.diffBisectSplit(text1, text2, x1, y1, deadline);
                            }
                        }
                    }
                }
                for (k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
                    k2Offset = vOffset + k2;
                    if (k2 === -d || (k2 !== d && v2[k2Offset - 1] < v2[k2Offset + 1])) {
                        x2 = v2[k2Offset + 1];
                    }
                    else {
                        x2 = v2[k2Offset - 1] + 1;
                    }
                    y2 = x2 - k2;
                    while (x2 < text1Length &&
                        y2 < text2Length &&
                        text1.charAt(text1Length - x2 - 1) === text2.charAt(text2Length - y2 - 1)) {
                        x2++;
                        y2++;
                    }
                    v2[k2Offset] = x2;
                    if (x2 > text1Length) {
                        k2end += 2;
                    }
                    else if (y2 > text2Length) {
                        k2start += 2;
                    }
                    else if (!front) {
                        k1Offset = vOffset + delta - k2;
                        if (k1Offset >= 0 && k1Offset < vLength && v1[k1Offset] !== -1) {
                            x1 = v1[k1Offset];
                            y1 = vOffset + x1 - k1Offset;
                            x2 = text1Length - x2;
                            if (x1 >= x2) {
                                return this.diffBisectSplit(text1, text2, x1, y1, deadline);
                            }
                        }
                    }
                }
            }
            return [
                [DIFF_DELETE, text1],
                [DIFF_INSERT, text2],
            ];
        };
        DiffMatchPatch.prototype.diffBisectSplit = function (text1, text2, x, y, deadline) {
            var text1a, text1b, text2a, text2b, diffs, diffsb;
            text1a = text1.substring(0, x);
            text2a = text2.substring(0, y);
            text1b = text1.substring(x);
            text2b = text2.substring(y);
            diffs = this.DiffMain(text1a, text2a, false, deadline);
            diffsb = this.DiffMain(text1b, text2b, false, deadline);
            return diffs.concat(diffsb);
        };
        DiffMatchPatch.prototype.diffCleanupSemantic = function (diffs) {
            var changes, equalities, equalitiesLength, lastequality, pointer, lengthInsertions2, lengthDeletions2, lengthInsertions1, lengthDeletions1, deletion, insertion, overlapLength1, overlapLength2;
            changes = false;
            equalities = [];
            equalitiesLength = 0;
            lastequality = null;
            pointer = 0;
            lengthInsertions1 = 0;
            lengthDeletions1 = 0;
            lengthInsertions2 = 0;
            lengthDeletions2 = 0;
            while (pointer < diffs.length) {
                if (diffs[pointer][0] === DIFF_EQUAL) {
                    equalities[equalitiesLength++] = pointer;
                    lengthInsertions1 = lengthInsertions2;
                    lengthDeletions1 = lengthDeletions2;
                    lengthInsertions2 = 0;
                    lengthDeletions2 = 0;
                    lastequality = diffs[pointer][1];
                }
                else {
                    if (diffs[pointer][0] === DIFF_INSERT) {
                        lengthInsertions2 += diffs[pointer][1].length;
                    }
                    else {
                        lengthDeletions2 += diffs[pointer][1].length;
                    }
                    if (lastequality &&
                        lastequality.length <= Math.max(lengthInsertions1, lengthDeletions1) &&
                        lastequality.length <= Math.max(lengthInsertions2, lengthDeletions2)) {
                        diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]);
                        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                        equalitiesLength--;
                        equalitiesLength--;
                        pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                        lengthInsertions1 = 0;
                        lengthDeletions1 = 0;
                        lengthInsertions2 = 0;
                        lengthDeletions2 = 0;
                        lastequality = null;
                        changes = true;
                    }
                }
                pointer++;
            }
            if (changes) {
                this.diffCleanupMerge(diffs);
            }
            pointer = 1;
            while (pointer < diffs.length) {
                if (diffs[pointer - 1][0] === DIFF_DELETE && diffs[pointer][0] === DIFF_INSERT) {
                    deletion = diffs[pointer - 1][1];
                    insertion = diffs[pointer][1];
                    overlapLength1 = this.diffCommonOverlap(deletion, insertion);
                    overlapLength2 = this.diffCommonOverlap(insertion, deletion);
                    if (overlapLength1 >= overlapLength2) {
                        if (overlapLength1 >= deletion.length / 2 || overlapLength1 >= insertion.length / 2) {
                            diffs.splice(pointer, 0, [DIFF_EQUAL, insertion.substring(0, overlapLength1)]);
                            diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlapLength1);
                            diffs[pointer + 1][1] = insertion.substring(overlapLength1);
                            pointer++;
                        }
                    }
                    else {
                        if (overlapLength2 >= deletion.length / 2 || overlapLength2 >= insertion.length / 2) {
                            diffs.splice(pointer, 0, [DIFF_EQUAL, deletion.substring(0, overlapLength2)]);
                            diffs[pointer - 1][0] = DIFF_INSERT;
                            diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlapLength2);
                            diffs[pointer + 1][0] = DIFF_DELETE;
                            diffs[pointer + 1][1] = deletion.substring(overlapLength2);
                            pointer++;
                        }
                    }
                    pointer++;
                }
                pointer++;
            }
        };
        DiffMatchPatch.prototype.diffCommonOverlap = function (text1, text2) {
            var text1Length, text2Length, textLength, best, length, pattern, found;
            text1Length = text1.length;
            text2Length = text2.length;
            if (text1Length === 0 || text2Length === 0) {
                return 0;
            }
            if (text1Length > text2Length) {
                text1 = text1.substring(text1Length - text2Length);
            }
            else if (text1Length < text2Length) {
                text2 = text2.substring(0, text1Length);
            }
            textLength = Math.min(text1Length, text2Length);
            if (text1 === text2) {
                return textLength;
            }
            best = 0;
            length = 1;
            while (true) {
                pattern = text1.substring(textLength - length);
                found = text2.indexOf(pattern);
                if (found === -1) {
                    return best;
                }
                length += found;
                if (found === 0 || text1.substring(textLength - length) === text2.substring(0, length)) {
                    best = length;
                    length++;
                }
            }
        };
        DiffMatchPatch.prototype.diffLinesToChars = function (text1, text2) {
            var lineArray, lineHash, chars1, chars2;
            lineArray = [];
            lineHash = {};
            lineArray[0] = '';
            function diffLinesToCharsMunge(text) {
                var chars, lineStart, lineEnd, lineArrayLength, line;
                chars = '';
                lineStart = 0;
                lineEnd = -1;
                lineArrayLength = lineArray.length;
                while (lineEnd < text.length - 1) {
                    lineEnd = text.indexOf('\n', lineStart);
                    if (lineEnd === -1) {
                        lineEnd = text.length - 1;
                    }
                    line = text.substring(lineStart, lineEnd + 1);
                    lineStart = lineEnd + 1;
                    if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) : lineHash[line] !== undefined) {
                        chars += String.fromCharCode(lineHash[line]);
                    }
                    else {
                        chars += String.fromCharCode(lineArrayLength);
                        lineHash[line] = lineArrayLength;
                        lineArray[lineArrayLength++] = line;
                    }
                }
                return chars;
            }
            chars1 = diffLinesToCharsMunge(text1);
            chars2 = diffLinesToCharsMunge(text2);
            return {
                chars1: chars1,
                chars2: chars2,
                lineArray: lineArray,
            };
        };
        DiffMatchPatch.prototype.diffCharsToLines = function (diffs, lineArray) {
            var x, chars, text, y;
            for (x = 0; x < diffs.length; x++) {
                chars = diffs[x][1];
                text = [];
                for (y = 0; y < chars.length; y++) {
                    text[y] = lineArray[chars.charCodeAt(y)];
                }
                diffs[x][1] = text.join('');
            }
        };
        DiffMatchPatch.prototype.diffCleanupMerge = function (diffs) {
            var pointer, countDelete, countInsert, textInsert, textDelete, commonlength, changes, diffPointer, position;
            diffs.push([DIFF_EQUAL, '']);
            pointer = 0;
            countDelete = 0;
            countInsert = 0;
            textDelete = '';
            textInsert = '';
            commonlength;
            while (pointer < diffs.length) {
                switch (diffs[pointer][0]) {
                    case DIFF_INSERT:
                        countInsert++;
                        textInsert += diffs[pointer][1];
                        pointer++;
                        break;
                    case DIFF_DELETE:
                        countDelete++;
                        textDelete += diffs[pointer][1];
                        pointer++;
                        break;
                    case DIFF_EQUAL:
                        if (countDelete + countInsert > 1) {
                            if (countDelete !== 0 && countInsert !== 0) {
                                commonlength = this.diffCommonPrefix(textInsert, textDelete);
                                if (commonlength !== 0) {
                                    if (pointer - countDelete - countInsert > 0 &&
                                        diffs[pointer - countDelete - countInsert - 1][0] === DIFF_EQUAL) {
                                        diffs[pointer - countDelete - countInsert - 1][1] += textInsert.substring(0, commonlength);
                                    }
                                    else {
                                        diffs.splice(0, 0, [DIFF_EQUAL, textInsert.substring(0, commonlength)]);
                                        pointer++;
                                    }
                                    textInsert = textInsert.substring(commonlength);
                                    textDelete = textDelete.substring(commonlength);
                                }
                                commonlength = this.diffCommonSuffix(textInsert, textDelete);
                                if (commonlength !== 0) {
                                    diffs[pointer][1] = textInsert.substring(textInsert.length - commonlength) + diffs[pointer][1];
                                    textInsert = textInsert.substring(0, textInsert.length - commonlength);
                                    textDelete = textDelete.substring(0, textDelete.length - commonlength);
                                }
                            }
                            if (countDelete === 0) {
                                diffs.splice(pointer - countInsert, countDelete + countInsert, [DIFF_INSERT, textInsert]);
                            }
                            else if (countInsert === 0) {
                                diffs.splice(pointer - countDelete, countDelete + countInsert, [DIFF_DELETE, textDelete]);
                            }
                            else {
                                diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert, [DIFF_DELETE, textDelete], [DIFF_INSERT, textInsert]);
                            }
                            pointer = pointer - countDelete - countInsert + (countDelete ? 1 : 0) + (countInsert ? 1 : 0) + 1;
                        }
                        else if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
                            diffs[pointer - 1][1] += diffs[pointer][1];
                            diffs.splice(pointer, 1);
                        }
                        else {
                            pointer++;
                        }
                        countInsert = 0;
                        countDelete = 0;
                        textDelete = '';
                        textInsert = '';
                        break;
                }
            }
            if (diffs[diffs.length - 1][1] === '') {
                diffs.pop();
            }
            changes = false;
            pointer = 1;
            while (pointer < diffs.length - 1) {
                if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
                    diffPointer = diffs[pointer][1];
                    position = diffPointer.substring(diffPointer.length - diffs[pointer - 1][1].length);
                    if (position === diffs[pointer - 1][1]) {
                        diffs[pointer][1] =
                            diffs[pointer - 1][1] +
                                diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
                        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
                        diffs.splice(pointer - 1, 1);
                        changes = true;
                    }
                    else if (diffPointer.substring(0, diffs[pointer + 1][1].length) === diffs[pointer + 1][1]) {
                        diffs[pointer - 1][1] += diffs[pointer + 1][1];
                        diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
                        diffs.splice(pointer + 1, 1);
                        changes = true;
                    }
                }
                pointer++;
            }
            if (changes) {
                this.diffCleanupMerge(diffs);
            }
        };
        return function (o, n) {
            var diff, output, text;
            diff = new DiffMatchPatch();
            output = diff.DiffMain(o, n);
            diff.diffCleanupEfficiency(output);
            text = diff.diffPrettyHtml(output);
            return text;
        };
    })();
})((function () {
    return this;
})());
(function () {
    if (typeof window === 'undefined' || !window.document) {
        return;
    }
    QUnit.init = function () {
        var tests, banner, result, qunit, config = QUnit.config;
        config.stats = { all: 0, bad: 0 };
        config.moduleStats = { all: 0, bad: 0 };
        config.started = 0;
        config.updateRate = 1000;
        config.blocking = false;
        config.autostart = true;
        config.autorun = false;
        config.filter = '';
        config.queue = [];
        if (typeof window === 'undefined') {
            return;
        }
        qunit = id('qunit');
        if (qunit) {
            qunit.innerHTML =
                "<h1 id='qunit-header'>" +
                    escapeText(document.title) +
                    '</h1>' +
                    "<h2 id='qunit-banner'></h2>" +
                    "<div id='qunit-testrunner-toolbar'></div>" +
                    "<h2 id='qunit-userAgent'></h2>" +
                    "<ol id='qunit-tests'></ol>";
        }
        tests = id('qunit-tests');
        banner = id('qunit-banner');
        result = id('qunit-testresult');
        if (tests) {
            tests.innerHTML = '';
        }
        if (banner) {
            banner.className = '';
        }
        if (result) {
            result.parentNode.removeChild(result);
        }
        if (tests) {
            result = document.createElement('p');
            result.id = 'qunit-testresult';
            result.className = 'result';
            tests.parentNode.insertBefore(result, tests);
            result.innerHTML = 'Running...<br />&#160;';
        }
    };
    var config = QUnit.config, hasOwn = Object.prototype.hasOwnProperty, defined = {
        document: window.document !== undefined,
        sessionStorage: (function () {
            var x = 'qunit-test-string';
            try {
                sessionStorage.setItem(x, x);
                sessionStorage.removeItem(x);
                return true;
            }
            catch (e) {
                return false;
            }
        })(),
    }, modulesList = [];
    function escapeText(s) {
        if (!s) {
            return '';
        }
        s = s + '';
        return s.replace(/['"<>&]/g, function (s) {
            switch (s) {
                case "'":
                    return '&#039;';
                case '"':
                    return '&quot;';
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '&':
                    return '&amp;';
            }
        });
    }
    function addEvent(elem, type, fn) {
        if (elem.addEventListener) {
            elem.addEventListener(type, fn, false);
        }
        else if (elem.attachEvent) {
            elem.attachEvent('on' + type, function () {
                var event = window.event;
                if (!event.target) {
                    event.target = event.srcElement || document;
                }
                fn.call(elem, event);
            });
        }
    }
    function addEvents(elems, type, fn) {
        var i = elems.length;
        while (i--) {
            addEvent(elems[i], type, fn);
        }
    }
    function hasClass(elem, name) {
        return (' ' + elem.className + ' ').indexOf(' ' + name + ' ') >= 0;
    }
    function addClass(elem, name) {
        if (!hasClass(elem, name)) {
            elem.className += (elem.className ? ' ' : '') + name;
        }
    }
    function toggleClass(elem, name) {
        if (hasClass(elem, name)) {
            removeClass(elem, name);
        }
        else {
            addClass(elem, name);
        }
    }
    function removeClass(elem, name) {
        var set = ' ' + elem.className + ' ';
        while (set.indexOf(' ' + name + ' ') >= 0) {
            set = set.replace(' ' + name + ' ', ' ');
        }
        elem.className = typeof set.trim === 'function' ? set.trim() : set.replace(/^\s+|\s+$/g, '');
    }
    function id(name) {
        return defined.document && document.getElementById && document.getElementById(name);
    }
    function getUrlConfigHtml() {
        var i, j, val, escaped, escapedTooltip, selection = false, len = config.urlConfig.length, urlConfigHtml = '';
        for (i = 0; i < len; i++) {
            val = config.urlConfig[i];
            if (typeof val === 'string') {
                val = {
                    id: val,
                    label: val,
                };
            }
            escaped = escapeText(val.id);
            escapedTooltip = escapeText(val.tooltip);
            if (config[val.id] === undefined) {
                config[val.id] = QUnit.urlParams[val.id];
            }
            if (!val.value || typeof val.value === 'string') {
                urlConfigHtml +=
                    "<input id='qunit-urlconfig-" +
                        escaped +
                        "' name='" +
                        escaped +
                        "' type='checkbox'" +
                        (val.value ? " value='" + escapeText(val.value) + "'" : '') +
                        (config[val.id] ? " checked='checked'" : '') +
                        " title='" +
                        escapedTooltip +
                        "' /><label for='qunit-urlconfig-" +
                        escaped +
                        "' title='" +
                        escapedTooltip +
                        "'>" +
                        val.label +
                        '</label>';
            }
            else {
                urlConfigHtml +=
                    "<label for='qunit-urlconfig-" +
                        escaped +
                        "' title='" +
                        escapedTooltip +
                        "'>" +
                        val.label +
                        ": </label><select id='qunit-urlconfig-" +
                        escaped +
                        "' name='" +
                        escaped +
                        "' title='" +
                        escapedTooltip +
                        "'><option></option>";
                if (QUnit.is('array', val.value)) {
                    for (j = 0; j < val.value.length; j++) {
                        escaped = escapeText(val.value[j]);
                        urlConfigHtml +=
                            "<option value='" +
                                escaped +
                                "'" +
                                (config[val.id] === val.value[j] ? (selection = true) && " selected='selected'" : '') +
                                '>' +
                                escaped +
                                '</option>';
                    }
                }
                else {
                    for (j in val.value) {
                        if (hasOwn.call(val.value, j)) {
                            urlConfigHtml +=
                                "<option value='" +
                                    escapeText(j) +
                                    "'" +
                                    (config[val.id] === j ? (selection = true) && " selected='selected'" : '') +
                                    '>' +
                                    escapeText(val.value[j]) +
                                    '</option>';
                        }
                    }
                }
                if (config[val.id] && !selection) {
                    escaped = escapeText(config[val.id]);
                    urlConfigHtml +=
                        "<option value='" + escaped + "' selected='selected' disabled='disabled'>" + escaped + '</option>';
                }
                urlConfigHtml += '</select>';
            }
        }
        return urlConfigHtml;
    }
    function toolbarChanged() {
        var updatedUrl, value, field = this, params = {};
        if ('selectedIndex' in field) {
            value = field.options[field.selectedIndex].value || undefined;
        }
        else {
            value = field.checked ? field.defaultValue || true : undefined;
        }
        params[field.name] = value;
        updatedUrl = setUrl(params);
        if ('hidepassed' === field.name && 'replaceState' in window.history) {
            config[field.name] = value || false;
            if (value) {
                addClass(id('qunit-tests'), 'hidepass');
            }
            else {
                removeClass(id('qunit-tests'), 'hidepass');
            }
            window.history.replaceState(null, '', updatedUrl);
        }
        else {
            window.location = updatedUrl;
        }
    }
    function setUrl(params) {
        var key, querystring = '?';
        params = QUnit.extend(QUnit.extend({}, QUnit.urlParams), params);
        for (key in params) {
            if (hasOwn.call(params, key)) {
                if (params[key] === undefined) {
                    continue;
                }
                querystring += encodeURIComponent(key);
                if (params[key] !== true) {
                    querystring += '=' + encodeURIComponent(params[key]);
                }
                querystring += '&';
            }
        }
        return location.protocol + '//' + location.host + location.pathname + querystring.slice(0, -1);
    }
    function applyUrlParams() {
        var selectedModule, modulesList = id('qunit-modulefilter'), filter = id('qunit-filter-input').value;
        selectedModule = modulesList ? decodeURIComponent(modulesList.options[modulesList.selectedIndex].value) : undefined;
        window.location = setUrl({
            module: selectedModule === '' ? undefined : selectedModule,
            filter: filter === '' ? undefined : filter,
            testId: undefined,
        });
    }
    function toolbarUrlConfigContainer() {
        var urlConfigContainer = document.createElement('span');
        urlConfigContainer.innerHTML = getUrlConfigHtml();
        addClass(urlConfigContainer, 'qunit-url-config');
        addEvents(urlConfigContainer.getElementsByTagName('input'), 'click', toolbarChanged);
        addEvents(urlConfigContainer.getElementsByTagName('select'), 'change', toolbarChanged);
        return urlConfigContainer;
    }
    function toolbarLooseFilter() {
        var filter = document.createElement('form'), label = document.createElement('label'), input = document.createElement('input'), button = document.createElement('button');
        addClass(filter, 'qunit-filter');
        label.innerHTML = 'Filter: ';
        input.type = 'text';
        input.value = config.filter || '';
        input.name = 'filter';
        input.id = 'qunit-filter-input';
        button.innerHTML = 'Go';
        label.appendChild(input);
        filter.appendChild(label);
        filter.appendChild(button);
        addEvent(filter, 'submit', function (ev) {
            applyUrlParams();
            if (ev && ev.preventDefault) {
                ev.preventDefault();
            }
            return false;
        });
        return filter;
    }
    function toolbarModuleFilterHtml() {
        var i, moduleFilterHtml = '';
        if (!modulesList.length) {
            return false;
        }
        modulesList.sort(function (a, b) {
            return a.localeCompare(b);
        });
        moduleFilterHtml +=
            "<label for='qunit-modulefilter'>Module: </label>" +
                "<select id='qunit-modulefilter' name='modulefilter'><option value='' " +
                (QUnit.urlParams.module === undefined ? "selected='selected'" : '') +
                '>< All Modules ></option>';
        for (i = 0; i < modulesList.length; i++) {
            moduleFilterHtml +=
                "<option value='" +
                    escapeText(encodeURIComponent(modulesList[i])) +
                    "' " +
                    (QUnit.urlParams.module === modulesList[i] ? "selected='selected'" : '') +
                    '>' +
                    escapeText(modulesList[i]) +
                    '</option>';
        }
        moduleFilterHtml += '</select>';
        return moduleFilterHtml;
    }
    function toolbarModuleFilter() {
        var toolbar = id('qunit-testrunner-toolbar'), moduleFilter = document.createElement('span'), moduleFilterHtml = toolbarModuleFilterHtml();
        if (!toolbar || !moduleFilterHtml) {
            return false;
        }
        moduleFilter.setAttribute('id', 'qunit-modulefilter-container');
        moduleFilter.innerHTML = moduleFilterHtml;
        addEvent(moduleFilter.lastChild, 'change', applyUrlParams);
        toolbar.appendChild(moduleFilter);
    }
    function appendToolbar() {
        var toolbar = id('qunit-testrunner-toolbar');
        if (toolbar) {
            toolbar.appendChild(toolbarUrlConfigContainer());
            toolbar.appendChild(toolbarLooseFilter());
        }
    }
    function appendHeader() {
        var header = id('qunit-header');
        if (header) {
            header.innerHTML =
                "<a href='" +
                    setUrl({ filter: undefined, module: undefined, testId: undefined }) +
                    "'>" +
                    header.innerHTML +
                    '</a> ';
        }
    }
    function appendBanner() {
        var banner = id('qunit-banner');
        if (banner) {
            banner.className = '';
        }
    }
    function appendTestResults() {
        var tests = id('qunit-tests'), result = id('qunit-testresult');
        if (result) {
            result.parentNode.removeChild(result);
        }
        if (tests) {
            tests.innerHTML = '';
            result = document.createElement('p');
            result.id = 'qunit-testresult';
            result.className = 'result';
            tests.parentNode.insertBefore(result, tests);
            result.innerHTML = 'Running...<br />&#160;';
        }
    }
    function storeFixture() {
        var fixture = id('qunit-fixture');
        if (fixture) {
            config.fixture = fixture.innerHTML;
        }
    }
    function appendUserAgent() {
        var userAgent = id('qunit-userAgent');
        if (userAgent) {
            userAgent.innerHTML = '';
            userAgent.appendChild(document.createTextNode('QUnit ' + QUnit.version + '; ' + navigator.userAgent));
        }
    }
    function appendTestsList(modules) {
        var i, l, x, z, test, moduleObj;
        for (i = 0, l = modules.length; i < l; i++) {
            moduleObj = modules[i];
            if (moduleObj.name) {
                modulesList.push(moduleObj.name);
            }
            for (x = 0, z = moduleObj.tests.length; x < z; x++) {
                test = moduleObj.tests[x];
                appendTest(test.name, test.testId, moduleObj.name);
            }
        }
    }
    function appendTest(name, testId, moduleName) {
        var title, rerunTrigger, testBlock, assertList, tests = id('qunit-tests');
        if (!tests) {
            return;
        }
        title = document.createElement('strong');
        title.innerHTML = getNameHtml(name, moduleName);
        rerunTrigger = document.createElement('a');
        rerunTrigger.innerHTML = 'Rerun';
        rerunTrigger.href = setUrl({ testId: testId });
        testBlock = document.createElement('li');
        testBlock.appendChild(title);
        testBlock.appendChild(rerunTrigger);
        testBlock.id = 'qunit-test-output-' + testId;
        assertList = document.createElement('ol');
        assertList.className = 'qunit-assert-list';
        testBlock.appendChild(assertList);
        tests.appendChild(testBlock);
    }
    QUnit.begin(function (details) {
        var qunit = id('qunit');
        storeFixture();
        if (qunit) {
            qunit.innerHTML =
                "<h1 id='qunit-header'>" +
                    escapeText(document.title) +
                    '</h1>' +
                    "<h2 id='qunit-banner'></h2>" +
                    "<div id='qunit-testrunner-toolbar'></div>" +
                    "<h2 id='qunit-userAgent'></h2>" +
                    "<ol id='qunit-tests'></ol>";
        }
        appendHeader();
        appendBanner();
        appendTestResults();
        appendUserAgent();
        appendToolbar();
        appendTestsList(details.modules);
        toolbarModuleFilter();
        if (qunit && config.hidepassed) {
            addClass(qunit.lastChild, 'hidepass');
        }
    });
    QUnit.done(function (details) {
        var i, key, banner = id('qunit-banner'), tests = id('qunit-tests'), html = [
            'Tests completed in ',
            details.runtime,
            ' milliseconds.<br />',
            "<span class='passed'>",
            details.passed,
            "</span> assertions of <span class='total'>",
            details.total,
            "</span> passed, <span class='failed'>",
            details.failed,
            '</span> failed.',
        ].join('');
        if (banner) {
            banner.className = details.failed ? 'qunit-fail' : 'qunit-pass';
        }
        if (tests) {
            id('qunit-testresult').innerHTML = html;
        }
        if (config.altertitle && defined.document && document.title) {
            document.title = [details.failed ? '\u2716' : '\u2714', document.title.replace(/^[\u2714\u2716] /i, '')].join(' ');
        }
        if (config.reorder && defined.sessionStorage && details.failed === 0) {
            for (i = 0; i < sessionStorage.length; i++) {
                key = sessionStorage.key(i++);
                if (key.indexOf('qunit-test-') === 0) {
                    sessionStorage.removeItem(key);
                }
            }
        }
        if (config.scrolltop && window.scrollTo) {
            window.scrollTo(0, 0);
        }
    });
    function getNameHtml(name, module) {
        var nameHtml = '';
        if (module) {
            nameHtml = "<span class='module-name'>" + escapeText(module) + '</span>: ';
        }
        nameHtml += "<span class='test-name'>" + escapeText(name) + '</span>';
        return nameHtml;
    }
    QUnit.testStart(function (details) {
        var running, testBlock, bad;
        testBlock = id('qunit-test-output-' + details.testId);
        if (testBlock) {
            testBlock.className = 'running';
        }
        else {
            appendTest(details.name, details.testId, details.module);
        }
        running = id('qunit-testresult');
        if (running) {
            bad =
                QUnit.config.reorder &&
                    defined.sessionStorage &&
                    +sessionStorage.getItem('qunit-test-' + details.module + '-' + details.name);
            running.innerHTML =
                (bad ? 'Rerunning previously failed test: <br />' : 'Running: <br />') +
                    getNameHtml(details.name, details.module);
        }
    });
    function stripHtml(string) {
        return string
            .replace(/<\/?[^>]+(>|$)/g, '')
            .replace(/\&quot;/g, '')
            .replace(/\s+/g, '');
    }
    QUnit.log(function (details) {
        var assertList, assertLi, message, expected, actual, diff, showDiff = false, testItem = id('qunit-test-output-' + details.testId);
        if (!testItem) {
            return;
        }
        message = escapeText(details.message) || (details.result ? 'okay' : 'failed');
        message = "<span class='test-message'>" + message + '</span>';
        message += "<span class='runtime'>@ " + details.runtime + ' ms</span>';
        if (!details.result && hasOwn.call(details, 'expected')) {
            if (details.negative) {
                expected = escapeText('NOT ' + QUnit.dump.parse(details.expected));
            }
            else {
                expected = escapeText(QUnit.dump.parse(details.expected));
            }
            actual = escapeText(QUnit.dump.parse(details.actual));
            message += "<table><tr class='test-expected'><th>Expected: </th><td><pre>" + expected + '</pre></td></tr>';
            if (actual !== expected) {
                message += "<tr class='test-actual'><th>Result: </th><td><pre>" + actual + '</pre></td></tr>';
                if (!/^(true|false)$/.test(actual) && !/^(true|false)$/.test(expected)) {
                    diff = QUnit.diff(expected, actual);
                    showDiff = stripHtml(diff).length !== stripHtml(expected).length + stripHtml(actual).length;
                }
                if (showDiff) {
                    message += "<tr class='test-diff'><th>Diff: </th><td><pre>" + diff + '</pre></td></tr>';
                }
            }
            else if (expected.indexOf('[object Array]') !== -1 || expected.indexOf('[object Object]') !== -1) {
                message +=
                    "<tr class='test-message'><th>Message: </th><td>" +
                        'Diff suppressed as the depth of object is more than current max depth (' +
                        QUnit.config.maxDepth +
                        ').<p>Hint: Use <code>QUnit.dump.maxDepth</code> to ' +
                        " run with a higher max depth or <a href='" +
                        setUrl({ maxDepth: -1 }) +
                        "'>" +
                        'Rerun</a> without max depth.</p></td></tr>';
            }
            if (details.source) {
                message +=
                    "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + '</pre></td></tr>';
            }
            message += '</table>';
        }
        else if (!details.result && details.source) {
            message +=
                '<table>' +
                    "<tr class='test-source'><th>Source: </th><td><pre>" +
                    escapeText(details.source) +
                    '</pre></td></tr>' +
                    '</table>';
        }
        assertList = testItem.getElementsByTagName('ol')[0];
        assertLi = document.createElement('li');
        assertLi.className = details.result ? 'pass' : 'fail';
        assertLi.innerHTML = message;
        assertList.appendChild(assertLi);
    });
    QUnit.testDone(function (details) {
        var testTitle, time, testItem, assertList, good, bad, testCounts, skipped, sourceName, tests = id('qunit-tests');
        if (!tests) {
            return;
        }
        testItem = id('qunit-test-output-' + details.testId);
        assertList = testItem.getElementsByTagName('ol')[0];
        good = details.passed;
        bad = details.failed;
        if (config.reorder && defined.sessionStorage) {
            if (bad) {
                sessionStorage.setItem('qunit-test-' + details.module + '-' + details.name, bad);
            }
            else {
                sessionStorage.removeItem('qunit-test-' + details.module + '-' + details.name);
            }
        }
        if (bad === 0) {
            addClass(assertList, 'qunit-collapsed');
        }
        testTitle = testItem.firstChild;
        testCounts = bad ? "<b class='failed'>" + bad + '</b>, ' + "<b class='passed'>" + good + '</b>, ' : '';
        testTitle.innerHTML += " <b class='counts'>(" + testCounts + details.assertions.length + ')</b>';
        if (details.skipped) {
            testItem.className = 'skipped';
            skipped = document.createElement('em');
            skipped.className = 'qunit-skipped-label';
            skipped.innerHTML = 'skipped';
            testItem.insertBefore(skipped, testTitle);
        }
        else {
            addEvent(testTitle, 'click', function () {
                toggleClass(assertList, 'qunit-collapsed');
            });
            testItem.className = bad ? 'fail' : 'pass';
            time = document.createElement('span');
            time.className = 'runtime';
            time.innerHTML = details.runtime + ' ms';
            testItem.insertBefore(time, assertList);
        }
        if (details.source) {
            sourceName = document.createElement('p');
            sourceName.innerHTML = '<strong>Source: </strong>' + details.source;
            addClass(sourceName, 'qunit-source');
            if (bad === 0) {
                addClass(sourceName, 'qunit-collapsed');
            }
            addEvent(testTitle, 'click', function () {
                toggleClass(sourceName, 'qunit-collapsed');
            });
            testItem.appendChild(sourceName);
        }
    });
    if (defined.document) {
        var notPhantom = (function (p) {
            return !(p && p.version && p.version.major > 0);
        })(window.phantom);
        if (notPhantom && document.readyState === 'complete') {
            QUnit.load();
        }
        else {
            addEvent(window, 'load', QUnit.load);
        }
    }
    else {
        config.pageLoaded = true;
        config.autorun = true;
    }
})();
