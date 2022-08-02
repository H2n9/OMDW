PAGES = {};

urlSearchParams = new URLSearchParams(window.location.search);

function updateURL() {
    history.pushState(
        null,
        "",
        window.location.pathname + "?" + urlSearchParams.toString()
    );
}

function setURLParam(key, value) {
    urlSearchParams.set(key, encodeURIComponent(value));

    updateURL();
}

function deleteURLParam(key) {
    urlSearchParams.delete(key);

    updateURL();
}

function addPage(key, pageObject) {
    PAGES[key] = pageObject;

    // add sidebar button

    var sidebar = document.getElementById("sidebar");

    if (!pageObject.hideFromPageList()) {
        var pageButton = document.createElement("button");
        pageButton.innerHTML = pageObject.getDisplayName();
        pageButton.id = key + "PageButton";
        if (!pageObject.canOpen()) {
            pageButton.innerHTML = "";
            pageButton.className = "coming-soon";

            var comingSoonText = document.createElement("span");
            comingSoonText.innerHTML = pageObject.getDisplayName();
            pageButton.appendChild(comingSoonText);
        }

        pageButton.addEventListener("click", function () {
            showPage(key);
        });

        sidebar.appendChild(pageButton);
    }

    pageObject.setup();
}

function setupPages() {
    addPage(
        "Dashboard",
        new DashboardPage(document.getElementById("DashboardPage"))
    );
    addPage(
        "Profiles",
        new ProfilesPage(document.getElementById("ProfilesPage"))
    );
    addPage(
        "Properties",
        new PropertiesPage(document.getElementById("PropertiesPage"))
    );
    addPage(
        "Employment",
        new EmploymentPage(document.getElementById("EmploymentPage"))
    );
    addPage(
        "Rankings",
        new RankingsPage(document.getElementById("RankingsPage"))
    );
    addPage(
        "Incidents",
        new IncidentsPage(document.getElementById("IncidentsPage"))
    );
    addPage("Charges", new ChargesPage(document.getElementById("ChargesPage")));
    addPage("Games", new GamesPage(document.getElementById("GamesPage")));
    addPage(
        "StreetGuesserGame",
        new StreetGuesserPage(document.getElementById("StreetGuesserPage"))
    );
}

function showPage(targetKey) {
    if (!PAGES[targetKey].canOpen()) return;

    for (const [key, value] of Object.entries(PAGES)) {
        var pageContent = value.pageElement;

        pageContent.className =
            key == targetKey ? "page-content" : "page-content hidden";

        if (value.hideFromPageList()) continue;
        var pageButton = document.getElementById(key + "PageButton");

        pageButton.className = key == targetKey ? "selected" : "";
    }

    setURLParam("p", targetKey);

    switch (targetKey) {
        case "Profiles":
            PAGES["Profiles"].currentProfile == null
                ? deleteURLParam("id")
                : setURLParam("id", PAGES["Profiles"].currentProfile.StateID);
            break;

        case "Properties":
            PAGES["Properties"].currentProperty == null
                ? deleteURLParam("id")
                : setURLParam("id", PAGES["Properties"].currentProperty.Name);
            break;

        case "Employment":
            PAGES["Employment"].currentEmployer == null
                ? deleteURLParam("id")
                : setURLParam("id", PAGES["Employment"].currentEmployer.Name);
            break;

        case "Incidents":
            PAGES["Incidents"].currentIncident == null
                ? deleteURLParam("id")
                : setURLParam(
                      "id",
                      PAGES["Incidents"].currentIncident.IncidentID
                  );
            break;

        default:
            deleteURLParam("id");
            break;
    }
}

function processURLQuery() {
    var url = window.location.href;

    var params = new URL(url).searchParams;

    var pageKey = decodeURIComponent(params.get("p"));

    if (pageKey == null) {
        showPage("Dashboard");
        return;
    }

    var targetID = null;
    if (params.has("id")) targetID = decodeURIComponent(params.get("id"));

    switch (pageKey) {
        case "Profiles":
            showPage("Profiles");

            if (targetID != null && !isNaN(targetID))
                PAGES["Profiles"].showProfile(targetID);
            break;

        case "Properties":
            showPage("Properties");

            if (targetID != null) PAGES["Properties"].showProperty(targetID);
            break;

        case "Employment":
            showPage("Employment");

            if (targetID != null) PAGES["Employment"].showEmployment(targetID);
            break;

        case "Incidents":
            showPage("Incidents");

            if (targetID != null) PAGES["Incidents"].showIncident(targetID);
            break;

        default:
            if (pageKey in PAGES) showPage(pageKey);
            else showPage("Dashboard");
            break;
    }
}

window.onload = () => {
    setupPages();
    processURLQuery();
};
