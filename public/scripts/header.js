
const container = document.getElementById('containerh');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

let searchBtn = document.querySelector('#search-btn');
let searchBar = document.querySelector('.search-bar-containerh');

let loginButton = document.querySelector('#log-btn');
let popup = document.querySelector(".popup");

searchBtn.addEventListener('click', () => {
    searchBtn.classList.toggle('fa-times');
    searchBar.classList.toggle('active');
});

loginButton.addEventListener('click', () => {
    popup.classList.add("open-popup");
});




