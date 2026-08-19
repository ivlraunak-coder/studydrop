// ── STATE ──
let userName='',userPfp='',userId='',currentRoomId='',currentRoomName='';
let subjects=[],pendingGoalFile=null,selectedColor='#e8708a',tempPfpData='',tempPfpData2='';
let allGoals={},allMessages={},allUsers={},allStudying={};
const POMO_CIRC=603;
let pomoMode='focus',pomoRunning=false,pomoInterval=null,pomoSecondsLeft=25*60;
let pomoSessions=0,pomoFocusMin=0,pomoSettings={focus:25,short:5,long:15};
let pomoStreak=0,lastStudyDay='';
let unlockedBadges=[];

// ── MUSHROOM COIN STATE ──
let mushroomCoins=0;
let ownedItems=[];
let equippedTitle='';
let equippedBadges=[];
let equippedTheme='';
let currentShopFilter='all';

// ── XP & LEVEL STATE ──
let xp=0;
let level=1;
const XP_LEVELS=[
  {level:1,title:'Seedling',icon:'🌱',xpNeeded:0},
  {level:2,title:'Sprout',icon:'🌿',xpNeeded:100},
  {level:3,title:'Apprentice Scholar',icon:'📖',xpNeeded:250},
  {level:4,title:'Focused Student',icon:'🎯',xpNeeded:500},
  {level:5,title:'Study Knight',icon:'⚔️',xpNeeded:900},
  {level:6,title:'Knowledge Seeker',icon:'🔍',xpNeeded:1400},
  {level:7,title:'Brain Wizard',icon:'🧙',xpNeeded:2100},
  {level:8,title:'Scholar Elite',icon:'🏅',xpNeeded:3000},
  {level:9,title:'Grand Master',icon:'👑',xpNeeded:4200},
  {level:10,title:'Study Legend',icon:'🌟',xpNeeded:6000},
];
function getLevelInfo(totalXp){
  let cur=XP_LEVELS[0];
  for(let i=XP_LEVELS.length-1;i>=0;i--){if(totalXp>=XP_LEVELS[i].xpNeeded){cur=XP_LEVELS[i];break;}}
  return cur;
}
function getNextLevelInfo(totalXp){
  const cur=getLevelInfo(totalXp);
  const idx=XP_LEVELS.findIndex(l=>l.level===cur.level);
  return idx<XP_LEVELS.length-1?XP_LEVELS[idx+1]:null;
}

// ── SAVED ROOMS (multi-room) ──
let savedRooms=[];

// ── STUDY STATUS (broadcast to room) ──
let studyStatusInterval=null; // interval to update studying status in Firebase

// ── DARK MODE ──
let darkMode=false;

// ── MISSIONS STATE ──
let completedMissions={};     // {date: [missionIds]}
let missionStreak=0;
let lastMissionDay='';
let missionsCompleted=0;      // total all-time missions completed
let plannerTasks=0;           // total planner tasks added
let nightOwl=false;
let earlyBird=false;

// ── PLANNER STATE ──
let plannerData={};           // {YYYY-MM-DD: [{id,text,done,color}]}
let plannerMode='month';
let plannerDate=new Date();
let plannerSelectedDate=null;

// ── REPORT STATE ──
let reportWeekOffset=0;       // 0=current week, -1=last week etc.
let weeklyStudyLog={};        // {YYYY-MM-DD: mins}

// ── BADGE DEFINITIONS (40+) ──
const BADGES=[
  // Study Hours
  {id:'first_goal',icon:'🌱',name:'First Drop',desc:'Post your very first goal',color:'#a8c5a0',req:'Post 1 goal',check:u=>u.goalCount>=1},
  {id:'hours_1',icon:'🕐',name:'Getting Started',desc:'Study for 1+ hour total',color:'#f4c88a',req:'Study 1 hour',check:u=>u.totalMins>=60},
  {id:'hours_5',icon:'⏰',name:'5-Hour Club',desc:'Study for 5+ total hours',color:'#f2a98a',req:'Study 5 hours',check:u=>u.totalMins>=300},
  {id:'hours_10',icon:'🔥',name:'Grind Mode',desc:'Study for 10+ total hours',color:'#e8708a',req:'Study 10 hours',check:u=>u.totalMins>=600},
  {id:'hours_25',icon:'💪',name:'Study Beast',desc:'Study for 25+ total hours',color:'#c95070',req:'Study 25 hours',check:u=>u.totalMins>=1500},
  {id:'hours_50',icon:'👑',name:'Scholar',desc:'Study for 50+ total hours',color:'#f0b429',req:'Study 50 hours',check:u=>u.totalMins>=3000},
  {id:'hours_100',icon:'🏛️',name:'Century Studier',desc:'Study for 100+ total hours — absolute legend',color:'#9b59b6',req:'Study 100 hours',check:u=>u.totalMins>=6000},
  {id:'hours_200',icon:'🌌',name:'Eternal Flame',desc:'200+ hours. You are a force of nature.',color:'#e74c3c',req:'Study 200 hours',check:u=>u.totalMins>=12000},
  {id:'hours_500',icon:'🪐',name:'Transcendent',desc:'500 hours. Beyond human limits.',color:'#2c3e50',req:'Study 500 hours',check:u=>u.totalMins>=30000},
  // Streaks
  {id:'streak_2',icon:'💫',name:'Back-to-Back',desc:'Study 2 days in a row',color:'#f4c88a',req:'2-day streak',check:u=>u.pomoStreak>=2},
  {id:'streak_3',icon:'🌟',name:'3-Day Streak',desc:'Study 3 days in a row',color:'#c5b4e3',req:'3-day streak',check:u=>u.pomoStreak>=3},
  {id:'streak_7',icon:'✨',name:'Week Warrior',desc:'Study 7 days in a row',color:'#9b59b6',req:'7-day streak',check:u=>u.pomoStreak>=7},
  {id:'streak_14',icon:'🌙',name:'Fortnight Force',desc:'Study 14 days in a row',color:'#2d3748',req:'14-day streak',check:u=>u.pomoStreak>=14},
  {id:'streak_30',icon:'🌕',name:'Month Master',desc:'Study every day for a month',color:'#f0b429',req:'30-day streak',check:u=>u.pomoStreak>=30},
  {id:'streak_60',icon:'☀️',name:'Relentless',desc:'60 days without stopping. Incredible.',color:'#e67e22',req:'60-day streak',check:u=>u.pomoStreak>=60},
  {id:'streak_100',icon:'🏆',name:'Century Streak',desc:'100 consecutive study days. Mythical.',color:'#e74c3c',req:'100-day streak',check:u=>u.pomoStreak>=100},
  // Pomodoros
  {id:'pomo_1',icon:'🍅',name:'First Pomo',desc:'Complete your first Pomodoro session',color:'#e74c3c',req:'1 Pomodoro',check:u=>u.pomoSessions>=1},
  {id:'pomo_5',icon:'🍅',name:'5 Pomos',desc:'Complete 5 focus sessions',color:'#e8708a',req:'5 Pomodoros',check:u=>u.pomoSessions>=5},
  {id:'pomo_10',icon:'🍅',name:'Pomodoro Pro',desc:'Complete 10 focus sessions',color:'#e74c3c',req:'10 Pomodoros',check:u=>u.pomoSessions>=10},
  {id:'pomo_25',icon:'🎯',name:'Focus Veteran',desc:'Complete 25 focus sessions',color:'#c0392b',req:'25 Pomodoros',check:u=>u.pomoSessions>=25},
  {id:'pomo_50',icon:'🎯',name:'Focus Master',desc:'Complete 50 focus sessions',color:'#96281b',req:'50 Pomodoros',check:u=>u.pomoSessions>=50},
  {id:'pomo_100',icon:'⚡',name:'Pomo Century',desc:'100 Pomodoro sessions. Unstoppable.',color:'#7b241c',req:'100 Pomodoros',check:u=>u.pomoSessions>=100},
  // Subjects
  {id:'subjects_1',icon:'📖',name:'First Subject',desc:'Start tracking your first subject',color:'#3498db',req:'1 subject',check:u=>(u.subjects?.length||0)>=1},
  {id:'subjects_3',icon:'📚',name:'Multi-Tasker',desc:'Track 3+ subjects',color:'#3498db',req:'3 subjects tracked',check:u=>(u.subjects?.length||0)>=3},
  {id:'subjects_5',icon:'🗂️',name:'Subject Collector',desc:'Track 5+ subjects',color:'#2980b9',req:'5 subjects',check:u=>(u.subjects?.length||0)>=5},
  {id:'subjects_8',icon:'🧠',name:'Renaissance Studier',desc:'Track 8+ subjects — true polymath',color:'#1a5276',req:'8 subjects',check:u=>(u.subjects?.length||0)>=8},
  // Social
  {id:'social',icon:'💬',name:'Team Player',desc:'React to 5 goals from others',color:'#27ae60',req:'React to 5 goals',check:u=>u.reactCount>=5},
  {id:'social_20',icon:'🤝',name:'Supporter',desc:'React to 20 goals',color:'#1e8449',req:'React to 20 goals',check:u=>u.reactCount>=20},
  {id:'social_50',icon:'💖',name:'Community Pillar',desc:'React to 50 goals — you\'re a legend',color:'#145a32',req:'React to 50 goals',check:u=>u.reactCount>=50},
  {id:'goals_5',icon:'🎯',name:'Goal Setter',desc:'Post 5 goals',color:'#e8708a',req:'Post 5 goals',check:u=>u.goalCount>=5},
  {id:'goals_15',icon:'📋',name:'Consistent Poster',desc:'Post 15 goals',color:'#c95070',req:'Post 15 goals',check:u=>u.goalCount>=15},
  {id:'goals_30',icon:'📝',name:'Goal Maniac',desc:'Post 30 goals — you never stop hustling',color:'#a93226',req:'Post 30 goals',check:u=>u.goalCount>=30},
  // Coins
  {id:'coins_100',icon:'🍄',name:'Mushroom Collector',desc:'Earn 100 Mushroom Coins',color:'#8B6914',req:'Earn 100 coins',check:u=>u.mushroomCoins>=100},
  {id:'coins_500',icon:'💰',name:'Coin Hoarder',desc:'Earn 500 Mushroom Coins',color:'#a07020',req:'Earn 500 coins',check:u=>u.mushroomCoins>=500},
  {id:'coins_1000',icon:'💎',name:'Wealthy Scholar',desc:'Earn 1000 Mushroom Coins',color:'#7d6608',req:'Earn 1000 coins',check:u=>u.mushroomCoins>=1000},
  {id:'coins_5000',icon:'🪙',name:'Coin Tycoon',desc:'Earn 5000 Mushroom Coins. Absurd.',color:'#6e2f01',req:'Earn 5000 coins',check:u=>u.mushroomCoins>=5000},
  // Missions
  {id:'mission_first',icon:'⚡',name:'Mission Accepted',desc:'Complete your first daily mission',color:'#f39c12',req:'Complete 1 mission',check:u=>u.missionsCompleted>=1},
  {id:'mission_10',icon:'🏅',name:'Mission Veteran',desc:'Complete 10 missions total',color:'#e67e22',req:'Complete 10 missions',check:u=>u.missionsCompleted>=10},
  {id:'mission_50',icon:'🎖️',name:'Mission Commander',desc:'Complete 50 missions',color:'#d35400',req:'Complete 50 missions',check:u=>u.missionsCompleted>=50},
  // Planner
  {id:'planner_first',icon:'📅',name:'Planner',desc:'Add your first task to the study planner',color:'#16a085',req:'Plan 1 task',check:u=>u.plannerTasks>=1},
  {id:'planner_30',icon:'🗓️',name:'Organized Scholar',desc:'Add 30 tasks to the planner',color:'#0e6655',req:'Plan 30 tasks',check:u=>u.plannerTasks>=30},
  // Special
  {id:'night_owl',icon:'🦉',name:'Night Owl',desc:'Log a study session after midnight',color:'#2d3748',req:'Study after midnight',check:u=>u.nightOwl},
  {id:'early_bird',icon:'🐦',name:'Early Bird',desc:'Log a study session before 7am',color:'#f0b429',req:'Study before 7am',check:u=>u.earlyBird},
];

// ── SHOP ITEMS ──
const SHOP_ITEMS=[
  // THEMES
  {id:'theme_night',type:'theme',name:'Midnight Study',icon:'🌙',preview:'🌙',desc:'Deep dark theme with purple accents. Easy on the eyes for late-night grinding.',price:6000,cssClass:'theme-night'},
  {id:'theme_forest',type:'theme',name:'Forest Focus',icon:'🌿',preview:'🌿',desc:'Earthy greens and warm tones. Nature vibes for calm studying.',price:5250,cssClass:'theme-forest'},
  {id:'theme_ocean',type:'theme',name:'Ocean Deep',icon:'🌊',preview:'🌊',desc:'Cool blues and teals. Feel like studying underwater (but productively).',price:5700,cssClass:'theme-ocean'},
  {id:'theme_sakura',type:'theme',name:'Sakura Bloom',icon:'🌸',preview:'🌸',desc:'Extra pink and soft. The ultimate kawaii study aesthetic.',price:4500,cssClass:'theme-sakura'},
  {id:'theme_gold',type:'theme',name:'Golden Hour',icon:'☀️',preview:'☀️',desc:'Warm amber and gold tones. Feels like studying at sunset.',price:7500,cssClass:'theme-gold'},
  {id:'theme_galaxy',type:'theme',name:'Galaxy Mode',icon:'🌌',preview:'🌌',desc:'Deep space vibes with neon accents. Study among the stars.',price:9000,cssClass:'theme-galaxy'},
  {id:'theme_cherry',type:'theme',name:'Cherry Matcha',icon:'🍵',preview:'🍵',desc:'Soft green and cherry red. Japanese café aesthetic for focused work.',price:6300,cssClass:'theme-cherry'},
  // PROFILE BADGES
  {id:'badge_mushroom',type:'badge',name:'Mushroom Collector',icon:'🍄',preview:'🍄',desc:'Show off your love for Mushroom Coins. A true currency enthusiast.',price:2250},
  {id:'badge_diamond',type:'badge',name:'Diamond Scholar',icon:'💎',preview:'💎',desc:'Rare and shiny — awarded to those who grind for the bling.',price:9000},
  {id:'badge_fire',type:'badge',name:'On Fire',icon:'🔥',preview:'🔥',desc:'You\'re absolutely blazing through your study sessions.',price:3000},
  {id:'badge_star',type:'badge',name:'Star Student',icon:'⭐',preview:'⭐',desc:'Shining bright in the leaderboard galaxy.',price:2700},
  {id:'badge_cat',type:'badge',name:'Study Cat',icon:'🐱',preview:'🐱',desc:'Calm, curious, and always watching the timer.',price:3300},
  {id:'badge_robot',type:'badge',name:'Study Bot',icon:'🤖',preview:'🤖',desc:'Highly optimized studying machine. Beep boop.',price:3750},
  {id:'badge_crown',type:'badge',name:'Royal Grinder',icon:'👑',preview:'👑',desc:'The crown is earned, not given. Wear it with pride.',price:11250},
  {id:'badge_unicorn',type:'badge',name:'Unicorn Mode',icon:'🦄',preview:'🦄',desc:'So rare, so magical. Your study habits are legendary.',price:13500},
  {id:'badge_dragon',type:'badge',name:'Dragon Slayer',icon:'🐉',preview:'🐉',desc:'You slay procrastination like a dragon. Fearless.',price:15000},
  {id:'badge_lightning',type:'badge',name:'Lightning Learner',icon:'⚡',preview:'⚡',desc:'Fast, electric, unstoppable. You learn at the speed of light.',price:4500},
  {id:'badge_moon',type:'badge',name:'Moon Child',icon:'🌙',preview:'🌙',desc:'Night owl by nature, scholar by choice.',price:4200},
  {id:'badge_planet',type:'badge',name:'Galaxy Brain',icon:'🪐',preview:'🪐',desc:'Your intelligence is cosmic. Out of this world studying.',price:6750},
  {id:'badge_ghost',type:'badge',name:'Ghost Grinder',icon:'👻',preview:'👻',desc:'You appear and disappear but always get the work done.',price:4800},
  {id:'badge_alien',type:'badge',name:'Alien Intellect',icon:'👽',preview:'👽',desc:'Human study methods can\'t contain your alien brain.',price:7500},
  // TITLES
  {id:'title_grinder',type:'title',name:'"The Grinder"',icon:'💪',preview:'"The Grinder"',desc:'For those who never stop. A title that speaks for itself.',price:4500,titleText:'The Grinder',titleColor:'#e8708a'},
  {id:'title_scholar',type:'title',name:'"Eternal Scholar"',icon:'📚',preview:'"Eternal Scholar"',desc:'Knowledge is your weapon. Wisdom is your goal.',price:6750,titleColor:'#9b59b6',titleText:'Eternal Scholar'},
  {id:'title_nocturnal',type:'title',name:'"Nocturnal Nerd"',icon:'🦉',preview:'"Nocturnal Nerd"',desc:'The library closes at midnight. You don\'t.',price:5700,titleColor:'#2d3748',titleText:'Nocturnal Nerd'},
  {id:'title_speedrun',type:'title',name:'"Speedrunner"',icon:'⚡',preview:'"Speedrunner"',desc:'Efficient, fast, and deadly accurate. Study speedrunning champion.',price:6000,titleColor:'#f0b429',titleText:'Speedrunner'},
  {id:'title_legend',type:'title',name:'"Legend"',icon:'🌟',preview:'"Legend"',desc:'You\'ve transcended ordinary studying. You are a legend.',price:22500,titleColor:'#f0b429',titleText:'Legend'},
  {id:'title_chaos',type:'title',name:'"Chaos Learner"',icon:'🌀',preview:'"Chaos Learner"',desc:'No schedule, just vibes — and somehow top of the leaderboard.',price:5250,titleColor:'#e74c3c',titleText:'Chaos Learner'},
  {id:'title_machine',type:'title',name:'"The Machine"',icon:'🤖',preview:'"The Machine"',desc:'Emotions? No. Study hours? Yes. Fully optimized.',price:7500,titleColor:'#2d3748',titleText:'The Machine'},
  {id:'title_phantom',type:'title',name:'"The Phantom"',icon:'👻',preview:'"The Phantom"',desc:'No one sees you coming, but they see you on the leaderboard.',price:9000,titleColor:'#6c3483',titleText:'The Phantom'},
  {id:'title_goat',type:'title',name:'"The G.O.A.T."',icon:'🐐',preview:'"The G.O.A.T."',desc:'Greatest Of All Time. For the ones at the very top.',price:30000,titleColor:'#c0392b',titleText:'The G.O.A.T.'},
];

