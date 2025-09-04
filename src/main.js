onload = () => {
    can = nomangle(g);
    ctx = can.getContext('2d');

    onresize();

    G = new Game();
}
