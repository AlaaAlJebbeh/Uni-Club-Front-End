const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});


let loginButton = document.querySelector('#log-btn');
let popup = document.querySelector(".popup");


loginButton.addEventListener('click', () => {
    popup.classList.add("open-popup");
});



