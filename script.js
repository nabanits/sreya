const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const replayPopup = document.getElementById('replay-popup');
const roamingContainer = document.getElementById('roaming-tulips-container');

// Canvas globals
const canvas = document.getElementById("petal-canvas");
const ctx = canvas.getContext("2d");
let W = 0, H = 0, DPR = 1;
let petals = [];
let animationFrameId;

// State control
let currentStep = 1;

window.onload = function() {
    initCanvas();
    startRoamingTulips(); // Start P1/P2 effect

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

// --- STEP NAVIGATION & LOGIC ---
function goToStep(stepNumber) {
    currentStep = stepNumber;
    
    if (audio.paused && document.getElementById('audio-control').innerText === '🔊') {
        audio.play().catch(e => console.log("Audio play failed"));
        arrow.classList.add('hidden');
    }

    // Handle Background Animations based on page
    if (stepNumber <= 2) {
        stopPetalFall();
        startRoamingTulips();
    } else {
        stopRoamingTulips();
        startPetalFall(stepNumber);
    }

    // Fade out current step
    document.querySelectorAll('.step-container').forEach(step => {
        step.classList.remove('active');
        setTimeout(() => step.classList.add('hidden'), 600); 
    });

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
        }, 800);
    }

    // Fade in new step
    setTimeout(() => {
        const nextStep = document.getElementById('step' + stepNumber);
        nextStep.classList.remove('hidden');
        setTimeout(() => nextStep.classList.add('active'), 50); 
    }, 600);
}

// Bulletproof Typing (Handles Emojis safely)
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

// --- ANIMATION EFFECTS ---

// 1. Sparse Bouncing Emoji Tulips (Pages 1 & 2)
let roamingIntervals = [];

function startRoamingTulips() {
    roamingContainer.innerHTML = '';
    const numTulips = 8; // Fewer tulips
    
    for (let i = 0; i < numTulips; i++) {
        let tulip = document.createElement('div');
        tulip.classList.add('roaming-tulip');
        tulip.innerText = '🌷';
        
        let x = Math.random() * window.innerWidth;
        let y = Math.random() * window.innerHeight;
        
        // Slower speed as requested
        let vx = (Math.random() - 0.5) * 1.2; 
        let vy = (Math.random() - 0.5) * 1.2;

        roamingContainer.appendChild(tulip);

        function moveTulip() {
            if (currentStep > 2) return; // Stop if we moved to P3/P4

            x += vx;
            y += vy;

            // Bounce off edges
            if (x < 0 || x > window.innerWidth - 30) vx *= -1;
            if (y < 0 || y > window.innerHeight - 40) vy *= -1;

            tulip.style.transform = `translate(${x}px, ${y}px)`;
            
            // Randomly rotate slightly for natural feel
            tulip.style.rotate = `${Math.sin(x/50) * 15}deg`;

            requestAnimationFrame(moveTulip);
        }
        moveTulip();
    }
}

function stopRoamingTulips() {
    roamingContainer.innerHTML = '';
}

// 2. Canvas Petal Fall (Pages 3 & 4)
function initCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener("resize", () => {
    initCanvas();
    if(currentStep >= 3) {
        petals = []; // Reset on resize to recalculate screen width
        createPetals(currentStep);
    }
});

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = arr => arr[(Math.random() * arr.length) | 0];

function createPetals(step) {
    const colors = ["#ff6ea8", "#ff8cbc", "#ffb2cf", "#ffd0de", "#f7a6c5"];
    
    // Logic: Reduce density by 2.5/4 (62.5%) on Anthem Slide (Step 3)
    let maxCount = Math.floor((W * H) / 18000) + 40;
    if (step === 3) {
        maxCount = Math.floor(maxCount * 0.625); // Apply density reduction
    }

    petals = []; // Clear array
    for (let i = 0; i < maxCount; i++) {
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

function startPetalFall(step) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    // Always recreate petals on slide change to apply density logic
    createPetals(step);
    
    animatePetals();
}

function stopPetalFall() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
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
    // Mobile glitch fix: force wipe
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

// --- 4. LIGHTBOX VIEWER ---
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
