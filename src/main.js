function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}

function easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
}

function easeInQuad(x) {
    return x * x;
}

function easeOutSine(x) {
  return Math.sin((x * Math.PI) / 2);

}

function linear(x) {
  return x;

}

function normalizeAngle(angle) {
    let normalized = angle;
    while (normalized < -Math.PI) normalized += Math.PI * 2;
    while (normalized > Math.PI) normalized -= Math.PI * 2;
    return normalized;
}

function between(a, b, c) {
    if (b < a) return a;
    if (b > c) return c;
    return b;
}

function isBetween(a, b, c) {
    return (a <= b && b <= c) || (a >= b && b >= c);
}

function floorToNearest(x, precision) {
    return Math.floor(x / precision) * precision;
}

function ceilToNearest(x, precision) {
    return Math.ceil(x / precision) * precision;
}

function interpolate(a, b, t) {
    return a + (b - a) * between(0, t, 1);
}


onload = () => {
    canvas = document.querySelector('canvas');
    canvas.width = 1600;
    canvas.height = 900;

    ctx = canvas.getContext('2d');

    const world = new World();

    const structure = new Structure([[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,0,1,0],[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1,0,1,0,1,1,0],[1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,0,1,0,1,1,1,1,0],[1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]);
    world.addEntity(structure);

    const human = new Human();
    human.x = canvas.width / 2 + 200;
    human.y = canvas.height / 2 - 50;
    world.addEntity(human);

    const human2 = new Human();
    human2.x = canvas.width / 2 - 400;
    human2.y = canvas.height / 2 - 50;
    world.addEntity(human2);

    const cat = new Cat();
    cat.x = canvas.width / 2;
    cat.y = canvas.height / 2;
    world.addEntity(cat);

    let lastFrame = performance.now();

    const frame = () => {
        const now = performance.now();
        let elapsed = (now - lastFrame) / 1000;
        lastFrame = now;

        if (downKeys[71]) elapsed *= 0.1;

        world.cycle(elapsed);
        world.render();

        requestAnimationFrame(frame);
    };
    frame();
}

class World {
    constructor() {
        this.entities = [];
        this.categories = new Map();
    }

    cycle(elapsed) {
        for (const entity of this.entities) {
            entity.cycle(elapsed);
        }
    }

    render() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const entity of this.entities) {
            ctx.save();
            entity.render();
            ctx.restore();
        }
    }

    addEntity(entity) {
        entity.world = this;
        this.entities.push(entity);

        for (const categoryId of entity.categories) {
            const category = this.categories.get(categoryId);
            if (!category) {
                this.categories.set(categoryId, new Set([entity]));
            } else {
                category.add(entity);
            }
        }
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }

        for (const category of entity.categories) {
            this.categories.get(category)?.delete(entity);
        }
    }

    category(categoryId) {
        return this.categories.get(categoryId) || [];
    }
}
