class Game {
    constructor() {
        if (DEBUG) {
            this.lastFrameIndex = 0;
            this.frameTimes = Array(60).fill(0);
        }

        this.runTime = 0;

        this.screens = [];

        // const backgroundScreen = new GameplayScreen(ALL_LEVELS[0]);
        // this.screens = [
        //     backgroundScreen,
        //     new MainMenuScreen(backgroundScreen),
        // ];

        this.frame();

        (async () => {
            outer: for (let level = 0 ; level < ALL_LEVELS.length; level++) {
                while (true) {
                    try {
                        await this.navigate(new GameplayScreen(ALL_LEVELS[level]), true).await();
                        continue outer;
                    } catch (err) {
                        const screen = new GameOverScreen();
                        this.screens.push(screen);
                        await screen.await();
                    }
                }
            }
        })();
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

            if (DEBUG && DEBUG_INFO) ctx.wrap(() => {
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

    navigate(screen, reset) {
        if (reset) this.screens = [];
        this.screens.push(screen);
        return screen;
    }
}
