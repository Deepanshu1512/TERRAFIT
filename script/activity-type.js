/* =========================================================
   TERRAFIT — ACTIVITY TYPE SELECTION
   ========================================================= */

const activityTypes = document.querySelectorAll(
    ".activity-type"
);


/* =========================================================
   SPEED LIMIT DISPLAY
   ========================================================= */

function updateSelectedSpeedLimitDisplay() {

    const currentActivity =
        String(selectedActivity || "walking")
            .trim()
            .toLowerCase();

    const speedItems =
        document.querySelectorAll(
            ".speed-limit-item"
        );


    speedItems.forEach(item => {

        const activity =
            String(
                item.dataset.speedActivity || ""
            )
            .trim()
            .toLowerCase();


        const isSelected =
            activity === currentActivity;


        /* -----------------------------------------
           ONLY SHOW SELECTED ACTIVITY
        ----------------------------------------- */

        item.classList.toggle(
            "active",
            isSelected
        );


        item.style.display =
            isSelected ? "flex" : "none";

    });


    /* ---------------------------------------------
       UPDATE SPEED ACTIVITY LABEL
    --------------------------------------------- */

    const speedActivity =
        document.getElementById("speedActivity");


    if (speedActivity) {

        const formattedActivity =
            currentActivity.charAt(0).toUpperCase() +
            currentActivity.slice(1);

        speedActivity.textContent =
            formattedActivity;

    }

}


/* =========================================================
   ACTIVITY SELECTION
   ========================================================= */

activityTypes.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            /* -----------------------------------------
               DON'T CHANGE ACTIVITY WHILE RUNNING
            ----------------------------------------- */

            if (activityRunning) {
                return;
            }


            /* -----------------------------------------
               REMOVE OLD ACTIVE STATE
            ----------------------------------------- */

            activityTypes.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            /* -----------------------------------------
               ACTIVATE SELECTED ACTIVITY
            ----------------------------------------- */

            button.classList.add(
                "active"
            );


            /* -----------------------------------------
               SAVE ACTIVITY TYPE
            ----------------------------------------- */

            if (button.dataset.type) {

                selectedActivity =
                    button.dataset.type;

            }


            /* -----------------------------------------
               UPDATE SPEED LIMIT DISPLAY
            ----------------------------------------- */

            updateSelectedSpeedLimitDisplay();


            /* -----------------------------------------
               UPDATE SPEED MONITOR
            ----------------------------------------- */

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

});


/* =========================================================
   INITIAL STATE
   ========================================================= */

updateSelectedSpeedLimitDisplay();