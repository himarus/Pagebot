document.addEventListener('DOMContentLoaded', () => {
    const datetimeElement = document.getElementById('datetime');
    const themeToggleButton = document.getElementById('themeToggle');
    const verseTextElement = document.getElementById('verseText');
    const verseReferenceElement = document.getElementById('verseReference');
    const refreshVerseButton = document.getElementById('refreshVerse');
    const catfactTextElement = document.getElementById('catfactText');
    const refreshCatFactButton = document.getElementById('refreshCatFact');

    // Function to update the current date and time
    function updateDateTime() {
        const now = new Date();
        datetimeElement.textContent = now.toLocaleString();
    }

    // Function to fetch a random Bible verse
    async function fetchBibleVerse() {
        const response = await fetch('https://api.quotable.io/random?tags=bible');
        const data = await response.json();
        verseTextElement.textContent = data.content;
        verseReferenceElement.textContent = `— ${data.author}`;
    }

    // Function to fetch a random cat fact
    async function fetchCatFact() {
        const response = await fetch('https://meowfacts.herokuapp.com/');
        const data = await response.json();
        catfactTextElement.textContent = data.data[0];
    }

    // Event listeners for buttons
    refreshVerseButton.addEventListener('click', fetchBibleVerse);
    refreshCatFactButton.addEventListener('click', fetchCatFact);
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });

    // Initial function calls
    updateDateTime();
    fetchBibleVerse();
    fetchCatFact();
    setInterval(updateDateTime, 1000);
});
