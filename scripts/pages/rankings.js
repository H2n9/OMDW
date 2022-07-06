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
            "Vehicles with Highest Ownership": {
                func: function (parent) {
                    this.vehicleOwnershipFunction(parent);
                },
                headerLeft: "Vehicle",
                headerCenter: "",
                headerRight: "Count",
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
            "Average Priors of Business Employees": {
                func: function (parent) {
                    this.priorsPerBusinessFunction(parent);
                },
                headerLeft: "Business",
                headerCenter: "",
                headerRight: "Count",
                info: "For businesses with more than 3 employees. Only considers individuals whose priors are known.",
            },
            "Total Money Spent on Fines": {
                func: function (parent) {
                    this.finesPerProfileFunction(parent);
                },
                headerLeft: "State ID",
                headerCenter: "Name",
                headerRight: "Amount",
                info: "Calculated from priors with known fines. HUT charges or charges with values decided through court are not counted.",
            },
            "Total Time Spent in Jail": {
                func: function (parent) {
                    this.timePerProfileFunction(parent);
                },
                headerLeft: "State ID",
                headerCenter: "Name",
                headerRight: "Months",
                info: "Calculated from priors with known times. HUT charges or charges with values decided through court are not counted.",
            },
        };

        var sectionsParent = document.getElementById(
            "rankingsSectionContainer"
        );

        var indexParent = document.getElementById("rankingsIndexContainer");

        this.sectionParents = {};

        for (const [key, rankingSection] of Object.entries(rankingSections)) {
            var sectionParent = document.createElement("div");
            sectionParent.className = "section";
            sectionParent.style.width = "50vmin";
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
}
