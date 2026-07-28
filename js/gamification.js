/**
 * CyberShield - gamification.js
 * Controls rewarding and displaying gamified accomplishments like Level-Ups,
 * custom CSS badge rewards, pure canvas-based confetti celebration, and glowing visual toasts.
 */

window.Gamification = (function() {
    
    // Create notification container on screen if not already present
    function getOrCreateToastContainer() {
        let container = document.getElementById('cybershield-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'cybershield-toast-container';
            container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col space-y-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none';
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Display a gorgeously designed cyber toast notification
     * @param {string} title Toast Header
     * @param {string} text Toast message
     * @param {'info' | 'success' | 'warning' | 'xp' | 'badge'} type Visual mode
     */
    function showToast(title, text, type = 'success') {
        const container = getOrCreateToastContainer();
        
        const toast = document.createElement('div');
        toast.className = 'pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border bg-slate-950/90 backdrop-blur-md shadow-2xl transition-all duration-500 transform translate-y-10 opacity-0';
        
        // Custom style & Icon based on type
        let borderClass = 'border-slate-800';
        let iconSvg = '';
        
        switch(type) {
            case 'success':
                borderClass = 'border-emerald-500/50 shadow-emerald-500/10 text-emerald-400';
                iconSvg = `<svg class="w-5 h-5 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
                break;
            case 'warning':
                borderClass = 'border-red-500/50 shadow-red-500/10 text-red-400';
                iconSvg = `<svg class="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
                break;
            case 'xp':
                borderClass = 'border-amber-500/60 shadow-amber-500/15 text-amber-400';
                iconSvg = `<svg class="w-5 h-5 text-amber-400 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`;
                break;
            case 'badge':
                borderClass = 'border-purple-500/60 shadow-purple-500/15 text-purple-400';
                iconSvg = `<svg class="w-5 h-5 text-purple-400 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`;
                break;
            default:
                borderClass = 'border-cyan-500/50 shadow-cyan-500/10 text-cyan-400';
                iconSvg = `<svg class="w-5 h-5 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
        }

        toast.className += ` ${borderClass}`;
        
        toast.innerHTML = `
            <div class="flex-shrink-0">${iconSvg}</div>
            <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-slate-100 uppercase tracking-wider">${title}</p>
                <p class="text-[11px] text-slate-400 mt-0.5 leading-normal">${text}</p>
            </div>
            <button class="flex-shrink-0 text-slate-500 hover:text-slate-300 ml-1 cursor-pointer focus:outline-none" onclick="this.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Trigger CSS animation entry
        setTimeout(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
        }, 10);
        
        // Auto remove after 4.5 seconds
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-10');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 4500);
    }

    /**
     * Animate numeric value count-up nicely
     * @param {HTMLElement} element Target UI element
     * @param {number} start Initial value
     * @param {number} end Final target value
     * @param {number} duration In milliseconds
     * @param {string} suffix Add extra characters (like " XP")
     */
    function countUp(element, start, end, duration = 1000, suffix = '') {
        if (!element) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.innerText = Math.floor(progress * (end - start) + start) + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.innerText = end + suffix;
            }
        };
        window.requestAnimationFrame(step);
    }

    /**
     * Launch high performance 100% pure JS canvas confetti
     */
    function launchConfetti() {
        const canvas = document.createElement('canvas');
        canvas.id = 'cybershield-confetti-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '99999';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        const colors = ['#f4af23', '#30bced', '#10b981', '#ef4444', '#a855f7', '#3b82f6'];
        const particles = [];

        for (let i = 0; i < 120; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height - height,
                r: Math.random() * 5 + 4,
                d: Math.random() * height,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 5,
                tiltAngleIncremental: Math.random() * 0.06 + 0.02,
                tiltAngle: 0
            });
        }

        let animationFrameId;
        const startTime = Date.now();

        function draw() {
            ctx.clearRect(0, 0, width, height);

            let active = false;
            particles.forEach((p) => {
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.x += Math.sin(p.tiltAngle);
                p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 12;

                if (p.y <= height) {
                    active = true;
                }

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();
            });

            if (active && Date.now() - startTime < 4000) {
                animationFrameId = requestAnimationFrame(draw);
            } else {
                cancelAnimationFrame(animationFrameId);
                window.removeEventListener('resize', handleResize);
                canvas.remove();
            }
        }

        draw();
    }

    /**
     * Show a stunning fullscreen or centered popup for student promotion
     * @param {string} oldBadge 
     * @param {string} newBadge 
     */
    function showPromotionModal(oldBadge, newBadge) {
        // Prevent duplicates
        if (document.getElementById('promotion-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'promotion-modal';
        modal.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4 active-screen';
        
        modal.innerHTML = `
            <div class="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/40 p-8 rounded-2xl max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(244,175,35,0.15)]">
                <!-- Stars back glow -->
                <div class="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <!-- Animated rotating Police Shield -->
                <div class="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                    <div class="absolute inset-0 bg-amber-500/20 rounded-full filter blur-xl animate-pulse"></div>
                    <svg class="w-24 h-24 text-amber-500 badge-glow relative" viewBox="0 0 100 100" fill="none">
                        <!-- Shield -->
                        <path d="M50 10 L85 22 V55 C85 75 50 90 50 90 C50 90 15 75 15 55 V22 Z" stroke="#f4af23" stroke-width="4" fill="#1e1b4b" fill-opacity="0.9"/>
                        <!-- Inner star symbol -->
                        <polygon points="50,25 54,34 64,34 56,40 59,50 50,44 41,50 44,40 36,34 46,34" fill="#f4af23"/>
                        <circle cx="50" cy="65" r="8" fill="none" stroke="#f4af23" stroke-width="2"/>
                        <path d="M47 65 H53 M50 62 V68" stroke="#f4af23" stroke-width="2"/>
                    </svg>
                </div>

                <span class="text-[10px] font-bold text-amber-500 uppercase tracking-[0.25em] font-mono">SZOLGÁLATI ELŐLÉPTETÉS!</span>
                <h3 class="text-3xl font-black text-white mt-1">Új Rangot Ért El!</h3>
                <p class="text-xs text-slate-400 mt-2 leading-relaxed">Ön sikeresen teljesítette a hivatali követelményeket és új biztonsági szintre lépett a Magyar Rendőrség állományában.</p>

                <div class="my-6 p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-center space-x-4">
                    <div class="text-right">
                        <p class="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Előző rang</p>
                        <p class="text-xs font-bold text-slate-400">${oldBadge}</p>
                    </div>
                    <div class="text-amber-500 font-bold">➜</div>
                    <div class="text-left">
                        <p class="text-[9px] text-amber-500 uppercase tracking-wider font-mono">Új kinevezés</p>
                        <p class="text-sm font-extrabold text-amber-400">${newBadge}</p>
                    </div>
                </div>

                <button onclick="document.getElementById('promotion-modal').remove()" class="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all tracking-wider uppercase cursor-pointer shadow-lg shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-400">
                    Kinevezés átvétele
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        launchConfetti(); // Instantly celebrate with pure confetti!
    }

    return {
        showToast: showToast,
        countUp: countUp,
        launchConfetti: launchConfetti,
        showPromotionModal: showPromotionModal
    };
})();
