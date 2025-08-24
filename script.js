// 🔐 SUA CHAVE DE API DO YOUTUBE
const API_KEY = 'AIzaSyAbcX-2l4xNhHIIRXC4zIugr_jyX1W0AA8'; // ← Sua chave aqui!

// Lista de reprodução e playlist do usuário
let searchResults = [];
let userPlaylist = [];
let currentTrackIndex = 0;
let isPlayingFromPlaylist = false;
let player = null;
let isPlayerReady = false;

// Sistema de login e loop
let currentUser = null;
let isLoopEnabled = false;
let loopMode = 'off'; // 'off', 'track', 'playlist'

// Sistema de armazenamento JSON
let dataStore = {
  users: {},
  settings: {
    version: "1.0",
    lastUpdated: ""
  }
};

// Elementos
const playPauseBtn = document.getElementById('playPauseBtn');
const nowPlaying = document.getElementById('now-playing');
const lyricsDiv = document.getElementById('lyrics');

// Busca músicas no YouTube com API real e fallback
async function searchMusic() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) {
    alert("Digite o nome da música ou artista.");
    return;
  }

  console.log("Buscando:", query);

  // Mostrar carregamento
  document.getElementById('results').innerHTML = '<div class="loading">🔍 Buscando músicas...</div>';

  let apiWorked = false;

  try {
    // Primeiro tenta a API real do YouTube
    if (API_KEY && API_KEY !== 'SUA_CHAVE_AQUI') {
      console.log("Tentando usar API do YouTube...");
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          query + ' music'
        )}&type=video&maxResults=12&key=${API_KEY}`
      );

      console.log("Status da resposta da API:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Dados recebidos da API:", data);
        
        if (data.items && data.items.length > 0) {
          searchResults = data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle
          }));

          displayResults(searchResults);
          console.log("Músicas encontradas via API:", searchResults.length);
          apiWorked = true;
          return;
        }
      } else {
        const errorData = await response.json();
        console.log("Erro na API:", errorData);
      }
    } else {
      console.log("API Key não configurada, usando busca simulada");
    }
  } catch (error) {
    console.log("Erro ao buscar músicas:", error);
  }

  // Se chegou aqui, a API não funcionou, usa busca simulada
  if (!apiWorked) {
    console.log("Usando busca simulada para:", query);
    const mockResults = generateMockResults(query);

    if (mockResults.length === 0) {
      document.getElementById('results').innerHTML = '<div class="no-results">Nenhuma música encontrada para "' + query + '".</div>';
      return;
    }

    searchResults = mockResults;
    displayResults(searchResults);
    console.log("Músicas encontradas (simuladas):", searchResults.length);
  }
}

// Gera resultados simulados baseados na busca
function generateMockResults(query) {
  const musicDatabase = [
    // Músicas da Beatriz (baseado nas buscas do usuário)
    { id: 'ABC987XYZ', title: '2ZDinizz - Beatriz (prod. Leborato)', channel: '2ZDinizz' },
    { id: 'DEF456GHI', title: 'Sarah Beatriz - Madrugada', channel: 'Sarah Beatriz' },
    { id: 'GHI789JKL', title: 'Bianca & Beatriz - Papoulas', channel: 'Bianca & Beatriz' },
    { id: 'JKL012MNO', title: 'Beatriz Costa - Infinito Particular', channel: 'Beatriz Costa' },
    { id: 'MNO345PQR', title: 'Vibe!n - 2ZDinizz Beatriz Remix', channel: 'Vibe!n' },
    { id: 'PQR678STU', title: 'Ana Beatriz - Entre Papoulas', channel: 'Ana Beatriz' },
    { id: 'ZdgHXJNcWHg', title: 'Ana Beatriz - Flores de Maio', channel: 'Ana Beatriz' },
    { id: 'XYZ123ABC', title: 'Beatriz Andrade - Sonhos Dourados', channel: 'Beatriz Andrade' },
    { id: 'STU901VWX', title: 'Beatriz Lima - Coração de Papel', channel: 'Beatriz Lima' },
    { id: 'VWX234YZA', title: 'MC Beatriz - Ritmo da Noite', channel: 'MC Beatriz' },
    
    // Papoulas
    { id: 'PAP001XYZ', title: 'Flores Papoulas - Verão Eterno', channel: 'Flores Papoulas' },
    { id: 'PAP002ABC', title: 'Campo de Papoulas - Melodia do Vento', channel: 'Campo de Papoulas' },
    { id: 'PAP003DEF', title: 'Papoulas Vermelhas - Canção do Amanhecer', channel: 'Papoulas Vermelhas' },
    { id: 'PAP004GHI', title: 'Entre Papoulas - Sonho de Primavera', channel: 'Entre Papoulas' },
    
    // Pop Internacional
    { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', channel: 'Rick Astley' },
    { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', channel: 'Luis Fonsi' },
    { id: 'JGwWNGJdvx8', title: 'Ed Sheeran - Shape of You', channel: 'Ed Sheeran' },
    { id: 'RgKAFK5djSk', title: 'Wiz Khalifa - See You Again ft. Charlie Puth', channel: 'Wiz Khalifa' },
    { id: 'OPf0YbXqDm0', title: 'Mark Ronson - Uptown Funk ft. Bruno Mars', channel: 'Mark Ronson' },
    { id: 'CevxZvSJLk8', title: 'Katy Perry - Roar', channel: 'Katy Perry' },
    { id: 'YQHsXMglC9A', title: 'Adele - Hello', channel: 'Adele' },
    { id: 'iPUmE-tne5U', title: 'The Weeknd - Blinding Lights', channel: 'The Weeknd' },
    { id: 'QcIy9NiNbmo', title: 'Taylor Swift - Bad Blood ft. Kendrick Lamar', channel: 'Taylor Swift' },
    
    // Rock/Alternative
    { id: 'lDK9QqIzhwk', title: 'Linkin Park - Numb', channel: 'Linkin Park' },
    { id: 'ktvTqknDobU', title: 'Imagine Dragons - Radioactive', channel: 'Imagine Dragons' },
    { id: 'hTWKbfoikeg', title: 'Nirvana - Smells Like Teen Spirit', channel: 'Nirvana' },
    { id: 'iLBBRuVDOo4', title: 'Coldplay - Viva La Vida', channel: 'Coldplay' },
    
    // Hip-Hop/Rap
    { id: 'uelHwf8o7_U', title: 'Eminem - Love The Way You Lie ft. Rihanna', channel: 'Eminem' },
    { id: 'tbU3zdAgiX8', title: 'XXXTENTACION - SAD!', channel: 'XXXTENTACION' },
    { id: '6Mgqbai3fKo', title: 'Post Malone - Sunflower', channel: 'Post Malone' },
    
    // Eletrônica/Dance
    { id: 'pAgnJDJN4VA', title: 'Avicii - Wake Me Up', channel: 'Avicii' },
    { id: 'pt8VYOfngIA', title: 'Maroon 5 - Sugar', channel: 'Maroon 5' },
    
    // Pop Nacional/Internacional
    { id: 'fRh_vgS2dFE', title: 'Justin Bieber - Sorry', channel: 'Justin Bieber' },
    { id: 'bx1Bh8ZvH84', title: 'Beethoven - Symphony No. 9', channel: 'Ludwig van Beethoven' },
    
    // Músicas Brasileiras - MPB e Rock
    { id: '8mejOXcZh_Y', title: 'Legião Urbana - Tempo Perdido', channel: 'Legião Urbana' },
    { id: 'MJ_rBaAA2bQ', title: 'Cazuza - Ideologia', channel: 'Cazuza' },
    { id: 'P9Z1HQWKAA8', title: 'Raul Seixas - Metamorfose Ambulante', channel: 'Raul Seixas' },
    { id: 'k5JkHBC5BOU', title: 'Os Paralamas do Sucesso - Alagados', channel: 'Os Paralamas do Sucesso' },
    { id: 'IkxP8-zVs-g', title: 'Engenheiros do Hawaii - Somos Quem Podemos Ser', channel: 'Engenheiros do Hawaii' },
    { id: '8fVX8lyWJo0', title: 'Capital Inicial - Primeiros Erros', channel: 'Capital Inicial' },
    { id: 'g7CG1lCw2Rk', title: 'Skank - Balada do Amor Inabalável', channel: 'Skank' },
    { id: 'z2nTw-7TRh8', title: 'Titãs - Epitáfio', channel: 'Titãs' },
    
    // Pop Brasileiro Atual
    { id: 'E_g0Yf_QS-4', title: 'Anitta - Envolver', channel: 'Anitta' },
    { id: 'FpBJih02aYU', title: 'Luisa Sonza - Anaconda', channel: 'Luisa Sonza' },
    { id: 'ziAqOG0mJP8', title: 'Pabllo Vittar - Corpo Sensual', channel: 'Pabllo Vittar' },
    { id: 'nOQWLtxOyuk', title: 'MC Kevinho - Olha a Explosão', channel: 'MC Kevinho' },
    
    // Sertanejo
    { id: 'DVJJnyj_dZU', title: 'Henrique e Juliano - Flor e o Beija-Flor', channel: 'Henrique e Juliano' },
    { id: '47dtFZ8CFo8', title: 'Marília Mendonça - Infiel', channel: 'Marília Mendonça' },
    
    // Clássicos MPB
    { id: 'fEOzSJx3STU', title: 'Caetano Veloso - Alegria Alegria', channel: 'Caetano Veloso' },
    { id: 'nxVEAjcNmW4', title: 'Tom Jobim - Garota de Ipanema', channel: 'Tom Jobim' },
    
    // Rock Brasileiro
    { id: '8XCbBtzcxR0', title: 'RPM - Louras Geladas', channel: 'RPM' },
    { id: 'GgCrVN5Wklc', title: 'Barão Vermelho - Bete Balanço', channel: 'Barão Vermelho' }
  ];

  if (!query || query.trim() === '') {
    return musicDatabase.sort(() => 0.5 - Math.random()).slice(0, 12);
  }

  const queryLower = query.toLowerCase().trim();
  console.log("Procurando por:", queryLower);
  
  // Busca mais inteligente - prioriza correspondências exatas
  const exactMatches = musicDatabase.filter(song => {
    const titleLower = song.title.toLowerCase();
    const channelLower = song.channel.toLowerCase();
    
    // Verifica se a query está no título ou artista
    const titleMatch = titleLower.includes(queryLower);
    const channelMatch = channelLower.includes(queryLower);
    const titleNormalized = titleLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(queryLower);
    const channelNormalized = channelLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(queryLower);
    
    return titleMatch || channelMatch || titleNormalized || channelNormalized;
  });

  console.log("Músicas encontradas:", exactMatches.length);

  // Se encontrou correspondências, retorna elas primeiro
  if (exactMatches.length > 0) {
    // Adiciona algumas sugestões aleatórias se não tiver 12 resultados
    const remaining = Math.max(0, 12 - exactMatches.length);
    if (remaining > 0) {
      const otherSongs = musicDatabase.filter(song => !exactMatches.includes(song));
      const randomSongs = otherSongs.sort(() => 0.5 - Math.random()).slice(0, remaining);
      return [...exactMatches, ...randomSongs];
    }
    return exactMatches.slice(0, 12);
  }

  // Se não encontrou nada específico, retorna sugestões aleatórias
  console.log("Nenhuma correspondência exata, retornando sugestões aleatórias");
  return musicDatabase.sort(() => 0.5 - Math.random()).slice(0, 12);
}

// Exibe os resultados
function displayResults(tracks) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  tracks.forEach((track, index) => {
    const trackEl = document.createElement('div');
    trackEl.classList.add('track');
    trackEl.innerHTML = `
      <img src="https://img.youtube.com/vi/${track.id}/mqdefault.jpg" alt="Capa" style="width:100%; border-radius:8px; height:110px; object-fit:cover;">
      <div class="track-info">
        <h4>${truncateText(track.title, 40)}</h4>
        <p>${truncateText(track.channel, 30)}</p>
      </div>
      <div class="track-actions">
        <button class="add-playlist-btn" onclick="addToPlaylist(${index})" title="Adicionar à Playlist">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
        </button>
        <button class="play-btn" onclick="playTrackFromSearch(${index})" title="Tocar Agora">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
          </svg>
        </button>
      </div>
    `;
    resultsDiv.appendChild(trackEl);
  });
}

// Toca a música atual
function playCurrentTrack() {
  const currentList = isPlayingFromPlaylist ? userPlaylist : searchResults;
  if (currentList.length === 0) {
    console.log("Lista de músicas vazia");
    showNotification("Nenhuma música na lista!");
    return;
  }

  const track = currentList[currentTrackIndex];
  const videoId = track.id;
  
  console.log("Tentando tocar:", track.title, "ID:", videoId);

  // Se o player não estiver pronto, inicializa
  if (!isPlayerReady || !player) {
    console.log("Player não está pronto, inicializando...");
    initializeYouTubePlayer(() => {
      setTimeout(() => playCurrentTrack(), 500);
    });
    return;
  }

  // Toca a música
  try {
    console.log("Carregando vídeo no player...");
    
    // Carrega e toca o vídeo
    player.loadVideoById({
      videoId: videoId,
      startSeconds: 0,
      suggestedQuality: 'small'
    });
    
    // Garante que vai tocar
    setTimeout(() => {
      if (player && player.playVideo) {
        player.playVideo();
        console.log("Música iniciada!");
      }
    }, 1000);
    
    // Atualiza interface imediatamente
    nowPlaying.textContent = `🎶 Tocando: ${truncateText(track.title, 50)}`;
    
    // Atualiza fundo com capa
    updateBackground(videoId);

    // Busca letra
    fetchLyrics(track.title);
    
    showNotification(`Tocando: ${truncateText(track.title, 30)}`);
  } catch (error) {
    console.error("Erro ao carregar música:", error);
    showNotification("Erro ao tocar música!");
  }
}

// Atualiza o fundo do player
function updateBackground(videoId) {
  const playerSection = document.querySelector('.player-section');
  const imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  const img = new Image();
  img.onload = () => {
    playerSection.style.backgroundImage = `url(${imageUrl})`;
  };
  img.onerror = () => {
    playerSection.style.backgroundImage = `url(https://img.youtube.com/vi/${videoId}/mqdefault.jpg)`;
  };
  img.src = imageUrl;
}

// Inicializa o player do YouTube
function initializeYouTubePlayer(callback) {
  if (isPlayerReady && player) {
    if (callback) callback();
    return;
  }

  console.log("Inicializando player do YouTube...");
  
  // Remove player existente se houver
  const existingPlayer = document.getElementById('youtube-player');
  if (existingPlayer) {
    existingPlayer.remove();
  }

  // Cria novo elemento para o player
  const playerDiv = document.createElement('div');
  playerDiv.id = 'youtube-player';
  playerDiv.style.display = 'none';
  document.body.appendChild(playerDiv);

  // Aguarda a API estar disponível
  if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
    console.log("API do YouTube não está carregada ainda, aguardando...");
    setTimeout(() => initializeYouTubePlayer(callback), 500);
    return;
  }

  try {
    // Inicializa o player
    player = new YT.Player('youtube-player', {
      height: '1',
      width: '1',
      playerVars: {
        'autoplay': 1,
        'controls': 0,
        'enablejsapi': 1,
        'origin': window.location.origin,
        'playsinline': 1,
        'rel': 0,
        'modestbranding': 1
      },
      events: {
        'onReady': function(event) {
          console.log("Player do YouTube está pronto!");
          isPlayerReady = true;
          event.target.setVolume(100);
          if (callback) callback();
        },
        'onStateChange': function(event) {
          console.log("Estado do player mudou:", event.data);
          updatePlayerUI(event.data);
          
          if (event.data === YT.PlayerState.ENDED) {
            if (loopMode === 'track') {
              // Repete a música atual
              playCurrentTrack();
            } else {
              nextMusic();
            }
          }
        },
        'onError': function(event) {
          console.error("Erro no player do YouTube:", event.data);
          showNotification("Erro ao carregar música. Tentando próxima...");
          nextMusic();
        }
      }
    });
  } catch (error) {
    console.error("Erro ao criar player:", error);
    setTimeout(() => initializeYouTubePlayer(callback), 1000);
  }
}

// Atualiza a interface do player baseado no estado
function updatePlayerUI(state) {
  if (state === YT.PlayerState.PLAYING) {
    playPauseBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
      </svg>
    `;
  } else {
    playPauseBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M6.271 5.055a.5.5 0 0 1 .52.038L10.5 8a.5.5 0 0 1 0 .808l-3.71 2.912a.5.5 0 0 1-.808-.387V5.113a.5.5 0 0 1 .52-.445z"/>
      </svg>
    `;
  }
}

// Play/Pause
function togglePlayPause() {
  if (!isPlayerReady || !player) {
    console.log("Player não está pronto, inicializando...");
    initializeYouTubePlayer(() => {
      setTimeout(togglePlayPause, 500);
    });
    return;
  }

  try {
    const state = player.getPlayerState();
    console.log("Estado atual do player:", state);
    
    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
      console.log("Música pausada");
    } else if (state === YT.PlayerState.PAUSED) {
      player.playVideo();
      console.log("Música retomada");
    } else {
      // Se não há nada tocando, toca a primeira música da lista
      const currentList = isPlayingFromPlaylist ? userPlaylist : searchResults;
      if (currentList.length > 0) {
        currentTrackIndex = 0;
        playCurrentTrack();
      } else {
        showNotification("Busque músicas primeiro!");
      }
    }
  } catch (error) {
    console.error("Erro no toggle play/pause:", error);
    showNotification("Erro no player!");
  }
}

// Próxima música
function nextMusic() {
  const currentList = isPlayingFromPlaylist ? userPlaylist : searchResults;
  if (currentList.length === 0) return;
  
  if (loopMode === 'track') {
    // Mantém a mesma música
    playCurrentTrack();
  } else if (loopMode === 'playlist') {
    currentTrackIndex = (currentTrackIndex + 1) % currentList.length;
    playCurrentTrack();
  } else {
    // Modo normal
    if (currentTrackIndex < currentList.length - 1) {
      currentTrackIndex++;
      playCurrentTrack();
    } else {
      // Fim da playlist, para
      console.log("Fim da playlist");
    }
  }
}

// Música anterior
function prevMusic() {
  const currentList = isPlayingFromPlaylist ? userPlaylist : searchResults;
  if (currentList.length === 0) return;
  currentTrackIndex = (currentTrackIndex - 1 + currentList.length) % currentList.length;
  playCurrentTrack();
}

// Trunca texto
function truncateText(text, max) {
  return text.length > max ? text.substring(0, max) + '...' : text;
}

// Busca letra (simulada)
async function fetchLyrics(title) {
  lyricsDiv.textContent = "Carregando letra...";
  setTimeout(() => {
    lyricsDiv.innerHTML = `🎵 Letra de "${title}":\n\n[Verse 1]\nEsta é uma simulação.\nEm produção, usamos Genius ou Musixmatch via backend.`;
  }, 800);
}

// Toggle sidebar para mobile
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('open');
}

// Fecha sidebar quando clicar fora (mobile)
document.addEventListener('click', function(event) {
  const sidebar = document.querySelector('.sidebar');
  const menuToggle = document.querySelector('.menu-toggle');
  
  if (window.innerWidth <= 768 && 
      !sidebar.contains(event.target) && 
      !menuToggle.contains(event.target) && 
      sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
});

// Adiciona música à playlist do usuário
function addToPlaylist(index) {
  const track = searchResults[index];
  if (!userPlaylist.find(t => t.id === track.id)) {
    userPlaylist.push(track);
    updatePlaylistDisplay();
    showNotification(`"${truncateText(track.title, 30)}" adicionada à playlist!`);
  } else {
    showNotification('Música já está na playlist!');
  }
}

// Toca música dos resultados de busca
function playTrackFromSearch(index) {
  currentTrackIndex = index;
  isPlayingFromPlaylist = false;
  playCurrentTrack();
}

// Toca música da playlist do usuário
function playTrackFromPlaylist(index) {
  currentTrackIndex = index;
  isPlayingFromPlaylist = true;
  playCurrentTrack();
}

// Remove música da playlist
function removeFromPlaylist(index) {
  userPlaylist.splice(index, 1);
  updatePlaylistDisplay();
  showNotification('Música removida da playlist!');
}

// Atualiza exibição da playlist
function updatePlaylistDisplay() {
  const playlistDiv = document.getElementById('user-playlist');
  
  if (userPlaylist.length === 0) {
    playlistDiv.innerHTML = '<p class="empty-playlist">Sua playlist está vazia. Adicione músicas!</p>';
    return;
  }

  playlistDiv.innerHTML = userPlaylist.map((track, index) => `
    <div class="playlist-track">
      <img src="https://img.youtube.com/vi/${track.id}/mqdefault.jpg" alt="Capa">
      <div class="playlist-track-info">
        <h5>${truncateText(track.title, 35)}</h5>
        <p>${truncateText(track.channel, 25)}</p>
      </div>
      <div class="playlist-track-actions">
        <button onclick="playTrackFromPlaylist(${index})" title="Tocar">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
          </svg>
        </button>
        <button onclick="removeFromPlaylist(${index})" title="Remover" class="remove-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

// Toca toda a playlist
function playEntirePlaylist() {
  if (userPlaylist.length === 0) {
    showNotification('Playlist vazia!');
    return;
  }
  currentTrackIndex = 0;
  isPlayingFromPlaylist = true;
  playCurrentTrack();
  showNotification('Tocando playlist!');
}

// Limpa a playlist
function clearPlaylist() {
  if (confirm('Tem certeza que deseja limpar a playlist?')) {
    userPlaylist = [];
    updatePlaylistDisplay();
    showNotification('Playlist limpa!');
  }
}

// Mostra notificação
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}

// Funções de armazenamento - usando apenas localStorage
async function loadDataFromJSON() {
  try {
    // Carrega dados do localStorage
    const localData = localStorage.getItem('spotitube_data');
    if (localData) {
      dataStore = JSON.parse(localData);
      console.log("Dados carregados do localStorage:", dataStore);
      return true;
    } else {
      // Se não há dados salvos, inicializa estrutura padrão
      dataStore = {
        users: {},
        settings: {
          version: "1.0",
          lastUpdated: new Date().toISOString()
        }
      };
      console.log("Nenhum dado encontrado, iniciando com estrutura vazia");
      return true;
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    // Se houve erro, inicializa estrutura padrão
    dataStore = {
      users: {},
      settings: {
        version: "1.0",
        lastUpdated: new Date().toISOString()
      }
    };
    return false;
  }
}

async function saveDataToJSON() {
  // Atualiza timestamp
  dataStore.settings.lastUpdated = new Date().toISOString();
  
  try {
    // Salva no localStorage
    localStorage.setItem('spotitube_data', JSON.stringify(dataStore));
    console.log("✅ Dados salvos com sucesso no localStorage:", dataStore);
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar dados:", error);
    return false;
  }
}

// Salva dados do usuário atual
function saveCurrentUserData() {
  if (!currentUser) return;
  
  if (!dataStore.users[currentUser]) {
    dataStore.users[currentUser] = {};
  }
  
  dataStore.users[currentUser] = {
    ...dataStore.users[currentUser],
    playlist: userPlaylist,
    loopMode: loopMode,
    lastActive: new Date().toISOString()
  };
  
  saveDataToJSON();
}

// Carrega dados do usuário
function loadUserData(username) {
  if (dataStore.users[username]) {
    const userData = dataStore.users[username];
    userPlaylist = userData.playlist || [];
    loopMode = userData.loopMode || 'off';
    
    // Atualiza botão de loop
    updateLoopButton();
    
    console.log(`Dados do usuário ${username} carregados:`, userData);
  }
}

// Toggle seção da playlist
function togglePlaylistSection() {
  const section = document.querySelector('.playlist-section');
  section.classList.toggle('minimized');
}

// Permite busca com Enter
document.getElementById('searchInput').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    searchMusic();
  }
});

// Funções de Login
function showLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
}

function showRegister() {
  document.querySelector('.login-form').style.display = 'none';
  document.querySelector('.register-form').style.display = 'block';
}

function showLogin() {
  document.querySelector('.register-form').style.display = 'none';
  document.querySelector('.login-form').style.display = 'block';
}

function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  
  if (!username || !password) {
    showNotification('Preencha todos os campos!');
    return;
  }
  
  console.log('Tentando fazer login para:', username);
  console.log('Usuários disponíveis:', Object.keys(dataStore.users));
  
  // Verifica login usando o dataStore
  if (dataStore.users[username] && dataStore.users[username].password === password) {
    currentUser = username;
    
    // Carrega dados do usuário
    loadUserData(username);
    
    document.getElementById('userName').textContent = username;
    document.getElementById('userInfo').style.display = 'flex';
    closeLoginModal();
    updatePlaylistDisplay();
    showNotification(`Bem-vindo de volta, ${username}!`);
    
    console.log('✅ Login realizado com sucesso para:', username);
    
    // Limpa campos de login
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
  } else {
    console.log('❌ Login falhou para:', username);
    showNotification('Usuário ou senha incorretos!');
  }
}

function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  const confirm = document.getElementById('confirmPassword').value.trim();
  
  if (!username || !password || !confirm) {
    showNotification('Preencha todos os campos!');
    return;
  }
  
  if (password !== confirm) {
    showNotification('As senhas não coincidem!');
    return;
  }
  
  if (username.length < 3) {
    showNotification('Nome de usuário deve ter pelo menos 3 caracteres!');
    return;
  }
  
  if (dataStore.users[username]) {
    showNotification('Usuário já existe!');
    return;
  }
  
  console.log('Criando novo usuário:', username);
  
  // Cria novo usuário
  dataStore.users[username] = {
    password: password,
    playlist: [],
    createdAt: new Date().toISOString(),
    loopMode: 'off'
  };
  
  // Salva dados imediatamente
  const saved = saveDataToJSON();
  
  if (saved) {
    console.log('✅ Usuário criado e salvo com sucesso:', username);
    showNotification('Conta criada com sucesso!');
    showLogin();
    
    // Limpa campos
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  } else {
    console.log('❌ Erro ao salvar usuário');
    showNotification('Erro ao criar conta. Tente novamente.');
  }
}

function logout() {
  if (currentUser) {
    saveCurrentUserData();
  }
  
  currentUser = null;
  userPlaylist = [];
  loopMode = 'off';
  updateLoopButton();
  document.getElementById('userInfo').style.display = 'none';
  updatePlaylistDisplay();
  showNotification('Logout realizado!');
}

// Atualiza visual do botão de loop
function updateLoopButton() {
  const loopBtn = document.getElementById('loopBtn');
  if (!loopBtn) return;
  
  loopBtn.classList.remove('active');
  
  if (loopMode === 'track') {
    loopBtn.classList.add('active');
    loopBtn.title = 'Repetir música';
  } else if (loopMode === 'playlist') {
    loopBtn.classList.add('active');
    loopBtn.title = 'Repetir playlist';
  } else {
    loopBtn.title = 'Repetir';
  }
}

// Função de Loop
function toggleLoop() {
  if (loopMode === 'off') {
    loopMode = 'track';
    showNotification('🔂 Repetindo música atual');
  } else if (loopMode === 'track') {
    loopMode = 'playlist';
    showNotification('🔁 Repetindo playlist');
  } else {
    loopMode = 'off';
    showNotification('➡️ Repetição desligada');
  }
  
  updateLoopButton();
  
  // Salva configuração
  if (currentUser) {
    saveCurrentUserData();
  }
}

// Auto-save quando playlist for modificada
const originalAddToPlaylist = addToPlaylist;
addToPlaylist = function(index) {
  const track = searchResults[index];
  if (!userPlaylist.find(t => t.id === track.id)) {
    userPlaylist.push(track);
    updatePlaylistDisplay();
    showNotification(`"${truncateText(track.title, 30)}" adicionada à playlist!`);
    
    if (currentUser) {
      saveCurrentUserData();
    }
  } else {
    showNotification('Música já está na playlist!');
  }
};

const originalRemoveFromPlaylist = removeFromPlaylist;
removeFromPlaylist = function(index) {
  userPlaylist.splice(index, 1);
  updatePlaylistDisplay();
  showNotification('Música removida da playlist!');
  
  if (currentUser) {
    saveCurrentUserData();
  }
};

const originalClearPlaylist = clearPlaylist;
clearPlaylist = function() {
  if (confirm('Tem certeza que deseja limpar a playlist?')) {
    userPlaylist = [];
    updatePlaylistDisplay();
    showNotification('Playlist limpa!');
    
    if (currentUser) {
      saveCurrentUserData();
    }
  }
};

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', async function() {
  // Carrega dados salvos
  console.log("🔄 Carregando dados salvos...");
  const loaded = await loadDataFromJSON();
  
  if (loaded) {
    console.log("✅ Dados carregados:", dataStore);
  } else {
    console.log("⚠️ Problemas ao carregar dados, usando estrutura padrão");
  }
  
  updatePlaylistDisplay();
  
  // Mostra modal de login se não estiver logado
  if (!currentUser) {
    setTimeout(() => showLoginModal(), 1000);
  }
  
  // Carrega o YouTube IFrame API
  if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
    console.log("Carregando YouTube IFrame API...");
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // Define a função global necessária para a API
    window.onYouTubeIframeAPIReady = function() {
      console.log("YouTube IFrame API carregada!");
      // Pré-inicializa o player para melhor performance
      setTimeout(() => {
        if (!isPlayerReady) {
          initializeYouTubePlayer();
        }
      }, 1000);
    };
  } else {
    console.log("YouTube API já carregada");
    if (!isPlayerReady) {
      initializeYouTubePlayer();
    }
  }
  
  // Melhora a experiência mobile
  document.addEventListener('touchstart', function() {
    if (!isPlayerReady) {
      initializeYouTubePlayer();
    }
  }, { once: true });
});