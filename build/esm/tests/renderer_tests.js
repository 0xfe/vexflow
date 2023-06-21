import { VexFlowTests } from './vexflow_test_helpers.js';
import { CanvasContext, Factory, Formatter, isHTMLCanvas, Renderer, RuntimeError, Stave, StaveNote, SVGContext, } from '../src/index.js';
const STAVE_WIDTH = 700;
const STAVE_HEIGHT = 100;
const STAVE_RIGHT_MARGIN = 10;
const USE_RENDERER = { useRendererAPI: true };
const USE_FACTORY = { useRendererAPI: false };
const RendererTests = {
    Start() {
        QUnit.module('Renderer');
        const run = VexFlowTests.runTests;
        run('Random', random);
        run('Renderer API with element ID string', stringElementId, USE_RENDERER);
        run('Renderer API with canvas or div', canvasOrDivElement, USE_RENDERER);
        run('Renderer API with context', passRenderContext);
        run('Factory API with element ID string', stringElementId, USE_FACTORY);
        run('Factory API with canvas or div', canvasOrDivElement, USE_FACTORY);
    },
};
function drawStave(stave, context) {
    stave.addClef('bass').addTimeSignature('3/4').draw();
    Formatter.FormatAndDraw(context, stave, [
        new StaveNote({ keys: ['C/4'], duration: '4' }),
        new StaveNote({ keys: ['E/4'], duration: '4' }),
        new StaveNote({ keys: ['G/4'], duration: '4' }),
    ]);
}
function random(options) {
    const useElementIDString = Math.random() > 0.5;
    const useRendererAPI = Math.random() > 0.5;
    options.params = { useRendererAPI };
    if (useElementIDString) {
        stringElementId(options);
    }
    else {
        canvasOrDivElement(options);
    }
    const element = document.getElementById(options.elementId);
    const colorForElementType = useElementIDString ? '#CCCCCC' : '#0074d9';
    const lineStyleForWhichAPI = useRendererAPI ? 'solid' : 'dashed';
    const borderStyle = `3px ${lineStyleForWhichAPI} ${colorForElementType}`;
    let elementType;
    if (options.backend === Renderer.Backends.CANVAS) {
        element.style.border = borderStyle;
        elementType = '&lt;canvas&gt; element object';
    }
    else {
        element.children[0].style.border = borderStyle;
        elementType = '&lt;svg&gt; element object';
    }
    if (useElementIDString) {
        elementType = 'elementID string';
    }
    const whichAPI = useRendererAPI ? 'Renderer API' : 'Factory API';
    element.parentElement.insertAdjacentHTML('beforeend', `<div style='position:relative; bottom: 100px; font-size: 12pt;'>` +
        `<span style="border-bottom: ${borderStyle}; padding-bottom: 3px; ${lineStyleForWhichAPI}">${whichAPI}</span>` +
        ` with ` +
        `<span style="background-color:${colorForElementType}; padding: 3px; color:white;">${elementType}</span>` +
        `</div><br>`);
}
function useRendererAPI(e, backend) {
    const renderer = new Renderer(e, backend);
    renderer.resize(STAVE_WIDTH, STAVE_HEIGHT);
    const context = renderer.getContext();
    drawStave(new Stave(0, 0, STAVE_WIDTH - STAVE_RIGHT_MARGIN).setContext(context), context);
}
function useFactoryAPI(e, backend) {
    const opts = {
        renderer: { elementId: e, width: STAVE_WIDTH, height: STAVE_HEIGHT, backend },
    };
    const factory = new Factory(opts);
    drawStave(factory.Stave(), factory.getContext());
}
function stringElementId(options) {
    const elementId = options.elementId;
    if (options.params.useRendererAPI) {
        useRendererAPI(elementId, options.backend);
    }
    else {
        useFactoryAPI(elementId, options.backend);
    }
    options.assert.ok(true);
}
function canvasOrDivElement(options) {
    const element = document.getElementById(options.elementId);
    if (options.params.useRendererAPI) {
        useRendererAPI(element, options.backend);
    }
    else {
        useFactoryAPI(element, options.backend);
    }
    options.assert.ok(true);
}
function passRenderContext(options) {
    let context;
    const element = document.getElementById(options.elementId);
    if (isHTMLCanvas(element)) {
        const ctx = element.getContext('2d');
        if (!ctx) {
            throw new RuntimeError(`Couldn't get context from element "${options.elementId}"`);
        }
        context = new CanvasContext(ctx);
    }
    else {
        context = new SVGContext(element);
    }
    const renderer = new Renderer(context);
    renderer.resize(STAVE_WIDTH, STAVE_HEIGHT);
    drawStave(new Stave(0, 0, STAVE_WIDTH - STAVE_RIGHT_MARGIN).setContext(context), context);
    options.assert.ok(true);
}
VexFlowTests.register(RendererTests);
export { RendererTests };
