class ClawEffect extends Entity {

    color = '#fff';
    z = Z_CLAW;
    stroke = true;

    constructor() {
        super();
        this.angle = this.seed * TWO_PI;
        this.scale = 1 + this.seed * 0.5;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (this.age > 1) {
            this.world?.removeEntity(this);
        }
    }

    render() {
        ctx.translate(this.x, this.y);

        const fadeDuration = 0.25;
        const fadeProgress = (this.age - (1 - fadeDuration)) / fadeDuration;
        ctx.globalAlpha *= 1 - min(1, max(0, fadeProgress));

        ctx.rotate(this.angle);
        ctx.scale(this.scale, this.scale);

        for (const [y, s] of [[0, 1], [-5, 0.8], [5, 0.8]]) {
            ctx.wrap(() => {
                ctx.translate(0, y);
                ctx.scale(s, s);
                this.drawClaw();
            });
        }
    }

    drawClaw() {
        ctx.fillStyle = this.color;

        const THICKNESS = 5;
        const LENGTH = 40;
        const l = LENGTH * min(1, this.age / 0.1);

        ctx.miterLimit = 10;
        ctx.beginPath();
        ctx.translate(-LENGTH / 2, 0);
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
            l / 2, -THICKNESS / 2,
            l / 2, -THICKNESS / 2,
            l, 0
        );
        ctx.bezierCurveTo(
            l / 2, THICKNESS / 2,
            l / 2, THICKNESS / 2,
            0, 0
        );
        ctx.closePath();
        ctx.fill();

        if (this.stroke) ctx.stroke();
    }
}
