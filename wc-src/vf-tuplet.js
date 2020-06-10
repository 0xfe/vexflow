export class VFTuplet extends HTMLElement {
  constructor() {
    super();

    this.beamed = false;
  }

  connectedCallback() {
    this.notesOccupied = this.getAttribute('notesOccupied');
    this.beamed = this.hasAttribute('beamed');
    this.notesText = this.textContent;
  }
}

window.customElements.define('vf-tuplet', VFTuplet);