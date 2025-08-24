class Camera extends Entity {
    constructor() {
        super();
        this.categories.push('camera');
        this.zoom = 1.3;
        this.cachedActual = {};
    }

    get actual() {
        const factor = (this.age < this.shakeEndAge) * (this.shakePower || 0);
        this.cachedActual.x = this.x + sin(this.age * TWO_PI * 10) * factor;
        this.cachedActual.y = this.y + cos(this.age * TWO_PI * 15) * factor;
        return this.cachedActual;
    }

    get appliedZoom() {
        return this.zoom;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        this.hitbox.width = CANVAS_WIDTH / this.appliedZoom;
        this.hitbox.height = CANVAS_HEIGHT / this.appliedZoom;

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
