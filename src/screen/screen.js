class Screen {
    constructor() {
        if (DEBUG) {
            this.debugValues = () => ([]);
        }
        this.age = 0;
    }

    await() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    cycle(elapsed) {
        this.age += elapsed;
    }

    render() {

    }

    absorb() {
        return false;
    }

    isForeground() {
        return G?.screens?.[G.screens.length - 1] === this;
    }
}
