class PauseScreen extends MenuScreen {

    cycle(elapsed) {
        super.cycle(elapsed);

        this.released ||= !downKeys[27];

        if (downKeys[27] && this.released && this.isForeground()) {
            this.resolve();
        }
    }

    render() {
        this.renderTitle(nomangle('PAUSED'));

        this.renderCommands([
            [nomangle('RESUME'), nomangle('[ESC]')],
        ]);
    }

    absorb() {
        return true;
    }
}
