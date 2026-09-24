/* =========================================================
   TERRAFIT TERRITORY
   Territory grid, styling and territory UI.
========================================================= */


/* =========================================================
   TERRITORY GRID CONFIG
========================================================= */

const TERRITORY_GRID_SIZE = 11;

// Territory size: 500m × 500m
const TERRITORY_SIZE_METERS = 500;

/*
 * Convert 500 meters into latitude/longitude degrees.
 * Latitude is approximately constant.
 * Longitude depends on the current latitude.
 */
function getTerritoryCellSize(latitude) {
    const metersPerLatitudeDegree = 111320;

    const latitudeSize =
        TERRITORY_SIZE_METERS / metersPerLatitudeDegree;

    const longitudeSize =
        TERRITORY_SIZE_METERS /
        (111320 * Math.cos(latitude * Math.PI / 180));

    return {
        latitude: latitudeSize,
        longitude: longitudeSize
    };
}


/* =========================================================
   CREATE TERRITORIES AROUND USER
========================================================= */

function createTerritoriesAroundUser() {

    if (
        !map ||
        !currentUserLocation
    ) {
        return;
    }

    /* Remove old territory cells */

    territoryCells.forEach(
        (cell) => {

            if (
                cell.layer &&
                map.hasLayer(
                    cell.layer
                )
            ) {

                map.removeLayer(
                    cell.layer
                );

            }

        }
    );

    territoryCells = [];

    const centerLat =
        currentUserLocation.latitude;

    const centerLon =
        currentUserLocation.longitude;

    const half =
        Math.floor(
            TERRITORY_GRID_SIZE / 2
        );

    for (
        let row = -half;
        row <= half;
        row++
    ) {

        for (
            let col = -half;
            col <= half;
            col++
        ) {

           const cellSize =
    getTerritoryCellSize(centerLat);

const south =
    centerLat +
    row *
    cellSize.latitude;

const west =
    centerLon +
    col *
    cellSize.longitude;

const north =
    south +
    cellSize.latitude;

const east =
    west +
    cellSize.longitude;

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

            const cellId =
                `${row}_${col}`;

            const cellData = {

                id:
                    cellId,

                row:
                    row,

                col:
                    col,

                owner:
                    "neutral",

                strength:
                    0,

                captured:
                    false,

                layer:
                    null

            };

            const rectangle =
                L.rectangle(
                    bounds,
                    getTerritoryStyle(
                        "neutral"
                    )
                );

            rectangle
                .addTo(map);

            rectangle.on(
                "click",
                () => {

                    showTerritoryPopup(
                        cellData
                    );

                }
            );

            cellData.layer =
                rectangle;

            territoryCells.push(
                cellData
            );

        }

    }

    updateTerritoryUI();

}


/* =========================================================
   TERRITORY STYLE
========================================================= */

function getTerritoryStyle(
    owner
) {

    if (
        owner === "player"
    ) {

        return {

            color:
                "#0066ff",

            weight:
                1,

            opacity:
                0.9,

            fillColor:
                "#0066ff",

            fillOpacity:
                0.24

        };

    }

    if (
        owner === "enemy"
    ) {

        return {

            color:
                "#ff304f",

            weight:
                1,

            opacity:
                0.9,

            fillColor:
                "#ff304f",

            fillOpacity:
                0.22

        };

    }

    return {

        color:
            "#64748b",

        weight:
            1,

        opacity:
            0.45,

        fillColor:
            "#64748b",

        fillOpacity:
            0.06

    };

}


/* =========================================================
   UPDATE TERRITORY CELL STYLE
========================================================= */

function updateTerritoryCell(
    cell
) {

    if (
        !cell ||
        !cell.layer
    ) {

        return;

    }

    cell.layer.setStyle(
        getTerritoryStyle(
            cell.owner
        )
    );

}


/* =========================================================
   FIND NEAREST TERRITORY CELL
========================================================= */

function findNearestTerritoryCell(
    latitude,
    longitude
) {

    if (
        !territoryCells ||
        territoryCells.length === 0
    ) {

        return null;

    }

    let nearestCell =
        null;

    let nearestDistance =
        Infinity;

    territoryCells.forEach(
        (cell) => {

           const cellSize =
    getTerritoryCellSize(
        currentUserLocation.latitude
    );

const cellLat =
    currentUserLocation.latitude +
    cell.row *
    cellSize.latitude;

const cellLon =
    currentUserLocation.longitude +
    cell.col *
    cellSize.longitude;

            const cellDistance =
                calculateDistance(
                    latitude,
                    longitude,
                    cellLat,
                    cellLon
                );

            if (
                cellDistance <
                nearestDistance
            ) {

                nearestDistance =
                    cellDistance;

                nearestCell =
                    cell;

            }

        }
    );

    return nearestCell;

}


/* =========================================================
   CHECK TERRITORY
========================================================= */

function checkTerritoryCapture(
    latitude,
    longitude
) {

    if (
        !activityRunning
    ) {

        return;

    }

    const cell =
        findNearestTerritoryCell(
            latitude,
            longitude
        );

    if (!cell) {

        return;

    }

    /*
       Only neutral territory is captured
       by the current activity.
    */

    if (
        cell.owner ===
        "neutral"
    ) {

        captureTerritory(
            cell
        );

    }

}


/* =========================================================
   CAPTURE TERRITORY
========================================================= */

function captureTerritory(
    cell
) {

    if (
        !cell
    ) {

        return;

    }

    if (
        cell.owner !==
        "neutral"
    ) {

        return;

    }

    cell.owner =
        "player";

    cell.strength =
        100;

    cell.captured =
        true;

    capturedTerritories.add(
        cell.id
    );

    updateTerritoryCell(
        cell
    );

    updateTerritoryUI();

    /*
       Each captured territory gives
       100 XP.
    */

    if (
        typeof updatePlayerStats ===
        "function"
    ) {

        updatePlayerStats();

    }

    if (
        typeof updateLeaderboard ===
        "function"
    ) {

        updateLeaderboard();

    }

    showTerritoryPopup(
        cell,
        true
    );

}


/* =========================================================
   TERRITORY POPUP
========================================================= */

function showTerritoryPopup(
    cell,
    justCaptured = false
) {

    if (
        !map ||
        !cell ||
        !cell.layer
    ) {

        return;

    }

    let ownerText =
        "UNCLAIMED";

    if (
        cell.owner ===
        "player"
    ) {

        ownerText =
            "YOUR TERRITORY";

    }

    if (
        cell.owner ===
        "enemy"
    ) {

        ownerText =
            "RIVAL TERRITORY";

    }

    const message =
        justCaptured
            ? "SECTOR CAPTURED • +100 XP"
            : ownerText;

    const popupHTML = `

        <div style="
            font-family:'Space Grotesk',monospace;
            min-width:150px;
        ">

            <div style="
                font-size:10px;
                letter-spacing:1.5px;
                font-weight:800;
                color:#0066ff;
                margin-bottom:6px;
            ">
                TERRAFIT SECTOR
            </div>

            <div style="
                font-size:14px;
                font-weight:800;
                margin-bottom:5px;
            ">
                ${message}
            </div>

            <div style="
                font-size:10px;
                color:#64748b;
            ">
                STRENGTH:
                ${cell.strength || 0}
            </div>

        </div>

    `;

    cell.layer
        .bindPopup(
            popupHTML
        )
        .openPopup();

}


/* =========================================================
   TERRITORY UI
========================================================= */

function updateTerritoryUI() {

    const capturedCount =
        capturedTerritories.size;

    if (
        territoryCount
    ) {

        territoryCount.textContent =
            capturedCount;

    }

    if (
        territoryStrength
    ) {

        territoryStrength.textContent =
            `${capturedCount * 100}%`;

    }

    if (
        territoryStatus
    ) {

        if (
            capturedCount > 0
        ) {

            territoryStatus.textContent =
                `${capturedCount} SECTOR${
                    capturedCount === 1
                        ? ""
                        : "S"
                } CONTROLLED`;

        } else {

            territoryStatus.textContent =
                "NO TERRITORY CONTROLLED";

        }

    }

}


/* =========================================================
   RESET TERRITORY
========================================================= */

function resetTerritories() {

    capturedTerritories.clear();

    territoryCells.forEach(
        (cell) => {

            cell.owner =
                "neutral";

            cell.strength =
                0;

            cell.captured =
                false;

            updateTerritoryCell(
                cell
            );

        }
    );

    updateTerritoryUI();

}