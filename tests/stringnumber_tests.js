/**
 * VexFlow - Basic Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.StringNumber = {}

Vex.Flow.Test.StringNumber.Start = function() {
  module("StringNumber");
  Vex.Flow.Test.runTest("String Number In Notation (Canvas)",
      Vex.Flow.Test.StringNumber.drawMultipleMeasures);
  Vex.Flow.Test.runRaphaelTest("String Number In Notation (Raphael)",
	  Vex.Flow.Test.StringNumber.drawMultipleMeasures);
  Vex.Flow.Test.runTest("Fret Hand Finger In Notation (Canvas)",
      Vex.Flow.Test.StringNumber.drawFretHandFingers);
  Vex.Flow.Test.runRaphaelTest("Fret Hand Finger In Notation (Raphael)",
      Vex.Flow.Test.StringNumber.drawFretHandFingers);
};

Vex.Flow.Test.StringNumber.drawMultipleMeasures = function(options, contextBuilder) {
  // Get the rendering context
  var ctx = contextBuilder(options.canvas_sel, 600, 200);
  function newStringNumber(num, pos) { 
    return new Vex.Flow.StringNumber(num).setPosition(pos); 
  }

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 50, 290);
  staveBar1.setEndBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar1.addClef("treble").setContext(ctx).draw();
  staveBar1.setContext(ctx).draw();
  var notesBar1 = [
    new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: -1, duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: -1, duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
  ];
  
  notesBar1[0].
    addModifier(0, newStringNumber("5", Vex.Flow.Modifier.Position.RIGHT)).
    addModifier(1, newStringNumber("4", Vex.Flow.Modifier.Position.LEFT)).
    addModifier(2, newStringNumber("3", Vex.Flow.Modifier.Position.RIGHT));
    
   notesBar1[1].
    addAccidental(0, new Vex.Flow.Accidental("#")).
    addModifier(0, newStringNumber("5", Vex.Flow.Modifier.Position.BELOW)).
    addAccidental(1, new Vex.Flow.Accidental("#")).
    addModifier(2, newStringNumber("3",Vex.Flow.Modifier.Position.ABOVE).
                                       setLastNote(notesBar1[3]).
                                       setLineEndType(Vex.Flow.Renderer.LineEndType.DOWN));
  
  notesBar1[2].
    addModifier(2, newStringNumber("3", Vex.Flow.Modifier.Position.LEFT)).
    addAccidental(1, new Vex.Flow.Accidental("#"));
   
  // Position 4 below default
  notesBar1[3].
    addModifier(0, newStringNumber("5", Vex.Flow.Modifier.Position.RIGHT).setOffsetY(4)).
      // Position 4 below default
    addModifier(1, newStringNumber("4", Vex.Flow.Modifier.Position.RIGHT).setOffsetY(4)).  
      // Position 6 above default
    addModifier(2, newStringNumber("3", Vex.Flow.Modifier.Position.RIGHT).setOffsetY(-6)); 

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);


  // bar 2 - juxtaposing second bar next to first bar
  var staveBar2 = new Vex.Flow.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
  staveBar2.setEndBarType(Vex.Flow.Barline.type.END);
  staveBar2.setContext(ctx).draw();

  var notesBar2 = [
    new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: 1, duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: 1, duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: 1, duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: 1, duration: "q" }),
  ];

  notesBar2[0].
    addModifier(0, newStringNumber("5", Vex.Flow.Modifier.Position.RIGHT)).
    addModifier(1, newStringNumber("4", Vex.Flow.Modifier.Position.LEFT)).
    addModifier(2, newStringNumber("3", Vex.Flow.Modifier.Position.RIGHT));
    
  notesBar2[1].
    addAccidental(0, new Vex.Flow.Accidental("#")).
    addModifier(0, newStringNumber("5", Vex.Flow.Modifier.Position.BELOW)).
    addAccidental(1, new Vex.Flow.Accidental("#")).
    addModifier(2, newStringNumber("3", Vex.Flow.Modifier.Position.ABOVE).setLastNote(notesBar2[3]).setDashed(false));
  
  notesBar2[2].
    addModifier(2, newStringNumber("3", Vex.Flow.Modifier.Position.LEFT)).
    addAccidental(1, new Vex.Flow.Accidental("#"));
  //  addAccidental(0, new Vex.Flow.Accidental("#"));
   
  notesBar2[3].
    // Position 4 below default
    addModifier(0, newStringNumber("5", Vex.Flow.Modifier.Position.RIGHT).setOffsetY(4)).
    // Position 4 bwlow default
    addModifier(1, newStringNumber("4", Vex.Flow.Modifier.Position.RIGHT).setOffsetY(4)).  
    // Position 6 above default
    addModifier(2, newStringNumber("3", Vex.Flow.Modifier.Position.RIGHT).setOffsetY(-6)); 

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
 
  ok(true, "String Number");
}

Vex.Flow.Test.StringNumber.drawFretHandFingers = function(options, contextBuilder) {
  // Get the rendering context
  var ctx = contextBuilder(options.canvas_sel, 600, 200);
  function newFinger(num, pos) { 
    return new Vex.Flow.FretHandFinger(num).setPosition(pos); 
  }
  function newStringNumber(num, pos) { 
    return new Vex.Flow.StringNumber(num).setPosition(pos); 
  }

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 50, 290);
  staveBar1.setEndBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar1.addClef("treble").setContext(ctx).draw();
  staveBar1.setContext(ctx).draw();
  var notesBar1 = [
    new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: -1, duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: -1, duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
  ];
  
  notesBar1[0].
    addModifier(0, newFinger("3", Vex.Flow.Modifier.Position.LEFT)).
    addModifier(1, newFinger("2", Vex.Flow.Modifier.Position.LEFT)).
    addModifier(2, newFinger("0", Vex.Flow.Modifier.Position.Left));
    
   notesBar1[1].
    addAccidental(0, new Vex.Flow.Accidental("#")).
    addModifier(0, newFinger("3", Vex.Flow.Modifier.Position.LEFT)).
    addModifier(1, newFinger("2", Vex.Flow.Modifier.Position.LEFT)).
    addAccidental(1, new Vex.Flow.Accidental("#")).
    addModifier(2, newFinger("0", Vex.Flow.Modifier.Position.LEFT));
  
  notesBar1[2].
    addModifier(0, newFinger("3", Vex.Flow.Modifier.Position.BELOW)).
    addModifier(1, newFinger("4", Vex.Flow.Modifier.Position.LEFT)).
    addModifier(2, newFinger("0", Vex.Flow.Modifier.Position.ABOVE)).
    addAccidental(1, new Vex.Flow.Accidental("#"));
   
  notesBar1[3].
    addModifier(0, newFinger("3", Vex.Flow.Modifier.Position.RIGHT)).
    addModifier(1, newFinger("4", Vex.Flow.Modifier.Position.RIGHT)).  
      // Position 5 above default
    addModifier(2, newFinger("0", Vex.Flow.Modifier.Position.RIGHT).setOffsetY(-5)). 
    addModifier(0, newStringNumber("5", Vex.Flow.Modifier.Position.RIGHT).setOffsetY(4)).
    // Position 4 below default
    addModifier(1, newStringNumber("4", Vex.Flow.Modifier.Position.RIGHT).setOffsetY(4)).  
    // Position 6 above default
    addModifier(2, newStringNumber("3", Vex.Flow.Modifier.Position.RIGHT).setOffsetY(-6)); 

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);


  // bar 2 - juxtaposing second bar next to first bar
  var staveBar2 = new Vex.Flow.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
  staveBar2.setEndBarType(Vex.Flow.Barline.type.END);
  staveBar2.setContext(ctx).draw();

  var notesBar2 = [
    new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: 1, duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: 1, duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: 1, duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: 1, duration: "q" }),
  ];

  notesBar2[0].
  addModifier(0, newFinger("3", Vex.Flow.Modifier.Position.LEFT)).
  addModifier(1, newFinger("2", Vex.Flow.Modifier.Position.LEFT)).
  addModifier(2, newFinger("0", Vex.Flow.Modifier.Position.Left));
  
 notesBar2[1].
  addAccidental(0, new Vex.Flow.Accidental("#")).
  addModifier(0, newFinger("3", Vex.Flow.Modifier.Position.RIGHT)).
  addModifier(1, newFinger("2", Vex.Flow.Modifier.Position.RIGHT)).
  addAccidental(1, new Vex.Flow.Accidental("#")).
  addModifier(2, newFinger("0", Vex.Flow.Modifier.Position.RIGHT));

notesBar2[2].
  addModifier(0, newFinger("3", Vex.Flow.Modifier.Position.BELOW)).
  addModifier(1, newFinger("2", Vex.Flow.Modifier.Position.RIGHT)).
  addModifier(2, newFinger("1", Vex.Flow.Modifier.Position.ABOVE)).
  addAccidental(2, new Vex.Flow.Accidental("#"));
 
notesBar2[3].
  addModifier(0, newFinger("3", Vex.Flow.Modifier.Position.RIGHT)).
  // Position 5 below default
  addModifier(1, newFinger("4", Vex.Flow.Modifier.Position.RIGHT)).  
  addModifier(2, newFinger("1", Vex.Flow.Modifier.Position.RIGHT).setOffsetY(-5)); 

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
 
  ok(true, "String Number");
}
