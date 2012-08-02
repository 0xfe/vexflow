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

Vex.Flow.Test.Voice.basic = function() {
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
  equal(voice.totalTicks, BEAT * 4, "4/4 Voice has 4 beats");
  equal(voice.ticksUsed, BEAT * 0, "No beats in voice");
  voice.addTickables(tickables);
  equal(voice.ticksUsed, BEAT * 3, "Three beats in voice");
  voice.addTickable(createTickable().setTicks(BEAT));
  equal(voice.ticksUsed, BEAT * 4, "Four beats in voice");
  equal(voice.isComplete(), true, "Voice is complete");

  try {
    voice.addTickable(createTickable().setTicks(BEAT));
  } catch (e) {
    equal(e.code, "BadArgument", "Too many ticks exception");
  }

  equal(voice.getSmallestTickCount(), BEAT, "Smallest tick count is BEAT");
}

Vex.Flow.Test.Voice.ignore = function() {
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
