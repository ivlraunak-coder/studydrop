// ── POMODORO ──
function setPomoMode(mode,btn){if(pomoRunning){showToast('Stop timer first!');return;}pomoMode=mode;document.querySelectorAll('.pomo-mode-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const mins=mode==='focus'?pomoSettings.focus:mode==='short'?pomoSettings.short:pomoSettings.long;pomoSecondsLeft=mins*60;updatePomoDisplay();const ring=document.getElementById('pomoRing');ring.className='ring-prog';ring.classList.add(mode==='focus'?'focus':mode==='short'?'short':'long');
  document.getElementById('pomoCoinPreview').textContent=mode==='focus'?`🍄 +${pomoSettings.focus} on finish`:'Break time 🌸';
}
function togglePomo(){if(pomoRunning)pausePomo();else startPomo();}
function startPomo(){pomoRunning=true;document.getElementById('pomoStartBtn').textContent='⏸ Pause';document.getElementById('pomoStartBtn').classList.add('running');document.getElementById('pomoRing').classList.add('running');['p1','p2','p3'].forEach(id=>document.getElementById(id).classList.add('active'));pomoInterval=setInterval(pomoTick,1000);}
function pausePomo(){pomoRunning=false;clearInterval(pomoInterval);document.getElementById('pomoStartBtn').textContent='▶ Resume';document.getElementById('pomoStartBtn').classList.remove('running');document.getElementById('pomoRing').classList.remove('running');['p1','p2','p3'].forEach(id=>document.getElementById(id).classList.remove('active'));}
function resetPomo(){pausePomo();document.getElementById('pomoStartBtn').textContent='▶ Start';const mins=pomoMode==='focus'?pomoSettings.focus:pomoMode==='short'?pomoSettings.short:pomoSettings.long;pomoSecondsLeft=mins*60;updatePomoDisplay();}
function pomoTick(){if(pomoSecondsLeft<=0){pomoFinished();return;}pomoSecondsLeft--;const td=document.getElementById('pomoTime');td.classList.remove('tick');void td.offsetWidth;td.classList.add('tick');updatePomoDisplay();}
function launchConfetti(){const c=document.getElementById('confettiContainer');c.innerHTML='';const cols=['#e8708a','#f2a98a','#c5b4e3','#a8c5a0','#f4c88a','#fff'];for(let i=0;i<24;i++){const el=document.createElement('div');el.className='confetti-piece';el.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*40+30}%;background:${cols[i%cols.length]};animation-delay:${Math.random()*.5}s;animation-duration:${1.2+Math.random()*.8}s;transform:rotate(${Math.random()*360}deg);border-radius:${Math.random()>.5?'50%':'2px'}`;c.appendChild(el);}setTimeout(()=>c.innerHTML='',2500);}
function pomoFinished(){
  pausePomo();
  document.getElementById('pomoStartBtn').textContent='▶ Start';
  launchConfetti();
  if(pomoMode==='focus'){
    pomoSessions++;pomoFocusMin+=pomoSettings.focus;
    const today=new Date().toDateString();
    if(lastStudyDay!==today){pomoStreak++;lastStudyDay=today;}
    // Track today pomos for missions
    const tp=parseInt(localStorage.getItem('sd_today_pomos')||'0')+1;
    localStorage.setItem('sd_today_pomos',tp);
    // Award mushroom coins: 1 coin per minute of focus
    const coinsEarned=pomoSettings.focus;
    awardCoins(coinsEarned,`${pomoSettings.focus}min focus complete! 🍅`);
    // Award XP: 5 XP per minute + 25 bonus for completing a full session
    awardXP(pomoSettings.focus*5+25,`Pomodoro session complete! 🍅`);
    // Also log focus time to weekly log for missions
    logStudyToWeekly(pomoSettings.focus);
    // ── LOG TIME TO LINKED SUBJECT ──
    if(linkedPomoSubjectId){
      const subj=subjects.find(s=>String(s.id)===String(linkedPomoSubjectId));
      if(subj){
        subj.totalMins+=pomoSettings.focus;
        subj.sessions.push({mins:pomoSettings.focus,date:new Date().toLocaleDateString(),time:fmtTime(),source:'🍅 Pomodoro'});
        if(subj.sessions.length>20)subj.sessions=subj.sessions.slice(-20);
        saveLocal();renderSubjects();syncUser();
        showToast(`🎉 Focus done! +${pomoSettings.focus}m logged to ${subj.name}`);
      } else {
        showToast('🎉 Focus session done! Take a break.');
      }
    } else {
      showToast('🎉 Focus session done! Link a subject in Tracker to auto-log time.');
    }
  } else {showToast('Break over! 💪');}
  updatePomoStats();saveLocal();syncUser();
  const mins=pomoMode==='focus'?pomoSettings.focus:pomoMode==='short'?pomoSettings.short:pomoSettings.long;
  pomoSecondsLeft=mins*60;updatePomoDisplay();
}
function updatePomoDisplay(){
  const m=Math.floor(pomoSecondsLeft/60),s=pomoSecondsLeft%60;
  document.getElementById('pomoTime').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const totalSecs=(pomoMode==='focus'?pomoSettings.focus:pomoMode==='short'?pomoSettings.short:pomoSettings.long)*60;
  document.getElementById('pomoRing').style.strokeDashoffset=POMO_CIRC*(pomoSecondsLeft/totalSecs);
  document.getElementById('pomoLabel').textContent={focus:'FOCUS',short:'SHORT BREAK',long:'LONG BREAK'}[pomoMode];
  // Show linked subject
  const lbl=document.getElementById('pomoLinkedSubjectLabel');
  if(lbl){
    const subj=linkedPomoSubjectId?subjects.find(s=>String(s.id)===String(linkedPomoSubjectId)):null;
    lbl.textContent=subj&&pomoMode==='focus'?`📖 Logging to: ${subj.name}`:'';
  }
}
function updatePomoStats(){
  document.getElementById('pomoSessions').textContent=pomoSessions;
  document.getElementById('pomoFocusMin').textContent=pomoFocusMin;
  document.getElementById('pomoStreakDisplay').textContent='🔥'+pomoStreak;
  // Keep sidebar streak in sync
  const sbStreak=document.getElementById('sbStreak');
  if(sbStreak) sbStreak.textContent=pomoStreak;
}
function resetStreak(){if(!confirm('Reset your streak?'))return;pomoStreak=0;saveLocal();updatePomoStats();}
function applySettings(){pomoSettings.focus=parseInt(document.getElementById('setFocus').value)||25;pomoSettings.short=parseInt(document.getElementById('setShort').value)||5;pomoSettings.long=parseInt(document.getElementById('setLong').value)||15;resetPomo();}

