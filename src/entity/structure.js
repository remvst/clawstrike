class Structure extends Entity {
    constructor() {
        super();
        this.type = 'structure';
        this.categories.push('structure');
        this.color = '#f00';
        this.cellColor = '#000';
        this.raycaster = new Raycaster(this);
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        this.width = this.matrix[0].length * CELL_SIZE;
        this.height = this.matrix.length * CELL_SIZE;
    }

    render() {
        if (!this.matrix) return;

        this.width = this.matrix[0].length * CELL_SIZE;
        this.height = this.matrix.length * CELL_SIZE;

        const rows = this.matrix.length;
        const cols = this.matrix[0].length;

        this.prerendered = this.prerendered || createCanvas(this.width, this.height, (ctx, can) => {
            ctx.fillStyle = this.color;
            ctx.fillRect(0, 0, this.width, this.height);

            // Background stripes
            ctx.wrap(() => {
                ctx.fillStyle = '#000';
                ctx.globalAlpha = 0.05;

                for (let refX = 0 ; refX < cols * CELL_SIZE; refX += CELL_SIZE * 15) {
                    ctx.beginPath();

                    for (let y = 0 ; y < this.height; y += 5) {
                        const relY = y / CANVAS_HEIGHT;
                        ctx.lineTo(
                            refX + relY * 400 + sin(relY * TWO_PI * 20) * 10,
                            relY * CANVAS_HEIGHT,
                        );
                    }

                    for (let y = this.height ; y >= 0; y -= 5) {
                        const relY = y / CANVAS_HEIGHT;
                        ctx.lineTo(
                            refX + 300 + relY * 400 + sin(relY * TWO_PI * 20) * 10,
                            relY * CANVAS_HEIGHT,
                        );
                    }
                    ctx.fill();
                }
            });

            // Cells
            ctx.wrap(() => {
                ctx.fillStyle = this.cellColor;

                for (let row = rows - 1 ; row >= 0 ; row--) {
                    for (let col = 0 ; col < cols ; col++) {
                        const cell = this.matrix[row][col];
                        if (cell) {
                            ctx.fillRect(
                                col * CELL_SIZE,
                                row * CELL_SIZE,
                                CELL_SIZE,
                                cell === 1 ? CELL_SIZE : CELL_SIZE / 4
                            );
                        }
                    }
                }
            });

            ctx.strokeStyle = '#fff';
            ctx.globalAlpha = 0.2;
            ctx.lineWidth = 2;

            const shadowLength = CELL_SIZE;

            const verticalGradient = ctx.createLinearGradient(
                0, 0,
                0, shadowLength,
            );
            verticalGradient.addColorStop(0, 'rgba(0,0,0,1)');
            verticalGradient.addColorStop(1, 'rgba(0,0,0,0)');

            const horizontalGradient = ctx.createLinearGradient(
                0, 0,
                shadowLength, 0,
            );
            horizontalGradient.addColorStop(0, 'rgba(0,0,0,1)');
            horizontalGradient.addColorStop(1, 'rgba(0,0,0,0)');

            for (let row = 0 ; row < rows; row++) {
                for (let col = 0 ; col < cols; col++) {
                    if (this.matrix[row][col] !== 1)  continue;

                    const left = this.x + col * CELL_SIZE;
                    const right = left + CELL_SIZE;

                    const top = this.y + row * CELL_SIZE;
                    const bottom = top + CELL_SIZE;

                    if (this.matrix[row + 1]?.[col] !== 1) {
                        ctx.wrap(() => {
                            ctx.translate(left, bottom);

                            ctx.fillStyle = verticalGradient;

                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(CELL_SIZE, 0);
                            ctx.lineTo(CELL_SIZE + shadowLength, shadowLength);
                            ctx.lineTo(shadowLength, shadowLength);
                            ctx.fill();
                        });
                    }

                    if (this.matrix[row][col + 1] !== 1) {
                        ctx.wrap(() => {
                            ctx.translate(right, top);

                            ctx.fillStyle = horizontalGradient;

                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(shadowLength, shadowLength);
                            ctx.lineTo(shadowLength, CELL_SIZE + shadowLength);
                            ctx.lineTo(0, CELL_SIZE);
                            ctx.fill();
                        });
                    }
                }
            }
        });

        ctx.drawImage(this.prerendered, this.x, this.y);
    }

    reposition(entity, radiusX, radiusY, previousX, previousY) {
        let remainingIterations = 2;
        while (remainingIterations-- > 0) {
            const { x, y } = entity;
            const leftX = entity.x - radiusX;
            const rightX = entity.x + radiusX;
            const topY = entity.y - radiusY;
            const bottomY = entity.y + radiusY;

            let top = this.cellAt(x, topY);
            let right = this.cellAt(rightX, y) === 1;
            let left = this.cellAt(leftX, y) === 1;
            let bottom = this.cellAt(x, bottomY);

            let topLeft = this.cellAt(leftX, topY) === 1;
            let topRight = this.cellAt(rightX, topY) === 1;
            let bottomLeft =  this.cellAt(leftX, bottomY) === 1;
            let bottomRight =  this.cellAt(rightX, bottomY) === 1;

            const directionY = Math.sign(y - previousY);

            const verticalCollisionCount = !!top + !!topLeft + !!topRight + !!bottom + !!bottomLeft + !!bottomRight;
            const horizontalCollisionCount = !!left + !!topLeft + !!bottomLeft + !!right + !!topRight + !!bottomRight;

            if (verticalCollisionCount + horizontalCollisionCount == 0) {
                break;
            }

            const resolveVertical = () => {
                if (top && top === 1) entity.y = ceilToNearest(topY, CELL_SIZE) + radiusY;
                if (bottom && (bottom === 1 || directionY > 0)) entity.y = floorToNearest(bottomY, CELL_SIZE) - radiusY;
            };

            const resolveHorizontal = () => {
                if (left) entity.x = ceilToNearest(leftX, CELL_SIZE) + radiusX;
                if (right) entity.x = floorToNearest(rightX, CELL_SIZE) - radiusX;
            };

            if (remainingIterations == 0) {
                resolveVertical();
                resolveHorizontal();
            } else if (verticalCollisionCount > 0) {
                resolveVertical();
            } else {
                resolveHorizontal();
            }
        }
    }

    cellAt(x, y) {
        if (!isBetween(this.x, x, this.x + this.matrix[0].length * CELL_SIZE)) return null;
        if (!isBetween(this.y, y, this.y + this.matrix.length * CELL_SIZE)) return null;

        return this.matrix[Math.floor((y - this.y) / CELL_SIZE)][Math.floor((x - this.x) / CELL_SIZE)] || 0;
    }
}
