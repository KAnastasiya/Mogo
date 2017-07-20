(function () {
  const componentDocument = document.currentScript.ownerDocument;
  const componentTemplate = componentDocument.querySelector('template').content;

  window.XAccordionItem = class XAccordionItem extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(componentTemplate.cloneNode(true));
    }
  };

  window.customElements.define('x-accordion-item', window.XAccordionItem);
}());
