/* =========================================================
   UPDATE PLAYER STATS
========================================================= */

async function updateSupabaseStats(
    finalDistance,
    earnedXP,
    captured
) {

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
                "TERRAFIT: Could not load player stats:",
                error
            );

            return;

        }

        const currentDistance =
            Number(
                data.total_distance_km ||
                0
            );

        const currentXP =
            Number(
                data.total_xp ||
                0
            );

        const currentTerritory =
            Number(
                data.territory_count ||
                0
            );

        const currentActivities =
            Number(
                data.completed_activities ||
                0
            );

        const {
            error: updateError
        } =
            await supabaseClient
                .from("player_stats")
                .update({

                    total_distance_km:
                        currentDistance +
                        finalDistance,

                    total_xp:
                        currentXP +
                        earnedXP,

                    territory_count:
                        currentTerritory +
                        captured,

                    completed_activities:
                        currentActivities +
                        1,

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "user_id",
                    currentUser.id
                );

        if (updateError) {

            console.error(
                "TERRAFIT: Stats update failed:",
                updateError
            );

        }

    }

    catch (error) {

        console.error(
            "TERRAFIT: Stats update error:",
            error
        );

    }

}


/* =========================================================
   SPEED UI
========================================================= */

function updateSpeedUI(
    speed = 0
) {

    const currentSpeed =
        Math.max(
            0,
            Number(speed) || 0
        );


    /* -----------------------------------------
       CURRENT ACTIVITY
    ----------------------------------------- */

    const activity =
        String(
            selectedActivity ||
            "Walking"
        )
        .trim()
        .toLowerCase();


    /* -----------------------------------------
       SPEED LIMIT
    ----------------------------------------- */

    const speedLimit =
        typeof getSpeedLimit ===
        "function"

            ? Number(
                getSpeedLimit(
                    selectedActivity
                )
            )

            : Number(
                TERRAFIT_SPEED_LIMITS[
                    activity
                ] || 0
            );


    /* -----------------------------------------
       UPDATE LIVE SPEED
    ----------------------------------------- */

    if (liveSpeedDisplay) {

        liveSpeedDisplay.textContent =
            currentSpeed.toFixed(1);

    }


    /* -----------------------------------------
       UPDATE SPEED LIMIT
    ----------------------------------------- */

    if (speedLimitDisplay) {

        speedLimitDisplay.textContent =
            speedLimit.toFixed(0);

    }


    /* -----------------------------------------
       UPDATE ACTIVITY LABEL
    ----------------------------------------- */

    if (speedActivityDisplay) {

        speedActivityDisplay.textContent =
            activity.charAt(0).toUpperCase() +
            activity.slice(1);

    }


    /* -----------------------------------------
       SPEED STATUS
    ----------------------------------------- */

    let status =
        "READY";

    if (
        currentSpeed <= 0.5
    ) {

        status =
            "STATIONARY";

    }

    else if (
        speedLimit > 0 &&
        currentSpeed >= speedLimit
    ) {

        status =
            "LIMIT REACHED";

    }

    else {

        status =
            "WITHIN LIMIT";

    }


    if (speedStatusText) {

        speedStatusText.textContent =
            status;

    }


    /* -----------------------------------------
       STATUS DOT
    ----------------------------------------- */

    if (speedStatusDot) {

        speedStatusDot.classList.toggle(
            "warning",
            speedLimit > 0 &&
            currentSpeed >= speedLimit
        );

    }


    /* -----------------------------------------
       SPEED PROGRESS
       0 → 100%
    ----------------------------------------- */

    if (speedProgressBar) {

        let percentage = 0;

        if (speedLimit > 0) {

            percentage =
                (
                    currentSpeed /
                    speedLimit
                ) * 100;

        }

        percentage =
            Math.min(
                100,
                Math.max(
                    0,
                    percentage
                )
            );

        speedProgressBar.style.width =
            `${percentage}%`;

    }


    /* -----------------------------------------
       CARD STATE
    ----------------------------------------- */

    if (speedMonitorCard) {

        speedMonitorCard.classList.toggle(
            "speed-warning",
            speedLimit > 0 &&
            currentSpeed >= speedLimit
        );

        speedMonitorCard.classList.toggle(
            "speed-active",
            currentSpeed > 0.5
        );

    }

}


/* =========================================================
   TIMER
========================================================= */

function updateTimer() {

    seconds++;

    if (timerDisplay) {

        timerDisplay.textContent =
            formatTime(
                seconds
            );

    }

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(
    totalSeconds
) {

    const minutes =
        Math.floor(
            totalSeconds /
            60
        );

    const remainingSeconds =
        totalSeconds %
        60;

    return (
        String(minutes)
            .padStart(
                2,
                "0"
            )

        +

        ":"

        +

        String(
            remainingSeconds
        )
        .padStart(
            2,
            "0"
        )

    );

}


/* =========================================================
   GPS ERROR
========================================================= */

function handleGPSError(
    error
) {

    console.error(
        "GPS Error:",
        error
    );

    const button =
        document.getElementById(
            "detectLocationBtn"
        );

    if (button) {

        button.disabled =
            false;

        button.textContent =
            "📍 ACQUIRE GPS LOCK";

    }

    if (
        error.code ===
        1
    ) {

        setGPSStatus(
            "LOCATION DENIED"
        );

        showLocationMessage(
            "GPS permission denied. Enter your location manually."
        );

    }

    else if (
        error.code ===
        2
    ) {

        setGPSStatus(
            "LOCATION UNAVAILABLE"
        );

        showLocationMessage(
            "Coordinates unavailable. Try entering manually."
        );

    }

    else if (
        error.code ===
        3
    ) {

        setGPSStatus(
            "GPS TIMEOUT"
        );

        showLocationMessage(
            "GPS query timed out. Try again."
        );

    }

    else {

        setGPSStatus(
            "GPS ERROR"
        );

        showLocationMessage(
            "GPS acquisition error. Use manual location."
        );

    }

}


/* =========================================================
   GPS STATUS
========================================================= */

function setGPSStatus(
    text
) {

    if (gpsStatus) {

        gpsStatus.innerHTML = `

            <span class="gps-dot"></span>

            ${text}

        `;

    }

    if (headerGpsText) {

        headerGpsText.textContent =
            text;

    }

}