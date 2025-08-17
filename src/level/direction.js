const CONNECTION_UP = 'up';
const CONNECTION_DOWN = 'down';
const CONNECTION_RIGHT = 'right';
const CONNECTION_LEFT = 'left';

function oppositeConnection(connection) {
    switch (connection) {
        case CONNECTION_UP: return CONNECTION_DOWN;
        case CONNECTION_DOWN: return CONNECTION_UP;
        case CONNECTION_RIGHT: return CONNECTION_LEFT;
        case CONNECTION_LEFT: return CONNECTION_RIGHT;
    }
}
