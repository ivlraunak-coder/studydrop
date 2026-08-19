// ── XP SYSTEM ──
function awardXP(amount,reason){
  const oldLevel=getLevelInfo(xp);
  xp+=amount;
  const newLevel=getLevelInfo(xp);
  level=newLevel.level;
  saveLocal();
  updateXpDisplay();
  showXpPopup(`+${amount} XP`,reason);
  // Level up!
  if(newLevel.level>oldLevel.level){
    setTimeout(()=>showLevelUpPopup(newLevel),500);
  }
  // Sync to Firebase so others see your level
  if(currentRoomId)syncUser();
}
function updateXpDisplay(){
  const cur=getLevelInfo(xp);
  const next=getNextLevelInfo(xp);
  const pct=next?Math.round(((xp-cur.xpNeeded)/(next.xpNeeded-cur.xpNeeded))*100):100;
  const headerBar=document.getElementById('headerXpBar');
  const headerLvl=document.getElementById('headerLevelText');
  if(headerBar)headerBar.style.width=pct+'%';
  if(headerLvl)headerLvl.textContent=`LVL ${cur.level}`;
  // Keep sidebar XP/level in sync
  const sbXp=document.getElementById('sbXp');
  const sbLvl=document.getElementById('sbLvlText');
  const sbLevel=document.getElementById('sbLevel');
  const sbBar=document.getElementById('sbXpFill');
  if(sbXp) sbXp.textContent=xp;
  if(sbLvl) sbLvl.textContent=`LVL ${cur.level}`;
  if(sbLevel) sbLevel.textContent=`Level ${cur.level} · ${cur.title}`;
  if(sbBar) sbBar.style.width=pct+'%';
}
function showXpPopup(amt,reason){
  const el=document.getElementById('xpEarnPopup');
  if(!el)return;
  document.getElementById('xpEarnAmt').textContent=amt;
  document.getElementById('xpEarnReason').textContent=reason;
  el.classList.add('show');
  clearTimeout(el._xt);
  el._xt=setTimeout(()=>el.classList.remove('show'),2400);
}
function showLevelUpPopup(lvlInfo){
  const el=document.getElementById('levelupPopup');
  if(!el)return;
  document.getElementById('luLevelNum').textContent=`Level ${lvlInfo.level}`;
  document.getElementById('luLevelTitle').textContent=`${lvlInfo.icon} ${lvlInfo.title}`;
  el.classList.add('show');
  clearTimeout(el._lt);
  el._lt=setTimeout(()=>el.classList.remove('show'),3800);
}

