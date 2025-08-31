class MeowEffect extends Entity {
    constructor() {
        super();
        this.angle = this.seed * TWO_PI;
        this.scale = 1 + this.seed * 0.5;
        this.color = '#fff';
        this.z = Z_MEOW;
        this.stroke = true;
        this.affected = new Set();
    }

    get radius() {
        return interpolate(0, 400, this.age / 0.5);
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        for (const human of this.world.category('human')) {
            if (!this.affected.has(human) && distance(this, human) < this.radius) {
                human.hear(this);
            }
        }

        if (this.age > 0.5) {
            this.world?.removeEntity(this);
        }
    }

    render() {
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = 1 - this.age / 0.5;

        const count = 5;
        const spacing = 10;

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        for (let r = roundToNearest(this.radius, spacing), i = 0 ; i < count ; r += spacing, i++) {
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, TWO_PI);
            ctx.stroke();
        }
    }
}
