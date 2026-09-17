/* =========================================================
   TERRAFIT ACTIVITY TYPE
   Activity selection + normalization + speed helpers.
========================================================= */


/* =========================================================
   ACTIVITY TYPE BUTTONS
========================================================= */

const activityTypeButtons =
    document.querySelectorAll(
        ".activity-type-btn"
    );


/* =========================================================
   NORMALIZE ACTIVITY TYPE
========================================================= */

function normalizeActivityType(
    activityType
) {

    if (!activityType) {
        return "walking";
    }

    const normalized =
        activityType
            .toString()
            .trim()
            .toLowerCase();

    if (
        normalized === "walk" ||
        normalized === "walking"
    ) {
        return "walking";
    }

    if (
        normalized === "run" ||
        normalized === "running"
    ) {
        return "running";
    }

    if (
        normalized === "cycle" ||
        normalized === "cycling" ||
        normalized === "bicycle"
    ) {
        return "cycling";
    }

    return "walking";
}


/* =========================================================
   ACTIVITY DISPLAY NAME
========================================================= */

function getActivityName(
    activityType
) {

    const normalized =
        normalizeActivityType(
            activityType
        );

    if (normalized === "running") {
        return "Running";
    }

    if (normalized === "cycling") {
        return "Cycling";
    }

    return "Walking";
}


/* =========================================================
   GET SPEED LIMIT
========================================================= */

function getSpeedLimit(
    activityType
) {

    const normalized =
        normalizeActivityType(
            activityType
        );

    return (
        TERRAFIT_SPEED_LIMITS[
            normalized
        ] || TERRAFIT_SPEED_LIMITS.walking
    );

}


/* =========================================================
   UPDATE ACTIVITY TYPE UI
========================================================= */

function updateActivityTypeUI() {

    const normalized =
        normalizeActivityType(
            selectedActivity
        );

    const activityName =
        getActivityName(
            normalized
        );

    const speedLimit =
        getSpeedLimit(
            normalized
        );


    /* -----------------------------------------------------
       Update selected button
    ----------------------------------------------------- */

    activityTypeButtons.forEach(
        (button) => {

            const buttonType =
                normalizeActivityType(
                    button.dataset.activity ||
                    button.dataset.type ||
                    button.textContent
                );

            if (
                buttonType === normalized
            ) {

                button.classList.add(
                    "active"
                );

            } else {

                button.classList.remove(
                    "active"
                );

            }

        }
    );


    /* -----------------------------------------------------
       Update speed monitor
    ----------------------------------------------------- */

    if (speedActivityDisplay) {

        speedActivityDisplay.textContent =
            activityName;

    }

    if (speedLimitDisplay) {

        speedLimitDisplay.textContent =
            `${speedLimit} km/h`;

    }

}


/* =========================================================
   ACTIVITY TYPE CLICK HANDLERS
========================================================= */

activityTypeButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const selectedType =
                    button.dataset.activity ||
                    button.dataset.type ||
                    button.textContent;

                selectedActivity =
                    getActivityName(
                        selectedType
                    );

                updateActivityTypeUI();

                if (
                    typeof updateSpeedUI ===
                    "function"
                ) {

                    updateSpeedUI(
                        currentSpeedKmh
                    );

                }

            }
        );

    }
);


/* =========================================================
   INITIAL ACTIVITY UI
========================================================= */

updateActivityTypeUI();