/* =========================================================
   TERRAFIT PROFILE SETUP
   A lightweight, Snapchat-inspired first-run profile flow.
========================================================= */

(() => {
    "use strict";

    const overlay = document.getElementById("profileSetup");
    if (!overlay) return;

    const steps = [...overlay.querySelectorAll(".profile-setup-step")];
    const progress = [...overlay.querySelectorAll(".profile-setup-progress span")];
    const preview = document.getElementById("profileSetupPreview");
    const photoInput = document.getElementById("profileSetupPhoto");
    const nameInput = document.getElementById("profileSetupName");
    const handleInput = document.getElementById("profileSetupHandle");
    const privacyInput = document.getElementById("profileSetupPrivate");
    const interests = new Set();
    let activeStep = 1;
    let photoData = null;

    function storageKey() {
        return `terrafit_profile_setup_${currentUser?.id || "guest"}`;
    }

    function setStep(step) {
        activeStep = Math.max(1, Math.min(3, step));
        steps.forEach((item, index) => item.classList.toggle("active", index + 1 === activeStep));
        progress.forEach((item, index) => item.classList.toggle("active", index < activeStep));
    }

    function open() {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey()) || "null");
            if (saved?.completed) return;
        } catch (_) {
            // A corrupt saved preference should not block profile setup.
        }
        const fallbackName = currentUser?.user_metadata?.name || currentUser?.user_metadata?.full_name || "";
        nameInput.value = fallbackName;
        handleInput.value = fallbackName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 20);
        setStep(1);
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function close() {
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function skip() {
        localStorage.setItem(storageKey(), JSON.stringify({ completed: true, skipped: true }));
        close();
    }

    async function finish() {
        const displayName = nameInput.value.trim() || currentUser?.user_metadata?.name || "PLAYER";
        const setup = {
            completed: true,
            displayName,
            handle: handleInput.value.trim().replace(/^@/, "").toLowerCase(),
            interests: [...interests],
            isPrivate: privacyInput.checked,
            photoData
        };
        localStorage.setItem(storageKey(), JSON.stringify(setup));

        if (photoData && window.TerraFitAvatar) {
            const currentAvatar = window.TerraFitAvatar.getConfig();
            window.TerraFitAvatar.setConfig({
                ...currentAvatar,
                type: "upload",
                uploadData: photoData,
                uploadName: "profile-photo"
            });
        }

        if (currentUser && supabaseClient) {
            const { error } = await supabaseClient.auth.updateUser({
                data: { ...currentUser.user_metadata, name: displayName, full_name: displayName, username: setup.handle }
            });
            if (error) console.warn("TERRAFIT: profile metadata update failed", error);
        }

        showLoggedInUser(displayName);
        close();
    }

    overlay.querySelectorAll("[data-next]").forEach(button => button.addEventListener("click", () => setStep(activeStep + 1)));
    overlay.querySelectorAll("[data-back]").forEach(button => button.addEventListener("click", () => setStep(activeStep - 1)));
    overlay.querySelector("[data-finish]").addEventListener("click", finish);
    document.getElementById("profileSetupSkip").addEventListener("click", skip);

    overlay.querySelectorAll("[data-interest]").forEach(button => {
        button.addEventListener("click", () => {
            const interest = button.dataset.interest;
            interests.has(interest) ? interests.delete(interest) : interests.add(interest);
            button.classList.toggle("selected", interests.has(interest));
        });
    });

    photoInput.addEventListener("change", () => {
        const file = photoInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            photoData = reader.result;
            preview.innerHTML = `<img src="${photoData}" alt="Selected profile photo">`;
        };
        reader.readAsDataURL(file);
    });

    window.TerraFitProfileSetup = { open, close };
})();
