/**
 * VexFlow 1.2.83 built on 2016-09-06.
 * Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>
 *
 * http://www.vexflow.com  http://github.com/0xfe/vexflow
 *//**
 * VexFlow Test Support Library
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

// Mock out the QUnit stuff for generating svg images,
// since we don't really care about the assertions.
if (!window.QUnit) {
  var process = require('system');

  window.QUnit = {}

  QUnit.assertions = {
    ok: function() {return true;},
    equal: function() {return true;},
    deepEqual: function() {return true;},
    expect: function() {return true;},
    throws: function() {return true;},
    notOk: function() {return true;}
  };

  QUnit.module = function(name) {
    QUnit.current_module = name;
  };

  QUnit.test = function(name, func) {
    QUnit.current_test = name;
    process.stdout.write("\033[0G" + QUnit.current_module + " :: " + name + "\033[0K");
    func(QUnit.assertions);
  };

  test = QUnit.test;
  ok = QUnit.assertions.ok;
  equal = QUnit.assertions.equal;
  deepEqual = QUnit.assertions.deepEqual;
  expect = QUnit.assertions.expect;
  throws = QUnit.assertions.throws;
  notOk = QUnit.assertions.notOk;
}

if (typeof require == "function") {
  Vex = require('./vexflow-debug.js');
}

var VF = Vex.Flow;
VF.Test = (function() {
  var Test = {
    // Test Options.
    RUN_CANVAS_TESTS: true,
    RUN_SVG_TESTS: true,
    RUN_RAPHAEL_TESTS: false,
    RUN_NODE_TESTS: false,

    // Where images are stored for NodeJS tests.
    NODE_IMAGEDIR: "images",

    // Default font properties for tests.
    Font: {size: 10},

    // Returns a unique ID for a test.
    genID: function() { return VF.Test.genID.ID++; },

    // Run `func` inside a QUnit test for each of the enabled
    // rendering backends.
    runTests: function(name, func, params) {
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
    runUITests: function(name, func, params) {
      if (VF.Test.RUN_SVG_TESTS) {
        VF.Test.runSVGTest(name, func, params);
      }
    },

    createTestCanvas: function(canvas_sel_name, test_name) {
      var sel = VF.Test.createTestCanvas.sel;
      var test_div = $('<div></div>').addClass("testcanvas");
      test_div.append($('<div></div>').addClass("name").text(test_name));
      test_div.append($('<canvas></canvas>').addClass("vex-tabdiv").
          attr("id", canvas_sel_name).
          addClass("name").text(name));
      $(sel).append(test_div);
    },

    createTestSVG: function(canvas_sel_name, test_name) {
      var sel = VF.Test.createTestCanvas.sel;
      var test_div = $('<div></div>').addClass("testcanvas");
      test_div.append($('<div></div>').addClass("name").text(test_name));
      test_div.append($('<div></div>').addClass("vex-tabdiv").
          attr("id", canvas_sel_name));
      $(sel).append(test_div);
    },

    resizeCanvas: function(sel, width, height) {
      $("#" + sel).width(width);
      $("#" + sel).attr("width", width);
      $("#" + sel).attr("height", height);
    },

    makeFactory: function(options, width, height) {
      return new VF.Factory({
        renderer: {
          selector: options.canvas_sel,
          backend: options.backend,
          width: width || 450,
          height: height || 140,
        }
      })
    },

    runCanvasTest: function(name, func, params) {
      QUnit.test(name, function(assert) {
        // console.log("Running test (Canvas):", assert.test.module.name, "--", name);
          var test_canvas_sel = "canvas_" + VF.Test.genID();
          var test_canvas = VF.Test.createTestCanvas(test_canvas_sel,
            assert.test.module.name + " (Canvas): " + name);
          func({
            canvas_sel: test_canvas_sel,
            backend: VF.Renderer.Backends.CANVAS,
            params: params,
            assert: assert },
            VF.Renderer.getCanvasContext);
        });
    },

    runRaphaelTest: function(name, func, params) {
      QUnit.test(name, function(assert) {
          // console.log("Running test (Raphael):", assert.test.module.name, "--", name);
          var test_canvas_sel = "canvas_" + VF.Test.genID();
          var test_canvas = VF.Test.createTestSVG(test_canvas_sel,
            assert.test.module.name + " (Raphael): " + name);
          func({
            canvas_sel: test_canvas_sel,
            backend: VF.Renderer.Backends.RAPHAEL,
            params: params,
            assert: assert },
            VF.Renderer.getRaphaelContext);
        });
    },

    runSVGTest: function(name, func, params) {
      if (!VF.Test.RUN_SVG_TESTS) return;
      QUnit.test(name, function(assert) {
          // console.log("Running test (SVG):", assert.test.module.name, "--", name);
          var test_canvas_sel = "canvas_" + VF.Test.genID();
          var test_canvas = VF.Test.createTestSVG(test_canvas_sel,
            assert.test.module.name + " (SVG): " + name);
          func({
            canvas_sel: test_canvas_sel,
            backend: VF.Renderer.Backends.SVG,
            params: params,
            assert: assert },
            VF.Renderer.getSVGContext);
        });
    },

    runNodeTest: function(name, func, params) {
      var fs = require('fs');

      // Allows `name` to be used inside file names.
      function sanitizeName(name) {
        return name.replace(/[^a-zA-Z0-9]/g, "_")
      }

      QUnit.test(name, function(assert) {
        var div = document.createElement("div");
        div.setAttribute("id", "canvas_" + VF.Test.genID());
        document.getElementsByTagName('body')[0].appendChild(div);

        func({
          canvas_sel: div,
          backend: VF.Renderer.Backends.SVG,
          params: params,
          assert: assert },
          VF.Renderer.getSVGContext);

        if (VF.Renderer.lastContext != null) {
          // If an SVG context was used, then serialize and save its contents to
          // a local file.
          var svgData = new XMLSerializer().serializeToString(VF.Renderer.lastContext.svg);

          var moduleName = sanitizeName(QUnit.current_module);
          var testName = sanitizeName(QUnit.current_test);
          var filename = VF.Test.NODE_IMAGEDIR + "/" + moduleName + "." + testName + ".svg";
          try {
            fs.write(filename, svgData, "w");
          } catch(e) {
            console.log("Can't save file: " + filename + ". Error: " + e);
            slimer.exit();
          };
          VF.Renderer.lastContext = null;
        }
      });
    },

    plotNoteWidth: VF.Note.plotMetrics,
    plotLegendForNoteWidth: function(ctx, x, y) {
      ctx.save();
      ctx.setFont("Arial", 8, "");

      var spacing = 12;
      var lastY = y;

      function legend(color, text) {
        ctx.beginPath();
        ctx.setStrokeStyle(color)
        ctx.setFillStyle(color)
        ctx.setLineWidth(10);
        ctx.moveTo(x, lastY - 4);
        ctx.lineTo(x + 10, lastY - 4);
        ctx.stroke();

        ctx.setFillStyle("black");
        ctx.fillText(text, x + 15, lastY);
        lastY += spacing;
      }

      legend("green", "Note + Flag")
      legend("red", "Modifiers")
      legend("#999", "Displaced Head")
      legend("#DDD", "Formatter Shift")

      ctx.restore();
    },

    almostEqual: function(value, expectedValue, errorMargin) {
      return equal(Math.abs(value - expectedValue) < errorMargin, true);
    }
  };

  Test.genID.ID = 0;
  Test.createTestCanvas.sel = "#vexflow_testoutput";

  return Test;
})();

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
    getX: function() {return this.tickContext.getX();},
    getIntrinsicTicks: function() {return this.ticks;},
    getTicks: function() {return this.ticks;},
    setTicks: function(t) {this.ticks = new VF.Fraction(t, 1); return this; },
    getMetrics: function() {
      return { noteWidth: this.width,
               left_shift: 0,
               modLeftPx: 0, modRightPx: 0,
               extraLeftPx: 0, extraRightPx: 0 };
    },
    getWidth: function() {return this.width;},
    setWidth: function(w) {this.width = w; return this; },
    setVoice: function(v) {this.voice = v; return this; },
    setStave: function(stave) {this.stave = stave; return this; },
    setTickContext: function(tc) {this.tickContext = tc; return this; },
    setIgnoreTicks: function(ignore_ticks) {this.ignore_ticks = ignore_ticks; return this; },
    shouldIgnoreTicks: function() {return this.ignore_ticks; },
    preFormat: function() {}
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
      var vf = VF.Test.makeFactory(options, 700, 240);
      var stave = vf.Stave({ x: 10, y: 10, width: 550 });
      var score = vf.EasyScore();

      var accids = Object
        .keys(VF.accidentalCodes.accidentals)
        .filter(function(accid) { return accid !== '{' && accid !== '}'});

      var notes = accids
        .map(function(accid) {
          return vf
            .StaveNote({ keys: ['a/4'], duration: '4', stem_direction: VF.Stem.UP })
            .addAccidental(0, vf.Accidental({ type: accid }));
          });

      var voice = score.voice(notes, { time: accids.length  + '/4' });

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

        vf.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4'], duration: '16' })
          .addAccidental(0, newAccid('++-'))
          .addAccidental(1, newAccid('+-'))
          .addAccidental(2, newAccid('bs'))
          .addAccidental(3, newAccid('bss')),
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

      const voice = vf.Voice()
        .setMode(Vex.Flow.Voice.Mode.SOFT)
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
      QUnit.module("Annotation");
      runTests("Simple Annotation", Annotation.simple);
      runTests("Standard Notation Annotation", Annotation.standard);
      runTests("Harmonics", Annotation.harmonic);
      runTests("Fingerpicking", Annotation.picking);
      runTests("Bottom Annotation", Annotation.bottom);
      runTests("Bottom Annotations with Beams", Annotation.bottomWithBeam);
      runTests("Test Justification Annotation Stem Up", Annotation.justificationStemUp);
      runTests("Test Justification Annotation Stem Down", Annotation.justificationStemDown);
      runTests("TabNote Annotations", Annotation.tabNotes);
    },

    simple: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }
      function newAnnotation(text) { return new VF.Annotation(text); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "h" }).
          addModifier(newAnnotation("T"), 0),
        newNote({
          positions: [{str: 2, fret: 10}], duration: "h" }).
            addModifier(newAnnotation("T"), 0).
            addModifier(newBend("Full"), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, "Simple Annotation");
    },

    standard: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 450).
        addClef("treble").setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAnnotation(text) {
        return (new VF.Annotation(text)).setFont("Times",
            VF.Test.Font.size, "italic"); }

      var notes = [
        newNote({ keys: ["c/4", "e/4"], duration: "h"}).
          addAnnotation(0, newAnnotation("quiet")),
        newNote({ keys: ["c/4", "e/4", "c/5"], duration: "h"}).
          addAnnotation(2, newAnnotation("Allegro"))
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, "Standard Notation Annotation");
    },

    harmonic: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }
      function newAnnotation(text) { return new VF.Annotation(text); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 12}, {str: 3, fret: 12}], duration: "h" }).
          addModifier(newAnnotation("Harm."), 0),
        newNote({
          positions: [{str: 2, fret: 9}], duration: "h" }).
            addModifier(newAnnotation("(8va)").setFont("Times",
                  VF.Test.Font.size, "italic"), 0).
            addModifier(newAnnotation("A.H."), 0)
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, "Simple Annotation");
    },

    picking: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      ctx.setFont("Arial", VF.Test.Font.size, "");
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }
      function newAnnotation(text) { return new VF.Annotation(text).
        setFont("Times", VF.Test.Font.size, "italic"); }

      var notes = [
        newNote({
          positions: [
            {str: 1, fret: 0},
            {str: 2, fret: 1},
            {str: 3, fret: 2},
            {str: 4, fret: 2},
            {str: 5, fret: 0}
            ], duration: "h" }).
          addModifier(new VF.Vibrato().setVibratoWidth(40)),
        newNote({
          positions: [{str: 6, fret: 9}], duration: "8" }).
            addModifier(newAnnotation("p"), 0),
        newNote({
          positions: [{str: 3, fret: 9}], duration: "8" }).
            addModifier(newAnnotation("i"), 0),
        newNote({
          positions: [{str: 2, fret: 9}], duration: "8" }).
            addModifier(newAnnotation("m"), 0),
        newNote({
          positions: [{str: 1, fret: 9}], duration: "8" }).
            addModifier(newAnnotation("a"), 0)
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, "Fingerpicking");
    },

    bottom: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 300).
        addClef("treble").setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAnnotation(text) {
        return (
            new VF.Annotation(text)).
            setFont("Times", VF.Test.Font.size).
            setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
        }

      var notes = [
        newNote({ keys: ["f/4"], duration: "w"}).
          addAnnotation(0, newAnnotation("F")),
        newNote({ keys: ["a/4"], duration: "w"}).
          addAnnotation(0, newAnnotation("A")),
        newNote({ keys: ["c/5"], duration: "w"}).
          addAnnotation(0, newAnnotation("C")),
        newNote({ keys: ["e/5"], duration: "w"}).
          addAnnotation(0, newAnnotation("E"))
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 100);
      ok(true, "Bottom Annotation");
    },

    bottomWithBeam: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 300).
        addClef("treble").setContext(ctx).draw();

      // Create some notes
      var notes = [
        new VF.StaveNote({ keys: ["a/3"], duration: "8" })
          .addModifier(0, new VF.Annotation("good")
          .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)),

        new VF.StaveNote({ keys: ["g/3"], duration: "8" })
          .addModifier(0, new VF.Annotation("even")
          .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)),

        new VF.StaveNote({ keys: ["c/4"], duration: "8" })
          .addModifier(0, new VF.Annotation("under")
          .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)),

        new VF.StaveNote({ keys: ["d/4"], duration: "8" })
          .addModifier(0, new VF.Annotation("beam")
          .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM))
      ];

      var beam = new VF.Beam(notes.slice(1));

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      beam.setContext(ctx).draw();
      ok(true, "Bottom Annotation with Beams");
    },

    justificationStemUp: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 650, 950);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAnnotation(text, hJustifcation, vJustifcation) {
        return (
            new VF.Annotation(text)).
              setFont("Arial", VF.Test.Font.size).
              setJustification(hJustifcation).
              setVerticalJustification(vJustifcation); }

      for (var v = 1; v <= 4; ++v) {
        var stave = new VF.Stave(10, (v-1) * 150 + 40, 400).
          addClef("treble").setContext(ctx).draw();

        var notes = [];

        notes.push(newNote({ keys: ["c/3"], duration: "q"}).addAnnotation(0, newAnnotation("Text", 1, v)));
        notes.push(newNote({ keys: ["c/4"], duration: "q"}).addAnnotation(0, newAnnotation("Text", 2, v)));
        notes.push(newNote({ keys: ["c/5"], duration: "q"}).addAnnotation(0, newAnnotation("Text", 3, v)));
        notes.push(newNote({ keys: ["c/6"], duration: "q"}).addAnnotation(0, newAnnotation("Text", 4, v)));

        VF.Formatter.FormatAndDraw(ctx, stave, notes, 100);
      }

      ok(true, "Test Justification Annotation");
    },

    justificationStemDown: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 650, 1000);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAnnotation(text, hJustifcation, vJustifcation) {
        return (
            new VF.Annotation(text)).
              setFont("Arial", VF.Test.Font.size).
              setJustification(hJustifcation).
              setVerticalJustification(vJustifcation); }

      for (var v = 1; v <= 4; ++v) {
        var stave = new VF.Stave(10, (v-1) * 150 + 40, 400).
          addClef("treble").setContext(ctx).draw();

        var notes = [];

        notes.push(newNote({ keys: ["c/3"], duration: "q", stem_direction: -1}).addAnnotation(0, newAnnotation("Text", 1, v)));
        notes.push(newNote({ keys: ["c/4"], duration: "q", stem_direction: -1}).addAnnotation(0, newAnnotation("Text", 2, v)));
        notes.push(newNote({ keys: ["c/5"], duration: "q", stem_direction: -1}).addAnnotation(0, newAnnotation("Text", 3, v)));
        notes.push(newNote({ keys: ["c/6"], duration: "q", stem_direction: -1}).addAnnotation(0, newAnnotation("Text", 4, v)));

        VF.Formatter.FormatAndDraw(ctx, stave, notes, 100);
      }

      ok(true, "Test Justification Annotation");
    },

    tabNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "8"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}], duration: "8"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var notes2 = specs.map(function(noteSpec){
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      var notes3 = specs.map(function(noteSpec){
        var tabNote = new VF.TabNote(noteSpec);
        return tabNote;
      });

      notes[0].addModifier(new VF.Annotation("Text").setJustification(1).setVerticalJustification(1), 0); // U
      notes[1].addModifier(new VF.Annotation("Text").setJustification(2).setVerticalJustification(2), 0); // D
      notes[2].addModifier(new VF.Annotation("Text").setJustification(3).setVerticalJustification(3), 0); // U
      notes[3].addModifier(new VF.Annotation("Text").setJustification(4).setVerticalJustification(4), 0); // D

      notes2[0].addModifier(new VF.Annotation("Text").setJustification(3).setVerticalJustification(1), 0); // U
      notes2[1].addModifier(new VF.Annotation("Text").setJustification(3).setVerticalJustification(2), 0); // D
      notes2[2].addModifier(new VF.Annotation("Text").setJustification(3).setVerticalJustification(3), 0); // U
      notes2[3].addModifier(new VF.Annotation("Text").setJustification(3).setVerticalJustification(4), 0); // D

      notes3[0].addModifier(new VF.Annotation("Text").setVerticalJustification(1), 0); // U
      notes3[1].addModifier(new VF.Annotation("Text").setVerticalJustification(2), 0); // D
      notes3[2].addModifier(new VF.Annotation("Text").setVerticalJustification(3), 0); // U
      notes3[3].addModifier(new VF.Annotation("Text").setVerticalJustification(4), 0); // D

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);
      voice.addTickables(notes2);
      voice.addTickables(notes3);


      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);


      voice.draw(ctx, stave);

      ok (true, 'TabNotes successfully drawn');
    }
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
      QUnit.module("Articulation");
      Articulation.runTests("Articulation - Staccato/Staccatissimo", "a.","av", Articulation.drawArticulations);
      Articulation.runTests("Articulation - Accent/Tenuto", "a>","a-", Articulation.drawArticulations);
      Articulation.runTests("Articulation - Marcato/L.H. Pizzicato", "a^","a+", Articulation.drawArticulations);
      Articulation.runTests("Articulation - Snap Pizzicato/Fermata", "ao","ao", Articulation.drawArticulations);
      Articulation.runTests("Articulation - Up-stroke/Down-Stroke", "a|","am", Articulation.drawArticulations);
      Articulation.runTests("Articulation - Fermata Above/Below", "a@a","a@u", Articulation.drawFermata);
      Articulation.runTests("Articulation - Inline/Multiple", "a.","a.", Articulation.drawArticulations2);
      Articulation.runTests("TabNote Articulation", "a.","a.", Articulation.tabNotes);
    },

    runTests: function(name, sym1, sym2, func) {
      var params = {
        sym1: sym1,
        sym2: sym2
      };

      VF.Test.runTests(name, func, params);
    },

    drawArticulations: function(options, contextBuilder) {
      var sym1 = options.params.sym1;
      var sym2 = options.params.sym2;

      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 625, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 125);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/3"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 })
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
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 })
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
        new VF.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 })
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
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 })
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
      var ctx = contextBuilder(options.canvas_sel, 400, 200);

      // bar 1
      var staveBar1 = new VF.Stave(50, 30, 150);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: -1 })
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
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 })
      ];
      notesBar2[0].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[1].addArticulation(0, new VF.Articulation(sym1).setPosition(3));
      notesBar2[2].addArticulation(0, new VF.Articulation(sym2).setPosition(4));
      notesBar2[3].addArticulation(0, new VF.Articulation(sym2).setPosition(4));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
    },

    drawArticulations2: function(options, contextBuilder) {
      var sym1 = options.params.sym1;
      var sym2 = options.params.sym2;

      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 725, 200);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 250);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["d/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["e/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["g/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["c/5"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["d/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["e/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["g/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["c/6"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/6"], duration: "16", stem_direction: -1 })
      ];
      for(var i=0; i<16; i++){
        notesBar1[i].addArticulation(0, new VF.Articulation("a.").setPosition(4));
        notesBar1[i].addArticulation(0, new VF.Articulation("a>").setPosition(4));

        if(i === 15)
          notesBar1[i].addArticulation(0, new VF.Articulation("a@u").setPosition(4));
      }

      var beam1 = new VF.Beam(notesBar1.slice(0,8));
      var beam2 = new VF.Beam(notesBar1.slice(8,16));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 250);
      staveBar2.setContext(ctx).draw();
      var notesBar2 = [
        new VF.StaveNote({ keys: ["f/3"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["g/3"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/3"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/3"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["c/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["d/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["e/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "16", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["g/4"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["c/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["e/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/5"], duration: "16", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["g/5"], duration: "16", stem_direction: -1 })
      ];
      for(i=0; i<16; i++){
        notesBar2[i].addArticulation(0, new VF.Articulation("a-").setPosition(3));
        notesBar2[i].addArticulation(0, new VF.Articulation("a^").setPosition(3));

        if(i === 15)
          notesBar2[i].addArticulation(0, new VF.Articulation("a@u").setPosition(4));
      }

      var beam3 = new VF.Beam(notesBar2.slice(0,8));
      var beam4 = new VF.Beam(notesBar2.slice(8,16));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
      beam3.setContext(ctx).draw();
      beam4.setContext(ctx).draw();

      // bar 3 - juxtaposing second bar next to first bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x, staveBar2.y, 75);
      staveBar3.setContext(ctx).draw();

      var notesBar3 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "w", stem_direction: 1 })
      ];
      notesBar3[0].addArticulation(0, new VF.Articulation("a-").setPosition(3));
      notesBar3[0].addArticulation(0, new VF.Articulation("a>").setPosition(3));
      notesBar3[0].addArticulation(0, new VF.Articulation("a@a").setPosition(3));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);
      // bar 4 - juxtaposing second bar next to first bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x, staveBar3.y, 125);
      staveBar4.setEndBarType(VF.Barline.type.END);
      staveBar4.setContext(ctx).draw();

      var notesBar4 = [
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 })
      ];
      for(i=0; i<4; i++){
        var position1 = 3;
        var position2 = 4;
        if(i > 1){
          position1 = 4;
          position2 = 3;
        }
        notesBar4[i].addArticulation(0, new VF.Articulation("a-").setPosition(position1));
      }

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
    },

    tabNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "8"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}], duration: "8"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var notes2 = specs.map(function(noteSpec){
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      var notes3 = specs.map(function(noteSpec){
        var tabNote = new VF.TabNote(noteSpec);
        return tabNote;
      });

      notes[0].addModifier(new VF.Articulation("a>").setPosition(3), 0); // U
      notes[1].addModifier(new VF.Articulation("a>").setPosition(4), 0); // D
      notes[2].addModifier(new VF.Articulation("a.").setPosition(3), 0); // U
      notes[3].addModifier(new VF.Articulation("a.").setPosition(4), 0); // D

      notes2[0].addModifier(new VF.Articulation("a>").setPosition(3), 0);
      notes2[1].addModifier(new VF.Articulation("a>").setPosition(4), 0);
      notes2[2].addModifier(new VF.Articulation("a.").setPosition(3), 0);
      notes2[3].addModifier(new VF.Articulation("a.").setPosition(4), 0);

      notes3[0].addModifier(new VF.Articulation("a>").setPosition(3), 0);
      notes3[1].addModifier(new VF.Articulation("a>").setPosition(4), 0);
      notes3[2].addModifier(new VF.Articulation("a.").setPosition(3), 0);
      notes3[3].addModifier(new VF.Articulation("a.").setPosition(4), 0);

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);
      voice.addTickables(notes2);
      voice.addTickables(notes3);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      voice.draw(ctx, stave);

      ok (true, 'TabNotes successfully drawn');
    }
  };

  return Articulation;
})();

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
      var score = vf.EasyScore({throwOnError: true});

      var voice = score.voice.bind(score);
      var notes = score.notes.bind(score);
      var beam = score.beam.bind(score);

      var x = 120, y = 80;
      function makeSystem(width) {
        var system = vf.System({x: x, y: y, width: width, spaceBetweenStaves: 10});
        x += width;
        return system;
      }

      function id(id) { return registry.getElementById(id); }

      score.set({time: '3/4'});

      /*  Measure 1 */
      var system = makeSystem(220);
      system.addStave({
        voices: [
          voice([
            notes('D5/q[id="m1a"]'),
            beam(notes('G4/8, A4, B4, C5', {stem: "up"}))
          ].reduce(concat)),
          voice([vf.TextDynamics({text: 'p', duration: 'h', dots: 1, line: 9 })]),
        ]
      })
        .addClef('treble')
        .addKeySignature('G')
        .addTimeSignature('3/4')
        .setTempo({ name: "Allegretto", duration: "h", dots: 1, bpm: 66}, -30);

      system.addStave({ voices: [voice(notes('(G3 B3 D4)/h, A3/q', {clef: 'bass'}))] })
        .addClef('bass').addKeySignature('G').addTimeSignature('3/4');
      system.addConnector('brace');
      system.addConnector('singleRight');
      system.addConnector('singleLeft');

      id('m1a').addModifier(0, vf.Fingering({number: '5'}));

      /*  Measure 2 */
      system = makeSystem(150);
      system.addStave({ voices: [voice(notes('D5/q[id="m2a"], G4[id="m2b"], G4[id="m2c"]'))] });
      system.addStave({ voices: [voice(notes('B3/h.', {clef: 'bass'}))] });
      system.addConnector('singleRight');

      id('m2a').addModifier(0, vf.Articulation({type: 'a.', position: "above"}));
      id('m2b').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));
      id('m2c').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));

      vf.Curve({
        from: id('m1a'),
        to: id('m2a'),
        options: { cps: [{x: 0, y: 40}, {x: 0, y: 40}]}
      });

      /*  Measure 3 */
      system = makeSystem(150);
      system.addStave({
        voices: [
          voice([
            notes('E5/q[id="m3a"]'),
            beam(notes('C5/8, D5, E5, F5', {stem: "down"}))
          ].reduce(concat))
        ]
      });
      id('m3a').addModifier(0, vf.Fingering({number: '3', position: 'above'}));

      system.addStave({ voices: [ voice(notes('C4/h.', {clef: 'bass'})) ] });
      system.addConnector('singleRight');

      /*  Measure 4 */
      system = makeSystem(150);
      system.addStave({ voices: [ voice(notes('G5/q[id="m4a"], G4[id="m4b"], G4[id="m4c"]')) ] });

      system.addStave({ voices: [ voice(notes('B3/h.', {clef: 'bass'})) ] });
      system.addConnector('singleRight');

      id('m4a').addModifier(0, vf.Articulation({type: 'a.', position: "above"}));
      id('m4b').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));
      id('m4c').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));

      vf.Curve({
        from: id('m3a'),
        to: id('m4a'),
        options: { cps: [{x: 0, y: 20}, {x: 0, y: 20}]}
      });

      /*  Measure 5 */
      system = makeSystem(150);
      system.addStave({
        voices: [
          voice([
            notes('C5/q[id="m5a"]'),
            beam(notes('D5/8, C5, B4, A4', {stem: "down"}))
          ].reduce(concat))
        ]
      });
      id('m5a').addModifier(0, vf.Fingering({number: '4', position: 'above'}));

      system.addStave({ voices: [ voice(notes('A3/h.', {clef: 'bass'})) ] });
      system.addConnector('singleRight');

      /*  Measure 6 */
      system = makeSystem(150);
      system.addStave({
        voices: [
          voice([
            notes('B5/q'),
            beam(notes('C5/8, B4, A4, G4[id="m6a"]', {stem: "up"}))
          ].reduce(concat))
        ]
      });

      system.addStave({ voices: [ voice(notes('G3/h.', {clef: 'bass'})) ] });
      system.addConnector('singleRight');

      vf.Curve({
        from: id('m5a'),
        to: id('m6a'),
        options: {
          cps: [{x: 0, y: 20}, {x: 0, y: 20}],
          invert: true,
          position_end: 'nearTop',
          y_shift: 20,
        }
      });

      /*  Measure 7 (New system) */
      x = 20;
      y += 230;

      var system = makeSystem(220);
      system.addStave({
        voices: [
          voice([
            notes('F4/q[id="m7a"]'),
            beam(notes('G4/8[id="m7b"], A4, B4, G4', {stem: "up"}))
          ].reduce(concat))
        ]
      }).addClef('treble').addKeySignature('G');

      system.addStave({ voices: [voice(notes('D4/q, B3[id="m7c"], G3', {clef: 'bass'}))] })
        .addClef('bass').addKeySignature('G');
      system.addConnector('brace');
      system.addConnector('singleRight');
      system.addConnector('singleLeft');

      id('m7a').addModifier(0, vf.Fingering({number: '2', position: 'below'}));
      id('m7b').addModifier(0, vf.Fingering({number: '1'}));
      id('m7c').addModifier(0, vf.Fingering({number: '3', position: 'above'}));

      /*  Measure 8 */
      system = makeSystem(180);
      var grace = vf.GraceNote({keys: ['d/3'], clef: 'bass', duration: '8', slash: true });

      system.addStave({ voices: [voice(notes('A4/h.[id="m8c"]'))] });
      system.addStave({ voices: [
         score.set({clef: 'bass'}).voice([
            notes('D4/q[id="m8a"]'),
            beam(notes('D3/8, C4, B3[id="m8b"], A3', {stem: "down"}))
          ].reduce(concat))
      ]});
      system.addConnector('singleRight');

      id('m8b').addModifier(0, vf.Fingering({number: '1', position: 'above'}));
      id('m8c').addModifier(0, vf.GraceNoteGroup({notes: [grace]}));

      vf.Curve({
        from: id('m7a'),
        to: id('m8c'),
        options: {
          cps: [{x: 0, y: 20}, {x: 0, y: 20}],
          invert: true,
          position: 'nearTop',
          position_end: 'nearTop',
        }
      });

      vf.StaveTie({from: grace, to: id('m8c')});

      /*  Measure 9 */
      var system = makeSystem(180);
      system.addStave({
        voices: [
          score.set({clef: 'treble'}).voice([
            notes('D5/q[id="m9a"]'),
            beam(notes('G4/8, A4, B4, C5', {stem: "up"}))
          ].reduce(concat))
        ]
      });

      system.addStave({ voices: [voice(notes('B3/h, A3/q', {clef: 'bass'}))] });
      system.addConnector('singleRight');

      id('m9a').addModifier(0, vf.Fingering({number: '5'}));

      /*  Measure 10 */
      system = makeSystem(170);
      system.addStave({ voices: [voice(notes('D5/q[id="m10a"], G4[id="m10b"], G4[id="m10c"]'))] });
      system.addStave({ voices: [voice(notes('G3/q[id="m10d"], B3, G3', {clef: 'bass'}))] });
      system.addConnector('singleRight');

      id('m10a').addModifier(0, vf.Articulation({type: 'a.', position: "above"}));
      id('m10b').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));
      id('m10c').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));
      id('m10d').addModifier(0, vf.Fingering({number: '4'}));

      vf.Curve({
        from: id('m9a'),
        to: id('m10a'),
        options: { cps: [{x: 0, y: 40}, {x: 0, y: 40}]}
      });

       /*  Measure 11 */
      system = makeSystem(150);
      system.addStave({
        voices: [
          voice([
            notes('E5/q[id="m11a"]'),
            beam(notes('C5/8, D5, E5, F5', {stem: "down"}))
          ].reduce(concat))
        ]
      });
      id('m11a').addModifier(0, vf.Fingering({number: '3', position: 'above'}));

      system.addStave({ voices: [ voice(notes('C4/h.', {clef: 'bass'})) ] });
      system.addConnector('singleRight');

      /*  Measure 12 */
      system = makeSystem(170);
      system.addStave({ voices: [ voice(notes('G5/q[id="m12a"], G4[id="m12b"], G4[id="m12c"]')) ] });

      system.addStave({
        voices: [
          score.set({clef: 'bass'}).voice([
            notes('B3/q[id="m12d"]'),
            beam(notes('C4/8, B3, A3, G3[id="m12e"]', {stem: "down"}))
          ].reduce(concat))
        ]
      });
      system.addConnector('singleRight');

      id('m12a').addModifier(0, vf.Articulation({type: 'a.', position: "above"}));
      id('m12b').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));
      id('m12c').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));

      id('m12d').addModifier(0, vf.Fingering({number: '2', position: 'above'}));
      id('m12e').addModifier(0, vf.Fingering({number: '4', position: 'above'}));

      vf.Curve({
        from: id('m11a'),
        to: id('m12a'),
        options: { cps: [{x: 0, y: 20}, {x: 0, y: 20}]}
      });

      /*  Measure 13 (New system) */
      x = 20;
      y += 230;

      var system = makeSystem(220);
      system.addStave({
        voices: [
          score.set({clef: 'treble'}).voice([
            notes('c5/q[id="m13a"]'),
            beam(notes('d5/8, c5, b4, a4', {stem: "down"}))
          ].reduce(concat))
        ]
      }).addClef('treble').addKeySignature('G');

      system.addStave({ voices: [voice(notes('a3/h[id="m13b"], f3/q[id="m13c"]', {clef: 'bass'}))] })
        .addClef('bass').addKeySignature('G');

      system.addConnector('brace');
      system.addConnector('singleRight');
      system.addConnector('singleLeft');

      id('m13a').addModifier(0, vf.Fingering({number: '4', position: 'above'}));
      id('m13b').addModifier(0, vf.Fingering({number: '1'}));
      id('m13c').addModifier(0, vf.Fingering({number: '3', position: 'above'}));

      /*  Measure 14 */
      var system = makeSystem(180);
      system.addStave({
        voices: [
          score.set({clef: 'treble'}).voice([
            notes('B4/q'),
            beam(notes('C5/8, b4, a4, g4', {stem: "up"}))
          ].reduce(concat))
        ]
      });

      system.addStave({ voices: [voice(notes('g3/h[id="m14a"], b3/q[id="m14b"]', {clef: 'bass'}))] });
      system.addConnector('singleRight');

      id('m14a').addModifier(0, vf.Fingering({number: '2'}));
      id('m14b').addModifier(0, vf.Fingering({number: '1'}));

       /*  Measure 15 */
      var system = makeSystem(180);
      system.addStave({
        voices: [
          score.set({clef: 'treble'}).voice([
            notes('a4/q'),
            beam(notes('b4/8, a4, g4, f4[id="m15a"]', {stem: "up"}))
          ].reduce(concat))
        ]
      });

      system.addStave({ voices: [voice(notes('c4/q[id="m15b"], d4, d3', {clef: 'bass'}))] });
      system.addConnector('singleRight');

      id('m15a').addModifier(0, vf.Fingering({number: '2'}));
      id('m15b').addModifier(0, vf.Fingering({number: '2'}));

       /*  Measure 16 */
      var system = makeSystem(130);
      system.addStave({
        voices: [
          score.set({clef: 'treble'}).voice([
            notes('g4/h.[id="m16a"]'),
          ].reduce(concat))
        ]
      }).setEndBarType(VF.Barline.type.REPEAT_END);

      system.addStave({ voices: [voice(notes('g3/h[id="m16b"], g2/q', {clef: 'bass'}))] })
        .setEndBarType(VF.Barline.type.REPEAT_END);
      system.addConnector('boldDoubleRight');

      id('m16a').addModifier(0, vf.Fingering({number: '1'}));
      id('m16b').addModifier(0, vf.Fingering({number: '1'}));

      vf.Curve({
        from: id('m13a'),
        to: id('m16a'),
        options: {
          cps: [{x: 0, y: 50}, {x: 0, y: 20}],
          invert: true,
          position_end: 'nearTop',
        }
      });

      /* Measure 17 */
      var system = makeSystem(180);
      system.addStave({
        voices: [
          score.set({clef: 'treble'}).voice([
            notes('b5/q[id="m17a"]'),
            beam(notes('g5/8, a5, b5, g5', {stem: "down"}))
          ].reduce(concat)),
          voice([vf.TextDynamics({text: 'mf', duration: 'h', dots: 1, line: 10 })]),
        ]
      }).setBegBarType(VF.Barline.type.REPEAT_BEGIN);

      system.addStave({ voices: [voice(notes('g3/h.', {clef: 'bass'}))] })
        .setBegBarType(VF.Barline.type.REPEAT_BEGIN);

      system.addConnector('boldDoubleLeft');
      system.addConnector('singleRight');

      id('m17a').addModifier(0, vf.Fingering({number: '5', position: 'above'}));

      /* Measure 18 */
      var system = makeSystem(180);
      system.addStave({
        voices: [
          score.set({clef: 'treble'}).voice([
            notes('a5/q[id="m18a"]'),
            beam(notes('d5/8, e5, f5, d5[id="m18b"]', {stem: "down"}))
          ].reduce(concat))
        ]
      });

      system.addStave({ voices: [voice(notes('f3/h.', {clef: 'bass'}))] });
      system.addConnector('singleRight');

      id('m18a').addModifier(0, vf.Fingering({number: '4', position: 'above'}));

      vf.Curve({
        from: id('m17a'),
        to: id('m18b'),
        options: {
          cps: [{x: 0, y: 20}, {x: 0, y: 30}],
        }
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
  var Barline = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module("Barline");
      runTests("Simple BarNotes", Barline.barnotes);
    },

    barnotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"}),
        new VF.BarNote(VF.Barline.SINGLE),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 250);

      var stave = new VF.Stave(10, 10, 350).setContext(ctx).draw();
      voice.draw(ctx, stave);

      ok(true, "Simple Test");
    }
  };

  return Barline;
})();
/**
 * VexFlow - Beam Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Beam = (function() {
  var runTests = VF.Test.runTests;

  var Beam = {
    Start: function() {
      QUnit.module("Beam");
      runTests("Simple Beam", Beam.simple);
      runTests("Multi Beam", Beam.multi);
      runTests("Sixteenth Beam", Beam.sixteenth);
      runTests("Slopey Beam", Beam.slopey);
      runTests("Auto-stemmed Beam", Beam.autoStem);
      runTests("Mixed Beam 1", Beam.mixed);
      runTests("Mixed Beam 2", Beam.mixed2);
      runTests("Dotted Beam", Beam.dotted);
      runTests("Close Trade-offs Beam", Beam.tradeoffs);
      runTests("Insane Beam", Beam.insane);
      runTests("Lengthy Beam", Beam.lenghty);
      runTests("Outlier Beam", Beam.outlier);
      runTests("Break Secondary Beams", Beam.breakSecondaryBeams);
      runTests("TabNote Beams Up", Beam.tabBeamsUp);
      runTests("TabNote Beams Down", Beam.tabBeamsDown);
      runTests("TabNote Auto Create Beams", Beam.autoTabBeams);
      runTests("TabNote Beams Auto Stem", Beam.tabBeamsAutoStem);
      runTests("Complex Beams with Annotations", Beam.complexWithAnnotation);
      runTests("Complex Beams with Articulations", Beam.complexWithArticulation);
    },

    beamNotes: function(notes, stave, ctx) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam = new VF.Beam(notes.slice(1, notes.length));

      voice.draw(ctx, stave);
      beam.setContext(ctx).draw();
    },

    setupContext: function(options, x, y) {
      var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 10, x || 450).addTrebleGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      Beam.beamNotes([
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "8"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "f/4", "a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/4", "g/4", "b/4"], stem_direction: 1, duration: "8"}).
          addAccidental(0, newAcc("bb")).
          addAccidental(1, newAcc("##")),
        newNote({ keys: ["f/4", "a/4", "c/5"], stem_direction: 1, duration: "8"})
      ], c.stave, c.context);
      ok(true, "Simple Test");
    },

    multi: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      beam2_1.setContext(c.context).draw();
      beam2_2.setContext(c.context).draw();
      ok(true, "Multi Test");
    },

    sixteenth: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "h"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "h"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      beam2_1.setContext(c.context).draw();
      beam2_2.setContext(c.context).draw();
      ok(true, "Sixteenth Test");
    },

    breakSecondaryBeams: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options, 600);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16", dots: 1 }),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16", dots: 1 }),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16", dots: 1 }),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "32"}),

        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"})
      ];
      notes.forEach(function(note) {
        if ('dots' in note && note.dots >= 1) {
          note.addDotToAll();
        }
      });

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice, voice2], 500);
      var beam1_1 = new VF.Beam(notes.slice(0, 6));
      var beam1_2 = new VF.Beam(notes.slice(6, 12));

      beam1_1.breakSecondaryAt([1, 3]);
      beam1_2.breakSecondaryAt([2]);

      var beam2_1 = new VF.Beam(notes2.slice(0, 12));
      var beam2_2 = new VF.Beam(notes2.slice(12, 18));

      beam2_1.breakSecondaryAt([3, 7, 11]);
      beam2_2.breakSecondaryAt([3]);

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      beam2_1.setContext(c.context).draw();
      beam2_2.setContext(c.context).draw();
      ok(true, "Breaking Secondary Beams Test");
    },

    slopey: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/3"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      ok(true, "Slopey Test");
    },

    autoStem: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["a/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["c/5"], duration: "8"}),
        newNote({ keys: ["f/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"}),
        newNote({ keys: ["e/4"], duration: "8"}),
        newNote({ keys: ["e/5"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["b/4"], duration: "8"}),
        newNote({ keys: ["g/4"], duration: "8"}),
        newNote({ keys: ["d/5"], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);

      var beam1 = new VF.Beam(notes.slice(0, 2), true);
      var beam2 = new VF.Beam(notes.slice(2, 4), true);
      var beam3 = new VF.Beam(notes.slice(4, 6), true);
      var beam4 = new VF.Beam(notes.slice(6, 8), true);
      var beam5 = new VF.Beam(notes.slice(8, 10), true);
      var beam6 = new VF.Beam(notes.slice(10, 12), true);

      var UP = VF.Stem.UP;
      var DOWN = VF.Stem.DOWN;

      equal(beam1.stem_direction, UP);
      equal(beam2.stem_direction, UP);
      equal(beam3.stem_direction, UP);
      equal(beam4.stem_direction, UP);
      equal(beam5.stem_direction, DOWN);
      equal(beam6.stem_direction, DOWN);

      voice.draw(ctx, stave);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      beam3.setContext(ctx).draw();
      beam4.setContext(ctx).draw();
      beam5.setContext(ctx).draw();
      beam6.setContext(ctx).draw();

      ok(true, "AutoStem Beam Test");
    },

    mixed: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),

        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),

        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),

        newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 390);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      beam2_1.setContext(c.context).draw();
      beam2_2.setContext(c.context).draw();
      ok(true, "Multi Test");
    },

    mixed2: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "64"}),

        newNote({ keys: ["d/5"], stem_direction: 1, duration: "128"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "32"}),

        newNote({ keys: ["c/5"], stem_direction: 1, duration: "64"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "32"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "128"})
      ];

      var notes2 = [
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "64"}),

        newNote({ keys: ["d/4"], stem_direction: -1, duration: "128"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "32"}),

        newNote({ keys: ["c/4"], stem_direction: -1, duration: "64"}),
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "32"}),
        newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "128"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 390);
      var beam1_1 = new VF.Beam(notes.slice(0, 12));

      var beam2_1 = new VF.Beam(notes2.slice(0, 12));

      voice.draw(c.context, c.stave);
      voice2.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam2_1.setContext(c.context).draw();

      ok(true, "Multi Test");
    },

    dotted: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/3"], stem_direction: 1, duration: "8d"}).
            addDotToAll(),
        newNote({ keys: ["a/3"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["a/3"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["b/3"], stem_direction: 1, duration: "8d"}).
            addDotToAll(),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/3"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["a/3"], stem_direction: 1, duration: "8d"}).
            addDotToAll(),
        newNote({ keys: ["a/3"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["b/3"], stem_direction: 1, duration: "8d"}).
            addDotToAll(),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "16"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 390);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));
      var beam1_3 = new VF.Beam(notes.slice(8, 12));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();
      beam1_3.setContext(c.context).draw();

      ok(true, "Dotted Test");
    },

    tradeoffs: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
      newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      ok(true, "Close Trade-offs Test");
    },

    insane: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 7));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      ok(true, "Insane Test");
    },

    lenghty: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
      newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
      newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();

      ok(true, "Lengthy Test");
    },

    outlier: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = Beam.setupContext(options);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().
                        joinVoices([voice]).
                        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4));
      var beam1_2 = new VF.Beam(notes.slice(4, 8));

      voice.draw(c.context, c.stave);
      beam1_1.setContext(c.context).draw();
      beam1_2.setContext(c.context).draw();

      ok(true, "Outlier Test");
    },

    tabBeamsUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"},
        { positions: [{str: 3, fret: 6 }], duration: "8"},
        { positions: [{str: 3, fret: 6 }], duration: "8"},
        { positions: [{str: 3, fret: 6 }], duration: "8"},
        { positions: [{str: 3, fret: 6 }], duration: "8"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      var beam1 = new VF.Beam(notes.slice(1, 7));
      var beam2 = new VF.Beam(notes.slice(8, 11));

      var tuplet = new VF.Tuplet(notes.slice(8, 11));
      tuplet.setRatioed(true);

      voice.draw(ctx, stave);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      tuplet.setContext(ctx).draw();

      ok (true, 'All objects have been drawn');
    },

    tabBeamsDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 300);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550, {
        num_lines: 10
      });
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8dd"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"},
        { positions: [{str: 1, fret: 6 }], duration: "8"},
        { positions: [{str: 1, fret: 6 }], duration: "8"},
        { positions: [{str: 1, fret: 6 }], duration: "8"},
        { positions: [{str: 7, fret: 6 }], duration: "8"},
        { positions: [{str: 7, fret: 6 }], duration: "8"},
        { positions: [{str: 10, fret: 6 }], duration: "8"},
        { positions: [{str: 10, fret: 6 }], duration: "8"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      notes[1].addDot();
      notes[1].addDot();

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      var beam1 = new VF.Beam(notes.slice(1, 7));
      var beam2 = new VF.Beam(notes.slice(8, 11));

      var tuplet = new VF.Tuplet(notes.slice(8, 11));
      var tuplet2 = new VF.Tuplet(notes.slice(11, 14));
      tuplet.setTupletLocation(-1);
      tuplet2.setTupletLocation(-1);

      voice.draw(ctx, stave);
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      tuplet.setContext(ctx).draw();
      tuplet2.setContext(ctx).draw();

      ok (true, 'All objects have been drawn');

    },


    autoTabBeams: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 300);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550, {
        num_lines: 6
      });
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }], duration: "32"},
        { positions: [{str: 1, fret: 6 }], duration: "32"},
        { positions: [{str: 1, fret: 6 }], duration: "32"},
        { positions: [{str: 6, fret: 6 }], duration: "32"},
        { positions: [{str: 6, fret: 6 }], duration: "16"},
        { positions: [{str: 6, fret: 6 }], duration: "16"},
        { positions: [{str: 6, fret: 6 }], duration: "16"},
        { positions: [{str: 6, fret: 6 }], duration: "16"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      var beams = VF.Beam.applyAndGetBeams(voice, -1);

      voice.draw(ctx, stave);
      beams.forEach(function(beam) {
          beam.setContext(ctx).draw();
      });

      ok (true, 'All objects have been drawn');

    },

    // This tests makes sure the auto_stem functionality is works.
    // TabNote stems within a beam group should end up normalized
    tabBeamsAutoStem: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 300);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550, {
        num_lines: 6
      });
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8", stem_direction: -1},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8", stem_direction: 1},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16", stem_direction: -1},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16", stem_direction: 1},
        { positions: [{str: 1, fret: 6 }], duration: "32", stem_direction: 1},
        { positions: [{str: 1, fret: 6 }], duration: "32", stem_direction: -1},
        { positions: [{str: 1, fret: 6 }], duration: "32", stem_direction: -1},
        { positions: [{str: 6, fret: 6 }], duration: "32", stem_direction: -1},
        { positions: [{str: 6, fret: 6 }], duration: "16", stem_direction: 1},
        { positions: [{str: 6, fret: 6 }], duration: "16", stem_direction: 1},
        { positions: [{str: 6, fret: 6 }], duration: "16", stem_direction: 1},
        { positions: [{str: 6, fret: 6 }], duration: "16", stem_direction: -1}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_dots = true;
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      var beams = [
        new VF.Beam(notes.slice(0, 8), true), // Stems should format down
        new VF.Beam(notes.slice(8, 12), true)  // Stems should format up
      ];

      voice.draw(ctx, stave);
      beams.forEach(function(beam) {
          beam.setContext(ctx).draw();
      });

      ok (true, 'All objects have been drawn');

    },

    complexWithAnnotation: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 200);
      ctx.scale(1.0, 1.0); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var stave = new VF.Stave(10, 40, 400).
        addClef("treble").setContext(ctx).draw();

      var notes = [
        { keys: ["e/4"], duration: "128" , stem_direction: 1},
        { keys: ["d/4"], duration: "16"  , stem_direction: 1},
        { keys: ["e/4"], duration: "8"   , stem_direction: 1},
        { keys: ["c/4", "g/4"], duration: "32"  , stem_direction: 1},
        { keys: ["c/4"], duration: "32"  , stem_direction: 1 },
        { keys: ["c/4"], duration: "32"  , stem_direction: 1},
        { keys: ["c/4"], duration: "32"  , stem_direction: 1}
      ];

      var notes2 = [
        { keys: ["e/5"], duration: "128" , stem_direction: -1},
        { keys: ["d/5"], duration: "16"  , stem_direction: -1},
        { keys: ["e/5"], duration: "8"   , stem_direction: -1},
        { keys: ["c/5", "g/5"], duration: "32"  , stem_direction: -1},
        { keys: ["c/5"], duration: "32"  , stem_direction: -1 },
        { keys: ["c/5"], duration: "32"  , stem_direction: -1},
        { keys: ["c/5"], duration: "32"  , stem_direction: -1}
      ];

      notes = notes.map(function(note, index) {
          return newNote(note).addModifier(0, new VF.Annotation("1").setVerticalJustification(1));
      });

      notes2 = notes2.map(function(note, index) {
          return newNote(note).addModifier(0, new VF.Annotation("3").setVerticalJustification(3));
      });

      var beam = new VF.Beam(notes);
      var beam2 = new VF.Beam(notes2);

      var voice = new VF.Voice(VF.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      voice.addTickables(notes2);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave, {stave: stave});
      voice.draw(ctx);
      beam.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      ok(true, "Complex beam annotations");
    },

    complexWithArticulation: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 600, 200);
      ctx.scale(1.0, 1.0); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var stave = new VF.Stave(10, 40, 500).
        addClef("treble").setContext(ctx).draw();

      var notes = [
        { keys: ["e/4"], duration: "128" , stem_direction: 1},
        { keys: ["d/4"], duration: "16"  , stem_direction: 1},
        { keys: ["e/4"], duration: "8"   , stem_direction: 1},
        { keys: ["c/4", "g/4"], duration: "32"  , stem_direction: 1},
        { keys: ["c/4"], duration: "32"  , stem_direction: 1 },
        { keys: ["c/4"], duration: "32"  , stem_direction: 1},
        { keys: ["c/4"], duration: "32"  , stem_direction: 1}
      ];

      var notes2 = [
        { keys: ["e/5"], duration: "128" , stem_direction: -1},
        { keys: ["d/5"], duration: "16"  , stem_direction: -1},
        { keys: ["e/5"], duration: "8"   , stem_direction: -1},
        { keys: ["c/5", "g/5"], duration: "32"  , stem_direction: -1},
        { keys: ["c/5"], duration: "32"  , stem_direction: -1 },
        { keys: ["c/5"], duration: "32"  , stem_direction: -1},
        { keys: ["c/5"], duration: "32"  , stem_direction: -1}
      ];

      notes = notes.map(function(note, index) {
          return newNote(note).addModifier(0, new VF.Articulation("am").setPosition(3));
      });

      notes2 = notes2.map(function(note, index) {
          return newNote(note).addModifier(0, new VF.Articulation("a>").setPosition(4));
      });

      var beam = new VF.Beam(notes);
      var beam2 = new VF.Beam(notes2);

      var voice = new VF.Voice(VF.TIME4_4).
        setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      voice.addTickables(notes2);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave, {stave: stave});
      voice.draw(ctx);
      beam.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      ok(true, "Complex beam articulations");
    }
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
      QUnit.module("Bend");
      VF.Test.runTests("Double Bends", VF.Test.Bend.doubleBends);
      VF.Test.runTests("Reverse Bends", VF.Test.Bend.reverseBends);
      VF.Test.runTests("Bend Phrase", VF.Test.Bend.bendPhrase);
      VF.Test.runTests("Double Bends With Release",
          VF.Test.Bend.doubleBendsWithRelease);
      VF.Test.runTests("Whako Bend", VF.Test.Bend.whackoBends);
    },

    doubleBends: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.setRawFont(" 10pt Arial");
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "q" }).
          addModifier(newBend("Full"), 0).
          addModifier(newBend("1/2"), 1),

        newNote({
          positions: [{str: 2, fret: 5}, {str: 3, fret: 5}], duration: "q" }).
          addModifier(newBend("1/4"), 0).
          addModifier(newBend("1/4"), 1),

        newNote({
          positions: [{str: 4, fret: 7}], duration: "h" })
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      notes.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 140);
      });

      ok(true, "Double Bends");
    },

    doubleBendsWithRelease: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 550, 240);
      ctx.scale(1.0, 1.0);
      ctx.setBackgroundFillStyle("#FFF");
      ctx.setFont("Arial", VF.Test.Font.size);
      var stave = new VF.TabStave(10, 10, 550).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text, release) { return new VF.Bend(text, release); }

      var notes = [
        newNote({
          positions: [{str: 1, fret: 10}, {str: 4, fret: 9}], duration: "q" }).
          addModifier(newBend("1/2", true), 0).
          addModifier(newBend("Full", true), 1),

        newNote({
          positions: [{str: 2, fret: 5},
                      {str: 3, fret: 5},
                      {str: 4, fret: 5}], duration: "q" }).
          addModifier(newBend("1/4", true), 0).
          addModifier(newBend("Monstrous", true), 1).
          addModifier(newBend("1/4", true), 2),

        newNote({
          positions: [{str: 4, fret: 7}], duration: "q" }),
        newNote({
          positions: [{str: 4, fret: 7}], duration: "q" })
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      notes.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 140);
      });
      ok(true, "Bend Release");
    },

    reverseBends: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 240);

      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.setRawFont("10pt Arial");
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text) { return new VF.Bend(text); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "w" }).
          addModifier(newBend("Full"), 1).
          addModifier(newBend("1/2"), 0),

        newNote({
          positions: [{str: 2, fret: 5}, {str: 3, fret: 5}], duration: "w" }).
          addModifier(newBend("1/4"), 1).
          addModifier(newBend("1/4"), 0),

        newNote({
          positions: [{str: 4, fret: 7}], duration: "w" })
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var mc = new VF.ModifierContext();
        note.addToModifierContext(mc);

        var tickContext = new VF.TickContext();
        tickContext.addTickable(note).preFormat().setX(75 * i);

        note.setStave(stave).setContext(ctx).draw();
        VF.Test.plotNoteWidth(ctx, note, 140);
        ok(true, "Bend " + i);
      }
    },

    bendPhrase: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.setRawFont(" 10pt Arial");
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(phrase) { return new VF.Bend(null, null, phrase); }

      var phrase1 = [
        { type: VF.Bend.UP, text: "Full"},
        { type: VF.Bend.DOWN, text: "Monstrous"},
        { type: VF.Bend.UP, text: "1/2"},
        { type: VF.Bend.DOWN, text: ""}
      ];
      var bend1 = newBend(phrase1).setContext(ctx);

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}], duration: "w" }).
          addModifier(bend1, 0)
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var mc = new VF.ModifierContext();
        note.addToModifierContext(mc);

        var tickContext = new VF.TickContext();
        tickContext.addTickable(note).preFormat().setX(75 * i);

        note.setStave(stave).setContext(ctx).draw();
        VF.Test.plotNoteWidth(ctx, note, 140);
        ok(true, "Bend " + i);
      }
    },

    whackoBends: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 240);
      ctx.scale(1.0, 1.0); ctx.setBackgroundFillStyle("#FFF");
      ctx.setFont("Arial", VF.Test.Font.size);
      var stave = new VF.TabStave(10, 10, 350).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(phrase) { return new VF.Bend(null, null, phrase); }

      var phrase1 = [
        { type: VF.Bend.UP, text: "Full"},
        { type: VF.Bend.DOWN, text: ""},
        { type: VF.Bend.UP, text: "1/2"},
        { type: VF.Bend.DOWN, text: ""}
      ];

      var phrase2 = [
        { type: VF.Bend.UP, text: "Full"},
        { type: VF.Bend.UP, text: "Full"},
        { type: VF.Bend.UP, text: "1/2"},
        { type: VF.Bend.DOWN, text: ""},
        { type: VF.Bend.DOWN, text: "Full"},
        { type: VF.Bend.DOWN, text: "Full"},
        { type: VF.Bend.UP, text: "1/2"},
        { type: VF.Bend.DOWN, text: ""}
      ];

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}, {str: 3, fret: 9}], duration: "q" }).
          addModifier(newBend(phrase1), 0).
          addModifier(newBend(phrase2), 1)
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      VF.Test.plotNoteWidth(ctx, notes[0], 140);
      ok(true, "Whako Release");
    }
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
      QUnit.module("BoundingBox");
      test("Initialization Test", VF.Test.BoundingBox.initialization);
      test("Merging Text", VF.Test.BoundingBox.merging);
    },

    initialization: function() {
      var bb = new VF.BoundingBox(4, 5, 6, 7);
      equal(bb.getX(), 4, "Bad X");
      equal(bb.getY(), 5, "Bad Y");
      equal(bb.getW(), 6, "Bad W");
      equal(bb.getH(), 7, "Bad H");

      bb.setX(5)
      equal(bb.getX(), 5, "Bad X");
    },

    merging: function() {
      var bb1 = new VF.BoundingBox(10, 10, 10, 10);
      var bb2 = new VF.BoundingBox(15, 20, 10, 10);

      equal(bb1.getX(), 10, "Bad X for bb1");
      equal(bb2.getX(), 15, "Bad X for bb2");

      bb1.mergeWith(bb2);
      equal(bb1.getX(), 10);
      equal(bb1.getY(), 10);
      equal(bb1.getW(), 15);
      equal(bb1.getH(), 20);
    }
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
      QUnit.module("Clef");
      VF.Test.runTests("Clef Test", VF.Test.Clef.draw);
      VF.Test.runTests("Clef End Test", VF.Test.Clef.drawEnd);
      VF.Test.runTests("Small Clef Test", VF.Test.Clef.drawSmall);
      VF.Test.runTests("Small Clef End Test", VF.Test.Clef.drawSmallEnd);
      VF.Test.runTests("Clef Change Test", VF.Test.Clef.drawClefChange);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);
      var stave = new VF.Stave(10, 10, 700);

      stave.addClef("treble");
      stave.addClef("treble", "default", "8va");
      stave.addClef("treble", "default", "8vb");
      stave.addClef("alto");
      stave.addClef("tenor");
      stave.addClef("soprano");
      stave.addClef("bass");
      stave.addClef("bass", "default", "8vb");
      stave.addClef("mezzo-soprano");
      stave.addClef("baritone-c");
      stave.addClef("baritone-f");
      stave.addClef("subbass");
      stave.addClef("percussion");
      stave.addClef("french");

      stave.addEndClef("treble");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    drawEnd: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);
      var stave = new VF.Stave(10, 10, 700);

      stave.addClef("bass");

      stave.addEndClef("treble");
      stave.addEndClef("treble", "default", "8va");
      stave.addEndClef("treble", "default", "8vb");
      stave.addEndClef("alto");
      stave.addEndClef("tenor");
      stave.addEndClef("soprano");
      stave.addEndClef("bass");
      stave.addEndClef("bass", "default", "8vb");
      stave.addEndClef("mezzo-soprano");
      stave.addEndClef("baritone-c");
      stave.addEndClef("baritone-f");
      stave.addEndClef("subbass");
      stave.addEndClef("percussion");
      stave.addEndClef("french");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },


    drawSmall: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);
      var stave = new VF.Stave(10, 10, 700);

      stave.addClef("treble", "small");
      stave.addClef("treble", "small", "8va");
      stave.addClef("treble", "small", "8vb");
      stave.addClef("alto", "small");
      stave.addClef("tenor", "small");
      stave.addClef("soprano", "small");
      stave.addClef("bass", "small");
      stave.addClef("bass", "small", "8vb");
      stave.addClef("mezzo-soprano", "small");
      stave.addClef("baritone-c", "small");
      stave.addClef("baritone-f", "small");
      stave.addClef("subbass", "small");
      stave.addClef("percussion", "small");
      stave.addClef("french", "small");

      stave.addEndClef("treble", "small");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    drawSmallEnd: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);
      var stave = new VF.Stave(10, 10, 700);

      stave.addClef("bass", "small");

      stave.addEndClef("treble", "small");
      stave.addEndClef("treble", "small", "8va");
      stave.addEndClef("treble", "small", "8vb");
      stave.addEndClef("alto", "small");
      stave.addEndClef("tenor", "small");
      stave.addEndClef("soprano", "small");
      stave.addEndClef("bass", "small");
      stave.addEndClef("bass", "small", "8vb");
      stave.addEndClef("mezzo-soprano", "small");
      stave.addEndClef("baritone-c", "small");
      stave.addEndClef("baritone-f", "small");
      stave.addEndClef("subbass", "small");
      stave.addEndClef("percussion", "small");
      stave.addEndClef("french", "small");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    drawClefChange: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 180);
      var stave = new VF.Stave(10, 10, 700);
      stave.addClef("treble").setContext(ctx).draw();

      var notes = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble" }),
        new VF.ClefNote("alto", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "alto" }),
        new VF.ClefNote("tenor", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "tenor" }),
        new VF.ClefNote("soprano", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "soprano" }),
        new VF.ClefNote("bass", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "bass" }),
        new VF.ClefNote("mezzo-soprano", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "mezzo-soprano" }),
        new VF.ClefNote("baritone-c","small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "baritone-c" }),
        new VF.ClefNote("baritone-f", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "baritone-f" }),
        new VF.ClefNote("subbass", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "subbass" }),
        new VF.ClefNote("french", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "french" }),
        new VF.ClefNote("treble", "small", "8vb"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble", octave_shift: -1}),
        new VF.ClefNote("treble", "small", "8va"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble", octave_shift: 1 })
      ];

      var voice = new VF.Voice({
        num_beats: 12,
        beat_value: 4,
        resolution: VF.RESOLUTION
      });

      voice.addTickables(notes);

      var formatter = new VF.Formatter().
        joinVoices([voice]).format([voice], 500);

      voice.draw(ctx, stave);
      ok(true, "all pass");
    }
  };

  return Clef;
})();
/**
 * VexFlow - Curve Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.Curve = (function () {
  var Curve = {
    Start: function() {
      QUnit.module("Curve");
      VF.Test.runTests("Simple Curve", Curve.simple);
      VF.Test.runTests("Rounded Curve", Curve.rounded);
      VF.Test.runTests("Thick Thin Curves", Curve.thickThin);
      VF.Test.runTests("Top Curve", Curve.topCurve);
    },

    simple: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4), true);
      var beam1_2 = new VF.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = VF.Curve;
      var curve1 = new Curve(notes[0], notes[3], {
        cps: [{x: 0, y: 10}, {x: 0, y: 50}]
      });

      curve1.setContext(ctx).draw();

      var curve2 = new Curve(notes[4], notes[7], {
        cps: [{x: 0, y: 10}, {x: 0, y: 20}]
      });

      curve2.setContext(ctx).draw();

      ok("Simple Curve");
    },

    rounded: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4), true);
      var beam1_2 = new VF.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = VF.Curve;
      var curve1 = new Curve(notes[0], notes[3], {
        x_shift: -10,
        y_shift: 30,
        cps: [{x: 0, y: 20}, {x: 0, y: 50}]
      });

      curve1.setContext(ctx).draw();

      var curve2 = new Curve(notes[4], notes[7], {
        cps: [{x: 0, y: 50}, {x: 0, y: 50}]
      });

      curve2.setContext(ctx).draw();

      ok("Rounded Curve");
    },

    thickThin: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4), true);
      var beam1_2 = new VF.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = VF.Curve;
      var curve1 = new Curve(notes[0], notes[3], {
        thickness: 10,
        x_shift: -10,
        y_shift: 30,
        cps: [{x: 0, y: 20}, {x: 0, y: 50}]
      });

      curve1.setContext(ctx).draw();

      var curve2 = new Curve(notes[4], notes[7], {
        thickness: 0,
        cps: [{x: 0, y: 50}, {x: 0, y: 50}]
      });

      curve2.setContext(ctx).draw();

      ok("Thick Thin Curve");
    },

    topCurve: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4), true);
      var beam1_2 = new VF.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = VF.Curve;
      var curve1 = new Curve(notes[0], notes[7], {
        x_shift: -3,
        y_shift: 10,
        position: Curve.Position.NEAR_TOP,
        position_end: Curve.Position.NEAR_HEAD,

        cps: [{x: 0, y: 20}, {x: 40, y: 80}]
      });

      curve1.setContext(ctx).draw();

      ok("Top Curve");
    }
  };

  return Curve;
})();
/**
 * VexFlow - Dot Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Dot = (function() {
  var Dot = {
    Start: function() {
      QUnit.module("Dot");
      VF.Test.runTests("Basic", VF.Test.Dot.basic);
      VF.Test.runTests("Multi Voice", VF.Test.Dot.multiVoice);
    },

    showNote: function(note, stave, ctx, x) {
      var mc = new VF.ModifierContext();
      note.addToModifierContext(mc);

      var tickContext = new VF.TickContext();
      tickContext.addTickable(note).preFormat().setX(x);

      note.setContext(ctx).setStave(stave);
      note.draw();

      VF.Test.plotNoteWidth(ctx, note, 140);
      return note;
    },

    basic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 1000, 240);
      ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      var stave = new VF.Stave(10, 10, 975);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Dot(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4", "b/4"], duration: "w"}).
          addDotToAll(),

        newNote({ keys: ["a/4", "b/4", "c/5"],
            duration: "q", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["g/4", "a/4", "b/4"],
            duration: "q", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/4", "f/4", "b/4", "c/5"],
            duration: "q"}).
          addDotToAll(),

        newNote({ keys: ["g/4", "a/4", "d/5", "e/5", "g/5"],
            duration: "q", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["g/4", "b/4", "d/5", "e/5"],
            duration: "q", stem_direction: -1}).
          addDotToAll(),

        newNote({ keys: ["e/4", "g/4", "b/4", "c/5"],
            duration: "q", stem_direction: 1}).
          addDotToAll(),

        newNote({ keys: ["d/4", "e/4", "f/4", "a/4", "c/5", "e/5", "g/5"],
            duration: "h"}).
          addDotToAll().
          addDotToAll(),

        newNote({ keys: ["f/4", "g/4", "a/4", "b/4", "c/5", "e/5", "g/5"],
            duration: "16", stem_direction: -1}).
          addDotToAll().
          addDotToAll().
          addDotToAll()
      ];

      for (var i = 0; i < notes.length; ++i) {
        VF.Test.Dot.showNote(notes[i], stave, ctx, 30 + (i * 65));
        var accidentals = notes[i].getDots();
        ok(accidentals.length > 0, "Note " + i + " has accidentals");

        for (var j = 0; j < accidentals.length; ++j) {
          ok(accidentals[j].width > 0, "Dot " + j + " has set width");
        }
      }

      VF.Test.plotLegendForNoteWidth(ctx, 620, 140);
      ok(true, "Full Dot");
    },

    showNotes: function(note1, note2, stave, ctx, x) {
      var mc = new VF.ModifierContext();
      note1.addToModifierContext(mc);
      note2.addToModifierContext(mc);

      var tickContext = new VF.TickContext();
      tickContext
        .addTickable(note1)
        .addTickable(note2)
        .setX(x)
        .preFormat();

      note1.setContext(ctx).setStave(stave).draw();
      note2.setContext(ctx).setStave(stave).draw();

      VF.Test.plotNoteWidth(ctx, note1, 180);
      VF.Test.plotNoteWidth(ctx, note2, 20);
    },

    multiVoice: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 300);

      ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(30, 40, 420);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Dot(type); }

      var note1 = newNote(
          { keys: ["c/4", "e/4", "a/4"], duration: "h", stem_direction: -1}).
          addDotToAll().
          addDotToAll();
      var note2 = newNote(
          { keys: ["d/5", "a/5", "b/5"], duration: "h", stem_direction: 1}).
          addDotToAll();

      VF.Test.Dot.showNotes(note1, note2, stave, ctx, 60);

      note1 = newNote(
          { keys: ["c/4", "e/4", "c/5"], duration: "h", stem_direction: -1}).
          addDot(0).
          addDot(0).
          addDot(1).
          addDot(1).
          addDot(2).
          addDot(2).
          addDot(2);
      note2 = newNote(
          { keys: ["d/5", "a/5", "b/5"], duration: "q", stem_direction: 1}).
          addDotToAll().
          addDotToAll();

      VF.Test.Dot.showNotes(note1, note2, stave, ctx, 150);

      note1 = newNote(
          { keys: ["d/4", "c/5", "d/5"], duration: "h", stem_direction: -1}).
          addDotToAll().
          addDotToAll().
          addDot(0);
      note2 = newNote(
          { keys: ["d/5", "a/5", "b/5"], duration: "q", stem_direction: 1}).
          addDotToAll();

      VF.Test.Dot.showNotes(note1, note2, stave, ctx, 250);
      VF.Test.plotLegendForNoteWidth(ctx, 400, 180);
      ok(true, "Full Dot");
    }
  };

  return Dot;
})()
/**
 * VexFlow - EasyScore Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.EasyScore = (function() {
  var EasyScore = {
    Start: function() {
      QUnit.module("EasyScore");
      var VFT = Vex.Flow.Test;
      QUnit.test("Basic", VFT.EasyScore.basic);
      QUnit.test("Accidentals", VFT.EasyScore.accidentals);
      QUnit.test("Durations", VFT.EasyScore.durations);
      QUnit.test("Chords", VFT.EasyScore.chords);
      QUnit.test("Dots", VFT.EasyScore.dots);
      QUnit.test("Options", VFT.EasyScore.options);
      VFT.runTests("Draw Basic", VFT.EasyScore.drawBasicTest);
      VFT.runTests("Draw Accidentals", VFT.EasyScore.drawAccidentalsTest);
      VFT.runTests("Draw Beams", VFT.EasyScore.drawBeamsTest);
      VFT.runTests("Draw Tuplets", VFT.EasyScore.drawTupletsTest);
      VFT.runTests("Draw Options", VFT.EasyScore.drawOptionsTest);
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
        'cbbs7', 'cbb7', 'cbss7', 'cbs7', 'cb7', 'cdb7', 'cd7', 'c##7', 'c#7', 'cn7', 'c++-7', 'c++7', 'c+-7', 'c+7',
        '(cbs3 bbs3 dbs3), ebs3', '(cd7 cbb3 cn3), cb3',
      ];
      var mustFail = [
        'ct3', 'cdbb7', '(cq cbb3 cn3), cb3', '(cdd7 cbb3 cn3), cb3',
        'cbbbs7', 'cbbss7', 'cbsss7', 'csbs7', 'cddb7', 'cddbb7', 'cdd7', 'c##b7', 'c#bs7', 'cnb#7', 'c+#+b-d7', 'c+--7', 'c++--7', 'c+++7',
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
          voice(notes('(d4 e4 g4)/q, c4/q, c4/q/r, c4/q', {stem: 'down'})),
          voice(notes('c#5/h., c5/q', {stem: 'up'})),
        ]
      }).addClef('treble');

      system.addStave({
        voices: [ voice(notes('c#3/q, cn3/q, bb3/q, d##3/q', {clef: 'bass'})) ]
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
          voice(notes('(cbbs4 ebb4 gbss4)/q, cbs4/q, cdb4/q/r, cd4/q', {stem: 'down'})),
          voice(notes('c++-5/h., c++5/q', {stem: 'up'})),
        ]
      }).addClef('treble');

      system.addStave({
        voices: [ voice(notes('c+-3/q, c+3/q, bb3/q, d##3/q', {clef: 'bass'})) ]
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
          voice(notes('(c4 e4 g4)/q, c4/q, c4/q/r, c4/q', {stem: 'down'})),
          voice(notes('c#5/h.', {stem: 'up'}).concat(beam(notes('c5/8, c5/8', {stem: 'up'}))))
      ]}).addClef('treble');

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
              notes('(c4 e4 g4)/q, cbb4/q, c4/q', {stem: 'down'}),
              {location: VF.Tuplet.LOCATION_BOTTOM}
            ).concat(notes('c4/h', {stem: 'down'}))
          ),
          voice(
            notes('c#5/h.', {stem: 'up'})
              .concat(tuplet(beam(notes('cb5/8, cn5/8, c5/8', {stem: 'up'}))))
          ),
        ]
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
        voices: [ score.voice(notes) ]
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
    }
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
      QUnit.module("Factory");
      var VFT = Vex.Flow.Test;

      QUnit.test("Defaults", VFT.Factory.defaults);
      VFT.runSVGTest("Draw", VFT.Factory.draw);
    },

    defaults: function(assert) {
      assert.throws(function() {
        var vf = new VF.Factory({
          renderer: {
              width: 700,
              height: 500
          }
        })
      });

      var vf = new VF.Factory({
        renderer: {
          selector: null,
          width: 700,
          height: 500
        }
      });

      var options = vf.getOptions();
      assert.equal(options.renderer.width, 700);
      assert.equal(options.renderer.height, 500);
      assert.equal(options.renderer.selector, null);
      assert.equal(options.stave.space, 10); 

      assert.expect(5);
    },

    draw: function(options) {
      var vf = VF.Factory.newFromSelector(options.canvas_sel);
      vf.Stave().setClef('treble');
      vf.draw();
      expect(0);
    }
  };

  return Factory;  
})();

/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Formatter = (function() {
  var runTests = VF.Test.runTests;

  var Formatter = {
    Start: function() {
      QUnit.module("Formatter");
      test("TickContext Building", Formatter.buildTickContexts);
      runTests("StaveNote Formatting", Formatter.formatStaveNotes);
      runTests("StaveNote Justification", Formatter.justifyStaveNotes);
      runTests("Notes with Tab", Formatter.notesWithTab);
      runTests("Multiple Staves - No Justification", Formatter.multiStaves, {justify: 0, iterations: 0});
      runTests("Multiple Staves - Justified", Formatter.multiStaves, {justify: 168, iterations: 0});
      runTests("Multiple Staves - Justified - 6 Iterations", Formatter.multiStaves, {justify: 168, iterations: 6});
      runTests("Proportional Formatting - no tuning", Formatter.proportionalFormatting, {debug: false, iterations: 0});
      runTests("Proportional Formatting - 15 steps", Formatter.proportionalFormatting, {debug: false, iterations: 15});

      for (var i = 2; i < 15; i++) {
        VF.Test.runSVGTest("Proportional Formatting (" + i + " iterations)",
          Formatter.proportionalFormatting, {debug: true, iterations: i});
      }
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
        createTickable().setTicks(BEAT).setWidth(30)
      ];

      var tickables2 = [
        createTickable().setTicks(BEAT * 2).setWidth(10),
        createTickable().setTicks(BEAT).setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30)
      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      voice1.addTickables(tickables1);
      voice2.addTickables(tickables2);

      var formatter = new VF.Formatter();
      var tContexts = formatter.createTickContexts([voice1, voice2]);

      equal(tContexts.list.length, 4, "Voices should have four tick contexts");

      // TODO: add this after pull request #68 is merged to master
      // throws(
      //   function() { formatter.getMinTotalWidth(); },
      //   Vex.RERR,
      //   "Expected to throw exception"
      // );

      ok(formatter.preCalculateMinTotalWidth([voice1, voice2]),
          'Successfully runs preCalculateMinTotalWidth');
      equal(formatter.getMinTotalWidth(), 104,
          "Get minimum total width without passing voices");

      formatter.preFormat();
      equal(formatter.getMinTotalWidth(), 104, "Minimum total width");

      equal(tickables1[0].getX(), tickables2[0].getX(),
          "First notes of both voices have the same X");
      equal(tickables1[2].getX(), tickables2[2].getX(),
          "Last notes of both voices have the same X");
      ok(tickables1[1].getX() < tickables2[1].getX(),
          "Second note of voice 2 is to the right of the second note of voice 1");
    },

    renderNotes: function(
        notes1, notes2, ctx, stave, justify) {
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      voice1.addTickables(notes1);
      voice2.addTickables(notes2);

      new VF.Formatter().joinVoices([voice1, voice2]).
        format([voice1, voice2], justify);

      voice1.draw(ctx, stave);
      voice2.draw(ctx, stave);
    },

    formatStaveNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 250);
      ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 30, 500);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newNote({ keys: ["c/5", "e/5", "a/5"], stem_direction: 1,  duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/5", "e/5", "f/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["c/5", "f/5", "a/5"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      VF.Test.Formatter.renderNotes(notes1, notes2, ctx, stave);

      notes1.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 180);
      });

      notes2.forEach(function(note) {
        VF.Test.plotNoteWidth(ctx, note, 15);
      });

      VF.Test.plotLegendForNoteWidth(ctx, 300, 180);

      ok(true);
    },

    getNotes: function() {
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("bb")).
          addAccidental(1, newAcc("n")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newNote({ keys: ["b/4", "e/5", "a/5"], stem_direction: 1,  duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/5", "e/5", "f/5"], stem_direction: 1, duration: "h"}),
        newNote({ keys: ["c/5", "f/5", "a/5"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("##")).
          addAccidental(1, newAcc("b"))
      ];

      return [notes1, notes2];
    },

    justifyStaveNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 420, 580);
      ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      // Get test voices.
      var notes = VF.Test.Formatter.getNotes();

      var stave = new VF.Stave(10, 30, 400).addTrebleGlyph().
        setContext(ctx).draw();
      VF.Test.Formatter.renderNotes(notes[0], notes[1], ctx, stave);
      notes[0].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 170);});
      notes[1].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 15);});
      ok(true);

      var stave2 = new VF.Stave(10, 220, 400).addTrebleGlyph().
        setContext(ctx).draw();
      VF.Test.Formatter.renderNotes(notes[0], notes[1], ctx, stave2, 300);
      ok(true);
      notes[0].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 350);});
      notes[1].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 200);});

      var stave3 = new VF.Stave(10, 410, 400).addTrebleGlyph().
        setContext(ctx).draw();
      VF.Test.Formatter.renderNotes(notes[0], notes[1], ctx, stave3, 400);
      notes[0].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 550);});
      notes[1].forEach(function(note) {VF.Test.plotNoteWidth(ctx, note, 390);});

      ok(true);
    },

    getTabNotes: function() {
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTabNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "h"}).
          addAccidental(0, newAcc("#")),
        newNote({ keys: ["c/4", "d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("#"))
      ];

      var tabs1 = [
        newTabNote({ positions: [{str: 3, fret: 6}], duration: "h"}).
          addModifier(new VF.Bend("Full"), 0),
        newTabNote({ positions: [{str: 2, fret: 3},
                                 {str: 3, fret: 5}], duration: "8"}).
          addModifier(new VF.Bend("Unison"), 1),
        newTabNote({ positions: [{str: 3, fret: 7}], duration: "8"}),
        newTabNote({ positions: [{str: 3, fret: 6},
                                 {str: 4, fret: 7},
                                 {str: 2, fret: 5}], duration: "q"})

      ];

      return { notes: notes1, tabs: tabs1 }
    },

    renderNotesWithTab: function(notes, ctx, staves, justify) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      var tabVoice = new VF.Voice(VF.Test.TIME4_4);

      voice.addTickables(notes.notes);
      tabVoice.addTickables(notes.tabs);

      new VF.Formatter().
        joinVoices([voice]).joinVoices([tabVoice]).
        format([voice, tabVoice], justify);

      voice.draw(ctx, staves.notes);
      tabVoice.draw(ctx, staves.tabs);
    },

    notesWithTab: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 420, 400);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";

      // Get test voices.
      var notes = VF.Test.Formatter.getTabNotes();
      var stave = new VF.Stave(10, 10, 400).addTrebleGlyph().
        setContext(ctx).draw();
      var tabstave = new VF.TabStave(10, 100, 400).addTabGlyph().
        setNoteStartX(stave.getNoteStartX()).setContext(ctx).draw();

      VF.Test.Formatter.renderNotesWithTab(notes, ctx,
          { notes: stave, tabs: tabstave });
      ok(true);

      var stave2 = new VF.Stave(10, 200, 400).addTrebleGlyph().
        setContext(ctx).draw();
      var tabstave2 = new VF.TabStave(10, 300, 400).addTabGlyph().
        setNoteStartX(stave2.getNoteStartX()).setContext(ctx).draw();

      VF.Test.Formatter.renderNotesWithTab(notes, ctx,
          { notes: stave2, tabs: tabstave2 }, 300);
      ok(true);
    },

    multiStaves: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 300);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var stave11 = new VF.Stave(20, 10, 255).
        addTrebleGlyph().
        addTimeSignature("6/8").
        setContext(ctx).draw();
      var stave21 = new VF.Stave(20, 100, 255).
        addTrebleGlyph().
        addTimeSignature("6/8").
        setContext(ctx).draw();
      var stave31 = new VF.Stave(20, 200, 255).
        addClef("bass").
        addTimeSignature("6/8").
        setContext(ctx).draw();
      new VF.StaveConnector(stave21, stave31).
        setType(VF.StaveConnector.type.BRACE).
        setContext(ctx).draw();

      var notes11 = [
        newNote({ keys: ["f/4"], duration: "q"}).setStave(stave11),
        newNote({ keys: ["d/4"], duration: "8"}).setStave(stave11),
        newNote({ keys: ["g/4"], duration: "q"}).setStave(stave11),
        newNote({ keys: ["e/4"], duration: "8"}).setStave(stave11).
          addAccidental(0, newAcc("b"))
      ];
      var notes21 = [
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}).setStave(stave21),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}).setStave(stave21),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}).setStave(stave21),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}).setStave(stave21),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}).setStave(stave21).
          addAccidental(0, newAcc("b")),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}).setStave(stave21).
          addAccidental(0, newAcc("b"))
      ];
      var notes31 = [
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave31)
      ];

      var voice11 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      var voice21 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      var voice31 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      voice11.addTickables(notes11);
      voice21.addTickables(notes21);
      voice31.addTickables(notes31);

      var beam21a = new VF.Beam(notes21.slice(0, 3));
      var beam21b = new VF.Beam(notes21.slice(3, 6));
      var beam31a = new VF.Beam(notes31.slice(0, 3));
      var beam31b = new VF.Beam(notes31.slice(3, 6));

      var formatter;
      if (options.params.justify > 0) {
        formatter = new VF.Formatter()
          .joinVoices([voice11])
          .joinVoices([voice21])
          .joinVoices([voice31])
          .format([voice11, voice21, voice31], options.params.justify);
      } else {
        formatter = new VF.Formatter()
          .joinVoices([voice11])
          .joinVoices([voice21])
          .joinVoices([voice31])
          .format([voice11, voice21, voice31]);
      }

      for (var i = 0; i < options.params.iterations; i++) {
        formatter.tune();
      }

      voice11.draw(ctx, stave11);
      voice21.draw(ctx, stave21);
      voice31.draw(ctx, stave31);
      beam21a.setContext(ctx).draw();
      beam21b.setContext(ctx).draw();
      beam31a.setContext(ctx).draw();
      beam31b.setContext(ctx).draw();

      var stave12 = new VF.Stave(stave11.width + stave11.x, stave11.y, 250).
        setContext(ctx).draw();
      var stave22 = new VF.Stave(stave21.width + stave21.x, stave21.y, 250).
        setContext(ctx).draw();
      var stave32 = new VF.Stave(stave31.width + stave31.x, stave31.y, 250).
        setContext(ctx).draw();

      var notes12 = [
        newNote({ keys: ["a/4"], duration: "q"}).setStave(stave12).
         addAccidental(0, newAcc("b")),
        newNote({ keys: ["b/4"], duration: "8"}).setStave(stave12).
          addAccidental(0, newAcc("b")),
        newNote({ keys: ["c/5", "e/5"], stem_direction: -1, duration: "q"}).setStave(stave12). //,
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("b")),

        newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}).setStave(stave12)
      ];
      var notes22 = [
        newNote({ keys: ["e/4", "a/4"], stem_direction: 1, duration: "qd"}).setStave(stave22).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("b")).
          addDotToAll(),
        newNote({ keys: ["e/4", "a/4", "c/5"], stem_direction: 1, duration: "q"}).setStave(stave22).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("b")),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}).setStave(stave22).
          addAccidental(0, newAcc("b"))
      ];
      var notes32 = [
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32),
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}).setStave(stave32)
      ];
      var voice12 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      var voice22 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      var voice32 = new VF.Voice(VF.Test.Formatter.TIME6_8);
      voice12.addTickables(notes12);
      voice22.addTickables(notes22);
      voice32.addTickables(notes32);

      if (options.params.justify > 0) {
        formatter = new VF.Formatter()
          .joinVoices([voice12])
          .joinVoices([voice22])
          .joinVoices([voice32])
          .format([voice12, voice22, voice32], 188);
      } else {
        formatter = new VF.Formatter()
          .joinVoices([voice12])
          .joinVoices([voice22])
          .joinVoices([voice32])
          .format([voice12, voice22, voice32]);
      }

      for (var i = 0; i < options.params.iterations; i++) {
        formatter.tune();
      }

      var beam32a = new VF.Beam(notes32.slice(0, 3));
      var beam32b = new VF.Beam(notes32.slice(3, 6));

      voice12.draw(ctx, stave12);
      voice22.draw(ctx, stave22);
      voice32.draw(ctx, stave32);
      beam32a.setContext(ctx).draw();
      beam32b.setContext(ctx).draw();

      ok(true);
    },

    proportionalFormatting: function(options) {
      var debug = options.params.debug;
      VF.Registry.enableDefaultRegistry(new VF.Registry());

      var vf = VF.Test.makeFactory(options, 600, 750);
      var system = vf.System({
        x: 50, width: 500,
        debugFormatter: debug,
        formatIterations: options.params.iterations,
      });
      var score = vf.EasyScore();

      var newVoice = function(notes) { return score.voice(notes, {time: '1/4'})};
      var newStave = function(voice) {
        system.addStave({voices: [voice], debugNoteMetrics: debug})
          .addClef('treble')
          .addTimeSignature('1/4');
      };

      var voices = [
        score.notes('c5/8, c5'),
        score.tuplet(score.notes('a4/8, a4, a4'), {notes_occupied: 2}),
        score.notes('c5/16, c5, c5, c5'),
        score.tuplet(score.notes('a4/16, a4, a4, a4, a4'), {notes_occupied: 4}),
        score.tuplet(score.notes('a4/32, a4, a4, a4, a4, a4, a4'), {notes_occupied: 8}),
      ];

      voices.map(newVoice).forEach(newStave);
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();

      var typeMap = VF.Registry.getDefaultRegistry().index.type;
      var table = Object.keys(typeMap).map(function (k) {
        return k + ": " + Object.keys(typeMap[k]).length;
      });

      // console.log(table);
      VF.Registry.disableDefaultRegistry();
      ok(true);
    },

    TIME6_8: {
      num_beats: 6,
      beat_value: 8,
      resolution: VF.RESOLUTION
    }
  };

  return Formatter;
})();

/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

VF.Test.GhostNote = (function() {
  var GhostNote = {
    Start: function() {
      QUnit.module("GhostNote");
      VF.Test.runTests("GhostNote Basic", VF.Test.GhostNote.basic);
      VF.Test.runTests("GhostNote Dotted", VF.Test.GhostNote.dotted);
    },

    basic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      var stave = new VF.Stave(10, 10, 550);
      stave.setClef('treble');
      stave.setContext(ctx);
      stave.draw();

      function newGhostNote(duration) { return new VF.GhostNote({ duration: duration })}
      function newStaveNote(note_struct) { return new VF.StaveNote(note_struct); }
      function addAccidental(note, type) { note.addAccidental(0, new VF.Accidental(type)); }

      /*
      {} -> GhostNote

       q  q  q  q  8  8  8  8  8  8
      {h}    q {q} q {8} 8  q
      */
      var notes = [
        newStaveNote({ keys: ["f/5"], stem_direction: 1, duration: "q"}),
        newStaveNote({ keys: ["f/5"], stem_direction: 1, duration: "q"}),
        newStaveNote({ keys: ["d/5"], stem_direction: 1, duration: "q"}),
        newStaveNote({ keys: ["c/5"], stem_direction: 1, duration: "q"}),
        newStaveNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["c/5"], stem_direction: 1, duration: "8"})
      ];

      addAccidental(notes[0], "#");
      addAccidental(notes[2], "b");
      addAccidental(notes[6], "n");

      var notes2 = [
        newGhostNote("h"),
        newStaveNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newGhostNote("q"),
        newStaveNote({ keys: ["e/4"], stem_direction: -1, duration: "q"}),
        newGhostNote("8"),
        newStaveNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newStaveNote({ keys: ["c/4"], stem_direction: -1, duration: "q"})
      ];

      addAccidental(notes2[5], "##");

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var beam = new VF.Beam(notes.slice(4, 8));
      var beam2 = new VF.Beam(notes.slice(8, 10));

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        formatToStave([voice, voice2], stave);

      voice.draw(ctx, stave);
      voice2.draw(ctx, stave);

      beam.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      ok(true, "all pass");
    },

    dotted: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      var stave = new VF.Stave(10, 10, 550);
      stave.setClef('treble');
      stave.setContext(ctx);
      stave.draw();

      /*
       {} -> GhostNote

       {qd}    8   q    8  16  16  {hdd}       8
        q   8  8  {qdd}        16   h    q  8  8
      */
      function newGhostNote(duration) { return new VF.GhostNote({ duration: duration })}
      function newStaveNote(note_struct) { return new VF.StaveNote(note_struct); }
      function addAccidental(note, type) { note.addAccidental(0, new VF.Accidental(type)); }

      var notes = [
        newGhostNote("qd"),
        newStaveNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["d/5"], stem_direction: 1, duration: "q"}),
        newStaveNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newStaveNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
        newStaveNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
        newGhostNote("hdd"),
        newStaveNote({ keys: ["f/5"], stem_direction: 1, duration: "8"})
      ];

      addAccidental(notes[1], "bb");
      addAccidental(notes[4], "#");
      addAccidental(notes[7], "n");

      var notes2 = [
        newStaveNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newStaveNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
        newStaveNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
        newGhostNote("qdd"),
        newStaveNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        newStaveNote({ keys: ["c/4"], stem_direction: -1, duration: "h"}),
        newStaveNote({ keys: ["d/4"], stem_direction: -1, duration: "q"}),
        newStaveNote({ keys: ["f/4"], stem_direction: -1, duration: "8"}),
        newStaveNote({ keys: ["e/4"], stem_direction: -1, duration: "8"})
      ];

      addAccidental(notes2[0], '#');
      addAccidental(notes2[4], 'b');
      addAccidental(notes2[5], '#');
      addAccidental(notes2[7], 'n');

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var beam = new VF.Beam(notes.slice(3, 6));
      var beam2 = new VF.Beam(notes2.slice(1, 3));
      var beam3 = new VF.Beam(notes2.slice(7, 9));

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        formatToStave([voice, voice2], stave);

      voice.draw(ctx, stave);
      voice2.draw(ctx, stave);

      beam.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
      beam3.setContext(ctx).draw();

      ok(true, "all pass");
    }
  };

  return GhostNote;
})();

/**
 * VexFlow - GraceNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.GraceNote = (function() {
  var GraceNote = {
    Start: function() {
      QUnit.module('Grace Notes');
      VF.Test.runTests('Grace Note Basic', VF.Test.GraceNote.basic);
      VF.Test.runTests('Grace Note Basic with Slurs', VF.Test.GraceNote.basicSlurred);
      VF.Test.runTests('Grace Notes Multiple Voices', VF.Test.GraceNote.multipleVoices);
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

      var notes =  [
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
      QUnit.module("Grace Tab Notes");
      VF.Test.runTests("Grace Tab Note Simple", VF.Test.GraceTabNote.simple);
      VF.Test.runTests("Grace Tab Note Slurred", VF.Test.GraceTabNote.slurred);
    },

    setupContext: function(options, x, y) {
      var ctx = options.contextBuilder(options.canvas_sel, 350, 140);
      var stave = new VF.TabStave(10, 10, x || 350).addTabGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.GraceTabNote.setupContext(options);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var note0 = newNote({ positions: [{str:4, fret:6}], duration: "4"});
      var note1 = newNote({ positions: [{str:4, fret:12}], duration: "4"});
      var note2 = newNote({ positions: [{str:4, fret:10}], duration: "4"});
      var note3 = newNote({ positions: [{str:4, fret:10}], duration: "4"});

      var gracenote_group0 = [
        { positions: [{str:4, fret:'x'}], duration: "8"}
      ];

      var gracenote_group1 = [
        { positions: [{str:4, fret:9}], duration: "16"},
        { positions: [{str:4, fret:10}], duration: "16"}
      ];

      var gracenote_group2 = [
        { positions: [{str:4, fret:9}], duration: "8"}
      ];
      var gracenote_group3 = [
        { positions: [{str:5, fret:10}], duration: "8"},
        { positions: [{str:4, fret:9}], duration: "8"}
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

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 250);

      voice.draw(c.context, c.stave);

      ok(true, "Simple Test");
    },

    slurred: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.GraceTabNote.setupContext(options);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var note0 = newNote({ positions: [{str:4, fret:12}], duration: "h"});
      var note1 = newNote({ positions: [{str:4, fret:10}], duration: "h"});


      var gracenote_group0 = [
        { positions: [{str:4, fret:9}], duration: "8"},
        { positions: [{str:4, fret:10}], duration: "8"}
      ];

      var gracenote_group1 = [
        { positions: [{str:4, fret:7}], duration: "16"},
        { positions: [{str:4, fret:8}], duration: "16"},
        { positions: [{str:4, fret:9}], duration: "16"},
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

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 200);

      voice.draw(c.context, c.stave);

      ok(true, "Slurred Test");
    }
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
      "C",
      "F",
      "Bb",
      "Eb",
      "Ab",
      "Db",
      "Gb",
      "Cb",
      "G",
      "D",
      "A",
      "E",
      "B",
      "F#",
      "C#"],

    MINOR_KEYS: [
      "Am",
      "Dm",
      "Gm",
      "Cm",
      "Fm",
      "Bbm",
      "Ebm",
      "Abm",
      "Em",
      "Bm",
      "F#m",
      "C#m",
      "G#m",
      "D#m",
      "A#m"],

    Start: function() {
      QUnit.module("Clef Keys");
      QUnit.test("Key Parser Test", VF.Test.ClefKeySignature.parser);
      VF.Test.runTests("Major Key Clef Test",
        VF.Test.ClefKeySignature.keys,
        {majorKeys: true});

      VF.Test.runTests("Minor Key Clef Test",
        VF.Test.ClefKeySignature.keys,
        {majorKeys: false});

      VF.Test.runTests("Stave Helper",
        VF.Test.ClefKeySignature.staveHelper);
    },

    catchError: function(spec) {
      try {
        VF.keySignature(spec);
      } catch (e) {
        equal(e.code, "BadKeySignature", e.message);
      }
    },

    parser: function() {
      expect(11);
      VF.Test.ClefKeySignature.catchError("asdf");
      VF.Test.ClefKeySignature.catchError("D!");
      VF.Test.ClefKeySignature.catchError("E#");
      VF.Test.ClefKeySignature.catchError("D#");
      VF.Test.ClefKeySignature.catchError("#");
      VF.Test.ClefKeySignature.catchError("b");
      VF.Test.ClefKeySignature.catchError("Kb");
      VF.Test.ClefKeySignature.catchError("Fb");
      VF.Test.ClefKeySignature.catchError("Ab");
      VF.Test.ClefKeySignature.catchError("Dbm");
      VF.Test.ClefKeySignature.catchError("B#m");

      VF.keySignature("B");
      VF.keySignature("C");
      VF.keySignature("Fm");
      VF.keySignature("Ab");
      VF.keySignature("Abm");
      VF.keySignature("F#");
      VF.keySignature("G#m");

      ok(true, "all pass");
    },

    keys: function(options, contextBuilder) {

      var clefs =
        ["treble",
        "soprano",
        "mezzo-soprano",
        "alto",
        "tenor",
        "baritone-f",
        "baritone-c",
        "bass",
        "french",
        "subbass",
        "percussion"];

      var ctx = new contextBuilder(options.canvas_sel, 400, 20 + 80 * 2 * clefs.length);


      var staves = [];
      var keys = (options.params.majorKeys) ?
        VF.Test.ClefKeySignature.MAJOR_KEYS :
        VF.Test.ClefKeySignature.MINOR_KEYS;

      var i, flat, sharp, keySig;

      var yOffsetForFlatStaves = 10 + 80 * clefs.length;
      for(i = 0; i<clefs.length; i++) {
        // Render all the sharps first, then all the flats:
        staves[i] = new VF.Stave(10, 10 + 80*i, 390);
        staves[i].addClef(clefs[i]);
        staves[i+clefs.length] = new VF.Stave(10, yOffsetForFlatStaves + 10 + 80*i, 390);
        staves[i+clefs.length].addClef(clefs[i]);

        for(flat = 0; flat < 8; flat++) {
          keySig = new VF.KeySignature(keys[flat]);
          keySig.addToStave(staves[i]);
        }

        for(sharp = 8; sharp < keys.length; sharp++) {
          keySig = new VF.KeySignature(keys[sharp]);
          keySig.addToStave(staves[i+clefs.length]);
        }

        staves[i].setContext(ctx);
        staves[i].draw();
        staves[i + clefs.length].setContext(ctx);
        staves[i + clefs.length].draw();
      }

      ok(true, "all pass");
    },

    staveHelper: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 400);
      var stave = new VF.Stave(10, 10, 370);
      var stave2 = new VF.Stave(10, 90, 370);
      var stave3 = new VF.Stave(10, 170, 370);
      var stave4 = new VF.Stave(10, 260, 370);
      var keys = VF.Test.ClefKeySignature.MAJOR_KEYS;

      stave.addClef("treble");
      stave2.addClef("bass");
      stave3.addClef("alto");
      stave4.addClef("tenor");

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

      ok(true, "all pass");
    }
  };

  return ClefKeySignature;
})();
/**
 * VexFlow - Music Key Management Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.KeyManager = (function() {
  var KeyManager = {
    Start: function() {
      QUnit.module("KeyManager");
      test("Valid Notes", VF.Test.KeyManager.works);
      test("Select Notes", VF.Test.KeyManager.selectNotes);
    },

    works: function() {
      // expect(1);

      var manager = new VF.KeyManager("g");
      equal(manager.getAccidental("f").accidental, "#");

      manager.setKey("a");
      equal(manager.getAccidental("c").accidental, "#");
      equal(manager.getAccidental("a").accidental, null);
      equal(manager.getAccidental("f").accidental, "#");

      manager.setKey("A");
      equal(manager.getAccidental("c").accidental, "#");
      equal(manager.getAccidental("a").accidental, null);
      equal(manager.getAccidental("f").accidental, "#");
    },

    selectNotes: function(options) {
      var manager = new VF.KeyManager("f");
      equal(manager.selectNote("bb").note, "bb");
      equal(manager.selectNote("bb").accidental, "b");
      equal(manager.selectNote("g").note, "g");
      equal(manager.selectNote("g").accidental, null);
      equal(manager.selectNote("b").note, "b");
      equal(manager.selectNote("b").accidental, null);
      equal(manager.selectNote("a#").note, "bb");
      equal(manager.selectNote("g#").note, "g#");

      // Changes have no effect?
      equal(manager.selectNote("g#").note, "g#");
      equal(manager.selectNote("bb").note, "bb");
      equal(manager.selectNote("bb").accidental, "b");
      equal(manager.selectNote("g").note, "g");
      equal(manager.selectNote("g").accidental, null);
      equal(manager.selectNote("b").note, "b");
      equal(manager.selectNote("b").accidental, null);
      equal(manager.selectNote("a#").note, "bb");
      equal(manager.selectNote("g#").note, "g#");

      // Changes should propagate
      manager.reset();
      equal(manager.selectNote("g#").change, true);
      equal(manager.selectNote("g#").change, false);
      equal(manager.selectNote("g").change, true);
      equal(manager.selectNote("g").change, false);
      equal(manager.selectNote("g#").change, true);

      manager.reset();
      var note = manager.selectNote("bb");
      equal(note.change, false);
      equal(note.accidental, "b");
      note = manager.selectNote("g");
      equal(note.change, false);
      equal(note.accidental, null);
      note = manager.selectNote("g#");
      equal(note.change, true);
      equal(note.accidental, "#");
      note = manager.selectNote("g");
      equal(note.change, true);
      equal(note.accidental, null);
      note = manager.selectNote("g");
      equal(note.change, false);
      equal(note.accidental, null);
      note = manager.selectNote("g#");
      equal(note.change, true);
      equal(note.accidental, "#");
    }
  }

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
      equal(e.code, "BadKeySignature", e.message);
    }
  }

  KeySignature = {
    MAJOR_KEYS: [
      "C",
      "F",
      "Bb",
      "Eb",
      "Ab",
      "Db",
      "Gb",
      "Cb",
      "G",
      "D",
      "A",
      "E",
      "B",
      "F#",
      "C#"],

    MINOR_KEYS: [
      "Am",
      "Dm",
      "Gm",
      "Cm",
      "Fm",
      "Bbm",
      "Ebm",
      "Abm",
      "Em",
      "Bm",
      "F#m",
      "C#m",
      "G#m",
      "D#m",
      "A#m"],

    Start: function() {
      QUnit.module("KeySignature");
      test("Key Parser Test", VF.Test.KeySignature.parser);
      VF.Test.runTests("Major Key Test", VF.Test.KeySignature.majorKeys);
      VF.Test.runTests("Minor Key Test", VF.Test.KeySignature.minorKeys);
      VF.Test.runTests("Stave Helper", VF.Test.KeySignature.staveHelper);
      VF.Test.runTests("Cancelled key test", VF.Test.KeySignature.majorKeysCanceled);
      VF.Test.runTests("Altered key test", VF.Test.KeySignature.majorKeysAltered);
    },

    parser: function() {
      expect(11);
      catchError("asdf");
      catchError("D!");
      catchError("E#");
      catchError("D#");
      catchError("#");
      catchError("b");
      catchError("Kb");
      catchError("Fb");
      catchError("Ab");
      catchError("Dbm");
      catchError("B#m");

      VF.keySignature("B");
      VF.keySignature("C");
      VF.keySignature("Fm");
      VF.keySignature("Ab");
      VF.keySignature("Abm");
      VF.keySignature("F#");
      VF.keySignature("G#m");

      ok(true, "all pass");
    },

    majorKeys: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 240);
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

      ok(true, "all pass");
    },

    majorKeysCanceled: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 780, 500);
      ctx.scale(0.9, 0.9);
      var stave = new VF.Stave(10, 10, 750).addTrebleGlyph();
      var stave2 = new VF.Stave(10, 90, 750).addTrebleGlyph();
      var stave3 = new VF.Stave(10, 170, 750).addTrebleGlyph();
      var stave4 = new VF.Stave(10, 250, 750).addTrebleGlyph();
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      var i, n;
      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.cancelKey("Cb");

        keySig.padding = 18;
        keySig.addToStave(stave);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.cancelKey("C#");
        keySig.padding = 20;
        keySig.addToStave(stave2);
      }

      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.cancelKey("E");

        keySig.padding = 18;
        keySig.addToStave(stave3);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.cancelKey("Ab");
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


      ok(true, "all pass");
    },

    majorKeysAltered: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 780, 500);
      ctx.scale(0.9, 0.9);
      var stave = new VF.Stave(10, 10, 750).addTrebleGlyph();
      var stave2 = new VF.Stave(10, 90, 750).addTrebleGlyph();
      var stave3 = new VF.Stave(10, 170, 750).addTrebleGlyph();
      var stave4 = new VF.Stave(10, 250, 750).addTrebleGlyph();
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      var i, n;
      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.alterKey(["bs", "bs"]);
        keySig.padding = 18;
        keySig.addToStave(stave);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.alterKey(["+", "+", "+"]);
        keySig.padding = 20;
        keySig.addToStave(stave2);
      }

      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.alterKey(["n", "bs", "bb"]);
        keySig.padding = 18;
        keySig.addToStave(stave3);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.alterKey(["++", "+", "n", "+"]);
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


      ok(true, "all pass");
    },

    minorKeys: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 240);
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

      ok(true, "all pass");
    },

    staveHelper: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 240);
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

      ok(true, "all pass");
    }
  };

  return KeySignature;
})();

/**
 * VexFlow - ModifierContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ModifierContext = (function() {
  var ModifierContext = {
    Start: function() {
      QUnit.module("ModifierContext");
      test("Modifier Width Test", ModifierContext.width);
      test("Modifier Management", ModifierContext.management);
    },

    width: function() {
      var mc = new VF.ModifierContext();
      equal(mc.getWidth(), 0, "New modifier context has no width");
    },

    management: function() {
      var mc = new VF.ModifierContext();
      var modifier1 = new VF.Modifier();
      var modifier2 = new VF.Modifier();

      mc.addModifier(modifier1);
      mc.addModifier(modifier2);

      var accidentals = mc.getModifiers("none");

      equal(accidentals.length, 2, "Added two modifiers");
    },
  }

  return ModifierContext;
})();
/**
 * VexFlow - Music API Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Music = (function() {
  var Music = {
    Start: function() {
      QUnit.module("Music");
      test("Valid Notes", Music.validNotes);
      test("Valid Keys", Music.validKeys);
      test("Note Values", Music.noteValue);
      test("Interval Values", Music.intervalValue);
      test("Relative Notes", Music.relativeNotes);
      test("Relative Note Names", Music.relativeNoteNames);
      test("Canonical Notes", Music.canonicalNotes);
      test("Canonical Intervals", Music.canonicalNotes);
      test("Scale Tones", Music.scaleTones);
      test("Scale Intervals", Music.scaleIntervals);
    },

    validNotes: function() {
      expect(10);

      var music = new VF.Music();

      var parts = music.getNoteParts("c");
      equal(parts.root, "c");
      equal(parts.accidental, null);

      parts = music.getNoteParts("C");
      equal(parts.root, "c");
      equal(parts.accidental, null);

      parts = music.getNoteParts("c#");
      equal(parts.root, "c");
      equal(parts.accidental, "#");

      parts = music.getNoteParts("c##");
      equal(parts.root, "c");
      equal(parts.accidental, "##");

      try {
        music.getNoteParts("r");
      } catch (e) {
        equal(e.code, "BadArguments", "Invalid note: r");
      }

      try {
        music.getNoteParts("");
      } catch (e) {
        equal(e.code, "BadArguments", "Invalid note: ''");
      }
    },

    validKeys: function() {
      expect(18);

      var music = new VF.Music();

      var parts = music.getKeyParts("c");
      equal(parts.root, "c");
      equal(parts.accidental, null);
      equal(parts.type, "M");

      parts = music.getKeyParts("d#");
      equal(parts.root, "d");
      equal(parts.accidental, "#");
      equal(parts.type, "M");

      parts = music.getKeyParts("fbm");
      equal(parts.root, "f");
      equal(parts.accidental, "b");
      equal(parts.type, "m");

      parts = music.getKeyParts("c#mel");
      equal(parts.root, "c");
      equal(parts.accidental, "#");
      equal(parts.type, "mel");

      parts = music.getKeyParts("g#harm");
      equal(parts.root, "g");
      equal(parts.accidental, "#");
      equal(parts.type, "harm");

      try {
        music.getKeyParts("r");
      } catch (e) {
        equal(e.code, "BadArguments", "Invalid key: r");
      }

      try {
        music.getKeyParts("");
      } catch (e) {
        equal(e.code, "BadArguments", "Invalid key: ''");
      }

      try {
        music.getKeyParts("#m");
      } catch (e) {
        equal(e.code, "BadArguments", "Invalid key: #m");
      }
    },

    noteValue: function() {
      expect(3);

      var music = new VF.Music();

      var note = music.getNoteValue("c");
      equal(note, 0);

      try {
        music.getNoteValue("r");
      } catch(e) {
        ok(true, "Invalid note");
      }

      note = music.getNoteValue("f#");
      equal(note, 6);
    },

    intervalValue: function() {
      expect(2);

      var music = new VF.Music();

      var value = music.getIntervalValue("b2");
      equal(value, 1);

      try {
        music.getIntervalValue("7");
      } catch(e) {
        ok(true, "Invalid note");
      }
    },

    relativeNotes: function() {
      expect(8);

      var music = new VF.Music();

      var value = music.getRelativeNoteValue(music.getNoteValue("c"),
          music.getIntervalValue("b5"));
      equal(value, 6);

      try {
        music.getRelativeNoteValue(music.getNoteValue("bc"),
            music.getIntervalValue("b2"));
      } catch(e) {
        ok(true, "Invalid note");
      }

      try {
        music.getRelativeNoteValue(music.getNoteValue("b"),
            music.getIntervalValue("p3"));
      } catch(e) {
        ok(true, "Invalid interval");
      }

      // Direction
      value = music.getRelativeNoteValue(music.getNoteValue("d"),
          music.getIntervalValue("2"), -1);
      equal(value, 0);

      try {
        music.getRelativeNoteValue(music.getNoteValue("b"),
            music.getIntervalValue("p4"), 0);
      } catch(e) {
        ok(true, "Invalid direction");
      }

      // Rollover
      value = music.getRelativeNoteValue(music.getNoteValue("b"),
          music.getIntervalValue("b5"));
      equal(value, 5);

      // Reverse rollover
      value = music.getRelativeNoteValue(music.getNoteValue("c"),
          music.getIntervalValue("b2"), -1);
      equal(value, 11);

      // Practical tests
      value = music.getRelativeNoteValue(music.getNoteValue("g"),
          music.getIntervalValue("p5"));
      equal(value, 2);
    },

    relativeNoteNames: function() {
      expect(9);

      var music = new VF.Music();
      equal(music.getRelativeNoteName("c", music.getNoteValue("c")), "c");
      equal(music.getRelativeNoteName("c", music.getNoteValue("db")), "c#");
      equal(music.getRelativeNoteName("c#", music.getNoteValue("db")), "c#");
      equal(music.getRelativeNoteName("e", music.getNoteValue("f#")), "e##");
      equal(music.getRelativeNoteName("e", music.getNoteValue("d#")), "eb");
      equal(music.getRelativeNoteName("e", music.getNoteValue("fb")), "e");

      try {
        music.getRelativeNoteName("e", music.getNoteValue("g#"));
      } catch(e) {
        ok(true, "Too far");
      }

      equal(music.getRelativeNoteName("b", music.getNoteValue("c#")), "b##");
      equal(music.getRelativeNoteName("c", music.getNoteValue("b")), "cb");
    },

    canonicalNotes: function() {
      expect(3);

      var music = new VF.Music();

      equal(music.getCanonicalNoteName(0), "c");
      equal(music.getCanonicalNoteName(2), "d");

      try {
        music.getCanonicalNoteName(-1);
      } catch(e) {
        ok(true, "Invalid note value");
      }
    },

    canonicalIntervals: function() {
      expect(3);

      var music = new VF.Music();

      equal(music.getCanonicalIntervalName(0), "unison");
      equal(music.getCanonicalIntervalName(2), "M2");

      try {
        music.getCanonicalIntervalName(-1);
      } catch(e) {
        ok(true, "Invalid interval value");
      }
    },

    scaleTones: function() {
      expect(24);

      // C Major
      var music = new VF.Music();
      var manager = new VF.KeyManager("CM");

      var c_major = music.getScaleTones(
          music.getNoteValue("c"), VF.Music.scales.major);
      var values = ["c", "d", "e", "f", "g", "a", "b"];

      equal(c_major.length, 7);

      for (var cm = 0; cm < c_major.length; ++cm) {
        equal(music.getCanonicalNoteName(c_major[cm]), values[cm]);
      }

      // Dorian
      var c_dorian = music.getScaleTones(
          music.getNoteValue("c"), VF.Music.scales.dorian);
      values = ["c", "d", "eb", "f", "g", "a", "bb"];

      var note = null;
      equal(c_dorian.length,  7);
      for (var cd = 0; cd < c_dorian.length; ++cd) {
          note = music.getCanonicalNoteName(c_dorian[cd]);
          equal(manager.selectNote(note).note, values[cd]);
      }

      // Mixolydian
      var c_mixolydian = music.getScaleTones(
          music.getNoteValue("c"), VF.Music.scales.mixolydian);
      values = ["c", "d", "e", "f", "g", "a", "bb"];

      equal(c_mixolydian.length,  7);

      for (var i = 0; i < c_mixolydian.length; ++i) {
          note = music.getCanonicalNoteName(c_mixolydian[i]);
          equal(manager.selectNote(note).note, values[i]);
      }
    },

    scaleIntervals: function() {
      expect(6);

      var music = new VF.Music();

      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
             music.getNoteValue("c"), music.getNoteValue("d"))), "M2");
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
             music.getNoteValue("g"), music.getNoteValue("c"))), "p4");
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
             music.getNoteValue("c"), music.getNoteValue("c"))), "unison");
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
             music.getNoteValue("f"), music.getNoteValue("cb"))), "dim5");

      // Forwards and backwards
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
             music.getNoteValue("d"), music.getNoteValue("c"), 1)), "b7");
      equal(music.getCanonicalIntervalName(music.getIntervalBetween(
             music.getNoteValue("d"), music.getNoteValue("c"), -1)), "M2");
    }
  };

  return Music;
})();
/**
 * VexFlow - NoteHead Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.NoteHead = (function() {
  var NoteHead = {
    Start: function(){
      QUnit.module("NoteHead");
      VF.Test.runTests("Basic", VF.Test.NoteHead.basic);
      VF.Test.runTests("Bounding Boxes", VF.Test.NoteHead.basicBoundingBoxes);
    },

    setupContext: function(options, x, y) {

      var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 10, x || 450).addTrebleGlyph();

      return {context: ctx, stave: stave};
    },

    basic: function(options, contextBuilder){
      options.contextBuilder = contextBuilder;
      var c = VF.Test.NoteHead.setupContext(options, 450, 250);

      c.stave = new VF.Stave(10, 0, 250).addTrebleGlyph();

      c.context.scale(2.0, 2.0);
      c.stave.setContext(c.context).draw();

      var formatter = new VF.Formatter();
      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);

      var note_head1 = new VF.NoteHead({
        duration: "4",
        line: 3
      });

      var note_head2 = new VF.NoteHead({
        duration: "1",
        line: 2.5
      });

      var note_head3 = new VF.NoteHead({
        duration: "2",
        line: 0
      });

      voice.addTickables([note_head1, note_head2, note_head3]);
      formatter.joinVoices([voice]).formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      ok("Basic NoteHead test");
    },

    basicBoundingBoxes: function(options, contextBuilder){
      options.contextBuilder = contextBuilder;
      var c = VF.Test.NoteHead.setupContext(options, 350, 250);

      c.stave = new VF.Stave(10, 0, 250).addTrebleGlyph();

      c.context.scale(2.0, 2.0);
      c.stave.setContext(c.context).draw();

      var formatter = new VF.Formatter();
      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);

      var note_head1 = new VF.NoteHead({
        duration: "4",
        line: 3
      });

      var note_head2 = new VF.NoteHead({
        duration: "2",
        line: 2.5
      });

      var note_head3 = new VF.NoteHead({
        duration: "1",
        line: 0
      });

      voice.addTickables([note_head1, note_head2, note_head3]);
      formatter.joinVoices([voice]).formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      note_head1.getBoundingBox().draw(c.context);
      note_head2.getBoundingBox().draw(c.context);
      note_head3.getBoundingBox().draw(c.context);

      ok("NoteHead Bounding Boxes");
    }
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
      QUnit.module("NoteSubGroup");
      VF.Test.runTests("Basic - ClefNote, TimeSigNote and BarNote", VF.Test.NoteSubGroup.draw);
      VF.Test.runTests("Multi Voice", VF.Test.NoteSubGroup.drawMultiVoice);
      VF.Test.runTests("Multi Staff", VF.Test.NoteSubGroup.drawMultiStaff);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 200);
      var stave = new VF.Stave(10, 10, 500);
      stave.setClef("treble");
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        { keys: ["f/5"], stem_direction: -1, duration: "q"},
        { keys: ["d/4"], stem_direction: -1, duration: "q", clef: "bass"},
        { keys: ["g/4"], stem_direction: -1, duration: "q", clef: "alto"},
        { keys: ["a/4"], stem_direction: -1, duration: "q", clef: "alto"},
        { keys: ["c/4"], stem_direction: -1, duration: "q", clef: "tenor"},
        { keys: ["c/3"], stem_direction: 1, duration: "q", clef: "tenor"},
        { keys: ["d/4"], stem_direction: -1, duration: "q", clef: "tenor"},
        { keys: ["f/4"], stem_direction: -1, duration: "q", clef: "tenor"}
      ];

      notes = notes.map(function(note_struct) {
        return new VF.StaveNote(note_struct);
      });

      function addAccidental(note, acc) { return note.addModifier(0, new VF.Accidental(acc)); }
      function addSubGroup(note, subNotes) {
        return note.addModifier(0, new VF.NoteSubGroup(subNotes));
      }

      // {SubNotes} | {Accidental} | {StaveNote}
      addAccidental(notes[1], "#");
      addAccidental(notes[2], "n");
      addSubGroup(notes[1], [new VF.ClefNote("bass", "small")]);
      addSubGroup(notes[2], [new VF.ClefNote("alto", "small")]);
      addSubGroup(notes[4], [
        new VF.ClefNote("tenor", "small"),
        new VF.BarNote()
      ]);
      addSubGroup(notes[5], [new VF.TimeSigNote("6/8")]);
      addSubGroup(notes[6], [new VF.BarNote(VF.Barline.type.REPEAT_BEGIN)]);
      addAccidental(notes[4], "b");
      addAccidental(notes[6], "bb");

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);

      voice.draw(ctx, stave);

      notes.forEach(function(note) { Vex.Flow.Test.plotNoteWidth(ctx, note, 150); });
      Vex.Flow.Test.plotLegendForNoteWidth(ctx, 520, 150);
      ok(true, "all pass");
    },

    drawMultiVoice: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 550, 200);
      var stave = new VF.Stave(10, 10, 500);
      stave.setClef("treble");
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        { keys: ["f/5"], stem_direction: 1, duration: "q"},
        { keys: ["d/4"], stem_direction: 1, duration: "q", clef: "bass"},
        { keys: ["c/5"], stem_direction: 1, duration: "q", clef: "alto"},
        { keys: ["c/5"], stem_direction: 1, duration: "q", clef: "soprano"}
      ];

      var notes2 = [
        { keys: ["c/4"], stem_direction: -1, duration: "q"},
        { keys: ["c/3"], stem_direction: -1, duration: "q", clef: "bass"},
        { keys: ["d/4"], stem_direction: -1, duration: "q", clef: "alto"},
        { keys: ["f/4"], stem_direction: -1, duration: "q", clef: "soprano"}
      ];

      function newStaveNote(note_struct) { return new VF.StaveNote(note_struct); }
      function addAccidental(note, acc) { return note.addModifier(0, new VF.Accidental(acc)); }
      function addSubGroup(note, subNotes) {
        return note.addModifier(0, new VF.NoteSubGroup(subNotes));
      }

      notes = notes.map(newStaveNote);
      notes2 = notes2.map(newStaveNote);

      addAccidental(notes[1], "#");
      addSubGroup(notes[1], [
        new VF.ClefNote("bass", "small"),
        new VF.BarNote(VF.Barline.type.REPEAT_BEGIN),
        new VF.TimeSigNote("3/4")
      ]);
      addSubGroup(notes2[2], [
        new VF.ClefNote("alto", "small"),
        new VF.TimeSigNote("9/8"),
        new VF.BarNote(VF.Barline.type.DOUBLE)
      ]);
      addSubGroup(notes[3], [new VF.ClefNote("soprano", "small")]);
      addAccidental(notes[2], "b");
      addAccidental(notes2[3], "#");

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(true);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(true);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        formatToStave([voice, voice2], stave);

      voice.draw(ctx, stave);
      voice2.draw(ctx, stave);

      notes.forEach(function(note) { Vex.Flow.Test.plotNoteWidth(ctx, note, 150); });
      ok(true, "all pass");
    },

    drawMultiStaff: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 280);
      var stave = new VF.Stave(30, 30, 550);
      var stave2 = new VF.Stave(30, 150, 550);
      stave.setClef("treble");
      stave2.setClef("bass");
      stave.setContext(ctx);
      stave2.setContext(ctx);
      stave.draw();
      stave2.draw();

      var connector = new VF.StaveConnector(stave, stave2);
      var connector2 = new VF.StaveConnector(stave, stave2);
      var connector3 = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.BRACE);
      connector2.setType(VF.StaveConnector.type.SINGLE_LEFT);
      connector3.setType(VF.StaveConnector.type.SINGLE_RIGHT);
      connector.setContext(ctx).draw();
      connector2.setContext(ctx).draw();
      connector3.setContext(ctx).draw();

      var notes = [
        { keys: ["f/5"], stem_direction: 1, duration: "q" },
        { keys: ["d/4"], stem_direction: 1, duration: "q", clef: "bass" },
        { keys: ["c/5"], stem_direction: 1, duration: "q", clef: "alto" },
        { keys: ["c/5"], stem_direction: 1, duration: "q", clef: "soprano" }
      ];

      var notes2 = [
        { keys: ["c/4"], stem_direction: -1, duration: "q" },
        { keys: ["c/3"], stem_direction: -1, duration: "q", clef: "bass" },
        { keys: ["d/4"], stem_direction: -1, duration: "q", clef: "alto" },
        { keys: ["f/4"], stem_direction: -1, duration: "q", clef: "soprano" }
      ];

      var notes3 = [
        { keys: ["e/3"], duration: "8", stem_direction: -1, clef: "bass" },
        { keys: ["g/4"], duration: "8", stem_direction: 1, clef: "treble" },
        { keys: ["d/4"], duration: "8", stem_direction: 1, clef: "treble" },
        { keys: ["f/4"], duration: "8", stem_direction: 1, clef: "treble" },
        { keys: ["c/4"], duration: "8", stem_direction: 1, clef: "treble"},
        { keys: ["g/3"], duration: "8", stem_direction: -1, clef: "bass" },
        { keys: ["d/3"], duration: "8", stem_direction: -1, clef: "bass" },
        { keys: ["f/3"], duration: "8", stem_direction: -1, clef: "bass" }
      ]

      function newStaveNote(_stave) {
        return function(note_struct) {
          return (new VF.StaveNote(note_struct)).setStave(_stave);
        }
      }
      function addAccidental(note, acc) { return note.addModifier(0, new VF.Accidental(acc)); }
      function addSubGroup(note, subNotes) {
        return note.addModifier(0, new VF.NoteSubGroup(subNotes));
      }

      notes = notes.map(newStaveNote(stave));
      notes2 = notes2.map(newStaveNote(stave));
      notes3 = notes3.map(newStaveNote(stave2));

      var beam3_1 = new VF.Beam(notes3.slice(1, 4));
      var beam3_2 = new VF.Beam(notes3.slice(5));

      addAccidental(notes[1], "#");
      addSubGroup(notes[1], [
        new VF.ClefNote("bass", "small"),
        new VF.TimeSigNote("3/4")
      ]);
      addSubGroup(notes2[2], [
        new VF.ClefNote("alto", "small"),
        new VF.TimeSigNote("9/8"),
      ]);
      addSubGroup(notes[3], [new VF.ClefNote("soprano", "small")]);
      addSubGroup(notes3[1], [new VF.ClefNote("treble", "small")]);
      addSubGroup(notes3[5], [new VF.ClefNote("bass", "small")]);
      addAccidental(notes3[0], "#");
      addAccidental(notes3[3], "b");
      addAccidental(notes3[5], "#");
      addAccidental(notes[2], "b");
      addAccidental(notes2[3], "#");

      var voice = new VF.Voice(VF.Test.TIME4_4).setStrict(true);
      var voice2 = new VF.Voice(VF.Test.TIME4_4).setStrict(true);
      var voice3 = new VF.Voice(VF.Test.TIME4_4).setStrict(true);
      voice.addTickables(notes);
      voice2.addTickables(notes2);
      voice3.addTickables(notes3);

      var justifyWidth = stave.getNoteEndX() - stave.getNoteStartX() - 10;
      var formatter = new VF.Formatter()
        .joinVoices([voice, voice2])
        .joinVoices([voice3])
        .format([voice, voice2, voice3], justifyWidth);

      voice.draw(ctx, stave);
      voice2.draw(ctx, stave);
      voice3.draw(ctx, stave2);
      beam3_1.setContext(ctx).draw();
      beam3_2.setContext(ctx).draw();

      ok(true, "all pass");
    }
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
      QUnit.module("Ornament");
      runTests("Ornaments", Ornament.drawOrnaments);
      runTests("Ornaments Vertically Shifted", Ornament.drawOrnamentsDisplaced);
      runTests("Ornaments - Delayed turns", Ornament.drawOrnamentsDelayed);
      runTests("Stacked", Ornament.drawOrnamentsStacked);
      runTests("With Upper/Lower Accidentals", Ornament.drawOrnamentsWithAccidentals);
    },

    drawOrnaments: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 750, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 700);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("mordent"));
      notesBar1[1].addModifier(0, new VF.Ornament("mordent_inverted"));
      notesBar1[2].addModifier(0, new VF.Ornament("turn"));
      notesBar1[3].addModifier(0, new VF.Ornament("turn_inverted"));
      notesBar1[4].addModifier(0, new VF.Ornament("tr"));
      notesBar1[5].addModifier(0, new VF.Ornament("upprall"));
      notesBar1[6].addModifier(0, new VF.Ornament("downprall"));
      notesBar1[7].addModifier(0, new VF.Ornament("prallup"));
      notesBar1[8].addModifier(0, new VF.Ornament("pralldown"));
      notesBar1[9].addModifier(0, new VF.Ornament("upmordent"));
      notesBar1[10].addModifier(0, new VF.Ornament("downmordent"));
      notesBar1[11].addModifier(0, new VF.Ornament("lineprall"));
      notesBar1[12].addModifier(0, new VF.Ornament("prallprall"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsDisplaced: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 750, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 700);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("mordent"));
      notesBar1[1].addModifier(0, new VF.Ornament("mordent_inverted"));
      notesBar1[2].addModifier(0, new VF.Ornament("turn"));
      notesBar1[3].addModifier(0, new VF.Ornament("turn_inverted"));
      notesBar1[4].addModifier(0, new VF.Ornament("tr"));
      notesBar1[5].addModifier(0, new VF.Ornament("upprall"));
      notesBar1[6].addModifier(0, new VF.Ornament("downprall"));
      notesBar1[7].addModifier(0, new VF.Ornament("prallup"));
      notesBar1[8].addModifier(0, new VF.Ornament("pralldown"));
      notesBar1[9].addModifier(0, new VF.Ornament("upmordent"));
      notesBar1[10].addModifier(0, new VF.Ornament("downmordent"));
      notesBar1[11].addModifier(0, new VF.Ornament("lineprall"));
      notesBar1[12].addModifier(0, new VF.Ornament("prallprall"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsDelayed: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 550, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 500);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("turn").setDelayed(true));
      notesBar1[1].addModifier(0, new VF.Ornament("turn_inverted").setDelayed(true));
      notesBar1[2].addModifier(0, new VF.Ornament("turn_inverted").setDelayed(true));
      notesBar1[3].addModifier(0, new VF.Ornament("turn").setDelayed(true));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsStacked: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 550, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 500);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("mordent"));
      notesBar1[1].addModifier(0, new VF.Ornament("turn_inverted"));
      notesBar1[2].addModifier(0, new VF.Ornament("turn"));
      notesBar1[3].addModifier(0, new VF.Ornament("turn_inverted"));

      notesBar1[0].addModifier(0, new VF.Ornament("turn"));
      notesBar1[1].addModifier(0, new VF.Ornament("prallup"));
      notesBar1[2].addModifier(0, new VF.Ornament("upmordent"));
      notesBar1[3].addModifier(0, new VF.Ornament("lineprall"));


      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsWithAccidentals: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel,650, 250);

      // bar 1
      var staveBar1 = new VF.Stave(10, 60, 600);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("mordent").setUpperAccidental("#").setLowerAccidental("#"));
      notesBar1[1].addModifier(0, new VF.Ornament("turn_inverted").setLowerAccidental("b").setUpperAccidental("b"));
      notesBar1[2].addModifier(0, new VF.Ornament("turn").setUpperAccidental("##").setLowerAccidental("##"));
      notesBar1[3].addModifier(0, new VF.Ornament("mordent_inverted").setLowerAccidental("db").setUpperAccidental("db"));
      notesBar1[4].addModifier(0, new VF.Ornament("turn_inverted").setUpperAccidental("++").setLowerAccidental("++"));
      notesBar1[5].addModifier(0, new VF.Ornament("tr").setUpperAccidental("n").setLowerAccidental("n"));
      notesBar1[6].addModifier(0, new VF.Ornament("prallup").setUpperAccidental("d").setLowerAccidental('d'));
      notesBar1[7].addModifier(0, new VF.Ornament("lineprall").setUpperAccidental("db").setLowerAccidental('db'));
      notesBar1[8].addModifier(0, new VF.Ornament("upmordent").setUpperAccidental("bbs").setLowerAccidental('bbs'));
      notesBar1[9].addModifier(0, new VF.Ornament("prallprall").setUpperAccidental("bb").setLowerAccidental('bb'));
      notesBar1[10].addModifier(0, new VF.Ornament("turn_inverted").setUpperAccidental("+").setLowerAccidental('+'));



      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    }
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

      LBRACE:  function() { return { token: '[{]' }; },
      RBRACE:  function() { return { token: '[}]' }; },
      WORD:    function() { return { token: '[a-zA-Z]+' }; },
      COMMA:   function() { return { token: '[,]' }; },
      EXCLAIM: function() { return { token: '[!]' }; },
      EOL:     function() { return { token: '$' }; },
    };
  };

  function assertParseFail(assert, result, expectedPos, msg) {
    assert.notOk(result.success, msg);
    assert.equal(result.errorPos, expectedPos, msg);
  }

  var Parser = {
    Start: function() {
      QUnit.module("Parser");
      var VFT = Vex.Flow.Test;

      QUnit.test("Basic", VFT.Parser.basic);
      QUnit.test("Advanced", VFT.Parser.advanced);
      QUnit.test("Mixed", VFT.Parser.mixed);
    },

    basic: function(assert) {
      var grammar = new TestGrammar();
      var parser = new VF.Parser(grammar);

      grammar.BEGIN = function() { return { expect: [grammar.LITTLELINE, grammar.EOL] }; };
      
      var mustPass = [
        'first, second',
        'first,second',
        'first',
        'first,second, third'
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
    }
  };

  return Parser;  
})();

/**
 * VexFlow - PedalMarking Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.PedalMarking = (function() {
  var PedalMarking = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("PedalMarking");
      runTests("Simple Pedal 1", PedalMarking.simpleText);
      runTests("Simple Pedal 2", PedalMarking.simpleBracket);
      runTests("Simple Pedal 3", PedalMarking.simpleMixed);
      runTests("Release and Depress on Same Note 1", PedalMarking.releaseDepressOnSameNoteBracketed);
      runTests("Release and Depress on Same Note 2", PedalMarking.releaseDepressOnSameNoteMixed);
      runTests("Custom Text 1", PedalMarking.customText);
      runTests("Custom Text 2", PedalMarking.customTextMixed);
    },

    simpleText: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[2], notes0[3], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.TEXT);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    simpleBracket: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[2], notes0[3], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.BRACKET);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    simpleMixed: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[2], notes0[3], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.MIXED);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    releaseDepressOnSameNoteBracketed: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[3], notes0[3], notes1[1], notes1[1], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.BRACKET);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    releaseDepressOnSameNoteMixed: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes0[3], notes0[3], notes1[1], notes1[1],  notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.MIXED);

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();

    },

    customText: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.TEXT);

      pedal.setCustomText("una corda", "tre corda");

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();
    },

    customTextMixed: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave0 = new VF.Stave(10, 10, 250).addTrebleGlyph();
      var stave1 = new VF.Stave(260, 10, 250);
      stave0.setContext(ctx).draw();
      stave1.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }


      var notes0 = [
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: 1},
        {keys: ["b/4"], duration: "4", stem_direction: -1}
      ].map(newNote);

      var notes1 = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice0 = new VF.Voice(VF.TIME4_4).setStrict(false);
      var voice1 = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice0.addTickables(notes0);
      voice1.addTickables(notes1);

      new VF.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
      new VF.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      var pedal = new VF.PedalMarking([notes0[0], notes1[3]]);

      pedal.setStyle(VF.PedalMarking.Styles.MIXED);
      pedal.setCustomText("Sost. Ped.");

      voice0.draw(ctx, stave0);
      voice1.draw(ctx, stave1);
      pedal.setContext(ctx).draw();
    }
  };

  return PedalMarking;
})();
/**
 * VexFlow - Percussion Tests
 * Copyright Mike Corrigan 2012 <corrigan@gmail.com>
 */

VF.Test.Percussion = (function() {
  var Percussion = {
    Start: function() {
      QUnit.module("Percussion");
      Percussion.runBoth("Percussion Clef", Percussion.draw);
      Percussion.runBoth("Percussion Notes", Percussion.drawNotes);
      Percussion.runBoth("Percussion Basic0", Percussion.drawBasic0);
      Percussion.runBoth("Percussion Basic1", Percussion.drawBasic1);
      Percussion.runBoth("Percussion Basic2", Percussion.drawBasic2);
      Percussion.runBoth("Percussion Snare0", Percussion.drawSnare0);
      Percussion.runBoth("Percussion Snare1", Percussion.drawSnare1);
      Percussion.runBoth("Percussion Snare2", Percussion.drawSnare2);
    },

    runBoth: function(title, func) {
      VF.Test.runTests(title, func);
    },

    newModifier: function(s) {
      return new VF.Annotation(s).setFont("Arial", 12)
        .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
    },

    newArticulation: function(s) {
      return new VF.Articulation(s).setPosition(VF.Modifier.Position.ABOVE);
    },

    newTremolo: function(s) {
      return new VF.Tremolo(s);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);

      var stave = new VF.Stave(10, 10, 300);
      stave.addClef("percussion");
      stave.setContext(ctx);
      stave.draw();

      ok(true, "");
    },

    showNote: function(note_struct, stave, ctx, x) {
      var note = new VF.StaveNote(note_struct);
      var tickContext = new VF.TickContext();
      tickContext.addTickable(note).preFormat().setX(x);
      note.setContext(ctx).setStave(stave);
      note.draw();
      return note;
    },

    drawNotes: function(options, contextBuilder) {
      var notes = [
        { keys: ["g/5/d0"], duration: "q"},
        { keys: ["g/5/d1"], duration: "q"},
        { keys: ["g/5/d2"], duration: "q"},
        { keys: ["g/5/d3"], duration: "q"},
        { keys: ["x/"], duration: "w"},

        { keys: ["g/5/t0"], duration: "w"},
        { keys: ["g/5/t1"], duration: "q"},
        { keys: ["g/5/t2"], duration: "q"},
        { keys: ["g/5/t3"], duration: "q"},
        { keys: ["x/"], duration: "w"},

        { keys: ["g/5/x0"], duration: "w"},
        { keys: ["g/5/x1"], duration: "q"},
        { keys: ["g/5/x2"], duration: "q"},
        { keys: ["g/5/x3"], duration: "q"}
      ];
      expect(notes.length * 4);

      var ctx = new contextBuilder(options.canvas_sel,
        notes.length * 25 + 100, 240);

      // Draw two staves, one with up-stems and one with down-stems.
      for (var h = 0; h < 2; ++h) {
        var stave = new VF.Stave(10, 10 + h * 120, notes.length * 25 + 75);
        stave.addClef("percussion");
        stave.setContext(ctx);
        stave.draw();

        var showNote = VF.Test.Percussion.showNote;

        for (var i = 0; i < notes.length; ++i) {
          var note = notes[i];
          note.stem_direction = (h == 0 ? -1 : 1);
          var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

          ok(staveNote.getX() > 0, "Note " + i + " has X value");
          ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
        }
      }
    },

    drawBasic0: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");
      var stave = new VF.Stave(10, 10, 420);
      stave.addClef("percussion");
      stave.setContext(ctx);
      stave.draw();

      var notesUp = [
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" })
      ];
      var beamUp = new VF.Beam(notesUp.slice(0,8));
      var voiceUp = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceUp.addTickables(notesUp);

      var notesDown = [
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 })
      ];
      var beamDown1 = new VF.Beam(notesDown.slice(0,2));
      var beamDown2 = new VF.Beam(notesDown.slice(3,6));
      var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceDown.addTickables(notesDown);

      var formatter = new VF.Formatter().joinVoices([voiceUp, voiceDown]).
         formatToStave([voiceUp, voiceDown], stave);

      voiceUp.draw(ctx, stave);
      voiceDown.draw(ctx, stave);

      beamUp.setContext(ctx).draw();
      beamDown1.setContext(ctx).draw();
      beamDown2.setContext(ctx).draw();

      ok(true, "");
    },

    drawBasic1: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");
      var stave = new VF.Stave(10, 10, 420);
      stave.addClef("percussion");
      stave.setContext(ctx);
      stave.draw();

      var notesUp = [
        new VF.StaveNote({ keys: ["f/5/x2"], duration: "q" }),
        new VF.StaveNote({ keys: ["f/5/x2"], duration: "q" }),
        new VF.StaveNote({ keys: ["f/5/x2"], duration: "q" }),
        new VF.StaveNote({ keys: ["f/5/x2"], duration: "q" })
      ];
      var voiceUp = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceUp.addTickables(notesUp);

      var notesDown = [
        new VF.StaveNote({ keys: ["f/4"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 })
      ];
      var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceDown.addTickables(notesDown);

      var formatter = new VF.Formatter().joinVoices([voiceUp, voiceDown]).
          formatToStave([voiceUp, voiceDown], stave);

      voiceUp.draw(ctx, stave);
      voiceDown.draw(ctx, stave);

      ok(true, "");
    },

    drawBasic2: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");
      var stave = new VF.Stave(10, 10, 420);
      stave.addClef("percussion");
      stave.setContext(ctx);
      stave.draw();

      var notesUp = [
        new VF.StaveNote({ keys: ["a/5/x3"], duration: "8" }).
          addModifier(0, (new VF.Annotation("<")).setFont()),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" })
      ];
      var beamUp = new VF.Beam(notesUp.slice(1,8));
      var voiceUp = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceUp.addTickables(notesUp);

      var notesDown = [
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "8d",
          stem_direction: -1 }).addDotToAll(),
        new VF.StaveNote({ keys: ["c/5"], duration: "16",
          stem_direction: -1 })
      ];
      var beamDown1 = new VF.Beam(notesDown.slice(0,2));
      var beamDown2 = new VF.Beam(notesDown.slice(4,6));
      var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceDown.addTickables(notesDown);

      var formatter = new VF.Formatter().joinVoices([voiceUp, voiceDown]).
        formatToStave([voiceUp, voiceDown], stave);

      voiceUp.draw(ctx, stave);
      voiceDown.draw(ctx, stave);

      beamUp.setContext(ctx).draw();
      beamDown1.setContext(ctx).draw();
      beamDown2.setContext(ctx).draw();

      ok(true, "");
    },

    drawSnare0: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 600, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");

      var x = 10;
      var y = 10;
      var w = 280;

      {
        var stave = new VF.Stave(x, y, w);
        stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
        stave.setEndBarType(VF.Barline.type.SINGLE);
        stave.addClef("percussion");
        stave.setContext(ctx);
        stave.draw();

        var notesDown = [
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("a>")).
            addModifier(0, VF.Test.Percussion.newModifier("L")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("R")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("L")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("L"))
        ];
        var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
            resolution: VF.RESOLUTION });
        voiceDown.addTickables(notesDown);

        var formatter = new VF.Formatter().
          joinVoices([voiceDown]).formatToStave([voiceDown], stave);

        voiceDown.draw(ctx, stave);

        x += stave.width;
      }

      {
        var stave = new VF.Stave(x, y, w);
        stave.setBegBarType(VF.Barline.type.NONE);
        stave.setEndBarType(VF.Barline.type.REPEAT_END);
        stave.setContext(ctx);
        stave.draw();

        var notesDown = [
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("a>")).
            addModifier(0, VF.Test.Percussion.newModifier("R")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("L")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("R")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("R"))
        ];
        var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
          resolution: VF.RESOLUTION });
        voiceDown.addTickables(notesDown);

        var formatter = new VF.Formatter().
          joinVoices([voiceDown]).formatToStave([voiceDown], stave);

        voiceDown.draw(ctx, stave);

        x += stave.width;
      }

      ok(true, "");
    },

    drawSnare1: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 600, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");

      var x = 10;
      var y = 10;
      var w = 280;

      {
        var stave = new VF.Stave(x, y, w);
        stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
        stave.setEndBarType(VF.Barline.type.SINGLE);
        stave.addClef("percussion");
        stave.setContext(ctx);
        stave.draw();

        var notesDown = [
          new VF.StaveNote({ keys: ["g/5/x2"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("ah")),
          new VF.StaveNote({ keys: ["g/5/x2"], duration: "q",
            stem_direction: -1 }),
          new VF.StaveNote({ keys: ["g/5/x2"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("ah")),
          new VF.StaveNote({ keys: ["a/5/x3"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("a,")),
        ];
        var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
            resolution: VF.RESOLUTION });
        voiceDown.addTickables(notesDown);

        var formatter = new VF.Formatter().
          joinVoices([voiceDown]).formatToStave([voiceDown], stave);

        voiceDown.draw(ctx, stave);

        x += stave.width;
      }

      ok(true, "");
    },

    drawSnare2: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 600, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");

      var x = 10;
      var y = 10;
      var w = 280;

      {
        var stave = new VF.Stave(x, y, w);
        stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
        stave.setEndBarType(VF.Barline.type.SINGLE);
        stave.addClef("percussion");
        stave.setContext(ctx);
        stave.draw();

        var notesDown = [
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newTremolo(0)),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newTremolo(1)),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newTremolo(3)),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newTremolo(5)),
        ];
        var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
            resolution: VF.RESOLUTION });
        voiceDown.addTickables(notesDown);

        var formatter = new VF.Formatter().
          joinVoices([voiceDown]).formatToStave([voiceDown], stave);

        voiceDown.draw(ctx, stave);

        x += stave.width;
      }

      ok(true, "");
    }
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
      QUnit.module("Registry");
      var VFT = Vex.Flow.Test;

      QUnit.test("Register and Clear", VFT.Registry.registerAndClear);
      QUnit.test("Default Registry", VFT.Registry.defaultRegistry);
      QUnit.test("Multiple Classes", VFT.Registry.classes);
    },

    registerAndClear: function(assert) {
      var registry = new VF.Registry();
      var score = new VF.EasyScore({factory: VF.Factory.newFromSelector(null)});

      registry.register(score.notes('C4')[0], 'foobar');

      var foobar = registry.getElementById('foobar');
      assert.ok(foobar);
      assert.equal(foobar.getAttribute('id'), 'foobar');

      registry.clear();
      assert.notOk(registry.getElementById('foobar'));
      assert.throws(function() {registry.register(score.notes('C4'))});
      
      registry.clear();
      assert.ok(registry
        .register(score.notes('C4[id="boobar"]')[0])
        .getElementById('boobar'));
    },

    defaultRegistry: function(assert) {
      var registry = new VF.Registry();
      var score = new VF.EasyScore({factory: VF.Factory.newFromSelector(null)});

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
      var score = new VF.EasyScore({factory: VF.Factory.newFromSelector(null)});

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
    }
  };

  return Registry;  
})();

/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

VF.Test.Rests = (function() {
  var Rests = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Rests");
      runTests("Rests - Dotted", Rests.basic);
      runTests("Auto Align Rests - Beamed Notes Stems Up", Rests.beamsUp);
      runTests("Auto Align Rests - Beamed Notes Stems Down", Rests.beamsDown);
      runTests("Auto Align Rests - Tuplets Stems Up", Rests.tuplets);
      runTests("Auto Align Rests - Tuplets Stems Down", Rests.tupletsdown);
      runTests("Auto Align Rests - Single Voice (Default)", Rests.staveRests);
      runTests("Auto Align Rests - Single Voice (Align All)", Rests.staveRestsAll);
      runTests("Auto Align Rests - Multi Voice", Rests.multi);
    },

    setupContext: function(options, contextBuilder, x, y) {
      var ctx = new contextBuilder(options.canvas_sel, x || 350, y || 150);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, x || 350).addTrebleGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    basic: function(options, contextBuilder) {
      var c = VF.Test.Rests.setupContext(options, contextBuilder, 700);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "wr"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "hr"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "16r"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "32r"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "64r"}).addDotToAll()
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);

      voice.setStrict(false);
      voice.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice.draw(c.context, c.stave);

      ok(true, "Dotted Rest Test");
    },

    beamsUp: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["b/4","d/5","a/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["b/4","d/5","a/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),

      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      var beam1 = new VF.Beam(notes.slice(0, 4));
      var beam2 = new VF.Beam(notes.slice(4, 8));
      var beam3 = new VF.Beam(notes.slice(8,12));


      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Beams Up Test");
    },

    beamsDown: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["b/4","d/5","a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["b/4","d/5","a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),

      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      var beam1 = new VF.Beam(notes.slice(0, 4));
      var beam2 = new VF.Beam(notes.slice(4, 8));
      var beam3 = new VF.Beam(notes.slice(8, 12));

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Beams Down Test");
    },

    tuplets: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["a/5"], stem_direction: 1, duration: "qr"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "q"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
      ];

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6));
      var tuplet3 = new VF.Tuplet(notes.slice(6, 9));
      var tuplet4 = new VF.Tuplet(notes.slice(9, 12));
      tuplet1.setTupletLocation(VF.Tuplet.LOCATION_TOP);
      tuplet2.setTupletLocation(VF.Tuplet.LOCATION_TOP);
      tuplet3.setTupletLocation(VF.Tuplet.LOCATION_TOP);
      tuplet4.setTupletLocation(VF.Tuplet.LOCATION_TOP);

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();
      tuplet4.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Tuplets Stem Up Test");
    },

    tupletsdown: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/5"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
      ];

      var beam1 = new VF.Beam(notes.slice(0, 3));
      var beam2 = new VF.Beam(notes.slice(3, 6));
      var beam3 = new VF.Beam(notes.slice(6, 9));
      var beam4 = new VF.Beam(notes.slice(9, 12));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6));
      var tuplet3 = new VF.Tuplet(notes.slice(6, 9));
      var tuplet4 = new VF.Tuplet(notes.slice(9, 12));
      tuplet1.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet2.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet3.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet4.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();
      tuplet4.setContext(c.context).draw();

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();
      beam4.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Tuplets Stem Down Test");
    },

    staveRests: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "q"}),

        newNote({ keys: ["d/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
      ];

      var beam1 = new VF.Beam(notes.slice(5, 9));
      var tuplet = new VF.Tuplet(notes.slice(9, 12));
      tuplet.setTupletLocation(VF.Tuplet.LOCATION_TOP);

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);
      tuplet.setContext(c.context).draw();
      beam1.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Default Test");
    },


    staveRestsAll: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "q"}),

        newNote({ keys: ["d/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
      ];

      var beam1 = new VF.Beam(notes.slice(5, 9));
      var tuplet = new VF.Tuplet(notes.slice(9, 12));
      tuplet.setTupletLocation(VF.Tuplet.LOCATION_TOP);

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      // Set option to position rests near the notes in the voice
      new VF.Formatter.FormatAndDraw(c.context, c.stave, notes, {align_rests: true});

      voice1.draw(c.context, c.stave);
      tuplet.setContext(c.context).draw();
      beam1.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Align All Test");
    },

    multi: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) {
        return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) {
        return new VF.StringNumber(num).setPosition(pos);}
      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.addTimeSignature("4/4");
      stave.draw();

      var notes = [
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["b/4"], duration: "qr" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" }),
        newNote({ keys: ["b/4"], duration: "qr" })
      ];

      var notes2 = [
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      // Set option to position rests near the notes in each voice
      var formatter = new VF.Formatter().
        joinVoices([voice, voice2]).
        format([voice, voice2], 400, {align_rests: true});

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice2.draw(c, stave);
      beam2_1.setContext(c).draw();
      beam2_2.setContext(c).draw();
      voice.draw(c, stave);

      ok(true, "Strokes Test Multi Voice");
    }
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
      QUnit.module("Rhythm");
      runTests("Rhythm Draw - slash notes", Rhythm.drawBasic);
      runTests("Rhythm Draw - beamed slash notes", Rhythm.drawBeamedSlashNotes);
      runTests("Rhythm Draw - beamed slash notes, some rests", Rhythm.drawSlashAndBeamAndRests);
      runTests("Rhythm Draw - 16th note rhythm with scratches", Rhythm.drawSixtenthWithScratches);
      runTests("Rhythm Draw - 32nd note rhythm with scratches", Rhythm.drawThirtySecondWithScratches);
    },

    drawSlash: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 180);
      var stave = new VF.Stave(10, 10, 350);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { keys: ["b/4"], duration: "ws", stem_direction: -1},
        { keys: ["b/4"], duration: "hs", stem_direction: -1},
        { keys: ["b/4"], duration: "qs", stem_direction: -1},
        { keys: ["b/4"], duration: "8s", stem_direction: -1},
        { keys: ["b/4"], duration: "16s", stem_direction: -1},
        { keys: ["b/4"], duration: "32s", stem_direction: -1},
        { keys: ["b/4"], duration: "64s", stem_direction: -1}
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, "Note " + i + " has X value");
        ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
      }
    },

    drawBasic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 150);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("C");
      staveBar1.setContext(ctx).draw();

      var notesBar1 = [
        new VF.StaveNote(
            { keys: ["b/4"], duration: "1s", stem_direction: -1 })
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
            { keys: ["b/4"], duration: "2s",stem_direction: -1 }),
        new VF.StaveNote(
            { keys: ["b/4"], duration: "2s",stem_direction: -1 })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);


      // bar 3 - juxtaposing second bar next to first bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x,
                                         staveBar2.y, 170);
      staveBar3.setContext(ctx).draw();

      // bar 3
      var notesBar3 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "4s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "4s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "4s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "4s",
                                 stem_direction: -1 })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

      // bar 4 - juxtaposing second bar next to first bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x,
                                         staveBar3.y, 200);
      staveBar4.setContext(ctx).draw();

      // bar 4
      var notesBar4 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 })

      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
      expect(0);
    },

    drawBeamedSlashNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("C");
      staveBar1.setContext(ctx).draw();


      // bar 4
      var notesBar1_part1 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 })
      ];

      var notesBar1_part2 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 })

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

    drawSlashAndBeamAndRests : function(options,
                                                              contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("F");
      staveBar1.setContext(ctx).draw();

      // bar 1
      var notesBar1_part1 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",stem_direction: -1 })
      ];

      notesBar1_part1[0].addModifier(0, (new VF.Annotation("C7")).setFont(
            "Times", VF.Test.Font.size + 2));

      var notesBar1_part2 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8r",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8r",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8r",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 })

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
        new VF.StaveNote({ keys: ["b/4"], duration: "1s",
                                 stem_direction: -1 })
      ];

      notesBar2[0].addModifier(0, (new VF.Annotation("F")).setFont("Times",
              VF.Test.Font.size + 2));
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      expect(0);
    },

    drawSixtenthWithScratches : function(options,
                                                               contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("F");
      staveBar1.setContext(ctx).draw();

      // bar 1
      var notesBar1_part1 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16m",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 })
      ];

      var notesBar1_part2 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "16m",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16r",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 })

      ];

      notesBar1_part1[0].addModifier(0, (new VF.Annotation("C7")).setFont(
            "Times", VF.Test.Font.size + 3));

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


    drawThirtySecondWithScratches : function(options,
                                                                   contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("F");
      staveBar1.setContext(ctx).draw();

      // bar 1
      var notesBar1_part1 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32m",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32m",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32r",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 })

      ];

      notesBar1_part1[0].addModifier(0, (new VF.Annotation("C7")).setFont(
            "Times", VF.Test.Font.size + 3));

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1);

        // Render beams
      beam1.setContext(ctx).draw();

      expect(0);
    }
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
      QUnit.module("Stave");
      test("StaveModifiers SortByCategory", Stave.sortByCategory);
      runTests("Stave Draw Test", Stave.draw);
      runTests("Open Stave Draw Test", Stave.drawOpenStave);
      runTests("Vertical Bar Test", Stave.drawVerticalBar);
      runTests("Multiple Stave Barline Test", Stave.drawMultipleMeasures);
      runTests("Multiple Stave Repeats Test", Stave.drawRepeats);
      runTests("Multiple Staves Volta Test", Stave.drawVoltaTest);
      runTests("Tempo Test", Stave.drawTempo);
      runTests("Single Line Configuration Test", Stave.configureSingleLine);
      runTests("Batch Line Configuration Test", Stave.configureAllLines);
      runTests("Stave Text Test", Stave.drawStaveText);
      runTests("Multiple Line Stave Text Test", Stave.drawStaveTextMultiLine);
      runTests("Factory API", Stave.factoryAPI);
    },

    sortByCategory: function(options) {
      var stave = new VF.Stave(0, 0, 300);
      var clef0 = new VF.Clef("treble");
      var clef1 = new VF.Clef("alto");
      var clef2 = new VF.Clef("bass");
      var time0 = new VF.TimeSignature("C");
      var time1 = new VF.TimeSignature("C|");
      var time2 = new VF.TimeSignature("9/8");
      var key0 = new VF.KeySignature("G");
      var key1 = new VF.KeySignature("F");
      var key2 = new VF.KeySignature("D");
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
      var ctx = new contextBuilder(options.canvas_sel, 400, 150);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();

      equal(stave.getYForNote(0), 100, "getYForNote(0)");
      equal(stave.getYForLine(5), 100, "getYForLine(5)");
      equal(stave.getYForLine(0), 50, "getYForLine(0) - Top Line");
      equal(stave.getYForLine(4), 90, "getYForLine(4) - Bottom Line");

      ok(true, "all pass");
    },

    drawOpenStave: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 350);
      var stave = new VF.Stave(10, 10, 300, {left_bar: false});
      stave.setContext(ctx);
      stave.draw();

      var stave = new VF.Stave(10, 150, 300, {right_bar: false});
      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    drawVerticalBar: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();
      stave.drawVerticalBar(50, true);
      stave.drawVerticalBar(150, false);
      stave.drawVertical(250, true);
      stave.drawVertical(300);

      ok(true, "all pass");
    },

    drawMultipleMeasures: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 550, 200);

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 200);
      staveBar1.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.setSection("A", 0);
      staveBar1.addClef("treble").setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["b/4"], duration: "qr" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setSection("B", 0);
      staveBar2.setEndBarType(VF.Barline.type.END);
      staveBar2.setContext(ctx).draw();

      var notesBar2_part1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ];

      var notesBar2_part2 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
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
      var ctx = contextBuilder(options.canvas_sel, 750, 120);

      // bar 1
      var staveBar1 = new VF.Stave(10, 0, 250);
      staveBar1.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar1.setEndBarType(VF.Barline.type.REPEAT_END);
      staveBar1.addClef("treble");
      staveBar1.addKeySignature("A");
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["b/4"], duration: "qr" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
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
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ];

      var notesBar2_part2 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ];
      notesBar2_part2[0].addAccidental(0, new VF.Accidental("#"));
      notesBar2_part2[1].addAccidental(0, new VF.Accidental("#"));
      notesBar2_part2[3].addAccidental(0, new VF.Accidental("b"));
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
      var notesBar3 = [new VF.StaveNote({ keys: ["d/5"], duration: "wr" })];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

      // bar 4 - juxtaposing third bar next to third bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x,
                                         staveBar3.y, 250 - staveBar1.getModifierXShift());
      staveBar4.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar4.setEndBarType(VF.Barline.type.REPEAT_END);
      staveBar4.setContext(ctx).draw();
      var notesBar4 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["b/4"], duration: "qr" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);

    },

    drawVoltaTest: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 725, 200);

      // bar 1
      var mm1 = new VF.Stave(10, 50, 125);
      mm1.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      mm1.setRepetitionTypeLeft(VF.Repetition.type.SEGNO_LEFT, -18);
      mm1.addClef("treble");
      mm1.addKeySignature("A")
      mm1.setMeasure(1);
      mm1.setSection("A", 0);
      mm1.setContext(ctx).draw();
      var notesmm1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm1, notesmm1);

      // bar 2 - juxtapose second measure
      var mm2 = new VF.Stave(mm1.width + mm1.x, mm1.y, 60);
      mm2.setRepetitionTypeRight(VF.Repetition.type.CODA_RIGHT, 0);
      mm2.setMeasure(2);
      mm2.setContext(ctx).draw();
      var notesmm2 = [
        new VF.StaveNote({ keys: ["d/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm2, notesmm2);

      // bar 3 - juxtapose third measure
      var mm3 = new VF.Stave(mm2.width + mm2.x, mm1.y, 60);
      mm3.setVoltaType(VF.Volta.type.BEGIN, "1.", -5);
      mm3.setMeasure(3);
      mm3.setContext(ctx).draw();
      var notesmm3 = [
        new VF.StaveNote({ keys: ["e/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm3, notesmm3);

      // bar 4 - juxtapose fourth measure
      var mm4 = new VF.Stave(mm3.width + mm3.x, mm1.y, 60);
      mm4.setVoltaType(VF.Volta.type.MID, "", -5);
      mm4.setMeasure(4);
      mm4.setContext(ctx).draw();
      var notesmm4 = [
        new VF.StaveNote({ keys: ["f/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm4, notesmm4);

      // bar 5 - juxtapose fifth measure
      var mm5 = new VF.Stave(mm4.width + mm4.x, mm1.y, 60);
      mm5.setEndBarType(VF.Barline.type.REPEAT_END);
      mm5.setVoltaType(VF.Volta.type.END, "", -5);
      mm5.setMeasure(5);
      mm5.setContext(ctx).draw();
      var notesmm5 = [
        new VF.StaveNote({ keys: ["g/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm5, notesmm5);

      // bar 6 - juxtapose sixth measure
      var mm6 = new VF.Stave(mm5.width + mm5.x, mm1.y, 60);
      mm6.setVoltaType(VF.Volta.type.BEGIN_END, "2.", -5);
      mm6.setEndBarType(VF.Barline.type.DOUBLE);
      mm6.setMeasure(6);
      mm6.setContext(ctx).draw();
      var notesmm6 = [
        new VF.StaveNote({ keys: ["a/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm6, notesmm6);

      // bar 7 - juxtapose seventh measure
      var mm7 = new VF.Stave(mm6.width + mm6.x, mm1.y, 60);
      mm7.setMeasure(7);
      mm7.setSection("B", 0);
      mm7.setContext(ctx).draw();
      var notesmm7 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "w" })
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
        new VF.StaveNote({ keys: ["c/5"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm8, notesmm8);

      // bar 9 - juxtapose ninth measure
      var mm9 = new VF.Stave(mm8.width + mm8.x + 20, mm1.y, 125);
      mm9.setEndBarType(VF.Barline.type.END);
      mm9.setRepetitionTypeLeft(VF.Repetition.type.CODA_LEFT, 25);
      mm9.addClef("treble");
      mm9.addKeySignature("A");
      mm9.setMeasure(9);
      mm9.setContext(ctx).draw();
      var notesmm9 = [
        new VF.StaveNote({ keys: ["d/5"], duration: "w" })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm9, notesmm9);
    },

    drawTempo: function(options, contextBuilder) {
      expect(0);

      var ctx = contextBuilder(options.canvas_sel, 725, 350);
      var padding = 10, x = 0, y = 50;

      function drawTempoStaveBar(width, tempo, tempo_y, notes) {
        var staveBar = new VF.Stave(padding + x, y, width);
        if (x == 0) staveBar.addClef("treble");
        staveBar.setTempo(tempo, tempo_y);
        staveBar.setContext(ctx).draw();

        var notesBar = notes || [
          new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
          new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
          new VF.StaveNote({ keys: ["b/4"], duration: "q" }),
          new VF.StaveNote({ keys: ["c/4"], duration: "q" })
        ];

        VF.Formatter.FormatAndDraw(ctx, staveBar, notesBar);
        x += width;
      }

      drawTempoStaveBar(120, { duration: "q", dots: 1, bpm: 80 }, 0);
      drawTempoStaveBar(100, { duration: "8", dots: 2, bpm: 90 }, 0);
      drawTempoStaveBar(100, { duration: "16", dots: 1, bpm: 96 }, 0);
      drawTempoStaveBar(100, { duration: "32", bpm: 70 }, 0);
      drawTempoStaveBar(250, { name: "Andante", note: "8", bpm: 120 }, -20, [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/5"], duration: "8" }),
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ]);

      x = 0; y += 150;

      drawTempoStaveBar(120, { duration: "w", bpm: 80 }, 0);
      drawTempoStaveBar(100, { duration: "h", bpm: 90 }, 0);
      drawTempoStaveBar(100, { duration: "q", bpm: 96 }, 0);
      drawTempoStaveBar(100, { duration: "8", bpm: 70 }, 0);
      drawTempoStaveBar(250, { name: "Andante grazioso" }, 0, [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ]);
    },

    configureSingleLine: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setConfigForLine(0, { visible: true })
        .setConfigForLine(1, { visible: false })
        .setConfigForLine(2, { visible: true })
        .setConfigForLine(3, { visible: false })
        .setConfigForLine(4, { visible: true });
      stave.setContext(ctx).draw();

      var config = stave.getConfigForLines();
      equal(config[0].visible, true, "getLinesConfiguration() - Line 0");
      equal(config[1].visible, false, "getLinesConfiguration() - Line 1");
      equal(config[2].visible, true, "getLinesConfiguration() - Line 2");
      equal(config[3].visible, false, "getLinesConfiguration() - Line 3");
      equal(config[4].visible, true, "getLinesConfiguration() - Line 4");

      ok(true, "all pass");
    },

    configureAllLines: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setConfigForLines([
        { visible: false },
        null,
        { visible: false },
        { visible: true },
        { visible: false }
      ]).setContext(ctx).draw();

      var config = stave.getConfigForLines();
      equal(config[0].visible, false, "getLinesConfiguration() - Line 0");
      equal(config[1].visible, true, "getLinesConfiguration() - Line 1");
      equal(config[2].visible, false, "getLinesConfiguration() - Line 2");
      equal(config[3].visible, true, "getLinesConfiguration() - Line 3");
      equal(config[4].visible, false, "getLinesConfiguration() - Line 4");

      ok(true, "all pass");
    },

    drawStaveText: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 900, 140);
      var stave = new VF.Stave(300, 10, 300);
      stave.setText("Violin", VF.Modifier.Position.LEFT);
      stave.setText("Right Text", VF.Modifier.Position.RIGHT);
      stave.setText("Above Text", VF.Modifier.Position.ABOVE);
      stave.setText("Below Text", VF.Modifier.Position.BELOW);
      stave.setContext(ctx).draw();

      ok(true, "all pass");
    },

    drawStaveTextMultiLine: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 900, 200);
      var stave = new VF.Stave(300, 40, 300);
      stave.setText("Violin", VF.Modifier.Position.LEFT, {shift_y: -10});
      stave.setText("2nd line", VF.Modifier.Position.LEFT, {shift_y: 10});
      stave.setText("Right Text", VF.Modifier.Position.RIGHT, {shift_y: -10});
      stave.setText("2nd line", VF.Modifier.Position.RIGHT, {shift_y: 10});
      stave.setText("Above Text", VF.Modifier.Position.ABOVE, {shift_y: -10});
      stave.setText("2nd line", VF.Modifier.Position.ABOVE, {shift_y: 10});
      stave.setText("Left Below Text", VF.Modifier.Position.BELOW,
        {shift_y: -10, justification: VF.TextNote.Justification.LEFT});
      stave.setText("Right Below Text", VF.Modifier.Position.BELOW,
        {shift_y: 10, justification: VF.TextNote.Justification.RIGHT});
      stave.setContext(ctx).draw();

      ok(true, "all pass");
    },

    factoryAPI: function(options) {
      var vf = VF.Test.makeFactory(options, 900, 200);
      var stave = vf.Stave({x: 300, y: 40, width: 300});
      stave.setText("Violin", VF.Modifier.Position.LEFT, {shift_y: -10});
      stave.setText("2nd line", VF.Modifier.Position.LEFT, {shift_y: 10});
      vf.draw();

      ok(true, "all pass");
    }
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
      QUnit.module("StaveConnector");
      runTests("Single Draw Test", StaveConnector.drawSingle);
      runTests("Single Draw Test, 1px Stave Line Thickness", StaveConnector.drawSingle1pxBarlines);
      runTests("Single Both Sides Test", StaveConnector.drawSingleBoth);
      runTests("Double Draw Test", StaveConnector.drawDouble);
      runTests("Bold Double Line Left Draw Test", StaveConnector.drawRepeatBegin);
      runTests("Bold Double Line Right Draw Test", StaveConnector.drawRepeatEnd);
      runTests("Thin Double Line Right Draw Test", StaveConnector.drawThinDouble);
      runTests("Bold Double Lines Overlapping Draw Test", StaveConnector.drawRepeatAdjacent);
      runTests("Bold Double Lines Offset Draw Test", StaveConnector.drawRepeatOffset);
      runTests("Bold Double Lines Offset Draw Test 2", StaveConnector.drawRepeatOffset2);
      runTests("Brace Draw Test", StaveConnector.drawBrace);
      runTests("Brace Wide Draw Test", StaveConnector.drawBraceWide);
      runTests("Bracket Draw Test", StaveConnector.drawBracket);
      runTests("Combined Draw Test", StaveConnector.drawCombined);
    },

    drawSingle: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
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

      ok(true, "all pass");
    },

    drawSingle1pxBarlines: function(options, contextBuilder) {
      VF.STAVE_LINE_THICKNESS = 1;
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
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

      ok(true, "all pass");
    },

    drawSingleBoth: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
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

      ok(true, "all pass");
    },

    drawDouble: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
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

      ok(true, "all pass");
    },

    drawBrace: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 450, 300);
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

      ok(true, "all pass");
    },

    drawBraceWide: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
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

      ok(true, "all pass");
    },

    drawBracket: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
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

      ok(true, "all pass");
    },

    drawRepeatBegin: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
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

      ok(true, "all pass");
    },

    drawRepeatEnd: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
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

      ok(true, "all pass");
    },

    drawThinDouble: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
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

      ok(true, "all pass");
    },

    drawRepeatAdjacent: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
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

      ok(true, "all pass");
    },

    drawRepeatOffset2: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
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

      ok(true, "all pass");
    },
    drawRepeatOffset: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 300);
      var stave = new VF.Stave(25, 10, 150);
      var stave2 = new VF.Stave(25, 120, 150);
      var stave3 = new VF.Stave(175, 10, 150);
      var stave4 = new VF.Stave(175, 120, 150);
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

      ok(true, "all pass");
    },

    drawCombined: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 550, 700);
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

      ok(true, "all pass");
    }
  };

  return StaveConnector;
})();

/**
 * VexFlow - StaveHairpin Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 * Author: Raffaele Viglianti, 2012
 */

VF.Test.StaveHairpin = (function() {
  var StaveHairpin = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module("StaveHairpin");
      runTests("Simple StaveHairpin", StaveHairpin.simple);
      runTests("Horizontal Offset StaveHairpin", StaveHairpin.ho);
      runTests("Vertical Offset StaveHairpin", StaveHairpin.vo);
      runTests("Height StaveHairpin", StaveHairpin.height);
    },

    drawHairpin: function(notes, stave, ctx, type, position, options) {
      var hp = new VF.StaveHairpin(notes, type);

      hp.setContext(ctx);
      hp.setPosition(position);
      if (options != undefined) {
        hp.setRenderOptions(options);
      }
      hp.draw();
    },

    hairpinNotes: function(notes, options) {
      var ctx = new options.contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 350).setContext(ctx).draw();

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 250);
      voice.draw(ctx, stave);

      return [stave, ctx];
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
      ]

      var render = VF.Test.StaveHairpin.hairpinNotes(notes, options);
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 4);
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[1], last_note:notes[3]}, render[0], render[1], 2, 3);

      ok(true, "Simple Test");
    },

    ho: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
      ]

      var render = VF.Test.StaveHairpin.hairpinNotes(notes, options);
      var render_options = {
          height: 10,
          vo: 20, //vertical offset
          left_ho: 20, //left horizontal offset
          right_ho: -20 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 3, render_options);

      var render_options = {
          height: 10,
          y_shift: 0, //vertical offset
          left_shift_px: 0, //left horizontal offset
          right_shift_px: 120 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[3], last_note:notes[3]}, render[0], render[1], 2, 4, render_options);

      ok(true, "Horizontal Offset Test");
    },

    vo: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
      ]

      var render = VF.Test.StaveHairpin.hairpinNotes(notes, options);
      var render_options = {
          height: 10,
          y_shift: 0, //vertical offset
          left_shift_px: 0, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 4, render_options);

      var render_options = {
          height: 10,
          y_shift: -15, //vertical offset
          left_shift_px: 2, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[2], last_note:notes[3]}, render[0], render[1], 2, 4, render_options);

      ok(true, "Vertical Offset Test");
    },

    height: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "q"})
      ]

      var render = VF.Test.StaveHairpin.hairpinNotes(notes, options);
      var render_options = {
          height: 10,
          y_shift: 0, //vertical offset
          left_shift_px: 0, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[0], last_note:notes[2]}, render[0], render[1], 1, 4, render_options);

      var render_options = {
          height: 15,
          y_shift: 0, //vertical offset
          left_shift_px: 2, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };
      VF.Test.StaveHairpin.drawHairpin({first_note:notes[2], last_note:notes[3]}, render[0], render[1], 2, 4, render_options);

      ok(true, "Height Test");
    }
  };

  return StaveHairpin;
})();
/**
 * VexFlow - StaveLine Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
VF.Test.StaveLine = (function() {
  var StaveLine = {
    Start: function() {
      QUnit.module("StaveLine");
      VF.Test.runTests("Simple StaveLine", VF.Test.StaveLine.simple0);
      VF.Test.runTests("StaveLine Arrow Options", VF.Test.StaveLine.simple1);
    },

    simple0: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 650, 140);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave = new VF.Stave(10, 10, 550).addTrebleGlyph();
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        {keys: ["c/4"], duration: "4", clef: "treble"},
        {keys: ["c/5"], duration: "4", clef: "treble"},
        {keys: ["c/4", "g/4", "b/4"], duration: "4", clef: "treble"},
        {keys: ["f/4", "a/4", "f/5"], duration: "4", clef: "treble"}
      ].map(newNote);

      var staveLine = new VF.StaveLine({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0]
      });

      var staveLine2 = new VF.StaveLine({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [2, 1, 0],
        last_indices: [0, 1, 2]
      });
      staveLine2.render_options.line_dash = [10,10];

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      staveLine.setText('gliss.');
      staveLine.setFont({
        family: "serif",
        size: 12,
        weight: "italic"
      });

      voice.draw(ctx, stave);
      staveLine.setContext(ctx).draw();
      staveLine2.setContext(ctx).draw();

      ok(true);
    },


    simple1: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 770, 140);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave = new VF.Stave(10, 10, 750).addTrebleGlyph();
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        {keys: ["c#/5", "d/5"], duration: "4", clef: "treble", stem_direction: -1},
        {keys: ["c/4"], duration: "4", clef: "treble"},
        {keys: ["c/4", "e/4", "g/4"], duration: "4", clef: "treble"},
        {keys: ["f/4", "a/4", "c/5"], duration: "4", clef: "treble"},
        {keys: ["c/4",], duration: "4", clef: "treble"},
        {keys: ["c#/5", "d/5"], duration: "4", clef: "treble", stem_direction: -1},
        {keys: ["c/4", "d/4", "g/4"], duration: "4", clef: "treble"},
        {keys: ["f/4", "a/4", "c/5"], duration: "4", clef: "treble"}
      ].map(newNote);

      notes[0].addDotToAll();
      notes[1].addAccidental(0, new VF.Accidental("#"));
      notes[3].addAccidental(2, new VF.Accidental("#"));
      notes[4].addAccidental(0, new VF.Accidental("#"));
      notes[7].addAccidental(2, new VF.Accidental("#"));

      var staveLine0 = new VF.StaveLine({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0]
      });

      var staveLine4 = new VF.StaveLine({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [1],
        last_indices: [1]
      });

      var staveLine1 = new VF.StaveLine({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0]
      });

      var staveLine2 = new VF.StaveLine({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [1],
        last_indices: [0]
      });

      var staveLine3 = new VF.StaveLine({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [2],
        last_indices: [2]
      });

      staveLine0.render_options.draw_end_arrow = true;
      staveLine0.setText('Left');
      staveLine0.render_options.text_justification = 1;
      staveLine0.render_options.text_position_vertical = 2;

      staveLine1.render_options.draw_end_arrow = true;
      staveLine1.render_options.arrowhead_length = 30;
      staveLine1.render_options.line_width = 5;
      staveLine1.setText('Center');
      staveLine1.render_options.text_justification = 2;
      staveLine1.render_options.text_position_vertical = 2;

      staveLine4.render_options.line_width = 2;
      staveLine4.render_options.draw_end_arrow = true;
      staveLine4.render_options.draw_start_arrow = true;
      staveLine4.render_options.arrowhead_angle = 0.5;
      staveLine4.render_options.arrowhead_length = 20;
      staveLine4.setText('Right');
      staveLine4.render_options.text_justification = 3;
      staveLine4.render_options.text_position_vertical = 2;

      staveLine2.render_options.draw_start_arrow = true;
      staveLine2.render_options.line_dash = [5, 4];

      staveLine3.render_options.draw_end_arrow = true;
      staveLine3.render_options.draw_start_arrow = true;
      staveLine3.render_options.color = "red";
      staveLine3.setText('Top');
      staveLine3.render_options.text_position_vertical = 1;

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      voice.draw(ctx, stave);

      staveLine0.setContext(ctx).draw();
      staveLine1.setContext(ctx).draw();
      staveLine2.setContext(ctx).draw();
      staveLine3.setContext(ctx).draw();
      staveLine4.setContext(ctx).draw();

      ok(true);
    }
  };

  return StaveLine;
})();
/**
 * VexFlow - StaveModifier Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StaveModifier = (function() {
  var StaveModifier = {
    Start: function() {
      QUnit.module("StaveModifier");
      VF.Test.runTests("Stave Draw Test", VF.Test.Stave.draw);
      VF.Test.runTests("Vertical Bar Test",
          VF.Test.Stave.drawVerticalBar);
      VF.Test.runTests("Begin & End StaveModifier Test",
          StaveModifier.drawBeginAndEnd);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();

      equal(stave.getYForNote(0), 100, "getYForNote(0)");
      equal(stave.getYForLine(5), 100, "getYForLine(5)");
      equal(stave.getYForLine(0), 50, "getYForLine(0) - Top Line");
      equal(stave.getYForLine(4), 90, "getYForLine(4) - Bottom Line");

      ok(true, "all pass");
    },

    drawVerticalBar: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();
      stave.drawVerticalBar(100);
      stave.drawVerticalBar(150);
      stave.drawVerticalBar(300);

      ok(true, "all pass");
    },

    drawBeginAndEnd: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 240);
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

      ok(true, "all pass");
    }
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
      runTests('StaveNote Draw - StaveNote Styles', StaveNote.drawNoteStyles);
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
        var durationString  = testData[0];
        var expectedBeats = testData[1];
        var expectedNoteType = testData[2];
        var note = new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: durationString });
        equal(note.getTicks().value(), BEAT * expectedBeats, testName + ' must have ' + expectedBeats + ' beats');
        equal(note.getNoteType(), expectedNoteType, 'Note type must be ' + expectedNoteType);
      });

      throws(function() {
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '8.7dddm' });
      }, /BadArguments/, "Invalid note duration '8.7' throws BadArguments exception");

      throws(function() {
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2Z' });
      }, /BadArguments/, "Invalid note type 'Z' throws BadArguments exception");

      throws(function() {
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2dddZ' });
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
        var noteData  = testData[0];
        var expectedBeats = testData[1];
        var expectedNoteType = testData[2];

        noteData.keys = ['c/4', 'e/4', 'g/4'];

        var note = new VF.StaveNote(noteData);
        equal(note.getTicks().value(), BEAT * expectedBeats, testName + ' must have ' + expectedBeats + ' beats');
        equal(note.getNoteType(), expectedNoteType, 'Note type must be ' + expectedNoteType);
      });

      throws(function() {
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '8.7dddm' });
      }, /BadArguments/, "Invalid note duration '8.7' throws BadArguments exception");

      throws(function() {
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2Z' });
      }, /BadArguments/, "Invalid note type 'Z' throws BadArguments exception");

      throws(function() {
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '2dddZ' });
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
        })
      };

      var stemUpDisplacements = [false, true, false];
      var stemDownDisplacements =  [true, false, false];

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

      var tickContext = new VF.TickContext()
        .addTickable(note)
        .preFormat()
        .setX(10)
        .setPadding(0);

      VF.Test.almostEqual(tickContext.getWidth(), 17.3815, 0.0001);
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

      var ctx = new contextBuilder(options.canvas_sel, 700, 180);
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

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        // If this is an interactivity test, then attempt to attach mouseover
        // and mouseout handlers to the notes.
        if (options.params.ui) {
          var item = staveNote.getAttribute('el');
          item.addEventListener('mouseover', function() {
            Vex.forEach($(this).find('*'), function(child) {
              child.setAttribute('fill', 'green');
              child.setAttribute('stroke', 'green');
            });
          }, false);
          item.addEventListener('mouseout', function() {
            Vex.forEach($(this).find('*'), function(child) {
              child.setAttribute('fill', 'black');
              child.setAttribute('stroke', 'black');
            });
          }, false);
        }
        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    drawBoundingBoxes: function(options, contextBuilder) {
      var clef = options.params.clef;
      var octaveShift = options.params.octaveShift;
      var restKey = options.params.restKey;

      var ctx = new contextBuilder(options.canvas_sel, 700, 180);
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
      var ctx = new contextBuilder(options.canvas_sel, 600, 280);
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
      var ctx = new contextBuilder(options.canvas_sel, 700, 140);
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
      var ctx = new contextBuilder(options.canvas_sel, 300, 180);
      var stave = new VF.Stave(10, 10, 280);
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
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    },

    drawSlash: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 700, 180);
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
      var ctx = new contextBuilder(options.canvas_sel, 300, 280);
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
      var ctx = new contextBuilder(options.canvas_sel, 300, 280);
      var stave = new VF.Stave(10, 0, 100);
      ctx.scale(3, 3);

      var note = new VF.StaveNote({ keys: ['g/4', 'bb/4', 'd/5'], duration: 'q' })
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
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);
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
      var ctx = new contextBuilder(options.canvas_sel, 800, 160);
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
        newNote({ keys: ['d/5'], duration: '32',  stem_direction: -1 }).addDotToAll(),
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
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);
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
      var ctx = new contextBuilder(options.canvas_sel, 800, 160);
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
        newNote({ keys: ['d/5'], duration: '32',  stem_direction: -1 }).addDotToAll(),
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
  var StaveTie = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module("StaveTie");
      runTests("Simple StaveTie", StaveTie.simple);
      runTests("Chord StaveTie", StaveTie.chord);
      runTests("Stem Up StaveTie", StaveTie.stemUp);
      runTests("No End Note", StaveTie.noEndNote);
      runTests("No Start Note", StaveTie.noStartNote);
      runTests("Set Direction Down", StaveTie.setDirectionDown);
      runTests("Set Direction Up", StaveTie.setDirectionUp);

    },

    tieNotes: function(notes, indices, stave, ctx, direction) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 250);
      voice.draw(ctx, stave);

      var tie = new VF.StaveTie({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: indices,
        last_indices: indices,
      });

      tie.setContext(ctx);

      if(direction !== undefined && direction !== null){
        tie.setDirection(direction);
      }

      tie.draw();
    },

    drawTie: function(notes, indices, options) {
      var ctx = new options.contextBuilder(options.canvas_sel, 350, 140);

      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 350).setContext(ctx).draw();

      VF.Test.StaveTie.tieNotes(notes, indices, stave, ctx, options['direction']);
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      VF.Test.StaveTie.drawTie([
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"})
      ], [0, 1], options);
      ok(true, "Simple Test");
    },

    chord: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      VF.Test.StaveTie.drawTie([
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#")),
      ], [0, 1, 2], options);
      ok(true, "Chord test");
    },

    stemUp: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      VF.Test.StaveTie.drawTie([
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: 1, duration: "h"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: 1, duration: "h"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#")),
      ], [0, 1, 2], options);
      ok(true, "Stem up test");
    },

    noEndNote: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      var stave = new VF.Stave(10, 10, 350).setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 250);
      voice.draw(ctx, stave);

      var tie = new VF.StaveTie({
        first_note: notes[1],
        last_note: null,
        first_indices: [2],
        last_indices: [2]
      }, "slow.").setContext(ctx).draw();

      ok(true, "No end note");
    },

    noStartNote: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      var stave = new VF.Stave(10, 10, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 250);
      voice.draw(ctx, stave);

      var tie = new VF.StaveTie({
        first_note: null,
        last_note: notes[0],
        first_indices: [2],
        last_indices: [2],
      }, "H").setContext(ctx).draw();

      ok(true, "No end note");
    },

    setDirectionDown: function(options, contextBuilder){
      options.contextBuilder = contextBuilder;
      options.direction = Vex.Flow.Stem.DOWN;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      VF.Test.StaveTie.drawTie([
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
            addAccidental(0, newAcc("b")).
            addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"})
      ], [0, 1], options);
      ok(true, "Set Direction Down");
    },

    setDirectionUp: function(options, contextBuilder){
      options.contextBuilder = contextBuilder;
      options.direction = Vex.Flow.Stem.UP;
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      VF.Test.StaveTie.drawTie([
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
            addAccidental(0, newAcc("b")).
            addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"})
      ], [0, 1], options);
      ok(true, "Set Direction Down");
    }

  };

  return StaveTie;
})();
/**
 * VexFlow - StringNumber Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StringNumber = (function() {
  var StringNumber = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("StringNumber");
      runTests("String Number In Notation", StringNumber.drawMultipleMeasures);
      runTests("Fret Hand Finger In Notation", StringNumber.drawFretHandFingers);
      runTests("Multi Voice With Strokes, String & Finger Numbers", StringNumber.multi);
      runTests("Complex Measure With String & Finger Numbers", StringNumber.drawAccidentals);
    },

    drawMultipleMeasures: function(options, contextBuilder) {
      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 750, 200);
      function newStringNumber(num, pos) {
        return new VF.StringNumber(num).setPosition(pos);
      }

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 290);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.addClef("treble").setContext(ctx).draw();
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: -1, duration: "q" }).addDotToAll(),
        new VF.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: -1, duration: "8" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
      ];

      notesBar1[0].
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT)).
        addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT)).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT));

       notesBar1[1].
        addAccidental(0, new VF.Accidental("#")).
        addModifier(0, newStringNumber("5", VF.Modifier.Position.BELOW)).
        addAccidental(1, new VF.Accidental("#").setAsCautionary()).
        addModifier(2, newStringNumber("3",VF.Modifier.Position.ABOVE).
                                           setLastNote(notesBar1[3]).
                                           setLineEndType(VF.Renderer.LineEndType.DOWN));

      notesBar1[2].
        addModifier(0, newStringNumber("5", VF.Modifier.Position.LEFT)).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#"));

      notesBar1[3].
        // Position string 5 below default
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT).setOffsetY(7)).
        // Position string 4 below default
        addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT).setOffsetY(6)).
          // Position string 3 above default
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT).setOffsetY(-6));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: 1, duration: "q" }),
      ];

      notesBar2[0].
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT)).
        addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT)).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT));

      notesBar2[1].
        addAccidental(0, new VF.Accidental("#")).
        addModifier(0, newStringNumber("5", VF.Modifier.Position.BELOW)).
        addAccidental(1, new VF.Accidental("#")).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.ABOVE).setLastNote(notesBar2[3]).setDashed(false));

      notesBar2[2].
        addModifier(2, newStringNumber("3", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#"));

      notesBar2[3].
        // Position string 5 below default
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT).setOffsetY(7)).
        // Position string 4 below default
        addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT).setOffsetY(6)).
        // Position string 5 above default
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT).setOffsetY(-6));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      // bar 3 - juxtaposing third bar next to second bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x, staveBar2.y, 150);
      staveBar3.setEndBarType(VF.Barline.type.END);
      staveBar3.setContext(ctx).draw();

      var notesBar3 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "a/4"], duration: "w" }).addDotToAll(),
      ];

      notesBar3[0].
        addModifier(0, newStringNumber("5", VF.Modifier.Position.BELOW)).
        addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT)).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.LEFT)).
        addModifier(3, newStringNumber("2", VF.Modifier.Position.ABOVE));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

      ok(true, "String Number");
    },

    drawFretHandFingers: function(options, contextBuilder) {
      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 600, 200);
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) { return new VF.StringNumber(num).setPosition(pos);}

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 290);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.addClef("treble").setContext(ctx).draw();
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
      ];

      notesBar1[0].
        addModifier(0, newFinger("3", VF.Modifier.Position.LEFT)).
        addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
        addModifier(2, newFinger("0", VF.Modifier.Position.LEFT));

       notesBar1[1].
        addAccidental(0, new VF.Accidental("#")).
        addModifier(0, newFinger("3", VF.Modifier.Position.LEFT)).
        addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#")).
        addModifier(2, newFinger("0", VF.Modifier.Position.LEFT));

      notesBar1[2].
        addModifier(0, newFinger("3", VF.Modifier.Position.BELOW)).
        addModifier(1, newFinger("4", VF.Modifier.Position.LEFT)).
        addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT)).
        addModifier(2, newFinger("0", VF.Modifier.Position.ABOVE)).
        addAccidental(1, new VF.Accidental("#"));

      notesBar1[3].
        addModifier(0, newFinger("3", VF.Modifier.Position.RIGHT)).
        // Position string 5 below default
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT).setOffsetY(7)).
        addModifier(1, newFinger("4", VF.Modifier.Position.RIGHT)).
        // Position String 4 below default
        addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT).setOffsetY(6)).
        // Position finger 0 above default
        addModifier(2, newFinger("0", VF.Modifier.Position.RIGHT).setOffsetY(-5)).
        // Position string 3 above default
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT).setOffsetY(-6));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);


      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setEndBarType(VF.Barline.type.END);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: 1, duration: "q" }).addDotToAll(),
        new VF.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: 1, duration: "8" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: 1, duration: "8" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }).addDotToAll(),
      ];

     notesBar2[0].
      addModifier(0, newFinger("3", VF.Modifier.Position.RIGHT)).
      addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
      addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT)).
      addModifier(2, newFinger("0", VF.Modifier.Position.ABOVE));

     notesBar2[1].
      addAccidental(0, new VF.Accidental("#")).
      addModifier(0, newFinger("3", VF.Modifier.Position.RIGHT)).
      addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
      addAccidental(1, new VF.Accidental("#")).
      addModifier(2, newFinger("0", VF.Modifier.Position.LEFT));

    notesBar2[2].
      addModifier(0, newFinger("3", VF.Modifier.Position.BELOW)).
      addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
      addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT)).
    //  addModifier(2, newFinger("1", VF.Modifier.Position.ABOVE)).
      addModifier(2, newFinger("1", VF.Modifier.Position.RIGHT)).
      addAccidental(2, new VF.Accidental("#"));

    notesBar2[3].
      addModifier(0, newFinger("3", VF.Modifier.Position.RIGHT)).
      // position string 5 below default
      addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT).setOffsetY(7)).
      // position finger 4 below default
      addModifier(1, newFinger("4", VF.Modifier.Position.RIGHT)).
      // position string 4 below default
      addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT).setOffsetY(6)).
      // position finger 1 above default
      addModifier(2, newFinger("1", VF.Modifier.Position.RIGHT).setOffsetY(-6)).
      // position string 3 above default
      addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT).setOffsetY(-6));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      ok(true, "String Number");
    },

    multi: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 700, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) { return new VF.StringNumber(num).setPosition(pos);}
      var stave = new VF.Stave(50, 10, 600);
      stave.setContext(c);
      stave.draw();

      var notes = [
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["a/3", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" })
      ];
      // Create the strokes
      var stroke1 = new VF.Stroke(5);
      var stroke2 = new VF.Stroke(6);
      var stroke3 = new VF.Stroke(2);
      var stroke4 = new VF.Stroke(1);
      notes[0].addStroke(0, stroke1);
      notes[0].addModifier(0, newFinger("3", VF.Modifier.Position.LEFT));
      notes[0].addModifier(1, newFinger("2", VF.Modifier.Position.LEFT));
      notes[0].addModifier(2, newFinger("0", VF.Modifier.Position.LEFT));
      notes[0].addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT));
      notes[0].addModifier(2, newStringNumber("3", VF.Modifier.Position.ABOVE));

      notes[1].addStroke(0, stroke2);
      notes[1].addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT));
      notes[1].addModifier(2, newStringNumber("3", VF.Modifier.Position.ABOVE));
      notes[1].addAccidental(0, new VF.Accidental("#"));
      notes[1].addAccidental(1, new VF.Accidental("#"));
      notes[1].addAccidental(2, new VF.Accidental("#"));

      notes[2].addStroke(0, stroke3);
      notes[2].addModifier(0, newFinger("3", VF.Modifier.Position.LEFT));
      notes[2].addModifier(1, newFinger("0", VF.Modifier.Position.RIGHT));
      notes[2].addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT));
      notes[2].addModifier(2, newFinger("1", VF.Modifier.Position.LEFT));
      notes[2].addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT));

      notes[3].addStroke(0, stroke4);
      notes[3].addModifier(2, newStringNumber("3", VF.Modifier.Position.LEFT));
      notes[3].addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT));

      var notes2 = [
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"})
      ];
      notes2[0].addModifier(0, newFinger("0", VF.Modifier.Position.LEFT));
      notes2[0].addModifier(0, newStringNumber("6", VF.Modifier.Position.BELOW));
      notes2[2].addAccidental(0, new VF.Accidental("#"));
      notes2[4].addModifier(0, newFinger("0", VF.Modifier.Position.LEFT));
      // Position string number 6 beneath the strum arrow: left (15) and down (18)
      notes2[4].addModifier(0, newStringNumber("6", VF.Modifier.Position.LEFT).
                                   setOffsetX(15).
                                   setOffsetY(18));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 550);

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice2.draw(c, stave);
      beam2_1.setContext(c).draw();
      beam2_2.setContext(c).draw();
      voice.draw(c, stave);

      ok(true, "Strokes Test Multi Voice");
    },

    drawAccidentals: function(options, contextBuilder) {
      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 800, 200);
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) { return new VF.StringNumber(num).setPosition(pos);}

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 475);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.addClef("treble").setContext(ctx).draw();
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "c/5", "e/5", "g/5"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "d/5", "e/5", "g/5"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "d/5", "e/5", "g/5"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "d/5", "e/5", "g/5"], stem_direction: -1, duration: "q" }),
      ];

      notesBar1[0].
        addModifier(0, newFinger("3", VF.Modifier.Position.LEFT)).
        addAccidental(0, new VF.Accidental("#")).
        addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
        addModifier(1, newStringNumber("2", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#")).
        addModifier(2, newFinger("0", VF.Modifier.Position.LEFT)).
        addAccidental(2, new VF.Accidental("#")).
        addModifier(3, newFinger("3", VF.Modifier.Position.LEFT)).
        addAccidental(3, new VF.Accidental("#")).
        addModifier(4, newFinger("2", VF.Modifier.Position.RIGHT)).
        addModifier(4, newStringNumber("3", VF.Modifier.Position.RIGHT)).
        addAccidental(4, new VF.Accidental("#")).
        addModifier(5, newFinger("0", VF.Modifier.Position.LEFT)).
        addAccidental(5, new VF.Accidental("#"));

      notesBar1[1].
        addAccidental(0, new VF.Accidental("#")).
        addAccidental(1, new VF.Accidental("#")).
        addAccidental(2, new VF.Accidental("#")).
        addAccidental(3, new VF.Accidental("#")).
        addAccidental(4, new VF.Accidental("#")).
        addAccidental(5, new VF.Accidental("#"));

      notesBar1[2].
        addModifier(0, newFinger("3", VF.Modifier.Position.LEFT)).
        addAccidental(0, new VF.Accidental("#")).
        addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
        addModifier(1, newStringNumber("2", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#")).
        addModifier(2, newFinger("0", VF.Modifier.Position.LEFT)).
        addAccidental(2, new VF.Accidental("#")).
        addModifier(3, newFinger("3", VF.Modifier.Position.LEFT)).
        addAccidental(3, new VF.Accidental("#")).
        addModifier(4, newFinger("2", VF.Modifier.Position.RIGHT)).
        addModifier(4, newStringNumber("3", VF.Modifier.Position.RIGHT)).
        addAccidental(4, new VF.Accidental("#")).
        addModifier(5, newFinger("0", VF.Modifier.Position.LEFT)).
        addAccidental(5, new VF.Accidental("#"));

      notesBar1[3].
        addAccidental(0, new VF.Accidental("#")).
        addAccidental(1, new VF.Accidental("#")).
        addAccidental(2, new VF.Accidental("#")).
        addAccidental(3, new VF.Accidental("#")).
        addAccidental(4, new VF.Accidental("#")).
        addAccidental(5, new VF.Accidental("#"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      ok(true, "String Number");
    }
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
      var runTests = VF.Test.runTests;

      QUnit.module("Strokes");
      runTests("Strokes - Brush/Arpeggiate/Rasquedo", Strokes.drawMultipleMeasures);
      runTests("Strokes - Multi Voice", Strokes.multi);
      runTests("Strokes - Notation and Tab", Strokes.notesWithTab);
      runTests("Strokes - Multi-Voice Notation and Tab", Strokes.multiNotationAndTab);
    },

    drawMultipleMeasures: function(options, contextBuilder) {
      // Get the rendering context

      var ctx = contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 250);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.setContext(ctx);
      staveBar1.draw();

      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/3", "e/4", "a/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
      ];
      notesBar1[0].addStroke(0, new VF.Stroke(1));
      notesBar1[1].addStroke(0, new VF.Stroke(2));
      notesBar1[2].addStroke(0, new VF.Stroke(1));
      notesBar1[3].addStroke(0, new VF.Stroke(2));
      notesBar1[1].addAccidental(1, new VF.Accidental("#"));
      notesBar1[1].addAccidental(2, new VF.Accidental("#"));
      notesBar1[1].addAccidental(0, new VF.Accidental("#"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx);
      staveBar2.draw();
      var notesBar2 = [
        new VF.StaveNote({ keys: ["c/4", "d/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "d/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "d/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" })
      ];
      notesBar2[0].addStroke(0, new VF.Stroke(3));
      notesBar2[1].addStroke(0, new VF.Stroke(4));
      notesBar2[2].addStroke(0, new VF.Stroke(5));
      notesBar2[3].addStroke(0, new VF.Stroke(6));
      notesBar2[3].addAccidental(0, new VF.Accidental("bb"));
      notesBar2[3].addAccidental(1, new VF.Accidental("bb"));
      notesBar2[3].addAccidental(2, new VF.Accidental("bb"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      ok(true, "Brush/Roll/Rasquedo");
    },

    multi: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 400, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      var stave = new VF.Stave(50, 10, 300);
      stave.setContext(c);
      stave.draw();

      var notes = [
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" })
      ];
      // Create the strokes
      var stroke1 = new VF.Stroke(5);
      var stroke2 = new VF.Stroke(6);
      var stroke3 = new VF.Stroke(2);
      var stroke4 = new VF.Stroke(1);
      notes[0].addStroke(0, stroke1);
      notes[1].addStroke(0, stroke2);
      notes[2].addStroke(0, stroke3);
      notes[3].addStroke(0, stroke4);
      notes[1].addAccidental(0, new VF.Accidental("#"));
      notes[1].addAccidental(2, new VF.Accidental("#"));

      var notes2 = [
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 275);

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice2.draw(c, stave);
      beam2_1.setContext(c).draw();
      beam2_2.setContext(c).draw();
      voice.draw(c, stave);

      ok(true, "Strokes Test Multi Voice");
    },

    multiNotationAndTab: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 400, 275);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTabNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      var stave = new VF.Stave(10, 10, 400).addTrebleGlyph().
        setContext(c).draw();
      var tabstave = new VF.TabStave(10, 125, 400).addTabGlyph().
        setNoteStartX(stave.getNoteStartX()).setContext(c).draw();

      // notation upper voice notes
      var notes = [
        newNote({ keys: ["g/4", "b/4", "e/5"], duration: "q" }),
        newNote({ keys: ["g/4", "b/4", "e/5"], duration: "q" }),
        newNote({ keys: ["g/4", "b/4", "e/5"], duration: "q" }),
        newNote({ keys: ["g/4", "b/4", "e/5"], duration: "q" })
      ];

      // tablature upper voice notes
      var notes3 = [
        newTabNote({ positions: [{str: 3, fret: 0},
                                 {str: 2, fret: 0},
                                 {str: 1, fret: 1}], duration: "q"}),
        newTabNote({ positions: [{str: 3, fret: 0},
                                 {str: 2, fret: 0},
                                 {str: 1, fret: 1}], duration: "q"}),
        newTabNote({ positions: [{str: 3, fret: 0},
                                 {str: 2, fret: 0},
                                 {str: 1, fret: 1}], duration: "q"}),
        newTabNote({ positions: [{str: 3, fret: 0},
                                 {str: 2, fret: 0},
                                 {str: 1, fret: 1}], duration: "q"})
      ];

      // Create the strokes for notation
      var stroke1 = new VF.Stroke(3, {all_voices: false});
      var stroke2 = new VF.Stroke(6);
      var stroke3 = new VF.Stroke(2, {all_voices: false});
      var stroke4 = new VF.Stroke(1);
      // add strokes to notation
      notes[0].addStroke(0, stroke1);
      notes[1].addStroke(0, stroke2);
      notes[2].addStroke(0, stroke3);
      notes[3].addStroke(0, stroke4);

      // creae strokes for tab
      var stroke5 = new VF.Stroke(3, {all_voices: false});
      var stroke6 = new VF.Stroke(6);
      var stroke7 = new VF.Stroke(2, {all_voices: false});
      var stroke8 = new VF.Stroke(1);
      // add strokes to tab
      notes3[0].addStroke(0, stroke5);
      notes3[1].addStroke(0, stroke6);
      notes3[2].addStroke(0, stroke7);
      notes3[3].addStroke(0, stroke8);

      // notation lower voice notes
      var notes2 = [
        newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"})
      ];

      // tablature lower voice notes
      var notes4 = [
        newTabNote({ positions: [{str: 6, fret: 3}], duration: "q"}),
        newTabNote({ positions: [{str: 6, fret: 3}], duration: "q"}),
        newTabNote({ positions: [{str: 6, fret: 3}], duration: "q"}),
        newTabNote({ positions: [{str: 6, fret: 3}], duration: "q"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      var voice3 = new VF.Voice(VF.Test.TIME4_4);
      var voice4 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);
      voice4.addTickables(notes4);
      voice3.addTickables(notes3);

      var formatter = new VF.Formatter().joinVoices([voice, voice2, voice3, voice4]).
        format([voice, voice2, voice3, voice4], 275);

      voice2.draw(c, stave);
      voice.draw(c, stave);
      voice4.draw(c, tabstave);
      voice3.draw(c, tabstave);

      ok(true, "Strokes Test Notation & Tab Multi Voice");
    },

    drawTabStrokes: function(options, contextBuilder) {
      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 600, 200);

      // bar 1
      var staveBar1 = new VF.TabStave(10, 50, 250);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.setContext(ctx).draw();

      var notesBar1 = [
        new VF.TabNote({ positions: [{str: 2, fret: 8 },
                                           {str: 3, fret: 9},
                                           {str: 4, fret: 10}], duration: "q"}),
        new VF.TabNote({ positions: [{str: 3, fret: 7 },
                                           {str: 4, fret: 8},
                                           {str: 5, fret: 9}], duration: "q"}),
        new VF.TabNote({ positions: [{str: 1, fret: 5 },
                                           {str: 2, fret: 6},
                                           {str: 3, fret: 7},
                                           {str: 4, fret: 7},
                                           {str: 5, fret: 5},
                                           {str: 6, fret: 5}], duration: "q"}),
        new VF.TabNote({ positions: [{str: 4, fret: 3 },
                                           {str: 5, fret: 4},
                                           {str: 6, fret: 5}], duration: "q"}),
      ];

      var stroke1 = new VF.Stroke(1);
      var stroke2 = new VF.Stroke(2);
      var stroke3 = new VF.Stroke(3);
      var stroke4 = new VF.Stroke(4);

      notesBar1[0].addStroke(0, stroke1);
      notesBar1[1].addStroke(0, stroke2);
      notesBar1[2].addStroke(0, stroke4);
      notesBar1[3].addStroke(0, stroke3);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

     // bar 2
      var staveBar2 = new VF.TabStave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx).draw();
      var notesBar2 = [new VF.TabNote({ positions: [{str: 2, fret: 7 },
                                                          {str: 3, fret: 8},
                                                          {str: 4, fret: 9}], duration: "h"}),
                       new VF.TabNote({ positions: [{str: 1, fret: 5 },
                                                          {str: 2, fret: 6},
                                                          {str: 3, fret: 7},
                                                          {str: 4, fret: 7},
                                                          {str: 5, fret: 5},
                                                          {str: 6, fret: 5}], duration: "h"}),
      ];

      notesBar2[0].addStroke(0, new VF.Stroke(6));
      notesBar2[1].addStroke(0, new VF.Stroke(5));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
      ok(true, "Strokes Tab test");

    },

    getTabNotes: function() {
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTabNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["b/4", "d/5", "g/5"], stem_direction: -1, duration: "q"}).
          addAccidental(1, newAcc("b")).
          addAccidental(0, newAcc("b")),
        newNote({ keys: ["c/5", "d/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["b/3", "e/4", "a/4", "d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/3", "e/4", "a/4", "c/5", "e/5", "a/5"], stem_direction: 1, duration: "8"}).
          addAccidental(3, newAcc("#")),
        newNote({ keys: ["b/3", "e/4", "a/4", "d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["a/3", "e/4", "a/4", "c/5", "f/5", "a/5"], stem_direction: 1, duration: "8"}).
            addAccidental(3, newAcc("#")).
            addAccidental(4, newAcc("#"))
      ];

      var tabs1 = [
        newTabNote({ positions: [{str: 1, fret: 3},
                                 {str: 2, fret: 2},
                                 {str: 3, fret: 3}], duration: "q"}).
          addModifier(new VF.Bend("Full"), 0),
        newTabNote({ positions: [{str: 2, fret: 3},
                                 {str: 3, fret: 5}], duration: "q"}).
          addModifier(new VF.Bend("Unison"), 1),
        newTabNote({ positions: [{str: 3, fret: 7},
                                 {str: 4, fret: 7},
                                 {str: 5, fret: 7},
                                 {str: 6, fret: 7},], duration: "8"}),
        newTabNote({ positions: [{str: 1, fret: 5},
                                 {str: 2, fret: 5},
                                 {str: 3, fret: 6},
                                 {str: 4, fret: 7},
                                 {str: 5, fret: 7},
                                 {str: 6, fret: 5}], duration: "8"}),
        newTabNote({ positions: [{str: 3, fret: 7},
                                 {str: 4, fret: 7},
                                 {str: 5, fret: 7},
                                 {str: 6, fret: 7},], duration: "8"}),
        newTabNote({ positions: [{str: 1, fret: 5},
                                 {str: 2, fret: 5},
                                 {str: 3, fret: 6},
                                 {str: 4, fret: 7},
                                 {str: 5, fret: 7},
                                 {str: 6, fret: 5}], duration: "8"})

      ];

      var noteStr1 = new VF.Stroke(1);
      var noteStr2 = new VF.Stroke(2);
      var noteStr3 = new VF.Stroke(3);
      var noteStr4 = new VF.Stroke(4);
      var noteStr5 = new VF.Stroke(5);
      var noteStr6 = new VF.Stroke(6);

      notes1[0].addStroke(0, noteStr1);
      notes1[1].addStroke(0, noteStr2);
      notes1[2].addStroke(0, noteStr3);
      notes1[3].addStroke(0, noteStr4);
      notes1[4].addStroke(0, noteStr5);
      notes1[5].addStroke(0, noteStr6);

      var tabStr1 = new VF.Stroke(1);
      var tabStr2 = new VF.Stroke(2);
      var tabStr3 = new VF.Stroke(3);
      var tabStr4 = new VF.Stroke(4);
      var tabStr5 = new VF.Stroke(5);
      var tabStr6 = new VF.Stroke(6);

      tabs1[0].addStroke(0, tabStr1);
      tabs1[1].addStroke(0, tabStr2);
      tabs1[2].addStroke(0, tabStr3);
      tabs1[3].addStroke(0, tabStr4);
      tabs1[4].addStroke(0, tabStr5);
      tabs1[5].addStroke(0, tabStr6);

      return { notes: notes1, tabs: tabs1 };
    },

    renderNotesWithTab:
      function(notes, ctx, staves, justify) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      var tabVoice = new VF.Voice(VF.Test.TIME4_4);

      voice.addTickables(notes.notes);
      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice);

      tabVoice.addTickables(notes.tabs);

      new VF.Formatter().
        joinVoices([voice]).joinVoices([tabVoice]).
        format([voice, tabVoice], justify);

      voice.draw(ctx, staves.notes);
      beams.forEach(function(beam){
        beam.setContext(ctx).draw();
      });
      tabVoice.draw(ctx, staves.tabs);
    },

    notesWithTab: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 420, 450);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";

      // Get test voices.
      var notes = VF.Test.Strokes.getTabNotes();
      var stave = new VF.Stave(10, 10, 400).addTrebleGlyph().
        setContext(ctx).draw();
      var tabstave = new VF.TabStave(10, 100, 400).addTabGlyph().
        setNoteStartX(stave.getNoteStartX()).setContext(ctx).draw();
      var connector = new VF.StaveConnector(stave, tabstave);
      var line = new VF.StaveConnector(stave, tabstave);
      connector.setType(VF.StaveConnector.type.BRACKET);
      connector.setContext(ctx);
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      connector.draw();
      line.draw();

      VF.Test.Strokes.renderNotesWithTab(notes, ctx,
          { notes: stave, tabs: tabstave });
      ok(true);

      var stave2 = new VF.Stave(10, 250, 400).addTrebleGlyph().
        setContext(ctx).draw();
      var tabstave2 = new VF.TabStave(10, 350, 400).addTabGlyph().
        setNoteStartX(stave2.getNoteStartX()).setContext(ctx).draw();
      var connector = new VF.StaveConnector(stave2, tabstave2);
      var line = new VF.StaveConnector(stave2, tabstave2);
      connector.setType(VF.StaveConnector.type.BRACKET);
      connector.setContext(ctx);
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      connector.draw();
      line.draw();

      VF.Test.Strokes.renderNotesWithTab(notes, ctx,
          { notes: stave2, tabs: tabstave2 }, 385);
      ok(true);
    }
  };

  return Strokes;
})();
/**
 * VexFlow - TabNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabNote = (function() {
  var TabNote = {
    Start: function() {
      QUnit.module("TabNote");
      test("Tick", VF.Test.TabNote.ticks);
      test("TabStave Line", VF.Test.TabNote.tabStaveLine);
      test("Width", VF.Test.TabNote.width);
      test("TickContext", VF.Test.TabNote.tickContext);

      var runTests = VF.Test.runTests;
      runTests("TabNote Draw", TabNote.draw);
      runTests("TabNote Stems Up", TabNote.drawStemsUp);
      runTests("TabNote Stems Down", TabNote.drawStemsDown);
      runTests("TabNote Stems Up Through Stave", TabNote.drawStemsUpThrough);
      runTests("TabNote Stems Down Through Stave", TabNote.drawStemsDownThrough);
      runTests("TabNote Stems with Dots", TabNote.drawStemsDotted);
    },

    ticks: function() {
      var BEAT = 1 * VF.RESOLUTION / 4;

      var note = new VF.TabNote(
          { positions: [{str: 6, fret: 6 }], duration: "w"});
      equal(note.getTicks().value(), BEAT * 4, "Whole note has 4 beats");

      note = new VF.TabNote(
          { positions: [{str: 3, fret: 4 }], duration: "q"});
      equal(note.getTicks().value(), BEAT, "Quarter note has 1 beat");
    },

    tabStaveLine: function() {
      var note = new VF.TabNote({
        positions: [{ str: 6, fret: 6 }, { str: 4, fret: 5 }],
        duration: "w"
      });

      var positions = note.getPositions();
      equal(positions[0].str, 6, "String 6, Fret 6");
      equal(positions[0].fret, 6, "String 6, Fret 6");
      equal(positions[1].str, 4, "String 4, Fret 5");
      equal(positions[1].fret, 5, "String 4, Fret 5");

      var stave = new VF.Stave(10, 10, 300);
      note.setStave(stave);

      var ys = note.getYs();
      equal(ys.length, 2, "Chord should be rendered on two lines");
      equal(ys[0], 100, "Line for String 6, Fret 6");
      equal(ys[1], 80, "Line for String 4, Fret 5");
    },

    width: function() {
      expect(1);
      var note = new VF.TabNote(
          { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});

      try {
        var width = note.getWidth();
      } catch (e) {
        equal(e.code, "UnformattedNote",
            "Unformatted note should have no width");
      }
    },

    tickContext: function() {
      var note = new VF.TabNote(
          { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});
      var tickContext = new VF.TickContext();
      tickContext.addTickable(note);
      tickContext.preFormat();
      tickContext.setX(10);
      tickContext.setPadding(0);

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
      var ctx = new contextBuilder(options.canvas_sel, 600, 140);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.TabNote.showNote;
      var notes = [
        { positions: [{str: 6, fret: 6 }], duration: "q"},
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "q"},
        { positions: [{str: 2, fret: "x" }, {str: 5, fret: 15}], duration: "q"},
        { positions: [{str: 2, fret: "x" }, {str: 5, fret: 5}], duration: "q"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "q"},
        { positions: [{str: 6, fret: 0},
                      {str: 5, fret: 5},
                      {str: 4, fret: 5},
                      {str: 3, fret: 4},
                      {str: 2, fret: 3},
                      {str: 1, fret: 0}],
                      duration: "q"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "q"}
      ];

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, "Note " + i + " has X value");
        ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
      }
    },

    drawStemsUp: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 30, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'TabNotes successfully drawn');
    },

    drawStemsDown: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'All objects have been drawn');
    },

    drawStemsUpThrough: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 30, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "128"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_stem_through_stave = true;
        return tabNote;
      });

      ctx.setFont("sans-serif", 10, "bold");
      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'TabNotes successfully drawn');
    },

    drawStemsDownThrough: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 250);

      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550,{num_lines:8});
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}, {str: 6, fret: 10}], duration: "32"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "64"},
        { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}, {str: 5, fret: 5}, {str: 7, fret: 5}], duration: "128"}
      ];

      var notes = specs.map(function(noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.render_options.draw_stem_through_stave = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      ctx.setFont("Arial", 10, "bold");

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'All objects have been drawn');
    },

    drawStemsDotted: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 200);
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "4d"},
        { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "4dd", stem_direction: -1 },
        { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "16", stem_direction: -1},
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
      var formatter = new VF.Formatter().joinVoices([voice]).
        formatToStave([voice], stave);
      voice.draw(ctx, stave);
      ok (true, 'TabNotes successfully drawn');
    }
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
      QUnit.module("TabSlide");
      runTests("Simple TabSlide", TabSlide.simple);
      runTests("Slide Up", TabSlide.slideUp);
      runTests("Slide Down", TabSlide.slideDown);
    },

    tieNotes: function(notes, indices, stave, ctx) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 100);
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

    setupContext: function(options, x, y) {
      var ctx = options.contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, x || 350).addTabGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },


    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var c = VF.Test.TabSlide.setupContext(options);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      VF.Test.TabSlide.tieNotes([
        newNote({ positions: [{str:4, fret:4}], duration: "h"}),
        newNote({ positions: [{str:4, fret:6}], duration: "h"})
      ], [0], c.stave, c.context);
      ok(true, "Simple Test");
    },

    multiTest: function(options, factory) {
      var c = VF.Test.TabSlide.setupContext(options, 440, 100);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var notes = [
        newNote({ positions: [{str:4, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:4}, {str:5, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:6}, {str:5, fret:6}], duration: "8"}),
        newNote({ positions: [{str:2, fret:14}], duration: "8"}),
        newNote({ positions: [{str:2, fret:16}], duration: "8"}),
        newNote({ positions: [{str:2, fret:14}, {str:3, fret:14}], duration: "8"}),
        newNote({ positions: [{str:2, fret:16}, {str:3, fret:16}], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      voice.draw(c.context, c.stave);

      factory({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, "Single note");

      factory({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, "Chord");

      factory({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, "Single note high-fret");

      factory({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, "Chord high-fret");
    },

    slideUp: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabSlide.multiTest(options, VF.TabSlide.createSlideUp);
    },

    slideDown: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      VF.Test.TabSlide.multiTest(options, VF.TabSlide.createSlideDown);
    }
  };

  return TabSlide;
})();

/**
 * VexFlow - TabStave Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TabStave = (function() {
  var TabStave = {
    Start: function() {
      QUnit.module("TabStave");
      VF.Test.runTests("TabStave Draw Test", VF.Test.TabStave.draw);
      VF.Test.runTests("Vertical Bar Test", VF.Test.TabStave.drawVerticalBar);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 160);
      var stave = new VF.TabStave(10, 10, 300);
      stave.setNumLines(6);
      stave.setContext(ctx);
      stave.draw();

      equal(stave.getYForNote(0), 127, "getYForNote(0)");
      equal(stave.getYForLine(5), 127, "getYForLine(5)");
      equal(stave.getYForLine(0), 62, "getYForLine(0) - Top Line");
      equal(stave.getYForLine(4), 114, "getYForLine(4) - Bottom Line");

      ok(true, "all pass");
    },

    drawVerticalBar: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 160);
      var stave = new VF.TabStave(10, 10, 300);
      stave.setNumLines(6);
      stave.setContext(ctx);
      stave.drawVerticalBar(50, true);
      stave.drawVerticalBar(100, true);
      stave.drawVerticalBar(150, false);
      stave.setEndBarType(VF.Barline.type.END);
      stave.draw();

      ok(true, "all pass");
    }
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
      var runTests = VF.Test.runTests;
      QUnit.module("TabTie");
      runTests("Simple TabTie", TabTie.simple);
      runTests("Hammerons", TabTie.simpleHammeron);
      runTests("Pulloffs", TabTie.simplePulloff);
      runTests("Tapping", TabTie.tap);
      runTests("Continuous", TabTie.continuous);
    },

    tieNotes: function(notes, indices, stave, ctx, text) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 100);
      voice.draw(ctx, stave);

      var tie = new VF.TabTie({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: indices,
        last_indices: indices,
      }, text || "Annotation");

      tie.setContext(ctx);
      tie.draw();
    },

    setupContext: function(options, x, y) {
      var ctx = options.contextBuilder(options.canvas_sel, x || 350, y || 160);
      ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.setFont("Arial", VF.Test.Font.size, "");
      var stave = new VF.TabStave(10, 10, x || 350).addTabGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    drawTie: function(notes, indices, options, text) {
      var c = VF.Test.TabTie.setupContext(options);
      VF.Test.TabTie.tieNotes(notes, indices, c.stave, c.context, text);
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      VF.Test.TabTie.drawTie([
        newNote({ positions: [{str:4, fret:4}], duration: "h"}),
        newNote({ positions: [{str:4, fret:6}], duration: "h"})
      ], [0], options);

      ok(true, "Simple Test");
    },

    tap: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      VF.Test.TabTie.drawTie([
        newNote({ positions: [{str:4, fret:12}], duration: "h"}).
          addModifier(new VF.Annotation("T"), 0),
        newNote({ positions: [{str:4, fret:10}], duration: "h"})
      ], [0], options, "P");

      ok(true, "Tapping Test");
    },

    multiTest: function(options, factory) {
      var c = VF.Test.TabTie.setupContext(options, 440, 140);
      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }

      var notes = [
        newNote({ positions: [{str:4, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:4}, {str:5, fret:4}], duration: "8"}),
        newNote({ positions: [{str:4, fret:6}, {str:5, fret:6}], duration: "8"}),
        newNote({ positions: [{str:2, fret:14}], duration: "8"}),
        newNote({ positions: [{str:2, fret:16}], duration: "8"}),
        newNote({ positions: [{str:2, fret:14}, {str:3, fret:14}], duration: "8"}),
        newNote({ positions: [{str:2, fret:16}, {str:3, fret:16}], duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      voice.draw(c.context, c.stave);

      factory({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, "Single note");

      factory({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, "Chord");

      factory({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0],
      }).setContext(c.context).draw();

      ok(true, "Single note high-fret");

      factory({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [0, 1],
        last_indices: [0, 1],
      }).setContext(c.context).draw();

      ok(true, "Chord high-fret");
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
        newNote({ positions: [{str:4, fret:4}], duration: "q"}),
        newNote({ positions: [{str:4, fret:5}], duration: "q"}),
        newNote({ positions: [{str:4, fret:6}], duration: "h"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).addTickables(notes);
      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
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
      ok(true, "Continuous Hammeron");
    }
  };

  return TabTie;
})();

/**
 * VexFlow - TextBracket Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TextBracket = (function(){
  var TextBracket = {
    Start: function() {
      QUnit.module("TextBracket");
      VF.Test.runTests("Simple TextBracket", VF.Test.TextBracket.simple0);
      VF.Test.runTests("TextBracket Styles", VF.Test.TextBracket.simple1);
    },

    simple0: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 650, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave = new VF.Stave(10, 40, 550).addTrebleGlyph();
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var octave_top = new VF.TextBracket({
        start: notes[0],
        stop: notes[3],
        text: "15",
        superscript: "va",
        position: 1
      });

      var octave_bottom = new VF.TextBracket({
        start: notes[0],
        stop: notes[3],
        text: "8",
        superscript: "vb",
        position: -1
      });

      octave_bottom.setLine(3);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);

      octave_top.setContext(ctx).draw();
      octave_bottom.setContext(ctx).draw();
    },

    simple1: function(options, contextBuilder) {
      expect(0);

      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 650, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      //ctx.translate(0.5, 0.5);
      var stave = new VF.Stave(10, 40, 550).addTrebleGlyph();
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var octave_top0 = new VF.TextBracket({
        start: notes[0],
        stop: notes[1],
        text: "Cool notes",
        superscript: "",
        position: 1
      });

      var octave_bottom0 = new VF.TextBracket({
        start: notes[2],
        stop: notes[4],
        text: "Not cool notes",
        superscript: " super uncool",
        position: -1
      });

      octave_bottom0.render_options.bracket_height = 40;
      octave_bottom0.setLine(4);

      var octave_top1 = new VF.TextBracket({
        start: notes[2],
        stop: notes[4],
        text: "Testing",
        superscript: "superscript",
        position: 1
      });

      var octave_bottom1 = new VF.TextBracket({
        start: notes[0],
        stop: notes[1],
        text: "8",
        superscript: "vb",
        position: -1
      });

      octave_top1.render_options.line_width = 2;
      octave_top1.render_options.show_bracket = false;
      octave_bottom1.setDashed(true, [2, 2]);
      octave_top1.setFont({
        weight: "",
        family: "Arial",
        size: 15
      });

      octave_bottom1.font.size = 30;
      octave_bottom1.setDashed(false);
      octave_bottom1.render_options.underline_superscript = false;

      octave_bottom1.setLine(3);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);

      octave_top0.setContext(ctx).draw();
      octave_bottom0.setContext(ctx).draw();

      octave_top1.setContext(ctx).draw();
      octave_bottom1.setContext(ctx).draw();
    }
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

      QUnit.module("TextNote");
      runTests("TextNote Formatting", TextNote.formatTextNotes);
      runTests("TextNote Superscript and Subscript", TextNote.superscriptAndSubscript);
      runTests("TextNote Formatting With Glyphs 0", TextNote.formatTextGlyphs0);
      runTests("TextNote Formatting With Glyphs 1", TextNote.formatTextGlyphs1);
      runTests("Crescendo", TextNote.crescendo);
      runTests("Text Dynamics", TextNote.textDynamics);
    },

    renderNotes: function(notes1, notes2, ctx, stave, justify) {
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);

      notes1.forEach(function(note) {note.setContext(ctx)});
      notes2.forEach(function(note) {note.setContext(ctx)});

      voice1.addTickables(notes1);
      voice2.addTickables(notes2);

      new VF.Formatter().joinVoices([voice1, voice2]).
        formatToStave([voice1, voice2], stave);

      voice1.draw(ctx, stave);
      voice2.draw(ctx, stave);
    },

    formatTextNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 150);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 400);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new VF.TextNote(text_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newTextNote({text: "Center Justification",  duration: "h"}).
          setJustification(VF.TextNote.Justification.CENTER),
        newTextNote({text: "Left Line 1", duration: "q"}).setLine(1),
        newTextNote({text: "Right", duration: "q"}).
          setJustification(VF.TextNote.Justification.RIGHT),
      ];

      VF.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    superscriptAndSubscript: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 550, 200);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 10, 500);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new VF.TextNote(text_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: 1, duration: "q"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var notes2 = [
        newTextNote({text: VF.unicode["flat"] + "I", superscript: "+5",  duration: "8"}),
        newTextNote({text: "D" + VF.unicode["sharp"] +"/F",  duration: "4d", superscript: "sus2"}),
        newTextNote({text: "ii", superscript: "6", subscript: "4",  duration: "8"}),
        newTextNote({text: "C" , superscript: VF.unicode["triangle"] + "7", subscript: "", duration: "8"}),
        newTextNote({text: "vii", superscript: VF.unicode["o-with-slash"] + "7", duration: "8"}),
        newTextNote({text: "V",superscript: "7",   duration: "8"}),
      ];

      notes2.forEach(function(note) {
        note.setLine(13);
        note.font = {
          family: "Serif",
          size: 15,
          weight: ""
        };
        note.setJustification(VF.TextNote.Justification.LEFT);
      });

      VF.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    formatTextGlyphs0: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 20, 600);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new VF.TextNote(text_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"})
      ];

      var notes2 = [
        newTextNote({text: "Center",  duration: "8"}).
          setJustification(VF.TextNote.Justification.CENTER),
        newTextNote({glyph: "f", duration: "8"}),
        newTextNote({glyph: "p", duration: "8"}),
        newTextNote({glyph: "m", duration: "8"}),
        newTextNote({glyph: "z", duration: "8"}),

        newTextNote({glyph: "mordent_upper", duration: "16"}),
        newTextNote({glyph: "mordent_lower", duration: "16"}),
        newTextNote({glyph: "segno", duration: "8"}),
        newTextNote({glyph: "coda", duration: "8"}),
      ];

      VF.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    formatTextGlyphs1: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 20, 600);
      stave.setContext(ctx);
      stave.draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTextNote(text_struct) { return new VF.TextNote(text_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("b")).
          addAccidental(1, newAcc("#")),
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "8"})
      ];

      var notes2 = [
        newTextNote({glyph: "turn",  duration: "16"}),
        newTextNote({glyph: "turn_inverted",  duration: "16"}),
        newTextNote({glyph: "pedal_open", duration: "8"}).setLine(10),
        newTextNote({glyph: "pedal_close", duration: "8"}).setLine(10),
        newTextNote({glyph: "caesura_curved", duration: "8"}).setLine(3),
        newTextNote({glyph: "caesura_straight", duration: "8"}).setLine(3),
        newTextNote({glyph: "breath", duration: "8"}).setLine(2),
        newTextNote({glyph: "tick", duration: "8"}).setLine(3),
      newTextNote({glyph: "tr", duration: "8", smooth: true}).
          setJustification(VF.TextNote.Justification.CENTER),
      ];

      VF.Test.TextNote.renderNotes(notes1, notes2, ctx, stave);

      ok(true);
    },

    crescendo: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 20, 500);
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        new VF.TextNote({glyph: "p", duration: "16"}).setContext(ctx),
        new VF.Crescendo({duration: "4d"}).setLine(0).setHeight(25),
        new VF.TextNote({glyph: "f", duration: "16"}).setContext(ctx),
        new VF.Crescendo({duration: "4"}).setLine(5),
        new VF.Crescendo({duration: "4"}).setLine(10).setDecrescendo(true).setHeight(5)
      ];

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().formatToStave([voice], stave);

      notes.forEach(function(note) {
        note.setStave(stave);
        note.setContext(ctx).draw();
      });

      ok(true);
    },

    textDynamics: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 180);
      ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      var stave = new VF.Stave(10, 20, 550);
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        new VF.TextDynamics({ text: "sfz", duration: "4" }),
        new VF.TextDynamics({ text: "rfz", duration: "4" }),
        new VF.TextDynamics({ text: "mp", duration: "4" }),
        new VF.TextDynamics({ text: "ppp", duration: "4" }),
        new VF.TextDynamics({ text: "fff", duration: "4" }),
        new VF.TextDynamics({ text: "mf", duration: "4" }),
        new VF.TextDynamics({ text: "sff", duration: "4" })
      ];

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().formatToStave([voice], stave);

      notes.forEach(function(note) {
        note.setStave(stave);
        note.setContext(ctx).draw();
      });

      ok(true);
    }
  }

  return TextNote;
})();
/**
 * VexFlow - Three Voices in single staff tests.
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ThreeVoices = (function() {
  var ThreeVoices = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Three Voice Rests");
      runTests("Three Voices - #1", ThreeVoices.threevoices);
      runTests("Three Voices - #2 Complex", ThreeVoices.threevoices2);
      runTests("Three Voices - #3", ThreeVoices.threevoices3);
      runTests("Auto Adjust Rest Positions - Two Voices", ThreeVoices.autoresttwovoices);
      runTests("Auto Adjust Rest Positions - Three Voices #1", ThreeVoices.autorestthreevoices);
      runTests("Auto Adjust Rest Positions - Three Voices #2", ThreeVoices.autorestthreevoices2);
    },

    setupContext: function(options, x, y) {
      VF.Test.resizeCanvas(options.canvas_sel, x || 350, y || 150);
      var ctx = Vex.getCanvasContext(options.canvas_sel);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, x || 350).addTrebleGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    threevoices: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }

      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.draw();

      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.addTimeSignature("4/4");
      stave.draw();

      var notes = [
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "h"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "h"}),
      ];
      notes[0].
        addModifier(0, newFinger("0", VF.Modifier.Position.LEFT));

      var notes1 = [
        newNote({ keys: ["d/4", "a/4", "d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4", "a/4", "c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4", "a/4", "c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4", "a/4", "c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
      ];
      notes1[0].addAccidental(2, new VF.Accidental("#")).
                addModifier(0, newFinger("0", VF.Modifier.Position.LEFT)).
                addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
                addModifier(2, newFinger("4", VF.Modifier.Position.RIGHT));

      var notes2 = [
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "q"}),

        newNote({ keys: ["f/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["a/3"], stem_direction: -1, duration: "q"}),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice1.addTickables(notes1);
      voice2.addTickables(notes2);
      var beam = VF.Beam.applyAndGetBeams(voice, 1);
      var beam1 = VF.Beam.applyAndGetBeams(voice1, -1);
      var beam2 = VF.Beam.applyAndGetBeams(voice2, -1);

      // Set option to position rests near the notes in each voice
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2]).
        format([voice, voice1, voice2], 400);

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      for (var i = 0; i < beam.length; i++)
        beam[i].setContext(c).draw();
      for (var i = 0; i < beam1.length; i++)
        beam1[i].setContext(c).draw();
      for (var i = 0; i < beam2.length; i++)
        beam2[i].setContext(c).draw();

      ok(true, "Three Voices - Test #1");
    },

    threevoices2: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }

      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.draw();

      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.addTimeSignature("4/4");
      stave.draw();

      var notes = [
        newNote({ keys: ["a/4", "e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["e/5"], stem_direction: 1, duration: "h"}),
      ];
      notes[0].
        addModifier(0, newFinger("2", VF.Modifier.Position.LEFT)).
        addModifier(1, newFinger("0", VF.Modifier.Position.ABOVE));
    //    addModifier(1, newFinger("0", VF.Modifier.Position.LEFT).
    //    setOffsetY(-6));

      var notes1 = [
        newNote({ keys: ["d/4", "d/5"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["b/4", "c/5"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/5"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "16"}),
        newNote({ keys: ["d/4", "a/4", "c/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4", "a/4", "c/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["d/4", "a/4", "c/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
      ];
      notes1[0].addAccidental(1, new VF.Accidental("#")).
                addModifier(0, newFinger("0", VF.Modifier.Position.LEFT)).
                addModifier(1, newFinger("4", VF.Modifier.Position.LEFT));

      var notes2 = [
        newNote({ keys: ["b/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "q"}),

        newNote({ keys: ["f/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["a/3"], stem_direction: -1, duration: "q"}),
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice1.addTickables(notes1);
      voice2.addTickables(notes2);
      var beam = VF.Beam.applyAndGetBeams(voice, 1);
      var beam1 = VF.Beam.applyAndGetBeams(voice1, -1);
      var beam2 = VF.Beam.applyAndGetBeams(voice2, -1);

      // Set option to position rests near the notes in each voice
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2]).
        format([voice, voice1, voice2], 400);

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      for (var i = 0; i < beam.length; i++)
        beam[i].setContext(c).draw();
      for (var i = 0; i < beam1.length; i++)
        beam1[i].setContext(c).draw();
      for (var i = 0; i < beam2.length; i++)
        beam2[i].setContext(c).draw();

      ok(true, "Three Voices - Test #2 Complex");
    },

    threevoices3: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }

      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.draw();

      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.addTimeSignature("4/4");
      stave.draw();

      var notes = [
        newNote({ keys: ["g/4", "e/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["g/4", "e/5"], stem_direction: 1, duration: "h"}),
      ];
      notes[0].addModifier(0, newFinger("0", VF.Modifier.Position.LEFT)).
               addModifier(1, newFinger("0", VF.Modifier.Position.LEFT));

      var notes1 = [
        newNote({ keys: ["c/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),

        newNote({ keys: ["a/4"], stem_direction: -1, duration: "qd"}).addDotToAll(),
        newNote({ keys: ["g/4"], stem_direction: -1, duration: "8"}),
      ];
      notes1[0].addAccidental(0, new VF.Accidental("#")).
                addModifier(0, newFinger("1", VF.Modifier.Position.LEFT));

      var notes2 = [
        newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["b/3"], stem_direction: -1, duration: "q"}),

        newNote({ keys: ["a/3"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"}),
      ];
      notes2[0].addModifier(0, newFinger("3", VF.Modifier.Position.LEFT));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice1.addTickables(notes1);
      voice2.addTickables(notes2);
      var beam = VF.Beam.applyAndGetBeams(voice, 1);
      var beam1 = VF.Beam.applyAndGetBeams(voice1, -1);
      var beam2 = VF.Beam.applyAndGetBeams(voice2, -1);

      // Set option to position rests near the notes in each voice
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2]).
        format([voice, voice1, voice2], 400);

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      for (var i = 0; i < beam.length; i++)
        beam[i].setContext(c).draw();
      for (var i = 0; i < beam1.length; i++)
        beam1[i].setContext(c).draw();
      for (var i = 0; i < beam2.length; i++)
        beam2[i].setContext(c).draw();

      ok(true, "Three Voices - Test #3");
    },

    autoresttwovoices: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 900, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }

      function getNotes(text) {
        var notes = [
          newNote({ keys: ["b/4"], duration: "8r"}),
          newNote({ keys: ["e/5"], duration: "16"}),
          newNote({ keys: ["b/4"], duration: "16r"}),

          newNote({ keys: ["b/4"], duration: "8r"}),
          newNote({ keys: ["e/5"], duration: "16"}),
          newNote({ keys: ["b/4"], duration: "16r"}),

          newNote({ keys: ["b/4"], duration: "8r"}),
          newNote({ keys: ["d/5"], duration: "16"}),
          newNote({ keys: ["b/4"], duration: "16r"}),

          newNote({ keys: ["e/5"], duration: "q"}),
        ];

        var notes1 = [
          newNote({ keys: ["c/5"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),

          newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["g/4"], stem_direction: -1, duration: "16"}),

          newNote({ keys: ["g/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["a/4"], stem_direction: 1, duration: "16"}),
          newNote({ keys: ["b/4"], stem_direction: 1, duration: "16r"}),
          newNote({ keys: ["b/4"], stem_direction: 1, duration: "16"}),

          newNote({ keys: ["e/4"], duration: "q"}),
        ];

        var textnote = [
           new VF.TextNote({text: text, line: -1, duration: "w", smooth: true}),
        ];

        return {notes: notes, notes1: notes1, textnote: textnote};

      }

      var stave = new VF.Stave(50, 20, 400);
      stave.setContext(c);
      stave.draw();

      var n = getNotes("Default Rest Positions");
      n.textnote[0].setContext(c);
      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice1 = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(n.notes);
      voice1.addTickables(n.notes1);
      voice2.addTickables(n.textnote);

      var beam = VF.Beam.applyAndGetBeams(voice, 1);
      var beam1 = VF.Beam.applyAndGetBeams(voice1, -1);

      // Set option to position rests near the notes in each voice
      Vex.Debug = false;
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2]).
        format([voice, voice1, voice2], 350, {align_rests: false});

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      for (var i = 0; i < beam.length; i++)
        beam[i].setContext(c).draw();
      for (var i = 0; i < beam1.length; i++)
        beam1[i].setContext(c).draw();

      // Draw After rest adjustment
      var stave = new VF.Stave(stave.width + stave.x, stave.y, 400);
      stave.setContext(c);
      stave.draw();

      n = getNotes("Rests Repositioned To Avoid Collisions");
      n.textnote[0].setContext(c);
      voice = new VF.Voice(VF.Test.TIME4_4);
      voice1 = new VF.Voice(VF.Test.TIME4_4);
      voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(n.notes);
      voice1.addTickables(n.notes1);
      voice2.addTickables(n.textnote);
      beam = VF.Beam.applyAndGetBeams(voice, 1);
      beam1 = VF.Beam.applyAndGetBeams(voice1, -1);

      // Set option to position rests near the notes in each voice
      Vex.Debug = true;
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2]).
        format([voice, voice1, voice2], 350, {align_rests: true});

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      for (var i = 0; i < beam.length; i++)
        beam[i].setContext(c).draw();
      for (var i = 0; i < beam1.length; i++)
        beam1[i].setContext(c).draw()
        ;
      ok(true, "Auto Adjust Rests - Two Voices");
    },

    autorestthreevoices: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 850, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function getNotes(text) {

        var notes = [
          newNote({ keys: ["b/4"], duration: "qr"}),
          newNote({ keys: ["e/5"], duration: "q"}),
          newNote({ keys: ["e/5"], duration: "qr"}),
          newNote({ keys: ["e/5"], duration: "qr"}),
          newNote({ keys: ["e/5"], duration: "q"}),
          newNote({ keys: ["e/5"], duration: "q"}),
          newNote({ keys: ["e/5"], duration: "q"}),
          newNote({ keys: ["e/5"], duration: "qr"}),
        ];

        var notes1 = [
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "q"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "q"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "q"}),
        ];

        var notes2 = [
          newNote({ keys: ["e/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["e/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["g/4"], stem_direction: -1, duration: "q"}),
          newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
          newNote({ keys: ["e/4"], stem_direction: -1, duration: "qr"}),
          newNote({ keys: ["c/4"], stem_direction: -1, duration: "q"}),
        ];

        var textnote = [
           new VF.TextNote({text: text, duration: "w", line: -1, smooth: true}),
           new VF.TextNote({text: "", duration: "w", line: -1, smooth: true}),
        ];

        return {notes: notes, notes1: notes1, notes2: notes2, textnote: textnote};

      }

      var stave = new VF.Stave(50, 20, 400).addTrebleGlyph();
      stave.setContext(c);
      stave.draw();

      var n = getNotes("Default Rest Positions");
      n.textnote[0].setContext(c);
      n.textnote[1].setContext(c);
      var voice = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      var voice1 = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      var voice2 = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      var voice3 = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      voice.addTickables(n.notes);
      voice1.addTickables(n.notes1);
      voice2.addTickables(n.notes2);
      voice3.addTickables(n.textnote);

      // Set option to position rests near the notes in each voice
      Vex.Debug = false;
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2, voice3]).
        format([voice, voice1, voice2, voice3], 350, {align_rests: false});

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      voice3.draw(c, stave);

      var stave2 = new VF.Stave(stave.width + stave.x, stave.y, 350);
      stave2.setContext(c);
      stave2.draw();

      n = getNotes("Rests Repositioned To Avoid Collisions");
      n.textnote[0].setContext(c);
      n.textnote[1].setContext(c);
      voice = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      voice1 = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      voice2 = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      voice3 = new VF.Voice({
        num_beats: 8, beat_value: 4, resolution: VF.RESOLUTION });
      voice.addTickables(n.notes);
      voice1.addTickables(n.notes1);
      voice2.addTickables(n.notes2);
      voice3.addTickables(n.textnote);

      // Set option to position rests near the notes in each voice
      Vex.Debug = true;
      var formatter2 = new VF.Formatter().
        joinVoices([voice, voice1, voice2, voice3]).
        format([voice, voice1, voice2, voice3], 350, {align_rests: true});

      voice.draw(c, stave2);
      voice1.draw(c, stave2);
      voice2.draw(c, stave2);
      voice3.draw(c, stave2);

      ok(true, "Auto Adjust Rests - three Voices #1");
    },

    autorestthreevoices2: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 950, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function getNotes(text) {

        var notes = [
          newNote({ keys: ["b/4"], duration: "16r"}),
          newNote({ keys: ["e/5"], duration: "16"}),
          newNote({ keys: ["e/5"], duration: "16r"}),
          newNote({ keys: ["e/5"], duration: "16r"}),
          newNote({ keys: ["e/5"], duration: "16"}),
          newNote({ keys: ["e/5"], duration: "16"}),
          newNote({ keys: ["e/5"], duration: "16"}),
          newNote({ keys: ["e/5"], duration: "16r"}),
        ];

        var notes1 = [
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16"}),
        ];

        var notes2 = [
          newNote({ keys: ["e/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["e/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["b/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["g/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
          newNote({ keys: ["e/4"], stem_direction: -1, duration: "16r"}),
          newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
        ];

        var textnote = [
           new VF.TextNote({text: text, duration: "h", line: -1, smooth: true}),
        ];

        return {notes: notes, notes1: notes1, notes2: notes2, textnote: textnote};

      }

      var stave = new VF.Stave(50, 20, 450).addTrebleGlyph();
      stave.setContext(c);
      stave.draw();

      var n = getNotes("Default Rest Positions");
      n.textnote[0].setContext(c);
      var voice = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      var voice1 = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      var voice2 = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      var voice3 = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      voice.addTickables(n.notes);
      voice1.addTickables(n.notes1);
      voice2.addTickables(n.notes2);
      voice3.addTickables(n.textnote);

      // Set option to position rests near the notes in each voice
      Vex.Debug = false;
      var formatter = new VF.Formatter().
        joinVoices([voice, voice1, voice2, voice3]).
        format([voice, voice1, voice2, voice3], 400, {align_rests: false});

      voice.draw(c, stave);
      voice1.draw(c, stave);
      voice2.draw(c, stave);
      voice3.draw(c, stave);

      var stave2 = new VF.Stave(stave.width + stave.x, stave.y, 425);
      stave2.setContext(c);
      stave2.draw();

      n = getNotes("Rests Repositioned To Avoid Collisions");
      n.textnote[0].setContext(c);
      voice = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      voice1 = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      voice2 = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      voice3 = new VF.Voice({
        num_beats: 2, beat_value: 4, resolution: VF.RESOLUTION });
      voice.addTickables(n.notes);
      voice1.addTickables(n.notes1);
      voice2.addTickables(n.notes2);
      voice3.addTickables(n.textnote);

      // Set option to position rests near the notes in each voice
      Vex.Debug = true;
      var formatter2 = new VF.Formatter().
        joinVoices([voice, voice1, voice2, voice3]).
        format([voice, voice1, voice2, voice3], 400, {align_rests: true});

      voice.draw(c, stave2);
      voice1.draw(c, stave2);
      voice2.draw(c, stave2);
      voice3.draw(c, stave2);

      ok(true, "Auto Adjust Rests - three Voices #2");
    }
  };

  return ThreeVoices;
})();

/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TickContext = (function() {
  var TickContext = {
    Start: function() {
      QUnit.module("TickContext");
      test("Current Tick Test", VF.Test.TickContext.currentTick);
      test("Tracking Test", VF.Test.TickContext.tracking);
    },

    currentTick: function() {
      var tc = new VF.TickContext();
      equal(tc.getCurrentTick().value(), 0, "New tick context has no ticks");
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
        createTickable().setTicks(BEAT).setWidth(30)
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
    }
  };

  return TickContext;
})();
/**
 * VexFlow - TimeSignature Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TimeSignature = (function() {
  function catchError(ts, spec) {
    try {
      ts.parseTimeSpec(spec);
    } catch (e) {
      equal(e.code, "BadTimeSignature", e.message);
    }
  }

  var TimeSignature = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("TimeSignature");
      test("Time Signature Parser", VF.Test.TimeSignature.parser);
      runTests("Basic Time Signatures", TimeSignature.basic);
      runTests("Big Signature Test", TimeSignature.big);
      runTests("Time Signature multiple staves alignment test", TimeSignature.multiStave);
      runTests("Time Signature Change Test", TimeSignature.timeSigNote);
    },

    parser: function() {
      expect(7);
      var ts = new VF.TimeSignature();

      // Invalid time signatures
      catchError(ts, "asdf");
      catchError(ts, "123/");
      catchError(ts, "/10");
      catchError(ts, "/");
      catchError(ts, "4567");
      catchError(ts, "C+");

      ts.parseTimeSpec("4/4");
      ts.parseTimeSpec("10/12");
      ts.parseTimeSpec("1/8");
      ts.parseTimeSpec("1234567890/1234567890");
      ts.parseTimeSpec("C");
      ts.parseTimeSpec("C|");

      ok(true, "all pass");
    },

    basic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 120);
      var stave = new VF.Stave(10, 10, 500);

      stave.addTimeSignature("2/2");
      stave.addTimeSignature("3/4");
      stave.addTimeSignature("4/4");
      stave.addTimeSignature("6/8");
      stave.addTimeSignature("C");
      stave.addTimeSignature("C|");

      stave.addEndTimeSignature("2/2");
      stave.addEndTimeSignature("3/4");
      stave.addEndTimeSignature("4/4");
      stave.addEndClef("treble");
      stave.addEndTimeSignature("6/8");
      stave.addEndTimeSignature("C");
      stave.addEndTimeSignature("C|");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    big: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);

      stave.addTimeSignature("12/8");
      stave.addTimeSignature("7/16");
      stave.addTimeSignature("1234567/890");
      stave.addTimeSignature("987/654321");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    multiStave: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 350);

      var stave = new VF.Stave(15, 0, 300);

      for (var i = 0; i < 5; i++) {
          if (i == 2) continue;
          stave.setConfigForLine(i, {visible: false} );
      }

      stave.addClef("percussion");
      // passing the custom padding as second parameter (in pixels)
      stave.addTimeSignature("4/4", 25);
      stave.setContext(ctx).draw();

      var stave2 = new VF.Stave(15, 110, 300);
      stave2.addClef("treble");
      stave2.addTimeSignature("4/4");
      stave2.setContext(ctx).draw();

      var connector = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx).draw();

      var stave3 = new VF.Stave(15, 220, 300);
      stave3.addClef("bass");
      stave3.addTimeSignature("4/4");
      stave3.setContext(ctx).draw();

      var connector2 = new VF.StaveConnector(stave2, stave3);
      connector2.setType(VF.StaveConnector.type.SINGLE);
      connector2.setContext(ctx).draw();

      var connector3 = new VF.StaveConnector(stave2, stave3);
      connector3.setType(VF.StaveConnector.type.BRACE);
      connector3.setContext(ctx).draw();

        ok(true, "all pass");
    },

    timeSigNote: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 900, 120);
      var stave = new VF.Stave(10, 10, 800);
      stave.addClef("treble").addTimeSignature("C|").setContext(ctx).draw();

      var notes = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble" }),
        new VF.TimeSigNote("3/4"),
        new VF.StaveNote({ keys: ["d/4"], duration: "q", clef: "alto" }),
        new VF.StaveNote({ keys: ["b/3"], duration: "qr", clef: "alto" }),
        new VF.TimeSigNote("C"),
        new VF.StaveNote({ keys: ["c/3", "e/3", "g/3"], duration: "q", clef: "bass" }),
        new VF.TimeSigNote("9/8"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble" })
      ];

      var voice = new VF.Voice({
        num_beats: 4,
        beat_value: 4,
        resolution: VF.RESOLUTION
      });
      voice.setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().
        joinVoices([voice]).format([voice], 800);

      voice.draw(ctx, stave);
      ok(true, "all pass");
    }
  };

  return TimeSignature;
})();

/**
 * VexFlow - Tuning Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Tuning = (function() {
  var Tuning = {
    Start: function() {
      QUnit.module("Tuning");
      test("Standard Tuning", VF.Test.Tuning.standard);
      test("Standard Banjo Tuning", VF.Test.Tuning.banjo);
      test("Return note for fret", VF.Test.Tuning.noteForFret);
    },

    checkStandard: function(tuning) {
      try {
        tuning.getValueForString(0);
      } catch (e) {
        equal(e.code, "BadArguments", "String 0");
      }

      try {
        tuning.getValueForString(9);
      } catch (e) {
        equal(e.code, "BadArguments", "String 7");
      }

      equal(tuning.getValueForString(6), 40, "Low E string");
      equal(tuning.getValueForString(5), 45, "A string");
      equal(tuning.getValueForString(4), 50, "D string");
      equal(tuning.getValueForString(3), 55, "G string");
      equal(tuning.getValueForString(2), 59, "B string");
      equal(tuning.getValueForString(1), 64, "High E string");
    },

    checkStandardBanjo: function(tuning) {
      try {
        tuning.getValueForString(0);
      } catch (e) {
        equal(e.code, "BadArguments", "String 0");
      }

      try {
        tuning.getValueForString(6);
      } catch (e) {
        equal(e.code, "BadArguments", "String 6");
      }

      equal(tuning.getValueForString(5), 67, "High G string");
      equal(tuning.getValueForString(4), 50, "D string");
      equal(tuning.getValueForString(3), 55, "G string");
      equal(tuning.getValueForString(2), 59, "B string");
      equal(tuning.getValueForString(1), 62, "High D string");
    },

    banjo: function() {
      expect(7);

      var tuning = new VF.Tuning();
      tuning.setTuning("standardBanjo");
      VF.Test.Tuning.checkStandardBanjo(tuning);
    },

    standard: function() {
      expect(16);

      var tuning = new VF.Tuning();
      VF.Test.Tuning.checkStandard(tuning);

      // Test named tuning
      tuning.setTuning("standard");
      VF.Test.Tuning.checkStandard(tuning);
    },

    noteForFret: function() {
      expect(8);
      var tuning = new VF.Tuning("E/5,B/4,G/4,D/4,A/3,E/3");
      try {
        tuning.getNoteForFret(-1, 1);
      } catch(e) {
        equal(e.code, "BadArguments", "Fret -1");
      }

      try {
        tuning.getNoteForFret(1, -1);
      } catch(e) {
        equal(e.code, "BadArguments", "String -1");
      }

      equal(tuning.getNoteForFret(0, 1), "E/5", "High E string");
      equal(tuning.getNoteForFret(5, 1), "A/5", "High E string, fret 5");
      equal(tuning.getNoteForFret(0, 2), "B/4", "B string");
      equal(tuning.getNoteForFret(0, 3), "G/4", "G string");
      equal(tuning.getNoteForFret(12, 2), "B/5", "B string, fret 12");
      equal(tuning.getNoteForFret(0, 6), "E/3", "Low E string");
    }
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
      var vf = VF.Test.makeFactory(options, 350, 160);
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
        { keys: ['c/4'], duration: '8' },
        { keys: ['d/4'], duration: '8' },
        { keys: ['e/4'], duration: '8' },
      ].map(stemUp).map(vf.StaveNote.bind(vf));

      vf.Beam({ notes: notes.slice(0, 11) });
      vf.Tuplet({
        notes: notes.slice(0, 11),
        options: {
          notes_occupied: 142,
          ratioed: true,
        },
      });

      vf.Tuplet({
        notes: notes.slice(11, 14),
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
      QUnit.module("Vibrato");
      runTests("Simple Vibrato", Vibrato.simple);
      runTests("Harsh Vibrato", Vibrato.harsh);
      runTests("Vibrato with Bend", Vibrato.withBend);
    },

    simple: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 140);

      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newVibrato() { return new VF.Vibrato(); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "h" }).
          addModifier(newVibrato(), 0),
        newNote({
          positions: [{str: 2, fret: 10}], duration: "h" }).
          addModifier(newVibrato(), 0)
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      ok(true, "Simple Vibrato");
    },

    harsh: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 240);

      ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newVibrato() { return new VF.Vibrato(); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "h" }).
          addModifier(newVibrato().setHarsh(true), 0),
        newNote({
          positions: [{str: 2, fret: 10}], duration: "h" }).
          addModifier(newVibrato().setHarsh(true), 0)
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      ok(true, "Harsh Vibrato");
    },

    withBend: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 500, 240);
      ctx.scale(1.3, 1.3); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
      ctx.setFont("Arial", VF.Test.Font.size, "");
      var stave = new VF.TabStave(10, 10, 450).
        addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text, release) { return new VF.Bend(text, release); }
      function newVibrato() { return new VF.Vibrato(); }

      var notes = [
        newNote({
          positions: [{str: 2, fret: 9}, {str: 3, fret: 9}], duration: "q" }).
          addModifier(newBend("1/2", true), 0).
          addModifier(newBend("1/2", true), 1).
          addModifier(newVibrato(), 0),
        newNote({
          positions: [{str: 2, fret: 10}], duration: "q" }).
          addModifier(newBend("Full", false), 0).
          addModifier(newVibrato().setVibratoWidth(60), 0),
        newNote({
          positions: [{str: 2, fret: 10}], duration: "h" }).
          addModifier(newVibrato().setVibratoWidth(120).setHarsh(true), 0)
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      ok(true, "Vibrato with Bend");
    }
  };

  return Vibrato;
})();
/**
 * VexFlow - VibratoBracket Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 * Author: Balazs Forian-Szabo
 */

VF.Test.VibratoBracket = (function(){
  var VibratoBracket = {
    Start: function() {
      QUnit.module("VibratoBracket");
      VF.Test.runTests("Simple VibratoBracket", VF.Test.VibratoBracket.simple);
      VF.Test.runTests("Harsh VibratoBracket Without End Note", VF.Test.VibratoBracket.harsh);
      VF.Test.runTests("Harsh VibratoBracket Without Start Note", VF.Test.VibratoBracket.harsh2);
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 650, 200);
      ctx.scale(1, 1);
      var stave = new VF.Stave(10, 40, 550).addTrebleGlyph();
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var vibrato = new VF.VibratoBracket({
        start: notes[0],
        stop: notes[3],
      });
      vibrato.setLine(2);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);

      vibrato.setContext(ctx).draw();
      ok(true, "VibratoBracket Simple");
    },

    harsh: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 650, 200);
      ctx.scale(1, 1);

      var stave = new VF.Stave(10, 40, 550).addTrebleGlyph();
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var vibrato = new VF.VibratoBracket({
        start: notes[2],
        stop: null,
      });
      vibrato.setLine(2);
      vibrato.setHarsh(true);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);

      vibrato.setContext(ctx).draw();
      ok(true, "VibratoBracket Harsh No End");
    },

    harsh2: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 650, 200);
      ctx.scale(1, 1);

      var stave = new VF.Stave(10, 40, 550);
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var vibrato = new VF.VibratoBracket({
        start: null,
        stop: notes[2],
      });
      vibrato.setLine(2);
      vibrato.setHarsh(true);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);

      vibrato.setContext(ctx).draw();
      ok(true, "VibratoBracket Harsh No Start");
    }
  };

  return VibratoBracket;
})();

/**
 * VexFlow - Voice Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Voice = (function() {
  var Voice = {
    Start: function() {
      QUnit.module("Voice");
      test("Strict Test", VF.Test.Voice.strict);
      test("Ignore Test", VF.Test.Voice.ignore);
      VF.Test.runTests("Full Voice Mode Test", VF.Test.Voice.full);
    },

    strict: function(options) {
      expect(7);
      function createTickable() {
        return new VF.Test.MockTickable(VF.Test.TIME4_4);
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables = [
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT)
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      equal(voice.totalTicks.value(), BEAT * 4, "4/4 Voice has 4 beats");
      equal(voice.ticksUsed.value(), BEAT * 0, "No beats in voice");
      voice.addTickables(tickables);
      equal(voice.ticksUsed.value(), BEAT * 3, "Three beats in voice");
      voice.addTickable(createTickable().setTicks(BEAT));
      equal(voice.ticksUsed.value(), BEAT * 4, "Four beats in voice");
      equal(voice.isComplete(), true, "Voice is complete");

      try {
        voice.addTickable(createTickable().setTicks(BEAT));
      } catch (e) {
        equal(e.code, "BadArgument", "Too many ticks exception");
      }

      equal(voice.getSmallestTickCount().value(), BEAT, "Smallest tick count is BEAT");
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
        createTickable().setTicks(BEAT)
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(tickables);
      ok(true, "all pass");
    },

    full: function(options, contextBuilder) {
      var ctx  = contextBuilder(options.canvas_sel, 550, 200);

      var stave = new VF.Stave(10, 50, 500);
      stave.addClef("treble").addTimeSignature("4/4").
        setEndBarType(VF.Barline.type.END).setContext(ctx).draw();

      var notes = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["b/4"], duration: "qr" })
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.FULL);
      voice.addTickables(notes);

      new VF.Formatter().joinVoices([voice]).format([voice], 500);
      voice.draw(ctx, stave);
      voice.getBoundingBox().draw(ctx);

      try {
        voice.addTickable(
          new VF.StaveNote({ keys: ["c/4"], duration: "h" })
        );
      } catch (e) {
        equal(e.code, "BadArgument", "Too many ticks exception");
      }
    }
  };

  return Voice;
})();
VF.Test.run = function () {
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
  VF.Test.Factory.Start();
  VF.Test.Parser.Start();
  VF.Test.EasyScore.Start();
  VF.Test.Registry.Start();
  VF.Test.BachDemo.Start();
}

module.exports = VF.Test;

//# sourceMappingURL=vexflow-tests.js.map