// ── INIT ──
async function init(){
  try {
    if (!auth.currentUser) await signInAnonymously(auth);
    userId = auth.currentUser.uid;
    localStorage.setItem('sd_uid', userId);
  } catch (e) {
    console.error('Authentication failed:', e);
    showToast('Could not securely sign in. Please refresh and try again.');
    return;
  }
  userName=localStorage.getItem('sd_name')||'';
  userPfp=localStorage.getItem('sd_pfp')||'';
  subjects=JSON.parse(localStorage.getItem('sd_subjects')||'[]');
  pomoSessions=parseInt(localStorage.getItem('sd_pomo_sessions')||'0');
  pomoFocusMin=parseInt(localStorage.getItem('sd_pomo_focus')||'0');
  pomoStreak=parseInt(localStorage.getItem('sd_streak')||'0');
  lastStudyDay=localStorage.getItem('sd_lastday')||'';
  unlockedBadges=JSON.parse(localStorage.getItem('sd_unlocked')||'[]');
  currentRoomId=localStorage.getItem('sd_room_id')||'';
  currentRoomName=localStorage.getItem('sd_room_name')||'';
  mushroomCoins=parseInt(localStorage.getItem('sd_coins')||'0');
  ownedItems=JSON.parse(localStorage.getItem('sd_owned_items')||'[]');
  equippedTitle=localStorage.getItem('sd_equipped_title')||'';
  equippedBadges=JSON.parse(localStorage.getItem('sd_equipped_badges')||'[]');
  equippedTheme=localStorage.getItem('sd_equipped_theme')||'';
  savedRooms=JSON.parse(localStorage.getItem('sd_saved_rooms')||'[]');
  darkMode=localStorage.getItem('sd_dark')==='1';
  completedMissions=JSON.parse(localStorage.getItem('sd_completed_missions')||'{}');
  missionStreak=parseInt(localStorage.getItem('sd_mission_streak')||'0');
  lastMissionDay=localStorage.getItem('sd_last_mission_day')||'';
  missionsCompleted=parseInt(localStorage.getItem('sd_missions_completed')||'0');
  plannerData=JSON.parse(localStorage.getItem('sd_planner')||'{}');
  plannerTasks=parseInt(localStorage.getItem('sd_planner_tasks')||'0');
  weeklyStudyLog=JSON.parse(localStorage.getItem('sd_weekly_log')||'{}');
  nightOwl=localStorage.getItem('sd_night_owl')==='1';
  earlyBird=localStorage.getItem('sd_early_bird')==='1';
  xp=parseInt(localStorage.getItem('sd_xp')||'0');
  level=parseInt(localStorage.getItem('sd_level')||'1');

  // ── Try loading from Firebase cloud (syncs progress across devices) ──
  // Skip cloud load if we have recent local data (< 30 minutes old) to avoid slow login
  const hasLocalData=!!localStorage.getItem('sd_name');
  const localSavedAt=parseInt(localStorage.getItem('sd_saved_at')||'0');
  const localIsRecent=(Date.now()-localSavedAt)<30*60*1000;
  let loadedFromCloud=false;
  if(!hasLocalData||!localIsRecent){
    if(!hasLocalData)showCloudLoadingBanner('☁️ Checking for saved progress…');
    loadedFromCloud=await loadProfileFromCloud(userId);
    hideCloudLoadingBanner();
  }
  if(loadedFromCloud){
    // Update room from cloud if we have one
    if(userName)localStorage.setItem('sd_name',userName);
    if(userPfp)localStorage.setItem('sd_pfp',userPfp);
    currentRoomId=localStorage.getItem('sd_room_id')||currentRoomId||'';
    currentRoomName=localStorage.getItem('sd_room_name')||currentRoomName||'';
    if(savedRooms.length&&currentRoomId){
      const found=savedRooms.find(r=>r.id===currentRoomId);
      if(!found&&currentRoomId)savedRooms.push({id:currentRoomId,name:currentRoomName});
    }
  }

  applyDark();
  applyShopTheme();
  updateCoinDisplay();
  updateXpDisplay();

  const cp=document.getElementById('colorPicker');
  COLORS.forEach(c=>{const d=document.createElement('div');d.className='color-dot'+(c===selectedColor?' selected':'');d.style.background=c;d.onclick=()=>{selectedColor=c;document.querySelectorAll('.color-dot').forEach(x=>x.classList.remove('selected'));d.classList.add('selected');};cp.appendChild(d);});

  checkStreak();updatePomoStats();updatePomoDisplay();
  // Restore linked pomo subject
  linkedPomoSubjectId=localStorage.getItem('sd_linked_pomo_subject')||null;
  renderSubjects();renderBadges();loadPetState();
  renderMissions();startMissionTimer();

  // ── AUTO LOGIN: skip onboard + lobby if already set up ──
  const savedName = localStorage.getItem('sd_name');
  const savedRoomId = localStorage.getItem('sd_room_id');
  const savedRoomName = localStorage.getItem('sd_room_name');
  const savedRoomsList = JSON.parse(localStorage.getItem('sd_saved_rooms')||'[]');

  if(!savedName){
    // Brand new user — onboard modal is already visible (no hidden class by default)
    return;
  }

  // Returning user — hide the onboard modal immediately
  document.getElementById('onboardModal').classList.add('hidden');

  // User has a name — restore it
  userName = savedName;
  userPfp = localStorage.getItem('sd_pfp')||'';

  if(savedRoomId){
    // Has a current room — go straight in
    currentRoomId = savedRoomId;
    currentRoomName = savedRoomName||'';
    if(!savedRooms.find(r=>r.id===currentRoomId)){
      savedRooms.push({id:currentRoomId,name:currentRoomName});
      saveLocal();
    }
    enterApp();
  } else if(savedRoomsList.length>0){
    // Has saved rooms but no current — auto-join last one
    const lastRoom = savedRoomsList[savedRoomsList.length-1];
    currentRoomId = lastRoom.id;
    currentRoomName = lastRoom.name;
    localStorage.setItem('sd_room_id', currentRoomId);
    localStorage.setItem('sd_room_name', currentRoomName);
    savedRooms = savedRoomsList;
    enterApp();
  } else {
    // Has name but no rooms — show lobby to join/create
    showRoomLobby();
  }
  // Re-render subjects after everything loads (catches any async cloud data)
  setTimeout(()=>{ renderSubjects(); updatePomoSubjectSelect(); },800);
}
function showCloudLoadingBanner(msg){
  let el=document.getElementById('cloudLoadBanner');
  if(!el){el=document.createElement('div');el.id='cloudLoadBanner';el.style.cssText='position:fixed;top:0;left:0;right:0;z-index:9999;background:var(--grad);color:white;text-align:center;padding:10px;font-size:.82rem;font-weight:700;letter-spacing:.3px;';document.body.appendChild(el);}
  el.textContent=msg;el.style.display='block';
}
function hideCloudLoadingBanner(){
  const el=document.getElementById('cloudLoadBanner');
  if(el)el.style.display='none';
}

function checkStreak(){const today=new Date().toDateString();if(lastStudyDay&&lastStudyDay!==today){const y=new Date();y.setDate(y.getDate()-1);if(lastStudyDay!==y.toDateString())pomoStreak=0;}}

