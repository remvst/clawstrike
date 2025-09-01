for (const funcName in canvasPrototype) {
    window[funcName] = (...args) => ctx[funcName].apply(ctx, args);
}
