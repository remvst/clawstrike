class Rect {
    constructor(x, y, width, height) {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;

        this.cachedCenter = {};
    }

    intersects(other) {
        return abs(this.x - other.x) < (this.width + other.width) / 2 &&
            abs(this.y - other.y) < (this.height + other.height) / 2;
    }

    contains(point) {
        return abs(this.x - point.x) < this.width / 2 &&
            abs(this.y - point.y) < this.height / 2;
    }

    render() {
        if (DEBUG) wrap(() => {
            translate(this.x, this.y);
            ctx.strokeStyle = '#fff';
            strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        });
    }
}
