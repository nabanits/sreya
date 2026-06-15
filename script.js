const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const canvas = document.getElementById("petal-canvas");
const ctx = canvas.getContext("2d");

// State control
let currentStep = 1;
let isPetalFallActive = false;
let isRoamingActive = false;
let roamingItems = []; 
let animationFrameId;

// 5 Photo Positions
let shuffleInterval;
const positions = ['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5'];

// Canvas Variables
let W, H, DPR;
let canvasPetals = [];

// --- 1. INITIALIZATION & AUDIO ---
window.onload = function() {
    initCanvasSize();
    
    // Page 1 Init: Force fgLayer behind content
    const fgLayer = document.getElementById('roaming-fg-layer');
    if(fgLayer) fgLayer.style.zIndex = "2"; 
    
    startFloatingItems(); 

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

    // --- THE STRICT ANIMATION SWITCH LOGIC ---
    const fgLayer = document.getElementById('roaming-fg-layer');

    if (stepNumber === 1) {
        // Page 1: ALL roaming items behind the cake
        if(fgLayer) fgLayer.style.zIndex = "2"; 
        stopPetalFall();
        startFloatingItems();
    } 
    else if (stepNumber === 2) {
        // Page 2: 30% jump in front of the text (z-index 10)
        if(fgLayer) fgLayer.style.zIndex = "10"; 
        stopPetalFall();
        startFloatingItems();
    } 
    else if (stepNumber === 3) {
        // Page 3: NOTHING. Completely static.
        stopFloatingItems();
        stopPetalFall();
    } 
    else if (stepNumber === 4) {
        // Page 4: ONLY Canvas Petal Shower
        stopFloatingItems();
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

// Typewriter Function
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

// A. MIXED ROAMING ENGINE (Pages 1 & 2)
function startFloatingItems() {
    if (isRoamingActive) return; 
    isRoamingActive = true;
    
    const bgLayer = document.getElementById('roaming-bg-layer');
    const fgLayer = document.getElementById('roaming-fg-layer');
    bgLayer.innerHTML = ''; 
    fgLayer.innerHTML = '';
    roamingItems = [];
    
    // Increased quantity by 1.5x (total 20 items)
    const totalItems = 20; 
    const fgCount = Math.floor(totalItems * 0.30); // 30% assigned to front layer
    
    const svgPath = "M12 2c0 0-7 4-7 11 0 4 3 8 7 9 4-1 7-5 7-9 0-7-7-11-7-11z M12 22 L12 13 M9 21 c0 0 3-11 3-11 M15 21 c0 0-3-11-3-11";
    const roamingColors = ['#ffffff', '#ffb6c1', '#ff69b4', '#ffe4e1'];

    for (let i = 0; i < totalItems; i++) {
        let t = document.createElement('div');
        let isEmoji = (i % 2 === 0); // 50/50 split of SVG and Emoji
        
        let itemData = {
            el: t,
            type: isEmoji ? 'emoji' : 'svg',
            x: Math.random() * (window.innerWidth - 40),
            y: 0,
            vx: 0,
            vy: 0,
            wave: Math.random() * Math.PI * 2
        };

        if (isEmoji) {
            t.className = "roaming-tulip roaming-emoji";
            t.textContent = "🌷";
            itemData.y = Math.random() * (window.innerHeight - 40);
            
            // NORMAL BOUNCING SPEED
            itemData.vx = (Math.random() - 0.5) * 2;
            itemData.vy = (Math.random() - 0.5) * 2;
        } else {
            t.className = "roaming-tulip roaming-svg";
            let color = roamingColors[Math.floor(Math.random() * roamingColors.length)];
            t.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" stroke="rgba(255,255,255,0.5)" stroke-width="0.5" xmlns="http://www.w3.org/2000/svg"><path d="${svgPath}"/></svg>`;
            
            // SVG starts lower and has NORMAL UPWARD speed
            itemData.y = window.innerHeight + (Math.random() * 200);
            itemData.vy = (Math.random() * 1.5) + 1.2; 
        }
        
        let layer = (i < fgCount) ? fgLayer : bgLayer;
        layer.appendChild(t);
        roamingItems.push(itemData);
    }
    
    requestAnimationFrame(moveFloatingItems);
}

function moveFloatingItems() {
    if (!isRoamingActive) return;

    for (let item of roamingItems) {
        if (item.type === 'svg') {
            // SVGs FLOAT UP CONTINUOUSLY
            item.y -= item.vy; 
            item.wave += 0.02;
            item.x += Math.sin(item.wave) * 0.5; 

            // Respawn exactly at bottom when off-screen
            if (item.y < -60) {
                item.y = window.innerHeight + 60;
                item.x = Math.random() * window.innerWidth;
            }
        } else {
            // EMOJIS BOUNCE RANDOMLY
            item.x += item.vx;
            item.y += item.vy;

            if (item.x < 0 || item.x > window.innerWidth - 40) item.vx *= -1;
            if (item.y < 0 || item.y > window.innerHeight - 40) item.vy *= -1;
            
            item.el.style.rotate = `${Math.sin(item.x/60) * 15}deg`;
        }

        item.el.style.transform = `translate(${item.x}px, ${item.y}px)`;
    }

    requestAnimationFrame(moveFloatingItems);
}

function stopFloatingItems() {
    isRoamingActive = false;
    document.getElementById('roaming-bg-layer').innerHTML = '';
    document.getElementById('roaming-fg-layer').innerHTML = '';
    roamingItems = [];
}

// B. CANVAS PETAL ENGINE (Page 4 ONLY)
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
        canvasPetals = [];
        createCanvasPetals();
    }
});

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = arr => arr[(Math.random() * arr.length) | 0];

function createCanvasPetals() {
    const petalColors = ["#ff6ea8", "#ff8cbc", "#ffb2cf", "#ffd0de", "#f7a6c5"];
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
            color: pick(petalColors),
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
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCanvasPetal(ctx, p) {
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

function animateCanvasPetals() {
    if (!isPetalFallActive) return;

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
