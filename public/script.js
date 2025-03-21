const fetchBibleVerse = async () => {
    const verseText = document.getElementById('verseText');
    const verseReference = document.getElementById('verseReference');
    
    showLoadingSpinner(verseText);
    showLoadingSpinner(verseReference);

    try {
        const response = await fetch('https://kaiz-apis.gleeze.com/api/bible');
        const data = await response.json();
        
        hideLoadingSpinner(verseText, data.verse[0].text);
        hideLoadingSpinner(verseReference, data.reference);
        
        verseText.setAttribute('aria-live', 'polite');
        verseReference.setAttribute('aria-label', `Bible reference: ${data.reference}`);
    } catch (error) {
        console.error('Error fetching Bible verse:', error);
        hideLoadingSpinner(verseText, "Today's inspiration: Trust in the Lord with all your heart");
        hideLoadingSpinner(verseReference, "Proverbs 3:5");
    }
};

const fetchCatFact = async () => {
    const catfactText = document.getElementById('catfactText');
    
    showLoadingSpinner(catfactText);

    try {
        const response = await fetch('https://kaiz-apis.gleeze.com/api/catfact');
        const data = await response.json();
        
        hideLoadingSpinner(catfactText, data.fact);
        catfactText.setAttribute('aria-live', 'polite');
    } catch (error) {
        console.error('Error fetching cat fact:', error);
        hideLoadingSpinner(catfactText, "Cats are amazing creatures!");
    }
};

const showLoadingSpinner = (element) => {
    element.innerHTML = `<div class="spinner"></div>`;
};

const hideLoadingSpinner = (element, content) => {
    element.textContent = content;
};

const updateDateTime = () => {
    const datetimeElement = document.getElementById('datetime');
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    datetimeElement.textContent = now.toLocaleDateString('en-US', options);
};

setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call

const toggleTheme = () => {
    const body = document.body;
    body.classList.toggle('light-mode');

    const themeToggle = document.getElementById('themeToggle');
    if (body.classList.contains('light-mode')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
};

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

document.getElementById('refreshVerse').addEventListener('click', fetchBibleVerse);
document.getElementById('refreshCatFact').addEventListener('click', fetchCatFact);
document.addEventListener('DOMContentLoaded', () => {
    fetchBibleVerse();
    fetchCatFact();
});

particlesJS('particles-js', {
    particles: {
        number: { value: 60 },
        color: { value: '#4a90e2' },
        opacity: { value: 0.4 },
        size: { value: 2.5 },
        move: {
            speed: 1.5,
            out_mode: 'bounce'
        }
    },
    interactivity: {
        events: {
            onhover: { enable: true, mode: 'grab' }
        }
    }
});
