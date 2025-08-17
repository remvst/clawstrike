class Rect {
    constructor(x, y, width, height) {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;

        this.cachedCenter = {};
    }

    intersect(other) {
        const thisCenter = this.center;
        const otherCenter = other.center;
        return abs(thisCenter.x - otherCenter.x) < (this.width + other.width) / 2 &&
            abs(thisCenter.y - otherCenter.y) < (this.height + other.height) / 2;
    }

    render() {
        if (DEBUG && DEBUG_HITBOXES) ctx.wrap(() => {
            ctx.translate(this.x, this.y);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        });
    }
}
