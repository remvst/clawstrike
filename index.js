let canvas;
let ctx;
let downKeys = {};

document.addEventListener('keydown', (event) => {
    downKeys[event.keyCode] = true;
});

document.addEventListener('keyup', (event) => {
    downKeys[event.keyCode] = false;
});

onload = () => {
    canvas = document.querySelector('canvas');
    canvas.width = 1600;
    canvas.height = 900;

    ctx = canvas.getContext('2d');

    const world = new World();

    const human = new Human();
    human.x = canvas.width / 2 + 200;
    human.y = canvas.height / 2 - 50;
    world.addEntity(human);

    const cat = new Cat();
    cat.x = canvas.width / 2;
    cat.y = canvas.height / 2;
    world.addEntity(cat);

    let lastFrame = performance.now();

    const frame = () => {
        const now = performance.now();
        const elapsed = (now - lastFrame) / 1000;
        lastFrame = now;

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
        ctx.fillStyle = '#fff';
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

class Entity {
    constructor() {
        this.x = this.y = this.age = 0;
        this.categories = [];
        this.seed = Math.random();
    }

    cycle(elapsed) {
        this.age += elapsed;
    }

    render() {

    }
}

class Cat extends Entity {
    constructor() {
        super();
        this.categories.push('cat');
        this.facing = 1;
        this.attackCooldown = 0;
        this.lastAttack = 0;
        this.heat = 0;
        this.nextHeatReset = 0;
        this.releasedAttack = false;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        let x = 0;
        if (downKeys[37]) x = -1;
        if (downKeys[39]) x = 1;

        const speed = 500 * x;
        this.x += speed * elapsed;
        this.walking = !!x;
        this.facing = x || this.facing;

        if (!downKeys[32]) {
            this.releasedAttack = true;
        } else if (this.attackCooldown <= 0 && this.releasedAttack) {
            this.releasedAttack = false;

            this.lastAttack = this.age;

            const attack = new ClawEffect();
            attack.x = this.x + this.facing * 30;
            attack.y = this.y;
            this.world.addEntity(attack);

            this.nextHeatReset = 0.5;
            this.heat++;
            if (this.heat >= 3) {
                this.attackCooldown = 1;
            } else {
                this.attackCooldown = 0.1;
            }


            for (const human of this.world.category('human')) {
                const dx = Math.abs(human.x - attack.x);
                const dy = Math.abs(human.y - attack.y);
                if (dx < 50 && dy < 80) {
                    human.damage();
                }
            }

            attack.x += Math.random() * 30 - 15;
            attack.y += Math.random() * 50 - 25;
        }

        this.nextHeatReset -= elapsed;
        if (this.nextHeatReset <= 0) {
            this.heat = 0;
        }

        this.attackCooldown -= elapsed;
    }

    render() {
        ctx.translate(this.x, this.y);

        ctx.scale(this.facing, 1);

        const BODY_LENGTH = 40;
        const BODY_THICKNESS = 20;
        const LEG_LENGTH = 15;
        const LEG_THICKNESS = 4;
        const TAIL_LENGTH = 30;
        const TAIL_THICKNESS = 5;

        const HEAD_WIDTH = 20;
        const HEAD_HEIGHT = 20;

        const EAR_LENGTH = 10;
        const EAR_WIDTH = 5;

        const ATTACK_ANIMATION_DURATION = 0.2;

        // Body
        ctx.fillStyle = '#000';
        ctx.fillRect(-BODY_LENGTH / 2, -BODY_THICKNESS / 2, BODY_LENGTH, BODY_THICKNESS);

        const legAngle = this.walking
            ? Math.sin(this.age * 3 * Math.PI * 2) * Math.PI / 8
            : 0;

        // Legs
        ctx.save();

        ctx.translate(BODY_LENGTH / 2 - LEG_THICKNESS / 2, BODY_THICKNESS / 2);

        let length = LEG_LENGTH;
        let thickness = LEG_THICKNESS;
        if (this.age - this.lastAttack < ATTACK_ANIMATION_DURATION) {
            const progress = (this.age - this.lastAttack) / ATTACK_ANIMATION_DURATION;
            const startAngle = -Math.PI / 3;
            const endAngle = Math.PI / 2;

            ctx.translate(0, (1 - progress) * -BODY_THICKNESS / 2);

            ctx.rotate(startAngle + (endAngle - startAngle) * progress);

            length += (1 - progress) * LEG_LENGTH;
            thickness += (1 - progress) * LEG_THICKNESS * 0.5;
        } else {
            ctx.rotate(Math.PI / 2 + legAngle);
        }

        ctx.fillRect(0, -LEG_THICKNESS / 2, length, thickness);
        ctx.restore();

        ctx.save();
        ctx.translate(BODY_LENGTH / 2 - LEG_THICKNESS / 2 - 5, BODY_THICKNESS / 2);
        ctx.rotate(Math.PI / 2 - legAngle);
        ctx.fillRect(0, -LEG_THICKNESS / 2, LEG_LENGTH, LEG_THICKNESS);
        ctx.restore();

        ctx.save();
        ctx.translate(-BODY_LENGTH / 2 + LEG_THICKNESS / 2, BODY_THICKNESS / 2);
        ctx.rotate(Math.PI / 2 + legAngle);
        ctx.fillRect(0, -LEG_THICKNESS / 2, LEG_LENGTH, LEG_THICKNESS);
        ctx.restore();

        ctx.save();
        ctx.translate(-BODY_LENGTH / 2 + LEG_THICKNESS / 2 + 5, BODY_THICKNESS / 2);
        ctx.rotate(Math.PI / 2 - legAngle);
        ctx.fillRect(0, -LEG_THICKNESS / 2, LEG_LENGTH, LEG_THICKNESS);
        ctx.restore();

        // Tail
        ctx.save();
        ctx.translate(-BODY_LENGTH / 2 + TAIL_THICKNESS / 2, -BODY_THICKNESS / 2);
        ctx.rotate(-Math.PI / 2 - Math.PI / 4);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = TAIL_THICKNESS;
        ctx.beginPath();
        const phase = this.age * Math.PI * (this.walking ? 5 : 0.5);
        for (let x = 0 ; x < TAIL_LENGTH; x += 1) {
            const amplitudeFactor = x / TAIL_LENGTH;
            ctx.lineTo(x, Math.sin(x / TAIL_LENGTH * Math.PI * 2 + phase) * 5 * amplitudeFactor);
        }
        ctx.stroke();

        // ctx.fillRect(0, -LEG_THICKNESS / 2, LEG_LENGTH, LEG_THICKNESS);
        ctx.restore();

        // Head
        ctx.save();
        ctx.translate(BODY_LENGTH / 2 - 5, -BODY_THICKNESS / 2 - 5);
        if (this.walking) ctx.rotate(Math.sin(this.age * 3 * Math.PI * 2) * Math.PI / 16);
        ctx.fillRect(-HEAD_WIDTH / 2, -HEAD_HEIGHT / 2, HEAD_WIDTH, HEAD_HEIGHT);

        // Eyes
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.fillRect(-3, -5, -4, 4);
        ctx.fillRect(3, -5, 4, 4);
        ctx.restore();

        // Ears
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
        // ctx.fillRect( -4,  -4, 8, 8);
    }
}

class Human extends Entity {

    constructor() {
        super();
        this.categories.push('human');
        this.aim = 0;
        this.facing = 1;
        this.lastDamage = -9;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        // Aim at the cat
        for (const cat of this.world.category('cat')) {
            this.aim = Math.atan2(cat.y - this.y, cat.x - this.x);
            this.facing = Math.sign(cat.x - this.x) || this.facing;
        }
    }

    damage() {
        this.lastDamage = this.age;
    }

    render() {
        ctx.translate(this.x, this.y);
        ctx.scale(this.facing, 1);

        const BODY_LENGTH = 60;
        const BODY_THICKNESS = 30;

        const LEG_LENGTH = 40;
        const LEG_THICKNESS = 12;

        const HEAD_WIDTH = 25;
        const HEAD_HEIGHT = 25;

        const NECK_THICKNESS = 12;
        const NECK_LENGTH = 4;

        const ARM_LENGTH = 40;
        const ARM_THICKNESS = 10;

        ctx.fillStyle = this.age - this.lastDamage < 0.1 ? '#f00' : '#000';

        // Body
        ctx.fillRect(-BODY_THICKNESS / 2, -BODY_LENGTH / 2, BODY_THICKNESS, BODY_LENGTH);

        // Legs
        ctx.save();
        ctx.translate(-BODY_THICKNESS / 2 + LEG_THICKNESS / 2, BODY_LENGTH / 2);
        ctx.fillRect(-LEG_THICKNESS / 2, 0, LEG_THICKNESS, LEG_LENGTH);
        ctx.restore();

        ctx.save();
        ctx.translate(BODY_THICKNESS / 2 - LEG_THICKNESS / 2, BODY_LENGTH / 2);
        ctx.fillRect(-LEG_THICKNESS / 2, 0, LEG_THICKNESS, LEG_LENGTH);
        ctx.restore();

        // Head
        ctx.save();
        ctx.translate(0, -BODY_LENGTH / 2);

        ctx.fillRect(-NECK_THICKNESS / 2, 0, NECK_THICKNESS, -NECK_LENGTH);

        ctx.translate(0, -NECK_LENGTH - HEAD_HEIGHT / 2);
        ctx.fillRect(-HEAD_WIDTH / 2, -HEAD_HEIGHT / 2, HEAD_WIDTH, HEAD_HEIGHT);
        ctx.restore();

        // Arm
        ctx.save();
        ctx.translate(BODY_THICKNESS / 2 - ARM_THICKNESS, -BODY_LENGTH / 2 + NECK_LENGTH);

        let angle = this.aim;
        if (this.facing < 0) {
            angle = Math.atan2(Math.sin(angle), Math.cos(angle) * -1);
        }

        ctx.rotate(angle);
        ctx.fillRect(0, -ARM_THICKNESS / 2, ARM_LENGTH, ARM_THICKNESS);

        // Gun
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.translate(ARM_LENGTH, -2);
        ctx.fillRect(0, 0, 30, -10);
        ctx.fillRect(0, 0, 10, 10);
        ctx.restore();

        ctx.restore();

        // ctx.fillStyle = '#ff0';
        // ctx.fillRect( -25,  -25, 50, 50);
    }
}

class ClawEffect extends Entity {

    cycle(elapsed) {
        super.cycle(elapsed);

        if (this.age > 1) {
            this.world.removeEntity(this);
        }
    }

    render() {
        ctx.translate(this.x, this.y);

        const fadeDuration = 0.25;
        const fadeProgress = (this.age - (1 - fadeDuration)) / fadeDuration;
        ctx.globalAlpha = 1 - Math.min(1, Math.max(0, fadeProgress));

        ctx.fillStyle = '#ff0';

        ctx.rotate(this.seed * Math.PI * 2);

        const s = 1 + this.seed * 0.5;
        ctx.scale(s, s);

        ctx.save();
        this.drawClaw();
        ctx.restore();

        ctx.save();
        ctx.translate(0, -5);
        ctx.scale(0.8, 0.8);
        this.drawClaw();
        ctx.restore();

        ctx.save();
        ctx.translate(0, 5);
        ctx.scale(0.8, 0.8);
        this.drawClaw();
        ctx.restore();

        // ctx.fillStyle = '#ff0';
        // ctx.fillRect( -4,  -4, 8, 8);
    }

    drawClaw() {
        ctx.strokeStyle = ctx.fillStyle = '#f00';
        ctx.beginPath();

        const THICKNESS = 5;
        const LENGTH = 40;
        const l = LENGTH * Math.min(1, this.age / 0.1);

        ctx.translate(-LENGTH / 2, 0);

        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
            l / 2, -THICKNESS / 2,
            l / 2, -THICKNESS / 2,
            l, 0
        );
        ctx.bezierCurveTo(
            l / 2, THICKNESS / 2,
            l / 2, THICKNESS / 2,
            0, 0
        );

        ctx.fill();
    }
}
