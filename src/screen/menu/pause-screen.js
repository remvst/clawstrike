class PauseScreen extends MenuScreen {

    constructor() {
        super();
        this.title = nomangle('PAUSED');
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
