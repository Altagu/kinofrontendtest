const API_URL = "kinofullstack-epcfgehdhse5eufz.northeurope-01.azurewebsites.net"


async function fetchMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (!movieId) {
        console.error("No movie ID found in URL");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/movies/${movieId}`);
        const movie = await response.json();

        document.getElementById("movie-title").textContent = movie.title;
        document.getElementById("movie-genre").textContent = `${movie.genre}`;
        document.getElementById("movie-duration").textContent = `${movie.duration} min`;
        document.getElementById("movie-age").textContent = `${movie.ageLimit || movie.age_limit}+`;
        document.getElementById("movie-description").textContent = movie.description;
        document.getElementById("movie-poster").src = movie.imagePath || "https://via.placeholder.com/300x450?text=No+Image";

        // Set backdrop image (use poster as fallback)
        document.getElementById("movie-backdrop").style.backgroundImage = `url(${movie.imagePath || "https://via.placeholder.com/1920x1080?text=No+Image"})`;

        // Set release date if available
        if (movie.releaseDate) {
            document.getElementById("release-date").textContent = new Date(movie.releaseDate).getFullYear();
        } else {
            document.getElementById("release-date").textContent = "2025"; // Placeholder
        }

        // Set rating if available (placeholder otherwise)
        if (movie.rating) {
            document.getElementById("movie-rating").textContent = movie.rating;
        }

        // Set trailer URL if available
        if (movie.trailerPath) {
            let embedUrl = movie.trailerPath.replace("watch?v=", "embed/");
            document.getElementById("movie-trailer").src = embedUrl;
            document.getElementById("trailer-container").style.display = "block";
        } else {
            document.getElementById("trailer-container").style.display = "none";
        }

    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
}

fetchMovieDetails();