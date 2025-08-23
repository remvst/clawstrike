class GameplayScreen extends WorldScreen {
    cycle(elapsed) {
        const enemyCountBefore = this.world.category('human').size;

        super.cycle(elapsed);

        if (G) G.runTime += elapsed;

        if (this.isForeground() && downKeys[27]) {
            G.screens.push(new PauseScreen(this));
        }

        // Level complete check
        const enemyCountAfter = this.world.category('human').size;
        if (enemyCountBefore && !enemyCountAfter) {
            console.log('Level complete!');
        }
    }
}
