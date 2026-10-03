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
    'C Major': { signature:'0♯', relative:'A Minor', root:0 },
    'G Major': { signature:'1♯', relative:'E Minor', root:7 },
    'D Major': { signature:'2♯', relative:'B Minor', root:2 },
    'A Major': { signature:'3♯', relative:'F♯ Minor', root:9 },
    'E Major': { signature:'4♯', relative:'C♯ Minor', root:4 },
    'B Major': { signature:'5♯', relative:'G♯ Minor', root:11 },
    'F♯ Major': { signature:'6♯', relative:'D♯ Minor', root:6 },
    'C♯ Major': { signature:'7♯', relative:'A♯ Minor', root:1 },
    'F Major': { signature:'1♭', relative:'D Minor', root:5 },
    'Bb Major': { signature:'2♭', relative:'G Minor', root:10 },
    'Eb Major': { signature:'3♭', relative:'C Minor', root:3 },
    'Ab Major': { signature:'4♭', relative:'F Minor', root:8 },
    'Db Major': { signature:'5♭', relative:'Bb Minor', root:1 },
    'Gb Major': { signature:'6♭', relative:'Eb Minor', root:6 }
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
    Array.from(document.querySelectorAll('.nav-icon,.quick-icon,.tool-icon')).forEach(el => { const icon = icons[el.textContent.trim()]; if (icon) el.innerHTML = icon; });
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
    Array.from(document.querySelectorAll('.song-playing')).forEach(el => el.classList.remove('song-playing'));
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

  function spectralMagnitude(data, start, windowSize, sampleRate, hz) {
    let real = 0;
    let imag = 0;
    const stride = 4;
    for (let n = 0; n < windowSize; n += stride) {
      const value = data[start + n] * (0.5 - 0.5 * Math.cos((2 * Math.PI * n) / windowSize));
      const phase = (2 * Math.PI * hz * n) / sampleRate;
      real += value * Math.cos(phase);
      imag -= value * Math.sin(phase);
    }
    return Math.sqrt(real * real + imag * imag) / (windowSize / stride);
  }

  function estimateMajorKey(buffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const windowSize = 4096;
    const frameStep = Math.max(windowSize, Math.floor(sampleRate * 0.5));
    const limit = Math.max(0, Math.min(data.length - windowSize, sampleRate * 45));
    const histogram = new Array(12).fill(0);
    let activeFrames = 0;
    for (let start = 0; start < limit; start += frameStep) {
      let rms = 0;
      for (let n = 0; n < windowSize; n += 8) rms += data[start + n] * data[start + n];
      rms = Math.sqrt(rms / (windowSize / 8));
      if (rms < 0.004) continue;
      const frameChroma = new Array(12).fill(0);
      for (let midi = 48; midi <= 84; midi += 1) {
        const hz = 440 * Math.pow(2, (midi - 69) / 12);
        if (hz >= sampleRate / 2) continue;
        const fundamental = spectralMagnitude(data, start, windowSize, sampleRate, hz);
        const harmonic2 = hz * 2 < sampleRate / 2 ? spectralMagnitude(data, start, windowSize, sampleRate, hz * 2) : 0;
        const harmonic3 = hz * 3 < sampleRate / 2 ? spectralMagnitude(data, start, windowSize, sampleRate, hz * 3) : 0;
        frameChroma[midi % 12] += fundamental + harmonic2 * 0.45 + harmonic3 * 0.2;
      }
      const frameTotal = frameChroma.reduce((sum, value) => sum + value, 0);
      if (frameTotal > 0) {
        for (let pc = 0; pc < 12; pc += 1) histogram[pc] += frameChroma[pc] / frameTotal;
        activeFrames += 1;
      }
    }
    if (!activeFrames) return { key:'C Major', confidence:0, signal:false };
    const profile = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
    const profileMean = profile.reduce((a,b) => a + b, 0) / 12;
    const profileNorm = Math.sqrt(profile.reduce((sum,value) => sum + Math.pow(value - profileMean, 2), 0));
    const scores = [];
    for (let root = 0; root < 12; root += 1) {
      const values = profile.map((_, degree) => histogram[(root + degree) % 12]);
      const mean = values.reduce((a,b) => a + b, 0) / 12;
      const norm = Math.sqrt(values.reduce((sum,value) => sum + Math.pow(value - mean, 2), 0)) || 1;
      let dot = 0;
      for (let degree = 0; degree < 12; degree += 1) dot += (values[degree] - mean) * (profile[degree] - profileMean);
      scores.push({ root:root, score:dot / (norm * profileNorm) });
    }
    scores.sort((a,b) => b.score - a.score);
    const best = scores[0];
    const second = scores[1] || { score:0 };
    const names = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
    const confidence = Math.max(0, Math.min(99, Math.round(50 + (best.score - second.score) * 260)));
    return { key:names[best.root] + ' Major', confidence:confidence, signal:true };
  }

  function detectTempoBpm(buffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const frameSize = 1024;
    const hop = 512;
    const envelope = [];
    const limit = Math.min(data.length - frameSize, sampleRate * 60);
    let previous = 0;
    for (let start = 0; start < limit; start += hop) {
      let energy = 0;
      for (let n = 0; n < frameSize; n += 4) {
        const value = data[start + n];
        energy += value * value;
      }
      const rms = Math.sqrt(energy / (frameSize / 4));
      envelope.push(Math.max(0, rms - previous));
      previous = previous * 0.7 + rms * 0.3;
    }
    const envelopeRate = sampleRate / hop;
    let bestBpm = 0;
    let bestScore = -Infinity;
    for (let bpm = 60; bpm <= 180; bpm += 1) {
      const lag = Math.max(1, Math.round((60 / bpm) * envelopeRate));
      let score = 0;
      for (let i = lag; i < envelope.length; i += 1) score += envelope[i] * envelope[i - lag];
      if (score > bestScore) { bestScore = score; bestBpm = bpm; }
    }
    if (!bestBpm || !isFinite(bestScore) || bestScore <= 0) return { bpm:null, confidence:0 };
    const confidence = Math.max(0, Math.min(99, Math.round(Math.min(1, bestScore * 250) * 100)));
    return { bpm:bestBpm, confidence:confidence };
  }

  function keyInfo(value) {
    const normalized = String(value || '').replace(/\s+/g, ' ').trim();
    if (keyData[normalized]) return keyData[normalized];
    const rootName = normalized.replace(/ Major$/i, '');
    const rootNames = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
    const root = rootNames.indexOf(rootName);
    if (root >= 0) {
      const names = ['C Major','Db Major','D Major','Eb Major','E Major','F Major','Gb Major','G Major','Ab Major','A Major','Bb Major','B Major'];
      return keyData[names[root]] || keyData['C Major'];
    }
    return keyData['C Major'];
  }

  function renderTonalSummary() {
    const summary = $('#tonalSummary');
    if (!summary) return;
    const key = state.detectedKey;
    const tempo = state.detectedTempo;
    if (!key && !tempo) {
      summary.textContent = 'Belum ada hasil analisis.';
      return;
    }
    const parts = [];
    if (key) {
      const info = keyInfo(key);
      parts.push('Tonal ' + key + ' · signature ' + info.signature + ' · relative minor ' + info.relative);
    }
    if (tempo) parts.push('tempo ' + tempo + ' BPM');
    summary.textContent = parts.join(' · ');
  }

  function updateTonal(value, confidence) {
    const normalized = String(value || 'C Major').replace(/\s+/g, ' ').trim();
    const info = keyInfo(normalized);
    state.detectedKey = normalized;
    state.keyConfidence = typeof confidence === 'number' ? confidence : null;
    const result = $('#tonalResult');
    const sharp = $('#tonalSharp');
    const minor = $('#relativeMinor');
    const confidenceEl = $('#tonalConfidence');
    const select = $('#tonalSelect');
    if (result) result.textContent = normalized;
    if (sharp) sharp.textContent = info.signature || '—';
    if (minor) minor.textContent = info.relative || '—';
    if (confidenceEl) confidenceEl.textContent = 'Key confidence: ' + (typeof confidence === 'number' ? confidence + '%' : '—');
    if (select && Array.from(select.options || []).some(option => option.value === normalized)) select.value = normalized;
    renderTonalSummary();
  }

  function updateTempo(tempo, confidence) {
    state.detectedTempo = tempo || null;
    state.tempoConfidence = typeof confidence === 'number' ? confidence : null;
    const tempoEl = $('#tonalTempo');
    if (tempoEl) tempoEl.textContent = tempo ? tempo + ' BPM' : '— BPM';
    renderTonalSummary();
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
      if (action) { const type = action.dataset.action; if (type === 'pro') showToast('Pro preview segera hadir.'); if (type === 'notify') showToast('Tidak ada notifikasi baru.'); if (type === 'profile') showToast('Profile Faza · Free plan'); if (type === 'theme') document.body.classList.toggle('bright'); if (type === 'newPlaylist') showToast('Playlist baru siap dibuat.'); if (type === 'randomChord') showToast('Coba Cmaj7 di piano visualizer.'); if (type === 'like') persistFavorite(state.currentSong); if (type === 'copyTonal') { const text = ($('#tonalSummary') && $('#tonalSummary').textContent) || 'No tonal result'; if (navigator.clipboard) navigator.clipboard.writeText(text); showToast('Hasil analisis disalin.'); } if (type === 'openTonalPiano') { showView('pianoVisualizer'); showToast('Piano dibuka untuk latihan tonal.'); } if (type === 'resetTonal') resetTonalAnalysis(); }
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