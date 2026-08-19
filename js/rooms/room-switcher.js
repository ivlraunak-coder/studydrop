// ── MULTI-ROOM SWITCH PANEL ──
function openSwitchPanel(){
  renderSwitchRooms();
  document.getElementById('switchRoomPanel').classList.remove('hidden');
}
function closeSwitchPanel(){
  document.getElementById('switchRoomPanel').classList.add('hidden');
}
function renderSwitchRooms(){
  const list=document.getElementById('switchRoomsList');
  if(!savedRooms.length){list.innerHTML=`<div style="text-align:center;padding:20px;color:var(--muted);font-size:.85rem">No saved rooms yet. Join or create one!</div>`;return;}
  list.innerHTML=savedRooms.map(r=>{
    const isCurrent=r.id===currentRoomId;
    return`<div class="switch-room-row ${isCurrent?'current':''}" onclick="${isCurrent?'':'switchToRoom(\''+r.id+'\',\''+esc(r.name)+'\')'}">
      <div class="sr-dot"></div>
      <div class="sr-name">${esc(r.name)}</div>
      <div class="sr-code">${r.id}</div>
      ${isCurrent?'<span class="sr-current-label">Current</span>':''}
      <button class="sr-leave" onclick="event.stopPropagation();leaveRoom('${r.id}')" title="Leave room">✕</button>
    </div>`;
  }).join('');
}
function switchToRoom(id,name){
  if(id===currentRoomId){closeSwitchPanel();return;}
  // Remove presence from old room
  if(currentRoomId&&userId){
    remove(ref(db,`rooms/${currentRoomId}/presence/${userId}`)).catch(()=>{});
    clearStudyStatus();
  }
  currentRoomId=id;currentRoomName=name;
  localStorage.setItem('sd_room_id',id);localStorage.setItem('sd_room_name',name);
  closeSwitchPanel();
  enterApp();
  showToast(`Switched to "${name}" 🚪`);
}
function leaveRoom(id){
  if(!confirm('Leave this room? You can rejoin later with the code.'))return;
  savedRooms=savedRooms.filter(r=>r.id!==id);
  if(id===currentRoomId){
    remove(ref(db,`rooms/${id}/presence/${userId}`)).catch(()=>{});
    currentRoomId='';currentRoomName='';
    localStorage.removeItem('sd_room_id');localStorage.removeItem('sd_room_name');
    saveLocal();
    closeSwitchPanel();
    showRoomLobby();
  } else {
    saveLocal();
    renderSwitchRooms();
    showToast('Left room.');
  }
}
function openAddRoomFromPanel(){
  closeSwitchPanel();
  // Remove from app, show lobby
  document.getElementById('appWrap').style.display='none';
  document.getElementById('roomLobby').classList.remove('hidden');
  renderMyRoomsList();
}

function enterApp(){
  document.getElementById('roomLobby').classList.add('hidden');
  document.getElementById('appWrap').style.display='block';
  updateHeader();
  loadPetState();updateAvatarInHeader();
  subscribeFirebase();
  setupPresence();
}

