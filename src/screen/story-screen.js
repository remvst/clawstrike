

class StoryScreen extends WorldScreen {
    constructor() {
        super([{"type":"text","x":275,"y":-50,"text":"[SPACE] = ATTACK"},{"type":"cat","x":225,"y":200},{"type":"structure","x":0,"y":0,"matrix":[[1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,2,0,0,2,0,0,1],[1,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1]],"color":"#08f"},{"type":"human","x":375,"y":175}]);
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
    }

    cycle(elapsed) {
        const camera = firstItem(this.world.category('camera'));
        const cat = firstItem(this.world.category('cat'));
        const human = firstItem(this.world.category('human'));

        downKeys = {};

        human.walking = false;
        human.nextShot = this.age < 2 * 0.1 || human.lastBullet ? 9 : 0;
        human.lastSeenCat = human.age;
        human.seesCat = cat;
        human.facing = -1;
        camera.shakePower = 0;

        super.cycle(elapsed * 0.1);
    }
}
