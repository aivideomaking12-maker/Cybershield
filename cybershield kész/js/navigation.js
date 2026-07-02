/**
 * CyberShield - navigation.js
 * Controls screen transitions, tab management, dynamic HTML injection
 * with skeleton loaders for training modules, and refreshing map indicators with gold/green/blue/gray color states.
 */

window.Navigation = (function() {
    
    // List of all screen IDs in the index.html
    const ALL_SCREENS = [
        'screen-landing',
        'screen-profile',
        'screen-diagnostic',
        'screen-diagnostic-result',
        'screen-map',
        'screen-module',
        'screen-office-errors',
        'screen-escaperoom',
        'screen-teacher',
        'screen-future'
    ];

    let currentModuleId = null;
    let activeModuleQuestionIndex = 0;
    let moduleAnswers = [];

    /**
     * Show a specific screen and hide all others
     * @param {string} screenId ID of the section to show
     */
    function showScreen(screenId) {
        if (!ALL_SCREENS.includes(screenId)) {
            console.error(`Ismeretlen képernyő ID: ${screenId}`);
            return;
        }

        // Hide all screens
        ALL_SCREENS.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden');
                el.classList.remove('active-screen');
            }
        });

        // Show target screen
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove('hidden');
            // Force animation frame
            setTimeout(() => {
                target.classList.add('active-screen');
            }, 50);
        }

        // Run screen-specific initializers
        onScreenActivated(screenId);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToHome() {
        const state = window.Progress.load();
        if (state.user) {
            showScreen('screen-map');
        } else {
            showScreen('screen-landing');
        }
    }

    /**
     * Screen initializers
     * Runs when screen is switched to update relevant stats or bind events
     */
    function onScreenActivated(screenId) {
        const state = window.Progress.getState();
        const isLoggedIn = !!state.user;

        const navMap = document.getElementById('nav-btn-map');
        const navTeacher = document.getElementById('nav-btn-teacher');
        const logoutBtn = document.getElementById('logout-btn');

        if (isLoggedIn) {
            if (navMap) navMap.classList.remove('hidden');
            if (navTeacher) navTeacher.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
        } else {
            if (navMap) navMap.classList.add('hidden');
            if (navTeacher) navTeacher.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
        }

        switch (screenId) {
            case 'screen-map':
                refreshMapBlueprintUI();
                break;
            case 'screen-office-errors':
                window.Quiz.initOfficeErrorFinder();
                break;
            case 'screen-escaperoom':
                window.Quiz.initEscapeRoom();
                break;
            case 'screen-teacher':
                refreshTeacherPanelUI();
                break;
        }
    }

    /**
     * Draw room status and sidebar lists inside main Map screen
     */
    function refreshMapBlueprintUI() {
        const state = window.Progress.load();
        const sidebarDiv = document.getElementById('map-sidebar-modules');
        const modulesList = [1, 2, 3, 4, 5];
        
        if (sidebarDiv) sidebarDiv.innerHTML = '';

        let completedCount = 0;

        modulesList.forEach(id => {
            const mData = window.QuizData.modules[id];
            const isCompleted = window.Progress.isModuleCompleted(id);
            const isUnlocked = isModuleUnlocked(id);
            const comDetails = state.completedModules[id];
            const isPerfect = comDetails && (comDetails.score === comDetails.total);

            if (isCompleted) {
                completedCount++;
            }

            // 1. Update Blueprint SVG rect/statuses
            const statusText = document.getElementById(`room${id}-status`);
            const roomGroup = document.querySelector(`.map-room[onclick="Navigation.enterModule(${id})"]`);
            
            if (statusText) {
                if (isCompleted) {
                    if (isPerfect) {
                        statusText.textContent = "KIVÁLÓ (100%)";
                        statusText.setAttribute("fill", "#f4af23"); // gold
                    } else {
                        statusText.textContent = "TELJESÍTVE";
                        statusText.setAttribute("fill", "#10b981"); // green
                    }
                } else if (isUnlocked) {
                    statusText.textContent = "FOLYAMATBAN";
                    statusText.setAttribute("fill", "#30bced"); // blue
                } else {
                    statusText.textContent = "SZÜRKE (ZÁRT)";
                    statusText.setAttribute("fill", "#64748b"); // gray
                }
            }

            if (roomGroup) {
                const rect = roomGroup.querySelector('.room-rect');
                if (rect) {
                    if (isCompleted) {
                        if (isPerfect) {
                            rect.setAttribute("fill", "rgba(244, 175, 35, 0.12)"); // dark gold back
                            rect.setAttribute("stroke", "#f4af23");
                            rect.setAttribute("stroke-width", "3");
                            rect.style.color = "#f4af23";
                        } else {
                            rect.setAttribute("fill", "rgba(16, 185, 129, 0.1)"); // dark green
                            rect.setAttribute("stroke", "#10b981");
                            rect.setAttribute("stroke-width", "2.5");
                            rect.style.color = "#10b981";
                        }
                        rect.setAttribute("opacity", "1");
                    } else if (isUnlocked) {
                        rect.setAttribute("fill", "rgba(48, 188, 237, 0.08)"); // dark blue
                        rect.setAttribute("stroke", "#30bced");
                        rect.setAttribute("stroke-width", "2.5");
                        rect.setAttribute("opacity", "1");
                        rect.style.color = "#30bced";
                    } else {
                        rect.setAttribute("fill", "#111827"); // dark gray
                        rect.setAttribute("stroke", "#334155");
                        rect.setAttribute("stroke-width", "1.5");
                        rect.setAttribute("opacity", "0.55");
                        rect.style.color = "#64748b";
                    }
                }
            }

            // 2. Add to Sidebar module list
            if (sidebarDiv) {
                const row = document.createElement('div');
                let borderClass = 'border-slate-800 bg-slate-950/40 text-slate-400';
                
                if (isCompleted) {
                    if (isPerfect) {
                        borderClass = 'bg-amber-950/20 border-amber-500/30 text-amber-400 hover:border-amber-500/50';
                    } else {
                        borderClass = 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50';
                    }
                } else if (isUnlocked) {
                    borderClass = 'bg-cyan-950/10 border-cyan-500/30 text-cyan-300 hover:border-cyan-500/50';
                } else {
                    borderClass = 'bg-slate-950/10 border-slate-900 text-slate-600 opacity-55';
                }

                row.className = `p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${borderClass}`;
                
                let icon = '🔒';
                if (isCompleted) {
                    icon = isPerfect ? '🏆' : '✅';
                } else if (isUnlocked) {
                    icon = '📖';
                }

                row.innerHTML = `
                    <div class="flex items-center space-x-2.5">
                        <span class="font-bold font-mono text-base">${icon}</span>
                        <div>
                            <p class="font-bold text-slate-200">${mData.category}</p>
                            <p class="text-[10px] text-slate-450">${mData.title}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        ${isCompleted ? `<span class="text-[10px] font-bold font-mono">+${state.completedModules[id].xp} XP</span>` : `<span class="text-[9px] font-mono text-slate-500">${mData.xpAward} XP</span>`}
                    </div>
                `;
                
                if (isUnlocked) {
                    row.classList.add('cursor-pointer');
                    row.onclick = () => enterModule(id);
                }
                
                sidebarDiv.appendChild(row);
            }
        });

        // 3. Update Circular Progress widget using SVG
        const progressCircle = document.getElementById('overall-progress-circle');
        const progressPercentageText = document.getElementById('overall-progress-percentage');
        const progressSummaryText = document.getElementById('overall-progress-summary');

        if (progressCircle) {
            const r = parseFloat(progressCircle.getAttribute('r')) || 40;
            const circumference = 2 * Math.PI * r;
            const percentage = (completedCount / 5) * 100;
            const offset = circumference - (percentage / 100) * circumference;
            progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
            progressCircle.style.strokeDashoffset = offset;
        }
        if (progressPercentageText) {
            progressPercentageText.textContent = `${(completedCount / 5) * 100}%`;
        }
        if (progressSummaryText) {
            progressSummaryText.textContent = `${completedCount} / 5 Helyiség Auditálva`;
        }
    }

    /**
     * Check if module is unlocked.
     * Module 1 is always open. Subsequent modules open once the previous one is completed.
     */
    function isModuleUnlocked(moduleId) {
        if (moduleId === 1) return true;
        return window.Progress.isModuleCompleted(moduleId - 1);
    }

    // ==============================================
    // MODULE FLOW & TEMPLATE RENDERING WITH SKELETONS
    // ==============================================
    function enterModule(moduleId) {
        if (!isModuleUnlocked(moduleId)) {
            window.Gamification.showToast("Zárt helyiség", "Ezt a helyiséget csak a korábbi modulok sikeres teljesítésével nyithatja meg!", "warning");
            return;
        }

        currentModuleId = moduleId;
        const mData = window.QuizData.modules[moduleId];

        const catEl = document.getElementById('module-header-category');
        const titleEl = document.getElementById('module-header-title');
        const contentArea = document.getElementById('module-content-area');

        if (catEl) catEl.innerText = "KAPCSOLÓDÁS...";
        if (titleEl) titleEl.innerText = "SZOLGÁLATI ADATOK LEKÉRÉSE...";

        // Show Skeleton Loading for 600ms (premium Enterprise simulation)
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="space-y-6">
                    <div class="h-6 bg-slate-800 rounded skeleton w-1/3"></div>
                    <div class="space-y-3">
                        <div class="h-4 bg-slate-800 rounded skeleton w-full"></div>
                        <div class="h-4 bg-slate-800 rounded skeleton w-5/6"></div>
                        <div class="h-4 bg-slate-800 rounded skeleton w-4/5"></div>
                    </div>
                    <div class="h-44 bg-slate-950/60 rounded-xl border border-slate-800 skeleton w-full"></div>
                    <div class="flex justify-between items-center pt-4">
                        <div class="h-10 bg-slate-800 rounded-lg skeleton w-28"></div>
                        <div class="h-10 bg-slate-800 rounded-lg skeleton w-36"></div>
                    </div>
                </div>
            `;
        }

        showScreen('screen-module');

        // Render actual study content after delay
        setTimeout(() => {
            if (catEl) catEl.innerText = mData.category;
            if (titleEl) titleEl.innerText = mData.title;

            if (contentArea) {
                contentArea.innerHTML = `
                    <div class="space-y-6 active-screen">
                        <div class="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                            ${mData.content}
                        </div>
                        
                        <div class="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
                            <button onclick="Navigation.showScreen('screen-map')" class="w-full sm:w-auto px-5 py-2.5 border border-slate-850 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500">Vissza az alaprajzra</button>
                            <button onclick="Navigation.startModuleQuiz()" class="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-cyan-500/15 flex items-center justify-center space-x-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                <span>Kvíz És Ellenőrzés Indítása</span>
                                <span class="font-mono">➜</span>
                            </button>
                        </div>
                    </div>
                `;
            }
        }, 550);
    }

    function startModuleQuiz() {
        activeModuleQuestionIndex = 0;
        moduleAnswers = [];
        renderModuleQuizQuestion();
    }

    function renderModuleQuizQuestion() {
        const contentArea = document.getElementById('module-content-area');
        const mData = window.QuizData.modules[currentModuleId];
        const q = mData.quiz[activeModuleQuestionIndex];

        if (!contentArea || !q) return;

        contentArea.innerHTML = `
            <div class="space-y-6 active-screen">
                <div class="flex justify-between items-center bg-slate-950/50 px-4 py-2.5 border border-slate-850 rounded-xl text-xs font-mono">
                    <span class="text-cyan-400 font-bold tracking-wider">SZAKMAI KVÍZ</span>
                    <span class="text-slate-500 font-semibold">Kérdés: ${activeModuleQuestionIndex + 1} / ${mData.quiz.length}</span>
                </div>

                <div class="space-y-4">
                    <h4 class="text-base font-bold text-slate-100 leading-snug">${activeModuleQuestionIndex + 1}. ${q.question}</h4>
                    
                    <div class="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Kérdés válaszai">
                        ${q.answers.map((ans, idx) => `
                            <button onclick="Navigation.selectModuleAnswer(${idx})" role="radio" aria-checked="false" class="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900/60 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 transition-all flex items-center justify-between group cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                <span>${ans.text}</span>
                                <span class="w-5 h-5 rounded-full border border-slate-700 group-hover:border-cyan-400 flex items-center justify-center text-[9px] text-slate-500 group-hover:text-cyan-400 transition-colors">➜</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="border-t border-slate-800 pt-6 flex justify-start">
                    <button onclick="Navigation.enterModule(${currentModuleId})" class="px-4 py-2 border border-slate-850 text-slate-500 hover:text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition-colors focus:outline-none">Vissza az elméletre</button>
                </div>
            </div>
        `;
    }

    function selectModuleAnswer(answerIdx) {
        moduleAnswers[activeModuleQuestionIndex] = answerIdx;
        const mData = window.QuizData.modules[currentModuleId];
        const q = mData.quiz[activeModuleQuestionIndex];
        const isCorrect = q.answers[answerIdx].correct;

        if (!isCorrect) {
            window.Progress.addWeakness(q.question);
        }

        activeModuleQuestionIndex++;

        if (activeModuleQuestionIndex < mData.quiz.length) {
            renderModuleQuizQuestion();
        } else {
            finishModuleQuiz();
        }
    }

    function finishModuleQuiz() {
        const mData = window.QuizData.modules[currentModuleId];
        let correctCount = 0;

        mData.quiz.forEach((q, idx) => {
            const userAnsIdx = moduleAnswers[idx];
            if (q.answers[userAnsIdx] && q.answers[userAnsIdx].correct) {
                correctCount++;
            }
        });

        const scoreString = `${correctCount} / ${mData.quiz.length}`;
        const isPerfect = (correctCount === mData.quiz.length);

        // Award proportional XP
        let xpAwarded = mData.xpAward;
        if (!isPerfect) {
            xpAwarded = Math.round(mData.xpAward * (correctCount / mData.quiz.length));
        }

        // Save completed module state
        window.Progress.completeModule(currentModuleId, correctCount, mData.quiz.length, xpAwarded);

        const contentArea = document.getElementById('module-content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="text-center py-8 space-y-6 max-w-md mx-auto active-screen">
                    <div class="w-20 h-20 bg-emerald-500/10 rounded-full border ${isPerfect ? 'border-amber-500/40 shadow-[0_0_20px_rgba(244,175,35,0.25)]' : 'border-emerald-500/30'} flex items-center justify-center mx-auto relative">
                        <svg class="w-10 h-10 ${isPerfect ? 'text-amber-400' : 'text-emerald-400'}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>

                    <div>
                        <span class="text-[10px] font-bold ${isPerfect ? 'text-amber-400' : 'text-emerald-400'} uppercase tracking-[0.2em] font-mono">${isPerfect ? 'Tökéletes Megoldás!' : 'Modul Sikeresen Elvégezve'}</span>
                        <h3 class="text-2xl font-extrabold text-white mt-1">Auditálás Befejezve</h3>
                        <p class="text-xs text-slate-400 mt-2 leading-relaxed">Sikeresen átvizsgálta a helyiséget és kiértékelte az elméleti eseteket.</p>
                    </div>

                    <div class="grid grid-cols-2 gap-3 bg-slate-950 p-4 border border-slate-850 rounded-xl font-mono text-xs shadow-inner">
                        <div class="text-left border-r border-slate-850 pr-2">
                            <p class="text-slate-500 uppercase text-[9px] font-bold tracking-wider">Teszt Eredmény</p>
                            <p class="text-base font-bold ${isPerfect ? 'text-amber-400' : 'text-slate-200'} mt-0.5">${scoreString}</p>
                        </div>
                        <div class="text-left pl-2">
                            <p class="text-slate-500 uppercase text-[9px] font-bold tracking-wider">Jutalom</p>
                            <p class="text-base font-bold text-amber-400 mt-0.5">+${xpAwarded} XP</p>
                        </div>
                    </div>

                    <div class="pt-4">
                        <button onclick="Navigation.showScreen('screen-map')" class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold rounded-xl cursor-pointer transition-all shadow-lg shadow-cyan-500/20 focus:outline-none">Vissza a Kapitányságra</button>
                    </div>
                </div>
            `;
        }

        // Celebrate toast
        if (isPerfect) {
            window.Gamification.showToast("Kiváló Teljesítmény!", `Tökéletes audit (+${xpAwarded} XP) a(z) ${mData.category} modulban!`, 'xp');
            window.Gamification.launchConfetti(); // Spawn confetti for perfect score!
        } else {
            window.Gamification.showToast("Sikeres Teljesítés!", `+${xpAwarded} XP megszerezve a(z) ${mData.category} helyiségben.`, 'success');
        }
    }

    // ==============================================
    // INSTRUCTOR DASHBOARD UI POPULATING
    // ==============================================
    let cachedProfiles = [];
    let cachedResults = [];
    let selectedStudentId = null;

    async function refreshTeacherPanelUI() {
        const selectorContainer = document.getElementById('teacher-student-selector-container');
        const studentSelect = document.getElementById('teacher-student-select');

        // Check if Supabase is active and configured
        if (window.SupabaseConnection && window.SupabaseConnection.isConfigured()) {
            if (selectorContainer) selectorContainer.classList.remove('hidden');

            try {
                // Fetch profiles from Supabase
                const { data: profiles, error: profilesError } = await window.SupabaseConnection.client
                    .from('profiles')
                    .select('*')
                    .order('xp', { ascending: false });

                if (profilesError) {
                    console.error("Hiba a profilok lekérésekor:", profilesError);
                    fallbackToLocalTeacherUI();
                    return;
                }

                cachedProfiles = profiles || [];

                // Fetch results
                const { data: results, error: resultsError } = await window.SupabaseConnection.client
                    .from('results')
                    .select('*');

                cachedResults = results || [];

                if (cachedProfiles.length > 0) {
                    // Populate select dropdown
                    if (studentSelect) {
                        studentSelect.innerHTML = cachedProfiles.map(p => `
                            <option value="${p.id}" ${selectedStudentId === p.id ? 'selected' : ''}>
                                [${p.xp || 0} XP] ${p.full_name} (${p.rank || 'Őrmester'})
                            </option>
                        `).join('');

                        // Set default selection to first user if none selected
                        if (!selectedStudentId || !cachedProfiles.find(p => p.id === selectedStudentId)) {
                            selectedStudentId = cachedProfiles[0].id;
                            studentSelect.value = selectedStudentId;
                        }
                    }

                    renderSelectedStudentUI();
                } else {
                    fallbackToLocalTeacherUI();
                }
            } catch (err) {
                console.error("Hiba az oktatói panel felhőbetöltése közben:", err);
                fallbackToLocalTeacherUI();
            }
        } else {
            if (selectorContainer) selectorContainer.classList.add('hidden');
            fallbackToLocalTeacherUI();
        }
    }

    function selectTeacherStudent(studentId) {
        selectedStudentId = studentId;
        renderSelectedStudentUI();
    }

    function renderSelectedStudentUI() {
        const profile = cachedProfiles.find(p => p.id === selectedStudentId);
        if (!profile) return;

        // Get student's results
        const studentResults = cachedResults.filter(r => r.user_id === selectedStudentId);

        // 1. Update text elements
        const nameEl = document.getElementById('teacher-student-name');
        const detailsEl = document.getElementById('teacher-student-details');
        const xpEl = document.getElementById('teacher-student-xp');
        const badgeEl = document.getElementById('teacher-student-badge');
        const pathEl = document.getElementById('teacher-student-path');
        const progressEl = document.getElementById('teacher-student-progress-text');

        if (nameEl) nameEl.innerText = profile.full_name || 'Névtelen Kadét';
        if (detailsEl) detailsEl.innerText = `${profile.rank || 'Rendfokozat nélkül'} • ${profile.unit || 'Kapitányság'}`;
        if (xpEl) xpEl.innerText = `${profile.xp || 0} XP`;
        if (badgeEl) badgeEl.innerText = profile.badge || 'Újonc';
        
        const count = studentResults.length;
        if (pathEl) pathEl.innerText = `Képzési út: ${profile.path || 'Kezdő'}`;
        if (progressEl) progressEl.innerText = `Befejezett modulok: ${count} / 5`;

        // 2. Populate Detailed Module Table rows
        const tableBody = document.getElementById('teacher-progress-table-body');
        if (tableBody) {
            tableBody.innerHTML = '';
            
            const modulesList = [1, 2, 3, 4, 5];
            modulesList.forEach(id => {
                const mData = window.QuizData.modules[id];
                const comDetails = studentResults.find(r => r.module_id === id.toString() || r.module_id === id);
                const tr = document.createElement('tr');
                tr.className = "border-b border-slate-900 hover:bg-slate-950/30 transition-colors";

                if (comDetails) {
                    const isPerfect = (comDetails.score === comDetails.total);
                    const formattedDate = comDetails.completed_at ? comDetails.completed_at.slice(0, 16).replace('T', ' ') : '';
                    tr.innerHTML = `
                        <td class="p-3">
                            <span class="font-bold text-slate-200">${mData.category}</span> - ${mData.title}
                        </td>
                        <td class="p-3 ${isPerfect ? 'text-amber-400' : 'text-emerald-400'} font-bold font-mono">${isPerfect ? '100% (KIVÁLÓ)' : 'TELJESÍTVE'}</td>
                        <td class="p-3 text-right text-amber-400 font-mono">+${comDetails.xp_awarded} XP</td>
                        <td class="p-3 text-right font-mono">${comDetails.score} / ${comDetails.total}</td>
                        <td class="p-3 text-right text-slate-500 font-mono">${formattedDate}</td>
                    `;
                } else {
                    const isUnlocked = isModuleUnlockedForStudent(id, studentResults);
                    tr.innerHTML = `
                        <td class="p-3 text-slate-500">
                            <span class="font-bold">${mData.category}</span> - ${mData.title}
                        </td>
                        <td class="p-3 text-slate-600 font-mono">${isUnlocked ? 'FOLYAMATBAN' : 'SZÜRKE (ZÁRT)'}</td>
                        <td class="p-3 text-right text-slate-600 font-mono">-</td>
                        <td class="p-3 text-right text-slate-600 font-mono">-</td>
                        <td class="p-3 text-right text-slate-600 font-mono">-</td>
                    `;
                }
                tableBody.appendChild(tr);
            });
        }

        // 3. Populate Weaknesses list
        const weakList = document.getElementById('teacher-weaknesses-list');
        if (weakList) {
            weakList.innerHTML = '';
            const weaknesses = profile.weaknesses || [];
            
            if (weaknesses.length === 0) {
                weakList.innerHTML = `<p class="text-emerald-400 italic font-medium">Nincsenek tévesztett kérdések! Kitűnő elméleti felkészültség.</p>`;
            } else {
                weaknesses.forEach(text => {
                    const item = document.createElement('div');
                    item.className = "p-2 bg-red-950/15 border border-red-950/40 rounded-lg flex items-start space-x-2 text-slate-300";
                    item.innerHTML = `
                        <span class="text-red-500 font-bold mt-0.5">⚠️</span>
                        <span class="text-slate-300 leading-normal">${text}</span>
                    `;
                    weakList.appendChild(item);
                });
            }
        }
    }

    function isModuleUnlockedForStudent(moduleId, studentResults) {
        if (moduleId === 1) return true;
        const prevId = moduleId - 1;
        return !!studentResults.find(r => r.module_id === prevId.toString() || r.module_id === prevId);
    }

    function fallbackToLocalTeacherUI() {
        const state = window.Progress.load();
        
        const nameEl = document.getElementById('teacher-student-name');
        const detailsEl = document.getElementById('teacher-student-details');
        const xpEl = document.getElementById('teacher-student-xp');
        const badgeEl = document.getElementById('teacher-student-badge');
        const pathEl = document.getElementById('teacher-student-path');
        const progressEl = document.getElementById('teacher-student-progress-text');

        if (state.user) {
            if (nameEl) nameEl.innerText = state.user.name;
            if (detailsEl) detailsEl.innerText = `${state.user.rank} • ${state.user.unit}`;
            if (xpEl) xpEl.innerText = `${state.user.xp} XP`;
            if (badgeEl) badgeEl.innerText = state.user.badge;
            
            const count = Object.keys(state.completedModules).length;
            if (pathEl) pathEl.innerText = `Képzési út: ${state.user.path}`;
            if (progressEl) progressEl.innerText = `Befejezett modulok: ${count} / 5`;
        }

        const tableBody = document.getElementById('teacher-progress-table-body');
        if (tableBody) {
            tableBody.innerHTML = '';
            
            const modulesList = [1, 2, 3, 4, 5];
            modulesList.forEach(id => {
                const mData = window.QuizData.modules[id];
                const comDetails = state.completedModules[id];
                const tr = document.createElement('tr');
                tr.className = "border-b border-slate-900 hover:bg-slate-950/30 transition-colors";

                if (comDetails) {
                    const isPerfect = (comDetails.score === comDetails.total);
                    tr.innerHTML = `
                        <td class="p-3">
                            <span class="font-bold text-slate-200">${mData.category}</span> - ${mData.title}
                        </td>
                        <td class="p-3 ${isPerfect ? 'text-amber-400' : 'text-emerald-400'} font-bold font-mono">${isPerfect ? '100% (KIVÁLÓ)' : 'TELJESÍTVE'}</td>
                        <td class="p-3 text-right text-amber-400 font-mono">+${comDetails.xp} XP</td>
                        <td class="p-3 text-right font-mono">${comDetails.score} / ${comDetails.total}</td>
                        <td class="p-3 text-right text-slate-500 font-mono">${comDetails.date}</td>
                    `;
                } else {
                    const isUnlocked = isModuleUnlocked(id);
                    tr.innerHTML = `
                        <td class="p-3 text-slate-500">
                            <span class="font-bold">${mData.category}</span> - ${mData.title}
                        </td>
                        <td class="p-3 text-slate-600 font-mono">${isUnlocked ? 'FOLYAMATBAN' : 'SZÜRKE (ZÁRT)'}</td>
                        <td class="p-3 text-right text-slate-600 font-mono">-</td>
                        <td class="p-3 text-right text-slate-600 font-mono">-</td>
                        <td class="p-3 text-right text-slate-600 font-mono">-</td>
                    `;
                }
                tableBody.appendChild(tr);
            });
        }

        const weakList = document.getElementById('teacher-weaknesses-list');
        if (weakList) {
            weakList.innerHTML = '';
            const weaknesses = state.weaknesses || [];
            
            if (weaknesses.length === 0) {
                weakList.innerHTML = `<p class="text-emerald-400 italic font-medium">Nincsenek tévesztett kérdések! Kitűnő elméleti felkészültség.</p>`;
            } else {
                weaknesses.forEach(text => {
                    const item = document.createElement('div');
                    item.className = "p-2 bg-red-950/15 border border-red-950/40 rounded-lg flex items-start space-x-2 text-slate-300";
                    item.innerHTML = `
                        <span class="text-red-500 font-bold mt-0.5">⚠️</span>
                        <span class="text-slate-300 leading-normal">${text}</span>
                    `;
                    weakList.appendChild(item);
                });
            }
        }
    }

    return {
        showScreen: showScreen,
        goToHome: goToHome,
        enterModule: enterModule,
        startModuleQuiz: startModuleQuiz,
        selectModuleAnswer: selectModuleAnswer,
        isModuleUnlocked: isModuleUnlocked,
        selectTeacherStudent: selectTeacherStudent
    };
})();
