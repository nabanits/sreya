const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const replayPopup = document.getElementById('replay-popup');
let shuffleInterval;
let positions = ['pos-1', 'pos-2', 'pos-3'];

// Pure SVG Tulip Path used for both Background and Confetti
const svgTulipPath = "M12,22 C18,22 20,15 20,11 L4,11 C4,15 6,22 12,22 Z M4,11 L9,3 L12,11 Z M20,11 L15,3 L12,11 Z M9,11 L12,1 L15,11 Z";

// --- 1. INITIALIZATION ---
window.onload = function() {
    generateBackgroundTulips(); // Draw the pure code background tulips

    audio.play().then(() => {
        arrow.innerHTML = 'Audio playing';
        setTimeout(() => arrow.classList.add('hidden'), 3000); 
    }).catch(e => {
        arrow.innerHTML = 'Tap to play music';
        arrow.classList.remove('hidden');
    });
};

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const toggleBtn = document.getElementById('theme-toggle');
    if(document.body.classList.contains('light-mode')) {
        toggleBtn.innerText = '🌙';
    } else {
        toggleBtn.innerText = '☀️';
    }
}

function toggleAudio() {
    const btn = document.getElementById('audio-control');
    arrow.classList.add('hidden');
    if (audio.paused) {
        audio.play();
        btn.innerText = '🔊';
    } else {
        audio.pause();
        btn.innerText = '🔇';
    }
}

audio.addEventListener('ended', () => {
    document.getElementById('audio-control').innerText = '🔇';
    replayPopup.classList.remove('hidden');
});

function playAudioAgain() {
    audio.currentTime = 0;
    audio.play();
    document.getElementById('audio-control').innerText = '🔊';
    replayPopup.classList.add('hidden');
}

// --- 2. STEP NAVIGATION & TYPING BUG FIX ---
function goToStep(stepNumber) {
    if (audio.paused && document.getElementById('audio-control').innerText === '🔊') {
        audio.play().catch(e => console.log("Audio play failed"));
        arrow.classList.add('hidden');
    }

    // Fade out current step
    document.querySelectorAll('.step-container').forEach(step => {
        step.classList.remove('active');
        setTimeout(() => step.classList.add('hidden'), 800); 
    });

    // Specific Logic for Step 2 Typing
    if (stepNumber === 2) {
        // Ensure button is hidden when the slide opens
        const btn2 = document.getElementById('btn2');
        btn2.classList.add('hidden');
        
        // Wait for slide to fade in, then start typing
        setTimeout(() => {
            let typingCompleted = 0; 
            const checkDone = () => {
                typingCompleted++;
                if (typingCompleted === 2) {
                    // BUG FIX: Directly unhide the button when both texts finish
                    btn2.classList.remove('hidden');
                }
            };
            typeWriter('source1', 'type1', checkDone);
            typeWriter('source2', 'type2', checkDone);
        }, 1000);
    }

    if (stepNumber === 4) {
        setTimeout(launchConfetti, 500);
        startPhotoShuffle();
    } else {
        if(shuffleInterval) clearInterval(shuffleInterval);
    }

    // Fade in new step
    setTimeout(() => {
        const nextStep = document.getElementById('step' + stepNumber);
        nextStep.classList.remove('hidden');
        setTimeout(() => nextStep.classList.add('active'), 50); 
    }, 800);
}

// Bulletproof Live Typing
function typeWriter(sourceId, targetId, callback) {
    const text = document.getElementById(sourceId).innerHTML;
    const target = document.getElementById(targetId);

    if (target.typingTimer) clearTimeout(target.typingTimer);

    target.innerHTML = ''; 
    target.classList.add('typing-target'); 
    let i = 0;

    function type() {
        if (i < text.length) {
            target.innerHTML += text.charAt(i);
            i++;
            target.typingTimer = setTimeout(type, 30); 
        } else {
            target.classList.remove('typing-target'); 
            if (callback) callback();
        }
    }
    type();
}

// --- 3. BACKGROUND WIND TULIPS (Pure SVG Code) ---
function generateBackgroundTulips() {
    const container = document.getElementById('parallax-bg-container');
    const numTulips = window.innerWidth < 600 ? 12 : 20; 
    
    for (let i = 0; i < numTulips; i++) {
        let tulip = document.createElement('div');
        tulip.classList.add('parallax-tulip');
        
        // Inject the pure SVG path
        tulip.innerHTML = `<svg viewBox="0 0 24 24"><path d="${svgTulipPath}"/></svg>`;
        
        let size = Math.random() * 150 + 50; 
        let blur = Math.random() * 8 + 2; 
        let rot = Math.random() * 40 - 20; 
        let speed = Math.random() * 5 + 4; 

        tulip.style.width = `${size}px`;
        tulip.style.height = `${size}px`;
        tulip.style.left = `${Math.random() * 100}vw`;
        tulip.style.top = `${Math.random() * 100}vh`;
        
        tulip.style.setProperty('--blur-amt', `${blur}px`);
        tulip.style.setProperty('--rot', `${rot}deg`);
        tulip.style.setProperty('--speed', `${speed}s`);

        container.appendChild(tulip);
    }
}

// --- 4. THE CUSTOM SVG CONFETTI ENGINE (No missing images!) ---
function launchConfetti() {
    const container = document.getElementById('confetti-canvas');
    
    // Premium color palette for the tulips
    const colors = ['#ffffff', '#ff66b2', '#ff99cc', '#d8b4e2', '#fde2bb'];

    for (let i = 0; i < 45; i++) {
        let conf = document.createElement('div');
        conf.classList.add('confetti-piece');
        
        let color = colors[Math.floor(Math.random() * colors.length)];
        
        // Inject the SVG directly into the HTML with the chosen color
        conf.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" width="100%" height="100%"><path d="${svgTulipPath}"/></svg>`;

        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10vh'; 

        let duration = Math.random() * 4 + 4; 
        let delay = Math.random() * 2;
        
        conf.style.animation = `svgFall ${duration}s linear ${delay}s forwards`;
        
        conf.addEventListener('animationend', () => conf.remove());
        container.appendChild(conf);
    }
}

// --- 5. PHOTO GALLERY & LIGHTBOX ---
function startPhotoShuffle() {
    const photos = document.querySelectorAll('.polaroid');
    if (shuffleInterval) clearInterval(shuffleInterval);
    
    shuffleInterval = setInterval(() => {
        positions.unshift(positions.pop()); 
        photos.forEach((photo, index) => {
            photo.className = 'polaroid ' + positions[index];
        });
    }, 3500); 
}

function openModal(imgSrc) {
    const modal = document.getElementById('image-modal');
    const expandedImg = document.getElementById('expanded-img');
    
    expandedImg.src = imgSrc; 
    modal.classList.add('active'); 
}

function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.classList.remove('active'); 
}
