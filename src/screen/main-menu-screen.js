class MainMenuScreen extends Screen {
    constructor(worldScreen) {
        super();

        this.worldScreen = worldScreen;

        const cat = firstItem(worldScreen.world.category('cat'));
        const camera = firstItem(worldScreen.world.category('camera'));
        camera.zoom = 4;
        camera.target = new Entity();
        camera.x = camera.target.x = cat.x;
        camera.y = camera.target.y = cat.y - 5;

        for (const hud of worldScreen.world.category('hud')) {
            worldScreen.world.removeEntity(hud);
        }

        worldScreen.cycle(2);
    }

    cycle(elapsed) {
        super.cycle(elapsed);

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

        if (DEBUG && downKeys[69]) {
            G.screens = [new LevelEditorScreen(ALL_LEVELS[0])];
        }
    }

    render() {
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
