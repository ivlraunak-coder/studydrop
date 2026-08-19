// ── ROOM LOBBY ──
function showRoomLobby(){
  document.getElementById('roomLobby').classList.remove('hidden');
  document.getElementById('appWrap').style.display='none';
  renderMyRoomsList();
}
function renderMyRoomsList(){
  const sec=document.getElementById('myRoomsSection');
  const list=document.getElementById('myRoomsList');
  if(!savedRooms.length){sec.style.display='none';return;}
  sec.style.display='block';
  list.innerHTML=savedRooms.map(r=>`
    <div class="my-room-item" onclick="quickJoinRoom('${r.id}','${esc(r.name)}')">
      <div class="room-dot"></div>
      <div class="room-name">${esc(r.name)}</div>
      <div class="room-code-badge">${r.id}</div>
      <button class="room-leave-btn" onclick="event.stopPropagation();removeFromSaved('${r.id}')" title="Remove">✕</button>
    </div>`).join('');
}
function removeFromSaved(id){
  savedRooms=savedRooms.filter(r=>r.id!==id);
  saveLocal();renderMyRoomsList();
  if(id===currentRoomId){currentRoomId='';currentRoomName='';localStorage.removeItem('sd_room_id');localStorage.removeItem('sd_room_name');}
}
function quickJoinRoom(id,name){
  currentRoomId=id;currentRoomName=name;
  localStorage.setItem('sd_room_id',id);localStorage.setItem('sd_room_name',name);
  document.getElementById('roomLobby').classList.add('hidden');
  enterApp();showToast(`Joined "${name}"! 🎉`);
}

function createRoom(){
  const name=document.getElementById('newRoomName').value.trim();
  if(!name){showToast('Enter a room name!');return;}
  if(!userName){showToast('Set up your profile first!');return;}
  const btn=document.querySelector('[onclick="createRoom()"]');
  if(btn){btn.textContent='Creating…';btn.disabled=true;}
  const code=genCode();
  const roomData={
    name,code,createdBy:userName,createdByUid:userId,createdAt:Date.now(),
    users:{
      [userId]:{name:userName,pfp:userPfp,uid:userId,joinedAt:Date.now()}
    }
  };
  const roomIndex={name,code,createdByUid:userId,createdAt:roomData.createdAt};
  const writes={};
  writes[`roomCodes/${code}`]=roomIndex;
  writes[`rooms/${code}`]=roomData;
  update(ref(db),writes).then(()=>{
    currentRoomId=code;currentRoomName=name;
    localStorage.setItem('sd_room_id',code);localStorage.setItem('sd_room_name',name);
    if(!savedRooms.find(r=>r.id===code))savedRooms.push({id:code,name});
    saveLocal();
    showRoomCodeModal(code,name);
    document.getElementById('roomLobby').classList.add('hidden');
    enterApp();
  }).catch(err=>{
    showToast('Could not create room — check your connection 📶');
    if(btn){btn.textContent='Create Room →';btn.disabled=false;}
  });
}
function joinRoom(){
  const code=document.getElementById('joinCodeInput').value.trim().toUpperCase();
  if(code.length!==6){showToast('Enter a 6-character code!');return;}
  if(!userName){showToast('Set up your profile first!');return;}
  const btn=document.querySelector('[onclick="joinRoom()"]');
  if(btn){btn.textContent='Joining…';btn.disabled=true;}
  get(ref(db,`roomCodes/${code}`)).then(snap=>{
    if(btn){btn.textContent='Join Room →';btn.disabled=false;}
    if(!snap.exists()){showToast('Room not found! Check the code.');return;}
    const room=snap.val();
    return set(ref(db,`rooms/${code}/users/${userId}`),{
      name:userName,pfp:userPfp,uid:userId,joinedAt:Date.now()
    }).then(()=>{
      currentRoomId=code;currentRoomName=room.name;
      localStorage.setItem('sd_room_id',code);localStorage.setItem('sd_room_name',room.name);
      if(!savedRooms.find(r=>r.id===code))savedRooms.push({id:code,name:room.name});
      saveLocal();
      document.getElementById('roomLobby').classList.add('hidden');
      enterApp();
      showToast(`Joined "${room.name}"! 🎉`);
    });
  }).catch(()=>{
    const btn=document.querySelector('[onclick="joinRoom()"]');
    if(btn){btn.textContent='Join Room →';btn.disabled=false;}
    showToast('Could not reach server — check your connection 📶');
  });
}
function showRoomCodeModal(code,name){
  const html=`<div style="position:fixed;inset:0;z-index:500;background:var(--overlay-bg);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;padding:20px" id="codeModal">
    <div style="background:var(--white);border:1px solid var(--border);border-radius:28px;padding:40px;max-width:380px;width:100%;text-align:center;box-shadow:var(--sh-lg)">
      <div style="font-size:2rem;margin-bottom:12px">🎉</div>
      <div style="font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;margin-bottom:6px;color:var(--text)">Room Created!</div>
      <div style="color:var(--muted);font-size:.85rem;margin-bottom:20px">Share this code with friends to join <strong>${esc(name)}</strong></div>
      <div class="room-code-display" onclick="copyCode('${code}')">${code}</div>
      <div class="copy-hint">Click to copy code</div>
      <button class="btn btn-primary" onclick="document.getElementById('codeModal').remove()" style="width:100%;justify-content:center;border-radius:14px">Start Studying! →</button>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}
window.copyCode=function(code){navigator.clipboard.writeText(code).then(()=>showToast('Code copied! 📋')).catch(()=>{const el=document.createElement('textarea');el.value=code;document.body.appendChild(el);el.select();document.execCommand('copy');el.remove();showToast('Code copied! 📋');});};

function showRoomCode(){
  showToast(`Room code: ${currentRoomId} (tap to copy)`);
  navigator.clipboard.writeText(currentRoomId).catch(()=>{});
}

