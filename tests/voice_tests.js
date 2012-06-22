/**
 * VexFlow - Voice Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Voice = {}

Vex.Flow.Test.Voice.Start = function() {
  module("Voice");
  test("Basic Test", Vex.Flow.Test.Voice.basic);
  test("Ignore Test", Vex.Flow.Test.Voice.ignore);
}

Vex.Flow.Test.Voice.basic = function(options) {
  expect(7);
  function createTickable() {
    return new Vex.Flow.Test.MockTickable(Vex.Flow.Test.TIME4_4);
  }

  var R = Vex.Flow.RESOLUTION;
  var BEAT = 1 * R / 4;

  var tickables = [
    createTickable().setTicks(BEAT),
    createTickable().setTicks(BEAT),
    createTickable().setTicks(BEAT)
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  equals(voice.totalTicks.value(), BEAT * 4, "4/4 Voice has 4 beats");
  equals(voice.ticksUsed.value(), BEAT * 0, "No beats in voice");
  voice.addTickables(tickables);
  equals(voice.ticksUsed.value(), BEAT * 3, "Three beats in voice");
  voice.addTickable(createTickable().setTicks(BEAT));
  equals(voice.ticksUsed.value(), BEAT * 4, "Four beats in voice");
  equals(voice.isComplete(), true, "Voice is complete");

  try {
    voice.addTickable(createTickable().setTicks(BEAT));
  } catch (e) {
    equals(e.code, "BadArgument", "Too many ticks exception");
  }

  equals(voice.getSmallestTickCount().value(), BEAT, "Smallest tick count is BEAT");
}

Vex.Flow.Test.Voice.ignore = function(options) {
  function createTickable() {
    return new Vex.Flow.Test.MockTickable(Vex.Flow.Test.TIME4_4);
  }

  var R = Vex.Flow.RESOLUTION;
  var BEAT = 1 * R / 4;

  var tickables = [
    createTickable().setTicks(BEAT),
    createTickable().setTicks(BEAT),
    createTickable().setTicks(BEAT).setIgnoreTicks(true),
    createTickable().setTicks(BEAT),
    createTickable().setTicks(BEAT).setIgnoreTicks(true),
    createTickable().setTicks(BEAT)
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(tickables);
  ok(true, "all pass");
}

