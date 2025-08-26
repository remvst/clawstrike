canvasPrototype.drawCommandText = function(text) {
    const colorStack = [this.fillStyle];
    this.wrap(() => {
        const chars = text.split('');

        if (this.textAlign == nomangle('center')) {
            this.translate(-ctx.measureText(text).width / 2, 0);
            this.textAlign = nomangle('left');
        }

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
