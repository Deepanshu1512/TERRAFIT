/* =========================================================
   TERRAFIT APP INITIALIZATION
========================================================= */


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