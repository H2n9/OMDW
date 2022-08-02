class StreetGuesserStreetObject extends StreetObject {
    constructor(parent, street) {
        super(parent, street);

        this.street = street;

        this.selectable = true;

        this.guessedCorrectly = false;
    }

    draw(ctx, offset, zoom) {
        if (this.selectable) {
            this.color = this.hovered || this.selected ? "orange" : "grey";
            ctx.globalAlpha = this.hovered ? 0.75 : 0.2;
        } else {
            this.color = this.guessedCorrectly ? "green" : "red";
            ctx.globalAlpha = 0.5;
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2 * zoom;

        for (const segment of this.segments) {
            segment.draw(ctx);
        }
    }
}

class StreetGuesserPage extends Page {
    getDisplayName() {
        return "Street Guesser";
    }

    hideFromPageList() {
        return true;
    }

    setup() {
        this.setupMap();

        document.getElementById("sgScore").innerHTML =
            "0/" + Object.keys(MAP.Streets).length;
    }

    setupMap() {
        this.map = new MapProvider(
            this.pageElement.querySelector(".properties-map")
        );

        for (const [key, street] of Object.entries(MAP.Streets)) {
            this.map.addMapObject(
                key,
                new StreetGuesserStreetObject(this.map, street)
            );
        }

        var context = this;

        this.map.onSelect = function (mapObject) {
            context.onStreetSelected(mapObject);
        };
    }

    onStreetSelected(mapObject) {
        if (!this.started) return;

        var correct =
            mapObject.street.Name == this.streetQueue[this.currentStreetIndex];

        if (correct) {
            mapObject.selectable = false;
            mapObject.guessedCorrectly = true;

            this.correct += 1;
        } else {
            var correctObject =
                this.map.mapObjects[this.streetQueue[this.currentStreetIndex]];
            correctObject.selectable = false;
            correctObject.guessedCorrectly = false;

            this.map.focus(correctObject);
        }

        this.streetQueue.splice(this.currentStreetIndex, 1);

        this.shiftSelectedStreet(0);

        this.guesses += 1;

        this.updateLabels();

        if (this.streetQueue.length <= 0) {
            this.endGame();
        }
    }

    updateLabels() {
        document.getElementById("sgScore").innerHTML = `${this.guesses}/${
            Object.keys(MAP.Streets).length
        }`;

        document.getElementById(
            "sgCorrect"
        ).innerHTML = `${this.correct} Correct`;

        document.getElementById("sgIncorrect").innerHTML = `${
            this.guesses - this.correct
        } Incorrect`;
    }

    updateTimer() {
        var time = new Date();
        var diff = new Date(time.getTime() - this.startTime.getTime());

        document.getElementById("sgTimer").innerHTML = `${diff
            .getMinutes()
            .toString()}:${diff.getSeconds().toString().padStart(2, "0")}`;

        var context = this;
        if (this.started)
            setTimeout(function () {
                context.updateTimer();
            }, 1000);
    }

    buildStreetQueue() {
        var queue = [];

        for (const [key, street] of Object.entries(MAP.Streets)) {
            queue.push(key);
        }

        // naive shuffle
        queue.sort(() => Math.random() - 0.5);

        this.streetQueue = queue;
    }

    shiftSelectedStreet(amount) {
        if (!this.started) return;

        this.currentStreetIndex =
            (this.currentStreetIndex + amount) % this.streetQueue.length;
        if (this.currentStreetIndex < 0)
            this.currentStreetIndex = this.streetQueue.length - 1;

        document.getElementById("sgCurrentStreet").innerHTML =
            this.streetQueue[this.currentStreetIndex];
    }

    startGame() {
        if (this.started) return;

        this.buildStreetQueue();

        this.currentStreetIndex = 0;
        this.started = true;

        this.guesses = 0;
        this.correct = 0;
        this.startTime = new Date();

        this.updateLabels();
        this.updateTimer();

        this.shiftSelectedStreet(0);

        document.getElementById("sgRetry").style.display = "inline";
    }

    endGame() {
        if (!this.started) return;

        this.started = false;
        this.showEndGame();
    }

    showEndGame() {
        this.map.resetView();

        var overlayParent = document.getElementById("sgOverlay");

        overlayParent.style.display = "block";
        overlayParent.className = "sg-overlay sg-overlay-fadein";

        document.getElementById("sgEndPercent").innerHTML = `${Math.round(
            (this.correct / Object.keys(MAP.Streets).length) * 100
        )}%`;
        document.getElementById("sgEndScore").innerHTML = `${this.correct}/${
            Object.keys(MAP.Streets).length
        }`;

        var time = new Date();
        var diff = new Date(time.getTime() - this.startTime.getTime());

        document.getElementById("sgEndTime").innerHTML = `${diff
            .getMinutes()
            .toString()}:${diff.getSeconds().toString().padStart(2, "0")}`;
    }

    retry() {
        var overlayParent = document.getElementById("sgOverlay");

        overlayParent.style.display = "none";
        overlayParent.className = "sg-overlay";

        this.map.clearMapObjects();

        for (const [key, street] of Object.entries(MAP.Streets)) {
            this.map.addMapObject(
                key,
                new StreetGuesserStreetObject(this.map, street)
            );
        }

        this.buildStreetQueue();

        this.startGame();
    }
}
