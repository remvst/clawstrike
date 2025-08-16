let downKeys = {};

document.addEventListener('keydown', (event) => {
    downKeys[event.keyCode] = true;
});

document.addEventListener('keyup', (event) => {
    downKeys[event.keyCode] = false;
});
