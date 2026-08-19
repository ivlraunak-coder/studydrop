// ── GOALS ──
function onGoalFileChosen(input){const file=input.files[0];if(!file)return;if(file.size>5*1024*1024){showToast('Max 5MB');return;}const r=new FileReader();r.onload=e=>{const isImg=file.type.startsWith('image/');pendingGoalFile={name:file.name,data:e.target.result,isImage:isImg};const chip=document.getElementById('goalFileChip');chip.style.display='inline-flex';chip.innerHTML=`<div class="file-chip">${isImg?'🖼':'📎'} ${esc(file.name)}<button onclick="clearGoalFile()">×</button></div>`;};r.readAsDataURL(file);}
function clearGoalFile(){pendingGoalFile=null;document.getElementById('goalFileChip').style.display='none';document.getElementById('goalFile').value='';}
function postGoal(){
  const text=document.getElementById('goalText').value.trim().slice(0,1000);
  if(!text){showToast('Write your goal first! ✨');return;}
  if(!userName){showToast('Set up profile first!');return;}
  push(ref(db,`rooms/${currentRoomId}/goals`),{
    author:userName,pfp:userPfp,uid:userId,text,time:fmtTime(),timestamp:Date.now(),
    file:pendingGoalFile?{...pendingGoalFile}:null,
    reactions:{'🔥':[],'💪':[],'✅':[],'❤️':[],'😮':[]},comments:{}
  });
  const gc=parseInt(localStorage.getItem('sd_goal_count')||'0')+1;
  localStorage.setItem('sd_goal_count',gc);
  // Track today goals for missions
  const tgc=parseInt(localStorage.getItem('sd_today_goals')||'0')+1;
  localStorage.setItem('sd_today_goals',tgc);
  document.getElementById('goalText').value='';clearGoalFile();
  // Award coins for posting goal
  awardCoins(5,'Goal posted! 🎯');
  awardXP(20,'Goal posted! 🎯');
  syncUser();
}
function react(key,emoji){
  if(!userName)return;
  const g=allGoals[key];if(!g)return;
  const rArr=Array.isArray(g.reactions?.[emoji])?[...g.reactions[emoji]]:Object.values(g.reactions?.[emoji]||{});
  const i=rArr.indexOf(userName);
  const wasAdding=i<0;
  if(i>=0)rArr.splice(i,1);else rArr.push(userName);
  update(ref(db,`rooms/${currentRoomId}/goals/${key}/reactions`),{[emoji]:rArr});
  if(wasAdding&&g.uid!==userId){
    const rc=parseInt(localStorage.getItem('sd_react_count')||'0')+1;
    localStorage.setItem('sd_react_count',rc);
    // Track today reacts for missions
    const trc=parseInt(localStorage.getItem('sd_today_reacts')||'0')+1;
    localStorage.setItem('sd_today_reacts',trc);
    syncUser();
  }
}
function deleteGoal(key){remove(ref(db,`rooms/${currentRoomId}/goals/${key}`));}

