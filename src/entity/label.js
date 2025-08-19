class Label extends Entity {
    constructor(text = '') {
        super();
        this.type = 'text';
        this.text = text;

        this.visibleStartAge = 0;

        if (DEBUG) {
            this.hitbox.width = 25;
            this.hitbox.height = 25;
        }
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (this.visibleStartAge) return;
        for (const cat of this.world.category('camera')) {
            if (abs(this.x - cat.x) < CELL_SIZE * 8 && abs(this.y - cat.y) < CELL_SIZE * 8) {
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

        ctx.globalAlpha = interpolate(0, 0.8, animationRatio);
        ctx.translate(0, interpolate(20, 0, animationRatio));
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Impact';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, 0, 0);
    }
}
