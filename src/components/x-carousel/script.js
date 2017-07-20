(function () {
  const componentDocument = document.currentScript.ownerDocument;
  const componentTemplate = componentDocument.querySelector('template').content;

  window.XCarousel = class XCarousel extends HTMLElement {
    constructor() {
      super();
      this.slides = this.querySelectorAll('x-carousel-item');
      this.slidesLength = this.slides.length;
      this.appendChild(componentTemplate.cloneNode(true));

      for (let i = 0; i < this.slidesLength; i++) {
        if (this.slides[i].hasAttribute('selected')) {
          this.setSlide(i);
        }
      }

      this.onPrevClick = this.onPrevClick.bind(this);
      this.onNextClick = this.onNextClick.bind(this);
      this.onPageResize = this.onPageResize.bind(this);
      this.querySelector('.btn--prev').addEventListener('click', this.onPrevClick);
      this.querySelector('.btn--next').addEventListener('click', this.onNextClick);
      window.addEventListener('resize', this.onPageResize);

      this.onPageResize();
    }

    setSlide(index) {
      for (let i = 0; i < this.slidesLength; i++) {
        this.slides[i].removeAttribute('selected');
        this.slides[i].shadowRoot.querySelector('figure').classList.remove('current');
      }

      this.slides[index].setAttribute('selected', 'true');
      this.slides[index].shadowRoot.querySelector('figure').classList.add('current');
      this.currentSlide = index;
    }

    setPageSizeMode(mode) {
      Array.from(this.slides).map(item => item.setAttribute('layout', mode));
    }

    onPrevClick() {
      const newSlide = (this.currentSlide === 0) ? (this.slides.length - 1) : (this.currentSlide - 1);
      this.setSlide(newSlide);
    }

    onNextClick() {
      const newSlide = (this.currentSlide >= this.slides.length - 1) ? 0 : (this.currentSlide + 1);
      this.setSlide(newSlide);
    }

    onPageResize() {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        this.setPageSizeMode('large');
      } else {
        this.setPageSizeMode('mobile');
      }
    }
  };

  window.customElements.define('x-carousel', window.XCarousel);
}());
