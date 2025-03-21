particlesJS('particles-js', {
    particles: {
        number: { value: 80 },
        color: { value: '#4a90e2' },
        shape: { type: 'circle' },
        opacity: { value: 0.5 },
        size: { value: 3 },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: { enable: true, mode: 'repulse' },
            onclick: { enable: true, mode: 'push' },
            resize: true
        }
    },
    retina_detect: true
});

const formatDateTime = () => {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    
    return new Intl.DateTimeFormat('en-PH', options).format(new Date());
};

const updateTime = () => {
    const datetimeElement = document.getElementById('datetime');
    datetimeElement.style.opacity = '0';
    
    setTimeout(() => {
        datetimeElement.textContent = formatDateTime();
        datetimeElement.style.opacity = '1';
    }, 300);
};

const themeToggle = document.getElementById('darkModeToggle');
const setTheme = (isDark) => {
    document.body.classList.toggle('dark-mode', isDark);
    themeToggle.setAttribute('aria-pressed', isDark);
    localStorage.setItem('darkMode', isDark);
};

const savedTheme = localStorage.getItem('darkMode') === 'true';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    setTheme(isDark);
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.container > *').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.5s ease';
    observer.observe(el);
});

setInterval(updateTime, 1000);
updateTime();
