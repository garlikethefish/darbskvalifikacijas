const openButtons = document.querySelectorAll('.modal-button');
const modals = document.querySelectorAll('.modal');
const hamburgerMenu = document.querySelector('.hamburger-menu');
const navLinks = document.querySelector('.nav-links');
const donateLink = document.querySelector('.donate-link');
const mainContent = document.querySelector('main');
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;

openButtons.forEach(button => {
    button.addEventListener('click', function() {
        const targetModal = document.getElementById(this.getAttribute('data-target'));
        targetModal.style.display = "block";
    });
});

modals.forEach(modal => {
    const closeButton = modal.querySelector('.close');
    closeButton.addEventListener('click', function() {
        modal.style.display = "none";
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

hamburgerMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    donateLink.classList.toggle('hidden');
    mainContent.classList.toggle('shifted');
});

themeToggleButton.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  themeToggleButton.textContent = body.classList.contains('light-mode') ? '🌞' : '🌙'; 
});