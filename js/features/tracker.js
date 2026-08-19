// ── TRACKER (TIMER-BASED) ──
let activeTimerId=null;       // subject id currently being timed
let activeTimerStart=null;    // Date.now() when timer started
let activeTimerInterval=null; // setInterval handle
let linkedPomoSubjectId=null; // subject linked to pomodoro

function addSubject(){
  const name=document.getElementById('subjectName').value.trim();
  if(!name){showToast('Enter a subject name!');return;}
  // Always use in-memory subjects array (it's kept in sync)
  if(subjects.find(s=>s.name.toLowerCase()===name.toLowerCase())){showToast('Subject already exists!');return;}
  const newSubject={id:'s'+Date.now(),name,color:selectedColor,totalMins:0,sessions:[]};
  subjects.push(newSubject);
  saveLocal();
  // Immediately push to cloud
  if(userId) set(ref(db,`profiles/${userId}`),getCloudPayload()).catch(()=>{});
  renderSubjects();syncUser();
  document.getElementById('subjectName').value='';
  updatePomoSubjectSelect();
  showToast('Subject added! ✅');
}
function deleteSubject(id){
  if(String(activeTimerId)===String(id))stopActiveTimer(false);
  subjects=subjects.filter(s=>String(s.id)!==String(id));
  if(String(linkedPomoSubjectId)===String(id))linkedPomoSubjectId=null;
  saveLocal();
  // Immediately push deletion to cloud so it doesn't restore on next load
  if(userId) set(ref(db,`profiles/${userId}`),getCloudPayload()).catch(()=>{});
  renderSubjects();syncUser();updatePomoSubjectSelect();
}

function toggleSubjectTimer(id){
  const sid=String(id);
  if(String(activeTimerId)===sid){
    stopActiveTimer(true);
  } else {
    if(activeTimerId!==null)stopActiveTimer(true);
    startSubjectTimer(sid);
  }
}
function startSubjectTimer(id){
  const subj=subjects.find(s=>String(s.id)===String(id));if(!subj)return;
  activeTimerId=String(id);
  activeTimerStart=Date.now();
  // Show banner
  const banner=document.getElementById('activeTimerBanner');
  document.getElementById('activeTimerIcon').textContent='📖';
  document.getElementById('activeTimerSubject').textContent=subj.name;
  banner.style.display='flex';
  // Broadcast study status to Firebase
  broadcastStudyStatus(subj.name);
  // Tick
  activeTimerInterval=setInterval(()=>{
    const elapsed=Math.floor((Date.now()-activeTimerStart)/1000);
    const m=Math.floor(elapsed/60),s=elapsed%60;
    document.getElementById('activeTimerDisplay').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    // Update card live display
    const liveEl=document.getElementById('live_'+String(id));
    if(liveEl)liveEl.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    // Refresh studying-now list every 30s
    if(elapsed%30===0)refreshStudyingNow();
  },1000);
  renderSubjects();
  showToast(`⏱ Timer started for ${subj.name}`);
  refreshStudyingNow();
}
function stopActiveTimer(save=true){
  if(activeTimerId===null)return;
  clearInterval(activeTimerInterval);activeTimerInterval=null;
  const id=activeTimerId;const start=activeTimerStart;
  activeTimerId=null;activeTimerStart=null;
  document.getElementById('activeTimerBanner').style.display='none';
  document.getElementById('activeTimerDisplay').textContent='00:00';
  // Clear study status from Firebase
  clearStudyStatus();

  const subj=subjects.find(s=>String(s.id)===String(id));
  if(save&&subj){
    const elapsedSec=Math.floor((Date.now()-start)/1000);
    const minsToAdd=Math.floor(elapsedSec/60);
    if(minsToAdd>=1){
      subj.totalMins+=minsToAdd;
      subj.sessions.push({mins:minsToAdd,date:new Date().toLocaleDateString(),time:fmtTime()});
      if(subj.sessions.length>20)subj.sessions=subj.sessions.slice(-20);
      // Streak
      const today=new Date().toDateString();
      if(lastStudyDay!==today){const y=new Date();y.setDate(y.getDate()-1);if(lastStudyDay===y.toDateString())pomoStreak++;else pomoStreak=1;lastStudyDay=today;}
      awardCoins(minsToAdd,`${formatMins(minsToAdd)} studied for ${subj.name}! 📖`);
      // XP: 3 XP per minute studied
      awardXP(minsToAdd*3,`${formatMins(minsToAdd)} studied for ${subj.name}! ⭐`);
      logStudyToWeekly(minsToAdd);
      saveLocal();renderSubjects();syncUser();
      showToast(`+${formatMins(minsToAdd)} logged for ${subj.name}! 🎉`);
    } else {
      showToast('Less than 1 min — not logged.');
      renderSubjects();
    }
  } else {
    renderSubjects();
  }
  refreshStudyingNow();
}
window.stopActiveTimer=stopActiveTimer;

