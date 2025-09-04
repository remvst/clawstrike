class GameCompleteScreen extends MenuScreen {

    title = nomangle('CONGRATULATIONS');

    constructor(worldScreen) {
        super();

        this.worldScreen = worldScreen;

        this.addCommand(nomangle('DIFFICULTY: ') + G.difficulty.label);
        this.addCommand(nomangle('DEATHS: ') + G.runDeaths);
        this.addCommand(nomangle('TIME: ') + formatTime(G.runTime));
        this.addCommand(nomangle('BEST TIME: ') + formatTime(G.bestRunTime));
        this.addCommand('');
        this.addCommand('(9 LIVES MODE) UNLOCKED!');
        this.addCommand('');
        this.addCommand(
            (inputMode == INPUT_MODE_TOUCH ? nomangle('[TAP]') : nomangle('PRESS [SPACE]')) + nomangle(' TO DISMISS'),
            () => downKeys[32] || TOUCH_DOWN,
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
            while (true) {
                fireworks(
                    world,
                    {
                        x: camera.x + rnd(-CANVAS_WIDTH / 3, CANVAS_WIDTH / 3),
                        y: camera.y + rnd(-CANVAS_HEIGHT / 4, 0),
                    },
                    50,
                );

                await camera.interp('', 0, 0, rnd(0.25, 0.5));
            }
        })();
    }

    render() {
        ctx.globalAlpha = interpolate(0, 1, min(this.age - 1) / 0.3);
        super.render();
    }
}
