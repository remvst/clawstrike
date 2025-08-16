class Human extends Entity {

    constructor() {
        super();
        this.categories.push('human');
        this.aim = 0;
        this.facing = 1;
        this.lastDamage = -9;
        this.vY = 0;
        this.walkingDirection = 1;

        this.walking = false;

        this.radiusX = 10;
        this.radiusY = 40;

        this.nextShot = 0;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        // Left-right movement
        this.walking = ((this.age + this.seed * 8) % 8) < 5;
        if (this.walking) {
            this.x += this.walkingDirection * 100 * elapsed;
        }

        // Fall down
        this.vY += elapsed * 400;
        this.y += this.vY * elapsed;

        const { x, y } = this;

        for (const structure of this.world.category('structure')) {
            structure.reposition(this, this.radiusX, this.radiusY);

            if (!structure.cellAt(this.x - this.radiusX, this.y + this.radiusY + 1)) {
                this.walkingDirection = 1;
            }

            if (!structure.cellAt(this.x + this.radiusX, this.y + this.radiusY + 1)) {
                this.walkingDirection = -1;
            }
        }

        if (y !== this.y) this.vY = 0;
        if (x !== this.x) this.walkingDirection = Math.sign(this.x - x);

        // Aim at the cat
        this.seesCat = null;
        outer: for (const cat of this.world.category('cat')) {
            const angleToCat = angleBetween(this, cat);
            const distanceToCat = distance(this, cat);

            for (const structure of this.world.category('structure')) {
                const impact = structure.raycaster.castRay(this.x, this.y, angleToCat, distanceToCat);
                if (impact && distance(this, impact) < distanceToCat) {
                    continue outer; // Cat is blocked by the structure, move on to the next cat
                }
            }

            this.seesCat = cat;
        }

        if (this.seesCat) {
            this.facing = Math.sign(this.seesCat.x - this.x) || 1;
            this.aim = Math.atan2(this.seesCat.y - this.y, this.seesCat.x - this.x);
        } else {
            this.facing = this.walkingDirection;
            this.aim = Math.atan2(1, this.facing / 2);
        }

        if ((this.nextShot -= elapsed) <= 0 && this.seesCat) {
            const bullet = new Bullet(this.aim);
            bullet.x = this.x + this.facing * 10 + Math.cos(this.aim) * 20;
            bullet.y = this.y - 20 + Math.sin(this.aim) * 20;
            this.world.addEntity(bullet);
            this.nextShot = 0.5;
        }
    }

    damage() {
        this.lastDamage = this.age;
    }

    render() {
        for (const cat of this.world.category('cat')) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(cat.x, cat.y);
            ctx.stroke();
        }

        if (this.seesCat) {
            ctx.strokeStyle = '#0f0';
            ctx.lineWidth = 10;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.seesCat.x, this.seesCat.y);
            ctx.stroke();
        }

        ctx.translate(this.x, this.y);
        ctx.scale(this.facing, 1);

        const BODY_LENGTH = 40;
        const BODY_THICKNESS = 20;

        const LEG_LENGTH = 20;
        const LEG_THICKNESS = 8;

        const HEAD_WIDTH = 15;
        const HEAD_HEIGHT = 15;

        const NECK_THICKNESS = 8;
        const NECK_LENGTH = 4;

        const ARM_LENGTH = 20;
        const ARM_THICKNESS = 5;

        ctx.fillStyle = this.age - this.lastDamage < 0.1 ? '#fff' : '#000';

        // Body
        ctx.fillRect(-BODY_THICKNESS / 2, -BODY_LENGTH / 2, BODY_THICKNESS, BODY_LENGTH);

        // Legs
        ctx.save();
        ctx.translate(-BODY_THICKNESS / 2 + LEG_THICKNESS / 2, BODY_LENGTH / 2 - LEG_THICKNESS / 2);
        if (this.walking) ctx.rotate(Math.sin(this.age * Math.PI * 2 * 2) * Math.PI / 16);
        ctx.fillRect(-LEG_THICKNESS / 2, 0, LEG_THICKNESS, LEG_LENGTH + LEG_THICKNESS / 2);
        ctx.restore();

        ctx.save();
        ctx.translate(BODY_THICKNESS / 2 - LEG_THICKNESS / 2, BODY_LENGTH / 2 - LEG_THICKNESS / 2);
        if (this.walking) ctx.rotate(-Math.sin(this.age * Math.PI * 2 * 2) * Math.PI / 16);
        ctx.fillRect(-LEG_THICKNESS / 2, 0, LEG_THICKNESS, LEG_LENGTH + LEG_THICKNESS / 2);
        ctx.restore();

        // Head
        ctx.save();
        ctx.translate(0, -BODY_LENGTH / 2);

        ctx.fillRect(-NECK_THICKNESS / 2, 0, NECK_THICKNESS, -NECK_LENGTH);

        ctx.translate(0, -NECK_LENGTH - HEAD_HEIGHT / 2);
        ctx.fillRect(-HEAD_WIDTH / 2, -HEAD_HEIGHT / 2, HEAD_WIDTH, HEAD_HEIGHT);
        ctx.restore();

        // Arm
        // ctx.fillStyle = '#f00';
        ctx.save();
        ctx.translate(BODY_THICKNESS / 2 - ARM_THICKNESS / 2, -BODY_LENGTH / 2);

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
        ctx.fillRect(0, 0, 15, -5);
        ctx.fillRect(0, 0, 5, 5);
        ctx.restore();

        ctx.restore();

        // ctx.fillStyle = '#ff0';
        // ctx.fillRect( -25,  -25, 50, 50);

        // ctx.fillStyle = '#f00';
        // ctx.globalAlpha = 0.5;
        // ctx.fillRect(-this.radiusX, -this.radiusY, this.radiusX * 2, this.radiusY * 2);
    }
}
