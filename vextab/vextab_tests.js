/**
 * VexTab Parser Tests
 * Copyright Mohit Cheppudira 2010 <mohit@muthanna.com>
 *
 * These tests simply check if parsing different types of strings
 * succeed or fail. They don't verify if the correct elements are
 * created. That part will be added after I factor the element generation
 * out of the parser.
 */

if (!Vex.Flow.Test) Vex.Flow.Test = {};

Vex.Flow.Test.VexTab = {}

Vex.Flow.Test.VexTab.Start = function() {
  module("VexTab Parser");
  test("Basic Test", Vex.Flow.Test.VexTab.basic);
  test("String/Fret Test", Vex.Flow.Test.VexTab.stringFret);
  test("MultiFret Test", Vex.Flow.Test.VexTab.multiFret);
  test("Tie Test", Vex.Flow.Test.VexTab.tie);
  test("Bend Test", Vex.Flow.Test.VexTab.bend);
  test("Vibrato Test", Vex.Flow.Test.VexTab.vibrato);
  test("Chord Test", Vex.Flow.Test.VexTab.chord);
  test("Tapping Test", Vex.Flow.Test.VexTab.tapping);
  test("Chord Ties Test", Vex.Flow.Test.VexTab.chordTies);
  test("Duration Test", Vex.Flow.Test.VexTab.duration);
  test("Notation Only Test", Vex.Flow.Test.VexTab.notationOnly);
}

Vex.Flow.Test.VexTab.catchError = function(tab, code) {
  try {
    tab.parse(code);
  } catch (e) {  equals(e.code, "ParseError", e.message); }
}

Vex.Flow.Test.VexTab.basic = function() {
  expect(2);
  var tab = new Vex.Flow.VexTab();
  Vex.Flow.Test.VexTab.catchError(tab, "xyz");

  ok(true, "all pass");
}

Vex.Flow.Test.VexTab.stringFret = function() {
  expect(5);
  var tab = new Vex.Flow.VexTab();

  tab.parse("notes 10/2 10/3");
  ok(true, "One fret per string.");

  Vex.Flow.Test.VexTab.catchError(tab, "notes /2 10/3");
  Vex.Flow.Test.VexTab.catchError(tab, "notes j/2 10/3");
  Vex.Flow.Test.VexTab.catchError(tab, "notes 4");

  ok(true, "all pass");
}

Vex.Flow.Test.VexTab.multiFret = function() {
  expect(5);
  var tab = new Vex.Flow.VexTab();

  tab.parse("notes 10-11/3");
  ok(true, "Multiple frets per string.");

  tab.parse("notes 10-11-12-13-15/3 5-4-3-2-1/2");
  ok(true, "Lots of frets");

  Vex.Flow.Test.VexTab.catchError(tab, "notes 10/2-10");
  Vex.Flow.Test.VexTab.catchError(tab, "notes 10-/2");
  ok(true, "all pass");
}

Vex.Flow.Test.VexTab.tie = function() {
  expect(5);
  var tab = new Vex.Flow.VexTab();

  tab.parse("notes 10s11/3");
  ok(true, "Simple slide.");

  tab.parse("notes 10s11h12p10/3");
  ok(true, "Effect mix - 10s11h12p10.");

  Vex.Flow.Test.VexTab.catchError(tab, "notes 10/2s10");
  Vex.Flow.Test.VexTab.catchError(tab, "notes 10s");

  ok(true, "all pass");
}

Vex.Flow.Test.VexTab.bend = function() {
  expect(5);
  var tab = new Vex.Flow.VexTab();

  tab.parse("notes 10b11/3");
  ok(true, "Simple bend.");

  tab.parse("notes 10b11s12/3");
  ok(true, "Bend then slide.");

  tab.parse("notes 10s11b12/3");
  ok(true, "Slide then bend.");

  Vex.Flow.Test.VexTab.catchError(tab, "notes 10b12b10b-/2");

  ok(true, "all pass");
}

Vex.Flow.Test.VexTab.vibrato = function() {
  expect(10);
  var tab = new Vex.Flow.VexTab();

  tab.parse("notes 10v/3");
  ok(true, "Simple vibrato.");

  tab.parse("notes 10-11v-12v/3");
  ok(true, "Multi-note vibrato");

  tab.parse("notes 10b11v-12/3");
  ok(true, "Bend then vibrato");

  tab.parse("notes 10b11b10v-12/3");
  ok(true, "Bend then release then vibrato");

  tab.parse("notes 10s11v-12/3");
  ok(true, "Slide then vibrato");

  tab.parse("notes 10s11vs4s12vh15p10-1/2");
  ok(true, "Big mix");

  Vex.Flow.Test.VexTab.catchError(tab, "notes 10v");
  Vex.Flow.Test.VexTab.catchError(tab, "notes 10vb/1");
  Vex.Flow.Test.VexTab.catchError(tab, "notes 10-b11/3");

  ok(true, "all pass");
}

Vex.Flow.Test.VexTab.chord = function() {
  expect(7);
  var tab = new Vex.Flow.VexTab();

  tab.parse("notes (4/6)");
  ok(true, "One note chord.");

  tab.parse("notes (4/5.6/7)");
  ok(true, "Two note chord.");

  Vex.Flow.Test.VexTab.catchError(tab, "notes (4");
  Vex.Flow.Test.VexTab.catchError(tab, "notes (4/)");
  Vex.Flow.Test.VexTab.catchError(tab, "notes (/5)");
  Vex.Flow.Test.VexTab.catchError(tab, "notes (4/5.)");

  ok(true, "all pass");
}

Vex.Flow.Test.VexTab.tapping = function() {
  expect(5);
  var tab = new Vex.Flow.VexTab();

  tab.parse("notes t5p4p3/3");
  ok(true, "Start with tap.");

  tab.parse("notes 5t12p5-4-3/1");
  ok(true, "Tap in the middle.");

  Vex.Flow.Test.VexTab.catchError(tab, "notes 5t/4");
  Vex.Flow.Test.VexTab.catchError(tab, "notes t-4-4h5/3");

  ok(true, "all pass");
}

Vex.Flow.Test.VexTab.chordTies = function() {
  expect(8);
  var tab = new Vex.Flow.VexTab();

  tab.parse("notes (1/2.2/3)s(3/2.4/3)");
  ok(true, "Simple chord slide.");

  tab.parse("notes (1/2.2/3.3/4)s(3/2.4/3.5/4)");
  ok(true, "Four note chord slide.");

  tab.parse("notes (4/5.1/2.2/3)s(3/2.4/3)");
  ok(true, "Mixed note count chord slide.");

  tab.parse("notes (1/2.2/3)s(3/2.5/5.4/3)");
  ok(true, "Reverse note count chord slide.");

  tab.parse("notes (1/2.2/3)s(3/2.4/3)h(6/2.7/3)");
  ok(true, "Slide then hammer");

  tab.parse("notes t(1/2.2/3)s(3/2.4/3)h(6/2.7/3)");
  ok(true, "Tap a chord, then slide and hammer");

  Vex.Flow.Test.VexTab.catchError(tab, "notes (1/2.2/3)s3/3");

  ok(true, "all pass");
}

Vex.Flow.Test.VexTab.duration = function() {
  var tab = new Vex.Flow.VexTab();

  tab.parse("notes :w (1/2.2/3)s(3/2.4/3)");
  ok(true, "Simple duration.");

  tab.parse("notes :h (1/2.2/3)s(3/2.4/3) :q 1/2");
  ok(true, "Duration changes duration.");

  ok(true, "all pass");
}

Vex.Flow.Test.VexTab.notationOnly = function() {
  var tab = new Vex.Flow.VexTab();

  tab.parse("tabstave notation=true");
  ok(true, "tabstave notation and tablature");

  tab.parse("notes :w 1/2 | 1/3 | 1/5 | 1/4");
  ok(true, "Simple stave with bars, notes and tabs.");

  tab.parse("tabstave notation=true tablature=false");
  ok(true, "tabstave just notation");

  tab.parse("notes :w 1/2 | 1/3 | 1/5 | 1/4");
  ok(true, "Simple stave with bars, notes and no tabs.");

  Vex.Flow.Test.VexTab.catchError(tab, "tabstave notation=false tablature=false");

  /* CLEF TESTS */
  clefs = ["treble", "alto", "tenor", "bass"]
  for (var i = 0; i < clefs.lenght; i++) {
    clef = clefs[i];
    tab.parse("tabstave notation=true clef=" + clef)
    ok(true, "Simple stave with " + clef + " clef")

    tab.parse("tabstave clef=" + clef)
    ok(true, "Simple stave with " + clef + " clef but notation off")
  }
  Vex.Flow.Test.VexTab.catchError(tab, "tabstave clef=blah")

  /* KEY SIGNATURE TESTS */
  for (var key in Vex.Flow.keySignature.keySpecs) {
    tab.parse("tabstave key=" + key)
    ok(true, "Notation plus Key Signature for " + key)

    tab.parse("tabstave notation=true key=" + key)
    ok(true, "Notation plus Key Signature for " + key)

    tab.parse("tabstave notation=true tablature=true key=" + key)
    ok(true, "Notation plus Tablature plus Key Signature for " + key)
  }
  Vex.Flow.Test.VexTab.catchError(tab, "tabstave notation=true key=rrr")

  /* TIME SIGNATURE TESTS */
  times = ["C", "C|", "2/4", "4/4", "100/4"];
  for (var i = 0; i < times.length; i++ ) {
    time = times[i];
    tab.parse("tabstave time=" + time)
    ok(true, "Notation plus Time Signature for " + time)

    tab.parse("tabstave notation=true time=" + time)
    ok(true, "Notation plus Time Signature for " + time)

    tab.parse("tabstave notation=true tablature=true time=" + time)
    ok(true, "Notation plus Tablature plus Time Signature for " + time)
  }
  Vex.Flow.Test.VexTab.catchError(tab, "tabstave notation=true time=rrr")

  ok(true, "all pass");
}
