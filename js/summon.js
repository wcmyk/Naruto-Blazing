(function initSummoning() {
  const SUMMON_COST = 500;
  const summonButton = document.getElementById('summon-button');
  const gemValueDisplay = document.getElementById('gemValue');
  const modal = document.getElementById('summon-result-modal');
  const modalCloseButton = document.getElementById('modal-close-button');
  const resultImg = document.getElementById('summon-result-img');
  const resultName = document.getElementById('summon-result-name');
  const resultRarity = document.getElementById('summon-result-rarity');
  let allCharacters = [];

  function performSummon() {
    const currentGems = Currency.get(Currency.keys.gems, 0);
    if (currentGems < SUMMON_COST) {
      alert("Not enough Gems!");
      return;
    }
    if (allCharacters.length === 0) {
        alert("Character data not loaded yet. Please wait.");
        return;
    }
    Currency.set(Currency.keys.gems, currentGems - SUMMON_COST);
    updateCurrencyDisplay();
    const randomIndex = Math.floor(Math.random() * allCharacters.length);
    const summonedChar = allCharacters[randomIndex];
    InventoryChar.addCopy(summonedChar.id, 1);
    console.log(`Summoned: ${summonedChar.name}`);
    showSummonResult(summonedChar);
  }

  function showSummonResult(character) {
    resultImg.src = character.full || character.portrait;
    resultName.textContent = character.name;
    resultRarity.textContent = "★".repeat(character.rarity || 0);
    modal.classList.add('open');
  }

  function hideSummonResult() { modal.classList.remove('open'); }
  function updateCurrencyDisplay() {
    if(gemValueDisplay) gemValueDisplay.textContent = Currency.get(Currency.keys.gems, 0);
  }

  fetch('data/characters.json')
    .then(res => res.json())
    .then(data => { allCharacters = data; })
    .catch(err => { console.error("Failed to load character data for summoning:", err); });

  if(summonButton) summonButton.addEventListener('click', performSummon);
  if(modalCloseButton) modalCloseButton.addEventListener('click', hideSummonResult);
  updateCurrencyDisplay();
})();
