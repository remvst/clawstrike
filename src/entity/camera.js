class Camera extends Entity {
    constructor() {
        super();
        this.categories.push('camera');
        this.zoom = 1.5;
        this.affectedBySpeedRatio = false;
    }

    get appliedZoom() {
        return this.zoom;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        this.hitbox.width = CANVAS_WIDTH / this.appliedZoom;
        this.hitbox.height = CANVAS_HEIGHT / this.appliedZoom;

        for (const player of this.world.category('cat')) {
            const dist = distance(this, player);
            const angle = angleBetween(this, player);
            const appliedDist = min(dist, dist * elapsed * 5);
            this.x += appliedDist * cos(angle);
            this.y += appliedDist * sin(angle);
        }
    }

    // zoomTo(toValue) {
    //     if (this.previousInterpolator) {
    //         this.previousInterpolator.remove();
    //     }
    //     return this.scene.add(new Interpolator(this, 'zoom', this.zoom, toValue, 1)).await();
    // }
}
