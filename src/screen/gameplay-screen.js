class GameplayScreen extends Screen {
    constructor() {
        super();

        if (DEBUG) {
            this.debugValues = () => {
                return [`Entities: ${this.world.entities.length}`]
            };
        }

        this.world = new World();

        const structure = new Structure([[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,1],[1,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1],[1,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,1,1,0,0,1,1,1],[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0],[1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,0,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0],[1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,1,0,0,0,0,0,0,1,1,1,1,0,0,1,1,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,1,1,0,0,0,0,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0]]);
        this.world.addEntity(structure);

        const human = new Human();
        human.x = can.width / 2 + 200;
        human.y = can.height / 2 - 50;
        this.world.addEntity(human);

        const human2 = new Human();
        human2.x = can.width / 2 - 400;
        human2.y = can.height / 2 - 50;
        this.world.addEntity(human2);

        const cat = new Cat();
        cat.x = can.width / 2;
        cat.y = can.height / 2;
        this.world.addEntity(cat);

        this.world.addEntity(new HUD(cat));
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        this.world.cycle(elapsed);
    }

    render() {
        super.render();
        this.world.render();
    }
}
