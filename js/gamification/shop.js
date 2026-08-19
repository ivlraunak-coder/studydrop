// ── SHOP SYSTEM ──
function filterShop(type,btn){
  currentShopFilter=type;
  document.querySelectorAll('.shop-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  renderShop();
}
function renderShop(){
  const grid=document.getElementById('shopGrid');
  const items=currentShopFilter==='all'?SHOP_ITEMS:SHOP_ITEMS.filter(i=>i.type===currentShopFilter);
  grid.innerHTML=items.map(item=>{
    const owned=ownedItems.includes(item.id);
    const canAfford=mushroomCoins>=item.price;
    const typeLabel={theme:'🎨 Theme',badge:'🏅 Badge',title:'👑 Title'}[item.type];
    const typeCls={theme:'type-theme',badge:'type-badge',title:'type-title'}[item.type];
    let btnHtml='';
    if(owned){
      // For badge/title: show equip/unequip
      if(item.type==='badge'){
        const equipped=equippedBadges.includes(item.id);
        btnHtml=`<button class="shop-buy-btn owned-badge" onclick="toggleEquipBadge('${item.id}')">${equipped?'✓ Equipped · Click to Unequip':'Equip Badge'}</button>`;
      } else if(item.type==='title'){
        const equipped=equippedTitle===item.id;
        btnHtml=`<button class="shop-buy-btn owned-badge" onclick="equipTitle('${item.id}')">${equipped?'✓ Title Active':'Set as Title'}</button>`;
      } else if(item.type==='theme'){
        const equipped=equippedTheme===item.id;
        btnHtml=`<button class="shop-buy-btn owned-badge" onclick="equipTheme('${item.id}')">${equipped?'✓ Active Theme':'Apply Theme'}</button>`;
      }
    } else {
      btnHtml=`<button class="shop-buy-btn ${canAfford?'can-buy':'no-funds'}" onclick="${canAfford?`buyItem('${item.id}')`:''}">${canAfford?`Buy · 🍄 ${item.price}`:`Need 🍄 ${item.price-mushroomCoins} more`}</button>`;
    }
    return`<div class="shop-item ${owned?'owned':''}">
      <span class="shop-item-type ${typeCls}">${typeLabel}</span>
      <div class="shop-item-preview">${item.preview}</div>
      <div class="shop-item-name">${item.name}</div>
      <div class="shop-item-desc">${item.desc}</div>
      <div class="shop-item-price"><span class="coin-sm">🍄</span>${item.price} coins</div>
      ${btnHtml}
    </div>`;
  }).join('');
}
function buyItem(id){
  const item=SHOP_ITEMS.find(i=>i.id===id);
  if(!item||ownedItems.includes(id))return;
  if(mushroomCoins<item.price){showToast('Not enough Mushroom Coins! 🍄');return;}
  mushroomCoins-=item.price;
  ownedItems.push(id);
  saveLocal();
  updateCoinDisplay();
  renderShop();
  showToast(`✅ Purchased: ${item.name}!`);
  // Auto-equip on first purchase
  if(item.type==='badge')toggleEquipBadge(id,true);
  if(item.type==='title')equipTitle(id);
  if(item.type==='theme')equipTheme(id);
}
function toggleEquipBadge(id,forceEquip=false){
  if(!ownedItems.includes(id))return;
  if(forceEquip||!equippedBadges.includes(id)){
    if(equippedBadges.length>=4&&!equippedBadges.includes(id)){showToast('Max 4 badges equipped! Unequip one first.');return;}
    if(!equippedBadges.includes(id))equippedBadges.push(id);
  } else {
    equippedBadges=equippedBadges.filter(b=>b!==id);
  }
  saveLocal();renderShop();updateEquippedDisplay();syncUser();
  showToast(equippedBadges.includes(id)?'Badge equipped! ✨':'Badge unequipped.');
}
function equipTitle(id){
  if(!ownedItems.includes(id))return;
  equippedTitle=equippedTitle===id?'':id;
  saveLocal();renderShop();updateEquippedDisplay();syncUser();
  const item=SHOP_ITEMS.find(i=>i.id===id);
  showToast(equippedTitle===id?`Title "${item?.titleText}" equipped! 👑`:'Title removed.');
}
function equipTheme(id){
  if(!ownedItems.includes(id))return;
  const wasEquipped=equippedTheme===id;
  equippedTheme=wasEquipped?'':id;
  applyShopTheme();
  saveLocal();renderShop();updateEquippedDisplay();
  showToast(wasEquipped?'Theme removed.':'Theme applied! 🎨');
}
function applyShopTheme(){
  // Themes just modify CSS variables via data-shoptheme attribute
  document.documentElement.setAttribute('data-shoptheme',equippedTheme||'');
  // Apply theme overrides
  const el=document.documentElement;
  if(equippedTheme==='theme_night'){
    if(!darkMode){darkMode=true;applyDark();}
  } else if(equippedTheme==='theme_forest'){
    el.style.setProperty('--pink','#6da861');el.style.setProperty('--pink2','#8bc47f');el.style.setProperty('--pink3','rgba(109,168,97,.12)');el.style.setProperty('--rose','#4a8f50');el.style.setProperty('--grad','linear-gradient(135deg,#6da861,#a8c5a0)');
  } else if(equippedTheme==='theme_ocean'){
    el.style.setProperty('--pink','#2980b9');el.style.setProperty('--pink2','#5dade2');el.style.setProperty('--pink3','rgba(41,128,185,.12)');el.style.setProperty('--rose','#1a6a99');el.style.setProperty('--grad','linear-gradient(135deg,#2980b9,#5dade2)');
  } else if(equippedTheme==='theme_sakura'){
    el.style.setProperty('--pink','#ff6b9d');el.style.setProperty('--pink2','#ff8eb5');el.style.setProperty('--pink3','rgba(255,107,157,.12)');el.style.setProperty('--rose','#e0527a');el.style.setProperty('--grad','linear-gradient(135deg,#ff6b9d,#ffb3d1)');
  } else if(equippedTheme==='theme_gold'){
    el.style.setProperty('--pink','#d4a017');el.style.setProperty('--pink2','#e8b830');el.style.setProperty('--pink3','rgba(212,160,23,.12)');el.style.setProperty('--rose','#b8860b');el.style.setProperty('--grad','linear-gradient(135deg,#d4a017,#f0c040)');
  } else {
    // Reset to default
    el.style.removeProperty('--pink');el.style.removeProperty('--pink2');el.style.removeProperty('--pink3');el.style.removeProperty('--rose');el.style.removeProperty('--grad');
  }
}
function updateEquippedDisplay(){
  const el=document.getElementById('equippedDisplay');
  const parts=[];
  if(equippedTitle){const t=SHOP_ITEMS.find(i=>i.id===equippedTitle);if(t)parts.push(`Title: <strong>"${t.titleText}"</strong>`);}
  if(equippedBadges.length){const badges=equippedBadges.map(id=>{const i=SHOP_ITEMS.find(x=>x.id===id);return i?i.preview:''}).join(' ');parts.push(`Badges: ${badges}`);}
  if(equippedTheme){const t=SHOP_ITEMS.find(i=>i.id===equippedTheme);if(t)parts.push(`Theme: ${t.icon} ${t.name}`);}
  el.innerHTML=parts.length?parts.join('<br>'):' No cosmetics equipped yet. Visit the Shop! 🍄';
}

// EXPOSE GLOBALS
// Cross-module public API
