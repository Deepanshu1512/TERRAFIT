/* =========================================================
   TERRAFIT
   GPS + MAP + ACTIVITY + TERRITORY + AUTH SYSTEM
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const startBtn = document.getElementById("startBtn");
const demoBtn = document.getElementById("demoBtn");

const landingPage = document.getElementById("landingPage");
const dashboard = document.getElementById("dashboard");

const activityBtn = document.getElementById("activityBtn");
const activityStatus = document.getElementById("activityStatus");
const gpsStatus = document.getElementById("gpsStatus");

const distanceDisplay = document.getElementById("distance");
const timerDisplay = document.getElementById("timer");

const territoryCount = document.getElementById("territoryCount");
const xpCount = document.getElementById("xpCount");
const activityCount = document.getElementById("activityCount");
const streakCount = document.getElementById("streakCount");

const territoryStrength =
    document.getElementById("territoryStrength");

const lastActivity =
    document.getElementById("lastActivity");

const territoryStatus =
    document.getElementById("territoryStatus");

const playerName =
    document.getElementById("playerName");


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

const initialMapView = [20, 78];


/* =========================================================
   OPEN DASHBOARD
========================================================= */

if (startBtn) {

    startBtn.addEventListener("click", () => {

        if (landingPage) {
            landingPage.style.display = "none";
        }

        if (dashboard) {
            dashboard.style.display = "block";
        }

        if (dashboard) {

            dashboard.scrollIntoView({
                behavior: "smooth"
            });

        }

        setTimeout(() => {

            if (!map) {

                initializeMap();

            } else {

                map.invalidateSize();

            }

        }, 300);

    });

}


/* =========================================================
   EXPLORE / DEMO BUTTON
========================================================= */

if (demoBtn) {

    demoBtn.addEventListener("click", () => {

        const howSection =
            document.getElementById("how");

        if (howSection) {

            howSection.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

}


/* =========================================================
   ACTIVITY TYPE
========================================================= */

const activityTypes =
    document.querySelectorAll(".activity-type");


activityTypes.forEach(button => {

    button.addEventListener("click", () => {

        if (activityRunning) {
            return;
        }

        activityTypes.forEach(btn => {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        if (button.dataset.type) {

            selectedActivity =
                button.dataset.type;

        }

    });

});


/* =========================================================
   INITIALIZE MAP
========================================================= */

function initializeMap() {

    const mapElement =
        document.getElementById("realMap");

    if (!mapElement) {
        return;
    }

    map = L.map("realMap").setView(
        initialMapView,
        5
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
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
        document.createElement("div");


    setup.id =
        "locationSetup";


    setup.innerHTML = `

        <div style="
            position:fixed;
            inset:0;
            background:rgba(0,0,0,0.78);
            backdrop-filter:blur(6px);
            z-index:99999;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
        ">

            <div style="
                width:min(460px,100%);
                background:#101010;
                border:1px solid #333;
                padding:32px;
                color:white;
                font-family:Arial,Helvetica,sans-serif;
                box-shadow:0 25px 80px rgba(0,0,0,.7);
            ">

                <div style="
                    font-size:10px;
                    color:#777;
                    font-weight:800;
                    letter-spacing:2px;
                    margin-bottom:12px;
                ">
                    TERRAFIT LOCATION
                </div>

                <h2 style="
                    font-size:30px;
                    margin:0;
                    letter-spacing:-1px;
                ">
                    Set your territory
                </h2>

                <p style="
                    color:#888;
                    font-size:13px;
                    line-height:1.6;
                    margin:15px 0 25px;
                ">
                    TERRAFIT needs your location to
                    show your nearby territory and
                    track your activity.
                </p>

                <button
                    id="detectLocationBtn"
                    style="
                        width:100%;
                        padding:16px;
                        background:#fff;
                        color:#000;
                        border:none;
                        font-weight:900;
                        letter-spacing:1px;
                        cursor:pointer;
                    "
                >
                    📍 DETECT MY LOCATION
                </button>

                <div style="
                    text-align:center;
                    margin:20px 0;
                    color:#555;
                    font-size:10px;
                    letter-spacing:2px;
                ">
                    OR
                </div>

                <div style="
                    display:flex;
                    gap:8px;
                ">

                    <input
                        id="manualLocationInput"
                        type="text"
                        placeholder="Enter city or location"
                        style="
                            flex:1;
                            padding:14px;
                            background:#181818;
                            color:#fff;
                            border:1px solid #333;
                            outline:none;
                        "
                    >

                    <button
                        id="manualLocationBtn"
                        style="
                            padding:14px 16px;
                            background:#181818;
                            color:#fff;
                            border:1px solid #444;
                            font-weight:800;
                            cursor:pointer;
                        "
                    >
                        SET
                    </button>

                </div>

                <div
                    id="locationMessage"
                    style="
                        min-height:18px;
                        margin-top:15px;
                        color:#888;
                        font-size:11px;
                    "
                ></div>

            </div>

        </div>

    `;


    document.body.appendChild(setup);


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

                if (event.key === "Enter") {

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

    if (!("geolocation" in navigator)) {

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
            "LOCATING...";

        button.disabled = true;

    }


    showLocationMessage(
        "Waiting for location permission..."
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
                "Location detected successfully."
            );


            setTimeout(() => {

                closeLocationSetup();

            }, 600);

        },

        error => {

            handleGPSError(error);

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

        latitude: latitude,

        longitude: longitude

    };


    locationReady = true;


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
        "LOCATION DETECTED"
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
                    width:18px;
                    height:18px;
                    background:#fff;
                    border:3px solid #000;
                    border-radius:50%;
                    box-shadow:
                    0 0 0 7px
                    rgba(255,255,255,.20);
                "></div>

            `,

            iconSize: [
                18,
                18
            ],

            iconAnchor: [
                9,
                9
            ]

        });


    if (!playerMarker) {

        playerMarker =
            L.marker(
                coordinates,
                {
                    icon: playerIcon
                }
            ).addTo(map);


        playerMarker.bindPopup(
            "<b>YOU ARE HERE</b><br>TERRAFIT"
        );

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

                    radius: radius,

                    color: "#ffffff",

                    weight: 1,

                    fillOpacity: 0.05

                }
            ).addTo(map);

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
        "Searching location..."
    );


    const button =
        document.getElementById(
            "manualLocationBtn"
        );


    if (button) {

        button.disabled = true;

    }


    try {

        const response =
            await fetch(
                "https://nominatim.openstreetmap.org/search?" +
                new URLSearchParams({

                    q: query,

                    format: "json",

                    limit: "1"

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
            20
        );


        showLocationMessage(
            "Location selected."
        );


        setTimeout(() => {

            closeLocationSetup();

        }, 600);

    }

    catch (error) {

        console.error(error);

        showLocationMessage(
            "Could not find location. Check your internet connection."
        );

    }

    finally {

        if (button) {

            button.disabled = false;

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
                    getTerritoryStyle(owner)
                ).addTo(map);


            const territory = {

                layer: rectangle,

                row: row,

                col: col,

                owner: owner,

                strength: 0

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

    if (owner === "player") {

        return {

            color: "#ffffff",

            weight: 2,

            fillColor: "#666666",

            fillOpacity: 0.65

        };

    }


    if (owner === "enemy") {

        return {

            color: "#777777",

            weight: 2,

            fillColor: "#333333",

            fillOpacity: 0.60

        };

    }


    return {

        color: "#333333",

        weight: 1,

        fillColor: "#111111",

        fillOpacity: 0.08

    };

}


/* =========================================================
   TERRITORY INFO
========================================================= */

function showTerritoryInfo(
    territory
) {

    let ownerName =
        "NEUTRAL";


    if (
        territory.owner === "player"
    ) {

        ownerName =
            "YOUR TERRITORY";

    }


    if (
        territory.owner === "enemy"
    ) {

        ownerName =
            "OPPONENT";

    }


    const popup = `

        <div style="
            min-width:180px;
            font-family:Arial;
        ">

            <strong>
                TERRAFIT ZONE
            </strong>

            <br><br>

            <b>Owner:</b>
            ${ownerName}

            <br>

            <b>Strength:</b>
            ${territory.strength}%

        </div>

    `;


    territory.layer
        .bindPopup(popup)
        .openPopup();

}


/* =========================================================
   ACTIVITY BUTTON
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


    if (!("geolocation" in navigator)) {

        alert(
            "GPS is not supported by this browser."
        );

        return;

    }


    activityRunning = true;

    seconds = 0;

    distance = 0;

    routeCoordinates = [];

    capturedTerritories =
        new Set();

    lastPosition = null;


    if (routeLine) {

        map.removeLayer(
            routeLine
        );

        routeLine = null;

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


    setGPSStatus(
        "TRACKING"
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

                enableHighAccuracy: true,

                maximumAge: 2000,

                timeout: 10000

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

        latitude: latitude,

        longitude: longitude

    };


    locationReady = true;


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

        map.setView(
            coordinates,
            map.getZoom()
        );

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
        routeCoordinates.length === 0
    ) {

        routeCoordinates.push(
            point
        );


        routeLine =
            L.polyline(
                routeCoordinates,
                {

                    color: "#ffffff",

                    weight: 5,

                    opacity: 0.9

                }
            ).addTo(map);


        map.panTo(point);


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


    /* Ignore GPS noise */

    if (movement < 0.003) {

        return;

    }


    /* Ignore impossible jumps */

    if (movement > 1) {

        return;

    }


    distance += movement;


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


    map.panTo(
        point,
        {

            animate: true,

            duration: 0.3

        }
    );

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


    return earthRadius * c;

}


/* =========================================================
   DEGREES → RADIANS
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
   CHECK ROUTE TERRITORIES
========================================================= */

function checkRouteTerritories(
    point
) {

    for (
        const territory
        of territoryCells
    ) {

        if (
            territory.owner === "player"
        ) {

            continue;

        }


        const bounds =
            territory.layer.getBounds();


        if (
            bounds.contains(point)
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


    /* Territory count */

    let currentTerritory =
        parseInt(
            territoryCount.textContent
        ) || 0;


    currentTerritory++;


    if (territoryCount) {

        territoryCount.textContent =
            currentTerritory;

    }


    /* XP */

    let currentXP =
        parseInt(
            xpCount.textContent
        ) || 0;


    currentXP += 100;


    if (xpCount) {

        xpCount.textContent =
            currentXP;

    }


    /* Status */

    if (territoryStatus) {

        territoryStatus.textContent =
            "CAPTURED";

    }


    if (territoryStrength) {

        territoryStrength.textContent =
            "50%";

    }


    territory.layer
        .bindPopup(
            "<b>TERRITORY CAPTURED!</b><br>+100 XP"
        )
        .openPopup();

}


/* =========================================================
   FINISH ACTIVITY
========================================================= */

function finishActivity() {

    activityRunning = false;


    /* Stop GPS */

    if (watchId !== null) {

        navigator.geolocation.clearWatch(
            watchId
        );

        watchId = null;

    }


    /* Stop timer */

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;

    }


    /* Activity total */

    let totalActivity =
        parseFloat(
            activityCount.textContent
        ) || 0;


    totalActivity += distance;


    if (activityCount) {

        activityCount.textContent =
            totalActivity.toFixed(1);

    }


    /* Streak */

    if (streakCount && distance > 0) {

        let streak =
            parseInt(
                streakCount.textContent
            ) || 0;

        streak++;

        streakCount.textContent =
            streak;

    }


    /* UI */

    activityBtn.textContent =
        "START ACTIVITY";


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
        captured * 100;


    alert(

        "TERRAFIT ACTIVITY COMPLETE!\n\n" +

        "Activity: " +
        selectedActivity +

        "\nDistance: " +
        distance.toFixed(2) +
        " KM" +

        "\nTime: " +
        formatTime(seconds) +

        "\nTerritories captured: " +
        captured +

        "\nXP earned: +" +
        earnedXP

    );

}


/* =========================================================
   TIMER
========================================================= */

function updateTimer() {

    seconds++;


    if (timerDisplay) {

        timerDisplay.textContent =
            formatTime(seconds);

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
            totalSeconds / 60
        );


    const remainingSeconds =
        totalSeconds % 60;


    return (

        String(minutes)
            .padStart(2, "0")

        +

        ":"

        +

        String(
            remainingSeconds
        ).padStart(2, "0")

    );

}


/* =========================================================
   GPS ERROR HANDLER
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

        button.disabled = false;

        button.textContent =
            "📍 DETECT MY LOCATION";

    }


    if (error.code === 1) {

        setGPSStatus(
            "LOCATION DENIED"
        );


        showLocationMessage(
            "Location permission was denied. You can enter your location manually."
        );

    }

    else if (error.code === 2) {

        setGPSStatus(
            "LOCATION UNAVAILABLE"
        );


        showLocationMessage(
            "Your location could not be detected. Try again or use manual location."
        );

    }

    else if (error.code === 3) {

        setGPSStatus(
            "GPS TIMEOUT"
        );


        showLocationMessage(
            "GPS took too long to respond. Try again."
        );

    }

    else {

        setGPSStatus(
            "GPS ERROR"
        );


        showLocationMessage(
            "Unable to detect location. Try manual location."
        );

    }

}


/* =========================================================
   GPS STATUS
========================================================= */

function setGPSStatus(
    text
) {

    if (!gpsStatus) {
        return;
    }


    gpsStatus.innerHTML = `

        <span class="gps-dot"></span>

        ${text}

    `;

}


/* =========================================================
   LOGIN / AUTH SYSTEM
========================================================= */

const loginBtn =
    document.getElementById(
        "loginBtn"
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
   LOGIN / SIGNUP TABS
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

    authMode = mode;


    if (authMessage) {

        authMessage.textContent =
            "";

    }


    if (mode === "login") {

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
                "Log in to continue your journey.";

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
                "JOIN TERRAFIT.";

        }


        if (authSubtitle) {

            authSubtitle.textContent =
                "Create your account and claim your territory.";

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
   AUTH FORM SUBMIT
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
               SIGNUP
            ========================= */

            if (
                authMode === "signup"
            ) {

                if (
                    !name ||
                    !email ||
                    !password ||
                    !confirmPassword
                ) {

                    showAuthMessage(
                        "Please fill all fields."
                    );

                    return;

                }


                if (
                    password !==
                    confirmPassword
                ) {

                    showAuthMessage(
                        "Passwords do not match."
                    );

                    return;

                }


                const user = {

                    name: name,

                    email: email,

                    password: password

                };


                localStorage.setItem(
                    "terraFitUser",
                    JSON.stringify(user)
                );


                showAuthMessage(
                    "Account created successfully."
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

            }


            /* =========================
               LOGIN
            ========================= */

            else {

                if (
                    !email ||
                    !password
                ) {

                    showAuthMessage(
                        "Please enter email and password."
                    );

                    return;

                }


                const savedUser =
                    localStorage.getItem(
                        "terraFitUser"
                    );


                if (!savedUser) {

                    showAuthMessage(
                        "No account found. Please sign up first."
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
                        "Account data is corrupted."
                    );

                    return;

                }


                if (
                    user.email !==
                    email
                ) {

                    showAuthMessage(
                        "Email does not match."
                    );

                    return;

                }


                if (
                    user.password &&
                    user.password !==
                    password
                ) {

                    showAuthMessage(
                        "Incorrect password."
                    );

                    return;

                }


                showAuthMessage(
                    "Login successful."
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

                name: "DEMO PLAYER",

                email: "demo@terrafit.app",

                password: "demo"

            };


            localStorage.setItem(
                "terraFitUser",
                JSON.stringify(
                    demoUser
                )
            );


            showAuthMessage(
                "Demo account activated."
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
                "Password recovery will be available soon."
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

    console.log(
        "Logged in as:",
        name
    );


    if (loginBtn) {

        loginBtn.textContent =
            name.toUpperCase();

    }


    if (playerName) {

        playerName.textContent =
            name.toUpperCase() + ".";

    }

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


        if (user.name) {

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
   KEYBOARD ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            authOverlay &&
            authOverlay.classList.contains("active")
        ) {

            closeAuth();

        }

    }
);
