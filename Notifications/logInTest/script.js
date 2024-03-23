const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

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

