// Temporary store for current search results
let searchResults = [];

window.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('animeSearch');
  const animeResults = document.getElementById('animeResults');

  // --- Search Page ---
  if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
      const query = searchInput.value.trim();
      if (!query) return alert('Please enter an anime name!');

      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
      const data = await response.json();
      animeResults.innerHTML = '';

      searchResults = data.data.slice(0, 24); // store results

      searchResults.forEach((anime, i) => {
        const card = document.createElement('div');
        card.classList.add('animeCard');

        // --- Updated: Added rating under View Anime button ---
        card.innerHTML = `
          <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
          <h2>${anime.title}</h2>
          <button onclick="showAnimeDetails(${i})">View Anime</button>
          <p><b>Score:</b> ${anime.score || 'N/A'}</p>
        `;
        animeResults.appendChild(card);
      });
    });
  }

  // --- Watchlist Page ---
  const watchlistEl = document.getElementById('watchlist');
  if (watchlistEl) displayList();
});

function showAnimeDetails(index) {
  const anime = searchResults[index];
  const animeResults = document.getElementById('animeResults');

  const genres = anime.genres.map(g => g.name).join(', ');
  const producers = anime.producers.map(p => p.name).join(', ');

  animeResults.innerHTML = `
    <div class="animeDetailsContainer">
      <!-- Left Column: Image -->
      <div class="animeImageSection">
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      </div>

      <!-- Center Column: Details -->
      <div class="animeInfoSection">
        <h2>${anime.title}</h2>
        <p><b>Score:</b> ${anime.score || 'N/A'}</p>
        <p><b>Rank:</b> ${anime.rank || 'N/A'}</p>
        <p><b>Popularity:</b> ${anime.popularity || 'N/A'}</p>
        <p><b>Genres:</b> ${genres || 'N/A'}</p>
        <p><b>Producers:</b> ${producers || 'N/A'}</p>
        <p><b>Source:</b> ${anime.source || 'N/A'}</p>
        <p><b>Studio:</b> ${anime.studios?.map(s => s.name).join(', ') || 'N/A'}</p>
        <p><b>Rating:</b> ${anime.rating || 'N/A'}</p>
        <p><b>Episodes:</b> ${anime.episodes || 'N/A'}</p>
        <p><b>Aired:</b> ${anime.aired.string || 'N/A'}</p>

        <!-- Synopsis -->
        <div class="animeSynopsis">
          <h3>Synopsis</h3>
          <p>${anime.synopsis || 'No synopsis available.'}</p>
        </div>

        <!-- Buttons -->
        <div class="animeButtons">
          <a href="https://myanimelist.net/anime/${anime.mal_id}" target="_blank">
            <button>View Anime List</button>
          </a>
          <button onclick="addToWatchlistById(${index})">Add to Wishlist</button>
          <button onclick="goBackToResults()">Back to Results</button>
        </div>
      </div>
    </div>
  `;
}


// --- Go back to results ---
function goBackToResults() {
  const animeResults = document.getElementById('animeResults');
  animeResults.innerHTML = '';
  searchResults.forEach((anime, i) => {
    const card = document.createElement('div');
    card.classList.add('animeCard');

    // --- Updated: Added rating under View Anime button ---
    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      <h2>${anime.title}</h2>
      <button onclick="showAnimeDetails(${i})">View Anime</button>
      <p><b>Rating:</b> ${anime.rating || 'N/A'}</p>
    `;
    animeResults.appendChild(card);
  });
}

// --- Add to Watchlist by index from searchResults ---
function addToWatchlistById(index) {
  const anime = searchResults[index];
  let list = JSON.parse(localStorage.getItem('watchlist')) || [];
  const exists = list.some(item => item.mal_id === anime.mal_id);
  if (!exists) {
    anime.episodesWatched = 0;
    anime.review = '';
    list.push(anime);
    localStorage.setItem('watchlist', JSON.stringify(list));
    alert(`${anime.title} added to your watchlist!`);
  } else {
    alert(`${anime.title} is already in your watchlist.`);
  }
}

// --- Display Watchlist ---
function displayList() {
  const watchlistEl = document.getElementById('watchlist');
  const list = JSON.parse(localStorage.getItem('watchlist')) || [];
  watchlistEl.innerHTML = '';

  list.forEach((anime, index) => {
    const card = document.createElement('div');
    card.classList.add('animeCard');

    const genres = anime.genres.map(g => g.name).join(', ');
    const producers = anime.producers.map(p => p.name).join(', ');

    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      <h2>${anime.title}</h2>
      <p><b>Score:</b> ${anime.score || 'N/A'}</p>
      <p><b>Rank:</b> ${anime.rank || 'N/A'}</p>
      <p><b>Popularity:</b> ${anime.popularity || 'N/A'}</p>
      <p><b>Genres:</b> ${genres || 'N/A'}</p>
      <p><b>Producers:</b> ${producers || 'N/A'}</p>
      <p><b>Source:</b> ${anime.source || 'N/A'}</p>
      <p><b>Rating:</b> ${anime.rating || 'N/A'}</p>
      <p><b>Episodes:</b> ${anime.episodes || 'N/A'}</p>
      <p><b>Aired:</b> ${anime.aired.string || 'N/A'}</p>
      <a href="https://myanimelist.net/anime/${anime.mal_id}" target="_blank">View on MyAnimeList</a>

      <hr>
      <label>Episodes Watched:</label>
      <input type="number" min="0" max="${anime.episodes || 0}" value="${anime.episodesWatched}" onchange="updateEpisodes(${index}, this.value)">

      <label>Review:</label>
      <textarea id="review-${index}" rows="3">${anime.review}</textarea>
      <br>
      <button onclick="submitReview(${index})">Submit Review</button>
      <button onclick="deleteReview(${index})">Delete Review</button>
      <br><br>
      <button onclick="deleteAnime(${index})">Delete Anime</button>
    `;

    watchlistEl.appendChild(card);
  });
}
// --- Submit/Edit Review ---
function submitReview(index) {
  let list = JSON.parse(localStorage.getItem('watchlist')) || [];
  const reviewText = document.getElementById(`review-${index}`).value.trim();
  list[index].review = reviewText;
  localStorage.setItem('watchlist', JSON.stringify(list));
  alert('Review saved!');
}

// --- Delete Review ---
function deleteReview(index) {
  let list = JSON.parse(localStorage.getItem('watchlist')) || [];
  list[index].review = '';
  localStorage.setItem('watchlist', JSON.stringify(list));
  displayList(); // refresh to clear textarea
}


// --- Update Episodes Watched ---
function updateEpisodes(index, value) {
  let list = JSON.parse(localStorage.getItem('watchlist')) || [];
  list[index].episodesWatched = Number(value);
  localStorage.setItem('watchlist', JSON.stringify(list));
}

// --- Update Review ---
function updateReview(index, value) {
  let list = JSON.parse(localStorage.getItem('watchlist')) || [];
  list[index].review = value;
  localStorage.setItem('watchlist', JSON.stringify(list));
}

// --- Delete Anime ---
function deleteAnime(index) {
  let list = JSON.parse(localStorage.getItem('watchlist')) || [];
  list.splice(index, 1);
  localStorage.setItem('watchlist', JSON.stringify(list));
  displayList();
}

// --- Clear All ---
function clearList() {
  localStorage.removeItem('watchlist');
  displayList();
}
