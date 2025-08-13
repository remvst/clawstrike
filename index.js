let canvas;
let ctx;

onload = () => {
    console.log('onload');

    canvas = document.querySelector('canvas');
    canvas.width = 1600;
    canvas.height = 900;

    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
