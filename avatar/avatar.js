/* =========================================================
   TERRAFIT — AVATAR SYSTEM ENGINE
   File: avatar/avatar.js
   Theme: Blue & White Tactical Protocol
   Features:
     - 8 Vector Tactical Operative Presets
     - Monogram Generator with 8 Color Themes
     - Local Custom File Upload with Canvas Compression
     - 5 Tactical Frame Variants
     - Real-Time 3D Live Preview & Cross-App Sync
     - Persistent LocalStorage Storage
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       CONSTANTS & CONFIG
       ===================================================== */

    const STORAGE_KEY = "terrafit_avatar_config";

    // 8 Tactical Operative Presets (Clean Cyber / Tactical SVGs)
    const PRESETS = [
        {
            id: "cyber-runner",
            name: "Cyber Runner",
            svg: `<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"/>
            </svg>`
        },
        {
            id: "ghost-recon",
            name: "Ghost Recon",
            svg: `<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 3.7 2.01 6.94 5 8.65V22h10v-1.35c2.99-1.71 5-4.95 5-8.65 0-5.52-4.48-10-10-10zm-3 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-3-8c-2.76 0-5 1.79-5 4h10c0-2.21-2.24-4-5-4z"/>
            </svg>`
        },
        {
            id: "titan-vanguard",
            name: "Titan Vanguard",
            svg: `<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l6 2.7v4.3c0 3.8-2.6 7.4-6 8.5-3.4-1.1-6-4.7-6-8.5V7.7L12 5zm-1 4v3H8v2h3v3h2v-3h3v-2h-3V9h-2z"/>
            </svg>`
        },
        {
            id: "apex-sprinter",
            name: "Apex Sprinter",
            svg: `<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2v11h3v9l7-12h-4l3-8H7z"/>
            </svg>`
        },
        {
            id: "valkyrie",
            name: "Valkyrie",
            svg: `<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 7v5c0 5.2 3.4 10.1 8 11.5 4.6-1.4 8-6.3 8-11.5V7l-8-5zm0 3.2l5 3.1v3.7c0 3.6-2.2 7-5 8.2-2.8-1.2-5-4.6-5-8.2V8.3l5-3.1zm0 2.8l-3 3 3 5 3-5-3-3z"/>
            </svg>`
        },
        {
            id: "shadow-phantom",
            name: "Shadow Phantom",
            svg: `<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 2.6 1 5 2.7 6.8L3 22l4.2-1.3C8.6 21.5 10.3 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm-4 8c.8 0 1.5.7 1.5 1.5S8.8 13 8 13s-1.5-.7-1.5-1.5S7.2 10 8 10zm8 0c.8 0 1.5.7 1.5 1.5S16.8 13 16 13s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5zm-4 7c-2.5 0-4-1.5-4-1.5l1.4-1.4s1 1 2.6 1c1.6 0 2.6-1 2.6-1L16 15.5s-1.5 1.5-4 1.5z"/>
            </svg>`
        },
        {
            id: "solar-falcon",
            name: "Solar Falcon",
            svg: `<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 3 10-3-10-5zm0 6.5L4.5 9.8 12 12l7.5-2.2L12 8.5zm0 5L3 11v6l9 5 9-5v-6l-9 2.5zm0 4.2L6.8 16 12 18.8 17.2 16 12 17.7z"/>
            </svg>`
        },
        {
            id: "pulse-stryker",
            name: "Pulse Stryker",
            svg: `<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h4l2.5-6 4 12 3-8H21v-2h-6l-2.5 6.5-3.5-10.5-3.5 8H3v2z"/>
            </svg>`
        }
    ];

    // Monogram Accent Color Palettes
    const COLOR_SWATCHES = [
        { id: "blue", name: "Electric Blue", hex: "#0066ff", bg: "linear-gradient(135deg, #0066ff, #004ecc)", text: "#ffffff" },
        { id: "cyan", name: "Cyan Cyber", hex: "#00c4ff", bg: "linear-gradient(135deg, #00c4ff, #0077b6)", text: "#0f172a" },
        { id: "indigo", name: "Deep Indigo", hex: "#4338ca", bg: "linear-gradient(135deg, #4338ca, #312e81)", text: "#ffffff" },
        { id: "midnight", name: "Midnight", hex: "#1e293b", bg: "linear-gradient(135deg, #1e293b, #0f172a)", text: "#ffffff" },
        { id: "royal", name: "Royal Azure", hex: "#2563eb", bg: "linear-gradient(135deg, #2563eb, #1d4ed8)", text: "#ffffff" },
        { id: "teal", name: "Teal Matrix", hex: "#0d9488", bg: "linear-gradient(135deg, #0d9488, #115e59)", text: "#ffffff" },
        { id: "violet", name: "Violet Pulse", hex: "#7c3aed", bg: "linear-gradient(135deg, #7c3aed, #5b21b6)", text: "#ffffff" },
        { id: "titanium", name: "Titanium", hex: "#64748b", bg: "linear-gradient(135deg, #64748b, #475569)", text: "#ffffff" }
    ];

    const FRAMES = [
        { id: "standard", name: "Standard" },
        { id: "titanium", name: "Titanium" },
        { id: "pulse", name: "Neon Pulse" },
        { id: "cyber", name: "Cyber Grid" },
        { id: "gold", name: "Apex Gold" }
    ];

    const DEFAULT_CONFIG = {
        type: "preset",           // "preset" | "monogram" | "upload"
        presetId: "cyber-runner",
        monogramText: "",         // Empty means fallback to username initial
        monogramColor: "blue",
        uploadData: null,         // Base64 compressed image string
        uploadName: "",
        frame: "standard"
    };

    /* =====================================================
       STATE MANAGEMENT
       ===================================================== */

    let currentConfig = loadSavedConfig();
    let draftConfig = { ...currentConfig };
    let isUpdatingDOM = false;

    function loadSavedConfig() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return { ...DEFAULT_CONFIG, ...parsed };
            }
        } catch (e) {
            console.warn("TERRAFIT: Could not load avatar config from localStorage", e);
        }
        return { ...DEFAULT_CONFIG };
    }

    function saveConfig(config) {
        try {
            currentConfig = { ...config };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
        } catch (e) {
            console.error("TERRAFIT: Error saving avatar config", e);
        }
    }

    /* =====================================================
       NAME HELPER
       ===================================================== */

    function getPlayerName() {
        const candidates = [
            document.getElementById("profilePlayerName"),
            document.getElementById("leaderboardPlayerName"),
            document.getElementById("playerName")
        ];

        for (const el of candidates) {
            if (!el) continue;
            const text = el.textContent.trim();
            if (text && text !== "PLAYER" && text !== "PLAYER." && text !== "Operator" && text !== "—") {
                return text;
            }
        }
        return "PLAYER";
    }

    function getFallbackInitial() {
        const name = getPlayerName();
        return (name && name.charAt(0)) ? name.charAt(0).toUpperCase() : "P";
    }

    /* =====================================================
       AVATAR RENDERING ENGINE
       ===================================================== */

    function renderAvatar(containerElement, config) {
        if (!containerElement) return;

        isUpdatingDOM = true;

        try {
            // Reset base styles
            containerElement.classList.remove("has-image");
            containerElement.style.background = "";
            containerElement.style.color = "";
            containerElement.innerHTML = "";

            if (config.type === "upload" && config.uploadData) {
                // RENDER CUSTOM UPLOAD
                containerElement.classList.add("has-image");
                const img = document.createElement("img");
                img.src = config.uploadData;
                img.alt = "Operator Emblem";
                img.setAttribute("loading", "eager");
                containerElement.appendChild(img);
            } else if (config.type === "monogram") {
                // RENDER MONOGRAM
                const swatch = COLOR_SWATCHES.find(s => s.id === config.monogramColor) || COLOR_SWATCHES[0];
                containerElement.style.background = swatch.bg;
                containerElement.style.color = swatch.text;

                const textSpan = document.createElement("span");
                textSpan.className = "tf-avatar-letter";
                const displayLetters = (config.monogramText && config.monogramText.trim()) 
                    ? config.monogramText.trim().substring(0, 2).toUpperCase()
                    : getFallbackInitial();
                textSpan.textContent = displayLetters;
                containerElement.appendChild(textSpan);
            } else {
                // RENDER PRESET VECTOR
                const preset = PRESETS.find(p => p.id === config.presetId) || PRESETS[0];
                containerElement.innerHTML = preset.svg;
            }
        } finally {
            // Release flag on next tick
            setTimeout(() => {
                isUpdatingDOM = false;
            }, 10);
        }
    }

    function applyFrameToContainer(frameContainer, frameId) {
        if (!frameContainer) return;

        FRAMES.forEach(f => {
            frameContainer.classList.remove(`frame-${f.id}`);
        });

        const activeFrame = frameId || "standard";
        frameContainer.classList.add(`frame-${activeFrame}`);
    }

    /* =====================================================
       GLOBAL AVATAR SYNC
       ===================================================== */

    function syncAllAvatars() {
        // 1. Profile Avatar
        const profileAvatarEl = document.getElementById("profileAvatarLetter");
        const profileTriggerEl = document.getElementById("profileAvatarTrigger");

        if (profileAvatarEl) {
            renderAvatar(profileAvatarEl, currentConfig);
        }

        if (profileTriggerEl) {
            applyFrameToContainer(profileTriggerEl, currentConfig.frame);
        }

        // 2. Leaderboard Avatar (if present)
        const leaderboardAvatarEl = document.getElementById("leaderboardAvatarLetter");
        if (leaderboardAvatarEl) {
            renderAvatar(leaderboardAvatarEl, currentConfig);
            const parentFrame = leaderboardAvatarEl.closest(".tf-avatar-frame");
            if (parentFrame) {
                applyFrameToContainer(parentFrame, currentConfig.frame);
            }
        }
    }

    /* =====================================================
       MODAL UI INITIALIZATION & POPULATION
       ===================================================== */

    function populatePresetGrid() {
        const grid = document.getElementById("avatarPresetGrid");
        if (!grid) return;

        grid.innerHTML = "";

        PRESETS.forEach(preset => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "tf-preset-item";
            item.setAttribute("data-preset-id", preset.id);
            item.setAttribute("aria-label", preset.name);

            if (draftConfig.type === "preset" && draftConfig.presetId === preset.id) {
                item.classList.add("active");
            }

            item.innerHTML = `
                <div class="tf-preset-icon">${preset.svg}</div>
                <span class="tf-preset-name">${preset.name}</span>
            `;

            item.addEventListener("click", () => {
                draftConfig.type = "preset";
                draftConfig.presetId = preset.id;
                updateModalUI();
            });

            grid.appendChild(item);
        });
    }

    function populateColorSwatches() {
        const swatchesContainer = document.getElementById("avatarColorSwatches");
        if (!swatchesContainer) return;

        swatchesContainer.innerHTML = "";

        COLOR_SWATCHES.forEach(swatch => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "tf-color-swatch";
            btn.setAttribute("data-color-id", swatch.id);

            if (draftConfig.monogramColor === swatch.id) {
                btn.classList.add("active");
            }

            btn.innerHTML = `
                <span class="tf-swatch-circle" style="background: ${swatch.bg};"></span>
                <span class="tf-swatch-name">${swatch.name}</span>
            `;

            btn.addEventListener("click", () => {
                draftConfig.monogramColor = swatch.id;
                draftConfig.type = "monogram";
                updateModalUI();
            });

            swatchesContainer.appendChild(btn);
        });
    }

    function updateModalUI() {
        // 1. Update Preview Avatar & Frame
        const previewAvatar = document.getElementById("avatarModalPreview");
        const previewFrame = document.getElementById("avatarModalPreviewFrame");
        const previewTypeLabel = document.getElementById("avatarModalPreviewType");
        const previewFrameLabel = document.getElementById("avatarModalPreviewFrameLabel");

        if (previewAvatar) {
            renderAvatar(previewAvatar, draftConfig);
        }

        if (previewFrame) {
            applyFrameToContainer(previewFrame, draftConfig.frame);
        }

        if (previewFrameLabel) {
            const frameObj = FRAMES.find(f => f.id === draftConfig.frame) || FRAMES[0];
            previewFrameLabel.textContent = `FRAME: ${frameObj.name.toUpperCase()}`;
        }

        if (previewTypeLabel) {
            if (draftConfig.type === "preset") {
                const preset = PRESETS.find(p => p.id === draftConfig.presetId) || PRESETS[0];
                previewTypeLabel.textContent = `TACTICAL PRESET: ${preset.name.toUpperCase()}`;
            } else if (draftConfig.type === "monogram") {
                previewTypeLabel.textContent = `MONOGRAM: ${draftConfig.monogramText || getFallbackInitial()}`;
            } else if (draftConfig.type === "upload") {
                previewTypeLabel.textContent = `CUSTOM EMBLEM: ${draftConfig.uploadName || "UPLOAD"}`;
            }
        }

        // 2. Active states on presets
        document.querySelectorAll("#avatarPresetGrid .tf-preset-item").forEach(el => {
            const id = el.getAttribute("data-preset-id");
            if (draftConfig.type === "preset" && draftConfig.presetId === id) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        });

        // 3. Active states on frames
        document.querySelectorAll("#avatarFrameOptions .tf-frame-btn").forEach(el => {
            const frame = el.getAttribute("data-frame");
            if (draftConfig.frame === frame) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        });

        // 4. Active states on colors
        document.querySelectorAll("#avatarColorSwatches .tf-color-swatch").forEach(el => {
            const colorId = el.getAttribute("data-color-id");
            if (draftConfig.monogramColor === colorId) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        });

        // 5. Monogram input sync
        const monoInput = document.getElementById("avatarMonogramInput");
        if (monoInput && document.activeElement !== monoInput) {
            monoInput.value = draftConfig.monogramText || "";
        }

        // 6. Upload status
        const uploadActions = document.getElementById("avatarUploadActions");
        const uploadFileName = document.getElementById("avatarFileName");
        if (uploadActions && uploadFileName) {
            if (draftConfig.uploadData) {
                uploadActions.style.display = "flex";
                uploadFileName.textContent = draftConfig.uploadName || "custom-avatar.png";
            } else {
                uploadActions.style.display = "none";
            }
        }
    }

    /* =====================================================
       IMAGE PROCESSING & COMPRESSION (CANVAS)
       ===================================================== */

    function processImageFile(file) {
        if (!file || !file.type.startsWith("image/")) {
            alert("Please select a valid image file (PNG, JPG, SVG, WebP).");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Max dimensions 256x256 for crisp avatar display with minimal footprint
                const MAX_SIZE = 256;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

                draftConfig.type = "upload";
                draftConfig.uploadData = compressedDataUrl;
                draftConfig.uploadName = file.name;

                updateModalUI();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /* =====================================================
       MODAL OPEN & CLOSE CONTROLS
       ===================================================== */

    function openAvatarModal() {
        // Deep copy current config to draft
        draftConfig = { ...currentConfig };

        populatePresetGrid();
        populateColorSwatches();
        updateModalUI();

        // Switch to the tab matching active type
        switchTab(draftConfig.type === "monogram" ? "monogram" : (draftConfig.type === "upload" ? "upload" : "presets"));

        const modal = document.getElementById("avatarModal");
        if (modal) {
            modal.classList.add("active");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeAvatarModal() {
        const modal = document.getElementById("avatarModal");
        if (modal) {
            modal.classList.remove("active");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    function switchTab(tabId) {
        const tabs = [
            { id: "presets", tabBtn: document.getElementById("tabPresetsBtn"), panel: document.getElementById("panelPresets") },
            { id: "monogram", tabBtn: document.getElementById("tabMonogramBtn"), panel: document.getElementById("panelMonogram") },
            { id: "upload", tabBtn: document.getElementById("tabUploadBtn"), panel: document.getElementById("panelUpload") }
        ];

        tabs.forEach(t => {
            if (!t.tabBtn || !t.panel) return;
            if (t.id === tabId) {
                t.tabBtn.classList.add("active");
                t.tabBtn.setAttribute("aria-selected", "true");
                t.panel.style.display = "flex";
                t.panel.classList.add("active");
            } else {
                t.tabBtn.classList.remove("active");
                t.tabBtn.setAttribute("aria-selected", "false");
                t.panel.style.display = "none";
                t.panel.classList.remove("active");
            }
        });
    }

    /* =====================================================
       EVENT LISTENERS BINDING
       ===================================================== */

    function bindEventListeners() {
        // Triggers to open modal
        const triggers = [
            document.getElementById("profileAvatarTrigger"),
            document.getElementById("editAvatarBtn"),
            document.getElementById("openAvatarModalBtn")
        ];

        triggers.forEach(el => {
            if (el) {
                el.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openAvatarModal();
                });
            }
        });

        // Keyboard accessibility for trigger
        const profileTrigger = document.getElementById("profileAvatarTrigger");
        if (profileTrigger) {
            profileTrigger.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openAvatarModal();
                }
            });
        }

        // Close buttons
        const closeBtn = document.getElementById("closeAvatarModalBtn");
        const cancelBtn = document.getElementById("cancelAvatarBtn");
        const modal = document.getElementById("avatarModal");

        if (closeBtn) closeBtn.addEventListener("click", closeAvatarModal);
        if (cancelBtn) cancelBtn.addEventListener("click", closeAvatarModal);

        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    closeAvatarModal();
                }
            });
        }

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal && modal.classList.contains("active")) {
                closeAvatarModal();
            }
        });

        // Tab switching
        const tabPresetsBtn = document.getElementById("tabPresetsBtn");
        const tabMonogramBtn = document.getElementById("tabMonogramBtn");
        const tabUploadBtn = document.getElementById("tabUploadBtn");

        if (tabPresetsBtn) tabPresetsBtn.addEventListener("click", () => switchTab("presets"));
        if (tabMonogramBtn) tabMonogramBtn.addEventListener("click", () => switchTab("monogram"));
        if (tabUploadBtn) tabUploadBtn.addEventListener("click", () => switchTab("upload"));

        // Frame selector buttons
        document.querySelectorAll("#avatarFrameOptions .tf-frame-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const frame = btn.getAttribute("data-frame");
                draftConfig.frame = frame;
                updateModalUI();
            });
        });

        // Monogram text input
        const monoInput = document.getElementById("avatarMonogramInput");
        if (monoInput) {
            monoInput.addEventListener("input", (e) => {
                draftConfig.type = "monogram";
                draftConfig.monogramText = e.target.value.toUpperCase();
                updateModalUI();
            });
        }

        // Image upload zone
        const dropzone = document.getElementById("avatarDropzone");
        const fileInput = document.getElementById("avatarFileInput");
        const clearUploadBtn = document.getElementById("avatarClearUploadBtn");

        if (dropzone && fileInput) {
            dropzone.addEventListener("click", () => fileInput.click());

            dropzone.addEventListener("dragover", (e) => {
                e.preventDefault();
                dropzone.classList.add("dragover");
            });

            dropzone.addEventListener("dragleave", () => {
                dropzone.classList.remove("dragover");
            });

            dropzone.addEventListener("drop", (e) => {
                e.preventDefault();
                dropzone.classList.remove("dragover");
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processImageFile(e.dataTransfer.files[0]);
                }
            });

            fileInput.addEventListener("change", (e) => {
                if (e.target.files && e.target.files[0]) {
                    processImageFile(e.target.files[0]);
                }
            });
        }

        if (clearUploadBtn) {
            clearUploadBtn.addEventListener("click", () => {
                draftConfig.uploadData = null;
                draftConfig.uploadName = "";
                draftConfig.type = "preset";
                if (fileInput) fileInput.value = "";
                updateModalUI();
            });
        }

        // Reset default button
        const resetBtn = document.getElementById("resetAvatarBtn");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                draftConfig = {
                    ...DEFAULT_CONFIG,
                    monogramText: ""
                };
                updateModalUI();
            });
        }

        // Deploy / Save Avatar button
        const saveBtn = document.getElementById("saveAvatarBtn");
        if (saveBtn) {
            saveBtn.addEventListener("click", () => {
                saveConfig(draftConfig);
                syncAllAvatars();
                closeAvatarModal();

                // Optional subtle button pulse or feedback
                const trigger = document.getElementById("profileAvatarTrigger");
                if (trigger) {
                    trigger.style.transform = "scale(1.08)";
                    setTimeout(() => {
                        trigger.style.transform = "";
                    }, 250);
                }
            });
        }
    }

    /* =====================================================
       EXTERNAL MUTATION WATCHER & AUTH COEXISTENCE
       ===================================================== */

    function observeAvatarDOM() {
        const profileAvatarEl = document.getElementById("profileAvatarLetter");
        if (!profileAvatarEl) return;

        // If auth.js or other external code sets textContent directly, re-render the configured avatar
        const observer = new MutationObserver(() => {
            if (isUpdatingDOM) return;

            // If user has custom preset or image, protect it from being overridden by letter
            if (currentConfig.type !== "monogram" || currentConfig.monogramText) {
                syncAllAvatars();
            }
        });

        observer.observe(profileAvatarEl, {
            childList: true,
            characterData: true
        });

        // Watch player names to update monogram fallback if name changes
        const nameElements = [
            document.getElementById("profilePlayerName"),
            document.getElementById("leaderboardPlayerName"),
            document.getElementById("playerName")
        ].filter(Boolean);

        nameElements.forEach(el => {
            const nameObs = new MutationObserver(() => {
                if (currentConfig.type === "monogram" && !currentConfig.monogramText) {
                    syncAllAvatars();
                }
            });
            nameObs.observe(el, { childList: true, characterData: true, subtree: true });
        });
    }

    /* =====================================================
       INITIALIZE
       ===================================================== */

    function initializeAvatarSystem() {
        console.log("TERRAFIT: Tactical Avatar System initialized.");
        bindEventListeners();
        syncAllAvatars();
        observeAvatarDOM();
    }

    /* =====================================================
       PUBLIC API EXPOSURE
       ===================================================== */

    window.TerraFitAvatar = {
        getConfig: () => ({ ...currentConfig }),
        setConfig: (newCfg) => {
            saveConfig(newCfg);
            syncAllAvatars();
        },
        openModal: openAvatarModal,
        closeModal: closeAvatarModal,
        syncAll: syncAllAvatars,
        getFallbackInitial,
        PRESETS,
        COLOR_SWATCHES,
        FRAMES
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeAvatarSystem);
    } else {
        initializeAvatarSystem();
    }

})();