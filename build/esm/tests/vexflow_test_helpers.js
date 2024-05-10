import { Factory, Flow, Font, Renderer } from '../src/index.js';
import { globalObject } from '../src/util.js';
const global = globalObject();
let originalFontNames;
function useTempFontStack(fontName) {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...VexFlowTests.FONT_STACKS[fontName]);
}
function restoreOriginalFontStack() {
    Flow.setMusicFont(...originalFontNames);
}
if (!global.$) {
    global.$ = (param) => {
        let element;
        if (typeof param !== 'string') {
            element = param;
        }
        else if (param.startsWith('<')) {
            const tagName = param.match(/[A-Za-z]+/g)[0];
            element = document.createElement(tagName);
        }
        else {
            element = document.querySelector(param);
        }
        const $element = {
            get(index) {
                return element;
            },
            addClass(c) {
                element.classList.add(c);
                return $element;
            },
            text(t) {
                element.textContent = t;
                return $element;
            },
            html(h) {
                if (!h) {
                    return element.innerHTML;
                }
                else {
                    element.innerHTML = h;
                    return $element;
                }
            },
            append(...elementsToAppend) {
                elementsToAppend.forEach((e) => {
                    element.appendChild(e);
                });
                return $element;
            },
            attr(attrName, val) {
                element.setAttribute(attrName, val);
                return $element;
            },
        };
        return $element;
    };
}
function sanitizeName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '_');
}
const CANVAS_TEST_CONFIG = {
    backend: Renderer.Backends.CANVAS,
    tagName: 'canvas',
    testType: 'Canvas',
    fontStacks: ['Bravura'],
};
const CANVAS_TEXT_CONFIG = {
    backend: Renderer.Backends.CANVAS,
    tagName: 'canvas',
    testType: 'Canvas',
    fontStacks: ['Bravura'],
};
const SVG_TEST_CONFIG = {
    backend: Renderer.Backends.SVG,
    tagName: 'div',
    testType: 'SVG',
    fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'],
};
const SVG_TEXT_CONFIG = {
    backend: Renderer.Backends.SVG,
    tagName: 'div',
    testType: 'SVG',
    fontStacks: ['Bravura'],
};
const NODE_TEST_CONFIG = {
    backend: Renderer.Backends.CANVAS,
    tagName: 'canvas',
    testType: 'NodeCanvas',
    fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'],
};
class VexFlowTests {
    static register(test) {
        VexFlowTests.tests.push(test);
    }
    static parseJobOptions(runOptions) {
        let { jobs, job } = runOptions || { jobs: 1, job: 0 };
        if (window) {
            const { location } = window;
            if (location) {
                const sps = new URLSearchParams(location.search);
                const jobsParam = sps.get('jobs');
                const jobParam = sps.get('job');
                if (jobsParam) {
                    jobs = parseInt(jobsParam, 10);
                }
                if (jobParam) {
                    job = parseInt(jobParam, 10);
                }
            }
        }
        return {
            jobs,
            job,
        };
    }
    static run(runOptions) {
        const { jobs, job } = VexFlowTests.parseJobOptions(runOptions);
        VexFlowTests.tests.forEach((test, idx) => {
            if (jobs === 1 || idx % jobs === job) {
                test.Start();
            }
        });
    }
    static set NODE_FONT_STACKS(fontStacks) {
        NODE_TEST_CONFIG.fontStacks = fontStacks;
    }
    static generateTestID(prefix) {
        return prefix + '_' + VexFlowTests.NEXT_TEST_ID++;
    }
    static runTests(name, testFunc, params) {
        VexFlowTests.runCanvasTest(name, testFunc, params);
        VexFlowTests.runSVGTest(name, testFunc, params);
        VexFlowTests.runNodeTest(name, testFunc, params);
    }
    static runTextTests(name, testFunc, params) {
        VexFlowTests.runCanvasText(name, testFunc, params);
        VexFlowTests.runSVGText(name, testFunc, params);
    }
    static createTest(elementId, testTitle, tagName, titleId = '') {
        const anchorTestTitle = `<a href="#${titleId}">${testTitle}</a>`;
        const title = $('<div/>').addClass('name').attr('id', titleId).html(anchorTestTitle).get(0);
        const vexOutput = $(`<${tagName}/>`).addClass('vex-tabdiv').attr('id', elementId).get(0);
        const container = $('<div/>').addClass('testcanvas').append(title, vexOutput).get(0);
        $('#qunit-tests').append(container);
        return vexOutput;
    }
    static makeFactory(options, width = 450, height = 140) {
        const { elementId, backend } = options;
        return new Factory({ renderer: { elementId, backend, width, height } });
    }
    static runCanvasTest(name, testFunc, params) {
        if (VexFlowTests.RUN_CANVAS_TESTS) {
            const helper = null;
            VexFlowTests.runWithParams(Object.assign(Object.assign({}, CANVAS_TEST_CONFIG), { name, testFunc, params, helper }));
        }
    }
    static runCanvasText(name, testFunc, params) {
        if (VexFlowTests.RUN_CANVAS_TESTS) {
            const helper = null;
            VexFlowTests.runWithParams(Object.assign(Object.assign({}, CANVAS_TEXT_CONFIG), { name, testFunc, params, helper }));
        }
    }
    static runSVGTest(name, testFunc, params) {
        if (VexFlowTests.RUN_SVG_TESTS) {
            const helper = null;
            VexFlowTests.runWithParams(Object.assign(Object.assign({}, SVG_TEST_CONFIG), { name, testFunc, params, helper }));
        }
    }
    static runSVGText(name, testFunc, params) {
        if (VexFlowTests.RUN_SVG_TESTS) {
            const helper = null;
            VexFlowTests.runWithParams(Object.assign(Object.assign({}, SVG_TEXT_CONFIG), { name, testFunc, params, helper }));
        }
    }
    static runNodeTest(name, testFunc, params) {
        if (VexFlowTests.RUN_NODE_TESTS) {
            const helper = VexFlowTests.runNodeTestHelper;
            VexFlowTests.runWithParams(Object.assign(Object.assign({}, NODE_TEST_CONFIG), { name, testFunc, params, helper }));
        }
    }
    static runNodeTestHelper(fontName, element) {
        if (Renderer.lastContext !== undefined) {
            const moduleName = sanitizeName(QUnit.module.name);
            const testName = sanitizeName(QUnit.test.name);
            const onlyBravura = NODE_TEST_CONFIG.fontStacks.length === 1 && fontName === 'Bravura';
            const fontInfo = onlyBravura ? '' : `.${fontName}`;
            const fileName = `${VexFlowTests.NODE_IMAGEDIR}/${moduleName}.${testName}${fontInfo}.png`;
            const imageData = element.toDataURL().split(';base64,').pop();
            const imageBuffer = Buffer.from(imageData, 'base64');
            VexFlowTests.shims.fs.writeFileSync(fileName, imageBuffer, { encoding: 'base64' });
        }
    }
    static runWithParams({ fontStacks, testFunc, name, params, backend, tagName, testType, helper }) {
        if (name === undefined) {
            throw new Error('Test name is undefined.');
        }
        const testTypeLowerCase = testType.toLowerCase();
        fontStacks.forEach((fontStackName) => {
            QUnit.test(name, (assert) => {
                useTempFontStack(fontStackName);
                const elementId = VexFlowTests.generateTestID(`${testTypeLowerCase}_` + fontStackName);
                const moduleName = assert.test.module.name;
                const title = moduleName + ' › ' + name + ` › ${testType} + ${fontStackName}`;
                let prefix = '';
                if (testTypeLowerCase === 'canvas') {
                    prefix = testTypeLowerCase + '_';
                }
                else {
                }
                const titleId = `${prefix}${sanitizeName(moduleName)}.${sanitizeName(name)}.${fontStackName}`;
                const element = VexFlowTests.createTest(elementId, title, tagName, titleId);
                const options = { elementId, params, assert, backend };
                const isSVG = backend === Renderer.Backends.SVG;
                const contextBuilder = isSVG ? Renderer.getSVGContext : Renderer.getCanvasContext;
                testFunc(options, contextBuilder);
                restoreOriginalFontStack();
                if (helper)
                    helper(fontStackName, element);
            });
        });
    }
    static plotLegendForNoteWidth(ctx, x, y) {
        ctx.save();
        ctx.setFont(Font.SANS_SERIF, 8);
        const spacing = 12;
        let lastY = y;
        function legend(color, text) {
            ctx.beginPath();
            ctx.setStrokeStyle(color);
            ctx.setFillStyle(color);
            ctx.setLineWidth(10);
            ctx.moveTo(x, lastY - 4);
            ctx.lineTo(x + 10, lastY - 4);
            ctx.stroke();
            ctx.setFillStyle('black');
            ctx.fillText(text, x + 15, lastY);
            lastY += spacing;
        }
        legend('green', 'Note + Flag');
        legend('red', 'Modifiers');
        legend('#999', 'Displaced Head');
        legend('#DDD', 'Formatter Shift');
        ctx.restore();
    }
}
VexFlowTests.tests = [];
VexFlowTests.RUN_CANVAS_TESTS = true;
VexFlowTests.RUN_SVG_TESTS = true;
VexFlowTests.RUN_NODE_TESTS = false;
VexFlowTests.Font = { size: 10 };
VexFlowTests.FONT_STACKS = {
    Bravura: ['Bravura', 'Custom'],
    Gonville: ['Gonville', 'Bravura', 'Custom'],
    Petaluma: ['Petaluma', 'Gonville', 'Bravura', 'Custom'],
    Leland: ['Leland', 'Bravura', 'Custom'],
};
VexFlowTests.NEXT_TEST_ID = 0;
export { VexFlowTests };
export const concat = (a, b) => a.concat(b);
export const MAJOR_KEYS = [
    'C',
    'F',
    'Bb',
    'Eb',
    'Ab',
    'Db',
    'Gb',
    'Cb',
    'G',
    'D',
    'A',
    'E',
    'B',
    'F#',
    'C#',
];
export const MINOR_KEYS = [
    'Am',
    'Dm',
    'Gm',
    'Cm',
    'Fm',
    'Bbm',
    'Ebm',
    'Abm',
    'Em',
    'Bm',
    'F#m',
    'C#m',
    'G#m',
    'D#m',
    'A#m',
];
Flow.Test = VexFlowTests;
