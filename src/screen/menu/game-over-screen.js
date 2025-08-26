class GameOverScreen extends MenuScreen {
    constructor() {
        super();
        this.title = nomangle('CAT-ASTROPHE!');
        this.addCommand(
            nomangle('PRESS [R] TO TRY AGAIN'),
            () => downKeys[82] || TOUCH_DOWN,
            () => this.resolve(),
        );
    }
}
