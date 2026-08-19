// ── MISSIONS SYSTEM ──
const DAILY_MISSIONS=[
  {id:'d_study30',icon:'📖',name:'Study 30 Minutes',desc:'Log or Pomodoro 30+ mins today',reward:30,type:'daily',check:()=>getTodayMins()>=30},
  {id:'d_study60',icon:'🔥',name:'Study 1 Hour',desc:'Log or Pomodoro 60+ mins today',reward:60,type:'daily',check:()=>getTodayMins()>=60},
  {id:'d_pomo1',icon:'🍅',name:'One Pomodoro',desc:'Complete 1 focus session today',reward:25,type:'daily',check:()=>getTodayPomos()>=1},
  {id:'d_post_goal',icon:'🎯',name:'Drop a Goal',desc:'Post at least 1 goal today',reward:20,type:'daily',check:()=>getTodayGoals()>=1},
  {id:'d_react',icon:'💬',name:'Be Supportive',desc:'React to someone\'s goal today',reward:15,type:'daily',check:()=>getTodayReacts()>=1},
  {id:'d_planner',icon:'📅',name:'Plan Ahead',desc:'Add 1 task to the planner today',reward:20,type:'daily',check:()=>getTodayPlannerAdds()>=1},
];
const WEEKLY_MISSIONS=[
  {id:'w_study5h',icon:'💪',name:'5 Hours This Week',desc:'Study 5+ hours this week',reward:150,type:'weekly',check:()=>getWeekMins()>=300},
  {id:'w_study10h',icon:'👑',name:'10-Hour Week',desc:'Study 10+ hours this week',reward:300,type:'weekly',check:()=>getWeekMins()>=600},
  {id:'w_pomo5',icon:'🍅',name:'5 Pomodoros',desc:'Complete 5 focus sessions this week',reward:100,type:'weekly',check:()=>getWeekPomos()>=5},
  {id:'w_streak5',icon:'🌟',name:'5-Day Streak',desc:'Study 5 days in a row this week',reward:200,type:'weekly',check:()=>pomoStreak>=5},
  {id:'w_goals5',icon:'📋',name:'5 Goals Posted',desc:'Post 5 goals this week',reward:100,type:'weekly',check:()=>getWeekGoals()>=5},
];

function getTodayKey(){return new Date().toISOString().slice(0,10);}
function getWeekStart(){const d=new Date();d.setDate(d.getDate()-d.getDay());return d.toISOString().slice(0,10);}

function getTodayMins(){
  const today=getTodayKey();
  return weeklyStudyLog[today]||0;
}
function getTodayPomos(){return parseInt(localStorage.getItem('sd_today_pomos')||'0');}
function getTodayGoals(){return parseInt(localStorage.getItem('sd_today_goals')||'0');}
function getTodayReacts(){return parseInt(localStorage.getItem('sd_today_reacts')||'0');}
function getTodayPlannerAdds(){return parseInt(localStorage.getItem('sd_today_planner')||'0');}
function getWeekMins(){
  const ws=getWeekStart();const now=new Date();let total=0;
  for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(d.getDate()+i);const k=d.toISOString().slice(0,10);total+=weeklyStudyLog[k]||0;}
  return total;
}
function getWeekPomos(){return pomoSessions;}
function getWeekGoals(){return parseInt(localStorage.getItem('sd_goal_count')||'0');}

function renderMissions(){
  const todayKey=getTodayKey();
  const todayDone=completedMissions[todayKey]||[];
  const weekKey=getWeekStart();
  const weekDone=completedMissions[weekKey+'_w']||[];

  // Check and auto-complete missions
  [...DAILY_MISSIONS,...WEEKLY_MISSIONS].forEach(m=>{
    const key=m.type==='daily'?todayKey:weekKey+'_w';
    if(!completedMissions[key])completedMissions[key]=[];
    const alreadyDone=completedMissions[key].includes(m.id);
    if(!alreadyDone&&m.check()){
      completedMissions[key].push(m.id);
      missionsCompleted++;
      awardCoins(m.reward,`Mission: "${m.name}" 🎯`);
      awardXP(m.reward*2,`Mission: "${m.name}" ⭐`);
      showToast(`⚡ Mission Complete: ${m.name}! +${m.reward} 🍄`);
      saveLocal();
    }
  });

  // Check mission streak
  if(DAILY_MISSIONS.every(m=>(completedMissions[todayKey]||[]).includes(m.id))){
    if(lastMissionDay!==todayKey){
      const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
      const yKey=yesterday.toISOString().slice(0,10);
      if(lastMissionDay===yKey)missionStreak++;else missionStreak=1;
      lastMissionDay=todayKey;saveLocal();
    }
  }

  // Update streak banner
  document.getElementById('missionStreakVal').textContent=`${missionStreak}-Day Mission Streak`;

  // Update badge
  const allDailyDone=DAILY_MISSIONS.every(m=>(completedMissions[todayKey]||[]).includes(m.id));
  const badge=document.getElementById('missionBadge');
  badge.textContent=allDailyDone?'✓':'!';
  badge.style.background=allDailyDone?'var(--sage)':'';

  function missionHtml(missions,doneArr){
    return missions.map(m=>{
      const done=doneArr.includes(m.id);
      const progress=done?1:Math.min(1,getProgress(m));
      return`<div class="mission-card ${done?'completed':''}">
        <div class="mission-icon">${m.icon}</div>
        <div class="mission-name">${m.name}</div>
        <div class="mission-desc">${m.desc}</div>
        <div class="mission-reward">🍄 +${m.reward} coins</div>
        <div class="mission-progress-bar"><div class="mission-progress-fill ${done?'done':''}" style="width:${Math.round(progress*100)}%"></div></div>
        <div class="mission-progress-text">${done?'✅ Completed!':Math.round(progress*100)+'% — keep going!'}</div>
      </div>`;
    }).join('');
  }
  // Re-read after auto-complete loop so newly completed missions show as done immediately
  const todayDoneFinal=completedMissions[todayKey]||[];
  const weekDoneFinal=completedMissions[weekKey+'_w']||[];
  document.getElementById('dailyMissionsGrid').innerHTML=missionHtml(DAILY_MISSIONS,todayDoneFinal);
  document.getElementById('weeklyMissionsGrid').innerHTML=missionHtml(WEEKLY_MISSIONS,weekDoneFinal);
}

function getProgress(m){
  if(m.id==='d_study30')return getTodayMins()/30;
  if(m.id==='d_study60')return getTodayMins()/60;
  if(m.id==='d_pomo1')return getTodayPomos()>=1?1:0;
  if(m.id==='d_post_goal')return getTodayGoals()>=1?1:0;
  if(m.id==='d_react')return getTodayReacts()>=1?1:0;
  if(m.id==='d_planner')return getTodayPlannerAdds()>=1?1:0;
  if(m.id==='w_study5h')return getWeekMins()/300;
  if(m.id==='w_study10h')return getWeekMins()/600;
  if(m.id==='w_pomo5')return Math.min(1,getWeekPomos()/5);
  if(m.id==='w_streak5')return Math.min(1,pomoStreak/5);
  if(m.id==='w_goals5')return Math.min(1,getWeekGoals()/5);
  return 0;
}

function startMissionTimer(){
  let lastDay=new Date().toDateString();
  function tick(){
    const now=new Date();
    const midnight=new Date();midnight.setHours(24,0,0,0);
    const diff=midnight-now;
    const h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
    const el=document.getElementById('missionResetTimer');
    if(el)el.textContent=`Resets in: ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    // Reset today counters at midnight
    const today=now.toDateString();
    if(today!==lastDay){
      lastDay=today;
      localStorage.removeItem('sd_today_pomos');
      localStorage.removeItem('sd_today_goals');
      localStorage.removeItem('sd_today_reacts');
      localStorage.removeItem('sd_today_planner');
      renderMissions();
    }
  }
  tick();setInterval(tick,1000);
}

