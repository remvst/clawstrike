class Chunk {
    constructor(matrix, connections) {
        this.matrix = matrix;
        this.connections = connections;
    }

    possibleConnections(otherChunk) {
        return this.connections
            .map(c => oppositeConnection(c))
            .filter(c => otherChunk.connections.includes(c));
    }
}
