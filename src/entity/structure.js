BACKGROUND_STRIPES = (() => {
    const can = createCanvas(CELL_SIZE * 15, CELL_SIZE * 30, (ctx, can) => {
        ctx.fillStyle = '#000';

        function dewIt() {
            for (let y = 0 ; y <= can.height; y ++) {
                const relY = y / can.height;
                ctx.lineTo(
                    interpolate(- 200, can.width - 200, relY) + sin(relY * TWO_PI * 30) * 8,
                    interpolate(0, can.height, relY),
                );
            }
        }

        for (let i = -1 ; i <= 1; i++) {
            ctx.wrap(() => {
                ctx.translate(can.width * i, 0);
                ctx.beginPath();
                dewIt();
                ctx.translate(can.width, can.height);
                ctx.scale(-1, -1);
                dewIt();
                ctx.fill();
            });
        }
    });

    const patt = can.getContext('2d').createPattern(can, 'repeat');
    patt.width = can.width;
    patt.height = can.height;
    return patt;
})();

class Structure extends Entity {

    type = 'structure';
    categories = ['structure'];
    color = '#f00';
    raycaster = new Raycaster(this);

    z = Z_STRUCTURE;

    cycle(elapsed) {
        super.cycle(elapsed);
        this.width = this.matrix[0].length * CELL_SIZE;
        this.height = this.matrix.length * CELL_SIZE;
    }

    renderBackground() {
        this.width = this.matrix[0].length * CELL_SIZE;
        this.height = this.matrix.length * CELL_SIZE;

        const camera = firstItem(this.world.category('camera'));

        const minX = max(this.x, camera.actual.x - CANVAS_WIDTH / 2) + CELL_SIZE;
        const minY = max(this.y, camera.actual.y - CANVAS_HEIGHT / 2) + CELL_SIZE;

        const maxX = min(this.x + this.width, camera.actual.x + CANVAS_WIDTH / 2) - CELL_SIZE;
        const maxY = min(this.y + this.height, camera.actual.y + CANVAS_HEIGHT / 2) - CELL_SIZE;

        ctx.fillStyle = this.color;
        ctx.fillRect(minX, minY, maxX - minX, maxY - minY);

        ctx.globalAlpha = 0.05;
        ctx.fillStyle = BACKGROUND_STRIPES;

        const offsetY = this.age * 30;
        const offsetX = offsetY * BACKGROUND_STRIPES.width / BACKGROUND_STRIPES.height;

        ctx.translate(offsetX, offsetY);
        ctx.fillRect(minX - offsetX, minY - offsetY, maxX - minX, maxY - minY);
    }

    render() {
        if (!this.matrix) return;

        const rows = this.matrix.length;
        const cols = this.matrix[0].length;

        this.prerendered = this.prerendered || createCanvas(this.width, this.height, (ctx, can) => {
            // Cells
            ctx.wrap(() => {
                ctx.fillStyle = '#000';

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

        ctx.fillStyle = '#000';
        ctx.fillRect(this.x, this.y, -CANVAS_WIDTH / 2, this.height);
        ctx.fillRect(this.x + this.width, this.y, CANVAS_WIDTH  / 2, this.height);
        ctx.fillRect(this.x - CANVAS_WIDTH / 2, this.y, CANVAS_WIDTH + this.width, -CANVAS_HEIGHT / 2);
        ctx.fillRect(this.x - CANVAS_WIDTH / 2, this.y + this.height, CANVAS_WIDTH + this.width, this.height);
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

            const directionY = sign(y - previousY);

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
        const row = floor((y - this.y) / CELL_SIZE);
        const col = floor((x - this.x) / CELL_SIZE);
        if (!isBetween(0, row, this.matrix.length)) return null;
        if (!isBetween(0, col, this.matrix[0].length)) return null

        return this.matrix[row]?.[col] || 0;
    }
}
