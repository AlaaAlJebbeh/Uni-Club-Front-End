//EVENTS
document.addEventListener("DOMContentLoaded", function() {
    // Get references to the links and content sections
    const myEventsLink = document.getElementById("my-events-link");
    const myEventsContent = document.getElementById("my-events-content");
    
    // Add click event listeners to the links
    myEventsLink.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent default link behavior
        
        // Hide all content sections
        hideAllContentSections();
        
        // Show the content section for My Events
        myEventsContent.style.display = "block";
    });
    
    // Define a function to hide all content sections
    function hideAllContentSections() {
        const allContentSections = document.querySelectorAll(".content-section");
        allContentSections.forEach(section => {
            section.style.display = "none";
        });
    }
    
    // Add similar event listeners and functions for other links
});

//POSTS
document.addEventListener("DOMContentLoaded", function() {
    // Get references to the links and content sections
    const myEventsLink = document.getElementById("my-posts-link");
    const myEventsContent = document.getElementById("my-posts-content");
    
    // Add click event listeners to the links
    myEventsLink.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent default link behavior
        
        // Hide all content sections
        hideAllContentSections();
        
        // Show the content section for My Events
        myEventsContent.style.display = "block";
    });
    
    // Define a function to hide all content sections
    function hideAllContentSections() {
        const allContentSections = document.querySelectorAll(".content-section");
        allContentSections.forEach(section => {
            section.style.display = "none";
        });
    }
    
    // Add similar event listeners and functions for other links
});

document.addEventListener("DOMContentLoaded", function() {
    // Get references to the links and content sections
    const myEventsLink = document.getElementById("my-status-link");
    const myEventsContent = document.getElementById("my-status-content");
    const x = document.getElementById("status-item");
    
    // Add click event listeners to the links
    myEventsLink.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent default link behavior
        
        // Hide all content sections
        hideAllContentSections();
        
        // Show the content section for My Events
        myEventsContent.style.display = "block";
        x.style.backgroundColor = "";
        myEventsLink.style.color = "";

    });
    
    // Define a function to hide all content sections and reset colors
    function hideAllContentSections() {
        const allContentSections = document.querySelectorAll(".content-section");
        allContentSections.forEach(section => {
            section.style.display = "none";
        });
        
        // Reset colors to default values (remove inline styles)
        x.style.backgroundColor = "";
        myEventsLink.style.color = "";

    }
});


//notification
document.addEventListener("DOMContentLoaded", function() {
    // Get the notification link and modal
    const notificationLink = document.getElementById("club-notifications-link");
    const notificationModal = document.getElementById("notificationModal");
    const closeButton = document.querySelector(".close");

    // Add click event listener to open the modal when the link is clicked
    notificationLink.addEventListener("click", function(event) {
        event.preventDefault();
        // Check if the link is within the specific content section
        if (notificationLink.closest("#my-notification-content")) {
            notificationModal.style.display = "block";
            // Here you can load notifications dynamically from a server or some data source
            // For now, let's assume notifications are already available
            displayNotifications();
        }
    });

    // Close the modal when the close button is clicked
    closeButton.addEventListener("click", function() {
        notificationModal.style.display = "none";
    });

    // Close the modal when the user clicks anywhere outside the modal
    window.addEventListener("click", function(event) {
        if (event.target === notificationModal) {
            notificationModal.style.display = "none";
        }
    });

    // Function to display notifications (assuming notifications are available)
    function displayNotifications() {
        const notificationList = document.getElementById("notificationList");
        // Clear any existing notifications
        notificationList.innerHTML = "";
        // Assuming notifications are available in an array
        const notifications = ["Notification 1", "Notification 2", "Notification 3"];
        // Add notifications to the list
        notifications.forEach(notification => {
            const li = document.createElement("li");
            li.textContent = notification;
            notificationList.appendChild(li);
        });
    }
});
