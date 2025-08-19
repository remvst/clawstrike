const FLASH_DURATION = 0.2;

class Flash extends Entity {
    constructor(color) {
        super();
        this.color = color;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (this.age > FLASH_DURATION) {
            this.world.removeEntity(this);
        }
    }

    render() {
        this.cancelCamera();
        ctx.globalAlpha = interpolate(0.5, 0, this.age / FLASH_DURATION);
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
}
