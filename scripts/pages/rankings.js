class RankingsPage extends Page {
    getDisplayName() {
        return "Rankings";
    }

    setup() {
        this.setupRankingSections();
    }

    setupRankingSections() {
        var context = this;

        var rankingSections = {
            Priors: {
                header: true,
            },
            "Most Priors on Record": {
                func: function (parent) {
                    this.mostPriorsFunction(parent);
                },
                headerLeft: "State ID",
                headerCenter: "Name",
                headerRight: "Count",
            },
            "Most Unique Priors on Record": {
                func: function (parent) {
                    this.mostUniquePriorsFunction(parent);
                },
                headerLeft: "State ID",
                headerCenter: "Name",
                headerRight: "Count",
            },
            "Total Amount of Priors per Type": {
                func: function (parent) {
                    this.totalPriorTypesFunction(parent);
                },
                headerLeft: "Prior",
                headerCenter: "",
                headerRight: "Count",
            },
            "Total Money Spent on Fines": {
                func: function (parent) {
                    this.finesPerProfileFunction(parent);
                },
                headerLeft: "State ID",
                headerCenter: "Name",
                headerRight: "Amount",
                info: "Calculated from priors with known fines. Assumes charge is primary or accomplice. HUT charges or charges with values decided through court are not counted.",
            },
            "Total Time Spent in Jail": {
                func: function (parent) {
                    this.timePerProfileFunction(parent);
                },
                headerLeft: "State ID",
                headerCenter: "Name",
                headerRight: "Months",
                info: "Calculated from priors with known times. Assumes charge is primary or accomplice. HUT charges or charges with values decided through court are not counted.",
            },
            Vehicles: {
                header: true,
            },
            "Vehicles with Highest Ownership": {
                func: function (parent) {
                    this.vehicleOwnershipFunction(parent);
                },
                headerLeft: "Vehicle",
                headerCenter: "",
                headerRight: "Count",
            },
            Tags: {
                header: true,
            },
            "Average Priors per Tag": {
                func: function (parent) {
                    this.priorsPerTagFunction(parent);
                },
                headerLeft: "Tag",
                headerCenter: "",
                headerRight: "Count",
                info: "For tags associated with groups that have 3 or more members on record. Only considers individuals whose priors are known.",
            },
            Employment: {
                header: true,
            },
            "Average Priors of Business Employees": {
                func: function (parent) {
                    this.priorsPerBusinessFunction(parent);
                },
                headerLeft: "Business",
                headerCenter: "",
                headerRight: "Count",
                info: "For businesses with more than 3 employees. Only considers individuals whose priors are known.",
            },
            Incidents: {
                header: true,
            },
            "Officers who Write the Most Incidents": {
                func: function (parent) {
                    this.officerWritesMostIncidentsFunction(parent);
                },
                headerLeft: "Name",
                headerCenter: "",
                headerRight: "Count",
            },
            "Officers Involved in the Most Incidents": {
                func: function (parent) {
                    this.officerWithMostIncidentsFunction(parent);
                },
                headerLeft: "Name",
                headerCenter: "",
                headerRight: "Count",
            },
            "Officer's Contributions to State Funds Through Fines": {
                func: function (parent) {
                    this.officerWithHighestIncomeFunction(parent);
                },
                headerLeft: "Name",
                headerCenter: "",
                headerRight: "Amount",
                info: "Contribution is divided evenly between all officers involved in an incident. Calculated from charges with known fines. HUT charges or charges with values decided through court are not counted.",
            },
            "Officer Most Associated With Each Charge": {
                func: function (parent) {
                    this.mostCommonOfficerPerCharge(parent);
                },
                headerLeft: "Charge",
                headerCenter: "",
                headerRight: "Officer",
                info: "Considers all officers involved in an incident. Charges are only considered once per incident. Where charges occured 3 or more times.",
            },
            "Most Common Arrestee by Officer": {
                func: function (parent) {
                    this.mostCommonArresteeByOfficer(parent);
                },
                headerLeft: "Name",
                headerCenter: "",
                headerRight: "Arrestee",
                info: "Considers all officers involved in an incident. Where arrests occured 3 or more times.",
            },
            "Most Common Victim in Incidents": {
                func: function (parent) {
                    this.mostCommonVictim(parent);
                },
                headerLeft: "Victim",
                headerCenter: "",
                headerRight: "Count",
                info: "When occuring 3 or more times.",
            },
        };

        var sectionsParent = document.getElementById(
            "rankingsSectionContainer"
        );

        var indexParent = document.getElementById("rankingsIndexContainer");

        this.sectionParents = {};

        for (const [key, rankingSection] of Object.entries(rankingSections)) {
            if (rankingSection.header != null) {
                var headerIndexEntry = document.createElement("div");
                headerIndexEntry.innerHTML = key;
                headerIndexEntry.className = "entry-header";
                indexParent.appendChild(headerIndexEntry);

                continue;
            }

            // add to index
            var indexEntry = document.createElement("div");
            indexEntry.className = "entry";
            indexEntry.innerHTML = key;
            indexEntry.addEventListener("click", function () {
                context.sectionParents[key].scrollIntoView({
                    behavior: "smooth",
                    inline: "start",
                });
            });

            indexParent.appendChild(indexEntry);

            //

            var sectionParent = document.createElement("div");
            sectionParent.className = "section";
            sectionParent.style.minWidth = "50vmin";
            sectionParent.style.marginRight = "8vmin";
            sectionParent.style.background = "none";
            this.sectionParents[key] = sectionParent;

            var sectionHeader = document.createElement("div");
            sectionHeader.className = "header";
            sectionHeader.style.flexDirection = "column";

            var sectionTitle = document.createElement("div");
            sectionTitle.className = "title";
            sectionTitle.style.fontSize = "2vmin";
            sectionTitle.innerHTML = key;

            // content headers
            var contentHeaderParent = document.createElement("div");
            contentHeaderParent.className = "rankings-content-headers";

            var contentHeader1 = document.createElement("div");
            contentHeader1.innerHTML = rankingSection.headerLeft;
            contentHeaderParent.appendChild(contentHeader1);

            var contentHeader2 = document.createElement("div");
            contentHeader2.innerHTML = rankingSection.headerCenter;
            contentHeaderParent.appendChild(contentHeader2);

            var contentHeader3 = document.createElement("div");
            contentHeader3.innerHTML = rankingSection.headerRight;
            contentHeaderParent.appendChild(contentHeader3);

            // content
            var sectionContent = document.createElement("div");
            sectionContent.className = "rankings-content";

            sectionsParent.appendChild(sectionParent);
            sectionParent.appendChild(sectionHeader);
            sectionHeader.appendChild(sectionTitle);
            sectionHeader.appendChild(contentHeaderParent);
            sectionParent.appendChild(sectionContent);

            rankingSection.func.call(this, sectionContent);

            // info
            if (rankingSection.info != null) {
                var infoIcon = document.createElement("div");
                infoIcon.className = "help";
                infoIcon.innerHTML = "?";

                var tooltip = document.createElement("div");
                tooltip.className = "tooltip";
                tooltip.innerHTML = `<b>${rankingSection.info}</b>`;
                tooltip.style.width = "32vmin";

                sectionHeader.appendChild(infoIcon);
                infoIcon.appendChild(tooltip);
            }
        }
    }

    addRankingEntry(parent, entry) {
        var entryParent = document.createElement("div");
        entryParent.className = "entry";
        if (entry.onclick != null)
            entryParent.addEventListener("click", function () {
                entry.onclick();
            });

        var left = document.createElement("span");
        left.className = "left";
        left.innerHTML = entry.left == null ? "" : entry.left;

        var middle = document.createElement("span");
        middle.className = "middle";
        middle.innerHTML = entry.middle == null ? "" : entry.middle;

        var right = document.createElement("span");
        right.className = "right";
        right.innerHTML = entry.right == null ? "" : entry.right;

        parent.appendChild(entryParent);
        entryParent.appendChild(left);
        entryParent.appendChild(middle);
        entryParent.appendChild(right);
    }

    mostPriorsFunction(parent) {
        RANKINGS.mostPriors.forEach((entry) => {
            var profile = PROFILES[entry.stateId];

            this.addRankingEntry(parent, {
                left: `(${entry.stateId})`,
                middle: `${profile.Name}`,
                right: `${entry.count.toLocaleString()}`,
                onclick: function () {
                    showPage("Profiles");
                    PAGES["Profiles"].showProfile(entry.stateId);
                },
            });
        });
    }

    mostUniquePriorsFunction(parent) {
        RANKINGS.mostUniquePriors.forEach((entry) => {
            var profile = PROFILES[entry.stateId];

            this.addRankingEntry(parent, {
                left: `(${entry.stateId})`,
                middle: `${profile.Name}`,
                right: `${entry.count.toLocaleString()}`,
                onclick: function () {
                    showPage("Profiles");
                    PAGES["Profiles"].showProfile(entry.stateId);
                },
            });
        });
    }

    totalPriorTypesFunction(parent) {
        RANKINGS.totalPriorTypes.forEach((entry) => {
            var priorString =
                entry.prior.length > 50
                    ? entry.prior.substring(0, 47).trim() + "..."
                    : entry.prior;

            this.addRankingEntry(parent, {
                left: `${priorString}`,
                right: `${entry.value.toLocaleString()}`,
                onclick: function () {
                    showPage("Profiles");
                    PAGES["Profiles"].search.update(`prior="${entry.prior}"`);
                },
            });
        });
    }

    vehicleOwnershipFunction(parent) {
        RANKINGS.vehicleOwnership.forEach((entry) => {
            this.addRankingEntry(parent, {
                left: `${entry.name}`,
                right: `${entry.count.toLocaleString()}`,
                onclick: function () {
                    showPage("Profiles");
                    PAGES["Profiles"].search.update(`vehicles="${entry.name}"`);
                },
            });
        });
    }

    mostEmployment(parent) {
        RANKINGS.idsWithMostEmployment.forEach((entry) => {
            var profile = PROFILES[entry.stateId];

            this.addRankingEntry(parent, {
                left: `(${entry.stateId})`,
                middle: `${profile.Name}`,
                right: `${entry.value.toLocaleString()}`,
                onclick: function () {
                    showPage("Profiles");
                    PAGES["Profiles"].showProfile(entry.stateId);
                },
            });
        });
    }

    priorsPerBusinessFunction(parent) {
        RANKINGS.averageBusinessPriors.forEach((entry) => {
            this.addRankingEntry(parent, {
                left: `${entry.name}`,
                right: `${Math.round(entry.value).toLocaleString()}`,
                onclick: function () {
                    showPage("Employment");
                    PAGES["Employment"].showEmployment(entry.name);
                },
            });
        });
    }

    priorsPerTagFunction(parent) {
        RANKINGS.averageTagPriors.forEach((entry) => {
            this.addRankingEntry(parent, {
                left: `${entry.name}`,
                right: `${Math.round(entry.value).toLocaleString()}`,
                onclick: function () {
                    showPage("Profiles");
                    PAGES["Profiles"].search.update(`tag="${entry.name}"`);
                },
            });
        });
    }

    finesPerProfileFunction(parent) {
        RANKINGS.profileFines.forEach((entry) => {
            var profile = PROFILES[entry.stateId];

            this.addRankingEntry(parent, {
                left: `(${entry.stateId})`,
                middle: `${profile.Name}`,
                right: `$${entry.value.toLocaleString()}`,
                onclick: function () {
                    showPage("Profiles");
                    PAGES["Profiles"].showProfile(entry.stateId);
                },
            });
        });
    }

    timePerProfileFunction(parent) {
        RANKINGS.profileTime.forEach((entry) => {
            var profile = PROFILES[entry.stateId];

            this.addRankingEntry(parent, {
                left: `(${entry.stateId})`,
                middle: `${profile.Name}`,
                right: `${entry.value.toLocaleString()}`,
                onclick: function () {
                    showPage("Profiles");
                    PAGES["Profiles"].showProfile(entry.stateId);
                },
            });
        });
    }

    officerWritesMostIncidentsFunction(parent) {
        RANKINGS.totalIncidentsByOfficer.forEach((entry) => {
            this.addRankingEntry(parent, {
                left: `${entry.officer}`,
                middle: ``,
                right: `${entry.count.toLocaleString()}`,
                onclick: function () {
                    showPage("Incidents");
                    PAGES["Incidents"].search.update(
                        `officer="${entry.officer}"`
                    );
                },
            });
        });
    }

    officerWithMostIncidentsFunction(parent) {
        RANKINGS.totalInvolvmentByOfficer.forEach((entry) => {
            this.addRankingEntry(parent, {
                left: `${entry.officer}`,
                middle: ``,
                right: `${entry.count.toLocaleString()}`,
                onclick: function () {
                    showPage("Incidents");
                    PAGES["Incidents"].search.update(
                        `officer="${entry.officer}"`
                    );
                },
            });
        });
    }

    officerWithHighestIncomeFunction(parent) {
        RANKINGS.totalIncomeByOfficer.forEach((entry) => {
            this.addRankingEntry(parent, {
                left: `${entry.officer}`,
                middle: ``,
                right: `$${entry.income.toLocaleString()}`,
                onclick: function () {
                    showPage("Incidents");
                    PAGES["Incidents"].search.update(
                        `officer="${entry.officer}"`
                    );
                },
            });
        });
    }

    mostCommonArresteeByOfficer(parent) {
        RANKINGS.mostCommonArresteeByOfficer.forEach((entry) => {
            var profile = PROFILES[entry.stateId];
            this.addRankingEntry(parent, {
                left: `${entry.officer}`,
                middle: ``,
                right: `${
                    profile != null ? profile["Name"] : `[${entry.stateId}]`
                }`,
                onclick: function () {
                    showPage("Incidents");
                    PAGES["Incidents"].search.update(
                        `officer="${entry.officer}" suspect="${entry.stateId}"`
                    );
                },
            });
        });
    }

    mostCommonOfficerPerCharge(parent) {
        RANKINGS.mostCommonOfficerByCharge.forEach((entry) => {
            var chargeString =
                entry.charge.length > 50
                    ? entry.charge.substring(0, 47).trim() + "..."
                    : entry.charge;

            this.addRankingEntry(parent, {
                left: `${chargeString}`,
                middle: ``,
                right: `${entry.officer}`,
                onclick: function () {
                    showPage("Incidents");
                    PAGES["Incidents"].search.update(
                        `officer="${entry.officer}" charge="${entry.charge}"`
                    );
                },
            });
        });
    }

    mostCommonVictim(parent) {
        RANKINGS.mostCommonVictim.forEach((entry) => {
            this.addRankingEntry(parent, {
                left: `${entry.victim}`,
                middle: ``,
                right: `${entry.count.toLocaleString()}`,
                onclick: function () {},
            });
        });
    }
}
