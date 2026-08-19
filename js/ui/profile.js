// ── PROFILE MODAL ──
function openProfileModal(){
  document.getElementById('nameInput').value=userName;
  if(userPfp){document.getElementById('pfpPreviewImg').src=userPfp;document.getElementById('pfpPreviewImg').style.display='block';document.getElementById('pfpEmoji').style.display='none';}
  updateEquippedDisplay();
  // Update XP display in modal
  const cur=getLevelInfo(xp);
  const next=getNextLevelInfo(xp);
  const pct=next?Math.round(((xp-cur.xpNeeded)/(next.xpNeeded-cur.xpNeeded))*100):100;
  const lvlLabel=document.getElementById('profileLevelLabel');
  const xpBar=document.getElementById('profileXpBar');
  const xpCur=document.getElementById('profileXpCurrent');
  const xpNxt=document.getElementById('profileXpNext');
  if(lvlLabel)lvlLabel.textContent=`${cur.icon} Level ${cur.level} · ${cur.title}`;
  if(xpBar)xpBar.style.width=pct+'%';
  if(xpCur)xpCur.textContent=`${xp} XP`;
  if(xpNxt)xpNxt.textContent=next?`Next: ${next.xpNeeded} XP`:'Max Level! 🌟';
  document.getElementById('profileModal').classList.remove('hidden');
}
function closeProfileModal(){document.getElementById('profileModal').classList.add('hidden');}
function onPfpChosen(input){const file=input.files[0];if(!file)return;if(file.size>2*1024*1024){showToast('Max 2MB');return;}const r=new FileReader();r.onload=e=>{tempPfpData=e.target.result;document.getElementById('pfpPreviewImg').src=tempPfpData;document.getElementById('pfpPreviewImg').style.display='block';document.getElementById('pfpEmoji').style.display='none';};r.readAsDataURL(file);}
function saveProfile(){
  const name=document.getElementById('nameInput').value.trim();
  if(!name){showToast('Enter your name!');return;}
  userName=name;if(tempPfpData)userPfp=tempPfpData;
  localStorage.setItem('sd_name',userName);localStorage.setItem('sd_pfp',userPfp);
  // Push to cloud immediately
  if(userId) set(ref(db,`profiles/${userId}`),getCloudPayload()).catch(()=>{});
  updateHeader();loadPetState();updateAvatarInHeader();syncUser();closeProfileModal();
  showToast('Profile updated! ✨');
}

function updateHeader(){
  document.getElementById('chipName').textContent=userName;
  document.getElementById('headerRoomName').textContent=currentRoomName;
  document.getElementById('postName').textContent=userName;
  const chipAv=document.getElementById('chipAv');
  const[bg,fg]=getAv(userName);
  if(userPfp){chipAv.innerHTML=`<img src="${userPfp}" style="width:100%;height:100%;object-fit:cover">`;}
  else{chipAv.style.background=bg;chipAv.style.color=fg;chipAv.innerHTML=`<span style="font-size:.68rem;font-weight:800">${initial(userName)}</span>`;}
  const pa=document.getElementById('postAvatar');
  if(userPfp){pa.style.cssText='width:42px;height:42px;border-radius:50%;overflow:hidden;flex-shrink:0';pa.innerHTML=`<img src="${userPfp}" style="width:100%;height:100%;object-fit:cover">`;}
  else{pa.style.cssText=`width:42px;height:42px;border-radius:50%;background:${bg};color:${fg};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;font-family:'Plus Jakarta Sans',sans-serif;flex-shrink:0`;pa.textContent=initial(userName);}
  // ── Sync sidebar ──
  updateSidebar();
}

function updateSidebar(){
  // Name + initial
  const sbName=document.getElementById('sbName');
  const sbInit=document.getElementById('sbInitial');
  if(sbName) sbName.textContent = userName || 'You';
  // Avatar — show pfp if available, else initial letter
  const sbAv=document.getElementById('sbAv');
  if(sbAv){
    if(userPfp){
      sbAv.innerHTML=`<img src="${userPfp}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    } else {
      const[bg,fg]=getAv(userName||'?');
      sbAv.style.background=bg; sbAv.style.color=fg;
      sbAv.innerHTML=`<span style="font-size:.75rem;font-weight:800">${initial(userName||'?')}</span>`;
    }
  }
  // Level label
  const lvlInfo=typeof getLevelInfo==='function'?getLevelInfo(xp):null;
  const sbLevel=document.getElementById('sbLevel');
  if(sbLevel&&lvlInfo) sbLevel.textContent=`Level ${lvlInfo.level} · ${lvlInfo.title}`;
  const sbLvlText=document.getElementById('sbLvlText');
  if(sbLvlText&&lvlInfo) sbLvlText.textContent='LVL '+lvlInfo.level;
  // XP bar
  const hBar=document.getElementById('headerXpBar');
  const sbBar=document.getElementById('sbXpFill');
  if(hBar&&sbBar) sbBar.style.width=hBar.style.width;
  // Stats
  const sbXp=document.getElementById('sbXp');
  if(sbXp) sbXp.textContent=xp||0;
  const sbCoins=document.getElementById('sbCoins');
  if(sbCoins) sbCoins.textContent=typeof mushroomCoins!=='undefined'?mushroomCoins:0;
  const sbStreak=document.getElementById('sbStreak');
  if(sbStreak) sbStreak.textContent=typeof pomoStreak!=='undefined'?pomoStreak:0;
  // Room
  const sbRoom=document.getElementById('sbRoomName');
  if(sbRoom) sbRoom.textContent=currentRoomName||'Room';
  const sbOnline=document.getElementById('sbOnlineCount');
  const onlineTxt=document.getElementById('onlineText');
  if(sbOnline&&onlineTxt) sbOnline.textContent=onlineTxt.textContent;
}

