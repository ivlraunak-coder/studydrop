// ── BADGE SYSTEM ──
function checkBadges(stats){
  let newUnlocks=[];
  BADGES.forEach(b=>{
    if(!unlockedBadges.includes(b.id)&&b.check(stats)){unlockedBadges.push(b.id);newUnlocks.push(b);}
  });
  if(newUnlocks.length){saveLocal();newUnlocks.forEach((b,i)=>setTimeout(()=>showBadgePopup(b),i*1800));}
}
function showBadgePopup(b){
  const el=document.getElementById('badgePopup');
  document.getElementById('bupIcon').textContent=b.icon;
  document.getElementById('bupTitle').textContent='Badge Unlocked!';
  document.getElementById('bupDesc').textContent=b.name+' — '+b.desc;
  el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),4000);
}

function renderBadges(){
  const totalMins=subjects.reduce((a,s)=>a+s.totalMins,0);
  const reactCount=parseInt(localStorage.getItem('sd_react_count')||'0');
  const goalCount=parseInt(localStorage.getItem('sd_goal_count')||'0');
  const myRow=document.getElementById('myBadgesRow');
  const earned=BADGES.filter(b=>unlockedBadges.includes(b.id));
  if(!earned.length){myRow.innerHTML=`<div style="color:var(--muted);font-size:.85rem">Study to earn badges! 🌸</div>`;}
  else{myRow.innerHTML=earned.map(b=>`<div class="badge-pill" style="background:${b.color}18;color:${b.color};border-color:${b.color}40"><span class="b-icon">${b.icon}</span>${b.name}</div>`).join('');}
  document.getElementById('allBadgesGrid').innerHTML=BADGES.map(b=>{
    const unlocked=unlockedBadges.includes(b.id);
    let pct=0;
    if(b.id.startsWith('hours_')){const target=parseInt(b.id.split('_')[1])*60;pct=Math.min(100,Math.round(totalMins/target*100));}
    else if(b.id.startsWith('streak_')){const target=parseInt(b.id.split('_')[1]);pct=Math.min(100,Math.round(pomoStreak/target*100));}
    else if(b.id.startsWith('pomo_')){const target=parseInt(b.id.split('_')[1]);pct=Math.min(100,Math.round(pomoSessions/target*100));}
    else if(b.id==='subjects_3'){pct=Math.min(100,Math.round((subjects.length/3)*100));}
    else if(b.id==='first_goal'){pct=goalCount>=1?100:0;}
    else if(b.id==='social'){pct=Math.min(100,Math.round(reactCount/5*100));}
    else pct=unlocked?100:0;
    return`<div class="badge-card ${unlocked?'unlocked':''}">
      ${unlocked?`<div class="unlocked-stamp">EARNED</div>`:''}
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
      <div class="badge-req">${b.req}</div>
      <div class="badge-progress-bg"><div class="badge-progress-fill" style="width:${pct}%;background:${b.color}"></div></div>
    </div>`;
  }).join('');
}

