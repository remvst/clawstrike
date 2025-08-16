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

        this.radiusX = 20;
        this.radiusY = 20;

        this.wallStickX = 0;
        this.wallStickDirection = 0;
    }

    jump() {
        if (this.age < this.jumpEndAge) return;
        if (!this.releasedJump) return;
        if (!this.landed && !this.stickingToWall) return;

        this.jumpStartAge = this.age;
        this.releasedJump = false;
        this.jumpStartY = this.y;
        this.jumpHoldTime = 0;
        this.lastLanded = -9;

        if (this.stickingToWall) {
            this.vX = this.wallStickDirection * 200;
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

        this.rolling = downKeys[40] && this.landed;
        if (this.rolling) {
            this.rollingAge += elapsed;
        } else {
            this.rollingAge = 0;
        }

        // Left-right movement
        {
            let x = 0;
            if (downKeys[37]) x = -1;
            if (downKeys[39]) x = 1;
            if (this.rolling) x = this.facing;

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
                        acceleration = 4000;
                    } else if (pushing) {
                        acceleration = 2000;
                    } else {
                        acceleration = 3000;
                    }
                    targetVX = 400 * x;
                } else {
                    if (resisting) {
                        acceleration = 500;
                    } else if (pushing) {
                        acceleration = 500;
                    } else {
                        acceleration = 0;
                    }

                    targetVX = 600 * x;
                }

                if (pushing) {
                    targetVX = x * Math.max(Math.abs(targetVX), Math.abs(this.vX));
                }

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
        } else if (this.attackCooldown <= 0 && this.releasedAttack) {
            this.releasedAttack = false;

            this.lastAttack = this.age;

            const attack = new ClawEffect();
            attack.x = this.x + this.facing * 30;
            attack.y = this.y;
            this.world.addEntity(attack);

            this.nextHeatReset = 0.5;
            this.heat++;
            if (this.heat >= 5) {
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

        const { x, y } = this;
        for (const structure of this.world.category('structure')) {
            structure.reposition(this, this.radiusX, this.radiusY);
        }

        if (this.y > y) {
            this.jumpStartAge = -999;
        } else if (this.y < y) {
            this.vY = 0;
            this.lastLanded = this.age;
            this.viewAngle = 0;
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
                console.log('go stick wall!');
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

        // const { peakY, jumpAge } = this.jumpData();

        // ctx.fillStyle = '#f00';
        // ctx.fillRect(0, peakY, 800, 2);
        // ctx.fillRect(0, this.jumpStartY, 800, 2);

        ctx.translate(this.x, this.y);

        ctx.scale(this.facing, 1);

        ctx.rotate(this.viewAngle);

        if (this.stickingToWall) ctx.translate(0, 8);

        ctx.rotate(this.rollingAge * Math.PI * 6);

        if (this.rolling) ctx.scale(0.8, 0.8);

        const BODY_LENGTH = 40;
        const BODY_THICKNESS = 20;
        const LEG_LENGTH = true ? 15 : 15;
        const LEG_THICKNESS = 4;
        const TAIL_LENGTH = 30;
        const TAIL_THICKNESS = 5;

        const HEAD_WIDTH = 20;
        const HEAD_HEIGHT = 20;

        const EAR_LENGTH = 10;
        const EAR_WIDTH = 5;

        const ATTACK_ANIMATION_DURATION = 0.2;

        // Body
        ctx.fillStyle = ctx.strokeStyle = '#000';

        ctx.lineWidth = BODY_THICKNESS;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(-BODY_LENGTH / 2, 0);
        if (this.rolling) ctx.lineTo(0, -10);
        ctx.lineTo(BODY_LENGTH / 2, 0);
        ctx.stroke();

        // ctx.fillRect(-BODY_LENGTH / 2, -BODY_THICKNESS / 2, BODY_LENGTH, BODY_THICKNESS);

        let frontLegsBaseAngle = this.landed ? Math.PI / 2 : 0;
        let backLegsBaseAngle = this.landed ? Math.PI / 2 : Math.PI;

        if (this.rolling) {
            frontLegsBaseAngle += Math.PI / 4;
            backLegsBaseAngle -= Math.PI / 4;
        }

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

        if (this.rolling) {
            ctx.translate(-BODY_LENGTH / 2 + TAIL_THICKNESS / 2 + 4, BODY_THICKNESS / 2 - 4);
            ctx.rotate(Math.PI / 2 - Math.PI / 4);
        } else {
            ctx.translate(-BODY_LENGTH / 2 + TAIL_THICKNESS / 2, -BODY_THICKNESS / 2);
            ctx.rotate(-Math.PI / 2 - Math.PI / 4);
        }

        ctx.strokeStyle = '#000';
        ctx.lineWidth = TAIL_THICKNESS;
        ctx.beginPath();
        const phase = this.age * Math.PI * (this.walking ? 5 : 0.5);
        for (let x = 0 ; x < TAIL_LENGTH; x += 4) {
            const amplitudeFactor = x / TAIL_LENGTH;
            ctx.lineTo(x, Math.sin(x / TAIL_LENGTH * Math.PI * 2 + phase) * 5 * amplitudeFactor);
        }
        ctx.stroke();

        // ctx.fillRect(0, -LEG_THICKNESS / 2, LEG_LENGTH, LEG_THICKNESS);
        ctx.restore();

        // Head
        ctx.save();
        ctx.translate(BODY_LENGTH / 2 - 5, 0);

        ctx.rotate(-Math.PI / 2);
        if (this.rolling) ctx.rotate(Math.PI - Math.PI / 3);

        ctx.translate(10, 0);

        if (this.walking) ctx.rotate(Math.sin(this.age * 3 * Math.PI * 2) * Math.PI / 16);
        ctx.fillRect(-HEAD_WIDTH / 2, -HEAD_HEIGHT / 2, HEAD_WIDTH, HEAD_HEIGHT);

        // Eyes
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, -3, 4, -4);
        ctx.fillRect(0, 3, 4, 4);
        ctx.restore();

        // Ears
        ctx.beginPath();
        ctx.moveTo(HEAD_WIDTH / 2, -HEAD_HEIGHT / 2);
        ctx.lineTo(HEAD_WIDTH / 2 + EAR_LENGTH, -HEAD_HEIGHT / 2);
        ctx.lineTo(HEAD_WIDTH / 2, -HEAD_HEIGHT / 2 + EAR_WIDTH);
        ctx.lineTo(HEAD_WIDTH / 2, HEAD_HEIGHT / 2 - EAR_WIDTH);
        ctx.lineTo(HEAD_WIDTH / 2 + EAR_LENGTH, HEAD_HEIGHT / 2);
        ctx.lineTo(HEAD_WIDTH / 2, HEAD_HEIGHT / 2);
        // ctx.lineTo(HEAD_WIDTH / 2 + EAR_WIDTH, -HEAD_HEIGHT / 2);
        // ctx.lineTo(HEAD_WIDTH / 2 - EAR_WIDTH, -HEAD_HEIGHT / 2);
        // ctx.lineTo(HEAD_WIDTH / 2, -HEAD_HEIGHT / 2 - EAR_LENGTH);
        // ctx.lineTo(HEAD_WIDTH / 2, -HEAD_HEIGHT / 2);
        ctx.fill();

        ctx.restore();

        // ctx.fillStyle = '#ff0';
        // ctx.fillRect( -4,  -4, 8, 8);

        // ctx.fillStyle = '#f00';
        // ctx.globalAlpha = 0.5;
        // ctx.fillRect(-this.radiusX, -this.radiusY, this.radiusX * 2, this.radiusY * 2);
    }
}
