class PropertiesPage extends Page {
    getDisplayName() {
        return "Properties";
    }

    setup() {
        this.setupSearch();
        this.setupMap();
    }

    setupSearch() {
        this.search = new SearchProvider(
            pageElement.querySelector(".searchbar"),
            pageElement.querySelector(".search-content")
        );

        this.search.searchFunction = (term, filters) => {
            if ((term == null || term.length <= 1) && filters.length <= 0) {
                this.updateMap(Object.values(PROPERTIES));
                return Object.values(PROPERTIES);
            }

            var valid = [];

            for (const [key, value] of Object.entries(PROPERTIES)) {
                if (
                    this.validPropertyTerm(value, term) &&
                    this.validPropertyFilters(value, filters)
                )
                    valid.push(value);
            }

            this.updateMap(valid);

            return valid;
        };

        var context = this;
        this.search.drawFunction = (property) => {
            return {
                title: property.Name,
                subtitle:
                    property.Name in LOCATIONS ? "" : "[Unknown Location]",
                onclick: function () {
                    context.showProperty(property.Name);
                },
            };
        };

        this.search.setSearchFilters(["keyholder", "tag", "employment"]);

        this.search.update("");
    }

    validPropertyTerm(property, term) {
        if (term.length > 0) {
            if (property.Name.toLowerCase().includes(term)) return true;
        } else {
            return true;
        }

        return false;
    }

    validateFilter(property, filter) {
        var key = filter["key"];
        var value = filter["value"];

        switch (key) {
            case "tag":
            case "tag":
                for (let j = 0; j < property.Keys.length; j++) {
                    const keyholder = property.Keys[j];

                    var profile = PROFILES[keyholder["StateID"]];

                    if (profile.Tags == null) break;

                    for (let t = 0; t < profile.Tags.length; t++) {
                        const tag = profile.Tags[t];
                        if (tag.toLowerCase().includes(value)) return true;
                    }
                }

                break;

            case "employed":
            case "employer":
            case "employment":
                for (let j = 0; j < property.Keys.length; j++) {
                    const keyholder = property.Keys[j];

                    var profile = PROFILES[keyholder["StateID"]];

                    if (profile.Employment == null) break;

                    for (let t = 0; t < profile.Employment.length; t++) {
                        const employment = profile.Employment[t];
                        if (employment["Name"].toLowerCase().includes(value))
                            return true;
                    }
                }

                break;

            case "key":
            case "keys":
            case "keyholder":
            case "keyholders":
                for (let j = 0; j < property.Keys.length; j++) {
                    const keyholder = property.Keys[j];

                    if (keyholder.StateID.toString().includes(value))
                        return true;
                }

                break;
        }

        return false;
    }

    validPropertyFilters(property, filters) {
        for (let i = 0; i < filters.length; i++) {
            const filter = filters[i];

            if (!this.validateFilter(property, filter)) return false;
        }

        return true;
    }

    setupMap() {
        this.map = new MapProvider(
            pageElement.querySelector(".properties-map")
        );

        this.updateMap(Object.values(PROPERTIES));
    }

    updateMap(entries) {
        if (this.map == null) return;

        var mapEntries = [];

        entries.forEach((entry) => {
            var location = LOCATIONS[entry.Name];

            if (location == null) return;

            mapEntries.push({
                coords: location,
                drawFunction: (ctx, x, y, scale) => {
                    ctx.beginPath();
                    ctx.arc(x, y, 3 * scale, 0, 2 * Math.PI, false);

                    ctx.fillStyle = "#FF0000";
                    ctx.fill();

                    ctx.lineWidth = 0.75 * scale;
                    ctx.strokeStyle = "#000000";
                    ctx.stroke();
                },
            });
        });

        this.map.updateEntries(mapEntries);
    }

    showProperty(propertyName) {
        this.currentProperty = PROPERTIES[propertyName];

        if (propertyName in LOCATIONS) this.map.focus(LOCATIONS[propertyName]);
        else this.map.resetView();

        document.getElementById("propertyTitle").innerHTML = propertyName;

        var keyholderParent = document.getElementById("propertyKeyholders");
        keyholderParent.replaceChildren();

        // owner section
        var ownerHeader = document.createElement("div");
        ownerHeader.className = "title";
        ownerHeader.innerHTML = "Owner";
        keyholderParent.appendChild(ownerHeader);

        // find owner from all keyholders
        var ownerFound = false;
        for (let i = 0; i < this.currentProperty.Keys.length; i++) {
            const holder = this.currentProperty.Keys[i];

            if (holder.Type == "Owner") {
                var ownerEntry = document.createElement("div");
                ownerEntry.className = "entry";
                ownerEntry.innerHTML = `(${holder.StateID}) ${
                    PROFILES[holder.StateID].Name
                }`;
                ownerEntry.addEventListener("click", function () {
                    showPage("Profiles");
                    PAGES["Profiles"].showProfile(holder.StateID);
                    PAGES["Profiles"].search.update(
                        `housing="${propertyName}"`
                    );
                });
                keyholderParent.appendChild(ownerEntry);

                ownerFound = true;

                break;
            }
        }

        if (!ownerFound) {
            var unknownOwnerEntry = document.createElement("div");
            unknownOwnerEntry.className = "entry";
            unknownOwnerEntry.innerHTML = "[Unknown Owner]";
            keyholderParent.appendChild(unknownOwnerEntry);
        }

        // keyholder section
        var keyholderHeader = document.createElement("div");
        keyholderHeader.className = "title";
        keyholderHeader.innerHTML = "Keyholders";
        keyholderParent.appendChild(keyholderHeader);

        for (let i = 0; i < this.currentProperty.Keys.length; i++) {
            const holder = this.currentProperty.Keys[i];

            if (holder.Type == "Keyholder") {
                var keyholderEntry = document.createElement("div");
                keyholderEntry.className = "entry";
                keyholderEntry.innerHTML = `(${holder.StateID}) ${
                    PROFILES[holder.StateID].Name
                }`;
                keyholderEntry.addEventListener("click", function () {
                    showPage("Profiles");
                    PAGES["Profiles"].showProfile(holder.StateID);
                    PAGES["Profiles"].search.update(
                        `housing="${propertyName}"`
                    );
                });
                keyholderParent.appendChild(keyholderEntry);
            }
        }
    }
}
