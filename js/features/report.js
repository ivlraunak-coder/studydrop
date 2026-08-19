// ── WEEKLY REPORT SYSTEM ──
function reportNav(dir){reportWeekOffset+=dir;if(reportWeekOffset>0)reportWeekOffset=0;renderReport();}
function getWeekDays(offset){
  const days=[];
  const now=new Date();
  const startOfWeek=new Date(now);
  startOfWeek.setDate(now.getDate()-now.getDay()+(offset*7));
  for(let i=0;i<7;i++){
    const d=new Date(startOfWeek);d.setDate(startOfWeek.getDate()+i);
    days.push(d);
  }
  return days;
}
function renderReport(){
  const days=getWeekDays(reportWeekOffset);
  const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const start=days[0],end=days[6];
  document.getElementById('reportWeekLabel').textContent=
    `${monthNames[start.getMonth()]} ${start.getDate()} – ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;

  // Gather data
  const minsPerDay=days.map(d=>weeklyStudyLog[d.toISOString().slice(0,10)]||0);
  const totalMins=minsPerDay.reduce((a,b)=>a+b,0);
  const studiedDays=minsPerDay.filter(m=>m>0).length;
  const avgMins=studiedDays>0?Math.round(totalMins/studiedDays):0;
  const bestDayIdx=minsPerDay.indexOf(Math.max(...minsPerDay));
  const bestDayMins=minsPerDay[bestDayIdx];

  // Stats
  document.getElementById('rTotalHrs').textContent=formatMins(totalMins)||'0m';
  document.getElementById('rDailyAvg').textContent=formatMins(avgMins)||'0m';
  document.getElementById('rBestDay').textContent=bestDayMins>0?dayNames[bestDayIdx]:'—';
  document.getElementById('rPomos').textContent='🍅'+pomoSessions;
  document.getElementById('rStreak').textContent='🔥'+pomoStreak;

  // Missions count
  const todayKey=getTodayKey();
  const totalMissionsThisWeek=DAILY_MISSIONS.length*7+WEEKLY_MISSIONS.length;
  const doneMissionsThisWeek=days.reduce((a,d)=>{
    const k=d.toISOString().slice(0,10);
    return a+(completedMissions[k]||[]).length;
  },0)+(completedMissions[getWeekStart()+'_w']||[]).length;
  document.getElementById('rMissions').textContent=`${doneMissionsThisWeek}/${totalMissionsThisWeek}`;

  // Bar chart
  const maxMins=Math.max(...minsPerDay,60);
  const today=new Date().toISOString().slice(0,10);
  const barHtml=days.map((d,i)=>{
    const k=d.toISOString().slice(0,10);
    const mins=minsPerDay[i];
    const pct=Math.max(2,(mins/maxMins)*100);
    const isToday=k===today;
    return`<div class="bar-wrap">
      <div class="bar-fill-wrap">
        <div class="bar-fill ${isToday?'today-bar':''}" style="height:${pct}%" data-tip="${formatMins(mins)||'0m'}"></div>
      </div>
      <div class="bar-label">${dayNames[i]}</div>
      <div class="bar-val">${mins>0?formatMins(mins):''}</div>
    </div>`;
  }).join('');
  document.getElementById('reportBarChart').innerHTML=barHtml;

  // Subject breakdown
  const subjectBreak=document.getElementById('reportSubjectBreakdown');
  if(!subjects.length){subjectBreak.innerHTML=`<div style="color:var(--muted);font-size:.85rem">No subjects tracked yet. Add some in My Tracker!</div>`;
  } else {
    const maxSubMins=Math.max(...subjects.map(s=>s.totalMins),1);
    subjectBreak.innerHTML=subjects.slice().sort((a,b)=>b.totalMins-a.totalMins).map(s=>`
      <div class="subject-break-item">
        <div class="subject-break-dot" style="background:${s.color}"></div>
        <div class="subject-break-name">${esc(s.name)}</div>
        <div class="subject-break-bar-bg"><div class="subject-break-bar" style="width:${(s.totalMins/maxSubMins*100).toFixed(1)}%;background:${s.color}"></div></div>
        <div class="subject-break-time">${formatMins(s.totalMins)}</div>
      </div>`).join('');
  }

  // Insights
  const insights=[];
  if(studiedDays>=5)insights.push({icon:'🔥',text:'Amazing consistency — you studied 5+ days this week!'});
  else if(studiedDays>=3)insights.push({icon:'👍',text:`You studied ${studiedDays} days this week. Great progress!`});
  else if(studiedDays>0)insights.push({icon:'💡',text:`You studied ${studiedDays} day${studiedDays>1?'s':''} this week. Try to be more consistent!`});
  else insights.push({icon:'😴',text:'No study sessions logged this week yet. Start today!'});
  if(totalMins>=600)insights.push({icon:'🏆',text:`Incredible — over ${formatMins(totalMins)} studied this week!`});
  if(pomoStreak>=7)insights.push({icon:'🌟',text:`${pomoStreak}-day streak! You're on an absolute roll.`});
  if(bestDayMins>=120)insights.push({icon:'💎',text:`Best day: ${dayNames[bestDayIdx]} with ${formatMins(bestDayMins)} — phenomenal!`});
  document.getElementById('reportInsights').innerHTML=insights.map(i=>`<div class="report-insight-item"><span>${i.icon}</span><span>${i.text}</span></div>`).join('');

  // Weekly score (0-100)
  const consistencyScore=(studiedDays/7)*30;
  const hoursScore=Math.min(30,(totalMins/600)*30);
  const pomosScore=Math.min(20,(pomoSessions/10)*20);
  const missionScore=Math.min(20,(doneMissionsThisWeek/14)*20);
  const score=Math.round(consistencyScore+hoursScore+pomosScore+missionScore);
  const scoreEl=document.getElementById('reportScore');
  scoreEl.textContent=score;
  scoreEl.style.color=score>=80?'var(--sage)':score>=50?'var(--pink)':'var(--peach)';
}

// Update study log when hours are logged
function logStudyToWeekly(minsAdded){
  const today=getTodayKey();
  weeklyStudyLog[today]=(weeklyStudyLog[today]||0)+minsAdded;
  // Check night owl / early bird
  const hr=new Date().getHours();
  if(hr>=0&&hr<3&&!nightOwl){nightOwl=true;}
  if(hr>=5&&hr<7&&!earlyBird){earlyBird=true;}
  saveLocal();
  renderMissions();
}

// expose new globals
window.setPlannerMode=setPlannerMode;window.plannerNav=plannerNav;
window.openPlannerDay=openPlannerDay;window.closePlannerModal=closePlannerModal;
window.addPlannerTask=addPlannerTask;window.togglePlannerTask=togglePlannerTask;
window.deletePlannerTask=deletePlannerTask;
window.reportNav=reportNav;


