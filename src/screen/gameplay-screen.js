class GameplayScreen extends WorldScreen {
    cycle(elapsed) {
        const enemyCountBefore = this.world.category('human').size;

        super.cycle(elapsed);

        if (G) G.runTime += elapsed;

        if (this.isForeground() && downKeys[27]) {
            G.screens.push(new PauseScreen(this));
        }

        if (this.isForeground()) {
            // Level complete check
            const enemyCountAfter = this.world.category('human').size;
            if (enemyCountBefore && !enemyCountAfter) {
                this.resolve?.(true);
            }

            if (!this.world.category('cat').size) {
                this.reject?.(new Error());
            }
        }
    }
}
