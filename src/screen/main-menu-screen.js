class MainMenuScreen extends Screen {
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

        // TODO reuse for pause/death/game complete screens
        ctx.wrap(() => {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 160px Impact';
            ctx.strokeStyle = '#000';
            ctx.miterLimit = 2;
            ctx.lineWidth = 20;
            ctx.strokeText(document.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
            ctx.fillText(document.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
        });

        ctx.wrap(() => {
            if (this.age % 2 < 0.5) return;

            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '20px Impact';
            ctx.letterSpacing = '0.15em';

            ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 2 / 3 + 60);

            const commands = [
                [nomangle('START NEW GAME'), nomangle('[SPACE]')],
                [nomangle('9 LIVES MODE'), nomangle('[9]')],
                [nomangle('DIFFICULTY: NORMAL'), nomangle('[K]')],
            ];
            const spacing = 35;

            ctx.translate(0, -((commands.length - 1) * spacing) / 2);

            for (const [command, shortcut] of commands) {
                ctx.textAlign = 'right';
                ctx.fillText(command, -10, 0);

                ctx.textAlign = 'center';
                ctx.fillText('-', 0, 0);

                ctx.textAlign = 'left';
                ctx.fillText(shortcut, 10, 0);

                ctx.translate(0, spacing);
            }
        });
    }
}
