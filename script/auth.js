/* =========================================================
   TERRAFIT AUTHENTICATION
========================================================= */

let authMode = "login";


/* =========================================================
   OPEN LOGIN
========================================================= */

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        () => {

            if (authOverlay) {
                authOverlay.classList.add(
                    "active"
                );
            }

            switchAuthMode(
                "login"
            );

        }
    );

}


/* =========================================================
   CLOSE AUTH
========================================================= */

if (authClose) {

    authClose.addEventListener(
        "click",
        closeAuth
    );

}


if (authOverlay) {

    authOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                authOverlay
            ) {

                closeAuth();

            }

        }
    );

}


function closeAuth() {

    if (authOverlay) {

        authOverlay.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   AUTH TABS
========================================================= */

if (loginTab) {

    loginTab.addEventListener(
        "click",
        () => {

            switchAuthMode(
                "login"
            );

        }
    );

}


if (signupTab) {

    signupTab.addEventListener(
        "click",
        () => {

            switchAuthMode(
                "signup"
            );

        }
    );

}


/* =========================================================
   SWITCH AUTH MODE
========================================================= */

function switchAuthMode(
    mode
) {

    authMode =
        mode;

    if (authMessage) {

        authMessage.textContent =
            "";

    }


    if (
        mode ===
        "login"
    ) {

        if (loginTab) {

            loginTab.classList.add(
                "active"
            );

        }

        if (signupTab) {

            signupTab.classList.remove(
                "active"
            );

        }

        if (authTitle) {

            authTitle.textContent =
                "WELCOME BACK.";

        }

        if (authSubtitle) {

            authSubtitle.textContent =
                "Log in to continue your territory conquest.";

        }

        if (nameField) {

            nameField.style.display =
                "none";

        }

        if (confirmPasswordField) {

            confirmPasswordField.style.display =
                "none";

        }

        if (loginOptions) {

            loginOptions.style.display =
                "flex";

        }

        if (authSubmit) {

            authSubmit.textContent =
                "LOG IN";

        }

    }

    else {

        if (loginTab) {

            loginTab.classList.remove(
                "active"
            );

        }

        if (signupTab) {

            signupTab.classList.add(
                "active"
            );

        }

        if (authTitle) {

            authTitle.textContent =
                "JOIN THE PROTOCOL.";

        }

        if (authSubtitle) {

            authSubtitle.textContent =
                "Create an operator callsign and claim your territory.";

        }

        if (nameField) {

            nameField.style.display =
                "block";

        }

        if (confirmPasswordField) {

            confirmPasswordField.style.display =
                "block";

        }

        if (loginOptions) {

            loginOptions.style.display =
                "none";

        }

        if (authSubmit) {

            authSubmit.textContent =
                "CREATE ACCOUNT";

        }

    }

}


/* =========================================================
   AUTH FORM
========================================================= */

if (authForm) {

    authForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!supabaseClient) {

                showAuthMessage(
                    "Authentication service unavailable."
                );

                return;

            }


            const name =
                authName
                    ? authName.value.trim()
                    : "";

            const email =
                authEmail
                    ? authEmail.value.trim()
                    : "";

            const password =
                authPassword
                    ? authPassword.value
                    : "";

            const confirmPassword =
                authConfirmPassword
                    ? authConfirmPassword.value
                    : "";


            /* =========================
               SIGN UP
            ========================= */

            if (
                authMode ===
                "signup"
            ) {

                if (
                    !name ||
                    !email ||
                    !password ||
                    !confirmPassword
                ) {

                    showAuthMessage(
                        "Please fill in all tactical credentials."
                    );

                    return;

                }


                if (
                    password.length <
                    6
                ) {

                    showAuthMessage(
                        "Password must contain at least 6 characters."
                    );

                    return;

                }


                if (
                    password !==
                    confirmPassword
                ) {

                    showAuthMessage(
                        "Credentials mismatch: Passwords do not match."
                    );

                    return;

                }


                if (authSubmit) {

                    authSubmit.disabled =
                        true;

                    authSubmit.textContent =
                        "CREATING...";

                }


                try {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient.auth.signUp({

                            email:
                                email,

                            password:
                                password,

                            options: {

                                data: {

                                    name:
                                        name,

                                    full_name:
                                        name

                                }

                            }

                        });


                    if (error) {

                        throw error;

                    }


                    if (
                        data.session
                    ) {

                        currentUser =
                            data.user;

                        await loadCurrentProfile();

                        showAuthMessage(
                            "Operator authorization confirmed."
                        );

                        setTimeout(
                            () => {

                                closeAuth();

                            },
                            700
                        );

                    }

                    else {

                        showAuthMessage(
                            "Account created. Check your email if verification is required."
                        );

                    }

                }

                catch (error) {

                    console.error(
                        "Signup error:",
                        error
                    );

                    showAuthMessage(
                        error.message ||
                        "Account creation failed."
                    );

                }

                finally {

                    if (authSubmit) {

                        authSubmit.disabled =
                            false;

                        authSubmit.textContent =
                            "CREATE ACCOUNT";

                    }

                }

                return;

            }


            /* =========================
               LOGIN
            ========================= */

            if (
                !email ||
                !password
            ) {

                showAuthMessage(
                    "Please enter operator email and password."
                );

                return;

            }


            if (authSubmit) {

                authSubmit.disabled =
                    true;

                authSubmit.textContent =
                    "AUTHORIZING...";

            }


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email:
                                email,

                            password:
                                password

                        });


                if (error) {

                    throw error;

                }


                currentUser =
                    data.user;

                await loadCurrentProfile();

                showAuthMessage(
                    "Operator authorization confirmed."
                );

                setTimeout(
                    () => {

                        closeAuth();

                    },
                    700
                );

            }

            catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                showAuthMessage(
                    error.message ||
                    "Invalid security credentials."
                );

            }

            finally {

                if (authSubmit) {

                    authSubmit.disabled =
                        false;

                    authSubmit.textContent =
                        "LOG IN";

                }

            }

        }
    );

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async () => {

            if (
                !supabaseClient
            ) {

                showAuthMessage(
                    "Authentication service unavailable."
                );

                return;

            }


            const email =
                authEmail
                    ? authEmail.value.trim()
                    : "";


            if (!email) {

                showAuthMessage(
                    "Enter your email address first."
                );

                return;

            }


            try {

                const {
                    error
                } =
                    await supabaseClient.auth
                        .resetPasswordForEmail(
                            email
                        );


                if (error) {

                    throw error;

                }


                showAuthMessage(
                    "Password recovery email sent."
                );

            }

            catch (error) {

                console.error(
                    "Password recovery:",
                    error
                );

                showAuthMessage(
                    error.message ||
                    "Password recovery failed."
                );

            }

        }
    );

}


/* =========================================================
   AUTH MESSAGE
========================================================= */

function showAuthMessage(
    message
) {

    if (authMessage) {

        authMessage.textContent =
            message;

    }

}


/* =========================================================
   SHOW LOGGED-IN USER
========================================================= */

function showLoggedInUser(
    name
) {

    const safeName =
        String(
            name || "PLAYER"
        ).trim();


    console.log(
        "TERRAFIT: Logged in as:",
        safeName
    );


    if (loginBtn) {

        loginBtn.textContent =
            safeName.toUpperCase();

    }


    if (logoutBtn) {

        logoutBtn.style.display =
            "inline-flex";

    }


    if (playerName) {

        playerName.textContent =
            safeName.toUpperCase() +
            ".";

    }


    if (leaderboardPlayerName) {

        leaderboardPlayerName.textContent =
            safeName.toUpperCase() +
            " (YOU)";

    }


    if (profilePlayerName) {

        profilePlayerName.textContent =
            safeName.toUpperCase();

    }


    const firstLetter =
        safeName
            .charAt(0)
            .toUpperCase();


    if (leaderboardAvatarLetter) {

        leaderboardAvatarLetter.textContent =
            firstLetter;

    }


    if (profileAvatarLetter) {

        profileAvatarLetter.textContent =
            firstLetter;

    }

}


/* =========================================================
   LOAD CURRENT PROFILE
========================================================= */

async function loadCurrentProfile() {

    if (
        !supabaseClient ||
        !currentUser
    ) {

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq(
                    "id",
                    currentUser.id
                )
                .single();


        if (error) {

            console.error(
                "TERRAFIT: Profile load failed:",
                error
            );

            showLoggedInUser(
                currentUser.user_metadata?.name ||
                currentUser.email?.split("@")[0] ||
                "PLAYER"
            );

            return;

        }


        currentProfile =
            data;


        const name =
            data.full_name ||
            data.name ||
            currentUser.user_metadata?.name ||
            currentUser.email?.split("@")[0] ||
            "PLAYER";


        showLoggedInUser(
            name
        );


        await loadPlayerStats();

    }

    catch (error) {

        console.error(
            "TERRAFIT: Profile error:",
            error
        );

    }

}


/* =========================================================
   LOAD PLAYER STATS
========================================================= */

async function loadPlayerStats() {

    if (
        !supabaseClient ||
        !currentUser
    ) {

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("player_stats")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .single();


        if (error) {

            console.error(
                "TERRAFIT: Stats load failed:",
                error
            );

            return;

        }


        updateStatsUI(
            data
        );

    }

    catch (error) {

        console.error(
            "TERRAFIT: Stats error:",
            error
        );

    }

}


/* =========================================================
   UPDATE STATS UI
========================================================= */

function updateStatsUI(
    stats
) {

    const totalDistance =
        Number(
            stats.total_distance_km ||
            0
        );


    const totalXP =
        Number(
            stats.total_xp ||
            0
        );


    const territory =
        Number(
            stats.territory_count ||
            0
        );


    const streak =
        Number(
            stats.current_streak ||
            0
        );


    const activities =
        Number(
            stats.completed_activities ||
            0
        );


    if (activityCount) {

        activityCount.textContent =
            totalDistance.toFixed(1);

    }


    if (territoryCount) {

        territoryCount.textContent =
            territory;

    }


    if (xpCount) {

        xpCount.textContent =
            totalXP;

    }


    if (streakCount) {

        streakCount.textContent =
            streak;

    }


    if (leaderboardDistance) {

        leaderboardDistance.textContent =
            totalDistance.toFixed(1) +
            " KM";

    }


    if (leaderboardTerritory) {

        leaderboardTerritory.textContent =
            territory +
            " Cells";

    }


    if (leaderboardXP) {

        leaderboardXP.textContent =
            totalXP +
            " XP";

    }


    if (profileDistanceStat) {

        profileDistanceStat.textContent =
            totalDistance.toFixed(1) +
            " KM";

    }


    if (profileTerritoryStat) {

        profileTerritoryStat.textContent =
            territory +
            " CELLS";

    }


    if (profileStreakStat) {

        profileStreakStat.textContent =
            streak +
            " DAYS";

    }


    updateProfileXP(
        totalXP
    );


    console.log(
        "TERRAFIT stats loaded:",
        {
            totalDistance,
            totalXP,
            territory,
            streak,
            activities
        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            console.log(
                "TERRAFIT: Logout requested."
            );


            if (
                activityRunning
            ) {

                activityRunning =
                    false;

            }


            if (
                watchId !==
                null
            ) {

                navigator.geolocation.clearWatch(
                    watchId
                );

                watchId =
                    null;

            }


            if (
                timerInterval !==
                null
            ) {

                clearInterval(
                    timerInterval
                );

                timerInterval =
                    null;

            }


            if (activityBtn) {

                activityBtn.textContent =
                    "START ACTIVITY";

                activityBtn.classList.remove(
                    "danger-state"
                );

            }


            if (activityStatus) {

                activityStatus.textContent =
                    "READY";

            }


            if (supabaseClient) {

                try {

                    const {
                        error
                    } =
                        await supabaseClient.auth
                            .signOut();


                    if (error) {

                        console.error(
                            "Logout error:",
                            error
                        );

                    }

                }

                catch (error) {

                    console.error(
                        "Logout exception:",
                        error
                    );

                }

            }


            currentUser =
                null;

            currentProfile =
                null;

            currentActivityId =
                null;

            locationReady =
                false;

            currentUserLocation =
                null;

            capturedTerritories =
                new Set();

            routeCoordinates =
                [];

            distance =
                0;

            seconds =
                0;


            if (loginBtn) {

                loginBtn.textContent =
                    "LOG IN";

            }


            if (logoutBtn) {

                logoutBtn.style.display =
                    "none";

            }


            if (playerName) {

                playerName.textContent =
                    "PLAYER.";

            }


            if (leaderboardPlayerName) {

                leaderboardPlayerName.textContent =
                    "PLAYER (YOU)";

            }


            if (profilePlayerName) {

                profilePlayerName.textContent =
                    "PLAYER";

            }


            if (leaderboardAvatarLetter) {

                leaderboardAvatarLetter.textContent =
                    "P";

            }


            if (profileAvatarLetter) {

                profileAvatarLetter.textContent =
                    "P";

            }


            closeLocationSetup();


            if (mobileNavDrawer) {

                mobileNavDrawer.classList.remove(
                    "open"
                );

            }


            navLinks.forEach(
                link => {

                    link.classList.remove(
                        "active"
                    );

                }
            );


            if (dashboard) {

                dashboard.style.display =
                    "none";

            }


            if (landingPage) {

                landingPage.style.display =
                    "grid";

                landingPage.scrollIntoView({
                    behavior:
                        "smooth"
                });

            }


            console.log(
                "TERRAFIT: Operator logged out."
            );

        }
    );

}


/* =========================================================
   RESTORE SUPABASE SESSION
========================================================= */

async function restoreSupabaseSession() {

    if (!supabaseClient) {

        console.error(
            "TERRAFIT: Cannot restore session; Supabase unavailable."
        );

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getSession();


        if (error) {

            throw error;

        }


        if (
            data &&
            data.session &&
            data.session.user
        ) {

            currentUser =
                data.session.user;

            await loadCurrentProfile();

            console.log(
                "TERRAFIT: Existing Supabase session restored."
            );

        }

    }

    catch (error) {

        console.error(
            "TERRAFIT: Session restore failed:",
            error
        );

    }

}