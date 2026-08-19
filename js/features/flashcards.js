// ============================================================
// StudyDrop Flashcards Module
// ============================================================
let flashcardDecks = JSON.parse(localStorage.getItem('sd_flashcard_decks') || '[]');
let currentDeckIdx = null;
let currentCardIdx = 0;
let cardFlipped = false;

function saveFlashcardDecks() {
  localStorage.setItem('sd_flashcard_decks', JSON.stringify(flashcardDecks));
}

function renderFlashcardDecks() {
  const list = document.getElementById('flashcardDeckList');
  if (!list) return;
  if (!flashcardDecks.length) {
    list.innerHTML = '<div class="fc-empty">No decks yet — create your first deck! 🃏</div>';
    return;
  }
  list.innerHTML = flashcardDecks.map((deck, i) => `
    <div class="fc-deck-item" onclick="openDeck(${i})">
      <div class="fc-deck-icon">${deck.icon || '📚'}</div>
      <div class="fc-deck-info">
        <div class="fc-deck-name">${deck.name}</div>
        <div class="fc-deck-count">${deck.cards.length} cards</div>
      </div>
      <div class="fc-deck-actions">
        <button onclick="event.stopPropagation();deleteDeck(${i})" class="fc-del-btn">🗑</button>
      </div>
    </div>
  `).join('');
}

function openDeck(idx) {
  currentDeckIdx = idx; currentCardIdx = 0; cardFlipped = false;
  document.getElementById('fcDeckView').style.display = 'none';
  document.getElementById('fcStudyView').style.display = 'block';
  renderStudyCard();
}

function renderStudyCard() {
  const deck = flashcardDecks[currentDeckIdx];
  if (!deck || !deck.cards.length) return;
  const card = deck.cards[currentCardIdx];
  const total = deck.cards.length;
  document.getElementById('fcStudyDeckName').textContent = deck.name;
  document.getElementById('fcCardProgress').textContent = `${currentCardIdx + 1} / ${total}`;
  document.getElementById('fcProgressBar').style.width = ((currentCardIdx + 1) / total * 100) + '%';
  document.getElementById('fcCardFront').innerHTML = `<div class="fc-card-label">QUESTION</div><div class="fc-card-main-text">${card.front}</div>`;
  document.getElementById('fcCardBack').innerHTML = `<div class="fc-card-label answer-label">ANSWER</div><div class="fc-card-main-text">${card.back}</div>`;
  document.getElementById('fcCardInner').style.transform = 'rotateY(0deg)';
}

function flipCard() {
  cardFlipped = !cardFlipped;
  document.getElementById('fcCardInner').style.transform = cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
}

function nextCard() {
  const deck = flashcardDecks[currentDeckIdx];
  if (!deck) return;
  if (currentCardIdx < deck.cards.length - 1) {
    currentCardIdx++; cardFlipped = false; renderStudyCard();
  } else {
    window.showToast?.('🎉 Deck complete! Great work!');
    window.awardXP?.(20, 'Completed flashcard deck');
    window.awardCoins?.(10, 'Flashcard session');
  }
}

function prevCard() {
  if (currentCardIdx > 0) { currentCardIdx--; cardFlipped = false; renderStudyCard(); }
}

function shuffleCards() {
  const deck = flashcardDecks[currentDeckIdx]; if (!deck) return;
  for (let i = deck.cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
  }
  currentCardIdx = 0; renderStudyCard(); window.showToast?.('Cards shuffled! 🔀');
}

function closeDeck() {
  document.getElementById('fcDeckView').style.display = 'block';
  document.getElementById('fcStudyView').style.display = 'none';
  renderFlashcardDecks();
}

function deleteDeck(idx) {
  if (!confirm('Delete this deck?')) return;
  flashcardDecks.splice(idx, 1); saveFlashcardDecks(); renderFlashcardDecks();
  window.showToast?.('Deck deleted.');
}

function openCreateDeck() {
  document.getElementById('fcCreateModal').classList.remove('hidden');
  document.getElementById('fcNewDeckName').value = '';
  document.getElementById('fcNewDeckCards').value = '';
}
function closeCreateDeck() { document.getElementById('fcCreateModal').classList.add('hidden'); }

function saveNewDeck() {
  const name = document.getElementById('fcNewDeckName').value.trim();
  const raw = document.getElementById('fcNewDeckCards').value.trim();
  if (!name) { window.showToast?.('Enter a deck name!'); return; }
  const cards = raw.split('\n').filter(l => l.includes('|')).map(l => {
    const [front, ...rest] = l.split('|');
    return { front: front.trim(), back: rest.join('|').trim() };
  }).filter(c => c.front && c.back);
  if (!cards.length) { window.showToast?.('Add at least one card using Q | A format'); return; }
  flashcardDecks.push({ name, icon: '📚', cards });
  saveFlashcardDecks(); renderFlashcardDecks(); closeCreateDeck();
  window.showToast?.(`Deck "${name}" created with ${cards.length} cards! 🃏`);
  window.awardXP?.(15, 'Created flashcard deck');
}

Object.assign(window, {
  openDeck, flipCard, nextCard, prevCard, shuffleCards, closeDeck, deleteDeck,
  openCreateDeck, closeCreateDeck, saveNewDeck, renderFlashcardDecks
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderFlashcardDecks);
else renderFlashcardDecks();
