class IncidentsPage extends Page {
    getDisplayName() {
        return "Incidents (WIP)";
    }

    setup() {
        this.setupSearch();
    }

    setupSearch() {
        this.search = new SearchProvider(
            this.pageElement.querySelector(".searchbar"),
            this.pageElement.querySelector(".search-content")
        );

        this.search.searchFunction = (term, filters) => {
            var valid = [];

            for (const [key, value] of Object.entries(INCIDENTS).reverse()) {
                if (
                    this.validIncidentTerm(value, term) &&
                    this.validIncidentFilters(value, filters)
                )
                    valid.push(value);
            }

            return valid;
        };

        var context = this;
        this.search.drawFunction = (incident) => {
            return {
                title:
                    incident.Title == null ? "[Unknown Title]" : incident.Title,
                subtitle: `ID: ${incident.IncidentID}`,
                onclick: function () {
                    context.showIncident(incident.IncidentID);
                },
            };
        };

        this.search.setSearchFilters([
            "description",
            "involves",
            "officer",
            "suspect",
            "charge",
        ]);

        this.search.update("");
    }

    validIncidentTerm(incident, term) {
        if (term.length > 0) {
            if (incident.Title != null)
                if (incident.Title.toLowerCase().includes(term)) return true;

            if (incident.IncidentID.toString().toLowerCase().includes(term))
                return true;
        } else {
            return true;
        }

        return false;
    }

    validateFilter(incident, filter) {
        var key = filter["key"];
        var value = filter["value"];

        switch (key) {
            case "desc":
            case "description":
                if (
                    incident.Description == null ||
                    incident.Description.length == 0
                )
                    return false;

                if (incident.Description.toLowerCase().includes(value))
                    return true;

                break;

            case "involves":
            case "involved":
                if (incident.Criminals != null) {
                    if (value in incident.Criminals) return true;
                    for (const [id, crim] of Object.entries(
                        incident.Criminals
                    )) {
                        if (!(id in PROFILES)) continue;

                        var profile = PROFILES[id];

                        if (profile["Name"].toLowerCase().includes(value))
                            return true;
                    }
                }

                if (incident.Officers != null && incident.Officers.length > 0)
                    for (const officer of incident.Officers) {
                        if (officer.toLowerCase().includes(value)) return true;
                    }

                break;

            case "officer":
            case "officers":
                if (incident.Officers == null || incident.Officers.length == 0)
                    return false;

                for (const officer of incident.Officers) {
                    if (officer.toLowerCase().includes(value)) return true;
                }
                break;

            case "suspect":
            case "suspects":
            case "criminal":
            case "criminals":
                if (incident.Criminals != null) {
                    if (value in incident.Criminals) return true;
                    for (const [id, crim] of Object.entries(
                        incident.Criminals
                    )) {
                        if (!(id in PROFILES)) continue;

                        var profile = PROFILES[id];

                        if (profile["Name"].toLowerCase().includes(value))
                            return true;
                    }
                }
                break;

            case "charge":
            case "charges":
            case "prior":
            case "priors":
                if (incident.Criminals != null) {
                    for (const [id, crim] of Object.entries(
                        incident.Criminals
                    )) {
                        for (const charge of crim.Charges) {
                            if (charge["Name"].toLowerCase().includes(value))
                                return true;
                        }
                    }
                }
                break;
        }

        return false;
    }

    validIncidentFilters(incident, filters) {
        if (incident.IsComplex != true) return false;

        for (let i = 0; i < filters.length; i++) {
            const filter = filters[i];

            if (!this.validateFilter(incident, filter)) return false;
        }

        return true;
    }

    createCheckbox(text, ticked, style = "") {
        var checkbox = document.createElement("div");
        if (ticked != null)
            checkbox.className = ticked ? "checkbox ticked" : "checkbox";
        else checkbox.className = "checkbox unknown";
        checkbox.style = style;

        var box = document.createElement("span");
        if (ticked != null) box.innerHTML = ticked ? "✔" : "";
        else box.innerHTML = "?";

        checkbox.appendChild(box);

        var textSpan = document.createElement("span");
        textSpan.innerHTML = text;

        checkbox.appendChild(textSpan);

        return checkbox;
    }

    updateCriminals() {
        var crimParent = document.getElementById("incidentCriminalsParent");

        crimParent.replaceChildren();

        if (this.currentIncident == null) return;
        if (this.currentIncident.Criminals == null) return;

        for (const [key, criminal] of Object.entries(
            this.currentIncident.Criminals
        )) {
            var entryParent = document.createElement("div");
            entryParent.className = "incident-criminal-entry";

            if (criminal["IsPartial"]) {
                entryParent.style.backgroundColor = "#3b344d";

                var warning = document.createElement("div");
                warning.className = "warning";
                warning.innerHTML = "!";

                var tooltip = document.createElement("div");
                tooltip.className = "tooltip";
                tooltip.innerHTML =
                    "<b>This entry is marked as partially complete and therefore may contain inaccurate information.</b>";

                entryParent.appendChild(warning);
                warning.appendChild(tooltip);
            }

            var entryHeader = document.createElement("div");
            entryHeader.className = "header";
            if (criminal.StateID in PROFILES) {
                entryHeader.innerHTML = `(${criminal.StateID}) ${
                    PROFILES[criminal.StateID].Name
                }`;

                entryHeader.addEventListener("click", function () {
                    showPage("Profiles");
                    PAGES["Profiles"].showProfile(criminal.StateID);
                });
            } else
                entryHeader.innerHTML = `(${criminal.StateID}) [Unknown Profile]`;

            entryParent.appendChild(entryHeader);

            // charge content
            var entryChargesParent = document.createElement("div");
            entryChargesParent.className = "charges";

            entryParent.appendChild(entryChargesParent);

            criminal.Charges.forEach((charge) => {
                var chargeTag = document.createElement("div");
                chargeTag.className = "tag";

                var chargeText = "";
                if (charge.Count > 1)
                    chargeText += charge.Count.toLocaleString() + "x ";
                if (charge.Type != "Default")
                    chargeText += `(${
                        { Accomplice: "Ap", Accessory: "As" }[charge.Type]
                    }) `;

                chargeText += charge.Name;

                chargeTag.innerHTML = chargeText;

                chargeTag.addEventListener("click", function () {
                    PAGES["Incidents"].search.update(
                        `charge="${charge.Name}" suspect="${criminal.StateID}"`
                    );
                });

                entryChargesParent.appendChild(chargeTag);
            });

            //

            var firstSectionContent = document.createElement("div");
            firstSectionContent.className = "content";
            entryParent.appendChild(firstSectionContent);

            firstSectionContent.appendChild(
                this.createCheckbox(
                    "Warrant for Arrest",
                    criminal.IsWarrant,
                    !criminal.IsWarrant
                        ? "margin-bottom: 2vmin; margin-top: 1vmin;"
                        : ""
                )
            );

            if (criminal.IsWarrant) {
                // first section containing warrant button and expiry
                firstSectionContent.style =
                    "flex-direction: row; justify-content: space-between;";

                var expiry = document.createElement("div");
                expiry.style =
                    "color: var(--font-color-1); font-size: 1.5vmin;";
                expiry.innerHTML =
                    criminal.Expiry == null
                        ? "[Unknown Expiry]"
                        : criminal.Expiry;
                firstSectionContent.appendChild(expiry);
            } else {
                // final charges
                var finalText = document.createElement("div");
                finalText.style =
                    "color: var(--font-color-1); font-size: 2.25vmin;";
                finalText.innerHTML = "Final";
                firstSectionContent.appendChild(finalText);

                // parole violation
                if (criminal.IsParoleViolation === true) {
                    var paroleText = document.createElement("div");
                    paroleText.style =
                        "color: var(--font-color-1); font-size: 1.75vmin;";
                    paroleText.innerHTML = "Parole Violated";
                    firstSectionContent.appendChild(paroleText);
                }

                var amountText = document.createElement("div");
                amountText.style =
                    "color: var(--font-color-1); font-size: 1.75vmin;";
                amountText.innerHTML = `${
                    criminal.Time != null
                        ? criminal.Time.toLocaleString()
                        : "[Unknown]"
                } months (+${
                    criminal.Parole != null
                        ? criminal.Parole.toLocaleString()
                        : "[Unknown]"
                } months parole) / $${
                    criminal.Fine != null
                        ? criminal.Fine.toLocaleString()
                        : "[Unknown]"
                } fine`;

                if (criminal.Points != null && criminal.Points > 0)
                    amountText.innerHTML += ` / ${
                        criminal.Points != null
                            ? criminal.Points.toLocaleString()
                            : "[Unknown]"
                    } point(s)`;

                firstSectionContent.appendChild(amountText);

                // second section containing processed and guilty plea
                var secondSectionContent = document.createElement("div");
                secondSectionContent.className = "content";
                secondSectionContent.style =
                    "flex-direction: row; justify-content: space-between;";
                entryParent.appendChild(secondSectionContent);

                secondSectionContent.appendChild(
                    this.createCheckbox(
                        "Pleaded Guilty",
                        criminal.PleadedGuilty
                    )
                );
                secondSectionContent.appendChild(
                    this.createCheckbox("Processed", criminal.Processed)
                );
            }

            crimParent.appendChild(entryParent);
        }
    }

    updateDetails() {
        var detailsParent = document.getElementById("incidentDetailsParent");

        detailsParent.replaceChildren();

        // officer involved

        var involvedParent = document.createElement("div");
        involvedParent.className = "incident-details";
        detailsParent.appendChild(involvedParent);

        var title = document.createElement("div");
        title.className = "title";
        title.innerHTML = "Officers Involved";
        involvedParent.appendChild(title);

        var tagContent = document.createElement("div");
        tagContent.className = "content";
        involvedParent.appendChild(tagContent);

        if (!("Officers" in this.currentIncident)) return;

        for (const officer of this.currentIncident.Officers) {
            var tag = document.createElement("div");
            tag.className = "tag";
            tag.innerHTML = officer;
            tag.addEventListener("click", function () {
                PAGES["Incidents"].search.update(`officer="${officer}"`);
            });

            tagContent.appendChild(tag);
        }
    }

    showIncident(incidentID) {
        if (!(incidentID in INCIDENTS)) {
            return;
        }

        this.currentIncident = INCIDENTS[incidentID];

        document.getElementById(
            "incidentSelectedHeader"
        ).innerHTML = `View Incident (${incidentID})`;

        document.getElementById("incidentTitle").innerHTML =
            this.currentIncident.Title == null
                ? "[Unknown Title]"
                : this.currentIncident.Title;

        document.getElementById("incidentDescription").innerHTML =
            this.currentIncident.Description == null
                ? ""
                : this.currentIncident.Description;

        this.updateDetails();
        this.updateCriminals();

        setURLParam("id", incidentID);
    }
}
