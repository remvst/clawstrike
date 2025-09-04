class StoryScreen extends WorldScreen {
    constructor() {
        super(INTRO_LEVEL);

        const camera = firstItem(this.world.category('camera'));
        camera.x = CELL_SIZE * 6;
        camera.y = CELL_SIZE * 2;
        camera.zoom = 3;
    }

    async fadeIn() {
        this.cycle(0.2);
        const fadeIn = this.world.addEntity(new Flash('#000'));
        await fadeIn.interp('alpha', 1, 0, 1);
    }

    removeAllEntities() {
        for (const entity of this.world.entities.slice()) {
            if (!(entity instanceof Camera)) this.world.removeEntity(entity);
        }
        this.render();
    }

    async finalize(message) {
        const camera = firstItem(this.world.category('camera'));
        this.removeAllEntities();

        if (inputMode == INPUT_MODE_TOUCH) camera.zoom = 1.3;

        const label = this.world.addEntity(new Label(message));
        label.x = camera.x;
        label.y = camera.y;
        label.visibleStartAge = 0.01;

        await label.interp('_', 0, 0, 2);
        this.resolve();
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        for (const cat of this.world.category('cat')) {
            cat.color = '#fff';
        }
        for (const human of this.world.category('human')) {
            human.color = '#fff';
        }
        for (const structure of this.world.category('structure')) {
            structure.color = '#000';
        }
    }

    makeHarmless(human) {
        human.seesCat = null;
        human.lastSeenCat = -9;
        human.walking = false;
        human.facing = human.walkingDirection = 1;
        human.lastDamage = human.age - 0.2;
        human.aim = PI / 2 + PI / 8;
        human.lastDamage = this.enemy.age - 0.2;
    }
}

class IntroScreen extends StoryScreen {
    constructor() {
        super();

        this.owner = this.world.addEntity(new Human());
        this.owner.x = CELL_SIZE * 4;

        this.enemy = this.world.addEntity(new Human());
        this.enemy.x = CELL_SIZE * 8;

        this.owner.color = this.enemy.color = '#fff';
        this.owner.y = this.enemy.y = CELL_SIZE * 2;
        this.owner.health = 1;

        this.addCommand(
            '',
            () => downKeys[13],
            () => this.resolve(),
        );

        (async () => {
            await this.fadeIn();

            // Shoot and wait for the owner to take damage
            this.enemy.shoot();
            while (this.owner.health) await this.enemy.interp('_', 0, 0, 0);
            this.removeAllEntities();

            await this.world.addEntity(new Flash('#fff')).interp('alpha', 1, 0, 2);

            await this.finalize(nomangle('AVENGE YOUR HOOMAN'));
        })();
    }

    cycle(elapsed) {
        super.cycle(elapsed * (this.world.category('bullet').size ? 0.1 : 1));

        this.makeHarmless(this.owner);
        this.makeHarmless(this.enemy);

        this.enemy.facing = -1;
        this.enemy.aim = angleBetween(this.enemy, this.owner);
    }

    render() {
        ctx.wrap(() => super.render());
        ctx.wrap(() => {
            ctx.fillStyle = '#fff';
            ctx.font = nomangle('bold 32px Impact');
            ctx.textAlign = nomangle('right');
            ctx.textBaseline = nomangle('bottom');

            ctx.translate(CANVAS_WIDTH - 20, CANVAS_HEIGHT - 20);
            ctx.drawCommandText(nomangle('[ENTER] SKIP'));
        });
    }
}

class RevengeScreen extends StoryScreen {
    constructor() {
        super();

        this.cat = this.world.addEntity(new Cat());
        this.cat.x = CELL_SIZE * 4;

        this.enemy = this.world.addEntity(new Human());
        this.enemy.x = CELL_SIZE * 8;

        this.cat.color = this.enemy.color = '#fff';
        this.cat.y = this.enemy.y = CELL_SIZE * 2;

        this.world.addEntity(new HUD(this.cat));

        (async () => {
            await this.fadeIn();

            const label = this.world.addEntity(new Label(nomangle('COMPLETE YOUR VENGEANCE')));
            label.x = CELL_SIZE * 6;
            label.y = CELL_SIZE / 2;
            label.z = 99;
            label.visibleStartAge = 0.1;

            while (this.enemy.health) await this.enemy.interp('_', 0, 0, 0);
            await this.world.addEntity(new Flash('#000')).interp('alpha', 0, 1, 0.4);

            this.enemy.health = 1;
            this.finalize(nomangle('VENGEANCE COMPLETE'));
        })();
    }

    cycle(elapsed) {
        super.cycle(elapsed * (this.enemy.health ? 1 : 0.1));
        this.makeHarmless(this.enemy);
    }
}
