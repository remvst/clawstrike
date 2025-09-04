MEOWS = [
    nomangle('MEOW'),
    nomangle('MEWR'),
    nomangle('MEW'),
    nomangle('MOW'),
    nomangle('MAW'),
    nomangle('VRAOW'),
    nomangle('MEWR'),
    nomangle('MAORRAO'),
    nomangle('MEWP'),
];

class MeowEffect extends Entity {

    z = Z_MEOW;
    affected = new Set();
    textLabel = MEOWS[~~(this.seed * MEOWS.length)];

    textX = rnd(-50, 50);
    textY = rnd(-20, -50);

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

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '16px Impact';
        ctx.fillText(this.textLabel, this.textX, this.textY);
    }
}
