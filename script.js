/* =========================================================
   TERRAFIT
   GPS + MAP + ACTIVITY + TERRITORY + AUTH + LOGOUT
   Tactical Fitness + Territory Grid Protocol
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const startBtn =
    document.getElementById("startBtn");

const demoBtn =
    document.getElementById("demoBtn");

const landingPage =
    document.getElementById("landingPage");

const dashboard =
    document.getElementById("dashboard");

const activityBtn =
    document.getElementById("activityBtn");

const activityStatus =
    document.getElementById("activityStatus");

const gpsStatus =
    document.getElementById("gpsStatus");

const headerGpsText =
    document.getElementById("headerGpsText");

const distanceDisplay =
    document.getElementById("distance");

const timerDisplay =
    document.getElementById("timer");

const territoryCount =
    document.getElementById("territoryCount");

const xpCount =
    document.getElementById("xpCount");

const activityCount =
    document.getElementById("activityCount");

const streakCount =
    document.getElementById("streakCount");

const territoryStrength =
    document.getElementById("territoryStrength");

const lastActivity =
    document.getElementById("lastActivity");

const territoryStatus =
    document.getElementById("territoryStatus");

const playerName =
    document.getElementById("playerName");


/* =========================================================
   LEADERBOARD
========================================================= */

const leaderboardPlayerName =
    document.getElementById(
        "leaderboardPlayerName"
    );

const leaderboardAvatarLetter =
    document.getElementById(
        "leaderboardAvatarLetter"
    );

const leaderboardTerritory =
    document.getElementById(
        "leaderboardTerritory"
    );

const leaderboardDistance =
    document.getElementById(
        "leaderboardDistance"
    );

const leaderboardXP =
    document.getElementById(
        "leaderboardXP"
    );


/* =========================================================
   PROFILE
========================================================= */

const profilePlayerName =
    document.getElementById(
        "profilePlayerName"
    );

const profileAvatarLetter =
    document.getElementById(
        "profileAvatarLetter"
    );

const profileDistanceStat =
    document.getElementById(
        "profileDistanceStat"
    );

const profileTerritoryStat =
    document.getElementById(
        "profileTerritoryStat"
    );

const profileStreakStat =
    document.getElementById(
        "profileStreakStat"
    );

const profileXpProgress =
    document.getElementById(
        "profileXpProgress"
    );

const profileProgressBar =
    document.getElementById(
        "profileProgressBar"
    );


/* =========================================================
   NAVIGATION
========================================================= */

const brandLogo =
    document.getElementById("brandLogo");

const mobileMenuToggle =
    document.getElementById(
        "mobileMenuToggle"
    );

const mobileNavDrawer =
    document.getElementById(
        "mobileNavDrawer"
    );

const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let map = null;

let playerMarker = null;

let accuracyCircle = null;

let routeLine = null;

let watchId = null;

let timerInterval = null;

let activityRunning = false;

let seconds = 0;

let distance = 0;

let selectedActivity = "Walking";

let routeCoordinates = [];

let territoryCells = [];

let capturedTerritories = new Set();

let lastPosition = null;

let currentUserLocation = null;

let locationReady = false;


/* =========================================================
   INITIAL MAP VIEW
========================================================= */

const initialMapView = [
    20,
    78
];


/* =========================================================
   OPEN DASHBOARD
========================================================= */

function openDashboardView(
    targetSectionId = null
) {

    if (landingPage) {

        landingPage.style.display =
            "none";

    }

    if (dashboard) {

        dashboard.style.display =
            "block";

    }


    if (targetSectionId) {

        const targetElement =
            document.getElementById(
                targetSectionId
            );

        if (targetElement) {

            targetElement.scrollIntoView({
                behavior: "smooth"
            });

        }

    }


    setTimeout(() => {

        if (!map) {

            initializeMap();

        } else {

            map.invalidateSize();

        }

    }, 300);

}


/* =========================================================
   START BUTTON
========================================================= */

if (startBtn) {

    startBtn.addEventListener(
        "click",
        () => {

            openDashboardView(
                "activity-section"
            );

        }
    );

}


/* =========================================================
   EXPLORE BUTTON
========================================================= */

if (demoBtn) {

    demoBtn.addEventListener(
        "click",
        () => {

            const howSection =
                document.getElementById(
                    "how"
                );

            if (howSection) {

                howSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


/* =========================================================
   BRAND LOGO
========================================================= */

if (brandLogo) {

    brandLogo.addEventListener(
        "click",
        () => {

            if (dashboard) {

                dashboard.style.display =
                    "none";

            }

            if (landingPage) {

                landingPage.style.display =
                    "grid";

                landingPage.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function setActiveNavLink(
    activeLinkId
) {

    navLinks.forEach(link => {

        link.classList.remove(
            "active"
        );

        if (
            link.id ===
            activeLinkId
        ) {

            link.classList.add(
                "active"
            );

        }

    });

}


navLinks.forEach(link => {

    link.addEventListener(
        "click",
        event => {

            const targetId =
                link.getAttribute(
                    "href"
                );

            if (
                targetId &&
                targetId.startsWith("#")
            ) {

                event.preventDefault();

                const targetElement =
                    document.querySelector(
                        targetId
                    );

                if (targetElement) {

                    targetElement.scrollIntoView({
                        behavior: "smooth"
                    });

                }

                setActiveNavLink(
                    link.id
                );

            }

        }
    );

});


/* =========================================================
   MOBILE MENU
========================================================= */

if (
    mobileMenuToggle &&
    mobileNavDrawer
) {

    mobileMenuToggle.addEventListener(
        "click",
        () => {

            mobileNavDrawer.classList.toggle(
                "open"
            );

        }
    );

}


/* =========================================================
   ACTIVITY TYPE SELECTION
========================================================= */

const activityTypes =
    document.querySelectorAll(
        ".activity-type"
    );


activityTypes.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            if (activityRunning) {

                return;

            }


            activityTypes.forEach(
                btn => {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


            button.classList.add(
                "active"
            );


            if (button.dataset.type) {

                selectedActivity =
                    button.dataset.type;

            }

        }
    );

});


/* =========================================================
   INITIALIZE MAP
========================================================= */

function initializeMap() {

    const mapElement =
        document.getElementById(
            "realMap"
        );


    if (!mapElement) {

        return;

    }


    if (map) {

        map.invalidateSize();

        return;

    }


    map =
        L.map(
            "realMap",
            {
                zoomControl: true,
                attributionControl: true
            }
        ).setView(
            initialMapView,
            5
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
    ).addTo(map);


    setGPSStatus(
        "LOCATION REQUIRED"
    );


    showLocationSetup();

}


/* =========================================================
   LOCATION SETUP
========================================================= */

function showLocationSetup() {

    const existing =
        document.getElementById(
            "locationSetup"
        );


    if (existing) {

        return;

    }


    const setup =
        document.createElement(
            "div"
        );


    setup.id =
        "locationSetup";


    setup.innerHTML = `

        <div style="
            position:fixed;
            inset:0;
            background:rgba(4,4,6,.85);
            backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
            z-index:99999;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
        ">

            <div style="
                width:min(460px,100%);
                background:#0e0e13;
                border:1px solid rgba(255,255,255,.14);
                border-radius:14px;
                padding:34px;
                color:#f4f4f6;
                font-family:'Inter',-apple-system,sans-serif;
                box-shadow:0 25px 80px rgba(0,0,0,.85);
            ">

                <div style="
                    font-family:'Space Grotesk',monospace;
                    font-size:11px;
                    color:#00ff88;
                    font-weight:700;
                    letter-spacing:2px;
                    margin-bottom:10px;
                    text-transform:uppercase;
                ">
                    TERRAFIT SATELLITE MESH
                </div>


                <h2 style="
                    font-family:'Space Grotesk',monospace;
                    font-size:26px;
                    font-weight:800;
                    margin:0 0 10px;
                    color:#fff;
                ">
                    Initialize Sector
                </h2>


                <p style="
                    color:#9e9ea8;
                    font-size:13px;
                    line-height:1.6;
                    margin-bottom:24px;
                ">
                    TERRAFIT requires your GPS coordinates
                    to render your local grid mesh and
                    convert your real-world motion into territory.
                </p>


                <button
                    id="detectLocationBtn"
                    style="
                        width:100%;
                        padding:15px;
                        background:#00ff88;
                        color:#000;
                        border:none;
                        border-radius:10px;
                        font-family:'Space Grotesk',monospace;
                        font-weight:800;
                        font-size:12px;
                        letter-spacing:1px;
                        cursor:pointer;
                        box-shadow:0 4px 20px rgba(0,255,136,.3);
                    "
                >
                    📍 ACQUIRE GPS LOCK
                </button>


                <div style="
                    text-align:center;
                    margin:18px 0;
                    color:#5e5e6c;
                    font-family:'Space Grotesk',monospace;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:2px;
                ">
                    OR SPECIFY SECTOR MANUALLY
                </div>


                <div style="
                    display:flex;
                    gap:8px;
                ">

                    <input
                        id="manualLocationInput"
                        type="text"
                        placeholder="Enter city or district..."
                        style="
                            flex:1;
                            padding:13px 16px;
                            background:#14141b;
                            color:#fff;
                            border:1px solid rgba(255,255,255,.1);
                            border-radius:8px;
                            font-size:13px;
                            outline:none;
                        "
                    >


                    <button
                        id="manualLocationBtn"
                        style="
                            padding:13px 18px;
                            background:#1c1c24;
                            color:#fff;
                            border:1px solid rgba(255,255,255,.14);
                            border-radius:8px;
                            font-family:'Space Grotesk',monospace;
                            font-weight:700;
                            font-size:12px;
                            cursor:pointer;
                        "
                    >
                        SET
                    </button>

                </div>


                <div
                    id="locationMessage"
                    style="
                        min-height:20px;
                        margin-top:14px;
                        color:#9e9ea8;
                        font-size:12px;
                        text-align:center;
                    "
                ></div>

            </div>

        </div>

    `;


    document.body.appendChild(
        setup
    );


    const detectButton =
        document.getElementById(
            "detectLocationBtn"
        );

    const manualButton =
        document.getElementById(
            "manualLocationBtn"
        );

    const input =
        document.getElementById(
            "manualLocationInput"
        );


    if (detectButton) {

        detectButton.addEventListener(
            "click",
            requestUserLocation
        );

    }


    if (manualButton) {

        manualButton.addEventListener(
            "click",
            manualLocationSearch
        );

    }


    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    manualLocationSearch();

                }

            }
        );

    }

}


/* =========================================================
   REQUEST REAL GPS LOCATION
========================================================= */

function requestUserLocation() {

    if (
        !("geolocation" in navigator)
    ) {

        showLocationMessage(
            "GPS is not supported by this browser."
        );

        return;

    }


    const button =
        document.getElementById(
            "detectLocationBtn"
        );


    if (button) {

        button.textContent =
            "ACQUIRING SATELLITES...";

        button.disabled =
            true;

    }


    showLocationMessage(
        "Awaiting geolocation permission..."
    );


    setGPSStatus(
        "REQUESTING LOCATION"
    );


    navigator.geolocation.getCurrentPosition(

        position => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            const accuracy =
                position.coords.accuracy;


            setUserLocation(
                latitude,
                longitude,
                accuracy
            );


            showLocationMessage(
                "GPS Lock verified."
            );


            setTimeout(
                () => {

                    closeLocationSetup();

                },
                600
            );

        },


        error => {

            handleGPSError(
                error
            );

        },


        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

}


/* =========================================================
   SET USER LOCATION
========================================================= */

function setUserLocation(
    latitude,
    longitude,
    accuracy = 20
) {

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


    if (!map) {

        return;

    }


    map.setView(
        coordinates,
        16,
        {
            animate: true
        }
    );


    createOrUpdatePlayerMarker(
        coordinates
    );


    createAccuracyCircle(
        coordinates,
        accuracy
    );


    createTerritoriesAroundUser();


    setGPSStatus(
        "GPS READY"
    );

}


/* =========================================================
   PLAYER MARKER
========================================================= */

function createOrUpdatePlayerMarker(
    coordinates
) {

    if (!map) {

        return;

    }


    const playerIcon =
        L.divIcon({

            className:
                "player-location",

            html: `

                <div style="
                    width:20px;
                    height:20px;
                    background:#00ff88;
                    border:3px solid #000;
                    border-radius:50%;
                    box-shadow:
                        0 0 14px rgba(0,255,136,.9),
                        0 0 0 6px rgba(0,255,136,.25);
                "></div>

            `,

            iconSize:
                [20,20],

            iconAnchor:
                [10,10]

        });


    if (!playerMarker) {

        playerMarker =
            L.marker(
                coordinates,
                {
                    icon:
                        playerIcon
                }
            )
            .addTo(map);


        playerMarker.bindPopup(`
            <div style="
                font-family:'Space Grotesk',monospace;
                padding:4px;
            ">
                <b style="color:#00ff88;">
                    YOU ARE HERE
                </b>
                <br>
                <span style="
                    font-size:11px;
                    color:#aaa;
                ">
                    TERRAFIT Live Operative
                </span>
            </div>
        `);

    } else {

        playerMarker.setLatLng(
            coordinates
        );

    }

}


/* =========================================================
   ACCURACY CIRCLE
========================================================= */

function createAccuracyCircle(
    coordinates,
    radius
) {

    if (!map) {

        return;

    }


    if (!accuracyCircle) {

        accuracyCircle =
            L.circle(
                coordinates,
                {
                    radius:
                        radius,

                    color:
                        "#00ff88",

                    weight:
                        1,

                    fillColor:
                        "#00ff88",

                    fillOpacity:
                        0.08
                }
            )
            .addTo(map);

    } else {

        accuracyCircle.setLatLng(
            coordinates
        );

        accuracyCircle.setRadius(
            radius
        );

    }

}


/* =========================================================
   MANUAL LOCATION SEARCH
========================================================= */

async function manualLocationSearch() {

    const input =
        document.getElementById(
            "manualLocationInput"
        );


    if (!input) {

        return;

    }


    const query =
        input.value.trim();


    if (!query) {

        showLocationMessage(
            "Please enter a city or location."
        );

        return;

    }


    showLocationMessage(
        "Searching coordinates..."
    );


    const button =
        document.getElementById(
            "manualLocationBtn"
        );


    if (button) {

        button.disabled =
            true;

    }


    try {

        const response =
            await fetch(

                "https://nominatim.openstreetmap.org/search?" +

                new URLSearchParams({

                    q:
                        query,

                    format:
                        "json",

                    limit:
                        "1"

                })

            );


        if (!response.ok) {

            throw new Error(
                "Location search failed."
            );

        }


        const results =
            await response.json();


        if (
            !results ||
            results.length === 0
        ) {

            showLocationMessage(
                "Location not found. Try another city."
            );

            return;

        }


        const result =
            results[0];


        const latitude =
            parseFloat(
                result.lat
            );

        const longitude =
            parseFloat(
                result.lon
            );


        setUserLocation(
            latitude,
            longitude,
            25
        );


        showLocationMessage(
            "Location locked."
        );


        setTimeout(
            () => {

                closeLocationSetup();

            },
            600
        );

    }

    catch (error) {

        console.error(
            error
        );


        showLocationMessage(
            "Network error. Verify internet connection."
        );

    }

    finally {

        if (button) {

            button.disabled =
                false;

        }

    }

}


/* =========================================================
   LOCATION MESSAGE
========================================================= */

function showLocationMessage(
    message
) {

    const element =
        document.getElementById(
            "locationMessage"
        );


    if (element) {

        element.textContent =
            message;

    }

}


/* =========================================================
   CLOSE LOCATION SETUP
========================================================= */

function closeLocationSetup() {

    const setup =
        document.getElementById(
            "locationSetup"
        );


    if (setup) {

        setup.remove();

    }

}


/* =========================================================
   CREATE TERRITORY GRID
========================================================= */

function createTerritoriesAroundUser() {

    if (!map) {

        return;

    }


    territoryCells.forEach(
        territory => {

            map.removeLayer(
                territory.layer
            );

        }
    );


    territoryCells = [];


    if (!currentUserLocation) {

        return;

    }


    const centerLat =
        currentUserLocation.latitude;

    const centerLng =
        currentUserLocation.longitude;


    const cellSize =
        0.0015;


    for (
        let row = -5;
        row <= 5;
        row++
    ) {

        for (
            let col = -5;
            col <= 5;
            col++
        ) {

            const south =
                centerLat +
                row * cellSize;


            const west =
                centerLng +
                col * cellSize;


            const north =
                south +
                cellSize;


            const east =
                west +
                cellSize;


            const bounds = [

                [
                    south,
                    west
                ],

                [
                    north,
                    east
                ]

            ];


            const owner =
                "neutral";


            const rectangle =
                L.rectangle(
                    bounds,
                    getTerritoryStyle(
                        owner
                    )
                )
                .addTo(map);


            const territory = {

                layer:
                    rectangle,

                row:
                    row,

                col:
                    col,

                owner:
                    owner,

                strength:
                    0

            };


            territoryCells.push(
                territory
            );


            rectangle.on(
                "click",
                () => {

                    showTerritoryInfo(
                        territory
                    );

                }
            );

        }

    }

}


/* =========================================================
   TERRITORY STYLE
========================================================= */

function getTerritoryStyle(
    owner
) {

    if (
        owner ===
        "player"
    ) {

        return {

            color:
                "#00ff88",

            weight:
                2,

            fillColor:
                "#00ff88",

            fillOpacity:
                0.35

        };

    }


    if (
        owner ===
        "enemy"
    ) {

        return {

            color:
                "#ff4757",

            weight:
                2,

            fillColor:
                "#ff4757",

            fillOpacity:
                0.30

        };

    }


    return {

        color:
            "rgba(255,255,255,.12)",

        weight:
            1,

        fillColor:
            "#000000",

        fillOpacity:
            0.12

    };

}


/* =========================================================
   TERRITORY INFO POPUP
========================================================= */

function showTerritoryInfo(
    territory
) {

    let ownerName =
        "NEUTRAL (UNCLAIMED)";

    let badgeColor =
        "#9e9ea8";


    if (
        territory.owner ===
        "player"
    ) {

        ownerName =
            "YOUR TERRITORY";

        badgeColor =
            "#00ff88";

    }


    if (
        territory.owner ===
        "enemy"
    ) {

        ownerName =
            "OPPONENT SECTOR";

        badgeColor =
            "#ff4757";

    }


    const popup = `

        <div style="
            min-width:180px;
            font-family:'Space Grotesk',monospace;
            padding:6px;
        ">

            <div style="
                font-size:10px;
                color:#666;
                letter-spacing:1px;
                margin-bottom:4px;
            ">
                SECTOR GRID CELL
            </div>


            <strong style="
                font-size:14px;
                color:#fff;
                display:block;
                margin-bottom:8px;
            ">
                ZONE [${territory.row}, ${territory.col}]
            </strong>


            <div style="
                font-size:12px;
                margin-bottom:4px;
            ">
                <b>Owner:</b>

                <span style="
                    color:${badgeColor};
                    font-weight:700;
                ">
                    ${ownerName}
                </span>

            </div>


            <div style="
                font-size:12px;
            ">
                <b>Fortification:</b>
                ${territory.strength}%
            </div>

        </div>

    `;


    territory.layer
        .bindPopup(
            popup
        )
        .openPopup();

}


/* =========================================================
   ACTIVITY CONTROLS
========================================================= */

if (activityBtn) {

    activityBtn.addEventListener(
        "click",
        () => {

            if (!activityRunning) {

                startActivity();

            } else {

                finishActivity();

            }

        }
    );

}


/* =========================================================
   START ACTIVITY
========================================================= */

function startActivity() {

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
            longitude
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
        "GPS ACTIVE"
    );

}


/* =========================================================
   ADD ROUTE POINT
========================================================= */

function addRoutePoint(
    latitude,
    longitude
) {

    const point = [
        latitude,
        longitude
    ];


    if (
        routeCoordinates.length ===
        0
    ) {

        routeCoordinates.push(
            point
        );


        routeLine =
            L.polyline(
                routeCoordinates,
                {

                    color:
                        "#00ff88",

                    weight:
                        4,

                    opacity:
                        0.95

                }
            )
            .addTo(map);


        map.panTo(
            point
        );


        return;

    }


    const previous =
        routeCoordinates[
            routeCoordinates.length - 1
        ];


    const movement =
        calculateDistance(

            previous[0],
            previous[1],

            latitude,
            longitude

        );


    /*
        Ignore GPS noise
    */

    if (
        movement < 0.003
    ) {

        return;

    }


    /*
        Ignore impossible GPS jump
    */

    if (
        movement > 1
    ) {

        return;

    }


    distance +=
        movement;


    routeCoordinates.push(
        point
    );


    if (routeLine) {

        routeLine.setLatLngs(
            routeCoordinates
        );

    }


    if (distanceDisplay) {

        distanceDisplay.textContent =
            distance.toFixed(2) +
            " KM";

    }


    checkRouteTerritories(
        point
    );


    if (map) {

        map.panTo(
            point,
            {
                animate:
                    true,

                duration:
                    0.3
            }
        );

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
            lat2 - lat1
        );


    const dLon =
        toRadians(
            lon2 - lon1
        );


    const a =

        Math.sin(
            dLat / 2
        ) ** 2 +

        Math.cos(
            toRadians(lat1)
        ) *

        Math.cos(
            toRadians(lat2)
        ) *

        Math.sin(
            dLon / 2
        ) ** 2;


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return (
        earthRadius *
        c
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

function captureTerritory(
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


    /*
        Territory count
    */

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


    /*
        XP
    */

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


    /*
        XP Progress
    */

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
                10,
                xpPercent
            )}%`;

    }


    /*
        Status
    */

    if (territoryStatus) {

        territoryStatus.textContent =
            "CAPTURED";

    }


    if (territoryStrength) {

        territoryStrength.textContent =
            "50%";

    }


    /*
        Popup
    */

    territory.layer
        .bindPopup(`

            <div style="
                font-family:'Space Grotesk',monospace;
                padding:4px;
            ">

                <b style="
                    color:#00ff88;
                ">
                    TERRITORY CAPTURED!
                </b>

                <br>

                <span style="
                    font-size:11px;
                    color:#fff;
                ">
                    +100 XP Sovereign Bonus
                </span>

            </div>

        `)
        .openPopup();

}


/* =========================================================
   FINISH ACTIVITY
========================================================= */

function finishActivity() {

    activityRunning =
        false;


    /*
        Stop GPS
    */

    if (
        watchId !== null
    ) {

        navigator.geolocation.clearWatch(
            watchId
        );

        watchId =
            null;

    }


    /*
        Stop timer
    */

    if (
        timerInterval !== null
    ) {

        clearInterval(
            timerInterval
        );

        timerInterval =
            null;

    }


    /*
        Total distance
    */

    let totalActivity =
        parseFloat(
            activityCount
                ? activityCount.textContent
                : "0"
        ) || 0;


    totalActivity +=
        distance;


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


    /*
        Streak
    */

    if (
        streakCount &&
        distance > 0
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


    /*
        Reset activity UI
    */

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


    const captured =
        capturedTerritories.size;


    const earnedXP =
        captured *
        100;


    alert(

        "TERRAFIT MISSION COMPLETED!\n\n" +

        "Activity Type: " +
        selectedActivity +

        "\nDistance Tracked: " +
        distance.toFixed(2) +
        " KM" +

        "\nTime Elapsed: " +
        formatTime(seconds) +

        "\nTerritories Conquered: " +
        captured +
        " Cells" +

        "\nXP Earned: +" +
        earnedXP +
        " XP"

    );

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
   GPS ERROR HANDLING
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


/* =========================================================
   AUTH SYSTEM
========================================================= */

const loginBtn =
    document.getElementById(
        "loginBtn"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


const authOverlay =
    document.getElementById(
        "authOverlay"
    );


const authClose =
    document.getElementById(
        "authClose"
    );


const loginTab =
    document.getElementById(
        "loginTab"
    );


const signupTab =
    document.getElementById(
        "signupTab"
    );


const authForm =
    document.getElementById(
        "authForm"
    );


const authName =
    document.getElementById(
        "authName"
    );


const authEmail =
    document.getElementById(
        "authEmail"
    );


const authPassword =
    document.getElementById(
        "authPassword"
    );


const authConfirmPassword =
    document.getElementById(
        "authConfirmPassword"
    );


const authMessage =
    document.getElementById(
        "authMessage"
    );


const authTitle =
    document.getElementById(
        "authTitle"
    );


const authSubtitle =
    document.getElementById(
        "authSubtitle"
    );


const authSubmit =
    document.getElementById(
        "authSubmit"
    );


const nameField =
    document.getElementById(
        "nameField"
    );


const confirmPasswordField =
    document.getElementById(
        "confirmPasswordField"
    );


const loginOptions =
    document.getElementById(
        "loginOptions"
    );


const demoLogin =
    document.getElementById(
        "demoLogin"
    );


const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );


let authMode =
    "login";


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
        event => {

            event.preventDefault();


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
                    password !==
                    confirmPassword
                ) {

                    showAuthMessage(
                        "Credentials mismatch: Passwords do not match."
                    );

                    return;

                }


                const user = {

                    name:
                        name,

                    email:
                        email,

                    password:
                        password

                };


                localStorage.setItem(
                    "terraFitUser",
                    JSON.stringify(
                        user
                    )
                );


                showAuthMessage(
                    "Operator profile registered successfully."
                );


                setTimeout(
                    () => {

                        closeAuth();

                        showLoggedInUser(
                            name
                        );

                    },
                    700
                );


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


            const savedUser =
                localStorage.getItem(
                    "terraFitUser"
                );


            if (!savedUser) {

                showAuthMessage(
                    "No operator profile found. Sign up first."
                );

                return;

            }


            let user;


            try {

                user =
                    JSON.parse(
                        savedUser
                    );

            }

            catch {

                showAuthMessage(
                    "Operator data corrupted."
                );

                return;

            }


            if (
                user.email !==
                email
            ) {

                showAuthMessage(
                    "Email address not recognized."
                );

                return;

            }


            if (
                user.password &&
                user.password !==
                password
            ) {

                showAuthMessage(
                    "Invalid security credentials."
                );

                return;

            }


            showAuthMessage(
                "Operator authorization confirmed."
            );


            setTimeout(
                () => {

                    closeAuth();

                    showLoggedInUser(
                        user.name
                    );

                },
                700
            );

        }
    );

}


/* =========================================================
   DEMO LOGIN
========================================================= */

if (demoLogin) {

    demoLogin.addEventListener(
        "click",
        () => {

            const demoUser = {

                name:
                    "DEMO OPERATOR",

                email:
                    "operator@terrafit.app",

                password:
                    "demo"

            };


            localStorage.setItem(
                "terraFitUser",
                JSON.stringify(
                    demoUser
                )
            );


            showAuthMessage(
                "Demo operator credentials activated."
            );


            setTimeout(
                () => {

                    closeAuth();

                    showLoggedInUser(
                        demoUser.name
                    );

                },
                500
            );

        }
    );

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        () => {

            showAuthMessage(
                "Tactical key recovery protocol dispatched to support."
            );

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
        name.trim();


    console.log(
        "Logged in as:",
        safeName
    );


    if (loginBtn) {

        loginBtn.textContent =
            safeName.toUpperCase();

    }


    /*
        SHOW LOGOUT BUTTON
    */

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
   LOGOUT SYSTEM
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            console.log(
                "TERRAFIT: Logout requested."
            );


            /* =========================
               STOP ACTIVE GPS
            ========================= */

            if (
                activityRunning
            ) {

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

            }


            /* =========================
               CLEAR SAVED SESSION
            ========================= */

            localStorage.removeItem(
                "terraFitUser"
            );


            /* =========================
               RESET USER UI
            ========================= */

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


            /* =========================
               CLOSE LOCATION MODAL
            ========================= */

            closeLocationSetup();


            /* =========================
               CLOSE MOBILE MENU
            ========================= */

            if (mobileNavDrawer) {

                mobileNavDrawer.classList.remove(
                    "open"
                );

            }


            /* =========================
               RESET NAVIGATION
            ========================= */

            navLinks.forEach(
                link => {

                    link.classList.remove(
                        "active"
                    );

                }
            );


            /* =========================
               RETURN TO LANDING
            ========================= */

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
   AUTO LOGIN
========================================================= */

const savedUser =
    localStorage.getItem(
        "terraFitUser"
    );


if (savedUser) {

    try {

        const user =
            JSON.parse(
                savedUser
            );


        if (
            user.name
        ) {

            showLoggedInUser(
                user.name
            );

        }

    }

    catch (error) {

        console.error(
            "User data error:",
            error
        );

    }

}


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape" &&

            authOverlay &&

            authOverlay.classList.contains(
                "active"
            )
        ) {

            closeAuth();

        }

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

console.log(
    "TERRAFIT initialized successfully."
);
/* =========================================================
   TERRAFIT LOADING SCREEN
   ========================================================= */

const terraLoading = document.getElementById("terraLoading");
const loadingProgressBar = document.getElementById("loadingProgressBar");
const loadingPercent = document.getElementById("loadingPercent");
const loadingStatus = document.getElementById("loadingStatus");

const safetyMessage = document.getElementById("safetyMessage");
const safetySubMessage = document.getElementById("safetySubMessage");
const safetyDots = document.querySelectorAll(".safety-dots i");


/* SAFETY MESSAGES */

const safetyMessages = [
    {
        title: "DON'T WALK ON BUSY ROADS",
        text: "Use sidewalks, footpaths, or designated safe routes."
    },

    {
        title: "FOLLOW TRAFFIC SIGNALS",
        text: "Cross only at safe and designated crossings."
    },

    {
        title: "STAY AWARE OF YOUR SURROUNDINGS",
        text: "Keep your attention on traffic and your environment."
    },

    {
        title: "AVOID UNSAFE OR POORLY LIT AREAS",
        text: "Choose familiar, well-lit routes whenever possible."
    },

    {
        title: "DON'T USE YOUR PHONE WHILE MOVING",
        text: "Stop somewhere safe before checking your phone."
    },

    {
        title: "SAFETY > TERRITORY",
        text: "Your safety always comes before capturing territory."
    },

    {
        title: "KNOW YOUR LIMITS",
        text: "Take a break if you feel tired or uncomfortable."
    },

    {
        title: "RIDE RESPONSIBLY",
        text: "If cycling, wear a properly fitted helmet and follow local rules."
    }
];


/* SHUFFLE */

function shuffleSafetyMessages() {

    const shuffled = [...safetyMessages];

    for (let i = shuffled.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];
    }

    return shuffled;
}


let shuffledSafety = shuffleSafetyMessages();

let safetyIndex = 0;


/* SHOW SAFETY MESSAGE */

function showSafetyMessage(index) {

    if (!safetyMessage || !safetySubMessage) return;

    const message = shuffledSafety[index];

    safetyMessage.classList.add("change");

    setTimeout(() => {

        safetyMessage.textContent = message.title;
        safetySubMessage.textContent = message.text;

        safetyMessage.classList.remove("change");

    }, 250);


    safetyDots.forEach((dot, i) => {

        dot.classList.toggle(
            "active",
            i === index % safetyDots.length
        );

    });
}


/* CHANGE MESSAGE EVERY 2.5 SECONDS */

let safetyInterval = setInterval(() => {

    safetyIndex++;

    if (safetyIndex >= shuffledSafety.length) {

        shuffledSafety = shuffleSafetyMessages();

        safetyIndex = 0;
    }

    showSafetyMessage(safetyIndex);

}, 2500);


/* LOADING */

function startTerraFitLoading() {

    if (!terraLoading) return;

    let progress = 0;

    const loadingSteps = [
        "INITIALIZING TERRAFIT...",
        "CONNECTING GPS...",
        "LOADING MAP ENGINE...",
        "BUILDING TERRITORY GRID...",
        "CHECKING SAFETY PROTOCOL...",
        "READY."
    ];

    let step = 0;

    const loadingInterval = setInterval(() => {

        progress += Math.floor(
            Math.random() * 5
        ) + 2;

        if (progress > 100) {
            progress = 100;
        }

        if (loadingProgressBar) {
            loadingProgressBar.style.width =
                progress + "%";
        }

        if (loadingPercent) {
            loadingPercent.textContent =
                progress + "%";
        }


        /* STATUS TEXT */

        if (progress > 15) step = 1;
        if (progress > 35) step = 2;
        if (progress > 55) step = 3;
        if (progress > 75) step = 4;
        if (progress >= 100) step = 5;

        if (loadingStatus) {
            loadingStatus.textContent =
                loadingSteps[step];
        }


        /* FINISH */

        if (progress >= 100) {

            clearInterval(loadingInterval);

            setTimeout(() => {

                terraLoading.classList.add("hide");

            }, 500);
        }

    }, 100);
}


/* RUN WHEN PAGE LOADS */

window.addEventListener("load", () => {

    shuffledSafety = shuffleSafetyMessages();

    safetyIndex = 0;

    showSafetyMessage(0);

    startTerraFitLoading();

});
