class Spikes extends Entity {

    type = 'spikes';

    angle = 0;
    length = CELL_SIZE;

    z = Z_SPIKES;

    get hitbox() {
        const hitbox = super.hitbox;
        hitbox.width = max(20, abs(cos(this.angle)) * this.length);
        hitbox.height = max(20, abs(sin(this.angle)) * this.length);
        return hitbox;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        for (const target of this.targets()) {
            if (target.hitbox.intersects(this.hitbox)) target.damage();
        }
    }

    * targets() {
        yield* this.world.category('cat');
        yield* this.world.category('human');
    }

    render() {
        ctx.fillStyle = '#000';
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.wrap(() => {
            ctx.translate(-this.length / 2, 1);

            ctx.beginPath();
            for (let x = 0 ; x < this.length; x += 10) {
                ctx.lineTo(x, 0);
                ctx.lineTo(x + 5, -20);
                ctx.lineTo(x + 10, 0);
            }
            ctx.fill();
        });
    }
}
