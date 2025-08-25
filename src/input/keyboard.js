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

document.onkeydown = (event) => downKeys[alternatives[event.keyCode] || event.keyCode] = true;
document.onkeyup = (event) => downKeys[alternatives[event.keyCode] || event.keyCode] = false;
onblur = () => downKeys = {};
