import Vex from '../src/index.js';

const template = document.createElement('template');
template.innerHTML = `
`;

function concat(a, b) {
  return a.concat(b);
}

export class VFVoice extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode:'open' });
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
    this.notesText = this.textContent.trim();

    const getFactoryEvent = new CustomEvent('getFactory', { bubbles: true });
    this.dispatchEvent(getFactoryEvent);

    const getScoreEvent = new CustomEvent('getScore', { bubbles: true });
    this.dispatchEvent(getScoreEvent);
  }

  set vf(value) {
    this._vf = value;
    this.createNotes();
  }

  set score(value) {
    this._score = value;
    this.createNotes();
  }

  createNotes() {
    if (this._vf && this._score) {
      const notes = this.createNotesFromText();
      this.notes.push(notes);
      if (this.autoBeam) {
        this.beams.push(this.autoGenerateBeams(notes));
      }

      this.notes = this.notes.reduce(concat);
      if (this.beams.length > 0) {
        this.beams = this.beams.reduce(concat);
      }

      const notesAndBeamsCreatedEvent = new CustomEvent('notesCreated', { bubbles: true, detail: { notes: this.notes, beams: this.beams } });
      this.dispatchEvent(notesAndBeamsCreatedEvent);
    }
  }

  createNotesFromText() {
    this._score.set({ stem: this.stem });
    const staveNotes = this._score.notes(this.notesText);
    return staveNotes;
  }

  autoGenerateBeams(notes) {
    const beams = Vex.Flow.Beam.generateBeams(notes);
    beams.forEach( beam => {
      this._vf.renderQ.push(beam);
    })
    return beams;
  }
}

window.customElements.define('vf-voice', VFVoice);
