class Cat extends Entity {
    constructor() {
        super();

        this.type = 'cat';

        this.categories.push('cat');
        this.facing = 1;
        this.attackCooldown = 0;
        this.lastAttack = 0;
        this.heat = 0;
        this.nextHeatReset = 0;
        this.releasedAttack = false;

        this.rolling = false;
        this.rollingAge = 0;

        this.releasedJump = false;
        this.jumpStartAge = this.jumpEndAge = -9999;
        this.jumpStartY = 0;
        this.jumpHoldTime = 0;
        this.lastLanded = -9;

        this.vX = 0;
        this.vY = 0;

        this.viewAngle = 0;

        this.health = 1;

        this.radiusX = 20;
        this.radiusY = 20;
        this.hitbox.width = this.radiusX * 2;
        this.hitbox.height = this.radiusY * 2;

        this.wallStickX = 0;
        this.wallStickDirection = 0;
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
        if (!this.landed && !this.stickingToWall) return;

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

        this.wallStickX = 0;
        this.wallStickDirection = 0;
    }

    get stickingToWall() {
        if (Math.abs(this.x - this.wallStickX) > 5) return false;
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

        // Roll behavior)
        this.rolling = downKeys[40] && (this.rolling || this.landed && this.rollingReleased);

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

            const resisting = x && Math.sign(x) !== Math.sign(this.vX);
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
                    targetVX = 400 * x;
                } else {
                    if (resisting) {
                        acceleration = 2000;
                    } else if (pushing) {
                        acceleration = 2000;
                    } else {
                        acceleration = 1000;
                    }

                    targetVX = 600 * x;
                }

                // if (pushing) {
                //     targetVX = x * Math.max(Math.abs(targetVX), Math.abs(this.vX));
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
        } else if (this.attackCooldown <= 0 && this.releasedAttack && !this.rolling) {
            this.releasedAttack = false;

            this.lastAttack = this.age;

            firstItem(this.world.category('camera')).shake(0.05, 5);

            this.nextHeatReset = 0.5;
            this.heat++;
            if (this.heat >= 5) {
                this.attackCooldown = 1;
            } else {
                this.attackCooldown = 0.1;
            }

            for (const human of this.world.category('human')) {
                if (this.attackHitbox.intersects(human.hitbox)) {
                    human.damage();
                    human.x += Math.sign(human.x - this.x) * 10;

                    this.facing = Math.sign(human.x - this.x);
                }
            }

            const attack = new ClawEffect();
            attack.x = this.x + this.facing * 30;
            attack.y = this.y;
            this.world.addEntity(attack);

            zzfx(...[0.1,,170,.04,.04,.06,1,1.8,25,4,,,,5,,,,.85,.01]); // Jump 62

            attack.x += Math.random() * 30 - 15;
            attack.y += Math.random() * 50 - 25;

            this.x += this.facing * 10;
        }

        this.nextHeatReset -= elapsed;
        if (this.nextHeatReset <= 0) {
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
            zzfx(...[.05,,339,.01,.01,,4,4.4,11,-6,-486,.09,,,,,,.64,.03,.2]); // Blip 426
        }

        if (x !== this.x) {
            const readjustmentDirection = Math.sign(this.x - x);
            if (this.facing !== readjustmentDirection) {
                this.vX = 0;
            }

            if (!this.stickingToWall)
            if (y === this.y && !this.landed && this.facing !== readjustmentDirection) {
                this.wallStickX = this.x;
                this.wallStickDirection = readjustmentDirection;
            }

            if (this.rolling && sign(this.x - x) !== this.facing) {
                this.rolling = false;

                this.vX = sign(this.x - x) * 400;
                // this.x += sign(this.x - x) * 25;
            }
        }

        if (!this.stickingToWall) {
            this.wallStickX = 0;
        } else {
            this.viewAngle = -Math.PI / 2;
        }
    }

    get landed() {
        return this.age - this.lastLanded < 0.1;
    }

    damage() {
        if (--this.health <= 0) {
            this.world.removeEntity(this);

            zzfx(...[2,,69,.02,.17,.55,4,3.3,2,,,,,1,,.1,.2,.4,.15]); // Explosion 128

            G.screens.push(new GameOverScreen());
        }

        for (let i = 0; i < 100; i++) {
            const part = new PhysicalParticle();
            part.x = this.x + rnd(-this.radiusX, this.radiusX);
            part.y = this.y + rnd(-this.radiusY, this.radiusY);
            this.world.addEntity(part);
        }

        const flash = new Flash('#fff');
        this.world.addEntity(flash);
        this.world.addEntity(new Interpolator(flash, 'alpha', 0.5, 0, 0.2));
        // TODO maybe should clean up the flash? eh not much of a perf hit
    }

    jumpData() {
        const jumpPower = Math.min(1, this.jumpHoldTime / 0.1);
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
            ctx.rotate(this.rollingAge * Math.PI * 6);
            ctx.scale(0.8, 0.8);
        }

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

        ctx.fillStyle = ctx.strokeStyle = '#000';

        // Body
        ctx.wrap(() => {
            ctx.lineWidth = BODY_THICKNESS;
            ctx.lineJoin = 'round';
            if (this.walking) ctx.rotate(Math.sin(this.age * PI * 2 * 5) * Math.PI / 16);
            ctx.beginPath();
            ctx.moveTo(-BODY_LENGTH / 2, 0);
            if (this.rolling) ctx.lineTo(0, -10);
            // if (this.walking) ctx.lineTo(0, Math.sin(this.age * Math.PI * 2 * 5) * 2);
            ctx.lineTo(BODY_LENGTH / 2, 0);
            ctx.stroke();
        });

        let frontLegsBaseAngle = this.landed ? Math.PI / 2 : 0;
        let backLegsBaseAngle = this.landed ? Math.PI / 2 : Math.PI;

        if (this.rolling) {
            frontLegsBaseAngle += Math.PI / 4;
            backLegsBaseAngle -= Math.PI / 4;
        }

        const legsWalkAngle = this.walking || (!this.landed && !this.stickingToWall)
            ? Math.sin(this.age * 3 * Math.PI * 2) * Math.PI / 4 * (this.stickingToWall ? 0.5 : 1)
            : 0;

        // Legs
        const legSettings = [
            [BODY_LENGTH / 2 - LEG_THICKNESS / 2, frontLegsBaseAngle + legsWalkAngle],
            [BODY_LENGTH / 2 - LEG_THICKNESS / 2 - 5, frontLegsBaseAngle - legsWalkAngle],
            [-BODY_LENGTH / 2 + LEG_THICKNESS / 2, backLegsBaseAngle - legsWalkAngle],
            [-BODY_LENGTH / 2 + LEG_THICKNESS / 2 + 5, backLegsBaseAngle + legsWalkAngle],
        ];
        if (this.age - this.lastAttack < ATTACK_ANIMATION_DURATION) {
            const progress = (this.age - this.lastAttack) / ATTACK_ANIMATION_DURATION;
            const startAngle = -Math.PI / 3;
            const endAngle = Math.PI / 2;
            legSettings[0][1] = interpolate(startAngle, endAngle, progress);
        }

        for (const [x, angle] of legSettings) {
            ctx.wrap(() => {
                ctx.strokeStyle = '#000';
                ctx.lineCap = 'round';
                ctx.lineWidth = LEG_THICKNESS;

                ctx.translate(x, BODY_THICKNESS / 2 - LEG_THICKNESS / 2);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(LEG_LENGTH, 0);
                ctx.stroke();
            });
        }

        // Tail
        ctx.wrap(() => {
            if (this.rolling) {
                ctx.translate(-BODY_LENGTH / 2 + TAIL_THICKNESS / 2 + 4, BODY_THICKNESS / 2 - 4);
                ctx.rotate(Math.PI / 2 - Math.PI / 4);
            } else {
                ctx.translate(-BODY_LENGTH / 2 + TAIL_THICKNESS / 2, -BODY_THICKNESS / 2);
                ctx.rotate(-Math.PI / 2 - Math.PI / 4);
            }

            ctx.strokeStyle = '#000';
            ctx.lineCap = 'round';
            ctx.lineWidth = TAIL_THICKNESS;
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            const phase = this.age * Math.PI * (this.walking ? 5 : 0.5);
            for (let x = 0 ; x < TAIL_LENGTH; x += 4) {
                const amplitudeFactor = x / TAIL_LENGTH;
                ctx.lineTo(x, Math.sin(x / TAIL_LENGTH * Math.PI * 2 + phase) * 5 * amplitudeFactor);
            }
            ctx.stroke();
        });

        // Head
        ctx.wrap(() => {
            ctx.translate(BODY_LENGTH / 2 - 5, 0);

            ctx.rotate(-Math.PI / 2);
            if (this.rolling) ctx.rotate(Math.PI - Math.PI / 3);

            ctx.translate(10, 0);
            if (this.walking) ctx.rotate(Math.sin(this.age * 3 * Math.PI * 2) * Math.PI / 16);

            ctx.fillRect(-HEAD_WIDTH / 2, -HEAD_HEIGHT / 2, HEAD_WIDTH, HEAD_HEIGHT);

            // Eyes
            if (this.age % 3 > 0.1) ctx.wrap(() => {
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, -3, 4, -4);
                ctx.fillRect(0, 3, 4, 4);
            });

            // Ears
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(HEAD_WIDTH / 2, -HEAD_HEIGHT / 2);
            ctx.lineTo(HEAD_WIDTH / 2 + EAR_LENGTH, -HEAD_HEIGHT / 2);
            ctx.lineTo(HEAD_WIDTH / 2, -HEAD_HEIGHT / 2 + EAR_WIDTH);
            ctx.lineTo(HEAD_WIDTH / 2, HEAD_HEIGHT / 2 - EAR_WIDTH);
            ctx.lineTo(HEAD_WIDTH / 2 + EAR_LENGTH, HEAD_HEIGHT / 2);
            ctx.lineTo(HEAD_WIDTH / 2, HEAD_HEIGHT / 2);
            ctx.fill();
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
