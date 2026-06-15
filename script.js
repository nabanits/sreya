const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const replayPopup = document.getElementById('replay-popup');
const canvas = document.getElementById('petal-canvas');
const petalCtx = canvas.getContext('2d');
const roamingTulipsContainer = document.getElementById('roaming-tulips-container');

// Control variables
let isFallActive = false; 
let shuffleInterval;
let positions = ['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5']; 
let animationFrameId;

// Canvas setup variables
let W, H, DPR;
let petals = [];

// --- 1. INITIALIZATION & AUDIO ---
window.onload = function() {
    initPetalCanvas(); // Setup the canvas dimensions
    startFloatingTulips(); // Start sparse roaming tulips on P1/P2

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

// --- 2. STEP NAVIGATION & BESPOKE PAGE LOGIC ---
// MUST BE GLOBAL
window.goToStep = function(stepNumber) {
    if (audio.paused && document.getElementById('audio-control').innerText === '🔊') {
        audio.play().catch(e => console.log("Audio play failed"));
        arrow.classList.add('hidden');
    }

    // Stop photo shuffle if leaving step 4
    if(shuffleInterval) clearInterval(shuffleInterval);

    // Fade out current step
    document.querySelectorAll('.step-container').forEach(step => {
        step.classList.remove('active');
        setTimeout(() => step.classList.add('hidden'), 800); 
    });

    // Conditional Logic for Petals
    stopFloatingTulips(); 
    stopPetalFall();     

    if (stepNumber <= 2) {
        startFloatingTulips(); 
    } else if (stepNumber >= 3) {
        startPetalFall();     
    }

    // Typewriter logic for Page 2
    if (stepNumber === 2) {
        const btn2 = document.getElementById('btn2');
        btn2.classList.add('hidden'); 
        
        setTimeout(() => {
            let typingCompleted = 0; 
            const checkDone = () => {
                typingCompleted++;
                if (typingCompleted === 2) {
                    btn2.classList.remove('hidden'); 
                }
            };
            typeWriter('source1', 'type1', checkDone);
            typeWriter('source2', 'type2', checkDone);
        }, 1000);
    }

    // Vault logic for Page 4
    if (stepNumber === 4) {
        startPhotoShuffle();
    }

    // Fade in new step
    setTimeout(() => {
        const nextStep = document.getElementById('step' + stepNumber);
        nextStep.classList.remove('hidden');
        setTimeout(() => nextStep.classList.add('active'), 50); 
    }, 800);
}

// Live Typing handles emojis safely
function typeWriter(sourceId, targetId, callback) {
    const text = document.getElementById(sourceId).innerHTML;
    const target = document.getElementById(targetId);

    if (target.typingTimer) clearTimeout(target.typingTimer);

    target.innerHTML = ''; 
    target.classList.add('typing-target'); 
    
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

// --- 3. ANIMATION ENGINES ---

// A. Sparse Floating Tulips (Pages 1 & 2)
function startFloatingTulips() {
    roamingTulipsContainer.innerHTML = ''; 
    const numTulips = window.innerWidth < 600 ? 5 : 8; 
    
    const tulipPath = "M12,22 C18,22 20,15 20,11 L4,11 C4,15 6,22 12,22 Z M4,11 L9,3 L12,11 Z M20,11 L15,3 L12,11 Z M9,11 L12,1 L15,11 Z";
    const colors = ['#ffffff', '#ff66b2', '#ff99cc', '#d8b4e2'];

    for (let i = 0; i < numTulips; i++) {
        let tulip = document.createElement('div');
        tulip.classList.add('roaming-tulip');
        
        let color = colors[Math.floor(Math.random() * colors.length)];
        tulip.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" stroke="rgba(255,255,255,0.5)" stroke-width="0.5" xmlns="http://www.w3.org/2000/svg"><path d="${tulipPath}"/></svg>`;
        
        tulip.style.left = `${Math.random() * 100}vw`;
        tulip.style.top = `${Math.random() * 100}vh`; 
        
        let rot = Math.random() * 360;
        tulip.style.setProperty('--rot-z', `${rot}deg`);

        let duration = Math.random() * 25 + 25; // Slow float
        let delay = Math.random() * -50; 
        
        tulip.style.animation = `sparseRoam ${duration}s linear ${delay}s infinite`;
        
        roamingTulipsContainer.appendChild(tulip);
    }
}

function stopFloatingTulips() {
    roamingTulipsContainer.innerHTML = '';
}


// B. Continuous Canvas Petal Fall (Pages 3 & 4)
function initPetalCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    petalCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener("resize", () => {
    initPetalCanvas();
    if(isFallActive) {
        petals = []; // Reset petals to adjust to new screen size
        createPetals();
    }
});

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = arr => arr[(Math.random() * arr.length) | 0];

function createPetals() {
    const colors = ["#ff6ea8", "#ff8cbc", "#ffb2cf", "#ffd0de", "#f7a6c5"];
    const count = Math.min(75, Math.floor((W * H) / 18000) + 40);

    petals = [];
    for (let i = 0; i < count; i++) {
        petals.push({
            x: rand(0, W),
            y: rand(-H, H),
            s: rand(0.6, 1.15),
            vx: rand(-0.25, 0.25),
            vy: rand(0.45, 1.15),
            rot: rand(0, Math.PI * 2),
            vr: rand(-0.015, 0.015),
            wave: rand(0, Math.PI * 2),
            color: pick(colors),
            alpha: rand(0.65, 0.95)
        });
    }
}

function startPetalFall() {
    if (isFallActive) return;
    isFallActive = true;
    
    if (petals.length === 0) {
        createPetals();
    }
    animatePetals();
}

function stopPetalFall() {
    isFallActive = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    petalCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPetal(p) {
    petalCtx.save();
    petalCtx.translate(p.x, p.y);
    petalCtx.rotate(p.rot);
    petalCtx.scale(p.s, p.s);
    petalCtx.globalAlpha = p.alpha;

    const g = petalCtx.createLinearGradient(0, -12, 0, 12);
    g.addColorStop(0, "#ffe4ef");
    g.addColorStop(0.5, p.color);
    g.addColorStop(1, "#ff7fb0");
    petalCtx.fillStyle = g;

    petalCtx.beginPath();
    petalCtx.moveTo(0, -10);
    petalCtx.bezierCurveTo(7, -8, 10, -1, 7, 7);
    petalCtx.bezierCurveTo(4, 11, -4, 12, -7, 7);
    petalCtx.bezierCurveTo(-10, -1, -7, -8, 0, -10);
    petalCtx.fill();

    petalCtx.restore();
}

function animatePetals() {
    if (!isFallActive) return;

    // Force clear for mobile stability
    petalCtx.setTransform(1, 0, 0, 1, 0, 0);
    petalCtx.clearRect(0, 0, canvas.width, canvas.height);
    // Reset transform for drawing
    petalCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

    for (const p of petals) {
        p.x += p.vx + Math.sin(p.wave) * 0.35;
        p.y += p.vy;
        p.rot += p.vr;
        p.wave += 0.03;

        if (p.y > H + 25) {
            p.y = -25;
            p.x = rand(0, W);
        }
        if (p.x < -30) p.x = W + 30;
        if (p.x > W + 30) p.x = -30;

        drawPetal(p);
    }

    animationFrameId = requestAnimationFrame(animatePetals);
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
