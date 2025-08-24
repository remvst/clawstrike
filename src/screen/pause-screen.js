class PauseScreen extends MenuScreen {

    cycle(elapsed) {
        super.cycle(elapsed);

        this.released ||= !downKeys[27];

        if (downKeys[27] && this.released && this.isForeground()) {
            this.resolve();
        }
    }

    render() {
        this.renderTitle(nomangle('PAUSED'));

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
