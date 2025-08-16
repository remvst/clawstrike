onresize = () => {
    let windowWidth = innerWidth,
        windowHeight = innerHeight,

        availableRatio = windowWidth / windowHeight, // available ratio
        canvasRatio = CANVAS_WIDTH / CANVAS_HEIGHT, // base ratio
        appliedWidth,
        appliedHeight,
        containerStyle = t.style;

    CANVAS_WIDTH = 1600;
    CANVAS_HEIGHT = 900;

    const expectedPixels = CANVAS_WIDTH * CANVAS_HEIGHT;

    if (inputMode === INPUT_MODE_TOUCH) {
        // Flip the aspect ratio if in portrait
        if (windowWidth > windowHeight) {
            const tmpWidth = CANVAS_WIDTH;
            CANVAS_WIDTH = CANVAS_HEIGHT
            CANVAS_HEIGHT = tmpWidth;
        }

        // Adjust the ratio so we fill the screen
        const currentAspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
        if (currentAspectRatio < availableRatio) {
            CANVAS_HEIGHT = CANVAS_WIDTH / availableRatio;
        } else {
            CANVAS_WIDTH = CANVAS_HEIGHT * availableRatio;
        }

        // Hack so we have enough pixels that we aren't zoomed in too much
        while (CANVAS_WIDTH * CANVAS_HEIGHT / expectedPixels < 0.5) {
            CANVAS_WIDTH *= 2;
            CANVAS_HEIGHT *= 2;
        }
    } else {
        // Desktop mode, keep the aspect ratio intact
        if (availableRatio <= canvasRatio) {
            appliedWidth = windowWidth;
            appliedHeight = appliedWidth / canvasRatio;
        } else {
            appliedHeight = windowHeight;
            appliedWidth = appliedHeight * canvasRatio;
        }
    }

    can.width = CANVAS_WIDTH;
    can.height = CANVAS_HEIGHT;

    containerStyle.width = appliedWidth + 'px';
    containerStyle.height = appliedHeight + 'px';
};
