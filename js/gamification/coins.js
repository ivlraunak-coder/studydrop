// ── MUSHROOM COIN SYSTEM ──
function awardCoins(amount,reason){
  mushroomCoins+=amount;
  saveLocal();
  updateCoinDisplay();
  showCoinPopup(`+${amount} 🍄`,reason);
}
function updateCoinDisplay(){
  document.getElementById('coinDisplay').textContent=mushroomCoins;
  const sb=document.getElementById('shopCoinBalance');
  if(sb)sb.textContent=mushroomCoins;
  // Keep sidebar coin count in sync
  const sbCoins=document.getElementById('sbCoins');
  if(sbCoins) sbCoins.textContent=mushroomCoins;
}
function showCoinPopup(amt,reason){
  const el=document.getElementById('coinEarnPopup');
  document.getElementById('coinEarnAmt').textContent=amt;
  document.getElementById('coinEarnReason').textContent=reason;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove('show'),2800);
}

