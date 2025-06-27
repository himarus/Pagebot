document.addEventListener('DOMContentLoaded', () => {
    const datetimeElement = document.getElementById('datetime');
    const refreshActivity = document.getElementById('refreshActivity');
    const startBot = document.getElementById('startBot');
    const stopBot = document.getElementById('stopBot');
    const restartBot = document.getElementById('restartBot');
    const uptimeElement = document.getElementById('uptime');
    const messageCountElement = document.getElementById('messageCount');
    const activeUsersElement = document.getElementById('activeUsers');
    const responseRateElement = document.getElementById('responseRate');
    const serverLoadElement = document.getElementById('serverLoad');
    const activityLog = document.getElementById('activityLog');
    const systemLogs = document.getElementById('systemLogs');

    let startTime = Date.now();
    let messageCount = 2847;
    let activeUsers = 156;
    let responseRate = 98.5;
    let serverLoad = 23;
    let botRunning = true;

    initializeParticles();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setInterval(updateUptime, 1000);
    setInterval(updateStats, 3000);
    setInterval(updateActivityLog, 5000);
    setInterval(addSystemLog, 8000);

    refreshActivity.addEventListener('click', refreshActivityLog);
    startBot.addEventListener('click', () => toggleBot('start'));
    stopBot.addEventListener('click', () => toggleBot('stop'));
    restartBot.addEventListener('click', () => toggleBot('restart'));

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

    function updateUptime() {
        const now = Date.now();
        const uptime = now - startTime;
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
        
        uptimeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateStats() {
        if (botRunning) {
            messageCount += Math.floor(Math.random() * 8) + 2;
            activeUsers += Math.floor(Math.random() * 5) - 2;
            activeUsers = Math.max(50, Math.min(300, activeUsers));
            
            responseRate += (Math.random() - 0.5) * 0.2;
            responseRate = Math.max(95, Math.min(100, responseRate));
            
            serverLoad += (Math.random() - 0.5) * 5;
            serverLoad = Math.max(15, Math.min(85, serverLoad));
            
            messageCountElement.textContent = messageCount.toLocaleString();
            activeUsersElement.textContent = activeUsers.toString();
            responseRateElement.textContent = responseRate.toFixed(1) + '%';
            serverLoadElement.textContent = serverLoad.toFixed(0) + '%';
        }
    }

    function updateActivityLog() {
        if (!botRunning) return;
        
        const activities = [
            'Message auto-reply sent successfully',
            'User query processed and resolved',
            'Facebook API connection verified',
            'New user interaction detected',
            'Command executed successfully',
            'Database query completed',
            'User engagement tracked',
            'Notification sent to admin',
            'System health check passed',
            'Cache updated successfully',
            'User preferences saved',
            'Analytics data collected',
            'Security scan completed',
            'Backup process initiated',
            'Performance metrics updated'
        ];

        const now = new Date();
        const timeString = now.toTimeString().slice(0, 8);
        const activity = activities[Math.floor(Math.random() * activities.length)];
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <span class="activity-time">${timeString}</span>
            <span class="activity-text">${activity}</span>
        `;
        
        activityLog.insertBefore(activityItem, activityLog.firstChild);
        
        if (activityLog.children.length > 8) {
            activityLog.removeChild(activityLog.lastChild);
        }
    }

    function addSystemLog() {
        if (!botRunning) return;
        
        const logTypes = ['info', 'success', 'warning'];
        const logMessages = {
            info: [
                '[INFO] System monitoring active',
                '[INFO] Database connection stable',
                '[INFO] API rate limit: 85% remaining',
                '[INFO] Memory usage: 45% of allocated',
                '[INFO] Active connections: ' + Math.floor(Math.random() * 50 + 100)
            ],
            success: [
                '[SUCCESS] Message delivery confirmed',
                '[SUCCESS] User authentication completed',
                '[SUCCESS] Data synchronization finished',
                '[SUCCESS] Backup completed successfully',
                '[SUCCESS] Security validation passed'
            ],
            warning: [
                '[WARNING] High traffic detected',
                '[WARNING] API response time increased',
                '[WARNING] Memory usage above 70%',
                '[WARNING] Rate limit approaching threshold'
            ]
        };
        
        const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
        const messages = logMessages[logType];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${logType}`;
        logEntry.innerHTML = `
            <span class="log-time">${timestamp}</span>
            <span class="log-message">${message}</span>
        `;
        
        systemLogs.insertBefore(logEntry, systemLogs.firstChild);
        
        if (systemLogs.children.length > 10) {
            systemLogs.removeChild(systemLogs.lastChild);
        }
    }

    function refreshActivityLog() {
        activityLog.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => updateActivityLog(), i * 200);
        }
    }

    function toggleBot(action) {
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        const statusPulse = document.querySelector('.status-pulse');
        
        startBot.classList.remove('active');
        stopBot.classList.remove('active');
        restartBot.classList.remove('active');
        
        switch(action) {
            case 'start':
                botRunning = true;
                startBot.classList.add('active');
                statusText.innerHTML = 'Bot Status: <span class="highlight neon-text">Running</span>';
                statusDot.style.background = 'var(--neon-lime)';
                statusDot.style.boxShadow = '0 0 15px var(--neon-lime)';
                statusPulse.style.background = 'var(--neon-lime)';
                addActivityLogEntry('ChilliBot started successfully');
                addSystemLogEntry('success', '[SUCCESS] Bot initialization completed');
                break;
                
            case 'stop':
                botRunning = false;
                stopBot.classList.add('active');
                statusText.innerHTML = 'Bot Status: <span class="highlight" style="color: var(--neon-orange);">Stopped</span>';
                statusDot.style.background = 'var(--neon-orange)';
                statusDot.style.boxShadow = '0 0 15px var(--neon-orange)';
                statusPulse.style.background = 'var(--neon-orange)';
                addActivityLogEntry('ChilliBot stopped by administrator');
                addSystemLogEntry('warning', '[WARNING] Bot service stopped');
                break;
                
            case 'restart':
                botRunning = false;
                restartBot.classList.add('active');
                statusText.innerHTML = 'Bot Status: <span class="highlight" style="color: var(--neon-purple);">Restarting</span>';
                statusDot.style.background = 'var(--neon-purple)';
                statusDot.style.boxShadow = '0 0 15px var(--neon-purple)';
                statusPulse.style.background = 'var(--neon-purple)';
                addActivityLogEntry('ChilliBot restart initiated');
                addSystemLogEntry('info', '[INFO] Bot restart sequence started');
                
                setTimeout(() => {
                    botRunning = true;
                    startBot.classList.add('active');
                    restartBot.classList.remove('active');
                    statusText.innerHTML = 'Bot Status: <span class="highlight neon-text">Running</span>';
                    statusDot.style.background = 'var(--neon-lime)';
                    statusDot.style.boxShadow = '0 0 15px var(--neon-lime)';
                    statusPulse.style.background = 'var(--neon-lime)';
                    addActivityLogEntry('ChilliBot restarted successfully');
                    addSystemLogEntry('success', '[SUCCESS] Bot restart completed');
                    startTime = Date.now();
                }, 3000);
                break;
        }
    }

    function addActivityLogEntry(message) {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 8);
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <span class="activity-time">${timeString}</span>
            <span class="activity-text">${message}</span>
        `;
        
        activityLog.insertBefore(activityItem, activityLog.firstChild);
        
        if (activityLog.children.length > 8) {
            activityLog.removeChild(activityLog.lastChild);
        }
    }

    function addSystemLogEntry(type, message) {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="log-time">${timestamp}</span>
            <span class="log-message">${message}</span>
        `;
        
        systemLogs.insertBefore(logEntry, systemLogs.firstChild);
        
        if (systemLogs.children.length > 10) {
            systemLogs.removeChild(systemLogs.lastChild);
        }
    }

    function initializeParticles() {
        if (typeof particlesJS === 'undefined') {
            return;
        }

        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ['#00ffff', '#0080ff', '#ff0080', '#00ff80', '#8000ff']
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: 0.4,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 4,
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
                    opacity: 0.3,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1.5,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
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
                            opacity: 0.6
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

    refreshActivityLog();
    
    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => addSystemLog(), i * 1000);
        }
    }, 2000);

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

    document.querySelectorAll('.glass-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    function updateConnectionStatus() {
        const isOnline = navigator.onLine;
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        const statusPulse = document.querySelector('.status-pulse');
        
        if (!botRunning) return;
        
        if (isOnline) {
            statusText.innerHTML = 'Bot Status: <span class="highlight neon-text">Running</span>';
            statusDot.style.background = 'var(--neon-lime)';
            statusDot.style.boxShadow = '0 0 15px var(--neon-lime)';
            statusPulse.style.background = 'var(--neon-lime)';
        } else {
            statusText.innerHTML = 'Bot Status: <span class="highlight" style="color: var(--neon-orange);">Offline</span>';
            statusDot.style.background = 'var(--neon-orange)';
            statusDot.style.boxShadow = '0 0 15px var(--neon-orange)';
            statusPulse.style.background = 'var(--neon-orange)';
            addActivityLogEntry('Connection lost - attempting reconnection');
        }
    }

    window.addEventListener('online', () => {
        updateConnectionStatus();
        addActivityLogEntry('Internet connection restored');
    });
    
    window.addEventListener('offline', () => {
        updateConnectionStatus();
        addActivityLogEntry('Internet connection lost');
    });
    
    updateConnectionStatus();
});
