/* =========================================================
   TERRAFIT
   GPS + MAP + ACTIVITY + TERRITORY + AUTH
   Supabase + Tactical Fitness + Territory Grid Protocol
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://bfkedcihkgkqlqedybkk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_N2xvqLd_mj9M5npcHGoIPg_zABk4NQt";

let supabaseClient = null;

if (window.supabase) {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    console.log(
        "TERRAFIT: Supabase client initialized."
    );

} else {

    console.error(
        "TERRAFIT: Supabase library not loaded. " +
        "Make sure the Supabase CDN script is before script.js."
    );

}


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
   SPEED MONITOR
========================================================= */

const liveSpeedDisplay =
    document.getElementById("liveSpeed");

const speedLimitDisplay =
    document.getElementById("speedLimit");

const speedProgressBar =
    document.getElementById("speedProgressBar");

const speedActivityDisplay =
    document.getElementById("speedActivity");

const speedStatusText =
    document.getElementById("speedStatusText");

const speedStatusDot =
    document.getElementById("speedStatusDot");

const speedMonitorCard =
    document.querySelector(".speed-monitor-card");


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
   AUTH ELEMENTS
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

const forgotPassword =
    document.getElementById(
        "forgotPassword"
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

let currentUser = null;

let currentProfile = null;

let currentActivityId = null;


/* =========================================================
   GPS / SPEED VARIABLES
========================================================= */

let currentSpeedKmh = 0;

let lastSpeedPoint = null;

let lastPointTime = 0;

let lastPointLat = null;

let lastPointLon = null;


/* =========================================================
   SPEED LIMITS
========================================================= */

const TERRAFIT_SPEED_LIMITS = {

    walking: 6,

    running: 11,

    cycling: 30

};


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
   EXPLORE / HOW IT WORKS
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

                if (mobileNavDrawer) {

                    mobileNavDrawer.classList.remove(
                        "open"
                    );

                }

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
   ACTIVITY TYPE
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

            updateSpeedUI(
                currentSpeedKmh
            );

        }
    );

});


/* =========================================================
   NORMALIZE ACTIVITY
========================================================= */

function normalizeActivity(
    activity
) {

    const value =
        String(
            activity || "walking"
        )
        .trim()
        .toLowerCase();

    if (value === "running") {

        return "running";

    }

    if (value === "cycling") {

        return "cycling";

    }

    return "walking";

}


/* =========================================================
   DISPLAY ACTIVITY NAME
========================================================= */

function getActivityName() {

    const activity =
        normalizeActivity(
            selectedActivity
        );

    if (activity === "running") {

        return "RUNNING";

    }

    if (activity === "cycling") {

        return "CYCLING";

    }

    return "WALKING";

}


/* =========================================================
   GET SPEED LIMIT
========================================================= */

function getSpeedLimit() {

    return (
        TERRAFIT_SPEED_LIMITS[
            normalizeActivity(
                selectedActivity
            )
        ] || 6
    );

}


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

    if (typeof L === "undefined") {

        console.error(
            "TERRAFIT: Leaflet library not loaded."
        );

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
        )
        .setView(
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
    )
    .addTo(map);

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
            background:rgba(15,23,42,.6);
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
                background:#ffffff;
                border:1px solid rgba(15,23,42,.12);
                border-radius:14px;
                padding:34px;
                color:#0f172a;
                font-family:'Inter',-apple-system,sans-serif;
                box-shadow:0 25px 80px rgba(15,23,42,.2);
            ">

                <div style="
                    font-family:'Space Grotesk',monospace;
                    font-size:11px;
                    color:#0066ff;
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
                    color:#0f172a;
                ">
                    Initialize Sector
                </h2>

                <p style="
                    color:#475569;
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
                        background:#0066ff;
                        color:#fff;
                        border:none;
                        border-radius:10px;
                        font-family:'Space Grotesk',monospace;
                        font-weight:800;
                        font-size:12px;
                        letter-spacing:1px;
                        cursor:pointer;
                        box-shadow:0 4px 20px rgba(0,102,255,.3);
                    "
                >
                    📍 ACQUIRE GPS LOCK
                </button>

                <div style="
                    text-align:center;
                    margin:18px 0;
                    color:#94a3b8;
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
                            background:#f8fafc;
                            color:#0f172a;
                            border:1px solid rgba(15,23,42,.15);
                            border-radius:8px;
                            font-size:13px;
                            outline:none;
                        "
                    >

                    <button
                        id="manualLocationBtn"
                        style="
                            padding:13px 18px;
                            background:#f1f5f9;
                            color:#0f172a;
                            border:1px solid rgba(15,23,42,.15);
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
                        color:#475569;
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
   REQUEST GPS
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
                closeLocationSetup,
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
                    background:#0066ff;
                    border:3px solid #ffffff;
                    border-radius:50%;
                    box-shadow:
                        0 0 14px rgba(0,102,255,.9),
                        0 0 0 6px rgba(0,102,255,.25);
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
                <b style="color:#0066ff;">
                    YOU ARE HERE
                </b>
                <br>
                <span style="
                    font-size:11px;
                    color:#475569;
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
                        "#0066ff",

                    weight:
                        1,

                    fillColor:
                        "#0066ff",

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
            closeLocationSetup,
            600
        );

    }

    catch (error) {

        console.error(
            "TERRAFIT location search:",
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

            if (territory.layer) {

                map.removeLayer(
                    territory.layer
                );

            }

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
                row *
                cellSize;

            const west =
                centerLng +
                col *
                cellSize;

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
                "#0066ff",

            weight:
                2,

            fillColor:
                "#0066ff",

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
                "#ef4444",

            weight:
                2,

            fillColor:
                "#ef4444",

            fillOpacity:
                0.30

        };

    }

    return {

        color:
            "#94a3b8",

        weight:
            1,

        fillColor:
            "#cbd5e1",

        fillOpacity:
            0.20

    };

}


/* =========================================================
   TERRITORY POPUP
========================================================= */

function showTerritoryInfo(
    territory
) {

    let ownerName =
        "NEUTRAL (UNCLAIMED)";

    let badgeColor =
        "#64748b";

    if (
        territory.owner ===
        "player"
    ) {

        ownerName =
            "YOUR TERRITORY";

        badgeColor =
            "#0066ff";

    }

    if (
        territory.owner ===
        "enemy"
    ) {

        ownerName =
            "OPPONENT SECTOR";

        badgeColor =
            "#ef4444";

    }

    const popup = `

        <div style="
            min-width:180px;
            font-family:'Space Grotesk',monospace;
            padding:6px;
        ">

            <div style="
                font-size:10px;
                color:#64748b;
                letter-spacing:1px;
                margin-bottom:4px;
            ">
                SECTOR GRID CELL
            </div>

            <strong style="
                font-size:14px;
                color:#0f172a;
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
   SPEED UI
========================================================= */

function updateSpeedUI(
    speed
) {

    const limit =
        getSpeedLimit();

    currentSpeedKmh =
        Math.max(
            0,
            Number(speed) || 0
        );

    if (liveSpeedDisplay) {

        liveSpeedDisplay.innerHTML =
            `${currentSpeedKmh.toFixed(1)} <small>km/h</small>`;

    }

    const activityItems =
        document.querySelectorAll(
            ".speed-limit-item"
        );

    const currentActivity =
        normalizeActivity(
            selectedActivity
        );

    activityItems.forEach(
        item => {

            const activity =
                normalizeActivity(
                    item.dataset.speedActivity
                );

            item.classList.toggle(
                "active",
                activity ===
                currentActivity
            );

        }
    );

    if (speedActivityDisplay) {

        speedActivityDisplay.textContent =
            getActivityName();

    }

    if (speedLimitDisplay) {

        speedLimitDisplay.textContent =
            limit +
            " km/h";

    }

    const percentage =
        Math.min(
            (
                currentSpeedKmh /
                limit
            ) * 100,
            100
        );

    if (speedProgressBar) {

        speedProgressBar.style.width =
            `${percentage}%`;

    }

    if (
        speedMonitorCard &&
        speedStatusText &&
        speedStatusDot
    ) {

        speedMonitorCard.classList.remove(
            "speed-warning",
            "speed-danger"
        );

        if (
            currentSpeedKmh >
            limit
        ) {

            speedMonitorCard.classList.add(
                "speed-danger"
            );

            speedStatusText.textContent =
                "● SPEED ANOMALY";

            speedStatusDot.style.background =
                "#ff4646";

            speedStatusDot.style.boxShadow =
                "0 0 12px rgba(255,70,70,.7)";

        }

        else if (
            currentSpeedKmh >=
            limit * 0.8
        ) {

            speedMonitorCard.classList.add(
                "speed-warning"
            );

            speedStatusText.textContent =
                "● NEAR LIMIT";

            speedStatusDot.style.background =
                "#ffaa00";

            speedStatusDot.style.boxShadow =
                "0 0 12px rgba(255,170,0,.7)";

        }

        else {

            speedStatusText.textContent =
                "● WITHIN LIMIT";

            speedStatusDot.style.background =
                "#0066ff";

            speedStatusDot.style.boxShadow =
                "0 0 12px rgba(0,102,255,.7)";

        }

    }

}


/* =========================================================
   SAVE GPS POINT TO SUPABASE
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


/* =========================================================
   AUTH MODE
========================================================= */

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


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

if (supabaseClient) {

    supabaseClient.auth.onAuthStateChange(
        async (
            event,
            session
        ) => {

            console.log(
                "TERRAFIT Auth Event:",
                event
            );

            if (
                session &&
                session.user
            ) {

                currentUser =
                    session.user;

                await loadCurrentProfile();

            }

            else {

                currentUser =
                    null;

                currentProfile =
                    null;

            }

        }
    );

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

restoreSupabaseSession();

console.log(
    "TERRAFIT initialized successfully."
);


/* =========================================================
   TERRAFIT LOADING SCREEN
========================================================= */

(function initTerraFitLoading() {

    const loadingScreen =
        document.getElementById(
            "terraLoading"
        );

    const progressBar =
        document.getElementById(
            "loadingProgressBar"
        );

    const percentText =
        document.getElementById(
            "loadingPercent"
        );

    const statusText =
        document.getElementById(
            "loadingStatus"
        );

    const safetyText =
        document.getElementById(
            "safetyMessage"
        );

    const safetySubText =
        document.getElementById(
            "safetySubMessage"
        );

    const safetyDots =
        document.querySelectorAll(
            ".safety-dots i"
        );


    /* =====================================================
       SAFETY MESSAGES
    ===================================================== */

    const safetyMessages = [

        {
            title:
                "DON'T WALK ON BUSY ROADS",

            text:
                "Use sidewalks, footpaths, or designated safe routes."

        },

        {
            title:
                "FOLLOW TRAFFIC SIGNALS",

            text:
                "Cross only at safe and designated crossings."

        },

        {
            title:
                "STAY AWARE OF YOUR SURROUNDINGS",

            text:
                "Keep your attention on traffic and your surroundings."

        },

        {
            title:
                "AVOID UNSAFE OR POORLY LIT AREAS",

            text:
                "Choose familiar, well-lit routes whenever possible."

        },

        {
            title:
                "DON'T USE YOUR PHONE WHILE MOVING",

            text:
                "Stop somewhere safe before checking your phone."

        },

        {
            title:
                "SAFETY > TERRITORY",

            text:
                "Your safety always comes before capturing territory."

        },

        {
            title:
                "KNOW YOUR LIMITS",

            text:
                "Take a break if you feel tired or uncomfortable."

        },

        {
            title:
                "RIDE RESPONSIBLY",

            text:
                "If cycling, wear a properly fitted helmet and follow local rules."

        }

    ];


    /* =====================================================
       SHUFFLE
    ===================================================== */

    function shuffle(
        array
    ) {

        const result =
            [
                ...array
            ];

        for (
            let i =
                result.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() *
                    (i + 1)
                );

            [
                result[i],
                result[j]
            ] = [
                result[j],
                result[i]
            ];

        }

        return result;

    }


    let messages =
        shuffle(
            safetyMessages
        );

    let messageIndex =
        0;


    /* =====================================================
       SHOW SAFETY MESSAGE
    ===================================================== */

    function showSafetyMessage() {

        if (
            !safetyText ||
            !safetySubText
        ) {

            return;

        }

        const message =
            messages[
                messageIndex
            ];

        safetyText.classList.add(
            "change"
        );

        setTimeout(
            () => {

                safetyText.textContent =
                    message.title;

                safetySubText.textContent =
                    message.text;

                safetyText.classList.remove(
                    "change"
                );

            },
            250
        );

        safetyDots.forEach(
            (
                dot,
                index
            ) => {

                dot.classList.toggle(
                    "active",
                    index ===
                    (
                        messageIndex %
                        safetyDots.length
                    )
                );

            }
        );

    }


    /* =====================================================
       ELEMENT CHECK
    ===================================================== */

    if (
        !loadingScreen ||
        !progressBar ||
        !percentText ||
        !statusText
    ) {

        console.error(
            "TERRAFIT: Loading elements missing."
        );

        return;

    }


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    progressBar.style.width =
        "0%";

    percentText.textContent =
        "0%";

    statusText.textContent =
        "INITIALIZING TERRAFIT...";

    showSafetyMessage();


    /* =====================================================
       SAFETY ROTATION
    ===================================================== */

    const safetyInterval =
        setInterval(
            () => {

                messageIndex++;

                if (
                    messageIndex >=
                    messages.length
                ) {

                    messages =
                        shuffle(
                            safetyMessages
                        );

                    messageIndex =
                        0;

                }

                showSafetyMessage();

            },
            2500
        );


    /* =====================================================
       LOADING STAGES
    ===================================================== */

    const stages = [

        {
            percent:
                0,

            text:
                "INITIALIZING TERRAFIT..."

        },

        {
            percent:
                20,

            text:
                "CONNECTING GPS..."

        },

        {
            percent:
                40,

            text:
                "LOADING MAP ENGINE..."

        },

        {
            percent:
                60,

            text:
                "BUILDING TERRITORY GRID..."

        },

        {
            percent:
                80,

            text:
                "CHECKING SAFETY PROTOCOL..."

        },

        {
            percent:
                100,

            text:
                "READY."

        }

    ];


    function updateStage(
        progress
    ) {

        let currentStage =
            stages[0];

        for (
            const stage
            of stages
        ) {

            if (
                progress >=
                stage.percent
            ) {

                currentStage =
                    stage;

            }

        }

        statusText.textContent =
            currentStage.text;

    }


    /* =====================================================
       PROGRESS
    ===================================================== */

    let progress =
        0;

    const progressInterval =
        setInterval(
            () => {

                const increment =
                    Math.floor(
                        Math.random() *
                        4
                    ) + 2;

                progress +=
                    increment;

                if (
                    progress >=
                    100
                ) {

                    progress =
                        100;

                }

                progressBar.style.width =
                    `${progress}%`;

                percentText.textContent =
                    `${progress}%`;

                updateStage(
                    progress
                );


                /* =========================================
                   COMPLETE
                ========================================= */

                if (
                    progress >=
                    100
                ) {

                    clearInterval(
                        progressInterval
                    );

                    clearInterval(
                        safetyInterval
                    );

                    statusText.textContent =
                        "READY.";

                    progressBar.style.width =
                        "100%";

                    percentText.textContent =
                        "100%";

                    setTimeout(
                        () => {

                            loadingScreen.classList.add(
                                "hide"
                            );

                        },
                        700
                    );

                }

            },
            100
        );

})();