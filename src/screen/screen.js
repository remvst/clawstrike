class Screen {
    age = 0;
    commands = [];
    songVolume = 1;

    constructor() {
        if (DEBUG) {
            this.debugValues = () => ([]);
        }
    }

    addCommand(label, detect, action, playSound = true) {
        this.commands.push({ label, detect, action, playSound });
    }

    addDifficultyChangeCommand() {
        this.addCommand(
            () => nomangle('PRESS [K] TO SET DIFFICULTY ') + '(' + G.difficulty.label + ')',
            () => downKeys[75],
            () => {
                const currentIndex = DIFFICULTIES.indexOf(G.difficulty);
                if (currentIndex >= 0) G.difficulty = DIFFICULTIES[(currentIndex + 1) % DIFFICULTIES.length];
            }
        );
    }

    addMainMenuCommand() {
        this.addCommand(
            nomangle('PRESS [M] TO RETURN TO MAIN MENU'),
            () => downKeys[77],
            () => G.startNavigation(),
        );
    }

    pop() {
        const index = G.screens.indexOf(this);
        if (index >= 0) G.screens.splice(index, 9);
    }

    resolve() {
        const { resolvers } = this;
        if (!resolvers) return;
        this.resolvers = null;
        this.pop();
        resolvers.resolve();
    }

    reject(popScreen) {
        const { resolvers } = this;
        if (!resolvers) return;
        this.resolvers = null;
        if (popScreen) this.pop();
        resolvers.reject();
    }

    awaitCompletion() {
        return new Promise((resolve, reject) => {
            this.resolvers = { resolve, reject };
        });
    }

    cycle(elapsed) {
        this.age += elapsed;

        if (Object.values(downKeys).filter(x => x).length == 0 && !TOUCH_DOWN) {
            this.releasedCommand = true;
        }

        if (this.releasedCommand && this.isForeground()) {
            for (const { detect, action, playSound } of this.commands) {
                if (detect?.()) {
                    if (playSound) zzfx(...[.5,,500,,.02,.14,,3.2,,,325,.05,.03,,,,,.79,.04,,-1129]); // Pickup 819
                    this.releasedCommand = false;
                    action();
                }
            }
        }

        if (this.isForeground()) {
            setSongVolume(this.songVolume * (document.hasFocus() ? 1 : 0));
        }
    }

    render() {

    }

    isForeground() {
        return G?.screens?.[G.screens.length - 1] === this;
    }
}

class TransitionScreen extends Screen {

    constructor(from, to) {
        super();
        this.from = from;
        this.to = to;
    }

    get progress() {
        return this.age / 0.2;
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (this.progress >= 1) {
            this.resolve();
        }
    }

    render() {
        ctx.translate(interpolate(this.from, this.to, this.progress) * (CANVAS_WIDTH + 200), 0);

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.fillRect(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 20, 20);
        ctx.moveTo(0, 0);
        ctx.lineTo(CANVAS_WIDTH + 200, 0);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.lineTo(-200, CANVAS_HEIGHT);
        ctx.fill();
    }
}
