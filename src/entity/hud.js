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
    constructor(cat) {
        super();
        this.categories.push('hud');
        this.cat = cat;
        this.alpha = 1;
        this.z = 9;
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
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.lineWidth = 1;

            ctx.translate(50, 50);

            for (const [label, value] of [
                [nomangle('TOTAL TIME'), formatTime(G.runTime)],
                [nomangle('LEVEL'), (G.runLevelIndex + 1) + '/' + ALL_LEVELS.length],
                [nomangle('TOTAL DEATHS'), G.runDeaths],
                [nomangle('DIFFICULTY [K]'), G.difficulty.label],
                [nomangle('BEST'), formatTime(G.bestRunTime)],
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

        ctx.wrap(() => {
            return;
            ctx.translate(CANVAS_WIDTH / 2, 50);
            ctx.font = nomangle('bold 60px Impact');
            ctx.textBaseline = nomangle('top');
            ctx.lineWidth = 2;

            const formatted = formatTime(G.runTime).split('');
            const totalWidth = formatted.reduce((acc, x) => acc + ctx.measureText(charForWidthCalculation(x)).width, 0);

            ctx.translate(-totalWidth / 2, 0);
            ctx.textAlign = nomangle('center');

            for (const char of formatted) {
                const { width } = ctx.measureText(charForWidthCalculation(char));
                ctx.fillText(char, width / 2, 0);
                ctx.strokeText(char, width / 2, 0);
                ctx.translate(width, 0);
            }
        });

        if (inputMode == INPUT_MODE_TOUCH) ctx.wrap(() => {
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
                ctx.lineCap = 'butt';
                ctx.strokeStyle = '#fff';

                ctx.translate(CANVAS_WIDTH * 5 / 8, CANVAS_HEIGHT - 100);

                const radius = MOBILE_BUTTON_SIZE / 2;

                for (let i = 0 ; i < 2 ; i++) {
                    ctx.rotate(PI);

                    ctx.save();

                    ctx.beginPath();
                    ctx.arc(0, 0, radius, PI / 4, PI);

                    ctx.translate(-radius, 0)
                    ctx.rotate(PI / 3 + PI / 10);

                    const LENGTH = MOBILE_BUTTON_SIZE / 8;
                    ctx.moveTo(LENGTH, LENGTH);
                    ctx.lineTo(0, 0);
                    ctx.lineTo(LENGTH, -LENGTH);
                    ctx.stroke();

                    ctx.restore();
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
                this.claw.y = CANVAS_HEIGHT - 400;
                this.claw.stroke = false;
                this.claw.render();
            });
        });
    }
}
