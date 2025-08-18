class LevelEditorScreen extends GameplayScreen {
    constructor() {
        super();

        can.style.cursor = 'default';

        this.cursorPosition = {x: 0, y: 0};

        const cameraTarget = new CameraTarget();
        this.world.addEntity(cameraTarget);

        const camera = firstItem(this.world.category('camera'));
        camera.target = cameraTarget;

        this.world.editorMode = true;

        this.editMode = 'structure';

        onmousedown = (e) => {
            for (const entity of this.world.entities) {
                if (entity.categories.includes('structure')) continue;
                if (entity.categories.includes('camera')) continue;

                if (entity.hitbox.contains(this.cursorPosition) && this.editMode === 'entity') {
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

            if (this.editMode === 'entity') {
                if (this.dragged) {
                    this.dragged.x = roundToNearest(this.cursorPosition.x, CELL_SIZE / 2);
                    this.dragged.y = roundToNearest(this.cursorPosition.y, CELL_SIZE / 2);
                }
            }
        };

        onclick = () => {
            if (this.editMode !== 'structure') return;

            for (const structure of this.world.category('structure')) {
                const row = floor(this.cursorPosition.y / CELL_SIZE);
                const col = floor(this.cursorPosition.x / CELL_SIZE);

                let { matrix } = structure;

                let prefixRows = 0;
                if (row < 0) {
                    prefixRows = -row;
                    row = 0;
                }

                let prefixCols = 0;
                if (col < 0) {
                    prefixCols = -col;
                    col = 0;
                }

                let suffixRows = 0;
                if (row > matrix.length - 1) {
                    suffixRows = row - (matrix.length - 1);
                }

                let suffixCols = 0;
                if (col > matrix[0].length - 1) {
                    suffixCols = col - (matrix[0].length - 1);
                }

                matrix = applyMatrix(
                    createMatrix(
                        matrix.length + prefixRows + suffixRows,
                        matrix[0].length + prefixCols + suffixCols,
                        () => 1,
                    ),
                    matrix,
                    prefixRows,
                    prefixCols,
                );

                matrix[row][col] = (matrix[row][col] + 1) % 3;

                structure.matrix = matrix;
                structure.width = matrix[0].length * CELL_SIZE;
                structure.height = matrix.length * CELL_SIZE;
                structure.prerendered = null;

                for (const otherEntity of this.world.entities) {
                    if (otherEntity === structure) continue;
                    otherEntity.x += prefixCols * CELL_SIZE;
                    otherEntity.y += prefixRows * CELL_SIZE;
                }
            }
        };

        this.dragged = null;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (downKeys[49]) this.editMode = 'structure';
        if (downKeys[50]) this.editMode = 'entity';
    }

    render() {
        super.render();

        ctx.wrap(() => {
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

            // Grid
            ctx.wrap(() => {
                ctx.fillStyle = '#888';
                for (let x = minX ; x <= maxX ; x += CELL_SIZE) {
                    ctx.fillRect(x, minY, 0.5, maxY - minY);
                }

                for (let y = minY ; y <= maxY ; y += CELL_SIZE) {
                    ctx.fillRect(minX, y, maxX - minX, 0.5);
                }
            });

            // Cursor
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
        });

        // HUD
        ctx.wrap(() => {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 40px Impact';
            ctx.shadowColor = '#000';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillText('Edit mode: ' + this.editMode, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
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
