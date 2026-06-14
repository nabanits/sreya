const audio = document.getElementById('bg-music');
const arrow = document.getElementById('audio-arrow');
const replayPopup = document.getElementById('replay-popup');
let typingActive = false; // Flag to prevent typing bug

// --- 1. THEME & AUDIO INITIALIZATION ---
window.onload = function() {
    // Generate the Parallax Background
    generateBackgroundTulips();

    audio.play().then(() => {
        arrow.innerHTML = 'Audio playing';
        setTimeout(() => arrow.classList.add('hidden'), 3000); 
    }).catch(e => {
        arrow.innerHTML = 'Tap here to enable music';
        arrow.classList.remove('hidden');
    });
};

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const toggleBtn = document.getElementById('theme-toggle');
    if(document.body.classList.contains('light-mode')) {
        toggleBtn.innerText = '🌙';
    } else {
        toggleBtn.innerText = '☀️';
    }
}

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

// --- 2. STEP NAVIGATION & SEAL LOGIC ---
function goToStep(stepNumber) {
    if (audio.paused && document.getElementById('audio-control').innerText === '🔊') {
        audio.play().catch(e => console.log("Audio play failed"));
        arrow.classList.add('hidden');
    }

    document.querySelectorAll('.step-container').forEach(step => {
        step.classList.remove('active');
        setTimeout(() => step.classList.add('hidden'), 800); 
    });

    if (stepNumber === 2) {
        document.getElementById('btn2').classList.add('hidden');
        // Reset the seal every time they visit page 2
        document.getElementById('seal-overlay').classList.remove('broken');
        document.getElementById('title1').style.opacity = '0';
        document.getElementById('title2').style.opacity = '0';
        document.getElementById('type1').innerHTML = '';
        document.getElementById('type2').innerHTML = '';
        typingActive = false;
    }

    setTimeout(() => {
        const nextStep = document.getElementById('step' + stepNumber);
        nextStep.classList.remove('hidden');
        setTimeout(() => nextStep.classList.add('active'), 50); 
    }, 800);
}

// Breaking the Glass Seal on Page 2
function breakSeal() {
    if (typingActive) return; // Prevent double clicks
    typingActive = true;
    
    // Break animation
    document.getElementById('seal-overlay').classList.add('broken');
    
    // Wait for glass to slide away, then fade in titles and start typing
    setTimeout(() => {
        document.getElementById('title1').style.opacity = '1';
        document.getElementById('title2').style.opacity = '1';
        document.getElementById('title1').style.transition = 'opacity 0.5s';
        document.getElementById('title2').style.transition = 'opacity 0.5s';
        
        let typingCompleted = 0; 
        const checkDone = () => {
            typingCompleted++;
            if (typingCompleted === 2) {
                document.getElementById('btn2').classList.remove('hidden');
            }
        };
        typeWriter('source1', 'type1', checkDone);
        typeWriter('source2', 'type2', checkDone);
    }, 1200); // 1.2s matches CSS transition time
}

// Live Typing
function typeWriter(sourceId, targetId, callback) {
    const text = document.getElementById(sourceId).innerHTML;
    const target = document.getElementById(targetId);

    if (target.typingTimer) clearTimeout(target.typingTimer);

    target.innerHTML = ''; 
    target.classList.add('typing-target'); 
    let i = 0;

    function type() {
        if (i < text.length) {
            target.innerHTML += text.charAt(i);
            i++;
            target.typingTimer = setTimeout(type, 30); 
        } else {
            target.classList.remove('typing-target'); 
            if (callback) callback();
        }
    }
    type();
}

// --- 3. BACKGROUND WIND TULIPS ---
function generateBackgroundTulips() {
    const container = document.getElementById('parallax-bg-container');
    const numTulips = window.innerWidth < 600 ? 8 : 15; // Keep it sparse and elegant
    
    for (let i = 0; i < numTulips; i++) {
        let tulip = document.createElement('div');
        tulip.classList.add('parallax-tulip');
        
        let size = Math.random() * 150 + 50; // Size 50px to 200px
        let blur = Math.random() * 8 + 2; // Blur 2px to 10px for depth
        let rot = Math.random() * 40 - 20; // Initial rotation tilt
        let speed = Math.random() * 5 + 4; // Wind sway speed

        tulip.style.width = `${size}px`;
        tulip.style.height = `${size}px`;
        tulip.style.left = `${Math.random() * 100}vw`;
        tulip.style.top = `${Math.random() * 100}vh`;
        
        tulip.style.setProperty('--blur-amt', `${blur}px`);
        tulip.style.setProperty('--rot', `${rot}deg`);
        tulip.style.setProperty('--speed', `${speed}s`);

        container.appendChild(tulip);
    }
}

// --- 4. THE CUSTOM SVG CONFETTI ENGINE ---
function launchConfetti() {
    const container = document.getElementById('confetti-canvas');
    
    // The raw SVG path for a perfect tulip shape
    const tulipPath = "M12,22 C18,22 20,15 20,11 L4,11 C4,15 6,22 12,22 Z M4,11 L9,3 L12,11 Z M20,11 L15,3 L12,11 Z M9,11 L12,1 L15,11 Z";
    
    // A premium color palette including white, pinks, mauve, and soft yellow
    const colors = ['#ffffff', '#ff66b2', '#ff99cc', '#d8b4e2', '#fde2bb'];

    for (let i = 0; i < 45; i++) {
        let conf = document.createElement('div');
        conf.classList.add('confetti-piece');
        
        // Pick a random real color from our palette
        let color = colors[Math.floor(Math.random() * colors.length)];
        
        // Inject the SVG directly into the HTML
        conf.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" width="100%" height="100%"><path d="${tulipPath}"/></svg>`;

        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10vh'; 

        let duration = Math.random() * 4 + 4; 
        let delay = Math.random() * 2;
        
        conf.style.animation = `svgFall ${duration}s linear ${delay}s forwards`;
        
        conf.addEventListener('animationend', () => conf.remove());
        container.appendChild(conf);
    }
}

// --- 5. CINEMATIC LIGHTBOX ---
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
            
