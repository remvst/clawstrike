createMatrix = (rows, cols, value = () => 0) => {
    const res = [];
    for (let row = 0 ; row < rows ; row++) {
        res.push(Array(cols).fill(0).map(value));
    }
    return res;
}

applyMatrix = (target, source, atRow, atCol) => {
    const targetRows = target.length;
    const targetCols = target[0].length;

    const sourceRows = source.length;
    const sourceCols = source[0].length;

    const finalRows = Math.max(targetRows, atRow + sourceRows);
    const finalCols = Math.max(targetCols, atCol + sourceCols);

    const res = createMatrix(finalRows, finalCols);

    for (let row = 0 ; row < target.length ; row++) {
        for (let col = 0 ; col < target[row].length ; col++) {
            res[row][col] = target[row][col];
        }
    }

    for (let row = 0 ; row < source.length ; row++) {
        for (let col = 0 ; col < source[row].length ; col++) {
            res[row + atRow][col + atCol] = source[row][col];
        }
    }

    return res;
}
