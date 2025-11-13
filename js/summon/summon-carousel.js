// js/summon/summon-carousel.js - Banner Carousel System

class BannerCarouselController {
  constructor() {
    this.currentIndex = 0;
    this.totalBanners = 0;
    this.previewScroll = null;
    this.mainCarousel = null;
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.changeCallbacks = [];
  }

  init(previewId, carouselId) {
    this.previewScroll = document.getElementById(previewId);
    this.mainCarousel = document.getElementById(carouselId);
    
    if (!this.previewScroll || !this.mainCarousel) {
      console.error('❌ Carousel elements not found');
      return;
    }

    this.setupEventListeners();
    console.log('✅ Carousel initialized');
  }

  setupEventListeners() {
    // Touch events
    this.mainCarousel.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.mainCarousel.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.mainCarousel.addEventListener('touchend', (e) => this.handleTouchEnd(e));

    // Mouse events
    this.mainCarousel.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

    // Arrow buttons
    document.getElementById('arrow-left')?.addEventListener('click', () => this.prev());
    document.getElementById('arrow-right')?.addEventListener('click', () => this.next());

    // Preview items click
    const previewItems = this.previewScroll.querySelectorAll('.preview-item');
    previewItems.forEach((item, index) => {
      item.addEventListener('click', () => this.goTo(index));
    });
  }

  handleTouchStart(e) {
    this.isDragging = true;
    this.startX = e.touches[0].clientX;
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.currentX = e.touches[0].clientX;
  }

  handleTouchEnd(e) {
    if (!this.isDragging) return;
    this.isDragging = false;

    const diff = this.startX - this.currentX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }

  handleMouseDown(e) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.mainCarousel.style.cursor = 'grabbing';
  }

  handleMouseMove
