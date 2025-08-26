class GameOverScreen extends MenuScreen {
    constructor() {
        super();
        this.title = G.difficulty.maxDeaths < Infinity
            ? (G.difficulty.maxDeaths - G.runDeaths) + nomangle(' LIVES LEFT')
            : nomangle('CAT-ASTROPHE!');
        this.addCommand(
            nomangle('PRESS [R] TO TRY AGAIN'),
            () => downKeys[82] || TOUCH_DOWN,
            () => this.resolve(),
        );
        if (G.difficulty.maxDeaths == Infinity) {
            this.addDifficultyChangeCommand();
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
