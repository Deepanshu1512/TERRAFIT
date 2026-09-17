/* TERRAFIT CORE
   DOM references + shared state + speed/map configuration.
*/

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