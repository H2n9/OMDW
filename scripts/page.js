class Page {
    constructor(pageElement) {
        self.pageElement = pageElement;
    }

    getDisplayName() {
        return "Unknown Page";
    }

    canOpen() {
        return true;
    }

    setup() {}

    onShow() {}
}
