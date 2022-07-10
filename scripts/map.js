class MapProvider {
    constructor(canvasParent) {
        this.canvasParent = canvasParent;

        this.canvas = canvasParent.querySelector("canvas");

        // load map iamge
        this.mapImage = new Image();
        this.mapImage.src = "images/map.png";

        this.mapImage.onload = () => {
            // center the map based on image size
            this.offset = {
                x: this.mapImage.width / 2,
                y: this.mapImage.height / 1.75,
            };
            this.zoom = 0.5;

            this.draw();
        };

        this.icons = {};

        this.offset = { x: 0, y: 0 };
        this.zoom = 1;

        this.dragStart = { x: 0, y: 0 };
        this.isHolding = false;
        this.isMoving = false;
        this.propertiesInside = [];

        var context = this;

        this.canvas.onmousedown = function (e) {
            context.dragStart = context.getXY(e);
            context.isHolding = true;
            context.isMoving = false;
            
            context.propertiesInside = [];
			context.entries.forEach((entry) => {
				var entryX = context.canvas.width / 2 + (-context.offset.x + entry.coords.x) * context.zoom;
				var entryY = context.canvas.height / 2 + (-context.offset.y + entry.coords.y) * context.zoom;
				var isInside = (
					context.dragStart.x >= entryX - (3 * context.zoom) && 
					context.dragStart.x <= entryX + (3 * context.zoom) &&
					context.dragStart.y >= entryY - (3 * context.zoom) &&
					context.dragStart.y <= entryY + (3 * context.zoom)
				);
				if(isInside) {
					context.propertiesInside.push(entry);
				}
			});
        };

        window.addEventListener("mousemove", function (e) {
            if (!context.isHolding) return;

            var pos = context.getXY(e);

            var deltaX = context.dragStart.x - pos.x;
            var deltaY = context.dragStart.y - pos.y;

            var delta = deltaX * deltaX + deltaY * deltaY;
            if ((delta) => 9 * 9) context.isMoving = true;

            if (context.isMoving) {
                context.offset.x += deltaX / context.zoom;
                context.offset.y += deltaY / context.zoom;

                context.draw();

                context.dragStart = { x: pos.x, y: pos.y };
            }
        });

        window.addEventListener("mouseup", function (e) {
            context.isHolding = false;
        });

        this.canvas.addEventListener("wheel", function (e) {
            var centerDelta = context.getXY(e);

            if (e.deltaY > 0) {
                context.zoom /= 1.25;
            } else {
                context.zoom *= 1.25;

                context.offset.x +=
                    (centerDelta.x - context.canvas.width / 2) /
                    context.zoom /
                    4;
                context.offset.y +=
                    (centerDelta.y - context.canvas.height / 2) /
                    context.zoom /
                    4;
            }

            context.draw();
        });

        // resize callback
        new ResizeObserver(() => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;

            this.draw();
        }).observe(this.canvasParent);

        this.entries = [];
    }

    draw() {
        var ctx = this.canvas.getContext("2d");

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.drawImage(
            this.mapImage,
            this.canvas.width / 2 - this.offset.x * this.zoom,
            this.canvas.height / 2 - this.offset.y * this.zoom,
            this.mapImage.width * this.zoom,
            this.mapImage.height * this.zoom
        );

        this.entries.forEach((entry) => {
            var pos = this.getMapPosFromCoord(entry.coords);
            entry.drawFunction(
                ctx,
                this.canvas.width / 2 + (-this.offset.x + pos.x) * this.zoom,
                this.canvas.height / 2 + (-this.offset.y + pos.y) * this.zoom,
                this.zoom
            );
        });
    }

    updateEntries(entries) {
        this.entries = entries;

        this.draw();
    }

    getMapPosFromCoord(coord) {
        var centerX = coord.x;
        var centerY = coord.y;

        // manual offsets temporary for low res image
        return { x: centerX, y: centerY };
    }

    getXY(e) {
        var rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    animateMotion(delta) {
        var deltaT = delta / 1000;

        this.offset.x += (this.targetOffset.x - this.offset.x) * deltaT * 4;
        this.offset.y += (this.targetOffset.y - this.offset.y) * deltaT * 4;

        this.zoom += (this.targetZoom - this.zoom) * deltaT * 3;

        this.draw();

        if (
            Math.abs(this.targetOffset.x - this.offset.x) < 2 &&
            Math.abs(this.targetOffset.y - this.offset.y) < 2 &&
            Math.abs(this.targetZoom - this.zoom) < 0.2
        ) {
            this.animating = false;
            return;
        }

        var context = this;

        setTimeout(function () {
            context.animateMotion(1000 / 60);
        }, 1000 / 60);
    }

    focus(coords) {
        this.targetOffset = coords;
        this.targetZoom = 6;

        if (!this.animating) {
            this.animating = true;
            this.animateMotion(0);
        }
    }

    resetView() {
        this.targetOffset = {
            x: this.mapImage.width / 2,
            y: this.mapImage.height / 1.75,
        };
        this.targetZoom = 0.5;

        if (!this.animating) {
            this.animating = true;
            this.animateMotion(0);
        }
    }

    loadIcon(key, imageSrc) {
        var icon = new Image();
        icon.src = imageSrc;

        this.icons[key] = icon;
    }

    getIcon(key) {
        return this.icons[key];
    }
}
