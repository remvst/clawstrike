createMatrix = (rows, cols, value = () => 0) => {
    const res = [];
    for (let row = 0 ; row < rows ; row++) {
        res.push(Array(cols).fill(0).map(value));
    }
    return res;
}

applyMatrix = (target, source, atRow, atCol) => {
    const rows = target.length;
    const cols = target[0].length;

    const res = createMatrix(rows, cols);

    for (let row = 0 ; row < rows ; row++) {
        for (let col = 0 ; col < cols ; col++) {
            res[row][col] = target[row][col];
        }
    }

    for (let row = 0 ; row < source.length ; row++) {
        for (let col = 0 ; col < source[row].length ; col++) {
            const finalRow = row + atRow;
            const finalCol = col + atCol;

            if (
                !isBetween(0, finalRow, rows - 1) ||
                !isBetween(0, finalCol, cols - 1)
            ) {
                continue;
            }

            res[finalRow][finalCol] = source[row][col];
        }
    }

    return res;
}
