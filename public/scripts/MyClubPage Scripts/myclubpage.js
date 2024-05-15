
function addClickListener(linkId, contentId) {
    const link = document.getElementById(linkId);
    const content = document.getElementById(contentId);

    link.addEventListener("click", function(event) {
        event.preventDefault();
        hideAllContentSections();
        content.style.display = "block";
    });
}


function hideAllContentSections() {
    const allContentSections = document.querySelectorAll(".content-section");
    allContentSections.forEach(section => {
        section.style.display = "none";
    });
}


document.addEventListener("DOMContentLoaded", function() {
    const myEventsLink = document.getElementById("my-events-link");
    const myPostsLink = document.getElementById("my-posts-link");
    const myStatusLink = document.getElementById("my-status-link");
    const myProfileLink = document.getElementById("my-profile-link");;

    if (myEventsLink){
        addClickListener("my-events-link", "my-events-content");
    }
    if (myPostsLink){
        addClickListener("my-posts-link", "my-posts-content");
    }
    if (myStatusLink){
        addClickListener("my-status-link", "my-status-content");
    }
    if (myProfileLink){
        addClickListener("my-profile-link", "my-profile-content");
    }


    // Notification modal functionality
    const notificationLink = document.getElementById("club-notifications-link");
    const notificationModal = document.getElementById("notificationModal");
    const closeButton = document.querySelector(".close");

    notificationLink.addEventListener("click", function(event) {
        event.preventDefault();
        notificationModal.style.display = "block";
        displayNotifications();
    });



    window.addEventListener("click", function(event) {
        if (event.target === notificationModal) {
            notificationModal.style.display = "none";
        }
    });

    function displayNotifications() {
        const notificationList = document.getElementById("notificationList");
        notificationList.innerHTML = "";
        const notifications = ["Notification 1", "Notification 2", "Notification 3"];
        notifications.forEach(notification => {
            const li = document.createElement("li");
            li.textContent = notification;
            notificationList.appendChild(li);
        });
    }
});

$(document).ready(function() {
    // Add click event listener to all buttons with the class 'post-button'
    $('.approve-button').click(function() {
        // Retrieve the post ID from the button's ID
        var eventToShareId = parseInt($(this).attr('id').split('_')[1]);
        console.log('Button clicked for eventToShareId ID:', eventToShareId);
        // Perform further actions if needed
    });
})
document.addEventListener("DOMContentLoaded", function() {
    const editIcons = document.querySelectorAll('.edit-icon');
    editIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const eventID = this.getAttribute('data-eventid');
            const saveButton = document.getElementById(`save-button-${eventID}`);
            const uploadButton = document.getElementById(`upload-button-${eventID}`);
            const clubName = document.getElementById(`clubName_${eventID}`);
            const eventName = document.getElementById(`eventName_${eventID}`);
            const eventDate = document.getElementById(`eventDate_${eventID}`);
            const eventTime = document.getElementById(`eventTime_${eventID}`);
            const eventLocation = document.getElementById(`eventLocation_${eventID}`);
            const eventLanguage = document.getElementById(`eventLanguage_${eventID}`);
            const eventGuest = document.getElementById(`eventGuest_${eventID}`);
            const eventDescription = document.getElementById(`eventDescription_${eventID}`);
            const eventCapacity = document.getElementById(`eventCapacity_${eventID}`);
            const eventCategory = document.getElementById(`eventCategory_${eventID}`);
            const eventNotes = document.getElementById(`eventNotes_${eventID}`);

            const editableElements = [
                clubName, eventName, eventDate, eventTime, eventLocation,
                eventLanguage, eventGuest, eventDescription, eventCapacity,
                eventCategory, eventNotes
            ];

            // Check the current editable state of the first element to determine the toggle state
            const isEditable = editableElements[0].getAttribute('contenteditable') === 'true';

            // Toggle the contenteditable state of each element
            editableElements.forEach(element => {
                if (element) {
                    element.setAttribute('contenteditable', !isEditable);
                }
            });

            // Show or hide the save and upload buttons based on the editable state
            saveButton.style.display = isEditable ? 'none' : 'block';
            uploadButton.style.display = isEditable ? 'none' : 'block';
        });
    });

    const saveButtons = document.querySelectorAll('.events-save-button');
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const eventID = this.getAttribute('data-eventid');
            console.log("Event ID in Javascript: " + eventID);
            const form = document.getElementById(`edit-form-${eventID}`);
            const imageContainer = document.getElementById(`image-container-${eventID}`);
            const imageSrc = imageContainer.querySelector('img').src; // Get the current image source

            // Create a hidden input field for the image source and append it to the form
            const imageInput = document.createElement('input');
            imageInput.type = 'hidden';
            imageInput.name = 'eventImage';
            imageInput.value = imageSrc.split('images/')[1];;
            form.appendChild(imageInput);

            // Submit the form
            form.submit();
        });
    });
});
