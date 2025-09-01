class ClawEffect extends Entity {

    constructor() {
        super();
        this.angle = this.seed * TWO_PI;
        this.scale = 1 + this.seed * 0.5;
        this.color = '#fff';
        this.z = Z_CLAW;
        this.stroke = true;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (this.age > 1) {
            this.world?.removeEntity(this);
        }
    }

    render() {
        translate(this.x, this.y);

        const fadeDuration = 0.25;
        const fadeProgress = (this.age - (1 - fadeDuration)) / fadeDuration;
        ctx.globalAlpha *= 1 - min(1, max(0, fadeProgress));

        rotate(this.angle);
        scale(this.scale, this.scale);

        for (const [y, s] of [[0, 1], [-5, 0.8], [5, 0.8]]) {
            wrap(() => {
                translate(0, y);
                scale(s, s);
                this.drawClaw();
            });
        }
    }

    drawClaw() {
        ctx.fillStyle = this.color;

        const THICKNESS = 5;
        const LENGTH = 40;
        const l = LENGTH * min(1, this.age / 0.1);

        beginPath();
        translate(-LENGTH / 2, 0);
        moveTo(0, 0);
        bezierCurveTo(
            l / 2, -THICKNESS / 2,
            l / 2, -THICKNESS / 2,
            l, 0
        );
        bezierCurveTo(
            l / 2, THICKNESS / 2,
            l / 2, THICKNESS / 2,
            0, 0
        );
        closePath();
        fill();

        if (this.stroke) stroke();
    }
}
