class Water extends Entity {

    constructor() {
        super();

        this.z = -1;

        this.type = 'water';

        this.length = CELL_SIZE;
        this.depth = CELL_SIZE;
    }

    get hitbox() {
        const hitbox = super.hitbox;
        hitbox.width = this.length;
        hitbox.height = this.depth;
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
        ctx.fillStyle = '#fff';
        ctx.translate(this.x - this.length / 2, this.y - this.depth / 2);

        ctx.globalAlpha = 0.5;

        for (const offset of [-10, 0]) {
            ctx.wrap(() => {
                ctx.beginPath();
                for (let x = 0 ; x <= this.length; x += 2) {
                    ctx.lineTo(
                        x,
                        sin((x - this.age * 10) * TWO_PI / 20) * 2 + offset
                    );
                }
                ctx.lineTo(this.length, this.depth);
                ctx.lineTo(0, this.depth);
                ctx.fill();
            });
        }
    }
}
