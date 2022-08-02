class EmploymentPage extends Page {
    getDisplayName() {
        return "Employment";
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
            if ((term == null || term.length <= 1) && filters.length <= 0) {
                return Object.values(EMPLOYMENT);
            }

            var valid = [];

            for (const [key, value] of Object.entries(EMPLOYMENT)) {
                if (
                    this.validEmploymentTerm(value, term) &&
                    this.validEmploymentFilters(value, filters)
                )
                    valid.push(value);
            }

            return valid;
        };

        var context = this;
        this.search.drawFunction = (employment) => {
            return {
                title: employment.Name,
                subtitle: `${employment.Employees.length} Employees`,
                onclick: function () {
                    context.showEmployment(employment.Name);
                },
            };
        };

        this.search.setSearchFilters(["employee"]);

        this.search.update("");
    }

    validEmploymentTerm(employment, term) {
        if (term.length > 0) {
            if (employment.Name.toLowerCase().includes(term)) return true;
        } else {
            return true;
        }

        return false;
    }

    validateFilter(employment, filter) {
        var key = filter["key"];
        var value = filter["value"];

        switch (key) {
            case "employee":
            case "employees":
                for (let j = 0; j < employment.Employees.length; j++) {
                    const employee = employment.Employees[j];

                    if (employee.StateID.toString().includes(value))
                        return true;
                }

                break;
        }

        return false;
    }

    validEmploymentFilters(employment, filters) {
        for (let i = 0; i < filters.length; i++) {
            const filter = filters[i];

            if (!this.validateFilter(employment, filter)) return false;
        }

        return true;
    }

    buildEmployeeSection() {
        var employeeParent = document.getElementById("employeeParent");

        employeeParent.replaceChildren();

        var roleSections = {};

        var context = this;
        for (const value of this.currentEmployer.Employees) {
            var role = value.Role;

            var entry = document.createElement("div");
            entry.className = "entry";
            entry.innerHTML = `${PROFILES[value.StateID].Name}`;
            entry.addEventListener("click", function () {
                showPage("Profiles");
                PAGES["Profiles"].showProfile(value.StateID);
                PAGES["Profiles"].search.update(
                    `employment="${context.currentEmployer.Name}"`
                );
            });

            if (role in roleSections) {
                roleSections[role].appendChild(entry);
            } else {
                var roleSectionParent = document.createElement("div");

                roleSectionParent.className = "role-container";

                // content
                var roleSectionHeader = document.createElement("div");
                roleSectionHeader.className = "header";
                roleSectionHeader.innerHTML = role;
                roleSectionParent.appendChild(roleSectionHeader);

                var roleSectionList = document.createElement("div");
                roleSectionList.className = "list";
                roleSectionParent.appendChild(roleSectionList);

                employeeParent.appendChild(roleSectionParent);

                roleSections[role] = roleSectionList;

                roleSectionList.appendChild(entry);
            }
        }
    }

    showEmployment(employerName) {
        if (!(employerName in EMPLOYMENT)) {
            return;
        }

        this.currentEmployer = EMPLOYMENT[employerName];

        document.getElementById("employerTitle").innerHTML = employerName;

        this.buildEmployeeSection();

        setURLParam("id", employerName);
    }
}
