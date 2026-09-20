/* =========================================================
   TERRAFIT ACTIVITY
   Activity lifecycle, route tracking, persistence and capture logic.
========================================================= */


/* =========================================================
   START ACTIVITY
========================================================= */

async function startActivity() {

    if (activityRunning) {
        return;
    }

    if (!currentUser) {

        if (typeof openAuthModal === "function") {
            openAuthModal("login");
        }

        alert(
            "Please login before starting an activity."
        );

        return;
    }

    if (!locationReady) {

        alert(
            "Please acquire your GPS location first."
        );

        if (typeof showLocationSetup === "function") {
            showLocationSetup();
        }

        return;
    }

    if (!("geolocation" in navigator)) {

        alert(
            "GPS is not supported by this browser."
        );

        return;
    }


    /* -----------------------------------------------------
       RESET ACTIVITY STATE
    ----------------------------------------------------- */

    activityRunning = true;

    seconds = 0;

    distance = 0;

    routeCoordinates = [];

    capturedTerritories.clear();

    lastPosition = null;

    lastPointTime = 0;

    lastPointLat = null;

    lastPointLon = null;

    lastSpeedPoint = null;

    currentSpeedKmh = 0;

    currentActivityId = null;


    /* -----------------------------------------------------
       RESET ROUTE LINE
    ----------------------------------------------------- */

    if (routeLine) {

        if (
            map &&
            map.hasLayer(routeLine)
        ) {

            map.removeLayer(
                routeLine
            );

        }

        routeLine = null;

    }


    /* -----------------------------------------------------
       RESET TERRITORY STATE
    ----------------------------------------------------- */

    territoryCells.forEach(
        (cell) => {

            cell.owner =
                "neutral";

            cell.strength =
                0;

            cell.captured =
                false;

            if (
                typeof updateTerritoryCell ===
                "function"
            ) {

                updateTerritoryCell(
                    cell
                );

            }

        }
    );


    /* -----------------------------------------------------
       RESET UI
    ----------------------------------------------------- */

    if (distanceDisplay) {

        distanceDisplay.textContent =
            "0.00 KM";

    }

    if (timerDisplay) {

        timerDisplay.textContent =
            "00:00";

    }

    if (activityStatus) {

        activityStatus.textContent =
            "ACTIVE";

        activityStatus.classList.add(
            "active"
        );

    }

    if (activityBtn) {

        activityBtn.textContent =
            "FINISH ACTIVITY";

        activityBtn.classList.add(
            "danger-state"
        );

        activityBtn.classList.add(
            "active"
        );

    }

    setGPSStatus(
        "GPS TRACKING"
    );


    /* -----------------------------------------------------
       RESET SPEED
    ----------------------------------------------------- */

    updateSpeedUI(
        0
    );


    /* -----------------------------------------------------
       CREATE SUPABASE ACTIVITY
    ----------------------------------------------------- */

    try {

        await createSupabaseActivity();

    }

    catch (error) {

        console.error(
            "TERRAFIT: Activity creation failed:",
            error
        );

        activityRunning = false;

        if (activityBtn) {

            activityBtn.textContent =
                "START ACTIVITY";

            activityBtn.classList.remove(
                "danger-state"
            );

            activityBtn.classList.remove(
                "active"
            );

        }

        if (activityStatus) {

            activityStatus.textContent =
                "READY";

            activityStatus.classList.remove(
                "active"
            );

        }

        setGPSStatus(
            "LOCATION READY"
        );

        return;

    }


    /* -----------------------------------------------------
       START TIMER
    ----------------------------------------------------- */

    timerInterval =
        setInterval(
            () => {

                seconds++;

                if (timerDisplay) {

                    timerDisplay.textContent =
                        formatTime(
                            seconds
                        );

                }

            },
            1000
        );


    /* -----------------------------------------------------
       START GPS WATCH
    ----------------------------------------------------- */

    watchId =
        navigator.geolocation.watchPosition(

            updatePlayerLocation,

            handleGPSError,

            {

                enableHighAccuracy:
                    true,

                maximumAge:
                    2000,

                timeout:
                    10000

            }

        );

}


/* =========================================================
   CREATE ACTIVITY IN SUPABASE
========================================================= */

async function createSupabaseActivity() {

    if (
        !supabaseClient ||
        !currentUser
    ) {

        return;

    }

    const activityType =
        typeof normalizeActivity === "function"
            ? normalizeActivity(
                selectedActivity
            )
            : String(
                selectedActivity || "walking"
            ).toLowerCase();


    const {
        data,
        error
    } =
        await supabaseClient
            .from("activities")
            .insert({

                user_id:
                    currentUser.id,

                activity_type:
                    activityType,

                status:
                    "active",

                distance_km:
                    0,

                duration_seconds:
                    0,

                xp_earned:
                    0

            })
            .select()
            .single();


    if (error) {

        console.error(
            "TERRAFIT: Activity creation failed:",
            error
        );

        throw error;

    }


    currentActivityId =
        data.id;


    console.log(
        "TERRAFIT: Activity created:",
        currentActivityId
    );

}


/* =========================================================
   UPDATE PLAYER LOCATION
========================================================= */

function updatePlayerLocation(
    position
) {

    if (!position) {
        return;
    }


    const latitude =
        position.coords.latitude;

    const longitude =
        position.coords.longitude;

    const accuracy =
        position.coords.accuracy;

    const timestamp =
        position.timestamp ||
        Date.now();


    const coordinates = [
        latitude,
        longitude
    ];


    /* -----------------------------------------------------
       SAVE CURRENT LOCATION
    ----------------------------------------------------- */

    currentUserLocation = {

        latitude:
            latitude,

        longitude:
            longitude

    };

    locationReady =
        true;


    /* -----------------------------------------------------
       UPDATE PLAYER MARKER
    ----------------------------------------------------- */

    if (
        typeof createOrUpdatePlayerMarker ===
        "function"
    ) {

        createOrUpdatePlayerMarker(
            coordinates
        );

    }


    /* -----------------------------------------------------
       UPDATE ACCURACY CIRCLE
    ----------------------------------------------------- */

    if (
        typeof createAccuracyCircle ===
        "function"
    ) {

        createAccuracyCircle(
            coordinates,
            accuracy
        );

    }


    /* -----------------------------------------------------
       MAP BEHAVIOUR
    ----------------------------------------------------- */

    if (
        map &&
        activityRunning
    ) {

        map.panTo(
            coordinates,
            {

                animate:
                    true,

                duration:
                    0.5

            }
        );

    }

    else if (map) {

        map.setView(
            coordinates,
            map.getZoom()
        );

    }


    /* -----------------------------------------------------
       ACTIVITY TRACKING
    ----------------------------------------------------- */

    if (activityRunning) {

        addRoutePoint(
            latitude,
            longitude,
            timestamp
        );

    }


    /* -----------------------------------------------------
       GPS STATUS
    ----------------------------------------------------- */

    if (
        typeof setGPSStatus ===
        "function"
    ) {

        setGPSStatus(
            activityRunning
                ? "GPS TRACKING"
                : "GPS READY"
        );

    }

}


/* =========================================================
   ADD ROUTE POINT
========================================================= */

function addRoutePoint(
    lat,
    lon,
    timestamp = Date.now()
) {

    if (!activityRunning) {
        return;
    }


    const now =
        timestamp ||
        Date.now();


    /* -----------------------------------------------------
       FIRST GPS POINT
    ----------------------------------------------------- */

    if (
        routeCoordinates.length ===
        0
    ) {

        routeCoordinates.push({

            lat:
                lat,

            lon:
                lon,

            time:
                now

        });

        lastPointTime =
            now;

        lastPointLat =
            lat;

        lastPointLon =
            lon;

        lastPosition =
            null;

        lastSpeedPoint = {

            lat:
                lat,

            lon:
                lon,

            time:
                now

        };

        return;

    }


    /* -----------------------------------------------------
       TIME DIFFERENCE
    ----------------------------------------------------- */

    const timeDifference =
        (
            now -
            lastPointTime
        ) / 1000;


    if (
        timeDifference <=
        0
    ) {

        return;

    }


    /* -----------------------------------------------------
       DISTANCE FROM PREVIOUS POINT
    ----------------------------------------------------- */

    const pointDistance =
        calculateDistance(

            lastPointLat,

            lastPointLon,

            lat,

            lon

        );


    if (
        pointDistance <=
        0
    ) {

        return;

    }


    /* -----------------------------------------------------
       INSTANTANEOUS SPEED
    ----------------------------------------------------- */

    const pointSpeed =
        (
            pointDistance /
            timeDifference
        ) *
        3600;


    /* -----------------------------------------------------
       SELECTED ACTIVITY SPEED LIMIT
    ----------------------------------------------------- */

    const speedLimit =
        typeof getSpeedLimit ===
        "function"
            ? getSpeedLimit(
                selectedActivity
            )
            : Infinity;


    /* -----------------------------------------------------
       IGNORE SUSPICIOUS GPS JUMPS
    ----------------------------------------------------- */

    if (
        pointSpeed >
        speedLimit * 2
    ) {

        console.warn(
            "TERRAFIT: Ignoring suspicious GPS point.",
            {

                speed:
                    pointSpeed,

                limit:
                    speedLimit,

                activity:
                    selectedActivity

            }
        );

        return;

    }


    /* -----------------------------------------------------
       ADD VALID ROUTE POINT
    ----------------------------------------------------- */

    routeCoordinates.push({

        lat:
            lat,

        lon:
            lon,

        time:
            now

    });


    distance +=
        pointDistance;


    lastPointTime =
        now;

    lastPointLat =
        lat;

    lastPointLon =
        lon;


    /* -----------------------------------------------------
       CALCULATE GPS SPEED
    ----------------------------------------------------- */

    currentSpeedKmh =
        calculateGpsSpeed(

            lat,

            lon,

            now

        );


    /* -----------------------------------------------------
       UPDATE SPEED UI
    ----------------------------------------------------- */

    if (
        typeof updateSpeedUI ===
        "function"
    ) {

        updateSpeedUI(
            currentSpeedKmh
        );

    }


    /* -----------------------------------------------------
       UPDATE DISTANCE
    ----------------------------------------------------- */

    updateDistanceDisplay();


    /* -----------------------------------------------------
       DRAW ROUTE
    ----------------------------------------------------- */

    drawRoute();


    /* -----------------------------------------------------
       SAVE GPS POINT
    ----------------------------------------------------- */

    saveActivityPoint(

        lat,

        lon,

        now

    );


    /* -----------------------------------------------------
       CHECK TERRITORY
    ----------------------------------------------------- */

    checkRouteTerritories([

        lat,

        lon

    ]);

}


/* =========================================================
   DRAW ROUTE
========================================================= */

function drawRoute() {

    if (
        !map ||
        routeCoordinates.length <
        2
    ) {

        return;

    }


    const points =
        routeCoordinates.map(
            point => [

                point.lat,

                point.lon

            ]
        );


    if (!routeLine) {

        routeLine =
            L.polyline(

                points,

                {

                    color:
                        "#0066ff",

                    weight:
                        5,

                    opacity:
                        0.85,

                    lineJoin:
                        "round",

                    lineCap:
                        "round"

                }

            )
            .addTo(map);

    }

    else {

        routeLine.setLatLngs(
            points
        );

    }

}


/* =========================================================
   UPDATE DISTANCE
========================================================= */

function updateDistanceDisplay() {

    if (distanceDisplay) {

        distanceDisplay.textContent =
            distance.toFixed(2) +
            " KM";

    }

}


/* =========================================================
   HAVERSINE DISTANCE
========================================================= */

function calculateDistance(

    lat1,

    lon1,

    lat2,

    lon2

) {

    const earthRadius =
        6371;


    const dLat =
        toRadians(
            lat2 -
            lat1
        );


    const dLon =
        toRadians(
            lon2 -
            lon1
        );


    const a =

        Math.sin(
            dLat / 2
        ) ** 2 +

        Math.cos(
            toRadians(
                lat1
            )
        ) *

        Math.cos(
            toRadians(
                lat2
            )
        ) *

        Math.sin(
            dLon / 2
        ) ** 2;


    const c =
        2 *
        Math.atan2(

            Math.sqrt(a),

            Math.sqrt(
                1 - a
            )

        );


    return (
        earthRadius *
        c
    );

}


/* =========================================================
   COMPATIBILITY ALIAS
========================================================= */

function haversineDistance(

    lat1,

    lon1,

    lat2,

    lon2

) {

    return calculateDistance(

        lat1,

        lon1,

        lat2,

        lon2

    );

}


/* =========================================================
   RADIANS
========================================================= */

function toRadians(
    degrees
) {

    return (

        degrees *
        Math.PI /
        180

    );

}


/* =========================================================
   GPS SPEED
========================================================= */

function calculateGpsSpeed(

    lat,

    lon,

    timestamp

) {

    if (!lastSpeedPoint) {

        lastSpeedPoint = {

            lat:
                lat,

            lon:
                lon,

            time:
                timestamp

        };

        return 0;

    }


    const timeSeconds =
        (
            timestamp -
            lastSpeedPoint.time
        ) / 1000;


    if (
        timeSeconds <=
        0.5
    ) {

        return currentSpeedKmh;

    }


    const segmentDistance =
        calculateDistance(

            lastSpeedPoint.lat,

            lastSpeedPoint.lon,

            lat,

            lon

        );


    const speedKmh =
        (
            segmentDistance /
            timeSeconds
        ) *
        3600;


    lastSpeedPoint = {

        lat:
            lat,

        lon:
            lon,

        time:
            timestamp

    };


    return speedKmh;

}


/* =========================================================
   SAVE ACTIVITY POINT
========================================================= */

async function saveActivityPoint(

    latitude,

    longitude,

    timestamp

) {

    if (
        !supabaseClient ||
        !currentActivityId ||
        !currentUser
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("activity_points")
                .insert({

                    activity_id:
                        currentActivityId,

                    user_id:
                        currentUser.id,

                    latitude:
                        latitude,

                    longitude:
                        longitude,

                    recorded_at:
                        new Date(
                            timestamp
                        ).toISOString()

                });


        if (error) {

            console.error(
                "TERRAFIT: GPS point save failed:",
                error
            );

        }

    }

    catch (error) {

        console.error(
            "TERRAFIT: GPS point error:",
            error
        );

    }

}


/* =========================================================
   CHECK TERRITORIES
========================================================= */

function checkRouteTerritories(
    point
) {

    for (
        const territory
        of territoryCells
    ) {

        if (
            territory.owner ===
            "player"
        ) {

            continue;

        }


        const bounds =
            territory.layer.getBounds();


        if (
            bounds.contains(
                point
            )
        ) {

            captureTerritory(
                territory
            );

        }

    }

}


/* =========================================================
   CAPTURE TERRITORY
========================================================= */

async function captureTerritory(
    territory
) {

    if (
        capturedTerritories.has(
            territory
        )
    ) {

        return;

    }


    capturedTerritories.add(
        territory
    );


    territory.owner =
        "player";

    territory.strength =
        50;


    territory.layer.setStyle(
        getTerritoryStyle(
            "player"
        )
    );


    let currentTerritory =
        parseInt(

            territoryCount
                ? territoryCount.textContent
                : "0"

        ) || 0;


    currentTerritory++;


    if (territoryCount) {

        territoryCount.textContent =
            currentTerritory;

    }


    if (leaderboardTerritory) {

        leaderboardTerritory.textContent =
            currentTerritory +
            " Cells";

    }


    if (profileTerritoryStat) {

        profileTerritoryStat.textContent =
            currentTerritory +
            " CELLS";

    }


    let currentXP =
        parseInt(

            xpCount
                ? xpCount.textContent
                : "0"

        ) || 0;


    currentXP +=
        100;


    if (xpCount) {

        xpCount.textContent =
            currentXP;

    }


    if (leaderboardXP) {

        leaderboardXP.textContent =
            currentXP +
            " XP";

    }


    updateProfileXP(
        currentXP
    );


    if (territoryStatus) {

        territoryStatus.textContent =
            "CAPTURED";

    }


    if (territoryStrength) {

        territoryStrength.textContent =
            "50%";

    }


    territory.layer
        .bindPopup(`

            <div style="
                font-family:'Space Grotesk',monospace;
                padding:4px;
            ">

                <b style="
                    color:#0066ff;
                ">

                    TERRITORY CAPTURED!

                </b>

                <br>

                <span style="
                    font-size:11px;
                    color:#0f172a;
                ">

                    +100 XP Sovereign Bonus

                </span>

            </div>

        `)
        .openPopup();

}


/* =========================================================
   PROFILE XP
========================================================= */

function updateProfileXP(
    currentXP
) {

    const xpPercent =
        Math.min(

            100,

            Math.round(

                (
                    currentXP %
                    5000
                ) / 50

            )

        );


    if (profileXpProgress) {

        profileXpProgress.textContent =
            `${currentXP} / 5,000 XP (${xpPercent}%)`;

    }


    if (profileProgressBar) {

        profileProgressBar.style.width =
            `${Math.max(
                0,
                xpPercent
            )}%`;

    }

}


/* =========================================================
   FINISH ACTIVITY
========================================================= */

async function finishActivity() {

    if (!activityRunning) {

        return;

    }


    activityRunning =
        false;


    /* -----------------------------------------------------
       STOP GPS
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       STOP TIMER
    ----------------------------------------------------- */

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


    const finalDistance =
        distance;

    const finalSeconds =
        seconds;

    const captured =
        capturedTerritories.size;

    const earnedXP =
        captured *
        100;


    /* -----------------------------------------------------
       SAVE ACTIVITY
    ----------------------------------------------------- */

    await updateSupabaseActivity(

        finalDistance,

        finalSeconds,

        earnedXP

    );


    await updateSupabaseStats(

        finalDistance,

        earnedXP,

        captured

    );


    /* -----------------------------------------------------
       UPDATE LOCAL STATS
    ----------------------------------------------------- */

    const totalActivity =

        (

            parseFloat(

                activityCount
                    ? activityCount.textContent
                    : "0"

            ) || 0

        ) +

        finalDistance;


    if (activityCount) {

        activityCount.textContent =
            totalActivity.toFixed(1);

    }


    if (leaderboardDistance) {

        leaderboardDistance.textContent =
            totalActivity.toFixed(1) +
            " KM";

    }


    if (profileDistanceStat) {

        profileDistanceStat.textContent =
            totalActivity.toFixed(1) +
            " KM";

    }


    /* -----------------------------------------------------
       STREAK
    ----------------------------------------------------- */

    if (
        streakCount &&
        finalDistance > 0
    ) {

        let streak =
            parseInt(
                streakCount.textContent
            ) || 0;


        streak++;


        streakCount.textContent =
            streak;


        if (profileStreakStat) {

            profileStreakStat.textContent =
                streak +
                " DAYS";

        }

    }


    /* -----------------------------------------------------
       RESET UI
    ----------------------------------------------------- */

    if (activityBtn) {

        activityBtn.textContent =
            "START ACTIVITY";

        activityBtn.classList.remove(
            "danger-state"
        );

        activityBtn.classList.remove(
            "active"
        );

    }


    if (activityStatus) {

        activityStatus.textContent =
            "COMPLETED";

        activityStatus.classList.remove(
            "active"
        );

    }


    setGPSStatus(
        "LOCATION READY"
    );


    if (lastActivity) {

        lastActivity.textContent =
            "JUST NOW";

    }


    /* -----------------------------------------------------
       RESET SPEEDOMETER
    ----------------------------------------------------- */

    currentSpeedKmh =
        0;


    updateSpeedUI(
        0
    );


    currentActivityId =
        null;


    /* -----------------------------------------------------
       COMPLETION MESSAGE
    ----------------------------------------------------- */

    alert(

        "TERRAFIT MISSION COMPLETED!\n\n" +

        "Activity Type: " +
        selectedActivity +

        "\nDistance Tracked: " +
        finalDistance.toFixed(2) +
        " KM" +

        "\nTime Elapsed: " +
        formatTime(
            finalSeconds
        ) +

        "\nTerritories Conquered: " +
        captured +
        " Cells" +

        "\nXP Earned: +" +
        earnedXP +
        " XP"

    );

}


/* =========================================================
   UPDATE ACTIVITY IN SUPABASE
========================================================= */

async function updateSupabaseActivity(

    finalDistance,

    finalSeconds,

    earnedXP

) {

    if (
        !supabaseClient ||
        !currentActivityId
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("activities")
                .update({

                    status:
                        "completed",

                    distance_km:
                        finalDistance,

                    duration_seconds:
                        finalSeconds,

                    xp_earned:
                        earnedXP,

                    completed_at:
                        new Date().toISOString()

                })
                .eq(

                    "id",

                    currentActivityId

                );


        if (error) {

            console.error(
                "TERRAFIT: Activity update failed:",
                error
            );

        }

    }

    catch (error) {

        console.error(
            "TERRAFIT: Activity update error:",
            error
        );

    }

}