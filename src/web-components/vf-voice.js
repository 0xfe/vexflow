// ## Description
// 
// This file implements `vf-voice`, the web component that resembles 
// the `Voice` element. 
// 
// FOR THIS PR: One `vf-voice` is comprised from a text string, written in 
// Grammer of the EasyScore API parser.  
// `vf-voice` is responsible for generating the notes from the text string. 
// Once the notes are created, `vf-voice` dispatches an event to its parent
// `vf-stave` to signal that it's ready to be created and added to the stave. 

import Vex from '../index';
import './vf-stave';

const template = document.createElement('template');
template.innerHTML = `
`;

export class VFVoice extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(document.importNode(template.content, true));

    // Defaults
    this.stem = 'up';
    this.autoBeam = false;

    this.notes = [];
    this.beams = [];

    this._vf = undefined;
    this._score = undefined;
  }

  connectedCallback() {
    this.stem = this.getAttribute('stem') || this.stem;
    this.autoBeam = this.hasAttribute('autoBeam');

    const vfVoiceReadyEvent = new CustomEvent('vfVoiceReady', { bubbles: true });
    this.dispatchEvent(vfVoiceReadyEvent);
  }

   /**
   * Setter to detect when the Factory instance is set. Once the Factory and
   * EasyScore instances are set, vf-voice can start creating components. 
   * 
   * @param {Vex.Flow.Factory} value - The Factory instance that the overall 
   *                                   component is using, set by the parent vf-score.
   */
  set vf(value) {
    this._vf = value;
    this.createNotes();
  }

   /**
   * Setter to detect when the EasyScore instance is set. Once the Factory and
   * EasyScore instances are set, vf-voice can start creating components. 
   * 
   * @param {Vex.Flow.EasyScore} value - The EasyScore instance that the parent stave and 
   *                                   its children are using, set by the parent vf-stave.
   */
  set score(value) {
    this._score = value;
    this.createNotes();
  }

  /**
   * Creates notes (and optionally, beams) from the text content of this vf-voice element.
   */
  createNotes = () => {
    if (this._vf && this._score) {
      const notes = this.createNotesFromText(this.textContent.trim());
      // Maintaining notes in an array to set-up for future child components that will provide their own notes
      this.notes.push(...notes);
      if (this.autoBeam) {
        this.beams.push(...this.autoGenerateBeams(notes));
      }

      // Tells the parent vf-stave that this vf-voice has finished creating its notes & beams 
      // and is ready to be added to the stave.  
      const notesAndBeamsCreatedEvent = new CustomEvent('notesCreated', { bubbles: true, detail: { notes: this.notes, beams: this.beams } });
      this.dispatchEvent(notesAndBeamsCreatedEvent);
    }
  }

  /**
   * Generates notes based on the text content of this vf-voice element. 
   * Utlizes the EasyScore API Grammar & Parser. 
   * 
   * @param {String} text - The string to parse and create notes from. 
   * @return {[Vex.Flow.StaveNote]} - The notes that were generated from the text. 
   */
  createNotesFromText(text) {
    this._score.set({ stem: this.stem });
    const staveNotes = this._score.notes(text);
    return staveNotes;
  }

  /**
   * Automatically generates beams for the provided notes. 
   * 
   * @param {[Vex.Flow.StaveNote]} notes - The notes to autogenerate beams for.
   * @return {[Vex.Flow.Beam]} - The autogenreated beams. 
   */
  autoGenerateBeams(notes) {
    // TODO: use default groups? 
    // const groups = Vex.Flow.Beam.getDefaultBeamGroups(this._score.defaults.time);
    // const beams = Vex.Flow.Beam.generateBeams(notes, {
    //   groups: groups
    // });
    const beams = Vex.Flow.Beam.generateBeams(notes);
    beams.forEach( beam => {
      this._vf.renderQ.push(beam);
    })
    return beams;
  }
}

window.customElements.define('vf-voice', VFVoice);
