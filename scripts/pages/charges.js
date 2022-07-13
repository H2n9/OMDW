class ChargesPage extends Page {
    getDisplayName() {
        return "Charges";
    }

    setup() {
        this.setupCharges();
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

        return chargeEntry;
    }

    setupCharges() {
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

        for (const [key, charge] of Object.entries(CHARGES)) {
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
}
