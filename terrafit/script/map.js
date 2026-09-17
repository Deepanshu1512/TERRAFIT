/* =========================================================
   TERRAFIT MAP + LOCATION
   Leaflet initialization, GPS/manual location setup and map state.
========================================================= */


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