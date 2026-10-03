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
    heldHotkeys: new Set(),
    pointerNotes: new Map(),
    deferredReleases: new Set(),
    compressor: null,
    reverbInput: null,
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
    lastTap: 0,
    chordCatalog: [],
    chordCatalogLoaded: false,
    activeChordId: null,
    chordTargetKey: null,
    lyricsStore: {}
  };

  const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const keyboardHotkeys = ['a','w','s','e','d','f','t','g','y','h','u','j','k','o','l','p',';'];
  const pianoMin = 36;
  const pianoMax = 84;
  const pianoHotkeyStart = 60;
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

  function fft(real, imag) {
    const size = real.length;
    let j = 0;
    for (let i = 1; i < size; i += 1) {
      let bit = size >> 1;
      while (j & bit) { j ^= bit; bit >>= 1; }
      j ^= bit;
      if (i < j) {
        const realValue = real[i]; real[i] = real[j]; real[j] = realValue;
        const imagValue = imag[i]; imag[i] = imag[j]; imag[j] = imagValue;
      }
    }
    for (let length = 2; length <= size; length <<= 1) {
      const angle = -2 * Math.PI / length;
      const wReal = Math.cos(angle);
      const wImag = Math.sin(angle);
      for (let offset = 0; offset < size; offset += length) {
        let currentReal = 1;
        let currentImag = 0;
        const half = length >> 1;
        for (let i = 0; i < half; i += 1) {
          const even = offset + i;
          const odd = even + half;
          const oddReal = real[odd] * currentReal - imag[odd] * currentImag;
          const oddImag = real[odd] * currentImag + imag[odd] * currentReal;
          const evenReal = real[even];
          const evenImag = imag[even];
          real[even] = evenReal + oddReal;
          imag[even] = evenImag + oddImag;
          real[odd] = evenReal - oddReal;
          imag[odd] = evenImag - oddImag;
          const nextReal = currentReal * wReal - currentImag * wImag;
          currentImag = currentReal * wImag + currentImag * wReal;
          currentReal = nextReal;
        }
      }
    }
  }

  function frameSpectrum(data, start, size, sampleRate) {
    const real = new Float64Array(size);
    const imag = new Float64Array(size);
    for (let n = 0; n < size; n += 1) {
      const sample = data[start + n] || 0;
      const window = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / size);
      real[n] = sample * window;
    }
    fft(real, imag);
    const magnitude = new Float64Array(size / 2);
    for (let k = 0; k < size / 2; k += 1) magnitude[k] = Math.hypot(real[k], imag[k]) / size;
    return magnitude;
  }

  function spectrumAt(magnitude, frequency, sampleRate, size) {
    const index = frequency * size / sampleRate;
    if (index < 1 || index >= magnitude.length - 1) return 0;
    const left = Math.floor(index);
    const fraction = index - left;
    return magnitude[left] * (1 - fraction) + magnitude[left + 1] * fraction;
  }

  function chromaFromSpectrum(magnitude, sampleRate, size) {
    const direct = new Array(12).fill(0);
    const harmonic = new Array(12).fill(0);
    for (let bin = 2; bin < magnitude.length; bin += 1) {
      const frequency = bin * sampleRate / size;
      if (frequency < 55 || frequency > 2400) continue;
      const midi = 69 + 12 * Math.log2(frequency / 440);
      const nearest = Math.round(midi);
      const cents = Math.abs(midi - nearest);
      const tuningWeight = Math.exp(-Math.pow(cents / 0.42, 2));
      direct[((nearest % 12) + 12) % 12] += Math.log1p(magnitude[bin]) * tuningWeight;
    }
    for (let midi = 36; midi <= 84; midi += 1) {
      const frequency = 440 * Math.pow(2, (midi - 69) / 12);
      const f0 = spectrumAt(magnitude, frequency, sampleRate, size);
      const f1 = spectrumAt(magnitude, frequency * 2, sampleRate, size);
      const f2 = spectrumAt(magnitude, frequency * 3, sampleRate, size);
      harmonic[midi % 12] += Math.log1p(f0 + f1 * 0.5 + f2 * 0.25);
    }
    const chroma = new Array(12).fill(0);
    for (let pc = 0; pc < 12; pc += 1) chroma[pc] = direct[pc] * 0.55 + harmonic[pc] * 0.45;
    const total = chroma.reduce((sum, value) => sum + value, 0) || 1;
    return chroma.map(value => value / total);
  }

  function profileCorrelation(chroma, root, profile) {
    const values = profile.map((_, degree) => chroma[(root + degree) % 12]);
    const valueMean = values.reduce((a,b) => a + b, 0) / 12;
    const profileMean = profile.reduce((a,b) => a + b, 0) / 12;
    let dot = 0;
    let valueNorm = 0;
    let profileNorm = 0;
    for (let i = 0; i < 12; i += 1) {
      const a = values[i] - valueMean;
      const b = profile[i] - profileMean;
      dot += a * b;
      valueNorm += a * a;
      profileNorm += b * b;
    }
    return dot / ((Math.sqrt(valueNorm) * Math.sqrt(profileNorm)) || 1);
  }

  function majorProfileScores(chroma) {
    const krumhansl = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
    const temperley = [5.0,1.0,3.5,1.0,4.5,4.0,2.0,4.5,1.0,3.5,1.0,2.0];
    const scores = [];
    for (let root = 0; root < 12; root += 1) {
      scores.push({ root:root, score:(profileCorrelation(chroma, root, krumhansl) + profileCorrelation(chroma, root, temperley)) / 2 });
    }
    return scores;
  }

  function smoothChromaFrames(frames) {
    return frames.map((_, index) => {
      const result = new Array(12).fill(0);
      let count = 0;
      for (let offset = -2; offset <= 2; offset += 1) {
        const frame = frames[index + offset];
        if (!frame) continue;
        for (let pc = 0; pc < 12; pc += 1) result[pc] += frame[pc];
        count += 1;
      }
      return result.map(value => value / Math.max(1, count));
    });
  }

  function minorProfileScores(chroma) {
    const krumhanslMinor = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
    const temperleyMinor = [5.0,2.0,3.5,4.5,2.0,4.0,2.0,4.5,3.5,1.5,4.0,1.5];
    const scores = [];
    for (let root = 0; root < 12; root += 1) scores.push({ root:root, score:(profileCorrelation(chroma, root, krumhanslMinor) + profileCorrelation(chroma, root, temperleyMinor)) / 2 });
    return scores;
  }

  function averageChroma(frames, from, to) {
    const result = new Array(12).fill(0);
    let count = 0;
    for (let index = from; index < to; index += 1) {
      if (!frames[index]) continue;
      for (let pc = 0; pc < 12; pc += 1) result[pc] += frames[index][pc];
      count += 1;
    }
    return count ? result.map(value => value / count) : result;
  }

  function estimateMajorKey(buffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const windowSize = 4096;
    const frameStep = Math.max(windowSize, Math.floor(sampleRate * 0.7));
    const limit = Math.max(0, Math.min(data.length - windowSize, sampleRate * 75));
    const frames = [];
    for (let start = 0; start < limit; start += frameStep) {
      let rms = 0;
      for (let n = 0; n < windowSize; n += 8) rms += data[start + n] * data[start + n];
      rms = Math.sqrt(rms / (windowSize / 8));
      if (rms < 0.003) continue;
      frames.push(chromaFromSpectrum(frameSpectrum(data, start, windowSize, sampleRate), sampleRate, windowSize));
    }
    if (frames.length < 3) return { key:'C Major', rawKey:'C Major', mode:'unknown', confidence:0, signal:false, candidates:[] };
    const smoothed = smoothChromaFrames(frames);
    const global = averageChroma(smoothed, 0, smoothed.length);
    const segmentSize = Math.max(1, Math.floor(smoothed.length / 8));
    const majorVotes = new Array(12).fill(0);
    const minorVotes = new Array(12).fill(0);
    for (let start = 0; start < smoothed.length; start += segmentSize) {
      const segment = averageChroma(smoothed, start, Math.min(smoothed.length, start + segmentSize));
      const major = majorProfileScores(segment).sort((a,b) => b.score - a.score);
      const minor = minorProfileScores(segment).sort((a,b) => b.score - a.score);
      if (major[0]) majorVotes[major[0].root] += 1 + Math.max(0, major[0].score - (major[1] ? major[1].score : 0)) * 3;
      if (minor[0]) minorVotes[minor[0].root] += 1 + Math.max(0, minor[0].score - (minor[1] ? minor[1].score : 0)) * 3;
    }
    const segmentCount = Math.max(1, Math.ceil(smoothed.length / segmentSize));
    const majorScores = majorProfileScores(global).map(item => ({ root:item.root, score:item.score * 0.62 + (majorVotes[item.root] / segmentCount) * 0.38 }));
    const minorScores = minorProfileScores(global).map(item => ({ root:item.root, score:item.score * 0.62 + (minorVotes[item.root] / segmentCount) * 0.38 }));
    majorScores.sort((a,b) => b.score - a.score);
    minorScores.sort((a,b) => b.score - a.score);
    const bestMajor = majorScores[0];
    const bestMinor = minorScores[0];
    const useMinor = bestMinor && bestMajor && bestMinor.score > bestMajor.score + 0.015;
    const names = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
    const minorNames = names.map(name => name + ' Minor');
    const majorRoot = useMinor ? (bestMinor.root + 3) % 12 : bestMajor.root;
    const displayKey = names[majorRoot] + ' Major';
    const rawKey = useMinor ? minorNames[bestMinor.root] : displayKey;
    const chosen = useMinor ? bestMinor : bestMajor;
    const alternate = useMinor ? bestMajor : bestMinor;
    const margin = Math.max(0, chosen.score - (alternate ? alternate.score : 0));
    const confidence = Math.max(0, Math.min(99, Math.round(50 + margin * 300)));
    const candidates = [];
    if (useMinor) candidates.push({ key:rawKey + ' → ' + displayKey, confidence:confidence });
    majorScores.slice(0, 2).forEach(item => candidates.push({ key:names[item.root] + ' Major', confidence:Math.max(0, Math.min(99, Math.round(50 + Math.max(0, item.score - (majorScores[1] ? majorScores[1].score : 0)) * 220))) }));
    return { key:displayKey, rawKey:rawKey, mode:useMinor ? 'minor' : 'major', confidence:confidence, signal:true, candidates:candidates.slice(0,3) };
  }

  function detectTempoBpm(buffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const frameSize = 2048;
    const hop = 512;
    const envelope = [];
    const limit = Math.min(data.length - frameSize, sampleRate * 90);
    let previous = null;
    for (let start = 0; start < limit; start += hop) {
      const magnitude = frameSpectrum(data, start, frameSize, sampleRate);
      let flux = 0;
      if (previous) for (let bin = 2; bin < Math.min(magnitude.length, 900); bin += 1) flux += Math.max(0, magnitude[bin] - previous[bin]);
      envelope.push(flux);
      previous = magnitude;
    }
    const mean = envelope.reduce((a,b) => a + b, 0) / Math.max(1, envelope.length);
    const centered = envelope.map(value => Math.max(0, value - mean));
    const envelopeRate = sampleRate / hop;
    const candidates = [];
    const segmentLength = Math.max(1, Math.floor(centered.length / 4));
    for (let bpm = 60; bpm <= 180; bpm += 1) {
      const lag = Math.max(1, Math.round((60 / bpm) * envelopeRate));
      const segmentScores = [];
      for (let segment = 0; segment < 4; segment += 1) {
        const from = segment * segmentLength;
        const to = Math.min(centered.length, from + segmentLength);
        let primary = 0;
        let energy = 0;
        for (let index = from; index < to; index += 1) {
          energy += centered[index] * centered[index];
          if (index - lag >= from) primary += centered[index] * centered[index - lag];
        }
        segmentScores.push(energy ? primary / energy : 0);
      }
      candidates.push({ bpm:bpm, score:segmentScores.reduce((a,b) => a + b, 0) / segmentScores.length });
    }
    candidates.sort((a,b) => b.score - a.score);
    let best = candidates[0];
    const half = best ? candidates.find(item => item.bpm === Math.round(best.bpm / 2)) : null;
    const double = best ? candidates.find(item => item.bpm === best.bpm * 2) : null;
    if (best && best.bpm >= 160 && half && half.score >= best.score * 0.38) best = half;
    if (best && best.bpm < 78 && double && double.score >= best.score * 0.55) best = double;
    const second = candidates.find(item => item.bpm !== best.bpm) || { score:0 };
    if (!best || best.score <= 0) return { bpm:null, confidence:0 };
    const difference = best.score ? (best.score - second.score) / best.score : 0;
    return { bpm:best.bpm, confidence:Math.max(0, Math.min(99, Math.round(difference * 420))) };
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
    const rawKey = state.detectedRawKey;
    const tempo = state.detectedTempo;
    if (!key && !tempo) { summary.textContent = 'Belum ada hasil analisis.'; return; }
    const parts = [];
    if (key) {
      const info = keyInfo(key);
      parts.push(rawKey && rawKey !== key ? 'Sumber ' + rawKey + ' → Major view ' + key + ' · signature ' + info.signature + ' · relative minor ' + info.relative : 'Tonal ' + key + ' · signature ' + info.signature + ' · relative minor ' + info.relative);
    }
    if (tempo) parts.push('tempo ' + tempo + ' BPM');
    summary.textContent = parts.join(' · ');
  }

  function updateTonal(value, confidence, candidates, rawKey, mode) {
    const normalized = String(value || 'C Major').replace(/\s+/g, ' ').trim();
    const info = keyInfo(normalized);
    state.detectedKey = normalized;
    state.detectedRawKey = rawKey || normalized;
    state.detectedMode = mode || 'major';
    state.keyConfidence = typeof confidence === 'number' ? confidence : null;
    state.detectedCandidates = candidates || [];
    const result = $('#tonalResult');
    const sharp = $('#tonalSharp');
    const minor = $('#relativeMinor');
    const confidenceEl = $('#tonalConfidence');
    const candidatesEl = $('#tonalCandidates');
    const modeEl = $('#tonalMode');
    if (result) result.textContent = normalized || '—';
    if (sharp) sharp.textContent = info.signature || '—';
    if (minor) minor.textContent = info.relative || '—';
    if (confidenceEl) confidenceEl.textContent = 'Key confidence: ' + (typeof confidence === 'number' ? confidence + '%' : '—');
    if (modeEl) modeEl.textContent = 'Mode: ' + (state.detectedMode === 'minor' ? 'minor source → relative Major shown' : state.detectedMode);
    if (candidatesEl) candidatesEl.textContent = 'Top candidates: ' + (state.detectedCandidates.length ? state.detectedCandidates.map(item => item.key + ' ' + item.confidence + '%').join(' · ') : '—');
    renderTonalSummary();
  }

  function updateTempo(tempo, confidence) {
    state.detectedTempo = tempo || null;
    state.tempoConfidence = typeof confidence === 'number' ? confidence : null;
    const tempoEl = $('#tonalTempo');
    if (tempoEl) tempoEl.textContent = tempo ? tempo + ' BPM' : '— BPM';
    renderTonalSummary();
  }

  async function decodeTonalFile(file) {
    if (!file) throw new Error('No audio file');
    if (state.tonalFile === file && state.tonalBuffer) return state.tonalBuffer;
    if (!ensureAudio()) throw new Error('AudioContext unavailable');
    state.tonalBuffer = await state.audio.decodeAudioData(await file.arrayBuffer());
    state.tonalFile = file;
    return state.tonalBuffer;
  }

  async function analyzeTonalFile(file) {
    const status = $('#tonalStatus');
    if (!file) { if (status) status.textContent = 'Pilih file audio terlebih dahulu.'; return; }
    if (status) status.textContent = 'Menganalisis tonal dan tempo…';
    try {
      const buffer = await decodeTonalFile(file);
      const result = estimateMajorKey(buffer);
      const tempo = detectTempoBpm(buffer);
      updateTonal(result.key, result.confidence, result.candidates, result.rawKey, result.mode);
      updateTempo(tempo.bpm, tempo.confidence);
      if (status) status.textContent = result.signal ? 'Analisis selesai. Kandidat Major ditemukan.' : 'Sinyal musik terlalu lemah untuk dipastikan.';
      showToast('Tonal ' + result.key + ' · ' + (tempo.bpm || '—') + ' BPM');
    } catch (error) {
      if (status) status.textContent = 'Audio tidak bisa dianalisis. Coba WAV/MP3 lain yang berisi musik.';
      showToast('Analisis audio gagal.');
    }
  }

  async function analyzeTempoFile(file) {
    const status = $('#tonalStatus');
    if (!file) { if (status) status.textContent = 'Pilih file audio terlebih dahulu.'; return; }
    if (status) status.textContent = 'Mendeteksi tempo…';
    try {
      const buffer = await decodeTonalFile(file);
      const tempo = detectTempoBpm(buffer);
      updateTempo(tempo.bpm, tempo.confidence);
      if (status) status.textContent = tempo.bpm ? 'Tempo terdeteksi.' : 'Beat terlalu lemah untuk menentukan tempo.';
      showToast(tempo.bpm ? tempo.bpm + ' BPM' : 'Tempo tidak ditemukan');
    } catch (error) {
      if (status) status.textContent = 'Tempo detector gagal membaca file.';
    }
  }

  function setupTonalAnalyzer() {
    const file = $('#tonalFile');
    const analyze = $('#tonalAnalyze');
    const tempoButton = $('#tempoAnalyze');
    const preview = $('#tonalPreview');
    if (!file || !analyze) return;
    file.addEventListener('change', () => {
      const selected = file.files && file.files[0];
      state.tonalBuffer = null;
      state.tonalFile = null;
      if (selected && preview) preview.src = URL.createObjectURL(selected);
    });
    analyze.addEventListener('click', () => analyzeTonalFile(file.files && file.files[0]));
    if (tempoButton) tempoButton.addEventListener('click', () => analyzeTempoFile(file.files && file.files[0]));
  }

  function resetTonalAnalysis() {
    state.detectedKey = null;
    state.detectedRawKey = null;
    state.detectedMode = null;
    state.detectedTempo = null;
    state.tonalBuffer = null;
    state.tonalFile = null;
    const result = $('#tonalResult');
    const sharp = $('#tonalSharp');
    const minor = $('#relativeMinor');
    const confidence = $('#tonalConfidence');
    const candidates = $('#tonalCandidates');
    const mode = $('#tonalMode');
    const tempo = $('#tonalTempo');
    if (result) result.textContent = '—';
    if (sharp) sharp.textContent = '—';
    if (minor) minor.textContent = '—';
    if (confidence) confidence.textContent = 'Key confidence: —';
    if (candidates) candidates.textContent = 'Top candidates: —';
    if (mode) mode.textContent = 'Mode: —';
    if (tempo) tempo.textContent = '— BPM';
    const status = $('#tonalStatus');
    if (status) status.textContent = 'Belum ada audio. Pilih file untuk mulai analisis.';
    renderTonalSummary();
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
    Array.from(document.querySelectorAll('[data-action="profile"]')).forEach(button => button.addEventListener('click', open));
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

  const routeViews = new Set([
    'home','library','progressions','finder','assistant','tonal','metronome',
    'tools','pianoVisualizer','mylibrary','playlists','practice','community','chordDetail'
  ]);
  const routeTitles = {
    home:'Musica Space',
    library:'Chord Library · Musica Space',
    progressions:'Progressions · Musica Space',
    finder:'Song Finder · Musica Space',
    assistant:'AI Assistant · Musica Space',
    tonal:'Tonal Recognition · Musica Space',
    metronome:'Metronome · Musica Space',
    tools:'Tools · Musica Space',
    pianoVisualizer:'Piano Visualizer · Musica Space',
    mylibrary:'My Library · Musica Space',
    playlists:'Playlists · Musica Space',
    practice:'Practice · Musica Space',
    community:'Community · Musica Space',
    chordDetail:'Chord Sheet · Musica Space'
  };

  function viewFromLocation() {
    const raw = String(window.location.hash || '').replace(/^#/, '').trim();
    let decoded = raw;
    try { decoded = decodeURIComponent(raw); } catch (error) {}
    if (decoded.indexOf('chords/') === 0) {
      const id = decoded.slice('chords/'.length).trim();
      if (id) {
        state.activeChordId = id;
        return 'chordDetail';
      }
    }
    state.activeChordId = null;
    return routeViews.has(decoded) ? decoded : 'home';
  }

  function syncViewRoute(view, replace) {
    const hash = view === 'chordDetail' && state.activeChordId
      ? '#chords/' + encodeURIComponent(state.activeChordId)
      : '#' + view;
    if (window.location.hash === hash) return;
    if (replace) window.history.replaceState(null, '', hash);
    else window.history.pushState(null, '', hash);
  }

  function showView(view, options) {
    const target = $('#' + view + 'View');
    if (!target) return;
    const settings = options || {};
    if (!settings.fromRoute) syncViewRoute(view, Boolean(settings.replace));
    const app = document.querySelector('.app');
    if (app) app.classList.remove('menu-open');
    $$('.view').forEach(section => section.classList.toggle('active', section === target));
    $$('.nav-btn').forEach(button => button.classList.toggle('active', button.dataset.view === view));
    state.view = view;
    if (routeTitles[view]) document.title = routeTitles[view];
    if (view === 'pianoVisualizer') initPiano();
    if (view === 'chordDetail') renderChordDetail(state.activeChordId);
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
        key.type = 'button'; key.className = 'white-key'; key.dataset.midi = String(midi);
        key.textContent = noteLabel(midi); white.push(key); keyboard.appendChild(key);
      }
    }
    const whiteCount = white.length;
    let whiteIndex = 0;
    for (let midi = pianoMin; midi <= pianoMax; midi += 1) {
      if (isBlack(midi)) {
        const key = document.createElement('button');
        key.type = 'button'; key.className = 'black-key'; key.dataset.midi = String(midi);
        key.textContent = noteLabel(midi);
        key.style.left = (whiteIndex / whiteCount * 100) + '%';
        key.style.width = (100 / whiteCount * 0.62) + '%';
        keyboard.appendChild(key);
      } else whiteIndex += 1;
    }
  }

  function createPianoImpulse(context) {
    const seconds = 2.35;
    const impulse = context.createBuffer(2, Math.floor(context.sampleRate * seconds), context.sampleRate);
    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < data.length; i += 1) {
        const decay = Math.pow(1 - i / data.length, 2.8);
        data[i] = (Math.random() * 2 - 1) * decay * (channel ? 0.86 : 1);
      }
    }
    return impulse;
  }

  function connectPianoVoice(node) {
    node.connect(state.master);
    if (state.reverbInput) node.connect(state.reverbInput);
  }

  function ensureAudio() {
    if (state.audio) {
      if (state.audio.state === 'suspended') state.audio.resume();
      return true;
    }
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      const status = $('#audioStatus');
      if (status) status.textContent = 'Audio tidak didukung browser ini';
      return false;
    }
    state.audio = new AudioCtor({ latencyHint:'interactive' });
    state.master = state.audio.createGain();
    state.compressor = state.audio.createDynamicsCompressor();
    const convolver = state.audio.createConvolver();
    const wet = state.audio.createGain();
    state.reverbInput = state.audio.createGain();

    state.master.gain.value = Number($('#pianoVolume') ? $('#pianoVolume').value : 0.72);
    state.compressor.threshold.value = -18;
    state.compressor.knee.value = 18;
    state.compressor.ratio.value = 4;
    state.compressor.attack.value = 0.004;
    state.compressor.release.value = 0.28;
    convolver.buffer = createPianoImpulse(state.audio);
    state.reverbInput.gain.value = 0.18;
    wet.gain.value = 0.24;

    state.master.connect(state.compressor);
    state.reverbInput.connect(convolver);
    convolver.connect(wet);
    wet.connect(state.compressor);
    state.compressor.connect(state.audio.destination);

    const status = $('#audioStatus');
    if (status) {
      status.textContent = 'Memuat Studio Grand samples…';
      status.classList.remove('sample-ready');
      status.classList.add('sample-loading');
    }
    warmPianoSamples();
    return true;
  }

  /* Salamander Grand Piano: file names follow the original Tone.js bank
     (Ds/Fs, not D#/F#). Dense anchors keep pitch shifting below 3 semitones. */
  const pianoSampleBank = [
    { midi:36, name:'C2', file:'C2.mp3' },
    { midi:39, name:'D#2', file:'Ds2.mp3' },
    { midi:42, name:'F#2', file:'Fs2.mp3' },
    { midi:45, name:'A2', file:'A2.mp3' },
    { midi:48, name:'C3', file:'C3.mp3' },
    { midi:51, name:'D#3', file:'Ds3.mp3' },
    { midi:54, name:'F#3', file:'Fs3.mp3' },
    { midi:57, name:'A3', file:'A3.mp3' },
    { midi:60, name:'C4', file:'C4.mp3' },
    { midi:63, name:'D#4', file:'Ds4.mp3' },
    { midi:66, name:'F#4', file:'Fs4.mp3' },
    { midi:69, name:'A4', file:'A4.mp3' },
    { midi:72, name:'C5', file:'C5.mp3' },
    { midi:75, name:'D#5', file:'Ds5.mp3' },
    { midi:78, name:'F#5', file:'Fs5.mp3' },
    { midi:81, name:'A5', file:'A5.mp3' },
    { midi:84, name:'C6', file:'C6.mp3' }
  ];
  const pianoSampleRoots = [
    'https://tonejs.github.io/audio/salamander/',
    'https://cdn.jsdelivr.net/gh/Tonejs/Tone.js@14.4.0/examples/audio/salamander/'
  ];
  const pianoSampleCache = new Map();
  const pianoSampleLoading = new Map();

  function sampleUrls(sample) {
    return pianoSampleRoots.map(root => root + sample.file);
  }

  function nearestPianoSample(midi) {
    return pianoSampleBank.reduce(
      (best, sample) => Math.abs(sample.midi - midi) < Math.abs(best.midi - midi) ? sample : best,
      pianoSampleBank[0]
    );
  }

  async function loadPianoSample(sample) {
    if (pianoSampleCache.has(sample.name)) return pianoSampleCache.get(sample.name);
    if (pianoSampleLoading.has(sample.name)) return pianoSampleLoading.get(sample.name);
    const loading = (async () => {
      let lastError = null;
      for (const url of sampleUrls(sample)) {
        try {
          const response = await fetch(url, { mode:'cors', cache:'force-cache' });
          if (!response.ok) throw new Error('sample fetch failed: ' + response.status);
          const data = await response.arrayBuffer();
          const buffer = await state.audio.decodeAudioData(data.slice(0));
          pianoSampleCache.set(sample.name, buffer);
          return buffer;
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError || new Error('piano sample unavailable');
    })().finally(() => pianoSampleLoading.delete(sample.name));
    pianoSampleLoading.set(sample.name, loading);
    return loading;
  }

  async function warmPianoSamples() {
    const status = $('#audioStatus');
    const first = [nearestPianoSample(57), nearestPianoSample(60), nearestPianoSample(69), nearestPianoSample(72)];
    const results = await Promise.all(first.map(sample => loadPianoSample(sample).catch(() => null)));
    if (status) {
      if (results.filter(Boolean).length >= 2) {
        status.textContent = 'Studio Grand · HQ samples ready';
        status.classList.remove('sample-loading');
        status.classList.add('sample-ready');
      } else {
        status.textContent = 'Studio Grand · modeled fallback';
        status.classList.remove('sample-loading');
      }
    }
    const preload = () => pianoSampleBank.forEach(sample => loadPianoSample(sample).catch(() => null));
    if ('requestIdleCallback' in window) window.requestIdleCallback(preload, { timeout:3500 });
    else window.setTimeout(preload, 900);
  }

  function frequency(midi) {
    return 440 * Math.pow(2, (Number(midi) - 69) / 12);
  }

  function finishVoice(midi, voice) {
    if (state.activeVoices.get(midi) === voice) state.activeVoices.delete(midi);
  }

  function releaseVoice(midi, fast) {
    const numeric = Number(midi);
    const voice = state.activeVoices.get(numeric);
    if (!voice || !state.audio) return;
    const now = state.audio.currentTime;
    const release = fast ? 0.07 : 0.3;
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(0.0001, now, release);
      (voice.sources || [voice.source]).filter(Boolean).forEach(source => {
        try { source.stop(now + Math.max(0.32, release * 5)); } catch (error) {}
      });
    } catch (error) {}
    state.activeVoices.delete(numeric);
  }

  function startFallbackVoice(midi, duration, velocity) {
    const now = state.audio.currentTime;
    const base = frequency(midi);
    const output = state.audio.createGain();
    const tone = state.audio.createBiquadFilter();
    const body = state.audio.createBiquadFilter();
    const sources = [];
    const intensity = Math.max(0.25, Math.min(1, velocity || 0.82));

    tone.type = 'lowpass';
    tone.frequency.setValueAtTime(Math.min(9200, 3800 + midi * 55), now);
    tone.Q.value = 0.65;
    body.type = 'peaking';
    body.frequency.value = midi < 55 ? 190 : 420;
    body.Q.value = 0.9;
    body.gain.value = midi < 55 ? 4.2 : 2.2;

    [[-2.7,0.48],[0,0.68],[2.2,0.42]].forEach((pair, index) => {
      const source = state.audio.createOscillator();
      const partial = state.audio.createGain();
      source.type = index === 1 ? 'triangle' : 'sine';
      source.frequency.setValueAtTime(base, now);
      source.detune.setValueAtTime(pair[0], now);
      partial.gain.value = pair[1];
      source.connect(partial);
      partial.connect(tone);
      sources.push(source);
    });

    const overtone = state.audio.createOscillator();
    const overtoneGain = state.audio.createGain();
    overtone.type = 'sine';
    overtone.frequency.value = base * 2.003;
    overtoneGain.gain.value = midi < 60 ? 0.12 : 0.19;
    overtone.connect(overtoneGain);
    overtoneGain.connect(tone);
    sources.push(overtone);

    const hammerBuffer = state.audio.createBuffer(1, Math.floor(state.audio.sampleRate * 0.035), state.audio.sampleRate);
    const hammerData = hammerBuffer.getChannelData(0);
    for (let i = 0; i < hammerData.length; i += 1) hammerData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / hammerData.length, 4);
    const hammer = state.audio.createBufferSource();
    const hammerFilter = state.audio.createBiquadFilter();
    const hammerGain = state.audio.createGain();
    hammer.buffer = hammerBuffer;
    hammerFilter.type = 'bandpass';
    hammerFilter.frequency.value = Math.min(5400, 1200 + midi * 44);
    hammerFilter.Q.value = 0.8;
    hammerGain.gain.value = 0.06 * intensity;
    hammer.connect(hammerFilter);
    hammerFilter.connect(hammerGain);
    hammerGain.connect(body);
    sources.push(hammer);

    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(0.22 * intensity, now + 0.008);
    output.gain.exponentialRampToValueAtTime(0.095 * intensity, now + 0.42);
    output.gain.setTargetAtTime(0.0001, now + Math.max(1.2, duration || 2), 0.52);

    tone.connect(body);
    body.connect(output);
    connectPianoVoice(output);
    const voice = { source:sources[0], sources, gain:output };
    const previous = state.activeVoices.get(midi);
    if (previous) releaseVoice(midi, true);
    state.activeVoices.set(midi, voice);
    sources.forEach(source => {
      source.onended = () => finishVoice(midi, voice);
      source.start(now);
      source.stop(now + Math.max(3, (duration || 2) + 2.2));
    });
  }

  async function playTone(midi, duration, velocity) {
    if (!ensureAudio()) return;
    const numeric = Number(midi);
    const naturalRelease = duration || 2.4;
    const intensity = Math.max(0.25, Math.min(1, velocity || 0.86));
    const sample = nearestPianoSample(numeric);
    let buffer = pianoSampleCache.get(sample.name);

    if (!buffer) {
      startFallbackVoice(numeric, naturalRelease, intensity * 0.78);
      loadPianoSample(sample).catch(() => null);
      return;
    }

    const previous = state.activeVoices.get(numeric);
    if (previous) releaseVoice(numeric, true);
    const now = state.audio.currentTime;
    const source = state.audio.createBufferSource();
    const filter = state.audio.createBiquadFilter();
    const gain = state.audio.createGain();
    source.buffer = buffer;
    source.playbackRate.value = Math.pow(2, (numeric - sample.midi) / 12);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(11000, 6300 + intensity * 3600), now);
    filter.Q.value = 0.55;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.5 * intensity, now + 0.007);
    gain.gain.exponentialRampToValueAtTime(0.3 * intensity, now + 0.17);
    gain.gain.setTargetAtTime(0.0001, now + naturalRelease, 0.52);
    source.connect(filter);
    filter.connect(gain);
    connectPianoVoice(gain);
    const voice = { source, sources:[source], gain };
    state.activeVoices.set(numeric, voice);
    source.onended = () => finishVoice(numeric, voice);
    source.start(now);
    source.stop(now + naturalRelease + 3.4);
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

  function triggerKey(midi, fromUser, velocity) {
    const numeric = Number(midi);
    if (numeric < pianoMin || numeric > pianoMax) return;
    state.deferredReleases.delete(numeric);
    playTone(numeric, state.sustain ? 8 : (fromUser ? 3.2 : 1.7), velocity || 0.88);
    setKeyVisual(numeric, true);
    if (fromUser) practiceHit(numeric);
    else window.setTimeout(() => releaseKey(numeric), 520);
  }

  function releaseKey(midi) {
    const numeric = Number(midi);
    setKeyVisual(numeric, false);
    if (state.sustain) state.deferredReleases.add(numeric);
    else releaseVoice(numeric);
  }

  function toggleSustain(force) {
    const next = typeof force === 'boolean' ? force : !state.sustain;
    if (next === state.sustain) return;
    state.sustain = next;
    const labels = [$('#sustainToggle'), $('#sustainPedal')];
    labels.forEach(el => {
      if (!el) return;
      el.textContent = state.sustain ? 'SUSTAIN: ON · Space' : 'SUSTAIN: OFF · Space';
      el.classList.toggle('on', state.sustain);
      el.setAttribute('aria-pressed', String(state.sustain));
    });
    if (!state.sustain) {
      Array.from(state.deferredReleases).forEach(releaseVoice);
      state.deferredReleases.clear();
    }
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
    notes.forEach((note, index) => window.setTimeout(() => triggerKey(note, false, 0.82), index * 12));
    window.setTimeout(() => notes.forEach(releaseKey), state.sustain ? 1600 : 1050);
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

  function pianoPositionForMidi(midi) {
    const totalWhite = [];
    let whiteBefore = 0;
    for (let note = pianoMin; note <= pianoMax; note += 1) {
      if (!isBlack(note)) totalWhite.push(note);
      if (note < midi && !isBlack(note)) whiteBefore += 1;
    }
    const width = 100 / Math.max(1, totalWhite.length);
    return isBlack(midi) ? { left:(whiteBefore - 0.34) * width, width:width * 0.68 } : { left:whiteBefore * width, width:width };
  }
  function addFallingNote(midi, index, speed) {
    const lane = $('#visualizerNotes'); if (!lane) return;
    const note = document.createElement('div'); const position = pianoPositionForMidi(Number(midi));
    note.className = 'fall-note'; note.dataset.midi = String(midi); note.dataset.index = String(index);
    note.style.left = position.left + '%'; note.style.width = position.width + '%'; note.style.animationDuration = (Math.max(1.8, 3.2 / (speed || 1))) + 's'; note.title = noteLabel(Number(midi));
    lane.appendChild(note); window.setTimeout(() => note.remove(), Math.max(2200, 3600 / (speed || 1)));
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
      addFallingNote(midi, state.songIndex, speed);
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
    if (keyboard) {
      keyboard.addEventListener('pointerdown', event => {
        const key = event.target.closest('[data-midi]');
        if (!key) return;
        event.preventDefault();
        const midi = Number(key.dataset.midi);
        if (state.chordMode) { selectChord(midi); return; }
        try { key.setPointerCapture(event.pointerId); } catch (error) {}
        state.pointerNotes.set(event.pointerId, midi);
        triggerKey(midi, true, event.pointerType === 'mouse' ? 0.86 : 0.9);
      });
      const endPointer = event => {
        if (!state.pointerNotes.has(event.pointerId)) return;
        const midi = state.pointerNotes.get(event.pointerId);
        state.pointerNotes.delete(event.pointerId);
        releaseKey(midi);
      };
      keyboard.addEventListener('pointerup', endPointer);
      keyboard.addEventListener('pointercancel', endPointer);
      keyboard.addEventListener('lostpointercapture', endPointer);
      keyboard.addEventListener('contextmenu', event => event.preventDefault());
    }
    $('.chord-preset').forEach(button => button.addEventListener('click', () => applyChord(button.dataset.chord)));
    const playChord = $('#playSelectedChord');
    if (playChord) playChord.addEventListener('click', playSelectedChord);
    const clearChord = $('#clearSelectedChord');
    if (clearChord) clearChord.addEventListener('click', () => { state.selectedChord.clear(); $('.white-key,.black-key').forEach(key => key.classList.remove('active')); const text = $('#selectedChordNotes'); if (text) text.textContent = 'No notes selected'; });
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
    const volume = $('#pianoVolume');
    if (volume) volume.addEventListener('input', () => {
      if (!state.master || !state.audio) return;
      state.master.gain.setTargetAtTime(Number(volume.value), state.audio.currentTime, 0.025);
    });
    state.pianoReady = true;
  }

  function renderChordCatalog(query) {
    const target = $('#chordCards');
    if (!target || !state.chordCatalogLoaded) return;
    const term = String(query || '').trim().toLowerCase();
    const songs = state.chordCatalog.filter(song => {
      const haystack = [
        song.title, song.artist, song.key, song.mode, song.difficulty,
        ...(Array.isArray(song.tags) ? song.tags : []),
        ...(Array.isArray(song.core_progression) ? song.core_progression : [])
      ].join(' ').toLowerCase();
      return !term || haystack.indexOf(term) >= 0;
    });
    target.innerHTML = '';
    songs.forEach(song => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'mini-card catalog-card';
      card.dataset.catalogSong = song.id;
      const progression = Array.isArray(song.core_progression) ? song.core_progression.join(' · ') : 'Chord progression tersedia';
      const tags = Array.isArray(song.tags) ? song.tags.slice(0, 2).join(' · ') : 'Top chart';
      card.innerHTML =
        '<div class="cover">♫</div><div><h3></h3><p></p><span class="chart-badge"></span></div>';
      const title = card.querySelector('h3');
      const meta = card.querySelector('p');
      const badge = card.querySelector('.chart-badge');
      if (title) title.textContent = song.title || 'Untitled';
      if (meta) meta.textContent = (song.artist || 'Unknown artist') + ' · ' + (song.key || '—') + ' · ' + (song.difficulty || 'reference');
      if (badge) badge.textContent = progression + ' · ' + tags;
      target.appendChild(card);
    });
    if (!songs.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Chord atau lagu tidak ditemukan.';
      target.appendChild(empty);
    }
  }

  async function loadChordCatalog() {
    try {
      const url = new URL('assets/data/musica-space-top-chart-chords.json', document.baseURI).toString();
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error('Chord catalog fetch failed');
      const data = await response.json();
      if (!data || !Array.isArray(data.songs)) throw new Error('Invalid chord catalog');
      state.chordCatalog = data.songs;
      state.chordCatalogLoaded = true;
      const search = $('#chordSearch');
      renderChordCatalog(search ? search.value : '');
      if (state.view === 'chordDetail') renderChordDetail(state.activeChordId);
    } catch (error) {
      state.chordCatalogLoaded = false;
      const target = $('#chordCards');
      if (target && !target.children.length) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'Katalog chord belum bisa dimuat. Coba refresh.';
        target.appendChild(empty);
      }
    }
  }

  function setupChordLibrary() {
    const search = $('#chordSearch');
    if (search) search.addEventListener('input', () => renderChordCatalog(search.value));
    loadChordCatalog();
  }

  const chordRootPitches = {
    C:0, 'C#':1, Db:1, D:2, 'D#':3, Eb:3, E:4, F:5,
    'F#':6, Gb:6, G:7, 'G#':8, Ab:8, A:9, 'A#':10, Bb:10, B:11
  };
  const chordDisplayRoots = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  const chordMajorScale = [0,2,4,5,7,9,11];
  const chordMinorScale = [0,2,3,5,7,8,11];
  const romanDegrees = { I:0, II:1, III:2, IV:3, V:4, VI:5, VII:6 };

  function rootFromChordSymbol(value) {
    const match = String(value || '').trim().match(/^([A-G](?:#|b)?)/);
    return match ? match[1] : '';
  }
  function pitchFromKey(value) {
    const root = rootFromChordSymbol(String(value || '').replace(/\s+major$|\s+minor$/i, ''));
    return Object.prototype.hasOwnProperty.call(chordRootPitches, root) ? chordRootPitches[root] : 0;
  }
  function preferredChordRoot(pitch) {
    return chordDisplayRoots[((pitch % 12) + 12) % 12];
  }
  function transposeChordSymbol(symbol, semitones) {
    const text = String(symbol || '').trim();
    const root = rootFromChordSymbol(text);
    if (!root || !Object.prototype.hasOwnProperty.call(chordRootPitches, root)) return text;
    const suffix = text.slice(root.length);
    return preferredChordRoot(chordRootPitches[root] + semitones) + suffix;
  }
  function chordTargetOptions(song) {
    const suffix = song && song.mode === 'minor' ? 'm' : '';
    return chordDisplayRoots.map(root => root + suffix);
  }

  function loadLyricsStore() {
    try {
      const raw = window.localStorage.getItem('musica-space-lyrics-chords');
      state.lyricsStore = raw ? JSON.parse(raw) : {};
      if (!state.lyricsStore || typeof state.lyricsStore !== 'object') state.lyricsStore = {};
    } catch (error) { state.lyricsStore = {}; }
  }

  function saveLyricsStore() {
    try { window.localStorage.setItem('musica-space-lyrics-chords', JSON.stringify(state.lyricsStore)); }
    catch (error) { showToast('Penyimpanan lokal tidak tersedia di browser ini.'); }
  }

  function getSongLyrics(song) {
    if (!song) return '';
    if (typeof state.lyricsStore[song.id] === 'string') return state.lyricsStore[song.id];
    if (typeof song.lyrics === 'string') return song.lyrics;
    return '';
  }

  function parseChordLyricLine(line, offset) {
    const source = String(line || '');
    const tokens = [];
    const regex = /\[([^\]]+)\]/g;
    let match;
    let cursor = 0;
    let text = '';
    while ((match = regex.exec(source))) {
      text += source.slice(cursor, match.index);
      tokens.push({ chord: transposeChordSymbol(match[1], offset), textIndex: text.length });
      cursor = regex.lastIndex;
    }
    text += source.slice(cursor);
    if (!tokens.length) return { chordLine: '', textLine: text };
    let chordLine = '';
    let chordCursor = 0;
    tokens.forEach(token => {
      chordLine += ' '.repeat(Math.max(0, token.textIndex - chordCursor)) + token.chord;
      chordCursor = token.textIndex;
    });
    return { chordLine, textLine: text };
  }

  function renderChordLyrics(rawLyrics, offset) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chord-lyrics';
    const blocks = String(rawLyrics || '').trim().split(/\n\s*\n/).filter(Boolean);
    blocks.forEach((block, blockIndex) => {
      const section = document.createElement('div');
      section.className = 'lyric-block';
      const label = document.createElement('div');
      label.className = 'lyric-section-label';
      label.textContent = blockIndex === 0 ? 'Lyrics & Chords' : 'Next section';
      section.appendChild(label);
      block.split('\n').forEach(line => {
        const parsed = parseChordLyricLine(line, offset);
        const row = document.createElement('div');
        row.className = 'lyric-row';
        const chordLine = document.createElement('div');
        chordLine.className = 'lyric-chord-line';
        chordLine.textContent = parsed.chordLine;
        const textLine = document.createElement('div');
        textLine.className = 'lyric-text-line';
        textLine.textContent = parsed.textLine;
        row.appendChild(chordLine);
        row.appendChild(textLine);
        section.appendChild(row);
      });
      wrapper.appendChild(section);
    });
    return wrapper;
  }

  function syncLyricsEditor(song) {
    const input = $('#lyricsChordInput');
    const status = $('#lyricsSaveStatus');
    const value = getSongLyrics(song);
    if (input) input.value = value;
    if (status) status.textContent = value ? 'Tersimpan di perangkat ini' : '';
  }
  function romanToChord(token, targetRoot, mode) {
    const text = String(token || '').replace(/[()]/g, '').trim();
    const match = text.match(/^([b#]*)([ivIV]+)(.*)$/);
    if (!match) return text;
    const accidentalText = match[1] || '';
    const roman = match[2];
    const suffixText = match[3] || '';
    const upper = roman.toUpperCase();
    const degree = romanDegrees[upper];
    if (typeof degree !== 'number') return text;
    const scale = mode === 'minor' ? chordMinorScale : chordMajorScale;
    const accidental = (accidentalText.match(/b/g) || []).length * -1 + (accidentalText.match(/#/g) || []).length;
    const pitch = pitchFromKey(targetRoot) + scale[degree] + accidental;
    let suffix = suffixText;
    if (!suffix) suffix = roman === upper ? '' : 'm';
    else if (roman !== upper && suffix.indexOf('m') !== 0 && suffix.indexOf('maj') !== 0) suffix = 'm' + suffix;
    return preferredChordRoot(pitch) + suffix;
  }
  function renderChordSections(song, targetKey) {
    const target = $('#chordSections');
    if (!target) return;
    const offset = pitchFromKey(targetKey) - pitchFromKey(song.key);
    const sections = song.section_patterns && Object.keys(song.section_patterns).length
      ? song.section_patterns
      : { main_loop: song.core_progression || [] };
    target.innerHTML = '';
    const rawLyrics = getSongLyrics(song);
    if (rawLyrics) {
      target.appendChild(renderChordLyrics(rawLyrics, offset));
      return;
    }
    Object.keys(sections).forEach(sectionName => {
      const sourceChords = Array.isArray(sections[sectionName]) ? sections[sectionName] : [];
      const chords = sourceChords.map(chord => transposeChordSymbol(chord, offset));
      const wrapper = document.createElement('article');
      wrapper.className = 'chord-section';
      wrapper.innerHTML = '<h3></h3><div class="chord-line"></div>';
      const heading = wrapper.querySelector('h3');
      const line = wrapper.querySelector('.chord-line');
      if (heading) heading.textContent = sectionName.replace(/_/g, ' ');
      chords.forEach(chord => {
        const chip = document.createElement('span');
        chip.className = 'chord-chip';
        chip.textContent = chord;
        if (line) line.appendChild(chip);
      });
      target.appendChild(wrapper);
    });
    const empty = document.createElement('div');
    empty.className = 'lyrics-empty';
    empty.innerHTML = '<strong>Belum ada lirik untuk lagu ini</strong><span>Tekan “Tambahkan atau edit lirik + chord” di atas untuk membuat chord-sheet seperti situs chord biasa.</span>';
    target.appendChild(empty);
  }
  function renderChordDetail(id) {
    const song = state.chordCatalog.find(item => item.id === id);
    if (!song) {
      const title = $('#chordDetailTitle');
      if (title) title.textContent = 'Pilih lagu dari Chord Library';
      return;
    }
    const title = $('#chordDetailTitle');
    const artist = $('#chordDetailArtist');
    const original = $('#chordDetailKey');
    const current = $('#chordDetailCurrentKey');
    const difficulty = $('#chordDetailDifficulty');
    const select = $('#chordTransposeKey');
    const targetKey = state.chordTargetKey || song.key;
    state.chordTargetKey = targetKey;
    if (title) title.textContent = song.title;
    if (artist) artist.textContent = (song.artist || 'Unknown artist') + ' · ' + (song.chart_year || 'Top chart');
    if (original) original.textContent = 'Original key: ' + song.key + (song.mode === 'minor' ? ' minor' : ' major');
    if (current) current.textContent = 'Key: ' + targetKey + (song.mode === 'minor' ? ' minor' : ' major');
    if (difficulty) difficulty.textContent = song.difficulty ? ' · ' + song.difficulty : '';
    if (select) {
      const options = chordTargetOptions(song);
      select.innerHTML = '';
      options.forEach(option => {
        const el = document.createElement('option');
        el.value = option;
        el.textContent = option + (song.mode === 'minor' ? ' minor' : ' major');
        el.selected = option === targetKey;
        select.appendChild(el);
      });
    }
    syncLyricsEditor(song);
    renderChordSections(song, targetKey);
    const status = $('#chordTransposeStatus');
    if (status) status.textContent = targetKey === song.key ? 'Original key' : 'Transposed from ' + song.key;
  }
  function moveChordTranspose(step) {
    const song = state.chordCatalog.find(item => item.id === state.activeChordId);
    if (!song) return;
    const options = chordTargetOptions(song);
    const current = options.indexOf(state.chordTargetKey || song.key);
    const next = options[(Math.max(0, current) + step + options.length) % options.length];
    state.chordTargetKey = next;
    renderChordDetail(song.id);
  }
  function setupChordDetail() {
    const select = $('#chordTransposeKey');
    if (select) select.addEventListener('change', () => {
      state.chordTargetKey = select.value;
      renderChordDetail(state.activeChordId);
    });
    const down = $('#chordTransposeDown');
    if (down) down.addEventListener('click', () => moveChordTranspose(-1));
    const up = $('#chordTransposeUp');
    if (up) up.addEventListener('click', () => moveChordTranspose(1));
    const save = $('#saveLyricsChord');
    if (save) save.addEventListener('click', () => {
      const song = state.chordCatalog.find(item => item.id === state.activeChordId);
      const input = $('#lyricsChordInput');
      if (!song || !input) return;
      const value = input.value.trim();
      if (value) state.lyricsStore[song.id] = value;
      else delete state.lyricsStore[song.id];
      saveLyricsStore();
      renderChordDetail(song.id);
      const editor = $('#lyricsEditor');
      if (editor) editor.open = false;
      showToast(value ? 'Chord-sheet tersimpan di perangkat ini.' : 'Chord-sheet dikosongkan.');
    });
    const clear = $('#clearLyricsChord');
    if (clear) clear.addEventListener('click', () => {
      const song = state.chordCatalog.find(item => item.id === state.activeChordId);
      if (!song) return;
      delete state.lyricsStore[song.id];
      saveLyricsStore();
      renderChordDetail(song.id);
      showToast('Data lirik lagu ini dihapus dari perangkat.');
    });
  }
  function openCatalogSong(id) {
    state.activeChordId = id;
    state.chordTargetKey = null;
    showView('chordDetail');
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
      const catalogSong = event.target.closest('[data-catalog-song]');
      if (catalogSong) { openCatalogSong(catalogSong.dataset.catalogSong); return; }
      const chordOpen = event.target.closest('[data-chord-open]');
      if (chordOpen) { showView('pianoVisualizer'); initPiano(); applyChord(chordOpen.dataset.chord); return; }
      const song = event.target.closest('[data-song]');
      if (song) { playSongById(song.dataset.song); return; }
      const action = event.target.closest('[data-action]');
      if (action) { const type = action.dataset.action; if (type === 'menu') { const app = document.querySelector('.app'); if (app) app.classList.toggle('menu-open'); return; } if (type === 'catalogPiano') { showView('pianoVisualizer'); return; } if (type === 'pro') showToast('Pro preview segera hadir.'); if (type === 'notify') showToast('Tidak ada notifikasi baru.'); if (type === 'profile') showToast('Profile Faza · Free plan'); if (type === 'theme') document.body.classList.toggle('bright'); if (type === 'newPlaylist') showToast('Playlist baru siap dibuat.'); if (type === 'randomChord') showToast('Coba Cmaj7 di piano visualizer.'); if (type === 'like') persistFavorite(state.currentSong); if (type === 'copyTonal') { const text = ($('#tonalSummary') && $('#tonalSummary').textContent) || 'No tonal result'; if (navigator.clipboard) navigator.clipboard.writeText(text); showToast('Hasil analisis disalin.'); } if (type === 'openTonalPiano') { showView('pianoVisualizer'); showToast('Piano dibuka untuk latihan tonal.'); } if (type === 'resetTonal') resetTonalAnalysis(); if (type === 'copyTonal') { const text = ($('#tonalSummary') && $('#tonalSummary').textContent) || 'No tonal result'; if (navigator.clipboard) navigator.clipboard.writeText(text); showToast('Hasil analisis disalin.'); } if (type === 'openTonalPiano') { showView('pianoVisualizer'); showToast('Piano dibuka untuk latihan tonal.'); } if (type === 'resetTonal') resetTonalAnalysis(); }
    });
    document.addEventListener('keydown', event => {
      const editing = ['INPUT','SELECT','TEXTAREA'].indexOf(document.activeElement.tagName) >= 0;
      if (event.code === 'Space' && state.view === 'pianoVisualizer' && !editing) {
        event.preventDefault();
        if (!event.repeat) toggleSustain(true);
        return;
      }
      if (event.key === 'Escape') stopSong();
      if (state.view !== 'pianoVisualizer' || editing) return;
      const keyName = event.key.toLowerCase();
      const index = keyboardHotkeys.indexOf(keyName);
      if (index >= 0) {
        event.preventDefault();
        if (state.heldHotkeys.has(keyName)) return;
        state.heldHotkeys.add(keyName);
        triggerKey(pianoHotkeyStart + index, true, 0.88);
      }
    });
    document.addEventListener('keyup', event => {
      if (event.code === 'Space') {
        if (state.view === 'pianoVisualizer') event.preventDefault();
        toggleSustain(false);
        return;
      }
      const keyName = event.key.toLowerCase();
      const index = keyboardHotkeys.indexOf(keyName);
      if (index >= 0 && state.heldHotkeys.has(keyName)) {
        state.heldHotkeys.delete(keyName);
        releaseKey(pianoHotkeyStart + index);
      }
    });

  }

  replaceIcons();
  loadLyricsStore();
  renderCards();
  setupChordLibrary();
  setupChordDetail();
  renderChartCards();
  setupSongPlayer();
  setupTonalAnalyzer();
  setupAuth();
  setupMetronome();
  setupTranspose();
  setupAssistant();
  bindEvents();
  initPiano();
  window.addEventListener('hashchange', () => showView(viewFromLocation(), { fromRoute:true }));
  showView(viewFromLocation(), { replace:true });
  const ready = $('#toolFeedback');
  if (ready) ready.textContent = 'Semua modul siap. Navigasi dan tombol aktif.';
})();
