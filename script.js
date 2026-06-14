const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const replayPopup = document.getElementById('replay-popup');
const roamingTulipsContainer = document.getElementById('roaming-tulips-container');

// Canvas Variables
let isPetalFallActive = false;
let animationFrameId;
const canvas = document.getElementById("petal-canvas");
const ctx = canvas.getContext("2d");
let W, H, DPR;
let petals = [];

// SVG path used for roaming tulips
const tulipPath = "M12 2c0 0-7 4-7 11 0 4 3 8 7 9 4-1 7-5 7-9 0-7-7-11-7-11z M12 22 L12 13 M9 21 c0 0 3-11 3-11 M15 21 c0 0-3-11-3-11";
const roamingColors = ['#ffffff', '#ffb6c1', '#ff69b4', '#ffe4e1'];

// --- 1. INITIALIZATION & AUDIO ---
window.onload = function() {
    initCanvasSize();
    startRoamingTulips(); // Start sparse roaming tulips on P1/P2

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

    // Handle Petal Animations based on page
    if (stepNumber <= 2) {
        stopPetalFall();
        startRoamingTulips();
    } else {
        stopRoamingTulips();
        startPetalFall();
    }

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


// --- 3. ANIMATION ENGINES ---

// A. Sparse Roaming Tulips (Pages 1 & 2)
function startRoamingTulips() {
    roamingTulipsContainer.innerHTML = ''; 
    const numTulips = window.innerWidth < 600 ? 6 : 12; 
    
    for (let i = 0; i < numTulips; i++) {
        let tulip = document.createElement('div');
        tulip.classList.add('roaming-tulip');
        
        let color = colors[Math.floor(Math.random() * colors.length)];
        tulip.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" stroke="rgba(255,255,255,0.5)" stroke-width="0.5" xmlns="http://www.w3.org/2000/svg"><path d="${tulipPath}"/></svg>`;
        
        tulip.style.left = `${Math.random() * 100}vw`;
        tulip.style.top = `${Math.random() * 100}vh`; // Start scattered
        
        let rot = Math.random() * 360;
        tulip.style.setProperty('--rot-z', `${rot}deg`);

        let duration = Math.random() * 25 + 25; // Very slow: 25-50s
        let delay = Math.random() * -50; 
        
        tulip.style.animation = `sparseRoam ${duration}s linear ${delay}s infinite`;
        
        roamingTulipsContainer.appendChild(tulip);
    }
}

function stopRoamingTulips() {
    roamingTulipsContainer.innerHTML = '';
}

// B. Continuous Canvas Petal Fall (Pages 3 & 4)
function initCanvasSize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
}

window.addEventListener("resize", initCanvasSize);

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = arr => arr[(Math.random() * arr.length) | 0];

function startPetalFall() {
    if (isFallActive) return;
    isFallActive = true;
    
    if (petals.length === 0) {
        const petalColors = ["#ff6ea8", "#ff8cbc", "#ffb2cf", "#ffd0de", "#f7a6c5"];
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
                color: pick(petalColors),
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
    ctx.translate(p.x * DPR, p.y * DPR);
    ctx.rotate(p.rot);
    ctx.scale(p.s * DPR, p.s * DPR);
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

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        
