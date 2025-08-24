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
        if (this.age % 2 > 0.5) ctx.wrap(() => {
            const spacing = 50;

            ctx.translate(CANVAS_WIDTH / 2,  CANVAS_HEIGHT * 2 / 3 + 60 - ((commands.length - 1) * spacing) / 2);

            for (const line of commands) {
                this.renderCommandText(line);
                ctx.translate(0, spacing);
            }
        });
    }

    renderCommandText(line) {
        ctx.wrap(() => {
            ctx.font = '36px Impact';
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.textBaseline = 'middle';
            ctx.lineWidth = 5;
            ctx.textAlign = 'left';
            ctx.miterLimit = 2;
            ctx.letterSpacing = '0.1em';

            const chars = line.split('');
            const totalWidth = chars.reduce((acc, char) => ctx.measureText(char).width + acc, 0);

            ctx.translate(-totalWidth / 2, 0);
            for (const char of line.split('')) {
                if (char == '[') ctx.fillStyle = '#f00';
                ctx.strokeText(char, 0, 0);
                ctx.fillText(char, 0, 0);
                ctx.translate(ctx.measureText(char).width, 0);
                if (char == ']') ctx.fillStyle = '#fff';
            }
        });
    }
}
