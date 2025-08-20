class Screen {
    constructor() {
        if (DEBUG) {
            this.debugValues = () => ([]);
        }
        this.age = 0;
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
        return G.screens[G.screens.length - 1] === this;
    }
}
