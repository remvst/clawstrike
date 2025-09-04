class PhysicalParticle extends Entity {

    z = Z_PARTICLE;
    speed = rnd(200, 400);
    angle = rnd(-PI, 0);

    vX = cos(this.angle) * this.speed;
    vY = sin(this.angle) * this.speed;

    cycle(elapsed) {
        super.cycle(elapsed);

        this.vY += elapsed * 800; // Gravity

        this.x += this.vX * elapsed;
        this.y += this.vY * elapsed;

        const { x, y } = this;
        for (const structure of this.world.category('structure')) {
            structure.reposition(this, 2, 2);
        }

        if (x !== this.x) this.vX *= -0.5;
        if (y !== this.y) {
            this.vX *= 0.5;
            this.vY *= -0.5;
        }

        if (this.age > 4 || pointDistance(0, 0, this.vX, this.vY) < 10) {
            this.world.removeEntity(this);
        }
    }

    render() {
        const s = pointDistance(0, 0, this.vX, this.vY) / 25;
        ctx.translate(this.x, this.y);
        ctx.rotate(atan2(this.vY, this.vX) + PI);
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.fillRect(0, -2, s, 4);
        ctx.strokeRect(0, -2, s, 4);
    }
}

fireworks = (world, position, count, radiusX = 0, radiusY = 0) => {
    for (let i = 0 ; i < count; i++) {
        const particle = world.addEntity(new PhysicalParticle());
        particle.x = position.x + rnd(-1, 1) * radiusX;
        particle.y = position.y + rnd(-1, 1) * radiusY;
    }
}
