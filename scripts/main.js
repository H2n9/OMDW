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

    var pageButton = document.createElement("button");
    pageButton.innerHTML = pageObject.getDisplayName();
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
}

function showPage(targetKey) {
    if (!PAGES[targetKey].canOpen()) return;

    for (const [key, value] of Object.entries(PAGES)) {
        var pageContent = document.getElementById(key + "Page");

        if (key == targetKey) {
            value.onShow();
            pageContent.className = "page-content";
        } else pageContent.className = "page-content hidden";
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

        default:
            deleteURLParam("id");
            break;
    }
}

function processURLQuery() {
    var url = window.location.href;

    var params = new URL(url).searchParams;

    var pageKey = params.get("p");

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

        case "Pmployment":
            showPage("Employment");

            if (targetID != null) PAGES["Employment"].showEmployment(targetID);
            break;

        case "Rankings":
            showPage("Rankings");
            break;

        default:
            showPage("Dashboard");
            break;
    }
}

window.onload = () => {
    setupPages();
    processURLQuery();
};
