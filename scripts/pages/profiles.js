class ProfilesPage extends Page {
    getDisplayName() {
        return "Profiles";
    }

    setup() {
        this.setupSearch();

        this.currentProfile = null;
    }

    setupSearch() {
        this.search = new SearchProvider(
            pageElement.querySelector(".searchbar"),
            pageElement.querySelector(".search-content")
        );

        this.search.searchFunction = (term, filters) => {
            if ((term == null || term.length <= 1) && filters.length <= 0) {
                return Object.values(PROFILES);
            }

            var valid = [];

            for (const [key, value] of Object.entries(PROFILES)) {
                if (
                    this.validProfileTerm(value, term) &&
                    this.validProfileFilters(value, filters)
                )
                    valid.push(value);
            }

            return valid;
        };

        var context = this;

        this.search.drawFunction = (profile) => {
            return {
                title: profile.Name == null ? "[Unknown]" : profile.Name,
                subtitle: "ID: " + profile.StateID,
                onclick: function () {
                    context.showProfile(profile.StateID);
                },
            };
        };

        this.search.setSearchFilters([
            "license",
            "tag",
            "vehicle",
            "housing",
            "employment",
            "prior",
            "description",
        ]);

        this.search.update("");
    }

    validProfileTerm(profile, term) {
        if (term.length > 0) {
            if (profile.Name != null)
                if (profile.Name.toLowerCase().includes(term)) return true;

            if (profile.StateID.toString().toLowerCase().includes(term))
                return true;
        } else {
            return true;
        }

        return false;
    }

    validateFilter(profile, filter) {
        var key = filter["key"];
        var value = filter["value"];

        switch (key) {
            case "desc":
            case "description":
                if (
                    profile.Description == null ||
                    profile.Description.length == 0
                )
                    return false;

                if (profile.Description.toLowerCase().includes(value))
                    return true;

                break;

            case "license":
            case "licenses":
                if (profile.Licenses == null || profile.Licenses.length == 0)
                    return false;

                for (let j = 0; j < profile.Licenses.length; j++) {
                    const license = profile.Licenses[j];

                    if (license.toLowerCase().includes(value)) return true;
                }

                break;

            case "tag":
            case "tags":
                if (profile.Tags == null || profile.Tags.length == 0)
                    return false;

                for (let j = 0; j < profile.Tags.length; j++) {
                    const tag = profile.Tags[j];

                    if (tag.toLowerCase().includes(value)) return true;
                }

                break;

            case "vehicle":
            case "vehicles":
                if (profile.Vehicles == null || profile.Vehicles.length == 0)
                    return false;

                for (let j = 0; j < profile.Vehicles.length; j++) {
                    const vehicle = profile.Vehicles[j];

                    if (vehicle.toLowerCase().includes(value)) return true;
                }

                break;

            case "housing":
            case "property":
                if (profile.Housing == null || profile.Housing.length == 0)
                    return false;

                for (let j = 0; j < profile.Housing.length; j++) {
                    const housing = profile.Housing[j];

                    if (housing["Name"].toLowerCase().includes(value))
                        return true;
                }

                break;

            case "employed":
            case "employer":
            case "employment":
                if (
                    profile.Employment == null ||
                    profile.Employment.length == 0
                )
                    return false;

                for (let j = 0; j < profile.Employment.length; j++) {
                    const employment = profile.Employment[j];

                    if (employment["Name"].toLowerCase().includes(value))
                        return true;
                }

                break;

            case "prior":
            case "priors":
                if (profile.Priors == null || profile.Priors.length == 0)
                    return false;

                for (let j = 0; j < profile.Priors.length; j++) {
                    const prior = profile.Priors[j];

                    if (prior["Name"].toLowerCase().includes(value))
                        return true;
                }
        }

        return false;
    }

    validProfileFilters(profile, filters) {
        for (let i = 0; i < filters.length; i++) {
            const filter = filters[i];

            if (!this.validateFilter(profile, filter)) return false;
        }

        return true;
    }

    validImageLink(string) {
        let url;

        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        if (url.hostname != "i.imgur.com") {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }

    updateIdentity() {
        if (this.currentProfile == null) return;

        var profile = this.currentProfile;

        document.getElementById("profileStateId").innerHTML = profile.StateID;
        document.getElementById("profileName").innerHTML = profile.Name;
        document.getElementById("profileDescription").innerHTML =
            profile.Description == null ? "" : profile.Description;

        document.getElementById("profileUpdateTime").innerHTML =
            profile.LastUpdated;

        if (this.validImageLink(profile.ImageURL))
            document.getElementById("profileImage").src = profile.ImageURL;
        else
            document.getElementById("profileImage").src =
                "https://i.imgur.com/ttNVaPp.png";
    }

    updateDetails() {
        var context = this;
        var detailsParent = document.getElementById("profileDetailsSection");

        detailsParent.replaceChildren();

        if (this.currentProfile == null) return;

        var profile = this.currentProfile;

        var SECTIONS = [
            "Licenses",
            "Tags",
            "Vehicles",
            "Housing",
            "Hotels",
            "Employment",
            "Priors",
        ];

        SECTIONS.forEach((section) => {
            var sectionParent = document.createElement("div");
            sectionParent.className = "profile-details-section";

            var header = document.createElement("div");
            header.className = "header";
            header.innerHTML = section;

            var content = document.createElement("div");
            content.className = "content";

            detailsParent.appendChild(sectionParent);
            sectionParent.appendChild(header);
            sectionParent.appendChild(content);

            // tags
            var entries = profile[section];

            if (entries == null) {
                var warning = document.createElement("div");
                warning.className = "warning";
                warning.innerHTML = "!";

                var tooltip = document.createElement("div");
                tooltip.className = "tooltip";
                tooltip.innerHTML =
                    "This section hasn't been collected yet and may be missing data.";

                header.appendChild(warning);
                warning.appendChild(tooltip);

                return;
            }

            entries.forEach((entry) => {
                var tag = document.createElement("div");
                tag.className = "tag";

                var tagText = "[ERROR]";

                switch (section) {
                    case "Licenses":
                        tagText = entry;

                        tag.addEventListener("click", function () {
                            context.search.update(`licenses="${entry}"`);
                        });
                        break;

                    case "Tags":
                        tagText = entry;

                        tag.addEventListener("click", function () {
                            context.search.update(`tags="${entry}"`);
                        });
                        break;

                    case "Vehicles":
                        tagText = entry;

                        tag.addEventListener("click", function () {
                            context.search.update(`vehicles="${entry}"`);
                        });
                        break;

                    case "Housing":
                        tagText = `${entry.Name} (${entry.Type})`;

                        tag.addEventListener("click", function () {
                            showPage("Properties");
                            PAGES["Properties"].showProperty(entry.Name);
                            PAGES["Properties"].search.update(
                                `keyholder="${context.currentProfile.StateID}"`
                            );
                        });
                        break;

                    case "Employment":
                        tagText = `${entry.Name} (${entry.Role})`;

                        tag.addEventListener("click", function () {
                            showPage("Employment");
                            PAGES["Employment"].showEmployment(entry.Name);
                            PAGES["Employment"].search.update(
                                `employee="${context.currentProfile.StateID}"`
                            );
                        });
                        break;

                    case "Priors":
                        tagText = `(${entry.Count}) ${entry.Name}`;

                        tag.addEventListener("click", function () {
                            context.search.update(`priors="${entry.Name}"`);
                        });
                        break;

                    default:
                        tagText = entry;
                        break;
                }

                tag.innerHTML = tagText;

                content.appendChild(tag);
            });
        });
    }

    showProfile(stateID) {
        this.currentProfile = PROFILES[stateID];

        this.updateIdentity();
        this.updateDetails();
    }
}
