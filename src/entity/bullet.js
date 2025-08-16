class Bullet extends Entity {
    constructor(angle) {
        super();
        this.angle = angle;
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
        for (const cat of this.world.category('cat')) {
            if (Math.abs(cat.x - this.x) < cat.radiusX && Math.abs(cat.y - this.y) < cat.radiusY) {
                this.world.removeEntity(this);
                return;
            }
        }
    }

    render() {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = '#fff';
        ctx.fillRect(3, -3, -20, 6);
    }
}
