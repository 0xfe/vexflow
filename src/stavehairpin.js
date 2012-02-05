// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// This class by Raffaele Viglianti, 2012 http://itisnotsound.wordpress.com/
//
// This class implements hairpins between notes. 
// Hairpins can be either Crescendo or Descrescendo.

/**
 * Create a new hairpin from the specified notes.
 *
 * @constructor
 * @param {!Object} notes The notes to tie up.
 * @param {!Object} type The type of hairpin
 */
Vex.Flow.StaveHairpin = function(notes, type) {
  if (arguments.length > 0) this.init(notes, type);
}

Vex.Flow.StaveHairpin.type = {
  CRESC: 1,
  DECRESC: 2
};

Vex.Flow.StaveHairpin.prototype.init = function(notes, type) {
  /**
   * Notes is a struct that has:
   *
   *  {
   *    first_note: Note,
   *    last_note: Note,
   *  }
   *
   **/

  this.notes = notes;
  this.hairpin = type;
  this.position = Vex.Flow.Modifier.Position.BELOW;
  
  this.context = null;

  this.render_options = {
      height: 10,
      vo: 20, //vertical offset
      left_ho: 0, //left horizontal offset
      right_ho: 0 // right horizontal offset
    };

  this.setNotes(notes);
}

Vex.Flow.StaveHairpin.prototype.setContext = function(context) {
  this.context = context;
  return this; }
  
Vex.Flow.StaveHairpin.prototype.setPosition = function(position) {
  if (position == Vex.Flow.Modifier.Position.ABOVE ||
      position == Vex.Flow.Modifier.Position.BELOW)
    this.position = position;
  return this;
}

Vex.Flow.StaveHairpin.prototype.setRenderOptions = function(options) {
  if (options.height != undefined && 
      options.vo != undefined && 
      options.left_ho != undefined && 
      options.right_ho != undefined){ 
    this.render_options = options;}
  return this;
}

/**
 * Set the notes to attach this hairpin to.
 *
 * @param {!Object} notes The start and end notes.
 */
Vex.Flow.StaveHairpin.prototype.setNotes = function(notes) {
  if (!notes.first_note && !notes.last_note)
    throw new Vex.RuntimeError("BadArguments",
        "Hairpin needs to have either first_note or last_note set.");

  // Success. Lets grab 'em notes.
  this.first_note = notes.first_note;
  this.last_note = notes.last_note;
  return this;
}

Vex.Flow.StaveHairpin.prototype.renderHairpin = function(params) {

  var ctx = this.context;
  
  var dis = this.render_options.vo;
  var y_shift = params.first_y;
  
  if (this.position == Vex.Flow.Modifier.Position.ABOVE) {
    dis = -dis +30;
    y_shift = params.first_y - params.staff_height;
  }
  
  var l_ho = this.render_options.left_ho;
  var r_ho = this.render_options.right_ho;
  
  switch (this.hairpin) {
    case Vex.Flow.StaveHairpin.type.CRESC:
      ctx.moveTo(params.last_x + r_ho, y_shift + dis);
      ctx.lineTo(params.first_x + l_ho, y_shift +(this.render_options.height/2) + dis); 
      ctx.lineTo(params.last_x + r_ho, y_shift + this.render_options.height + dis);
      break;
    case Vex.Flow.StaveHairpin.type.DECRESC:
      ctx.moveTo(params.first_x + l_ho, y_shift + dis);
      ctx.lineTo(params.last_x + r_ho, y_shift +(this.render_options.height/2) + dis); 
      ctx.lineTo(params.first_x + l_ho, y_shift + this.render_options.height + dis);
      break;
    default:
      // Default is NONE, so nothing to draw
      break;
  }
  
  ctx.stroke();
}

Vex.Flow.StaveHairpin.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw Hairpin without a context.");

  var first_note = this.first_note;
  var last_note = this.last_note;
  
  var start = first_note.getModifierStartXY(this.position, this.index);
  var end = last_note.getModifierStartXY(this.position, this.index);
  
  this.renderHairpin({
    first_x: start.x,
    last_x: end.x,
    first_y: first_note.getStave().y + first_note.getStave().height,
    last_y: last_note.getStave().y + last_note.getStave().height,
    staff_height: first_note.getStave().height
  });

 return true;
 
}