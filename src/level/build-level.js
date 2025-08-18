buildWorld = (
    chunkRows = 2,
    chunkCols = 3,
) => {
    const requiredConnections = createMatrix(chunkRows, chunkCols, () => null);

    function explore(matrix, row, col, fromDirection = null) {
        const rows = matrix.length;
        const cols = matrix[1].length;

        if (row < 0) return;
        if (col < 0) return;
        if (row >= rows) return;
        if (col >= cols) return;

        if (matrix[row][col]) return;

        matrix[row][col] = [];

        if (fromDirection) {
            matrix[row][col].push(oppositeConnection(fromDirection));
        }

        const explorationOrder = [
            CONNECTION_LEFT,
            CONNECTION_RIGHT,
            CONNECTION_UP,
            CONNECTION_DOWN,
        ];
        shuffle(explorationOrder);

        for (const direction of explorationOrder) {
            let exploreRow = row;
            let exploreCol = col;
            switch (direction) {
            case CONNECTION_DOWN: exploreRow++; break;
            case CONNECTION_UP: exploreRow--; break;
            case CONNECTION_LEFT: exploreCol--; break;
            case CONNECTION_RIGHT: exploreCol++; break;
            }
            if (explore(matrix, exploreRow, exploreCol, direction)) {
                matrix[row][col].push(direction);
            }
        }

        return true;
    }

    explore(requiredConnections, 1, 1, null);
    console.log(requiredConnections);

    const chunkMap = requiredConnections.map((row, rowIndex) => {
        return row.map((requiredConnections, colIndex) => {
            if (!requiredConnections) return null;

            const compatibleChunks = ALL_CHUNKS.filter((chunk) => {
                for (const connection of requiredConnections) {
                    if (!chunk.connections.includes(connection)) return false;
                }
                return true;
            });
            return compatibleChunks[0]; // TODO random pick
        })
    });

    let inflated = createMatrix(chunkMap.length * 10, chunkMap[0].length * 10);

    for (let row = 0 ; row < chunkMap.length ; row++) {
        for (let col = 0 ; col < chunkMap[row].length ; col++) {
            const chunk = chunkMap[row][col];
            if (!chunk) continue;
            inflated = applyMatrix(inflated, chunk.matrix, row * 10, col * 10);
        }
    }

    // Remove the 3s
    inflated = inflated.map(row => row.map(cell => cell <= 2 ? cell : 0));

    // Add a border
    inflated = applyMatrix(
        createMatrix(inflated.length + 2, inflated[0].length + 2, () => 1),
        inflated,
        1,
        1,
    );

    return inflated;
}
