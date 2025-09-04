class Cat extends Entity {

    type = 'cat';

    z = Z_CAT;

    lastDamage = -9;
    damageTaken = 0;

    facing = 1;
    attackCooldown = 0;
    lastAttack = -9;
    heat = 0;
    nextHeatReset = 0;
    releasedAttack = false;

    radiusX = 20;
    radiusY = 20;

    rolling = false;
    rollingAge = 0;

    releasedJump = false;
    jumpStartAge = -9;
    jumpEndAge = -9;
    jumpStartY = 0;
    jumpHoldTime = 0;
    lastLanded = -9;

    vX = 0;
    vY = 0;

    viewAngle = 0;

    wallStickX = 0;
    wallStickDirection = 0;
    lastStickToWall = -9;

    color = '#000';

    categories = ['cat'];

    constructor() {
        super();

        this.hitbox.width = this.radiusX * 2;
        this.hitbox.height = this.radiusY * 2;
    }

    get attackHitbox() {
        this.cachedAttackHitbox ||= new Rect();
        this.cachedAttackHitbox.x = this.x;
        this.cachedAttackHitbox.y = this.y;
        this.cachedAttackHitbox.width = 100;
        this.cachedAttackHitbox.height = 100;
        return this.cachedAttackHitbox;
    }

    jump() {
        if (this.age < this.jumpEndAge) return;
        if (!this.releasedJump) return;
        if (!this.landed && this.age - this.lastStickToWall > 0.1) return;

        zzfx(...[.2,,292,.03,.02,.07,1,.4,,131,,,,,,,,.57,.01]);

        this.jumpStartAge = this.age;
        this.releasedJump = false;
        this.jumpStartY = this.y;
        this.jumpHoldTime = 0;
        this.lastLanded = -9;

        if (this.stickingToWall) {
            this.vX = this.wallStickDirection * 400;
            this.facing = this.wallStickDirection;
        }

        for (let i = 0 ; i < 10 ; i++) {
            const particle = this.world.addEntity(new Particle());
            particle.size = rnd(5, 10);

            if (this.stickingToWall) {
                particle.x = this.x - this.wallStickDirection * this.hitbox.width / 2 + rnd(-5, 5);
                particle.y = this.y + rnd(-1, 1) * this.hitbox.height / 2;
                particle.animate(rnd(0.2, 0.5), {
                    x: rnd(20, 50) * this.wallStickDirection,
                    y: rnd(-20, -50),
                    size: -particle.size,
                });
            } else {
                particle.x = this.x - rnd(-1, 1) * this.hitbox.width / 2;
                particle.y = this.y + this.hitbox.height / 2;
                particle.animate(rnd(0.2, 0.5), {
                    x: rnd(-40, 40),
                    y: rnd(-20, -50),
                    size: -particle.size,
                });
            }
        }

        this.wallStickX = 0;
        this.wallStickDirection = 0;
    }

    get stickingToWall() {
        if (abs(this.x - this.wallStickX) > 5) return false;
        if (this.landed) return false;

        let hasWall = false;
        for (const structure of this.world.category('structure')) {
            if (
                structure.cellAt(this.x - CELL_SIZE * this.wallStickDirection, this.y)
            ) {
                hasWall = true;
                break;
            }
        }

        return hasWall;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (this.age - this.lastAttack < 0.1) {
            elapsed *= 0.2;
        }

        // Roll behavior
        const { rolling } = this;
        this.rolling = downKeys[40] && (this.rolling || this.landed && this.rollingReleased);

        if (this.rolling && !rolling) {
            zzfx(...[.2,0,800,.04,.21,.25,,.5,,30,,,,,16,,,.62,.2,,829]);
        }

        if (!downKeys[40]) {
            this.rollingReleased = true;
        }

        if (this.rolling) {
            this.rollingAge += elapsed;
            this.rollingReleased = false;
        } else {
            this.rollingAge = 0;
        }

        // Left-right movement
        {
            let x = 0;
            if (downKeys[37]) x = -1;
            if (downKeys[39]) x = 1;
            if (this.rolling) x = x || this.facing;

            const resisting = x && sign(x) !== sign(this.vX);
            const pushing = x && !resisting;

            {
                let targetVX;
                let acceleration;
                if (this.rolling) {
                    acceleration = 8000;
                    targetVX = 600 * x;
                } else if (this.landed) {
                    if (resisting) {
                        acceleration = 8000;
                    } else if (pushing) {
                        acceleration = 2000;
                    } else {
                        acceleration = 3000;
                    }

                    // More friction when on edge
                    for (const structure of this.world.category('structure')) {
                        if (!structure.cellAt(this.x + this.radiusX, this.y + CELL_SIZE) ||
                            !structure.cellAt(this.x - this.radiusX, this.y + CELL_SIZE)) {
                                if (!x) acceleration *= 5;
                        }
                    }

                    targetVX = 400 * x;
                } else {
                    if (resisting) {
                        acceleration = 3000;
                    } else if (pushing) {
                        acceleration = 2000;
                    } else {
                        acceleration = 1000;
                    }

                    targetVX = 600 * x;
                }

                // if (pushing) {
                //     targetVX = x * max(abs(targetVX), abs(this.vX));
                // }

                this.vX += between(-elapsed * acceleration, targetVX - this.vX, elapsed * acceleration);
            }

            // const speed = (this.rolling ? 600 : 400) * x;
            this.x += this.vX * elapsed;
            this.walking = !!x;

            if (!this.stickingToWall) this.facing = x || this.facing;
        }

        if (downKeys[38]) {
            if (!this.releasedJump) {
                this.jumpHoldTime += elapsed;
            }

            this.jump();
        } else {
            this.releasedJump = true;
        }

        const { isRising, currentY } = this.jumpData();
        if (isRising) {
            // Rising
            this.y = currentY;
            this.vY = 0;
        } else {
            // Falling
            this.y += this.vY * elapsed;
            this.vY += elapsed * (this.stickingToWall ? 100 : 2000);
        }

        let targetAngle = 0;
        let angleSpeed = PI * 2;
        if (this.landed) {
            targetAngle = 0;
            angleSpeed *= 4;
        } else if (isRising) {
            targetAngle = -PI / 3;
        } else {
            targetAngle = PI / 4;
        }

        const angleDiff = normalizeAngle(targetAngle - this.viewAngle);
        this.viewAngle += between(-elapsed * angleSpeed, angleDiff, elapsed * angleSpeed);

        if (!downKeys[32]) {
            this.releasedAttack = true;
        } else if (this.attackCooldown <= 0 && this.releasedAttack && !this.rolling) {
            this.attack();
        }

        if ((this.nextHeatReset -= elapsed) <= 0) {
            this.heat = 0;
        }

        this.attackCooldown -= elapsed;

        const { x, y, landed } = this;
        for (const structure of this.world.category('structure')) {
            structure.reposition(this, this.radiusX, this.radiusY, this.previousX, this.previousY);
        }

        if (this.y > y) {
            this.jumpStartAge = -999;
        } else if (this.y < y) {
            this.vY = 0;
            this.lastLanded = this.age;
            this.viewAngle = 0;
        }

        if (this.landed && !landed) {
            for (let i = 0 ; i < 10 ; i++) {
                const particle = this.world.addEntity(new Particle());
                particle.x = this.x - rnd(-1, 1) * this.hitbox.width / 2;
                particle.y = this.y + this.hitbox.height / 2;
                particle.size = rnd(5, 10);

                particle.animate(rnd(0.2, 0.5), {
                    x: rnd(-40, 40),
                    y: rnd(-20, -50),
                    size: -particle.size,
                });
            }

            zzfx(...[.05,,339,.01,.01,,4,4.4,11,-6,-486,.09,,,,,,.64,.03,.2]); // Blip 426
        }

        if (x !== this.x) {
            const readjustmentDirection = sign(this.x - x);
            if (this.facing !== readjustmentDirection) {
                this.vX = 0;
            }

            if (!this.stickingToWall) {
                if (y === this.y && !this.landed && this.facing !== readjustmentDirection) {
                    this.wallStickX = this.x;
                    this.wallStickDirection = readjustmentDirection;
                }
            }

            if (this.rolling && sign(this.x - x) !== this.facing) {
                this.rolling = false;

                this.vX = sign(this.x - x) * 400;
                zzfx(...[5,,27,.03,.01,.03,3,.8,,,,,.01,,128,.9,.08,.69,.01,.21,110]); // Blip 471
                // zzfx(...[0.3,,365,.01,.04,.13,3,2.9,,-17,,,,1.3,41,,.08,.54,.03,,923]); // Hit 508
                // this.x += sign(this.x - x) * 25;
            }
        }

        if (!this.stickingToWall || downKeys[40]) {
            this.wallStickX = 0;
        } else {
            this.viewAngle = -PI / 2;
            this.lastStickToWall = this.age;
        }

        if (this.releasedMeow && downKeys[69] && this.age - (this.lastMeow || 0) > 0.3) {
            this.releasedMeow = false;
            this.lastMeow = this.age;
            zzfx(...[.5,,282,.02,.03,,2,4,,,,,,1,,,,.78,.03]); // Jump 1017
            const meow = this.world.addEntity(new MeowEffect());
            meow.x = this.x;
            meow.y = this.y;
        }

        this.releasedMeow ||= !downKeys[69];

        if (this.rolling && this.landed && this.age - (this.lastRollParticle || 0) > 1 / 60) {
            this.lastRollParticle = this.age;

            const particle = this.world.addEntity(new Particle());
            particle.x = this.x + rnd(-10, 10);
            particle.y = this.y + this.hitbox.height / 2 + rnd(0, -10);
            particle.size = rnd(4, 8);

            particle.animate(rnd(0.2, 0.5), {
                x: rnd(-10, 10),
                y: rnd(-20, -50),
                size: -particle.size,
            });
        }
    }

    get landed() {
        return this.age - this.lastLanded < 0.1;
    }

    attack() {
        this.releasedAttack = false;
        this.lastAttack = this.age;

        firstItem(this.world.category('camera')).shake(0.05, 5);

        this.nextHeatReset = 0.5;
        this.heat++;
        if (this.heat >= 6) {
            this.attackCooldown = 0.5;
        } else {
            this.attackCooldown = 0.1;
        }

        let target;
        for (const human of this.world.category('human')) {
            if (this.attackHitbox.intersects(human.hitbox)) {
                human.damage();
                human.x += sign(human.x - this.x) * 10;

                target = human;
                this.facing = sign(human.x - this.x);
            }
        }

        const attack = this.world.addEntity(new ClawEffect());
        attack.x = this.x + this.facing * 60;
        attack.y = this.y;

        zzfx(...[0.1,,170,.04,.04,.06,1,1.8,25,4,,,,5,,,,.85,.01]); // Jump 62

        attack.x += rnd(-15, 15);
        attack.y += rnd(-25, 25);

        const angle = target ? angleBetween(this, target) : atan2(0, this.facing);
        const dist = min(10, target ? distance(this, target) : 99);
        this.x += dist * cos(angle);
        this.y += max(0, dist * sin(angle));
    }

    damage() {
        firstItem(this.world.category('camera')).shake(0.1, 10);
        zzfx(...[1.1,,339,,.01,.05,1,2.4,-6,2,,,.09,1.1,,.5,,.67,.1]); // Hit 222

        this.lastDamage = this.age;

        let particleCount = 10;
        if (++this.damageTaken >= G.difficulty.maxDamageTaken) {
            particleCount = 100;

            this.world.removeEntity(this);
            zzfx(...[2,,69,.02,.17,.55,4,3.3,2,,,,,1,,.1,.2,.4,.15]); // Explosion 128
        }

        fireworks(
            this.world,
            this,
            particleCount,
            this.radiusX,
            this.radiusY,
        );

        this.world.addEntity(new Flash('#fff')).interp('alpha', 0.5, 0, 0.2);
        // TODO maybe should clean up the flash? eh not much of a perf hit
    }

    jumpData() {
        const jumpPower = min(1, this.jumpHoldTime / 0.1);
        const jumpHeight = 25 + jumpPower * 150;
        const peakY = this.jumpStartY - jumpHeight;

        const riseDuration = 0.1 + jumpPower * 0.1;
        const riseProgress = between(0, (this.age - this.jumpStartAge) / riseDuration, 1);

        const isRising = riseProgress < 1;

        const currentY = -easeOutSine(riseProgress) * jumpHeight + this.jumpStartY;

        return { peakY, isRising, currentY, jumpAge: this.age - this.jumpStartAge };
    }

    render() {
        ctx.translate(this.x, this.y);

        ctx.scale(this.facing, 1);

        ctx.rotate(this.viewAngle);

        if (this.stickingToWall) ctx.translate(0, 10);

        if (this.rolling) {
            ctx.rotate(this.rollingAge * PI * 6);
            ctx.scale(0.8, 0.8);
        }

        ctx.fillStyle = ctx.strokeStyle = this.age - this.lastDamage < 0.1 ? '#fff' : this.color;

        // Body
        ctx.wrap(() => {
            ctx.lineWidth = CAT_BODY_THICKNESS;
            ctx.lineJoin = nomangle('square');
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-CAT_BODY_LENGTH / 2 + CAT_BODY_THICKNESS / 2, 0);
            const curveHeight = this.rolling
                ? -10
                : sin(this.age * PI * 2 * 4) * !!this.walking * 2;
            ctx.bezierCurveTo(
                0, curveHeight,
                0, curveHeight,
                CAT_BODY_LENGTH / 2 - CAT_BODY_THICKNESS / 2, 0,
            );
            ctx.stroke();

            ctx.fillRect(-CAT_BODY_LENGTH / 2, 0, CAT_BODY_THICKNESS / 2, CAT_BODY_THICKNESS / 2);
            ctx.fillRect(CAT_BODY_LENGTH / 2, 0, -CAT_BODY_THICKNESS / 2, CAT_BODY_THICKNESS / 2);
        });

        let frontLegsBaseAngle = this.landed ? PI / 2 : 0;
        let backLegsBaseAngle = this.landed ? PI / 2 : PI;

        if (this.rolling) {
            frontLegsBaseAngle += PI / 4;
            backLegsBaseAngle -= PI / 4;
        }

        const legsWalkAngle = this.walking || (!this.landed && !this.stickingToWall)
            ? sin(this.age * 3 * PI * 2) * PI / 4 * (this.stickingToWall ? 0.5 : 1)
            : 0;

        // Legs
        const legSettings = [
            [CAT_BODY_LENGTH / 2 - CAT_LEG_THICKNESS / 2, frontLegsBaseAngle + legsWalkAngle],
            [CAT_BODY_LENGTH / 2 - CAT_LEG_THICKNESS / 2 - 5, frontLegsBaseAngle - legsWalkAngle],
            [-CAT_BODY_LENGTH / 2 + CAT_LEG_THICKNESS / 2, backLegsBaseAngle - legsWalkAngle],
            [-CAT_BODY_LENGTH / 2 + CAT_LEG_THICKNESS / 2 + 5, backLegsBaseAngle + legsWalkAngle],
        ];
        if (this.age - this.lastAttack < CAT_ATTACK_ANIMATION_DURATION) {
            const progress = (this.age - this.lastAttack) / CAT_ATTACK_ANIMATION_DURATION;
            const startAngle = -PI / 3;
            const endAngle = PI / 2;
            legSettings[0][1] = interpolate(startAngle, endAngle, progress);
        }

        for (const [x, angle] of legSettings) {
            ctx.wrap(() => {
                ctx.lineCap = 'round';
                ctx.lineWidth = CAT_LEG_THICKNESS;

                ctx.translate(x, CAT_BODY_THICKNESS / 2 - CAT_LEG_THICKNESS / 2);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(CAT_LEG_LENGTH, 0);
                ctx.stroke();
            });
        }

        // Tail
        ctx.wrap(() => {
            if (this.rolling) {
                ctx.translate(-CAT_BODY_LENGTH / 2 + CAT_TAIL_THICKNESS / 2 + 4, CAT_BODY_THICKNESS / 2 - 4);
                ctx.rotate(PI / 2 - PI / 4);
            } else {
                ctx.translate(-CAT_BODY_LENGTH / 2 + CAT_TAIL_THICKNESS / 2, -CAT_BODY_THICKNESS / 2);
                ctx.rotate(-PI / 2 - PI / 4);
            }

            ctx.lineCap = 'round';
            ctx.lineWidth = CAT_TAIL_THICKNESS;
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            const phase = this.age * PI * (this.walking ? 5 : 0.5);
            for (let x = 0 ; x < CAT_TAIL_LENGTH; x += 4) {
                const amplitudeFactor = x / CAT_TAIL_LENGTH;
                ctx.lineTo(x, sin(x / CAT_TAIL_LENGTH * PI * 2 + phase) * 5 * amplitudeFactor);
            }
            ctx.stroke();
        });

        // Head
        ctx.wrap(() => {
            ctx.translate(CAT_BODY_LENGTH / 2 - 5, 0);

            ctx.rotate(-PI / 2);
            if (this.rolling) ctx.rotate(PI - PI / 3);

            ctx.translate(10, 0);
            if (this.walking) ctx.rotate(sin(this.age * 3 * PI * 2) * PI / 16);
            renderCatHead(this.age % 3 < 0.1);
        });
    }

    renderDebug() {
        if (!DEBUG) return;

        if (DEBUG_HITBOXES) {
            ctx.wrap(() => this.attackHitbox.render());
        }

        super.renderDebug();

        if (DEBUG_JUMP) ctx.wrap(() => {
            const { peakY } = this.jumpData();
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x - 100, peakY, 200, 2);
            ctx.fillRect(this.x - 100, this.jumpStartY, 200, 2);
        });
    }
}

renderCatHead = (blink) => {
    ctx.fillRect(-CAT_HEAD_WIDTH / 2, -CAT_HEAD_HEIGHT / 2, CAT_HEAD_WIDTH, CAT_HEAD_HEIGHT);

    // Eyes
    if (!blink) ctx.wrap(() => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();

        for (const scaleY of [-1, 1]) {
            ctx.wrap(() => {
                ctx.scale(1, scaleY);
                ctx.moveTo(0, 3);
                ctx.lineTo(0, 7);
                ctx.lineTo(4, 7);
                ctx.lineTo(2, 3);
            });
        }
        ctx.fill();
    });

    // Ears
    ctx.beginPath();
    ctx.moveTo(CAT_HEAD_WIDTH / 2, -CAT_HEAD_HEIGHT / 2);
    ctx.lineTo(CAT_HEAD_WIDTH / 2 + CAT_EAR_LENGTH, -CAT_HEAD_HEIGHT / 2);
    ctx.lineTo(CAT_HEAD_WIDTH / 2, -CAT_HEAD_HEIGHT / 2 + CAT_EAR_WIDTH);
    ctx.lineTo(CAT_HEAD_WIDTH / 2, CAT_HEAD_HEIGHT / 2 - CAT_EAR_WIDTH);
    ctx.lineTo(CAT_HEAD_WIDTH / 2 + CAT_EAR_LENGTH, CAT_HEAD_HEIGHT / 2);
    ctx.lineTo(CAT_HEAD_WIDTH / 2, CAT_HEAD_HEIGHT / 2);
    ctx.fill();

    for (const scaleY of [-1, 1]) {
        for (const angle of [0, PI / 16]) {
            ctx.wrap(() => {
                ctx.scale(1, scaleY);
                ctx.rotate(angle);
                ctx.lineWidth = 0.5;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.moveTo(-5, 5);
                ctx.lineTo(-5, 20);
                ctx.stroke();
            });
        }
    }
}
