/* =========================================================
   TERRAFIT — SETTINGS SYSTEM
   Features:
   1. Light / Dark Mode HUD Switcher with LocalStorage Sync
   2. Operator Profile Management & Live Stats
   3. Operator Email & Account Status
   4. Integrated Login & Logout Controls
   5. Dynamic Auto-shuffling Tactical Safety Messages
   6. About TERRAFIT & "MOVE • CLAIM • COMPETE" Motto
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       DOM ELEMENTS
       ===================================================== */

    const settingsPage = document.getElementById("settings-section");
    const themeDarkBtn = document.getElementById("themeDarkBtn");
    const themeLightBtn = document.getElementById("themeLightBtn");
    const themeStatusPill = document.getElementById("themeStatusPill");

    const settingsName = document.getElementById("settingsName");
    const settingsEmail = document.getElementById("settingsEmail");
    const settingsAvatarLetter = document.getElementById("settingsAvatarLetter");
    const settingsAuthBadge = document.getElementById("settingsAuthBadge");
    const settingsRoleTag = document.getElementById("settingsRoleTag");

    const settingsTerritoryStat = document.getElementById("settingsTerritoryStat");
    const settingsXpStat = document.getElementById("settingsXpStat");
    const settingsDistanceStat = document.getElementById("settingsDistanceStat");

    const settingsAuthDesc = document.getElementById("settingsAuthDesc");
    const settingsLoginBtn = document.getElementById("settingsLoginBtn");
    const settingsLogoutBtn = document.getElementById("settingsLogoutBtn");

    const settingsBackBtn = document.getElementById("settingsBackBtn");
    const heroSettingsBtn = document.getElementById("heroSettingsBtn");
    const navSettingsDesktop = document.getElementById("navSettingsDesktop");
    const mobNavSettings = document.getElementById("mobNavSettings");

    // Safety Carousel Elements
    const safetyShuffleBox = document.getElementById("safetyShuffleBox");
    const safetyShuffleIcon = document.getElementById("safetyShuffleIcon");
    const safetyShuffleTitle = document.getElementById("safetyShuffleTitle");
    const safetyShuffleBody = document.getElementById("safetyShuffleBody");
    const safetyCounter = document.getElementById("safetyCounter");
    const safetyTimerFill = document.getElementById("safetyTimerFill");
    const safetyDotsRow = document.getElementById("safetyDotsRow");
    const safetyShuffleBtn = document.getElementById("safetyShuffleBtn");
    const safetyPrevBtn = document.getElementById("safetyPrevBtn");
    const safetyNextBtn = document.getElementById("safetyNextBtn");


    /* =====================================================
       1. THEME SWITCHER (LIGHT / DARK)
       ===================================================== */

    function applyTheme(theme) {
        const selectedTheme = theme === "light" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", selectedTheme);
        if (document.body) {
            document.body.setAttribute("data-theme", selectedTheme);
        }

        try {
            localStorage.setItem("terrafit-theme", selectedTheme);
        } catch (e) {
            console.warn("TERRAFIT: Could not save theme to localStorage", e);
        }

        updateThemeUI(selectedTheme);
    }

    function updateThemeUI(theme) {
        if (themeDarkBtn) {
            themeDarkBtn.classList.toggle("active", theme === "dark");
        }

        if (themeLightBtn) {
            themeLightBtn.classList.toggle("active", theme === "light");
        }

        if (themeStatusPill) {
            themeStatusPill.textContent = theme === "light" ? "ACTIVE: LIGHT HUD" : "ACTIVE: DARK HUD";
        }
    }

    function loadSavedTheme() {
        let savedTheme = "dark";
        try {
            savedTheme = localStorage.getItem("terrafit-theme") || "dark";
        } catch (e) {
            savedTheme = "dark";
        }
        applyTheme(savedTheme);
    }


    /* =====================================================
       2. & 3. OPERATOR PROFILE & EMAIL
       ===================================================== */

    function updateSettingsProfile() {
        const globalPlayerName = document.getElementById("playerName");
        const profilePlayerName = document.getElementById("profilePlayerName");
        const profileEmail = document.getElementById("profileEmail");
        const globalTerritoryCount = document.getElementById("territoryCount");
        const globalXpCount = document.getElementById("xpCount");
        const globalDistance = document.getElementById("distance");

        const isUserLoggedIn = typeof currentUser !== "undefined" && currentUser !== null;

        // Operator Name
        let currentName = "GUEST OPERATOR";
        if (isUserLoggedIn) {
            currentName = currentUser.user_metadata?.full_name ||
                          currentUser.user_metadata?.name ||
                          currentUser.email?.split("@")[0]?.toUpperCase() ||
                          "OPERATOR";
        } else if (profilePlayerName && profilePlayerName.textContent.trim() && profilePlayerName.textContent.trim() !== "PLAYER") {
            currentName = profilePlayerName.textContent.trim();
        } else if (globalPlayerName && globalPlayerName.textContent.trim() && globalPlayerName.textContent.trim() !== "PLAYER.") {
            currentName = globalPlayerName.textContent.trim().replace(/\.$/, "");
        }

        if (settingsName) {
            settingsName.textContent = currentName;
        }

        // Avatar Letter
        if (settingsAvatarLetter) {
            const letter = currentName.charAt(0).toUpperCase() || "P";
            settingsAvatarLetter.textContent = letter;
        }

        // Operator Email
        if (settingsEmail) {
            if (isUserLoggedIn && currentUser.email) {
                settingsEmail.textContent = currentUser.email;
            } else if (profileEmail && profileEmail.textContent.trim() && !profileEmail.textContent.includes("---")) {
                settingsEmail.textContent = profileEmail.textContent.trim();
            } else {
                settingsEmail.textContent = "Not logged in (Guest Session)";
            }
        }

        // Auth Badge & Role Tag
        if (settingsAuthBadge) {
            if (isUserLoggedIn) {
                settingsAuthBadge.textContent = "ONLINE // SYNCHRONIZED";
                settingsAuthBadge.className = "settings-badge online";
            } else {
                settingsAuthBadge.textContent = "GUEST OPERATOR";
                settingsAuthBadge.className = "settings-badge guest";
            }
        }

        if (settingsRoleTag) {
            settingsRoleTag.textContent = isUserLoggedIn ? "TACTICAL OPERATOR" : "SCOUT";
        }

        // Stats Synchronization
        if (settingsTerritoryStat) {
            const count = globalTerritoryCount ? globalTerritoryCount.textContent.trim() : "0";
            settingsTerritoryStat.textContent = count;
        }

        if (settingsXpStat) {
            const xp = globalXpCount ? globalXpCount.textContent.trim() : "0";
            settingsXpStat.textContent = xp.includes("XP") ? xp : `${xp} XP`;
        }

        if (settingsDistanceStat) {
            const dist = globalDistance ? globalDistance.textContent.trim() : "0.00";
            settingsDistanceStat.textContent = dist.includes("KM") ? dist : `${dist} KM`;
        }

        // 4. Update Auth Buttons
        updateAuthButtons(isUserLoggedIn);
    }


    /* =====================================================
       4. LOGIN & LOGOUT CONTROLS
       ===================================================== */

    function updateAuthButtons(isLoggedIn) {
        if (settingsLoginBtn) {
            settingsLoginBtn.style.display = isLoggedIn ? "none" : "flex";
        }

        if (settingsLogoutBtn) {
            settingsLogoutBtn.style.display = isLoggedIn ? "flex" : "none";
        }

        if (settingsAuthDesc) {
            if (isLoggedIn) {
                const email = currentUser?.email || "active operator";
                settingsAuthDesc.textContent = `Connected as ${email}. Your GPS sectors, streaks and statistics are synchronizing in real time.`;
            } else {
                settingsAuthDesc.textContent = "Log in with your TERRAFIT credentials to synchronize GPS territories, climb global leaderboards, and save workout history.";
            }
        }
    }

    function handleSettingsLogin() {
        const authOverlay = document.getElementById("authOverlay");
        if (authOverlay) {
            authOverlay.classList.add("active");
        }

        if (typeof switchAuthMode === "function") {
            switchAuthMode("login");
        }
    }

    function handleSettingsLogout() {
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.click();
        } else if (typeof logoutUser === "function") {
            logoutUser();
        }
        setTimeout(updateSettingsProfile, 200);
    }


    /* =====================================================
       5. DYNAMIC ROTATING / SHUFFLING SAFETY MESSAGES
       ===================================================== */

    const safetyMessages = [
        {
            icon: "🛡️",
            tag: "SURROUNDINGS // PROTOCOL 01",
            title: "STAY AWARE OF YOUR SURROUNDINGS",
            body: "Avoid wearing noise-canceling headphones when moving near traffic, construction zones, or unfamiliar night paths. Maintain 360° situational awareness at all times."
        },
        {
            icon: "🚦",
            tag: "ROAD SAFETY // PROTOCOL 02",
            title: "TRAFFIC RULES ALWAYS TAKE PRIORITY",
            body: "Real-world road safety and traffic signals supersede virtual territory conquest. Never cross against lights or enter restricted zones to capture sectors."
        },
        {
            icon: "💧",
            tag: "ENDURANCE // PROTOCOL 03",
            title: "HYDRATION & RECOVERY PROTOCOL",
            body: "Carry hydration on runs and cycling routes exceeding 3 kilometers. Pre-hydrate before sessions and replenish electrolytes in warm weather."
        },
        {
            icon: "🌙",
            tag: "STEALTH OPS // PROTOCOL 04",
            title: "HIGH-VISIBILITY NIGHT APPAREL",
            body: "Equip reflective running apparel, clip-on strobe lights, or headlamps during dusk and dawn workouts so motorists spot you from 150+ meters away."
        },
        {
            icon: "⚡",
            tag: "PACING // PROTOCOL 05",
            title: "AVOID OVEREXERTION & HEAT INJURY",
            body: "Pace your intervals. Tactical territory conquest is built on sustainable consistency. Discontinue workouts immediately if dizziness or chest pain occurs."
        },
        {
            icon: "📍",
            tag: "PRIVACY // PROTOCOL 06",
            title: "LOCATION PRIVACY GUARANTEE",
            body: "TERRAFIT accesses GPS telemetry exclusively during recorded workouts. Your live coordinates are encrypted and never broadcast to unverified third parties."
        },
        {
            icon: "🚨",
            tag: "EMERGENCY // PROTOCOL 07",
            title: "EMERGENCY READINESS & ROUTE SHARING",
            body: "Always carry a phone with at least 20% battery. Share live GPS location with trusted contacts when embarking on remote trail or off-road runs."
        }
    ];

    let currentSafetyIndex = 0;
    let safetyShuffleTimer = null;
    const SHUFFLE_INTERVAL_MS = 5000;

    function renderSafetyMessage(index, animate = true) {
        if (!safetyMessages || safetyMessages.length === 0) return;

        currentSafetyIndex = (index + safetyMessages.length) % safetyMessages.length;
        const msg = safetyMessages[currentSafetyIndex];

        if (animate && safetyShuffleBox) {
            safetyShuffleBox.classList.add("fade-switch");
            setTimeout(() => {
                applySafetyDOM(msg);
                safetyShuffleBox.classList.remove("fade-switch");
            }, 180);
        } else {
            applySafetyDOM(msg);
        }

        updateSafetyDots();
        resetSafetyTimerBar();
    }

    function applySafetyDOM(msg) {
        if (safetyShuffleIcon) safetyShuffleIcon.textContent = msg.icon;
        if (safetyShuffleTitle) safetyShuffleTitle.textContent = msg.title;
        if (safetyShuffleBody) safetyShuffleBody.textContent = msg.body;

        const tagEl = safetyShuffleBox?.querySelector(".safety-protocol-tag");
        if (tagEl) tagEl.textContent = msg.tag;

        if (safetyCounter) {
            const currentNum = String(currentSafetyIndex + 1).padStart(2, "0");
            const totalNum = String(safetyMessages.length).padStart(2, "0");
            safetyCounter.textContent = `TIP ${currentNum} / ${totalNum}`;
        }
    }

    function setupSafetyDots() {
        if (!safetyDotsRow) return;
        safetyDotsRow.innerHTML = "";

        safetyMessages.forEach((_, idx) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "safety-dot" + (idx === currentSafetyIndex ? " active" : "");
            dot.setAttribute("aria-label", `Jump to Safety Tip ${idx + 1}`);
            dot.addEventListener("click", () => {
                renderSafetyMessage(idx, true);
                restartSafetyTimer();
            });
            safetyDotsRow.appendChild(dot);
        });
    }

    function updateSafetyDots() {
        if (!safetyDotsRow) return;
        const dots = safetyDotsRow.querySelectorAll(".safety-dot");
        dots.forEach((dot, idx) => {
            dot.classList.toggle("active", idx === currentSafetyIndex);
        });
    }

    function resetSafetyTimerBar() {
        if (!safetyTimerFill) return;
        safetyTimerFill.style.transition = "none";
        safetyTimerFill.style.width = "0%";
        void safetyTimerFill.offsetWidth; // Force reflow
        safetyTimerFill.style.transition = `width ${SHUFFLE_INTERVAL_MS}ms linear`;
        safetyTimerFill.style.width = "100%";
    }

    function shuffleSafetyMessage() {
        let nextIdx;
        do {
            nextIdx = Math.floor(Math.random() * safetyMessages.length);
        } while (safetyMessages.length > 1 && nextIdx === currentSafetyIndex);

        renderSafetyMessage(nextIdx, true);
        restartSafetyTimer();
    }

    function nextSafetyMessage() {
        renderSafetyMessage(currentSafetyIndex + 1, true);
        restartSafetyTimer();
    }

    function prevSafetyMessage() {
        renderSafetyMessage(currentSafetyIndex - 1, true);
        restartSafetyTimer();
    }

    function startSafetyTimer() {
        stopSafetyTimer();
        resetSafetyTimerBar();
        safetyShuffleTimer = setInterval(() => {
            renderSafetyMessage(currentSafetyIndex + 1, true);
        }, SHUFFLE_INTERVAL_MS);
    }

    function stopSafetyTimer() {
        if (safetyShuffleTimer) {
            clearInterval(safetyShuffleTimer);
            safetyShuffleTimer = null;
        }
    }

    function restartSafetyTimer() {
        stopSafetyTimer();
        startSafetyTimer();
    }


    /* =====================================================
       NAVIGATION & VIEW SWITCHING
       ===================================================== */

    function openSettings() {
        const landingPage = document.getElementById("landingPage");
        const dashboard = document.getElementById("dashboard");
        const howSection = document.getElementById("how");

        if (landingPage) landingPage.style.display = "none";
        if (dashboard) dashboard.style.display = "none";
        if (howSection) howSection.style.display = "none";

        if (settingsPage) {
            settingsPage.style.display = "block";
        }

        // Close mobile drawer if open
        const mobileNavDrawer = document.getElementById("mobileNavDrawer");
        const mobileMenuToggle = document.getElementById("mobileMenuToggle");
        if (mobileNavDrawer) mobileNavDrawer.classList.remove("active");
        if (mobileMenuToggle) mobileMenuToggle.classList.remove("active");

        // Update active link
        document.querySelectorAll(".nav-link").forEach(link => {
            const target = link.getAttribute("data-target") || link.getAttribute("href");
            link.classList.toggle("active", target === "#settings-section");
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        updateSettingsProfile();
        restartSafetyTimer();
    }

    function closeSettingsToHero() {
        if (typeof openLandingView === "function") {
            openLandingView();
        } else {
            const landingPage = document.getElementById("landingPage");
            const dashboard = document.getElementById("dashboard");

            if (settingsPage) settingsPage.style.display = "none";
            if (dashboard) dashboard.style.display = "none";
            if (landingPage) {
                landingPage.style.display = "grid";
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    }


    /* =====================================================
       EVENT LISTENERS
       ===================================================== */

    function setupEventListeners() {
        // Theme buttons
        if (themeDarkBtn) {
            themeDarkBtn.addEventListener("click", () => applyTheme("dark"));
        }
        if (themeLightBtn) {
            themeLightBtn.addEventListener("click", () => applyTheme("light"));
        }

        // Auth buttons in Settings
        if (settingsLoginBtn) {
            settingsLoginBtn.addEventListener("click", handleSettingsLogin);
        }
        if (settingsLogoutBtn) {
            settingsLogoutBtn.addEventListener("click", handleSettingsLogout);
        }

        // Navigation triggers
        if (heroSettingsBtn) {
            heroSettingsBtn.addEventListener("click", openSettings);
        }
        if (navSettingsDesktop) {
            navSettingsDesktop.addEventListener("click", (e) => {
                e.preventDefault();
                openSettings();
            });
        }
        if (mobNavSettings) {
            mobNavSettings.addEventListener("click", (e) => {
                e.preventDefault();
                openSettings();
            });
        }
        if (settingsBackBtn) {
            settingsBackBtn.addEventListener("click", closeSettingsToHero);
        }

        // Safety message controls
        if (safetyShuffleBtn) {
            safetyShuffleBtn.addEventListener("click", shuffleSafetyMessage);
        }
        if (safetyNextBtn) {
            safetyNextBtn.addEventListener("click", nextSafetyMessage);
        }
        if (safetyPrevBtn) {
            safetyPrevBtn.addEventListener("click", prevSafetyMessage);
        }

        // Pause safety rotation on hover
        if (safetyShuffleBox) {
            safetyShuffleBox.addEventListener("mouseenter", stopSafetyTimer);
            safetyShuffleBox.addEventListener("mouseleave", startSafetyTimer);
        }
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.TerraFitSettings = {
        openSettings,
        closeSettingsToHero,
        applyTheme,
        updateSettingsProfile,
        loadSavedTheme,
        shuffleSafetyMessage,
        nextSafetyMessage,
        prevSafetyMessage
    };


    /* =====================================================
       INITIALIZE ON LOAD
       ===================================================== */

    document.addEventListener("DOMContentLoaded", () => {
        loadSavedTheme();
        setupSafetyDots();
        renderSafetyMessage(0, false);
        startSafetyTimer();
        setupEventListeners();
        updateSettingsProfile();
    });

})();