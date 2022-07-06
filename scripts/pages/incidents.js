class IncidentsPage extends Page {
    getDisplayName() {
        return "Incidents";
    }

    canOpen() {
        return false;
    }

    setup() {
        this.setupSearch();
    }

    setupSearch() {
        this.search = new SearchProvider(
            pageElement.querySelector(".searchbar"),
            pageElement.querySelector(".search-content")
        );

        this.search.searchFunction = (query) => {
            if (query == null || query.length <= 1) {
                return Object.values(INCIDENTS).reverse();
            }

            var valid = [];

            for (const [key, value] of Object.entries(INCIDENTS)) {
                if (this.validIncidentQuery(query, value)) valid.push(value);
            }

            return valid.reverse();
        };

        this.search.drawFunction = (incident) => {
            return {
                title: incident.Title,
                subtitle: `ID: ${incident.IncidentID}`,
                onclick: function () {},
            };
        };

        this.search.update("");
    }

    validIncidentQuery(query, incident) {
        if (incident.Title != null)
            if (incident.Title.toLowerCase().includes(query)) return true;

        return false;
    }
}
