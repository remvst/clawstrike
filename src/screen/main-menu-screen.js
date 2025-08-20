class MainMenuScreen extends Screen {
    constructor(worldScreen) {
        super();

        this.worldScreen = worldScreen;

        const { world } = worldScreen;

        const cat = firstItem(worldScreen.world.category('cat'));
        const camera = firstItem(worldScreen.world.category('camera'));
        camera.zoom = 4;
        camera.target = new Entity();
        camera.x = camera.target.x = cat.x;
        camera.y = camera.target.y = cat.y - 5;

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
                claw.x = cat.x;
                claw.y = cat.y;
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
        }

        if (downKeys[32]) {
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
        } else {
            downKeys = {};
        }
    }

    render() {
        ctx.globalAlpha = interpolate(0, 1, min(this.age - 2.1) / 0.3);

        ctx.wrap(() => {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 160px Impact';
            ctx.shadowColor = '#000';
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10;
            ctx.fillText('MEOWSSASSIN'.toUpperCase(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
        });

        ctx.wrap(() => {
            if (this.age % 2 < 0.5) return;

            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 40px Impact';
            ctx.fillText('[SPACE] to start'.toUpperCase(), CANVAS_WIDTH / 2, CANVAS_HEIGHT * 3 / 4);
        });
    }
}
