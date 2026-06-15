const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const replayPopup = document.getElementById('replay-popup');
const roamingContainer = document.getElementById('roaming-tulips-container');

// Canvas variables
let isPetalFallActive = false;
let isRoamingActive = false;
let roamingTulips = [];
let animationFrameId;

// Petal Fall Variables
let W, H, DPR;
const colors = ["#ff6ea8", "#ff8cbc", "#ffb2cf", "#ffd0de", "#f7a6c5"];
let canvasPetals = [];

// 5 Photo Positions
let shuffleInterval;
const positions = ['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5'];

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

// A. Sparse Roaming Tulips (Pages 1 & 2)
// Mixture of SVGs and Emojis, higher speed, z-index managed by container
function startFloatingTulips() {
    if (isRoamingActive) return;
    isRoamingActive = true;
    roamingContainer.innerHTML = ''; 
    
    // Increased quantity
    const numTulips = 12; 
    const svgPath = "M12 2c0 0-7 4-7 11 0 4 3 8 7 9 4-1 7-5 7-9 0-7-7-11-7-11z M12 22 L12 13 M9 21 c0 0 3-11 3-11 M15 21 c0 0-3-11-3-11";
    const roamingColors = ['#ffffff', '#ffb6c1', '#ff69b4', '#ffe4e1'];

    for (let i = 0; i < numTulips; i++) {
        let tulip = document.createElement('div');
        tulip.classList.add('roaming-tulip');
        
        // Mix emojis and SVGs
        if (i % 2 === 0) {
            tulip.textContent = "🌷";
            tulip.style.fontSize = "35px";
        } else {
            let color = roamingColors[Math.floor(Math.random() * roamingColors.length)];
            tulip.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" stroke="rgba(255,255,255,0.5)" stroke-width="0.5" xmlns="http://www.w3.org/2000/svg"><path d="${svgPath}"/></svg>`;
            tulip.style.width = "30px";
            tulip.style.height = "40px";
        }
        
        let x = Math.random() * window.innerWidth;
        let y = Math.random() * window.innerHeight;
        
        // Increased speed
        let vx = (Math.random() - 0.5) * 2.5; 
        let vy = (Math.random() - 0.5) * 2.5;

        roamingContainer.appendChild(tulip);

        roamingTulips.push({
            el: tulip,
            x: x,
            y: y,
            vx: vx,
            vy: vy
        });
    }
    
    requestAnimationFrame(moveRoamingTulips);
}

function moveRoamingTulips() {
    if (!isRoamingActive) return;

    for (let t of roamingTulips) {
        t.x += t.vx;
        t.y += t.vy;

        // Bounce
        if (t.x < 0 || t.x > window.innerWidth - 40) t.vx *= -1;
        if (t.y < 0 || t.y > window.innerHeight - 40) t.vy *= -1;

        t.el.style.transform = `translate(${t.x}px, ${t.y}px)`;
        // Add gentle rotation
        t.el.style.rotate = `${Math.sin(t.x/50) * 15}deg`;
    }

    requestAnimationFrame(moveRoamingTulips);
}

function stopFloatingTulips() {
    isRoamingActive = false;
    roamingContainer.innerHTML = '';
    roamingTulips = [];
}

// B. Continuous Canvas Petal Fall (Pages 3 & 4) - Smear Fix Applied
function initCanvasSize() {
    const canvas = document.getElementById("petal-canvas");
    const ctx = canvas.getContext("2d");
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = window.devicePixelRatio || 1;
    // Lock the internal canvas resolution to prevent smearing
    canvas.width = W * DPR;
    canvas.height = H * DPR;
}

window.addEventListener("resize", () => {
    initCanvasSize();
    if(isPetalFallActive) {
        canvasPetals = []; // Reset petals to adjust to new screen size
        createCanvasPetals();
    }
});

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = arr => arr[(Math.random() * arr.length) | 0];

function createCanvasPetals() {
    const count = Math.min(75, Math.floor((W * H) / 18000) + 40);
    canvasPetals = [];
    for (let i = 0; i < count; i++) {
        canvasPetals.push({
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
    if (isPetalFallActive) return;
    isPetalFallActive = true;
    
    if (canvasPetals.length === 0) {
        createCanvasPetals();
    }
    animateCanvasPetals();
}

function stopPetalFall() {
    isPetalFallActive = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    const canvas = document.getElementById("petal-canvas");
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCanvasPetal(ctx, p) {
    ctx.save();
    // Use DPR to draw sharply on mobile
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

function animateCanvasPetals() {
    if (!isPetalFallActive) return;

    const canvas = document.getElementById("petal-canvas");
    const ctx = canvas.getContext("2d");

    // THE FIX: Absolutely force the canvas to wipe clean every frame to prevent smearing
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of canvasPetals) {
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

        drawCanvasPetal(ctx, p);
    }

    animationFrameId = requestAnimationFrame(animateCanvasPetals);
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
                   
