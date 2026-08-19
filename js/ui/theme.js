// ── DARK MODE ──
function toggleDark(){
  darkMode=!darkMode;
  applyDark();
  saveLocal();
}
function applyDark(){
  document.documentElement.setAttribute('data-theme',darkMode?'dark':'light');
  // Sync ALL dark-toggle knobs across every screen (onboard, lobby, sidebar)
  document.querySelectorAll('.dark-toggle-knob').forEach(k=>{
    k.style.transform = darkMode ? 'translateX(18px)' : '';
    k.style.background = darkMode ? 'var(--gold)' : '';
  });
  document.querySelectorAll('.dark-toggle').forEach(t=>{
    t.style.background = darkMode ? 'rgba(240,180,41,.2)' : '';
    t.style.borderColor = darkMode ? 'rgba(240,180,41,.3)' : '';
  });
}

