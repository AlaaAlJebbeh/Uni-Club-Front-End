
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
    addClickListener("my-events-link", "my-events-content");
    addClickListener("my-posts-link", "my-posts-content");
    addClickListener("my-status-link", "my-status-content");
    addClickListener("my-profile-link", "my-profile-content");

    // Notification modal functionality
    const notificationLink = document.getElementById("club-notifications-link");
    const notificationModal = document.getElementById("notificationModal");
    const closeButton = document.querySelector(".close");

    notificationLink.addEventListener("click", function(event) {
        event.preventDefault();
        notificationModal.style.display = "block";
        displayNotifications();
    });

    closeButton.addEventListener("click", function() {
        notificationModal.style.display = "none";
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





