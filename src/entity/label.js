class Label extends Entity {
    type = 'text';
    z = Z_LABEL;
    visibleStartAge = 0;

    constructor(text = '') {
        super();
        this.text = text;

        if (DEBUG) {
            this.hitbox.width = 25;
            this.hitbox.height = 25;
        }
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (this.visibleStartAge) return;
        for (const camera of this.world.category('camera')) {
            if (camera.zoom <= 1.5 && abs(this.x - camera.x) < CELL_SIZE * 8 && abs(this.y - camera.y) < CELL_SIZE * 8) {
                this.visibleStartAge = this.age;
            }
        }
    }

    render() {
        if (!this.visibleStartAge && !(DEBUG && this.world.editorMode)) return;

        ctx.translate(this.x, this.y);

        const animationRatio = DEBUG && this.world.editorMode
            ? 1
            : between(0, (this.age - this.visibleStartAge) / 0.3, 1);

        ctx.globalAlpha = interpolate(0, 0.9, animationRatio);
        ctx.translate(0, interpolate(20, 0, animationRatio));
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Impact';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.drawCommandText(this.text);
    }
}
