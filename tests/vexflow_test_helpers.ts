// [VexFlow](https://vexflow.com/) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// VexFlow Test Support Library

import { Flow } from 'flow';
import { Assert } from './types/qunit';
import { RenderContext } from 'types/common';
import { ContextBuilder, Renderer } from 'renderer';
import { Factory } from 'factory';
import { Font, Fonts } from 'font';

/* eslint-disable */
declare const global: any;
declare const $: any;
/* eslint-enable */

export interface TestOptions {
  elementId: string;
  params: any /* eslint-disable-line */;
  assert: Assert;
  backend: number;

  // Some tests use this field to pass around the ContextBuilder function.
  contextBuilder?: ContextBuilder;
}

// Each test case will switch through the available fonts, and then restore the original font when done.
let originalFontStack: Font[];
function useTempFontStack(fontName: string): void {
  originalFontStack = Flow.DEFAULT_FONT_STACK;
  Flow.DEFAULT_FONT_STACK = VexFlowTests.FONT_STACKS[fontName];
}
function restoreOriginalFontStack(): void {
  Flow.DEFAULT_FONT_STACK = originalFontStack;
}

// A micro util inspired by jQuery.
if (!global.$) {
  // generate_png_images.js uses jsdom and does not include jQuery.
  global.$ = (param: HTMLElement | string) => {
    let element: HTMLElement;
    if (typeof param !== 'string') {
      element = param;
    } else if (param.startsWith('<')) {
      // Extract the tag name: e.g., <div/> => div
      // Assume param.match returns something (! operator).
      // eslint-disable-next-line
      const tagName = param.match(/[A-Za-z]+/g)![0];
      element = document.createElement(tagName);
    } else {
      element = document.querySelector(param) as HTMLElement;
    }

    const $element = {
      // eslint-disable-next-line
      get(index: number) {
        return element;
      },
      addClass(c: string) {
        element.classList.add(c);
        return $element;
      },
      text(t: string) {
        element.textContent = t;
        return $element;
      },
      append(...elementsToAppend: HTMLElement[]) {
        elementsToAppend.forEach((e) => {
          element.appendChild(e);
        });
        return $element;
      },
      attr(attrName: string, val: string) {
        element.setAttribute(attrName, val);
        return $element;
      },
    };
    return $element;
  };
}

export type TestFunction = (options: TestOptions, contextBuilder: ContextBuilder) => void;

/** Allow `name` to be used inside file names. */
function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

const CANVAS_TEST_CONFIG = {
  backend: Renderer.Backends.CANVAS,
  tagName: 'canvas',
  testType: 'Canvas',
  fontStacks: ['Bravura'],
};

const SVG_TEST_CONFIG = {
  backend: Renderer.Backends.SVG,
  tagName: 'div',
  testType: 'SVG',
  fontStacks: ['Bravura', 'Gonville', 'Petaluma'],
};

const NODE_TEST_CONFIG = {
  backend: Renderer.Backends.CANVAS,
  tagName: 'canvas',
  testType: 'NodeCanvas',
  fontStacks: ['Bravura', 'Gonville', 'Petaluma'],
};

/**
 *
 */
class VexFlowTests {
  // See: generate_png_images.js
  // Provides access to Node JS fs & process.
  // eslint-disable-next-line
  static shims: any;

  // Defined in run.ts
  static run: () => void;

  static RUN_CANVAS_TESTS = true;
  static RUN_SVG_TESTS = true;
  static RUN_NODE_TESTS = false;

  // Where images are stored for NodeJS tests.
  static NODE_IMAGEDIR: 'images';

  // Default font properties for tests.
  static Font = { size: 10 };

  /**
   *
   */
  static FONT_STACKS: Record<string, Font[]> = {
    Bravura: [Fonts.Bravura(), Fonts.Gonville(), Fonts.Custom()],
    Gonville: [Fonts.Gonville(), Fonts.Bravura(), Fonts.Custom()],
    Petaluma: [Fonts.Petaluma(), Fonts.Gonville(), Fonts.Custom()],
  };

  static set NODE_FONT_STACKS(fontStacks: string[]) {
    NODE_TEST_CONFIG.fontStacks = fontStacks;
  }

  private static NEXT_TEST_ID = 0;

  /** Return a unique ID for a test. */
  static generateTestID(prefix: string): string {
    return prefix + '_' + VexFlowTests.NEXT_TEST_ID++;
  }

  /**
   * Run `func` inside a QUnit test for each of the enabled rendering backends.
   * @param name
   * @param testFunc
   * @param params
   */
  // eslint-disable-next-line
  static runTests(name: string, testFunc: TestFunction, params?: any): void {
    VexFlowTests.runCanvasTest(name, testFunc, params);
    VexFlowTests.runSVGTest(name, testFunc, params);
    VexFlowTests.runNodeTest(name, testFunc, params);
  }

  /**
   * Append a <div/> which contains the test case title and rendered output.
   * See flow.html and flow.css.
   * @param elementId
   * @param testTitle
   * @param tagName
   */
  static createTest(elementId: string, testTitle: string, tagName: string): HTMLElement {
    const title = $('<div/>').addClass('name').text(testTitle).get(0);
    const vexOutput = $(`<${tagName}/>`).addClass('vex-tabdiv').attr('id', elementId).get(0);
    const container = $('<div/>').addClass('testcanvas').append(title, vexOutput).get(0);
    $('#vexflow_testoutput').append(container);
    return vexOutput;
  }

  static makeFactory(options: TestOptions, width: number = 450, height: number = 140): Factory {
    const { elementId, backend } = options;
    return new Factory({ renderer: { elementId, backend, width, height } });
  }

  // eslint-disable-next-line
  static runCanvasTest(name: string, testFunc: TestFunction, params: any): void {
    if (VexFlowTests.RUN_CANVAS_TESTS) {
      const helper = null;
      VexFlowTests.runWithParams({ ...CANVAS_TEST_CONFIG, name, testFunc, params, helper });
    }
  }

  // eslint-disable-next-line
  static runSVGTest(name: string, testFunc: TestFunction, params?: any): void {
    if (VexFlowTests.RUN_SVG_TESTS) {
      const helper = null;
      VexFlowTests.runWithParams({ ...SVG_TEST_CONFIG, name, testFunc, params, helper });
    }
  }

  // eslint-disable-next-line
  static runNodeTest(name: string, testFunc: TestFunction, params: any): void {
    if (VexFlowTests.RUN_NODE_TESTS) {
      const helper = VexFlowTests.runNodeTestHelper;
      VexFlowTests.runWithParams({ ...NODE_TEST_CONFIG, name, testFunc, params, helper });
    }
  }

  /**
   * Save the PNG file.
   * @param fontName
   * @param element
   */
  static runNodeTestHelper(fontName: string, element: HTMLElement): void {
    if (Renderer.lastContext !== undefined) {
      const moduleName = sanitizeName(QUnit.current_module);
      const testName = sanitizeName(QUnit.current_test);
      // If we are only testing Bravura, we OMIT the font name from the
      // output image file name, which allows visual diffs against
      // the previous release: version 3.0.9. In the future, if we decide
      // to test all fonts by default, we can remove this check.
      const onlyBravura = NODE_TEST_CONFIG.fontStacks.length === 1 && fontName === 'Bravura';
      const fontInfo = onlyBravura ? '' : `.${fontName}`;
      const fileName = `${VexFlowTests.NODE_IMAGEDIR}/${moduleName}.${testName}${fontInfo}.png`;

      const imageData = (element as HTMLCanvasElement).toDataURL().split(';base64,').pop();
      const imageBuffer = Buffer.from(imageData as string, 'base64');

      VexFlowTests.shims.fs.writeFileSync(fileName, imageBuffer, { encoding: 'base64' });
    }
  }

  /** Run QUnit.test(...) for each font. */
  // eslint-disable-next-line
  static runWithParams({ fontStacks, testFunc, name, params, backend, tagName, testType, helper }: any): void {
    fontStacks.forEach((fontStackName: string) => {
      QUnit.test(name, (assert: Assert) => {
        useTempFontStack(fontStackName);
        const elementId = VexFlowTests.generateTestID(`${testType.toLowerCase()}_` + fontStackName);
        const title = assert.test.module.name + ' › ' + name + ` › ${testType} + ${fontStackName}`;
        const element = VexFlowTests.createTest(elementId, title, tagName);
        const options: TestOptions = { elementId, params, assert, backend };
        const isSVG = backend === Renderer.Backends.SVG;
        const contextBuilder: ContextBuilder = isSVG ? Renderer.getSVGContext : Renderer.getCanvasContext;
        testFunc(options, contextBuilder);
        restoreOriginalFontStack();
        if (helper) helper(fontStackName, element);
      });
    });
  }

  /**
   * @param ctx
   * @param x
   * @param y
   */
  static plotLegendForNoteWidth(ctx: RenderContext, x: number, y: number): void {
    ctx.save();
    ctx.setFont('Arial', 8, '');

    const spacing = 12;
    let lastY = y;

    function legend(color: string, text: string) {
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

/** Currently unused. */
/*
global.almostEqual = (value: number, expectedValue: number, errorMargin: number): boolean => {
  return global.equal(Math.abs(value - expectedValue) < errorMargin, true);
};
*/

/**
 * Used with array.reduce(...) to flatten arrays of arrays in the tests.
 */
// eslint-disable-next-line
const concat = (a: any[], b: any[]): any[] => a.concat(b);

/** Used in KeySignature and ClefKeySignature Tests. */
const MAJOR_KEYS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
const MINOR_KEYS = ['Am', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m'];

// We no longer provide a global.VF in tests.
// Everything can be accessed via Vex.Flow.* and Vex.Flow.Test.* or by importing the class directly.
// eslint-disable-next-line
// @ts-ignore
Flow.Test = VexFlowTests;

export { VexFlowTests, concat, MAJOR_KEYS, MINOR_KEYS };
