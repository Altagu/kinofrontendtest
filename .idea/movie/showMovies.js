const API_URL = "kinofullstack-epcfgehdhse5eufz.northeurope-01.azurewebsites.net"


// Fetch movies and display them
async function fetchMovies() {
    try {
        const response = await fetch("${API_URL}/api/movies");
        const movies = await response.json();

        const container = document.getElementById("movies-container");
        container.innerHTML = "";

        movies.forEach(movie => {
            const showtimes = Array.isArray(movie.showtimes)
                ? movie.showtimes.map(time => `<span class='bg-gray-700 px-3 py-1 rounded-lg'>${time}</span>`).join(" ")
                : "<span class='text-gray-400'>No showtimes available</span>";

            const movieElement = `
          <div class="bg-gray-800 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between">
            <div class="flex items-center space-x-6 cursor-pointer movie-item" data-movie-id="${movie.id}">
              <img src="${movie.imagePath || 'https://via.placeholder.com/150x200?text=No+Image'}" class="w-32 h-48 rounded-lg" alt="Movie Poster">
              <div>
                <h3 class="text-2xl font-semibold">${movie.title}</h3>
                <p class="text-sm text-gray-400 mb-2">${movie.genre}</p>
                <div class="flex flex-wrap gap-2 text-white">${showtimes}</div>
              </div>
            </div>
            <a href="ticket.html?id=${movie.id}" class="bg-red-500 text-white px-4 py-2 rounded-lg text-lg font-semibold hover:bg-red-700 mt-4 md:mt-0">
              Get Tickets
            </a>
          </div>
        `;
            container.innerHTML += movieElement;
        });

        // Add click event listeners to movie items
        document.querySelectorAll('.movie-item').forEach(item => {
            item.addEventListener('click', () => {
                const movieId = item.getAttribute('data-movie-id');
                openMovieModal(movieId);
            });
        });
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// Function to open modal with movie details
async function openMovieModal(movieId) {
    try {
        const response = await fetch(`${API_URL}/api/movies/${movieId}`);
        const movie = await response.json();

        // Populate modal data
        document.getElementById('modal-title').textContent = movie.title;
        document.getElementById('modal-genre').textContent = movie.genre;
        document.getElementById('modal-description').textContent = movie.description;
        document.getElementById('modal-poster').src = movie.imagePath || 'https://via.placeholder.com/300x450?text=No+Image';
        document.getElementById('modal-duration').innerHTML = `<i class="far fa-clock mr-2 text-red-500"></i> ${movie.duration} min`;
        document.getElementById('modal-age').innerHTML = `<i class="fas fa-user-shield mr-2 text-red-500"></i> ${movie.ageLimit || movie.age_limit}+`;

        // Set links
        document.getElementById('more-details-link').href = `movieDetails.html?id=${movieId}`;
        document.getElementById('get-tickets-link').href = `ticket.html?id=${movieId}`;

        // Display showtimes
        const showtimesContainer = document.getElementById('modal-showtimes');
        showtimesContainer.innerHTML = '';

        if (Array.isArray(movie.showtimes) && movie.showtimes.length > 0) {
            movie.showtimes.forEach(time => {
                const timeElement = document.createElement('span');
                timeElement.className = 'bg-gray-700 px-3 py-1 rounded-lg';
                timeElement.textContent = time;
                showtimesContainer.appendChild(timeElement);
            });
        } else {
            showtimesContainer.innerHTML = '<span class="text-gray-400">No showtimes available</span>';
        }

        // Show modal
        document.getElementById('modal-overlay').classList.remove('hidden');
        document.getElementById('modal-overlay').classList.add('flex');

        // Prevent scrolling on body
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
}

// Close modal function
function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-overlay').classList.remove('flex');
    document.body.style.overflow = 'auto';
}

// Event listeners
document.getElementById('close-modal').addEventListener('click', closeModal);

// Close modal when clicking outside of it
document.getElementById('modal-overlay').addEventListener('click', (event) => {
    if (event.target === document.getElementById('modal-overlay')) {
        closeModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Initialize
fetchMovies();