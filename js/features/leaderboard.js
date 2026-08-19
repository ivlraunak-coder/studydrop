// ── LEADERBOARD ──
function renderLeaderboard(){
  const grid=document.getElementById('leaderboardGrid');
  const entries=Object.entries(allUsers).sort((a,b)=>(b[1].totalMins||0)-(a[1].totalMins||0));
  if(!entries.length){grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">No members yet! 🌸</div>`;return;}
  const medals=['🥇','🥈','🥉'];
  grid.innerHTML=entries.map(([uid,u],i)=>{
    const rankClass=i<3?`rank-${i+1}`:'';
    const medal=i<3?medals[i]:`#${i+1}`;
    const totalMins=u.totalMins||0;
    const badgesHtml=(u.badges||[]).slice(0,5).map(id=>{const b=BADGES.find(x=>x.id===id);return b?`<span class="lb-badge-mini" title="${b.name}">${b.icon}</span>`:''}).join('');
    const shopBadgesHtml=(u.equippedBadgesDisplay||[]).map(b=>`<span class="lb-badge-mini">${b}</span>`).join('');
    const subjectsHtml=(u.subjects||[]).slice(0,4).map(s=>`<div class="subj-tag"><div class="subj-tag-dot" style="background:${s.color}"></div>${esc(s.name)} · ${formatMins(s.totalMins)}</div>`).join('');
    const titleHtml=u.equippedTitle?`<span class="equipped-title-label" style="background:${(u.equippedTitleColor||'#f0b429')}22;color:${u.equippedTitleColor||'#a07020'};border-color:${(u.equippedTitleColor||'#f0b429')}44">${esc(u.equippedTitle)}</span>`:'';
    // XP / Level
    const userXp=u.xp||0;
    const userLvl=u.level||1;
    const userLvlTitle=u.levelTitle||'Seedling';
    const userLvlIcon=u.levelIcon||'🌱';
    const lvlInfo=getLevelInfo(userXp);
    const nextLvl=getNextLevelInfo(userXp);
    const xpPct=nextLvl?Math.round(((userXp-lvlInfo.xpNeeded)/(nextLvl.xpNeeded-lvlInfo.xpNeeded))*100):100;
    const levelBadgeHtml=`<span class="lb-level-badge">${userLvlIcon} Lv.${userLvl} ${esc(userLvlTitle)}</span>`;
    // Is this user currently studying?
    // We check the local studying data via allStudying
    const studyingEntry=allStudying[uid];
    const studyingBadge=studyingEntry?`<span class="lb-studying-badge">📖 Studying ${esc(studyingEntry.subject)}</span>`:'';
    return`<div class="lb-card ${rankClass}">
      <div class="rank-badge">${medal}</div>
      <div class="lb-user-row">${avatarEl(u.name,u.pfp,44)}<div><div class="lb-name">${esc(u.name)} ${titleHtml}${levelBadgeHtml}${studyingBadge}</div><div class="lb-join">${u.subjects?.length||0} subject${u.subjects?.length!==1?'s':''}</div></div></div>
      ${(badgesHtml||shopBadgesHtml)?`<div class="lb-badges-row">${badgesHtml}${shopBadgesHtml?'<span style="margin-left:4px">'+shopBadgesHtml+'</span>':''}</div>`:''}
      <div class="lb-stats-row">
        <div class="lb-stat"><div class="lb-stat-val" style="color:var(--pink)">${formatMins(totalMins)}</div><div class="lb-stat-lbl">Studied</div></div>
        <div class="lb-stat"><div class="lb-stat-val" style="color:var(--sage)">🍅${u.pomoSessions||0}</div><div class="lb-stat-lbl">Pomos</div></div>
        <div class="lb-stat"><div class="lb-stat-val" style="color:var(--peach)">🔥${u.pomoStreak||0}</div><div class="lb-stat-lbl">Streak</div></div>
        <div class="lb-stat"><div class="lb-stat-val" style="color:var(--lavender)">⭐${userXp}</div><div class="lb-stat-lbl">XP</div></div>
      </div>
      <div class="lb-xp-row">
        <div class="lb-xp-label">XP</div>
        <div class="lb-xp-bar-bg"><div class="lb-xp-bar-fill" style="width:${xpPct}%"></div></div>
        <div style="font-size:.62rem;font-weight:800;color:var(--muted);min-width:28px;text-align:right">${xpPct}%</div>
      </div>
      ${subjectsHtml?`<div class="lb-subjects-row">${subjectsHtml}</div>`:''}
    </div>`;
  }).join('');
}

