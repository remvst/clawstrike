class Entity {
    categories = [];
    seed = random();

    constructor() {
        this.x = this.y = this.previousX = this.previousY = this.age = 0;
        this.z = 0;
    }

    get hitbox() {
        this.cachedHitbox ||= new Rect();
        this.cachedHitbox.x = this.x;
        this.cachedHitbox.y = this.y;
        return this.cachedHitbox;
    }

    cycle(elapsed) {
        this.age += elapsed;

        this.previousX = this.x;
        this.previousY = this.y;
    }

    renderBackground() {

    }

    render() {

    }

    cancelCamera() {
        const camera = firstItem(this.world.category('camera'));
        ctx.translate(
            camera.actual.x - (1 / camera.zoom) * CANVAS_WIDTH / 2,
            camera.actual.y - (1 / camera.zoom) * CANVAS_HEIGHT / 2,
        );
        ctx.scale(1 / camera.zoom, 1 / camera.zoom);
    }

    renderDebug() {
        if (DEBUG && DEBUG_HITBOXES) this.hitbox.render();

        if (DEBUG && DEBUG_HITBOXES) ctx.wrap(() => {
            this.cancelCamera();

            const cornerRadius = 10;
            ctx.fillStyle = '#fff';
            ctx.fillRect(-cornerRadius, -cornerRadius ,cornerRadius * 2, cornerRadius * 2);
            ctx.fillRect(CANVAS_WIDTH -cornerRadius, -cornerRadius ,cornerRadius * 2, cornerRadius * 2);
            ctx.fillRect(CANVAS_WIDTH -cornerRadius, CANVAS_HEIGHT-cornerRadius ,cornerRadius * 2, cornerRadius * 2);
            ctx.fillRect(-cornerRadius, CANVAS_HEIGHT-cornerRadius ,cornerRadius * 2, cornerRadius * 2);
        });
    }

    interp(
        interpProperty,
        fromValue,
        toValue,
        interpDuration,
        easing = linear,
    ) {
        return this.world.addEntity(new Interpolator(
            this,
            interpProperty,
            fromValue,
            toValue,
            interpDuration,
            easing,
        )).awaitCompletion();
    }
}
