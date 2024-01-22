let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}

window.onscroll = () => {
    menu.classList.remove('bx-x');
    navbar.classList.remove('active');
}

const sr = ScrollReveal({
    distance: '60px',
    duration: 2500,
    delay: 400,
    reset: true
})

sr.reveal('.text', { delay: 200, origin: 'top' })
sr.reveal('.form-container form', { delay: 800, origin: 'left' })
sr.reveal('.heading', { delay: 800, origin: 'top' })
sr.reveal('.ride-container .box', { delay: 600, origin: 'top' })
sr.reveal('.services-container .box', { delay: 600, origin: 'top' })
sr.reveal('.about-container .box', { delay: 600, origin: 'top' })
sr.reveal('.reviews-container', { delay: 600, origin: 'top' })
sr.reveal('.newsletter .box', { delay: 400, origin: 'bottom' })


const subHide = document.querySelectorAll('.sub-hide');
const subEnb = document.querySelector('.sub-enb');
const mainForm = document.getElementById('main-form');
const services = document.getElementById('services');

const hideSubHide = hide => {
    if (hide) subHide.forEach(e => e.style.display = 'none');
    else subHide.forEach(e => e.style.display = 'flex');
}

hideSubHide(true);

let selectedlocation = null, selectedpickupDate = null, selectedreturnDate = null;

mainForm.addEventListener('submit', event => {
    event.preventDefault();
    selectedlocation = event.path[0][0].value;
    selectedpickupDate = event.path[0][1].value;
    selectedreturnDate = event.path[0][2].value;
    hideSubHide(false);
    services.scrollIntoView();
})

subHide.forEach(e => {
    e.addEventListener('click', async event => {
        const carName = (event.path[1].querySelector('h3').innerText);
        const carPrice = (event.path[1].querySelector('.price').innerText);
        if (!selectedlocation || !selectedpickupDate || !selectedreturnDate) return;
        const res = await fetch('/api/rent', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            Credential: 'include',
            body: JSON.stringify({ location: selectedlocation, pickupDate: selectedpickupDate, returnDate: selectedreturnDate, carName, carPrice })
        }).then(res => res.json());
        alert(`Booking ${res.error ? 'unsuccessfull' : 'successfull'} \n${JSON.stringify(res)}`);
        selectedlocation = null;
        selectedpickupDate = null;
        selectedreturnDate = null;
        hideSubHide(true);
    });
});