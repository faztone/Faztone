(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = message => {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  };

  const songs = [
    {title:'Midnight Drive',artist:'Original',key:'Cm',bpm:120,cover:'cover'},
    {title:'Ocean Waves',artist:'Original',key:'G',bpm:95,cover:'ocean'},
    {title:'Falling Slowly',artist:'Glen Hansard',key:'D',bpm:72,cover:'falling'},
    {title:'Good Riddance',artist:'Green Day',key:'G',bpm:92,cover:'green'},
    {title:'Someone Like You',artist:'Adele',key:'Ab',bpm:68,cover:'adele'},
    {title:'Goodness of God',artist:'Bethel Music',key:'G',bpm:78,cover:'cover'}
  ];
  const progressions = [
    {title:'Chill Pop Progression',chords:'C · Am · F · G',tag:'Pop',className:''},
    {title:'Emotional Ballad',chords:'Em · C · G · D',tag:'Ballad',className:''},
    {title:'Upbeat Indie',chords:'G · D · Em · C',tag:'Indie',className:'indie'},
    {title:'Jazz Turnaround',chords:'Dm · G7 · Cmaj7 · A7',tag:'Jazz',className:'jazz'},
    {title:'Lofi Vibes',chords:'Am · F · C · G',tag:'Lofi',className:'lofi'}
  ];

  const showView = view => {
    $$('.view').forEach(section => section.classList.toggle('active', section.id === `${view}View`));
    $$('.nav-btn').forEach(button => button.classList.toggle('active', button.dataset.view === view));
    window.scrollTo({top:0, behavior:'smooth'});
  };
  $$('[data-view]').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));

  const songMarkup = song => `<div class="song-row"><div class="cover ${song.cover}">${song.title === 'Midnight Drive' ? '♫' : '♪'}</div><div class="song-meta"><strong>${song.title}</strong><small>${song.artist}</small></div><span class="song-key">${song.key}</span><span class="song-bpm">${song.bpm} BPM</span><button class="heart" aria-label="Favorite ${song.title}">♥</button><button class="more" aria-label="More options">•••</button></div>`;
  $('#recentSongs').innerHTML = songs.slice(0,5).map(songMarkup).join('');
  const progressionMarkup = item => `<div class="progress-row"><button class="play-small" data-progression="${item.title}">▶</button><div class="progress-meta"><strong>${item.title}</strong><small>${item.chords}</small></div><span class="tag ${item.className}">${item.tag}</span><button class="more">•••</button></div>`;
  $('#savedProgressions').innerHTML = progressions.map(progressionMarkup).join('');

  const libraryMarkup = song => `<div class="mini-card"><div class="cover ${song.cover}">${song.title === 'Midnight Drive' ? '♫' : '♪'}</div><div style="min-width:0;flex:1"><h3>${song.title}</h3><p>${song.artist} · Key ${song.key} · ${song.bpm} BPM</p></div><button class="heart off" aria-label="Favorite">♡</button></div>`;
  const renderLibrary = () => {
    const query = ($('#librarySearch')?.value || '').toLowerCase();
    const genre = $('#genreFilter')?.value || 'all';
    const filtered = songs.filter(song => `${song.title} ${song.artist}`.toLowerCase().includes(query) && (genre === 'all' || (genre === 'Jazz' && song.title.includes('Slowly')) || genre !== 'Jazz'));
    $('#libraryGrid').innerHTML = filtered.length ? filtered.map(libraryMarkup).join('') : '<div class="not-found" style="grid-column:1/-1">No songs found. Try another search.</div>';
  };
  renderLibrary();
  $('#librarySearch').addEventListener('input', renderLibrary);
  $('#genreFilter').addEventListener('change', renderLibrary);

  const renderProgressionPage = () => {
    $('#progressionPageList').innerHTML = progressions.map(item => `<div class="feature-button progression-open" data-title="${item.title}"><button class="play-small" data-progression="${item.title}">▶</button><span><strong>${item.title}</strong><small>${item.chords}</small></span><span class="tag ${item.className}">${item.tag}</span></div>`).join('');
  };
  renderProgressionPage();
  document.addEventListener('click', event => {
    const progression = event.target.closest('[data-progression]')?.dataset.progression;
    if (progression) {
      const item = progressions.find(entry => entry.title === progression);
      if (item) { $('#progressionPattern').textContent = item.chords.replaceAll(' · ',' – '); toast(`Playing ${item.title}`); }
    }
    const favorite = event.target.closest('.heart');
    if (favorite) { favorite.classList.toggle('off'); favorite.textContent = favorite.classList.contains('off') ? '♡' : '♥'; toast(favorite.classList.contains('off') ? 'Removed from favorites' : 'Added to favorites'); }
  });

  const waveform = $('#waveform');
  for (let i=0;i<72;i++) { const bar=document.createElement('b'); bar.style.height=`${12 + ((i*17)%48)}%`; waveform.appendChild(bar); }
  let playing = false;
  let playerTimer;
  let playerSeconds = 48;
  $('#playBtn').addEventListener('click', () => {
    playing = !playing;
    $('#playBtn').textContent = playing ? 'Ⅱ' : '▶';
    waveform.classList.toggle('playing', playing);
    clearInterval(playerTimer);
    if (playing) {
      toast('Now playing · Midnight Drive');
      playerTimer = setInterval(() => { playerSeconds = playerSeconds >= 204 ? 0 : playerSeconds + 1; $('#playerTime').textContent = `${Math.floor(playerSeconds/60)}:${String(playerSeconds%60).padStart(2,'0')}`; }, 1000);
    }
  });
  $('#prevBtn').addEventListener('click', () => toast('Previous song'));
  $('#nextBtn').addEventListener('click', () => toast('Next song'));
  $('#watchTour').addEventListener('click', () => toast('Tour mode is ready for the next update'));
  $('#customizeBtn').addEventListener('click', () => toast('Quick Access layout saved'));
  $('#upgradeBtn').addEventListener('click', () => toast('Pro upgrade flow coming soon'));
  $('#notificationBtn').addEventListener('click', () => toast('No new notifications'));
  $('#themeBtn').addEventListener('click', () => toast('Dark neon theme is active'));
  $('#addSongBtn').addEventListener('click', () => toast('Song editor opened'));
  $('#newProgressionBtn').addEventListener('click', () => toast('New progression created'));
  $('#newPlaylistBtn').addEventListener('click', () => toast('New playlist created'));
  $('#startPractice').addEventListener('click', () => toast('Practice session started · 45 min'));
  $('#joinCircle').addEventListener('click', () => toast('Community circles opened'));

  const finder = query => {
    const q = (query || 'easy music').toLowerCase();
    const results = songs.filter(song => `${song.title} ${song.artist} ${song.key}`.toLowerCase().includes(q) || q.includes('easy') || q.includes('pop'));
    $('#finderResults').innerHTML = results.slice(0,4).map(song => `<button class="feature-button"><span class="cover ${song.cover}" style="width:32px;height:32px;flex-basis:32px">♫</span><span><strong>${song.title}</strong><small>${song.artist} · Key ${song.key} · ${song.bpm} BPM</small></span><span>›</span></button>`).join('') || '<div class="not-found">Belum menemukan lagu yang cocok.</div>';
  };
  $('#finderBtn').addEventListener('click', () => finder($('#finderInput').value));
  $$('.finder-chip').forEach(chip => chip.addEventListener('click', () => { $('#finderInput').value=chip.textContent; finder(chip.textContent); }));
  finder('easy');
  $$('.feature-button[data-chord]').forEach(button => button.addEventListener('click', () => { $('#finderInput').value=`songs using ${button.dataset.chord}`; finder(button.dataset.chord); toast(`Searching around ${button.dataset.chord}`); }));

  $('#globalSearch').addEventListener('keydown', event => {
    if (event.key === 'Enter') { showView('finder'); $('#finderInput').value=event.currentTarget.value; finder(event.currentTarget.value); }
  });
  window.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#globalSearch').focus(); } });

  const chatLog = $('#chatLog');
  $('#askAssistant').addEventListener('click', () => {
    const input = $('#assistantInput');
    const value = input.value.trim();
    if (!value) return;
    chatLog.insertAdjacentHTML('beforeend', `<div class="bubble user">${value}</div>`);
    const response = /simpl|sederhana|triad/i.test(value) ? 'Bisa. Aku akan ubah chord kompleks menjadi triad dasar dan mempertahankan root movement-nya.' : /transpose|nada|key/i.test(value) ? 'Siap. Sebutkan key awal dan key tujuan, nanti aku susun langkah transposisinya.' : 'Aku bisa bantu transpose, menyederhanakan chord, mencari voicing, atau membuat progresi latihan.';
    setTimeout(() => chatLog.insertAdjacentHTML('beforeend', `<div class="bubble">${response}</div>`), 220);
    input.value='';
  });

  const miniPiano = $('#miniPiano');
  const miniNotes = ['C','D','E','F','G','A','B','C'];
  miniPiano.innerHTML = miniNotes.map((note,index) => `<button class="white" data-note="${note}" data-index="${index}" aria-label="${note}"></button>`).join('') + '<button class="black" style="left:12.5%" data-note="C#"></button><button class="black" style="left:25%" data-note="D#"></button><button class="black" style="left:50%" data-note="F#"></button><button class="black" style="left:62.5%" data-note="G#"></button><button class="black" style="left:75%" data-note="A#"></button>';
  let audioContext;
  const playTone = (noteIndex, duration=.45) => {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    audioContext ||= new Ctor();
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain(); const now=audioContext.currentTime;
    oscillator.type='triangle'; oscillator.frequency.value=261.63*Math.pow(2,noteIndex/12); gain.gain.setValueAtTime(.0001,now); gain.gain.exponentialRampToValueAtTime(.12,now+.015); gain.gain.exponentialRampToValueAtTime(.0001,now+duration); oscillator.connect(gain).connect(audioContext.destination); oscillator.start(now); oscillator.stop(now+duration+.02);
  };
  $$('#miniPiano [data-note]').forEach(key => key.addEventListener('click', () => { const index=Number(key.dataset.index||0); key.classList.add('active'); setTimeout(()=>key.classList.remove('active'),180); playTone(index); toast(`Playing ${key.dataset.note}`); }));
  $('#widgetKey').addEventListener('change', event => { const key=event.target.value; const map={C:'C · E · G',G:'G · B · D',D:'D · F♯ · A',F:'F · A · C'}; $('#chordDots').textContent=map[key]; });

  let progressionShift=0;
  $('#transposeProgression').addEventListener('click', () => { progressionShift++; const names=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B']; $('#progressionKey').textContent=names[progressionShift%12]; toast(`Progression transposed +${progressionShift}`); });

  let tempo = 92; let metronomeTimer;
  const setTempo = value => { tempo=Number(value); $('#tempoValue').textContent=tempo; $('#tempoSlider').value=tempo; };
  $('#tempoSlider').addEventListener('input', event => setTempo(event.target.value));
  $$('.tempo-preset').forEach(button => button.addEventListener('click', () => { setTempo(button.dataset.tempo); toast(`Tempo set to ${button.dataset.tempo} BPM`); }));
  $('#tapTempo').addEventListener('click', () => {
    if (metronomeTimer) { clearInterval(metronomeTimer); metronomeTimer=null; $('#tapTempo').textContent='TAP'; $('#beatState').textContent='Ready to practice'; return; }
    $('#tapTempo').textContent='STOP'; $('#beatState').textContent='Metronome running';
    const tick = () => { $('#beatState').textContent='• Beat'; setTimeout(()=>$('#beatState').textContent='Metronome running',120); };
    tick(); metronomeTimer=setInterval(tick,60000/tempo); toast(`${tempo} BPM metronome started`);
  });

  $$('.tool-launch').forEach(button => button.addEventListener('click', () => { $('#toolPanelTitle').textContent=button.dataset.tool; $('#toolPanelText').textContent=`${button.dataset.tool} siap dipakai. Ini adalah ruang latihan interaktif Musica Space.`; toast(`${button.dataset.tool} opened`); }));

  const tonalInput = $('#tonalAudio');
  tonalInput.addEventListener('change', () => { const file=tonalInput.files[0]; if(file){ $('#tonalPlayer').src=URL.createObjectURL(file); $('#tonalStatus').textContent=file.name; } });
  $('#analyzeTonal').addEventListener('click', async () => {
    const file=tonalInput.files[0]; if(!file){$('#tonalStatus').textContent='Choose an audio file first';return;}
    $('#tonalStatus').textContent='Analyzing major tonal center…';
    try {
      const Ctor=window.AudioContext||window.webkitAudioContext; const ac=new Ctor(); const buffer=await ac.decodeAudioData(await file.arrayBuffer()); const x=buffer.getChannelData(0); const sr=buffer.sampleRate; const limit=Math.min(x.length,sr*90); const pc=new Array(12).fill(0); const frame=4096; const names=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B']; const profile=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
      for(let pos=0;pos+frame<limit;pos+=2048){for(let midi=36;midi<=84;midi++){const freq=440*Math.pow(2,(midi-69)/12);let re=0,im=0;for(let j=0;j<frame;j+=16){const sample=x[pos+j]||0;const a=2*Math.PI*freq*j/sr;re+=sample*Math.cos(a);im-=sample*Math.sin(a);}pc[midi%12]+=Math.hypot(re,im);}}
      let root=0,best=-Infinity; for(let r=0;r<12;r++){let score=0;for(let i=0;i<12;i++)score+=pc[(r+i)%12]*profile[i];if(score>best){best=score;root=r;}}
      const signatures={'C':'0','G':'1♯','D':'2♯','A':'3♯','E':'4♯','B':'5♯','F♯':'6♯','F':'1♭','B♭':'2♭','E♭':'3♭','A♭':'4♭','D♭':'5♭','G♭':'6♭'}; const major=names[root]; const relative=names[(root+9)%12];
      $('#keyResult').textContent=`${major} Major`; $('#signatureResult').textContent=signatures[major]||'—'; $('#relativeResult').textContent=`${relative} Minor`; $('#tonalStatus').textContent='Analysis complete · major mode';
    } catch(error) { $('#tonalStatus').textContent=`Analysis failed: ${error.message}`; }
  });
})();

// Supabase Auth: public publishable key only; no secret/service_role key is used.
(async () => {
  const SUPABASE_URL = 'https://pyokprmnijoowrpaopyo.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3oB-xmqTGDPDYYSLXpGPiw_NdH1R0xC';
  const authStyle = document.createElement('style');
  authStyle.textContent = `
    .profile,.top-user{cursor:pointer}.auth-modal{position:fixed;inset:0;z-index:50;display:none;place-items:center;padding:18px;background:#020817bb;backdrop-filter:blur(10px)}
    .auth-modal.open{display:grid}.auth-card{width:min(410px,100%);border:1px solid #2863aa;border-radius:16px;background:linear-gradient(145deg,#0c2349,#07152e);box-shadow:0 24px 70px #0009;padding:24px;position:relative}.auth-close{position:absolute;right:15px;top:12px;border:0;background:transparent;color:#aac2e6;font-size:22px}.auth-card h2{margin:0 0 6px}.auth-card>p{color:#90a9d1;margin:0 0 18px;font-size:13px}.auth-tabs{display:flex;gap:4px;padding:4px;border-radius:8px;background:#07152e;margin-bottom:14px}.auth-tab{flex:1;border:0;border-radius:6px;background:transparent;color:#91a9ce;padding:8px}.auth-tab.active{background:#1b4f98;color:#fff}.auth-form{display:grid;gap:10px}.auth-form label{color:#b9cceb;font-size:12px}.auth-form input{width:100%;margin-top:5px;border:1px solid #24548e;border-radius:8px;background:#06152e;color:#eff6ff;padding:11px;outline:0}.auth-form input:focus{border-color:#4ec7ff}.auth-submit{border:0;border-radius:8px;background:linear-gradient(100deg,#1fbeff,#7739ff);color:#fff;padding:11px;font-weight:800;margin-top:4px}.auth-google{border:1px solid #315d99;border-radius:8px;background:#0b2044;color:#eaf4ff;padding:10px}.auth-divider{display:flex;align-items:center;gap:8px;color:#6f89b3;font-size:11px;margin:13px 0}.auth-divider:before,.auth-divider:after{content:'';height:1px;background:#1a4274;flex:1}.auth-message{min-height:18px;color:#79e1c2;font-size:12px;margin:8px 0 0}.auth-message.error{color:#ff8da5}.auth-account{display:flex;align-items:center;gap:10px;padding:11px;border:1px solid #1a4c88;background:#081a37;border-radius:9px;margin-bottom:13px}.auth-account strong{display:block}.auth-account small{color:#8da7cf}.auth-signout{width:100%;border:1px solid #9b4164;border-radius:8px;background:#3c1733;color:#ffc3d2;padding:10px}
  `;
  document.head.appendChild(authStyle);
  document.body.insertAdjacentHTML('beforeend', `
    <div class="auth-modal" id="authModal" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <div class="auth-card">
        <button class="auth-close" id="authClose" aria-label="Close">×</button>
        <div class="eyebrow">Musica Space account</div><h2 id="authTitle">Sign in to Musica Space</h2><p id="authDescription">Simpan lagu, playlist, favorit, dan progres latihanmu.</p>
        <div id="authGuest"><div class="auth-tabs"><button class="auth-tab active" data-auth-mode="signin">Sign in</button><button class="auth-tab" data-auth-mode="signup">Create account</button></div>
          <form class="auth-form" id="authForm"><div id="nameField" style="display:none"><label>Nama<input id="authName" autocomplete="name" placeholder="Nama kamu"></label></div><label>Email<input id="authEmail" type="email" autocomplete="email" placeholder="kamu@email.com" required></label><label>Password<input id="authPassword" type="password" autocomplete="current-password" placeholder="Minimal 6 karakter" minlength="6" required></label><button class="auth-submit" type="submit" id="authSubmit">Sign in</button></form>
          <div class="auth-divider">atau</div><button class="auth-google" id="googleAuth" type="button">Continue with Google</button><div class="auth-message" id="authMessage"></div>
        </div>
        <div id="authSigned" style="display:none"><div class="auth-account"><span class="avatar">F</span><div><strong id="authUserName">Signed in</strong><small id="authUserEmail"></small></div></div><button class="auth-signout" id="signOut" type="button">Sign out</button></div>
      </div>
    </div>`);

  const modal = document.getElementById('authModal');
  const openModal = () => modal.classList.add('open');
  const closeModal = () => modal.classList.remove('open');
  document.getElementById('authClose').onclick = closeModal;
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.querySelectorAll('.profile,.top-user').forEach(button => button.addEventListener('click', openModal));
  const message = (text, error = false) => { const el=document.getElementById('authMessage'); el.textContent=text; el.classList.toggle('error',error); };
  const showOAuthErrorFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('error_description') || params.get('error');
    if (!raw) return;
    const detail = raw.replace(/\+/g, ' ');
    openModal();
    message(`Google login gagal: ${detail}`, true);
    window.history.replaceState({}, document.title, window.location.pathname);
  };
  let mode = 'signin';
  document.querySelectorAll('[data-auth-mode]').forEach(tab => tab.addEventListener('click', () => {
    mode = tab.dataset.authMode;
    document.querySelectorAll('[data-auth-mode]').forEach(item => item.classList.toggle('active', item.dataset.authMode === mode));
    document.getElementById('nameField').style.display = mode === 'signup' ? 'block' : 'none';
    document.getElementById('authSubmit').textContent = mode === 'signup' ? 'Create account' : 'Sign in';
    document.getElementById('authTitle').textContent = mode === 'signup' ? 'Create your account' : 'Sign in to Musica Space';
    message('');
  }));

  const setAccountUI = user => {
    const signed = Boolean(user);
    document.getElementById('authGuest').style.display = signed ? 'none' : 'block';
    document.getElementById('authSigned').style.display = signed ? 'block' : 'none';
    if (signed) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Musica Space user';
      document.getElementById('authUserName').textContent = name;
      document.getElementById('authUserEmail').textContent = user.email || '';
      document.querySelectorAll('.profile strong').forEach(el => el.textContent = name);
      document.querySelectorAll('.profile small').forEach(el => el.textContent = 'Signed in');
      document.querySelectorAll('.top-user span:not(.avatar):not(.chev)').forEach(el => el.textContent = name.split(' ')[0]);
    } else {
      document.querySelectorAll('.profile strong').forEach(el => el.textContent = 'Faza Sadikin');
      document.querySelectorAll('.profile small').forEach(el => el.textContent = 'Free Plan');
      document.querySelectorAll('.top-user span:not(.avatar):not(.chev)').forEach(el => el.textContent = 'Sign in');
    }
  };

  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const sessionResult = await supabase.auth.getSession();
    setAccountUI(sessionResult.data.session?.user || null);
    supabase.auth.onAuthStateChange((_event, session) => setAccountUI(session?.user || null));
    document.getElementById('authForm').addEventListener('submit', async event => {
      event.preventDefault(); message('Processing…');
      const email=document.getElementById('authEmail').value.trim(); const password=document.getElementById('authPassword').value; const name=document.getElementById('authName').value.trim();
      const appRedirectUrl = `${window.location.origin}${window.location.pathname}`;
      const result = mode === 'signup' ? await supabase.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:appRedirectUrl}}) : await supabase.auth.signInWithPassword({email,password});
      if (result.error) { message(result.error.message, true); return; }
      if (mode === 'signup' && !result.data.session) message('Akun dibuat. Cek email untuk konfirmasi.'); else { message('Berhasil masuk.'); setTimeout(closeModal,500); }
    });
    document.getElementById('googleAuth').addEventListener('click', async () => {
      message('Menghubungkan ke Google…');
      try {
        const appRedirectUrl = `${window.location.origin}${window.location.pathname}`;
        const result=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:appRedirectUrl}});
        if(result.error) message(`Google login gagal: ${result.error.message}`, true);
      } catch (error) {
        message(`Google login gagal: ${error.message || 'konfigurasi OAuth belum lengkap.'}`, true);
      }
    });
    document.getElementById('signOut').addEventListener('click', async () => { await supabase.auth.signOut(); closeModal(); message(''); });
    showOAuthErrorFromUrl();
  } catch (error) {
    document.getElementById('authSubmit').disabled=true;
    message('Auth library gagal dimuat. Coba refresh halaman.', true);
  }
})();
