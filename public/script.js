const fetchBibleVerse = async () => {
    try {
        const response = await fetch('https://kaiz-apis.gleeze.com/api/bible');
        const data = await response.json();
        
        const verseText = document.getElementById('verseText');
        const verseReference = document.getElementById('verseReference');
        
        verseText.textContent = data.verse[0].text;
        verseReference.textContent = data.reference;
        
        verseText.setAttribute('aria-live', 'polite');
        verseReference.setAttribute('aria-label', `Bible reference: ${data.reference}`);
        
    } catch (error) {
        console.error('Error fetching Bible verse:', error);
        document.getElementById('verseText').textContent = "Today's inspiration: Trust in the Lord with all your heart";
        document.getElementById('verseReference').textContent = "Proverbs 3:5";
    }
};

document.getElementById('refreshVerse').addEventListener('click', fetchBibleVerse);
document.addEventListener('DOMContentLoaded', fetchBibleVerse);

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
