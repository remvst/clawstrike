canvasPrototype.wrap = function(f) {
    this.save();
    f();
    this.restore();
};
