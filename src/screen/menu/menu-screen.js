class MenuScreen extends Screen {

    constructor() {
        super();
    }

    render() {
        ctx.wrap(() => this.renderTitle());
        ctx.wrap(() => this.renderCommands());
    }

    renderTitle() {
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 160px Impact';
        ctx.strokeStyle = '#000';
        ctx.miterLimit = 2;
        ctx.lineWidth = 20;
        ctx.strokeText(this.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
        ctx.fillText(this.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
    }

    renderCommands() {
        const spacing = 50;

        ctx.translate(CANVAS_WIDTH / 2,  CANVAS_HEIGHT * 2 / 3 + 60 - ((this.commands.length - 1) * spacing) / 2);

        for (const { label, detect } of this.commands) {
            if (this.age % 2 < 1.5 || !detect) ctx.wrap(() => this.renderCommandText(label.call ? label() : label));
            ctx.translate(0, spacing);
        }
    }

    renderCommandText(line) {
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
            if (char == '(') ctx.fillStyle = '#0ff';
            ctx.strokeText(char, 0, 0);
            ctx.fillText(char, 0, 0);
            ctx.translate(ctx.measureText(char).width, 0);
            if (char == ']') ctx.fillStyle = '#fff';
            if (char == ')') ctx.fillStyle = '#fff';
        }
    }
}
