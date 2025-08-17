class Bullet extends Entity {
    constructor(owner) {
        super();
        this.owner = owner;
        this.angle = owner.aim;
        this.hitbox.width = this.hitbox.height = 2;
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
            if (target === this.owner) continue; // Don't hit the owner
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
