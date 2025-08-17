createCanvas = (w, h, render) => {
    const can = document.createElement('canvas');
    can.width = w;
    can.height = h;

    const ctx = can.getContext('2d');

    return render(ctx, can) || can;
};
