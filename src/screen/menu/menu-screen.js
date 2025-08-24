class MenuScreen extends Screen {
    renderTitle(text) {
        ctx.wrap(() => {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 160px Impact';
            ctx.strokeStyle = '#000';
            ctx.miterLimit = 2;
            ctx.lineWidth = 20;
            ctx.strokeText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
            ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
        });
    }

    renderCommands(commands) {
        ctx.wrap(() => {
            if (this.age % 2 < 0.5) return;

            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '36px Impact';
            ctx.letterSpacing = '0.1em';

            const spacing = 50;

            ctx.translate(CANVAS_WIDTH / 2,  CANVAS_HEIGHT * 2 / 3 + 60 - ((commands.length - 1) * spacing) / 2);

            for (const line of commands) {
                ctx.textAlign = 'center';
                ctx.fillText(line, 0, 0);

                ctx.translate(0, spacing);
            }
        });
    }
}
