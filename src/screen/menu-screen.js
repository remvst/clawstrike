class MenuScreen extends Screen {
    renderTitle(text) {
        ctx.wrap(() => {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 160px Impact';
            ctx.strokeStyle = '#000';
            ctx.miterLimit = 2;
            ctx.lineWidth = 20;
            ctx.strokeText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
            ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
        });
    }
}
