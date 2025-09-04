class GameOverScreen extends MenuScreen {
    constructor() {
        super();
        this.title = G.difficulty.maxDeaths < Infinity
            ? (G.difficulty.maxDeaths - G.runDeaths) + nomangle(' LIVES LEFT')
            : nomangle('CAT-ASTROPHE!');
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
    constructor() {
        super();
        this.title = nomangle('9 LIVES, 0 LEFT');
        this.addCommand(
            nomangle('PRESS [SPACE] TO GO BACK TO MAIN MENU'),
            () => downKeys[32] || TOUCH_DOWN,
            () => this.resolve(),
        );
    }
}
