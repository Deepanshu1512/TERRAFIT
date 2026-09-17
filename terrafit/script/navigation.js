/* =========================================================
   TERRAFIT NAVIGATION
   Dashboard navigation, landing view, logo and mobile menu.
========================================================= */


/* =========================================================
   DASHBOARD VIEW
========================================================= */

function openDashboardView() {

    if (landingPage) {
        landingPage.style.display = "none";
    }

    if (dashboard) {
        dashboard.style.display = "block";
    }

    setTimeout(() => {

        if (typeof initializeMap === "function") {

            if (!map) {
                initializeMap();
            } else {
                map.invalidateSize();
            }

        }

    }, 300);
}


/* =========================================================
   LANDING VIEW
========================================================= */

function openLandingView() {

    if (dashboard) {
        dashboard.style.display = "none";
    }

    if (landingPage) {
        landingPage.style.display = "block";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   START BUTTON
========================================================= */

if (startBtn) {

    startBtn.addEventListener(
        "click",
        () => {

            openDashboardView();

            setTimeout(() => {

                const activitySection =
                    document.getElementById(
                        "activity"
                    );

                if (activitySection) {

                    activitySection.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }, 350);

        }
    );

}


/* =========================================================
   HOW IT WORKS BUTTON
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

            openLandingView();

        }
    );

}


/* =========================================================
   DESKTOP NAVIGATION
========================================================= */

navLinks.forEach((link) => {

    link.addEventListener(
        "click",
        (event) => {

            const targetId =
                link.getAttribute(
                    "data-target"
                ) ||
                link.getAttribute(
                    "href"
                );

            if (
                targetId &&
                targetId.startsWith("#")
            ) {

                event.preventDefault();

                const target =
                    document.querySelector(
                        targetId
                    );

                if (target) {

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }

        }
    );

});


/* =========================================================
   MOBILE MENU
========================================================= */

if (mobileMenuToggle) {

    mobileMenuToggle.addEventListener(
        "click",
        () => {

            if (!mobileNavDrawer) {
                return;
            }

            const isOpen =
                mobileNavDrawer.classList.contains(
                    "active"
                );

            if (isOpen) {

                mobileNavDrawer.classList.remove(
                    "active"
                );

                mobileMenuToggle.classList.remove(
                    "active"
                );

            } else {

                mobileNavDrawer.classList.add(
                    "active"
                );

                mobileMenuToggle.classList.add(
                    "active"
                );

            }

        }
    );

}


/* =========================================================
   MOBILE NAV LINKS
========================================================= */

if (mobileNavDrawer) {

    const mobileLinks =
        mobileNavDrawer.querySelectorAll(
            "a"
        );

    mobileLinks.forEach((link) => {

        link.addEventListener(
            "click",
            () => {

                mobileNavDrawer.classList.remove(
                    "active"
                );

                if (mobileMenuToggle) {

                    mobileMenuToggle.classList.remove(
                        "active"
                    );

                }

            }
        );

    });

}


/* =========================================================
   CLOSE MOBILE MENU ON OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    (event) => {

        if (
            !mobileNavDrawer ||
            !mobileMenuToggle
        ) {
            return;
        }

        const clickedInsideMenu =
            mobileNavDrawer.contains(
                event.target
            );

        const clickedToggle =
            mobileMenuToggle.contains(
                event.target
            );

        if (
            !clickedInsideMenu &&
            !clickedToggle
        ) {

            mobileNavDrawer.classList.remove(
                "active"
            );

            mobileMenuToggle.classList.remove(
                "active"
            );

        }

    }
);