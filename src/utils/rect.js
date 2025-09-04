class Rect {
    x = 0;
    y = 0;
    width = 0;
    height = 0;

    intersects(other) {
        return abs(this.x - other.x) < (this.width + other.width) / 2 &&
            abs(this.y - other.y) < (this.height + other.height) / 2;
    }

    contains(point) {
        return abs(this.x - point.x) < this.width / 2 &&
            abs(this.y - point.y) < this.height / 2;
    }

    render() {
        if (DEBUG) ctx.wrap(() => {
            ctx.translate(this.x, this.y);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        });
    }
}
