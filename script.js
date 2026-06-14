const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
let shuffleInterval;
let positions = ['pos-1', 'pos-2', 'pos-3'];

// --- 1. INITIALIZATION ---
window.onload = function() {
    audio.play().then(() => {
        arrow.classList.add('hidden');
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

// Bulletproof Typing Engine
function typeWriter(sourceId, targetId, callback) {
    const text = document.getElementById(sourceId).innerHTML;
    const target = document.getElementById(targetId);

    if (target.typingTimer) clearTimeout(target.typingTimer);

    target.innerHTML = ''; 
    target.classList.add('typing-target'); 
    
    // Safely handles emojis without breaking
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

// --- 3. CUSTOM PINK & WHITE SVG TULIP SHOWER ---
function launchConfetti() {
    const container = document.getElementById('confetti-canvas');
    
    // A clean, beautiful SVG path of a tulip blossom
    const tulipPath = "M12 2c0 0-7 4-7 11 0 4 3 8 7 9 4-1 7-5 7-9 0-7-7-11-7-11z M12 22 L12 13 M9 21 c0 0 3-11 3-11 M15 21 c0 0-3-11-3-11";

    // Strictly Pink and White colors
    const colors = ['#ffffff', '#ffb6c1', '#ff69b4', '#ffe4e1'];

    for (let i = 0; i < 50; i++) {
        let conf = document.createElement('div');
        conf.classList.add('svg-tulip');
        
        let color = colors[Math.floor(Math.random() * colors.length)];
        
        conf.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" stroke="rgba(255,255,255,0.8)" stroke-width="0.5" xmlns="http://www.w3.org/2000/svg"><path d="${tulipPath}"/></svg>`;

        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10vh'; 
        
        // Randomize the fall rotation so it looks natural
        let endRot = (Math.random() * 360) + 180;
        conf.style.setProperty('--rot-end', `${endRot}deg`);

        let duration = Math.random() * 3 + 4; // Falls in 4 to 7 seconds
        let delay = Math.random() * 2;
        
        conf.style.animation = `svgFall ${duration}s ease-in ${delay}s forwards`;
        
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
            
