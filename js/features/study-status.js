// ── STUDY STATUS BROADCAST ──
function broadcastStudyStatus(subjectName){
  if(!currentRoomId||!userId)return;
  const statusRef=ref(db,`rooms/${currentRoomId}/studying/${userId}`);
  set(statusRef,{
    name:userName,pfp:userPfp,subject:subjectName,startedAt:Date.now(),uid:userId
  });
  onDisconnect(statusRef).remove();
  // Refresh every 60s to keep alive timestamp
  clearInterval(studyStatusInterval);
  studyStatusInterval=setInterval(()=>{
    if(activeTimerId!==null){
      update(ref(db,`rooms/${currentRoomId}/studying/${userId}`),{heartbeat:Date.now()});
    }
  },60000);
}
function clearStudyStatus(){
  if(!currentRoomId||!userId)return;
  clearInterval(studyStatusInterval);
  remove(ref(db,`rooms/${currentRoomId}/studying/${userId}`)).catch(()=>{});
}
function subscribeStudyingNow(){
  if(!currentRoomId)return;
  onValue(ref(db,`rooms/${currentRoomId}/studying`),snap=>{
    const data=snap.val()||{};
    allStudying=data;
    renderStudyingNow(data);
  });
}
function refreshStudyingNow(){
  // Read from live allStudying data (not stale DOM dataset) so timer never resets on re-render
  const sections=['studyingNowList','studyingNowListLB'];
  sections.forEach(listId=>{
    const el=document.getElementById(listId);
    if(!el)return;
    const cards=el.querySelectorAll('.study-status-card[data-uid]');
    cards.forEach(card=>{
      const uid=card.dataset.uid;
      const entry=allStudying[uid];
      if(!entry)return;
      const elapsed=Math.floor((Date.now()-entry.startedAt)/1000);
      const m=Math.floor(elapsed/60),s=elapsed%60;
      const timeEl=card.querySelector('.ss-time');
      if(timeEl)timeEl.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    });
  });
}
function renderStudyingNow(data){
  const entries=Object.entries(data);
  const html=entries.length?entries.map(([uid,s])=>{
    const elapsed=Math.floor((Date.now()-s.startedAt)/1000);
    const m=Math.floor(elapsed/60),sec=elapsed%60;
    const isMe=uid===userId;
    return`<div class="study-status-card" data-uid="${uid}">
      ${avatarEl(s.name,s.pfp,28)}
      <div>
        <div class="ss-name">${esc(s.name)}${isMe?' (you)':''}</div>
        <div class="ss-subject">📖 ${esc(s.subject)}</div>
      </div>
      <div class="ss-pulse"></div>
      <div class="ss-time">${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}</div>
    </div>`;
  }).join(''):`<div class="studying-now-empty">No one is actively studying yet — start the tracker! 📖</div>`;
  ['studyingNowList','studyingNowListLB'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.innerHTML=html;
  });
}
// Refresh elapsed timers every second
setInterval(refreshStudyingNow,1000);

function updatePomoSubjectSelect(){
  const sel=document.getElementById('pomoSubjectSelect');
  if(!sel)return;
  // Restore from localStorage if not set in memory
  if(!linkedPomoSubjectId){
    const saved=localStorage.getItem('sd_linked_pomo_subject');
    if(saved&&subjects.find(s=>String(s.id)===String(saved))){
      linkedPomoSubjectId=saved;
    }
  }
  sel.innerHTML='<option value="">— No subject linked —</option>'+subjects.map(s=>`<option value="${String(s.id)}">${esc(s.name)}</option>`).join('');
  if(linkedPomoSubjectId&&subjects.find(s=>String(s.id)===String(linkedPomoSubjectId))){
    sel.value=linkedPomoSubjectId;
  }
  const subj=subjects.find(s=>String(s.id)===String(linkedPomoSubjectId));
  const statusEl=document.getElementById('pomoLinkStatus');
  if(statusEl){
    statusEl.textContent=subj
      ?`✅ Pomodoro sessions will auto-log time to "${subj.name}".`
      :'Select a subject above — when a Pomodoro focus session finishes, it logs time to that subject automatically.';
    statusEl.style.color=subj?'var(--sage)':'var(--muted)';
  }
  sel.onchange=()=>{
    linkedPomoSubjectId=sel.value||null;
    localStorage.setItem('sd_linked_pomo_subject',linkedPomoSubjectId||'');
    const subj=subjects.find(s=>String(s.id)===String(linkedPomoSubjectId));
    if(statusEl){
      statusEl.textContent=subj?`✅ Pomodoro sessions will auto-log time to "${subj.name}".`:'Select a subject above — when a Pomodoro focus session finishes, it logs time to that subject automatically.';
      statusEl.style.color=subj?'var(--sage)':'var(--muted)';
    }
    renderSubjects(); // refresh pomo-linked badge on cards
    showToast(subj?`🍅 Pomodoro linked to ${subj.name}!`:'Pomodoro unlinked.');
  };
}

function renderSubjects(){
  const grid=document.getElementById('subjectsGrid');
  if(!subjects.length){grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);font-size:.85rem">No subjects yet! Add one above to start tracking 📚</div>`;updateTotalStats();return;}
  const maxMins=Math.max(...subjects.map(s=>s.totalMins),1);
  // Capture current elapsed before re-render so we can restore it
  const currentElapsedEl=activeTimerId?document.getElementById('live_'+activeTimerId):null;
  const currentElapsedVal=currentElapsedEl?currentElapsedEl.textContent:'00:00';
  grid.innerHTML=subjects.map(s=>{
    const sid=String(s.id);
    const pct=(s.totalMins/maxMins*100).toFixed(1);
    const isRunning=String(activeTimerId)===sid;
    const isLinkedPomo=String(linkedPomoSubjectId)===sid;
    const sessionsHtml=s.sessions.slice().reverse().slice(0,5).map(se=>`<div class="session-entry">${se.source?`<span style="color:var(--pink);font-size:.65rem">${se.source}</span> `:''}${se.date} ${se.time}<span>+${formatMins(se.mins)}</span></div>`).join('');
    return`<div class="subject-card ${isRunning?'timer-running':''}">
      <div class="subject-top">
        <div class="subject-dot" style="background:${s.color}"></div>
        <div class="subject-name">${esc(s.name)}${isLinkedPomo?'<span style="font-size:.6rem;background:rgba(232,112,138,.15);color:var(--pink);border-radius:4px;padding:1px 5px;margin-left:5px;font-weight:700">🍅 Pomo linked</span>':''}</div>
        <button class="subject-menu" onclick="event.stopPropagation();deleteSubject('${sid}')" title="Delete subject">🗑</button>
      </div>
      <div class="subject-hrs" style="color:${s.color}">${formatMins(s.totalMins)}</div>
      <div class="subject-hrs-lbl">Total Studied</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:8px 0 4px;padding:10px;background:${isRunning?'rgba(232,112,138,.1)':'var(--surface2)'};border-radius:var(--r-sm);border:1.5px solid ${isRunning?'rgba(232,112,138,.3)':'var(--border)'};transition:all .3s">
        ${isRunning?`<span style="width:8px;height:8px;border-radius:50%;background:var(--pink);display:inline-block;animation:livepulse 1.5s infinite;flex-shrink:0"></span>`:'<span style="font-size:.8rem;color:var(--muted2)">⏱</span>'}
        <span id="live_${sid}" style="font-family:'JetBrains Mono',monospace;font-size:1.4rem;font-weight:700;color:${isRunning?'var(--pink)':'var(--muted2)'};letter-spacing:1px">${isRunning?currentElapsedVal:'00:00'}</span>
      </div>
      <div class="subject-bar-bg"><div class="subject-bar-fill" style="width:${pct}%;background:${s.color}"></div></div>
      <button class="subject-timer-btn ${isRunning?'running':''}" onclick="toggleSubjectTimer('${sid}')">${isRunning?'⏹ Stop &amp; Save':'▶ Start Timer'}</button>
      ${s.sessions.length?`<div class="subject-sessions" style="margin-top:10px">${sessionsHtml}</div>`:''}
    </div>`;
  }).join('');
  updateTotalStats();
  updatePomoSubjectSelect();
}
function updateTotalStats(){
  const trackerTotal=subjects.reduce((a,s)=>a+s.totalMins,0);
  const total=trackerTotal+pomoFocusMin;
  document.getElementById('totalHrsVal').textContent=formatMins(total)||'0m';
  document.getElementById('totalSubjectsVal').textContent=subjects.length;
  const top=subjects.slice().sort((a,b)=>b.totalMins-a.totalMins)[0];
  document.getElementById('topSubjectVal').textContent=top?top.name:'—';
  // Update pomodoro time display if element exists
  const pomoTotalEl=document.getElementById('pomoTotalTime');
  if(pomoTotalEl)pomoTotalEl.textContent=formatMins(pomoFocusMin)||'0m';
}

