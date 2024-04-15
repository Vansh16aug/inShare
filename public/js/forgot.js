const button = document.querySelector('.forgotpass-button');
const modal = document.querySelector('.modal');
const closeBtn = document.querySelector('.close');

const cross = document.querySelector('.cross');
const msgToast = document.querySelector('.msg');

button.addEventListener('click', () => {
	modal.style.display = 'block';
})
closeBtn.addEventListener('click', () => {
	modal.style.display = 'none';
})

// Remove the Toast Message when cross button is clicked
cross.addEventListener('click', () => {
	msgToast.style.display = 'none';
})