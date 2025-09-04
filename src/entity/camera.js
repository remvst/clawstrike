class Camera extends Entity {

    zoom = 1.3;
    categories = ['camera'];

    get actual() {
        const factor = (this.age < this.shakeEndAge) * (this.shakePower || 0);
        this.cachedActual ||= {};
        this.cachedActual.x = this.x + sin(this.age * TWO_PI * 10) * factor;
        this.cachedActual.y = this.y + cos(this.age * TWO_PI * 15) * factor;
        return this.cachedActual;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        this.hitbox.width = CANVAS_WIDTH / this.zoom;
        this.hitbox.height = CANVAS_HEIGHT / this.zoom;

        if (!this.target) return;

        const dist = distance(this, this.target)
        const angle = angleBetween(this, this.target);
        const appliedDist = min(dist, dist * elapsed * 4);
        this.x += appliedDist * cos(angle);
        this.y += appliedDist * sin(angle) * 0.5;
    }

    shake(duration, shakePower) {
        this.shakeEndAge = this.age + duration;
        this.shakePower = shakePower;
    }
}
