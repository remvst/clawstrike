const renderArrow = () => {
    ctx.beginPath();
    ctx.moveTo(MOBILE_BUTTON_SIZE / 2, 0);
    ctx.lineTo(-MOBILE_BUTTON_SIZE / 2, MOBILE_BUTTON_SIZE / 2);
    ctx.lineTo(-MOBILE_BUTTON_SIZE / 2, -MOBILE_BUTTON_SIZE / 2);
    ctx.fill();
}

formatTime = x => {
    return (~~(x / 60)).toString().padStart(2, '0') + ':' + (x % 60).toFixed(2).padStart(5, '0');
};
charForWidthCalculation = x => isNaN(x) ? x : '0';

class HUD extends Entity {
    constructor(cat) {
        super();
        this.cat = cat;
    }

    render() {
        this.cancelCamera();

        ctx.fillStyle = ctx.strokeStyle = '#fff';
        ctx.lineWidth = 10;

        ctx.wrap(() => {
            ctx.translate(CANVAS_WIDTH / 2, 50);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 80px Impact';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.shadowColor = '#000';
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;

            const formatted = formatTime(this.age).split('');
            const totalWidth = formatted.reduce((acc, x) => acc + ctx.measureText(charForWidthCalculation(x)).width, 0);

            ctx.translate(-totalWidth / 2, 0);
            ctx.textAlign = 'center';
            for (const char of formatted) {
                const { width } = ctx.measureText(charForWidthCalculation(char));
                ctx.fillText(char, width / 2, 0);
                ctx.translate(width, 0);
            }
        });

        if (inputMode == INPUT_MODE_KEYBOARD) {
            for (const [desc, x, y, scaleX, down] of [
                ['↻', 0, 0, 1, downKeys[40]],
                ['←', -1, 0, 1, downKeys[37]],
                ['→', 1, 0, 1, downKeys[39]],
                ['↑', 0, -1, 1, downKeys[38]],
                ['ATTACK', 4.5, 0, 4, downKeys[32]],
            ]) {
                ctx.wrap(() => {
                    ctx.translate(150, CANVAS_HEIGHT - 100);
                    ctx.globalAlpha = down ? 1 : 0.5;
                    ctx.translate(x * 45, y * 45);

                    ctx.wrap(() => {
                        ctx.scale(scaleX, 1);
                        ctx.fillRect(-40 / 2, -40 / 2, 40, 40);
                    });

                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 20px Impact';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(desc, 0, 0);
                });
            }
        }

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

                ctx.translate(CANVAS_WIDTH * 5 / 8, CANVAS_HEIGHT - 100);

                const radius = MOBILE_BUTTON_SIZE / 2;

                for (let i = 0 ; i < 2 ; i++) {
                    ctx.rotate(Math.PI);

                    ctx.save();

                    ctx.beginPath();
                    ctx.arc(0, 0, radius, Math.PI / 4, Math.PI);

                    ctx.translate(-radius, 0)
                    ctx.rotate(Math.PI / 3 + Math.PI / 10);

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
                ctx.rotate(-Math.PI / 2);
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
                this.claw.render();
            });
        });
    }
}
