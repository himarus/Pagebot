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
        try {
            const response = await fetch('https://kaiz-apis.gleeze.com/api/bible');
            const data = await response.json();
            verseTextElement.textContent = data.verse[0].text;
            verseReferenceElement.textContent = `— ${data.author}, ${data.reference}`;
        } catch (error) {
            verseTextElement.textContent = "Error fetching verse.";
            verseReferenceElement.textContent = "";
        }
    }

    // Function to fetch a random cat fact
    async function fetchCatFact() {
        try {
 const response = await fetch('https://meowfacts.herokuapp.com/');
            const data = await response.json();
            catfactTextElement.textContent = data.data[0];
        } catch (error) {
            catfactTextElement.textContent = "Error fetching cat fact.";
        }
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
