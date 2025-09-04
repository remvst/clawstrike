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

        const cellX = ~~(4 * out.x / can.width);
        const cellY = ~~((can.height - out.y) / 250);
        downKeys[37] ||= cellX == 0;
        downKeys[39] ||= cellX == 1;
        downKeys[40] ||= cellX == 2;
        downKeys[38] ||= cellX == 3 && cellY == 0;
        downKeys[32] ||= cellX == 3 && cellY == 1;
        downKeys[69] ||= cellX == 3 && cellY == 2;
    }

    TOUCH_DOWN = touches.length > 0;
};

getEventPosition = (evt, can, out) => {
    if (!can) return;
    const canvasRect = can.getBoundingClientRect();
    out.x = (evt.pageX - canvasRect.nomangle(left)) / canvasRect.width * can.width;
    out.y = (evt.pageY - canvasRect.nomangle(top)) / canvasRect.height * can.height;
}
