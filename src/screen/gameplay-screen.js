class GameplayScreen extends WorldScreen {
    constructor(level) {
        super(level);

        this.addDifficultyChangeCommand();
    }

    cycle(elapsed) {
        const enemyCountBefore = this.world.category('human').size;
        const catCountBefore = this.world.category('cat').size;

        elapsed *= this.timeFactor || 1;

        super.cycle(elapsed);

        if (G && catCountBefore >= 1) G.runTime += elapsed;

        this.released ||= !downKeys[27];
        if (this.isForeground() && this.released && downKeys[27]) {
            this.released = false;
            G.navigate(new PauseScreen()).awaitCompletion();
        }

        const hud = firstItem(this.world.category('hud'));
        if (hud) hud.alpha = this.isForeground() ? 1 : 0.25;

        if (this.isForeground()) {
            // Level complete check
            const enemyCountAfter = this.world.category('human').size;
            if (enemyCountBefore && !enemyCountAfter) {
                const camera = firstItem(this.world.category('camera'));

                this.timeFactor = 0.25;

                (async () => {
                    await camera.interp('zoom', camera.zoom, 2, 0.5);
                    this.resolve();
                })();
            }

            if (catCountBefore && !this.world.category('cat').size) {
                this.reject(false);
            }
        }
    }
}
