// Function to add click listeners to links
function addClickListener(linkId, contentId) {
    const link = document.getElementById(linkId);
    const content = document.getElementById(contentId);

    link.addEventListener("click", function(event) {
        event.preventDefault();
        hideAllContentSections();
        content.style.display = "block";
    });
}

// Function to hide all content sections
function hideAllContentSections() {
    const allContentSections = document.querySelectorAll(".content-section");
    allContentSections.forEach(section => {
        section.style.display = "none";
    });
}

// Initialize event listeners on DOMContentLoaded
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

// Search bar functionality
let searchBtn1 = document.querySelector("#search-btn");
let searchBar = document.querySelector(".search-bar-container");

searchBtn1.addEventListener("click", () => {
    searchBtn1.classList.toggle("fa-times");
    searchBar.classList.toggle("active");
});