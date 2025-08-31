

class StoryScreen extends WorldScreen {
    constructor() {
        super(INTRO_LEVEL);
        // this.cycle(3);

        const cameraTarget = this.world.addEntity(new Entity());
        const camera = firstItem(this.world.category('camera'));
        const cat = firstItem(this.world.category('cat'));
        const human = firstItem(this.world.category('human'));

        cameraTarget.x = (cat.x + human.x) / 2;
        cameraTarget.y = (cat.y + human.y) / 2 - 20;
        camera.target = cameraTarget;
        camera.zoom = 3;
        camera.x = cameraTarget.x;
        camera.y = cameraTarget.y;

        COLORS = {
            structure: '#000',
            structureBackground: false,
            characters: '#fff',
            eyes: '#000',
        };

        this.endTriggered = false;
    }

    cycle(elapsed) {
        const camera = firstItem(this.world.category('camera'));
        const cat = firstItem(this.world.category('cat'));
        const human = firstItem(this.world.category('human'));
        const bullet = firstItem(this.world.category('bullet'));

        downKeys = {};

        human.walking = false;
        human.nextShot = this.age < 2 * 0.1 || human.lastBullet ? 9 : 0;
        human.lastSeenCat = human.age;
        human.seesCat = cat;
        human.facing = -1;
        camera.shakePower = 0;

        if (bullet) {
            camera.target = bullet;
            // camera.x = camera.target.x;
            // camera.y = camera.target.y;
            camera.zoom += elapsed;
        }

        if (!cat && !this.endTriggered) {
            this.endTriggered = true;

            // console.log('Flash effect started');

            const flash = this.world.addEntity(new Flash('#000'));
            flash.alpha = 1;
            // flash.interp('alpha', 0, 1, 4 * 0.1).then(() => {
            //     console.log('Flash effect completed');
            //     this.resolve();
            // });
                // this.resolve();
        }

        super.cycle(elapsed * 0.1);
    }
}
