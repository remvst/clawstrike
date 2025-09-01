class Game {
    constructor() {
        if (DEBUG) {
            this.lastFrameIndex = 0;
            this.frameTimes = Array(60).fill(0);
        }

        this.bestRunTime = parseInt(localStorage[nomangle("bt")] || 0);
        this.screens = [];
        this.difficulty = inputMode == INPUT_MODE_TOUCH ? DIFFICULTY_EASY : DIFFICULTY_NORMAL;

        this.frame();
        setTimeout(async () => {
            await this.navigate(new StoryScreen()).awaitCompletion();
            this.startNavigation();
        }, 0);
    }

    async startNavigation() {
        const params = new URLSearchParams(location.search);
        if (DEBUG && params.get('level')) {
            ALL_LEVELS = [JSON.parse(params.get('level'))];
        }

        let promptedEasyMode;

        while (true) {
            this.runTime = 0;
            this.runLevelIndex = 0;
            this.runDeaths = 0;

            const currentIndex = DIFFICULTIES.indexOf(this.difficulty);
            if (currentIndex < 0) this.difficulty = DIFFICULTY_NORMAL;

            for (let level = 0 ; level < ALL_LEVELS.length; level++) {
                this.runLevelIndex = level;

                let success;
                for (let attempt = 0; !success ; attempt++) {
                    try {
                        const gameplay = this.navigate(new GameplayScreen(ALL_LEVELS[level]), true);
                        if (!attempt && !level) this.navigate(new MainMenuScreen(gameplay));

                        // Reveal the level
                        this.navigate(new TransitionScreen(0, -1)).awaitCompletion();

                        await gameplay.awaitCompletion();

                        success = true;

                    } catch (err) {
                        this.runDeaths++;

                        if (this.runDeaths < this.difficulty.maxDeaths) {
                            await this.navigate(new GameOverScreen()).awaitCompletion();

                            if (this.difficulty == DIFFICULTY_NORMAL && attempt >= 5 && !promptedEasyMode) {
                                if (confirm(nomangle('Switch to easy mode?'))) {
                                    this.difficulty = DIFFICULTY_EASY;
                                }
                                promptedEasyMode = true;
                            }

                            this.screens = []; // Fix flickering
                        } else {
                            await this.navigate(new FullGameOverScreen()).awaitCompletion();
                            await this.startNavigation();
                        }
                    }

                    // Hide the level
                    await this.navigate(new TransitionScreen(1, 0)).awaitCompletion();
                }
            }

            if (!params.get('level')) {
                this.bestRunTime = min(this.bestRunTime || 9999, this.runTime);
                localStorage[nomangle("bt")] = this.bestRunTime;
            }

            const blankScreen = this.navigate(new WorldScreen([]));
            await this.navigate(new GameCompleteScreen(blankScreen)).awaitCompletion();
        }
    }

    frame() {
        const now = performance.now();
        const elapsed = min((now - (this.lastFrame || 0)) / 1000, 1 / 30);
        this.lastFrame = now;

        if (!DEBUG || document.hasFocus()) {
            if (DEBUG) {
                if (downKeys[71]) elapsed *= 0.1;
                if (downKeys[70]) elapsed *= 4;
            }

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
