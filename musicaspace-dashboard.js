(() => {
  'use strict';

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  const state = {
    view: 'home',
    pianoReady: false,
    audio: null,
    master: null,
    activeVoices: new Map(),
    sustain: false,
    chordMode: false,
    selectedChord: new Set(),
    practiceTimer: null,
    songTimer: null,
    songIndex: 0,
    expected: null,
    score: 0,
    hits: 0,
    misses: 0,
    combo: 0,
    metroTimer: null,
    metroBpm: 92,
    lastTap: 0
  };

  const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const keyboardHotkeys = ['a','w','s','e','d','f','t','g','y','h','u','j','k','o','l','p',';'];
  const pianoMin = 48;
  const pianoMax = 84;
  const songs = {
    furElise: [76,75,76,75,76,71,74,72,69,45,52,57,60,64,69,71,76,75,76,75,76,71,74,72,69,45,52,57,64,69,72,74],
    cMajor: [60,62,64,65,67,69,71,72,71,69,67,65,64,62,60]
  };
  const chordMap = { C:[60,64,67], Am:[57,60,64], G:[55,59,62], F:[53,57,60] };
  const keyData = {
    'C Major':['0♯','A Minor'],
    'G Major':['1♯','E Minor'],
    'D Major':['2♯','B Minor'],
    'A Major':['3♯','F♯ Minor'],
    'E Major':['4♯','C♯ Minor'],
    'F Major':['1♭','D Minor'],
    'Bb Major':['2♭','G Minor']
  };


  const songCatalog = {
    espresso: { id:'espresso', title:'Espresso', artist:'Sabrina Carpenter', key:'B Major', bpm:104, query:'Espresso Sabrina Carpenter', chords:[[59,63,66],[57,61,64],[55,59,62],[52,56,59]] },
    beautifulThings: { id:'beautifulThings', title:'Beautiful Things', artist:'Benson Boone', key:'B Major', bpm:105, query:'Beautiful Things Benson Boone', chords:[[59,63,66],[57,60,64],[55,59,62],[52,56,59]] },
    birdsOfAFeather: { id:'birdsOfAFeather', title:'Birds of a Feather', artist:'Billie Eilish', key:'C Major', bpm:105, query:'Birds of a Feather Billie Eilish', chords:[[60,64,67],[57,60,64],[53,57,60],[55,59,62]] },
    asItWas: { id:'asItWas', title:'As It Was', artist:'Harry Styles', key:'A Major', bpm:174, query:'As It Was Harry Styles', chords:[[57,61,64],[54,57,61],[52,56,59],[55,59,62]] },
    dieWithASmile: { id:'dieWithASmile', title:'Die With A Smile', artist:'Lady Gaga & Bruno Mars', key:'A Major', bpm:158, query:'Die With A Smile Lady Gaga Bruno Mars', chords:[[57,61,64],[53,57,60],[55,59,62],[52,56,59]] },
    blindingLights: { id:'blindingLights', title:'Blinding Lights', artist:'The Weeknd', key:'F Minor', bpm:171, query:'Blinding Lights The Weeknd', chords:[[53,56,60],[56,60,63],[51,55,58],[48,52,55]] }
  };
  const songAliases = { midnight:'espresso', ocean:'beautifulThings', falling:'birdsOfAFeather', good:'asItWas' };
  let authClient = null;

  function replaceIcons() {
    const icons = {
      '⌂':'<svg class="icon-svg" viewBox="0 0 24 24"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>',
      '▥':'<svg class="icon-svg" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 4v16M12 4v16M16 4v16"/></svg>',
      '⇄':'<svg class="icon-svg" viewBox="0 0 24 24"><path d="M7 7h12l-3-3"/><path d="M17 17H5l3 3"/></svg>',
      '⌕':'<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 5 5"/></svg>',
      '✦':'<svg class="icon-svg" viewBox="0 0 24 24"><path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7Z"/></svg>',
      '◌':'<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M12 5v14M5 12h14"/></svg>',
      '♩':'<svg class="icon-svg" viewBox="0 0 24 24"><path d="M14 4v12.5a3.5 3.5 0 1 1-2-3.1V4l8-2v8"/></svg>',
      '✣':'<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/></svg>',
      '▱':'<svg class="icon-svg" viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M8 5v14M12 5v14M16 5v14"/></svg>',
      '☷':'<svg class="icon-svg" viewBox="0 0 24 24"><path d="M5 6h14M5 12h14M5 18h14"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></svg>',
      '◷':'<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>',
      '♙':'<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="7" r="3"/><path d="M6 21c.5-4 2.5-6 6-6s5.5 2 6 6M9 11h6"/></svg>',
      '♧':'<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 4c-3-4-8 1-5 4 1.4 1.4 3.7 1.2 5 .2 1.3 1 3.6 1.2 5-.2 3-3-2-8-5-4Z"/><path d="M12 8v12M8 20h8"/></svg>',
      '↕':'<svg class="icon-svg" viewBox="0 0 24 24"><path d="M8 4v16M5 7l3-3 3 3M16 20V4m-3 13 3 3 3-3"/></svg>',
      '♬':'<svg class="icon-svg" viewBox="0 0 24 24"><path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>',
      '▦':'<svg class="icon-svg" viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></svg>'
    };
    $('.nav-icon,.quick-icon,.tool-icon').forEach(el => { const icon = icons[el.textContent.trim()]; if (icon) el.innerHTML = icon; });
  }

  function renderChartCards() {
    const target = $('#finderCards');
    if (!target) return;
    target.innerHTML = '';
    Object.keys(songCatalog).forEach(id => {
      const song = songCatalog[id];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'mini-card';
      card.dataset.song = song.id;
      card.innerHTML = '<div class="cover">♫</div><div><h3>' + song.title + '</h3><p>' + song.artist + ' · ' + song.key + ' · ' + song.bpm + ' BPM</p><span class="chart-badge">Pop chart preview</span></div>';
      target.appendChild(card);
    });
  }

  function updatePlayer(song, status) {
    const title = $('#playerTitle'); const label = $('#playerStatus');
    if (title) title.textContent = song.title + ' · ' + song.artist;
    if (label) label.textContent = status;
  }

  function stopPreview() {
    if (state.previewTimer) { window.clearInterval(state.previewTimer); state.previewTimer = null; }
  }

  function playSynthPreview(song) {
    stopPreview();
    ensureAudio();
    let step = 0;
    const playStep = () => {
      const chord = song.chords[step % song.chords.length];
      chord.forEach(note => playTone(note, 0.62));
      step += 1;
      if (step >= 16) { stopPreview(); updatePlayer(song, 'Preview selesai'); }
    };
    playStep();
    state.previewTimer = window.setInterval(playStep, Math.max(260, Math.round(60000 / song.bpm)));
    updatePlayer(song, 'Synth chord preview');
  }

  async function playSongById(id) {
    const song = songCatalog[songAliases[id] || id];
    if (!song) return;
    state.currentSong = song;
    const audio = $('#songAudio');
    updatePlayer(song, 'Loading preview…');
    $('.song-playing').forEach(el => el.classList.remove('song-playing'));
    const clicked = $('[data-song="' + song.id + '"]');
    if (clicked) clicked.classList.add('song-playing');
    if (!audio) { playSynthPreview(song); return; }
    audio.pause();
    audio.removeAttribute('src');
    try {
      const response = await fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(song.query) + '&entity=song&limit=5');
      const data = await response.json();
      const result = (data.results || []).find(item => item.previewUrl);
      if (!result) throw new Error('No preview');
      audio.src = result.previewUrl;
      audio.onended = () => updatePlayer(song, 'Preview selesai');
      await audio.play();
      updatePlayer(song, 'Playing 30-second preview');
      showToast('Preview diputar: ' + song.title);
    } catch (error) {
      playSynthPreview(song);
      showToast('Preview streaming gagal; synth practice dijalankan.');
    }
  }

  function setupSongPlayer() {
    const player = $('#playerPlay');
    if (player) player.addEventListener('click', () => {
      const audio = $('#songAudio');
      if (audio && audio.src && !audio.paused) { audio.pause(); updatePlayer(state.currentSong || songCatalog.espresso, 'Paused'); }
      else if (state.currentSong) playSongById(state.currentSong.id);
      else showToast('Pilih lagu dari Recent Songs.');
    });
  }

  function estimateMajorKey(buffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const windowSize = 4096;
    const frameStep = Math.max(windowSize, Math.floor(sampleRate * 0.25));
    const limit = Math.min(data.length - windowSize, sampleRate * 30);
    const histogram = new Array(12).fill(0);
    for (let start = 0; start < limit; start += frameStep) {
      for (let midi = 36; midi <= 83; midi += 1) {
        const hz = 440 * Math.pow(2, (midi - 69) / 12);
        if (hz >= sampleRate / 2) continue;
        let real = 0; let imag = 0;
        for (let n = 0; n < windowSize; n += 4) {
          const value = data[start + n] * (0.5 - 0.5 * Math.cos((2 * Math.PI * n) / windowSize));
          const phase = (2 * Math.PI * hz * n) / sampleRate;
          real += value * Math.cos(phase);
          imag -= value * Math.sin(phase);
        }
        histogram[midi % 12] += Math.sqrt(real * real + imag * imag);
      }
    }
    const profile = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
    let bestRoot = 0; let bestScore = -Infinity;
    for (let root = 0; root < 12; root += 1) {
      let score = 0;
      for (let i = 0; i < 12; i += 1) score += histogram[(root + i) % 12] * profile[i];
      if (score > bestScore) { bestScore = score; bestRoot = root; }
    }
    return noteNames[bestRoot] + ' Major';
  }

  async function analyzeTonalFile(file) {
    const status = $('#tonalStatus');
    if (!file) return;
    if (status) status.textContent = 'Menganalisis 30 detik pertama audio…';
    try {
      if (!ensureAudio()) throw new Error('AudioContext unavailable');
      const buffer = await state.audio.decodeAudioData(await file.arrayBuffer());
      const key = estimateMajorKey(buffer);
      updateTonal(key);
      if (status) status.textContent = 'Selesai. Kandidat tonal Major: ' + key + '.';
      showToast('Tonal terdeteksi: ' + key);
    } catch (error) {
      if (status) status.textContent = 'Audio tidak bisa dianalisis di browser ini. Coba file WAV/MP3 lain.';
      showToast('Analisis tonal gagal.');
    }
  }

  function setupTonalAnalyzer() {
    const file = $('#tonalFile'); const analyze = $('#tonalAnalyze'); const preview = $('#tonalPreview');
    if (!file || !analyze) return;
    file.addEventListener('change', () => { const selected = file.files && file.files[0]; if (selected && preview) preview.src = URL.createObjectURL(selected); });
    analyze.addEventListener('click', () => analyzeTonalFile(file.files && file.files[0]));
  }

  function setAuthSession(session) {
    state.session = session;
    const user = session && session.user;
    const name = user && (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name) || user.email) || 'Faza';
    const avatar = user && user.user_metadata && user.user_metadata.avatar_url;
    const top = $('.top-actions .avatar'); const bottom = $('.profile strong'); const message = $('#authMessage');
    if (top) { top.textContent = user ? name.slice(0,1).toUpperCase() : 'F'; if (avatar) top.style.backgroundImage = 'url(' + avatar + ')'; }
    if (bottom) bottom.textContent = name;
    if (message) message.textContent = user ? 'Signed in as ' + name : 'Belum login. Pilih Google untuk masuk.';
  }

  function setupAuth() {
    const modal = $('#authModal'); const message = $('#authMessage');
    const open = () => { if (modal) modal.classList.remove('hidden'); };
    const close = () => { if (modal) modal.classList.add('hidden'); };
    $('[data-action="profile"]').forEach(button => button.addEventListener('click', open));
    const closeButton = $('#closeAuth'); if (closeButton) closeButton.addEventListener('click', close);
    if (modal) modal.addEventListener('click', event => { if (event.target === modal) close(); });
    const google = $('#googleLogin'); const logout = $('#logoutButton');
    if (!window.supabase || !window.supabase.createClient) { if (message) message.textContent = 'Auth service belum termuat. Coba refresh halaman.'; return; }
    authClient = window.supabase.createClient('https://pyokprmnijoowrpaopyo.supabase.co', 'sb_publishable_3oB-xmqTGDPDYYSLXpGPiw_NdH1R0xC');
    authClient.auth.getSession().then(result => setAuthSession(result.data.session)).catch(() => {});
    authClient.auth.onAuthStateChange((event, session) => setAuthSession(session));
    if (google) google.addEventListener('click', async () => {
      if (message) message.textContent = 'Membuka Google…';
      const result = await authClient.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.origin + window.location.pathname } });
      if (result.error && message) message.textContent = 'Login gagal: ' + result.error.message;
    });
    if (logout) logout.addEventListener('click', async () => { if (authClient) await authClient.auth.signOut(); close(); showToast('Kamu sudah logout.'); });
  }

  async function persistFavorite(song) {
    if (!song) { showToast('Pilih lagu dulu.'); return; }
    try {
      const saved = JSON.parse(localStorage.getItem('musicspace-favorites') || '[]');
      if (!saved.some(item => item.id === song.id)) saved.push(song);
      localStorage.setItem('musicspace-favorites', JSON.stringify(saved));
    } catch (error) {}
    if (authClient && state.session && state.session.user) {
      const result = await authClient.from('favorites').upsert({ user_id:state.session.user.id, song_id:song.id, title:song.title, artist:song.artist, song_key:song.key, bpm:song.bpm }, { onConflict:'user_id,song_id' });
      if (result.error) showToast('Tersimpan lokal; tabel backend belum siap.');
      else showToast('Favorite tersimpan ke akun.');
    } else showToast('Favorite tersimpan di perangkat. Login untuk sinkronisasi.');
  }

  function showToast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => el.classList.remove('show'), 2200);
  }

  function showView(view) {
    const target = $('#' + view + 'View');
    if (!target) return;
    $$('.view').forEach(section => section.classList.toggle('active', section === target));
    $$('.nav-btn').forEach(button => button.classList.toggle('active', button.dataset.view === view));
    state.view = view;
    if (view === 'pianoVisualizer') initPiano();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function noteLabel(midi) {
    return noteNames[midi % 12] + (Math.floor(midi / 12) - 1);
  }

  function isBlack(midi) {
    return [1,3,6,8,10].indexOf(midi % 12) >= 0;
  }

  function renderKeyboard() {
    const keyboard = $('#visualizerKeyboard');
    if (!keyboard || keyboard.dataset.rendered === 'true') return;
    keyboard.dataset.rendered = 'true';
    const white = [];
    for (let midi = pianoMin; midi <= pianoMax; midi += 1) {
      if (!isBlack(midi)) {
        const key = document.createElement('button');
        key.type = 'button';
        key.className = 'white-key';
        key.dataset.midi = String(midi);
        key.textContent = noteLabel(midi);
        white.push(key);
        keyboard.appendChild(key);
      }
    }
    let whiteIndex = 0;
    for (let midi = pianoMin; midi <= pianoMax; midi += 1) {
      if (isBlack(midi)) {
        const key = document.createElement('button');
        key.type = 'button';
        key.className = 'black-key';
        key.dataset.midi = String(midi);
        key.textContent = noteLabel(midi);
        key.style.left = (6 + whiteIndex * (88 / white.length)) + '%';
        keyboard.appendChild(key);
      } else {
        whiteIndex += 1;
      }
    }
  }

  function ensureAudio() {
    if (state.audio) {
      if (state.audio.state === 'suspended') state.audio.resume();
      return true;
    }
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      const status = $('#audioStatus');
      if (status) status.textContent = 'Browser audio unavailable';
      return false;
    }
    state.audio = new AudioCtor();
    state.master = state.audio.createGain();
    state.master.gain.value = 0.72;
    state.master.connect(state.audio.destination);
    const status = $('#audioStatus');
    if (status) status.textContent = 'HQ piano engine ready';
    return true;
  }

  function frequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function releaseVoice(midi) {
    const voice = state.activeVoices.get(midi);
    if (!voice || !state.audio) return;
    const now = state.audio.currentTime;
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(0.0001, now, 0.18);
      voice.osc.stop(now + 0.75);
    } catch (error) {}
    state.activeVoices.delete(midi);
  }

  function playTone(midi, duration) {
    if (!ensureAudio()) return;
    const now = state.audio.currentTime;
    const osc = state.audio.createOscillator();
    const gain = state.audio.createGain();
    const filter = state.audio.createBiquadFilter();
    const naturalRelease = duration || 1.6;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency(midi), now);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4200, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.42, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.17, now + 0.28);
    gain.gain.setTargetAtTime(0.0001, now + naturalRelease, 0.24);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(state.master);
    const voice = { osc: osc, gain: gain };
    state.activeVoices.set(midi, voice);
    osc.onended = () => { if (state.activeVoices.get(midi) === voice) state.activeVoices.delete(midi); };
    osc.start(now);
    osc.stop(now + naturalRelease + 1.15);
  }

  function setKeyVisual(midi, active) {
    const key = $('#visualizerKeyboard [data-midi="' + midi + '"]');
    if (key) key.classList.toggle('active', active);
  }

  function updatePracticeStats() {
    const values = [['pianoSongScore', state.score], ['pianoSongHits', state.hits], ['pianoSongMisses', state.misses], ['pianoSongCombo', state.combo]];
    values.forEach(pair => { const el = $('#' + pair[0]); if (el) el.textContent = String(pair[1]); });
  }

  function practiceHit(midi) {
    if (!state.expected) return;
    if (Number(state.expected) === Number(midi)) {
      state.hits += 1;
      state.combo += 1;
      state.score += 100 + state.combo * 5;
      const feedback = $('#pianoFeedback');
      if (feedback) feedback.textContent = '✓ Correct · ' + noteLabel(midi);
      const note = $('.fall-note[data-midi="' + midi + '"]');
      if (note) note.classList.add('hit');
      state.expected = null;
    } else {
      state.misses += 1;
      state.combo = 0;
      const feedback = $('#pianoFeedback');
      if (feedback) feedback.textContent = '✕ Wrong note · try ' + noteLabel(Number(state.expected));
    }
    updatePracticeStats();
  }

  function triggerKey(midi, fromUser) {
    const numeric = Number(midi);
    if (numeric < pianoMin || numeric > pianoMax) return;
    if (fromUser) {
      ensureAudio();
      playTone(numeric, state.sustain ? 4 : 1.6);
      setKeyVisual(numeric, true);
      window.setTimeout(() => { if (!state.sustain) setKeyVisual(numeric, false); }, 180);
      practiceHit(numeric);
    } else {
      playTone(numeric, 1.05);
      setKeyVisual(numeric, true);
      window.setTimeout(() => setKeyVisual(numeric, false), 260);
    }
  }

  function toggleSustain(force) {
    state.sustain = typeof force === 'boolean' ? force : !state.sustain;
    const labels = [$('#sustainToggle'), $('#sustainPedal')];
    labels.forEach(el => { if (el) { el.textContent = state.sustain ? 'SUSTAIN: ON · Space' : 'SUSTAIN: OFF · Space'; el.classList.toggle('on', state.sustain); } });
    if (!state.sustain) Array.from(state.activeVoices.keys()).forEach(releaseVoice);
  }

  function selectChord(midi) {
    const numeric = Number(midi);
    if (state.selectedChord.has(numeric)) state.selectedChord.delete(numeric);
    else state.selectedChord.add(numeric);
    setKeyVisual(numeric, state.selectedChord.has(numeric));
    const text = $('#selectedChordNotes');
    if (text) text.textContent = state.selectedChord.size ? Array.from(state.selectedChord).sort((a,b) => a-b).map(noteLabel).join(' · ') : 'No notes selected';
  }

  function playSelectedChord() {
    const notes = Array.from(state.selectedChord);
    if (!notes.length) { showToast('Pilih beberapa not dulu.'); return; }
    notes.forEach(note => triggerKey(note, true));
    showToast('Chord dimainkan: ' + notes.map(noteLabel).join(' · '));
  }

  function applyChord(name) {
    state.selectedChord.clear();
    (chordMap[name] || []).forEach(note => state.selectedChord.add(note));
    $$('.white-key,.black-key').forEach(key => key.classList.remove('active'));
    state.selectedChord.forEach(note => setKeyVisual(note, true));
    const text = $('#selectedChordNotes');
    if (text) text.textContent = name + ' · ' + Array.from(state.selectedChord).map(noteLabel).join(' · ');
    if (!state.chordMode) {
      state.chordMode = true;
      updateChordMode();
    }
  }

  function updateChordMode() {
    const button = $('#chordModeToggle');
    const label = $('#chordModeLabel');
    if (button) button.textContent = state.chordMode ? 'Chord mode: ON' : 'Chord mode: OFF';
    if (label) label.textContent = state.chordMode ? 'On' : 'Off';
  }

  function stopSong() {
    window.clearInterval(state.songTimer);
    state.songTimer = null;
    state.expected = null;
    $$('.fall-note').forEach(note => note.remove());
    const feedback = $('#pianoFeedback');
    if (feedback) feedback.textContent = 'Ready to play';
  }

  function addFallingNote(midi, index) {
    const lane = $('#visualizerNotes');
    if (!lane) return;
    const note = document.createElement('div');
    note.className = 'fall-note';
    note.dataset.midi = String(midi);
    note.style.left = (4 + (index % 18) * 5.1) + '%';
    lane.appendChild(note);
    window.setTimeout(() => note.remove(), 3800);
  }

  function startSong(name) {
    stopSong();
    if (name === 'free') { showToast('Free play aktif.'); return; }
    const sequence = songs[name] || songs.cMajor;
    const speed = Number($('#pianoSongSpeed') ? $('#pianoSongSpeed').value : 1) || 1;
    state.songIndex = 0;
    state.score = 0; state.hits = 0; state.misses = 0; state.combo = 0; updatePracticeStats();
    const step = () => {
      if (state.songIndex >= sequence.length) { stopSong(); showToast('Demo selesai.'); return; }
      const midi = sequence[state.songIndex];
      state.expected = midi;
      addFallingNote(midi, state.songIndex);
      const feedback = $('#pianoFeedback');
      if (feedback) feedback.textContent = 'Play ' + noteLabel(midi);
      state.songIndex += 1;
    };
    step();
    state.songTimer = window.setInterval(step, 720 / speed);
    showToast('Latihan dimulai. Ikuti note yang jatuh.');
  }

  function initPiano() {
    if (state.pianoReady) return;
    renderKeyboard();
    const keyboard = $('#visualizerKeyboard');
    if (keyboard) keyboard.addEventListener('pointerdown', event => {
      const key = event.target.closest('[data-midi]');
      if (!key) return;
      event.preventDefault();
      const midi = Number(key.dataset.midi);
      if (state.chordMode) selectChord(midi);
      else triggerKey(midi, true);
    });
    $$('.chord-preset').forEach(button => button.addEventListener('click', () => applyChord(button.dataset.chord)));
    const playChord = $('#playSelectedChord');
    if (playChord) playChord.addEventListener('click', playSelectedChord);
    const clearChord = $('#clearSelectedChord');
    if (clearChord) clearChord.addEventListener('click', () => { state.selectedChord.clear(); $$('.white-key,.black-key').forEach(key => key.classList.remove('active')); const text = $('#selectedChordNotes'); if (text) text.textContent = 'No notes selected'; });
    const chordToggle = $('#chordModeToggle');
    if (chordToggle) chordToggle.addEventListener('click', () => { state.chordMode = !state.chordMode; updateChordMode(); });
    const sustainToggle = $('#sustainToggle');
    if (sustainToggle) sustainToggle.addEventListener('click', () => toggleSustain());
    const sustainPedal = $('#sustainPedal');
    if (sustainPedal) sustainPedal.addEventListener('click', () => toggleSustain());
    const start = $('#pianoSongStart');
    if (start) start.addEventListener('click', () => startSong($('#pianoSongSelect').value));
    const stop = $('#pianoSongStop');
    if (stop) stop.addEventListener('click', stopSong);
    const demo = $('#practiceDemo');
    if (demo) demo.addEventListener('click', () => startSong('furElise'));
    state.pianoReady = true;
  }

  function renderCards() {
    const chordCards = $('#chordCards');
    if (chordCards) {
      ['C Major','A Minor','G Major','F Major','D Minor','E Minor'].forEach(name => {
        const card = document.createElement('button');
        card.type = 'button'; card.className = 'mini-card'; card.dataset.chordOpen = name.split(' ')[0];
        card.innerHTML = '<div class="cover">♬</div><div><h3>' + name + '</h3><p>Open in piano visualizer</p></div>';
        chordCards.appendChild(card);
      });
    }
    const finderCards = $('#finderCards');
    if (finderCards) {
      [['Midnight Drive','Original demo','Cm · 120 BPM'],['Ocean Waves','Pop practice','G · 95 BPM'],['Falling Slowly','Ballad practice','D · 72 BPM'],['Good Riddance','Practice demo','G · 92 BPM']].forEach(item => {
        const card = document.createElement('button');
        card.type = 'button'; card.className = 'mini-card'; card.dataset.song = item[0];
        card.innerHTML = '<div class="cover">♫</div><div><h3>' + item[0] + '</h3><p>' + item[1] + ' · ' + item[2] + '</p></div>';
        finderCards.appendChild(card);
      });
    }
    const wave = $('#wave');
    if (wave) for (let i = 0; i < 52; i += 1) { const bar = document.createElement('i'); bar.style.height = (18 + (i * 17) % 47) + '%'; wave.appendChild(bar); }
  }

  function updateTonal(value) {
    const data = keyData[value] || ['0♯','A Minor'];
    const result = $('#tonalResult'); const sharp = $('#tonalSharp'); const minor = $('#relativeMinor');
    if (result) result.textContent = value;
    if (sharp) sharp.textContent = data[0];
    if (minor) minor.textContent = data[1];
  }

  function setupMetronome() {
    const slider = $('#tempoSlider'); const value = $('#tempoValue');
    if (slider) slider.addEventListener('input', () => { state.metroBpm = Number(slider.value); if (value) value.textContent = slider.value; });
    $$('.feature-button[data-tempo]').forEach(button => button.addEventListener('click', () => { state.metroBpm = Number(button.dataset.tempo); if (slider) slider.value = String(state.metroBpm); if (value) value.textContent = String(state.metroBpm); showToast('Tempo diatur ke ' + state.metroBpm + ' BPM'); }));
    const toggle = $('#metroToggle');
    if (toggle) toggle.addEventListener('click', () => {
      if (state.metroTimer) { window.clearInterval(state.metroTimer); state.metroTimer = null; toggle.textContent = '▶ Start metronome'; const status = $('#metroStatus'); if (status) status.textContent = 'Stopped'; return; }
      const tick = () => { const status = $('#metroStatus'); if (status) status.textContent = '● Beat · ' + state.metroBpm + ' BPM'; ensureAudio(); if (state.audio) { const osc = state.audio.createOscillator(); const gain = state.audio.createGain(); osc.frequency.value = 880; gain.gain.value = .12; osc.connect(gain); gain.connect(state.master); osc.start(); osc.stop(state.audio.currentTime + .05); } };
      tick(); state.metroTimer = window.setInterval(tick, 60000 / state.metroBpm); toggle.textContent = '■ Stop metronome';
    });
    const tap = $('#tapTempo');
    if (tap) tap.addEventListener('click', () => { const now = Date.now(); if (state.lastTap) { const bpm = Math.max(40, Math.min(220, Math.round(60000 / (now - state.lastTap)))); state.metroBpm = bpm; if (slider) slider.value = String(bpm); if (value) value.textContent = String(bpm); } state.lastTap = now; });
  }

  function setupTranspose() {
    let offset = 0;
    const keys = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const base = ['C','Am','F','G'];
    const label = $('#transposeKey'); const pattern = $('#transposePattern');
    const render = () => { const root = keys[(offset + 0 + 12) % 12]; if (label) label.textContent = 'Key: ' + root + ' Major'; if (pattern) pattern.textContent = 'Pattern: ' + base.map(chord => { const rootIndex = keys.indexOf(chord.replace('m','')); return keys[(rootIndex + offset + 12) % 12] + (chord.indexOf('m') >= 0 ? 'm' : ''); }).join(' – '); };
    const button = $('#transposeButton'); if (button) button.addEventListener('click', () => { offset = (offset + 1) % 12; render(); showToast('Progression ditranspose.'); });
    const reset = $('#transposeReset'); if (reset) reset.addEventListener('click', () => { offset = 0; render(); });
    $$('.feature-button[data-progression]').forEach(button => button.addEventListener('click', () => showToast('Progression ' + button.dataset.progression + ' dipilih.')));
    render();
  }

  function setupAssistant() {
    const form = $('#assistantForm'); const input = $('#assistantInput'); const chat = $('#chat');
    if (!form || !input || !chat) return;
    form.addEventListener('submit', event => { event.preventDefault(); const question = input.value.trim(); if (!question) return; const user = document.createElement('div'); user.className = 'bubble user'; user.textContent = question; chat.appendChild(user); const reply = document.createElement('div'); reply.className = 'bubble'; reply.textContent = question.toLowerCase().indexOf('minor') >= 0 ? 'Coba progression Am · F · C · G dan dengarkan bass root-nya.' : 'Coba progression C · Am · F · G. Aku juga bisa membukanya di piano visualizer.'; chat.appendChild(reply); input.value = ''; });
  }

  function bindEvents() {
    document.addEventListener('click', event => {
      const viewButton = event.target.closest('[data-view]');
      if (viewButton) { event.preventDefault(); showView(viewButton.dataset.view); return; }
      const tool = event.target.closest('.tool-launch');
      if (tool) { showView(tool.dataset.tool === 'Piano Visualizer' ? 'pianoVisualizer' : 'tools'); const feedback = $('#toolFeedback'); if (feedback) feedback.textContent = tool.dataset.tool + ' dipilih. Modul siap dipakai.'; return; }
      const chordOpen = event.target.closest('[data-chord-open]');
      if (chordOpen) { showView('pianoVisualizer'); initPiano(); applyChord(chordOpen.dataset.chord); return; }
      const song = event.target.closest('[data-song]');
      if (song) { playSongById(song.dataset.song); return; }
      const action = event.target.closest('[data-action]');
      if (action) { const type = action.dataset.action; if (type === 'pro') showToast('Pro preview segera hadir.'); if (type === 'notify') showToast('Tidak ada notifikasi baru.'); if (type === 'profile') showToast('Profile Faza · Free plan'); if (type === 'theme') document.body.classList.toggle('bright'); if (type === 'newPlaylist') showToast('Playlist baru siap dibuat.'); if (type === 'randomChord') showToast('Coba Cmaj7 di piano visualizer.'); if (type === 'like') persistFavorite(state.currentSong); }
    });
    document.addEventListener('keydown', event => {
      if (event.code === 'Space' && state.view === 'pianoVisualizer' && ['INPUT','SELECT','TEXTAREA'].indexOf(document.activeElement.tagName) < 0) { event.preventDefault(); if (event.repeat) return; toggleSustain(true); }
      if (event.key === 'Escape') stopSong();
      if (state.view !== 'pianoVisualizer' || ['INPUT','SELECT','TEXTAREA'].indexOf(document.activeElement.tagName) >= 0) return;
      const index = keyboardHotkeys.indexOf(event.key.toLowerCase());
      if (index >= 0) triggerKey(pianoMin + index, true);
    });
    document.addEventListener('keyup', event => { if (event.code === 'Space') toggleSustain(false); });
    const tonal = $('#tonalSelect'); if (tonal) tonal.addEventListener('change', () => updateTonal(tonal.value));

  }

  replaceIcons();
  renderCards();
  renderChartCards();
  setupSongPlayer();
  setupTonalAnalyzer();
  setupAuth();
  setupMetronome();
  setupTranspose();
  setupAssistant();
  bindEvents();
  initPiano();
  showView('home');
  const ready = $('#toolFeedback');
  if (ready) ready.textContent = 'Semua modul siap. Navigasi dan tombol aktif.';
})();