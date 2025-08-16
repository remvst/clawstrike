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

        ctx.fillStyle = '#f00';
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for (let x = 0 ; x < cols * CELL_SIZE; x += CELL_SIZE * 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + CELL_SIZE * 10, 0);
            ctx.lineTo(x + CELL_SIZE * 10 - 200, rows * CELL_SIZE);
            ctx.lineTo(x - 200, rows * CELL_SIZE);
            ctx.fill();
            // break;
        }

        ctx.fillStyle = '#000';
        ctx.save();
        for (const row of this.matrix) {
            ctx.save();
            for (const cell of row) {
                if (cell) ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE);
                ctx.translate(CELL_SIZE, 0);
            }
            ctx.restore();
            ctx.translate(0, CELL_SIZE);
        }
        ctx.restore();
    }

    reposition(entity, radiusX, radiusY, lastPass = false) {
        let remainingIterations = 2;
        while (remainingIterations-- > 0) {
            const { x, y } = entity;
            const leftX = entity.x - radiusX;
            const rightX = entity.x + radiusX;
            const topY = entity.y - radiusY;
            const bottomY = entity.y + radiusY;

            const top = this.cellAt(x, topY);
            const right = this.cellAt(rightX, y);
            const left = this.cellAt(leftX, y);
            const bottom = this.cellAt(x, bottomY);

            const topLeft = this.cellAt(leftX, topY);
            const topRight = this.cellAt(rightX, topY);
            const bottomLeft = this.cellAt(leftX, bottomY);
            const bottomRight = this.cellAt(rightX, bottomY);

            const verticalCollisionCount = !!top + !!topLeft + !!topRight + !!bottom + !!bottomLeft + !!bottomRight;
            const horizontalCollisionCount = !!left + !!topLeft + !!bottomLeft + !!right + !!topRight + !!bottomRight;

            if (verticalCollisionCount + horizontalCollisionCount == 0) {
                break;
            }

            const resolveVertical = () => {
                // console.log('vertical')
                if (top) entity.y = ceilToNearest(topY, CELL_SIZE) + radiusY;
                if (bottom) entity.y = floorToNearest(bottomY, CELL_SIZE) - radiusY;
            };

            const resolveHorizontal = () => {
                // console.log('horizontal')
                if (left) entity.x = ceilToNearest(leftX, CELL_SIZE) + radiusX;
                if (right) entity.x = floorToNearest(rightX, CELL_SIZE) - radiusX;
            };

            // console.log('solve', { remainingIterations, verticalCollisionCount, horizontalCollisionCount });

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
