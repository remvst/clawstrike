class GameOverScreen extends MenuScreen {
    constructor() {
        super();
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (downKeys[82]) {
            this.resolve();
        }
    }

    render() {
        // this.renderTitle(nomangle('CAT-ASTROPHE!'));
        this.renderTitle(nomangle('TRY AGAIN?'));

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 80px Impact';
        ctx.shadowColor = '#000';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText('Press [R] to try again'.toUpperCase(), CANVAS_WIDTH / 2, CANVAS_HEIGHT * 2 / 3);
    }
}
