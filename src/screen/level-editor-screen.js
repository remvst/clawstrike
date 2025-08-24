class LevelEditorScreen extends WorldScreen {
    constructor(serializedWorld) {
        super(serializedWorld);

        can.style.cursor = 'default';

        this.cursorPosition = {x: 0, y: 0};

        const cameraTarget = new CameraTarget();
        this.world.addEntity(cameraTarget);

        const camera = firstItem(this.world.category('camera'));
        camera.target = cameraTarget;

        this.world.editorMode = true;

        this.editMode = 'entity';

        this.contextMenu = document.createElement('div');
        this.contextMenu.classList.add('context-menu');
        document.body.appendChild(this.contextMenu);
        document.body.addEventListener('click', () => this.contextMenu.style.display = 'none', false);
        this.contextMenu.addEventListener('click', (e) => e.stopPropagation(), false);

        const styleTag = document.createElement('style');
        styleTag.innerHTML = `
        .context-menu {
            position: absolute;
            background-color: #222;
            border: 1px solid white;
            min-width: 200px;
            max-width: 300px;
            display: none;
            width: auto;
            height: auto;
        }

        .context-menu > * {
            display: block;
            border: none;
            border-bottom: 1px solid #222;
            background-color: #000;
            color: white;
            outline: none;
        }

        .context-menu > button {
            text-align: left;
            padding: 12px;
            cursor: pointer;
        }

        .context-menu > button:hover {
            background-color: #444;
        }

        .context-menu .color-swatch-set {
            display: flex;
            flex-direction: row;
            justify-content: start;
            gap: 12px;
            padding: 12px;
            box-sizing: border-box;
            flex-wrap: wrap;
        }

        .context-menu .color-swatch {
            width: 20px;
            height: 20px;
            border: 1px solid #444;
            display: inline-block;
            cursor: pointer;
        }

        .context-menu .color-swatch:hover {
            border-color: #fff;
        }
        `;
        document.head.appendChild(styleTag);

        oncontextmenu = (e) => {
            e.preventDefault();
            return false;
        }

        can.onmousedown = (e) => {
            this.selected = null;

            if (this.editMode === 'entity') {
                for (const entity of this.world.entities) {
                    if (entity.categories.includes('structure')) continue;
                    if (entity.categories.includes('camera')) continue;

                    if (entity.hitbox.contains(this.cursorPosition) && this.editMode === 'entity') {
                        this.selected = entity;
                    }
                }
            } else if (this.editMode === 'structure') {
                for (const structure of this.world.category('structure')) {
                    const cell = structure.cellAt(this.cursorPosition.x, this.cursorPosition.y);
                    if (cell || !isBetween(0, this.cursorPosition.x, structure.width) || !isBetween(0, this.cursorPosition.y, structure.height)) {
                        // Clicked on a filled cell, let's start deleting
                        this.currentMatrixValue = 0;
                    } else {
                        // Clicked on an empty cell, add based on modifier keys
                        if (downKeys[224] || downKeys[17]) this.currentMatrixValue = 2;
                        else this.currentMatrixValue = 1;
                    }
                }

                this.applyStructureChange();
            }

            this.mouseIsDown = true;

            if (e.which === 3) {
                this.contextMenu.style.left = e.pageX + 'px';
                this.contextMenu.style.top = e.pageY + 'px';
                this.contextMenu.style.display = 'block';

                this.contextMenu.innerHTML = '';
                for (const contextMenuButton of this.contextualActions()) {
                    this.contextMenu.appendChild(contextMenuButton);
                }

                this.mouseIsDown = false;
            }
        };

        can.onmouseup = (e) => {
            this.mouseIsDown = null;
        };

        can.onmousemove = (e) => {
            const out = {};
            getEventPosition(e, can, out);

            const camera = firstItem(this.world.category('camera'));

            const dXFromCenter = out.x - CANVAS_WIDTH / 2;
            const dYFromCenter = out.y - CANVAS_HEIGHT / 2;

            this.cursorPosition.x = camera.x + dXFromCenter / camera.zoom;
            this.cursorPosition.y = camera.y + dYFromCenter / camera.zoom;

            if (this.editMode === 'entity') {
                if (this.selected && this.mouseIsDown) {
                    this.selected.x = roundToNearest(this.cursorPosition.x, CELL_SIZE / 2);
                    this.selected.y = roundToNearest(this.cursorPosition.y, CELL_SIZE / 2);
                }
            } else if (this.editMode === 'structure') {
                if (this.mouseIsDown) {
                    this.applyStructureChange();
                }
            }
        };

        can.onclick = () => {
            if (this.editMode !== 'structure') return;
            if (this.contextMenu.style.display === 'block') return;
            // this.applyStructureChange();
        };

        this.selected = null;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (downKeys[49]) this.editMode = 'entity';
        if (downKeys[50]) this.editMode = 'structure';
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
            if (this.editMode === 'structure') ctx.wrap(() => {
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.4;
                ctx.fillRect(
                    floorToNearest(this.cursorPosition.x, CELL_SIZE),
                    floorToNearest(this.cursorPosition.y, CELL_SIZE),
                    CELL_SIZE,
                    CELL_SIZE,
                );
            });

            // Selection
            if (this.editMode === 'entity' && this.selected) {
                ctx.wrap(() => {
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 3;

                    ctx.translate(this.selected.hitbox.x, this.selected.hitbox.y);
                    ctx.strokeRect(
                        -this.selected.hitbox.width / 2,
                        -this.selected.hitbox.height / 2,
                        this.selected.hitbox.width,
                        this.selected.hitbox.height,
                    );
                });
            }
        });

        // HUD
        ctx.wrap(() => {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 20px Impact';
            ctx.shadowColor = '#000';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillText('Edit mode: ' + this.editMode, CANVAS_WIDTH / 2, CANVAS_HEIGHT * 4 / 5);
        });
    }

    applyStructureChange() {
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

            matrix[row][col] = this.currentMatrixValue;

            structure.matrix = matrix;
            structure.width = matrix[0].length * CELL_SIZE;
            structure.height = matrix.length * CELL_SIZE;
            structure.prerendered = null;

            for (const otherEntity of this.world.entities) {
                if (otherEntity === structure) continue;
                otherEntity.x += prefixCols * CELL_SIZE;
                otherEntity.y += prefixRows * CELL_SIZE;
            }

            this.cursorPosition.x += prefixCols * CELL_SIZE;
            this.cursorPosition.y += prefixRows * CELL_SIZE;
        }

        this.optimize();
    }

    insertEntity(entity) {
        entity.x = roundToNearest(this.cursorPosition.x, CELL_SIZE / 2);
        entity.y = roundToNearest(this.cursorPosition.y, CELL_SIZE / 2);
        this.selected = entity;
        this.world.addEntity(entity);

        this.editMode = 'entity';
    }

    contextMenuButton(label, action) {
        const contextMenuButton = document.createElement('button');
        contextMenuButton.innerText = label;
        contextMenuButton.addEventListener('click', () => {
            this.contextMenu.style.display = 'none';
            action();
        }, false);
        return contextMenuButton;
    }

    colorSwatch(color) {
        const swatch = document.createElement('div');
        swatch.classList.add('color-swatch');
        swatch.style.backgroundColor = color;
        swatch.addEventListener('click', () => {
            this.contextMenu.style.display = 'none';
            this.setBackgroundColor(color);
        }, false);
        return swatch;
    }

    contextMenuSwatchSet(children) {
        const buttonSet = document.createElement('div');
        buttonSet.classList.add('color-swatch-set');
        children.forEach(child => buttonSet.appendChild(child));
        return buttonSet;
    }

    contextualActions() {
        const actions = [
            this.contextMenuButton('Add Cat', () => this.insertEntity(new Cat())),
            this.contextMenuButton('Add Human', () => this.insertEntity(new Human())),
            this.contextMenuButton('Add Spike', () => this.insertEntity(new Spikes())),
            this.contextMenuButton('Add Label', () => this.insertEntity(new Label('Hello world!'))),
            this.contextMenuSwatchSet([
                this.colorSwatch('#f44'),
                this.colorSwatch('#0c0'),
                this.colorSwatch('#08f'),
                this.colorSwatch('#f80'),
                this.colorSwatch('#f08'),
                this.colorSwatch('#b4f'),
                this.colorSwatch('#4cb'),
            ]),
        ];

        if (this.selected) {
            actions.push(
                this.contextMenuButton('Delete', () => {
                    this.selected?.world?.removeEntity(this.selected);
                    this.selected = null;
                }),
            );

            if (this.selected instanceof Spikes) {
                actions.push(
                    this.contextMenuButton('Set angle', () => {
                        const angle = parseInt(prompt('Angle? (in degrees)', this.selected.angle * 180 / Math.PI));
                        const adjusted = roundToNearest(angle, 90) || 0;
                        this.selected.angle = adjusted * Math.PI / 180;
                    }),
                );
                actions.push(
                    this.contextMenuButton('Set length', () => {
                        const length = parseInt(prompt('Length?', this.selected.length));
                        this.selected.length = roundToNearest(length, CELL_SIZE) || this.selected.length;
                    }),
                );
            }

            if (this.selected instanceof Label) {
                actions.push(
                    this.contextMenuButton('Set text', () => {
                        this.selected.text = prompt('Text?', this.selected.text) || this.selected.text;
                    }),
                );
            }
        }

        actions.push(...[
            this.contextMenuButton('Load', () => this.load()),
            this.contextMenuButton('Save', () => this.save()),
            this.contextMenuButton('Test', () => this.test()),
        ]);

        return actions;
    }

    setBackgroundColor(color) {
        for (const structure of this.world.category('structure')) {
            structure.color = color;
            structure.prerendered = null;
        }
    }

    deleteSelection() {
        this.selected?.world?.removeEntity(this.selected);
        this.selected = null;
    }

    save() {
        const serialized = serializeWorld(this.world);

        navigator.clipboard.writeText(JSON.stringify(serialized));
        console.log(JSON.stringify(serialized));
    }

    load() {
        const serialized = prompt('Paste the serialized world here:');
        if (!serialized) return;

        const json = JSON.parse(serialized);
        G.screens.pop();
        G.screens.push(new LevelEditorScreen(json));
    }

    test() {
        const serialized = serializeWorld(this.world);
        G.screens.push(new TestScreen(serialized));
    }

    optimize() {
        for (const structure of this.world.category('structure')) {
            const { matrix } = structure;

            const rows = matrix.length;
            const cols = matrix[0].length;

            let firstRow = Number.MAX_SAFE_INTEGER;
            let firstCol = Number.MAX_SAFE_INTEGER;

            let lastRow = Number.MIN_SAFE_INTEGER;
            let lastCol = Number.MIN_SAFE_INTEGER;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const cell = matrix[row][col];
                    if (cell) continue;

                    firstRow = min(firstRow, row);
                    firstCol = min(firstCol, col);

                    lastRow = max(lastRow, row);
                    lastCol = max(lastCol, col);
                }
            }

            const packedRows = lastRow - firstRow + 1;
            const packedCols = lastCol - firstCol + 1;

            let shiftRows = -firstRow;
            let shiftCols = -firstCol;

            const packed = applyMatrix(
                createMatrix(packedRows, packedCols, () => 1),
                matrix,
                -firstRow,
                -firstCol,
            );

            const paddedRows = packedRows + 2;
            const paddedCols = packedCols + 2;

            let padded = createMatrix(paddedRows, paddedCols, () => 1);
            padded = applyMatrix(padded, packed, 1, 1);

            shiftRows += 1;
            shiftCols += 1;

            structure.matrix = padded;
            structure.prerendered = null;

            for (const entity of this.world.entities) {
                if (entity === structure) continue;
                entity.x += (shiftCols) * CELL_SIZE;
                entity.y += (shiftRows) * CELL_SIZE;
            }
        }
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

class TestScreen extends GameplayScreen {
    cycle(elapsed) {
        super.cycle(elapsed);

        if (downKeys[27]) {
            G.screens.pop();
        }
    }

    render() {
        ctx.wrap(() => super.render());

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 20px Impact';
        ctx.shadowColor = '#000';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText('[ESC] to go back to editor'.toUpperCase(), CANVAS_WIDTH / 2, CANVAS_HEIGHT * 4 / 5);
    }
}
