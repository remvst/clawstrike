let canvas;
let ctx;

onload = () => {
    canvas = document.querySelector('canvas');
    canvas.width = 1600;
    canvas.height = 900;

    ctx = canvas.getContext('2d');

    const world = new World();

    const cat = new Cat();
    cat.x = canvas.width / 2;
    cat.y = canvas.height / 2;
    world.addEntity(cat);

    world.render();
}

class World {
    constructor() {
        this.entities = [];
    }

    cycle(elapsed) {
        for (const entity of this.entities) {
            entity.cycle(elapsed);
        }
    }

    render() {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const entity of this.entities) {
            ctx.save();
            entity.render();
            ctx.restore();
        }
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }
}

class Entity {
    constructor() {
        this.x = this.y = 0;
    }

    cycle(elapsed) {

    }

    render() {

    }
}

class Cat extends Entity {
    render() {
        ctx.translate(this.x, this.y);

        const BODY_LENGTH = 50;
        const BODY_THICKNESS = 20;
        const LEG_LENGTH = 15;
        const LEG_THICKNESS = 5;
        const TAIL_LENGTH = 30;
        const TAIL_THICKNESS = 5;

        const HEAD_WIDTH = 20;
        const HEAD_HEIGHT = 20;

        const EAR_LENGTH = 10;
        const EAR_WIDTH = 5;

        // Body
        ctx.fillStyle = '#000';
        ctx.fillRect(-BODY_LENGTH / 2, -BODY_THICKNESS / 2, BODY_LENGTH, BODY_THICKNESS);

        // Legs
        ctx.save();
        ctx.translate(BODY_LENGTH / 2 - LEG_THICKNESS / 2, BODY_THICKNESS / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillRect(0, -LEG_THICKNESS / 2, LEG_LENGTH, LEG_THICKNESS);
        ctx.restore();

        ctx.save();
        ctx.translate(-BODY_LENGTH / 2 + LEG_THICKNESS / 2, BODY_THICKNESS / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillRect(0, -LEG_THICKNESS / 2, LEG_LENGTH, LEG_THICKNESS);
        ctx.restore();

        // Tail
        ctx.save();
        ctx.translate(-BODY_LENGTH / 2 + TAIL_THICKNESS / 2, -BODY_THICKNESS / 2);
        ctx.rotate(-Math.PI / 2 - Math.PI / 4);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = TAIL_THICKNESS;
        ctx.beginPath();
        for (let x = 0 ; x < TAIL_LENGTH; x += 1) {
            ctx.lineTo(x, Math.sin(x / TAIL_LENGTH * Math.PI * 2) * 5);
        }
        ctx.stroke();

        // ctx.fillRect(0, -LEG_THICKNESS / 2, LEG_LENGTH, LEG_THICKNESS);
        ctx.restore();

        // Head
        ctx.save();
        ctx.translate(BODY_LENGTH / 2 - 5, -BODY_THICKNESS / 2 - 5);
        ctx.fillRect(-HEAD_WIDTH / 2, -HEAD_HEIGHT / 2, HEAD_WIDTH, HEAD_HEIGHT);

        ctx.beginPath();
        ctx.moveTo(-HEAD_WIDTH / 2, -HEAD_HEIGHT / 2);
        ctx.lineTo(-HEAD_WIDTH / 2, -HEAD_HEIGHT / 2 - EAR_LENGTH);
        ctx.lineTo(-HEAD_WIDTH / 2 + EAR_WIDTH, -HEAD_HEIGHT / 2);

        ctx.lineTo(HEAD_WIDTH / 2 - EAR_WIDTH, -HEAD_HEIGHT / 2);
        ctx.lineTo(HEAD_WIDTH / 2, -HEAD_HEIGHT / 2 - EAR_LENGTH);
        ctx.lineTo(HEAD_WIDTH / 2, -HEAD_HEIGHT / 2);
        ctx.fill();

        ctx.restore();

        // ctx.fillStyle = '#ff0';
        // ctx.fillRect( -25,  -25, 50, 50);
    }
}
