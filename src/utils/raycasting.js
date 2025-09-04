class Raycaster {
    constructor(structure) {
        this.structure = structure;
    }

    castRay(x, y, angle, maxDistance) {
        const castHorizontal = this.castAgainstHorizontal(x, y, angle, maxDistance);
        const castVertical = this.castAgainstVertical(x, y, angle, maxDistance);

        let impact;
        if (!castHorizontal) {
            impact = castVertical;
        } else if(!castVertical) {
            impact = castHorizontal;
        } else {
            impact = pointDistance(x, y, castHorizontal.x, castHorizontal.y) < pointDistance(x, y, castVertical.x, castVertical.y)
                ? castHorizontal
                : castVertical;
        }

        if (pointDistance(x, y, impact.x, impact.y) > maxDistance) {
            impact = {
                'x': x + cos(angle) * maxDistance,
                'y': y + sin(angle) * maxDistance
            };
        }

        return impact;
    }

    castAgainstHorizontal(startX, startY, angle, maxDistance) {
        const pointingDown = sin(angle) > 0;

        const y = ~~(startY / CELL_SIZE) * CELL_SIZE + (pointingDown ? CELL_SIZE : -0.0001);
        const x = startX + (y - startY) / tan(angle);

        const yStep = pointingDown ? CELL_SIZE : -CELL_SIZE;
        const xStep = yStep / tan(angle);

        return this.doCast(x, y, xStep, yStep, maxDistance);
    }

    castAgainstVertical(startX, startY, angle, maxDistance) {
        const pointingRight = cos(angle) > 0;

        const x = ~~(startX / CELL_SIZE) * CELL_SIZE + (pointingRight ? CELL_SIZE : -0.0001);
        const y = startY + (x - startX) * tan(angle);

        const xStep = pointingRight ? CELL_SIZE : -CELL_SIZE;
        const yStep = xStep * tan(angle);

        return this.doCast(x, y, xStep, yStep, maxDistance);
    }

    doCast(startX, startY, xStep, yStep, maxDistance){
        let x = startX,
            y = startY;

        while (pointDistance(x, y, startX, startY) < maxDistance) {
            if (DEBUG && G) {
                G.castIterations++;
            }
            if (this.structure.cellAt(x, y)) {
                // Got a block!
                return { x, y };
            } else if(this.isOut(x, y)) {
                // Out of bounds
                break;
            } else {
                x += xStep;
                y += yStep;
            }
        }

        return { x, y };
    }

    isOut(x, y) {
        return !between(0, x, this.structure.width) ||
            !between(0, y, this.structure.height);
    }
}
