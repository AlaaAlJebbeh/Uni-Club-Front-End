

$(document).ready(function() {
    // Add click event listener to all buttons with the class 'post-button'
    $('.details-button').click(function() {
        // Retrieve the post ID from the button's ID
        var eventId = parseInt($(this).attr('id').split('_')[1]);
        console.log('Button clicked for event ID:', eventId);
        // Perform further actions if needed
    });
});

function showPopup(buttonId) {
    // Make a GET request to fetch the popup content for the given button ID
    fetch(`/popupContent?buttonId=${buttonId}`)
    .then(response => response.text())
    .then(data => {
        // Insert the fetched popup content into the popup container
        document.getElementById("popup").innerHTML = data;
        // Display the popup
        document.getElementById("popup").style.display = "block";
    })
    .catch(error => console.error('Error fetching popup content:', error));
}

// Inside eventsRequests.js

function approveEvent(eventId) {
    fetch(`/approveEvent?eventId=${eventId}`, {
        method: 'POST' // Assuming you're using POST method for updating data
    })
    .then(response => {
        if (response.ok) {
            console.log('Event approved successfully!');
            // Optionally, update the UI to reflect the approval
        } else {
            console.error('Failed to approve event:', response.statusText);
        }
    })
    .catch(error => console.error('Error approving event:', error));
}


