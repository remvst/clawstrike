class GameplayScreen extends WorldScreen {
    cycle(elapsed) {
        const enemyCountBefore = this.world.category('human').size;

        super.cycle(elapsed);

        if (G) G.runTime += elapsed;

        this.released ||= !downKeys[27];
        if (this.isForeground() && this.released && downKeys[27]) {
            this.released = false;
            G.navigate(new PauseScreen());
        }

        if (this.isForeground()) {
            // Level complete check
            const enemyCountAfter = this.world.category('human').size;
            if (enemyCountBefore && !enemyCountAfter) {
                this.resolve();
            }

            if (!this.world.category('cat').size) {
                this.reject(false);
            }
        }
    }
}
