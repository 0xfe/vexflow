// [VexFlow](https://vexflow.com/) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// VexFlow Test Support Library

import { Font } from '../src/font';
import { ContextBuilder, Renderer } from '../src/renderer';
import { RenderContext } from '../src/types/common';
import { Assert } from './declarations';

/* eslint-disable */
declare var global: any;
declare var $: any;
declare var QUnit: any;
const VF: any = Vex.Flow;
/* eslint-enable */

export interface TestOptions {
  elementId: string;
  params: any /* eslint-disable-line */;
  assert: Assert;
  backend: number;
}

// Each test case will switch through the available fonts, and then restore the original font when done.
let originalFontStack: Font[];
function useTempFontStack(fontName: string): void {
  originalFontStack = VF.DEFAULT_FONT_STACK;
  VF.DEFAULT_FONT_STACK = VexFlowTests.FONT_STACKS[fontName];
}
function restoreOriginalFontStack(): void {
  VF.DEFAULT_FONT_STACK = originalFontStack;
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

/**
 * When generating PNG images for the visual regression tests,
 * we mock out the QUnit methods (since we don't care about assertions).
 */
function setupQUnitMockObject() {
  // eslint-disable-next-line
  const QUMock: any = {};

  QUMock.assertions = {
    ok: () => true,
    equal: () => true,
    deepEqual: () => true,
    expect: () => true,
    throws: () => true,
    notOk: () => true,
    notEqual: () => true,
    notDeepEqual: () => true,
    strictEqual: () => true,
    notStrictEqual: () => true,
    test: { module: { name: '' } },
  };

  QUMock.module = (name: string): void => {
    QUMock.current_module = name;
  };

  // See: https://api.qunitjs.com/QUnit/test/
  QUMock.test = (name: number, callback: (assert: Assert) => void): void => {
    QUMock.current_test = name;
    QUMock.assertions.test.module.name = name;
    VF.shims.process.stdout.write(' \u001B[0G' + QUMock.current_module + ' :: ' + name + '\u001B[0K');
    callback(QUMock.assertions);
  };

  global.QUnit = QUMock;
  global.test = QUMock.test;
  global.ok = QUMock.assertions.ok;
  global.equal = QUMock.assertions.equal;
  global.deepEqual = QUMock.assertions.deepEqual;
  global.expect = QUMock.assertions.expect;
  global.throws = QUMock.assertions.throws;
  global.notOk = QUMock.assertions.notOk;
  global.notEqual = QUMock.assertions.notEqual;
  global.notDeepEqual = QUMock.assertions.notDeepEqual;
  global.strictEqual = QUMock.assertions.strictEqual;
  global.notStrictEqual = QUMock.assertions.notStrictEqual;
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
    Bravura: [VF.Fonts.Bravura(), VF.Fonts.Gonville(), VF.Fonts.Custom()],
    Gonville: [VF.Fonts.Gonville(), VF.Fonts.Bravura(), VF.Fonts.Custom()],
    Petaluma: [VF.Fonts.Petaluma(), VF.Fonts.Gonville(), VF.Fonts.Custom()],
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

  /**
   * @param options
   * @param width
   * @param height
   * @returns
   */
  static makeFactory(
    options: { elementId: any; backend: any } /* eslint-disable-line */,
    width: number = 450,
    height: number = 140
  ): any /* Factory */ /* eslint-disable-line */ {
    return new VF.Factory({
      renderer: {
        elementId: options.elementId,
        backend: options.backend,
        width: width || 450,
        height: height || 140,
      },
    });
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
    if (VF.Renderer.lastContext !== undefined) {
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

      VF.shims.fs.writeFileSync(fileName, imageBuffer, { encoding: 'base64' });
    }
  }

  // Defined in run.js
  // static run() { ... }

  /** Run QUnit.test(...) for each font. */
  // eslint-disable-next-line
  static runWithParams({ fontStacks, testFunc, name, params, backend, tagName, testType, helper }: any): void {
    fontStacks.forEach((fontStackName: string) => {
      QUnit.test(name, (assert: Assert) => {
        useTempFontStack(fontStackName);
        const elementId = VexFlowTests.generateTestID(`${testType.toLowerCase()}_` + fontStackName);
        const title = assert.test.module.name + ' / ' + name + ` / ${testType} + ${fontStackName}`;
        const element = VexFlowTests.createTest(elementId, title, tagName);
        const options: TestOptions = { elementId, params, assert, backend };
        const isSVG = backend === Renderer.Backends.SVG;
        const contextBuilder: ContextBuilder = isSVG ? VF.Renderer.getSVGContext : VF.Renderer.getCanvasContext;
        testFunc(options, contextBuilder);
        restoreOriginalFontStack();
        if (helper) helper(fontStackName, element);
      });
    });
  }

  static plotNoteWidth = VF.Note.plotMetrics;

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

if (!global.QUnit) {
  setupQUnitMockObject();
}

/** Currently unused. */
/*
global.almostEqual = (value: number, expectedValue: number, errorMargin: number): boolean => {
  return global.equal(Math.abs(value - expectedValue) < errorMargin, true);
};
*/

global.VF = VF;
global.VF.Test = VexFlowTests;

export { VexFlowTests };
