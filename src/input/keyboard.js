downKeys = {};

ALT_KEYS = {
    // WASD
    65: 37,
    68: 39,
    87: 38,
    83: 40,

    // ZQSD
    90: 38,
    81: 37,
};

document.onkeydown = (evt) => {
    inputMode = INPUT_MODE_KEYBOARD;
    downKeys[ALT_KEYS[evt.keyCode] || evt.keyCode] = true;
};
document.onkeyup = (evt) => downKeys[ALT_KEYS[evt.keyCode] || evt.keyCode] = false;
onblur = () => downKeys = {};
