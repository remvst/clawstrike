class Game {
    constructor() {
        this.world = new World();

        if (DEBUG) {
            this.lastFrameIndex = 0;
            this.frameTimes = Array(60).fill(0);
        }

        this.frame();

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
    }

    frame() {
        const now = performance.now();
        const elapsed = Math.min((now - this.lastFrame) / 1000, 1 / 30);
        this.lastFrame = now;

        if (downKeys[71]) elapsed *= 0.1;

        this.world.cycle(elapsed);
        this.world.render();

        if (DEBUG) ctx.wrap(() => {
            this.frameTimes[this.lastFrameIndex] = now;
            const nextIndex = (this.lastFrameIndex + 1) % this.frameTimes.length;
            const fps = (this.frameTimes.length - 1) / ((now - this.frameTimes[nextIndex]) / 1000);
            this.lastFrameIndex = nextIndex;

            ctx.translate(10, 10);
            ctx.font = '20px Courier';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.shadowColor = '#000';
            ctx.shadowOffsetY = 2;
            ctx.fillText('FPS: ' + fps.toFixed(1), 0, 0);
        });

        requestAnimationFrame(() => this.frame());
    }
}
