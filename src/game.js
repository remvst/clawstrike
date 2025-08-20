class Game {
    constructor() {
        if (DEBUG) {
            this.lastFrameIndex = 0;
            this.frameTimes = Array(60).fill(0);
        }

        this.screens = [new GameplayScreen(ALL_LEVELS[0])];
        if (DEBUG) this.screens = [new LevelEditorScreen(ALL_LEVELS[0])];

        this.frame();
    }

    frame() {
        const now = performance.now();
        const elapsed = Math.min((now - (this.lastFrame || 0)) / 1000, 1 / 30);
        this.lastFrame = now;

        if (!DEBUG || document.hasFocus()) {
            if (downKeys[71]) elapsed *= 0.1;
            if (downKeys[70]) elapsed *= 4;

            let i = this.screens.length;
            while (this.screens[--i]) {
                const screen = this.screens[i];
                screen.cycle(elapsed);
                if (screen.absorb()) break;
            }

            for (const screen of this.screens) {
                ctx.wrap(() => screen.render());
            }

            if (DEBUG) ctx.wrap(() => {
                this.frameTimes[this.lastFrameIndex] = now;
                const nextIndex = (this.lastFrameIndex + 1) % this.frameTimes.length;
                const fps = (this.frameTimes.length - 1) / ((now - this.frameTimes[nextIndex]) / 1000);
                this.lastFrameIndex = nextIndex;

                ctx.translate(10, 10);
                ctx.font = '20px Courier';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#000';
                ctx.shadowOffsetY = 2;

                const debugValues = [
                    `FPS: ${fps.toFixed(1)}`,
                ]

                for (const screen of this.screens) {
                    debugValues.push(...screen.debugValues());
                }

                for (const value of debugValues) {
                    ctx.fillText(value, 0, 0);
                    ctx.translate(0, 20);
                }
            });
        }

        requestAnimationFrame(() => this.frame());
    }
}
