

class StoryScreen extends WorldScreen {
    constructor() {
        super(INTRO_LEVEL);

        const camera = firstItem(this.world.category('camera'));
        const structure = firstItem(this.world.category('structure'));
        structure.color = '#000';

        this.owner = this.world.addEntity(new Human());
        this.owner.x = CELL_SIZE * 4;

        this.enemy = this.world.addEntity(new Human());
        this.enemy.x = CELL_SIZE * 8;

        this.owner.color = this.enemy.color = '#fff';
        this.owner.y = this.enemy.y = CELL_SIZE * 2;

        camera.x = (this.owner.x + this.enemy.x) / 2;
        camera.y = (this.owner.y + this.enemy.y) / 2;
        camera.zoom = 3;

        this.addCommand(
            () => '',
            () => downKeys[13],
            () => this.resolve(),
        );

        (async () => {
            this.cycle(0.2);

            const fadeIn = this.world.addEntity(new Flash('#000'));
            await fadeIn.interp('alpha', 1, 0, 1);

            // Shoot and wait for the owner to take damage
            this.enemy.shoot();
            while (this.owner.health >= 3) await fadeIn.interp('_', 0, 0, 0);

            for (const entity of this.world.entities.slice()) {
                if (!(entity instanceof Camera)) this.world.removeEntity(entity);
                this.render();
            }

            const flash = this.world.addEntity(new Flash('#fff'));
            flash.alpha = 1;
            await flash.interp('alpha', 1, 0, 2);
            this.world.removeEntity(flash);

            const label = this.world.addEntity(new Label(nomangle('AVENGE YOUR HOOMAN')));
            label.x = camera.x;
            label.y = camera.y;
            camera.zoom = 1;

            await label.interp('_', 0, 0, 2);

            this.resolve();
        })();
    }

    cycle(elapsed) {
        super.cycle(elapsed * (this.world.category('bullet').size ? 0.1 : 1));

        this.owner.walking = false;
        this.owner.facing = this.owner.walkingDirection = 1;
        this.owner.lastDamage = this.owner.age - 0.2;
        this.owner.aim = PI / 2 + PI / 8;

        this.enemy.walking = false;
        this.enemy.facing = this.enemy.walkingDirection = -1;
        this.enemy.lastDamage = this.enemy.age - 0.2;
        this.enemy.aim = angleBetween(this.enemy, this.owner);

        if (this.age > 10) {
            this.resolve();
        }
    }
}
