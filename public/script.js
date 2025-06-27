document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const datetimeElement = document.getElementById('datetime');
    const themeToggle = document.getElementById('themeToggle');
    const catfactText = document.getElementById('catfactText');
    const refreshCatFact = document.getElementById('refreshCatFact');

    // Initialize particles
    initializeParticles();

    // Initialize theme
    initializeTheme();

    // Start datetime updates
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Load initial cat fact
    fetchCatFact();

    // Event listeners
    themeToggle.addEventListener('click', toggleTheme);
    refreshCatFact.addEventListener('click', fetchCatFact);

    // Add keyboard support for refresh button
    refreshCatFact.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fetchCatFact();
        }
    });

    // Functions
    function updateDateTime() {
        const now = new Date();
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
        
        datetimeElement.textContent = now.toLocaleDateString('en-US', options);
    }

    function initializeTheme() {
        // Check for saved theme preference or default to dark mode
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
            document.body.classList.add('light-mode');
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('light-mode');
        
        // Save theme preference
        const isLightMode = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
        
        // Add a subtle animation to the toggle button
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 150);
    }

    async function fetchCatFact() {
        // Add loading state
        catfactText.classList.add('loading');
        catfactText.textContent = 'Fetching a new cat fact...';
        
        // Disable refresh button during fetch
        refreshCatFact.disabled = true;
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch('https://meowfacts.herokuapp.com/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.data && data.data[0]) {
                catfactText.textContent = data.data[0];
            } else {
                throw new Error('Invalid response format');
            }
            
        } catch (error) {
            console.error('Error fetching cat fact:', error);
            
            // Fallback cat facts
            const fallbackFacts = [
                "Cats have been associated with humans for over 9,000 years.",
                "A group of cats is called a 'clowder'.",
                "Cats spend 70% of their lives sleeping.",
                "A cat's purr vibrates at a frequency that promotes bone healing.",
                "Cats have a third eyelid called a 'nictitating membrane'.",
                "The oldest known pet cat existed 9,500 years ago.",
                "Cats can't taste sweetness.",
                "A cat's nose print is unique, just like a human's fingerprint."
            ];
            
            const randomFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
            catfactText.textContent = randomFact;
            
            // Show error message briefly
            const originalText = catfactText.textContent;
            catfactText.textContent = "Using backup cat fact due to connection issue...";
            setTimeout(() => {
                catfactText.textContent = originalText;
            }, 2000);
        } finally {
            // Remove loading state and re-enable button
            catfactText.classList.remove('loading');
            refreshCatFact.disabled = false;
        }
    }

    function initializeParticles() {
        if (typeof particlesJS === 'undefined') {
            console.warn('Particles.js not loaded');
            return;
        }

        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 50,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ['#00ffff', '#0080ff', '#ff0080', '#00ff80']
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.5,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00ffff',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }

    // Performance optimization: Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all glass cards for scroll animations
    document.querySelectorAll('.glass-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add smooth scroll behavior for any internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Handle offline/online states
    function updateConnectionStatus() {
        const isOnline = navigator.onLine;
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        const statusPulse = document.querySelector('.status-pulse');
        
        if (isOnline) {
            statusText.innerHTML = 'System Status: <span class="highlight neon-text">Operational</span>';
            statusDot.style.background = 'var(--neon-lime)';
            statusDot.style.boxShadow = '0 0 15px var(--neon-lime)';
            statusPulse.style.background = 'var(--neon-lime)';
        } else {
            statusText.innerHTML = 'System Status: <span class="highlight" style="color: var(--neon-orange);">Offline</span>';
            statusDot.style.background = 'var(--neon-orange)';
            statusDot.style.boxShadow = '0 0 15px var(--neon-orange)';
            statusPulse.style.background = 'var(--neon-orange)';
        }
    }

    // Listen for connection changes
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    // Initial connection status check
    updateConnectionStatus();

    // Add subtle typing animation for the personal description
    const description = document.querySelector('.personal-description');
    const originalText = description.textContent;
    
    function typeWriter(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        // Start typing after a short delay
        setTimeout(type, 1000);
    }

    // Observe the personal info section for the typing effect
    const personalInfoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.typed) {
                entry.target.dataset.typed = 'true';
                typeWriter(description, originalText, 30);
            }
        });
    }, { threshold: 0.5 });

    personalInfoObserver.observe(document.querySelector('.personal-info'));
});
