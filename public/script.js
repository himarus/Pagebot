document.addEventListener('DOMContentLoaded', () => {
    const datetimeElement = document.getElementById('datetime');
    const verseTextElement = document.getElementById('verseText');
    const verseReferenceElement = document.getElementById('verseReference');
    const catfactTextElement = document.getElementById('catfactText');
    const themeToggleButton = document.getElementById('themeToggle');
    const refreshVerseButton = document.getElementById('refreshVerse');
    const refreshCatFactButton = document.getElementById('refreshCatFact');

    function updateDateTime() {
        const now = new Date();
        datetimeElement.textContent = now.toLocaleString();
    }

    async function fetchBibleVerse() {
        try {
            const response = await fetch('https://kaiz-apis.gleeze.com/api/bible');
            const data = await response.json();
            verseTextElement.textContent = data.verse[0].text;
            verseReferenceElement.textContent = data.reference;
        } catch (error) {
            verseTextElement.textContent = 'Error fetching verse.';
        }
    }

    async function fetchCatFact() {
        try {
            const response = await fetch('https://kaiz-apis.gleeze.com/api/catfact');
            const data = await response.json();
            catfactTextElement.textContent = data.fact;
        } catch (error) {
            catfactTextElement.textContent = 'Error fetching cat fact.';
        }
    }

    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        updateDateTime();
    });

    refreshVerseButton.addEventListener('click', fetchBibleVerse);
    refreshCatFactButton.addEventListener('click', fetchCatFact);

    updateDateTime();
    fetchBibleVerse();
    fetchCatFact();
    setInterval(updateDateTime, 60000); // Update every minute
});
