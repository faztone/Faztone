(() => {
  const style = document.createElement('style');
  style.textContent = `
    .visualizer-card{padding:16px!important;background:linear-gradient(145deg,#0d1c35,#071324)!important}
    .viz-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
    .viz-head b{display:block;font-size:16px;letter-spacing:.01em}
    .viz-head span:not(.live-chip){display:block;color:#7891b3;font-size:11px;margin-top:2px}
    .viz-head-actions{display:flex;align-items:center;gap:8px}
    .live-chip{display:inline-flex!important;align-items:center;gap:5px;color:#5ce6bd!important;background:#113d3d;border:1px solid #286e68;border-radius:99px;padding:5px 8px;font-size:10px!important;font-weight:800;letter-spacing:.08em}
    .live-chip i{width:6px;height:6px;border-radius:50%;background:#35dfad;box-shadow:0 0 8px #35dfad}
    .viz-clear,.viz-pause{border:1px solid #234a78;border-radius:7px;color:#a9c6ff;background:#102747;padding:6px 9px;font-size:11px}
    .viz-toolbar{display:flex;align-items:center;gap:18px;margin:14px 0 10px;color:#7891b3;font-size:11px}
    .viz-toolbar strong{color:#eaf2ff;margin-left:4px}
    .viz-toolbar button{margin-left:auto}
    .visualizer-shell{position:relative;overflow:hidden;border:1px solid #1d4271;border-radius:10px;background:#071326;box-shadow:inset 0 0 34px rgba(35,91,165,.15)}
    #pianoCanvas{display:block;width:100%;height:230px;border:0;border-radius:0;background:transparent}
    .keyboard-line{position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#36d9ff,#e96dff,#36d9ff,transparent);box-shadow:0 0 13px #36d9ff}
    .piano-wrap{position:relative;margin-top:10px;padding:0 1px}
    .piano{position:relative;display:flex;height:116px;overflow:visible;border:1px solid #486687;border-radius:0 0 8px 8px;background:#0b1730;box-shadow:0 8px 20px rgba(0,0,0,.2)}
    .piano-key{font:inherit;position:relative;border:0;cursor:pointer;transition:background .08s,box-shadow .08s,transform .08s}
    .piano-key.white{z-index:1;flex:1;min-width:0;margin:0 1px;background:linear-gradient(180deg,#f8fbff 0%,#cfdcf2 84%,#8fa5c7 100%);border:1px solid #7289ad;border-top:0;border-radius:0 0 6px 6px;box-shadow:inset 0 -9px 12px rgba(56,84,130,.28)}
    .piano-key.white span{position:absolute;bottom:6px;left:0;right:0;color:#526c91;font-size:9px;font-weight:700;opacity:.8}
    .piano-key.black{position:absolute;z-index:3;top:0;width:5.1%;height:72%;transform:translateX(-50%);background:linear-gradient(180deg,#263e71,#070c1c 78%);border:1px solid #5275ba;border-top:0;border-radius:0 0 5px 5px;box-shadow:0 6px 9px rgba(0,0,0,.55),inset 0 -6px 7px rgba(109,91,255,.22)}
    .piano-key.active{background:linear-gradient(180deg,#e96dff,#7d6bff)!important;box-shadow:0 0 20px rgba(233,109,255,.75),inset 0 -12px 12px rgba(34,17,90,.35)!important;transform:translateY(2px)}
    .piano-key.black.active{transform:translate(-50%,2px)}
    .interactive-label{font-size:12px!important;margin-top:12px!important;color:#36d9ff!important}
    .note-readout{margin-top:7px!important;color:#9bb4d5!important;font-size:12px!important}
    @media(max-width:650px){.visualizer-card{padding:14px!important}.viz-head b{font-size:15px}.viz-head span:not(.live-chip){font-size:10px}.viz-clear{display:none}.viz-toolbar{margin-top:11px}.visualizer-shell #pianoCanvas{height:190px}.piano{height:104px}.piano-key.white span{font-size:8px}.piano-key.black{width:5.8%}}
  `;
  document.head.appendChild(style);
  const card = document.querySelector('.visualizer-card');
  if (!card) return;

  card.innerHTML = `
    <div class="viz-head">
      <div>
        <b>Piano visualizer</b>
        <span>Live note playground</span>
      </div>
      <div class="viz-head-actions"><span class="live-chip"><i></i> LIVE</span><button class="viz-clear" id="clearPiano" type="button">Clear</button></div>
    </div>
    <div class="viz-toolbar">
      <span>Key <strong id="vizKey">C</strong></span>
      <span>Notes <strong id="noteCount">0</strong></span>
      <button class="viz-pause" id="toggleViz" type="button">Pause</button>
    </div>
    <div class="visualizer-shell"><canvas id="pianoCanvas" width="1000" height="230" aria-label="Live piano note visualizer"></canvas><div class="keyboard-line"></div></div>
    <div class="piano-wrap"><div class="piano" id="pianoInteractive" role="group" aria-label="Interactive piano"></div></div>
    <div class="interactive-label">Click a key or use A S D F G H J K</div>
    <div class="note-readout" id="noteReadout">Ready to play · C4</div>
  `;

  const piano = document.getElementById('pianoInteractive');
  const canvas = document.getElementById('pianoCanvas');
  const ctx = canvas.getContext('2d');
  const readout = document.getElementById('noteReadout');
  const noteCount = document.getElementById('noteCount');
  const vizKey = document.getElementById('vizKey');
  const noteNames = ['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4','C5','C#5','D5','D#5','E5','F5','F#5','G5','G#5','A5','A#5','B5','C6'];
  const bindings = ['a','w','s','e','d','f','t','g','y','h','u','j','k','o','l','p',';','z','3','x','4','c','5','v','b'];
  const blackNotes = new Set(['C#','D#','F#','G#','A#']);
  const whiteTotal = noteNames.filter(n => !n.includes('#')).length;
  let whiteIndex = 0;
  const positions = noteNames.map(note => {
    if (!note.includes('#')) return { white: whiteIndex++ };
    return { white: whiteIndex };
  });

  piano.innerHTML = noteNames.map((note, index) => {
    const black = note.includes('#');
    const style = black ? `style="left:${(positions[index].white / whiteTotal) * 100}%"` : '';
    return `<button class="piano-key ${black ? 'black' : 'white'}" ${style} data-index="${index}" data-note="${note}" data-key="${bindings[index]}" aria-label="${note}, keyboard ${bindings[index].toUpperCase()}"><span>${black ? '' : note}</span></button>`;
  }).join('');

  let audioContext;
  let paused = false;
  let events = [];
  let raf;
  let count = 0;
  const colors = ['#36d9ff', '#7d6bff', '#e96dff', '#36dfae'];

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function frequency(index) {
    const midi = 60 + index;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function playTone(index) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    audioContext ||= new AudioCtor();
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency(index);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.17, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.64);
  }

  function playKey(index) {
    const key = piano.querySelector(`[data-index="${index}"]`);
    if (!key) return;
    key.classList.add('active');
    window.setTimeout(() => key.classList.remove('active'), 180);
    const note = noteNames[index];
    const root = note.replace(/[0-9]/g, '').replace('#', '♯');
    vizKey.textContent = root;
    readout.textContent = `Playing · ${note} · key ${bindings[index].toUpperCase()}`;
    count += 1;
    noteCount.textContent = count;
    events.push({ index, born: performance.now(), color: colors[index % colors.length] });
    if (events.length > 34) events.shift();
    playTone(index);
  }

  piano.querySelectorAll('.piano-key').forEach(key => {
    key.addEventListener('click', () => playKey(Number(key.dataset.index)));
  });

  document.addEventListener('keydown', event => {
    if (event.repeat) return;
    const index = bindings.indexOf(event.key.toLowerCase());
    if (index >= 0 && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      playKey(index);
    }
  });

  document.getElementById('clearPiano').onclick = () => {
    events = [];
    count = 0;
    noteCount.textContent = '0';
    vizKey.textContent = 'C';
    readout.textContent = 'Ready to play · C4';
  };

  document.getElementById('toggleViz').onclick = event => {
    paused = !paused;
    event.currentTarget.textContent = paused ? 'Resume' : 'Pause';
  };

  function draw(now) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0b2341');
    gradient.addColorStop(1, '#071225');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(79, 130, 205, .16)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += Math.max(42, width / 14)) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 28; y < height; y += 42) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(168, 199, 238, .68)';
    ctx.fillText('LIVE NOTES', 14, 22);
    if (!paused) {
      events = events.filter(item => now - item.born < 5600);
      events.forEach(item => {
        const age = now - item.born;
        const progress = age / 5600;
        const x = ((item.index + .5) / noteNames.length) * width;
        const y = progress * (height - 36) - 32;
        const noteWidth = Math.max(14, width / 28);
        const glow = ctx.createLinearGradient(0, y, 0, y + 80);
        glow.addColorStop(0, item.color);
        glow.addColorStop(1, 'rgba(54, 217, 255, .04)');
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = glow;
        ctx.fillRect(x - noteWidth / 2, y, noteWidth, 76);
        ctx.shadowBlur = 0;
      });
    }
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  raf = requestAnimationFrame(draw);
})();
