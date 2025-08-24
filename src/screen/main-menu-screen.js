class MainMenuScreen extends MenuScreen {
    constructor(worldScreen) {
        super();

        this.worldScreen = worldScreen;

        const { world } = worldScreen;

        const cat = firstItem(worldScreen.world.category('cat'));
        const camera = firstItem(worldScreen.world.category('camera'));
        camera.zoom = 3;
        camera.target = new Entity();
        camera.x = camera.target.x = cat.x;
        camera.y = camera.target.y = cat.y - 20;

        for (const hud of world.category('hud')) {
            world.removeEntity(hud);
        }

        worldScreen.cycle(2);

        (async () => {
            const flash = world.addEntity(new Flash('#000'));

            await world.addEntity(new Interpolator(flash, '_', 0, 0, 0.3)).await();

            for (const angle of [PI / 8, PI * 3 / 4, PI / 4]) {
                camera.shake(0.1, 5);

                const claw = world.addEntity(new ClawEffect());
                claw.x = camera.target.x;
                claw.y = camera.target.y;
                claw.angle = angle;
                claw.scale = 5;

                await world.addEntity(new Interpolator(flash, '_', 0, 0, 0.3)).await();
            }

            await world.addEntity(new Interpolator(flash, '_', 0, 0, 0.5)).await();
            await world.addEntity(new Interpolator(flash, 'alpha', 1, 0, 1)).await();
        })();
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (DEBUG && downKeys[69]) {
            G.screens = [new LevelEditorScreen(ALL_LEVELS[0])];
            zzfx(...[.8,,500,,.02,.14,,3.2,,,325,.05,.03,,,,,.79,.04,,-1129]); // Pickup 819
        }

        if (downKeys[32] || inputMode == INPUT_MODE_TOUCH && TOUCH_DOWN) {
            // TODO fade out instead
            G.screens.pop();

            playSong();

            const { world } = this.worldScreen;
            const cat = firstItem(world.category('cat'));
            const camera = firstItem(world.category('camera'));
            camera.target = cat;

            const zoomOut = new Interpolator(camera, 'zoom', camera.zoom, 1.3, 2, easeInQuad);
            world.addEntity(zoomOut);

            (async () => {
                await zoomOut.await();
                world.addEntity(new HUD(cat));
            })();

            G.runTime = 0;
        } else {
            downKeys = {};
        }
    }

    render() {
        ctx.globalAlpha = interpolate(0, 1, min(this.age - 2.1) / 0.3);

        ctx.wrap(() => {
            this.claw ||= (() => {
                const claw = new ClawEffect();
                claw.x = CANVAS_WIDTH / 2;
                claw.y = CANVAS_HEIGHT / 3 - 20;
                claw.age = 0.5;
                claw.angle = -PI / 6;
                claw.scale = 12;
                claw.color = '#f00';
                return claw;
            })();
            this.claw.render();
        });

        this.renderTitle(document.title);

        this.renderCommands([
            nomangle('PRESS [SPACE] TO START'),
            nomangle('PRESS [K] TO CHANGE THE DIFFICULTY'),
        ]);
    }
}
