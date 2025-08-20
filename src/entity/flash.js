class Flash extends Entity {
    constructor(color) {
        super();
        this.color = color;
        this.alpha = 1;
    }

    render() {
        this.cancelCamera();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
}
