let TOUCH_DOWN;

ontouchstart = (evt) => {
    inputMode = INPUT_MODE_TOUCH;
    evt.preventDefault();
    updateTouches(evt.touches);
};

ontouchmove = (evt) => {
    evt.preventDefault();
    updateTouches(evt.touches);
};

ontouchend = (evt) => {
    evt.preventDefault();
    updateTouches(evt.touches);
};

updateTouches = (touches) => {
    downKeys = {};

    const out = {};
    for (const touch of touches) {
        getEventPosition(touch, can, out);

        const relX = out.x / can.width;
        downKeys[37] = downKeys[37] || isBetween(0, relX, 0.25);
        downKeys[39] = downKeys[39] || isBetween(0.25, relX, 0.5);
        downKeys[40] = downKeys[40] || isBetween(0.5, relX, 0.75);
        downKeys[38] = downKeys[38] || isBetween(0.75, relX, 1) && out.y > can.height - 300;
        downKeys[32] = downKeys[32] || isBetween(0.75, relX, 1) && out.y < can.height - 300;
    }

    TOUCH_DOWN = touches.length > 0;
};

getEventPosition = (evt, can, out) => {
    if (!can) return;
    const canvasRect = can.getBoundingClientRect();
    out.x = (evt.pageX - canvasRect.nomangle(left)) / canvasRect.width * can.width;
    out.y = (evt.pageY - canvasRect.nomangle(top)) / canvasRect.height * can.height;
}
