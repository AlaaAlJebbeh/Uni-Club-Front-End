let searchBtn = document.querySelector('#search-btn');
let searchBar = document.querySelector('.search-bar-container');

searchBtn.addEventListener('click', () => {
    searchBtn.classList.toggle('fa-times');
    searchBar.classList.toggle('active');
});

//handling pop up
function showPopup() {
    document.getElementById("popup").style.display = "block"
    
}

function showPopup(buttonId) {
    // Make a GET request to fetch the popup content for the given button ID
    fetch(`/popupEditManager?clubId=${buttonId}`)
    .then(response => response.text())
    .then(data => {
        // Insert the fetched popup content into the popup container
        document.getElementById("popup").innerHTML = data;
        // Display the popup
        document.getElementById("popup").style.display = "block";
    })
    .catch(error => console.error('Error fetching popup content:', error));
}

// Function to close the popup card
function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// Attach click event listener to the button
var buttons = document.querySelectorAll('.edit_button');
     buttons.forEach(function(button)
        {
            button.addEventListener('click', showPopup);
        });


$(document).ready(function() {
    // Add click event listener to all buttons with the class 'post-button'
    $('.edit-button').click(function() {
        // Retrieve the post ID from the button's ID
        var clubManagerToEditId = parseInt($(this).attr('id').split('_')[1]);
        console.log('Button clicked for edit manager of club ID:', clubManagerToEditId);
        // Perform further actions if needed
    });
})








