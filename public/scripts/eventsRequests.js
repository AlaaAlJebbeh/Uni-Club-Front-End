

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
$(document).ready(function() {
    // Add click event listener to all buttons with the class 'post-button'
    $('.approve-button').click(function() {
        // Retrieve the post ID from the button's ID
        var eventId = parseInt($(this).attr('id').split('_')[1]);
        console.log('Button clicked for eventToShareId ID:', eventId);
        // Perform further actions if needed
    });
});


function approveEvent(eventId) {
    fetch(`/approveEvent?eventId=${eventId}`, {
        method: 'POST' // Assuming you're using POST method for updating data
    })
    .then(response => {
        if (response.ok) {
            const statusElement = document.getElementById(`status_${eventId}`);
            statusElement.textContent = "Approved";
            console.log('Event approved successfully!');
            // Optionally, update the UI to reflect the approval
        } else {
            console.error('Failed to approve event:', response.statusText);
        }
    })
    .catch(error => console.error('Error approving event:', error));

    const statusElement = document.getElementById(`status_${eventId}`);
    if (statusElement) {
        statusElement.textContent = "Approved";
    }
    
}



function reject(postId, requestId) {
    // Store PostID and RequestID in a global variable accessible by the sendRejectionReason function
    window.selectedPostId = postId;
    window.selectedRequestId = requestId;
    showPopup2();
  }

  function sendRejectionReason() {
    var rejectionReason = document.getElementById("rejectionReason").value;
    fetch('/rejectMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId: window.selectedPostId, rejectionReason: rejectionReason })
    })
    .then(response => {
        if (response.ok) {
            console.log("Rejection reason sent successfully");
            closePopup2(); // Close the popup after sending rejection reason
        } else {
            console.error("Failed to send rejection reason", response.status);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
  }

  // Function to display the popup
  function showPopup2() {
    var popup = document.getElementById("reject");
    popup.style.display = "block";
  }

  // Function to close the popup
  function closePopup2() {
    var popup = document.getElementById("reject");
    popup.style.display = "none";
  }