normalizeAngle = (angle) => {
    let normalized = angle;
    while (normalized < -PI) normalized += TWO_PI;
    while (normalized > PI) normalized -= TWO_PI;
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

roundToNearest = (x, precision) => {
    return round(x / precision) * precision;
}

floorToNearest = (x, precision) => {
    return floor(x / precision) * precision;
}

ceilToNearest = (x, precision) => {
    return ceil(x / precision) * precision;
}

interpolate = (a, b, t) => {
    return a + (b - a) * between(0, t, 1);
}

distance = (a, b) => {
    return pointDistance(a.x, a.y, b.x, b.y);
}

pointDistance = (x1, y1, x2, y2) => {
    return hypot(x1 - x2, y1 - y2);
}

angleBetween = (a, b) => {
    return atan2(b.y - a.y, b.x - a.x);
}

rnd = (min, max) => {
    return random() * (max - min) + min;
}

// Make Math global
const math = Math;
Object.getOwnPropertyNames(math).forEach(n => window[n] = window[n] || math[n]);

TWO_PI = PI * 2;
