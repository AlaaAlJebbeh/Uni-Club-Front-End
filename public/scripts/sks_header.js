const currentPath = window.location.pathname;

// Select the corresponding link based on the current path
const homeLink = document.getElementById('home-link');
const clubsLink = document.getElementById('clubs-link');
const comparingLink = document.getElementById('comparing-link');
const eventRequestsLink = document.getElementById('event-requests-link');
const clubManagerLink = document.getElementById('club-manager-link');

// Add the "active" class to the correct link based on the current path
if (currentPath === '/') {
    homeLink.classList.add('active');
} else if (currentPath === '/clubs') {
    clubsLink.classList.add('active');
}else if (currentPath === '/comparing') {
    comparingLink.classList.add('active');
}else if (currentPath === '/eventRequests') {
    eventRequestsLink.classList.add('active');
}else if (currentPath === '/clubManagerSks') {
    clubManagerLink.classList.add('active');
}