const currentPath = window.location.pathname;

// Select the corresponding link based on the current path
const homeLink = document.getElementById('home-link');
const clubsLink = document.getElementById('clubs-link');

// Add the "active" class to the correct link based on the current path
if (currentPath === '/') {
    homeLink.classList.add('active');
} else if (currentPath === '/clubs') {
    clubsLink.classList.add('active');
}