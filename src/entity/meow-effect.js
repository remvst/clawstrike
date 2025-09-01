class MeowEffect extends Entity {
    constructor() {
        super();
        this.z = Z_MEOW;
        this.affected = new Set();

        const labels = [
            nomangle('MEOW'),
            nomangle('MEWR'),
            nomangle('MEW'),
            nomangle('MOW'),
            nomangle('MAW'),
            nomangle('VRAOW'),
            nomangle('MEWR'),
            nomangle('MAORRAO'),
            nomangle('MEWP'),
        ]
        this.textLabel = labels[~~(this.seed * labels.length)];
        this.textX = rnd(-50, 50);
        this.textY = rnd(-20, -50);
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
        translate(this.x, this.y);
        ctx.globalAlpha = 1 - this.age / 0.5;

        const count = 5;
        const spacing = 10;

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        for (let r = roundToNearest(this.radius, spacing), i = 0 ; i < count ; r += spacing, i++) {
            beginPath();
            arc(0, 0, r, 0, TWO_PI);
            stroke();
        }

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '16px Impact';
        fillText(this.textLabel, this.textX, this.textY);
    }
}
