class Entity {
    constructor() {
        this.x = this.y = this.previousX = this.previousY = this.age = 0;
        this.categories = [];
        this.seed = Math.random();

        this.cachedHitbox = new Rect();
    }

    get hitbox() {
        this.cachedHitbox.x = this.x;
        this.cachedHitbox.y = this.y;
        return this.cachedHitbox;
    }

    cycle(elapsed) {
        this.age += elapsed;

        this.previousX = this.x;
        this.previousY = this.y;
    }

    render() {

    }

    renderDebug() {
        if (DEBUG && DEBUG_HITBOXES) this.hitbox.render();
    }
}
