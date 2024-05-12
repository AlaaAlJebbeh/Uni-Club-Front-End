
$(document).ready(function() {
  // Add click event listener to all buttons with the class 'post-button'
  $('.club_info_button').click(function() {
      // Retrieve the post ID from the button's ID
      var clubIdId = parseInt($(this).attr('id').split('_')[1]);
      console.log('Button clicked for clubIdId ID:', clubIdId);
      // Perform further actions if needed
  });
})

document.addEventListener('DOMContentLoaded', function() {
  const clubSearchForm = document.getElementById('club-search-form');
  const clubCards = document.querySelectorAll('.cardc');

  if (clubSearchForm && clubCards) {
      clubSearchForm.addEventListener('submit', function(event) {
          event.preventDefault(); // Prevent form submission

          const searchTerm = document.getElementById('club-search-input').value.trim().toLowerCase();

          // Filter club cards based on search term
          clubCards.forEach(function(card) {
              const clubNameElement = card.querySelector('.namec');
              if (clubNameElement) {
                  const clubName = clubNameElement.textContent.trim().toLowerCase();

                  // Show or hide club cards based on search term
                  if (clubName.includes(searchTerm)) {
                      card.style.display = 'block'; // Show the club card
                  } else {
                      card.style.display = 'none'; // Hide the club card
                  }
              }
          });

          // Move matching cards to the top of the container
          const container = document.querySelector('.div-01');
          container.innerHTML = ''; // Clear existing content

          clubCards.forEach(function(card) {
              if (card.style.display !== 'none') {
                  container.appendChild(card); // Append matching cards to the container
              }
          });
      });
  } else {
      console.error('club-search-form or cardc elements not found.');
  }
});