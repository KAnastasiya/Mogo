(function () {
  window.XAccordion = class XAccordion extends HTMLElement {
    constructor() {
      super();
      this.items = this.querySelectorAll('x-accordion-item');
      this.itemsCount = this.items.length;

      for (let i = 0; i < this.itemsCount; i++) {
        if (this.items[i].hasAttribute('selected')) {
          this.items[i].shadowRoot.querySelector('.details').classList.add('open');
        }
      }

      this.onItemClick = this.onItemClick.bind(this);
      this.addEventListener('click', this.onItemClick);
    }

    onItemClick(event) {
      if (event.target.tagName === 'X-ACCORDION-ITEM' && !event.target.hasAttribute('selected')) {
        const currentItem = this.querySelector('x-accordion-item[selected]');
        currentItem.shadowRoot.querySelector('.details').classList.remove('open');
        currentItem.removeAttribute('selected');

        event.target.setAttribute('selected', 'true');
        event.target.shadowRoot.querySelector('.details').classList.add('open');
      }
    }
  };

  window.customElements.define('x-accordion', window.XAccordion);
}());
