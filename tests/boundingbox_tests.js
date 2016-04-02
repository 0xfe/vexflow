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