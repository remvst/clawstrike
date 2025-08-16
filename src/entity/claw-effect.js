class ClawEffect extends Entity {

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
        ctx.globalAlpha = 1 - Math.min(1, Math.max(0, fadeProgress));

        ctx.rotate(this.seed * Math.PI * 2);

        const s = 1 + this.seed * 0.5;
        ctx.scale(s, s);
        ctx.scale(1 + this.seed * 0.5, 1);

        ctx.save();
        this.drawClaw();
        ctx.restore();

        ctx.save();
        ctx.translate(0, -5);
        ctx.scale(0.8, 0.8);
        this.drawClaw();
        ctx.restore();

        ctx.save();
        ctx.translate(0, 5);
        ctx.scale(0.8, 0.8);
        this.drawClaw();
        ctx.restore();

        // ctx.fillStyle = '#ff0';
        // ctx.fillRect( -4,  -4, 8, 8);
    }

    drawClaw() {
        ctx.strokeStyle = ctx.fillStyle = '#fff';

        ctx.shadowColor = '#000';
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.beginPath();

        const THICKNESS = 5;
        const LENGTH = 40;
        const l = LENGTH * Math.min(1, this.age / 0.1);

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
