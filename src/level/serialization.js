const serializableTypes = [
    Structure,
    Cat,
    Human,
    Spikes,
];

const deserializeMap = {};
for (const type of serializableTypes) {
    const dummy = new type();
    deserializeMap[dummy.type] = type;
}

const serializedProperties = ['type', 'x', 'y', 'angle', 'matrix', 'length'];

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

deserializeEntity = (data) => {
    const type = deserializeMap[data.type];
    const entity = new type();
    for (const key of serializedProperties) {
        entity[key] = data[key];
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

deserializeWorld = (data) => {
    const world = new World();
    for (const obj of data) {
        const entity = deserializeEntity(obj);
        world.addEntity(entity);
    }
    return world;
}
