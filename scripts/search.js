class SearchProvider {
    constructor(searchElement, contentElement) {
        this.searchElement = searchElement;
        this.contentElement = contentElement;

        this.searchFunction = null;
        this.drawFunction = null;

        var context = this;
        searchElement
            .querySelector("input")
            .addEventListener("input", function (evt) {
                context.update(this.value);
            });
    }

    processQuery(query) {
        const search_regex = /([a-zA-Z0-9]+)="(.*?)(?<!\\)"/g;

        var term = "";
        var filters = [...query.matchAll(search_regex)];

        if (filters.length <= 0) {
            term = query;
        } else {
            term = query.substring(0, filters[0].index - 1);
        }

        var processed_filters = [];

        filters.forEach((element) => {
            processed_filters.push({
                key: element[1].toLowerCase(),
                value: element[2].toLowerCase(),
            });
        });

        return { term: term.toLowerCase(), filters: processed_filters };
    }

    update(query) {
        this.searchElement.querySelector("input").value = query;

        this.clearEntries();

        var searchQuery = this.processQuery(query);

        var objects = this.searchFunction(
            searchQuery.term,
            searchQuery.filters
        );

        this.buildEntries(objects);
    }

    clearEntries() {
        this.contentElement.replaceChildren();
    }

    buildEntries(objects) {
        objects.forEach((object) => {
            var entry = this.drawFunction(object);

            var entryParent = document.createElement("div");
            entryParent.className = "entry";
            entryParent.onclick = entry.onclick;

            var title = document.createElement("div");
            title.innerHTML = entry.title;
            title.className = "title";

            var subtitle = document.createElement("div");
            subtitle.innerHTML = entry.subtitle;
            subtitle.className = "subtitle";

            this.contentElement.appendChild(entryParent);
            entryParent.appendChild(title);
            entryParent.appendChild(subtitle);
        });
    }

    setSearchFilters(filters) {
        var context = this;

        var filterParent = this.contentElement.parentElement.querySelector(
            ".search-tags-container"
        );

        filters.forEach((filter) => {
            var entry = document.createElement("div");
            entry.className = "search-tag";
            entry.innerHTML = filter;

            entry.addEventListener("click", function () {
                var inputField = context.searchElement.querySelector("input");
                var targetText = (inputField.value + ` ${filter}=""`).trim();

                context.update(targetText);
                inputField.focus();
                inputField.setSelectionRange(
                    targetText.length - 1,
                    targetText.length - 1
                );
            });

            filterParent.appendChild(entry);
        });
    }
}
