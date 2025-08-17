class HUD extends Entity {
    constructor(cat) {
        super();
        this.cat = cat;
    }

    render() {
        this.cancelCamera();

        ctx.fillStyle = '#fff';
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
}
