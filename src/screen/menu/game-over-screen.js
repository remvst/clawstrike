class GameOverScreen extends MenuScreen {
    title = G.difficulty.maxDeaths < Infinity
        ? (G.difficulty.maxDeaths - G.runDeaths) + nomangle(' LIVES LEFT')
        : nomangle('CAT-ASTROPHE!');

    constructor() {
        super();
        this.addCommand(
            (inputMode == INPUT_MODE_TOUCH ? nomangle('[TAP]') : nomangle('PRESS [R]')) + nomangle(' TO TRY AGAIN'),
            () => downKeys[82] || TOUCH_DOWN,
            () => this.resolve(),
        );
        if (inputMode == INPUT_MODE_KEYBOARD) {
            if (G.difficulty.maxDeaths == Infinity) {
                this.addDifficultyChangeCommand();
            }
            this.addMainMenuCommand();
        }
    }
}

class FullGameOverScreen extends MenuScreen {

    title = nomangle('9 LIVES, 0 LEFT');

    constructor() {
        super();
        this.addCommand(
            (inputMode == INPUT_MODE_TOUCH ? nomangle('[TAP]') : nomangle('PRESS [SPACE]')) + nomangle(' TO GO BACK TO MAIN MENU'),
            () => downKeys[32] || TOUCH_DOWN,
            () => this.resolve(),
        );
    }
}
