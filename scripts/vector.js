class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    magnitude() {
        var length = Math.sqrt(this.x * this.x + this.y * this.y);
        return length;
    }

    distance(other) {
        var total =
            Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2);
        return Math.sqrt(total);
    }

    normalized() {
        var mag = this.magnitude();
        var normalizedVec = new Vector(this.x / mag, this.y / mag);
        return normalizedVec;
    }

    dotProduct(other) {
        return this.x * other.x + this.y * other.y;
    }

    project(other) {
        var proj = new Vector(0, 0);
        var dp = this.dotProduct(other);
        proj.x = (dp / (other.x ** 2 + other.y ** 2)) * other.x;
        proj.y = (dp / (other.x ** 2 + other.y ** 2)) * other.y;

        return proj;
    }

    static add(a, b) {
        return new Vector(a.x + b.x, a.y + b.y);
    }

    static sub(a, b) {
        return new Vector(a.x - b.x, a.y - b.y);
    }

    static mult(a, b) {
        return new Vector(a.x * b, a.y * b);
    }
}
