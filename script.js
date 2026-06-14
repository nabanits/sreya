const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const canvas = document.getElementById("petal-canvas");
const ctx = canvas.getContext("2d");

let W = 0, H = 0, DPR = 1;
let petals = [];
let isHeavyFall = false; // Flag to control shower intensity

// --- 1. INITIALIZATION & AUDIO ---
window.onload = function() {
    initPetals(); // Setup the canvas
    
    // Start with sparse, slow roaming for pages 1 and 2
    isHeavyFall = false; 

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

// --- 2. STEP NAVIGATION & LOGIC ---
function goToStep(stepNumber) {
    if (audio.paused && document.getElementById('audio-control').innerText === '🔊') {
        audio.play().catch(e => console.log("Audio play failed"));
        arrow.classList.add('hidden');
    }

    // Adjust petal behavior based on the page
    if (stepNumber >= 3) {
        isHeavyFall = true; // Switch to full shower
    } else {
        isHeavyFall = false; // Switch to sparse roaming
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

// --- 3. DYNAMIC CANVAS PETAL ENGINE ---
// Uses your provided code but modifies behavior based on `isHeavyFall`
function initPetals() {
    function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.floor(W * DPR);
        canvas.height = Math.floor(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    window.addEventListener("resize", resize);
    resize();

    const colors = ["#ff6ea8", "#ff8cbc", "#ffb2cf", "#ffd0de", "#f7a6c5"];
    const rand = (min, max) => Math.random() * (max - min) + min;
    const pick = arr => arr[(Math.random() * arr.length) | 0];

    // Create max petals needed for the heavy fall
    const maxCount = Math.min(75, Math.floor((W * H) / 18000) + 40);

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
            // Base alpha, will be modified by logic
            baseAlpha: rand(0.65, 0.95), 
            // Randomly assign a subset of petals to be "sparse"
            isSparse: Math.random() < 0.2 
        });
    }

    function drawPetal(p, currentAlpha) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(p.s, p.s);
        ctx.globalAlpha = currentAlpha;

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

    function animate() {
        ctx.clearRect(0, 0, W, H);

        for (const p of petals) {
            // Determine behavior based on page state
            let currentVy = isHeavyFall ? p.vy : p.vy * 0.3; // Slower on P1/P2
            let currentAlpha = isHeavyFall ? p.baseAlpha : 0.6; // Opacity 0.6 on P1/P2
            
            // Only show a fraction of petals on P1/P2
            let shouldDraw = isHeavyFall || p.isSparse;

            p.x += p.vx + Math.sin(p.wave) * 0.35;
            p.y += currentVy;
            p.rot += p.vr;
            p.wave += 0.03;

            if (p.y > H + 25) {
                p.y = -25;
                p.x = rand(0, W);
            }
            if (p.x < -30) p.x = W + 30;
            if (p.x > W + 30) p.x = -30;

            if (shouldDraw) {
                drawPetal(p, currentAlpha);
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// --- 4. PHOTO GALLERY & LIGHTBOX ---
// Removed the automatic shuffle interval. The 5 photos now just sit elegantly.

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
        
