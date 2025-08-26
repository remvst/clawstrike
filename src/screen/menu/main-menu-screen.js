class MainMenuScreen extends MenuScreen {
    constructor(worldScreen) {
        super();

        this.worldScreen = worldScreen;

        this.title = document.title;
        this.addCommand(
            nomangle('PRESS [SPACE] TO START'),
            () => downKeys[32] || TOUCH_DOWN,
            () => this.start(),
            false,
        );
        this.addCommand(
            nomangle('PRESS [K] TO CHANGE DIFFICULTY'),
            () => downKeys[75],
            () => console.log('TODO'), // TODO
        );

        if (DEBUG) {
            this.addCommand(
                nomangle('PRESS [E] TO ENTER LEVEL EDITOR'),
                () => downKeys[69], // nice
                () => G.navigate(new LevelEditorScreen(ALL_LEVELS[0]), true),
            );
        }

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

    start() {
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
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        for (let k = 37 ; k <= 40 ; k++) downKeys[k] = false; // disable arrow keys
    }

    renderTitle() {
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
        super.renderTitle();
    }

    render() {
        ctx.globalAlpha = interpolate(0, 1, min(this.age - 2.1) / 0.3);
        super.render();
    }
}
