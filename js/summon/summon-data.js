// js/summon/summon-data.js - Summon Data Management

class SummonDataLoader {
  constructor() {
    this.banners = [];
    this.baseRates = {};
    this.characterPool = [];
    this.loaded = false;
  }

  async init() {
    try {
      // Load summon banners
      const summonResponse = await fetch('data/summon.json');
      const summonData = await summonResponse.json();
      
      this.banners = summonData.banners || [];
      this.baseRates = summonData.baseRates || {
        '7star': 0.33,
        '6star': 3.0,
        '5star': 12.0,
        '4star': 84.67
      };

      // Load character pool
      const charsResponse = await fetch('data/characters.json');
      const charsData = await charsResponse.json();
      this.characterPool = Object.values(charsData);

      this.loaded = true;
      console.log('✅ Summon data loaded:', this.banners.length, 'banners');
      return true;
    } catch (error) {
      console.error('❌ Failed to load summon data:', error);
      return false;
    }
  }

  getBanners() {
    return this.banners;
  }

  getBanner(index) {
    return this.banners[index] || null;
  }

  getBannerById(id) {
    return this.banners.find(b => b.id === id) || null;
  }

  getFeaturedUnits(bannerIndex) {
    const banner = this.getBanner(bannerIndex);
    return banner?.featured || [];
  }

  getBaseRates() {
    return this.baseRates;
  }

  getCharacterPool() {
    return this.characterPool;
  }

  getCharactersByRarity(rarity) {
    return this.characterPool.filter(c => c.rarity === rarity);
  }

  isLoaded() {
    return this.loaded;
  }
}

// Global instance
const summonData = new SummonDataLoader();
