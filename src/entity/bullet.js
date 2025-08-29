class Bullet extends Entity {
    constructor(owner) {
        super();
        this.owner = owner;
        this.angle = owner.aim;
        this.hitbox.width = this.hitbox.height = 2;

        this.z = Z_BULLET;

        zzfx(...[0.8,,221,.01,.03,.19,4,2.5,,,,,,1.1,,.2,,.61,.09]); // Shoot 93
    }

    cycle(elapsed) {
        const BULLET_SPEED = 800;
        this.x += elapsed * cos(this.angle) * BULLET_SPEED;
        this.y += elapsed * sin(this.angle) * BULLET_SPEED;

        // Structure hits
        for (const structure of this.world.category('structure')) {
            if (structure.cellAt(this.x, this.y)) {
                this.world.removeEntity(this);

                for (let i = 0; i < 5; i++) {
                    const part = new PhysicalParticle('#fff');
                    part.x = this.x;
                    part.y = this.y;
                    this.world.addEntity(part);
                }
                return;
            }
        }

        // Cat hits
        for (const target of this.targets()) {
            if (target === this.owner) continue; // Don't hit the owner
            if (target.rolling) continue; // Don't hit rolling cats
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

        // ctx.shadowColor = '#000';
        // ctx.shadowOffsetX = 2;
        // ctx.shadowOffsetY = 2;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.fillRect(3, -3, -20, 6);
        ctx.strokeRect(3, -3, -20, 6);
    }
}
