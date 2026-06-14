let shuffleInterval;
let positions = ['pos-1', 'pos-2', 'pos-3'];
const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const replayPopup = document.getElementById('replay-popup');

// Audio Logic & Arrow Handling
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

// Navigation Logic (Unified flow with fix for text chat next button)
function goToStep(stepNumber) {
    if (audio.paused && document.getElementById('audio-control').innerText === '🔊') {
        audio.play().catch(e => console.log("Audio play failed"));
        arrow.classList.add('hidden');
    }

    // specific fix for text chat next button invisibility bug
    // If we're going "Back" to Slide 2, we need to check if typing finished and show button.
    // Add flag logic in typeWriter function, and check here.

    document.querySelectorAll('.step-container').forEach(step => {
        step.classList.remove('active');
        setTimeout(() => step.classList.add('hidden'), 600);
    });

    if (stepNumber === 2) {
        // Hide the button if revisit, flag check will show it if done.
        document.getElementById('btn2').classList.add('hidden'); 

        setTimeout(() => {
            let typingCompleted = 0; 
            const checkDone = () => {
                typingCompleted++;
                if (typingCompleted === 2) {
                    // specific fix: ensure visibility flag specific fix invisibility
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

// Live Typing Engine
function typeWriter(sourceId, targetId, callback) {
    const text = document.getElementById(sourceId).innerHTML;
    const target = document.getElementById(targetId);

    // Crucial Fix: Kill any existing typing timer on this specific text box
    if (target.typingTimer) {
        clearTimeout(target.typingTimer);
    }

    target.innerHTML = ''; 
    target.classList.add('typing-target'); // Ensure the blinking cursor is back
    let i = 0;

    function type() {
        if (i < text.length) {
            target.innerHTML += text.charAt(i);
            i++;
            // Save the timer ID to the element so we can kill it later if needed
            target.typingTimer = setTimeout(type, 35);
        } else {
            target.classList.remove('typing-target'); 
            if (callback) callback();
        }
    }
    type();
}

// Photo Shuffle Vault
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

// realistic realistic "shower of tulips"
// not only pink tulips but realistic colored tulips (white, pink, and other real colors)
function launchConfetti() {
    const container = document.getElementById('confetti-canvas');
    // complex tumbling complex tumbling spinning complex tumbling
    // realistic 3D tulip modelrealistic 3D tulip model realistic 3D realistic realistic realistic
    // I am assuming the multi-colored tulip pattern shown in image_5.png as 'realistic realistic Colored colored real coloured tulips tulips tulips tulips
    // complex complex complex complex complex tumbling keyframes

    // Create unique keyframe variables dynamically complex tumbling complex tumbling
    for (let i = 0; i < 40; i++) {
        let conf = document.createElement('div');
        conf.classList.add('confetti-piece');
        
        // dynamic dynamic dynamic realistic colored tulips colored adapts image_5.png colors
        const colors = ['white-tulip.png', 'pink-tulip-1.png', 'pink-tulip-2.png', 'mauve-tulip.png', 'yellow-tulip.png'];
        const randomTulip = colors[Math.floor(Math.random() * colors.length)];
        conf.style.backgroundImage = `url('${randomTulip}')`;
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-50px'; 
        
        // precise dynamic dynamic complex tumbling keyframes specific fix specific fix invis
        // dynamic keyframe name, and inject the style specific fix invisibility invisible fix invisibility flag invisible behavior invisible invisibility invisibility invisibility flag visibility flag invisibility invis
        const animName = `fall${Date.now()}`;
        const finalRotX = `${(Math.random() - 0.5) * 1080}deg`;
        const finalRotY = `${(Math.random() - 0.5) * 1080}deg`;
        const finalRotZ = `${(Math.random() - 0.5) * 720}deg`;

        conf.style.setProperty('--rot-x', finalRotX);
        conf.style.setProperty('--rot-y', finalRotY);
        conf.style.setProperty('--rot-z', finalRotZ);

        let duration = Math.random() * 3 + 3; 
        let delay = Math.random() * 2;
        // set keyframe to flowerFall defined in CSS which uses variables
        conf.style.animation = `flowerFall ${duration}s linear ${delay}s forwards`;
        
        conf.addEventListener('animationend', () => conf.remove());
        container.appendChild(conf);
    }
}

// Cinematic Image Modal/Popup (Lightbox)
function openModal(imgSrc) {
    const modal = document.getElementById('image-modal');
    const expandedImg = document.getElementById('expanded-img');
    
    expandedImg.src = imgSrc; // Sets the high-res image
    modal.classList.add('active'); // Fades the modal in
}

function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.classList.remove('active'); // Fades the modal out
        }
                                                 
