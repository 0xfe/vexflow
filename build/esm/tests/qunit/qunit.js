"use strict";
(function () {
    'use strict';
    function _typeof(obj) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
            return typeof obj;
        } : function (obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, _typeof(obj);
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }
    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps)
            _defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", {
            writable: false
        });
        return Constructor;
    }
    function _slicedToArray(arr, i) {
        return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _toConsumableArray(arr) {
        return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }
    function _arrayWithoutHoles(arr) {
        if (Array.isArray(arr))
            return _arrayLikeToArray(arr);
    }
    function _arrayWithHoles(arr) {
        if (Array.isArray(arr))
            return arr;
    }
    function _iterableToArray(iter) {
        if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
            return Array.from(iter);
    }
    function _iterableToArrayLimit(arr, i) {
        var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
        if (_i == null)
            return;
        var _arr = [];
        var _n = true;
        var _d = false;
        var _s, _e;
        try {
            for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (i && _arr.length === i)
                    break;
            }
        }
        catch (err) {
            _d = true;
            _e = err;
        }
        finally {
            try {
                if (!_n && _i["return"] != null)
                    _i["return"]();
            }
            finally {
                if (_d)
                    throw _e;
            }
        }
        return _arr;
    }
    function _unsupportedIterableToArray(o, minLen) {
        if (!o)
            return;
        if (typeof o === "string")
            return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor)
            n = o.constructor.name;
        if (n === "Map" || n === "Set")
            return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length)
            len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++)
            arr2[i] = arr[i];
        return arr2;
    }
    function _nonIterableSpread() {
        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _nonIterableRest() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _createForOfIteratorHelper(o, allowArrayLike) {
        var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
        if (!it) {
            if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
                if (it)
                    o = it;
                var i = 0;
                var F = function () { };
                return {
                    s: F,
                    n: function () {
                        if (i >= o.length)
                            return {
                                done: true
                            };
                        return {
                            done: false,
                            value: o[i++]
                        };
                    },
                    e: function (e) {
                        throw e;
                    },
                    f: F
                };
            }
            throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        var normalCompletion = true, didErr = false, err;
        return {
            s: function () {
                it = it.call(o);
            },
            n: function () {
                var step = it.next();
                normalCompletion = step.done;
                return step;
            },
            e: function (e) {
                didErr = true;
                err = e;
            },
            f: function () {
                try {
                    if (!normalCompletion && it.return != null)
                        it.return();
                }
                finally {
                    if (didErr)
                        throw err;
                }
            }
        };
    }
    function getGlobalThis() {
        if (typeof globalThis !== 'undefined') {
            return globalThis;
        }
        if (typeof self !== 'undefined') {
            return self;
        }
        if (typeof window$1 !== 'undefined') {
            return window$1;
        }
        if (typeof global !== 'undefined') {
            return global;
        }
        throw new Error('Unable to locate global object');
    }
    var g = getGlobalThis();
    var window$1 = g.window;
    var console$1 = g.console;
    var setTimeout$1 = g.setTimeout;
    var clearTimeout = g.clearTimeout;
    var document = window$1 && window$1.document;
    var navigator = window$1 && window$1.navigator;
    var localSessionStorage = function () {
        var x = 'qunit-test-string';
        try {
            g.sessionStorage.setItem(x, x);
            g.sessionStorage.removeItem(x);
            return g.sessionStorage;
        }
        catch (e) {
            return undefined;
        }
    }();
    var StringMap = typeof g.Map === 'function' && typeof g.Map.prototype.keys === 'function' && typeof g.Symbol === 'function' && _typeof(g.Symbol.iterator) === 'symbol' ? g.Map : function StringMap(input) {
        var _this = this;
        var store = Object.create(null);
        var hasOwn = Object.prototype.hasOwnProperty;
        this.has = function (strKey) {
            return hasOwn.call(store, strKey);
        };
        this.get = function (strKey) {
            return store[strKey];
        };
        this.set = function (strKey, val) {
            if (!hasOwn.call(store, strKey)) {
                this.size++;
            }
            store[strKey] = val;
            return this;
        };
        this.delete = function (strKey) {
            if (hasOwn.call(store, strKey)) {
                delete store[strKey];
                this.size--;
            }
        };
        this.forEach = function (callback) {
            for (var strKey in store) {
                callback(store[strKey], strKey);
            }
        };
        this.keys = function () {
            return Object.keys(store);
        };
        this.clear = function () {
            store = Object.create(null);
            this.size = 0;
        };
        this.size = 0;
        if (input) {
            input.forEach(function (val, strKey) {
                _this.set(strKey, val);
            });
        }
    };
    var StringSet = typeof g.Set === 'function' && typeof g.Set.prototype.values === 'function' ? g.Set : function (input) {
        var set = Object.create(null);
        if (Array.isArray(input)) {
            input.forEach(function (item) {
                set[item] = true;
            });
        }
        return {
            add: function add(value) {
                set[value] = true;
            },
            has: function has(value) {
                return value in set;
            },
            get size() {
                return Object.keys(set).length;
            }
        };
    };
    var Logger = {
        warn: console$1 ? Function.prototype.bind.call(console$1.warn || console$1.log, console$1) : function () { }
    };
    var toString = Object.prototype.toString;
    var hasOwn$1 = Object.prototype.hasOwnProperty;
    var nativePerf = getNativePerf();
    function getNativePerf() {
        if (window$1 && typeof window$1.performance !== 'undefined' && typeof window$1.performance.mark === 'function' && typeof window$1.performance.measure === 'function') {
            return window$1.performance;
        }
        else {
            return undefined;
        }
    }
    var performance = {
        now: nativePerf ? nativePerf.now.bind(nativePerf) : Date.now,
        measure: nativePerf ? function (comment, startMark, endMark) {
            try {
                nativePerf.measure(comment, startMark, endMark);
            }
            catch (ex) {
                Logger.warn('performance.measure could not be executed because of ', ex.message);
            }
        } : function () { },
        mark: nativePerf ? nativePerf.mark.bind(nativePerf) : function () { }
    };
    function diff(a, b) {
        return a.filter(function (a) {
            return b.indexOf(a) === -1;
        });
    }
    function inArray(elem, array) {
        return array.indexOf(elem) !== -1;
    }
    function objectValues(obj) {
        var allowArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var vals = allowArray && is('array', obj) ? [] : {};
        for (var key in obj) {
            if (hasOwn$1.call(obj, key)) {
                var val = obj[key];
                vals[key] = val === Object(val) ? objectValues(val, allowArray) : val;
            }
        }
        return vals;
    }
    function objectValuesSubset(obj, model) {
        if (obj !== Object(obj)) {
            return obj;
        }
        var subset = {};
        for (var key in model) {
            if (hasOwn$1.call(model, key) && hasOwn$1.call(obj, key)) {
                subset[key] = objectValuesSubset(obj[key], model[key]);
            }
        }
        return subset;
    }
    function extend(a, b, undefOnly) {
        for (var prop in b) {
            if (hasOwn$1.call(b, prop)) {
                if (b[prop] === undefined) {
                    delete a[prop];
                }
                else if (!(undefOnly && typeof a[prop] !== 'undefined')) {
                    a[prop] = b[prop];
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
        var match = toString.call(obj).match(/^\[object\s(.*)\]$/);
        var type = match && match[1];
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
            case 'Symbol':
                return type.toLowerCase();
            default:
                return _typeof(obj);
        }
    }
    function is(type, obj) {
        return objectType(obj) === type;
    }
    function generateHash(module, testName) {
        var str = module + '\x1C' + testName;
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        var hex = (0x100000000 + hash).toString(16);
        if (hex.length < 8) {
            hex = '0000000' + hex;
        }
        return hex.slice(-8);
    }
    function errorString(error) {
        var resultErrorString = String(error);
        if (resultErrorString.slice(0, 7) === '[object') {
            return (error.name || 'Error') + (error.message ? ": ".concat(error.message) : '');
        }
        else {
            return resultErrorString;
        }
    }
    var BOXABLE_TYPES = new StringSet(['boolean', 'number', 'string']);
    var memory = [];
    function useStrictEquality(a, b) {
        return a === b;
    }
    function useObjectValueEquality(a, b) {
        return a === b || a.valueOf() === b.valueOf();
    }
    function compareConstructors(a, b) {
        return getConstructor(a) === getConstructor(b);
    }
    function getConstructor(obj) {
        var proto = Object.getPrototypeOf(obj);
        return !proto || proto.constructor === null ? Object : obj.constructor;
    }
    function getRegExpFlags(regexp) {
        return 'flags' in regexp ? regexp.flags : regexp.toString().match(/[gimuy]*$/)[0];
    }
    var objTypeCallbacks = {
        undefined: useStrictEquality,
        null: useStrictEquality,
        boolean: useObjectValueEquality,
        number: function number(a, b) {
            return a === b || a.valueOf() === b.valueOf() || isNaN(a.valueOf()) && isNaN(b.valueOf());
        },
        string: useObjectValueEquality,
        symbol: useStrictEquality,
        date: useObjectValueEquality,
        nan: function nan() {
            return true;
        },
        regexp: function regexp(a, b) {
            return a.source === b.source &&
                getRegExpFlags(a) === getRegExpFlags(b);
        },
        function: useStrictEquality,
        array: function array(a, b) {
            if (a.length !== b.length) {
                return false;
            }
            for (var i = 0; i < a.length; i++) {
                if (!typeEquiv(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        },
        set: function set(a, b) {
            if (a.size !== b.size) {
                return false;
            }
            var outerEq = true;
            a.forEach(function (aVal) {
                if (!outerEq) {
                    return;
                }
                var innerEq = false;
                b.forEach(function (bVal) {
                    if (innerEq) {
                        return;
                    }
                    var originalMemory = memory;
                    memory = [];
                    if (typeEquiv(bVal, aVal)) {
                        innerEq = true;
                    }
                    memory = originalMemory;
                });
                if (!innerEq) {
                    outerEq = false;
                }
            });
            return outerEq;
        },
        map: function map(a, b) {
            if (a.size !== b.size) {
                return false;
            }
            var outerEq = true;
            a.forEach(function (aVal, aKey) {
                if (!outerEq) {
                    return;
                }
                var innerEq = false;
                b.forEach(function (bVal, bKey) {
                    if (innerEq) {
                        return;
                    }
                    var originalMemory = memory;
                    memory = [];
                    if (objTypeCallbacks.array([bVal, bKey], [aVal, aKey])) {
                        innerEq = true;
                    }
                    memory = originalMemory;
                });
                if (!innerEq) {
                    outerEq = false;
                }
            });
            return outerEq;
        }
    };
    var entryTypeCallbacks = {
        undefined: useStrictEquality,
        null: useStrictEquality,
        boolean: useStrictEquality,
        number: function number(a, b) {
            return a === b || isNaN(a) && isNaN(b);
        },
        string: useStrictEquality,
        symbol: useStrictEquality,
        function: useStrictEquality,
        object: function object(a, b) {
            if (memory.some(function (pair) {
                return pair.a === a && pair.b === b;
            })) {
                return true;
            }
            memory.push({
                a: a,
                b: b
            });
            var aObjType = objectType(a);
            var bObjType = objectType(b);
            if (aObjType !== 'object' || bObjType !== 'object') {
                return aObjType === bObjType && objTypeCallbacks[aObjType](a, b);
            }
            if (compareConstructors(a, b) === false) {
                return false;
            }
            var aProperties = [];
            var bProperties = [];
            for (var i in a) {
                aProperties.push(i);
                if (a.constructor !== Object && typeof a.constructor !== 'undefined' && typeof a[i] === 'function' && typeof b[i] === 'function' && a[i].toString() === b[i].toString()) {
                    continue;
                }
                if (!typeEquiv(a[i], b[i])) {
                    return false;
                }
            }
            for (var _i in b) {
                bProperties.push(_i);
            }
            return objTypeCallbacks.array(aProperties.sort(), bProperties.sort());
        }
    };
    function typeEquiv(a, b) {
        if (a === b) {
            return true;
        }
        var aType = _typeof(a);
        var bType = _typeof(b);
        if (aType !== bType) {
            return (aType === 'object' && BOXABLE_TYPES.has(objectType(a)) ? a.valueOf() : a) === (bType === 'object' && BOXABLE_TYPES.has(objectType(b)) ? b.valueOf() : b);
        }
        return entryTypeCallbacks[aType](a, b);
    }
    function innerEquiv(a, b) {
        var res = typeEquiv(a, b);
        memory = [];
        return res;
    }
    function equiv(a, b) {
        if (arguments.length === 2) {
            return a === b || innerEquiv(a, b);
        }
        var i = arguments.length - 1;
        while (i > 0) {
            if (!innerEquiv(arguments[i - 1], arguments[i])) {
                return false;
            }
            i--;
        }
        return true;
    }
    var config = {
        altertitle: true,
        collapse: true,
        failOnZeroTests: true,
        filter: undefined,
        maxDepth: 5,
        module: undefined,
        moduleId: undefined,
        reorder: true,
        requireExpects: false,
        scrolltop: true,
        storage: localSessionStorage,
        testId: undefined,
        urlConfig: [],
        currentModule: {
            name: '',
            tests: [],
            childModules: [],
            testsRun: 0,
            testsIgnored: 0,
            hooks: {
                before: [],
                beforeEach: [],
                afterEach: [],
                after: []
            }
        },
        globalHooks: {},
        blocking: true,
        callbacks: {},
        modules: [],
        queue: [],
        stats: {
            all: 0,
            bad: 0,
            testCount: 0
        }
    };
    var preConfig = g && g.QUnit && !g.QUnit.version && g.QUnit.config;
    if (preConfig) {
        extend(config, preConfig);
    }
    config.modules.push(config.currentModule);
    var dump = (function () {
        function quote(str) {
            return '"' + str.toString().replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
        }
        function literal(o) {
            return o + '';
        }
        function join(pre, arr, post) {
            var s = dump.separator();
            var inner = dump.indent(1);
            if (arr.join) {
                arr = arr.join(',' + s + inner);
            }
            if (!arr) {
                return pre + post;
            }
            var base = dump.indent();
            return [pre, inner + arr, base + post].join(s);
        }
        function array(arr, stack) {
            if (dump.maxDepth && dump.depth > dump.maxDepth) {
                return '[object Array]';
            }
            this.up();
            var i = arr.length;
            var ret = new Array(i);
            while (i--) {
                ret[i] = this.parse(arr[i], undefined, stack);
            }
            this.down();
            return join('[', ret, ']');
        }
        function isArray(obj) {
            return (toString.call(obj) === '[object Array]' ||
                typeof obj.length === 'number' && obj.item !== undefined && (obj.length ? obj.item(0) === obj[0] : obj.item(0) === null && obj[0] === undefined));
        }
        var reName = /^function (\w+)/;
        var dump = {
            parse: function parse(obj, objType, stack) {
                stack = stack || [];
                var objIndex = stack.indexOf(obj);
                if (objIndex !== -1) {
                    return "recursion(".concat(objIndex - stack.length, ")");
                }
                objType = objType || this.typeOf(obj);
                var parser = this.parsers[objType];
                var parserType = _typeof(parser);
                if (parserType === 'function') {
                    stack.push(obj);
                    var res = parser.call(this, obj, stack);
                    stack.pop();
                    return res;
                }
                if (parserType === 'string') {
                    return parser;
                }
                return '[ERROR: Missing QUnit.dump formatter for type ' + objType + ']';
            },
            typeOf: function typeOf(obj) {
                var type;
                if (obj === null) {
                    type = 'null';
                }
                else if (typeof obj === 'undefined') {
                    type = 'undefined';
                }
                else if (is('regexp', obj)) {
                    type = 'regexp';
                }
                else if (is('date', obj)) {
                    type = 'date';
                }
                else if (is('function', obj)) {
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
                else if (isArray(obj)) {
                    type = 'array';
                }
                else if (obj.constructor === Error.prototype.constructor) {
                    type = 'error';
                }
                else {
                    type = _typeof(obj);
                }
                return type;
            },
            separator: function separator() {
                if (this.multiline) {
                    return this.HTML ? '<br />' : '\n';
                }
                else {
                    return this.HTML ? '&#160;' : ' ';
                }
            },
            indent: function indent(extra) {
                if (!this.multiline) {
                    return '';
                }
                var chr = this.indentChar;
                if (this.HTML) {
                    chr = chr.replace(/\t/g, '   ').replace(/ /g, '&#160;');
                }
                return new Array(this.depth + (extra || 0)).join(chr);
            },
            up: function up(a) {
                this.depth += a || 1;
            },
            down: function down(a) {
                this.depth -= a || 1;
            },
            setParser: function setParser(name, parser) {
                this.parsers[name] = parser;
            },
            quote: quote,
            literal: literal,
            join: join,
            depth: 1,
            maxDepth: config.maxDepth,
            parsers: {
                window: '[Window]',
                document: '[Document]',
                error: function error(_error) {
                    return 'Error("' + _error.message + '")';
                },
                unknown: '[Unknown]',
                null: 'null',
                undefined: 'undefined',
                function: function _function(fn) {
                    var ret = 'function';
                    var name = 'name' in fn ? fn.name : (reName.exec(fn) || [])[1];
                    if (name) {
                        ret += ' ' + name;
                    }
                    ret += '(';
                    ret = [ret, dump.parse(fn, 'functionArgs'), '){'].join('');
                    return join(ret, dump.parse(fn, 'functionCode'), '}');
                },
                array: array,
                nodelist: array,
                arguments: array,
                object: function object(map, stack) {
                    var ret = [];
                    if (dump.maxDepth && dump.depth > dump.maxDepth) {
                        return '[object Object]';
                    }
                    dump.up();
                    var keys = [];
                    for (var key in map) {
                        keys.push(key);
                    }
                    var nonEnumerableProperties = ['message', 'name'];
                    for (var i in nonEnumerableProperties) {
                        var _key = nonEnumerableProperties[i];
                        if (_key in map && !inArray(_key, keys)) {
                            keys.push(_key);
                        }
                    }
                    keys.sort();
                    for (var _i = 0; _i < keys.length; _i++) {
                        var _key2 = keys[_i];
                        var val = map[_key2];
                        ret.push(dump.parse(_key2, 'key') + ': ' + dump.parse(val, undefined, stack));
                    }
                    dump.down();
                    return join('{', ret, '}');
                },
                node: function node(_node) {
                    var open = dump.HTML ? '&lt;' : '<';
                    var close = dump.HTML ? '&gt;' : '>';
                    var tag = _node.nodeName.toLowerCase();
                    var ret = open + tag;
                    var attrs = _node.attributes;
                    if (attrs) {
                        for (var i = 0; i < attrs.length; i++) {
                            var val = attrs[i].nodeValue;
                            if (val && val !== 'inherit') {
                                ret += ' ' + attrs[i].nodeName + '=' + dump.parse(val, 'attribute');
                            }
                        }
                    }
                    ret += close;
                    if (_node.nodeType === 3 || _node.nodeType === 4) {
                        ret += _node.nodeValue;
                    }
                    return ret + open + '/' + tag + close;
                },
                functionArgs: function functionArgs(fn) {
                    var l = fn.length;
                    if (!l) {
                        return '';
                    }
                    var args = new Array(l);
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
                symbol: function symbol(sym) {
                    return sym.toString();
                }
            },
            HTML: false,
            indentChar: '  ',
            multiline: true
        };
        return dump;
    })();
    var SuiteReport = function () {
        function SuiteReport(name, parentSuite) {
            _classCallCheck(this, SuiteReport);
            this.name = name;
            this.fullName = parentSuite ? parentSuite.fullName.concat(name) : [];
            this.globalFailureCount = 0;
            this.tests = [];
            this.childSuites = [];
            if (parentSuite) {
                parentSuite.pushChildSuite(this);
            }
        }
        _createClass(SuiteReport, [{
                key: "start",
                value: function start(recordTime) {
                    if (recordTime) {
                        this._startTime = performance.now();
                        var suiteLevel = this.fullName.length;
                        performance.mark("qunit_suite_".concat(suiteLevel, "_start"));
                    }
                    return {
                        name: this.name,
                        fullName: this.fullName.slice(),
                        tests: this.tests.map(function (test) {
                            return test.start();
                        }),
                        childSuites: this.childSuites.map(function (suite) {
                            return suite.start();
                        }),
                        testCounts: {
                            total: this.getTestCounts().total
                        }
                    };
                }
            }, {
                key: "end",
                value: function end(recordTime) {
                    if (recordTime) {
                        this._endTime = performance.now();
                        var suiteLevel = this.fullName.length;
                        var suiteName = this.fullName.join(' – ');
                        performance.mark("qunit_suite_".concat(suiteLevel, "_end"));
                        performance.measure(suiteLevel === 0 ? 'QUnit Test Run' : "QUnit Test Suite: ".concat(suiteName), "qunit_suite_".concat(suiteLevel, "_start"), "qunit_suite_".concat(suiteLevel, "_end"));
                    }
                    return {
                        name: this.name,
                        fullName: this.fullName.slice(),
                        tests: this.tests.map(function (test) {
                            return test.end();
                        }),
                        childSuites: this.childSuites.map(function (suite) {
                            return suite.end();
                        }),
                        testCounts: this.getTestCounts(),
                        runtime: this.getRuntime(),
                        status: this.getStatus()
                    };
                }
            }, {
                key: "pushChildSuite",
                value: function pushChildSuite(suite) {
                    this.childSuites.push(suite);
                }
            }, {
                key: "pushTest",
                value: function pushTest(test) {
                    this.tests.push(test);
                }
            }, {
                key: "getRuntime",
                value: function getRuntime() {
                    return Math.round(this._endTime - this._startTime);
                }
            }, {
                key: "getTestCounts",
                value: function getTestCounts() {
                    var counts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
                        passed: 0,
                        failed: 0,
                        skipped: 0,
                        todo: 0,
                        total: 0
                    };
                    counts.failed += this.globalFailureCount;
                    counts.total += this.globalFailureCount;
                    counts = this.tests.reduce(function (counts, test) {
                        if (test.valid) {
                            counts[test.getStatus()]++;
                            counts.total++;
                        }
                        return counts;
                    }, counts);
                    return this.childSuites.reduce(function (counts, suite) {
                        return suite.getTestCounts(counts);
                    }, counts);
                }
            }, {
                key: "getStatus",
                value: function getStatus() {
                    var _this$getTestCounts = this.getTestCounts(), total = _this$getTestCounts.total, failed = _this$getTestCounts.failed, skipped = _this$getTestCounts.skipped, todo = _this$getTestCounts.todo;
                    if (failed) {
                        return 'failed';
                    }
                    else {
                        if (skipped === total) {
                            return 'skipped';
                        }
                        else if (todo === total) {
                            return 'todo';
                        }
                        else {
                            return 'passed';
                        }
                    }
                }
            }]);
        return SuiteReport;
    }();
    var moduleStack = [];
    var runSuite = new SuiteReport();
    function isParentModuleInQueue() {
        var modulesInQueue = config.modules.filter(function (module) {
            return !module.ignored;
        }).map(function (module) {
            return module.moduleId;
        });
        return moduleStack.some(function (module) {
            return modulesInQueue.includes(module.moduleId);
        });
    }
    function createModule(name, testEnvironment, modifiers) {
        var parentModule = moduleStack.length ? moduleStack.slice(-1)[0] : null;
        var moduleName = parentModule !== null ? [parentModule.name, name].join(' > ') : name;
        var parentSuite = parentModule ? parentModule.suiteReport : runSuite;
        var skip = parentModule !== null && parentModule.skip || modifiers.skip;
        var todo = parentModule !== null && parentModule.todo || modifiers.todo;
        var env = {};
        if (parentModule) {
            extend(env, parentModule.testEnvironment);
        }
        extend(env, testEnvironment);
        var module = {
            name: moduleName,
            parentModule: parentModule,
            hooks: {
                before: [],
                beforeEach: [],
                afterEach: [],
                after: []
            },
            testEnvironment: env,
            tests: [],
            moduleId: generateHash(moduleName),
            testsRun: 0,
            testsIgnored: 0,
            childModules: [],
            suiteReport: new SuiteReport(name, parentSuite),
            stats: null,
            skip: skip,
            todo: skip ? false : todo,
            ignored: modifiers.ignored || false
        };
        if (parentModule) {
            parentModule.childModules.push(module);
        }
        config.modules.push(module);
        return module;
    }
    function setHookFromEnvironment(hooks, environment, name) {
        var potentialHook = environment[name];
        if (typeof potentialHook === 'function') {
            hooks[name].push(potentialHook);
        }
        delete environment[name];
    }
    function makeSetHook(module, hookName) {
        return function setHook(callback) {
            if (config.currentModule !== module) {
                Logger.warn('The `' + hookName + '` hook was called inside the wrong module (`' + config.currentModule.name + '`). ' + 'Instead, use hooks provided by the callback to the containing module (`' + module.name + '`). ' + 'This will become an error in QUnit 3.0.');
            }
            module.hooks[hookName].push(callback);
        };
    }
    function processModule(name, options, executeNow) {
        var modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        if (typeof options === 'function') {
            executeNow = options;
            options = undefined;
        }
        var module = createModule(name, options, modifiers);
        var testEnvironment = module.testEnvironment;
        var hooks = module.hooks;
        setHookFromEnvironment(hooks, testEnvironment, 'before');
        setHookFromEnvironment(hooks, testEnvironment, 'beforeEach');
        setHookFromEnvironment(hooks, testEnvironment, 'afterEach');
        setHookFromEnvironment(hooks, testEnvironment, 'after');
        var moduleFns = {
            before: makeSetHook(module, 'before'),
            beforeEach: makeSetHook(module, 'beforeEach'),
            afterEach: makeSetHook(module, 'afterEach'),
            after: makeSetHook(module, 'after')
        };
        var prevModule = config.currentModule;
        config.currentModule = module;
        if (typeof executeNow === 'function') {
            moduleStack.push(module);
            try {
                var cbReturnValue = executeNow.call(module.testEnvironment, moduleFns);
                if (cbReturnValue && typeof cbReturnValue.then === 'function') {
                    Logger.warn('Returning a promise from a module callback is not supported. ' + 'Instead, use hooks for async behavior. ' + 'This will become an error in QUnit 3.0.');
                }
            }
            finally {
                moduleStack.pop();
                config.currentModule = module.parentModule || prevModule;
            }
        }
    }
    var focused$1 = false;
    function module$1(name, options, executeNow) {
        var ignored = focused$1 && !isParentModuleInQueue();
        processModule(name, options, executeNow, {
            ignored: ignored
        });
    }
    module$1.only = function () {
        if (!focused$1) {
            config.modules.length = 0;
            config.queue.length = 0;
            config.currentModule.ignored = true;
        }
        focused$1 = true;
        processModule.apply(void 0, arguments);
    };
    module$1.skip = function (name, options, executeNow) {
        if (focused$1) {
            return;
        }
        processModule(name, options, executeNow, {
            skip: true
        });
    };
    module$1.todo = function (name, options, executeNow) {
        if (focused$1) {
            return;
        }
        processModule(name, options, executeNow, {
            todo: true
        });
    };
    var fileName = (sourceFromStacktrace(0) || '').replace(/(:\d+)+\)?/, '')
        .replace(/.+[/\\]/, '');
    function extractStacktrace(e, offset) {
        offset = offset === undefined ? 4 : offset;
        if (e && e.stack) {
            var stack = e.stack.split('\n');
            if (/^error$/i.test(stack[0])) {
                stack.shift();
            }
            if (fileName) {
                var include = [];
                for (var i = offset; i < stack.length; i++) {
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
    var Assert = function () {
        function Assert(testContext) {
            _classCallCheck(this, Assert);
            this.test = testContext;
        }
        _createClass(Assert, [{
                key: "timeout",
                value: function timeout(duration) {
                    if (typeof duration !== 'number') {
                        throw new Error('You must pass a number as the duration to assert.timeout');
                    }
                    this.test.timeout = duration;
                    if (config.timeout) {
                        clearTimeout(config.timeout);
                        config.timeout = null;
                        if (config.timeoutHandler && this.test.timeout > 0) {
                            this.test.internalResetTimeout(this.test.timeout);
                        }
                    }
                }
            }, {
                key: "step",
                value: function step(message) {
                    var assertionMessage = message;
                    var result = !!message;
                    this.test.steps.push(message);
                    if (typeof message === 'undefined' || message === '') {
                        assertionMessage = 'You must provide a message to assert.step';
                    }
                    else if (typeof message !== 'string') {
                        assertionMessage = 'You must provide a string value to assert.step';
                        result = false;
                    }
                    this.pushResult({
                        result: result,
                        message: assertionMessage
                    });
                }
            }, {
                key: "verifySteps",
                value: function verifySteps(steps, message) {
                    var actualStepsClone = this.test.steps.slice();
                    this.deepEqual(actualStepsClone, steps, message);
                    this.test.steps.length = 0;
                }
            }, {
                key: "expect",
                value: function expect(asserts) {
                    if (arguments.length === 1) {
                        this.test.expected = asserts;
                    }
                    else {
                        return this.test.expected;
                    }
                }
            }, {
                key: "async",
                value: function async(count) {
                    var requiredCalls = count === undefined ? 1 : count;
                    return this.test.internalStop(requiredCalls);
                }
            }, {
                key: "push",
                value: function push(result, actual, expected, message, negative) {
                    Logger.warn('assert.push is deprecated and will be removed in QUnit 3.0.' + ' Please use assert.pushResult instead (https://api.qunitjs.com/assert/pushResult).');
                    var currentAssert = this instanceof Assert ? this : config.current.assert;
                    return currentAssert.pushResult({
                        result: result,
                        actual: actual,
                        expected: expected,
                        message: message,
                        negative: negative
                    });
                }
            }, {
                key: "pushResult",
                value: function pushResult(resultInfo) {
                    var assert = this;
                    var currentTest = assert instanceof Assert && assert.test || config.current;
                    if (!currentTest) {
                        throw new Error('assertion outside test context, in ' + sourceFromStacktrace(2));
                    }
                    if (!(assert instanceof Assert)) {
                        assert = currentTest.assert;
                    }
                    return assert.test.pushResult(resultInfo);
                }
            }, {
                key: "ok",
                value: function ok(result, message) {
                    if (!message) {
                        message = result ? 'okay' : "failed, expected argument to be truthy, was: ".concat(dump.parse(result));
                    }
                    this.pushResult({
                        result: !!result,
                        actual: result,
                        expected: true,
                        message: message
                    });
                }
            }, {
                key: "notOk",
                value: function notOk(result, message) {
                    if (!message) {
                        message = !result ? 'okay' : "failed, expected argument to be falsy, was: ".concat(dump.parse(result));
                    }
                    this.pushResult({
                        result: !result,
                        actual: result,
                        expected: false,
                        message: message
                    });
                }
            }, {
                key: "true",
                value: function _true(result, message) {
                    this.pushResult({
                        result: result === true,
                        actual: result,
                        expected: true,
                        message: message
                    });
                }
            }, {
                key: "false",
                value: function _false(result, message) {
                    this.pushResult({
                        result: result === false,
                        actual: result,
                        expected: false,
                        message: message
                    });
                }
            }, {
                key: "equal",
                value: function equal(actual, expected, message) {
                    this.pushResult({
                        result: expected == actual,
                        actual: actual,
                        expected: expected,
                        message: message
                    });
                }
            }, {
                key: "notEqual",
                value: function notEqual(actual, expected, message) {
                    this.pushResult({
                        result: expected != actual,
                        actual: actual,
                        expected: expected,
                        message: message,
                        negative: true
                    });
                }
            }, {
                key: "propEqual",
                value: function propEqual(actual, expected, message) {
                    actual = objectValues(actual);
                    expected = objectValues(expected);
                    this.pushResult({
                        result: equiv(actual, expected),
                        actual: actual,
                        expected: expected,
                        message: message
                    });
                }
            }, {
                key: "notPropEqual",
                value: function notPropEqual(actual, expected, message) {
                    actual = objectValues(actual);
                    expected = objectValues(expected);
                    this.pushResult({
                        result: !equiv(actual, expected),
                        actual: actual,
                        expected: expected,
                        message: message,
                        negative: true
                    });
                }
            }, {
                key: "propContains",
                value: function propContains(actual, expected, message) {
                    actual = objectValuesSubset(actual, expected);
                    expected = objectValues(expected, false);
                    this.pushResult({
                        result: equiv(actual, expected),
                        actual: actual,
                        expected: expected,
                        message: message
                    });
                }
            }, {
                key: "notPropContains",
                value: function notPropContains(actual, expected, message) {
                    actual = objectValuesSubset(actual, expected);
                    expected = objectValues(expected);
                    this.pushResult({
                        result: !equiv(actual, expected),
                        actual: actual,
                        expected: expected,
                        message: message,
                        negative: true
                    });
                }
            }, {
                key: "deepEqual",
                value: function deepEqual(actual, expected, message) {
                    this.pushResult({
                        result: equiv(actual, expected),
                        actual: actual,
                        expected: expected,
                        message: message
                    });
                }
            }, {
                key: "notDeepEqual",
                value: function notDeepEqual(actual, expected, message) {
                    this.pushResult({
                        result: !equiv(actual, expected),
                        actual: actual,
                        expected: expected,
                        message: message,
                        negative: true
                    });
                }
            }, {
                key: "strictEqual",
                value: function strictEqual(actual, expected, message) {
                    this.pushResult({
                        result: expected === actual,
                        actual: actual,
                        expected: expected,
                        message: message
                    });
                }
            }, {
                key: "notStrictEqual",
                value: function notStrictEqual(actual, expected, message) {
                    this.pushResult({
                        result: expected !== actual,
                        actual: actual,
                        expected: expected,
                        message: message,
                        negative: true
                    });
                }
            }, {
                key: 'throws',
                value: function throws(block, expected, message) {
                    var _validateExpectedExce = validateExpectedExceptionArgs(expected, message, 'throws');
                    var _validateExpectedExce2 = _slicedToArray(_validateExpectedExce, 2);
                    expected = _validateExpectedExce2[0];
                    message = _validateExpectedExce2[1];
                    var currentTest = this instanceof Assert && this.test || config.current;
                    if (typeof block !== 'function') {
                        currentTest.assert.pushResult({
                            result: false,
                            actual: block,
                            message: 'The value provided to `assert.throws` in ' + '"' + currentTest.testName + '" was not a function.'
                        });
                        return;
                    }
                    var actual;
                    var result = false;
                    currentTest.ignoreGlobalErrors = true;
                    try {
                        block.call(currentTest.testEnvironment);
                    }
                    catch (e) {
                        actual = e;
                    }
                    currentTest.ignoreGlobalErrors = false;
                    if (actual) {
                        var _validateException = validateException(actual, expected, message);
                        var _validateException2 = _slicedToArray(_validateException, 3);
                        result = _validateException2[0];
                        expected = _validateException2[1];
                        message = _validateException2[2];
                    }
                    currentTest.assert.pushResult({
                        result: result,
                        actual: actual && errorString(actual),
                        expected: expected,
                        message: message
                    });
                }
            }, {
                key: "rejects",
                value: function rejects(promise, expected, message) {
                    var _validateExpectedExce3 = validateExpectedExceptionArgs(expected, message, 'rejects');
                    var _validateExpectedExce4 = _slicedToArray(_validateExpectedExce3, 2);
                    expected = _validateExpectedExce4[0];
                    message = _validateExpectedExce4[1];
                    var currentTest = this instanceof Assert && this.test || config.current;
                    var then = promise && promise.then;
                    if (typeof then !== 'function') {
                        currentTest.assert.pushResult({
                            result: false,
                            message: 'The value provided to `assert.rejects` in ' + '"' + currentTest.testName + '" was not a promise.',
                            actual: promise
                        });
                        return;
                    }
                    var done = this.async();
                    return then.call(promise, function handleFulfillment() {
                        currentTest.assert.pushResult({
                            result: false,
                            message: 'The promise returned by the `assert.rejects` callback in ' + '"' + currentTest.testName + '" did not reject.',
                            actual: promise
                        });
                        done();
                    }, function handleRejection(actual) {
                        var result;
                        var _validateException3 = validateException(actual, expected, message);
                        var _validateException4 = _slicedToArray(_validateException3, 3);
                        result = _validateException4[0];
                        expected = _validateException4[1];
                        message = _validateException4[2];
                        currentTest.assert.pushResult({
                            result: result,
                            actual: actual && errorString(actual),
                            expected: expected,
                            message: message
                        });
                        done();
                    });
                }
            }]);
        return Assert;
    }();
    function validateExpectedExceptionArgs(expected, message, assertionMethod) {
        var expectedType = objectType(expected);
        if (expectedType === 'string') {
            if (message === undefined) {
                message = expected;
                expected = undefined;
                return [expected, message];
            }
            else {
                throw new Error('assert.' + assertionMethod + ' does not accept a string value for the expected argument.\n' + 'Use a non-string object value (e.g. RegExp or validator function) ' + 'instead if necessary.');
            }
        }
        var valid = !expected ||
            expectedType === 'regexp' || expectedType === 'function' || expectedType === 'object';
        if (!valid) {
            throw new Error('Invalid expected value type (' + expectedType + ') ' + 'provided to assert.' + assertionMethod + '.');
        }
        return [expected, message];
    }
    function validateException(actual, expected, message) {
        var result = false;
        var expectedType = objectType(expected);
        if (!expected) {
            result = true;
        }
        else if (expectedType === 'regexp') {
            result = expected.test(errorString(actual));
            expected = String(expected);
        }
        else if (expectedType === 'function' && expected.prototype !== undefined && actual instanceof expected) {
            result = true;
        }
        else if (expectedType === 'object') {
            result = actual instanceof expected.constructor && actual.name === expected.name && actual.message === expected.message;
            expected = errorString(expected);
        }
        else if (expectedType === 'function') {
            try {
                result = expected.call({}, actual) === true;
                expected = null;
            }
            catch (e) {
                expected = errorString(e);
            }
        }
        return [result, expected, message];
    }
    Assert.prototype.raises = Assert.prototype['throws'];
    var LISTENERS = Object.create(null);
    var SUPPORTED_EVENTS = ['error', 'runStart', 'suiteStart', 'testStart', 'assertion', 'testEnd', 'suiteEnd', 'runEnd'];
    function emit(eventName, data) {
        if (typeof eventName !== 'string') {
            throw new TypeError('eventName must be a string when emitting an event');
        }
        var originalCallbacks = LISTENERS[eventName];
        var callbacks = originalCallbacks ? _toConsumableArray(originalCallbacks) : [];
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i](data);
        }
    }
    function on(eventName, callback) {
        if (typeof eventName !== 'string') {
            throw new TypeError('eventName must be a string when registering a listener');
        }
        else if (!inArray(eventName, SUPPORTED_EVENTS)) {
            var events = SUPPORTED_EVENTS.join(', ');
            throw new Error("\"".concat(eventName, "\" is not a valid event; must be one of: ").concat(events, "."));
        }
        else if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function when registering a listener');
        }
        if (!LISTENERS[eventName]) {
            LISTENERS[eventName] = [];
        }
        if (!inArray(callback, LISTENERS[eventName])) {
            LISTENERS[eventName].push(callback);
        }
    }
    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
    function commonjsRequire(path) {
        throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
    }
    var promisePolyfill = { exports: {} };
    (function () {
        var globalNS = function () {
            if (typeof globalThis !== 'undefined') {
                return globalThis;
            }
            if (typeof self !== 'undefined') {
                return self;
            }
            if (typeof window !== 'undefined') {
                return window;
            }
            if (typeof commonjsGlobal !== 'undefined') {
                return commonjsGlobal;
            }
            throw new Error('unable to locate global object');
        }();
        if (typeof globalNS['Promise'] === 'function') {
            promisePolyfill.exports = globalNS['Promise'];
            return;
        }
        function finallyConstructor(callback) {
            var constructor = this.constructor;
            return this.then(function (value) {
                return constructor.resolve(callback()).then(function () {
                    return value;
                });
            }, function (reason) {
                return constructor.resolve(callback()).then(function () {
                    return constructor.reject(reason);
                });
            });
        }
        function allSettled(arr) {
            var P = this;
            return new P(function (resolve, reject) {
                if (!(arr && typeof arr.length !== 'undefined')) {
                    return reject(new TypeError(_typeof(arr) + ' ' + arr + ' is not iterable(cannot read property Symbol(Symbol.iterator))'));
                }
                var args = Array.prototype.slice.call(arr);
                if (args.length === 0)
                    return resolve([]);
                var remaining = args.length;
                function res(i, val) {
                    if (val && (_typeof(val) === 'object' || typeof val === 'function')) {
                        var then = val.then;
                        if (typeof then === 'function') {
                            then.call(val, function (val) {
                                res(i, val);
                            }, function (e) {
                                args[i] = {
                                    status: 'rejected',
                                    reason: e
                                };
                                if (--remaining === 0) {
                                    resolve(args);
                                }
                            });
                            return;
                        }
                    }
                    args[i] = {
                        status: 'fulfilled',
                        value: val
                    };
                    if (--remaining === 0) {
                        resolve(args);
                    }
                }
                for (var i = 0; i < args.length; i++) {
                    res(i, args[i]);
                }
            });
        }
        var setTimeoutFunc = setTimeout;
        function isArray(x) {
            return Boolean(x && typeof x.length !== 'undefined');
        }
        function noop() { }
        function bind(fn, thisArg) {
            return function () {
                fn.apply(thisArg, arguments);
            };
        }
        function Promise(fn) {
            if (!(this instanceof Promise))
                throw new TypeError('Promises must be constructed via new');
            if (typeof fn !== 'function')
                throw new TypeError('not a function');
            this._state = 0;
            this._handled = false;
            this._value = undefined;
            this._deferreds = [];
            doResolve(fn, this);
        }
        function handle(self, deferred) {
            while (self._state === 3) {
                self = self._value;
            }
            if (self._state === 0) {
                self._deferreds.push(deferred);
                return;
            }
            self._handled = true;
            Promise._immediateFn(function () {
                var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
                if (cb === null) {
                    (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
                    return;
                }
                var ret;
                try {
                    ret = cb(self._value);
                }
                catch (e) {
                    reject(deferred.promise, e);
                    return;
                }
                resolve(deferred.promise, ret);
            });
        }
        function resolve(self, newValue) {
            try {
                if (newValue === self)
                    throw new TypeError('A promise cannot be resolved with itself.');
                if (newValue && (_typeof(newValue) === 'object' || typeof newValue === 'function')) {
                    var then = newValue.then;
                    if (newValue instanceof Promise) {
                        self._state = 3;
                        self._value = newValue;
                        finale(self);
                        return;
                    }
                    else if (typeof then === 'function') {
                        doResolve(bind(then, newValue), self);
                        return;
                    }
                }
                self._state = 1;
                self._value = newValue;
                finale(self);
            }
            catch (e) {
                reject(self, e);
            }
        }
        function reject(self, newValue) {
            self._state = 2;
            self._value = newValue;
            finale(self);
        }
        function finale(self) {
            if (self._state === 2 && self._deferreds.length === 0) {
                Promise._immediateFn(function () {
                    if (!self._handled) {
                        Promise._unhandledRejectionFn(self._value);
                    }
                });
            }
            for (var i = 0, len = self._deferreds.length; i < len; i++) {
                handle(self, self._deferreds[i]);
            }
            self._deferreds = null;
        }
        function Handler(onFulfilled, onRejected, promise) {
            this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
            this.onRejected = typeof onRejected === 'function' ? onRejected : null;
            this.promise = promise;
        }
        function doResolve(fn, self) {
            var done = false;
            try {
                fn(function (value) {
                    if (done)
                        return;
                    done = true;
                    resolve(self, value);
                }, function (reason) {
                    if (done)
                        return;
                    done = true;
                    reject(self, reason);
                });
            }
            catch (ex) {
                if (done)
                    return;
                done = true;
                reject(self, ex);
            }
        }
        Promise.prototype['catch'] = function (onRejected) {
            return this.then(null, onRejected);
        };
        Promise.prototype.then = function (onFulfilled, onRejected) {
            var prom = new this.constructor(noop);
            handle(this, new Handler(onFulfilled, onRejected, prom));
            return prom;
        };
        Promise.prototype['finally'] = finallyConstructor;
        Promise.all = function (arr) {
            return new Promise(function (resolve, reject) {
                if (!isArray(arr)) {
                    return reject(new TypeError('Promise.all accepts an array'));
                }
                var args = Array.prototype.slice.call(arr);
                if (args.length === 0)
                    return resolve([]);
                var remaining = args.length;
                function res(i, val) {
                    try {
                        if (val && (_typeof(val) === 'object' || typeof val === 'function')) {
                            var then = val.then;
                            if (typeof then === 'function') {
                                then.call(val, function (val) {
                                    res(i, val);
                                }, reject);
                                return;
                            }
                        }
                        args[i] = val;
                        if (--remaining === 0) {
                            resolve(args);
                        }
                    }
                    catch (ex) {
                        reject(ex);
                    }
                }
                for (var i = 0; i < args.length; i++) {
                    res(i, args[i]);
                }
            });
        };
        Promise.allSettled = allSettled;
        Promise.resolve = function (value) {
            if (value && _typeof(value) === 'object' && value.constructor === Promise) {
                return value;
            }
            return new Promise(function (resolve) {
                resolve(value);
            });
        };
        Promise.reject = function (value) {
            return new Promise(function (resolve, reject) {
                reject(value);
            });
        };
        Promise.race = function (arr) {
            return new Promise(function (resolve, reject) {
                if (!isArray(arr)) {
                    return reject(new TypeError('Promise.race accepts an array'));
                }
                for (var i = 0, len = arr.length; i < len; i++) {
                    Promise.resolve(arr[i]).then(resolve, reject);
                }
            });
        };
        Promise._immediateFn =
            typeof setImmediate === 'function' && function (fn) {
                setImmediate(fn);
            } || function (fn) {
                setTimeoutFunc(fn, 0);
            };
        Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
            if (typeof console !== 'undefined' && console) {
                console.warn('Possible Unhandled Promise Rejection:', err);
            }
        };
        promisePolyfill.exports = Promise;
    })();
    var _Promise = promisePolyfill.exports;
    function registerLoggingCallbacks(obj) {
        var callbackNames = ['begin', 'done', 'log', 'testStart', 'testDone', 'moduleStart', 'moduleDone'];
        function registerLoggingCallback(key) {
            return function loggingCallback(callback) {
                if (typeof callback !== 'function') {
                    throw new Error('Callback parameter must be a function');
                }
                config.callbacks[key].push(callback);
            };
        }
        for (var i = 0; i < callbackNames.length; i++) {
            var key = callbackNames[i];
            if (typeof config.callbacks[key] === 'undefined') {
                config.callbacks[key] = [];
            }
            obj[key] = registerLoggingCallback(key);
        }
    }
    function runLoggingCallbacks(key, args) {
        var callbacks = config.callbacks[key];
        if (key === 'log') {
            callbacks.map(function (callback) {
                return callback(args);
            });
            return;
        }
        var promiseChain = _Promise.resolve();
        callbacks.forEach(function (callback) {
            promiseChain = promiseChain.then(function () {
                return _Promise.resolve(callback(args));
            });
        });
        return promiseChain;
    }
    var priorityCount = 0;
    var unitSampler;
    var taskQueue = [];
    function advance() {
        advanceTaskQueue();
        if (!taskQueue.length && !config.blocking && !config.current) {
            advanceTestQueue();
        }
    }
    function advanceTaskQueue() {
        var start = performance.now();
        config.depth = (config.depth || 0) + 1;
        processTaskQueue(start);
        config.depth--;
    }
    function processTaskQueue(start) {
        if (taskQueue.length && !config.blocking) {
            var elapsedTime = performance.now() - start;
            if (!setTimeout$1 || config.updateRate <= 0 || elapsedTime < config.updateRate) {
                var task = taskQueue.shift();
                _Promise.resolve(task()).then(function () {
                    if (!taskQueue.length) {
                        advance();
                    }
                    else {
                        processTaskQueue(start);
                    }
                });
            }
            else {
                setTimeout$1(advance);
            }
        }
    }
    function advanceTestQueue() {
        if (!config.blocking && !config.queue.length && config.depth === 0) {
            done();
            return;
        }
        var testTasks = config.queue.shift();
        addToTaskQueue(testTasks());
        if (priorityCount > 0) {
            priorityCount--;
        }
        advance();
    }
    function addToTaskQueue(tasksArray) {
        taskQueue.push.apply(taskQueue, _toConsumableArray(tasksArray));
    }
    function taskQueueLength() {
        return taskQueue.length;
    }
    function addToTestQueue(testTasksFunc, prioritize, seed) {
        if (prioritize) {
            config.queue.splice(priorityCount++, 0, testTasksFunc);
        }
        else if (seed) {
            if (!unitSampler) {
                unitSampler = unitSamplerGenerator(seed);
            }
            var index = Math.floor(unitSampler() * (config.queue.length - priorityCount + 1));
            config.queue.splice(priorityCount + index, 0, testTasksFunc);
        }
        else {
            config.queue.push(testTasksFunc);
        }
    }
    function unitSamplerGenerator(seed) {
        var sample = parseInt(generateHash(seed), 16) || -1;
        return function () {
            sample ^= sample << 13;
            sample ^= sample >>> 17;
            sample ^= sample << 5;
            if (sample < 0) {
                sample += 0x100000000;
            }
            return sample / 0x100000000;
        };
    }
    function done() {
        if (config.stats.testCount === 0 && config.failOnZeroTests === true) {
            var error;
            if (config.filter && config.filter.length) {
                error = new Error("No tests matched the filter \"".concat(config.filter, "\"."));
            }
            else if (config.module && config.module.length) {
                error = new Error("No tests matched the module \"".concat(config.module, "\"."));
            }
            else if (config.moduleId && config.moduleId.length) {
                error = new Error("No tests matched the moduleId \"".concat(config.moduleId, "\"."));
            }
            else if (config.testId && config.testId.length) {
                error = new Error("No tests matched the testId \"".concat(config.testId, "\"."));
            }
            else {
                error = new Error('No tests were run.');
            }
            test('global failure', extend(function (assert) {
                assert.pushResult({
                    result: false,
                    message: error.message,
                    source: error.stack
                });
            }, {
                validTest: true
            }));
            advance();
            return;
        }
        var storage = config.storage;
        var runtime = Math.round(performance.now() - config.started);
        var passed = config.stats.all - config.stats.bad;
        ProcessingQueue.finished = true;
        emit('runEnd', runSuite.end(true));
        runLoggingCallbacks('done', {
            passed: passed,
            failed: config.stats.bad,
            total: config.stats.all,
            runtime: runtime
        }).then(function () {
            if (storage && config.stats.bad === 0) {
                for (var i = storage.length - 1; i >= 0; i--) {
                    var key = storage.key(i);
                    if (key.indexOf('qunit-test-') === 0) {
                        storage.removeItem(key);
                    }
                }
            }
        });
    }
    var ProcessingQueue = {
        finished: false,
        add: addToTestQueue,
        advance: advance,
        taskCount: taskQueueLength
    };
    var TestReport = function () {
        function TestReport(name, suite, options) {
            _classCallCheck(this, TestReport);
            this.name = name;
            this.suiteName = suite.name;
            this.fullName = suite.fullName.concat(name);
            this.runtime = 0;
            this.assertions = [];
            this.skipped = !!options.skip;
            this.todo = !!options.todo;
            this.valid = options.valid;
            this._startTime = 0;
            this._endTime = 0;
            suite.pushTest(this);
        }
        _createClass(TestReport, [{
                key: "start",
                value: function start(recordTime) {
                    if (recordTime) {
                        this._startTime = performance.now();
                        performance.mark('qunit_test_start');
                    }
                    return {
                        name: this.name,
                        suiteName: this.suiteName,
                        fullName: this.fullName.slice()
                    };
                }
            }, {
                key: "end",
                value: function end(recordTime) {
                    if (recordTime) {
                        this._endTime = performance.now();
                        if (performance) {
                            performance.mark('qunit_test_end');
                            var testName = this.fullName.join(' – ');
                            performance.measure("QUnit Test: ".concat(testName), 'qunit_test_start', 'qunit_test_end');
                        }
                    }
                    return extend(this.start(), {
                        runtime: this.getRuntime(),
                        status: this.getStatus(),
                        errors: this.getFailedAssertions(),
                        assertions: this.getAssertions()
                    });
                }
            }, {
                key: "pushAssertion",
                value: function pushAssertion(assertion) {
                    this.assertions.push(assertion);
                }
            }, {
                key: "getRuntime",
                value: function getRuntime() {
                    return Math.round(this._endTime - this._startTime);
                }
            }, {
                key: "getStatus",
                value: function getStatus() {
                    if (this.skipped) {
                        return 'skipped';
                    }
                    var testPassed = this.getFailedAssertions().length > 0 ? this.todo : !this.todo;
                    if (!testPassed) {
                        return 'failed';
                    }
                    else if (this.todo) {
                        return 'todo';
                    }
                    else {
                        return 'passed';
                    }
                }
            }, {
                key: "getFailedAssertions",
                value: function getFailedAssertions() {
                    return this.assertions.filter(function (assertion) {
                        return !assertion.passed;
                    });
                }
            }, {
                key: "getAssertions",
                value: function getAssertions() {
                    return this.assertions.slice();
                }
            }, {
                key: "slimAssertions",
                value: function slimAssertions() {
                    this.assertions = this.assertions.map(function (assertion) {
                        delete assertion.actual;
                        delete assertion.expected;
                        return assertion;
                    });
                }
            }]);
        return TestReport;
    }();
    function Test(settings) {
        this.expected = null;
        this.assertions = [];
        this.module = config.currentModule;
        this.steps = [];
        this.timeout = undefined;
        this.data = undefined;
        this.withData = false;
        this.pauses = new StringMap();
        this.nextPauseId = 1;
        this.stackOffset = 3;
        extend(this, settings);
        if (this.module.skip) {
            this.skip = true;
            this.todo = false;
        }
        else if (this.module.todo && !this.skip) {
            this.todo = true;
        }
        if (ProcessingQueue.finished) {
            Logger.warn('Unexpected test after runEnd. This is unstable and will fail in QUnit 3.0.');
            return;
        }
        if (!this.skip && typeof this.callback !== 'function') {
            var method = this.todo ? 'QUnit.todo' : 'QUnit.test';
            throw new TypeError("You must provide a callback to ".concat(method, "(\"").concat(this.testName, "\")"));
        }
        for (var i = 0, l = this.module.tests; i < l.length; i++) {
            if (this.module.tests[i].name === this.testName) {
                this.testName += ' ';
            }
        }
        this.testId = generateHash(this.module.name, this.testName);
        ++Test.count;
        this.errorForStack = new Error();
        if (this.callback && this.callback.validTest) {
            this.errorForStack.stack = undefined;
        }
        this.testReport = new TestReport(this.testName, this.module.suiteReport, {
            todo: this.todo,
            skip: this.skip,
            valid: this.valid()
        });
        this.module.tests.push({
            name: this.testName,
            testId: this.testId,
            skip: !!this.skip
        });
        if (this.skip) {
            this.callback = function () { };
            this.async = false;
            this.expected = 0;
        }
        else {
            this.assert = new Assert(this);
        }
    }
    Test.count = 0;
    function getNotStartedModules(startModule) {
        var module = startModule;
        var modules = [];
        while (module && module.testsRun === 0) {
            modules.push(module);
            module = module.parentModule;
        }
        return modules.reverse();
    }
    Test.prototype = {
        get stack() {
            return extractStacktrace(this.errorForStack, this.stackOffset);
        },
        before: function before() {
            var _this = this;
            var module = this.module;
            var notStartedModules = getNotStartedModules(module);
            var moduleStartChain = _Promise.resolve();
            notStartedModules.forEach(function (startModule) {
                moduleStartChain = moduleStartChain.then(function () {
                    startModule.stats = {
                        all: 0,
                        bad: 0,
                        started: performance.now()
                    };
                    emit('suiteStart', startModule.suiteReport.start(true));
                    return runLoggingCallbacks('moduleStart', {
                        name: startModule.name,
                        tests: startModule.tests
                    });
                });
            });
            return moduleStartChain.then(function () {
                config.current = _this;
                _this.testEnvironment = extend({}, module.testEnvironment);
                _this.started = performance.now();
                emit('testStart', _this.testReport.start(true));
                return runLoggingCallbacks('testStart', {
                    name: _this.testName,
                    module: module.name,
                    testId: _this.testId,
                    previousFailure: _this.previousFailure
                }).then(function () {
                    if (!config.pollution) {
                        saveGlobal();
                    }
                });
            });
        },
        run: function run() {
            config.current = this;
            if (config.notrycatch) {
                runTest(this);
                return;
            }
            try {
                runTest(this);
            }
            catch (e) {
                this.pushFailure('Died on test #' + (this.assertions.length + 1) + ': ' + (e.message || e) + '\n' + this.stack, extractStacktrace(e, 0));
                saveGlobal();
                if (config.blocking) {
                    internalRecover(this);
                }
            }
            function runTest(test) {
                var promise;
                if (test.withData) {
                    promise = test.callback.call(test.testEnvironment, test.assert, test.data);
                }
                else {
                    promise = test.callback.call(test.testEnvironment, test.assert);
                }
                test.resolvePromise(promise);
                if (test.timeout === 0 && test.pauses.size > 0) {
                    pushFailure('Test did not finish synchronously even though assert.timeout( 0 ) was used.', sourceFromStacktrace(2));
                }
            }
        },
        after: function after() {
            checkPollution();
        },
        queueGlobalHook: function queueGlobalHook(hook, hookName) {
            var _this2 = this;
            var runHook = function runHook() {
                config.current = _this2;
                var promise;
                if (config.notrycatch) {
                    promise = hook.call(_this2.testEnvironment, _this2.assert);
                }
                else {
                    try {
                        promise = hook.call(_this2.testEnvironment, _this2.assert);
                    }
                    catch (error) {
                        _this2.pushFailure('Global ' + hookName + ' failed on ' + _this2.testName + ': ' + errorString(error), extractStacktrace(error, 0));
                        return;
                    }
                }
                _this2.resolvePromise(promise, hookName);
            };
            return runHook;
        },
        queueHook: function queueHook(hook, hookName, hookOwner) {
            var _this3 = this;
            var callHook = function callHook() {
                var promise = hook.call(_this3.testEnvironment, _this3.assert);
                _this3.resolvePromise(promise, hookName);
            };
            var runHook = function runHook() {
                if (hookName === 'before') {
                    if (hookOwner.testsRun !== 0) {
                        return;
                    }
                    _this3.preserveEnvironment = true;
                }
                if (hookName === 'after' && !lastTestWithinModuleExecuted(hookOwner) && (config.queue.length > 0 || ProcessingQueue.taskCount() > 2)) {
                    return;
                }
                config.current = _this3;
                if (config.notrycatch) {
                    callHook();
                    return;
                }
                try {
                    callHook();
                }
                catch (error) {
                    _this3.pushFailure(hookName + ' failed on ' + _this3.testName + ': ' + (error.message || error), extractStacktrace(error, 0));
                }
            };
            return runHook;
        },
        hooks: function hooks(handler) {
            var hooks = [];
            function processGlobalhooks(test) {
                if ((handler === 'beforeEach' || handler === 'afterEach') && config.globalHooks[handler]) {
                    for (var i = 0; i < config.globalHooks[handler].length; i++) {
                        hooks.push(test.queueGlobalHook(config.globalHooks[handler][i], handler));
                    }
                }
            }
            function processHooks(test, module) {
                if (module.parentModule) {
                    processHooks(test, module.parentModule);
                }
                if (module.hooks[handler].length) {
                    for (var i = 0; i < module.hooks[handler].length; i++) {
                        hooks.push(test.queueHook(module.hooks[handler][i], handler, module));
                    }
                }
            }
            if (!this.skip) {
                processGlobalhooks(this);
                processHooks(this, this.module);
            }
            return hooks;
        },
        finish: function finish() {
            config.current = this;
            if (setTimeout$1) {
                clearTimeout(this.timeout);
                config.timeoutHandler = null;
            }
            this.callback = undefined;
            if (this.steps.length) {
                var stepsList = this.steps.join(', ');
                this.pushFailure('Expected assert.verifySteps() to be called before end of test ' + "after using assert.step(). Unverified steps: ".concat(stepsList), this.stack);
            }
            if (config.requireExpects && this.expected === null) {
                this.pushFailure('Expected number of assertions to be defined, but expect() was ' + 'not called.', this.stack);
            }
            else if (this.expected !== null && this.expected !== this.assertions.length) {
                this.pushFailure('Expected ' + this.expected + ' assertions, but ' + this.assertions.length + ' were run', this.stack);
            }
            else if (this.expected === null && !this.assertions.length) {
                this.pushFailure('Expected at least one assertion, but none were run - call ' + 'expect(0) to accept zero assertions.', this.stack);
            }
            var module = this.module;
            var moduleName = module.name;
            var testName = this.testName;
            var skipped = !!this.skip;
            var todo = !!this.todo;
            var bad = 0;
            var storage = config.storage;
            this.runtime = Math.round(performance.now() - this.started);
            config.stats.all += this.assertions.length;
            config.stats.testCount += 1;
            module.stats.all += this.assertions.length;
            for (var i = 0; i < this.assertions.length; i++) {
                if (!this.assertions[i].result) {
                    bad++;
                    config.stats.bad++;
                    module.stats.bad++;
                }
            }
            if (skipped) {
                incrementTestsIgnored(module);
            }
            else {
                incrementTestsRun(module);
            }
            if (storage) {
                if (bad) {
                    storage.setItem('qunit-test-' + moduleName + '-' + testName, bad);
                }
                else {
                    storage.removeItem('qunit-test-' + moduleName + '-' + testName);
                }
            }
            emit('testEnd', this.testReport.end(true));
            this.testReport.slimAssertions();
            var test = this;
            return runLoggingCallbacks('testDone', {
                name: testName,
                module: moduleName,
                skipped: skipped,
                todo: todo,
                failed: bad,
                passed: this.assertions.length - bad,
                total: this.assertions.length,
                runtime: skipped ? 0 : this.runtime,
                assertions: this.assertions,
                testId: this.testId,
                get source() {
                    return test.stack;
                }
            }).then(function () {
                if (allTestsExecuted(module)) {
                    var completedModules = [module];
                    var parent = module.parentModule;
                    while (parent && allTestsExecuted(parent)) {
                        completedModules.push(parent);
                        parent = parent.parentModule;
                    }
                    var moduleDoneChain = _Promise.resolve();
                    completedModules.forEach(function (completedModule) {
                        moduleDoneChain = moduleDoneChain.then(function () {
                            return logSuiteEnd(completedModule);
                        });
                    });
                    return moduleDoneChain;
                }
            }).then(function () {
                config.current = undefined;
            });
            function logSuiteEnd(module) {
                var modules = [module];
                while (modules.length) {
                    var nextModule = modules.shift();
                    nextModule.hooks = {};
                    modules.push.apply(modules, _toConsumableArray(nextModule.childModules));
                }
                emit('suiteEnd', module.suiteReport.end(true));
                return runLoggingCallbacks('moduleDone', {
                    name: module.name,
                    tests: module.tests,
                    failed: module.stats.bad,
                    passed: module.stats.all - module.stats.bad,
                    total: module.stats.all,
                    runtime: Math.round(performance.now() - module.stats.started)
                });
            }
        },
        preserveTestEnvironment: function preserveTestEnvironment() {
            if (this.preserveEnvironment) {
                this.module.testEnvironment = this.testEnvironment;
                this.testEnvironment = extend({}, this.module.testEnvironment);
            }
        },
        queue: function queue() {
            var test = this;
            if (!this.valid()) {
                incrementTestsIgnored(this.module);
                return;
            }
            function runTest() {
                return [function () {
                        return test.before();
                    }].concat(_toConsumableArray(test.hooks('before')), [function () {
                        test.preserveTestEnvironment();
                    }], _toConsumableArray(test.hooks('beforeEach')), [function () {
                        test.run();
                    }], _toConsumableArray(test.hooks('afterEach').reverse()), _toConsumableArray(test.hooks('after').reverse()), [function () {
                        test.after();
                    }, function () {
                        return test.finish();
                    }]);
            }
            var previousFailCount = config.storage && +config.storage.getItem('qunit-test-' + this.module.name + '-' + this.testName);
            var prioritize = config.reorder && !!previousFailCount;
            this.previousFailure = !!previousFailCount;
            ProcessingQueue.add(runTest, prioritize, config.seed);
        },
        pushResult: function pushResult(resultInfo) {
            if (this !== config.current) {
                var message = resultInfo && resultInfo.message || '';
                var testName = this && this.testName || '';
                var error = 'Assertion occurred after test finished.\n' + '> Test: ' + testName + '\n' + '> Message: ' + message + '\n';
                throw new Error(error);
            }
            var details = {
                module: this.module.name,
                name: this.testName,
                result: resultInfo.result,
                message: resultInfo.message,
                actual: resultInfo.actual,
                testId: this.testId,
                negative: resultInfo.negative || false,
                runtime: Math.round(performance.now() - this.started),
                todo: !!this.todo
            };
            if (hasOwn$1.call(resultInfo, 'expected')) {
                details.expected = resultInfo.expected;
            }
            if (!resultInfo.result) {
                var source = resultInfo.source || sourceFromStacktrace();
                if (source) {
                    details.source = source;
                }
            }
            this.logAssertion(details);
            this.assertions.push({
                result: !!resultInfo.result,
                message: resultInfo.message
            });
        },
        pushFailure: function pushFailure(message, source, actual) {
            if (!(this instanceof Test)) {
                throw new Error('pushFailure() assertion outside test context, was ' + sourceFromStacktrace(2));
            }
            this.pushResult({
                result: false,
                message: message || 'error',
                actual: actual || null,
                source: source
            });
        },
        logAssertion: function logAssertion(details) {
            runLoggingCallbacks('log', details);
            var assertion = {
                passed: details.result,
                actual: details.actual,
                expected: details.expected,
                message: details.message,
                stack: details.source,
                todo: details.todo
            };
            this.testReport.pushAssertion(assertion);
            emit('assertion', assertion);
        },
        internalResetTimeout: function internalResetTimeout(timeoutDuration) {
            clearTimeout(config.timeout);
            config.timeout = setTimeout$1(config.timeoutHandler(timeoutDuration), timeoutDuration);
        },
        internalStop: function internalStop() {
            var requiredCalls = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
            config.blocking = true;
            var test = this;
            var pauseId = this.nextPauseId++;
            var pause = {
                cancelled: false,
                remaining: requiredCalls
            };
            test.pauses.set(pauseId, pause);
            function release() {
                if (pause.cancelled) {
                    return;
                }
                if (config.current === undefined) {
                    throw new Error('Unexpected release of async pause after tests finished.\n' + "> Test: ".concat(test.testName, " [async #").concat(pauseId, "]"));
                }
                if (config.current !== test) {
                    throw new Error('Unexpected release of async pause during a different test.\n' + "> Test: ".concat(test.testName, " [async #").concat(pauseId, "]"));
                }
                if (pause.remaining <= 0) {
                    throw new Error('Tried to release async pause that was already released.\n' + "> Test: ".concat(test.testName, " [async #").concat(pauseId, "]"));
                }
                pause.remaining--;
                if (pause.remaining === 0) {
                    test.pauses.delete(pauseId);
                }
                internalStart(test);
            }
            if (setTimeout$1) {
                var timeoutDuration;
                if (typeof test.timeout === 'number') {
                    timeoutDuration = test.timeout;
                }
                else if (typeof config.testTimeout === 'number') {
                    timeoutDuration = config.testTimeout;
                }
                if (typeof timeoutDuration === 'number' && timeoutDuration > 0) {
                    config.timeoutHandler = function (timeout) {
                        return function () {
                            config.timeout = null;
                            pause.cancelled = true;
                            test.pauses.delete(pauseId);
                            test.pushFailure("Test took longer than ".concat(timeout, "ms; test timed out."), sourceFromStacktrace(2));
                            internalStart(test);
                        };
                    };
                    clearTimeout(config.timeout);
                    config.timeout = setTimeout$1(config.timeoutHandler(timeoutDuration), timeoutDuration);
                }
            }
            return release;
        },
        resolvePromise: function resolvePromise(promise, phase) {
            if (promise != null) {
                var _test = this;
                var then = promise.then;
                if (typeof then === 'function') {
                    var resume = _test.internalStop();
                    var resolve = function resolve() {
                        resume();
                    };
                    if (config.notrycatch) {
                        then.call(promise, resolve);
                    }
                    else {
                        var reject = function reject(error) {
                            var message = 'Promise rejected ' + (!phase ? 'during' : phase.replace(/Each$/, '')) + ' "' + _test.testName + '": ' + (error && error.message || error);
                            _test.pushFailure(message, extractStacktrace(error, 0));
                            saveGlobal();
                            internalRecover(_test);
                        };
                        then.call(promise, resolve, reject);
                    }
                }
            }
        },
        valid: function valid() {
            if (this.callback && this.callback.validTest) {
                return true;
            }
            function moduleChainIdMatch(testModule, selectedId) {
                return (!selectedId || !selectedId.length || inArray(testModule.moduleId, selectedId) || testModule.parentModule && moduleChainIdMatch(testModule.parentModule, selectedId));
            }
            if (!moduleChainIdMatch(this.module, config.moduleId)) {
                return false;
            }
            if (config.testId && config.testId.length && !inArray(this.testId, config.testId)) {
                return false;
            }
            function moduleChainNameMatch(testModule, selectedModule) {
                if (!selectedModule) {
                    return true;
                }
                var testModuleName = testModule.name ? testModule.name.toLowerCase() : null;
                if (testModuleName === selectedModule) {
                    return true;
                }
                else if (testModule.parentModule) {
                    return moduleChainNameMatch(testModule.parentModule, selectedModule);
                }
                else {
                    return false;
                }
            }
            var selectedModule = config.module && config.module.toLowerCase();
            if (!moduleChainNameMatch(this.module, selectedModule)) {
                return false;
            }
            var filter = config.filter;
            if (!filter) {
                return true;
            }
            var regexFilter = /^(!?)\/([\w\W]*)\/(i?$)/.exec(filter);
            var fullName = this.module.name + ': ' + this.testName;
            return regexFilter ? this.regexFilter(!!regexFilter[1], regexFilter[2], regexFilter[3], fullName) : this.stringFilter(filter, fullName);
        },
        regexFilter: function regexFilter(exclude, pattern, flags, fullName) {
            var regex = new RegExp(pattern, flags);
            var match = regex.test(fullName);
            return match !== exclude;
        },
        stringFilter: function stringFilter(filter, fullName) {
            filter = filter.toLowerCase();
            fullName = fullName.toLowerCase();
            var include = filter.charAt(0) !== '!';
            if (!include) {
                filter = filter.slice(1);
            }
            if (fullName.indexOf(filter) !== -1) {
                return include;
            }
            return !include;
        }
    };
    function pushFailure() {
        if (!config.current) {
            throw new Error('pushFailure() assertion outside test context, in ' + sourceFromStacktrace(2));
        }
        var currentTest = config.current;
        return currentTest.pushFailure.apply(currentTest, arguments);
    }
    function saveGlobal() {
        config.pollution = [];
        if (config.noglobals) {
            for (var key in g) {
                if (hasOwn$1.call(g, key)) {
                    if (/^qunit-test-output/.test(key)) {
                        continue;
                    }
                    config.pollution.push(key);
                }
            }
        }
    }
    function checkPollution() {
        var old = config.pollution;
        saveGlobal();
        var newGlobals = diff(config.pollution, old);
        if (newGlobals.length > 0) {
            pushFailure('Introduced global variable(s): ' + newGlobals.join(', '));
        }
        var deletedGlobals = diff(old, config.pollution);
        if (deletedGlobals.length > 0) {
            pushFailure('Deleted global variable(s): ' + deletedGlobals.join(', '));
        }
    }
    var focused = false;
    function addTest(settings) {
        if (focused || config.currentModule.ignored) {
            return;
        }
        var newTest = new Test(settings);
        newTest.queue();
    }
    function addOnlyTest(settings) {
        if (config.currentModule.ignored) {
            return;
        }
        if (!focused) {
            config.queue.length = 0;
            focused = true;
        }
        var newTest = new Test(settings);
        newTest.queue();
    }
    function test(testName, callback) {
        addTest({
            testName: testName,
            callback: callback
        });
    }
    function makeEachTestName(testName, argument) {
        return "".concat(testName, " [").concat(argument, "]");
    }
    function runEach(data, eachFn) {
        if (Array.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                eachFn(data[i], i);
            }
        }
        else if (_typeof(data) === 'object' && data !== null) {
            for (var key in data) {
                eachFn(data[key], key);
            }
        }
        else {
            throw new Error("test.each() expects an array or object as input, but\nfound ".concat(_typeof(data), " instead."));
        }
    }
    extend(test, {
        todo: function todo(testName, callback) {
            addTest({
                testName: testName,
                callback: callback,
                todo: true
            });
        },
        skip: function skip(testName) {
            addTest({
                testName: testName,
                skip: true
            });
        },
        only: function only(testName, callback) {
            addOnlyTest({
                testName: testName,
                callback: callback
            });
        },
        each: function each(testName, dataset, callback) {
            runEach(dataset, function (data, testKey) {
                addTest({
                    testName: makeEachTestName(testName, testKey),
                    callback: callback,
                    withData: true,
                    stackOffset: 5,
                    data: data
                });
            });
        }
    });
    test.todo.each = function (testName, dataset, callback) {
        runEach(dataset, function (data, testKey) {
            addTest({
                testName: makeEachTestName(testName, testKey),
                callback: callback,
                todo: true,
                withData: true,
                stackOffset: 5,
                data: data
            });
        });
    };
    test.skip.each = function (testName, dataset) {
        runEach(dataset, function (_, testKey) {
            addTest({
                testName: makeEachTestName(testName, testKey),
                stackOffset: 5,
                skip: true
            });
        });
    };
    test.only.each = function (testName, dataset, callback) {
        runEach(dataset, function (data, testKey) {
            addOnlyTest({
                testName: makeEachTestName(testName, testKey),
                callback: callback,
                withData: true,
                stackOffset: 5,
                data: data
            });
        });
    };
    function internalRecover(test) {
        test.pauses.forEach(function (pause) {
            pause.cancelled = true;
        });
        test.pauses.clear();
        internalStart(test);
    }
    function internalStart(test) {
        if (test.pauses.size > 0) {
            return;
        }
        if (setTimeout$1) {
            clearTimeout(config.timeout);
            config.timeout = setTimeout$1(function () {
                if (test.pauses.size > 0) {
                    return;
                }
                clearTimeout(config.timeout);
                config.timeout = null;
                config.blocking = false;
                ProcessingQueue.advance();
            });
        }
        else {
            config.blocking = false;
            ProcessingQueue.advance();
        }
    }
    function collectTests(module) {
        var tests = [].concat(module.tests);
        var modules = _toConsumableArray(module.childModules);
        while (modules.length) {
            var nextModule = modules.shift();
            tests.push.apply(tests, nextModule.tests);
            modules.push.apply(modules, _toConsumableArray(nextModule.childModules));
        }
        return tests;
    }
    function allTestsExecuted(module) {
        return module.testsRun + module.testsIgnored === collectTests(module).length;
    }
    function lastTestWithinModuleExecuted(module) {
        return module.testsRun === collectTests(module).filter(function (test) {
            return !test.skip;
        }).length - 1;
    }
    function incrementTestsRun(module) {
        module.testsRun++;
        while (module = module.parentModule) {
            module.testsRun++;
        }
    }
    function incrementTestsIgnored(module) {
        module.testsIgnored++;
        while (module = module.parentModule) {
            module.testsIgnored++;
        }
    }
    function exportQUnit(QUnit) {
        var exportedModule = false;
        if (window$1 && document) {
            if (window$1.QUnit && window$1.QUnit.version) {
                throw new Error('QUnit has already been defined.');
            }
            window$1.QUnit = QUnit;
            exportedModule = true;
        }
        if (typeof module !== 'undefined' && module && module.exports) {
            module.exports = QUnit;
            module.exports.QUnit = QUnit;
            exportedModule = true;
        }
        if (typeof exports !== 'undefined' && exports) {
            exports.QUnit = QUnit;
            exportedModule = true;
        }
        if (typeof define === 'function' && define.amd) {
            define(function () {
                return QUnit;
            });
            QUnit.config.autostart = false;
            exportedModule = true;
        }
        if (!exportedModule) {
            g.QUnit = QUnit;
        }
    }
    var ConsoleReporter = function () {
        function ConsoleReporter(runner) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _classCallCheck(this, ConsoleReporter);
            this.log = options.log || Function.prototype.bind.call(console$1.log, console$1);
            runner.on('error', this.onError.bind(this));
            runner.on('runStart', this.onRunStart.bind(this));
            runner.on('testStart', this.onTestStart.bind(this));
            runner.on('testEnd', this.onTestEnd.bind(this));
            runner.on('runEnd', this.onRunEnd.bind(this));
        }
        _createClass(ConsoleReporter, [{
                key: "onError",
                value: function onError(error) {
                    this.log('error', error);
                }
            }, {
                key: "onRunStart",
                value: function onRunStart(runStart) {
                    this.log('runStart', runStart);
                }
            }, {
                key: "onTestStart",
                value: function onTestStart(test) {
                    this.log('testStart', test);
                }
            }, {
                key: "onTestEnd",
                value: function onTestEnd(test) {
                    this.log('testEnd', test);
                }
            }, {
                key: "onRunEnd",
                value: function onRunEnd(runEnd) {
                    this.log('runEnd', runEnd);
                }
            }], [{
                key: "init",
                value: function init(runner, options) {
                    return new ConsoleReporter(runner, options);
                }
            }]);
        return ConsoleReporter;
    }();
    var FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, isTTY = true;
    if (typeof process !== 'undefined') {
        var _ref = process.env || {};
        FORCE_COLOR = _ref.FORCE_COLOR;
        NODE_DISABLE_COLORS = _ref.NODE_DISABLE_COLORS;
        NO_COLOR = _ref.NO_COLOR;
        TERM = _ref.TERM;
        isTTY = process.stdout && process.stdout.isTTY;
    }
    var $ = {
        enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (FORCE_COLOR != null && FORCE_COLOR !== '0' || isTTY),
        reset: init(0, 0),
        bold: init(1, 22),
        dim: init(2, 22),
        italic: init(3, 23),
        underline: init(4, 24),
        inverse: init(7, 27),
        hidden: init(8, 28),
        strikethrough: init(9, 29),
        black: init(30, 39),
        red: init(31, 39),
        green: init(32, 39),
        yellow: init(33, 39),
        blue: init(34, 39),
        magenta: init(35, 39),
        cyan: init(36, 39),
        white: init(37, 39),
        gray: init(90, 39),
        grey: init(90, 39),
        bgBlack: init(40, 49),
        bgRed: init(41, 49),
        bgGreen: init(42, 49),
        bgYellow: init(43, 49),
        bgBlue: init(44, 49),
        bgMagenta: init(45, 49),
        bgCyan: init(46, 49),
        bgWhite: init(47, 49)
    };
    function run(arr, str) {
        var i = 0, tmp, beg = '', end = '';
        for (; i < arr.length; i++) {
            tmp = arr[i];
            beg += tmp.open;
            end += tmp.close;
            if (!!~str.indexOf(tmp.close)) {
                str = str.replace(tmp.rgx, tmp.close + tmp.open);
            }
        }
        return beg + str + end;
    }
    function chain(has, keys) {
        var ctx = {
            has: has,
            keys: keys
        };
        ctx.reset = $.reset.bind(ctx);
        ctx.bold = $.bold.bind(ctx);
        ctx.dim = $.dim.bind(ctx);
        ctx.italic = $.italic.bind(ctx);
        ctx.underline = $.underline.bind(ctx);
        ctx.inverse = $.inverse.bind(ctx);
        ctx.hidden = $.hidden.bind(ctx);
        ctx.strikethrough = $.strikethrough.bind(ctx);
        ctx.black = $.black.bind(ctx);
        ctx.red = $.red.bind(ctx);
        ctx.green = $.green.bind(ctx);
        ctx.yellow = $.yellow.bind(ctx);
        ctx.blue = $.blue.bind(ctx);
        ctx.magenta = $.magenta.bind(ctx);
        ctx.cyan = $.cyan.bind(ctx);
        ctx.white = $.white.bind(ctx);
        ctx.gray = $.gray.bind(ctx);
        ctx.grey = $.grey.bind(ctx);
        ctx.bgBlack = $.bgBlack.bind(ctx);
        ctx.bgRed = $.bgRed.bind(ctx);
        ctx.bgGreen = $.bgGreen.bind(ctx);
        ctx.bgYellow = $.bgYellow.bind(ctx);
        ctx.bgBlue = $.bgBlue.bind(ctx);
        ctx.bgMagenta = $.bgMagenta.bind(ctx);
        ctx.bgCyan = $.bgCyan.bind(ctx);
        ctx.bgWhite = $.bgWhite.bind(ctx);
        return ctx;
    }
    function init(open, close) {
        var blk = {
            open: "\x1B[".concat(open, "m"),
            close: "\x1B[".concat(close, "m"),
            rgx: new RegExp("\\x1b\\[".concat(close, "m"), 'g')
        };
        return function (txt) {
            if (this !== void 0 && this.has !== void 0) {
                !!~this.has.indexOf(open) || (this.has.push(open), this.keys.push(blk));
                return txt === void 0 ? this : $.enabled ? run(this.keys, txt + '') : txt + '';
            }
            return txt === void 0 ? chain([open], [blk]) : $.enabled ? run([blk], txt + '') : txt + '';
        };
    }
    var hasOwn = Object.prototype.hasOwnProperty;
    function prettyYamlValue(value) {
        var indent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
        if (value === undefined) {
            value = String(value);
        }
        if (typeof value === 'number' && !isFinite(value)) {
            value = String(value);
        }
        if (typeof value === 'number') {
            return JSON.stringify(value);
        }
        if (typeof value === 'string') {
            var rSpecialJson = /['"\\/[{}\]\r\n]/;
            var rSpecialYaml = /[-?:,[\]{}#&*!|=>'"%@`]/;
            var rUntrimmed = /(^\s|\s$)/;
            var rNumerical = /^[\d._-]+$/;
            var rBool = /^(true|false|y|n|yes|no|on|off)$/i;
            if (value === '' || rSpecialJson.test(value) || rSpecialYaml.test(value[0]) || rUntrimmed.test(value) || rNumerical.test(value) || rBool.test(value)) {
                if (!/\n/.test(value)) {
                    return JSON.stringify(value);
                }
                var prefix = new Array(indent + 1).join(' ');
                var trailingLinebreakMatch = value.match(/\n+$/);
                var trailingLinebreaks = trailingLinebreakMatch ? trailingLinebreakMatch[0].length : 0;
                if (trailingLinebreaks === 1) {
                    var lines = value
                        .replace(/\n$/, '').split('\n').map(function (line) {
                        return prefix + line;
                    });
                    return '|\n' + lines.join('\n');
                }
                else {
                    var _lines = value.split('\n').map(function (line) {
                        return prefix + line;
                    });
                    return '|+\n' + _lines.join('\n');
                }
            }
            else {
                return value;
            }
        }
        return JSON.stringify(decycledShallowClone(value), null, 2);
    }
    function decycledShallowClone(object) {
        var ancestors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        if (ancestors.indexOf(object) !== -1) {
            return '[Circular]';
        }
        var type = Object.prototype.toString.call(object).replace(/^\[.+\s(.+?)]$/, '$1').toLowerCase();
        var clone;
        switch (type) {
            case 'array':
                ancestors.push(object);
                clone = object.map(function (element) {
                    return decycledShallowClone(element, ancestors);
                });
                ancestors.pop();
                break;
            case 'object':
                ancestors.push(object);
                clone = {};
                Object.keys(object).forEach(function (key) {
                    clone[key] = decycledShallowClone(object[key], ancestors);
                });
                ancestors.pop();
                break;
            default:
                clone = object;
        }
        return clone;
    }
    var TapReporter = function () {
        function TapReporter(runner) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _classCallCheck(this, TapReporter);
            this.log = options.log || Function.prototype.bind.call(console$1.log, console$1);
            this.testCount = 0;
            this.ended = false;
            this.bailed = false;
            runner.on('error', this.onError.bind(this));
            runner.on('runStart', this.onRunStart.bind(this));
            runner.on('testEnd', this.onTestEnd.bind(this));
            runner.on('runEnd', this.onRunEnd.bind(this));
        }
        _createClass(TapReporter, [{
                key: "onRunStart",
                value: function onRunStart(_runSuite) {
                    this.log('TAP version 13');
                }
            }, {
                key: "onError",
                value: function onError(error) {
                    if (this.bailed) {
                        return;
                    }
                    this.bailed = true;
                    if (!this.ended) {
                        this.testCount = this.testCount + 1;
                        this.log($.red("not ok ".concat(this.testCount, " global failure")));
                        this.logError(error);
                    }
                    this.log('Bail out! ' + errorString(error).split('\n')[0]);
                    if (this.ended) {
                        this.logError(error);
                    }
                }
            }, {
                key: "onTestEnd",
                value: function onTestEnd(test) {
                    var _this = this;
                    this.testCount = this.testCount + 1;
                    if (test.status === 'passed') {
                        this.log("ok ".concat(this.testCount, " ").concat(test.fullName.join(' > ')));
                    }
                    else if (test.status === 'skipped') {
                        this.log($.yellow("ok ".concat(this.testCount, " # SKIP ").concat(test.fullName.join(' > '))));
                    }
                    else if (test.status === 'todo') {
                        this.log($.cyan("not ok ".concat(this.testCount, " # TODO ").concat(test.fullName.join(' > '))));
                        test.errors.forEach(function (error) {
                            return _this.logAssertion(error, 'todo');
                        });
                    }
                    else {
                        this.log($.red("not ok ".concat(this.testCount, " ").concat(test.fullName.join(' > '))));
                        test.errors.forEach(function (error) {
                            return _this.logAssertion(error);
                        });
                    }
                }
            }, {
                key: "onRunEnd",
                value: function onRunEnd(runSuite) {
                    this.ended = true;
                    this.log("1..".concat(runSuite.testCounts.total));
                    this.log("# pass ".concat(runSuite.testCounts.passed));
                    this.log($.yellow("# skip ".concat(runSuite.testCounts.skipped)));
                    this.log($.cyan("# todo ".concat(runSuite.testCounts.todo)));
                    this.log($.red("# fail ".concat(runSuite.testCounts.failed)));
                }
            }, {
                key: "logAssertion",
                value: function logAssertion(error, severity) {
                    var out = '  ---';
                    out += "\n  message: ".concat(prettyYamlValue(error.message || 'failed'));
                    out += "\n  severity: ".concat(prettyYamlValue(severity || 'failed'));
                    if (hasOwn.call(error, 'actual')) {
                        out += "\n  actual  : ".concat(prettyYamlValue(error.actual));
                    }
                    if (hasOwn.call(error, 'expected')) {
                        out += "\n  expected: ".concat(prettyYamlValue(error.expected));
                    }
                    if (error.stack) {
                        out += "\n  stack: ".concat(prettyYamlValue(error.stack + '\n'));
                    }
                    out += '\n  ...';
                    this.log(out);
                }
            }, {
                key: "logError",
                value: function logError(error) {
                    var out = '  ---';
                    out += "\n  message: ".concat(prettyYamlValue(errorString(error)));
                    out += "\n  severity: ".concat(prettyYamlValue('failed'));
                    if (error && error.stack) {
                        out += "\n  stack: ".concat(prettyYamlValue(error.stack + '\n'));
                    }
                    out += '\n  ...';
                    this.log(out);
                }
            }], [{
                key: "init",
                value: function init(runner, options) {
                    return new TapReporter(runner, options);
                }
            }]);
        return TapReporter;
    }();
    var reporters = {
        console: ConsoleReporter,
        tap: TapReporter
    };
    function makeAddGlobalHook(hookName) {
        return function addGlobalHook(callback) {
            if (!config.globalHooks[hookName]) {
                config.globalHooks[hookName] = [];
            }
            config.globalHooks[hookName].push(callback);
        };
    }
    var hooks = {
        beforeEach: makeAddGlobalHook('beforeEach'),
        afterEach: makeAddGlobalHook('afterEach')
    };
    function onUncaughtException(error) {
        if (config.current) {
            config.current.assert.pushResult({
                result: false,
                message: "global failure: ".concat(errorString(error)),
                source: error && error.stack || sourceFromStacktrace(2)
            });
        }
        else {
            runSuite.globalFailureCount++;
            config.stats.bad++;
            config.stats.all++;
            emit('error', error);
        }
    }
    function onWindowError(details) {
        Logger.warn('QUnit.onError is deprecated and will be removed in QUnit 3.0.' + ' Please use QUnit.onUncaughtException instead.');
        if (config.current && config.current.ignoreGlobalErrors) {
            return true;
        }
        var err = new Error(details.message);
        err.stack = details.stacktrace || details.fileName + ':' + details.lineNumber;
        onUncaughtException(err);
        return false;
    }
    var QUnit = {};
    config.currentModule.suiteReport = runSuite;
    var globalStartCalled = false;
    var runStarted = false;
    QUnit.isLocal = window$1 && window$1.location && window$1.location.protocol === 'file:';
    QUnit.version = '2.19.4';
    extend(QUnit, {
        config: config,
        dump: dump,
        equiv: equiv,
        reporters: reporters,
        hooks: hooks,
        is: is,
        objectType: objectType,
        on: on,
        onError: onWindowError,
        onUncaughtException: onUncaughtException,
        pushFailure: pushFailure,
        assert: Assert.prototype,
        module: module$1,
        test: test,
        todo: test.todo,
        skip: test.skip,
        only: test.only,
        start: function start(count) {
            if (config.current) {
                throw new Error('QUnit.start cannot be called inside a test context.');
            }
            var globalStartAlreadyCalled = globalStartCalled;
            globalStartCalled = true;
            if (runStarted) {
                throw new Error('Called start() while test already started running');
            }
            if (globalStartAlreadyCalled || count > 1) {
                throw new Error('Called start() outside of a test context too many times');
            }
            if (config.autostart) {
                throw new Error('Called start() outside of a test context when ' + 'QUnit.config.autostart was true');
            }
            if (!config.pageLoaded) {
                config.autostart = true;
                if (!document) {
                    QUnit.load();
                }
                return;
            }
            scheduleBegin();
        },
        onUnhandledRejection: function onUnhandledRejection(reason) {
            Logger.warn('QUnit.onUnhandledRejection is deprecated and will be removed in QUnit 3.0.' + ' Please use QUnit.onUncaughtException instead.');
            onUncaughtException(reason);
        },
        extend: function extend$1() {
            Logger.warn('QUnit.extend is deprecated and will be removed in QUnit 3.0.' + ' Please use Object.assign instead.');
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }
            return extend.apply(this, args);
        },
        load: function load() {
            config.pageLoaded = true;
            extend(config, {
                started: 0,
                updateRate: 1000,
                autostart: true,
                filter: ''
            }, true);
            if (!runStarted) {
                config.blocking = false;
                if (config.autostart) {
                    scheduleBegin();
                }
            }
        },
        stack: function stack(offset) {
            offset = (offset || 0) + 2;
            return sourceFromStacktrace(offset);
        }
    });
    registerLoggingCallbacks(QUnit);
    function scheduleBegin() {
        runStarted = true;
        if (setTimeout$1) {
            setTimeout$1(function () {
                begin();
            });
        }
        else {
            begin();
        }
    }
    function unblockAndAdvanceQueue() {
        config.blocking = false;
        ProcessingQueue.advance();
    }
    function begin() {
        if (config.started) {
            unblockAndAdvanceQueue();
            return;
        }
        config.started = performance.now();
        if (config.modules[0].name === '' && config.modules[0].tests.length === 0) {
            config.modules.shift();
        }
        var modulesLog = [];
        for (var i = 0; i < config.modules.length; i++) {
            if (config.modules[i].name !== '') {
                modulesLog.push({
                    name: config.modules[i].name,
                    moduleId: config.modules[i].moduleId,
                    tests: config.modules[i].tests
                });
            }
        }
        emit('runStart', runSuite.start(true));
        runLoggingCallbacks('begin', {
            totalTests: Test.count,
            modules: modulesLog
        }).then(unblockAndAdvanceQueue);
    }
    exportQUnit(QUnit);
    (function () {
        if (!window$1 || !document) {
            return;
        }
        var config = QUnit.config;
        var hasOwn = Object.prototype.hasOwnProperty;
        function storeFixture() {
            if (hasOwn.call(config, 'fixture')) {
                return;
            }
            var fixture = document.getElementById('qunit-fixture');
            if (fixture) {
                config.fixture = fixture.cloneNode(true);
            }
        }
        QUnit.begin(storeFixture);
        function resetFixture() {
            if (config.fixture == null) {
                return;
            }
            var fixture = document.getElementById('qunit-fixture');
            var resetFixtureType = _typeof(config.fixture);
            if (resetFixtureType === 'string') {
                var newFixture = document.createElement('div');
                newFixture.setAttribute('id', 'qunit-fixture');
                newFixture.innerHTML = config.fixture;
                fixture.parentNode.replaceChild(newFixture, fixture);
            }
            else {
                var clonedFixture = config.fixture.cloneNode(true);
                fixture.parentNode.replaceChild(clonedFixture, fixture);
            }
        }
        QUnit.testStart(resetFixture);
    })();
    (function () {
        var location = typeof window$1 !== 'undefined' && window$1.location;
        if (!location) {
            return;
        }
        var urlParams = getUrlParams();
        QUnit.urlParams = urlParams;
        QUnit.config.filter = urlParams.filter;
        QUnit.config.module = urlParams.module;
        QUnit.config.moduleId = [].concat(urlParams.moduleId || []);
        QUnit.config.testId = [].concat(urlParams.testId || []);
        if (urlParams.seed === true) {
            QUnit.config.seed = Math.random().toString(36).slice(2);
        }
        else if (urlParams.seed) {
            QUnit.config.seed = urlParams.seed;
        }
        QUnit.config.urlConfig.push({
            id: 'hidepassed',
            label: 'Hide passed tests',
            tooltip: 'Only show tests and assertions that fail. Stored as query-strings.'
        }, {
            id: 'noglobals',
            label: 'Check for Globals',
            tooltip: 'Enabling this will test if any test introduces new properties on the ' + 'global object (`window` in Browsers). Stored as query-strings.'
        }, {
            id: 'notrycatch',
            label: 'No try-catch',
            tooltip: 'Enabling this will run tests outside of a try-catch block. Makes debugging ' + 'exceptions in IE reasonable. Stored as query-strings.'
        });
        QUnit.begin(function () {
            var urlConfig = QUnit.config.urlConfig;
            for (var i = 0; i < urlConfig.length; i++) {
                var option = QUnit.config.urlConfig[i];
                if (typeof option !== 'string') {
                    option = option.id;
                }
                if (QUnit.config[option] === undefined) {
                    QUnit.config[option] = urlParams[option];
                }
            }
        });
        function getUrlParams() {
            var urlParams = Object.create(null);
            var params = location.search.slice(1).split('&');
            var length = params.length;
            for (var i = 0; i < length; i++) {
                if (params[i]) {
                    var param = params[i].split('=');
                    var name = decodeQueryParam(param[0]);
                    var value = param.length === 1 || decodeQueryParam(param.slice(1).join('='));
                    if (name in urlParams) {
                        urlParams[name] = [].concat(urlParams[name], value);
                    }
                    else {
                        urlParams[name] = value;
                    }
                }
            }
            return urlParams;
        }
        function decodeQueryParam(param) {
            return decodeURIComponent(param.replace(/\+/g, '%20'));
        }
    })();
    var fuzzysort$1 = { exports: {} };
    (function (module) {
        (function (root, UMD) {
            if (module.exports)
                module.exports = UMD();
            else
                root.fuzzysort = UMD();
        })(commonjsGlobal, function UMD() {
            function fuzzysortNew(instanceOptions) {
                var fuzzysort = {
                    single: function single(search, target, options) {
                        if (search == 'farzher')
                            return {
                                target: "farzher was here (^-^*)/",
                                score: 0,
                                indexes: [0, 1, 2, 3, 4, 5, 6]
                            };
                        if (!search)
                            return null;
                        if (!isObj(search))
                            search = fuzzysort.getPreparedSearch(search);
                        if (!target)
                            return null;
                        if (!isObj(target))
                            target = fuzzysort.getPrepared(target);
                        var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;
                        var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
                        return algorithm(search, target, search[0]);
                    },
                    go: function go(search, targets, options) {
                        if (search == 'farzher')
                            return [{
                                    target: "farzher was here (^-^*)/",
                                    score: 0,
                                    indexes: [0, 1, 2, 3, 4, 5, 6],
                                    obj: targets ? targets[0] : null
                                }];
                        if (!search)
                            return noResults;
                        search = fuzzysort.prepareSearch(search);
                        var searchLowerCode = search[0];
                        var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;
                        var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;
                        var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;
                        var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
                        var resultsLen = 0;
                        var limitedCount = 0;
                        var targetsLen = targets.length;
                        if (options && options.keys) {
                            var scoreFn = options.scoreFn || defaultScoreFn;
                            var keys = options.keys;
                            var keysLen = keys.length;
                            for (var i = targetsLen - 1; i >= 0; --i) {
                                var obj = targets[i];
                                var objResults = new Array(keysLen);
                                for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
                                    var key = keys[keyI];
                                    var target = getValue(obj, key);
                                    if (!target) {
                                        objResults[keyI] = null;
                                        continue;
                                    }
                                    if (!isObj(target))
                                        target = fuzzysort.getPrepared(target);
                                    objResults[keyI] = algorithm(search, target, searchLowerCode);
                                }
                                objResults.obj = obj;
                                var score = scoreFn(objResults);
                                if (score === null)
                                    continue;
                                if (score < threshold)
                                    continue;
                                objResults.score = score;
                                if (resultsLen < limit) {
                                    q.add(objResults);
                                    ++resultsLen;
                                }
                                else {
                                    ++limitedCount;
                                    if (score > q.peek().score)
                                        q.replaceTop(objResults);
                                }
                            }
                        }
                        else if (options && options.key) {
                            var key = options.key;
                            for (var i = targetsLen - 1; i >= 0; --i) {
                                var obj = targets[i];
                                var target = getValue(obj, key);
                                if (!target)
                                    continue;
                                if (!isObj(target))
                                    target = fuzzysort.getPrepared(target);
                                var result = algorithm(search, target, searchLowerCode);
                                if (result === null)
                                    continue;
                                if (result.score < threshold)
                                    continue;
                                result = {
                                    target: result.target,
                                    _targetLowerCodes: null,
                                    _nextBeginningIndexes: null,
                                    score: result.score,
                                    indexes: result.indexes,
                                    obj: obj
                                };
                                if (resultsLen < limit) {
                                    q.add(result);
                                    ++resultsLen;
                                }
                                else {
                                    ++limitedCount;
                                    if (result.score > q.peek().score)
                                        q.replaceTop(result);
                                }
                            }
                        }
                        else {
                            for (var i = targetsLen - 1; i >= 0; --i) {
                                var target = targets[i];
                                if (!target)
                                    continue;
                                if (!isObj(target))
                                    target = fuzzysort.getPrepared(target);
                                var result = algorithm(search, target, searchLowerCode);
                                if (result === null)
                                    continue;
                                if (result.score < threshold)
                                    continue;
                                if (resultsLen < limit) {
                                    q.add(result);
                                    ++resultsLen;
                                }
                                else {
                                    ++limitedCount;
                                    if (result.score > q.peek().score)
                                        q.replaceTop(result);
                                }
                            }
                        }
                        if (resultsLen === 0)
                            return noResults;
                        var results = new Array(resultsLen);
                        for (var i = resultsLen - 1; i >= 0; --i) {
                            results[i] = q.poll();
                        }
                        results.total = resultsLen + limitedCount;
                        return results;
                    },
                    goAsync: function goAsync(search, targets, options) {
                        var canceled = false;
                        var p = new Promise(function (resolve, reject) {
                            if (search == 'farzher')
                                return resolve([{
                                        target: "farzher was here (^-^*)/",
                                        score: 0,
                                        indexes: [0, 1, 2, 3, 4, 5, 6],
                                        obj: targets ? targets[0] : null
                                    }]);
                            if (!search)
                                return resolve(noResults);
                            search = fuzzysort.prepareSearch(search);
                            var searchLowerCode = search[0];
                            var q = fastpriorityqueue();
                            var iCurrent = targets.length - 1;
                            var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;
                            var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;
                            var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;
                            var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
                            var resultsLen = 0;
                            var limitedCount = 0;
                            function step() {
                                if (canceled)
                                    return reject('canceled');
                                var startMs = Date.now();
                                if (options && options.keys) {
                                    var scoreFn = options.scoreFn || defaultScoreFn;
                                    var keys = options.keys;
                                    var keysLen = keys.length;
                                    for (; iCurrent >= 0; --iCurrent) {
                                        if (iCurrent % 1000 === 0) {
                                            if (Date.now() - startMs >= 10) {
                                                isNode ? setImmediate(step) : setTimeout(step);
                                                return;
                                            }
                                        }
                                        var obj = targets[iCurrent];
                                        var objResults = new Array(keysLen);
                                        for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
                                            var key = keys[keyI];
                                            var target = getValue(obj, key);
                                            if (!target) {
                                                objResults[keyI] = null;
                                                continue;
                                            }
                                            if (!isObj(target))
                                                target = fuzzysort.getPrepared(target);
                                            objResults[keyI] = algorithm(search, target, searchLowerCode);
                                        }
                                        objResults.obj = obj;
                                        var score = scoreFn(objResults);
                                        if (score === null)
                                            continue;
                                        if (score < threshold)
                                            continue;
                                        objResults.score = score;
                                        if (resultsLen < limit) {
                                            q.add(objResults);
                                            ++resultsLen;
                                        }
                                        else {
                                            ++limitedCount;
                                            if (score > q.peek().score)
                                                q.replaceTop(objResults);
                                        }
                                    }
                                }
                                else if (options && options.key) {
                                    var key = options.key;
                                    for (; iCurrent >= 0; --iCurrent) {
                                        if (iCurrent % 1000 === 0) {
                                            if (Date.now() - startMs >= 10) {
                                                isNode ? setImmediate(step) : setTimeout(step);
                                                return;
                                            }
                                        }
                                        var obj = targets[iCurrent];
                                        var target = getValue(obj, key);
                                        if (!target)
                                            continue;
                                        if (!isObj(target))
                                            target = fuzzysort.getPrepared(target);
                                        var result = algorithm(search, target, searchLowerCode);
                                        if (result === null)
                                            continue;
                                        if (result.score < threshold)
                                            continue;
                                        result = {
                                            target: result.target,
                                            _targetLowerCodes: null,
                                            _nextBeginningIndexes: null,
                                            score: result.score,
                                            indexes: result.indexes,
                                            obj: obj
                                        };
                                        if (resultsLen < limit) {
                                            q.add(result);
                                            ++resultsLen;
                                        }
                                        else {
                                            ++limitedCount;
                                            if (result.score > q.peek().score)
                                                q.replaceTop(result);
                                        }
                                    }
                                }
                                else {
                                    for (; iCurrent >= 0; --iCurrent) {
                                        if (iCurrent % 1000 === 0) {
                                            if (Date.now() - startMs >= 10) {
                                                isNode ? setImmediate(step) : setTimeout(step);
                                                return;
                                            }
                                        }
                                        var target = targets[iCurrent];
                                        if (!target)
                                            continue;
                                        if (!isObj(target))
                                            target = fuzzysort.getPrepared(target);
                                        var result = algorithm(search, target, searchLowerCode);
                                        if (result === null)
                                            continue;
                                        if (result.score < threshold)
                                            continue;
                                        if (resultsLen < limit) {
                                            q.add(result);
                                            ++resultsLen;
                                        }
                                        else {
                                            ++limitedCount;
                                            if (result.score > q.peek().score)
                                                q.replaceTop(result);
                                        }
                                    }
                                }
                                if (resultsLen === 0)
                                    return resolve(noResults);
                                var results = new Array(resultsLen);
                                for (var i = resultsLen - 1; i >= 0; --i) {
                                    results[i] = q.poll();
                                }
                                results.total = resultsLen + limitedCount;
                                resolve(results);
                            }
                            isNode ? setImmediate(step) : step();
                        });
                        p.cancel = function () {
                            canceled = true;
                        };
                        return p;
                    },
                    highlight: function highlight(result, hOpen, hClose) {
                        if (typeof hOpen == 'function')
                            return fuzzysort.highlightCallback(result, hOpen);
                        if (result === null)
                            return null;
                        if (hOpen === undefined)
                            hOpen = '<b>';
                        if (hClose === undefined)
                            hClose = '</b>';
                        var highlighted = '';
                        var matchesIndex = 0;
                        var opened = false;
                        var target = result.target;
                        var targetLen = target.length;
                        var matchesBest = result.indexes;
                        for (var i = 0; i < targetLen; ++i) {
                            var char = target[i];
                            if (matchesBest[matchesIndex] === i) {
                                ++matchesIndex;
                                if (!opened) {
                                    opened = true;
                                    highlighted += hOpen;
                                }
                                if (matchesIndex === matchesBest.length) {
                                    highlighted += char + hClose + target.substr(i + 1);
                                    break;
                                }
                            }
                            else {
                                if (opened) {
                                    opened = false;
                                    highlighted += hClose;
                                }
                            }
                            highlighted += char;
                        }
                        return highlighted;
                    },
                    highlightCallback: function highlightCallback(result, cb) {
                        if (result === null)
                            return null;
                        var target = result.target;
                        var targetLen = target.length;
                        var indexes = result.indexes;
                        var highlighted = '';
                        var matchI = 0;
                        var indexesI = 0;
                        var opened = false;
                        var result = [];
                        for (var i = 0; i < targetLen; ++i) {
                            var char = target[i];
                            if (indexes[indexesI] === i) {
                                ++indexesI;
                                if (!opened) {
                                    opened = true;
                                    result.push(highlighted);
                                    highlighted = '';
                                }
                                if (indexesI === indexes.length) {
                                    highlighted += char;
                                    result.push(cb(highlighted, matchI++));
                                    highlighted = '';
                                    result.push(target.substr(i + 1));
                                    break;
                                }
                            }
                            else {
                                if (opened) {
                                    opened = false;
                                    result.push(cb(highlighted, matchI++));
                                    highlighted = '';
                                }
                            }
                            highlighted += char;
                        }
                        return result;
                    },
                    prepare: function prepare(target) {
                        if (!target)
                            return {
                                target: '',
                                _targetLowerCodes: [0],
                                _nextBeginningIndexes: null,
                                score: null,
                                indexes: null,
                                obj: null
                            };
                        return {
                            target: target,
                            _targetLowerCodes: fuzzysort.prepareLowerCodes(target),
                            _nextBeginningIndexes: null,
                            score: null,
                            indexes: null,
                            obj: null
                        };
                    },
                    prepareSlow: function prepareSlow(target) {
                        if (!target)
                            return {
                                target: '',
                                _targetLowerCodes: [0],
                                _nextBeginningIndexes: null,
                                score: null,
                                indexes: null,
                                obj: null
                            };
                        return {
                            target: target,
                            _targetLowerCodes: fuzzysort.prepareLowerCodes(target),
                            _nextBeginningIndexes: fuzzysort.prepareNextBeginningIndexes(target),
                            score: null,
                            indexes: null,
                            obj: null
                        };
                    },
                    prepareSearch: function prepareSearch(search) {
                        if (!search)
                            search = '';
                        return fuzzysort.prepareLowerCodes(search);
                    },
                    getPrepared: function getPrepared(target) {
                        if (target.length > 999)
                            return fuzzysort.prepare(target);
                        var targetPrepared = preparedCache.get(target);
                        if (targetPrepared !== undefined)
                            return targetPrepared;
                        targetPrepared = fuzzysort.prepare(target);
                        preparedCache.set(target, targetPrepared);
                        return targetPrepared;
                    },
                    getPreparedSearch: function getPreparedSearch(search) {
                        if (search.length > 999)
                            return fuzzysort.prepareSearch(search);
                        var searchPrepared = preparedSearchCache.get(search);
                        if (searchPrepared !== undefined)
                            return searchPrepared;
                        searchPrepared = fuzzysort.prepareSearch(search);
                        preparedSearchCache.set(search, searchPrepared);
                        return searchPrepared;
                    },
                    algorithm: function algorithm(searchLowerCodes, prepared, searchLowerCode) {
                        var targetLowerCodes = prepared._targetLowerCodes;
                        var searchLen = searchLowerCodes.length;
                        var targetLen = targetLowerCodes.length;
                        var searchI = 0;
                        var targetI = 0;
                        var typoSimpleI = 0;
                        var matchesSimpleLen = 0;
                        for (;;) {
                            var isMatch = searchLowerCode === targetLowerCodes[targetI];
                            if (isMatch) {
                                matchesSimple[matchesSimpleLen++] = targetI;
                                ++searchI;
                                if (searchI === searchLen)
                                    break;
                                searchLowerCode = searchLowerCodes[typoSimpleI === 0 ? searchI : typoSimpleI === searchI ? searchI + 1 : typoSimpleI === searchI - 1 ? searchI - 1 : searchI];
                            }
                            ++targetI;
                            if (targetI >= targetLen) {
                                for (;;) {
                                    if (searchI <= 1)
                                        return null;
                                    if (typoSimpleI === 0) {
                                        --searchI;
                                        var searchLowerCodeNew = searchLowerCodes[searchI];
                                        if (searchLowerCode === searchLowerCodeNew)
                                            continue;
                                        typoSimpleI = searchI;
                                    }
                                    else {
                                        if (typoSimpleI === 1)
                                            return null;
                                        --typoSimpleI;
                                        searchI = typoSimpleI;
                                        searchLowerCode = searchLowerCodes[searchI + 1];
                                        var searchLowerCodeNew = searchLowerCodes[searchI];
                                        if (searchLowerCode === searchLowerCodeNew)
                                            continue;
                                    }
                                    matchesSimpleLen = searchI;
                                    targetI = matchesSimple[matchesSimpleLen - 1] + 1;
                                    break;
                                }
                            }
                        }
                        var searchI = 0;
                        var typoStrictI = 0;
                        var successStrict = false;
                        var matchesStrictLen = 0;
                        var nextBeginningIndexes = prepared._nextBeginningIndexes;
                        if (nextBeginningIndexes === null)
                            nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target);
                        var firstPossibleI = targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];
                        if (targetI !== targetLen)
                            for (;;) {
                                if (targetI >= targetLen) {
                                    if (searchI <= 0) {
                                        ++typoStrictI;
                                        if (typoStrictI > searchLen - 2)
                                            break;
                                        if (searchLowerCodes[typoStrictI] === searchLowerCodes[typoStrictI + 1])
                                            continue;
                                        targetI = firstPossibleI;
                                        continue;
                                    }
                                    --searchI;
                                    var lastMatch = matchesStrict[--matchesStrictLen];
                                    targetI = nextBeginningIndexes[lastMatch];
                                }
                                else {
                                    var isMatch = searchLowerCodes[typoStrictI === 0 ? searchI : typoStrictI === searchI ? searchI + 1 : typoStrictI === searchI - 1 ? searchI - 1 : searchI] === targetLowerCodes[targetI];
                                    if (isMatch) {
                                        matchesStrict[matchesStrictLen++] = targetI;
                                        ++searchI;
                                        if (searchI === searchLen) {
                                            successStrict = true;
                                            break;
                                        }
                                        ++targetI;
                                    }
                                    else {
                                        targetI = nextBeginningIndexes[targetI];
                                    }
                                }
                            }
                        {
                            if (successStrict) {
                                var matchesBest = matchesStrict;
                                var matchesBestLen = matchesStrictLen;
                            }
                            else {
                                var matchesBest = matchesSimple;
                                var matchesBestLen = matchesSimpleLen;
                            }
                            var score = 0;
                            var lastTargetI = -1;
                            for (var i = 0; i < searchLen; ++i) {
                                var targetI = matchesBest[i];
                                if (lastTargetI !== targetI - 1)
                                    score -= targetI;
                                lastTargetI = targetI;
                            }
                            if (!successStrict) {
                                score *= 1000;
                                if (typoSimpleI !== 0)
                                    score += -20;
                            }
                            else {
                                if (typoStrictI !== 0)
                                    score += -20;
                            }
                            score -= targetLen - searchLen;
                            prepared.score = score;
                            prepared.indexes = new Array(matchesBestLen);
                            for (var i = matchesBestLen - 1; i >= 0; --i) {
                                prepared.indexes[i] = matchesBest[i];
                            }
                            return prepared;
                        }
                    },
                    algorithmNoTypo: function algorithmNoTypo(searchLowerCodes, prepared, searchLowerCode) {
                        var targetLowerCodes = prepared._targetLowerCodes;
                        var searchLen = searchLowerCodes.length;
                        var targetLen = targetLowerCodes.length;
                        var searchI = 0;
                        var targetI = 0;
                        var matchesSimpleLen = 0;
                        for (;;) {
                            var isMatch = searchLowerCode === targetLowerCodes[targetI];
                            if (isMatch) {
                                matchesSimple[matchesSimpleLen++] = targetI;
                                ++searchI;
                                if (searchI === searchLen)
                                    break;
                                searchLowerCode = searchLowerCodes[searchI];
                            }
                            ++targetI;
                            if (targetI >= targetLen)
                                return null;
                        }
                        var searchI = 0;
                        var successStrict = false;
                        var matchesStrictLen = 0;
                        var nextBeginningIndexes = prepared._nextBeginningIndexes;
                        if (nextBeginningIndexes === null)
                            nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target);
                        targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];
                        if (targetI !== targetLen)
                            for (;;) {
                                if (targetI >= targetLen) {
                                    if (searchI <= 0)
                                        break;
                                    --searchI;
                                    var lastMatch = matchesStrict[--matchesStrictLen];
                                    targetI = nextBeginningIndexes[lastMatch];
                                }
                                else {
                                    var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];
                                    if (isMatch) {
                                        matchesStrict[matchesStrictLen++] = targetI;
                                        ++searchI;
                                        if (searchI === searchLen) {
                                            successStrict = true;
                                            break;
                                        }
                                        ++targetI;
                                    }
                                    else {
                                        targetI = nextBeginningIndexes[targetI];
                                    }
                                }
                            }
                        {
                            if (successStrict) {
                                var matchesBest = matchesStrict;
                                var matchesBestLen = matchesStrictLen;
                            }
                            else {
                                var matchesBest = matchesSimple;
                                var matchesBestLen = matchesSimpleLen;
                            }
                            var score = 0;
                            var lastTargetI = -1;
                            for (var i = 0; i < searchLen; ++i) {
                                var targetI = matchesBest[i];
                                if (lastTargetI !== targetI - 1)
                                    score -= targetI;
                                lastTargetI = targetI;
                            }
                            if (!successStrict)
                                score *= 1000;
                            score -= targetLen - searchLen;
                            prepared.score = score;
                            prepared.indexes = new Array(matchesBestLen);
                            for (var i = matchesBestLen - 1; i >= 0; --i) {
                                prepared.indexes[i] = matchesBest[i];
                            }
                            return prepared;
                        }
                    },
                    prepareLowerCodes: function prepareLowerCodes(str) {
                        var strLen = str.length;
                        var lowerCodes = [];
                        var lower = str.toLowerCase();
                        for (var i = 0; i < strLen; ++i) {
                            lowerCodes[i] = lower.charCodeAt(i);
                        }
                        return lowerCodes;
                    },
                    prepareBeginningIndexes: function prepareBeginningIndexes(target) {
                        var targetLen = target.length;
                        var beginningIndexes = [];
                        var beginningIndexesLen = 0;
                        var wasUpper = false;
                        var wasAlphanum = false;
                        for (var i = 0; i < targetLen; ++i) {
                            var targetCode = target.charCodeAt(i);
                            var isUpper = targetCode >= 65 && targetCode <= 90;
                            var isAlphanum = isUpper || targetCode >= 97 && targetCode <= 122 || targetCode >= 48 && targetCode <= 57;
                            var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum;
                            wasUpper = isUpper;
                            wasAlphanum = isAlphanum;
                            if (isBeginning)
                                beginningIndexes[beginningIndexesLen++] = i;
                        }
                        return beginningIndexes;
                    },
                    prepareNextBeginningIndexes: function prepareNextBeginningIndexes(target) {
                        var targetLen = target.length;
                        var beginningIndexes = fuzzysort.prepareBeginningIndexes(target);
                        var nextBeginningIndexes = [];
                        var lastIsBeginning = beginningIndexes[0];
                        var lastIsBeginningI = 0;
                        for (var i = 0; i < targetLen; ++i) {
                            if (lastIsBeginning > i) {
                                nextBeginningIndexes[i] = lastIsBeginning;
                            }
                            else {
                                lastIsBeginning = beginningIndexes[++lastIsBeginningI];
                                nextBeginningIndexes[i] = lastIsBeginning === undefined ? targetLen : lastIsBeginning;
                            }
                        }
                        return nextBeginningIndexes;
                    },
                    cleanup: cleanup,
                    new: fuzzysortNew
                };
                return fuzzysort;
            }
            var isNode = typeof commonjsRequire !== 'undefined' && typeof window === 'undefined';
            var MyMap = typeof Map === 'function' ? Map : function () {
                var s = Object.create(null);
                this.get = function (k) {
                    return s[k];
                };
                this.set = function (k, val) {
                    s[k] = val;
                    return this;
                };
                this.clear = function () {
                    s = Object.create(null);
                };
            };
            var preparedCache = new MyMap();
            var preparedSearchCache = new MyMap();
            var noResults = [];
            noResults.total = 0;
            var matchesSimple = [];
            var matchesStrict = [];
            function cleanup() {
                preparedCache.clear();
                preparedSearchCache.clear();
                matchesSimple = [];
                matchesStrict = [];
            }
            function defaultScoreFn(a) {
                var max = -9007199254740991;
                for (var i = a.length - 1; i >= 0; --i) {
                    var result = a[i];
                    if (result === null)
                        continue;
                    var score = result.score;
                    if (score > max)
                        max = score;
                }
                if (max === -9007199254740991)
                    return null;
                return max;
            }
            function getValue(obj, prop) {
                var tmp = obj[prop];
                if (tmp !== undefined)
                    return tmp;
                var segs = prop;
                if (!Array.isArray(prop))
                    segs = prop.split('.');
                var len = segs.length;
                var i = -1;
                while (obj && ++i < len) {
                    obj = obj[segs[i]];
                }
                return obj;
            }
            function isObj(x) {
                return _typeof(x) === 'object';
            }
            var fastpriorityqueue = function fastpriorityqueue() {
                var r = [], o = 0, e = {};
                function n() {
                    for (var e = 0, n = r[e], c = 1; c < o;) {
                        var f = c + 1;
                        e = c, f < o && r[f].score < r[c].score && (e = f), r[e - 1 >> 1] = r[e], c = 1 + (e << 1);
                    }
                    for (var a = e - 1 >> 1; e > 0 && n.score < r[a].score; a = (e = a) - 1 >> 1) {
                        r[e] = r[a];
                    }
                    r[e] = n;
                }
                return e.add = function (e) {
                    var n = o;
                    r[o++] = e;
                    for (var c = n - 1 >> 1; n > 0 && e.score < r[c].score; c = (n = c) - 1 >> 1) {
                        r[n] = r[c];
                    }
                    r[n] = e;
                }, e.poll = function () {
                    if (0 !== o) {
                        var e = r[0];
                        return r[0] = r[--o], n(), e;
                    }
                }, e.peek = function (e) {
                    if (0 !== o)
                        return r[0];
                }, e.replaceTop = function (o) {
                    r[0] = o, n();
                }, e;
            };
            var q = fastpriorityqueue();
            return fuzzysortNew();
        });
    })(fuzzysort$1);
    var fuzzysort = fuzzysort$1.exports;
    var stats = {
        failedTests: [],
        defined: 0,
        completed: 0
    };
    function escapeText(str) {
        if (!str) {
            return '';
        }
        return ('' + str).replace(/['"<>&]/g, function (s) {
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
    (function () {
        if (!window$1 || !document) {
            return;
        }
        var config = QUnit.config;
        var hiddenTests = [];
        var collapseNext = false;
        var hasOwn = Object.prototype.hasOwnProperty;
        var unfilteredUrl = setUrl({
            filter: undefined,
            module: undefined,
            moduleId: undefined,
            testId: undefined
        });
        var dropdownData = null;
        function trim(string) {
            if (typeof string.trim === 'function') {
                return string.trim();
            }
            else {
                return string.replace(/^\s+|\s+$/g, '');
            }
        }
        function addEvent(elem, type, fn) {
            elem.addEventListener(type, fn, false);
        }
        function removeEvent(elem, type, fn) {
            elem.removeEventListener(type, fn, false);
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
        function toggleClass(elem, name, force) {
            if (force || typeof force === 'undefined' && !hasClass(elem, name)) {
                addClass(elem, name);
            }
            else {
                removeClass(elem, name);
            }
        }
        function removeClass(elem, name) {
            var set = ' ' + elem.className + ' ';
            while (set.indexOf(' ' + name + ' ') >= 0) {
                set = set.replace(' ' + name + ' ', ' ');
            }
            elem.className = trim(set);
        }
        function id(name) {
            return document.getElementById && document.getElementById(name);
        }
        function abortTests() {
            var abortButton = id('qunit-abort-tests-button');
            if (abortButton) {
                abortButton.disabled = true;
                abortButton.innerHTML = 'Aborting...';
            }
            QUnit.config.queue.length = 0;
            return false;
        }
        function interceptNavigation(ev) {
            var filterInputElem = id('qunit-filter-input');
            filterInputElem.value = trim(filterInputElem.value);
            applyUrlParams();
            if (ev && ev.preventDefault) {
                ev.preventDefault();
            }
            return false;
        }
        function getUrlConfigHtml() {
            var selection = false;
            var urlConfig = config.urlConfig;
            var urlConfigHtml = '';
            for (var i = 0; i < urlConfig.length; i++) {
                var val = config.urlConfig[i];
                if (typeof val === 'string') {
                    val = {
                        id: val,
                        label: val
                    };
                }
                var escaped = escapeText(val.id);
                var escapedTooltip = escapeText(val.tooltip);
                if (!val.value || typeof val.value === 'string') {
                    urlConfigHtml += "<label for='qunit-urlconfig-" + escaped + "' title='" + escapedTooltip + "'><input id='qunit-urlconfig-" + escaped + "' name='" + escaped + "' type='checkbox'" + (val.value ? " value='" + escapeText(val.value) + "'" : '') + (config[val.id] ? " checked='checked'" : '') + " title='" + escapedTooltip + "' />" + escapeText(val.label) + '</label>';
                }
                else {
                    urlConfigHtml += "<label for='qunit-urlconfig-" + escaped + "' title='" + escapedTooltip + "'>" + val.label + ": </label><select id='qunit-urlconfig-" + escaped + "' name='" + escaped + "' title='" + escapedTooltip + "'><option></option>";
                    if (Array.isArray(val.value)) {
                        for (var j = 0; j < val.value.length; j++) {
                            escaped = escapeText(val.value[j]);
                            urlConfigHtml += "<option value='" + escaped + "'" + (config[val.id] === val.value[j] ? (selection = true) && " selected='selected'" : '') + '>' + escaped + '</option>';
                        }
                    }
                    else {
                        for (var _j in val.value) {
                            if (hasOwn.call(val.value, _j)) {
                                urlConfigHtml += "<option value='" + escapeText(_j) + "'" + (config[val.id] === _j ? (selection = true) && " selected='selected'" : '') + '>' + escapeText(val.value[_j]) + '</option>';
                            }
                        }
                    }
                    if (config[val.id] && !selection) {
                        escaped = escapeText(config[val.id]);
                        urlConfigHtml += "<option value='" + escaped + "' selected='selected' disabled='disabled'>" + escaped + '</option>';
                    }
                    urlConfigHtml += '</select>';
                }
            }
            return urlConfigHtml;
        }
        function toolbarChanged() {
            var field = this;
            var params = {};
            var value;
            if ('selectedIndex' in field) {
                value = field.options[field.selectedIndex].value || undefined;
            }
            else {
                value = field.checked ? field.defaultValue || true : undefined;
            }
            params[field.name] = value;
            var updatedUrl = setUrl(params);
            if (field.name === 'hidepassed' && 'replaceState' in window$1.history) {
                QUnit.urlParams[field.name] = value;
                config[field.name] = value || false;
                var tests = id('qunit-tests');
                if (tests) {
                    var length = tests.children.length;
                    var children = tests.children;
                    if (field.checked) {
                        for (var i = 0; i < length; i++) {
                            var test = children[i];
                            var className = test ? test.className : '';
                            var classNameHasPass = className.indexOf('pass') > -1;
                            var classNameHasSkipped = className.indexOf('skipped') > -1;
                            if (classNameHasPass || classNameHasSkipped) {
                                hiddenTests.push(test);
                            }
                        }
                        var _iterator = _createForOfIteratorHelper(hiddenTests), _step;
                        try {
                            for (_iterator.s(); !(_step = _iterator.n()).done;) {
                                var hiddenTest = _step.value;
                                tests.removeChild(hiddenTest);
                            }
                        }
                        catch (err) {
                            _iterator.e(err);
                        }
                        finally {
                            _iterator.f();
                        }
                    }
                    else {
                        var _test;
                        while ((_test = hiddenTests.pop()) != null) {
                            tests.appendChild(_test);
                        }
                    }
                }
                window$1.history.replaceState(null, '', updatedUrl);
            }
            else {
                window$1.location = updatedUrl;
            }
        }
        function setUrl(params) {
            var querystring = '?';
            var location = window$1.location;
            params = extend(extend({}, QUnit.urlParams), params);
            for (var key in params) {
                if (hasOwn.call(params, key) && params[key] !== undefined) {
                    var arrValue = [].concat(params[key]);
                    for (var i = 0; i < arrValue.length; i++) {
                        querystring += encodeURIComponent(key);
                        if (arrValue[i] !== true) {
                            querystring += '=' + encodeURIComponent(arrValue[i]);
                        }
                        querystring += '&';
                    }
                }
            }
            return location.protocol + '//' + location.host + location.pathname + querystring.slice(0, -1);
        }
        function applyUrlParams() {
            var filter = id('qunit-filter-input').value;
            window$1.location = setUrl({
                filter: filter === '' ? undefined : filter,
                moduleId: _toConsumableArray(dropdownData.selectedMap.keys()),
                module: undefined,
                testId: undefined
            });
        }
        function toolbarUrlConfigContainer() {
            var urlConfigContainer = document.createElement('span');
            urlConfigContainer.innerHTML = getUrlConfigHtml();
            addClass(urlConfigContainer, 'qunit-url-config');
            addEvents(urlConfigContainer.getElementsByTagName('input'), 'change', toolbarChanged);
            addEvents(urlConfigContainer.getElementsByTagName('select'), 'change', toolbarChanged);
            return urlConfigContainer;
        }
        function abortTestsButton() {
            var button = document.createElement('button');
            button.id = 'qunit-abort-tests-button';
            button.innerHTML = 'Abort';
            addEvent(button, 'click', abortTests);
            return button;
        }
        function toolbarLooseFilter() {
            var filter = document.createElement('form');
            var label = document.createElement('label');
            var input = document.createElement('input');
            var button = document.createElement('button');
            addClass(filter, 'qunit-filter');
            label.innerHTML = 'Filter: ';
            input.type = 'text';
            input.value = config.filter || '';
            input.name = 'filter';
            input.id = 'qunit-filter-input';
            button.innerHTML = 'Go';
            label.appendChild(input);
            filter.appendChild(label);
            filter.appendChild(document.createTextNode(' '));
            filter.appendChild(button);
            addEvent(filter, 'submit', interceptNavigation);
            return filter;
        }
        function createModuleListItem(moduleId, name, checked) {
            return '<li><label class="clickable' + (checked ? ' checked' : '') + '"><input type="checkbox" ' + 'value="' + escapeText(moduleId) + '"' + (checked ? ' checked="checked"' : '') + ' />' + escapeText(name) + '</label></li>';
        }
        function moduleListHtml(results) {
            var html = '';
            dropdownData.selectedMap.forEach(function (name, moduleId) {
                html += createModuleListItem(moduleId, name, true);
            });
            for (var i = 0; i < results.length; i++) {
                var mod = results[i].obj;
                if (!dropdownData.selectedMap.has(mod.moduleId)) {
                    html += createModuleListItem(mod.moduleId, mod.name, false);
                }
            }
            return html;
        }
        function toolbarModuleFilter(beginDetails) {
            var initialSelected = null;
            dropdownData = {
                options: beginDetails.modules.slice(),
                selectedMap: new StringMap(),
                isDirty: function isDirty() {
                    return _toConsumableArray(dropdownData.selectedMap.keys()).sort().join(',') !== _toConsumableArray(initialSelected.keys()).sort().join(',');
                }
            };
            if (config.moduleId.length) {
                for (var i = 0; i < beginDetails.modules.length; i++) {
                    var mod = beginDetails.modules[i];
                    if (config.moduleId.indexOf(mod.moduleId) !== -1) {
                        dropdownData.selectedMap.set(mod.moduleId, mod.name);
                    }
                }
            }
            initialSelected = new StringMap(dropdownData.selectedMap);
            var moduleSearch = document.createElement('input');
            moduleSearch.id = 'qunit-modulefilter-search';
            moduleSearch.autocomplete = 'off';
            addEvent(moduleSearch, 'input', searchInput);
            addEvent(moduleSearch, 'input', searchFocus);
            addEvent(moduleSearch, 'focus', searchFocus);
            addEvent(moduleSearch, 'click', searchFocus);
            var label = document.createElement('label');
            label.htmlFor = 'qunit-modulefilter-search';
            label.textContent = 'Module:';
            var searchContainer = document.createElement('span');
            searchContainer.id = 'qunit-modulefilter-search-container';
            searchContainer.appendChild(moduleSearch);
            var applyButton = document.createElement('button');
            applyButton.textContent = 'Apply';
            applyButton.title = 'Re-run the selected test modules';
            addEvent(applyButton, 'click', applyUrlParams);
            var resetButton = document.createElement('button');
            resetButton.textContent = 'Reset';
            resetButton.type = 'reset';
            resetButton.title = 'Restore the previous module selection';
            var clearButton = document.createElement('button');
            clearButton.textContent = 'Select none';
            clearButton.type = 'button';
            clearButton.title = 'Clear the current module selection';
            addEvent(clearButton, 'click', function () {
                dropdownData.selectedMap.clear();
                selectionChange();
                searchInput();
            });
            var actions = document.createElement('span');
            actions.id = 'qunit-modulefilter-actions';
            actions.appendChild(applyButton);
            actions.appendChild(resetButton);
            if (initialSelected.size) {
                actions.appendChild(clearButton);
            }
            var dropDownList = document.createElement('ul');
            dropDownList.id = 'qunit-modulefilter-dropdown-list';
            var dropDown = document.createElement('div');
            dropDown.id = 'qunit-modulefilter-dropdown';
            dropDown.style.display = 'none';
            dropDown.appendChild(actions);
            dropDown.appendChild(dropDownList);
            addEvent(dropDown, 'change', selectionChange);
            searchContainer.appendChild(dropDown);
            selectionChange();
            var moduleFilter = document.createElement('form');
            moduleFilter.id = 'qunit-modulefilter';
            moduleFilter.appendChild(label);
            moduleFilter.appendChild(document.createTextNode(' '));
            moduleFilter.appendChild(searchContainer);
            addEvent(moduleFilter, 'submit', interceptNavigation);
            addEvent(moduleFilter, 'reset', function () {
                dropdownData.selectedMap = new StringMap(initialSelected);
                selectionChange();
                searchInput();
            });
            function searchFocus() {
                if (dropDown.style.display !== 'none') {
                    return;
                }
                searchInput();
                dropDown.style.display = 'block';
                addEvent(document, 'click', hideHandler);
                addEvent(document, 'keydown', hideHandler);
                function hideHandler(e) {
                    var inContainer = moduleFilter.contains(e.target);
                    if (e.keyCode === 27 || !inContainer) {
                        if (e.keyCode === 27 && inContainer) {
                            moduleSearch.focus();
                        }
                        dropDown.style.display = 'none';
                        removeEvent(document, 'click', hideHandler);
                        removeEvent(document, 'keydown', hideHandler);
                        moduleSearch.value = '';
                        searchInput();
                    }
                }
            }
            function filterModules(searchText) {
                var results;
                if (searchText === '') {
                    results = dropdownData.options.map(function (obj) {
                        return {
                            obj: obj
                        };
                    });
                }
                else {
                    results = fuzzysort.go(searchText, dropdownData.options, {
                        limit: 1000,
                        key: 'name',
                        allowTypo: true
                    });
                }
                return moduleListHtml(results);
            }
            var searchInputTimeout;
            function searchInput() {
                window$1.clearTimeout(searchInputTimeout);
                searchInputTimeout = window$1.setTimeout(function () {
                    dropDownList.innerHTML = filterModules(moduleSearch.value);
                });
            }
            function selectionChange(evt) {
                var checkbox = evt && evt.target || null;
                if (checkbox) {
                    if (checkbox.checked) {
                        dropdownData.selectedMap.set(checkbox.value, checkbox.parentNode.textContent);
                    }
                    else {
                        dropdownData.selectedMap.delete(checkbox.value);
                    }
                    toggleClass(checkbox.parentNode, 'checked', checkbox.checked);
                }
                var textForm = dropdownData.selectedMap.size ? dropdownData.selectedMap.size + ' ' + (dropdownData.selectedMap.size === 1 ? 'module' : 'modules') : 'All modules';
                moduleSearch.placeholder = textForm;
                moduleSearch.title = 'Type to search through and reduce the list.';
                resetButton.disabled = !dropdownData.isDirty();
                clearButton.style.display = dropdownData.selectedMap.size ? '' : 'none';
            }
            return moduleFilter;
        }
        function appendToolbar(beginDetails) {
            var toolbar = id('qunit-testrunner-toolbar');
            if (toolbar) {
                toolbar.appendChild(toolbarUrlConfigContainer());
                var toolbarFilters = document.createElement('span');
                toolbarFilters.id = 'qunit-toolbar-filters';
                toolbarFilters.appendChild(toolbarLooseFilter());
                toolbarFilters.appendChild(toolbarModuleFilter(beginDetails));
                var clearfix = document.createElement('div');
                clearfix.className = 'clearfix';
                toolbar.appendChild(toolbarFilters);
                toolbar.appendChild(clearfix);
            }
        }
        function appendHeader() {
            var header = id('qunit-header');
            if (header) {
                header.innerHTML = "<a href='" + escapeText(unfilteredUrl) + "'>" + header.innerHTML + '</a> ';
            }
        }
        function appendBanner() {
            var banner = id('qunit-banner');
            if (banner) {
                banner.className = '';
            }
        }
        function appendTestResults() {
            var tests = id('qunit-tests');
            var result = id('qunit-testresult');
            var controls;
            if (result) {
                result.parentNode.removeChild(result);
            }
            if (tests) {
                tests.innerHTML = '';
                result = document.createElement('p');
                result.id = 'qunit-testresult';
                result.className = 'result';
                tests.parentNode.insertBefore(result, tests);
                result.innerHTML = '<div id="qunit-testresult-display">Running...<br />&#160;</div>' + '<div id="qunit-testresult-controls"></div>' + '<div class="clearfix"></div>';
                controls = id('qunit-testresult-controls');
            }
            if (controls) {
                controls.appendChild(abortTestsButton());
            }
        }
        function appendFilteredTest() {
            var testId = QUnit.config.testId;
            if (!testId || testId.length <= 0) {
                return '';
            }
            return "<div id='qunit-filteredTest'>Rerunning selected tests: " + escapeText(testId.join(', ')) + " <a id='qunit-clearFilter' href='" + escapeText(unfilteredUrl) + "'>Run all tests</a></div>";
        }
        function appendUserAgent() {
            var userAgent = id('qunit-userAgent');
            if (userAgent) {
                userAgent.innerHTML = '';
                userAgent.appendChild(document.createTextNode('QUnit ' + QUnit.version + '; ' + navigator.userAgent));
            }
        }
        function appendInterface(beginDetails) {
            var qunit = id('qunit');
            if (qunit) {
                qunit.setAttribute('role', 'main');
                qunit.innerHTML = "<h1 id='qunit-header'>" + escapeText(document.title) + '</h1>' + "<h2 id='qunit-banner'></h2>" + "<div id='qunit-testrunner-toolbar' role='navigation'></div>" + appendFilteredTest() + "<h2 id='qunit-userAgent'></h2>" + "<ol id='qunit-tests'></ol>";
            }
            appendHeader();
            appendBanner();
            appendTestResults();
            appendUserAgent();
            appendToolbar(beginDetails);
        }
        function appendTest(name, testId, moduleName) {
            var tests = id('qunit-tests');
            if (!tests) {
                return;
            }
            var title = document.createElement('strong');
            title.innerHTML = getNameHtml(name, moduleName);
            var testBlock = document.createElement('li');
            testBlock.appendChild(title);
            if (testId !== undefined) {
                var rerunTrigger = document.createElement('a');
                rerunTrigger.innerHTML = 'Rerun';
                rerunTrigger.href = setUrl({
                    testId: testId
                });
                testBlock.id = 'qunit-test-output-' + testId;
                testBlock.appendChild(rerunTrigger);
            }
            var assertList = document.createElement('ol');
            assertList.className = 'qunit-assert-list';
            testBlock.appendChild(assertList);
            tests.appendChild(testBlock);
            return testBlock;
        }
        QUnit.on('runStart', function (runStart) {
            stats.defined = runStart.testCounts.total;
        });
        QUnit.begin(function (beginDetails) {
            appendInterface(beginDetails);
        });
        function getRerunFailedHtml(failedTests) {
            if (failedTests.length === 0) {
                return '';
            }
            var href = setUrl({
                testId: failedTests
            });
            return ["<br /><a href='" + escapeText(href) + "'>", failedTests.length === 1 ? 'Rerun 1 failed test' : 'Rerun ' + failedTests.length + ' failed tests', '</a>'].join('');
        }
        QUnit.on('runEnd', function (runEnd) {
            var banner = id('qunit-banner');
            var tests = id('qunit-tests');
            var abortButton = id('qunit-abort-tests-button');
            var assertPassed = config.stats.all - config.stats.bad;
            var html = [runEnd.testCounts.total, ' tests completed in ', runEnd.runtime, ' milliseconds, with ', runEnd.testCounts.failed, ' failed, ', runEnd.testCounts.skipped, ' skipped, and ', runEnd.testCounts.todo, ' todo.<br />', "<span class='passed'>", assertPassed, "</span> assertions of <span class='total'>", config.stats.all, "</span> passed, <span class='failed'>", config.stats.bad, '</span> failed.', getRerunFailedHtml(stats.failedTests)].join('');
            var test;
            var assertLi;
            var assertList;
            if (abortButton && abortButton.disabled) {
                html = 'Tests aborted after ' + runEnd.runtime + ' milliseconds.';
                for (var i = 0; i < tests.children.length; i++) {
                    test = tests.children[i];
                    if (test.className === '' || test.className === 'running') {
                        test.className = 'aborted';
                        assertList = test.getElementsByTagName('ol')[0];
                        assertLi = document.createElement('li');
                        assertLi.className = 'fail';
                        assertLi.innerHTML = 'Test aborted.';
                        assertList.appendChild(assertLi);
                    }
                }
            }
            if (banner && (!abortButton || abortButton.disabled === false)) {
                banner.className = runEnd.status === 'failed' ? 'qunit-fail' : 'qunit-pass';
            }
            if (abortButton) {
                abortButton.parentNode.removeChild(abortButton);
            }
            if (tests) {
                id('qunit-testresult-display').innerHTML = html;
            }
            if (config.altertitle && document.title) {
                document.title = [runEnd.status === 'failed' ? "\u2716" : "\u2714", document.title.replace(/^[\u2714\u2716] /i, '')].join(' ');
            }
            if (config.scrolltop && window$1.scrollTo) {
                window$1.scrollTo(0, 0);
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
        function getProgressHtml(stats) {
            return [stats.completed, ' / ', stats.defined, ' tests completed.<br />'].join('');
        }
        QUnit.testStart(function (details) {
            var running, bad;
            appendTest(details.name, details.testId, details.module);
            running = id('qunit-testresult-display');
            if (running) {
                addClass(running, 'running');
                bad = QUnit.config.reorder && details.previousFailure;
                running.innerHTML = [getProgressHtml(stats), bad ? 'Rerunning previously failed test: <br />' : 'Running: ', getNameHtml(details.name, details.module), getRerunFailedHtml(stats.failedTests)].join('');
            }
        });
        function stripHtml(string) {
            return string.replace(/<\/?[^>]+(>|$)/g, '').replace(/&quot;/g, '').replace(/\s+/g, '');
        }
        QUnit.log(function (details) {
            var testItem = id('qunit-test-output-' + details.testId);
            if (!testItem) {
                return;
            }
            var message = escapeText(details.message) || (details.result ? 'okay' : 'failed');
            message = "<span class='test-message'>" + message + '</span>';
            message += "<span class='runtime'>@ " + details.runtime + ' ms</span>';
            var expected;
            var actual;
            var diff;
            var showDiff = false;
            if (!details.result && hasOwn.call(details, 'expected')) {
                if (details.negative) {
                    expected = 'NOT ' + QUnit.dump.parse(details.expected);
                }
                else {
                    expected = QUnit.dump.parse(details.expected);
                }
                actual = QUnit.dump.parse(details.actual);
                message += "<table><tr class='test-expected'><th>Expected: </th><td><pre>" + escapeText(expected) + '</pre></td></tr>';
                if (actual !== expected) {
                    message += "<tr class='test-actual'><th>Result: </th><td><pre>" + escapeText(actual) + '</pre></td></tr>';
                    if (typeof details.actual === 'number' && typeof details.expected === 'number') {
                        if (!isNaN(details.actual) && !isNaN(details.expected)) {
                            showDiff = true;
                            diff = details.actual - details.expected;
                            diff = (diff > 0 ? '+' : '') + diff;
                        }
                    }
                    else if (typeof details.actual !== 'boolean' && typeof details.expected !== 'boolean') {
                        diff = QUnit.diff(expected, actual);
                        showDiff = stripHtml(diff).length !== stripHtml(expected).length + stripHtml(actual).length;
                    }
                    if (showDiff) {
                        message += "<tr class='test-diff'><th>Diff: </th><td><pre>" + diff + '</pre></td></tr>';
                    }
                }
                else if (expected.indexOf('[object Array]') !== -1 || expected.indexOf('[object Object]') !== -1) {
                    message += "<tr class='test-message'><th>Message: </th><td>" + 'Diff suppressed as the depth of object is more than current max depth (' + QUnit.config.maxDepth + ').<p>Hint: Use <code>QUnit.dump.maxDepth</code> to ' + " run with a higher max depth or <a href='" + escapeText(setUrl({
                        maxDepth: -1
                    })) + "'>" + 'Rerun</a> without max depth.</p></td></tr>';
                }
                else {
                    message += "<tr class='test-message'><th>Message: </th><td>" + 'Diff suppressed as the expected and actual results have an equivalent' + ' serialization</td></tr>';
                }
                if (details.source) {
                    message += "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + '</pre></td></tr>';
                }
                message += '</table>';
            }
            else if (!details.result && details.source) {
                message += '<table>' + "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + '</pre></td></tr>' + '</table>';
            }
            var assertList = testItem.getElementsByTagName('ol')[0];
            var assertLi = document.createElement('li');
            assertLi.className = details.result ? 'pass' : 'fail';
            assertLi.innerHTML = message;
            assertList.appendChild(assertLi);
        });
        QUnit.testDone(function (details) {
            var tests = id('qunit-tests');
            var testItem = id('qunit-test-output-' + details.testId);
            if (!tests || !testItem) {
                return;
            }
            removeClass(testItem, 'running');
            var status;
            if (details.failed > 0) {
                status = 'failed';
            }
            else if (details.todo) {
                status = 'todo';
            }
            else {
                status = details.skipped ? 'skipped' : 'passed';
            }
            var assertList = testItem.getElementsByTagName('ol')[0];
            var good = details.passed;
            var bad = details.failed;
            var testPassed = details.failed > 0 ? details.todo : !details.todo;
            if (testPassed) {
                addClass(assertList, 'qunit-collapsed');
            }
            else {
                stats.failedTests.push(details.testId);
                if (config.collapse) {
                    if (!collapseNext) {
                        collapseNext = true;
                    }
                    else {
                        addClass(assertList, 'qunit-collapsed');
                    }
                }
            }
            var testTitle = testItem.firstChild;
            var testCounts = bad ? "<b class='failed'>" + bad + '</b>, ' + "<b class='passed'>" + good + '</b>, ' : '';
            testTitle.innerHTML += " <b class='counts'>(" + testCounts + details.assertions.length + ')</b>';
            stats.completed++;
            if (details.skipped) {
                testItem.className = 'skipped';
                var skipped = document.createElement('em');
                skipped.className = 'qunit-skipped-label';
                skipped.innerHTML = 'skipped';
                testItem.insertBefore(skipped, testTitle);
            }
            else {
                addEvent(testTitle, 'click', function () {
                    toggleClass(assertList, 'qunit-collapsed');
                });
                testItem.className = testPassed ? 'pass' : 'fail';
                if (details.todo) {
                    var todoLabel = document.createElement('em');
                    todoLabel.className = 'qunit-todo-label';
                    todoLabel.innerHTML = 'todo';
                    testItem.className += ' todo';
                    testItem.insertBefore(todoLabel, testTitle);
                }
                var time = document.createElement('span');
                time.className = 'runtime';
                time.innerHTML = details.runtime + ' ms';
                testItem.insertBefore(time, assertList);
            }
            if (details.source) {
                var sourceName = document.createElement('p');
                sourceName.innerHTML = '<strong>Source: </strong>' + escapeText(details.source);
                addClass(sourceName, 'qunit-source');
                if (testPassed) {
                    addClass(sourceName, 'qunit-collapsed');
                }
                addEvent(testTitle, 'click', function () {
                    toggleClass(sourceName, 'qunit-collapsed');
                });
                testItem.appendChild(sourceName);
            }
            if (config.hidepassed && (status === 'passed' || details.skipped)) {
                hiddenTests.push(testItem);
                tests.removeChild(testItem);
            }
        });
        QUnit.on('error', function (error) {
            var testItem = appendTest('global failure');
            if (!testItem) {
                return;
            }
            var message = escapeText(errorString(error));
            message = "<span class='test-message'>" + message + '</span>';
            if (error && error.stack) {
                message += '<table>' + "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(error.stack) + '</pre></td></tr>' + '</table>';
            }
            var assertList = testItem.getElementsByTagName('ol')[0];
            var assertLi = document.createElement('li');
            assertLi.className = 'fail';
            assertLi.innerHTML = message;
            assertList.appendChild(assertLi);
            testItem.className = 'fail';
        });
        var usingPhantom = function (p) {
            return p && p.version && p.version.major > 0;
        }(window$1.phantom);
        if (usingPhantom) {
            console$1.warn('Support for PhantomJS is deprecated and will be removed in QUnit 3.0.');
        }
        if (!usingPhantom && document.readyState === 'complete') {
            QUnit.load();
        }
        else {
            addEvent(window$1, 'load', QUnit.load);
        }
        var originalWindowOnError = window$1.onerror;
        window$1.onerror = function (message, fileName, lineNumber, columnNumber, errorObj) {
            var ret = false;
            if (originalWindowOnError) {
                for (var _len = arguments.length, args = new Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {
                    args[_key - 5] = arguments[_key];
                }
                ret = originalWindowOnError.call.apply(originalWindowOnError, [this, message, fileName, lineNumber, columnNumber, errorObj].concat(args));
            }
            if (ret !== true) {
                if (config.current && config.current.ignoreGlobalErrors) {
                    return true;
                }
                var error = errorObj || new Error(message);
                if (!error.stack && fileName && lineNumber) {
                    error.stack = "".concat(fileName, ":").concat(lineNumber);
                }
                QUnit.onUncaughtException(error);
            }
            return ret;
        };
        window$1.addEventListener('unhandledrejection', function (event) {
            QUnit.onUncaughtException(event.reason);
        });
    })();
    QUnit.diff = function () {
        function DiffMatchPatch() { }
        var DIFF_DELETE = -1;
        var DIFF_INSERT = 1;
        var DIFF_EQUAL = 0;
        var hasOwn = Object.prototype.hasOwnProperty;
        DiffMatchPatch.prototype.DiffMain = function (text1, text2, optChecklines) {
            var deadline = Date.now() + 1000;
            if (text1 === null || text2 === null) {
                throw new Error('Cannot diff null input.');
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
            var commonlength = this.diffCommonPrefix(text1, text2);
            var commonprefix = text1.substring(0, commonlength);
            text1 = text1.substring(commonlength);
            text2 = text2.substring(commonlength);
            commonlength = this.diffCommonSuffix(text1, text2);
            var commonsuffix = text1.substring(text1.length - commonlength);
            text1 = text1.substring(0, text1.length - commonlength);
            text2 = text2.substring(0, text2.length - commonlength);
            var diffs = this.diffCompute(text1, text2, optChecklines, deadline);
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
                    if (lastequality && (preIns && preDel && postIns && postDel || lastequality.length < 2 && preIns + preDel + postIns + postDel === 3)) {
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
            var html = [];
            for (var x = 0; x < diffs.length; x++) {
                var op = diffs[x][0];
                var data = diffs[x][1];
                switch (op) {
                    case DIFF_INSERT:
                        html[x] = '<ins>' + escapeText(data) + '</ins>';
                        break;
                    case DIFF_DELETE:
                        html[x] = '<del>' + escapeText(data) + '</del>';
                        break;
                    case DIFF_EQUAL:
                        html[x] = '<span>' + escapeText(data) + '</span>';
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
                if (text1.substring(text1.length - pointermid, text1.length - pointerend) === text2.substring(text2.length - pointermid, text2.length - pointerend)) {
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
                diffs = [[DIFF_INSERT, longtext.substring(0, i)], [DIFF_EQUAL, shorttext], [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
                if (text1.length > text2.length) {
                    diffs[0][0] = diffs[2][0] = DIFF_DELETE;
                }
                return diffs;
            }
            if (shorttext.length === 1) {
                return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
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
                if (Date.now() > deadline) {
                    break;
                }
                for (k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
                    k1Offset = vOffset + k1;
                    if (k1 === -d || k1 !== d && v1[k1Offset - 1] < v1[k1Offset + 1]) {
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
                    if (k2 === -d || k2 !== d && v2[k2Offset - 1] < v2[k2Offset + 1]) {
                        x2 = v2[k2Offset + 1];
                    }
                    else {
                        x2 = v2[k2Offset - 1] + 1;
                    }
                    y2 = x2 - k2;
                    while (x2 < text1Length && y2 < text2Length && text1.charAt(text1Length - x2 - 1) === text2.charAt(text2Length - y2 - 1)) {
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
            return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
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
            var changes = false;
            var equalities = [];
            var equalitiesLength = 0;
            var lastequality = null;
            var pointer = 0;
            var lengthInsertions1 = 0;
            var lengthDeletions1 = 0;
            var lengthInsertions2 = 0;
            var lengthDeletions2 = 0;
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
                    if (lastequality && lastequality.length <= Math.max(lengthInsertions1, lengthDeletions1) && lastequality.length <= Math.max(lengthInsertions2, lengthDeletions2)) {
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
            var deletion, insertion, overlapLength1, overlapLength2;
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
            var text1Length = text1.length;
            var text2Length = text2.length;
            if (text1Length === 0 || text2Length === 0) {
                return 0;
            }
            if (text1Length > text2Length) {
                text1 = text1.substring(text1Length - text2Length);
            }
            else if (text1Length < text2Length) {
                text2 = text2.substring(0, text1Length);
            }
            var textLength = Math.min(text1Length, text2Length);
            if (text1 === text2) {
                return textLength;
            }
            var best = 0;
            var length = 1;
            while (true) {
                var pattern = text1.substring(textLength - length);
                var found = text2.indexOf(pattern);
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
            var lineArray = [];
            var lineHash = {};
            lineArray[0] = '';
            function diffLinesToCharsMunge(text) {
                var chars = '';
                var lineStart = 0;
                var lineEnd = -1;
                var lineArrayLength = lineArray.length;
                while (lineEnd < text.length - 1) {
                    lineEnd = text.indexOf('\n', lineStart);
                    if (lineEnd === -1) {
                        lineEnd = text.length - 1;
                    }
                    var line = text.substring(lineStart, lineEnd + 1);
                    lineStart = lineEnd + 1;
                    if (hasOwn.call(lineHash, line)) {
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
            var chars1 = diffLinesToCharsMunge(text1);
            var chars2 = diffLinesToCharsMunge(text2);
            return {
                chars1: chars1,
                chars2: chars2,
                lineArray: lineArray
            };
        };
        DiffMatchPatch.prototype.diffCharsToLines = function (diffs, lineArray) {
            for (var x = 0; x < diffs.length; x++) {
                var chars = diffs[x][1];
                var text = [];
                for (var y = 0; y < chars.length; y++) {
                    text[y] = lineArray[chars.charCodeAt(y)];
                }
                diffs[x][1] = text.join('');
            }
        };
        DiffMatchPatch.prototype.diffCleanupMerge = function (diffs) {
            diffs.push([DIFF_EQUAL, '']);
            var pointer = 0;
            var countDelete = 0;
            var countInsert = 0;
            var textDelete = '';
            var textInsert = '';
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
                                var commonlength = this.diffCommonPrefix(textInsert, textDelete);
                                if (commonlength !== 0) {
                                    if (pointer - countDelete - countInsert > 0 && diffs[pointer - countDelete - countInsert - 1][0] === DIFF_EQUAL) {
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
            var changes = false;
            pointer = 1;
            while (pointer < diffs.length - 1) {
                if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
                    var diffPointer = diffs[pointer][1];
                    var position = diffPointer.substring(diffPointer.length - diffs[pointer - 1][1].length);
                    if (position === diffs[pointer - 1][1]) {
                        diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
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
    }();
})();
