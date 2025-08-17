class LevelEditor extends Entity {
    constructor() {
        super();

        can.style.cursor = 'default';

        this.cursorPosition = {x: 0, y: 0};

        onmousemove = (e) => {
            getEventPosition(e, can, this.cursorPosition);

            const camera = firstItem(this.world.category('camera'));
            this.cursorPosition.x += (camera.x - CANVAS_WIDTH / 2) / camera.zoom;
            this.cursorPosition.y += (camera.y - CANVAS_HEIGHT / 2) / camera.zoom;
        };

        onclick = () => {
            for (const structure of this.world.category('structure')) {
                const row = floor(this.cursorPosition.y / CELL_SIZE);
                const col = floor(this.cursorPosition.x / CELL_SIZE);

                structure.matrix[row][col] = (structure.matrix[row][col] + 1) % 3;
                structure.prerendered = null;
            }
        };
    }

    render() {
        ctx.globalAlpha = 0.2;

        const camera = firstItem(this.world.category('camera'));

        const minX = floorToNearest(camera.x - CANVAS_WIDTH / 2, CELL_SIZE);
        const maxX = ceilToNearest(minX + CANVAS_WIDTH,CELL_SIZE) + CELL_SIZE;

        const minY = floorToNearest(camera.y - CANVAS_HEIGHT / 2, CELL_SIZE);
        const maxY = ceilToNearest(minY + CANVAS_HEIGHT,CELL_SIZE) + CELL_SIZE;

        ctx.fillStyle = '#fff';
        for (let x = minX ; x <= maxX ; x += CELL_SIZE) {
            ctx.fillRect(x, minY, 2, maxY - minY);
        }

        for (let y = minY ; y <= maxY ; y += CELL_SIZE) {
            ctx.fillRect(minX, y, maxX - minX, 2);
        }

        ctx.wrap(() => {
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.4;
            ctx.fillRect(
                floorToNearest(this.cursorPosition.x, CELL_SIZE),
                floorToNearest(this.cursorPosition.y, CELL_SIZE),
                CELL_SIZE,
                CELL_SIZE,
            );
        });
    }
}
