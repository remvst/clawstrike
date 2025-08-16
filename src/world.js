class World {
    constructor() {
        this.entities = [];
        this.categories = new Map();
    }

    cycle(elapsed) {
        for (const entity of this.entities) {
            entity.cycle(elapsed);
        }
    }

    render() {
        ctx.wrap(() => {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, can.width, can.height);

            for (const entity of this.entities) {
                ctx.wrap(() => entity.render());
            }
        });
    }

    addEntity(entity) {
        entity.world = this;
        this.entities.push(entity);

        for (const categoryId of entity.categories) {
            const category = this.categories.get(categoryId);
            if (!category) {
                this.categories.set(categoryId, new Set([entity]));
            } else {
                category.add(entity);
            }
        }
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }

        for (const category of entity.categories) {
            this.categories.get(category)?.delete(entity);
        }
    }

    category(categoryId) {
        return this.categories.get(categoryId) || [];
    }
}
