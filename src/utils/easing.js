easeOutExpo = (x) => {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

easeOutCubic = (x) => {
    return 1 - Math.pow(1 - x, 3);
}

easeOutQuad = (x) => {
    return 1 - (1 - x) * (1 - x);
}

easeInQuad = (x) => {
    return x * x;
}

easeOutSine = (x) => {
  return Math.sin((x * Math.PI) / 2);
}

linear = (x) => {
  return x;
}
