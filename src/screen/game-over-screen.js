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
        this.renderTitle(nomangle('CAT-ASTROPHE!'));

        this.renderCommands([
            nomangle('PRESS [R] TO TRY AGAIN'),
        ]);
    }
}
