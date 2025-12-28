/**
 * ASCII Art Futuristic Animation Effects
 * Adds dynamic effects to the ASCII art display
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const asciiArt = document.getElementById('asciiArt');
        if (!asciiArt) return;

        // Add random glitch effect periodically
        setInterval(() => {
            if (Math.random() > 0.7) {
                triggerGlitch(asciiArt);
            }
        }, 5000);

        // Add hover interaction
        asciiArt.addEventListener('mouseenter', () => {
            asciiArt.style.animation = 'fadeIn 2s ease-in, glitch 0.3s infinite, pulse 1.5s ease-in-out infinite';
        });

        asciiArt.addEventListener('mouseleave', () => {
            asciiArt.style.animation = 'fadeIn 2s ease-in, glitch 3s infinite, pulse 4s ease-in-out infinite';
        });

        // Random character flicker effect (subtle)
        startCharacterFlicker(asciiArt);
    }

    function triggerGlitch(element) {
        element.style.transform = 'translate(' + 
            (Math.random() * 4 - 2) + 'px, ' + 
            (Math.random() * 4 - 2) + 'px)';
        
        setTimeout(() => {
            element.style.transform = 'translate(0, 0)';
        }, 100);
    }

    function startCharacterFlicker(element) {
        const text = element.textContent;
        const chars = text.split('');
        let flickerInterval;

        // Only flicker a small percentage of characters
        function flickerRandomChars() {
            const flickerCount = Math.floor(chars.length * 0.01); // 1% of characters
            const indices = new Set();
            
            while (indices.size < flickerCount) {
                indices.add(Math.floor(Math.random() * chars.length));
            }

            indices.forEach(index => {
                const originalChar = chars[index];
                if (originalChar !== '\n' && originalChar !== ' ') {
                    // Temporarily change character
                    chars[index] = getRandomChar();
                    element.textContent = chars.join('');
                    
                    setTimeout(() => {
                        chars[index] = originalChar;
                        element.textContent = chars.join('');
                    }, 50);
                }
            });
        }

        // Flicker every 2-4 seconds
        function scheduleNextFlicker() {
            const delay = 2000 + Math.random() * 2000;
            flickerInterval = setTimeout(() => {
                flickerRandomChars();
                scheduleNextFlicker();
            }, delay);
        }

        scheduleNextFlicker();
    }

    function getRandomChar() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()[]{}|\\/<>?';
        return chars[Math.floor(Math.random() * chars.length)];
    }
})();

