class Human extends Entity {

    constructor() {
        super();

        this.type = 'human';

        this.categories.push('human');
        this.aim = 0;
        this.facing = 1;
        this.lastDamage = -9;
        this.vY = 0;
        this.walkingDirection = 1;

        this.walking = false;
        this.lastLanded = -9;

        this.radiusX = 10;
        this.radiusY = 40;

        this.hitbox.width = this.radiusX * 2;
        this.hitbox.height = this.radiusY * 2;

        this.nextShot = 0;
        this.lastSeenCat = -9;
        this.lastCatCheck = 0;

        this.health = 3;
    }

    get landed() {
        return this.age - this.lastLanded < 0.1;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        // Left/right movement
        this.walking = ((this.age + this.seed * 8) % 8) < 5 && this.age - this.lastSeenCat > 2 && this.landed && this.age - this.lastDamage > 0.5;
        if (this.walking) {
            this.x += this.walkingDirection * 100 * elapsed;
        }

        // Fall down
        this.vY += elapsed * 400;
        this.y += this.vY * elapsed;

        const { x, y } = this;

        for (const structure of this.world.category('structure')) {
            structure.reposition(this, this.radiusX, this.radiusY, this.x, this.y - 1);

            if (
                !structure.cellAt(this.x - this.radiusX, this.y + this.radiusY + 1) ||
                structure.cellAt(this.x - this.radiusX + 1, this.y) ||
                structure.cellAt(this.x - this.radiusX + 1, this.y - this.radiusY + 1)
            ) {
                this.walkingDirection = 1;
            }

            if (
                !structure.cellAt(this.x + this.radiusX, this.y + this.radiusY + 1) ||
                structure.cellAt(this.x + this.radiusX, this.y) ||
                structure.cellAt(this.x + this.radiusX, this.y - this.radiusY + 1)
            ) {
                this.walkingDirection = -1;
            }
        }

        if (y !== this.y) {
            this.vY = 0;
            if (this.y <= y) this.lastLanded = this.age;
        }
        if (x !== this.x) this.walkingDirection = sign(this.x - x);

        // Aim at the cat
        const { seesCat } = this;

        if (this.age - this.lastCatCheck > 0.2) {
            this.lastCatCheck = this.age;

            this.seesCat = null;
            outer: for (const cat of this.world.category('cat')) {
                // Cat is in our back, don't even look at it
                if (sign(cat.x - this.x) !== this.facing && !seesCat) continue;

                const distanceToCat = distance(this, cat);

                if (distanceToCat > HUMAN_VISION_DISTANCE) continue; // Too far away

                const angleToCat = angleBetween(this, cat);
                const baseAngle = this.facing > 0 ? 0 : PI;
                const angleDiff = normalizeAngle(angleToCat - baseAngle);
                if (abs(angleDiff) > PI / HUMAN_VISION_DIVIDER) continue; // Out of vision cone

                for (const structure of this.world.category('structure')) {
                    const impact = structure.raycaster.castRay(this.x, this.y, angleToCat, distanceToCat);
                    if (impact && distance(this, impact) < distanceToCat) {
                        continue outer; // Cat is blocked by the structure, move on to the next cat
                    }
                }

                this.seesCat = cat;

                // Cat was just spotted, delay the next shot a bit
                if (!seesCat) {
                    this.nextShot = G.difficulty.humanReactionTime;
                    zzfx(...[2,,400,.02,.02,.25,2,2.5,,114,,,,.3,,.1,.08,.63,.01,,464]); // Pickup 605
                }
            }
        }

        if (this.seesCat && this.age - this.lastDamage > 0.5) {
            this.facing = sign(this.seesCat.x - this.x) || 1;
            this.aim = atan2(this.seesCat.y - this.y, this.seesCat.x - this.x);
            this.lastSeenCat = this.age;
        } else {
            if (this.age - this.lastSeenCat > 2) {
                this.facing = this.walkingDirection;
                this.aim = atan2(1, this.facing / 2);
            }
        }

        if ((this.nextShot -= elapsed) <= 0 && this.seesCat) {
            const bullet = this.world.addEntity(new Bullet(this));
            bullet.x = this.x + this.facing * 10 + cos(this.aim) * 20;
            bullet.y = this.y - 20 + sin(this.aim) * 20;
            this.nextShot = 0.2;
        }
    }

    damage() {
        this.lastDamage = this.age;
        this.nextShot = max(this.nextShot, 1);

        zzfx(...[1.1,,339,,.01,.05,1,2.4,-6,2,,,.09,1.1,,.5,,.67,.1]); // Hit 222

        if (--this.health <= 0) {
            zzfx(...[2,,69,.02,.17,.55,4,3.3,2,,,,,1,,.1,.2,.4,.15]); // Explosion 128
            this.world.removeEntity(this);
        }

        for (let i = 0; i < (this.health ? 10 : 50); i++) {
            const part = new PhysicalParticle();
            part.x = this.x + rnd(-this.radiusX, this.radiusX);
            part.y = this.y + rnd(-this.radiusY, this.radiusY);
            this.world.addEntity(part);
        }
    }

    render() {
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
        ctx.wrap(() => {
            ctx.translate(0, BODY_LENGTH / 2 - LEG_THICKNESS / 2);

            const legBaseAngle = this.walking
                ? sin(this.age * PI * 2 * 2) * PI / 16
                : 0;

            ctx.wrap(() => {
                ctx.translate(-BODY_THICKNESS / 2 + LEG_THICKNESS / 2, 0);
                ctx.rotate(legBaseAngle);
                ctx.fillRect(-LEG_THICKNESS / 2, 0, LEG_THICKNESS, LEG_LENGTH + LEG_THICKNESS / 2);
            });

            ctx.wrap(() => {
                ctx.translate(BODY_THICKNESS / 2 - LEG_THICKNESS / 2, 0);
                ctx.rotate(-legBaseAngle);
                ctx.fillRect(-LEG_THICKNESS / 2, 0, LEG_THICKNESS, LEG_LENGTH + LEG_THICKNESS / 2);
            });
        });

        ctx.wrap(() => {
            // Neck
            ctx.translate(0, -BODY_LENGTH / 2);
            ctx.fillRect(-NECK_THICKNESS / 2, 0, NECK_THICKNESS, -NECK_LENGTH);

            // Head
            ctx.translate(0, -NECK_LENGTH - HEAD_HEIGHT / 2);
            ctx.fillRect(-HEAD_WIDTH / 2, -HEAD_HEIGHT / 2, HEAD_WIDTH, HEAD_HEIGHT);
        });

        // Arm
        ctx.wrap(() => {
            ctx.translate(BODY_THICKNESS / 2 - ARM_THICKNESS / 2, -BODY_LENGTH / 2);

            let angle = this.aim;
            if (this.facing < 0) {
                angle = atan2(sin(angle), cos(angle) * -1);
            }

            ctx.rotate(angle);
            ctx.fillRect(0, -ARM_THICKNESS / 2, ARM_LENGTH, ARM_THICKNESS);

            // Gun
            ctx.wrap(() => {
                ctx.fillStyle = '#000';
                ctx.translate(ARM_LENGTH, -2);
                ctx.fillRect(0, 0, 15, -5);
                ctx.fillRect(0, 0, 5, 5);
            });
        });

        if (this.age - this.lastSeenCat < 1) ctx.wrap(() => {
            ctx.translate(0, -70);
            ctx.scale(this.facing, 1);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;

            ctx.strokeText(this.seesCat ? '!' : '?', 0, 0);
            ctx.fillText(this.seesCat ? '!' : '?', 0, 0);
        });
    }

    renderDebug() {
        if (!DEBUG) return;

        super.renderDebug();

        if (DEBUG_VISION) ctx.wrap(() => {
            ctx.beginPath();

            for (const cat of this.world.category('cat')) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
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
        });

        if (DEBUG_VISION) ctx.wrap(() => {
            const baseAngle = this.facing > 0 ? 0 : PI;

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.translate(this.x, this.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(cos(baseAngle + PI / HUMAN_VISION_DIVIDER) * HUMAN_VISION_DISTANCE, sin(baseAngle + PI / HUMAN_VISION_DIVIDER) * HUMAN_VISION_DISTANCE);
            ctx.moveTo(0, 0);
            ctx.lineTo(cos(baseAngle - PI / HUMAN_VISION_DIVIDER) * HUMAN_VISION_DISTANCE, sin(baseAngle - PI / HUMAN_VISION_DIVIDER) * HUMAN_VISION_DISTANCE);
            ctx.stroke();
        });
    }
}
