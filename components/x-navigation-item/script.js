(function () {
  const componentDocument = document.currentScript.ownerDocument;
  const componentTemplate = componentDocument.querySelector('template').content;

  window.XNavigationItem = class XNavigationItem extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });

      const link = componentTemplate.querySelector('a');
      link.setAttribute('href', `#${this.getAttribute('value')}`);
      link.textContent = this.textContent;

      if (this.hasAttribute('icon')) {
        link.classList.add('icon');
        link.style.backgroundImage = `url(${this.getAttribute('icon')})`;
      }

      this.shadowRoot.appendChild(componentTemplate.cloneNode(true));
    }
  };

  window.customElements.define('x-navigation-item', window.XNavigationItem);
}());
