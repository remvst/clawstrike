renderArrow = () => {
    ctx.beginPath();
    ctx.moveTo(MOBILE_BUTTON_SIZE / 2, 0);
    ctx.lineTo(-MOBILE_BUTTON_SIZE / 2, MOBILE_BUTTON_SIZE / 2);
    ctx.lineTo(-MOBILE_BUTTON_SIZE / 2, -MOBILE_BUTTON_SIZE / 2);
    ctx.fill();
}

formatTime = x => {
    return (~~(x / 60)).toString().padStart(2, '0') + ':' + (x % 60).toFixed(2).padStart(5, '0');
};

class HUD extends Entity {

    alpha = 1;
    z = Z_HUD;
    categories = ['hud'];

    constructor(cat) {
        super();
        this.cat = cat;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const humanCount = this.world.category('human').size;
        this.maxHumanCount = max(this.maxHumanCount || 0, humanCount);
    }

    render() {
        this.cancelCamera();

        ctx.globalAlpha = this.alpha;

        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#fff';
        ctx.lineWidth = 10;

        ctx.wrap(() => {
            const camera = firstItem(this.world.category('camera'));
            if (camera.zoom >= 2) return;

            ctx.textAlign = nomangle('left');
            ctx.textBaseline = nomangle('top');
            ctx.lineWidth = 1;

            ctx.translate(50, 50);

            for (const [label, value] of [
                [nomangle('LEVEL'), (G.runLevelIndex) + '/' + (ALL_LEVELS.length - 1)],
                [nomangle('TIME'), formatTime(G.runTime)],
                [nomangle('BEST'), formatTime(G.bestRunTime)],
                [nomangle('DEATHS'), G.runDeaths],
                [nomangle('DIFFICULTY [K]'), G.difficulty.label],
            ]) {
                ctx.font = nomangle('italic bold 16px Impact');
                ctx.drawCommandText(label);
                ctx.translate(0, 20);

                ctx.font = nomangle('italic bold 36px Impact');
                ctx.fillText(value, 0, 0);
                ctx.strokeText(value, 0, 0);
                ctx.translate(0, 50);
            }
        });

        if (inputMode == INPUT_MODE_TOUCH) ctx.wrap(() => {
            ctx.strokeStyle = '#fff';

            ctx.wrap(() => {
                ctx.globalAlpha = downKeys[37] ? 1 : 0.5;
                ctx.translate(CANVAS_WIDTH / 8, CANVAS_HEIGHT - 100);
                ctx.scale(-1, 1);
                renderArrow();
            });

            ctx.wrap(() => {
                ctx.globalAlpha = downKeys[39] ? 1 : 0.5;
                ctx.translate(CANVAS_WIDTH * 3 / 8, CANVAS_HEIGHT - 100);
                renderArrow();
            });

            ctx.wrap(() => {
                ctx.globalAlpha = downKeys[40] ? 1 : 0.5;

                ctx.translate(CANVAS_WIDTH * 5 / 8, CANVAS_HEIGHT - 100);

                const radius = MOBILE_BUTTON_SIZE / 2;

                for (let i = 0 ; i < 2 ; i++) {
                    ctx.rotate(PI);

                    ctx.beginPath();
                    ctx.arc(0, 0, radius, PI / 4, PI);
                    ctx.stroke();
                }
            });

            ctx.wrap(() => {
                ctx.globalAlpha = downKeys[38] ? 1 : 0.5;
                ctx.translate(CANVAS_WIDTH * 7 / 8, CANVAS_HEIGHT - 100);
                ctx.rotate(-PI / 2);
                renderArrow();
            });

            ctx.wrap(() => {
                ctx.globalAlpha = downKeys[32] ? 1 : 0.5;

                this.claw ||= new ClawEffect();
                this.claw.age = 0.5;
                this.claw.scale = 3;
                this.claw.angle = PI / 4;
                this.claw.x = CANVAS_WIDTH * 7 / 8;
                this.claw.y = CANVAS_HEIGHT - 375;
                this.claw.stroke = false;
                this.claw.render();
            });

            ctx.wrap(() => {
                ctx.globalAlpha = downKeys[69] ? 1 : 0.5;

                ctx.translate(CANVAS_WIDTH * 7 / 8, CANVAS_HEIGHT - 625);
                ctx.rotate(-PI / 2);
                ctx.scale(2, 2);
                renderCatHead(true);
            });
        });
    }
}
