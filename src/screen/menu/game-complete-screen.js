class GameCompleteScreen extends Screen {
    constructor(worldScreen) {
        super();

        this.worldScreen = worldScreen;

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
            await world.addEntity(new Interpolator(flash, '_', 0, 0, 0.5)).await();

            while (this.isForeground()) {
                const x = camera.x + rnd(-CANVAS_WIDTH / 3, CANVAS_WIDTH / 3);
                const y = camera.y + rnd(-CANVAS_HEIGHT / 4, 0);
                const color = pick([
                    '#fff',
                ]);

                for (let i = 0 ; i < 50; i++) {
                    const particle = this.worldScreen.world.addEntity(new PhysicalParticle(color));
                    particle.x = x;
                    particle.y = y;
                }

                await world.addEntity(new Interpolator(flash, '_', 0, 0, rnd(0.25, 0.5))).await();
            }
        })();
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (this.age > 2 && (downKeys[32] || (inputMode == INPUT_MODE_TOUCH && TOUCH_DOWN))) {
            this.resolve();
        }
    }

    render() {
        ctx.globalAlpha = interpolate(0, 1, min(this.age - 1) / 0.3);

        this.renderTitle(nomangle('CONGRATULATIONS'));

        this.renderCommands([
            nomangle('PRESS [SPACE] TO DISMISS'),
        ]);
    }
}
