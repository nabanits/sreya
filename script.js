const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const replayPopup = document.getElementById('replay-popup');
const canvas = document.getElementById('petal-canvas');
const ctx = canvas.getContext('2d');
const roamingContainer = document.getElementById('roaming-tulips-container');

let shuffleInterval;
let positions = ['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5'];
let isPetalFallActive = false;
let animationFrameId;

// Petal Fall Variables
let W = 0, H = 0, DPR = 1;
const colors = ["#ff6ea8", "#ff8cbc", "#ffb2cf", "#ffd0de", "#f7a6c5"];
let petals = [];

// --- 1. INITIALIZATION & AUDIO ---
window.onload = function() {
    initCanvasSize();
    startRoamingTulips(); // Start with roaming tulips on pages 1 & 2

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

// --- 2. STEP NAVIGATION & CONDITIONAL LOGIC ---
function goToStep(stepNumber) {
    if (audio.paused && document.getElementById('audio-control').innerText === '🔊') {
        audio.play().catch(e => console.log("Audio play failed"));
        arrow.classList.add('hidden');
    }

    // Stop photo shuffle if leaving step 4
    if (shuffleInterval) clearInterval(shuffleInterval);

    // Fade out current step
    document.querySelectorAll('.step-container').forEach(step => {
        step.classList.remove('active');
        setTimeout(() => step.classList.add('hidden'), 800); 
    });

    // Conditional Animation Logic
    if (stepNumber <= 2) {
        stopPetalFall();
        startRoamingTulips();
    } else {
        stopRoamingTulips();
        startPetalFall();
    }

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

// Bulletproof Typing
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

// A. Roaming Tulips (Pages 1 & 2)
function startRoamingTulips() {
    roamingTulipsContainer.innerHTML = ''; // Clear existing
    const numTulips = window.innerWidth < 600 ? 5 : 10; 
    
    for (let i = 0; i < numTulips; i++) {
        let tulip = document.createElement('div');
        tulip.classList.add('roaming-tulip');
        tulip.innerText = '🌷';
        
        tulip.style.left = `${Math.random() * 100}vw`;
        tulip.style.top = `${Math.random() * 100}vh`;
        
        let rot = Math.random() * 360;
        tulip.style.setProperty('--rot-z', `${rot}deg`);

        let duration = Math.random() * 20 + 20; // Very slow: 20-40s
        let delay = Math.random() * -40; // Start at different points
        
        tulip.style.animation = `sparseRoam ${duration}s linear ${delay}s infinite`;
        
        roamingTulipsContainer.appendChild(tulip);
    }
}

function stopRoamingTulips() {
    roamingTulipsContainer.innerHTML = '';
}

// B. Continuous Canvas Petal Fall (Pages 3 & 4)
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = arr => arr[(Math.random() * arr.length) | 0];

function initCanvasSize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener("resize", initCanvasSize);

function startPetalFall() {
    if (isFallActive) return;
    isFallActive = true;
    
    // Initialize petals if empty
    if (petals.length === 0) {
        const count = Math.min(75, Math.floor((W * H) / 18000) + 40);
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

    animatePetals();
}

function stopPetalFall() {
    isFallActive = false;
    cancelAnimationFrame(animationFrameId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(p.s, p.s);
    ctx.globalAlpha = p.alpha;

    const g = ctx.createLinearGradient(0, -12, 0, 12);
    g.addColorStop(0, "#ffe4ef");
    g.addColorStop(0.5, p.color);
    g.addColorStop(1, "#ff7fb0");
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.bezierCurveTo(7, -8, 10, -1, 7, 7);
    ctx.bezierCurveTo(4, 11, -4, 12, -7, 7);
    ctx.bezierCurveTo(-10, -1, -7, -8, 0, -10);
    ctx.fill();

    ctx.restore();
}

function animatePetals() {
    if (!isFallActive) return;

    ctx.clearRect(0, 0, W, H);

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
    
