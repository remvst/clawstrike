class Structure extends Entity {
    constructor(matrix) {
        super();
        this.categories.push('structure');
        this.matrix = matrix;
        this.width = matrix[0].length * CELL_SIZE;
        this.height = matrix.length * CELL_SIZE;
        this.raycaster = new Raycaster(this);
    }

    render() {
        const rows = this.matrix.length;
        const cols = this.matrix[0].length;

        this.prerendered = this.prerendered || createCanvas(this.width, this.height, (ctx) => {
            ctx.fillStyle = '#f00';
            ctx.fillRect(0, 0, this.width, this.height);

            // Background stripes
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            for (let x = 0 ; x < cols * CELL_SIZE; x += CELL_SIZE * 20) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x + CELL_SIZE * 10, 0);
                ctx.lineTo(x + CELL_SIZE * 10 - 200, rows * CELL_SIZE);
                ctx.lineTo(x - 200, rows * CELL_SIZE);
                ctx.fill();
            }

            // Cells
            ctx.fillStyle = '#000';
            ctx.wrap(() => {
                for (const row of this.matrix) {
                    ctx.wrap(() => {
                        for (const cell of row) {
                            if (cell) ctx.fillRect(0, 0, CELL_SIZE, cell === 1 ? CELL_SIZE : CELL_SIZE / 4);
                            ctx.translate(CELL_SIZE, 0);
                        }
                    });
                    ctx.translate(0, CELL_SIZE);
                }
            });

            ctx.strokeStyle = '#fff';
            ctx.globalAlpha = 0.1;
            ctx.lineWidth = 2;

            const shadowLength = CELL_SIZE * 2;

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

                    if (!this.matrix[row + 1]?.[col]) {
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

                    if (!this.matrix[row][col + 1]) {
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

            let top = this.collidingCellAt(x, topY);
            let right = this.collidingCellAt(rightX, y) === 1;
            let left = this.collidingCellAt(leftX, y) === 1;
            let bottom = this.collidingCellAt(x, bottomY);

            let topLeft = this.collidingCellAt(leftX, topY) === 1;
            let topRight = this.collidingCellAt(rightX, topY) === 1;
            let bottomLeft =  this.collidingCellAt(leftX, bottomY) === 1;
            let bottomRight =  this.collidingCellAt(rightX, bottomY) === 1;

            const directionY = Math.sign(y - previousY);
            if (directionY < 0) {
                // top = top === 1 ? top : 0;
                // topLeft = topLeft === 1 ? topLeft : 0;
                // topRight = topRight === 1 ? topRight : 0;
                // bottom = bottom === 1 ? bottom : 0;
                // bottomLeft = bottomLeft === 1 ? bottomLeft : 0;
                // bottomRight = bottomRight === 1 ? bottomRight : 0;
            }

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

    collidingCellAt(x, y) {
        const topStartY = floorToNearest(y, CELL_SIZE);
        const cell = this.cellAt(x, y);
        return cell;
        if (!cell) return 0;

        const cellBottomY = this.cellBottomY(x, y);
        return isBetween(topStartY, y, cellBottomY) ? cell : 0;
    }

    cellTopY(x, y) {
        const cell = this.cellAt(x, y);
        if (!cell) return Number.MAX_SAFE_INTEGER;
        return floorToNearest(y, CELL_SIZE);
    }

    cellBottomY(x, y) {
        const cell = this.cellAt(x, y);
        if (!cell) return Number.MIN_SAFE_INTEGER;
        const topStartY = floorToNearest(y, CELL_SIZE);
        return topStartY + CELL_SIZE;
        return topStartY + 2;
    }
}
