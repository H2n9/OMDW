class ChargesPage extends Page {
    getDisplayName() {
        return "Charges";
    }

    setup() {
        this.searchObject = document.getElementById("chargesSearch");

        this.setupSearch();
    }

    setupSearch() {
        // custom search implementation due to requiring different behaviour

        var context = this;
        this.searchObject.addEventListener("input", function (evt) {
            context.update(this.value);
        });

        this.update("");
    }

    update(query) {
        this.searchObject.value = query;

        this.clearEntries();

        var validCharges = [];
        if (query.length > 0) {
            for (const [key, charge] of Object.entries(CHARGES)) {
                if (key.toLowerCase().includes(query.toLowerCase()))
                    validCharges.push(key);
            }
        } else {
            validCharges = Object.keys(CHARGES);
        }

        this.buildEntries(validCharges);
    }

    clearEntries() {
        document.getElementById("chargesSectionParent").replaceChildren();
    }

    buildEntries(keys) {
        const groupHeaders = [
            "Offenses Against Persons",
            "Offenses Involving Theft",
            "Offenses Invovling Fraud",
            "Offenses Involving Damage to Property",
            "Offenses Against Public Administration",
            "Offenses Against Public Order",
            "Offenses Against Public Health and Morals",
            "Offenses Against Public Safety",
            "Offenses Involving Operation of a Vehicle/General Citations",
            "Offenses Involving Natural Resources",
        ];

        var parent = document.getElementById("chargesSectionParent");

        var lastGroup = -1;
        var currentGroupContainer = null;

        for (const key of keys) {
            const charge = CHARGES[key];

            if (charge.Group != lastGroup) {
                lastGroup = charge.Group;

                var groupParent = document.createElement("div");
                groupParent.className = "charges-group-parent";
                parent.appendChild(groupParent);

                var groupHeader = document.createElement("div");
                groupHeader.className = "charges-group-header";
                groupHeader.innerHTML =
                    charge.Group != null
                        ? groupHeaders[charge.Group]
                        : "[Unknown]";
                groupParent.appendChild(groupHeader);

                currentGroupContainer = document.createElement("div");
                currentGroupContainer.className = "charges-container";
                groupParent.appendChild(currentGroupContainer);
            }

            var chargeEntry = this.buildChargeEntry(charge);
            currentGroupContainer.appendChild(chargeEntry);
        }
    }

    buildChargeValues(values) {
        var valuesHorizontal = document.createElement("div");
        valuesHorizontal.style =
            "display: flex; flex-direction:row; justify-content: space-around; margin: 0.5vmin;";

        var timeEntry = document.createElement("div");
        timeEntry.innerHTML = `${values["Time"].toLocaleString()} month(s)`;
        timeEntry.className = "charge-value";
        valuesHorizontal.appendChild(timeEntry);

        var fineEntry = document.createElement("div");
        fineEntry.innerHTML = `$${values["Fine"].toLocaleString()}`;
        fineEntry.className = "charge-value";
        valuesHorizontal.appendChild(fineEntry);

        var pointsEntry = document.createElement("div");
        pointsEntry.innerHTML = `${values["Points"].toLocaleString()} point(s)`;
        pointsEntry.className = "charge-value";
        valuesHorizontal.appendChild(pointsEntry);

        return valuesHorizontal;
    }

    buildChargeEntry(charge) {
        var chargeEntry = document.createElement("div");
        chargeEntry.className = "charge";

        chargeEntry.style.backgroundColor = {
            Misdemeanor: "#2d732a",
            Felony: "#ad7537",
            HUT: "#993232",
        }[charge.Type];

        var chargeHeader = document.createElement("div");
        chargeHeader.className = "charge-header";
        chargeHeader.innerHTML = charge.Name;
        chargeEntry.appendChild(chargeHeader);

        if ("Default" in charge)
            chargeEntry.appendChild(this.buildChargeValues(charge["Default"]));

        if ("Accomplice" in charge) {
            var sepA = document.createElement("div");
            sepA.className = "charge-seperator";
            chargeEntry.appendChild(sepA);

            var chargeHeader = document.createElement("div");
            chargeHeader.className = "charge-subheader";
            chargeHeader.innerHTML = "as Accomplice";
            chargeEntry.appendChild(chargeHeader);

            chargeEntry.appendChild(
                this.buildChargeValues(charge["Accomplice"])
            );
        }

        if ("Accessory" in charge) {
            var sepB = document.createElement("div");
            sepB.className = "charge-seperator";
            chargeEntry.appendChild(sepB);

            var chargeHeader = document.createElement("div");
            chargeHeader.className = "charge-subheader";
            chargeHeader.innerHTML = "as Accessory";
            chargeEntry.appendChild(chargeHeader);

            chargeEntry.appendChild(
                this.buildChargeValues(charge["Accessory"])
            );
        }

        var tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.innerHTML =
            charge.Description != null
                ? "<b>" + charge.Description + "</b>"
                : "<b>[Unknown Description]</b>";
        chargeEntry.appendChild(tooltip);

        if (
            "Description" in charge &&
            ("Accessory" in charge || "Accomplice" in charge)
        ) {
            var seperator = document.createElement("div");
            seperator.className = "charge-seperator";
            seperator.style.outlineColor = "white";
            tooltip.appendChild(seperator);

            var extraInfo = document.createElement("div");
            extraInfo.innerHTML =
                "<b>An accomplice differs from an accessory in that an accomplice is present at the actual crime, and could be prosecuted even if the main criminal (the principal) is not charged or convicted. An accessory is generally not present at the actual crime, and may be subject to lesser penalties than an accomplice or principal.</b>";
            tooltip.appendChild(extraInfo);
        }

        return chargeEntry;
    }
}
