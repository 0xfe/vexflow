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
