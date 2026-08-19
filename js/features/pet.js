// ── PET SYSTEM ──
const PET_SPECIES = [
  { id:'cat',   name:'Kitty',   stages:['🥚','🐱','😸','😻','🦁'] },
  { id:'dog',   name:'Doggo',   stages:['🥚','🐶','🐕','🦮','🐺'] },
  { id:'dragon',name:'Dragon',  stages:['🥚','🦎','🐊','🐲','🐉'] },
  { id:'bunny', name:'Bunny',   stages:['🥚','🐰','🐇','🐇','🦊'] },
  { id:'panda', name:'Panda',   stages:['🥚','🐼','🐼','🦝','🐻'] },
];
const PET_STAGES = [
  { label:'Egg',     hrs:0,   mood:'💤', msg:'Start studying to hatch me! 🌱' },
  { label:'Baby',    hrs:1,   mood:'😊', msg:'I hatched! Keep going! 🎉' },
  { label:'Kid',     hrs:5,   mood:'😄', msg:"Growing strong! You're doing great 💪" },
  { label:'Teen',    hrs:15,  mood:'🔥', msg:"Wow, look at me glow! 🌟" },
  { label:'Evolved', hrs:30,  mood:'👑', msg:"Full power! You're a study legend! 👑" },
];
const AVATAR_EMOJIS = ['🌸','⚡','🌙','🔥','🦋','🎯','🌿','💎','🦊','🐉','🌊','⭐'];
const AVATAR_BGS = [
  'linear-gradient(135deg,#e8708a,#f2a98a)',
  'linear-gradient(135deg,#c5b4e3,#e8708a)',
  'linear-gradient(135deg,#a8c5a0,#7bb8d4)',
  'linear-gradient(135deg,#f4c88a,#f2a98a)',
  'linear-gradient(135deg,#7bb8d4,#c5b4e3)',
  'linear-gradient(135deg,#2d3748,#4a3535)',
  'linear-gradient(135deg,#f0b429,#f2a98a)',
  'linear-gradient(135deg,#e8d5f5,#c5b4e3)',
];

let petName = 'Studdy';
let petSpecies = 'cat';
let avatarEmoji = '🌸';
let avatarBg = AVATAR_BGS[0];
let avatarEmojiIdx = 0;

function loadPetState(){
  petName    = localStorage.getItem('sd_pet_name')    || 'Studdy';
  petSpecies = localStorage.getItem('sd_pet_species') || 'cat';
  avatarEmoji= localStorage.getItem('sd_avatar_emoji')|| '🌸';
  avatarBg   = localStorage.getItem('sd_avatar_bg')   || AVATAR_BGS[0];
  avatarEmojiIdx = AVATAR_EMOJIS.indexOf(avatarEmoji);
  if(avatarEmojiIdx<0)avatarEmojiIdx=0;
}
function savePetState(){
  localStorage.setItem('sd_pet_name', petName);
  localStorage.setItem('sd_pet_species', petSpecies);
  localStorage.setItem('sd_avatar_emoji', avatarEmoji);
  localStorage.setItem('sd_avatar_bg', avatarBg);
}

function getPetStageIndex(){
  const totalMins = subjects.reduce((a,s)=>a+s.totalMins,0) + pomoFocusMin;
  const hrs = totalMins / 60;
  let stage = 0;
  for(let i=PET_STAGES.length-1;i>=0;i--){
    if(hrs >= PET_STAGES[i].hrs){ stage=i; break; }
  }
  return stage;
}

function renderPet(){
  loadPetState();
  const totalMins = subjects.reduce((a,s)=>a+s.totalMins,0) + pomoFocusMin;
  const hrs = totalMins / 60;
  const stageIdx = getPetStageIndex();
  const stage = PET_STAGES[stageIdx];
  const sp = PET_SPECIES.find(s=>s.id===petSpecies) || PET_SPECIES[0];

  // Pet emoji
  document.getElementById('petEmoji').textContent = sp.stages[stageIdx];
  document.getElementById('petMood').textContent  = stage.mood;
  document.getElementById('petName').textContent  = petName;
  document.getElementById('petStage').textContent = stage.label + ' · ' + sp.name;
  document.getElementById('petMsg').textContent   = stage.msg;
  document.getElementById('petNameInput').value   = petName;

  // Happiness: goes up with recent activity (based on streak), max 100
  const happy = Math.min(100, pomoStreak * 14 + (pomoSessions > 0 ? 20 : 0));
  // Growth: based on total hours vs max stage threshold
  const maxHrs = PET_STAGES[PET_STAGES.length-1].hrs;
  const growth = Math.min(100, Math.round((hrs / maxHrs) * 100));
  document.getElementById('petHappyBar').style.width  = happy + '%';
  document.getElementById('petHappyVal').textContent  = happy + '%';
  document.getElementById('petGrowthBar').style.width = growth + '%';
  document.getElementById('petGrowthVal').textContent = growth + '%';

  // Evolution row
  const evoRow = document.getElementById('petEvolutionRow');
  evoRow.innerHTML = '';
  PET_STAGES.forEach((s,i)=>{
    const reached = stageIdx >= i;
    const div = document.createElement('div');
    div.className = 'pet-stage-step' + (reached?' reached':'');
    div.innerHTML = '<div class="pss-emoji">'+sp.stages[i]+'</div>'
      +'<div class="pss-label">'+s.label+'</div>'
      +'<div style="font-size:.52rem;color:var(--muted2)">'+s.hrs+'h</div>';
    evoRow.appendChild(div);
    if(i < PET_STAGES.length-1){
      const conn = document.createElement('div');
      conn.className = 'pet-connector' + (stageIdx>i?' reached':'');
      evoRow.appendChild(conn);
    }
  });

  // Species picker
  const spRow = document.getElementById('petSpeciesRow');
  spRow.innerHTML = '';
  PET_SPECIES.forEach(s=>{
    const btn = document.createElement('button');
    btn.className = 'species-btn' + (s.id===petSpecies?' sel':'');
    btn.innerHTML = s.stages[1]+' '+s.name;
    btn.onclick = ()=>{ petSpecies=s.id; savePetState(); renderPet(); showToast('Pet changed to '+s.name+'! 🐾'); };
    spRow.appendChild(btn);
  });

  // Avatar display
  renderAvatarDisplay();

  // Avatar emoji picker
  const apRow = document.getElementById('avatarPickerRow');
  apRow.innerHTML = '';
  AVATAR_EMOJIS.forEach((e,i)=>{
    const d = document.createElement('div');
    d.className = 'avatar-opt' + (e===avatarEmoji?' sel':'');
    d.textContent = e;
    d.onclick = ()=>{ avatarEmoji=e; avatarEmojiIdx=i; savePetState(); renderPet(); };
    apRow.appendChild(d);
  });
  document.getElementById('avatarName').textContent = 'Your avatar: ' + avatarEmoji;

  // Avatar background picker
  const bgRow = document.getElementById('avatarBgRow');
  bgRow.innerHTML = '';
  AVATAR_BGS.forEach(bg=>{
    const d = document.createElement('div');
    d.className = 'avatar-bg-opt' + (bg===avatarBg?' sel':'');
    d.style.cssText = 'width:34px;height:34px;border-radius:50%;cursor:pointer;border:3px solid '+(bg===avatarBg?'var(--text)':'transparent')+';background:'+bg+';transition:all .2s;flex-shrink:0;';
    d.onclick = ()=>{ avatarBg=bg; savePetState(); renderPet(); updateAvatarInHeader(); };
    bgRow.appendChild(d);
  });
}

function renderAvatarDisplay(){
  const disp = document.getElementById('avatarDisplay');
  if(disp){ disp.style.background=avatarBg; disp.textContent=avatarEmoji; }
  updateAvatarInHeader();
}

function updateAvatarInHeader(){
  // Replace the chip avatar with the custom emoji avatar if no photo uploaded
  if(!userPfp){
    const chipAv = document.getElementById('chipAv');
    if(chipAv){
      chipAv.style.background = avatarBg;
      chipAv.style.color = 'white';
      chipAv.innerHTML = '<span style="font-size:.9rem">'+avatarEmoji+'</span>';
    }
  }
}

function cycleAvatar(){
  avatarEmojiIdx = (avatarEmojiIdx+1) % AVATAR_EMOJIS.length;
  avatarEmoji = AVATAR_EMOJIS[avatarEmojiIdx];
  savePetState();
  const disp = document.getElementById('avatarDisplay');
  if(disp){ disp.style.animation='none'; void disp.offsetWidth; disp.style.animation='petPop .4s ease'; }
  renderPet();
}

function savePetName(){
  const v = document.getElementById('petNameInput').value.trim();
  if(!v){ showToast('Enter a name!'); return; }
  petName = v;
  savePetState();
  renderPet();
  showToast('Pet renamed to '+petName+'! 🐾');
}

window.cycleAvatar  = cycleAvatar;
window.savePetName  = savePetName;

