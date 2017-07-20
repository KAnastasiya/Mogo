(function () {
  const getCurrentScrollPosition = () => {
    let position;
    if (window.pageYOffset) {
      position = window.pageYOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {
      position = document.documentElement.scrollTop;
    } else if (document.body) {
      position = document.body.scrollTop;
    }

    return Math.ceil(position);
  };

  const debounce = (func, wait, immediate) => {
    let timeout;
    return function () {
      const callNow = immediate && !timeout;

      const later = () => {
        timeout = null;
        if (!immediate) {
          func.apply(this, arguments);
        }
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(this, arguments);
      }
    };
  };

  const componentDocument = document.currentScript.ownerDocument;
  const componentTemplate = componentDocument.querySelector('template').content;

  window.XNavigation = class XNavigation extends HTMLElement {
    constructor() {
      super();
      this.appendChild(componentTemplate.cloneNode(true));

      this.toggleIcon = this.querySelector('a');
      this.items = Array.from(this.querySelectorAll('x-navigation-item'));

      this.items.forEach(item => {
        if (item.hasAttribute('selected')) {
          item.shadowRoot.querySelector('a').classList.add('active');
        }
      });

      this.onToggleClick = this.onToggleClick.bind(this);
      this.onItemClick = this.onItemClick.bind(this);
      this.onPageScroll = this.onPageScroll.bind(this);
      this.onPageResize = this.onPageResize.bind(this);
      this.onDocumentClick = this.onDocumentClick.bind(this);

      this.toggleIcon.addEventListener('click', this.onToggleClick);
      this.addEventListener('click', this.onItemClick);
      window.addEventListener('scroll', debounce(this.onPageScroll, 300));
      window.addEventListener('resize', this.onPageResize);
      document.addEventListener('click', this.onDocumentClick);

      this.onPageResize();
    }

    chooseItem(item) {
      this.items.forEach(elem => {
        if (elem.hasAttribute('selected')) {
          elem.removeAttribute('selected');
          elem.shadowRoot.querySelector('a').classList.remove('active');
        }
      });

      item.setAttribute('selected', 'true');
      item.shadowRoot.querySelector('a').classList.add('active');

      const hash = `#${item.getAttribute('value')}`;
      history.replaceState({ page: `${hash}` }, '', `${hash}`);
    }

    setPageSizeMode(mode) {
      this.setAttribute('layout', mode);
      this.items.map(item => item.setAttribute('layout', mode));
    }

    hideMenu() {
      this.toggleIcon.classList.remove('active');
      this.items.map(item => item.classList.remove('visible'));
    }

    onToggleClick() {
      this.toggleIcon.classList.toggle('active');
      this.items.map(item => item.classList.toggle('visible'));
    }

    onItemClick(event) {
      if (event.target.tagName === 'X-NAVIGATION-ITEM' && !event.target.hasAttribute('selected')) {
        event.preventDefault();

        if (!event.target.hasAttribute('icon')) {
          const body = document.body;
          const element = event.target;
          const position = getCurrentScrollPosition();
          const href = `#${element.getAttribute('value')}`;

          const targetOffset = document.querySelector(href).offsetTop;
          const scrollTranslate = (targetOffset > position) ? `-${targetOffset - position}` : (position - targetOffset);

          body.classList.add('in-transition');
          body.style.transform = `translate(0, ${scrollTranslate}px)`;

          window.setTimeout(() => {
            body.classList.remove('in-transition');
            body.style.cssText = '';
            window.scrollTo(0, targetOffset);
            this.chooseItem(element);
          }, 900);
        }
      }
    }

    onPageScroll() {
      this.hideMenu();

      const scrollItemsList = this.items
        .map(item => {
          const itemValue = item.getAttribute('value');
          return !item.getAttribute('icon') ? itemValue : null;
        })
        .filter(item => item && (document.querySelector(`#${item}`).offsetTop <= getCurrentScrollPosition()));

      const currentItemId = scrollItemsList[scrollItemsList.length - 1] || this.items[0].getAttribute('value');
      this.items.forEach(item => {
        if (item.getAttribute('value') === currentItemId) {
          this.chooseItem(item);
        }
      });
    }

    onPageResize() {
      if (window.matchMedia('(min-width: 480px)').matches && window.matchMedia('(max-width: 1209px)').matches) {
        this.setPageSizeMode('tablet');
      } else if (window.matchMedia('(min-width: 1210px)').matches) {
        this.setPageSizeMode('large');
      } else {
        this.setPageSizeMode('mobile');
      }
    }

    onDocumentClick(event) {
      event.stopPropagation();
      if (!event.target.closest('x-navigation')) {
        this.hideMenu();
      }
    }
  };

  window.customElements.define('x-navigation', window.XNavigation);
}());
