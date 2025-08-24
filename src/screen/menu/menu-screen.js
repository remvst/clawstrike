class MenuScreen extends Screen {

    constructor() {
        super();
        this.commands = [];
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (Object.values(downKeys).filter(x => x).length == 0) {
            this.released = true;
        }

        if (this.released) {
            for (const { detect, action, playSound } of this.commands) {
                if (detect()) {
                    if (playSound) zzfx(...[.5,,500,,.02,.14,,3.2,,,325,.05,.03,,,,,.79,.04,,-1129]); // Pickup 819
                    this.released = false;
                    action();
                }
            }
        }
    }

    addCommand(label, detect, action, playSound = true) {
        this.commands.push({ label, detect, action, playSound });
    }

    render() {
        ctx.wrap(() => this.renderTitle());
        ctx.wrap(() => this.renderCommands());
    }

    renderTitle() {
        ctx.wrap(() => {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 160px Impact';
            ctx.strokeStyle = '#000';
            ctx.miterLimit = 2;
            ctx.lineWidth = 20;
            ctx.strokeText(this.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
            ctx.fillText(this.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
        });
    }

    renderCommands() {
        if (this.age % 2 > 0.5) {
            const spacing = 50;

            ctx.translate(CANVAS_WIDTH / 2,  CANVAS_HEIGHT * 2 / 3 + 60 - ((this.commands.length - 1) * spacing) / 2);

            for (const { label } of this.commands) {
                this.renderCommandText(label);
                ctx.translate(0, spacing);
            }
        }
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
