/**!
 * VexFlow 3.0.9 built on 2020-04-21.
 * Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>
 *
 * http://www.vexflow.com  http://github.com/0xfe/vexflow
 *//**
 * VexFlow Test Support Library
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

/* eslint-disable global-require, import/no-unresolved, import/no-extraneous-dependencies */

/* eslint max-classes-per-file: "off" */

// Mock out the QUnit stuff for generating svg images,
// since we don't really care about the assertions.
if (!window.QUnit) {
  window.QUnit = {};
  QUnit = window.QUnit;

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

  /* eslint-disable */
  QUnit.test = (name, func) => {
    QUnit.current_test = name;
    process.stdout.write(" \u001B[0G" + QUnit.current_module + " :: " + name + "\u001B[0K");
    func(QUnit.assertions);
  };

  test = QUnit.test;
  ok = QUnit.assertions.ok;
  equal = QUnit.assertions.equal;
  deepEqual = QUnit.assertions.deepEqual;
  expect = QUnit.assertions.expect;
  throws = QUnit.assertions.throws;
  notOk = QUnit.assertions.notOk;
  notEqual = QUnit.assertions.notEqual;
  notDeepEqual = QUnit.assertions.notDeepEqual;
  strictEqual = QUnit.assertions.strictEqual;
  notStrictEqual = QUnit.assertions.notStrictEqual;
}

if (typeof require === 'function') {
  Vex = require('./vexflow-debug.js');
}

var VF = Vex.Flow;
VF.Test = (function () {
  var Test = {
    // Test Options.
    RUN_CANVAS_TESTS: true,
    RUN_SVG_TESTS: true,
    RUN_RAPHAEL_TESTS: false,
    RUN_NODE_TESTS: false,

    // Where images are stored for NodeJS tests.
    NODE_IMAGEDIR: 'images',

    // Default font properties for tests.
    Font: { size: 10 },

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
      if (VF.Test.RUN_RAPHAEL_TESTS) {
        VF.Test.runRaphaelTest(name, func, params);
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

    createTestCanvas: function (testId, testName) {
      var testContainer = $('<div></div>').addClass('testcanvas');

      testContainer.append(
        $('<div></div>')
          .addClass('name')
          .text(testName)
      );

      testContainer.append(
        $('<canvas></canvas>')
          .addClass('vex-tabdiv')
          .attr('id', testId)
          .addClass('name')
          .text(name)
      );

      $(VF.Test.testRootSelector).append(testContainer);
    },

    createTestSVG: function (testId, testName) {
      var testContainer = $('<div></div>').addClass('testcanvas');

      testContainer.append(
        $('<div></div>')
          .addClass('name')
          .text(testName)
      );

      testContainer.append(
        $('<div></div>')
          .addClass('vex-tabdiv')
          .attr('id', testId)
      );

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

        VF.Test.createTestCanvas(elementId, title);

        var testOptions = {
          backend: VF.Renderer.Backends.CANVAS,
          elementId: elementId,
          params: params,
          assert: assert,
        };

        func(testOptions, VF.Renderer.getCanvasContext);
      });
    },

    runRaphaelTest: function (name, func, params) {
      QUnit.test(name, function (assert) {
        var elementId = VF.Test.genID('raphael_');
        var title = VF.Test.genTitle('Raphael', assert, name);

        VF.Test.createTestSVG(elementId, title);

        var testOptions = {
          elementId: elementId,
          backend: VF.Renderer.Backends.RAPHAEL,
          params: params,
          assert: assert,
        };

        func(testOptions, VF.Renderer.getRaphaelContext);
      });
    },

    runSVGTest: function (name, func, params) {
      if (!VF.Test.RUN_SVG_TESTS) return;

      const fontStacks = {
        Bravura: [VF.Fonts.Bravura, VF.Fonts.Gonville, VF.Fonts.Custom],
        Gonville: [VF.Fonts.Gonville, VF.Fonts.Bravura, VF.Fonts.Custom],
        Petaluma: [VF.Fonts.Petaluma, VF.Fonts.Gonville, VF.Fonts.Custom],
      }

      const testFunc = (fontName) => (assert) => {
        const defaultFontStack = VF.DEFAULT_FONT_STACK;
        VF.DEFAULT_FONT_STACK = fontStacks[fontName];
        var elementId = VF.Test.genID('svg_'+fontName);
        var title = VF.Test.genTitle('SVG '+fontName, assert, name);

        VF.Test.createTestSVG(elementId, title);

        var testOptions = {
          elementId: elementId,
          backend: VF.Renderer.Backends.SVG,
          params: params,
          assert: assert,
        };

        func(testOptions, VF.Renderer.getSVGContext);
        VF.DEFAULT_FONT_STACK = defaultFontStack;
      }

      QUnit.test(name, testFunc('Bravura'));
      QUnit.test(name, testFunc('Gonville'));
      QUnit.test(name, testFunc('Petaluma'));
    },

    runNodeTest: function (name, func, params) {
      var fs = require('fs');

      // Allows `name` to be used inside file names.
      function sanitizeName(name) {
        return name.replace(/[^a-zA-Z0-9]/g, '_');
      }

      QUnit.test(name, function (assert) {
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

        if (VF.Renderer.lastContext !== null) {
          var moduleName = sanitizeName(QUnit.current_module);
          var testName = sanitizeName(QUnit.current_test);
          var fileName = `${VF.Test.NODE_IMAGEDIR}/${moduleName}.${testName}.png`;

          var imageData = canvas.toDataURL().split(';base64,').pop();
          var image = Buffer.from(imageData, 'base64');

          fs.writeFileSync(fileName, image, { encoding: 'base64' });
        }
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
}());

/**
 * VexFlow - TickContext Mocks
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

/* Mock Tickable */
VF.Test.MockTickable = (function() {
  function MockTickable() {
    this.ignore_ticks = false;
  }
  MockTickable.prototype = {
    init: function() {},
    getX: function() { return this.tickContext.getX(); },
    getIntrinsicTicks: function() { return this.ticks; },
    getTicks: function() { return this.ticks; },
    setTicks: function(t) { this.ticks = new VF.Fraction(t, 1); return this; },
    getMetrics: function() {
      return {
        width: 0,
        glyphWidth: 0,
        notePx: this.width,
        left_shift: 0,
        modLeftPx: 0,
        modRightPx: 0,
        leftDisplacedHeadPx: 0,
        rightDisplacedHeadPx: 0,
      };
    },
    getWidth: function() { return this.width; },
    setWidth: function(w) { this.width = w; return this; },
    setVoice: function(v) { this.voice = v; return this; },
    setStave: function(stave) { this.stave = stave; return this; },
    setTickContext: function(tc) { this.tickContext = tc; return this; },
    setIgnoreTicks: function(ignore_ticks) { this.ignore_ticks = ignore_ticks; return this; },
    shouldIgnoreTicks: function() { return this.ignore_ticks; },
    preFormat: function() {},
  };

  return MockTickable;
})();

/**
 * VexFlow - Accidental Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Accidental = (function() {
  function hasAccidental(note) {
    return note.modifiers.reduce(function(hasAcc, modifier) {
      return hasAcc || modifier.getCategory() === 'accidentals';
    }, false);
  }

  // newAccid factory
  function makeNewAccid(factory) {
    return function(accidType) {
      return factory.Accidental({ type: accidType });
    };
  }

  var Accidental = {
    Start: function() {
      QUnit.module('Accidental');
      Vex.Flow.Test.runTests('Basic', Vex.Flow.Test.Accidental.basic);
      Vex.Flow.Test.runTests('Stem Down', Vex.Flow.Test.Accidental.basicStemDown);
      Vex.Flow.Test.runTests('Cautionary Accidental', Vex.Flow.Test.Accidental.cautionary);
      Vex.Flow.Test.runTests('Accidental Arrangement Special Cases', Vex.Flow.Test.Accidental.specialCases);
      Vex.Flow.Test.runTests('Multi Voice', Vex.Flow.Test.Accidental.multiVoice);
      Vex.Flow.Test.runTests('Microtonal', Vex.Flow.Test.Accidental.microtonal);
      Vex.Flow.Test.runTests('Microtonal (Iranian)', Vex.Flow.Test.Accidental.microtonal_iranian);
      test('Automatic Accidentals - Simple Tests', Vex.Flow.Test.Accidental.autoAccidentalWorking);
      Vex.Flow.Test.runTests('Automatic Accidentals', Vex.Flow.Test.Accidental.automaticAccidentals0);
      Vex.Flow.Test.runTests('Automatic Accidentals - C major scale in Ab', Vex.Flow.Test.Accidental.automaticAccidentals1);
      Vex.Flow.Test.runTests('Automatic Accidentals - No Accidentals Necsesary', Vex.Flow.Test.Accidental.automaticAccidentals2);
      Vex.Flow.Test.runTests('Automatic Accidentals - Multi Voice Inline', Vex.Flow.Test.Accidental.automaticAccidentalsMultiVoiceInline);
      Vex.Flow.Test.runTests('Automatic Accidentals - Multi Voice Offset', Vex.Flow.Test.Accidental.automaticAccidentalsMultiVoiceOffset);
      Vex.Flow.Test.runTests('Factory API', Vex.Flow.Test.Accidental.factoryAPI);
    },

    basic: function(options) {
      var vf = VF.Test.makeFactory(options, 700, 240);
      var newAccid = makeNewAccid(vf);
      vf.Stave({ x: 10, y: 10, width: 550 });

      var notes = [
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
          .addAccidental(0, newAccid('b'))
          .addAccidental(1, newAccid('#')),

        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
          .addAccidental(0, newAccid('##'))
          .addAccidental(1, newAccid('n'))
          .addAccidental(2, newAccid('bb'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('#'))
          .addAccidental(5, newAccid('n'))
          .addAccidental(6, newAccid('bb')),

        vf.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
          .addAccidental(0, newAccid('n'))
          .addAccidental(1, newAccid('#'))
          .addAccidental(2, newAccid('#'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('bb'))
          .addAccidental(5, newAccid('##'))
          .addAccidental(6, newAccid('#')),

        vf.StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
          .addAccidental(0, newAccid('#'))
          .addAccidental(1, newAccid('##').setAsCautionary())
          .addAccidental(2, newAccid('#').setAsCautionary())
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('bb').setAsCautionary())
          .addAccidental(5, newAccid('b').setAsCautionary()),
      ];

      VF.Formatter.SimpleFormat(notes, 10, { paddingBetween: 45 });

      notes.forEach(function(note, index) {
        Vex.Flow.Test.plotNoteWidth(vf.getContext(), note, 140);
        ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
        note.getAccidentals().forEach(function(accid, index) {
          ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
      });

      vf.draw();

      Vex.Flow.Test.plotLegendForNoteWidth(vf.getContext(), 480, 140);

      ok(true, 'Full Accidental');
    },

    cautionary: function(options) {
      var vf = VF.Test.makeFactory(options, 800, 240);
      var stave = vf.Stave({ x: 0, y: 10, width: 780 });
      var score = vf.EasyScore();

      var accids = Object
        .keys(VF.accidentalCodes.accidentals)
        .filter(function(accid) { return accid !== '{' && accid !== '}'; });

      var notes = accids
        .map(function(accid) {
          return vf
            .StaveNote({ keys: ['a/4'], duration: '4', stem_direction: VF.Stem.UP })
            .addAccidental(0, vf.Accidental({ type: accid }));
        });

      var voice = score.voice(notes, { time: accids.length + '/4' });

      voice
        .getTickables()
        .forEach(function(tickable) {
          tickable.modifiers
            .filter(function(modifier) {
              return modifier.getAttribute('type') === 'Accidental';
            })
            .forEach(function(accid) {
              accid.setAsCautionary();
            });
        });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Must successfully render cautionary accidentals');
    },

    specialCases: function(options) {
      var vf = VF.Test.makeFactory(options, 700, 240);
      var newAccid = makeNewAccid(vf);
      vf.Stave({ x: 10, y: 10, width: 550 });

      var notes = [
        vf.StaveNote({ keys: ['f/4', 'd/5'], duration: '1' })
          .addAccidental(0, newAccid('#'))
          .addAccidental(1, newAccid('b')),

        vf.StaveNote({ keys: ['c/4', 'g/4'], duration: '2' })
          .addAccidental(0, newAccid('##'))
          .addAccidental(1, newAccid('##')),

        vf.StaveNote({ keys: ['b/3', 'd/4', 'f/4'], duration: '16' })
          .addAccidental(0, newAccid('#'))
          .addAccidental(1, newAccid('#'))
          .addAccidental(2, newAccid('##')),

        vf.StaveNote({ keys: ['g/4', 'a/4', 'c/5', 'e/5'], duration: '16' })
          .addAccidental(0, newAccid('b'))
          .addAccidental(1, newAccid('b'))
          .addAccidental(3, newAccid('n')),

        vf.StaveNote({ keys: ['e/4', 'g/4', 'b/4', 'c/5'], duration: '4' })
          .addAccidental(0, newAccid('b').setAsCautionary())
          .addAccidental(1, newAccid('b').setAsCautionary())
          .addAccidental(2, newAccid('bb'))
          .addAccidental(3, newAccid('b')),

        vf.StaveNote({ keys: ['b/3', 'e/4', 'a/4', 'd/5', 'g/5'], duration: '8' })
          .addAccidental(0, newAccid('bb'))
          .addAccidental(1, newAccid('b').setAsCautionary())
          .addAccidental(2, newAccid('n').setAsCautionary())
          .addAccidental(3, newAccid('#'))
          .addAccidental(4, newAccid('n').setAsCautionary()),
      ];

      VF.Formatter.SimpleFormat(notes, 0, { paddingBetween: 20 });

      notes.forEach(function(note, index) {
        Vex.Flow.Test.plotNoteWidth(vf.getContext(), note, 140);
        ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
        note.getAccidentals().forEach(function(accid, index) {
          ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
      });

      vf.draw();

      Vex.Flow.Test.plotLegendForNoteWidth(vf.getContext(), 480, 140);

      ok(true, 'Full Accidental');
    },

    basicStemDown: function(options) {
      var vf = VF.Test.makeFactory(options, 700, 240);
      var newAccid = makeNewAccid(vf);
      vf.Stave({ x: 10, y: 10, width: 550 });

      var notes = [
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w', stem_direction: -1 })
          .addAccidental(0, newAccid('b'))
          .addAccidental(1, newAccid('#')),

        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2', stem_direction: -1 })
          .addAccidental(0, newAccid('##'))
          .addAccidental(1, newAccid('n'))
          .addAccidental(2, newAccid('bb'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('#'))
          .addAccidental(5, newAccid('n'))
          .addAccidental(6, newAccid('bb')),

        vf.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16', stem_direction: -1 })
          .addAccidental(0, newAccid('n'))
          .addAccidental(1, newAccid('#'))
          .addAccidental(2, newAccid('#'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('bb'))
          .addAccidental(5, newAccid('##'))
          .addAccidental(6, newAccid('#')),
      ];

      VF.Formatter.SimpleFormat(notes, 0, { paddingBetween: 30 });

      notes.forEach(function(note, index) {
        Vex.Flow.Test.plotNoteWidth(vf.getContext(), note, 140);
        ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
        note.getAccidentals().forEach(function(accid, index) {
          ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
      });

      vf.draw();

      Vex.Flow.Test.plotLegendForNoteWidth(vf.getContext(), 480, 140);

      ok(true, 'Full Accidental');
    },

    showNotes: function(note1, note2, stave, ctx, x) {
      var modifierContext = new Vex.Flow.ModifierContext();
      note1.addToModifierContext(modifierContext);
      note2.addToModifierContext(modifierContext);

      new VF.TickContext()
        .addTickable(note1)
        .addTickable(note2)
        .preFormat()
        .setX(x);

      note1.setContext(ctx).draw();
      note2.setContext(ctx).draw();

      Vex.Flow.Test.plotNoteWidth(ctx, note1, 180);
      Vex.Flow.Test.plotNoteWidth(ctx, note2, 15);
    },

    multiVoice: function(options) {
      var vf = VF.Test.makeFactory(options, 460, 250);
      var newAccid = makeNewAccid(vf);
      var stave = vf.Stave({ x: 10, y: 45, width: 420 });
      var ctx = vf.getContext();

      stave.draw();

      var note1 = vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '2', stem_direction: -1 })
        .addAccidental(0, newAccid('b'))
        .addAccidental(1, newAccid('n'))
        .addAccidental(2, newAccid('#'))
        .setStave(stave);

      var note2 = vf.StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '2', stem_direction: 1 })
        .addAccidental(0, newAccid('b'))
        .addAccidental(1, newAccid('bb'))
        .addAccidental(2, newAccid('##'))
        .setStave(stave);

      Vex.Flow.Test.Accidental.showNotes(note1, note2, stave, ctx, 60);

      note1 = vf.StaveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: '2', stem_direction: -1 })
        .addAccidental(0, newAccid('b'))
        .addAccidental(1, newAccid('n'))
        .addAccidental(2, newAccid('#'))
        .setStave(stave);

      note2 = vf.StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
        .addAccidental(0, newAccid('b'))
        .setStave(stave);

      Vex.Flow.Test.Accidental.showNotes(note1, note2, stave, ctx, 150);

      note1 = vf.StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '2', stem_direction: -1 })
        .addAccidental(0, newAccid('b'))
        .addAccidental(1, newAccid('n'))
        .addAccidental(2, newAccid('#'))
        .setStave(stave);

      note2 = vf.StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
        .addAccidental(0, newAccid('b'))
        .setStave(stave);

      Vex.Flow.Test.Accidental.showNotes(note1, note2, stave, ctx, 250);
      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 350, 150);


      ok(true, 'Full Accidental');
    },

    microtonal: function(options) {
      var assert = options.assert;
      var vf = VF.Test.makeFactory(options, 700, 240);
      var newAccid = makeNewAccid(vf);
      var ctx = vf.getContext();
      vf.Stave({ x: 10, y: 10, width: 650 });

      var notes = [
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
          .addAccidental(0, newAccid('db'))
          .addAccidental(1, newAccid('d')),

        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
          .addAccidental(0, newAccid('bbs'))
          .addAccidental(1, newAccid('++'))
          .addAccidental(2, newAccid('+'))
          .addAccidental(3, newAccid('d'))
          .addAccidental(4, newAccid('db'))
          .addAccidental(5, newAccid('+'))
          .addAccidental(6, newAccid('##')),

        vf.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
          .addAccidental(0, newAccid('++'))
          .addAccidental(1, newAccid('bbs'))
          .addAccidental(2, newAccid('+'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('db'))
          .addAccidental(5, newAccid('##'))
          .addAccidental(6, newAccid('#')),

        vf.StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
          .addAccidental(0, newAccid('#'))
          .addAccidental(1, newAccid('db').setAsCautionary())
          .addAccidental(2, newAccid('bbs').setAsCautionary())
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('++').setAsCautionary())
          .addAccidental(5, newAccid('d').setAsCautionary()),

        vf.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'd/5', 'g/5'], duration: '16' })
          .addAccidental(0, newAccid('++-'))
          .addAccidental(1, newAccid('+-'))
          .addAccidental(2, newAccid('bs'))
          .addAccidental(3, newAccid('bss'))
          .addAccidental(4, newAccid('afhf'))
          .addAccidental(5, newAccid('ashs')),
      ];

      VF.Formatter.SimpleFormat(notes, 0, { paddingBetween: 35 });

      notes.forEach(function(note, index) {
        Vex.Flow.Test.plotNoteWidth(vf.getContext(), note, 140);
        assert.ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
        note.getAccidentals().forEach(function(accid, index) {
          assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
      });

      vf.draw();

      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 580, 140);
      ok(true, 'Microtonal Accidental');
    },

    microtonal_iranian: function(options) {
      var assert = options.assert;
      var vf = VF.Test.makeFactory(options, 700, 240);
      var newAccid = makeNewAccid(vf);
      var ctx = vf.getContext();
      vf.Stave({ x: 10, y: 10, width: 650 });

      var notes = [
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
          .addAccidental(0, newAccid('k'))
          .addAccidental(1, newAccid('o')),

        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
          .addAccidental(0, newAccid('b'))
          .addAccidental(1, newAccid('k'))
          .addAccidental(2, newAccid('n'))
          .addAccidental(3, newAccid('o'))
          .addAccidental(4, newAccid('#'))
          .addAccidental(5, newAccid('bb'))
          .addAccidental(6, newAccid('##')),

        vf.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
          .addAccidental(0, newAccid('o'))
          .addAccidental(1, newAccid('k'))
          .addAccidental(2, newAccid('n'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('bb'))
          .addAccidental(5, newAccid('##'))
          .addAccidental(6, newAccid('#')),

        vf.StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
          .addAccidental(0, newAccid('#'))
          .addAccidental(1, newAccid('o').setAsCautionary())
          .addAccidental(2, newAccid('n').setAsCautionary())
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('k').setAsCautionary()),

        vf.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4'], duration: '16' })
          .addAccidental(0, newAccid('k'))
          .addAccidental(1, newAccid('k'))
          .addAccidental(2, newAccid('k'))
          .addAccidental(3, newAccid('k')),
      ];

      VF.Formatter.SimpleFormat(notes, 0, { paddingBetween: 35 });

      notes.forEach(function(note, index) {
        Vex.Flow.Test.plotNoteWidth(vf.getContext(), note, 140);
        assert.ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
        note.getAccidentals().forEach(function(accid, index) {
          assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
      });

      vf.draw();

      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 580, 140);
      ok(true, 'Microtonal Accidental (Iranian)');
    },

    automaticAccidentals0: function(options) {
      var vf = VF.Test.makeFactory(options, 700, 200);
      var stave = vf.Stave();

      const notes = [
        { keys: ['c/4', 'c/5'], duration: '4' },
        { keys: ['c#/4', 'c#/5'], duration: '4' },
        { keys: ['c#/4', 'c#/5'], duration: '4' },
        { keys: ['c##/4', 'c##/5'], duration: '4' },
        { keys: ['c##/4', 'c##/5'], duration: '4' },
        { keys: ['c/4', 'c/5'], duration: '4' },
        { keys: ['cn/4', 'cn/5'], duration: '4' },
        { keys: ['cbb/4', 'cbb/5'], duration: '4' },
        { keys: ['cbb/4', 'cbb/5'], duration: '4' },
        { keys: ['cb/4', 'cb/5'], duration: '4' },
        { keys: ['cb/4', 'cb/5'], duration: '4' },
        { keys: ['c/4', 'c/5'], duration: '4' },
      ].map(vf.StaveNote.bind(vf));

      const gracenotes = [
        { keys: ['d#/4'], duration: '16', slash: true },
      ].map(vf.GraceNote.bind(vf));
      notes[0].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes }).beamNotes());

      const voice = vf.Voice()
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickable(new Vex.Flow.TimeSigNote('12/4').setStave(stave))
        .addTickables(notes);

      Vex.Flow.Accidental.applyAccidentals([voice], 'C');

      new Vex.Flow.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    automaticAccidentals1: function(options) {
      var vf = VF.Test.makeFactory(options, 700, 150);
      var stave = vf.Stave().addKeySignature('Ab');

      var notes = [
        { keys: ['c/4'], duration: '4' },
        { keys: ['d/4'], duration: '4' },
        { keys: ['e/4'], duration: '4' },
        { keys: ['f/4'], duration: '4' },
        { keys: ['g/4'], duration: '4' },
        { keys: ['a/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['c/5'], duration: '4' },
      ].map(vf.StaveNote.bind(vf));

      var voice = vf.Voice()
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes);

      Vex.Flow.Accidental.applyAccidentals([voice], 'Ab');

      new Vex.Flow.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    automaticAccidentals2: function(options) {
      var vf = VF.Test.makeFactory(options, 700, 150);
      var stave = vf.Stave().addKeySignature('A');

      var notes = [
        { keys: ['a/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['c#/5'], duration: '4' },
        { keys: ['d/5'], duration: '4' },
        { keys: ['e/5'], duration: '4' },
        { keys: ['f#/5'], duration: '4' },
        { keys: ['g#/5'], duration: '4' },
        { keys: ['a/5'], duration: '4' },
      ].map(vf.StaveNote.bind(vf));

      var voice = vf.Voice()
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes);

      Vex.Flow.Accidental.applyAccidentals([voice], 'A');

      new Vex.Flow.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    automaticAccidentalsMultiVoiceInline: function(options) {
      var vf = VF.Test.makeFactory(options, 700, 150);
      var stave = vf.Stave().addKeySignature('Ab');

      var notes0 = [
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['d/4'], duration: '4', stem_direction: -1 },
        { keys: ['e/4'], duration: '4', stem_direction: -1 },
        { keys: ['f/4'], duration: '4', stem_direction: -1 },
        { keys: ['g/4'], duration: '4', stem_direction: -1 },
        { keys: ['a/4'], duration: '4', stem_direction: -1 },
        { keys: ['b/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
      ].map(vf.StaveNote.bind(vf));

      var notes1 = [
        { keys: ['c/5'], duration: '4' },
        { keys: ['d/5'], duration: '4' },
        { keys: ['e/5'], duration: '4' },
        { keys: ['f/5'], duration: '4' },
        { keys: ['g/5'], duration: '4' },
        { keys: ['a/5'], duration: '4' },
        { keys: ['b/5'], duration: '4' },
        { keys: ['c/6'], duration: '4' },
      ].map(vf.StaveNote.bind(vf));

      var voice0 = vf.Voice()
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes0);

      var voice1 = vf.Voice()
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes1);

      // Ab Major
      Vex.Flow.Accidental.applyAccidentals([voice0, voice1], 'Ab');

      equal(hasAccidental(notes0[0]), false);
      equal(hasAccidental(notes0[1]), true);
      equal(hasAccidental(notes0[2]), true);
      equal(hasAccidental(notes0[3]), false);
      equal(hasAccidental(notes0[4]), false);
      equal(hasAccidental(notes0[5]), true);
      equal(hasAccidental(notes0[6]), true);
      equal(hasAccidental(notes0[7]), false);

      equal(hasAccidental(notes1[0]), false);
      equal(hasAccidental(notes1[1]), true);
      equal(hasAccidental(notes1[2]), true);
      equal(hasAccidental(notes1[3]), false);
      equal(hasAccidental(notes1[4]), false);
      equal(hasAccidental(notes1[5]), true);
      equal(hasAccidental(notes1[6]), true);
      equal(hasAccidental(notes1[7]), false);

      new Vex.Flow.Formatter()
        .joinVoices([voice0, voice1])
        .formatToStave([voice0, voice1], stave);

      vf.draw();

      ok(true);
    },

    automaticAccidentalsMultiVoiceOffset: function(options) {
      var vf = VF.Test.makeFactory(options, 700, 150);
      var stave = vf.Stave().addKeySignature('Cb');

      var notes0 = [
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['d/4'], duration: '4', stem_direction: -1 },
        { keys: ['e/4'], duration: '4', stem_direction: -1 },
        { keys: ['f/4'], duration: '4', stem_direction: -1 },
        { keys: ['g/4'], duration: '4', stem_direction: -1 },
        { keys: ['a/4'], duration: '4', stem_direction: -1 },
        { keys: ['b/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
      ].map(vf.StaveNote.bind(vf));

      var notes1 = [
        { keys: ['c/5'], duration: '8' },
        { keys: ['c/5'], duration: '4' },
        { keys: ['d/5'], duration: '4' },
        { keys: ['e/5'], duration: '4' },
        { keys: ['f/5'], duration: '4' },
        { keys: ['g/5'], duration: '4' },
        { keys: ['a/5'], duration: '4' },
        { keys: ['b/5'], duration: '4' },
        { keys: ['c/6'], duration: '4' },
      ].map(vf.StaveNote.bind(vf));

      var voice0 = vf.Voice()
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes0);

      var voice1 = vf.Voice()
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes1);

      // Cb Major (All flats)
      Vex.Flow.Accidental.applyAccidentals([voice0, voice1], 'Cb');

      equal(hasAccidental(notes0[0]), true);
      equal(hasAccidental(notes0[1]), true);
      equal(hasAccidental(notes0[2]), true);
      equal(hasAccidental(notes0[3]), true);
      equal(hasAccidental(notes0[4]), true);
      equal(hasAccidental(notes0[5]), true);
      equal(hasAccidental(notes0[6]), true);
      equal(hasAccidental(notes0[7]), false, 'Natural Remembered');

      equal(hasAccidental(notes1[0]), true);
      equal(hasAccidental(notes1[1]), false);
      equal(hasAccidental(notes1[2]), false);
      equal(hasAccidental(notes1[3]), false);
      equal(hasAccidental(notes1[4]), false);
      equal(hasAccidental(notes1[5]), false);
      equal(hasAccidental(notes1[6]), false);
      equal(hasAccidental(notes1[7]), false);

      new Vex.Flow.Formatter()
        .joinVoices([voice0, voice1])
        .formatToStave([voice0, voice1], stave);

      vf.draw();

      ok(true);
    },

    autoAccidentalWorking: function() {
      function makeNote(noteStruct) { return new VF.StaveNote(noteStruct); }

      var notes = [
        { keys: ['bb/4'], duration: '4' },
        { keys: ['bb/4'], duration: '4' },
        { keys: ['g#/4'], duration: '4' },
        { keys: ['g/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['a#/4'], duration: '4' },
        { keys: ['g#/4'], duration: '4' },
      ].map(makeNote);

      var voice = new VF.Voice()
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes);

      // F Major (Bb)
      Vex.Flow.Accidental.applyAccidentals([voice], 'F');

      equal(hasAccidental(notes[0]), false, 'No flat because of key signature');
      equal(hasAccidental(notes[1]), false, 'No flat because of key signature');
      equal(hasAccidental(notes[2]), true, 'Added a sharp');
      equal(hasAccidental(notes[3]), true, 'Back to natural');
      equal(hasAccidental(notes[4]), true, 'Back to natural');
      equal(hasAccidental(notes[5]), false, 'Natural remembered');
      equal(hasAccidental(notes[6]), true, 'Added sharp');
      equal(hasAccidental(notes[7]), true, 'Added sharp');

      notes = [
        { keys: ['e#/4'], duration: '4' },
        { keys: ['cb/4'], duration: '4' },
        { keys: ['fb/4'], duration: '4' },
        { keys: ['b#/4'], duration: '4' },
        { keys: ['b#/4'], duration: '4' },
        { keys: ['cb/5'], duration: '4' },
        { keys: ['fb/5'], duration: '4' },
        { keys: ['e#/4'], duration: '4' },
      ].map(makeNote);

      voice = new VF.Voice()
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes);

      // A Major (F#,G#,C#)
      Vex.Flow.Accidental.applyAccidentals([voice], 'A');

      equal(hasAccidental(notes[0]), true, 'Added sharp');
      equal(hasAccidental(notes[1]), true, 'Added flat');
      equal(hasAccidental(notes[2]), true, 'Added flat');
      equal(hasAccidental(notes[3]), true, 'Added sharp');
      equal(hasAccidental(notes[4]), false, 'Sharp remembered');
      equal(hasAccidental(notes[5]), false, 'Flat remembered');
      equal(hasAccidental(notes[6]), false, 'Flat remembered');
      equal(hasAccidental(notes[7]), false, 'sharp remembered');

      notes = [
        { keys: ['c/4'], duration: '4' },
        { keys: ['cb/4'], duration: '4' },
        { keys: ['cb/4'], duration: '4' },
        { keys: ['c#/4'], duration: '4' },
        { keys: ['c#/4'], duration: '4' },
        { keys: ['cbb/4'], duration: '4' },
        { keys: ['cbb/4'], duration: '4' },
        { keys: ['c##/4'], duration: '4' },
        { keys: ['c##/4'], duration: '4' },
        { keys: ['c/4'], duration: '4' },
        { keys: ['c/4'], duration: '4' },
      ].map(makeNote);

      voice = new VF.Voice()
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickables(notes);

      // C Major (no sharps/flats)
      Vex.Flow.Accidental.applyAccidentals([voice], 'C');

      equal(hasAccidental(notes[0]), false, 'No accidental');
      equal(hasAccidental(notes[1]), true, 'Added flat');
      equal(hasAccidental(notes[2]), false, 'Flat remembered');
      equal(hasAccidental(notes[3]), true, 'Sharp added');
      equal(hasAccidental(notes[4]), false, 'Sharp remembered');
      equal(hasAccidental(notes[5]), true, 'Added doubled flat');
      equal(hasAccidental(notes[6]), false, 'Double flat remembered');
      equal(hasAccidental(notes[7]), true, 'Added double sharp');
      equal(hasAccidental(notes[8]), false, 'Double sharp rememberd');
      equal(hasAccidental(notes[9]), true, 'Added natural');
      equal(hasAccidental(notes[10]), false, 'Natural remembered');
    },

    factoryAPI: function(options) {
      var assert = options.assert;
      var vf = VF.Test.makeFactory(options, 700, 240);
      vf.Stave({ x: 10, y: 10, width: 550 });

      function newAcc(type) { return vf.Accidental({ type: type }); }

      var notes = [
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' })
          .addAccidental(0, newAcc('b'))
          .addAccidental(1, newAcc('#')),

        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: 'h' })
          .addAccidental(0, newAcc('##'))
          .addAccidental(1, newAcc('n'))
          .addAccidental(2, newAcc('bb'))
          .addAccidental(3, newAcc('b'))
          .addAccidental(4, newAcc('#'))
          .addAccidental(5, newAcc('n'))
          .addAccidental(6, newAcc('bb')),

        vf.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
          .addAccidental(0, newAcc('n'))
          .addAccidental(1, newAcc('#'))
          .addAccidental(2, newAcc('#'))
          .addAccidental(3, newAcc('b'))
          .addAccidental(4, newAcc('bb'))
          .addAccidental(5, newAcc('##'))
          .addAccidental(6, newAcc('#')),

        vf.StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: 'w' })
          .addAccidental(0, newAcc('#'))
          .addAccidental(1, newAcc('##').setAsCautionary())
          .addAccidental(2, newAcc('#').setAsCautionary())
          .addAccidental(3, newAcc('b'))
          .addAccidental(4, newAcc('bb').setAsCautionary())
          .addAccidental(5, newAcc('b').setAsCautionary()),
      ];

      VF.Formatter.SimpleFormat(notes);

      notes.forEach(function(n, i) {
        assert.ok(n.getAccidentals().length > 0, 'Note ' + i + ' has accidentals');
        n.getAccidentals().forEach(function(accid, i) {
          assert.ok(accid.getWidth() > 0, 'Accidental ' + i + ' has set width');
        });
      });

      vf.draw();
      assert.ok(true, 'Factory API');
    },
  };

  return Accidental;
})();

/**
 * VexFlow - Annotation Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Annotation = (function() {
  var runTests = VF.Test.runTests;
  var Annotation = {
    Start: function() {
      QUnit.module('Annotation');
      runTests('Simple Annotation', Annotation.simple);
      runTests('Standard Notation Annotation', Annotation.standard);
      runTests('Harmonics', Annotation.harmonic);
      runTests('Fingerpicking', Annotation.picking);
      runTests('Bottom Annotation', Annotation.bottom);
      runTests('Bottom Annotations with Beams', Annotation.bottomWithBeam);
      runTests('Test Justification Annotation Stem Up', Annotation.justificationStemUp);
      runTests('Test Justification Annotation Stem Down', Annotation.justificationStemDown);
      runTests('TabNote Annotations', Annotation.tabNotes);
    },

    simple: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.font = ' 10pt Arial';
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }
      function newAnnotation(text) { return new VF.Annotation(text); }

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 10 }, { str: 4, fret: 9 }], duration: 'h',
        })
          .addModifier(newAnnotation('T'), 0),
        newNote({
          positions: [{ str: 2, fret: 10 }], duration: 'h',
        })
          .addModifier(newAnnotation('T'), 0)
          .addModifier(newBend('Full'), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, 'Simple Annotation');
    },

    standard: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      var stave = new VF.Stave(10, 10, 450)
        .addClef('treble').setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAnnotation(text) {
        return (new VF.Annotation(text)).setFont('Times',
          VF.Test.Font.size, 'italic');
      }

      var notes = [
        newNote({ keys: ['c/4', 'e/4'], duration: 'h' })
          .addAnnotation(0, newAnnotation('quiet')),
        newNote({ keys: ['c/4', 'e/4', 'c/5'], duration: 'h' })
          .addAnnotation(2, newAnnotation('Allegro')),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, 'Standard Notation Annotation');
    },

    harmonic: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.font = ' 10pt Arial';
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newAnnotation(text) { return new VF.Annotation(text); }

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 12 }, { str: 3, fret: 12 }], duration: 'h',
        })
          .addModifier(newAnnotation('Harm.'), 0),
        newNote({
          positions: [{ str: 2, fret: 9 }], duration: 'h',
        })
          .addModifier(newAnnotation('(8va)').setFont('Times',
            VF.Test.Font.size, 'italic'), 0)
          .addModifier(newAnnotation('A.H.'), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, 'Simple Annotation');
    },

    picking: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5); ctx.setFillStyle('#221'); ctx.setStrokeStyle('#221');
      ctx.setFont('Arial', VF.Test.Font.size, '');
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newAnnotation(text) {
        return new VF.Annotation(text)
          .setFont('Times', VF.Test.Font.size, 'italic');
      }

      var notes = [
        newNote({
          positions: [
            { str: 1, fret: 0 },
            { str: 2, fret: 1 },
            { str: 3, fret: 2 },
            { str: 4, fret: 2 },
            { str: 5, fret: 0 },
          ], duration: 'h',
        })
          .addModifier(new VF.Vibrato().setVibratoWidth(40)),
        newNote({
          positions: [{ str: 6, fret: 9 }], duration: '8',
        })
          .addModifier(newAnnotation('p'), 0),
        newNote({
          positions: [{ str: 3, fret: 9 }], duration: '8',
        })
          .addModifier(newAnnotation('i'), 0),
        newNote({
          positions: [{ str: 2, fret: 9 }], duration: '8',
        })
          .addModifier(newAnnotation('m'), 0),
        newNote({
          positions: [{ str: 1, fret: 9 }], duration: '8',
        })
          .addModifier(newAnnotation('a'), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, 'Fingerpicking');
    },

    bottom: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      var stave = new VF.Stave(10, 10, 300)
        .addClef('treble').setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAnnotation(text) {
        return (
          new VF.Annotation(text))
          .setFont('Times', VF.Test.Font.size)
          .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
      }

      var notes = [
        newNote({ keys: ['f/4'], duration: 'w' })
          .addAnnotation(0, newAnnotation('F')),
        newNote({ keys: ['a/4'], duration: 'w' })
          .addAnnotation(0, newAnnotation('A')),
        newNote({ keys: ['c/5'], duration: 'w' })
          .addAnnotation(0, newAnnotation('C')),
        newNote({ keys: ['e/5'], duration: 'w' })
          .addAnnotation(0, newAnnotation('E')),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 100);
      ok(true, 'Bottom Annotation');
    },

    bottomWithBeam: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      var stave = new VF.Stave(10, 10, 300)
        .addClef('treble').setContext(ctx).draw();

      // Create some notes
      var notes = [
        new VF.StaveNote({ keys: ['a/3'], duration: '8' })
          .addModifier(0, new VF.Annotation('good')
            .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)),

        new VF.StaveNote({ keys: ['g/3'], duration: '8' })
          .addModifier(0, new VF.Annotation('even')
            .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)),

        new VF.StaveNote({ keys: ['c/4'], duration: '8' })
          .addModifier(0, new VF.Annotation('under')
            .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)),

        new VF.StaveNote({ keys: ['d/4'], duration: '8' })
          .addModifier(0, new VF.Annotation('beam')
            .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)),
      ];

      var beam = new VF.Beam(notes.slice(1));

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      beam.setContext(ctx).draw();
      ok(true, 'Bottom Annotation with Beams');
    },

    justificationStemUp: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 650, 950);
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAnnotation(text, hJustifcation, vJustifcation) {
        return (
          new VF.Annotation(text))
          .setFont('Arial', VF.Test.Font.size)
          .setJustification(hJustifcation)
          .setVerticalJustification(vJustifcation);
      }

      for (var v = 1; v <= 4; ++v) {
        var stave = new VF.Stave(10, (v - 1) * 150 + 40, 400)
          .addClef('treble').setContext(ctx).draw();

        var notes = [];

        notes.push(newNote({ keys: ['c/3'], duration: 'q' }).addAnnotation(0, newAnnotation('Text', 1, v)));
        notes.push(newNote({ keys: ['c/4'], duration: 'q' }).addAnnotation(0, newAnnotation('Text', 2, v)));
        notes.push(newNote({ keys: ['c/5'], duration: 'q' }).addAnnotation(0, newAnnotation('Text', 3, v)));
        notes.push(newNote({ keys: ['c/6'], duration: 'q' }).addAnnotation(0, newAnnotation('Text', 4, v)));

        VF.Formatter.FormatAndDraw(ctx, stave, notes, 100);
      }

      ok(true, 'Test Justification Annotation');
    },

    justificationStemDown: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 650, 1000);
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAnnotation(text, hJustifcation, vJustifcation) {
        return (
          new VF.Annotation(text))
          .setFont('Arial', VF.Test.Font.size)
          .setJustification(hJustifcation)
          .setVerticalJustification(vJustifcation);
      }

      for (var v = 1; v <= 4; ++v) {
        var stave = new VF.Stave(10, (v - 1) * 150 + 40, 400)
          .addClef('treble').setContext(ctx).draw();

        var notes = [];

        notes.push(newNote({ keys: ['c/3'], duration: 'q', stem_direction: -1 }).addAnnotation(0, newAnnotation('Text', 1, v)));
        notes.push(newNote({ keys: ['c/4'], duration: 'q', stem_direction: -1 }).addAnnotation(0, newAnnotation('Text', 2, v)));
        notes.push(newNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }).addAnnotation(0, newAnnotation('Text', 3, v)));
        notes.push(newNote({ keys: ['c/6'], duration: 'q', stem_direction: -1 }).addAnnotation(0, newAnnotation('Text', 4, v)));

        VF.Formatter.FormatAndDraw(ctx, stave, notes, 100);
      }

      ok(true, 'Test Justification Annotation');
    },

    tabNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 200);
      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '8' },
        { positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 3, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 3, fret: 5 }], duration: '8' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var notes2 = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      var notes3 = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        return tabNote;
      });

      notes[0].addModifier(new VF.Annotation('Text').setJustification(1).setVerticalJustification(1), 0); // U
      notes[1].addModifier(new VF.Annotation('Text').setJustification(2).setVerticalJustification(2), 0); // D
      notes[2].addModifier(new VF.Annotation('Text').setJustification(3).setVerticalJustification(3), 0); // U
      notes[3].addModifier(new VF.Annotation('Text').setJustification(4).setVerticalJustification(4), 0); // D

      notes2[0].addModifier(new VF.Annotation('Text').setJustification(3).setVerticalJustification(1), 0); // U
      notes2[1].addModifier(new VF.Annotation('Text').setJustification(3).setVerticalJustification(2), 0); // D
      notes2[2].addModifier(new VF.Annotation('Text').setJustification(3).setVerticalJustification(3), 0); // U
      notes2[3].addModifier(new VF.Annotation('Text').setJustification(3).setVerticalJustification(4), 0); // D

      notes3[0].addModifier(new VF.Annotation('Text').setVerticalJustification(1), 0); // U
      notes3[1].addModifier(new VF.Annotation('Text').setVerticalJustification(2), 0); // D
      notes3[2].addModifier(new VF.Annotation('Text').setVerticalJustification(3), 0); // U
      notes3[3].addModifier(new VF.Annotation('Text').setVerticalJustification(4), 0); // D

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);
      voice.addTickables(notes2);
      voice.addTickables(notes3);


      new VF.Formatter().joinVoices([voice])
        .formatToStave([voice], stave);


      voice.draw(ctx, stave);

      ok(true, 'TabNotes successfully drawn');
    },
  };

  return Annotation;
})();

/**
 * VexFlow - Articulation Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.Articulation = (function() {
  var Articulation = {
    Start: function() {
      QUnit.module('Articulation');
      Articulation.runTests('Articulation - Staccato/Staccatissimo', 'a.', 'av', Articulation.drawArticulations);
      Articulation.runTests('Articulation - Accent/Tenuto', 'a>', 'a-', Articulation.drawArticulations);
      Articulation.runTests('Articulation - Marcato/L.H. Pizzicato', 'a^', 'a+', Articulation.drawArticulations);
      Articulation.runTests('Articulation - Snap Pizzicato/Fermata', 'ao', 'ao', Articulation.drawArticulations);
      Articulation.runTests('Articulation - Up-stroke/Down-Stroke', 'a|', 'am', Articulation.drawArticulations);
      Articulation.runTests('Articulation - Fermata Above/Below', 'a@a', 'a@u', Articulation.drawFermata);
      Articulation.runTests('Articulation - Inline/Multiple', 'a.', 'a.', Articulation.drawArticulations2);
      Articulation.runTests('TabNote Articulation', 'a.', 'a.', Articulation.tabNotes);
    },

    runTests: function(name, sym1, sym2, func) {
      var params = {
        sym1: sym1,
        sym2: sym2,
      };

      VF.Test.runTests(name, func, params);
    },

    drawArticulations: function(options, contextBuilder) {
      var sym1 = options.params.sym1;
      var sym2 = options.params.sym2;

      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 625, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 125);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['a/3'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
      ];
      notesBar1[0].addArticulation(0, new VF.Articulation(sym1).setPosition(4));
      notesBar1[1].addArticulation(0, new VF.Articulation(sym1).setPosition(4));
      notesBar1[2].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar1[3].addArticulation(0, new VF.Articulation(sym1).setPosition(3));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 125);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
      ];
      notesBar2[0].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[1].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[2].addArticulation(0, new VF.Articulation(sym1).setPosition(4));
      notesBar2[3].addArticulation(0, new VF.Articulation(sym1).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      // bar 3 - juxtaposing second bar next to first bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x, staveBar2.y, 125);
      staveBar3.setContext(ctx).draw();

      var notesBar3 = [
        new VF.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
      ];
      notesBar3[0].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar3[1].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar3[2].addArticulation(0, new VF.Articulation(sym2).setPosition(3));
      notesBar3[3].addArticulation(0, new VF.Articulation(sym2).setPosition(3));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);
      // bar 4 - juxtaposing second bar next to first bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x, staveBar3.y, 125);
      staveBar4.setEndBarType(VF.Barline.type.END);
      staveBar4.setContext(ctx).draw();

      var notesBar4 = [
        new VF.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
      ];
      notesBar4[0].addArticulation(0, new VF.Articulation(sym2).setPosition(3));
      notesBar4[1].addArticulation(0, new VF.Articulation(sym2).setPosition(3));
      notesBar4[2].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar4[3].addArticulation(0, new VF.Articulation(sym2).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
    },

    drawFermata: function(options, contextBuilder) {
      var sym1 = options.params.sym1;
      var sym2 = options.params.sym2;

      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 400, 200);

      // bar 1
      var staveBar1 = new VF.Stave(50, 30, 150);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: -1 }),
      ];
      notesBar1[0].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar1[1].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar1[2].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar1[3].addArticulation(0, new VF.Articulation(sym2).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 150);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
      ];
      notesBar2[0].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[1].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[2].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar2[3].addArticulation(0, new VF.Articulation(sym2).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
    },

    drawArticulations2: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 1000, 200);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 350);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['c/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['d/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['e/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['g/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['b/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['d/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['e/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['f/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['g/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['b/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['c/6'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['d/6'], duration: '16', stem_direction: -1 }),
      ];
      var i;
      for (i = 0; i < 16; i++) {
        notesBar1[i].addArticulation(0, new VF.Articulation('a.').setPosition(4));
        notesBar1[i].addArticulation(0, new VF.Articulation('a>').setPosition(4));

        if (i === 15) {
          notesBar1[i].addArticulation(0, new VF.Articulation('a@u').setPosition(4));
        }
      }

      var beam1 = new VF.Beam(notesBar1.slice(0, 8));
      var beam2 = new VF.Beam(notesBar1.slice(8, 16));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 350);
      staveBar2.setContext(ctx).draw();
      var notesBar2 = [
        new VF.StaveNote({ keys: ['f/3'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['g/3'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/3'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['b/3'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['c/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['d/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['e/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '16', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['g/4'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['b/4'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['d/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['e/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['f/5'], duration: '16', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['g/5'], duration: '16', stem_direction: -1 }),
      ];
      for (i = 0; i < 16; i++) {
        notesBar2[i].addArticulation(0, new VF.Articulation('a-').setPosition(3));
        notesBar2[i].addArticulation(0, new VF.Articulation('a^').setPosition(3));

        if (i === 15) {
          notesBar2[i].addArticulation(0, new VF.Articulation('a@u').setPosition(4));
        }
      }

      var beam3 = new VF.Beam(notesBar2.slice(0, 8));
      var beam4 = new VF.Beam(notesBar2.slice(8, 16));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
      beam3.setContext(ctx).draw();
      beam4.setContext(ctx).draw();

      // bar 3 - juxtaposing second bar next to first bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x, staveBar2.y, 75);
      staveBar3.setContext(ctx).draw();

      var notesBar3 = [
        new VF.StaveNote({ keys: ['c/4'], duration: 'w', stem_direction: 1 }),
      ];
      notesBar3[0].addArticulation(0, new VF.Articulation('a-').setPosition(3));
      notesBar3[0].addArticulation(0, new VF.Articulation('a>').setPosition(3));
      notesBar3[0].addArticulation(0, new VF.Articulation('a@a').setPosition(3));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);
      // bar 4 - juxtaposing second bar next to first bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x, staveBar3.y, 150);
      staveBar4.setEndBarType(VF.Barline.type.END);
      staveBar4.setContext(ctx).draw();

      var notesBar4 = [
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
      ];
      for (i = 0; i < 4; i++) {
        var position1 = 3;
        if (i > 1) {
          position1 = 4;
        }
        notesBar4[i].addArticulation(0, new VF.Articulation('a-').setPosition(position1));
      }

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
    },

    tabNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 200);
      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '8' },
        { positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 3, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 3, fret: 5 }], duration: '8' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var notes2 = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      var notes3 = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        return tabNote;
      });

      notes[0].addModifier(new VF.Articulation('a>').setPosition(3), 0); // U
      notes[1].addModifier(new VF.Articulation('a>').setPosition(4), 0); // D
      notes[2].addModifier(new VF.Articulation('a.').setPosition(3), 0); // U
      notes[3].addModifier(new VF.Articulation('a.').setPosition(4), 0); // D

      notes2[0].addModifier(new VF.Articulation('a>').setPosition(3), 0);
      notes2[1].addModifier(new VF.Articulation('a>').setPosition(4), 0);
      notes2[2].addModifier(new VF.Articulation('a.').setPosition(3), 0);
      notes2[3].addModifier(new VF.Articulation('a.').setPosition(4), 0);

      notes3[0].addModifier(new VF.Articulation('a>').setPosition(3), 0);
      notes3[1].addModifier(new VF.Articulation('a>').setPosition(4), 0);
      notes3[2].addModifier(new VF.Articulation('a.').setPosition(3), 0);
      notes3[3].addModifier(new VF.Articulation('a.').setPosition(4), 0);

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);
      voice.addTickables(notes2);
      voice.addTickables(notes3);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      voice.draw(ctx, stave);

      ok(true, 'TabNotes successfully drawn');
    },
  };

  return Articulation;
}());

/**
 * VexFlow - Auto-beaming Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.AutoBeamFormatting = (function() {
  function concat(a, b) { return a.concat(b); }

  var AutoBeamFormatting = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('Auto-Beaming');
      runTests('Simple Auto Beaming', AutoBeamFormatting.simpleAuto);
      runTests('Even Group Stem Directions', AutoBeamFormatting.evenGroupStemDirections);
      runTests('Odd Group Stem Directions', AutoBeamFormatting.oddGroupStemDirections);
      runTests('Odd Beam Groups Auto Beaming', AutoBeamFormatting.oddBeamGroups);
      runTests('More Simple Auto Beaming 0', AutoBeamFormatting.moreSimple0);
      runTests('More Simple Auto Beaming 1', AutoBeamFormatting.moreSimple1);
      runTests('Beam Across All Rests', AutoBeamFormatting.beamAcrossAllRests);
      runTests('Beam Across All Rests with Stemlets', AutoBeamFormatting.beamAcrossAllRestsWithStemlets);
      runTests('Break Beams on Middle Rests Only', AutoBeamFormatting.beamAcrossMiddleRests);
      runTests('Break Beams on Rest', AutoBeamFormatting.breakBeamsOnRests);
      runTests('Maintain Stem Directions', AutoBeamFormatting.maintainStemDirections);
      runTests('Maintain Stem Directions - Beam Over Rests', AutoBeamFormatting.maintainStemDirectionsBeamAcrossRests);
      runTests('Beat group with unbeamable note - 2/2', AutoBeamFormatting.groupWithUnbeamableNote);
      runTests('Offset beat grouping - 6/8 ', AutoBeamFormatting.groupWithUnbeamableNote1);
      runTests('Odd Time - Guessing Default Beam Groups', AutoBeamFormatting.autoOddBeamGroups);
      runTests('Custom Beam Groups', AutoBeamFormatting.customBeamGroups);
      runTests('Simple Tuplet Auto Beaming', AutoBeamFormatting.simpleTuplets);
      runTests('More Simple Tuplet Auto Beaming', AutoBeamFormatting.moreSimpleTuplets);
      runTests('More Automatic Beaming', AutoBeamFormatting.moreBeaming);
      runTests('Duration-Based Secondary Beam Breaks', AutoBeamFormatting.secondaryBreaks);
      runTests('Duration-Based Secondary Beam Breaks 2', AutoBeamFormatting.secondaryBreaks2);
      runTests('Flat Beams Up', AutoBeamFormatting.flatBeamsUp);
      runTests('Flat Beams Down', AutoBeamFormatting.flatBeamsDown);
      runTests('Flat Beams Mixed Direction', AutoBeamFormatting.flatBeamsMixed);
      runTests('Flat Beams Up (uniform)', AutoBeamFormatting.flatBeamsUpUniform);
      runTests('Flat Beams Down (uniform)', AutoBeamFormatting.flatBeamsDownUniform);
      runTests('Flat Beams Up Bounds', AutoBeamFormatting.flatBeamsUpBounds);
      runTests('Flat Beams Down Bounds', AutoBeamFormatting.flatBeamsDownBounds);
    },

    simpleAuto: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'f5/8, e5, d5, c5/16, c5, d5/8, e5, f5, f5/32, f5, f5, f5'
      ), { time: '4/4' });

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beaming Applicator Test');
    },

    evenGroupStemDirections: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'a4/8, b4, g4, c5, f4, d5, e4, e5, b4, b4, g4, d5'
      ), { time: '6/4' });

      // Takes a voice and returns it's auto beams
      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;
      equal(beams[0].stem_direction, UP);
      equal(beams[1].stem_direction, UP);
      equal(beams[2].stem_direction, UP);
      equal(beams[3].stem_direction, UP);
      equal(beams[4].stem_direction, DOWN);
      equal(beams[5].stem_direction, DOWN);

      ok(true, 'Auto Beaming Applicator Test');
    },

    oddGroupStemDirections: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'g4/8, b4, d5, c5, f4, d5, e4, g5, g4, b4, g4, d5, a4, c5, a4'
      ), { time: '15/8' });

      var groups = [new VF.Fraction(3, 8)];
      var beams = VF.Beam.applyAndGetBeams(voice, null, groups);

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;
      equal(beams[0].stem_direction, DOWN, 'Notes are equadistant from middle line');
      equal(beams[1].stem_direction, DOWN);
      equal(beams[2].stem_direction, UP);
      equal(beams[3].stem_direction, DOWN, 'Notes are equadistant from middle line');

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beaming Applicator Test');
    },

    oddBeamGroups: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'f5, e5, d5, c5, c5, d5, e5, f5, f5, f4, f3, f5/16, f5'
      ), { time: '6/4' });

      var groups = [
        new VF.Fraction(2, 8),
        new VF.Fraction(3, 8),
        new VF.Fraction(1, 8),
      ];

      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice, undefined, groups);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    moreSimple0: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c4/8, g4, c5, g5, a5, c4, d4, a5'
      ), { time: '4/4' });

      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    moreSimple1: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/16, g5, c5, c5/r, c5/r, (c4 e4 g4), d4, a5, c4, g4, c5, b4/r, (c4 e4), b4/r, b4/r, a4'
      ), { time: '4/4' });

      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    breakBeamsOnRests: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/16, g5, c5, c5/r, c5/r, (c4 e4 g4), d4, a5, c4, g4, c5, b4/r, (c4 e4), b4/r, b4/r, a4'
      ), { time: '4/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        beam_rests: false,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    beamAcrossAllRestsWithStemlets: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/16, g5, c5, c5/r, c5/r, (c4 e4 g4), d4, a5, c4, g4, c5, b4/r, (c4 e4), b4/r, b4/r, a4'
      ), { time: '4/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        beam_rests: true,
        show_stemlets: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    beamAcrossAllRests: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/16, g5, c5, c5/r, c5/r, (c4 e4 g4), d4, a5, c4, g4, c5, b4/r, (c4 e4), b4/r, b4/r, a4'
      ), { time: '4/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        beam_rests: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    beamAcrossMiddleRests: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/16, g5, c5, c5/r, c5/r, (c4 e4 g4), d4, a5, c4, g4, c5, b4/r, (c4 e4), b4/r, b4/r, a4'
      ), { time: '4/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        beam_rests: true,
        beam_middle_only: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    maintainStemDirections: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes([
        'b4/16,            b4,              b4[stem="down"], b4/r',
        'b4/r,             b4[stem="down"], b4,              b4',
        'b4[stem="down"],  b4[stem="down"], b4,              b4/r',
        'b4/32,            b4[stem="down"], b4[stem="down"], b4, b4/16/r, b4',
      ].join(', '), { stem: 'up' }), { time: '4/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        beam_rests: false,
        maintain_stem_directions: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    maintainStemDirectionsBeamAcrossRests: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes([
        'b4/16,            b4,              b4[stem="down"], b4/r',
        'b4/r,             b4[stem="down"], b4,              b4',
        'b4[stem="down"],  b4[stem="down"], b4,              b4/r',
        'b4/32,            b4[stem="down"], b4[stem="down"], b4, b4/16/r, b4',
      ].join(', '), { stem: 'up' }), { time: '4/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        beam_rests: true,
        maintain_stem_directions: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    groupWithUnbeamableNote: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave().addTimeSignature('2/4');
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'b4/16, b4, b4/4, b4/16, b4'
      ), { time: '2/4' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        groups: [new VF.Fraction(2, 2)],
        beam_rests: false,
        maintain_stem_directions: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    groupWithUnbeamableNote1: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave().addTimeSignature('6/8');
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'b4/4, b4/4, b4/8, b4/8'
      ), { time: '6/8' });

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        groups: [new VF.Fraction(3, 8)],
        beam_rests: false,
        maintain_stem_directions: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    autoOddBeamGroups: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 400);
      var score = vf.EasyScore();

      var stave1 = vf.Stave({ y: 10 }).addTimeSignature('5/4');
      var voice1 = score.voice(score.notes('c5/8, g5, c5, b4, b4, c4, d4, a5, c4, g4'), { time: '5/4' });

      var stave2 = vf.Stave({ y: 150 }).addTimeSignature('5/8');
      var voice2 = score.voice(score.notes('c5/8, g5, c5, b4, b4'), { time: '5/8' });

      var stave3 = vf.Stave({ y: 290 }).addTimeSignature('13/16');
      var voice3 = score.voice(score.notes('c5/16, g5, c5, b4, b4, c5, g5, c5, b4, b4, c5, b4, b4'), { time: '13/16' });

      var beams = [
        VF.Beam.applyAndGetBeams(voice1, undefined, VF.Beam.getDefaultBeamGroups('5/4')),
        VF.Beam.applyAndGetBeams(voice2, undefined, VF.Beam.getDefaultBeamGroups('5/8')),
        VF.Beam.applyAndGetBeams(voice3, undefined, VF.Beam.getDefaultBeamGroups('13/16')),
      ].reduce(concat);

      vf.Formatter()
        .formatToStave([voice1], stave1)
        .formatToStave([voice2], stave2)
        .formatToStave([voice3], stave3);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    customBeamGroups: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 400);
      var score = vf.EasyScore();

      var stave1 = vf.Stave({ y: 10 }).addTimeSignature('5/4');
      var voice1 = score.voice(score.notes('c5/8, g5, c5, b4, b4, c4, d4, a5, c4, g4'), { time: '5/4' });

      var stave2 = vf.Stave({ y: 150 }).addTimeSignature('5/8');
      var voice2 = score.voice(score.notes('c5/8, g5, c5, b4, b4'), { time: '5/8' });

      var stave3 = vf.Stave({ y: 290 }).addTimeSignature('13/16');
      var voice3 = score.voice(score.notes('c5/16, g5, c5, b4, b4, c5, g5, c5, b4, b4, c5, b4, b4'), { time: '13/16' });

      var group1 = [
        new VF.Fraction(5, 8),
      ];

      var group2 = [
        new VF.Fraction(3, 8),
        new VF.Fraction(2, 8),
      ];

      var group3 = [
        new VF.Fraction(7, 16),
        new VF.Fraction(2, 16),
        new VF.Fraction(4, 16),
      ];

      var beams = [
        VF.Beam.applyAndGetBeams(voice1, undefined, group1),
        VF.Beam.applyAndGetBeams(voice2, undefined, group2),
        VF.Beam.applyAndGetBeams(voice3, undefined, group3),
      ].reduce(concat);

      vf.Formatter()
        .formatToStave([voice1], stave1)
        .formatToStave([voice2], stave2)
        .formatToStave([voice3], stave3);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    simpleTuplets: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var notes = score.notes.bind(score);
      var tuplet = score.tuplet.bind(score);

      var voice = score.voice([
        tuplet(notes('c4/8, g4, c5')),
        notes('g5/8, a5'),
        tuplet(notes('a5/16, (c5 e5), a5, d5, a5'), {
          ratioed: false,
          notes_occupied: 4,
        }),
      ].reduce(concat), { time: '3/4' });

      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    moreSimpleTuplets: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var notes = score.notes.bind(score);
      var tuplet = score.tuplet.bind(score);

      var voice = score.voice([
        tuplet(notes('d4/4, g4, c5')),
        notes('g5/16, a5, a5, (c5 e5)'),
      ].reduce(concat), { time: '3/4' });

      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    moreBeaming: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c4/8, g4/4, c5/8., g5/16, a5/4, a5/16, (c5 e5)/16, a5/8'
      ), { time: '9/8' });

      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Auto Beam Applicator Test');
    },

    secondaryBreaks: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes([
        'f5/32, f5, f5, f5, f5/16., f5/32',
        'f5/16, f5/8, f5/16',
        'f5/32, f5/16., f5., f5/32',
        'f5/16., f5/32, f5, f5/16.',
      ].join(',')));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        secondary_breaks: '8',
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Duration-Based Secondary Breaks Test');
    },

    secondaryBreaks2: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var notes = score.notes.bind(score);
      var tuplet = score.tuplet.bind(score);

      var voice = score.voice([
        tuplet(notes('e5/16, f5, f5')),
        tuplet(notes('f5/16, f5, c5')),
        notes('a4/16., f4/32'),
        tuplet(notes('d4/16, d4, d4')),
        tuplet(notes('a5/8, (e5 g5), a5')),
        tuplet(notes('f5/16, f5, f5')),
        tuplet(notes('f5/16, f5, a4')),
      ].reduce(concat));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        secondary_breaks: '8',
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Duration-Based Secondary Breaks Test');
    },

    flatBeamsUp: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var tuplet = score.tuplet.bind(score);
      var notes = score.notes.bind(score);

      var voice = score.voice([
        tuplet(notes('c4/8, g4, f5')),
        notes('d5/8'),
        tuplet(notes('c5/16, (c4 e4 g4), f4')),
        notes('d5/8, e5, c4, f5/32, f5, f5, f5'),
      ].reduce(concat));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
        stem_direction: 1,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Up Test');
    },

    flatBeamsDown: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice = score.voice(
        score.notes(
          'c5/64, c5, c5, c5, c5, c5, c5, c5, a5/8, g5, (d4 f4 a4)/16, d4, d5/8, e5, g5, a6/32, a6, a6, g4/64, g4'
        )
      );

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
        stem_direction: -1,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Down Test');
    },

    flatBeamsMixed: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/64, d5, e5, c5, f5, c5, a5, c5, a5/8, g5, (d4 f4 a4)/16, d4, d5/8, e5, c4, a4/32, a4, a4, g4/64, g4'
      ));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Mixed Direction Test');
    },

    flatBeamsUpUniform: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var tuplet = score.tuplet.bind(score);
      var notes = score.notes.bind(score);

      var voice = score.voice([
        tuplet(notes('c4/8, g4, g5')),
        notes('d5/8, c5/16, (c4 e4 g4), d5/8, e5, c4, f5/32, f5, f5, f5'),
      ].reduce(concat));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
        flat_beam_offset: 50,
        stem_direction: 1,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Up (uniform) Test');
    },

    flatBeamsDownUniform: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'c5/64, c5, c5, c5, c5, c5, c5, c5, a5/8, g5, (e4 g4 b4)/16, e5, d5/8, e5/8, g5/8, a6/32, a6, a6, g4/64, g4'
      ));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
        flat_beam_offset: 155,
        stem_direction: -1,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Down (uniform) Test');
    },

    flatBeamsUpBounds: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var tuplet = score.tuplet.bind(score);
      var notes = score.notes.bind(score);
      var voice = score.voice([
        tuplet(notes('c4/8, g4/8, g5/8')),
        notes('d5/8, c5/16, (c4 e4 g4)/16, d5/8, e5/8, c4/8, f5/32, f5/32, f5/32, f5/32'),
      ].reduce(concat));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
        flat_beam_offset: 60,
        stem_direction: 1,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Up (uniform) Test');
    },

    flatBeamsDownBounds: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 200);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes([
        'g5/8, a6/32, a6/32, a6/32, g4/64, g4/64',
        'c5/64, c5/64, c5/64, c5/64, c5/64, c5/64, c5/64, c5/64, a5/8',
        'g5/8, (e4 g4 b4)/16, e5/16',
        'd5/8, e5/8',
      ].join(','), { stem: 'down' }));

      var beams = VF.Beam.generateBeams(voice.getTickables(), {
        flat_beams: true,
        flat_beam_offset: 145,
        stem_direction: -1,
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        return beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'Flat Beams Down (uniform) Test');
    },
  };

  return AutoBeamFormatting;
})();

/**
 * VexFlow - Auto-beaming Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;

VF.Test.BachDemo = (function() {
  function concat(a, b) { return a.concat(b); }

  var BachDemo = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('Bach Demo');
      runTests('Minuet 1', BachDemo.minuet1);
    },

    minuet1: function(options) {
      var registry = new VF.Registry();
      VF.Registry.enableDefaultRegistry(registry);
      var vf = VF.Test.makeFactory(options, 1100, 900);
      var score = vf.EasyScore({ throwOnError: true });

      var voice = score.voice.bind(score);
      var notes = score.notes.bind(score);
      var beam = score.beam.bind(score);

      var x = 120;
      var y = 80;
      function makeSystem(width) {
        var system = vf.System({ x: x, y: y, width: width, spaceBetweenStaves: 10 });
        x += width;
        return system;
      }

      function id(id) { return registry.getElementById(id); }

      score.set({ time: '3/4' });

      /*  Measure 1 */
      var system = makeSystem(220);
      system.addStave({
        voices: [
          voice([
            notes('D5/q[id="m1a"]'),
            beam(notes('G4/8, A4, B4, C5', { stem: 'up' })),
          ].reduce(concat)),
          voice([vf.TextDynamics({ text: 'p', duration: 'h', dots: 1, line: 9 })]),
        ],
      })
        .addClef('treble')
        .addKeySignature('G')
        .addTimeSignature('3/4')
        .setTempo({ name: 'Allegretto', duration: 'h', dots: 1, bpm: 66 }, -30);

      system.addStave({ voices: [voice(notes('(G3 B3 D4)/h, A3/q', { clef: 'bass' }))] })
        .addClef('bass').addKeySignature('G').addTimeSignature('3/4');
      system.addConnector('brace');
      system.addConnector('singleRight');
      system.addConnector('singleLeft');

      id('m1a').addModifier(0, vf.Fingering({ number: '5' }));

      /*  Measure 2 */
      system = makeSystem(150);
      system.addStave({ voices: [voice(notes('D5/q[id="m2a"], G4[id="m2b"], G4[id="m2c"]'))] });
      system.addStave({ voices: [voice(notes('B3/h.', { clef: 'bass' }))] });
      system.addConnector('singleRight');

      id('m2a').addModifier(0, vf.Articulation({ type: 'a.', position: 'above' }));
      id('m2b').addModifier(0, vf.Articulation({ type: 'a.', position: 'below' }));
      id('m2c').addModifier(0, vf.Articulation({ type: 'a.', position: 'below' }));

      vf.Curve({
        from: id('m1a'),
        to: id('m2a'),
        options: { cps: [{ x: 0, y: 40 }, { x: 0, y: 40 }] },
      });

      /*  Measure 3 */
      system = makeSystem(150);
      system.addStave({
        voices: [
          voice([
            notes('E5/q[id="m3a"]'),
            beam(notes('C5/8, D5, E5, F5', { stem: 'down' })),
          ].reduce(concat)),
        ],
      });
      id('m3a').addModifier(0, vf.Fingering({ number: '3', position: 'above' }));

      system.addStave({ voices: [voice(notes('C4/h.', { clef: 'bass' }))] });
      system.addConnector('singleRight');

      /*  Measure 4 */
      system = makeSystem(150);
      system.addStave({ voices: [voice(notes('G5/q[id="m4a"], G4[id="m4b"], G4[id="m4c"]'))] });

      system.addStave({ voices: [voice(notes('B3/h.', { clef: 'bass' }))] });
      system.addConnector('singleRight');

      id('m4a').addModifier(0, vf.Articulation({ type: 'a.', position: 'above' }));
      id('m4b').addModifier(0, vf.Articulation({ type: 'a.', position: 'below' }));
      id('m4c').addModifier(0, vf.Articulation({ type: 'a.', position: 'below' }));

      vf.Curve({
        from: id('m3a'),
        to: id('m4a'),
        options: { cps: [{ x: 0, y: 20 }, { x: 0, y: 20 }] },
      });

      /*  Measure 5 */
      system = makeSystem(150);
      system.addStave({
        voices: [
          voice([
            notes('C5/q[id="m5a"]'),
            beam(notes('D5/8, C5, B4, A4', { stem: 'down' })),
          ].reduce(concat)),
        ],
      });
      id('m5a').addModifier(0, vf.Fingering({ number: '4', position: 'above' }));

      system.addStave({ voices: [voice(notes('A3/h.', { clef: 'bass' }))] });
      system.addConnector('singleRight');

      /*  Measure 6 */
      system = makeSystem(150);
      system.addStave({
        voices: [
          voice([
            notes('B4/q'),
            beam(notes('C5/8, B4, A4, G4[id="m6a"]', { stem: 'up' })),
          ].reduce(concat)),
        ],
      });

      system.addStave({ voices: [voice(notes('G3/h.', { clef: 'bass' }))] });
      system.addConnector('singleRight');

      vf.Curve({
        from: id('m5a'),
        to: id('m6a'),
        options: {
          cps: [{ x: 0, y: 20 }, { x: 0, y: 20 }],
          invert: true,
          position_end: 'nearTop',
          y_shift: 20,
        },
      });

      /*  Measure 7 (New system) */
      x = 20;
      y += 230;

      system = makeSystem(220);
      system.addStave({
        voices: [
          voice([
            notes('F4/q[id="m7a"]'),
            beam(notes('G4/8[id="m7b"], A4, B4, G4', { stem: 'up' })),
          ].reduce(concat)),
        ],
      }).addClef('treble').addKeySignature('G');

      system.addStave({ voices: [voice(notes('D4/q, B3[id="m7c"], G3', { clef: 'bass' }))] })
        .addClef('bass').addKeySignature('G');
      system.addConnector('brace');
      system.addConnector('singleRight');
      system.addConnector('singleLeft');

      id('m7a').addModifier(0, vf.Fingering({ number: '2', position: 'below' }));
      id('m7b').addModifier(0, vf.Fingering({ number: '1' }));
      id('m7c').addModifier(0, vf.Fingering({ number: '3', position: 'above' }));

      /*  Measure 8 */
      system = makeSystem(180);
      var grace = vf.GraceNote({ keys: ['d/3'], clef: 'bass', duration: '8', slash: true });

      system.addStave({ voices: [voice(notes('A4/h.[id="m8c"]'))] });
      system.addStave({
        voices: [
          score.set({ clef: 'bass' }).voice([
            notes('D4/q[id="m8a"]'),
            beam(notes('D3/8, C4, B3[id="m8b"], A3', { stem: 'down' })),
          ].reduce(concat)),
        ],
      });
      system.addConnector('singleRight');

      id('m8b').addModifier(0, vf.Fingering({ number: '1', position: 'above' }));
      id('m8c').addModifier(0, vf.GraceNoteGroup({ notes: [grace] }));

      vf.Curve({
        from: id('m7a'),
        to: id('m8c'),
        options: {
          cps: [{ x: 0, y: 20 }, { x: 0, y: 20 }],
          invert: true,
          position: 'nearTop',
          position_end: 'nearTop',
        },
      });

      vf.StaveTie({ from: grace, to: id('m8c') });

      /*  Measure 9 */
      system = makeSystem(180);
      system.addStave({
        voices: [
          score.set({ clef: 'treble' }).voice([
            notes('D5/q[id="m9a"]'),
            beam(notes('G4/8, A4, B4, C5', { stem: 'up' })),
          ].reduce(concat)),
        ],
      });

      system.addStave({ voices: [voice(notes('B3/h, A3/q', { clef: 'bass' }))] });
      system.addConnector('singleRight');

      id('m9a').addModifier(0, vf.Fingering({ number: '5' }));

      /*  Measure 10 */
      system = makeSystem(170);
      system.addStave({ voices: [voice(notes('D5/q[id="m10a"], G4[id="m10b"], G4[id="m10c"]'))] });
      system.addStave({ voices: [voice(notes('G3/q[id="m10d"], B3, G3', { clef: 'bass' }))] });
      system.addConnector('singleRight');

      id('m10a').addModifier(0, vf.Articulation({ type: 'a.', position: 'above' }));
      id('m10b').addModifier(0, vf.Articulation({ type: 'a.', position: 'below' }));
      id('m10c').addModifier(0, vf.Articulation({ type: 'a.', position: 'below' }));
      id('m10d').addModifier(0, vf.Fingering({ number: '4' }));

      vf.Curve({
        from: id('m9a'),
        to: id('m10a'),
        options: { cps: [{ x: 0, y: 40 }, { x: 0, y: 40 }] },
      });

      /*  Measure 11 */
      system = makeSystem(150);
      system.addStave({
        voices: [
          voice([
            notes('E5/q[id="m11a"]'),
            beam(notes('C5/8, D5, E5, F5', { stem: 'down' })),
          ].reduce(concat)),
        ],
      });
      id('m11a').addModifier(0, vf.Fingering({ number: '3', position: 'above' }));

      system.addStave({ voices: [voice(notes('C4/h.', { clef: 'bass' }))] });
      system.addConnector('singleRight');

      /*  Measure 12 */
      system = makeSystem(170);
      system.addStave({ voices: [voice(notes('G5/q[id="m12a"], G4[id="m12b"], G4[id="m12c"]'))] });

      system.addStave({
        voices: [
          score.set({ clef: 'bass' }).voice([
            notes('B3/q[id="m12d"]'),
            beam(notes('C4/8, B3, A3, G3[id="m12e"]', { stem: 'down' })),
          ].reduce(concat)),
        ],
      });
      system.addConnector('singleRight');

      id('m12a').addModifier(0, vf.Articulation({ type: 'a.', position: 'above' }));
      id('m12b').addModifier(0, vf.Articulation({ type: 'a.', position: 'below' }));
      id('m12c').addModifier(0, vf.Articulation({ type: 'a.', position: 'below' }));

      id('m12d').addModifier(0, vf.Fingering({ number: '2', position: 'above' }));
      id('m12e').addModifier(0, vf.Fingering({ number: '4', position: 'above' }));

      vf.Curve({
        from: id('m11a'),
        to: id('m12a'),
        options: { cps: [{ x: 0, y: 20 }, { x: 0, y: 20 }] },
      });

      /*  Measure 13 (New system) */
      x = 20;
      y += 230;

      system = makeSystem(220);
      system.addStave({
        voices: [
          score.set({ clef: 'treble' }).voice([
            notes('c5/q[id="m13a"]'),
            beam(notes('d5/8, c5, b4, a4', { stem: 'down' })),
          ].reduce(concat)),
        ],
      }).addClef('treble').addKeySignature('G');

      system.addStave({ voices: [voice(notes('a3/h[id="m13b"], f3/q[id="m13c"]', { clef: 'bass' }))] })
        .addClef('bass').addKeySignature('G');

      system.addConnector('brace');
      system.addConnector('singleRight');
      system.addConnector('singleLeft');

      id('m13a').addModifier(0, vf.Fingering({ number: '4', position: 'above' }));
      id('m13b').addModifier(0, vf.Fingering({ number: '1' }));
      id('m13c').addModifier(0, vf.Fingering({ number: '3', position: 'above' }));

      /*  Measure 14 */
      system = makeSystem(180);
      system.addStave({
        voices: [
          score.set({ clef: 'treble' }).voice([
            notes('B4/q'),
            beam(notes('C5/8, b4, a4, g4', { stem: 'up' })),
          ].reduce(concat)),
        ],
      });

      system.addStave({ voices: [voice(notes('g3/h[id="m14a"], b3/q[id="m14b"]', { clef: 'bass' }))] });
      system.addConnector('singleRight');

      id('m14a').addModifier(0, vf.Fingering({ number: '2' }));
      id('m14b').addModifier(0, vf.Fingering({ number: '1' }));

      /*  Measure 15 */
      system = makeSystem(180);
      system.addStave({
        voices: [
          score.set({ clef: 'treble' }).voice([
            notes('a4/q'),
            beam(notes('b4/8, a4, g4, f4[id="m15a"]', { stem: 'up' })),
          ].reduce(concat)),
        ],
      });

      system.addStave({ voices: [voice(notes('c4/q[id="m15b"], d4, d3', { clef: 'bass' }))] });
      system.addConnector('singleRight');

      id('m15a').addModifier(0, vf.Fingering({ number: '2' }));
      id('m15b').addModifier(0, vf.Fingering({ number: '2' }));

      /*  Measure 16 */
      system = makeSystem(130);
      system.addStave({
        voices: [
          score.set({ clef: 'treble' }).voice([
            notes('g4/h.[id="m16a"]'),
          ].reduce(concat)),
        ],
      }).setEndBarType(VF.Barline.type.REPEAT_END);

      system.addStave({ voices: [voice(notes('g3/h[id="m16b"], g2/q', { clef: 'bass' }))] })
        .setEndBarType(VF.Barline.type.REPEAT_END);
      system.addConnector('boldDoubleRight');

      id('m16a').addModifier(0, vf.Fingering({ number: '1' }));
      id('m16b').addModifier(0, vf.Fingering({ number: '1' }));

      vf.Curve({
        from: id('m13a'),
        to: id('m16a'),
        options: {
          cps: [{ x: 0, y: 50 }, { x: 0, y: 20 }],
          invert: true,
          position_end: 'nearTop',
        },
      });

      /* Measure 17 */
      system = makeSystem(180);
      system.addStave({
        voices: [
          score.set({ clef: 'treble' }).voice([
            notes('b5/q[id="m17a"]'),
            beam(notes('g5/8, a5, b5, g5', { stem: 'down' })),
          ].reduce(concat)),
          voice([vf.TextDynamics({ text: 'mf', duration: 'h', dots: 1, line: 10 })]),
        ],
      }).setBegBarType(VF.Barline.type.REPEAT_BEGIN);

      system.addStave({ voices: [voice(notes('g3/h.', { clef: 'bass' }))] })
        .setBegBarType(VF.Barline.type.REPEAT_BEGIN);

      system.addConnector('boldDoubleLeft');
      system.addConnector('singleRight');

      id('m17a').addModifier(0, vf.Fingering({ number: '5', position: 'above' }));

      /* Measure 18 */
      system = makeSystem(180);
      system.addStave({
        voices: [
          score.set({ clef: 'treble' }).voice([
            notes('a5/q[id="m18a"]'),
            beam(notes('d5/8, e5, f5, d5[id="m18b"]', { stem: 'down' })),
          ].reduce(concat)),
        ],
      });

      system.addStave({ voices: [voice(notes('f3/h.', { clef: 'bass' }))] });
      system.addConnector('singleRight');

      id('m18a').addModifier(0, vf.Fingering({ number: '4', position: 'above' }));

      vf.Curve({
        from: id('m17a'),
        to: id('m18b'),
        options: {
          cps: [{ x: 0, y: 20 }, { x: 0, y: 30 }],
        },
      });

      /* Done */

      vf.draw();
      VF.Registry.disableDefaultRegistry();
      ok(true, 'Bach Minuet 1');
    },
  };

  return BachDemo;
})();

/**
 * VexFlow - Barline Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Barline = (function() {
  return {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('Barline');

      run('Simple BarNotes', function(options) {
        var vf = VF.Test.makeFactory(options, 380, 160);
        var stave = vf.Stave();

        var notes = [
          vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '2' }),
          vf.BarNote({ type: 'single' }),
          vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '2' })
            .addAccidental(0, vf.Accidental({ type: 'n' }))
            .addAccidental(1, vf.Accidental({ type: '#' })),
        ];

        var voice = vf.Voice().addTickables(notes);

        vf.Formatter()
          .joinVoices([voice])
          .formatToStave([voice], stave);

        vf.draw();

        ok(true, 'Simple Test');
      });
    },
  };
}());

/**
 * VexFlow - Beam Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */


/*
eslint-disable
no-var,
no-undef,
wrap-iife,
func-names,
vars-on-top,
max-len,
 */

VF.Test.Beam = (function() {
  var runTests = VF.Test.runTests;

  function concat(a, b) { return a.concat(b); }

  var Beam = {
    Start: function() {
      QUnit.module('Beam');
      runTests('Simple Beam', Beam.simple);
      runTests('Multi Beam', Beam.multi);
      runTests('Sixteenth Beam', Beam.sixteenth);
      runTests('Slopey Beam', Beam.slopey);
      runTests('Auto-stemmed Beam', Beam.autoStem);
      runTests('Mixed Beam 1', Beam.mixed);
      runTests('Mixed Beam 2', Beam.mixed2);
      runTests('Dotted Beam', Beam.dotted);
      runTests('Partial Beam', Beam.partial);
      runTests('Close Trade-offs Beam', Beam.tradeoffs);
      runTests('Insane Beam', Beam.insane);
      runTests('Lengthy Beam', Beam.lenghty);
      runTests('Outlier Beam', Beam.outlier);
      runTests('Break Secondary Beams', Beam.breakSecondaryBeams);
      runTests('TabNote Beams Up', Beam.tabBeamsUp);
      runTests('TabNote Beams Down', Beam.tabBeamsDown);
      runTests('TabNote Auto Create Beams', Beam.autoTabBeams);
      runTests('TabNote Beams Auto Stem', Beam.tabBeamsAutoStem);
      runTests('Complex Beams with Annotations', Beam.complexWithAnnotation);
      runTests('Complex Beams with Articulations', Beam.complexWithArticulation);
    },

    simple: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var beam = score.beam.bind(score);
      var notes = score.notes.bind(score);

      var voice = score.voice([
        notes('(cb4 e#4 a4)/2'),
        beam(notes('(cb4 e#4 a4)/8, (d4 f4 a4), (ebb4 g##4 b4), (f4 a4 c5)', { stem: 'up' })),
      ].reduce(concat), { time: '2/2' });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Simple Test');
    },

    multi: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice.bind(score);
      var beam = score.beam.bind(score);
      var notes = score.notes.bind(score);

      var voices = [
        voice([
          beam(notes('f5/8, e5, d5, c5', { stem: 'up' })),
          beam(notes('c5, d5, e5, f5', { stem: 'up' })),
        ].reduce(concat)),
        voice([
          beam(notes('f4/8, e4, d4, c4', { stem: 'down' })),
          beam(notes('c4/8, d4, e4, f4', { stem: 'down' })),
        ].reduce(concat)),
      ];

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();

      ok(true, 'Multi Test');
    },

    sixteenth: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice.bind(score);
      var beam = score.beam.bind(score);
      var notes = score.notes.bind(score);

      var voices = [
        voice([
          beam(notes('f5/16, f5, d5, c5', { stem: 'up' })),
          beam(notes('c5/16, d5, f5, e5', { stem: 'up' })),
          notes('f5/2', { stem: 'up' }),
        ].reduce(concat)),
        voice([
          beam(notes('f4/16, e4/16, d4/16, c4/16', { stem: 'down' })),
          beam(notes('c4/16, d4/16, f4/16, e4/16', { stem: 'down' })),
          notes('f4/2', { stem: 'down' }),
        ].reduce(concat)),
      ];

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();

      ok(true, 'Sixteenth Test');
    },

    breakSecondaryBeams: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 200);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice = score.voice.bind(score);
      var beam = score.beam.bind(score);
      var notes = score.notes.bind(score);

      var voices = [
        voice([
          beam(
            notes('f5/16., f5/32, c5/16., d5/32, c5/16., d5/32', { stem: 'up' }),
            { secondaryBeamBreaks: [1, 3] }
          ),
          beam(
            notes('f5/16, e5, e5, e5, e5, e5', { stem: 'up' }),
            { secondaryBeamBreaks: [2] }
          ),
        ].reduce(concat), { time: '3/4' }),
        voice([
          beam(
            notes('f4/32, d4, e4, c4, d4, c4, f4, d4, e4, c4, c4, d4', { stem: 'down' }),
            { secondaryBeamBreaks: [3, 7] }
          ),
          beam(
            notes('d4/16, f4, d4, e4, e4, e4', { stem: 'down' }),
            { secondaryBeamBreaks: [3] }
          ),
        ].reduce(concat), { time: '3/4' }),
      ];

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();

      ok(true, 'Breaking Secondary Beams Test');
    },

    slopey: function(options) {
      var vf = VF.Test.makeFactory(options, 350, 140);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var beam = score.beam.bind(score);
      var notes = score.notes.bind(score);
      var voice = score.voice([
        beam(notes('c4/8, f4/8, d5/8, g5/8', { stem: 'up' })),
        beam(notes('d6/8, f5/8, d4/8, g3/8', { stem: 'up' })),
      ].reduce(concat));

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Slopey Test');
    },

    autoStem: function(options) {
      var vf = VF.Test.makeFactory(options, 350, 140);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'a4/8, b4/8, g4/8, c5/8, f4/8, d5/8, e4/8, e5/8, b4/8, b4/8, g4/8, d5/8'
      ), { time: '6/4' });

      var notes = voice.getTickables();

      var beams = [
        vf.Beam({ notes: notes.slice(0, 2), options: { autoStem: true } }),
        vf.Beam({ notes: notes.slice(2, 4), options: { autoStem: true } }),
        vf.Beam({ notes: notes.slice(4, 6), options: { autoStem: true } }),
        vf.Beam({ notes: notes.slice(6, 8), options: { autoStem: true } }),
        vf.Beam({ notes: notes.slice(8, 10), options: { autoStem: true } }),
        vf.Beam({ notes: notes.slice(10, 12), options: { autoStem: true } }),
      ];

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;

      equal(beams[0].stem_direction, UP);
      equal(beams[1].stem_direction, UP);
      equal(beams[2].stem_direction, UP);
      equal(beams[3].stem_direction, UP);
      equal(beams[4].stem_direction, DOWN);
      equal(beams[5].stem_direction, DOWN);

      vf.draw();

      ok(true, 'AutoStem Beam Test');
    },

    mixed: function(options) {
      var vf = VF.Test.makeFactory(options, 350, 140);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice1 = score.voice(score.notes(
        'f5/8, d5/16, c5/16, c5/16, d5/16, e5/8, f5/8, d5/16, c5/16, c5/16, d5/16, e5/8',
        { stem: 'up' }
      ));

      var voice2 = score.voice(score.notes(
        'f4/16, e4/8, d4/16, c4/16, d4/8, f4/16, f4/16, e4/8, d4/16, c4/16, d4/8, f4/16',
        { stem: 'down' }
      ));

      [[0, 4], [4, 8], [8, 12]].forEach(function(range) {
        vf.Beam({ notes: voice1.getTickables().slice(range[0], range[1]) });
      });

      [[0, 4], [4, 8], [8, 12]].forEach(function(range) {
        vf.Beam({ notes: voice2.getTickables().slice(range[0], range[1]) });
      });

      vf.Formatter()
        .joinVoices([voice1, voice2])
        .formatToStave([voice1, voice2], stave);

      vf.draw();

      ok(true, 'Multi Test');
    },

    mixed2: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 180);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'f5/32, d5/16, c5/32, c5/64, d5/128, e5/8, f5/16, d5/32, c5/64, c5/32, d5/16, e5/128',
        { stem: 'up' }
      ), { time: '31/64' });

      var voice2 = score.voice(score.notes(
        'f4/32, d4/16, c4/32, c4/64, d4/128, e4/8, f4/16, d4/32, c4/64, c4/32, d4/16, e4/128',
        { stem: 'down' }
      ), { time: '31/64' });

      vf.Beam({ notes: voice.getTickables().slice(0, 12) });
      vf.Beam({ notes: voice2.getTickables().slice(0, 12) });

      vf.Formatter()
        .joinVoices([voice, voice2])
        .formatToStave([voice, voice2], stave);

      vf.draw();

      ok(true, 'Multi Test');
    },

    dotted: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'd4/8, b3/8., a3/16, a3/8, b3/8., c4/16, d4/8, b3/8, a3/8., a3/16, b3/8., c4/16',
        { stem: 'up' }
      ), { time: '6/4' });

      var notes = voice.getTickables();
      vf.Beam({ notes: notes.slice(0, 4) });
      vf.Beam({ notes: notes.slice(4, 8) });
      vf.Beam({ notes: notes.slice(8, 12) });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Dotted Test');
    },

    partial: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'd4/8, b3/32, c4/16., d4/16., e4/8, c4/64, c4/32, a3/8., b3/32., c4/8, e4/64, b3/16., b3/64, f4/8, e4/8, g4/64, e4/8'
      ), { time: '89/64' });

      var notes = voice.getTickables();
      vf.Beam({ notes: notes.slice(0, 3) });
      vf.Beam({ notes: notes.slice(3, 9) });
      vf.Beam({ notes: notes.slice(9, 13) });
      vf.Beam({ notes: notes.slice(13, 17) });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Partial Test');
    },

    tradeoffs: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'a4/8, b4/8, c4/8, d4/8, g4/8, a4/8, b4/8, c4/8',
        { stem: 'up' }
      ));

      var notes = voice.getTickables();
      vf.Beam({ notes: notes.slice(0, 4) });
      vf.Beam({ notes: notes.slice(4, 8) });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Close Trade-offs Test');
    },

    insane: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 180);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        'g4/8, g5/8, c4/8, b5/8, g4/8[stem="down"], a5[stem="down"], b4[stem="down"], c4/8', { stem: 'up' }
      ));

      var notes = voice.getTickables();
      vf.Beam({ notes: notes.slice(0, 4) });
      vf.Beam({ notes: notes.slice(4, 7) });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Insane Test');
    },

    lenghty: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 180);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice = score.voice(score.beam(score.notes(
        'g4/8, g4, g4, a4',
        { stem: 'up' }
      )), { time: '2/4' });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Lengthy Test');
    },

    outlier: function(options) {
      var vf = VF.Test.makeFactory(options, 450, 180);
      var stave = vf.Stave({ y: 20 });
      var score = vf.EasyScore();

      var voice = score.voice(score.notes([
        'g4/8[stem="up"],   f4[stem="up"],   d5[stem="up"],   e4[stem="up"]',
        'd5/8[stem="down"], d5[stem="down"], c5[stem="down"], d5[stem="down"]',
      ].join()));

      var notes = voice.getTickables();
      vf.Beam({ notes: notes.slice(0, 4) });
      vf.Beam({ notes: notes.slice(4, 8) });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave, { stave: stave });

      vf.draw();

      ok(true, 'Outlier Test');
    },

    tabBeamsUp: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 200);
      var stave = vf.TabStave({ y: 20 });

      var specs = [
        { positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '4' },
        { positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '32' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '64' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '128' },
        { positions: [{ str: 3, fret: 6 }], duration: '8' },
        { positions: [{ str: 3, fret: 6 }], duration: '8' },
        { positions: [{ str: 3, fret: 6 }], duration: '8' },
        { positions: [{ str: 3, fret: 6 }], duration: '8' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = vf.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      vf.Beam({ notes: notes.slice(1, 7) });
      vf.Beam({ notes: notes.slice(8, 11) });
      vf.Tuplet({ notes: notes.slice(8, 11), options: { ratioed: true } });

      var voice = vf.Voice().setMode(VF.Voice.Mode.SOFT).addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'All objects have been drawn');
    },

    tabBeamsDown: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 250);
      var stave = vf.TabStave({ options: { num_lines: 10 } });

      var specs = [
        { stem_direction: -1, positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '4' },
        { stem_direction: -1, positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '8dd' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '32' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '64' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '128' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 1, fret: 6 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 7, fret: 6 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 7, fret: 6 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 10, fret: 6 }], duration: '8' },
        { stem_direction: -1, positions: [{ str: 10, fret: 6 }], duration: '8' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = vf.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      notes[1].addDot();
      notes[1].addDot();

      vf.Beam({ notes: notes.slice(1, 7) });
      vf.Beam({ notes: notes.slice(8, 11) });

      vf.Tuplet({ notes: notes.slice(8, 11), options: { location: -1 } });
      vf.Tuplet({ notes: notes.slice(11, 14), options: { location: -1 } });

      var voice = vf.Voice().setMode(VF.Voice.Mode.SOFT).addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'All objects have been drawn');
    },


    autoTabBeams: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 200);
      var stave = vf.TabStave();

      var specs = [
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16' },
        { positions: [{ str: 1, fret: 6 }], duration: '32' },
        { positions: [{ str: 1, fret: 6 }], duration: '32' },
        { positions: [{ str: 1, fret: 6 }], duration: '32' },
        { positions: [{ str: 6, fret: 6 }], duration: '32' },
        { positions: [{ str: 6, fret: 6 }], duration: '16' },
        { positions: [{ str: 6, fret: 6 }], duration: '16' },
        { positions: [{ str: 6, fret: 6 }], duration: '16' },
        { positions: [{ str: 6, fret: 6 }], duration: '16' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = vf.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      var voice = vf.Voice().setMode(VF.Voice.Mode.SOFT).addTickables(notes);
      var beams = VF.Beam.applyAndGetBeams(voice, -1);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        beam.setContext(vf.getContext()).draw();
      });

      ok(true, 'All objects have been drawn');
    },

    // This tests makes sure the auto_stem functionality is works.
    // TabNote stems within a beam group should end up normalized
    tabBeamsAutoStem: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 300);
      var stave = vf.TabStave();

      var specs = [
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8', stem_direction: -1 },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8', stem_direction: 1 },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16', stem_direction: -1 },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16', stem_direction: 1 },
        { positions: [{ str: 1, fret: 6 }], duration: '32', stem_direction: 1 },
        { positions: [{ str: 1, fret: 6 }], duration: '32', stem_direction: -1 },
        { positions: [{ str: 1, fret: 6 }], duration: '32', stem_direction: -1 },
        { positions: [{ str: 6, fret: 6 }], duration: '32', stem_direction: -1 },
        { positions: [{ str: 6, fret: 6 }], duration: '16', stem_direction: 1 },
        { positions: [{ str: 6, fret: 6 }], duration: '16', stem_direction: 1 },
        { positions: [{ str: 6, fret: 6 }], duration: '16', stem_direction: 1 },
        { positions: [{ str: 6, fret: 6 }], duration: '16', stem_direction: -1 },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = vf.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      // Stems should format down
      vf.Beam({ notes: notes.slice(0, 8), options: { autoStem: true } });
      // Stems should format up
      vf.Beam({ notes: notes.slice(8, 12), options: { autoStem: true } });

      var voice = vf.Voice().setMode(VF.Voice.Mode.SOFT).addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'All objects have been drawn');
    },

    complexWithAnnotation: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 200);
      var stave = vf.Stave({ y: 40 });

      var notes = [
        { keys: ['e/4'], duration: '128', stem_direction: 1 },
        { keys: ['d/4'], duration: '16', stem_direction: 1 },
        { keys: ['e/4'], duration: '8', stem_direction: 1 },
        { keys: ['c/4', 'g/4'], duration: '32', stem_direction: 1 },
        { keys: ['c/4'], duration: '32', stem_direction: 1 },
        { keys: ['c/4'], duration: '32', stem_direction: 1 },
        { keys: ['c/4'], duration: '32', stem_direction: 1 },
      ];

      var notes2 = [
        { keys: ['e/5'], duration: '128', stem_direction: -1 },
        { keys: ['d/5'], duration: '16', stem_direction: -1 },
        { keys: ['e/5'], duration: '8', stem_direction: -1 },
        { keys: ['c/5', 'g/5'], duration: '32', stem_direction: -1 },
        { keys: ['c/5'], duration: '32', stem_direction: -1 },
        { keys: ['c/5'], duration: '32', stem_direction: -1 },
        { keys: ['c/5'], duration: '32', stem_direction: -1 },
      ];

      notes = notes.map(function(note) {
        return vf.StaveNote(note).addModifier(0, vf.Annotation({ text: '1', vJustify: 'above' }));
      });

      notes2 = notes2.map(function(note) {
        return vf.StaveNote(note).addModifier(0, vf.Annotation({ text: '3', vJustify: 'below' }));
      });

      vf.Beam({ notes: notes });
      vf.Beam({ notes: notes2 });

      var voice = vf.Voice()
        .setMode(VF.Voice.Mode.SOFT)
        .addTickables(notes)
        .addTickables(notes2);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave, { stave: stave });

      vf.draw();

      ok(true, 'Complex beam annotations');
    },

    complexWithArticulation: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 200);
      var stave = vf.Stave({ y: 40 });

      var notes = [
        { keys: ['e/4'], duration: '128', stem_direction: 1 },
        { keys: ['d/4'], duration: '16', stem_direction: 1 },
        { keys: ['e/4'], duration: '8', stem_direction: 1 },
        { keys: ['c/4', 'g/4'], duration: '32', stem_direction: 1 },
        { keys: ['c/4'], duration: '32', stem_direction: 1 },
        { keys: ['c/4'], duration: '32', stem_direction: 1 },
        { keys: ['c/4'], duration: '32', stem_direction: 1 },
      ];

      var notes2 = [
        { keys: ['e/5'], duration: '128', stem_direction: -1 },
        { keys: ['d/5'], duration: '16', stem_direction: -1 },
        { keys: ['e/5'], duration: '8', stem_direction: -1 },
        { keys: ['c/5', 'g/5'], duration: '32', stem_direction: -1 },
        { keys: ['c/5'], duration: '32', stem_direction: -1 },
        { keys: ['c/5'], duration: '32', stem_direction: -1 },
        { keys: ['c/5'], duration: '32', stem_direction: -1 },
      ];

      notes = notes.map(function(note) {
        return vf.StaveNote(note).addModifier(0, vf.Articulation({ type: 'am', position: 'above' }));
      });

      notes2 = notes2.map(function(note) {
        return vf.StaveNote(note).addModifier(0, vf.Articulation({ type: 'a>', position: 'below' }));
      });

      vf.Beam({ notes: notes });
      vf.Beam({ notes: notes2 });

      var voice = vf.Voice()
        .setMode(VF.Voice.Mode.SOFT)
        .addTickables(notes)
        .addTickables(notes2);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave, { stave: stave });

      vf.draw();

      ok(true, 'Complex beam articulations');
    },
  };

  return Beam;
})();

/**
 * VexFlow - Accidental Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Bend = (function() {
  var Bend = {
    Start: function() {
      QUnit.module('Bend');
      VF.Test.runTests('Double Bends', VF.Test.Bend.doubleBends);
      VF.Test.runTests('Reverse Bends', VF.Test.Bend.reverseBends);
      VF.Test.runTests('Bend Phrase', VF.Test.Bend.bendPhrase);
      VF.Test.runTests('Double Bends With Release',
        VF.Test.Bend.doubleBendsWithRelease);
      VF.Test.runTests('Whako Bend', VF.Test.Bend.whackoBends);
    },

    doubleBends: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.setRawFont(' 10pt Arial');
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 10 }, { str: 4, fret: 9 }], duration: 'q',
        })
          .addModifier(newBend('Full'), 0)
          .addModifier(newBend('1/2'), 1),

        newNote({
          positions: [{ str: 2, fret: 5 }, { str: 3, fret: 5 }], duration: 'q',
        })
          .addModifier(newBend('1/4'), 0)
          .addModifier(newBend('1/4'), 1),

        newNote({
          positions: [{ str: 4, fret: 7 }], duration: 'h',
        }),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      notes.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 140);
      });

      ok(true, 'Double Bends');
    },

    doubleBendsWithRelease: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 550, 240);
      ctx.scale(1.0, 1.0);
      ctx.setBackgroundFillStyle('#FFF');
      ctx.setFont('Arial', VF.Test.Font.size);
      var stave = new VF.TabStave(10, 10, 550)
        .addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text, release) { return new VF.Bend(text, release); }

      var notes = [
        newNote({
          positions: [{ str: 1, fret: 10 }, { str: 4, fret: 9 }], duration: 'q',
        })
          .addModifier(newBend('1/2', true), 0)
          .addModifier(newBend('Full', true), 1),

        newNote({
          positions: [{ str: 2, fret: 5 },
            { str: 3, fret: 5 },
            { str: 4, fret: 5 }], duration: 'q',
        })
          .addModifier(newBend('1/4', true), 0)
          .addModifier(newBend('Monstrous', true), 1)
          .addModifier(newBend('1/4', true), 2),

        newNote({
          positions: [{ str: 4, fret: 7 }], duration: 'q',
        }),
        newNote({
          positions: [{ str: 4, fret: 7 }], duration: 'q',
        }),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      notes.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 140);
      });
      ok(true, 'Bend Release');
    },

    reverseBends: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 500, 240);

      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.setRawFont('10pt Arial');
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 10 }, { str: 4, fret: 9 }], duration: 'w',
        })
          .addModifier(newBend('Full'), 1)
          .addModifier(newBend('1/2'), 0),

        newNote({
          positions: [{ str: 2, fret: 5 }, { str: 3, fret: 5 }], duration: 'w',
        })
          .addModifier(newBend('1/4'), 1)
          .addModifier(newBend('1/4'), 0),

        newNote({
          positions: [{ str: 4, fret: 7 }], duration: 'w',
        }),
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var mc = new VF.ModifierContext();
        note.addToModifierContext(mc);

        var tickContext = new VF.TickContext();
        tickContext.addTickable(note).preFormat().setX(75 * i);

        note.setStave(stave).setContext(ctx).draw();
        VF.Test.plotNoteWidth(ctx, note, 140);
        ok(true, 'Bend ' + i);
      }
    },

    bendPhrase: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.setRawFont(' 10pt Arial');
      var stave = new VF.TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(phrase) { return new VF.Bend(null, null, phrase); }

      var phrase1 = [
        { type: VF.Bend.UP, text: 'Full' },
        { type: VF.Bend.DOWN, text: 'Monstrous' },
        { type: VF.Bend.UP, text: '1/2' },
        { type: VF.Bend.DOWN, text: '' },
      ];
      var bend1 = newBend(phrase1).setContext(ctx);

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 10 }], duration: 'w',
        })
          .addModifier(bend1, 0),
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var mc = new VF.ModifierContext();
        note.addToModifierContext(mc);

        var tickContext = new VF.TickContext();
        tickContext.addTickable(note).preFormat().setX(75 * i);

        note.setStave(stave).setContext(ctx).draw();
        VF.Test.plotNoteWidth(ctx, note, 140);
        ok(true, 'Bend ' + i);
      }
    },

    whackoBends: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 240);
      ctx.scale(1.0, 1.0); ctx.setBackgroundFillStyle('#FFF');
      ctx.setFont('Arial', VF.Test.Font.size);
      var stave = new VF.TabStave(10, 10, 350).addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(phrase) { return new VF.Bend(null, null, phrase); }

      var phrase1 = [
        { type: VF.Bend.UP, text: 'Full' },
        { type: VF.Bend.DOWN, text: '' },
        { type: VF.Bend.UP, text: '1/2' },
        { type: VF.Bend.DOWN, text: '' },
      ];

      var phrase2 = [
        { type: VF.Bend.UP, text: 'Full' },
        { type: VF.Bend.UP, text: 'Full' },
        { type: VF.Bend.UP, text: '1/2' },
        { type: VF.Bend.DOWN, text: '' },
        { type: VF.Bend.DOWN, text: 'Full' },
        { type: VF.Bend.DOWN, text: 'Full' },
        { type: VF.Bend.UP, text: '1/2' },
        { type: VF.Bend.DOWN, text: '' },
      ];

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 10 }, { str: 3, fret: 9 }], duration: 'q',
        })
          .addModifier(newBend(phrase1), 0)
          .addModifier(newBend(phrase2), 1),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      VF.Test.plotNoteWidth(ctx, notes[0], 140);
      ok(true, 'Whako Release');
    },
  };

  return Bend;
})();

/**
 * VexFlow - Bounding Box Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.BoundingBox = (function() {
  var BoundingBox = {
    Start: function() {
      QUnit.module('BoundingBox');
      test('Initialization Test', VF.Test.BoundingBox.initialization);
      test('Merging Text', VF.Test.BoundingBox.merging);
    },

    initialization: function() {
      var bb = new VF.BoundingBox(4, 5, 6, 7);
      equal(bb.getX(), 4, 'Bad X');
      equal(bb.getY(), 5, 'Bad Y');
      equal(bb.getW(), 6, 'Bad W');
      equal(bb.getH(), 7, 'Bad H');

      bb.setX(5);
      equal(bb.getX(), 5, 'Bad X');
    },

    merging: function() {
      var tests = [
        {
          type: 'Intersection',
          bb1: new VF.BoundingBox(10, 10, 10, 10),
          bb2: new VF.BoundingBox(15, 20, 10, 10),
          merged: new VF.BoundingBox(10, 10, 15, 20),
        },
        {
          type: '1 contains 2',
          bb1: new VF.BoundingBox(10, 10, 30, 30),
          bb2: new VF.BoundingBox(15, 15, 10, 10),
          merged: new VF.BoundingBox(10, 10, 30, 30),
        },
        {
          type: '2 contains 1',
          bb1: new VF.BoundingBox(15, 15, 10, 10),
          bb2: new VF.BoundingBox(10, 10, 30, 30),
          merged: new VF.BoundingBox(10, 10, 30, 30),
        },
      ];

      tests.forEach(function(test) {
        const type = test.type;
        const bb1 = test.bb1;
        const bb2 = test.bb2;
        const merged = test.merged;

        bb1.mergeWith(bb2);
        equal(bb1.getX(), merged.getX(), type + ' - Bad X');
        equal(bb1.getY(), merged.getY(), type + ' - Bad Y');
        equal(bb1.getW(), merged.getW(), type + ' - Bad W');
        equal(bb1.getH(), merged.getH(), type + ' - Bad H');
      });
    },
  };

  return BoundingBox;
})();

/**
 * VexFlow - Clef Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Clef = (function() {
  var Clef = {
    Start: function() {
      QUnit.module('Clef');
      VF.Test.runTests('Clef Test', VF.Test.Clef.draw);
      VF.Test.runTests('Clef End Test', VF.Test.Clef.drawEnd);
      VF.Test.runTests('Small Clef Test', VF.Test.Clef.drawSmall);
      VF.Test.runTests('Small Clef End Test', VF.Test.Clef.drawSmallEnd);
      VF.Test.runTests('Clef Change Test', VF.Test.Clef.drawClefChange);
    },

    draw: function(options) {
      var vf = VF.Test.makeFactory(options, 800, 120);

      vf.Stave()
        .addClef('treble')
        .addClef('treble', 'default', '8va')
        .addClef('treble', 'default', '8vb')
        .addClef('alto')
        .addClef('tenor')
        .addClef('soprano')
        .addClef('bass')
        .addClef('bass', 'default', '8vb')
        .addClef('mezzo-soprano')
        .addClef('baritone-c')
        .addClef('baritone-f')
        .addClef('subbass')
        .addClef('percussion')
        .addClef('french')
        .addEndClef('treble');

      vf.draw();

      ok(true, 'all pass');
    },

    drawEnd: function(options) {
      var vf = VF.Test.makeFactory(options, 800, 120);

      vf.Stave()
        .addClef('bass')
        .addEndClef('treble')
        .addEndClef('treble', 'default', '8va')
        .addEndClef('treble', 'default', '8vb')
        .addEndClef('alto')
        .addEndClef('tenor')
        .addEndClef('soprano')
        .addEndClef('bass')
        .addEndClef('bass', 'default', '8vb')
        .addEndClef('mezzo-soprano')
        .addEndClef('baritone-c')
        .addEndClef('baritone-f')
        .addEndClef('subbass')
        .addEndClef('percussion')
        .addEndClef('french');

      vf.draw();

      ok(true, 'all pass');
    },


    drawSmall: function(options) {
      var vf = VF.Test.makeFactory(options, 800, 120);

      vf.Stave()
        .addClef('treble', 'small')
        .addClef('treble', 'small', '8va')
        .addClef('treble', 'small', '8vb')
        .addClef('alto', 'small')
        .addClef('tenor', 'small')
        .addClef('soprano', 'small')
        .addClef('bass', 'small')
        .addClef('bass', 'small', '8vb')
        .addClef('mezzo-soprano', 'small')
        .addClef('baritone-c', 'small')
        .addClef('baritone-f', 'small')
        .addClef('subbass', 'small')
        .addClef('percussion', 'small')
        .addClef('french', 'small')
        .addEndClef('treble', 'small');

      vf.draw();

      ok(true, 'all pass');
    },

    drawSmallEnd: function(options) {
      var vf = VF.Test.makeFactory(options, 800, 120);

      vf.Stave()
        .addClef('bass', 'small')
        .addEndClef('treble', 'small')
        .addEndClef('treble', 'small', '8va')
        .addEndClef('treble', 'small', '8vb')
        .addEndClef('alto', 'small')
        .addEndClef('tenor', 'small')
        .addEndClef('soprano', 'small')
        .addEndClef('bass', 'small')
        .addEndClef('bass', 'small', '8vb')
        .addEndClef('mezzo-soprano', 'small')
        .addEndClef('baritone-c', 'small')
        .addEndClef('baritone-f', 'small')
        .addEndClef('subbass', 'small')
        .addEndClef('percussion', 'small')
        .addEndClef('french', 'small');

      vf.draw();

      ok(true, 'all pass');
    },

    drawClefChange: function(options) {
      var vf = VF.Test.makeFactory(options, 800, 180);
      var stave = vf.Stave().addClef('treble');

      var notes = [
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
        vf.ClefNote({ type: 'alto', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'alto' }),
        vf.ClefNote({ type: 'tenor', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'tenor' }),
        vf.ClefNote({ type: 'soprano', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'soprano' }),
        vf.ClefNote({ type: 'bass', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'bass' }),
        vf.ClefNote({ type: 'mezzo-soprano', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'mezzo-soprano' }),
        vf.ClefNote({ type: 'baritone-c', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'baritone-c' }),
        vf.ClefNote({ type: 'baritone-f', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'baritone-f' }),
        vf.ClefNote({ type: 'subbass', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'subbass' }),
        vf.ClefNote({ type: 'french', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'french' }),
        vf.ClefNote({ type: 'treble', options: { size: 'small', annotation: '8vb' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble', octave_shift: -1 }),
        vf.ClefNote({ type: 'treble', options: { size: 'small', annotation: '8va' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble', octave_shift: 1 }),
      ];

      var voice = vf.Voice({ time: '12/4' }).addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'all pass');
    },
  };

  return Clef;
})();

/**
 * VexFlow - Curve Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.Curve = (function() {
  function concat(a, b) { return a.concat(b); }

  function createTest(beamGroup1, beamGroup2, setupCurves) {
    return function(options) {
      var vf = VF.Test.makeFactory(options, 350, 200);
      var stave = vf.Stave({ y: 50 });
      var score = vf.EasyScore();

      var notes = [
        score.beam(score.notes.apply(score, beamGroup1)),
        score.beam(score.notes.apply(score, beamGroup2)),
      ].reduce(concat);

      setupCurves(vf, notes);

      var voice = score.voice(notes, { time: '4/4' });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok('Simple Curve');
    };
  }

  return {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('Curve');

      run('Simple Curve', createTest(
        ['c4/8, f5, d5, g5', { stem: 'up' }],
        ['d6/8, f5, d5, g5', { stem: 'down' }],
        function(vf, notes) {
          vf.Curve({
            from: notes[0],
            to: notes[3],
            options: {
              cps: [{ x: 0, y: 10 }, { x: 0, y: 50 }],
            },
          });

          vf.Curve({
            from: notes[4],
            to: notes[7],
            options: {
              cps: [{ x: 0, y: 10 }, { x: 0, y: 20 }],
            },
          });
        }
      ));

      run('Rounded Curve', createTest(
        ['c5/8, f4, d4, g5', { stem: 'up' }],
        ['d5/8, d6, d6, g5', { stem: 'down' }],
        function(vf, notes) {
          vf.Curve({
            from: notes[0],
            to: notes[3],
            options: {
              x_shift: -10,
              y_shift: 30,
              cps: [{ x: 0, y: 20 }, { x: 0, y: 50 }],
            },
          });

          vf.Curve({
            from: notes[4],
            to: notes[7],
            options: {
              cps: [{ x: 0, y: 50 }, { x: 0, y: 50 }],
            },
          });
        }
      ));

      run('Thick Thin Curves', createTest(
        ['c5/8, f4, d4, g5', { stem: 'up' }],
        ['d5/8, d6, d6, g5', { stem: 'down' }],
        function(vf, notes) {
          vf.Curve({
            from: notes[0],
            to: notes[3],
            options: {
              thickness: 10,
              x_shift: -10,
              y_shift: 30,
              cps: [{ x: 0, y: 20 }, { x: 0, y: 50 }],
            },
          });

          vf.Curve({
            from: notes[4],
            to: notes[7],
            options: {
              thickness: 0,
              cps: [{ x: 0, y: 50 }, { x: 0, y: 50 }],
            },
          });
        }
      ));

      run('Top Curve', createTest(
        ['c5/8, f4, d4, g5', { stem: 'up' }],
        ['d5/8, d6, d6, g5', { stem: 'down' }],
        function(vf, notes) {
          vf.Curve({
            from: notes[0],
            to: notes[7],
            options: {
              x_shift: -3,
              y_shift: 10,
              position: VF.Curve.Position.NEAR_TOP,
              position_end: VF.Curve.Position.NEAR_HEAD,
              cps: [{ x: 0, y: 20 }, { x: 40, y: 80 }],
            },
          });
        }
      ));
    },
  };
})();

/**
 * VexFlow - Dot Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Dot = (function() {
  function showNote(note, stave, ctx, x) {
    note
      .setStave(stave)
      .addToModifierContext(new VF.ModifierContext());

    new VF.TickContext()
      .addTickable(note)
      .preFormat()
      .setX(x);

    note.setContext(ctx).draw();

    VF.Test.plotNoteWidth(ctx, note, 140);

    return note;
  }

  function showNotes(note1, note2, stave, ctx, x) {
    var modifierContext = new VF.ModifierContext();
    note1.setStave(stave).addToModifierContext(modifierContext);
    note2.setStave(stave).addToModifierContext(modifierContext);

    new VF.TickContext()
      .addTickable(note1)
      .addTickable(note2)
      .setX(x)
      .preFormat();

    note1.setContext(ctx).draw();
    note2.setContext(ctx).draw();

    VF.Test.plotNoteWidth(ctx, note1, 180);
    VF.Test.plotNoteWidth(ctx, note2, 20);
  }

  var Dot = {
    Start: function() {
      QUnit.module('Dot');
      VF.Test.runTests('Basic', VF.Test.Dot.basic);
      VF.Test.runTests('Multi Voice', VF.Test.Dot.multiVoice);
    },

    basic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 1000, 240);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new VF.Stave(10, 10, 975);
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'a/4', 'b/4'], duration: 'w' })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['a/4', 'b/4', 'c/5'], duration: '4', stem_direction: 1 })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['g/4', 'a/4', 'b/4'], duration: '4', stem_direction: -1 })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['e/4', 'f/4', 'b/4', 'c/5'], duration: '4' })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['g/4', 'a/4', 'd/5', 'e/5', 'g/5'], duration: '4', stem_direction: -1 })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['g/4', 'b/4', 'd/5', 'e/5'], duration: '4', stem_direction: -1 })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['e/4', 'g/4', 'b/4', 'c/5'], duration: '4', stem_direction: 1 })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
          .addDotToAll()
          .addDotToAll(),
        new VF.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16', stem_direction: -1 })
          .addDotToAll()
          .addDotToAll()
          .addDotToAll(),
        new VF.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16', stem_direction: 1 })
          .addDotToAll()
          .addDotToAll()
          .addDotToAll(),
        new VF.StaveNote({ keys: ['e/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'f/5'], duration: '16', stem_direction: 1 })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['e/4', 'g/4', 'a/4', 'b/4', 'c/5'], duration: '16', stem_direction: 1 })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['e/4', 'a/4', 'b/4', 'c/5'], duration: '16', stem_direction: 1 })
          .addDotToAll(),
      ];

      var beam = new VF.Beam(notes.slice(notes.length - 2));

      for (var i = 0; i < notes.length; i++) {
        showNote(notes[i], stave, ctx, 30 + (i * 65));
        var dots = notes[i].getDots();
        ok(dots.length > 0, 'Note ' + i + ' has dots');

        for (var j = 0; j < dots.length; ++j) {
          ok(dots[j].width > 0, 'Dot ' + j + ' has width set');
        }
      }

      beam.setContext(ctx).draw();

      VF.Test.plotLegendForNoteWidth(ctx, 890, 140);

      ok(true, 'Full Dot');
    },

    multiVoice: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 750, 300);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new VF.Stave(30, 40, 700).setContext(ctx).draw();

      var note1 = new VF.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '2', stem_direction: -1 })
        .addDotToAll()
        .addDotToAll();

      var note2 = new VF.StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '2', stem_direction: 1 })
        .addDotToAll();

      showNotes(note1, note2, stave, ctx, 60);

      note1 = new VF.StaveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: '2', stem_direction: -1 })
        .addDot(0)
        .addDot(0)
        .addDot(1)
        .addDot(1)
        .addDot(2)
        .addDot(2)
        .addDot(2);

      note2 = new VF.StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
        .addDotToAll()
        .addDotToAll();

      showNotes(note1, note2, stave, ctx, 150);

      note1 = new VF.StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '2', stem_direction: -1 })
        .addDotToAll()
        .addDotToAll()
        .addDot(0);

      note2 = new VF.StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
        .addDotToAll();

      showNotes(note1, note2, stave, ctx, 250);

      note1 = new VF.StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '8', stem_direction: -1 })
        .addDotToAll()
        .addDotToAll()
        .addDot(0);

      note2 = new VF.StaveNote({ keys: ['d/5', 'g/5', 'a/5', 'b/5'], duration: '8', stem_direction: 1 })
        .addDotToAll();

      showNotes(note1, note2, stave, ctx, 350);

      note1 = new VF.StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '8', stem_direction: -1 })
        .addDotToAll()
        .addDotToAll()
        .addDot(0);

      note2 = new VF.StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '8', stem_direction: 1 })
        .addDotToAll();

      showNotes(note1, note2, stave, ctx, 450);

      VF.Test.plotLegendForNoteWidth(ctx, 620, 180);

      ok(true, 'Full Dot');
    },
  };

  return Dot;
})();

/**
 * VexFlow - EasyScore Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.EasyScore = (function() {
  var EasyScore = {
    Start: function() {
      QUnit.module('EasyScore');
      var VFT = Vex.Flow.Test;
      QUnit.test('Basic', VFT.EasyScore.basic);
      QUnit.test('Accidentals', VFT.EasyScore.accidentals);
      QUnit.test('Durations', VFT.EasyScore.durations);
      QUnit.test('Chords', VFT.EasyScore.chords);
      QUnit.test('Dots', VFT.EasyScore.dots);
      QUnit.test('Options', VFT.EasyScore.options);
      VFT.runTests('Draw Basic', VFT.EasyScore.drawBasicTest);
      VFT.runTests('Draw Accidentals', VFT.EasyScore.drawAccidentalsTest);
      VFT.runTests('Draw Beams', VFT.EasyScore.drawBeamsTest);
      VFT.runTests('Draw Tuplets', VFT.EasyScore.drawTupletsTest);
      VFT.runTests('Draw Options', VFT.EasyScore.drawOptionsTest);
    },

    basic: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = ['c4', 'c#4', 'c4/r', 'c#5', 'c3/x', 'c3//x'];
      var mustFail = ['', '()', '7', '(c#4 e5 g6'];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    accidentals: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = [
        'c3', 'c##3, cb3', 'Cn3', 'f3//x', '(c##3 cbb3 cn3), cb3',
        'cbbs7', 'cbb7', 'cbss7', 'cbs7', 'cb7', 'cdb7', 'cd7', 'c##7', 'c#7', 'cn7', 'c++-7',
        'c++7', 'c+-7', 'c+7', '(cbs3 bbs3 dbs3), ebs3', '(cd7 cbb3 cn3), cb3', 'co7', 'ck7',
      ];
      var mustFail = [
        'ct3', 'cdbb7', '(cq cbb3 cn3), cb3', '(cdd7 cbb3 cn3), cb3',
        'cbbbs7', 'cbbss7', 'cbsss7', 'csbs7', 'cddb7', 'cddbb7', 'cdd7', 'c##b7', 'c#bs7',
        'cnb#7', 'c+#+b-d7', 'c+--7', 'c++--7', 'c+++7', 'cbk7', 'cok7', 'cko7', 'c#s7',
      ];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    durations: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = ['c3/4', 'c##3/w, cb3', 'c##3/w, cb3/q', 'c##3/q, cb3/32', '(c##3 cbb3 cn3), cb3'];
      var mustFail = ['Cn3/]', '/', '(cq cbb3 cn3), cb3', '(cdd7 cbb3 cn3), cb3'];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    chords: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = [
        '(c5)', '(c3 e0 g9)',
        '(c##4 cbb4 cn4)/w, (c#5 cb2 a3)/32',
        '(d##4 cbb4 cn4)/w/r, (c#5 cb2 a3)',
        '(c##4 cbb4 cn4)/4, (c#5 cb2 a3)',
        '(c##4 cbb4 cn4)/x, (c#5 cb2 a3)',
      ];
      var mustFail = ['(c)'];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    dots: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = [
        'c3/4.',
        'c##3/w.., cb3',
        'f##3/s, cb3/q...',
        'c##3/q, cb3/32',
        '(c##3 cbb3 cn3)., cb3',
        '(c5).',
        '(c##4 cbb4 cn4)/w.., (c#5 cb2 a3)/32',
      ];
      var mustFail = ['.', 'c.#', 'c#4./4'];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    types: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = [
        'c3/4/x.',
        'c##3//r.., cb3',
        'c##3/x.., cb3',
        'c##3/r.., cb3',
        'd##3/w/s, cb3/q...',
        'c##3/q, cb3/32',
        '(c##3 cbb3 cn3)., cb3',
        '(c5).',
        '(c##4 cbb4 cn4)/w.., (c#5 cb2 a3)/32',
      ];
      var mustFail = ['c4/q/U', '(c##4, cbb4 cn4)/w.., (c#5 cb2 a3)/32'];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    options: function(assert) {
      var score = new VF.EasyScore();
      var mustPass = [
        'c3/4.[foo="bar"]',
        'c##3/w.., cb3[id="blah"]',
        'c##3/q, cb3/32',
        '(c##3 cbb3 cn3).[blah="bod4o"], cb3',
        '(c5)[fooooo="booo"]',
        'c#5[id="foobar"]',
      ];
      var mustFail = ['.[', 'f##3/w[], cb3/q...'];

      mustPass.forEach(function(line) { assert.equal(score.parse(line).success, true, line); });
      mustFail.forEach(function(line) { assert.equal(score.parse(line).success, false, line); });
    },

    drawBasicTest: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 350);
      var score = vf.EasyScore();
      var system = vf.System();

      var voice = score.voice.bind(score);
      var notes = score.notes.bind(score);

      system.addStave({
        voices: [
          voice(notes('(d4 e4 g4)/q, c4/q, c4/q/r, c4/q', { stem: 'down' })),
          voice(notes('c#5/h., c5/q', { stem: 'up' })),
        ],
      }).addClef('treble');

      system.addStave({
        voices: [voice(notes('c#3/q, cn3/q, bb3/q, d##3/q', { clef: 'bass' }))],
      }).addClef('bass');
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();
      expect(0);
    },

    drawAccidentalsTest: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 350);
      var score = vf.EasyScore();
      var system = vf.System();

      var voice = score.voice.bind(score);
      var notes = score.notes.bind(score);

      system.addStave({
        voices: [
          voice(notes('(cbbs4 ebb4 gbss4)/q, cbs4/q, cdb4/q/r, cd4/q', { stem: 'down' })),
          voice(notes('c++-5/h., c++5/q', { stem: 'up' })),
        ],
      }).addClef('treble');

      system.addStave({
        voices: [voice(notes('c+-3/q, c+3/q, bb3/q, d##3/q', { clef: 'bass' }))],
      }).addClef('bass');
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();
      expect(0);
    },

    drawBeamsTest: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 250);
      const score = vf.EasyScore();
      const system = vf.System();

      var voice = score.voice.bind(score);
      var notes = score.notes.bind(score);
      var beam = score.beam.bind(score);

      system.addStave({
        voices: [
          voice(notes('(c4 e4 g4)/q, c4/q, c4/q/r, c4/q', { stem: 'down' })),
          voice(notes('c#5/h.', { stem: 'up' }).concat(beam(notes('c5/8, c5/8', { stem: 'up' })))),
        ],
      }).addClef('treble');

      vf.draw();
      expect(0);
    },

    drawTupletsTest: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 250);
      const score = vf.EasyScore();
      const system = vf.System();

      var voice = score.voice.bind(score);
      var notes = score.notes.bind(score);
      var tuplet = score.tuplet.bind(score);
      var beam = score.beam.bind(score);

      system.addStave({
        voices: [
          voice(
            tuplet(
              notes('(c4 e4 g4)/q, cbb4/q, c4/q', { stem: 'down' }),
              { location: VF.Tuplet.LOCATION_BOTTOM }
            ).concat(notes('c4/h', { stem: 'down' }))
          ),
          voice(
            notes('c#5/h.', { stem: 'up' })
              .concat(tuplet(beam(notes('cb5/8, cn5/8, c5/8', { stem: 'up' }))))
          ),
        ],
      }).addClef('treble');

      vf.draw();
      expect(0);
    },

    drawOptionsTest: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 200);
      const score = vf.EasyScore();
      const system = vf.System();

      const notes = score.notes('B4/h[id="foobar", class="red,bold", stem="up", articulations="staccato.below,tenuto"], B4/h[stem="down"]');

      system.addStave({
        voices: [score.voice(notes)],
      });

      vf.draw();

      const assert = options.assert;
      assert.equal(notes[0].getAttribute('id'), 'foobar');
      assert.ok(notes[0].hasClass('red'));
      assert.ok(notes[0].hasClass('bold'));
      assert.equal(notes[0].modifiers[0].getCategory(), 'articulations');
      assert.equal(notes[0].modifiers[0].type, 'a.');
      assert.equal(notes[0].modifiers[0].position, VF.Modifier.Position.BELOW);
      assert.equal(notes[0].modifiers[1].getCategory(), 'articulations');
      assert.equal(notes[0].modifiers[1].type, 'a-');
      assert.equal(notes[0].modifiers[1].position, VF.Modifier.Position.ABOVE);
      assert.equal(notes[0].getStemDirection(), VF.StaveNote.STEM_UP);
      assert.equal(notes[1].getStemDirection(), VF.StaveNote.STEM_DOWN);
    },
  };

  return EasyScore;
})();

/**
 * VexFlow - Factory Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Factory = (function() {
  var Factory = {
    Start: function() {
      QUnit.module('Factory');
      var VFT = Vex.Flow.Test;

      QUnit.test('Defaults', VFT.Factory.defaults);
      VFT.runSVGTest('Draw', VFT.Factory.draw);
      VFT.runSVGTest('Draw Tab (repeat barlines must be aligned)', VFT.Factory.drawTab);
    },

    defaults: function(assert) {
      assert.throws(function() {
        return new VF.Factory({
          renderer: {
            width: 700,
            height: 500,
          },
        });
      });

      var vf = new VF.Factory({
        renderer: {
          elementId: null,
          width: 700,
          height: 500,
        },
      });

      var options = vf.getOptions();
      assert.equal(options.renderer.width, 700);
      assert.equal(options.renderer.height, 500);
      assert.equal(options.renderer.elementId, null);
      assert.equal(options.stave.space, 10);
    },

    draw: function(options) {
      var vf = VF.Factory.newFromElementId(options.elementId);
      vf.Stave().setClef('treble');
      vf.draw();
      expect(0);
    },

    drawTab: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 400);

      var system = vf.System();

      var stave = vf.Stave()
        .setClef('treble')
        .setKeySignature('C#')
        .setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);

      var voices = [
        vf.Voice().addTickables([
          vf.GhostNote({ duration: 'w' })
        ])
      ];

      system.addStave({
        stave: stave,
        voices: voices
      });

      var tabStave = vf.TabStave()
        .setClef('tab')
        .setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);

      var tabVoices = [
        vf.Voice().addTickables([
          vf.GhostNote({ duration: 'w' })
        ])
      ];

      system.addStave({
        stave: tabStave,
        voices: tabVoices
      });

      vf.draw();
      equal(stave.getModifiers()[0].getX(), tabStave.getModifiers()[0].getX());
      expect(1);
    },
  };

  return Factory;
})();

/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Formatter = (function() {
  var run = VF.Test.runTests;
  var runSVG = VF.Test.runSVGTest;

  var Formatter = {
    Start: function() {
      QUnit.module('Formatter');
      test('TickContext Building', Formatter.buildTickContexts);
      runSVG('StaveNote - No Justification', Formatter.formatStaveNotes);
      runSVG('StaveNote - Justification', Formatter.justifyStaveNotes);
      runSVG('Notes with Tab', Formatter.notesWithTab);
      runSVG('Multiple Staves - No Justification', Formatter.multiStaves, { justify: false, iterations: 0, debug: true });
      runSVG('Multiple Staves - Justified', Formatter.multiStaves, { justify: true, iterations: 0 });
      runSVG('Multiple Staves - Justified - 6 Iterations', Formatter.multiStaves, { justify: true, iterations: 4, alpha: 0.01 });
      runSVG('Softmax', Formatter.softMax);
      runSVG('Mixtime', Formatter.mixTime);
      runSVG('Tight', Formatter.tightNotes);
      runSVG('Tight 2', Formatter.tightNotes2);
      runSVG('Annotations', Formatter.annotations);
      runSVG('Proportional Formatting - No Justification', Formatter.proportionalFormatting, { justify: false, debug: true, iterations: 0 });
      run('Proportional Formatting - No Tuning', Formatter.proportionalFormatting, { debug: true, iterations: 0 });

      VF.Test.runSVGTest('Proportional Formatting (20 iterations)',
        Formatter.proportionalFormatting,
        { debug: true, iterations: 20, alpha: 0.5 }
      );
    },

    buildTickContexts: function() {
      function createTickable() {
        return new VF.Test.MockTickable();
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables1 = [
        createTickable().setTicks(BEAT).setWidth(10),
        createTickable().setTicks(BEAT * 2).setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30),
      ];

      var tickables2 = [
        createTickable().setTicks(BEAT * 2).setWidth(10),
        createTickable().setTicks(BEAT).setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30),
      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      voice1.addTickables(tickables1);
      voice2.addTickables(tickables2);

      var formatter = new VF.Formatter();
      var tContexts = formatter.createTickContexts([voice1, voice2]);

      equal(tContexts.list.length, 4, 'Voices should have four tick contexts');

      // TODO: add this after pull request #68 is merged to master
      // throws(
      //   function() { formatter.getMinTotalWidth(); },
      //   Vex.RERR,
      //   "Expected to throw exception"
      // );

      ok(formatter.preCalculateMinTotalWidth([voice1, voice2]), 'Successfully runs preCalculateMinTotalWidth');
      equal(formatter.getMinTotalWidth(), 88, 'Get minimum total width without passing voices');

      formatter.preFormat();

      equal(formatter.getMinTotalWidth(), 88, 'Minimum total width');
      equal(tickables1[0].getX(), tickables2[0].getX(), 'First notes of both voices have the same X');
      equal(tickables1[2].getX(), tickables2[2].getX(), 'Last notes of both voices have the same X');
      ok(tickables1[1].getX() < tickables2[1].getX(), 'Second note of voice 2 is to the right of the second note of voice 1');
    },

    formatStaveNotes: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 280);
      var score = vf.EasyScore();

      vf.Stave({ y: 50 });

      var notes1 = score.notes(
        '(cb4 e#4 a4)/2, (d4 e4 f4)/4, (cn4 f#4 a4)',
        { stem: 'down' }
      );
      var notes2 = score.notes(
        '(cb5 e#5 a5)/2, (d5 e5 f5)/4, (cn5 f#5 a5)',
        { stem: 'up' }
      );

      var voices = [notes1, notes2].map(score.voice.bind(score));

      vf.Formatter()
        .joinVoices(voices)
        .format(voices);

      vf.draw();

      var ctx = vf.getContext();

      notes1.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 190);
      });

      notes2.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 35);
      });

      VF.Test.plotLegendForNoteWidth(ctx, 300, 180);

      ok(true);
    },

    justifyStaveNotes: function(options) {
      var vf = VF.Test.makeFactory(options, 420, 580);
      var ctx = vf.getContext();
      var score = vf.EasyScore();

      var y = 30;
      function justifyToWidth(width) {
        vf.Stave({ y: y }).addTrebleGlyph();

        var voices = [
          score.voice(score.notes(
            '(cbb4 en4 a4)/2, (d4 e4 f4)/8, (d4 f4 a4)/8, (cn4 f#4 a4)/4',
            { stem: 'down' }
          )),
          score.voice(score.notes(
            '(bb4 e#5 a5)/4, (d5 e5 f5)/2, (c##5 fb5 a5)/4',
            { stem: 'up' }
          )),
        ];

        vf.Formatter()
          .joinVoices(voices)
          .format(voices, width);

        voices[0].getTickables().forEach(function(note) {
          VF.Test.plotNoteWidth(ctx, note, y + 140);
        });

        voices[1].getTickables().forEach(function(note) {
          VF.Test.plotNoteWidth(ctx, note, y - 20);
        });
        y += 210;
      }

      justifyToWidth(0);
      justifyToWidth(300);
      justifyToWidth(400);

      vf.draw();

      ok(true);
    },

    notesWithTab: function(options) {
      var vf = VF.Test.makeFactory(options, 420, 580);
      var score = vf.EasyScore();

      var y = 10;
      function justifyToWidth(width) {
        var stave = vf.Stave({ y: y }).addTrebleGlyph();

        var voice = score.voice(score.notes(
          'd#4/2, (c4 d4)/8, d4/8, (c#4 e4 a4)/4',
          { stem: 'up' }
        ));

        y += 100;

        vf.TabStave({ y: y })
          .addTabGlyph()
          .setNoteStartX(stave.getNoteStartX());

        var tabVoice = score.voice([
          vf.TabNote({ positions: [{ str: 3, fret: 6 }], duration: '2' }).addModifier(new VF.Bend('Full'), 0),
          vf.TabNote({
            positions: [{ str: 2, fret: 3 },
              { str: 3, fret: 5 }], duration: '8',
          }).addModifier(new VF.Bend('Unison'), 1),
          vf.TabNote({ positions: [{ str: 3, fret: 7 }], duration: '8' }),
          vf.TabNote({
            positions: [{ str: 3, fret: 6 },
              { str: 4, fret: 7 },
              { str: 2, fret: 5 }], duration: '4',
          }),

        ]);

        vf.Formatter()
          .joinVoices([voice])
          .joinVoices([tabVoice])
          .format([voice, tabVoice], width);

        y += 150;
      }

      justifyToWidth(0);
      justifyToWidth(300);

      vf.draw();

      ok(true);
    },

    multiStaves: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 400);
      var score = vf.EasyScore();

      var stave11 = vf.Stave({ y: 20, width: 275 })
        .addTrebleGlyph()
        .addTimeSignature('6/8');

      var notes11 = score.notes('f4/4, d4/8, g4/4, eb4/8');
      var voice11 = score.voice(notes11, { time: '6/8' });

      var stave21 = vf.Stave({ y: 130, width: 275 })
        .addTrebleGlyph()
        .addTimeSignature('6/8');

      var notes21 = score.notes('d4/8, d4, d4, d4, e4, eb4');
      var voice21 = score.voice(notes21, { time: '6/8' });

      var stave31 = vf.Stave({ y: 250, width: 275 })
        .addClef('bass')
        .addTimeSignature('6/8');

      var notes31 = score.notes('a5/8, a5, a5, a5, a5, a5', { stem: 'down' });
      var voice31 = score.voice(notes31, { time: '6/8' });

      vf.StaveConnector({
        top_stave: stave21,
        bottom_stave: stave31,
        type: 'brace',
      });

      vf.Beam({ notes: notes21.slice(0, 3) });
      vf.Beam({ notes: notes21.slice(3, 6) });
      vf.Beam({ notes: notes31.slice(0, 3) });
      vf.Beam({ notes: notes31.slice(3, 6) });

      var formatter = vf.Formatter()
        .joinVoices([voice11])
        .joinVoices([voice21])
        .joinVoices([voice31]);

      if (options.params.justify) {
        formatter.formatToStave([voice11, voice21, voice31], stave11);
      } else {
        formatter.format([voice11, voice21, voice31], 0);
      }

      for (var i = 0; i < options.params.iterations; i++) {
        formatter.tune();
      }

      var stave12 = vf.Stave({
        x: stave11.width + stave11.x,
        y: stave11.y,
        width: stave11.width,
      });

      var notes12 = score.notes('ab4/4, bb4/8, (cb5 eb5)/4[stem="down"], d5/8[stem="down"]');
      var voice12 = score.voice(notes12, { time: '6/8' });

      vf.Stave({
        x: stave21.width + stave21.x,
        y: stave21.y,
        width: stave21.width,
      });

      var notes22 = score.notes('(eb4 ab4)/4., (c4 eb4 ab4)/4, db5/8', { stem: 'up' });
      var voice22 = score.voice(notes22, { time: '6/8' });

      vf.Stave({
        x: stave31.width + stave31.x,
        y: stave31.y,
        width: stave31.width,
      });

      var notes32 = score.notes('a5/8, a5, a5, a5, a5, a5', { stem: 'down' });
      var voice32 = score.voice(notes32, { time: '6/8' });

      formatter = vf.Formatter()
        .joinVoices([voice12])
        .joinVoices([voice22])
        .joinVoices([voice32]);

      if (options.params.justify) {
        formatter.formatToStave([voice12, voice22, voice32], stave12);
      } else {
        formatter.format([voice12, voice22, voice32], 0);
      }

      for (var j = 0; j < options.params.iterations; j++) {
        formatter.tune();
      }

      vf.Beam({ notes: notes32.slice(0, 3) });
      vf.Beam({ notes: notes32.slice(3, 6) });

      vf.draw();

      ok(true);
    },

    proportionalFormatting: function(options) {
      var debug = options.params.debug;
      VF.Registry.enableDefaultRegistry(new VF.Registry());

      var vf = VF.Test.makeFactory(options, 650, 750);
      var system = vf.System({
        x: 50,
        width: 500,
        debugFormatter: debug,
        noJustification: !(options.params.justify === undefined && true),
        formatIterations: options.params.iterations,
        options: { alpha: options.params.alpha }
      });

      var score = vf.EasyScore();

      var newVoice = function(notes) {
        return score.voice(notes, { time: '1/4' });
      };

      var newStave = function(voice) {
        return system
          .addStave({ voices: [voice], debugNoteMetrics: debug })
          .addClef('treble')
          .addTimeSignature('1/4');
      };

      var voices = [
        score.notes('c5/8, c5'),
        score.tuplet(score.notes('a4/8, a4, a4'), { notes_occupied: 2 }),
        score.notes('c5/16, c5, c5, c5'),
        score.tuplet(score.notes('a4/16, a4, a4, a4, a4'), { notes_occupied: 4 }),
        score.tuplet(score.notes('a4/32, a4, a4, a4, a4, a4, a4'), { notes_occupied: 8 }),
      ];

      voices.map(newVoice).forEach(newStave);
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();

      // var typeMap = VF.Registry.getDefaultRegistry().index.type;
      // var table = Object.keys(typeMap).map(function(typeName) {
      //   return typeName + ': ' + Object.keys(typeMap[typeName]).length;
      // });

      // console.log(table);
      VF.Registry.disableDefaultRegistry();
      ok(true);
    },

    softMax: function(options) {
      var vf = VF.Test.makeFactory(options, 550, 500);
      vf.getContext().scale(0.8, 0.8);

      function draw(y, factor) {
        var score = vf.EasyScore();
        var system = vf.System({
          x: 100,
          y,
          width: 500,
          details: { softmaxFactor: factor }
        });

        system.addStave({
          voices: [
            score.voice(
              score.notes('C#5/h, a4/q')
                .concat(score.beam(score.notes('Abb4/8, A4/8')))
                .concat(score.beam(score.notes('A4/16, A#4, A4, Ab4/32, A4'))),
              { time: '5/4' })
          ]
        }).addClef('treble').addTimeSignature('5/4');

        vf.draw();
        ok(true);
      }

      draw(50, 1);
      draw(150, 2);
      draw(250, 10);
      draw(350, 20);
      draw(450, 200);
    },

    mixTime: function(options) {
      var vf = VF.Test.makeFactory(options, 420, 250);
      vf.getContext().scale(0.8, 0.8);
      var score = vf.EasyScore();
      var system = vf.System({
        details: { softmaxFactor: 100 },
        width: 500, debugFormatter: true
      });

      system.addStave({
        voices: [
          score.voice(
            score.notes('C#5/q, B4')
              .concat(score.beam(score.notes('A4/8, E4, C4, D4')))
          )
        ]
      }).addClef('treble').addTimeSignature('4/4');

      system.addStave({
        voices: [
          score.voice(
            score.notes('C#5/q, B4, B4')
              .concat(
                score.tuplet(score.beam(score.notes('A4/8, E4, C4'))))
          )
        ]
      }).addClef('treble').addTimeSignature('4/4');

      vf.draw();
      ok(true);
    },

    tightNotes: function(options) {
      var vf = VF.Test.makeFactory(options, 420, 250);
      vf.getContext().scale(0.8, 0.8);
      var score = vf.EasyScore();
      var system = vf.System({
        width: 400, debugFormatter: true
      });

      system.addStave({
        voices: [
          score.voice(
            score.beam(score.notes('B4/16, B4, B4, B4, B4, B4, B4, B4'))
              .concat(score.notes('B4/q, B4'))
          )
        ]
      }).addClef('treble').addTimeSignature('4/4');

      system.addStave({
        voices: [
          score.voice(
            score.notes('B4/q, B4').concat(score.beam(score.notes('B4/16, B4, B4, B4, B4, B4, B4, B4')))
          )
        ]
      }).addClef('treble').addTimeSignature('4/4');

      vf.draw();
      ok(true);
    },

    tightNotes2: function(options) {
      var vf = VF.Test.makeFactory(options, 420, 250);
      vf.getContext().scale(0.8, 0.8);
      var score = vf.EasyScore();
      var system = vf.System({
        width: 400, debugFormatter: true
      });

      system.addStave({
        voices: [
          score.voice(
            score.beam(score.notes('B4/16, B4, B4, B4, B4, B4, B4, B4'))
              .concat(score.notes('B4/q, B4'))
          )
        ]
      }).addClef('treble').addTimeSignature('4/4');

      system.addStave({
        voices: [
          score.voice(
            score.notes('B4/w')
          )
        ]
      }).addClef('treble').addTimeSignature('4/4');

      vf.draw();
      ok(true);
    },

    annotations: function(options) {
      const pageWidth = 816;
      const pageHeight = 600;
      const vf = VF.Test.makeFactory(options, pageWidth, pageHeight);
      const context = vf.getContext();

      var lyrics1 = ['ipso', 'ipso-', 'ipso', 'ipso', 'ipsoz', 'ipso-', 'ipso', 'ipso', 'ipso', 'ip', 'ipso'];
      var lyrics2 = ['ipso', 'ipso-', 'ipsoz', 'ipso', 'ipso', 'ipso-', 'ipso', 'ipso', 'ipso', 'ip', 'ipso'];

      var smar = [{
        sm: 5,
        width: 450,
        lyrics: lyrics1,
        title: '450px,softMax:5'
      }, {
        sm: 5,
        width: 450,
        lyrics: lyrics2,
        title: '450px,softmax:5,different word order'
      },
      {
        sm: 5,
        width: 460,
        lyrics: lyrics2,
        title: '460px,softmax:5'
      }, {
        sm: 100,
        width: 460,
        lyrics: lyrics2,
        title: '460px,softmax:100'
      }];

      // Configure the rendering context.

      var adjX = 11;
      var rowSize = 140;
      var beats = 12;
      var beatsPer = 8;
      var beamGroup = 3;

      var durations = ['8d', '16', '8', '8d', '16', '8', '8d', '16', '8', '4', '8'];

      var beams = [];
      var y = 40;

      smar.forEach((sm) => {
        var stave = new VF.Stave(10, y, sm.width);
        var notes = [];
        var iii = 0;
        context.fillText(sm.title, 100, y);
        y += rowSize;

        durations.forEach((dd) => {
          var newNote = new VF.StaveNote({
            keys: ['b/4'],
            duration: dd
          });
          if (dd.indexOf('d') >= 0) {
            newNote.addDotToAll();
          }
          if (sm.lyrics.length > iii) {
            newNote.addAnnotation(0,
              new VF.Annotation(sm.lyrics[iii])
                .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)
                .setFont('Times', 12, 'normal'));
          }
          notes.push(newNote);
          iii += 1;
        });

        notes.forEach((note) => {
          if (note.duration.indexOf('d') >= 0) {
            note.addDotToAll();
          }
        });
        var beam = [];
        notes.forEach((note) => {
          if (note.intrinsicTicks < 4096) {
            beam.push(note);
            if (beam.length >= beamGroup) {
              beams.push(
                new VF.Beam(beam)
              );
              beam = [];
            }
          } else {
            beam = [];
          }
        });

        var voice1 = new VF.Voice({
          num_beats: beats,
          beat_value: beatsPer
        }).setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(notes);

        var fmt = new VF.Formatter({
          softmaxFactor: sm.sm
        }).joinVoices([voice1]);

        fmt.format([voice1], sm.width - adjX);

        var group = context.openGroup();
        group.id = 'mm-' + sm.sm;


        // Connect it to the rendering context and draw!
        stave.setContext(context).draw();

        voice1.draw(context, stave);

        context.closeGroup();

        beams.forEach(function(b) {
          b.setContext(context).draw();
        });
      });

      ok(true);
    }
  };

  return Formatter;
})();

/**
 * VexFlow - Fraction Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Fraction = (function() {
  var Fraction = {
    Start: function() {
      QUnit.module('Fraction');
      test('Basic', VF.Test.Fraction.basic);
    },

    basic: function() {
      var f_1_2 = new Vex.Flow.Fraction(1, 2);
      ok(f_1_2.equals(0.5), 'Fraction: 1/2 equals 0.5');
      ok(f_1_2.equals(new Vex.Flow.Fraction(1, 2)), 'Fraction: 1/2 equals 1/2');
      ok(f_1_2.equals(new Vex.Flow.Fraction(2, 4)), 'Fraction: 1/2 equals 2/4');

      notOk(f_1_2.greaterThan(1), 'Fraction: ! 1/2 > 1');
      ok(f_1_2.greaterThan(0.2), 'Fraction: 1/2 > 0.2');

      ok(f_1_2.greaterThanEquals(0.2), 'Fraction: 1/2 >= 0.2');
      ok(f_1_2.greaterThanEquals(0.5), 'Fraction: 1/2 >= 0.5');
      notOk(f_1_2.greaterThanEquals(1), 'Fraction: ! 1/2 >= 1');

      notOk(f_1_2.lessThan(0.5), 'Fracion: ! 1/2 < 0.5');
      ok(f_1_2.lessThan(1), 'Fraction: 1/2 < 1');

      ok(f_1_2.lessThanEquals(0.6), 'Fraction: 1/2 <= 0.6');
      ok(f_1_2.lessThanEquals(0.5), 'Fraction: 1/2 <= 0.5');
      notOk(f_1_2.lessThanEquals(0.4), 'Fraction: ! 1/2 <= 0.4');

      var f_05 = f_1_2.copy(0.5);
      strictEqual(f_05, f_1_2, 'Fraction: f_05 === f_1_2');
      strictEqual(f_05.toString(), '0.5/1', 'Fraction: f_05.toString() === "0.5/1"');
      strictEqual(f_05.toSimplifiedString(), '1/2', 'Fraction: f_05.toSimplifiedString() === "1/2"');

      var tF_n = f_05.clone();
      notStrictEqual(tF_n, f_05, 'Fraction: tF_n !== f_05');
      notEqual(tF_n, f_05, 'Fraction: tF_n != f_05');
      deepEqual(tF_n, f_05, 'tF_n deepEqual f_05');
      notDeepEqual(tF_n, {}, 'tF_n notDeepEqual {}');

      tF_n.subtract(-0.5);
      ok(tF_n.equals(1), 'Fraction: 0.5 -(-0.5) equals 1');
      tF_n.add(1);
      ok(tF_n.equals(2), 'Fraction: 1 + 1 equals 2');
      tF_n.multiply(2);
      ok(tF_n.equals(4), 'Fraction: 2 * 2 equals 4');
      tF_n.divide(2);
      ok(tF_n.equals(2), 'Fraction: 4 / 2 equals 2');

      // TODO: Add more detailed tests.
    },

  };

  return Fraction;
})();

/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

function createTest(setup) {
  return function(options) {
    var vf = VF.Test.makeFactory(options, 550);
    var stave = vf.Stave();
    var score = vf.EasyScore();

    setup(vf, score);

    vf.Formatter()
      .joinVoices(vf.getVoices())
      .formatToStave(vf.getVoices(), stave);

    vf.draw();

    ok(true, 'all pass');
  };
}

VF.Test.GhostNote = {
  Start: function() {
    var run = VF.Test.runTests;

    QUnit.module('GhostNote');

    run('GhostNote Basic', createTest(function(vf, score) {
      var voice1 = score.voice(score.notes(
        'f#5/4, f5, db5, c5, c5/8, d5, fn5, e5, d5, c5',
        { stem: 'up' }
      ), { time: '7/4' });

      score.voice([
        vf.GhostNote({ duration: '2' }),
        vf.StaveNote({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
        vf.GhostNote({ duration: '4' }),
        vf.StaveNote({ keys: ['e/4'], stem_direction: -1, duration: '4' }),
        vf.GhostNote({ duration: '8' }),
        vf.StaveNote({ keys: ['d/4'], stem_direction: -1, duration: '8' })
          .addAccidental(0, vf.Accidental({ type: '##' })),
        vf.StaveNote({ keys: ['c/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4'], stem_direction: -1, duration: '8' }),
      ], { time: '7/4' });

      vf.Beam({ notes: voice1.getTickables().slice(4, 8) });
      vf.Beam({ notes: voice1.getTickables().slice(8, 10) });
    }));

    run('GhostNote Dotted', createTest(function(vf, score) {
      function addAccidental(note, type) {
        note.addAccidental(0, vf.Accidental({ type: type }));
      }

      var voice1 = score.voice([
        vf.GhostNote({ duration: '4d' }),
        vf.StaveNote({ duration: '8', keys: ['f/5'], stem_direction: 1 }),
        vf.StaveNote({ duration: '4', keys: ['d/5'], stem_direction: 1 }),
        vf.StaveNote({ duration: '8', keys: ['c/5'], stem_direction: 1 }),
        vf.StaveNote({ duration: '16', keys: ['c/5'], stem_direction: 1 }),
        vf.StaveNote({ duration: '16', keys: ['d/5'], stem_direction: 1 }),
        vf.GhostNote({ duration: '2dd' }),
        vf.StaveNote({ duration: '8', keys: ['f/5'], stem_direction: 1 }),
      ], { time: '8/4' });

      var voice2 = score.voice([
        vf.StaveNote({ duration: '4', keys: ['f/4'], stem_direction: -1 }),
        vf.StaveNote({ duration: '8', keys: ['e/4'], stem_direction: -1 }),
        vf.StaveNote({ duration: '8', keys: ['d/4'], stem_direction: -1 }),
        vf.GhostNote({ duration: '4dd' }),
        vf.StaveNote({ duration: '16', keys: ['c/4'], stem_direction: -1 }),
        vf.StaveNote({ duration: '2', keys: ['c/4'], stem_direction: -1 }),
        vf.StaveNote({ duration: '4', keys: ['d/4'], stem_direction: -1 }),
        vf.StaveNote({ duration: '8', keys: ['f/4'], stem_direction: -1 }),
        vf.StaveNote({ duration: '8', keys: ['e/4'], stem_direction: -1 }),
      ], { time: '8/4' });

      var notes1 = voice1.getTickables();
      var notes2 = voice2.getTickables();

      addAccidental(notes1[1], 'bb');
      addAccidental(notes1[4], '#');
      addAccidental(notes1[7], 'n');

      addAccidental(notes2[0], '#');
      addAccidental(notes2[4], 'b');
      addAccidental(notes2[5], '#');
      addAccidental(notes2[7], 'n');

      vf.Beam({ notes: notes1.slice(3, 6) });
      vf.Beam({ notes: notes2.slice(1, 3) });
      vf.Beam({ notes: notes2.slice(7, 9) });
    }));
  },
};

/**
 * VexFlow - GlyphNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.GlyphNote = (function() {
  var run = VF.Test.runTests;

  var GlyphNote = {
    Start: function() {
      QUnit.module('GlyphNote');
      run('GlyphNote Positioning', GlyphNote.basic, { debug: false, noPadding: false });
      run('GlyphNote No Stave Padding', GlyphNote.basic, { debug: true, noPadding: true });
      run('GlyphNote RepeatNote', GlyphNote.repeatNote, { debug: false, noPadding: true });
    },

    basic: function(options) {
      VF.Registry.enableDefaultRegistry(new VF.Registry());

      var vf = VF.Test.makeFactory(options, 300, 400);
      var system = vf.System({
        x: 50,
        width: 250,
        debugFormatter: options.params.debug,
        noPadding: options.params.noPadding,
        options: { alpha: options.params.alpha }
      });

      var score = vf.EasyScore();

      var newVoice = function(notes) {
        return score.voice(notes, { time: '1/4' });
      };

      var newStave = function(voice) {
        return system
          .addStave({ voices: [voice], debugNoteMetrics: options.params.debug });
      };

      var voices = [
        [vf.GlyphNote(new VF.Glyph('repeat1Bar', 40), { duration: 'q' }, { line: 4 })],
        [vf.GlyphNote(new VF.Glyph('repeat2Bars', 40), { duration: 'q', align_center: true })],
        [
          vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: '16' }),
          vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: '16' }),
          vf.GlyphNote(new VF.Glyph('repeat4Bars', 40), { duration: '16' }),
          vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: '16' }),
        ],
      ];

      voices.map(newVoice).forEach(newStave);
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();

      VF.Registry.disableDefaultRegistry();
      ok(true);
    },

    repeatNote: function(options) {
      VF.Registry.enableDefaultRegistry(new VF.Registry());

      var vf = VF.Test.makeFactory(options, 300, 500);
      var system = vf.System({
        x: 50,
        width: 250,
        debugFormatter: options.params.debug,
        noPadding: options.params.noPadding,
        options: { alpha: options.params.alpha }
      });

      var score = vf.EasyScore();

      var newVoice = function(notes) {
        return score.voice(notes, { time: '1/4' });
      };

      var newStave = function(voice) {
        return system
          .addStave({ voices: [voice], debugNoteMetrics: options.params.debug });
      };

      var voices = [
        [vf.RepeatNote('1')],
        [vf.RepeatNote('2')],
        [vf.RepeatNote('4')],
        [
          vf.RepeatNote('slash', { duration: '16' }),
          vf.RepeatNote('slash', { duration: '16' }),
          vf.RepeatNote('slash', { duration: '16' }),
          vf.RepeatNote('slash', { duration: '16' }),
        ],
      ];

      voices.map(newVoice).forEach(newStave);
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();

      VF.Registry.disableDefaultRegistry();
      ok(true);
    },
  };

  return GlyphNote;
})();

/**
 * VexFlow - GraceNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.GraceNote = (function() {
  var stem_test_util = {
    durations: ['8', '16', '32', '64', '128'],
    createNote: function(d, noteT, keys, stem_direction, slash) {
      var note_prop = {
        duration: d,
      };
      note_prop.stem_direction = stem_direction;
      note_prop.slash = slash;
      note_prop.keys = keys;
      return noteT(note_prop);
    },
  };

  var GraceNote = {
    Start: function() {
      QUnit.module('Grace Notes');
      VF.Test.runTests('Grace Note Basic', VF.Test.GraceNote.basic);
      VF.Test.runTests('Grace Note Basic with Slurs', VF.Test.GraceNote.basicSlurred);
      VF.Test.runTests('Grace Note Stem', VF.Test.GraceNote.stem);
      VF.Test.runTests('Grace Note Stem with Beams', VF.Test.GraceNote.stemWithBeamed);
      VF.Test.runTests('Grace Note Slash', VF.Test.GraceNote.slash);
      VF.Test.runTests('Grace Note Slash with Beams', VF.Test.GraceNote.slashWithBeams);
      VF.Test.runTests('Grace Notes Multiple Voices', VF.Test.GraceNote.multipleVoices);
      VF.Test.runTests('Grace Notes Multiple Voices Multiple Draws', VF.Test.GraceNote.multipleVoicesMultipleDraws);
    },

    basic: function(options) {
      const vf = VF.Test.makeFactory(options, 700, 130);
      const stave = vf.Stave({ x: 10, y: 10, width: 650 });

      var gracenotes = [
        { keys: ['e/4'], duration: '32' },
        { keys: ['f/4'], duration: '32' },
        { keys: ['g/4'], duration: '32' },
        { keys: ['a/4'], duration: '32' },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes1 = [
        { keys: ['b/4'], duration: '8', slash: false },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes2 = [
        { keys: ['b/4'], duration: '8', slash: true },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes3 = [
        { keys: ['e/4'], duration: '8' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['e/4', 'g/4'], duration: '8' },
        { keys: ['a/4'], duration: '32' },
        { keys: ['b/4'], duration: '32' },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes4 = [
        { keys: ['g/4'], duration: '8' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
      ].map(vf.GraceNote.bind(vf));

      gracenotes[1].addAccidental(0, vf.Accidental({ type: '##' }));
      gracenotes3[3].addAccidental(0, vf.Accidental({ type: 'bb' }));
      gracenotes4[0].addDotToAll();

      var notes = [
        vf.StaveNote({ keys: ['b/4'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes }).beamNotes()),
        vf.StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
          .addAccidental(0, vf.Accidental({ type: '#' }))
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes1 }).beamNotes()),
        vf.StaveNote({ keys: ['c/5', 'd/5'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes2 }).beamNotes()),
        vf.StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes3 }).beamNotes()),
        vf.StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes4 }).beamNotes()),
      ];

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'GraceNoteBasic');
    },

    basicSlurred: function(options) {
      const vf = VF.Test.makeFactory(options, 700, 130);
      const stave = vf.Stave({ x: 10, y: 10, width: 650 });

      var gracenotes0 = [
        { keys: ['e/4'], duration: '32' },
        { keys: ['f/4'], duration: '32' },
        { keys: ['g/4'], duration: '32' },
        { keys: ['a/4'], duration: '32' },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes1 = [
        { keys: ['b/4'], duration: '8', slash: false },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes2 = [
        { keys: ['b/4'], duration: '8', slash: true },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes3 = [
        { keys: ['e/4'], duration: '8' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['e/4', 'g/4'], duration: '8' },
        { keys: ['a/4'], duration: '32' },
        { keys: ['b/4'], duration: '32' },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes4 = [
        { keys: ['a/4'], duration: '8' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
      ].map(vf.GraceNote.bind(vf));

      gracenotes0[1].addAccidental(0, vf.Accidental({ type: '#' }));
      gracenotes3[3].addAccidental(0, vf.Accidental({ type: 'b' }));
      gracenotes3[2].addAccidental(0, vf.Accidental({ type: 'n' }));
      gracenotes4[0].addDotToAll();

      const notes = [
        vf.StaveNote({ keys: ['b/4'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes0, slur: true }).beamNotes()),
        vf.StaveNote({ keys: ['c/5'], duration: '4', auto_stem: true })
          .addAccidental(0, vf.Accidental({ type: '#' }))
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes1, slur: true }).beamNotes()),
        vf.StaveNote({ keys: ['c/5', 'd/5'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes2, slur: true }).beamNotes()),
        vf.StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes3, slur: true }).beamNotes()),
        vf.StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true })
          .addModifier(0, vf.GraceNoteGroup({ notes: gracenotes4, slur: true }).beamNotes()),
        vf.StaveNote({ keys: ['a/4'], duration: '4', auto_stem: true }),
      ];

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'GraceNoteBasic');
    },

    stem: function(options) {
      const vf = VF.Test.makeFactory(options, 700, 130);
      const stave = vf.Stave({ x: 10, y: 10, width: 650 });

      function createNotes(noteT, keys, stem_direction) {
        return stem_test_util.durations.map(function(d) {
          return stem_test_util.createNote(d, noteT, keys, stem_direction);
        });
      }

      function createNoteBlock(keys, stem_direction) {
        var notes = createNotes(vf.StaveNote.bind(vf), keys, stem_direction);
        var gracenotes = createNotes(vf.GraceNote.bind(vf), keys, stem_direction);
        notes[0].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes }));
        return notes;
      }

      var voice = vf.Voice().setStrict(false);
      voice.addTickables(createNoteBlock(['g/4'], 1));
      voice.addTickables(createNoteBlock(['d/5'], -1));

      new vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true, 'GraceNoteStem');
    },

    stemWithBeamed: function(options) {
      const vf = VF.Test.makeFactory(options, 700, 130);
      const stave = vf.Stave({ x: 10, y: 10, width: 650 });

      function createBeamdNotes(noteT, keys, stem_direction, beams, isGrace, notesToBeam) {
        var ret = [];
        stem_test_util.durations.map(function(d) {
          var n0 = stem_test_util.createNote(d, noteT, keys, stem_direction);
          var n1 = stem_test_util.createNote(d, noteT, keys, stem_direction);
          ret.push(n0);
          ret.push(n1);
          if (notesToBeam) {
            notesToBeam.push([n0, n1]);
          }
          if (!isGrace) {
            var tbeam = vf.Beam({ notes: [n0, n1] });
            beams.push(tbeam);
          }
          return ret;
        });
        return ret;
      }

      function createBeamdNoteBlock(keys, stem_direction, beams) {
        var bnotes = createBeamdNotes(vf.StaveNote.bind(vf), keys, stem_direction, beams);
        var notesToBeam = [];
        var gracenotes = createBeamdNotes(vf.GraceNote.bind(vf), keys, stem_direction, beams, true, notesToBeam);
        var graceNoteGroup = vf.GraceNoteGroup({ notes: gracenotes });
        notesToBeam.map(graceNoteGroup.beamNotes.bind(graceNoteGroup));
        bnotes[0].addModifier(0, graceNoteGroup);
        return bnotes;
      }

      var beams = [];
      var voice = vf.Voice().setStrict(false);
      voice.addTickables(createBeamdNoteBlock(['g/4'], 1, beams));
      voice.addTickables(createBeamdNoteBlock(['d/5'], -1, beams));

      new vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true, 'GraceNoteStem');
    },

    slash: function(options) {
      const vf = VF.Test.makeFactory(options, 700, 130);
      const stave = vf.Stave({ x: 10, y: 10, width: 650 });

      function createNotes(noteT, keys, stem_direction, slash) {
        return stem_test_util.durations.map(function(d) {
          return stem_test_util.createNote(d, noteT, keys, stem_direction, slash);
        });
      }

      function createNoteBlock(keys, stem_direction) {
        var notes = [vf.StaveNote({ keys: ['f/4'], stem_direction: stem_direction, duration: '16' })];
        var gracenotes = createNotes(vf.GraceNote.bind(vf), keys, stem_direction, true);

        var gnotesToBeam = [];
        var duration = '8';
        var gns = [
          { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },

          { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: true },

          { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: true },
          { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
        ].map(vf.GraceNote.bind(vf));

        gnotesToBeam.push([gns[0], gns[1], gns[2]]);
        gnotesToBeam.push([gns[3], gns[4], gns[5]]);
        gnotesToBeam.push([gns[6], gns[7], gns[8]]);

        gracenotes = gracenotes.concat(gns);
        var gracenoteGroup = vf.GraceNoteGroup({ notes: gracenotes });
        gnotesToBeam.forEach(function(gnotes) {
          gracenoteGroup.beamNotes(gnotes);
        });

        notes[0].addModifier(0, gracenoteGroup);
        return notes;
      }

      var voice = vf.Voice().setStrict(false);
      voice.addTickables(createNoteBlock(['d/4', 'a/4'], 1));
      voice.addTickables(createNoteBlock(['d/4', 'a/4'], -1));

      new vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true, 'GraceNoteSlash');
    },

    slashWithBeams: function(options) {
      const vf = VF.Test.makeFactory(options, 800, 130);
      const stave = vf.Stave({ x: 10, y: 10, width: 750 });

      function createNoteBlock(keys, stem_direction) {
        var notes = [vf.StaveNote({ keys: ['f/4'], stem_direction: stem_direction, duration: '16' })];
        var gracenotes = [];

        var gnotesToBeam = [];

        ['8', '16', '32', '64'].forEach(function(duration) {
          var gns = [
            { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
            { keys: ['d/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: false },

            { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: true },
            { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: false },

            { keys: ['b/4', 'f/5'], stem_direction: stem_direction, duration: duration, slash: true },
            { keys: ['e/4', 'a/4'], stem_direction: stem_direction, duration: duration, slash: false },
          ].map(vf.GraceNote.bind(vf));

          gnotesToBeam.push([gns[0], gns[1]]);
          gnotesToBeam.push([gns[2], gns[3]]);
          gnotesToBeam.push([gns[4], gns[5]]);
          gracenotes = gracenotes.concat(gns);
        });
        var gracenoteGroup = vf.GraceNoteGroup({ notes: gracenotes });

        gnotesToBeam.forEach(function(gnotes) {
          gracenoteGroup.beamNotes(gnotes);
        });

        notes[0].addModifier(0, gracenoteGroup);
        return notes;
      }

      var voice = vf.Voice().setStrict(false);
      voice.addTickables(createNoteBlock(['d/4', 'a/4'], 1));
      voice.addTickables(createNoteBlock(['d/4', 'a/4'], -1));

      new vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true, 'GraceNoteSlashWithBeams');
    },

    multipleVoices: function(options) {
      const vf = VF.Test.makeFactory(options, 450, 140);
      const stave = vf.Stave({ x: 10, y: 10, width: 450 });

      var notes = [
        { keys: ['f/5'], stem_direction: 1, duration: '16' },
        { keys: ['f/5'], stem_direction: 1, duration: '16' },
        { keys: ['d/5'], stem_direction: 1, duration: '16' },
        { keys: ['c/5'], stem_direction: 1, duration: '16' },
        { keys: ['c/5'], stem_direction: 1, duration: '16' },
        { keys: ['d/5'], stem_direction: 1, duration: '16' },
        { keys: ['f/5'], stem_direction: 1, duration: '16' },
        { keys: ['e/5'], stem_direction: 1, duration: '16' },
      ].map(vf.StaveNote.bind(vf));

      var notes2 = [
        { keys: ['f/4'], stem_direction: -1, duration: '16' },
        { keys: ['e/4'], stem_direction: -1, duration: '16' },
        { keys: ['d/4'], stem_direction: -1, duration: '16' },
        { keys: ['c/4'], stem_direction: -1, duration: '16' },
        { keys: ['c/4'], stem_direction: -1, duration: '16' },
        { keys: ['d/4'], stem_direction: -1, duration: '16' },
        { keys: ['f/4'], stem_direction: -1, duration: '16' },
        { keys: ['e/4'], stem_direction: -1, duration: '16' },
      ].map(vf.StaveNote.bind(vf));

      var gracenotes1 = [
        { keys: ['b/4'], stem_direction: 1, duration: '8', slash: true },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes2 = [
        { keys: ['f/4'], stem_direction: -1, duration: '8', slash: true },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes3 = [
        { keys: ['f/4'], duration: '32', stem_direction: -1 },
        { keys: ['e/4'], duration: '32', stem_direction: -1 },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes4 = [
        { keys: ['f/5'], duration: '32', stem_direction: 1 },
        { keys: ['e/5'], duration: '32', stem_direction: 1 },
        { keys: ['e/5'], duration: '8', stem_direction: 1 },
      ].map(vf.GraceNote.bind(vf));

      gracenotes2[0].setStemDirection(-1);
      gracenotes2[0].addAccidental(0, vf.Accidental({ type: '#' }));

      notes[1].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes4 }).beamNotes());
      notes[3].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes1 }));
      notes2[1].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes2 }).beamNotes());
      notes2[5].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes3 }).beamNotes());

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      var voice2 = vf.Voice()
        .setStrict(false)
        .addTickables(notes2);

      vf.Beam({ notes: notes.slice(0, 4) });
      vf.Beam({ notes: notes.slice(4, 8) });
      vf.Beam({ notes: notes2.slice(0, 4) });
      vf.Beam({ notes: notes2.slice(4, 8) });

      new VF.Formatter()
        .joinVoices([voice, voice2])
        .formatToStave([voice, voice2], stave);

      vf.draw();

      ok(true, 'Sixteenth Test');
    },

    multipleVoicesMultipleDraws: function(options) {
      const vf = VF.Test.makeFactory(options, 450, 140);
      const stave = vf.Stave({ x: 10, y: 10, width: 450 });

      var notes = [
        { keys: ['f/5'], stem_direction: 1, duration: '16' },
        { keys: ['f/5'], stem_direction: 1, duration: '16' },
        { keys: ['d/5'], stem_direction: 1, duration: '16' },
        { keys: ['c/5'], stem_direction: 1, duration: '16' },
        { keys: ['c/5'], stem_direction: 1, duration: '16' },
        { keys: ['d/5'], stem_direction: 1, duration: '16' },
        { keys: ['f/5'], stem_direction: 1, duration: '16' },
        { keys: ['e/5'], stem_direction: 1, duration: '16' },
      ].map(vf.StaveNote.bind(vf));

      var notes2 = [
        { keys: ['f/4'], stem_direction: -1, duration: '16' },
        { keys: ['e/4'], stem_direction: -1, duration: '16' },
        { keys: ['d/4'], stem_direction: -1, duration: '16' },
        { keys: ['c/4'], stem_direction: -1, duration: '16' },
        { keys: ['c/4'], stem_direction: -1, duration: '16' },
        { keys: ['d/4'], stem_direction: -1, duration: '16' },
        { keys: ['f/4'], stem_direction: -1, duration: '16' },
        { keys: ['e/4'], stem_direction: -1, duration: '16' },
      ].map(vf.StaveNote.bind(vf));

      var gracenotes1 = [
        { keys: ['b/4'], stem_direction: 1, duration: '8', slash: true },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes2 = [
        { keys: ['f/4'], stem_direction: -1, duration: '8', slash: true },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes3 = [
        { keys: ['f/4'], duration: '32', stem_direction: -1 },
        { keys: ['e/4'], duration: '32', stem_direction: -1 },
      ].map(vf.GraceNote.bind(vf));

      var gracenotes4 = [
        { keys: ['f/5'], duration: '32', stem_direction: 1 },
        { keys: ['e/5'], duration: '32', stem_direction: 1 },
        { keys: ['e/5'], duration: '8', stem_direction: 1 },
      ].map(vf.GraceNote.bind(vf));

      gracenotes2[0].setStemDirection(-1);
      gracenotes2[0].addAccidental(0, vf.Accidental({ type: '#' }));

      notes[1].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes4 }).beamNotes());
      notes[3].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes1 }));
      notes2[1].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes2 }).beamNotes());
      notes2[5].addModifier(0, vf.GraceNoteGroup({ notes: gracenotes3 }).beamNotes());

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      var voice2 = vf.Voice()
        .setStrict(false)
        .addTickables(notes2);

      vf.Beam({ notes: notes.slice(0, 4) });
      vf.Beam({ notes: notes.slice(4, 8) });
      vf.Beam({ notes: notes2.slice(0, 4) });
      vf.Beam({ notes: notes2.slice(4, 8) });

      new VF.Formatter()
        .joinVoices([voice, voice2])
        .formatToStave([voice, voice2], stave);

      vf.draw();
      vf.draw();

      ok(true, 'Seventeenth Test');
    },
  };

  return GraceNote;
})();

/**
 * VexFlow - GraceTabNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.GraceTabNote = (function() {
  var GraceTabNote = {
    Start: function() {
      QUnit.module('Grace Tab Notes');
      VF.Test.runTests('Grace Tab Note Simple', VF.Test.GraceTabNote.simple);
      VF.Test.runTests('Grace Tab Note Slurred', VF.Test.GraceTabNote.slurred);
    },

    setupContext: function(options, x) {
      var ctx = options.contextBuilder(options.elementId, 350, 140);
      var stave = new VF.TabStave(10, 10, x || 350)
        .addTabGlyph()
        .setContext(ctx)
        .draw();

      return { context: ctx, stave: stave };
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.GraceTabNote.setupContext(options);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var note0 = newNote({ positions: [{ str: 4, fret: 6 }], duration: '4' });
      var note1 = newNote({ positions: [{ str: 4, fret: 12 }], duration: '4' });
      var note2 = newNote({ positions: [{ str: 4, fret: 10 }], duration: '4' });
      var note3 = newNote({ positions: [{ str: 4, fret: 10 }], duration: '4' });

      var gracenote_group0 = [
        { positions: [{ str: 4, fret: 'x' }], duration: '8' },
      ];

      var gracenote_group1 = [
        { positions: [{ str: 4, fret: 9 }], duration: '16' },
        { positions: [{ str: 4, fret: 10 }], duration: '16' },
      ];

      var gracenote_group2 = [
        { positions: [{ str: 4, fret: 9 }], duration: '8' },
      ];
      var gracenote_group3 = [
        { positions: [{ str: 5, fret: 10 }], duration: '8' },
        { positions: [{ str: 4, fret: 9 }], duration: '8' },
      ];

      function createNote(note_prop) {
        return new VF.GraceTabNote(note_prop);
      }

      var gracenotes0 = gracenote_group0.map(createNote);
      var gracenotes1 = gracenote_group1.map(createNote);
      var gracenotes2 = gracenote_group2.map(createNote);
      gracenotes2[0].setGhost(true);
      var gracenotes3 = gracenote_group3.map(createNote);

      note0.addModifier(new VF.GraceNoteGroup(gracenotes0));
      note1.addModifier(new VF.GraceNoteGroup(gracenotes1));
      note2.addModifier(new VF.GraceNoteGroup(gracenotes2));
      note3.addModifier(new VF.GraceNoteGroup(gracenotes3));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables([note0, note1, note2, note3]);

      new VF.Formatter().joinVoices([voice]).format([voice], 250);

      voice.draw(c.context, c.stave);

      ok(true, 'Simple Test');
    },

    slurred: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.GraceTabNote.setupContext(options);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var note0 = newNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' });
      var note1 = newNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' });

      var gracenote_group0 = [
        { positions: [{ str: 4, fret: 9 }], duration: '8' },
        { positions: [{ str: 4, fret: 10 }], duration: '8' },
      ];

      var gracenote_group1 = [
        { positions: [{ str: 4, fret: 7 }], duration: '16' },
        { positions: [{ str: 4, fret: 8 }], duration: '16' },
        { positions: [{ str: 4, fret: 9 }], duration: '16' },
      ];

      function createNote(note_prop) {
        return new VF.GraceTabNote(note_prop);
      }

      var gracenotes0 = gracenote_group0.map(createNote);
      var gracenotes1 = gracenote_group1.map(createNote);

      note0.addModifier(new VF.GraceNoteGroup(gracenotes0, true));
      note1.addModifier(new VF.GraceNoteGroup(gracenotes1, true));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables([note0, note1]);

      new VF.Formatter().joinVoices([voice]).format([voice], 200);

      voice.draw(c.context, c.stave);

      ok(true, 'Slurred Test');
    },
  };

  return GraceTabNote;
})();

/**
 * VexFlow - Clef-Key Signature Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ClefKeySignature = (function() {
  var ClefKeySignature = {
    MAJOR_KEYS: [
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
    ],

    MINOR_KEYS: [
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
    ],

    Start: function() {
      QUnit.module('Clef Keys');
      QUnit.test('Key Parser Test', VF.Test.ClefKeySignature.parser);
      VF.Test.runTests('Major Key Clef Test', VF.Test.ClefKeySignature.keys, { majorKeys: true });
      VF.Test.runTests('Minor Key Clef Test', VF.Test.ClefKeySignature.keys, { majorKeys: false });
      VF.Test.runTests('Stave Helper', VF.Test.ClefKeySignature.staveHelper);
    },

    catchError: function(spec) {
      try {
        VF.keySignature(spec);
      } catch (e) {
        equal(e.code, 'BadKeySignature', e.message);
      }
    },

    parser: function() {
      expect(11);
      VF.Test.ClefKeySignature.catchError('asdf');
      VF.Test.ClefKeySignature.catchError('D!');
      VF.Test.ClefKeySignature.catchError('E#');
      VF.Test.ClefKeySignature.catchError('D#');
      VF.Test.ClefKeySignature.catchError('#');
      VF.Test.ClefKeySignature.catchError('b');
      VF.Test.ClefKeySignature.catchError('Kb');
      VF.Test.ClefKeySignature.catchError('Fb');
      VF.Test.ClefKeySignature.catchError('Ab');
      VF.Test.ClefKeySignature.catchError('Dbm');
      VF.Test.ClefKeySignature.catchError('B#m');

      VF.keySignature('B');
      VF.keySignature('C');
      VF.keySignature('Fm');
      VF.keySignature('Ab');
      VF.keySignature('Abm');
      VF.keySignature('F#');
      VF.keySignature('G#m');

      ok(true, 'all pass');
    },

    keys: function(options, contextBuilder) {
      var clefs = [
        'treble',
        'soprano',
        'mezzo-soprano',
        'alto',
        'tenor',
        'baritone-f',
        'baritone-c',
        'bass',
        'french',
        'subbass',
        'percussion',
      ];

      var ctx = new contextBuilder(options.elementId, 400, 20 + 80 * 2 * clefs.length);
      var staves = [];
      var keys = (options.params.majorKeys)
        ? VF.Test.ClefKeySignature.MAJOR_KEYS
        : VF.Test.ClefKeySignature.MINOR_KEYS;

      var i;
      var flat;
      var sharp;
      var keySig;

      var yOffsetForFlatStaves = 10 + 80 * clefs.length;
      for (i = 0; i < clefs.length; i++) {
        // Render all the sharps first, then all the flats:
        staves[i] = new VF.Stave(10, 10 + 80 * i, 390);
        staves[i].addClef(clefs[i]);
        staves[i + clefs.length] = new VF.Stave(10, yOffsetForFlatStaves + 10 + 80 * i, 390);
        staves[i + clefs.length].addClef(clefs[i]);

        for (flat = 0; flat < 8; flat++) {
          keySig = new VF.KeySignature(keys[flat]);
          keySig.addToStave(staves[i]);
        }

        for (sharp = 8; sharp < keys.length; sharp++) {
          keySig = new VF.KeySignature(keys[sharp]);
          keySig.addToStave(staves[i + clefs.length]);
        }

        staves[i].setContext(ctx);
        staves[i].draw();
        staves[i + clefs.length].setContext(ctx);
        staves[i + clefs.length].draw();
      }

      ok(true, 'all pass');
    },

    staveHelper: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 400);
      var stave = new VF.Stave(10, 10, 370);
      var stave2 = new VF.Stave(10, 90, 370);
      var stave3 = new VF.Stave(10, 170, 370);
      var stave4 = new VF.Stave(10, 260, 370);
      var keys = VF.Test.ClefKeySignature.MAJOR_KEYS;

      stave.addClef('treble');
      stave2.addClef('bass');
      stave3.addClef('alto');
      stave4.addClef('tenor');

      for (var n = 0; n < 8; ++n) {
        stave.addKeySignature(keys[n]);
        stave2.addKeySignature(keys[n]);
      }

      for (var i = 8; i < keys.length; ++i) {
        stave3.addKeySignature(keys[i]);
        stave4.addKeySignature(keys[i]);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();
      stave3.setContext(ctx);
      stave3.draw();
      stave4.setContext(ctx);
      stave4.draw();

      ok(true, 'all pass');
    },
  };

  return ClefKeySignature;
}());

/**
 * VexFlow - Music Key Management Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.KeyManager = (function() {
  var KeyManager = {
    Start: function() {
      QUnit.module('KeyManager');
      test('Valid Notes', VF.Test.KeyManager.works);
      test('Select Notes', VF.Test.KeyManager.selectNotes);
    },

    works: function() {
      // expect(1);

      var manager = new VF.KeyManager('g');
      equal(manager.getAccidental('f').accidental, '#');

      manager.setKey('a');
      equal(manager.getAccidental('c').accidental, '#');
      equal(manager.getAccidental('a').accidental, null);
      equal(manager.getAccidental('f').accidental, '#');

      manager.setKey('A');
      equal(manager.getAccidental('c').accidental, '#');
      equal(manager.getAccidental('a').accidental, null);
      equal(manager.getAccidental('f').accidental, '#');
    },

    selectNotes: function() {
      var manager = new VF.KeyManager('f');
      equal(manager.selectNote('bb').note, 'bb');
      equal(manager.selectNote('bb').accidental, 'b');
      equal(manager.selectNote('g').note, 'g');
      equal(manager.selectNote('g').accidental, null);
      equal(manager.selectNote('b').note, 'b');
      equal(manager.selectNote('b').accidental, null);
      equal(manager.selectNote('a#').note, 'bb');
      equal(manager.selectNote('g#').note, 'g#');

      // Changes have no effect?
      equal(manager.selectNote('g#').note, 'g#');
      equal(manager.selectNote('bb').note, 'bb');
      equal(manager.selectNote('bb').accidental, 'b');
      equal(manager.selectNote('g').note, 'g');
      equal(manager.selectNote('g').accidental, null);
      equal(manager.selectNote('b').note, 'b');
      equal(manager.selectNote('b').accidental, null);
      equal(manager.selectNote('a#').note, 'bb');
      equal(manager.selectNote('g#').note, 'g#');

      // Changes should propagate
      manager.reset();
      equal(manager.selectNote('g#').change, true);
      equal(manager.selectNote('g#').change, false);
      equal(manager.selectNote('g').change, true);
      equal(manager.selectNote('g').change, false);
      equal(manager.selectNote('g#').change, true);

      manager.reset();
      var note = manager.selectNote('bb');
      equal(note.change, false);
      equal(note.accidental, 'b');
      note = manager.selectNote('g');
      equal(note.change, false);
      equal(note.accidental, null);
      note = manager.selectNote('g#');
      equal(note.change, true);
      equal(note.accidental, '#');
      note = manager.selectNote('g');
      equal(note.change, true);
      equal(note.accidental, null);
      note = manager.selectNote('g');
      equal(note.change, false);
      equal(note.accidental, null);
      note = manager.selectNote('g#');
      equal(note.change, true);
      equal(note.accidental, '#');
    },
  };

  return KeyManager;
})();

/**
 * VexFlow - Key Signature Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.KeySignature = (function() {
  function catchError(spec) {
    try {
      VF.keySignature(spec);
    } catch (e) {
      equal(e.code, 'BadKeySignature', e.message);
    }
  }

  KeySignature = {
    MAJOR_KEYS: [
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
    ],

    MINOR_KEYS: [
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
    ],

    Start: function() {
      QUnit.module('KeySignature');
      test('Key Parser Test', VF.Test.KeySignature.parser);
      VF.Test.runTests('Major Key Test', VF.Test.KeySignature.majorKeys);
      VF.Test.runTests('Minor Key Test', VF.Test.KeySignature.minorKeys);
      VF.Test.runTests('Stave Helper', VF.Test.KeySignature.staveHelper);
      VF.Test.runTests('Cancelled key test', VF.Test.KeySignature.majorKeysCanceled);
      VF.Test.runTests('Cancelled key (for each clef) test', VF.Test.KeySignature.keysCanceledForEachClef);
      VF.Test.runTests('Altered key test', VF.Test.KeySignature.majorKeysAltered);
      VF.Test.runTests('End key with clef test', VF.Test.KeySignature.endKeyWithClef);
      VF.Test.runTests('Key Signature Change test', VF.Test.KeySignature.changeKey);
    },

    parser: function() {
      expect(11);
      catchError('asdf');
      catchError('D!');
      catchError('E#');
      catchError('D#');
      catchError('#');
      catchError('b');
      catchError('Kb');
      catchError('Fb');
      catchError('Ab');
      catchError('Dbm');
      catchError('B#m');

      VF.keySignature('B');
      VF.keySignature('C');
      VF.keySignature('Fm');
      VF.keySignature('Ab');
      VF.keySignature('Abm');
      VF.keySignature('F#');
      VF.keySignature('G#m');

      ok(true, 'all pass');
    },

    majorKeys: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 240);
      var stave = new VF.Stave(10, 10, 350);
      var stave2 = new VF.Stave(10, 90, 350);
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      for (var i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.addToStave(stave);
      }

      for (var n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.addToStave(stave2);
      }


      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();

      ok(true, 'all pass');
    },

    majorKeysCanceled: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 780, 500);
      ctx.scale(0.9, 0.9);
      var stave = new VF.Stave(10, 10, 750).addTrebleGlyph();
      var stave2 = new VF.Stave(10, 90, 750).addTrebleGlyph();
      var stave3 = new VF.Stave(10, 170, 750).addTrebleGlyph();
      var stave4 = new VF.Stave(10, 250, 750).addTrebleGlyph();
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      var i;
      var n;
      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.cancelKey('Cb');

        keySig.padding = 18;
        keySig.addToStave(stave);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.cancelKey('C#');
        keySig.padding = 20;
        keySig.addToStave(stave2);
      }

      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.cancelKey('E');

        keySig.padding = 18;
        keySig.addToStave(stave3);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.cancelKey('Ab');
        keySig.padding = 20;
        keySig.addToStave(stave4);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();
      stave3.setContext(ctx);
      stave3.draw();
      stave4.setContext(ctx);
      stave4.draw();

      ok(true, 'all pass');
    },

    keysCanceledForEachClef: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 380);
      ctx.scale(0.8, 0.8);
      var keys = [
        'C#',
        'Cb'
      ];

      var x = 20;
      var y = 20;
      var tx = x;
      ['bass', 'tenor', 'soprano', 'mezzo-soprano', 'baritone-f'].forEach(function(clef) {
        keys.forEach(function(key) {
          var cancelKey = key === keys[0] ? keys[1] : keys[0];
          var vStave = new Vex.Flow.Stave(tx, y, 350);
          vStave.setClef(clef);
          vStave.addKeySignature(cancelKey);
          vStave.addKeySignature(key, cancelKey);
          vStave.addKeySignature(key);
          vStave.setContext(ctx).draw();
          tx += 350;
        });
        tx = x;
        y += 80;
      });

      ok(true, 'all pass');
    },

    majorKeysAltered: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 780, 500);
      ctx.scale(0.9, 0.9);
      var stave = new VF.Stave(10, 10, 750).addTrebleGlyph();
      var stave2 = new VF.Stave(10, 90, 750).addTrebleGlyph();
      var stave3 = new VF.Stave(10, 170, 750).addTrebleGlyph();
      var stave4 = new VF.Stave(10, 250, 750).addTrebleGlyph();
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      var i;
      var n;
      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.alterKey(['bs', 'bs']);
        keySig.padding = 18;
        keySig.addToStave(stave);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.alterKey(['+', '+', '+']);
        keySig.padding = 20;
        keySig.addToStave(stave2);
      }

      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.alterKey(['n', 'bs', 'bb']);
        keySig.padding = 18;
        keySig.addToStave(stave3);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.alterKey(['++', '+', 'n', '+']);
        keySig.padding = 20;
        keySig.addToStave(stave4);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();
      stave3.setContext(ctx);
      stave3.draw();
      stave4.setContext(ctx);
      stave4.draw();

      ok(true, 'all pass');
    },

    minorKeys: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 240);
      var stave = new VF.Stave(10, 10, 350);
      var stave2 = new VF.Stave(10, 90, 350);
      var keys = VF.Test.KeySignature.MINOR_KEYS;

      var keySig = null;
      for (var i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.addToStave(stave);
      }

      for (var n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.addToStave(stave2);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();

      ok(true, 'all pass');
    },
    endKeyWithClef: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 200);
      ctx.scale(0.9, 0.9);
      var stave1 = new VF.Stave(10, 10, 350);
      stave1.setKeySignature('G')
        .setBegBarType(VF.Barline.type.REPEAT_BEGIN)
        .setEndBarType(VF.Barline.type.REPEAT_END)
        .setClef('treble')
        .addTimeSignature('4/4')
        .setEndClef('bass')
        .setEndKeySignature('Cb');
      var stave2 = new VF.Stave(10, 90, 350);
      stave2.setKeySignature('Cb')
        .setClef('bass')
        .setEndClef('treble')
        .setEndKeySignature('G');

      stave1.setContext(ctx).draw();
      stave2.setContext(ctx).draw();
      ok(true, 'all pass');
    },

    staveHelper: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 240);
      var stave = new VF.Stave(10, 10, 350);
      var stave2 = new VF.Stave(10, 90, 350);
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      for (var i = 0; i < 8; ++i) {
        stave.addKeySignature(keys[i]);
      }

      for (var n = 8; n < keys.length; ++n) {
        stave2.addKeySignature(keys[n]);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();

      ok(true, 'all pass');
    },

    changeKey: function(options) {
      var vf = VF.Test.makeFactory(options, 900);

      var stave = vf.Stave(10, 10, 800)
        .addClef('treble')
        .addTimeSignature('C|');

      var voice = vf.Voice().setStrict(false).addTickables([
        vf.KeySigNote({ key: 'Bb' }),
        vf.StaveNote({ keys: ['c/4'], duration: '1' }),
        vf.BarNote(),
        vf.KeySigNote({ key: 'D', cancelKey: 'Bb' }),
        vf.StaveNote({ keys: ['c/4'], duration: '1' }),
        vf.BarNote(),
        vf.KeySigNote({ key: 'Bb' }),
        vf.StaveNote({ keys: ['c/4'], duration: '1' }),
        vf.BarNote(),
        vf.KeySigNote({ key: 'D', alterKey: ['b', 'n'] }),
        vf.StaveNote({ keys: ['c/4'], duration: '1' }),
      ]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'all pass');
    }
  };

  return KeySignature;
}());

/**
 * VexFlow - ModifierContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ModifierContext = (function() {
  var ModifierContext = {
    Start: function() {
      QUnit.module('ModifierContext');
      test('Modifier Width Test', ModifierContext.width);
      test('Modifier Management', ModifierContext.management);
    },

    width: function() {
      var mc = new VF.ModifierContext();
      equal(mc.getWidth(), 0, 'New modifier context has no width');
    },

    management: function() {
      var mc = new VF.ModifierContext();
      var modifier1 = new VF.Modifier();
      var modifier2 = new VF.Modifier();

      mc.addModifier(modifier1);
      mc.addModifier(modifier2);

      var accidentals = mc.getModifiers('none');

      equal(accidentals.length, 2, 'Added two modifiers');
    },
  };

  return ModifierContext;
})();

/**
 * VexFlow - MultiMeasureRest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.MultiMeasureRest = (function() {
  return {
    Start: function() {
      QUnit.module('MultiMeasureRest');
      VF.Test.runTests('Simple Test', VF.Test.MultiMeasureRest.simple0);
      VF.Test.runTests('Stave with modifiers Test', VF.Test.MultiMeasureRest.staveWithModifiers);
    },

    simple0: function(options) {
      const width = 910;
      const vf = VF.Test.makeFactory(options, width, 300);
      const params = [
        { number_of_measures: 2, show_number: false },
        { number_of_measures: 2 },
        { number_of_measures: 2, line_thickness: 8, serif_thickness: 3 },
        { number_of_measures: 1, use_symbols: true },
        { number_of_measures: 2, use_symbols: true },
        { number_of_measures: 3, use_symbols: true },
        { number_of_measures: 4, use_symbols: true },
        { number_of_measures: 5, use_symbols: true },
        { number_of_measures: 6, use_symbols: true },
        { number_of_measures: 7, use_symbols: true },
        { number_of_measures: 8, use_symbols: true },
        { number_of_measures: 9, use_symbols: true },
        { number_of_measures: 10, use_symbols: true },
        { number_of_measures: 11, use_symbols: true },
        { number_of_measures: 11, use_symbols: false, padding_left: 20, padding_right: 20 },
        { number_of_measures: 11, use_symbols: true, symbol_spacing: 5 },
        { number_of_measures: 11, use_symbols: false, line: 3, number_line: 2 },
        { number_of_measures: 11, use_symbols: true, line: 3, number_line: 2 },
        [{ options: { spacing_between_lines_px: 15 } },
          { number_of_measures: 12 },
        ],
        [{ options: { spacing_between_lines_px: 15 } },
          { number_of_measures: 9, use_symbols: true },
        ],
        [{ options: { spacing_between_lines_px: 15 } },
          { number_of_measures: 12, spacing_between_lines_px: 15, number_glyph_point: 40 * 1.5 },
        ],
        [{ options: { spacing_between_lines_px: 15 } },
          { number_of_measures: 9, spacing_between_lines_px: 15, use_symbols: true,
            number_glyph_point: 40 * 1.5 },
        ],
        [{ options: { spacing_between_lines_px: 15 } },
          { number_of_measures: 9, spacing_between_lines_px: 15, use_symbols: true,
            number_glyph_point: 40 * 1.5,
            semibrave_rest_glyph_scale: VF.DEFAULT_NOTATION_FONT_SCALE * 1.5 },
        ],
      ];

      const staveWidth = 100;
      var x = 0;
      var y = 0;
      const mmrests = params.map(function(param) {
        if ((x + (staveWidth * 2)) > width) {
          x = 0;
          y += 80;
        }
        var staveParams = {};
        var mmrestParams = param;
        if (param.length) {
          staveParams = param[0];
          mmrestParams = param[1];
        }
        staveParams.x = x;
        x += staveWidth;
        staveParams.y = y;
        staveParams.width = staveWidth;
        const stave = vf.Stave(staveParams);
        return vf.MultiMeasureRest(mmrestParams).setStave(stave);
      });

      vf.draw();

      var xs = mmrests[0].getXs();
      const strY = mmrests[0].getStave().getYForLine(-0.5);
      const str = 'TACET';
      const context = vf.getContext();
      context.save();
      context.setFont('Times', 16, 'bold');
      const metrics = context.measureText('TACET');
      context.fillText(str, xs.left + ((xs.right - xs.left) * 0.5) - (metrics.width * 0.5), strY);
      context.restore();


      ok(true, 'Simple Test');
    },
    staveWithModifiers: function(options) {
      const width = 910;
      const vf = VF.Test.makeFactory(options, width, 200);
      // const stave = vf.Stave({ y: 20, width: 270 });
      var x = 0;
      var y = 0;

      const params = [
        [{ clef: 'treble', params: { width: 150 } },
          { number_of_measures: 5 },
        ],
        [{ clef: 'treble', keySig: 'G', params: { width: 150 } },
          { number_of_measures: 5 },
        ],
        [{ clef: 'treble', timeSig: '4/4', keySig: 'G', params: { width: 150 } },
          { number_of_measures: 5 },
        ],
        [{ clef: 'treble', endClef: 'bass', params: { width: 150 } },
          { number_of_measures: 5 },
        ],
        [{ clef: 'treble', endKeySig: 'F', params: { width: 150 } },
          { number_of_measures: 5 },
        ],
        [{ clef: 'treble', endTimeSig: '2/4', params: { width: 150 } },
          { number_of_measures: 5 },
        ],
        [{ clef: 'treble', endClef: 'bass', endTimeSig: '2/4', params: { width: 150 } },
          { number_of_measures: 5 },
        ],
        [{ clef: 'treble', endClef: 'bass', endTimeSig: '2/4', params: { width: 150 } },
          { number_of_measures: 5, use_symbols: true },
        ],
      ];

      params.map(function(param) {
        const staveOptions = param[0];
        const staveParams = staveOptions.params;
        const mmrestParams = param[1];

        if (x + staveParams.width > width) {
          x = 0;
          y += 80;
        }

        staveParams.x = x;
        x += staveParams.width;
        staveParams.y = y;
        const stave = vf.Stave(staveParams);
        if (staveOptions.clef) {
          stave.addClef(staveOptions.clef);
        }
        if (staveOptions.timeSig) {
          stave.addTimeSignature(staveOptions.timeSig);
        }
        if (staveOptions.keySig) {
          stave.addKeySignature(staveOptions.keySig);
        }
        if (staveOptions.endClef) {
          stave.addEndClef(staveOptions.endClef);
        }
        if (staveOptions.endKeySig) {
          stave.setEndKeySignature(staveOptions.endKeySig);
        }
        if (staveOptions.endTimeSig) {
          stave.setEndTimeSignature(staveOptions.endTimeSig);
        }
        return vf.MultiMeasureRest(mmrestParams).setStave(stave);
      });

      vf.draw();

      ok(true, 'Stave with modifiers Test');
    },
  };
}());

/**
 * VexFlow - Music API Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Music = (function() {
  var Music = {
    Start: function() {
      QUnit.module('Music');
      test('Valid Notes', Music.validNotes);
      test('Valid Keys', Music.validKeys);
      test('Note Values', Music.noteValue);
      test('Interval Values', Music.intervalValue);
      test('Relative Notes', Music.relativeNotes);
      test('Relative Note Names', Music.relativeNoteNames);
      test('Canonical Notes', Music.canonicalNotes);
      test('Canonical Intervals', Music.canonicalNotes);
      test('Scale Tones', Music.scaleTones);
      test('Scale Intervals', Music.scaleIntervals);
    },

    validNotes: function() {
      expect(10);

      var music = new VF.Music();

      var parts = music.getNoteParts('c');
      equal(parts.root, 'c');
      equal(parts.accidental, null);

      parts = music.getNoteParts('C');
      equal(parts.root, 'c');
      equal(parts.accidental, null);

      parts = music.getNoteParts('c#');
      equal(parts.root, 'c');
      equal(parts.accidental, '#');

      parts = music.getNoteParts('c##');
      equal(parts.root, 'c');
      equal(parts.accidental, '##');

      try {
        music.getNoteParts('r');
      } catch (e) {
        equal(e.code, 'BadArguments', 'Invalid note: r');
      }

      try {
        music.getNoteParts('');
      } catch (e) {
        equal(e.code, 'BadArguments', "Invalid note: ''");
      }
    },

    validKeys: function() {
      expect(18);

      var music = new VF.Music();

      var parts = music.getKeyParts('c');
      equal(parts.root, 'c');
      equal(parts.accidental, null);
      equal(parts.type, 'M');

      parts = music.getKeyParts('d#');
      equal(parts.root, 'd');
      equal(parts.accidental, '#');
      equal(parts.type, 'M');

      parts = music.getKeyParts('fbm');
      equal(parts.root, 'f');
      equal(parts.accidental, 'b');
      equal(parts.type, 'm');

      parts = music.getKeyParts('c#mel');
      equal(parts.root, 'c');
      equal(parts.accidental, '#');
      equal(parts.type, 'mel');

      parts = music.getKeyParts('g#harm');
      equal(parts.root, 'g');
      equal(parts.accidental, '#');
      equal(parts.type, 'harm');

      try {
        music.getKeyParts('r');
      } catch (e) {
        equal(e.code, 'BadArguments', 'Invalid key: r');
      }

      try {
        music.getKeyParts('');
      } catch (e) {
        equal(e.code, 'BadArguments', "Invalid key: ''");
      }

      try {
        music.getKeyParts('#m');
      } catch (e) {
        equal(e.code, 'BadArguments', 'Invalid key: #m');
      }
    },

    noteValue: function() {
      expect(3);

      var music = new VF.Music();

      var note = music.getNoteValue('c');
      equal(note, 0);

      try {
        music.getNoteValue('r');
      } catch (e) {
        ok(true, 'Invalid note');
      }

      note = music.getNoteValue('f#');
      equal(note, 6);
    },

    intervalValue: function() {
      expect(2);

      var music = new VF.Music();

      var value = music.getIntervalValue('b2');
      equal(value, 1);

      try {
        music.getIntervalValue('7');
      } catch (e) {
        ok(true, 'Invalid note');
      }
    },

    relativeNotes: function() {
      expect(8);

      var music = new VF.Music();

      var value = music.getRelativeNoteValue(music.getNoteValue('c'),
        music.getIntervalValue('b5'));
      equal(value, 6);

      try {
        music.getRelativeNoteValue(music.getNoteValue('bc'),
          music.getIntervalValue('b2'));
      } catch (e) {
        ok(true, 'Invalid note');
      }

      try {
        music.getRelativeNoteValue(music.getNoteValue('b'),
          music.getIntervalValue('p3'));
      } catch (e) {
        ok(true, 'Invalid interval');
      }

      // Direction
      value = music.getRelativeNoteValue(music.getNoteValue('d'),
        music.getIntervalValue('2'), -1);
      equal(value, 0);

      try {
        music.getRelativeNoteValue(music.getNoteValue('b'),
          music.getIntervalValue('p4'), 0);
      } catch (e) {
        ok(true, 'Invalid direction');
      }

      // Rollover
      value = music.getRelativeNoteValue(music.getNoteValue('b'),
        music.getIntervalValue('b5'));
      equal(value, 5);

      // Reverse rollover
      value = music.getRelativeNoteValue(music.getNoteValue('c'),
        music.getIntervalValue('b2'), -1);
      equal(value, 11);

      // Practical tests
      value = music.getRelativeNoteValue(music.getNoteValue('g'),
        music.getIntervalValue('p5'));
      equal(value, 2);
    },

    relativeNoteNames: function() {
      expect(9);

      var music = new VF.Music();
      equal(music.getRelativeNoteName('c', music.getNoteValue('c')), 'c');
      equal(music.getRelativeNoteName('c', music.getNoteValue('db')), 'c#');
      equal(music.getRelativeNoteName('c#', music.getNoteValue('db')), 'c#');
      equal(music.getRelativeNoteName('e', music.getNoteValue('f#')), 'e##');
      equal(music.getRelativeNoteName('e', music.getNoteValue('d#')), 'eb');
      equal(music.getRelativeNoteName('e', music.getNoteValue('fb')), 'e');

      try {
        music.getRelativeNoteName('e', music.getNoteValue('g#'));
      } catch (e) {
        ok(true, 'Too far');
      }

      equal(music.getRelativeNoteName('b', music.getNoteValue('c#')), 'b##');
      equal(music.getRelativeNoteName('c', music.getNoteValue('b')), 'cb');
    },

    canonicalNotes: function() {
      expect(3);

      var music = new VF.Music();

      equal(music.getCanonicalNoteName(0), 'c');
      equal(music.getCanonicalNoteName(2), 'd');

      try {
        music.getCanonicalNoteName(-1);
      } catch (e) {
        ok(true, 'Invalid note value');
      }
    },

    canonicalIntervals: function() {
      expect(3);

      var music = new VF.Music();

      equal(music.getCanonicalIntervalName(0), 'unison');
      equal(music.getCanonicalIntervalName(2), 'M2');

      try {
        music.getCanonicalIntervalName(-1);
      } catch (e) {
        ok(true, 'Invalid interval value');
      }
    },

    scaleTones: function() {
      expect(24);

      // C Major
      var music = new VF.Music();
      var manager = new VF.KeyManager('CM');

      var c_major = music.getScaleTones(
        music.getNoteValue('c'), VF.Music.scales.major);
      var values = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

      equal(c_major.length, 7);

      for (var cm = 0; cm < c_major.length; ++cm) {
        equal(music.getCanonicalNoteName(c_major[cm]), values[cm]);
      }

      // Dorian
      var c_dorian = music.getScaleTones(
        music.getNoteValue('c'), VF.Music.scales.dorian);
      values = ['c', 'd', 'eb', 'f', 'g', 'a', 'bb'];

      var note = null;
      equal(c_dorian.length, 7);
      for (var cd = 0; cd < c_dorian.length; ++cd) {
        note = music.getCanonicalNoteName(c_dorian[cd]);
        equal(manager.selectNote(note).note, values[cd]);
      }

      // Mixolydian
      var c_mixolydian = music.getScaleTones(
        music.getNoteValue('c'), VF.Music.scales.mixolydian);
      values = ['c', 'd', 'e', 'f', 'g', 'a', 'bb'];

      equal(c_mixolydian.length, 7);

      for (var i = 0; i < c_mixolydian.length; ++i) {
        note = music.getCanonicalNoteName(c_mixolydian[i]);
        equal(manager.selectNote(note).note, values[i]);
      }
    },

    scaleIntervals: function() {
      expect(6);

      var music = new VF.Music();

      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
        music.getNoteValue('c'), music.getNoteValue('d'))), 'M2');
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
        music.getNoteValue('g'), music.getNoteValue('c'))), 'p4');
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
        music.getNoteValue('c'), music.getNoteValue('c'))), 'unison');
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
        music.getNoteValue('f'), music.getNoteValue('cb'))), 'dim5');

      // Forwards and backwards
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
        music.getNoteValue('d'), music.getNoteValue('c'), 1)), 'b7');
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
        music.getNoteValue('d'), music.getNoteValue('c'), -1)), 'M2');
    },
  };

  return Music;
})();

/**
 * VexFlow - NoteHead Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.NoteHead = (function() {
  var NoteHead = {
    Start: function() {
      QUnit.module('NoteHead');
      VF.Test.runTests('Basic', VF.Test.NoteHead.basic);
      VF.Test.runTests('Various Heads', VF.Test.NoteHead.variousHeads);
      VF.Test.runTests('Drum Chord Heads', VF.Test.NoteHead.drumChordHeads);
      VF.Test.runTests('Bounding Boxes', VF.Test.NoteHead.basicBoundingBoxes);
    },

    setupContext: function(options, x, y) {
      var ctx = new options.contextBuilder(options.elementId, x || 450, y || 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.font = ' 10pt Arial';
      var stave = new VF.Stave(10, 10, x || 450).addTrebleGlyph();

      return { context: ctx, stave: stave };
    },

    showNote: function(note_struct, stave, ctx, x) {
      var note = new VF.StaveNote(note_struct).setStave(stave);

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(x);

      note.setContext(ctx).draw();

      return note;
    },

    basic: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.NoteHead.setupContext(options, 450, 250);

      c.stave = new VF.Stave(10, 0, 250).addTrebleGlyph();

      c.context.scale(2.0, 2.0);
      c.stave.setContext(c.context).draw();

      var formatter = new VF.Formatter();
      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);

      var note_head1 = new VF.NoteHead({
        duration: '4',
        line: 3,
      });

      var note_head2 = new VF.NoteHead({
        duration: '1',
        line: 2.5,
      });

      var note_head3 = new VF.NoteHead({
        duration: '2',
        line: 0,
      });

      voice.addTickables([note_head1, note_head2, note_head3]);
      formatter.joinVoices([voice]).formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      ok('Basic NoteHead test');
    },

    variousHeads: function(options, contextBuilder) {
      var notes = [
        { keys: ['g/5/d0'], duration: '4' },
        { keys: ['g/5/d1'], duration: '4' },
        { keys: ['g/5/d2'], duration: '4' },
        { keys: ['g/5/d3'], duration: '4' },
        { keys: ['x/'], duration: '1' },

        { keys: ['g/5/t0'], duration: '1' },
        { keys: ['g/5/t1'], duration: '4' },
        { keys: ['g/5/t2'], duration: '4' },
        { keys: ['g/5/t3'], duration: '4' },
        { keys: ['x/'], duration: '1' },

        { keys: ['g/5/x0'], duration: '1' },
        { keys: ['g/5/x1'], duration: '4' },
        { keys: ['g/5/x2'], duration: '4' },
        { keys: ['g/5/x3'], duration: '4' },
        { keys: ['x/'], duration: '1' },

        { keys: ['g/5/s1'], duration: '4' },
        { keys: ['g/5/s2'], duration: '4' },
        { keys: ['x/'], duration: '1' },

        { keys: ['g/5/r1'], duration: '4' },
        { keys: ['g/5/r2'], duration: '4' },
      ];

      var ctx = new contextBuilder(options.elementId, notes.length * 25 + 100, 240);

      // Draw two staves, one with up-stems and one with down-stems.
      for (var h = 0; h < 2; ++h) {
        var stave = new VF.Stave(10, 10 + h * 120, notes.length * 25 + 75)
          .addClef('percussion')
          .setContext(ctx)
          .draw();

        for (var i = 0; i < notes.length; ++i) {
          var note = notes[i];
          note.stem_direction = (h === 0 ? -1 : 1);
          var staveNote = NoteHead.showNote(note, stave, ctx, (i + 1) * 25);

          ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
          ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
        }
      }
    },

    drumChordHeads: function(options, contextBuilder) {
      var notes = [
        { keys: ['a/4/d0', 'g/5/x3'], duration: '4' },
        { keys: ['a/4/x3', 'g/5/d0'], duration: '4' },
        { keys: ['a/4/d1', 'g/5/x2'], duration: '4' },
        { keys: ['a/4/x2', 'g/5/d1'], duration: '4' },
        { keys: ['a/4/d2', 'g/5/x1'], duration: '4' },
        { keys: ['a/4/x1', 'g/5/d2'], duration: '4' },
        { keys: ['a/4/d3', 'g/5/x0'], duration: '4' },
        { keys: ['a/4/x0', 'g/5/d3'], duration: '4' },

        { keys: ['a/4', 'g/5/d0'], duration: '4' },
        { keys: ['a/4/x3', 'g/5'], duration: '4' },

        { keys: ['a/4/t0', 'g/5/s1'], duration: '4' },
        { keys: ['a/4/s1', 'g/5/t0'], duration: '4' },
        { keys: ['a/4/t1', 'g/5/s2'], duration: '4' },
        { keys: ['a/4/s2', 'g/5/t1'], duration: '4' },
        { keys: ['a/4/t2', 'g/5/r1'], duration: '4' },
        { keys: ['a/4/r1', 'g/5/t2'], duration: '4' },
        { keys: ['a/4/t3', 'g/5/r2'], duration: '4' },
        { keys: ['a/4/r2', 'g/5/t3'], duration: '4' },
      ];

      var ctx = new contextBuilder(options.elementId, notes.length * 25 + 100, 240);

      // Draw two staves, one with up-stems and one with down-stems.
      for (var h = 0; h < 2; ++h) {
        var stave = new VF.Stave(10, 10 + h * 120, notes.length * 25 + 75)
          .addClef('percussion')
          .setContext(ctx)
          .draw();

        for (var i = 0; i < notes.length; ++i) {
          var note = notes[i];
          note.stem_direction = (h === 0 ? -1 : 1);
          var staveNote = NoteHead.showNote(note, stave, ctx, (i + 1) * 25);

          ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
          ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
        }
      }
    },

    basicBoundingBoxes: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.NoteHead.setupContext(options, 350, 250);

      c.stave = new VF.Stave(10, 0, 250).addTrebleGlyph();

      c.context.scale(2.0, 2.0);
      c.stave.setContext(c.context).draw();

      var formatter = new VF.Formatter();
      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);

      var note_head1 = new VF.NoteHead({
        duration: '4',
        line: 3,
      });

      var note_head2 = new VF.NoteHead({
        duration: '2',
        line: 2.5,
      });

      var note_head3 = new VF.NoteHead({
        duration: '1',
        line: 0,
      });

      voice.addTickables([note_head1, note_head2, note_head3]);
      formatter.joinVoices([voice]).formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      note_head1.getBoundingBox().draw(c.context);
      note_head2.getBoundingBox().draw(c.context);
      note_head3.getBoundingBox().draw(c.context);

      ok('NoteHead Bounding Boxes');
    },
  };

  return NoteHead;
})();

/**
 * VexFlow - NoteSubGroup Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 * Author Taehoon Moon 2016
 */

VF.Test.NoteSubGroup = (function() {
  var NoteSubGroup = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('NoteSubGroup');

      run('Basic - ClefNote, TimeSigNote and BarNote', VF.Test.NoteSubGroup.draw);
      run('Multi Voice', VF.Test.NoteSubGroup.drawMultiVoice);
      run('Multi Voice Multiple Draws', VF.Test.NoteSubGroup.drawMultiVoiceMultipleDraw);
      run('Multi Staff', VF.Test.NoteSubGroup.drawMultiStaff);
    },

    draw: function(options) {
      var vf = VF.Test.makeFactory(options, 750, 200);
      var ctx = vf.getContext();
      var stave = vf.Stave({ width: 600 }).addClef('treble');

      var notes = [
        { keys: ['f/5'], stem_direction: -1, duration: '4' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'bass' },
        { keys: ['g/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['a/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['c/4'], stem_direction: -1, duration: '4', clef: 'tenor' },
        { keys: ['c/3'], stem_direction: +1, duration: '4', clef: 'tenor' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'tenor' },
        { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'tenor' },
      ].map(vf.StaveNote.bind(vf));

      function addAccidental(note, acc) {
        return note.addModifier(0, vf.Accidental({ type: acc }));
      }

      function addSubGroup(note, subNotes) {
        return note.addModifier(0, vf.NoteSubGroup({ notes: subNotes }));
      }

      // {SubNotes} | {Accidental} | {StaveNote}
      addAccidental(notes[1], '#');
      addAccidental(notes[2], 'n');

      addSubGroup(notes[1], [
        vf.ClefNote({ type: 'bass', options: { size: 'small' } }),
      ]);
      addSubGroup(notes[2], [
        vf.ClefNote({ type: 'alto', options: { size: 'small' } }),
      ]);
      addSubGroup(notes[4], [
        vf.ClefNote({ type: 'tenor', options: { size: 'small' } }),
        new VF.BarNote(),
      ]);
      addSubGroup(notes[5], [
        vf.TimeSigNote({ time: '6/8' }),
      ]);
      addSubGroup(notes[6], [
        new VF.BarNote(VF.Barline.type.REPEAT_BEGIN),
      ]);

      addAccidental(notes[4], 'b');
      addAccidental(notes[6], 'bb');

      var voice = vf.Voice().setStrict(false).addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      notes.forEach(function(note) {
        Vex.Flow.Test.plotNoteWidth(ctx, note, 150);
      });

      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 620, 120);

      ok(true, 'all pass');
    },

    drawMultiVoice: function(options) {
      var vf = VF.Test.makeFactory(options, 550, 200);
      var ctx = vf.getContext();
      var stave = vf.Stave().addClef('treble');

      var notes1 = [
        { keys: ['f/5'], stem_direction: 1, duration: '4' },
        { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
      ].map(vf.StaveNote.bind(vf));

      var notes2 = [
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
      ].map(vf.StaveNote.bind(vf));

      function addAccidental(note, accid) {
        return note.addModifier(0, vf.Accidental({ type: accid }));
      }
      function addSubGroup(note, subNotes) {
        return note.addModifier(0, vf.NoteSubGroup({ notes: subNotes }));
      }

      addAccidental(notes1[1], '#');

      addSubGroup(notes1[1], [
        vf.ClefNote({ type: 'bass', options: { size: 'small' } }),
        new VF.BarNote(VF.Barline.type.REPEAT_BEGIN),
        vf.TimeSigNote({ time: '3/4' }),
      ]);
      addSubGroup(notes2[2], [
        vf.ClefNote({ type: 'alto', options: { size: 'small' } }),
        vf.TimeSigNote({ time: '9/8' }),
        new VF.BarNote(VF.Barline.type.DOUBLE),
      ]);
      addSubGroup(notes1[3], [
        vf.ClefNote({ type: 'soprano', options: { size: 'small' } }),
      ]);

      addAccidental(notes1[2], 'b');
      addAccidental(notes2[3], '#');

      var voices = [
        vf.Voice().addTickables(notes1),
        vf.Voice().addTickables(notes2),
      ];

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();

      notes1.forEach(function(note) {
        Vex.Flow.Test.plotNoteWidth(ctx, note, 150);
      });

      ok(true, 'all pass');
    },

    // draws multiple times. prevents incremental x-shift each draw.
    drawMultiVoiceMultipleDraw: function(options) {
      var vf = VF.Test.makeFactory(options, 550, 200);
      var ctx = vf.getContext();
      var stave = vf.Stave().addClef('treble');

      var notes1 = [
        { keys: ['f/5'], stem_direction: 1, duration: '4' },
        { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
      ].map(vf.StaveNote.bind(vf));

      var notes2 = [
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
      ].map(vf.StaveNote.bind(vf));

      function addAccidental(note, accid) {
        return note.addModifier(0, vf.Accidental({ type: accid }));
      }
      function addSubGroup(note, subNotes) {
        return note.addModifier(0, vf.NoteSubGroup({ notes: subNotes }));
      }

      addAccidental(notes1[1], '#');

      addSubGroup(notes1[1], [
        vf.ClefNote({ type: 'bass', options: { size: 'small' } }),
        new VF.BarNote(VF.Barline.type.REPEAT_BEGIN),
        vf.TimeSigNote({ time: '3/4' }),
      ]);
      addSubGroup(notes2[2], [
        vf.ClefNote({ type: 'alto', options: { size: 'small' } }),
        vf.TimeSigNote({ time: '9/8' }),
        new VF.BarNote(VF.Barline.type.DOUBLE),
      ]);
      addSubGroup(notes1[3], [
        vf.ClefNote({ type: 'soprano', options: { size: 'small' } }),
      ]);

      addAccidental(notes1[2], 'b');
      addAccidental(notes2[3], '#');

      var voices = [
        vf.Voice().addTickables(notes1),
        vf.Voice().addTickables(notes2),
      ];

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();
      vf.draw();

      notes1.forEach(function(note) {
        Vex.Flow.Test.plotNoteWidth(ctx, note, 150);
      });

      ok(true, 'all pass');
    },

    drawMultiStaff: function(options) {
      var vf = VF.Test.makeFactory(options, 550, 400);

      vf.StaveNote = vf.StaveNote.bind(vf);

      var stave1 = vf.Stave({ x: 15, y: 30, width: 500 }).setClef('treble');
      var notes1 = [
        { keys: ['f/5'], stem_direction: 1, duration: '4' },
        { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
      ].map(vf.StaveNote);

      var notes2 = [
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
      ].map(vf.StaveNote);

      var stave2 = vf.Stave({ x: 15, y: 150, width: 500 }).setClef('bass');

      var notes3 = [
        { keys: ['e/3'], duration: '8', stem_direction: -1, clef: 'bass' },
        { keys: ['g/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['d/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['f/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['c/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['g/3'], duration: '8', stem_direction: -1, clef: 'bass' },
        { keys: ['d/3'], duration: '8', stem_direction: -1, clef: 'bass' },
        { keys: ['f/3'], duration: '8', stem_direction: -1, clef: 'bass' },
      ].map(vf.StaveNote);

      vf.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'brace' });
      vf.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'singleLeft' });
      vf.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'singleRight' });

      function addAccidental(note, acc) {
        return note.addModifier(0, vf.Accidental({ type: acc }));
      }
      function addSubGroup(note, subNotes) {
        return note.addModifier(0, vf.NoteSubGroup({ notes: subNotes }));
      }

      vf.Beam({ notes: notes3.slice(1, 4) });
      vf.Beam({ notes: notes3.slice(5) });

      addAccidental(notes1[1], '#');
      addSubGroup(notes1[1], [
        vf.ClefNote({ type: 'bass', options: { size: 'small' } }),
        vf.TimeSigNote({ time: '3/4' }),
      ]);
      addSubGroup(notes2[2], [
        vf.ClefNote({ type: 'alto', options: { size: 'small' } }),
        vf.TimeSigNote({ time: '9/8' }),
      ]);
      addSubGroup(notes1[3], [vf.ClefNote({ type: 'soprano', options: { size: 'small' } })]);
      addSubGroup(notes3[1], [vf.ClefNote({ type: 'treble', options: { size: 'small' } })]);
      addSubGroup(notes3[5], [vf.ClefNote({ type: 'bass', options: { size: 'small' } })]);
      addAccidental(notes3[0], '#');
      addAccidental(notes3[3], 'b');
      addAccidental(notes3[5], '#');
      addAccidental(notes1[2], 'b');
      addAccidental(notes2[3], '#');

      var voice = vf.Voice().addTickables(notes1);
      var voice2 = vf.Voice().addTickables(notes2);
      var voice3 = vf.Voice().addTickables(notes3);

      vf.Formatter()
        .joinVoices([voice, voice2])
        .joinVoices([voice3])
        .formatToStave([voice, voice2, voice3], stave1);

      vf.draw();

      ok(true, 'all pass');
    },
  };

  return NoteSubGroup;
})();

/*
  VexFlow - Ornament Tests
  Copyright Mohit Cheppudira 2010 <mohit@muthanna.com>
  Author: Cyril Silverman
*/

VF.Test.Ornament = (function() {
  var Ornament = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('Ornament');
      runTests('Ornaments', Ornament.drawOrnaments);
      runTests('Ornaments Vertically Shifted', Ornament.drawOrnamentsDisplaced);
      runTests('Ornaments - Delayed turns', Ornament.drawOrnamentsDelayed);
      runTests('Ornaments - Delayed turns, Multiple Draws', Ornament.drawOrnamentsDelayedMultipleDraws);
      runTests('Stacked', Ornament.drawOrnamentsStacked);
      runTests('With Upper/Lower Accidentals', Ornament.drawOrnamentsWithAccidentals);
    },

    drawOrnaments: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 750, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 700);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      ];

      notesBar1[0].addModifier(0, new VF.Ornament('mordent'));
      notesBar1[1].addModifier(0, new VF.Ornament('mordent_inverted'));
      notesBar1[2].addModifier(0, new VF.Ornament('turn'));
      notesBar1[3].addModifier(0, new VF.Ornament('turn_inverted'));
      notesBar1[4].addModifier(0, new VF.Ornament('tr'));
      notesBar1[5].addModifier(0, new VF.Ornament('upprall'));
      notesBar1[6].addModifier(0, new VF.Ornament('downprall'));
      notesBar1[7].addModifier(0, new VF.Ornament('prallup'));
      notesBar1[8].addModifier(0, new VF.Ornament('pralldown'));
      notesBar1[9].addModifier(0, new VF.Ornament('upmordent'));
      notesBar1[10].addModifier(0, new VF.Ornament('downmordent'));
      notesBar1[11].addModifier(0, new VF.Ornament('lineprall'));
      notesBar1[12].addModifier(0, new VF.Ornament('prallprall'));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsDisplaced: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 750, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 700);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      ];

      notesBar1[0].addModifier(0, new VF.Ornament('mordent'));
      notesBar1[1].addModifier(0, new VF.Ornament('mordent_inverted'));
      notesBar1[2].addModifier(0, new VF.Ornament('turn'));
      notesBar1[3].addModifier(0, new VF.Ornament('turn_inverted'));
      notesBar1[4].addModifier(0, new VF.Ornament('tr'));
      notesBar1[5].addModifier(0, new VF.Ornament('upprall'));
      notesBar1[6].addModifier(0, new VF.Ornament('downprall'));
      notesBar1[7].addModifier(0, new VF.Ornament('prallup'));
      notesBar1[8].addModifier(0, new VF.Ornament('pralldown'));
      notesBar1[9].addModifier(0, new VF.Ornament('upmordent'));
      notesBar1[10].addModifier(0, new VF.Ornament('downmordent'));
      notesBar1[11].addModifier(0, new VF.Ornament('lineprall'));
      notesBar1[12].addModifier(0, new VF.Ornament('prallprall'));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsDelayed: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 550, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 500);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      ];

      notesBar1[0].addModifier(0, new VF.Ornament('turn').setDelayed(true));
      notesBar1[1].addModifier(0, new VF.Ornament('turn_inverted').setDelayed(true));
      notesBar1[2].addModifier(0, new VF.Ornament('turn_inverted').setDelayed(true));
      notesBar1[3].addModifier(0, new VF.Ornament('turn').setDelayed(true));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsDelayedMultipleDraws: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 550, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 500);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      ];

      notesBar1[0].addModifier(0, new VF.Ornament('turn').setDelayed(true));
      notesBar1[1].addModifier(0, new VF.Ornament('turn_inverted').setDelayed(true));
      notesBar1[2].addModifier(0, new VF.Ornament('turn_inverted').setDelayed(true));
      notesBar1[3].addModifier(0, new VF.Ornament('turn').setDelayed(true));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsStacked: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 550, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 500);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      ];

      notesBar1[0].addModifier(0, new VF.Ornament('mordent'));
      notesBar1[1].addModifier(0, new VF.Ornament('turn_inverted'));
      notesBar1[2].addModifier(0, new VF.Ornament('turn'));
      notesBar1[3].addModifier(0, new VF.Ornament('turn_inverted'));

      notesBar1[0].addModifier(0, new VF.Ornament('turn'));
      notesBar1[1].addModifier(0, new VF.Ornament('prallup'));
      notesBar1[2].addModifier(0, new VF.Ornament('upmordent'));
      notesBar1[3].addModifier(0, new VF.Ornament('lineprall'));


      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsWithAccidentals: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 650, 250);

      // bar 1
      var staveBar1 = new VF.Stave(10, 60, 600);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      ];

      notesBar1[0].addModifier(0, new VF.Ornament('mordent').setUpperAccidental('#').setLowerAccidental('#'));
      notesBar1[1].addModifier(0, new VF.Ornament('turn_inverted').setLowerAccidental('b').setUpperAccidental('b'));
      notesBar1[2].addModifier(0, new VF.Ornament('turn').setUpperAccidental('##').setLowerAccidental('##'));
      notesBar1[3].addModifier(0, new VF.Ornament('mordent_inverted').setLowerAccidental('db').setUpperAccidental('db'));
      notesBar1[4].addModifier(0, new VF.Ornament('turn_inverted').setUpperAccidental('++').setLowerAccidental('++'));
      notesBar1[5].addModifier(0, new VF.Ornament('tr').setUpperAccidental('n').setLowerAccidental('n'));
      notesBar1[6].addModifier(0, new VF.Ornament('prallup').setUpperAccidental('d').setLowerAccidental('d'));
      notesBar1[7].addModifier(0, new VF.Ornament('lineprall').setUpperAccidental('db').setLowerAccidental('db'));
      notesBar1[8].addModifier(0, new VF.Ornament('upmordent').setUpperAccidental('bbs').setLowerAccidental('bbs'));
      notesBar1[9].addModifier(0, new VF.Ornament('prallprall').setUpperAccidental('bb').setLowerAccidental('bb'));
      notesBar1[10].addModifier(0, new VF.Ornament('turn_inverted').setUpperAccidental('+').setLowerAccidental('+'));


      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },
  };

  return Ornament;
})();

/**
 * VexFlow - Parser Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Parser = (function() {
  var TestGrammar = function() {
    return {
      begin: function() { return this.BEGIN; },

      BEGIN: function() { return { expect: [this.BIGORLITTLE, this.EOL] }; },
      BIGORLITTLE: function() { return { expect: [this.BIGLINE, this.LITTLELINE], or: true }; },
      BIGLINE: function() { return { expect: [this.LBRACE, this.WORD, this.WORDS, this.MAYBEEXCLAIM, this.RBRACE] }; },
      LITTLELINE: function() { return { expect: [this.WORD, this.WORDS] }; },
      WORDS: function() { return { expect: [this.COMMA, this.WORD], zeroOrMore: true }; },
      MAYBEEXCLAIM: function() { return { expect: [this.EXCLAIM], maybe: true }; },

      LBRACE: function() { return { token: '[{]' }; },
      RBRACE: function() { return { token: '[}]' }; },
      WORD: function() { return { token: '[a-zA-Z]+' }; },
      COMMA: function() { return { token: '[,]' }; },
      EXCLAIM: function() { return { token: '[!]' }; },
      EOL: function() { return { token: '$' }; },
    };
  };

  function assertParseFail(assert, result, expectedPos, msg) {
    assert.notOk(result.success, msg);
    assert.equal(result.errorPos, expectedPos, msg);
  }

  var Parser = {
    Start: function() {
      QUnit.module('Parser');
      var VFT = Vex.Flow.Test;

      QUnit.test('Basic', VFT.Parser.basic);
      QUnit.test('Advanced', VFT.Parser.advanced);
      QUnit.test('Mixed', VFT.Parser.mixed);
    },

    basic: function(assert) {
      var grammar = new TestGrammar();
      var parser = new VF.Parser(grammar);

      grammar.BEGIN = function() { return { expect: [grammar.LITTLELINE, grammar.EOL] }; };

      var mustPass = [
        'first, second',
        'first,second',
        'first',
        'first,second, third',
      ];
      mustPass.forEach(function(line) { assert.equal(parser.parse(line).success, true, line); });
      assertParseFail(assert, parser.parse(''), 0);
      assertParseFail(assert, parser.parse('first second'), 6);
      assertParseFail(assert, parser.parse('first,,'), 5);
      assertParseFail(assert, parser.parse('first,'), 5);
      assertParseFail(assert, parser.parse(',,'), 0);
    },

    advanced: function(assert) {
      var grammar = new TestGrammar();
      var parser = new VF.Parser(grammar);

      grammar.BEGIN = function() { return { expect: [grammar.BIGLINE, grammar.EOL] }; };
      var mustPass = [
        '{first}',
        '{first!}',
        '{first,second}',
        '{first,second!}',
        '{first,second,third!}',
      ];

      mustPass.forEach(function(line) { assert.equal(parser.parse(line).success, true, line); });
      assertParseFail(assert, parser.parse('{first,second,third,}'), 19);
      assertParseFail(assert, parser.parse('first,second,third'), 0);
      assertParseFail(assert, parser.parse('{first,second,third'), 19);
      assertParseFail(assert, parser.parse('{!}'), 1);
    },

    mixed: function(assert) {
      var grammar = new TestGrammar();
      var parser = new VF.Parser(grammar);

      var mustPass = ['{first,second,third!}', 'first, second'];
      mustPass.forEach(function(line) { assert.equal(parser.parse(line).success, true, line); });
      assertParseFail(assert, parser.parse('first second'), 6);
    },
  };

  return Parser;
})();

/**
 * VexFlow - PedalMarking Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.PedalMarking = (function() {
  var PedalMarking = {
    test: function(makePedal) {
      return function(options) {
        var vf = VF.Test.makeFactory(options, 550, 200);
        var score = vf.EasyScore();

        var stave0 = vf.Stave({ width: 250 }).addTrebleGlyph();
        var voice0 = score.voice(score.notes('b4/4, b4, b4, b4[stem="down"]', { stem: 'up' }));
        vf.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);

        var stave1 = vf.Stave({ width: 260, x: 250 });
        var voice1 = score.voice(score.notes('c4/4, c4, c4, c4', { stem: 'up' }));
        vf.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

        makePedal(vf, voice0.getTickables(), voice1.getTickables());

        vf.draw();

        ok(true, 'Must render');
      };
    },

    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('PedalMarking');

      var test = PedalMarking.test;

      function makeSimplePedal(style) {
        return function(factory, notes0, notes1) {
          return factory.PedalMarking({
            notes: [notes0[0], notes0[2], notes0[3], notes1[3]],
            options: { style: style },
          });
        };
      }

      runTests('Simple Pedal 1', test(makeSimplePedal('text')));
      runTests('Simple Pedal 2', test(makeSimplePedal('bracket')));
      runTests('Simple Pedal 3', test(makeSimplePedal('mixed')));

      function makeReleaseAndDepressedPedal(style) {
        return function(factory, notes0, notes1) {
          return factory.PedalMarking({
            notes: [notes0[0], notes0[3], notes0[3], notes1[1], notes1[1], notes1[3]],
            options: { style: style },
          });
        };
      }

      runTests('Release and Depress on Same Note 1', test(makeReleaseAndDepressedPedal('bracket')));
      runTests('Release and Depress on Same Note 2', test(makeReleaseAndDepressedPedal('mixed')));

      runTests('Custom Text 1', test(function(factory, notes0, notes1) {
        var pedal = factory.PedalMarking({
          notes: [notes0[0], notes1[3]],
          options: { style: 'text' },
        });
        pedal.setCustomText('una corda', 'tre corda');
        return pedal;
      }));

      runTests('Custom Text 2', test(function(factory, notes0, notes1) {
        var pedal = factory.PedalMarking({
          notes: [notes0[0], notes1[3]],
          options: { style: 'mixed' },
        });
        pedal.setCustomText('Sost. Ped.');
        return pedal;
      }));
    },
  };

  return PedalMarking;
})();

/**
 * VexFlow - Percussion Tests
 * Copyright Mike Corrigan 2012 <corrigan@gmail.com>
 */

function createSingleMeasureTest(setup) {
  return function(options) {
    var vf = VF.Test.makeFactory(options, 500);
    var stave = vf.Stave().addClef('percussion');

    setup(vf);

    vf.Formatter()
      .joinVoices(vf.getVoices())
      .formatToStave(vf.getVoices(), stave);

    vf.draw();

    ok(true);
  };
}

VF.Test.Percussion = (function() {
  function showNote(note_struct, stave, ctx, x) {
    var note = new VF.StaveNote(note_struct).setStave(stave);

    new VF.TickContext()
      .addTickable(note)
      .preFormat()
      .setX(x);

    note.setContext(ctx).draw();

    return note;
  }

  var Percussion = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('Percussion');

      run('Percussion Clef', Percussion.draw);
      run('Percussion Notes', Percussion.drawNotes);

      run('Percussion Basic0', createSingleMeasureTest(function(vf) {
        var voice0 = vf.Voice().addTickables([
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
        ]);

        var voice1 = vf.Voice().addTickables([
          vf.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
          vf.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
          vf.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
          vf.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
          vf.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
        ]);

        vf.Beam({ notes: voice0.getTickables() });
        vf.Beam({ notes: voice1.getTickables().slice(0, 2) });
        vf.Beam({ notes: voice1.getTickables().slice(3, 6) });
      }));

      run('Percussion Basic1', createSingleMeasureTest(function(vf) {
        vf.Voice().addTickables([
          vf.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
          vf.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
          vf.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
          vf.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
        ]);

        vf.Voice().addTickables([
          vf.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
        ]);
      }));

      run('Percussion Basic2', createSingleMeasureTest(function(vf) {
        var voice0 = vf.Voice().addTickables([
          vf.StaveNote({ keys: ['a/5/x3'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5'], duration: '8' }),
          vf.StaveNote({ keys: ['g/4/n', 'g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
        ]);
        vf.Beam({ notes: voice0.getTickables().slice(1, 8) });

        var voice1 = vf.Voice().addTickables([
          vf.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
          vf.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
          vf.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '8d', stem_direction: -1 }).addDotToAll(),
          vf.StaveNote({ keys: ['c/5'], duration: '16', stem_direction: -1 }),
        ]);

        vf.Beam({ notes: voice1.getTickables().slice(0, 2) });
        vf.Beam({ notes: voice1.getTickables().slice(4, 6) });
      }));

      run('Percussion Snare0', createSingleMeasureTest(function(vf) {
        vf.Voice().addTickables([
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addArticulation(0, vf.Articulation({ type: 'a>' }))
            .addModifier(0, vf.Annotation({ text: 'L' })),
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addModifier(0, vf.Annotation({ text: 'R' })),
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addModifier(0, vf.Annotation({ text: 'L' })),
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addModifier(0, vf.Annotation({ text: 'L' })),
        ]);
      }));

      run('Percussion Snare1', createSingleMeasureTest(function(vf) {
        vf.Voice().addTickables([
          vf.StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 })
            .addArticulation(0, vf.Articulation({ type: 'ah' })),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 })
            .addArticulation(0, vf.Articulation({ type: 'ah' })),
          vf.StaveNote({ keys: ['a/5/x3'], duration: '4', stem_direction: -1 })
            .addArticulation(0, vf.Articulation({ type: 'a,' })),
        ]);
      }));

      run('Percussion Snare2', createSingleMeasureTest(function(vf) {
        vf.Voice().addTickables([
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addArticulation(0, new VF.Tremolo(1)),
          vf.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addArticulation(0, new VF.Tremolo(1)),
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addArticulation(0, new VF.Tremolo(3)),
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addArticulation(0, new VF.Tremolo(5)),
        ]);
      }));

      run('Percussion Snare3', createSingleMeasureTest(function(vf) {
        vf.Voice().addTickables([
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: 1 })
            .addArticulation(0, new VF.Tremolo(2)),
          vf.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: 1 })
            .addArticulation(0, new VF.Tremolo(2)),
          vf.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: 1 })
            .addArticulation(0, new VF.Tremolo(3)),
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: 1 })
            .addArticulation(0, new VF.Tremolo(5)),
        ]);
      }));
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 120);

      new VF.Stave(10, 10, 300)
        .addClef('percussion')
        .setContext(ctx)
        .draw();

      ok(true);
    },

    drawNotes: function(options, contextBuilder) {
      var notes = [
        { keys: ['g/5/d0'], duration: '4' },
        { keys: ['g/5/d1'], duration: '4' },
        { keys: ['g/5/d2'], duration: '4' },
        { keys: ['g/5/d3'], duration: '4' },
        { keys: ['x/'], duration: '1' },

        { keys: ['g/5/t0'], duration: '1' },
        { keys: ['g/5/t1'], duration: '4' },
        { keys: ['g/5/t2'], duration: '4' },
        { keys: ['g/5/t3'], duration: '4' },
        { keys: ['x/'], duration: '1' },

        { keys: ['g/5/x0'], duration: '1' },
        { keys: ['g/5/x1'], duration: '4' },
        { keys: ['g/5/x2'], duration: '4' },
        { keys: ['g/5/x3'], duration: '4' },
      ];

      var ctx = new contextBuilder(options.elementId, notes.length * 25 + 100, 240);

      // Draw two staves, one with up-stems and one with down-stems.
      for (var h = 0; h < 2; ++h) {
        var stave = new VF.Stave(10, 10 + h * 120, notes.length * 25 + 75)
          .addClef('percussion')
          .setContext(ctx)
          .draw();

        for (var i = 0; i < notes.length; ++i) {
          var note = notes[i];
          note.stem_direction = (h === 0 ? -1 : 1);
          var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

          ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
          ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
        }
      }
    },
  };

  return Percussion;
})();

/**
 * VexFlow - Registry Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Registry = (function() {
  var Registry = {
    Start: function() {
      QUnit.module('Registry');
      var VFT = Vex.Flow.Test;

      QUnit.test('Register and Clear', VFT.Registry.registerAndClear);
      QUnit.test('Default Registry', VFT.Registry.defaultRegistry);
      QUnit.test('Multiple Classes', VFT.Registry.classes);
    },

    registerAndClear: function(assert) {
      var registry = new VF.Registry();
      var score = new VF.EasyScore({ factory: VF.Factory.newFromElementId(null) });

      registry.register(score.notes('C4')[0], 'foobar');

      var foobar = registry.getElementById('foobar');
      assert.ok(foobar);
      assert.equal(foobar.getAttribute('id'), 'foobar');

      registry.clear();
      assert.notOk(registry.getElementById('foobar'));
      assert.throws(function() { registry.register(score.notes('C4')); });

      registry.clear();
      assert.ok(registry
        .register(score.notes('C4[id="boobar"]')[0])
        .getElementById('boobar'));
    },

    defaultRegistry: function(assert) {
      var registry = new VF.Registry();
      var score = new VF.EasyScore({ factory: VF.Factory.newFromElementId(null) });

      VF.Registry.enableDefaultRegistry(registry);
      score.notes('C4[id="foobar"]');
      const note = registry.getElementById('foobar');
      assert.ok(note);

      note.setAttribute('id', 'boobar');
      assert.ok(registry.getElementById('boobar'));
      assert.notOk(registry.getElementById('foobar'));

      registry.clear();
      assert.equal(registry.getElementsByType('StaveNote').length, 0);

      score.notes('C5');
      var elements = registry.getElementsByType('StaveNote');
      assert.equal(elements.length, 1);
    },

    classes: function(assert) {
      var registry = new VF.Registry();
      var score = new VF.EasyScore({ factory: VF.Factory.newFromElementId(null) });

      VF.Registry.enableDefaultRegistry(registry);
      score.notes('C4[id="foobar"]');
      const note = registry.getElementById('foobar');

      note.addClass('foo');
      assert.ok(note.hasClass('foo'));
      assert.notOk(note.hasClass('boo'));
      assert.equal(registry.getElementsByClass('foo').length, 1);
      assert.equal(registry.getElementsByClass('boo').length, 0);

      note.addClass('boo');
      assert.ok(note.hasClass('foo'));
      assert.ok(note.hasClass('boo'));
      assert.equal(registry.getElementsByClass('foo').length, 1);
      assert.equal(registry.getElementsByClass('boo').length, 1);

      note.removeClass('boo');
      note.removeClass('foo');
      assert.notOk(note.hasClass('foo'));
      assert.notOk(note.hasClass('boo'));
      assert.equal(registry.getElementsByClass('foo').length, 0);
      assert.equal(registry.getElementsByClass('boo').length, 0);
    },
  };

  return Registry;
}());

/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

VF.Test.Rests = (function() {
  var Rests = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('Rests');

      run('Rests - Dotted', Rests.basic);
      run('Auto Align Rests - Beamed Notes Stems Up', Rests.beamsUp);
      run('Auto Align Rests - Beamed Notes Stems Down', Rests.beamsDown);
      run('Auto Align Rests - Tuplets Stems Up', Rests.tuplets);
      run('Auto Align Rests - Tuplets Stems Down', Rests.tupletsdown);
      run('Auto Align Rests - Single Voice (Default)', Rests.staveRests);
      run('Auto Align Rests - Single Voice (Align All)', Rests.staveRestsAll);
      run('Auto Align Rests - Multi Voice', Rests.multi);
    },

    setupContext: function(options, contextBuilder, x, y) {
      var ctx = new contextBuilder(options.elementId, x || 350, y || 150);
      ctx.scale(0.9, 0.9);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      ctx.font = ' 10pt Arial';

      var stave = new VF.Stave(10, 30, x || 350)
        .addTrebleGlyph()
        .addTimeSignature('4/4')
        .setContext(ctx)
        .draw();

      return {
        context: ctx,
        stave: stave,
      };
    },

    basic: function(options, contextBuilder) {
      var c = VF.Test.Rests.setupContext(options, contextBuilder, 700);

      var notes = [
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'wr' }).addDotToAll(),
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'hr' }).addDotToAll(),
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }).addDotToAll(),
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }).addDotToAll(),
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '16r' }).addDotToAll(),
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '32r' }).addDotToAll(),
        new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '64r' }).addDotToAll(),
      ];

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      ok(true, 'Dotted Rest Test');
    },

    beamsUp: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['e/5'], stem_direction: 1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        newNote({ keys: ['b/5'], stem_direction: 1, duration: '8' }),
        newNote({ keys: ['c/5'], stem_direction: 1, duration: '8' }),

        newNote({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: 1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        newNote({ keys: ['c/4'], stem_direction: 1, duration: '8' }),

        newNote({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: 1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        newNote({ keys: ['c/4'], stem_direction: 1, duration: '8' }),

      ];

      var beam1 = new VF.Beam(notes.slice(0, 4));
      var beam2 = new VF.Beam(notes.slice(4, 8));
      var beam3 = new VF.Beam(notes.slice(8, 12));

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();

      ok(true, 'Auto Align Rests - Beams Up Test');
    },

    beamsDown: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['c/5'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['e/4'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['e/4'], stem_direction: -1, duration: '8' }),

      ];

      var beam1 = new VF.Beam(notes.slice(0, 4));
      var beam2 = new VF.Beam(notes.slice(4, 8));
      var beam3 = new VF.Beam(notes.slice(8, 12));

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();

      ok(true, 'Auto Align Rests - Beams Down Test');
    },

    tuplets: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
        newNote({ keys: ['a/5'], stem_direction: 1, duration: '4r' }),

        newNote({ keys: ['a/5'], stem_direction: 1, duration: '4r' }),
        newNote({ keys: ['g/5'], stem_direction: 1, duration: '4r' }),
        newNote({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

        newNote({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
        newNote({ keys: ['g/5'], stem_direction: 1, duration: '4r' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4' }),

        newNote({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
      ];

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3)).setTupletLocation(VF.Tuplet.LOCATION_TOP);
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6)).setTupletLocation(VF.Tuplet.LOCATION_TOP);
      var tuplet3 = new VF.Tuplet(notes.slice(6, 9)).setTupletLocation(VF.Tuplet.LOCATION_TOP);
      var tuplet4 = new VF.Tuplet(notes.slice(9, 12)).setTupletLocation(VF.Tuplet.LOCATION_TOP);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();
      tuplet4.setContext(c.context).draw();

      ok(true, 'Auto Align Rests - Tuplets Stem Up Test');
    },

    tupletsdown: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['g/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/5'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      ];

      var beam1 = new VF.Beam(notes.slice(0, 3));
      var beam2 = new VF.Beam(notes.slice(3, 6));
      var beam3 = new VF.Beam(notes.slice(6, 9));
      var beam4 = new VF.Beam(notes.slice(9, 12));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3))
        .setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6))
        .setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      var tuplet3 = new VF.Tuplet(notes.slice(6, 9))
        .setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      var tuplet4 = new VF.Tuplet(notes.slice(9, 12))
        .setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();
      tuplet4.setContext(c.context).draw();

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();
      beam4.setContext(c.context).draw();

      ok(true, 'Auto Align Rests - Tuplets Stem Down Test');
    },

    staveRests: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        newNote({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
        newNote({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),

        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['e/5'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
        newNote({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

        newNote({ keys: ['d/5'], stem_direction: -1, duration: '4' }),
        newNote({ keys: ['g/5'], stem_direction: -1, duration: '4' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      ];

      var beam1 = new VF.Beam(notes.slice(5, 9));
      var tuplet = new VF.Tuplet(notes.slice(9, 12))
        .setTupletLocation(VF.Tuplet.LOCATION_TOP);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      tuplet.setContext(c.context).draw();
      beam1.setContext(c.context).draw();

      ok(true, 'Auto Align Rests - Default Test');
    },

    staveRestsAll: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        newNote({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
        newNote({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),

        newNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['e/5'], stem_direction: -1, duration: '8' }),

        newNote({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
        newNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
        newNote({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

        newNote({ keys: ['d/5'], stem_direction: -1, duration: '4' }),
        newNote({ keys: ['g/5'], stem_direction: -1, duration: '4' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      ];

      var beam1 = new VF.Beam(notes.slice(5, 9));
      var tuplet = new VF.Tuplet(notes.slice(9, 12))
        .setTupletLocation(VF.Tuplet.LOCATION_TOP);

      // Set option to position rests near the notes in the voice
      VF.Formatter.FormatAndDraw(c.context, c.stave, notes, { align_rests: true });

      tuplet.setContext(c.context).draw();
      beam1.setContext(c.context).draw();

      ok(true, 'Auto Align Rests - Align All Test');
    },

    multi: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 200);

      var stave = new VF.Stave(50, 10, 500)
        .addClef('treble')
        .setContext(ctx)
        .addTimeSignature('4/4')
        .draw();

      function newNote(note_struct) {
        return new VF.StaveNote(note_struct).setStave(stave);
      }

      var notes1 = [
        newNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '4' }),
        newNote({ keys: ['b/4'], duration: '4r' }),
        newNote({ keys: ['c/4', 'd/4', 'a/4'], duration: '4' }),
        newNote({ keys: ['b/4'], duration: '4r' }),
      ];

      var notes2 = [
        newNote({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        newNote({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
        newNote({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes1);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).addTickables(notes2);

      // Set option to position rests near the notes in each voice
      new VF.Formatter()
        .joinVoices([voice, voice2])
        .formatToStave([voice, voice2], stave, { align_rests: true });

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice2.draw(ctx);
      voice.draw(ctx);
      beam2_1.setContext(ctx).draw();
      beam2_2.setContext(ctx).draw();

      ok(true, 'Strokes Test Multi Voice');
    },
  };

  return Rests;
})();

/**
 * VexFlow - Rhythm Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Rhythm = (function() {
  var Rhythm = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('Rhythm');
      runTests('Rhythm Draw - slash notes', Rhythm.drawBasic);
      runTests('Rhythm Draw - beamed slash notes', Rhythm.drawBeamedSlashNotes);
      runTests('Rhythm Draw - beamed slash notes, some rests', Rhythm.drawSlashAndBeamAndRests);
      runTests('Rhythm Draw - 16th note rhythm with scratches', Rhythm.drawSixtenthWithScratches);
      runTests('Rhythm Draw - 32nd note rhythm with scratches', Rhythm.drawThirtySecondWithScratches);
    },

    drawSlash: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 350, 180);
      var stave = new VF.Stave(10, 10, 350);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { keys: ['b/4'], duration: 'ws', stem_direction: -1 },
        { keys: ['b/4'], duration: 'hs', stem_direction: -1 },
        { keys: ['b/4'], duration: 'qs', stem_direction: -1 },
        { keys: ['b/4'], duration: '8s', stem_direction: -1 },
        { keys: ['b/4'], duration: '16s', stem_direction: -1 },
        { keys: ['b/4'], duration: '32s', stem_direction: -1 },
        { keys: ['b/4'], duration: '64s', stem_direction: -1 },
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    drawBasic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 150);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef('treble');
      staveBar1.addTimeSignature('4/4');
      staveBar1.addKeySignature('C');
      staveBar1.setContext(ctx).draw();

      var notesBar1 = [
        new VF.StaveNote(
          { keys: ['b/4'], duration: '1s', stem_direction: -1 }),
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x,
        staveBar1.y, 120);
      staveBar2.setBegBarType(VF.Barline.type.SINGLE);
      staveBar2.setEndBarType(VF.Barline.type.SINGLE);
      staveBar2.setContext(ctx).draw();

      // bar 2
      var notesBar2 = [
        new VF.StaveNote(
          { keys: ['b/4'], duration: '2s', stem_direction: -1 }),
        new VF.StaveNote(
          { keys: ['b/4'], duration: '2s', stem_direction: -1 }),
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);


      // bar 3 - juxtaposing second bar next to first bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x,
        staveBar2.y, 170);
      staveBar3.setContext(ctx).draw();

      // bar 3
      var notesBar3 = [
        new VF.StaveNote({
          keys: ['b/4'], duration: '4s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '4s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '4s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '4s',
          stem_direction: -1,
        }),
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

      // bar 4 - juxtaposing second bar next to first bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x,
        staveBar3.y, 200);
      staveBar4.setContext(ctx).draw();

      // bar 4
      var notesBar4 = [
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),

      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
      expect(0);
    },

    drawBeamedSlashNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef('treble');
      staveBar1.addTimeSignature('4/4');
      staveBar1.addKeySignature('C');
      staveBar1.setContext(ctx).draw();


      // bar 4
      var notesBar1_part1 = [
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
      ];

      var notesBar1_part2 = [
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),

      ];

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);
      var beam2 = new VF.Beam(notesBar1_part2);
      var notesBar1 = notesBar1_part1.concat(notesBar1_part2);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // Render beams
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      expect(0);
    },

    drawSlashAndBeamAndRests: function(options,
      contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef('treble');
      staveBar1.addTimeSignature('4/4');
      staveBar1.addKeySignature('F');
      staveBar1.setContext(ctx).draw();

      // bar 1
      var notesBar1_part1 = [
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({ keys: ['b/4'], duration: '8s', stem_direction: -1 }),
      ];

      notesBar1_part1[0].addModifier(0, (new VF.Annotation('C7')).setFont(
        'Times', VF.Test.Font.size + 2));

      var notesBar1_part2 = [
        new VF.StaveNote({
          keys: ['b/4'], duration: '8r',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8r',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8r',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '8s',
          stem_direction: -1,
        }),

      ];

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1,
        notesBar1_part1.concat(notesBar1_part2));

      // Render beams
      beam1.setContext(ctx).draw();

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x,
        staveBar1.y, 220);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({
          keys: ['b/4'], duration: '1s',
          stem_direction: -1,
        }),
      ];

      notesBar2[0].addModifier(0, (new VF.Annotation('F')).setFont('Times',
        VF.Test.Font.size + 2));
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      expect(0);
    },

    drawSixtenthWithScratches: function(options,
      contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef('treble');
      staveBar1.addTimeSignature('4/4');
      staveBar1.addKeySignature('F');
      staveBar1.setContext(ctx).draw();

      // bar 1
      var notesBar1_part1 = [
        new VF.StaveNote({
          keys: ['b/4'], duration: '16s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '16s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '16m',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '16s',
          stem_direction: -1,
        }),
      ];

      var notesBar1_part2 = [
        new VF.StaveNote({
          keys: ['b/4'], duration: '16m',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '16s',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '16r',
          stem_direction: -1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '16s',
          stem_direction: -1,
        }),

      ];

      notesBar1_part1[0].addModifier(0, (new VF.Annotation('C7')).setFont(
        'Times', VF.Test.Font.size + 3));

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);
      var beam2 = new VF.Beam(notesBar1_part2);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1,
        notesBar1_part1.concat(notesBar1_part2));


      // Render beams
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      expect(0);
    },


    drawThirtySecondWithScratches: function(options,
      contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef('treble');
      staveBar1.addTimeSignature('4/4');
      staveBar1.addKeySignature('F');
      staveBar1.setContext(ctx).draw();

      // bar 1
      var notesBar1_part1 = [
        new VF.StaveNote({
          keys: ['b/4'], duration: '32s',
          stem_direction: 1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '32s',
          stem_direction: 1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '32m',
          stem_direction: 1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '32s',
          stem_direction: 1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '32m',
          stem_direction: 1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '32s',
          stem_direction: 1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '32r',
          stem_direction: 1,
        }),
        new VF.StaveNote({
          keys: ['b/4'], duration: '32s',
          stem_direction: 1,
        }),

      ];

      notesBar1_part1[0].addModifier(0, (new VF.Annotation('C7')).setFont(
        'Times', VF.Test.Font.size + 3));

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1);

      // Render beams
      beam1.setContext(ctx).draw();

      expect(0);
    },
  };

  return Rhythm;
})();

/**
 * VexFlow - Basic Stave Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Stave = (function() {
  var Stave = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('Stave');
      test('StaveModifiers SortByCategory', Stave.sortByCategory);
      runTests('Stave Draw Test', Stave.draw);
      runTests('Open Stave Draw Test', Stave.drawOpenStave);
      runTests('Vertical Bar Test', Stave.drawVerticalBar);
      runTests('Multiple Stave Barline Test', Stave.drawMultipleMeasures);
      runTests('Multiple Stave Repeats Test', Stave.drawRepeats);
      runTests('Stave End Modifiers Test', Stave.drawEndModifiersTest);
      runTests('Multiple Staves Volta Test', Stave.drawVoltaTest);
      runTests('Tempo Test', Stave.drawTempo);
      runTests('Single Line Configuration Test', Stave.configureSingleLine);
      runTests('Batch Line Configuration Test', Stave.configureAllLines);
      runTests('Stave Text Test', Stave.drawStaveText);
      runTests('Multiple Line Stave Text Test', Stave.drawStaveTextMultiLine);
      runTests('Factory API', Stave.factoryAPI);
    },

    sortByCategory: function() {
      var stave = new VF.Stave(0, 0, 300);
      var clef0 = new VF.Clef('treble');
      var clef1 = new VF.Clef('alto');
      var clef2 = new VF.Clef('bass');
      var time0 = new VF.TimeSignature('C');
      var time1 = new VF.TimeSignature('C|');
      var time2 = new VF.TimeSignature('9/8');
      var key0 = new VF.KeySignature('G');
      var key1 = new VF.KeySignature('F');
      var key2 = new VF.KeySignature('D');
      var bar0 = new VF.Barline(VF.Barline.type.SINGLE);
      var bar1 = new VF.Barline(VF.Barline.type.DOUBLE);
      var bar2 = new VF.Barline(VF.Barline.type.NONE);
      var order0 = { barlines: 0, clefs: 1, keysignatures: 2, timesignatures: 3 };
      var order1 = { timesignatures: 0, keysignatures: 1, barlines: 2, clefs: 3 };

      var sortAndCompare = function(title, arr, arr2, order) {
        stave.sortByCategory(arr, order);

        var isSame = true;
        arr2.forEach(function(modifier, i) {
          if (modifier !== arr[i]) isSame = false;
        });

        ok(isSame, title);
      };

      sortAndCompare(
        'Keep the original order',
        [bar0, bar1, clef0, clef1, key0, key1, time0, time1],
        [bar0, bar1, clef0, clef1, key0, key1, time0, time1],
        order0
      );
      sortAndCompare(
        'Keep the original order 2',
        [time0, time1, key0, key1, bar0, bar1, clef0, clef1],
        [time0, time1, key0, key1, bar0, bar1, clef0, clef1],
        order1
      );
      sortAndCompare(
        'Sort and keep',
        [bar0, bar1, clef0, clef1, key0, key1, time0, time1],
        [time0, time1, key0, key1, bar0, bar1, clef0, clef1],
        order1
      );
      sortAndCompare(
        'Sort and keep 2',
        [bar0, clef0, key0, time0, key1, time1, clef1, bar1, time2, clef2, bar2, key2],
        [bar0, bar1, bar2, clef0, clef1, clef2, key0, key1, key2, time0, time1, time2],
        order0
      );
      sortAndCompare(
        'Sort and keep 3',
        [bar2, clef2, key2, time0, key0, time2, clef1, bar1, time1, clef0, bar0, key1],
        [time0, time2, time1, key2, key0, key1, bar2, bar1, bar0, clef2, clef1, clef0],
        order1
      );
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 150);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();

      equal(stave.getYForNote(0), 100, 'getYForNote(0)');
      equal(stave.getYForLine(5), 100, 'getYForLine(5)');
      equal(stave.getYForLine(0), 50, 'getYForLine(0) - Top Line');
      equal(stave.getYForLine(4), 90, 'getYForLine(4) - Bottom Line');

      ok(true, 'all pass');
    },

    drawOpenStave: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 350);
      var stave = new VF.Stave(10, 10, 300, { left_bar: false });
      stave.setContext(ctx);
      stave.draw();

      stave = new VF.Stave(10, 150, 300, { right_bar: false });
      stave.setContext(ctx);
      stave.draw();

      ok(true, 'all pass');
    },

    drawVerticalBar: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();
      stave.drawVerticalBar(50, true);
      stave.drawVerticalBar(150, false);
      stave.drawVertical(250, true);
      stave.drawVertical(300);

      ok(true, 'all pass');
    },

    drawMultipleMeasures: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 550, 200);

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 200);
      staveBar1.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.setSection('A', 0);
      staveBar1.addClef('treble').setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['c/4'], duration: 'q' }),
        new VF.StaveNote({ keys: ['d/4'], duration: 'q' }),
        new VF.StaveNote({ keys: ['b/4'], duration: 'qr' }),
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setSection('B', 0);
      staveBar2.setEndBarType(VF.Barline.type.END);
      staveBar2.setContext(ctx).draw();

      var notesBar2_part1 = [
        new VF.StaveNote({ keys: ['c/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['d/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['g/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['e/4'], duration: '8' }),
      ];

      var notesBar2_part2 = [
        new VF.StaveNote({ keys: ['c/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['d/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['g/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['e/4'], duration: '8' }),
      ];

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar2_part1);
      var beam2 = new VF.Beam(notesBar2_part2);
      var notesBar2 = notesBar2_part1.concat(notesBar2_part2);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      // Render beams
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
    },

    drawRepeats: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 750, 120);

      // bar 1
      var staveBar1 = new VF.Stave(10, 0, 250);
      staveBar1.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar1.setEndBarType(VF.Barline.type.REPEAT_END);
      staveBar1.addClef('treble');
      staveBar1.addKeySignature('A');
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ['c/4'], duration: 'q' }),
        new VF.StaveNote({ keys: ['d/4'], duration: 'q' }),
        new VF.StaveNote({ keys: ['b/4'], duration: 'qr' }),
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);


      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x,
        staveBar1.y, 250);
      staveBar2.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar2.setEndBarType(VF.Barline.type.REPEAT_END);
      staveBar2.setContext(ctx).draw();

      var notesBar2_part1 = [
        new VF.StaveNote({ keys: ['c/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['d/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['g/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['e/4'], duration: '8' }),
      ];

      var notesBar2_part2 = [
        new VF.StaveNote({ keys: ['c/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['d/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['g/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['e/4'], duration: '8' }),
      ];
      notesBar2_part2[0].addAccidental(0, new VF.Accidental('#'));
      notesBar2_part2[1].addAccidental(0, new VF.Accidental('#'));
      notesBar2_part2[3].addAccidental(0, new VF.Accidental('b'));
      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar2_part1);
      var beam2 = new VF.Beam(notesBar2_part2);
      var notesBar2 = notesBar2_part1.concat(notesBar2_part2);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      // Render beams
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      // bar 3 - juxtaposing third bar next to second bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x,
        staveBar2.y, 50);
      staveBar3.setContext(ctx).draw();
      var notesBar3 = [new VF.StaveNote({ keys: ['d/5'], duration: 'wr' })];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

      // bar 4 - juxtaposing third bar next to third bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x,
        staveBar3.y, 250 - staveBar1.getModifierXShift());
      staveBar4.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar4.setEndBarType(VF.Barline.type.REPEAT_END);
      staveBar4.setContext(ctx).draw();
      var notesBar4 = [
        new VF.StaveNote({ keys: ['c/4'], duration: 'q' }),
        new VF.StaveNote({ keys: ['d/4'], duration: 'q' }),
        new VF.StaveNote({ keys: ['b/4'], duration: 'qr' }),
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
    },

    drawEndModifiersTest: function(options, contextBuilder) {
      expect(0);

      var staveWidth = 230;
      var blockHeight = 80;
      var x = 10;
      var y = 0;

      function drawAStaves(endBarLine) {
        function drawAStave(ctx, x, y, width, begMods, endMods) {
          var staveBar = new VF.Stave(x, y, width - 10);
          if (begMods) {
            if (begMods.barLine !== undefined) {
              staveBar.setBegBarType(begMods.barLine);
            }
            if (begMods.clef !== undefined) {
              staveBar.addClef(begMods.clef);
            }
            if (begMods.keySig  !== undefined) {
              staveBar.addKeySignature(begMods.keySig);
            }
            if (begMods.timeSig !== undefined) {
              staveBar.setTimeSignature(begMods.timeSig);
            }
          }

          if (endMods) {
            if (endMods.barLine !== undefined) {
              staveBar.setEndBarType(endMods.barLine);
            }
            if (endMods.clef !== undefined) {
              staveBar.addEndClef(endMods.clef);
            }
            if (endMods.keySig  !== undefined) {
              staveBar.setEndKeySignature(endMods.keySig);
            }
            if (endMods.timeSig !== undefined) {
              staveBar.setEndTimeSignature(endMods.timeSig);
            }
          }

          staveBar.setContext(ctx).draw();
          var notesBar = [
            new VF.StaveNote({ keys: ['c/4'], duration: 'q' }),
            new VF.StaveNote({ keys: ['d/4'], duration: 'q' }),
            new VF.StaveNote({ keys: ['b/4'], duration: 'qr' }),
            new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
          ];

          VF.Formatter.FormatAndDraw(ctx, staveBar, notesBar);
        }

        drawAStave(ctx, x, y, staveWidth + 50, {
          barLine: VF.Barline.type.REPEAT_BEGIN,
          clef: 'treble',
          keySig: 'A',
        },
        {
          barLine: endBarLine,
          clef: 'bass',
        });
        x += staveWidth + 50;

        drawAStave(ctx, x, y, staveWidth, {
          barLine: VF.Barline.type.REPEAT_BEGIN,
        },
        {
          barLine: endBarLine,
          keySig: 'E',
        });
        x += staveWidth;

        drawAStave(ctx, x, y, staveWidth, {
          barLine: VF.Barline.type.REPEAT_BEGIN,
        },
        {
          barLine: endBarLine,
          timeSig: '2/4',
        });
        x += staveWidth;

        x = 10;
        y += blockHeight;

        drawAStave(ctx, x, y, staveWidth, {
          barLine: VF.Barline.type.REPEAT_BEGIN,
        },
        {
          barLine: endBarLine,
          clef: 'bass',
          timeSig: '2/4',
        });
        x += staveWidth;

        drawAStave(ctx, x, y, staveWidth, {
          barLine: VF.Barline.type.REPEAT_BEGIN,
        },
        {
          barLine: endBarLine,
          clef: 'treble',
          keySig: 'Ab',
        });
        x += staveWidth;

        drawAStave(ctx, x, y, staveWidth, {
          barLine: VF.Barline.type.REPEAT_BEGIN,
        },
        {
          barLine: endBarLine,
          clef: 'bass',
          keySig: 'Ab',
          timeSig: '2/4',
        });
        x += staveWidth;
      }

      var ctx = contextBuilder(options.elementId, 800, 700);

      y = 0;
      x = 10;
      drawAStaves(VF.Barline.type.SINGLE);

      y += blockHeight + 10;
      x = 10;
      drawAStaves(VF.Barline.type.DOUBLE);

      y += blockHeight + 10;
      x = 10;
      drawAStaves(VF.Barline.type.REPEAT_END);

      y += blockHeight + 10;
      x = 10;
      drawAStaves(VF.Barline.type.REPEAT_BOTH);
    },

    drawVoltaTest: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.elementId, 725, 200);

      // bar 1
      var mm1 = new VF.Stave(10, 50, 125);
      mm1.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      mm1.setRepetitionTypeLeft(VF.Repetition.type.SEGNO_LEFT, -18);
      mm1.addClef('treble');
      mm1.addKeySignature('A');
      mm1.setMeasure(1);
      mm1.setSection('A', 0);
      mm1.setContext(ctx).draw();
      var notesmm1 = [
        new VF.StaveNote({ keys: ['c/4'], duration: 'w' }),
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm1, notesmm1);

      // bar 2 - juxtapose second measure
      var mm2 = new VF.Stave(mm1.width + mm1.x, mm1.y, 60);
      mm2.setRepetitionTypeRight(VF.Repetition.type.CODA_RIGHT, 0);
      mm2.setMeasure(2);
      mm2.setContext(ctx).draw();
      var notesmm2 = [
        new VF.StaveNote({ keys: ['d/4'], duration: 'w' }),
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm2, notesmm2);

      // bar 3 - juxtapose third measure
      var mm3 = new VF.Stave(mm2.width + mm2.x, mm1.y, 60);
      mm3.setVoltaType(VF.Volta.type.BEGIN, '1.', -5);
      mm3.setMeasure(3);
      mm3.setContext(ctx).draw();
      var notesmm3 = [
        new VF.StaveNote({ keys: ['e/4'], duration: 'w' }),
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm3, notesmm3);

      // bar 4 - juxtapose fourth measure
      var mm4 = new VF.Stave(mm3.width + mm3.x, mm1.y, 60);
      mm4.setVoltaType(VF.Volta.type.MID, '', -5);
      mm4.setMeasure(4);
      mm4.setContext(ctx).draw();
      var notesmm4 = [
        new VF.StaveNote({ keys: ['f/4'], duration: 'w' }),
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm4, notesmm4);

      // bar 5 - juxtapose fifth measure
      var mm5 = new VF.Stave(mm4.width + mm4.x, mm1.y, 60);
      mm5.setEndBarType(VF.Barline.type.REPEAT_END);
      mm5.setVoltaType(VF.Volta.type.END, '', -5);
      mm5.setMeasure(5);
      mm5.setContext(ctx).draw();
      var notesmm5 = [
        new VF.StaveNote({ keys: ['g/4'], duration: 'w' }),
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm5, notesmm5);

      // bar 6 - juxtapose sixth measure
      var mm6 = new VF.Stave(mm5.width + mm5.x, mm1.y, 60);
      mm6.setVoltaType(VF.Volta.type.BEGIN_END, '2.', -5);
      mm6.setEndBarType(VF.Barline.type.DOUBLE);
      mm6.setMeasure(6);
      mm6.setContext(ctx).draw();
      var notesmm6 = [
        new VF.StaveNote({ keys: ['a/4'], duration: 'w' }),
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm6, notesmm6);

      // bar 7 - juxtapose seventh measure
      var mm7 = new VF.Stave(mm6.width + mm6.x, mm1.y, 60);
      mm7.setMeasure(7);
      mm7.setSection('B', 0);
      mm7.setContext(ctx).draw();
      var notesmm7 = [
        new VF.StaveNote({ keys: ['b/4'], duration: 'w' }),
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm7, notesmm7);

      // bar 8 - juxtapose eighth measure
      var mm8 = new VF.Stave(mm7.width + mm7.x, mm1.y, 60);
      mm8.setEndBarType(VF.Barline.type.DOUBLE);
      mm8.setRepetitionTypeRight(VF.Repetition.type.DS_AL_CODA, 25);
      mm8.setMeasure(8);
      mm8.setContext(ctx).draw();
      var notesmm8 = [
        new VF.StaveNote({ keys: ['c/5'], duration: 'w' }),
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm8, notesmm8);

      // bar 9 - juxtapose ninth measure
      var mm9 = new VF.Stave(mm8.width + mm8.x + 20, mm1.y, 125);
      mm9.setEndBarType(VF.Barline.type.END);
      mm9.setRepetitionTypeLeft(VF.Repetition.type.CODA_LEFT, 25);
      mm9.addClef('treble');
      mm9.addKeySignature('A');
      mm9.setMeasure(9);
      mm9.setContext(ctx).draw();
      var notesmm9 = [
        new VF.StaveNote({ keys: ['d/5'], duration: 'w' }),
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm9, notesmm9);
    },

    drawTempo: function(options, contextBuilder) {
      expect(0);

      var ctx = contextBuilder(options.elementId, 725, 350);
      var padding = 10;
      var x = 0;
      var y = 50;

      function drawTempoStaveBar(width, tempo, tempo_y, notes) {
        var staveBar = new VF.Stave(padding + x, y, width);
        if (x === 0) staveBar.addClef('treble');
        staveBar.setTempo(tempo, tempo_y);
        staveBar.setContext(ctx).draw();

        var notesBar = notes || [
          new VF.StaveNote({ keys: ['c/4'], duration: 'q' }),
          new VF.StaveNote({ keys: ['d/4'], duration: 'q' }),
          new VF.StaveNote({ keys: ['b/4'], duration: 'q' }),
          new VF.StaveNote({ keys: ['c/4'], duration: 'q' }),
        ];

        VF.Formatter.FormatAndDraw(ctx, staveBar, notesBar);
        x += width;
      }

      drawTempoStaveBar(120, { duration: 'q', dots: 1, bpm: 80 }, 0);
      drawTempoStaveBar(100, { duration: '8', dots: 2, bpm: 90 }, 0);
      drawTempoStaveBar(100, { duration: '16', dots: 1, bpm: 96 }, 0);
      drawTempoStaveBar(100, { duration: '32', bpm: 70 }, 0);
      drawTempoStaveBar(250, { name: 'Andante', note: '8', bpm: 120 }, -20, [
        new VF.StaveNote({ keys: ['c/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['d/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['g/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['e/5'], duration: '8' }),
        new VF.StaveNote({ keys: ['c/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['d/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['g/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['e/4'], duration: '8' }),
      ]);

      x = 0; y += 150;

      drawTempoStaveBar(120, { duration: 'w', bpm: 80 }, 0);
      drawTempoStaveBar(100, { duration: 'h', bpm: 90 }, 0);
      drawTempoStaveBar(100, { duration: 'q', bpm: 96 }, 0);
      drawTempoStaveBar(100, { duration: '8', bpm: 70 }, 0);
      drawTempoStaveBar(250, { name: 'Andante grazioso' }, 0, [
        new VF.StaveNote({ keys: ['c/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['d/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['g/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['e/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['c/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['d/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['g/4'], duration: '8' }),
        new VF.StaveNote({ keys: ['e/4'], duration: '8' }),
      ]);
    },

    configureSingleLine: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setConfigForLine(0, { visible: true })
        .setConfigForLine(1, { visible: false })
        .setConfigForLine(2, { visible: true })
        .setConfigForLine(3, { visible: false })
        .setConfigForLine(4, { visible: true });
      stave.setContext(ctx).draw();

      var config = stave.getConfigForLines();
      equal(config[0].visible, true, 'getLinesConfiguration() - Line 0');
      equal(config[1].visible, false, 'getLinesConfiguration() - Line 1');
      equal(config[2].visible, true, 'getLinesConfiguration() - Line 2');
      equal(config[3].visible, false, 'getLinesConfiguration() - Line 3');
      equal(config[4].visible, true, 'getLinesConfiguration() - Line 4');

      ok(true, 'all pass');
    },

    configureAllLines: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setConfigForLines([
        { visible: false },
        null,
        { visible: false },
        { visible: true },
        { visible: false },
      ]).setContext(ctx).draw();

      var config = stave.getConfigForLines();
      equal(config[0].visible, false, 'getLinesConfiguration() - Line 0');
      equal(config[1].visible, true, 'getLinesConfiguration() - Line 1');
      equal(config[2].visible, false, 'getLinesConfiguration() - Line 2');
      equal(config[3].visible, true, 'getLinesConfiguration() - Line 3');
      equal(config[4].visible, false, 'getLinesConfiguration() - Line 4');

      ok(true, 'all pass');
    },

    drawStaveText: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 900, 140);
      var stave = new VF.Stave(300, 10, 300);
      stave.setText('Violin', VF.Modifier.Position.LEFT);
      stave.setText('Right Text', VF.Modifier.Position.RIGHT);
      stave.setText('Above Text', VF.Modifier.Position.ABOVE);
      stave.setText('Below Text', VF.Modifier.Position.BELOW);
      stave.setContext(ctx).draw();

      ok(true, 'all pass');
    },

    drawStaveTextMultiLine: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 900, 200);
      var stave = new VF.Stave(300, 40, 300);
      stave.setText('Violin', VF.Modifier.Position.LEFT, { shift_y: -10 });
      stave.setText('2nd line', VF.Modifier.Position.LEFT, { shift_y: 10 });
      stave.setText('Right Text', VF.Modifier.Position.RIGHT, { shift_y: -10 });
      stave.setText('2nd line', VF.Modifier.Position.RIGHT, { shift_y: 10 });
      stave.setText('Above Text', VF.Modifier.Position.ABOVE, { shift_y: -10 });
      stave.setText('2nd line', VF.Modifier.Position.ABOVE, { shift_y: 10 });
      stave.setText('Left Below Text', VF.Modifier.Position.BELOW,
        { shift_y: -10, justification: VF.TextNote.Justification.LEFT });
      stave.setText('Right Below Text', VF.Modifier.Position.BELOW,
        { shift_y: 10, justification: VF.TextNote.Justification.RIGHT });
      stave.setContext(ctx).draw();

      ok(true, 'all pass');
    },

    factoryAPI: function(options) {
      var vf = VF.Test.makeFactory(options, 900, 200);
      var stave = vf.Stave({ x: 300, y: 40, width: 300 });
      stave.setText('Violin', VF.Modifier.Position.LEFT, { shift_y: -10 });
      stave.setText('2nd line', VF.Modifier.Position.LEFT, { shift_y: 10 });
      vf.draw();

      ok(true, 'all pass');
    },
  };

  return Stave;
})();

/**
 * VexFlow - StaveConnector Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StaveConnector = (function() {
  var StaveConnector = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('StaveConnector');
      runTests('Single Draw Test', StaveConnector.drawSingle);
      runTests('Single Draw Test, 1px Stave Line Thickness', StaveConnector.drawSingle1pxBarlines);
      runTests('Single Both Sides Test', StaveConnector.drawSingleBoth);
      runTests('Double Draw Test', StaveConnector.drawDouble);
      runTests('Bold Double Line Left Draw Test', StaveConnector.drawRepeatBegin);
      runTests('Bold Double Line Right Draw Test', StaveConnector.drawRepeatEnd);
      runTests('Thin Double Line Right Draw Test', StaveConnector.drawThinDouble);
      runTests('Bold Double Lines Overlapping Draw Test', StaveConnector.drawRepeatAdjacent);
      runTests('Bold Double Lines Offset Draw Test', StaveConnector.drawRepeatOffset);
      runTests('Bold Double Lines Offset Draw Test 2', StaveConnector.drawRepeatOffset2);
      runTests('Brace Draw Test', StaveConnector.drawBrace);
      runTests('Brace Wide Draw Test', StaveConnector.drawBraceWide);
      runTests('Bracket Draw Test', StaveConnector.drawBracket);
      runTests('Combined Draw Test', StaveConnector.drawCombined);
    },

    drawSingle: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();

      ok(true, 'all pass');
    },

    drawSingle1pxBarlines: function(options, contextBuilder) {
      VF.STAVE_LINE_THICKNESS = 1;
      var ctx = new contextBuilder(options.elementId, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();
      VF.STAVE_LINE_THICKNESS = 2;

      ok(true, 'all pass');
    },

    drawSingleBoth: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.SINGLE_LEFT);
      connector.setContext(ctx);
      var connector2 = new VF.StaveConnector(stave, stave2);
      connector2.setType(VF.StaveConnector.type.SINGLE_RIGHT);
      connector2.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();
      connector2.draw();

      ok(true, 'all pass');
    },

    drawDouble: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      var line = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.DOUBLE);
      connector.setContext(ctx);
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();
      line.draw();

      ok(true, 'all pass');
    },

    drawBrace: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 450, 300);
      var stave = new VF.Stave(100, 10, 300);
      var stave2 = new VF.Stave(100, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      var line = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.BRACE);
      connector.setContext(ctx);
      connector.setText('Piano');
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();
      line.draw();

      ok(true, 'all pass');
    },

    drawBraceWide: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
      var stave = new VF.Stave(25, -20, 300);
      var stave2 = new VF.Stave(25, 200, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      var line = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.BRACE);
      connector.setContext(ctx);
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();
      line.draw();

      ok(true, 'all pass');
    },

    drawBracket: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      var connector = new VF.StaveConnector(stave, stave2);
      var line = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.BRACKET);
      connector.setContext(ctx);
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      connector.draw();
      line.draw();

      ok(true, 'all pass');
    },

    drawRepeatBegin: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave2.setBegBarType(VF.Barline.type.REPEAT_BEGIN);

      var line = new VF.StaveConnector(stave, stave2);
      line.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      line.draw();

      ok(true, 'all pass');
    },

    drawRepeatEnd: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave.setEndBarType(VF.Barline.type.REPEAT_END);
      stave2.setEndBarType(VF.Barline.type.REPEAT_END);

      var line = new VF.StaveConnector(stave, stave2);
      line.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      line.draw();

      ok(true, 'all pass');
    },

    drawThinDouble: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
      var stave = new VF.Stave(25, 10, 300);
      var stave2 = new VF.Stave(25, 120, 300);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave.setEndBarType(VF.Barline.type.DOUBLE);
      stave2.setEndBarType(VF.Barline.type.DOUBLE);

      var line = new VF.StaveConnector(stave, stave2);
      line.setType(VF.StaveConnector.type.THIN_DOUBLE);
      line.setContext(ctx);
      stave.draw();
      stave2.draw();
      line.draw();

      ok(true, 'all pass');
    },

    drawRepeatAdjacent: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
      var stave = new VF.Stave(25, 10, 150);
      var stave2 = new VF.Stave(25, 120, 150);
      var stave3 = new VF.Stave(175, 10, 150);
      var stave4 = new VF.Stave(175, 120, 150);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave3.setContext(ctx);
      stave4.setContext(ctx);

      stave.setEndBarType(VF.Barline.type.REPEAT_END);
      stave2.setEndBarType(VF.Barline.type.REPEAT_END);
      stave3.setEndBarType(VF.Barline.type.END);
      stave4.setEndBarType(VF.Barline.type.END);

      stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave2.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave3.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave4.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      var connector = new VF.StaveConnector(stave, stave2);
      var connector2 = new VF.StaveConnector(stave, stave2);
      var connector3 = new VF.StaveConnector(stave3, stave4);
      var connector4 = new VF.StaveConnector(stave3, stave4);
      connector.setContext(ctx);
      connector2.setContext(ctx);
      connector3.setContext(ctx);
      connector4.setContext(ctx);
      connector.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      connector2.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      connector3.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      connector4.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      stave.draw();
      stave2.draw();
      stave3.draw();
      stave4.draw();
      connector.draw();
      connector2.draw();
      connector3.draw();
      connector4.draw();

      ok(true, 'all pass');
    },

    drawRepeatOffset2: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
      var stave = new VF.Stave(25, 10, 150);
      var stave2 = new VF.Stave(25, 120, 150);
      var stave3 = new VF.Stave(175, 10, 150);
      var stave4 = new VF.Stave(175, 120, 150);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave3.setContext(ctx);
      stave4.setContext(ctx);

      stave.addClef('treble');
      stave2.addClef('bass');

      stave3.addClef('alto');
      stave4.addClef('treble');

      stave.addTimeSignature('4/4');
      stave2.addTimeSignature('4/4');

      stave3.addTimeSignature('6/8');
      stave4.addTimeSignature('6/8');

      stave.setEndBarType(VF.Barline.type.REPEAT_END);
      stave2.setEndBarType(VF.Barline.type.REPEAT_END);
      stave3.setEndBarType(VF.Barline.type.END);
      stave4.setEndBarType(VF.Barline.type.END);

      stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave2.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave3.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave4.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      var connector = new VF.StaveConnector(stave, stave2);
      var connector2 = new VF.StaveConnector(stave, stave2);
      var connector3 = new VF.StaveConnector(stave3, stave4);
      var connector4 = new VF.StaveConnector(stave3, stave4);
      var connector5 = new VF.StaveConnector(stave3, stave4);

      connector.setContext(ctx);
      connector2.setContext(ctx);
      connector3.setContext(ctx);
      connector4.setContext(ctx);
      connector5.setContext(ctx);
      connector.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      connector2.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      connector3.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      connector4.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      connector5.setType(VF.StaveConnector.type.SINGLE_LEFT);

      connector.setXShift(stave.getModifierXShift());
      connector3.setXShift(stave3.getModifierXShift());

      stave.draw();
      stave2.draw();
      stave3.draw();
      stave4.draw();
      connector.draw();
      connector2.draw();
      connector3.draw();
      connector4.draw();
      connector5.draw();

      ok(true, 'all pass');
    },

    drawRepeatOffset: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 300);
      var stave = new VF.Stave(25, 10, 150);
      var stave2 = new VF.Stave(25, 120, 150);
      var stave3 = new VF.Stave(185, 10, 150);
      var stave4 = new VF.Stave(185, 120, 150);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave3.setContext(ctx);
      stave4.setContext(ctx);

      stave.addClef('bass');
      stave2.addClef('alto');

      stave3.addClef('treble');
      stave4.addClef('tenor');

      stave3.addKeySignature('Ab');
      stave4.addKeySignature('Ab');

      stave.addTimeSignature('4/4');
      stave2.addTimeSignature('4/4');

      stave3.addTimeSignature('6/8');
      stave4.addTimeSignature('6/8');

      stave.setEndBarType(VF.Barline.type.REPEAT_END);
      stave2.setEndBarType(VF.Barline.type.REPEAT_END);
      stave3.setEndBarType(VF.Barline.type.END);
      stave4.setEndBarType(VF.Barline.type.END);

      stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave2.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave3.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave4.setBegBarType(VF.Barline.type.REPEAT_BEGIN);

      var connector = new VF.StaveConnector(stave, stave2);
      var connector2 = new VF.StaveConnector(stave, stave2);
      var connector3 = new VF.StaveConnector(stave3, stave4);
      var connector4 = new VF.StaveConnector(stave3, stave4);
      var connector5 = new VF.StaveConnector(stave3, stave4);
      connector.setContext(ctx);
      connector2.setContext(ctx);
      connector3.setContext(ctx);
      connector4.setContext(ctx);
      connector5.setContext(ctx);
      connector.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      connector2.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      connector3.setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT);
      connector4.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      connector5.setType(VF.StaveConnector.type.SINGLE_LEFT);

      connector.setXShift(stave.getModifierXShift());
      connector3.setXShift(stave3.getModifierXShift());

      stave.draw();
      stave2.draw();
      stave3.draw();
      stave4.draw();
      connector.draw();
      connector2.draw();
      connector3.draw();
      connector4.draw();
      connector5.draw();

      ok(true, 'all pass');
    },

    drawCombined: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 550, 700);
      var stave = new VF.Stave(150, 10, 300);
      var stave2 = new VF.Stave(150, 100, 300);
      var stave3 = new VF.Stave(150, 190, 300);
      var stave4 = new VF.Stave(150, 280, 300);
      var stave5 = new VF.Stave(150, 370, 300);
      var stave6 = new VF.Stave(150, 460, 300);
      var stave7 = new VF.Stave(150, 560, 300);
      stave.setText('Violin', VF.Modifier.Position.LEFT);
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave3.setContext(ctx);
      stave4.setContext(ctx);
      stave5.setContext(ctx);
      stave6.setContext(ctx);
      stave7.setContext(ctx);
      var conn_single = new VF.StaveConnector(stave, stave7);
      var conn_double = new VF.StaveConnector(stave2, stave3);
      var conn_bracket = new VF.StaveConnector(stave4, stave7);
      var conn_none = new VF.StaveConnector(stave4, stave5);
      var conn_brace = new VF.StaveConnector(stave6, stave7);
      conn_single.setType(VF.StaveConnector.type.SINGLE);
      conn_double.setType(VF.StaveConnector.type.DOUBLE);
      conn_bracket.setType(VF.StaveConnector.type.BRACKET);
      conn_brace.setType(VF.StaveConnector.type.BRACE);
      conn_brace.setXShift(-5);
      conn_double.setText('Piano');
      conn_none.setText('Multiple', { shift_y: -15 });
      conn_none.setText('Line Text', { shift_y: 15 });
      conn_brace.setText('Harpsichord');
      conn_single.setContext(ctx);
      conn_double.setContext(ctx);
      conn_bracket.setContext(ctx);
      conn_none.setContext(ctx);
      conn_brace.setContext(ctx);
      stave.draw();
      stave2.draw();
      stave3.draw();
      stave4.draw();
      stave5.draw();
      stave6.draw();
      stave7.draw();
      conn_single.draw();
      conn_double.draw();
      conn_bracket.draw();
      conn_none.draw();
      conn_brace.draw();

      ok(true, 'all pass');
    },
  };

  return StaveConnector;
})();

/**
 * VexFlow - StaveHairpin Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 * Author: Raffaele Viglianti, 2012
 */

VF.Test.StaveHairpin = (function() {
  function drawHairpin(from, to, stave, ctx, type, position, options) {
    var hairpin = new VF.StaveHairpin({ first_note: from, last_note: to }, type);

    hairpin.setContext(ctx);
    hairpin.setPosition(position);
    if (options) hairpin.setRenderOptions(options);
    hairpin.draw();
  }

  function createTest(drawHairpins) {
    return function(options) {
      var vf = VF.Test.makeFactory(options);
      var ctx = vf.getContext();
      var stave = vf.Stave();

      var notes = [
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
        vf.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
        vf.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
      ];

      var voice = vf.Voice().addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      drawHairpins(ctx, stave, notes);

      ok(true, 'Simple Test');
    };
  }

  return {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('StaveHairpin');

      run('Simple StaveHairpin', createTest(function(ctx, stave, notes) {
        drawHairpin(notes[0], notes[2], stave, ctx, 1, 4);
        drawHairpin(notes[1], notes[3], stave, ctx, 2, 3);
      }));

      run('Horizontal Offset StaveHairpin', createTest(function(ctx, stave, notes) {
        drawHairpin(notes[0], notes[2], stave, ctx, 1, 3, {
          height: 10,
          vo: 20, // vertical offset
          left_ho: 20, // left horizontal offset
          right_ho: -20, // right horizontal offset
        });
        drawHairpin(notes[3], notes[3], stave, ctx, 2, 4, {
          height: 10,
          y_shift: 0, // vertical offset
          left_shift_px: 0, // left horizontal offset
          right_shift_px: 120, // right horizontal offset
        });
      }));

      run('Vertical Offset StaveHairpin', createTest(function(ctx, stave, notes) {
        drawHairpin(notes[0], notes[2], stave, ctx, 1, 4, {
          height: 10,
          y_shift: 0, // vertical offset
          left_shift_px: 0, // left horizontal offset
          right_shift_px: 0, // right horizontal offset
        });
        drawHairpin(notes[2], notes[3], stave, ctx, 2, 4, {
          height: 10,
          y_shift: -15, // vertical offset
          left_shift_px: 2, // left horizontal offset
          right_shift_px: 0, // right horizontal offset
        });
      }));

      run('Height StaveHairpin', createTest(function(ctx, stave, notes) {
        drawHairpin(notes[0], notes[2], stave, ctx, 1, 4, {
          height: 10,
          y_shift: 0, // vertical offset
          left_shift_px: 0, // left horizontal offset
          right_shift_px: 0, // right horizontal offset
        });
        drawHairpin(notes[2], notes[3], stave, ctx, 2, 4, {
          height: 15,
          y_shift: 0, // vertical offset
          left_shift_px: 2, // left horizontal offset
          right_shift_px: 0, // right horizontal offset
        });
      }));
    },
  };
}());

/**
 * VexFlow - StaveLine Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
VF.Test.StaveLine = (function() {
  var StaveLine = {
    Start: function() {
      QUnit.module('StaveLine');
      VF.Test.runTests('Simple StaveLine', VF.Test.StaveLine.simple0);
      VF.Test.runTests('StaveLine Arrow Options', VF.Test.StaveLine.simple1);
    },

    simple0: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave().addTrebleGlyph();

      var notes = [
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
        vf.StaveNote({ keys: ['c/5'], duration: '4', clef: 'treble' }),
        vf.StaveNote({ keys: ['c/4', 'g/4', 'b/4'], duration: '4', clef: 'treble' }),
        vf.StaveNote({ keys: ['f/4', 'a/4', 'f/5'], duration: '4', clef: 'treble' }),
      ];

      var voice = vf.Voice().addTickables(notes);

      vf.StaveLine({
        from: notes[0],
        to: notes[1],
        first_indices: [0],
        last_indices: [0],
        options: {
          font: { family: 'serif', size: 12, weight: 'italic' },
          text: 'gliss.',
        },
      });

      var staveLine2 = vf.StaveLine({
        from: notes[2],
        to: notes[3],
        first_indices: [2, 1, 0],
        last_indices: [0, 1, 2],
      });
      staveLine2.render_options.line_dash = [10, 10];

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    simple1: function(options) {
      var vf = VF.Test.makeFactory(options, 770);
      var stave = vf.Stave().addTrebleGlyph();

      var notes = [
        vf.StaveNote({ keys: ['c#/5', 'd/5'], duration: '4', clef: 'treble', stem_direction: -1 })
          .addDotToAll(),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' })
          .addAccidental(0, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '4', clef: 'treble' }),
        vf.StaveNote({ keys: ['f/4', 'a/4', 'c/5'], duration: '4', clef: 'treble' })
          .addAccidental(2, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' })
          .addAccidental(0, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['c#/5', 'd/5'], duration: '4', clef: 'treble', stem_direction: -1 }),
        vf.StaveNote({ keys: ['c/4', 'd/4', 'g/4'], duration: '4', clef: 'treble' }),
        vf.StaveNote({ keys: ['f/4', 'a/4', 'c/5'], duration: '4', clef: 'treble' })
          .addAccidental(2, vf.Accidental({ type: '#' })),
      ];
      var voice = vf.Voice().setStrict(false).addTickables(notes);

      var staveLine0 = vf.StaveLine({
        from: notes[0],
        to: notes[1],
        first_indices: [0],
        last_indices: [0],
        options: {
          text: 'Left',
        },
      });

      var staveLine4 = vf.StaveLine({
        from: notes[2],
        to: notes[3],
        first_indices: [1],
        last_indices: [1],
        options: {
          text: 'Right',
        },
      });

      var staveLine1 = vf.StaveLine({
        from: notes[4],
        to: notes[5],
        first_indices: [0],
        last_indices: [0],
        options: {
          text: 'Center',
        },
      });

      var staveLine2 = vf.StaveLine({
        from: notes[6],
        to: notes[7],
        first_indices: [1],
        last_indices: [0],
      });

      var staveLine3 = vf.StaveLine({
        from: notes[6],
        to: notes[7],
        first_indices: [2],
        last_indices: [2],
        options: {
          text: 'Top',
        },
      });

      staveLine0.render_options.draw_end_arrow = true;
      staveLine0.render_options.text_justification = 1;
      staveLine0.render_options.text_position_vertical = 2;

      staveLine1.render_options.draw_end_arrow = true;
      staveLine1.render_options.arrowhead_length = 30;
      staveLine1.render_options.line_width = 5;
      staveLine1.render_options.text_justification = 2;
      staveLine1.render_options.text_position_vertical = 2;

      staveLine4.render_options.line_width = 2;
      staveLine4.render_options.draw_end_arrow = true;
      staveLine4.render_options.draw_start_arrow = true;
      staveLine4.render_options.arrowhead_angle = 0.5;
      staveLine4.render_options.arrowhead_length = 20;
      staveLine4.render_options.text_justification = 3;
      staveLine4.render_options.text_position_vertical = 2;

      staveLine2.render_options.draw_start_arrow = true;
      staveLine2.render_options.line_dash = [5, 4];

      staveLine3.render_options.draw_end_arrow = true;
      staveLine3.render_options.draw_start_arrow = true;
      staveLine3.render_options.color = 'red';
      staveLine3.render_options.text_position_vertical = 1;

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },
  };

  return StaveLine;
}());

/**
 * VexFlow - StaveModifier Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StaveModifier = (function() {
  var StaveModifier = {
    Start: function() {
      QUnit.module('StaveModifier');
      VF.Test.runTests('Stave Draw Test', VF.Test.Stave.draw);
      VF.Test.runTests('Vertical Bar Test',
        VF.Test.Stave.drawVerticalBar);
      VF.Test.runTests('Begin & End StaveModifier Test',
        StaveModifier.drawBeginAndEnd);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();

      equal(stave.getYForNote(0), 100, 'getYForNote(0)');
      equal(stave.getYForLine(5), 100, 'getYForLine(5)');
      equal(stave.getYForLine(0), 50, 'getYForLine(0) - Top Line');
      equal(stave.getYForLine(4), 90, 'getYForLine(4) - Bottom Line');

      ok(true, 'all pass');
    },

    drawVerticalBar: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();
      stave.drawVerticalBar(100);
      stave.drawVerticalBar(150);
      stave.drawVerticalBar(300);

      ok(true, 'all pass');
    },

    drawBeginAndEnd: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      var stave = new VF.Stave(10, 10, 400);
      stave.setContext(ctx);
      stave.setTimeSignature('C|');
      stave.setKeySignature('Db');
      stave.setClef('treble');
      stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      stave.setEndClef('alto');
      stave.setEndTimeSignature('9/8');
      stave.setEndKeySignature('G', 'C#');
      stave.setEndBarType(VF.Barline.type.DOUBLE);
      stave.draw();

      // change
      var END = VF.StaveModifier.Position.END;
      stave.setY(100);
      stave.setTimeSignature('3/4');
      stave.setKeySignature('G', 'C#');
      stave.setClef('bass');
      stave.setBegBarType(VF.Barline.type.SINGLE);
      stave.setClef('treble', undefined, undefined, END);
      stave.setTimeSignature('C', undefined, END);
      stave.setKeySignature('F', undefined, END);
      stave.setEndBarType(VF.Barline.type.SINGLE);
      stave.draw();

      ok(true, 'all pass');
    },
  };

  return StaveModifier;
})();

/**
 * VexFlow - StaveNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StaveNote = (function() {
  var StaveNote = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module('StaveNote');
      test('Tick', StaveNote.ticks);
      test('Tick - New API', StaveNote.ticksNewApi);
      test('Stem', StaveNote.stem);
      test('Automatic Stem Direction', StaveNote.autoStem);
      test('Displacement after calling setStemDirection', StaveNote.setStemDirectionDisplacement);
      test('StaveLine', StaveNote.staveLine);
      test('Width', StaveNote.width);
      test('TickContext', StaveNote.tickContext);

      VF.Test.runUITests('Interactive Mouseover StaveNote', StaveNote.draw, { clef: 'treble', octaveShift: 0, restKey: 'r/4', ui: true });

      runTests('StaveNote Draw - Treble', StaveNote.draw, { clef: 'treble', octaveShift: 0, restKey: 'r/4' });
      runTests('StaveNote BoundingBoxes - Treble', StaveNote.drawBoundingBoxes, { clef: 'treble', octaveShift: 0, restKey: 'r/4' });
      runTests('StaveNote Draw - Alto', StaveNote.draw, { clef: 'alto', octaveShift: -1, restKey: 'r/4' });
      runTests('StaveNote Draw - Tenor', StaveNote.draw, { clef: 'tenor', octaveShift: -1, restKey: 'r/3' });
      runTests('StaveNote Draw - Bass', StaveNote.draw, { clef: 'bass', octaveShift: -2, restKey: 'r/3' });
      runTests('StaveNote Draw - Harmonic And Muted', StaveNote.drawHarmonicAndMuted);
      runTests('StaveNote Draw - Slash', StaveNote.drawSlash);
      runTests('Displacements', StaveNote.displacements);
      runTests('StaveNote Draw - Bass 2', StaveNote.drawBass);
      runTests('StaveNote Draw - Key Styles', StaveNote.drawKeyStyles);
      runTests('StaveNote Draw - StaveNote Stem Styles', StaveNote.drawNoteStemStyles);
      runTests('StaveNote Draw - StaveNote Flag Styles', StaveNote.drawNoteStylesWithFlag);
      runTests('StaveNote Draw - StaveNote Styles', StaveNote.drawNoteStyles);
      runTests('Stave, Ledger Line, Beam, Stem and Flag Styles', StaveNote.drawBeamStyles);
      runTests('Flag and Dot Placement - Stem Up', StaveNote.dotsAndFlagsStemUp);
      runTests('Flag and Dots Placement - Stem Down', StaveNote.dotsAndFlagsStemDown);
      runTests('Beam and Dot Placement - Stem Up', StaveNote.dotsAndBeamsUp);
      runTests('Beam and Dot Placement - Stem Down', StaveNote.dotsAndBeamsDown);
      runTests('Center Aligned Note', StaveNote.centerAlignedRest);
      runTests('Center Aligned Note with Articulation', StaveNote.centerAlignedRestFermata);
      runTests('Center Aligned Note with Annotation', StaveNote.centerAlignedRestAnnotation);
      runTests('Center Aligned Note - Multi Voice', StaveNote.centerAlignedMultiVoice);
      runTests('Center Aligned Note with Multiple Modifiers', StaveNote.centerAlignedNoteMultiModifiers);
    },

    ticks: function() {
      var BEAT = 1 * VF.RESOLUTION / 4;

      var tickTests = {
        // Key value pairs of `testName: [durationString, expectedBeats, expectedNoteType]`
        'Breve note': ['1/2', 8.0, 'n'],
        'Whole note': ['w', 4.0, 'n'],
        'Quarter note': ['q', 1.0, 'n'],
        'Dotted half note': ['hd', 3.0, 'n'],
        'Doubled-dotted half note': ['hdd', 3.5, 'n'],
        'Triple-dotted half note': ['hddd', 3.75, 'n'],
        'Dotted half rest': ['hdr', 3.0, 'r'],
        'Double-dotted half rest': ['hddr', 3.5, 'r'],
        'Triple-dotted half rest': ['hdddr', 3.75, 'r'],
        'Dotted harmonic quarter note': ['qdh', 1.5, 'h'],
        'Double-dotted harmonic quarter note': ['qddh', 1.75, 'h'],
        'Triple-dotted harmonic quarter note': ['qdddh', 1.875, 'h'],
        'Dotted muted 8th note': ['8dm', 0.75, 'm'],
        'Double-dotted muted 8th note': ['8ddm', 0.875, 'm'],
        'Triple-dotted muted 8th note': ['8dddm', 0.9375, 'm'],
      };

      Object.keys(tickTests).forEach(function(testName) {
        var testData = tickTests[testName];
        var durationString = testData[0];
        var expectedBeats = testData[1];
        var expectedNoteType = testData[2];
        var note = new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: durationString });
        equal(note.getTicks().value(), BEAT * expectedBeats, testName + ' must have ' + expectedBeats + ' beats');
        equal(note.getNoteType(), expectedNoteType, 'Note type must be ' + expectedNoteType);
      });

      throws(function() {
        return new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '8.7dddm' });
      }, /BadArguments/, "Invalid note duration '8.7' throws BadArguments exception");

      throws(function() {
        return new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2Z' });
      }, /BadArguments/, "Invalid note type 'Z' throws BadArguments exception");

      throws(function() {
        return new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2dddZ' });
      }, /BadArguments/, "Invalid note type 'Z' throws BadArguments exception");
    },

    ticksNewApi: function() {
      var BEAT = 1 * VF.RESOLUTION / 4;

      // Key value pairs of `testName: [noteData, expectedBeats, expectedNoteType]`
      var tickTests = {
        'Breve note': [{ duration: '1/2' }, 8.0, 'n'],
        'Whole note': [{ duration: 'w' }, 4.0, 'n'],
        'Quarter note': [{ duration: 'q' }, 1.0, 'n'],
        'Dotted half note': [{ duration: 'h', dots: 1 }, 3.0, 'n'],
        'Doubled-dotted half note': [{ duration: 'h', dots: 2 }, 3.5, 'n'],
        'Triple-dotted half note': [{ duration: 'h', dots: 3 }, 3.75, 'n'],
        'Dotted half rest': [{ duration: 'h', dots: 1, type: 'r' }, 3.0, 'r'],
        'Double-dotted half rest': [{ duration: 'h', dots: 2, type: 'r' }, 3.5, 'r'],
        'Triple-dotted half rest': [{ duration: 'h', dots: 3, type: 'r' }, 3.75, 'r'],
        'Dotted harmonic quarter note': [{ duration: 'q', dots: 1, type: 'h' }, 1.5, 'h'],
        'Double-dotted harmonic quarter note': [{ duration: 'q', dots: 2, type: 'h' }, 1.75, 'h'],
        'Triple-dotted harmonic quarter note': [{ duration: 'q', dots: 3, type: 'h' }, 1.875, 'h'],
        'Dotted muted 8th note': [{ duration: '8', dots: 1, type: 'm' }, 0.75, 'm'],
        'Double-dotted muted 8th note': [{ duration: '8', dots: 2, type: 'm' }, 0.875, 'm'],
        'Triple-dotted muted 8th note': [{ duration: '8', dots: 3, type: 'm' }, 0.9375, 'm'],
      };

      Object.keys(tickTests).forEach(function(testName) {
        var testData = tickTests[testName];
        var noteData = testData[0];
        var expectedBeats = testData[1];
        var expectedNoteType = testData[2];

        noteData.keys = ['c/4', 'e/4', 'g/4'];

        var note = new VF.StaveNote(noteData);
        equal(note.getTicks().value(), BEAT * expectedBeats, testName + ' must have ' + expectedBeats + ' beats');
        equal(note.getNoteType(), expectedNoteType, 'Note type must be ' + expectedNoteType);
      });

      throws(function() {
        return new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '8.7dddm' });
      }, /BadArguments/, "Invalid note duration '8.7' throws BadArguments exception");

      throws(function() {
        return new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2Z' });
      }, /BadArguments/, "Invalid note type 'Z' throws BadArguments exception");

      throws(function() {
        return new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2dddZ' });
      }, /BadArguments/, "Invalid note type 'Z' throws BadArguments exception");
    },

    stem: function() {
      var note = new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'w' });
      equal(note.getStemDirection(), VF.StaveNote.STEM_UP, 'Default note has UP stem');
    },

    autoStem: function() {
      [
        // [keys, expectedStemDirection]
        [['c/5', 'e/5', 'g/5'], VF.StaveNote.STEM_DOWN],
        [['e/4', 'g/4', 'c/5'], VF.StaveNote.STEM_UP],
        [['c/5'], VF.StaveNote.STEM_DOWN],
        [['a/4', 'e/5', 'g/5'], VF.StaveNote.STEM_DOWN],
        [['b/4'], VF.StaveNote.STEM_DOWN],
      ]
        .forEach(function(testData) {
          var keys = testData[0];
          var expectedStemDirection = testData[1];
          var note = new VF.StaveNote({ keys: keys, auto_stem: true, duration: '8' });
          equal(note.getStemDirection(), expectedStemDirection, 'Stem must be' + (expectedStemDirection === VF.StaveNote.STEM_UP ? 'up' : 'down'));
        });
    },

    setStemDirectionDisplacement: function() {
      function getDisplacements(note) {
        return note.note_heads.map(function(notehead) {
          return notehead.isDisplaced();
        });
      }

      var stemUpDisplacements = [false, true, false];
      var stemDownDisplacements = [true, false, false];

      var note = new VF.StaveNote({ keys: ['c/5', 'd/5', 'g/5'], stem_direction: VF.Stem.UP, duration: '4' });
      deepEqual(getDisplacements(note), stemUpDisplacements);
      note.setStemDirection(VF.Stem.DOWN);
      deepEqual(getDisplacements(note), stemDownDisplacements);
      note.setStemDirection(VF.Stem.UP);
      deepEqual(getDisplacements(note), stemUpDisplacements);
    },

    staveLine: function() {
      var stave = new VF.Stave(10, 10, 300);
      var note = new VF.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' });
      note.setStave(stave);

      var props = note.getKeyProps();
      equal(props[0].line, 0, 'C/4 on line 0');
      equal(props[1].line, 1, 'E/4 on line 1');
      equal(props[2].line, 2.5, 'A/4 on line 2.5');

      var ys = note.getYs();
      equal(ys.length, 3, 'Chord should be rendered on three lines');
      equal(ys[0], 100, 'Line for C/4');
      equal(ys[1], 90, 'Line for E/4');
      equal(ys[2], 75, 'Line for A/4');
    },

    width: function() {
      var note = new VF.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' });

      throws(function() {
        note.getWidth();
      }, /UnformattedNote/, 'Unformatted note should have no width');
    },

    tickContext: function() {
      var stave = new VF.Stave(10, 10, 400);
      var note = new VF.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' }).setStave(stave);

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(10)
        .setPadding(0);

      expect(0);
    },

    showNote: function(note_struct, stave, ctx, x, drawBoundingBox) {
      var note = new VF.StaveNote(note_struct).setStave(stave);

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(x);

      note.setContext(ctx).draw();

      if (drawBoundingBox) note.getBoundingBox().draw(ctx);

      return note;
    },

    draw: function(options, contextBuilder) {
      var clef = options.params.clef;
      var octaveShift = options.params.octaveShift;
      var restKey = options.params.restKey;

      var ctx = new contextBuilder(options.elementId, 700, 180);
      var stave = new VF.Stave(10, 30, 750);
      stave.setContext(ctx);
      stave.addClef(clef);
      stave.draw();

      var lowerKeys = ['c/', 'e/', 'a/'];
      var higherKeys = ['c/', 'e/', 'a/'];
      for (var k = 0; k < lowerKeys.length; k++) {
        lowerKeys[k] = lowerKeys[k] + (4 + octaveShift);
        higherKeys[k] = higherKeys[k] + (5 + octaveShift);
      }

      var restKeys = [restKey];

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { clef: clef, keys: higherKeys, duration: '1/2' },
        { clef: clef, keys: lowerKeys, duration: 'w' },
        { clef: clef, keys: higherKeys, duration: 'h' },
        { clef: clef, keys: lowerKeys, duration: 'q' },
        { clef: clef, keys: higherKeys, duration: '8' },
        { clef: clef, keys: lowerKeys, duration: '16' },
        { clef: clef, keys: higherKeys, duration: '32' },
        { clef: clef, keys: higherKeys, duration: '64' },
        { clef: clef, keys: higherKeys, duration: '128' },
        { clef: clef, keys: lowerKeys, duration: '1/2', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: 'w', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: 'h', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: 'q', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '8', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '16', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '32', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '64', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '128', stem_direction: -1 },

        { clef: clef, keys: restKeys, duration: '1/2r' },
        { clef: clef, keys: restKeys, duration: 'wr' },
        { clef: clef, keys: restKeys, duration: 'hr' },
        { clef: clef, keys: restKeys, duration: 'qr' },
        { clef: clef, keys: restKeys, duration: '8r' },
        { clef: clef, keys: restKeys, duration: '16r' },
        { clef: clef, keys: restKeys, duration: '32r' },
        { clef: clef, keys: restKeys, duration: '64r' },
        { clef: clef, keys: restKeys, duration: '128r' },
        { keys: ['x/4'], duration: 'h' },
      ];
      expect(notes.length * 2);

      function colorDescendants(color) {
        return function() {
          Vex.forEach($(this).find('*'), function(child) {
            child.setAttribute('fill', color);
            child.setAttribute('stroke', color);
          });
        };
      }

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        // If this is an interactivity test, then attempt to attach mouseover
        // and mouseout handlers to the notes.
        if (options.params.ui) {
          var item = staveNote.getAttribute('el');
          item.addEventListener('mouseover', colorDescendants('green'), false);
          item.addEventListener('mouseout', colorDescendants('black'), false);
        }
        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    drawBoundingBoxes: function(options, contextBuilder) {
      var clef = options.params.clef;
      var octaveShift = options.params.octaveShift;
      var restKey = options.params.restKey;

      var ctx = new contextBuilder(options.elementId, 700, 180);
      var stave = new VF.Stave(10, 30, 750);
      stave.setContext(ctx);
      stave.addClef(clef);
      stave.draw();

      var lowerKeys = ['c/', 'e/', 'a/'];
      var higherKeys = ['c/', 'e/', 'a/'];
      for (var k = 0; k < lowerKeys.length; k++) {
        lowerKeys[k] = lowerKeys[k] + (4 + octaveShift);
        higherKeys[k] = higherKeys[k] + (5 + octaveShift);
      }

      var restKeys = [restKey];

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { clef: clef, keys: higherKeys, duration: '1/2' },
        { clef: clef, keys: lowerKeys, duration: 'w' },
        { clef: clef, keys: higherKeys, duration: 'h' },
        { clef: clef, keys: lowerKeys, duration: 'q' },
        { clef: clef, keys: higherKeys, duration: '8' },
        { clef: clef, keys: lowerKeys, duration: '16' },
        { clef: clef, keys: higherKeys, duration: '32' },
        { clef: clef, keys: higherKeys, duration: '64' },
        { clef: clef, keys: higherKeys, duration: '128' },
        { clef: clef, keys: lowerKeys, duration: '1/2', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: 'w', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: 'h', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: 'q', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '8', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '16', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '32', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '64', stem_direction: -1 },
        { clef: clef, keys: lowerKeys, duration: '128' },

        { clef: clef, keys: restKeys, duration: '1/2r' },
        { clef: clef, keys: restKeys, duration: 'wr' },
        { clef: clef, keys: restKeys, duration: 'hr' },
        { clef: clef, keys: restKeys, duration: 'qr' },
        { clef: clef, keys: restKeys, duration: '8r' },
        { clef: clef, keys: restKeys, duration: '16r' },
        { clef: clef, keys: restKeys, duration: '32r' },
        { clef: clef, keys: restKeys, duration: '64r' },
        { clef: clef, keys: restKeys, duration: '128r' },
        { keys: ['x/4'], duration: 'h' },
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25, true);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    drawBass: function(options, contextBuilder) {
      expect(40);
      var ctx = new contextBuilder(options.elementId, 600, 280);
      var stave = new VF.Stave(10, 10, 650);
      stave.setContext(ctx);
      stave.addClef('bass');
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { clef: 'bass', keys: ['c/3', 'e/3', 'a/3'], duration: '1/2' },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: 'w' },
        { clef: 'bass', keys: ['c/3', 'e/3', 'a/3'], duration: 'h' },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: 'q' },
        { clef: 'bass', keys: ['c/3', 'e/3', 'a/3'], duration: '8' },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: '16' },
        { clef: 'bass', keys: ['c/3', 'e/3', 'a/3'], duration: '32' },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: 'h', stem_direction: -1 },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: 'q', stem_direction: -1 },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: '8', stem_direction: -1 },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: '16', stem_direction: -1 },
        { clef: 'bass', keys: ['c/2', 'e/2', 'a/2'], duration: '32', stem_direction: -1 },

        { keys: ['r/4'], duration: '1/2r' },
        { keys: ['r/4'], duration: 'wr' },
        { keys: ['r/4'], duration: 'hr' },
        { keys: ['r/4'], duration: 'qr' },
        { keys: ['r/4'], duration: '8r' },
        { keys: ['r/4'], duration: '16r' },
        { keys: ['r/4'], duration: '32r' },
        { keys: ['x/4'], duration: 'h' },
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    displacements: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 700, 140);
      ctx.scale(0.9, 0.9);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';

      var stave = new VF.Stave(10, 10, 650);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { keys: ['g/3', 'a/3', 'c/4', 'd/4', 'e/4'], duration: '1/2' },
        { keys: ['g/3', 'a/3', 'c/4', 'd/4', 'e/4'], duration: 'w' },
        { keys: ['d/4', 'e/4', 'f/4'], duration: 'h' },
        { keys: ['f/4', 'g/4', 'a/4', 'b/4'], duration: 'q' },
        { keys: ['e/3', 'b/3', 'c/4', 'e/4', 'f/4', 'g/5', 'a/5'], duration: '8' },
        { keys: ['a/3', 'c/4', 'e/4', 'g/4', 'a/4', 'b/4'], duration: '16' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '32' },
        { keys: ['c/4', 'e/4', 'a/4', 'a/4'], duration: '64' },
        { keys: ['g/3', 'c/4', 'd/4', 'e/4'], duration: 'h', stem_direction: -1 },
        { keys: ['d/4', 'e/4', 'f/4'], duration: 'q', stem_direction: -1 },
        { keys: ['f/4', 'g/4', 'a/4', 'b/4'], duration: '8', stem_direction: -1 },
        { keys: ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4'], duration: '16', stem_direction: -1 },
        { keys: ['b/3', 'c/4', 'e/4', 'a/4', 'b/5', 'c/6', 'e/6'], duration: '32', stem_direction: -1 },
        { keys: ['b/3', 'c/4', 'e/4', 'a/4', 'b/5', 'c/6', 'e/6', 'e/6'], duration: '64', stem_direction: -1 },
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 45);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    drawHarmonicAndMuted: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 1000, 180);
      var stave = new VF.Stave(10, 10, 950);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { keys: ['c/4', 'e/4', 'a/4'], duration: '1/2h' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'wh' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'hh' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'qh' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '8h' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '16h' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '32h' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '64h' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '128h' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '1/2h', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'wh', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'hh', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'qh', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '8h', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '16h', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '32h', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '64h', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '128h', stem_direction: -1 },

        { keys: ['c/4', 'e/4', 'a/4'], duration: '1/2m' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'wm' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'hm' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'qm' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '8m' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '16m' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '32m' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '64m' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '128m' },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '1/2m', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'wm', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'hm', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: 'qm', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '8m', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '16m', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '32m', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '64m', stem_direction: -1 },
        { keys: ['c/4', 'e/4', 'a/4'], duration: '128m', stem_direction: -1 },
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i * 25) + 5);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    drawSlash: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 700, 180);
      var stave = new VF.Stave(10, 10, 650);
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        { keys: ['b/4'], duration: '1/2s', stem_direction: -1 },
        { keys: ['b/4'], duration: 'ws', stem_direction: -1 },
        { keys: ['b/4'], duration: 'hs', stem_direction: -1 },
        { keys: ['b/4'], duration: 'qs', stem_direction: -1 },
        { keys: ['b/4'], duration: '8s', stem_direction: -1 },
        { keys: ['b/4'], duration: '16s', stem_direction: -1 },
        { keys: ['b/4'], duration: '32s', stem_direction: -1 },
        { keys: ['b/4'], duration: '64s', stem_direction: -1 },
        { keys: ['b/4'], duration: '128s', stem_direction: -1 },

        { keys: ['b/4'], duration: '1/2s', stem_direction: 1 },
        { keys: ['b/4'], duration: 'ws', stem_direction: 1 },
        { keys: ['b/4'], duration: 'hs', stem_direction: 1 },
        { keys: ['b/4'], duration: 'qs', stem_direction: 1 },
        { keys: ['b/4'], duration: '8s', stem_direction: 1 },
        { keys: ['b/4'], duration: '16s', stem_direction: 1 },
        { keys: ['b/4'], duration: '32s', stem_direction: 1 },
        { keys: ['b/4'], duration: '64s', stem_direction: 1 },
        { keys: ['b/4'], duration: '128s', stem_direction: 1 },

        // Beam
        { keys: ['b/4'], duration: '8s', stem_direction: -1 },
        { keys: ['b/4'], duration: '8s', stem_direction: -1 },
        { keys: ['b/4'], duration: '8s', stem_direction: 1 },
        { keys: ['b/4'], duration: '8s', stem_direction: 1 },
      ];

      var stave_notes = notes.map(function(note) { return new VF.StaveNote(note); });
      var beam1 = new VF.Beam([stave_notes[16], stave_notes[17]]);
      var beam2 = new VF.Beam([stave_notes[18], stave_notes[19]]);

      VF.Formatter.FormatAndDraw(ctx, stave, stave_notes, false);

      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      ok('Slash Note Heads');
    },

    drawKeyStyles: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 300, 280);
      ctx.scale(3, 3);

      var stave = new VF.Stave(10, 0, 100);

      var note = new VF.StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: 'q' })
        .setStave(stave)
        .addAccidental(1, new VF.Accidental('b'))
        .setKeyStyle(1, { shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue' });

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(25);

      stave.setContext(ctx).draw();
      note.setContext(ctx).draw();

      ok(note.getX() > 0, 'Note has X value');
      ok(note.getYs().length > 0, 'Note has Y values');
    },

    drawNoteStyles: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 300, 280);
      var stave = new VF.Stave(10, 0, 100);
      ctx.scale(3, 3);

      var note = new VF.StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: '8' })
        .setStave(stave)
        .addAccidental(1, new VF.Accidental('b'));

      note.setStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(25);

      stave.setContext(ctx).draw();
      note.setContext(ctx).draw();

      ok(note.getX() > 0, 'Note has X value');
      ok(note.getYs().length > 0, 'Note has Y values');
    },

    drawNoteStemStyles: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 300, 280);
      var stave = new VF.Stave(10, 0, 100);
      ctx.scale(3, 3);

      var note = new VF.StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: 'q' })
        .setStave(stave)
        .addAccidental(1, new VF.Accidental('b'));

      note.setStemStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(25);

      stave.setContext(ctx).draw();
      note.setContext(ctx).draw();

      ok('Note Stem Style');
    },

    drawNoteStylesWithFlag: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 300, 280);
      var stave = new VF.Stave(10, 0, 100);
      ctx.scale(3, 3);

      var note = new VF.StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: '8' })
        .setStave(stave)
        .addAccidental(1, new VF.Accidental('b'));

      note.setFlagStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(25);

      stave.setContext(ctx).draw();
      note.setContext(ctx).draw();

      ok(note.getX() > 0, 'Note has X value');
      ok(note.getYs().length > 0, 'Note has Y values');
    },

    drawBeamStyles: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 160);
      var stave = new VF.Stave(10, 10, 380);
      stave.setStyle({
        strokeStyle: '#EEAAEE',
        lineWidth: '3',
      });
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        // beam1
        { keys: ['b/4'], duration: '8', stem_direction: -1 },
        { keys: ['b/4'], duration: '8', stem_direction: -1 },

        // should be unstyled...
        { keys: ['b/4'], duration: '8', stem_direction: -1 },

        // beam2 should also be unstyled
        { keys: ['b/4'], duration: '8', stem_direction: -1 },
        { keys: ['b/4'], duration: '8', stem_direction: -1 },

        // beam3
        { keys: ['b/4'], duration: '8', stem_direction: 1 },
        { keys: ['b/4'], duration: '8', stem_direction: 1 },

        // beam4
        { keys: ['d/6'], duration: '8', stem_direction: -1 },
        { keys: ['c/6', 'd/6'], duration: '8', stem_direction: -1 },

        // unbeamed
        { keys: ['d/6', 'e/6'], duration: '8', stem_direction: -1 },

        // unbeamed, unstyled
        { keys: ['e/6', 'f/6'], duration: '8', stem_direction: -1 },

      ];

      var staveNotes = notes.map(function(note) { return new VF.StaveNote(note); });

      var beam1 = new VF.Beam(staveNotes.slice(0, 2));
      var beam2 = new VF.Beam(staveNotes.slice(3, 5));
      var beam3 = new VF.Beam(staveNotes.slice(5, 7));
      var beam4 = new VF.Beam(staveNotes.slice(7, 9));

      // stem, key, ledger, flag; beam.setStyle

      beam1.setStyle({
        fillStyle: 'blue',
        strokeStyle: 'blue',
      });

      staveNotes[0].setKeyStyle(0, { fillStyle: 'purple' });
      staveNotes[0].setStemStyle({ strokeStyle: 'green' });
      staveNotes[1].setStemStyle({ strokeStyle: 'orange' });
      staveNotes[1].setKeyStyle(0, { fillStyle: 'darkturquoise' });

      staveNotes[5].setStyle({ fillStyle: 'tomato', strokeStyle: 'tomato' });
      beam3.setStyle({
        shadowBlur: 20,
        shadowColor: 'blue',
      });

      staveNotes[9].setLedgerLineStyle({ fillStyle: 'lawngreen', strokeStyle: 'lawngreen', lineWidth: 1 });
      staveNotes[9].setFlagStyle({ fillStyle: 'orange', strokeStyle: 'orange' });

      VF.Formatter.FormatAndDraw(ctx, stave, staveNotes, false);

      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      beam3.setContext(ctx).draw();
      beam4.setContext(ctx).draw();

      ok('draw beam styles');
    },

    renderNote: function(note, stave, ctx, x) {
      note.setStave(stave);

      var mc = new VF.ModifierContext();
      note.addToModifierContext(mc);

      new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(x);

      note.setContext(ctx).draw();
      ctx.save();

      return note;
    },

    dotsAndFlagsStemUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 150);
      ctx.scale(1.0, 1.0);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new VF.Stave(10, 10, 975);

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '8', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '16', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '32', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '64', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '128', stem_direction: 1 }).addDotToAll().addDotToAll(),
        newNote({ keys: ['g/4'], duration: '4', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '8', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '16', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '32' }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '64', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '128', stem_direction: 1 }).addDotToAll().addDotToAll(),
      ];

      stave.setContext(ctx).draw();

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
      }

      ok(true, 'Full Dot');
    },


    dotsAndFlagsStemDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 160);
      ctx.scale(1.0, 1.0);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new VF.Stave(10, 10, 975);

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['e/5'], duration: '4', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '8', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '16', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '32', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '64', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '128', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '4', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '8', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '16', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '32', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '64', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '128', stem_direction: -1 }).addDotToAll(),
      ];

      stave.setContext(ctx).draw();

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
      }

      ok(true, 'Full Dot');
    },

    dotsAndBeamsUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 150);
      ctx.scale(1.0, 1.0);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new VF.Stave(10, 10, 975);

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['f/4'], duration: '8', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '16', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '32', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '64', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['f/4'], duration: '128', stem_direction: 1 }).addDotToAll().addDotToAll(),
        newNote({ keys: ['g/4'], duration: '8', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '16', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '32' }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '64', stem_direction: 1 }).addDotToAll(),
        newNote({ keys: ['g/4'], duration: '128', stem_direction: 1 }).addDotToAll().addDotToAll(),
      ];

      var beam = new VF.Beam(notes);

      stave.setContext(ctx).draw();

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
      }

      beam.setContext(ctx).draw();

      ok(true, 'Full Dot');
    },

    dotsAndBeamsDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 800, 160);
      ctx.scale(1.0, 1.0);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new VF.Stave(10, 10, 975);

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ['e/5'], duration: '8', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '16', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '32', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '64', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['e/5'], duration: '128', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '8', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '16', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '32', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '64', stem_direction: -1 }).addDotToAll(),
        newNote({ keys: ['d/5'], duration: '128', stem_direction: -1 }).addDotToAll(),
      ];

      var beam = new VF.Beam(notes);

      stave.setContext(ctx).draw();

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
      }

      beam.setContext(ctx).draw();

      ok(true, 'Full Dot');
    },

    centerAlignedRest: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 160);

      var stave = vf.Stave({ x: 10, y: 10, width: 350 })
        .addClef('treble')
        .addTimeSignature('4/4');

      var note = vf.StaveNote({ keys: ['b/4'], duration: '1r', align_center: true });

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables([note]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    centerAlignedRestFermata: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 160);

      var stave = vf.Stave({ x: 10, y: 10, width: 350 })
        .addClef('treble')
        .addTimeSignature('4/4');

      var note = vf.StaveNote({ keys: ['b/4'], duration: '1r', align_center: true })
        .addArticulation(0, new VF.Articulation('a@a').setPosition(3));

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables([note]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    centerAlignedRestAnnotation: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 160);

      var stave = vf.Stave({ x: 10, y: 10, width: 350 })
        .addClef('treble')
        .addTimeSignature('4/4');

      var note = vf.StaveNote({ keys: ['b/4'], duration: '1r', align_center: true })
        .addAnnotation(0, new VF.Annotation('Whole measure rest').setPosition(3));

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables([note]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    centerAlignedNoteMultiModifiers: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 160);

      var stave = vf.Stave({ x: 10, y: 10, width: 350 })
        .addClef('treble')
        .addTimeSignature('4/4');

      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) { return new VF.StringNumber(num).setPosition(pos); }

      var note = vf.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '4', align_center: true })
        .addAnnotation(0, new VF.Annotation('Test').setPosition(3))
        .addStroke(0, new VF.Stroke(2))
        .addAccidental(1, new VF.Accidental('#'))
        .addModifier(0, newFinger('3', VF.Modifier.Position.LEFT))
        .addModifier(2, newFinger('2', VF.Modifier.Position.LEFT))
        .addModifier(1, newFinger('1', VF.Modifier.Position.RIGHT))
        .addModifier(2, newStringNumber('4', VF.Modifier.Position.BELOW))
        .addDotToAll();

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables([note]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    centerAlignedMultiVoice: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 160);

      var stave = vf.Stave({ x: 10, y: 10, width: 350 })
        .addClef('treble')
        .addTimeSignature('3/8');

      // Create custom duration
      var custom_duration = new VF.Fraction(3, 8);

      var notes0 = [
        { keys: ['c/4'], duration: '1r', align_center: true, duration_override: custom_duration },
      ].map(vf.StaveNote.bind(vf));

      var notes1 = [
        { keys: ['b/4'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
      ].map(vf.StaveNote.bind(vf));

      notes1[1].addAccidental(0, vf.Accidental({ type: '#' }));

      vf.Beam({ notes: notes1 });

      var voice0 = vf.Voice({ time: '3/8' })
        .setStrict(false)
        .addTickables(notes0);

      var voice1 = vf.Voice({ time: '3/8' })
        .setStrict(false)
        .addTickables(notes1);

      vf.Formatter()
        .joinVoices([voice0, voice1])
        .formatToStave([voice0, voice1], stave);

      vf.draw();

      ok(true);
    },
  };

  return StaveNote;
})();

/**
 * VexFlow - StaveTie Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StaveTie = (function() {
  function createTest(notesData, setupTies) {
    return function(options) {
      var vf = VF.Test.makeFactory(options, 300);
      var stave = vf.Stave();
      var score = vf.EasyScore();
      var voice = score.voice(score.notes.apply(score, notesData));
      var notes = voice.getTickables();

      setupTies(vf, notes, stave);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    };
  }

  return {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('StaveTie');

      run('Simple StaveTie', createTest(
        ['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }],
        function(vf, notes) {
          vf.StaveTie({
            from: notes[0],
            to: notes[1],
            first_indices: [0, 1],
            last_indices: [0, 1],
          });
        }
      ));

      run('Chord StaveTie', createTest(
        ['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'down' }],
        function(vf, notes) {
          vf.StaveTie({
            from: notes[0],
            to: notes[1],
            first_indices: [0, 1, 2],
            last_indices: [0, 1, 2],
          });
        }
      ));

      run('Stem Up StaveTie', createTest(
        ['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'up' }],
        function(vf, notes) {
          vf.StaveTie({
            from: notes[0],
            to: notes[1],
            first_indices: [0, 1, 2],
            last_indices: [0, 1, 2],
          });
        }
      ));

      run('No End Note', createTest(
        ['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }],
        function(vf, notes, stave) {
          stave.addEndClef('treble');
          vf.StaveTie({
            from: notes[1],
            to: null,
            first_indices: [2],
            last_indices: [2],
            text: 'slow.',
          });
        }
      ));

      run('No Start Note', createTest(
        ['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }],
        function(vf, notes, stave) {
          stave.addClef('treble');
          vf.StaveTie({
            from: null,
            to: notes[0],
            first_indices: [2],
            last_indices: [2],
            text: 'H',
          });
        }
      ));

      run('Set Direction Down', createTest(
        ['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }],
        function(vf, notes) {
          vf.StaveTie({
            from: notes[0],
            to: notes[1],
            first_indices: [0, 1],
            last_indices: [0, 1],
            options: {
              direction: VF.Stem.DOWN,
            },
          });
        }
      ));

      run('Set Direction Up', createTest(
        ['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }],
        function(vf, notes) {
          vf.StaveTie({
            from: notes[0],
            to: notes[1],
            first_indices: [0, 1],
            last_indices: [0, 1],
            options: {
              direction: VF.Stem.UP,
            },
          });
        }
      ));
    },
  };
}());

/**
 * VexFlow - StringNumber Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StringNumber = (function() {
  var StringNumber = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('StringNumber');

      run('String Number In Notation', StringNumber.drawMultipleMeasures);
      run('Fret Hand Finger In Notation', StringNumber.drawFretHandFingers);
      run('Multi Voice With Strokes, String & Finger Numbers', StringNumber.multi);
      run('Complex Measure With String & Finger Numbers', StringNumber.drawAccidentals);
    },

    drawMultipleMeasures: function(options) {
      var vf = VF.Test.makeFactory(options, 775, 200);
      var score = vf.EasyScore();

      // bar 1
      var stave1 = vf.Stave({ width: 300 })
        .setEndBarType(VF.Barline.type.DOUBLE)
        .addClef('treble');

      var notes1 = score.notes(
        '(c4 e4 g4)/4., (c5 e5 g5)/8, (c4 f4 g4)/4, (c4 f4 g4)/4',
        { stem: 'down' }
      );

      notes1[0]
        .addModifier(0, vf.StringNumber({ number: '5', position: 'right' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'left' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }));

      notes1[1]
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addModifier(0, vf.StringNumber({ number: '5', position: 'below' }))
        .addAccidental(1, vf.Accidental({ type: '#' }).setAsCautionary())
        .addModifier(2, vf.StringNumber({ number: '3', position: 'above' })
          .setLastNote(notes1[3])
          .setLineEndType(VF.Renderer.LineEndType.DOWN));

      notes1[2]
        .addModifier(0, vf.StringNumber({ number: '5', position: 'left' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'left' }))
        .addAccidental(1, vf.Accidental({ type: '#' }));

      notes1[3]
        .addModifier(0, vf.StringNumber({ number: '5', position: 'right' }).setOffsetY(7))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }).setOffsetY(6))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6));

      var voice1 = score.voice(notes1);

      vf.Formatter()
        .joinVoices([voice1])
        .formatToStave([voice1], stave1);

      // bar 2 - juxtaposing second bar next to first bar
      var stave2 = vf.Stave({ x: stave1.width + stave1.x, y: stave1.y, width: 300 })
        .setEndBarType(VF.Barline.type.DOUBLE);

      var notes2 = score.notes(
        '(c4 e4 g4)/4, (c5 e5 g5), (c4 f4 g4), (c4 f4 g4)',
        { stem: 'up' }
      );

      notes2[0]
        .addModifier(0, vf.StringNumber({ number: '5', position: 'right' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'left' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }));

      notes2[1]
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addModifier(0, vf.StringNumber({ number: '5', position: 'below' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'above' }).setLastNote(notes2[3]).setDashed(false));

      notes2[2]
        .addModifier(2, vf.StringNumber({ number: '3', position: 'left' }))
        .addAccidental(1, vf.Accidental({ type: '#' }));

      notes2[3]
        .addModifier(0, vf.StringNumber({ number: '5', position: 'right' }).setOffsetY(7))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }).setOffsetY(6))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6));

      var voice2 = score.voice(notes2);

      vf.Formatter()
        .joinVoices([voice2])
        .formatToStave([voice2], stave2);

      // bar 3 - juxtaposing third bar next to second bar
      var stave3 = vf.Stave({ x: stave2.width + stave2.x, y: stave2.y, width: 150 })
        .setEndBarType(VF.Barline.type.END);

      var notesBar3 = score.notes('(c4 e4 g4 a4)/1.');

      notesBar3[0]
        .addModifier(0, vf.StringNumber({ number: '5', position: 'below' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'left' }))
        .addModifier(3, vf.StringNumber({ number: '2', position: 'above' }));

      var voice3 = score.voice(notesBar3, { time: '6/4' });

      vf.Formatter()
        .joinVoices([voice3])
        .formatToStave([voice3], stave3);

      vf.draw();

      ok(true, 'String Number');
    },

    drawFretHandFingers: function(options) {
      var vf = VF.Test.makeFactory(options, 725, 200);
      var score = vf.EasyScore();

      // bar 1
      var stave1 = vf.Stave({ width: 350 })
        .setEndBarType(VF.Barline.type.DOUBLE)
        .addClef('treble');

      var notes1 = score.notes(
        '(c4 e4 g4)/4, (c5 e5 g5), (c4 f4 g4), (c4 f4 g4)',
        { stem: 'down' }
      );

      notes1[0]
        .addModifier(0, vf.Fingering({ number: '3', position: 'left' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'left' }));

      notes1[1]
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addModifier(0, vf.Fingering({ number: '3', position: 'left' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'left' }));

      notes1[2]
        .addModifier(0, vf.Fingering({ number: '3', position: 'below' }))
        .addModifier(1, vf.Fingering({ number: '4', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'left' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'above' }))
        .addAccidental(1, vf.Accidental({ type: '#' }));

      notes1[3]
        .addModifier(0, vf.Fingering({ number: '3', position: 'right' }))
        .addModifier(0, vf.StringNumber({ number: '5', position: 'right' }).setOffsetY(7))
        .addModifier(1, vf.Fingering({ number: '4', position: 'right' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }).setOffsetY(6))
        .addModifier(2, vf.Fingering({ number: '0', position: 'right' }).setOffsetY(-5))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6));

      var voice1 = score.voice(notes1);

      vf.Formatter()
        .joinVoices([voice1])
        .formatToStave([voice1], stave1);

      // bar 2 - juxtaposing second bar next to first bar
      var stave2 = vf.Stave({ x: stave1.width + stave1.x, y: stave1.y, width: 350 })
        .setEndBarType(VF.Barline.type.END);

      var notes2 = score.notes(
        '(c4 e4 g4)/4., (c5 e5 g5)/8, (c4 f4 g4)/8, (c4 f4 g4)/4.[stem="down"]',
        { stem: 'up' }
      );

      notes2[0]
        .addModifier(0, vf.Fingering({ number: '3', position: 'right' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'above' }));

      notes2[1]
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addModifier(0, vf.Fingering({ number: '3', position: 'right' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'left' }));

      notes2[2]
        .addModifier(0, vf.Fingering({ number: '3', position: 'below' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'left' }))
        .addModifier(2, vf.Fingering({ number: '1', position: 'right' }))
        .addAccidental(2, vf.Accidental({ type: '#' }));

      notes2[3]
        .addModifier(0, vf.Fingering({ number: '3', position: 'right' }))
        .addModifier(0, vf.StringNumber({ number: '5', position: 'right' }).setOffsetY(7))
        .addModifier(1, vf.Fingering({ number: '4', position: 'right' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }).setOffsetY(6))
        .addModifier(2, vf.Fingering({ number: '1', position: 'right' }).setOffsetY(-6))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6));

      var voice2 = score.voice(notes2);

      vf.Formatter()
        .joinVoices([voice2])
        .formatToStave([voice2], stave2);

      vf.draw();

      ok(true, 'String Number');
    },

    multi: function(options) {
      var vf = VF.Test.makeFactory(options, 700, 200);
      var score = vf.EasyScore();
      var stave = vf.Stave();

      var notes1 = score.notes(
        '(c4 e4 g4)/4, (a3 e4 g4), (c4 d4 a4), (c4 d4 a4)',
        { stem: 'up' }
      );

      notes1[0]
        .addStroke(0, new VF.Stroke(5))
        .addModifier(0, vf.Fingering({ number: '3', position: 'left' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'left' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'above' }));

      notes1[1]
        .addStroke(0, new VF.Stroke(6))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'above' }))
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addAccidental(2, vf.Accidental({ type: '#' }));

      notes1[2]
        .addStroke(0, new VF.Stroke(2))
        .addModifier(0, vf.Fingering({ number: '3', position: 'left' }))
        .addModifier(1, vf.Fingering({ number: '0', position: 'right' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }))
        .addModifier(2, vf.Fingering({ number: '1', position: 'left' }))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'right' }));

      notes1[3]
        .addStroke(0, new VF.Stroke(1))
        .addModifier(2, vf.StringNumber({ number: '3', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '4', position: 'right' }));

      var notes2 = score.notes('e3/8, e3, e3, e3, e3, e3, e3, e3', { stem: 'down' });

      notes2[0]
        .addModifier(0, vf.Fingering({ number: '0', position: 'left' }))
        .addModifier(0, vf.StringNumber({ number: '6', position: 'below' }));

      notes2[2]
        .addAccidental(0, vf.Accidental({ type: '#' }));

      notes2[4]
        .addModifier(0, vf.Fingering({ number: '0', position: 'left' }));

      // Position string number 6 beneath the strum arrow: left (15) and down (18)
      notes2[4]
        .addModifier(0, vf.StringNumber({ number: '6', position: 'left' }).setOffsetX(15).setOffsetY(18));

      var voices = [notes1, notes2].map(score.voice.bind(score));

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.Beam({ notes: notes2.slice(0, 4) });
      vf.Beam({ notes: notes2.slice(4, 8) });

      vf.draw();

      ok(true, 'Strokes Test Multi Voice');
    },

    drawAccidentals: function(options) {
      var vf = VF.Test.makeFactory(options, 500);

      var stave = vf.Stave()
        .setEndBarType(VF.Barline.type.DOUBLE)
        .addClef('treble');

      var notes = [
        vf.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'c/5', 'e/5', 'g/5'], stem_direction: 1, duration: '4' }),
        vf.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'd/5', 'e/5', 'g/5'], stem_direction: 1, duration: '4' }),
        vf.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'd/5', 'e/5', 'g/5'], stem_direction: -1, duration: '4' }),
        vf.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'd/5', 'e/5', 'g/5'], stem_direction: -1, duration: '4' }),
      ];

      notes[0]
        .addModifier(0, vf.Fingering({ number: '3', position: 'left' }))
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '2', position: 'left' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'left' }))
        .addAccidental(2, vf.Accidental({ type: '#' }))
        .addModifier(3, vf.Fingering({ number: '3', position: 'left' }))
        .addAccidental(3, vf.Accidental({ type: '#' }))
        .addModifier(4, vf.Fingering({ number: '2', position: 'right' }))
        .addModifier(4, vf.StringNumber({ number: '3', position: 'right' }))
        .addAccidental(4, vf.Accidental({ type: '#' }))
        .addModifier(5, vf.Fingering({ number: '0', position: 'left' }))
        .addAccidental(5, vf.Accidental({ type: '#' }));

      notes[1]
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addAccidental(2, vf.Accidental({ type: '#' }))
        .addAccidental(3, vf.Accidental({ type: '#' }))
        .addAccidental(4, vf.Accidental({ type: '#' }))
        .addAccidental(5, vf.Accidental({ type: '#' }));

      notes[2]
        .addModifier(0, vf.Fingering({ number: '3', position: 'left' }))
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addModifier(1, vf.Fingering({ number: '2', position: 'left' }))
        .addModifier(1, vf.StringNumber({ number: '2', position: 'left' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addModifier(2, vf.Fingering({ number: '0', position: 'left' }))
        .addAccidental(2, vf.Accidental({ type: '#' }))
        .addModifier(3, vf.Fingering({ number: '3', position: 'left' }))
        .addAccidental(3, vf.Accidental({ type: '#' }))
        .addModifier(4, vf.Fingering({ number: '2', position: 'right' }))
        .addModifier(4, vf.StringNumber({ number: '3', position: 'right' }))
        .addAccidental(4, vf.Accidental({ type: '#' }))
        .addModifier(5, vf.Fingering({ number: '0', position: 'left' }))
        .addAccidental(5, vf.Accidental({ type: '#' }));

      notes[3]
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addAccidental(2, vf.Accidental({ type: '#' }))
        .addAccidental(3, vf.Accidental({ type: '#' }))
        .addAccidental(4, vf.Accidental({ type: '#' }))
        .addAccidental(5, vf.Accidental({ type: '#' }));

      var voice = vf.Voice().addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'String Number');
    },
  };

  return StringNumber;
})();

/**
 * VexFlow - Stroke Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Strokes = (function() {
  var Strokes = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('Strokes');

      run('Strokes - Brush/Roll/Rasquedo', Strokes.brushRollRasquedo);
      run('Strokes - Arpeggio directionless (without arrows)', Strokes.arpeggioDirectionless);
      run('Strokes - Multi Voice', Strokes.multiVoice);
      run('Strokes - Notation and Tab', Strokes.notesWithTab);
      run('Strokes - Multi-Voice Notation and Tab', Strokes.multiNotationAndTab);
    },

    brushRollRasquedo: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 200);
      var score = vf.EasyScore();

      // bar 1
      var stave1 = vf.Stave({ width: 250 }).setEndBarType(VF.Barline.type.DOUBLE);

      var notes1 = score.notes(
        '(a3 e4 a4)/4, (c4 e4 g4), (c4 e4 g4), (c4 e4 g4)',
        { stem: 'up' }
      );

      notes1[0]
        .addStroke(0, new VF.Stroke(1));
      notes1[1]
        .addStroke(0, new VF.Stroke(2))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addAccidental(2, vf.Accidental({ type: '#' }))
        .addAccidental(0, vf.Accidental({ type: '#' }));
      notes1[2]
        .addStroke(0, new VF.Stroke(1));
      notes1[3]
        .addStroke(0, new VF.Stroke(2));

      var voice1 = score.voice(notes1);

      vf.Formatter()
        .joinVoices([voice1])
        .formatToStave([voice1], stave1);

      // bar 2
      var stave2 = vf.Stave({ x: stave1.width + stave1.x, y: stave1.y, width: 300 })
        .setEndBarType(VF.Barline.type.DOUBLE);

      var notes2 = score.notes(
        '(c4 d4 g4)/4, (c4 d4 g4), (c4 d4 g4), (c4 d4 a4)',
        { stem: 'up' }
      );

      notes2[0]
        .addStroke(0, new VF.Stroke(3));
      notes2[1]
        .addStroke(0, new VF.Stroke(4));
      notes2[2]
        .addStroke(0, new VF.Stroke(5));
      notes2[3]
        .addStroke(0, new VF.Stroke(6))
        .addAccidental(0, vf.Accidental({ type: 'bb' }))
        .addAccidental(1, vf.Accidental({ type: 'bb' }))
        .addAccidental(2, vf.Accidental({ type: 'bb' }));

      var voice2 = score.voice(notes2);

      vf.Formatter()
        .joinVoices([voice2])
        .formatToStave([voice2], stave2);

      vf.draw();

      ok(true, 'Brush/Roll/Rasquedo');
    },

    arpeggioDirectionless: function(options) {
      var vf = VF.Test.makeFactory(options, 700, 200);
      var score = vf.EasyScore();

      // bar 1
      var stave1 = vf.Stave({ x: 100, width: 500 }).setEndBarType(VF.Barline.type.DOUBLE);

      var notes1 = score.notes(
        '(g4 b4 d5)/4, (g4 b4 d5 g5), (g4 b4 d5 g5), (g4 b4 d5)',
        { stem: 'up' }
      );

      var graceNotes = [
        { keys: ['e/4'], duration: '32' },
        { keys: ['f/4'], duration: '32' },
        { keys: ['g/4'], duration: '32' },
      ].map(vf.GraceNote.bind(vf));

      var graceNoteGroup = vf.GraceNoteGroup({ notes: graceNotes, slur: false });
      graceNoteGroup.beamNotes();

      notes1[0]
        .addStroke(0, new VF.Stroke(7));
      notes1[1]
        .addStroke(0, new VF.Stroke(7))
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addAccidental(1, vf.Accidental({ type: '#' }))
        .addAccidental(2, vf.Accidental({ type: '#' }))
        .addAccidental(3, vf.Accidental({ type: '#' }));
      notes1[2]
        .addStroke(0, new VF.Stroke(7))
        .addAccidental(1, vf.Accidental({ type: 'b' }))
        .addModifier(0, graceNoteGroup);
      notes1[3]
        .addStroke(0, new VF.Stroke(7))
        .addModifier(0, vf.NoteSubGroup({ notes: [
          vf.ClefNote({ type: 'treble', options: { size: 'default', annotation: '8va' } }),
        ] }));

      var voice1 = score.voice(notes1);

      vf.Formatter()
        .joinVoices([voice1])
        .formatToStave([voice1], stave1);

      vf.draw();

      ok(true, 'Arpeggio directionless (without arrows)');
    },

    multiVoice: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 200);
      var score = vf.EasyScore();
      var stave = vf.Stave();

      var notes1 = score.notes(
        '(c4 e4 g4)/4, (c4 e4 g4), (c4 d4 a4), (c4 d4 a4)',
        { stem: 'up' }
      );

      notes1[0]
        .addStroke(0, new VF.Stroke(5));
      notes1[1]
        .addStroke(0, new VF.Stroke(6))
        .addAccidental(0, vf.Accidental({ type: '#' }))
        .addAccidental(2, vf.Accidental({ type: '#' }));
      notes1[2]
        .addStroke(0, new VF.Stroke(2));
      notes1[3]
        .addStroke(0, new VF.Stroke(1));

      var notes2 = score.notes(
        'e3/8, e3, e3, e3, e3, e3, e3, e3',
        { stem: 'down' }
      );

      vf.Beam({ notes: notes2.slice(0, 4) });
      vf.Beam({ notes: notes2.slice(4, 8) });

      var voices = [notes1, notes2].map(score.voice.bind(score));

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();

      ok(true, 'Strokes Test Multi Voice');
    },

    multiNotationAndTab: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 275);
      var score = vf.EasyScore();
      var stave = vf.Stave().addClef('treble');

      // notation upper voice notes
      var notes1 = score.notes(
        '(g4 b4 e5)/4, (g4 b4 e5), (g4 b4 e5), (g4 b4 e5)',
        { stem: 'up' }
      );

      notes1[0].addStroke(0, new VF.Stroke(3, { all_voices: false }));
      notes1[1].addStroke(0, new VF.Stroke(6));
      notes1[2].addStroke(0, new VF.Stroke(2, { all_voices: false }));
      notes1[3].addStroke(0, new VF.Stroke(1));

      var notes2 = score.notes(
        'g3/4, g3, g3, g3',
        { stem: 'down' }
      );

      vf.TabStave({ y: 100 })
        .addClef('tab')
        .setNoteStartX(stave.getNoteStartX());

      // tablature upper voice notes
      var tabNotes1 = [
        vf.TabNote({
          positions: [{ str: 3, fret: 0 },
            { str: 2, fret: 0 },
            { str: 1, fret: 1 }], duration: '4',
        }),
        vf.TabNote({
          positions: [{ str: 3, fret: 0 },
            { str: 2, fret: 0 },
            { str: 1, fret: 1 }], duration: '4',
        }),
        vf.TabNote({
          positions: [{ str: 3, fret: 0 },
            { str: 2, fret: 0 },
            { str: 1, fret: 1 }], duration: '4',
        }),
        vf.TabNote({
          positions: [{ str: 3, fret: 0 },
            { str: 2, fret: 0 },
            { str: 1, fret: 1 }], duration: '4',
        }),
      ];

      tabNotes1[0].addStroke(0, new VF.Stroke(3, { all_voices: false }));
      tabNotes1[1].addStroke(0, new VF.Stroke(6));
      tabNotes1[2].addStroke(0, new VF.Stroke(2, { all_voices: false }));
      tabNotes1[3].addStroke(0, new VF.Stroke(1));

      var tabNotes2 = [
        vf.TabNote({ positions: [{ str: 6, fret: 3 }], duration: '4' }),
        vf.TabNote({ positions: [{ str: 6, fret: 3 }], duration: '4' }),
        vf.TabNote({ positions: [{ str: 6, fret: 3 }], duration: '4' }),
        vf.TabNote({ positions: [{ str: 6, fret: 3 }], duration: '4' }),
      ];

      var voices = [notes1, notes2, tabNotes1, tabNotes2].map(score.voice.bind(score));

      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();

      ok(true, 'Strokes Test Notation & Tab Multi Voice');
    },

    drawTabStrokes: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 200);
      var stave1 = vf.TabStave({ width: 250 }).setEndBarType(VF.Barline.type.DOUBLE);

      var tabNotes1 = [
        vf.TabNote({
          positions: [{ str: 2, fret: 8 },
            { str: 3, fret: 9 },
            { str: 4, fret: 10 }], duration: '4',
        }),
        vf.TabNote({
          positions: [{ str: 3, fret: 7 },
            { str: 4, fret: 8 },
            { str: 5, fret: 9 }], duration: '4',
        }),
        vf.TabNote({
          positions: [{ str: 1, fret: 5 },
            { str: 2, fret: 6 },
            { str: 3, fret: 7 },
            { str: 4, fret: 7 },
            { str: 5, fret: 5 },
            { str: 6, fret: 5 }], duration: '4',
        }),
        vf.TabNote({
          positions: [{ str: 4, fret: 3 },
            { str: 5, fret: 4 },
            { str: 6, fret: 5 }], duration: '4',
        }),
      ];

      tabNotes1[0].addStroke(0, new VF.Stroke(1));
      tabNotes1[1].addStroke(0, new VF.Stroke(2));
      tabNotes1[2].addStroke(0, new VF.Stroke(3));
      tabNotes1[3].addStroke(0, new VF.Stroke(4));

      var tabVoice1 = vf.Voice().addTickables(tabNotes1);

      vf.Formatter()
        .joinVoices([tabVoice1])
        .formatToStave([tabVoice1], stave1);

      // bar 2
      var stave2 = vf.TabStave({ x: stave1.width + stave1.x, width: 300 })
        .setEndBarType(VF.Barline.type.DOUBLE);

      var tabNotes2 = [
        vf.TabNote({
          positions: [{ str: 2, fret: 7 },
            { str: 3, fret: 8 },
            { str: 4, fret: 9 }], duration: '2',
        }),
        vf.TabNote({
          positions: [{ str: 1, fret: 5 },
            { str: 2, fret: 6 },
            { str: 3, fret: 7 },
            { str: 4, fret: 7 },
            { str: 5, fret: 5 },
            { str: 6, fret: 5 }], duration: '2',
        }),
      ];

      tabNotes2[0].addStroke(0, new VF.Stroke(6));
      tabNotes2[1].addStroke(0, new VF.Stroke(5));

      var tabVoice2 = vf.Voice().addTickables(tabNotes2);

      vf.Formatter()
        .joinVoices([tabVoice2])
        .formatToStave([tabVoice2], stave2);

      vf.draw();

      ok(true, 'Strokes Tab test');
    },

    notesWithTab: function(options) {
      var vf = VF.Test.makeFactory(options, 500, 300);

      var stave = vf.Stave({ x: 15, y: 40, width: 450 }).addClef('treble');

      var notes = [
        vf.StaveNote({ keys: ['b/4', 'd/5', 'g/5'], stem_direction: -1, duration: '4' })
          .addAccidental(1, vf.Accidental({ type: 'b' }))
          .addAccidental(0, vf.Accidental({ type: 'b' })),
        vf.StaveNote({ keys: ['c/5', 'd/5'], stem_direction: -1, duration: '4' }),
        vf.StaveNote({ keys: ['b/3', 'e/4', 'a/4', 'd/5'], stem_direction: 1, duration: '8' }),
        vf.StaveNote({ keys: ['a/3', 'e/4', 'a/4', 'c/5', 'e/5', 'a/5'], stem_direction: 1, duration: '8' })
          .addAccidental(3, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['b/3', 'e/4', 'a/4', 'd/5'], stem_direction: 1, duration: '8' }),
        vf.StaveNote({ keys: ['a/3', 'e/4', 'a/4', 'c/5', 'f/5', 'a/5'], stem_direction: 1, duration: '8' })
          .addAccidental(3, vf.Accidental({ type: '#' }))
          .addAccidental(4, vf.Accidental({ type: '#' })),
      ];

      var tabstave = vf.TabStave({ x: stave.x, y: 140, width: 450 })
        .addClef('tab')
        .setNoteStartX(stave.getNoteStartX());

      var tabNotes = [
        vf.TabNote({
          positions: [{ str: 1, fret: 3 },
            { str: 2, fret: 2 },
            { str: 3, fret: 3 }], duration: '4',
        }).addModifier(new VF.Bend('Full'), 0),
        vf.TabNote({
          positions: [{ str: 2, fret: 3 },
            { str: 3, fret: 5 }], duration: '4',
        }).addModifier(new VF.Bend('Unison'), 1),
        vf.TabNote({
          positions: [{ str: 3, fret: 7 },
            { str: 4, fret: 7 },
            { str: 5, fret: 7 },
            { str: 6, fret: 7 }], duration: '8',
        }),
        vf.TabNote({
          positions: [{ str: 1, fret: 5 },
            { str: 2, fret: 5 },
            { str: 3, fret: 6 },
            { str: 4, fret: 7 },
            { str: 5, fret: 7 },
            { str: 6, fret: 5 }], duration: '8',
        }),
        vf.TabNote({
          positions: [{ str: 3, fret: 7 },
            { str: 4, fret: 7 },
            { str: 5, fret: 7 },
            { str: 6, fret: 7 }], duration: '8',
        }),
        vf.TabNote({
          positions: [{ str: 1, fret: 5 },
            { str: 2, fret: 5 },
            { str: 3, fret: 6 },
            { str: 4, fret: 7 },
            { str: 5, fret: 7 },
            { str: 6, fret: 5 }], duration: '8',
        }),

      ];

      notes[0].addStroke(0, new VF.Stroke(1));
      notes[1].addStroke(0, new VF.Stroke(2));
      notes[2].addStroke(0, new VF.Stroke(3));
      notes[3].addStroke(0, new VF.Stroke(4));
      notes[4].addStroke(0, new VF.Stroke(5));
      notes[5].addStroke(0, new VF.Stroke(6));

      tabNotes[0].addStroke(0, new VF.Stroke(1));
      tabNotes[1].addStroke(0, new VF.Stroke(2));
      tabNotes[2].addStroke(0, new VF.Stroke(3));
      tabNotes[3].addStroke(0, new VF.Stroke(4));
      tabNotes[4].addStroke(0, new VF.Stroke(5));
      tabNotes[5].addStroke(0, new VF.Stroke(6));

      vf.StaveConnector({
        top_stave: stave,
        bottom_stave: tabstave,
        type: 'bracket',
      });

      vf.StaveConnector({
        top_stave: stave,
        bottom_stave: tabstave,
        type: 'single',
      });

      var voice = vf.Voice().addTickables(notes);
      var tabVoice = vf.Voice().addTickables(tabNotes);
      var beams = VF.Beam.applyAndGetBeams(voice);

      vf.Formatter()
        .joinVoices([voice])
        .joinVoices([tabVoice])
        .formatToStave([voice, tabVoice], stave);

      vf.draw();

      beams.forEach(function(beam) {
        beam.setContext(vf.getContext()).draw();
      });

      ok(true);
    },
  };

  return Strokes;
}());

/**
 * VexFlow - Style Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Style = (function() {
  var runTests = VF.Test.runTests;
  function FS(fill, stroke) {
    var ret = { fillStyle: fill };
    if (stroke) {
      ret.strokeStyle = stroke;
    }
    return ret;
  }

  var Style = {
    Start: function() {
      QUnit.module('Style');
      runTests('Basic Style', Style.stave);
      runTests('TabNote modifiers Style', Style.tab);
    },

    stave: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 150);
      var stave = vf.Stave({ x: 25, y: 20, width: 500 });

      // Stave modifiers test.
      var keySig = new VF.KeySignature('D');
      keySig.addToStave(stave);
      keySig.setStyle(FS('blue'));
      stave.addTimeSignature('4/4');
      var timeSig = stave.getModifiers(VF.StaveModifier.Position.BEGIN, VF.TimeSignature.CATEGORY);
      timeSig[0].setStyle(FS('brown'));

      var notes = [
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
        vf.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '8' }),

        // voice.draw() test.
        vf.TextDynamics({ text: 'sfz', duration: '16' }).setStyle(FS('blue')),

        // GhostNote modifiers test.
        vf.GhostNote({ duration: '16' }).addModifier(new VF.Annotation('GhostNote green text').setStyle(FS('green'))),
      ];

      notes[0].setKeyStyle(0, FS('red'));
      notes[1].setKeyStyle(0, FS('red'));

      // StaveNote modifiers test.
      var mods1 = notes[1].getModifiers();
      mods1[0].setStyle(FS('green'));
      notes[0].addArticulation(0, new VF.Articulation('a.').setPosition(4).setStyle(FS('green')));
      notes[0].addModifier(0, new VF.Ornament('mordent').setStyle(FS('lightgreen')));

      notes[1].addModifier(0, new VF.Annotation('blue').setStyle(FS('blue')));
      notes[1].addModifier(0,
        new VF.NoteSubGroup([vf.ClefNote({ options: { size: 'small' } }).setStyle(FS('blue'))]));

      var voice = vf.Voice().addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();
      ok(true, 'Basic Style');
    },

    tab: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 140);
      ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.font = ' 10pt Arial';
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph();
      stave.getModifiers()[2].setStyle(FS('blue'));
      stave.setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }
      function newAnnotation(text) { return new VF.Annotation(text); }

      // TabNote modifiers test.
      var notes = [
        newNote({
          positions: [{ str: 2, fret: 10 }, { str: 4, fret: 9 }], duration: 'h',
        })
          .addModifier(newAnnotation('green text').setStyle(FS('green')), 0),
        newNote({
          positions: [{ str: 2, fret: 10 }, { str: 4, fret: 9 }], duration: 'h',
        })
          .addModifier(newBend('Full').setStyle(FS('brown')), 0)
          .addStroke(0, new VF.Stroke(1, { all_voices: false }).setStyle(FS('blue'))),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, 'TabNote modifiers Style');
    },
  };

  return Style;
})();

/**
 * VexFlow - TabNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabNote = (function() {
  var TabNote = {
    Start: function() {
      QUnit.module('TabNote');

      test('Tick', VF.Test.TabNote.ticks);
      test('TabStave Line', VF.Test.TabNote.tabStaveLine);
      test('Width', VF.Test.TabNote.width);
      test('TickContext', VF.Test.TabNote.tickContext);

      var run = VF.Test.runTests;
      run('TabNote Draw', TabNote.draw);
      run('TabNote Stems Up', TabNote.drawStemsUp);
      run('TabNote Stems Down', TabNote.drawStemsDown);
      run('TabNote Stems Up Through Stave', TabNote.drawStemsUpThrough);
      run('TabNote Stems Down Through Stave', TabNote.drawStemsDownThrough);
      run('TabNote Stems with Dots', TabNote.drawStemsDotted);
    },

    ticks: function() {
      var BEAT = 1 * VF.RESOLUTION / 4;

      var note = new VF.TabNote({ positions: [{ str: 6, fret: 6 }], duration: '1' });
      equal(note.getTicks().value(), BEAT * 4, 'Whole note has 4 beats');

      note = new VF.TabNote({ positions: [{ str: 3, fret: 4 }], duration: '4' });
      equal(note.getTicks().value(), BEAT, 'Quarter note has 1 beat');
    },

    tabStaveLine: function() {
      var note = new VF.TabNote({
        positions: [{ str: 6, fret: 6 }, { str: 4, fret: 5 }],
        duration: '1',
      });

      var positions = note.getPositions();
      equal(positions[0].str, 6, 'String 6, Fret 6');
      equal(positions[0].fret, 6, 'String 6, Fret 6');
      equal(positions[1].str, 4, 'String 4, Fret 5');
      equal(positions[1].fret, 5, 'String 4, Fret 5');

      var stave = new VF.Stave(10, 10, 300);
      note.setStave(stave);

      var ys = note.getYs();
      equal(ys.length, 2, 'Chord should be rendered on two lines');
      equal(ys[0], 100, 'Line for String 6, Fret 6');
      equal(ys[1], 80, 'Line for String 4, Fret 5');
    },

    width: function() {
      expect(1);
      var note = new VF.TabNote({
        positions: [{ str: 6, fret: 6 }, { str: 4, fret: 5 }],
        duration: '1',
      });

      try {
        note.getWidth();
      } catch (e) {
        equal(e.code, 'UnformattedNote', 'Unformatted note should have no width');
      }
    },

    tickContext: function() {
      var note = new VF.TabNote({
        positions: [{ str: 6, fret: 6 }, { str: 4, fret: 5 }],
        duration: '1',
      });

      var tickContext = new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(10)
        .setPadding(0);

      equal(tickContext.getWidth(), 7);
    },

    showNote: function(tab_struct, stave, ctx, x) {
      var note = new VF.TabNote(tab_struct);
      var tickContext = new VF.TickContext();
      tickContext.addTickable(note).preFormat().setX(x);
      note.setContext(ctx).setStave(stave);
      note.draw();
      return note;
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 140);

      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.TabNote.showNote;
      var notes = [
        { positions: [{ str: 6, fret: 6 }], duration: '4' },
        { positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '4' },
        { positions: [{ str: 2, fret: 'x' }, { str: 5, fret: 15 }], duration: '4' },
        { positions: [{ str: 2, fret: 'x' }, { str: 5, fret: 5 }], duration: '4' },
        { positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '4' },
        {
          positions: [{ str: 6, fret: 0 },
            { str: 5, fret: 5 },
            { str: 4, fret: 5 },
            { str: 3, fret: 4 },
            { str: 2, fret: 3 },
            { str: 1, fret: 0 }],
          duration: '4',
        },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '4' },
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    drawStemsUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 200);
      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 30, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '4' },
        { positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '32' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '64' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '128' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok(true, 'TabNotes successfully drawn');
    },

    drawStemsDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 200);

      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '4' },
        { positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '32' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '64' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '128' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok(true, 'All objects have been drawn');
    },

    drawStemsUpThrough: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 200);
      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 30, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '4' },
        { positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '32' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '64' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '128' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_stem_through_stave = true;
        return tabNote;
      });

      ctx.setFont('sans-serif', 10, 'bold');
      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok(true, 'TabNotes successfully drawn');
    },

    drawStemsDownThrough: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 250);

      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, 550, { num_lines: 8 });
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '4' },
        { positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }, { str: 6, fret: 10 }], duration: '32' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '64' },
        { positions: [{ str: 1, fret: 6 }, { str: 3, fret: 5 }, { str: 5, fret: 5 }, { str: 7, fret: 5 }], duration: '128' },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_stem_through_stave = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      ctx.setFont('Arial', 10, 'bold');

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok(true, 'All objects have been drawn');
    },

    drawStemsDotted: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 200);
      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{ str: 3, fret: 6 }, { str: 4, fret: 25 }], duration: '4d' },
        { positions: [{ str: 2, fret: 10 }, { str: 5, fret: 12 }], duration: '8' },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '4dd', stem_direction: -1 },
        { positions: [{ str: 1, fret: 6 }, { str: 4, fret: 5 }], duration: '16', stem_direction: -1 },
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec, true);
        return tabNote;
      });

      notes[0].addDot();
      notes[2].addDot();
      notes[2].addDot();

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok(true, 'TabNotes successfully drawn');
    },
  };

  return TabNote;
})();

/**
 * VexFlow - TabSlide Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabSlide = (function() {
  var TabSlide = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('TabSlide');
      runTests('Simple TabSlide', TabSlide.simple);
      runTests('Slide Up', TabSlide.slideUp);
      runTests('Slide Down', TabSlide.slideDown);
    },

    tieNotes: function(notes, indices, stave, ctx) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      new VF.Formatter().joinVoices([voice]).format([voice], 100);
      voice.draw(ctx, stave);

      var tie = new VF.TabSlide({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: indices,
        last_indices: indices,
      }, VF.TabSlide.SLIDE_UP);

      tie.setContext(ctx);
      tie.draw();
    },

    setupContext: function(options, x) {
      var ctx = options.contextBuilder(options.elementId, 350, 140);
      ctx.scale(0.9, 0.9);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, x || 350)
        .addTabGlyph()
        .setContext(ctx)
        .draw();

      return { context: ctx, stave: stave };
    },


    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.TabSlide.setupContext(options);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      VF.Test.TabSlide.tieNotes([
        newNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' }),
        newNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
      ], [0], c.stave, c.context);
      ok(true, 'Simple Test');
    },

    multiTest: function(options, factory) {
      var c = VF.Test.TabSlide.setupContext(options, 440, 100);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var notes = [
        newNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
        newNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
        newNote({ positions: [{ str: 4, fret: 4 }, { str: 5, fret: 4 }], duration: '8' }),
        newNote({ positions: [{ str: 4, fret: 6 }, { str: 5, fret: 6 }], duration: '8' }),
        newNote({ positions: [{ str: 2, fret: 14 }], duration: '8' }),
        newNote({ positions: [{ str: 2, fret: 16 }], duration: '8' }),
        newNote({ positions: [{ str: 2, fret: 14 }, { str: 3, fret: 14 }], duration: '8' }),
        newNote({ positions: [{ str: 2, fret: 16 }, { str: 3, fret: 16 }], duration: '8' }),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes);
      new VF.Formatter().joinVoices([voice]).format([voice], 300);
      voice.draw(c.context, c.stave);

      factory({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, 'Single note');

      factory({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, 'Chord');

      factory({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, 'Single note high-fret');

      factory({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, 'Chord high-fret');
    },

    slideUp: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabSlide.multiTest(options, VF.TabSlide.createSlideUp);
    },

    slideDown: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabSlide.multiTest(options, VF.TabSlide.createSlideDown);
    },
  };

  return TabSlide;
}());

/**
 * VexFlow - TabStave Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabStave = (function() {
  var TabStave = {
    Start: function() {
      QUnit.module('TabStave');
      VF.Test.runTests('TabStave Draw Test', VF.Test.TabStave.draw);
      VF.Test.runTests('Vertical Bar Test', VF.Test.TabStave.drawVerticalBar);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 160);
      var stave = new VF.TabStave(10, 10, 300);
      stave.setNumLines(6);
      stave.setContext(ctx);
      stave.draw();

      equal(stave.getYForNote(0), 127, 'getYForNote(0)');
      equal(stave.getYForLine(5), 127, 'getYForLine(5)');
      equal(stave.getYForLine(0), 62, 'getYForLine(0) - Top Line');
      equal(stave.getYForLine(4), 114, 'getYForLine(4) - Bottom Line');

      ok(true, 'all pass');
    },

    drawVerticalBar: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 160);
      var stave = new VF.TabStave(10, 10, 300);
      stave.setNumLines(6);
      stave.setContext(ctx);
      stave.drawVerticalBar(50, true);
      stave.drawVerticalBar(100, true);
      stave.drawVerticalBar(150, false);
      stave.setEndBarType(VF.Barline.type.END);
      stave.draw();

      ok(true, 'all pass');
    },
  };

  return TabStave;
})();

module.exports = VF.Test.TabStave;

/**
 * VexFlow - TabTie Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabTie = (function() {
  var TabTie = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('TabTie');

      run('Simple TabTie', TabTie.simple);
      run('Hammerons', TabTie.simpleHammeron);
      run('Pulloffs', TabTie.simplePulloff);
      run('Tapping', TabTie.tap);
      run('Continuous', TabTie.continuous);
    },

    tieNotes: function(notes, indices, stave, ctx, text) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      new VF.Formatter().joinVoices([voice]).format([voice], 100);
      voice.draw(ctx, stave);

      var tie = new VF.TabTie({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: indices,
        last_indices: indices,
      }, text || 'Annotation');

      tie.setContext(ctx);
      tie.draw();
    },

    setupContext: function(options, x, y) {
      var ctx = options.contextBuilder(options.elementId, x || 350, y || 160);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      ctx.setFont('Arial', VF.Test.Font.size, '');

      var stave = new VF.TabStave(10, 10, x || 350)
        .addTabGlyph()
        .setContext(ctx)
        .draw();

      return { context: ctx, stave: stave };
    },

    drawTie: function(notes, indices, options, text) {
      var c = VF.Test.TabTie.setupContext(options);
      VF.Test.TabTie.tieNotes(notes, indices, c.stave, c.context, text);
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      VF.Test.TabTie.drawTie([
        newNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' }),
        newNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
      ], [0], options);

      ok(true, 'Simple Test');
    },

    tap: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      VF.Test.TabTie.drawTie([
        newNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' })
          .addModifier(new VF.Annotation('T'), 0),
        newNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' }),
      ], [0], options, 'P');

      ok(true, 'Tapping Test');
    },

    multiTest: function(options, factory) {
      var c = VF.Test.TabTie.setupContext(options, 440, 140);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var notes = [
        newNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
        newNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
        newNote({ positions: [{ str: 4, fret: 4 }, { str: 5, fret: 4 }], duration: '8' }),
        newNote({ positions: [{ str: 4, fret: 6 }, { str: 5, fret: 6 }], duration: '8' }),
        newNote({ positions: [{ str: 2, fret: 14 }], duration: '8' }),
        newNote({ positions: [{ str: 2, fret: 16 }], duration: '8' }),
        newNote({ positions: [{ str: 2, fret: 14 }, { str: 3, fret: 14 }], duration: '8' }),
        newNote({ positions: [{ str: 2, fret: 16 }, { str: 3, fret: 16 }], duration: '8' }),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes);
      new VF.Formatter().joinVoices([voice]).format([voice], 300);
      voice.draw(c.context, c.stave);

      factory({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, 'Single note');

      factory({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, 'Chord');

      factory({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, 'Single note high-fret');

      factory({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, 'Chord high-fret');
    },

    simpleHammeron: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabTie.multiTest(options, VF.TabTie.createHammeron);
    },

    simplePulloff: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabTie.multiTest(options, VF.TabTie.createPulloff);
    },

    continuous: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.TabTie.setupContext(options, 440, 140);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var notes = [
        newNote({ positions: [{ str: 4, fret: 4 }], duration: 'q' }),
        newNote({ positions: [{ str: 4, fret: 5 }], duration: 'q' }),
        newNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes);
      new VF.Formatter().joinVoices([voice]).format([voice], 300);
      voice.draw(c.context, c.stave);

      VF.TabTie.createHammeron({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      VF.TabTie.createPulloff({
        first_note: notes[1],
        last_note: notes[2],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();
      ok(true, 'Continuous Hammeron');
    },
  };

  return TabTie;
}());

/**
 * VexFlow - TextBracket Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TextBracket = (function() {
  var TextBracket = {
    Start: function() {
      QUnit.module('TextBracket');
      VF.Test.runTests('Simple TextBracket', VF.Test.TextBracket.simple0);
      VF.Test.runTests('TextBracket Styles', VF.Test.TextBracket.simple1);
    },

    simple0: function(options) {
      var vf = VF.Test.makeFactory(options, 550);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var notes = score.notes('c4/4, c4, c4, c4, c4', { stem: 'up' });
      var voice = score.voice(notes, { time: '5/4' });

      vf.TextBracket({
        from: notes[0],
        to: notes[4],
        text: '15',
        options: {
          superscript: 'va',
          position: 'top',
        },
      });

      vf.TextBracket({
        from: notes[0],
        to: notes[4],
        text: '8',
        options: {
          superscript: 'vb',
          position: 'bottom',
          line: 3,
        },
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    simple1: function(options) {
      var vf = VF.Test.makeFactory(options, 550);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var notes = score.notes('c4/4, c4, c4, c4, c4', { stem: 'up' });
      var voice = score.voice(notes, { time: '5/4' });

      const topOctaves = [
        vf.TextBracket({
          from: notes[0],
          to: notes[1],
          text: 'Cool notes',
          options: {
            superscript: '',
            position: 'top',
          },
        }),
        vf.TextBracket({
          from: notes[2],
          to: notes[4],
          text: 'Testing',
          options: {
            position: 'top',
            superscript: 'superscript',
            font: { family: 'Arial', size: 15, weight: '' },
          },
        }),
      ];

      const bottomOctaves = [
        vf.TextBracket({
          from: notes[0],
          to: notes[1],
          text: '8',
          options: {
            superscript: 'vb',
            position: 'bottom',
            line: 3,
            font: { size: 30 },
          },
        }),
        vf.TextBracket({
          from: notes[2],
          to: notes[4],
          text: 'Not cool notes',
          options: {
            superscript: ' super uncool',
            position: 'bottom',
            line: 4,
          },
        }),
      ];

      topOctaves[1].render_options.line_width = 2;
      topOctaves[1].render_options.show_bracket = false;

      bottomOctaves[0].render_options.underline_superscript = false;
      bottomOctaves[0].setDashed(false);

      bottomOctaves[1].render_options.bracket_height = 40;
      bottomOctaves[1].setDashed(true, [2, 2]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },
  };

  return TextBracket;
})();

/**
 * VexFlow - Text Note Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TextNote = (function() {
  var TextNote = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module('TextNote');
      runTests('TextNote Formatting', TextNote.formatTextNotes);
      runTests('TextNote Formatting 2', TextNote.formatTextNotes2);
      runTests('TextNote Superscript and Subscript', TextNote.superscriptAndSubscript);
      runTests('TextNote Formatting With Glyphs 0', TextNote.formatTextGlyphs0);
      runTests('TextNote Formatting With Glyphs 1', TextNote.formatTextGlyphs1);
      runTests('Crescendo', TextNote.crescendo);
      runTests('Text Dynamics', TextNote.textDynamics);
    },

    formatTextNotes: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 200);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice1 = score.voice([
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: 'q' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: 'q' })
          .addAccidental(0, vf.Accidental({ type: 'n' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
      ]);

      var voice2 = score.voice([
        vf.TextNote({ text: 'Center Justification',  duration: 'h' })
          .setJustification(VF.TextNote.Justification.CENTER),
        vf.TextNote({ text: 'Left Line 1', duration: 'q' })
          .setLine(1),
        vf.TextNote({ text: 'Right', duration: 'q' })
          .setJustification(VF.TextNote.Justification.RIGHT),
      ]);

      const formatter = vf.Formatter();
      formatter.joinVoices([voice1, voice2]).formatToStave([voice1, voice2], stave);

      vf.draw();
      ok(true);
    },

    formatTextNotes2: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 200);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice1 = score.voice([
        vf.StaveNote({ keys: ['g/4'], stem_direction: 1, duration: '16' }),
        vf.StaveNote({ keys: ['g/4'], stem_direction: 1, duration: '16' }),
        vf.StaveNote({ keys: ['g/4'], stem_direction: 1, duration: '16' }),

        vf.StaveNote({ keys: ['g/5'], stem_direction: -1, duration: '16' }),
        vf.StaveNote({ keys: ['g/5'], stem_direction: -1, duration: '16' }),
        vf.StaveNote({ keys: ['g/5'], stem_direction: -1, duration: '16' }),

        vf.StaveNote({ keys: ['g/5', 'a/5'], stem_direction: -1, duration: '16' }),
        vf.StaveNote({ keys: ['g/5', 'a/5'], stem_direction: -1, duration: '16' }),
        vf.StaveNote({ keys: ['g/5', 'a/5'], stem_direction: -1, duration: '16' }),

        vf.StaveNote({ keys: ['g/4', 'a/4'], stem_direction: 1, duration: '16' }),
        vf.StaveNote({ keys: ['g/4', 'a/4'], stem_direction: 1, duration: '16' }),
        vf.StaveNote({ keys: ['g/4', 'a/4'], stem_direction: 1, duration: '16' }),

        vf.StaveNote({ keys: ['g/4', 'a/4'], stem_direction: 1, duration: 'q' }),
      ]);

      var voice2 = score.voice([
        vf.TextNote({ text: 'C',  duration: '16' })
          .setJustification(VF.TextNote.Justification.CENTER),
        vf.TextNote({ text: 'L', duration: '16' }),
        vf.TextNote({ text: 'R', duration: '16' }).setJustification(VF.TextNote.Justification.RIGHT),

        vf.TextNote({ text: 'C',  duration: '16' }).setJustification(VF.TextNote.Justification.CENTER),
        vf.TextNote({ text: 'L', duration: '16' }),
        vf.TextNote({ text: 'R', duration: '16' }).setJustification(VF.TextNote.Justification.RIGHT),

        vf.TextNote({ text: 'C',  duration: '16' }).setJustification(VF.TextNote.Justification.CENTER),
        vf.TextNote({ text: 'L', duration: '16' }),
        vf.TextNote({ text: 'R', duration: '16' }).setJustification(VF.TextNote.Justification.RIGHT),

        vf.TextNote({ text: 'C',  duration: '16' }).setJustification(VF.TextNote.Justification.CENTER),
        vf.TextNote({ text: 'L', duration: '16' }),
        vf.TextNote({ text: 'R', duration: '16' }).setJustification(VF.TextNote.Justification.RIGHT),

        vf.TextNote({ text: 'R', duration: 'q' }).setJustification(VF.TextNote.Justification.RIGHT),
      ]);

      vf.Formatter()
        .joinVoices([voice1, voice2])
        .formatToStave([voice1, voice2], stave);

      voice2.getTickables().forEach(note => VF.Note.plotMetrics(vf.getContext(), note, 170));

      vf.draw();

      ok(true);
    },

    superscriptAndSubscript: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice1 = score.voice([
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: 'h' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: 1, duration: 'q' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: 1, duration: 'q' })
          .addAccidental(0, vf.Accidental({ type: 'n' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
      ]);

      var voice2 = score.voice([
        vf.TextNote({ text: VF.unicode.flat + 'I', superscript: '+5',  duration: '8' }),
        vf.TextNote({ text: 'D' + VF.unicode.sharp + '/F',  duration: '4d', superscript: 'sus2' }),
        vf.TextNote({ text: 'ii', superscript: '6', subscript: '4',  duration: '8' }),
        vf.TextNote({ text: 'C', superscript: VF.unicode.triangle + '7', subscript: '', duration: '8' }),
        vf.TextNote({ text: 'vii', superscript: VF.unicode['o-with-slash'] + '7', duration: '8' }),
        vf.TextNote({ text: 'V', superscript: '7',   duration: '8' }),
      ]);

      voice2.getTickables().forEach(function(note) {
        note.font = { family: 'Serif', size: 15, weight: '' };
        note.setLine(13);
        note.setJustification(VF.TextNote.Justification.LEFT);
      });

      vf.Formatter()
        .joinVoices([voice1, voice2])
        .formatToStave([voice1, voice2], stave);

      vf.draw();

      ok(true);
    },

    formatTextGlyphs0: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice1 = score.voice([
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '8' }),
      ]);

      var voice2 = score.voice([
        vf.TextNote({ text: 'Center',  duration: '8' })
          .setJustification(VF.TextNote.Justification.CENTER),
        vf.TextNote({ glyph: 'f', duration: '8' }),
        vf.TextNote({ glyph: 'p', duration: '8' }),
        vf.TextNote({ glyph: 'm', duration: '8' }),
        vf.TextNote({ glyph: 'z', duration: '8' }),

        vf.TextNote({ glyph: 'mordent_upper', duration: '16' }),
        vf.TextNote({ glyph: 'mordent_lower', duration: '16' }),
        vf.TextNote({ glyph: 'segno', duration: '8' }),
        vf.TextNote({ glyph: 'coda', duration: '8' }),
      ]);

      voice2.getTickables().forEach(n => n.setJustification(VF.TextNote.Justification.CENTER));

      vf.Formatter()
        .joinVoices([voice1, voice2])
        .formatToStave([voice1, voice2], stave);

      vf.draw();

      ok(true);
    },

    formatTextGlyphs1: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice1 = score.voice([
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '8' }),
      ]);

      var voice2 = score.voice([
        vf.TextNote({ glyph: 'turn',  duration: '16' }),
        vf.TextNote({ glyph: 'turn_inverted',  duration: '16' }),
        vf.TextNote({ glyph: 'pedal_open', duration: '8' }).setLine(10),
        vf.TextNote({ glyph: 'pedal_close', duration: '8' }).setLine(10),
        vf.TextNote({ glyph: 'caesura_curved', duration: '8' }).setLine(3),
        vf.TextNote({ glyph: 'caesura_straight', duration: '8' }).setLine(3),
        vf.TextNote({ glyph: 'breath', duration: '8' }).setLine(2),
        vf.TextNote({ glyph: 'tick', duration: '8' }).setLine(3),
        vf.TextNote({ glyph: 'tr', duration: '8', smooth: true })
          .setJustification(VF.TextNote.Justification.CENTER),
      ]);

      voice2.getTickables().forEach(n => n.setJustification(VF.TextNote.Justification.CENTER));

      vf.Formatter()
        .joinVoices([voice1, voice2])
        .formatToStave([voice1, voice2], stave);

      vf.draw();

      ok(true);
    },

    crescendo: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice = score.voice([
        vf.TextNote({ glyph: 'p', duration: '16' }),
        new VF.Crescendo({ duration: '4d' })
          .setLine(0)
          .setHeight(25)
          .setStave(stave),
        vf.TextNote({ glyph: 'f', duration: '16' }),
        new VF.Crescendo({ duration: '4' })
          .setLine(5)
          .setStave(stave),
        new VF.Crescendo({ duration: '4' })
          .setLine(10)
          .setDecrescendo(true)
          .setHeight(5)
          .setStave(stave),
      ]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    textDynamics: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice = score.voice([
        vf.TextDynamics({ text: 'sfz', duration: '4' }),
        vf.TextDynamics({ text: 'rfz', duration: '4' }),
        vf.TextDynamics({ text: 'mp',  duration: '4' }),
        vf.TextDynamics({ text: 'ppp', duration: '4' }),

        vf.TextDynamics({ text: 'fff', duration: '4' }),
        vf.TextDynamics({ text: 'mf',  duration: '4' }),
        vf.TextDynamics({ text: 'sff', duration: '4' }),
      ], { time: '7/4' });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },
  };

  return TextNote;
})();

/**
 * VexFlow - Three Voices in single staff tests.
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ThreeVoices = (function() {
  function concat(a, b) { return a.concat(b); }

  function createThreeVoicesTest(noteGroup1, noteGroup2, noteGroup3, setup) {
    return function(options) {
      var vf = VF.Test.makeFactory(options, 600, 200);
      var stave = vf.Stave().addTrebleGlyph().addTimeSignature('4/4');
      var score = vf.EasyScore();

      var noteGroups = [noteGroup1, noteGroup2, noteGroup3].map(function(noteGroup) {
        return score.notes.apply(score, noteGroup);
      });

      var voices = noteGroups.map(score.voice.bind(score));

      setup(vf, voices);

      var beams = [
        VF.Beam.applyAndGetBeams(voices[0], +1),
        VF.Beam.applyAndGetBeams(voices[1], -1),
        VF.Beam.applyAndGetBeams(voices[2], -1),
      ].reduce(concat);

      // Set option to position rests near the notes in each voice
      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();

      for (var i = 0; i < beams.length; i++) {
        beams[i].setContext(vf.getContext()).draw();
      }

      ok(true);
    };
  }

  var ThreeVoices = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('Three Voice Rests');

      run('Three Voices - #1', createThreeVoicesTest(
        ['e5/2, e5', { stem: 'up' }],
        ['(d4 a4 d#5)/8, b4, (d4 a4 c5), b4, (d4 a4 c5), b4, (d4 a4 c5), b4', { stem: 'down' }],
        ['b3/4, e3, f3, a3', { stem: 'down' }],
        function(vf, voices) {
          voices[0]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '0', position: 'left' }));

          voices[1]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '0', position: 'left' }))
            .addModifier(1, vf.Fingering({ number: '4', position: 'left' }));
        }
      ));

      run('Three Voices - #2 Complex', createThreeVoicesTest(
        ['(a4 e5)/16, e5, e5, e5, e5/8, e5, e5/2', { stem: 'up' }],
        ['(d4 d#5)/16, (b4 c5), d5, e5, (d4 a4 c5)/8, b4, (d4 a4 c5), b4, (d4 a4 c5), b4', { stem: 'down' }],
        ['b3/8, b3, e3/4, f3, a3', { stem: 'down' }],
        function(vf, voices) {
          voices[0]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '2', position: 'left' }))
            .addModifier(1, vf.Fingering({ number: '0', position: 'above' }));

          voices[1]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '0', position: 'left' }))
            .addModifier(1, vf.Fingering({ number: '4', position: 'left' }));
        }
      ));

      run('Three Voices - #3', createThreeVoicesTest(
        ['(g4 e5)/4, e5, (g4 e5)/2', { stem: 'up' }],
        ['c#5/4, b4/8, b4/8/r, a4/4., g4/8', { stem: 'down' }],
        ['c4/4, b3, a3, g3', { stem: 'down' }],
        function(vf, voices) {
          voices[0]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '0', position: 'left' }))
            .addModifier(1, vf.Fingering({ number: '0', position: 'left' }));

          voices[1]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '1', position: 'left' }));

          voices[2]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '3', position: 'left' }));
        }
      ));

      run('Auto Adjust Rest Positions - Two Voices', ThreeVoices.autoRestTwoVoices);
      run('Auto Adjust Rest Positions - Three Voices #1', ThreeVoices.autorestthreevoices);
      run('Auto Adjust Rest Positions - Three Voices #2', ThreeVoices.autorestthreevoices2);
    },

    autoRestTwoVoices: function(options) {
      var vf = VF.Test.makeFactory(options, 900, 200);
      var score = vf.EasyScore();
      var x = 10;

      var beams = [];

      function createMeasure(measureTitle, width, alignRests) {
        var stave = vf.Stave({ x: x, y: 50, width: width }).setBegBarType(1);
        x += width;

        var voices = [
          score.notes(
            'b4/8/r, e5/16, b4/r, b4/8/r, e5/16, b4/r, b4/8/r, d5/16, b4/r, e5/4',
            { stem: 'up' }
          ),
          score.notes(
            'c5/16, c4, b4/r, d4, e4, f4, b4/r, g4, g4[stem="up"], a4[stem="up"], b4/r, b4[stem="up"], e4/4',
            { stem: 'down' }
          ),
          [vf.TextNote({ text: measureTitle, line: -1, duration: '1', smooth: true })],
        ].map(score.voice.bind(score));

        beams = beams
          .concat(VF.Beam.applyAndGetBeams(voices[0], 1))
          .concat(VF.Beam.applyAndGetBeams(voices[1], -1));

        vf.Formatter()
          .joinVoices(voices)
          .formatToStave(voices, stave, { align_rests: alignRests });
      }

      createMeasure('Default Rest Positions', 400, false);
      createMeasure('Rests Repositioned To Avoid Collisions', 400, true);

      vf.draw();

      for (var i = 0; i < beams.length; i++) {
        beams[i].setContext(vf.getContext()).draw();
      }

      ok(true, 'Auto Adjust Rests - Two Voices');
    },

    autorestthreevoices: function(options) {
      var vf = VF.Test.makeFactory(options, 850, 200);
      var score = vf.EasyScore();
      var x = 10;

      function createMeasure(measureTitle, width, alignRests) {
        var stave = vf.Stave({ x: x, y: 50, width: width }).setBegBarType(1);

        var voices = [
          score.voice(score.notes(
            'b4/4/r, e5, e5/r, e5/r, e5, e5, e5, e5/r',
            { stem: 'up' }
          ), { time: '8/4' }),
          score.voice(score.notes(
            'b4/4/r, b4/r, b4/r, b4, b4/r, b4/r, b4, b4',
            { stem: 'down' }
          ), { time: '8/4' }),
          score.voice(score.notes(
            'e4/4/r, e4/r, f4, b4/r, g4, c4, e4/r, c4',
            { stem: 'down' }
          ), { time: '8/4' }),
          score.voice([
            vf.TextNote({ text: measureTitle, duration: '1', line: -1, smooth: true }),
            vf.TextNote({ text: '', duration: '1', line: -1, smooth: true }),
          ], { time: '8/4' }),
        ];

        vf.Formatter()
          .joinVoices(voices)
          .formatToStave(voices, stave, { align_rests: alignRests });

        x += width;
      }

      createMeasure('Default Rest Positions', 400, false);
      createMeasure('Rests Repositioned To Avoid Collisions', 400, true);
      vf.draw();

      ok(true);
    },

    autorestthreevoices2: function(options) {
      var vf = VF.Test.makeFactory(options, 850, 200);
      var score = vf.EasyScore();
      var x = 10;

      function createMeasure(measureTitle, width, alignRests) {
        var stave = vf.Stave({ x: x, y: 50, width: width }).setBegBarType(1);

        var voices = [
          score.voice(score.notes(
            'b4/16/r, e5, e5/r, e5/r, e5, e5, e5, e5/r'
          ), { time: '2/4' }),
          score.voice(score.notes(
            'b4/16/r, b4/r, b4/r, b4, b4/r, b4/r, b4, b4'
          ), { time: '2/4' }),
          score.voice(score.notes(
            'e4/16/r, e4/r, f4, b4/r, g4, c4, e4/r, c4'
          ), { time: '2/4' }),
          score.voice([
            vf.TextNote({ text: measureTitle, duration: 'h', line: -1, smooth: true }),
          ], { time: '2/4' }),
        ];

        vf.Formatter()
          .joinVoices(voices)
          .formatToStave(voices, stave, { align_rests: alignRests });

        x += width;
      }

      createMeasure('Default Rest Positions', 400, false);
      createMeasure('Rests Repositioned To Avoid Collisions', 400, true);
      vf.draw();

      ok(true);
    },
  };

  return ThreeVoices;
}());

/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TickContext = (function() {
  var TickContext = {
    Start: function() {
      QUnit.module('TickContext');
      test('Current Tick Test', VF.Test.TickContext.currentTick);
      test('Tracking Test', VF.Test.TickContext.tracking);
    },

    currentTick: function() {
      var tc = new VF.TickContext();
      equal(tc.getCurrentTick().value(), 0, 'New tick context has no ticks');
    },

    tracking: function() {
      function createTickable() {
        return new VF.Test.MockTickable(VF.Test.TIME4_4);
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables = [
        createTickable().setTicks(BEAT).setWidth(10),
        createTickable().setTicks(BEAT * 2).setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30),
      ];

      var tc = new VF.TickContext();
      tc.setPadding(0);

      tc.addTickable(tickables[0]);
      equal(tc.getMaxTicks().value(), BEAT);

      tc.addTickable(tickables[1]);
      equal(tc.getMaxTicks().value(), BEAT * 2);

      tc.addTickable(tickables[2]);
      equal(tc.getMaxTicks().value(), BEAT * 2);

      equal(tc.getWidth(), 0);
      tc.preFormat();
      equal(tc.getWidth(), 30);
    },
  };

  return TickContext;
})();

/**
 * VexFlow - TimeSignature Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TimeSignature = (function() {
  return {
    Start: function() {
      QUnit.module('TimeSignature');

      test('Time Signature Parser', function() {
        var mustFail = ['asdf', '123/', '/10', '/', '4567', 'C+'];
        var mustPass = ['4/4', '10/12', '1/8', '1234567890/1234567890', 'C', 'C|'];

        var timeSig = new VF.TimeSignature();

        mustFail.forEach(function(invalidString) {
          throws(function() { timeSig.parseTimeSpec(invalidString); }, /BadTimeSignature/);
        });

        mustPass.forEach(function(validString) {
          timeSig.parseTimeSpec(validString);
        });

        ok(true, 'all pass');
      });

      var run = VF.Test.runTests;

      run('Basic Time Signatures', function(options, contextBuilder) {
        var ctx = new contextBuilder(options.elementId, 600, 120);

        new VF.Stave(10, 10, 500)
          .addTimeSignature('2/2')
          .addTimeSignature('3/4')
          .addTimeSignature('4/4')
          .addTimeSignature('6/8')
          .addTimeSignature('C')
          .addTimeSignature('C|')
          .addEndTimeSignature('2/2')
          .addEndTimeSignature('3/4')
          .addEndTimeSignature('4/4')
          .addEndClef('treble')
          .addEndTimeSignature('6/8')
          .addEndTimeSignature('C')
          .addEndTimeSignature('C|')
          .setContext(ctx)
          .draw();

        ok(true, 'all pass');
      });

      run('Big Signature Test', function(options, contextBuilder) {
        var ctx = new contextBuilder(options.elementId, 400, 120);

        new VF.Stave(10, 10, 300)
          .addTimeSignature('12/8')
          .addTimeSignature('7/16')
          .addTimeSignature('1234567/890')
          .addTimeSignature('987/654321')
          .setContext(ctx)
          .draw();

        ok(true, 'all pass');
      });

      run('Time Signature multiple staves alignment test', function(options, contextBuilder) {
        var ctx = new contextBuilder(options.elementId, 400, 350);

        var stave = new VF.Stave(15, 0, 300)
          .setConfigForLines(
            [false, false, true, false, false].map(function(visible) {
              return { visible: visible };
            }))
          .addClef('percussion')
          .addTimeSignature('4/4', 25) // passing the custom padding in pixels
          .setContext(ctx)
          .draw();

        var stave2 = new VF.Stave(15, 110, 300)
          .addClef('treble')
          .addTimeSignature('4/4')
          .setContext(ctx)
          .draw();

        new VF.StaveConnector(stave, stave2)
          .setType('single')
          .setContext(ctx)
          .draw();

        var stave3 = new VF.Stave(15, 220, 300)
          .addClef('bass')
          .addTimeSignature('4/4')
          .setContext(ctx)
          .draw();

        new VF.StaveConnector(stave2, stave3)
          .setType('single')
          .setContext(ctx)
          .draw();

        new VF.StaveConnector(stave2, stave3)
          .setType('brace')
          .setContext(ctx)
          .draw();

        ok(true, 'all pass');
      });

      run('Time Signature Change Test', function(options) {
        var vf = VF.Test.makeFactory(options, 900);

        var stave = vf.Stave(10, 10, 800)
          .addClef('treble')
          .addTimeSignature('C|');

        var voice = vf.Voice().setStrict(false).addTickables([
          vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
          vf.TimeSigNote({ time: '3/4' }),
          vf.StaveNote({ keys: ['d/4'], duration: '4', clef: 'alto' }),
          vf.StaveNote({ keys: ['b/3'], duration: '4r', clef: 'alto' }),
          vf.TimeSigNote({ time: 'C' }),
          vf.StaveNote({ keys: ['c/3', 'e/3', 'g/3'], duration: '4', clef: 'bass' }),
          vf.TimeSigNote({ time: '9/8' }),
          vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
        ]);

        vf.Formatter()
          .joinVoices([voice])
          .formatToStave([voice], stave);

        vf.draw();

        ok(true, 'all pass');
      });
    },
  };
}());

/**
 * VexFlow - Tuning Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Tuning = (function() {
  var Tuning = {
    Start: function() {
      QUnit.module('Tuning');
      test('Standard Tuning', VF.Test.Tuning.standard);
      test('Standard Banjo Tuning', VF.Test.Tuning.banjo);
      test('Return note for fret', VF.Test.Tuning.noteForFret);
    },

    checkStandard: function(tuning) {
      try {
        tuning.getValueForString(0);
      } catch (e) {
        equal(e.code, 'BadArguments', 'String 0');
      }

      try {
        tuning.getValueForString(9);
      } catch (e) {
        equal(e.code, 'BadArguments', 'String 7');
      }

      equal(tuning.getValueForString(6), 40, 'Low E string');
      equal(tuning.getValueForString(5), 45, 'A string');
      equal(tuning.getValueForString(4), 50, 'D string');
      equal(tuning.getValueForString(3), 55, 'G string');
      equal(tuning.getValueForString(2), 59, 'B string');
      equal(tuning.getValueForString(1), 64, 'High E string');
    },

    checkStandardBanjo: function(tuning) {
      try {
        tuning.getValueForString(0);
      } catch (e) {
        equal(e.code, 'BadArguments', 'String 0');
      }

      try {
        tuning.getValueForString(6);
      } catch (e) {
        equal(e.code, 'BadArguments', 'String 6');
      }

      equal(tuning.getValueForString(5), 67, 'High G string');
      equal(tuning.getValueForString(4), 50, 'D string');
      equal(tuning.getValueForString(3), 55, 'G string');
      equal(tuning.getValueForString(2), 59, 'B string');
      equal(tuning.getValueForString(1), 62, 'High D string');
    },

    banjo: function() {
      expect(7);

      var tuning = new VF.Tuning();
      tuning.setTuning('standardBanjo');
      VF.Test.Tuning.checkStandardBanjo(tuning);
    },

    standard: function() {
      expect(16);

      var tuning = new VF.Tuning();
      VF.Test.Tuning.checkStandard(tuning);

      // Test named tuning
      tuning.setTuning('standard');
      VF.Test.Tuning.checkStandard(tuning);
    },

    noteForFret: function() {
      expect(8);
      var tuning = new VF.Tuning('E/5,B/4,G/4,D/4,A/3,E/3');
      try {
        tuning.getNoteForFret(-1, 1);
      } catch (e) {
        equal(e.code, 'BadArguments', 'Fret -1');
      }

      try {
        tuning.getNoteForFret(1, -1);
      } catch (e) {
        equal(e.code, 'BadArguments', 'String -1');
      }

      equal(tuning.getNoteForFret(0, 1), 'E/5', 'High E string');
      equal(tuning.getNoteForFret(5, 1), 'A/5', 'High E string, fret 5');
      equal(tuning.getNoteForFret(0, 2), 'B/4', 'B string');
      equal(tuning.getNoteForFret(0, 3), 'G/4', 'G string');
      equal(tuning.getNoteForFret(12, 2), 'B/5', 'B string, fret 12');
      equal(tuning.getNoteForFret(0, 6), 'E/3', 'Low E string');
    },
  };

  return Tuning;
})();

/**
 * VexFlow - Tuplet Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Tuplet = (function() {
  // Ideally this would be using arrow syntax...
  var set = function(key) {
    return function(value) {
      return function(object) {
        object[key] = value;
        return object;
      };
    };
  };

  var setStemDirection = set('stem_direction');
  var setDuration = set('duration');

  var stemUp = setStemDirection(VF.Stem.UP);
  var stemDown = setStemDirection(VF.Stem.DOWN);
  var quarterNote = setDuration('4');

  var Tuplet = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('Tuplet');
      runTests('Simple Tuplet', Tuplet.simple);
      runTests('Beamed Tuplet', Tuplet.beamed);
      runTests('Ratioed Tuplet', Tuplet.ratio);
      runTests('Bottom Tuplet', Tuplet.bottom);
      runTests('Bottom Ratioed Tuplet', Tuplet.bottom_ratio);
      runTests('Awkward Tuplet', Tuplet.awkward);
      runTests('Complex Tuplet', Tuplet.complex);
      runTests('Mixed Stem Direction Tuplet', Tuplet.mixedTop);
      runTests('Mixed Stem Direction Bottom Tuplet', Tuplet.mixedBottom);
      runTests('Nested Tuplets', Tuplet.nested);
      runTests('Single Tuplets', Tuplet.single);
    },

    simple: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('3/4');

      var notes = [
        { keys: ['g/4'], duration: '4' },
        { keys: ['a/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['b/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      vf.Tuplet({ notes: notes.slice(0, 3) });
      vf.Tuplet({ notes: notes.slice(3, 6) });

      // 3/4 time
      var voice = vf.Voice({ time: { num_beats: 3, beat_value: 4 } })
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Simple Test');
    },

    beamed: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('3/8');

      var notes = [
        { keys: ['b/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      vf.Beam({ notes: notes.slice(0, 3) });
      vf.Beam({ notes: notes.slice(3, 10) });
      vf.Tuplet({ notes: notes.slice(0, 3) });
      vf.Tuplet({ notes: notes.slice(3, 10) });

      // 3/8 time
      var voice = vf.Voice({ time: { num_beats: 3, beat_value: 8 } })
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Beamed Test');
    },

    ratio: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('4/4');

      var notes = [
        { keys: ['f/4'], duration: '4' },
        { keys: ['a/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['g/4'], duration: '8' },
        { keys: ['e/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      vf.Beam({
        notes: notes.slice(3, 6),
      });

      vf.Tuplet({
        notes: notes.slice(0, 3),
        options: {
          ratioed: true,
        },
      });

      vf.Tuplet({
        notes: notes.slice(3, 6),
        options: {
          ratioed: true,
          notes_occupied: 4,
        },
      });

      var voice = vf.Voice()
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Ratioed Test');
    },

    bottom: function(options) {
      var vf = VF.Test.makeFactory(options, 350, 160);
      var stave = vf.Stave({ x: 10, y: 10 }).addTimeSignature('3/4');

      var notes = [
        { keys: ['f/4'], duration: '4' },
        { keys: ['c/4'], duration: '4' },
        { keys: ['g/4'], duration: '4' },
        { keys: ['d/5'], duration: '8' },
        { keys: ['g/3'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
      ].map(stemDown).map(vf.StaveNote.bind(vf));

      vf.Beam({
        notes: notes.slice(3, 6),
      });

      vf.Tuplet({
        notes: notes.slice(0, 3),
        options: { location: VF.Tuplet.LOCATION_BOTTOM },
      });

      vf.Tuplet({
        notes: notes.slice(3, 6),
        options: { location: VF.Tuplet.LOCATION_BOTTOM },
      });

      var voice = vf.Voice({ time: { num_beats: 3, beat_value: 4 } })
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Bottom Test');
    },

    bottom_ratio: function(options) {
      var vf = VF.Test.makeFactory(options, 350, 160);
      var stave = vf.Stave({ x: 10, y: 10 }).addTimeSignature('5/8');

      var notes = [
        { keys: ['f/4'], duration: '4' },
        { keys: ['c/4'], duration: '4' },
        { keys: ['d/4'], duration: '4' },
        { keys: ['d/5'], duration: '8' },
        { keys: ['g/5'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
      ].map(stemDown).map(vf.StaveNote.bind(vf));

      vf.Beam({
        notes: notes.slice(3, 6),
      });

      vf.Tuplet({
        notes: notes.slice(0, 3),
        options: {
          location: VF.Tuplet.LOCATION_BOTTOM,
          ratioed: true,
        },
      });

      vf.Tuplet({
        notes: notes.slice(3, 6),
        options: {
          location: VF.Tuplet.LOCATION_BOTTOM,
          notes_occupied: 1,
        },
      });

      var voice = vf.Voice({ time: { num_beats: 5, beat_value: 8 } })
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Bottom Ratioed Test');
    },

    awkward: function(options) {
      var vf = VF.Test.makeFactory(options, 370, 160);
      var stave = vf.Stave({ x: 10, y: 10 });

      var notes = [
        { keys: ['g/4'], duration: '16' },
        { keys: ['b/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['e/4'], duration: '16' },
        { keys: ['c/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['e/4'], duration: '16' },
        { keys: ['c/4'], duration: '8' },
        { keys: ['d/4'], duration: '8' },
        { keys: ['e/4'], duration: '8' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      vf.Beam({ notes: notes.slice(0, 12) });
      vf.Tuplet({
        notes: notes.slice(0, 12),
        options: {
          notes_occupied: 142,
          ratioed: true,
        },
      });

      vf.Tuplet({
        notes: notes.slice(12, 15),
        options: {
          ratioed: true,
        },
      }).setBracketed(true);

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Awkward Test');
    },

    complex: function(options) {
      var vf = VF.Test.makeFactory(options, 600);
      var stave = vf.Stave({ x: 10, y: 10 }).addTimeSignature('4/4');

      var notes1 = [
        { keys: ['b/4'], duration: '8d' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['g/4'], duration: '8' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['b/4'], duration: '16r' },
        { keys: ['g/4'], duration: '32' },
        { keys: ['f/4'], duration: '32' },
        { keys: ['g/4'], duration: '32' },
        { keys: ['f/4'], duration: '32' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      notes1[0].addDotToAll();

      var notes2 = [
        { keys: ['c/4'] },
        { keys: ['c/4'] },
        { keys: ['c/4'] },
        { keys: ['c/4'] },
      ].map(quarterNote).map(stemDown).map(vf.StaveNote.bind(vf));

      vf.Beam({ notes: notes1.slice(0, 3) });
      vf.Beam({ notes: notes1.slice(5, 9) });
      vf.Beam({ notes: notes1.slice(11, 16) });

      vf.Tuplet({
        notes: notes1.slice(0, 3),
      });

      vf.Tuplet({
        notes: notes1.slice(3, 11),
        options: {
          num_notes: 7,
          notes_occupied: 4,
          ratioed: false,
        },
      });

      vf.Tuplet({
        notes: notes1.slice(11, 16),
        options: {
          notes_occupied: 4,
        },
      });

      var voice1 = vf.Voice()
        .setStrict(true)
        .addTickables(notes1);

      var voice2 = vf.Voice()
        .setStrict(true)
        .addTickables(notes2);

      new VF.Formatter()
        .joinVoices([voice1, voice2])
        .formatToStave([voice1, voice2], stave);

      vf.draw();

      ok(true, 'Complex Test');
    },

    mixedTop: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10 });

      var notes = [
        { keys: ['a/4'], stem_direction: 1 },
        { keys: ['c/6'], stem_direction: -1 },
        { keys: ['a/4'], stem_direction: 1 },
        { keys: ['f/5'], stem_direction: 1 },
        { keys: ['a/4'], stem_direction: -1 },
        { keys: ['c/6'], stem_direction: -1 },
      ].map(quarterNote).map(vf.StaveNote.bind(vf));

      vf.Tuplet({
        notes: notes.slice(0, 2),
        options: {
          notes_occupied: 3,
        },
      });

      vf.Tuplet({
        notes: notes.slice(2, 4),
        options: {
          notes_occupied: 3,
        },
      });

      vf.Tuplet({
        notes: notes.slice(4, 6),
        options: {
          notes_occupied: 3,
        },
      });

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Mixed Stem Direction Tuplet');
    },

    mixedBottom: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10 });

      var notes = [
        { keys: ['f/3'], stem_direction: 1 },
        { keys: ['a/5'], stem_direction: -1 },
        { keys: ['a/4'], stem_direction: 1 },
        { keys: ['f/3'], stem_direction: 1 },
        { keys: ['a/4'], stem_direction: -1 },
        { keys: ['c/4'], stem_direction: -1 },
      ].map(quarterNote).map(vf.StaveNote.bind(vf));

      vf.Tuplet({
        notes: notes.slice(0, 2),
        options: {
          notes_occupied: 3,
        },
      });

      vf.Tuplet({
        notes: notes.slice(2, 4),
        options: {
          notes_occupied: 3,
        },
      });

      vf.Tuplet({
        notes: notes.slice(4, 6),
        options: {
          notes_occupied: 3,
        },
      });

      var voice = vf.Voice()
        .setStrict(false)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Mixed Stem Direction Bottom Tuplet');
    },

    nested: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10 }).addTimeSignature('4/4');

      var notes = [
        // Big triplet 1:
        { keys: ['b/4'], duration: '4' },
        { keys: ['a/4'], duration: '4' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['b/4'], duration: '2' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      vf.Beam({
        notes: notes.slice(2, 7),
      });

      vf.Tuplet({
        notes: notes.slice(0, 7),
        options: {
          notes_occupied: 2,
          num_notes: 3,
        },
      });

      vf.Tuplet({
        notes: notes.slice(2, 7),
        options: {
          notes_occupied: 4,
          num_notes: 5,
        },
      });

      // 4/4 time
      var voice = vf.Voice()
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Nested Tuplets');
    },

    single: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave({ x: 10, y: 10 }).addTimeSignature('4/4');

      var notes = [
        // Big triplet 1:
        { keys: ['c/4'], duration: '4' },
        { keys: ['d/4'], duration: '8' },
        { keys: ['e/4'], duration: '8' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
        { keys: ['a/4'], duration: '2' },
        { keys: ['b/4'], duration: '4' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      vf.Beam({
        notes: notes.slice(1, 4),
      });

      // big quartuplet
      vf.Tuplet({
        notes: notes.slice(0, -1),
        options: {
          num_notes: 4,
          notes_occupied: 3,
          ratioed: true,
          bracketed: true,
        },
      });

      // first singleton
      vf.Tuplet({
        notes: notes.slice(0, 1),
        options: {
          num_notes: 3,
          notes_occupied: 2,
          ratioed: true,
        },
      });

      // eighth note triplet
      vf.Tuplet({
        notes: notes.slice(1, 4),
        options: {
          num_notes: 3,
          notes_occupied: 2,
        },
      });

      // second singleton
      vf.Tuplet({
        notes: notes.slice(4, 5),
        options: {
          num_notes: 3,
          notes_occupied: 2,
          ratioed: true,
          bracketed: true,
        },
      });

      // 4/4 time
      var voice = vf.Voice({ time: { num_beats: 4, beat_value: 4 } })
        .setStrict(true)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Nested Tuplets');
    },
  };

  return Tuplet;
})();

/**
 * VexFlow - Vibrato Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Vibrato = (function() {
  var Vibrato = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('Vibrato');
      runTests('Simple Vibrato', Vibrato.simple);
      runTests('Harsh Vibrato', Vibrato.harsh);
      runTests('Vibrato with Bend', Vibrato.withBend);
    },

    simple: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 500, 140);

      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newVibrato() { return new VF.Vibrato(); }

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 10 }, { str: 4, fret: 9 }], duration: 'h' })
          .addModifier(newVibrato(), 0),
        newNote({
          positions: [{ str: 2, fret: 10 }], duration: 'h' })
          .addModifier(newVibrato(), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      ok(true, 'Simple Vibrato');
    },

    harsh: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 500, 240);

      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newVibrato() { return new VF.Vibrato(); }

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 10 }, { str: 4, fret: 9 }], duration: 'h' })
          .addModifier(newVibrato().setHarsh(true), 0),
        newNote({
          positions: [{ str: 2, fret: 10 }], duration: 'h' })
          .addModifier(newVibrato().setHarsh(true), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      ok(true, 'Harsh Vibrato');
    },

    withBend: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.3, 1.3); ctx.setFillStyle('#221'); ctx.setStrokeStyle('#221');
      ctx.setFont('Arial', VF.Test.Font.size, '');
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text, release) { return new VF.Bend(text, release); }
      function newVibrato() { return new VF.Vibrato(); }

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 9 }, { str: 3, fret: 9 }], duration: 'q' })
          .addModifier(newBend('1/2', true), 0)
          .addModifier(newBend('1/2', true), 1)
          .addModifier(newVibrato(), 0),
        newNote({
          positions: [{ str: 2, fret: 10 }], duration: 'q' })
          .addModifier(newBend('Full', false), 0)
          .addModifier(newVibrato().setVibratoWidth(60), 0),
        newNote({
          positions: [{ str: 2, fret: 10 }], duration: 'h' })
          .addModifier(newVibrato().setVibratoWidth(120).setHarsh(true), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      ok(true, 'Vibrato with Bend');
    },
  };

  return Vibrato;
})();

/**
 * VexFlow - VibratoBracket Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 * Author: Balazs Forian-Szabo
 */

VF.Test.VibratoBracket = (function() {
  function createTest(noteGroup1, setupVibratoBracket) {
    return function(options) {
      var vf = VF.Test.makeFactory(options, 650, 200);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes.apply(score, noteGroup1));

      setupVibratoBracket(vf, voice.getTickables());

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    };
  }

  return {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('VibratoBracket');

      run('Simple VibratoBracket', createTest(
        ['c4/4, c4, c4, c4'],
        function(vf, notes) {
          vf.VibratoBracket({
            from: notes[0],
            to: notes[3],
            options: {
              line: 2,
            },
          });
        }
      ));

      run('Harsh VibratoBracket Without End Note', createTest(
        ['c4/4, c4, c4, c4'],
        function(vf, notes) {
          vf.VibratoBracket({
            from: notes[2],
            to: null,
            options: {
              line: 2,
              harsh: true,
            },
          });
        }
      ));

      run('Harsh VibratoBracket Without Start Note', createTest(
        ['c4/4, c4, c4, c4'],
        function(vf, notes) {
          vf.VibratoBracket({
            from: null,
            to: notes[2],
            options: {
              line: 2,
              harsh: true,
            },
          });
        }
      ));
    },
  };
})();

/**
 * VexFlow - Voice Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Voice = (function() {
  var Voice = {
    Start: function() {
      QUnit.module('Voice');
      test('Strict Test', VF.Test.Voice.strict);
      test('Ignore Test', VF.Test.Voice.ignore);
      VF.Test.runTests('Full Voice Mode Test', VF.Test.Voice.full);
    },

    strict: function() {
      expect(8);
      function createTickable() {
        return new VF.Test.MockTickable(VF.Test.TIME4_4);
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables = [
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      equal(voice.totalTicks.value(), BEAT * 4, '4/4 Voice has 4 beats');
      equal(voice.ticksUsed.value(), BEAT * 0, 'No beats in voice');
      voice.addTickables(tickables);
      equal(voice.ticksUsed.value(), BEAT * 3, 'Three beats in voice');
      voice.addTickable(createTickable().setTicks(BEAT));
      equal(voice.ticksUsed.value(), BEAT * 4, 'Four beats in voice');
      equal(voice.isComplete(), true, 'Voice is complete');

      var beforeNumerator = voice.ticksUsed.numerator;
      try {
        voice.addTickable(createTickable().setTicks(BEAT));
      } catch (e) {
        equal(e.code, 'BadArgument', 'Too many ticks exception');
        equal(voice.ticksUsed.numerator, beforeNumerator, 'Revert "ticksUsed" when it occurred "Too many ticks" exception');
      }

      equal(voice.getSmallestTickCount().value(), BEAT, 'Smallest tick count is BEAT');
    },

    ignore: function() {
      function createTickable() {
        return new VF.Test.MockTickable(VF.Test.TIME4_4);
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables = [
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT).setIgnoreTicks(true),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT).setIgnoreTicks(true),
        createTickable().setTicks(BEAT),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(tickables);
      ok(true, 'all pass');
    },

    full: function(options, contextBuilder) {
      var ctx  = contextBuilder(options.elementId, 550, 200);

      var stave = new VF.Stave(10, 50, 500)
        .addClef('treble')
        .addTimeSignature('4/4')
        .setEndBarType(VF.Barline.type.END);

      var notes = [
        new VF.StaveNote({ keys: ['c/4'], duration: '4' }),
        new VF.StaveNote({ keys: ['d/4'], duration: '4' }),
        new VF.StaveNote({ keys: ['r/4'], duration: '4r' }),
      ];

      notes.forEach(function(note) { note.setStave(stave); });

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setMode(VF.Voice.Mode.FULL)
        .addTickables(notes);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      stave.setContext(ctx).draw();
      voice.draw(ctx);
      voice.getBoundingBox().draw(ctx);

      throws(function() {
        voice.addTickable(new VF.StaveNote({ keys: ['c/4'], duration: '2' }));
      }, /BadArgument/, 'Voice cannot exceed full amount of ticks');
    },
  };

  return Voice;
})();

VF.Test.run = function() {
  VF.Test.Accidental.Start();
  VF.Test.StaveNote.Start();
  VF.Test.Voice.Start();
  VF.Test.NoteHead.Start();
  VF.Test.TabNote.Start();
  VF.Test.TickContext.Start();
  VF.Test.ModifierContext.Start();
  VF.Test.Dot.Start();
  VF.Test.Bend.Start();
  VF.Test.Formatter.Start();
  VF.Test.Fraction.Start();
  VF.Test.Clef.Start();
  VF.Test.KeySignature.Start();
  VF.Test.TimeSignature.Start();
  VF.Test.StaveTie.Start();
  VF.Test.TabTie.Start();
  VF.Test.Stave.Start();
  VF.Test.TabStave.Start();
  VF.Test.TabSlide.Start();
  VF.Test.Beam.Start();
  VF.Test.Barline.Start();
  VF.Test.AutoBeamFormatting.Start();
  VF.Test.GraceNote.Start();
  VF.Test.GraceTabNote.Start();
  VF.Test.Vibrato.Start();
  VF.Test.VibratoBracket.Start();
  VF.Test.Annotation.Start();
  VF.Test.Tuning.Start();
  VF.Test.Music.Start();
  VF.Test.KeyManager.Start();
  VF.Test.Articulation.Start();
  VF.Test.StaveConnector.Start();
  VF.Test.MultiMeasureRest.Start();
  VF.Test.Percussion.Start();
  VF.Test.NoteSubGroup.Start();
  VF.Test.ClefKeySignature.Start();
  VF.Test.StaveHairpin.Start();
  VF.Test.Rhythm.Start();
  VF.Test.Tuplet.Start();
  VF.Test.BoundingBox.Start();
  VF.Test.Strokes.Start();
  VF.Test.StringNumber.Start();
  VF.Test.Rests.Start();
  VF.Test.ThreeVoices.Start();
  VF.Test.Curve.Start();
  VF.Test.TextNote.Start();
  VF.Test.StaveLine.Start();
  VF.Test.Ornament.Start();
  VF.Test.PedalMarking.Start();
  VF.Test.TextBracket.Start();
  VF.Test.StaveModifier.Start();
  VF.Test.GhostNote.Start();
  VF.Test.Style.Start();
  VF.Test.Factory.Start();
  VF.Test.Parser.Start();
  VF.Test.EasyScore.Start();
  VF.Test.Registry.Start();
  VF.Test.BachDemo.Start();
  VF.Test.GlyphNote.Start();
};

module.exports = VF.Test;

//# sourceMappingURL=vexflow-tests.js.map