// ── FIREBASE SUBS ──
let activeListeners=[];
function subscribeFirebase(){
  if(!currentRoomId)return;
  // Clean up old listeners if any
  activeListeners=[];
  onValue(ref(db,`rooms/${currentRoomId}/goals`),snap=>{allGoals=snap.val()||{};renderGoals();});
  onValue(ref(db,`rooms/${currentRoomId}/messages`),snap=>{allMessages=snap.val()||{};renderChat();});
  onValue(ref(db,`rooms/${currentRoomId}/users`),snap=>{allUsers=snap.val()||{};});
  subscribeStudyingNow();
  syncUser();
}
function syncUser(){
  if(!userName||!currentRoomId)return;
  const totalMins=subjects.reduce((a,s)=>a+s.totalMins,0);
  const reactCount=parseInt(localStorage.getItem('sd_react_count')||'0');
  const goalCount=parseInt(localStorage.getItem('sd_goal_count')||'0');
  const titleItem=SHOP_ITEMS.find(i=>i.id===equippedTitle);
  const displayBadges=equippedBadges.map(id=>{const it=SHOP_ITEMS.find(i=>i.id===id);return it?it.preview:''}).filter(Boolean);
  const curLvl=getLevelInfo(xp);
  set(ref(db,`rooms/${currentRoomId}/users/${userId}`),{
    name:userName,pfp:userPfp,uid:userId,subjects,pomoSessions,pomoFocusMin,pomoStreak,
    totalMins,reactCount,goalCount,badges:unlockedBadges,
    equippedTitle:titleItem?titleItem.titleText:'',
    equippedTitleColor:titleItem?titleItem.titleColor:'',
    equippedBadgesDisplay:displayBadges,
    xp,level:curLvl.level,levelTitle:curLvl.title,levelIcon:curLvl.icon,
    updatedAt:Date.now()
  });
  checkBadges({totalMins,pomoSessions,pomoStreak,subjects,reactCount,goalCount,
    mushroomCoins,missionsCompleted,plannerTasks,nightOwl,earlyBird});
}

