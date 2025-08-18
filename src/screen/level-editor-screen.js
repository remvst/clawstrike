class LevelEditorScreen extends GameplayScreen {
    constructor() {
        super();

        can.style.cursor = 'default';

        this.cursorPosition = {x: 0, y: 0};

        const cameraTarget = new CameraTarget();
        this.world.addEntity(cameraTarget);

        const camera = firstItem(this.world.category('camera'));
        camera.target = cameraTarget;

        onmousedown = (e) => {
            for (const entity of this.world.entities) {
                if (entity.categories.includes('structure')) continue;
                if (entity.categories.includes('camera')) continue;

                if (entity.hitbox.contains(this.cursorPosition)) {
                    this.dragged = entity;
                }
            }
        };

        onmouseup = (e) => {
            this.dragged = null;
        };

        onmousemove = (e) => {
            const out = {};
            getEventPosition(e, can, out);

            const camera = firstItem(this.world.category('camera'));

            const dXFromCenter = out.x - CANVAS_WIDTH / 2;
            const dYFromCenter = out.y - CANVAS_HEIGHT / 2;

            this.cursorPosition.x = camera.x + dXFromCenter / camera.zoom;
            this.cursorPosition.y = camera.y + dYFromCenter / camera.zoom;

            if (this.dragged) {
                this.dragged.x = this.cursorPosition.x;
                this.dragged.y = this.cursorPosition.y;
            }
        };

        onclick = () => {
            for (const structure of this.world.category('structure')) {
                const row = floor(this.cursorPosition.y / CELL_SIZE);
                const col = floor(this.cursorPosition.x / CELL_SIZE);

                structure.matrix[row][col] = (structure.matrix[row][col] + 1) % 3;
                structure.prerendered = null;
            }
        };

        this.dragged = null;
    }

    render() {
        super.render();

        const camera = firstItem(this.world.category('camera'));
        ctx.scale(camera.appliedZoom, camera.appliedZoom);
        ctx.translate(
            CANVAS_WIDTH / 2 / camera.zoom - camera.x,
            CANVAS_HEIGHT / 2 / camera.zoom - camera.y,
        );

        const minX = floorToNearest(camera.x - CANVAS_WIDTH / 2, CELL_SIZE);
        const maxX = ceilToNearest(minX + CANVAS_WIDTH,CELL_SIZE) + CELL_SIZE;

        const minY = floorToNearest(camera.y - CANVAS_HEIGHT / 2, CELL_SIZE);
        const maxY = ceilToNearest(minY + CANVAS_HEIGHT,CELL_SIZE) + CELL_SIZE;

        ctx.fillStyle = '#888';
        for (let x = minX ; x <= maxX ; x += CELL_SIZE) {
            ctx.fillRect(x, minY, 0.5, maxY - minY);
        }

        for (let y = minY ; y <= maxY ; y += CELL_SIZE) {
            ctx.fillRect(minX, y, maxX - minX, 0.5);
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

class CameraTarget extends Entity {
    cycle(elapsed) {
        super.cycle(elapsed);

        let x = 0, y = 0;
        if (downKeys[37]) x = -1;
        if (downKeys[39]) x = 1;
        if (downKeys[38]) y = -1;
        if (downKeys[40]) y = 1;

        this.x += x * elapsed * 400;
        this.y += y * elapsed * 400;
    }
}
