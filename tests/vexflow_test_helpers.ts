// [VexFlow](https://vexflow.com/) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// VexFlow Test Support Library

import { RenderContext } from '../src/types/common';
import { Assert } from './declarations';

/* eslint-disable */
declare var global: any;
declare var $: any;
declare var QUnit: any;
const VF: any = Vex.Flow;
/* eslint-enable */

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
  };

  QUMock.module = (name: string): void => {
    QUMock.current_module = name;
  };

  // eslint-disable-next-line
  QUMock.test = (name: number, func: Function): void => {
    QUMock.current_test = name;
    VF.shims.process.stdout.write(' \u001B[0G' + QUMock.current_module + ' :: ' + name + '\u001B[0K');
    func(QUMock.assertions);
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

type TestFunction = (fontName: string) => (assert: Assert) => void;

class VexFlowTests {
  // Test Options.
  static RUN_CANVAS_TESTS = true;
  static RUN_SVG_TESTS = true;
  static RUN_NODE_TESTS = false;

  // Where images are stored for NodeJS tests.
  static NODE_IMAGEDIR: 'images';

  // Default font properties for tests.
  static Font = { size: 10 };

  /** Customize this array to test fewer fonts (e.g., ['Bravura', 'Petaluma']). */
  static FONT_STACKS_TO_TEST = ['Bravura', 'Gonville', 'Petaluma'];

  /**
   *
   */
  // eslint-disable-next-line
  static FONT_STACKS: Record<string, any> = {
    Bravura: [VF.Fonts.Bravura, VF.Fonts.Gonville, VF.Fonts.Custom],
    Gonville: [VF.Fonts.Gonville, VF.Fonts.Bravura, VF.Fonts.Custom],
    Petaluma: [VF.Fonts.Petaluma, VF.Fonts.Gonville, VF.Fonts.Custom],
  };

  private static NEXT_TEST_ID = 0;

  /** Return a unique ID for a test. */
  static generateTestID(prefix: string): string {
    return prefix + '_' + VexFlowTests.NEXT_TEST_ID++;
  }

  /**
   * @param type
   * @param assert
   * @param name
   * @returns a title that will be displayed on flow.html.
   */
  // eslint-disable-next-line
  static generateTestTitle(type: string, assert: Assert, name: string): string {
    return assert.test.module.name + ' (' + type + '): ' + name;
  }

  /**
   * Run `func` inside a QUnit test for each of the enabled rendering backends.
   * @param name
   * @param func
   * @param params
   */
  // eslint-disable-next-line
  static runTests(name: string, func: Function, params?: any): void {
    if (VexFlowTests.RUN_CANVAS_TESTS) {
      VexFlowTests.runCanvasTest(name, func, params);
    }
    if (VexFlowTests.RUN_SVG_TESTS) {
      VexFlowTests.runSVGTest(name, func, params);
    }
    if (VexFlowTests.RUN_NODE_TESTS) {
      VexFlowTests.runNodeTest(name, func, params);
    }
  }

  /**
   * These are for interactivity tests, and currently only work with the SVG backend.
   * See: stavenote_tests.ts.
   * @param name
   * @param func
   * @param params
   */
  // eslint-disable-next-line
  static runUITests(name: string, func: Function, params: any): void {
    if (VexFlowTests.RUN_SVG_TESTS) {
      VexFlowTests.runSVGTest(name, func, params);
    }
  }

  /**
   * Use jQuery to append a <div> which contains the test case.
   * @param testId
   * @param testTitle
   * @param tagName
   */
  static createTest(testId: string, testTitle: string, tagName: string): void {
    const testContainer = $('<div></div>').addClass('testcanvas'); // See flow.css for div.testcanvas
    testContainer.append($('<div></div>').addClass('name').text(testTitle));
    testContainer.append($(`<${tagName}></${tagName}>`).addClass('vex-tabdiv').attr('id', testId));
    $('#vexflow_testoutput').append(testContainer); // See flow.html
  }

  /**
   * Currently unused.
   * @param elementId
   * @param width
   * @param height
   */
  static resizeCanvas(elementId: string, width: number, height: number): void {
    $('#' + elementId).width(width);
    $('#' + elementId).attr('width', width);
    $('#' + elementId).attr('height', height);
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

  /**
   *
   * @param name
   * @param func
   * @param params
   */
  // eslint-disable-next-line
  static runCanvasTest(name: string, func: Function, params: any): void {
    // Set to true if you want to test all fonts on the CANVAS context.
    // By default we only test all fonts on the SVG context.
    const TEST_ALL_FONTS = false;

    const testFunc: TestFunction = (fontName: string) => (assert: Assert) => {
      const defaultFontStack = VF.DEFAULT_FONT_STACK;
      VF.DEFAULT_FONT_STACK = VexFlowTests.FONT_STACKS[fontName];
      const elementId = VexFlowTests.generateTestID('canvas_' + fontName);
      const title = VexFlowTests.generateTestTitle('Canvas ' + fontName, assert, name);

      VexFlowTests.createTest(elementId, title, 'canvas');

      const testOptions = {
        elementId: elementId,
        backend: VF.Renderer.Backends.CANVAS,
        params: params,
        assert: assert,
      };

      func(testOptions, VF.Renderer.getCanvasContext);
      VF.DEFAULT_FONT_STACK = defaultFontStack;
    };

    if (TEST_ALL_FONTS) {
      VexFlowTests.runTestWithFonts(name, testFunc);
    } else {
      QUnit.test(name, testFunc('Bravura'));
    }
  }

  /**
   *
   * @param name
   * @param func
   * @param params
   */
  // eslint-disable-next-line
  static runSVGTest(name: string, func: Function, params?: any): void {
    if (!VexFlowTests.RUN_SVG_TESTS) return;

    const testFunc: TestFunction = (fontName: string) => (assert: Assert) => {
      const defaultFontStack = VF.DEFAULT_FONT_STACK;
      VF.DEFAULT_FONT_STACK = VexFlowTests.FONT_STACKS[fontName];
      const elementId = VexFlowTests.generateTestID('svg_' + fontName);
      const title = VexFlowTests.generateTestTitle('SVG ' + fontName, assert, name);

      VexFlowTests.createTest(elementId, title, 'div');

      const testOptions = {
        elementId: elementId,
        backend: VF.Renderer.Backends.SVG,
        params: params,
        assert: assert,
      };

      func(testOptions, VF.Renderer.getSVGContext);
      VF.DEFAULT_FONT_STACK = defaultFontStack;
    };

    VexFlowTests.runTestWithFonts(name, testFunc);
  }

  /**
   * @param name
   * @param func
   * @param params
   */
  // eslint-disable-next-line
  static runNodeTest(name: string, func: Function, params: any): void {
    const fs = VF.shims.fs;

    // Allow `name` to be used inside file names.
    function sanitizeName(name: string): string {
      return name.replace(/[^a-zA-Z0-9]/g, '_');
    }

    // Use an arrow function sequence (currying) to handle tests for all three fonts.
    // This is the same approach as seen above in runSVGTest(...).
    const testFunc: TestFunction = (fontName: string) => (assert: Assert) => {
      const defaultFontStack = VF.DEFAULT_FONT_STACK;
      VF.DEFAULT_FONT_STACK = VexFlowTests.FONT_STACKS[fontName];
      const elementId = VexFlowTests.generateTestID('nodecanvas_');
      const canvas = document.createElement('canvas');
      canvas.setAttribute('id', elementId);
      document.body.appendChild(canvas);

      const testOptions = {
        elementId: elementId,
        backend: VF.Renderer.Backends.CANVAS,
        params: params,
        assert: assert,
      };

      func(testOptions, VF.Renderer.getCanvasContext);
      VF.DEFAULT_FONT_STACK = defaultFontStack;

      if (VF.Renderer.lastContext !== null) {
        const moduleName = sanitizeName(QUnit.current_module);
        const testName = sanitizeName(QUnit.current_test);
        let fileName;
        if (fontName === 'Bravura' && VexFlowTests.FONT_STACKS_TO_TEST.length === 1) {
          // If we are only testing Bravura, we do not add the font name
          // to the output image file's name, which allows visual diffs against
          // the previous release: version 3.0.9. In the future, if we decide
          // to test all fonts by default, we can remove this check.
          fileName = `${VexFlowTests.NODE_IMAGEDIR}/${moduleName}.${testName}.png`;
        } else {
          fileName = `${VexFlowTests.NODE_IMAGEDIR}/${moduleName}.${testName}.${fontName}.png`;
        }

        const imageData = canvas.toDataURL().split(';base64,').pop();
        const image = Buffer.from(imageData as string, 'base64');

        fs.writeFileSync(fileName, image, { encoding: 'base64' });
      }
    };

    VexFlowTests.runTestWithFonts(name, testFunc);
  }

  /**
   * Run QUnit.test() for each font that is included in VexFlowTests.FONT_STACKS_TO_TEST.
   * @param name
   * @param func
   */
  static runTestWithFonts(name: string, func: TestFunction): void {
    VexFlowTests.FONT_STACKS_TO_TEST.forEach((fontName) => {
      QUnit.test(name, func(fontName));
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
global.almostEqual = (value: number, expectedValue: number, errorMargin: number): boolean => {
  return global.equal(Math.abs(value - expectedValue) < errorMargin, true);
};

global.VF = VF;
global.VF.Test = VexFlowTests;

export { VexFlowTests };
