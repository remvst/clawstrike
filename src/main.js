onload = () => {
    can = document.querySelector('canvas');
    can.width = 1600;
    can.height = 900;

    ctx = can.getContext('2d');

    onresize();

    G = new Game();
}
