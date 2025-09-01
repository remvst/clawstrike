class Spikes extends Entity {

    constructor() {
        super();

        this.type = 'spikes';

        this.angle = 0;
        this.length = CELL_SIZE;

        this.z = Z_SPIKES;
    }

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
        translate(this.x, this.y);
        rotate(this.angle);

        wrap(() => {
            translate(-this.length / 2, 0);

            beginPath();
            for (let x = 0 ; x < this.length; x += 10) {
                lineTo(x, 0);
                lineTo(x + 5, -20);
                lineTo(x + 10, 0);
            }
            fill();
        });
    }
}
