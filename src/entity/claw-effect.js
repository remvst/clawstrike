class ClawEffect extends Entity {

    constructor() {
        super();
        this.angle = this.seed * TWO_PI;
        this.scale = 1 + this.seed * 0.5;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (this.age > 1) {
            this.world.removeEntity(this);
        }
    }

    render() {
        ctx.translate(this.x, this.y);

        const fadeDuration = 0.25;
        const fadeProgress = (this.age - (1 - fadeDuration)) / fadeDuration;
        ctx.globalAlpha *= 1 - Math.min(1, Math.max(0, fadeProgress));

        ctx.rotate(this.angle);
        ctx.scale(this.scale, this.scale);
        ctx.scale(1 + this.seed * 0.5, 1);

        for (const [y, s] of [[0, 1], [-5, 0.8], [5, 0.8]]) {
            ctx.wrap(() => {
                ctx.translate(0, y);
                ctx.scale(s, s);
                this.drawClaw();
            });
        }
    }

    drawClaw() {
        ctx.strokeStyle = ctx.fillStyle = '#fff';
        ctx.shadowColor = '#000';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const THICKNESS = 5;
        const LENGTH = 40;
        const l = LENGTH * Math.min(1, this.age / 0.1);

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
        ctx.fill();
    }
}
