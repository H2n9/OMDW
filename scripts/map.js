function coordAsVec(coord) {
    return new Vector(coord[0], coord[1]);
}

class MapObject {
    constructor(parent) {
        this.parent = parent;

        this.hovered = false;

        this.selectable = false;
        this.selected = false;
    }

    draw(ctx, center, zoom) {}

    onHoverStart() {
        this.hovered = true;
    }

    onHoverEnd() {
        this.hovered = false;
    }

    onSelect() {
        this.selected = true;
    }

    onDeselect() {
        this.selected = false;
    }

    inCursor(cursor) {}

    inBounds(point) {
        // includes 10% safe zone
        if (
            point.x > this.bounds.min.x * 0.9 &&
            point.x < this.bounds.max.x * 1.1
        ) {
            if (
                point.y > this.bounds.min.y * 0.9 &&
                point.y < this.bounds.max.y * 1.1
            ) {
                return true;
            }
        }

        return false;
    }
}

class StreetSegment {
    constructor(parentStreet, points) {
        this.parentStreet = parentStreet;
        this.points = points;
    }

    getBounds() {
        var minX = 9999;
        var maxX = -9999;
        var minY = 9999;
        var maxY = -9999;

        for (var point of this.points) {
            minX = Math.min(minX, point[0]);
            maxX = Math.max(maxX, point[0]);
            minY = Math.min(minY, point[1]);
            maxY = Math.max(maxY, point[1]);
        }

        return {
            min: new Vector(minX, minY),
            center: new Vector((minX + maxX) / 2, (minY + maxY) / 2),
            max: new Vector(maxX, maxY),
            area: (maxX - minX) * (maxY - minY),
        };
    }

    inCursor(cursor) {
        var points = this.points;

        var cursorVec = this.parentStreet.parent.getCoordFromPos(cursor);

        for (let i = 1; i < points.length; i++) {
            var lastPoint = coordAsVec(points[i - 1]);
            var point = coordAsVec(points[i]);

            var lineDir = Vector.sub(point, lastPoint);
            var lineLength = lineDir.magnitude();
            lineDir = lineDir.normalized();

            var projectLength = Math.max(
                Math.min(
                    Vector.sub(cursorVec, lastPoint).dotProduct(lineDir),
                    lineLength
                ),
                0
            );

            var closestPoint = Vector.add(
                lastPoint,
                lineDir.mult(projectLength)
            );

            var dist = closestPoint.distance(cursorVec);

            if (dist < 6) {
                return dist;
            }
        }

        return null;
    }

    draw(ctx) {
        ctx.beginPath();

        var posStart = this.parentStreet.parent.getPosFromCoord(
            coordAsVec(this.points[0])
        );

        ctx.moveTo(posStart.x, posStart.y);

        for (let index = 1; index < this.points.length; index++) {
            const pointA = this.points[index];

            var pos = this.parentStreet.parent.getPosFromCoord(
                coordAsVec(pointA)
            );

            ctx.lineTo(pos.x, pos.y);
        }
        ctx.stroke();
    }
}

class StreetObject extends MapObject {
    constructor(parent, street) {
        super(parent);

        this.street = street;

        this.segments = [];

        // support legacy points only streets
        if ("Points" in this.street)
            this.segments.push(new StreetSegment(this, this.street["Points"]));
        else {
            for (const segment of this.street["Segments"]) {
                this.segments.push(new StreetSegment(this, segment));
            }
        }

        this.selectable = true;

        this.color = "dimgrey";

        this.textFade = 0;
        this.textFadeTarget = 1;

        this.calculateBounds();
    }

    calculateBounds() {
        var minX = 9999;
        var maxX = -9999;
        var minY = 9999;
        var maxY = -9999;

        for (const segment of this.segments) {
            var segmentBounds = segment.getBounds();

            minX = Math.min(minX, segmentBounds.min.x);
            maxX = Math.max(maxX, segmentBounds.max.x);
            minY = Math.min(minY, segmentBounds.min.y);
            maxY = Math.max(maxY, segmentBounds.max.y);
        }

        this.bounds = {
            min: new Vector(minX, minY),
            center: new Vector((minX + maxX) / 2, (minY + maxY) / 2),
            max: new Vector(maxX, maxY),
            area: (maxX - minX) * (maxY - minY),
        };
    }

    inCursor(cursor) {
        var closestDist = null;
        for (const segment of this.segments) {
            var dist = segment.inCursor(cursor);

            if (dist == null) continue;

            if (closestDist == null) closestDist = dist;
            else closestDist = Math.min(closestDist, dist);
        }

        return closestDist;
    }

    draw(ctx, offset, zoom) {
        if (!this.hovered && !this.selected) return;

        this.color = this.hovered || this.selected ? "red" : "grey";

        ctx.globalAlpha = this.hovered ? 0.5 : 0.1 + this.textFade * 0.25;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2 * zoom;

        for (const segment of this.segments) {
            segment.draw(ctx);
        }

        var textPos = this.parent.getPosFromCoord(this.bounds.center);

        if (
            (this.hovered && this.parent.hoveredObject == this) ||
            this.selected
        ) {
            this.textFadeTarget = 1;
        } else {
            this.textFadeTarget = 0;
        }

        this.textFade += (this.textFadeTarget - this.textFade) * 0.05;

        ctx.save();

        ctx.font = this.bounds.area ** 0.15 * 6 + "px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = this.textFade;

        ctx.translate(textPos.x, textPos.y);

        ctx.strokeText(this.street.Name, 0, 0);

        ctx.fillText(this.street.Name, 0, 0);

        ctx.restore();
    }
}

class LocationObject extends MapObject {
    constructor(parent, location) {
        super(parent);

        this.location = location;
        this.selectable = true;

        this.bounds = {
            min: coordAsVec(this.location.Coords).sub(new Vector(1, 1)),
            center: coordAsVec(this.location.Coords),
            max: coordAsVec(this.location.Coords).add(new Vector(1, 1)),
            area: 1,
        };
    }

    inCursor(cursor) {
        var cursorVec = this.parent.getCoordFromPos(cursor);

        var dist = this.bounds.center.distance(cursorVec);
        if (dist < 5) return dist;

        return null;
    }

    draw(ctx, offset, zoom) {
        ctx.globalAlpha = 1;
        var vec = this.parent.getPosFromCoord(coordAsVec(this.location.Coords));

        ctx.beginPath();
        ctx.arc(vec.x, vec.y, 4 * zoom, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.hovered || this.selected ? "red" : "#333333";
        ctx.fill();

        if (this.location.Icon != null) {
            var scaleFactor = 0.035 * zoom;
            var icon = this.parent.getIcon(this.location.Icon);
            ctx.drawImage(
                icon,
                vec.x - (icon.width * scaleFactor) / 2,
                vec.y - (icon.height * scaleFactor) / 2,
                icon.width * scaleFactor,
                icon.height * scaleFactor
            );
        }

        if (
            (offset.distance(this.bounds.center) < 60 && zoom >= 2) ||
            this.selected
        ) {
        } else {
            return;
        }

        ctx.font = 12 + "px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.strokeStyle = this.hovered || this.selected ? "red" : "grey";
        ctx.lineWidth = 3;

        var center = this.parent.getPosFromCoord(this.bounds.center);

        ctx.strokeText(this.location.Name, center.x, center.y + 5 * zoom);

        ctx.fillText(this.location.Name, center.x, center.y + 5 * zoom);
    }
}

class AreaObject extends MapObject {
    constructor(parent, area) {
        super(parent);

        this.selectable = false;

        this.area = area;

        this.calculateBounds();
    }

    calculateBounds() {
        var minX = 9999;
        var maxX = -9999;
        var minY = 9999;
        var maxY = -9999;

        for (var point of this.area.Points) {
            minX = Math.min(minX, point[0]);
            maxX = Math.max(maxX, point[0]);
            minY = Math.min(minY, point[1]);
            maxY = Math.max(maxY, point[1]);
        }

        this.bounds = {
            min: new Vector(minX, minY),
            center: new Vector((minX + maxX) / 2, (minY + maxY) / 2),
            max: new Vector(maxX, maxY),
            area: (maxX - minX) * (maxY - minY),
        };
    }

    inCursor(cursor) {
        return null;
    }

    draw(ctx, offset, zoom) {
        ctx.globalAlpha = 0.5;

        var posStart = this.parent.getPosFromCoord(
            coordAsVec(this.area.Points[0])
        );

        ctx.moveTo(posStart.x, posStart.y);

        for (let index = 1; index < this.area.Points.length; index++) {
            const pointA = this.area.Points[index];

            var pos = this.parent.getPosFromCoord(coordAsVec(pointA));

            ctx.lineTo(pos.x, pos.y);
        }

        ctx.lineTo(posStart.x, posStart.y);

        ctx.strokeStyle = "red";
        ctx.fill();
        ctx.stroke();

        if (
            (offset.distance(this.bounds.center) < 60 && zoom >= 2) ||
            this.selected
        ) {
        } else {
            return;
        }

        ctx.globalAlpha = 1;

        ctx.font = 14 + "px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.strokeStyle = this.hovered || this.selected ? "red" : "grey";
        ctx.lineWidth = 3;

        var center = this.parent.getPosFromCoord(this.bounds.center);

        ctx.strokeText(this.area.Name, center.x, center.y);

        ctx.fillText(this.area.Name, center.x, center.y);
    }
}

class MapProvider {
    mapImage = null;
    loadingMapImage = false;

    constructor(canvasParent) {
        this.canvasParent = canvasParent;

        this.canvas = canvasParent.querySelector("canvas");

        this.canvas.addEventListener("contextmenu", (event) =>
            event.preventDefault()
        );

        // load map iamge
        this.mapImage = new Image();
        this.mapImage.src = "images/map.png";

        this.mapImage.onload = () => {
            // center the map based on image size
            this.offset = new Vector(
                this.mapImage.width / 4,
                this.mapImage.height / 3.5
            );
            this.zoom = 0.5;

            this.draw();
        };

        this.icons = {};

        this.loadIcon("apartment", "images/apartment.svg");
        this.loadIcon("police", "images/shield.svg");
        this.loadIcon("hospital", "images/hospital.svg");
        this.loadIcon("bank", "images/bank.svg");
        this.loadIcon("gun", "images/gun.svg");
        this.loadIcon("cat", "images/cat.svg");
        this.loadIcon("burger", "images/burger.svg");
        this.loadIcon("pizza", "images/pizza.svg");
        this.loadIcon("bowl", "images/bowl.svg");

        this.offset = new Vector();
        this.zoom = 1.0;

        this.dragStart = new Vector();
        this.isHolding = false;
        this.isMoving = false;

        this.mapObjects = {};
        this.selectedObject = null;
        this.hoveredObject = null;

        this.onSelect = function (mapObject) {};

        var context = this;

        this.canvas.onmousedown = function (e) {
            context.dragStart = context.getXY(e);
            context.isHolding = true;
            context.isMoving = false;
        };

        window.addEventListener("mousemove", function (e) {
            var pos = context.getXY(e);

            context.testForHover(pos);

            if (!context.isHolding) {
                return;
            }

            var delta = Vector.sub(context.dragStart, pos);

            if (delta.magnitude() > 3) context.isMoving = true;

            if (context.isMoving) {
                context.offset.add(delta.mult(1 / context.zoom));

                context.dragStart.x = pos.x;
                context.dragStart.y = pos.y;

                context.animating = false;
            }
        });

        window.addEventListener("mouseup", function (e) {
            context.isHolding = false;
        });

        this.canvas.onmouseup = function (e) {
            if (!context.isMoving && e.button == 0) {
                context.testForSelect(context.getXY(e));
            }
        };

        this.canvas.addEventListener("wheel", function (e) {
            var centerDelta = context.getXY(e);

            context.animating = false;

            if (e.deltaY > 0) {
                context.zoom /= 1.25;
            } else {
                context.zoom *= 1.25;

                context.offset.add(
                    Vector.sub(
                        centerDelta,
                        new Vector(
                            context.canvas.width / 2,
                            context.canvas.height / 2
                        )
                    ).mult(1 / (context.zoom * 4))
                );
            }
        });

        // resize callback
        new ResizeObserver(() => {
            if (this.canvas.offsetParent === null) return;

            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        }).observe(this.canvasParent);
    }

    addMapObject(key, mapObject) {
        this.mapObjects[key] = mapObject;
    }

    clearMapObjects() {
        this.deselectObject();
        this.hoveredObject = null;
        this.selectedObject = null;
        this.mapObjects = {};
    }

    draw() {
        var context = this;

        // test canvas visibility -> if not visible wait before checking again
        if (this.canvas.offsetWidth == 0 && this.canvas.offsetHeight == 0) {
            setTimeout(function () {
                context.draw();
            }, 500);
            return;
        }

        console.log("drawing");

        var ctx = this.canvas.getContext("2d");

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.globalAlpha = 1.0;

        ctx.drawImage(
            this.mapImage,
            this.canvas.width / 2 - this.offset.x * this.zoom,
            this.canvas.height / 2 - this.offset.y * this.zoom,
            (this.mapImage.width * this.zoom) / 2,
            (this.mapImage.height * this.zoom) / 2
        );

        for (const [key, mapObject] of Object.entries(this.mapObjects)) {
            mapObject.draw(ctx, this.offset, this.zoom);
        }

        this.animateMotion(1000 / 60);

        setTimeout(function () {
            context.draw();
        }, 1000 / 60);
    }

    testForHover(pos) {
        var closestObject = null;
        var closestDist = Infinity;
        for (const [key, mapObject] of Object.entries(this.mapObjects)) {
            // perform simple bounds check first
            if (!mapObject.inBounds(this.getCoordFromPos(pos))) continue;

            // in cursor returns distance to cursor if within range otherwise null
            var dist = mapObject.inCursor(pos);
            if (dist == null) continue;

            if (dist < closestDist) {
                closestObject = mapObject;
                closestDist = dist;
            }
        }

        if (closestObject != null) {
            if (closestObject != this.hoveredObject) {
                if (this.hoveredObject != null) this.hoveredObject.onHoverEnd();

                closestObject.onHoverStart();

                this.hoveredObject = closestObject;
            }
        } else {
            if (this.hoveredObject != null) {
                this.hoveredObject.onHoverEnd();
                this.hoveredObject = null;
            }
        }
    }

    testForSelect(pos) {
        var closestObject = null;
        var closestDist = Infinity;
        for (const [key, mapObject] of Object.entries(this.mapObjects)) {
            if (!mapObject.selectable) continue;

            // perform simple bounds check first
            if (!mapObject.inBounds(this.getCoordFromPos(pos))) continue;

            // in cursor returns distance to cursor if within range otherwise null
            var dist = mapObject.inCursor(pos);
            if (dist == null) continue;

            if (dist < closestDist) {
                closestObject = mapObject;
                closestDist = dist;
            }
        }

        if (closestObject != null) {
            this.focus(closestObject);
            this.selectObject(closestObject);
        } else {
            if (this.selectedObject != null) this.deselectObject();
        }
    }

    getPosFromCoord(coord) {
        return new Vector(
            this.canvas.width / 2.0 + (-this.offset.x + coord.x) * this.zoom,
            this.canvas.height / 2.0 + (-this.offset.y + coord.y) * this.zoom
        );
    }

    getCoordFromPos(pos) {
        return new Vector(
            this.offset.x + (pos.x - this.canvas.width / 2.0) / this.zoom,
            this.offset.y + (pos.y - this.canvas.height / 2.0) / this.zoom
        );
    }

    getXY(e) {
        var rect = this.canvas.getBoundingClientRect();
        return new Vector(e.clientX - rect.left, e.clientY - rect.top);
    }

    animateMotion(delta) {
        if (!this.animating) return;

        var deltaT = delta / 1000;

        this.offset.x += (this.targetOffset.x - this.offset.x) * deltaT * 4;
        this.offset.y += (this.targetOffset.y - this.offset.y) * deltaT * 4;

        this.zoom += (this.targetZoom - this.zoom) * deltaT * 3;

        if (
            Math.abs(this.targetOffset.x - this.offset.x) < 2 &&
            Math.abs(this.targetOffset.y - this.offset.y) < 2 &&
            Math.abs(this.targetZoom - this.zoom) < 0.2
        ) {
            this.animating = false;
            return;
        }
    }

    selectObject(object) {
        if (!object.selectable) return;
        if (this.selectedObject != null) this.selectedObject.onDeselect();

        this.selectedObject = object;
        object.onSelect();

        this.onSelect(this.selectedObject);
    }

    deselectObject() {
        if (this.selectedObject != null) this.selectedObject.onDeselect();

        this.selectedObject = null;
    }

    focus(object) {
        var bounds = object.bounds;

        this.targetOffset = bounds.center;

        this.targetZoom = Math.min(
            Math.min(this.canvas.width, this.canvas.height) /
                1.2 /
                bounds.min.distance(bounds.max),
            10
        );

        this.animating = true;
    }

    focusLocation(location) {
        if (location.Name in this.mapObjects) {
            var targetObject = this.mapObjects[location.Name];

            this.selectObject(targetObject);
            this.focus(this.mapObjects[location.Name]);
            return;
        }

        if (location.Area in this.mapObjects) {
            var targetObject = this.mapObjects[location.Area];

            this.selectObject(targetObject);
            this.focus(this.mapObjects[location.Area]);
            return;
        }

        if (location.Street in this.mapObjects) {
            var targetObject = this.mapObjects[location.Street];

            this.selectObject(targetObject);
            this.focus(this.mapObjects[location.Street]);
        } else {
            this.resetView();
        }
    }

    resetView() {
        this.targetOffset = new Vector(
            this.mapImage.width / 4,
            this.mapImage.height / 3.5
        );
        this.targetZoom = 0.5;

        this.animating = true;
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
