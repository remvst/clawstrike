renderArrow = () => {
    beginPath();
    moveTo(MOBILE_BUTTON_SIZE / 2, 0);
    lineTo(-MOBILE_BUTTON_SIZE / 2, MOBILE_BUTTON_SIZE / 2);
    lineTo(-MOBILE_BUTTON_SIZE / 2, -MOBILE_BUTTON_SIZE / 2);
    fill();
}

formatTime = x => {
    return (~~(x / 60)).toString().padStart(2, '0') + ':' + (x % 60).toFixed(2).padStart(5, '0');
};

class HUD extends Entity {
    constructor(cat) {
        super();
        this.categories.push('hud');
        this.cat = cat;
        this.alpha = 1;
        this.z = Z_HUD;
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

        wrap(() => {
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.lineWidth = 1;

            translate(50, 50);

            for (const [label, value] of [
                [nomangle('TOTAL TIME'), formatTime(G.runTime)],
                [nomangle('LEVEL'), (G.runLevelIndex) + '/' + (ALL_LEVELS.length - 1)],
                [nomangle('TOTAL DEATHS'), G.runDeaths],
                [nomangle('DIFFICULTY [K]'), G.difficulty.label],
                [nomangle('BEST'), formatTime(G.bestRunTime)],
            ]) {
                ctx.font = nomangle('italic bold 16px Impact');
                drawCommandText(label);
                translate(0, 20);

                ctx.font = nomangle('italic bold 36px Impact');
                fillText(value, 0, 0);
                strokeText(value, 0, 0);
                translate(0, 50);
            }
        });

        wrap(() => {
            return;
            translate(CANVAS_WIDTH / 2, 50);
            ctx.font = nomangle('bold 60px Impact');
            ctx.textBaseline = nomangle('top');
            ctx.lineWidth = 2;

            const formatted = formatTime(G.runTime).split('');
            const totalWidth = formatted.reduce((acc, x) => acc + measureText(charForWidthCalculation(x)).width, 0);

            translate(-totalWidth / 2, 0);
            ctx.textAlign = nomangle('center');

            for (const char of formatted) {
                const { width } = measureText(charForWidthCalculation(char));
                fillText(char, width / 2, 0);
                strokeText(char, width / 2, 0);
                translate(width, 0);
            }
        });

        if (inputMode == INPUT_MODE_TOUCH) wrap(() => {
            wrap(() => {
                ctx.globalAlpha = downKeys[37] ? 1 : 0.5;
                translate(CANVAS_WIDTH / 8, CANVAS_HEIGHT - 100);
                scale(-1, 1);
                renderArrow();
            });

            wrap(() => {
                ctx.globalAlpha = downKeys[39] ? 1 : 0.5;
                translate(CANVAS_WIDTH * 3 / 8, CANVAS_HEIGHT - 100);
                renderArrow();
            });

            wrap(() => {
                ctx.globalAlpha = downKeys[40] ? 1 : 0.5;
                ctx.lineCap = 'butt';
                ctx.strokeStyle = '#fff';

                translate(CANVAS_WIDTH * 5 / 8, CANVAS_HEIGHT - 100);

                const radius = MOBILE_BUTTON_SIZE / 2;

                for (let i = 0 ; i < 2 ; i++) {
                    rotate(PI);

                    save();

                    beginPath();
                    arc(0, 0, radius, PI / 4, PI);

                    translate(-radius, 0)
                    rotate(PI / 3 + PI / 10);

                    const LENGTH = MOBILE_BUTTON_SIZE / 8;
                    moveTo(LENGTH, LENGTH);
                    lineTo(0, 0);
                    lineTo(LENGTH, -LENGTH);
                    stroke();

                    restore();
                }
            });

            wrap(() => {
                ctx.globalAlpha = downKeys[38] ? 1 : 0.5;
                translate(CANVAS_WIDTH * 7 / 8, CANVAS_HEIGHT - 100);
                rotate(-PI / 2);
                renderArrow();
            });

            wrap(() => {
                ctx.globalAlpha = downKeys[32] ? 1 : 0.5;

                this.claw ||= new ClawEffect();
                this.claw.age = 0.5;
                this.claw.scale = 3;
                this.claw.angle = PI / 4;
                this.claw.x = CANVAS_WIDTH * 7 / 8;
                this.claw.y = CANVAS_HEIGHT - 400;
                this.claw.stroke = false;
                this.claw.render();
            });
        });
    }
}
