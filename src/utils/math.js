normalizeAngle = (angle) => {
    let normalized = angle;
    while (normalized < -Math.PI) normalized += Math.PI * 2;
    while (normalized > Math.PI) normalized -= Math.PI * 2;
    return normalized;
}

between = (a, b, c) => {
    if (b < a) return a;
    if (b > c) return c;
    return b;
}

isBetween = (a, b, c) => {
    return (a <= b && b <= c) || (a >= b && b >= c);
}

floorToNearest = (x, precision) => {
    return Math.floor(x / precision) * precision;
}

ceilToNearest = (x, precision) => {
    return Math.ceil(x / precision) * precision;
}

interpolate = (a, b, t) => {
    return a + (b - a) * between(0, t, 1);
}
