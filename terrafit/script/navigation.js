/* =========================================================
   TERRAFIT NAVIGATION
   Dashboard navigation, landing view, section scrolling,
   logo and mobile menu.
========================================================= */


/* =========================================================
   SCROLL TO SECTION
========================================================= */

function scrollToDashboardSection(targetId) {

    if (!targetId) {
        return;
    }

    const target =
        document.querySelector(targetId);

    if (!target) {
        console.warn(
            "TERRAFIT: Navigation target not found:",
            targetId
        );

        return;
    }


    /* -----------------------------------------
       MAKE SURE DASHBOARD IS VISIBLE
    ----------------------------------------- */

    openDashboardView();


    /* -----------------------------------------
       WAIT FOR DASHBOARD TO RENDER
    ----------------------------------------- */

    setTimeout(() => {

        const navbar =
            document.querySelector(
                ".navbar"
            );

        const navbarHeight =
            navbar
                ? navbar.offsetHeight
                : 80;

        const targetPosition =
            target.getBoundingClientRect().top +
            window.scrollY -
            navbarHeight -
            12;


        window.scrollTo({

            top:
                Math.max(
                    0,
                    targetPosition
                ),

            behavior:
                "smooth"

        });


        /* -----------------------------------------
           UPDATE ACTIVE NAV LINK
        ----------------------------------------- */

        updateActiveNavLink(
            targetId
        );

    }, 350);

}


/* =========================================================
   UPDATE ACTIVE NAV LINK
========================================================= */

function updateActiveNavLink(
    targetId
) {

    navLinks.forEach(
        link => {

            const linkTarget =
                link.getAttribute(
                    "data-target"
                ) ||
                link.getAttribute(
                    "href"
                );

            link.classList.toggle(
                "active",
                linkTarget === targetId
            );

        }
    );


    /* -----------------------------------------
       MOBILE NAV LINKS
    ----------------------------------------- */

    if (mobileNavDrawer) {

        const mobileLinks =
            mobileNavDrawer.querySelectorAll(
                "a"
            );

        mobileLinks.forEach(
            link => {

                const linkTarget =
                    link.getAttribute(
                        "data-target"
                    ) ||
                    link.getAttribute(
                        "href"
                    );

                link.classList.toggle(
                    "active",
                    linkTarget === targetId
                );

            }
        );

    }

}


/* =========================================================
   DASHBOARD VIEW
========================================================= */

function openDashboardView() {

    if (landingPage) {

        landingPage.style.display =
            "none";

    }


    if (dashboard) {

        dashboard.style.display =
            "block";

    }


    /* -----------------------------------------
       INITIALIZE / REFRESH MAP
    ----------------------------------------- */

    setTimeout(() => {

        if (
            typeof initializeMap ===
            "function"
        ) {

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

        dashboard.style.display =
            "none";

    }


    if (landingPage) {

        landingPage.style.display =
            "block";

    }


    /* -----------------------------------------
       RESET NAV ACTIVE STATE
    ----------------------------------------- */

    navLinks.forEach(
        link => {

            link.classList.remove(
                "active"
            );

        }
    );


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

}


/* =========================================================
   START ACTIVITY BUTTON
========================================================= */

if (startBtn) {

    startBtn.addEventListener(
        "click",
        () => {

            openDashboardView();


            setTimeout(() => {

                scrollToDashboardSection(
                    "#activity-section"
                );

            }, 50);

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

                const navbar =
                    document.querySelector(
                        ".navbar"
                    );

                const navbarHeight =
                    navbar
                        ? navbar.offsetHeight
                        : 80;

                const targetPosition =
                    howSection.getBoundingClientRect().top +
                    window.scrollY -
                    navbarHeight -
                    12;

                window.scrollTo({

                    top:
                        Math.max(
                            0,
                            targetPosition
                        ),

                    behavior:
                        "smooth"

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

navLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute(
                        "data-target"
                    ) ||
                    link.getAttribute(
                        "href"
                    );


                if (
                    !targetId ||
                    !targetId.startsWith("#")
                ) {

                    return;

                }


                event.preventDefault();


                /* -----------------------------------------
                   DASHBOARD NAVIGATION
                ----------------------------------------- */

                scrollToDashboardSection(
                    targetId
                );

            }
        );

    }
);


/* =========================================================
   MOBILE MENU TOGGLE
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


    mobileLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

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


                        /* -----------------------------------------
                           CLOSE MENU FIRST
                        ----------------------------------------- */

                        mobileNavDrawer.classList.remove(
                            "active"
                        );


                        if (mobileMenuToggle) {

                            mobileMenuToggle.classList.remove(
                                "active"
                            );

                        }


                        /* -----------------------------------------
                           NAVIGATE
                        ----------------------------------------- */

                        scrollToDashboardSection(
                            targetId
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   CLOSE MOBILE MENU ON OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    event => {

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