class PauseScreen extends Screen {

    cycle(elapsed) {
        super.cycle(elapsed);

        this.released ||= !downKeys[27];

        if (downKeys[27] && this.released && this.isForeground()) {
            G.screens.pop();
            downKeys = {};
        }
    }

    render() {
        ctx.wrap(() => {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 160px Impact';
            ctx.shadowColor = '#000';
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10;
            ctx.fillText('PAUSED'.toUpperCase(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
        });

        ctx.wrap(() => {
            if (this.age % 2 < 0.5) return;

            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 40px Impact';
            ctx.shadowColor = '#000';
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.fillText('[ESC] to resume'.toUpperCase(), CANVAS_WIDTH / 2, CANVAS_HEIGHT * 3 / 4);
        });
    }

    absorb() {
        return true;
    }
}
