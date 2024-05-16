
// Get the DOM elements for the image carousel
const wrapper = document.querySelector(".wrapper"),
  carousel = document.querySelector(".carousel"),
  images = document.querySelectorAll("img"),
  buttons = document.querySelectorAll(".button");
let imageIndex = 1,
  intervalId;

// Define function to start automatic image slider
const autoSlide = () => {
  // Start the slideshow by calling slideImage() every 2 seconds
  intervalId = setInterval(() => slideImage(++imageIndex), 2000);
};
// Call autoSlide function on page load
//autoSlide();

// A function that updates the carousel display to show the specified image
const slideImage = () => {
  // Calculate the updated image index
  imageIndex = imageIndex === images.length ? 0 : imageIndex < 0 ? images.length - 1 : imageIndex;
  // Update the carousel display to show the specified image
  carousel.style.transform = `translate(-${imageIndex * 100}%)`;
};

// A function that updates the carousel display to show the next or previous image
const updateClick = (e) => {
  // Stop the automatic slideshow
  clearInterval(intervalId);
  // Calculate the updated image index based on the button clicked
  imageIndex += e.target.id === "next" ? 1 : -1;
  slideImage(imageIndex);
  // Restart the automatic slideshow
  autoSlide();
};

// Add event listeners to the navigation buttons
buttons.forEach((button) => button.addEventListener("click", updateClick));

// Add mouseover event listener to wrapper element to stop auto sliding
wrapper.addEventListener("mouseover", () => clearInterval(intervalId));
// Add mouseleave event listener to wrapper element to start auto sliding again
wrapper.addEventListener("mouseleave", autoSlide);


function album(event_id) {
  fetch(`/album?event_id=${event_id}`, {
      method: 'GET' // Assuming you're using POST method for updating data
  })
  .then(response => {
      if (response.ok) {
          console.log('Data fetched successfully!');
          // Optionally, update the UI to reflect the approval
      } else {
          console.error('Failed to fetch img:', response.statusText);
      }
  })
  .catch(error => console.error('Error fetching data:', error));

 
  
}

$(document).ready(function() {
  // Add click event listener to all buttons with the class 'post-button'
  $('.add-button').click(function() {
      // Retrieve the post ID from the button's ID
      var eventId = parseInt($(this).attr('id').split('_')[1]);
      console.log('Button clicked for event ID:', eventId);
      // Perform further actions if needed
  });
});