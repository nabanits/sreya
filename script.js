const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const replayPopup = document.getElementById('replay-popup');
let shuffleInterval;
let positions = ['pos-1', 'pos-2', 'pos-3'];

// --- 1. INITIALIZATION ---
window.onload = function() {
    audio.play().then(() => {
        arrow.innerHTML = 'Audio playing';
        setTimeout(() => arrow.classList.add('hidden'), 3000); 
    }).catch(e => {
        arrow.innerHTML = 'Tap to play music';
        arrow.classList.remove('hidden');
    });
};

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

// --- 2. STEP NAVIGATION & BUG-FREE TYPING ---
function goToStep(stepNumber) {
    if (audio.paused && document.getElementById('audio-control').innerText === '🔊') {
        audio.play().catch(e => console.log("Audio play failed"));
        arrow.classList.add('hidden');
    }

    // Fade out current step
    document.querySelectorAll('.step-container').forEach(step => {
        step.classList.remove('active');
        setTimeout(() => step.classList.add('hidden'), 600); 
    });

    if (stepNumber === 2) {
        const btn2 = document.getElementById('btn2');
        btn2.classList.add('hidden'); // Hide button initially
        
        setTimeout(() => {
            let typingCompleted = 0; 
            const checkDone = () => {
                typingCompleted++;
                if (typingCompleted === 2) {
                    btn2.classList.remove('hidden'); // Show button when both texts finish
                }
            };
            typeWriter('source1', 'type1', checkDone);
            typeWriter('source2', 'type2', checkDone);
        }, 800);
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
    }, 600);
}

// Bulletproof Typing (Properly handles Emojis!)
function typeWriter(sourceId, targetId, callback) {
    const text = document.getElementById(sourceId).innerHTML;
    const target = document.getElementById(targetId);

    if (target.typingTimer) clearTimeout(target.typingTimer);

    target.innerHTML = ''; 
    target.classList.add('typing-target'); 
    
    // Using Array.from safely splits emojis without breaking them in half
    const chars = Array.from(text);
    let i = 0;

    function type() {
        if (i < chars.length) {
            target.innerHTML += chars[i];
            i++;
            target.typingTimer = setTimeout(type, 30); 
        } else {
            target.classList.remove('typing-target'); 
            if (callback) callback();
        }
    }
    type();
}

// --- 3. CUSTOM SVG TULIP CONFETTI ---
function launchConfetti() {
    const container = document.getElementById('confetti-canvas');
    
    // A highly detailed, beautiful SVG path of a tulip blossom
    const beautifulTulipSVG = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C12 2 5 6 5 13C5 17 8 21 12 22C16 21 19 17 19 13C19 6 12 2 12 2Z" fill="var(--tulip-color)"/>
            <path d="M12 2C12 2 9 7 9 13C9 17 10.5 20.5 12 22" stroke="rgba(255,255,255,0.4)" stroke-width="0.5" fill="none"/>
            <path d="M12 2C12 2 15 7 15 13C15 17 13.5 20.5 12 22" stroke="rgba(255,255,255,0.4)" stroke-width="0.5" fill="none"/>
        </svg>
    `;

    // Premium realistic tulip colors: Soft Pink, Hot Pink, Cream, Soft Yellow, Mauve
    const colors = ['#FFB6C1', '#FF69B4', '#FFF5EE', '#FDE882', '#DDA0DD'];

    for (let i = 0; i < 40; i++) {
        let conf = document.createElement('div');
        conf.classList.add('svg-tulip');
        
        let color = colors[Math.floor(Math.random() * colors.length)];
        conf.style.setProperty('--tulip-color', color);
        
        conf.innerHTML = beautifulTulipSVG;

        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10vh'; 

        let duration = Math.random() * 4 + 4; 
        let delay = Math.random() * 2;
        
        conf.style.animation = `svgFall ${duration}s linear ${delay}s forwards`;
        
        conf.addEventListener('animationend', () => conf.remove());
        container.appendChild(conf);
    }
}

// --- 4. PHOTO GALLERY & LIGHTBOX ---
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
