class Entity {
    constructor() {
        this.x = this.y = this.previousX = this.previousY = this.age = 0;
        this.categories = [];
        this.seed = Math.random();
    }

    cycle(elapsed) {
        this.age += elapsed;

        this.previousX = this.x;
        this.previousY = this.y;
    }

    render() {

    }
}
