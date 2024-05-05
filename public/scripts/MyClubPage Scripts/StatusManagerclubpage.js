
function showDetails(index) {
  // Retrieve the club ID from the button's data attribute
  var clubId = document
    .querySelector(`.details-button[data-club-id="${index}"]`)
    .getAttribute("data-club-id");

  // Fetch the old picture URL from the club table using AJAX
  fetch(`/getOldPicture?clubId=${clubId}`)
    .then((response) => response.json())
    .then((data) => {
      // Display the old picture URL in the popup
      document.getElementById("beforetext").innerText = data.image;
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  // Show the popup
  document.getElementById("popup").style.display = "block";
}
// Function to show the popup card
function showPopup() {
  document.getElementById("popup").style.display = "block";
}

// Function to close the popup card
function closePopup() {
  document.getElementById("popup").style.display = "none";
}

// Attach click event listener to the button
var buttons = document.querySelectorAll(".details-button");
buttons.forEach(function (button) {
  button.addEventListener("click", function (e) {
    showPopup();
    // Display the concatenated keys
  });
});

console.log(beforeText);
