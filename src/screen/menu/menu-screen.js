class MenuScreen extends Screen {

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
        ctx.lineWidth = 20;
        ctx.strokeText(this.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
        ctx.fillText(this.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
    }

    renderCommands() {
        ctx.translate(CANVAS_WIDTH / 2,  CANVAS_HEIGHT * 2 / 3 + 60 - ((this.commands.length - 1) * COMMAND_SPACING) / 2);

        for (const { label, detect } of this.commands) {
            if (this.age % 2 < 1.5 || !detect) ctx.wrap(() => this.renderCommandText(label.call ? label() : label));
            ctx.translate(0, COMMAND_SPACING);
        }
    }

    renderCommandText(line) {
        ctx.font = nomangle('36px Impact');
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.textBaseline = nomangle('middle');
        ctx.lineWidth = 5;
        ctx.textAlign = nomangle('center');
        ctx.letterSpacing = nomangle('0.1em');

        ctx.drawCommandText(line);
    }
}
