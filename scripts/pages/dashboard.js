class DashboardPage extends Page {
    getDisplayName() {
        return "Dashboard";
    }

    setup() {
        this.buildMetricsSection();
        this.buildRecentUpdates();
    }

    buildMetricsSection() {
        var metricsParent = document.getElementById("metricsSection");

        var metrics = [
            { desc: "MDW Frames Collected", src: "framesCollected" },
            { spacer: true },
            { desc: "Profiles on Record", src: "profilesOnRecord" },
            { spacer: true },
            { desc: "Properties on Record", src: "propertiesOnRecord" },
            {
                desc: "Average Number of Keyholders per Property",
                src: "averageKeysPerProperty",
            },
            { spacer: true },
            { desc: "Businesses on Record", src: "businessesOnRecord" },
            {
                desc: "Average Number of Employees per Business",
                src: "averageEmployeesPerBusiness",
            },
            { spacer: true },
            { desc: "Incidents On Record", src: "incidentsOnRecord" },
            { spacer: true },
            { desc: "Types of Priors", src: "priorTypes" },
            { desc: "Total Priors on Record", src: "totalPriors" },
            {
                desc: "Average Priors per Profile",
                src: "averagePriorsPerProfile",
            },
        ];

        for (const value of metrics) {
            if (value.spacer != null) {
                metricsParent.appendChild(document.createElement("br"));
                continue;
            }

            var entry = document.createElement("div");
            entry.className = "metrics-entry";

            var leftText = document.createElement("span");
            leftText.innerHTML = value.desc;

            var rightText = document.createElement("span");

            if (value.src != "") {
                rightText.innerHTML = METRICS[value.src].toLocaleString();
            }

            entry.appendChild(leftText);
            entry.appendChild(rightText);

            metricsParent.appendChild(entry);
        }
    }

    buildRecentUpdates() {
        var parent = document.getElementById("recentUpdatesSection");

        for (const value of RECENT_UPDATES) {
            var entry = document.createElement("div");
            entry.className = "recent-entry";

            var profile = PROFILES[value];

            entry.innerHTML = `(${value}) ${profile.Name}`;

            entry.addEventListener("click", function () {
                showPage("Profiles");
                PAGES["Profiles"].showProfile(value);
            });

            parent.appendChild(entry);
        }
    }
}
