class Page {
    constructor(pageElement) {
        this.pageElement = pageElement;
    }

    getDisplayName() {
        return "Unknown Page";
    }

    canOpen() {
        return true;
    }

    hideFromPageList() {
        return false;
    }

    setup() {}

    onShow() {}
}
