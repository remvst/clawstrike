canvasPrototype.drawCommandText = function(text) {
    const colorStack = [this.fillStyle];
    this.wrap(() => {
        const chars = text.split('');

        ctx.miterLimit = 2;

        const { width } = ctx.measureText(text);
        if (this.textAlign == nomangle('center')) {
            this.translate(-width / 2, 0);
        } else if (this.textAlign == nomangle('right')) {
            this.translate(-width, 0);
        }

        this.textAlign = nomangle('left');

        for (const char of chars) {
            if (char == '[') colorStack.push('#f00');
            if (char == '(') colorStack.push('#0ff');
            this.fillStyle = colorStack[colorStack.length - 1];
            this.strokeText(char, 0, 0);
            this.fillText(char, 0, 0);
            this.translate(this.measureText(char).width, 0);
            if (char == ']' || char == ')') colorStack.pop();
        }
    });
}
