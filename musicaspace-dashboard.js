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
  const iconPaths = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-6h6v6"/>',
    library:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>',
    shuffle:'<path d="M3 6h3c4 0 5 8 9 8h6"/><path d="m18 11 3 3-3 3"/><path d="M3 18h3c1.5 0 2.5-.8 3.3-2"/><path d="M15.7 8C16.5 6.8 17.4 6 19 6h2"/><path d="m18 3 3 3-3 3"/>',
    search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    sparkle:'<path d="m12 3-1.4 5.6L5 10l5.6 1.4L12 17l1.4-5.6L19 10l-5.6-1.4Z"/><path d="m19 16-.6 2.4L16 19l2.4.6L19 22l.6-2.4L22 19l-2.4-.6Z"/>',
    tonal:'<circle cx="12" cy="12" r="8.5"/><path d="M6 12h2l1.2-4 3.2 8 1.4-4H18"/>',
    metronome:'<path d="m6 20 4-16h4l4 16"/><path d="M5 20h14M12 7l5 5M16 4h3"/>',
    tools:'<path d="m14.5 6.5 3-3a4 4 0 0 0 0 5.7l-8.3 8.3a2.2 2.2 0 1 1-3.1-3.1l8.3-8.3Z"/><path d="m13 8 3 3"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
    playlist:'<path d="M4 6h11M4 11h11M4 16h7"/><path d="M17 13v6l3-1.5"/><circle cx="17" cy="20" r="1.5"/>',
    practice:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    community:'<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M15 16a4.5 4.5 0 0 1 5.5 4"/>',
    grid:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6Z"/>',
    play:'<path d="m9 6 9 6-9 6Z" fill="currentColor" stroke="none"/>',
    pause:'<path d="M8 6v12M16 6v12"/>',
    previous:'<path d="m17 5-7 7 7 7M7 5v14"/>',
    next:'<path d="m7 5 7 7-7 7M17 5v14"/>',
    repeat:'<path d="M4 7h13l-3-3M20 17H7l3 3"/><path d="M17 7a4 4 0 0 1 3 4M7 17a4 4 0 0 1-3-4"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    tour:'<circle cx="12" cy="12" r="9"/><path d="m10 8 5 4-5 4Z" fill="currentColor" stroke="none"/>',
    crown:'<path d="m3 7 4 4 5-7 5 7 4-4-2 12H5Z"/><path d="M5 16h14"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    activity:'<path d="M4 16h3l2-8 3 12 2-8h6"/>',
    piano:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 5v14M12 5v14M16 5v14M6 14h2M10 14h2M14 14h2M18 14h-1"/>',
    music:'<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
    bookmark:'<path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4Z"/>',
    heart:'<path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"/>',
    more:'<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>'
  };
  const iconSvg = (name, extra='') => `<svg class="ui-icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.grid}</svg>`;
  const viewIcons = {home:'home',library:'library',progressions:'shuffle',finder:'search',assistant:'sparkle',tonal:'tonal',metronome:'metronome',tools:'tools',mylibrary:'folder',playlists:'playlist',practice:'practice',community:'community'};
  $$('.nav-btn').forEach(button => { const target=button.querySelector('.nav-icon'); if (target) target.innerHTML=iconSvg(viewIcons[button.dataset.view]); });
  const brandMark = $('.brand-mark'); if (brandMark) brandMark.innerHTML=iconSvg('music');
  const searchSymbol = $('.search-symbol'); if (searchSymbol) searchSymbol.innerHTML=iconSvg('search');
  const notificationButton = $('#notificationBtn'); if (notificationButton) notificationButton.innerHTML=`${iconSvg('bell')}<i class="dot"></i>`;
  const themeButton = $('#themeBtn'); if (themeButton) themeButton.innerHTML=iconSvg('sun');
  $$('.quick-icon').forEach(target => { const view=target.closest('[data-view]')?.dataset.view; target.innerHTML=iconSvg(view === 'tools' ? 'piano' : viewIcons[view]); });
  $$('.tool-icon').forEach(target => { const label=target.closest('.tool-card')?.textContent || ''; target.innerHTML=iconSvg(/piano/i.test(label) ? 'piano' : /scale/i.test(label) ? 'grid' : /chord/i.test(label) ? 'library' : 'music'); });
  $$('.activity-icon').forEach(target => { target.innerHTML=iconSvg(target.textContent.includes('◷') ? 'clock' : target.textContent.includes('♫') ? 'music' : 'bolt'); });
  $$('.hero-stat i').forEach((target,index) => { target.innerHTML=iconSvg(['music','play','grid','community'][index]); });
  $$('.section-title i').forEach(target => { target.innerHTML=iconSvg('bolt'); });
  $$('.panel-head strong').forEach(target => { const label=target.textContent; const name=label.includes('RECENT')?'music':label.includes('SAVED')?'bookmark':label.includes('PIANO')?'piano':label.includes('ACTIVITY')?'activity':label.includes('Now')?'play':'grid'; target.innerHTML=`${iconSvg(name)}<span>${label.replace(/^[^A-Za-z]+/, '').replace(/&nbsp;/g,'').trim()}</span>`; });
  const heroPrimary = $('.hero-actions .primary'); if (heroPrimary) heroPrimary.innerHTML=`${iconSvg('plus')}<span>Create New Project</span>`;
  const heroTour = $('#watchTour'); if (heroTour) heroTour.innerHTML=`${iconSvg('tour')}<span>Watch Tour</span>`;
  $$('.round-arrow').forEach(target => target.innerHTML=iconSvg('chevron'));
  $$('.heart').forEach(target => target.innerHTML=iconSvg('heart'));
  $$('.player-controls .control-btn').forEach((target,index) => { target.innerHTML=iconSvg(['shuffle','previous','next','repeat'][index === 0 ? 0 : index === 1 ? 1 : index === 2 ? 2 : 3]); });
  const playButton = $('#playBtn'); if (playButton) playButton.innerHTML=iconSvg('play');

  let songs = [
    {title:'BbY WOW',artist:'Karol G, Judeline & rusowsky',key:'B♭',bpm:104,cover:'cover',chartRank:1,search:'BbY WOW Karol G'},
    {title:"Choosin' Texas",artist:'Ella Langley',key:'E',bpm:92,cover:'ocean',chartRank:2,search:"Choosin' Texas Ella Langley"},
    {title:'Nicole Kidman',artist:'Adéla',key:'F♯',bpm:118,cover:'falling',chartRank:3,search:'Nicole Kidman Adéla'},
    {title:'Training Season',artist:'Dua Lipa',key:'B minor',bpm:117,cover:'green',chartRank:4,search:'Training Season Dua Lipa'},
    {title:"Ain't In LA",artist:'Adéla',key:'C♯ minor',bpm:108,cover:'adele',chartRank:5,search:"Ain't In LA Adéla"},
    {title:'Dracula',artist:'Tame Impala & JENNIE',key:'E♭ minor',bpm:106,cover:'cover',chartRank:6,search:'Dracula Tame Impala Jennie'},
    {title:'Hate That I Made You Love Me',artist:'Ariana Grande',key:'A♭',bpm:84,cover:'ocean',chartRank:7,search:'Hate That I Made You Love Me Ariana Grande'},
    {title:'So Easy (To Fall In Love)',artist:'Olivia Dean',key:'C',bpm:96,cover:'falling',chartRank:8,search:'So Easy To Fall In Love Olivia Dean'},
    {title:'Man I Need',artist:'Olivia Dean',key:'G',bpm:100,cover:'green',chartRank:9,search:'Man I Need Olivia Dean'},
    {title:'Be Her',artist:'Ella Langley',key:'D',bpm:76,cover:'adele',chartRank:10,search:'Be Her Ella Langley'}
  ];
  songs = songs.map(song => ({genre:'Pop', ...song}));
  const favoriteTitles = new Set(JSON.parse(localStorage.getItem('musicaspace-favorites') || '[]'));
  const saveFavorites = () => localStorage.setItem('musicaspace-favorites', JSON.stringify([...favoriteTitles]));
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

  const songMarkup = (song,index) => `<div class="song-row"><button class="play-small" data-song-play="${index}" aria-label="Play ${song.title}">${iconSvg('play')}</button><div class="cover ${song.cover}">${song.chartRank ? `#${song.chartRank}` : '♪'}</div><div class="song-meta"><strong>${song.title}</strong><small>${song.artist}</small></div><span class="song-key">${song.key}</span><span class="song-bpm">${song.bpm} BPM</span><button class="heart ${favoriteTitles.has(song.title) ? '' : 'off'}" data-favorite="${index}" aria-label="Favorite ${song.title}">${iconSvg('heart')}</button><button class="more" aria-label="More options">${iconSvg('more')}</button></div>`;
  const renderRecentSongs = () => { $('#recentSongs').innerHTML = songs.slice(0,5).map(songMarkup).join(''); };
  renderRecentSongs();
  const progressionMarkup = item => `<div class="progress-row"><button class="play-small" data-progression="${item.title}">${iconSvg('play')}</button><div class="progress-meta"><strong>${item.title}</strong><small>${item.chords}</small></div><span class="tag ${item.className}">${item.tag}</span><button class="more">${iconSvg('more')}</button></div>`;
  const renderSavedProgressions = () => { const target = $('#savedProgressions'); if (target) target.innerHTML = progressions.map(progressionMarkup).join(''); };
  renderSavedProgressions();

  const libraryMarkup = (song,index) => `<div class="mini-card"><button class="play-small" data-song-play="${index}" aria-label="Play ${song.title}">${iconSvg('play')}</button><div class="cover ${song.cover}">${song.chartRank ? `#${song.chartRank}` : '♪'}</div><div style="min-width:0;flex:1"><h3>${song.title}</h3><p>${song.artist} · Key ${song.key} · ${song.bpm} BPM</p></div><button class="heart ${favoriteTitles.has(song.title) ? '' : 'off'}" data-favorite="${index}" aria-label="Favorite ${song.title}">${iconSvg('heart')}</button></div>`;
  const renderLibrary = () => {
    const query = ($('#librarySearch')?.value || '').toLowerCase();
    const genre = $('#genreFilter')?.value || 'all';
    const filtered = songs.map((song,index) => ({song,index})).filter(({song}) => `${song.title} ${song.artist}`.toLowerCase().includes(query) && (genre === 'all' || song.genre === genre));
    $('#libraryGrid').innerHTML = filtered.length ? filtered.map(({song,index}) => libraryMarkup(song,index)).join('') : '<div class="not-found" style="grid-column:1/-1">No songs found. Try another search.</div>';
  };
  renderLibrary();
  $('#librarySearch').addEventListener('input', renderLibrary);
  $('#genreFilter').addEventListener('change', renderLibrary);
  const renderMyLibrary = () => {
    const favorites = songs.map((song,index) => ({song,index})).filter(({song}) => favoriteTitles.has(song.title));
    $('#favoritesList').innerHTML = favorites.length ? favorites.map(({song,index}) => `<button class="feature-button" data-song-play="${index}"><span class="cover ${song.cover}" style="width:32px;height:32px;flex-basis:32px">${iconSvg('play')}</span><span><strong>${song.title}</strong><small>${song.artist} · Key ${song.key} · ${song.bpm} BPM</small></span><span>♥</span></button>`).join('') : '<div class="not-found">Belum ada favorit. Tekan ♥ pada lagu untuk menyimpannya.</div>';
    $('#favoriteCount').textContent = favorites.length;
  };
  renderMyLibrary();

  const renderProgressionPage = () => {
    $('#progressionPageList').innerHTML = progressions.map(item => `<div class="feature-button progression-open" data-title="${item.title}"><button class="play-small" data-progression="${item.title}">${iconSvg('play')}</button><span><strong>${item.title}</strong><small>${item.chords}</small></span><span class="tag ${item.className}">${item.tag}</span></div>`).join('');
  };
  renderProgressionPage();
  document.addEventListener('click', event => {
    const songIndex = event.target.closest('[data-song-play]')?.dataset.songPlay;
    if (songIndex !== undefined) playSong(Number(songIndex));
    const playlistButton = event.target.closest('.playlist-open');
    if (playlistButton) { const title=playlistButton.closest('.big-panel')?.querySelector('h2')?.textContent || 'Playlist'; showView('library'); $('#librarySearch').value=''; renderLibrary(); toast(`Opening playlist · ${title}`); }
    const progression = event.target.closest('[data-progression]')?.dataset.progression;
    if (progression) {
      const item = progressions.find(entry => entry.title === progression);
      if (item) {
        selectedProgression = item;
        progressionShift = 0;
        renderProgressionEditor();
        $('#progressionTempo').textContent = item.tempo || 92;
        playProgression(item);
      }
    }
    const favoriteIndex = event.target.closest('[data-favorite]')?.dataset.favorite;
    if (favoriteIndex !== undefined) {
      const song = songs[Number(favoriteIndex)];
      if (song) { favoriteTitles.has(song.title) ? favoriteTitles.delete(song.title) : favoriteTitles.add(song.title); saveFavorites(); renderRecentSongs(); renderLibrary(); renderMyLibrary(); toast(favoriteTitles.has(song.title) ? `Saved · ${song.title}` : `Removed · ${song.title}`); }
      return;
    }
    const favorite = event.target.closest('.heart');
    if (favorite) { favorite.classList.toggle('off'); favorite.innerHTML = iconSvg('heart'); toast(favorite.classList.contains('off') ? 'Removed from favorites' : 'Added to favorites'); }
  });

  const waveform = $('#waveform');
  for (let i=0;i<72;i++) { const bar=document.createElement('b'); bar.style.height=`${12 + ((i*17)%48)}%`; waveform.appendChild(bar); }
  const audioPreview = $('#audioPreview');
  let currentSongIndex = 0;
  let playing = false;
  let playerSeconds = 0;
  const formatTime = value => `${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`;
  const setPlayerUI = () => {
    const song = songs[currentSongIndex];
    if (!song) return;
    $('#playerTitle').textContent = song.title;
    $('#playerArtist').textContent = `${song.artist} · Chart #${song.chartRank || '—'}`;
    $('#playerCover').className = `cover ${song.cover}`;
    $('#playerCover').textContent = song.chartRank ? `#${song.chartRank}` : '♫';
    $('#playerTime').textContent = formatTime(audioPreview?.currentTime || playerSeconds);
    $('#playerDuration').textContent = formatTime(audioPreview?.duration || 30);
    $('#playBtn').innerHTML = iconSvg(playing ? 'pause' : 'play');
    waveform.classList.toggle('playing', playing);
  };
  const fetchPreview = async song => {
    if (song.previewUrl) return song.previewUrl;
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(song.search || `${song.title} ${song.artist}`)}&entity=song&limit=1&country=US`);
    if (!response.ok) throw new Error('Preview service unavailable');
    const result = await response.json();
    const match = result.results?.[0];
    song.previewUrl = match?.previewUrl || '';
    return song.previewUrl;
  };
  const playSong = async index => {
    currentSongIndex = (index + songs.length) % songs.length;
    const song = songs[currentSongIndex];
    setPlayerUI();
    try {
      if (!song.previewUrl) { toast(`Loading preview · ${song.title}`); await fetchPreview(song); }
      if (!song.previewUrl) throw new Error('Preview not found');
      audioPreview.src = song.previewUrl;
      await audioPreview.play();
      playing = true;
      setPlayerUI();
      toast(`Now playing · ${song.title}`);
    } catch (error) {
      playing = false;
      setPlayerUI();
      toast(`Preview ${song.title} belum tersedia`);
    }
  };
  const stopSong = () => { audioPreview.pause(); playing = false; setPlayerUI(); };
  $('#playBtn').addEventListener('click', () => playing ? stopSong() : playSong(currentSongIndex));
  $('#prevBtn').addEventListener('click', () => playSong(currentSongIndex - 1));
  $('#nextBtn').addEventListener('click', () => playSong(currentSongIndex + 1));
  $('#shuffleBtn').addEventListener('click', () => playSong(Math.floor(Math.random() * songs.length)));
  $('#repeatBtn').addEventListener('click', () => { audioPreview.loop = !audioPreview.loop; toast(audioPreview.loop ? 'Repeat preview on' : 'Repeat preview off'); });
  audioPreview.addEventListener('timeupdate', () => { playerSeconds=audioPreview.currentTime; setPlayerUI(); });
  audioPreview.addEventListener('loadedmetadata', setPlayerUI);
  audioPreview.addEventListener('ended', () => { playing=false; if (!audioPreview.loop) playSong(currentSongIndex + 1); });
  setPlayerUI();
  $('#chartCount').textContent = songs.length;
  Promise.allSettled(songs.map(fetchPreview)).then(results => {
    const ready = results.filter(result => result.status === 'fulfilled' && result.value).length;
    $('#chartStatus').textContent = `${ready}/${songs.length} previews ready · Billboard Global 200`;
    $('#previewCount').textContent = ready ? '30s' : '—';
    setPlayerUI();
  });
  $('#watchTour').addEventListener('click', () => toast('Tour mode is ready for the next update'));
  $('#customizeBtn').addEventListener('click', () => toast('Quick Access layout saved'));
  $('#upgradeBtn').addEventListener('click', () => toast('Pro upgrade flow coming soon'));
  $('#notificationBtn').addEventListener('click', () => toast('No new notifications'));
  $('#themeBtn').addEventListener('click', () => toast('Dark neon theme is active'));
  $('#addSongBtn').addEventListener('click', () => { showView('finder'); $('#finderInput').focus(); toast('Song Finder siap dipakai untuk menambahkan lagu'); });
  $('#newProgressionBtn').addEventListener('click', () => { const item={title:`My Progression ${progressions.length - 4}`,chords:'C · G · Am · F',tag:'Custom',className:'',tempo:92}; progressions.push(item); renderSavedProgressions(); renderProgressionPage(); toast('New progression created · C – G – Am – F'); });
  $('#newPlaylistBtn').addEventListener('click', () => { const card=document.createElement('div'); card.className='big-panel'; card.innerHTML='<h2>My Practice Set</h2><p>0 songs · custom playlist</p><button class="secondary playlist-open">Open playlist</button>'; $('#playlistsGrid').appendChild(card); toast('New playlist created · My Practice Set'); });
  let practiceTimer;
  let practiceRemaining = 45 * 60;
  let practiceRunning = false;
  const updatePracticeTimer = () => { const minutes = Math.floor(practiceRemaining / 60); const seconds = practiceRemaining % 60; $('#practiceTimer').textContent = `${minutes}:${String(seconds).padStart(2,'0')} remaining`; };
  updatePracticeTimer();
  $('#startPractice').addEventListener('click', () => {
    practiceRunning = !practiceRunning;
    clearInterval(practiceTimer);
    if (practiceRunning) {
      $('#sessionState').textContent = 'Active'; $('#startPractice').textContent = 'Pause Session'; toast('Practice session started · 45 min');
      practiceTimer = setInterval(() => { practiceRemaining = Math.max(0, practiceRemaining - 1); updatePracticeTimer(); if (!practiceRemaining) { practiceRunning=false; clearInterval(practiceTimer); $('#sessionState').textContent='Done'; $('#startPractice').textContent='Start Again'; toast('Practice session complete'); } }, 1000);
    } else { $('#sessionState').textContent = 'Paused'; $('#startPractice').textContent = 'Resume Session'; toast('Practice session paused'); }
  });
  $('#joinCircle').addEventListener('click', () => toast('Community circles opened'));

  const finder = query => {
    const q = (query || 'easy music').toLowerCase();
    const results = songs.filter(song => `${song.title} ${song.artist} ${song.key}`.toLowerCase().includes(q) || q.includes('easy') || q.includes('pop'));
    $('#finderResults').innerHTML = results.slice(0,4).map(song => `<button class="feature-button" data-song-play="${songs.indexOf(song)}"><span class="cover ${song.cover}" style="width:32px;height:32px;flex-basis:32px">${iconSvg('play')}</span><span><strong>${song.title}</strong><small>${song.artist} · Key ${song.key} · ${song.bpm} BPM</small></span><span>Play ›</span></button>`).join('') || '<div class="not-found">Belum menemukan lagu yang cocok.</div>';
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
  miniPiano.innerHTML = miniNotes.map((note,index) => `<button class="white" data-note="${note}" data-index="${[0,2,4,5,7,9,11,12][index]}" aria-label="${note}"></button>`).join('') + '<button class="black" style="left:12.5%" data-note="C#" data-index="1"></button><button class="black" style="left:25%" data-note="D#" data-index="3"></button><button class="black" style="left:50%" data-note="F#" data-index="6"></button><button class="black" style="left:62.5%" data-note="G#" data-index="8"></button><button class="black" style="left:75%" data-note="A#" data-index="10"></button>';
  let audioContext;
  let pianoBus;
  let sustainEnabled = false;
  const activePianoVoices = new Set();
  let sustainPedal=null;
  const pianoBuffers = {};
  const pianoLoads = {};
  const pianoSampleNotes = [
    {name:'C2',midi:36},{name:'Ds2',midi:39},{name:'Fs2',midi:42},{name:'A2',midi:45},
    {name:'C3',midi:48},{name:'Ds3',midi:51},{name:'Fs3',midi:54},{name:'A3',midi:57},
    {name:'C4',midi:60},{name:'Ds4',midi:63},{name:'Fs4',midi:66},{name:'A4',midi:69},
    {name:'C5',midi:72},{name:'Ds5',midi:75},{name:'Fs5',midi:78},{name:'A5',midi:81},
    {name:'C6',midi:84},{name:'Ds6',midi:87},{name:'Fs6',midi:90},{name:'A6',midi:93}
  ];
  const setSustain = enabled => {
    sustainEnabled = Boolean(enabled);
    const button = $('#sustainToggle');
    sustainPedal ||= $('#sustainPedal');
    if (button) { button.classList.toggle('on',sustainEnabled); button.setAttribute('aria-pressed',String(sustainEnabled)); button.textContent=sustainEnabled?'♧ Sustain: On':'♧ Sustain: Off'; }
    if (sustainPedal) { sustainPedal.classList.toggle('on',sustainEnabled); sustainPedal.setAttribute('aria-pressed',String(sustainEnabled)); sustainPedal.innerHTML=sustainEnabled?'<strong>♧ SUSTAIN: ON</strong><span>Tap or press Space to release</span>':'<strong>♧ SUSTAIN: OFF</strong><span>Press Space or tap to hold notes</span>'; }
    if (!sustainEnabled) activePianoVoices.forEach(voice => voice.release());
  };
  $('#sustainToggle')?.addEventListener('click',()=>setSustain(!sustainEnabled));
  $('#sustainPedal')?.addEventListener('click',()=>setSustain(!sustainEnabled));
  const loadPianoSample = async sample => {
    if (pianoBuffers[sample.name]) return pianoBuffers[sample.name];
    if (!pianoLoads[sample.name]) {
      pianoLoads[sample.name] = fetch('https://tonejs.github.io/audio/salamander/'+sample.name+'.mp3')
        .then(response => { if (!response.ok) throw new Error('Piano sample unavailable'); return response.arrayBuffer(); })
        .then(data => audioContext.decodeAudioData(data))
        .then(buffer => { pianoBuffers[sample.name]=buffer; return buffer; });
    }
    return pianoLoads[sample.name];
  };
  const ensurePianoOutput = () => {
    if (pianoBus) return;
    pianoBus=audioContext.createDynamicsCompressor();
    pianoBus.threshold.value=-18;
    pianoBus.knee.value=18;
    pianoBus.ratio.value=4;
    pianoBus.attack.value=.003;
    pianoBus.release.value=.24;
    pianoBus.connect(audioContext.destination);
  };
  const playTone = async (noteIndex,duration=1.8) => {
    const Ctor=window.AudioContext||window.webkitAudioContext;
    if (!Ctor) { if ($('#pianoStatus')) $('#pianoStatus').textContent='Browser audio is not supported'; return; }
    audioContext ||= new Ctor();
    ensurePianoOutput();
    if (audioContext.state==='suspended') await audioContext.resume();
    const midi=60+Number(noteIndex||0);
    const sample=pianoSampleNotes.reduce((nearest,current)=>Math.abs(current.midi-midi)<Math.abs(nearest.midi-midi)?current:nearest,pianoSampleNotes[0]);
    try {
      const buffer=await loadPianoSample(sample);
      const source=audioContext.createBufferSource();
      const gain=audioContext.createGain();
      const now=audioContext.currentTime;
      source.buffer=buffer;
      source.playbackRate.value=Math.pow(2,(midi-sample.midi)/12);
      gain.gain.setValueAtTime(.0001,now);
      gain.gain.exponentialRampToValueAtTime(.22,now+.015);
      source.connect(gain).connect(pianoBus);
      let voice=null;
      if (sustainEnabled) {
        voice={released:false,release:()=>{if(voice.released)return;voice.released=true;const releaseAt=audioContext.currentTime;gain.gain.cancelScheduledValues(releaseAt);gain.gain.setValueAtTime(Math.max(.0001,gain.gain.value),releaseAt);gain.gain.exponentialRampToValueAtTime(.0001,releaseAt+.28);try{source.stop(releaseAt+.3);}catch(error){}activePianoVoices.delete(voice);}};
        activePianoVoices.add(voice);
        source.onended=()=>activePianoVoices.delete(voice);
      } else {
        const naturalRelease=Math.max(1.8,duration);
        gain.gain.exponentialRampToValueAtTime(.0001,now+naturalRelease);
      }
      source.start(now);
      if (!sustainEnabled) source.stop(now+Math.min(buffer.duration/source.playbackRate.value,naturalRelease+1.2));
      if ($('#pianoStatus')) $('#pianoStatus').textContent='HQ piano sample · '+sample.name+(sustainEnabled?' · sustain on':'');
    } catch (error) {
      if ($('#pianoStatus')) $('#pianoStatus').textContent='Piano sample gagal dimuat';
      toast('Piano sample gagal dimuat');
    }
  };
  $$('#miniPiano [data-note]').forEach(key => key.addEventListener('click', () => { const index=Number(key.dataset.index||0); key.classList.add('active'); setTimeout(()=>key.classList.remove('active'),180); playTone(index); toast(`Playing ${key.dataset.note}`); }));
  let progressionTimer;
  const playProgression = item => {
    clearInterval(progressionTimer);
    const roots = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
    const notes = item.chords.split(' · ').map(chord => transposeChord(chord, progressionShift).match(/[A-G]/)?.[0]).map(note => roots[note]).filter(note => note !== undefined);
    let position = 0;
    const tick = () => { if (notes.length) playTone(notes[position % notes.length], .55); position += 1; };
    tick(); progressionTimer = setInterval(tick, 60000 / (item.tempo || 92));
    toast(`Playing progression · ${item.title}`);
    setTimeout(() => clearInterval(progressionTimer), Math.max(1, notes.length) * 60000 / (item.tempo || 92));
  };
  $('#widgetKey').addEventListener('change', event => { const key=event.target.value; const map={C:'C · E · G',G:'G · B · D',D:'D · F♯ · A',F:'F · A · C'}; $('#chordDots').textContent=map[key]; });

  let progressionShift = 0;
  let selectedProgression = progressions[0];
  const transposeChord = (chord, amount) => {
    const match = chord.match(/^([A-G])([#♯b♭]?)(.*)$/);
    if (!match) return chord;
    const accidental = match[2] === 'b' ? '♭' : match[2] === '#' ? '♯' : match[2];
    const names = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
    const normalized = `${match[1]}${accidental}`;
    let index = names.indexOf(normalized);
    if (index < 0) {
      const enharmonic = {'D♭':'C♯','G♭':'F♯','A♯':'B♭','E♯':'F','B♯':'C'}[normalized];
      index = names.indexOf(enharmonic || match[1]);
    }
    if (index < 0) return chord;
    return `${names[(index + amount + 120) % 12]}${match[3]}`;
  };
  const renderProgressionEditor = () => {
    const source = selectedProgression?.chords || 'C · Am · F · G';
    const chords = source.split(' · ').map(chord => transposeChord(chord, progressionShift));
    $('#progressionPattern').textContent = chords.join(' – ');
    const root = chords[0].replace(/(maj7|m7|m|7)$/,'');
    $('#progressionKey').textContent = root;
  };
  renderProgressionEditor();
  $('#transposeProgression').addEventListener('click', () => {
    progressionShift = (progressionShift + 1) % 12;
    renderProgressionEditor();
    toast(`Progression transposed +${progressionShift} semitone${progressionShift === 1 ? '' : 's'}`);
  });

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

  const pianoVisualizerPanel = $('#pianoVisualizerView');
  const toolPanel = $('#toolPanel');
  const noteNames = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
  const pianoMinMidi = 48;
  const pianoMaxMidi = 84;
  const midiName = midi => noteNames[midi % 12] + (Math.floor(midi / 12) - 1);
  const practiceSongs = {
    'fur-elise': {name:'Fur Elise · Trial', tempo:112, notes:[76,75,76,75,76,71,74,72,69,60,64,69,71,64,68,71,72,64,76,75,76,75,76,71,74,72,69,60,64,69,71,64,72,71,69,64,76,75,76,75,76,71,74,72,69,60,64,69,71,64,72,71,69]},
    'c-major-warmup': {name:'C Major Warmup', tempo:96, notes:[60,62,64,65,67,69,71,72,71,69,67,65,64,62,60,72,71,69,67,65,64,62,60]}
  };
  let songPracticeRunning=false, songPracticeExpected=null, songPracticeResolved=false, songPracticePosition=0, songPracticeTimer=null, songDemoTimer=null;
  let songScore=0, songHits=0, songMisses=0, songCombo=0;
  const visualizerKeyboard = $('#visualizerKeyboard');
  const visualizerNotes = $('#visualizerNotes');
  const visualizerLastNote = $('#visualizerLastNote');
  const songPracticeFeedback = $('#pianoSongFeedback');
  const songScoreEl = $('#pianoSongScore');
  const songHitsEl = $('#pianoSongHits');
  const songMissesEl = $('#pianoSongMisses');
  const songComboEl = $('#pianoSongCombo');
  const practiceSongSelect = $('#pianoSongSelect');
  const practiceSpeedSelect = $('#pianoSongSpeed');
  const updatePracticeStats = () => { if(songScoreEl) songScoreEl.textContent=songScore; if(songHitsEl) songHitsEl.textContent=songHits; if(songMissesEl) songMissesEl.textContent=songMisses; if(songComboEl) songComboEl.textContent=songCombo; };
  const practiceMessage = (message,kind='') => { if(songPracticeFeedback){songPracticeFeedback.textContent=message;songPracticeFeedback.className='practice-feedback '+kind;} };
  const clearPracticeNotes = () => { if(visualizerNotes) visualizerNotes.innerHTML=''; };
  const noteLeft = midi => ((midi-pianoMinMidi)/(pianoMaxMidi-pianoMinMidi))*100;
  const spawnPracticeNote = (midi,index,beatMs) => { if(!visualizerNotes)return; const note=document.createElement('span'); note.className='note-fall'; note.dataset.practiceIndex=index; note.dataset.midi=midi; note.style.left='calc('+Math.min(98,Math.max(1,noteLeft(midi)))+'% - 10px)'; note.style.width='20px'; note.style.animationDuration=Math.max(1.35,beatMs/1000*1.15)+'s'; visualizerNotes.appendChild(note); setTimeout(()=>note.remove(),Math.max(1500,beatMs*1.35)); };
  const setPianoKeyActive = midi => { const key=visualizerKeyboard?.querySelector('[data-midi="'+midi+'"]'); if(!key)return; key.classList.add('active'); setTimeout(()=>key.classList.remove('active'),220); };
  const renderPracticeKeyboard = () => {
    if(!visualizerKeyboard)return;
    const whites=[], whiteMidi=[];
    for(let midi=pianoMinMidi;midi<=pianoMaxMidi;midi++) if(![1,3,6,8,10].includes(midi%12)){whiteMidi.push(midi);whites.push('<button class="visual-white" data-midi="'+midi+'" data-note-name="'+midiName(midi)+'" type="button"><span>'+midiName(midi)+'</span></button>');}
    const whiteCount=whiteMidi.length, blacks=[];
    for(let midi=pianoMinMidi;midi<=pianoMaxMidi;midi++) if([1,3,6,8,10].includes(midi%12)){const previous=whiteMidi.filter(item=>item<midi).length;const left=((previous-.35)/whiteCount)*100;blacks.push('<button class="visual-black" style="left:'+left+'%;width:'+Math.max(18,Math.round(100/whiteCount*0.62))+'px" data-midi="'+midi+'" data-note-name="'+midiName(midi)+'" type="button"><span>'+midiName(midi)+'</span></button>');}
    visualizerKeyboard.innerHTML=whites.join('')+blacks.join('');
  };
  const triggerPianoKey = key => {
    if(!key)return;
    const midi=Number(key.dataset.midi);
    setPianoKeyActive(midi);
    if(visualizerLastNote)visualizerLastNote.textContent='Playing · '+key.dataset.noteName;
    playTone(midi-60,1.8);
    if(!songPracticeRunning)return;
    const current=visualizerNotes?.querySelector('[data-practice-index="'+(songPracticePosition-1)+'"]');
    if(midi===songPracticeExpected&&!songPracticeResolved){songPracticeResolved=true;songHits++;songCombo++;songScore+=100+(songCombo-1)*10;if(current){current.classList.add('hit');setTimeout(()=>current.remove(),180);}practiceMessage('✓ Correct · '+key.dataset.noteName,'good');}
    else{key.classList.add('wrong');setTimeout(()=>key.classList.remove('wrong'),260);songMisses++;songCombo=0;songScore=Math.max(0,songScore-25);practiceMessage('✕ Wrong note · follow the falling key','bad');}
    updatePracticeStats();
  };
  const registerPracticeMiss = () => {
    if(songPracticeExpected===null||songPracticeResolved)return;
    songPracticeResolved=true;songMisses++;songCombo=0;songScore=Math.max(0,songScore-50);
    const current=visualizerNotes?.querySelector('[data-practice-index="'+(songPracticePosition-1)+'"]');
    if(current){current.classList.add('missed');setTimeout(()=>current.remove(),220);}
    practiceMessage('Missed · the expected note was '+midiName(songPracticeExpected),'bad');updatePracticeStats();
  };
  const stopSongPractice = (message='Ready for a new trial.') => { clearInterval(songPracticeTimer);songPracticeTimer=null;clearInterval(songDemoTimer);songDemoTimer=null;songPracticeRunning=false;songPracticeExpected=null;songPracticeResolved=false;clearPracticeNotes();if(message)practiceMessage(message); };
  const startSongPractice = () => {
    stopSongPractice('');const song=practiceSongs[practiceSongSelect?.value]||practiceSongs['fur-elise'];const speed=Number(practiceSpeedSelect?.value||1);const beatMs=(60000/song.tempo)/speed;
    songPracticeRunning=true;songPracticePosition=0;songScore=0;songHits=0;songMisses=0;songCombo=0;updatePracticeStats();practiceMessage('Trial started · press the falling notes at the PLAY HERE line');
    const tick=()=>{if(songPracticeExpected!==null&&!songPracticeResolved)registerPracticeMiss();if(songPracticePosition>=song.notes.length){stopSongPractice('');practiceMessage('Practice complete · score '+songScore+' · '+songHits+' correct','finish');return;}songPracticeExpected=song.notes[songPracticePosition];songPracticeResolved=false;spawnPracticeNote(songPracticeExpected,songPracticePosition,beatMs);songPracticePosition++;};
    tick();songPracticeTimer=setInterval(tick,beatMs);
  };
  const demoPracticeSong = () => {
    stopSongPractice('');const song=practiceSongs[practiceSongSelect?.value]||practiceSongs['fur-elise'];const speed=Number(practiceSpeedSelect?.value||1);const beatMs=(60000/song.tempo)/speed;let position=0;practiceMessage('Demo playing · watch the falling notes');
    const tick=()=>{if(position>=song.notes.length){clearInterval(songDemoTimer);songDemoTimer=null;practiceMessage('Demo complete · press Start practice to try it','finish');return;}const midi=song.notes[position];const key=visualizerKeyboard?.querySelector('[data-midi="'+midi+'"]');spawnPracticeNote(midi,position,beatMs);triggerPianoKey(key);position++;};tick();songDemoTimer=setInterval(tick,beatMs);
  };
  const computerNoteMap={z:48,s:49,x:50,d:51,c:52,v:53,g:54,b:55,h:56,n:57,j:58,m:59,q:60,'2':61,w:62,'3':63,e:64,r:65,'5':66,t:67,'6':68,y:69,'7':70,u:71,i:72};
  const openPianoVisualizer=()=>{showView('pianoVisualizer');renderPracticeKeyboard();pianoVisualizerPanel?.scrollIntoView({behavior:'smooth',block:'start'});if(visualizerLastNote)visualizerLastNote.textContent='Ready to play · C3–C6';};
  $$('.tool-launch').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.tool==='Piano Visualizer'){openPianoVisualizer();toast('Piano Visualizer opened');return;}showView('tools');$('#toolPanelTitle').textContent=button.dataset.tool;$('#toolPanelText').textContent=button.dataset.tool+' siap dipakai. Ini adalah ruang latihan interaktif Musica Space.';toast(button.dataset.tool+' opened');}));
  $('#backToTools')?.addEventListener('click',()=>showView('tools'));
  $('#pianoSongStart')?.addEventListener('click',startSongPractice);
  $('#pianoSongStop')?.addEventListener('click',()=>stopSongPractice('Practice stopped.'));
  $('#pianoSongDemo')?.addEventListener('click',demoPracticeSong);
  visualizerKeyboard?.addEventListener('pointerdown',event=>{const key=event.target.closest('[data-midi]');if(key){event.preventDefault();triggerPianoKey(key);}});
  window.addEventListener('keydown',event=>{if(event.code==='Space'){event.preventDefault();if(!event.repeat)setSustain(!sustainEnabled);return;}if(event.repeat||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;const midi=computerNoteMap[event.key.toLowerCase()];if(midi===undefined)return;const key=visualizerKeyboard?.querySelector('[data-midi="'+midi+'"]');if(key){event.preventDefault();triggerPianoKey(key);}});
  renderPracticeKeyboard();

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
