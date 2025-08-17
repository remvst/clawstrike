let downKeys = {};

const alternatives = {
    // WASD
    65: 37,
    68: 39,
    87: 38,
    83: 40,

    // ZQSD
    90: 38,
    81: 37,
};

document.addEventListener('keydown', (event) => {
    downKeys[alternatives[event.keyCode] || event.keyCode] = true;
});

document.addEventListener('keyup', (event) => {
    downKeys[alternatives[event.keyCode] || event.keyCode] = false;
});
