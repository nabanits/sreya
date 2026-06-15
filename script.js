const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const canvas = document.getElementById("petal-canvas");
const ctx = canvas.getContext("2d");
const bgLayer = document.getElementById('tulips-bg-layer');
const fgLayer = document.getElementById('tulips-fg-layer');

// State control
let currentStep = 1;
let isPetalFallActive = false;
let animationFrameId;
let isRoamingActive = false;
let roamingTulips = [];

// 5 Photo Positions
let shuffleInterval;
let positions = ['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5'];

// Canvas Variables
let W, H, DPR;
let petals = [];

// --- 1. INITIALIZATION & AUDIO ---
window.onload = function() {
    initCanvasSize();
    // Start roaming on P1 load. Note: layering is "behind" on P1.
    startRoamingEngine(1); 

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
    currentStep = stepNumber;

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

    // --- THE ANIMATION SWITCH LOGIC ---
    if (stepNumber <= 2) {
        stopPetalFall();
        startRoamingEngine(stepNumber); // New engine handling layering
    } else {
        stopRoamingEngine();
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

// Typewriter Engine
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

// A. NEW: Actual 🌷 Roaming freely Engine (Pages 1 & 2)
// Implements layering logic: P1 behind cake, P2 mixed.
function startRoamingEngine(page) {
    if (isRoamingActive) {
        // If already running, just redistribute based on new page rules
        redistributeTulips(page);
        return;
    }
    isRoamingActive = true;
    bgLayer.innerHTML = '';
    fgLayer.innerHTML = '';
    roamingTulips = [];

    // Concentration increased by 1.5x. Base was 8, now 12.
    const numTulips = 12; 
    const emoji = "🌷";

    for (let i = 0; i < numTulips; i++) {
        let tDiv = document.createElement("div");
        tDiv.className = "actual-tulip";
        tDiv.textContent = emoji;
        
        // Random starting position
        let x = Math.random() * (window.innerWidth - 40);
        let y = Math.random() * (window.innerHeight - 40);
        
        // Random direction and moderate speed
        let vx = (Math.random() - 0.5) * 2.5; 
        let vy = (Math.random() - 0.5) * 2.5;

        // Apply initial placement
        tDiv.style.transform = `translate(${x}px, ${y}px)`;
        
        // Layering logic based on page and percentage
        // P1: All behind content.
        // P2: Max (61%) behind, 39% above.
        let targetLayer = bgLayer;
        if (page === 2 && i < numTulips * 0.39) {
            targetLayer = fgLayer; // Layer in front
        }
        
        targetLayer.appendChild(tDiv);

        roamingTulips.push({
            el: tDiv,
            x: x,
            y: y,
            vx: vx,
            vy: vy
        });
    }

    requestAnimationFrame(moveTulips);
}

function moveTulips() {
    if (!isRoamingActive) return;

    const limitX = window.innerWidth - 40;
    const limitY = window.innerHeight - 40;

    for (let t of roamingTulips) {
        t.x += t.vx;
        t.y += t.vy;

        // Bounce off screen edges
        if (t.x < 0 || t.x > limitX) t.vx *= -1;
        if (t.y < 0 || t.y > limitY) t.vy *= -1;

        // Apply new position
        t.el.style.transform = `translate(${t.x}px, ${t.y}px)`;
    }

    requestAnimationFrame(moveTulips);
}

// Logic to move existing tulips between layers when switching pages 1 <-> 2
function redistributeTulips(page) {
    if (page === 1) {
        // Move all tulips back to BG layer (behind cake)
        while (fgLayer.firstChild) {
            bgLayer.appendChild(fgLayer.firstChild);
        }
    } else if (page === 2) {
        // Distribute 39% to FG layer (above text)
        const total = roamingTulips.length;
        const targetFgCount = Math.floor(total * 0.39);
        
        // Get elements currently in BG layer
        const bgTulips = Array.from(bgLayer.children);
        
        for (let i = 0; i < targetFgCount && i < bgTulips.length; i++) {
            fgLayer.appendChild(bgTulips[i]);
        }
    }
}

function stopRoamingEngine() {
    isRoamingActive = false;
    bgLayer.innerHTML = '';
    fgLayer.innerHTML = '';
    roamingTulips = [];
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
    if(isPetalFallActive) {
        createPetals();
    }
});

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = arr => arr[(Math.random() * arr.length) | 0];

function createPetals() {
    const petalColors = ["#ff6ea8", "#ff8cbc", "#ffb2cf", "#ffd0de", "#f7a6c5"];
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
            color: pick(petalColors),
            alpha: rand(0.65, 0.95)
        });
    }
}

function startPetalFall() {
    if (isPetalFallActive) return;
    isPetalFallActive = true;
    
    if (petals.length === 0) {
        createPetals();
    }
    animatePetals();
}

function stopPetalFall() {
    isPetalFallActive = false;
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
    if (!isPetalFallActive) return;

    // Clear canvas
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
