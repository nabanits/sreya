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

// --- 3. CUSTOM CSS PETAL CONFETTI ---
function launchConfetti() {
    const container = document.getElementById('confetti-canvas');
    
    // Premium color gradients for realistic petals
    const petalColors = [
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Soft Pink
        'linear-gradient(135deg, #ffdde1 0%, #ee9ca7 100%)', // Rose
        'linear-gradient(135deg, #ffffff 0%, #fdfbfb 100%)', // White
        'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'  // Warm Peach
    ];

    for (let i = 0; i < 60; i++) {
        let conf = document.createElement('div');
        conf.classList.add('petal'); // Uses the petal CSS class shape
        
        let color = petalColors[Math.floor(Math.random() * petalColors.length)];
        conf.style.background = color;

        // Randomize size slightly
        let scale = Math.random() * 0.5 + 0.8;
        conf.style.width = `${15 * scale}px`;
        conf.style.height = `${25 * scale}px`;

        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10vh'; 

        let duration = Math.random() * 5 + 4; 
        let delay = Math.random() * 3;
        
        conf.style.animation = `petalFall ${duration}s linear ${delay}s forwards`;
        
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
            
