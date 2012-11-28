/**
 * VexFlow - Bounding Box Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.BoundingBox = {}

Vex.Flow.Test.BoundingBox.Start = function() {
  module("BoundingBox");
  test("Initialization Test", Vex.Flow.Test.BoundingBox.initialization);
  test("Merging Text", Vex.Flow.Test.BoundingBox.merging);
}

Vex.Flow.Test.BoundingBox.initialization = function() {
  var bb = new Vex.Flow.BoundingBox();
  equal(bb.getX(), 0, "Bad X");
  equal(bb.getY(), 0, "Bad Y");
  equal(bb.getW(), 0, "Bad W");
  equal(bb.getH(), 0, "Bad H");
}

Vex.Flow.Test.BoundingBox.merging = function() {
  var bb1 = new Vex.Flow.BoundingBox(10, 10, 10, 10);
  var bb2 = new Vex.Flow.BoundingBox(15, 20, 10, 10);

  equal(bb1.getX(), 10, "Bad X for bb1");
  equal(bb2.getX(), 15, "Bad X for bb2");

  bb1.mergeWith(bb2);
  equal(bb1.getX(), 10);
  equal(bb1.getY(), 10);
  equal(bb1.getW(), 15);
  equal(bb1.getH(), 20);
}
