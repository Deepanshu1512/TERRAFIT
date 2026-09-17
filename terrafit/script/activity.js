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

    /* -----------------------------------------------------
       Reset activity state
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


    /* -----------------------------------------------------
       Reset route line
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
       Reset territory state
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
       Update UI
    ----------------------------------------------------- */

    if (activityBtn) {

        activityBtn.textContent =
            "FINISH ACTIVITY";

        activityBtn.classList.add(
            "active"
        );

    }

    if (activityStatus) {

        activityStatus.textContent =
            "ACTIVITY ACTIVE";

        activityStatus.classList.add(
            "active"
        );

    }

    if (gpsStatus) {

        gpsStatus.textContent =
            "GPS TRACKING";

    }


    /* -----------------------------------------------------
       Create Supabase activity
    ----------------------------------------------------- */

    try {

        await createSupabaseActivity();

    }

    catch (error) {

        console.error(
            "TERRAFIT: Failed to create activity:",
            error
        );

        activityRunning = false;

        if (activityBtn) {

            activityBtn.textContent =
                "START ACTIVITY";

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

        return;

    }


    /* -----------------------------------------------------
       Start timer
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
       Start GPS watch
    ----------------------------------------------------- */

    if (
        "geolocation" in navigator
    ) {

        watchId =
            navigator.geolocation.watchPosition(

                updatePlayerLocation,

                handleGPSError,

                {
                    enableHighAccuracy:
                        true,

                    timeout:
                        15000,

                    maximumAge:
                        1000
                }

            );

    }

    else {

        alert(
            "Geolocation is not supported by this browser."
        );

        await finishActivity();

    }

}


/* =========================================================
   CREATE SUPABASE ACTIVITY
========================================================= */

async function createSupabaseActivity() {

    if (
        !supabaseClient ||
        !currentUser
    ) {

        return;

    }

    const activityType =
        normalizeActivityType(
            selectedActivity
        );

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
            "TERRAFIT: Activity creation error:",
            error
        );

        throw error;

    }

    currentActivityId =
        data.id;

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


    /* -----------------------------------------------------
       Update current location
    ----------------------------------------------------- */

    currentUserLocation = {

        latitude:
            latitude,

        longitude:
            longitude

    };

    locationReady =
        true;


    const coordinates = [
        latitude,
        longitude
    ];


    /* -----------------------------------------------------
       Update player marker
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
       Update accuracy circle
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
       Center map while activity is running
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


    /* -----------------------------------------------------
       Add route point
    ----------------------------------------------------- */

    if (
        activityRunning
    ) {

        addRoutePoint(
            latitude,
            longitude,
            position
        );

    }


    /* -----------------------------------------------------
       Update GPS status
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
    latitude,
    longitude,
    position
) {

    if (
        !activityRunning
    ) {

        return;

    }

    const now =
        Date.now();


    /* -----------------------------------------------------
       First point
    ----------------------------------------------------- */

    if (
        routeCoordinates.length === 0
    ) {

        routeCoordinates.push([
            latitude,
            longitude
        ]);

        lastPointTime =
            now;

        lastPointLat =
            latitude;

        lastPointLon =
            longitude;

        lastPosition =
            position;

        lastSpeedPoint = {

            latitude:
                latitude,

            longitude:
                longitude,

            time:
                now

        };


        /* Create route line */

        if (map) {

            routeLine =
                L.polyline(
                    routeCoordinates,
                    {
                        color:
                            "#0066ff",

                        weight:
                            5,

                        opacity:
                            0.9,

                        lineCap:
                            "round",

                        lineJoin:
                            "round"
                    }
                )
                .addTo(map);

        }

        return;

    }


    /* -----------------------------------------------------
       Distance from previous point
    ----------------------------------------------------- */

    const pointDistance =
        calculateDistance(
            lastPointLat,
            lastPointLon,
            latitude,
            longitude
        );


    /* -----------------------------------------------------
       Time from previous point
    ----------------------------------------------------- */

    const timeDifference =
        (
            now -
            lastPointTime
        ) / 1000;


    /* -----------------------------------------------------
       Ignore impossible / duplicate points
    ----------------------------------------------------- */

    if (
        pointDistance <= 0
    ) {

        return;

    }


    /* -----------------------------------------------------
       Calculate instantaneous speed
    ----------------------------------------------------- */

    let pointSpeed =
        0;

    if (
        timeDifference > 0
    ) {

        pointSpeed =
            (
                pointDistance /
                timeDifference
            ) *
            3600;

    }


    /* -----------------------------------------------------
       Reject suspicious GPS jumps
    ----------------------------------------------------- */

    const speedLimit =
        getSpeedLimit(
            selectedActivity
        );


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
                    speedLimit
            }
        );

        return;

    }


    /* -----------------------------------------------------
       Add valid point
    ----------------------------------------------------- */

    routeCoordinates.push([
        latitude,
        longitude
    ]);

    distance +=
        pointDistance;

    lastPointTime =
        now;

    lastPointLat =
        latitude;

    lastPointLon =
        longitude;

    lastPosition =
        position;


    /* -----------------------------------------------------
       Update route line
    ----------------------------------------------------- */

    if (routeLine) {

        routeLine.setLatLngs(
            routeCoordinates
        );

    }


    /* -----------------------------------------------------
       Calculate GPS speed
    ----------------------------------------------------- */

    currentSpeedKmh =
        calculateGpsSpeed(
            latitude,
            longitude,
            now
        );


    /* -----------------------------------------------------
       Update speed UI
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
       Update distance UI
    ----------------------------------------------------- */

    if (distanceDisplay) {

        distanceDisplay.textContent =
            distance.toFixed(2);

    }


    /* -----------------------------------------------------
       Save GPS point
    ----------------------------------------------------- */

    saveActivityPoint(
        latitude,
        longitude,
        currentSpeedKmh
    );


    /* -----------------------------------------------------
       Check territory capture
    ----------------------------------------------------- */

    if (
        typeof checkTerritoryCapture ===
        "function"
    ) {

        checkTerritoryCapture(
            latitude,
            longitude
        );

    }

}
/* =========================================================
   START ACTIVITY
========================================================= */

async function startActivity() {

    if (!currentUser) {

        showAuthMessage(
            "Please log in before starting an activity."
        );

        if (authOverlay) {

            authOverlay.classList.add(
                "active"
            );

        }

        switchAuthMode(
            "login"
        );

        return;

    }

    if (!locationReady) {

        showLocationSetup();

        return;

    }

    if (
        !("geolocation" in navigator)
    ) {

        alert(
            "GPS is not supported by this browser."
        );

        return;

    }

    activityRunning =
        true;

    seconds =
        0;

    distance =
        0;

    routeCoordinates =
        [];

    capturedTerritories =
        new Set();

    lastPosition =
        null;

    lastSpeedPoint =
        null;

    currentSpeedKmh =
        0;

    lastPointTime =
        0;

    lastPointLat =
        null;

    lastPointLon =
        null;

    currentActivityId =
        null;

    if (routeLine) {

        map.removeLayer(
            routeLine
        );

        routeLine =
            null;

    }

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

    }

    activityBtn.textContent =
        "FINISH ACTIVITY";

    activityBtn.classList.add(
        "danger-state"
    );

    setGPSStatus(
        "GPS TRACKING"
    );

    updateSpeedUI(
        0
    );

    await createSupabaseActivity();

    timerInterval =
        setInterval(
            updateTimer,
            1000
        );

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
        normalizeActivity(
            selectedActivity
        );

    try {

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

            return;

        }

        currentActivityId =
            data.id;

        console.log(
            "TERRAFIT: Activity created:",
            currentActivityId
        );

    }

    catch (error) {

        console.error(
            "TERRAFIT: Activity creation error:",
            error
        );

    }

}


/* =========================================================
   UPDATE PLAYER LOCATION
========================================================= */

function updatePlayerLocation(
    position
) {

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

    currentUserLocation = {

        latitude:
            latitude,

        longitude:
            longitude

    };

    locationReady =
        true;

    createOrUpdatePlayerMarker(
        coordinates
    );

    createAccuracyCircle(
        coordinates,
        accuracy
    );

    if (activityRunning) {

        addRoutePoint(
            latitude,
            longitude,
            timestamp
        );

        const speed =
            calculateGpsSpeed(
                latitude,
                longitude,
                timestamp
            );

        updateSpeedUI(
            speed
        );

        saveActivityPoint(
            latitude,
            longitude,
            timestamp
        );

    } else {

        if (map) {

            map.setView(
                coordinates,
                map.getZoom()
            );

        }

    }

    lastPosition =
        position;

    setGPSStatus(
        activityRunning
            ? "GPS ACTIVE"
            : "GPS READY"
    );

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
        timestamp || Date.now();

    /* FIRST POINT */

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

        return;

    }

    const timeDiff =
        (
            now -
            lastPointTime
        ) / 1000;

    if (
        timeDiff <= 0
    ) {

        return;

    }

    const segmentDistance =
        calculateDistance(
            lastPointLat,
            lastPointLon,
            lat,
            lon
        );

    const speed =
        (
            segmentDistance /
            timeDiff
        ) * 3600;

    const maxSpeed =
        getSpeedLimit();

    /*
       Ignore suspicious GPS jumps.
    */

    if (
        speed >
        maxSpeed
    ) {

        console.warn(
            `TERRAFIT: Suspicious speed detected: ${speed.toFixed(2)} km/h`
        );

        return;

    }

    routeCoordinates.push({

        lat:
            lat,

        lon:
            lon,

        time:
            now

    });

    distance +=
        segmentDistance;

    lastPointTime =
        now;

    lastPointLat =
        lat;

    lastPointLon =
        lon;

    updateDistanceDisplay();

    drawRoute();

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
                        "round"

                }
            )
            .addTo(map);

    } else {

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
        ) * 3600;

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

    const finalDistance =
        distance;

    const finalSeconds =
        seconds;

    const captured =
        capturedTerritories.size;

    const earnedXP =
        captured *
        100;

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

    if (activityBtn) {

        activityBtn.textContent =
            "START ACTIVITY";

        activityBtn.classList.remove(
            "danger-state"
        );

    }

    if (activityStatus) {

        activityStatus.textContent =
            "COMPLETED";

    }

    setGPSStatus(
        "LOCATION READY"
    );

    if (lastActivity) {

        lastActivity.textContent =
            "JUST NOW";

    }

    updateSpeedUI(
        0
    );

    currentActivityId =
        null;

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