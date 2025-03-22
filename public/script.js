document.addEventListener('DOMContentLoaded', () => {
    const d = document.getElementById('datetime');
    const t = document.getElementById('themeToggle');
    const vText = document.getElementById('verseText');
    const vRef = document.getElementById('verseReference');
    const rVerse = document.getElementById('refreshVerse');
    const cText = document.getElementById('catfactText');
    const rCatFact = document.getElementById('refreshCatFact');

    function updateDateTime() {
        const now = new Date();
        d.textContent = now.toLocaleString();
    }

    async function fetchBibleVerse() {
        try {
            const response = await fetch('https://kaiz-apis.gleeze.com/api/bible');
            const data = await response.json();
            vText.textContent = data.verse[0].text;
            vRef.textContent = data.reference;
        } catch (error) {
            vText.textContent = "Error fetching verse.";
            vRef.textContent = "";
        }
    }

    async function fetchCatFact() {
        try {
            const response = await fetch('https://meowfacts.herokuapp.com/');
            const data = await response.json();
            cText.textContent = data.data[0];
        } catch (error) {
            cText.textContent = "Error fetching cat fact.";
        }
    }

    rVerse.addEventListener('click', fetchBibleVerse);
    rCatFact.addEventListener('click', fetchCatFact);
    t.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });

    updateDateTime();
    fetchBibleVerse();
    fetchCatFact();
    setInterval(updateDateTime, 1000);
});
