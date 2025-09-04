class World {

    entities = [];
    categories = {};

    cycle(elapsed) {
        for (const entity of this.entities.slice()) {
            if (DEBUG && this.editorMode && entity.type) continue;
            entity.cycle(elapsed);
        }
    }

    render() {
        this.entities.sort((a, b) => a.z - b.z);

        ctx.wrap(() => {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, can.width, can.height);

            const camera = firstItem(this.category('camera'));
            ctx.scale(camera.zoom, camera.zoom);
            ctx.translate(
                CANVAS_WIDTH / 2 / camera.zoom - camera.actual.x,
                CANVAS_HEIGHT / 2 / camera.zoom - camera.actual.y,
            );

            for (const entity of this.entities) {
                ctx.wrap(() => entity.renderBackground());
            }

            for (const entity of this.entities) {
                ctx.wrap(() => entity.render());
            }

            if (DEBUG) {
                for (const entity of this.entities) {
                    ctx.wrap(() => entity.renderDebug());
                }
            }
        });
    }

    addEntity(entity) {
        entity.world = this;
        this.entities.push(entity);

        for (const categoryId of entity.categories) {
            this.categories[categoryId] ||= new Set();
            this.categories[categoryId].add(entity);
        }

        return entity;
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index >= 0) {
            this.entities.splice(index, 1);
        }

        for (const category of entity.categories) {
            this.categories[category]?.delete(entity);
        }
    }

    category(categoryId) {
        return this.categories[categoryId] || new Set();
    }
}
