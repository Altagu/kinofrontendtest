const API_URL = "kinofullstack-epcfgehdhse5eufz.northeurope-01.azurewebsites.net"


// Function to fetch the list of shows and populate the dropdown menu
function fetchShowList() {
    fetch('${API_URL}/api/shows2')
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok when fetching show list");
            }
            return response.json();
        })
        .then(data => {
            console.log("Received data:", data);
            const selector = document.getElementById('showSelector');
            // Clear the dropdown menu and add a default option
            selector.innerHTML = "<option value='' disabled selected>Select a show</option>";
            data.forEach(show => {
                let option = document.createElement('option');
                option.value = show.showId;
                // Customize the display text as needed (here we show show ID and movie ID)
                option.text = `Show ID: ${show.showId} (Movie ID: ${show.movieId})`;
                selector.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching show list:', error));
}

// Function to fetch data for a specific show and fill in the form
function fetchShowData(showId) {
    fetch(`${API_URL}/api/shows2/${showId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok when fetching show data");
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('movieId').value = data.movieId;
            document.getElementById('theatreId').value = data.theatreId;
            document.getElementById('showDate').value = data.showDate;
            document.getElementById('showTime').value = data.showTime;
        })
        .catch(error => console.error('Error fetching show data:', error));
}

// Function to update a show with modified data
function updateShow(id) {
    const updatedData = {
        movieId: document.getElementById('movieId').value,
        theatreId: document.getElementById('theatreId').value,
        showDate: document.getElementById('showDate').value,
        showTime: document.getElementById('showTime').value
    };

    fetch(`${API_URL}/api/shows2/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
        .then(response => {
            if (response.ok) {
                alert('The show has been updated!');
            } else {
                alert('Something went wrong while updating the show.');
            }
        })
        .catch(error => console.error('Error updating show:', error));
}

// When the page loads
window.addEventListener('load', () => {
    // Fetch the list of shows and populate the dropdown
    fetchShowList();

    // Add event listener to the dropdown: when the selection changes, fetch the selected show’s data
    document.getElementById('showSelector').addEventListener('change', (event) => {
        const showId = event.target.value;
        if (showId) {
            fetchShowData(showId);
        }
    });

    // Add event listener to the form: on submit, update the selected show
    document.getElementById('editForm').addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        const selectedShowId = document.getElementById('showSelector').value;
        if (selectedShowId) {
            updateShow(selectedShowId);
        } else {
            alert('Please select a show to edit.');
        }
    });
});
