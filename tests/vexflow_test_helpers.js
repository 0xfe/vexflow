/**
 * VexFlow Test Support Library
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

const VF = Vex.Flow;

// When generating PNG images for the visual regression tests,
// we mock out the QUnit methods (since we don't care about assertions).
function setupQUnitMockObject() {
  const QUnit = {};

  QUnit.assertions = {
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

  QUnit.module = (name) => {
    QUnit.current_module = name;
  };

  QUnit.test = (name, func) => {
    QUnit.current_test = name;
    VF.shims.process.stdout.write(' \u001B[0G' + QUnit.current_module + ' :: ' + name + '\u001B[0K');
    func(QUnit.assertions);
  };

  global.QUnit = QUnit;
  global.test = QUnit.test;
  global.ok = QUnit.assertions.ok;
  global.equal = QUnit.assertions.equal;
  global.deepEqual = QUnit.assertions.deepEqual;
  global.expect = QUnit.assertions.expect;
  global.throws = QUnit.assertions.throws;
  global.notOk = QUnit.assertions.notOk;
  global.notEqual = QUnit.assertions.notEqual;
  global.notDeepEqual = QUnit.assertions.notDeepEqual;
  global.strictEqual = QUnit.assertions.strictEqual;
  global.notStrictEqual = QUnit.assertions.notStrictEqual;
}

const VexFlowTests = (function () {
  var Test = {
    // Test Options.
    RUN_CANVAS_TESTS: true,
    RUN_SVG_TESTS: true,
    RUN_NODE_TESTS: false,

    // Where images are stored for NodeJS tests.
    NODE_IMAGEDIR: 'images',

    // Default font properties for tests.
    Font: { size: 10 },

    // Customize this array to test fewer fonts (e.g., ['Bravura', 'Petaluma']).
    FONT_STACKS_TO_TEST: ['Bravura', 'Gonville', 'Petaluma'],

    FONT_STACKS: {
      Bravura: [VF.Fonts.Bravura, VF.Fonts.Gonville, VF.Fonts.Custom],
      Gonville: [VF.Fonts.Gonville, VF.Fonts.Bravura, VF.Fonts.Custom],
      Petaluma: [VF.Fonts.Petaluma, VF.Fonts.Gonville, VF.Fonts.Custom],
    },

    // Returns a unique ID for a test.
    genID: function (prefix) {
      return prefix + VF.Test.genID.ID++;
    },

    genTitle: function (type, assert, name) {
      return assert.test.module.name + ' (' + type + '): ' + name;
    },

    // Run `func` inside a QUnit test for each of the enabled
    // rendering backends.
    runTests: function (name, func, params) {
      if (VF.Test.RUN_CANVAS_TESTS) {
        VF.Test.runCanvasTest(name, func, params);
      }
      if (VF.Test.RUN_SVG_TESTS) {
        VF.Test.runSVGTest(name, func, params);
      }
      if (VF.Test.RUN_NODE_TESTS) {
        VF.Test.runNodeTest(name, func, params);
      }
    },

    // Run `func` inside a QUnit test for each of the enabled
    // rendering backends. These are for interactivity tests, and
    // currently only work with the SVG backend.
    runUITests: function (name, func, params) {
      if (VF.Test.RUN_SVG_TESTS) {
        VF.Test.runSVGTest(name, func, params);
      }
    },

    createTest: function (testId, testName, tagName) {
      var testContainer = $('<div></div>').addClass('testcanvas');
      testContainer.append($('<div></div>').addClass('name').text(testName));
      testContainer.append($(`<${tagName}></${tagName}>`).addClass('vex-tabdiv').attr('id', testId));
      $(VF.Test.testRootSelector).append(testContainer);
    },

    resizeCanvas: function (elementId, width, height) {
      $('#' + elementId).width(width);
      $('#' + elementId).attr('width', width);
      $('#' + elementId).attr('height', height);
    },

    makeFactory: function (options, width, height) {
      return new VF.Factory({
        renderer: {
          elementId: options.elementId,
          backend: options.backend,
          width: width || 450,
          height: height || 140,
        },
      });
    },

    runCanvasTest: function (name, func, params) {
      QUnit.test(name, function (assert) {
        var elementId = VF.Test.genID('canvas_');
        var title = VF.Test.genTitle('Canvas', assert, name);

        VF.Test.createTest(elementId, title, 'canvas');

        var testOptions = {
          backend: VF.Renderer.Backends.CANVAS,
          elementId: elementId,
          params: params,
          assert: assert,
        };

        func(testOptions, VF.Renderer.getCanvasContext);
      });
    },

    runSVGTest: function (name, func, params) {
      if (!VF.Test.RUN_SVG_TESTS) return;

      const testFunc = (fontName) => (assert) => {
        const defaultFontStack = VF.DEFAULT_FONT_STACK;
        VF.DEFAULT_FONT_STACK = VF.Test.FONT_STACKS[fontName];
        var elementId = VF.Test.genID('svg_' + fontName);
        var title = VF.Test.genTitle('SVG ' + fontName, assert, name);

        VF.Test.createTest(elementId, title, 'div');

        var testOptions = {
          elementId: elementId,
          backend: VF.Renderer.Backends.SVG,
          params: params,
          assert: assert,
        };

        func(testOptions, VF.Renderer.getSVGContext);
        VF.DEFAULT_FONT_STACK = defaultFontStack;
      };

      VF.Test.runTestWithFonts(name, testFunc);
    },

    runNodeTest: function (name, func, params) {
      var fs = VF.shims.fs;

      // Allows `name` to be used inside file names.
      function sanitizeName(name) {
        return name.replace(/[^a-zA-Z0-9]/g, '_');
      }

      // Use an arrow function sequence (currying) to handle tests for all three fonts.
      // This is the same approach as seen above in runSVGTest(...).
      const testFunc = (fontName) => (assert) => {
        const defaultFontStack = VF.DEFAULT_FONT_STACK;
        VF.DEFAULT_FONT_STACK = VF.Test.FONT_STACKS[fontName];
        var elementId = VF.Test.genID('nodecanvas_');
        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', elementId);
        document.body.appendChild(canvas);

        var testOptions = {
          elementId: elementId,
          backend: VF.Renderer.Backends.CANVAS,
          params: params,
          assert: assert,
        };

        func(testOptions, VF.Renderer.getCanvasContext);
        VF.DEFAULT_FONT_STACK = defaultFontStack;

        if (VF.Renderer.lastContext !== null) {
          var moduleName = sanitizeName(QUnit.current_module);
          var testName = sanitizeName(QUnit.current_test);
          var fileName;
          if (fontName === 'Bravura' && VF.Test.FONT_STACKS_TO_TEST.length === 1) {
            // If we are only testing Bravura, we do not add the font name
            // to the output image file's name, which allows visual diffs against
            // the previous release: version 3.0.9. In the future, if we decide
            // to test all fonts by default, we can remove this check.
            fileName = `${VF.Test.NODE_IMAGEDIR}/${moduleName}.${testName}.png`;
          } else {
            fileName = `${VF.Test.NODE_IMAGEDIR}/${moduleName}.${testName}.${fontName}.png`;
          }

          var imageData = canvas.toDataURL().split(';base64,').pop();
          var image = Buffer.from(imageData, 'base64');

          fs.writeFileSync(fileName, image, { encoding: 'base64' });
        }
      };

      VF.Test.runTestWithFonts(name, testFunc);
    },

    // Run QUnit.test() for each font that is included in VF.Test.FONT_STACKS_TO_TEST.
    runTestWithFonts: function (name, func) {
      VF.Test.FONT_STACKS_TO_TEST.forEach((fontName) => {
        QUnit.test(name, func(fontName));
      });
    },

    plotNoteWidth: VF.Note.plotMetrics,
    plotLegendForNoteWidth: function (ctx, x, y) {
      ctx.save();
      ctx.setFont('Arial', 8, '');

      var spacing = 12;
      var lastY = y;

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
    },

    almostEqual: function (value, expectedValue, errorMargin) {
      return equal(Math.abs(value - expectedValue) < errorMargin, true);
    },
  };

  Test.genID.ID = 0;
  Test.testRootSelector = '#vexflow_testoutput';

  return Test;
})();

if (!global.QUnit) {
  setupQUnitMockObject();
}

global.VF = VF;
global.VF.Test = VexFlowTests;

export { VexFlowTests };
