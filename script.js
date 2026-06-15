const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const canvas = document.getElementById("petal-canvas");
const ctx = canvas.getContext("2d");
const roamingContainer = document.getElementById('roaming-tulips-container');

// State control
let isPetalFallActive = false;
let animationFrameId;
let shuffleInterval;
let positions = ['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5'];

// Canvas Variables
let W, H, DPR;
let petals = [];

// --- 1. INITIALIZATION & AUDIO ---
window.onload = function() {
    initCanvasSize();
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

// --- 2. STEP NAVIGATION & CONDITIONAL LOGIC ---
window.goToStep = function(stepNumber) {
    if (audio.paused && document.getElementById('audio-control').innerText === '🔊') {
        audio.play().catch(e => console.log("Audio play failed"));
        arrow.classList.add('hidden');
    }

    if(shuffleInterval) clearInterval(shuffleInterval);

    // Fade out current step
    document.querySelectorAll('.step-container').forEach(step => {
        step.classList.remove('active');
        setTimeout(() => step.classList.add('hidden'), 600); 
    });

    // --- THE ANIMATION LOGIC ---
    if (stepNumber <= 2) {
        stopPetalFall();
        startFloatingTulips();
    } else {
        stopFloatingTulips();
        startPetalFall();
    }

    // Page 2 Typewriter
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

    // Page 4 Photo Shuffle
    if (stepNumber === 4) {
        startPhotoShuffle();
    }

    // Fade in new step
    setTimeout(() => {
        const nextStep = document.getElementById('step' + stepNumber);
        nextStep.classList.remove('hidden');
        setTimeout(() => nextStep.classList.add('active'), 50); 
    }, 600);
}

// Bulletproof Typing (Handles Emojis)
function typeWriter(sourceId, targetId, callback) {
    const textElement = document.getElementById(sourceId);
    if (!textElement) return;
    const text = textElement.innerHTML;
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
    roamingContainer.innerHTML = '';
    const numTulips = 6; 
    const tulipPath = "M12 2c0 0-7 4-7 11 0 4 3 8 7 9 4-1 7-5 7-9 0-7-7-11-7-11z M12 22 L12 13 M9 21 c0 0 3-11 3-11 M15 21 c0 0-3-11-3-11";
    const colors = ['#ffffff', '#ffb6c1', '#ff69b4', '#ffe4e1'];

    for (let i = 0; i < numTulips; i++) {
        let tulip = document.createElement('div');
        tulip.classList.add('roaming-tulip');
        
        let color = colors[Math.floor(Math.random() * colors.length)];
        tulip.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" stroke="rgba(255,255,255,0.5)" stroke-width="0.5" xmlns="http://www.w3.org/2000/svg"><path d="${tulipPath}"/></svg>`;
        
        tulip.style.left = `${Math.random() * 100}vw`;
        
        let rot = Math.random() * 360;
        tulip.style.setProperty('--rot-z', `${rot}deg`);

        // Slower speed as requested (25-45 seconds to cross screen)
        let duration = Math.random() * 20 + 25; 
        let delay = Math.random() * -30; 
        
        tulip.style.animation = `sparseRoam ${duration}s linear ${delay}s infinite`;
        
        roamingContainer.appendChild(tulip);
    }
}

function stopFloatingTulips() {
    roamingContainer.innerHTML = '';
}

// B. Continuous Canvas Petal Fall (Pages 3 & 4)
function initCanvasSize() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
}

window.addEventListener("resize", () => {
    initCanvasSize();
    if(isFallActive) {
        createPetals(); // Recreate petals on resize to avoid glitching
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
    
    // Clear canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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

    // Bulletproof clear for mobile
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
                
