// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Ron B. Yeh
// MIT License
//
// Renderer Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import {
  CanvasContext,
  Factory,
  FactoryOptions,
  Formatter,
  isHTMLCanvas,
  RenderContext,
  Renderer,
  RuntimeError,
  Stave,
  StaveNote,
  SVGContext,
} from '../src/index';

// TODO: Should FactoryOptions.renderer.elementId also accept a canvas | div?

const STAVE_WIDTH = 700;
const STAVE_HEIGHT = 100;
// FactoryOptions.stave.space defaults to 10.
// We subtract 10 to make the useRendererAPI() output look identical to useFactoryAPI().
const STAVE_RIGHT_MARGIN = 10;

const USE_RENDERER = { useRendererAPI: true };
const USE_FACTORY = { useRendererAPI: false };

const RendererTests = {
  Start(): void {
    QUnit.module('Renderer');
    const run = VexFlowTests.runTests;

    // Randomly choose one of four setup paths. See below for a description.
    // Refresh `flow.html` to see the test change each time.
    // We can manually check that they look identical
    // by opening `flow.html` in multiple tabs & quickly switching between tabs.
    run('Random', random);

    // These are the four setup paths. They should all produce the same output.
    //   Use the:  Renderer API       OR  Factory API
    //   Pass in:  element ID string  OR  canvas/div element.
    run('Renderer API with element ID string', stringElementId, USE_RENDERER);
    run('Renderer API with canvas or div', canvasOrDivElement, USE_RENDERER);
    run('Renderer API with context', passRenderContext);
    run('Factory API with element ID string', stringElementId, USE_FACTORY);
    run('Factory API with canvas or div', canvasOrDivElement, USE_FACTORY);
  },
};

/**
 * Helper function to add three notes to a stave.
 */
function drawStave(stave: Stave, context: RenderContext): void {
  stave.addClef('bass').addTimeSignature('3/4').draw();
  Formatter.FormatAndDraw(context, stave, [
    new StaveNote({ keys: ['C/4'], duration: '4' }),
    new StaveNote({ keys: ['E/4'], duration: '4' }),
    new StaveNote({ keys: ['G/4'], duration: '4' }),
  ]);
}

/**
 * Randomize the test upon each refresh (for verifying that the output is identical).
 * Draw a colored outline to indicate which of the four options is shown.
 * - blue = element is a SVG or Canvas element
 * - gray = element ID is a string
 * - solid outline = use the Renderer API directly
 * - dashed outline = use the Factory API
 */
function random(options: TestOptions): void {
  const useElementIDString = Math.random() > 0.5;
  const useRendererAPI = Math.random() > 0.5;
  options.params = { useRendererAPI };

  if (useElementIDString) {
    stringElementId(options);
  } else {
    canvasOrDivElement(options);
  }

  // eslint-disable-next-line
  const element: any = document.getElementById(options.elementId);
  const colorForElementType = useElementIDString ? '#CCCCCC' /* light gray */ : '#0074d9'; /* blue */
  const lineStyleForWhichAPI = useRendererAPI ? 'solid' : 'dashed';
  const borderStyle = `3px ${lineStyleForWhichAPI} ${colorForElementType}`;
  let elementType;
  if (options.backend === Renderer.Backends.CANVAS) {
    // If the backend is canvas, we draw a border around the canvas directly.
    element.style.border = borderStyle;
    elementType = '&lt;canvas&gt; element object';
  } else {
    // If the backend is SVG, we draw a border around the SVG child of the DIV.
    element.children[0].style.border = borderStyle;
    elementType = '&lt;svg&gt; element object';
  }

  if (useElementIDString) {
    elementType = 'elementID string';
  }

  const whichAPI = useRendererAPI ? 'Renderer API' : 'Factory API';
  element.parentElement.insertAdjacentHTML(
    'beforeend',
    `<div style='position:relative; bottom: 100px; font-size: 12pt;'>` +
      `<span style="border-bottom: ${borderStyle}; padding-bottom: 3px; ${lineStyleForWhichAPI}">${whichAPI}</span>` +
      ` with ` +
      `<span style="background-color:${colorForElementType}; padding: 3px; color:white;">${elementType}</span>` +
      `</div><br>`
  );
}

function useRendererAPI(e: HTMLCanvasElement | HTMLDivElement | string, backend: number) {
  const renderer = new Renderer(e, backend);
  renderer.resize(STAVE_WIDTH, STAVE_HEIGHT);
  const context = renderer.getContext();
  drawStave(new Stave(0, 0, STAVE_WIDTH - STAVE_RIGHT_MARGIN).setContext(context), context);
}

/**
 * Alternatively, use the Factory API!
 * The Factory API declares elementId to be string | null.
 * However, if we pass in a canvas or div element, it will still work.
 * This is because Factory calls new Renderer(elementId, ...) via Renderer.buildContext().
 */
function useFactoryAPI(e: HTMLCanvasElement | HTMLDivElement | string, backend: number) {
  const opts: FactoryOptions = {
    renderer: { elementId: e as string, width: STAVE_WIDTH, height: STAVE_HEIGHT, backend },
  };
  const factory = new Factory(opts);
  drawStave(factory.Stave(), factory.getContext());
}

/**
 * Pass in a elementId string. Renderer will call document.getElementById().
 */
function stringElementId(options: TestOptions): void {
  const elementId = options.elementId;
  if (options.params.useRendererAPI) {
    useRendererAPI(elementId, options.backend);
  } else {
    useFactoryAPI(elementId, options.backend);
  }
  options.assert.ok(true);
}

/**
 * Pass a canvas or div element directly to the Renderer constructor.
 */
function canvasOrDivElement(options: TestOptions): void {
  const element = document.getElementById(options.elementId) as HTMLCanvasElement | HTMLDivElement;
  if (options.params.useRendererAPI) {
    useRendererAPI(element, options.backend);
  } else {
    useFactoryAPI(element, options.backend);
  }
  options.assert.ok(true);
}

/**
 * Pass the render context directly to the Renderer constructor.
 */
function passRenderContext(options: TestOptions): void {
  let context: RenderContext;
  const element = document.getElementById(options.elementId) as HTMLCanvasElement | HTMLDivElement;
  if (isHTMLCanvas(element)) {
    const ctx = element.getContext('2d');
    if (!ctx) {
      throw new RuntimeError(`Couldn't get context from element "${options.elementId}"`);
    }
    context = new CanvasContext(ctx);
  } else {
    context = new SVGContext(element);
  }

  const renderer = new Renderer(context);
  renderer.resize(STAVE_WIDTH, STAVE_HEIGHT);
  drawStave(new Stave(0, 0, STAVE_WIDTH - STAVE_RIGHT_MARGIN).setContext(context), context);
  options.assert.ok(true);
}

VexFlowTests.register(RendererTests);
export { RendererTests };
