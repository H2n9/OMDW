PAGES = {};

async function fetchHTML(path) {
    return await (await fetch(path)).text();
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
}

function processURLQuery() {
    var url = window.location.href;

    var params = new URL(url).searchParams;

    var first = params.entries().next().value;

    switch (first[0]) {
        case "profile":
            showPage("Profiles");

            var targetID = first[1];

            if (isNaN(targetID)) break;
            if (!targetID in PROFILES) break;

            PAGES["Profiles"].showProfile(targetID);
            break;
    }
}

window.onload = () => {
    setupPages();
    showPage("Dashboard");
    processURLQuery();
};
