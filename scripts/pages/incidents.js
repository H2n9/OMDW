class IncidentsPage extends Page {
    getDisplayName() {
        return "Incidents";
    }

    setup() {
        this.setupSearch();
    }

    canOpen() {
        return false;
    }

    setupSearch() {
        this.search = new SearchProvider(
            pageElement.querySelector(".searchbar"),
            pageElement.querySelector(".search-content")
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
            case "complex":
                if (incident["IsComplex"] == true && value == "true")
                    return true;

            case "involves":
            case "involved":
                if (
                    incident.Criminals == null ||
                    incident.Criminals.length == 0
                )
                    return false;

                if (value in incident.Criminals) return true;

                break;
        }

        return false;
    }

    validIncidentFilters(incident, filters) {
        if (filters.length == 0 && incident.IsComplex != true) return false;

        for (let i = 0; i < filters.length; i++) {
            const filter = filters[i];

            if (!this.validateFilter(incident, filter)) return false;
        }

        return true;
    }

    createCheckbox(text, ticked = false, style = "") {
        var checkbox = document.createElement("div");
        checkbox.className = ticked ? "checkbox ticked" : "checkbox";
        checkbox.style = style;

        var box = document.createElement("span");
        box.innerHTML = ticked ? "✔" : "";

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

            var entryHeader = document.createElement("div");
            entryHeader.className = "header";
            if (criminal.StateID in PROFILES)
                entryHeader.innerHTML = `(${criminal.StateID}) ${
                    PROFILES[criminal.StateID].Name
                }`;
            else
                entryHeader.innerHTML = `(${criminal.StateID}) [Unknown Profile]`;

            entryParent.appendChild(entryHeader);

            // charge content
            var entryChargesParent = document.createElement("div");
            entryChargesParent.className = "charges";

            entryParent.appendChild(entryChargesParent);

            criminal.Charges.forEach((charge) => {
                var chargeTag = document.createElement("div");
                chargeTag.className = "tag";
                chargeTag.innerHTML = charge.Name;

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

                var amountText = document.createElement("div");
                amountText.style =
                    "color: var(--font-color-1); font-size: 1.75vmin;";
                amountText.innerHTML = `${criminal.Time} months (+${
                    criminal.Parole
                } months parole) / $${criminal.Fine.toLocaleString()} fine`;
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
                    this.createCheckbox("Processed", criminal.PleadedGuilty)
                );
            }

            crimParent.appendChild(entryParent);
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

        this.updateCriminals();
    }
}
