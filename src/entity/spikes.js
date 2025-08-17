class Spikes extends Entity {

    constructor() {
        super();

        this.angle = 0;
        this.length = CELL_SIZE;
    }

    get hitbox() {
        const hitbox = super.hitbox;
        hitbox.width = max(20, cos(this.angle) * this.length);
        hitbox.height = max(20, sin(this.angle) * this.length);
        return hitbox;
    }

    render() {
        ctx.fillStyle = '#000';
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.wrap(() => {
            ctx.translate(-this.length / 2, 0);

            ctx.beginPath();
            for (let x = 0 ; x < this.length; x += 10) {
                ctx.lineTo(x, 0);
                ctx.lineTo(x + 5, -20);
                ctx.lineTo(x + 10, 0);
            }
            ctx.fill();
        });
    }
}
