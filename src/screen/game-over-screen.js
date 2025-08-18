class GameOverScreen extends Screen {
    constructor() {
        super();
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (downKeys[82]) {
            const gameplayScreen = G.screens[G.screens.length - 2];
            G.screens.pop();
            G.screens.pop();
            G.screens.push(new (gameplayScreen.constructor)(gameplayScreen.serializedWorld));
        }
    }

    render() {
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 80px Impact';
        ctx.shadowColor = '#000';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText('Press [R] to try again'.toUpperCase(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
    }
}
