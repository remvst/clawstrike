class PauseScreen extends MenuScreen {

    title = nomangle('PAUSED')

    constructor() {
        super();
        this.addCommand(
            nomangle('PRESS [ESC] TO RESUME'),
            () => downKeys[27],
            () => this.resolve(),
        );
        this.addDifficultyChangeCommand();
        this.addMainMenuCommand();
    }

    absorb() {
        return true;
    }

    get songVolume() {
        return 0.2;
    }
}
