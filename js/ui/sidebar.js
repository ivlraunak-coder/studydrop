// ============================================================
// StudyDrop Sidebar Module
// ============================================================
const sdSidebar = document.getElementById('sdSidebar');
let sidebarCollapsed = localStorage.getItem('sd_sidebar_collapsed') === '1';

function applySidebarState() {
  if (!sdSidebar) return;
  sdSidebar.classList.toggle('collapsed', sidebarCollapsed);
  const btn = sdSidebar.querySelector('.sb-collapse-btn');
  if (btn) btn.textContent = sidebarCollapsed ? '▶' : '◀';
}
applySidebarState();

function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  localStorage.setItem('sd_sidebar_collapsed', sidebarCollapsed ? '1' : '0');
  applySidebarState();
}
function openMobileSidebar() {
  sdSidebar?.classList.add('mobile-open');
  document.getElementById('sidebarOverlay')?.classList.add('active');
}
function closeMobileSidebar() {
  sdSidebar?.classList.remove('mobile-open');
  document.getElementById('sidebarOverlay')?.classList.remove('active');
}

const _origSwitchTab = window.switchTab;
window.switchTab = function(id, btn) {
  if (_origSwitchTab) _origSwitchTab(id, btn);
  document.querySelectorAll('.sb-item').forEach(el => el.classList.remove('active'));
  const sbBtn = document.querySelector(`.sb-item[data-sb="${id}"]`);
  if (sbBtn) sbBtn.classList.add('active');
  if (window.innerWidth <= 1000) closeMobileSidebar();
};

Object.assign(window, {
  applySidebarState, toggleSidebar, openMobileSidebar, closeMobileSidebar
});

setTimeout(() => {
  if (typeof window.updateSidebar === 'function') window.updateSidebar();
}, 500);
