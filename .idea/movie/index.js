const API_URL = "kinofullstack-epcfgehdhse5eufz.northeurope-01.azurewebsites.net"


async function fetchMovies() {
    try {
        const response = await fetch(`${API_URL}/api/movies`);
        const movies = await response.json();
        console.log(movies);  // Check if movies are being fetched correctly

        const container = document.getElementById("movies-container");
        container.innerHTML = ""; // Clear previous content

        if (movies.length === 0) {
            console.log("No movies to display.");
        }

        movies.forEach(movie => {
            // Dynamically create movie HTML
            const movieElement = `
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <a href="moviedetails.html?id=${movie.movieId}">
                            <img src="${movie.imagePath || 'https://via.placeholder.com/300x450?text=No+Image'}" class="w-full rounded-lg mb-4" alt="Movie Poster">
                            <h3 class="text-xl font-semibold">${movie.title}</h3>
                            <p class="text-sm text-gray-400">${movie.genre}</p>
                        </a>
                    </div>
                `;
            container.innerHTML += movieElement;
        });
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

fetchMovies();

const trailers = [
    { id: "ByXuk9QqQkk", title: "Spirited Away" },
    { id: "92a7Hj0ijLs", title: "My Neighbor Totoro" },
    { id: "4OiMOHRDs14", title: "Princess Mononoke" },
];

let currentIndex = 0;
const videoContainer = document.getElementById("video-container");
const trailerFrame = document.getElementById("trailer-frame");

function updateTrailer(next = true) {
    // Apply slide-out animation
    videoContainer.style.transform = `translateX(${next ? "-100%" : "100%"})`;
    videoContainer.style.opacity = "0";  // Fade out

    setTimeout(() => {
        // Change the video source
        const trailer = trailers[currentIndex];
        trailerFrame.src = `https://www.youtube.com/embed/${trailer.id}?autoplay=1&mute=1&loop=1&playlist=${trailer.id}&controls=0&modestbranding=1&rel=0&showinfo=0&fs=0&start=7`;
        document.getElementById("movie-title").textContent = trailer.title;

        // Reset animation (slide in)
        videoContainer.style.transition = "none"; // Remove transition for instant reset
        videoContainer.style.transform = `translateX(${next ? "100%" : "-100%"})`;

        setTimeout(() => {
            videoContainer.style.transition = "transform 0.7s ease-in-out, opacity 0.5s"; // Restore transition
            videoContainer.style.transform = "translateX(0)";
            videoContainer.style.opacity = "1";  // Fade in
        }, 50);
    }, 700); // Wait for slide-out before changing video
}

function nextTrailer() {
    currentIndex = (currentIndex + 1) % trailers.length;
    updateTrailer(true);
}

function prevTrailer() {
    currentIndex = (currentIndex - 1 + trailers.length) % trailers.length;
    updateTrailer(false);
}

// Automatically change trailer
setInterval(nextTrailer, 25000);