class GameplayScreen extends Screen {
    constructor() {
        super();

        if (DEBUG) {
            this.debugValues = () => {
                return [`Entities: ${this.world.entities.length}`]
            };
        }

        this.world = new World();

        const structure = new Structure([[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,1],[1,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1],[1,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,1,1,0,0,1,1,1],[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0],[1,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,0,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0],[1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,1,0,0,0,0,0,0,1,1,1,1,2,2,1,1,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,1,1,0,0,0,0,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0]]);
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

        const spikes = new Spikes();
        spikes.x = CELL_SIZE * 4;
        spikes.y = CELL_SIZE * 10;
        this.world.addEntity(spikes);

        const spikes2 = new Spikes();
        spikes2.angle = Math.PI / 2;
        spikes2.x = CELL_SIZE * 4;
        spikes2.y = CELL_SIZE * 7.5;
        this.world.addEntity(spikes2);

        this.world.addEntity(new HUD(cat));
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        let remaining = elapsed;
        while (remaining > 0) {
            const advance = Math.min(remaining, 1 / 120);
            remaining -= advance;
            this.world.cycle(advance);
        }
    }

    render() {
        super.render();
        this.world.render();
    }
}
