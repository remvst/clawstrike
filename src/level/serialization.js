DESERIALIZE_MAP = {};
for (const type of [
    Structure,
    Cat,
    Human,
    Spikes,
    Label,
    Water,
]) {
    DESERIALIZE_MAP[(new type()).type] = type;
}

const serializedProperties = ['type', 'x', 'y', 'angle', 'matrix', 'length', 'text', 'color', 'depth'];

if (DEBUG) {
    serializeEntity = (entity) => {
        if (!entity.type) return null;

        const out = {};
        for (const key of serializedProperties) {
            if (key in entity) out[key] = entity[key];
        }
        return out;
    }
}

deserializeEntity = (levelData) => {
    const entity = new (DESERIALIZE_MAP[levelData.type])();
    for (const key in levelData) {
        entity[key] = levelData[key];
    }
    return entity;
};

if (DEBUG) {
    serializeWorld = (world) => {
        const out = [];
        for (const entity of world.entities) {
            const serializedEntity = serializeEntity(entity);
            if (serializedEntity) out.push(serializedEntity);
        }
        return out;
    }
}

deserializeWorld = (levelData) => {
    const world = new World();
    for (const obj of levelData) {
        world.addEntity(deserializeEntity(obj));
    }
    return world;
}
