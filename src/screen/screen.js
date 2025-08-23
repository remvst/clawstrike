class Screen {
    constructor() {
        if (DEBUG) {
            this.debugValues = () => ([]);
        }
        this.age = 0;
    }

    pop() {
        const index = G.screens.indexOf(this);
        if (index >= 0) G.screens.splice(index, 9);
    }

    resolve() {
        this.pop();
        this.resolvePromise?.();
    }

    reject(popScreen) {
        if (popScreen) this.pop();
        this.rejectPromise?.();
    }

    await() {
        return new Promise((resolvePromise, rejectPromise) => {
            this.resolvePromise = resolvePromise;
            this.rejectPromise = rejectPromise;
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
