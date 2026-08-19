// ── ONBOARD ──
function onPfpChosen2(input){
  const file=input.files[0];if(!file)return;
  if(file.size>2*1024*1024){showToast('Max 2MB');return;}
  const r=new FileReader();r.onload=e=>{tempPfpData2=e.target.result;document.getElementById('pfpPreviewImg2').src=tempPfpData2;document.getElementById('pfpPreviewImg2').style.display='block';document.getElementById('pfpEmoji2').style.display='none';};r.readAsDataURL(file);
}
function goToRoom(){
  const name=document.getElementById('nameInput2').value.trim();
  if(!name){showToast('Enter your name first!');return;}
  userName=name;if(tempPfpData2)userPfp=tempPfpData2;
  localStorage.setItem('sd_name',userName);localStorage.setItem('sd_pfp',userPfp);
  // Immediately push to cloud so this device is remembered
  if(userId) set(ref(db,`profiles/${userId}`),getCloudPayload()).catch(()=>{});
  document.getElementById('onboardModal').classList.add('hidden');
  showRoomLobby();
}

