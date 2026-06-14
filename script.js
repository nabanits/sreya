let shuffleInterval;
let positions = ['pos-1', 'pos-2', 'pos-3'];
const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const replayPopup = document.getElementById('replay-popup');

// Audio Logic
window.onload = function() {
    audio.play().then(() => {
        arrow.innerHTML = 'Click to mute <span>➔</span>';
        arrow.classList.remove('hidden');
    }).catch(e => {
        arrow.innerHTML = 'Click to play music <span>➔</span>';
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

// Navigation Logic (BUG FIXED)
function goToStep(stepNumber) {
    if (audio.paused && document.getElementById('audio-control').innerText === '🔊') {
        audio.play().catch(e => console.log("Audio play failed"));
        arrow.classList.add('hidden');
    }

    document.querySelectorAll('.step-container').forEach(step => {
        step.classList.remove('active');
        setTimeout(() => step.classList.add('hidden'), 600);
    });

    if (stepNumber === 2) {
        // Hide the button initially
        document.getElementById('btn2').classList.add('hidden');
        
        setTimeout(() => {
            // FIX: Reset typingCompleted to 0 EVERY TIME step 2 opens
            let typingCompleted = 0; 
            const checkDone = () => {
                typingCompleted++;
                if (typingCompleted === 2) {
                    document.getElementById('btn2').classList.remove('hidden');
                }
            };
            typeWriter('source1', 'type1', checkDone);
            typeWriter('source2', 'type2', checkDone);
        }, 800);
    }

    if (stepNumber === 4) {
        setTimeout(launchConfetti, 300);
        startPhotoShuffle();
    } else {
        if(shuffleInterval) clearInterval(shuffleInterval);
    }

    setTimeout(() => {
        const nextStep = document.getElementById('step' + stepNumber);
        nextStep.classList.remove('hidden');
        setTimeout(() => nextStep.classList.add('active'), 50);
    }, 600);
}

// Bulletproof Live Typing
function typeWriter(sourceId, targetId, callback) {
    const text = document.getElementById(sourceId).innerHTML;
    const target = document.getElementById(targetId);

    if (target.typingTimer) {
        clearTimeout(target.typingTimer);
    }

    target.innerHTML = ''; 
    target.classList.add('typing-target'); 
    let i = 0;

    function type() {
        if (i < text.length) {
            target.innerHTML += text.charAt(i);
            i++;
            target.typingTimer = setTimeout(type, 35);
        } else {
            target.classList.remove('typing-target'); 
            if (callback) callback();
        }
    }
    type();
}

// Photo Shuffle
function startPhotoShuffle() {
    const photos = document.querySelectorAll('.polaroid');
    if (shuffleInterval) clearInterval(shuffleInterval);

    shuffleInterval = setInterval(() => {
        positions.unshift(positions.pop()); 
        photos.forEach((photo, index) => {
            photo.className = 'polaroid ' + positions[index];
        });
    }, 4000); 
}

// Multi-Colored Tulip Engine
function launchConfetti() {
    const container = document.getElementById('confetti-canvas');
    
    for (let i = 0; i < 50; i++) {
        let conf = document.createElement('div');
        conf.classList.add('confetti-piece');
        conf.innerText = '🌷'; 
        
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-40px'; 

        let hueShift = Math.floor(Math.random() * 360);
        conf.style.filter = `hue-rotate(${hueShift}deg)`;

        let spinDirection = Math.random() > 0.5 ? 1 : -1;
        conf.style.setProperty('--spin', spinDirection);

        let duration = Math.random() * 4 + 4; 
        let delay = Math.random() * 2;
        
        conf.style.animation = `flowerFall ${duration}s linear ${delay}s forwards`;

        conf.addEventListener('animationend', () => conf.remove());
        container.appendChild(conf);
    }
}

// FULLSCREEN IMAGE POPUP LOGIC
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
    
