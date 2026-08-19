// ── SPOTIFY ──
function loadPlaylist(id,name){document.getElementById('spotifyEmbed').src=`https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;showToast(`🎵 Loading ${name}…`);}
function loadCustomSpotify(){
  const raw=document.getElementById('spCustomInput').value.trim();if(!raw){showToast('Paste a Spotify URL first!');return;}
  const m=raw.match(/spotify\.com\/(playlist|album|track|episode|show)\/([a-zA-Z0-9]+)/);
  if(!m){showToast('Invalid Spotify URL');return;}
  const[,type,id]=m;
  document.getElementById('spotifyEmbed').src=`https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  showToast('🎵 Loaded!');document.getElementById('spCustomInput').value='';
}

