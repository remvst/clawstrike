class Flash extends Entity {
    alpha = 1;
    z = Z_FLASH;

    constructor(color) {
        super();
        this.color = color;
    }

    render() {
        this.cancelCamera();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
}
