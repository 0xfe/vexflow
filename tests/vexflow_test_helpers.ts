// [VexFlow](https://vexflow.com/) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// VexFlow Test Support Library

import { ContextBuilder, Factory, Flow, Font, RenderContext, Renderer } from '../src/index';

import { globalObject } from '../src/util';
import { Assert } from './types/qunit';

// eslint-disable-next-line
declare const $: any;

const global = globalObject();

export interface TestOptions {
  elementId: string;
  params: any /* eslint-disable-line */;
  assert: Assert;
  backend: number;

  // Some tests use this field to pass around the ContextBuilder function.
  contextBuilder?: ContextBuilder;
}

// Each test case will switch through the available fonts, and then restore the original font when done.
let originalFontNames: string[];
function useTempFontStack(fontName: string): void {
  originalFontNames = Flow.getMusicFont();
  Flow.setMusicFont(...VexFlowTests.FONT_STACKS[fontName]);
}
function restoreOriginalFontStack(): void {
  Flow.setMusicFont(...originalFontNames);
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
      html(h?: string) {
        if (!h) {
          return element.innerHTML;
        } else {
          element.innerHTML = h;
          return $element;
        }
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

export type RunOptions = {
  jobs: number;
  job: number;
};

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

interface Test {
  Start(): void;
}

export class VexFlowTests {
  static tests: Test[] = [];

  // Call this at the end of a `tests/xxxx_tests.ts` file to register the module.
  static register(test: Test): void {
    VexFlowTests.tests.push(test);
  }

  static parseJobOptions(runOptions: RunOptions | undefined): RunOptions {
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

  // flow.html calls this to invoke all the tests.
  static run(runOptions: RunOptions | undefined): void {
    const { jobs, job } = VexFlowTests.parseJobOptions(runOptions);
    VexFlowTests.tests.forEach((test, idx: number) => {
      if (jobs === 1 || idx % jobs === job) {
        test.Start();
      }
    });
  }

  // See: generate_png_images.js
  // Provides access to Node JS fs & process.
  // eslint-disable-next-line
  static shims: any;

  static RUN_CANVAS_TESTS = true;
  static RUN_SVG_TESTS = true;
  static RUN_NODE_TESTS = false;

  // Where images are stored for NodeJS tests.
  static NODE_IMAGEDIR: 'images';

  // Default font properties for tests.
  static Font = { size: 10 };

  /**
   * Each font stack is a prioritized list of font names.
   */
  static FONT_STACKS: Record<string, string[]> = {
    Bravura: ['Bravura', 'Gonville', 'Custom'],
    Gonville: ['Gonville', 'Bravura', 'Custom'],
    Petaluma: ['Petaluma', 'Gonville', 'Bravura', 'Custom'],
    Leland: ['Leland', 'Bravura', 'Gonville', 'Custom'],
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

  // eslint-disable-next-line
  static runTextTests(name: string, testFunc: TestFunction, params?: any): void {
    VexFlowTests.runCanvasText(name, testFunc, params);
    VexFlowTests.runSVGText(name, testFunc, params);
  }

  /**
   * Append a <div/> which contains the test case title and rendered output.
   * See flow.html and flow.css.
   * @param elementId
   * @param testTitle
   * @param tagName
   */
  static createTest(elementId: string, testTitle: string, tagName: string, titleId: string = ''): HTMLElement {
    const anchorTestTitle = `<a href="#${titleId}">${testTitle}</a>`;
    const title = $('<div/>').addClass('name').attr('id', titleId).html(anchorTestTitle).get(0);
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
  static runCanvasText(name: string, testFunc: TestFunction, params: any): void {
    if (VexFlowTests.RUN_CANVAS_TESTS) {
      const helper = null;
      VexFlowTests.runWithParams({ ...CANVAS_TEXT_CONFIG, name, testFunc, params, helper });
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
  static runSVGText(name: string, testFunc: TestFunction, params?: any): void {
    if (VexFlowTests.RUN_SVG_TESTS) {
      const helper = null;
      VexFlowTests.runWithParams({ ...SVG_TEXT_CONFIG, name, testFunc, params, helper });
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
    if (name === undefined) {
      throw new Error('Test name is undefined.');
    }
    const testTypeLowerCase = testType.toLowerCase();
    fontStacks.forEach((fontStackName: string) => {
      QUnit.test(name, (assert: Assert) => {
        useTempFontStack(fontStackName);
        const elementId = VexFlowTests.generateTestID(`${testTypeLowerCase}_` + fontStackName);
        const moduleName = assert.test.module.name;
        const title = moduleName + ' › ' + name + ` › ${testType} + ${fontStackName}`;

        // Add an element id for the title div, so that we can scroll directly to a test case.
        // Add a fragment identifier to the url (e.g., #Stave.Multiple_Stave_Barline_Test.Bravura)
        // This titleId will match the name of the PNGs generated by visual regression tests
        // (without the _Current.png or _Reference.png).
        let prefix = '';
        if (testTypeLowerCase === 'canvas') {
          prefix = testTypeLowerCase + '_';
        } else {
          // DO NOT ADD A PREFIX TO SVG TESTS
          // The canvas prefix above is for making sure our element ids are unique,
          // since we have a canvas+bravura test case and a svg+bravura test case
          // that would otherwise have the same titleId.
        }
        const titleId = `${prefix}${sanitizeName(moduleName)}.${sanitizeName(name)}.${fontStackName}`;

        const element = VexFlowTests.createTest(elementId, title, tagName, titleId);
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
    ctx.setFont(Font.SANS_SERIF, 8);

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

/**
 * Used with array.reduce(...) to flatten arrays of arrays in the tests.
 */
// eslint-disable-next-line
export const concat = (a: any[], b: any[]): any[] => a.concat(b);

/** Used in KeySignature and ClefKeySignature Tests. */
export const MAJOR_KEYS = [
  //
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

// VexFlow classes can be accessed via Vex.Flow.* or by directly importing a library class.
// Tests can be accessed via Vex.Flow.Test.* or by directly importing a test class.
// Here we set Vex.Flow.Test = VexFlowTests.
// eslint-disable-next-line
// @ts-ignore
Flow.Test = VexFlowTests;
