class MenuScreen extends Screen {

    constructor() {
        super();
    }

    render() {
        wrap(() => this.renderTitle());
        wrap(() => this.renderCommands());
    }

    renderTitle() {
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 160px Impact';
        ctx.strokeStyle = '#000';
        ctx.miterLimit = 2;
        ctx.lineWidth = 20;
        strokeText(this.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
        fillText(this.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
    }

    renderCommands() {
        const spacing = 50;

        translate(CANVAS_WIDTH / 2,  CANVAS_HEIGHT * 2 / 3 + 60 - ((this.commands.length - 1) * spacing) / 2);

        for (const { label, detect } of this.commands) {
            if (this.age % 2 < 1.5 || !detect) wrap(() => this.renderCommandText(label.call ? label() : label));
            translate(0, spacing);
        }
    }

    renderCommandText(line) {
        ctx.font = nomangle('36px Impact');
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.textBaseline = nomangle('middle');
        ctx.lineWidth = 5;
        ctx.textAlign = nomangle('center');
        ctx.miterLimit = 2;
        ctx.letterSpacing = nomangle('0.1em');

        drawCommandText(line);
    }
}
