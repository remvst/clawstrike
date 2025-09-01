onload = () => {
    can = document.querySelector('canvas');
    ctx = can.getContext('2d');

    onresize();

    G = new Game();
}
