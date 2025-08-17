class Bullet extends Entity {
    constructor(angle) {
        super();
        this.angle = angle;
        this.hitbox.width = 2;
        this.hitbox.height = 2;
    }

    cycle(elapsed) {
        const BULLET_SPEED = 800;
        this.x += elapsed * Math.cos(this.angle) * BULLET_SPEED;
        this.y += elapsed * Math.sin(this.angle) * BULLET_SPEED;

        // Structure hits
        for (const structure of this.world.category('structure')) {
            if (structure.cellAt(this.x, this.y)) {
                this.world.removeEntity(this);
                return;
            }
        }

        // Cat hits
        for (const target of this.targets()) {
            if (this.hitbox.intersects(target.hitbox)) {
                this.world.removeEntity(this);
                target.damage();
                return;
            }
        }
    }

    * targets() {
        yield* this.world.category('cat');
        yield* this.world.category('human');
    }

    render() {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.shadowColor = '#000';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = '#fff';
        ctx.fillRect(3, -3, -20, 6);
    }
}
