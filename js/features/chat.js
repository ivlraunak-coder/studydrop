// ── CHAT ──
function chatEnter(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}}
function sendChat(){
  const input=document.getElementById('chatInput');const text=input.value.trim();if(!text)return;
  if(!userName)return;
  push(ref(db,`rooms/${currentRoomId}/messages`),{author:userName,pfp:userPfp,uid:userId,text,time:fmtTime(),timestamp:Date.now()});
  input.value='';input.style.height='auto';
}
function deleteChatMsg(msgKey){
  remove(ref(db,`rooms/${currentRoomId}/messages/${msgKey}`));
}
function renderChat(){
  const box=document.getElementById('chatMsgs');
  const atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<80;
  const sysNote=box.querySelector('.sys-note');
  const entries=Object.entries(allMessages).sort((a,b)=>a[1].timestamp-b[1].timestamp);
  const html=entries.map(([key,m])=>{
    const own=m.uid===userId||m.author===userName;
    const[bg,fg]=getAv(m.author);
    const avHtml=m.pfp?`<img src="${m.pfp}" style="width:100%;height:100%;object-fit:cover">`:`<span style="font-size:.58rem;font-weight:800;color:${fg}">${initial(m.author)}</span>`;
    // Delete button only for own messages
    const delBtn=own?`<button class="msg-del-btn" onclick="deleteChatMsg('${key}')">Delete</button>`:'';
    return`<div class="chat-msg ${own?'own':''}">
      <div class="chat-av" style="${m.pfp?'':` background:${bg};`}">${avHtml}</div>
      <div class="msg-wrap">${!own?`<div class="msg-name">${esc(m.author)}</div>`:''}<div class="bubble">${esc(m.text)}</div><div class="msg-time">${m.time}</div>${delBtn}</div>
    </div>`;
  }).join('');
  box.innerHTML=(sysNote?sysNote.outerHTML:'')+html;
  if(atBottom||entries.length<=1)box.scrollTop=box.scrollHeight;
}
document.getElementById('chatInput').addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,80)+'px';});

