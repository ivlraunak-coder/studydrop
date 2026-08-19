// ── TABS ──
function switchTab(id,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  if(btn)btn.classList.add('active');
  if(id==='community')renderLeaderboard();
  if(id==='rewards')renderBadges();
  if(id==='shop'){renderShop();updateCoinDisplay();}
  if(id==='missions')renderMissions();
  if(id==='planner')renderPlanner();
  if(id==='report')renderReport();
  if(id==='pet'){loadPetState();renderPet();}
  if(id==='tracker')updatePomoSubjectSelect();
  if(id==='flashcards')renderFlashcardDecks();
}

