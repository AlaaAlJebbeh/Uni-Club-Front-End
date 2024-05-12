
const container = document.getElementById('containerc');
const loginBtn = document.getElementById('login');


loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

let searchBtn = document.querySelector('#search-btn');
let searchBar = document.querySelector('.search-bar-container');

let loginButton = document.querySelector('#log-btn');
let popup = document.querySelector(".popup");

searchBtn.addEventListener('click', ()=>{
    searchBtn.classList.toggle('fa-times');
    searchBar.classList.toggle('active');
});

loginButton.addEventListener('click', ()=>{
    popup.classList.add("open-popup");
});


$(document).ready(function(){
    $(".notifications .icon_wrap").click(function(){
      $(this).parent().toggleClass("active");
       $(".profile").removeClass("active");
    });

    $(".show_all .link").click(function(){
      $(".notifications").removeClass("active");
      $(".popupN").show();
    });

    $(".close").click(function(){
      $(".popupN").hide();
    });
});

$(document).ready(function() {
  // Add click event listener to all buttons with the class 'post-button'
  $('.club_info_button').click(function() {
      // Retrieve the post ID from the button's ID
      var clubIdId = parseInt($(this).attr('id').split('_')[1]);
      console.log('Button clicked for clubIdId ID:', clubIdId);
      // Perform further actions if needed
  });
})