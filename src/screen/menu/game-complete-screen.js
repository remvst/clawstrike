class GameCompleteScreen extends MenuScreen {
    constructor(worldScreen) {
        super();

        this.worldScreen = worldScreen;

        this.title = nomangle('CONGRATULATIONS');
        this.addCommand(nomangle('DIFFICULTY: ') + G.difficulty.label);
        this.addCommand(nomangle('DEATHS: ') + G.runDeaths);
        this.addCommand(nomangle('TIME: ') + formatTime(G.runTime));
        this.addCommand(nomangle('BEST TIME: ') + formatTime(G.bestRunTime));
        this.addCommand('');
        this.addCommand('(9 LIVES MODE) UNLOCKED!');
        this.addCommand('');
        this.addCommand(
            nomangle('PRESS [SPACE] TO DISMISS'),
            () => downKeys[32] || (inputMode == INPUT_MODE_TOUCH && TOUCH_DOWN),
            () => this.resolve(),
        );

        const { world } = worldScreen;

        const camera = firstItem(worldScreen.world.category('camera'));
        camera.target = new Entity();
        camera.x = camera.target.x = 999;
        camera.y = camera.target.y = 999;

        for (const hud of world.category('hud')) {
            world.removeEntity(hud);
        }

        (async () => {
            const flash = world.addEntity(new Flash('#000'));
            await world.addEntity(new Interpolator(flash, '_', 0, 0, 0.5)).awaitCompletion();

            while (this.isForeground()) {
                const x = camera.x + rnd(-CANVAS_WIDTH / 3, CANVAS_WIDTH / 3);
                const y = camera.y + rnd(-CANVAS_HEIGHT / 4, 0);

                for (let i = 0 ; i < 50; i++) {
                    const particle = this.worldScreen.world.addEntity(new PhysicalParticle());
                    particle.x = x;
                    particle.y = y;
                    particle.z = 999;
                }

                await world.addEntity(new Interpolator(flash, '_', 0, 0, rnd(0.25, 0.5))).awaitCompletion();
            }
        })();
    }

    render() {
        ctx.globalAlpha = interpolate(0, 1, min(this.age - 1) / 0.3);
        super.render();
    }
}
