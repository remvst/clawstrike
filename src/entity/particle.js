class Particle extends Entity {

    z = Z_PARTICLE;
    alpha = 1;
    size = 1;

    render() {
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }

    animate(duration, values) {
        const interps = [];
        for (const [propertyKey, offset] of Object.entries(values)) {
            interps.push(this.interp(propertyKey, this[propertyKey], this[propertyKey] + offset, duration));
        }
        return Promise.all(interps)
            .then(() => this.world.removeEntity(this));
    }
}
