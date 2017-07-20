(function () {
  const componentDocument = document.currentScript.ownerDocument;
  const componentTemplate = componentDocument.querySelector('template').content;

  window.XCarouselItem = class XCarouselItem extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(componentTemplate.cloneNode(true));
    }
  };

  window.customElements.define('x-carousel-item', window.XCarouselItem);
}());
