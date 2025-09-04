class Water extends Entity {

    z = Z_WATER;

    type = 'water';

    length = CELL_SIZE;
    depth = CELL_SIZE;

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
        ctx.fillStyle = '#0ff';
        ctx.translate(this.x - this.length / 2, this.y - this.depth / 2);

        ctx.globalAlpha = 0.5;

        let speed = 10;
        for (const offset of [-20, -10, 0]) {
            ctx.wrap(() => {
                ctx.beginPath();
                for (let x = 0 ; x <= this.length; x += 2) {
                    ctx.lineTo(
                        x,
                        sin((x - this.age * speed) * TWO_PI / 20) * 2 + offset
                    );
                }
                ctx.lineTo(this.length, this.depth);
                ctx.lineTo(0, this.depth);
                ctx.fill();

                speed *= 1.5;
            });
        }
    }
}
