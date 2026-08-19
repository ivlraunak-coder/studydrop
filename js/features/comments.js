// ── COMMENTS ──
function toggleComments(key){const el=document.getElementById('comments_'+key);if(el)el.style.display=el.style.display==='none'?'block':'none';}
function submitComment(key){
  const input=document.getElementById('ci_'+key);const text=input.value.trim().slice(0,500);if(!text)return;
  push(ref(db,`rooms/${currentRoomId}/goals/${key}/comments`),{author:userName,pfp:userPfp,uid:userId,text,time:fmtTime(),timestamp:Date.now()});
  input.value='';
}
function deleteComment(goalKey,commentKey){remove(ref(db,`rooms/${currentRoomId}/goals/${goalKey}/comments/${commentKey}`));}

function renderGoals(){
  const feed=document.getElementById('goalFeed');
  const entries=Object.entries(allGoals).sort((a,b)=>b[1].timestamp-a[1].timestamp);
  document.getElementById('goalCount').textContent=entries.length;
  if(!entries.length){feed.innerHTML=`<div class="empty-feed"><div class="ei">🌸</div><p>No goals yet.<br>Be the first to drop yours!</p></div>`;return;}
  feed.innerHTML=entries.map(([key,g])=>{
    const own=g.uid===userId;
    const EMOJIS=['🔥','💪','✅','❤️','😮'];
    const reactHtml=EMOJIS.map(emoji=>{
      const uArr=Array.isArray(g.reactions?.[emoji])?g.reactions[emoji]:Object.values(g.reactions?.[emoji]||{});
      const active=uArr.includes(userName)?'active':'';
      return`<button class="react-btn ${active}" onclick="react('${key}','${emoji}')">${emoji}${uArr.length?' '+uArr.length:''}</button>`;
    }).join('');
    const fileHtml=g.file?(g.file.isImage?`<img class="goal-img" src="${g.file.data}" onclick="openLightbox(this.src)" alt="">`:`<a class="goal-file-link" href="${g.file.data}" download="${esc(g.file.name)}">📎 ${esc(g.file.name)} ↓</a>`):'';
    const comments=g.comments?Object.entries(g.comments).sort((a,b)=>a[1].timestamp-b[1].timestamp):[];
    const commentsHtml=comments.map(([ck,c])=>{
      const isOwn=c.uid===userId;
      return`<div class="comment-item">
        ${avatarEl(c.author,c.pfp,26)}
        <div class="comment-bubble">
          <div class="comment-author">${esc(c.author)}</div>
          <div class="comment-text">${esc(c.text)}</div>
          <div class="comment-time">${c.time}</div>
        </div>
        ${isOwn?`<button class="comment-del" onclick="deleteComment('${key}','${ck}')">✕</button>`:''}
      </div>`;
    }).join('');
    return`<div class="goal-item">
      <div class="goal-meta">${avatarEl(g.author,g.pfp,36)}<span class="goal-author">${esc(g.author)}</span><span class="goal-time">${g.time}</span>${own?`<button class="del-btn" onclick="deleteGoal('${key}')">✕</button>`:''}</div>
      <div class="goal-text">${esc(g.text)}</div>${fileHtml}
      <div class="reactions-row">${reactHtml}</div>
      <div class="comments-section">
        <button class="comments-toggle" onclick="toggleComments('${key}')">💬 ${comments.length} comment${comments.length!==1?'s':''} · tap to ${comments.length?'view':'add'}</button>
        <div id="comments_${key}" style="display:none">
          ${comments.length?`<div class="comments-list">${commentsHtml}</div>`:''}
          <div class="add-comment-row">
            ${avatarEl(userName,userPfp,26)}
            <input class="comment-input" id="ci_${key}" placeholder="Add a comment…" onkeydown="if(event.key==='Enter')submitComment('${key}')">
            <button class="comment-send" onclick="submitComment('${key}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

