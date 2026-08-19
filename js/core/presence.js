// ── PRESENCE ──
function setupPresence(){
  if(!userName||!currentRoomId)return;
  const myRef=ref(db,`rooms/${currentRoomId}/presence/${userId}`);
  set(myRef,{name:userName,pfp:userPfp,at:Date.now()});
  onDisconnect(myRef).remove();
  onValue(ref(db,`rooms/${currentRoomId}/presence`),snap=>{
    const n=Object.keys(snap.val()||{}).length;
    document.getElementById('onlineText').textContent=`${n} online`;
    document.getElementById('onlineCountChat').textContent=`${n} online`;
  });
}

