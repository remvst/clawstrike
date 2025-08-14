const CELL_SIZE = 100;

let canvas;
let ctx;
let downKeys = {};

document.addEventListener('keydown', (event) => {
    downKeys[event.keyCode] = true;
});

document.addEventListener('keyup', (event) => {
    downKeys[event.keyCode] = false;
});

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

function interpolate(a, b, t) {
    return a + (b - a) * between(0, t, 1);
}


onload = () => {
    canvas = document.querySelector('canvas');
    canvas.width = 1600;
    canvas.height = 900;

    ctx = canvas.getContext('2d');

    const world = new World();

    const structure = new Structure([
        [1, 1, 1, 1,1,1,1,1,1,1,1, 1],
        [1, 0, 0, 0,0,0,0,0,0,0,0, 1],
        [1, 0, 0, 0,0,0,0,0,0,0,0, 1],
        [1, 0, 0, 0,0,0,0,0,0,0,0, 1],
        [1, 0, 0, 0,0,0,0,0,0,0,0, 1],
        [1, 0, 1, 0,0,0,0,0,0,0,0, 1],
        [1, 1, 1, 1,1,1,1,1,1,1,1, 1],
    ]);
    world.addEntity(structure);

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

class Entity {
    constructor() {
        this.x = this.y = this.previousX = this.previousY = this.age = 0;
        this.categories = [];
        this.seed = Math.random();
    }

    cycle(elapsed) {
        this.age += elapsed;

        this.previousX = this.x;
        this.previousY = this.y;
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

        this.releasedJump = false;
        this.jumpStartAge = this.jumpEndAge = -9999;
        this.jumpStartY = 0;
        this.jumpHoldTime = 0;
        this.landed = false;
        this.vY = 0;

        this.viewAngle = 0;
    }

    jump() {
        if (this.age < this.jumpEndAge) return;
        if (!this.releasedJump) return;
        if (!this.landed) return;

        this.jumpStartAge = this.age;
        // this.jumpEndAge = this.age + 0.3;
        this.releasedJump = false;
        this.jumpStartY = this.y;
        this.jumpHoldTime = 0;
        this.landed = false;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        let x = 0;
        if (downKeys[37]) x = -1;
        if (downKeys[39]) x = 1;

        const speed = 800 * x;
        this.x += speed * elapsed;
        this.walking = !!x;
        this.facing = x || this.facing;

        if (downKeys[38]) {
            if (!this.releasedJump) {
                this.jumpHoldTime += elapsed;
            }

            this.jump();
        } else {
            this.releasedJump = true;
        }

        const { jumpPeakAge, isRising, currentY } = this.jumpData();
        if (isRising) {
            // Rising
            this.y = currentY;
            this.vY = 0;
        } else {
            // Falling
            this.y += this.vY * elapsed;
            this.vY += elapsed * 2000;

            if (this.y >= 450) {
                this.landed = true;
                this.y = 450;
            }
        }

        let targetAngle = 0;
        let angleSpeed = Math.PI * 2;
        if (this.landed) {
            targetAngle = 0;
            angleSpeed *= 4;
        } else if (isRising) {
            targetAngle = -Math.PI / 3;
        } else {
            targetAngle = Math.PI / 4;
        }

        const angleDiff = normalizeAngle(targetAngle - this.viewAngle);
        this.viewAngle += between(-elapsed * angleSpeed, angleDiff, elapsed * angleSpeed);

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

    jumpData() {
        const jumpPower = Math.min(1, this.jumpHoldTime / 0.2);
        const jumpHeight = 50 + jumpPower * 200;
        const peakY = this.jumpStartY - jumpHeight;

        const riseDuration = 0.2 + jumpPower * 0.1;
        const riseProgress = between(0, (this.age - this.jumpStartAge) / riseDuration, 1);

        const isRising = riseProgress < 1;

        const currentY = -easeOutSine(riseProgress) * jumpHeight + this.jumpStartY;

        return { peakY, isRising, currentY, jumpAge: this.age - this.jumpStartAge };
    }

    render() {

        const { peakY, jumpAge } = this.jumpData();

        // ctx.fillStyle = '#f00';
        // ctx.fillRect(0, peakY, 800, 2);
        // ctx.fillRect(0, this.jumpStartY, 800, 2);

        ctx.translate(this.x, this.y);

        ctx.scale(this.facing, 1);

        ctx.rotate(this.viewAngle);

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

        const frontLegsBaseAngle = this.landed ? Math.PI / 2 : 0;
        const backLegsBaseAngle = this.landed ? Math.PI / 2 : Math.PI;
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
            ctx.rotate(frontLegsBaseAngle + legAngle);
        }

        ctx.fillRect(0, -LEG_THICKNESS / 2, length, thickness);
        ctx.restore();

        ctx.save();
        ctx.translate(BODY_LENGTH / 2 - LEG_THICKNESS / 2 - 5, BODY_THICKNESS / 2);
        ctx.rotate(frontLegsBaseAngle - legAngle);
        ctx.fillRect(0, -LEG_THICKNESS / 2, LEG_LENGTH, LEG_THICKNESS);
        ctx.restore();

        ctx.save();
        ctx.translate(-BODY_LENGTH / 2 + LEG_THICKNESS / 2, BODY_THICKNESS / 2);
        ctx.rotate(backLegsBaseAngle + legAngle);
        ctx.fillRect(0, -LEG_THICKNESS / 2, LEG_LENGTH, LEG_THICKNESS);
        ctx.restore();

        ctx.save();
        ctx.translate(-BODY_LENGTH / 2 + LEG_THICKNESS / 2 + 5, BODY_THICKNESS / 2);
        ctx.rotate(backLegsBaseAngle - legAngle);
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

        ctx.rotate(this.seed * Math.PI * 2);

        const s = 1 + this.seed * 0.5;
        ctx.scale(s, s);
        ctx.scale(1 + this.seed * 0.5, 1);

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
        ctx.strokeStyle = ctx.fillStyle = '#f80';
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

class Structure extends Entity {
    constructor(matrix) {
        super();
        this.categories.push('structure');
        this.matrix = matrix;
    }

    render() {

        const rows = this.matrix.length;
        const cols = this.matrix[0].length;

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, cols * CELL_SIZE, rows * CELL_SIZE);

        ctx.fillStyle = '#000';
        ctx.save();
        for (const row of this.matrix) {
            ctx.translate(0, CELL_SIZE);
            ctx.save();
            for (const cell of row) {
                if (cell) ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE);
                ctx.translate(CELL_SIZE, 0);
            }
            ctx.restore();
        }
        ctx.restore();
    }

}
