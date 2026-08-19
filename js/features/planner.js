// ── PLANNER SYSTEM ──
function setPlannerMode(mode,btn){
  plannerMode=mode;
  document.querySelectorAll('.planner-mode-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderPlanner();
}
function plannerNav(dir){
  if(plannerMode==='month'){plannerDate.setMonth(plannerDate.getMonth()+dir);}
  else{plannerDate.setFullYear(plannerDate.getFullYear()+dir);}
  renderPlanner();
}
function renderPlanner(){
  if(plannerMode==='month')renderMonthPlanner();
  else renderYearPlanner();
}
function renderMonthPlanner(){
  const y=plannerDate.getFullYear(),m=plannerDate.getMonth();
  const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('plannerLabel').textContent=`${monthNames[m]} ${y}`;
  const first=new Date(y,m,1);const last=new Date(y,m+1,0);
  const startDow=first.getDay();
  const today=new Date();
  let html=`<div class="planner-grid-month">`;
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>html+=`<div class="planner-day-header">${d}</div>`);
  // blank cells before
  for(let i=0;i<startDow;i++){
    const d=new Date(y,m,1-startDow+i);
    const k=d.toISOString().slice(0,10);
    const tasks=plannerData[k]||[];
    html+=`<div class="planner-day other-month ${tasks.length?'has-tasks':''}" onclick="openPlannerDay('${k}')"><div class="planner-day-num">${d.getDate()}</div>${tasks.slice(0,2).map(t=>`<div class="planner-task-chip ${t.done?'done-chip':''}">${esc(t.text)}</div>`).join('')}<button class="planner-add-btn">+</button></div>`;
  }
  for(let day=1;day<=last.getDate();day++){
    const d=new Date(y,m,day);
    const k=d.toISOString().slice(0,10);
    const tasks=plannerData[k]||[];
    const isToday=d.toDateString()===today.toDateString();
    const studiedMins=weeklyStudyLog[k]||0;
    html+=`<div class="planner-day ${isToday?'today':''} ${tasks.length?'has-tasks':''}" onclick="openPlannerDay('${k}')"><div class="planner-day-num">${day}${studiedMins?`<span style="font-size:.55rem;color:var(--muted);font-weight:500;margin-left:3px">${formatMins(studiedMins)}</span>`:''}</div>${tasks.slice(0,2).map(t=>`<div class="planner-task-chip ${t.done?'done-chip':''}">${esc(t.text)}</div>`).join('')}${tasks.length>2?`<div style="font-size:.58rem;color:var(--muted);margin-top:1px">+${tasks.length-2} more</div>`:''}<button class="planner-add-btn">+</button></div>`;
  }
  html+=`</div>`;
  document.getElementById('plannerGrid').innerHTML=html;
}
function renderYearPlanner(){
  const y=plannerDate.getFullYear();
  document.getElementById('plannerLabel').textContent=`${y}`;
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const today=new Date();
  let html=`<div class="planner-grid-year">`;
  for(let m=0;m<12;m++){
    const first=new Date(y,m,1),last=new Date(y,m+1,0);
    const startDow=first.getDay();
    html+=`<div class="planner-mini-month"><div class="planner-mini-month-title">${monthNames[m]}</div><div class="planner-mini-grid">`;
    ['S','M','T','W','T','F','S'].forEach(d=>html+=`<div style="text-align:center;font-size:.52rem;color:var(--muted);font-weight:800">${d}</div>`);
    for(let i=0;i<startDow;i++){
      const d=new Date(y,m,1-startDow+i);
      const k=d.toISOString().slice(0,10);
      const hasTasks=(plannerData[k]||[]).length>0;
      html+=`<div class="planner-mini-day other-month ${hasTasks?'has-tasks':''}" onclick="openPlannerDay('${k}')">${d.getDate()}</div>`;
    }
    for(let day=1;day<=last.getDate();day++){
      const d=new Date(y,m,day);
      const k=d.toISOString().slice(0,10);
      const hasTasks=(plannerData[k]||[]).length>0;
      const isToday=d.toDateString()===today.toDateString();
      html+=`<div class="planner-mini-day ${isToday?'today':''} ${hasTasks?'has-tasks':''}" onclick="openPlannerDay('${k}')">${day}</div>`;
    }
    html+=`</div></div>`;
  }
  html+=`</div>`;
  document.getElementById('plannerGrid').innerHTML=html;
}
function openPlannerDay(dateKey){
  plannerSelectedDate=dateKey;
  const d=new Date(dateKey+'T12:00:00');
  const opts={weekday:'long',year:'numeric',month:'long',day:'numeric'};
  document.getElementById('plannerDayTitle').textContent=d.toLocaleDateString(undefined,opts);
  const studied=weeklyStudyLog[dateKey]||0;
  const studyInfo=document.getElementById('plannerDayStudyInfo');
  if(studied>0){studyInfo.style.display='block';studyInfo.textContent=`📊 You studied ${formatMins(studied)} on this day!`;}
  else{studyInfo.style.display='none';}
  renderPlannerTaskList();
  document.getElementById('plannerDayModal').classList.remove('hidden');
}
function closePlannerModal(){document.getElementById('plannerDayModal').classList.add('hidden');renderPlanner();}
function renderPlannerTaskList(){
  const tasks=plannerData[plannerSelectedDate]||[];
  const list=document.getElementById('plannerTaskList');
  if(!tasks.length){list.innerHTML=`<div style="text-align:center;padding:20px;color:var(--muted);font-size:.82rem">No tasks yet — add one below!</div>`;return;}
  list.innerHTML=tasks.map((t,i)=>`<div class="planner-task-item ${t.done?'done':''}">
    <input type="checkbox" ${t.done?'checked':''} onchange="togglePlannerTask(${i})">
    ${t.color?`<div class="planner-task-subject-dot" style="background:${t.color}"></div>`:''}
    <div class="planner-task-text">${esc(t.text)}</div>
    <button class="planner-task-del" onclick="deletePlannerTask(${i})">✕</button>
  </div>`).join('');
}
function addPlannerTask(){
  const input=document.getElementById('plannerTaskInput');
  const text=input.value.trim();if(!text)return;
  if(!plannerData[plannerSelectedDate])plannerData[plannerSelectedDate]=[];
  plannerData[plannerSelectedDate].push({id:Date.now(),text,done:false,color:selectedColor});
  plannerTasks++;
  // Track today's planner adds for missions
  const todayKey=getTodayKey();
  if(plannerSelectedDate===todayKey){
    const cur=parseInt(localStorage.getItem('sd_today_planner')||'0');
    localStorage.setItem('sd_today_planner',cur+1);
  }
  saveLocal();renderPlannerTaskList();input.value='';
  showToast('Task added to planner! 📅');
  renderMissions();
  syncUser();
}
function togglePlannerTask(idx){
  const tasks=plannerData[plannerSelectedDate];if(!tasks||!tasks[idx])return;
  tasks[idx].done=!tasks[idx].done;
  saveLocal();renderPlannerTaskList();
  if(tasks[idx].done)showToast('Task done! ✅');
}
function deletePlannerTask(idx){
  if(!plannerData[plannerSelectedDate])return;
  plannerData[plannerSelectedDate].splice(idx,1);
  saveLocal();renderPlannerTaskList();
}

