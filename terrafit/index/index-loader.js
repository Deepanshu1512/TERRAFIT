document.addEventListener("DOMContentLoaded", async () => {

    const components = [
        { id: "loadingComponent", file: "loading.html" },
        { id: "navbarComponent", file: "navbar.html" },
        { id: "authComponent", file: "auth.html" },
        { id: "heroComponent", file: "hero.html" },
        { id: "howItWorksComponent", file: "how-it-works.html" },
        { id: "dashboardComponent", file: "dashboard.html" },
        { id: "footerComponent", file: "footer.html" }
    ];

    for (const component of components) {

        const container =
            document.getElementById(component.id);

        if (!container) {
            console.error(
                `TERRAFIT: Container #${component.id} not found.`
            );
            continue;
        }

        try {

            const response =
                await fetch(component.file);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const html =
                await response.text();

            container.innerHTML = html;

            console.log(
                `TERRAFIT: Loaded ${component.file}`
            );

        } catch (error) {

            console.error(
                `TERRAFIT: Failed to load ${component.file}:`,
                error
            );

        }
    }


    /*
     * IMPORTANT:
     * Components must exist in the DOM BEFORE
     * TERRAFIT application scripts execute.
     */

    const scripts = [
        "../script/config.js",
        "../script/core.js",
        "../script/navigation.js",
        "../script/activity-type.js",
        "../script/map.js",
        "../script/territory.js",
        "../script/activity.js",
        "../script/stats.js",
        "../script/auth.js",
        "../script/app.js"
    ];


    for (const src of scripts) {

        await new Promise((resolve, reject) => {

            const script =
                document.createElement("script");

            script.src = src;

            script.onload = () => {
                console.log(
                    `TERRAFIT: Loaded ${src}`
                );
                resolve();
            };

            script.onerror = () => {
                console.error(
                    `TERRAFIT: Failed to load ${src}`
                );
                reject(
                    new Error(`Failed to load ${src}`)
                );
            };

            document.body.appendChild(script);

        });

    }


    document.dispatchEvent(
        new Event("terraFitComponentsLoaded")
    );

    console.log(
        "TERRAFIT: Components + application loaded."
    );

});