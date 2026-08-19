// ── HELPERS ──
function genUid(){return Math.random().toString(36).slice(2)+Date.now().toString(36);}
function genCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join('');}
function initial(n){return(n||'?').trim()[0].toUpperCase();}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function fmtTime(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
const PALETTES=[['#fce8ef','#c95070'],['#fde8d8','#d4724a'],['#e8d5f5','#7b4fa8'],['#d5ecd5','#3d7a3d'],['#d5e8f5','#2d6a9f'],['#fff8e6','#a07020']];
function getAv(n){let h=0;for(let c of(n||''))h=(h*31+c.charCodeAt(0))&0xffffffff;return PALETTES[Math.abs(h)%PALETTES.length];}
function avatarEl(name,pfp,size){
  const[bg,fg]=getAv(name);
  if(pfp)return`<div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;flex-shrink:0"><img src="${pfp}" style="width:100%;height:100%;object-fit:cover"></div>`;
  return`<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:${fg};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${size*.38}px;font-family:'Plus Jakarta Sans',sans-serif;flex-shrink:0">${initial(name)}</div>`;
}
function formatMins(m){const h=Math.floor(m/60),mm=m%60;if(h&&mm)return`${h}h ${mm}m`;if(h)return`${h}h`;return`${mm}m`;}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._to);t._to=setTimeout(()=>t.classList.remove('show'),2800);}
function getCloudPayload(){
  return{
    subjects,pomoSessions,pomoFocusMin,pomoStreak,lastStudyDay,
    unlockedBadges,mushroomCoins,ownedItems,equippedTitle,
    equippedBadges,equippedTheme,savedRooms,darkMode,
    completedMissions,missionStreak,lastMissionDay,missionsCompleted,
    plannerData,plannerTasks,weeklyStudyLog,nightOwl,earlyBird,
    xp,level,userName,userPfp,savedAt:Date.now()
  };
}
function applyPayload(d){
  if(!d)return;
  if(d.subjects!==undefined){
    // Always trust cloud data since it's the source of truth
    // Only keep localStorage subjects if they were saved MORE recently than cloud
    const localSavedAt=parseInt(localStorage.getItem('sd_saved_at')||'0');
    if((d.savedAt||0)>=localSavedAt){
      subjects=Array.isArray(d.subjects)?d.subjects:[];
    }
  }
  if(d.pomoSessions!==undefined)pomoSessions=d.pomoSessions;
  if(d.pomoFocusMin!==undefined)pomoFocusMin=d.pomoFocusMin;
  if(d.pomoStreak!==undefined)pomoStreak=d.pomoStreak;
  if(d.lastStudyDay!==undefined)lastStudyDay=d.lastStudyDay;
  if(d.unlockedBadges!==undefined)unlockedBadges=d.unlockedBadges;
  if(d.mushroomCoins!==undefined)mushroomCoins=d.mushroomCoins;
  if(d.ownedItems!==undefined)ownedItems=d.ownedItems;
  if(d.equippedTitle!==undefined)equippedTitle=d.equippedTitle;
  if(d.equippedBadges!==undefined)equippedBadges=d.equippedBadges;
  if(d.equippedTheme!==undefined)equippedTheme=d.equippedTheme;
  if(d.savedRooms!==undefined)savedRooms=d.savedRooms;
  if(d.darkMode!==undefined)darkMode=d.darkMode;
  if(d.completedMissions!==undefined)completedMissions=d.completedMissions;
  if(d.missionStreak!==undefined)missionStreak=d.missionStreak;
  if(d.lastMissionDay!==undefined)lastMissionDay=d.lastMissionDay;
  if(d.missionsCompleted!==undefined)missionsCompleted=d.missionsCompleted;
  if(d.plannerData!==undefined)plannerData=d.plannerData;
  if(d.plannerTasks!==undefined)plannerTasks=d.plannerTasks;
  if(d.weeklyStudyLog!==undefined)weeklyStudyLog=d.weeklyStudyLog;
  if(d.nightOwl!==undefined)nightOwl=d.nightOwl;
  if(d.earlyBird!==undefined)earlyBird=d.earlyBird;
  if(d.xp!==undefined)xp=d.xp;
  if(d.level!==undefined)level=d.level;
  if(d.userName)userName=d.userName;
  if(d.userPfp)userPfp=d.userPfp;
}
// Debounced cloud save — fires 3s after the last saveLocal call
let _cloudSaveTimer=null;
function scheduleCloudSave(){
  clearTimeout(_cloudSaveTimer);
  _cloudSaveTimer=setTimeout(()=>{
    if(!userId)return;
    set(ref(db,`profiles/${userId}`),getCloudPayload()).catch(()=>{});
  },3000);
}
function saveLocal(){
  // ── localStorage (instant) ──
  localStorage.setItem('sd_subjects',JSON.stringify(subjects));
  localStorage.setItem('sd_pomo_sessions',pomoSessions);
  localStorage.setItem('sd_pomo_focus',pomoFocusMin);
  localStorage.setItem('sd_streak',pomoStreak);
  localStorage.setItem('sd_lastday',lastStudyDay);
  localStorage.setItem('sd_unlocked',JSON.stringify(unlockedBadges));
  localStorage.setItem('sd_coins',mushroomCoins);
  localStorage.setItem('sd_owned_items',JSON.stringify(ownedItems));
  localStorage.setItem('sd_equipped_title',equippedTitle);
  localStorage.setItem('sd_equipped_badges',JSON.stringify(equippedBadges));
  localStorage.setItem('sd_equipped_theme',equippedTheme);
  localStorage.setItem('sd_saved_rooms',JSON.stringify(savedRooms));
  localStorage.setItem('sd_dark',darkMode?'1':'0');
  localStorage.setItem('sd_completed_missions',JSON.stringify(completedMissions));
  localStorage.setItem('sd_mission_streak',missionStreak);
  localStorage.setItem('sd_last_mission_day',lastMissionDay);
  localStorage.setItem('sd_missions_completed',missionsCompleted);
  localStorage.setItem('sd_planner',JSON.stringify(plannerData));
  localStorage.setItem('sd_planner_tasks',plannerTasks);
  localStorage.setItem('sd_weekly_log',JSON.stringify(weeklyStudyLog));
  localStorage.setItem('sd_night_owl',nightOwl?'1':'0');
  localStorage.setItem('sd_early_bird',earlyBird?'1':'0');
  localStorage.setItem('sd_xp',xp);
  localStorage.setItem('sd_level',level);
  localStorage.setItem('sd_saved_at',Date.now());
  // ── Firebase (debounced 3s) ──
  scheduleCloudSave();
}
// Load full profile from Firebase, fall back to localStorage
async function loadProfileFromCloud(uid){
  try{
    const snap=await get(ref(db,`profiles/${uid}`));
    if(snap.exists()){
      const cloudData=snap.val();
      const localSaved=parseInt(localStorage.getItem('sd_saved_at')||'0');
      if((cloudData.savedAt||0)>=localSaved){
        applyPayload(cloudData);
        mirrorToLocalStorage();
        // Re-render subjects now that cloud data is loaded
        renderSubjects();
        updatePomoSubjectSelect();
        updateCoinDisplay();
        updateXpDisplay();
        updatePomoStats();
        return true;
      }
    }
  }catch(e){/* offline - use localStorage */}
  return false;
}
function mirrorToLocalStorage(){
  localStorage.setItem('sd_subjects',JSON.stringify(subjects));
  localStorage.setItem('sd_pomo_sessions',pomoSessions);
  localStorage.setItem('sd_pomo_focus',pomoFocusMin);
  localStorage.setItem('sd_streak',pomoStreak);
  localStorage.setItem('sd_lastday',lastStudyDay);
  localStorage.setItem('sd_unlocked',JSON.stringify(unlockedBadges));
  localStorage.setItem('sd_coins',mushroomCoins);
  localStorage.setItem('sd_owned_items',JSON.stringify(ownedItems));
  localStorage.setItem('sd_equipped_title',equippedTitle);
  localStorage.setItem('sd_equipped_badges',JSON.stringify(equippedBadges));
  localStorage.setItem('sd_equipped_theme',equippedTheme);
  localStorage.setItem('sd_saved_rooms',JSON.stringify(savedRooms));
  localStorage.setItem('sd_dark',darkMode?'1':'0');
  localStorage.setItem('sd_completed_missions',JSON.stringify(completedMissions));
  localStorage.setItem('sd_mission_streak',missionStreak);
  localStorage.setItem('sd_last_mission_day',lastMissionDay);
  localStorage.setItem('sd_missions_completed',missionsCompleted);
  localStorage.setItem('sd_planner',JSON.stringify(plannerData));
  localStorage.setItem('sd_planner_tasks',plannerTasks);
  localStorage.setItem('sd_weekly_log',JSON.stringify(weeklyStudyLog));
  localStorage.setItem('sd_night_owl',nightOwl?'1':'0');
  localStorage.setItem('sd_early_bird',earlyBird?'1':'0');
  localStorage.setItem('sd_xp',xp);
  localStorage.setItem('sd_level',level);
  localStorage.setItem('sd_name',userName);
  localStorage.setItem('sd_pfp',userPfp);
  localStorage.setItem('sd_saved_at',Date.now());
}
const COLORS=['#e8708a','#f2a98a','#c5b4e3','#a8c5a0','#7bb8d4','#f4c88a','#e89ab4','#9bc4ae'];

