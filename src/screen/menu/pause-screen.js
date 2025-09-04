class PauseScreen extends MenuScreen {

    title = nomangle('PAUSED');
    songVolume = 0.2;

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
}
