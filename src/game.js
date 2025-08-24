class Game {
    constructor() {
        if (DEBUG) {
            this.lastFrameIndex = 0;
            this.frameTimes = Array(60).fill(0);
        }

        this.runTime = 0;
        this.screens = [];

        this.frame();
        this.startNavigation();
    }

    async startNavigation() {
        while (true) {
            for (let level = 0 ; level < ALL_LEVELS.length; level++) {
                let success;
                for (let attempt = 0; !success ; attempt++) {
                    try {
                        const gameplay = this.navigate(new GameplayScreen(ALL_LEVELS[level]), true);
                        if (!attempt && !level) this.navigate(new MainMenuScreen(gameplay));

                        // Reveal the level
                        this.navigate(new TransitionScreen(0, -1)).await();

                        await gameplay.await();

                        success = true;

                    } catch (err) {
                        await this.navigate(new GameOverScreen()).await();
                        this.screens = []; // Fix flickering
                    }

                    // Hide the level
                    await this.navigate(new TransitionScreen(1, 0)).await();
                }
            }

            const blankScreen = this.navigate(new GameplayScreen([]));
            await this.navigate(new GameCompleteScreen(blankScreen)).await();
            await this.navigate(new TransitionScreen(1, 0)).await();
            this.screens = []; // Fix flickering
        }
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
